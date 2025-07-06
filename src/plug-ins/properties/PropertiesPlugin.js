import { Plugin } from "../../core/Plugin.js";
import { take } from "../../core/Utils.js";
import { ReactiveSignal as Signal } from "../../core/Signal.js";

import { PropertiesForm, SignalFieldGenerator } from "./SignalFieldGenerator.js";

export class PropertiesPlugin extends Plugin {
  app;

  stations;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    // this.stationManager = app.plugins.get('AgentManagerPlugin');
    // this.agentInstances = this.stationManager.agentInstances;
    this.database = app.plugins.get('DatabasePlugin');
    // this.agentInstances = this.database.agentInstances;

    this.manifestManager = app.plugins.get('ManifestManagerPlugin');
    this.agentManifests = this.manifestManager.agentManifests;

    this.uiContainerElement = document.querySelector("#ui-container > .end-side");
    const htmlContent = `
      <div class="properties rounded shadow" tabindex="-1">
        <div id="property-list-toolbox" class="properties-body">
        </div>
      </div>
    `;
    const divElement = document.createElement("div");
    divElement.style.display = 'inline-block'; /* Element will only take up as much width as needed */
    divElement.innerHTML = htmlContent;
    this.uiContainerElement.appendChild(divElement);
    this.propertyListElement = divElement.querySelector("#property-list-toolbox");

    // Listen to selection events
    app.on('selectNode', node => this.showNodeProperties(node));
    app.on('selectConnection', connection => this.showConnectionProperties(connection));
    app.on('deselect', () => this.clearPanel());

    this.loadStyleSheet(new URL("./style.css", import.meta.url).href);
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  async showNodeProperties(station){
    // Clear existing UI
    if(this.form) this.form.terminate();
    // Laad Manifest
    const manifest = await this.app.until('manifestAdded', station.agentType);
    // create new UI
    this.form = new PropertiesForm(station, manifest, this.database, this.propertyListElement);
  }

  async showConnectionProperties(connection){
    console.log('DDD connection.agentType', connection.agentType );

    // Clear existing UI
    if(this.form) this.form.terminate();
    // Laad Manifest
    // const manifest = await this.app.until('manifestAdded', connection.agentType);
    let manifest = this.agentManifests.has(connection.agentType)? this.agentManifests.get(connection.agentType):null;
    if(!manifest){
      this.manifestManager.instantiateManifest(connection)
      manifest = await this.app.until('manifestAdded', connection.agentType);
    }

    // create new UI
    this.form = new PropertiesForm(connection, manifest, this.database, this.propertyListElement);
  }

} // class
