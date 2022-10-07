const fs = require('fs');
const path = require('path');
const pp = require('../func/pprint');
const config = require('../config');
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

	if(isNaN(Number(roomid)) || !(roomid.length == 4)) {
		pp.main(ws, "房间名不符合要求！", str.user_id);
		return;
	}
	if(roomlist.get(roomid) == undefined) {
		roomlist.set(roomid,new Room(roomid));
		let room = roomlist.get(roomid);

//		console.log(str.user_id);
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

		if(isNaN(fakeuser)) {
			console.log("wrong fakeuser");
			return 1;
		}
//		if(str.user_id == config.owner_id) {
			str.user_id = fakeuser;
			console.log("userID changed");
		}
//    }
	if(str.message.split(" ")[1] === "join") {
		joinroom(ws, str);
		return 1;
	}
	if(playerlist.get(str.user_id) == undefined) {
		pp.main(ws, "你不在游戏内！", str.user_id);
		return 1;
	}
	let roomid = playerlist.get(str.user_id);
	let room = roomlist.get(roomid);
	let player = room.getplayer(str.user_id);

	if(str.message.split(" ")[1] === "config") {
		if(!player.isowner) {
			pp.main(ws, "你没有权限！", str.user_id);
			return 1;
		}
		if(!(room.turn == "waiting")) {
			pp.main(ws, "无法在游戏开始后修改配置！", str.user_id);
			return 1;
		}
		let res = room.config(str.message.split(" ")[2]);

		pp.main(ws, res, str.user_id);
		if(res == "游戏配置修改成功！") {
			room.state(ws);
		}
		return 1;
	}
	if(str.message.split(" ")[1] === "state") {
		room.state(ws, str.user_id);
		return 1;
	}
	if(str.message.split(" ")[1] === "quit") {
		room.quit(ws, str.user_id);
		playerlist.delete(str.user_id);
		if(roomid.nowplayer == 0) {
			roomlist.delete(roomid);
		}
		pp.main(ws, "你已成功退出房间！", str.user_id);
		return 1;
	}
	if(str.message.split(" ")[1] === "nickname") {
		let res = room.nickname(ws, str.user_id, str.message.split(" ")[2]);

		if(res == -1) {
			pp.main(ws, "改了，但是没有完全改", str.user_id);
		} else if(res == -2) {
			pp.main(ws, "昵称不能为纯数字", str.user_id);
		} else if(res == -3) {
			pp.main(ws, "昵称重复", str.user_id);
		} else if(res == 1) {
			pp.main(ws, "修改成功", str.user_id);
		}
		return 1;
	}
	if(str.message.split(" ")[1] === "begin") {
		if(!player.isowner) {
			pp.main(ws, "你没有权限！", str.user_id);
			return 1;
		}
		if(!(room.maxplayer == room.nowplayer)) {
			pp.main(ws, "人数不足！", str.user_id);
			return 1;
		}
		if(!(room.turn == "waiting")) {
			pp.main(ws, "一局游戏无法开始两次！", str.user_id);
			return 1;
		}
		pp.main(ws, "已启动游戏！", str.user_id);
		room.begin(ws);
		return 1;
	}
	if(str.message.split(" ")[1] === "givesh") {
		if(!(player.issheriff)) {
			pp.main(ws, "你不是警长！", str.user_id);
			return 1;
		}
		if(!(room.turn == "givesh")) {
			pp.main(ws, "你现在不能送出警徽！", str.user_id);
			return 1;
		}
		if(str.message.split(" ")[2] === undefined) {
			pp.main(ws, room.givesheriff(ws, str.user_id, "-1"), str.user_id);
		} else {
			pp.main(ws, room.givesheriff(ws, str.user_id, str.message.split(" ")[2]), str.user_id);
		}
		return 1;
	}
	if(str.message.split(" ")[1] === "hunter") {
		if(!(player.role == "hunter")) {
			pp.main(ws, "你不是猎人！", str.user_id);
			return 1;
		}
		if(!(room.turn == "hunter")) {
			pp.main(ws, "你现在不能动手！", str.user_id);
			return 1;
		}
		if(str.message.split(" ")[2] === undefined) {
			pp.main(ws, room.hunterkill(ws, str.user_id, "-1"), str.user_id);
		} else {
			pp.main(ws, room.hunterkill(ws, str.user_id, str.message.split(" ")[2]), str.user_id);
		}
		return 1;
	}
	if(str.message.split(" ")[1] === "printrole") {
		room.printrole(ws);
		return 1;
	}
	if(str.message.split(" ")[1] === "next" || str.message.split(" ")[1] === "night") {
		if(!player.isowner) {
			pp.main(ws, "没有权限！", str.user_id);
			return 1;
		}
		if(str.message.split(" ")[1] === "night" && !(room.turn == "lastword")) {
			pp.main(ws, "还不能进入夜晚！", str.user_id);
			return 1;
		}
		room.next(ws);
	}
	if(player.dead) {
		pp.main(ws, "你死了，你想干嘛？", str.user_id);
		return 1;
	}
	if(str.message.split(" ")[1] === "murder") {
		if(!(player.role == "werewolf")) {
			pp.main(ws, "你不是狼人！", str.user_id);
			return 1;
		}
		if(!(room.turn == "werewolf")) {
			pp.main(ws, "你现在不能动手！", str.user_id);
			return 1;
		}
		if(str.message.split(" ")[2] === undefined) {
			pp.main(ws, room.murder(ws, str.user_id, "-1"), str.user_id);
		} else {
			pp.main(ws, room.murder(ws, str.user_id, str.message.split(" ")[2]), str.user_id);
		}
		return 1;
	}
	if(str.message.split(" ")[1] === "seer") {
		if(!(player.role == "seer")) {
			pp.main(ws, "你不是预言家！", str.user_id);
			return 1;
		}
		if(!(room.turn == "seer")) {
			pp.main(ws, "你现在不能动手！", str.user_id);
			return 1;
		}
		if(str.message.split(" ")[2] === undefined) {
			pp.main(ws, "未确定目标！", str.user_id);
			return 1;
		}
		pp.main(ws, room.foresee(ws, str.user_id, str.message.split(" ")[2]), str.user_id);
		return 1;
	}
	if(str.message.split(" ")[1] === "witch") {
		if(!(player.role == "witch")) {
			pp.main(ws, "你不是女巫！", str.user_id);
			return 1;
		}
		if(!(room.turn == "witch")) {
			pp.main(ws, "你现在不能动手！", str.user_id);
			return 1;
		}
		if(str.message.split(" ")[2] === undefined) {
			pp.main(ws, room.usepotion(ws, str.user_id, "-1"), str.user_id);
		} else {
			if(str.message.split(" ")[3] === undefined) {
				pp.main(ws, "未确定目标！", str.user_id);
				return 1;
			}
			pp.main(ws, room.usepotion(ws, str.user_id, str.message.split(" ")[2], str.message.split(" ")[3]), str.user_id);
		}
		return 1;
	}
	if(str.message.split(" ")[1] === "vote") {
		if(!(room.turn == "vote")) {
			pp.main(ws, "你现在不能投票！", str.user_id);
			return 1;
		}
		if(str.message.split(" ")[2] === undefined) {
			pp.main(ws, room.vote(ws, str.user_id, "-1"), str.user_id);
		} else {
			pp.main(ws, room.vote(ws, str.user_id, str.message.split(" ")[2]), str.user_id);
		}
		return 1;
	}
	if(str.message.split(" ")[1] === "votesh") {
		if(!(room.turn == "sheriff2")) {
			pp.main(ws, "你现在不能投票！", str.user_id);
			return 1;
		}
		if(str.message.split(" ")[2] === undefined) {
			pp.main(ws, room.votesh(ws, str.user_id, "-1"), str.user_id);
		} else {
			pp.main(ws, room.votesh(ws, str.user_id, str.message.split(" ")[2]), str.user_id);
		}
		return 1;
	}
	if(str.message.split(" ")[1] === "besheriff" || str.message.split(" ")[1] === "notsheriff") {
		if(!(room.turn == "sheriff1")) {
			pp.main(ws, "你现在不能选择！", str.user_id);
			return 1;
		}
		pp.main(ws, room.besh(ws, str.user_id, str.message.split(" ")[1]), str.user_id);
		return 1;
	}
	if(str.message.split(" ")[1] === "tell") {
		if(str.message.split(" ")[3] === undefined){
			pp.main(ws, "缺乏参数", str.user_id);
			return 1;
		}
		room.tell(ws, str.user_id, str.message.split(" ")[2], str.message.split(" ")[3]);
		return 1;
	}
	return 0;
}