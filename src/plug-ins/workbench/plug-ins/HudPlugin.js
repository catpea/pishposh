
// Touch move plugin
export class HudPlugin {
  constructor() {
    this.engine = null;
  }

  start() {
    // Example of contributing function to the engine.
    this.engine.updateGridLabels = ()=>this.updateGridLabels()
    this.engine.toggleGrid = ()=>this.toggleGrid()

    // Update info display
    this.engine.panX.subscribe((v) => this.updateInfo(v));
    this.engine.panY.subscribe((v) => this.updateInfo(v));
    this.engine.scale.subscribe((v) => this.updateInfo(v));

    // Grid toggle function

    // Initial setup
    this.updateInfo();
    if(this.engine.debug){
      this.testShapes();
    }
  }

  stop() {}

  toggleGrid() {

  }

  // Grid label management
  updateGridLabels() {

  }

  updateInfo() {
    document.getElementById("pan-info").textContent = `Pan: (${this.engine.panX.get().toFixed(1)}, ${this.engine.panY.get().toFixed(1)})`;
    document.getElementById("scale-info").textContent = `Scale: ${this.engine.scale.get().toFixed(2)}`;
    this.updateGridLabels();
  }

  testShapes() {
    // Example geometry for testing
    const content = document.getElementById("content");

    // Add some test geometry
    const testCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    testCircle.setAttribute("cx", 200);
    testCircle.setAttribute("cy", 150);
    testCircle.setAttribute("r", 50);
    testCircle.setAttribute("fill", "rgba(100, 200, 255, 0.3)");
    testCircle.setAttribute("stroke", "#64c8ff");
    testCircle.setAttribute("stroke-width", "2");
    content.appendChild(testCircle);

    const testRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    testRect.setAttribute("x", -150);
    testRect.setAttribute("y", -100);
    testRect.setAttribute("width", 100);
    testRect.setAttribute("height", 80);
    testRect.setAttribute("fill", "rgba(255, 100, 100, 0.3)");
    testRect.setAttribute("stroke", "#ff6464");
    testRect.setAttribute("stroke-width", "2");
    content.appendChild(testRect);
  }
}
