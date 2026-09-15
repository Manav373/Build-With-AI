import urllib.request
import json
import sys

endpoints = [
    ("Root Landing Check", "/"),
    ("Swagger API Docs", "/docs"),
    ("Mandi Market Prices", "/api/web/all-market-prices?limit=5"),
    ("Live Mandis Geo Near", "/api/web/live-mandis?lat=23.0&lon=72.0"),
    ("Farmer Locations Heatmap", "/api/farmer-locations"),
    ("Agronomy Analytics", "/api/analytics"),
    ("Government Schemes", "/api/schemes/list"),
    ("Government Schemes (all)", "/api/schemes/all"),
    ("Vendor Marketplace Listing", "/api/vendor/marketplace"),
    ("Marketplace Products", "/api/vendor/marketplace/products"),
    ("Marketplace Buying Tenders", "/api/vendor/marketplace/requirements"),
    ("Vendor Directory Filtered", "/api/vendor/list"),
    ("Vendor Tenders Listing", "/api/vendor/tenders"),
]

base_url = "http://127.0.0.1:8000"
print(f"\n=======================================================")
print(f"   KrishiAI Complete API & Connectivity Audit")
print(f"=======================================================")

passed = 0
failed = 0

for name, path in endpoints:
    url = base_url + path
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "KrishiAI-Audit"})
        with urllib.request.urlopen(req, timeout=15) as response:
            status = response.getcode()
            if 200 <= status < 400:
                print(f" [PASS] ({status}) {name:<30} -> {path}")
                passed += 1
            else:
                print(f" [WARN] ({status}) {name:<30} -> {path}")
    except Exception as e:
        print(f" [FAIL] (ERR) {name:<30} -> {path} | {e}")
        failed += 1

print(f"=======================================================")
print(f" Audit Result: {passed} PASSED | {failed} FAILED")
print(f"=======================================================\n")

if failed > 0:
    sys.exit(1)
else:
    sys.exit(0)
