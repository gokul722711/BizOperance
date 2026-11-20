# BIZOPERANCE
### Generalized Business Operations & Digitalization Showcase

**BizOperance** is a modern, generalized business operations management platform designed as a commercial portfolio showcase for a digital solutions and software development business. It demonstrates how diverse businesses—such as retail stores, wholesale distributors, agencies, consultancies, educational institutions, and manufacturers—can centralize and digitalize their daily operations through customized software.

---

## Key Capabilities & Modules

1. **Dashboard Overview**
   - Live KPI cards: Total Revenue, Total Orders, Active Customers, Pending Orders.
   - Interactive revenue trend area chart with selectable time windows (7 Days, 30 Days, 90 Days).
   - Order fulfillment distribution chart (Completed, Processing, Pending, Cancelled).
   - Recent transactional orders table with direct link to view order details.
   - Top products and services ranked by volume and revenue.
   - Chronological recent system activity log and low-stock warning banners.

2. **Orders & Transactions**
   - Full order management with searchable, filterable table (by status, payment status, date).
   - Multi-item **Create Order workflow** with automatic subtotal, demo tax rate, and grand total calculations.
   - Order detail drawer with customer info, line items, and live status actions (*Process*, *Complete*, *Cancel* with stock restoration).
   - Payment status tracking (*Paid*, *Pending*, *Partially Paid*).

3. **Products & Inventory**
   - Product and service catalog management with SKU, category, pricing, stock levels, and safety thresholds.
   - Automatic stock status indicators: **In Stock**, **Low Stock**, and **Out of Stock**.
   - Quick **Stock Adjustment dialog** supporting positive/negative unit increments or setting exact counts with audit reasons.
   - Low-stock warning banners when inventory items reach or fall below threshold.

4. **Customer Management**
   - Centralized directory for both **Individual** and **Business** accounts.
   - Client profile modal displaying lifetime order counts, total revenue contribution, and recent order history.
   - Full CRUD operations with search and classification filtering.

5. **Tasks & Workflow**
   - Operational task tracking with assigned team members, priority flags (*Low*, *Medium*, *High*), and due dates.
   - **Kanban Board** (*To Do*, *In Progress*, *Completed*) and **Table List** view modes.
   - Visual alert badges for overdue milestones.

6. **Reports & Analytics**
   - Revenue and order volume trend charts.
   - Average Order Value (AOV) and customer acquisition metrics.
   - Product performance ranking.
   - **One-click CSV Exports** for Orders, Products, and Customers datasets.

7. **Business Settings & Customization**
   - Configurable business name, operations email, phone, and headquarters address.
   - Localized currency selector (`$`, `€`, `£`, `₹`, `¥`, `A$`, `CHF`) with live preview.
   - Default tax rate and low-stock threshold configuration.
   - **Reset Demo Data** mechanism: instantly restores all operational records back to a pristine baseline state between prospective client meetings.

8. **Global Search & Notifications**
   - Global search dialog (`Cmd+K` / `Ctrl+K`) categorizing results across Orders, Customers, Products, and Tasks.
   - Header notification dropdown with unread badge counters and event logs.

---

## Strict Technology Architecture

- **Frontend**:
  - React 18
  - **JavaScript ONLY** (No TypeScript anywhere: `.jsx` and `.js` exclusively)
  - Vite
  - Tailwind CSS
  - React Router v6
  - Lucide React
  - Recharts
  - Axios
- **Backend**:
  - Python 3.15
  - Django 6.1
  - Django REST Framework (DRF)
  - django-cors-headers
  - PostgreSQL database persistence (`psycopg2-binary`)
  - Modular Django architecture: `core`, `customers`, `products`, `orders`, `tasks`, `analytics`, `business_settings`.

---

## Quickstart & Local Setup

### 1. Prerequisites
- **Python 3.10+** (Python 3.15 verified)
- **Node.js 18+** & **npm**
- **PostgreSQL** running locally

### 2. Database Setup
Create the PostgreSQL database and user:
```bash
# Example psql commands:
CREATE USER bizoperance WITH PASSWORD 'bizoperance' CREATEDB;
CREATE DATABASE bizoperance_db OWNER bizoperance;
```

### 3. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install django djangorestframework django-cors-headers psycopg2-binary python-dotenv

# Run database migrations
python manage.py migrate

# Seed demonstration data
python manage.py seed_demo --clear

# Start backend API server
python manage.py runserver 127.0.0.1:8000
```
Backend API will be running at `http://127.0.0.1:8000/api/`.

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
Frontend will be running at `http://127.0.0.1:5173/`.

### 5. Unified Startup Script
You can also launch both services together:
```bash
chmod +x start.sh
./start.sh
```

---

## Demonstration Walkthrough Checklist

During a client presentation, follow this sequence:
1. **Dashboard**: Highlight real-time KPI metrics, the revenue curve for 7d/30d/90d, and the low-stock warning banner.
2. **Global Search**: Press `⌘K` or click the search bar, type `Acme`, and navigate directly to customer records.
3. **Create Order**: Open *Orders* -> click *New Order*. Choose a customer, select multiple products, adjust quantities, note the live tax and subtotal computation, and submit.
4. **Order Status Progression**: Click *View* on the new order. Click *Process*, then *Complete*. Observe how inventory automatically updates.
5. **Adjust Inventory**: Open *Products* -> click *Adjust* on any item. Add 10 units with the reason "Restock shipment".
6. **Task Kanban**: Open *Tasks*. Move tasks between *To Do*, *In Progress*, and *Completed*. Note overdue indicators.
7. **Analytics & Export**: Open *Reports*. View the AOV and product rankings. Click *Export CSV* to download live tabular data.
8. **Settings & Customization**: Open *Settings*. Switch currency to `€` or `₹` to showcase multi-currency readiness.
9. **Reset Demo**: Click *Reset Demo* in the header or in Settings to return the system to its initial baseline state.
