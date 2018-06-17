let fs = require("fs"),
    Image = require('../models/image').Image,
    User = require('../models/user').User,
    multiparty = require('multiparty'),
    path = require('path');

function validImage(imageName) {
    return imageName.slice(-4) === ".png" ||
        imageName.slice(-4) === ".jpg" ||
        imageName.slice(-5) === ".jpeg";
}

function getHashtagsFromDescription(description) {
    let wordsDescription = description.split(' ');
    return wordsDescription.filter(word => word.length > 1 && word[0] === '#');
}

exports.get = async function(req, res) {
    let idUser = req.params.id;
    let userName = "Аноним";
    let numberLikes = 0;

    try {
        userName = await User.getUserName(idUser);
        numberLikes = await Image.getCountLikesOnAvatar(idUser);
    } catch(error) {
        console.log(error);
    }

    res.render('personal_page', { idUserPage: idUser, userNamePP: userName, numberLikes: numberLikes });
};



exports.uploadAvatarToServer = function(req, res, next) {
    let form = new multiparty.Form();
    
    form.on('error', function(err) {
        console.log("Ошибка. Загрузка аватарки на сервер.");
        res.send('fail');
    });

    form.on('close', function() {
        res.send('success');
    });

    form.on('part', async function(part) {
        let idUser = req.params.id;
        let imageName = part.filename;
        let pathDirectoryAvatar = path.join(__dirname, "../files/" + idUser + "/avatar");
        let writeStream = fs.createWriteStream(path.join(pathDirectoryAvatar, "/" + imageName));
        
        try {
            let images = await fs.readdirSync(pathDirectoryAvatar);
            fs.unlinkSync(path.join(pathDirectoryAvatar, "/" + images[0]));

            part.pipe(writeStream);
            // Поместить инфрормация о аватарке в БД
            Image.setAvatar(idUser, imageName);
        } catch(error) {
            console.log("Ошибка: personalPage/uploadAvatarToServer/try-catch");
        }
    });

    form.parse(req);
};



exports.uploadAvatarFromServer = async function(req, res, next) {
    let pathDirectoryAvatar = path.join(__dirname, "../files/" + req.params.id + "/avatar");
    
    try {
        let images = await fs.readdirSync(pathDirectoryAvatar);
        if(images.length === 0) throw new Error("Ошибка. Чтение директории с аватаркой. Директория пуста.");
        images.forEach(image => {
            if(validImage(image))
                res.sendFile(path.join(pathDirectoryAvatar, "/" + image));
        });
    } catch(error) {
        console.log(error);
        res.end(error);
    }
};



exports.uploadImageToServer = function(req, res, next) {
    let form = new multiparty.Form();

    form.on('error', function(err) {
        console.log(err);
        res.writeHead(201, {"Content-Type": "text/plain"});
        res.send(err);
    });

    form.on('part', async function(part) {
        let idUser = req.params.id;
        let description = req.params.description;
        let imageName = part.filename;
        let pathDirectory = path.join(__dirname, "../files/" + idUser);

        // Распарсить строку хэш-тегов
        description = description.replace(/\*/g, "#");
        /*console.log(hashtagsString);
        let hashtagsAndDescription = parseStringHashtags(hashtagsString);
        let hashtags = hashtagsAndDescription.hashtags;
        let description = hashtagsAndDescription.description;
        console.log(hashtags);
        console.log(description);*/

        try {
            part.pipe(fs.createWriteStream(path.join(pathDirectory, "/" + imageName)));
            // Поместить инфрормация о картинке в БД
            let infoImage = await Image.addInfoImage(idUser, imageName, description);
            // Передать браузеру информацию о добавленной картинке
            res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
            res.end(JSON.stringify(infoImage));
        } catch(error) {
            console.log(error);
            res.writeHead(201, {"Content-Type": "text/plain"});
            res.end(error);
        }
    });

    form.parse(req);
};



exports.uploadArrayImageNamesFromServer = async function(req, res) {
    let idUser = req.params.id;

    try {
        let infoImages = await Image.getInfoImagesUser(idUser);
        //console.log(infoImages);
        // Сортиовка по возрастанию даты картинок
        infoImages.sort((a, b) => a.uploadDate - b.uploadDate);
        // Передать браузеру информацию картинках
        res.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
        res.end(JSON.stringify(infoImages));
    } catch(error) {
        console.log(error);
        res.statusCode = 201;
        res.end(error);
    }
};



exports.uploadImageFromServer = function(req, res) {
    res.sendFile(path.join(__dirname, "../files/" + req.params.id + "/" + req.params.imageName));
};



exports.removeImageFromServer = async function(req, res) {
    let idUser = req.params.id;
    let imageName = req.params.imageName;
    let pathImage = path.join(__dirname, "../files/" + idUser + "/" + imageName);

    try {
        // Удалить информацию о картинке из БД
        await Image.deleteInfoImage(idUser, imageName);
        // Удалить картинку из директории
        await fs.unlinkSync(pathImage);
        res.end("Успешное удаление.");
    } catch(error) {
        console.log(error);
        res.statusCode = 201;
        res.end(error);
    }
};
