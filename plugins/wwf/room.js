const fs = require('fs');
const path = require('path');
const pp = require('../../func/pprint');
const Player = require('./player');

class room {
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
				this.villagertot, "狼", 
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
	quit(playerid) {

	}
	config(str) {
		let witch = this.witchtot;
		let werewolf = this.werewolftot;
		let villager = this.villagertot;
		let hunter = this.huntertot;
		let seer = this.seertot;
		let player = this.maxplayer;
		let killall = this.killall;

		if(str.search(/屠边/) && str.search(/屠城/)) {
			return "你到底要屠啥？";
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
		if(str.search(/屠边/)) {
			killall = false;
		}
		if(str.search(/屠城/)) {
			killall = true;
		}
		player = villager + werewolf + hunter + witch + seer;
		if(player < this.nowplayer)return "现有玩家人数过多！";
		if(werewolf < 1 || player - 2 * werewolf > 2 - witch - hunter)return "游戏配置不合理！";
		this.maxplayer = player;
		this.villagertot = villager;
		this.werewolftot = werewolf;
		this.huntertot = hunter;
		this.witchtot = witch;
		this.seertot = seer;
		this.killall = killall;
		return "游戏配置修改成功！";
	}
	constructor(roomid) {
		this.id = roomid;
		this.turn = "waiting";
		this.maxplayer = 8;
		this.nowplayer = 0;
		this.liveplayer = 0;
		this.playerlist = [];
		this.ownerid = -1;
		this.witchtot = 0;
		this.huntertot = 1;
		this.seertot = 1;
		this.villagertot = 3;
		this.werewolftot = 3;
		this.killall = true;
	}
}

module.exports = room;