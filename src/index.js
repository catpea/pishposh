// SubwayBuilder.js
import { Application } from "./Application.js";

import { ToolboxPlugin } from "./plug-ins/toolbox/ToolboxPlugin.js";
import { PropertiesPlugin } from "./plug-ins/properties/PropertiesPlugin.js";
import { PalettePlugin } from "./plug-ins/palette/PalettePlugin.js";

import { DatabasePlugin } from "./plug-ins/database/DatabasePlugin.js";
import { WorkbenchPlugin } from "./plug-ins/workbench/WorkbenchPlugin.js";

import { StationManagerPlugin } from "./plug-ins/station/StationManagerPlugin.js";
import { StationRenderPlugin } from "./plug-ins/station/StationRenderPlugin.js";
import { StationMovePlugin } from "./plug-ins/station/StationMovePlugin.js";
import { StationDeletePlugin } from "./plug-ins/station/StationDeletePlugin.js";
import { StationCreatePlugin } from "./plug-ins/station/StationCreatePlugin.js";

import { ManifestManagerPlugin } from "./plug-ins/manifests/ManifestManagerPlugin.js";
import { AgentManagerPlugin } from "./plug-ins/agent/AgentManagerPlugin.js";
import { PortManagerPlugin } from "./plug-ins/ports/PortManagerPlugin.js";

import { GhostLinePlugin } from "./plug-ins/connection/GhostLinePlugin.js";
import { ConnectionManagerPlugin } from "./plug-ins/connection/ConnectionManagerPlugin.js";
import { ConnectionRenderPlugin } from "./plug-ins/connection/ConnectionRenderPlugin.js";
import { ConnectionDeletePlugin } from "./plug-ins/connection/ConnectionDeletePlugin.js";
import { ConnectionCreatePlugin } from "./plug-ins/connection/ConnectionCreatePlugin.js";

export class SubwayBuilder extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `

          <div id="ui-container" class="ui-container">

            <div class="start-side snapped-top snapped-start">
            </div>

            <div class="end-side snapped-top snapped-end">
            </div>

            <div class="toolbox snapped-bottom snapped-center rounded" tabindex="-1" style="min-height: 3rem;">
              <div class="toolbox-body p-3">
                <small class="text-info" id="tool-info">Tool: (?)</small>
                <small class="text-info" id="pan-info">Pan: (0, 0)</small>
                <small class="text-info" id="scale-info">Scale: 1.00</small>
                <small class="text-info" id="mouse-info1">Mouse: (0, 0)</small>
                <small class="text-info" id="mouse-info2">Mouse: (0, 0)</small>
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
    const svg = this.querySelector("#main-svg");
    const app = new Application(svg);

    app.use(new ToolboxPlugin());

    app.use(new WorkbenchPlugin());
    app.use(new PalettePlugin());
    app.use(new PropertiesPlugin());

    // Station System - respond to click on canvas create stations
    app.use(new StationManagerPlugin());
    app.use(new StationRenderPlugin());
    app.use(new StationMovePlugin());
    app.use(new StationDeletePlugin());
    app.use(new StationCreatePlugin());

    // listen for stations being created, load agent manifests, and create  agents
    app.use(new ManifestManagerPlugin());
    app.use(new AgentManagerPlugin());

    // listen for agents being created, use their manifest to draw ports
    app.use(new PortManagerPlugin());

    // Connection System
    app.use(new GhostLinePlugin());
    app.use(new ConnectionManagerPlugin());
    app.use(new ConnectionRenderPlugin());
    app.use(new ConnectionDeletePlugin());
    app.use(new ConnectionCreatePlugin());

    app.use(new DatabasePlugin());

    app.init();

  }
}
