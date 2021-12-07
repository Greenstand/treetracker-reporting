/*
 * A test server for testing, seed some initial data into the DB
 */
require('dotenv').config();
const log = require('loglevel');

const app = require('../server/app');

const port = process.env.NODE_PORT || 3006;
const seed = require('./seed-example');
// set the log level
require('../server/setup');

app.listen(port, async () => {
  log.info(`listening on port:${port}`);
  log.info('Seed data');
  log.debug('debug log level!');
  await seed.clear();
  await seed.seed();
});
