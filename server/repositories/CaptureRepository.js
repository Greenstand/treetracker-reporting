const BaseRepository = require('./BaseRepository');

class CaptureRepository extends BaseRepository {
  constructor(session) {
    super('capture_denormalized', session);
    this._tableName = 'capture_denormalized';
    this._session = session;
  }

  async getCaptures(filter, { limit, offset, order, orderBy }) {
    const whereBuilder = function (object, builder) {
      const result = builder;
      const filterObject = { ...object };
      if (filterObject.created_at) {
        result.where('created_at', '>=', filterObject.created_at);
        delete filterObject.created_at;
      }
      if (filterObject.date_paid) {
        result.where('date_paid', '>=', filterObject.date_paid);
        delete filterObject.date_paid;
      }
      if (filterObject.capture_created_at) {
        result.where(
          'capture_created_at',
          '>=',
          filterObject.capture_created_at,
        );
        delete filterObject.capture_created_at;
      }
      result.where(filterObject);
    };
    let promise = this._session
      .getDB()(this._tableName)
      .where((builder) => whereBuilder(filter, builder));
    if (limit) {
      promise = promise.limit(limit);
    }
    if (offset) {
      promise = promise.offset(offset);
    }
    if (orderBy) {
      promise = promise.orderBy(orderBy, order);
    }

    const count = await this._session
      .getDB()(this._tableName)
      .count('*')
      .where((builder) => whereBuilder(filter, builder));
    return { captures: await promise, count: +count[0].count };
  }

  async getStatistics(filter, options = { limit: 3, offset: 0 }) {
    const whereBuilder = function (object, builder) {
      const result = builder;
      const filterObject = { ...object };
      delete filterObject.card_title;
      if (filterObject.capture_created_start_date) {
        result.where(
          'capture_created_at',
          '>=',
          filterObject.capture_created_start_date,
        );
        delete filterObject.capture_created_start_date;
      }
      if (filterObject.capture_created_end_date) {
        result.where(
          'capture_created_at',
          '<=',
          filterObject.capture_created_end_date,
        );
        delete filterObject.capture_created_end_date;
      }
      result.where(filterObject);
    };
    const knex = this._session.getDB();

    // total number of growers
    const totalGrowersQuery = knex(this._tableName)
      .count('* as totalPlanters')
      .from(function () {
        this.distinct(
          'planter_first_name',
          'planter_last_name',
          'planter_identifier',
        )
          .from('capture_denormalized')
          .where((builder) => whereBuilder(filter, builder))
          .as('planters');
      })
      .cache();

    // total number of growers per organization
    const topGrowersPerOrganizatinoQuery = knex(this._tableName)
      .select(knex.raw('planting_organization_name, count(*) as count'))
      .from(function () {
        this.distinct(
          'planter_first_name',
          'planter_last_name',
          'planter_identifier',
          'planting_organization_name',
          'planting_organization_uuid',
        )
          .from('capture_denormalized')
          .where((builder) => whereBuilder(filter, builder))
          .groupBy(
            'planting_organization_uuid',
            'planting_organization_name',
            'planter_first_name',
            'planter_last_name',
            'planter_identifier',
          )
          .as('planters');
      })
      .groupBy('planting_organization_name', 'planting_organization_uuid')
      .orderBy('count', 'desc')
      .limit(options.limit)
      .offset(options.offset)
      .cache();

    const topPlantersQuery = knex(this._tableName)
      .select(
        knex.raw('planter_first_name, planter_last_name, count(*) as count'),
      )
      .where((builder) => whereBuilder(filter, builder))
      .groupBy('planter_first_name', 'planter_last_name', 'planter_identifier')
      .orderBy('count', 'desc')
      .limit(options.limit)
      .offset(options.offset)
      .cache();

    const averageCapturePerPlanterQuery = knex(this._tableName)
      .avg('totalPlanters')
      .from(function () {
        this.count('* as totalPlanters')
          .from('capture_denormalized')
          .where((builder) => whereBuilder(filter, builder))
          .groupBy(
            'planter_first_name',
            'planter_last_name',
            'planter_identifier',
          )
          .as('planters');
      })
      .cache();

    const totalSpeciesQuery = knex(this._tableName)
      .where((builder) => whereBuilder(filter, builder))
      .countDistinct('species as totalSpecies')
      .cache();

    const topSpeciesQuery = knex(this._tableName)
      .select(knex.raw('species, count(*) as count'))
      .where((builder) => whereBuilder(filter, builder))
      .whereNotNull('species')
      .groupBy('species')
      .orderBy('count', 'desc')
      .limit(options.limit)
      .offset(options.offset)
      .cache();

    const totalApprovedCapturesQuery = knex(this._tableName)
      .count()
      .where((builder) => whereBuilder({ ...filter, approved: true }, builder))
      .cache();

    const topApprovedCapturesQuery = knex(this._tableName)
      .select(knex.raw('planting_organization_name, count(*) as count'))
      .where((builder) => whereBuilder({ ...filter, approved: true }, builder))
      .groupBy('planting_organization_uuid', 'planting_organization_name')
      .orderBy('count', 'desc')
      .limit(options.limit)
      .offset(options.offset)
      .cache();

    const totalUnverifiedCapturesQuery = knex(this._tableName)
      .count()
      .where((builder) => whereBuilder({ ...filter, approved: false }, builder))
      .cache();

    const topUnverifiedCapturesQuery = knex(this._tableName)
      .select(knex.raw('planting_organization_name, count(*) as count'))
      .where((builder) => whereBuilder({ ...filter, approved: false }, builder))
      .groupBy('planting_organization_uuid', 'planting_organization_name')
      .orderBy('count', 'desc')
      .limit(options.limit)
      .offset(options.offset)
      .cache();

    const averageCapturesPerPlanterPerOrganizationQuery = knex(this._tableName)
      .avg('averageCapturesPerPlanters')
      .from(function () {
        this.avg('count as averageCapturesPerPlanters')
          .from(function () {
            this.select(
              knex.raw(
                `count(*) as count, planting_organization_name, planting_organization_uuid`,
              ),
            )
              .from('capture_denormalized')
              .where((builder) => whereBuilder(filter, builder))
              .groupBy(
                'planting_organization_uuid',
                'planting_organization_name',
                'planter_first_name',
                'planter_last_name',
                'planter_identifier',
              )
              .as('plantersCount');
          })
          .groupBy('planting_organization_name', 'planting_organization_uuid')
          .as('plantersAverage');
      })
      .cache();

    const topAverageCapturesPerPlanterPerOrganizationQuery = knex(
      this._tableName,
    )
      .select(
        knex.raw(
          'planting_organization_name, avg(count) as averagecapturesperplanters',
        ),
      )
      .from(function () {
        this.select(
          knex.raw(
            `count(*) as count, planting_organization_name, planting_organization_uuid`,
          ),
        )
          .from('capture_denormalized')
          .where((builder) => whereBuilder(filter, builder))
          .groupBy(
            'planting_organization_uuid',
            'planting_organization_name',
            'planter_first_name',
            'planter_last_name',
            'planter_identifier',
          )
          .as('plantersCount');
      })
      .groupBy('planting_organization_name', 'planting_organization_uuid')
      .orderBy('averagecapturesperplanters', 'desc')
      .limit(options.limit)
      .offset(options.offset)
      .cache();

    const lastUpdatedQuery = knex(this._tableName).max('created_at').cache();

    if (filter?.card_title) {
      const { card_title } = filter;

      switch (card_title) {
        case 'planters': {
          const topGrowersPerOrganizatino =
            await topGrowersPerOrganizatinoQuery;
          return { topGrowersPerOrganizatino };
        }
        case 'species': {
          const topSpecies = await topSpeciesQuery;
          return { topSpecies };
        }
        case 'captures': {
          const topApprovedCaptures = await topApprovedCapturesQuery;
          return { topCaptures: topApprovedCaptures };
        }
        case 'unverified_captures': {
          const topUnverifiedCaptures = await topUnverifiedCapturesQuery;
          return { topUnverifiedCaptures };
        }
        case 'top_planters': {
          const topPlanters = await topPlantersQuery;
          return { topPlanters };
        }
        case 'trees_per_planters': {
          const topAverageCapturesPerPlanterPerOrganization =
            await topAverageCapturesPerPlanterPerOrganizationQuery;
          return { topAverageCapturesPerPlanterPerOrganization };
        }

        default:
          break;
      }
    }

    const totalGrowers = await totalGrowersQuery;
    const topPlanters = await topPlantersQuery;
    const averageCapturePerPlanter = await averageCapturePerPlanterQuery;
    const topGrowersPerOrganizatino = await topGrowersPerOrganizatinoQuery;
    const totalSpecies = await totalSpeciesQuery;
    const topSpecies = await topSpeciesQuery;
    const totalApprovedCaptures = await totalApprovedCapturesQuery;
    const topApprovedCaptures = await topApprovedCapturesQuery;
    const totalUnverifiedCaptures = await totalUnverifiedCapturesQuery;
    const topUnverifiedCaptures = await topUnverifiedCapturesQuery;
    const averageCapturesPerPlanterPerOrganization =
      await averageCapturesPerPlanterPerOrganizationQuery;
    const topAverageCapturesPerPlanterPerOrganization =
      await topAverageCapturesPerPlanterPerOrganizationQuery;
    const lastUpdated = await lastUpdatedQuery;

    return {
      totalGrowers: +totalGrowers[0].totalPlanters,
      topPlanters,
      averageCapturePerPlanter: +averageCapturePerPlanter[0].avg,
      topGrowersPerOrganizatino,
      totalSpecies: +totalSpecies[0].totalSpecies,
      topSpecies,
      totalCaptures: +totalApprovedCaptures[0].count,
      topCaptures: topApprovedCaptures,
      totalUnverifiedCaptures: +totalUnverifiedCaptures[0].count,
      topUnverifiedCaptures,
      averageCapturesPerPlanterPerOrganization:
        averageCapturesPerPlanterPerOrganization[0].avg,
      topAverageCapturesPerPlanterPerOrganization,
      lastUpdated: lastUpdated[0].max,
    };
  }
}

module.exports = CaptureRepository;
