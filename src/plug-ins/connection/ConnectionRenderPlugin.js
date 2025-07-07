import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class ConnectionRenderPlugin extends Plugin {
  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = this.app.svg;
    this.layers = this.app.layers;

    this.workbenchPlugin = this.app.plugins.get('WorkbenchPlugin');
    this.engine = this.workbenchPlugin.engine;

    this.stationManager = app.plugins.get('StationManagerPlugin');
    this.stationInstances = this.stationManager.stationInstances;

    this.portManager = app.plugins.get('PortManagerPlugin');
    this.portInstances = this.portManager.portInstances;

    this.app.on("connectionAdded", (connection) => this.renderConnection(connection));
    this.app.on("connectionRestored", (connection) => this.renderConnection(connection));
    this.app.on("connectionRemoved", (id) => this.removeConnection(id));

    // this.app.on("stationRemoved", (id) => this.destroyPorts(id));

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  removeConnection(id) {
    const path = this.svg.querySelector(`.connection-path[data-connection-id="${id}"]`);
    const labels = this.svg.querySelectorAll(`.connection-label[data-connection-id="${id}"]`);

    if (path) path.remove();
    labels.forEach((el) => el.remove());
  }

  renderConnection(connection) {

    console.log('BBB renderConnection', connection.serialize())
    console.log('BBB port instances', ...this.portInstances.keys())

    const fromPort = this.portInstances.get(connection.fromPortId);
    const toPort   = this.portInstances.get(connection.toPortId);

    // if (!fromPort || !toPort) return setTimeout(()=>this.renderConnection(connection),333);


    if (!fromPort) throw new Error(`fromPort not found in portInstances (${connection.fromPortId})`);
    if (!toPort) throw new Error(`toPort not found in portInstances (${connection.toPortId})`);

    console.log('renderConnection', {from: fromPort, to: toPort})

    if(0){
    console.error('TIME TRAVEL ERROR ON RESTORE!!! Ports are not yet in portInstances when ConnectionRenderPlugin.renderConnection(c) is aking for them.')
    if (!fromPort || !toPort) return setTimeout(()=>this.renderConnection(connection),333);
    }else{
      console.log('TT', fromPort || toPort);
      if (!fromPort || !toPort) return;
    }



    const pathId = `path-${connection.id}`;

    // Create path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("id", pathId);
    path.setAttribute("class", "connection-path");

    path.setAttribute("data-connection-id", connection.id);

    const updatePath = () => {
      path.setAttribute("d", `M ${fromPort.x.value},${fromPort.y.value} L ${toPort.x.value},${toPort.y.value}`);
    };

    updatePath();

    // Create label elements
    const createDynamicLabel = (initial, anchor) => {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("class", `connection-label connection-label-${anchor}`);
      text.setAttribute("data-connection-id", connection.id);
      text.setAttribute("text-anchor", anchor);

      const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
      textPath.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${pathId}`);
      textPath.textContent = initial;

      text.appendChild(textPath);
      return { text, textPath };
    };

    const { text: startText, textPath: startTP } = createDynamicLabel(connection.startLabel ?? "", "start");
    const { text: midText, textPath: midTP } = createDynamicLabel(connection.centerLabel ?? "", "middle");
    const { text: endText, textPath: endTP } = createDynamicLabel(connection.endLabel ?? "", "end");

    endText.style.textAnchor = "end";

    // Add to DOM
    this.layers.connections.appendChild(path);
    this.layers.labels.appendChild(startText);
    this.layers.labels.appendChild(midText);
    this.layers.labels.appendChild(endText);

    // Select connection
    path.addEventListener("click", (e) => {
      e.stopPropagation();
      this.app.emit("selectConnection", connection);
    });

    const updateOffsets = () => {
      requestAnimationFrame(() => {
        const totalLength = path.getTotalLength();
        const aestheticSidePadding = 18;
        startTP.setAttribute("startOffset", `${Math.max(0, aestheticSidePadding)}px`);
        midTP.setAttribute("startOffset", `50%`);
        endTP.setAttribute("startOffset", `${Math.max(0, totalLength - aestheticSidePadding)}px`);
      });
    };

    const updateAll = () => {
      updatePath();
      updateOffsets();
    };

    // Subscribe position changes
    console.error('UNSUBSCRIBE ME!')
    fromPort.x.subscribe(updateAll);
    fromPort.y.subscribe(updateAll);
    toPort.x.subscribe(updateAll);
    toPort.y.subscribe(updateAll);

    // Text updates
    connection.signals.centerLabel?.subscribe((text) => {
      midTP.textContent = text;
      updateOffsets();
    });

    connection.signals.startLabel?.subscribe?.((text) => {
      startTP.textContent = text;
      updateOffsets();
    });

    connection.signals.endLabel?.subscribe?.((text) => {
      endTP.textContent = text;
      updateOffsets();
    });

    // Initial offset position
    updateOffsets();
  }
}
