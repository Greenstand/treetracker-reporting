require('dotenv').config();
const request = require('supertest');
const { expect } = require('chai');
const server = require('../../server/app');
const { captureOne } = require('./seed-data-creation');

describe('Captures GET', () => {
  it(`Should raise validation error with error code 422 -- 'approved' query parameter should be a boolean  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        approved: 'approved',
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql('"approved" must be a boolean');
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- 'capture_uuid' query parameter should be a uuid  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        capture_uuid: 'capture_uuid',
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql('"capture_uuid" must be a valid GUID');
        if (err) return done(err);
        return done();
      });
  });


  it(`Should raise validation error with error code 422 -- 'limit' query parameter should be an integer  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        limit: 8.965,
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql('"limit" must be an integer');
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- 'limit' query parameter should be greater than 0  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        limit: 0,
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql('"limit" must be greater than 0');
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- 'limit' query parameter should be less than 1001  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        limit: 1001,
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql('"limit" must be less than 1001');
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- 'offset' query parameter should be an integer  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        offset: 4.45,
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql('"offset" must be an integer');
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- 'offset' query parameter should be at least 0  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        offset: -1,
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql('"offset" must be greater than -1');
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- 'since' query parameter should be a date  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        since: 'since',
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql(
          '"since" must be in ISO 8601 date format',
        );
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- 'since_date_paid' query parameter should be a date  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        since_date_paid: 'since_date_paid',
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql(
          '"since_date_paid" must be in ISO 8601 date format',
        );
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- 'token_id' query parameter should be a uuid  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        token_id: 'token_id',
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql('"token_id" must be a valid GUID');
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- 'sort_by' query parameter should be one of the allowed values  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        sort_by: 'sort_by',
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql(
          '"sort_by" must be one of [capture_uuid, planter_first_name, planter_last_name, planter_identifier, created_at, lat, lon, note, approved, planting_organization, date_paid, paid_by, payment_local_amt, species, token_id]',
        );
        if (err) return done(err);
        return done();
      });
  });

  it(`Should raise validation error with error code 422 -- 'order' query parameter should be one of asc or desc  `, function (done) {
    request(server)
      .get(`/capture`)
      .query({
        order: 'ascending',
      })
      .set('Accept', 'application/json')
      .expect(422)
      .end(function (err, res) {
        expect(res.body.message).to.eql('"order" must be one of [asc, desc]');
        if (err) return done(err);
        return done();
      });
  });

  it(`Should get captures successfully`, function (done) {
    request(server)
      .get(`/capture`)
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.keys(['captures', 'links', 'totalCount']);
        expect(res.body.links).to.have.keys(['prev', 'next']);
        expect(res.body.totalCount).to.eq(3);

        for (const capture of res.body.captures) {
          expect(capture).to.have.keys([
            'capture_uuid',
            'planter_first_name',
            'planter_last_name',
            'planter_identifier',
            'created_at',
            'lat',
            'lon',
            'note',
            'approved',
            'planting_organization',
            'date_paid',
            'paid_by',
            'payment_local_amt',
            'species',
            'token_id',
          ]);
        }
        return done();
      });
  });

  it(`Should get captures successfully -- with sort_by query `, function (done) {
    request(server)
      .get(`/capture`)
      .query({ sort_by: 'planter_first_name', order: 'desc' })
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.keys(['captures', 'links', 'totalCount']);
        expect(res.body.links).to.have.keys(['prev', 'next']);
        expect(res.body.totalCount).to.eq(3);
        expect(res.body.captures[0].planter_first_name).to.eq('c');
        return done();
      });
  });

  it(`Should get captures successfully -- with filters `, function (done) {
    const capture = { ...captureOne };
    delete capture.created_at;
    delete capture.date_paid;
    delete capture.lat;
    delete capture.lon;
    delete capture.note;
    delete capture.payment_local_amt;
    capture.since = captureOne.created_at;
    capture.since_date_paid = captureOne.date_paid;
    request(server)
      .get(`/capture`)
      .query({ ...capture })
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.keys(['captures', 'links', 'totalCount']);
        expect(res.body.links).to.have.keys(['prev', 'next']);
        expect(res.body.links.prev).to.eq(null);
        expect(res.body.totalCount).to.eq(1);
        expect(res.body.captures[0]).to.eql({ ...captureOne });
        return done();
      });
  });
});
