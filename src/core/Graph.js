import { ReactiveEmitter as EventEmitter, ReactiveSignal as Signal } from './Signal.js';

import { debounce } from './Utils.js';

export class Graph extends EventEmitter {
    constructor() {
        super();
        this.metadata = new Map();
        this.nodes = new Map();
        this.connections = new Set();

        this.debouncedEmit = debounce( this.emit.bind(this), 1_000 )

    }

    // emitDebounce(...args){
    //   console.log( 'emitDebounce', ...args )
    //   debounce( ()=>this.emit(...args), 1_000 )
    // }

    addNode({r=12, x, y, type = 'StationAgent', label = 'Station', id = this.generateId()}) {

        const node = {
            id,
            r: new Signal(r),
            x: new Signal(x),
            y: new Signal(y),
            type,
            label: new Signal(label),
            subscriptions: new Set(),
        };

        this.nodes.set(id, node);
        this.emit('nodeAdded', node);


        const xSubscription = node.x.subscribe(value=>this.debouncedEmit('nodeChanged', node, 'x', value));
        const ySubscription = node.y.subscribe(value=>this.debouncedEmit('nodeChanged', node, 'y', value));
        const labelSubscription = node.label.subscribe(value=>this.debouncedEmit('nodeChanged', node, 'label', value));

        node.subscriptions.add(xSubscription);
        node.subscriptions.add(ySubscription);
        node.subscriptions.add(labelSubscription);

        return node;
    }

    getNode(id) {
      const node = this.nodes.get(id);
      return node;
    }

    removeNode(id) {
        const node = this.nodes.get(id);
        if (!node) return;

        for (const unsubscribe of node.subscriptions) {
          unsubscribe();
        }
        node.subscriptions.clear();

        this.nodes.delete(id);

        const toRemove = [...this.connections].filter(c => c.fromId === id || c.toId === id);
        toRemove.forEach(conn => this.removeConnection(conn.id));

        this.emit('nodeRemoved', node);
    }

    addConnection({fromId, toId, type = 'ConnectionAgent', label = 'Line', startLabel='output', endLabel='input',  id = this.generateId()}) {
        const connection = {
            id,
            type,
            fromId,
            toId,
            startLabel: new Signal(startLabel),
            label: new Signal(label),
            endLabel: new Signal(endLabel),
            subscriptions: new Set(),

        };

        const labelSubscription = connection.label.subscribe(value=>this.debouncedEmit('nodeChanged', connection, 'label', value));

        connection.subscriptions.add(labelSubscription);


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

    generateId() {
        const length = 16;
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        return [...Array(length)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    serialize() {
        return JSON.stringify({
            metadata: Array.from(this.metadata.entries()),
            nodes: Array.from(this.nodes.values()).map(node => ({
                id: node.id,
                r: node.r.value,
                x: node.x.value,
                y: node.y.value,
                type: node.type,
                label: node.label.value
            })),
            connections: Array.from(this.connections.values()).map(conn => ({
                id: conn.id,
                type: conn.type,
                fromId: conn.fromId,
                toId: conn.toId,
                label: conn.label.value
            }))
        }, null, 2);
    }

    deserialize(json) {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        const { metadata, nodes, connections } = data;

        this.metadata = new Map(metadata);
        this.nodes = new Map();
        this.connections = new Set();

        nodes.forEach(n => {
            const node = this.addNode(n);
            // avoid duplicate events if needed
        });

        connections.forEach(c => {
            const conn = this.addConnection(c);
        });
    }
}
