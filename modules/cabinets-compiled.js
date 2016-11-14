'use strict';

//导入mongoose对象以及Schema模型
var mongoose = require('../config/db');
var Schema = mongoose.Schema;

//创建机柜cabinetsSchema Schema对象模型
var cabinetsSchema = new Schema({
  cabinetsId: { type: String, require: true }, //服务器编号/服务器名称 必填
  cabinetsU: { type: Number }, //机柜U数
  cabinetsPower: { type: String }, //机柜电力参数
  cabinetsRoom: { type: Schema.Types.ObjectId, ref: 'Engine' }, //机柜所属机房选择
  cabinetsUse: { type: Schema.Types.ObjectId, ref: 'Use' } //机柜所属用途
});

//实例化机柜模型
var Cabinets = mongoose.model('cabinets', cabinetsSchema);

module.exports = Cabinets;

//# sourceMappingURL=cabinets-compiled.js.map