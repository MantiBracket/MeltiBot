const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const config = require('./config');
const echo = require('./plugins/echo');
const ws = new WebSocket(config.ws);

ws.onmessage = function (event) {
    const str = JSON.parse(event.data);
	
//	console.log('str is:');
//	console.log(str);
	if (str.message_type === "private") {
		console.log('not group');
		const ret = {
			"action": "send_private_msg",
			"params": {
				"user_id": str.user_id,
				"message": [
					{ "data": { "text": "hello!This is Meltibot!" }, "type": "text" },
				]
			},
		}
		ws.send(JSON.stringify(ret));
	} else if(str.message_type === "group") {
		console.log('group');
		let Ignore = true;

		for (let i = 0; i < config.group_id.length; i++) { 
			if(config.group_id[i] === str.group_id) {
				Ignore = false;
				break;
			}
		}
		if(Ignore == true) {
			return;
		}
		console.log('work');
		echo.main(ws, str);
	} else {
		console.log('unknown message');
		return;
	}
}