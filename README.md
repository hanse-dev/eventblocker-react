# NADA Event Management System

A full-stack event management application built with React and Node.js, allowing users to create, browse, and book events.

## Features

- User authentication (Admin and Regular users)
- Event creation and management
- Event booking system
- Responsive design
- RESTful API

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd nada-react
```

2. Install dependencies for both frontend and backend:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
```

4. Run database migrations:
```bash
cd backend
npx prisma migrate deploy
```

5. Create the admin user:
```bash
cd backend
node scripts/createAdmin.js
```

6. Start the development servers:
```bash
npm run dev
```

## Creating an Admin User

There are three ways to create an admin user:

### Method 1: Using the Admin Creation Script

1. Set the admin credentials in your `.env` file:
```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password
```

2. Run the admin creation script:
```bash
cd backend
node scripts/createAdmin.js
```

### Method 2: Using the API

Send a POST request to `/api/auth/create-admin` with the following body:
```json
{
  "email": "admin@example.com",
  "password": "your_password",
  "name": "Admin Name"
}
```

Example using curl:
```bash
curl -X POST http://localhost:3000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password","name":"Admin Name"}'
```

### Method 3: Using the Registration API (First User Only)

The first user who registers through the regular registration endpoint will automatically become an admin:

```json
{
  "email": "admin@example.com",
  "password": "your_password",
  "name": "Admin Name"
}
```

**Note**: Only one admin can be created using Method 1 or Method 3. Additional admin users must be created by an existing admin through Method 2.

## API Documentation

### Authentication Endpoints

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/create-admin` - Create admin user (requires existing admin)
- GET `/api/auth/me` - Get current user info

### Event Endpoints

- GET `/api/events` - Get all events
- GET `/api/events/:id` - Get single event
- POST `/api/events` - Create event (Admin only)
- PUT `/api/events/:id` - Update event (Admin only)
- DELETE `/api/events/:id` - Delete event (Admin only)

### Booking Endpoints

- POST `/api/bookings` - Create booking
- GET `/api/bookings/user` - Get user's bookings
- GET `/api/bookings/event/:id` - Get event's bookings (Admin only)
- PUT `/api/bookings/:id` - Update booking status

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
