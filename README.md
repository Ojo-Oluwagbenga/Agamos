# AGAMOS — Salon · Beauty Store · Spa

> **A Production-Ready Full-Stack Luxury Beauty & Fashion Web Platform**  
> Engineered with **React 18 + TypeScript + Tailwind CSS** and **Django 5.x + Django REST Framework + Celery + Redis**.

---

## 💎 Brand Identity & Visual Aesthetic

- **Brand Name**: `AGAMOS`
- **Brand Descriptor**: `Salon · Beauty Store · Spa`
- **Flagship Suite**: `12A Victoria Island Luxury Boulevard, Lagos, Nigeria`
- **Visual Direction**: International haute luxury, timeless serif typography (*Playfair Display*, *Cormorant Garamond*), modern clean sans-serif (*Montserrat*), rich editorial black (`#111111`), dark gold accents (`#D4AF37`), subtle micro-animations, and glassmorphism.

---

## 🏛 Platform Architecture & Core Domains

The platform brings together 14 cohesive domains:

1. **Luxury Public Experience**:
   - Editorial Hero Section, Services Showcase, Beauty Store Carousel, Verified Testimonials, Flagship Operating Hours, and Private Dispatches Newsletter.
2. **Services & Treatments Catalog**:
   - Filterable categories (Haute Hair Artistry, Spa & Wellness, Nail Couture, Wardrobe Styling).
   - Duration tracking, turnover sanitation buffer times, dynamic pricing in Nigerian Naira (NGN).
3. **Concurrency-Safe Availability Engine**:
   - Dynamic real-time slot generation preventing double-booking.
   - Respects weekly standard hours, single/multi-guest capacity constraints, custom holiday date overrides, and maintenance slot blocks.
4. **Online Appointment Booking Flow**:
   - Multi-step booking wizard with 15-minute checkout reservation hold.
   - Optional in-session product formulation add-ons.
   - Guest booking support (no forced registration).
   - Instant Paystack payment gateway initialization.
5. **Cryptographic QR-Code Attendance Verification**:
   - Single-use HMAC-SHA256 tokens generated as high-resolution QR codes.
   - Camera-based live scanner for reception staff (`/admin/scanner`).
   - Atomic database locking on scan (`is_used=True`, `attended_at=timestamp`, status set to `ATTENDED`).
   - Anti-replay security rejecting re-scan attempts with audit timestamps.
6. **E-Commerce Beauty Store**:
   - Multi-image formulation galleries, SKU tracking, stock validation, and live price recalculation.
   - Client-side + server-synced slide-over shopping bag drawer.
   - Delivery method selection: Complimentary Flagship Store Pickup vs. Nationwide Courier Delivery with dynamic flat fee calculation.
7. **Inventory Management & Audit Ledger**:
   - Real-time stock decrement on confirmed checkout.
   - Low-stock threshold alerts (`is_low_stock` indicators).
   - Immutable audit ledger tracking all manual restocks, damages, shrinkage, and sales.
8. **Paystack Payments Gateway**:
   - Server-side amount computation (zero frontend trust).
   - HMAC-SHA512 webhook signature verification.
   - Built-in Mock Simulator for local test verification without external gateway keys.
9. **Authentication & User Registry**:
   - JWT-based authentication with auto-refreshing tokens.
   - Google OAuth 2.0 single sign-on.
   - Retroactive linking: when a guest registers with an email matching past guest bookings or orders, they are automatically unified into their client profile.
10. **Customer Sanctuary Portal**:
    - Dashboard overview, upcoming appointments with interactive QR pass modal, order receipts with tracking, and profile care preferences.
11. **Comprehensive Admin Portal**:
    - Real-time executive KPI metrics (Gross revenue, Monthly revenue, Today's agenda, Low-stock alerts).
    - Concierge camera QR scanner.
    - Full CRUD management for Services, Availability, Overrides, Products, Stock, Orders, and CMS Content.
12. **Automated Notifications**:
    - Luxury-branded HTML transactional email templates.
    - Celery tasks for booking confirmation dossiers, 24-hour appointment reminders, and receipt dispatch.

---

## ⚡ Quickstart & Local Development

### Prerequisites
- **Python 3.11+**
- **Node.js 18+ / 20+**
- **Redis** (optional for local testing; backend falls back gracefully)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed database with realistic luxury data
python seed_agamos.py

# Launch development server
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```

- **Website URL**: `http://127.0.0.1:5173/`
- **API Base URL**: `http://127.0.0.1:8000/api/`
- **Django Admin**: `http://127.0.0.1:8000/django-admin/`

---

## 🔑 Default Credentials & Seed Data

The database seeder (`seed_agamos.py`) provisions the following accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@agamos.com` | `AgamosLuxury2026!` | Full Admin Portal (`/admin`), QR Scanner, CRUD |
| **VIP Client** | `client@agamos.com` | `AgamosLuxury2026!` | Client Sanctuary (`/account`), Bookings, Orders |

---

## 🧪 Automated Testing

### Backend Unit & Integration Tests
```bash
cd backend
python manage.py test tests
```
*Tests verify atomic slot locking, double-booking prevention, Paystack payment finalization, QR scan/re-scan rejection, and stock reduction.*

### Full End-to-End System Suite
```bash
python test_e2e_integration.py
```
*Automated 10-domain verification across frontend, CMS, availability engine, booking hold, Paystack verification, QR attendance scanner, e-commerce checkout, atomic inventory deduction, and admin executive telemetry.*

---

## 🐳 Production Docker Deployment

To launch the complete production stack (Redis + Django Backend + Celery Worker + Celery Beat + React Nginx Frontend) with one command:

```bash
docker-compose up --build -d
```

---

## 🔒 Security & Data Integrity

- **Zero-Trust Pricing**: All totals, service prices, product addons, and delivery fees are recalculated on the server.
- **Atomic Database Locking**: Uses `select_for_update()` inside `transaction.atomic()` blocks to eliminate race conditions.
- **Cryptographic Signatures**: QR tokens and Paystack webhooks use HMAC verification.
- **CORS & CSRF Hardening**: Configured for strict domain origins.

---

&copy; 2026 AGAMOS. All rights reserved. *Salon · Beauty Store · Spa.*
