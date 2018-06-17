let caseLogin = require('./routes/case_login');
let caseRegistration = require('./routes/case_registration');
let caseCheakAuthorization = require('./routes/case_cheak_authorization');
let caseUploadImagesfromServer = require('./routes/case_upload_images_from_server');
let caseLogout = require('./routes/case_logout');
let caseUploadAvatarToServer = require('./routes/case_upload_avatar_to_server');
let caseLikeAvatar = require('./routes/case_like_avatar');
let caseUploadImageToServer = require('./routes/case_upload_image_to_server');

let path = require('path');
let fs = require('fs');


function controller(request) {
	let ws = this;

	request = JSON.parse(request);
	console.log("request", request);

	switch(request.command) {
        case "login":
            caseLogin(ws, request.login, request.password);
            break;
        case "registration":
            caseRegistration(ws, request.login, request.password);
            break;
        case "cheak_authorization":
            caseCheakAuthorization(ws, request.token);
            break;
        case "upload_images_from_server":
            caseUploadImagesfromServer(ws, request.token);
            break;
        case "upload_image_or_avatar_to_server":
            if(request.imageType === "avatar") {
                console.log("avatar");
                caseUploadAvatarToServer(ws, request.token, request.imageName, request.imageBase64);
            } else if(request.imageType === "picture"){
                console.log("picture");
                caseUploadImageToServer(ws, request.token, request.imageName, request.imageBase64);
            }
            break;
        case "like_avatar":
            caseLikeAvatar(ws, request.token, request.idOwnerAvatar);
            break;
        case "logout":
            caseLogout(request.token);
            break;
        default:
            console.log("Неизвестная команда", request);
	}
}

module.exports = controller;

/*function caseUploadAvatarToServerTest(imageName, imageBase64_withMetaData) {
	imageBase64_withoutMetaData = imageBase64_withMetaData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)[2];
	
	//console.log(imageBase64_withoutMetaData);

	let bitmap = new Buffer(imageBase64_withoutMetaData , 'base64');
	let pathDirectory = path.join(__dirname, "/../", imageName);

	fs.writeFile(pathDirectory, bitmap, 'base64', function(err) {
		err && console.log(err);
	});
}*/