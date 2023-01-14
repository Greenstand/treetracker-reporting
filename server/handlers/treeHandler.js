const Joi = require('joi');
const TreeService = require('../services/TreeService');
const {
  generatePrevAndNext,
  getFilterAndLimitOptions,
} = require('../utils/helper');

const treeGetQuerySchema = Joi.object({
  tree_uuid: Joi.string().uuid(),
  limit: Joi.number().integer().greater(0).less(1001),
  offset: Joi.number().integer().greater(-1),
  planter_first_name: Joi.string(),
  planter_identifier: Joi.string(),
  planter_last_name: Joi.string(),
  planting_organization_name: Joi.string(),
  planting_organization_uuid: Joi.string().uuid(),
  species: Joi.string(),
  sort_by: Joi.string().valid(
    'tree_uuid',
    'tree_created_at',
    'planter_first_name',
    'planter_last_name',
    'planter_identifier',
    'created_at',
    'lat',
    'lon',
    'note',
    'planting_organization_uuid',
    'planting_organization_name',
    'species',
  ),
  order: Joi.string().valid('asc', 'desc').default('asc'),
}).unknown(false);

const treeStatisticsQuerySchema = Joi.object({
  tree_created_start_date: Joi.date().iso(),
  tree_created_end_date: Joi.date().iso(),
  planting_organization_uuid: Joi.string().uuid(),
  clear_cache: Joi.boolean(),
}).unknown(false);

const treeStatisticsGetCardQuerySchema = Joi.object({
  limit: Joi.number().integer().greater(0).less(101),
  offset: Joi.number().integer().greater(-1),
  tree_created_start_date: Joi.date().iso(),
  tree_created_end_date: Joi.date().iso(),
  planting_organization_uuid: Joi.string().uuid(),
  clear_cache: Joi.boolean(),
  card_title: Joi.string()
    .valid('planters', 'species', 'trees', 'top_planters', 'trees_per_planters')
    .required(),
}).unknown(false);

const treeGet = async (req, res) => {
  const query = await treeGetQuerySchema.validateAsync(req.query, {
    abortEarly: false,
  });
  const { filter, limitOptions } = getFilterAndLimitOptions(query);
  const treeService = new TreeService();
  const { totalCount, trees } = await treeService.getTrees(
    filter,
    limitOptions,
  );

  const url = `tree`;

  const links = generatePrevAndNext({
    url,
    count: totalCount,
    limitOptions,
    queryObject: { ...filter, ...limitOptions },
  });

  res.send({
    trees,
    links,
    totalCount,
    query: { ...limitOptions, ...filter },
  });
};

const treeStatisticsGet = async (req, res) => {
  await treeStatisticsQuerySchema.validateAsync(req.query, {
    abortEarly: false,
  });
  const treeService = new TreeService();
  const result = await treeService.getTreeStatistics(req.query);

  res.send(result);
  res.end();
};

const treeStatisticsGetCard = async (req, res) => {
  await treeStatisticsGetCardQuerySchema.validateAsync(req.query, {
    abortEarly: false,
  });
  const treeService = new TreeService();

  const { filter, limitOptions } = getFilterAndLimitOptions(req.query);
  const { card_information = [] } =
    await treeService.getTreeStatisticsSingleCard(filter, limitOptions);

  res.send({
    card_information,
    query: { ...limitOptions, ...filter },
  });
};

module.exports = {
  treeGet,
  treeStatisticsGet,
  treeStatisticsGetCard,
};
