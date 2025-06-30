import { rid, ReactiveSignal as Signal, fromEvent, namedCombineLatest } from "../../core/Signal.js";
import { PanZoomEngine } from "./PanZoomEngine.js";
import { InteractionEvents } from './plug-ins/InteractionEvents.js';

import { InteractionMousePlugin } from './plug-ins/InteractionMousePlugin.js';
import { InteractionWheelPlugin } from './plug-ins/InteractionWheelPlugin.js';
import { InteractionTouchMovePlugin } from './plug-ins/InteractionTouchMovePlugin.js';
import { ResizeObserverPlugin } from './plug-ins/ResizeObserverPlugin.js';
import { InteractionTouchPinchPlugin } from './plug-ins/InteractionTouchPinchPlugin.js';
import { HudPlugin } from './plug-ins/HudPlugin.js';
import { GridBackgroundPlugin } from './plug-ins/GridBackgroundPlugin.js';
import { PointerTrackingPlugin } from './plug-ins/PointerTrackingPlugin.js';


export class WorkbenchPlugin {
  app;
  stations;
  subscriptions;

  constructor() {
    this.subscriptions = new Set();
    this.stations = new Map();
  }

  init(app) {

    this.app = app;
    this.svg = app.svg;

    const myTool = {name:'panZoom',  data:{id:'pan-zoom-tool', icon:'bi-binoculars', iconSelected:'bi-binoculars-fill', description:'pan and zoom' }};
    this.app.emit('registerTool', myTool);
    this.app.emit('selectTool', myTool.name);


    // Initialize the engine and plugins
    this.engine = new PanZoomEngine(this.app, this.svg);

    // CRITICAL: ResizeObserverPlugin Must be first!
    this.engine.use(new ResizeObserverPlugin());
    this.engine.use(new InteractionEvents());

    // Add all interaction plugins
    this.engine
      .use(new PointerTrackingPlugin())
      .use(new InteractionMousePlugin())
      .use(new InteractionWheelPlugin())
      .use(new InteractionTouchMovePlugin())
      .use(new InteractionTouchPinchPlugin())
      .use(new HudPlugin());

    const gridPlugin = new GridBackgroundPlugin({
      dotRadius: 0.5,
      gridSize: 20,
      dotColor: 'var(--base0)',
      minOpacity: 0.2,
      maxOpacity: 0.8,
      opacityThreshold: 0.7
    });

    this.engine.use(gridPlugin);

    this.engine.start();

    // fromEvent(this.svg, 'click')
    //   .map(e => ({ e: e, x: e.clientX, y: e.clientY }))
    //   .subscribe(({x,y})=>{

    //   });

  }

  stop() {

    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  eventDispatch(...argv){
    console.info('eventDispatch', ...argv);
    this.app.emit(...argv);
  }

  ////////////////


}

/*
# USAGE
  this.stationManager = app.plugins.get('StationManager');
  this.stationManager.createStation({id:1, x:10, y:10, r:10})


*/
