//引入mongoose对象
const mongoose = require('../config/db');
//获取Schema对象
const Schema = mongoose.Schema;
//创建ip地址Schema模型
let ipSchema = new Schema({
  ipStart: { type: String , require: true },                    //ip启始地址
  ipEnd: { type: String , require: true },                      //ip结束地址
  ipsMessage: { type: String },                                 //ip地址池备注信息
  ip: [{ type: Schema.Types.ObjectId, ref:'uip' }],
  ipRoom: {type: Schema.Types.ObjectId, ref:'engine' }
});
//实例化ip地址的模型
let Ip = mongoose.model('ip',ipSchema);
//导出ip模型
module.exports = Ip;