const mongoose = require('mongoose');
const Deal = require('../models/Deal');

const dealExpiryJob = async () => {
  console.log(`[CRON] Running dealExpiryJob...`);
  try {
    const now = new Date();
    const result = await Deal.updateMany(
      { deadline: { $lt: now }, is_active: true },
      { is_active: false }
    );

    console.log(`[CRON] Marked ${result.modifiedCount} deal(s) as expired.`);
  } catch (err) {
    console.error(`[CRON] Error in dealExpiryJob: ${err.message}`);
  }
};

module.exports = dealExpiryJob;

if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/db');

  connectDB().then(() => {
    dealExpiryJob().then(() => mongoose.disconnect());
  });
}
