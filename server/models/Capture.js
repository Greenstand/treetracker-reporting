const Capture = ({
  capture_uuid,
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
  planting_organization = undefined,
  since = undefined,
  since_date_paid = undefined,
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
    planting_organization,
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
  totalOrganizationPlanters = undefined,
  topOrganizationPlanters = [],
  totalSpecies = undefined,
  topSpecies = [],
  totalCaptures = undefined,
  topCaptures = [],
  totalUnverifiedCaptures = undefined,
  topUnverifiedCaptures = [],
}) => {
  const planters = {
    total: totalOrganizationPlanters,
    planters: topOrganizationPlanters.map(
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

  return {
    planters,
    species,
    captures,
    unverified_captures,
    top_planters,
  };
};

const getCaptureStatistics = async (captureRepo) => {
  const {
    topPlanters,
    averageCapturePerPlanter,
    totalOrganizationPlanters,
    topOrganizationPlanters,
    totalSpecies,
    topSpecies,
    totalCaptures,
    topCaptures,
    totalUnverifiedCaptures,
    topUnverifiedCaptures,
  } = await captureRepo.getStatistics();

  return generateFormattedResponse({
    topPlanters,
    averageCapturePerPlanter,
    totalOrganizationPlanters,
    topOrganizationPlanters,
    totalSpecies,
    topSpecies,
    totalCaptures,
    topCaptures,
    totalUnverifiedCaptures,
    topUnverifiedCaptures,
  });
};

const getCaptureStatisticsSingleCard =
  (captureRepo) => async (filterCriteria, url) => {
    const card_title = filterCriteria.card_title;
    let options = { limit: 7, offset: 0 };
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

    const result = await captureRepo.getStatistics(filterCriteria, options);

    return {
      [card_title]: generateFormattedResponse(result)[card_title][card_title],
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
};
