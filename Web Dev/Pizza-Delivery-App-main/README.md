# 🍕 PizzaVerse | Cybernetic Pizza Crafting & Delivery

PizzaVerse is a stunning, futuristic, full-stack Pizza Delivery Web Application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). 

It features a high-fidelity visual design system inspired by **Zomato's seamless delivery, Domino's custom visual ordering, and Apple's clean glassmorphism grids**. It includes real-time order tracking with Socket.IO, Nodemailer automated notification emails, dynamic custom pizza visual engines, Razorpay test payment integration, and a back-office administration metrics command center.

---

## 🚀 Key Features

### 1. Security & Authentication Gate
- **JWT Verification**: Secure stateless authentication stored in LocalStorage.
- **Nodemailer Verification**: Automated email verifications sent upon signup. If default SMTP configurations exist, the system automatically falls back to Ethereal SMTP with temporary browser links printed directly into the server terminal console!
- **Password Recoveries**: Safe password reset token flows with expiry envelopes.
- **Clearance Security Guard**: Admin dashboard blocked for standard accounts, requiring admin credentials to view metrics.

### 2. Custom Pizza Visual Builder Lab
- **Step-by-Step UI**: Interactive custom builder (Crust -> Sauce -> Cheese -> Toppings).
- **Spring-loaded preview**: SPA visual preview where checkmarks spawn pizza elements (Olives, Jalapenos, Mushrooms, Pepperoni, Bacon, Sweet corn) dropping dynamically into position using spring-based **Framer Motion** animations.
- **Size pricing multipliers**: Dynamic sizing (S, M, L) that scales crust baseline costs on the fly.

### 3. Shopping Cart Drawer & Checkout
- **Integrated Drawer**: Glassmorphic cart slider globally togglable from anywhere.
- **Checkout Ledger**: Detailed breakdown containing subtotals, GST (5%), dynamic delivery fees, and discount coupon codes (e.g. `PIZZAVERSE20` for 20% off).
- **Simulated Payment Sandbox**: If the system detects a dummy Razorpay key configuration, it triggers a custom credit card simulator window. Customers can select "Simulate successful transaction" or "Simulate failure" to test the MERN payment loops end-to-end flawlessly, while the underlying code is fully written to invoke real Razorpay once active keys are supplied!

### 4. Real-time WebSocket RADAR Tracker
- **Socket.IO Rooms**: Securely binds connection rooms to individual customer IDs to block order leakage.
- **Neon Tracker Track**: 5-step glowing timeline track (Received -> Prep -> Baking -> Transit -> Delivered) detailing chef actions, dispatch, and dynamic ETAs downcounter.

### 5. Inventory & Admin Command Center
- **Analytics Metrics**: Aggregates gross revenues (paid logs), active accounts, stock warnings, and daily chart lines.
- **Live Order Statuses**: Increments live orders through tracking phases in one click, firing WebSocket alerts to clients.
- **Automatic Stock Warning Emails**: As custom pizzas deplete ingredients, the server monitors quantities. If an item drops below safety thresholds (e.g., 15 units), the server fetches admin accounts and fires a warning email alert automatically.
- **CURD Menu Publications**: Seeding tools to edit prices, size ratios, categories, descriptions, and images.

---

## 📁 Scalable Directory Architecture

```
Pizza Delivery App/
├── backend/
│   ├── config/            # DB configuration, Razorpay & Nodemailer fallbacks
│   ├── controllers/       # Auth, Pizza, Custom, Cart, Order, Inventory, Admin
│   ├── models/            # User, Pizza, Order, Inventory, Cart, Review
│   ├── middleware/        # JWT parsing protects, Admin role guards
│   ├── routes/            # REST API endpoints mapping
│   ├── services/          # Nodemailer HTML templates, Razorpay helper
│   ├── seed.js            # Initial database seeder script
│   └── server.js          # Express entrypoint, Socket.IO listeners
├── frontend/              # Customer SPA
│   ├── src/
│   │   ├── components/    # Glassmorphic Navbar, sliding Cart drawer, PizzaCard
│   │   ├── pages/         # Landing, Auth, Builder Lab, Checkout, History, Tracker
│   │   └── store/         # AuthContext (JWT session), CartContext (pricing)
│   └── index.html
└── admin/                 # Admin command panel
    ├── src/
    │   ├── pages/         # Analytics, Live Orders, Inventory control, CRUD Menu
    │   └── App.jsx        # Sidebar layouts, security clearance gateway
    └── index.html
```

---

## 🛠️ Step-by-Step Launch Guidelines

### Prerequisites
- Node.js installed globally (NPM/NPX active).
- MongoDB database active locally (`mongodb://localhost:27017/pizzaverse`) or a MongoDB Atlas URI string.

---

### Step 1: Backend Server Setup

1. Open a terminal inside the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Open `.env` and verify your settings (local MongoDB fallback, SMTP, and Razorpay placeholders are preconfigured):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pizzaverse
   JWT_SECRET=super_secret_key_pizzaverse_2026
   ```
4. **Seed the database**: Populates the databases with curated starting pizzas (Margherita, Pepperoni Blaze, Meatverse) and custom builder toppings:
   ```bash
   npm run seed
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```
   *Note: If Nodemailer is utilizing dummy keys, check your terminal console logs upon sending emails! It prints a custom Ethereal SMTP preview browser link so you can preview sent HTML emails instantly!*

---

### Step 2: Customer Frontend Setup

1. Open a separate terminal inside the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start Vite compiler:
   ```bash
   npm run dev
   ```
4. Access the customer app in your browser at: `http://localhost:5173`

---

### Step 3: Administrator Dashboard Setup

1. Open a third terminal inside the `admin/` folder:
   ```bash
   cd admin
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start back-office compiler:
   ```bash
   npm run dev
   ```
4. Access command center in your browser at: `http://localhost:5174`

---

## 🔑 Administrative Clearance Note

To quickly log into the Admin Command Center:
1. Register a new user on the Customer app (`http://localhost:5173/auth`). **The first registered account on the database is automatically assigned the `admin` role** for convenience during testing!
2. Use those same login credentials to access the Administrator Panel at `http://localhost:5174/` to gain clearance.
3. Any subsequent accounts registered will be standard `user` accounts.

---

## 📡 REST API Documentations

| Endpoint | Method | Security | Description |
|---|---|---|---|
| `/api/auth/register` | POST | Public | Registers citizen profile & fires email verification |
| `/api/auth/login` | POST | Public | Validates credentials & returns JWT token |
| `/api/auth/verify-email` | GET | Public | Validates verification tokens and activates profile |
| `/api/auth/profile` | GET / PUT | Private | Retrieves or updates user profile & shipping target addresses |
| `/api/pizzas` | GET | Public | Lists active menu pizzas with search/sort queries |
| `/api/pizzas/recommendations`| GET | Public | AI Recommendation matching category/spice tags |
| `/api/custom/options` | GET | Public | Retrieves bases, sauces, and toppings from inventory |
| `/api/cart` | GET / POST / DEL| Private | Manages active cart items synced in database |
| `/api/orders` | POST | Private | Verifies custom stock and locks in pending transaction |
| `/api/orders/verify` | POST | Private | Validates transaction signature and fires confirmatory emails |
| `/api/orders/admin/all` | GET | Admin | Lists every order in database queue |
| `/api/orders/:id/status` | PUT | Admin | Updates tracking timeline status and triggers Socket.IO |
| `/api/inventory` | GET / PUT | Admin | Reviews inventory stock volume and restocks crusts/toppings |
| `/api/admin/analytics` | GET | Admin | Generates gross revenues and daily charting statistics |

---

## 🍕 Testing Coupon Codes
Enter these promo coupon codes in your cart drawer to test discount deductions:
- `PIZZAVERSE20` - 20% discount off subtotal.
- `SUPERFOOD` - 15% discount off subtotal.
- `FIRSTORDER` - 10% discount off subtotal.

---

*PizzaVerse: High-performance cybernetic pizza crafting.*
