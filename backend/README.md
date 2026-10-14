# SODAI E-Commerce Backend (MVC REST API)

A standalone backend architecture built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, **Mongoose**, **Zod**, **Bcrypt**, **JWT**, and **Nodemon**.

---

## 🏗️ Architecture: MVC (Model-View-Controller)

```
backend/
├── .env.example              # Environment variables template
├── nodemon.json              # Nodemon live reload configuration
├── package.json              # Dependencies and npm scripts
├── tsconfig.json             # TypeScript compiler settings
└── src/
    ├── app.ts                # Express application factory with middleware
    ├── server.ts             # Entry point, database bootstrap, shutdown
    ├── config/
    │   ├── db.ts             # Mongoose connection & lifecycle handlers
    │   └── env.ts            # Zod-validated environment config
    ├── models/               # [M] Mongoose Schemas & Data Models
    │   ├── User.model.ts     # User schema with bcrypt pre-save & methods
    │   ├── Product.model.ts  # Catalog schema, variants & pricing
    │   ├── Category.model.ts # Category taxonomy & product counters
    │   ├── Order.model.ts    # Order lifecycle, line items & shipping
    │   ├── Review.model.ts   # Product reviews & live rating recalculation
    │   └── Coupon.model.ts   # Promo codes & discount algorithms
    ├── views/                # [V] Presentation & Output Formatting
    │   ├── apiResponse.view.ts    # Standardized JSON response serializer
    │   └── emailTemplates.view.ts # Formatted notification views
    ├── controllers/          # [C] Business Logic Controllers
    │   ├── auth.controller.ts     # Register, login, JWT refresh, password reset
    │   ├── product.controller.ts  # Filtering, search, pagination, CRUD
    │   ├── category.controller.ts # Taxonomy CRUD
    │   ├── order.controller.ts    # Checkout, inventory decrement, tracking
    │   ├── review.controller.ts   # Submission & moderation
    │   ├── coupon.controller.ts   # Validation & management
    │   └── admin.controller.ts    # Analytics, customer management & settings
    ├── routes/               # Express Route Definitions
    │   ├── index.ts          # Root API aggregator (/api/v1)
    │   ├── auth.routes.ts
    │   ├── product.routes.ts
    │   ├── category.routes.ts
    │   ├── order.routes.ts
    │   ├── review.routes.ts
    │   ├── coupon.routes.ts
    │   └── admin.routes.ts
    ├── middlewares/          # Security & Processing Middlewares
    │   ├── auth.middleware.ts     # JWT extraction & RBAC verification
    │   ├── validate.middleware.ts # Zod schema request validation
    │   └── error.middleware.ts    # Global error & 404 handlers
    ├── validators/           # Zod Input Schemas
    │   ├── auth.validator.ts
    │   ├── product.validator.ts
    │   ├── category.validator.ts
    │   ├── order.validator.ts
    │   ├── review.validator.ts
    │   └── coupon.validator.ts
    └── utils/                # Utilities
        ├── jwt.ts            # Token generation & verification
        ├── logger.ts         # Structured logging
        └── seed.ts           # Initial database population script
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default variables:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/sodai_ecommerce
JWT_SECRET=sodai_development_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 3. Seed Database (Optional)
Populates demo products, categories, admin user, and customer account:
```bash
npm run seed
```

**Demo Credentials:**
- **Admin**: `admin@aura-studio.com` / `AdminPassword123!`
- **Customer**: `alex.rivera@aura-studio.com` / `CustomerPassword123!`

### 4. Run Development Server with Nodemon
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📡 API Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /register` - Register a new customer account
- `POST /login` - Sign in and receive JWT accessToken and refreshToken
- `POST /refresh-token` - Exchange refresh token for new access token
- `POST /forgot-password` - Request password reset token
- `POST /reset-password` - Reset password with token
- `GET /me` - Get current authenticated user profile *(Requires JWT)*
- `PATCH /profile` - Update profile info *(Requires JWT)*
- `POST /change-password` - Change password *(Requires JWT)*
- `POST /addresses` - Add address to address book *(Requires JWT)*
- `DELETE /addresses/:id` - Remove address *(Requires JWT)*

### Products (`/api/v1/products`)
- `GET /` - Paginated products with filtering (`category`, `minPrice`, `maxPrice`, `search`, `inStock`, `sort`)
- `GET /featured` - Get featured products for homepage
- `GET /slug/:slug` - Get product by URL slug
- `GET /:id` - Get product by ID
- `POST /` - Create product *(Admin only)*
- `PATCH /:id` - Update product *(Admin only)*
- `DELETE /:id` - Delete product *(Admin only)*

### Categories (`/api/v1/categories`)
- `GET /` - List all active categories
- `GET /:slug` - Get category by slug
- `POST /` - Create category *(Admin only)*
- `PATCH /:id` - Update category *(Admin only)*
- `DELETE /:id` - Delete category *(Admin only)*

### Orders (`/api/v1/orders`)
- `POST /checkout` - Place order, decrement inventory, apply coupon
- `GET /my-orders` - List current user's orders *(Requires JWT)*
- `GET /:id` - Get order details *(Customer or Admin)*
- `GET /` - List all orders with filters *(Admin only)*
- `PATCH /:id/status` - Update order status *(Admin only)*
- `PATCH /:id/tracking` - Update tracking and mark as shipped *(Admin only)*

### Coupons (`/api/v1/coupons`)
- `POST /validate` - Validate discount code against cart subtotal
- `GET /` - List coupons *(Admin only)*
- `POST /` - Create coupon *(Admin only)*
- `PATCH /:id` - Update coupon *(Admin only)*
- `DELETE /:id` - Delete coupon *(Admin only)*

### Reviews (`/api/v1/reviews`)
- `GET /product/:productId` - Get approved reviews for a product
- `POST /` - Submit new review (automatically updates product rating)
- `GET /admin` - List all reviews for moderation *(Admin only)*
- `PATCH /:id/moderate` - Approve/reject review *(Admin only)*
- `DELETE /:id` - Delete review *(Admin only)*

### Admin Console (`/api/v1/admin`)
- `GET /stats` - Revenue, total orders, sales graph, top products, low stock
- `GET /customers` - Customer list with order counts & lifetime spend
- `PATCH /customers/:id/status` - Activate or deactivate customer
- `GET /settings` - Store configuration
- `PATCH /settings` - Update store settings
