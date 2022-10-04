const fs = require('fs');
const path = require('path');

module.exports = {
	main
}
function main(ws, str, id = 0, gid) {
	if(id == 0)
	{
		const ret = {
			"action": "send_group_msg",
			"params": {
				"group_id": str.echo[3],
				"message": [
					{ "data": { "qq": str.echo[2] }, "type": "at" },
					{ "data": { "text": "没有这个图图！" }, "type": "text" },
				]
			},
		}
		ws.send(JSON.stringify(ret));
	}
}