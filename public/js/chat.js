$(document).ready(function() {
	const socket = io();
	const msgs = [];

	let whoToSendMsg = '_R' + roomname;

	socket.emit('newUserEntered', { username, roomname });
	$('#username').html('Username: ' + username);

	$('#rooms').append($('<li class="private_li active">').html(`${roomname} <span id=_R${roomname}></span>`));

	$(document).on('click', '.private_li', function(event) {
		$('.private_li.active').removeClass('active');

		if ($(this).text().split(' ')[0].trim() === roomname) {
			whoToSendMsg = '_R' + $(this).text().split(' ')[0].trim();
		} else {
			whoToSendMsg = $(this).text().split(' ')[0].trim();
		}
		$(this).find('span').html('');
		$(this).addClass('active');

		let displayMsgs;

		if (whoToSendMsg.startsWith('_R')) {
			displayMsgs = msgs.filter((el) => el.to === whoToSendMsg);
		} else if (whoToSendMsg === username) {
			displayMsgs = msgs.filter((el) => {
				return (el.from === 'Admin' || el.from === username) && el.to === username;
			});
		} else {
			displayMsgs = msgs.filter(
				(el) =>
					(el.from === username && el.to === whoToSendMsg) || (el.from === whoToSendMsg && el.to === username)
			);
		}

		displayAllMsgs(displayMsgs);
	});

	$('#leave-room').on('click', function() {
		socket.disconnect();
		window.sessionStorage.removeItem('username');
		window.sessionStorage.removeItem('roomname');
		window.location.href = '/';
	});

	$('form').submit(function(e) {
		e.preventDefault();
		socket.emit('newMessage', { from: username, to: whoToSendMsg, text: $('#message').val().trim() });
		$('#message').val('');
		return false;
	});

	socket.on('newUserEnteredNotify', function(userData) {
		let privateMsgDiv = $('#private-chats');
		let elems = [];
		const totalUsers = privateMsgDiv.find('.private_li').length;

		if (userData.length > totalUsers) {
			for (let i = 0; i < userData.length; i++) {
				if ($(`#user_${userData[i].username}`).length) {
					continue;
				} else {
					elems.push(userData[i]);
				}
			}

			elems.forEach((el) => {
				privateMsgDiv.append(
					$(`<li class="private_li" id=user_${el.username}>`).html(
						`${el.username} <span id=${el.username}></span>`
					)
				);
			});
		} else if (userData.length < totalUsers) {
			privateMsgDiv.find('.private_li').each((i, el) => {
				const username = el.textContent.split(' ')[0];
				let match = false;

				for (let i = 0; i < userData.length; i++) {
					if (username === userData[i].username) {
						match = true;
						break;
					}
				}

				if (!match) {
					$('#user_' + username).remove();
				}
			});
		}
	});

	socket.on('MessageNotify', function(message) {
		msgs.push(message);

		if (message.to === username && message.from !== message.to && message.from !== 'Admin') {
			if (whoToSendMsg === message.from) {
				$('#messages').append(
					$('<li>').html(`<b>${message.from}:</b><br/> ${message.text} - ${message.createdAt}`)
				);
			} else {
				const from = message.from;
				const elem = $(`#${from}`);
				const oldValue = parseInt(elem.html()) || 0;
				elem.html(oldValue + 1);
			}
		} else {
			if (whoToSendMsg === message.to) {
				$('#messages').append(
					$('<li>').html(`<b>${message.from}:</b><br/> ${message.text} - ${message.createdAt}`)
				);
			} else {
				const to = message.to;
				const elem = $(`#${to}`);
				const oldValue = parseInt(elem.html()) || 0;
				elem.html(oldValue + 1);
			}
		}
	});

	function displayAllMsgs(displayMsgs) {
		$('#messages').html('');
		displayMsgs.forEach((obj) => {
			$('#messages').append($('<li>').html(`<b>${obj.from}:</b><br/> ${obj.text} - ${obj.createdAt}`));
		});
	}
});
