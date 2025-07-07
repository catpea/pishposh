import { EventEmitter } from 'events';

/**
 * CaptureAndProject - Event Sourcing inspired EventEmitter
 *
 * Industry standard terminology:
 * - Capture: Record events that match conditions
 * - Project: Transform/aggregate captured events into new events
 * - Replay: Re-emit captured events in sequence
 * - Commit: Persist captured events to the event store
 * - Snapshot: Create point-in-time state representation
 */
class CaptureAndProject extends EventEmitter {
  constructor() {
    super();
    this.eventStore = new Map(); // eventName -> captured events
    this.projections = new Map(); // projectionName -> projection function
    this.snapshots = new Map(); // snapshotId -> snapshot data
    this.captureFilters = new Map(); // eventName -> filter conditions
    this.sequenceNumber = 0;
  }

  /**
   * Capture events of a specific name that match a condition
   * @param {string} eventName - Name of events to capture
   * @param {Function} condition - Predicate function to test events
   * @param {Object} options - Capture options
   */
  capture(eventName, condition = () => true, options = {}) {
    const {
      maxEvents = Infinity,
      ttl = null, // Time to live in milliseconds
      deduplicate = false,
      deduplicationKey = null
    } = options;

    // Store capture configuration
    this.captureFilters.set(eventName, {
      condition,
      maxEvents,
      ttl,
      deduplicate,
      deduplicationKey
    });

    // Initialize event store for this event type
    if (!this.eventStore.has(eventName)) {
      this.eventStore.set(eventName, []);
    }

    // Set up event listener for capturing
    const captureHandler = (eventData) => {
      if (condition(eventData)) {
        this._captureEvent(eventName, eventData, options);
      }
    };

    this.on(eventName, captureHandler);

    // Return a capture handle for cleanup
    return {
      eventName,
      handler: captureHandler,
      stop: () => this.off(eventName, captureHandler)
    };
  }

  /**
   * Internal method to capture and store events
   */
  _captureEvent(eventName, eventData, options) {
    const store = this.eventStore.get(eventName);
    const filter = this.captureFilters.get(eventName);

    // Create event record with metadata
    const eventRecord = {
      eventName,
      eventData,
      sequenceNumber: ++this.sequenceNumber,
      timestamp: new Date(),
      capturedAt: Date.now()
    };

    // Handle deduplication
    if (filter.deduplicate && filter.deduplicationKey) {
      const key = typeof filter.deduplicationKey === 'function'
        ? filter.deduplicationKey(eventData)
        : eventData[filter.deduplicationKey];

      if (store.some(event => {
        const existingKey = typeof filter.deduplicationKey === 'function'
          ? filter.deduplicationKey(event.eventData)
          : event.eventData[filter.deduplicationKey];
        return existingKey === key;
      })) {
        return; // Skip duplicate
      }
    }

    // Add to store
    store.push(eventRecord);

    // Enforce max events limit
    if (store.length > filter.maxEvents) {
      store.shift(); // Remove oldest
    }

    // Clean up expired events if TTL is set
    if (filter.ttl) {
      const now = Date.now();
      const validEvents = store.filter(event =>
        (now - event.capturedAt) < filter.ttl
      );
      this.eventStore.set(eventName, validEvents);
    }

    // Emit capture event for monitoring
    this.emit('eventCaptured', {
      eventName,
      sequenceNumber: eventRecord.sequenceNumber,
      storeSize: store.length
    });
  }

  /**
   * Define a projection that transforms captured events
   * @param {string} projectionName - Name of the projection
   * @param {Array} sourceEvents - Event names to project from
   * @param {Function} projectionFunction - Function to transform events
   */
  defineProjection(projectionName, sourceEvents, projectionFunction) {
    this.projections.set(projectionName, {
      sourceEvents,
      projectionFunction,
      lastProcessedSequence: 0
    });

    return this;
  }

  /**
   * Execute a projection and emit the results
   * @param {string} projectionName - Name of projection to execute
   * @param {Object} options - Projection options
   */
  async project(projectionName, options = {}) {
    const {
      fromSequence = 0,
      toSequence = Infinity,
      emitResults = true
    } = options;

    const projection = this.projections.get(projectionName);
    if (!projection) {
      throw new Error(`Projection '${projectionName}' not found`);
    }

    // Collect all events from source event types
    const allEvents = [];
    for (const eventName of projection.sourceEvents) {
      const events = this.eventStore.get(eventName) || [];
      allEvents.push(...events.filter(event =>
        event.sequenceNumber >= fromSequence &&
        event.sequenceNumber <= toSequence
      ));
    }

    // Sort by sequence number
    allEvents.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    // Apply projection function
    const projectedEvents = await projection.projectionFunction(allEvents);

    // Update last processed sequence
    if (allEvents.length > 0) {
      projection.lastProcessedSequence = Math.max(
        ...allEvents.map(e => e.sequenceNumber)
      );
    }

    // Emit projected events
    if (emitResults) {
      for (const projectedEvent of projectedEvents) {
        this.emit(projectedEvent.eventName, projectedEvent.eventData);
      }
    }

    return projectedEvents;
  }

  /**
   * Replay captured events in sequence
   * @param {string} eventName - Event type to replay
   * @param {Object} options - Replay options
   */
  async replay(eventName, options = {}) {
    const {
      fromSequence = 0,
      toSequence = Infinity,
      delay = 0,
      filter = () => true
    } = options;

    const events = this.eventStore.get(eventName) || [];
    const eventsToReplay = events.filter(event =>
      event.sequenceNumber >= fromSequence &&
      event.sequenceNumber <= toSequence &&
      filter(event)
    );

    this.emit('replayStarted', {
      eventName,
      eventCount: eventsToReplay.length,
      fromSequence,
      toSequence
    });

    for (const event of eventsToReplay) {
      // Add replay metadata
      const replayEvent = {
        ...event.eventData,
        _replay: {
          originalSequence: event.sequenceNumber,
          originalTimestamp: event.timestamp,
          replayedAt: new Date()
        }
      };

      this.emit(eventName, replayEvent);

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    this.emit('replayCompleted', {
      eventName,
      eventsReplayed: eventsToReplay.length
    });

    return eventsToReplay.length;
  }

  /**
   * Create an async iterator for captured events
   * @param {string} eventName - Event type to iterate
   * @param {Object} options - Iterator options
   */
  async* capturedEvents(eventName, options = {}) {
    const {
      fromSequence = 0,
      filter = () => true,
      live = false // Continue yielding new events as they arrive
    } = options;

    const events = this.eventStore.get(eventName) || [];

    // Yield historical events
    for (const event of events) {
      if (event.sequenceNumber >= fromSequence && filter(event)) {
        yield event;
      }
    }

    // If live mode, continue yielding new events
    if (live) {
      let lastSequence = Math.max(0, ...events.map(e => e.sequenceNumber));

      const newEventPromises = [];

      const newEventHandler = (eventData) => {
        const events = this.eventStore.get(eventName) || [];
        const newEvents = events.filter(e =>
          e.sequenceNumber > lastSequence && filter(e)
        );

        for (const event of newEvents) {
          newEventPromises.push(Promise.resolve(event));
          lastSequence = Math.max(lastSequence, event.sequenceNumber);
        }
      };

      this.on('eventCaptured', (captureInfo) => {
        if (captureInfo.eventName === eventName) {
          newEventHandler();
        }
      });

      // Yield new events as they arrive
      while (true) {
        if (newEventPromises.length > 0) {
          const event = await newEventPromises.shift();
          yield event;
        } else {
          // Wait a bit before checking again
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
  }

  /**
   * Create a snapshot of current captured events
   * @param {string} snapshotId - Unique identifier for snapshot
   * @param {Array} eventNames - Event types to include (or all if empty)
   */
  createSnapshot(snapshotId, eventNames = []) {
    const eventsToSnapshot = eventNames.length > 0
      ? eventNames
      : Array.from(this.eventStore.keys());

    const snapshot = {
      snapshotId,
      timestamp: new Date(),
      sequenceNumber: this.sequenceNumber,
      events: {}
    };

    for (const eventName of eventsToSnapshot) {
      snapshot.events[eventName] = [...(this.eventStore.get(eventName) || [])];
    }

    this.snapshots.set(snapshotId, snapshot);
    this.emit('snapshotCreated', { snapshotId, eventTypes: eventsToSnapshot });

    return snapshot;
  }

  /**
   * Restore from a snapshot
   * @param {string} snapshotId - Snapshot to restore from
   */
  restoreFromSnapshot(snapshotId) {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot '${snapshotId}' not found`);
    }

    // Restore event store
    this.eventStore.clear();
    for (const [eventName, events] of Object.entries(snapshot.events)) {
      this.eventStore.set(eventName, [...events]);
    }

    this.sequenceNumber = snapshot.sequenceNumber;
    this.emit('snapshotRestored', { snapshotId });

    return snapshot;
  }

  /**
   * Get statistics about captured events
   */
  getStats() {
    const stats = {
      totalEvents: 0,
      eventTypes: this.eventStore.size,
      projections: this.projections.size,
      snapshots: this.snapshots.size,
      currentSequence: this.sequenceNumber,
      eventTypeStats: {}
    };

    for (const [eventName, events] of this.eventStore) {
      stats.eventTypeStats[eventName] = {
        count: events.length,
        oldestEvent: events[0]?.timestamp,
        newestEvent: events[events.length - 1]?.timestamp
      };
      stats.totalEvents += events.length;
    }

    return stats;
  }

  /**
   * Clear captured events
   * @param {string} eventName - Specific event type to clear (or all if not specified)
   */
  clear(eventName = null) {
    if (eventName) {
      this.eventStore.delete(eventName);
      this.captureFilters.delete(eventName);
    } else {
      this.eventStore.clear();
      this.captureFilters.clear();
      this.projections.clear();
      this.snapshots.clear();
      this.sequenceNumber = 0;
    }

    this.emit('storeCleared', { eventName });
  }
}

export default CaptureAndProject;

// Example usage:
/*
const captureAndProject = new CaptureAndProject();

// Capture specific events
captureAndProject.capture('userAction',
  (data) => data.userId === 'user123',
  { maxEvents: 1000, deduplicate: true, deduplicationKey: 'actionId' }
);

// Define a projection
captureAndProject.defineProjection('userActivitySummary',
  ['userAction', 'userLogin'],
  async (events) => {
    const summary = events.reduce((acc, event) => {
      acc[event.eventData.action] = (acc[event.eventData.action] || 0) + 1;
      return acc;
    }, {});

    return [{
      eventName: 'userActivitySummary',
      eventData: { userId: 'user123', summary, generatedAt: new Date() }
    }];
  }
);

// Emit some events
captureAndProject.emit('userAction', { userId: 'user123', action: 'click', actionId: 'a1' });
captureAndProject.emit('userAction', { userId: 'user123', action: 'scroll', actionId: 'a2' });

// Project the captured events
await captureAndProject.project('userActivitySummary');

// Replay events
await captureAndProject.replay('userAction', { delay: 100 });

// Use async iterator
for await (const event of captureAndProject.capturedEvents('userAction', { live: true })) {
  console.log('Captured event:', event);
}
*/
