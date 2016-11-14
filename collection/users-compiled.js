'use strict';

//引入mongoose对象以及依赖的其他模型
var Ip = require('../modules/ip');
var Uip = require('../modules/uip');
var Engine = require('../modules/engineRoom');
var Use = require('../modules/use');
var Server = require('../modules/server');
var Cabinets = require('../modules/cabinet');
var Host = require('../modules/serverHost');
var User = require('../modules/user');
var mongoose = require('mongoose');
//---------------user用户管理get路由
exports.getUser = function (req, res) {
  //
  var page = req.query.page ? Number.parseInt(req.query.page) : 1;
  var limits = 15;
  Server.find({ 'serverMark': false }, { '_id': 1, 'serverId': 1 }, function (err, serverDocs) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '服务器查询出错' });
    }
    User.count({ 'user.search': true }, function (err, total) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '总页数查询失败' });
      }
      User.find({ 'user.search': true }).skip((page - 1) * limits).limit(limits).populate('user.serverTo').exec(function (err, usersDocs) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '用户查询出错' });
        }
        return res.render('user', {
          title: '用户管理',
          session: req.session.username,
          serverData: serverDocs,
          usersData: usersDocs,
          isFirstPage: page - 1 == 0,
          isLastPage: (page - 1) * limits + Number.parseInt(usersDocs.length) == total,
          page: page
        });
      });
    });
  });
};
//写入新数据
exports.createUser = function (req, res) {
  //获取表单数据
  var webName = req.body.webName;
  var username = req.body.username;
  var userCarded = req.body.userCarded;
  var userPhoneNumber = req.body.userPhoneNumber;
  var userQQ = req.body.userQQ;
  var userAddress = req.body.userAddress;
  var userPayment = req.body.userPayment;
  var userTo = req.body.userTo;
  var serverTo = req.body.serverTo ? req.body.serverTo : '';
  var isPayment = req.body.isPayment;
  var time = new Date();
  var endTime = req.body.endTime;
  if (webName == '' || webName == null) {
    return res.json({ 'postStatus': 'error', 'msg': '用户名称不能为空' });
  }
  //更新当前服务器数据
  User.create({
    'user.webName': webName,
    'user.username': username,
    'user.userCarded': userCarded,
    'user.userPhoneNumber': userPhoneNumber,
    'user.userQQ': userQQ,
    'user.userAddress': userAddress,
    'user.userPayment': userPayment,
    'user.userTo': userTo,
    'user.serverTo': serverTo,
    'user.isPayment': isPayment,
    'user.search': true
  }, function (err, createData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '用户新增出错' });
    }
    //更新服务器信息
    Server.update({ '_id': serverTo }, { 'serverMark': true, 'startTime': time, 'endTime': endTime }, function (err, updateInfo) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '服务器更新出错' });
      }
      Server.findById({ '_id': serverTo }, { 'ip': 1 }, function (err, dataIp) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '服务器查询IP出错' });
        };
        User.update({ '_id': createData._id }, { 'user.uip': dataIp.ip }, function (err, updateIps) {
          if (err) {
            return res.json({ 'postStatus': 'error', 'msg': '用户写入IP出错' });
          }
          return res.json({ 'postStatus': 'success', 'msg': '用户新增完成' });
        });
      });
    });
  });
};

//------------------------用户信息更新
exports.updateUser = function (req, res) {
  var id = req.body.id;
  //查询信息
  User.findById({ '_id': id }, { 'user': 1 }, function (err, dataInfo) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '用户信息查询出错' });
    }
    return res.json({ 'postStatus': 'success', 'msg': dataInfo });
  });
};
//-------------------------------更新某数据
exports.Ups = function (req, res) {
  var username = req.body.name;
  var userCarded = req.body.Carded;
  var userPhoneNumber = req.body.PhoneNumber;
  var userQQ = req.body.QQ;
  var userAddress = req.body.Address;
  var userPayment = req.body.Payment;
  var userTo = req.body.uTo;
  var serverTo = req.body.sTo;
  var isPayment = req.body.Ament;
  var id = req.body.id;
  var serTo = req.body.serTo;
  //判断当前值
  if (serverTo == '1') {
    //更新删除服务器
    User.update({ '_id': id }, {
      'user.username': username,
      'user.userCarded': userCarded,
      'user.userPhoneNumber': userPhoneNumber,
      'user.userQQ': userQQ,
      'user.userAddress': userAddress,
      'user.userPayment': userPayment,
      'user.userTo': userTo,
      'user.serverTo': null,
      'user.isPayment': isPayment,
      'user.uip': []
    }, function (err, updateData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '用户信息更新出错' });
      }
      if (serTo !== '') {
        Server.update({ '_id': serTo }, { 'serverMark': false }, function (err, updateInfo) {
          if (err) {
            return res.json({ 'postStatus': 'error', 'msg': '用户关联服务器信息更新出错' });
          }
          return res.json({ 'postStatus': 'success', 'msg': '用户信息更新完成' });
        });
      } else {
        return res.json({ 'postStatus': 'success', 'msg': '用户信息更新完成' });
      }
    });
  } else {
    User.update({ '_id': id }, {
      'user.username': username,
      'user.userCarded': userCarded,
      'user.userPhoneNumber': userPhoneNumber,
      'user.userQQ': userQQ,
      'user.userAddress': userAddress,
      'user.userPayment': userPayment,
      'user.userTo': userTo,
      'user.serverTo': serverTo,
      'user.isPayment': isPayment,
      'user.uip': null
    }, function (err, updateData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '用户信息更新出错' });
      }
      if (serTo !== '') {
        Server.update({ '_id': serTo }, { 'serverMark': false }, function (err, updateInfo) {
          if (err) {
            return res.json({ 'postStatus': 'error', 'msg': '用户关联服务器信息出错,请刷新' });
          }
          Server.update({ '_id': serverTo }, { 'serverMark': true }, function (err, updateInfo) {
            if (err) {
              return res.json({ 'postStatus': 'error', 'msg': '用户关联服务器信息出错,请刷新' });
            }
            Server.findById({ '_id': serverTo }, { 'ip': 1 }, function (err, findIps) {
              if (err) {
                return res.json({ 'postStatus': 'error', 'msg': '用户查询IP信息出错,请刷新' });
              }
              User.update({ '_id': id }, { 'user.uip': findIps.ip }, function (err, updateIis) {
                if (err) {
                  return res.json({ 'postStatus': 'error', 'msg': '用户更新信息出错,请刷新' });
                }
                return res.json({ 'postStatus': 'success', 'msg': '用户信息更新完成' });
              });
            });
          });
        });
      } else {
        Server.update({ '_id': serverTo }, { 'serverMark': true }, function (err, updateInfo) {
          if (err) {
            return res.json({ 'postStatus': 'error', 'msg': '用户关联服务器信息出错,请刷新' });
          }
          //console.log('No Update');
          Server.findById({ '_id': serverTo }, { 'ip': 1 }, function (err, dataIpeS) {
            if (err) {
              return res.json({ 'postStatus': 'error', 'msg': '用户关联IP地址出错,请刷新' });
            }
            User.update({ '_id': id }, { 'user.uip': dataIpeS.ip }, function (err, updateIis) {
              if (err) {
                return res.json({ 'postStatus': 'error', 'msg': '用户更新信息出错,请刷新' });
              }
              return res.json({ 'postStatus': 'success', 'msg': '用户信息更新完成' });
            });
          });
        });
      }
    });
  }
};

//------------------------------查询IP地址
exports.searchStrIp = function (req, res) {
  //获取表单数据
  var ip = req.body.str;
  if (ip.length <= 0) {
    return res.json({ 'postStatus': 'error', 'msg': 'IP地址不能为空' });
  }
  if (ip.includes(',')) {
    //true转换成数组
    ip = ip.split(',');
  } else {
    //false 判断是否为字符串
    if (typeof ip == 'string') {
      ip = [ip];
    }
  }
  //准备查询内容
  User.findOne({ 'user.search': true, 'user.uip': { '$in': ip } }).populate({
    path: 'user.serverTo',
    match: { 'ip': { '$in': ip } }
  }).exec(function (err, searchData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': 'IP地址查询出错' });
    }
    return res.json({ 'postStatus': 'success', 'msg': searchData });
  });
};

//-------------------------------------查询用户编号
exports.searchStrId = function (req, res) {
  //获取表单数据
  var id = req.body.str;
  if (id.length <= 0) {
    return res.json({ 'postStatus': 'error', 'msg': '用户平台名称不能为空' });
  }
  User.find({ 'user.search': true, 'user.webName': id }).populate({
    path: 'user.serverTo'
  }).exec(function (err, searchData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': 'ID用户查询出错' });
    }
    return res.json({ 'postStatus': 'success', 'msg': searchData });
  });
};

//# sourceMappingURL=users-compiled.js.map