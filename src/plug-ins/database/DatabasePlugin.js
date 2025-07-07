import { rid, ReactiveSignal as Signal, namedCombineLatest, StreamEmitter } from "../../core/Signal.js";
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

    this.portManager = app.plugins.get('PortManagerPlugin');
    this.portInstances = this.portManager.portInstances;

    this.startRestore()
    // this.app.on('startRestore', ()=>this.startRestore())
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    this.app.emit(...argv);
  }

  startRestore(){

    //NOTICE: station gets {id, type} | metadata loads based on type | propertyKeys become available | recordStorage can now be pulled by key

    // keys for records are found in agent manifest files
    const records = new PersistentMap(null, {prefix: 'pishposh-records', onRestored:db=>db.forEach((v,k)=>this.app.emit('recordRestore', v))});
    this.records = records;
    this.app.on('recordAdded', data => this.records.set(data.id, data.serialize()));
    this.app.on('recordUpdated', data => this.records.set(data.id, data.serialize()));
    this.app.on('recordRemoved', id => this.records.delete(id));

    const restoreStationOrchestrator = async station => {
      if(!this.records.ready) await records.once('ready');
      if(!records.has(station.id)) records.set(station.id, {}); // the record was not in database, set a blank object and bail
      return true; // record is now present.
    };


    // stations must contain id that creates relations with all station data, and type, where we get our property names from
    // this.pishposhStations = new PersistentMap(null, {prefix: 'pishposh-stations', onRestored:db=>db.forEach((v,k)=>this.app.emit('stationRestore', v))});
    // this.pishposhStations = new PersistentMap(null, {prefix: 'pishposh-stations', onRestored:db=>db.forEach((v,k)=>this.app.emit('stationRestore', v))});
    this.stations = new PersistentMap(null, {prefix: 'pishposh-stations', onRestored:db=>db.forEach((v,k)=>this.app.deferredEmit('stationRestore', v, restoreStationOrchestrator, 1000, (eventName, eventData, ttl, error) => console.error(`Failed to emit ${eventName} within ${ttl}ms`, error)) )});

    this.app.on('stationAdded', data => this.stations.set(data.id, data.serialize()));
    this.app.on('stationUpdated', data => this.stations.set(data.id, data.serialize()));
    this.app.on('stationRemoved', id => this.stations.delete(id));

    this.app.on('stationAdded', data => records.set(data.id, {}));
    this.app.on('stationRemoved', id => records.delete(id));

    // What you see here is Applied Reactive Emitter Programming. Function being used is called deferredEmit
    // deferredEmit is part of the local EventEmitter system
    // NOTE: a connection cannot be restored until the nodes it connects are loaded!
    // NOTE: fromId, toId are just from the connection data in the Map
    const restoreConnectionOrchestrator = async ({id,  fromPortId,   toPortId}) => {

      console.log('ZZZ', {fromId: fromPortId, toId: toPortId})

      if(!this.records.ready) await records.once('ready');
      if(!records.has(id)) records.set(id, {}); // the record was not in database, set a blank object and bail

      const expectData = new Map();
      expectData.set(fromPortId, this.portInstances.has(fromPortId));
      expectData.set(toPortId, this.portInstances.has(toPortId));

      const test = () => {
        for (const value of expectData.values()) {
          if (value !== true) return false; // exit early, data was not there.
        }
        return true;
      };

      if(test()) return true; // sync test, best case scenario
      const emitter = new StreamEmitter();

      let unsubscribe = this.app.on('portAdded', ({id})=>{
        if(expectData.has(id)){
          expectData.set(id, true);
          //retest
          if(test()) emitter.emit("output", 'connectionRestore'); // SENDING EVENT NAME this means we got what we need
        }
      });
      emitter.subscriptions.add(unsubscribe); // .terminate will take care of this
      return emitter; //  wait until either ttl or emitter emits output, true... then .terminate() emitter;
    };

    this.connections = new PersistentMap(null, {prefix: 'pishposh-connections', onRestored:db=>db.forEach((v,k)=>this.app.deferredEmit('connectionRestore', v, restoreConnectionOrchestrator, 1000, (eventName, eventData, ttl, error) => console.error(`Failed to emit ${eventName} within ${ttl}ms`, error)) )});
    this.app.on('connectionAdded', data => this.connections.set(data.id, data.serialize()));
    this.app.on('connectionUpdated', data => this.connections.set(data.id, data.serialize()));
    this.app.on('connectionRemoved', id => this.connections.delete(id));

    this.app.on('connectionAdded', data => records.set(data.id, {}));
    this.app.on('connectionRemoved', id => records.delete(id));




}



}
