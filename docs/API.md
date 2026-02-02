# GreenCart API Reference 📚

This document summarizes the server API endpoints available in the `server/` folder. It is intended to get developers productive quickly with request formats, authentication, and expected responses.

> Quick links: route files are under `server/routes/` and controller logic under `server/controllers/`.

---

## Auth & Sessions 🔐

Base path: `/api/auth`

- POST `/send-otp` (rate-limited)
  - Body: `{ "mobile": "9876543210" }`
  - Returns: `{ success: true, message }` or `{ success: false, message }`
  - Notes: Uses `server/controllers/authController.js`. Rate limited by `otpLimiter` middleware.

- POST `/verify-otp`
  - Body: `{ "mobile": "9876543210", "otp": "123456", "name": "John", "email": "a@b.com" }`
  - Returns: `{ success: true, user }` and sets cookie `token` on success.
  - Dev mode: bypasses OTP and may return `requireDetails: true`.

- POST `/login-password`
  - Body: `{ "identifier": "email/or/mobile", "password": "secret" }`
  - Returns: `{ success: true, user }` and sets cookie `token` on success.

- POST `/register-password`
  - Body: `{ "name", "email", "mobile", "password" }`
  - Returns: `{ success: true, user }` and sets cookie `token`.

Notes: JWT cookie name is `token` and is set with httpOnly; see `server/controllers/authController.js`.

---

## User endpoints (Authenticated) 👤

Base path: `/api/user`

- GET `/is-auth` (auth required)
  - Returns: `{ success:true, user }` (checks cookie token)
  - File: `server/routes/userRoute.js` → `server/controllers/userController.js`

- GET `/logout`
  - Clears cookie and returns `{ success: true }`.

- POST `/wishlist` (auth)
  - Body: `{ productId: "<id>" }` toggles wishlist; returns `{ success, message, wishlist }`.

Authentication: use cookie authentication (send credentials).

Example (axios):

```js
// axios defaults: axios.defaults.withCredentials = true
axios.get('/api/user/is-auth')
  .then(res => console.log(res.data))
```

---

## Products 🛍️

Base path: `/api/product`

- GET `/list` (public)
  - Returns: `{ success: true, products: [...] }`
  - File: `server/routes/productRoute.js` → `server/controllers/productController.js`

- POST `/single` (public)
  - Body: `{ id: "<productId>" }`
  - Returns: `{ success: true, product }`

Admin-only endpoints (require `auth + adminOnly` middleware):
- POST `/add` (multipart/form-data)
  - Fields: `productData` (JSON string) and `images` (file[])
  - Returns: `{ success: true, message }`
- POST `/update` (multipart/form-data)
  - Fields: `productData` (JSON string) and optional `images` to add
- PATCH `/assign-category` (body `{ productId, newCategory }`)
- POST `/toggle-category` (body `{ productId, categoryName, action }` where action is `'add'|'remove'`)

Notes: Images are uploaded via Cloudinary (see `server/configs/cloudinary.js`).

---

## Cart 🧺

Base path: `/api/cart`

- POST `/update` (auth)
  - Body: `{ cartItems: [ { product: "id", quantity: 2, ... } ] }`
  - Returns: `{ success: true, message }`
- POST `/mark-cart-merged` (auth)
  - Marks guest cart as merged for a user.

---

## Addresses 🏠

Base path: `/api/address` (auth required)

- POST `/add` — body `{ address: { firstName, lastName, street, city, ... , isDefault } }` → returns new address
- GET `/get` — list addresses: `{ success: true, addresses: [] }`
- PUT `/:id` — body `{ address }` updates and returns updated object
- DELETE `/:id` — deletes an address

See `server/controllers/addressController.js` for details.

---

## Profile 🧾

Base path: `/api/profile` (auth required)

- GET `/` — get user profile `{ success: true, user }`
- PUT `/basic` — body `{ name, email }` updates profile
- POST `/mobile/send-otp` — body `{ mobile }` (sends OTP for mobile change)
- POST `/mobile/verify` — body `{ mobile, otp }` (verifies and updates mobile)

---

## Orders & Invoices 📦

Base path: `/api/order` (auth required for user endpoints)

User endpoints:
- POST `/cod` — place COD order
  - Body: `{ items: [{ product, quantity }], addressId, courier }`
  - Returns: `{ success: true, order }`
- GET `/user` — list user orders `{ success: true, orders }`
- GET `/invoice/:orderId` — returns PDF (Content-Type: `application/pdf`)
- GET `/details/:orderId` — returns order details
- POST `/cancel` — body `{ orderId }` cancels (within `cancelWindowHours` setting)

Admin endpoints (prefix `/api/admin-orders`):
- GET `/orders` — list orders
- GET `/order/:orderId` — admin view
- POST `/create` — create order on behalf of customer (admin)
- PATCH `/order/status` — update status (body `{ orderId, status, trackingId?, trackingUrl? }`)
- PATCH `/order/payment` — update payment status (body `{ orderId, status }`)
- GET `/order/invoice/:orderId` — admin PDF invoice
- GET `/order/label/:orderId` — shipping label PDF

Notes: server generates invoices (PDF) and optionally emails customer when `autoOrderNotification.email` is enabled.

---

## Payments 💳

Base path: `/api/payments`

- GET `/enabled` — public; returns enabled gateway, tax, currency symbol, maintenance flag
  - Response sample: `{ success: true, enabledGateway: 'phonepe', paymentGateways: { phonepe: true, razorpay: false }, codEnabled: true, taxPercent: 2 }`

PhonePe:
- POST `/phonepe/create` (auth) — create payment request
- POST `/phonepe/validate` (auth) — validate after redirect
- POST `/phonepe/callback` (public) — callback/notification from PhonePe

Razorpay:
- POST `/razorpay/create` (auth)
- POST `/razorpay/verify` (auth) — verify signature; body expects `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` plus order details

For details, see `server/controllers/gateways/phonepeController.js` and `server/controllers/gateways/razorpayController.js`.

---

## Coupons 🎟️

Base path: `/api/coupon`

- POST `/create` — (admin only) create coupon
- GET `/list` — (admin only)
- PUT `/:id` — update (admin only)
- DELETE `/:id` — delete (admin only)
- POST `/validate` — (auth) body `{ code, orderAmount }` — returns `{ success: true, discount }` if valid

---

## Categories & Category Groups 🏷️

Category routes:
- POST `/api/category/add` (admin, `multipart/form-data`, `image`) — add
- POST `/api/category/remove` (admin)
- GET `/api/category/list` (public)
- POST `/api/category/update` (admin)

Category groups:
- POST `/api/category-group/add` (admin)
- GET `/api/category-group/list` (public)
- POST `/api/category-group/remove` (admin)
- POST `/api/category-group/update` (admin)

---

## Couriers 🚚

Base path: `/api/courier`

- GET `/active` (public) — couriers for checkout
- GET `/list` (admin)
- POST `/add` (admin)
- POST `/delete` (admin)
- PUT `/update` (admin)

---

## Admin: Users / Dashboard / Reports / Settings ⚙️

- Admin Users: `/api/admin-users/*` — listing, block/unblock, create user, get user and addresses
- Admin Dashboard: `/api/admin/dashboard` — basic stats
- Admin Reports: `/api/admin/reports/overview` and `/api/admin/reports/export` — reports (query params: `?range=30days&status=all&payment=all`)
- Admin Settings: `/api/admin/settings` (GET / PUT) and `/api/admin/settings/test-email` (POST)
- Admin invoices: `/api/admin-invoices/` (GET) and `/:id/pdf` (GET)

---

## Errors & status codes

- Most endpoints return JSON `{ success: true|false, ... }` — some endpoints use non-200 HTTP codes for specific errors (e.g., 400/403/404/500).
- Many controller methods return `200` with `{ success: false, message }` for validation-friendly handling on the frontend. Refer to individual controller implementations for exact behavior.

---

## Authentication & Headers

- Auth is cookie-based JWT (`token` cookie). When using `fetch` or `axios`, include credentials.
  - axios: `axios.defaults.withCredentials = true` or option `{ withCredentials: true }` per request
  - fetch: `fetch('/api/user/is-auth', { credentials: 'include' })`

- Content types:
  - `application/json` for JSON endpoints
  - `multipart/form-data` for product/category uploads (images + `productData` JSON string)
  - PDF endpoints return `Content-Type: application/pdf`

---

## Useful references (files)

- Routes: `server/routes/` (e.g. `server/routes/productRoute.js`)
- Controllers: `server/controllers/` (e.g. `server/controllers/orderController.js`)
- Models: `server/models/` (see `Order.js`, `Product.js`, `User.js`)
- Payments (gateways): `server/controllers/gateways/`

---


