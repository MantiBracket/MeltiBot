//发纯文本消息至群/个人，自动判断（可@）
const fs = require('fs');
const path = require('path');

module.exports = {
	main
}
function main(ws, str, id = 0, gid = 0) {
	if(gid == 0) {//群id为0代表私聊
		const ret = {
			"action": "send_private_msg",
			"params": {
				"user_id": id,
				"message": [
					{ "data": { "text": str }, "type": "text" },
				]
			},
		}
		ws.send(JSON.stringify(ret));
	} else if(id == 0) {//用户id为0且群id不为0代表不@
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
	} else {//@指定成员并发送消息
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
