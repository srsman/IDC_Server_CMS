'use strict';

//引入mongoose对象
var mongoose = require('../config/db');
//获取Schema对象
var Schema = mongoose.Schema;

//server服务器历史记录模型
var hostSchema = new Schema({
    'server': {
        server: { type: Schema.Types.ObjectId, ref: 'server' },
        serverName: { type: String },
        serverTime: { type: Date },
        serverInfoS: { type: String }
    }
});
//实例化model模型
var Host = mongoose.model('host', hostSchema);

//导出Server多项
module.exports = Host;

//# sourceMappingURL=serverHost-compiled.js.map