export class EventEmitter {
  eventNames;

  constructor() {
    this.actionReplay = new Map(); // we store the last event
    this.eventNames = new Map();
    this.subscriptions = new Set();
  }

  on(event, subscriber) {
    if (!this.eventNames.has(event)) {
      this.eventNames.set(event, new Set());
    }
    this.eventNames.get(event).add(subscriber);
    return () => this.off(event, subscriber);
  }

  one(event, subscriber) {
    if (!this.eventNames.has(event)) {
      this.eventNames.set(event, new Set());
    }

    const onceWrapper = (...a) => {
      subscriber(...a);
      this.off(event, onceWrapper);
    };

    this.eventNames.get(event).add(onceWrapper);
  }

  // this.waitForEvent('orderPaid',  event => event.orderId === orderId);
  waitFor(eventName, condition) {
    return new Promise((resolve, reject) => {
      const handler = (event) => {
        if (condition(event)) {
          this.off(eventName, handler);
          resolve(event);
        }
      };
      this.on(eventName, handler);
    });
  }

  // ID Sensitive
  until(eventName, id) {
    if (this.actionReplay.has(eventName + "#" + id)) {
      // console.log(`UNTIL has ${eventName+'#'+id}`, this.actionReplay.get(eventName+'#'+id));
      return this.actionReplay.get(eventName + "#" + id);
    }
    return new Promise((resolve) => {
      const off = this.on(eventName, (data) => {
        console.log("UNTIL", data);
        if (data.id == id) {
          off();
          resolve(data);
        }
      });
    });
  }

  once(eventName) {
    return new Promise((resolve, reject) => {
      const onEvent = (...args) => {
        this.off("error", onError);
        resolve(...args);
      };
      const onError = (error) => {
        this.off(eventName, onEvent);
        reject(error);
      };
      this.one(eventName, onEvent);
      this.one("error", onError);
    });
  }

  toPromise(eventName = "output") {
    return new Promise((resolve, reject) => {
      this.one(eventName, (data) => {
        resolve(data);
      });

      this.one("error", (error) => {
        reject(error);
      });
    });
  }

  off(event, subscriber) {
    this.eventNames.get(event).delete(subscriber);
  }

  emit(eventName, eventData, actionReplay = true) {
    // actionReplay is true by default

    if (actionReplay && eventData.id) this.actionReplay.set(eventName + "#" + eventData.id, eventData);

    const subscribers = this.eventNames.get(eventName) ?? new Set();
    for (const subscriber of subscribers) {
      subscriber(eventData);
    }
  }

  terminate(eventName) {
    if (eventName) {
      // Clear specific event's listeners
      if (this.eventNames.has(eventName)) {
        this.eventNames.get(eventName).clear(); // Clear the Set
        this.eventNames.delete(eventName); // Remove from Map
      }
    } else {
      this.subscriptions.forEach((subscriber) => subscriber());
      this.subscriptions.clear();

      // Clear ALL events and listeners
      this.eventNames.forEach((listeners, eventName) => {
        listeners.clear(); // Clear each Set
      });
      this.eventNames.clear(); // Clear the entire Map
    }
    return this;
  }

}
