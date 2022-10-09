const Joi = require('joi');
const CaptureService = require('../services/CaptureService');
const {
  generatePrevAndNext,
  getFilterAndLimitOptions,
} = require('../utils/helper');

const captureGetQuerySchema = Joi.object({
  approved: Joi.boolean(),
  capture_uuid: Joi.string().uuid(),
  limit: Joi.number().integer().greater(0).less(1001),
  offset: Joi.number().integer().greater(-1),
  paid_by: Joi.string(),
  planter_first_name: Joi.string(),
  planter_identifier: Joi.string(),
  planter_last_name: Joi.string(),
  planting_organization_name: Joi.string(),
  planting_organization_uuid: Joi.string().uuid(),
  since: Joi.date().iso(),
  since_date_paid: Joi.date().iso(),
  since_capture_created_at: Joi.date().iso(),
  species: Joi.string(),
  token_id: Joi.string().uuid(),
  catchment: Joi.string(),
  sort_by: Joi.string().valid(
    'capture_uuid',
    'capture_created_at',
    'planter_first_name',
    'planter_last_name',
    'planter_identifier',
    'created_at',
    'lat',
    'lon',
    'note',
    'approved',
    'planting_organization_uuid',
    'planting_organization_name',
    'date_paid',
    'paid_by',
    'payment_local_amt',
    'species',
    'token_id',
    'catchment',
  ),
  order: Joi.string().valid('asc', 'desc').default('asc'),
}).unknown(false);

const captureStatisticsQuerySchema = Joi.object({
  capture_created_start_date: Joi.date().iso(),
  capture_created_end_date: Joi.date().iso(),
  clear_cache: Joi.boolean(),
}).unknown(false);

const captureStatisticsGetCardQuerySchema = Joi.object({
  limit: Joi.number().integer().greater(0).less(101),
  offset: Joi.number().integer().greater(-1),
  capture_created_start_date: Joi.date().iso(),
  capture_created_end_date: Joi.date().iso(),
  clear_cache: Joi.boolean(),
  card_title: Joi.string()
    .valid(
      'planters',
      'species',
      'captures',
      'unverified_captures',
      'top_planters',
      'trees_per_planters',
      'catchments',
      'gender_details',
    )
    .required(),
}).unknown(false);

const captureGet = async (req, res) => {
  const query = await captureGetQuerySchema.validateAsync(req.query, {
    abortEarly: false,
  });
  const { filter, limitOptions } = getFilterAndLimitOptions(query);
  const captureService = new CaptureService();
  const { totalCount, captures } = await captureService.getCaptures(
    filter,
    limitOptions,
  );

  const url = `capture`;

  const links = generatePrevAndNext({
    url,
    count: totalCount,
    limitOptions,
    queryObject: { ...filter, ...limitOptions },
  });

  res.send({
    captures,
    links,
    totalCount,
    query: { ...limitOptions, ...filter },
  });
};

const captureStatisticsGet = async (req, res) => {
  await captureStatisticsQuerySchema.validateAsync(req.query, {
    abortEarly: false,
  });
  const captureService = new CaptureService();
  const result = await captureService.getCaptureStatistics(req.query);

  res.send(result);
  res.end();
};

const captureStatisticsGetCard = async (req, res) => {
  await captureStatisticsGetCardQuerySchema.validateAsync(req.query, {
    abortEarly: false,
  });
  const captureService = new CaptureService();

  const { filter, limitOptions } = getFilterAndLimitOptions(req.query);
  const { card_information = [] } =
    await captureService.getCaptureStatisticsSingleCard(filter, limitOptions);

  res.send({
    card_information,
    query: { ...limitOptions, ...filter },
  });
};

const captureGrowerApprovalRate = async (req, res) => {
  const captureService = new CaptureService();

  const { limitOptions } = getFilterAndLimitOptions(req.query);
  const result = await captureService.getCaptureApprovalRateForGrowers(
    limitOptions,
  );
  res.send(result);
};

module.exports = {
  captureGet,
  captureStatisticsGet,
  captureStatisticsGetCard,
  captureGrowerApprovalRate,
};
