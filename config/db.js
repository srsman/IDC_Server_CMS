//获取mongodb的配置信息
let mongoose = require('mongoose');
let setting = require('./setting');
//连接mongodb
mongoose.connect('mongodb://' + setting.host + '/' + setting.dbName);
//导出mongoose对象
module.exports = mongoose;
