import { EventEmitter } from "events";

export default class ConnectionAgent extends EventEmitter {
  constructor({ id, fromEmitter, toEmitter, mapping }) {
    super();

    this.id = id;

    this.fromEmitter = fromEmitter;
    this.toEmitter = toEmitter;
    this.mapping = mapping; // [ { fromEvent, toEvent, transformer } ]

    this.connections = new Map();
  }

  async start() {
    for (const { fromEvent, toEvent, transformer } of this.mapping) {
      this.#connect(fromEvent, toEvent, transformer);
    }
    console.log('AGENT START', this.constructor.name)
  }

  async stop() {
    for (const { fromEvent, toEvent, transformer } of this.mapping) {
      this.#disconnect(fromEvent, toEvent);
    }
  }

  // Private Helpers
  #connect(fromEvent, toEvent, transformer = (data) => data) {
    const handler = (data) => {
      const transformedData = transformer(data);
      this.toEmitter.emit(toEvent, transformedData);
    };
    this.fromEmitter.on(fromEvent, handler);
    this.connections.set(`${fromEvent}->${toEvent}`, handler);
  }

  #disconnect(fromEvent, toEvent) {
    const key = `${fromEvent}->${toEvent}`;
    const handler = this.connections.get(key);
    if (handler) {
      this.fromEmitter.off(fromEvent, handler);
      this.connections.delete(key);
    }
  }
}
