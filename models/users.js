const crypto = require('crypto');
const pool = require('../lib/postgre_sql');


const encryptPassword = function(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};
const cheakPassword = function(user, password) {
    return encryptPassword(password, user.salt) === user.hashed_password;
};
const createNewUser = function(login, password) {
    const salt = Math.random() + '';
    const hashed_password = encryptPassword(password, salt);
    return [ login, salt,  hashed_password];
};

const authorize = async function(login, password) {
    let client;
    try {
        client = await pool.connect();
        let query = `SELECT * FROM users WHERE login='${login}'`;
        let data = await client.query(query);
        let user = data.rows[0];
        if(user && cheakPassword(user, password))
            return user;
        else
            return null;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    } finally {
        client && client.release();
    }
};

const registration = async function(login, password) {
    let client;
    try {
        client = await pool.connect();
        const query1 = `SELECT * FROM users WHERE login='${login}'`;
        let data = await client.query(query1);
        let user = data.rows[0];
        if(user) return null;

        const query2 = "INSERT INTO users(login, salt, hashed_password) values($1, $2, $3)";
        user = createNewUser(login, password);
        client.query(query2, user);

        data = await client.query(query1);
        user = data.rows[0];
        return user;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    } finally {
        client && client.release();
    }
};

const getUserById = async function(id) {
    let client;
    try {
        client = await pool.connect();
        let query = `SELECT * FROM users WHERE id='${id}'`;
        let data = await client.query(query);
        let user = data.rows[0];
        return user;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    } finally {
        client && client.release();
    }
};

const getUserLogin = async function(id) {
    let client;
    try {
        client = await pool.connect();
        let query = `SELECT * FROM users WHERE id='${id}'`;
        let data = await client.query(query);
        let user = data.rows[0];
        return user && user.login;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    } finally {
        client && client.release();
    }
};


module.exports = {
    authorize,
    registration,
    getUserById,
    getUserLogin
};

