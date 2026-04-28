"use strict";
var common_menu_page={
    keys:{
        focused_part:"menu_selection",  //operation_modal
        menu_selection:0
    },
    menu_doms:$('#common-top-menus-container .right-top-setting-item'),
    prev_route:'',
    skip_index:-1,
    init:function(prev_route){
        current_route='common-menu-page';
        this.prev_route=prev_route;
        if(prev_route==='vod-series-summary-page'){
            this.skip_index=3;
            $(this.menu_doms[3]).hide();
            $(this.menu_doms[1]).hide();
        }
        else{
            this.skip_index = -1;
            $(this.menu_doms[3]).show();
            $(this.menu_doms[1]).show();

        }

        $('#common-top-menus-container').addClass('expanded');
        this.hoverMenuItem(this.menu_doms[0]);
    },
    goBack:function(){
        $('#common-top-menus-container').removeClass('expanded');
        if(current_route==='common-menu-page')
            current_route=this.prev_route;
    },
    releasePlayer:function(){
         try{
            channel_page.retrying = 6;

            channel_page.back_button_pressed = true;

            clearTimeout(channel_page.retryingTimeout);

            channel_player_page.retrying = 6;
            channel_player_page.back_button_pressed = true;
            clearTimeout(channel_player_page.retryingTimeout);

            $('.video-error').css("display","none");
            var videoPlayer = $("#channel-page-video")[0];
            videoPlayer.pause();
            $('#channel-page-video').attr('src', '');
            videoPlayer.load();
            $('.video-loader').css("display","none");

        }catch(e){
        }
    },
    goToHomePage:function(){

            this.releasePlayer();



        $('#common-top-menus-container').removeClass('expanded');
        current_route='home-page';
        if(this.prev_route==='vod-series-summary-page'){
            $('#series-summary-page').addClass('hide');
        }
        $('#home-page').removeClass('hide');

    },
    goToSettingPage:function(){
                this.releasePlayer();

        $('#common-top-menus-container').removeClass('expanded');
//        alert(this.prev_route);
        if(this.prev_route==='vod-series-summary-page'){
            $('#series-summary-page').addClass('hide');
        }else{
            $('#'+this.prev_route).addClass('hide');
        }
        setting_page.init(this.prev_route);
    },
    refreshChannelMovieSeries:function(){
        this.goBack();
    },
    refreshTvGuide:function(){
        this.goBack();
    },
    changeSortStatus:function(){
        this.goBack();
        sort_page.init(current_route);
    },
    logOut:function(){
        $('#common-top-menus-container').removeClass('expanded');
        logout_page.init(this.prev_route);
    },
    hoverMenuItem:function(targetElement){
        var index=$(targetElement).data('index');
        var keys=this.keys;
        keys.menu_selection=index;
        $(this.menu_doms).removeClass('active');
        $(this.menu_doms[index]).addClass('active');
    },
    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                $(this.menu_doms[keys.menu_selection]).trigger('click');
                break;
        }
    },
    handleMenuLeftRight:function(increment){

    },
    handleMenuUpDown:function(increment){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
//                alert(this.prev_route);
                 if(this.prev_route==='vod-series-summary-page'){
                     if(increment == 1){

                         if(keys.menu_selection == 0){
                             keys.menu_selection = 2
                         }else if(keys.menu_selection == 2){
                             keys.menu_selection = 2
                         }else{
                             keys.menu_selection+=increment;
                         }

                         if(keys.menu_selection<0)
                             keys.menu_selection=0;
                         if(increment>0 && keys.menu_selection>=this.menu_doms.length)
                             keys.menu_selection=this.menu_doms.length-1;
                         if(keys.menu_selection===this.skip_index){
                             keys.menu_selection=this.skip_index+increment;
                         }
                         this.hoverMenuItem(this.menu_doms[keys.menu_selection]);
                         break;
                     }else{

                          if(keys.menu_selection == 2){
                              keys.menu_selection = 0
                          }else if(keys.menu_selection == 0){
                              keys.menu_selection = 0
                          }else{
                              keys.menu_selection+=increment;
                          }


                          if(keys.menu_selection<0)
                             keys.menu_selection=0;
                         if(increment>0 && keys.menu_selection>=this.menu_doms.length)
                             keys.menu_selection=this.menu_doms.length-1;
                         if(keys.menu_selection===this.skip_index){
                             keys.menu_selection=this.skip_index+increment;
                         }
                         this.hoverMenuItem(this.menu_doms[keys.menu_selection]);
                         break;
                     }


                 }else{
                     keys.menu_selection+=increment;
                     if(keys.menu_selection<0)
                         keys.menu_selection=0;
                     if(increment>0 && keys.menu_selection>=this.menu_doms.length)
                         keys.menu_selection=this.menu_doms.length-1;
                     if(keys.menu_selection===this.skip_index){
                         keys.menu_selection=this.skip_index+increment;
                     }
                     this.hoverMenuItem(this.menu_doms[keys.menu_selection]);
                     break;
                 }
        }
    },

    HandleKey:function (e) {
        switch (e.keyCode) {
            case tvKey.RIGHT:
                this.handleMenuLeftRight(1)
                break;
            case tvKey.LEFT:
                this.handleMenuLeftRight(-1)
                break;
            case tvKey.DOWN:
                this.handleMenuUpDown(1);
                break;
            case tvKey.UP:
                this.handleMenuUpDown(-1);
                break;
            case tvKey.ENTER:
                this.handleMenuClick();
                break;
            case tvKey.RETURN:
            case tvKey.RETURN_LG:case tvKey.ESC:
                this.goBack();
                break;
        }
    }
}
