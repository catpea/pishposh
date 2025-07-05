import { ReactiveSignal as Signal } from "../core/Signal.js";

export class ToolboxPlugin {

  constructor() {

    this.toolboxTools = new Signal([]);

    // this.tools1 = [
    //   { id: "select", icon: "bi-arrows-move" },
    //   { id: "station", icon: "bi-node-plus-fill" },
    //   { id: "connect", icon: "bi-bezier2" },
    // ];

  }

  init(app) {

    this.app = app;
    this.svg = this.app.svg;

    this.#createToolbox();

    const isToolAlreadyPresentFn = (tool) => !this.toolboxElement.querySelector(`div.tool[id=${tool.id}-tool]`);
    // this.toolboxTools.subscribe((tools) => tools.filter(isToolAlreadyPresentFn).forEach((tool) => this.#addToolboxTool(tool)));

    console.log(this.toolboxTools, this.toolboxTools.filter)

    this.toolboxTools
    .iterate()
    .filter(isToolAlreadyPresentFn)
    .subscribe((tool, thing)=>{
      this.#addToolboxTool(tool);
      console.log('New Tool', tool.id)
      console.dir( thing.path)
    });

  }

  registerTool(tool) {
    this.toolboxTools.value = [tool, ...this.toolboxTools.value];
  }

  #createToolbox() {
    this.toolboxElement = document.createElement("div");
    this.toolboxElement.id = "toolbox";
    document.getElementById("container").appendChild(this.toolboxElement);
  }

  #addToolboxTool(tool) {
    const button = document.createElement("div");
    button.classList.add("tool");
    button.id = `${tool.id}-tool`;
    button.title = tool.id.charAt(0).toUpperCase() + tool.id.slice(1);

    const icon = document.createElement("i");
    icon.classList.add("bi", tool.icon);
    button.appendChild(icon);

    toolbox.appendChild(button);
    button.addEventListener("click", () => this.selectTool(tool.id));
  }

  selectTool(toolId) {
    if (!this.toolboxTools.value.find((item) => item.id === toolId)) throw new Error("No such tool.");

    this.app.tool.value = toolId;
    console.log(this.app.tool.value)

    document.querySelectorAll(".tool").forEach((el) => el.classList.remove("active"));
    document.getElementById(`${toolId}-tool`).classList.add("active");

    this.svg.setAttribute('data-mode', `${toolId}-mode`);

  }
}
