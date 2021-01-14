select year, count(year) from (select extract(year from time_created) as year from trees where active = false) years group by year order by year asc;
