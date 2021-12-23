const Capture = ({
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
}) => {
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
  });
};

const FilterCriteria = ({
  approved = undefined,
  capture_uuid = undefined,
  paid_by = undefined,
  planter_first_name = undefined,
  planter_identifier = undefined,
  planter_last_name = undefined,
  planting_organization_uuid = undefined,
  planting_organization_name = undefined,
  since = undefined,
  since_date_paid = undefined,
  since_capture_created_at = undefined,
  species = undefined,
  token_id = undefined,
}) => {
  return Object.entries({
    capture_uuid,
    planter_first_name,
    planter_last_name,
    planter_identifier,
    created_at: since && new Date(since),
    approved,
    planting_organization_uuid,
    planting_organization_name,
    capture_created_at:
      since_capture_created_at && new Date(since_capture_created_at),
    date_paid: since_date_paid && new Date(since_date_paid),
    paid_by,
    species,
    token_id,
  })
    .filter((entry) => entry[1] !== undefined)
    .reduce((result, item) => {
      result[item[0]] = item[1];
      return result;
    }, {});
};

const QueryOptions = ({
  limit = undefined,
  offset = undefined,
  order = 'asc',
  sort_by = undefined,
}) => {
  return Object.entries({ limit, offset, order, orderBy: sort_by })
    .filter((entry) => entry[1] !== undefined)
    .reduce((result, item) => {
      result[item[0]] = item[1];
      return result;
    }, {});
};

const StatisticsFilterCriteria = ({
  capture_created_start_date = undefined,
  capture_created_end_date = undefined,
  card_title = undefined,
}) => {
  return Object.entries({
    capture_created_start_date,
    capture_created_end_date,
    card_title,
  })
    .filter((entry) => entry[1] !== undefined)
    .reduce((result, item) => {
      result[item[0]] = item[1];
      return result;
    }, {});
};

const getCaptures =
  (captureRepo) =>
  async (filterCriteria = undefined, url) => {
    let filter = {};
    let options = { limit: 100, offset: 0 };
    filter = FilterCriteria({
      ...filterCriteria,
    });
    options = { ...options, ...QueryOptions({ ...filterCriteria }) };

    const queryFilterObjects = { ...filterCriteria };
    queryFilterObjects.limit = options.limit;

    // remove offset property, as it is calculated later
    delete queryFilterObjects.offset;

    const query = Object.keys(queryFilterObjects)
      .map((key) => `${key}=${encodeURIComponent(queryFilterObjects[key])}`)
      .join('&');

    const urlWithLimitAndOffset = `${url}?${query}&offset=`;

    const next = `${urlWithLimitAndOffset}${+options.offset + +options.limit}`;
    let prev = null;
    if (options.offset - +options.limit >= 0) {
      prev = `${urlWithLimitAndOffset}${+options.offset - +options.limit}`;
    }

    const { captures, count } = await captureRepo.getCaptures(filter, options);

    return {
      captures: captures.map((row) => {
        return Capture({ ...row });
      }),
      totalCount: count,
      links: {
        prev,
        next,
      },
    };
  };

const generateFormattedResponse = ({
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
}) => {
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
    species: topSpecies.map(({ species, count }) => {
      return { name: species, number: count };
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
          number: averagecapturesperplanters,
        };
      },
    ),
  };

  const last_updated_at = lastUpdated;

  return {
    planters,
    species,
    captures,
    unverified_captures,
    top_planters,
    trees_per_planters,
    last_updated_at,
  };
};

const getCaptureStatistics = async (captureRepo, filterCriteria) => {
  const filter = StatisticsFilterCriteria({ ...filterCriteria });
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
  } = await captureRepo.getStatistics(filter);

  return generateFormattedResponse({
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
  });
};

const getCaptureStatisticsSingleCard =
  (captureRepo) => async (filterCriteria, url) => {
    const { card_title } = filterCriteria;
    let options = { limit: 7, offset: 0 };
    options = { ...options, ...QueryOptions({ ...filterCriteria }) };

    const filter = StatisticsFilterCriteria({ ...filterCriteria });

    const queryFilterObjects = { ...filterCriteria };
    queryFilterObjects.limit = options.limit;

    // remove offset property, as it is calculated later
    delete queryFilterObjects.offset;

    const query = Object.keys(queryFilterObjects)
      .map((key) => `${key}=${encodeURIComponent(queryFilterObjects[key])}`)
      .join('&');

    const urlWithLimitAndOffset = `${url}?${query}&offset=`;

    const next = `${urlWithLimitAndOffset}${+options.offset + +options.limit}`;
    let prev = null;
    if (options.offset - +options.limit >= 0) {
      prev = `${urlWithLimitAndOffset}${+options.offset - +options.limit}`;
    }

    const result = await captureRepo.getStatistics(filter, options);

    return {
      card_information:
        generateFormattedResponse(result)[card_title][card_title],
      links: {
        prev,
        next,
      },
    };
  };

module.exports = {
  getCaptures,
  getCaptureStatistics,
  getCaptureStatisticsSingleCard,
  generateFormattedResponse,
  QueryOptions,
  StatisticsFilterCriteria,
  FilterCriteria,
  Capture,
};
