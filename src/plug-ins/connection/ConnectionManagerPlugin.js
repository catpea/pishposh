import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class ConnectionManagerPlugin extends Plugin {
  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
    this.connectionInstances = new Map()

  }

  init(app) {
    this.app = app;
    this.svg = this.app.svg;

    this.app.emit("registerTool", { name: "connect", data: { id: "connect-tool", icon: "bi-usb-plug", iconSelected: "bi-usb-plug-fill", description: "connect items" } });

    this.loadStyleSheet(new URL("./style.css", import.meta.url).href);
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }
}
