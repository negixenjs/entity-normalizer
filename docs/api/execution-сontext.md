## Execution Context

Nexigen uses `executionAsyncContext` to propagate **execution intent**
through async boundaries.

This allows lower layers (transport, cache, retry)
to adjust behavior without polluting public APIs.

Example intents:

- normal
- refresh

Typical use cases:

- bypassing TTL cache on refresh
- background revalidation
- reconnect / retry flows
