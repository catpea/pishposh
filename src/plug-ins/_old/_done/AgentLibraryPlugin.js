import { ReactiveEmitter as EventEmitter } from '../core/Signal.js';

// Manages definitions of agent types and their constructors.
export class AgentLibraryPlugin {
  constructor() {
    this.agents = new Map();
  }

  init(app) {
    this.app = app;
    this.registerBuiltInAgents();
  }

  registerBuiltInAgents() {

    this.registerAgentType( "StationAgent", class StationAgent extends EventEmitter {
      static hidden = true;

      ports = [
        {id:'input', type:'in', format: 'data/object' },
        {id:'output', type:'out', format: 'data/object' },
        {id: 'predicate', type:'in', format: 'data/function' },
      ];

        constructor(id, config = {}, app) {
          super();
          this.id = id;
          this.name = config.name || "Station";
          // example of using a set for subscriptions
          this.subscriptions = new Set();
        }
        start() {

          const stopPiping = this.on("input", (o) => {
            console.log('ConnectionAgent got input', o)
            this.emit("output", o);
          });
          this.subscriptions.add(stopPiping);
        }
        stop() {
          for (const unsubscribe of this.subscriptions) {
            unsubscribe();
          }
          this.subscriptions.clear();
        }

        send(input) {
          this.emit("output", { content: input });
        }

      },
    );

    this.registerAgentType( "EchoAgent", class EchoAgent extends EventEmitter {

      static manifest = {
        name: 'Echo',
        icon: 'bi bi-terminal',
        description: 'Echo input to console',
      }

        constructor(id, config = {}, app) {
          super();
          this.id = id;
          this.name = config.name || "Echo";
        }
        start() {

          this.stopInput = this.on("input", (o) => {
            console.log('ECHO', o)
          });

        }
        stop() {
          this.stopInput()
        }

        send(input) {
          this.emit("output", { content: input });
        }
      },
    );

    this.registerAgentType( "ConnectionAgent", class ConnectionAgent extends EventEmitter {
        static hidden = true;
        subscriptions;
        constructor(id, config = {}, app) {
          super();
          this.id = id;
          this.name = config.name || "Connection";
          // example of using a set for subscriptions
          this.subscriptions = new Set();
        }
        start() {

          const stopPiping = this.on("input", (o) => {
            console.log('ConnectionAgent got input', o)
            this.emit("output", o);
          });
          this.subscriptions.add(stopPiping);
        }
        stop() {
          for (const unsubscribe of this.subscriptions) {
            unsubscribe();
          }
          this.subscriptions.clear();
        }

        send(input) {
          this.emit("output", { content: input });
        }
      },
    );

    this.registerAgentType( "IntervalAgent", class IntervalAgent extends EventEmitter {

      static manifest = {
        name: 'Interval',
        icon: 'bi bi-clock',
        description: 'Send timestamp at each interval',
      }

      constructor(id, config = {}, app) {
          super();
          this.id = id;
          this.interval = config.interval || 1000;
          this.timer = null;
          this.subscriptions = new Set();
        }

        start() {
          const intervalId = setInterval(() => {
            const packet = { content: Date.now() };
            this.send(packet);
          }, this.interval);

          this.subscriptions.add(()=>clearInterval(intervalId));
        }

        stop() {
          for (const unsubscribe of this.subscriptions) {
            unsubscribe();
          }
          this.subscriptions.clear();
        }

        send(input) {
          this.emit("output", { content: input });
        }

      });




    this.registerAgentType("GraphAgent", class GraphAgent extends EventEmitter {

      static hidden = true;

        constructor(id, config = {}, app) {
          super();
          this.id = id;
            this.app = app; // The main application
            this.subscriptions = new Set();

        }

        // Output the current graph as a serialized object
        export() {

          //TODO: figure out how many outgoing nodes there are before spending time on serializing the graph.

            if (!this.app?.graph) return;
            const serialized = this.app.graph.serialize();
            this.send({ type: "graph", content: serialized });
        }

        // Accept an incoming serialized graph object and load it
        import(packet) {
            if (!packet?.content) return;
            this.app.graph.deserialize(packet.content);
            this.send({ type: "ack", content: "Graph loaded" });
        }

        // Manual trigger
        send(data) {
            this.emit("output", { content: data });
        }

        // Handle input dynamically (supports live data sources)
        receive(input) {
            if (input?.type === "graph") {
                this.import(input);
            } else {
                this.send({ type: "error", content: "Unknown input type" });
            }
        }

        start() {

          // listen to graph changes
          const nodeAddedSubscription = this.app.graph.on('nodeAdded', () => this.export());
          const connectionAddedSubscription = this.app.graph.on('connectionAdded', () => this.export());
          const nodeChangedSubscription = this.app.graph.on('nodeChanged', () => this.export());


          const nodeRemovedSubscription = this.app.graph.on('nodeRemoved', () => this.export());
          const connectionRemovedSubscription = this.app.graph.on('connectionRemoved', () => this.export());

          // keep track of subscriptions
          this.subscriptions.add(nodeAddedSubscription);
          this.subscriptions.add(nodeChangedSubscription);
          this.subscriptions.add(connectionAddedSubscription);
          this.subscriptions.add(nodeRemovedSubscription);
          this.subscriptions.add(connectionRemovedSubscription);

          const acceptImport = this.on("input", (o) => {
            this.import(packet)
          });

          this.subscriptions.add(acceptImport);

        }

        stop() {
          for (const unsubscribe of this.subscriptions) {
            unsubscribe();
          }
          this.subscriptions.clear();
        }

    });





  } // registerBuiltInAgents

  registerAgentType(name, constructor) {
    this.agents.set(name, constructor);
  }

  getAgentType(name) {
    this.agents.get(name);
  }

  createAgent(id, type='StationAgent', config={}) {
    const AgentClass = this.agents.get(type);

    if (!AgentClass) {
      throw new Error(`Agent type not found: ${type}`);
    }

    return new AgentClass(id, config, this.app);
  }

  listAgents() {
    return [...this.agents.keys()];
  }

}
