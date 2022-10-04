const fs = require('fs');
const path = require('path');

module.exports = {
	main
}
function main(ws, str, pid) {
	const ret = {
		"action": "send_private_msg",
		"params": {
			"user_id": pid,
			"message": [
				{ "data": { "text": str }, "type": "text" },
			]
		},
	}
	ws.send(JSON.stringify(ret));
	return ;
}