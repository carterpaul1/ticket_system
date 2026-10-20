# PulseDesk

PulseDesk is a local-first call center ticketing workspace built to demonstrate a production-minded support operations workflow: a searchable multi-queue inbox, transparent priority triage, ticket lifecycle updates, service-level visibility, and a MongoDB-backed API.

## Product highlights

- **Agent workflow:** Overview metrics, queue filters, ticket search, customer context, status updates, and create-ticket dialog.
- **Transparent triage:** Specific issue phrases map to priority and category suggestions. The rule is deterministic and runs in both browser demo mode and API mode.
- **Accessible interface:** Semantic landmarks and table, labeled controls, a skip link, visible keyboard focus, live feedback, native dialog behavior, and reduced-motion support.
- **Local-first architecture:** Vite and React frontend, Express API, Mongoose models, and MongoDB 7 in Docker Compose. Sample tickets keep the UI interactive while MongoDB is offline.
- **Review-ready GitHub workflow:** `main` + prefixed feature branches, pull request and bug templates, and CI for lint and production builds. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Stack

React 19, Vite 8, Bootstrap 5, Node.js 22, Express 5, Mongoose 8, and MongoDB 7.

## Run locally

Requirements: Node.js 22+, npm, and Docker Desktop (or a local MongoDB server).

```bash
npm ci
Copy-Item .env.example .env
docker compose up -d
npm run seed
npm run dev:full
```

Open `http://localhost:5173`. Vite proxies `/api` calls to Express on port 4000. If you do not have Docker available, start Vite alone with `npm run dev`; the app uses in-memory sample tickets. The API starts with `npm run dev:server`.

## API

| Method  | Route              | Purpose                                                                    |
| ------- | ------------------ | -------------------------------------------------------------------------- |
| `GET`   | `/api/health`      | API and MongoDB connection status                                          |
| `GET`   | `/api/tickets`     | List tickets; optional `status`, `priority`, and `search` query parameters |
| `POST`  | `/api/tickets`     | Validate and triage a customer issue, then create a ticket                 |
| `PATCH` | `/api/tickets/:id` | Update a ticket status                                                     |

The API validates required customer data and status values, limits JSON request size, and returns clear errors when the local database is unavailable.

## Triage rules

The demo triage rules are intentionally easy to inspect in `src/data/demoTickets.js` and `server/src/triage.js`:

- Security, account lockout/access, fraud, data-loss, or outage language suggests **Urgent**.
- Duplicate charges, payment failures, app crashes, and common service failures suggest **High**.
- Keywords such as “invoice”, “sign in”, “tracking”, or “app” suggest a support category.
- Agents can override the suggested category before creating the ticket.

These phrase rules are a portfolio demo, not a trained classifier or a substitute for a support team’s SLA policy. Keep both rule implementations aligned when changing them.

## Quality and GitHub workflow

```bash
npm run lint
npm run format:check
npm run build
```

Use a branch like `feature/ticket-triage`, `fix/keyboard-focus`, or `docs/local-setup`, then open a pull request to `main`. GitHub Actions checks lint and production build on every pull request. Once this project is connected to a GitHub repository, apply the `main` protection settings documented in `CONTRIBUTING.md` and require the CI job before merging.
