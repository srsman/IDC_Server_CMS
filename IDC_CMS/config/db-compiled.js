'use strict';

//获取mongodb的配置信息
var mongoose = require('mongoose');
var setting = require('./setting');
//连接mongodb
mongoose.connect('mongodb://' + setting.host + '/' + setting.dbName);
//导出mongoose对象
module.exports = mongoose;

//# sourceMappingURL=db-compiled.js.map