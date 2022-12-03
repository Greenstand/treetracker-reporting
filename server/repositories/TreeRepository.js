const BaseRepository = require('./BaseRepository');

class TreeRepository extends BaseRepository {
    constructor(session) {
        super('tree_denormalized', session);
        this._tableName = 'tree_denormalized';
        this._session = session;
    }

    async getTrees(filter, { limit, offset, order, orderBy }) {
        const whereBuilder = function (object, builder) {
            const result = builder;
            const filterObject = { ...object };
            if (filterObject.created_at) {
              result.where('created_at', '>=', filterObject.created_at);
              delete filterObject.created_at;
            }
            if (filterObject.tree_created_at) {
              result.where(
                'tree_created_at',
                '>=',
                filterObject.tree_created_at,
              );
              delete filterObject.tree_created_at;
            }
            result.where(filterObject);
          };
          let promise = this._session
            .getDB()(this._tableName)
            .where((builder) => whereBuilder(filter, builder));
          if (limit) {
            promise = promise.limit(limit);
          }
          if (offset) {
            promise = promise.offset(offset);
          }
          if (orderBy) {
            promise = promise.orderBy(orderBy, order);
          }
      
          const count = await this._session
            .getDB()(this._tableName)
            .count('*')
            .where((builder) => whereBuilder(filter, builder));
          return { captures: await promise, count: +count[0].count };        
    }
}

module.exports = TreeRepository;