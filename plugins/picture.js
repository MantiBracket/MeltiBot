//图片相关插件
//他甚至能收藏动图，我哭死
//由于腾讯抽风图链随机变化问题，删图功能有概率不可行
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const connection = require('../func/connection');
const config = require('../config');
const self_id = config.self_id;
const date = require("silly-datetime");
const gp = require('../func/gprint');
const crawler = require('../func/crawler');

module.exports = {
	main
}
connection.query("USE Meltibot;", function (err, result) {//进入对应库
	if(err) {
		console.log(err.message);
		return;
	}
});
connection.query("SELECT value from Params WHERE name = 'picturedate';", function (err, result) {//查询是否存在该表
	//该表用于记录发图次数
	if(err) {
		console.log(err.message);
		return;
	}
	let today = date.format(new Date(),'YYYY-MM-DD');
	console.log(result);
	if(result.length === 0) {//不存在则新建
		connection.query("INSERT INTO Params (name, value) VALUES ('picturedate',?);",[today], function (err, result) {
			if(err) {
				console.log(err.message);
				return;
			}
			console.log("add date");
		});
	} else if(!(today == result[0].value)) {//日期不同则删除重建
		console.log(result);
		console.log(today);
		console.log(result[0].value);
		connection.query("UPDATE Params SET value=? WHERE name='picturedate';",[today], function (err, result) {
			if(err) {
				console.log(err.message);
				return;s
			}
			console.log("update date");
		});
		connection.query("DROP TABLE Picturerank;", function (err, result) {
			if(err) {
				console.log(err.message);
				return;
			}
			console.log("drop picturerank");
		});
	} else {
		return;
	}console.log("try to create table");
	connection.query("CREATE TABLE Picturerank\n(\nuserID bigint,\ntot bigint\n);", function (err, result) {
		if(err) {
			console.log(err.message);
			return;
		}
		console.log("table created");
	});//建立该表
});
connection.query("show tables like 'Picture';", function (err, result) {//查询是否存在该表
	//该表用于存储图片及相关信息
	if(err) {
		console.log(err.message);
		return;
	}
	console.log(result);
	if(!(result.length)) {
		connection.query("CREATE TABLE Picture\n(\nuserID bigint,\nurl varchar(255),\ntag varchar(255)\n);", function (err, result) {
			if(err) {
				console.log(err.message);
				return;
			}
			console.log("table created");
		});
	}
});
connection.query("show tables like 'Banlist';", function (err, result) {//查询是否存在该表
	//该表用于记录被ban用户
	if(err) {
		console.log(err.message);
		return;
	}
	console.log(result);
	if(!(result.length)) {
		connection.query("CREATE TABLE Banlist\n(\nuserID bigint\n);", function (err, result) {
			if(err) {
				console.log(err.message);
				return;
			}
			console.log("table created");
		});
	}
});
let user = [];
let tag = [];//临时存储谁进行了收藏图片的一阶段以及收藏的tag
function ban(ws, str) {//查询发出者身份（有无权限）
	let banid = str.message.split("CQ:at,qq=")[1].split("]")[0];

	const ret = {
		"action": "get_group_member_info",
		"params": {
			"user_id": str.sender.user_id,
			"group_id": str.group_id,
		},
		"echo": ["picture", 101, str.sender.user_id, str.group_id, banid]
	}
	ws.send(JSON.stringify(ret));
}
function unban(ws, str) {//查询发出者身份（有无权限）
	let banid = str.message.split("CQ:at,qq=")[1].split("]")[0];

	const ret = {
		"action": "get_group_member_info",
		"params": {
			"user_id": str.sender.user_id,
			"group_id": str.group_id,
		},
		"echo": ["picture", 102, str.sender.user_id, str.group_id, banid]
	}
	ws.send(JSON.stringify(ret));
}
function echo(ws, str) {//如果收到回应
	if(str.echo[1] === 1) {
		if(!(self_id == str.data.sender.user_id))return;
		if(!(str.data.message.match(/\[CQ:image,/)))return;
		let file = str.data.message.split(",file=")[1].split(",")[0];
		console.log(file);
		const ret = {
			"action": "get_image",
			"params": {
				"file": file,
			},
			"echo": ["picture", 2, str.echo[2], str.echo[3]]
		}
		ws.send(JSON.stringify(ret));//查询图片原有信息
		console.log("done 1");
	} else if(str.echo[1] === 2) {
		console.log(str.data.filename);
		const ret = {
			"action": "get_group_member_info",
			"params": {
				"user_id": str.echo[2],
				"group_id": str.echo[3],
			},
			"echo": ["picture", 3, str.echo[2], str.echo[3], str.data.url]
		}
		ws.send(JSON.stringify(ret));//查询发出者身份（有无权限）
		console.log(str.data.url);
	} else if(str.echo[1] === 3) {
		console.log(str.echo[4]);
		connection.query("SELECT * from Picture WHERE url=?",[str.echo[4]], function (err, result) {
			//查询数据库内对应图片
			if(err) {
				console.log(err.message);
				return;
			}
			if(result.length === 0) {//没有结果
				gp.main(ws, "没有这个图图！", str.echo[2], str.echo[3]);
				return;
			}
			let user2_id = result[0].userID;
			if((user2_id == str.echo[2]) || (str.data.role === "owner" || str.data.role === "admin")) {
				connection.query("DELETE from Picture WHERE url=?",[str.echo[4]], function (err, result) {
					if(err) {//用户有权限则删图
						console.log(err.message);
						return;
					}
					console.log("delete ok");
					gp.main(ws, "图图寄了！", str.echo[2], str.echo[3]);
				});
			} else {
				gp.main(ws, "不准碰我图图！", str.echo[2], str.echo[3]);
			}
		});
	} else if(str.echo[1] === 101) {
		connection.query("SELECT * from Banlist WHERE userID=?",[str.echo[4]], function (err, result) {
			if(err) {//查询目前是否被ban
				console.log(err.message);
				return;
			}
			if(!(result.length === 0)) {
				gp.main(ws, "已经是坏蛋了！", str.echo[4], str.echo[3]);
				return;
			}
			if((str.data.role === "owner" || str.data.role === "admin")) {//用户有权限则执行
				connection.query("INSERT INTO Banlist (userID) VALUES (?);",[str.echo[4]], function (err, result) {
					if(err) {
						console.log(err.message);
						return;
					}
					console.log("ban ok");
					gp.main(ws, "被标记为坏蛋！", str.echo[4], str.echo[3]);
				});
			} else {
				gp.main(ws, "谋权篡位？", str.echo[2], str.echo[3]);
			}
		});
	} else if(str.echo[1] === 102) {
		connection.query("SELECT * from Banlist WHERE userID=?",[str.echo[4]], function (err, result) {
			if(err) {//查询目前是否被ban
				console.log(err.message);
				return;
			}
			if(result.length === 0) {
				gp.main(ws, "已经是好人了！", str.echo[4], str.echo[3]);
				return;
			}
			if((str.data.role === "owner" || str.data.role === "admin")) {//用户有权限则执行
				connection.query("DELETE from Banlist WHERE userID=?",[str.echo[4]], function (err, result) {
					if(err) {
						console.log(err.message);
						return;
					}
					console.log("unban ok");
					gp.main(ws, "被标记为好人！", str.echo[4], str.echo[3]);
				});
			} else {
				gp.main(ws, "胆大包天！", str.echo[2], str.echo[3]);
			}
		});
	} else {
		console.log("ERROR!");
	}
}
function favour(ws, str) {
	connection.query("SELECT * from Banlist WHERE userID=?",str.sender.user_id, function (err, result) {
		if(err) {//查询是否被ban
			console.log(err.message);
			return;
		}
		if(!(result.length == 0)) {
			gp.main(ws, "不准发图图！", str.sender.user_id, str.group_id);
			return;
		}
		let insert = false;

		for(let i = 0; i < user.length; i++) {//查询是否发出过第一条指令
			if(user[i] === 0) {
				user[i] = str.sender.user_id;
				tag[i] = str.message.substr(7);
				insert = true;
				break;
			}
		}
		if(!insert) {
			user.push(str.sender.user_id);
			tag.push(str.message.substr(7));
		}
		gp.main(ws, "我图图呢？", str.sender.user_id, str.group_id);
	});
}
function unfavour(ws, str) {
	let id = str.message.split("[CQ:reply,id=")[1].split("]")[0];
	const ret = {//查询回复的原文
		"action": "get_msg",
		"params": {
			"message_id": Number(id),
		},
		"echo": ["picture", 1, str.sender.user_id, str.group_id]
	}
	ws.send(JSON.stringify(ret));
}
function rank(ws, str) {
	connection.query("SELECT * from Picturerank ORDER by tot DESC", function (err, result) {
		if(err) {//在数据库内排序并输出
			console.log(err.message);
			return;
		}
		let message = [{ "data": { "text": "今日份存图榜榜！\n" }, "type": "text" },];
		if(result.length == 0) {
			message.push({
				"type": "text",
				"data": { "text": "今天没有人存图图！",}
			});
		}
		for(let i = 0; i < 5 && i < result.length; i++) {
			message.push({
				"type": "text",
				"data": { "text": ["第 ", (i + 1).toString(), " 名："].join(''),}
			});
			message.push({
				"type": "at",
				"data": { "qq": result[i].userID,}
			});

			message.push({
				"type": "text",
				"data": { "text": ["贡献了 ", result[i].tot.toString(), " 张图！\n"].join(''),}
			});
			console.log(result[i]);
		}
		const ret = {
			"action": "send_group_msg",
			"params": {
				"group_id": str.group_id,
				"message": message
			},
		}
		ws.send(JSON.stringify(ret));
	});
}
function save(ws, str, id) {
	let uid=user[id];

	console.log(uid);
	if(!(str.message.match(/\[CQ:image,/))) {//无图则返回
		return 0;
	}
	let file = str.message.split(",file=")[1].split(",")[0];
	console.log(file);
	let web = str.message.split(",url=")[1].split("]")[0];//拆分并获得链接
	connection.query("INSERT INTO Picture (userID, url, tag) VALUES (?,?,?);",[uid, web, tag[id]], function (err, result) {
		console.log(uid);
		if(err) {
			console.log(err.message);
			return;
		}
		console.log("picture inserted");
		gp.main(ws, "图图收到！", str.sender.user_id, str.group_id);
		connection.query("SELECT * from Picturerank WHERE userID = ?", [uid], function (err, result) {
			if(err) {//查询并修改记录加图次数
				console.log(err.message);
				return;
			}
			if(result.length == 0) {
				connection.query("INSERT INTO Picturerank (userID, tot) VALUES (?,1);",[uid], function (err, result) {
					if(err) {
						console.log(err.message);
						return;
					}
					console.log("rank = 1!");
				});
			} else {
				connection.query("UPDATE Picturerank SET tot = tot + 1 WHERE userID=?;",[uid], function (err, result) {
					if(err) {
						console.log(err.message);
						return;
					}
					console.log("rank++!");
				});
			}
		});
	});
	user[id] = 0;
	return 1;
}
function send(ws, str) {
	let tag =str.message.substr(1);
	console.log(tag);
	connection.query("SELECT url from Picture WHERE tag=?",[tag], function (err, result) {
		if(err) {//查询是否有图
			console.log(err.message);
			return;
		}
		if(!result.length) {//无图则从网络上抓取图片
			gp.main(ws, "本地找不到该图！尝试连接蝎尾网络抓取结果！", str.sender.user_id, str.group_id);
			crawler.main(ws, tag, str.group_id);//别问我蝎尾网络是什么鬼东西
			return;
		}
		console.log(result);
		var res = result[Math.floor(Math.random()*result.length)];//随机选图发送，但是随机数似乎不很随机
		const ret = {
			"action": "send_group_msg",
			"params": {
				"group_id": str.group_id,
				"message": [
					{
						"type": "image",
						"data": {
							"file": "Meltibot.image",
							"url": res.url,
						}
					},
				]
			},
		}
		ws.send(JSON.stringify(ret));
		console.log(res.url);
	});
}
function main(ws, str) {//主函数判断指令类型并调用对应函数
	if(str.echo && str.cho[0] == "picture") {
		echo(ws, str);
		return 1;
	}
	console.log(str.message);
	if(str.message.match(/\[CQ:reply,/) && str.message.match(/取消收藏/)) {
		unfavour(ws, str);
		return 1;
	}
	if(str.message === 'rank') {
		rank(ws, str);
		return 1;
	}
	if(str.message[0] === '发') {
		send(ws, str);
		return 1;
	}
    if((str.message.match(/\[CQ:at,qq=/)) && (str.message.split(" ")[0] === "ban")) {
		ban(ws, str);
		return 1;
	}
    if((str.message.match(/\[CQ:at,qq=/)) && (str.message.split(" ")[0] === "unban")) {
		unban(ws, str);
		return 1;
	}
	for(let i = 0; i < user.length; i++) {
		if(str.sender.user_id === user[i]) {
			return save(ws, str, i);
		}
	}
    if(!(str.message.split(" ")[1] === undefined) && (str.message.split(" ")[0] === "收藏") && (str.message.substr(3,4) === "tag=")) {
		favour(ws, str);
		return 1;
	}
	return 0;
}
