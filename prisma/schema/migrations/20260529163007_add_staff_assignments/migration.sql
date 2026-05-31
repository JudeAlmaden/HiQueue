-- CreateTable
CREATE TABLE "_StaffAssignments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_StaffAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "Counter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_StaffAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_StaffAssignments_AB_unique" ON "_StaffAssignments"("A", "B");

-- CreateIndex
CREATE INDEX "_StaffAssignments_B_index" ON "_StaffAssignments"("B");
