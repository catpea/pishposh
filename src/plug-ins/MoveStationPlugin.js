// MoveStationPlugin.js
export class MoveStationPlugin {
    constructor() {
        this.draggingStation = null;
        this.dragOffset = { x: 0, y: 0 };
    }

    init(app) {
        this.app = app;
        this.svg = app.svg;
        this.graph = app.graph;

        this.svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.svg.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.svg.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    onMouseDown(e) {
        if (this.app.tool !== 'select') return;

        const target = e.target.closest('.station-circle');
        if (!target) return;

        const id = target.dataset.stationId;
        const station = this.graph.nodes.get(id);
        if (!station) return;

        const pos = this.app.getMousePosition(e);
        this.draggingStation = station;
        this.dragOffset.x = pos.x - station.x.value;
        this.dragOffset.y = pos.y - station.y.value;

        this.svg.classList.add('dragging');
        e.stopPropagation();
    }

    onMouseMove(e) {
        if (!this.draggingStation || this.app.tool !== 'select') return;

        const pos = this.app.getMousePosition(e);
        const snapped = this.app.snapToGrid(pos.x - this.dragOffset.x, pos.y - this.dragOffset.y);

        this.draggingStation.x.value = snapped.x;
        this.draggingStation.y.value = snapped.y;
        e.stopPropagation();
    }

    onMouseUp(e) {
        if (!this.draggingStation) return;

        this.draggingStation = null;
        this.svg.classList.remove('dragging');
        e.stopPropagation();
    }
}
