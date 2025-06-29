export class GridBackgroundPlugin {
  constructor(options = {}) {
    this.engine = null;

    // Configuration options with defaults
    this.config = {
      dotRadius: 0.5,
      gridSize: 20,
      dotColor: '#888888',
      minOpacity: 0.1,
      maxOpacity: 1.0,
      opacityThreshold: 0.5,
      patternId: 'grid-background-pattern',
      ...options
    };

    // Internal state
    this.patternElement = null;
    this.backgroundRect = null;

    this.dotElement = null;
    this.defsElement = null;

    // Grid world origin - this stays fixed in world space
    this.gridWorldOriginX = 0;
    this.gridWorldOriginY = 0;
  }

  start() {
    if (!this.engine) return;

    // Get or create defs element
    this.defsElement = this.engine.svg.querySelector('defs');
    if (!this.defsElement) {
      this.defsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      this.engine.svg.insertBefore(this.defsElement, this.engine.svg.firstChild);
    }

    // Create the pattern elements
    this.createPattern();
    this.createBackgroundRect();

    // Subscribe to all relevant signals
    this.engine.panX.subscribe(() => this.updateBackground());
    this.engine.panY.subscribe(() => this.updateBackground());
    this.engine.scale.subscribe(() => this.updateBackground());

    this.engine.worldPosX.subscribe(() => this.updateBackground());
    this.engine.worldPosY.subscribe(() => this.updateBackground());

    // Initial update
    this.updateBackground();
  }

  stop() {
    if (!this.engine) return;

    // Clean up elements
    if (this.patternElement) {
      this.patternElement.remove();
      this.patternElement = null;
    }

    if (this.backgroundRect) {
      this.backgroundRect.remove();
      this.backgroundRect = null;
    }
  }

  createPattern() {
    // Create pattern element
    this.patternElement = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    this.patternElement.setAttribute('id', this.config.patternId);
    this.patternElement.setAttribute('patternUnits', 'userSpaceOnUse');

    // Create dot circle
    this.dotElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.dotElement.setAttribute('fill', this.config.dotColor);
    this.dotElement.classList.add('grid-background-dot');

    // Append dot to pattern
    this.patternElement.appendChild(this.dotElement);

    // Append pattern to defs
    this.defsElement.appendChild(this.patternElement);
  }

  createBackgroundRect() {
    // Create background rectangle that uses the pattern
    this.backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.backgroundRect.setAttribute('width', '100%');
    this.backgroundRect.setAttribute('height', '100%');
    this.backgroundRect.setAttribute('fill', `url(#${this.config.patternId})`);
    this.backgroundRect.classList.add('grid-background-rect');

    // Insert as first child of SVG (behind everything)
    this.engine.svg.insertBefore(this.backgroundRect, this.engine.svg.firstChild);
  }

  updateBackground() {
    if (!this.patternElement || !this.dotElement || !this.backgroundRect) return;

    const scale = this.engine.scale.get();
    const panX = this.engine.panX.get();
    const panY = this.engine.panY.get();
    const worldMouseX = this.engine.worldPosX.value;
    const worldMouseY = this.engine.worldPosY.value;

    // Calculate grid scale in screen space
    const screenGridSize = this.config.gridSize * scale;
    const screenDotRadius = this.config.dotRadius * scale;
    const dotCenter = screenGridSize / 2;

    // Calculate where the world grid origin appears on screen
    const screenOrigin = this.engine.worldToSVG(this.gridWorldOriginX, this.gridWorldOriginY);

    // Find the nearest grid point to the mouse in world space
    // This keeps the grid "locked" to a consistent world position
    const nearestGridX = Math.round(worldMouseX / this.config.gridSize) * this.config.gridSize;
    const nearestGridY = Math.round(worldMouseY / this.config.gridSize) * this.config.gridSize;

    // Convert the nearest grid point to screen coordinates
    const screenGridPoint = this.engine.worldToSVG(nearestGridX, nearestGridY);

    // Calculate pattern offset by finding where this grid point should align
    // Use modulo to create seamless tiling
    const patternOffsetX = ((screenGridPoint.x % screenGridSize) + screenGridSize) % screenGridSize;
    const patternOffsetY = ((screenGridPoint.y % screenGridSize) + screenGridSize) % screenGridSize;

    // Update pattern attributes
    this.patternElement.setAttribute('x', patternOffsetX);
    this.patternElement.setAttribute('y', patternOffsetY);
    this.patternElement.setAttribute('width', screenGridSize);
    this.patternElement.setAttribute('height', screenGridSize);

    // Update dot attributes
    this.dotElement.setAttribute('r', Math.max(0.1, screenDotRadius));
    this.dotElement.setAttribute('cx', dotCenter);
    this.dotElement.setAttribute('cy', dotCenter);

    // Calculate opacity based on scale
    const opacity = this.calculateOpacity(scale);
    this.backgroundRect.setAttribute('opacity', opacity);
  }

  calculateOpacity(scale) {
    const { minOpacity, maxOpacity, opacityThreshold } = this.config;

    if (scale > opacityThreshold) {
      return maxOpacity;
    }

    // Linear interpolation between minOpacity and maxOpacity
    const normalizedScale = scale / opacityThreshold;
    return minOpacity + (maxOpacity - minOpacity) * normalizedScale;
  }

  // Public API for customization
  setDotColor(color) {
    this.config.dotColor = color;
    if (this.dotElement) {
      this.dotElement.setAttribute('fill', color);
    }
  }

  setGridSize(size) {
    this.config.gridSize = size;
    this.updateBackground();
  }

  setDotRadius(radius) {
    this.config.dotRadius = radius;
    this.updateBackground();
  }

  setOpacityRange(min, max, threshold) {
    this.config.minOpacity = min;
    this.config.maxOpacity = max;
    this.config.opacityThreshold = threshold;
    this.updateBackground();
  }

  // Set a new world origin for the grid (useful for snapping to specific points)
  setGridWorldOrigin(worldX, worldY) {
    this.gridWorldOriginX = worldX;
    this.gridWorldOriginY = worldY;
    this.updateBackground();
  }
}

// Usage example:
/*
const engine = new PanZoomEngine(svgElement);
const gridPlugin = new GridBackgroundPlugin({
  dotRadius: 0.5,
  gridSize: 20,
  dotColor: '#666666',
  minOpacity: 0.2,
  maxOpacity: 0.8,
  opacityThreshold: 0.5
});

engine.use(gridPlugin).start();
*/
