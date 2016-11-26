(function($){
  //-----------------sidebar切换导航栏
  $.fn.sidebarToggle = function(options){
    var element = $(this),
        defaults = {
          clickToggle:'',
          toggleMenu: '',
          isMark: true
        },
        settings = $.extend(defaults,options);
    element.on('click',function(e){
      e.stopPropagation();
      if(settings.isMark == true) {
        settings.toggleMenu.css({'display': 'block'});
        settings.isMark = false;
      }else if(settings.isMark == false){
        settings.toggleMenu.css({'display': 'none'});
        settings.isMark = true;
      };
    });
  };
})(jQuery);