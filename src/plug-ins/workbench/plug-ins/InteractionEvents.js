
// Wheel interaction plugin
export class InteractionEvents {
  constructor() {
    this.engine = null;
  }

  start() {
    // this.engine.svg.addEventListener("wheel", this.onWheel);
    this.engine.svg.addEventListener("mousedown", this.onMouseDown);
    this.engine.svg.addEventListener("click", this.onClick);

  }

  stop() {
    // this.engine.svg.removeEventListener("wheel", this.onWheel);
    this.engine.svg.removeEventListener("mousedown", this.onMouseDown);
    this.engine.svg.removeEventListener("click", this.onClick);

  }

  onWheel = (event) => {
    event.preventDefault();
    const scaleFactor = this.engine.calculateWheelDelta(event);
    this.engine.zoomAtBy(scaleFactor, event.clientX, event.clientY);
  };

  onMouseDown = (event) => {
    const {x:worldX, y:worldY} = this.engine.clientToWorld(event.clientX, event.clientY);
    const eventData =  {
      bubbles: true,
      detail: {
        original: event,
        clientX: event.clientX,
        clientY: event.clientY,
        worldX,
        worldY,
      },
    };
    const customEvent = new CustomEvent("worldmousedown", eventData);
    this.engine.svg.dispatchEvent(customEvent);
  };

  onClick = (event) => {

    const {x:worldX, y:worldY} = this.engine.clientToWorld(event.clientX, event.clientY);
    const eventData =  {
      bubbles: true,
      detail: {
        original: event,
        clientX: event.clientX,
        clientY: event.clientY,
        worldX,
        worldY,
      },
    };
    const customEvent = new CustomEvent("worldclick", eventData);
    this.engine.svg.dispatchEvent(customEvent);
  };

}
