import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class PortManagerPlugin extends Plugin {
  app;
  subscriptions;

  portInstances;

  constructor() {
    super();
    this.subscriptions = new Set();
    this.portInstances = new Map();
  }

  init(app) {
    this.app = app;


    this.stationManager = app.plugins.get('AgentManagerPlugin');
    this.agentInstances = this.stationManager.agentInstances;
    this.agentManifests = this.stationManager.agentManifests;

    this.stationManager = app.plugins.get('StationManagerPlugin');
    this.stationInstances = this.stationManager.stationInstances;


    this.app.on("agentAdded", (agent) => this.instantiatePorts(agent));
    this.app.on("agentRemoved", (id) => this.destroyPorts(id));

   this.loadStyleSheet(new URL('./style.css', import.meta.url).href);

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  async instantiatePorts({id}) {

    const station = this.stationInstances.get(id);
    console.log(id, this.stationInstances, station)
    const manifest = this.agentManifests.get(station.agentType);
    const agent = this.agentInstances.get(id);


    const portRadius = 5;
    const angleDistance = 25

    const leftHemisphere = [];
    const rightHemisphere = [];




    for(const portData of manifest.node.inputs){
      const id = [station.id, 'port', 'input', portData.id].join('-');
      const angle = 0;
      leftHemisphere.push({id, stationId:station.id, angle, portData});
    }
    for(const property of manifest.node.properties){
      for(const portData of property.ports){
        const id = [station.id, 'port', 'property', property.id, 'port', portData.id].join('-');
        const angle = 0;
        leftHemisphere.push({id, stationId:station.id, angle, portData});
      }
    }
    for(const portData of manifest.node.outputs){
      const id = [station.id, 'port', 'input', portData.id].join('-');
      const angle = 0;
      rightHemisphere.push({id, stationId:station.id, angle, portData});
    }


    // Assign Port Angles
    const leftHemisphereStart = 180 -  (((leftHemisphere.length-1)*angleDistance)/2);
    for(let i = 0; i<leftHemisphere.length;i++){
      leftHemisphere[i].angle = leftHemisphereStart + i*angleDistance;
    }

    const rightHemisphereStart =  0  - (((rightHemisphere.length-1)*angleDistance)/2);
    for(let i = 0; i<rightHemisphere.length;i++){
      rightHemisphere[i].angle = rightHemisphereStart + i*angleDistance;
    }


    const socket = document.createElementNS("http://www.w3.org/2000/svg", "g");
    socket.setAttribute("class", "socket");
    socket.setAttribute("data-station-id", station.id);
    this.app.layers.ports.appendChild(socket);


    const ports = [];
    for(const port of [...leftHemisphere, ...rightHemisphere]){

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("class", "port-circle");
      circle.setAttribute("data-port-id", port.id);
      circle.setAttribute("data-port-station-id", station.id);
      circle.setAttribute("r", portRadius);

      station.subscribe(({x,y,r})=>{

        const {x:portX, y:portY} = this.placeCircleOnCircumference(port.angle, x,y,r*1.3);
        circle.setAttribute("cx", portX);
        circle.setAttribute("cy", portY);

      });

      circle.addEventListener("click",()=> this.eventDispatch("selectPort", port) );
      socket.appendChild(circle);

    }

    // this.portInstances.set(agentType, manifest);
    // this.eventDispatch('manifestAdded', manifest);

  }

  destroyPorts(stationId) {
    // const agent = portInstances.get(id);
    // agent.stop();
    // portInstances.delete(id);
      this.app.layers.ports.querySelector(`g.socket[data-station-id='${stationId}']`).remove();

  }


  placeCircleOnCircumference(angle, circleX, circleY, circleRadius) {

      // Convert the start angle from degrees to radians
      const angleInRadians = angle * (Math.PI / 180);

      // Calculate the x and y coordinates of the point on the circumference
      const x = circleX + circleRadius * Math.cos(angleInRadians);
      const y = circleY + circleRadius * Math.sin(angleInRadians);

     // Return the coordinates as an object for destructuring
      return { x, y };
  }

}
