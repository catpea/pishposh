import { Plugin } from "../../core/Plugin.js";
import { take } from "../../core/Utils.js";
import { ReactiveSignal as Signal } from "../../core/Signal.js";

import { SignalFieldGenerator } from "./SignalFieldGenerator.js";

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

    this.stationManager = app.plugins.get('AgentManagerPlugin');
    this.agentInstances = this.stationManager.agentInstances;
    this.agentManifests = this.stationManager.agentManifests;

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

  showNodeProperties(station){
    console.log(station.agentType)
    console.log(this.agentManifests.get(station.agentType))

    // clear properties
    this.propertyListElement.replaceChildren();


    const fieldArray = this.agentManifests.get(station.agentType).node.properties;
    const signalFieldGenerator = new SignalFieldGenerator();

    const [elements, signals] = signalFieldGenerator.generateFields(fieldArray);

    for(const element of elements){
      this.propertyListElement.appendChild(element);
    }

    for(const signal of signals){
      signal.subscribe(v=>console.log('Value changed for ', station, signal.name, v))
    }

    // NOTE: use signls for control

  }

  showConnectionProperties(connection){

  }

  renderTools() {
    // clear toolbox
    this.propertyListElement.replaceChildren();

    for (const toolsList of take(Object.entries(this.app.tools), this.toolColumns)) {
      const row = document.createElement("div");
      row.classList.add("row");
      for (const [name, data] of toolsList) {
        const col = document.createElement("div");
        col.classList.add("col");
        const toolElement = this.renderTool(name, data);
        col.appendChild(toolElement);
        row.appendChild(col);
      }
      this.propertyListElement.appendChild(row);
    }
  } // renderTools




  renderTool(toolName, toolData) {
    const toolButton = document.createElement("button");
    toolButton.classList.add("btn", "btn-sm");
    toolButton.setAttribute("title", toolData.description);
    toolButton.addEventListener("click", () => this.eventDispatch("selectTool", toolName));

    const toolIcon = document.createElement("i");
    toolButton.classList.add("bi", toolData.icon);

    this.app.selectedTool.subscribe((selectedName) => {
      if (selectedName === toolName) {
        toolButton.classList.add("active");
      } else {
        toolButton.classList.remove("active");
      }
    });

    this.app.selectedTool.subscribe((selectedName) => {
      if (selectedName === toolName) {
        toolButton.classList.remove(toolData.icon);
        toolButton.classList.add(toolData.iconSelected);
      } else {
        toolButton.classList.remove(toolData.iconSelected);
        toolButton.classList.add(toolData.icon);
      }
    });

    toolButton.appendChild(toolIcon);

    return toolButton;
  }
} // class
