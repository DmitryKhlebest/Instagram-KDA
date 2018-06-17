let Image = require('../models/image').Image,
    path = require('path');



exports.get = function(req, res) {
	res.render('images');
};



/*xports.getImagesByHashtag = function(req, res) {
    console.log(req.params.hashtag);
    res.render('images', { hashtag: req.params.hashtag });
};*/



exports.uploadArrayImageNamesFromServer = async function(req, res) {
    try {
        // Получить массив информации о картинках
        let arrayInfoImage = await Image.getInfoImagesUsers(req.params.id);
        console.log("arrayInfoImage:");
        console.log(arrayInfoImage);

        // Сортиовка по возрастанию даты картинок
        arrayInfoImage.sort((a, b) => a.uploadDate - b.uploadDate);

        res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
        res.end(JSON.stringify(arrayInfoImage));
    } catch(error) {
        console.log(error);
        res.statusCode = 201;
        res.end(error);
    }
};



exports.uploadArrayImageNamesFromServerByHashtag = async function(req, res) {
    try {
        let hashtag = "#" + req.params.hashtag;
        // Получить массив информации о картинках
        let arrayInfoImage = await Image.getInfoImagesByHashTag(hashtag);
        console.log("arrayInfoImage:");
        console.log(arrayInfoImage);

        // Сортиовка по возрастанию даты картинок
        arrayInfoImage.sort((a, b) => a.uploadDate - b.uploadDate);

        res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
        res.end(JSON.stringify(arrayInfoImage));
    } catch(error) {
        console.log(error);
        res.statusCode = 201;
        res.end(error);
    }
};



exports.uploadImageFromServer = function(req, res) {
    res.sendFile(path.join(__dirname, "../files/" + req.params.idUser + "/" + req.params.imageName));
};
