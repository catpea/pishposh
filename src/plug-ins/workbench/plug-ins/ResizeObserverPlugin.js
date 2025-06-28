

// Resize observer plugin - CRITICAL for proper coordinate transformations!
export class ResizeObserverPlugin {
  constructor() {
    this.engine = null;
    this.resizeObserver = null;
    this.windowResizeHandler = null;
  }

  start() {
    // ResizeObserver for precise container size changes
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(this.engine.svg);
    }

    // Fallback window resize listener for broader compatibility
    this.windowResizeHandler = this.onWindowResize.bind(this);
    window.addEventListener("resize", this.windowResizeHandler);

    // Initial size update
    this.updateViewBox();
  }

  stop() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.windowResizeHandler) {
      window.removeEventListener("resize", this.windowResizeHandler);
      this.windowResizeHandler = null;
    }
  }

  onResize = (entries) => {
    // ResizeObserver callback - most precise
    for (const entry of entries) {
      if (entry.target === this.engine.svg) {
        this.updateViewBox();
        break;
      }
    }
  };

  onWindowResize = () => {
    // Window resize fallback - broader compatibility
    this.updateViewBox();
  };

  updateViewBox() {
    const container = this.engine.svg.parentElement;
    if (!container) return;

    //REPLACED THIS
    // const rect = container.getBoundingClientRect();

    //TO THIS:
    const rect = this.engine.svg.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    if (width > 0 && height > 0) {
      // Update SVG viewBox to match container dimensions
      this.engine.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      // Trigger coordinate system updates
      this.engine.onViewBoxChanged(width, height);
    }
  }
}
