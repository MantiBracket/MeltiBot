//从bing上搜索图片并发送至指定群
//实际上抓取的图片为缩略图，主要是怕群友乱搞发出一些不对劲的图片
const fetch = require("node-fetch");

module.exports = {
	main
}
function main(ws, str, gid) {
	let mess = ["https://cn.bing.com/images/search?q=", encodeURIComponent(str)].join('');//构造网址，中文关键词将被转化
	let res = "";
	
	fetch(mess, {//直接抓取网页源码，似乎以下参数可以省略
		"headers": {},
		"referrerPolicy": "strict-origin-when-cross-origin",
		"body": null,
		"method": "GET"
		}).then(val => val.text()).then(val => {
			let list = val.split("\" src=\"")//图片链接必定以src=开头
			for(let i = 0; i < list.length && i < 100; i++) {
				res = list[i].split("\"")[0];
				if(res.substring(0, 5) == "https") {//判断是否为图片链接
					console.log("get it 1: ", res);
					const ret = {
						"action": "send_group_msg",
						"params": {
							"group_id": gid,
							"message": [
								{
									"type": "image",
									"data": {
										"file": "Meltibot.image",
										"url": res,
									}
								},
							]
						},
					}
					ws.send(JSON.stringify(ret));//输出图片
					return;
				}
			}
		});
}
