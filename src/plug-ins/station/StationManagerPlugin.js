import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

class Station {

  constructor({ id, x, y, r=32 }) {
    this.#id = id || rid();

    // Warn if x, y, or r is missing
    if (x === undefined || y === undefined || r === undefined) {
      console.warn(`Station created with missing parameters: ${JSON.stringify({ x, y, r })}`);
    }

    this.x = x;
    this.y = y;
    this.r = r;

  }

  #id;
  get id(){ return this.#id; }

  #x = new Signal(0);
  get x(){ return this.#x.value; }
  set x(v){ this.#x.value = v; }

  #y = new Signal(0);
  get y(){ return this.#y.value; }
  set y(v){ this.#y.value = v; }

  #r = new Signal(1);
  get r(){ return this.#r.value; }
  set r(v){ this.#r.value = v; }

  toObject(){
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      r: this.r,
    }
  }

  subscribe(subscriber){
    return namedCombineLatest({ x:this.#x, y:this.#y, r:this.#r }).subscribe(subscriber);
  }


}

export class StationManagerPlugin {
  app;
  stationInstances;
  subscriptions;

  constructor() {
    this.subscriptions = new Set();
    this.stationInstances = new Map();
  }

  init(app) {
    this.app = app;
    this.svg = this.app.svg;

    fromEvent(this.svg, 'worldclick')
    .map(e=>({x:e.detail.worldX, y:e.detail.worldY}))
    .log( v=> `AAAAA fricken click was heard!', ${JSON.stringify(v)}`)
    // .subscribe( e=> this.app.emit('stationAdd', e) )
    .subscribe(e=>this.stationAdd(e))

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    console.info('eventDispatch', ...argv);
    this.app.emit(...argv);
  }

  stationAdd(options) {
    const station = new Station(options);
    console.log('AAA', station.id, {...station});
    this.stationInstances.set(station.id, station);
    this.eventDispatch('stationAdded', station.toObject());
    return station;
  }

  stationRemove(id) {
    if (!id) return console.warn("Attempted to remove a station without an id.");
    if (!this.stationInstances.has(id)) return console.warn(`No station found with id: ${id}`);
    this.stationInstances.delete(id);
    this.eventDispatch('stationRemoved', id);
  }

  getStation(id) {
    if (!id) throw new Error("Station id is required to retrieve a station.");
    const station = this.stationInstances.get(id);
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
