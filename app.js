var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var entry = require('./routes/entry');
var fetch = require('./routes/fetch');

var app = express();
//var server = require("http").Server(app);
var io = require("socket.io").listen(server);
var chatModel = require("./database/chatmodel.js");

module.exports.bucket = (new couchbase.Cluster(config.couchbase.server)).openBucket(config.couchbase.bucket);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/scripts", express.static(__dirname + "/node_modules/"));
app.use('/', index);
app.use('/users', users);
app.use('/entry', entry);
app.use('/fetch', fetch);

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

io.on("connection", function(socket){
  socket.on("chat_message", function(msg){
    chatModel.create({message: msg}, function(error, result) {
        if(error) {
            console.log(JSON.stringify(error));
        }
        io.emit("chat_message", msg);
    });
  });
});

module.exports = app;
