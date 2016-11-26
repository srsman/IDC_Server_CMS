'use strict';

//加载ipSchema模型
var Ip = require('../modules/ip');
var Uip = require('../modules/uip');
var Engine = require('../modules/engineRoom');
var mongoose = require('mongoose');
var Use = require('../modules/use');
//--------------------------ip地址池get路由
exports.getIp = function (req, res) {
  //获取ip地址机房信息
  Engine.find({}, { '_id': 1, 'engineName': 1 }, function (err, engineData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '机房信息查询失败,请稍后再试' });
    }
    //关联查询机房
    Ip.find({}).populate('ipRoom').populate('ip').exec(function (err, ipEngineRoom) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '机房管理2关联查询失败,请稍候再试' });
      }
      return res.render('ip', {
        title: 'Ip地址池管理',
        session: req.session.username,
        engineDocs: engineData,
        ipEngineRoomDocs: ipEngineRoom
      });
    });
  });
};

//-------------------------ip地址池更新
exports.updateIp = function (req, res) {
  //获取表单信息
  var id = req.body.updateId;
  var ipRoom = req.body.ipRoom;
  var ipsMessage = req.body.ipsMessage;
  //更新条件
  var updateFind = {
    '_id': id
  };
  //更新数据
  var updateInfo = {
    'ipRoom': ipRoom,
    'ipsMessage': ipsMessage
  };
  //更新mongodb
  Ip.update(updateFind, updateInfo, function (err) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '更新数据失败,请稍后在试' });
    }
    return res.json({ 'postStatus': 'success', 'msg': '更新数据成功' });
  });
};

//-------------------------ip地址池删除
exports.deleteIp = function (req, res) {
  //获取id信息
  var id = req.query.id;
  //删除数据
  Ip.remove({ '_id': id }, function (err) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': 'ip地址池删除失败' });
    }
    Uip.remove({ 'big_id': id }, function (err) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': 'ip地址删除失败' });
      }
      return res.redirect('back');
    });
  });
};

//-------------------------ip地址段post写入到mongodb
exports.postIp = function (req, res) {
  //获取表单提交的数据
  var ipStart = req.body.ipStart;
  var ipEnd = req.body.ipEnd;
  var ipRoom = req.body.ipRoom;
  var ipsMessage = req.body.ipsMessage ? req.body.ipsMessage : '';
  //判断准备写入的值是否存在
  if (ipStart == '' || ipStart == null) {
    return res.json({ 'postStatus': 'error', 'msg': '启始IP地址不能为空' });
  };
  if (ipEnd == '' || ipEnd == null) {
    return res.json({ 'postStatus': 'error', 'msg': '结束IP地址不能为空' });
  };
  if (ipRoom == '' || ipRoom == null) {
    return res.json({ 'postStatus': 'error', 'msg': '所属机房不能为空' });
  };
  var startSplit = ipStart.split('.');
  var startNum = startSplit[3];
  var endSplit = ipEnd.split('.');
  var endNum = endSplit[3];
  var ipLength = Number.parseInt(endNum) - Number.parseInt(startNum);
  var ipArray = [];
  for (var i = 0; i <= ipLength; i++) {
    var arrayObj = startSplit[0] + '.' + startSplit[1] + '.' + startSplit[2] + '.' + (Number.parseInt(startSplit[3]) + i);
    ipArray.push(arrayObj);
  }
  //准备写入到mongodb
  Ip.create({
    'ipStart': ipStart,
    'ipEnd': ipEnd,
    'ipsMessage': ipsMessage,
    'ipRoom': ipRoom
  }, function (err, createIpData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': 'IP地址池写入失败' });
    }
    //写入到Uip表信息
    //创建entity文档模型
    ipArray.forEach(function (data) {
      var uipEntity = new Uip({
        'ip': data,
        'big_id': createIpData._id,
        'ipRoom': ipRoom
      });
      uipEntity.save(function (err, data) {
        if (err) {
          return console.log('插入失败');
        }
        Ip.update({ '_id': data.big_id }, { $push: { 'ip': data._id } }, function (err, update) {
          if (err) {
            return console.log('添加失败');
          }
        });
      });
    });
    return res.json({ 'postStatus': 'success', 'msg': 'ip地址插入成功' });
  });
};

//--------------------------具体某条ip地址
exports.pId = function (req, res) {
  //获取当前ip池的id信息
  var id = req.query.id;
  var idObject = mongoose.Types.ObjectId(id);
  var page = req.query.page ? Number.parseInt(req.query.page) : 1;
  var limits = 256;
  //  let limits = 25;
  Uip.count({ 'big_id': idObject }, function (err, total) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '返回Ip总条数失败' });
    }
    Use.find({}, null, function (err, useData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '关联查询用途管理失败' });
      }
      Uip.find({ 'big_id': idObject }).skip((page - 1) * limits).limit(limits).populate('ipUse').populate('ipRoom').exec(function (err, ipListData) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '此ip段无法访问系统错误' });
        }
        return res.render('pid', {
          title: 'ip地址信息',
          session: req.session.username,
          ipDocs: ipListData,
          useDocs: useData,
          isFirstPage: page - 1 == 0,
          isLastPage: (page - 1) * limits + Number.parseInt(ipListData.length) == total,
          page: page
        });
      });
    });
  });
};
//-----------------------------search查询
exports.newId = function (req, res) {
  var searchStr = req.body.stringStr;
  if (searchStr.length <= 0) {
    return res.json({ 'postStatus': 'error', 'msg': 'ip地址不能为空' });
  }
  Uip.findOne({ 'ip': searchStr }).populate('ipUse').exec(function (err, searchData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': 'ip地址查询失败' });
    }
    return res.json({ 'postStatus': 'success', 'msg': searchData });
  });
};

//---------------------------批量更新
exports.UpdateId = function (req, res) {
  //获取表单数据
  var idArray = req.body.idData;
  if (idArray == null || idArray == '') {
    return res.json({ 'postStatus': 'error', 'msg': '请选择需要修改的ip' });
  }
  var info = req.body.infoData;
  var strArray = idArray.split('&');
  var idS = [];
  var inS = [];
  for (var i = 0; i < strArray.length; i++) {
    var id = strArray[i].split('uid=');
    idS.push(id[1]);
  }
  var infoArray = info.split('&');
  for (var j = 0; j < infoArray.length; j++) {
    var message = infoArray[j].split('=');
    inS.push(message[1]);
  };
  //准备更新数据
  Uip.update({ 'ip': { '$in': idS } }, {
    'ipMark': inS[0],
    'ipDisplay': inS[1],
    'ipInfo': decodeURI(inS[2]),
    'ipUse': mongoose.Types.ObjectId(inS[3])
  }, { multi: true }, function (err, data) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '更新出错' });
    };
    return res.json({ 'postStatus': 'success', 'msg': '更新完成' });
  });
};

//# sourceMappingURL=ip-compiled.js.map