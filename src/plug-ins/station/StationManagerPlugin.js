import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class StationManagerPlugin extends Plugin {

  app;
  stationInstances;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
    this.stationInstances = new Map();
  }

  init(app) {
    this.app = app;
    this.svg = this.app.svg;

   //  Event Mediation & Semantic Lifting
   // Recognize Clicks
   fromEvent(this.svg, 'worldclick')
    // .log(e=>e)
    .map(e=>({x:e.detail.worldX, y:e.detail.worldY}))
    .filter(()=>this.app.selectedTool.value == 'create')
    // .log( v=> `Adding station: ${JSON.stringify(v)}`)
    .subscribe(raw=>this.app.emit('stationAddRequest', raw))


   // console.log(import.meta.url)
   this.loadStyleSheet(new URL('./style.css', import.meta.url).href);

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }


}
