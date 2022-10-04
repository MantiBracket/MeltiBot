const fs = require('fs');
const path = require('path');

module.exports = {
	main
}
function main(delay) {
    let start = (new Date()).getTime();
    while ((new Date()).getTime() - start < delay) {
        continue; 
    }
}