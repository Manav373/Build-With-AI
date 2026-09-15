# 📦 SHARED — KrishiAI Monorepo Reusable Library

> **Centralized, Genuinely Reusable Components, API Client, Authentication, and Utilities**
> *(Consumed by FARMER, VENDOR, and ADMIN domains)*

---

## 📁 Package Structure

```
SHARED/
├── ui/                  # UI Components (Button, Input, Modal, Table, Loader, etc.)
├── api-client/          # UniversalApiClient & Domain API wrappers
├── auth/                # AuthProvider, ProtectedRoute, roleUtils, tokenManager
├── types/               # Common schemas & role definitions
├── utilities/           # Formatters (₹, phone, GSTIN), dateUtils, geoUtils
├── config/              # Master Ports (5173, 5174, 5175, 8000), domains, constants
├── components/          # Re-export bridge for flexible imports
├── constants/           # Platform constants
├── hooks/               # useDebounce, useLocalStorage
└── README.md
```

---

## 🚀 Usage in Domain Applications

### 1. Reusable UI Elements
```javascript
import { Button, Card, Modal, Preloader } from '@krishiai/ui';
// Or via @shared:
import { Button } from '@shared/ui';
```

### 2. Universal API Client
```javascript
import { UniversalApiClient, farmerApi, vendorApi, adminApi } from '@krishiai/api';
```

### 3. Authentication & Protected Routes
```javascript
import { AuthProvider, ProtectedRoute, useAuth } from '@krishiai/auth';
```

### 4. Utilities & Formatters
```javascript
import { formatCurrency, formatQuintals } from '@krishiai/utils';
```
