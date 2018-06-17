const Users = require('../../models/users');
const Images = require('../../models/images');
const path = require('path');
const fs = require('fs');
const repositorySessions = require('../../lib/repository_sessions');
const createToken = require('../../lib/create_token');


function failRegistration(ws) {
    let response = {
        command: "registration",
        error: "Ошибка регистрации. Возможножно логин уже занят"
    };

    console.log("response", response);
    ws.send(JSON.stringify(response));
}

async function successRegistration(ws, user) {
    let idUser = user.id;
    let pathDirectory = path.join(__dirname, "../../resourses/" + user.id);
    let pathDirectoryAvatar = path.join(pathDirectory, "/avatar");

    fs.stat(pathDirectory, (err) => {
        if(err) {
            fs.mkdirSync(pathDirectory);
            fs.mkdirSync(pathDirectoryAvatar);
            //Image.newInfoImages(idUser);

            let avatarName = "nameless.png";
            let dirnameNamelessAvatar = path.join(__dirname, "../../resourses/images", avatarName);
            let pathDirectoryAvatarImage = path.join(pathDirectoryAvatar, avatarName);
            fs.createReadStream(dirnameNamelessAvatar)
                .pipe(fs.createWriteStream(pathDirectoryAvatarImage));

            // Поместить инфрормация о аватаре в БД
            Images.addImage(user.id, "avatar", avatarName, "");
        }
        buildResponse(ws, user);
    });
}

async function buildResponse(ws, user) {
    let token = createToken();

    repositorySessions.addSession(token, user.id);

    let avatar = await Images.getAvatarImage(user.id);
    let response = {
        command: "registration",
        token: token,
        user: {
            id: user.id,
            login: user.login,
            pathAvatar: `/resourses/${user.id}/avatar/${avatar.name}`,
            avatarCountLikes: avatar.countLikes
        }
    };

    console.log("response", response);
    ws.send(JSON.stringify(response));
}


async function caseRegistration(ws, login, password) {
	let user = await Users.registration(login, password);
	//console.log("user", user);

	if(user)
		successRegistration(ws, user);
	else
		failRegistration(ws);
}


module.exports = caseRegistration;



