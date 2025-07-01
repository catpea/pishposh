import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class AgentManagerPlugin extends Plugin {
  app;
  subscriptions;

  agentInstances;

  constructor() {
    super();
    this.subscriptions = new Set();
    this.agentManifests = new Map();
    this.agentInstances = new Map();
  }

  init(app) {
    this.app = app;

    this.app.on("stationAdded", (station) => this.instantiateAgent(station));
    this.app.on("stationRestored", (station) => this.instantiateAgent(station));
    this.app.on("stationRemoved", (id) => this.destroyAgent(id));
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  async instantiateAgent({ agentType, id }) {

    // load manifest
    const manifest = await this.fetchManifest('agents', agentType);
    this.agentManifests.set(agentType, manifest);
    this.eventDispatch('manifestAdded', manifest);
    console.log(manifest);

    // load main file as specified in manifest
    const Agent = await this.fetchClass('agents', agentType, manifest.files.main);
    const agent = new Agent({ id });
    this.agentInstances.set(id, agent);
    this.eventDispatch('agentAdded', agent);

  }

  destroyAgent(id) {
    agentInstances.delete(id);
  }

  async fetchManifest(agentRoot, basePath, fileName = "manifest.json") {
    const url = [window.location.origin, agentRoot, basePath, fileName].join('/');
    try {
      const response = await fetch(url); // Replace with your manifest file path
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      const manifest = await response.json();
      console.log(manifest); // Do something with the manifest data
      return manifest;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
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
