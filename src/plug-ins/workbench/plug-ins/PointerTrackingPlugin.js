export class PointerTrackingPlugin {
  constructor() {
    this.engine = null;
  }

  start() {
    document.addEventListener("mousemove", this.onMouseMove);
  }

  stop() {
    document.removeEventListener("mousemove", this.onMouseMove);
  }

  onMouseMove = (event) => {
    const worldPos = this.engine.clientToWorld(event.clientX, event.clientY);

    this.engine.worldPosX.value = worldPos.x;
    this.engine.worldPosY.value = worldPos.y;

    this.engine.mousePosX.value = event.clientX;
    this.engine.mousePosY.value = event.clientY;

    document.getElementById("mouse-info1").textContent = `World Mouse: (${this.engine.worldPosX.value.toFixed(1)}, ${this.engine.worldPosY.value.toFixed(1)})`;
    document.getElementById("mouse-info2").textContent = `UI Mouse: (${this.engine.mousePosX.value.toFixed(1)}, ${this.engine.mousePosY.value.toFixed(1)})`;
  };

  onMouseUp = (event) => {
    this.isDragging = false;
  };
}
