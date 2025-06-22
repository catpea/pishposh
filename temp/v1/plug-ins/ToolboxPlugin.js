// ToolboxPlugin.js
export class ToolboxPlugin {
    constructor() {
        this.tools = [
            { id: 'select',  icon: 'bi-arrows-move'},
            { id: 'station', icon: 'bi-node-plus-fill'},
            { id: 'connect', icon: 'bi-bezier2' }
        ];

        this.currentTool = 'select';
    }

    init(app) {
        this.app = app;
        this.createToolbox();
        this.selectTool('select');
    }

    createToolbox() {
        const toolbox = document.createElement('div');
        toolbox.id = 'toolbox';

        this.tools.forEach(tool => {

            const button = document.createElement('div');
            button.classList.add('tool');
            button.id = `${tool.id}-tool`;
            button.title = tool.id.charAt(0).toUpperCase() + tool.id.slice(1);

            const icon = document.createElement('i');
            icon.classList.add('bi', tool.icon);
            button.appendChild(icon);

            toolbox.appendChild(button);
            button.addEventListener('click', () => this.selectTool(tool.id));

        });

        document.getElementById('container').appendChild(toolbox);
    }

    selectTool(toolId) {

        this.currentTool = toolId;
        this.app.emit('toolSelected', toolId);

        document.querySelectorAll('.tool').forEach(el => el.classList.remove('active'));
        document.getElementById(`${toolId}-tool`).classList.add('active');

        const svg = this.app.svg;
        svg.classList.remove('station-mode', 'connect-mode');

        if (toolId === 'station') svg.classList.add('station-mode');
        if (toolId === 'connect') svg.classList.add('connect-mode');
    }
}
