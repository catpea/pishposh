import { rid, ReactiveSignal as Signal, fromEvent, namedCombineLatest } from "../../core/Signal.js";

// Main PanZoomEngine class
export class PanZoomEngine {

  debug = false;

  constructor(svgElement) {

    this.svg = svgElement;
    this.viewport = svgElement.querySelector("#viewport");

    // Reactive signals
    this.mousePosX = new Signal(0);
    this.mousePosY = new Signal(0);
    this.worldPosX = new Signal(0);
    this.worldPosY = new Signal(0);

    this.scale = new Signal(1);
    this.panX = new Signal(0);
    this.panY = new Signal(0);
    this.scale = new Signal(1);

    // Plugin system
    this.plugins = [];
    this.isRunning = false;

    // Subscribe to signal changes
    this.panX.subscribe(() => this.updateTransform());
    this.panY.subscribe(() => this.updateTransform());
    this.scale.subscribe(() => this.updateTransform());

    // Configuration
    this.minScale = 0.1;
    this.maxScale = 10;
    this.zoomStep = 1.2;
    this.wheelSensitivity = 0.0015;
  }

  // Plugin management
  use(plugin) {
    plugin.engine = this;
    this.plugins.push(plugin);
    if (this.isRunning) {
      plugin.start();
    }
    return this;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.plugins.forEach((plugin) => plugin.start());
    return this;
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.plugins.forEach((plugin) => plugin.stop());
    return this;
  }

  // Transform management
  updateTransform() {
    const transform = `translate(${this.panX.get()}, ${this.panY.get()}) scale(${this.scale.get()})`;
    this.viewport.setAttribute("transform", transform);
  }

  // Pan operations
  pan(x, y) {
    this.panX.set(x);
    this.panY.set(y);
  }

  panBy(deltaX, deltaY) {
    this.panX.set(this.panX.get() + deltaX);
    this.panY.set(this.panY.get() + deltaY);
  }

  // Zoom operations
  zoom(newScale) {
    this.scale.set(this.clampScale(newScale));
  }

  zoomBy(deltaScale) {
    this.zoom(this.scale.get() * deltaScale);
  }

  zoomAt(newScale, x, y) {
    const oldScale = this.scale.get();
    const clampedScale = this.clampScale(newScale);
    const scaleFactor = clampedScale / oldScale;

    const svgPoint = this.clientToSVG(x, y);
    const dx = (svgPoint.x - this.panX.get()) * (1 - scaleFactor);
    const dy = (svgPoint.y - this.panY.get()) * (1 - scaleFactor);

    this.scale.set(clampedScale);
    this.panBy(dx, dy);
  }

  zoomAtBy(deltaScale, x, y) {
    this.zoomAt(this.scale.get() * deltaScale, x, y);
  }

  zoomIn() {
    this.zoomBy(this.zoomStep);
  }

  zoomOut() {
    this.zoomBy(1 / this.zoomStep);
  }

  resetZoom() {
    this.pan(0, 0);
    this.zoom(1);
  }

  // Geometry helpers
  clampScale(scale) {
    return Math.max(this.minScale, Math.min(this.maxScale, scale));
  }

  calculateWheelDelta(event) {
    return Math.exp(-event.deltaY * this.wheelSensitivity);
  }

  clientToSVG(clientX, clientY) {
    const rect = this.svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * this.svg.viewBox.baseVal.width;
    const svgY = ((clientY - rect.top) / rect.height) * this.svg.viewBox.baseVal.height;
    return { x: svgX, y: svgY };
  }

  svgToWorld(svgX, svgY) {
    const worldX = (svgX - this.panX.get()) / this.scale.get();
    const worldY = (svgY - this.panY.get()) / this.scale.get();
    return { x: worldX, y: worldY };
  }

  worldToSVG(worldX, worldY) {
    const svgX = worldX * this.scale.get() + this.panX.get();
    const svgY = worldY * this.scale.get() + this.panY.get();
    return { x: svgX, y: svgY };
  }

  clientToWorld(clientX, clientY) {
    const svgPoint = this.clientToSVG(clientX, clientY);
    return this.svgToWorld(svgPoint.x, svgPoint.y);
  }

  getViewportBounds() {
    const vb = this.svg.viewBox.baseVal;
    const topLeft = this.svgToWorld(0, 0);
    const bottomRight = this.svgToWorld(vb.width, vb.height);
    return {
      left: topLeft.x,
      top: topLeft.y,
      right: bottomRight.x,
      bottom: bottomRight.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  }

  // Called when viewBox changes - hook for coordinate system updates
  onViewBoxChanged(width, height) {
    // Update grid labels when viewport changes
    if (this.isRunning) {
      // Debounce rapid resize events
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if(this.updateGridLabels) this.updateGridLabels();
      }, 100);
    }
  }



  normalizeAngle(angle) {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}
