import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class TrayManagerPlugin extends Plugin {
  app;
  subscriptions;
  constructor() {
    super();
    this.subscriptions = new Set();
    this.trayInstances = new Map()
  }

  init(app) {
    this.app = app;
    this.svg = this.app.svg;
    this.trays = this.app.layers.trays; // you can just .appendChild(this.ghostLine) as it is just a trays: document.createElementNS('http://www.w3.org/2000/svg', 'g'),

    this.app.emit("registerTool", { name: "tray",             data: { id: "tray-tool",        icon: "bi-share", iconSelected: "bi-share-fill", description: "connect items" } });
    this.app.emit("registerTool", { name: "trayPointMove",    data: { id: "tray-point-move-tool",   icon: "bi-share", iconSelected: "bi-share-fill", description: "connect items" } });
    this.app.emit("registerTool", { name: "trayReposition",   data: { id: "tray-reposition-tool",   icon: "bi-share", iconSelected: "bi-share-fill", description: "connect items" } });
    this.app.emit("registerTool", { name: "trayDelete",       data: { id: "tray-delete-tool", icon: "bi-share", iconSelected: "bi-share-fill", description: "connect items" } });

    this.loadStyleSheet(new URL("./style.css", import.meta.url).href);
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }
}
