import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")

sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, BASE_DIR)

print(f"Testing KrishiAI Modular Architecture Imports from: {BASE_DIR}")
errors = 0

# 1. Test Database Layer
try:
    from database.connection.connection import Base, engine, SessionLocal, get_db
    from database.models import (
        UserProfile, FarmerLocation, MarketRecord, CallHistory,
        Vendor, Product, BuyingRequirement, CustomerOrder, ProcurementOrder
    )
    print("  [OK] database.connection and database.models imported successfully")
except Exception as e:
    print(f"  [FAIL] database imports failed: {e}")
    errors += 1

# 2. Test Middleware Layer
try:
    from middleware.auth.auth_middleware import verify_token, get_current_user
    from middleware.authorization.roles import require_farmer, require_vendor, require_admin
    from middleware.error.error_handler import global_exception_handler
    from middleware.logging.request_logger import log_requests
    from middleware.upload.upload_validator import validate_uploaded_file
    print("  [OK] middleware layer imported successfully")
except Exception as e:
    print(f"  [FAIL] middleware imports failed: {e}")
    errors += 1

# 3. Test Farmer Domain Resources
try:
    from farmer.profile.model.profile_model import FarmerProfileDomain
    from farmer.profile.schema.profile_schema import FarmerProfileCreate, FarmerProfileResponse
    from farmer.constants.farmer_constants import MAJOR_CROPS, CROP_STAGES
    print("  [OK] farmer domain resources imported successfully")
except Exception as e:
    print(f"  [FAIL] farmer domain imports failed: {e}")
    errors += 1

# 4. Test Vendor Domain Resources
try:
    from vendor.profile.model.profile_model import VendorProfileDomain
    from vendor.profile.schema.profile_schema import VendorProfileCreate, VendorProfileResponse
    from vendor.constants.vendor_constants import DOCUMENT_TYPES, QUALITY_GRADES
    print("  [OK] vendor domain resources imported successfully")
except Exception as e:
    print(f"  [FAIL] vendor domain imports failed: {e}")
    errors += 1

# 5. Test Backend Farmer Controllers
try:
    from backend.farmer.controllers import (
        crop_controller, market_controller, ml_controller,
        schemes_controller, vapi_controller
    )
    print("  [OK] backend.farmer.controllers imported successfully")
except Exception as e:
    print(f"  [FAIL] backend.farmer.controllers imports failed: {e}")
    errors += 1

# 6. Test Backend Vendor Controllers
try:
    from backend.vendor.controllers import (
        vendor_controller, product_controller,
        requirement_controller, order_controller
    )
    print("  [OK] backend.vendor.controllers imported successfully")
except Exception as e:
    print(f"  [FAIL] backend.vendor.controllers imports failed: {e}")
    errors += 1

# 7. Test FastAPI App Entrypoint
try:
    from app.main import app
    print("  [OK] app.main FastAPI app imported successfully")
except Exception as e:
    print(f"  [FAIL] app.main import failed: {e}")
    errors += 1

if errors == 0:
    print("\nALL MODULAR ARCHITECTURE IMPORTS PASSED WITH ZERO ERRORS!")
    sys.exit(0)
else:
    print(f"\nCOMPLETED WITH {errors} ERRORS.")
    sys.exit(1)
