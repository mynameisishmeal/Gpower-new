# Database Maintenance Scripts

## Available Scripts

### 1. Build Indexes
**File:** `buildIndexes.js`  
**Purpose:** Creates database indexes for faster queries  
**Usage:**
```bash
node scripts/buildIndexes.js
```
**When to run:** 
- After fresh database setup
- When queries are slow
- After importing large datasets

---

### 2. Remove Duplicate Customers
**File:** `removeDuplicateCustomers.js`  
**Purpose:** Finds and removes duplicate customer entries  
**Usage:**
```bash
node scripts/removeDuplicateCustomers.js
```
**When to run:**
- Before enabling unique indexes
- When you notice duplicate customers
- During database cleanup

**What it does:**
- Finds duplicates by name (case-insensitive)
- Keeps oldest entry
- Removes newer duplicates
- Creates unique indexes

---

## Quick Run (Windows)

### Build Indexes (Minimized)
```bash
npm run db:indexes
```

### Remove Duplicates (Minimized)
```bash
npm run db:cleanup
```

---

## Notes

- All scripts connect to MongoDB using `.env.local`
- Scripts are safe to run multiple times
- Backup your database before running cleanup scripts
- Check console output for results

---

## Troubleshooting

**Connection timeout:**
- Check if MongoDB is running
- Verify MONGODB_URI in `.env.local`
- Check network/firewall settings

**Index already exists:**
- This is normal, script will skip existing indexes

**Duplicate key error:**
- Run `removeDuplicateCustomers.js` first
- Then run `buildIndexes.js`
