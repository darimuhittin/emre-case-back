# İlan Platformu (Classified Ads Platform) Backend

This is the backend service for a classified ads platform built with NestJS, TypeScript, PostgreSQL, and TypeORM.

## Features

- User registration and authentication with JWT
- Email verification (simulated)
- Token refresh mechanism
- CRUD operations for listings
- Image upload for listings
- Filtering and pagination for listings
- Categories management
- Locations management (provinces and districts)

## Tech Stack

- NestJS with TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication
- Passport.js
- Class Validator

## Setup and Installation

### Using Docker (Recommended)

1. **Clone the repository**

```bash
git clone <repository-url>
cd emre-case-back
```

2. **Start the containers**

```bash
docker-compose up -d
```

This will start both the PostgreSQL database and the NestJS application.

3. **Access the API**

The API will be available at http://localhost:3000

### Manual Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd emre-case-back
```

2. **Install dependencies**

```bash
npm install
```

3. **Start PostgreSQL with Docker**

If you want to use Docker only for the database:

```bash
docker-compose up -d postgres
```

4. **Configure environment variables**

Create a `.env` file in the root directory with the following content:

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=emre_case

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=refresh-secret-key

# App
PORT=3000
```

5. **Run the application**

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Docker Setup

We've configured Docker to run both the PostgreSQL database and the NestJS application. Here's what's included:

1. **docker-compose.yml** - Defines services for the API and PostgreSQL
2. **Dockerfile** - Builds the NestJS application
3. **docker-entrypoint.sh** - Startup script for the API container

### Key Docker Features:
- Health checking for the PostgreSQL database
- Volume mounting for persistent database data
- Hot reloading for development
- Automatic database creation
- Separated development and production builds

### Docker Commands:

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Restart services
npm run docker:restart

# Start only the database
npm run docker:db
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
  - Request: `{ email: string, password: string, name?: string }`
  - Response: `{ accessToken: string, refreshToken: string }`

- `POST /auth/login` - Login user
  - Request: `{ email: string, password: string }`
  - Response: `{ accessToken: string, refreshToken: string }`

- `GET /auth/verify/:token` - Verify email
  - Params: `token: string`
  - Response: Success message

- `POST /auth/refresh-token` - Refresh access token
  - Request: `{ refreshToken: string }`
  - Response: `{ accessToken: string, refreshToken: string }`

- `POST /auth/logout` - Logout user
  - Response: Success message

### Users

- `GET /users/profile` - Get user profile
  - Response: `{ id: string, email: string, name: string, isEmailVerified: boolean, createdAt: Date, updatedAt: Date }`

### Listings

- `GET /listings` - Get all listings (with filters)
  - Query Parameters: 
    - `categoryId?: string`
    - `provinceId?: string`
    - `districtId?: string`
    - `search?: string`
    - `page?: number (default: 1)`
    - `limit?: number (default: 10)`
  - Response: `{ items: Listing[], total: number, page: number, limit: number, pages: number }`

- `GET /listings/:id` - Get a specific listing
  - Params: `id: string`
  - Response: `{ id: string, title: string, description: string, price: number, images: string[], user: User, category: Category, district: District, createdAt: Date, updatedAt: Date }`

- `POST /listings` - Create a listing
  - Request: `{ title: string, description: string, price: number, categoryId: string, districtId: string }`
  - Response: Created listing object

- `PATCH /listings/:id` - Update a listing
  - Params: `id: string`
  - Request: `{ title?: string, description?: string, price?: number, categoryId?: string, districtId?: string }`
  - Response: Updated listing object

- `DELETE /listings/:id` - Delete a listing
  - Params: `id: string`
  - Response: Success message

- `POST /listings/:id/images` - Upload an image for a listing
  - Params: `id: string`
  - Request: Form data with image file
  - Response: Updated listing with image URLs

- `DELETE /listings/:id/images/:index` - Delete an image from a listing
  - Params: `id: string, index: number`
  - Response: Updated listing with remaining image URLs

### Categories

- `GET /categories` - Get all categories
  - Response: `[{ id: string, name: string, listingsCount: number, createdAt: Date, updatedAt: Date }]`

- `GET /categories/:id` - Get a specific category
  - Params: `id: string`
  - Response: `{ id: string, name: string, listingsCount: number, createdAt: Date, updatedAt: Date }`

- `POST /categories` - Create a category
  - Request: `{ name: string }`
  - Response: Created category object

- `PATCH /categories/:id` - Update a category
  - Params: `id: string`
  - Request: `{ name: string }`
  - Response: Updated category object

- `DELETE /categories/:id` - Delete a category
  - Params: `id: string`
  - Response: Success message

### Locations

- `GET /locations/provinces` - Get all provinces
  - Response: `[{ id: string, name: string, districts: District[], createdAt: Date, updatedAt: Date }]`

- `GET /locations/provinces/:id` - Get a specific province
  - Params: `id: string`
  - Response: `{ id: string, name: string, districts: District[], createdAt: Date, updatedAt: Date }`

- `GET /locations/districts/:id` - Get a specific district
  - Params: `id: string`
  - Response: `{ id: string, name: string, province: Province, createdAt: Date, updatedAt: Date }`

- `POST /locations/provinces` - Create a province
  - Request: `{ name: string }`
  - Response: Created province object

- `POST /locations/districts` - Create a district
  - Request: `{ name: string, provinceId: string }`
  - Response: Created district object

- `PATCH /locations/provinces/:id` - Update a province
  - Params: `id: string`
  - Request: `{ name: string }`
  - Response: Updated province object

- `PATCH /locations/districts/:id` - Update a district
  - Params: `id: string`
  - Request: `{ name: string, provinceId?: string }`
  - Response: Updated district object

- `DELETE /locations/provinces/:id` - Delete a province
  - Params: `id: string`
  - Response: Success message

- `DELETE /locations/districts/:id` - Delete a district
  - Params: `id: string`
  - Response: Success message 