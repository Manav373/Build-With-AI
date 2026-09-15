# Database Schema & Model Catalog

KrishiAI utilizes an optimized database schema managed with SQLAlchemy ORM and auto-synced across domains.

## 1. Shared & Farmer Domain Tables

| Table Name | Model | Domain | Description |
|---|---|---|---|
| `farmer_locations` | `FarmerLocation` | Farmer | GPS coordinates, district/taluka, and source channel |
| `market_prices` | `MarketRecord` | Farmer/Shared | Gov APMC mandi daily modal, min, and max price records |
| `market_geocodes` | `MarketGeocode` | Farmer/Shared | Geocoded latitude/longitude cache for mandi marketing yards |
| `call_history` | `CallHistory` | Farmer | Vapi AI Kisan call center inbound/outbound audio transcripts |
| `community_messages` | `CommunityMessage` | Farmer | Real-time community discussion and peer-to-peer chat |

## 2. Vendor Domain Tables

| Table Name | Model | Description |
|---|---|---|
| `vendors` | `Vendor` | Vendor profiles, KYC status, business identity, banking details |
| `vendor_documents` | `VendorDocument` | Trade licenses, GST, APMC permits, Aadhaar documents |
| `products` | `Product` | Input catalog (seeds, fertilizers, bio-stimulants, machinery) |
| `buying_requirements` | `BuyingRequirement` | Bulk crop purchasing tenders with price bounds |
| `farmer_applications` | `FarmerApplication` | Farmer bids on buying requirements with negotiation logs |
| `customer_orders` | `CustomerOrder` | Product sales orders placed by farmers |
| `procurement_orders` | `ProcurementOrder` | Completed crop procurement orders with warehouse inspection |
| `reviews` | `Review` | Ratings and reviews for vendors and products |
| `vendor_notifications` | `VendorNotification` | Real-time vendor alerts (orders, bids, disputes) |
| `contract_farming_agreements` | `ContractFarmingAgreement` | Guaranteed MSP contract farming agreements |
| `bulk_rfqs` | `BulkRFQ` | Institutional bulk demand RFQ tenders |
| `logistics_shipments` | `LogisticsShipment` | Fleet tracking, driver assignment, and e-way bills |
| `ai_quality_inspections` | `AIQualityInspection` | Computer vision crop quality grading and moisture analysis |
| `vendor_payouts` | `VendorPayout` | Payout history, UTR numbers, and settlement ledger |
