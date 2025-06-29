import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

class Station {

  // this allows for this[name] access
  #signalStorage = {};

  #defaults = {
    x:0,
    y:0,
    r:32,
    label: 'Untitled',
    type: 'station/plain',
  };

  #acceptable = [
    'id','x','y','r','label','type'
  ];

  #serializable = [
    'id','x','y','r','label','type'
  ]

  constructor(configure) {
    const enriched = Object.assign({}, this.#defaults, configure );
    const picked = this.#pick(this.#acceptable, enriched);
    console.log('constructor picked', picked);
    this.setup(picked);
  }

  // reusable creator used by deserializer and constructor
  setup(options){

    this.#signalStorage.id = new Signal(options.id??rid());
    this.#signalStorage.type = new Signal(options.type);
    this.#signalStorage.label = new Signal(options.label);
    this.#signalStorage.x = new Signal(options.x);
    this.#signalStorage.y = new Signal(options.y);
    this.#signalStorage.r = new Signal(options.r);
  }

  entries(){
    return this.#serializable.map(key=>[key, this.get(key)])
  }

  deserialize(data){
    const picked = this.#pick(this.#acceptable, data);
    this.setup(picked);
  }

  serialize(){
    const picked = this.#pick(this.#serializable, this);
    return picked
  }

  // Ease Of Access

  get id(){ return this.#signalStorage.id.value; } // hidden, unless asked

  get type(){ return this.#signalStorage.type.value; }
  set type(v){ this.#signalStorage.type.value = v; }

  get x(){ return this.#signalStorage.x.value; }
  set x(v){ this.#signalStorage.x.value = v; }

  get y(){ return this.#signalStorage.y.value; }
  set y(v){ this.#signalStorage.y.value = v; }

  get r(){ return this.#signalStorage.r.value; }
  set r(v){ this.#signalStorage.r.value = v; }

  get label(){ return this.#signalStorage.label.value; }
  set label(v){ this.#signalStorage.label.value = v; }

  get signals(){ return this.#signalStorage; } // station5.signals access

  get(name){
    // if(!this.#signalStorage[name])
    console.log('this.#signalStorage[name]', this.#signalStorage,name,this.#signalStorage[name])

    return this.#signalStorage[name].value;
  }

  set(name, value){
    this.#signalStorage[name].value = value;
  }

  // Subscription Tools

  signal(name, subscriber){ // station6('x', fn)
    return this.#signalStorage[name].subscribe(subscriber);
  }

  subscribe(subscriber){
    return namedCombineLatest(this.#signalStorage).subscribe(subscriber);
  }

  // Helper & Utility Functions
  #pick(keys, data){
    const entries = (data.entries?data.entries():Object.entries(data));
    console.log('entries', entries)
    const cleared = entries.filter(([k,v])=>keys.includes(k));
    console.log('cleared', cleared)
    return Object.fromEntries(cleared);
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


   //  Event Mediation & Semantic Lifting

   // Recognize Clicks
   fromEvent(this.svg, 'worldclick')
    .map(e=>({x:e.detail.worldX, y:e.detail.worldY}))
    .log( v=> `Adding station: ${JSON.stringify(v)}`)
    .subscribe(raw=>this.app.emit('stationAddRequest', raw))

   // React to the addition
   this.app.on('stationAddRequest', raw => this.stationAddRequest(raw) );
   this.app.on('stationRemove', id => this.stationRemove(id) );
   this.app.on('stationRestore', deserialized => this.stationRestore(deserialized) );

   // this.app.emit('startRestore');


  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    console.info('eventDispatch', ...argv);
    this.app.emit(...argv);
  }

  stationAddRequest(raw) {
    const station = new Station(raw);
    this.stationInstances.set(station.id, station);
    this.eventDispatch('stationAdded', station);
    return station;
  }

  stationRestore(options) {
    console.log('stationRestore')

    const station = new Station(options);
    this.stationInstances.set(station.id, station);
    this.eventDispatch('stationRestored', station);
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
