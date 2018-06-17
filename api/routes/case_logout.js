const repositorySessions = require('../../lib/repository_sessions');

function caseLogout(token) {
	repositorySessions.deleteSession(token);
}

module.exports = caseLogout;
