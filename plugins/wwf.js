const fs = require('fs');
const path = require('path');
const pp = require('../func/pprint');
const Room = require('./wwf/room');

let roomlist = new Map();
let playerlist = new Map();
module.exports = {
	main
}
function joinroom(ws, str) {
	if(!(playerlist.get(str.user_id) == undefined)) {
		pp.main(ws, "你想双开？", str.user_id);
		return;
	}
	let roomid=str.message.split(" ")[2];

	if(roomlist.get(roomid) == undefined) {
		roomlist.set(roomid,new Room(roomid));
		let room = roomlist.get(roomid);

		console.log(str.user_id);
		room.join(str.user_id);
		pp.main(ws, "你创建了一个房间！并成为了房主！", str.user_id);
		room.state(ws);
		playerlist.set(str.user_id,roomid);
	} else {
		let room = roomlist.get(roomid);

		if(room.join(str.user_id)) {
			pp.main(ws, "你加入了房间！", str.user_id);
			room.state(ws);
			playerlist.set(str.user_id,roomid);
		} else {
			pp.main(ws, "这里已经满员了！", str.user_id);
		};
	}
}
function main(ws, str) {
    if(!(str.message.split(" ")[0].split("~")[0] === "\\wwf")) {
		return 0;
    }
    if(!(str.message.split(" ")[0].split("~")[1] === undefined)) {
		let fakeuser = Number(str.message.split(" ")[0].split("~")[1]);

		if(fakeuser === NaN) {
			console.log("wrong fakeuser");
			return 1;
		}
		str.user_id = fakeuser;
		console.log("userID changed");
    }
	if(str.message.split(" ")[1] === "join") {
		joinroom(ws, str);
		return 1;
	}
	if(!(playerlist.get(str.user_id) == undefined)) {
		pp.main(ws, "你不在游戏内！", str.user_id);
		return 1;
	}
	let roomid = playerlist.get(str.user_id);
	let room = roomlist.get(roomid);
	let player = room.getplayer(str.user_id);

	if(str.message.split(" ")[1] === "config") {
		if(player.isowner) {
			let res = joinroom(ws, str);
			pp.main(ws, res, str.user_id);
		} else {
			pp.main(ws, "你没有权限！", str.user_id);
		}
		return 1;
	}
	return 1;
}