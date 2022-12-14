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
          ...(filter?.since_tree_created_at && {
            tree_created_at: new Date(filter.since_tree_created_at),
          }),
          ...(filter?.since_date_paid && {
            date_paid: new Date(filter.since_date_paid),
          }),
        };
    
        delete filterCriteria.since;
        delete filterCriteria.since_tree_created_at;
        delete filterCriteria.since_date_paid;
    
        const { trees, count } = await this._treeRepository.getTrees(
          filterCriteria,
          limitOptions,
        );
    
        return {
          trees: trees.map((row) => {
            return this.constructor.Tree({ ...row });
          }),
          totalCount: count,
        };
      }

      static generateFormattedResponse({
        averageTreesPerPlanter = undefined,
        topPlanters = [],
        totalGrowers = undefined,
        topGrowersPerOrganizatino = [],
        totalSpecies = undefined,
        topSpecies = [],
        totalTrees = undefined,
        topTrees = [],
        averageTreesPerPlanterPerOrganization = undefined,
        topAverageTreesPerPlanterPerOrganization = [],
        lastUpdated = undefined,
        genderCount = [],
      }) {
        const planters = {
          total: totalGrowers,
          planters: topGrowersPerOrganizatino.map(
            ({ planting_organization_name, count }) => {
              return { name: planting_organization_name, number: count };
            },
          ),
        };
    
        const species = {
          total: totalSpecies,
          species: topSpecies.map(({ species: s, count }) => {
            return { name: s, number: count };
          }),
        };
    
        const trees = {
          total: totalTrees,
          trees: topTrees.map(({ planting_organization_name, count }) => {
            return { name: planting_organization_name, number: count };
          }),
        };
    
        const top_planters = {
          average: Math.round(averageTreesPerPlanter),
          top_planters: topPlanters.map(
            ({ planter_first_name, planter_last_name, count }) => {
              return {
                name: `${planter_first_name} ${planter_last_name}`,
                number: count,
              };
            },
          ),
        };
    
        const trees_per_planters = {
          average: Math.round(averageTreesPerPlanterPerOrganization),
          trees_per_planters: topAverageTreesPerPlanterPerOrganization.map(
            ({ planting_organization_name, averagetreesperplanters }) => {
              return {
                name: planting_organization_name,
                number: Math.round(averagetreesperplanters),
              };
            },
          ),
        };
    
        const last_updated_at = lastUpdated;
    
        const totalCount = genderCount.reduce((a, b) => a + +b.count, 0);
    
        const gender_details = genderCount.map(({ gender, count }) => {
          return {
            name: gender,
            number: count,
            percentage: Math.round((+count / totalCount) * 100),
          };
        });
    
        return {
          planters,
          species,
          trees,
          top_planters,
          trees_per_planters,
          last_updated_at,
          gender_details: { total: totalGrowers, gender_details },
        };
      }

  async getTreeStatistics(filter) {
    const {
      topPlanters,
      averageTreePerPlanter,
      totalGrowers,
      topGrowersPerOrganizatino,
      totalSpecies,
      topSpecies,
      totalTrees,
      topTrees,
      totalUnverifiedTrees,
      topUnverifiedTrees,
      averageTreesPerPlanterPerOrganization,
      topAverageTreeesPerPlanterPerOrganization,
      lastUpdated,
      averageCatchment,
      topCatchment,
      genderCount,
    } = await this._treeRepository.getStatistics(filter);

    return this.constructor.generateFormattedResponse({
      topPlanters,
      averageTreePerPlanter,
      totalGrowers,
      topGrowersPerOrganizatino,
      totalSpecies,
      topSpecies,
      totalTrees,
      topTrees,
      totalUnverifiedTrees,
      topUnverifiedTrees,
      averageTreesPerPlanterPerOrganization,
      topAverageTreeesPerPlanterPerOrganization,
      lastUpdated,
      averageCatchment,
      topCatchment,
      genderCount,
    });
  }

  async getTreeStatisticsSingleCard(filter, limitOptions) {
    const { card_title } = filter;

    const result = await this._treeRepository.getStatistics(
      filter,
      limitOptions,
    );

    return {
      card_information:
        this.constructor.generateFormattedResponse(result)[card_title][
          card_title
        ],
    };
  }
}

module.exports = Tree;