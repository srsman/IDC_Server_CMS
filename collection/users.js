//引入mongoose对象以及依赖的其他模型
const Ip = require('../modules/ip');
const Uip = require('../modules/uip');
const Engine = require('../modules/engineRoom');
const Use = require('../modules/use');
const Server = require('../modules/server');
const Cabinets = require('../modules/cabinet');
const Host = require('../modules/serverHost');
const User = require('../modules/user');
const mongoose = require('mongoose');
//---------------user用户管理get路由
exports.getUser = (req,res) => {
  //
  let page = req.query.page ? Number.parseInt(req.query.page) : 1;
  let limits = 15;
  Server.find({'serverMark':false},{'_id':1,'serverId':1},(err,serverDocs) =>{
    if(err){
      return res.json({'postStatus':'error','msg':'服务器查询出错'})
    }
    User.count({'user.search':true},(err,total) => {
      if(err){
        return res.json({'postStatus':'error','msg':'总页数查询失败'});
      }
      User.find({'user.createUser':true},{'user.webName':1},(err,thisUser) => {
        if(err){
          return res.json({'postStatus':'error','msg':'无用户'});
        }
        User.find({'user.search':true}).skip((page - 1)*limits).limit(limits).populate('user.serverTo').sort({'_id':-1}).exec((err,usersDocs) => {
          if(err){
            return res.json({'postStatus':'error','msg':'用户查询出错'})
          }
          return res.render('user',{
            title:'用户管理',
            session : req.session.username,
            serverData: serverDocs,
            usersData: usersDocs,
            isFirstPage: (page - 1) == 0,
            isLastPage: (page -1)*limits + Number.parseInt(usersDocs.length) == total,
            page: page,
            thisDocs: thisUser,
            maxPage : Math.floor((total + limits -1) / limits),
          });
        });
      });
    });
  });
};

//----------------查找某用户
exports.searchOneUser = (req,res) => {
  let username = req.body.usernameS;
  if(username == '' || username == undefined){
    return res.json({'postStatus':'error','msg':'无法识别,用户名不能为空'})
  };
  User.find({'user.createUser':true,'user.webName':new RegExp(username)},{'user.webName':1},(err,thisUser) => {
    if(err){
      return res.json({'postStatus':'error','msg':'无用户'});
    }
    return res.json({'postStatus':'success','msg':thisUser});
  });
};
//---------------写入用户
exports.createServerUser = (req,res) => {
  //获取表单数据
  let webName = req.body.webName.trim();
  let username = req.body.username;
  let userCarded = req.body.userCarded;
  let userPhoneNumber = req.body.userPhoneNumber;
  let userQQ = req.body.userQQ;
  let userAddress = req.body.userAddress;
  if(webName == '' || webName == null){
    return res.json({'postStatus':'error','msg':'用户名称不能为空'})
  }
  User.create({
    'user.webName':webName,
    'user.username':username,
    'user.userCarded':userCarded,
    'user.userPhoneNumber':userPhoneNumber,
    'user.userQQ':userQQ,
    'user.userAddress':userAddress,
    'user.createUser':true,
  },(err,createServerUser) => {
    if(err){
      return res.json({'postStatus':'error','msg':'用户新增出错'})
    }
    return res.json({'postStatus':'success','msg':'用户添加完成'});
  });
};
//写入新数据
exports.createUser = (req,res) => {
  //获取表单数据
  let ThisUsers = req.body.ThisUsers;
  let userPayment = req.body.userPayment;
  let userTo = req.body.userTo;
  let serverTo = req.body.serverTo ? req.body.serverTo : '';
  let isPayment = req.body.isPayment;
  let time = new Date();
  let endTime = req.body.endTime;
  let webName = null;
  let username = null;
  let userCarded = null;
  let userPhoneNumber = null;
  let userQQ = null;
  let userAddress = null;
  //获取用户信息
  User.findOne({'user.webName':ThisUsers},{'user':1},(err,dataS) => {
      if(err){
        return res.json({'postStatus':'error','msg':'用户信息查询失败'});
      }else{
        webName = dataS.user.webName;
        username = dataS.user.username;
        userCarded = dataS.user.userCarded;
        userPhoneNumber = dataS.user.userPhoneNumber;
        userQQ = dataS.user.userQQ;
        userAddress = dataS.user.userAddress;
        createUser = dataS.user.createUser;
        //更新当前服务器数据
        User.create({
          'user.webName':webName,
          'user.username':username,
          'user.userCarded':userCarded,
          'user.userPhoneNumber':userPhoneNumber,
          'user.userQQ':userQQ,
          'user.userAddress':userAddress,
          'user.userPayment':userPayment,
          'user.userTo':userTo,
          'user.serverTo':serverTo,
          'user.isPayment':isPayment,
          'user.search':true,
        },(err,createData) => {
          if(err){
            return res.json({'postStatus':'error','msg':'用户新增出错'})
          }
          //更新服务器信息
          Server.update({'_id':serverTo},{'serverMark':true,'startTime':time,'endTime':endTime},(err,updateInfo) => {
            if(err){
              return res.json({'postStatus':'error','msg':'服务器更新出错'})
            }
            Server.findById({'_id':serverTo},{'ip':1},(err,dataIp) => {
              if(err){
                return res.json({'postStatus':'error','msg':'服务器查询IP出错'})
              };
              User.update({'_id':createData._id},{'user.uip':dataIp.ip},(err,updateIps) => {
                if(err){
                  return res.json({'postStatus':'error','msg':'用户写入IP出错'})
                }
                return res.json({'postStatus':'success','msg':'用户新增完成'})
              });
            });
          });
        });
      };
  });
};

//------------------------用户信息更新
exports.updateUser = (req,res) => {
  let id = req.body.id;
  //查询信息
  User.findById({'_id':id},{'user':1},(err,dataInfo) => {
    if(err){
      return res.json({'postStatus':'error','msg':'用户信息查询出错'})
    }
    return res.json({'postStatus':'success','msg':dataInfo})
  });
};
//-------------------------------更新某数据
exports.Ups = (req,res) => {
  let username = req.body.name;
  let userCarded = req.body.Carded;
  let userPhoneNumber = req.body.PhoneNumber;
  let userQQ = req.body.QQ;
  let userAddress = req.body.Address;
  let userPayment = req.body.Payment;
  let userTo = req.body.uTo;
  let serverTo = req.body.sTo;
  let isPayment = req.body.Ament;
  let id = req.body.id;
  let serTo = req.body.serTo;
  //判断当前值
  if(serverTo == '1'){
    //更新删除服务器
    User.update({'_id':id},{
      'user.username':username,
      'user.userCarded':userCarded,
      'user.userPhoneNumber':userPhoneNumber,
      'user.userQQ':userQQ,
      'user.userAddress':userAddress,
      'user.userPayment':userPayment,
      'user.userTo':userTo,
      'user.serverTo':null,
      'user.isPayment':isPayment,
      'user.uip':[]
    },(err,updateData) => {
      if(err){
        return res.json({'postStatus':'error','msg':'用户信息更新出错'})
      }
      if(serTo !== ''){
        Server.update({'_id':serTo},{'serverMark':false},(err,updateInfo) => {
          if(err){
            return res.json({'postStatus':'error','msg':'用户关联服务器信息更新出错'})
          }
          return res.json({'postStatus':'success','msg':'用户信息更新完成'})
        });
      }else{
        return res.json({'postStatus':'success','msg':'用户信息更新完成'})
      }
    })
  }else{
    User.update({'_id':id},{
      'user.username':username,
      'user.userCarded':userCarded,
      'user.userPhoneNumber':userPhoneNumber,
      'user.userQQ':userQQ,
      'user.userAddress':userAddress,
      'user.userPayment':userPayment,
      'user.userTo':userTo,
      'user.serverTo':serverTo,
      'user.isPayment':isPayment,
      'user.uip':null
    },(err,updateData) => {
      if(err){
        return res.json({'postStatus':'error','msg':'用户信息更新出错'})
      }
      if(serTo !== ''){
        Server.update({'_id':serTo},{'serverMark':false},(err,updateInfo) => {
          if(err){
            return res.json({'postStatus':'error','msg':'用户关联服务器信息出错,请刷新'})
          }
          Server.update({'_id':serverTo},{'serverMark':true},(err,updateInfo) => {
            if(err){
              return res.json({'postStatus':'error','msg':'用户关联服务器信息出错,请刷新'})
            }
            Server.findById({'_id':serverTo},{'ip':1},(err,findIps) => {
              if(err){
                return res.json({'postStatus':'error','msg':'用户查询IP信息出错,请刷新'})
              }
              User.update({'_id':id},{'user.uip':findIps.ip},(err,updateIis) => {
               if(err){
                 return res.json({'postStatus':'error','msg':'用户更新信息出错,请刷新'})
               }
                return res.json({'postStatus':'success','msg':'用户信息更新完成'})
              });
            });
          });
        });
      }else{
        Server.update({'_id':serverTo},{'serverMark':true},(err,updateInfo) => {
          if(err){
            return res.json({'postStatus':'error','msg':'用户关联服务器信息出错,请刷新'})
          }
          //console.log('No Update');
          Server.findById({'_id':serverTo},{'ip':1},(err,dataIpeS) => {
            if(err){
              return res.json({'postStatus':'error','msg':'用户关联IP地址出错,请刷新'})
            }
            User.update({'_id':id},{'user.uip':dataIpeS.ip},(err,updateIis) => {
              if(err){
                return res.json({'postStatus':'error','msg':'用户更新信息出错,请刷新'})
              }
              return res.json({'postStatus':'success','msg':'用户信息更新完成'})
            });
          });
        });
      }
    });
  }
};

//------------------------------查询IP地址
exports.searchStrIp = (req,res) => {
  //获取表单数据
  let ip = req.body.str;
  if(ip.length <= 0){
    return res.json({'postStatus':'error','msg':'IP地址不能为空'})
  }
  if(ip.includes(',')){
    //true转换成数组
    ip = ip.split(',');
  }else{
    //false 判断是否为字符串
    if(typeof ip == 'string'){
      ip = [ip]
    }
  }
  //准备查询内容
  User
    .findOne({'user.search':true,'user.uip':{'$in':ip}})
    .populate({
      path:'user.serverTo',
      match:{'ip':{'$in':ip}}
    })
    .exec((err,searchData) => {
        if(err){
          return res.json({'postStatus':'error','msg':'IP地址查询出错'});
        }
        return res.json({'postStatus':'success','msg':searchData});
    });
};

//-------------------------------------查询用户编号
exports.searchStrId = (req,res) => {
  //获取表单数据
  let id = req.body.str;
  if(id.length <= 0){
    return res.json({'postStatus':'error','msg':'用户平台名称不能为空'})
  }
  id = id.trim();
  User
    .find({'user.search':true,'user.webName':id})
    .populate({
      path:'user.serverTo'
    })
    .exec((err,searchData) => {
      if(err){
        return res.json({'postStatus':'error','msg':'ID用户查询出错'});
      }
      return res.json({'postStatus':'success','msg':searchData});
    });
};