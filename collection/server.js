//引入mongoose对象以及依赖的其他模型
const Ip = require('../modules/ip');
const Uip = require('../modules/uip');
const Engine = require('../modules/engineRoom');
const Use = require('../modules/use');
const Server = require('../modules/server');
const Cabinets = require('../modules/cabinet');
const Host = require('../modules/serverHost');
const mongoose = require('mongoose');
//---------------server服务器管理get路由
exports.getServer = (req,res) => {
  let page = req.query.page ? Number.parseInt(req.query.page) : 1;
  let limits = 15;
  Engine.find({},null,(err,serverEngine) => {
    if(err){
      return res.json({'postStatus':'error','msg':'服务器机房查询失败'})
    }
    Use.find({},null,(err,serverUse) => {
      if(err){
        return res.json({'postStatus':'error','msg':'服务器用途查询失败'})
      }
      Cabinets.find({},null,(err,cabData) => {
        if(err){
          return res.json({'postStatus':'error','msg':'服务器所属机柜查询失败'})
        }
        //首页分页路由
        Server.count({},(err,total) => {
            if(err){
                return res.json({'postStatus':'error','msg':'返回服务器总条数失败'});
            }
            Server.find({},null,{'skip':(page - 1)*limits,'limit':limits},(err,serverInfo) => {
              if(err){
                return res.json({'postStatus':'error','msg':'服务器信息查询失败'})
              }
              return res.render('server',{
                title: '服务器管理',
                session: req.session.username,
                engineDocs: serverEngine,
                useDocs: serverUse,
                serverData: serverInfo,
                cabDocs:cabData,
                isFirstPage: (page - 1) == 0,
                isLastPage: (page -1)*limits + Number.parseInt(serverInfo.length) == total,
                page: page
              });
            });
        });
      });
    });
  });
};

//------------------server添加一条服务器信息
exports.createServer = (req,res) => {
  //获取表单数据
  let serverId = req.body.serverId;
  let serverCab = req.body.serverCab;
  let price = req.body.price;
  let serverCpu = req.body.serverCpu;
  let board = req.body.board;
  let memories = req.body.memories;
  let nic = req.body.nic;
  let bandwidth = req.body.bandwidth;
  let serverRoom = req.body.serverRoom;
  let serverIpAddress = req.body.serverIpAddress;
  let serverUse = req.body.serverUse;
  let ipArray = req.body.serverIP;
  let shelvesTime = req.body.shelvesTime;
  let serverInfo = req.body.serverInfo;
  let serverUrl = req.body.serverUrl;
  let serverUser = req.body.serverUser;
  let serverPass = req.body.serverPass;
  let yd = req.body.yd;
  if(serverId == '' || serverId == null){
    return res.json({'postStatus':'error','msg':'服务器编号不能为空'})
  }
  //查询此服务器编号是否以写入
  Server.findOne({'serverId':serverId},null,(err,newId) => {
    if(err){
      return res.json({'postStatus':'error','msg':'查询服务器出错，请稍后再试'});
    }
    //判断此id是否存在
    if(newId){
      return res.json({'postStatus':'error','msg':'当前服务器'+serverId+'已录入'});
    };
    if(serverRoom == ''){
      //准备写入到数据库
      Server.create({
        'serverId':serverId,
        'serverCab':mongoose.Types.ObjectId(serverCab),
        'cpu': serverCpu,
        'board': board,
        'memories':memories,
        'nic':nic,
        'bandwidth':bandwidth,
        'ip':ipArray,
        'price':price,
        'shelvesTime':shelvesTime,
        'serverInfo':serverInfo,
        'serverAdmin.serverUrl':serverUrl,
        'serverAdmin.serverUser':serverUser,
        'serverAdmin.serverPass':serverPass,
        'yd':yd
      },(err,createData) => {
        if(err){
          return res.json({'postStatus':'error','msg':'服务器添加失败'})
        }
        //更新ip表信息
        Uip.update({'ip':{'$in':ipArray}},{'ipMark':true,'server':serverId},{multi:true},(err,data) => {
          if(err){
            return res.json({'postStatus':'error','msg':'服务器添加完成,ip信息更新失败'})
          }
          return res.json({'postStatus':'success','msg':'服务器添加完成'})
        });
      });
    }else{
      //准备写入到数据库
      Server.create({
        'serverId':serverId,
        'serverCab':mongoose.Types.ObjectId(serverCab),
        'cpu': serverCpu,
        'board': board,
        'memories':memories,
        'nic':nic,
        'bandwidth':bandwidth,
        'ip':ipArray,
        'price':price,
        'shelvesTime':shelvesTime,
        'serverInfo':serverInfo,
        'serverRoom':mongoose.Types.ObjectId(serverRoom),
        'serverIp':mongoose.Types.ObjectId(serverIpAddress),
        'serverUse':mongoose.Types.ObjectId(serverUse),
        'serverAdmin.serverUrl':serverUrl,
        'serverAdmin.serverUser':serverUser,
        'serverAdmin.serverPass':serverPass,
        'yd':yd
      },(err,createData) => {
        if(err){
          return res.json({'postStatus':'error','msg':'服务器添加失败'})
        }
        //更新ip表信息
        Uip.update({'ip':{'$in':ipArray}},{'ipMark':true,'server':serverId},{multi:true},(err,data) => {
          if(err){
            return res.json({'postStatus':'error','msg':'服务器添加完成,ip信息更新失败'})
          }
          return res.json({'postStatus':'success','msg':'服务器添加完成'})
        });
      });
    }

  });
};

//------------------server某条信息
exports.getOne = (req,res) => {
  let id = req.params.id;
  if(id == '' || id == null){
    return res.json({'postStatus':'error','msg':'id值不能为空'})
  };
  Server
    .findOne({'serverId':id})
    .populate('serverRoom')
    .populate('serverIp')
    .populate('serverUse')
    .populate('serverCab')
    .exec((err,serverOne) => {
      if(err){
        return res.json({'postStatus':'error','msg':'此服务器查询出错请稍候再试'})
      }
      Host.find({'server.server':serverOne._id},null,(err,hostData) => {
          if(err){
              return res.json({'postStatus':'error','msg':'此服务器历史记录查询出错请稍候再试'})
          }
          return res.render('serverOne',{
              title:'服务器信息',
              session: req.session.username,
              serverDocs: serverOne,
              hostDocs: hostData
          })
      });
    });
};

//------------------server服务器某数据删除
exports.deleteId = (req,res) => {
  //获取表单提交数据
  let id = req.query.id;
  Server.findById({'_id':id},(err,data) => {
    if(err){
      return res.json({'postStatus':'error','msg':'服务器删除失败'});
    }
	//console.log(data.ip);
    //准备更新IP地址数据
    Uip.update({'ip':{'$in':data.ip}},{'ipMark':false,'server':''},{multi:true},(err,updateDatas) => {
      if(err){
        return res.json({'postStatus':'error','msg':'IP地址更新失败'});
      }
      //删除信息
      Server.remove({'_id':id},(err) => {
        if(err){
          return res.json({'postStatus':'error','msg':'服务器删除失败'})
        }
        return res.redirect('back');
      });
    });
  });
};
//------------------server联动查询ip段
exports.getIps = (req,res) => {
  //获取字段id
  let id = req.query.id;
  if(id == '' || id == null){
    return console.log('机房不能为空字段');
  };
  let queryId = mongoose.Types.ObjectId(id);
  Ip.find({'ipRoom':queryId},null,(err,ipsData) => {
    if(err){
      return res.json({'postStatus':'error','msg':'ip段查询出错'});
    }
    return res.json({'postStatus':'success','msg':ipsData});
  })
};
//-----------------server联动查询获取ip地址
exports.getIP = (req,res) => {
  //获取表单数据
//let uip = req.query['big_id'];
  let useId = req.query.use;
  if(useId == ''){
    return console.log('请选择ip地址段以及ip地址用途,在进行操作');
  };
//let ips = mongoose.Types.ObjectId(uip);
  let use = mongoose.Types.ObjectId(useId);
  //查询ip表数据库
  Uip.find({'ipUse':use,'ipMark':'false','ipDisplay':'true'},null,(err,ipData) => {
    if(err){
      return res.json({'postStatus':'error','msg':'ip地址查询出错'});
    }
    return res.json({'postStatus':'success','msg':ipData});
  });
};

//更新数据获取表单信息
exports.updateInfo = (req,res) => {
  //获取表单数据
  let id = req.body.id;
  //准备查询id
  if(id == '' || id == null){
    return false;
  };
  Server.findById({'_id':id},(err,updateInfo) => {
    if(err){
      return res.json({'postStatus':'error','msg':'更新数据失败,无法更新'});
    }
    //返回sql结果
    return res.json({'postStatus':'success','msg':updateInfo});
  });
};

//----------------------更新server服务器
exports.updateServer = (req,res) => {
  //获取表单数据
  let myId = req.body.myId;
  let serverCab = req.body.updateCab;
  let cpu = req.body.updateCpu;
  let board = req.body.updateBoard;
  let memories = req.body.updateMemories;
  let yd = req.body.updateYd;
  let nic = req.body.updateNic;
  let bandwidth = req.body.updateBandwidth;
  let serverRoom = req.body.updateRoom;
  let serverIpAddress = req.body.updateIpAddress;
  let serverUse = req.body.updateUse;
  let serverIP = req.body.updateIP;
  let serverUrl = req.body.updateUrl;
  let serverUser = req.body.updateUser;
  let serverPass = req.body.updatePass;
  let serverInfo = req.body.updateInfo;
  let hostInfo = req.body.hostInfo;
  let time = new Date();
  let hostUser = req.session.username;
  let uid = null;
  let ip = null;
  let cId = req.body.cId;
  if(req.body.uid == null){
    uid = [];
  }else{
    uid = req.body.uid;
    ip = uid.split(',');
  }
  let updateMark = req.body.updateMark;
  //判断当前状态
  if(updateMark == 1){
    //更新数据不更新IP
    Server.update({'_id':myId},
        {
          'serverCab':mongoose.Types.ObjectId(serverCab),
          'cpu': cpu,
          'board': board,
          'memories':memories,
          'nic':nic,
          'bandwidth':bandwidth,
          'serverInfo':serverInfo,
          'serverAdmin.serverUrl':serverUrl,
          'serverAdmin.serverUser':serverUser,
          'serverAdmin.serverPass':serverUser,
          'yd':yd
        },(err,updateData) => {
          if(err){
            return res.json({'postStatus':'error','msg':'更新服务器失败'})
          }
            Host.create({
                'server.serverName':hostUser,
                'server.serverTime':time,
                'server.serverInfoS':hostInfo,
                'server.server':mongoose.Types.ObjectId(myId)
            },(err,createData) => {
                if(err){
                    return res.json({'postStatus':'error','msg':'插入历史记录表失败'})
                }
                return res.json({'postStatus':'success','msg':'更新服务器成功'})
            });
        });
  }else if(updateMark == 2){
        let thisIp = req.body.thisIp;
        if((typeof thisIp) == 'string'){
            thisIp = [thisIp]
        };
        let a= new Set(thisIp);  //转化成set函数
        let b = new Set(ip);
        let differenceABSet = new Set([...b].filter(x => !a.has(x)));  //去ip字段跟当前选中字段的差集
        let arr = Array.from(differenceABSet);
        //更新当前数据
        Uip.update({'ip':{'$in':arr}},{'ipMark':false,'server':''},{multi:true},(err,ipMarkData) =>{
          if(err){
            return res.json({'postStatus':'error','msg':'更新IP地址失败'})
          }
          //准备更新server
          Server.update({'_id':myId},
            {
              'serverCab':mongoose.Types.ObjectId(serverCab),
              'cpu': cpu,
              'board': board,
              'memories':memories,
              'nic':nic,
              'bandwidth':bandwidth,
              'serverInfo':serverInfo,
              'ip': thisIp,
              'serverAdmin.serverUrl':serverUrl,
              'serverAdmin.serverUser':serverUser,
              'serverAdmin.serverPass':serverUser,
              'yd':yd
            },(err,updateData) => {
              if(err){
                return res.json({'postStatus':'error','msg':'更新服务器失败'})
              }
              Host.create({
                  'server.serverName':hostUser,
                  'server.serverTime':time,
                  'server.serverInfoS':hostInfo,
                  'server.server':mongoose.Types.ObjectId(myId)
              },(err,createData) => {
                  if(err){
                      return res.json({'postStatus':'error','msg':'插入历史记录表失败'})
                  }
                  return res.json({'postStatus':'success','msg':'更新服务器成功'})
              });
            });
        });
  }else if(updateMark == 3){
        //更新ip地址
        Uip.update({'ip':{'$in':ip}},{'ipMark':false,'server':''},{multi:true},(err,ipMarkData) =>{
          if(err){
            return res.json({'postStatus':'error','msg':'更新IP地址失败'})
          }
          //准备更新server
          Server.update({'_id':myId},
            {
              'serverCab':mongoose.Types.ObjectId(serverCab),
              'cpu': cpu,
              'board': board,
              'memories':memories,
              'nic':nic,
              'bandwidth':bandwidth,
              'serverInfo':serverInfo,
              'ip': serverIP,
              'serverRoom':mongoose.Types.ObjectId(serverRoom),
              'serverIp':mongoose.Types.ObjectId(serverIpAddress),
              'serverUse':mongoose.Types.ObjectId(serverUse),
              'serverAdmin.serverUrl':serverUrl,
              'serverAdmin.serverUser':serverUser,
              'serverAdmin.serverPass':serverUser,
              'yd':yd
            },(err,updateData) => {
              if(err){
                return res.json({'postStatus':'error','msg':'更新服务器失败'})
              }
              Uip.update({'ip':{'$in':serverIP}},{'ipMark':true,'server':cId},{multi:true},(err,ipMarkData) =>{
                if(err){
                  return res.json({'postStatus':'error','msg':'更新Ip关联失败'})
                }
                  Host.create({
                      'server.serverName':hostUser,
                      'server.serverTime':time,
                      'server.serverInfoS':hostInfo,
                      'server.server':mongoose.Types.ObjectId(myId)
                  },(err,createData) => {
                      if(err){
                          return res.json({'postStatus':'error','msg':'插入历史记录表失败'})
                      }
                      return res.json({'postStatus':'success','msg':'更新服务器成功'})
                  });
              });
            });
        });
  }else if(updateMark == 4){
        //清楚ip地址
        Uip.update({'ip':{'$in':ip}},{'ipMark':false,'server':''},{multi:true},(err,ipMarkData) => {
          if (err) {
            return res.json({'postStatus': 'error', 'msg': '更新IP地址失败'})
          }
          //准备更新server
          Server.update({'_id': myId},
              {
                'serverCab': mongoose.Types.ObjectId(serverCab),
                'cpu': cpu,
                'board': board,
                'memories': memories,
                'nic': nic,
                'bandwidth': bandwidth,
                'serverInfo': serverInfo,
                'ip': [],
                'serverAdmin.serverUrl': serverUrl,
                'serverAdmin.serverUser': serverUser,
                'serverAdmin.serverPass': serverUser,
                'yd': yd
              }, (err, updateData) => {
                if (err) {
                  return res.json({'postStatus': 'error', 'msg': '更新服务器失败'})
                }
                  Host.create({
                      'server.serverName':hostUser,
                      'server.serverTime':time,
                      'server.serverInfoS':hostInfo,
                      'server.server':mongoose.Types.ObjectId(myId)
                  },(err,createData) => {
                      if(err){
                          return res.json({'postStatus':'error','msg':'插入历史记录表失败'})
                      }
                      return res.json({'postStatus':'success','msg':'更新服务器成功'})
                  });
              });
        });
  }
};

//----------------------------------服务器搜索
exports.searchS = (req,res) => {
    let id = req.body.id;
    if(id.length <= 0){
        return res.json({'postStatus':'error','msg':'服务器编号不能为空'});
    }
    Server.findOne({'serverId':id},null,(err,searchData) => {
        if(err){
            return res.json({'postStatus':'error','msg':'查询服务器失败'});
        }
        return res.json({'postStatus':'success','msg':searchData});
    });
};
exports.searchI = (req,res) => {
    let id = req.body.id;
    if(id.length <= 0){
        return res.json({'postStatus':'error','msg':'服务器IP不能为空'});
    }
    //判断传入值是否存在','
    if(id.includes(',')){
        //存在截取字符串
        id = id.split(',');
    }else{
        //不存在判断是否为字符串
        if(typeof id == 'string'){
            id = [id];
        }
    };
    Server.findOne({'ip':{'$in':id}},null,(err,searchData) => {
        if(err){
            return res.json({'postStatus':'error','msg':'查询服务器失败可能未与IP地址关联'});
        }
        return res.json({'postStatus':'success','msg':searchData});
    });
};
//-----------------------查询机柜
exports.searchCab = (req,res) => {
  let id = req.body.id;
  if(id.length <= 0){
    return res.json({'postStatus':'error','msg':'机柜编号不能为空'});
  }
  Cabinets.findOne({'cabinetsId':id},null,(err,getId) => {
    if(err){
      return res.json({'postStatus':'error','msg':'服务器机柜查询出错'});
    }
    if(getId == null){
      return res.json({'postStatus': 'success', 'msg': getId});
    }else {
      let ids = mongoose.Types.ObjectId(getId._id);
      Server
        .find({'serverCab': ids})
        .populate('serverCab')
        .exec((err, searchData) => {
          if (err) {
            return res.json({'postStatus': 'error', 'msg': '查询服务器失败可能未与IP地址关联'});
          }
          return res.json({'postStatus': 'success', 'msg': searchData});
        });
    };
    });
  // Server
  //   .find()
  //   .populate({
  //     path:'serverCab',
  //     match:{'cabinetsId':id}
  //   })
  //   .exec((err,searchData) => {
  //     if(err){
  //       return res.json({'postStatus':'error','msg':'查询服务器失败可能未与IP地址关联'});
  //     }
  //     console.log(searchData)
  //     return res.json({'postStatus':'success','msg':searchData});
  //   });
  // Server.findOne({'ip':{'$in':id}},null,(err,searchData) => {
  //   if(err){
  //     return res.json({'postStatus':'error','msg':'查询服务器失败可能未与IP地址关联'});
  //   }
  //   return res.json({'postStatus':'success','msg':searchData});
  // });
};