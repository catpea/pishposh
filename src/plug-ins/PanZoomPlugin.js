import { getVisibleBounds } from '../core/Utils.js';


// PanZoomPlugin.js
export class PanZoomPlugin {
    constructor() {
        this.isPanning = false;
        this.lastScreenPos = null;
    }

    init(app) {
        this.app = app;
        this.svg = app.svg;

        this.svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.svg.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.svg.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.svg.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    }

    onMouseDown(e) {

        const tool = this.app.tool;
        if (tool !== 'select') return;

      console.log('onMouseDown',  tool);
      console.log('onMouseDown', e );
        if (e.target === this.svg || e.target.parentNode === this.svg) {
            this.isPanning = true;
            this.lastScreenPos = { x: e.clientX, y: e.clientY };
            this.svg.classList.add('dragging');
        }
    }

    onMouseMove(e) {
        if (!this.isPanning || !this.lastScreenPos) return;

        const dx = e.clientX - this.lastScreenPos.x;
        const dy = e.clientY - this.lastScreenPos.y;

        // const rect = this.svg.getBoundingClientRect();
        const rect = getVisibleBounds(this.svg);

        const vb = this.app.viewBox;

        const scaleX = vb.width / rect.width;
        const scaleY = vb.height / rect.height;

        vb.x -= dx * scaleX;
        vb.y -= dy * scaleY;

        this.app.emit('viewBoxChanged');


        this.lastScreenPos = { x: e.clientX, y: e.clientY };
    }

    onMouseUp() {
        if (this.isPanning) {
            this.isPanning = false;
            this.lastScreenPos = null;
            this.svg.classList.remove('dragging');
        }
    }

    onWheel(e) {
        e.preventDefault();
        const mousePosition = this.getMousePosition(e);
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        this.zoomAt(mousePosition.x, mousePosition.y, zoomFactor);
        this.app.emit('viewBoxChanged');

    }

    getSVGCoords(e) {
        // const rect = this.svg.getBoundingClientRect();
        const rect =  getVisibleBounds(this.svg);

        const vb = this.app.viewBox;

        const x = ((e.clientX - rect.left) / rect.width) * vb.width + vb.x;
        const y = ((e.clientY - rect.top) / rect.height) * vb.height + vb.y;

        return { x, y };
    }



    zoomAt(x, y, factor) {
        const vb = this.app.viewBox;

        const newWidth = vb.width * factor;
        const newHeight = vb.height * factor;

        vb.x += (vb.width - newWidth) * ((x - vb.x) / vb.width);
        vb.y += (vb.height - newHeight) * ((y - vb.y) / vb.height);
        vb.width = newWidth;
        vb.height = newHeight;

        // this.zoom = 1200 / vb.width;
        // this.svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);


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

}
