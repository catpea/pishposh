export class AgentsPlugin {
    constructor() {
        this.nodeAgents = new Map();
        this.connectionAgents = new Map();
    }

    init(app) {
        this.app = app;
        this.graph = app.graph;

        this.agentLibrary = app.plugins.get('AgentLibraryPlugin');

        // Create agents when graph elements are added
        this.graph.on('nodeAdded', node => this.createNodeAgent(node));
        this.graph.on('connectionAdded', conn => this.createConnectionAgent(conn));

        // Clean up on removal
        this.graph.on('nodeRemoved', node => this.removeNodeAgent(node.id));
        this.graph.on('connectionRemoved', conn => this.removeConnectionAgent(conn.id));

    }

    createNodeAgent(node) {

        const agentType = node.type;
        const agent = this.agentLibrary.createAgent(node.id, agentType);
        console.log('Lol!', agentType,  agent)


        if (!agent) {
            console.warn(`No agent found for type: ${agentType}`);
            return;
        }

        // Store agent and attach node metadata
        this.nodeAgents.set(node.id, agent);
        node.agent = agent;
        // Hook up event listener if needed
        agent.on('output', e => {
            this.app.emit('agentOutput', { nodeId: node.id, data: e.detail });
        });

        this.app.emit('agentCreated',  agent );
        agent.start()
        this.app.emit('agentStarted',  agent );
        console.log('agentStarted', { kind: 'node', id: node.id, agent });
    }

    createConnectionAgent(connection) {
      console.info('connection', connection)

        const fromAgent = this.nodeAgents.get(connection.fromId);
        const toAgent = this.nodeAgents.get(connection.toId);

        const agentType = connection.type;
        const connectionAgent = this.agentLibrary.createAgent(connection.id, agentType);
        this.app.emit('connectionCreated',  connectionAgent );

        if (!connectionAgent) {
            console.warn(`No connection agent found for type: ${agentType}`);
            return;
        }

        this.connectionAgents.set(connection.id, connectionAgent);
        connection.agent = connectionAgent;




        // Hook up event listener

        // fromAgent output is converted to connectionAgent input
        const incomingSubscription = fromAgent.on('output', e => connectionAgent.emit('input', e) );
        // and then when connectionAgent sends output, it is passed along as input to the toAgent.
        const outgoingSubscription = connectionAgent.on('output', e => toAgent.emit('input', e) );

        // subscriptions are removed on stop
        connectionAgent.subscriptions.add(incomingSubscription);
        connectionAgent.subscriptions.add(outgoingSubscription);



        connectionAgent.start()
        this.app.emit('agentStarted', { kind: 'connection', id: connection.id, agent: connectionAgent, fromAgent, toAgent });
    }

    removeNodeAgent(nodeId) {
        const agent = this.nodeAgents.get(nodeId);
        if (agent && agent.stop instanceof Function) {
            agent.stop();
        }
        this.nodeAgents.delete(nodeId);
    }

    removeConnectionAgent(connectionId) {
        const agent = this.connectionAgents.get(connectionId);
        if (agent && agent.stop instanceof Function) {
            agent.stop();
        }
        this.connectionAgents.delete(connectionId);
    }

    getNodeAgent(nodeId) {
        return this.nodeAgents.get(nodeId);
    }

    getConnectionAgent(connectionId) {
        return this.connectionAgents.get(connectionId);
    }

    // Optional: trigger data send through an agent
    sendToNode(nodeId, input) {
        const agent = this.getNodeAgent(nodeId);
        if (agent && agent.send) {
            agent.send(input);
        }
    }

    sendToConnection(connectionId, input) {
        const agent = this.getConnectionAgent(connectionId);
        if (agent && agent.send) {
            agent.send(input);
        }
    }
}
