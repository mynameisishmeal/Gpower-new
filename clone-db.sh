#!/bin/bash

# MongoDB Clone Script
# This clones your online database to local for development

echo "🔄 Cloning online database to local..."

# Set your online MongoDB URI here
ONLINE_URI="mongodb+srv://your-username:your-password@cluster.mongodb.net/mfvpos"
LOCAL_URI="mongodb://localhost:27017/mfvpos_local"

# Dump from online
echo "📥 Downloading from online database..."
mongodump --uri="$ONLINE_URI" --out=./db_backup

# Restore to local
echo "📤 Restoring to local database..."
mongorestore --uri="$LOCAL_URI" --drop ./db_backup

# Cleanup
rm -rf ./db_backup

echo "✅ Database cloned successfully!"
echo "📝 Update your .env.local to use: $LOCAL_URI"
