const repositorySessions = require('../../lib/repository_sessions');
const Images = require('../../models/images');
const path = require('path');
const fs = require('fs');


async function caseUploadAvatarToServer(ws, token, imageName, imageBase64) {
	let response = { command: "upload_avatar_to_server" };
	let userId = await repositorySessions.getUserIdByToken(token);

	try {
		if(!userId) throw Error("Error. Token not registered");

		writeAvatarInFile(userId, imageName, imageBase64);
		Images.addImage(userId, "avatar", imageName, "");

		response.message = "Avatar upload";
		response.pathAvatar = `/resourses/${userId}/avatar/${imageName}`;
	} catch(e) {
		console.log(e);
        response.message = "Error. Token not registered";
	}

	console.log(response);
	ws.send(JSON.stringify(response));
}

module.exports = caseUploadAvatarToServer;

function writeAvatarInFile(userId, imageName, imageBase64_withMetaData) {
    let imageBase64_withoutMetaData = imageBase64_withMetaData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)[2];

    let bitmap = new Buffer(imageBase64_withoutMetaData , 'base64');

	let pathDirectoryAvatar = path.join(__dirname, "/../../resourses/" + userId + "/avatar");
    let pathAvatar = path.join(pathDirectoryAvatar, "/" + imageName);
    
    let images = fs.readdirSync(pathDirectoryAvatar);
	images && fs.unlinkSync(path.join(pathDirectoryAvatar, "/" + images[0]));

	fs.writeFile(pathAvatar, bitmap, 'base64', function(err) {
		err && console.log(err);
	});
}
