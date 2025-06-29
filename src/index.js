// SubwayBuilder.js
import { Application } from './Application.js';

import { DatabasePlugin } from './plug-ins/database/DatabasePlugin.js';
import { WorkbenchPlugin } from './plug-ins/workbench/WorkbenchPlugin.js';

// import { GridPlugin } from './plug-ins/GridPlugin.js';
// import { ToolboxPlugin } from './plug-ins/ToolboxPlugin.js';

// // v1: import { PanZoomPlugin } from './plug-ins/PanZoomPlugin.js';
// import { PanZoomPlugin } from './plug-ins/pan-zoom/PanZoomPlugin.js';

import { StationManagerPlugin } from './plug-ins/station/StationManagerPlugin.js';
import { StationVisualizationPlugin } from './plug-ins/station/StationVisualizationPlugin.js';

// import { StationPlugin } from './plug-ins/StationPlugin.js';
// import { ConnectPlugin } from './plug-ins/ConnectPlugin.js';
// import { ConnectionLinePlugin } from './plug-ins/ConnectionLinePlugin.js';
// import { MoveStationPlugin } from './plug-ins/MoveStationPlugin.js';

// import { AgentsPlugin } from './plug-ins/AgentsPlugin.js';
// import { AgentLibraryPlugin } from './plug-ins/AgentLibraryPlugin.js';
// import { AgentChooserPlugin } from './plug-ins/AgentChooserPlugin.js';
// import { PropertiesPanelPlugin } from './plug-ins/PropertiesPanelPlugin.js';

export class SubwayBuilder extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
        this.innerHTML = `

          <div class="container">
              <div class="header">

                  <div class="controls">
                      <button title="Reset View" onclick="app.plugins.get('WorkbenchPlugin').engine.resetZoom()"><i class="bi bi-search"></i></button>
                      <button title="Zoom In" onclick="app.plugins.get('WorkbenchPlugin').engine.zoomIn()"><i class="bi bi-zoom-in"></i></button>
                      <button title="Zoom Out" onclick="app.plugins.get('WorkbenchPlugin').engine.zoomOut()"><i class="bi bi-zoom-out"></i></button>
                      <i class="bi bi-three-dots-vertical" style="align-content: center; color: var(--base01);"></i>
                      <button title=""><i class="bi bi-lock"></i></button>
                      <button title=""><i class="bi bi-floppy"></i></button>
                  </div>

                  <div class="info">
                      <span id="pan-info">Pan: (0, 0)</span>
                      <span id="scale-info">Scale: 1.00</span>
                      <span id="mouse-info1">Mouse: (0, 0)</span>
                      <span id="mouse-info2">Mouse: (0, 0)</span>
                  </div>

              </div>

              <div class="svg-container">
                  <svg id="main-svg">

                      <defs>
                      </defs>

                      <g id="viewport">

                          <g id="groups-layer"></g>
                          <g id="connections-layer"></g>
                          <g id="stations-layer"></g>
                          <g id="labels-layer"></g>
                          <g id="temp-layer"></g>

                          <!-- Content area for geometry testing -->
                          <g id="content">

                          </g>

                      </g>

                  </svg>
              </div>
          </div>
        `;

        // const svg = this.querySelector('#svg-container');
        const svg = this.querySelector('#main-svg');
        const app = new Application(svg);

        app.use(new DatabasePlugin());
        app.use(new WorkbenchPlugin());

        // Core plugins
        // app.use(new GridPlugin());
        // app.use(new ToolboxPlugin());
        // app.use(new PanZoomPlugin());

        // Station System
        app.use(new StationManagerPlugin());
        app.use(new StationVisualizationPlugin());

        // app.use(new StationPlugin());
        // app.use(new ConnectPlugin());
        // app.use(new ConnectionLinePlugin());
        // app.use(new MoveStationPlugin());

        // // Agent System
        // app.use(new AgentLibraryPlugin());
        // app.use(new AgentsPlugin());
        // app.use(new AgentChooserPlugin({showTitle: false}));
        // app.use(new PropertiesPanelPlugin());

        app.init();
        window.app = app; // Debug access





    }
}
