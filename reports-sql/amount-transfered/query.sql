select sum(usd_amt), year from ( select extract(year from date_paid) as year, usd_amt  from payment order by date_paid) years group by year;
