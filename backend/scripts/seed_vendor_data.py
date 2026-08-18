"""
Seed Mock Vendor Data — KrishiAI Multi-Vendor Marketplace
Seeds verified mock vendor accounts, products, buying requirements, tenders, logistics, and payout history.
"""
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import SessionLocal, engine, Base
from app.models.vendor import (
    Vendor, VendorDocument, Product, BuyingRequirement, FarmerApplication,
    CustomerOrder, ProcurementOrder, Review, VendorNotification,
    ContractFarmingAgreement, BulkRFQ, LogisticsShipment, AIQualityInspection, VendorPayout,
    VendorType, VendorStatus, RequirementStatus, ProductStatus
)

def seed_vendor_data():
    db = SessionLocal()
    try:
        print("[Seed] Syncing DB metadata...")
        Base.metadata.create_all(bind=engine)

        # 1. Main Guest/Default Hybrid Vendor Profile
        guest_vendor = db.query(Vendor).filter(Vendor.clerk_user_id == "guest_user").first()
        if not guest_vendor:
            print("[Seed] Creating primary Hybrid Mock Vendor profile for 'guest_user'...")
            guest_vendor = Vendor(
                clerk_user_id="guest_user",
                vendor_type=VendorType.HYBRID,
                status=VendorStatus.VERIFIED,
                is_verified=True,
                is_trusted=True,
                is_premium=True,
                trust_score=96,
                rating=4.9,
                total_reviews=128,
                verified_at=datetime.utcnow() - timedelta(days=90),
                
                # Business Identity
                business_name="MahaKrishi Agrotech & Crop Hub",
                owner_name="Rajeshwar Deshmukh",
                tagline="Premier Crop Procurement & Certified Seed/Fertilizer Distributor",
                business_description="Leading integrated agricultural hub providing high-germination seeds, bio-fertilizers, and bulk farm-gate crop procurement services across Maharashtra.",
                business_category="Agri Inputs & Grain Procurement",
                year_established="2014",
                number_of_employees="25-50",
                gst_number="27AAACM4829K1Z4",

                # Identity & License
                id_proof_type="aadhaar",
                id_proof_number="9842-1048-2914",
                trade_license_type="apmc",
                trade_license_number="APMC-PUNE-2018-9482",

                # Contact
                phone="9823011482",
                secondary_phone="020-26984821",
                whatsapp_number="9823011482",
                email="vendor_hybrid@krishiai.com",
                website="https://mahakrishi-agrotech.com",

                # Address
                street_address="Plot 42, APMC Market Yard, Hadapsar",
                village_city="Pune",
                taluka="Haveli",
                district="Pune",
                state="Maharashtra",
                pincode="411028",
                latitude=18.5204,
                longitude=73.8567,

                # Images
                profile_image="https://images.unsplash.com/photo-1595838788320-7798150490b4?w=500&auto=format&fit=crop&q=60",
                cover_image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=60",

                # Services & Capabilities
                service_areas=["Pune", "Nashik", "Satara", "Solapur", "Ahmednagar"],
                languages_spoken=["Hindi", "Marathi", "English"],
                crops_of_interest=["Wheat", "Cotton", "Soybean", "Maize", "Onion"],
                procurement_capacity_mt=15000.0,
                warehouse_locations=[
                    {"name": "Hadapsar Central Cold Storage", "city": "Pune", "capacity_mt": 10000},
                    {"name": "APMC Warehouse #4", "city": "Nagpur", "capacity_mt": 5000}
                ],
                product_categories=["Seeds", "Fertilizers", "Pesticides", "Farm Tools", "Irrigation Equipment"],
                store_open_time="08:00 AM",
                store_close_time="08:00 PM",
                weekly_holidays=["Sunday"],
                delivery_available=True,
                delivery_radius_km=75,

                # Stats
                total_products=12,
                total_orders=340,
                total_procurement_orders=85,
                farmers_served=1420,

                # Bank Details
                bank_account_name="MahaKrishi Agrotech Pvt Ltd",
                bank_account_number="918020048291482",
                bank_ifsc_code="HDFC0000482",
                bank_name="HDFC Bank (Hadapsar Branch)",
                return_policy="7-Day replacement for undamaged sealed agricultural input packages.",
                refund_policy="100% refund processed within 48 hours for failed crop inspections or defective stock."
            )
            db.add(guest_vendor)
            db.commit()
            db.refresh(guest_vendor)
            print(f"[Seed] Guest Hybrid Vendor created with ID: {guest_vendor.id}")
        else:
            print(f"[Seed] Guest Hybrid Vendor already exists (ID: {guest_vendor.id}). Updating status to VERIFIED.")
            guest_vendor.status = VendorStatus.VERIFIED
            guest_vendor.is_verified = True
            db.commit()

        v_id = guest_vendor.id

        # 2. Seed Products
        if db.query(Product).filter(Product.vendor_id == v_id).count() == 0:
            print("[Seed] Adding seed products...")
            products = [
                Product(
                    vendor_id=v_id,
                    status=ProductStatus.PUBLISHED,
                    name="Hybrid Wheat Seed (Lok-1 High Yield)",
                    description="Certified disease-resistant high germination Lok-1 wheat seed suitable for irrigated land.",
                    category="Seeds",
                    sub_category="Cereal Seeds",
                    brand="MahaKrishi Gold",
                    mrp=1450.0,
                    selling_price=1280.0,
                    unit="per 40kg bag",
                    min_order_qty=1,
                    stock_quantity=250,
                    key_features=["98% Germination", "Rust Resistant", "High Protein"],
                    suitable_crops=["Wheat"],
                    application_season="Rabi",
                    delivery_options="both",
                    rating=4.8,
                    total_reviews=42,
                    total_sold=180
                ),
                Product(
                    vendor_id=v_id,
                    status=ProductStatus.PUBLISHED,
                    name="Organic NPK Bio-Fertilizer 50kg",
                    description="Enriched eco-friendly bio-fertilizer promoting soil health and root expansion.",
                    category="Fertilizers",
                    sub_category="Organic Bio-Fertilizer",
                    brand="KrishiBio",
                    mrp=950.0,
                    selling_price=820.0,
                    unit="per 50kg bag",
                    min_order_qty=2,
                    stock_quantity=400,
                    key_features=["100% Organic", "Soil Microbe Enhancer", "Zero Chemical Residual"],
                    suitable_crops=["Cotton", "Sugarcane", "Wheat", "Soybean"],
                    application_season="All-Season",
                    delivery_options="both",
                    rating=4.9,
                    total_reviews=35,
                    total_sold=310
                ),
                Product(
                    vendor_id=v_id,
                    status=ProductStatus.PUBLISHED,
                    name="Drip Irrigation Inline Kit (1 Acre)",
                    description="Complete heavy-duty drip line system with filters, valves, and 16mm drippers.",
                    category="Irrigation Equipment",
                    brand="AquaDrip Pro",
                    mrp=12500.0,
                    selling_price=10800.0,
                    unit="per acre kit",
                    min_order_qty=1,
                    stock_quantity=30,
                    key_features=["UV Stabilized Pipe", "Anti-Clogging Drippers", "Save 60% Water"],
                    suitable_crops=["Vegetables", "Sugarcane", "Cotton"],
                    application_season="All-Season",
                    delivery_options="home_delivery",
                    rating=4.7,
                    total_reviews=19,
                    total_sold=45
                )
            ]
            db.add_all(products)
            db.commit()
            print("[Seed] Seed products added successfully.")

        # 3. Seed Buying Requirements
        if db.query(BuyingRequirement).filter(BuyingRequirement.vendor_id == v_id).count() == 0:
            print("[Seed] Adding buying requirements...")
            reqs = [
                BuyingRequirement(
                    vendor_id=v_id,
                    requirement_code="BR-2026-08-1001",
                    status=RequirementStatus.ACTIVE,
                    crop_name="Cotton",
                    crop_variety="Shankar-6 / BT Cotton",
                    quantity_required=1200.0,
                    quantity_unit="quintal",
                    quality_grade="Grade A+",
                    max_moisture_percent=8.5,
                    min_price=7100.0,
                    max_price=7600.0,
                    price_unit="per quintal",
                    procurement_location="Hadapsar Warehouse",
                    pickup_district="Pune",
                    pickup_state="Maharashtra",
                    pickup_radius_km=100,
                    valid_from=datetime.utcnow() - timedelta(days=2),
                    valid_to=datetime.utcnow() + timedelta(days=28),
                    payment_terms="on_pickup",
                    transport_provided=True,
                    special_instructions="Moisture below 8.5% qualifies for ₹200/quintal Grade A+ bonus."
                ),
                BuyingRequirement(
                    vendor_id=v_id,
                    requirement_code="BR-2026-08-1002",
                    status=RequirementStatus.ACTIVE,
                    crop_name="Soybean",
                    crop_variety="JS-335",
                    quantity_required=800.0,
                    quantity_unit="quintal",
                    quality_grade="Grade A",
                    max_moisture_percent=10.0,
                    min_price=4600.0,
                    max_price=4950.0,
                    price_unit="per quintal",
                    procurement_location="APMC Yard Solapur",
                    pickup_district="Solapur",
                    pickup_state="Maharashtra",
                    pickup_radius_km=80,
                    valid_from=datetime.utcnow() - timedelta(days=5),
                    valid_to=datetime.utcnow() + timedelta(days=20),
                    payment_terms="within_24h",
                    transport_provided=False
                )
            ]
            db.add_all(reqs)
            db.commit()
            print("[Seed] Buying requirements added successfully.")

        # 4. Seed Bulk Tenders & Contracts
        if db.query(BulkRFQ).filter(BulkRFQ.vendor_id == v_id).count() == 0:
            print("[Seed] Adding bulk RFQ tenders & contract farming agreements...")
            tenders = [
                BulkRFQ(
                    vendor_id=v_id,
                    rfq_code="RFQ-2026-08-4821",
                    crop_name="Maize (Pioneer 1844)",
                    required_quantity_mt=500.0,
                    fulfilled_quantity_mt=120.0,
                    target_price_per_quintal=2250.0,
                    allowed_partial_bids=True,
                    minimum_bid_quantity_mt=10.0,
                    fpo_only=False,
                    delivery_deadline=datetime.utcnow() + timedelta(days=45),
                    warehouse_destination="Nagpur Cold Storage #4",
                    status="open"
                )
            ]
            contracts = [
                ContractFarmingAgreement(
                    vendor_id=v_id,
                    contract_code="CFA-2026-08-0012",
                    title="Export Quality Durum Wheat Contract Farming 2026-27",
                    crop_name="Durum Wheat",
                    target_quantity_mt=2500.0,
                    minimum_land_acres=2.0,
                    guaranteed_msp_per_quintal=2450.0,
                    bonus_per_quintal_grade_a=150.0,
                    advance_payment_percent=15.0,
                    input_support_provided=True,
                    duration_months=6,
                    start_date=datetime.utcnow(),
                    status="active",
                    total_enrolled_farmers=48,
                    terms_and_conditions="MahaKrishi provides 100% certified seed inputs at 15% subsidized cost upfront."
                )
            ]
            db.add_all(tenders)
            db.add_all(contracts)
            db.commit()
            print("[Seed] Tenders & Contracts added successfully.")

        # 5. Seed Logistics & Payouts
        if db.query(LogisticsShipment).filter(LogisticsShipment.vendor_id == v_id).count() == 0:
            print("[Seed] Adding logistics shipments & payout records...")
            shipments = [
                LogisticsShipment(
                    shipment_code="SHP-2026-08-102",
                    vendor_id=v_id,
                    driver_name="Ramesh Shinde",
                    driver_phone="9823011482",
                    vehicle_number="MH-12-PQ-9082",
                    vehicle_type="Tempo 407",
                    pickup_address="Village Khed, Taluka Junnar, Pune",
                    delivery_address="Hadapsar Central Warehouse, Pune",
                    total_distance_km=42.5,
                    eway_bill_number="EWAY-IN-94820194",
                    status="in_transit"
                )
            ]
            payouts = [
                VendorPayout(
                    payout_code="PAY-2026-08-01",
                    vendor_id=v_id,
                    amount=85000.0,
                    payout_type="sales_settlement",
                    status="processed",
                    bank_account_last4="1482",
                    utr_number="NEFT482910482"
                ),
                VendorPayout(
                    payout_code="PAY-2026-08-02",
                    vendor_id=v_id,
                    amount=150000.0,
                    payout_type="procurement_advance",
                    status="processed",
                    bank_account_last4="1482",
                    utr_number="NEFT921048210"
                )
            ]
            db.add_all(shipments)
            db.add_all(payouts)
            db.commit()
            print("[Seed] Logistics & Payout records added successfully.")

        print("\n========================================================")
        print("SUCCESS: Mock Vendor Data Seeding Complete!")
        print("========================================================")
        print("Vendor Business Name : MahaKrishi Agrotech & Crop Hub")
        print("Vendor Type          : HYBRID (Procurement & Seller)")
        print("Associated User ID   : guest_user")
        print("Status               : VERIFIED (Is Verified & Is Trusted)")
        print("Store Location       : Pune, Maharashtra")
        print("========================================================\n")

    except Exception as e:
        print(f"Error seeding vendor data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_vendor_data()
