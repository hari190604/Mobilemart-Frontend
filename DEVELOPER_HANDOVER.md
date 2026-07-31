# MobileMart Frontend - Developer Handover & Collaboration Guide

Welcome to the **MobileMart Frontend** codebase! This project is a premium, responsive e-commerce web application built using **React + Vite** and styled with **vanilla CSS variables** for maximum customizability.

This guide provides a comprehensive overview of the current state of the application, completed frontend modules, architectural details, and a clear roadmap for integrating the Spring Boot backend REST APIs.

---

## 📁 Active Directory Structure

The codebase is organized in a flat, intuitive React layout:

```text
src/
├── assets/          # Static layout assets, brand assets, and logo images
├── components/      # Common UI wrappers (Navbar, Footer, Protected Route guards)
│   └── common/      # Reusable form elements (FormInput, Search, ProductCard)
├── contexts/        # React Context Providers for global state (AuthContext, CartContext)
├── layouts/         # Page layout structures (RootLayout)
├── pages/           # High-fidelity view screens (Home, Products, ProductDetails, Cart, etc.)
├── services/        # Axios API client configuration (api.js interceptors)
├── utils/           # Data mocks (mockProducts listing data)
├── App.css          # Core app layout settings
├── App.jsx          # Route paths mapping & Auth/Cart providers hierarchy
├── index.css        # Enterprise level CSS design tokens, HSL variables & dark mode variables
└── main.jsx         # DOM insertion point
```

---

## 💎 Completed Frontend Modules

### 1. 🏠 Home Page (`src/pages/Home.jsx`)
- **Promotional Hero Banner**: Interactive redirects, glassmorphic layout badges, and accent CTAs.
- **Brand Catalog Section**: Easy selector cards representing key manufacturers (Apple, Samsung, OnePlus, etc.).
- **Popular Categories**: Core navigation shortcuts (Smartphones, Tablets, Wearables, Accessories).
- **Flagship Lists**: Showcases popular items directly connected to the Cart systems.
- **Testimonial Slider & Newsletter**: Email subscription box with client validation.

### 2. 📱 Products Listing Page (`src/pages/Products.jsx`)
- **Filtered Sidebar Listings**: Active filter triggers matching text, categories, manufacturers, and sorting rules (Price Asc/Desc, top-rated).
- **Product Grid**: Responsive product grids utilizing the reusable `<ProductCard>` component.
- **Vite Pagination**: Limits products list to 6 elements per page, supporting Previous/Next controls. Resets current page index back to 1 on filter/search updates.

### 3. 🔍 Advanced Search Component (`src/components/common/Search/`)
- **Autocompletion Popovers**: Filters the mock products database on 2+ typed query characters to display image previews, prices, and title links.
- **Recent Searches Cache**: Stores and Displays search history tags in `localStorage`.
- **Integrated Drawer**: Seamlessly embedded in desktop headers and mobile navigation drawers.

### 4. 👁️ Product Details Page (`src/pages/ProductDetails.jsx`)
- **Gallery Carousel**: Switches main image preview dynamically on thumbnail thumbnail hover/clicks.
- **Price Markdown Overlay**: Autocalculates 15% promotional discounts showing crossed-out original prices.
- **State Incrementor**: Locks maximum product quantity according to stock limits.
- **Specs & Reviews Switcher**: Toggles specs grids or customer reviews, showing verified buyer stars and dates.
- **Related Recommendations**: 4 category-related suggestions with smooth window auto-scroll controls on click navigation.

### 5. 🛒 Cart Bag System (`src/pages/Cart.jsx`)
- **Dynamic Subtotal/Tax Math**: Calculates total amounts against item lists, modifying shipping expenses based on a $500 free courier value.
- **Inline Multipliers**: Integrates quantity additions, single item truncation hooks, and clear cart options.

### 6. 💳 Checkout Form (`src/pages/Checkout.jsx`)
- **Delivery Addresses Input**: Fields captures street addresses, zip codes, and cities.
- **Payment Method Selectors**: Credit Card details forms, mock UPI prompt notifications, and Cash-on-Delivery summaries.
- **Order Vouchers Receipt**: Displays generated order codes, date timestamps, and summaries after simulated timeouts.

### 7. 🛡️ Verification & Auth Flows (`src/pages/auth/`)
- **Login Form (`Login.jsx`)**: Regex email checkers, show/hide passwords, loading status, and validations errors.
- **Register Form (`Register.jsx`)**: Extends form validations for Phone, Password strength match, Accept terms tickboxes, and forwards to verification OTP maps.
- **VerifyOtp (`VerifyOtp.jsx`)**: Implements numeric code validation entry inputs.

### 8. 📦 Tracking & Profile (`src/pages/`)
- **Orders History (`Orders.jsx`)**: Renders visual step status nodes (Order Confirmed ➔ Dispatched ➔ Delivered) mapped from transactions stored under `localStorage`.
- **Profile Updates (`Profile.jsx`)**: Customer updates matching avatar names, emails, and address parameters.

---

## ⚡ Architecture & Shared State

- **`AuthContext.jsx`**: Manages the logged-in customer state and token mapping. It coordinates mock credentials login and stores the JWT string under `localStorage`.
- **`CartContext.jsx`**: Coordinates shopping cart state (`cartItems`), addition hooks, removal hooks, item count steps, and subtotal math.
- **`ProtectedRoute.jsx`**: Handles route roles authorization (`ROLE_CUSTOMER` vs `ROLE_ADMIN`) and redirects unauthenticated nodes.

---

## 🚀 Tasks Left for the Second Developer (Integration Roadmap)

To complete the project, hook up the actual backend APIs using Axios service configs:

1. **Backend URL configuration**:
   Set database/API root location variables in the local root `.env` config file:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```

2. **Migrate Auth Flow endpoints**:
   Replace mock logins/registrations inside `AuthContext.jsx` with actual Axios calls matching backend paths:
   - Registration request: `POST /auth/register` (Returns account details)
   - OTP dispatch: `POST /auth/verify-otp` (Activates account)
   - Login request: `POST /auth/login` (Returns Bearer JWT Token `token` and role metrics)
   - Profile retrieval: `GET /users/me` (Injects current logged-in details)

3. **Establish Product Catalog Sync**:
   Inside `Products.jsx` and `ProductDetails.jsx`, replace `mockProducts` with dynamic page query fetch calls:
   - Catalog: `GET /products?page=0&size=6&category={category}&brand={brand}&search={search}`
   - Details: `GET /products/{id}`
   - Related: `GET /products/category/{category_name}`

4. **Settle Orders Backend Write**:
   Inside `Checkout.jsx` and `Orders.jsx`, exchange simulated localStorage write handlers for API transaction requests:
   - Place Order: `POST /orders` (Sends payload with address and order items list)
   - History: `GET /orders/my-orders` (Returns list of orders for the user)
   - Order Status: Keep track of tracking progress dynamically by syncing status terms returned from database objects.

---

## 🛠️ Developing Locally

1. Install modules:
   ```bash
   npm install
   ```
2. Launch Vite in dev environment:
   ```bash
   npm run dev
   ```
3. Test production compile output:
   ```bash
   npm run build
   ```
