# GreenCart 🛒

![status](https://img.shields.io/badge/status-active-brightgreen) ![server-version](https://img.shields.io/badge/server-v1.0.0-blue) ![client-version](https://img.shields.io/badge/client-v0.0.0-blue)

> A full-stack e-commerce starter: **React + Vite** frontend and **Express + MongoDB** backend with payments, Cloudinary image uploads, WebSockets, and scheduled jobs.

---

## Table of contents

- [What the project does](#what-the-project-does) ✅
- [Why this is useful](#why-this-is-useful) 💡
- [Getting started](#getting-started) 🔧
  - [Prerequisites](#prerequisites)
  - [Quick start (development)](#quick-start-development)
  - [Build & production](#build--production)
  - [Environment variables](#environment-variables)
- [Where to get help](#where-to-get-help) 📚
- [Who maintains and how to contribute](#who-maintains-and-how-to-contribute) 🤝

---

## What the project does

**GreenCart** is an e-commerce reference app with a modern React (Vite) frontend and an Express API backend. It implements common real-world features needed for an online store:

- Product listing, categories, category groups and product details
- Shopping cart and checkout flows (Razorpay / PhonePe / Stripe integrations)
- User authentication and profiles (JWT, cookies)
- Admin dashboard (products, orders, users, reports, invoices)
- File uploads via Cloudinary, PDF invoice generation, email/SMS helpers
- WebSockets via socket.io for live events and scheduled cron jobs for cleanup tasks

---

## Why this is useful

- **Ready-to-run** for developers building e-commerce features
- **Modular** codebase with separate `client/` and `server/` directories
- **Integrations** for payment gateways, cloud uploads, and email/SMS sending
- **Admin tooling** and example pages to speed up typical back-office needs

---

## Getting started

### Prerequisites

- Node.js (recommended >= 18)
- npm or yarn
- MongoDB (local or hosted - connection via `MONGODB_URI`)
- (Optional) Cloudinary account for image uploads
- (Optional) Payment provider credentials (Razorpay / PhonePe / Stripe)

### Quick start (development)

1. Clone the repository and open the project root:

   ```bash
   git clone <repo> && cd GreenCart
   ```

2. Server (API):

   ```bash
   cd server
   npm install
   # copy .env or create one with required variables (see below)
   npm run server   # starts server with nodemon (watch)
   # or `npm start` to run once
   ```

   The API will listen on `http://localhost:4000` by default.

3. Client (frontend):

   ```bash
   cd ../client
   npm install
   npm run dev
   ```

   The dev server runs at `http://localhost:5173` by default. The server CORS configuration allows `http://localhost:5173`.

4. Try a quick request:

   ```bash
   curl http://localhost:4000/   # should return: "API is working"
   ```

### Build & production

- Build the client for production:

  ```bash
  cd client
  npm run build
  ```

- Serve the built client with any static hosting (Vercel, Netlify) and deploy the API to a Node-friendly host (Render, Railway, Heroku, self-hosted VM, or Docker). The `server/` folder contains `server.js` and cron jobs that expect a persistent Node process.

---

### Environment variables (common)

Create a `.env` file in `server/` with at minimum:

- `MONGODB_URI` (e.g., `mongodb://localhost:27017`)
- `JWT_SECRET`
- `CLIENT_URL` (e.g., `http://localhost:5173`)
- `PORT` (optional, default 4000)

Optional / feature flags (add as required):

- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_ENV`, `PHONEPE_REDIRECT_URL`, `PHONEPE_CALLBACK_URL`
- `STRIPE_*` keys
- Mailer: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM_NAME`, `MAIL_FROM_EMAIL`
- SMS provider: `SMSO2_AUTH_KEY`, `SMSO2_SENDER_ID`, `SMSO2_TEMPLATE_ID`
- Webhooks: `WEBHOOK_USER`

Tip: The code appends `/omMuruga` to `MONGODB_URI` (see `server/configs/db.js`).

---

## Where to get help 📚

- Open an issue on this repository to report bugs or request features
- Ask questions via PR comments or by contacting the project maintainer (see below)

> For API reference and developer docs, keep the server routes under `/server/routes/` — add detailed API documentation in a separate docs directory or wiki for maintainability.

---

## Who maintains and how to contribute 🤝

**Maintainers**

- Project owner/maintainer: (Please add maintainer name and contact in this section)

How to contribute:

1. Fork the repository and create a topic branch
2. Add tests or verify behaviour manually on `localhost`
3. Open a pull request describing your change
4. Follow a consistent commit/message style

Please add a `CONTRIBUTING.md` file for project-specific contribution rules if you want to formalize the workflow.

---

## Useful commands & tips 🔧

- Start server (dev): `cd server && npm run server`
- Start client (dev): `cd client && npm run dev`
- Build client: `cd client && npm run build`
- Lint client: `cd client && npm run lint`
- Start server (prod): `cd server && npm start`

---

If you'd like, I can also add a `docs/CONTRIBUTING.md` template and a `.env.example` file listing recommended variables. ✅

---

_Last updated: Jan 31, 2026_
