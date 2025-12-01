# Backend Architecture Plan

## Overview
Transformation of Reading Trainer from demo to production-ready backend system.

## Architecture Layers

```
┌─────────────────────────────────────┐
│         API Layer (Routes)          │  ← Next.js API Routes
├─────────────────────────────────────┤
│      Controllers (Handlers)         │  ← Request/Response handling
├─────────────────────────────────────┤
│         Services (Business)        │  ← Business logic
├─────────────────────────────────────┤
│      Repositories (Data Access)    │  ← Database operations
├─────────────────────────────────────┤
│         Models (Entities)          │  ← Domain models
└─────────────────────────────────────┘
```

## Database Schema Design

### Core Tables

1. **users** - User accounts (extends Supabase auth.users)
2. **user_profiles** - Extended user information
3. **reading_texts** - Reading passages library
4. **reading_results** - User reading session results
5. **badges** - Achievement badges
6. **user_badges** - User badge assignments
7. **sessions** - Reading practice sessions
8. **analytics** - Aggregated analytics data
9. **audit_logs** - System audit trail

### Relations
- users → user_profiles (1:1)
- users → reading_results (1:N)
- users → user_badges (1:N)
- reading_texts → reading_results (1:N)
- users → sessions (1:N)

## Technology Stack

- **Database**: PostgreSQL (via Supabase/Prisma)
- **ORM**: Prisma (or raw SQL with pg)
- **Validation**: Zod
- **Logging**: Winston
- **Auth**: JWT (custom, replacing Supabase auth for backend)
- **Caching**: Redis
- **Jobs**: BullMQ
- **API Docs**: OpenAPI 3.0 (Swagger)
- **Testing**: Jest + Supertest

## Module Structure

```
/backend
  /src
    /config          - Configuration management
    /database         - DB connection, migrations
    /models           - Domain models
    /repositories     - Data access layer
    /services         - Business logic
    /controllers      - Request handlers
    /middleware       - Auth, validation, error handling
    /dto              - Data Transfer Objects
    /utils            - Utilities
    /jobs             - Background jobs
    /cache            - Redis caching
    /logger           - Logging setup
  /migrations         - SQL migration files
  /tests              - Test suites
  /docs               - API documentation
```

## API Endpoints

### Authentication
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout

### Users
- GET /api/v1/users/:id
- PUT /api/v1/users/:id
- GET /api/v1/users/:id/profile
- GET /api/v1/users/:id/stats

### Reading Texts
- GET /api/v1/texts (with filters, pagination)
- GET /api/v1/texts/:id
- POST /api/v1/texts (admin)
- PUT /api/v1/texts/:id (admin)
- DELETE /api/v1/texts/:id (admin)

### Reading Results
- GET /api/v1/results (with filters, pagination)
- GET /api/v1/results/:id
- POST /api/v1/results
- GET /api/v1/results/user/:userId

### Sessions
- GET /api/v1/sessions
- POST /api/v1/sessions
- GET /api/v1/sessions/:id

### Analytics
- GET /api/v1/analytics/user/:userId
- GET /api/v1/analytics/overview

## Security Features

- JWT-based authentication
- Role-based access control (User, Admin, Parent)
- Rate limiting per endpoint
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Secure headers (Helmet)

## Production Features

- Connection pooling
- Redis caching (query results, user sessions)
- Background jobs (analytics aggregation, email notifications)
- Comprehensive logging
- Error tracking
- Health checks
- Metrics collection

