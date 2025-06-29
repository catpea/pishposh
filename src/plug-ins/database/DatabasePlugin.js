import { rid, ReactiveSignal as Signal, namedCombineLatest } from "../../core/Signal.js";
import { StoredMap } from './StoredMap.js';

export class DatabasePlugin {
  app;

  stations;
  subscriptions;

  constructor() {
  this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;

    // this.databases = new StoredMap(null, {prefix: 'pishposh-databases'});

    this.pishposhStations = new StoredMap(null, {prefix: 'pishposh-stations'});
    this.app.on('stationAdded', data => this.pishposhStations.set(data.id, data));
    this.app.on('stationRemoved', id => this.pishposhStations.delete(id));

    this.pishposhPorts = new StoredMap(null, {prefix: 'pishposh-ports'});
    this.app.on('portAdded', conn => this.pishposhPorts.set(data.id, data));
    this.app.on('portRemoved', id => this.pishposhPorts.delete(id));

    this.pishposhConnections = new StoredMap(null, {prefix: 'pishposh-connections'});
    this.app.on('connectionAdded', data => this.pishposhConnections.set(data.id, data));
    this.app.on('connectionRemoved', id => this.pishposhConnections.delete(id));

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
