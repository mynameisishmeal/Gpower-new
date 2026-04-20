require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function deleteWrongCollection() {
  const client = new MongoClient(process.env.ONLINE_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    const collections = await db.listCollections().toArray();
    const wrongCollection = collections.find(c => c.name === ' printers');
    
    if (wrongCollection) {
      console.log('\n⚠️  Found " printers" collection (with leading space) in ONLINE database\n');
      
      const data = await db.collection(' printers').find({}).toArray();
      console.log(`📄 Data in wrong collection:\n${JSON.stringify(data, null, 2)}\n`);
      
      console.log('Copying data to correct "printers" collection...\n');
      for (const printer of data) {
        await db.collection('printers').updateOne(
          { email: printer.email },
          { $set: { 
            serviceUUID: printer.serviceUUID, 
            characteristicUUID: printer.characteristicUUID 
          }},
          { upsert: true }
        );
      }
      console.log('✅ Data copied\n');
      
      console.log('Deleting wrong collection...\n');
      await db.collection(' printers').drop();
      console.log('✅ Wrong collection deleted from ONLINE database\n');
    } else {
      console.log('\n✅ No wrong collection found in ONLINE database\n');
    }
    
  } finally {
    await client.close();
  }
}

deleteWrongCollection();
