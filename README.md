# Wall Decoration E-Commerce Platform

A modern e-commerce platform for car-themed wall art (Audi, BMW, Mercedes designs).

## Project Structure

```
wall-decoration-ecommerce/
├── frontend/          # Next.js storefront application
├── backend/           # Express.js API server
└── package.json       # Monorepo workspace configuration
```

## Technology Stack

### Frontend
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- React Context API for state management

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose ODM
- JWT authentication
- Security middleware (helmet, cors)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

3. Configure environment variables:

**Backend (.env)**
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/wall-decoration-ecommerce
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Development

Run both frontend and backend in development mode:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

This application is configured for deployment on Railway.

### Environment Variables (Production)

Set the following environment variables in Railway:

**Backend Service:**
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Strong secret key for JWT tokens
- `FRONTEND_URL`: Production frontend URL
- `NODE_ENV`: production

**Frontend Service:**
- `NEXT_PUBLIC_API_URL`: Production backend API URL

## License

ISC
