# 🗄️ KrishiAI — Centralized Database Schema

## 1. Overview
All data tables reside in the centralized database layer `database/` and connect to a single unified SQLite/PostgreSQL database via `database/connection/connection.py`.

## 2. Table Groups
1. **Common / Core**:
   - `users`: User profiles, contact numbers, and global role assignments
   - `system_notifications`: Platform alerts and delivery status
2. **Farmer Domain**:
   - `farmer_locations`: Geospatial records and farmer village telemetry
   - `market_prices`: Mandi APMC commodity price trends
   - `market_geocodes`: Mandi coordinates for distance computation
   - `call_history`: Kisan voice assistant call transcripts
   - `community_messages`: Farmer forum chat messages
3. **Vendor Domain**:
   - `vendors`: Vendor business identity, GST, licenses, and ratings
   - `vendor_documents`: KYC files and approval status
   - `products`: Agricultural seeds, fertilizers, and machinery catalog
   - `buying_requirements`: Bulk crop procurement RFQs
   - `farmer_applications`: Farmer crop selling proposals
   - `customer_orders`: Direct input purchases
   - `procurement_orders`: Fulfilled crop purchase contracts
   - `ai_quality_inspections`: Grain grading and analysis reports
   - `logistics_shipments`: Dispatch fleet tracking
   - `vendor_payouts`: Bank UTR settlements
