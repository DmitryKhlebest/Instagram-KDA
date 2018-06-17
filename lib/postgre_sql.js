/*const pg = require('pg');
const config = require('../config');

const user = config.get('postgre_sql:user');
const password = config.get('postgre_sql:password');
const host = config.get('postgre_sql:host');
const port = config.get('postgre_sql:port');
const database = config.get('postgre_sql:database');

const configPG = `postgres://${user}:${password}@${host}:${port}/${database}`;

let client = new pg.Client(configPG);
client.connect();

module.exports = client;*/



const Pool = require('pg').Pool;
const config = require('../config');

const pool = new Pool({
    user: config.get('postgre_sql:user'),
    host: config.get('postgre_sql:host'),
    database: config.get('postgre_sql:database'),
    password: config.get('postgre_sql:password'),
    port: config.get('postgre_sql:port'),
});

module.exports = pool;



/*async function f() {
    const client = await pool.connect();
    let res;
    try {
        res = await client.query('SELECT * FROM users');
        console.log("res.rows[0]", res.rows[0]);
    } finally {
        client.release();
    }
    return res.rows[0];
}

async function test1() {
    let res = await f();
    console.log("result_end1", res);
    return res;

}

let res = test1();
console.log("result_end2", res);*/
