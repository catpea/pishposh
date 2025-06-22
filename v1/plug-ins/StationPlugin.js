// StationPlugin.js
export class StationPlugin {
    constructor() {
        this.toolId = 'station';
    }

    init(app) {
        this.app = app;
        this.svg = app.svg;
        this.graph = app.graph;

        this.svg.addEventListener('click', this.handleClick.bind(this));

        // Listen for new stations to render
        this.graph.on('nodeAdded', this.renderStation.bind(this));
    }

    handleClick(e) {
        if (this.app.tool !== this.toolId || this.app.isDragging) return;

        const pos = this.app.getMousePosition(e);
        const snapped = this.app.snapToGrid(pos.x, pos.y);

        this.app.emit('beforeStationCreate', snapped);
        this.graph.addNode(snapped.x, snapped.y);
    }

    renderStation(station) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'station');
        group.setAttribute('data-station-id', station.id);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'station-circle');
        circle.setAttribute('data-station-id', station.id);
        circle.setAttribute('cx', station.x.value);
        circle.setAttribute('cy', station.y.value);
        circle.setAttribute('r', '12');

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('class', 'label-text station-label');
        label.setAttribute('x', station.x.value);
        label.setAttribute('y', station.y.value - 20);
        label.textContent = station.label.value;

        label.addEventListener('dblclick', () => {
            const newLabel = prompt('Enter station name:', station.label.value);
            if (newLabel !== null) {
                station.label.value = newLabel;
            }
        });

        group.appendChild(circle);
        this.app.layers.stations.appendChild(group);
        this.app.layers.labels.appendChild(label);

        station.x.subscribe(x => {
            circle.setAttribute('cx', x);
            label.setAttribute('x', x);
            // this.app.updateConnectionsForStation(station.id);
        });

        station.y.subscribe(y => {
            circle.setAttribute('cy', y);
            label.setAttribute('y', y - 20);
            // this.app.updateConnectionsForStation(station.id);
        });

        station.label.subscribe(newLabel => {
            label.textContent = newLabel;
        });
    }
}
