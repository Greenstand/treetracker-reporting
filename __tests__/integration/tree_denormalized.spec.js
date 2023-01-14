const request = require('supertest');
const chai = require('chai');

const { expect } = chai;
chai.use(require('chai-like'));
chai.use(require('chai-things'));

const app = require('../../server/app');
const { knex } = require('../utils');
const tree1 = require('../mock/tree1.json');

describe('tree_denormalized', () => {
  before(async () => {
    await knex('tree_denormalized').insert({
      ...tree1,
    });
  });

  after(async () => {
    await knex('tree_denormalized').del();
  });

  describe('Trees GET', () => {
    it(`Should raise validation error with error code 422 -- 'tree_uuid' query parameter should be a uuid`, async () => {
      const result = await request(app)
        .get('/tree')
        .query({
          tree_uuid: 'tree_uuid',
        })
        .expect(422);
      expect(result.body.message).to.eql('"tree_uuid" must be a valid GUID');
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be an integer `, async () => {
      const result = await request(app)
        .get('/tree')
        .query({
          limit: 8.965,
        })
        .expect(422);
      expect(result.body.message).to.eql('"limit" must be an integer');
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be greater than 0  `, async () => {
      const result = await request(app)
        .get('/tree')
        .query({
          limit: 0,
        })
        .expect(422);
      expect(result.body.message).to.eql('"limit" must be greater than 0');
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be less than 1001  `, async () => {
      const result = await request(app)
        .get('/tree')
        .query({
          limit: 1001,
        })
        .expect(422);
      expect(result.body.message).to.eql('"limit" must be less than 1001');
    });

    it(`Should raise validation error with error code 422 -- 'offset' query parameter should be an integer  `, async () => {
      const result = await request(app)
        .get('/tree')
        .query({
          offset: 4.45,
        })
        .expect(422);
      expect(result.body.message).to.eql('"offset" must be an integer');
    });

    it(`Should raise validation error with error code 422 -- 'offset' query parameter should be at least 0  `, async () => {
      const result = await request(app)
        .get('/tree')
        .query({
          offset: -1,
        })
        .expect(422);
      expect(result.body.message).to.eql('"offset" must be greater than -1');
    });

    it(`Should raise validation error with error code 422 -- 'planting_organization_uuid' query parameter should be a uuid  `, async () => {
      const result = await request(app)
        .get('/tree')
        .query({
          planting_organization_uuid: 'planting_organization_uuid',
        })
        .expect(422);
      expect(result.body.message).to.eql(
        '"planting_organization_uuid" must be a valid GUID',
      );
    });

    it(`Should raise validation error with error code 422 -- 'sort_by' query parameter should be one of the allowed values  `, async () => {
      const result = await request(app)
        .get('/tree')
        .query({
          sort_by: 'sort_by',
        })
        .expect(422);
      expect(result.body.message).to.eql(
        '"sort_by" must be one of [tree_uuid, tree_created_at, planter_first_name, planter_last_name, planter_identifier, created_at, lat, lon, note, planting_organization_uuid, planting_organization_name, species]',
      );
    });

    it(`Should raise validation error with error code 422 -- 'order' query parameter should be one of asc or desc  `, async () => {
      const result = await request(app)
        .get('/tree')
        .query({
          order: 'ascending',
        })
        .expect(422);
      expect(result.body.message).to.eql('"order" must be one of [asc, desc]');
    });

    it('Should get trees successfully', async () => {
      const result = await request(app).get('/tree').expect(200);

      expect(result.body.links).to.have.keys(['prev', 'next']);
      expect(result.body.totalCount).to.eq(1);

      result.body.trees.forEach((tree) => {
        expect(tree).to.have.keys([
          'tree_uuid',
          'tree_created_at',
          'planter_first_name',
          'planter_last_name',
          'planter_identifier',
          'created_at',
          'lat',
          'lon',
          'note',
          'planting_organization_uuid',
          'planting_organization_name',
          'species',
        ]);
      });
    });

    it('Should get trees statistics successfully', async () => {
      const result = await request(app).get('/tree/statistics').expect(200);

      expect(result.body).to.have.keys([
        'planters',
        'species',
        'trees',
        'top_planters',
        'trees_per_planters',
        'last_updated_at',
        'gender_details',
      ]);

      expect(result.body.planters).to.have.keys(['total', 'planters']);
      expect(result.body.species).to.have.keys(['total', 'species']);
      expect(result.body.trees).to.have.keys(['trees']);
      expect(result.body.top_planters).to.have.keys([
        'average',
        'top_planters',
      ]);
      expect(result.body.trees_per_planters).to.have.keys([
        'average',
        'trees_per_planters',
      ]);
    });

    it(`Should raise validation error with error code 422 -- 'card_title' query parameter should be one of the select values `, async () => {
      const result = await request(app)
        .get('/tree/statistics/card')
        .query({
          card_title: 'card_title',
        })
        .expect(422);
      expect(result.body.message).to.eql(
        '"card_title" must be one of [planters, species, trees, unverified_trees, top_planters, trees_per_planters, catchments, gender_details]',
      );
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be an integer `, async () => {
      const result = await request(app)
        .get('/tree/statistics/card')
        .query({
          card_title: 'planters',
          limit: 8.965,
        })
        .expect(422);
      expect(result.body.message).to.eql('"limit" must be an integer');
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be greater than 0  `, async () => {
      const result = await request(app)
        .get('/tree/statistics/card')
        .query({
          card_title: 'planters',
          limit: 0,
        })
        .expect(422);
      expect(result.body.message).to.eql('"limit" must be greater than 0');
    });

    it(`Should raise validation error with error code 422 -- 'limit' query parameter should be less than 101  `, async () => {
      const result = await request(app)
        .get('/tree/statistics/card')
        .query({
          card_title: 'planters',
          limit: 101,
        })
        .expect(422);
      expect(result.body.message).to.eql('"limit" must be less than 101');
    });

    it(`Should raise validation error with error code 422 -- 'offset' query parameter should be an integer  `, async () => {
      const result = await request(app)
        .get('/tree/statistics/card')
        .query({
          card_title: 'planters',
          offset: 4.45,
        })
        .expect(422);
      expect(result.body.message).to.eql('"offset" must be an integer');
    });

    it(`Should raise validation error with error code 422 -- 'offset' query parameter should be at least 0  `, async () => {
      const result = await request(app)
        .get('/tree/statistics/card')
        .query({
          card_title: 'planters',
          offset: -1,
        })
        .expect(422);
      expect(result.body.message).to.eql('"offset" must be greater than -1');
    });

    it(`Should raise validation error with error code 422 -- 'tree_created_start_date' query parameter should be a date  `, async () => {
      const result = await request(app)
        .get('/tree/statistics/card')
        .query({
          card_title: 'planters',
          tree_created_start_date: 'tree_created_start_date',
        })
        .expect(422);
      expect(result.body.message).to.eql(
        '"tree_created_start_date" must be in ISO 8601 date format',
      );
    });

    it(`Should raise validation error with error code 422 -- 'tree_created_end_date' query parameter should be a date  `, async () => {
      const result = await request(app)
        .get('/tree/statistics/card')
        .query({
          card_title: 'planters',
          tree_created_end_date: 'tree_created_end_date',
        })
        .expect(422);
      expect(result.body.message).to.eql(
        '"tree_created_end_date" must be in ISO 8601 date format',
      );
    });

    it(`Should get trees stastics card details successfully`, async () => {
      const result = await request(app)
        .get('/tree/statistics/card')
        .query({
          card_title: 'planters',
        })
        .expect(200);
      expect(result.body).to.have.keys(['card_information', 'query']);
    });
  });
});
