class Users {
	constructor() {
		this.users = [];
	}

	addUser(username, roomname, socketId) {
		this.users.push({
			username,
			roomname,
			socketId
		});
	}

	removeUserBySocketId(socketId) {
		const index = this.users.findIndex((el) => el.socketId === socketId);
		return this.users.splice(index, 1);
	}

	removeUserByUsername(username) {
		const index = this.users.findIndex((el) => el.username === username);
		return this.users.splice(index, 1);
	}

	getUserBySocketId(socketId) {
		return this.users.find((el) => el.socketId === socketId);
	}

	getUserByUsername(username) {
		return this.users.find((el) => el.username === username);
	}

	getRoomUsers(roomname) {
		return this.users.filter((el) => el.roomname === roomname);
	}

	checkForUsername(username, roomname) {
		if (this.users.length > 0) {
			let check = false;
			this.users.forEach((obj) => {
				if (obj.username === username && obj.roomname === roomname) {
					check = true;
				}
			});

			if (check) {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	}
}

module.exports = new Users();
