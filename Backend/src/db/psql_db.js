const {Pool} = require("pg");

const pool = new Pool({
    user: 'postgres',
    password: "2004",
    port : 5432,
    host : "localhost",
    database : "road"
})

module.exports = pool