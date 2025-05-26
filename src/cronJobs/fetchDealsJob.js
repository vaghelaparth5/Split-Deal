const axios = require('axios');
const mongoose = require('mongoose');
const Deal = require('../models/Deal');

const fetchDealsJob = async () => {
  try {
    console.log(`[CRON] Starting fetchDealsJob...`);

    const res = await axios.get('https://dummyjson.com/products?limit=10');
    const products = res.data.products;

    const dealsToInsert = [];

    for (const product of products) {
      const exists = await Deal.findOne({ title: product.title });
      if (!exists) {
        dealsToInsert.push({
          title: product.title,
          description: product.description,
          price: product.price,
          original_price: Math.round(product.price + product.price * (product.discountPercentage / 100)),
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          location: "Online",
          max_participants: 10,
          creator: new mongoose.Types.ObjectId(),
          participants: [],
          category: product.category,
          image_url: product.thumbnail,
          is_active: true
        });
      }
    }

    if (dealsToInsert.length > 0) {
      await Deal.insertMany(dealsToInsert);
      console.log(`[CRON] Inserted ${dealsToInsert.length} new deal(s).`);
    } else {
      console.log(`[CRON] No new deals to insert (all were duplicates).`);
    }
  } catch (err) {
    console.error(`[CRON] Error in fetchDealsJob: ${err.message}`);
  }
};

module.exports = fetchDealsJob;


if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/db');

  connectDB().then(() => {
    fetchDealsJob().then(() => mongoose.disconnect());
  });
}
