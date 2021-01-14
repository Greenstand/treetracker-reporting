select count(year), year from ( select extract(year from date_paid) as year  from payment order by date_paid) years group by year;
