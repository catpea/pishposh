import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class AgentManagerPlugin extends Plugin {
  app;
  subscriptions;

  agentInstances;

  constructor() {
    super();
    this.subscriptions = new Set();
    this.agentInstances = new Map();
  }

  init(app) {
    this.app = app;

    this.manifestManager = app.plugins.get('ManifestManagerPlugin');
    this.agentManifests = this.manifestManager.agentManifests;

    this.app.on("stationAdded", (station) => this.instantiateStationAgent(station));
    this.app.on("stationRestored", (station) => this.instantiateStationAgent(station));
    this.app.on("stationRemoved", (id) => this.destroyAgent(id));

    this.app.on("connectionAdded", (connection) => this.instantiateConnectionAgent(connection));
    this.app.on("connectionRestored", (connection) => this.instantiateConnectionAgent(connection));
    this.app.on("connectionRemoved", (id) => this.destroyAgent(id));

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  async instantiateStationAgent(data) {
    const agent = await this.instantiateAgent(data);
    this.agentInstances.set(data.id, agent);
    this.eventDispatch('stationAgentAdded', agent);

    await agent.start();
    this.eventDispatch('stationAgentStarted', agent);

  }
  async instantiateConnectionAgent(connection) {
    console.warn('instantiateConnectionAgent', connection);

    if(connection.fromId) connection.fromEmitter =  this.agentInstances.get(connection.fromId)
    if(connection.toId) connection.toEmitter =  this.agentInstances.get(connection.toId)
    if(connection.fromPortName && connection.toPortName) connection.mapping = [ {fromEvent:connection.fromPortName, toEvent:connection.toPortName, transformer: data=>data } ];

    const agent = await this.instantiateAgent(connection);
    this.agentInstances.set(connection.id, agent);
    this.eventDispatch('connectionAgentAdded', agent);

    await agent.start();
    this.eventDispatch('connectionAgentStarted', agent);

  }

  async instantiateAgent(data) {
    console.log('Instantiate Agent', data.agentType);

   let manifest = this.agentManifests.has(data.agentType)? this.agentManifests.get(data.agentType):null;
    if(!manifest){
      this.manifestManager.instantiateManifest(data)
      manifest = await this.app.until('manifestAdded', data.agentType);
    }

    // load main file as specified in manifest
    const Agent = await this.fetchClass('agents', data.agentType, manifest.files.main);

    const agent = new Agent(data);
    return agent;
  }






  async destroyAgent(id) {
    const agent = this.agentInstances.get(id);

    this.agentInstances.delete(id);
    this.eventDispatch('agentRemoved', agent);

    await agent.stop();
    this.eventDispatch('agentStopped', agent);

  }














  async fetchClass(agentRoot, basePath, fileName = "index.js") {
    const url = [window.location.origin, agentRoot, basePath, fileName].join('/');
    try {
      // Dynamically import the module
      const module = await import(url);
      return module.default; // Return the default export (assumed to be a class)
    } catch (error) {
      console.error("Error loading module:", error);
      throw error; // Rethrow the error for further handling if needed
    }
  }

}
