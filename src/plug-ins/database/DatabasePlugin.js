import { rid, ReactiveSignal as Signal, namedCombineLatest } from "../../core/Signal.js";
import { PersistentMap } from './PersistentMap.js';

export class DatabasePlugin {
  app;

  stations;
  subscriptions;

  constructor() {
  this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.startRestore()
    // this.app.on('startRestore', ()=>this.startRestore())
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    console.info('eventDispatch', ...argv);
    this.app.emit(...argv);
  }

  startRestore(){

    // this.databases = new StoredMap(null, {prefix: 'pishposh-databases'});

    this.pishposhStations = new PersistentMap(null, {prefix: 'pishposh-stations', onRestored:db=>db.forEach((v,k)=>this.app.emit('stationRestore', v))});

    this.app.on('stationAdded', data => this.pishposhStations.set(data.id, data.serialize()));
    this.app.on('stationUpdated', data => this.pishposhStations.set(data.id, data.serialize()));
    this.app.on('stationRemoved', id => this.pishposhStations.delete(id));

    this.pishposhPorts = new PersistentMap(null, {prefix: 'pishposh-ports', onRestored:db=>db.forEach((v,k)=>this.app.emit('portRestore', v))});
    this.app.on('portAdded', data => this.pishposhPorts.set(data.id, data.serialize()));
    this.app.on('portRemoved', id => this.pishposhPorts.delete(id));

    this.pishposhConnections = new PersistentMap(null, {prefix: 'pishposh-connections', onRestored:db=>db.forEach((v,k)=>this.app.emit('connectionRestore', v))});
    this.app.on('connectionAdded', data => this.pishposhConnections.set(data.id, data.serialize()));
    this.app.on('connectionRemoved', id => this.pishposhConnections.delete(id));

  }

}
