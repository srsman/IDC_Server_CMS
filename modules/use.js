//加载mongoose
const mongoose = require('../config/db');
const Schema = mongoose.Schema;

//创建用途管理schema
let useSchema = new Schema({
  useName:{ type: String }                            //用途名称
});
//实例化用途模型
let Use = mongoose.model('use',useSchema);

module.exports = Use;