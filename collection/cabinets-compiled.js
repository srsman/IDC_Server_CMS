'use strict';

//导入Cabinets对象模型
var Cabinets = require('../modules/cabinet');
//导入 机房模型以及用途模型
var Engine = require('../modules/engineRoom');
var Use = require('../modules/use');

//---------------机柜cabinets get方法路由
exports.getCabinets = function (req, res) {
  //查询机房
  Engine.find({}, null, function (err, engineData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '机房查询失败' });
    }
    //查询通途
    Use.find({}, null, function (err, useData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '用途查询失败' });
      }
      //关联查询
      Cabinets.find({}).populate('cabinetsRoom').populate('cabinetsUse')
      // .populate('Use')
      .exec(function (err, info) {
        if (err) {
          return res.json({ 'postStatus': '查询有误，无法查询' });
        }
        //渲染页面
        return res.render('cabinets', {
          title: '机柜管理',
          session: req.session.username,
          engineDocs: engineData,
          useDocs: useData,
          docs: info
        });
      });
    });
  });
};

//---------------机柜cabinets 删除信息

exports.deleteCabinets = function (req, res) {
  //获取id信息
  var id = req.query.id;
  Cabinets.remove({ '_id': id }, function (err) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '机柜删除失败,请稍后再试' });
    }
    return res.redirect('back');
  });
};

//----------------机柜cabinets post 逻辑处理
exports.postCabinets = function (req, res) {
  //获取表单信息
  var cabinetsId = req.body.cabinetsId;
  var cabinetsU = req.body.cabinetsU;
  var cabinetsPower = req.body.cabinetsPower;
  var cabinetsRoom = [req.body.cabinetsRoom];
  var cabinetsUse = [req.body.cabinetsUse];
  //准备吸入到mongodb
  Cabinets.create({
    'cabinetsId': cabinetsId,
    'cabinetsU': cabinetsU,
    'cabinetsPower': cabinetsPower,
    'cabinetsRoom': cabinetsRoom,
    'cabinetsUse': cabinetsUse
  }, function (err, data) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '机柜添加失败,请稍后再试' });
    }
    return res.json({ 'postStatus': 'success', 'msg': '机柜添加完成' });
  });
};

//-------------------------------机柜更新
exports.updateCab = function (req, res) {
  var id = req.body.id;
  var cabinetsId = req.body.cabinetsIds;
  var cabinetsU = req.body.cabinetsUs;
  var cabinetsPower = req.body.cabinetsPowers;
  var cabinetsRoom = req.body.cabinetsRooms;
  var cabinetsUse = req.body.cabinetsUses;
  //更新机柜
  Cabinets.update({ '_id': id }, {
    'cabinetsId': cabinetsId,
    'cabinetsU': cabinetsU,
    'cabinetsPower': cabinetsPower,
    'cabinetsRoom': cabinetsRoom,
    'cabinetsUse': cabinetsUse
  }, function (err) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '机柜更新失败' });
    }
    return res.json({ 'postStatus': 'success', 'msg': '机柜更新完成' });
  });
};

//# sourceMappingURL=cabinets-compiled.js.map