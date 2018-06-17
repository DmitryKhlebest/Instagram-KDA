const pool = require('../lib/postgre_sql');
let Users = require('./users');
let Likes = require('./likes');


const formatDate = function(date) {
    let year = date.getFullYear();

    let mount = date.getMonth() + 1;
    if (mount < 10) mount = '0' + mount;

    let day = date.getDate();
    if (day < 10) day = '0' + day;

    let hours = date.getHours();
    if (hours < 10) hours = '0' + hours;

    let minutes = date.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;

    let seconds = date.getSeconds();
    if (seconds < 10) seconds = '0' + seconds;

    let milliseconds = date.getMilliseconds();
    if (milliseconds < 100)
        milliseconds = '0' + milliseconds;
    else if (day < 10)
        milliseconds = '00' + milliseconds;

    return `${year}-${mount}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};
const haveHashtagInDescription = function(description, hashtag) {
    let wordsDescription = description.split(' ');
    let hashtags = wordsDescription.filter(word => word.length > 1 && word[0] === '#');
    let index = hashtags.indexOf(hashtag);
    return index >= 0;
};

const deleteOldAvatar = async function(client, id_user) {
    try {
        const query = `DELETE FROM images WHERE id_user='${id_user}' AND type='avatar'`;
        client.query(query);
        return "success";
    } catch(error) {
        console.log("Error: ", error);
        return "fail";
    }
};

const addImage = async function(id_user, type, name, description) {
    let client;
    try {
        client = await pool.connect();

        if(type === "avatar")
            deleteOldAvatar(client, id_user);

        let upload_date = new Date();

        const query1 = "INSERT INTO images(id_user, type, name, upload_date, description) values($1, $2, $3, $4, $5)";
        let image = [ id_user, type, name, upload_date, description || "" ];
        client.query(query1, image);

        const query2 = `SELECT * FROM images WHERE id_user='${id_user}' AND type='${type}' AND name='${name}' AND upload_date='${formatDate(upload_date)}'`;
        let data = await client.query(query2);
        image = data.rows[0];
        return image;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    } finally {
        client && client.release();
    }
};

const deleteImage = async function(id) {
    let client;
    try {
        client = await pool.connect();

        const query = `DELETE FROM images WHERE id='${id}'`;
        client.query(query);
        return "success";
    } catch(error) {
        console.log("Error: ", error);
        return "fail";
    } finally {
        client && client.release();
    }
};

const getAvatarImage = async function(id_user) {
    let client;
    try {
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! После ошибки не заканчивает выполнение этой строки (после 8 лайков) (при выполении 10 и > лайка)
        client = await pool.connect();
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!! После ошибки не заканчивает выполнение этой строки (после 8 лайков) (при выполении 10 и > лайка)

        const query = `SELECT * FROM images WHERE id_user='${id_user}' AND type='avatar'`;
        let data = await client.query(query);
        let image = data.rows[0];
        image.countLikes = await Likes.getCountLikes(image.id);
        return image;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    } finally {
        client && client.release();
    }
};

const getImagesUser = async function(id_user) {
    let client;
    try {
        client = await pool.connect();

        const query = `SELECT * FROM images WHERE id_user='${id_user}' AND type='picture'`;
        let data = await client.query(query);
        let images = data.rows;

        for(let image of images)
            image.countLikes = await Likes.getCountLikes(image.id);

        return images;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    } finally {
        client && client.release();
    }
};

const getImagesUsers = async function(id_user) {
    let client;
    try {
        client = await pool.connect();

        const query = `SELECT * FROM images WHERE id_user!='${id_user}' AND type='picture'`;
        let data = await client.query(query);
        let images = data.rows;

        for(let image of images) {
            image.countLikes = await Likes.getCountLikes(image.id);
            image.loginOwner = await Users.getUserLogin(image.id_user);
        }

        return images;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    } finally {
        client && client.release();
    }
};

const getImagesByHashTag = async function(hashtag) {
    let client;
    try {
        client = await pool.connect();

        const query = `SELECT * FROM images`;
        let data = await client.query(query);
        let images = data.rows;

        for(let i = 0; i < images.length; i++) {
            let image = images[i];
            if(!haveHashtagInDescription(image.description, hashtag)) {
                images.splice(i--, 1);
            } else {
                image.countLikes = await Likes.getCountLikes(image.id);
                image.loginOwner = await Users.getUserLogin(image.id_user);
            }
        }

        return images;
    } catch(error) {
        console.log("Error: ", error);
        return null;
    } finally {
        client && client.release();
    }
};


module.exports = {
    addImage,
    deleteImage,
    getAvatarImage,
    getImagesUser,
    getImagesUsers,
    getImagesByHashTag
};




