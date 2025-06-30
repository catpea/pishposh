import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class StationMovePlugin extends Plugin {
  app;
  subscriptions;

  toolId = "move";
  toolActive = new Signal(false);
  subscriptions = new Set();

  constructor() {
    super()

    this.draggingStation = null;
    this.dragOffset = { x: 0, y: 0 };
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    this.stationManager = this.app.plugins.get('StationManagerPlugin');
    this.stationInstances = this.stationManager.stationInstances;
    this.workbenchPlugin = this.app.plugins.get('WorkbenchPlugin');
    this.engine = this.workbenchPlugin.engine;

    this.listenTo(this.svg, "mousedown", this.onMouseDown.bind(this));
    this.listenTo(this.svg, "mousemove", this.onMouseMove.bind(this));
    this.listenTo(this.svg, "mouseup",   this.onMouseUp.bind(this));

    const toolMonitorSubscription = this.app.selectedTool.map(appTool=>appTool==this.toolId).subscribe(active=>this.toolActive.value=active);

    this.subscriptions.add(toolMonitorSubscription);
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }






    onMouseDown(e) {
    if (!this.toolActive.value) return;

    const target = e.target.closest("g.station");
    if (!target) return;

    const id = target.dataset.stationId;
    const station = this.stationInstances.get(id);
    if (!station) return;

    this.draggingStation = station;
    const {x:worldX, y:worldY} = this.engine.clientToWorld(e.clientX, e.clientY);
    this.dragOffset.x = worldX - station.x;
    this.dragOffset.y = worldY - station.y;

    this.svg.classList.add("dragging");
    e.stopPropagation();
  }

  onMouseMove(e) {
    if (!this.toolActive.value) return;
    if (!this.draggingStation) return;

    const pos = this.engine.clientToWorld(e.clientX, e.clientY);

    const normal = {x:pos.x - this.dragOffset.x, y:pos.y - this.dragOffset.y};
    const snapped = this.engine.snapToGrid(pos.x - this.dragOffset.x, pos.y - this.dragOffset.y);

    this.draggingStation.set('x', normal.x);
    this.draggingStation.set('y', normal.y);

    e.stopPropagation();
  }

  onMouseUp(e) {
    if (!this.draggingStation) return;

    this.app.emit('stationUpdated', this.draggingStation)
    this.draggingStation = null;
    this.svg.classList.remove("dragging");
    e.stopPropagation();
  }

}
