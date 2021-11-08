const { v4: uuid } = require('uuid');
const knex = require('../../server/database/knex');

const captureOne = Object.freeze({
  capture_uuid: uuid(),
  planter_first_name: 'a',
  planter_last_name: 'a',
  planter_identifier: 'a',
  created_at: new Date('12/12/2012').toISOString(),
  lat: '4.44',
  lon: '4.44',
  note: 'note',
  approved: true,
  planting_organization: 'planters',
  date_paid: new Date('12/12/2012').toISOString(),
  paid_by: 'paid_by',
  payment_local_amt: '200',
  species: 'species1',
  token_id: uuid(),
});
const captureTwo = Object.freeze({
  capture_uuid: uuid(),
  planter_first_name: 'b',
  planter_last_name: 'b',
  planter_identifier: 'b',
  created_at: new Date('11/11/2012').toISOString(),
  lat: '4.44',
  lon: '5.44',
  note: 'note',
  approved: true,
  planting_organization: 'planters',
  date_paid: new Date('12/12/2012').toISOString(),
  paid_by: 'paid_by',
  payment_local_amt: '400',
  species: 'species2',
  token_id: uuid(),
});
const captureThree = Object.freeze({
  capture_uuid: uuid(),
  planter_first_name: 'c',
  planter_last_name: 'c',
  planter_identifier: 'c',
  created_at: new Date('11/11/2012').toISOString(),
  lat: '4.44',
  lon: '5.44',
  note: 'note',
  approved: true,
  planting_organization: 'planters',
  date_paid: new Date('12/12/2012').toISOString(),
  paid_by: 'paid_by',
  payment_local_amt: '400',
  species: 'species2',
  token_id: uuid(),
});

before(async () => {
  await knex.raw(`
    INSERT INTO capture_denormalized (capture_uuid,planter_first_name,planter_last_name ,planter_identifier ,created_at ,lat ,lon,note,approved,planting_organization,date_paid ,paid_by ,payment_local_amt ,species ,token_id )
    VALUES
        ('${captureOne.capture_uuid}','${captureOne.planter_first_name}','${captureOne.planter_last_name}','${captureOne.planter_identifier}','${captureOne.created_at}','${captureOne.lat}','${captureOne.lon}','${captureOne.note}','${captureOne.approved}','${captureOne.planting_organization}','${captureOne.date_paid}','${captureOne.paid_by}','${captureOne.payment_local_amt}','${captureOne.species}','${captureOne.token_id}'),
        ('${captureTwo.capture_uuid}','${captureTwo.planter_first_name}','${captureTwo.planter_last_name}','${captureTwo.planter_identifier}','${captureTwo.created_at}','${captureTwo.lat}','${captureTwo.lon}','${captureTwo.note}','${captureTwo.approved}','${captureTwo.planting_organization}','${captureTwo.date_paid}','${captureTwo.paid_by}','${captureTwo.payment_local_amt}','${captureTwo.species}','${captureTwo.token_id}'),
        ('${captureThree.capture_uuid}','${captureThree.planter_first_name}','${captureThree.planter_last_name}','${captureThree.planter_identifier}','${captureThree.created_at}','${captureThree.lat}','${captureThree.lon}','${captureThree.note}','${captureThree.approved}','${captureThree.planting_organization}','${captureThree.date_paid}','${captureThree.paid_by}','${captureThree.payment_local_amt}','${captureThree.species}','${captureThree.token_id}');
  `);
});

after(async () => {
  await knex.raw(`

    DELETE FROM capture_denormalized
    WHERE lat = '${captureThree.lat}';
  `);
});

module.exports = {
  captureOne,
};
