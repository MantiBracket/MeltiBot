const fs = require('fs')
const path = require('path')
const WebSocket = require('ws')
const ws = new WebSocket('ws://0.0.0.0:6700')

ws.onmessage = function (event) {
    const str = JSON.parse(event.data);
	
	console.log('nice');
	if (str.message_type === "private") {
		console.log('not group');
		const ret = {
			"action": "send_private_msg",
			"params": {
				"user_id": str.user_id,
				"message": [
					{ "data": { "text": "\nhello from kitsuki!" }, "type": "text" },
				]
			},
		}
		ws.send(JSON.stringify(ret));
	} else {
		console.log('group');
	}
}