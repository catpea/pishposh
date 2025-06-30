import { Plugin } from "../../core/Plugin.js";
import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class ConnectionManagerPlugin extends Plugin {

  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = this.app.svg;

   this.loadStyleSheet(new URL('./style.css', import.meta.url).href);

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }




  // getStation(id) {
  //   if (!id) throw new Error("Station id is required to retrieve a station.");
  //   const station = this.stationInstances.get(id);
  //   if (!station) throw new Error(`No station found with id: ${id}`);
  //   return station;
  // }

}

/*
# USAGE
  this.stationManager = app.plugins.get('StationManager');
  this.stationManager.createStation({id:1, x:10, y:10, r:10})

  stationCreated
  stationRemoved

*/
