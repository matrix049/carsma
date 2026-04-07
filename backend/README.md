# Wall Decoration E-Commerce Backend

Backend API for the wall decoration e-commerce platform built with Node.js, Express, TypeScript, and MongoDB.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Seed Database
```bash
npm run seed
```
See [SEEDING.md](./SEEDING.md) for detailed seeding instructions.

### 4. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data

## API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `POST /api/orders` - Create new order
- `POST /api/admin/login` - Admin authentication

### Protected Endpoints (Require JWT)
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id` - Update order status (admin)

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for detailed API documentation.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts (seed, etc.)
│   └── server.ts        # Application entry point
├── .env                 # Environment variables
└── package.json
```

## Environment Variables

Required environment variables (see `.env.example`):

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT token expiration time
- `FRONTEND_URL` - Frontend URL for CORS
- `ADMIN_EMAIL` - Default admin email for seeding
- `ADMIN_PASSWORD` - Default admin password for seeding

## Database Seeding

The project includes a seed script to populate initial data:
- 3 products (Audi, BMW, Mercedes wall art)
- 1 admin user

For detailed seeding instructions, see [SEEDING.md](./SEEDING.md)

## Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Running Tests
```bash
# Tests will be added in future tasks
npm test
```

## Deployment

The backend is configured for deployment on Railway. See the main project README for deployment instructions.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Security:** helmet, cors, bcrypt
- **Development:** ts-node-dev for hot reload
