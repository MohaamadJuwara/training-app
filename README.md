# Training App — LMS API

A Learning Management System backend built with **NestJS**, **PostgreSQL**, **Prisma**, and **JWT authentication**.

Trainers create and publish course drafts. Trainees browse the public Catalog.

---

## Tech Stack

| Layer          | Technology                              |
|----------------|-----------------------------------------|
| Framework      | NestJS 10                               |
| Database       | PostgreSQL 16                           |
| ORM            | Prisma 5                                |
| Auth           | Passport JWT (simulated OAuth provider) |
| Documentation  | Swagger / OpenAPI (`/api`)              |
| Containerised  | Docker Compose                          |

---

## Setup — Docker (recommended)

### 1. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and **running**

### 2. Clone and enter the project

```bash
git clone <repo-url>
cd training-app
```

### 3. Configure environment

```bash
cp .env.dev .env
```

The defaults in `.env.example` work with Docker Compose as-is. See [Environment Variables](#environment-variables) for details.

### 4. Build and start

```bash
docker compose up --build
```

This builds the image, starts PostgreSQL, runs `prisma migrate deploy`, and launches the app.

### 5. Seed the database (optional, in a second terminal)

```bash
docker exec -it training-app npm run prisma:seed
```

### 6. Open the app

| Service    | URL                       |
|------------|---------------------------|
| API        | http://localhost:3000     |
| Swagger UI | http://localhost:3000/api |

---

## Setup — Local Development (no Docker)

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally

### 2. Clone and enter the project

```bash
git clone <repo-url>
cd training-app
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment

```bash
cp .env.dev .env
```

Edit `.env` and set `DATABASE_URL` to point at your local PostgreSQL instance.

### 5. Generate Prisma client and run migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 6. Seed the database (optional)

```bash
npm run prisma:seed
```

### 7. Start the dev server

```bash
npm run start:dev
```

### 8. Open the app

| Service       | URL                              |
|---------------|----------------------------------|
| API           | http://localhost:3000            |
| Swagger UI    | http://localhost:3000/api        |
| Prisma Studio | http://localhost:5555 (separate) |

> Start Prisma Studio separately with `npx prisma studio`.

---

## Environment Variables

| Variable       | Description                    |
|----------------|--------------------------------|
| `DATABASE_URL` | PostgreSQL connection string   |
| `JWT_SECRET`   | Secret used to sign JWT tokens |
| `PORT`         | HTTP port (default `3000`)     |

---

## Running Tests

```bash
npm test           # unit tests
npm run test:cov   # with coverage report
```

`PublishService` tests in [test/publish.service.spec.ts](test/publish.service.spec.ts) cover: first publish, re-publish versioning, data snapshot, NotFoundException, ForbiddenException, BadRequestException.

---

## API Overview

### Auth — `POST /auth/login`

Simulated OAuth login. Creates the user on first call with the provided role; existing users keep their role.

```json
{ "email": "trainer@example.com", "provider": "google", "role": "TRAINER" }
```

Returns a JWT — include it in protected requests:
```
Authorization: Bearer <access_token>
```

---

### Courses (TRAINER only)

| Method | Path                   | Description                               |
|--------|------------------------|-------------------------------------------|
| POST   | `/courses`             | Create a draft (201)                      |
| GET    | `/courses`             | List your drafts                          |
| GET    | `/courses/:id`         | Get a draft                               |
| PATCH  | `/courses/:id`         | Update a draft                            |
| DELETE | `/courses/:id`         | Delete a draft (204)                      |
| POST   | `/courses/:id/publish` | Publish draft → Catalog snapshot (201)    |

**Publish rules:** title and content must not be empty. Each publish creates a new Catalog entry with an incremented `version`. The entire operation runs in a **Prisma interactive transaction**.

---

### Catalog (public — no auth required)

| Method | Path                       | Description                              |
|--------|----------------------------|------------------------------------------|
| GET    | `/catalog`                 | List all published courses (cached 60s)  |
| GET    | `/catalog?title=cycling`   | Filter by title (case-insensitive)       |
| GET    | `/catalog/:id`             | Get a specific published course          |

---

## Seeded Users

| Email               | Role    |
|---------------------|---------|
| trainer@example.com | TRAINER |
| trainee@example.com | TRAINEE |

Login with either via `POST /auth/login` to get a token.

---

## Project Structure

```
src/
├── auth/           # JWT strategy, guards, RolesGuard, login controller
├── catalog/        # Public catalog (GET /catalog)
├── courses/        # Draft CRUD + publish endpoint (TRAINER only)
├── prisma/         # Global PrismaService
├── publish/        # Publish workflow with Prisma transaction
├── users/          # User lookup & creation
├── app.module.ts
└── main.ts

prisma/
├── schema.prisma   # User, Course (draft), Catalog (published snapshot)
└── seed.ts

test/
└── publish.service.spec.ts
```
