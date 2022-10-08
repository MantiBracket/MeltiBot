const fs = require('fs');
const path = require('path');
const pp = require('../../func/pprint');

class player {
	constructor(playerid) {
		this.id = playerid;//玩家QQ号
		this.place = 0;//房间内id，从1开始，但是实际存储中从0开始
		this.nickname = ["p", playerid.toString()].join('');//昵称，默认为 p+QQ号
		this.issheriff = false;//是警长
		this.role = "unknown";//角色
		this.dead = false;//是否（被宣布）死亡
		this.leave = false;//是否离开
		this.isowner = false;//是否房主
		
		this.vote = -1;
		this.target = false;
		this.bevote = 0;//投票相关变量
	}
}

module.exports = player;
