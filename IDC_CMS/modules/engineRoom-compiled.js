'use strict';

//加载mongoose
var mongoose = require('../config/db');
var Schema = mongoose.Schema;

//创建机房schema
var engineSchema = new Schema({
  engineName: { type: String }, //机房名称
  engineAddress: { type: String } //机房地址
});
//实例化Model
var Engine = mongoose.model('engine', engineSchema);
//导出机房接口对象
module.exports = Engine;

//# sourceMappingURL=engineRoom-compiled.js.map