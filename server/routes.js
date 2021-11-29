const express = require('express');

const router = express.Router();
const {
  captureGet,
  captureStatisticsGet,
  captureStatisticsGetCard,
} = require('./handlers/captureHandler');
const { handlerWrapper } = require('./utils/utils');

router.get('/capture', handlerWrapper(captureGet));
router.get('/capture/statistics', handlerWrapper(captureStatisticsGet));
router.get(
  '/capture/statistics/card',
  handlerWrapper(captureStatisticsGetCard),
);

module.exports = router;
