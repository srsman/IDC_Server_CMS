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
var serverP = require('../modules/serverPrice');
var mongoose = require('mongoose');
//------------------财务管理get路由
exports.getSkillfully = function (req, res) {
  var page = req.query.page ? Number.parseInt(req.query.page) : 1;
  var limits = 15;
  var queryS = { 'serverMark': true };
  var toIndex = 'skillfully';
  getIndexS(page, limits, req, res, queryS, toIndex);
};
//服务器下架处理逻辑
exports.serverDown = function (req, res) {
  //获取表单信息
  var id = req.body.id;
  var time = new Date();
  Server.update({ '_id': id }, { 'formSaleTime': time, 'serverMark': false }, function (err) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '服务器下架出错请稍候再试' });
    }
    Host.create({
      'server.server': mongoose.Types.ObjectId(id),
      'server.serverName': req.session.username,
      'server.serverTime': new Date(),
      'server.serverInfoS': '服务器下架'
    }, function (err, createData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '服务器维护记录写入出错请稍候再试' });
      }
      return res.json({ 'postStatus': 'success', 'msg': '服务器下架完成' });
    });
  });
};

//-----------------------------即将5天到期的服务器
exports.thereDay = function (req, res) {
  var page = req.query.page ? Number.parseInt(req.query.page) : 1;
  var limits = 15;
  var toIndex = '5day';
  var timeData = new Date();
  var getYear = timeData.getFullYear();
  var getMonth = timeData.getMonth() + 1;
  var getDate = timeData.getDate() + 5;
  if (getDate < 10) {
    getDate = '0' + getDate;
  }
  var time = new Date(getYear + '-' + getMonth + '-' + getDate);
  var queryS = { 'serverMark': true, endTime: { '$lte': time } };
  getIndexS(page, limits, req, res, queryS, toIndex);
};

//-----------------------------即将7天到期的服务器
exports.serveDay = function (req, res) {
  var page = req.query.page ? Number.parseInt(req.query.page) : 1;
  var limits = 15;
  var toIndex = '7day';
  var timeData = new Date();
  var getYear = timeData.getFullYear();
  var getMonth = timeData.getMonth() + 1;
  var getDate = timeData.getDate() + 7;
  if (getDate < 10) {
    getDate = '0' + getDate;
  }
  var time = new Date(getYear + '-' + getMonth + '-' + getDate);
  var queryS = { 'serverMark': true, endTime: { '$lte': time } };
  getIndexS(page, limits, req, res, queryS, toIndex);
};

//-----------------------------即将15天到期的服务器
exports.twoFDay = function (req, res) {
  var page = req.query.page ? Number.parseInt(req.query.page) : 1;
  var limits = 15;
  var toIndex = '15day';
  var timeData = new Date();
  var getYear = timeData.getFullYear();
  var getMonth = timeData.getMonth() + 1;
  var getDate = timeData.getDate() + 15;
  if (getDate < 10) {
    getDate = '0' + getDate;
  }
  var time = new Date(getYear + '-' + getMonth + '-' + getDate);
  var queryS = { 'serverMark': true, endTime: { '$lte': time } };
  getIndexS(page, limits, req, res, queryS, toIndex);
};

//-----------------------------服务器续费Get路由
exports.serverPics = function (req, res) {
  var page = req.query.page ? Number.parseInt(req.query.page) : 1;
  var limits = 15;
  Server.count({ 'serverMark': true }, function (err, total) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '无法查询服务器总条数' });
    }
    Server.find({ 'serverMark': true }, null, { 'skip': (page - 1) * limits, 'limit': limits }, function (err, findData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '服务器查询出错，当前未有启用服务器' });
      }
      return res.render('serverPics', {
        title: '财务管理',
        session: req.session.username,
        serverDocs: findData,
        isFirstPage: page - 1 == 0,
        isLastPage: (page - 1) * limits + Number.parseInt(findData.length) == total,
        page: page
      });
    });
  });
};
//---------------------------服务器续费post路由
exports.serverPrice = function (req, res) {
  var id = req.body.id;
  var serverPrice = req.body.serverPrice;
  var endTime = req.body.endTime;
  var serverPriceInfo = req.body.serverPriceInfo;
  var username = req.session.username;
  var time = new Date();
  Server.update({ '_id': id }, { 'renew.renewTime': time, 'renew.renewPrice': serverPrice, 'endTime': endTime, 'price': serverPrice }, function (err) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '服务器更新数据失败' });
    }
    User.findOne({ 'user.serverTo': mongoose.Types.ObjectId(id) }, { 'user.webName': 1 }, function (err, userId) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '原用户查询失败,请稍后再试' });
      }
      //插入新的数据
      serverP.create({
        'serverId': id,
        'username': username,
        'priceTime': time,
        'price': serverPrice,
        'priceInfo': serverPriceInfo,
        'endTime': endTime,
        'serverY': userId.user.webName
      }, function (err, createData) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '服务器续费记录插入失败' });
        }
        return res.json({ 'postStatus': 'success', 'msg': '服务器续费完成' });
      });
    });
  });
};
//---------通用function
function getIndexS(page, limits, req, res, queryS, toIndex) {
  Server.count(queryS, function (err, total) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '无法查询服务器总条数' });
    }
    Server.find(queryS, null, { 'skip': (page - 1) * limits, 'limit': limits }, function (err, findData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '服务器查询出错，当前未有启用服务器' });
      }
      return res.render(toIndex, {
        title: '财务管理',
        session: req.session.username,
        serverDocs: findData,
        isFirstPage: page - 1 == 0,
        isLastPage: (page - 1) * limits + Number.parseInt(findData.length) == total,
        page: page
      });
    });
  });
};

//-----------------------------服务器续费记录
exports.priceHost = function (req, res) {
  var page = req.query.page ? Number.parseInt(req.query.page) : 1;
  var limits = 15;
  serverP.count({}, function (err, total) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '服务器续费记录总条数查询失败' });
    }
    serverP.find({}).skip((page - 1) * limits).limit(limits).populate('serverId').exec(function (err, findData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '服务器续费记录查询失败' });
      }
      return res.render('priceHost', {
        title: '财务管理',
        session: req.session.username,
        serverDocs: findData,
        isFirstPage: page - 1 == 0,
        isLastPage: (page - 1) * limits + Number.parseInt(findData.length) == total,
        page: page
      });
    });
  });
};

//# sourceMappingURL=skillfully-compiled.js.map