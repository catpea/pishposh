import { Station } from './lib/Station.js';

export class StationCreatePlugin {
  app;
  subscriptions;

  constructor() {
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    this.stationManager = this.app.plugins.get('StationManagerPlugin');
    this.stationInstances = this.stationManager.stationInstances;

    this.app.emit('registerTool', {name:'create',  data:{id:'create-tool',  icon:'bi-node-plus', iconSelected:'bi-node-plus-fill', description:'create items' }});

    this.app.on('stationAddRequest', raw => this.stationAddRequest(raw) );
    this.app.on('stationRestore', deserialized => this.stationRestore(deserialized) );

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    this.app.emit(...argv);
  }

  async stationAddRequest(raw) {
    const station = new Station(raw);
    this.stationInstances.set(station.id, station);
    this.eventDispatch('stationAdded', station);
    return station;
  }

  async stationRestore(options) {
    const station = new Station(options);
    this.stationInstances.set(station.id, station);
    this.eventDispatch('stationRestored', station);
    return station;
  }



}
