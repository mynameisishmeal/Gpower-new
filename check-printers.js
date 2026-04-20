require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkPrinters() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    const printers = await db.collection('printers').find({}).limit(5).toArray();
    console.log('\n📄 Printers Collection:\n');
    console.log(JSON.stringify(printers, null, 2));
    
  } finally {
    await client.close();
  }
}

checkPrinters();
