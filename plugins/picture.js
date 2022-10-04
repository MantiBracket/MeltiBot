const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const connection = require('../func/connection');
const config = require('../config');
const self_id = config.self_id;
const date = require("silly-datetime");
const gp = require('../func/gprint');
const binpicture = require('../func/binpicture');

module.exports = {
	main
}
connection.query("USE Meltibot;", function (err, result) {
	if(err) {
		console.log(err.message);
		return;
	}
});
connection.query("SELECT value from Params WHERE name = 'picturedate';", function (err, result) {
	if(err) {
		console.log(err.message);
		return;
	}
	let today = date.format(new Date(),'YYYY-MM-DD');
	console.log(result);
	if(result.length === 0) {
		connection.query("INSERT INTO Params (name, value) VALUES ('picturedate',?);",[today], function (err, result) {
			if(err) {
				console.log(err.message);
				return;
			}
			console.log("add date");
		});
	} else if(!(today == result[0].value)) {
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
	});
});
connection.query("show tables like 'Picture';", function (err, result) {
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
connection.query("show tables like 'Banlist';", function (err, result) {
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
let tag = [];
function ban(ws, str) {
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
function unban(ws, str) {
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
function echo(ws, str) {
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
		ws.send(JSON.stringify(ret));
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
		ws.send(JSON.stringify(ret));
		console.log(str.data.url);
	} else if(str.echo[1] === 3) {
		console.log(str.echo[4]);
		connection.query("SELECT * from Picture WHERE url=?",[str.echo[4]], function (err, result) {
			if(err) {
				console.log(err.message);
				return;
			}
			if(result.length === 0) {
				gp.main(ws, "没有这个图图！", str.echo[2], str.echo[3]);
				return;
			}
			let user2_id = result[0].userID;
			if((user2_id == str.echo[2]) || (str.data.role === "owner" || str.data.role === "admin")) {
				connection.query("DELETE from Picture WHERE url=?",[str.echo[4]], function (err, result) {
					if(err) {
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
			if(err) {
				console.log(err.message);
				return;
			}
			if(!(result.length === 0)) {
				gp.main(ws, "已经是坏蛋了！", str.echo[4], str.echo[3]);
				return;
			}
			if((str.data.role === "owner" || str.data.role === "admin")) {
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
			if(err) {
				console.log(err.message);
				return;
			}
			if(result.length === 0) {
				gp.main(ws, "已经是好人了！", str.echo[4], str.echo[3]);
				return;
			}
			if((str.data.role === "owner" || str.data.role === "admin")) {
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
		if(err) {
			console.log(err.message);
			return;
		}
		if(!(result.length == 0)) {
			gp.main(ws, "不准发图图！", str.sender.user_id, str.group_id);
			return;
		}
		let insert = false;

		for(let i = 0; i < user.length; i++) {
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
	const ret = {
		"action": "get_msg",
		"params": {
			"message_id": Number(id),
		},
		"echo": ["picture", 1, str.sender.user_id, str.group_id]
	}
	ws.send(JSON.stringify(ret));
}
function rank(ws, str) {
	connection.query("SELECT * from Picturerank ORDER by tot", function (err, result) {
		if(err) {
			console.log(err.message);
			return;
		}
		let message = [{ "data": { "text": "今日份存图榜榜！\n" }, "type": "text" },];
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
	if(!(str.message.match(/\[CQ:image,/)))return;
	let file = str.message.split(",file=")[1].split(",")[0];
	console.log(file);
	let web = str.message.split(",url=")[1].split("]")[0];
	connection.query("INSERT INTO Picture (userID, url, tag) VALUES (?,?,?);",[uid, web, tag[id]], function (err, result) {
		console.log(uid);
		if(err) {
			console.log(err.message);
			return;
		}
		console.log("picture inserted");
		gp.main(ws, "图图收到！", str.sender.user_id, str.group_id);
		connection.query("SELECT * from Picturerank WHERE userID = ?", [uid], function (err, result) {
			if(err) {
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
}
function send(ws, str) {
	let tag =str.message.substr(1);
	console.log(tag);
	connection.query("SELECT url from Picture WHERE tag=?",[tag], function (err, result) {
		if(err) {
			console.log(err.message);
			return;
		}
		if(!result.length) {
			gp.main(ws, "发不出来！", str.sender.user_id, str.group_id);
			binpicture.main(ws, tag, str.group_id);
			return;
		}
		console.log(result);
		var res = result[Math.floor(Math.random()*result.length)];
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
function main(ws, str) {
	if(str.echo) {
		echo(ws, str);
		return;
	}
	console.log(str.message);
	if(str.message.match(/\[CQ:reply,/) && str.message.match(/取消收藏/)) {
		unfavour(ws, str);
		return;
	}
	if(str.message === 'rank') {
		rank(ws, str);
		return;
	}
	if(str.message[0] === '发') {
		send(ws, str);
		return;
	}
    if((str.message.match(/\[CQ:at,qq=/)) && (str.message.split(" ")[0] === "ban")) {
		ban(ws, str);
		return;
	}
    if((str.message.match(/\[CQ:at,qq=/)) && (str.message.split(" ")[0] === "unban")) {
		unban(ws, str);
		return;
	}
	for(let i = 0; i < user.length; i++) {
		if(str.sender.user_id === user[i]) {
			save(ws, str, i);
			return;
		}
	}
    if(!(str.message.split(" ")[1] === undefined) && (str.message.split(" ")[0] === "收藏") && (str.message.substr(3,4) === "tag=")) {
		favour(ws, str);
		return;
	}
}