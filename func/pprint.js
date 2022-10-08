//发纯文本消息至个人
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
	console.log([pid.toString(), " : ", str].join(''));//测试时无法看见程序私聊了什么所以需要输出
	ws.send(JSON.stringify(ret));
	return ;
}
