const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📦 Collections in database:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('');

    // Check Stock collection
    if (collections.find(c => c.name === 'stocks')) {
      const stockCount = await db.collection('stocks').countDocuments();
      console.log(`📊 Stock Collection: ${stockCount} documents`);
      
      if (stockCount > 0) {
        const sampleStock = await db.collection('stocks').findOne();
        console.log('Sample stock document:');
        console.log(JSON.stringify(sampleStock, null, 2));
      }
    } else {
      console.log('⚠️  No "stocks" collection found');
    }
    console.log('');

    // Check Products collection
    if (collections.find(c => c.name === 'products')) {
      const productCount = await db.collection('products').countDocuments();
      console.log(`📊 Products Collection: ${productCount} documents`);
      
      if (productCount > 0) {
        const sampleProduct = await db.collection('products').findOne();
        console.log('Sample product document:');
        console.log(JSON.stringify(sampleProduct, null, 2));
      }
    } else {
      console.log('⚠️  No "products" collection found');
    }
    console.log('');

    // Check Users collection
    if (collections.find(c => c.name === 'users')) {
      const userCount = await db.collection('users').countDocuments();
      console.log(`📊 Users Collection: ${userCount} documents`);
      
      if (userCount > 0) {
        const sampleUser = await db.collection('users').findOne();
        console.log('Sample user (password hidden):');
        const { password, ...userWithoutPassword } = sampleUser;
        console.log(JSON.stringify(userWithoutPassword, null, 2));
      }
    } else {
      console.log('⚠️  No "users" collection found');
    }
    console.log('');

    // Check Sales collection
    if (collections.find(c => c.name === 'sales')) {
      const salesCount = await db.collection('sales').countDocuments();
      console.log(`📊 Sales Collection: ${salesCount} documents`);
      
      if (salesCount > 0) {
        const sampleSale = await db.collection('sales').findOne();
        console.log('Sample sale document:');
        console.log(JSON.stringify(sampleSale, null, 2));
      }
    } else {
      console.log('⚠️  No "sales" collection found');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database check complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
