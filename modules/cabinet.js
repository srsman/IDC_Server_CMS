//导入mongoose对象以及Schema模型
const mongoose = require('../config/db');
const Schema = mongoose.Schema;

//创建机柜cabinetsSchema Schema对象模型
let cabinetsSchema = new Schema({
  cabinetsId: { type: String, require: true },         //机柜编号/服务器名称 必填
  cabinetsU: { type: Number },                         //机柜U数
  cabinetsPower: { type: String },                     //机柜电力参数
  cabinetsRoom: [{ type: Schema.Types.ObjectId, ref:'engine'}],  //机柜所属机房选择
  cabinetsUse: [{ type: Schema.Types.ObjectId, ref:'use' }]       //机柜所属用途
});

//实例化机柜模型
let Cabinets = mongoose.model('cabinets',cabinetsSchema);

module.exports = Cabinets;