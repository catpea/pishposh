import { ReactiveSignal as Signal } from "../core/Signal.js";

export class StationPlugin {

  toolId = "station";
  toolActive = new Signal(false);
  subscriptions = new Set();

  constructor() {}

  init(app) {
    this.app = app;
    this.svg = app.svg;
    this.graph = app.graph;

    this.svg.addEventListener("click", this.handleClick.bind(this));

    // Listen for new stations to render
    this.graph.on("nodeAdded", this.renderStation.bind(this));

    // Register Tool
    this.toolbox = app.plugins.get("ToolboxPlugin");
    this.toolbox.registerTool({ id: this.toolId, icon: "bi-node-plus-fill" });

    // Monitor For Tool Selection Active
    const toolMonitorSubscription = this.app.tool.map(appTool=>appTool==this.toolId).subscribe(active=>this.toolActive.value=active);
    this.subscriptions.add(toolMonitorSubscription);
  }

  handleClick(e) {
    if (!this.toolActive.value) return;
    if (this.app.isDragging) return;

    const pos = this.app.getMousePosition(e);
    const snapped = this.app.snapToGrid(pos.x, pos.y);

    this.app.emit("beforeStationCreate", snapped);

    const node = this.graph.addNode({ x: snapped.x, y: snapped.y });
    this.app.emit("selectNode", node);
  }

  renderStation(station) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "station");
    group.setAttribute("data-station-id", station.id);

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "station-circle");
    circle.setAttribute("data-station-id", station.id);
    circle.setAttribute("cx", station.x.value);
    circle.setAttribute("cy", station.y.value);
    circle.setAttribute("r", "12");

    circle.addEventListener("click", () => {
      this.app.emit("selectNode", station);
    });

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "label-text station-label");
    label.setAttribute("x", station.x.value);
    label.setAttribute("y", station.y.value - 20);
    label.textContent = station.label.value;

    label.addEventListener("dblclick", () => {
      const newLabel = prompt("Enter station name:", station.label.value);
      if (newLabel !== null) {
        station.label.value = newLabel;
      }
    });

    group.appendChild(circle);
    this.app.layers.stations.appendChild(group);
    this.app.layers.labels.appendChild(label);

    station.x.subscribe((x) => {
      circle.setAttribute("cx", x);
      label.setAttribute("x", x);
      // this.app.updateConnectionsForStation(station.id);
    });

    station.y.subscribe((y) => {
      circle.setAttribute("cy", y);
      label.setAttribute("y", y - 23);
      // this.app.updateConnectionsForStation(station.id);
    });

    station.label.subscribe((newLabel) => {
      label.textContent = newLabel;
    });
  }

  stop() {
    for (const unsubscribe of this.subscriptions) {
      unsubscribe();
    }
    this.subscriptions.clear();
  }
}
