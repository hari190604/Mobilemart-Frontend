# MobileMart - Frontend Developer 2 Handover & Integration Guide

Welcome! This document outlines the status of the MobileMart React + Vite frontend, page route specifications, reusable component libraries, shared states, and task workflows for integrating the Spring Boot backend APIs.

---

## 📁 Suggested Git Branch for M2 Work
We suggest using the following branch name for backend integration and feature extensions:
```bash
git checkout -b feature/m2-integration-collaboration
```

---

## 📁 Project Directory Structure

```text
src/
├── assets/          # Brand logos, visual graphics and static images.
├── components/      # Common layout wrappers (Navbar, Footer, Protected Route guards).
│   └── common/      # Reusable form styling fields and elements (FormInput, Search, ProductCard).
├── contexts/        # Shared global states (AuthContext, CartContext).
├── layouts/         # Page layout grids (RootLayout).
├── pages/           # Dedicated application screens (Home.jsx, Products.jsx, ProductDetails.jsx, etc.).
├── services/        # Axios HTTP client configurations (api.js interceptors adding Authorization headers).
├── utils/           # Static data mock arrays (mockProducts data lists).
├── App.css          # Core layout classes.
├── App.jsx          # Route mappings lists.
└── index.css        # Glassmorphism designs tokens, custom HSL variable gradients, and color defaults.
```

---

## 💎 Completed Modules
The following modules have been completed:
- **Navbar** (`src/components/Navbar.jsx`): Responsive header navigation drawer with sticky borders and items indicators.
- **Footer** (`src/components/Footer.jsx`): Structured social widgets, newsletter subscription fields, and copyright grids.
- **Home Page** (`src/pages/Home.jsx`): Carousel banner slider, brand categories, testimonials, and flagship product cards.
- **Login Page** (`src/pages/Login.jsx`): Regex validations, password visibility triggers, and loading animation state controls.
- **Register Page** (`src/pages/Register.jsx`): Phone entries, password strength checks, terms validation, and verification redirects.
- **VerifyOtp Page** (`src/pages/VerifyOtp.jsx`): Glassmorphic code validation entry input form.
- **Product Listing** (`src/pages/Products.jsx`): Sidebar catalog queries, brands categories lists, price/rating sorts, search controls, and paginating maps.
- **Product Details** (`src/pages/ProductDetails.jsx`): Carousel thumbnails gallery preview transitions, 15% promotional discount badges, stock increment locks, spec/reviews tabs, and related recommended grids.
- **Search Bar** (`src/components/common/Search/Search.jsx`): Auto-suggestions popup filtering `mockProducts` on 2+ character entries, coupled with persistent recent queries caching under `localStorage`.

---

## 🚀 Remaining Modules (Tasks Checklist for Developer 2)

All required route file paths are pre-configured. Open these files and follow the `TODO` commented instructions:

### 1. Cart Bag System (`src/pages/Cart.jsx`)
*   **API hooks**: Update items count steps, single deletions, and bulk clears:
    - Update Quantity: `PUT /api/v1/cart/items/{itemId}?quantity={qty}`
    - Delete Item: `DELETE /api/v1/cart/items/{itemId}`
    - Clear Cart: `DELETE /api/v1/cart/clear`

### 2. Checkout Panel (`src/pages/Checkout.jsx`)
*   **Transaction Syncs**: Post shipping details, payment modes, and item lists to the database:
    - Create Order: `POST /api/v1/orders`

### 3. Payment Processing Gateway (`src/pages/Payment.jsx`)
*   **Gateway Integrations**: Process credit card checks, mock UPI transfers, and dispatch charge authorizations:
    - Charge Intent: `POST /api/v1/payments/create-intent`

### 4. Order Tracking History (`src/pages/Orders.jsx`)
*   **Delivery status maps**: Query user order lists and track dispatch stages (Confirmed ➔ Dispatched ➔ Delivered) dynamically:
    - Orders audit: `GET /api/v1/orders/user`
    - Tracking: `GET /api/v1/orders/{orderId}/status`

### 5. Profile Details Settings (`src/pages/Profile.jsx`)
*   **Account Settings**: Load profile details and save updates:
    - Current Profile: `GET /api/v1/users/me`
    - Save Details: `PUT /api/v1/users/update`

### 6. Admin Back-Office Panel (`src/pages/AdminDashboard.jsx`)
*   **Management Dashboard**: Restrict views to `ROLE_ADMIN` check attributes, and handle store metrics, user controls, order actions, and catalog items edits:
    - Analytics statistics: `GET /api/v1/admin/dashboard/stats`
    - User list management: `GET /api/v1/admin/users`, `PUT /api/v1/admin/users/{id}/role`
    - Full store order list audit: `GET /api/v1/admin/orders`, `PUT /api/v1/admin/orders/{id}/status`
    - Catalog items: `POST /api/v1/products` (Add), `PUT /api/v1/products/{id}` (Update), `DELETE /api/v1/products/{id}` (Delete)

---

## 🔗 Application Routing Information

Routing is preconfigured in `src/App.jsx` using `react-router-dom`:
- `/` - Home Page (Public)
- `/products` - Catalog list filtered by keywords or categories (Public)
- `/products/:id` - Detailed device specification highlights (Public)
- `/cart` - Shopping cart details (Public)
- `/login` - Auth sign in (Guest redirection check)
- `/register` - Account sign up (Guest redirection check)
- `/verify-otp` - Activation code entry (Guest redirection check)
- `/checkout` - Bill address entries (Requires `ROLE_CUSTOMER` | `ROLE_ADMIN` token)
- `/payment` - Secure credentials payment screen (Requires `ROLE_CUSTOMER` | `ROLE_ADMIN` token)
- `/orders` - User order tracking histories (Requires `ROLE_CUSTOMER` | `ROLE_ADMIN` token)
- `/profile` - Customer account edits (Requires `ROLE_CUSTOMER` | `ROLE_ADMIN` token)
- `/admin` - Administrator dashboard (Requires `ROLE_ADMIN` token)

---

## 📦 Reusable Components
Use these prebuilt components for styling consistency:
1. **`<FormInput>`** (`src/components/common/FormInput.jsx`): Reusable layout input containing validation indicators, handset handset handlers, secure passwords display triggers, and placeholder icons.
2. **`<ProductCard>`** (`src/components/common/ProductCard/ProductCard.jsx`): Standard card layout. Renders image cards, brand text, price cross cuts, star metrics, item detail redirects, and direct wishlist highlights.
3. **`<Search>`** (`src/components/common/Search/Search.jsx`): Decoupled catalog query components mapping autocompletions overlays.

---

## 🛡️ Shared State Structures
The application coordinates state across two main context providers:
- **`AuthContext`** (`src/contexts/AuthContext.jsx`):
  - `user`: `{ name, email, phoneNumber, role }`
  - `token`: Bearer JWT token string from local storage checks.
  - `login()`, `logout()`, `verifyOtp()`, `register()`.
- **`CartContext`** (`src/contexts/CartContext.jsx`):
  - `cartItems`: Array of active items added.
  - `cartTotal`: Cumulative cost of items.
  - `addToCart(product, qty)`, `removeFromCart(id)`, `updateQuantity(id, qty)`, `clearCart()`.

---

## 📐 Coding Conventions & Guidelines

1. **Vanilla Styling System**:
   We utilize standard vanilla CSS files corresponding to each JSX file (e.g. `Products.jsx` + `Products.css`). Standardize styling using predefined variables in `index.css` (e.g. `var(--accent)`, `var(--bg-card)`, `var(--radius-md)`).
2. **Axios Client Interceptors**:
   Always make HTTP calls using the `api` client exported in `src/services/api.js`. The request interceptor automatically formats and appends standard Bearer Authorization headers when cookies/localStorage keys are present.
3. **State Resets**:
   Always include dependency cleanup triggers (e.g. reset page indexes back to 1, or window scroll top jumps) on component mounts, route shifts, or param translations.
