CREATE TABLE capture_denormalized
(
    capture_uuid uuid NOT NULL PRIMARY KEY,
    planter_first_name varchar NOT NULL,
    planter_last_name varchar NOT NULL,
    planter_identifier varchar NOT NULL,
    created_at timestamptz NOT NULL,
    lat numeric NOT NULL,
    lon numeric NOT NULL,
    note varchar NOT NULL,
    approved boolean NOT NULL,
    planting_organization varchar NOT NULL,
    date_paid timestamptz NOT NULL,
    paid_by varchar NOT NULL,
    payment_local_amt numeric NOT NULL,
    species varchar NOT NULL,
    token_id uuid NOT NULL
);