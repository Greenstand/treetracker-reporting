const Joi = require('joi');
const Session = require('../models/Session');
const CaptureRepository = require('../repositories/CaptureRepository');
const {
  getCaptures,
  getCaptureStatistics,
  getCaptureStatisticsSingleCard,
} = require('../models/Capture');

const captureGetQuerySchema = Joi.object({
  approved: Joi.boolean(),
  capture_uuid: Joi.string().uuid(),
  limit: Joi.number().integer().greater(0).less(1001),
  offset: Joi.number().integer().greater(-1),
  paid_by: Joi.string(),
  planter_first_name: Joi.string(),
  planter_identifier: Joi.string(),
  planter_last_name: Joi.string(),
  planting_organization: Joi.string(),
  since: Joi.date().iso(),
  since_date_paid: Joi.date().iso(),
  species: Joi.string(),
  token_id: Joi.string().uuid(),
  sort_by: Joi.string().valid(
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
  ),
  order: Joi.string().valid('asc', 'desc'),
}).unknown(false);

const captureStatisticsGetCardQuerySchema = Joi.object({
  limit: Joi.number().integer().greater(0).less(10),
  offset: Joi.number().integer().greater(-1),
  card_title: Joi.string()
    .valid(
      'planters',
      'species',
      'captures',
      'unverified_captures',
      'top_planters',
    )
    .required(),
}).unknown(false);

const captureGet = async (req, res) => {
  await captureGetQuerySchema.validateAsync(req.query, { abortEarly: false });
  const session = new Session();
  const captureRepo = new CaptureRepository(session);

  const url = `capture`;

  const executeGetCapture = getCaptures(captureRepo);
  const result = await executeGetCapture(req.query, url);
  res.send(result);
  res.end();
};

const captureStatisticsGet = async (req, res) => {
  const session = new Session();
  const captureRepo = new CaptureRepository(session);

  const result = await getCaptureStatistics(captureRepo);
  res.send(result);
  res.end();
};

const captureStatisticsGetCard = async (req, res) => {
  await captureStatisticsGetCardQuerySchema.validateAsync(req.query, {
    abortEarly: false,
  });
  const session = new Session();
  const captureRepo = new CaptureRepository(session);

  const url = `capture/statistics/card`;

  const executeGetCaptureStatisticsCard =
    getCaptureStatisticsSingleCard(captureRepo);
  const result = await executeGetCaptureStatisticsCard(req.query, url);
  res.send(result);
  res.end();
};

module.exports = {
  captureGet,
  captureStatisticsGet,
  captureStatisticsGetCard,
};
