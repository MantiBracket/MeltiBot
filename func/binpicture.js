const fs = require('fs');
const path = require('path');
const gp = require('./gprint');
const sleep = require('./sleep');

module.exports = {
	main
}
function main(ws, str, gid) {
	sleep.main(100);
	gp.main(ws, "查询蝎尾网络！", 0, gid);
	sleep.main(100);
	gp.main(ws, "查询失败！", 0, gid);
}