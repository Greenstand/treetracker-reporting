const expect = require('expect-runtime');
const log = require('loglevel');
const NodeCache = require('node-cache');

const dbCache = new NodeCache({ checkperiod: 28800 });

const knex = require('knex');
const connection = require('../../../config/config').connectionString;

const postgresPattern = /^postgresql:\//;

if (!postgresPattern.test(connection)) {
  throw new Error('invalid database connection url received');
}

const knexConfig = {
  client: 'pg',
  debug: process.env.NODE_LOG_LEVEL === 'debug',
  connection,
  pool: { min: 0, max: 100 },
};

log.debug(process.env.DATABASE_SCHEMA);
if (process.env.DATABASE_SCHEMA) {
  log.info('setting a schema');
  knexConfig.searchPath = [process.env.DATABASE_SCHEMA];
}
log.debug(knexConfig.searchPath);

knex.QueryBuilder.extend('cache', async function () {
  try {
    const cacheKey = this.toString();
    const cacheValue = dbCache.get(cacheKey);
    if (cacheValue) {
      return cacheValue;
    }
    const data = await this;
    dbCache.set(cacheKey, data, 28800);
    return data;
  } catch (e) {
    throw new Error(e);
  }
});

module.exports = knex(knexConfig);
