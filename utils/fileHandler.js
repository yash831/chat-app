const fs = require('fs');

exports.checkForUser = (username) => {
	const userData = fs.readFileSync('./../user.json') || [];

	const isExist = userData.filter((el) => el.username === data.data);
};
