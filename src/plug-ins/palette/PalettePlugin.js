import { Plugin } from "../../core/Plugin.js";
import { take } from "../../core/Utils.js";
import { ReactiveSignal as Signal } from "../../core/Signal.js";
// import { PersistentMap } from "./PersistentMap.js";

export class PalettePlugin extends Plugin {
  app;

  stations;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    console.log(this.app.plugins)
    this.workbenchPlugin = this.app.plugins.get('WorkbenchPlugin');
    this.engine = this.workbenchPlugin.engine;



    this.uiContainerElement = document.querySelector('#ui-container > .start-side');
    const htmlContent = `
      <div class="palette rounded shadow">
        <div id="palette-list-toolbox" class="palette-body">
        </div>
      </div>
    `;
    const divElement = document.createElement("div");
    divElement.innerHTML = htmlContent;
    this.uiContainerElement.appendChild(divElement);
    this.toolListElement = divElement.querySelector('#palette-list-toolbox');

    if(!this.app.palette) this.app.palette = {};

    this.app.on('registerAgent', ({name: agentName, data: agentData})=>{

      const id = agentData.id;
      this.app.palette[agentName] = agentData;
      this.renderAgents();

    });

    const testList = 'palette plug person-arms-up airplane-engines alarm backpack bank bandaid beaker box2-heart brightness-high bug cake2 camera capsule cassette cloud cone cpu cup-hot postage speaker moon lightning lightbulb hospital fuel-pump flask-florence floppy eye'.split(' ');
    for(const name of testList){
      this.app.emit('registerAgent', {name:`${name}`,   data:{id:`${name}-agent`,   icon:`bi-${name}`, description:`${name} agent`, type:'basic/pass-through' }});
    }





    this.app.svg.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });

    this.app.svg.addEventListener("drop", (e) => {
      e.preventDefault();
      const agentType = e.dataTransfer.getData("application/agent-type");
      const agentName = e.dataTransfer.getData("application/agent-name");


      const {x,y} = this.engine.clientToWorld(e.clientX, e.clientY);


      // this will trigger this.graph.on('nodeAdded...
      const node = this.app.graph.addNode({ x , y , type: agentType, label: agentName });
      const raw = {
        x,y,
        // label: agentName,
        agentType
      };
      this.app.emit("stationAddRequest", raw);
    });




    this.loadStyleSheet(new URL('./style.css', import.meta.url).href);

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv) {
    console.info("eventDispatch", ...argv);
    this.app.emit(...argv);
  }

  renderAgents(){

    // clear toolbox
    this.toolListElement.replaceChildren();

    for(const agentList of take(Object.entries(this.app.palette), 3)){
      const row = document.createElement("div");
      row.classList.add('row')
      for(const [name, data] of agentList){
        const col = document.createElement("div");
        col.classList.add('col');
        // col.style.textAlign = 'center';
        const toolElement = this.renderTool(name, data);
        col.appendChild(toolElement);
        row.appendChild(col);
      }
      this.toolListElement.appendChild(row);
    }


  } // renderTools

  renderTool(agentName, agentData){

      const agentButton = document.createElement("span");

      agentButton.classList.add('agent', 'agent-sm');
      agentButton.setAttribute('title', agentData.description);

      agentButton.setAttribute("draggable", "true");
      agentButton.addEventListener("dragstart", (e) => {
        console.log(e)
        e.dataTransfer.setData("text/plain", agentData.type);
        e.dataTransfer.setData("application/agent-name", agentName);
        e.dataTransfer.setData("application/agent-type", agentData.type);
        e.dataTransfer.effectAllowed = "copy";
      });

      const agentIcon = document.createElement("i");
      agentButton.classList.add('bi', agentData.icon);
      agentButton.appendChild(agentIcon);
      return agentButton;
  }

} // class
