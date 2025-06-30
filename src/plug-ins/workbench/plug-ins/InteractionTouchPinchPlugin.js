
// Touch pinch plugin
export class InteractionTouchPinchPlugin {
  constructor() {
    this.isPinching = false;
    this.lastDistance = 0;
    this.lastCenterX = 0;
    this.lastCenterY = 0;
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

  getTouchDistance(touch1, touch2) {
    return this.engine.distance(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY);
  }

  getTouchCenter(touch1, touch2) {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }

  onTouchStart = (event) => {
    if(!this.engine.isActive) return;
    if (event.touches.length === 2) {
      event.preventDefault();
      this.isPinching = true;
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.lastDistance = this.getTouchDistance(touch1, touch2);
      const center = this.getTouchCenter(touch1, touch2);
      this.lastCenterX = center.x;
      this.lastCenterY = center.y;
    }
  };

  onTouchMove = (event) => {
    if (this.isPinching && event.touches.length === 2) {
      event.preventDefault();
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = this.getTouchDistance(touch1, touch2);
      const center = this.getTouchCenter(touch1, touch2);

      if (this.lastDistance > 0) {
        const scaleFactor = distance / this.lastDistance;
        this.engine.zoomAtBy(scaleFactor, center.x, center.y);
      }

      this.lastDistance = distance;
      this.lastCenterX = center.x;
      this.lastCenterY = center.y;
    }
  };

  onTouchEnd = (event) => {
    if (event.touches.length < 2) {
      this.isPinching = false;
      this.lastDistance = 0;
    }
  };
}
