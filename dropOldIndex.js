// dropOldIndex.js
// Run this ONCE to fix the MongoDB index issue
// Usage: node dropOldIndex.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const db_user = process.env.DB_USER;
const db_name = process.env.DB_NAME;
const db_pass = process.env.DB_PASS;

const dbUri = `mongodb+srv://${db_user}:${encodeURIComponent(db_pass)}@cluster0.qfmve.mongodb.net/${db_name}?retryWrites=true&w=majority&appName=Cluster0`;

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('videorooms');

    console.log('Checking existing indexes...');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));

    // Drop the problematic appointmentId index
    try {
      console.log('Dropping appointmentId_1 index...');
      await collection.dropIndex('appointmentId_1');
      console.log('✅ Successfully dropped appointmentId_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️  Index appointmentId_1 does not exist, skipping...');
      } else {
        throw err;
      }
    }

    // Create the new sparse index
    console.log('Creating new sparse index on appointmentId...');
    await collection.createIndex(
      { appointmentId: 1 }, 
      { unique: true, sparse: true, name: 'appointmentId_1_sparse' }
    );
    console.log('✅ Successfully created new sparse index');

    console.log('\n=== Index Fix Complete ===');
    console.log('You can now create video rooms without appointments!');

    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixIndexes();