//复读模块
const fs = require('fs');
const path = require('path');
const gp = require('../func/gprint');

module.exports = {
	main
}
function main(ws, str) {
//	console.log(str.message);
    if(str.message.split(" ")[1] === undefined) {//参数不齐
		return 0;
	}
//	console.log('ok1');
    if(!((str.message.split(" ")[0] === "\\echo"))) {//非本命令
		return 0;
	}
//	console.log('ok2');
	gp.main(ws, str.message.substr(6), str.sender.user_id, str.group_id);//暴力截取echo后的所有内容避免空格
	return 1;
}
