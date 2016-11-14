'use strict';

//加载mongoose
var mongoose = require('../config/db');
var Schema = mongoose.Schema;

//创建用途管理schema
var useSchema = new Schema({
  useName: { type: String } //用途名称
});
//实例化用途模型
var Use = mongoose.model('use', useSchema);

module.exports = Use;

//# sourceMappingURL=use-compiled.js.map