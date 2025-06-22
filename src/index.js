// SubwayBuilder.js
import { Application } from './Application.js';

import { GridPlugin } from './plug-ins/GridPlugin.js';
import { ToolboxPlugin } from './plug-ins/ToolboxPlugin.js';
import { PanZoomPlugin } from './plug-ins/PanZoomPlugin.js';
import { StationPlugin } from './plug-ins/StationPlugin.js';
import { ConnectPlugin } from './plug-ins/ConnectPlugin.js';
import { ConnectionLinePlugin } from './plug-ins/ConnectionLinePlugin.js';
import { MoveStationPlugin } from './plug-ins/MoveStationPlugin.js';

import { AgentsPlugin } from './plug-ins/AgentsPlugin.js';
import { AgentLibraryPlugin } from './plug-ins/AgentLibraryPlugin.js';
import { AgentChooserPlugin } from './plug-ins/AgentChooserPlugin.js';
import { PropertiesPanelPlugin } from './plug-ins/PropertiesPanelPlugin.js';

export class SubwayBuilder extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <div id="container">
              <svg id="svg-canvas" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet">
                <g id="grid-layer"></g>
                <g id="connections-layer"></g>
                <g id="stations-layer"></g>
                <g id="labels-layer"></g>
                <g id="temp-layer"></g>
              </svg>
            </div>
        `;

        const svg = this.querySelector('#svg-canvas');
        const app = new Application(svg);

        // Core plugins
        app.use(new GridPlugin());
        app.use(new ToolboxPlugin());
        app.use(new PanZoomPlugin());
        app.use(new StationPlugin());
        app.use(new ConnectPlugin());
        app.use(new ConnectionLinePlugin());
        app.use(new MoveStationPlugin());

        // Agent system
        app.use(new AgentLibraryPlugin());
        app.use(new AgentsPlugin());
        app.use(new AgentChooserPlugin());
        app.use(new PropertiesPanelPlugin());

        app.init();
        window.app = app; // Debug access
    }
}
