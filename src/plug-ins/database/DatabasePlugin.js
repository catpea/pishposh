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
    console.info('eventDispatch', ...argv);
    this.app.emit(...argv);
  }

  startRestore(){

    // this.databases = new StoredMap(null, {prefix: 'pishposh-databases'});

    this.pishposhStations = new PersistentMap(null, {prefix: 'pishposh-stations', onRestored:db=>db.forEach((v,k)=>this.app.emit('stationRestore', v))});

    this.app.on('stationAdded', data => this.pishposhStations.set(data.id, data.serialize()));
    this.app.on('stationUpdated', data => this.pishposhStations.set(data.id, data.serialize()));
    this.app.on('stationRemoved', id => this.pishposhStations.delete(id));

    // this.pishposhPorts = new PersistentMap(null, {prefix: 'pishposh-ports', onRestored:db=>db.forEach((v,k)=>this.app.emit('portRestore', v))});
    // this.app.on('portAdded', data => this.pishposhPorts.set(data.id, data.serialize()));
    // this.app.on('portRemoved', id => this.pishposhPorts.delete(id));

    // this.pishposhConnections = new PersistentMap(null, {prefix: 'pishposh-connections', onRestored:db=>db.forEach((v,k)=>this.app.emit('connectionRestore', v))});















    // NOTE: fromId, toId are just from the connection data in the Map
    const restoreOrchestrator = ({fromId, toId}) => {
      console.log('restoreOrchestratorX', fromId, toId);

      const expectData = new Map();
      expectData.set(fromId, this.portInstances.has(fromId));
      expectData.set(toId, this.portInstances.has(toId));

      console.log(expectData.values())

      const test = () => {

        for (const value of expectData.values()) {
      console.log('restoreOrchestrator test!!!', value )

          if (value !== true) return false; // exit early, data was not there.
        }
        return true;
      };

      if(test()) return true; // sync test, best case scenario
      console.log('restoreOrchestrator did not return early, proceeding to emitter payload!', test())


      const emitter = new StreamEmitter();

      let unsubscribe = this.app.on('portAdded', ({id})=>{
      console.log('BBB restoreOrchestrator portsAdded!', id)


        if(expectData.has(id)){
          console.warn('MATCH', id );
          expectData.set(id, true);
          //retest
          console.warn('RETEST!', test())
          if(test()) emitter.emit("output", 'connectionRestore'); // SENDING EVENT NAME this means we got what we need
        }

      });

      emitter.subscriptions.add(unsubscribe); // .terminate will take care of this

      return emitter; //  wait until either ttl or emitter emits output, true... then .terminate() emitter;

    };

    this.pishposhConnections = new PersistentMap(null, {prefix: 'pishposh-connections', onRestored:db=>db.forEach((v,k)=>this.app.deferredEmit('connectionRestore', v, restoreOrchestrator, 1000, (eventName, eventData, ttl, error) => console.error(`Failed to emit ${eventName} within ${ttl}ms`, error)))});
    this.app.on('connectionAdded', data => this.pishposhConnections.set(data.id, data.serialize()));
    this.app.on('connectionRemoved', id => this.pishposhConnections.delete(id));



}



}
