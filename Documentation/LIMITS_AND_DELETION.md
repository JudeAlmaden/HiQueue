# Queue Limits and Deletion Behavior

## Resource Limits

### Queue Limits
- **Maximum Queues per Organization:** 3
- **Location of Limit Check:** 
  - Backend: `src/server/services/queue.service.ts` in `createQueue()`
  - Frontend: `src/app/dashboard/organizations/[slug]/queues/QueuesManager.tsx`
- **User Experience:**
  - Queue count is displayed as "X / 3 queues used" below the page title
  - "Create Queue" button is disabled when limit is reached
  - Displays "Queue limit reached" message under the disabled button
  - Backend returns error: "Queue limit reached. You can create up to 3 queues per organization."

### Service Limits
- **Maximum Services per Queue:** 50
- **Location of Limit Check:**
  - Backend: `src/server/services/service.service.ts` in `createService()`
  - Frontend: `src/components/services/ServiceList.tsx`
- **User Experience:**
  - "Add Service" button is disabled when limit is reached
  - Displays "Limit reached" message under the disabled button
  - Backend returns error: "Service limit reached. You can create up to 50 services per queue."
- **Note:** This limit is intentionally "hidden" in the sense that it's not prominently advertised in the UI, but enforced at both the backend and frontend level

### Member Limits
- **Maximum Total Members per Organization:** 30
- **Maximum Staff Members:** 25
- **Maximum Admin Members:** 5
- **Owner Members:** 1 (system enforced)
- **Location of Limit Check:**
  - Backend: `src/server/services/member.service.ts` in `createMember()` (MEMBER_LIMITS constant)
  - Frontend: `src/app/dashboard/organizations/[slug]/members/MembersManager.tsx`
- **User Experience:**
  - Displays "X / 30 total members • X / 25 staff • X / 5 admins"
  - Counts turn red when limits are reached
  - "Add Member" button is disabled when total limit is reached
  - Shows "Member limit reached" message under disabled button
  - Backend returns specific errors:
    - "Member limit reached. You can have up to 30 members per organization."
    - "Staff member limit reached. You can have up to 25 staff members."
    - "Admin limit reached. You can have up to 5 admins."
- **Important Notes:**
  - Owner cannot remove themselves or other owners
  - Members cannot be removed if assigned to counters (must unassign first)
  - Removal implements **soft delete**: membership deleted, user account marked inactive if no other memberships exist

### Counter Limits
- **Maximum Counters per Queue:** 20
- **Location of Limit Check:**
  - Backend: `src/server/services/counter.service.ts` in `createCounter()`
  - Frontend: `src/components/counters/CounterList.tsx`
- **User Experience:**
  - Counter count is displayed as "X / 20 counters" below the page title
  - "Add Counter" button is disabled when limit is reached
  - Displays "Counter limit reached" message under the disabled button
  - Backend returns error: "Counter limit reached. You can create up to 20 counters per queue."

## Deletion Cascade Behavior

### Queue Deletion

**Process Flow:**
1. User clicks "Delete" button on a queue
2. System validates permissions (must be owner/admin)
3. System checks for active tickets

**What Happens:**

#### ✅ Successful Deletion (Cascade)
When a queue is deleted **with no active tickets**, the following happens automatically via Prisma cascade:

```prisma
// Queue.prisma relationships
services       Service[]        // ← All services deleted
queueSessions  QueueSession[]   // ← All queue sessions deleted
tickets        Ticket[]         // ← All tickets (completed/cancelled) deleted
counters       Counter[]        // ← All counters deleted
displayScreens DisplayScreen[]  // ← All display screens deleted
```

**Cascading Deletions:**
1. **Services** → All services under the queue are deleted
   - Any tickets referencing these services are also deleted (via foreign key)
2. **Counters** → All counters under the queue are deleted
   - Counter-to-Service many-to-many relationships are cleaned up
   - Staff assignments to these counters are removed
3. **Tickets** → All ticket records are deleted
   - Associated `TicketEvent` records are deleted (via Prisma cascade)
4. **Queue Sessions** → All queue session records are deleted
5. **Display Screens** → All display screen configurations are deleted

**Code Location:**
- Service: `src/server/services/queue.service.ts` → `deleteQueue()`
- Repository: `src/server/repositories/queue.repo.ts` → `deleteQueue()`
- Prisma operation: Simple `db.queue.delete()` - Prisma handles cascade

#### ❌ Failed Deletion
Deletion **fails** if there are **active tickets** (status: "waiting" or "serving"):

```typescript
// Check for active tickets before deletion
const activeTicketCount = await queueRepo.countActiveTickets(id)
if (activeTicketCount > 0) {
  return fail("Cannot delete queue with active tickets in progress")
}
```

**Why this protection exists:**
- Prevents disruption of currently waiting customers
- Ensures no data loss for in-progress service
- Maintains business continuity

**User Experience:**
- Error message: "Cannot delete queue with active tickets in progress"
- User must complete or cancel all active tickets first
- Dialog warns: "This will permanently remove all associated services, counters, and history. This action cannot be undone, and will fail if there are active tickets in progress."

### Service Deletion

**Process Flow:**
1. User clicks delete on a service
2. System validates permissions (must be owner)
3. System checks for active tickets

**What Happens:**

#### ✅ Successful Deletion
```typescript
// service.service.ts → deleteService()
const activeTicketCount = await serviceRepo.countActiveTicketsForService(id)
if (activeTicketCount > 0) {
  return fail("Cannot delete service with active tickets in progress")
}

await serviceRepo.deleteService(id)
```

**Cascading:**
- Service record is deleted
- Historical tickets remain (if already completed/cancelled)
- Counter-to-Service relationships are cleaned up

#### ❌ Failed Deletion
- Same as queue: cannot delete if active tickets exist for this service

### Counter Deletion

**Process Flow:**
Similar to services - counters with active ticket assignments cannot be deleted.

**Cascading:**
- Counter record is deleted
- Staff assignments to this counter are removed
- Counter-to-Service many-to-many relationships are cleaned up

### Member Deletion (Soft Delete)

**Process Flow:**
```
User (owner) clicks "Remove" 
  ↓
Permission Check (must be owner)
  ↓
Cannot be self / Cannot be owner role
  ↓
Association Check (counter assignments)
  ↓
┌─────────────┬──────────────┐
Has assignments   No assignments
    ↓                  ↓
❌ FAIL          ✅ SUCCESS
    ↓                  ↓
Error msg      Delete membership (hard)
               Check other orgs
                     ↓
        ┌────────────┴────────────┐
   Has other orgs          No other orgs
        ↓                         ↓
   User active            Was created by
                          another user?
                         ↓            ↓
                       Yes           No
                         ↓            ↓
                  Soft Delete    User active
                  (isActive=false,
                   deletedAt=now)
```

**Soft Delete Behavior:**
1. **Membership is deleted** (hard delete from OrganizationMembership table)
2. **User account status depends on:**
   - If user has other organization memberships → User remains active
   - If user has no other memberships AND was created by another user (staff member):
     - `isActive` set to `false`
     - `deletedAt` set to current timestamp
     - User account preserved for audit trail
   - If user has no other memberships AND was self-registered → User remains active

**Why Soft Delete:**
- Preserves audit trail and historical data integrity
- Allows potential recovery
- Supports compliance requirements

**Code Location:**
- Service: `src/server/services/member.service.ts` → `deleteMember()`
- Repository: `src/server/repositories/member.repo.ts` → `softDeleteMember()`

#### ❌ Failed Deletion
Member deletion **fails** if assigned to any counters:

**Error Message:** "Cannot remove member. They are assigned to X counters. Please unassign them first."

**Resolution:** Go to counter management → unassign staff → then remove member

## Database Schema Relationships

### Foreign Key Constraints

```prisma
// Service.prisma
model Service {
  id      String @id @default(cuid())
  queueId String
  queue   Queue  @relation(fields: [queueId], references: [id])
  // ↑ When Queue is deleted, Service is deleted (onDelete: Cascade - default)
}

// Counter.prisma
model Counter {
  id      String @id @default(cuid())
  queueId String
  queue   Queue  @relation(fields: [queueId], references: [id])
  // ↑ When Queue is deleted, Counter is deleted
}

// Ticket.prisma (not shown but similar)
// - Ticket → Queue relationship cascades
// - Ticket → Service relationship (typically SET NULL or CASCADE)
```

### Prisma Default Behavior
By default, Prisma uses `onDelete: Cascade` for required relationships (non-nullable foreign keys), which means:
- Deleting a parent (Queue) automatically deletes all children (Services, Counters, Tickets, etc.)
- This is handled at the database level (efficient and atomic)
- No additional code needed in the repository

## Summary Table

| Resource | Limit | Enforced At | Deletion Protection |
|----------|-------|-------------|---------------------|
| **Queues** | 3 per organization | Backend + Frontend | Cannot delete with active tickets |
| **Services** | 50 per queue | Backend + Frontend | Cannot delete with active tickets |
| **Counters** | 20 per queue | Backend + Frontend | Cannot delete with assigned staff |
| **Members (Total)** | 30 per organization | Backend + Frontend | Cannot delete if assigned to counters |
| **Members (Staff)** | 25 per organization | Backend + Frontend | Soft delete (preserve audit trail) |
| **Members (Admin)** | 5 per organization | Backend + Frontend | Soft delete (preserve audit trail) |
| **Members (Owner)** | 1 per organization | System | Cannot be deleted |

## Implementation Checklist

- [x] Queue limit: 3 per organization
- [x] Queue limit: Backend validation in `queue.service.ts`
- [x] Queue limit: Frontend display in `QueuesManager.tsx`
- [x] Queue limit: Disable create button when limit reached
- [x] Service limit: 50 per queue
- [x] Service limit: Backend validation in `service.service.ts`
- [x] Service limit: Frontend display in `ServiceList.tsx`
- [x] Service limit: Disable create button when limit reached
- [x] Queue deletion: Active ticket check before deletion
- [x] Queue deletion: Cascade deletion of services and counters
- [x] Service deletion: Active ticket check before deletion
- [x] Display service/counter counts on queue cards
- [x] Documentation of limits and cascade behavior

## Visual Cascade Diagram

```
                    QUEUE (Parent)
                   [id: queue-123]
                         │
            Protection: Cannot delete if
              active tickets exist
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    SERVICES        COUNTERS         TICKETS
    ┌────────┐      ┌────────┐      ┌────────┐
    │SVC-001 │      │Counter1│      │ A-001  │
    │SVC-002 │      │Counter2│      │ A-002  │
    │SVC-003 │      │Counter3│      │ B-001  │
    └────────┘      └────────┘      └────────┘
         │               │                │
         ▼               ▼                ▼
    ALL DELETED    ALL DELETED       ALL DELETED
                        │                │
                        ▼                ▼
                  Staff          TicketEvents
                Assignments        (cascade)
                 removed
```

**Also Cascade Deleted:**
- QueueSessions - All queue session records
- DisplayScreens - All display screen configurations
- Counter-Service M:M relationships
- Staff Assignments to counters

## Future Considerations

1. **Subscription Tiers:** Different limits based on subscription level (e.g., Free: 1 queue, Pro: 3 queues, Enterprise: unlimited)
2. **Archive Feature:** Allow archiving old queues instead of deletion
3. **Bulk Operations:** Add ability to bulk-delete completed tickets to save storage
4. **Soft Delete Management UI:** View and restore soft-deleted members
