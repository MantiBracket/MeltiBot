const mysql = require("mysql");
const connection = mysql.createConnection ({
	host: 'localhost',
	user: 'root',
	password: '123456',
	connectionLimit: 10
});
module.exports = connection;