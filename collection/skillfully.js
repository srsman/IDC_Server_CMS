//引入mongoose对象以及依赖的其他模型
const Ip = require('../modules/ip');
const Uip = require('../modules/uip');
const Engine = require('../modules/engineRoom');
const Use = require('../modules/use');
const Server = require('../modules/server');
const Cabinets = require('../modules/cabinet');
const Host = require('../modules/serverHost');
const User = require('../modules/user');
const serverP = require('../modules/serverPrice');
const mongoose = require('mongoose');
//------------------财务管理get路由
exports.getSkillfully = (req,res) => {
  let page = req.query.page ? Number.parseInt(req.query.page) : 1;
  let limits = 15;
  let queryS = {'serverMark':true};
  let toIndex = 'skillfully';
  getIndexS(page,limits,req,res,queryS,toIndex);
};
//服务器下架处理逻辑
exports.serverDown = (req,res) => {
  //获取表单信息
  let id = req.body.id;
  let time = new Date();
  Server.update({'_id':id},{'formSaleTime':time,'serverMark':false},(err) => {
    if(err){
      return res.json({'postStatus':'error','msg':'服务器下架出错请稍候再试'});
    }
    Host.create({
      'server.server':mongoose.Types.ObjectId(id),
      'server.serverName':req.session.username,
      'server.serverTime':new Date(),
      'server.serverInfoS':'服务器下架'
    },(err,createData) => {
      if(err){
        return res.json({'postStatus':'error','msg':'服务器维护记录写入出错请稍候再试'});
      }
      return res.json({'postStatus':'success','msg':'服务器下架完成'});
    });
  });
};


//-----------------------------即将5天到期的服务器
exports.thereDay = (req,res) => {
  let page = req.query.page ? Number.parseInt(req.query.page) : 1;
  let limits = 15;
  let toIndex = '5day';
  let timeData = new Date();
  let getYear = timeData.getFullYear();
  let getMonth = timeData.getMonth()+1;
  let getDates = timeData.toString(timeData.setDate(timeData.getDate()+5));
  if(getDates < 10){
    getDates = '0'+getDates
  }
  let queryS = {'serverMark':true,endTime:{'$lte':getDates}};
  getIndexS(page,limits,req,res,queryS,toIndex)
};

//-----------------------------即将7天到期的服务器
exports.serveDay = (req,res) => {
  let page = req.query.page ? Number.parseInt(req.query.page) : 1;
  let limits = 15;
  let toIndex = '7day';
  let timeData = new Date();
  let getYear = timeData.getFullYear();
  let getMonth = timeData.getMonth()+1;
  let getDates = timeData.toString(timeData.setDate(timeData.getDate()+7));
  if(getDates < 10){
    getDates = '0'+getDates
  }
  let queryS = {'serverMark':true,endTime:{'$lte':getDates}};
  getIndexS(page,limits,req,res,queryS,toIndex)
};

//-----------------------------即将15天到期的服务器
exports.twoFDay = (req,res) => {
  let page = req.query.page ? Number.parseInt(req.query.page) : 1;
  let limits = 15;
  let toIndex = '15day';
  let timeData = new Date();
  let getYear = timeData.getFullYear();
  let getMonth = timeData.getMonth()+1;
  let getDates = timeData.toString(timeData.setDate(timeData.getDate()+15));
  if(getDates < 10){
    getDates = '0'+getDates
  }
  let queryS = {'serverMark':true,endTime:{'$lte':getDates}};
  getIndexS(page,limits,req,res,queryS,toIndex)
};
//----------------------------已过期服务器查询
exports.getTimes = (req,res) => {
  let page = req.query.page ? Number.parseInt(req.query.page) : 1;
  let limits = 15;
  let toIndex = 'serverTime';
  let timeData = new Date();
  console.log(timeData);
  let queryS = {'serverMark':true,endTime:{'$lt':timeData}};
  getIndexS(page,limits,req,res,queryS,toIndex)
};
//-----------------------------服务器续费Get路由
exports.serverPics = (req,res) => {
  let page = req.query.page ? Number.parseInt(req.query.page) : 1;
  let limits = 15;
  Server.count({'serverMark':true},(err,total) => {
    if(err){
      return res.json({'postStatus':'error','msg':'无法查询服务器总条数'})
    }
    Server.find({'serverMark':true},null,{'skip':(page - 1)* limits,'limit':limits},(err,findData) => {
      if(err){
        return res.json({'postStatus':'error','msg':'服务器查询出错，当前未有启用服务器'})
      }
      return res.render('serverPics',{
        title:'财务管理',
        session:req.session.username,
        serverDocs: findData,
        isFirstPage: (page - 1) == 0,
        isLastPage: (page -1)*limits + Number.parseInt(findData.length) == total,
        page: page,
        maxPage : Math.floor((total + limits -1) / limits),
      });
    });
  });
};
//---------------------------服务器续费post路由
exports.serverPrice = (req,res) => {
  let id = req.body.id;
  let serverPrice = req.body.serverPrice;
  let endTime = req.body.endTime;
  let serverPriceInfo = req.body.serverPriceInfo;
  let username = req.session.username;
  let time = new Date();
  Server.update({'_id':id},{'renew.renewTime':time,'renew.renewPrice':serverPrice,'endTime':endTime,'price':serverPrice},(err) => {
    if(err){
      return res.json({'postStatus':'error','msg':'服务器更新数据失败'})
    }
    User.findOne({'user.serverTo':mongoose.Types.ObjectId(id)},{'user.webName':1},(err,userId) => {
      if(err){
        return res.json({'postStatus':'error','msg':'原用户查询失败,请稍后再试'});
      }
      //插入新的数据
      serverP.create({
        'serverId': id,
        'username':username,
        'priceTime': time,
        'price': serverPrice,
        'priceInfo':serverPriceInfo,
        'endTime':endTime,
        'serverY':userId.user.webName
      },(err,createData) => {
        if(err){
          return res.json({'postStatus':'error','msg':'服务器续费记录插入失败'})
        }
        return res.json({'postStatus':'success','msg':'服务器续费完成'})
      });
    });
  });
};
//---------通用function
function getIndexS(page,limits,req,res,queryS,toIndex){
  Server.count(queryS,(err,total) => {
    if(err){
      return res.json({'postStatus':'error','msg':'无法查询服务器总条数'})
    }
    Server.find(queryS,null,{'skip':(page - 1)* limits,'limit':limits,'sort':{'endTime':1}},(err,findData) => {
      if(err){
        return res.json({'postStatus':'error','msg':'服务器查询出错，当前未有启用服务器'})
      }
      return res.render(toIndex,{
        title:'财务管理',
        session:req.session.username,
        serverDocs: findData,
        isFirstPage: (page - 1) == 0,
        isLastPage: (page -1)*limits + Number.parseInt(findData.length) == total,
        page: page,
        maxPage : Math.floor((total + limits -1) / limits),
      });
    });
  });
};

//-----------------------------服务器续费记录
exports.priceHost = (req,res) => {
  let page = req.query.page ? Number.parseInt(req.query.page) : 1;
  let limits = 15;
  serverP.count({},(err,total) => {
    if(err){
      return res.json({'postStatus':'error','msg':'服务器续费记录总条数查询失败'})
    }
    serverP
        .find({})
        .skip((page-1)*limits)
        .limit(limits)
        .populate('serverId')
        .exec((err,findData) => {
          if(err){
            return res.json({'postStatus':'error','msg':'服务器续费记录查询失败'})
          }
          return res.render('priceHost',{
            title:'财务管理',
            session:req.session.username,
            serverDocs: findData,
            isFirstPage: (page - 1) == 0,
            isLastPage: (page -1)*limits + Number.parseInt(findData.length) == total,
            page: page,
            maxPage : Math.floor((total + limits -1) / limits),
          });
        });
  });
};

