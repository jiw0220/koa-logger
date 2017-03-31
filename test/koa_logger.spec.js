const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sc = require('sinon-chai');
chai.use(sc);
const request = require('supertest');
const chalk = require('chalk');
const Koa = require('koa');
const koaLogger = require('../');

let log;
let sandbox;
let app;

describe('middleware koa-logger', () => {
  beforeEach((done) => {
    app = new Koa();
    sandbox = sinon.sandbox.create();
    log = sandbox.spy(console, 'log');
    done();
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('200 responses', () => {
    beforeEach((done) => {
      app.use(koaLogger());
      app.use((ctx) => {
        ctx.body = 'hello logger';
      });
      done();
    });

    it('should log a request', (done) => {
      request(app.listen())
        .get('/200')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(log).to.have.been.called;
          done();
        });
    });

    it('should log a request with correct method and url', (done) => {
      request(app.listen())
        .head('/200')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(log).to.have.been.calledWith('  ' + chalk.gray('<--')
            + ' ' + chalk.bold('%s')
            + ' ' + chalk.gray('%s'),
            'HEAD',
            '/200');
          done();
        });
    });

    it('should log a response', (done) => {
      request(app.listen())
        .get('/200')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(log).to.have.been.calledTwice;
          done();
        });
    });

    it('should log a 200 response', (done) => {
      request(app.listen())
        .get('/200')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(log).to.have.been.calledWith('  ' + chalk.gray('-->')
            + ' ' + chalk.bold('%s')
            + ' ' + chalk.gray('%s')
            + ' ' + chalk.green('%s')
            + ' ' + chalk.gray('%s')
            + ' ' + chalk.gray('%s'),
              'GET',
              '/200',
              200,
              sinon.match.any,
              '12B');
          done();
        });
    });
  });

  it('should log a 301 response', (done) => {
    app.use(koaLogger());
    app.use((ctx) => {
      ctx.status = 301;
    });
    request(app.listen())
      .get('/301')
      .expect(301)
      .end((err, res) => {
        if (err) return done(err);
        expect(log).to.have.been.calledWith('  ' + chalk.gray('-->')
          + ' ' + chalk.bold('%s')
          + ' ' + chalk.gray('%s')
          + ' ' + chalk.cyan('%s')
          + ' ' + chalk.gray('%s')
          + ' ' + chalk.gray('%s'),
            'GET',
            '/301',
            301,
            sinon.match.any,
            '-');
        done();
      });
  });

  it('should log a 304 response', (done) => {
    app.use(koaLogger());
    app.use((ctx) => {
      ctx.status = 304;
    });
    request(app.listen())
      .get('/304')
      .expect(304)
      .end((err, res) => {
        if (err) return done(err);
        expect(log).to.have.been.calledWith('  ' + chalk.gray('-->')
          + ' ' + chalk.bold('%s')
          + ' ' + chalk.gray('%s')
          + ' ' + chalk.cyan('%s')
          + ' ' + chalk.gray('%s')
          + ' ' + chalk.gray('%s'),
            'GET',
            '/304',
            304,
            sinon.match.any,
            '');
        done();
      });
  });

  it('should log a 404 response', (done) => {
    app.use(koaLogger());
    app.use((ctx) => {
      ctx.status = 404;
      ctx.body = 'not found';
    });
    request(app.listen())
      .get('/404')
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);
        expect(log).to.have.been.calledWith('  ' + chalk.gray('-->')
          + ' ' + chalk.bold('%s')
          + ' ' + chalk.gray('%s')
          + ' ' + chalk.yellow('%s')
          + ' ' + chalk.gray('%s')
          + ' ' + chalk.gray('%s'),
            'GET',
            '/404',
            404,
            sinon.match.any,
            '9B');
        done();
      });
  });

  it('should log a 500 response', (done) => {
    app.use(koaLogger());
    app.use((ctx) => {
      ctx.status = 500;
      ctx.body = 'server error';
    });
    request(app.listen())
      .get('/500')
      .expect(500)
      .end((err, res) => {
        if (err) return done(err);
        expect(log).to.have.been.calledWith('  ' + chalk.gray('-->')
          + ' ' + chalk.bold('%s')
          + ' ' + chalk.gray('%s')
          + ' ' + chalk.red('%s')
          + ' ' + chalk.gray('%s')
          + ' ' + chalk.gray('%s'),
            'GET',
            '/500',
            500,
            sinon.match.any,
            '12B');
        done();
      });
  });

  it('should log middleware error', (done) => {
    app.use(koaLogger());
    app.use((ctx) => {
      throw new Error('oh no');
    });
    request(app.listen())
      .get('/error')
      .expect(500)
      .end((err, res) => {
        if (err) return done(err);
        expect(log).to.have.been.calledWith('  ' + chalk.gray('<--')
          + ' ' + chalk.bold('%s')
          + ' ' + chalk.gray('%s'),
            'GET',
            '/error');
        done();
      });
  });
});
