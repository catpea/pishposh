
// Wheel interaction plugin
export class InteractionWheelPlugin {
  constructor() {
    this.engine = null;
  }

  start() {
    this.engine.svg.addEventListener("wheel", this.onWheel);
  }

  stop() {
    this.engine.svg.removeEventListener("wheel", this.onWheel);
  }

  onWheel = (event) => {
    if(!this.engine.isActive) return;
    event.preventDefault();
    const scaleFactor = this.engine.calculateWheelDelta(event);
    this.engine.zoomAtBy(scaleFactor, event.clientX, event.clientY);
  };
}
