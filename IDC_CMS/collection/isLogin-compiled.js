'use strict';

//连接数据库
var user = require('../modules/user');
//用户已登陆状态
exports.Login = function (req, res, next) {
  //判断session 是否存在
  if (req.session.username) {
    return res.redirect('/');
  };
  next();
};
//用户未登陆状态
exports.noLogin = function (req, res, next) {
  //判断session是否存在
  if (!req.session.username) {
    return res.redirect('/login');
  };
  next();
};
//ADMIN权限控制
exports.youAdmin = function (req, res, next) {
  var username = req.session.username;
  user.findOne({ 'admin.username': username }, { 'admin.validateNumber': 1, '_id': 1 }, function (err, validateDocs) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '无法查询此管理员' });
    } else {
      if (validateDocs.admin.validateNumber >= 2) {
        next();
      } else {
        return false;
      }
    }
  });
};
//财务权限控制
exports.youPrics = function (req, res, next) {
  var username = req.session.username;
  user.findOne({ 'admin.username': username }, { 'admin.validateNumber': 1, '_id': 1 }, function (err, validateDocs) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '无法查询此管理员' });
    } else {
      if (validateDocs.admin.validateNumber > 1) {
        next();
      } else {
        return false;
      }
    }
  });
};

//# sourceMappingURL=isLogin-compiled.js.map