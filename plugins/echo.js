const fs = require('fs');
const path = require('path');

module.exports = {
	main
}
function main(ws, str) {
//	console.log(str.message);
    if (str.message.split(" ")[1] === undefined) return;
//	console.log('ok1');
    if (!((str.message.split(" ")[0] === "\\echo"))) return;
//	console.log('ok2');

	const ret = {
			"action": "send_group_msg",
			"params": {
				"group_id": str.group_id,
				"message": [
					{ "data": { "qq": str.sender.user_id }, "type": "at" },
					{ "data": { "text": str.message.substr(6) }, "type": "text" },
				]
			},
		}
	ws.send(JSON.stringify(ret));
}