//帮助模块
const fs = require('fs');
const path = require('path');
const pr = require('../func/print');//帮助可以在私聊或者群聊中进行，所以需要特制输出模块

module.exports = {
	main
}
function main(ws, str) {
    if(!((str.message.split(" ")[0] === "\\help"))) {
		return 0;
	}
	console.log("help");
    const answerstr = (JSON.parse(fs.readFileSync(path.join(__dirname, '../json/help.json'), 'utf8')))
	//读取整个帮助文本JSON
	if(str.message.split(" ")[1] === undefined || str.message.split(" ")[1] === "help") {//判断帮助类型
		pr.main(ws, answerstr.help.text, str.sender.user_id, str.group_id);
	} else if(str.message.split(" ")[1] === "echo") {
		pr.main(ws, answerstr.echo.text, str.sender.user_id, str.group_id);
	} else if(str.message.split(" ")[1] === "picture") {
		pr.main(ws, answerstr.picture.text, str.sender.user_id, str.group_id);
	} else if(str.message.split(" ")[1] === "wwf") {
		pr.main(ws, answerstr.wwf.text, str.sender.user_id, str.group_id);
	} else if(str.message.split(" ")[1] === "wwfrule") {
		pr.main(ws, answerstr.wwfrule.text, str.sender.user_id, str.group_id);
	} else if(str.message.split(" ")[1] === "ban") {
		pr.main(ws, answerstr.ban.text, str.sender.user_id, str.group_id);
	} else if(str.message.split(" ")[1] === "future") {
		pr.main(ws, answerstr.future.text, str.sender.user_id, str.group_id);
	} else {
		pr.main(ws, "没有这个帮助条目！", str.sender.user_id, str.group_id);
	}
	return 1;
}
