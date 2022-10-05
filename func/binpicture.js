'use strict';
let https = require('https');
let subscriptionKey = 'enter key here';
let host = 'api.bing.microsoft.com';
let path = '/v7.0/images/search';
let term = 'tropical ocean';

const fs = require('fs');
const ppath = require('path');
const gp = require('./gprint');
const sleep = require('./sleep');

let request_params = {
    method : 'GET',
    hostname : host,
    path : path + '?q=' + encodeURIComponent(term),
    headers : {
    'Ocp-Apim-Subscription-Key' : subscriptionKey,
    }
};
let response_handler = function (response) {
	let body = '';
	response.on('data', function (d) {
		body += d;
	});
	response.on('end', function () {
		let firstImageResult = imageResults.value[0];
		console.log(`Image result count: ${imageResults.value.length}`);
		console.log(`First image thumbnail url: ${firstImageResult.thumbnailUrl}`);
		console.log(`First image web search url: ${firstImageResult.webSearchUrl}`);
	});
};

module.exports = {
	main
}
function main(ws, str, gid) {
	let req = https.request(request_params, response_handler);
	req.end();
	sleep.main(100);
	gp.main(ws, "查询蝎尾网络！", 0, gid);
	sleep.main(100);
	gp.main(ws, "查询失败！", 0, gid);
}