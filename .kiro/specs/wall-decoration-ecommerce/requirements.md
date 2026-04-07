# Requirements Document

## Introduction

This document specifies the requirements for a wall decoration e-commerce platform that sells car-themed wall art products (Audi, BMW, Mercedes designs). The system consists of a customer-facing storefront built with Next.js and an admin dashboard for order management, backed by a Node.js/Express API and MongoDB database.

## Glossary

- **System**: The complete e-commerce platform including frontend, backend, and database
- **Storefront**: The customer-facing Next.js application
- **Admin_Dashboard**: The protected admin interface for managing orders
- **Backend_API**: The Node.js/Express REST API server
- **Database**: The MongoDB database storing products and orders
- **Customer**: A user browsing and purchasing products
- **Admin**: An authenticated user with access to order management
- **Order**: A purchase record containing customer information, products, total price, and status
- **Cart**: A temporary collection of products selected by a customer
- **Product**: A wall decoration item with image, name, and price
- **Order_Status**: The current state of an order (pending, confirmed, delivered, cancelled)
- **JWT_Token**: JSON Web Token used for admin authentication

## Requirements

### Requirement 1: Product Display

**User Story:** As a customer, I want to view available products on the homepage, so that I can browse and select items to purchase.

#### Acceptance Criteria

1. THE Storefront SHALL display exactly 3 products on the homepage
2. FOR EACH product displayed, THE Storefront SHALL show the product image, name, and price
3. THE Storefront SHALL render products with a clean modern UI design
4. WHEN the homepage loads, THE Storefront SHALL fetch product data from the Backend_API

### Requirement 2: Shopping Cart Management

**User Story:** As a customer, I want to add and remove products from my cart, so that I can manage my purchase before checkout.

#### Acceptance Criteria

1. WHEN a customer clicks add to cart on a product, THE Storefront SHALL add the product to the Cart
2. WHEN a customer removes a product from the Cart, THE Storefront SHALL remove the product from the Cart
3. WHILE the Cart contains products, THE Storefront SHALL display the total price of all items
4. THE Storefront SHALL display all products currently in the Cart
5. WHEN the Cart is empty, THE Storefront SHALL display an empty cart message

### Requirement 3: Checkout Process

**User Story:** As a customer, I want to complete my purchase by providing my information, so that I can receive my order.

#### Acceptance Criteria

1. THE Storefront SHALL provide input fields for first name, last name, phone number, and delivery address
2. WHEN a customer submits the checkout form, THE Storefront SHALL validate that all required fields are filled
3. THE Storefront SHALL set the payment method to Cash on Delivery
4. WHEN the checkout form is valid, THE Storefront SHALL submit the order data to the Backend_API
5. IF any required field is empty, THEN THE Storefront SHALL display a validation error message

### Requirement 4: Order Confirmation

**User Story:** As a customer, I want to receive confirmation after placing my order, so that I know my purchase was successful.

#### Acceptance Criteria

1. WHEN an order is successfully submitted, THE Storefront SHALL display the message "We will contact you shortly"
2. WHEN an order submission fails, THE Storefront SHALL display an error message to the customer

### Requirement 5: Contact Information

**User Story:** As a customer, I want to access contact information, so that I can reach the business if needed.

#### Acceptance Criteria

1. THE Storefront SHALL provide a contact page accessible from the main navigation
2. THE Storefront SHALL display contact information or a contact form on the contact page

### Requirement 6: Order Persistence

**User Story:** As the system, I want to store order data in the database, so that orders can be tracked and managed.

#### Acceptance Criteria

1. WHEN the Backend_API receives a valid order submission, THE Backend_API SHALL save the order to the Database
2. THE Backend_API SHALL store customer first name, last name, phone number, and address in the order record
3. THE Backend_API SHALL store the list of products and total price in the order record
4. WHEN creating a new order, THE Backend_API SHALL set the Order_Status to "pending"
5. WHEN creating a new order, THE Backend_API SHALL record the creation timestamp
6. WHEN an order is successfully saved, THE Backend_API SHALL return a success response to the Storefront

### Requirement 7: Admin Authentication

**User Story:** As an admin, I want to log in with my credentials, so that I can access the order management dashboard.

#### Acceptance Criteria

1. THE Storefront SHALL provide an admin login page at the route /admin/login
2. THE Storefront SHALL provide input fields for email and password on the login page
3. WHEN an admin submits valid credentials, THE Backend_API SHALL generate a JWT_Token
4. WHEN an admin submits valid credentials, THE Backend_API SHALL return the JWT_Token to the Storefront
5. IF the credentials are invalid, THEN THE Backend_API SHALL return an authentication error
6. WHEN authentication succeeds, THE Storefront SHALL store the JWT_Token for subsequent requests
7. WHEN authentication succeeds, THE Storefront SHALL redirect the admin to /admin/dashboard

### Requirement 8: Admin Dashboard Access Control

**User Story:** As the system, I want to protect admin routes, so that only authenticated admins can access order management features.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access /admin/dashboard, THE Storefront SHALL redirect to /admin/login
2. WHEN the Backend_API receives a request to a protected endpoint without a valid JWT_Token, THE Backend_API SHALL return an authorization error
3. WHEN the Backend_API receives a request to a protected endpoint with a valid JWT_Token, THE Backend_API SHALL process the request

### Requirement 9: Order Display in Admin Dashboard

**User Story:** As an admin, I want to view all orders in a table, so that I can monitor and manage customer purchases.

#### Acceptance Criteria

1. WHEN an authenticated admin accesses the Admin_Dashboard, THE Storefront SHALL fetch all orders from the Backend_API
2. THE Admin_Dashboard SHALL display orders in a table format
3. FOR EACH order, THE Admin_Dashboard SHALL display customer name, phone number, address, products, total price, and Order_Status
4. THE Admin_Dashboard SHALL display orders sorted by creation date with newest first

### Requirement 10: Order Status Management

**User Story:** As an admin, I want to update order statuses, so that I can track order fulfillment progress.

#### Acceptance Criteria

1. FOR EACH order in the Admin_Dashboard, THE Admin_Dashboard SHALL provide action buttons for status updates
2. WHEN an admin clicks the Confirm button, THE Storefront SHALL send a request to update the Order_Status to "confirmed"
3. WHEN an admin clicks the Deliver button, THE Storefront SHALL send a request to update the Order_Status to "delivered"
4. WHEN an admin clicks the Cancel button, THE Storefront SHALL send a request to update the Order_Status to "cancelled"
5. WHEN the Backend_API receives a status update request, THE Backend_API SHALL update the order in the Database
6. WHEN an order status is successfully updated, THE Admin_Dashboard SHALL refresh to display the new status

### Requirement 11: Backend API Endpoints

**User Story:** As a developer, I want well-defined API endpoints, so that the frontend can communicate with the backend effectively.

#### Acceptance Criteria

1. THE Backend_API SHALL provide a POST endpoint at /admin/login that accepts email and password
2. THE Backend_API SHALL provide a GET endpoint at /orders that returns all orders for authenticated admins
3. THE Backend_API SHALL provide a PUT endpoint at /orders/:id that updates order status for authenticated admins
4. THE Backend_API SHALL provide a POST endpoint for creating new orders from customer checkout
5. WHERE product data is needed, THE Backend_API SHALL provide a GET endpoint for retrieving products

### Requirement 12: Code Quality and Deployment Readiness

**User Story:** As a developer, I want clean, well-documented code with proper structure, so that the application is maintainable and deployment-ready.

#### Acceptance Criteria

1. THE System SHALL organize code in a clean folder structure separating frontend, backend, and shared concerns
2. THE System SHALL include code comments explaining key functionality
3. THE System SHALL be configured for deployment to Railway platform
4. THE System SHALL use environment variables for configuration values such as database connection strings and JWT secrets
5. THE Backend_API SHALL implement error handling for all endpoints
6. THE Storefront SHALL implement error handling for all API requests
