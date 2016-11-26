'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

//引入mongoose对象以及依赖的其他模型
var Ip = require('../modules/ip');
var Uip = require('../modules/uip');
var Engine = require('../modules/engineRoom');
var Use = require('../modules/use');
var Server = require('../modules/server');
var Cabinets = require('../modules/cabinet');
var Host = require('../modules/serverHost');
var mongoose = require('mongoose');
//---------------server服务器管理get路由
exports.getServer = function (req, res) {
  var page = req.query.page ? Number.parseInt(req.query.page) : 1;
  var limits = 15;
  Engine.find({}, null, function (err, serverEngine) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '服务器机房查询失败' });
    }
    Use.find({}, null, function (err, serverUse) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '服务器用途查询失败' });
      }
      Cabinets.find({}, null, function (err, cabData) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '服务器所属机柜查询失败' });
        }
        //首页分页路由
        Server.count({}, function (err, total) {
          if (err) {
            return res.json({ 'postStatus': 'error', 'msg': '返回服务器总条数失败' });
          }
          Server.find({}, null, { 'skip': (page - 1) * limits, 'limit': limits }, function (err, serverInfo) {
            if (err) {
              return res.json({ 'postStatus': 'error', 'msg': '服务器信息查询失败' });
            }
            return res.render('server', {
              title: '服务器管理',
              session: req.session.username,
              engineDocs: serverEngine,
              useDocs: serverUse,
              serverData: serverInfo,
              cabDocs: cabData,
              isFirstPage: page - 1 == 0,
              isLastPage: (page - 1) * limits + Number.parseInt(serverInfo.length) == total,
              page: page,
              maxPage: Math.floor((total + limits - 1) / limits)
            });
          });
        });
      });
    });
  });
};

//------------------server添加一条服务器信息
exports.createServer = function (req, res) {
  //获取表单数据
  var serverId = req.body.serverId;
  var serverCab = req.body.serverCab;
  var price = req.body.price;
  var serverCpu = req.body.serverCpu;
  var board = req.body.board;
  var memories = req.body.memories;
  var nic = req.body.nic;
  var bandwidth = req.body.bandwidth;
  var serverRoom = req.body.serverRoom;
  var serverIpAddress = req.body.serverIpAddress;
  var serverUse = req.body.serverUse;
  var ipArray = req.body.serverIP;
  var shelvesTime = req.body.shelvesTime;
  var serverInfo = req.body.serverInfo;
  var serverUrl = req.body.serverUrl;
  var serverUser = req.body.serverUser;
  var serverPass = req.body.serverPass;
  var yd = req.body.yd;
  if (serverId == '' || serverId == null) {
    return res.json({ 'postStatus': 'error', 'msg': '服务器编号不能为空' });
  }
  //查询此服务器编号是否以写入
  Server.findOne({ 'serverId': serverId }, null, function (err, newId) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '查询服务器出错，请稍后再试' });
    }
    //判断此id是否存在
    if (newId) {
      return res.json({ 'postStatus': 'error', 'msg': '当前服务器' + serverId + '已录入' });
    };
    if (serverRoom == '') {
      //准备写入到数据库
      Server.create({
        'serverId': serverId,
        'serverCab': mongoose.Types.ObjectId(serverCab),
        'cpu': serverCpu,
        'board': board,
        'memories': memories,
        'nic': nic,
        'bandwidth': bandwidth,
        'ip': ipArray,
        'price': price,
        'shelvesTime': shelvesTime,
        'serverInfo': serverInfo,
        'serverAdmin.serverUrl': serverUrl,
        'serverAdmin.serverUser': serverUser,
        'serverAdmin.serverPass': serverPass,
        'yd': yd
      }, function (err, createData) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '服务器添加失败' });
        }
        //更新ip表信息
        Uip.update({ 'ip': { '$in': ipArray } }, { 'ipMark': true, 'server': serverId }, { multi: true }, function (err, data) {
          if (err) {
            return res.json({ 'postStatus': 'error', 'msg': '服务器添加完成,ip信息更新失败' });
          }
          return res.json({ 'postStatus': 'success', 'msg': '服务器添加完成' });
        });
      });
    } else {
      //准备写入到数据库
      Server.create({
        'serverId': serverId,
        'serverCab': mongoose.Types.ObjectId(serverCab),
        'cpu': serverCpu,
        'board': board,
        'memories': memories,
        'nic': nic,
        'bandwidth': bandwidth,
        'ip': ipArray,
        'price': price,
        'shelvesTime': shelvesTime,
        'serverInfo': serverInfo,
        'serverRoom': mongoose.Types.ObjectId(serverRoom),
        'serverIp': mongoose.Types.ObjectId(serverIpAddress),
        'serverUse': mongoose.Types.ObjectId(serverUse),
        'serverAdmin.serverUrl': serverUrl,
        'serverAdmin.serverUser': serverUser,
        'serverAdmin.serverPass': serverPass,
        'yd': yd
      }, function (err, createData) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '服务器添加失败' });
        }
        //更新ip表信息
        Uip.update({ 'ip': { '$in': ipArray } }, { 'ipMark': true, 'server': serverId }, { multi: true }, function (err, data) {
          if (err) {
            return res.json({ 'postStatus': 'error', 'msg': '服务器添加完成,ip信息更新失败' });
          }
          return res.json({ 'postStatus': 'success', 'msg': '服务器添加完成' });
        });
      });
    }
  });
};

//------------------server某条信息
exports.getOne = function (req, res) {
  var id = req.params.id;
  if (id == '' || id == null) {
    return res.json({ 'postStatus': 'error', 'msg': 'id值不能为空' });
  };
  Server.findOne({ 'serverId': id }).populate('serverRoom').populate('serverIp').populate('serverUse').populate('serverCab').exec(function (err, serverOne) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '此服务器查询出错请稍候再试' });
    }
    Host.find({ 'server.server': serverOne._id }, null, function (err, hostData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '此服务器历史记录查询出错请稍候再试' });
      }
      return res.render('serverOne', {
        title: '服务器信息',
        session: req.session.username,
        serverDocs: serverOne,
        hostDocs: hostData
      });
    });
  });
};

//------------------server服务器某数据删除
exports.deleteId = function (req, res) {
  //获取表单提交数据
  var id = req.query.id;
  Server.findById({ '_id': id }, function (err, data) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '服务器删除失败' });
    }
    //console.log(data.ip);
    //准备更新IP地址数据
    Uip.update({ 'ip': { '$in': data.ip } }, { 'ipMark': false, 'server': '' }, { multi: true }, function (err, updateDatas) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': 'IP地址更新失败' });
      }
      //删除信息
      Server.remove({ '_id': id }, function (err) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '服务器删除失败' });
        }
        return res.redirect('back');
      });
    });
  });
};
//------------------server联动查询ip段
exports.getIps = function (req, res) {
  //获取字段id
  var id = req.query.id;
  if (id == '' || id == null) {
    return console.log('机房不能为空字段');
  };
  var queryId = mongoose.Types.ObjectId(id);
  Ip.find({ 'ipRoom': queryId }, null, function (err, ipsData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': 'ip段查询出错' });
    }
    return res.json({ 'postStatus': 'success', 'msg': ipsData });
  });
};
//-----------------server联动查询获取ip地址
exports.getIP = function (req, res) {
  //获取表单数据
  //let uip = req.query['big_id'];
  var useId = req.query.use;
  if (useId == '') {
    return console.log('请选择ip地址段以及ip地址用途,在进行操作');
  };
  //let ips = mongoose.Types.ObjectId(uip);
  var use = mongoose.Types.ObjectId(useId);
  //查询ip表数据库
  Uip.find({ 'ipUse': use, 'ipMark': 'false', 'ipDisplay': 'true' }, null, function (err, ipData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': 'ip地址查询出错' });
    }
    return res.json({ 'postStatus': 'success', 'msg': ipData });
  });
};

//更新数据获取表单信息
exports.updateInfo = function (req, res) {
  //获取表单数据
  var id = req.body.id;
  //准备查询id
  if (id == '' || id == null) {
    return false;
  };
  Server.findById({ '_id': id }, function (err, updateInfo) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '更新数据失败,无法更新' });
    }
    //返回sql结果
    return res.json({ 'postStatus': 'success', 'msg': updateInfo });
  });
};

//----------------------更新server服务器
exports.updateServer = function (req, res) {
  //获取表单数据
  var myId = req.body.myId;
  var serverCab = req.body.updateCab;
  var cpu = req.body.updateCpu;
  var board = req.body.updateBoard;
  var memories = req.body.updateMemories;
  var yd = req.body.updateYd;
  var nic = req.body.updateNic;
  var bandwidth = req.body.updateBandwidth;
  var serverRoom = req.body.updateRoom;
  var serverIpAddress = req.body.updateIpAddress;
  var serverUse = req.body.updateUse;
  var serverIP = req.body.updateIP;
  var serverUrl = req.body.updateUrl;
  var serverUser = req.body.updateUser;
  var serverPass = req.body.updatePass;
  var serverInfo = req.body.updateInfo;
  var hostInfo = req.body.hostInfo;
  var time = new Date();
  var hostUser = req.session.username;
  var uid = null;
  var ip = null;
  var cId = req.body.cId;
  if (req.body.uid == null) {
    uid = [];
  } else {
    uid = req.body.uid;
    ip = uid.split(',');
  }
  var updateMark = req.body.updateMark;
  //判断当前状态
  if (updateMark == 1) {
    //更新数据不更新IP
    Server.update({ '_id': myId }, {
      'serverCab': mongoose.Types.ObjectId(serverCab),
      'cpu': cpu,
      'board': board,
      'memories': memories,
      'nic': nic,
      'bandwidth': bandwidth,
      'serverInfo': serverInfo,
      'serverAdmin.serverUrl': serverUrl,
      'serverAdmin.serverUser': serverUser,
      'serverAdmin.serverPass': serverUser,
      'yd': yd
    }, function (err, updateData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '更新服务器失败' });
      }
      Host.create({
        'server.serverName': hostUser,
        'server.serverTime': time,
        'server.serverInfoS': hostInfo,
        'server.server': mongoose.Types.ObjectId(myId)
      }, function (err, createData) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '插入历史记录表失败' });
        }
        return res.json({ 'postStatus': 'success', 'msg': '更新服务器成功' });
      });
    });
  } else if (updateMark == 2) {
    (function () {
      var thisIp = req.body.thisIp;
      if (typeof thisIp == 'string') {
        thisIp = [thisIp];
      };
      var a = new Set(thisIp); //转化成set函数
      var b = new Set(ip);
      var differenceABSet = new Set([].concat(_toConsumableArray(b)).filter(function (x) {
        return !a.has(x);
      })); //去ip字段跟当前选中字段的差集
      var arr = Array.from(differenceABSet);
      //更新当前数据
      Uip.update({ 'ip': { '$in': arr } }, { 'ipMark': false, 'server': '' }, { multi: true }, function (err, ipMarkData) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '更新IP地址失败' });
        }
        //准备更新server
        Server.update({ '_id': myId }, {
          'serverCab': mongoose.Types.ObjectId(serverCab),
          'cpu': cpu,
          'board': board,
          'memories': memories,
          'nic': nic,
          'bandwidth': bandwidth,
          'serverInfo': serverInfo,
          'ip': thisIp,
          'serverAdmin.serverUrl': serverUrl,
          'serverAdmin.serverUser': serverUser,
          'serverAdmin.serverPass': serverUser,
          'yd': yd
        }, function (err, updateData) {
          if (err) {
            return res.json({ 'postStatus': 'error', 'msg': '更新服务器失败' });
          }
          Host.create({
            'server.serverName': hostUser,
            'server.serverTime': time,
            'server.serverInfoS': hostInfo,
            'server.server': mongoose.Types.ObjectId(myId)
          }, function (err, createData) {
            if (err) {
              return res.json({ 'postStatus': 'error', 'msg': '插入历史记录表失败' });
            }
            return res.json({ 'postStatus': 'success', 'msg': '更新服务器成功' });
          });
        });
      });
    })();
  } else if (updateMark == 3) {
    //更新ip地址
    Uip.update({ 'ip': { '$in': ip } }, { 'ipMark': false, 'server': '' }, { multi: true }, function (err, ipMarkData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '更新IP地址失败' });
      }
      //准备更新server
      Server.update({ '_id': myId }, {
        'serverCab': mongoose.Types.ObjectId(serverCab),
        'cpu': cpu,
        'board': board,
        'memories': memories,
        'nic': nic,
        'bandwidth': bandwidth,
        'serverInfo': serverInfo,
        'ip': serverIP,
        'serverRoom': mongoose.Types.ObjectId(serverRoom),
        'serverIp': mongoose.Types.ObjectId(serverIpAddress),
        'serverUse': mongoose.Types.ObjectId(serverUse),
        'serverAdmin.serverUrl': serverUrl,
        'serverAdmin.serverUser': serverUser,
        'serverAdmin.serverPass': serverUser,
        'yd': yd
      }, function (err, updateData) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '更新服务器失败' });
        }
        Uip.update({ 'ip': { '$in': serverIP } }, { 'ipMark': true, 'server': cId }, { multi: true }, function (err, ipMarkData) {
          if (err) {
            return res.json({ 'postStatus': 'error', 'msg': '更新Ip关联失败' });
          }
          Host.create({
            'server.serverName': hostUser,
            'server.serverTime': time,
            'server.serverInfoS': hostInfo,
            'server.server': mongoose.Types.ObjectId(myId)
          }, function (err, createData) {
            if (err) {
              return res.json({ 'postStatus': 'error', 'msg': '插入历史记录表失败' });
            }
            return res.json({ 'postStatus': 'success', 'msg': '更新服务器成功' });
          });
        });
      });
    });
  } else if (updateMark == 4) {
    //清楚ip地址
    Uip.update({ 'ip': { '$in': ip } }, { 'ipMark': false, 'server': '' }, { multi: true }, function (err, ipMarkData) {
      if (err) {
        return res.json({ 'postStatus': 'error', 'msg': '更新IP地址失败' });
      }
      //准备更新server
      Server.update({ '_id': myId }, {
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
      }, function (err, updateData) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '更新服务器失败' });
        }
        Host.create({
          'server.serverName': hostUser,
          'server.serverTime': time,
          'server.serverInfoS': hostInfo,
          'server.server': mongoose.Types.ObjectId(myId)
        }, function (err, createData) {
          if (err) {
            return res.json({ 'postStatus': 'error', 'msg': '插入历史记录表失败' });
          }
          return res.json({ 'postStatus': 'success', 'msg': '更新服务器成功' });
        });
      });
    });
  }
};

//----------------------------------服务器搜索
exports.searchS = function (req, res) {
  var id = req.body.id;
  if (id.length <= 0) {
    return res.json({ 'postStatus': 'error', 'msg': '服务器编号不能为空' });
  }
  id = id.trim();
  Server.findOne({ 'serverId': id }, null, function (err, searchData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '查询服务器失败' });
    }
    return res.json({ 'postStatus': 'success', 'msg': searchData });
  });
};
exports.searchI = function (req, res) {
  var id = req.body.id;
  if (id.length <= 0) {
    return res.json({ 'postStatus': 'error', 'msg': '服务器IP不能为空' });
  }
  id = id.trim();
  //判断传入值是否存在','
  if (id.includes(',')) {
    //存在截取字符串
    id = id.split(',');
  } else {
    //不存在判断是否为字符串
    if (typeof id == 'string') {
      id = [id];
    }
  };
  Server.findOne({ 'ip': { '$in': id } }, null, function (err, searchData) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '查询服务器失败可能未与IP地址关联' });
    }
    return res.json({ 'postStatus': 'success', 'msg': searchData });
  });
};
//-----------------------查询机柜
exports.searchCab = function (req, res) {
  var id = req.body.id;
  if (id.length <= 0) {
    return res.json({ 'postStatus': 'error', 'msg': '机柜编号不能为空' });
  }
  id = id.trim().toUpperCase();
  Cabinets.findOne({ 'cabinetsId': id }, null, function (err, getId) {
    if (err) {
      return res.json({ 'postStatus': 'error', 'msg': '服务器机柜查询出错' });
    }
    if (getId == null) {
      return res.json({ 'postStatus': 'success', 'msg': getId });
    } else {
      var ids = mongoose.Types.ObjectId(getId._id);
      Server.find({ 'serverCab': ids }).populate('serverCab').exec(function (err, searchData) {
        if (err) {
          return res.json({ 'postStatus': 'error', 'msg': '查询服务器失败可能未与IP地址关联' });
        }
        return res.json({ 'postStatus': 'success', 'msg': searchData });
      });
    };
  });
};

//# sourceMappingURL=server-compiled.js.map