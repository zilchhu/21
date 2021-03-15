import knex from 'knex'

const knx = knex({
  client: 'mysql',
  connection: {
    host: '192.168.3.112',
    user: 'root',
    password: '123456',
    database: 'naicai',
    supportBigNumbers: true
  }
})

export default knx;