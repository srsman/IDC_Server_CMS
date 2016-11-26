'use strict';

//引入mongoose对象
var mongoose = require('../config/db');
//获取Schema对象
var Schema = mongoose.Schema;
//创建ip地址Schema模型
var uipSchema = new Schema({
    ip: { type: String },
    ipMark: { type: Boolean, default: false }, //ip地址是否启用
    ipServer: { type: Schema.Types.ObjectId, ref: "server" }, //ip所属的服务器
    ipUse: { type: Schema.Types.ObjectId, ref: 'use' }, //ip地址的用途
    ipInfo: { type: String }, //ip地址的详情信息
    big_id: { type: Schema.Types.ObjectId, ref: 'ip' }, //big_ip地址
    ipRoom: { type: Schema.Types.ObjectId, ref: 'engine' }, //ip所属机房
    server: { type: String },
    ipDisplay: { type: Boolean, default: false }
});
//实例化ip地址的模型
var Uip = mongoose.model('uip', uipSchema);
//导出ip模型
module.exports = Uip;

//# sourceMappingURL=uip-compiled.js.map