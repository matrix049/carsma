# Implementation Plan: Wall Decoration E-Commerce Platform

## Overview

This implementation plan breaks down the wall decoration e-commerce platform into discrete coding tasks. The platform consists of a Next.js storefront, an admin dashboard, and a Node.js/Express backend with MongoDB. Tasks are organized to build incrementally, starting with backend infrastructure, then customer-facing features, and finally admin functionality.

## Tasks

- [ ] 1. Set up project structure and dependencies
  - Create monorepo structure with separate frontend and backend directories
  - Initialize Next.js project with TypeScript and Tailwind CSS
  - Initialize Express backend with TypeScript
  - Install and configure dependencies (mongoose, jsonwebtoken, bcrypt, cors, helmet)
  - Set up environment variable configuration files (.env templates)
  - Configure TypeScript for both frontend and backend
  - _Requirements: 12.1, 12.4_

- [ ] 2. Set up MongoDB database and models
  - [ ] 2.1 Configure MongoDB connection
    - Create database configuration file with connection logic
    - Implement connection error handling and retry logic
    - Add environment variables for MongoDB connection string
    - _Requirements: 6.1, 12.4_
  
  - [ ] 2.2 Create Product model
    - Define Product schema with name, price, image, description, category, inStock fields
    - Add timestamps and indexes for category filtering
    - Implement Mongoose model with validation
    - _Requirements: 1.2, 1.4_
  
  - [ ] 2.3 Create Order model
    - Define Order schema with customer info, products array, totalPrice, paymentMethod, status
    - Add timestamps and indexes for sorting by creation date
    - Set default status to "pending" and paymentMethod to "Cash on Delivery"
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 2.4 Create Admin model
    - Define Admin schema with email and hashed password
    - Add unique index on email field
    - Implement password hashing with bcrypt
    - _Requirements: 7.3, 7.4_
  
  - [ ]* 2.5 Write unit tests for database models
    - Test model validation for required fields
    - Test default values (status, paymentMethod)
    - Test schema constraints (price non-negative, unique email)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 3. Implement backend API authentication and middleware
  - [ ] 3.1 Create JWT authentication middleware
    - Implement token verification function
    - Create middleware to protect routes requiring authentication
    - Handle token errors (expired, invalid, missing)
    - _Requirements: 7.3, 7.4, 8.2, 8.3_
  
  - [ ] 3.2 Set up Express middleware stack
    - Configure CORS with frontend origin
    - Add helmet for security headers
    - Set up JSON body parser
    - Add request logging middleware
    - Create global error handler middleware
    - _Requirements: 12.5_
  
  - [ ]* 3.3 Write unit tests for authentication middleware
    - Test valid JWT token acceptance
    - Test invalid token rejection
    - Test missing token rejection
    - Test expired token handling
    - _Requirements: 7.3, 7.4, 8.2, 8.3_

- [ ] 4. Implement backend API endpoints
  - [ ] 4.1 Create admin authentication endpoint
    - Implement POST /api/admin/login controller
    - Validate email and password from request body
    - Compare password with hashed password in database
    - Generate and return JWT token on success
    - Return 401 error for invalid credentials
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 4.2 Create products endpoint
    - Implement GET /api/products controller
    - Query database for all products
    - Return products array in response
    - Handle database errors
    - _Requirements: 1.4, 11.5_
  
  - [ ] 4.3 Create order creation endpoint
    - Implement POST /api/orders controller
    - Validate required fields (customer info, products, totalPrice)
    - Create new order in database with status "pending"
    - Return success response with orderId
    - Handle validation errors with 400 status
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 11.4_
  
  - [ ] 4.4 Create orders retrieval endpoint (admin)
    - Implement GET /api/orders controller with JWT authentication
    - Query all orders from database
    - Sort orders by createdAt descending (newest first)
    - Return orders array in response
    - _Requirements: 9.1, 9.4, 11.2_
  
  - [ ] 4.5 Create order status update endpoint (admin)
    - Implement PUT /api/orders/:id controller with JWT authentication
    - Validate status value (confirmed, delivered, cancelled)
    - Update order status in database
    - Return updated order in response
    - Handle order not found with 404 status
    - _Requirements: 10.5, 10.6, 11.3_
  
  - [ ]* 4.6 Write integration tests for API endpoints
    - Test order creation and retrieval flow
    - Test authentication flow with valid/invalid credentials
    - Test protected routes with/without JWT token
    - Test order status update flow
    - Use MongoDB Memory Server for isolated testing
    - _Requirements: 6.1, 7.3, 7.4, 8.2, 8.3, 10.5, 10.6_

- [ ] 5. Checkpoint - Backend API complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Seed initial data
  - [ ] 6.1 Create database seed script
    - Create seed script to populate 3 products (Audi, BMW, Mercedes wall art)
    - Create initial admin user with hashed password
    - Add product images (URLs or local paths)
    - _Requirements: 1.1, 1.2, 7.1_
  
  - [ ] 6.2 Run seed script and verify data
    - Execute seed script to populate database
    - Verify products and admin user created successfully
    - _Requirements: 1.1, 7.1_

- [ ] 7. Implement frontend cart state management
  - [ ] 7.1 Create Cart Context
    - Create React Context for cart state
    - Implement addToCart function
    - Implement removeFromCart function
    - Implement calculateTotal function
    - Store cart state in localStorage for persistence
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 7.2 Write unit tests for Cart Context
    - Test adding products to cart
    - Test removing products from cart
    - Test total price calculation with multiple items
    - Test localStorage persistence
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 8. Implement frontend authentication state management
  - [ ] 8.1 Create Auth Context
    - Create React Context for authentication state
    - Implement login function that stores JWT token
    - Implement logout function that clears token
    - Implement token retrieval from localStorage/cookies
    - Implement isAuthenticated check
    - _Requirements: 7.6, 8.1_
  
  - [ ]* 8.2 Write unit tests for Auth Context
    - Test login stores token correctly
    - Test logout clears token
    - Test isAuthenticated returns correct value
    - _Requirements: 7.6, 8.1_

- [ ] 9. Create frontend API client utilities
  - [ ] 9.1 Create centralized API request handler
    - Implement apiRequest function with error handling
    - Handle network errors and HTTP error responses
    - Parse JSON responses
    - Add authorization header for authenticated requests
    - _Requirements: 12.6_
  
  - [ ] 9.2 Create API service functions
    - Implement fetchProducts function
    - Implement createOrder function
    - Implement adminLogin function
    - Implement fetchOrders function (admin)
    - Implement updateOrderStatus function (admin)
    - _Requirements: 1.4, 3.4, 7.3, 9.1, 10.2, 10.3, 10.4_

- [ ] 10. Build customer storefront pages and components
  - [ ] 10.1 Create homepage with product display
    - Create ProductCard component with image, name, price, and add-to-cart button
    - Create ProductGrid component to display 3 products
    - Fetch products from API on page load
    - Implement add-to-cart functionality
    - Style with Tailwind CSS for modern, clean UI
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_
  
  - [ ] 10.2 Create cart page
    - Display all products in cart with name, price, quantity
    - Show total price calculation
    - Implement remove from cart functionality
    - Show empty cart message when cart is empty
    - Add "Proceed to Checkout" button
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 10.3 Create checkout page
    - Create CheckoutForm component with input fields (firstName, lastName, phone, address)
    - Implement form validation for required fields
    - Display validation error messages for empty fields
    - Set payment method to "Cash on Delivery"
    - Submit order to API on form submission
    - Display success message "We will contact you shortly" on success
    - Display error message on submission failure
    - Clear cart after successful order
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2_
  
  - [ ] 10.4 Create contact page
    - Create contact page with contact information or contact form
    - Add to main navigation
    - _Requirements: 5.1, 5.2_
  
  - [ ] 10.5 Create navigation component
    - Add links to homepage, cart, and contact page
    - Display cart item count badge
    - Style with Tailwind CSS
    - _Requirements: 5.1_
  
  - [ ]* 10.6 Write component tests for storefront
    - Test ProductCard renders correctly with product data
    - Test Cart displays correct total price
    - Test CheckoutForm validates required fields
    - Test Navigation links are present
    - Use React Testing Library
    - _Requirements: 1.2, 2.3, 3.2_

- [ ] 11. Checkpoint - Customer storefront complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Build admin dashboard pages and components
  - [ ] 12.1 Create admin login page
    - Create LoginForm component with email and password inputs
    - Implement form validation
    - Call adminLogin API on form submission
    - Store JWT token in Auth Context on success
    - Redirect to /admin/dashboard on successful login
    - Display error message for invalid credentials
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ] 12.2 Create protected route component
    - Create ProtectedRoute HOC or component
    - Check authentication status from Auth Context
    - Redirect to /admin/login if not authenticated
    - Render protected content if authenticated
    - _Requirements: 8.1_
  
  - [ ] 12.3 Create admin dashboard page
    - Create OrderTable component to display all orders
    - Create OrderRow component with customer details, products, total, status
    - Fetch orders from API on page load with JWT token
    - Display orders sorted by creation date (newest first)
    - Handle unauthorized access (redirect to login)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 12.4 Implement order status management
    - Add Confirm, Deliver, Cancel buttons to each order row
    - Call updateOrderStatus API when buttons are clicked
    - Refresh order list after successful status update
    - Display appropriate button states based on current status
    - Handle API errors gracefully
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [ ]* 12.5 Write component tests for admin dashboard
    - Test LoginForm validates inputs
    - Test ProtectedRoute redirects when not authenticated
    - Test OrderTable renders orders correctly
    - Test order status update buttons trigger API calls
    - _Requirements: 7.1, 8.1, 9.2, 10.1_

- [ ] 13. Implement error handling and user feedback
  - [ ] 13.1 Add error boundaries to React app
    - Create ErrorBoundary component to catch React errors
    - Display user-friendly error message
    - _Requirements: 12.6_
  
  - [ ] 13.2 Add toast notifications for user feedback
    - Install and configure toast notification library (react-hot-toast or similar)
    - Add success toasts for order creation, status updates
    - Add error toasts for API failures
    - _Requirements: 4.2, 12.6_
  
  - [ ] 13.3 Enhance error messages
    - Ensure all error messages are user-friendly
    - Add specific messages for network errors, validation errors, auth errors
    - _Requirements: 4.2, 7.5, 12.6_

- [ ] 14. Configure deployment for Railway
  - [ ] 14.1 Create Railway configuration files
    - Create railway.json or use railway.toml for configuration
    - Configure separate services for frontend and backend
    - Set up environment variables in Railway dashboard
    - _Requirements: 12.3, 12.4_
  
  - [ ] 14.2 Set up production environment variables
    - Configure MongoDB Atlas connection string
    - Set JWT secret for production
    - Configure frontend API URL to point to backend service
    - Set NODE_ENV to production
    - _Requirements: 12.4_
  
  - [ ] 14.3 Add production build scripts
    - Add build scripts to package.json for both frontend and backend
    - Configure Next.js for production build
    - Configure TypeScript compilation for backend
    - _Requirements: 12.3_
  
  - [ ] 14.4 Create README with deployment instructions
    - Document environment variables needed
    - Document deployment steps for Railway
    - Document local development setup
    - _Requirements: 12.2, 12.3_

- [ ] 15. Final integration and testing
  - [ ]* 15.1 Write end-to-end tests for critical flows
    - Test customer purchase flow (browse → add to cart → checkout → confirmation)
    - Test admin order management flow (login → view orders → update status)
    - Test error handling flows (validation errors, auth errors)
    - Use Playwright or Cypress
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.1, 9.1, 10.1_
  
  - [ ] 15.2 Manual testing checklist
    - Test on multiple browsers (Chrome, Firefox, Safari)
    - Test responsive design on mobile devices
    - Verify all error messages display correctly
    - Test complete customer purchase flow
    - Test complete admin order management flow
    - _Requirements: All requirements_
  
  - [ ] 15.3 Code quality review
    - Run ESLint and fix any issues
    - Format code with Prettier
    - Add code comments for complex logic
    - Review folder structure and organization
    - _Requirements: 12.1, 12.2_

- [ ] 16. Final checkpoint - Application complete
  - Ensure all tests pass, verify deployment readiness, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- The implementation follows a bottom-up approach: infrastructure → backend → frontend → integration
- All code should be written in TypeScript as specified in the design document
- Use Tailwind CSS for all styling to maintain consistency
- Environment variables must be used for all configuration values (database URLs, JWT secrets, API endpoints)
