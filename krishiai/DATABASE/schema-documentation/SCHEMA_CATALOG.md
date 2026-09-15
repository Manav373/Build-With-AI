# 📜 KrishiAI — Master Database Schema Catalog

> **Catalog of All 30+ Relational Tables in the Unified KrishiAI Database**

---

## 1. Common Tables

### `users`
- `id` (INTEGER, PK): Auto-increment row ID.
- `user_id` (VARCHAR, UNIQUE): Unique identifier (e.g. phone/UUID).
- `name` (VARCHAR): User display name.
- `phone` (VARCHAR, INDEX): Mobile number used for OTP authentication.
- `email` (VARCHAR): Optional email address.
- `role` (VARCHAR): `'farmer'`, `'vendor'`, or `'admin'`.
- `is_verified` (BOOLEAN): Verification status.
- `created_at` (DATETIME): Timestamp of account registration.

### `system_notifications`
- `id` (INTEGER, PK)
- `recipient_id` (VARCHAR, INDEX): Target user ID.
- `title` (VARCHAR): Notification headline.
- `message` (TEXT): Notification payload.
- `is_read` (BOOLEAN): Read status flag.
- `created_at` (DATETIME)

---

## 2. Farmer Tables

### `farmer_locations`
- `id` (INTEGER, PK)
- `user_id` (VARCHAR, INDEX)
- `lat` (FLOAT), `lon` (FLOAT): Geospatial coordinates.
- `village`, `taluka`, `district`, `state`, `pincode` (VARCHAR): Administrative bounds.
- `timestamp` (DATETIME)

### `market_prices`
- `id` (INTEGER, PK)
- `state`, `district`, `market`, `commodity`, `variety` (VARCHAR, INDEX): APMC Mandi metadata.
- `arrival_date` (VARCHAR, INDEX): Date of mandi transaction report.
- `min_price`, `max_price`, `modal_price` (FLOAT): Prices per quintal in ₹.
- `created_at` (DATETIME)

### `market_geocodes`
- `id` (INTEGER, PK)
- `market` (VARCHAR, UNIQUE, INDEX): Physical mandi name.
- `district`, `state` (VARCHAR)
- `lat`, `lon` (FLOAT): Pinned GPS coordinate.

### `call_history`
- `id` (BIGINT, PK)
- `call_id` (VARCHAR, UNIQUE)
- `phone_number` (VARCHAR, INDEX)
- `assistant_type` (VARCHAR): e.g. `'kisan_voice'`
- `language` (VARCHAR): e.g. `'Hindi'`, `'English'`, `'Marathi'`
- `duration_seconds` (INTEGER)
- `summary`, `transcript` (TEXT): AI call notes.
- `recording_url` (VARCHAR)
- `status` (VARCHAR)

### `community_messages`
- `id` (INTEGER, PK)
- `user_id`, `author_name` (VARCHAR)
- `topic`, `content` (TEXT)
- `likes_count` (INTEGER)
- `created_at` (DATETIME)

---

## 3. Vendor Tables

### `vendors`
- `id` (INTEGER, PK)
- `vendor_id` (VARCHAR, UNIQUE, INDEX)
- `company_name` (VARCHAR)
- `vendor_type` (VARCHAR): `'RETAILER'`, `'WHOLESALER'`, `'PROCESSOR'`, `'EXPORTER'`
- `gstin`, `pan` (VARCHAR)
- `verification_status` (VARCHAR): `'PENDING'`, `'VERIFIED'`, `'SUSPENDED'`
- `rating` (FLOAT)

### `products`
- `id` (INTEGER, PK)
- `vendor_id` (VARCHAR, INDEX)
- `name`, `category` (VARCHAR): e.g. `'Seeds'`, `'Fertilizers'`, `'Pesticides'`
- `price` (FLOAT), `unit` (VARCHAR)
- `stock_quantity` (INTEGER)
- `moderation_status` (VARCHAR): `'APPROVED'`, `'FLAGGED'`, `'PENDING'`

### `buying_requirements` (Tenders)
- `id` (INTEGER, PK)
- `vendor_id` (VARCHAR, INDEX)
- `commodity`, `variety` (VARCHAR)
- `target_quantity_quintals` (FLOAT)
- `offered_price_per_quintal` (FLOAT)
- `delivery_deadline` (DATETIME)
- `status` (VARCHAR): `'OPEN'`, `'IN_NEGOTIATION'`, `'CLOSED'`

### `customer_orders` & `procurement_orders`
- `id` (INTEGER, PK)
- `order_id` (VARCHAR, UNIQUE, INDEX)
- `buyer_id`, `seller_id` (VARCHAR, INDEX)
- `total_amount` (FLOAT)
- `escrow_status` (VARCHAR): `'HELD'`, `'RELEASED'`, `'DISPUTED'`
- `fulfillment_status` (VARCHAR): `'PENDING'`, `'DISPATCHED'`, `'DELIVERED'`

---

## 4. Admin Tables

### `admin_audit_logs`
- `id` (INTEGER, PK)
- `admin_id` (VARCHAR, INDEX)
- `action` (VARCHAR): e.g. `'KYC_APPROVAL'`, `'ESCROW_RELEASE'`
- `target_entity` (VARCHAR), `target_id` (VARCHAR)
- `ip_address` (VARCHAR)
- `timestamp` (DATETIME)

### `complaints`
- `id` (INTEGER, PK)
- `complainant_id`, `defendant_id` (VARCHAR, INDEX)
- `order_id` (VARCHAR, NULLABLE)
- `category` (VARCHAR): `'QUALITY_DISPUTE'`, `'PAYMENT_DELAY'`, `'FRAUD'`
- `status` (VARCHAR): `'OPEN'`, `'INVESTIGATING'`, `'RESOLVED'`
- `arbitration_notes` (TEXT)
