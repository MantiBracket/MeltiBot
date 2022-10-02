const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const connection = require('../connection');

//connection.connect();
//console.log(connection);
/*
const connection = mysql.createConnection ({
	host: 'localhost',
	user: 'root',
	password: '123456'
});
connection.connect();
*/

module.exports = {
	main
}
connection.query("USE Meltibot;", function (err, result) {
	if(err) {
		console.log(err.message);
		return;
	}
});
connection.query("show tables like 'Picture';", function (err, result) {
	if(err) {
		console.log(err.message);
		return;
	}
	console.log(result);
	if(!(result.length)) {
		connection.query("CREATE TABLE Picture\n(\nuserID int,\nurl varchar(255),\ntag varchar(255)\n);", function (err, result) {
			if(err) {
				console.log(err.message);
				return;
			}
			console.log("table created");
		});
	}
});
function main(ws, str) {
	
}