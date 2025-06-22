// AgentChooserPlugin.js
export class AgentChooserPlugin {
    constructor() {
        this.pluginId = 'AgentChooserPlugin';
    }

    init(app) {
        this.app = app;

        this.library = app.plugins.get('AgentLibraryPlugin');

        this.createChooserUI();
    }

    createChooserUI() {
        const chooser = document.createElement('div');
        chooser.id = 'agent-chooser';

        const title = document.createElement('h3');
        title.textContent = 'Agent Library';
        chooser.appendChild(title);

        const list = document.createElement('div');
        list.classList.add('agent-list');

        for (const [type, factory] of this.library.agents) {
          if(factory.hidden) continue;
            const item = document.createElement('div');
            item.classList.add('agent-item');
            item.setAttribute('draggable', 'true');
            item.textContent = type;

            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', type);
                e.dataTransfer.effectAllowed = 'copy';
            });

            list.appendChild(item);
        }

        chooser.appendChild(list);
        document.getElementById('container').appendChild(chooser);

        // Hook into the drop zone (graph surface)
        this.app.svg.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.app.svg.addEventListener('drop', e => {
            e.preventDefault();
            const agentType = e.dataTransfer.getData('text/plain');
            const pos = this.app.getMousePosition(e);
            const snapped = this.app.snapToGrid(pos.x, pos.y);

            this.app.emit('beforeStationCreate', snapped);

            // this will trigger this.graph.on('nodeAdded...
            const node = this.app.graph.addNode(snapped.x, snapped.y, agentType);

        });
    }
}
