/**
 * Agent - A reactive event emitter with streaming capabilities
 *
 * The Agent class provides a complete event-driven system that combines
 * traditional event emission with reactive streaming patterns. It supports
 * event subscription, value streaming, signal-like behavior with replay
 * capabilities, and functional reactive programming operators.
 *
 * @example
 * // Basic usage
 * const agent = new Agent();
 * agent.on('data', (value) => console.log('Received:', value));
 * agent.emit('data', 'Hello World');
 *
 * @example
 * // Streaming with subscription
 * const stream = new Agent();
 * stream.subscribe((value) => console.log('Stream value:', value));
 * stream.emitValue(42);
 *
 * @example
 * // Reactive operations
 * const source = new Agent();
 * const doubled = source.map(x => x * 2);
 * doubled.subscribe(console.log);
 * source.emitValue(5); // Outputs: 10
 */
export class Agent {
  /**
   * Map of event names to their subscribers
   * @type {Map<string, Set<Function>>}
   */
  eventNames;

  /**
   * Set to track event log
   * @type {Set}
   */
  eventLog;

  /**
   * Name identifier for the agent instance
   * @type {string}
   */
  name = "Agent";

  /**
   * Source emitter for chaining operations
   * @type {Agent|null}
   */
  source = null;

  /**
   * Whether to replay the last emitted value to new subscribers
   * @type {boolean}
   */
  replayLast = false;

  /**
   * The last emitted value (used when replayLast is true)
   * @type {*}
   */
  lastValue = null;

  /**
   * Test function to determine if lastValue should be replayed
   * @type {Function}
   */
  lastValueTest = (v) => v !== null;

  /**
   * Set of unsubscribe functions for cleanup
   * @type {Set<Function>}
   */
  unsubscribe;

  /**
   * Creates a new Agent instance
   *
   * @example
   * const agent = new Agent();
   * agent.replayLast = true; // Enable signal-like behavior
   */
  constructor() {
    this.eventNames = new Map();
    this.eventLog = new Set();
    this.unsubscribe = new Set();
  }

  /**
   * Subscribes to an event
   *
   * @param {string} event - The event name to listen for
   * @param {Function} subscriber - The callback function to execute
   * @returns {Function} Unsubscribe function
   *
   * @example
   * const unsubscribe = agent.on('data', (value) => {
   *   console.log('Received:', value);
   * });
   *
   * // Later, to unsubscribe:
   * unsubscribe();
   */
  on(event, subscriber) {
    if (!this.eventNames.has(event)) {
      this.eventNames.set(event, new Set());
    }
    this.eventNames.get(event).add(subscriber);
    return () => this.off(event, subscriber);
  }

  /**
   * Unsubscribes from an event
   *
   * @param {string} event - The event name
   * @param {Function} subscriber - The callback function to remove
   *
   * @example
   * const callback = (value) => console.log(value);
   * agent.on('data', callback);
   * agent.off('data', callback); // Remove specific subscriber
   */
  off(event, subscriber) {
    this.eventNames.get(event)?.delete(subscriber);
  }

  /**
   * Emits an event to all subscribers
   *
   * @param {string} event - The event name to emit
   * @param {*} data - The data to send to subscribers
   *
   * @example
   * agent.emit('data', { message: 'Hello World' });
   * agent.emit('error', new Error('Something went wrong'));
   */
  emit(event, data) {
    const subscribers = this.eventNames.get(event) ?? new Set();
    for (const subscriber of subscribers) {
      subscriber(data);
    }
  }

  /**
   * Emits a value through the streaming interface
   *
   * This method is used for reactive streaming. If replayLast is enabled,
   * the value will be stored and replayed to new subscribers.
   *
   * @param {*} value - The value to emit
   *
   * @example
   * const stream = new Agent();
   * stream.replayLast = true;
   * stream.emitValue(42);
   *
   * // New subscribers will receive 42 immediately
   * stream.subscribe(console.log);
   */
  emitValue(value) {
    if (this.replayLast) {
      this.lastValue = value;
    }
    this.emit("value", value);
  }

  /**
   * Subscribes to the value stream
   *
   * @param {Function} subscriber - Callback function that receives (value, agent)
   * @returns {Function} Unsubscribe function
   *
   * @example
   * const unsubscribe = agent.subscribe((value, source) => {
   *   console.log('Value:', value, 'from:', source.name);
   * });
   */
  subscribe(subscriber) {
    // Signal integration - replay last value if conditions are met
    if (this.replayLast && this.lastValueTest(this.lastValue)) {
      subscriber(this.lastValue, this);
    }

    return this.on("value", (v) => subscriber(v, this));
  }

  /**
   * Gets the path of source emitters leading to this agent
   *
   * @returns {Agent[]} Array of agents in the chain, from root to current
   *
   * @example
   * const root = new Agent();
   * const mapped = root.map(x => x * 2);
   * const filtered = mapped.filter(x => x > 10);
   *
   * console.log(filtered.path); // [root, mapped, filtered]
   */
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

  /**
   * Transforms values using a mapping function
   *
   * @param {Function} predicate - Function to transform each value
   * @returns {Agent} New agent that emits transformed values
   *
   * @example
   * const numbers = new Agent();
   * const doubled = numbers.map(x => x * 2);
   * const strings = doubled.map(x => `Number: ${x}`);
   *
   * strings.subscribe(console.log);
   * numbers.emitValue(5); // Outputs: "Number: 10"
   */
  map(predicate) {
    const result = new Agent();
    result.name = "map";
    result.source = this;

    const unsubscribe = this.subscribe((value) => {
      result.emitValue(predicate(value));
    });

    result.unsubscribe.add(unsubscribe);
    return result;
  }

  /**
   * Terminates the agent and cleans up all subscriptions
   *
   * This method unsubscribes from all events, clears the subscription chain,
   * and terminates all agents in the path.
   *
   * @example
   * const agent = new Agent();
   * const mapped = agent.map(x => x * 2);
   *
   * // Clean up everything
   * mapped.terminate();
   */
  terminate() {
    // Unsubscribe from all registered unsubscribe functions
    this.unsubscribe.forEach((unsubscriber) => unsubscriber());
    this.unsubscribe.clear();

    // Terminate all agents in the path
    this.path.forEach(fragment => {
      if (fragment !== this && typeof fragment.terminate === 'function') {
        fragment.terminate();
      }
    });

    // Clear event subscribers
    this.eventNames.clear();
    this.eventLog.clear();
  }
}
