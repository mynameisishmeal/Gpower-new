# 🚀 Quick Reference Card

## Start the App
```bash
# Double-click this file:
START_APP.bat

# Or run:
npm run dev
```
**URL:** http://localhost:3000

---

## 📁 Key Files

### Models (Database)
- `models/User.ts` - User accounts
- `models/Sales.ts` - Sales with discount & customer ⭐
- `models/Stock.ts` - Inventory (cartons)
- `models/Product.ts` - Products (kilos)
- `models/Customer.ts` - Customer tracking ⭐

### API Routes
- `app/api/auth/login/route.ts` - Login
- `app/api/sales/create/route.ts` - Create sale ⭐
- `app/api/customers/search/route.ts` - Search customers ⭐
- `app/api/stock/list/route.ts` - Get stock

### Pages
- `app/page.tsx` - Home (redirects to login)
- `app/login/page.tsx` - Login page
- `app/dashboard/page.tsx` - Main dashboard

---

## 🆕 New Features

### 1. Discount Field
```typescript
// In sales creation:
{
  subtotal: 50000,    // Original
  discount: 10000,    // Discount
  total: 40000        // Final (subtotal - discount)
}
```

### 2. Customer Name
```typescript
// Search customers:
GET /api/customers/search?q=john

// In sales:
{
  customerName: "John Doe",
  customerId: "abc123"
}
```

---

## 🔧 Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Start production
npm start

# Install dependencies
npm install

# Check for errors
npm run build
```

---

## 🗄️ Database

**Connection:** MongoDB Atlas (same as old system)
**Database:** `mfvpos`

**Collections:**
- `users` - User accounts
- `sales` - All sales transactions
- `stocks` - Inventory (cartons)
- `products` - Products (kilos)
- `customers` - Customer database ⭐

---

## 📊 API Examples

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

### Create Sale with Discount
```bash
POST /api/sales/create
{
  "data": [
    {
      "Column0": "Fish",
      "Column1": "5000",
      "Column2": "10",
      "Column3": "50000"
    }
  ],
  "paymentDetails": [
    { "method": "cash", "amount": 40000 }
  ],
  "seller": "user@example.com",
  "discount": 10000,
  "customerName": "John Doe"
}
```

### Search Customers
```bash
GET /api/customers/search?q=john
```

---

## 🎨 UI Components (To Build)

### Sell Page Components Needed:
1. **Product Selector** - Dropdown with search
2. **Quantity Input** - Number input
3. **Discount Input** - Number input ⭐
4. **Customer Autocomplete** - Search dropdown ⭐
5. **Payment Methods** - Checkboxes with amounts
6. **Cart Table** - Show selected items
7. **Total Display** - Show subtotal, discount, final

---

## 🔐 Authentication

**Current:** localStorage-based
```typescript
// After login:
localStorage.setItem('user', JSON.stringify(userData));

// Get user:
const user = JSON.parse(localStorage.getItem('user'));

// Logout:
localStorage.removeItem('user');
```

---

## 🐛 Debugging

### Check MongoDB Connection
```typescript
// Should see in console:
"✅ MongoDB Connected Successfully"
```

### Check API Response
```typescript
// In browser console (F12):
fetch('/api/stock/list')
  .then(r => r.json())
  .then(console.log);
```

### Check Build
```bash
npm run build
# Should complete without errors
```

---

## 📝 TypeScript Types

```typescript
// Import types:
import { IUser, ISale, IStock, ICustomer } from '@/types';

// Use in components:
const [user, setUser] = useState<IUser | null>(null);
```

---

## 🎯 Next Steps

1. **Build Sell Cartons Page**
   - Copy structure from old `wholesale.ejs`
   - Add discount input
   - Add customer autocomplete
   - Connect to `/api/sales/create`

2. **Build Sell Kilos Page**
   - Similar to cartons
   - Weight-based calculations

3. **Build Sales History**
   - List all sales
   - Show discount column
   - Show customer names
   - Add filters

---

## 💡 Tips

- **Hot Reload:** Save file → Page updates automatically
- **TypeScript:** Hover over code for type hints
- **Console:** F12 to see errors and logs
- **API Test:** Use browser or Postman
- **Database:** Both old and new systems share data

---

## 📞 Help

**Documentation:**
- `README.md` - Getting started
- `MIGRATION_GUIDE.md` - Detailed migration
- `PROJECT_SUMMARY.md` - Complete overview
- This file - Quick reference

**Old System:** Still works at port 30120

---

## ✅ Status

- ✅ Foundation complete
- ✅ Database models ready
- ✅ API endpoints working
- ✅ Login & dashboard done
- 🚧 Sales pages (next step)
- 🚧 Sales history (next step)
- 🚧 Stock management (next step)

---

**Made with ❤️ by Gpower Team**
