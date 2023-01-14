const BaseRepository = require('./BaseRepository');

class TreeRepository extends BaseRepository {
  constructor(session) {
    super('tree_denormalized', session);
    this._tableName = 'tree_denormalized';
    this._session = session;
  }

  async getTrees(filter, { limit, offset, order, orderBy }) {
    const whereBuilder = function (object, builder) {
      const result = builder;
      const filterObject = { ...object };
      if (filterObject.created_at) {
        result.where('created_at', '>=', filterObject.created_at);
        delete filterObject.created_at;
      }
      if (filterObject.tree_created_at) {
        result.where('tree_created_at', '>=', filterObject.tree_created_at);
        delete filterObject.tree_created_at;
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
    return { trees: await promise, count: +count[0].count };
  }

  async getStatistics(filter, options = { limit: 3, offset: 0 }) {
    const knex = this._session.getDB();

    const whereBuilder = function (object, builder) {
      const result = builder;
      const filterObject = { ...object };
      delete filterObject.card_title;
      if (filterObject.tree_created_start_date) {
        result.where(
          'tree_created_at',
          '>=',
          filterObject.tree_created_start_date,
        );
        delete filterObject.tree_created_start_date;
      }
      if (filterObject.tree_created_end_date) {
        result.where(
          'tree_created_at',
          '<=',
          filterObject.tree_created_end_date,
        );
        delete filterObject.tree_created_end_date;
      }
      if (filterObject.planting_organization_uuid) {
        const stakeholderRelationshipQuery = knex.raw(
          `SELECT sg.stakeholder_id from stakeholder.getStakeholderChildren(?) sg 
               join stakeholder.stakeholder ss on ss.id = sg.stakeholder_id 
               where ss.type = 'Organization'`,
          [filterObject.planting_organization_uuid],
        );
        result.whereIn(
          'planting_organization_uuid',
          stakeholderRelationshipQuery,
        );
        delete filterObject.planting_organization_uuid;
      }
      result.where(filterObject);
    };

    // total number of growers
    const totalGrowersQuery = knex(this._tableName)
      .count('* as totalPlanters')
      .from(function () {
        this.distinct(
          'planter_first_name',
          'planter_last_name',
          'planter_identifier',
        )
          .from('tree_denormalized')
          .where((builder) => whereBuilder(filter, builder))
          .as('planters');
      });

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
          .from('tree_denormalized')
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
      .offset(options.offset);

    const topPlantersQuery = knex(this._tableName)
      .select(
        knex.raw('planter_first_name, planter_last_name, count(*) as count'),
      )
      .where((builder) => whereBuilder(filter, builder))
      .groupBy('planter_first_name', 'planter_last_name', 'planter_identifier')
      .orderBy('count', 'desc')
      .limit(options.limit)
      .offset(options.offset);

    const averageTreesPerPlanterQuery = knex(this._tableName)
      .avg('totalPlanters')
      .from(function () {
        this.count('* as totalPlanters')
          .from('tree_denormalized')
          .where((builder) => whereBuilder(filter, builder))
          .groupBy(
            'planter_first_name',
            'planter_last_name',
            'planter_identifier',
          )
          .as('planters');
      });

    const totalSpeciesQuery = knex(this._tableName)
      .where((builder) => whereBuilder(filter, builder))
      .countDistinct('species as totalSpecies');

    const topSpeciesQuery = knex(this._tableName)
      .select(knex.raw('species, count(*) as count'))
      .where((builder) => whereBuilder(filter, builder))
      .whereNotNull('species')
      .groupBy('species')
      .orderBy('count', 'desc')
      .limit(options.limit)
      .offset(options.offset);

    const averageTreesPerPlanterPerOrganizationQuery = knex(this._tableName)
      .avg('averageTreesPerPlanters')
      .from(function () {
        this.avg('count as averageTreesPerPlanters')
          .from(function () {
            this.select(
              knex.raw(
                `count(*) as count, planting_organization_name, planting_organization_uuid`,
              ),
            )
              .from('tree_denormalized')
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
      });

    const topAverageTreesPerPlanterPerOrganizationQuery = knex(this._tableName)
      .select(
        knex.raw(
          'planting_organization_name, avg(count) as averagetreesperplanters',
        ),
      )
      .from(function () {
        this.select(
          knex.raw(
            `count(*) as count, planting_organization_name, planting_organization_uuid`,
          ),
        )
          .from('tree_denormalized')
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
      .orderBy('averagetreesperplanters', 'desc')
      .limit(options.limit)
      .offset(options.offset);

    const totalTreesQuery = knex(this._tableName)
      .count()
      .where((builder) => whereBuilder({ ...filter }, builder));

    const topTreesQuery = knex(this._tableName)
      .select(knex.raw('planting_organization_name, count(*) as count'))
      .where((builder) => whereBuilder({ ...filter }, builder))
      .groupBy('planting_organization_uuid', 'planting_organization_name')
      .orderBy('count', 'desc')
      .limit(options.limit)
      .offset(options.offset);

    const lastUpdatedQuery = knex(this._tableName).max('created_at');

    if (filter?.card_title) {
      const { card_title } = filter;

      switch (card_title) {
        case 'planters': {
          const topGrowersPerOrganizatino =
            await topGrowersPerOrganizatinoQuery.cache();
          return { topGrowersPerOrganizatino };
        }
        case 'species': {
          const topSpecies = await topSpeciesQuery.cache();
          return { topSpecies };
        }
        case 'top_planters': {
          const topPlanters = await topPlantersQuery.cache();
          return { topPlanters };
        }
        case 'trees_per_planters': {
          const topAverageTreesPerPlanterPerOrganization =
            await topAverageTreesPerPlanterPerOrganizationQuery.cache();
          return { topAverageTreesPerPlanterPerOrganization };
        }

        case 'trees': {
          const topTrees = await topTreesQuery.cache();
          return { topTrees };
        }

        default:
          break;
      }
    }

    const totalGrowers = await totalGrowersQuery.cache();
    const topPlanters = await topPlantersQuery.cache();
    const averageTreesPerPlanter = await averageTreesPerPlanterQuery.cache();
    const topGrowersPerOrganizatino =
      await topGrowersPerOrganizatinoQuery.cache();
    const totalSpecies = await totalSpeciesQuery.cache();
    const topSpecies = await topSpeciesQuery.cache();
    const averageTreesPerPlanterPerOrganization =
      await averageTreesPerPlanterPerOrganizationQuery.cache();
    const topAverageTreesPerPlanterPerOrganization =
      await topAverageTreesPerPlanterPerOrganizationQuery.cache();
    const lastUpdated = await lastUpdatedQuery.cache();
    const totalTrees = await totalTreesQuery.cache();
    const topTrees = await topTreesQuery.cache();

    return {
      totalGrowers: +totalGrowers[0].totalPlanters,
      topPlanters,
      averageTreesPerPlanter: +averageTreesPerPlanter[0].avg,
      topGrowersPerOrganizatino,
      totalSpecies: +totalSpecies[0].totalSpecies,
      topSpecies,
      averageTreesPerPlanterPerOrganization:
        averageTreesPerPlanterPerOrganization[0].avg,
      topAverageTreesPerPlanterPerOrganization,
      lastUpdated: lastUpdated[0].max,
      totalTrees: +totalTrees[0].count,
      topTrees,
    };
  }
}

module.exports = TreeRepository;
