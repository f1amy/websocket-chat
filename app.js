var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var mongoose = require('mongoose');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('a-super-long-secret-string-for-cookie-validation'));
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/chat', require('./routes/chat'));
app.use('/api', require('./routes/api'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

var User = require('./models/user');
var Channel = require('./models/channel');
var Message = require('./models/message');
mongoose.connect('mongodb://mongo/chat', { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  User.initUser(User);
  Channel.initChannel(Channel);
});

var debug = require('debug')('websocket-chat:server');
var http = require('http');

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

var server = http.createServer(app);

const WebSocket = require('ws');

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', async (requestMessage) => {
        console.log('received: %s', requestMessage);

        let requestMessageJson = JSON.parse(requestMessage);

        if (requestMessageJson.request === 'initChannel') {
          if (await Channel.exists({
            name: requestMessageJson.channelName
          })) {
            Message.find({
              channel_name: requestMessageJson.channelName
            }, function (err, messages) {
              if (err) throw err;

              let response = {
                response: 'initChannel',
                channelName: requestMessageJson.channelName,
                messages: messages
              };

              ws.send(JSON.stringify(response));
            });
          }
        }

        if (requestMessageJson.request === 'sendMessage') {
          if (await Channel.exists({
            name: requestMessageJson.channelName
          }) && await User.exists({
            name: requestMessageJson.userName
          })) {
            Message.create({
              user_name: requestMessageJson.userName,
              channel_name: requestMessageJson.channelName,
              message: requestMessageJson.message
            }, function (err, message) {
              let response = {
                response: 'acceptMessage',
                user_name: message.user_name,
                channel_name: message.channel_name,
                message: message.message
              };

              ws.send(JSON.stringify(response));
            });
          }
        }
    });
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
