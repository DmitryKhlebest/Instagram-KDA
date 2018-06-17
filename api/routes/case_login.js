const Users = require('../../models/users');
const Images = require('../../models/images');
const path = require('path');
const fs = require('fs');
const repositorySessions = require('../../lib/repository_sessions');
const createToken = require('../../lib/create_token');

async function caseLogin(ws, login, password) {
	let user = await Users.authorize(login, password);
	//console.log("user", user);

	if(user)
		successAuthorization(ws, user);
	else
		failAuthorization(ws);
}

module.exports = caseLogin;

function failAuthorization(ws) {
	let response = {
		command: "login",
		error: "Ошибка авторизации"
	};

	console.log("response", response);
	ws.send(JSON.stringify(response));
}

async function successAuthorization(ws, user) {
	let token = createToken();

	repositorySessions.addSession(token, user.id);

	let avatar = await Images.getAvatarImage(user.id);
	let response = { 
		command: "login", 
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