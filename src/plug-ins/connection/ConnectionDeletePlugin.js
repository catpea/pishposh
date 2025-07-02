export class ConnectionDeletePlugin {
  app;
  subscriptions;

  constructor() {
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    this.connectionManager = app.plugins.get('ConnectionManagerPlugin');
    this.connectionInstances = this.connectionManager.connectionInstances;

   this.app.emit('registerTool', {name:'disconnect',   data:{id:'disconnect-tool',   icon:'bi-scissors', iconSelected:'bi-scissors', description:'delete connection' }});

   // DELETE
   this.app.on('selectConnection', connection => (this.app.selectedTool.value == 'disconnect') && this.connectionRemove(connection.id));
   this.app.on('connectionRemove', id => this.connectionRemove(id) );

   this.app.on('stationRemoved', stationId => {


          this.connectionInstances.values().filter(({fromStationId})=>fromStationId===stationId)
       .forEach(({fromStationId})=>console.log('AAA', {fromStationId}));
          this.connectionInstances.values().filter(({toStationId})=>toStationId===stationId)
       .forEach(({toStationId})=>console.log('AAA', {toStationId}));


     this.connectionInstances.values().filter(({fromStationId})=>fromStationId===stationId).forEach(({id})=>this.connectionRemove(id));
     this.connectionInstances.values().filter(({toStationId})=>toStationId===stationId).forEach(({id})=>this.connectionRemove(id));



   });


  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    console.info('eventDispatch', ...argv);
    this.app.emit(...argv);
  }

  connectionRemove(id) {
    console.log('connectionRemove', id, this.connectionInstances.has(id));
    if (!id) return console.warn("Attempted to remove a connection without an id.");
    if (!this.connectionInstances.has(id)) return console.warn(`No connection found with id: ${id}`);
    this.connectionInstances.delete(id);
    this.eventDispatch('connectionRemoved', id);
  }

}
