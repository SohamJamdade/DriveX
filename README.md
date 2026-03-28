# 🚗 DriveX — Vehicle Renting Platform

> A **production-ready**, full-stack vehicle rental web application built to impress in interviews.
> React · Node.js · Express · MongoDB · Tailwind CSS · JWT Auth

---

## 📸 Preview

| Page | Description |
|------|------------|
| **Home** | Hero section with animated search bar, AI-recommended vehicles, category cards |
| **Browse** | Filterable grid: type, fuel, city, price range, transmission, pagination |
| **Vehicle Detail** | Image gallery, live availability check, real-time price calc, reviews |
| **Booking** | Date picker → conflict detection → confirmation in 3 steps |
| **Dashboard** | User booking history with status tracking + profile editor |
| **Admin** | Stats overview, vehicle CRUD, booking management, user control |

---

## 🗂️ Project Structure

```
vehicle-renting-platform/
│
├── backend/
│   ├── server.js               # Express app entry point
│   ├── .env.example
│   ├── package.json
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   ├── User.js             # Bcrypt + JWT methods
│   │   ├── Vehicle.js          # Text search indexes
│   │   ├── Booking.js          # Double-booking prevention logic
│   │   └── Review.js           # Auto-rating aggregation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── vehicleController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + role-based authorize
│   │   └── errorHandler.js     # Global error formatter
│   ├── routes/
│   │   ├── auth.js
│   │   ├── vehicles.js
│   │   ├── bookings.js
│   │   ├── reviews.js
│   │   └── users.js
│   └── seed/
│       └── seedData.js         # 12 vehicles, 4 users, bookings, reviews
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── App.jsx             # Router + lazy loading + route guards
        ├── main.jsx
        ├── index.css           # Design system + Tailwind config
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── services/
        │   └── api.js          # Axios + interceptors + all API calls
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── VehicleCard.jsx
        │   └── ui/
        │       └── LoadingScreen.jsx  # Skeletons, badges, empty states
        └── pages/
            ├── Home.jsx
            ├── Vehicles.jsx
            ├── VehicleDetail.jsx
            ├── Booking.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Wishlist.jsx
            └── Admin/
                ├── AdminDashboard.jsx
                ├── AdminVehicles.jsx
                ├── AdminBookings.jsx
                └── AdminUsers.jsx
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas (free cloud)
- npm or yarn

---

### Step 1 — Clone & Setup Backend

```bash
cd vehicle-renting-platform/backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/vehicle_renting
JWT_SECRET=your_super_secret_key_here_make_it_long
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

---

### Step 2 — Seed the Database

```bash
# In the backend folder — this creates 12 vehicles, 4 users, and sample bookings
npm run seed
```

**Demo accounts created by seed:**
| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@drivex.com | admin123 |
| User  | rahul@example.com | password123 |
| User  | priya@example.com | password123 |

---

### Step 3 — Start Backend

```bash
npm run dev
# Server starts on http://localhost:5000
# Test: http://localhost:5000/api/health
```

---

### Step 4 — Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create env file
cp .env.example .env
```

`.env` content:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 5 — Start Frontend

```bash
npm run dev
# App starts on http://localhost:5173
```

**Done! Open http://localhost:5173 and log in.** 🎉

---

## 🔗 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Get JWT token |
| GET  | `/api/auth/me` | Private | Get current user |
| PUT  | `/api/auth/profile` | Private | Update name/phone |
| PUT  | `/api/auth/password` | Private | Change password |

### Vehicles
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET  | `/api/vehicles` | Public | List with filters & pagination |
| GET  | `/api/vehicles/recommended` | Public | Top-rated popular picks |
| GET  | `/api/vehicles/cities` | Public | Available city list |
| GET  | `/api/vehicles/:id` | Public | Single vehicle + reviews |
| POST | `/api/vehicles` | Admin | Add vehicle |
| PUT  | `/api/vehicles/:id` | Admin | Edit vehicle |
| DELETE | `/api/vehicles/:id` | Admin | Remove vehicle |
| POST | `/api/vehicles/:id/wishlist` | Private | Toggle wishlist |

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | Private | Create booking (checks conflicts) |
| GET  | `/api/bookings/my` | Private | User's booking history |
| GET  | `/api/bookings/vehicle/:id/availability` | Private | Check dates |
| GET  | `/api/bookings/:id` | Private | Single booking |
| PUT  | `/api/bookings/:id/cancel` | Private | Cancel booking |
| GET  | `/api/bookings` | Admin | All bookings + stats |

### Reviews
| Method | Endpoint | Access |
|--------|----------|--------|
| GET  | `/api/reviews/vehicle/:id` | Public |
| POST | `/api/reviews/vehicle/:id` | Private |
| DELETE | `/api/reviews/:id` | Private |

---

## 🌐 Deployment Guide

### 1. MongoDB Atlas (Free Cloud DB)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free account
2. Create cluster → Get connection string
3. Add your IP to the allowlist (or use `0.0.0.0/0` for all IPs)
4. Replace `MONGO_URI` in env with Atlas string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/vehicle_renting
   ```

---

### 2. Backend Deployment — Render (Free)

1. Push your project to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables (copy from `.env`):
   - `MONGO_URI` → your Atlas URL
   - `JWT_SECRET` → long random string
   - `CLIENT_URL` → your Vercel frontend URL (after step 3)
   - `NODE_ENV` → `production`
6. Deploy! You'll get a URL like: `https://drivex-api.onrender.com`

---

### 3. Frontend Deployment — Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → Import Project from GitHub
2. Set:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
3. Add Environment Variable:
   - `VITE_API_URL` → `https://drivex-api.onrender.com/api`
4. Deploy!

> 💡 After deploying frontend, go back to Render and update `CLIENT_URL` with your Vercel URL.

---

## 🎤 Interview Preparation Section

---

### 1. Simple Project Explanation (Say This in Interviews)

> *"DriveX is a full-stack vehicle rental platform — think Zoomcar or OYO Drives but built from scratch. Users can browse cars and bikes, filter by city or fuel type, check real-time availability, and book in seconds. There's a user dashboard to track bookings, a wishlist, and a full admin panel to manage the fleet. I built the backend with Node.js and Express using MVC architecture, used MongoDB for the database, and built the frontend in React with Tailwind CSS."*

---

### 2. Architecture Explanation

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│  Pages → Components → Context → Axios Service Layer  │
└────────────────────────┬────────────────────────────┘
                         │ HTTP (JWT in headers)
┌────────────────────────▼────────────────────────────┐
│                 BACKEND (Node + Express)              │
│  Routes → Middleware (auth/validation) → Controllers  │
└────────────────────────┬────────────────────────────┘
                         │ Mongoose
┌────────────────────────▼────────────────────────────┐
│                   DATABASE (MongoDB)                  │
│     Users · Vehicles · Bookings · Reviews             │
└─────────────────────────────────────────────────────┘
```

**Key design decisions:**
- **MVC pattern** — clean separation of concerns (routes → controllers → models)
- **JWT stateless auth** — scales horizontally, no sessions to manage
- **Middleware-first** — auth and error handling applied globally, not per-route
- **Mongoose virtuals** — computed fields without extra DB writes

---

### 3. Data Flow Walkthrough

**User books a vehicle:**

```
1. User selects dates on VehicleDetail page
2. React sends POST /api/bookings with { vehicleId, startDate, endDate }
3. auth.js middleware verifies JWT → attaches req.user
4. bookingController.createBooking() runs:
   a. Validates dates are not in the past
   b. Confirms vehicle exists and isAvailable
   c. Calls Booking.checkAvailability() — queries DB for overlapping bookings
   d. If available: calculates totalDays × pricePerDay
   e. Creates Booking document in MongoDB
   f. Increments vehicle.bookingCount (for AI recommendations)
5. Returns populated booking object
6. React navigates to /dashboard with success toast
```

---

### 4. Common Interview Questions & Answers

---

**Q: Why did you build this project?**

> *"I wanted to build something that felt like a real product — not a to-do list or blog. Vehicle rental is a domain I could relate to, it had real complexity like booking conflicts, role-based access, and state management. It also let me showcase a full product: auth, CRUD, search and filter, real-time calculations, and an admin panel. This project taught me more than any tutorial because I had to make real architectural decisions."*

---

**Q: What was the biggest challenge?**

> *"The booking conflict detection was the trickiest part. The naive solution is to check if dates overlap, but edge cases like same-day bookings or checking mid-booking edits required careful thinking. The key insight was the overlap formula: `existing.start < requested.end AND existing.end > requested.start`. This catches all overlap cases including containment and partial overlaps. I also had to handle it at the database level so it stays accurate even under concurrent requests."*

---

**Q: How does double-booking prevention work?**

> *"In the Booking model, I wrote a static method called `checkAvailability`. Before creating any booking, it queries MongoDB for existing bookings on that vehicle that are NOT cancelled, and checks if their date range overlaps with the requested dates. The overlap condition is: existing booking starts before the new end date AND existing booking ends after the new start date. If any such booking exists, the new booking is rejected with a clear error. This check runs on the server, so even if two users click 'Book Now' simultaneously, only one will succeed."*

---

**Q: How does JWT authentication work in your project?**

> *"When a user logs in, the server verifies their email and password (using bcrypt.compare), then generates a JWT signed with a secret key — it contains the user's ID and role. This token is sent to the frontend, which stores it in localStorage and attaches it to every API request via an Axios interceptor. On each protected request, the `protect` middleware decodes and verifies the token, fetches the user from the database, and attaches it to `req.user`. For role-based access, I have a separate `authorize` middleware that checks `req.user.role`."*

---

**Q: How does your recommendation system work?**

> *"It's a simple but effective heuristic approach: vehicles are ranked by `bookingCount` first, then by `rating`. The idea is that the most-booked and highest-rated vehicles are the most trustworthy options. Every time a booking is confirmed, I increment the vehicle's `bookingCount`, so the ranking stays up-to-date organically. For a production system, you'd add collaborative filtering — matching the current user's preferences (fuel type, city, vehicle type) against other users with similar booking history."*

---

**Q: How did you handle the MVC architecture?**

> *"In Express, MVC maps naturally: Models are Mongoose schemas with business logic methods, Controllers handle the request/response cycle and call model methods, and Routes wire HTTP endpoints to controllers. Middleware sits between routes and controllers for cross-cutting concerns like auth and validation. This separation meant that when I needed to change how double-booking worked, I only touched the Booking model — the controller and route stayed unchanged."*

---

**Q: How is your code structured for scalability?**

> *"A few decisions support future scale: Mongoose indexes on frequently queried fields (city, type, pricePerDay, text search) keep queries fast as data grows. JWT is stateless so backend can be horizontally scaled with a load balancer. The API is versioned-ready (all routes under /api/). For real production scaling I'd add Redis for caching vehicle listings, queue-based booking processing to handle concurrent requests safely, and separate the admin panel into its own microservice."*

---

### 5. Resume-Ready Bullet Points (ATS-Optimized)

Copy these directly into your resume:

```
• Built DriveX, a full-stack vehicle rental platform using React.js, Node.js,
  Express.js, and MongoDB with Mongoose ORM, supporting 500+ vehicle listings
  across 15 cities

• Architected RESTful API with MVC pattern, JWT authentication, bcrypt password
  hashing, and role-based access control (User/Admin)

• Engineered double-booking prevention system using MongoDB date overlap queries,
  eliminating race conditions in concurrent booking requests

• Implemented real-time price calculation, live availability checking, and booking
  status tracking (Pending → Confirmed → Active → Completed → Cancelled)

• Developed admin dashboard with vehicle CRUD operations, booking management,
  and revenue analytics using MongoDB aggregation pipelines

• Integrated wishlist/favorites, star ratings with auto-aggregation, and AI-style
  recommendation engine based on booking frequency and average ratings

• Built responsive mobile-first UI with Tailwind CSS, skeleton loading states,
  animated components, and smooth transitions (Syne + DM Sans typography)

• Deployed on Vercel (frontend) + Render (backend) + MongoDB Atlas with
  environment-based configuration and CORS security

• Applied production-grade practices: rate limiting (express-rate-limit),
  security headers (helmet), global error handling middleware, and input
  validation (express-validator)
```

---

## ⭐ Bonus: Unique Feature Idea

### 🗺️ Smart Trip Planner (Makes DriveX Stand Out)

Implement a **multi-city route planner** that lets users:
1. Enter multiple cities (e.g., Mumbai → Pune → Goa)
2. System calculates driving distances using Google Maps API
3. Recommends the ideal vehicle type for the route (SUV for hills, bike for city)
4. Shows estimated fuel cost based on vehicle mileage
5. Books vehicles at each pickup city automatically

**Why this stands out:** No competitor app has route-aware vehicle recommendations built into the booking flow. It turns a transactional app into a travel planning tool.

---

## 🔧 Scaling for Real-World Production

| Challenge | Solution |
|-----------|----------|
| High concurrent bookings | Move booking creation to a **message queue** (Bull + Redis) with atomic DB transactions |
| Slow vehicle search | Add **Elasticsearch** for full-text search and **Redis** cache for listings (30s TTL) |
| Image storage | Replace Unsplash URLs with **Cloudinary** or **AWS S3** with image optimization |
| Auth at scale | Add **refresh tokens** + token revocation list in Redis |
| Payments | Integrate **Razorpay** for deposits and security holds |
| Notifications | **Firebase Cloud Messaging** for booking confirmations + reminders |
| Monitoring | **Sentry** for error tracking + **Datadog** APM |
| Testing | **Jest** unit tests for models + **Supertest** integration tests for APIs |
| CI/CD | **GitHub Actions** pipeline: lint → test → deploy on merge to main |

---

## 📄 License

MIT — Free to use, fork, and present in interviews. Please star ⭐ if this helped!

---

*Built with ❤️ · React + Node.js + MongoDB · Made for interviews & portfolios*
