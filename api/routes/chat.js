exports.get = function(req, res) {
	let idUserLogin = req.params.idUserLogin;
	let idUserPP = req.params.idUserPP;

	res.render('chat', {
		idUserLogin: idUserLogin,
		idUserPP: idUserPP
	});
};