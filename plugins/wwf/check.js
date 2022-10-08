const fs = require('fs');
const path = require('path');

module.exports = {
	check
}
//非常强大的判断游戏是否进入一方的必胜态的模块！
function check(hunter, sheriff, potion1, potion2, werewolf, god, villager, killall, night) {
	if((werewolf > god + villager) || ((werewolf == god + villager) && !sheriff)) {
		return -1;
	}
	if((!villager || !god) && !killall) {
		return -1;
	}
	if(werewolf <= 0) {
		return 1;
	}
	if((god == 1) && !killall) {
		hunter = 0;
	}
	let flag = -1;
	let cnt = 0;

	if(!night) {
		flag = check(hunter, sheriff, potion1, potion2, werewolf - 1, god, villager, killall, 1);
	} else {
		if(potion1) {
			let res = check(hunter, sheriff, 0, potion2, werewolf, god, villager, killall, 0);

			if(flag < res) {
				flag = res;
			}
		}
		if(hunter) {
			cnt++;
			if(potion2) {
				let res = check(0, sheriff, potion1, 0, werewolf - 2, god - 1, villager, killall, 0);

				if(flag < res) {
					flag = res;
				}
			} else {
				let res = check(0, sheriff, potion1, potion2, werewolf - 1, god - 1, villager, killall, 0);

				if(flag < res) {
					flag = res;
				}
			}
		}
		if(potion1 || potion2) {
			cnt++;
			if(potion2) {
				let res = check(hunter, sheriff, 0, 0, werewolf - 1, god - 1, villager, killall, 0);

				if(flag < res) {
					flag = res;
				}
			} else {
				let res = check(hunter, sheriff, 0, 0, werewolf, god - 1, villager, killall, 0);

				if(flag < res) {
					flag = res;
				}
			}
		}
		if(cnt < god) {
			let res = check(hunter, sheriff, potion1, potion2, werewolf, god - 1, villager, killall, 0);
			
		if(flag < res) {
			flag = res;
		}
		}
		let res = check(hunter, sheriff, potion1, potion2, werewolf, god, villager-1, killall, 0);

		if(flag < res) {
			flag = res;
		}
	}
	if(flag == -1) {
		return -1;
	}
	return 0;
}
