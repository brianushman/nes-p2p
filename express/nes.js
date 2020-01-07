var express = require('express');
var https = require('https');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var mail = require('./routes/mail');

var mysql = require('mysql');
var app = express();

var options = {
  ca: [fs.readFileSync('/etc/ssl/certs/bundle.crt')],
  cert: fs.readFileSync('/etc/ssl/certs/nesp2p_com.crt'),
  key: fs.readFileSync('/etc/ssl/private/nesp2p.key')
};
var server = https.createServer(options);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('disconnect', function() {
      io.emit('message', JSON.parse(`{ "socket_id": "${socket.id}", "message_id": 4 }`));
  });

  socket.on('message', (message) => {
    io.emit('message', message);    
  });
});
server.listen(5000);
var appServer = https.createServer(options, app);
appServer.listen(3000);

// Peer.js
var PeerServer = require('peer').PeerServer;
var peer = PeerServer({
  port: 9000,
  path: '/nes',
  ssl: options
});

//MySql
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Forsythe!12',
  database : 'nes'
});

connection.connect();

app.use(function (req, res, next) {
  var allowedOrigins = ["https://nesp2p.com", "ws://nesp2p.com"];
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/roms', function(request, response){
  connection.query('select * from roms', function(error, results){
    if ( error ){
        response.status(400).send('Error in database operation');
    } else {
        response.send(results);
    }
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/mail', mail);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
