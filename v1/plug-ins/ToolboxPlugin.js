// ToolboxPlugin.js
export class ToolboxPlugin {
    constructor() {
        this.tools = [
            { id: 'select', icon: 'M12 2 L22 20 L12 17 L2 20 Z' },
            { id: 'station', icon: 'circle', cx: 12, cy: 12, r: 10 },
            { id: 'connect', icon: 'rect', x: 2, y: 2, width: 20, height: 20 }
        ];
        // this.tools = [
        //     { id: 'select', icon: 'M12 2 L22 20 L12 17 L2 20 Z' },
        //     { id: 'station', icon: 'circle', cx: 12, cy: 12, r: 10 },
        //     { id: 'connect', icon: 'rect', x: 2, y: 2, width: 20, height: 20 }
        // ];
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
            icon.classList.add('bi', 'bi-arrows-move');
            button.appendChild(icon);

            toolbox.appendChild(button);
            button.addEventListener('click', () => this.selectTool(tool.id));

        });

        // this.tools.forEach(tool => {
        //     const button = document.createElement('div');
        //     button.classList.add('tool');
        //     button.id = `${tool.id}-tool`;
        //     button.title = tool.id.charAt(0).toUpperCase() + tool.id.slice(1);

        //     const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        //     svg.setAttribute('viewBox', '0 0 24 24');
        //     svg.setAttribute('width', '24');
        //     svg.setAttribute('height', '24');

        //     let shape;
        //     if (tool.icon === 'circle') {
        //         shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        //         shape.setAttribute('cx', tool.cx);
        //         shape.setAttribute('cy', tool.cy);
        //         shape.setAttribute('r', tool.r);
        //         shape.setAttribute('fill', 'white');
        //         shape.setAttribute('stroke', 'black');
        //         shape.setAttribute('stroke-width', '2');
        //     } else if (tool.icon === 'rect') {
        //         shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        //         shape.setAttribute('x', tool.x);
        //         shape.setAttribute('y', tool.y);
        //         shape.setAttribute('width', tool.width);
        //         shape.setAttribute('height', tool.height);
        //         shape.setAttribute('fill', '#4caf50');
        //         shape.setAttribute('stroke', 'white');
        //         shape.setAttribute('stroke-width', '2');
        //     } else {
        //         shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        //         shape.setAttribute('d', tool.icon);
        //         shape.setAttribute('fill', 'black');
        //         shape.setAttribute('stroke', 'black');
        //         shape.setAttribute('stroke-width', '1');
        //     }

        //     svg.appendChild(shape);
        //     button.appendChild(svg);
        //     toolbox.appendChild(button);

        //     button.addEventListener('click', () => this.selectTool(tool.id));
        // });

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
