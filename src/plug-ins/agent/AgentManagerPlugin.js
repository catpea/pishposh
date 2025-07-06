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


    this.app.on("stationAdded", (station) => this.instantiateAgent(station));
    this.app.on("stationRestored", (station) => this.instantiateAgent(station));
    this.app.on("stationRemoved", (id) => this.destroyAgent(id));
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  async instantiateAgent({ agentType, id }) {

   // NOTE: this works too
   // let manifest = this.agentManifests.has(agentType)? this.agentManifests.get(agentType): null;
   // if(manifest === null)  manifest = this.manifestManager.load(agentType);
   // NOTE: and this: const manifest = this.agentManifests.has(agentType)? this.agentManifests.get(agentType): await this.app.until('manifestAdded', agentType);

    const manifest = await this.app.until('manifestAdded', agentType);

    // load main file as specified in manifest
    const Agent = await this.fetchClass('agents', agentType, manifest.files.main);
    const agent = new Agent({ id });
    this.agentInstances.set(id, agent);
    this.eventDispatch('agentAdded', agent);

  }

  destroyAgent(id) {
    const agent = this.agentInstances.get(id);
    agent.stop();
    this.agentInstances.delete(id);
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
