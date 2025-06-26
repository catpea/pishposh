export class EventEmitter {
  events;
  constructor() {
    this.events = new Map();
  }
  on(event, subscriber) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(subscriber);
    return () => this.off(event, subscriber);
  }
  off(event, subscriber) {
    this.events.get(event).delete(subscriber);
  }
  emit(event, data) {
    const subscribers = this.events.get(event) ?? new Set();
    for (const subscriber of subscribers) {
      subscriber(data);
    }
  }
  terminate() {
    this.events.forEach((subscribers) => subscribers.clear());
    this.events.clear();
  }
}

class StreamEmitter extends EventEmitter {
  name = "StreamEmitter";
  source; // source emitter

  constructor() {
    super();
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
    this.path.forEach(fragment.terminate());
    super.terminate();
  }
}

export class ReactiveEmitter extends StreamEmitter {

  name = "ReactiveEmitter";

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

}

export class Signal {
  name = "Signal";
  #id;
  #value;
  #test;
  #subscribers;

  // NOTE: Re: test=v=>!v==undefined... null and undefined are considered equal when using the loose equality operator

  constructor(value, test = (v) => !v == undefined) {
    this.#value = value;
    this.#test = test;
    this.#subscribers = new Set();
  }
  get id() {
    if (!this.#id) this.#id = this.sid();
    return this.#id;
  }

  get value() {
    return this.#value;
  }

  set value(newValue) {
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

  static sid() { // Generate Signal ID
    const length = 12;
    const chars = "abcdefghijklmnopqrstuvwxyz";
    return [...Array(length)].map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
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

}

// Object Stream Operators

function iterate(source) {
  const result = new ReactiveEmitter();
  result.name = "iterate";
  result.source = source;

  source.subscribe((array) => {
    array.forEach((item) => result.emitValue(item));
  });
  return result;
}

function map(source, predicate) {
  const result = new ReactiveEmitter();
  result.name = "filter";
  result.source = source;

  source.subscribe((value) => {
    result.emitValue(predicate(value));
  });

  return result;
}

function filter(source, predicate) {
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

function debounce(source, ms) {
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
function distinctUntilChanged(source, compareFn = (a, b) => a === b) {
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

function scan(source, accumulator, seed) {
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

function delay(source, ms) {
  const result = new ReactiveEmitter();
  result.name = "delay";
  result.source = source;

  source.subscribe((value) => {
    setTimeout(() => result.emitValue(value), ms);
  });

  return result;
}

function throttle(source, ms) {
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

function withLatestFrom(source, other) {
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

function merge(...emitters) {
  const result = new ReactiveEmitter();
  result.name = "merge";
  result.source = source;

  emitters.forEach((emitter) => {
    emitter.subscribe((value) => result.emitValue(value));
  });

  return result;
}
