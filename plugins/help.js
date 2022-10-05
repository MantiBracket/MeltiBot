const fs = require('fs');
const path = require('path');
const pr = require('../func/print');

module.exports = {
	main
}
function main(ws, str) {
    if(!((str.message.split(" ")[0] === "\\help"))) return 0;
	console.log("help");
    const answerstr = (JSON.parse(fs.readFileSync(path.join(__dirname, '../json/help.json'), 'utf8')))

	if(str.message.split(" ")[1] === undefined || str.message.split(" ")[1] === "help") {
		pr.main(ws, answerstr.help.text, str.sender.user_id, str.group_id);
	}
	if(str.message.split(" ")[1] === "echo") {
		pr.main(ws, answerstr.echo.text, str.sender.user_id, str.group_id);
	}
	if(str.message.split(" ")[1] === "picture") {
		pr.main(ws, answerstr.picture.text, str.sender.user_id, str.group_id);
	}
	if(str.message.split(" ")[1] === "wwf") {
		pr.main(ws, answerstr.wwf.text, str.sender.user_id, str.group_id);
	}
	return 1;
}