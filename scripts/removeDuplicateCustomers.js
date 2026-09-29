// Script to find and remove duplicate customers
// Usage: node scripts/removeDuplicateCustomers.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function removeDuplicates() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const customers = db.collection('customers');

    console.log('🔍 Finding duplicate customers...\n');

    // Find duplicates by name (case-insensitive)
    const duplicates = await customers.aggregate([
      {
        $group: {
          _id: { $toLower: '$name' },
          count: { $sum: 1 },
          docs: { $push: { _id: '$_id', name: '$name', phone: '$phone', createdAt: '$createdAt' } }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();

    if (duplicates.length === 0) {
      console.log('✅ No duplicate customers found!\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate customer names:\n`);

    let totalRemoved = 0;

    for (const dup of duplicates) {
      console.log(`\n📋 Duplicate: "${dup.docs[0].name}"`);
      console.log(`   Found ${dup.count} entries:`);
      
      // Sort by creation date, keep the oldest
      dup.docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      dup.docs.forEach((doc, index) => {
        const date = new Date(doc.createdAt).toLocaleDateString();
        if (index === 0) {
          console.log(`   ✅ KEEPING: ${doc.name} (${doc.phone || 'no phone'}) - Created: ${date}`);
        } else {
          console.log(`   ❌ REMOVING: ${doc.name} (${doc.phone || 'no phone'}) - Created: ${date}`);
        }
      });

      // Remove all except the first (oldest)
      const idsToRemove = dup.docs.slice(1).map(doc => doc._id);
      
      if (idsToRemove.length > 0) {
        const result = await customers.deleteMany({ _id: { $in: idsToRemove } });
        totalRemoved += result.deletedCount;
        console.log(`   🗑️  Removed ${result.deletedCount} duplicate(s)`);
      }
    }

    console.log(`\n\n🎉 Cleanup complete!`);
    console.log(`   Total duplicates removed: ${totalRemoved}`);
    console.log(`   Unique customers remaining: ${await customers.countDocuments()}\n`);

    // Now create unique index
    console.log('📊 Creating unique indexes...');
    try {
      await customers.createIndex(
        { name: 1 }, 
        { 
          unique: true, 
          collation: { locale: 'en', strength: 2 },
          name: 'name_unique_case_insensitive'
        }
      );
      console.log('✅ Unique name index created');
    } catch (e) {
      console.log('⚠️  Name index already exists');
    }

    try {
      await customers.createIndex(
        { phone: 1 }, 
        { 
          unique: true, 
          sparse: true,
          name: 'phone_unique'
        }
      );
      console.log('✅ Unique phone index created');
    } catch (e) {
      console.log('⚠️  Phone index already exists');
    }

    console.log('\n✅ Future duplicates will be prevented!\n');

    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check if MongoDB is running');
    console.error('   2. Verify MONGODB_URI in .env.local');
    console.error('   3. Check network/firewall settings\n');
    process.exit(1);
  }
}

removeDuplicates();
