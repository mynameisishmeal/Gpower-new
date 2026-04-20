require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function findPrinters() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    
    console.log('\n📦 All Databases:\n');
    
    for (const dbInfo of dbs.databases) {
      console.log(`\n🔍 Checking database: ${dbInfo.name}`);
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      
      const hasPrinters = collections.find(c => c.name === 'printers');
      if (hasPrinters) {
        const printers = await db.collection('printers').find({}).toArray();
        console.log(`   ✅ Found ${printers.length} printers:`);
        console.log(JSON.stringify(printers, null, 2));
      }
    }
    
  } finally {
    await client.close();
  }
}

findPrinters();
