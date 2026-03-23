# ⚡ EVCharge — EV Charging Station Management System

A full-stack web application for managing EV charging stations with real-time availability, smart billing, energy monitoring, and an intuitive dashboard.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat&logo=tailwind-css)

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Setup Instructions](#setup-instructions)
8. [Deployment Guide](#deployment-guide)
9. [Environment Variables](#environment-variables)
10. [Demo Credentials](#demo-credentials)

---

## 📖 Project Overview

EVCharge is a production-ready, full-stack EV Charging Station Management System featuring:

- **JWT-based Authentication** with role-based access (User/Admin)
- **Real-time slot availability** via WebSocket + polling
- **Interactive map** showing all stations (OpenStreetMap/Leaflet — FREE)
- **Smart booking system** with vehicle type selection and cost estimation
- **Automated billing** with GST calculation and PDF download (jsPDF)
- **Energy monitoring** with Chart.js visualizations (daily/weekly/monthly)
- **Admin panel** for station/user/pricing management
- **Dark/Light mode** support
- **Fully responsive** mobile-first design

---

## 📁 Folder Structure

```
sample/
├── backend/                    # Node.js + Express API server
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # MongoDB connection
│   │   ├── controllers/        # Business logic
│   │   │   ├── authController.js
│   │   │   ├── stationController.js
│   │   │   ├── bookingController.js
│   │   │   ├── billingController.js
│   │   │   ├── adminController.js
│   │   │   └── contactController.js
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification + role guard
│   │   │   └── errorHandler.js  # Global error handler
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── ChargingStation.js
│   │   │   ├── Booking.js
│   │   │   ├── Billing.js
│   │   │   └── Contact.js
│   │   ├── routes/              # Express routers
│   │   │   ├── authRoutes.js
│   │   │   ├── stationRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── billingRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── contactRoutes.js
│   │   ├── scripts/
│   │   │   └── seed.js          # Database seeder (5 stations + 2 users)
│   │   ├── utils/
│   │   │   ├── tokenUtils.js    # JWT generation
│   │   │   └── emailService.js  # Nodemailer email sender
│   │   └── server.js            # Express app + WebSocket server
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # React + Vite + Tailwind
    ├── src/
    │   ├── api/
    │   │   ├── axiosConfig.js   # Axios instance with JWT interceptors
    │   │   └── index.js         # All API methods
    │   ├── components/layout/
    │   │   ├── Navbar.jsx       # Responsive navbar with auth dropdown
    │   │   ├── Footer.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Global auth state + JWT management
    │   │   └── ThemeContext.jsx # Dark/Light mode
    │   ├── pages/
    │   │   ├── Home.jsx         # Landing page
    │   │   ├── About.jsx
    │   │   ├── Contact.jsx      # Contact form
    │   │   ├── Stations.jsx     # Station listing with filters
    │   │   ├── StationDetail.jsx # Slot picker + booking form + mini map
    │   │   ├── MapView.jsx      # Full-page OpenStreetMap
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   ├── Signup.jsx
    │   │   │   ├── ForgotPassword.jsx
    │   │   │   └── ResetPassword.jsx
    │   │   ├── dashboard/
    │   │   │   ├── Dashboard.jsx      # Stats + charts + recent bookings
    │   │   │   ├── Bookings.jsx       # Booking history + cancel
    │   │   │   ├── BillingHistory.jsx # Bills + PDF download
    │   │   │   └── Profile.jsx        # Update profile + change password
    │   │   └── admin/
    │   │       └── AdminDashboard.jsx # Analytics + station/user mgmt
    │   ├── App.jsx              # Route configuration
    │   ├── main.jsx
    │   └── index.css            # Tailwind + custom components
    ├── .env.example
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🛠️ Tech Stack

| Layer       | Technology                          | Why                      |
|-------------|-------------------------------------|--------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS 3    | Fast, modern, free       |
| Backend     | Node.js + Express.js                | Scalable REST API        |
| Database    | MongoDB Atlas (free tier)           | Flexible, cloud-hosted   |
| Auth        | JWT (jsonwebtoken + bcryptjs)       | Stateless, secure        |
| Maps        | Leaflet + OpenStreetMap             | 100% free, no API key    |
| Charts      | Chart.js + react-chartjs-2          | Rich visualizations      |
| PDF         | jsPDF + jspdf-autotable             | Client-side PDF gen      |
| Real-time   | WebSocket (ws library) + polling    | Live slot updates        |
| Email       | Nodemailer (Gmail SMTP)             | Free email sending       |
| Hosting     | Vercel (frontend) + Render (backend)| Free tier available      |

---

## ✨ Features

### Authentication System
- User Signup, Login, Logout
- Forgot Password with email token (10-min expiry)
- Password reset via secure token link
- Role-based access control: `user` / `admin`
- JWT stored in localStorage, verified on every request

### Dynamic Website Pages
- **Home** — Hero section, live station preview, feature highlights
- **About** — Mission, team, values, stats
- **Contact** — Form stored in database, subject categories
- **Stations** — Search by city, filter by vehicle type, available-only toggle
- **Map View** — OpenStreetMap with color-coded markers and popups
- **Navbar** — Auth-aware with user dropdown, dark mode toggle

### User Dashboard
- Total energy consumed (kWh) with CO₂ savings
- Total amount spent and session count
- Energy consumption chart (daily/weekly/monthly)
- Spending bar chart
- Recent booking table

### Booking System
- View all slots with real-time status (available/occupied/maintenance)
- Select vehicle type (2W/3W/4W/HV)
- Choose connector type and power output
- Pick start/end time with live cost estimation
- Booking confirmation email sent automatically

### Billing System
- Full billing history with pagination
- GST (18%) calculation on every bill
- Download invoice as PDF with complete details
- Auto-generated bill numbers (EVC-timestamp-XXXX)

### Energy Monitoring
- Chart.js line chart for energy consumption
- Bar chart for spending over time
- Data aggregated by day, week, or month

### Map Integration
- OpenStreetMap via react-leaflet (no API key required)
- Green markers = available, Red markers = full
- Click any marker for station details + Book Now button
- Detect user's current location (browser Geolocation API)

### Admin Panel
- Overview: total users, stations, revenue, energy dispensed
- Monthly revenue and energy charts
- Recent bookings table
- Station management: update price, deactivate
- User management: activate/deactivate accounts

---

## 🗄️ Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "string (bcrypt hashed)",
  "role": "user | admin",
  "phone": "string",
  "vehicleType": "2W | 3W | 4W | HV",
  "isActive": "boolean",
  "totalEnergyConsumed": "number (kWh)",
  "totalAmountSpent": "number (₹)",
  "resetPasswordToken": "string (hashed)",
  "resetPasswordExpire": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### ChargingStations Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "location": {
    "type": "Point",
    "coordinates": ["longitude", "latitude"]
  },
  "slots": [{
    "_id": "ObjectId",
    "slotNumber": "A1",
    "connectorType": "Type1 | Type2 | CCS | CHAdeMO | GB/T",
    "powerOutput": "number (kW)",
    "status": "available | occupied | maintenance",
    "currentBookingId": "ObjectId | null"
  }],
  "totalSlots": "number",
  "availableSlots": "number",
  "pricePerUnit": "number (₹/kWh)",
  "supportedVehicles": ["2W", "3W", "4W", "HV"],
  "amenities": ["WiFi", "Restroom", "Cafe"],
  "rating": "number (0-5)",
  "totalEnergyDispensed": "number (kWh)",
  "totalRevenue": "number (₹)",
  "isActive": "boolean"
}
```

### Bookings Collection
```json
{
  "_id": "ObjectId",
  "user": "ObjectId -> User",
  "station": "ObjectId -> ChargingStation",
  "slotId": "string",
  "slotNumber": "A1",
  "vehicleType": "2W | 3W | 4W | HV",
  "vehicleNumber": "string",
  "scheduledStart": "Date",
  "scheduledEnd": "Date",
  "actualStart": "Date",
  "actualEnd": "Date",
  "status": "pending | active | completed | cancelled",
  "energyConsumed": "number (kWh)",
  "estimatedCost": "number (₹)",
  "connectorType": "string"
}
```

### Billing Collection
```json
{
  "_id": "ObjectId",
  "user": "ObjectId -> User",
  "booking": "ObjectId -> Booking",
  "station": "ObjectId -> ChargingStation",
  "billNumber": "EVC-1706123456-0001",
  "energyConsumed": "number (kWh)",
  "pricePerUnit": "number (₹/kWh, locked at session time)",
  "subtotal": "number",
  "taxRate": 18,
  "taxAmount": "number",
  "totalAmount": "number",
  "paymentStatus": "pending | paid | failed | refunded",
  "paymentMethod": "online | cash | wallet",
  "chargingDuration": "number (minutes)",
  "sessionStart": "Date",
  "sessionEnd": "Date",
  "stationName": "string (denormalized)",
  "vehicleType": "string"
}
```

### Contact Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "phone": "string",
  "subject": "string",
  "message": "string",
  "status": "unread | read | replied",
  "adminReply": "string",
  "repliedAt": "Date"
}
```

---

## 🌐 API Endpoints

### Auth Routes — `/api/auth`
| Method | Endpoint               | Access  | Description              |
|--------|------------------------|---------|--------------------------|
| POST   | `/signup`              | Public  | Register new user        |
| POST   | `/login`               | Public  | Login + get JWT token    |
| GET    | `/me`                  | Private | Get current user info    |
| PUT    | `/profile`             | Private | Update profile           |
| PUT    | `/update-password`     | Private | Change password          |
| POST   | `/forgot-password`     | Public  | Send password reset email|
| PUT    | `/reset-password/:token`| Public | Reset password           |

### Station Routes — `/api/stations`
| Method | Endpoint            | Access | Description              |
|--------|---------------------|--------|--------------------------|
| GET    | `/`                 | Public | Get all stations (with filters)|
| GET    | `/nearby`           | Public | Get nearby (lat/lng/radius)|
| GET    | `/:id`              | Public | Get station details      |
| POST   | `/`                 | Admin  | Create new station       |
| PUT    | `/:id`              | Admin  | Update station           |
| DELETE | `/:id`              | Admin  | Deactivate station       |
| PUT    | `/:id/slots/:slotId`| Admin  | Update slot status       |

### Booking Routes — `/api/bookings`
| Method | Endpoint            | Access | Description              |
|--------|---------------------|--------|--------------------------|
| POST   | `/`                 | User   | Create booking           |
| GET    | `/my`               | User   | Get my bookings          |
| GET    | `/:id`              | User   | Get booking details      |
| PUT    | `/:id/cancel`       | User   | Cancel booking           |
| PUT    | `/:id/complete`     | Admin  | Complete + generate bill |
| GET    | `/`                 | Admin  | Get all bookings         |

### Billing Routes — `/api/billing`
| Method | Endpoint            | Access | Description              |
|--------|---------------------|--------|--------------------------|
| GET    | `/my`               | User   | My billing history       |
| GET    | `/analytics`        | User   | Energy analytics data    |
| GET    | `/:id`              | User   | Single bill details      |
| GET    | `/`                 | Admin  | All bills with stats     |

### Admin Routes — `/api/admin`
| Method | Endpoint                       | Access | Description          |
|--------|--------------------------------|--------|----------------------|
| GET    | `/analytics`                   | Admin  | Dashboard metrics    |
| GET    | `/users`                       | Admin  | List all users       |
| PUT    | `/users/:id/toggle-status`     | Admin  | Activate/deactivate  |
| PUT    | `/pricing`                     | Admin  | Update pricing       |

### Contact Routes — `/api/contact`
| Method | Endpoint   | Access | Description           |
|--------|------------|--------|-----------------------|
| POST   | `/`        | Public | Submit contact form   |
| GET    | `/`        | Admin  | Get all submissions   |
| PUT    | `/:id`     | Admin  | Update status/reply   |

### Health Check
```
GET /api/health
```

### WebSocket
```
ws://localhost:5000/ws
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (Atlas account or local MongoDB 6+)
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/vaibhavjagtap1/sample.git
cd sample
```

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials (see Environment Variables section)
nano .env  # or use VS Code: code .env

# Start development server
npm run dev
```

The API server runs at: **http://localhost:5000**

### Step 3: Seed the Database
```bash
# Make sure your .env has a valid MONGODB_URI first
node src/scripts/seed.js
```

This creates:
- 5 sample charging stations in Bangalore
- 1 admin account: admin@evcharging.com / Admin@123
- 1 test user: user@evcharging.com / User@123

### Step 4: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# VITE_API_URL defaults to /api (uses Vite proxy to localhost:5000)

# Start development server
npm run dev
```

The app runs at: **http://localhost:5173**

### Step 5: Access the App
- Open **http://localhost:5173** in your browser
- Login with demo credentials or create a new account

---

## 🌍 Deployment Guide

### Frontend → Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   ```
   VITE_API_URL = https://your-app.onrender.com/api
   VITE_WS_URL = wss://your-app.onrender.com/ws
   ```
5. Click **Deploy**

### Backend → Render (Free Tier)

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Runtime**: Node
4. Add all environment variables (from `.env.example`)
5. Click **Create Web Service**

> **Note**: Render free tier sleeps after 15 min inactivity. First request may be slow.

### MongoDB → Atlas (Free)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create Organization → New Project → Build a Database → Free (M0 Sandbox)
3. Choose region closest to your Render server
4. Create database user (username + password)
5. Network Access → Add IP Address → Allow from anywhere (0.0.0.0/0)
6. Get connection string → Replace in `MONGODB_URI`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ev-charging?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_long_random_secret_here_at_least_32_chars
JWT_EXPIRE=7d

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=yourapp@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # Gmail App Password (not regular password)
EMAIL_FROM=EVCharge <yourapp@gmail.com>

# Frontend URL (for CORS and email links)
FRONTEND_URL=https://your-app.vercel.app

# Default admin credentials (used by seed script)
ADMIN_EMAIL=admin@evcharging.com
ADMIN_PASSWORD=Admin@123

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Getting Gmail App Password:**
1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account → Security → App Passwords
3. Generate a new password for "Mail"
4. Use the 16-character code as `EMAIL_PASS`

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_WS_URL=wss://your-backend.onrender.com/ws
VITE_APP_NAME=EV Charging System
```

---

## 👤 Demo Credentials

After running `node src/scripts/seed.js`:

| Role  | Email                  | Password  | Access           |
|-------|------------------------|-----------|------------------|
| Admin | admin@evcharging.com   | Admin@123 | Full admin panel |
| User  | user@evcharging.com    | User@123  | Dashboard        |

---

## 🛡️ Security Features

- ✅ Password hashing with bcryptjs (salt rounds: 10)
- ✅ JWT access tokens with configurable expiry
- ✅ Rate limiting (100 req/15 min per IP)
- ✅ Helmet.js security headers
- ✅ Input validation with express-validator
- ✅ CORS restricted to frontend URL
- ✅ Admin-only routes protected by role middleware
- ✅ Password reset tokens hashed with SHA-256
- ✅ Reset tokens expire after 10 minutes

---

## 📄 License

MIT License — Free to use for educational and commercial purposes.

---

Made with ⚡ for India's EV revolution
