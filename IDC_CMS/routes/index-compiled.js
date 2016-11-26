'use strict';

var getIndex = require('../collection/getIndex'); //网站首页逻辑
var userLogin = require('../collection/userLogin'); //用户登录逻辑
var validateLogin = require('../collection/islogin'); //用户权限控制
var engine = require('../collection/engine'); //机房管理
var use = require('../collection/use'); //用途管理
var cabinets = require('../collection/cabinets'); //机柜管理
var ip = require('../collection/ip'); //ip地址池管理
var server = require('../collection/server'); //服务器管理
var user = require('../collection/users'); //用户管理
var skillfully = require('../collection/skillfully'); //财务管理
//idc_cms 路由文件
module.exports = function (app) {
  //网站首页路由
  app.get('/', validateLogin.noLogin, getIndex.index);
  //用户登陆页面路由
  app.get('/login', validateLogin.Login, userLogin.login);
  app.post('/login', validateLogin.Login, userLogin.postLogin);
  //用户注册页面路由
  app.get('/reg', validateLogin.Login, userLogin.reg);
  app.post('/reg', userLogin.register);
  //用户退出路由
  app.get('/logout', userLogin.logout);

  //----------------------------------管理系统开始

  //机房管理Get路由以及post处理逻辑
  app.get('/engine', validateLogin.noLogin, engine.getEngine);
  app.post('/engine', engine.postEngine);
  app.get('/engine/delete', engine.deleteEngine);

  //用途管理路由以及处理逻辑
  app.get('/use', validateLogin.noLogin, use.getUse);
  app.post('/use', use.postUse);
  app.get('/use/delete', use.deleteUse);

  //机柜添加路由以及逻辑处理路由
  app.get('/cabinets', validateLogin.noLogin, validateLogin.youAdmin, cabinets.getCabinets);
  app.post('/cabinets', cabinets.postCabinets);
  app.get('/cabinets/delete', validateLogin.youAdmin, cabinets.deleteCabinets);
  app.post('/cabinets/update', cabinets.updateCab);

  //ip地址添加路由以及ip地址post处理逻辑;
  app.get('/ip', validateLogin.noLogin, validateLogin.youAdmin, ip.getIp);
  app.post('/ip', ip.postIp);
  app.post('/ip/update', ip.updateIp);
  app.get('/ip/delete', validateLogin.youAdmin, ip.deleteIp);
  //具体莫ip段的ip
  app.get('/pid', ip.pId);
  //查询ip地址
  app.post('/pid/newId', ip.newId);
  app.post('/update/ip', ip.UpdateId);

  //服务器server管理
  app.get('/server', server.getServer);
  app.post('/server', server.createServer);
  app.get('/server/:id', server.getOne);
  app.get('/select', server.getIps);
  app.get('/selectIp', server.getIP);
  //删除某服务器信息
  app.get('/servers/delete', server.deleteId);
  //表单更新获取数据
  app.post('/server/getUpdate', server.updateInfo);
  //更新数据
  app.post('/server/updateForm', server.updateServer);
  app.post('/server/searchId', server.searchS);
  app.post('/server/searchIp', server.searchI);
  app.post('/server/cab', server.searchCab);
  //用户管理
  app.get('/createUser', validateLogin.noLogin, user.getUser);
  app.post('/users/createServerUser', user.createServerUser);
  app.post('/users/createUser', user.createUser);
  app.post('/users/updateUser', user.updateUser);
  app.post('/users/up', user.Ups);
  app.post('/users/searchStrIp', user.searchStrIp);
  app.post('/users/searchIds', user.searchStrId);
  app.post('/users/oneUsers', user.searchOneUser);

  //财务管理
  app.get('/skillfully', validateLogin.noLogin, validateLogin.youPrics, skillfully.getSkillfully);
  app.post('/server/serverDowns', skillfully.serverDown);

  //5天到期的服务器查询
  app.get('/5day', validateLogin.noLogin, validateLogin.youPrics, skillfully.thereDay);
  //7天到期的服务器查询
  app.get('/7day', validateLogin.noLogin, validateLogin.youPrics, skillfully.serveDay);
  //15天到期的服务器查询
  app.get('/15day', validateLogin.noLogin, validateLogin.youPrics, skillfully.twoFDay);
  //已过期服务器查询
  app.get('/serverTime', validateLogin.noLogin, validateLogin.youPrics, skillfully.getTimes);
  //服务器续费
  app.get('/serverPics', validateLogin.noLogin, validateLogin.youPrics, skillfully.serverPics);
  app.post('/server/serverPrice', skillfully.serverPrice);
  //服务器续费历史记录
  app.get('/priceHost', validateLogin.noLogin, skillfully.priceHost);
};

//# sourceMappingURL=index-compiled.js.map