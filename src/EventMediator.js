import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "./core/Signal.js";

// Perform All Event Semantic Lifting Hele
export class EventMediator {
  constructor(app){
    this.app = app;

    // fromEvent(this.svg, 'worldclick')
    // .map(e=>({x:e.detail.worldX, y:e.detail.worldY}))
    // .log( v=> `Adding station: ${JSON.stringify(v)}`)
    // .subscribe(options=>this.app.emit('stationAdd', options))

    // this.app.on('stationAdd', options => this.stationAdd(options) );

  }
}
