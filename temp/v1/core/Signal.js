// Signal.js
export class Signal {
    constructor(initialValue) {
        this._value = initialValue;
        this.subscribers = new Set();
    }

    get value() {
        return this._value;
    }

    set value(newValue) {
        if (this._value === newValue) return;
        this._value = newValue;
        this.subscribers.forEach(callback => callback(newValue));
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        if (this._value !== undefined && this._value !== null) {
            callback(this._value); // Trigger immediately with current value
        }
        return () => this.subscribers.delete(callback); // Unsubscribe function
    }
}
