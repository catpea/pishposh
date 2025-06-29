// SubwayBuilder.js
import { Application } from './Application.js';

import { ToolboxPlugin } from './plug-ins/ui/ToolboxPlugin.js';
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

          <div id="ui-container" class="ui-container">

            <div class="toolbox snapped-top snapped-end rounded shadow" tabindex="-1" style="width: 15vw; min-height: 25vh;">
              <div class="toolbox-body p-3">
                <small class="text-info">properties</small>
              </div>
            </div>

            <div class="toolbox snapped-bottom snapped-center rounded" tabindex="-1" style="min-height: 3rem;">
              <div class="toolbox-body p-3">
                <small  class="text-info"id="pan-info">Pan: (0, 0)</small>
                <small  class="text-info"id="scale-info">Scale: 1.00</small>
                <small  class="text-info"id="mouse-info1">Mouse: (0, 0)</small>
                <small  class="text-info"id="mouse-info2">Mouse: (0, 0)</small>
              </div>
            </div>

            <div class="svg-container">
                <svg id="main-svg">
                    <defs>
                    </defs>
                    <g id="viewport">
                    </g>
                </svg>
            </div>

          </div>
        `;

        // const svg = this.querySelector('#svg-container');
        const svg = this.querySelector('#main-svg');
        const app = new Application(svg);

        app.use(new WorkbenchPlugin());
        app.use(new ToolboxPlugin());

        // Core plugins
        // app.use(new GridPlugin());
        // app.use(new ToolboxPlugin());
        // app.use(new PanZoomPlugin());

        // Station System
        app.use(new StationVisualizationPlugin());
        app.use(new StationManagerPlugin());

        // app.use(new StationPlugin());
        // app.use(new ConnectPlugin());
        // app.use(new ConnectionLinePlugin());
        // app.use(new MoveStationPlugin());

        // // Agent System
        // app.use(new AgentLibraryPlugin());
        // app.use(new AgentsPlugin());
        // app.use(new AgentChooserPlugin({showTitle: false}));
        // app.use(new PropertiesPanelPlugin());
        app.use(new DatabasePlugin());

        app.init();
        window.app = app; // Debug access





    }
}
