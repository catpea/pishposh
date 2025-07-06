import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class ManifestManagerPlugin extends Plugin {
  app;
  subscriptions;

  agentInstances;

  constructor() {
    super();
    this.subscriptions = new Set();
    this.agentManifests = new Map();
  }

  init(app) {
    this.app = app;

    this.app.on("stationAdded", (station) => this.instantiateManifest(station));
    this.app.on("stationRestored", (station) => this.instantiateManifest(station));
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  async instantiateManifest({ agentType }) {

    const manifest = await this.fetchManifest('agents', agentType);
    this.agentManifests.set(agentType, manifest);
    this.eventDispatch('manifestAdded', manifest);

  }

  async fetchManifest(agentRoot, basePath, fileName = "manifest.json") {
    const url = [window.location.origin, agentRoot, basePath, fileName].join('/');
    try {
      const response = await fetch(url); // Replace with your manifest file path
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      const manifest = await response.json();
      //console.log(manifest); // Do something with the manifest data
      return manifest;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

}
