// Mouse interaction plugin
export class InteractionMousePlugin {

  constructor() {
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.engine = null;
  }

  start() {
    this.engine.svg.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  stop() {
    this.engine.svg.removeEventListener("mousedown", this.onMouseDown);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }

  onMouseDown = (event) => {
    if(!this.engine.isActive) return;

    event.preventDefault();
    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  };

  onMouseMove = (event) => {
    if (this.isDragging) {
      const deltaX = event.clientX - this.lastX;
      const deltaY = event.clientY - this.lastY;
      this.engine.panBy(deltaX, deltaY);
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    }
  };

  onMouseUp = (event) => {
    this.isDragging = false;
  };
}
