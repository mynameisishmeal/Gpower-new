const { MongoClient } = require('mongodb');

async function fixPrinters() {
  const client = new MongoClient('mongodb://localhost:27017/mfvpos_local');
  
  try {
    await client.connect();
    const db = client.db();
    
    const wrongCollection = await db.collection(' printers').find({}).toArray();
    
    if (wrongCollection.length > 0) {
      console.log(`\nCopying ${wrongCollection.length} printers from " printers" to "printers"...\n`);
      
      for (const printer of wrongCollection) {
        await db.collection('printers').updateOne(
          { email: printer.email },
          { $set: { 
            serviceUUID: printer.serviceUUID, 
            characteristicUUID: printer.characteristicUUID 
          }},
          { upsert: true }
        );
      }
      
      console.log('✅ Data copied successfully\n');
      
      console.log('Deleting wrong collection " printers"...\n');
      await db.collection(' printers').drop();
      console.log('✅ Wrong collection deleted\n');
    }
    
  } finally {
    await client.close();
  }
}

fixPrinters();
