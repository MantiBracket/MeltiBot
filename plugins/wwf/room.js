const fs = require('fs');
const path = require('path');
const pp = require('../../func/pprint');
const Player = require('./player');

class room {
	gp(ws, str) {
		for(let i = 0;i < this.playerlist.length;i++) {
			if(!(this.playerlist[i].leave)) {
				pp.main(ws, str,this.playerlist[i].id);
			}
		}
	}
	state(ws, userID = 0) {
		let message = [{ "data": { "text": "本房间信息：\n" }, "type": "text" },];

		message.push({
			"type": "text",
			"data": { "text": ["房间号： ", this.id, "\n"].join(''),}
		});
		message.push({
			"type": "text",
			"data": { "text": ["当前人数/最大人数： ", this.nowplayer, "\/", this.maxplayer, "\n"].join(''),}
		});
		message.push({
			"type": "text",
			"data": { "text": ["房主： ", this.playerlist[this.ownerid].nickname, "\n"].join(''),}
		});
		message.push({
			"type": "text",
			"data": { "text": ["游戏规则： ", 
				this.villagertot, "民", 
				this.werewolftot, "狼", 
				this.seertot, "预言家", 
				this.witchtot, "女巫", 
				this.huntertot, "猎人", ].join(''),}
		});
		if(this.killall) {
			message.push({
				"type": "text",
				"data": { "text": " 胜利条件：屠城\n",}
			});
		} else {
			message.push({
				"type": "text",
				"data": { "text": " 胜利条件：屠边\n",}
			});
		}
		message.push({
			"type": "text",
			"data": { "text": "以下是玩家列表：\n",}
		});
		for(let i = 0;i < this.playerlist.length;i++) {
			message.push({
				"type": "text",
				"data": { "text": ["玩家", (i+1).toString(), "： 昵称：", this.playerlist[i].nickname, " QQ号：", this.playerlist[i].id.toString()].join(''),}
			});
			if(this.ownerid == i) {
				message.push({
					"type": "text",
					"data": { "text": " 房主\n",}
				});
			} else {
				message.push({
					"type": "text",
					"data": { "text": " \n",}
				});
			}
		}
		console.log(message);
		if(!userID) {
			console.log("put state to everyone");
			for(let i = 0;i < this.playerlist.length;i++) {
				const ret = {
					"action": "send_private_msg",
					"params": {
						"user_id": this.playerlist[i].id,
						"message": message
					},
				}
				ws.send(JSON.stringify(ret));
			}
		} else {
			console.log("put state to someone");
			const ret = {
				"action": "send_private_msg",
				"params": {
					"user_id": userID,
					"message": message
				},
			}
			ws.send(JSON.stringify(ret));
		}
	}
	getplayer(id) {
		for(let i = 0;i < this.playerlist.length;i++) {
			if(this.playerlist[i].nickname === id) {
				return this.playerlist[i];
			}
		}
		for(let i = 0;i < this.playerlist.length;i++) {
			if(this.playerlist[i].id === id) {
				return this.playerlist[i];
			}
		}
		for(let i = 0;i < this.playerlist.length;i++) {
			if(this.playerlist[i].place === id) {
				return this.playerlist[i];
			}
		}
		return undefined;
	}
	join(playerid) {
		if(this.maxplayer == this.nowplayer) {
			return 0;
		}
		let player = new Player(playerid);

		this.nowplayer++;
		if(this.nowplayer == 1) {
			player.isowner = true;
			this.ownerid = 0;
		}
		player.place = this.nowplayer;
		this.playerlist.push(player);
		console.log(this.playerlist);
		return 1;
	}
	deleteplayer(player) {
		this.playerlist.split(player.id, 1);
		for(let i = 0; i < this.playerlist.length; i++) {
			this.playerlist[i].place = i;
		}
	}
	cleankilllist(ws) {
		this.killlist.sort(function () {
			return Math.random() - 0.5;
		});

		for(let i = 0; i < this.killlist.length; i++) {
			this.killlist[i].player.dead = true;
			gp(ws, ["玩家 ", this.killlist[i].player.id, " 死亡"].join(''));
			if(this.killlist[i].player.role == "witch") {
				this.potion1 = 0;
				this.potion2 = 0;
			}
			if(this.killlist[i].player.role == "hunter" && !(this.killlist[i].mess == "potion")) {
				shot = true;
				gp(ws, ["玩家 ", this.killlist[i].player.id, " 是猎人！"].join(''));
			}
		}
		this.killlist.split(0,this.killlist.length);
	}
	killplayer(ws, player, str) {
		this.killlist.push({player: player,mess: str,});
		this.liveplayer--;
	}
	saveplayer(ws, player) {
		for(let i = 0; i < this.killlist.length; i++) {
			if(this.killlist[i] == player) {
				this.killlist.splice(i,1);
				this.liveplayer++;
				return;
			}
		}
	}
	quit(ws, playerid) {
		let player = this.getplayer(playerid)

		if(player.isowner == true) {
			for(let i = 0; i < this.playerlist.length; i++) {
				if(player.place != i && !(this.playerlist[i].leave)) {
					this.playerlist[i].isowner = true;
					pp.main(ws, "前任房主退出，你现在是房主！", this.playerlist[i].id);
					this.ownerid = i;
					break;
				}
			}
			player.isowner = false;
		}
		if(this.turn == "waiting" ) {
			this.deleteplayer(player);
			this.state();
		} else if(player.dead) {
			player.leave = true;
		} else {
			this.killplayer(player, "quit");
			player.leave = true;
			this.gp(ws, ["玩家", player.nickname, "退出游戏"].join(''));
		}
	}
	nickname(playerid, name) {
		let player = this.getplayer(playerid);

		if(player.nickname === name) {
			return -1;
		}
		if(!(Number(name) === NaN)) {
			return -2;
		}
		for(let i = 0;i < this.playerlist.length;i++) {
			if(this.playerlist[i].nickname === name) {
				return -3;
			}
		}
		player.nickname = name;
		room.state();
		return 1;
	}
	iswin() {
		if(this.werewolftot < 1 )return -1;
		if(this.maxplayer == this.huntertot + this.werewolftot + this.villagertot && this.killall == false) {
			if(this.maxplayer - 2 * werewolftot < 2) {
				return 1;
			}
		} else {
			if(this.maxplayer - 2 * this.werewolftot < 2 - this.witchtot - this.huntertot){
				return 1;
			}
		}
		return 0;
	}
	config(str) {
		let witch = this.witchtot;
		let werewolf = this.werewolftot;
		let villager = this.villagertot;
		let hunter = this.huntertot;
		let seer = this.seertot;
		let player = this.maxplayer;
		let killall = this.killall;
		let sheriff = this.sheriff;

		if(!(str.search(/屠边/) == -1) && !(str.search(/屠城/) == -1)) {
//			console.log(str.search(/屠边/));
//			console.log(str.search(/屠城/));
			return "你到底要屠啥？";
		}
		if(!(str.search(/无警/) == -1) && !(str.search(/有警/) == -1)) {
//			console.log(str.search(/屠边/));
//			console.log(str.search(/屠城/));
			return "你到底有无警？";
		}
		if(str.split(/民/).length > 2) {
			return "内容重复！";
		}
		if(str.split(/民/).length == 2) {
			let arr = str.split(/民/)[0].match(/\d+/g);

			if(!arr.length)return "缺少参数！";
			villager = Number(arr[arr.length - 1]);
		}
		if(str.split(/狼/).length > 2) {
			return "内容重复！";
		}
		if(str.split(/狼/).length == 2) {
			let arr = str.split(/狼/)[0].match(/\d+/g);

			if(!arr.length)return "缺少参数！";
			werewolf = Number(arr[arr.length - 1]);
		}
		if(str.split(/猎人/).length > 2) {
			return "内容重复！";
		}
		if(str.split(/猎人/).length == 2) {
			let arr = str.split(/猎人/)[0].match(/\d+/g);

			if(!arr.length)return "缺少参数！";
			hunter = Number(arr[arr.length - 1]);
		}
		if(str.split(/女巫/).length > 2) {
			return "内容重复！";
		}
		if(str.split(/女巫/).length == 2) {
			let arr = str.split(/女巫/)[0].match(/\d+/g);

			if(!arr.length)return "缺少参数！";
			witch = Number(arr[arr.length - 1]);
		}
		if(str.split(/预言家/).length > 2) {
			return "内容重复！";
		}
		if(str.split(/预言家/).length == 2) {
			let arr = str.split(/预言家/)[0].match(/\d+/g);

			if(!arr.length)return "缺少参数！";
			seer = Number(arr[arr.length - 1]);
		}
		if(!(str.search(/无警/) == -1)) {
			sheriff = false;
		}
		if(!(str.search(/有警/) == -1)) {
			sheriff = true;
		}
		if(!(str.search(/屠边/) == -1)) {
			killall = false;
		}
		if(!(str.search(/屠城/) == -1)) {
			killall = true;
		}
		player = villager + werewolf + hunter + witch + seer;
		/*
		console.log(villager);
		console.log(werewolf);
		console.log(witch);
		console.log(seer);
		console.log(hunter);
		console.log(player);
		console.log(killall);
		*/

		if(hunter > 1 || witch > 1 || seer > 1) {
			return "每种神只能有一个！";
		}
		if(player < this.nowplayer) {
			return "现有玩家人数过多！";
		}
		if(killall == false && (villager == 0 || player - werewolf - villager == 0)) {
			return "没有某方势力请选择屠城规则！";
		}
		let room1 = new room("test");

		room1.maxplayer = player;
		room1.villagertot = villager;
		room1.werewolftot = werewolf;
		room1.huntertot = hunter;
		room1.hunterlive = hunter;
		room1.witchtot = witch;
		room1.potion1 = witch;
		room1.potion2 = witch;
		room1.seertot = seer;
		room1.killall = killall;
		room1.sheriff = sheriff;
		if(room1.iswin) {
			return "游戏配置不合理！";
		}
		this.maxplayer = player;
		this.villagertot = villager;
		this.werewolftot = werewolf;
		this.huntertot = hunter;
		this.witchtot = witch;
		this.seertot = seer;
		this.killall = killall;
		this.sheriff = sheriff;
		return "游戏配置修改成功！";
	}
	begin(ws) {
		this.gp(ws, "游戏开始！");
		this.turn = "night";
		this.emer = false;
		this.liveplayer = this.maxplayer;
		this.hunterlive = this.huntertot;
		this.potion1 = this.witchtot;
		this.potion2 = this.witchtot;
		this.sheriffis = 0;

		let cha = [];

		for(let i = 0; i < this.villagertot; i++) {
			cha.push("villager");
		}
		for(let i = 0; i < this.werewolftot; i++) {
			cha.push("werewolf");
		}
		for(let i = 0; i < this.witchtot; i++) {
			cha.push("witch");
		}
		for(let i = 0; i < this.seertot; i++) {
			cha.push("seer");
		}
		for(let i = 0; i < this.huntertot; i++) {
			cha.push("hunter");
		}
		cha.sort(function () {
			return Math.random() - 0.5;
		});
		for(let i = 0; i < this.maxplayer; i++) {
			this.playerlist[i].role = cha[i];
		}
		for(let i = 0; i < this.maxplayer; i++) {
			pp.main(ws, ["你的角色是： ", cha[i]].join(''), this.playerlist[i].id);
			if(cha[i] == "werewolf") {
				let message = "你的队友是：\n";
				for(let j = 0; j < this.maxplayer; j++) {
					if(!(i == j) && (cha[j] == "werewolf")) {
						message = [message, this.playerlist[j].nickname, "\n"].join('');
					}
				}
				pp.main(ws, message, this.playerlist[i].id);
			}
			console.log([this.playerlist[i].nickname," : ",cha[i]].join(''));
		}
		this.gp(ws, "天黑请闭眼~");
	}
	constructor(roomid) {
		this.id = roomid;
		this.maxplayer = 8;
		this.nowplayer = 0;
		this.playerlist = [];
		this.ownerid = -1;
		this.witchtot = 0;
		this.huntertot = 1;
		this.seertot = 1;
		this.villagertot = 3;
		this.werewolftot = 3;
		this.killall = true;
		this.sheriff = true;

		this.turn = "waiting";
		this.emer = false;
		this.liveplayer = 0;
		this.hunterlive = 1;
		this.potion1 = 1;
		this.potion2 = 1;
		this.sheriffis = 1;

		this.killlist = [];
	}
}

module.exports = room;