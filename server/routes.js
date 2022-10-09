const express = require('express');

const router = express.Router();
const {
  captureGet,
  captureStatisticsGet,
  captureStatisticsGetCard,
  captureGrowerApprovalRate,
} = require('./handlers/captureHandler');
const { handlerWrapper } = require('./utils/utils');

router.get('/capture', handlerWrapper(captureGet));
router.get('/capture/statistics', handlerWrapper(captureStatisticsGet));
router.get(
  '/capture/statistics/card',
  handlerWrapper(captureStatisticsGetCard),
);
router.get('/capture/approvalRate', handlerWrapper(captureGrowerApprovalRate));

module.exports = router;
