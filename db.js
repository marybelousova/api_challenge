const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'maria', 
    database: 'comment', 
    host: 'localhost', 
    port: 5432
})

module.exports = pool;
