// ConnectionLinePlugin.js
export class ConnectionLinePlugin {
    constructor() {
        this.toolId = 'connect'; // For clarity, but this plugin doesn’t handle tool logic
    }

    init(app) {
        this.app = app;
        this.svg = app.svg;
        this.graph = app.graph;
        this.layers = app.layers;

        this.graph.on('connectionAdded', this.renderConnection.bind(this));
        this.graph.on('connectionRemoved', this.removeConnection.bind(this));
    }

    renderConnection(connection) {
        const from = this.graph.nodes.get(connection.fromId);
        const to = this.graph.nodes.get(connection.toId);
        if (!from || !to) return;

        // Line Element
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'connection-line');
        line.setAttribute('data-connection-id', connection.id);
        line.setAttribute('x1', from.x.value);
        line.setAttribute('y1', from.y.value);
        line.setAttribute('x2', to.x.value);
        line.setAttribute('y2', to.y.value);
        line.setAttribute('stroke', '#4caf50');
        line.setAttribute('stroke-width', 3);
        line.setAttribute('stroke-linecap', 'round');

        // Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('class', 'label-text connection-label');
        label.setAttribute('data-connection-id', connection.id);
        label.textContent = connection.label.value;

        const updateLabelPos = () => {
            const midX = (from.x.value + to.x.value) / 2;
            const midY = (from.y.value + to.y.value) / 2;
            label.setAttribute('x', midX);
            label.setAttribute('y', midY);
        };

        updateLabelPos();

        // Append to layers
        this.layers.connections.appendChild(line);
        this.layers.labels.appendChild(label);

        // Event: Select
        line.addEventListener('click', e => {
            e.stopPropagation();
            this.app.emit('selectConnection', connection);
        });

        // Reactive updates
        const updateLine = () => {
            line.setAttribute('x1', from.x.value);
            line.setAttribute('y1', from.y.value);
            line.setAttribute('x2', to.x.value);
            line.setAttribute('y2', to.y.value);
            updateLabelPos();
        };

        from.x.subscribe(updateLine);
        from.y.subscribe(updateLine);
        to.x.subscribe(updateLine);
        to.y.subscribe(updateLine);

        connection.label.subscribe(labelText => {
            label.textContent = labelText;
        });
    }

    removeConnection(connection) {
        const line = this.svg.querySelector(`.connection-line[data-connection-id="${connection.id}"]`);
        const label = this.svg.querySelector(`.connection-label[data-connection-id="${connection.id}"]`);
        if (line) line.remove();
        if (label) label.remove();
    }
}
