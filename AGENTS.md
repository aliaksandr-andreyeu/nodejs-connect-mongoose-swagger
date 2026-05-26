# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a Node.js REST API backend built with Connect, Mongoose (MongoDB ODM), and Swagger UI. Single service, no monorepo.

### Services

| Service | How to start | Port |
|---------|-------------|------|
| MongoDB | `mongod --dbpath /data/db --fork --logpath /tmp/mongodb/mongod.log --bind_ip 127.0.0.1` | 27017 |
| Node.js API (dev) | `npm run start:dev` | 3000 |

### Key commands

- **Lint:** `npm run lint:js` (ESLint only) or `npm run lint` (Prettier + ESLint)
- **Tests:** `npm test` (Jest — no test files currently exist; exits with code 1 unless `--passWithNoTests`)
- **Dev server:** `npm run start:dev` (uses nodemon + babel-node, auto-reloads on file changes)
- **Build:** `npm run build:prod`

### Non-obvious gotchas

- MongoDB must be running before starting the dev server — the app calls `process.exit(1)` if it cannot connect.
- The dev database user must exist before the app can connect. Create it with:
  ```
  mongosh --eval "db = db.getSiblingDB('nodejs_api_dev'); db.createUser({user:'devuser',pwd:'devpassword',roles:[{role:'readWrite',db:'nodejs_api_dev'}]})"
  ```
- Environment variables are in `src/environments/.env.development` (not root `.env`). Required values: `DB_NAME`, `DB_USER`, `DB_PSW`, `ACCESS_TOKEN_KEY`, `REFRESH_TOKEN_KEY`.
- The `postinstall` script in `package.json` runs `husky install` which sets up git hooks. This is fine in a git repo but may warn if `.git` is not present.
- The app uses Node.js clustering — expect multiple "Connect server started" messages (one per CPU core worker).
- Swagger UI is served at the root path `/` (not `/docs` or `/swagger`).
- API uses `username` and `password` fields for auth (not `email`/`first_name`/etc).
