You've identified a really powerful pattern! The "action" vs "actionCompleted" (or "actionPre" vs "actionPost") naming strategy is indeed widely used. Here are several other event naming strategies that companies and frameworks employ:

## Lifecycle-Based Naming

Many frameworks use lifecycle phases:
- `beforeCreate`, `created`, `beforeMount`, `mounted` (Vue.js)
- `componentWillMount`, `componentDidMount`, `componentWillUnmount` (React)
- `willSet`, `didSet` (property observers)

## State Transition Events

Following state machine patterns:
- `connecting`, `connected`, `disconnecting`, `disconnected`
- `loading`, `loaded`, `error`
- `pending`, `resolved`, `rejected` (Promise-like states)

## CRUD + Status Pattern

Combining operation with status:
- `userCreating`, `userCreated`, `userCreateFailed`
- `dataFetching`, `dataFetched`, `dataFetchError`
- `recordUpdating`, `recordUpdated`, `recordUpdateError`

## Domain-Specific Namespacing

Using prefixes for different domains:
- `ui:modalOpen`, `ui:modalClose`
- `data:sync`, `data:conflict`
- `network:online`, `network:offline`
- `auth:login`, `auth:logout`, `auth:expire`

## Intent vs Result Pattern

Similar to your approach but with different naming:
- `requestSave` → `saveComplete`
- `attemptLogin` → `loginSuccess`/`loginFailure`
- `initiatePayment` → `paymentProcessed`

## Progressive Enhancement Events

For gradual system awareness:
- `moduleLoading`, `moduleReady`, `moduleActive`
- `serviceRegistering`, `serviceAvailable`, `serviceOnline`

## Command-Query Separation

Distinguishing between commands and queries:
- `executeBackup` vs `backupStatus`
- `performCalculation` vs `calculationResult`

The pattern you're using with "stationAdd" followed by "stationAdded" is particularly effective because it allows for:
- Validation and cancellation in the first event
- System-wide notification in the second event
- Clean separation of concerns between different listeners
- Plugin architectures where different components care about different phases

This approach is used by systems like WordPress hooks, Node.js streams, and many enterprise event-driven architectures. The key insight is that different parts of your application often care about different moments in a process's lifecycle.
