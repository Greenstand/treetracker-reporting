const express = require('express');

const router = express.Router();
const {
  captureGet,
  captureStatisticsGet,
  captureStatisticsGetCard,
} = require('./handlers/captureHandler');
const { handlerWrapper } = require('./utils/utils');
const {
  treeGet,
  treeStatisticsGet,
  treeStatisticsGetCard
} = require('./handlers/treeHandler');

router.get('/capture', handlerWrapper(captureGet));
router.get('/capture/statistics', handlerWrapper(captureStatisticsGet));
router.get(
  '/capture/statistics/card',
  handlerWrapper(captureStatisticsGetCard),
);

router.get('/tree', handlerWrapper(treeGet));
router.get('/tree/statistics', handlerWrapper(treeStatisticsGet));
router.get('/tree/statistics/card', handlerWrapper(treeStatisticsGetCard));

module.exports = router;
