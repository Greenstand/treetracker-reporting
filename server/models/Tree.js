const TreeRepository = require('../repositories/TreeRepository');

class Tree {
    constructor(session) {
        this._treeRepository = new TreeRepository(session);
    }

    static Tree({
        tree_uuid,
        tree_created_at,
        planter_first_name,
        planter_last_name,
        planter_identifier,
        created_at,
        lat,
        lon,
        note,
        planting_organization_uuid,
        planting_organization_name,
        species,
      }) {
        return Object.freeze({
          tree_uuid,
          tree_created_at,
          planter_first_name,
          planter_last_name,
          planter_identifier,
          created_at,
          lat,
          lon,
          note,
          planting_organization_uuid,
          planting_organization_name,
          species,
        });
      }

      async getTrees(filter, limitOptions) {
        const filterCriteria = {
          ...filter,
          ...(filter?.since && { created_at: new Date(filter.since) }),
          ...(filter?.since_capture_created_at && {
            capture_created_at: new Date(filter.since_capture_created_at),
          }),
          ...(filter?.since_date_paid && {
            date_paid: new Date(filter.since_date_paid),
          }),
        };
    
        delete filterCriteria.since;
        delete filterCriteria.since_capture_created_at;
        delete filterCriteria.since_date_paid;
    
        const { captures, count } = await this._treeRepository.getTrees(
          filterCriteria,
          limitOptions,
        );
    
        return {
          captures: captures.map((row) => {
            return this.constructor.Tree({ ...row });
          }),
          totalCount: count,
        };
      }
}

module.exports = Tree;