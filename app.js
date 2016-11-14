var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
let session = require('express-session');  //实现session
let mongoStore = require('connect-mongo')(session); //实例化准备写入session
let setting = require('./config/setting');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//设置成ejs模板
app.engine('html',require('ejs').__express);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname,'public/images/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//持久化连接mongodb并且写入session
app.use(session({
  secret: setting.cookieSecret,   //cookie加密字段
  key: setting.dbName,            //cookie的键名
  cookie: { maxAge: 1000 * 60 * 60 * 2 },  //cookie的过期时间为1个月
  resave: false,
  saveUninitialized: true,                        //保存到数据库中
  store: new mongoStore({                       //实例化一个mongodb连接
    url: 'mongodb://' + setting.host + '/' + setting.dbName     //mongodb写入的地址
  })
}));
app.use(express.static(path.join(__dirname, 'public')));

//IDC_CMS接入路由
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res) {
  //返回404页面
  res.render('404',{
    title: '404 Not Found'
  });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
