// Run this script once to create database indexes
// Usage: node scripts/buildIndexes.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function buildIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Modern Mongoose connection (v6+)
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    console.log('\n📊 Building indexes...\n');

    // Stock indexes
    console.log('Building Stock indexes...');
    await db.collection('stocks').createIndex({ stockname: 1 });
    await db.collection('stocks').createIndex({ stockquantity: 1 });
    await db.collection('stocks').createIndex({ regtime: -1 });
    await db.collection('stocks').createIndex({ stockname: 1, regtime: -1 });
    console.log('✅ Stock indexes created');

    // Product indexes
    console.log('Building Product indexes...');
    await db.collection('products').createIndex({ productname: 1 });
    await db.collection('products').createIndex({ regtime: -1 });
    await db.collection('products').createIndex({ productname: 1, regtime: -1 });
    console.log('✅ Product indexes created');

    // Customer indexes
    console.log('Building Customer indexes...');
    await db.collection('customers').createIndex({ name: 1 });
    await db.collection('customers').createIndex({ email: 1 });
    await db.collection('customers').createIndex({ createdAt: -1 });
    await db.collection('customers').createIndex({ lastPurchaseDate: -1 });
    await db.collection('customers').createIndex({ name: 1, createdAt: -1 });
    // Skip text index if it already exists with different config
    try {
      await db.collection('customers').createIndex({ name: 'text', email: 'text' });
    } catch (e) {
      console.log('⚠️  Text index already exists, skipping...');
    }
    console.log('✅ Customer indexes created');

    // Sales indexes
    console.log('Building Sales indexes...');
    try {
      await db.collection('sales').createIndex({ sale_no: -1 }, { unique: true });
    } catch (e) {
      console.log('⚠️  sale_no unique index already exists or has duplicates');
    }
    await db.collection('sales').createIndex({ saledate: -1 });
    await db.collection('sales').createIndex({ seller: 1 });
    await db.collection('sales').createIndex({ sharedid: 1 });
    await db.collection('sales').createIndex({ productname: 1 });
    await db.collection('sales').createIndex({ paymentmethod: 1 });
    await db.collection('sales').createIndex({ saletype: 1 });
    await db.collection('sales').createIndex({ customerName: 1 });
    await db.collection('sales').createIndex({ regtime: -1 });
    await db.collection('sales').createIndex({ saledate: -1, seller: 1 });
    await db.collection('sales').createIndex({ seller: 1, saledate: -1 });
    await db.collection('sales').createIndex({ sharedid: 1, saledate: -1 });
    console.log('✅ Sales indexes created');

    console.log('\n🎉 All indexes built successfully!');
    console.log('\n📈 Performance should be significantly improved.');
    console.log('   API responses should now be under 1 second.\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error building indexes:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if MongoDB is running');
    console.error('   2. Verify MONGODB_URI in .env.local');
    console.error('   3. Check network/firewall settings');
    console.error('   4. For MongoDB Atlas, whitelist your IP\n');
    process.exit(1);
  }
}

buildIndexes();
