export class EventEmitter {
  events;
  constructor() {
    this.events = new Map();
  }
  on(event, subscriber) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(subscriber);
    return ()=>this.off(event, subscriber)
  }
  off(event, subscriber) {
    this.events.get(event).delete(subscriber);
  }
  emit(event, data) {
    const subscribers = this.events.get(event) ?? new Set();
    for (const subscriber of subscribers) {
      subscriber(data);
    }
  }
  terminate(){
    this.events.forEach(subscribers=>subscribers.clear());
    this.events.clear();
  }
}
