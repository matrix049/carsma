# Implementation Plan: Admin Contact Messages

## Overview

This implementation plan breaks down the Admin Contact Messages feature into discrete, actionable coding tasks. The feature adds contact message management to the admin panel, following the established architecture patterns of the Custom Orders system. Implementation will proceed from backend to frontend, with testing integrated throughout.

## Tasks

- [x] 1. Create ContactMessage database model
  - Create `backend/src/models/ContactMessage.ts` file
  - Define Mongoose schema with customer (name, email), message, and status fields
  - Add schema validation rules (required fields, email format, message length constraints)
  - Set default status to "unread"
  - Add index on createdAt field for efficient sorting
  - Enable automatic timestamps (createdAt, updatedAt)
  - Export TypeScript interface IContactMessage
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ]* 1.1 Write unit tests for ContactMessage model
  - Test required field validation (name, email, message)
  - Test email format validation
  - Test message length constraints (min 10, max 2000 characters)
  - Test default status value is "unread"
  - Test timestamp generation
  - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6_

- [x] 2. Implement contact controller with business logic
  - Create `backend/src/controllers/contactController.ts` file
  - [x] 2.1 Implement createContactMessage function
    - Accept name, email, message from request body
    - Validate input data
    - Create ContactMessage document with status "unread"
    - Return success response with message ID
    - Handle validation errors with descriptive messages (400 status)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  
  - [x] 2.2 Implement getContactMessages function
    - Fetch all ContactMessage records from database
    - Sort by createdAt descending (newest first)
    - Return array of contact messages
    - Handle database errors (500 status)
    - _Requirements: 2.2, 2.3, 6.2, 6.5_
  
  - [x] 2.3 Implement updateMessageStatus function
    - Accept message ID from URL params and status from request body
    - Validate status value against allowed enum (unread, read, resolved, archived)
    - Find and update message by ID
    - Return updated message
    - Return 404 if message not found
    - Handle validation errors (400 status)
    - _Requirements: 3.1, 3.2, 3.3, 3.7, 6.3, 6.6_

- [ ]* 2.4 Write unit tests for contact controller
  - Test createContactMessage with valid data
  - Test createContactMessage with invalid data (missing fields, invalid email)
  - Test getContactMessages returns sorted messages
  - Test updateMessageStatus with valid status
  - Test updateMessageStatus with invalid status
  - Test updateMessageStatus with non-existent ID
  - Test error responses (400, 404, 500)
  - _Requirements: 1.1, 1.5, 2.2, 2.3, 3.3, 3.5, 3.7_

- [x] 3. Create contact API routes with authentication
  - Create `backend/src/routes/contact.ts` file
  - Define POST /api/contact route (public, no authentication)
  - Define GET /api/contact route (protected, requires authentication)
  - Define PUT /api/contact/:id route (protected, requires authentication)
  - Apply authenticateToken middleware to GET and PUT routes
  - Wire routes to controller functions
  - Export router
  - _Requirements: 4.1, 4.2, 4.3, 6.1, 6.2, 6.3, 6.7_

- [x] 4. Register contact routes in server
  - Modify `backend/src/server.ts` file
  - Import contact routes
  - Register routes at /api/contact path
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Checkpoint - Test backend API endpoints
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Add contact message API service functions
  - Modify `frontend/lib/apiServices.ts` file
  - [x] 6.1 Define TypeScript interfaces
    - Define ContactMessage interface with _id, customer, message, status, timestamps
    - Define CreateContactMessageRequest interface with name, email, message
    - _Requirements: 1.3, 2.4_
  
  - [x] 6.2 Implement createContactMessage function
    - Accept CreateContactMessageRequest data
    - Make POST request to /api/contact
    - Set requiresAuth to false (public endpoint)
    - Return success response
    - _Requirements: 1.1, 1.2, 1.4, 6.1, 6.4_
  
  - [x] 6.3 Implement fetchContactMessages function
    - Make GET request to /api/contact
    - Set requiresAuth to true (admin only)
    - Return array of ContactMessage
    - _Requirements: 2.2, 2.3, 6.2, 6.5, 6.7_
  
  - [x] 6.4 Implement updateContactMessageStatus function
    - Accept message ID and new status
    - Make PUT request to /api/contact/:id
    - Set requiresAuth to true (admin only)
    - Return updated ContactMessage
    - _Requirements: 3.3, 3.4, 6.3, 6.6, 6.7_

- [ ]* 6.5 Write unit tests for API service functions
  - Test createContactMessage request formatting
  - Test fetchContactMessages includes authentication header
  - Test updateContactMessageStatus request body and URL
  - Mock API responses and test error handling
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 7. Create ContactMessageTable component
  - Create `frontend/components/ContactMessageTable.tsx` file
  - [x] 7.1 Implement component structure and props
    - Accept messages array and onStatusUpdate callback as props
    - Set up component state for loading and error handling
    - _Requirements: 2.4_
  
  - [x] 7.2 Implement desktop table layout
    - Create table with columns: Date, Customer (name + email), Message, Status
    - Format date using locale string
    - Display customer name and email in single column
    - Truncate long messages with ellipsis
    - Apply Tailwind CSS styling consistent with CustomOrderTable
    - _Requirements: 2.3, 2.4, 2.6_
  
  - [x] 7.3 Implement mobile card layout
    - Create card view for screens smaller than lg breakpoint
    - Display all message fields in card format
    - Apply responsive styling
    - _Requirements: 2.4, 2.6_
  
  - [x] 7.4 Implement status dropdown with update logic
    - Create dropdown with four status options (unread, read, resolved, archived)
    - Handle status change event
    - Call updateContactMessageStatus API function
    - Disable dropdown during update (show loading indicator)
    - Display error message on update failure
    - Call onStatusUpdate callback on success
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 7.5 Implement empty state
    - Display message when messages array is empty
    - Style consistent with other admin tables
    - _Requirements: 2.5_
  
  - [x] 7.6 Add Framer Motion animations
    - Add smooth fade-in animations for table rows/cards
    - Apply animation variants consistent with existing components
    - _Requirements: 2.4_

- [ ]* 7.7 Write unit tests for ContactMessageTable component
  - Test rendering with empty message list
  - Test rendering with populated message list
  - Test status dropdown interaction
  - Test loading state during status update
  - Test error state display
  - Test responsive layout switching
  - _Requirements: 2.4, 2.5, 2.6, 3.1, 3.2, 3.4, 3.5, 3.6_

- [x] 8. Create admin contact messages page
  - Create `frontend/app/admin/contact-messages/page.tsx` file
  - [x] 8.1 Set up page structure with ProtectedRoute
    - Wrap page content with ProtectedRoute component
    - Set up page layout consistent with other admin pages
    - _Requirements: 4.4, 4.5_
  
  - [x] 8.2 Implement data fetching logic
    - Fetch contact messages on component mount using fetchContactMessages
    - Set up loading state with spinner
    - Set up error state with error message display
    - Store messages in component state
    - _Requirements: 2.2, 2.7_
  
  - [x] 8.3 Calculate and display message statistics
    - Count messages by status (unread, read, resolved, archived)
    - Display statistics in KPI cards at top of page
    - Style cards consistent with Custom Orders page
    - Update statistics when messages are reloaded
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 8.4 Render ContactMessageTable component
    - Pass messages array to ContactMessageTable
    - Implement onStatusUpdate callback to refresh messages
    - _Requirements: 2.4, 3.4_
  
  - [x] 8.5 Add refresh functionality
    - Add refresh button to reload messages
    - Call fetchContactMessages on button click
    - Show loading state during refresh
    - _Requirements: 2.7_

- [x] 9. Update contact form with submission logic
  - Modify `frontend/app/contact/page.tsx` file
  - [x] 9.1 Add form state management
    - Set up state for name, email, message fields
    - Set up state for loading, success, and error messages
    - _Requirements: 1.1_
  
  - [x] 9.2 Implement form validation
    - Validate required fields before submission
    - Validate email format
    - Validate message minimum length (10 characters)
    - Display validation errors to user
    - _Requirements: 1.1, 1.5_
  
  - [x] 9.3 Implement form submission handler
    - Call createContactMessage API function with form data
    - Show loading state during submission
    - Display success message on successful submission
    - Display error message on failure
    - Clear form fields on success
    - Maintain form data on error
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 10. Add navigation link to admin sidebar
  - Modify `frontend/components/AdminSidebar.tsx` file
  - Add "Contact Messages" navigation link
  - Link to /admin/contact-messages route
  - Add appropriate icon (use existing icon library)
  - Position link in logical order with other admin sections
  - _Requirements: 2.1_

- [x] 11. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 12. Write integration tests for complete workflows
  - Test contact form submission to database persistence
  - Test admin login and message retrieval
  - Test status update flow
  - Test unauthenticated access blocked (401 response)
  - Test authenticated access allowed
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 3.3, 3.4, 4.1, 4.2, 4.3_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Implementation follows backend-first approach to establish data layer before UI
- All protected endpoints use existing JWT authentication middleware
- UI components follow established patterns from Custom Orders feature
- No new dependencies required - all functionality uses existing packages
