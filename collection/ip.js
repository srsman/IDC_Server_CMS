//加载ipSchema模型
const Ip = require('../modules/ip');
const Uip = require('../modules/uip');
const Engine = require('../modules/engineRoom');
const mongoose = require('mongoose');
const Use = require('../modules/use');
//--------------------------ip地址池get路由
exports.getIp = (req,res) => {
  //获取ip地址机房信息
  Engine.find({}, {'_id': 1, 'engineName': 1}, (err, engineData) => {
    if (err) {
      return res.json({'postStatus': 'error', 'msg': '机房信息查询失败,请稍后再试'});
    }
    //关联查询机房
    Ip
      .find({})
      .populate('ipRoom')
      .populate('ip')
      .exec((err, ipEngineRoom) => {
        if (err) {
          return res.json({'postStatus': 'error', 'msg': '机房管理2关联查询失败,请稍候再试'});
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
exports.updateIp = (req,res) => {
  //获取表单信息
  let id = req.body.updateId;
  let ipRoom = req.body.ipRoom;
  let ipsMessage = req.body.ipsMessage;
  //更新条件
  let updateFind = {
    '_id':id
  };
  //更新数据
  let updateInfo = {
    'ipRoom': ipRoom,
    'ipsMessage': ipsMessage
  };
  //更新mongodb
  Ip.update(updateFind,updateInfo,(err) => {
    if(err){
      return res.json({'postStatus':'error','msg':'更新数据失败,请稍后在试'});
    }
    return res.json({'postStatus':'success','msg':'更新数据成功'});
  });
};

//-------------------------ip地址池删除
exports.deleteIp = (req,res) => {
  //获取id信息
  let id = req.query.id;
  //删除数据
  Ip.remove({'_id':id},(err) => {
    if(err){
      return res.json({'postStatus':'error','msg':'ip地址池删除失败'});
    }
    Uip.remove({'big_id':id},(err) => {
      if(err){
        return res.json({'postStatus':'error','msg':'ip地址删除失败'});
      }
      return res.redirect('back');
    });
  })
};

//-------------------------ip地址段post写入到mongodb
exports.postIp = (req,res) => {
  //获取表单提交的数据
  let ipStart = req.body.ipStart;
  let ipEnd = req.body.ipEnd;
  let ipRoom = req.body.ipRoom;
  let ipsMessage = req.body.ipsMessage ? req.body.ipsMessage : '';
  //判断准备写入的值是否存在
  if(ipStart == '' || ipStart == null){
    return res.json({'postStatus':'error','msg':'启始IP地址不能为空'});
  };
  if(ipEnd == '' || ipEnd == null){
    return res.json({'postStatus':'error','msg':'结束IP地址不能为空'});
  };
  if(ipRoom == '' || ipRoom == null){
    return res.json({'postStatus':'error','msg':'所属机房不能为空'});
  };
  let startSplit = ipStart.split('.');
  let startNum = startSplit[3];
  let endSplit = ipEnd.split('.');
  let endNum = endSplit[3];
  let ipLength = Number.parseInt(endNum) - Number.parseInt(startNum);
  let ipArray = [];
  for(let i=0; i <= ipLength; i++){
    let arrayObj = startSplit[0] + '.' + startSplit[1] + '.' + startSplit[2] +'.' + (Number.parseInt(startSplit[3])+i);
    ipArray.push(arrayObj);
  }
  //准备写入到mongodb
  Ip.create({
    'ipStart': ipStart,
    'ipEnd': ipEnd,
    'ipsMessage': ipsMessage,
    'ipRoom':ipRoom
  },(err,createIpData) => {
    if(err){
      return res.json({'postStatus':'error','msg':'IP地址池写入失败'});
    }
    //写入到Uip表信息
    //创建entity文档模型
    ipArray.forEach(function(data){
      let uipEntity = new Uip({
        'ip': data,
        'big_id':createIpData._id,
        'ipRoom': ipRoom
      });
      uipEntity.save((err,data) => {
        if(err){
          return console.log('插入失败');
        }
        Ip.update({'_id':data.big_id},{$push:{'ip':data._id}},(err,update) => {
          if(err){
            return console.log('添加失败');
          }
        })
      });
    });
    return res.json({'postStatus':'success','msg':'ip地址插入成功'});
  });
};

//--------------------------具体某条ip地址
exports.pId = (req,res) => {
  //获取当前ip池的id信息
  let id = req.query.id;
  let idObject = mongoose.Types.ObjectId(id);
  let page = req.query.page ? Number.parseInt(req.query.page) : 1;
  let limits = 256;
  //  let limits = 25;
  Uip.count({'big_id':idObject},(err,total) => {
    if(err){
      return res.json({'postStatus':'error','msg':'返回Ip总条数失败'});
    }
    Use.find({},null,(err,useData) => {
      if(err){
        return res.json({'postStatus':'error','msg':'关联查询用途管理失败'});
      }
      Uip
          .find({'big_id':idObject})
          .skip((page - 1) * limits )
          .limit(limits)
          .populate('ipUse')
          .populate('ipRoom')
          .exec((err,ipListData) => {
            if(err){
              return res.json({'postStatus':'error','msg':'此ip段无法访问系统错误'});
            }
            return res.render('pid',{
              title:'ip地址信息',
              session:req.session.username,
              ipDocs: ipListData,
              useDocs: useData,
              isFirstPage: (page - 1) == 0,
              isLastPage: ((page -1) * limits + Number.parseInt(ipListData.length)) == total,
              page: page
            });
          });
    });
  });

};
//-----------------------------search查询
exports.newId = (req,res) => {
  let searchStr = req.body.stringStr;
  if(searchStr.length <= 0){
    return res.json({'postStatus':'error','msg':'ip地址不能为空'})
  }
  Uip
    .findOne({'ip':searchStr})
    .populate('ipUse')
    .exec((err,searchData) => {
      if(err){
        return res.json({'postStatus':'error','msg':'ip地址查询失败'})
      }
      return res.json({'postStatus':'success','msg':searchData})
    });
};

//---------------------------批量更新
exports.UpdateId = (req,res) => {
  //获取表单数据
  let idArray = req.body.idData;
  if(idArray == null || idArray == ''){
    return res.json({'postStatus':'error','msg':'请选择需要修改的ip'});
  }
  let info = req.body.infoData;
  let strArray = idArray.split('&');
  let idS = [];
  let inS = [];
  for(let i =0; i< strArray.length; i++){
    let id = strArray[i].split('uid=');
    idS.push(id[1]);
  }
  let infoArray = info.split('&');
  for(let j =0; j< infoArray.length; j++){
    let message = infoArray[j].split('=');
    inS.push(message[1]);
  };
  //准备更新数据
  Uip.update({'ip':{'$in':idS}},{
    'ipMark':inS[0],
    'ipDisplay':inS[1],
    'ipInfo':decodeURI(inS[2]),
    'ipUse': mongoose.Types.ObjectId(inS[3])
  },{multi:true},(err,data) => {
    if(err){
      return res.json({'postStatus':'error','msg':'更新出错'});
    };
    return res.json({'postStatus':'success','msg':'更新完成'});
  });
};
