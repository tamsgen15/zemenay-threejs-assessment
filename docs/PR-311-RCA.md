# PR-311: Intermittent Agile Module Loading Failure

## Priority: Medium 🟡

## Problem Statement
Agile modules created successfully fail intermittently to load into the schematic canvas with vague error message: "failed to load". No diagnostic information provided to user.

## Root Cause Hypotheses

### Hypothesis 1: Authentication Token Expiration (Auth Failure)
**Likelihood**: HIGH

**Description**: The authentication token expires between module creation and loading attempt, causing intermittent 401/403 errors that are not properly surfaced to the user.

**Why Intermittent**: 
- Token has a time-to-live (TTL)
- Users who load modules immediately after creation succeed
- Users who wait or navigate away experience token expiration

**Debugging Plan**:
1. **Check Client-Side Token State**
   - Location: Browser DevTools → Application → Local Storage
   - Action: Log token timestamp and expiration
   - Validation: Compare token TTL with time between creation and load

2. **Inspect Network Response**
   - Location: Browser DevTools → Network Tab → Failed Request
   - Action: Check response status code and headers
   - Expected: 401 Unauthorized or 403 Forbidden

3. **Review Server Auth Logs**
   - Location: `/var/log/auth.log` or Auth Service logs
   - Query: `grep "token_expired" auth.log | grep "module_load"`
   - Expected: Correlation between load failures and expired tokens

**Fix**: Implement token refresh mechanism before module load requests.

---

### Hypothesis 2: Database Connection Pool Exhaustion (Data Failure)
**Likelihood**: MEDIUM-HIGH

**Description**: The database connection pool reaches maximum capacity during peak usage, causing module load queries to timeout or fail intermittently.

**Why Intermittent**:
- Occurs only under concurrent load
- Connection pool has limited size
- Some requests succeed when connections are available

**Debugging Plan**:
1. **Monitor Database Connection Metrics**
   - Location: Database monitoring dashboard (e.g., Supabase Dashboard → Database → Connections)
   - Query: 
     ```sql
     SELECT count(*), state FROM pg_stat_activity 
     GROUP BY state;
     ```
   - Expected: High number of 'active' or 'idle in transaction' connections during failures

2. **Check Application Connection Pool Config**
   - Location: Backend config file (e.g., `database.config.js`)
   - Action: Review `max_connections`, `pool_size`, `connection_timeout`
   - Validation: Compare with actual concurrent user load

3. **Analyze Query Performance**
   - Location: Database slow query log
   - Query:
     ```sql
     SELECT query, calls, mean_exec_time, max_exec_time 
     FROM pg_stat_statements 
     WHERE query LIKE '%module%' 
     ORDER BY mean_exec_time DESC;
     ```
   - Expected: Module load queries with high execution time or timeouts

**Fix**: Increase connection pool size or implement connection queuing with proper timeout handling.

---

### Hypothesis 3: Race Condition in Module State Synchronization (Service Failure)
**Likelihood**: MEDIUM

**Description**: A race condition exists between the module creation service and the module loading service, where the module metadata is not fully committed/indexed before the load request is processed.

**Why Intermittent**:
- Depends on timing between services
- Fast networks/systems may succeed
- Slower systems or high latency causes failures

**Debugging Plan**:
1. **Add Distributed Tracing**
   - Location: Application Performance Monitoring (APM) tool or custom logging
   - Action: Implement trace IDs across module creation and load operations
   - Data Points:
     ```
     - module_create_start: timestamp
     - module_create_db_commit: timestamp
     - module_create_cache_update: timestamp
     - module_load_request: timestamp
     - module_load_db_query: timestamp
     ```
   - Expected: Load requests occurring before cache/index update completion

2. **Check Message Queue/Event Bus Lag**
   - Location: Message broker logs (e.g., RabbitMQ, Kafka, Redis)
   - Metrics: Queue depth, consumer lag, processing time
   - Expected: Delays in event propagation from creation to indexing service

3. **Verify Database Replication Lag**
   - Location: Database replication monitoring
   - Query:
     ```sql
     SELECT client_addr, state, sync_state, 
            replay_lag, write_lag, flush_lag
     FROM pg_stat_replication;
     ```
   - Expected: Read replicas lagging behind primary during failures

**Fix**: Implement eventual consistency handling with retry logic or synchronous confirmation before allowing load attempts.

---

## Recommended Debugging Sequence

1. **Immediate Action** (5 minutes):
   - Check browser console and network tab during failure
   - Capture full error response and headers

2. **Short-term Analysis** (30 minutes):
   - Review server logs for correlation with failure timestamp
   - Check authentication service logs
   - Monitor database connection pool metrics

3. **Deep Dive** (2-4 hours):
   - Implement comprehensive logging in ModuleLoader
   - Add distributed tracing across services
   - Perform load testing to reproduce issue consistently

## Implementation: Enhanced Error Handling

The `ModuleLoader.js` implementation includes:
- Detailed error logging with timestamps
- Auth token presence validation
- Timeout handling with configurable limits
- Retry logic with exponential backoff
- Comprehensive failure metrics for RCA

This enables precise identification of which hypothesis is causing the intermittent failures.
