@echo off
echo Cloning online database to local...

REM Set your online MongoDB URI here
set ONLINE_URI=mongodb+srv://tellerco:LzNEYZfY9AyyblTE@mynewdb.hynpbrc.mongodb.net/mfvpos
set LOCAL_URI=mongodb://localhost:27017/mfvpos_local

echo Downloading from online database...
mongodump --uri="%ONLINE_URI%" --out=db_backup

echo Restoring to local database...
mongorestore --uri="%LOCAL_URI%" --drop db_backup

echo Cleaning up...
rmdir /s /q db_backup

echo Database cloned successfully!
echo Update your .env.local to use: %LOCAL_URI%
pause
