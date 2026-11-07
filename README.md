# MiracleShine-Cleaning-Service


## MiracleShine Cleaning Platform


## Description


## Technologies


## Architecture


## Getting Started

### Local development with Docker

Docker Compose starts PostgreSQL, the NestJS API, and the Vite frontend for local development. No `.env` file is required for the default setup.

```bash
docker compose up --build
```

Open the frontend at <http://localhost:5173> and the API at <http://localhost:3000>. Source files are mounted into the app containers, so frontend and backend changes are picked up while developing. The API applies checked-in Prisma migrations when it starts.

Seed the local database manually when you want the demo records:

```bash
docker compose exec backend npx prisma db seed
```

The seed script replaces application records, so running it again resets that data. To stop the development environment, run `docker compose down`. To also remove the local database and dependency volumes, run `docker compose down --volumes`.

Compose provides development-only database credentials and a development JWT secret by default. Override them through a root `.env` file if needed; do not reuse these defaults outside local development.

## Features


## Roadmap


Copyright (c) 2026 MiracleShine Cleaning Service. All rights reserved.  This source code is proprietary and confidential. Unauthorized copying, modification, distribution, or use is prohibited.
