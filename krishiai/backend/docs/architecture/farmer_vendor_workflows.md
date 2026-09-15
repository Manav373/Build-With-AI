# Farmer ↔ Vendor Workflows & Integration

## 1. Crop Procurement & Direct Selling Workflow

```
[ Vendor ]
   │
   ▼
Creates Buying Requirement (BR-XXXX)
   │
   ▼
Published to Market Stream
   │
   ▼
[ Farmer ]
   │
   ▼
Browses Buying Requirements (/farmer-browse-requirements)
   │
   ▼
Submits Application with Offered Price & Quantity
   │
   ▼
[ Vendor ]
   │
   ▼
Reviews Offer in Negotiation Hub (/vendor/negotiations)
   ├─► Accepts Offer
   └─► Counters Price
           │
           ▼
[ Farmer ] Accepts Counter Offer
           │
           ▼
[ System ] Generates Procurement Order (PO-XXXX)
           │
           ▼
Logistics & Pickup Scheduled
           │
           ▼
Warehouse AI Quality Inspection (Grade A/B/C)
           │
           ▼
Final Payment Processed to Farmer's Account
```

## 2. Agri-Input Marketplace Workflow

```
[ Vendor ]
   │
   ▼
Lists Seeds, Fertilizers, Tools (/vendor/products)
   │
   ▼
[ Farmer ]
   │
   ▼
Browses Catalog (/farmer/store)
   │
   ▼
Adds to Cart & Checks Out (/farmer/checkout)
   │
   ▼
Order Placed (ORD-XXXX)
   │
   ▼
[ Vendor ] Dispatches Order with Logistics Tracking
   │
   ▼
[ Farmer ] Receives Delivery & Leaves Review
```
