# Requirements Document

## Introduction

The Queue Management System enables organization owners and administrators to manage their customer service operations through a comprehensive web-based interface. The system provides complete CRUD operations for organization members, queues, services, counters, and staff assignments. Staff members access the system through a dedicated portal to serve customers at assigned counters.

## Glossary

- **Organization**: A business entity that operates one or more queues
- **Organization_Owner**: A user with full administrative rights to an organization
- **Organization_Admin**: A user with administrative rights but cannot delete the organization
- **Staff_Member**: A user assigned to serve customers at counters
- **Member**: Any user associated with an organization (owner, admin, or staff)
- **Queue**: A customer service queue belonging to an organization
- **Service**: A type of service offered within a queue (e.g., "General Inquiry", "Account Opening")
- **Service_Prefix**: A unique identifier prefix for tickets of a specific service (e.g., "GI", "AO")
- **Counter**: A service window or station where staff members serve customers
- **Staff_Portal**: The authentication and management interface for staff members at `/org/[slug]/login`
- **Member_Management_System**: The subsystem handling member CRUD operations
- **Queue_Management_System**: The subsystem handling queue CRUD operations
- **Service_Management_System**: The subsystem handling service CRUD operations
- **Counter_Management_System**: The subsystem handling counter CRUD operations
- **Assignment_System**: The subsystem handling staff-to-counter assignments
- **Authentication_System**: The subsystem handling user authentication and authorization
- **Validator**: The input validation layer using Zod schemas
- **Repository**: The data access layer using Prisma ORM
- **Service_Layer**: The business logic layer
- **Action_Layer**: The Next.js server actions layer

## Requirements

### Requirement 1: Organization Member Management

**User Story:** As an organization owner or admin, I want to add, edit, and remove organization members with specific roles, so that I can control who has access to my queue system and what they can do.

#### Acceptance Criteria

1. WHEN an Organization_Owner or Organization_Admin creates a new member, THE Member_Management_System SHALL validate the email address format
2. WHEN an Organization_Owner or Organization_Admin creates a new member with a valid email, THE Member_Management_System SHALL create a User record with the provided name, email, and password
3. WHEN a new Staff_Member is created, THE Member_Management_System SHALL set the createdById field to the creating user's ID
4. WHEN an Organization_Owner or Organization_Admin creates a new member, THE Member_Management_System SHALL create an OrganizationMembership record linking the user to the organization with the specified role
5. WHEN an Organization_Owner or Organization_Admin updates a member's role, THE Member_Management_System SHALL update the OrganizationMembership role field
6. WHEN an Organization_Owner or Organization_Admin updates a member's name or email, THE Member_Management_System SHALL update the User record
7. WHEN an Organization_Owner removes a member, THE Member_Management_System SHALL delete the OrganizationMembership record
8. WHEN an Organization_Admin attempts to remove an Organization_Owner, THE Member_Management_System SHALL reject the operation with an error message
9. WHEN a member is removed, THE Member_Management_System SHALL preserve the User record if the user has other organization memberships
10. WHEN a member is removed and has no other organization memberships and was created by another user, THE Member_Management_System SHALL delete the User record
11. THE Member_Management_System SHALL enforce that only Organization_Owner and Organization_Admin roles can create, update, or remove members
12. THE Member_Management_System SHALL enforce that each email address is unique within an organization

### Requirement 2: Member Role Authorization

**User Story:** As an organization owner, I want different permission levels for my team members, so that I can delegate responsibilities while maintaining control over critical operations.

#### Acceptance Criteria

1. THE Authentication_System SHALL recognize three member roles: owner, admin, and staff
2. WHEN a user attempts a member management operation, THE Authentication_System SHALL verify the user has Organization_Owner or Organization_Admin role
3. WHEN a user attempts to delete an organization, THE Authentication_System SHALL verify the user has Organization_Owner role
4. WHEN a user attempts queue, service, or counter operations, THE Authentication_System SHALL verify the user has Organization_Owner or Organization_Admin role
5. WHEN a Staff_Member attempts administrative operations, THE Authentication_System SHALL reject the operation with an authorization error
6. THE Authentication_System SHALL allow Staff_Members to access only their assigned counters and view queue information

### Requirement 3: Staff Portal Authentication

**User Story:** As a staff member, I want to log in through a dedicated portal at `/org/[slug]/login`, so that I can access my assigned counter and serve customers.

#### Acceptance Criteria

1. WHEN a user navigates to `/org/[slug]/login`, THE Staff_Portal SHALL display a login form with email and password fields
2. WHEN a user submits valid credentials at the Staff_Portal, THE Authentication_System SHALL verify the email and password match a User record
3. WHEN credentials are verified, THE Authentication_System SHALL verify the user has a membership in the organization identified by the slug
4. WHEN authentication succeeds, THE Staff_Portal SHALL create a session and redirect the user to their counter dashboard
5. WHEN authentication fails due to invalid credentials, THE Staff_Portal SHALL display an error message "Invalid email or password"
6. WHEN authentication fails due to no organization membership, THE Staff_Portal SHALL display an error message "You are not a member of this organization"
7. WHEN a user is already authenticated and navigates to `/org/[slug]/login`, THE Staff_Portal SHALL redirect them to their counter dashboard
8. THE Staff_Portal SHALL use NextAuth for session management

### Requirement 4: Queue Management

**User Story:** As an organization owner or admin, I want to create, edit, and delete queues for my organization, so that I can organize different service areas or locations.

#### Acceptance Criteria

1. WHEN an Organization_Owner or Organization_Admin creates a queue, THE Queue_Management_System SHALL validate the queue name is not empty
2. WHEN a queue is created with valid data, THE Queue_Management_System SHALL create a Queue record with name, description, organizationId, and optional passcode
3. WHEN a queue is created, THE Queue_Management_System SHALL set isActive to true by default
4. WHEN a queue is created, THE Queue_Management_System SHALL initialize theme and layout as empty JSON objects
5. WHEN an Organization_Owner or Organization_Admin updates a queue, THE Queue_Management_System SHALL update the name, description, passcode, theme, or layout fields
6. WHEN an Organization_Owner or Organization_Admin deletes a queue, THE Queue_Management_System SHALL verify the queue has no active tickets
7. WHEN a queue with active tickets is deleted, THE Queue_Management_System SHALL reject the operation with an error message
8. WHEN a queue with no active tickets is deleted, THE Queue_Management_System SHALL delete the Queue record and all associated Service, Counter, and QueueSession records
9. THE Queue_Management_System SHALL enforce that queue names are unique within an organization
10. THE Queue_Management_System SHALL allow multiple queues per organization

### Requirement 5: Service Management

**User Story:** As an organization owner or admin, I want to create, edit, and delete services within my queues with unique ticket prefixes, so that I can categorize different types of customer requests.

#### Acceptance Criteria

1. WHEN an Organization_Owner or Organization_Admin creates a service, THE Service_Management_System SHALL validate the service name is not empty
2. WHEN a service is created, THE Service_Management_System SHALL validate the prefix contains only uppercase letters and numbers
3. WHEN a service is created, THE Service_Management_System SHALL validate the prefix is between 1 and 4 characters
4. WHEN a service is created with valid data, THE Service_Management_System SHALL create a Service record with name, prefix, queueId, and optional avgDurationMinutes
5. WHEN a service is created, THE Service_Management_System SHALL set isActive to true by default
6. WHEN an Organization_Owner or Organization_Admin updates a service, THE Service_Management_System SHALL update the name, prefix, or avgDurationMinutes fields
7. WHEN an Organization_Owner or Organization_Admin deletes a service, THE Service_Management_System SHALL verify the service has no active tickets
8. WHEN a service with active tickets is deleted, THE Service_Management_System SHALL reject the operation with an error message
9. WHEN a service with no active tickets is deleted, THE Service_Management_System SHALL delete the Service record
10. THE Service_Management_System SHALL enforce that service prefixes are unique within a queue
11. THE Service_Management_System SHALL enforce that service names are unique within a queue
12. THE Service_Management_System SHALL allow multiple services per queue

### Requirement 6: Counter Management

**User Story:** As an organization owner or admin, I want to create, edit, and delete service counters, so that I can define the physical or virtual service points where staff members serve customers.

#### Acceptance Criteria

1. WHEN an Organization_Owner or Organization_Admin creates a counter, THE Counter_Management_System SHALL validate the counter name is not empty
2. WHEN a counter is created with valid data, THE Counter_Management_System SHALL create a Counter record with name, queueId, and currentTicketId set to null
3. WHEN a counter is created, THE Counter_Management_System SHALL set isActive to true by default
4. WHEN an Organization_Owner or Organization_Admin updates a counter, THE Counter_Management_System SHALL update the name field
5. WHEN an Organization_Owner or Organization_Admin deletes a counter, THE Counter_Management_System SHALL verify the counter has no assigned staff members
6. WHEN a counter with assigned staff is deleted, THE Counter_Management_System SHALL reject the operation with an error message
7. WHEN a counter with no assigned staff is deleted, THE Counter_Management_System SHALL delete the Counter record
8. THE Counter_Management_System SHALL enforce that counter names are unique within a queue
9. THE Counter_Management_System SHALL allow multiple counters per queue

### Requirement 7: Staff Assignment to Counters

**User Story:** As an organization owner or admin, I want to assign staff members to specific counters, so that they can serve customers at designated service points.

#### Acceptance Criteria

1. WHEN an Organization_Owner or Organization_Admin assigns a Staff_Member to a counter, THE Assignment_System SHALL validate the Staff_Member has a membership in the organization
2. WHEN a Staff_Member is assigned to a counter, THE Assignment_System SHALL create a relationship between the User and Counter
3. WHEN an Organization_Owner or Organization_Admin unassigns a Staff_Member from a counter, THE Assignment_System SHALL remove the relationship between the User and Counter
4. THE Assignment_System SHALL allow a Staff_Member to be assigned to multiple counters
5. THE Assignment_System SHALL allow a counter to have multiple assigned Staff_Members
6. WHEN a Staff_Member logs in, THE Staff_Portal SHALL display all counters assigned to that Staff_Member

### Requirement 8: Data Validation Layer

**User Story:** As a developer, I want all input data validated using Zod schemas, so that invalid data is rejected before reaching the business logic layer.

#### Acceptance Criteria

1. THE Validator SHALL define Zod schemas for all member operations (create, update, delete)
2. THE Validator SHALL define Zod schemas for all queue operations (create, update, delete)
3. THE Validator SHALL define Zod schemas for all service operations (create, update, delete)
4. THE Validator SHALL define Zod schemas for all counter operations (create, update, delete)
5. THE Validator SHALL define Zod schemas for all assignment operations (assign, unassign)
6. WHEN invalid data is submitted, THE Validator SHALL return a descriptive error message
7. THE Validator SHALL validate email format using standard email regex
8. THE Validator SHALL validate password minimum length of 8 characters
9. THE Validator SHALL validate service prefix format (uppercase letters and numbers only, 1-4 characters)
10. THE Validator SHALL validate required fields are not empty

### Requirement 9: Repository Layer Data Access

**User Story:** As a developer, I want all database operations encapsulated in repository functions, so that data access logic is centralized and reusable.

#### Acceptance Criteria

1. THE Repository SHALL provide functions for member CRUD operations using Prisma ORM
2. THE Repository SHALL provide functions for queue CRUD operations using Prisma ORM
3. THE Repository SHALL provide functions for service CRUD operations using Prisma ORM
4. THE Repository SHALL provide functions for counter CRUD operations using Prisma ORM
5. THE Repository SHALL provide functions for assignment operations using Prisma ORM
6. THE Repository SHALL use Prisma transactions for operations that modify multiple tables
7. THE Repository SHALL include related data using Prisma include statements when needed
8. THE Repository SHALL handle database errors and throw descriptive error messages

### Requirement 10: Service Layer Business Logic

**User Story:** As a developer, I want business logic separated from data access and presentation layers, so that the codebase is maintainable and testable.

#### Acceptance Criteria

1. THE Service_Layer SHALL implement authorization checks before calling repository functions
2. THE Service_Layer SHALL verify user permissions for all operations
3. THE Service_Layer SHALL verify data constraints (e.g., no active tickets before deletion)
4. THE Service_Layer SHALL return standardized success/failure responses using ok() and fail() utilities
5. THE Service_Layer SHALL handle errors from the Repository and return user-friendly error messages
6. THE Service_Layer SHALL implement business rules (e.g., admins cannot remove owners)

### Requirement 11: Server Actions Layer

**User Story:** As a developer, I want Next.js server actions to handle form submissions and API calls, so that the application follows Next.js 16 best practices.

#### Acceptance Criteria

1. THE Action_Layer SHALL use "use server" directive for all server actions
2. THE Action_Layer SHALL extract and validate session data using NextAuth
3. THE Action_Layer SHALL parse FormData and validate using Zod schemas
4. WHEN validation fails, THE Action_Layer SHALL return a failure response with error message
5. WHEN validation succeeds, THE Action_Layer SHALL call the appropriate Service_Layer function
6. WHEN an operation succeeds, THE Action_Layer SHALL revalidate affected paths using revalidatePath
7. WHEN an operation succeeds and requires navigation, THE Action_Layer SHALL redirect using Next.js redirect
8. THE Action_Layer SHALL return standardized responses compatible with client-side form handling

### Requirement 12: Database Schema Relationships

**User Story:** As a developer, I want the database schema to properly represent all relationships and constraints, so that data integrity is maintained.

#### Acceptance Criteria

1. THE Database SHALL enforce the unique constraint on User email field
2. THE Database SHALL enforce the unique constraint on OrganizationMembership (userId, organizationId) combination
3. THE Database SHALL enforce cascade deletion for OrganizationMembership when User or Organization is deleted
4. THE Database SHALL enforce cascade deletion for Queue when Organization is deleted
5. THE Database SHALL enforce cascade deletion for Service when Queue is deleted
6. THE Database SHALL enforce cascade deletion for Counter when Queue is deleted
7. THE Database SHALL store User.createdById as a nullable foreign key to User.id
8. THE Database SHALL store OrganizationMembership.role as a string field with values "owner", "admin", or "staff"
9. THE Database SHALL store Queue.theme and Queue.layout as JSON strings for SQLite compatibility
10. THE Database SHALL store Service.prefix as a string field
11. THE Database SHALL store Counter.currentTicketId as a nullable string field

### Requirement 13: User Interface Components

**User Story:** As an organization owner or admin, I want intuitive UI components for managing members, queues, services, and counters, so that I can efficiently operate my queue system.

#### Acceptance Criteria

1. THE User_Interface SHALL provide a member list view displaying all organization members with their roles
2. THE User_Interface SHALL provide a member creation form with fields for name, email, password, and role
3. THE User_Interface SHALL provide a member edit form with fields for name, email, and role
4. THE User_Interface SHALL provide a queue list view displaying all queues for the organization
5. THE User_Interface SHALL provide a queue creation form with fields for name, description, and optional passcode
6. THE User_Interface SHALL provide a queue edit form with fields for name, description, and passcode
7. THE User_Interface SHALL provide a service list view displaying all services for a queue with their prefixes
8. THE User_Interface SHALL provide a service creation form with fields for name, prefix, and avgDurationMinutes
9. THE User_Interface SHALL provide a service edit form with fields for name, prefix, and avgDurationMinutes
10. THE User_Interface SHALL provide a counter list view displaying all counters for a queue
11. THE User_Interface SHALL provide a counter creation form with fields for name
12. THE User_Interface SHALL provide a counter edit form with fields for name
13. THE User_Interface SHALL provide an assignment interface showing staff members and counters with drag-and-drop or selection controls
14. THE User_Interface SHALL display confirmation dialogs before delete operations
15. THE User_Interface SHALL display success and error messages using toast notifications or inline alerts
16. THE User_Interface SHALL use shadcn/ui components for consistent styling

### Requirement 14: Navigation and Routing

**User Story:** As a user, I want clear navigation between different management sections, so that I can easily access the features I need.

#### Acceptance Criteria

1. THE Application SHALL provide a route at `/dashboard/organizations/[slug]` for organization overview
2. THE Application SHALL provide a route at `/dashboard/organizations/[slug]/members` for member management
3. THE Application SHALL provide a route at `/dashboard/organizations/[slug]/queues` for queue list
4. THE Application SHALL provide a route at `/dashboard/organizations/[slug]/queues/[queueId]` for queue details
5. THE Application SHALL provide a route at `/dashboard/organizations/[slug]/queues/[queueId]/services` for service management
6. THE Application SHALL provide a route at `/dashboard/organizations/[slug]/queues/[queueId]/counters` for counter management
7. THE Application SHALL provide a route at `/dashboard/organizations/[slug]/assignments` for staff assignment management
8. THE Application SHALL provide a route at `/org/[slug]/login` for staff portal login
9. THE Application SHALL provide a route at `/org/[slug]/counter` for staff counter dashboard
10. THE Application SHALL use Next.js App Router conventions for all routes

### Requirement 15: Error Handling and User Feedback

**User Story:** As a user, I want clear error messages and feedback when operations fail, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN a validation error occurs, THE Application SHALL display the specific validation error message
2. WHEN an authorization error occurs, THE Application SHALL display "You don't have permission to perform this action"
3. WHEN a database constraint violation occurs, THE Application SHALL display a user-friendly error message
4. WHEN a network error occurs, THE Application SHALL display "An error occurred. Please try again"
5. WHEN an operation succeeds, THE Application SHALL display a success message
6. WHEN a delete operation is blocked by dependencies, THE Application SHALL display which dependencies must be removed first
7. THE Application SHALL log detailed error information to the server console for debugging
8. THE Application SHALL not expose sensitive error details to end users
