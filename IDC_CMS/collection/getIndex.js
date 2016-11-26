//网站首页逻辑处理
exports.index = (req,res) => {
  return res.render('index',{
    title: 'IDC机房资源管理系统',
    session: req.session.username
  });
};