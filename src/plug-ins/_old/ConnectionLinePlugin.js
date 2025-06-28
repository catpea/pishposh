export class ConnectionLinePlugin {
    constructor() {
        this.toolId = 'connect';
    }

    init(app) {
        this.app = app;
        this.svg = app.svg;
        this.graph = app.graph;
        this.layers = app.layers;

        this.graph.on('connectionAdded', conn => this.renderConnection(conn));
        this.graph.on('connectionRemoved', conn => this.removeConnection(conn));
    }

    renderConnection(connection) {
        const from = this.graph.nodes.get(connection.fromId);
        const to = this.graph.nodes.get(connection.toId);
        if (!from || !to) return;

        const pathId = `path-${connection.id}`;

        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('id', pathId);
        path.setAttribute('class', 'connection-path');

        path.setAttribute('data-connection-id', connection.id);

        const updatePath = () => {
            path.setAttribute('d', `M ${from.x.value},${from.y.value} L ${to.x.value},${to.y.value}`);
        };

        updatePath();

        // Create label elements
        const createDynamicLabel = (initial, anchor) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'connection-label');
            text.setAttribute('data-connection-id', connection.id);
            text.setAttribute('text-anchor', anchor);

            const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
            textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${pathId}`);
            textPath.textContent = initial;

            text.appendChild(textPath);
            return { text, textPath };
        };

        const { text: startText, textPath: startTP } = createDynamicLabel(connection.startLabel?.value ?? '', 'start');
        const { text: midText, textPath: midTP } = createDynamicLabel(connection.label?.value ?? '', 'middle');
        const { text: endText, textPath: endTP } = createDynamicLabel(connection.endLabel?.value ?? '', 'end');

        endText.style.textAnchor = 'end';

        // Add to DOM
        this.layers.connections.appendChild(path);
        this.layers.labels.appendChild(startText);
        this.layers.labels.appendChild(midText);
        this.layers.labels.appendChild(endText);

        // Select connection
        path.addEventListener('click', e => {
            e.stopPropagation();
            this.app.emit('selectConnection', connection);
        });

        const updateOffsets = () => {
            requestAnimationFrame(() => {
                const totalLength = path.getTotalLength();
                const aestheticSidePadding = 18;
                startTP.setAttribute('startOffset', `${Math.max(0, aestheticSidePadding)}px`);
                midTP.setAttribute('startOffset', `50%`);
                endTP.setAttribute('startOffset', `${Math.max(0, totalLength - aestheticSidePadding)}px`);
            });
        };

        const updateAll = () => {
            updatePath();
            updateOffsets();
        };

        // Subscribe position changes
        from.x.subscribe(updateAll);
        from.y.subscribe(updateAll);
        to.x.subscribe(updateAll);
        to.y.subscribe(updateAll);

        // Text updates
        connection.label?.subscribe(text => {
            midTP.textContent = text;
            updateOffsets();
        });

        connection.startLabel?.subscribe?.(text => {
            startTP.textContent = text;
            updateOffsets();
        });

        connection.endLabel?.subscribe?.(text => {
            endTP.textContent = text;
            updateOffsets();
        });

        // Initial offset position
        updateOffsets();
    }

    removeConnection(connection) {
        const id = connection.id;
        const path = this.svg.querySelector(`.connection-path[data-connection-id="${id}"]`);
        const labels = this.svg.querySelectorAll(`.connection-label[data-connection-id="${id}"]`);
        if (path) path.remove();
        labels.forEach(el => el.remove());
    }
}
