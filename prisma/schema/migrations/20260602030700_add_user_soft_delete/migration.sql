-- AlterTable
ALTER TABLE "User" ADD COLUMN "deletedAt" DATETIME;

-- CreateTable
CREATE TABLE "_CounterToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CounterToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Counter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CounterToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Counter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "queueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentTicketId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Counter_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Counter_currentTicketId_fkey" FOREIGN KEY ("currentTicketId") REFERENCES "Ticket" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Counter" ("currentTicketId", "id", "isActive", "name", "queueId") SELECT "currentTicketId", "id", "isActive", "name", "queueId" FROM "Counter";
DROP TABLE "Counter";
ALTER TABLE "new_Counter" RENAME TO "Counter";
CREATE UNIQUE INDEX "Counter_currentTicketId_key" ON "Counter"("currentTicketId");
CREATE TABLE "new_Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "queueId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "queueSessionId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "customer" TEXT NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "counterId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calledAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "Ticket_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_queueSessionId_fkey" FOREIGN KEY ("queueSessionId") REFERENCES "QueueSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ticket_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "Counter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("calledAt", "code", "completedAt", "createdAt", "customer", "id", "number", "organizationId", "priority", "queueId", "queueSessionId", "serviceId", "startedAt", "status") SELECT "calledAt", "code", "completedAt", "createdAt", "customer", "id", "number", "organizationId", "priority", "queueId", "queueSessionId", "serviceId", "startedAt", "status" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_CounterToService_AB_unique" ON "_CounterToService"("A", "B");

-- CreateIndex
CREATE INDEX "_CounterToService_B_index" ON "_CounterToService"("B");
