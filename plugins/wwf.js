//狼人杀控制模块
const fs = require('fs');
const path = require('path');
const pp = require('../func/pprint');
const config = require('../config');
const Room = require('./wwf/room');

let roomlist = new Map();
let playerlist = new Map();
module.exports = {
	main
}//记录当前房间以及玩家列表
function joinroom(ws, str) {
	if(!(playerlist.get(str.user_id) == undefined)) {//判断玩家是否已在系统内
		pp.main(ws, "你想双开？", str.user_id);
		return;
	}
	let roomid=str.message.split(" ")[2];

	if(isNaN(Number(roomid)) || !(roomid.length == 4)) {//检查房间名
		pp.main(ws, "房间名不符合要求！", str.user_id);
		return;
	}
	if(roomlist.get(roomid) == undefined) {//没房间则创建后调用加入功能，获得房主
		roomlist.set(roomid,new Room(roomid));
		let room = roomlist.get(roomid);

//		console.log(str.user_id);
		room.join(str.user_id);
		pp.main(ws, "你创建了一个房间！并成为了房主！", str.user_id);
		room.state(ws);
		playerlist.set(str.user_id,roomid);
	} else {
		let room = roomlist.get(roomid);

		if(room.join(str.user_id)) {//尝试加入
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
    if(!(str.message.split(" ")[0].split("~")[1] === undefined)) {//测试用功能，允许模拟其他玩家发指令
		let fakeuser = Number(str.message.split(" ")[0].split("~")[1]);

		if(isNaN(fakeuser)) {
			console.log("wrong fakeuser");
			return 1;
		}
		if(str.user_id == config.owner_id) {
			str.user_id = fakeuser;
			console.log("userID changed");
		}
    }
	if(str.message.split(" ")[1] === "join") {
		joinroom(ws, str);
		return 1;
	}
	if(playerlist.get(str.user_id) == undefined) {//以下指令需要在房间内执行
		pp.main(ws, "你不在游戏内！", str.user_id);
		return 1;
	}
	let roomid = playerlist.get(str.user_id);
	let room = roomlist.get(roomid);
	let player = room.getplayer(str.user_id);//提前获取对应信息

	if(str.message.split(" ")[1] === "config") {//设置功能
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
	if(str.message.split(" ")[1] === "state") {//输出信息功能
		room.state(ws, str.user_id);
		return 1;
	}
	if(str.message.split(" ")[1] === "quit") {//无论是否真实退出，在主模块均视为离开房间
		room.quit(ws, str.user_id);
		playerlist.delete(str.user_id);
		if(roomid.nowplayer == 0) {//在主函数外考虑是否删除房间
			roomlist.delete(roomid);
		}
		pp.main(ws, "你已成功退出房间！", str.user_id);
		return 1;
	}
	if(str.message.split(" ")[1] === "nickname") {//改昵称功能
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
	if(str.message.split(" ")[1] === "begin") {//开始游戏功能
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
	if(str.message.split(" ")[1] === "givesh") {//传递警徽功能
		if(!(player.issheriff)) {
			pp.main(ws, "你不是警长！", str.user_id);
			return 1;
		}
		if(!(room.turn == "givesh")) {
			pp.main(ws, "你现在不能送出警徽！", str.user_id);
			return 1;
		}
		if(str.message.split(" ")[2] === undefined) {//之后大部分操作在缺少参数时视为放弃
			pp.main(ws, room.givesheriff(ws, str.user_id, "-1"), str.user_id);
		} else {
			pp.main(ws, room.givesheriff(ws, str.user_id, str.message.split(" ")[2]), str.user_id);
		}
		return 1;
	}
	if(str.message.split(" ")[1] === "hunter") {//猎人杀人功能
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
	if(str.message.split(" ")[1] === "printrole" && str.user_id == config.owner_id) {//测试功能，输出玩家职业
		room.printrole(ws);
		return 1;
	}
	if(str.message.split(" ")[1] === "next" || str.message.split(" ")[1] === "night") {//进入夜晚功能
		//之所以设计成手动进入夜晚是因为投票结果出来后直接进入过于突兀
		if(str.message.split(" ")[1] === "next" && !str.user_id == config.owner_id) {
			pp.main(ws, "没有权限！", str.user_id);//next命令为测试命令，效果为强制进入下一阶段
			return 1;
		}
		if(str.message.split(" ")[1] === "night" && !player.isowner) {
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
	}//以下命令需要玩家存活
	if(str.message.split(" ")[1] === "murder") {//狼人杀人功能
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
	if(str.message.split(" ")[1] === "seer") {//预言家验人功能
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
	if(str.message.split(" ")[1] === "witch") {//女巫功能
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
	if(str.message.split(" ")[1] === "vote") {//投票功能
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
	if(str.message.split(" ")[1] === "votesh") {//投警长功能
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
		if(!(room.turn == "sheriff1")) {//上警功能
			pp.main(ws, "你现在不能选择！", str.user_id);
			return 1;
		}
		pp.main(ws, room.besh(ws, str.user_id, str.message.split(" ")[1]), str.user_id);
		return 1;
	}
	if(str.message.split(" ")[1] === "tell") {//聊天功能
		if(str.message.split(" ")[3] === undefined){
			pp.main(ws, "缺乏参数", str.user_id);
			return 1;
		}
		room.tell(ws, str.user_id, str.message.split(" ")[2], str.message.split(" ")[3]);
		return 1;
	}
	return 0;
}
