export class StationDeletePlugin {
  app;
  subscriptions;

  constructor() {
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    this.stationManager = app.plugins.get('StationManagerPlugin');
    this.stationInstances = this.stationManager.stationInstances;

   this.app.emit('registerTool', {name:'delete',   data:{id:'delete-tool',   icon:'bi-trash', iconSelected:'bi-trash-fill', description:'delete item' }});

   // DELETE
   this.app.on('selectNode', station => (this.app.selectedTool.value == 'delete') && this.stationRemove(station.id));
   this.app.on('stationRemove', id => this.stationRemove(id) );

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    console.info('eventDispatch', ...argv);
    this.app.emit(...argv);
  }

  stationRemove(id) {
    console.log('stationRemove',id, this.stationInstances.has(id));
    if (!id) return console.warn("Attempted to remove a station without an id.");
    if (!this.stationInstances.has(id)) return console.warn(`No station found with id: ${id}`);
    this.stationInstances.delete(id);
    this.eventDispatch('stationRemoved', id);
  }

}
