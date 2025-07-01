// SubwayMapBuilder.js
import { ReactiveEmitter as EventEmitter,   ReactiveSignal as Signal } from "./core/Signal.js";
import { Graph } from './core/Graph.js';
import { getVisibleBounds } from './core/Utils.js';

export class Application extends EventEmitter {
    constructor(svgElement) {
        super();

        // All Plugins Use This
        this.tool = new Signal();

        this.svg = svgElement;
        this.viewBox = { x: 0, y: 0, width: 1200, height: 800 };
        this.zoom = 1;

        this.tools = {};

        this.layers = {
          grid: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          connections: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          stations: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          labels: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          temp: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
        };

        this.plugins = new Map();
        this.graph = new Graph();

        this.init();
    }

    init() {

      this.on('viewBoxChanged', ()=>{
        this.updateViewBox();
      });






        const viewport = this.svg.querySelector('#viewport');

        Object.values(this.layers).forEach(layer => viewport.appendChild(layer));
        this.updateViewBox();




    }

    use(plugin) {

        plugin.init(this);

        // Store the plugin in plugins set for easy lookup.
        /*
        Example:
          this.somePlugin = app.plugins.get('SomePlugin');
          this.somePlugin.poke()
        */
        const pluginName = plugin.constructor.name;
        this.plugins.set(pluginName, plugin);


    }

    updateViewBox() {
        this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
    }

    // getMousePosition(e) {
    //     const rect = this.svg.getBoundingClientRect();
    //     const viewBox = this.svg.viewBox.baseVal;

    //     // Calculate aspect ratios
    //     const viewportAspect = rect.width / rect.height;
    //     const viewBoxAspect = viewBox.width / viewBox.height;

    //     let scaleX, scaleY, offsetX = 0, offsetY = 0;

    //     if (viewportAspect > viewBoxAspect) {
    //         // Viewport is wider - letterboxing on sides
    //         scaleY = viewBox.height / rect.height;
    //         scaleX = scaleY;
    //         const scaledWidth = viewBox.width / scaleX;
    //         offsetX = (rect.width - scaledWidth) / 2;
    //     } else {
    //         // Viewport is taller - letterboxing on top/bottom
    //         scaleX = viewBox.width / rect.width;
    //         scaleY = scaleX;
    //         const scaledHeight = viewBox.height / scaleY;
    //         offsetY = (rect.height - scaledHeight) / 2;
    //     }

    //     // Convert client coordinates to SVG coordinates
    //     const x = (e.clientX - rect.left - offsetX) * scaleX + viewBox.x;
    //     const y = (e.clientY - rect.top - offsetY) * scaleY + viewBox.y;

    //     return { x, y };
    // }


}
