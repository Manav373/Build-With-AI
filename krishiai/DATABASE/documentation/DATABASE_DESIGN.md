# 📐 KrishiAI — Database Design & Relationships

> **Entity Relationship Architecture of the Single Unified Database**

---

## 1. Relational Integrity Across Domains

In the KrishiAI platform, cross-domain interactions are directly backed by foreign keys and relational integrity:

1. **User Identity (`users`)**:
   - Every actor (Farmer, Vendor, Admin) has a record in `users`.
   - `user_id` links to `farmer_locations`, `vendors`, and `complaints`.

2. **Crop Procurement & Marketplace (`buying_requirements` ➔ `farmer_applications`)**:
   - A Vendor creates a requirement (`buying_requirements.id`).
   - A Farmer applies to supply that requirement (`farmer_applications.requirement_id` ➔ `buying_requirements.id`).
   - Counter-offers and negotiations are linked by `application_id`.

3. **Orders & Escrow (`customer_orders`, `procurement_orders`)**:
   - Order records capture both `vendor_id` and `farmer_id`.
   - Admin monitors order escrow status (`PENDING`, `HELD`, `RELEASED`).

4. **Grievance Arbitration (`complaints`)**:
   - Complaints link the `complainant_id`, `defendant_id`, and `order_id`.
   - Admin updates resolution and audit logs.
