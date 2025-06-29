import { rid, ReactiveSignal as Signal, fromEvent, namedCombineLatest } from "../../core/Signal.js";

export class StationVisualizationPlugin {
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

    this.app.on('stationAdded', station => this.renderStation(station) );


  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    console.info('eventDispatch', ...argv);
    this.app.emit(...argv);
  }

  renderStation(station){
    console.warn('RENDERING STATION!', station)
  }


}

/*
# USAGE
  this.stationManager = app.plugins.get('StationManager');
  this.stationManager.createStation({id:1, x:10, y:10, r:10})


*/
