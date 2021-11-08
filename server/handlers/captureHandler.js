const Joi = require('joi');
const Session = require('../models/Session');
const CaptureRepository = require('../repositories/CaptureRepository');
const { getCaptures } = require('../models/Capture');

const captureGetQuerySchema = Joi.object({
  approved: Joi.boolean(),
  capture_uuid: Joi.string().uuid(),
  lat: Joi.number(),
  lon: Joi.number(),
  note: Joi.string(),
  limit: Joi.number().integer().greater(0).less(101),
  offset: Joi.number().integer().greater(-1),
  paid_by: Joi.string(),
  payment_local_amt: Joi.number(),
  planter_first_name: Joi.string(),
  planter_identifier: Joi.string(),
  planter_last_name: Joi.string(),
  planting_organization: Joi.string(),
  since: Joi.date().iso(),
  since_date_paid: Joi.date().iso(),
  species: Joi.date().iso(),
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

const captureGet = async (req, res) => {
  await captureGetQuerySchema.validateAsync(req.query, { abortEarly: false });
  const session = new Session();
  const captureRepo = new CaptureRepository(session);

  const url = `${req.protocol}://${req.get('host')}/capture`;

  const executeGetCapture = getCaptures(captureRepo);
  const result = await executeGetCapture(req.query, url);
  res.send(result);
  res.end();
};

module.exports = {
  captureGet,
};
