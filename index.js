const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const WebSocket = require('ws');
const config = require('./config');
const ws = new WebSocket(config.ws);
const echo = require('./plugins/echo');
const picture = require('./plugins/picture');
const help = require('./plugins/help');
const connection = require('./func/connection');
const gp = require('./func/gprint');
const pp = require('./func/pprint');

connection.query("show databases like 'Meltibot';", function (err, result) {
	if(err) {
		console.log(err.message);
		return;
	}
	console.log(result);
	if(!(result.length)) {
		connection.query("CREATE DATABASE Meltibot;", function (err, result) {
			if(err) {
				console.log(err.message);
				return;
			}
			console.log("Database created");
		});
	}
});
connection.query("show tables like 'Params';", function (err, result) {
	if(err) {
		console.log(err.message);
		return;
	}
	console.log(result);
	if(!(result.length)) {
		connection.query("CREATE TABLE Params\n(\nname varchar(255),\nvalue varchar(255)\n);", function (err, result) {
			if(err) {
				console.log(err.message);
				return;
			}
			console.log("table created");
		});
	}
});
//connection.end();
ws.onmessage = function (event) {
    const str = JSON.parse(event.data);
	
	if(str.post_type == "meta_event") {
		return;
	}
//	console.log(str.message_type);
//	console.log(str);
	if(str.echo) {
		picture.main(ws, str);
	} else if(str.message_type === "private") {
		console.log('private');
		console.log(str.message);
		const ret = {
			"action": "send_private_msg",
			"params": {
				"user_id": str.user_id,
				"message": [
					{
						"type": "text",
						"data": {
							"text": "hello!This is Meltibot!\n"
						}
					},
					{
						"type": "image",
						"data": {
							"file": "Meltibot.image",
							"url": "https://c2cpicdw.qpic.cn/offpic_new/949291258//949291258-184568751-BA2B3D42F3AC670F8A4FD71A2DD5FAD1/0?term=3"
						}
					},
					{
						"type": "text",
						"data": {
							"text": "输入\"\\help\"以查看帮助！\n"
						}
					},
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
		if(!(echo.main(ws, str))) {
		if(!(picture.main(ws, str))) {
		if(!(help.main(ws, str))) {
			console.log("cant match any plugins");
//			console.log(str.message.match(/\[CQ:at,/));
//			console.log(str.message.match(RegExp(config.self_id.toString())));
			if(str.message.match(/\[CQ:at,/) && str.message.match(RegExp(config.self_id.toString()))) {
				gp.main(ws, "输入\"\\help\"以查看帮助！\n", str.sender.user_id, str.group_id);
			}
		}}}
	} else {
//		console.log(str);
//		console.log('unknown message');
		return;
	}
}