//代码入口，控制每条接收的消息是否需要bot回应以及需要哪个插件回应
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const WebSocket = require('ws');
const config = require('./config');
const ws = new WebSocket(config.ws);
const echo = require('./plugins/echo');
const picture = require('./plugins/picture');
const wwf = require('./plugins/wwf');
const help = require('./plugins/help');
const connection = require('./func/connection');
const gp = require('./func/gprint');
const pp = require('./func/pprint');

const bangroup = [];
connection.query("show databases like 'Meltibot';", function (err, result) {//查询是否已经建库
	if(err) {
		console.log(err.message);
		return;
	}
	console.log(result);
	if(!(result.length)) {
		connection.query("CREATE DATABASE Meltibot;", function (err, result) {//没有则建库
			if(err) {
				console.log(err.message);
				return;
			}
			console.log("Database created");
		});
	}
});
connection.query("show tables like 'Params';", function (err, result) {//查询是否已经建表
	if(err) {
		console.log(err.message);
		return;
	}
	console.log(result);
	if(!(result.length)) {//没有则建表
		connection.query("CREATE TABLE Params\n(\nname varchar(255),\nvalue varchar(255)\n);", function (err, result) {
			if(err) {
				console.log(err.message);
				return;
			}
			console.log("table created");
		});
	}
});//Params表用于存储某些关键参数
function hello(ws, str) {//如果私聊消息无法被插件接收则打招呼并给出\help指令
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
}
//connection.end();
ws.onmessage = function (event) {//bot的所有行动均为触发式（是这么叫吗），也就是只在传入消息的时候回应
//这个设计似乎不怎么好？至少在狼人杀的实现上导致了一些不小的麻烦
    const str = JSON.parse(event.data);
	
	if(str.post_type == "meta_event") {
		return;
	}//websocket会发送心跳信息，直接无视
//	console.log(str.message_type);
//	console.log(str);
	if(str.echo) {//由于程序为触发式，查询后必须等待协议实现端回应才能继续，为了确认是代码的什么部位发出了查询，所以查询的时候会将一些数据和标记信息echo出去
		picture.main(ws, str);
	} else if(str.message_type === "private") {//私聊消息
		console.log('private');
		if(!(wwf.main(ws, str))) {
		if(!(help.main(ws, str))) {
			hello(ws, str);//理论上不使用特殊功能不应该私聊bot，所以会打招呼并发出帮助信息
		}}
	} else if(str.message_type === "group") {//群聊消息
		console.log('group');
		let Ignore = true;

		for (let i = 0; i < config.group_id.length; i++) { //是否为允许的群
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
			}//不可能在群内对每句话发送帮助，故仅在@时回复
		}}}
	} else {
//		console.log(str);
//		console.log('unknown message');
		return;
	}
}
