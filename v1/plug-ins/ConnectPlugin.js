// ConnectPlugin.js

export class ConnectPlugin {

    constructor() {
        this.isConnecting = false;
        this.fromStationId = null;
        this.tempLine = null;

    }

    init(app) {
        this.app = app;
        this.graph = app.graph;

        this.app.on('toolSelected', tool => {
            this.active = tool === 'connect';
        });

        this.app.svg.addEventListener('mousedown', e => this.onMouseDown(e));
        this.app.svg.addEventListener('mousemove', e => this.onMouseMove(e));
        this.app.svg.addEventListener('mouseup', e => this.onMouseUp(e));
    }

    onMouseDown(e) {
        this.l('active = ', this.active, e.target.classList, e.target.dataset);

        if (!this.active) return;
        if (!e.target.classList.contains('station-circle')) return;

        const stationId = e.target.dataset.stationId;
        const station = this.graph.nodes.get(stationId);
        this.l('station', stationId, station)
        if (!station) return;

        this.isConnecting = true;
        this.fromStationId = stationId;

        const fromPos = { x: station.x.value, y: station.y.value };
        this.tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        this.tempLine.setAttribute('class', 'temp-line');
        this.tempLine.setAttribute('x1', fromPos.x);
        this.tempLine.setAttribute('y1', fromPos.y);
        this.tempLine.setAttribute('x2', fromPos.x);
        this.tempLine.setAttribute('y2', fromPos.y);

        this.app.layers.temp.appendChild(this.tempLine);
    }

    onMouseMove(e) {
        if (!this.active || !this.isConnecting || !this.tempLine) return;
        const pos = this.app.getMousePosition(e);
        this.tempLine.setAttribute('x2', pos.x);
        this.tempLine.setAttribute('y2', pos.y);
    }

    onMouseUp(e) {
        if (!this.active || !this.isConnecting) return;

        if (e.target.classList.contains('station-circle')) {

            const toStationId = e.target.dataset.stationId;
            if (toStationId !== this.fromStationId) {

                this.app.emit('beforeConnectionCreate', { from: this.fromStationId, to: toStationId });
                this.graph.addConnection(this.fromStationId, toStationId, 'ConnectionAgent');
            }
        }

        this.cleanup();
    }

    cleanup() {
        this.isConnecting = false;
        this.fromStationId = null;
        if (this.tempLine) {
            this.tempLine.remove();
            this.tempLine = null;
        }
    }

    l(...a){
      console.log(`${this.constructor.name}:`, ...a);
    }
}
