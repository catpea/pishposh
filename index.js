// this.#id = String.fromCharCode( ...Array(32) .fill(0) .map(() => parseInt(97 + Math.random() * 26)),

/**
 * @class Signal
 * @template T
 * @description A reactive value container with subscription support.
 */
class Signal {
  /** @type {string} */
  #id;

  /** @type {T} */
  #value;

  /** @type {Set<function(T): void>} */
  #subscribers;

  /** @type {(value: T) => boolean} */
  #test;

  /**
   * Create a new Signal instance.
   * @param {T} value - The initial value.
   * @param {{ test?: (value: T) => boolean }} [options] - Optional configuration.
   */
  constructor(value, options = {}) {
    this.#id = Signal.#generateId();
    this.#value = value;
    this.#subscribers = new Set();

    this.#test = typeof options.test === 'function'
      ? options.test
      : (v) => v !== null && v !== undefined;

    // Notify immediately if test passes
    if (this.#test(value)) {
      this.notify();
    }
  }

  /**
   * Get the unique ID of the signal.
   * @returns {string}
   */
  get id() {
    return this.#id;
  }

  /**
   * Get the current value of the signal.
   * @returns {T}
   */
  get value() {
    return this.#value;
  }

  /**
   * Set a new value and notify subscribers.
   * @param {T} newValue
   */
  set value(newValue) {
    this.#value = newValue;
    this.notify();
  }

  /**
   * Subscribe to changes in the signal.
   * @param {(value: T) => void} callback - Function to call when value changes.
   * @returns {() => void} - A function to unsubscribe.
   */
  subscribe(callback) {
    if (this.#test(this.#value)) {
      callback(this.#value);
    }
    this.#subscribers.add(callback);
    return () => {
      this.#subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of the current value.
   */
  notify() {
    for (const callback of this.#subscribers) {
      callback(this.#value);
    }
  }

  /**
   * Generate a readable random identifier.
   * @returns {string}
   * @private
   */
  static #generateId() {
    const length = 12;
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    return [...Array(length)].map(() =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }
}


/**
 * @class Events
 * @description A lightweight EventEmitter with support for wildcard listeners.
 */
class Events {
  /** @type {Map<string, Set<Function>>} */
  #subscribers;

  constructor() {
    this.#subscribers = new Map();
    this.#subscribers.set('*', new Set());
  }

  /**
   * Register an event listener.
   * @param {string} event - The name of the event to listen to.
   * @param {Function} callback - The callback to execute when the event is emitted.
   */
  on(event, callback) {
    if (!this.#subscribers.has(event)) {
      this.#subscribers.set(event, new Set());
    }
    this.#subscribers.get(event).add(callback);
  }

  /**
   * Emit an event to all listeners for that event and wildcard listeners.
   * @param {string} event - The name of the event being emitted.
   * @param {any} data - Optional data to pass to the listeners.
   */
  emit(event, data) {
    const listeners = this.#subscribers.get(event) ?? new Set();
    const wildcardListeners = this.#subscribers.get('*') ?? new Set();

    for (const listener of listeners) {
      listener(data);
    }
    for (const listener of wildcardListeners) {
      listener(data);
    }
  }

  /**
   * Unsubscribe a listener from a specific event.
   * @param {string} event - The event to unsubscribe from.
   * @param {Function} callback - The callback to remove.
   */
  off(event, callback) {
    const listeners = this.#subscribers.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Remove all listeners for a given event (or all events if omitted).
   * @param {string} [event] - Optional event name to clear listeners from.
   */
  clear(event) {
    if (event) {
      this.#subscribers.delete(event);
    } else {
      this.#subscribers.clear();
      this.#subscribers.set('*', new Set()); // preserve wildcard
    }
  }
}

/**
 * @class Machine
 * @description A finite state machine with reactive state and event-driven hooks.
 */
class Machine {
  /** @type {Signal<string>} */
  activeState = new Signal();

  /** @type {Events} */
  events = new Events();

  /** @type {Record<string, Record<string, string>>} */
  #transitions;

  /**
   * Create a new Machine instance.
   * @param {string} initialState - The starting state of the machine.
   * @param {Record<string, Record<string, string>>} transitions - Transition map of the FSM.
   */
  constructor(initialState, transitions) {
    this.#transitions = transitions;
    this.activeState.value = initialState;
  }

  /**
   * Perform a symbolic transition (e.g. "start", "success", "fail").
   * Emits events for `exit.*`, `before`, `transition`, `after`, `enter.*`.
   * @param {string} eventName - The name of the event to trigger a transition.
   */
  transition(eventName) {
    const currentStateName = this.activeState.value;
    const possibleTransitions = this.#transitions[currentStateName];

    if (!possibleTransitions) {
      throw new Error(`No transitions defined for state '${currentStateName}'`);
    }

    const nextStateName = possibleTransitions[eventName];

    if (!nextStateName) {
      throw new Error(`No transition for event '${eventName}' in state '${currentStateName}'`);
    }

    const transition = {
      previousState: currentStateName,
      currentState: nextStateName,
      event: eventName,
    };

    console.log(`[Machine] ${currentStateName} --(${eventName})--> ${nextStateName}`);

    this.events.emit(`exit.${currentStateName}`, currentStateName);
    this.events.emit("before", transition);

    this.activeState.value = nextStateName;

    this.events.emit("transition", transition);
    this.events.emit("after", transition);
    this.events.emit(`enter.${nextStateName}`, nextStateName);
  }

  /**
   * List possible symbolic transitions for the current state.
   * @returns {Record<string, string>} - A map of event names to next state names.
   */
  list() {
    const currentStateName = this.activeState.value;
    const possibleTransitions = this.#transitions[currentStateName];

    if (!possibleTransitions) {
      throw new Error(`No transitions defined for state '${currentStateName}'`);
    }

    return possibleTransitions;
  }

  /**
   * Check if a transition is possible from the current state.
   * @param {string} eventName - The name of the event.
   * @returns {boolean} - True if the event is valid from current state.
   */
  can(eventName) {
    const current = this.activeState.value;
    return Boolean(this.#transitions[current]?.[eventName]);
  }

}


class Lifecycle {
  #states = {
    inactive: {
      start: "activating",
    },
    activating: {
      success: "active",
      fail: "failed",
    },
    active: {
      stop: "deactivating",
      reload: "reloading",
    },
    reloading: {
      success: "active",
      fail: "failed",
    },
    deactivating: {
      success: "inactive",
      fail: "failed",
    },
    failed: {
      restart: "activating",
      reset: "inactive",
    },
  };
  constructor() {
    this.machine = new Machine("inactive", this.#states);
  }

}







// PluginManager.js

/**
 * @class PluginManager
 * @description Manages loading and lifecycle of application plugins.
 */
class PluginManager {
  static types = {
    UI: 'ui',
    service: 'service',
    provider: 'provider',
    consumer: 'consumer',
  };

  /** @type {Set<ApplicationPlugin>} */
  #plugins = new Set();

  /**
   * Load a plugin from a manifest URL (dynamic import)
   * @param {string} manifestUrl
   * @param {object} [options]
   */
  async loadPluginFromManifest(manifestUrl, options = {}) {
    const manifest = await fetch(manifestUrl).then(res => res.json());
    const module = await import(manifest.module);
    if (typeof module.default === 'function') {
      const plugin = new module.default(options);
      this.register(plugin);
    }
  }

  /**
   * Load a plugin from an existing instance.
   * @param {ApplicationPlugin} plugin
   */
  register(plugin) {
    this.#plugins.add(plugin);
  }

  /**
   * Initialize all registered plugins.
   * @param {Application} app
   */
  async load(app) {
    for (const plugin of this.#plugins) {
      if (typeof plugin.init === 'function') {
        await plugin.init(app, plugin.options || {});
      }
    }
  }

  /**
   * Start all plugins.
   */
  async startAll() {
    for (const plugin of this.#plugins) {
      if (typeof plugin.start === 'function') {
        await plugin.start();
      }
    }
  }

  /**
   * Stop all plugins.
   */
  async stopAll() {
    for (const plugin of this.#plugins) {
      if (typeof plugin.stop === 'function') {
        await plugin.stop();
      }
    }
  }

  get plugins() {
    return [...this.#plugins];
  }
}




/**
 * @abstract
 * @class ApplicationPlugin
 * @description Base plugin class all plugins should extend.
 */
class ApplicationPlugin {
  name = 'Unnamed Plugin';
  description = '';
  type = PluginManager.types.service;
  defaults = {};
  provides = [];

  options = {};
  subscriptions = new Set();

  /**
   * Called when the plugin is initialized.
   * @param {Application} app
   * @param {object} options
   */
  async init(app, options) {
    this.options = Object.assign({}, this.defaults, options);
  }

  /**
   * Start plugin functionality.
   */
  async start() {}

  /**
   * Stop plugin and clean up.
   */
  async stop() {
    for (const unsubscribe of this.subscriptions) {
      await unsubscribe();
    }
    this.subscriptions.clear();
  }
}


// Example Plugin
class DocumentTitle extends ApplicationPlugin {
  name = 'document-title';
  description = 'Sets the document title';
  type = PluginManager.types.UI;
  defaults = {
    title: 'Application'
  };

  constructor(options = {}) {
    super();
    this.options = Object.assign({}, this.defaults, options);
  }

  async start() {
    document.title = this.options.title;
  }
}







export default class Application {
  #zones = new Map();

  #graphs = new Map();

  #services = new Map();
  #providers = new Map();
  #consumers = new Map();
  #lifecycle = new Lifecycle();

  plugins = new PluginManager();
  events = new Events();

  constructor() {
    // Setup UI zones
    this.#zones.set('side-pane', document.getElementById('side-pane'));
    this.#zones.set('tools', document.getElementById('tools'));
    this.#zones.set('toolbox', document.getElementById('toolbox'));

    // Bridge lifecycle events to global event bus
    this.#lifecycle.machine.events.on('*', (...args) => this.events.emit(...args));

    // Register system plugins
    this.plugins.register(new DocumentTitle({ title: 'My Application' }));

    this.plugins.register(new GraphManagerPlugin({ title: 'My Application' }));
    this.plugins.register(new StandardAgentLibraryPlugin({ title: 'My Application' }));

    // Load and initialize all plugins
    this.plugins.load(this);
  }

  /**
   * Mount a UI element to a named zone.
   * @param {HTMLElement} clientElement
   * @param {string} zoneName
   */
  mountUI(clientElement, zoneName = 'side-pane') {
    const zone = this.#zones.get(zoneName);
    if (zone) zone.appendChild(clientElement);
    else throw new Error(`Zone '${zoneName}' not found`);
  }

  /**
   * Public lifecycle state
   */
  get state() {
    return this.#lifecycle.machine.activeState.value;
  }

  /**
   * Transition application lifecycle state
   * @param {string} stateName
   */
  to(stateName) {
    this.#lifecycle.machine.transition(stateName);
  }

  // Plugin & Service APIs (placeholders)
  registerCapability() {}
  getServices() {}

  static generateId() {
    const length = 8;
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return [...Array(length)].map(() =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }
}














// class MouseCoordinateDataProvider extends Events {
//   id;
//   constructor(url){
//     ...
//   }
// }

// class CombineLatest extends Events {
//   id;
//   constructor(...signals){
//     ...
//   }
// }

// const combineLatest = (...arg) => new CombineLatest(...arg);












// Graph Data Structure
class GraphNode {
    constructor(id, x, y, label = '', agent) {

        this.id = id;
        this.x = new Signal(x);
        this.y = new Signal(y);
        this.label = new Signal(label || `Station ${id}`);
        this.agent = agent;
        this.connections = new Set();

    }

    connect(nodeId) {
        this.connections.add(nodeId);
    }

    disconnect(nodeId) {
        this.connections.delete(nodeId);
    }
}

class GraphConnection {
    constructor(id, fromId, toId, label = '') {
        this.id = id;
        this.fromId = fromId;
        this.toId = toId;
        this.label = new Signal(label || `Line ${id}`);
    }
}


class Graph extends Events {
    constructor() {
        super();
        this.nodes = new Map();
        this.connections = new Map();
        this.nodeCounter = 0;
        this.connectionCounter = 0;
    }

    addNode(x, y, label, agent) {
        const id = ++this.nodeCounter;
        const node = new GraphNode(id, x, y, label, agent);
        this.nodes.set(id, node);
        this.emit('nodeAdded', node);
        return node;
    }

    removeNode(id) {
        const node = this.nodes.get(id);
        if (node) {
            // Remove all connections to this node
            this.connections.forEach((conn, connId) => {
                if (conn.fromId === id || conn.toId === id) {
                    this.removeConnection(connId);
                }
            });
            this.nodes.delete(id);
            this.emit('nodeRemoved', { id, node });
        }
    }

    addConnection(fromId, toId, label) {
        const id = ++this.connectionCounter;
        const connection = new GraphConnection(id, fromId, toId, label);
        this.connections.set(id, connection);

        const fromNode = this.nodes.get(fromId);
        const toNode = this.nodes.get(toId);
        if (fromNode) fromNode.connect(toId);
        if (toNode) toNode.connect(fromId);

        this.emit('connectionAdded', connection);
        return connection;
    }

    removeConnection(id) {
        const connection = this.connections.get(id);
        if (connection) {
            const fromNode = this.nodes.get(connection.fromId);
            const toNode = this.nodes.get(connection.toId);
            if (fromNode) fromNode.disconnect(connection.toId);
            if (toNode) toNode.disconnect(connection.fromId);

            this.connections.delete(id);
            this.emit('connectionRemoved', { id, connection });
        }
    }
}



class GraphManager {
  /** @type {Map<string, Graph>} */
  graphs = new Map();

  add(name) {
    const graph = new Graph();
    this.graphs.set(name, graph);
    return graph;
  }

  get(name) {
    return this.graphs.get(name);
  }

  delete(name) {
    this.graphs.delete(name);
  }
}






class GraphManagerPlugin extends ApplicationPlugin {
  name = 'graph-manager';
  description = 'API for creating graph-based programming models';
  type = PluginManager.types.provider;

  init(app) {
    app.graphs = new GraphManager();
    app.agentManager = new AgentManager();

    app.addGraph = (name) => {
      const graph = app.graphs.add(name);
      app.events.emit('graph.added', { name, graph });
      return graph;
    };

    app.deleteGraph = (name) => {
      app.graphs.delete(name);
      app.events.emit('graph.deleted', { name });
    };

    app.addAgent = (graphId, agentType, agentId = `agent-${Date.now()}`) => {
      const graph = app.graphs.get(graphId);
      const agent = app.agentManager.createInstance(agentType);
      const node = graph.addNode(100, 100, agentId, agent);
      app.events.emit('graph.agent.added', { graphId, node, agent });
      return node;
    };

    app.removeAgent = (graphId, nodeId) => {
      const graph = app.graphs.get(graphId);
      graph.removeNode(nodeId);
      app.events.emit('graph.agent.removed', { graphId, nodeId });
    };

    app.addConnection = (graphId, fromId, toId, label) => {
      const graph = app.graphs.get(graphId);
      const conn = graph.addConnection(fromId, toId, label);
      app.events.emit('graph.connection.added', { graphId, connection: conn });
      return conn;
    };

    app.removeConnection = (graphId, connectionId) => {
      const graph = app.graphs.get(graphId);
      graph.removeConnection(connectionId);
      app.events.emit('graph.connection.removed', { graphId, connectionId });
    };
  }
}









class AgentManager {
  agents = new Map(); // Map of agentType → agent config
  categories = new Map(); // category → Set of agentTypes

  registerAgent(agent) {
    this.agents.set(agent.type, agent);
    if (!this.categories.has(agent.category)) {
      this.categories.set(agent.category, new Set());
    }
    this.categories.get(agent.category).add(agent.type);
  }

  createInstance(agentType) {
    const meta = this.agents.get(agentType);
    if (!meta) throw new Error(`Agent type "${agentType}" not registered.`);
    return meta.create();
  }
}

// agents are just Event Emitters
class Agent extends Events {
  // example of providing helper functions
  send(data){
    this.emit('output', data)
  }
}



class StandardAgentLibraryPlugin extends ApplicationPlugin {
  name = 'standard-agent-library';
  description = 'Built-in library of common processing agents';
  type = PluginManager.types.provider;

  init(app) {
    const lib = [
      {
        type: 'lowercase-agent',
        category: 'function',
        color: '#bada55',
        icon: 'font-case.svg',
        defaults: { name: { value: '' } },
        inputs: 1,
        outputs: 1,
        create() {
          const agent = new Agent();
          agent.on('input', (msg) => {
            msg.payload = String(msg.payload).toLowerCase();
            agent.send(msg);
          });
          return agent;
        }
      },
      {
        type: 'uppercase-agent',
        category: 'function',
        color: '#cfbbff',
        icon: 'font-case.svg',
        defaults: { name: { value: '' } },
        inputs: 1,
        outputs: 1,
        create() {
          const agent = new Agent();
          agent.on('input', (msg) => {
            msg.payload = String(msg.payload).toUpperCase();
            agent.send(msg);
          });
          return agent;
        }
      }
    ];

    for (const agent of lib) {
      app.agentManager.registerAgent(agent);
    }

    app.events.emit('agent-library.loaded', {
      count: lib.length,
      agents: lib.map(a => a.type)
    });
  }
}
