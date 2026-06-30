# DesiKit – From Farm to Family 🌾🥛

DesiKit is a premium, high-scale farmer-centric quick-commerce marketplace designed to connect local dairy farmers and vegetable growers directly with consumers. It aims to deliver fresh, local produce while bypassing middle-agents to give farmers fair pricing and consumers raw, authentic quality.

---

## 🚀 Key Features

* **🐄 Premium Farm Sourcing**: Real-time identification of products linked directly to authenticated local farmers (e.g. Sahiwal Dairy, Krishna Farms).
* **🛵 Real-Time GPS Rider Sync (Socket.io)**: Smooth websocket tracking from the pickup farm point directly to the customer's doorstep with live coordinate indicators.
* **📱 Installable Progressive Web App (PWA)**: Completely responsive, stand-alone mobile installation support ("Add to Home Screen").
* **🔍 Fuzzy Search Engine**: Upgraded case-insensitive substring search (`$regex`) matching partial words instantly across names and descriptions.
* **📬 Transactional Mail system**: Standardized Gmail SMTP transactional emails for verification codes, logins, and order receipts.
* **💳 Wallet & Subscriptions**: Micro-wallet payments and recurring delivery slots for daily household dairy routines.

---

## 🛠️ Architecture & Stack

### Frontend (Client)
* **Core**: React.js & Vite (PWA configured)
* **Styling**: Tailored premium Tailwind UI
* **Maps**: Leaflet OpenStreetMap integrations
* **Sockets**: Socket.io Client

### Backend (Server)
* **Runtime**: Node.js & Express.js
* **Database**: MongoDB (Mongoose indexing configured for high traffic)
* **Real-time**: Socket.io Server
* **Authentication**: JWT Cookies & Bcrypt verification

---

## 📦 Setup & Installation

### 1. Database & Servers
Ensure your local MongoDB instance is running on port `27017`.

### 2. Configure Backend
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Edit the `.env` file with your credentials:
   ```env
   MONGODB_URI=mongodb://localhost:27017/desikit
   FRONTEND_URL=http://localhost:5173
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=desikitapp@gmail.com
   SMTP_PASS=tgmoanfpjmiwdexf
   SMTP_FROM="DesiKit" <desikitapp@gmail.com>
   PORT=8080
   ```
4. Run the seed script to set up mock accounts, farmers, and premium items:
   ```bash
   node seed.js
   ```
5. Start the backend:
   ```bash
   npm run dev
   ```

### 3. Configure Frontend
1. Navigate to the `client/` directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client:
   ```bash
   npm run dev
   ```

---

## ⚡ Deployment

### Backend (Render / Railway)
Set the root directory to `server/` and add your `.env` keys.

### Frontend (Vercel)
Set the root directory to `client/` and configure `VITE_API_URL` variable to point to your backend url. SPA redirects are automatically configured using `client/vercel.json`.
