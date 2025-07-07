import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class GhostLinePlugin extends Plugin {

  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = this.app.svg;

    this.workbenchPlugin = this.app.plugins.get('WorkbenchPlugin');
    this.engine = this.workbenchPlugin.engine;

    this.stationManager = app.plugins.get('StationManagerPlugin');
    this.stationInstances = this.stationManager.stationInstances;

    this.portManager = app.plugins.get('PortManagerPlugin');
    this.portInstances = this.portManager.portInstances;

    this.app.svg.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.app.svg.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.app.svg.addEventListener("mouseup", (e) => this.onMouseUp(e));




  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  get isToolActive(){
    return this.app.selectedTool.value == 'connect'
  }


  onMouseDown(e) {
    if (!this.isToolActive) return;

    if (!e.target.classList.contains("station-port")) return;

    const fromPortId = e.target.dataset.portId;
    const fromPort = this.portInstances.get(fromPortId);
    const fromPortName = fromPort.name;

    const fromStationId = e.target.dataset.stationId;
    const fromStation = this.portInstances.get(fromPortId);

    if (!fromPort) return;

    this.isConnecting = true;
    this.fromPortId = fromPortId;
    this.fromPortName = fromPortName;
    this.fromStationId = fromStationId;

    const fromPos = { x: fromPort.x.value, y: fromPort.y.value };

    this.ghostLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.ghostLine.setAttribute("class", "ghost-line");
    this.ghostLine.setAttribute("x1", fromPos.x);
    this.ghostLine.setAttribute("y1", fromPos.y);
    this.ghostLine.setAttribute("x2", fromPos.x);
    this.ghostLine.setAttribute("y2", fromPos.y);

    this.app.layers.ghost.appendChild(this.ghostLine);
  }

  onMouseMove(e) {
    if (!this.isToolActive) return;
    if ( !this.isConnecting || !this.ghostLine) return;
    const pos = this.engine.clientToWorld(e.clientX, e.clientY);
    this.ghostLine.setAttribute("x2", pos.x);
    this.ghostLine.setAttribute("y2", pos.y);
  }

  onMouseUp(e) {
    if (!this.isToolActive) return;
    if ( !this.isConnecting) return;

    if (e.target.classList.contains("station-port")) {
      const toStationId = e.target.dataset.stationId;
      const toPortId = e.target.dataset.portId;
      const toPortName = e.target.dataset.portName;
      if (toPortId !== this.fromPortId) {

        // this.app.emit("beforeConnectionCreate", { from: this.fromStationId, to: toStationId });
        // const connection = this.graph.addConnection({ fromId: this.fromStationId, toId: toStationId, type: "ConnectionAgent" });
        const connection = {

          fromId: this.fromStationId,
          fromPortId: this.fromPortId,
          fromPortName: this.fromPortName,

          toId: toStationId,
          toPortId: toPortId,
          toPortName: toPortName,

        }
        console.info("BBB connectionAddRequest", connection)
        this.app.emit("connectionAddRequest", connection);

      }
    }

    this.cleanup();
  }

  cleanup() {
    this.isConnecting = false;
    this.fromPortId = null;
    if (this.ghostLine) {
      this.ghostLine.remove();
      this.ghostLine = null;
    }
  }


}
