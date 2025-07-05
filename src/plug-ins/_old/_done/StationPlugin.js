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
    // this.graph.on("nodeAdded", this.renderStation.bind(this));

    // Listen for new stations to render
    this.app
      .fromEvent('agentCreated')
      .map(agent=>({agent, node: this.graph.getNode(agent.id)}))
      // .subscribe(o=>console.log('XXXXXXXXXX', o));
      .subscribe(o=>this.renderStation(o));

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

  renderStation({ agent, node }) {
    console.log('RENDER STATION', agent, node );

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "station");
    group.setAttribute("data-station-id", node.id);

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "station-circle");
    circle.setAttribute("data-station-id", node.id);
    circle.setAttribute("cx", node.x.value);
    circle.setAttribute("cy", node.y.value);
    circle.setAttribute("r", node.r.value);
    circle.addEventListener("click",()=>this.app.emit("selectNode",node));
    group.appendChild(circle);


    console.log('agent', agent, agent.constructor.name,  );
    console.log('agent.ports', agent.ports)

    if(agent.ports){
      // Render in-ports
      let inStartAngle = 270;
      const inAngleStep = -36;
      for(const [index, {id, type, format}] of Object.entries(agent.ports.filter(port=>port.type=='in'))){
        const {x, y} = this.getPortCircleCoordinates({ r: node.r.value, x: node.x.value, y: node.y.value, angle:inStartAngle });
        const port = this.renderPort({id, r:node.r.value/2, x, y});
        group.appendChild(port);
        inStartAngle+=inAngleStep;
      }

      // Render out-ports
      let outStartAngle = 90;
      const outAngleStep = 36;
      for(const {id, type, format} of Object.entries(agent.ports.filter(port=>port.type=='out'))){
        const {x, y} = this.getPortCircleCoordinates({ r: node.r.value, x: node.x.value, y: node.y.value, angle:outStartAngle });
        const port = this.renderPort({id, r:node.r.value/2, x, y});
        group.appendChild(port);
        outStartAngle+=outAngleStep;
      }
    }





    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "label-text station-label");
    label.setAttribute("x", node.x.value);
    label.setAttribute("y", node.y.value - 20);
    label.textContent = node.label.value;

    label.addEventListener("dblclick", () => {
      const newLabel = prompt("Enter station name:", node.label.value);
      if (newLabel !== null) {
        node.label.value = newLabel;
      }
    });


    this.app.layers.stations.appendChild(group);
    this.app.layers.labels.appendChild(label);

    node.x.subscribe((x) => {
      circle.setAttribute("cx", x);
      label.setAttribute("x", x);
    });

    node.y.subscribe((y) => {
      circle.setAttribute("cy", y);
      label.setAttribute("y", y - 23);
    });

    node.label.subscribe((newLabel) => {
      label.textContent = newLabel;
    });



  }

  renderPort({id, x, y, r}){
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("class", "station-port");
      circle.setAttribute("data-station-port-id", id);
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", r); // smaller
      return circle
  }

  getPortCircleCoordinates({x, y, r, angle}) {
      // Convert angle from degrees to radians
      const radians = (angle-90) * (Math.PI / 180);

      // Calculate the coordinates of the smaller circle
      const xSmall = x + r * Math.cos(radians);
      const ySmall = y + r * Math.sin(radians);

      return { x: xSmall, y: ySmall };
  }

  stop() {
    for (const unsubscribe of this.subscriptions) {
      unsubscribe();
    }
    this.subscriptions.clear();
  }
}
