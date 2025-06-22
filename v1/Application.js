// SubwayMapBuilder.js
import { Events } from './core/Events.js';
import { Graph } from './core/Graph.js';
import { getVisibleBounds } from './utils/ViewUtils.js';




export class Application extends Events {
    constructor(svgElement) {
        super();

        this.tool = null;

        this.svg = svgElement;
        this.viewBox = { x: 0, y: 0, width: 1200, height: 800 };
        this.zoom = 1;
        this.tileSize = 40;

        this.layers = {
          grid: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          connections: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          stations: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          labels: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
          temp: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
        };

        this.plugins = [];
        this.graph = new Graph();

        this.init();
    }

    init() {

      this.on('toolSelected', toolId=>{
        console.info(toolId);
        this.tool = toolId;
      });

        Object.values(this.layers).forEach(layer => this.svg.appendChild(layer));
        this.updateViewBox();
        this.renderGrid();
    }

    use(plugin) {
        plugin.init(this);
        this.plugins.push(plugin);
    }

    updateViewBox() {
        this.svg.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);
        this.renderGrid();
    }

    renderGrid() {
        const gridLayer = this.layers.grid;
        gridLayer.innerHTML = '';

        const bounds = getVisibleBounds(this.svg);

        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('class', 'grid-background');
        background.setAttribute('x', bounds.left);
        background.setAttribute('y', bounds.top);
        background.setAttribute('width', bounds.width);
        background.setAttribute('height', bounds.height);
        gridLayer.appendChild(background);

        const startX = Math.floor(bounds.left / this.tileSize) * this.tileSize;
        const endX = Math.ceil(bounds.right / this.tileSize) * this.tileSize;
        const startY = Math.floor(bounds.top / this.tileSize) * this.tileSize;
        const endY = Math.ceil(bounds.bottom / this.tileSize) * this.tileSize;

        for (let x = startX; x <= endX; x += this.tileSize) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const isMajor = x % (this.tileSize * 5) === 0;
            line.setAttribute('class', isMajor ? 'grid-line-major' : 'grid-line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', x);
            line.setAttribute('y2', endY);
            gridLayer.appendChild(line);
        }

        for (let y = startY; y <= endY; y += this.tileSize) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const isMajor = y % (this.tileSize * 5) === 0;
            line.setAttribute('class', isMajor ? 'grid-line-major' : 'grid-line');
            line.setAttribute('x1', startX);
            line.setAttribute('y1', y);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', y);
            gridLayer.appendChild(line);
        }
    }


    getMousePosition(e) {
        const rect = this.svg.getBoundingClientRect();
        const viewBox = this.svg.viewBox.baseVal;

        // Calculate aspect ratios
        const viewportAspect = rect.width / rect.height;
        const viewBoxAspect = viewBox.width / viewBox.height;

        let scaleX, scaleY, offsetX = 0, offsetY = 0;

        if (viewportAspect > viewBoxAspect) {
            // Viewport is wider - letterboxing on sides
            scaleY = viewBox.height / rect.height;
            scaleX = scaleY;
            const scaledWidth = viewBox.width / scaleX;
            offsetX = (rect.width - scaledWidth) / 2;
        } else {
            // Viewport is taller - letterboxing on top/bottom
            scaleX = viewBox.width / rect.width;
            scaleY = scaleX;
            const scaledHeight = viewBox.height / scaleY;
            offsetY = (rect.height - scaledHeight) / 2;
        }

        // Convert client coordinates to SVG coordinates
        const x = (e.clientX - rect.left - offsetX) * scaleX + viewBox.x;
        const y = (e.clientY - rect.top - offsetY) * scaleY + viewBox.y;

        return { x, y };
    }
    snapToGrid(x, y) {
                return {
                    x: Math.round(x / this.tileSize) * this.tileSize,
                    y: Math.round(y / this.tileSize) * this.tileSize
                };
            }

}
