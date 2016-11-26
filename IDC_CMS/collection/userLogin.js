let crypto = require('crypto');
const User = require('../modules/user');
//------------------------------------网站登录页面理由
exports.login = (req,res) => {
  res.render('login',{
    title: '用户登录'
  });
};
//-------------------------------------网站登录页面处理逻辑
exports.postLogin = (req,res) => {
  //获取表单提交的数据
  let username = req.body.username;
  let password = req.body.password;
  //判断当前值是否为空
  if(username == '' || username == null){
    return res.json({'postStatus':'error','msg':'用户名不能为空'});
  };
  if(password == '' || password == null){
    return res.json({'postStatus':'error','msg':'密码不能为空'});
  };
  //加密password密码
  let md5 = crypto.createHash('md5');
  let md5Password = md5.update(password).digest('hex');
  //查询数据库
  User.findOne({'admin.username':username},(err,user) => {
    if(!user){
      return res.json({'postStatus':'error','msg':'此用户不存在,请重新输入'});
    };
    //判断输入的密码是否符合数据库存入的密码
    if(md5Password != user.admin.password){
      return res.json({'postStatus':'error','msg':'密码不正确，请重新输入'});
    };
    //存储session
    req.session.username = username;
    //返回json信息
    return res.json({'postStatus':'success','msg':'登陆完成，欢迎访问'});
  });
};
//-------------------------------------用户退出路由
exports.logout = (req,res) => {
  //session值赋值为空
  req.session.username = null;
  return res.redirect('/');
};
//-------------------------------------用户注册路由
exports.reg = (req,res) => {
  res.render('reg',{
    title: '用户注册'
  });
};
//--------------------------------------用户注册处理逻辑
exports.register = (req,res) => {
  //获取用户信息;
  let username = req.body.username;
  let password = req.body.password;
  let pass_repeat = req.body['pass_repeat'];
  //判断当前值事后为空
  if(username == '' || username == null){
    return res.json({'postStatus':'error','msg':'用户名不能为空'});
  };
  if(password == '' || password == null){
    return res.json({'postStatus':'error','msg':'密码不能为空'});
  };
  if(pass_repeat == '' || pass_repeat == null){
    return res.json({'postStatus':'error','msg':'密码不能为空'});
  };
  if(password != pass_repeat){
    return res.json({'postStatus':'error','msg':'两次密码输入不一致'});
  };
  //加密密码字段
  let md5 = crypto.createHash('md5');
  let md5Password = md5.update(password).digest('hex');
 //查询数据库判断当前管理员用户是否存在
  User.findOne({'admin.username':username},(err,user)=>{
    if(err){
      return res.json({'postStatus':'error','msg':'find Error: ' + err});
    };
    if(user){
      return res.json({'postStatus':'error','msg':'Ajax Error: 当前用户' + username + '已存在!'});
    };
    //当前post过来的username不存在写入到mongodb
    User.create({
      'admin.username': username,
      'admin.password': md5Password,
      'user':{}
    },(err,data) => {
      if(err){
        return res.json({'postStatus':'error','msg':'Create Error: ' + err});
      }
      //写入session
      req.session.username = username;
      //返回success json信息
      return res.json({'postStatus':'success','msg':'注册成功,欢迎访问本站点'});
    });
  });
};