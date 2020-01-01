class Message {
	constructor() {
		this.messages = [];
	}

	addMessage(username, text, to) {
		const msgObj = {
			from: username,
			text,
			to,
			createdAt: formatAMPM(new Date())
		};
		this.messages.push(msgObj);

		return msgObj;
	}
}

function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

module.exports = new Message();
