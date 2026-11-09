# Task 4: Stateless JWT Authentication & Threat Mitigation

Express + TypeScript API with bcrypt password hashing, JWT login, route protection,
role-based access control (USER vs ADMIN), Helmet, strict CORS and login rate limiting.

## Structure

```
src/
  server.ts                    # seeds the admin account, starts the server
  app.ts                       # helmet, cors, json parsing, routes, error handler
  config.ts                    # reads environment variables (JWT secret, origins...)
  routes/                      # URL -> middleware -> controller
  controllers/auth.controller.ts   # validates input, sends responses
  services/auth.service.ts         # bcrypt hashing, JWT signing and verifying
  data/user.store.ts               # in-memory "database" (hashes only)
  middleware/
    authenticateToken.ts       # AuthN: valid Bearer token? else 401
    authorizeRole.ts           # AuthZ: allowed role? else 403
    rateLimiter.ts             # bonus: 5 login requests / 15 min
    cors.ts                    # bonus: strict origin allow-list
  types/
```

## AuthN vs AuthZ

- **Authentication (401)**: proving who you are (login, then a valid token).
- **Authorization (403)**: deciding what you may do (your role: USER or ADMIN).

## Run

```bash
npm install
npm run dev
```

Optional environment variables (see `.env.example`). Without them the server uses clearly
marked development defaults, which are refused when `NODE_ENV=production`:

```bash
export JWT_SECRET="a-long-random-string-of-at-least-32-characters"
export ADMIN_PASSWORD="Your#Admin1Password"
export ALLOWED_ORIGINS="http://localhost:5173"
```

## Endpoints

| Method | Path                 | Access          |
|--------|----------------------|-----------------|
| GET    | /api/health          | public          |
| POST   | /api/auth/register   | public (creates a USER) |
| POST   | /api/auth/login      | public, rate limited (5 / 15 min) |
| GET    | /api/profile         | any logged-in user |
| GET    | /api/admin/users     | ADMIN only      |

A seeded admin exists: username `admin`, password from `ADMIN_PASSWORD` (default `Admin#12345` in development).

## Try it (do the rate-limit test LAST)

```bash
# 1. Register a normal user
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d '{"username":"sara","password":"MyPassword123"}'

# 2. Login (copy the "token" value from the response)
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"sara","password":"MyPassword123"}'

TOKEN="paste-the-token-here"

# 3. No token -> 401
curl http://localhost:3000/api/profile

# 4. With token -> 200
curl http://localhost:3000/api/profile -H "Authorization: Bearer $TOKEN"

# 5. USER token on an admin route -> 403 Forbidden
curl http://localhost:3000/api/admin/users -H "Authorization: Bearer $TOKEN"

# 6. Login as admin, then use the admin token -> 200
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin#12345"}'
ADMIN_TOKEN="paste-the-admin-token-here"
curl http://localhost:3000/api/admin/users -H "Authorization: Bearer $ADMIN_TOKEN"

# 7. CORS: a disallowed origin is rejected with 403
curl http://localhost:3000/api/health -H "Origin: http://evil.example"

# 8. Rate limit: send a login 6 times. The 6th answer is 429 Too Many Requests
for i in 1 2 3 4 5 6; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" -d '{"username":"sara","password":"wrong"}'
done
```

The login counter lives in memory, so stopping and restarting the server resets it.
Steps 1-2 and 6 count towards the 5-login limit, so run step 8 last.

## Security measures

- Passwords are hashed with bcrypt (cost 12); plaintext is never stored or logged.
- Login returns the same error for an unknown user and a wrong password, and takes similar time for both.
- JWTs are signed with HS256, expire after 15 minutes, and are verified with the algorithm pinned.
- Tokens contain identity claims only (user id, username, role), never the password hash.
- New accounts are always `USER`; only the seeded account is `ADMIN`.
- Helmet sets secure headers; the JSON body is limited to 10 KB.
- Strict CORS allow-list and a 5-per-15-minutes login limiter.
