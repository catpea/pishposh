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

        const rect = this.svg.getBoundingClientRect();
        const vb = this.app.viewBox;

        const scaleX = vb.width / rect.width;
        const scaleY = vb.height / rect.height;

        vb.x -= dx * scaleX;
        vb.y -= dy * scaleY;

        this.app.updateViewBox();

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

        const svgPoint = this.getSVGCoords(e);
        const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
        const vb = this.app.viewBox;

        const newWidth = vb.width * zoomFactor;
        const newHeight = vb.height * zoomFactor;

        vb.x += (vb.width - newWidth) * ((svgPoint.x - vb.x) / vb.width);
        vb.y += (vb.height - newHeight) * ((svgPoint.y - vb.y) / vb.height);

        vb.width = newWidth;
        vb.height = newHeight;

        this.app.updateViewBox();
    }

    getSVGCoords(e) {
        const rect = this.svg.getBoundingClientRect();
        const vb = this.app.viewBox;

        const x = ((e.clientX - rect.left) / rect.width) * vb.width + vb.x;
        const y = ((e.clientY - rect.top) / rect.height) * vb.height + vb.y;

        return { x, y };
    }
}
