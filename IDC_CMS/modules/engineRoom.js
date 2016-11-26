//加载mongoose
const mongoose = require('../config/db');
const Schema = mongoose.Schema;

//创建机房schema
let engineSchema =  new Schema({
  engineName:{ type: String },           //机房名称
  engineAddress: { type: String }        //机房地址
});
//实例化Model
let Engine = mongoose.model('engine',engineSchema);
//导出机房接口对象
module.exports = Engine;