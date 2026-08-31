# Frontend API Integration Guide

This document is the frontend contract for the e-commerce REST API implemented in this repository. It covers every route, request payload, response shape, authentication requirement, common error, and browser integration detail.

## 1. Connection details

Local API base URL:

```text
http://localhost:3000/api
```

Recommended Vite environment variable:

```env
VITE_API_URL=http://localhost:3000/api
```

Use it without a trailing slash:

```js
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
```

The interactive Swagger UI is available at:

```text
http://localhost:3000/api/docs
```

The OpenAPI JSON document is available at:

```text
http://localhost:3000/api/docs.json
```

## 2. Important response conventions

Most successful responses use a `data` envelope:

```json
{
  "data": {}
}
```

List endpoints return an array inside `data`:

```json
{
  "data": []
}
```

The health endpoint is the exception and returns `{ "status": "ok" }` directly.

Successful delete operations return HTTP `204 No Content` with no JSON body. Do not call `response.json()` for a `204` response.

All errors use this envelope:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

Validation errors can also contain `details`:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Request validation failed",
    "details": [
      {
        "field": "body.email",
        "message": "Invalid email address"
      }
    ]
  }
}
```

### IDs and monetary values

Database IDs are PostgreSQL `BIGINT` values and are serialized as strings:

```json
{
  "id": "12",
  "userId": "3",
  "productId": "8"
}
```

Keep IDs as strings in frontend state and route parameters. Do not parse them as JavaScript numbers.

Prices and totals are returned as two-decimal strings to avoid floating-point ambiguity:

```json
{
  "price": "79.99",
  "lineTotal": "159.98",
  "total": "159.98"
}
```

For display, they can be formatted with `Intl.NumberFormat`. For frontend calculations, convert them to integer cents instead of adding floating-point numbers.

## 3. Reusable fetch client

The following client supports JSON bodies, Bearer authentication, multipart uploads, `204` responses, and the API error format:

```js
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest(
  path,
  { token, body, headers: customHeaders, ...options } = {},
) {
  const isFormData = body instanceof FormData;
  const headers = new Headers(customHeaders);

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body !== undefined && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: body === undefined || isFormData ? body : JSON.stringify(body),
  });

  if (response.status === 204) return null;

  const payload = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.error?.code ?? 'UNKNOWN_ERROR',
      payload.error?.message ?? 'Request failed',
      payload.error?.details ?? [],
    );
  }

  return payload.data ?? payload;
}
```

Example:

```js
const products = await apiRequest('/products', { method: 'GET' });
```

Do not set `credentials: 'include'` or Axios `withCredentials: true`. This API uses a Bearer JWT, not a cookie session.

## 4. Authentication

Registration and login return a JWT in `data.token`. Protected requests must send it as:

```http
Authorization: Bearer <token>
```

Example:

```js
const account = await apiRequest('/users/me', {
  method: 'GET',
  token,
});
```

The token expires according to the backend `JWT_EXPIRES_IN` setting. There is currently no refresh-token endpoint. When a protected request returns `401 UNAUTHORIZED`, clear the saved authentication state and send the user to login.

Storing the token only in application memory is safer against token theft through injected scripts, but it logs users out after a page refresh. `sessionStorage` or `localStorage` adds persistence but also increases exposure to XSS. Choose deliberately based on the frontend requirements.

## 5. Shared data shapes

These TypeScript definitions describe the current JSON responses:

```ts
export type Id = string;
export type Money = string;

export interface User {
  id: Id;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface Product {
  id: Id;
  name: string;
  description: string | null;
  price: Money;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: Id;
  name: string;
  price: Money;
  stock: number;
  quantity: number;
  lineTotal: Money;
}

export interface Cart {
  id: Id | null;
  userId: Id;
  items: CartItem[];
  total: Money;
}

export type OrderStatus = 'placed' | 'cancelled';

export interface OrderSummary {
  id: Id;
  userId: Id;
  status: OrderStatus;
  total: Money;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: Id;
  productName: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
}

export interface OrderDetail {
  id: Id;
  userId: Id;
  status: OrderStatus;
  total: Money;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
```

## 6. Endpoint summary

| Method | Endpoint | Bearer token | Request body | Success |
|---|---|---:|---|---:|
| `GET` | `/health` | No | None | `200` |
| `GET` | `/docs` | No | None | `200` |
| `GET` | `/docs.json` | No | None | `200` |
| `POST` | `/auth/register` | No | JSON | `201` |
| `POST` | `/auth/login` | No | JSON | `200` |
| `GET` | `/products` | No | None | `200` |
| `GET` | `/products/:id` | No | None | `200` |
| `POST` | `/products` | No* | JSON | `201` |
| `PATCH` | `/products/:id` | No* | JSON | `200` |
| `POST` | `/products/:id/image` | No* | Multipart | `200` |
| `DELETE` | `/products/:id` | No* | None | `204` |
| `GET` | `/users/me` | Yes | None | `200` |
| `PATCH` | `/users/me` | Yes | JSON | `200` |
| `DELETE` | `/users/me` | Yes | None | `204` |
| `GET` | `/cart` | Yes | None | `200` |
| `POST` | `/cart/items` | Yes | JSON | `201` |
| `PATCH` | `/cart/items/:productId` | Yes | JSON | `200` |
| `DELETE` | `/cart/items/:productId` | Yes | None | `204` |
| `POST` | `/checkout` | Yes | None | `201` |
| `GET` | `/orders` | Yes | None | `200` |
| `GET` | `/orders/:id` | Yes | None | `200` |

`*` Product mutation endpoints are not authenticated in the current MVP because admin roles are deferred. Do not expose these routes publicly in a production storefront until backend admin authorization is added.

## 7. System API

### Health check

```http
GET /api/health
```

Authentication: none.

Success — `200 OK`:

```json
{
  "status": "ok"
}
```

Frontend use: deployment monitoring or a simple API connectivity check. It does not query PostgreSQL on every request; database connectivity is checked when the server starts.

### API documentation

```http
GET /api/docs
GET /api/docs.json
```

Authentication: none.

`/api/docs` serves the interactive Swagger UI as HTML. `/api/docs.json` returns the OpenAPI specification as JSON. These endpoints are development references and are not normal storefront data sources; use the documented application endpoints for runtime frontend requests.

## 8. Authentication API

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

Payload:

```json
{
  "username": "alex",
  "email": "alex@example.com",
  "password": "correct-horse"
}
```

Validation:

- `username`: trimmed string, 3–50 characters.
- `email`: valid email, maximum 255 characters; normalized to lowercase.
- `password`: 8–128 characters.
- Extra fields are rejected.

Success — `201 Created`:

```json
{
  "data": {
    "user": {
      "id": "4",
      "username": "alex",
      "email": "alex@example.com",
      "createdAt": "2026-09-02T12:00:00.000Z",
      "updatedAt": "2026-09-02T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Errors:

- `400 INVALID_INPUT` — validation failed.
- `409 USER_EXISTS` — email or username is already used.

Frontend example:

```js
const auth = await apiRequest('/auth/register', {
  method: 'POST',
  body: { username, email, password },
});
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Payload:

```json
{
  "email": "alex@example.com",
  "password": "correct-horse"
}
```

Success — `200 OK`:

```json
{
  "data": {
    "user": {
      "id": "4",
      "username": "alex",
      "email": "alex@example.com",
      "createdAt": "2026-09-02T12:00:00.000Z",
      "updatedAt": "2026-09-02T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Errors:

- `400 INVALID_INPUT` — invalid or missing fields.
- `401 INVALID_CREDENTIALS` — email or password is incorrect.

The login response intentionally does not reveal whether an email exists.

Frontend example:

```js
const auth = await apiRequest('/auth/login', {
  method: 'POST',
  body: { email, password },
});
```

## 9. Product API

### Product response example

```json
{
  "id": "1",
  "name": "Wireless Headphones",
  "description": "Over-ear Bluetooth headphones with active noise cancellation.",
  "price": "79.99",
  "stock": 24,
  "imageUrl": "https://example.public.blob.vercel-storage.com/products/1/image.webp",
  "isActive": true,
  "createdAt": "2026-09-02T10:00:00.000Z",
  "updatedAt": "2026-09-02T10:00:00.000Z"
}
```

`imageUrl` can be `null` until an image or seed placeholder has been assigned.

### List products

```http
GET /api/products
```

Authentication: none. Query parameters: none. Pagination and filtering are not implemented yet.

Success — `200 OK`:

```json
{
  "data": [
    {
      "id": "1",
      "name": "Wireless Headphones",
      "description": "Over-ear Bluetooth headphones with active noise cancellation.",
      "price": "79.99",
      "stock": 24,
      "imageUrl": "https://placehold.co/1200x900/111827/FFFFFF.webp?text=Wireless+Headphones",
      "isActive": true,
      "createdAt": "2026-09-02T10:00:00.000Z",
      "updatedAt": "2026-09-02T10:00:00.000Z"
    }
  ]
}
```

The current endpoint returns active and inactive products. The frontend must check `isActive` when deciding whether a product is purchasable.

### Get one product

```http
GET /api/products/:id
```

Example:

```http
GET /api/products/1
```

Success — `200 OK`:

```json
{
  "data": {
    "id": "1",
    "name": "Wireless Headphones",
    "description": "Over-ear Bluetooth headphones with active noise cancellation.",
    "price": "79.99",
    "stock": 24,
    "imageUrl": "https://placehold.co/1200x900/111827/FFFFFF.webp?text=Wireless+Headphones",
    "isActive": true,
    "createdAt": "2026-09-02T10:00:00.000Z",
    "updatedAt": "2026-09-02T10:00:00.000Z"
  }
}
```

Errors:

- `400 INVALID_INPUT` — ID is not a positive integer string.
- `404 PRODUCT_NOT_FOUND` — product does not exist.

### Create product

```http
POST /api/products
Content-Type: application/json
```

Payload:

```json
{
  "name": "USB-C Hub",
  "description": "Seven-port aluminium USB-C hub.",
  "price": 39.95,
  "stock": 20
}
```

Validation:

- `name`: required, trimmed, 1–150 characters.
- `description`: optional string up to 5,000 characters, or `null`.
- `price`: required number, at least `0`, with no more than two decimal places.
- `stock`: required non-negative integer.
- `imageUrl` and `isActive` cannot be supplied here.
- Extra fields are rejected.

Success — `201 Created`:

```json
{
  "data": {
    "id": "9",
    "name": "USB-C Hub",
    "description": "Seven-port aluminium USB-C hub.",
    "price": "39.95",
    "stock": 20,
    "imageUrl": null,
    "isActive": true,
    "createdAt": "2026-09-02T12:15:00.000Z",
    "updatedAt": "2026-09-02T12:15:00.000Z"
  }
}
```

Errors:

- `400 INVALID_INPUT` — payload validation failed.

Create the product first, then call its image endpoint with the returned product ID.

### Update product

```http
PATCH /api/products/:id
Content-Type: application/json
```

Send one or more fields:

```json
{
  "name": "USB-C Hub Pro",
  "description": "Updated description.",
  "price": 44.95,
  "stock": 18,
  "isActive": true
}
```

To remove a description:

```json
{
  "description": null
}
```

Success — `200 OK`: the full updated `Product` object inside `{ "data": ... }`.

Errors:

- `400 INVALID_INPUT` — invalid ID, empty patch, unsupported field, or invalid value.
- `404 PRODUCT_NOT_FOUND` — product does not exist.

`imageUrl` cannot be patched directly. Use the image-upload endpoint.

### Upload or replace product image

```http
POST /api/products/:id/image
Content-Type: multipart/form-data
```

Multipart field:

| Field | Type | Required | Rules |
|---|---|---:|---|
| `image` | File | Yes | JPEG, PNG, or WebP; maximum 4 MB |

Browser example:

```js
const formData = new FormData();
formData.append('image', selectedFile);

const product = await apiRequest(`/products/${productId}/image`, {
  method: 'POST',
  body: formData,
});
```

Do not manually set the multipart `Content-Type` header. The browser must include the generated boundary.

Success — `200 OK`: the full product with the new Vercel Blob URL:

```json
{
  "data": {
    "id": "9",
    "name": "USB-C Hub",
    "description": "Seven-port aluminium USB-C hub.",
    "price": "39.95",
    "stock": 20,
    "imageUrl": "https://example.public.blob.vercel-storage.com/products/9/image.webp",
    "isActive": true,
    "createdAt": "2026-09-02T12:15:00.000Z",
    "updatedAt": "2026-09-02T12:20:00.000Z"
  }
}
```

Errors:

- `400 IMAGE_REQUIRED` — `image` field is missing.
- `400 INVALID_IMAGE_UPLOAD` — invalid multipart fields or too many files.
- `404 PRODUCT_NOT_FOUND` — product does not exist.
- `413 IMAGE_TOO_LARGE` — image exceeds 4 MB.
- `415 INVALID_IMAGE_TYPE` — unsupported MIME type or file signature mismatch.
- `502 IMAGE_UPLOAD_FAILED` — Vercel Blob rejected or failed the upload.
- `503 IMAGE_STORAGE_NOT_CONFIGURED` — backend Blob token is missing.

### Delete product

```http
DELETE /api/products/:id
```

Success — `204 No Content`. The associated Vercel Blob is deleted on a best-effort basis.

Errors:

- `400 INVALID_INPUT` — invalid ID.
- `404 PRODUCT_NOT_FOUND` — product does not exist.
- `409 CONFLICT` — product is referenced by an order and cannot be deleted.

## 10. User account API

All user-account endpoints require the Bearer token.

### Get current user

```http
GET /api/users/me
Authorization: Bearer <token>
```

Success — `200 OK`:

```json
{
  "data": {
    "id": "4",
    "username": "alex",
    "email": "alex@example.com",
    "createdAt": "2026-09-02T12:00:00.000Z",
    "updatedAt": "2026-09-02T12:00:00.000Z"
  }
}
```

Errors:

- `401 UNAUTHORIZED` — token is missing, invalid, or expired.
- `404 USER_NOT_FOUND` — token user no longer exists.

This endpoint is suitable for restoring the authenticated user when the frontend starts with a saved token.

### Update current user

```http
PATCH /api/users/me
Authorization: Bearer <token>
Content-Type: application/json
```

Send one or more fields:

```json
{
  "username": "alexander",
  "email": "alexander@example.com",
  "password": "new-secure-password"
}
```

Success — `200 OK`: the full safe `User` object. Password hashes are never returned.

Errors:

- `400 INVALID_INPUT` — invalid value, empty patch, or extra field.
- `401 UNAUTHORIZED` — token is missing, invalid, or expired.
- `404 USER_NOT_FOUND` — account no longer exists.
- `409 USER_EXISTS` — username or email is already used.

### Delete current user

```http
DELETE /api/users/me
Authorization: Bearer <token>
```

Success — `204 No Content`.

The account, cart, cart items, orders, and order items owned by the user are deleted through database cascade rules. After success, clear all frontend authentication and customer state.

Errors:

- `401 UNAUTHORIZED` — token is missing, invalid, or expired.
- `404 USER_NOT_FOUND` — account no longer exists.

## 11. Cart API

All cart endpoints require the Bearer token. The authenticated token determines cart ownership; the frontend must never send a `userId` in cart payloads.

### Cart response example

```json
{
  "id": "4",
  "userId": "4",
  "items": [
    {
      "productId": "1",
      "name": "Wireless Headphones",
      "price": "79.99",
      "stock": 24,
      "quantity": 2,
      "lineTotal": "159.98"
    }
  ],
  "total": "159.98"
}
```

Cart items do not currently include `imageUrl`. If the cart UI needs product images, retain product catalog data in frontend state or fetch the corresponding product.

### Get current cart

```http
GET /api/cart
Authorization: Bearer <token>
```

Success — `200 OK`:

```json
{
  "data": {
    "id": "4",
    "userId": "4",
    "items": [],
    "total": "0.00"
  }
}
```

The backend creates the user cart if it does not already exist.

Errors:

- `401 UNAUTHORIZED` — token is missing, invalid, or expired.

### Add item to cart

```http
POST /api/cart/items
Authorization: Bearer <token>
Content-Type: application/json
```

Payload:

```json
{
  "productId": "1",
  "quantity": 2
}
```

`productId` can be sent as a positive integer string or number. Keeping it as a string is recommended. `quantity` must be a positive integer.

If the item is already in the cart, this endpoint adds the supplied quantity to the existing quantity.

Success — `201 Created`: the complete updated `Cart` object inside `{ "data": ... }`.

Errors:

- `400 INVALID_INPUT` — invalid product ID or quantity.
- `401 UNAUTHORIZED` — token is missing, invalid, or expired.
- `404 PRODUCT_NOT_FOUND` — product does not exist or is inactive.
- `409 INSUFFICIENT_STOCK` — resulting cart quantity exceeds current stock.

### Set cart-item quantity

```http
PATCH /api/cart/items/:productId
Authorization: Bearer <token>
Content-Type: application/json
```

Payload:

```json
{
  "quantity": 3
}
```

This sets the absolute quantity; it does not add to the existing quantity.

Success — `200 OK`: the complete updated `Cart` object inside `{ "data": ... }`.

Errors:

- `400 INVALID_INPUT` — invalid product ID or quantity.
- `401 UNAUTHORIZED` — token is missing, invalid, or expired.
- `404 CART_ITEM_NOT_FOUND` — item is not currently in the cart.
- `404 PRODUCT_NOT_FOUND` — product no longer exists or is inactive.
- `409 INSUFFICIENT_STOCK` — requested quantity exceeds current stock.

To make an item quantity zero, call the delete endpoint instead.

### Remove cart item

```http
DELETE /api/cart/items/:productId
Authorization: Bearer <token>
```

Success — `204 No Content`.

Errors:

- `400 INVALID_INPUT` — invalid product ID.
- `401 UNAUTHORIZED` — token is missing, invalid, or expired.
- `404 CART_ITEM_NOT_FOUND` — item is not currently in the cart.

Refetch the cart or optimistically remove the item after a successful `204`.

## 12. Checkout API

### Checkout current cart

```http
POST /api/checkout
Authorization: Bearer <token>
```

Request body: none.

The backend transaction creates the order, snapshots product names and prices, decrements inventory, and clears the cart atomically.

Success — `201 Created`:

```json
{
  "data": {
    "id": "15",
    "userId": "4",
    "status": "placed",
    "total": "159.98",
    "createdAt": "2026-09-02T13:00:00.000Z",
    "updatedAt": "2026-09-02T13:00:00.000Z",
    "items": [
      {
        "productId": "1",
        "productName": "Wireless Headphones",
        "unitPrice": "79.99",
        "quantity": 2,
        "lineTotal": "159.98"
      }
    ]
  }
}
```

Errors:

- `401 UNAUTHORIZED` — token is missing, invalid, or expired.
- `404 CART_NOT_FOUND` — user cart does not exist.
- `409 CART_EMPTY` — there are no items to purchase.
- `409 INSUFFICIENT_STOCK` — inventory changed or a product became inactive.

After success, set the frontend cart to empty, invalidate/refetch product inventory, and navigate using the returned order ID. Do not create a second frontend order from the same response.

## 13. Orders API

Order ownership is enforced by the Bearer token. Requesting another customer’s order returns `404 ORDER_NOT_FOUND` rather than revealing that it exists.

### List current user orders

```http
GET /api/orders
Authorization: Bearer <token>
```

Success — `200 OK`:

```json
{
  "data": [
    {
      "id": "15",
      "userId": "4",
      "status": "placed",
      "total": "159.98",
      "createdAt": "2026-09-02T13:00:00.000Z",
      "updatedAt": "2026-09-02T13:00:00.000Z",
      "itemCount": 1
    }
  ]
}
```

The newest orders are returned first. Pagination is not implemented yet. List items contain `itemCount`, not an `items` array.

Errors:

- `401 UNAUTHORIZED` — token is missing, invalid, or expired.

### Get order detail

```http
GET /api/orders/:id
Authorization: Bearer <token>
```

Success — `200 OK`:

```json
{
  "data": {
    "id": "15",
    "userId": "4",
    "status": "placed",
    "total": "159.98",
    "createdAt": "2026-09-02T13:00:00.000Z",
    "updatedAt": "2026-09-02T13:00:00.000Z",
    "items": [
      {
        "productId": "1",
        "productName": "Wireless Headphones",
        "unitPrice": "79.99",
        "quantity": 2,
        "lineTotal": "159.98"
      }
    ]
  }
}
```

Errors:

- `400 INVALID_INPUT` — invalid order ID.
- `401 UNAUTHORIZED` — token is missing, invalid, or expired.
- `404 ORDER_NOT_FOUND` — order does not exist or belongs to another user.

Order-item names and prices are historical snapshots. Do not replace them with current catalog values in the order-history UI.

## 14. Error-handling recommendations

Use stable `error.code` values for application decisions and `error.message` for display or fallback messaging.

| HTTP | Common code | Recommended frontend action |
|---:|---|---|
| `400` | `INVALID_INPUT` | Show field errors from `details` |
| `400` | `INVALID_JSON` | Report malformed request; usually a frontend bug |
| `401` | `UNAUTHORIZED` | Clear invalid token and redirect to login |
| `401` | `INVALID_CREDENTIALS` | Show login error without revealing which field failed |
| `404` | `PRODUCT_NOT_FOUND` | Show not-found state or refresh catalog |
| `404` | `CART_ITEM_NOT_FOUND` | Refetch cart |
| `404` | `ORDER_NOT_FOUND` | Show not-found/unauthorized order state |
| `409` | `USER_EXISTS` | Mark email/username conflict |
| `409` | `INSUFFICIENT_STOCK` | Refetch cart/products and show stock message |
| `409` | `CART_EMPTY` | Disable checkout and refetch cart |
| `413` | `IMAGE_TOO_LARGE` | Ask user to choose/compress a smaller image |
| `415` | `INVALID_IMAGE_TYPE` | Accept JPEG, PNG, or WebP only |
| `500` | `INTERNAL_ERROR` | Show generic retry message; log request context |
| `502` | `IMAGE_UPLOAD_FAILED` | Keep selected image and allow retry |
| `503` | `IMAGE_STORAGE_NOT_CONFIGURED` | Treat as backend configuration problem |

Example field-error mapping:

```js
function validationErrorsByField(error) {
  if (error.code !== 'INVALID_INPUT') return {};

  return Object.fromEntries(
    error.details.map(({ field, message }) => [field.replace(/^body\./, ''), message]),
  );
}
```

## 15. CORS and mobile development

The backend `CORS_ORIGIN` must match the frontend origin exactly, including protocol and port:

```env
CORS_ORIGIN=http://localhost:5173
```

For JSON requests, use `Content-Type: application/json`. For product image `FormData`, do not manually set `Content-Type`.

The browser uses the `Origin` header for CORS; the `Referer` header does not configure CORS.

On a physical phone or Android emulator, `localhost` refers to the phone/emulator, not the development computer. Use the computer’s LAN address for the API:

```env
VITE_API_URL=http://192.168.x.x:3000/api
```

Then configure the backend for the frontend’s actual origin, for example:

```env
CORS_ORIGIN=http://192.168.x.x:5173
```

For Android over USB, port forwarding is another option:

```bash
adb reverse tcp:3000 tcp:3000
```

Restart the backend after changing its environment variables.

## 16. Suggested frontend request flows

### Application startup

1. Load the saved token, if persistence is enabled.
2. Call `GET /users/me`.
3. If successful, store the returned user and fetch `GET /cart`.
4. If `401`, clear the token and show the unauthenticated UI.
5. Fetch `GET /products` independently because browsing does not require authentication.

### Registration/login

1. Submit credentials.
2. Save `data.token` according to the chosen token-storage strategy.
3. Store `data.user`.
4. Fetch the cart.

### Add to cart

1. Disable the submit button while the request is running.
2. Call `POST /cart/items` with the product ID and quantity.
3. Replace cart state with the full cart returned by the API.
4. On `INSUFFICIENT_STOCK`, refetch products and show the updated stock.

### Checkout

1. Disable checkout if the cart has no items.
2. Call `POST /checkout` once.
3. Replace cart state with an empty cart after success.
4. Invalidate product and order queries.
5. Navigate to the returned order detail.

### Product creation with image

1. Call `POST /products` with the JSON product fields.
2. Read the created product ID.
3. If the user selected an image, call `POST /products/:id/image` with `FormData`.
4. Replace the product in frontend state with the image-upload response.
5. If the image fails, keep the created product and offer a separate retry.

## 17. Current MVP limitations

- Product mutation endpoints do not yet require an admin role.
- Product listing has no pagination, search, filtering, or sorting parameters.
- Access tokens have no refresh-token workflow.
- Cart items do not include product images.
- Checkout has no payment provider or idempotency key.
- Orders support reading only; cancellation and status management are deferred.
- The API does not use cookie authentication.

Frontend code should avoid inventing unsupported request fields or query parameters. Add backend contract support first when one of these features is introduced.
