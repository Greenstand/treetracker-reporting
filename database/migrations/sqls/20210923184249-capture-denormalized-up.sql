CREATE TABLE capture_denormalized
(
    capture_uuid uuid NOT NULL PRIMARY KEY,
    capture_created_at timestamptz NOT NULL,
    planter_first_name varchar NOT NULL,
    planter_last_name varchar NOT NULL,
    planter_identifier varchar,
    lat numeric NOT NULL,
    lon numeric NOT NULL,
    note varchar,
    approved boolean NOT NULL,
    planting_organization_uuid uuid,
    planting_organization_name varchar,
    date_paid timestamptz,
    paid_by varchar,
    payment_local_amt numeric,
    species varchar,
    token_id uuid,
    created_at timestamptz NOT NULL DEFAULT NOW()
);
