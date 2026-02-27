# FireHIS Demo Project — FastAPI (GraphQL) + Angular

> Full-stack application built as part of the **FireHIS v0.1.0** demonstration project.  
> A production-ready skeleton: authentication, role-based access, product CRUD, dark mode, and i18n — all wired together.

---

## Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Prerequisites](#-prerequisites)
5. [Environment Variables](#-environment-variables)
6. [Running the Project](#-running-the-project)
7. [Backend — Deep Dive](#-backend--deep-dive)
8. [Frontend — Deep Dive](#-frontend--deep-dive)
9. [GraphQL API Reference](#-graphql-api-reference)
10. [Database & Migrations](#-database--migrations)
11. [Testing](#-testing)
12. [Definition of Done](#-definition-of-done)
13. [Roadmap / Next Steps](#-roadmap--next-steps)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│           Angular 21 (SPA — http://localhost:4200)         │
│   Apollo Client ──► GraphQL over HTTP ──► JWT in Headers   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP POST /graphql
┌──────────────────────────▼──────────────────────────────────┐
│              FastAPI Backend (http://localhost:8000)        │
│          Strawberry GraphQL + JWT Middleware                │
│          CORS configured for localhost:4200                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQLAlchemy ORM
┌──────────────────────────▼──────────────────────────────────┐
│          PostgreSQL 15 (Docker — port 5433)                 │
│          Tables: users, products                            │
│          pgAdmin available at http://localhost:5050         │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | latest | REST + GraphQL router |
| Strawberry GraphQL | latest | Schema-first GraphQL framework |
| SQLAlchemy | latest | ORM for PostgreSQL |
| Alembic | latest | Database migrations |
| psycopg2-binary | latest | PostgreSQL driver |
| passlib[bcrypt] | latest | Password hashing |
| python-jose[cryptography] | latest | JWT creation & validation |
| python-dotenv | latest | Environment variable loading |
| uvicorn[standard] | latest | ASGI server |
| pytest + pytest-asyncio | latest | Backend testing |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21.1.5 | SPA framework (standalone components) |
| Angular Material | 21.1.5 | UI component library |
| Apollo Angular | 13.0.0 | GraphQL client |
| @apollo/client | 4.x | Apollo core (InMemoryCache, links) |
| @ngx-translate | 17.x | Internationalisation (EN / FR) |
| Tailwind CSS | 3.4.x | Utility-first CSS |
| RxJS | 7.8.x | Reactive programming |
| Jest | 30.x | Unit testing |
| TypeScript | 5.9.x | Typed JavaScript |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker + Docker Compose | PostgreSQL + pgAdmin containers |
| pgAdmin 4 | Database administration GUI |

---

## Project Structure

```
Projet_Demonstration/
│
├── backend/                        # FastAPI application
│   ├── .env                        # Environment secrets (never commit!)
│   ├── requirements.txt            # Python dependencies
│   ├── alembic.ini                 # Alembic config
│   ├── docker-compose.yaml         # PostgreSQL + pgAdmin containers
│   ├── alembic/                    # Database migration scripts
│   │   ├── env.py                  # Alembic runtime environment
│   │   └── versions/               # Migration version files
│   └── app/                        # Application source
│       ├── main.py                 # FastAPI app entry point, CORS, startup
│       ├── database.py             # SQLAlchemy engine + Base + SessionLocal
│       ├── db.py                   # DB connection tester (startup check)
│       ├── models.py               # SQLAlchemy ORM models (User, Product)
│       ├── graphql_schema.py       # All GraphQL Types, Queries & Mutations
│       ├── jwt_utils.py            # JWT create/decode utilities
│       └── security.py             # bcrypt password hash/verify
│
└── frontend/                       # Angular application
    ├── package.json                # NPM dependencies & scripts
    ├── angular.json                # Angular workspace config
    ├── jest.config.js              # Jest testing config
    ├── tailwind.config.js          # Tailwind CSS config
    ├── tsconfig.json               # TypeScript base config
    └── src/
        ├── main.ts                 # Angular bootstrap
        ├── index.html              # Root HTML shell
        ├── styles.scss             # Global styles
        └── app/
            ├── app.config.ts       # Root providers (Router, Apollo, i18n)
            ├── app.routes.ts       # Route definitions with AuthGuard
            ├── app.ts              # Root AppComponent
            ├── auth.guard.ts       # Route guard (checks JWT in localStorage)
            ├── theme.service.ts    # Light/Dark theme toggle & persistence
            ├── i18n.service.ts     # Language initialization & switching (EN/FR)
            ├── layout/
            │   └── main-layout/    # App shell: Toolbar + Sidenav
            ├── pages/
            │   ├── login/          # Login page (Reactive Forms + GraphQL)
            │   └── products/       # Product CRUD pages & service
            │       ├── products.ts             # Product list component
            │       ├── products.html           # List template (Material table)
            │       ├── create-product.ts       # Create form component
            │       ├── edit-product.ts         # Edit form component
            │       ├── confirm-delete-dialog.ts # Delete confirmation dialog
            │       └── products.service.ts     # GraphQL queries/mutations
            └── services/
                └── auth.service.ts  # Token storage: login, logout, isLoggedIn
```

---

## Prerequisites

Make sure the following are installed on your machine:

| Tool | Min Version | Download |
|---|---|---|
| Git | any | https://git-scm.com |
| Docker Desktop | any | https://www.docker.com/products/docker-desktop |
| Python | 3.11+ | https://www.python.org/downloads |
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | included with Node.js |
| Angular CLI | 21.x | `npm install -g @angular/cli` |

---

## Environment Variables

### `backend/.env`

Create (or update) this file before starting the backend. **Never commit it to version control.**

```env
# PostgreSQL connection string — matches docker-compose.yaml
DATABASE_URL=postgresql://user:password@localhost:5433/fastapi_db

# JWT settings
JWT_SECRET=your-strong-secret-key-change-me
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60000
```

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Full PostgreSQL connection URL | `postgresql://user:password@localhost:5433/fastapi_db` |
| `JWT_SECRET` | Secret key for signing JWT tokens | any long random string |
| `JWT_ALGORITHM` | JWT signature algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Token validity in minutes | `60000` (~41 days) |

> The backend will **refuse to start** if `JWT_SECRET` or `DATABASE_URL` are missing.

---

## Running the Project

### Step 1 — Start the Database (Docker)

```bash
# From the backend/ directory
docker compose up -d
```

This starts:
- **PostgreSQL 15** on port `5433` (mapped from container port 5432)
- **pgAdmin 4** on port `5050` (http://localhost:5050)

Verify containers are running:

```bash
docker ps
```

pgAdmin credentials:
- Email: `Serrioui@admin.com`
- Password: `admin`

---

### Step 2 — Start the Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload
```

The backend will be available at:

| Endpoint | URL |
|---|---|
| Health check | http://localhost:8000/health |
| GraphQL Playground | http://localhost:8000/graphql |

Successful startup console output:
```
Database connected successfully
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

### Step 3 — Start the Frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Angular dev server
npm start
# or: ng serve
```

The app will be available at:

| URL | Description |
|---|---|
| http://localhost:4200 | Angular SPA |
| http://localhost:4200/login | Login page |
| http://localhost:4200/products | Product list (requires auth) |

---

## Backend — Deep Dive

### Application Startup (`app/main.py`)

- Creates a **FastAPI** app titled `"Demo API"`.
- Registers **CORS middleware** allowing `http://localhost:4200` and `http://127.0.0.1:4200` with full method/header access and credentials.
- Mounts the **Strawberry GraphQL router** at `/graphql`.
- On startup, runs `test_db_connection()` to validate the PostgreSQL connection.
- Exposes `GET /health → { "status": "UP" }` for infrastructure probes.

### Database Layer (`app/database.py` + `app/db.py`)

- Uses **SQLAlchemy** with a synchronous engine (`pool_pre_ping=True` for resilience).
- `SessionLocal` is a factory for database sessions (autocommit=False, autoflush=False).
- `Base` is declared here; all models inherit from it.
- `db.py` provides `test_db_connection()` that runs `SELECT 1` on startup.

### Data Models (`app/models.py`)

#### `User` table (`users`)

| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | Primary key, auto-increment |
| `username` | String(50) | Unique, not null |
| `email` | String(255) | Unique, not null |
| `password_hash` | String(255) | Not null (bcrypt hash) |
| `role` | Enum | Values: `ADMIN`, `USER` — default: `USER` |
| `created_at` | DateTime(tz) | Server default: now() |
| `updated_at` | DateTime(tz) | Server default: now(), auto-update |

#### `Product` table (`products`)

| Column | Type | Constraints |
|---|---|---|
| `id` | Integer | Primary key, auto-increment |
| `name` | String(255) | Not null |
| `description` | String(1000) | Nullable |
| `price` | Numeric(10,2) | Not null |
| `quantity` | Integer | Not null |
| `created_at` | DateTime(tz) | Server default: now() |
| `updated_at` | DateTime(tz) | Server default: now(), auto-update |

### Security (`app/security.py`)

Uses **passlib** with the bcrypt scheme:

```python
hash_password(password: str) -> str       # Hash a plaintext password
verify_password(plain, hashed) -> bool    # Verify a password against its hash
```

### JWT Utilities (`app/jwt_utils.py`)

Uses **python-jose** to handle tokens:

```python
create_access_token(data: dict) -> str    # Sign and encode a JWT
decode_token(token: str) -> dict          # Decode and validate a JWT
```

The JWT payload contains:
- `user_id` — the user's database ID
- `username` — the user's username
- `role` — `"ADMIN"` or `"USER"`
- `exp` — expiry timestamp

Token is read from the `Authorization: Bearer <token>` request header inside GraphQL resolvers.

---

## Frontend — Deep Dive

### Application Bootstrap

`src/main.ts` → `AppComponent` → `appConfig` providers → Angular router

### Root Providers (`app/app.config.ts`)

Configures the entire Angular application:

| Provider | Purpose |
|---|---|
| `provideRouter(routes)` | Angular router with all application routes |
| `provideHttpClient()` | HttpClient for HTTP requests |
| `provideAnimations()` | Angular Material animations |
| `TranslateModule.forRoot(...)` | Translation system with HTTP JSON loader |
| `MatSnackBarModule` | Global snack bar notifications |
| `APP_INITIALIZER` | Runs `i18n.init()` before app renders |
| `provideApollo(...)` | Apollo GraphQL client with auth + error links |

### Apollo GraphQL Configuration

The Apollo client is configured with a **3-link chain**:

```
errorLink → authLink → httpLink
```

| Link | Behaviour |
|---|---|
| `errorLink` | Catches GraphQL `FORBIDDEN` / `UNAUTHENTICATED` errors. Shows snackbar and redirects to `/login` on expired sessions. |
| `authLink` | Reads the JWT from `localStorage` and injects `Authorization: Bearer <token>` into every request header. |
| `httpLink` | Sends all GraphQL operations as POST requests to `http://127.0.0.1:8000/graphql`. |

All operations use `fetchPolicy: 'no-cache'` to always fetch fresh data from the server.

### Routing (`app/app.routes.ts`)

| Route | Component | Guard |
|---|---|---|
| `/login` | `LoginComponent` | None |
| `/` | `MainLayoutComponent` | `authGuard` |
| `/products` | `ProductsComponent` | `authGuard` (via parent) |
| `/products/new` | `CreateProductComponent` | `authGuard` (via parent) |
| `/products/:id/edit` | `EditProductComponent` | `authGuard` (via parent) |
| `/**` | Redirect → `/login` | None |

### Auth Guard (`auth.guard.ts`)

A functional guard that:
1. Reads the JWT token from `localStorage`.
2. If a non-empty token exists → **allows navigation**.
3. If no token → **redirects to `/login`**.

### Auth Service (`services/auth.service.ts`)

Simple token manager stored in `localStorage`:

```typescript
loginSuccess(token: string): void   // Store token after login
logout(): void                       // Remove token
isLoggedIn(): boolean               // True if token exists
getToken(): string | null           // Retrieve raw token
```

### Theme Service (`theme.service.ts`)

- Supports `light` and `dark` themes.
- Persists user preference in `localStorage` under the key `"theme"`.
- Applies theme by toggling the `dark-theme` CSS class on `document.body`.
- Exposes `mode$` Observable (RxJS `BehaviorSubject`) for reactive UI updates.

### i18n Service (`i18n.service.ts`)

- Reads language preference from `localStorage` under key `"lang"` (`"EN"` or `"FR"`).
- Initialised via `APP_INITIALIZER` before the app renders.
- Delegates to `@ngx-translate/core`; translation files are fetched from `/assets/i18n/{en|fr}.json`.

### Products Module (`pages/products/`)

#### `ProductsService`

Central GraphQL service — all data interactions go through here:

| Method | Operation | GraphQL Operation |
|---|---|---|
| `getProducts()` | List all products | `query Products` |
| `getProductById(id)` | Get one product | `query ProductById` |
| `createProduct(input)` | Create a product | `mutation CreateProduct` |
| `updateProduct(id, input)` | Update a product | `mutation UpdateProduct` |
| `deleteProduct(id)` | Delete a product | `mutation DeleteProduct` |

All methods return **Observables** and use `fetchPolicy: 'no-cache'`.

#### `ProductsComponent` (List Page)

- Displays products in an **Angular Material data table** with columns: Name, Price, Quantity, Actions.
- Shows a **progress bar** while loading.
- Listens to `NavigationEnd` router events to auto-refresh when returning to `/products`.
- Delete action opens a **confirm dialog** and handles `FORBIDDEN` / `UNAUTHORIZED` errors gracefully.
- All user-facing messages are **translated** via `TranslateService`.

#### `CreateProductComponent` / `EditProductComponent`

- Reactive forms with validation (name ≥ 2 chars, price ≥ 0, quantity ≥ 0).
- On success: shows a snackbar and navigates back to `/products`.
- On error: shows a translated error snackbar and stays on the form.

#### `ConfirmDeleteDialogComponent`

- Material dialog asking the user to confirm deletion.
- Receives the product name via `MAT_DIALOG_DATA` and displays it in the message.

---

## GraphQL API Reference

Playground: **http://localhost:8000/graphql**

> All operations except `register` and `login` require an `Authorization: Bearer <token>` header.

### Queries

#### `hello` — Health check query
```graphql
query {
  hello
}
```

#### `me` — Get the authenticated user
```graphql
query {
  me {
    id
    username
    role
  }
}
```

#### `products` — List all products (auth required)
```graphql
query {
  products {
    id
    name
    description
    price
    quantity
    createdAt
    updatedAt
  }
}
```

#### `productById` — Get a single product
```graphql
query {
  productById(id: 1) {
    id
    name
    description
    price
    quantity
  }
}
```

---

### Mutations

#### `register` — Create a new account
```graphql
mutation {
  register(
    username: "john"
    email: "john@example.com"
    password: "secret123"
    role: "USER"       # or "ADMIN"
  ) {
    token
    user {
      id
      username
      role
    }
  }
}
```

**Validations:**
- `username` — required
- `email` — required, unique
- `password` — required, min 6 characters
- `role` — must be `"USER"` or `"ADMIN"`
- Username and email must not already exist

#### `login` — Authenticate and get a token
```graphql
mutation {
  login(username: "john", password: "secret123") {
    token
    user {
      id
      username
      role
    }
  }
}
```

#### `createProduct` — Create a product (auth required)
```graphql
mutation {
  createProduct(input: {
    name: "Product A"
    description: "A great product"
    price: 29.99
    quantity: 100
  }) {
    product {
      id
      name
      price
      quantity
    }
  }
}
```

#### `updateProduct` — Update a product (auth required)
```graphql
mutation {
  updateProduct(id: 1, input: {
    name: "Updated Name"
    price: 49.99
    quantity: 50
  }) {
    product {
      id
      name
      price
      quantity
    }
  }
}
```

#### `deleteProduct` — Delete a product (**ADMIN only**)
```graphql
mutation {
  deleteProduct(id: 1)
}
```

> Returns `true` on success.  
> Returns `Forbidden` error if the authenticated user is not `ADMIN`.

---

### Error Handling

| Error Message | Cause |
|---|---|
| `Unauthorized` | Missing or invalid JWT token |
| `Forbidden` | Action requires ADMIN role |
| `Invalid credentials` | Wrong username or password during login |
| `Username already exists` | Duplicate username during register |
| `Email already exists` | Duplicate email during register |
| `Product not found` | Product with given ID does not exist |
| `Validation error: name` | Product name is empty or < 2 characters |
| `Validation error: price` | Product price is negative |
| `Validation error: quantity` | Product quantity is negative |

---

## Database & Migrations

The project uses **Alembic** for schema versioning.

```bash
# Apply all pending migrations (run from backend/ directory)
alembic upgrade head

# Create a new migration after changing models
alembic revision --autogenerate -m "describe the change"

# Downgrade one step
alembic downgrade -1

# Show current revision
alembic current
```

**Docker Compose database configuration:**

| Setting | Value |
|---|---|
| Image | `postgres:15-alpine` |
| Container name | `fastapi_postgres` |
| Host port | `5433` |
| Database name | `fastapi_db` |
| Username | `user` |
| Password | `password` |
| Volume | `postgres_data` (persistent) |

---

## Testing

### Backend Tests

```bash
# From backend/ directory (with venv activated)
pytest
# or with verbose output
pytest -v
```

Uses `pytest` + `pytest-asyncio`.

### Frontend Tests

```bash
# From frontend/ directory
npm test             # Run all Jest tests once
npm run test:watch   # Run in watch mode
```

Test configuration is in `jest.config.js` using `jest-preset-angular`.

#### Existing test files:

| File | Coverage |
|---|---|
| `app.spec.ts` | Root `AppComponent` smoke test |
| `auth.service.spec.ts` | `AuthService` token management |
| `products.spec.ts` | `ProductsComponent` unit tests |
| `products.service.spec.ts` | `ProductsService` GraphQL operations |
| `products.ui.spec.ts` | Products page UI integration test |
| `create-product.spec.ts` | Create form validation & submission |

---

## Definition of Done

A feature is considered **DONE** when all of the following are true:

- [ ] Feature is fully implemented
- [ ] UI is functional and navigable
- [ ] All form validations are active
- [ ] All error cases are handled and display user-friendly messages
- [ ] No `console.error` warnings in the browser
- [ ] All related tests pass (`npm test` / `pytest`)
- [ ] Code is pushed to the repository and documented

---

## Roadmap / Next Steps

| User Story | Status |
|---|---|
| US-1: Project setup (FastAPI, Angular, Docker) | Done |
| US-2: PostgreSQL connection via SQLAlchemy | Done |
| US-3: User model + password hashing | Done |
| US-4: JWT authentication | Done |
| US-5: GraphQL endpoint (Strawberry) | Done |
| US-6: `register` + `login` mutations | Done |
| US-7: `me` query (authenticated) | Done |
| US-8: Product CRUD (backend) | Done |
| US-9: Role-based delete (ADMIN only) | Done |
| US-9.1: Angular setup (Material, Tailwind, Apollo) | Done |
| US-9.2: Login page + AuthGuard | Done |
| US-9.3: Main layout (Toolbar + Sidenav) | Done |
| US-9.4: Theme & language persistence | Done |
| US-10: Product CRUD Frontend (list + create + edit + delete) | Done |
| US-11: Unit tests coverage | In progress |
| US-12: E2E tests (Cypress / Playwright) | Planned |
| US-13: Docker image for backend | Planned |
| US-14: CI/CD pipeline | Planned |

---

## Author

**Serrioui Ferdaouss**  
Project: FireHIS v0.1.0 — Demo Stack  
Date: February 2026

---

*Built with FastAPI, Strawberry GraphQL, Angular 21, and PostgreSQL.*
