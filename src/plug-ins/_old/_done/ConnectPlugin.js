import { ReactiveSignal as Signal } from "../core/Signal.js";

export class ConnectPlugin {

  toolId = "connect";
  toolActive = new Signal(false);
  subscriptions = new Set();

  constructor() {
    this.isConnecting = false;
    this.fromStationId = null;
    this.tempLine = null;
  }

  init(app) {
    this.app = app;
    this.graph = app.graph;



    // Register Tool
    this.toolbox = app.plugins.get("ToolboxPlugin");
    this.toolbox.registerTool({ id: this.toolId, icon: "bi-bezier2" });

    // Monitor For Tool Selection Active
    const toolMonitorSubscription = this.app.tool.map(appTool=>appTool==this.toolId).subscribe(active=>this.toolActive.value=active);
    this.subscriptions.add(toolMonitorSubscription);

    this.app.svg.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.app.svg.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.app.svg.addEventListener("mouseup", (e) => this.onMouseUp(e));
  }

  onMouseDown(e) {
    if (!this.toolActive.value) return;

    if (!e.target.classList.contains("station-circle")) return;

    const stationId = e.target.dataset.stationId;
    const station = this.graph.nodes.get(stationId);

    if (!station) return;

    this.isConnecting = true;
    this.fromStationId = stationId;

    const fromPos = { x: station.x.value, y: station.y.value };

    this.tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.tempLine.setAttribute("class", "temp-line");
    this.tempLine.setAttribute("x1", fromPos.x);
    this.tempLine.setAttribute("y1", fromPos.y);
    this.tempLine.setAttribute("x2", fromPos.x);
    this.tempLine.setAttribute("y2", fromPos.y);

    this.app.layers.temp.appendChild(this.tempLine);
  }

  onMouseMove(e) {
    if (!this.toolActive.value) return;
    if ( !this.isConnecting || !this.tempLine) return;
    const pos = this.app.getMousePosition(e);
    this.tempLine.setAttribute("x2", pos.x);
    this.tempLine.setAttribute("y2", pos.y);
  }

  onMouseUp(e) {
    if (!this.toolActive.value) return;
    if ( !this.isConnecting) return;

    if (e.target.classList.contains("station-circle")) {
      const toStationId = e.target.dataset.stationId;
      if (toStationId !== this.fromStationId) {
        this.app.emit("beforeConnectionCreate", { from: this.fromStationId, to: toStationId });
        const connection = this.graph.addConnection({ fromId: this.fromStationId, toId: toStationId, type: "ConnectionAgent" });
        this.app.emit("selectConnection", connection);
      }
    }

    this.cleanup();
  }

  cleanup() {
    this.isConnecting = false;
    this.fromStationId = null;
    if (this.tempLine) {
      this.tempLine.remove();
      this.tempLine = null;
    }
  }

  l(...a) {
    console.log(`${this.constructor.name}:`, ...a);
  }
}
