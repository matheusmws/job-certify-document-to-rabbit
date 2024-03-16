import knex from 'knex'
import 'dotenv/config';

const db = knex({
  client: "mysql",
  connection:{
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
  }
})

export default db;