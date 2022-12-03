const Session = require('../infra/database/Session');
const Tree = require('../models/Tree');

class TreeService {
    constructor() {
        this._session = new Session();
        this._tree= new Tree(this._session);
    }

    async getTrees(filter, limitOptions) {
        return this._tree.getTrees(filter, limitOptions);
      }
}

module.exports = TreeService;