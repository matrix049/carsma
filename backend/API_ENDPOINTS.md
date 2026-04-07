# Backend API Endpoints

This document describes all available API endpoints for the Wall Decoration E-Commerce platform.

## Base URL
- Development: `http://localhost:5000`
- Production: Set via `BACKEND_URL` environment variable

## Authentication
Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Admin Authentication

#### POST /api/admin/login
Authenticate admin user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "error": true,
  "message": "Invalid credentials"
}
```

---

### 2. Products

#### GET /api/products
Retrieve all products.

**Authentication:** Not required

**Success Response (200):**
```json
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Audi Wall Art",
      "price": 50,
      "image": "/images/audi.jpg",
      "description": "Premium Audi wall decoration",
      "category": "Audi",
      "inStock": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Orders

#### POST /api/orders
Create a new order from customer checkout.

**Authentication:** Not required

**Request Body:**
```json
{
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "address": "123 Main St, City, Country"
  },
  "products": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "name": "Audi Wall Art",
      "price": 50,
      "quantity": 1
    }
  ],
  "totalPrice": 50,
  "paymentMethod": "Cash on Delivery"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "orderId": "507f1f77bcf86cd799439012",
  "message": "Order created successfully"
}
```

**Error Response (400):**
```json
{
  "error": true,
  "message": "Customer information is required (firstName, lastName, phone, address)"
}
```

---

#### GET /api/orders
Retrieve all orders (admin only).

**Authentication:** Required (JWT token)

**Success Response (200):**
```json
{
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "customer": {
        "firstName": "John",
        "lastName": "Doe",
        "phone": "1234567890",
        "address": "123 Main St, City, Country"
      },
      "products": [
        {
          "productId": "507f1f77bcf86cd799439011",
          "name": "Audi Wall Art",
          "price": 50,
          "quantity": 1
        }
      ],
      "totalPrice": 50,
      "paymentMethod": "Cash on Delivery",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Response (401):**
```json
{
  "error": true,
  "message": "Authorization header missing"
}
```

---

#### PUT /api/orders/:id
Update order status (admin only).

**Authentication:** Required (JWT token)

**URL Parameters:**
- `id` - Order ID

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `delivered`
- `cancelled`

**Success Response (200):**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "customer": { ... },
    "products": [ ... ],
    "totalPrice": 50,
    "paymentMethod": "Cash on Delivery",
    "status": "confirmed",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": true,
  "message": "Order not found"
}
```

**Error Response (400):**
```json
{
  "error": true,
  "message": "Invalid status. Must be one of: pending, confirmed, delivered, cancelled"
}
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": true,
  "message": "Error description",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

## Testing with cURL

### Login as Admin
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Get Products
```bash
curl http://localhost:5000/api/products
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "1234567890",
      "address": "123 Main St"
    },
    "products": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "name": "Audi Wall Art",
        "price": 50,
        "quantity": 1
      }
    ],
    "totalPrice": 50
  }'
```

### Get Orders (Admin)
```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Order Status (Admin)
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
```
