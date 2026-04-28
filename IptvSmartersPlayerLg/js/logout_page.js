"use strict";
var logout_page={
    keys:{
        focused_part:"menu_selection", // or, "search part", "slider part", "sub menu part", "search_value"
        menu_selection:0
    },
    prev_route:'',
    btn_doms:$('.logout-btn'),

    init:function(prev_route){
        this.prev_route=prev_route;
        this.hoverBtn(0);
        $('#logout-modal').modal('show');
        current_route='logout-page';
    },
    goBack:function(){
        current_route=this.prev_route;
        $('#logout-modal').modal('hide');
    },
    logOut:function(){
     this.releasePlayer();
        $('#logout-modal').modal('hide');
        localStorage.removeItem(storage_id+'user_name');
        localStorage.removeItem(storage_id+'password');
        localStorage.removeItem(storage_id+'latest_playlist');

        $('#xtreme-anyname-field').val('');
        $('#xtreme-username-field').val('');
        $('#password').val('');
        $('#xtreme-url-input').val('');

//        $('.xtreme-user-menu-item').removeClass('active');
//        $('#xtreme-anyname-field').addClass('active');



        $('#user-name').text('');
        $('#password').text('');
//        $('#app').hide();
        $('#xtreme-user-page').removeClass('hide');
        current_route='xtreme-user-page';

        xtreme_user_page.init('loading');
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
    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                if(keys.menu_selection==1)
                    this.logOut();
                else if(keys.menu_selection==0){
                    this.goBack();
                }
                break;
        }
    },
    handleMenusUpDown:function(increment) {

    },
    hoverBtn:function(index){
        this.keys.menu_selection=index;
        $(this.btn_doms).removeClass('active');
        $(this.btn_doms[index]).addClass('active');
    },
    handleMenuLeftRight:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                keys.menu_selection+=increment;
                if(keys.menu_selection<0)
                    keys.menu_selection=0;
                if(keys.menu_selection>1)
                    keys.menu_selection=1;
                this.hoverBtn(keys.menu_selection);
                break;
        }
    },
    HandleKey:function(e){
        switch (e.keyCode) {
            case tvKey.RIGHT:
                this.handleMenuLeftRight(1);
                break;
            case tvKey.LEFT:
                this.handleMenuLeftRight(-1);
                break;
            case tvKey.DOWN:
                this.handleMenusUpDown(1)
                break;
            case tvKey.UP:
                this.handleMenusUpDown(-1)
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
