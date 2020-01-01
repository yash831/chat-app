const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Users = require('./models/Users');
const Message = require('./models/Message');

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res, next) => {
	res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res, next) => {
	const newuser = req.body;
	const result = Users.checkForUsername(newuser.username, newuser.roomname);

	if (result) {
		res.json({
			status: 'success',
			msg: 'user valid!'
		});
	} else {
		res.json({
			status: 'failed',
			msg: 'validation error!'
		});
	}
});

let msg;
io.on('connection', (socket) => {
	socket.on('newUserEntered', (data) => {
		Users.addUser(data.username, data.roomname, socket.id);
		socket.join(data.roomname);
		io.to(data.roomname).emit('newUserEnteredNotify', Users.getRoomUsers(data.roomname));

		msg = Message.addMessage('Admin', `Welcome ${data.username}!`, data.username);
		socket.emit('MessageNotify', msg);

		msg = Message.addMessage('Admin', `${data.username} joined!`, `_R${data.roomname}`);
		socket.broadcast.to(data.roomname).emit('MessageNotify', msg);
	});

	socket.on('newMessage', (data) => {
		const thisUser = Users.getUserBySocketId(socket.id);
		const toUser = Users.getUserByUsername(data.to);

		msg = Message.addMessage(data.from, data.text, data.to);
		if (data.to.startsWith('_R')) {
			io.to(thisUser.roomname).emit('MessageNotify', msg);
		} else if (data.to === data.from) {
			io.sockets.connected[thisUser.socketId].emit('MessageNotify', msg);
		} else if (data.to !== data.from) {
			io.sockets.connected[thisUser.socketId].emit('MessageNotify', msg);
			io.sockets.connected[toUser.socketId].emit('MessageNotify', msg);
		}
	});

	socket.on('disconnect', () => {
		const leftUser = Users.removeUserBySocketId(socket.id);
		if (leftUser && leftUser.length == 1) {
			msg = Message.addMessage('Admin', `${leftUser[0].username} left!`, `_R${leftUser[0].roomname}`);

			socket.broadcast.to(leftUser[0].roomname).emit('MessageNotify', msg);
			socket.leave(leftUser[0].roomname);
			io.to(leftUser[0].roomname).emit('newUserEnteredNotify', Users.getRoomUsers(leftUser[0].roomname));
		}
	});

	socket.on('error', (error) => {
		console.log(error);
	});
});

http.listen(5000, () => {
	console.log('server running!');
});
