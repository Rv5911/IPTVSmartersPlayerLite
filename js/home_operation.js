"use strict";
var home_page={
    keys:{
        focused_part:"menu_selection", // or, "search part", "slider part", "sub menu part", "search_value"
        menu_selection:0, // the index of selected menu,
        top_info_selection:0
    },
    menu_doms:$('.home-menu-item'),
    top_info_doms:$('#home-page .top-info-icon'),

    initiated:false,
    init:function(){
        $('#app').show();
        $('#home-page').removeClass('hide');
        current_route='home-page';
        this.initiated=true;
    },
    hideLoadImage:function() {
        $('#loading-page').addClass('hide');
    },
    goToVideoCategoryPage:function(video_type,is_guide){
        if(video_type==='live'){
            if(!MovieHelper.loaded_data_live){
                    var that=this;
                    if(Object.keys(playlist).length>0){
                        if(playlist.type==='xtreme'){
                            var  prefix_url=playlist.url+'/player_api.php?username='+playlist.user_name+'&password='+playlist.password+'&action=';
                            showLoader(true);
                            $.when(
                                $.ajax({
                                    method:'get',
                                    url:prefix_url+'get_live_streams',
                                    success:function (data) {
                                    try{
                                        MovieHelper.setMovies('live',data);
                                        MovieHelper.loaded_data_live = true;
                                    }catch(e){

                                    }
                                    },
                                    error:function(error){
                                        that.hideLoadImage();
                                    }
                                }),
                                $.ajax({
                                    method:'get',
                                    url:prefix_url+'get_live_categories',
                                    success:function (data) {
                                        try{
                                            MovieHelper.setCategories('live',data);
                                        }catch(e){

                                        }
                                    },
                                    error:function(error){
                                        that.hideLoadImage();
                                    }
                                })
                            ).then(function () {
                                try{
                                    MovieHelper.insertMoviesToCategories('live');
                                    showLoader(false);
                                    $('#home-page').addClass('hide');
                                    channel_page.init();
                                }catch(e){
                                    showLoader(false);
                                    $('#home-page').addClass('hide');
                                    channel_page.init();
                                }


                            })
                            .fail(function (error) {
                                console.log(error);
                            })
                        }
                    }
                }else{
                $('#home-page').addClass('hide');
                channel_page.init();

            }
        }else if(video_type == 'vod'){
                if(!MovieHelper.loaded_data_movies){
                            var that=this;
                            if(Object.keys(playlist).length>0){
                                if(playlist.type==='xtreme'){
                                    var  prefix_url=playlist.url+'/player_api.php?username='+playlist.user_name+'&password='+playlist.password+'&action=';
                                    showLoader(true);
                                    $.when(

                                        $.ajax({
                                            method:'get',
                                            url:prefix_url+'get_vod_streams',
                                            success:function (data) {
                                              try{
//                                              if( typeof( data ) !== 'string' ) {
//                                                      alert("not string");
//                                                  }else{
//                                                  alert("string");
//                                                  }

                                                   MovieHelper.setMovies('vod',data);
                                                   MovieHelper.loaded_data_movies = true;
                                              }catch(e){
                                              }

                                            },
                                            error:function(error){
                                            }
                                        }),
                                        $.ajax({
                                            method:'get',
                                            url:prefix_url+'get_vod_categories',
                                            success:function (data) {
                                              try{
                                                  MovieHelper.setCategories('vod',data);
                                              }catch(e){
                                              }
                                            },
                                            error:function(error){
                                                that.hideLoadImage();
                                            }
                                        })
                                    ).then(function () {
                                      try{

                                          MovieHelper.insertMoviesToCategories('vod');
                                          showLoader(false);
                                          $('#home-page').addClass('hide');
                                          vod_series_page.init(video_type);
                                      }catch(e){
//                                      alert(e);
                                            showLoader(false);
                                            $('#home-page').addClass('hide');
                                            vod_series_page.init(video_type);
                                      }


                                    })
                                    .fail(function (error) {
                                        console.log(error);
                                    })
                                }
                            }
                        }else{
                    $('#home-page').addClass('hide');
                    vod_series_page.init(video_type);

                }
        }else if(video_type == 'series'){
              if(!MovieHelper.loaded_data_series){
                                  var that=this;
                                  if(Object.keys(playlist).length>0){
                                      if(playlist.type==='xtreme'){
                                          var  prefix_url=playlist.url+'/player_api.php?username='+playlist.user_name+'&password='+playlist.password+'&action=';
                                          showLoader(true);
                                          $.when(
                                              $.ajax({
                                                  method:'get',
                                                  url:prefix_url+'get_series',
                                                  success:function (data) {
                                                    try{
                                                      MovieHelper.setMovies('series',data);
                                                      MovieHelper.loaded_data_series = true;
                                                    }catch(e){

                                                    }
                                                  },
                                                  error:function(error){
                                                  }
                                              }),
                                              $.ajax({
                                                  method:'get',
                                                  url:prefix_url+'get_series_categories',
                                                  success:function (data) {
                                                      try{
                                                        MovieHelper.setCategories('series',data);
                                                      }catch(e){
                                                      }
                                                  },
                                                  error:function(error){
                                                      that.hideLoadImage();
                                                  }
                                              })
                                          ).then(function () {
                                              try{
                                                MovieHelper.insertMoviesToCategories('series');
                                                showLoader(false);
                                                $('#home-page').addClass('hide');
                                                vod_series_page.init(video_type);
                                              }catch(e){
                                                showLoader(false);
                                                $('#home-page').addClass('hide');
                                                vod_series_page.init(video_type);
                                              }

                                          })
                                          .fail(function (error) {
                                              console.log(error);
                                          })
                                      }
                                  }
                              }else{
                  $('#home-page').addClass('hide');
                  vod_series_page.init(video_type);

              }
        }

    },
    showLogOutModal:function(){
        // logout_page.init('home-page');
        turn_off_page.init(current_route);
    },
    showUserAccount:function(){
        $('#home-page').addClass('hide');
        user_account_page.init('home-page');
    },
    showUserListPage:function(){
        $('#home-page').addClass('hide');
        list_user_page.init(current_route);
    },
    showSetting:function(){
        $('#home-page').addClass('hide');
        setting_page.init('home-page');
    },

    hoverTopInfo:function(index){
        var keys=this.keys;
        keys.top_info_selection=index;
        keys.focused_part='top_info_selection';
        $(this.menu_doms).removeClass('active');
        $(this.top_info_doms).removeClass('active');
        $(this.top_info_doms[index]).addClass('active');
    },
    hoverMenuItem:function(index){
        var keys=this.keys;
        keys.focused_part="menu_selection";
        keys.menu_selection=index;
        $(this.top_info_doms).removeClass('active');
        $(this.menu_doms).removeClass('active');
        $(this.menu_doms[index]).addClass('active');
    },
    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                switch (keys.menu_selection) {
                    case 0:
                        this.goToVideoCategoryPage('live','');
                        break;
                    case 1:
                        this.goToVideoCategoryPage('vod','');
                        break;
                    case 2:
                        this.goToVideoCategoryPage('series','');
                        break;
                    case 3:
                        this.showUserAccount();
                        break;
                    case 4:
                        this.showSetting();
                        break;
                    case 5:
                        this.showUserListPage();
                        break;
                }
                break;
            case 'top_info_selection':
                $(this.top_info_doms[keys.top_info_selection]).find('img').trigger('click');
                break;
        }
    },
    handleMenusUpDown:function(increment) {
        var keys=this.keys;

//                console.log(keys.focused_part);

        switch (keys.focused_part) {
            case "menu_selection":
                if((keys.menu_selection==1 || keys.menu_selection==2) && increment>0){
                    keys.menu_selection+=2;
                    if(keys.menu_selection==4)
                        keys.menu_selection=5;
                }
                else if(keys.menu_selection>2 && increment<0){
                    keys.menu_selection-=2;
                    if(keys.menu_selection==3)
                        keys.menu_selection=2;
                }
                else if(keys.menu_selection<=2 && increment<0){
                    keys.top_info_selection=0;
                    this.hoverTopInfo(0);
                    return;
                }
                $(this.menu_doms).removeClass('active');
                $(this.menu_doms[keys.menu_selection]).addClass('active');
                break;
            case 'top_info_selection':
                if(increment>0)
                    this.hoverMenuItem(keys.menu_selection);
                break;
        }
    },
    handleMenuLeftRight:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                keys.menu_selection+=increment;
                if(keys.menu_selection<0){
                    keys.menu_selection=0;
                    return;
                }
                if(keys.menu_selection>=this.menu_doms.length){
                    keys.menu_selection=this.menu_doms.length-1;
                    return;
                }
                $(this.menu_doms).removeClass('active');
                $(this.menu_doms[keys.menu_selection]).addClass('active');
                break;
            case 'top_info_selection':
                keys.top_info_selection+=increment;
                if(keys.top_info_selection<0){
                    keys.top_info_selection=0;
                    return;
                }
                else if(keys.top_info_selection>=this.top_info_doms.length){
                    keys.top_info_selection=this.top_info_doms.length-1;
                    return;
                }
                this.hoverTopInfo(keys.top_info_selection);
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
                turn_off_page.init(current_route);
                break;
        }
    }
}
