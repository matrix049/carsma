# Project Structure

## Overview

This is a monorepo containing both frontend and backend applications for the wall decoration e-commerce platform.

## Directory Structure

```
wall-decoration-ecommerce/
├── frontend/                    # Next.js storefront application
│   ├── app/                    # Next.js App Router pages
│   ├── public/                 # Static assets
│   ├── .env.local              # Frontend environment variables
│   ├── .env.example            # Frontend environment template
│   ├── next.config.ts          # Next.js configuration
│   ├── tailwind.config.ts      # Tailwind CSS configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── package.json            # Frontend dependencies
│
├── backend/                     # Express.js API server
│   ├── src/
│   │   ├── config/             # Configuration files (database, etc.)
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Express middleware (auth, error handling)
│   │   ├── models/             # Mongoose models (Product, Order, Admin)
│   │   ├── routes/             # API route definitions
│   │   └── server.ts           # Main server entry point
│   ├── dist/                   # Compiled JavaScript output
│   ├── .env                    # Backend environment variables
│   ├── .env.example            # Backend environment template
│   ├── tsconfig.json           # TypeScript configuration
│   └── package.json            # Backend dependencies
│
├── .gitignore                  # Git ignore rules
├── package.json                # Monorepo workspace configuration
├── README.md                   # Project documentation
└── PROJECT_STRUCTURE.md        # This file
```

## Backend Structure Details

### Models (`backend/src/models/`)
- `Product.ts` - Product schema (name, price, image, category, inStock)
- `Order.ts` - Order schema (customer info, products, totalPrice, status)
- `Admin.ts` - Admin schema (email, hashed password)

### Controllers (`backend/src/controllers/`)
- `authController.ts` - Admin authentication logic
- `productController.ts` - Product retrieval logic
- `orderController.ts` - Order creation and management logic

### Routes (`backend/src/routes/`)
- `auth.ts` - POST /api/admin/login
- `products.ts` - GET /api/products
- `orders.ts` - POST /api/orders, GET /api/orders, PUT /api/orders/:id

### Middleware (`backend/src/middleware/`)
- `auth.ts` - JWT token verification
- `errorHandler.ts` - Global error handling

### Config (`backend/src/config/`)
- `database.ts` - MongoDB connection configuration

## Frontend Structure Details

### Pages (`frontend/app/`)
- `/` - Homepage with product display
- `/cart` - Shopping cart view
- `/checkout` - Checkout form
- `/contact` - Contact information
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Order management (protected)

### Components (to be created)
- `ProductCard` - Individual product display
- `ProductGrid` - Product listing
- `Cart` - Cart items display
- `CheckoutForm` - Customer information form
- `Navigation` - Site navigation
- `OrderTable` - Admin order list
- `OrderRow` - Individual order in admin view

### Context (to be created)
- `CartContext` - Cart state management
- `AuthContext` - Authentication state management

## Configuration Files

### Backend Environment Variables (`.env`)
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/wall-decoration-ecommerce
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### Frontend Environment Variables (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: helmet, cors
- **Password Hashing**: bcrypt

## Development Workflow

1. Start MongoDB (local or use MongoDB Atlas)
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Access frontend at http://localhost:3000
5. Backend API available at http://localhost:5000

## Next Steps

The following tasks remain to complete the application:

1. Set up MongoDB database and models (Task 2)
2. Implement backend API authentication and middleware (Task 3)
3. Implement backend API endpoints (Task 4)
4. Seed initial data (Task 6)
5. Implement frontend cart state management (Task 7)
6. Implement frontend authentication state management (Task 8)
7. Create frontend API client utilities (Task 9)
8. Build customer storefront pages and components (Task 10)
9. Build admin dashboard pages and components (Task 12)
10. Implement error handling and user feedback (Task 13)
11. Configure deployment for Railway (Task 14)
12. Final integration and testing (Task 15)
