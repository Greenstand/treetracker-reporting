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
    const totalOrganizationPlantersQuery = this._session
      .getDB()
      .raw(
        `SELECT COUNT(*) FROM (SELECT DISTINCT planting_organization_uuid FROM capture_denormalized) AS totalPlanters;`,
      );

    const topOrganizationPlantersQuery = this._session
      .getDB()
      .raw(
        `SELECT planting_organization_name, COUNT(*) FROM capture_denormalized GROUP BY planting_organization_uuid, planting_organization_name ORDER BY COUNT(*) DESC LIMIT ${options.limit} OFFSET ${options.offset}`,
      );

    const topPlantersQuery = this._session
      .getDB()
      .raw(
        `SELECT planter_first_name, planter_last_name, COUNT(*) FROM capture_denormalized GROUP BY planter_first_name, planter_last_name, planter_identifier ORDER BY COUNT(*) DESC LIMIT ${options.limit} OFFSET ${options.offset}`,
      );

    const averageCapturePerPlanterQuery = this._session
      .getDB()
      .raw(
        `SELECT  AVG(totalPlanters) FROM (SELECT COUNT(*) AS totalPlanters from public.capture_denormalized group by planter_first_name, planter_last_name, planter_identifier ) AS planters`,
      );

    const totalSpeciesQuery = this._session
      .getDB()
      .raw(
        `SELECT COUNT(*) FROM (SELECT DISTINCT species FROM capture_denormalized) AS totalSpecies;`,
      );

    const topSpeciesQuery = this._session
      .getDB()
      .raw(
        `SELECT species, COUNT(*) FROM capture_denormalized GROUP BY species ORDER BY COUNT(*) DESC LIMIT ${options.limit} OFFSET ${options.offset}`,
      );

    const totalApprovedCapturesQuery = this._session
      .getDB()
      .raw('SELECT COUNT(*) FROM capture_denormalized WHERE approved = true');

    const topApprovedCapturesQuery = this._session
      .getDB()
      .raw(
        `SELECT planting_organization_name, COUNT(*) FROM capture_denormalized WHERE approved = true GROUP BY planting_organization_uuid, planting_organization_name ORDER BY COUNT(*) DESC LIMIT ${options.limit} OFFSET ${options.offset}`,
      );

    const totalUnverifiedCapturesQuery = this._session
      .getDB()
      .raw('SELECT COUNT(*) FROM capture_denormalized WHERE approved = false');

    const topUnverifiedCapturesQuery = this._session
      .getDB()
      .raw(
        `SELECT planting_organization_name, COUNT(*) FROM capture_denormalized WHERE approved = false GROUP BY planting_organization_uuid, planting_organization_name ORDER BY COUNT(*) DESC LIMIT ${options.limit} OFFSET ${options.offset}`,
      );

    if (filter?.card_title) {
      const { card_title } = filter;

      switch (card_title) {
        case 'planters':
          const topOrganizationPlanters = await topOrganizationPlantersQuery;
          return { topOrganizationPlanters: topOrganizationPlanters.rows };
        case 'species':
          const topSpecies = await topSpeciesQuery;
          return { topSpecies: topSpecies.rows };
        case 'captures':
          const topApprovedCaptures = await topApprovedCapturesQuery;
          return { topCaptures: topApprovedCaptures.rows };
        case 'unverified_captures':
          const topUnverifiedCaptures = await topUnverifiedCapturesQuery;
          return { topUnverifiedCaptures: topUnverifiedCaptures.rows };
        case 'top_planters':
          const topPlanters = await topPlantersQuery;
          return { topPlanters: topPlanters.rows };

        default:
          break;
      }
    }

    const totalOrganizationPlanters = await totalOrganizationPlantersQuery;
    const topPlanters = await topPlantersQuery;
    const averageCapturePerPlanter = await averageCapturePerPlanterQuery;
    const topOrganizationPlanters = await topOrganizationPlantersQuery;
    const totalSpecies = await totalSpeciesQuery;
    const topSpecies = await topSpeciesQuery;
    const totalApprovedCaptures = await totalApprovedCapturesQuery;
    const topApprovedCaptures = await topApprovedCapturesQuery;
    const totalUnverifiedCaptures = await totalUnverifiedCapturesQuery;
    const topUnverifiedCaptures = await topUnverifiedCapturesQuery;

    return {
      totalOrganizationPlanters: +totalOrganizationPlanters.rows[0].count,
      topPlanters: topPlanters.rows,
      averageCapturePerPlanter: +averageCapturePerPlanter.rows[0].avg,
      topOrganizationPlanters: topOrganizationPlanters.rows,
      totalSpecies: +totalSpecies.rows[0].count,
      topSpecies: topSpecies.rows,
      totalCaptures: +totalApprovedCaptures.rows[0].count,
      topCaptures: topApprovedCaptures.rows,
      totalUnverifiedCaptures: +totalUnverifiedCaptures.rows[0].count,
      topUnverifiedCaptures: topUnverifiedCaptures.rows,
    };
  }
}

module.exports = CaptureRepository;
