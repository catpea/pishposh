// import { rid, ReactiveSignal as Signal, namedCombineLatest } from "../../core/Signal.js";
import { ReactiveSignal as Signal } from "../../core/Signal.js";
// import { PersistentMap } from "./PersistentMap.js";

export class ToolboxPlugin {
  app;

  stations;
  subscriptions;

  constructor() {
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    this.uiContainerElement = document.querySelector('#ui-container');
    const htmlContent = `
      <div class="toolbox snapped-top snapped-start rounded shadow" tabindex="-1" style="width: 4.21rem;">
        <div id="tool-list-toolbox" class="toolbox-body p-1" style="columns: 2; gap: .5rem;">
        </div>
      </div>
    `;
    const divElement = document.createElement("div");
    divElement.innerHTML = htmlContent;
    this.uiContainerElement.appendChild(divElement);
    this.toolListElement = divElement.querySelector('#tool-list-toolbox');

    if(!this.app.tools) this.app.tools = {};
    if(!this.app.selectedTool) this.app.selectedTool = new Signal('select');
    this.app.selectedTool.subscribe(selectedName=>{
        console.log('AAA this.app.selectedTool.subscribe', selectedName )

    });

    this.app.on('registerTool', ({name: toolName, data: toolData})=>{
      const id = toolData.id;
      this.app.tools[toolName] = toolData;

      const toolButton = document.createElement("button");
      toolButton.classList.add('btn', 'btn-sm');
      toolButton.setAttribute('title', 'Reset View');
      toolButton.addEventListener('click', ()=>this.eventDispatch('selectTool', toolName))

      const toolIcon = document.createElement("i");
      toolButton.classList.add('bi', toolData.icon);

      this.app.selectedTool.subscribe(selectedName=>{
        if(selectedName===toolName){
          toolButton.classList.add('active');
        }else{
          toolButton.classList.remove('active');
        }
      });

      this.app.selectedTool.subscribe(selectedName=>{
        if(selectedName===toolName){
          toolButton.classList.remove(toolData.icon);
          toolButton.classList.add(toolData.iconSelected);
        }else{
          toolButton.classList.remove(toolData.iconSelected);
          toolButton.classList.add(toolData.icon);
        }
      });


      toolButton.appendChild(toolIcon);

      this.toolListElement.appendChild(toolButton);

    });

    this.app.on('selectTool', toolId => {
      console.log('selectTool', toolId);
      if (!this.app.tools[toolId]) return console.error("No such tool", toolId);
      const dataToolIdentity = this.app.tools[toolId].id;
      this.svg.setAttribute("data-tool", dataToolIdentity);
      this.app.selectedTool.value=toolId;

    });

    this.app.emit('registerTool', {name:'select',   data:{id:'select-tool',  icon:'bi-cursor',  iconSelected:'bi-cursor-fill' }});
    this.app.emit('registerTool', {name:'move',     data:{id:'move-tool',  icon:'bi-arrows-move',  iconSelected:'bi-recycle' }});
    this.app.emit('registerTool', {name:'connect',  data:{id:'connect-tool', icon:'bi-diagram-2', iconSelected:'bi-diagram-3-fill' }});
    this.app.emit('registerTool', {name:'delete',   data:{id:'delete-tool',  icon:'bi-trash',   iconSelected:'bi-trash-fill' }});
    this.app.emit('registerTool', {name:'interact', data:{id:'interact-tool',  icon:'bi-hand-index-thumb',   iconSelected:'bi-hand-index-fill' }});
    this.app.emit('registerTool', {name:'comment',  data:{id:'interact-tool',  icon:'bi-pin-angle',   iconSelected:'bi-pin-fill' }});
    // this.app.emit('registerTool', {name:'zoomIn',  data:{id:'zoom-in-tool'}});
    // this.app.emit('registerTool', {name:'zoomOut', data:{id:'zoom-out-tool'}});

    this.app.emit('selectTool', 'select');

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv) {
    console.info("eventDispatch", ...argv);
    this.app.emit(...argv);
    console.log(this.app.tools)
  }

  appendToolbox(){



    /*
      <button class="btn btn-sm" title="Reset View" onclick="app.emit('switchTool','select')"><i class="bi bi-cursor"></i></button>
      <button class="btn btn-sm" title="Reset View" onclick="app.emit('switchTool','move')"><i class="bi bi-arrows-move"></i></button>
      <button class="btn btn-sm" title="Reset View" onclick="app.emit('switchTool','connect')"><i class="bi bi-bezier2"></i></button>
      <button class="btn btn-sm" title="Reset View" onclick="app.emit('switchTool','delete')"><i class="bi bi-trash"></i></button>
      <button class="btn btn-sm" title="Reset View" onclick="app.plugins.get('WorkbenchPlugin').engine.resetZoom()"><i class="bi bi-search"></i></button>
      <button class="btn btn-sm" title="Zoom In" onclick="app.emit('switchTool','zoomin')"; app.plugins.get('WorkbenchPlugin').engine.zoomIn()"><i class="bi bi-zoom-in"></i></button>
      <button class="btn btn-sm" title="Zoom Out" onclick="app.emit('switchTool','zoomout')"; app.plugins.get('WorkbenchPlugin').engine.zoomOut()"><i class="bi bi-zoom-out"></i></button>
      <button class="btn btn-sm" title=""><i class="bi bi-lock"></i></button>
      <button class="btn btn-sm" title=""><i class="bi bi-floppy"></i></button>
    */

  }

}
