var express = require("express"),
    app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var request = require("request"),
	cheerio = require("cheerio");
app.use(express.static('node_modules/materialize-css/bin'));
app.use(express.static('node_modules/materialize-css/font'));
app.use(express.static('css'));
app.use(express.static('images'));
app.use(express.static('public'));
server.listen(8030);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
	

  socket.on('new_message', function (data) {
  	url = "https://www.google.com.ar/search?q="+data.mensaje+"&biw=1920&bih=955&source=lnms&tbm=isch&sa=X&ved=0CAcQ_AUoAWoVChMI7N-l4LD-xwIViH-QCh2YJQOC";
		
		request(url, function (error, response, body) {
			if (!error) {
				var $ = cheerio.load(body),
					image = $('img').attr('src');
					
				socket.broadcast.emit('new_message_notification', {imagen: image, mensaje: data.mensaje});
				socket.emit('new_message_notification_to_me', {imagen: image, mensaje: data.mensaje});
			} else {
				console.log("We’ve encountered an error: " + error);
			}
		});

  });
});