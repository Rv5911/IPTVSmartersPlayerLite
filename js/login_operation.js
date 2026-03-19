"use strict";
var login_page={
    keys:{
        focused_part:"license_btn",
        login_section:0,
        turn_off_modal:0,
        license_btn:0
    },
    license_btn_doms:$('.license-btn'),
    login_doms:$('.xtreme-user-menu-item'),
    is_loading:false,
    showLoadImage:function(){
        $('#loading-page').removeClass('hide');
    },
    hideLoadImage:function() {
        $('#loading-page').addClass('hide');
    },
    goToHomePage:function(){
        $('#app').show();
        current_route='home-page';
    },
    fetchPlaylistInformation:function(){
        this.hideLoadImage();
        var terms_accepted=localStorage.getItem(storage_id+'terms_accepted');
        if(!terms_accepted){
            $('#license-page').removeClass('hide');
            this.hoverLicenseBtn(0);
            return;
        }
        var latest_playlist=localStorage.getItem(storage_id+'latest_playlist');
        if(!latest_playlist){

           $('#app').show();
           list_user_page.init('list-user-page');
            return;
        }

        playlist=JSON.parse(latest_playlist);

        MovieHelper.readVideoTimes();
        $('#home-expire-date').text('');
        $('#home-user-name').text(playlist.name);
        if(playlist.type==='xtreme'){
        	$('#loading-page').removeClass('hide');
            var login_url = playlist.url + '/player_api.php?username=' + playlist.user_name + '&password='+playlist.password;
            $.ajax({
                method: 'get',
                url: login_url,
                success: function (data) {
                	$('#loading-page').addClass('hide');
                    saveData('user_info', data.user_info);
                    if(typeof user_info!='undefined'){
                        if(user_info.exp_date==null)
                            $('.expire-date').text('Unlimited');
                        else{
                            var exp_date_obj=moment(data.user_info.exp_date*1000);
                            $('.expire-date').text(exp_date_obj.format('Y-MM-DD'));
                        }
                        if(typeof  data.server_info!="undefined")
                        {
                            saveData('server_info',data.server_info)
                            calculateTimeDifference(data.server_info.time_now,data.server_info.timestamp_now)
                        }
                    }
                  
                    home_page.init();
                },
                error:function () {
                	$('#loading-page').addClass('hide');
                    home_page.init();
                }
            })
        }
    },
    getPlayListDetail:function(){
        current_route='login';
        // mac_address='52:54:00:12:34:56';
        var that=this;
        // try{
        //     tizen.systeminfo.getPropertyValue('ETHERNET_NETWORK',function(data){
        //         if(data!==undefined){
        //             if(typeof data.macAddress!='undefined')
        //             {
        //                 mac_address=data.macAddress;
        //                 $('#mac-address').text(mac_address);
        //                 that.fetchPlaylistInformation()
        //             }
        //             else{
        //                 showToast("Sorry","Could not get mac address")
        //             }
        //         }
        //         else{
        //             that.fetchPlaylistInformation()
        //         }
        //     })
        // }catch (e) {
        //     this.fetchPlaylistInformation();
        // }
        that.fetchPlaylistInformation()
    },
    login:function(){
        var that=this;
        $('.login-input-error').hide();
        user_name=$('#user-name').val();
        if(user_name==='')
            $('#login-username-error').slideDown();
        password=$('#password').val();
        if(password===''){
            $('#login-password-error').slideDown();
            return;
        }
        var login_url=api_host_url+'/player_api.php?username='+user_name+'&password='+password;
        $.ajax({
            method: 'get',
            url: login_url,
            success: function (data) {
                if (typeof data.user_info != "undefined") {
                    saveData('user_info', data.user_info);
                    if (data.user_info.auth == 0 || (typeof data.user_info.status != 'undefined' && data.user_info.status === 'Expired')) {
                        that.is_loading = false;
                        showToast('Sorry','User name or password is incorrect');
                        return;
                    }
                    localStorage.setItem(storage_id+'user_name',user_name);
                    localStorage.setItem(storage_id+'password',password);
                    if(typeof  data.server_info!="undefined")
                    {
                        saveData('server_info',data.server_info)
                        calculateTimeDifference(data.server_info.time_now,data.server_info.timestamp_now)
                    }
                    that.proceed_login();
                }else{
                    showToast('Sorry','User name or password is incorrect');
                }
            },
            error:function (error) {
                showToast('Sorry','User name or password is incorrect');
                console.log(error);
            }
        });
    },
    proceed_login:function(){
        var that=this;
        this.showLoadImage();
        var  prefix_url=api_host_url+'/player_api.php?username='+user_name+'&password='+password+'&action=';
        var login_url=api_host_url+'/player_api.php?username='+user_name+'&password='+password;
        $.ajax({
            method: 'get',
            url: login_url,
            success: function (data) {
                saveData('user_info', data.user_info);
                if (typeof data.user_info != "undefined" && typeof data.user_info.exp_date!='undefined') {
                    var exp_date=data.user_info.exp_date;
                    var date_obj=moment.unix(exp_date);
                    $('#home-expire-date').text(date_obj.format('MMMM DD, YYYY'));
                }
                if(typeof data.server_info!='undefined'){
                    var server_info=data.server_info;
                    var timestamp_now=server_info.timestamp_now;
                    var server_time=server_info.time_now;
                    calculateTimeDifference(server_time,timestamp_now);
                }
            },
            error:function (error) {
                console.log(error);
            }
        });
        $.when(
            $.ajax({
                method:'get',
                url: panel_url+"/get_app_setting/"+mac_address,
                success:function (data) {
                },
                error:function(error){
                    that.hideLoadImage();
                }
            }),
            $.ajax({
                method:'get',
                url:prefix_url+'get_live_streams',
                success:function (data) {
                    MovieHelper.setMovies('live',data);
                },
                error:function(error){
                    that.hideLoadImage();
                }
            }),
            $.ajax({
                method:'get',
                url:prefix_url+'get_live_categories',
                success:function (data) {
                    MovieHelper.setCategories('live',data);
                },
                error:function(error){
                    that.hideLoadImage();
                }
            }),
            $.ajax({
                method:'get',
                url:prefix_url+'get_vod_categories',
                success:function (data) {
                    MovieHelper.setCategories('vod',data);
                },
                error:function(error){
                    that.hideLoadImage();
                }
            }),
            $.ajax({
                method:'get',
                url:prefix_url+'get_series_categories',
                success:function (data) {
                    MovieHelper.setCategories('series',data);
                },
                error:function(error){
                    that.hideLoadImage();
                }
            }),
            $.ajax({
                method:'get',
                url:prefix_url+'get_vod_streams',
                success:function (data) {
                    MovieHelper.setMovies('vod',data);
                },
                error:function(error){
                }
            }),
            $.ajax({
                method:'get',
                url:prefix_url+'get_series',
                success:function (data) {
                    MovieHelper.setMovies('series',data);
                },
                error:function(error){
                }
            })
        ).then(function () {
            LiveModel.insertMoviesToCategories();
            VodModel.insertMoviesToCategories();
            SeriesModel.insertMoviesToCategories();

            that.hideLoadImage();
            that.goToHomePage();
        })
        .fail(function () {
        })
    },
    hoverLicenseBtn:function(index){
        this.keys.focused_part='license_btn';
        this.keys.license_btn=index;
        $(this.license_btn_doms).removeClass('active');
        $(this.license_btn_doms[index]).addClass('active');
    },
    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "license_btn":
                if(keys.license_btn==0){ // if accepted
                    localStorage.setItem(storage_id+'terms_accepted',1);
                    $('#license-page').addClass('hide');
                    xtreme_user_page.init('loading')
                }else{
//                    tizen.application.getCurrentApplication().exit();
                        try{
                          window.close();
                        }catch(e){

                        }
                }
                break;
        }
    },
    handleMenuUpDown:function(increment){
        var keys=this.keys;
        if(!$('').hasClass('hide')){
            $('#license-page-texts-content').animate({ scrollTop: '+='+increment*30}, 10)
        }
        switch (keys.focused_part) {
            case "license_btn":
                break;
        }
    },
    handleMenuLeftRight:function(increment){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "license_btn":
                keys.license_btn+=increment;
                if(keys.license_btn<0)
                    keys.license_btn=0;
                if(keys.license_btn>1)
                    keys.license_btn=1;
                this.hoverLicenseBtn(keys.license_btn);
        }
    },
    HandleKey:function(e) {
        switch(e.keyCode){

            case tvKey.DOWN:
                this.handleMenuUpDown(1);
                break;
            case tvKey.UP:
                this.handleMenuUpDown(-1);
                break;
            case tvKey.LEFT:
                this.handleMenuLeftRight(-1);
                break;
            case tvKey.RIGHT:
                this.handleMenuLeftRight(1);
                break;
            case tvKey.ENTER:
                this.handleMenuClick();
                break;
            case tvKey.RETURN:
            case tvKey.RETURN_LG:case tvKey.ESC:
                if(this.keys.focused_part==="login_section"){
                    $('#turn-off-modal').modal('show');
                    this.keys.focused_part="turn_off_modal";
                    this.keys.turn_off_modal=0;
                    var buttons=$('#turn-off-modal').find('button');
                    $(buttons).removeClass('active');
                    $(buttons[0]).addClass('active');
                }
                else if(this.keys.focused_part==="turn_off_modal"){
                    $('#turn-off-modal').modal('hide');
                    this.keys.focused_part="login_section";
                }
                break;
        }
    }
}


