# Member Limits and Soft Delete Implementation

## Overview

This document describes the member management limits and soft delete functionality implemented for organization members in HiQueue.

## Member Limits

### Limit Configuration

**Location:** `src/server/services/member.service.ts`

```typescript
const MEMBER_LIMITS = {
  staff: 20,    // Soft limit for staff members (enforced)
  admin: 5,     // Hard limit for admin members
  total: 30,    // Hard limit for total members per organization
}
```

### Limit Types

| Role | Limit | Type | Description |
|------|-------|------|-------------|
| **Staff** | 20 | Enforced | Maximum number of staff (counter operators) per organization |
| **Admin** | 5 | Enforced | Maximum number of admins (operations managers) per organization |
| **Total** | 30 | Enforced | Maximum total members (including owner) per organization |
| **Owner** | 1 | System | Each organization has exactly 1 owner (not counted in limits) |

### Backend Validation

**File:** `src/server/services/member.service.ts` → `createMember()`

```typescript
// Check total limit
if (totalCount >= MEMBER_LIMITS.total) {
  return fail(`Member limit reached. You can have up to ${MEMBER_LIMITS.total} members per organization.`)
}

// Check role-specific limits
if (input.role === "staff" && (roleCounts.staff || 0) >= MEMBER_LIMITS.staff) {
  return fail(`Staff member limit reached. You can have up to ${MEMBER_LIMITS.staff} staff members.`)
}

if (input.role === "admin" && (roleCounts.admin || 0) >= MEMBER_LIMITS.admin) {
  return fail(`Admin limit reached. You can have up to ${MEMBER_LIMITS.admin} admins.`)
}
```

### Frontend Display

**File:** `src/app/dashboard/organizations/[slug]/members/MembersManager.tsx`

The members page displays:
- **Total count:** "X / 30 total members"
- **Staff count:** "X / 20 staff"
- **Admin count:** "X / 5 admins"
- Counts turn red when limits are reached
- "Add Member" button is disabled when total limit is reached
- Shows "Member limit reached" message under disabled button

## Soft Delete Implementation

### Database Schema

**File:** `prisma/schema/User.prisma`

```prisma
model User {
  id            String          @id @default(cuid())
  name          String?
  email         String?         @unique
  password      String?
  
  isActive  Boolean   @default(true)
  deletedAt DateTime? // Soft delete timestamp
  
  memberships OrganizationMembership[]
  assignedCounters Counter[] @relation("StaffAssignments")
  
  createdById  String?
  createdBy    User?   @relation("UserCreator", fields: [createdById], references: [id])
  createdUsers User[]  @relation("UserCreator")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Migration:** `prisma/schema/migrations/20260602030700_add_user_soft_delete/migration.sql`

### How Soft Delete Works

When a member is removed from an organization:

1. **Membership is deleted** (hard delete)
   - The `OrganizationMembership` record is permanently removed

2. **User account status depends on conditions:**
   - If user has **other organization memberships**: User account remains active
   - If user has **no other memberships** AND was **created by another user** (staff member):
     - `isActive` set to `false`
     - `deletedAt` set to current timestamp
     - User account is soft deleted (preserved for audit trail)
   - If user has **no other memberships** AND was **self-registered**:
     - User account remains active (can be used for future organization)

### Association Checks Before Deletion

**File:** `src/server/services/member.service.ts` → `deleteMember()`

Before allowing deletion, the system checks for **counter assignments**:

```typescript
// Check for counter assignments (association check)
const counterAssignments = await db.counter.count({
  where: {
    assignedStaff: {
      some: {
        id: input.id,
      },
    },
  },
})

if (counterAssignments > 0) {
  return fail(
    `Cannot remove member. They are assigned to ${counterAssignments} counter${
      counterAssignments > 1 ? "s" : ""
    }. Please unassign them first.`
  )
}
```

**What This Prevents:**
- Cannot remove a staff member who is currently assigned to any counters
- Ensures no orphaned counter assignments
- Maintains data integrity for queue operations

**User Experience:**
- Clear error message: "Cannot remove member. They are assigned to 3 counters. Please unassign them first."
- User must go to counter management and unassign the member before removal
- Prevents operational disruption

### Deletion Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│         User clicks "Remove Member" button              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
        ┌────────────────────────────┐
        │  Permission Check          │
        │  (must be owner)           │
        └────────┬───────────────────┘
                 │
                 ▼
        ┌────────────────────────────┐
        │  Cannot be self            │
        │  (owner cannot remove self)│
        └────────┬───────────────────┘
                 │
                 ▼
        ┌────────────────────────────┐
        │  Cannot be owner role      │
        │  (owners cannot be removed)│
        └────────┬───────────────────┘
                 │
                 ▼
        ┌────────────────────────────┐
        │  Association Check         │
        │  (check counter assignments)│
        └────────┬───────────────────┘
                 │
        ┌────────┼────────┐
        │        │        │
        ▼        ▼        ▼
    Has assignments   No assignments
        │                │
        │                ▼
        │        ┌───────────────────┐
        │        │ Delete membership │
        │        │ (hard delete)     │
        │        └─────────┬─────────┘
        │                  │
        │                  ▼
        │          ┌───────────────────┐
        │          │ Check other orgs  │
        │          └─────────┬─────────┘
        │                    │
        │          ┌─────────┼─────────┐
        │          │                   │
        │          ▼                   ▼
        │    Has other orgs      No other orgs
        │          │                   │
        │          │                   ▼
        │          │          ┌────────────────┐
        │          │          │ Was created by │
        │          │          │ another user?  │
        │          │          └────────┬───────┘
        │          │                   │
        │          │          ┌────────┼────────┐
        │          │          │                 │
        │          │          ▼                 ▼
        │          │        Yes               No
        │          │          │                 │
        │          │          ▼                 │
        │          │  ┌──────────────┐          │
        │          │  │ Soft Delete  │          │
        │          │  │ isActive=false│         │
        │          │  │ deletedAt=now│          │
        │          │  └──────────────┘          │
        │          │                            │
        │          ▼                            ▼
        │    User remains     User remains      User remains
        │    active           active            active
        │
        ▼
    ❌ ERROR
    "Cannot remove member.
     They are assigned to
     X counters. Please
     unassign them first."
```

## Implementation Details

### Service Layer

**File:** `src/server/services/member.service.ts`

#### Create Member (with limits)
- Checks total member count
- Checks role-specific counts
- Enforces limits before creation
- Returns descriptive error messages

#### Delete Member (with soft delete)
- Validates permissions
- Checks counter assignments
- Calls `memberRepo.softDeleteMember()`
- Handles all business logic

### Repository Layer

**File:** `src/server/repositories/member.repo.ts`

#### softDeleteMember()
```typescript
export async function softDeleteMember(userId: string, organizationId: string) {
  return db.$transaction(async (tx) => {
    // 1. Delete the membership (hard)
    await tx.organizationMembership.delete({
      where: { userId_organizationId: { userId, organizationId } },
    })

    // 2. Check if user has other memberships
    const otherMemberships = await tx.organizationMembership.findFirst({
      where: {
        userId,
        organizationId: { not: organizationId },
      },
    })

    // 3. Soft delete user if no other memberships and was created by another user
    if (!otherMemberships) {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { createdById: true },
      })

      if (user?.createdById) {
        await tx.user.update({
          where: { id: userId },
          data: {
            isActive: false,
            deletedAt: new Date(),
          },
        })
      }
    }
  })
}
```

### Frontend Components

**File:** `src/app/dashboard/organizations/[slug]/members/MembersManager.tsx`

- Displays member counts with limits
- Disables "Add Member" button when limit reached
- Shows warning message when at capacity
- Color-codes counts (red when at limit)

**File:** `src/components/members/DeleteMemberDialog.tsx`

- Updated warning message about soft delete
- Mentions counter assignment requirement
- Explains account deactivation

## User Roles and Permissions

| Role | Can Add Members | Can Remove Members | Can Be Removed |
|------|----------------|-------------------|----------------|
| **Owner** | ✅ Yes | ✅ Yes (except self and other owners) | ❌ No |
| **Admin** | ❌ No | ❌ No | ✅ Yes (by owner) |
| **Staff** | ❌ No | ❌ No | ✅ Yes (by owner) |

## Benefits of Soft Delete

1. **Audit Trail**
   - Preserves user account for audit purposes
   - Can track who was deleted and when
   - Maintains historical data integrity

2. **Data Recovery**
   - User account can be reactivated if needed
   - No data loss on accidental deletion
   - Can restore membership later

3. **Compliance**
   - Meets data retention requirements
   - Supports compliance audits
   - Enables forensic analysis

4. **Association Tracking**
   - Maintains references to created users
   - Preserves relationship chains
   - Supports future features (e.g., "Show deleted members")

## Edge Cases Handled

### 1. Member with Counter Assignments
**Scenario:** Owner tries to remove a staff member assigned to counters  
**Result:** ❌ Error - "Cannot remove member. They are assigned to X counters. Please unassign them first."  
**Resolution:** Owner must go to counter management → unassign staff → then remove member

### 2. Member with Multiple Organizations
**Scenario:** Member belongs to Organization A and Organization B  
**Result:** Membership in Organization A deleted, user account remains active  
**Reason:** User still needs access to Organization B

### 3. Self-Registered User
**Scenario:** User registered themselves (createdById is null)  
**Result:** Membership deleted, user account remains active  
**Reason:** User owns their account and may want to join another organization

### 4. Created by Another User
**Scenario:** User was created by an owner/admin (createdById is not null)  
**Result:** Membership deleted, user account soft deleted (isActive=false, deletedAt=now)  
**Reason:** User was created as a staff member, not self-registered

### 5. Owner Trying to Remove Self
**Scenario:** Owner clicks "Remove" on their own account  
**Result:** ❌ Error - "Organization owners cannot remove themselves from member management."  
**Resolution:** Must transfer ownership first (future feature)

### 6. Trying to Remove Another Owner
**Scenario:** Owner tries to remove another owner  
**Result:** ❌ Error - "Organization owners cannot be removed from member management."  
**Reason:** System prevents owner removal (each org should have exactly 1 owner)

## Testing Checklist

- [ ] Try adding 31st member (should fail with "Member limit reached")
- [ ] Try adding 21st staff member (should fail with "Staff member limit reached")
- [ ] Try adding 6th admin (should fail with "Admin limit reached")
- [ ] Verify member counts display correctly (X / Y format)
- [ ] Verify "Add Member" button disabled at limit
- [ ] Try removing member with counter assignments (should fail)
- [ ] Remove member without counter assignments (should succeed)
- [ ] Verify soft delete: isActive=false, deletedAt is set
- [ ] Verify member with multiple orgs stays active after removal from one
- [ ] Verify self-registered user stays active after membership removal
- [ ] Try owner removing themselves (should fail)
- [ ] Try removing an owner (should fail)

## Configuration

To change limits, update the constants in `src/server/services/member.service.ts`:

```typescript
const MEMBER_LIMITS = {
  staff: 20,    // Adjust as needed
  admin: 5,     // Adjust as needed
  total: 30,    // Adjust as needed
}
```

Also update the frontend constants in `src/app/dashboard/organizations/[slug]/members/MembersManager.tsx`:

```typescript
const MEMBER_LIMITS = {
  staff: 20,
  admin: 5,
  total: 30,
}
```

## Future Enhancements

1. **Subscription-Based Limits**
   - Different limits per subscription tier
   - Free: 5 members, Pro: 30 members, Enterprise: unlimited
   - Store limits in organization/subscription table

2. **Soft Delete Management UI**
   - View soft-deleted members
   - Restore deleted members
   - Permanently delete (hard delete) old soft-deleted accounts

3. **Bulk Operations**
   - Bulk unassign from counters
   - Bulk role changes
   - Bulk member import

4. **Advanced Association Checks**
   - Check if member has active tickets
   - Check if member has created queues/services
   - Show detailed association report before deletion

5. **Ownership Transfer**
   - Allow owner to transfer ownership to another member
   - Then allow owner to leave/be removed

## Related Documentation

- [Queue and Service Limits](./LIMITS_AND_DELETION.md)
- [Queue Deletion Cascade](./DELETION_CASCADE_DIAGRAM.md)
- [Database Schema](./Schema.md)
