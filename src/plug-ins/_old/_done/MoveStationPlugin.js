import { ReactiveSignal as Signal } from "../core/Signal.js";

export class MoveStationPlugin {

  toolId = "select";
  toolActive = new Signal(false);
  subscriptions = new Set();

  constructor() {
    this.draggingStation = null;
    this.dragOffset = { x: 0, y: 0 };
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;
    this.graph = app.graph;

    this.svg.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.svg.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.svg.addEventListener("mouseup", this.onMouseUp.bind(this));

    // Register Tool
    this.toolbox = app.plugins.get("ToolboxPlugin");
    this.toolbox.registerTool({ id: this.toolId, icon: "bi-arrows-move" });

    // Monitor For Tool Selection Active
    const toolMonitorSubscription = this.app.tool.map(appTool=>appTool==this.toolId).subscribe(active=>this.toolActive.value=active);
    this.app.tool.map(appTool=>console.log('map', appTool, appTool==this.toolId));

    this.subscriptions.add(toolMonitorSubscription);

  }

  onMouseDown(e) {
    if (!this.toolActive.value) return;

    const target = e.target.closest(".station-circle");
    if (!target) return;

    const id = target.dataset.stationId;
    const station = this.graph.nodes.get(id);
    if (!station) return;

    const pos = this.app.getMousePosition(e);
    this.draggingStation = station;
    this.dragOffset.x = pos.x - station.x.value;
    this.dragOffset.y = pos.y - station.y.value;

    this.svg.classList.add("dragging");
    e.stopPropagation();
  }

  onMouseMove(e) {
    if (!this.toolActive.value) return;

    if (!this.draggingStation) return;

    const pos = this.app.getMousePosition(e);
    const snapped = this.app.snapToGrid(pos.x - this.dragOffset.x, pos.y - this.dragOffset.y);

    this.draggingStation.x.value = snapped.x;
    this.draggingStation.y.value = snapped.y;
    e.stopPropagation();
  }

  onMouseUp(e) {
    if (!this.draggingStation) return;

    this.draggingStation = null;
    this.svg.classList.remove("dragging");
    e.stopPropagation();
  }
}
