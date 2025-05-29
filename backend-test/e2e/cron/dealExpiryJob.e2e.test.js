const mongoose = require('mongoose');
const { expect } = require('chai');
const Deal = require('../../../src/models/Deal');
const dealExpiryJob = require('../../../src/cronJobs/dealExpiryJob');
require('dotenv').config();

describe('E2E - dealExpiryJob', function () {
  this.timeout(10000);

  before(async function () {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Deal.deleteMany({});
  });

  it('should mark a single expired deal as inactive', async () => {
    await Deal.create({
      title: 'Single Expired Deal',
      description: 'Should be expired',
      price: 100,
      original_price: 150,
      deadline: new Date(Date.now() - 60000),
      location: 'Online',
      max_participants: 5,
      creator: new mongoose.Types.ObjectId(),
      participants: [],
      category: 'test',
      image_url: 'https://example.com/image1.png',
      is_active: true
    });

    await dealExpiryJob();
    const result = await Deal.findOne({ title: 'Single Expired Deal' });
    expect(result.is_active).to.be.false;
  });

  it('should not affect deals that are still active', async () => {
    await Deal.create({
      title: 'Future Deal',
      description: 'Should remain active',
      price: 200,
      original_price: 250,
      deadline: new Date(Date.now() + 600000),
      location: 'Online',
      max_participants: 10,
      creator: new mongoose.Types.ObjectId(),
      participants: [],
      category: 'test',
      image_url: 'https://example.com/image2.png',
      is_active: true
    });

    await dealExpiryJob();
    const result = await Deal.findOne({ title: 'Future Deal' });
    expect(result.is_active).to.be.true;
  });

  it('should not change deals that are already inactive', async () => {
    await Deal.create({
      title: 'Already Inactive Deal',
      description: 'Should stay inactive',
      price: 300,
      original_price: 350,
      deadline: new Date(Date.now() - 100000),
      location: 'Online',
      max_participants: 5,
      creator: new mongoose.Types.ObjectId(),
      participants: [],
      category: 'test',
      image_url: 'https://example.com/image3.png',
      is_active: false
    });

    await dealExpiryJob();
    const result = await Deal.findOne({ title: 'Already Inactive Deal' });
    expect(result.is_active).to.be.false;
  });

  after(async function () {
    await Deal.deleteMany({});
    await mongoose.disconnect();
  });
});
