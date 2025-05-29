const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const authController = require('../../../src/controllers/authController');
const User = require('../../../src/models/User');

describe('Auth Controller - Unit Tests', () => {
  let sandbox;
  let req, res;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = { body: {} };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        user_email: 'test@example.com',
        user_password: 'password123',
        name: 'Test User',
        phone_number: '1234567890'
      };

      sandbox.stub(User, 'findOne').resolves(null);
      sandbox.stub(bcrypt, 'genSalt').resolves('salt');
      sandbox.stub(bcrypt, 'hash').resolves('hashedPassword');
      sandbox.stub(User.prototype, 'save').resolves({
        _id: '123',
        user_email: 'test@example.com',
        name: 'Test User'
      });

      await authController.registerUser(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should return error if user already exists', async () => {
      req.body = {
        user_email: 'test@example.com',
        user_password: 'password123',
        name: 'Test User',
        phone_number: '1234567890'
      };

      sandbox.stub(User, 'findOne').resolves({});

      await authController.registerUser(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ msg: 'User already exists' })).to.be.true;
    });

    it('should handle server errors', async () => {
      req.body = {
        user_email: 'test@example.com',
        user_password: 'password123',
        name: 'Test User',
        phone_number: '1234567890'
      };

      sandbox.stub(User, 'findOne').throws(new Error('DB error'));

      await authController.registerUser(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      req.body = {
        user_email: 'test@example.com',
        user_password: 'password123'
      };

      const mockUser = {
        _id: '123',
        user_email: 'test@example.com',
        user_password: 'hashedPassword',
        name: 'Test User'
      };

      sandbox.stub(User, 'findOne').resolves(mockUser);
      sandbox.stub(bcrypt, 'compare').resolves(true);
      sandbox.stub(jwt, 'sign').returns('token');

      await authController.loginUser(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(res.json.args[0][0].msg).to.equal('Authentication successful');
    });

    it('should return error for invalid credentials (user not found)', async () => {
      req.body = {
        user_email: 'test@example.com',
        user_password: 'password123'
      };

      sandbox.stub(User, 'findOne').resolves(null);

      await authController.loginUser(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ msg: 'Invalid Credentials' })).to.be.true;
    });

    it('should return error for invalid credentials (wrong password)', async () => {
      req.body = {
        user_email: 'test@example.com',
        user_password: 'password123'
      };

      const mockUser = {
        _id: '123',
        user_email: 'test@example.com',
        user_password: 'hashedPassword',
        name: 'Test User'
      };

      sandbox.stub(User, 'findOne').resolves(mockUser);
      sandbox.stub(bcrypt, 'compare').resolves(false);

      await authController.loginUser(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ msg: 'Invalid Credentials' })).to.be.true;
    });
  });

describe('forgotPassword', () => {
  it('should send reset email when user exists', async () => {
    req.body = { user_email: 'gauravmyana15@gmail.com' };

    const fakeUser = {
      user_email: 'gauravmyana15@gmail.com',
      save: sinon.stub().resolves(),
      resetPasswordToken: '',
      resetPasswordExpires: '',
    };

    sandbox.stub(User, 'findOne').resolves(fakeUser);

    const randomBytesStub = sandbox.stub(crypto, 'randomBytes').returns(Buffer.from('mocktoken'));
    const createHashStub = sandbox.stub(crypto, 'createHash').returns({
      update: () => ({
        digest: () => 'hashedtoken123'
      })
    });

    const sendMailStub = sinon.stub().resolves();
    const createTransportStub = sandbox.stub(require('nodemailer'), 'createTransport').returns({
      sendMail: sendMailStub
    });

    await authController.forgotPassword(req, res);

    expect(User.findOne.calledWith({ user_email: 'gauravmyana15@gmail.com' })).to.be.true;
    expect(fakeUser.save.calledOnce).to.be.true;
    expect(sendMailStub.calledOnce).to.be.true;
    expect(res.json.calledWithMatch({ msg: 'Password reset link sent to email.' })).to.be.true;

    randomBytesStub.restore();
    createHashStub.restore();
    createTransportStub.restore();
  });

  it('should return 404 if user does not exist', async () => {
    req.body = { user_email: 'nonexistent@example.com' };

    sandbox.stub(User, 'findOne').resolves(null);

    await authController.forgotPassword(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ msg: 'No account with that email.' })).to.be.true;
  });

  it('should handle error when crypto.randomBytes fails', async () => {
    req.body = { user_email: 'test@example.com' };

    const fakeUser = {
      user_email: 'test@example.com',
      save: sinon.stub().resolves(),
    };

    sandbox.stub(User, 'findOne').resolves(fakeUser);

    const randomBytesStub = sandbox.stub(crypto, 'randomBytes').throws(new Error('crypto failed'));

    await authController.forgotPassword(req, res);

    expect(res.status.calledWith(500)).to.be.true;

    randomBytesStub.restore();
  });

  it('should handle error when user.save fails', async () => {
    req.body = { user_email: 'test@example.com' };

    const fakeUser = {
      user_email: 'test@example.com',
      save: sinon.stub().rejects(new Error('Save failed')),
    };

    sandbox.stub(User, 'findOne').resolves(fakeUser);

    const randomBytesStub = sandbox.stub(crypto, 'randomBytes').returns(Buffer.from('mocktoken'));
    const createHashStub = sandbox.stub(crypto, 'createHash').returns({
      update: () => ({
        digest: () => 'hashedtoken123'
      })
    });

    await authController.forgotPassword(req, res);

    expect(res.status.calledWith(500)).to.be.true;

    randomBytesStub.restore();
    createHashStub.restore();
  });

  it('should handle error when nodemailer.sendMail fails', async () => {
    req.body = { user_email: 'test@example.com' };

    const fakeUser = {
      user_email: 'test@example.com',
      save: sinon.stub().resolves(),
    };

    sandbox.stub(User, 'findOne').resolves(fakeUser);

    const randomBytesStub = sandbox.stub(crypto, 'randomBytes').returns(Buffer.from('mocktoken'));
    const createHashStub = sandbox.stub(crypto, 'createHash').returns({
      update: () => ({
        digest: () => 'hashedtoken123'
      })
    });

    const sendMailStub = sinon.stub().rejects(new Error('SMTP failure'));
    const createTransportStub = sandbox.stub(require('nodemailer'), 'createTransport').returns({
      sendMail: sendMailStub
    });

    await authController.forgotPassword(req, res);

    expect(res.status.calledWith(500)).to.be.true;

    randomBytesStub.restore();
    createHashStub.restore();
    createTransportStub.restore();
  });
});


  // describe('resetPassword', () => {
  //   it('should reset the password when token is valid', async () => {
  //     req.params = { token: 'mocktoken' };
  //     req.body = { newPassword: 'newpassword123' };

  //     const fakeUser = {
  //       user_password: '',
  //       save: sinon.stub().resolves(),
  //       resetPasswordToken: 'hashedtoken',
  //       resetPasswordExpires: Date.now() + 3600000,
  //     };

  //     sandbox.stub(crypto, 'createHash').returns({ update: () => ({ digest: () => 'hashedtoken' }) });
  //     sandbox.stub(User, 'findOne').resolves(fakeUser);
  //     sandbox.stub(bcrypt, 'genSalt').resolves('salt');
  //     sandbox.stub(bcrypt, 'hash').resolves('hashedPassword');

  //     await authController.resetPassword(req, res);

  //     expect(fakeUser.user_password).to.equal('hashedPassword');
  //     expect(fakeUser.save.calledOnce).to.be.true;
  //     expect(res.json.calledWithMatch({ msg: 'Password has been reset successfully.' })).to.be.true;
  //   });

  //   it('should return 400 if token is invalid or expired', async () => {
  //     req.params = { token: 'invalidtoken' };
  //     req.body = { newPassword: 'pass' };

  //     sandbox.stub(crypto, 'createHash').returns({ update: () => ({ digest: () => 'hashedtoken' }) });
  //     sandbox.stub(User, 'findOne').resolves(null);

  //     await authController.resetPassword(req, res);

  //     expect(res.status.calledWith(400)).to.be.true;
  //     expect(res.json.calledWithMatch({ msg: 'Invalid or expired token.' })).to.be.true;
  //   });

  //   it('should handle server errors during password reset', async () => {
  //     req.params = { token: 'token' };
  //     req.body = { newPassword: 'pass' };

  //     sandbox.stub(crypto, 'createHash').returns({ update: () => ({ digest: () => 'hashedtoken' }) });
  //     sandbox.stub(User, 'findOne').throws(new Error('Reset error'));

  //     await authController.resetPassword(req, res);

  //     expect(res.status.calledWith(500)).to.be.true;
  //   });
  // });


});