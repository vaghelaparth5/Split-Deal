// src/cronJobs/cronScheduler.js
const cron = require('node-cron');
const fetchDealsJob = require('./fetchDealsJob');
const dealExpiryJob = require('./dealExpiryJob');
const connectDB = require('../config/db');
require('dotenv').config();

// Connect to MongoDB
connectDB().then(() => {
  console.log(' DB connected in cronScheduler');

  //  Trigger jobs immediately (for testing)
  fetchDealsJob();
  dealExpiryJob();

  //  Schedule jobs
  cron.schedule('*/1 * * * *', async () => { // Every minute for testing
    console.log('[CRON] Scheduled fetchDealsJob triggered...');
    await fetchDealsJob();
  });

  cron.schedule('*/2 * * * *', async () => { // Every 2 minutes for testing
    console.log('[CRON] Scheduled dealExpiryJob triggered...');
    await dealExpiryJob();
  });
}).catch((err) => {
  console.error(' Failed to connect to DB in cronScheduler:', err.message);
});
