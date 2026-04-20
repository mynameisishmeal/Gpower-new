# 🔄 Migration Guide: Express → Next.js

## ✅ What's Been Migrated

### 1. **Database Connection** ✅
- **Old:** `mongoose.connect()` in `index.js`
- **New:** `lib/mongodb.ts` with connection pooling
- **Status:** ✅ Working - Same MongoDB database

### 2. **User Authentication** ✅
- **Old:** Session-based with `express-session`
- **New:** API route `/api/auth/login` + localStorage
- **Status:** ✅ Working - Uses same User model

### 3. **Database Models** ✅
- **Old:** `models/*.js` (JavaScript)
- **New:** `models/*.ts` (TypeScript)
- **Status:** ✅ All models migrated + NEW Customer model

### 4. **Sales System** ✅ (Enhanced)
- **Old:** Basic sales without discount/customer
- **New:** Sales with discount & customer tracking
- **Status:** ✅ API ready, UI pending

## 🆕 New Features Added

### Discount Field
```typescript
// OLD Sales Schema
{
  producttotal: "50000"  // Just the total
}

// NEW Sales Schema
{
  subtotal: 50000,       // Original amount
  discount: 10000,       // Discount given
  producttotal: 40000    // Final amount (subtotal - discount)
}
```

### Customer Tracking
```typescript
// NEW Customer Model
{
  name: "John Doe",
  totalPurchases: 150000,
  lastPurchaseDate: Date
}

// NEW in Sales
{
  customerName: "John Doe",
  customerId: "customer_id_here"
}
```

## 📊 Feature Comparison

| Feature | Old System (Express) | New System (Next.js) | Status |
|---------|---------------------|---------------------|--------|
| Login | ✅ EJS form | ✅ React component | ✅ Done |
| Dashboard | ✅ EJS template | ✅ React component | ✅ Done |
| Sell Cartons | ✅ `/wholesale` | 🚧 `/sell/cartons` | 🚧 Pending |
| Sell Kilos | ✅ `/sell` | 🚧 `/sell/kilos` | 🚧 Pending |
| Sales History | ✅ `/saleshistory` | 🚧 `/sales/history` | 🚧 Pending |
| Stock Management | ✅ `/viewstock` | 🚧 `/stock` | 🚧 Pending |
| **Discount** | ❌ Not available | ✅ Built-in | ✅ Done |
| **Customer Names** | ❌ Not available | ✅ With autocomplete | ✅ Done |
| Printer | ✅ Thermal printer | 🚧 To migrate | 🚧 Pending |

## 🔄 How to Run Both Systems

### Old System (Port 30120)
```bash
cd "c:\Users\natha\OneDrive\Documents\Gpower lab"
npm start
# Opens at http://localhost:30120
```

### New System (Port 3000)
```bash
cd "c:\Users\natha\OneDrive\Documents\gpower-nextjs"
npm run dev
# Opens at http://localhost:3000
```

**Both can run simultaneously!** They use the same MongoDB database.

## 🎯 Testing the Migration

### Step 1: Test Login
1. Start new system: `npm run dev`
2. Go to http://localhost:3000
3. Login with existing credentials
4. Should redirect to dashboard

### Step 2: Test API Endpoints
```bash
# Test customer search
curl http://localhost:3000/api/customers/search?q=john

# Test stock list
curl http://localhost:3000/api/stock/list
```

### Step 3: Compare Data
- Old system sales: http://localhost:30120/saleshistory
- New system will show same data (shared database)

## 📝 Next Development Steps

### Priority 1: Sales Pages (2-3 days)
1. Create `/app/sell/cartons/page.tsx`
   - Product selection dropdown
   - Quantity input
   - **NEW:** Discount input field
   - **NEW:** Customer autocomplete
   - Payment method checkboxes
   - Cart table

2. Create `/app/sell/kilos/page.tsx`
   - Similar to cartons but for weight-based sales

### Priority 2: Sales History (1 day)
1. Create `/app/sales/history/page.tsx`
   - List all sales
   - Show discount column
   - Show customer names
   - Filter by date/seller

### Priority 3: Stock Management (1 day)
1. Create `/app/stock/page.tsx`
   - List all stock
   - Add/Edit/Delete stock
   - Low stock alerts

## 🔐 Security Notes

### Old System
- Plain text passwords (not hashed)
- Session-based auth

### New System
- Currently: Same as old (for compatibility)
- **TODO:** Add bcrypt password hashing
- **TODO:** Add JWT tokens

## 💾 Database Compatibility

**IMPORTANT:** Both systems share the same MongoDB database!

- Old system writes to: `mfvpos` database
- New system reads/writes to: Same `mfvpos` database
- Sales created in old system appear in new system
- Sales created in new system appear in old system

**New fields (discount, customerName) are optional:**
- Old sales won't have these fields (will be `undefined`)
- New sales will have these fields
- Both systems remain compatible

## 🐛 Known Issues

1. **Password Security:** Not hashed (same as old system)
2. **Session Management:** Using localStorage (temporary solution)
3. **Printer Integration:** Not yet migrated

## 📞 Getting Help

If you encounter issues:

1. **Check MongoDB connection:**
   ```bash
   # In new system
   npm run dev
   # Should see: "✅ MongoDB Connected Successfully"
   ```

2. **Check old system still works:**
   ```bash
   cd "Gpower lab"
   npm start
   ```

3. **Compare database data:**
   - Use MongoDB Compass
   - Connect to: `mongodb+srv://tellerco:LzNEYZfY9AyyblTE@mynewdb.hynpbrc.mongodb.net/mfvpos`

## 🎉 Success Criteria

Migration is successful when:
- ✅ Login works in new system
- ✅ Dashboard displays
- ✅ Can create sales with discount
- ✅ Can add customer names
- ✅ Sales appear in both systems
- ✅ Stock updates correctly
- ✅ Old system still works

---

**Current Status:** 🟢 Foundation Complete - Ready for UI Development
