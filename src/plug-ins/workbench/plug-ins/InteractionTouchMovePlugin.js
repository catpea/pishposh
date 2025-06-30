
// Touch move plugin
export class InteractionTouchMovePlugin {
  constructor() {
    this.isTouching = false;
    this.lastX = 0;
    this.lastY = 0;
    this.engine = null;
  }

  start() {
    this.engine.svg.addEventListener("touchstart", this.onTouchStart);
    this.engine.svg.addEventListener("touchmove", this.onTouchMove);
    this.engine.svg.addEventListener("touchend", this.onTouchEnd);
  }

  stop() {
    this.engine.svg.removeEventListener("touchstart", this.onTouchStart);
    this.engine.svg.removeEventListener("touchmove", this.onTouchMove);
    this.engine.svg.removeEventListener("touchend", this.onTouchEnd);
  }

  onTouchStart = (event) => {
    if(!this.engine.isActive) return;
    if (event.touches.length === 1) {
      event.preventDefault();
      this.isTouching = true;
      const touch = event.touches[0];
      this.lastX = touch.clientX;
      this.lastY = touch.clientY;
    }
  };

  onTouchMove = (event) => {
    if (this.isTouching && event.touches.length === 1) {
      event.preventDefault();
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.lastX;
      const deltaY = touch.clientY - this.lastY;
      this.engine.panBy(deltaX, deltaY);
      this.lastX = touch.clientX;
      this.lastY = touch.clientY;
    }
  };

  onTouchEnd = (event) => {
    this.isTouching = false;
  };
}
