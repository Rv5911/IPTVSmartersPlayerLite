"use strict";
var user_account_page={
    keys:{
        focused_part:"menu_selection", // or, "search part", "slider part", "sub menu part", "search_value"
        menu_selection:0
    },
    initiated:false,
    prev_route:'',
    btn_doms:$('.user-account-btn'),

    init:function(prev_route){
        this.prev_route=prev_route;
        $('#user-account-username').text(playlist.user_name);
        $('#user-account-status').text('Active');
        $('#user-account-active-connection').text(user_info.active_cons!=0 ? user_info.active_cons : 1);
        if(typeof user_info.created_at !== "undefined"){
        	
        	 var exp_date=user_info.created_at;
             var date_obj=moment.unix(exp_date);
             $('#user-account-created-at').text(date_obj.format('MMMM DD, YYYY'));
        }else{
        	  $('#user-account-created-at').text("N/A");
        }
       
        $('#user-account-max-connection').text(user_info.max_connections);
        this.hoverBtn(0);
        $('#user-account-page').removeClass('hide');
        current_route='user-account-page';
    },
    goBack:function(){
        $('#user-account-page').addClass('hide');
        current_route=this.prev_route;
        switch (this.prev_route) {
            case "home-page":
                $('#home-page').removeClass('hide');
                break;
        }
    },
    showLogOutModal:function(){
        logout_page.init('user-account-page');
    },
    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            // case "menu_selection":
            //     if(keys.menu_selection==0)
            //         this.goBack();
            //     else if(keys.menu_selection==1){
            //         this.showLogOutModal();
            //     }
            //     break;
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
            // case "menu_selection":
            //     keys.menu_selection+=increment;
            //     if(keys.menu_selection<0)
            //         keys.menu_selection=0;
            //     if(keys.menu_selection>1)
            //         keys.menu_selection=1;
            //     this.hoverBtn(keys.menu_selection);
            //     break;
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
