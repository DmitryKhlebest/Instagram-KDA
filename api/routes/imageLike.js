let path = require('path'),
    Image = require('../models/image').Image,
	fs = require('fs');
    


exports.getImage = function(req, res) {
    res.sendFile(path.join(__dirname, "../public/images/like.png"));
};



exports.setLike = async function(req, res) {
	let idUserLogin = req.params.idUserLogin;
	let idUserPP = req.params.idUserPP;
	let imageName = req.params.imageName;

    try {
        let like = await Image.putLike(idUserLogin, idUserPP, imageName);
        res.end(like);
    } catch(error) {
        console.log(error);
        res.statusCode = 201;
        res.end(error);
    }
};



exports.likeAvatar = async function(req, res) {
    let idUserLogin = req.params.idUserLogin;
    let idUserPP = req.params.idUserPP;

    try {
        let like = await Image.likeAvatar(idUserLogin, idUserPP);
        res.end(like);
    } catch(error) {
        console.log(error);
        res.statusCode = 201;
        res.end(error);
    }
};