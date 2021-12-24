const expect = require('expect-runtime');
const log = require('loglevel');
const NodeCache = require('node-cache');
const dbCache = new NodeCache({ checkperiod: 86400 });

const connection = require('../../config/config').connectionString;

expect(connection).to.match(/^postgresql:\//);

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

const knex = require('knex');

knex.QueryBuilder.extend('cache', async function () {
  try {
    const cacheKey = this.toString();
    const cacheValue = dbCache.get(cacheKey);
    if (cacheValue) {
      return cacheValue;
    }
    const data = await this;
    dbCache.set(cacheKey, data, 86400);
    return data;
  } catch (e) {
    throw new Error(e);
  }
});

module.exports = knex(knexConfig);
