let cheackAuth = require('../middleware/cheackAuth'),
	images = require('./images'),
	personalPage = require('./personalPage'),
	imageLike = require('./imageLike'),
	chat = require('./chat');

module.exports = function(app) {
	app.get('/', require('./frontpage').get);
	app.get('/login', require('./login').get);
	app.post('/login', require('./login').post);
	app.get('/logout', require('./logout').get);
	app.get('/image_like', imageLike.getImage);
	app.get('/:idUserLogin/like/:idUserPP/:imageName', imageLike.setLike);
	app.get('/:idUserLogin/like_avatar/:idUserPP', imageLike.likeAvatar);

	app.get('/:id/images/all', cheackAuth, images.get);
	app.get('/:id/images/hashtag/:hashtag', cheackAuth, images.get);
	app.get('/:id/images/upload_array_image_names_from_server', cheackAuth, images.uploadArrayImageNamesFromServer);
	app.get('/:id/images/upload_array_image_names_from_server_by_hashtag/:hashtag', cheackAuth, images.uploadArrayImageNamesFromServerByHashtag);
	app.get('/:id/images/upload_image_from_server/:idUser/:imageName', cheackAuth, images.uploadImageFromServer);

	app.get('/:id/personal_page', personalPage.get);
	app.post('/:id/personal_page/upload_avatar_to_server', personalPage.uploadAvatarToServer);
	app.get('/:id/personal_page/upload_avatar_from_server', personalPage.uploadAvatarFromServer);
	//app.post('/:id/personal_page/upload_image_to_server', personalPage.uploadImageToServer);
	app.post('/:id/personal_page/upload_image_to_server/:description', personalPage.uploadImageToServer);
	app.get('/:id/personal_page/upload_array_image_names_from_server', personalPage.uploadArrayImageNamesFromServer);
	app.get('/:id/personal_page/upload_image_from_server/:imageName', personalPage.uploadImageFromServer);
	app.get('/:id/personal_page/remove_image_from_server/:imageName', personalPage.removeImageFromServer);

	app.get('/:idUserLogin/chat/:idUserPP', cheackAuth, chat.get);
};