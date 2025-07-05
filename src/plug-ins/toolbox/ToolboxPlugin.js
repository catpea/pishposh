import { Plugin } from "../../core/Plugin.js";
import { take } from "../../core/Utils.js";
import { ReactiveSignal as Signal } from "../../core/Signal.js";
// import { PersistentMap } from "./PersistentMap.js";

export class ToolboxPlugin extends Plugin {
  app;

  stations;
  subscriptions;

  constructor() {
    super();
    this.defaultTool = "select";
    this.toolColumns = 2;
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    this.uiContainerElement = document.querySelector("#ui-container > .start-side");
    const htmlContent = `
      <div class="toolbox rounded shadow" tabindex="-1">
        <div id="tool-list-toolbox" class="toolbox-body">
        </div>
      </div>
    `;
    const divElement = document.createElement("div");
    divElement.style.display = 'inline-block'; /* Element will only take up as much width as needed */
    divElement.innerHTML = htmlContent;
    this.uiContainerElement.appendChild(divElement);
    this.toolListElement = divElement.querySelector("#tool-list-toolbox");

    if (!this.app.tools) this.app.tools = {};
    if (!this.app.selectedTool) this.app.selectedTool = new Signal(this.defaultTool);

    this.app.selectedTool.subscribe((selectedName) => {
      document.getElementById("tool-info").textContent = `Tool: (${selectedName})`;
    });

    this.app.on("registerTool", ({ name: toolName, data: toolData }) => {
      const id = toolData.id;
      this.app.tools[toolName] = toolData;
      this.renderTools();
    });

    this.app.on("selectTool", (toolId) => {
      console.log("selectTool", toolId);
      if (!this.app.tools[toolId]) return console.error("No such tool", toolId);
      const dataToolIdentity = this.app.tools[toolId].id;
      this.svg.setAttribute("data-tool", dataToolIdentity);
      this.app.selectedTool.value = toolId;
    });

    this.app.emit("registerTool", { name: "select", data: { id: "select-tool", icon: "bi-cursor", iconSelected: "bi-cursor-fill", description: "select item" } });
    this.app.emit("registerTool", { name: "group", data: { id: "group-tool", icon: "bi-pentagon", iconSelected: "bi-pentagon-fill", description: "group items" } });
    this.app.emit("registerTool", { name: "group2", data: { id: "group-tool", icon: "bi-wrench", iconSelected: "bi-wrench-fill", description: "group items" } });

    // this.app.emit('registerTool', {name:'interact', data:{id:'interact-tool', icon:'bi-hand-index-thumb', iconSelected:'bi-hand-index-fill', description:'interact with item' }});
    // this.app.emit('registerTool', {name:'comment',  data:{id:'interact-tool', icon:'bi-pin-angle', iconSelected:'bi-pin-fill', description:'comment tool' }});

    ///...
    // this.app.emit('registerTool', {name:'zoomIn',  data:{id:'zoom-in-tool'}});
    // this.app.emit('registerTool', {name:'zoomOut', data:{id:'zoom-out-tool'}});

    this.loadStyleSheet(new URL("./style.css", import.meta.url).href);
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv) {
    console.info("eventDispatch", ...argv);
    this.app.emit(...argv);
    console.log(this.app.tools);
  }

  renderTools() {
    // clear toolbox
    this.toolListElement.replaceChildren();

    for (const toolsList of take(Object.entries(this.app.tools), this.toolColumns)) {
      const row = document.createElement("div");
      row.classList.add("row");
      for (const [name, data] of toolsList) {
        const col = document.createElement("div");
        col.classList.add("col");
        // col.style.textAlign = "center";
        const toolElement = this.renderTool(name, data);
        col.appendChild(toolElement);
        row.appendChild(col);
      }
      this.toolListElement.appendChild(row);
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
