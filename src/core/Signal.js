export function rid() { // Generate ID
  const specs = [[3,'abcdefghijklmnopqrstuvwxyz'],[6, 'abcdefghijklmnopqrstuvwxyz0123456789']]
  return specs.map(([length,chars])=>[...Array(length)].map(() => chars[Math.floor(Math.random() * chars.length)]).join("")).join('');
}

export class EventSourcing {

  eventNames;
  eventLog;
  snapshots;
  snapshotInterval;
  lastSnapshotIndex;

  constructor(options = {}) {
    this.eventNames = new Map();
    this.eventLog = [];
    this.snapshots = [];
    this.snapshotInterval = options.snapshotInterval || 100;
    this.lastSnapshotIndex = 0;
    this.persistence = options.persistence || null;
    this.maxLogSize = options.maxLogSize || Infinity;
    this.sequenceNumber = 0;

    // Load persisted events if persistence is enabled
    if (this.persistence) {
      this.loadEvents();
    }
  }

  on(event, subscriber) {
    if (!this.eventNames.has(event)) {
      this.eventNames.set(event, new Set());
    }
    this.eventNames.get(event).add(subscriber);
    return () => this.off(event, subscriber);
  }

  off(event, subscriber) {
    this.eventNames.get(event)?.delete(subscriber);
  }

  emit(event, data, options = {}) {
    const timestamp = new Date().toISOString();
    const eventEntry = {
      id: this.generateEventId(),
      sequence: ++this.sequenceNumber,
      event,
      data,
      timestamp,
      metadata: options.metadata || {},
      version: options.version || 1
    };

    // Add to event log
    this.eventLog.push(eventEntry);

    // Persist event if persistence is enabled
    if (this.persistence && !options.skipPersistence) {
      this.persistEvent(eventEntry);
    }

    // Emit to current subscribers (live projection)
    if (!options.skipEmit) {
      const subscribers = this.eventNames.get(event) ?? new Set();
      for (const subscriber of subscribers) {
        try {
          subscriber(data, eventEntry);
        } catch (error) {
          console.error(`Error in event subscriber for ${event}:`, error);
        }
      }
    }

    // Create snapshot if needed
    if (this.shouldCreateSnapshot()) {
      this.createSnapshot();
    }

    // Trim log if it exceeds max size
    if (this.eventLog.length > this.maxLogSize) {
      this.trimEventLog();
    }

    return eventEntry.id;
  }

  // Event Sourcing Core Methods

  replay(fromSequence = 0, toSequence = Infinity) {
    const events = this.getEventsBySequenceRange(fromSequence, toSequence);

    for (const eventEntry of events) {
      const subscribers = this.eventNames.get(eventEntry.event) ?? new Set();
      for (const subscriber of subscribers) {
        try {
          subscriber(eventEntry.data, eventEntry);
        } catch (error) {
          console.error(`Error during replay for ${eventEntry.event}:`, error);
        }
      }
    }

    return events.length;
  }

  replayFromSnapshot(snapshotIndex = -1) {
    const snapshot = snapshotIndex === -1
      ? this.getLatestSnapshot()
      : this.snapshots[snapshotIndex];

    if (!snapshot) {
      return this.replay();
    }

    // Restore state from snapshot if it has state data
    if (snapshot.state) {
      this.restoreFromSnapshot(snapshot);
    }

    // Replay events after the snapshot
    return this.replay(snapshot.lastSequence + 1);
  }

  // Query Methods

  getEvents(filter = {}) {
    let events = [...this.eventLog];

    if (filter.event) {
      events = events.filter(e => e.event === filter.event);
    }

    if (filter.fromTimestamp) {
      events = events.filter(e => new Date(e.timestamp) >= new Date(filter.fromTimestamp));
    }

    if (filter.toTimestamp) {
      events = events.filter(e => new Date(e.timestamp) <= new Date(filter.toTimestamp));
    }

    if (filter.fromSequence !== undefined) {
      events = events.filter(e => e.sequence >= filter.fromSequence);
    }

    if (filter.toSequence !== undefined) {
      events = events.filter(e => e.sequence <= filter.toSequence);
    }

    if (filter.metadata) {
      events = events.filter(e => {
        return Object.entries(filter.metadata).every(([key, value]) =>
          e.metadata[key] === value
        );
      });
    }

    if (filter.limit) {
      events = events.slice(0, filter.limit);
    }

    return events;
  }

  getEventsBySequenceRange(from, to) {
    return this.eventLog.filter(e => e.sequence >= from && e.sequence <= to);
  }

  getEventsByTimeRange(fromTimestamp, toTimestamp) {
    const from = new Date(fromTimestamp);
    const to = new Date(toTimestamp);
    return this.eventLog.filter(e => {
      const eventTime = new Date(e.timestamp);
      return eventTime >= from && eventTime <= to;
    });
  }

  getLastEvent(eventType) {
    for (let i = this.eventLog.length - 1; i >= 0; i--) {
      if (!eventType || this.eventLog[i].event === eventType) {
        return this.eventLog[i];
      }
    }
    return null;
  }

  // Projection Methods

  project(projectionFn, filter = {}) {
    const events = this.getEvents(filter);
    let state = {};

    for (const event of events) {
      state = projectionFn(state, event);
    }

    return state;
  }

  projectFromSnapshot(projectionFn, snapshotIndex = -1) {
    const snapshot = snapshotIndex === -1
      ? this.getLatestSnapshot()
      : this.snapshots[snapshotIndex];

    let state = snapshot?.projectionState || {};
    const fromSequence = snapshot ? snapshot.lastSequence + 1 : 0;

    const events = this.getEventsBySequenceRange(fromSequence, Infinity);

    for (const event of events) {
      state = projectionFn(state, event);
    }

    return state;
  }

  // Snapshot Methods

  createSnapshot(customState = null, options = {}) {
    const snapshot = {
      id: this.generateSnapshotId(),
      timestamp: new Date().toISOString(),
      lastSequence: this.sequenceNumber,
      eventCount: this.eventLog.length,
      state: customState,
      projectionState: null
    };

    this.snapshots.push(snapshot);
    this.lastSnapshotIndex = this.eventLog.length;

    if (this.persistence) {
      this.persistSnapshot(snapshot);
    }

    // Clear event log if requested
    if (options.clearLog) {
      this.clearEventLog(options.keepEvents || 0);
    }

    return snapshot;
  }

  clearEventLog(keepRecentCount = 0) {
    if (keepRecentCount > 0) {
      this.eventLog = this.eventLog.slice(-keepRecentCount);
    } else {
      this.eventLog = [];
    }

    // Update last snapshot index
    this.lastSnapshotIndex = this.eventLog.length;

    if (this.persistence) {
      this.persistence.clearEvents?.(keepRecentCount);
    }

    return this.eventLog.length;
  }

  createSnapshotAndClear(customState = null, keepRecentEvents = 0) {
    const snapshot = this.createSnapshot(customState, {
      clearLog: true,
      keepEvents: keepRecentEvents
    });

    return {
      snapshot,
      eventsCleared: snapshot.eventCount - this.eventLog.length,
      eventsKept: this.eventLog.length
    };
  }

  shouldCreateSnapshot() {
    return this.eventLog.length - this.lastSnapshotIndex >= this.snapshotInterval;
  }

  getLatestSnapshot() {
    return this.snapshots[this.snapshots.length - 1] || null;
  }

  restoreFromSnapshot(snapshot) {
    // Override this method in subclasses to restore specific state
    if (snapshot.state && typeof snapshot.state === 'object') {
      Object.assign(this, snapshot.state);
    }
  }

  // Persistence Methods

  async loadEvents() {
    if (!this.persistence) return;

    try {
      const data = await this.persistence.load();
      if (data.events) {
        this.eventLog = data.events;
        this.sequenceNumber = Math.max(...this.eventLog.map(e => e.sequence), 0);
      }
      if (data.snapshots) {
        this.snapshots = data.snapshots;
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  }

  async persistEvent(event) {
    if (!this.persistence) return;

    try {
      await this.persistence.saveEvent(event);
    } catch (error) {
      console.error('Failed to persist event:', error);
    }
  }

  async persistSnapshot(snapshot) {
    if (!this.persistence) return;

    try {
      await this.persistence.saveSnapshot(snapshot);
    } catch (error) {
      console.error('Failed to persist snapshot:', error);
    }
  }

  async saveAll() {
    if (!this.persistence) return;

    try {
      await this.persistence.saveAll({
        events: this.eventLog,
        snapshots: this.snapshots
      });
    } catch (error) {
      console.error('Failed to save all data:', error);
    }
  }

  // Utility Methods

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSnapshotId() {
    return `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trimEventLog() {
    const latestSnapshot = this.getLatestSnapshot();
    if (latestSnapshot) {
      // Keep events after the latest snapshot
      const keepFromIndex = this.eventLog.findIndex(e => e.sequence > latestSnapshot.lastSequence);
      if (keepFromIndex > 0) {
        this.eventLog = this.eventLog.slice(keepFromIndex);
      }
    } else {
      // No snapshots, keep only the most recent events
      const keepCount = Math.floor(this.maxLogSize * 0.8);
      this.eventLog = this.eventLog.slice(-keepCount);
    }
  }

  // Statistics and Monitoring

  getStats() {
    const eventTypes = new Map();
    this.eventLog.forEach(e => {
      eventTypes.set(e.event, (eventTypes.get(e.event) || 0) + 1);
    });

    return {
      totalEvents: this.eventLog.length,
      currentSequence: this.sequenceNumber,
      eventTypes: Object.fromEntries(eventTypes),
      subscriberCount: Array.from(this.eventNames.values()).reduce((sum, set) => sum + set.size, 0),
      snapshotCount: this.snapshots.length,
      lastEventTimestamp: this.eventLog.length > 0 ? this.eventLog[this.eventLog.length - 1].timestamp : null,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  estimateMemoryUsage() {
    const eventSize = JSON.stringify(this.eventLog).length;
    const snapshotSize = JSON.stringify(this.snapshots).length;
    return {
      events: `${Math.round(eventSize / 1024)}KB`,
      snapshots: `${Math.round(snapshotSize / 1024)}KB`,
      total: `${Math.round((eventSize + snapshotSize) / 1024)}KB`
    };
  }

  // Advanced Features

  createProjection(name, projectionFn, options = {}) {
    const projection = {
      name,
      fn: projectionFn,
      state: options.initialState || {},
      lastProcessedSequence: 0,
      ...options
    };

    // Process existing events
    const events = this.eventLog.filter(e => e.sequence > projection.lastProcessedSequence);
    for (const event of events) {
      projection.state = projectionFn(projection.state, event);
      projection.lastProcessedSequence = event.sequence;
    }

    // Subscribe to new events
    this.on('*', (data, event) => {
      if (event.sequence > projection.lastProcessedSequence) {
        projection.state = projectionFn(projection.state, event);
        projection.lastProcessedSequence = event.sequence;
      }
    });

    return projection;
  }

  // Batch operations

  emitBatch(events, options = {}) {
    const results = [];
    const batchId = this.generateEventId();

    for (const { event, data, metadata = {} } of events) {
      const eventId = this.emit(event, data, {
        ...options,
        metadata: { ...metadata, batchId }
      });
      results.push(eventId);
    }

    return results;
  }

  terminate() {
    // Save all data before terminating
    if (this.persistence) {
      this.saveAll();
    }

    this.eventNames.forEach((subscribers) => subscribers.clear());
    this.eventNames.clear();
    this.eventLog = [];
    this.snapshots = [];
  }
}




class EventSourcingStream extends EventSourcing {
  name = "StreamSource";
  source; // source emitter
  constructor(...argv) {
    super(...argv);
    this.unsubscribe = new Set();
  }
  emitValue(value) {
    this.emit("value", value);
  }
  subscribe(subscriber) {
    this.on("value", (v) => subscriber(v, this));
    return () => this.off("value", subscriber);
  }
  get path() {
    const sources = [];
    const getNextItem = (node) => node.source;
    let next = this;
    while (next) {
      sources.unshift(next);
      next = getNextItem(next);
    }
    return sources;
  }
  terminate() {
    super.terminate();
    this.unsubscribe.forEach((subscriber) => subscriber());
    this.unsubscribe.clear();
    this.path.forEach(fragment.terminate());
  }
}





// Simple in-memory persistence adapter example
export class EventSourcingMemoryPersistence {
 constructor() {
    this.data = { events: [], snapshots: [] };
  }

  async load() {
    return { ...this.data };
  }

  async saveEvent(event) {
    this.data.events.push(event);
  }

  async saveSnapshot(snapshot) {
    this.data.snapshots.push(snapshot);
  }

  async saveAll(data) {
    this.data = { ...data };
  }

  async clearEvents(keepRecentCount) {
    this.data.events = keepRecentCount > 0
      ? this.data.events.slice(-keepRecentCount)
      : [];
  }
}

// LocalStorage persistence adapter example
export class EventSourcingLocalStoragePersistence {
  constructor(key = 'event_store') {
    this.key = key;
  }

  async load() {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : { events: [], snapshots: [] };
  }

  async saveEvent(event) {
    const data = await this.load();
    data.events.push(event);
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  async saveSnapshot(snapshot) {
    const data = await this.load();
    data.snapshots.push(snapshot);
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  async saveAll(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  async clearEvents(keepRecentCount) {
    const data = await this.load();
    data.events = keepRecentCount > 0
      ? data.events.slice(-keepRecentCount)
      : [];
    localStorage.setItem(this.key, JSON.stringify(data));
  }
}



export class ReactiveEventSourcingStream extends EventSourcingStream {

  name = "EventSourcingEngine";

  fromEvent(...argv) {
    return fromEvent(this, ...argv);
  }

  iterate(...argv) {
    return iterate(this, ...argv);
  }

  map(...argv) {
    return map(this, ...argv);
  }

  filter(...argv) {
    return filter(this, ...argv);
  }

  debounce(...argv) {
    return debounce(this, ...argv);
  }

  distinctUntilChanged(...argv) {
    return distinctUntilChanged(this, ...argv);
  }

  scan(...argv) {
    return scan(this, ...argv);
  }

  delay(...argv) {
    return delay(this, ...argv);
  }

  throttle(...argv) {
    return throttle(this, ...argv);
  }

  withLatestFrom(...argv) {
    return withLatestFrom(this, ...argv);
  }

  merge(...argv) {
    return merge(this, ...argv);
  }

  log(...argv) {
    return log(this, ...argv);
  }

}

export class EventEmitter {
  eventNames;

  constructor() {
    this.eventNames = new Map();
    this.eventLog = new Set();
  }

  on(event, subscriber) {
    if (!this.eventNames.has(event)) {
      this.eventNames.set(event, new Set());
    }
    this.eventNames.get(event).add(subscriber);
    return () => this.off(event, subscriber);
  }

  off(event, subscriber) {
    this.eventNames.get(event).delete(subscriber);
  }

  emit(event, data) {

    const subscribers = this.eventNames.get(event) ?? new Set();
    for (const subscriber of subscribers) {
      subscriber(data);
    }

  }

  terminate() {
    this.eventNames.forEach((subscribers) => subscribers.clear());
    this.eventNames.clear();
  }

}

class StreamEmitter extends EventEmitter {
  name = "StreamEmitter";
  source; // source emitter

  // SIGNAL INTEGRATION - Makes StreamEmitter behave a little bit like a signal
  replayLast = false;
  lastValue = null;
  lastValueTest = (v)=>v!==null;

  constructor() {
    super();
    this.unsubscribe = new Set();

  }

  emitValue(value) {
    if(this.replayLast) this.lastValue = value;

    this.emit("value", value);
  }
  subscribe(subscriber) {

    // SIGNAL INTEGRATION
    if(this.replayLast && this.lastValueTest(this.lastValue)) subscriber(this.lastValue)

    this.on("value", (v) => subscriber(v, this));
    return () => this.off("value", subscriber);
  }

  get path() {
    const sources = [];
    const getNextItem = (node) => node.source;
    let next = this;
    while (next) {
      sources.unshift(next);
      next = getNextItem(next);
    }
    return sources;
  }

  terminate() {
    super.terminate();
    this.unsubscribe.forEach((subscriber) => subscriber());
    this.unsubscribe.clear();

    this.path.forEach(fragment.terminate());
    super.terminate();
  }
}

export class ReactiveEmitter extends StreamEmitter {

  name = "ReactiveEmitter";

  fromEvent(...argv) {
    return fromEvent(this, ...argv);
  }

  iterate(...argv) {
    return iterate(this, ...argv);
  }

  map(...argv) {
    return map(this, ...argv);
  }

  filter(...argv) {
    return filter(this, ...argv);
  }

  debounce(...argv) {
    return debounce(this, ...argv);
  }

  distinctUntilChanged(...argv) {
    return distinctUntilChanged(this, ...argv);
  }

  scan(...argv) {
    return scan(this, ...argv);
  }

  delay(...argv) {
    return delay(this, ...argv);
  }

  throttle(...argv) {
    return throttle(this, ...argv);
  }

  withLatestFrom(...argv) {
    return withLatestFrom(this, ...argv);
  }

  merge(...argv) {
    return merge(this, ...argv);
  }

  log(...argv) {
    return log(this, ...argv);
  }

}

export class Signal {
  name = "Signal";
  #id;
  #value;
  #test;
  #same;
  #subscribers;

  // NOTE: Re: test=v=>!v==undefined... null and undefined are considered equal when using the loose equality operator

  constructor(value, same = (a,b) => a==b, test = (v) => v !== undefined) {
    this.#value = value;
    this.#test = test;
    this.#same = same;
    this.#subscribers = new Set();
  }

  get(){
    return this.value;
  }
  set(v){
    this.value = v;
  }

  get id() {
    if (!this.#id) this.#id = rid();
    return this.#id;
  }

  get value() {
    return this.#value;
  }

  set value(newValue) {
    if (this.#same(this.#value, newValue)) return;
    this.#value = newValue;
    this.notify();
  }

  subscribe(subscriber) {
    if (this.#test(this.#value)) subscriber(this.#value);
    this.#subscribers.add(subscriber);
    return () => this.#subscribers.delete(subscriber);
  }

  notify() {
    for (const subscriber of this.#subscribers) subscriber(this.#value);
  }

}

export class ReactiveSignal extends Signal {
  name = "ReactiveSignal";

  iterate(...argv) {
    return iterate(this, ...argv);
  }

  map(...argv) {
    return map(this, ...argv);
  }

  filter(...argv) {
    return filter(this, ...argv);
  }

  debounce(...argv) {
    return debounce(this, ...argv);
  }

  distinctUntilChanged(...argv) {
    return distinctUntilChanged(this, ...argv);
  }

  scan(...argv) {
    return scan(this, ...argv);
  }

  delay(...argv) {
    return delay(this, ...argv);
  }

  throttle(...argv) {
    return throttle(this, ...argv);
  }

  withLatestFrom(...argv) {
    return withLatestFrom(this, ...argv);
  }

  merge(...argv) {
    return merge(this, ...argv);
  }

  log(...argv) {
    return log(this, ...argv);
  }

}

// Object Stream Operators

export function iterate(source) {
  const result = new ReactiveEmitter();
  result.name = "iterate";
  result.source = source;

  source.subscribe((array) => {
    array.forEach((item) => result.emitValue(item));
  });
  return result;
}

export function map(source, predicate) {
  const result = new ReactiveEmitter();
  result.name = "filter";
  result.source = source;

  source.subscribe((value) => {
    result.emitValue(predicate(value));
  });

  return result;
}

export function filter(source, predicate) {
  const result = new ReactiveEmitter();
  result.name = "filter";
  result.source = source;

  source.subscribe((value) => {
    if (predicate(value)) {
      result.emitValue(value);
    }
  });

  return result;
}

export function debounce(source, ms) {
  const result = new ReactiveEmitter();
  result.name = "debounce";
  result.source = source;

  let timeout;

  source.subscribe((value) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      result.emitValue(value);
    }, ms);
  });

  return result;
}

// Distinct filters out all duplicate values from an observable sequence, while distinctUntilChanged only removes consecutive duplicates, allowing the first occurrence of each value to pass through. This means distinctUntilChanged is useful for preventing repeated emissions of the same value in a row.
export function distinctUntilChanged(source, compareFn = (a, b) => a === b) {
  const result = new ReactiveEmitter();
  result.name = "distinctUntilChanged";
  result.source = source;

  let last;

  source.subscribe((value) => {
    if (last === undefined || !compareFn(value, last)) {
      last = value;
      result.emitValue(value);
    }
  });

  return result;
}

export function scan(source, accumulator, seed) {
  const result = new ReactiveEmitter();
  result.name = "scan";
  result.source = source;

  let acc = seed;

  source.subscribe((value) => {
    acc = accumulator(acc, value);
    result.emitValue(acc);
  });

  return result;
}

export function delay(source, ms) {
  const result = new ReactiveEmitter();
  result.name = "delay";
  result.source = source;

  source.subscribe((value) => {
    setTimeout(() => result.emitValue(value), ms);
  });

  return result;
}

export function throttle(source, ms) {
  const result = new ReactiveEmitter();
  result.name = "throttle";
  result.source = source;

  let lastTime = 0;

  source.subscribe((value) => {
    const now = Date.now();
    if (now - lastTime >= ms) {
      lastTime = now;
      result.emitValue(value);
    }
  });

  return result;
}

export function withLatestFrom(source, other) {
  const result = new ReactiveEmitter();
  result.name = "withLatestFrom";
  result.source = source;

  let latestOther;

  other.subscribe((value) => {
    latestOther = value;
  });

  source.subscribe((value) => {
    if (latestOther !== undefined) {
      result.emitValue([value, latestOther]);
    }
  });

  return result;
}

export function log(source, fn) {
  const result = new ReactiveEmitter();
  result.name = "log";
  result.source = source;

  source.subscribe((value) => {
    console.log( fn(value));
    result.emitValue(value);
  });

  return result;
}

export function merge(...emitters) {
  const result = new ReactiveEmitter();
  result.name = "merge";
  result.source = source;

  emitters.forEach((emitter) => {
    emitter.subscribe((value) => result.emitValue(value));
  });

  return result;
}

// export function fromEvent(source, eventName) {
//   const result = new ReactiveEmitter();

//   result.name = "fromEvent";
//   result.source = source;

//   source.on(eventName, value => {
//     result.emitValue(value);
//   });

//   return result;

// }
export function fromEvent(source, eventName) {
  const result = new ReactiveEmitter();
  result.name = "fromEvent";
  result.source = source;

  // Create a function to handle the event
  const eventHandler = (value) => {
    console.log('eventName', value)
    result.emitValue(value);
  };

  // Check if the source is a DOM element or an event emitter
  // console.log('source instanceof EventTarget', eventName, source instanceof EventTarget)

  if (source instanceof EventTarget) {
    // For DOM events
    source.addEventListener(eventName, eventHandler);

    // Add the unsubscribe function to the Set
    result.unsubscribe.add(() => {
      source.removeEventListener(eventName, eventHandler);
    });

  } else {
    // For other event emitters
    source.on(eventName, eventHandler);

    // Add the unsubscribe function to the Set
    result.unsubscribe.add(() => {
      source.off(eventName, eventHandler); // Assuming there's an off method
    });
  }

  return result;
}




export function namedCombineLatest(namedSignals) {
  // console.log({namedSignals})
  const result = new ReactiveEmitter();
  result.replayLast = true;
  result.name = "watchNamed";

  const signalNames = Object.keys(namedSignals);
  // const emitters = Object.values(namedSignals);
  const values = new Array(signalNames.length);
  const hasValue = new Array(signalNames.length).fill(false);

  let completedCount = 0;

  Object.entries(namedSignals).forEach(([name, signal], index) => {

    signal.subscribe((value) => {

      values[index] = value;
      hasValue[index] = true;

      // Check if all emitters have emitted at least once
      //console.log('ZZZ hasValue.every(Boolean)', hasValue.every(Boolean), hasValue)
      if (hasValue.every(Boolean)) {

        const entries = new Array(signalNames.length);
        for( const [index, name] of signalNames.entries()){
          entries[index] = [name, values[index]];
        }
        const obj = Object.fromEntries(entries)
        //console.log('ZZZ REESDY>', obj)
        result.emitValue(obj); // Emit an array of values
      }
    }); // subscribe to emitter

  });

  return result;
}

// [x] iterate
// [x] map
// [x] filter
// [x] debounce
// [x] distinctUntilChanged
// [x] scan
// [x] delay
// [x] throttle
// [x] withLatestFrom
// [x] merge

// TODO, add these operators
