//房间类，包含绝大部分游戏代码
const fs = require('fs');
const path = require('path');
const { threadId } = require('../../func/connection');
const pp = require('../../func/pprint');
const Player = require('./player');
const Check = require('./check');
const player = require('./player');

class room {
	gp(ws, str) {//群发消息
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
		if(this.sheriff) {
			message.push({
				"type": "text",
				"data": { "text": " 有警长 ",}
			});
		} else {
			message.push({
				"type": "text",
				"data": { "text": " 无警长 ",}
			});
		}
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
		for(let i = 0; i < this.playerlist.length;i++) {
			message.push({
				"type": "text",
				"data": { "text": ["玩家", (i + 1).toString(), "： 昵称：", this.playerlist[i].nickname, " QQ号：", this.playerlist[i].id.toString()].join(''),}
			});
			if(this.ownerid == i) {
				message.push({
					"type": "text",
					"data": { "text": " 房主",}
				});
			}
			if(this.playerlist[i].dead) {
				message.push({
					"type": "text",
					"data": { "text": " 死亡",}
				});
			}
			if(this.playerlist[i].leave) {
				message.push({
					"type": "text",
					"data": { "text": " 离开",}
				});
			}
			if(this.playerlist[i].issheriff) {
				message.push({
					"type": "text",
					"data": { "text": " 警长",}
				});
			}
			message.push({
				"type": "text",
				"data": { "text": " \n",}
			});
		}
//		console.log(message);
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
	getplayer(id) {//以多种方式匹配id
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
			if(this.playerlist[i].place + 1 === id) {
				return this.playerlist[i];
			}
		}
		let nid = Number(id);

		if(isNaN(nid))return undefined;
		for(let i = 0;i < this.playerlist.length;i++) {
			if(this.playerlist[i].id == nid) {
				return this.playerlist[i];
			}
		}
		for(let i = 0;i < this.playerlist.length;i++) {
			if(this.playerlist[i].place + 1 == nid) {
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
		player.place = this.nowplayer - 1;
		this.playerlist.push(player);
//		console.log(this.playerlist);
		return 1;
	}
	deleteplayer(player) {
//		console.log(this.playerlist);
		this.playerlist.splice(player.place, 1);//暴力删除
//		console.log(this.playerlist);
		for(let i = 0; i < this.playerlist.length; i++) {//传递房主
			this.playerlist[i].place = i;
			if(this.playerlist[i].isowner) {
				this.ownerid = i;
			}
		}
		this.nowplayer--;
	}
	cleankilllist(ws) {//白天统一处理夜晚或之前累计的死亡信息
		this.killlist.sort(function () {//随机排序，防止被看出死亡顺序
			return Math.random() - 0.5;
		});

		for(let i = 0; i < this.killlist.length; i++) {
			this.killlist[i].player.dead = true;
			this.gp(ws, ["玩家 ", this.killlist[i].player.id, " 死亡"].join(''));
			if(this.killlist[i].player.role == "witch") {//对应角色死亡的特殊处理
				this.potion1 = 0;
				this.potion2 = 0;
			}
			if(this.killlist[i].player.role == "hunter" && !this.killlist[i].player.leave && !(this.killlist[i].mess == "witch")) {
				this.emer = true;
				this.gp(ws, ["玩家 ", this.killlist[i].player.id, " 是猎人！"].join(''));
			}
			if(this.killlist[i].player.issheriff ) {
				if(this.killlist[i].player.leave) {
					this.killlist[i].player.issheriff = false;
					this.sheriffis = 0;
				} else {
					this.givesh = true;
				}
			}
		}
		this.killlist.splice(0,this.killlist.length);
		if(!(this.turn == "end" || this.turn == "waiting") && this.iswin()) {
			this.end(ws, this.iswin());
		}
	}
	killplayer(ws, player, str) {//假死，只是加入死亡名单
		this.killlist.push({player: player,mess: str,});
	}
	saveplayer(ws, player) {//复活假死的玩家
		for(let i = 0; i < this.killlist.length; i++) {
			if(this.killlist[i].id == player.id) {
				this.killlist.splice(i,1);
				return;
			}
		}
	}
	quit(ws, playerid) {
		let player = this.getplayer(playerid);

		if(player.isowner == true) {//传递房主
			for(let i = 0; i < this.playerlist.length; i++) {
				if(player.place != i && !(this.playerlist[i].leave)) {
//					console.log(player);
//					console.log(i);
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
			console.log("player deleted");
			if(this.nowplayer)this.state(ws);//等待则直接删除
		} else if(player.dead) {
			player.leave = true;
			this.gp(ws, ["玩家", player.nickname, "退出游戏"].join(''));
			if(this.turn == "hunter" && player.role == "hunter") {//如果在对应阶段离开则结束该阶段
				this.next(ws);
			}
		} else {
			this.killplayer(player, "quit");
			player.leave = true;
			this.gp(ws, ["玩家", player.nickname, "退出游戏"].join(''));
			if(this.turn == "seer" && player.role == "seer") {
				this.next(ws);
			}
			if(this.turn == "witch" && player.role == "witch") {
				this.next(ws);
			}
			if(this.turn != "werewolf" && this.turn != "seer" && this.turn != "sheriff1" && this.turn != "sheriff2" && this.turn != "day") {
				cleankilllist(ws);
			}//在白天则直接杀而且不需要处理紧急状态
			if(!(this.turn == "end" || this.turn == "waiting") && this.iswin()) {
				this.end(ws, this.iswin());//人离开时可能触发游戏胜利
			}
		}
	}
	nickname(ws, playerid, name) {
		let player = this.getplayer(playerid);

		if(player.nickname === name) {
			return -1;
		}
		console.log(Number(name));
		if(!(isNaN(Number(name)))) {//昵称不能为数值（避免昵称与编号qq号重复）且不能与他人重复
			return -2;
		}
		for(let i = 0;i < this.playerlist.length;i++) {
			if(this.playerlist[i].nickname === name) {
				return -3;
			}
		}
		player.nickname = name;
		this.state(ws);
		return 1;
	}
	iswin() {
		let werewolf = 0;
		let god = 0;
		let villager = 0;
		let night = (this.turn == "lastword");

		for(let i = 0; i < this.nowplayer; i++) {
			if(!(this.playerlist[i].leave) && !(this.playerlist[i].dead)) {
				if(this.playerlist[i].role == "werewolf") {
					werewolf++;
				} else if(this.playerlist[i].role == "villager") {
					villager++;
				} else {
					god++;
				}
			}
		}//查询当前局面信息并调用超级厉害的check模块！
		return Check.check(this.huntertot, this.sheriff == 1, this.potion1, this.potion2, werewolf, god, villager, this.killall, night);
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
		if(Check.check(hunter, sheriff, witch, witch, werewolf, seer + hunter + witch, villager, killall, 1)) {
			return "游戏配置不合理！";
		}//用超级厉害的check模块查询是否合理！
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
		this.emer = false;
		this.givesh = false;
		this.potion1 = this.witchtot;
		this.potion2 = this.witchtot;
		this.sheriffis = 0;
		this.day = 0;

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
		});//建立职业列表并随机
		for(let i = 0; i < this.nowplayer; i++) {
			this.playerlist[i].role = cha[i];
		}
		for(let i = 0; i < this.nowplayer; i++) {//公布角色且狼人认队友
			pp.main(ws, ["你的角色是： ", cha[i]].join(''), this.playerlist[i].id);
			if(cha[i] == "werewolf") {
				let message = "你的队友是：\n";

				for(let j = 0; j < this.nowplayer; j++) {
					if(!(i == j) && (cha[j] == "werewolf")) {
						message = [message, this.playerlist[j].nickname, "\n"].join('');
					}
				}
				pp.main(ws, message, this.playerlist[i].id);
			}
			console.log([this.playerlist[i].nickname," : ",cha[i]].join(''));
		}
		this.turn = "lastword";//这里是唯一一个不直接用next函数改变游戏状态的情况，因为waiting状态不能由next进入下一状态
		this.next(ws);
	}
	next(ws) {//状态转换函数，整个狼人杀插件的核心部分
		console.log(["end turn! : ",this.turn].join(''));
		if(this.emer == true) {//两个特殊情况的紧急插入
			this.turn2 = this.turn;
			this.turn = "hunter";
			this.gp(ws, "猎人请指定要刀的人~");
			this.emer = false;
			return;
		}
		if(this.turn == "hunter") {
			this.turn = this.turn2;
			this.next(ws);
			return;
		}
		if(this.givesh == true) {
			this.turn2 = this.turn;
			this.turn = "givesh";
			this.gp(ws, "警长请指定警徽传递~");
			this.givesh = false;
			return;
		}
		if(this.turn == "givesh") {
			this.turn = this.turn2;
			this.next(ws);
			return;
		}
		if(this.turn == "end") {
			this.turn = "waiting";
			this.gp(ws, "回到等待房间~");
			return;
		}
		if(this.turn == "waiting") {//调用end后可能还会有一部分残留的next操作，需要处理
			return;
		}
		if(this.turn == "lastword") {//以下部分是正常的循环
			this.day++;
			this.gp(ws, "天黑请闭眼~");
			this.turn = "werewolf";
			for(let i = 0; i < this.nowplayer; i++) {
				if(this.playerlist[i].role == "werewolf" && !(this.playerlist[i].leave) && !(this.playerlist[i].dead)) {
					pp.main(ws, "狼人请睁眼~\n请选择要刀的人~",this.playerlist[i].id);
				}
			}//狼人全离开则游戏结束，所以不需要判断是否跳过该阶段
			return;
		}
		if(this.turn == "werewolf") {
			for(let i = 0; i < this.nowplayer; i++) {
				if(this.playerlist[i].role == "werewolf" && !(this.playerlist[i].leave) && !(this.playerlist[i].dead)) {
					pp.main(ws, "狼人请闭眼~",this.playerlist[i].id);
				}
			}
			this.turn = "seer";
			let getseer = false;

			for(let i = 0; i < this.nowplayer; i++) {
				if(this.playerlist[i].role == "seer" && !(this.playerlist[i].leave) && !(this.playerlist[i].dead)) {
					pp.main(ws, "预言家请睁眼~\n请选择要查的人~",this.playerlist[i].id);
					getseer = true;
					break;
				}
			}
			if(!getseer) {//无对应角色存活则跳过
				this.next(ws);
			}
			return;
		}
		if(this.turn == "seer") {
			for(let i = 0; i < this.nowplayer; i++) {
				if(this.playerlist[i].role == "seer" && !(this.playerlist[i].leave) && !(this.playerlist[i].dead)) {
					pp.main(ws, "预言家请闭眼~",this.playerlist[i].id);
				}
			}
			this.turn = "witch";
			let getwitch = false;

			for(let i = 0; i < this.nowplayer; i++) {
				if(this.playerlist[i].role == "witch" && !(this.playerlist[i].leave) && !(this.playerlist[i].dead)) {
					getwitch = true;
					let mess = "女巫请睁眼~\n";

					if(this.potion1) {//无解药无法知道谁死了
						mess = [mess, "晚上， "].join('');
						if(this.killlist.length) {
							for(let i = 0; i < this.killlist.length; i++) {
								if(this.killlist[i].mess == "werewolf") {
									mess = [mess, this.killlist[i].player.nickname].join('');
								}
							}
							mess = [mess, " 死了\n"].join('');
						} else {
							mess = [mess, " 无人死亡\n"].join('');
						}
					}
					mess = [mess, "请选择用药"].join('');
					pp.main(ws, mess, this.playerlist[i].id);
					break;
				}
			}
			if(!getwitch) {
				this.next(ws);
			}
			return;
		}
		if(this.turn == "witch") {
			for(let i = 0; i < this.maxplayer; i++) {
				if(this.playerlist[i].role == "witch" && !(this.playerlist[i].leave) && !(this.playerlist[i].dead)) {
					pp.main(ws, "女巫请闭眼~",this.playerlist[i].id);
				}
			}
			this.gp(ws, "天亮请睁眼~");
			if(this.day == 1 && this.sheriff) {//上警优于公布死亡
				this.turn = "sheriff1";
				this.gp(ws, "今天是第一天，请选择是否竞选警长");
			} else {
				this.turn = "day";
				if(this.killlist.length == 0){
					this.gp(ws, "昨晚是平安夜~");
				} else {
					this.gp(ws, "昨天晚上~：");
					this.cleankilllist(ws);
				}
				this.next(ws);
			}
			return;
		}
		if(this.turn == "sheriff1") {
			this.gp(ws, "请候选人顺序发言，之后其他人投票");
			this.turn = "sheriff2";
			return;
		}
		if(this.turn == "sheriff2") {
			this.turn = "day";
			if(this.killlist.length == 0){
				this.gp(ws, "昨晚是平安夜~");
			} else {
				this.gp(ws, "昨天晚上~：");
				this.cleankilllist(ws);
			}//清空击杀表和进入猎人阶段一定要分开，否则可能会跳过两次
			this.next(ws);
			return;
		}
		if(this.turn == "day") {
			if(this.emer || this.givesh) {
				this.next(ws);
			} else {
				this.turn = "vote";
				this.gp(ws, "请各位轮流发言，之后进行投票");
			}
			return;
		}
		if(this.turn == "vote") {
			this.turn = "lastword";
			this.gp(ws, "请房主宣布进入下一个夜晚");
			return;
		}
	}
	givesheriff(ws, playerid, str) {//以下一系列函数逻辑相同
		let player = this.getplayer(playerid);

		player.issheriff = false;
		if(str == "-1") {
			this.sheriffis = 0;//处理警徽位置的记录
			this.next(ws);
			return "你把警徽送进了坟墓";
		} else {
			let target = this.getplayer(str);

			if(target == undefined) {
				return "要送的人不存在！";
			}
			if(target.leave == true || target.dead == true) {
				return "你想把警徽给死人？";
			}
			this.gp(ws, [target.nickname, "成为警长！"].join(''));
			target.issheriff = true;
			if(target.role == "werewolf") {
				this.sheriffis = -1;
			} else {
				this.sheriffis = 1;
			}
			this.next(ws);
			return "警徽送出成功！";
		}
	}
	hunterkill(ws, playerid, str) {
		let player = this.getplayer(playerid);

		if(str == "-1") {
			this.next(ws);
			return "你选择了仁慈";
		} else {
			let target = this.getplayer(str);

			if(target == undefined) {
				return "要杀的人不存在！";
			}
			if(target.leave == true || target.dead == true) {
				return "人不能死两次，对吧？";
			}
			this.killplayer(ws, target, "hunter");
			this.cleankilllist(ws);
			this.next(ws);
			return "杀人成功！";
		}
	}
	tell(ws, playerid, type, str) {
		let player = this.getplayer(playerid);

		if(!(type == "common") && !(type == "werewolf")) {
			pp.main(ws, "错误的聊天对象！", player.id);
			return;
		}
		for(let i = 0; i < this.nowplayer; i++) {
			if(!(player.place == i) && (type == "common" || this.playerlist[i].role == "werewolf")) {
				pp.main(ws, [player.nickname, " ： ", str].join(''), this.playerlist[i].id);
			}
		}
		return;
	}
	murder(ws, playerid, str) {
		let player = this.getplayer(playerid);

		if(str == "-1") {
			this.next(ws);
			return "你选择了仁慈";
		} else {
			let target = this.getplayer(str);

			if(target == undefined) {
				return "要杀的人不存在！";
			}
			if(target.leave == true || target.dead == true) {
				return "人不能死两次，对吧？";
			}
			this.killplayer(ws, target, "werewolf");
			this.next(ws);
			return "杀人成功！";
		}
	}
	foresee(ws, playerid, targetid) {
		let target = this.getplayer(targetid);

		if(target == undefined) {
			return "要验的人不存在！";
		}
		if(target.leave == true || target.dead == true) {
			return "你想对死人做什么？";
		}
		let ret = "";

		if(target.role == "werewolf") {
			ret = "这个人是坏蛋！";
		} else {
			ret = "这个人是良民！";
		}
		this.next(ws);
		return ret;
	}
	usepotion(ws, playerid, str1, str2 = "") {
		let player = this.getplayer(playerid);

		if(str1 == "-1") {
			this.next(ws);
			return "你袖手旁观";
		} else if(str1 == "kill") {
			let target = this.getplayer(str2);

			if(target == undefined) {
				return "要杀的人不存在！";
			}
			if(target.leave == true || target.dead == true) {
				return "人不能死两次，对吧？";
			}
			for(let i = 0; i < this.killlist.length; i++) {
				if(this.killlist[i].player.id == target.id) {
					return "你想补一刀？";
				}
			}
			this.potion1--;
			this.killplayer(ws, target, "werewolf");
			this.next(ws);
			return "杀人成功！";
		} else if(str1 == "heal") {
			let heal = false;

			for(let i = 0; i < this.killlist.length; i++) {
				if(this.killlist[i].mess == "werewolf" && !(player.id == this.killlist[i].id)) {
					this.saveplayer(this.killlist[i].player);
					heal = true;
					break;
				}
			}
			if(heal == false) {
				return "没有可救目标！";
			}
			potion--;
			this.next(ws);
			return "救人成功！";
		} else {
			return "错误的选项";
		}
	}
	vote(ws, playerid, str) {
		let player = this.getplayer(playerid);

		if(!(player.vote == -1)) {
			return "你投过票了！";
		}
		if(this.vote2) {
			if(str == "-1") {
				return "第二轮投票无法弃票！";
			}
			let target = this.getplayer(str);

			if(target == undefined) {
				return "投票目标不存在！";
			}
			if(!target.target) {//target记录第二轮投票时是否第一轮投票中票数最高
				return "不能选择其为投票目标！";
			}
		}
		if(str == "-1") {
			player.vote = -2;//-2 记录弃权（其实也可以不记录）
		} else {
			let target = this.getplayer(str);

			if(target == undefined) {
				return "投票目标不存在！";
			}
			if(target.leave == true || target.dead == true) {
				return "你想对死人做什么？";
			}
			player.vote = target.place;
			target.bevote += 2;
			if(player.issheriff) {//避免浮点误差，普通人视为2票，警长3票
				target.bevote++;
			}
		}
		let finish = true;

		for(let i = 0; i < this.playerlist.length; i++) {
			if(!this.playerlist[i].dead && !this.playerlist[i].leave && this.playerlist[i].vote == -1) {
				finish = false;
			}
		}
		if(finish == true) {//全部投票
			let maxx = 0;
			let maxp = 0;
			let maxu = 0;

			for(let i = 0; i < this.playerlist.length; i++) {
				if(this.playerlist[i].bevote > maxx) {
					maxx = this.playerlist[i].bevote;
					maxp = 0;
				}
				if(this.playerlist[i].bevote == maxx) {
					maxp++;
					maxu = i;
				}
			}//记录最大票数和人数和对应人
			if(maxp == 1) {
				this.gp(ws, [this.playerlist[maxu].nickname, "被投出去了！"].join(''));
				this.killplayer(ws, this.playerlist[maxu], "vote");
				this.cleankilllist(ws);
				this.vote2 = false;
				this.gp(ws, "请被投出者发表遗言！");
				this.next(ws);
			} else if(this.vote2) {
				this.gp(ws, "无人出局！");
				this.vote2 = false;
				this.next(ws);
			} else {
				this.gp(ws, "无人出局！第二轮投票开始！");
				this.vote2 = true;
			}
			for(let i = 0; i < this.playerlist.length; i++) {
				this.playerlist[i].vote = -1;
				if(this.vote2 == false) {
					this.playerlist[i].target = false;
				} else {
					this.playerlist[i].target = (maxx == this.playerlist[i].bevote);
				}
				this.playerlist[i].bevote = 0;
			}
		}
		return "成功选择投票目标！";
	}
	votesh(ws, playerid, str) {//和上个函数逻辑相同
		let player = this.getplayer(playerid);

		if(player.target) {//target记录是否上警
			return "你不能投票！";
		}
		if(!(player.vote == -1)) {
			return "你投过票了！";
		}
		if(this.vote2 && str == "-1") {
			return "第二轮投票无法弃票！";
		}
		if(str == "-1") {
			player.vote = -2;
		} else {
			let target = this.getplayer(str);

			if(target == undefined) {
				return "投票目标不存在！";
			}
			if(!target.target) {
				return "不能选择其为投票目标！";
			}
			player.vote = target.place;
			target.bevote++;
		}
		let finish = true;

		for(let i = 0; i < this.playerlist.length; i++) {
			if(!this.playerlist[i].dead && !this.playerlist[i].leave && !this.playerlist[i].target && this.playerlist[i].vote == -1) {
				finish = false;
			}
		}
		if(finish == true) {
			let maxx = 0;
			let maxp = 0;
			let maxu = 0;

			for(let i = 0; i < this.playerlist.length; i++) {
				if(this.playerlist[i].bevote > maxx) {
					maxx = this.playerlist[i].bevote;
					maxp = 0;
				}
				if(this.playerlist[i].bevote == maxx) {
					maxp++;
					maxu = i;
				}
			}
			if(maxp == 1) {
				this.gp(ws, [this.playerlist[maxu].nickname, "成为警长！"].join(''));
				this.playerlist[maxu].issheriff = true;
				if(this.playerlist[maxu].role == "werewolf") {
					this.sheriffis = -1;
				} else {
					this.sheriffis = 1;
				}//改变对应状态
				this.vote2 = false;
				this.next(ws);
			} else if(this.vote2) {
				this.gp(ws, "无人成为警长！");
				this.vote2 = false;
				this.next(ws);
			} else {
				this.gp(ws, "无人成为警长！第二轮投票开始！");
				this.vote2 = true;
			}
			for(let i = 0; i < this.playerlist.length; i++) {
				this.playerlist[i].vote = -1;
				if(this.vote2 == false) {
					this.playerlist[i].target = false;
				} else {
					this.playerlist[i].target = (maxx == this.playerlist[i].bevote);
				}
				this.playerlist[i].bevote = 0;
			}
		}
		return "成功选择投票目标！";
	}
	besh(ws, playerid, str) {
		let player = this.getplayer(playerid);

		if(player.bevote) {
			return "你不能选择两次！";
		}
		player.bevote = 1;
		if(str == "besheriff") {
			player.target = true;
		} else if(str == "notsheriff") {
			player.target = false;
		} else {
			return "错误的选项！";
		}
		let finish = true;

		for(let i = 0; i < this.playerlist.length; i++) {
			if(!this.playerlist[i].dead && !this.playerlist[i].leave  && !this.playerlist[i].bevote) {
				finish = false;
			}
		}
		if(finish == true) {
			for(let i = 0; i < this.playerlist.length; i++) {
				this.playerlist[i].bevote = 0;
			}
			let voter = 0;
			let bevoter = 0;

			for(let i = 0; i < this.playerlist.length; i++) {
				if(!this.playerlist[i].dead && !this.playerlist[i].leave) {
					if(this.playerlist[i].target)bevoter++;
					else voter++;
				}
			}
			if(!voter) {
				this.gp(ws, "没有投票者，取消警长竞选");
				for(let i = 0; i < this.playerlist.length; i++) {
					this.playerlist[i].target = false;
				}
			}
			if(!bevoter) {
				this.gp(ws, "没有竞选者，取消警长竞选");
				for(let i = 0; i < this.playerlist.length; i++) {
					this.playerlist[i].target = false;
				}
			}//处理特殊情况
			let mess = "警长竞选者： ";

			for(let i = 0; i < this.playerlist.length; i++) {
				if(this.playerlist[i].target == true) {
					mess = [mess, this.playerlist[i].nickname, " "].join('');
				}
			}//输出对应表单
			this.gp(ws, mess);
			this.next(ws);
		}
		return "成功选择！";
	}
	printrole(ws) {
		let message = "各玩家角色是：\n";

		for(let i = 0; i < this.nowplayer; i++) {
			message = [message, this.playerlist[i].nickname, "：", this.playerlist[i].role, "\n"].join('');
		}
		this.gp(ws, message);
	}
	end(ws, win) {
		this.turn = "end";
		if(win == 1) {
			this.gp(ws, "游戏结束！好人胜利！");
		} else {
			this.gp(ws, "游戏结束！狼人胜利！");
		}
		this.printrole(ws);
		for(;;) {//清空退出者
			let del = false;

			for(let i = 0; i < this.nowplayer; i++) {
				if(this.playerlist[i].leave == true) {
					this.deleteplayer(this.playerlist[i]);
					del = true;
					break;
				}
			}
			if(del == false) {
				break;
			}
		}//各种参数归位
		this.emer = false;
		this.givesh = false;
		this.potion1 = 1;
		this.potion2 = 1;
		this.sheriffis = 1;
		this.day = 0;
		for(let i = 0; i < this.nowplayer; i++) {
			this.playerlist[i].issheriff = false;
			this.playerlist[i].role = "unknown";
			this.playerlist[i].dead = false;
		}
		this.state(ws);
		this.next(ws);
	}
	constructor(roomid) {
		this.id = roomid;//房间id，字符串
		this.maxplayer = 8;//最大玩家数，也是应有玩家数
		this.nowplayer = 0;//当前玩家数
		this.playerlist = [];//玩家列表
		this.ownerid = -1;//房主编号
		this.witchtot = 0;//以下各角色人数
		this.huntertot = 1;
		this.seertot = 1;
		this.villagertot = 3;
		this.werewolftot = 3;
		this.killall = true;//0屠边1屠城
		this.sheriff = true;//是否警长

		this.turn = "waiting";//当前游戏状态
		this.turn2 = "";//如果有紧急状态则把当前状态临时存到这里
		this.emer = false;//是否猎人开枪
		this.givesh = false;//是否警徽传递
		this.vote2 = false;//投票是否第二阶段
		this.potion1 = 1;//解药存在
		this.potion2 = 1;//毒药存在
		this.sheriffis = 1;//警长阵营（好人/无警/狼人），用于判断胜利
		this.day = 0;//天数，用于判断是否上警

		this.killlist = [];//死亡名单，清空时才真正死亡
	}
}

module.exports = room;
