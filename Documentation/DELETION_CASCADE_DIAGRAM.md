# Queue Deletion Cascade Diagram

## Visual Representation

```
┌─────────────────────────────────────────────────────────────────────┐
│                           QUEUE (Parent)                            │
│                         [id: queue-123]                             │
│                                                                      │
│  Protection: Cannot delete if active tickets exist                  │
│  Location: src/server/services/queue.service.ts → deleteQueue()    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ CASCADE DELETE
                                │ (Automatic via Prisma)
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
    ┌────────────────┐  ┌────────────┐  ┌──────────────┐
    │   SERVICES     │  │  COUNTERS  │  │   TICKETS    │
    │ ┌────────────┐ │  │ ┌────────┐ │  │ ┌──────────┐ │
    │ │ Service #1 │ │  │ │Counter1│ │  │ │ Ticket 1 │ │
    │ │ [SVC-001]  │ │  │ │[CTR-A] │ │  │ │ [A-001]  │ │
    │ └────────────┘ │  │ └────────┘ │  │ └──────────┘ │
    │                 │  │            │  │              │
    │ ┌────────────┐ │  │ ┌────────┐ │  │ ┌──────────┐ │
    │ │ Service #2 │ │  │ │Counter2│ │  │ │ Ticket 2 │ │
    │ │ [SVC-002]  │ │  │ │[CTR-B] │ │  │ │ [A-002]  │ │
    │ └────────────┘ │  │ └────────┘ │  │ └──────────┘ │
    │                 │  │            │  │              │
    │ ┌────────────┐ │  │ ┌────────┐ │  │ ┌──────────┐ │
    │ │ Service #3 │ │  │ │Counter3│ │  │ │ Ticket 3 │ │
    │ │ [SVC-003]  │ │  │ │[CTR-C] │ │  │ │ [B-001]  │ │
    │ └────────────┘ │  │ └────────┘ │  │ └──────────┘ │
    └────────────────┘  └────────────┘  └──────────────┘
            │                   │                │
            │                   │                │
            ▼                   ▼                ▼
    [ALL DELETED]       [ALL DELETED]    [ALL DELETED]
                                │
                                │ CASCADE
                                ▼
                        ┌──────────────┐
                        │ TicketEvents │
                        │ ┌──────────┐ │
                        │ │ Event #1 │ │
                        │ │ created  │ │
                        │ └──────────┘ │
                        │ ┌──────────┐ │
                        │ │ Event #2 │ │
                        │ │ called   │ │
                        │ └──────────┘ │
                        │ ┌──────────┐ │
                        │ │ Event #3 │ │
                        │ │ completed│ │
                        │ └──────────┘ │
                        └──────────────┘
                                │
                                ▼
                        [ALL DELETED]


┌─────────────────────────────────────────────────────────────────────┐
│                    ALSO CASCADE DELETED:                            │
│                                                                      │
│  • QueueSessions - All queue session records                        │
│  • DisplayScreens - All display screen configurations               │
│  • Counter-Service M:M relationships - Join table cleaned           │
│  • Staff Assignments - Counter staff assignments removed            │
└─────────────────────────────────────────────────────────────────────┘
```

## Deletion Flow Sequence

```
1. User clicks "Delete" on Queue
   │
   ├─> Permission Check (must be owner/admin)
   │   └─> FAIL → Error: "Unauthorized"
   │
   ├─> Queue Ownership Check
   │   └─> FAIL → Error: "Queue not found or does not belong to your organization"
   │
   ├─> Active Tickets Check
   │   └─> FAIL → Error: "Cannot delete queue with active tickets in progress"
   │
   └─> SUCCESS → Execute: db.queue.delete({ where: { id } })
       │
       └─> Prisma Cascade Triggers (Automatic):
           │
           ├─> Delete all Services (foreign key: Service.queueId)
           │   └─> Clean Counter-Service M:M relationships
           │
           ├─> Delete all Counters (foreign key: Counter.queueId)
           │   └─> Remove Staff Assignments
           │
           ├─> Delete all Tickets (foreign key: Ticket.queueId)
           │   └─> Delete all TicketEvents (foreign key: TicketEvent.ticketId)
           │
           ├─> Delete all QueueSessions (foreign key: QueueSession.queueId)
           │
           └─> Delete all DisplayScreens (foreign key: DisplayScreen.queueId)
```

## Database Schema Relationships

```prisma
model Queue {
  id             String       @id @default(cuid())
  organizationId String
  
  // THESE ALL CASCADE DELETE WHEN QUEUE IS DELETED ↓
  services       Service[]        // ON DELETE CASCADE
  counters       Counter[]        // ON DELETE CASCADE
  tickets        Ticket[]         // ON DELETE CASCADE
  queueSessions  QueueSession[]   // ON DELETE CASCADE
  displayScreens DisplayScreen[]  // ON DELETE CASCADE
}

model Service {
  id      String @id @default(cuid())
  queueId String
  queue   Queue  @relation(fields: [queueId], references: [id])
  // ↑ When Queue deleted → Service deleted
  
  tickets  Ticket[]
  counters Counter[] // M:M relationship
}

model Counter {
  id      String @id @default(cuid())
  queueId String
  queue   Queue  @relation(fields: [queueId], references: [id])
  // ↑ When Queue deleted → Counter deleted
  
  tickets       Ticket[]
  assignedStaff User[]    // M:M relationship
  services      Service[] // M:M relationship
}

model Ticket {
  id        String @id @default(cuid())
  queueId   String
  queue     Queue  @relation(fields: [queueId], references: [id])
  // ↑ When Queue deleted → Ticket deleted
  
  serviceId String
  service   Service @relation(fields: [serviceId], references: [id])
  
  events    TicketEvent[] // CASCADE to events when ticket deleted
}

model TicketEvent {
  id       String @id @default(cuid())
  ticketId String
  ticket   Ticket @relation(fields: [ticketId], references: [id])
  // ↑ When Ticket deleted → TicketEvent deleted
}
```

## Code Implementation

### Queue Service (Protection Layer)

```typescript
// src/server/services/queue.service.ts

export async function deleteQueue(
  id: string,
  userId: string,
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    // Step 1: Authorization check
    const isAuthorized = await checkOwner(userId, organizationId)
    if (!isAuthorized) {
      return fail("You don't have permission to perform this action")
    }

    // Step 2: Ownership verification
    const queueBelongsToOrganization = await verifyQueueInOrganization(id, organizationId)
    if (!queueBelongsToOrganization) {
      return fail("Queue not found or does not belong to your organization")
    }

    // Step 3: Active ticket protection
    const activeTicketCount = await queueRepo.countActiveTickets(id)
    if (activeTicketCount > 0) {
      return fail("Cannot delete queue with active tickets in progress")
    }

    // Step 4: Execute deletion (cascade handled by Prisma)
    await queueRepo.deleteQueue(id)
    return ok(undefined)
  } catch (error: any) {
    console.error("Failed to delete queue:", error)
    return fail("Failed to delete queue. Please try again")
  }
}
```

### Queue Repository (Database Layer)

```typescript
// src/server/repositories/queue.repo.ts

export async function deleteQueue(id: string) {
  // Simple delete - Prisma handles all cascades via foreign key constraints
  return db.queue.delete({
    where: { id },
  })
  // Automatic cascade to:
  // - services
  // - counters
  // - tickets (and their events)
  // - queueSessions
  // - displayScreens
}

export async function countActiveTickets(queueId: string): Promise<number> {
  return db.ticket.count({
    where: {
      queueId,
      status: {
        in: ["waiting", "serving"], // Only active tickets
      },
    },
  })
}
```

## Key Points

### Why Active Ticket Protection Exists
1. **Business Continuity** - Prevents disruption of customers currently being served
2. **Data Integrity** - Ensures no data loss for in-progress transactions
3. **User Experience** - Users must consciously complete or cancel tickets before deletion

### How Cascade Works
1. **Prisma ORM** - Automatically handles cascade via Prisma schema relationships
2. **Database Level** - Foreign key constraints ensure referential integrity
3. **Atomic Operation** - All deletions happen in a single transaction
4. **No Manual Cleanup** - No need to manually delete child records

### What Gets Preserved
- **Nothing** - When a queue is deleted (and passes protection checks), everything related to it is permanently removed
- **Audit Trail** - Consider implementing soft deletes if audit trail is needed in the future

### Future Considerations
1. **Soft Deletes** - Add `deletedAt` timestamp instead of hard delete
2. **Archive Feature** - Move old queues to archive before deletion
3. **Export Before Delete** - Allow exporting historical data before deletion
4. **Confirmation Dialog** - Current implementation has this in the UI
