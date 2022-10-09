const Session = require('../infra/database/Session');
const Capture = require('../models/Capture');

class CaptureService {
  constructor() {
    this._session = new Session();
    this._capture = new Capture(this._session);
  }

  async clearCache(filterParam) {
    const filter = { ...filterParam };
    if (filter.clear_cache) {
      await this._session.getDB().resetCache();
    }
    delete filter.clear_cache;
    return filter;
  }

  async getCaptures(filter, limitOptions) {
    return this._capture.getCaptures(filter, limitOptions);
  }

  async getCaptureStatistics(filterParam) {
    const filter = await this.clearCache(filterParam);
    return this._capture.getCaptureStatistics(filter);
  }

  async getCaptureStatisticsSingleCard(filterParam, limitOptions) {
    const filter = await this.clearCache(filterParam);
    return this._capture.getCaptureStatisticsSingleCard(filter, limitOptions);
  }

  async getCaptureApprovalRateForGrowers(limitOptions) {
    return this._capture.getCaptureApprovalRateForGrowers(limitOptions);
  }
}

module.exports = CaptureService;
