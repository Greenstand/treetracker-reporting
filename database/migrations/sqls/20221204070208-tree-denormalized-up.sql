CREATE TABLE tree_denormalized
(
    tree_uuid uuid NOT NULL PRIMARY KEY,
    tree_created_at timestamptz NOT NULL,
    planter_first_name varchar NOT NULL,
    planter_last_name varchar NOT NULL,
    planter_identifier varchar,
    lat numeric NOT NULL,
    lon numeric NOT NULL,
    note varchar,
    planting_organization_uuid uuid,
    planting_organization_name varchar,
    species varchar,
    created_at timestamptz NOT NULL DEFAULT now()
)