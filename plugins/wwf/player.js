const fs = require('fs');
const path = require('path');
const pp = require('../../func/pprint');

class player {
	constructor(playerid) {
		this.id = playerid;
		this.place = 0;
		this.nickname = ["p", playerid.toString()].join('');
		this.issheriff = false;
		this.role = "unknown";
		this.dead = false;
		this.leave = false;
		this.isowner = false;
		this.vote = -1;
		this.target = false;
		this.bevote = 0;
	}
}

module.exports = player;