# Demo Project – FastAPI (GraphQL) + Angular

Application full-stack développée dans le cadre du projet FireHIS v0.1.0.

## Architecture

- Backend : FastAPI + Strawberry GraphQL + PostgreSQL + JWT + bcrypt
- Frontend : Angular (standalone) + Angular Material + Tailwind + Apollo GraphQL

---

## Structure du projet

- backend/ : API FastAPI, modèles, JWT, GraphQL
- frontend/ : Application Angular (Auth, Layout, GraphQL)

---

# Prérequis

- Git
- Docker + Docker Compose
- Python 3.11+
- Node.js 18+
- npm

---

# Lancer le projet

## 1️⃣ Base de données (Postgres)

```bash
docker compose up -d
```

Vérifier :

```bash
docker ps
```

---

## 2️⃣ Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend accessible sur :

http://localhost:8000

GraphQL Playground :

http://localhost:8000/graphql

Health check :

GET /health → { "status": "UP" }

---

## 3️⃣ Frontend

```bash
cd frontend
npm install
ng serve
```

Frontend accessible sur :

http://localhost:4200

---

# Fonctionnalités Implémentées

## Backend

- FastAPI + endpoint /health
- Connexion PostgreSQL via SQLAlchemy
- Modèles User & Product
- Hash password avec bcrypt
- JWT sécurisé avec expiration
- GraphQL endpoint
- Mutations register / login
- Query me()
- CRUD complet Products
- Suppression réservée au rôle ADMIN
- Gestion erreurs Unauthorized / Forbidden / Validation

---

## Frontend (implémenté jusqu’à US-9.1)

- Angular strict mode
- Tailwind configuré
- Angular Material configuré
- Apollo Angular connecté au backend
- Attachement automatique du JWT
- Login (Reactive Forms)
- Logout sécurisé
- AuthGuard
- Layout principal (Toolbar + Sidenav)
- Menu : Products / Theme / Language / Logout
- Persistance thème & langue

---

# Prochaine étape

- US-10 : Product CRUD Frontend (table + create + edit + delete)

---

# Definition of Done

Une fonctionnalité est DONE si :

- Feature implémentée
- UI fonctionnelle
- Validations actives
- Erreurs gérées
- Aucun console error
- Code poussé et documenté
