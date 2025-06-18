import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}
const filePath = path.join(process.cwd(), 'data/jsondata.json');

// Define schema
const insightSchema = new mongoose.Schema({}, { strict: false });
const Insight = mongoose.model('Insight', insightSchema);

async function importData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(rawData);

    const result = await Insight.insertMany(jsonData);
    console.log(`✅ Inserted ${result.length} documents.`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importData();
