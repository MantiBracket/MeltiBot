import fetch from "node-fetch"

module.exports = {
	main
}
function main(ws, str) {
	fetch("https://cn.bing.com/images/search?q=%E7%8C%AB%E7%8C%AB%E8%99%AB", {
	"headers": {
	//    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
	//    "accept-language": "zh-CN,zh;q=0.9",
	//    "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
	//    "sec-ch-ua-arch": "\"x86\"",
	//    "sec-ch-ua-bitness": "\"64\"",
	//    "sec-ch-ua-full-version": "\"106.0.5249.91\"",
	//    "sec-ch-ua-full-version-list": "\"Chromium\";v=\"106.0.5249.91\", \"Google Chrome\";v=\"106.0.5249.91\", \"Not;A=Brand\";v=\"99.0.0.0\"",
	//    "sec-ch-ua-mobile": "?0",
	//    "sec-ch-ua-model": "\"\"",
	//    "sec-ch-ua-platform": "\"Windows\"",
	//    "sec-ch-ua-platform-version": "\"10.0.0\"",
	//    "sec-fetch-dest": "document",
	//    "sec-fetch-mode": "navigate",
	//    "sec-fetch-site": "none",
	//    "sec-fetch-user": "?1",
	//    "upgrade-insecure-requests": "1",
	//    "cookie": "MUID=024D05A506546DD61755146007556C4A; MUIDB=024D05A506546DD61755146007556C4A; SRCHD=AF=NOFORM; SRCHUID=V=2&GUID=1682933DDA9349ACBA1445013CEC309A&dmnchg=1; ANON=A=5ACE7E56FEAB807310035D99FFFFFFFF&E=1b3a&W=1; NAP=V=1.9&E=1ae0&C=wO-eCQ20B13U6FrUz-WWsiC0yCjNhfQGzQghLy8-F72f5QJ-Q0RdQw&W=1; PPLState=1; SUID=A; _EDGE_S=SID=30241D46ED3761D32DD70F72EC196046; _SS=SID=30241D46ED3761D32DD70F72EC196046; _UR=QS=0&TQS=0; _HPVN=CS=eyJQbiI6eyJDbiI6MSwiU3QiOjAsIlFzIjowLCJQcm9kIjoiUCJ9LCJTYyI6eyJDbiI6MSwiU3QiOjAsIlFzIjowLCJQcm9kIjoiSCJ9LCJReiI6eyJDbiI6MSwiU3QiOjAsIlFzIjowLCJQcm9kIjoiVCJ9LCJBcCI6dHJ1ZSwiTXV0ZSI6dHJ1ZSwiTGFkIjoiMjAyMi0xMC0wNVQwMDowMDowMFoiLCJJb3RkIjowLCJHd2IiOjAsIkRmdCI6bnVsbCwiTXZzIjowLCJGbHQiOjAsIkltcCI6Mn0=; ipv6=hit=1664988286643&t=4; KievRPSSecAuth=FABiBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACLGSZuiSMY8VIARAjgPoMs6SfGX3SWO5GhXNxhTIeVafP/IX3WxYbpEYO6+x6zw1U6r7G3TKUrwoNlCTGGHVOrQTY4P1+jHOL5gV/NVcRts2LHcpJRQHH07srKg4MR0fCmEPbCnO/r0rtH/XUouTFuRnH1bG3kxU9VEb0h3lwSgsBn35vwLa4qXcWVj8EW/pLrZ2nGDfE7FV+jtQ4ApbUq+k8A+U94UzWNtIq0INmvg6ZA3grqG8zUspch+RxlxTsSz5mph7fBo/cPFeVjghcTuHY/Zp03SpH6jAkvksLOO954ze6uWGg8WnuyPSMWP8aipB5ACtKjQNoXf6bfPPRY6eqkyBPUS5QvV/JQTemVbJAJjSe8G7SSQONECak5ZhDvS41StOiD6IGhHgNDi6wiH9OMtyA7y0i1eJcJb+qBx1IwJ+Nd26OTcKaUCrjSiOM3YiWwwSxSCERC4ybkiKyy+XuVMjXH/0xhzl9j2c41geJCA8ytwTVZiDy2pBWY1LFegm0s1h3twN2NoH5RMMsicqbSIYmoTzs3afd18WeZqhPCeio21sQB0d/PZXC8Dkhh8gRANDUYPP7KfidmXoQi0eU+Gq7jh4TiEkhIf5IcGMaDwBM8ZDM6QznzKmDKqy4uIdowJlJ/YwANtBIS3Jn8aVYdnyk/OmV/ojUoe2ir0PZ52PiQPEr1/TZEqNtKhabG8euYqbv/saZggrq+ILI/pDMMHgZFZZyjP4oGouE91U+LCen0xmzR6h6/ACCIgUR21swT391xrn9RHryx+/H0Y80dflx0obUuDz4em9yD6/KBgJiY1qLOA6hxhasfeXvE7ibQKQefWGzMp39kHcHfDrt0lNCxvSHQ9xM8Qt+voQzJvHgEhrclwNcNOoVBHjDJHR61+RORnvoByv6mYfqb3uFL5MlTFfMdVldXmuJziBj8VH6dmWzn9f2jYtg4ar390DQAJz9Mgwmrs7jKDf3ahysHge7N9WjpK5EYLruyJyK+C9WMEgVxGLbSFtxhMwoEWy2PBJ/7KnaLZxp2gp4+tgGrWVbP0ZgXMys6bfrGZXwH20wDcxfh9JD8aUjLD2I0F9F2A1fijrQYvFmVBaFw/jMIZIwX7tUDk/4R1P3muxCyrXrfmN4/qTveC8uZC8W+//Q9iCFvL8GWdbpgkbGQHA3NLmADghfe0kCN3ImGMUulbNu/Mfoxoc1TrULIjcJtksfWbrnNMFcwTzzDU7EZvVwkJOdMEq2X6x6vsf31Id+DYDXSLuB3M6YNIKLZusLgcHjB1u5xJLh71V4A6LuVg4gvA1H/ZC7RyXet9cEVxbPAA1wsaw9l6TMakhuwz+ICD5+61Ltm0dxD7HyAedsB6mjOV8eTDWZ1LVkR7zeDIAV4BssHRCLxcWpV+2I592cOPtMcyxLSZSprEUAGE9CqRkSEWQ/2VNkuWSl1yyxz75; _U=1IE7bmWkcPT7kgAmiARfA6r4mcTHy7glhHv0qt_qnLiJ96r3GhgbOQlC_QcqDhMHrvhOewLbMgJxFq4PwObi3buwQ6e1Ji-coWQyezZ3yIfNMhWpp25OGI6-Abogv_PuvGKl2spq6bo2hJilks_BkqC2OZPxWEhOI-tGUKu4X6W0MLFx5Tb8O9v-hXhNoRCf4; WLS=C=22948491e22545c7&N=Yeqi; WLID=ZWSKLM8OP2iAKcPLbFfT//dIL5PO6Rj7rGF0saNIUsMRs7hCRmjJ/goPVoBu4fK3eTc11ze4kP1vHOiru9AkeNsiueu17uOUjSEG/CeUf98=; _ITAB=STAB=TR; SRCHUSR=DOB=20220808&T=1664984685000&TPC=1664984690000&POEX=W; MMCASM=ID=1442B4872D2C4C08BEB680803E11E1D9; SRCHHPGUSR=SRCHLANG=zh-Hans&BRW=NOTP&BRH=S&CW=679&CH=666&SW=1536&SH=864&DPR=1.25&UTC=480&DM=0&WTS=63800581485&PV=10.0.0&HV=1664984697&PRVCW=679&PRVCH=666; SNRHOP=TS=638005815097379629&I=1"
	},
	"referrerPolicy": "strict-origin-when-cross-origin",
	"body": null,
	"method": "GET"
	}).then(val => val.text()).then(val => {
		const list = val.split("ming rms_img");
		const url = list[1].split("src=\"")[1].split("\"")[0];
		console.log(url);
	});
}