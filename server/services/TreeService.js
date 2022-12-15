const Session = require('../infra/database/Session');
const Tree = require('../models/Tree');

class TreeService {
    constructor() {
        this._session = new Session();
        this._tree= new Tree(this._session);
    }

    async clearCache(filterParam) {
        const filter = { ...filterParam };
        if (filter.clear_cache) {
          await this._session.getDB().resetCache();
        }
        delete filter.clear_cache;
        return filter;
    }

    async getTrees(filter, limitOptions) {
        return this._tree.getTrees(filter, limitOptions);
      }

    async getTreeStatistics(filterParam) {
        const filter = await this.clearCache(filterParam);
        return this._tree.getTreeStatistics(filter);
    }

    async getTreeStatisticsSingleCard(filterParam, limitOptions) {
        const filter = await this.clearCache(filterParam);
        return this._tree.getTreeStatisticsSingleCard(filter, limitOptions);
    }
}

module.exports = TreeService;