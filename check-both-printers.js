const { MongoClient } = require('mongodb');

async function checkBothPrinters() {
  const client = new MongoClient('mongodb://localhost:27017/mfvpos_local');
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('\n📄 Collection: "printers" (no space):\n');
    const printers1 = await db.collection('printers').find({}).toArray();
    console.log(JSON.stringify(printers1, null, 2));
    
    console.log('\n📄 Collection: " printers" (with leading space):\n');
    const printers2 = await db.collection(' printers').find({}).toArray();
    console.log(JSON.stringify(printers2, null, 2));
    
  } finally {
    await client.close();
  }
}

checkBothPrinters();
