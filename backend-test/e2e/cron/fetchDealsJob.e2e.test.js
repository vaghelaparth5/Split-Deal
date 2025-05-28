const mongoose = require('mongoose');
const { expect } = require('chai');
const Deal = require('../../../src/models/Deal');
const fetchDealsJob = require('../../../src/cronJobs/fetchDealsJob');
require('dotenv').config();

describe('E2E - fetchDealsJob', function () {
  this.timeout(10000);

  before(async function () {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Deal.deleteMany({});
  });

  it('should insert new deals from the dummy API', async () => {
    await fetchDealsJob();
    const deals = await Deal.find({});
    expect(deals.length).to.be.greaterThan(0);
  });

  it('should not insert duplicate deals', async () => {
    const countBefore = await Deal.countDocuments({});
    await fetchDealsJob(); // Should try to insert same deals again
    const countAfter = await Deal.countDocuments({});
    expect(countAfter).to.equal(countBefore); // No new duplicates
  });

  it('should correctly populate required fields', async () => {
    const deal = await Deal.findOne({});
    expect(deal).to.have.property('title');
    expect(deal).to.have.property('price');
    expect(deal).to.have.property('deadline');
    expect(deal).to.have.property('is_active', true);
  });

  after(async function () {
    await Deal.deleteMany({});
    await mongoose.disconnect();
  });
});
