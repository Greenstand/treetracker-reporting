select year, count(name) from (select distinct name, year from region join (select estimated_geometric_location, extract(year from time_created) as year from trees) trees on ST_CONTAINS(region.geom, trees.estimated_geometric_location)  where type_id = 10) years group by year;