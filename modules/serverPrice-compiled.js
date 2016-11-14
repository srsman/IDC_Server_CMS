'use strict';

//引入mongoose对象
var mongoose = require('../config/db');
//获取Schema对象
var Schema = mongoose.Schema;

//server服务器管理模型
var serverPSchema = new Schema({
    serverId: { type: Schema.Types.ObjectId, ref: 'server' }, //服务器编号唯一值
    username: { type: String }, //续费人
    priceTime: { type: Date }, //续费时间
    price: { type: Number }, //续费价格
    priceInfo: { type: String }, //续费备注
    endTime: { type: Date },
    serverY: { type: String }
});

//实例化model模型
var ServerP = mongoose.model('serverP', serverPSchema);

//导出Server多项
module.exports = ServerP;

//# sourceMappingURL=serverPrice-compiled.js.map