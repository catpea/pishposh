import { EventEmitter } from 'events';

/**
 * SagaOrchestrator - Industry Standard Saga Pattern Implementation
 *
 * Industry terminology:
 * - Saga: Long-running business process coordinating multiple services
 * - Orchestrator: Central coordinator that manages saga lifecycle
 * - Correlation: Linking related events by correlation key (orderId, userId, etc.)
 * - Choreography: Decentralized coordination through event reactions
 * - Compensation: Rollback actions when saga fails
 * - Saga Instance: Individual execution of a saga definition
 * - Saga Definition: Template defining saga steps and dependencies
 * - Saga State: Current progress and data of a saga instance
 */
class SagaOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.sagaDefinitions = new Map(); // sagaType -> saga definition
    this.sagaInstances = new Map(); // sagaId -> saga instance
    this.correlationIndex = new Map(); // correlationKey -> sagaId
    this.eventHandlers = new Map(); // eventType -> handler functions
    this.compensationHandlers = new Map(); // sagaType -> compensation functions
    this.sequenceNumber = 0;
  }

  /**
   * Define a saga with its dependencies and completion conditions
   * @param {string} sagaType - Type/name of the saga
   * @param {Object} definition - Saga definition object
   */
  defineSaga(sagaType, definition) {
    const {
      correlationKey, // Field to correlate events (e.g., 'orderId', 'userId')
      dependencies = [], // Required events with their filters
      timeout = 300000, // 5 minutes default timeout
      compensations = [], // Compensation actions for rollback
      onComplete = null, // Function to execute when saga completes
      onTimeout = null, // Function to execute when saga times out
      onError = null // Function to execute when saga fails
    } = definition;

    const sagaDefinition = {
      sagaType,
      correlationKey,
      dependencies: dependencies.map(dep => ({
        eventType: dep.eventType,
        filter: dep.filter || (() => true),
        required: dep.required !== false, // Default to required
        alias: dep.alias || dep.eventType, // Alias for referencing in completion
        timeout: dep.timeout || timeout
      })),
      timeout,
      compensations,
      onComplete,
      onTimeout,
      onError,
      createdAt: new Date()
    };

    this.sagaDefinitions.set(sagaType, sagaDefinition);

    // Set up event handlers for this saga's dependencies
    for (const dependency of sagaDefinition.dependencies) {
      this._setupEventHandler(sagaType, dependency);
    }

    return this;
  }

  /**
   * Start a new saga instance
   * @param {string} sagaType - Type of saga to start
   * @param {string} correlationValue - Value to correlate events with
   * @param {Object} initialData - Initial data for the saga
   */
  startSaga(sagaType, correlationValue, initialData = {}) {
    const definition = this.sagaDefinitions.get(sagaType);
    if (!definition) {
      throw new Error(`Saga type '${sagaType}' not defined`);
    }

    const sagaId = `${sagaType}-${correlationValue}-${Date.now()}`;

    const sagaInstance = {
      sagaId,
      sagaType,
      correlationValue,
      state: 'STARTED',
      capturedEvents: new Map(), // alias -> captured event
      requiredEvents: new Set(
        definition.dependencies
          .filter(dep => dep.required)
          .map(dep => dep.alias)
      ),
      completedEvents: new Set(),
      initialData,
      startedAt: new Date(),
      lastUpdated: new Date(),
      sequenceNumber: ++this.sequenceNumber
    };

    this.sagaInstances.set(sagaId, sagaInstance);
    this.correlationIndex.set(correlationValue, sagaId);

    // Set up timeout
    setTimeout(() => {
      this._handleSagaTimeout(sagaId);
    }, definition.timeout);

    this.emit('sagaStarted', {
      sagaId,
      sagaType,
      correlationValue,
      requiredEvents: Array.from(sagaInstance.requiredEvents)
    });

    return sagaId;
  }

  /**
   * Internal method to set up event handlers for saga dependencies
   */
  _setupEventHandler(sagaType, dependency) {
    const handlerKey = `${sagaType}-${dependency.eventType}`;

    if (!this.eventHandlers.has(handlerKey)) {
      const handler = (eventData) => {
        this._handleSagaEvent(sagaType, dependency, eventData);
      };

      this.eventHandlers.set(handlerKey, handler);
      this.on(dependency.eventType, handler);
    }
  }

  /**
   * Handle incoming events for saga processing
   */
  _handleSagaEvent(sagaType, dependency, eventData) {
    const definition = this.sagaDefinitions.get(sagaType);
    const correlationValue = eventData[definition.correlationKey];

    if (!correlationValue) {
      return; // Event doesn't have correlation key
    }

    const sagaId = this.correlationIndex.get(correlationValue);
    if (!sagaId) {
      return; // No active saga for this correlation value
    }

    const sagaInstance = this.sagaInstances.get(sagaId);
    if (!sagaInstance || sagaInstance.state !== 'STARTED') {
      return; // Saga not active
    }

    // Check if event matches the dependency filter
    if (!dependency.filter(eventData)) {
      return; // Event doesn't match filter
    }

    // Capture the event
    const eventRecord = {
      eventType: dependency.eventType,
      eventData,
      capturedAt: new Date(),
      sequenceNumber: ++this.sequenceNumber
    };

    sagaInstance.capturedEvents.set(dependency.alias, eventRecord);
    sagaInstance.completedEvents.add(dependency.alias);
    sagaInstance.lastUpdated = new Date();

    this.emit('sagaEventCaptured', {
      sagaId,
      sagaType,
      eventType: dependency.eventType,
      alias: dependency.alias,
      correlationValue,
      completedCount: sagaInstance.completedEvents.size,
      requiredCount: sagaInstance.requiredEvents.size
    });

    // Check if saga is complete
    this._checkSagaCompletion(sagaId);
  }

  /**
   * Check if saga has all required events and complete if so
   */
  _checkSagaCompletion(sagaId) {
    const sagaInstance = this.sagaInstances.get(sagaId);
    const definition = this.sagaDefinitions.get(sagaInstance.sagaType);

    // Check if all required events are captured
    const allRequiredCaptured = Array.from(sagaInstance.requiredEvents)
      .every(alias => sagaInstance.completedEvents.has(alias));

    if (allRequiredCaptured) {
      this._completeSaga(sagaId);
    }
  }

  /**
   * Complete a saga and emit the completion event
   */
  async _completeSaga(sagaId) {
    const sagaInstance = this.sagaInstances.get(sagaId);
    const definition = this.sagaDefinitions.get(sagaInstance.sagaType);

    sagaInstance.state = 'COMPLETED';
    sagaInstance.completedAt = new Date();

    // Prepare completion data
    const completionData = {
      sagaId,
      sagaType: sagaInstance.sagaType,
      correlationValue: sagaInstance.correlationValue,
      initialData: sagaInstance.initialData,
      capturedEvents: {},
      duration: sagaInstance.completedAt - sagaInstance.startedAt,
      completedAt: sagaInstance.completedAt
    };

    // Include all captured events by alias
    for (const [alias, eventRecord] of sagaInstance.capturedEvents) {
      completionData.capturedEvents[alias] = eventRecord;
    }

    // Execute custom completion handler
    if (definition.onComplete) {
      try {
        await definition.onComplete(completionData);
      } catch (error) {
        this.emit('sagaCompletionError', { sagaId, error });
      }
    }

    // Emit saga completion event
    this.emit('sagaCompleted', completionData);

    // Clean up
    this.correlationIndex.delete(sagaInstance.correlationValue);

    // Keep completed sagas for a while for debugging
    setTimeout(() => {
      this.sagaInstances.delete(sagaId);
    }, 60000); // Remove after 1 minute
  }

  /**
   * Handle saga timeout
   */
  async _handleSagaTimeout(sagaId) {
    const sagaInstance = this.sagaInstances.get(sagaId);
    if (!sagaInstance || sagaInstance.state !== 'STARTED') {
      return; // Saga already completed or doesn't exist
    }

    const definition = this.sagaDefinitions.get(sagaInstance.sagaType);

    sagaInstance.state = 'TIMED_OUT';
    sagaInstance.timedOutAt = new Date();

    const timeoutData = {
      sagaId,
      sagaType: sagaInstance.sagaType,
      correlationValue: sagaInstance.correlationValue,
      capturedEvents: Object.fromEntries(sagaInstance.capturedEvents),
      missingEvents: Array.from(sagaInstance.requiredEvents)
        .filter(alias => !sagaInstance.completedEvents.has(alias)),
      duration: sagaInstance.timedOutAt - sagaInstance.startedAt
    };

    // Execute timeout handler
    if (definition.onTimeout) {
      try {
        await definition.onTimeout(timeoutData);
      } catch (error) {
        this.emit('sagaTimeoutError', { sagaId, error });
      }
    }

    // Emit timeout event
    this.emit('sagaTimedOut', timeoutData);

    // Start compensation if defined
    if (definition.compensations.length > 0) {
      await this._compensateSaga(sagaId, 'TIMEOUT');
    }

    // Clean up
    this.correlationIndex.delete(sagaInstance.correlationValue);
  }

  /**
   * Compensate a saga (rollback)
   */
  async _compensateSaga(sagaId, reason) {
    const sagaInstance = this.sagaInstances.get(sagaId);
    const definition = this.sagaDefinitions.get(sagaInstance.sagaType);

    sagaInstance.state = 'COMPENSATING';

    const compensationData = {
      sagaId,
      sagaType: sagaInstance.sagaType,
      correlationValue: sagaInstance.correlationValue,
      reason,
      capturedEvents: Object.fromEntries(sagaInstance.capturedEvents)
    };

    // Execute compensation actions in reverse order
    for (const compensation of definition.compensations.reverse()) {
      try {
        await compensation(compensationData);
      } catch (error) {
        this.emit('compensationError', { sagaId, compensation, error });
      }
    }

    sagaInstance.state = 'COMPENSATED';
    sagaInstance.compensatedAt = new Date();

    this.emit('sagaCompensated', {
      ...compensationData,
      compensatedAt: sagaInstance.compensatedAt
    });
  }

  /**
   * Get saga instance by correlation value
   */
  getSagaByCorrelation(correlationValue) {
    const sagaId = this.correlationIndex.get(correlationValue);
    return sagaId ? this.sagaInstances.get(sagaId) : null;
  }

  /**
   * Get saga instance by saga ID
   */
  getSagaById(sagaId) {
    return this.sagaInstances.get(sagaId);
  }

  /**
   * Get all active sagas
   */
  getActiveSagas() {
    return Array.from(this.sagaInstances.values())
      .filter(saga => saga.state === 'STARTED');
  }

  /**
   * Get saga statistics
   */
  getSagaStats() {
    const sagas = Array.from(this.sagaInstances.values());
    const stats = {
      total: sagas.length,
      active: sagas.filter(s => s.state === 'STARTED').length,
      completed: sagas.filter(s => s.state === 'COMPLETED').length,
      timedOut: sagas.filter(s => s.state === 'TIMED_OUT').length,
      compensated: sagas.filter(s => s.state === 'COMPENSATED').length,
      definitions: this.sagaDefinitions.size,
      byType: {}
    };

    for (const saga of sagas) {
      if (!stats.byType[saga.sagaType]) {
        stats.byType[saga.sagaType] = {
          total: 0,
          active: 0,
          completed: 0,
          timedOut: 0,
          compensated: 0
        };
      }
      stats.byType[saga.sagaType].total++;
      stats.byType[saga.sagaType][saga.state.toLowerCase()]++;
    }

    return stats;
  }

  /**
   * Cancel a saga manually
   */
  async cancelSaga(sagaId, reason = 'MANUAL_CANCELLATION') {
    const sagaInstance = this.sagaInstances.get(sagaId);
    if (!sagaInstance || sagaInstance.state !== 'STARTED') {
      return false;
    }

    await this._compensateSaga(sagaId, reason);
    return true;
  }

  /**
   * Clean up completed and old sagas
   */
  cleanup(maxAge = 3600000) { // 1 hour default
    const now = Date.now();
    const sagasToDelete = [];

    for (const [sagaId, saga] of this.sagaInstances) {
      const age = now - saga.startedAt.getTime();
      if (saga.state !== 'STARTED' && age > maxAge) {
        sagasToDelete.push(sagaId);
      }
    }

    for (const sagaId of sagasToDelete) {
      this.sagaInstances.delete(sagaId);
    }

    this.emit('sagasCleanedUp', { count: sagasToDelete.length });
    return sagasToDelete.length;
  }
}

export default SagaOrchestrator;

// Example usage:
/*
const sagaOrchestrator = new SagaOrchestrator();

// Define an order processing saga
sagaOrchestrator.defineSaga('orderProcessing', {
  correlationKey: 'orderId',
  dependencies: [
    {
      eventType: 'orderCreated',
      filter: (data) => data.status === 'pending',
      alias: 'order'
    },
    {
      eventType: 'paymentProcessed',
      filter: (data) => data.success === true,
      alias: 'payment'
    },
    {
      eventType: 'inventoryReserved',
      filter: (data) => data.reserved === true,
      alias: 'inventory'
    }
  ],
  timeout: 300000, // 5 minutes
  onComplete: async (completionData) => {
    console.log('Order processing saga completed:', completionData.sagaId);

    // Emit business event
    sagaOrchestrator.emit('orderReadyForFulfillment', {
      orderId: completionData.correlationValue,
      orderData: completionData.capturedEvents.order.eventData,
      paymentData: completionData.capturedEvents.payment.eventData,
      inventoryData: completionData.capturedEvents.inventory.eventData,
      processedAt: new Date()
    });
  },
  compensations: [
    async (compensationData) => {
      // Refund payment
      console.log('Refunding payment for order:', compensationData.correlationValue);
    },
    async (compensationData) => {
      // Release inventory
      console.log('Releasing inventory for order:', compensationData.correlationValue);
    }
  ]
});

// Start a saga
const sagaId = sagaOrchestrator.startSaga('orderProcessing', 'order-123');

// Emit events that will be captured by the saga
sagaOrchestrator.emit('orderCreated', {
  orderId: 'order-123',
  customerId: 'customer-456',
  status: 'pending',
  total: 99.99
});

sagaOrchestrator.emit('paymentProcessed', {
  orderId: 'order-123',
  paymentId: 'payment-789',
  success: true,
  amount: 99.99
});

sagaOrchestrator.emit('inventoryReserved', {
  orderId: 'order-123',
  items: ['item-1', 'item-2'],
  reserved: true
});

// The saga will automatically complete and emit 'orderReadyForFulfillment'
*/
