const Likes = require('../../models/likes');
const repositorySessions = require('../../lib/repository_sessions');

async function caseLikeAvatar(ws, token, idOwnerAvatar) {
    let response = { command: "like_avatar" };
    let userId = await repositorySessions.getUserIdByToken(token);

    try {
        if(!userId) throw Error("Ошибка. Токен не зарегистрирован");

        let sign = await Likes.likeAvatar(userId, idOwnerAvatar);

        response.sign = sign;
    } catch(e) {
        console.log(e);
        response.message = "Ошибка. Токен не зарегистрирован";
    }

    console.log("response", response);
    ws.send(JSON.stringify(response));
}

module.exports = caseLikeAvatar;
