const repositorySessions = require('../../lib/repository_sessions');
const Images = require('../../models/images');
const path = require('path');
const fs = require('fs');


async function caseUploadImageToServer(ws, token, imageName, imageBase64) {
	let response = { command: "upload_image_to_server" };
	let userId = await repositorySessions.getUserIdByToken(token);

	try {
		if(!userId) throw Error("Error. Token not registered");

		writeImageInFile(userId, imageName, imageBase64);
		let image = await Images.addImage(userId, "picture", imageName, "");

		response.message = "Image upload";
		response.image = image;
	} catch(e) {
		console.log(e);
        response.message = "Error. Token not registered";
	}

	console.log(response);
	ws.send(JSON.stringify(response));
}

module.exports = caseUploadImageToServer;

function writeImageInFile(userId, imageName, imageBase64_withMetaData) {
    let imageBase64_withoutMetaData = imageBase64_withMetaData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)[2];

    let bitmap = new Buffer(imageBase64_withoutMetaData , 'base64');

	let pathDirectoryImage = path.join(__dirname, "/../../resourses/" + userId + "/");
    let pathImage = path.join(pathDirectoryImage, "/" + imageName);

	fs.writeFile(pathImage, bitmap, 'base64', function(err) {
		err && console.log(err);
	});
}
