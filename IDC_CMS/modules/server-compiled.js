'use strict';

//引入mongoose对象
var mongoose = require('../config/db');
//获取Schema对象
var Schema = mongoose.Schema;

//server服务器管理模型
var serverSchema = new Schema({
  serverId: { type: String, require: true }, //服务器编号唯一值
  serverMark: { type: Boolean, default: false }, //服务器状态
  cpu: { type: String }, //cpu型号
  board: { type: String }, //主板
  yd: { type: String }, //硬盘
  memories: { type: String }, //服务器内存
  nic: { type: String }, //服务器网卡
  bandwidth: { type: String }, //服务器带宽
  ip: [{ type: String }], //服务器ip地址
  price: { type: Number, default: 0 }, //价格
  shelvesTime: { type: Date }, //服务器上架时间
  startTime: { type: Date }, //服务器起租时间
  endTime: { type: Date }, //服务器到期时间
  formSaleTime: { type: Date }, //服务器下架时间
  serverInfo: { type: String },
  serverAdmin: {
    serverUrl: { type: String }, //服务器管理地址
    serverUser: { type: String }, //服务器管理员账号
    serverPass: { type: String } },
  renew: {
    renewTime: { type: Date }, //续费时间
    renewPrice: { type: Number } //续费价格
  },
  serverCab: { type: Schema.Types.ObjectId, ref: 'cabinets' },
  serverRoom: { type: Schema.Types.ObjectId, ref: 'engine' }, //服务器机房
  serverIp: { type: Schema.Types.ObjectId, ref: 'ip' }, //Ip地址信息
  serverUse: { type: Schema.Types.ObjectId, ref: 'use' } });

//实例化model模型
var Server = mongoose.model('server', serverSchema);

//导出Server多项
module.exports = Server;

//# sourceMappingURL=server-compiled.js.map