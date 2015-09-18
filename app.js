var express = require("express"),
    app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var request = require("request"),
	cheerio = require("cheerio");
var md5 = require('md5');
var fs = require('fs');
app.use(express.static('node_modules/materialize-css/bin'));
app.use(express.static('node_modules/materialize-css/font'));
app.use(express.static('css'));
app.use(express.static('images'));
app.use(express.static('public'));
server.listen(8030);
var users = {};
var clients = {};
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/layout.html');
});

app.get('/login', function (req, res) {
  res.sendFile(__dirname + '/login.html');
});

io.on('connection', function (socket) {
	
	socket.on('user_connected', function (data) {
    if (!data.user || !users[data.user]) {
      console.log('new user');
      var file = fs.readFileSync(__dirname + '/login.html', 'utf8');
    }
    else {
      if (users[data.user].md5 == data.md5){
        clients[socket.id] = socket;
        users[data.user].socket = socket.id;
        user = data.user;
        
        
        url = "https://www.google.com.ar/search?q="+user+"&biw=1920&bih=955&source=lnms&tbm=isch&sa=X&ved=0CAcQ_AUoAWoVChMI7N-l4LD-xwIViH-QCh2YJQOC";
		
		request(url, function (error, response, body) {
			if (!error) {
				var $ = cheerio.load(body),
				image = $('img').attr('src');
					
				socket.emit('new_user_conected_to_me', {username: user, imagen: image});
        		socket.broadcast.emit('new_user_conected', {username: user, imagen: image});
			} else {
				console.log("We’ve encountered an error: " + error);
			}
		});		
		var file = fs.readFileSync(__dirname + '/index.html', 'utf8');
       
      }
      else {
        socket.emit('user_conflict');
        var file = fs.readFileSync(__dirname + '/login.html', 'utf8');
      }
    }
    socket.emit('file', {file: file});
  });

  socket.on('new_user', function (data) {
    var username = data.username;
    user = username;
    if(!users[username]) {
      var info = {};
      //var md5 = md5(username+'token');
      info.md5 = md5(username+'token');
      info.socket = socket.id;
      users[username] = info;
      clients[socket.id] = socket;
      this.emit('new_user_created', {username: username, md5: info.md5});
      var file = fs.readFileSync(__dirname + '/index.html', 'utf8');
      socket.emit('file', {file: file});
    }
    else {
      socket.emit('user_exists');
    }
  });
  /*socket.on('disconnect', function() {
    //console.log(user);
    users[user].socket = 0;
    delete clients[socket.id];
    //user
    setTimeout(function(){ 
      if(users[user].socket == 0) {
        delete users[user]; 
      }
    }, 30000);
  });*/


  socket.on('new_message', function (data) {
  	url = "https://www.google.com.ar/search?q="+data.mensaje+"&biw=1920&bih=955&source=lnms&tbm=isch&sa=X&ved=0CAcQ_AUoAWoVChMI7N-l4LD-xwIViH-QCh2YJQOC";
		
		request(url, function (error, response, body) {
			if (!error) {
				var $ = cheerio.load(body),
					image = $('img').attr('src');
					
				socket.broadcast.emit('new_message_notification', {imagen: image, mensaje: data.mensaje, username: data.username});
				socket.emit('new_message_notification_to_me', {imagen: image, mensaje: data.mensaje, username: data.username});
			} else {
				console.log("We’ve encountered an error: " + error);
			}
		});

  });
});