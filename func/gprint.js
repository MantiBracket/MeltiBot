const fs = require('fs');
const path = require('path');

module.exports = {
	main
}
function main(ws, str, id = 0, gid) {
	if(id == 0)	{
		const ret = {
			"action": "send_group_msg",
			"params": {
				"group_id": gid,
				"message": [
					{ "data": { "text": str }, "type": "text" },
				]
			},
		}
		ws.send(JSON.stringify(ret));
	} else {
		const ret = {
			"action": "send_group_msg",
			"params": {
				"group_id": gid,
				"message": [
					{ "data": { "qq": id }, "type": "at" },
					{ "data": { "text": str }, "type": "text" },
				]
			},
		}
		ws.send(JSON.stringify(ret));
	}
	return ;
}