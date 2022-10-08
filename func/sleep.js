const fs = require('fs');
const path = require('path');

module.exports = {
	main
}
function main(delay) {
    let start = (new Date()).getTime();
    while ((new Date()).getTime() - start < delay) {//通过读取当前时间来判断何时停止死循环
        continue; 
    }
}//丑了，但是至少能用
