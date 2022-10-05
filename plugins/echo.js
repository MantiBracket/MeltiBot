const fs = require('fs');
const path = require('path');
const gp = require('../func/gprint');

module.exports = {
	main
}
function main(ws, str) {
//	console.log(str.message);
    if(str.message.split(" ")[1] === undefined) return 0;
//	console.log('ok1');
    if(!((str.message.split(" ")[0] === "\\echo"))) return 0;
//	console.log('ok2');
	gp.main(ws, str.message.substr(6), str.sender.user_id, str.group_id);
	return 1;
}