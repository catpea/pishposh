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

  stationAddRequest(raw) {
    const station = this.newStation(raw);
    this.stationInstances.set(station.id, station);
    this.eventDispatch('stationAdded', station);
    return station;
  }
  stationRestore(options) {
    const station = this.newStation(options);
    this.stationInstances.set(station.id, station);
    this.eventDispatch('stationRestored', station);
    return station;
  }



  newStation(options){
    const station = new Station(options);
    // const unsubscribe = station.stream.debounce(500).subscribe(hello=>{
    //   console.info('HELLO', hello);
    //   // this.app.emit('stationUpdate', station)
    // })
    // this.subscriptions.add(unsubscribe);
    return station;
  }


}
