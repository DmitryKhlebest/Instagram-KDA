const pool = require('../lib/postgre_sql');

const deleteLike = function(client, id_user, id_image) {
    try {
        const query = `DELETE FROM likes WHERE id_user='${id_user}' AND id_image='${id_image}'`;
        client.query(query);
        return "-";
    } catch(error) {
        console.log("Error: ", error);
        return "fail";
    }
};

const addLike = function(client, id_user, id_image) {
    try {
        const query = "INSERT INTO likes(id_user, id_image) values($1, $2)";
        let image = [ id_user, id_image ];
        client.query(query, image);
        return "+";
    } catch(error) {
        console.log("Error: ", error);
        return "fail";
    }
};

const putLike = async function(id_user, id_image) {
    let client;
    try {
        client = await pool.connect();

        const query = `SELECT * FROM likes WHERE id_user='${id_user}' AND id_image='${id_image}'`;
        let data = await client.query(query);
        let like = data.rows[0];

        let result = like
            ? deleteLike(client, id_user, id_image)
            : addLike(client, id_user, id_image);
        return result;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    } finally {
        client && client.release();
    }
};

const likeAvatar = async function(id_user, idOwnerAvatar) {
    try {
        let Images = require('./images');

        let image = await Images.getAvatarImage(idOwnerAvatar);
        let sign = await putLike(id_user, image.id);

        return sign;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    }
};

const getCountLikes = async function(id_image) {
    let client;
    try {
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Ошибка в этой строке (после 8 лайков) (при выполении 9 лайка)
        client = await pool.connect();
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Ошибка в этой строке (после 8 лайков) (при выполении 9 лайка)

        const query = `SELECT * FROM likes WHERE id_image='${id_image}'`;
        let data = await client.query(query);
        let countLikes = data.rows.length;

        return countLikes;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    }
};

module.exports = {
    putLike,
    likeAvatar,
    getCountLikes
};




