const express = require('express');

const router = express.Router();
const { captureGet } = require('./handlers/captureHandler');
const { handlerWrapper } = require('./utils/utils');

router.get('/capture', handlerWrapper(captureGet));

module.exports = router;
