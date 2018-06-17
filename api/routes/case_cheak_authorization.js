const Users = require('../../models/users');
const Images = require('../../models/images');
const repositorySessions = require('../../lib/repository_sessions');

async function caseCheakAuthorization(ws, token) {
	let userId = await repositorySessions.getUserIdByToken(token);

	let response = {
		command: "cheak_authorization"
	};

	if(userId) {
		let avatar = await Images.getAvatarImage(userId);
		let login = await Users.getUserLogin(userId);

		response.access = true;
		response.user = {
			id: userId,
			login: login,
			pathAvatar: `/resourses/${userId}/avatar/${avatar.name}`,
            avatarCountLikes: avatar.countLikes
		};
	} else {
		response.access = false;
	}

	console.log("response", response);
	ws.send(JSON.stringify(response));
}

module.exports = caseCheakAuthorization;
