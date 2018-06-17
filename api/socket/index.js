var log = require('../lib/log')(module),
	config = require('../config'),
	connect = require('connect'),
	async = require('async'),
	cookie = require('cookie'),
	sessionStore = require('../lib/sessionStore'),
	HttpError = require('../error').HttpError,
	User = require('../models/user').User,
	cookieParser = require('cookie-parser');

function loadSession(sid, callback) {
	sessionStore.load(sid, function(err, session) {
		if(err) return callback(err);
		if(arguments.length == 0) return callback(null, null);
		else return callback(null, session);
	});
}

function loadUser(session, callback) {
	if(!session.user) {
		log.debug("Session %s is anonymous", session.id);
		return callback(null, null);
	}

	log.debug("retrieving user ", session.user);

	User.findById(session.user, function(err, user) {
		if(err) return callback(err);
		if(!user) return callback(null, null);
		log.debug("user findbyId result: " + user);
		callback(null, user);
	});
}

module.exports = function(server) {
	var io = require('socket.io').listen(server);
	io.set('origins', 'localhost:*');
	io.set('logger', log);

	io.set('authorization', function(handshake, callback) {
		// загрузить сессию по sid из handshake.cookie
		// если есть сессия авторизованного посетителя - пустить
		// иначе - отказать во входе

		async.waterfall([
			function(callback) {
				// сделать handshakeData.cookies - объект с cookie
				handshake.cookies = cookie.parse(handshake.headers.cookie || '');
				var sidCookie = handshake.cookies[config.get('session:key')];
				//var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));
				var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));

				loadSession(sid, callback);
			},
			function(session, callback) {
				if(!session)
					callback(new HttpError(401, "No session"));
				handshake.session = session;
				loadUser(session, callback);
			},
			function(user, callback) {
				if(!user)
					callback(new HttpError(403, "Anonymous session may not connect"));
				
				handshake.user = user;

				callback(null);
			}
		], function(err) {
			if(!err) return callback(null, true);
			if(err instanceof HttpError) return callback(null, false);
			callback(err);
		});
	});

	io.sockets.on('session_reload', function(sid) {
		var clients = Object.keys(io.sockets.sockets);
		clients.forEach(function(client) {
			if(client.handshake == undefined || client.handshake.session.id != sid) return;
			loadSession(sid, function(err, session) {
				if(err) {
					client.emit("error", "server error");
					client.disconnect();
					return;
				}
				if(!session) {
					client.emit("logout");
					client.disconnect();
					return;
				}
				client.handshake.session = session;
			});
		});
	});



	let connectedUsers = [];

	io.sockets.on('connection', function(socket) {
		console.log('connection');
		// Вывести массив [ myID, idSocket, interlocutorID ]
		console.log(connectedUsers);
		let myName = socket.client.request.user.username;
		console.log(myName);
		let myID = socket.client.request.user._id;
		// Получить мой индекс в массиве
		let myIndex = connectedUsers.findIndex(user => ""+user.myID === ""+myID);

		// Если я ещё не зарегистрирован
		if(myIndex === -1)
			connectedUsers.push({ myID: myID, idSocket: socket.client.id, interlocutorID: null });
		// Я зарегистрирован, но надо обновить идентификатор сокета
		else
			connectedUsers[myIndex].idSocket = socket.client.id;
			//socket.client.id = connectedUsers[myIndex].idSocket;


		socket.on('get_info_about_chat', async function(callback) {
			// Получить мой индекс в массиве
			let myIndex = connectedUsers.findIndex(user => ""+user.myID === ""+myID);
			// Получить идентификатор получателя сообщения
			let interlocutorID = connectedUsers[myIndex].interlocutorID;
			// Получить имя пользователя из БД, на которого я подписался
			let interlocutorName = await User.getUserName(interlocutorID);
			console.log(connectedUsers[myIndex]);
			console.log("Имя подписчика: " + interlocutorName);
			callback(interlocutorID, interlocutorName);
		});


		socket.on('change_an_interlocutor', async function(interlocutorID, callback) {
			// Получить мой индекс в массиве
			let myIndex = connectedUsers.findIndex(user => ""+user.myID === ""+myID);

			// Если я веду другой чат, предупредить получателя о моём выходе
			// Получить индекс получателя сообщения
			let indexInterlocutor = connectedUsers.findIndex(user => user.myID == connectedUsers[myIndex].interlocutorID);
			// выйти из чата
			if(indexInterlocutor >= 0 && connectedUsers[indexInterlocutor].interlocutorID == myID)
				socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('leave', myName);

			// Отметить на сервере мою подписку на другого пользоателя
			connectedUsers[myIndex].interlocutorID = interlocutorID;

			if(interlocutorID === null) return;

			// Получить индекс пользователя, на которого я подписался
			indexInterlocutor = connectedUsers.findIndex(user => ""+user.myID === ""+connectedUsers[myIndex].interlocutorID);
			// Получить имя пользователя из БД, на которого я подписался
			let interlocutorName = await User.getUserName(interlocutorID);

			// Вывести массив [ myID, idSocket, interlocutorID ]
			console.log(connectedUsers);

			// Если пользователь ещё не зарегистрирован на сервере
			if(indexInterlocutor === -1)
				callback(interlocutorName + " не в чате");
			// Если пользователь зарегистрирован на сервере
			else {
				// Если пользователь уже подписан на меня
				if(""+connectedUsers[indexInterlocutor].interlocutorID === ""+myID) {
					socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('accession', myName);
					callback(interlocutorName + " в чате");
				// Если пользователь подписан на себя (в данный момент не чатится)
				} else if(connectedUsers[indexInterlocutor].interlocutorID === null) {
					connectedUsers[indexInterlocutor].interlocutorID = connectedUsers[myIndex].myID;
					//socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('show_chat', myID, myName);
					callback("успешное присоединение к " + interlocutorName);
				// Если пользователь не подписан на меня
				} else {
					socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('status', myName + " хочет поговорить с вами");
					callback(interlocutorName + " занят");
				}
			}
		});


		socket.on('close_chat', function() {
			// Получить мой индекс в массиве
			let myIndex = connectedUsers.findIndex(user => ""+user.myID === ""+myID);
			// Получить индекс получателя сообщения
			let indexInterlocutor = connectedUsers.findIndex(user => user.myID == connectedUsers[myIndex].interlocutorID);
			// выйти из чата
			if(indexInterlocutor >= 0 && connectedUsers[indexInterlocutor].interlocutorID == myID)
				socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('leave', myName);
			connectedUsers[myIndex].interlocutorID = null;
		});


		socket.on('message', async function(text, callback1/*, callback2*/) {
			// Получить мой индекс в массиве
			let myIndex = connectedUsers.findIndex(user => ""+user.myID === ""+myID);
			// Получить индекс получателя сообщения
			let indexInterlocutor = connectedUsers.findIndex(user => ""+user.myID === ""+connectedUsers[myIndex].interlocutorID);

			// Получить идентификатор получателя
			/*let interlocutorID = connectedUsers[indexInterlocutor].interlocutorID;

			// Получить имя пользователя из БД, на которого я подписался
			let interlocutorName = await User.getUserName(interlocutorID);

			// Если пользователь зарегистрирован на сервере
			if(indexInterlocutor >= 0) {
				// Если пользователь уже подписан на меня
				if(""+connectedUsers[indexInterlocutor].interlocutorID === ""+myID) {
					socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('message', myName, text);
				// Если пользователь подписан на себя (в данный момент не чатится)
				} else if(connectedUsers[indexInterlocutor].interlocutorID === null) {
					connectedUsers[indexInterlocutor].interlocutorID = connectedUsers[myIndex].myID;
					socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('show_chat', myID, myName);
					callback2(interlocutorName + " вернулся в чат");
				// Если пользователь не подписан на меня
				} else {
					socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('status', myName + " хочет поговорить с вами");
					callback2(interlocutorName + " занят");
				}
			}*/




			// Если получатель зарегистрирован и уже подписан на меня
			if(indexInterlocutor >= 0 && ""+connectedUsers[indexInterlocutor].interlocutorID === ""+myID) {
				socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('show_chat', myID, myName);
				socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('message', myName, text);
			}
			/*
			else if(connectedUsers[indexInterlocutor].interlocutorID == null)
				socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('show_chat', myName, text);
			*/
			callback1 && callback1();
		});


		socket.on('disconnect', function() {
			console.log("disconnect")
			// Получить мой индекс в массиве
			/*let myIndex = connectedUsers.findIndex(user => user.myID == myID);
			// Получить индекс получателя сообщения
			let indexInterlocutor = connectedUsers.findIndex(user => user.myID == connectedUsers[myIndex].interlocutorID);
			// выйти из чата
			if(indexInterlocutor >= 0 && connectedUsers[indexInterlocutor].interlocutorID == myID)
				socket.broadcast.to(connectedUsers[indexInterlocutor].idSocket).emit('leave', myName);
			// отменить желание поговорить
			// ...
			// предупредить всех подписанных на меня о моём выходе
			// ...

			connectedUsers.splice(myIndex, 1);*/
		});
	});

	return io;
};