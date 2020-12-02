//익스프레스, http, fs, bodyParser 모듈 사용 선언
var express = require('express');
var http = require('http');
var fs = require('fs');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

//익스프레스 nodejs프레임워크로 개발
var app = express();

//bodyParser로 json내용 파싱 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(session({
	secret: 'as#@@N@112bb,',
	resave: false,
	saveUninitialized: true
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//root/login POST request
app.get('/login', (req, res, next) => {
	res.render('login', {session: req.session});
});

var userlist = {
	"id":"tester1",
	"pw":"passwd"
};

app.post('/login', (req, res, next) => {
	if(req.body.id == userlist.id && req.body.pw == userlist.pw) {
			req.session.user = req.body.id;
			console.log('logon id:'+req.body.id+' pw:'+req.body.pw);
			res.redirect('/index');
	}
	else{
		delete req.session.user;
		res.redirect('/login');
	}
});

//root에서 GET request 처리
app.get('/index', (req, res) => {
	if(req.session.user)
		fs.readFile('./rasberryPIinfo.json', 'utf8', (error, databuf) => {
			if (error) { throw error };//예외 처리 루틴
			var data = JSON.parse(databuf);
			console.log('Send data to web');
			console.log(data);
			res.render('Main2',	{id:data.id, ip:data.ip, port:data.port, x:data.sensor.latitude, y:data.sensor.longitude});
		});
	else
		res.redirect('/login');
});

//root/read에서 GET request 처리
app.get('/read', (req, res, next) => {
	console.log('Hello.. ready to GET request..');
	var databuf;//저장된 rasberryPI 정보를 읽을 버퍼
	//fs 모듈을 사용하여 rasberryPIinfo.json파일을 읽어와 databuf에 저장
	fs.readFile('rasberryPIinfo.json', 'utf8', (error, databuf) => {
		if (error) { throw error };//예외 처리 루틴
		console.log("sent this: " + databuf);//콘솔에 보낼 정보를 표시
		var data = JSON.parse(databuf);
		res.json(data);//client에 json형식의 data 전송
	});
	/*
	 * //undefined!
	console.log(databuf);
	var data1 = JSON.stringify(databuf);
	console.log(data1);
	*/
	/*
	 * //error returned!
	 * var data2 = JSON.parse(databuf);
	console.log(data2);*/
});

//root/write에서 POST request 처리
app.post('/write', (req, res) => {
	console.log(req.body);
	var data = req.body;//client의 POST request로 받아온 body의 json을 저장
	var dataJSON = JSON.stringify(data);//json을 string 변환하여 저장
	//fs모듈을 사용하여 rasberryPIinfo.json파일에 저장
	fs.writeFile('rasberryPIinfo.json', dataJSON, 'utf8', (error, data) => {
		if (error) { throw error };
	});
	res.send(req.body);//회신용 응답
});


var port = 3000;//임의로 설정한 포트 번호

//서버 개설. 기본적으로 loopback IP에서 동작
//임의로 설정한 port를 parameter로 주어 3000번 포트에서 동작함
//localhost:3000위치가 root
var server = app.listen(port, () => {
	console.log("open Nodejs server");
	console.log("transport JSON rasberryPI to transcoder");
});
