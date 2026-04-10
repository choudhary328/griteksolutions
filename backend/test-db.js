require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;

console.log('--- MongoDB Connection Test ---');
console.log('Using URI:', mongoUri ? mongoUri.replace(/:([^@]+)@/, ':****@') : 'NOT SET');

if (!mongoUri) {
  console.error('\x1b[31mError: MONGO_URI is not set in your .env file.\x1b[0m');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
  .then(() => {
    console.log('\x1b[32mSuccess! Successfully connected to MongoDB.\x1b[0m');
    console.log('Mongoose Connection State:', mongoose.connection.readyState);
    process.exit(0);
  })
  .catch((err) => {
    console.error('\x1b[31mConnection Failed!\x1b[0m');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);

    if (err.message.includes('bad auth')) {
      console.warn('\x1b[33mTip: Check your username and password. If your password contains @, #, or :, it MUST be URL-encoded (e.g., @ -> %40).\x1b[0m');
    } else if (err.name === 'MongooseServerSelectionError') {
      console.warn('\x1b[33mTip: This usually means your IP is NOT whitelisted in MongoDB Atlas or your internet is blocking the port (27017).\x1b[0m');
      console.warn('\x1b[33mMake sure you added "0.0.0.0/0" to the Network Access tab in Atlas.\x1b[0m');
    }

    process.exit(1);
  });
