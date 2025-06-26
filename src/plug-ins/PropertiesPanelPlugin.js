export class PropertiesPanelPlugin {
    constructor() {
        this.selected = null;
    }

    init(app) {
        this.app = app;
        this.panel = this.createPanel();
        document.getElementById('container').appendChild(this.panel);

        // Listen to selection events
        app.on('selectNode', node => this.showNodeProperties(node));
        app.on('selectConnection', connection => this.showConnectionProperties(connection));
        app.on('deselect', () => this.clearPanel());
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'properties-panel';
        panel.style.position = 'absolute';
        panel.style.top = '20px';
        panel.style.right = '20px';
        panel.style.width = '250px';
        panel.style.background = 'var(--base02)';
        panel.style.border = '2px solid var(--base03)';
        panel.style.borderRadius = '8px';
        panel.style.padding = '10px';
        panel.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
        panel.style.zIndex = 1000;
        panel.innerHTML = '<h3>Properties</h3>';
        return panel;
    }

    showNodeProperties(node) {
        this.selected = node;
        this.panel.innerHTML = '<h3>Station Properties</h3>';

        const nameInput = this.createLabeledInput('Label', node.label.value, val => node.label.value = val);
        this.panel.appendChild(nameInput);

        const xInput = this.createLabeledInput('X', node.x.value, val => node.x.value = parseInt(val));
        this.panel.appendChild(xInput);

        const yInput = this.createLabeledInput('Y', node.y.value, val => node.y.value = parseInt(val));
        this.panel.appendChild(yInput);

        // If agent is available
        const agent = this.app.plugins.get('AgentsPlugin')?.getNodeAgent(node.id);

        if (agent) {
            const agentLabel = document.createElement('div');
            agentLabel.innerHTML = `<strong>Agent:</strong> ${agent.constructor.name}`;
            this.panel.appendChild(agentLabel);
        }


        nameInput.querySelector('input').select()


    }

    showConnectionProperties(connection) {
        this.selected = connection;
        this.panel.innerHTML = '<h3>Connection Properties</h3>';

        const nameInput = this.createLabeledInput('Label', connection.label.value, val => connection.label.value = val);
        this.panel.appendChild(nameInput);

        const startInput = this.createLabeledInput('Start', connection.startLabel.value, val => connection.startLabel.value = val);
        this.panel.appendChild(startInput);

        const endInput = this.createLabeledInput('End', connection.endLabel.value, val => connection.endLabel.value = val);
        this.panel.appendChild(endInput);

        const from = document.createElement('div');
        from.textContent = `From: ${connection.fromId}`;
        this.panel.appendChild(from);

        const to = document.createElement('div');
        to.textContent = `To: ${connection.toId}`;
        this.panel.appendChild(to);

        // Agent info
        const agent = this.app.plugins.get('AgentsPlugin')?.getNodeAgent(connection.id);
        if (agent) {
            const agentLabel = document.createElement('div');
            agentLabel.innerHTML = `<strong>Agent:</strong> ${agent.constructor.name}`;
            this.panel.appendChild(agentLabel);
        }

        nameInput.querySelector('input').select()

    }

    createLabeledInput(label, value, onChange) {

        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '8px';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.display = 'block';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.style.width = '100%';
        input.addEventListener('input', () => onChange(input.value));

        wrapper.appendChild(labelEl);
        wrapper.appendChild(input);

        return wrapper;
    }

    clearPanel() {
        this.panel.innerHTML = '<h3>Properties</h3>';
        this.selected = null;
    }
}
