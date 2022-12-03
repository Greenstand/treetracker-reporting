const express = require('express');

const router = express.Router();
const {
  captureGet,
  captureStatisticsGet,
  captureStatisticsGetCard,
} = require('./handlers/captureHandler');
const { handlerWrapper } = require('./utils/utils');
const {
  treeGet
} = require('./handlers/treeHandler');

router.get('/capture', handlerWrapper(captureGet));
router.get('/capture/statistics', handlerWrapper(captureStatisticsGet));
router.get(
  '/capture/statistics/card',
  handlerWrapper(captureStatisticsGetCard),
);

router.get('/tree', handlerWrapper(treeGet));

module.exports = router;
