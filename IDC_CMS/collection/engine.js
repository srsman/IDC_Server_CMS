//加载机房管理Schema;
let Engine = require('../modules/engineRoom');
//-----------------机房管理get路由
exports.getEngine = (req,res) => {
  //查询数据库获取机房信息
  Engine.find({},{'engineName':1,'engineAddress':1},(err,engineInfo) => {
    if(err){
      return res.json({'postStatus':'error','msg':'机房查询出错请稍后再试'});
    }
    return res.render('engine',{
      title: '机房管理',
      session: req.session.username,
      docs: engineInfo
    });
  });
};

//-----------------机房管理删除路由

exports.deleteEngine = (req,res) => {
  //获取query字段
  let id = req.query.id;
  //删除处理
  Engine.remove({_id:id},(err) => {
    if(err){
      return res.json({'postStatus':'error','msg':'系统错误: 无法删除'});
    };
    return res.redirect('back');
  });
};

//-----------------机房管理添加机房post处理逻辑
exports.postEngine = (req,res) => {
  //获取表单提交的数据
  let engineName = req.body.engineName;
  let engineAddress = req.body.engineAddress;
  //判断 机房名称以及机房地址是否为空
  if(engineName == '' || engineName == null){
    return res.json({'postStatus':'error','msg':'机房名称不能为空'});
  }
  if(engineAddress == '' || engineAddress == null){
    return res.json({'postStatus':'error','msg':'机房地址不能为空'});
  };
  //准备写入到engineRoom模板
  Engine.findOne({'engineAddress':engineAddress},(err,engine) => {
    if(err){
      return res.json({'postStatus':'error','msg':'机房查询出错请稍后再试'});
    }
    if(engine){
      return res.json({'postStatus':'error','msg':'机房地址已存在,请勿重复添加'});
    }
    Engine.create({
      'engineName':engineName,
      'engineAddress':engineAddress
    }, (err) => {
      if(err){
        return res.json({'postStatus':'error','msg':'系统错误: 添加机房失败，请重新再是'});
      }
      //添加完成
      return res.json({'postStatus':'success','msg':'机房添加完成'})
    });
  });
};