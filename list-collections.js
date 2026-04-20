const { MongoClient } = require('mongodb');

async function listCollections() {
  const client = new MongoClient('mongodb://localhost:27017/mfvpos_local');
  
  try {
    await client.connect();
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    console.log('\n📦 Collections in mfvpos_local database:\n');
    collections.forEach(col => {
      console.log(`  - ${col.name} (type: ${col.type})`);
    });
    console.log(`\nTotal: ${collections.length} collections\n`);
    
  } finally {
    await client.close();
  }
}

listCollections();
