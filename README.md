# MeltiBot
Melticore`s QQ bot!

*powered by Melticore*

## bot成果

目前支持任务书上除装进docker以外的所有要求/功能。（搜图API改为爬虫（不过我好奇这是不是真正意义上的爬虫））

此外还加装了help指导功能，以及在狼人杀环节实现了一些任务外功能，如：公共/队内交流，游戏中判断游戏是否必胜并提前结束，可以调整角色数量以外的部分游戏规则，等等。具体feature请使用help功能查看。

## 如何安装并使用

1、下载go-cqhttp并配置好（使用你想要作为bot的QQ号），使用正向websocket方式连接。在终端打开cq-http并正确运行，保持其开启。

2、安装最新版本的node.js，npm与mysql

3、自行调节config.js中的配置

4、在文件目录下打开终端，键入

```
npm install
npm start
```

即可开启bot

此时私聊bot或在对应群聊@bot则会收到回应，说明bot正确运行

## 感谢

感谢一众热心学长或其他有经验的朋友对我在各种技术学习上提供的帮助。

感谢某群几十位水友在我公开测试时提供测试结果与揪出各种bug。

感谢出题人对我各种疑问的及时解答和反馈以及帮我速通狼人杀（

感谢某位四喜同学对“某非常强大的check函数”的算法逻辑进行正确性确认。

感谢某位英语老师允许我把英语作业留到bot开发结束后提交。

感谢舍友在我于睡觉时间熬夜敲代码的不杀之恩（

感谢冰岩的各位给了我一次能如此大量学习与拓宽视野的机会。
