# Tulip Backend

Node.js backend API for the Tulip dating application built with Fastify, Prisma, and PostgreSQL.

## Features

- **Authentication**: JWT-based sessions with HTTP-only cookies
- **Database**: PostgreSQL with Prisma ORM
- **File Uploads**: Cloudinary integration for media storage
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Validation**: Request validation with Zod schemas
- **TypeScript**: Full TypeScript support

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JWT + Redis sessions
- **File Storage**: Cloudinary
- **Validation**: Zod
- **Development**: tsx (TypeScript execution)

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis (optional, for production)
- Cloudinary account

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   Create a `.env` file in the backend directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/tulip"
   
   # JWT
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_EXPIRES_IN="7d"
   
   # Redis (optional)
   REDIS_URL="redis://localhost:6379"
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # Server
   PORT=3001
   NODE_ENV=development
   CLIENT_URL="http://localhost:5173"
   ```

3. **Database setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Or run migrations
   npm run db:migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout

### Profile
- `GET /profile/me` - Get current profile
- `POST /profile` - Create/update profile
- `PUT /profile` - Update profile

### Likes
- `GET /likes/incoming` - Get incoming likes
- `GET /likes/sent` - Get sent likes
- `POST /likes/send` - Send a like

### Matches
- `GET /matches` - Get user matches
- `GET /matches/:id` - Get specific match

### Conversations
- `GET /conversations` - Get user conversations
- `GET /conversations/:id` - Get specific conversation
- `POST /conversations/:id/messages` - Send message

### Media
- `POST /media/upload` - Upload photo
- `POST /media/signed-url` - Get signed upload URL

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:studio` - Open Prisma Studio

### Database
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations

## Architecture

The backend follows a clean architecture pattern:

- **Routes**: HTTP endpoint definitions
- **Controllers**: Request/response handling
- **Services**: Business logic
- **Models**: Database models (Prisma)
- **Middleware**: Authentication, validation, etc.

## Security Features

- JWT tokens stored in HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation with Zod schemas

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set secure JWT secret
4. Configure Cloudinary credentials
5. Set up Redis for session management
6. Use HTTPS in production

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include request validation
4. Write tests for new features
5. Update documentation
