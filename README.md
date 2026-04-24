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

## Quick Start (Docker)

```bash
# 1. Enter the project
cd training-app

# 2. Copy env file
cp .env.example .env

# 3. Start database + app
docker compose up --build

# 4. Run migrations and seed (in a second terminal)
docker exec -it training-app npx prisma migrate deploy
docker exec -it training-app npm run prisma:seed
```

API: **http://localhost:3000**
Swagger UI: **http://localhost:3000/api**

---

## Local Development (no Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 16 running locally

```bash
npm install
cp .env.example .env        # set DATABASE_URL to your local Postgres

npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Once running:

| Service       | URL                              |
|---------------|----------------------------------|
| API           | http://localhost:3000            |
| Swagger UI    | http://localhost:3000/api        |
| Prisma Studio | http://localhost:5555 (separate) |

> **Note:** `http://localhost:5555` is **Prisma Studio**, not the app. Start it separately with `npx prisma studio`.

---

## Environment Variables

| Variable       | Description                    |
|----------------|--------------------------------|
| `DATABASE_URL` | PostgreSQL connection string   |
| `JWT_SECRET`   | Secret used to sign JWT tokens |
| `PORT`         | HTTP port (default `3000`)     |

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

## Running Tests

```bash
npm test           # unit tests
npm run test:cov   # with coverage report
```

`PublishService` tests in [test/publish.service.spec.ts](test/publish.service.spec.ts) cover: first publish, re-publish versioning, data snapshot, NotFoundException, ForbiddenException, BadRequestException.

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

---

## Seeded Users

| Email               | Role    |
|---------------------|---------|
| trainer@example.com | TRAINER |
| trainee@example.com | TRAINEE |

Login with either via `POST /auth/login` to get a token.
