const repositorySessions = require('../../lib/repository_sessions');
const Images = require('../../models/images');

async function caseUploadImagesFromServer(ws, token) {
	let response = {
		command: "upload_images_from_server"
	};
	let userId = await repositorySessions.getUserIdByToken(token);

	if(userId) {
		let images = await Images.getImagesUser(userId);
		response.images = images || [];
	} else {
		response.error = "Ошибка. Токен не зарегистрирован";
	}

	console.log("response", response);
	ws.send(JSON.stringify(response));
}

module.exports = caseUploadImagesFromServer;
