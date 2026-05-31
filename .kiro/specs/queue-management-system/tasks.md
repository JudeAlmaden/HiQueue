# Implementation Plan: Queue Management System

## Overview

This implementation plan breaks down the Queue Management System into discrete coding tasks following a layered architecture approach. The system will be built incrementally, starting with foundational utilities and data access layers, then building up through business logic, server actions, and finally the user interface components.

The implementation follows Next.js 16 App Router conventions with TypeScript, using Prisma for database access, Zod for validation, and NextAuth for authentication.

## Tasks

- [x] 1. Set up shared utilities and type definitions
  - Create `src/server/lib/action-utils.ts` with `ActionResult<T>` type and `ok()`, `fail()` helper functions
  - Create `src/server/lib/password.ts` with bcrypt password hashing and verification utilities
  - _Requirements: 10.4, 10.5_

- [ ] 2. Implement Validator Layer (Zod Schemas)
  - [-] 2.1 Create member validators
    - Create `src/server/validators/member.validator.ts`
    - Implement `createMemberSchema` with name (2-50 chars), email (valid format, lowercase, trim), password (8-100 chars), role enum, organizationId
    - Implement `updateMemberSchema` with id, optional name, email, role
    - Implement `deleteMemberSchema` with id and organizationId
    - _Requirements: 8.1, 8.7, 8.8, 8.10_

  - [-] 2.2 Create queue validators
    - Create `src/server/validators/queue.validator.ts`
    - Implement `createQueueSchema` with name (2-100 chars), optional description (max 500), optional passcode (4-20 chars), organizationId
    - Implement `updateQueueSchema` with id, optional name, description, passcode, theme object, layout object
    - Implement `deleteQueueSchema` with id
    - _Requirements: 8.2, 8.10_

  - [-] 2.3 Create service validators
    - Create `src/server/validators/service.validator.ts`
    - Implement `createServiceSchema` with name (2-100 chars), prefix (regex /^[A-Z0-9]{1,4}$/), optional avgDurationMinutes (1-480), queueId
    - Implement `updateServiceSchema` with id, optional name, prefix, avgDurationMinutes
    - Implement `deleteServiceSchema` with id
    - _Requirements: 8.3, 8.9, 8.10_

  - [-] 2.4 Create counter validators
    - Create `src/server/validators/counter.validator.ts`
    - Implement `createCounterSchema` with name (1-50 chars), queueId
    - Implement `updateCounterSchema` with id, name
    - Implement `deleteCounterSchema` with id
    - _Requirements: 8.4, 8.10_

  - [-] 2.5 Create assignment validators
    - Create `src/server/validators/assignment.validator.ts`
    - Implement `assignStaffSchema` with userId, counterId, organizationId
    - Implement `unassignStaffSchema` with userId, counterId
    - _Requirements: 8.5, 8.10_

- [ ]* 2.6 Write unit tests for validators
    - Create test files in `src/server/validators/__tests__/` for each validator
    - Test valid data acceptance, invalid format rejection, field length validation, email/prefix format validation
    - Test edge cases: empty strings, boundary values, special characters
    - _Requirements: 8.6, 8.7, 8.8, 8.9, 8.10_

- [ ] 3. Implement Repository Layer (Prisma Data Access)
  - [x] 3.1 Create member repository
    - Create `src/server/repositories/member.repo.ts`
    - Implement `createMember()` - creates User and OrganizationMembership in transaction
    - Implement `updateMemberUser()` - updates User name/email
    - Implement `updateMemberRole()` - updates OrganizationMembership role
    - Implement `deleteMember()` - removes membership, conditionally deletes user
    - Implement `getOrganizationMembers()` - fetches members with user and membership details
    - Implement `findMemberByEmail()` - finds user by email in organization
    - Implement `hasOtherMemberships()` - checks if user has other org memberships
    - Implement `wasCreatedByAnotherUser()` - checks if user.createdById is not null
    - _Requirements: 9.1, 9.6, 9.7, 9.8_

  - [x] 3.2 Create queue repository
    - Create `src/server/repositories/queue.repo.ts`
    - Implement `createQueue()` - creates Queue with default theme/layout
    - Implement `updateQueue()` - updates Queue fields
    - Implement `deleteQueue()` - deletes Queue (cascades to services/counters)
    - Implement `getOrganizationQueues()` - fetches all queues for organization
    - Implement `getQueueById()` - fetches queue with related data
    - Implement `countActiveTickets()` - counts active tickets for queue
    - _Requirements: 9.2, 9.6, 9.7, 9.8_

  - [ ] 3.3 Create service repository
    - Create `src/server/repositories/service.repo.ts`
    - Implement `createService()` - creates Service
    - Implement `updateService()` - updates Service fields
    - Implement `deleteService()` - deletes Service
    - Implement `getQueueServices()` - fetches all services for queue
    - Implement `findServiceByPrefix()` - finds service by prefix in queue
    - Implement `findServiceByName()` - finds service by name in queue
    - Implement `countActiveTicketsForService()` - counts active tickets for service
    - _Requirements: 9.3, 9.6, 9.7, 9.8_

  - [-] 3.4 Create counter repository
    - Create `src/server/repositories/counter.repo.ts`
    - Implement `createCounter()` - creates Counter
    - Implement `updateCounter()` - updates Counter name
    - Implement `deleteCounter()` - deletes Counter
    - Implement `getQueueCounters()` - fetches all counters for queue
    - Implement `findCounterByName()` - finds counter by name in queue
    - Implement `getAssignedStaff()` - fetches staff assigned to counter
    - Implement `hasAssignedStaff()` - checks if counter has assigned staff
    - _Requirements: 9.4, 9.6, 9.7, 9.8_

  - [ ] 3.5 Create assignment repository
    - Create `src/server/repositories/assignment.repo.ts`
    - Implement `assignStaffToCounter()` - creates User-Counter relationship
    - Implement `unassignStaffFromCounter()` - removes User-Counter relationship
    - Implement `getStaffCounters()` - fetches counters assigned to staff member
    - Implement `verifyMembership()` - verifies user is member of organization
    - _Requirements: 9.5, 9.6, 9.7, 9.8_

- [ ]* 3.6 Write integration tests for repositories
    - Create test files in `src/server/repositories/__tests__/` for each repository
    - Test CRUD operations with in-memory SQLite database
    - Test cascade deletions, unique constraints, foreign key constraints
    - Test transaction rollback on errors
    - _Requirements: 9.6, 9.7, 9.8_

- [~] 4. Checkpoint - Verify data layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Service Layer (Business Logic)
  - [x] 5.1 Create member service
    - Create `src/server/services/member.service.ts`
    - Implement `createMember()` - validates permissions (owner/admin only), checks duplicate email, calls repository
    - Implement `updateMember()` - validates permissions, updates user and/or role
    - Implement `deleteMember()` - validates permissions, prevents admin from removing owner, calls repository
    - Return `ActionResult<T>` with `ok()` or `fail()` responses
    - _Requirements: 1.1-1.12, 2.1-2.6, 10.1-10.6_

  - [x] 5.2 Create queue service
    - Create `src/server/services/queue.service.ts`
    - Implement `createQueue()` - validates permissions (owner/admin only), checks unique name, calls repository
    - Implement `updateQueue()` - validates permissions, calls repository
    - Implement `deleteQueue()` - validates permissions, checks for active tickets, calls repository
    - Return `ActionResult<T>` with descriptive error messages
    - _Requirements: 4.1-4.10, 2.1-2.6, 10.1-10.6_

  - [x] 5.3 Create service service
    - Create `src/server/services/service.service.ts`
    - Implement `createService()` - validates permissions, checks unique prefix and name, calls repository
    - Implement `updateService()` - validates permissions, checks unique constraints, calls repository
    - Implement `deleteService()` - validates permissions, checks for active tickets, calls repository
    - Return `ActionResult<T>` with descriptive error messages
    - _Requirements: 5.1-5.12, 2.1-2.6, 10.1-10.6_

  - [x] 5.4 Create counter service
    - Create `src/server/services/counter.service.ts`
    - Implement `createCounter()` - validates permissions, checks unique name, calls repository
    - Implement `updateCounter()` - validates permissions, calls repository
    - Implement `deleteCounter()` - validates permissions, checks for assigned staff, calls repository
    - Return `ActionResult<T>` with descriptive error messages
    - _Requirements: 6.1-6.9, 2.1-2.6, 10.1-10.6_

  - [x] 5.5 Create assignment service
    - Create `src/server/services/assignment.service.ts`
    - Implement `assignStaff()` - validates permissions, verifies membership, calls repository
    - Implement `unassignStaff()` - validates permissions, calls repository
    - Return `ActionResult<T>` with descriptive error messages
    - _Requirements: 7.1-7.6, 2.1-2.6, 10.1-10.6_

- [x] 5.6 Write unit tests for services
    - Create test files in `src/server/services/__tests__/` for each service
    - Mock repository dependencies
    - Test authorization checks (owner/admin/staff permissions)
    - Test business rule enforcement (duplicate checks, active ticket checks, etc.)
    - Test error handling and ActionResult responses
    - _Requirements: 10.1-10.6_

- [x] 6. Implement Server Actions Layer
  - [x] 6.1 Create member actions
    - Create `src/server/actions/member.action.ts`
    - Implement `createMemberAction()` - validates session, parses FormData, validates with Zod, calls service, revalidates path
    - Implement `updateMemberAction()` - validates session, parses FormData, validates with Zod, calls service, revalidates path
    - Implement `deleteMemberAction()` - validates session, validates with Zod, calls service, revalidates path
    - Use "use server" directive
    - _Requirements: 11.1-11.8, 1.1-1.12_

  - [x] 6.2 Create queue actions
    - Create `src/server/actions/queue.action.ts`
    - Implement `createQueueAction()` - validates session, parses FormData, validates with Zod, calls service, revalidates path
    - Implement `updateQueueAction()` - validates session, parses FormData, validates with Zod, calls service, revalidates path
    - Implement `deleteQueueAction()` - validates session, validates with Zod, calls service, revalidates path, redirects if needed
    - Use "use server" directive
    - _Requirements: 11.1-11.8, 4.1-4.10_

  - [x] 6.3 Create service actions
    - Create `src/server/actions/service.action.ts`
    - Implement `createServiceAction()` - validates session, parses FormData, validates with Zod, calls service, revalidates path
    - Implement `updateServiceAction()` - validates session, parses FormData, validates with Zod, calls service, revalidates path
    - Implement `deleteServiceAction()` - validates session, validates with Zod, calls service, revalidates path
    - Use "use server" directive
    - _Requirements: 11.1-11.8, 5.1-5.12_

  - [x] 6.4 Create counter actions
    - Create `src/server/actions/counter.action.ts`
    - Implement `createCounterAction()` - validates session, parses FormData, validates with Zod, calls service, revalidates path
    - Implement `updateCounterAction()` - validates session, parses FormData, validates with Zod, calls service, revalidates path
    - Implement `deleteCounterAction()` - validates session, validates with Zod, calls service, revalidates path
    - Use "use server" directive
    - _Requirements: 11.1-11.8, 6.1-6.9_

  - [x] 6.5 Create assignment actions
    - Create `src/server/actions/assignment.action.ts`
    - Implement `assignStaffAction()` - validates session, validates with Zod, calls service, revalidates path
    - Implement `unassignStaffAction()` - validates session, validates with Zod, calls service, revalidates path
    - Use "use server" directive
    - _Requirements: 11.1-11.8, 7.1-7.6_

- [x] 6.6 Write integration tests for actions
    - Create test files in `src/server/actions/__tests__/` for each action
    - Test full stack with real database
    - Test session validation, FormData parsing, Zod validation
    - Test path revalidation and redirects
    - _Requirements: 11.1-11.8_

- [x] 7. Checkpoint - Verify backend layers
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Staff Portal Authentication
  - [x] 8.1 Create staff portal login page
    - Create `src/app/org/[slug]/login/page.tsx` (Server Component)
    - Fetch organization by slug, handle not found
    - Render login form with email and password fields
    - Check if user is already authenticated and redirect to counter dashboard
    - _Requirements: 3.1, 3.7, 14.8_

  - [x] 8.2 Create staff portal login client component
    - Create `src/app/org/[slug]/login/OrgLoginClient.tsx` (Client Component)
    - Implement form with email and password inputs using shadcn/ui
    - Handle form submission with NextAuth signIn
    - Display error messages for invalid credentials or no membership
    - Show loading state during authentication
    - _Requirements: 3.2, 3.5, 3.6, 13.15_

  - [x] 8.3 Configure NextAuth credentials provider for staff portal
    - Update `src/auth.config.ts` to add credentials provider
    - Implement authorize function: verify email/password, check organization membership
    - Return user object with membership details on success
    - Return null with error message on failure
    - _Requirements: 3.2, 3.3, 3.4, 3.8_

  - [x] 8.4 Create counter dashboard page
    - Create `src/app/org/[slug]/counter/page.tsx`
    - Fetch staff member's assigned counters
    - Display counter dashboard with assigned counters
    - _Requirements: 3.4, 7.6, 14.9_

- [x] 8.5 Write E2E tests for staff portal
    - Create `tests/e2e/staff-portal.e2e.test.ts`
    - Test successful login and redirect to counter dashboard
    - Test invalid credentials error message
    - Test no membership error message
    - Test already authenticated redirect
    - _Requirements: 3.1-3.8_

- [x] 9. Implement Member Management UI
  - [x] 9.1 Create member list page
    - Create `src/app/dashboard/organizations/[slug]/members/page.tsx`
    - Fetch organization members using repository
    - Display member list with name, email, role
    - Show "Add Member" button for owners/admins
    - Show edit/delete buttons for each member (disable delete for owners if user is admin)
    - _Requirements: 13.1, 14.2_

  - [x] 9.2 Create member creation form component
    - Create `src/components/members/CreateMemberForm.tsx`
    - Implement form with name, email, password, role fields using shadcn/ui
    - Call `createMemberAction()` on submit
    - Display success toast on success, error message on failure
    - Reset form on success
    - _Requirements: 13.2, 13.15, 13.16_

  - [x] 9.3 Create member edit form component
    - Create `src/components/members/EditMemberForm.tsx`
    - Implement form with name, email, role fields using shadcn/ui
    - Pre-populate form with existing member data
    - Call `updateMemberAction()` on submit
    - Display success toast on success, error message on failure
    - _Requirements: 13.3, 13.15, 13.16_

  - [x] 9.4 Create member delete confirmation dialog
    - Create `src/components/members/DeleteMemberDialog.tsx`
    - Display confirmation dialog with member name
    - Explain consequences (user deletion if no other memberships)
    - Call `deleteMemberAction()` on confirm
    - Display success toast on success, error message on failure
    - _Requirements: 13.14, 13.15, 13.16_

- [x] 10. Implement Queue Management UI
  - [x] 10.1 Create queue list page
    - Create `src/app/dashboard/organizations/[slug]/queues/page.tsx`
    - Fetch organization queues using repository
    - Display queue list with name, description, active status
    - Show "Create Queue" button for owners/admins
    - Show edit/delete buttons for each queue
    - Link to queue details page
    - _Requirements: 13.4, 14.3_

  - [x] 10.2 Create queue creation form component
    - Create `src/components/queues/CreateQueueForm.tsx`
    - Implement form with name, description, passcode fields using shadcn/ui
    - Call `createQueueAction()` on submit
    - Display success toast on success, error message on failure
    - Reset form on success
    - _Requirements: 13.5, 13.15, 13.16_

  - [x] 10.3 Create queue edit form component
    - Create `src/components/queues/EditQueueForm.tsx`
    - Implement form with name, description, passcode fields using shadcn/ui
    - Pre-populate form with existing queue data
    - Call `updateQueueAction()` on submit
    - Display success toast on success, error message on failure
    - _Requirements: 13.6, 13.15, 13.16_

  - [x] 10.4 Create queue delete confirmation dialog
    - Create `src/components/queues/DeleteQueueDialog.tsx`
    - Display confirmation dialog with queue name
    - Explain consequences (cannot delete if active tickets exist)
    - Call `deleteQueueAction()` on confirm
    - Display success toast on success, error message with dependencies on failure
    - _Requirements: 13.14, 13.15, 13.16, 15.6_

  - [x] 10.5 Create queue details page
    - Create `src/app/dashboard/organizations/[slug]/queues/[queueId]/page.tsx`
    - Fetch queue with services and counters
    - Display queue information
    - Show tabs or sections for services and counters
    - _Requirements: 14.4_

- [x] 11. Implement Service Management UI
  - [x] 11.1 Create service list component
    - Create `src/components/services/ServiceList.tsx`
    - Display services for a queue with name, prefix, avgDurationMinutes
    - Show "Add Service" button for owners/admins
    - Show edit/delete buttons for each service
    - _Requirements: 13.7, 14.5_

  - [x] 11.2 Create service creation form component
    - Create `src/components/services/CreateServiceForm.tsx`
    - Implement form with name, prefix, avgDurationMinutes fields using shadcn/ui
    - Validate prefix format on client side (uppercase letters/numbers only)
    - Call `createServiceAction()` on submit
    - Display success toast on success, error message on failure
    - Reset form on success
    - _Requirements: 13.8, 13.15, 13.16_

  - [x] 11.3 Create service edit form component
    - Create `src/components/services/EditServiceForm.tsx`
    - Implement form with name, prefix, avgDurationMinutes fields using shadcn/ui
    - Pre-populate form with existing service data
    - Call `updateServiceAction()` on submit
    - Display success toast on success, error message on failure
    - _Requirements: 13.9, 13.15, 13.16_

  - [x] 11.4 Create service delete confirmation dialog
    - Create `src/components/services/DeleteServiceDialog.tsx`
    - Display confirmation dialog with service name
    - Explain consequences (cannot delete if active tickets exist)
    - Call `deleteServiceAction()` on confirm
    - Display success toast on success, error message with dependencies on failure
    - _Requirements: 13.14, 13.15, 13.16, 15.6_

- [x] 12. Implement Counter Management UI
  - [x] 12.1 Create counter list component
    - Create `src/components/counters/CounterList.tsx`
    - Display counters for a queue with name, assigned staff count
    - Show "Add Counter" button for owners/admins
    - Show edit/delete buttons for each counter
    - _Requirements: 13.10, 14.6_

  - [x] 12.2 Create counter creation form component
    - Create `src/components/counters/CreateCounterForm.tsx`
    - Implement form with name field using shadcn/ui
    - Call `createCounterAction()` on submit
    - Display success toast on success, error message on failure
    - Reset form on success
    - _Requirements: 13.11, 13.15, 13.16_

  - [x] 12.3 Create counter edit form component
    - Create `src/components/counters/EditCounterForm.tsx`
    - Implement form with name field using shadcn/ui
    - Pre-populate form with existing counter data
    - Call `updateCounterAction()` on submit
    - Display success toast on success, error message on failure
    - _Requirements: 13.12, 13.15, 13.16_

  - [x] 12.4 Create counter delete confirmation dialog
    - Create `src/components/counters/DeleteCounterDialog.tsx`
    - Display confirmation dialog with counter name
    - Explain consequences (cannot delete if staff assigned)
    - Call `deleteCounterAction()` on confirm
    - Display success toast on success, error message with dependencies on failure
    - _Requirements: 13.14, 13.15, 13.16, 15.6_

- [x] 13. Implement Staff Assignment UI
  - [x] 13.1 Create staff assignment page
    - Create `src/app/dashboard/organizations/[slug]/assignments/page.tsx`
    - Fetch organization members (staff only) and all counters across queues
    - Display assignment interface
    - _Requirements: 14.7_

  - [x] 13.2 Create staff assignment component
    - Create `src/components/assignments/StaffAssignmentManager.tsx`
    - Display staff members list and counters list
    - Show current assignments for each staff member
    - Provide UI controls (checkboxes or drag-and-drop) to assign/unassign staff to counters
    - Call `assignStaffAction()` and `unassignStaffAction()` on changes
    - Display success toast on success, error message on failure
    - _Requirements: 13.13, 13.15, 13.16, 7.1-7.6_

- [x] 14. Implement Navigation and Layout
  - [x] 14.1 Update organization dashboard layout
    - Update `src/app/dashboard/organizations/[slug]/layout.tsx`
    - Add navigation links to Members, Queues, Assignments pages
    - Display organization name in header
    - _Requirements: 14.1-14.7_

  - [x] 14.2 Create queue-specific navigation
    - Update queue details page to include navigation to Services and Counters
    - Use tabs or sidebar navigation
    - _Requirements: 14.4, 14.5, 14.6_

- [x] 15. Implement Error Handling and User Feedback
  - [x] 15.1 Create toast notification system
    - Create `src/components/ui/toast.tsx` and `src/components/ui/toaster.tsx` using shadcn/ui
    - Implement success (green) and error (red) toast variants
    - Configure toast duration: 5 seconds for success, 10 seconds for errors
    - _Requirements: 13.15, 15.1-15.5_

  - [x] 15.2 Add error boundary components
    - Create `src/components/ErrorBoundary.tsx` for catching React errors
    - Display user-friendly error message
    - Log errors to console
    - _Requirements: 15.4, 15.7_

  - [x] 15.3 Implement form error display
    - Create reusable form error component `src/components/ui/form-error.tsx`
    - Display validation errors inline below input fields
    - Display page-level errors at top of forms
    - _Requirements: 15.1, 15.6_

  - [x] 15.4 Add loading states to all forms
    - Disable submit buttons during form submission
    - Show loading spinner or text on submit buttons
    - Prevent double submissions
    - _Requirements: 13.15_

- [x] 16. Final Integration and Testing
  - [x] 16.1 Wire all components together
    - Ensure all pages import and use correct components
    - Verify all server actions are connected to forms
    - Test navigation flows between pages
    - _Requirements: All requirements_

  - [x] 16.2 Test authorization flows
    - Verify owner can perform all operations
    - Verify admin cannot delete organization or remove owners
    - Verify staff cannot access admin operations
    - Test session validation on all protected routes
    - _Requirements: 2.1-2.6_

  - [x] 16.3 Test business rule enforcement
    - Test queue deletion blocked by active tickets
    - Test service deletion blocked by active tickets
    - Test counter deletion blocked by assigned staff
    - Test duplicate email/prefix/name validations
    - _Requirements: 1.12, 4.6-4.9, 5.7-5.11, 6.5-6.8_

- [x] 16.4 Write E2E tests for complete workflows
    - Create `tests/e2e/member-management.e2e.test.ts`
    - Test complete member CRUD workflow
    - Test authorization restrictions
    - Create `tests/e2e/queue-management.e2e.test.ts`
    - Test complete queue, service, counter CRUD workflows
    - Test business rule validations
    - _Requirements: All requirements_

- [x] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- The implementation follows a bottom-up approach: utilities → validators → repositories → services → actions → UI
- Checkpoints ensure incremental validation of functionality
- All components use TypeScript for type safety
- shadcn/ui components provide consistent styling across the application
- NextAuth handles session management and authentication
- Prisma ORM manages all database operations with SQLite

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4", "2.5"] },
    { "id": 2, "tasks": ["2.6", "3.1", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 3, "tasks": ["3.6", "5.1", "5.2", "5.3", "5.4", "5.5"] },
    { "id": 4, "tasks": ["5.6", "6.1", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 5, "tasks": ["6.6", "8.1", "8.3"] },
    { "id": 6, "tasks": ["8.2", "8.4"] },
    { "id": 7, "tasks": ["8.5", "9.1", "10.1"] },
    { "id": 8, "tasks": ["9.2", "9.3", "9.4", "10.2", "10.3", "10.4", "10.5"] },
    { "id": 9, "tasks": ["11.1", "11.2", "11.3", "11.4", "12.1", "12.2", "12.3", "12.4"] },
    { "id": 10, "tasks": ["13.1"] },
    { "id": 11, "tasks": ["13.2", "14.1", "14.2"] },
    { "id": 12, "tasks": ["15.1", "15.2", "15.3", "15.4"] },
    { "id": 13, "tasks": ["16.1"] },
    { "id": 14, "tasks": ["16.2", "16.3"] },
    { "id": 15, "tasks": ["16.4"] }
  ]
}
```
