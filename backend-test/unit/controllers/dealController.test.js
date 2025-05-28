const { expect } = require('chai');
const sinon = require('sinon');
const Deal = require('../../../src/models/Deal');
const dealController = require('../../../src/controllers/dealController');

describe('Deal Controller - Unit Tests', () => {
  let sandbox;
  let req, res;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = {
      body: {},
      user: { user_id: '123' },
      app: { get: sinon.stub() },
      params: { id: 'deal123' }
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createDeal', () => {

    it('should handle server errors', async () => {
      req.body = {
        title: 'Test Deal',
        price: 100,
        original_price: 200,
        deadline: '2023-12-31',
        max_participants: 10
      };

      sandbox.stub(Deal.prototype, 'save').throws(new Error('DB error'));

      await dealController.createDeal(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ msg: 'Server Error' })).to.be.true;
    });
  });

  describe('getDeals', () => {
    it('should fetch all deals sorted by creation date', async () => {
      const mockDeals = [
        { _id: '1', title: 'Deal 1' },
        { _id: '2', title: 'Deal 2' }
      ];

      sandbox.stub(Deal, 'find').returns({
        sort: sinon.stub().resolves(mockDeals)
      });

      await dealController.getDeals(req, res);

      expect(res.json.calledWithMatch({ 
        msg: 'Deals fetched successfully',
        deals: mockDeals
      })).to.be.true;
    });

    it('should handle server errors', async () => {
      sandbox.stub(Deal, 'find').throws(new Error('DB error'));

      await dealController.getDeals(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // describe('expireDeals', () => {
  //   it('should expire deals past their deadline', async () => {
  //     const mockResult = { modifiedCount: 3 };
      
  //     sandbox.stub(Deal, 'updateMany').resolves(mockResult);

  //     await dealController.expireDeals(req, res);

  //     expect(res.status.calledWith(200)).to.be.true;
  //     expect(res.json.calledWithMatch({ 
  //       msg: 'Expired deals updated successfully',
  //       modifiedCount: 3
  //     })).to.be.true;
  //   });

  //   it('should handle server errors', async () => {
  //     sandbox.stub(Deal, 'updateMany').throws(new Error('DB error'));

  //     await dealController.expireDeals(req, res);

  //     expect(res.status.calledWith(500)).to.be.true;
  //   });
  // });

  // Added: Unit tests for softDeleteDeal
  describe('softDeleteDeal', () => {
    it('should soft delete a deal and set deletedAt', async () => {
      const now = new Date();
      const mockDeal = {
        _id: 'deal123',
        title: 'Old Deal',
        save: sinon.stub().resolves()
      };

      sandbox.stub(Deal, 'findById').resolves(mockDeal);
      const clock = sinon.useFakeTimers(now);

      await dealController.softDeleteDeal(req, res);

      expect(mockDeal.deletedAt).to.eql(now);
      expect(mockDeal.save.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWithMatch({ msg: 'Deal soft deleted successfully' })).to.be.true;

      clock.restore();
    });

    it('should return 404 if deal not found', async () => {
      sandbox.stub(Deal, 'findById').resolves(null);

      await dealController.softDeleteDeal(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ msg: 'Deal not found' })).to.be.true;
    });

    it('should handle server error', async () => {
      sandbox.stub(Deal, 'findById').throws(new Error('DB error'));

      await dealController.softDeleteDeal(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ msg: 'Server Error' })).to.be.true;
    });
  });
});
