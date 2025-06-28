import { getVisibleBounds, getAdaptiveGridSize } from '../core/Utils.js';

export class GridPlugin {
    constructor() {
        this.gridGroupId = 'dynamic-grid';
    }

    init(app) {
        this.app = app;
        this.svg = app.svg;
        this.tileSize = 40;

        // Initial render
        this.renderGrid();

        // Re-render grid on viewBox change
        app.on('viewBoxChanged', () => this.renderGrid());
        window.addEventListener('resize', () => this.renderGrid());

    }

    renderGrid() {
        const existingGrid = document.getElementById(this.gridGroupId);
        if (existingGrid) {
            existingGrid.remove();
        }

        const viewBox = this.svg.viewBox.baseVal;
        const bounds = getVisibleBounds(this.svg);
        const gridSize = getAdaptiveGridSize(viewBox.width);

        const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        gridGroup.setAttribute('id', this.gridGroupId);

        // Background fill
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('class', 'grid-background');
        background.setAttribute('x', bounds.left - gridSize);
        background.setAttribute('y', bounds.top - gridSize);
        background.setAttribute('width', bounds.width + gridSize * 2);
        background.setAttribute('height', bounds.height + gridSize * 2);
        gridGroup.appendChild(background);

        // Grid lines
        const padding = gridSize * 2;
        const startX = Math.floor((bounds.left - padding) / gridSize) * gridSize;
        const endX = Math.ceil((bounds.right + padding) / gridSize) * gridSize;
        const startY = Math.floor((bounds.top - padding) / gridSize) * gridSize;
        const endY = Math.ceil((bounds.bottom + padding) / gridSize) * gridSize;

        for (let x = startX; x <= endX; x += gridSize) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const isMajor = x % (gridSize * 5) === 0;
            line.setAttribute('class', isMajor ? 'grid-line-major' : 'grid-line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', x);
            line.setAttribute('y2', endY);
            gridGroup.appendChild(line);
        }

        for (let y = startY; y <= endY; y += gridSize) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const isMajor = y % (gridSize * 5) === 0;
            line.setAttribute('class', isMajor ? 'grid-line-major' : 'grid-line');
            line.setAttribute('x1', startX);
            line.setAttribute('y1', y);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', y);
            gridGroup.appendChild(line);
        }

        this.svg.insertBefore(gridGroup, this.svg.firstChild);
    }
}
