# Node.js REST API example

Node.js REST API boilerplate with Connect, Redis, Mongoose, Swagger

> This is the example of the Node.js REST API backend for related [React.js Web](https://github.com/aliaksandr-andreyeu/reactjs-rtk-dashboard) & [React Native Mobile](https://github.com/aliaksandr-andreyeu/react-native-mobx-firebase) applications.

## Configuration

### MongoDB & Redis with Docker Compose (recommended for local dev)

Persistent data lives under `./data` on the host:

| Service | Host path                          | Container path | Purpose                                          |
| ------- | ---------------------------------- | -------------- | ------------------------------------------------ |
| MongoDB | [`./data/mongodb`](./data/mongodb) | `/data/db`     | Database files                                   |
| Redis   | [`./data/redis`](./data/redis)     | `/data`        | RDB + AOF (rate-limit counters survive restarts) |

```bash
# Copy env template and set REDIS_PASSWORD (used by the app and Redis container)
cp .env.example .env.development

# Start MongoDB + Redis (reads REDIS_PASSWORD from .env.development)
npm run docker:up
```

Stop services: `npm run docker:down`. Logs: `npm run docker:logs`.

On first MongoDB start, an `app` user and `app` database are created (see [`docker/mongo-init`](./docker/mongo-init)). To re-run initialization, remove the data directory: `rm -rf data/mongodb/*` (keep `.gitkeep`).

To reset Redis cache (e.g. clear rate-limit state): `rm -rf data/redis/*` (keep `.gitkeep`), then `npm run docker:up`.

### Set up a MongoDB database manually

Alternatively, use a local MongoDB install or [MongoDB Atlas](https://mongodb.com/atlas).

- [MongoDB Documentation](https://docs.mongodb.com/)

### Set up environment variables:

Set variables in `.env.development` (see [`.env.example`](./.env.example)):

- `DB_HOST` - Database host name
- `DB_PORT` - Database port number
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PSW` - Database username password
- `CORS_ORIGINS` - Comma-separated allowed browser origins for credentialed requests (required for cookie-based refresh from a web app)
- `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` - Redis for auth rate limiting (`REDIS_PASSWORD` is required; must match the value passed to the Redis container via `npm run docker:up`)
- `RATE_LIMIT_AUTH_POINTS` / `RATE_LIMIT_AUTH_DURATION_SEC` - Max POSTs per IP per window on `/signin`, `/signup`, `/reset-password`

### Project set up:

```bash
npm install

npm run start:dev
```

## Requirements

- `Node.js` >= v18
- `MongoDB` >= v3.6
- TypeScript sources in `src/`, production build in `build/`

### Scripts

- `npm run start:dev` - single process, no cluster (easier debugging)
- `npm run start:prod` - cluster mode in production (`cpus - 1` workers, min 1)
- `npm run build:prod` - compile TypeScript and copy static Swagger assets
- `npm run typecheck` - type-check without emit
- `npm run openapi:generate` - regenerate `src/public/swagger.json` from Zod schemas (`@asteasolutions/zod-to-openapi`)

OpenAPI and request validation share the same Zod schemas in `src/validation/`. Path definitions live in `src/openapi/paths/`.

Git hooks: after `npm install`, Husky runs via the `prepare` script. The pre-commit hook is in [`.husky/pre-commit`](./.husky/pre-commit).

## Licensing

Please see our [LICENSE](https://github.com/aliaksandr-andreyeu/nodejs-connect-mongoose-swagger/blob/main/LICENSE) for copyright and license information.
