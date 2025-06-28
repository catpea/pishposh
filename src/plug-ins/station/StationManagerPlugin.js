import { rid, ReactiveSignal as Signal, namedCombineLatest } from "../../core/Signal.js";

class Station {

  constructor({ id, x, y, r }) {
    this.#id = id ?? rid();

    // Warn if x, y, or r is missing
    if (x === undefined || y === undefined || r === undefined) {
      console.warn(`Station created with missing parameters: ${JSON.stringify({ x, y, r })}`);
    }

    this.x = x;
    this.y = y;
    this.r = r;
  }

  #id;
  get id(){ this.#id.value; }

  #x = new Signal(0);
  get x(){ return this.#x.value; }
  set x(v){ this.#x.value = v; }

  #y = new Signal(0);
  get y(){ return this.#y.value; }
  set y(v){ this.#y.value = v; }

  #r = new Signal(1);
  get r(){ return this.#r.value; }
  set r(v){ this.#r.value = v; }

  subscribe(subscriber){
    return namedCombineLatest({ x:this.#x, y:this.#y, r:this.#r }).subscribe(subscriber);
  }


}

export class StationManagerPlugin {
  app;
  stations;
  subscriptions;

  constructor() {
    this.subscriptions = new Set();
    this.stations = new Map();
  }

  init(app) {
    this.app = app;
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    console.info('eventDispatch', ...argv);
    this.app.emit(...argv);
  }

  createStation(options) {
    const station = new Station(options);
    this.stations.set(station.id, station);
    this.eventDispatch('stationCreated', station);
    return station;
  }

  removeStation(id) {
    if (!id) return console.warn("Attempted to remove a station without an id.");
    if (!this.stations.has(id)) return console.warn(`No station found with id: ${id}`);
    this.stations.delete(id);
    this.eventDispatch('stationRemoved', id);
  }

  getStation(id) {
    if (!id) throw new Error("Station id is required to retrieve a station.");
    const station = this.stations.get(id);
    if (!station) throw new Error(`No station found with id: ${id}`);
    return station;
  }
}

/*
# USAGE
  this.stationManager = app.plugins.get('StationManager');
  this.stationManager.createStation({id:1, x:10, y:10, r:10})

  stationCreated
  stationRemoved

*/
