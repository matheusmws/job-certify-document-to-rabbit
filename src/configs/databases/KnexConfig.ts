import knex from 'knex'


const db = knex({
  client: "mysql",
  connection:{
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'admin',
    database: 'clients'
  }
})

export default db;