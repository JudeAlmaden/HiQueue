# Ticket Prefix and Numbering Changes

## Summary
Updated the service prefix validation and ticket numbering system to ensure:
1. Service prefixes are unique per queue
2. Prefixes are max 2 uppercase letters (A-Z)
3. Ticket numbering is continuous per prefix (e.g., A001, B001, A002, B002, A003)

## Changes Made

### 1. Service Validator (`src/server/validators/service.validator.ts`)
**Before:**
- Allowed 1-4 alphanumeric characters (A-Z, 0-9)
- Regex: `/^[A-Z0-9]{1,4}$/`

**After:**
- Only allows 1-2 uppercase letters (A-Z)
- Regex: `/^[A-Z]{1,2}$/`
- Error message: "Prefix must be 1 to 2 uppercase letters (A-Z)"

### 2. Ticket Creation (`src/server/repositories/ticket.repo.ts`)
**Before:**
- Used global `currentNumber` from session
- All tickets shared the same number sequence regardless of prefix
- Example: A001, B002, A003 (confusing!)

**After:**
- Each prefix has its own continuous number sequence
- Finds the highest number for the specific service/prefix in the current session
- Increments from there
- Example: A001, B001, A002, B002, A003 (clear and organized!)

## How It Works

### Prefix Uniqueness
- Already enforced in `service.service.ts`
- Checks for duplicate prefixes in the same queue before creating/updating
- Returns error: "A service with this prefix already exists in the queue"

### Ticket Numbering Logic
```typescript
// Find the highest number for this prefix in the current session
const lastTicketWithPrefix = await tx.ticket.findFirst({
  where: {
    queueSessionId: session.id,
    serviceId: data.serviceId,
  },
  orderBy: {
    number: "desc",
  },
  select: {
    number: true,
  },
})

const nextNumber = lastTicketWithPrefix ? lastTicketWithPrefix.number + 1 : 1
```

### Example Scenario
**Queue with 2 services:**
- Service A (Cashier) - Prefix: "A"
- Service B (Teller) - Prefix: "B"

**Ticket Creation Order:**
1. Customer selects Cashier → Creates ticket **A001**
2. Customer selects Teller → Creates ticket **B001**
3. Customer selects Cashier → Creates ticket **A002**
4. Customer selects Teller → Creates ticket **B002**
5. Customer selects Cashier → Creates ticket **A003**

Each prefix maintains its own continuous sequence!

## Validation Rules

### Creating a Service
- ✅ Prefix must be 1-2 uppercase letters (A, B, AA, AB, etc.)
- ✅ Prefix must be unique within the queue
- ✅ Prefix is automatically converted to uppercase
- ❌ Cannot use numbers (0-9)
- ❌ Cannot use more than 2 characters
- ❌ Cannot use lowercase letters

### Examples
- ✅ Valid: "A", "B", "AA", "AB", "XY", "ZZ"
- ❌ Invalid: "A1", "123", "ABC", "a", "ab", "A-B"

## Database Impact
- No schema changes required
- Existing tickets are not affected
- New tickets will follow the new numbering logic
- The `number` field in the Ticket table now represents the sequence number per prefix

## Testing
Run the application and create tickets for different services to verify:
1. Each service gets its own continuous number sequence
2. Prefixes are validated correctly (max 2 uppercase letters)
3. Duplicate prefixes are rejected
4. Ticket codes are generated correctly (e.g., A001, B001, A002)

## Migration Notes
If you have existing services with invalid prefixes (e.g., "A1", "ABC"):
1. They will continue to work for existing tickets
2. You won't be able to update them without changing the prefix
3. Consider updating them to valid 1-2 letter prefixes
