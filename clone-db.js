const { MongoClient } = require('mongodb');

// CONFIGURE THESE
const ONLINE_URI = 'mongodb+srv://tellerco:LzNEYZfY9AyyblTE@mynewdb.hynpbrc.mongodb.net/mfvpos';
const LOCAL_URI = 'mongodb://localhost:27017/mfvpos_local';

async function cloneDatabase() {
  console.log('🔄 Cloning database...');
  
  const onlineClient = new MongoClient(ONLINE_URI);
  const localClient = new MongoClient(LOCAL_URI);
  
  try {
    await onlineClient.connect();
    await localClient.connect();
    
    const onlineDb = onlineClient.db();
    const localDb = localClient.db();
    
    const collections = await onlineDb.listCollections().toArray();
    
    for (const collInfo of collections) {
      const collName = collInfo.name;
      console.log(`📦 Copying ${collName}...`);
      
      const docs = await onlineDb.collection(collName).find({}).toArray();
      
      if (docs.length > 0) {
        await localDb.collection(collName).deleteMany({});
        await localDb.collection(collName).insertMany(docs);
        console.log(`✅ Copied ${docs.length} documents to ${collName}`);
      }
    }
    
    console.log('🎉 Database cloned successfully!');
    console.log('📝 Update .env.local to: MONGODB_URI=mongodb://localhost:27017/mfvpos_local');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await onlineClient.close();
    await localClient.close();
  }
}

cloneDatabase();
