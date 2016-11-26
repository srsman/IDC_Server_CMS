//导入use对象模型
let Use = require('../modules/use');
//--------------------用途管理get路由
exports.getUse = (req,res) => {
  //查询用途管理库
  Use.find({},{'useName':1},(err,use) => {
    if(err){
      return res.json({'postStatus':'error','msg':'用途管理查询失败'});
    }
    return res.render('use',{
      title: '用途管理',
      session: req.session.username,
      docs: use
    });
  });
};

//----------------------用途管理删除路由
exports.deleteUse = (req,res) => {
  //获取query信息
  let id = req.query.id;
  //删除用途管理信息
  Use.remove({'_id': id},(err) => {
    if(err){
      return res.json({'postStatus':'error','msg':'用途管理信息删除失败'})
    }
    return res.redirect('back');
  });
};

//----------------------用途管理添加处理逻辑
exports.postUse = (req,res) => {
  //获取表单数据
  let useName = req.body.useName;
  //准备写入到mongodb
  Use.create({'useName':useName},(err) => {
    if(err){
      return res.json({'postStatus':'error','msg':'用途管理添加失败'});
    }
    return res.json({'postStatus':'success','msg':'用途管理添加完成'});
  });
};