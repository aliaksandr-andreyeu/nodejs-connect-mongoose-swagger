// Runs once on first container start (empty ./data/mongodb).
// Credentials must match .env.example → .env.development
db = db.getSiblingDB('app');

db.createUser({
  user: 'app',
  pwd: 'appsecret',
  roles: [
    {
      role: 'readWrite',
      db: 'app'
    }
  ]
});
