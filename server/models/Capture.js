const CaptureRepository = require('../repositories/CaptureRepository');

class Capture {
  constructor(session) {
    this._captureRepository = new CaptureRepository(session);
  }

  static Capture({
    capture_uuid,
    capture_created_at,
    planter_first_name,
    planter_last_name,
    planter_identifier,
    created_at,
    lat,
    lon,
    note,
    approved,
    planting_organization_uuid,
    planting_organization_name,
    date_paid,
    paid_by,
    payment_local_amt,
    species,
    token_id,
    catchment,
  }) {
    return Object.freeze({
      capture_uuid,
      capture_created_at,
      planter_first_name,
      planter_last_name,
      planter_identifier,
      created_at,
      lat,
      lon,
      note,
      approved,
      planting_organization_uuid,
      planting_organization_name,
      date_paid,
      paid_by,
      payment_local_amt,
      species,
      token_id,
      catchment,
    });
  }

  async getCaptures(filter, limitOptions) {
    const filterCriteria = {
      ...filter,
      ...(filter?.since && { created_at: new Date(filter.since) }),
      ...(filter?.since_capture_created_at && {
        capture_created_at: new Date(filter.since_capture_created_at),
      }),
      ...(filter?.since_date_paid && {
        date_paid: new Date(filter.since_date_paid),
      }),
    };

    delete filterCriteria.since;
    delete filterCriteria.since_capture_created_at;
    delete filterCriteria.since_date_paid;

    const { captures, count } = await this._captureRepository.getCaptures(
      filterCriteria,
      limitOptions,
    );

    return {
      captures: captures.map((row) => {
        return this.constructor.Capture({ ...row });
      }),
      totalCount: count,
    };
  }

  static generateFormattedResponse({
    averageCapturePerPlanter = undefined,
    topPlanters = [],
    totalGrowers = undefined,
    topGrowersPerOrganizatino = [],
    totalSpecies = undefined,
    topSpecies = [],
    totalCaptures = undefined,
    topCaptures = [],
    totalUnverifiedCaptures = undefined,
    topUnverifiedCaptures = [],
    averageCapturesPerPlanterPerOrganization = undefined,
    topAverageCapturesPerPlanterPerOrganization = [],
    lastUpdated = undefined,
    averageCatchment = undefined,
    topCatchment = [],
    genderCount = [],
  }) {
    const planters = {
      total: totalGrowers,
      planters: topGrowersPerOrganizatino.map(
        ({ planting_organization_name, count }) => {
          return { name: planting_organization_name, number: count };
        },
      ),
    };

    const species = {
      total: totalSpecies,
      species: topSpecies.map(({ species: s, count }) => {
        return { name: s, number: count };
      }),
    };

    const captures = {
      total: totalCaptures,
      captures: topCaptures.map(({ planting_organization_name, count }) => {
        return { name: planting_organization_name, number: count };
      }),
    };

    const unverified_captures = {
      total: totalUnverifiedCaptures,
      unverified_captures: topUnverifiedCaptures.map(
        ({ planting_organization_name, count }) => {
          return { name: planting_organization_name, number: count };
        },
      ),
    };

    const top_planters = {
      average: Math.round(averageCapturePerPlanter),
      top_planters: topPlanters.map(
        ({ planter_first_name, planter_last_name, count }) => {
          return {
            name: `${planter_first_name} ${planter_last_name}`,
            number: count,
          };
        },
      ),
    };

    const trees_per_planters = {
      average: Math.round(averageCapturesPerPlanterPerOrganization),
      trees_per_planters: topAverageCapturesPerPlanterPerOrganization.map(
        ({ planting_organization_name, averagecapturesperplanters }) => {
          return {
            name: planting_organization_name,
            number: Math.round(averagecapturesperplanters),
          };
        },
      ),
    };

    const last_updated_at = lastUpdated;

    const catchments = {
      average: Math.round(averageCatchment),
      catchments: topCatchment.map(({ catchment, count }) => {
        return { name: catchment, number: count };
      }),
    };

    const totalCount = genderCount.reduce((a, b) => a + +b.count, 0);

    const gender_details = genderCount.map(({ gender, count }) => {
      return {
        gender,
        count,
        percentage: (+count / totalCount) * 100,
      };
    });

    return {
      planters,
      species,
      captures,
      unverified_captures,
      top_planters,
      trees_per_planters,
      last_updated_at,
      catchments,
      gender_details,
    };
  }

  async getCaptureStatistics(filter) {
    const {
      topPlanters,
      averageCapturePerPlanter,
      totalGrowers,
      topGrowersPerOrganizatino,
      totalSpecies,
      topSpecies,
      totalCaptures,
      topCaptures,
      totalUnverifiedCaptures,
      topUnverifiedCaptures,
      averageCapturesPerPlanterPerOrganization,
      topAverageCapturesPerPlanterPerOrganization,
      lastUpdated,
      averageCatchment,
      topCatchment,
      genderCount,
    } = await this._captureRepository.getStatistics(filter);

    return this.constructor.generateFormattedResponse({
      topPlanters,
      averageCapturePerPlanter,
      totalGrowers,
      topGrowersPerOrganizatino,
      totalSpecies,
      topSpecies,
      totalCaptures,
      topCaptures,
      totalUnverifiedCaptures,
      topUnverifiedCaptures,
      averageCapturesPerPlanterPerOrganization,
      topAverageCapturesPerPlanterPerOrganization,
      lastUpdated,
      averageCatchment,
      topCatchment,
      genderCount,
    });
  }

  async getCaptureStatisticsSingleCard(filter, limitOptions) {
    const { card_title } = filter;

    const result = await this._captureRepository.getStatistics(
      filter,
      limitOptions,
    );

    return {
      card_information:
        this.constructor.generateFormattedResponse(result)[card_title][
          card_title
        ],
    };
  }
}

module.exports = Capture;
