// Events.js
export class Events {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = new Set();
        }
        this.listeners[event].add(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].delete(callback);
        }
    }

    emit(event, data) {
      // console.warn('emit', event, data)
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

export class EventEmitter extends Events {

}
