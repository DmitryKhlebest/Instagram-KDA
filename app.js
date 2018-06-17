
let controller = require('./api/controller');
let config = require('./config');

const WebSocket = require('ws');

const server = new WebSocket.Server({ port: config.get('port') });

server.on('connection', function(ws) {
	ws.on('message', controller);
});
console.log(`Server start on port ${config.get('port')}`);










































/*let express = require('express'),
	http = require('http'),
	path = require('path'),
	config = require('./config'),
	//log = require('./lib/log')(module),
	HttpError = require('./error').HttpError,
	//errorHandler = require('express-error-handler'),

	favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session');*/


/*let redis = require('redis');
//console.log(redis);
let client = redis.createClient();
//console.log(client);
//client.quit();

// отлавливаем ошибки
client.on("error", function (err) {
	console.log("Error: " + err);
});

// Попробуем записать и прочитать
client.set('myKey', 'Hello Redis', function (err, repl) {
    if (err) {
           // Оо что то случилось при записи
           console.log('Что то случилось при записи: ' + err);
           client.quit();
    } else {
           // Прочтем записанное
           client.get('myKey', function (err, repl) {
                   //Закрываем соединение, так как нам оно больше не нужно
                   client.quit();
                   if (err) {
                           console.log('Что то случилось при чтении: ' + err);
                   } else if (repl) {
                   // Ключ найден
                           console.log('Ключ: ' + repl);
               } else {
                   // Ключ ненайден
                   console.log('Ключ ненайден.')

           };
        });
    };
});*/




/*redis = require("redis");
client = redis.createClient();
 
// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() {  });
 
client.on("error", function (err) {
    console.log("Error " + err);
});
 
client.set("string key", "string val", redis.print);
client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
    client.quit();
});*/







