# 🎯 COMPLETE MIGRATION TODO LIST

## ✅ COMPLETED (Foundation)
- [x] Next.js 15 setup with TypeScript
- [x] MongoDB connection
- [x] Database models (User, Sales, Stock, Product, Customer)
- [x] Login API endpoint
- [x] Sales creation API (with discount & customer)
- [x] Customer search API
- [x] Stock list API
- [x] Login page UI
- [x] Dashboard page UI

---

## 🔥 PHASE 1: CORE SALES FUNCTIONALITY (Priority: CRITICAL)

### Chunk 1.1: Sell Cartons Page (Wholesale)
**Old Route:** `GET /wholesale`
**New Route:** `/sell/cartons`
**Files to migrate:**
- [ ] `views/wholesale.ejs` → `app/sell/cartons/page.tsx`
- [ ] `js/sellstock.js` → React component logic
- [ ] `js/dynamicupdate.js` → React hooks

**Features needed:**
- [ ] Product dropdown (from Stock collection)
- [ ] Quantity input (supports 0.5 increments)
- [ ] **NEW:** Discount input field
- [ ] **NEW:** Customer autocomplete dropdown
- [ ] Payment method checkboxes (Cash, Transfer, Card, Credit)
- [ ] Payment amount inputs
- [ ] Cart table (add/remove items)
- [ ] Total calculation (subtotal - discount)
- [ ] Submit to `/api/sales/create`

**API Endpoints needed:**
- [x] `GET /api/stock/list` (already created)
- [x] `POST /api/sales/create` (already created)
- [x] `GET /api/customers/search` (already created)

---

### Chunk 1.2: Sell Kilos Page (Retail)
**Old Route:** `GET /sell`
**New Route:** `/sell/kilos`
**Files to migrate:**
- [ ] `views/sell.ejs` → `app/sell/kilos/page.tsx`
- [ ] `js/addprodhandler.js` → React component logic

**Features needed:**
- [ ] Product dropdown (from Product collection - weight-based)
- [ ] Weight input (supports decimal)
- [ ] **NEW:** Discount input field
- [ ] **NEW:** Customer autocomplete dropdown
- [ ] Payment method checkboxes
- [ ] Cart table
- [ ] Total calculation
- [ ] Submit to `/api/sales/create-kilo`

**API Endpoints needed:**
- [ ] `GET /api/products/list` (need to create)
- [ ] `POST /api/sales/create-kilo` (need to create)

---

### Chunk 1.3: Sales History Page
**Old Route:** `GET /saleshistory`
**New Route:** `/sales/history`
**Files to migrate:**
- [ ] `views/saleshistory.ejs` → `app/sales/history/page.tsx`

**Features needed:**
- [ ] List all sales (with role-based filtering)
  - Worker/Admin: Today's sales only
  - Sadmin: All sales
- [ ] **NEW:** Show discount column
- [ ] **NEW:** Show customer name column
- [ ] Show sale_no (receipt number)
- [ ] Group by sharedid (receipt)
- [ ] Filter by date
- [ ] Filter by seller
- [ ] Filter by payment method
- [ ] Filter by sale type (Kilos/Cartons)
- [ ] Delete sale (admin/sadmin only)
- [ ] Delete all sales (admin/sadmin only)
- [ ] View receipt link

**API Endpoints needed:**
- [ ] `GET /api/sales/list` (need to create)
- [ ] `DELETE /api/sales/:id` (need to create)
- [ ] `DELETE /api/sales/all` (need to create)

---

## 📦 PHASE 2: INVENTORY MANAGEMENT (Priority: HIGH)

### Chunk 2.1: Stock Management Page (Cartons)
**Old Route:** `GET /viewstock`
**New Route:** `/stock`
**Files to migrate:**
- [ ] `views/allstock.ejs` → `app/stock/page.tsx`

**Features needed:**
- [ ] List all stock items
- [ ] Add new stock
- [ ] Edit stock
- [ ] Delete stock
- [ ] Low stock alerts
- [ ] Search/filter

**API Endpoints needed:**
- [x] `GET /api/stock/list` (already created)
- [ ] `POST /api/stock/create` (need to create)
- [ ] `PUT /api/stock/:id` (need to create)
- [ ] `DELETE /api/stock/:id` (need to create)

---

### Chunk 2.2: Product Management Page (Kilos)
**Old Route:** `GET /allproducts`
**New Route:** `/products`
**Files to migrate:**
- [ ] `views/allproducts.ejs` → `app/products/page.tsx`

**Features needed:**
- [ ] List all products (kilo-based)
- [ ] Add new product
- [ ] Edit product
- [ ] Delete product
- [ ] Weight tracking

**API Endpoints needed:**
- [ ] `GET /api/products/list` (need to create)
- [ ] `POST /api/products/create` (need to create)
- [ ] `PUT /api/products/:id` (need to create)
- [ ] `DELETE /api/products/:id` (need to create)

---

### Chunk 2.3: Add Stock Modal/Page
**Old Route:** `POST /stockupload`
**New Route:** API already exists, need UI

**Features needed:**
- [ ] Form to add stock
- [ ] Validation
- [ ] Success/error messages

---

## 🧾 PHASE 3: RECEIPTS & PRINTING (Priority: HIGH)

### Chunk 3.1: Receipt View Page
**Old Route:** `GET /receipt`
**New Route:** `/receipt`
**Files to migrate:**
- [ ] `views/receipt.ejs` → `app/receipt/page.tsx`

**Features needed:**
- [ ] Display receipt by sharedid
- [ ] **NEW:** Show discount on receipt
- [ ] **NEW:** Show customer name on receipt
- [ ] Show all items in transaction
- [ ] Show payment methods breakdown
- [ ] Show totals (subtotal, discount, final)
- [ ] Print button
- [ ] Delete receipt (sadmin only)

**API Endpoints needed:**
- [ ] `GET /api/sales/receipt/:sharedid` (need to create)
- [ ] `DELETE /api/sales/receipt/:sharedid` (need to create)

---

### Chunk 3.2: Printer Integration
**Old Routes:** 
- `GET /get-printers`
- `POST /print-text`
- `POST /generate-pdf-receipt`

**Files to migrate:**
- [ ] `routes/print-text.js` → API route
- [ ] `routes/pdf-receipt.js` → API route
- [ ] Printer detection logic

**Features needed:**
- [ ] List available printers
- [ ] Print receipt (thermal)
- [ ] Generate PDF receipt
- [ ] Printer settings

**API Endpoints needed:**
- [ ] `GET /api/printers/list` (need to create)
- [ ] `POST /api/printers/print` (need to create)
- [ ] `POST /api/printers/pdf` (need to create)

---

## 👥 PHASE 4: USER MANAGEMENT (Priority: MEDIUM)

### Chunk 4.1: Users List Page
**Old Route:** `GET /users`
**New Route:** `/users`
**Files to migrate:**
- [ ] `views/users.ejs` → `app/users/page.tsx`

**Features needed:**
- [ ] List all users (admin/sadmin only)
- [ ] Add new user
- [ ] Edit user
- [ ] Delete user
- [ ] Role management

**API Endpoints needed:**
- [ ] `GET /api/users/list` (need to create)
- [ ] `POST /api/users/create` (need to create)
- [ ] `PUT /api/users/:id` (need to create)
- [ ] `DELETE /api/users/:id` (need to create)

---

### Chunk 4.2: User Signup Page
**Old Route:** `GET /signup`
**New Route:** `/signup`
**Files to migrate:**
- [ ] `views/sign-up.ejs` → `app/signup/page.tsx`

**Features needed:**
- [ ] Signup form (sadmin only can access)
- [ ] Role selection
- [ ] Validation

---

### Chunk 4.3: Update User Page
**Old Route:** `GET /updateuser`
**New Route:** `/users/:id/edit`
**Files to migrate:**
- [ ] `views/updateuser.ejs` → `app/users/[id]/edit/page.tsx`

**Features needed:**
- [ ] Edit user form
- [ ] Role update
- [ ] Password change

---

## 👤 PHASE 5: CUSTOMER MANAGEMENT (Priority: MEDIUM)

### Chunk 5.1: Customers List Page
**New Feature** (didn't exist in old system)
**New Route:** `/customers`

**Features needed:**
- [ ] List all customers
- [ ] Search customers
- [ ] View customer purchase history
- [ ] Edit customer details
- [ ] Delete customer
- [ ] Customer statistics

**API Endpoints needed:**
- [ ] `GET /api/customers/list` (need to create)
- [x] `GET /api/customers/search` (already created)
- [ ] `GET /api/customers/:id` (need to create)
- [ ] `PUT /api/customers/:id` (need to create)
- [ ] `DELETE /api/customers/:id` (need to create)

---

## ⚙️ PHASE 6: SETTINGS & CONFIGURATION (Priority: LOW)

### Chunk 6.1: Settings Page
**Old Route:** `GET /settings`
**New Route:** `/settings`
**Files to migrate:**
- [ ] `views/settings.ejs` → `app/settings/page.tsx`

**Features needed:**
- [ ] Printer settings
- [ ] User profile settings
- [ ] System configuration

---

### Chunk 6.2: Dashboard Analytics
**Old Route:** `GET /dash`
**New Route:** `/analytics`
**Files to migrate:**
- [ ] `views/dash.ejs` → `app/analytics/page.tsx`

**Features needed:**
- [ ] Sales statistics
- [ ] Stock overview
- [ ] Product overview
- [ ] Charts/graphs

---

## 🔧 PHASE 7: ADDITIONAL FEATURES (Priority: LOW)

### Chunk 7.1: Filter/Search Functionality
**Old Route:** `GET /filter`
**Features needed:**
- [ ] Advanced sales filtering
- [ ] Date range picker
- [ ] Seller filter
- [ ] Payment method filter
- [ ] Sale type filter

---

### Chunk 7.2: Sold By Page
**Old Route:** `GET /solby`
**New Route:** `/sales/by-seller/:id`
**Features needed:**
- [ ] View sales by specific seller
- [ ] Seller statistics

---

### Chunk 7.3: Delete Operations
**Old Routes:**
- `GET /deleteone` (delete product)
- `GET /deletestock` (delete stock)
- `GET /deletesale` (delete sale)
- `GET /deleteuser` (delete user)
- `GET /deleteallsales` (delete all sales)
- `GET /deletesalesbydate` (delete sales by date)
- `GET /deletesalesbyreceipt` (delete receipt)

**All need to be converted to API routes**

---

## 🎨 PHASE 8: UI/UX IMPROVEMENTS (Priority: LOW)

### Chunk 8.1: Shared Components
- [ ] Create reusable components:
  - [ ] ProductSelector component
  - [ ] CustomerAutocomplete component
  - [ ] PaymentMethodSelector component
  - [ ] CartTable component
  - [ ] DiscountInput component
  - [ ] DatePicker component
  - [ ] Modal component
  - [ ] Toast notifications

---

### Chunk 8.2: Layout & Navigation
- [ ] Create main layout
- [ ] Navigation menu
- [ ] Breadcrumbs
- [ ] User menu
- [ ] Logout functionality

---

## 🔐 PHASE 9: AUTHENTICATION & SECURITY (Priority: MEDIUM)

### Chunk 9.1: Session Management
- [ ] Implement proper session handling
- [ ] JWT tokens
- [ ] Refresh tokens
- [ ] Session timeout

---

### Chunk 9.2: Role-Based Access Control
- [ ] Middleware for route protection
- [ ] Role-based UI rendering
- [ ] Permission checks

---

### Chunk 9.3: Password Security
- [ ] Implement bcrypt hashing
- [ ] Password reset functionality
- [ ] Password strength validation

---

## 📱 PHASE 10: RESPONSIVE DESIGN (Priority: LOW)

- [ ] Mobile-responsive layouts
- [ ] Touch-friendly UI
- [ ] Mobile navigation
- [ ] Tablet optimization

---

## 🧪 PHASE 11: TESTING & OPTIMIZATION (Priority: LOW)

- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states

---

## 📊 SUMMARY

### Total Tasks: ~150+
### Completed: 9 (6%)
### Remaining: ~141

### By Priority:
- **CRITICAL (Phase 1):** 3 chunks, ~25 tasks
- **HIGH (Phase 2-3):** 5 chunks, ~35 tasks
- **MEDIUM (Phase 4-5, 9):** 7 chunks, ~40 tasks
- **LOW (Phase 6-8, 10-11):** 10 chunks, ~41 tasks

---

## 🎯 RECOMMENDED EXECUTION ORDER

1. **Week 1:** Phase 1 (Sell Cartons, Sell Kilos, Sales History)
2. **Week 2:** Phase 3 (Receipts & Printing)
3. **Week 3:** Phase 2 (Stock & Product Management)
4. **Week 4:** Phase 4-5 (User & Customer Management)
5. **Week 5:** Phase 6-7 (Settings & Additional Features)
6. **Week 6:** Phase 8-11 (UI/UX, Security, Testing)

---

## 🚀 NEXT IMMEDIATE STEPS

**Start with Chunk 1.1: Sell Cartons Page**
This is the most critical feature and will establish patterns for the rest.

Ready to proceed? Say "start chunk 1.1" and I'll begin!
