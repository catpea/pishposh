import { rid, ReactiveSignal as Signal, fromEvent, namedCombineLatest } from "../../core/Signal.js";

export class StationCreationPlugin {
  app;
  stations;
  subscriptions;

  constructor() {
    this.subscriptions = new Set();
    this.stations = new Map();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    //     const stationManager = app.plugins.get('StationManagerPlugin');
    // const station = stationManager.createStation({x:10, y:11, r:12})
    // station.subscribe(obj=>console.log('Station Data', obj))

    // this.svg.addEventListener("click", this.handleClick.bind(this));

    fromEvent(this.svg, 'click').subscribe( e=>console.log('A fricken click was heard!', e) )

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    console.info('eventDispatch', ...argv);
    this.app.emit(...argv);
  }


}

/*
# USAGE
  this.stationManager = app.plugins.get('StationManager');
  this.stationManager.createStation({id:1, x:10, y:10, r:10})


*/
