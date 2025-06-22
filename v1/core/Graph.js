// Graph.js
import { Signal } from './Signal.js';
import { Events } from './Events.js';

let nodeIdCounter = 1;
let connectionIdCounter = 1;

export class Graph extends Events {
    constructor() {
        super();
        this.nodes = new Map();
        this.connections = new Set();
    }

    addNode(x, y, label = 'Station') {
        const id = nodeIdCounter++;
        const node = {
            id,
            x: new Signal(x),
            y: new Signal(y),
            label: new Signal(label)
        };
        this.nodes.set(id, node);
        this.emit('nodeAdded', node);
        return node;
    }

    removeNode(id) {
        const node = this.nodes.get(id);
        if (!node) return;
        this.nodes.delete(id);

        // Remove associated connections
        const toRemove = [...this.connections].filter(c => c.fromId === id || c.toId === id);
        toRemove.forEach(conn => this.removeConnection(conn.id));

        this.emit('nodeRemoved', node);
    }

    addConnection(fromId, toId, label = 'Line') {
        const id = connectionIdCounter++;
        const connection = {
            id,
            fromId,
            toId,
            label: new Signal(label)
        };
        this.connections.add(connection);
        this.emit('connectionAdded', connection);
        return connection;
    }

    removeConnection(id) {
        const connection = [...this.connections].find(c => c.id === id);
        if (!connection) return;
        this.connections.delete(connection);
        this.emit('connectionRemoved', connection);
    }
}
