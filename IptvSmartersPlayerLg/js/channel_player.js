"use strict";
var channel_player_page={
    current_channel_index:0,
    hover_channel_id:0,
    progressbar_timer:null,
    video_control_timer:null,
    show_video_control:false,
    channel_num:0,
    keys:{
        focused_part:"video_control",//"right_screen_part", search_selection
        video_control:0,
        top_selection:0
    },
    video_control_doms:[],
    top_icons:[],
    prev_route:'',
    current_movie:[],
    prefix:'',
    retryingTimeout:null,
    back_button_pressed: false,
    retrying:0,
    max_retry:5,
    init:function (prev_route, current_movie) {
        this.retrying = 0;
        this.back_button_pressed = false;
        this.current_movie=current_movie;
        this.prev_route=prev_route;
        this.keys.top_selection=0;
        $('.current-video-title').text(current_movie.name);
        $('.full-screen-logo').attr('src',current_movie.stream_icon);
        if(prev_route==='channel-page'){
            this.video_control_doms=$('#channel-page .video-control-icon');
            this.top_icons=$('#channel-page .video-top-item');
            $('#channel-page-right-part-wrapper').addClass('expanded');
            setTimeout(function () {
                try{
//                    media_player.setDisplayArea()
                }catch (e) {
                }
            },200);
        }else{
        }
        current_route="channel-player-page";
        this.hoverVideoControl(1);
        $('.current-video-title').text(current_movie.name);
        this.showVideoControl();
        this.changeProgramInfo();
    },
    goBack:function(){
        clearInterval(this.progressbar_timer);
        clearTimeout(this.video_control_timer);
        var keys=this.keys;
        switch (keys.focused_part) {
            case "video_control":
            case "top_selection":
                if(this.show_video_control)
                    this.hideVideoControl();
                else{
                    this.goToPrevPage();
                }
                break;
        }
    },
    goToPrevPage:function(){
        current_route=this.prev_route;
        clearTimeout(this.video_control_timer);
        clearInterval(this.progressbar_timer);
//        console.log("abc");
        this.hideVideoControl();
        if(this.prev_route==='channel-page'){
            $('#channel-page-right-part-wrapper').removeClass('expanded');
            setTimeout(function () {
//                media_player.setDisplayArea();
            },200);
            channel_page.hoverChannelMenu(channel_page.keys.channel_selection);
        }else if(this.prev_route==='guide-page'){
            $('#guide-page').removeClass('hide');
            try{
                media_player.init("guide-page-video","guide-page");
//                media_player.setDisplayArea();
            }catch (e) {
            }
            $(guide_page.channel_dom_items).removeClass('active');
            $(guide_page.channel_dom_items[guide_page.hover_channel_index]).addClass('active');
            // Vertical scroll move
            moveScrollPosition($('#guide-channels-container'),$(guide_page.channel_dom_items[guide_page.hover_channel_index]),'vertical',false);  //move channel scroll bar
            moveScrollPosition($('#guide-programmes-container'),$(guide_page.programme_wrappers[guide_page.hover_channel_index]),'vertical',false);  // move channel programme wrapper

            // Horizontal Scroll move
            guide_page.getCurrentProgramIndex(guide_page.category_index,guide_page.hover_channel_index);  // get current programme index and add active class.
            $('.guide-programme-item-wrapper').removeClass('active');
            $(guide_page.programme_wrappers).css({'border':'none'})
            var dom=guide_page.getProgrammeElement();
            if(dom)
                $(dom).addClass('active');
            guide_page.changeHorizontalScroll();
            guide_page.changeCurrentProgramInfo();
        }
    },
    showVideoControl:function(){

        var that=this;
        clearTimeout(this.video_control_timer);
        $('.full-screen-information').slideDown();
        $('.video-player-top-part').slideDown();
        this.show_video_control=true;
        this.video_control_timer=setTimeout(function(){
            that.hideVideoControl();
        },5000)
    },
    hideVideoControl:function(){


        $('.full-screen-information').slideUp();
        $('.video-player-top-part').slideUp();
        this.show_video_control=false;
    },
    showMovie: function () {
        
        console.log("001");
        var url;
        var keys=this.keys;
        var current_movie=this.current_movie;
        $('.current-video-title').text(current_movie.name);
        var movie_id=current_movie.stream_id;
        $('.full-screen-logo').attr('src',current_movie.stream_icon);
        if(settings.playlist_type==="xtreme")
            url=getMovieUrl(movie_id,'live','ts');
        else if(settings.playlist_type==="type1")
            url=current_movie.url;



        try {
      
            $('.video-error').hide();
            $('#channel-page-video').attr('src', url);
            var videoPlayer = $("#channel-page-video")[0];
            videoPlayer.load();
            videoPlayer.onerror = function() {
                if(!channel_player_page.back_button_pressed){
                    channel_player_page.retrying++;
                    if(channel_player_page.retrying>channel_player_page.max_retry){
                        $('.video-loader').hide();
                        $('.video-error').show();
                    }else{
                        $('#toast-body').css("background","#000000bf");
                        showToast('Playback error','reconnects in 3s ('+channel_player_page.retrying+'/'+channel_player_page.max_retry+')');

                        channel_player_page.retryingTimeout = setTimeout(function () {

                                    channel_player_page.showMovie("retry");
                        },3000);
                    }
                }

            }
            videoPlayer.onloadstart = function(){
                  $('.video-loader').show();
                  $('.video-error').hide();
            };
            videoPlayer.onwaiting = function(){
                  $('.video-loader').show();
                  $('.video-error').hide();
            };
            videoPlayer.onplaying = function(){
             channel_player_page.retrying = 0;
             $('.video-loader').hide();
             $('.video-error').hide();
            };
            videoPlayer.onended = function(){
              $('.video-loader').hide();
              $('.video-error').show();
            };
        }catch (e) {
            console.log(e);
        }




        MovieHelper.addToWatchList('live',current_movie);
        channel_page.updateRecentWatchChannelCount();




        var icons=this.video_control_doms;
        var element=$(icons[1]).find('i');
        $(element).removeClass('fa-play');
        $(element).addClass('fa-pause');
    },
    updateProgramInfo:function(){

        var programmes;
        var elements=$('.full-screen-progress-bar span');
        if(this.prev_route==='channel-page')
            programmes=channel_page.programmes;
        var temps=LiveModel.getNextProgrammes(programmes);
        var next_programmes=temps.programmes;
        var next_program='No Information',current_program='No Information';
        var current_programme_time='',next_programme_time='';
        var next_programme_item;
        if(typeof next_programmes[0]!='undefined'){
            if(temps.current_program_exist){
                current_program=getAtob(next_programmes[0].title);
                var start=getLocalChannelTime(next_programmes[0].start);
                var stop=getLocalChannelTime(next_programmes[0].stop);
                current_programme_time=start.format('hh:mm A')+' - '+stop.format('hh:mm A');
                var current_minute=parseInt(new Date().getTime()/60/1000);
                var start_minute=getMinute(start);
                var stop_minute=getMinute(stop);
                var progress_width=(current_minute-start_minute)/(stop_minute-start_minute)*100;
                $(elements).css({width:progress_width+'%'});
                if(typeof next_programmes[1]!='undefined')
                    next_programme_item=next_programmes[1];
            }
            else
                next_programme_item=next_programmes[0];
        }else{
            $(elements).css({width:0});
        }
        if(typeof next_programme_item!='undefined'){
            next_program=getAtob(next_programme_item.title);
            next_programme_time=getLocalChannelTime(next_programme_item.start).format('hh:mm A')+' - '+getLocalChannelTime(next_programme_item.stop).format('hh:mm A');
        }


        $('.full-screen-current-programme').text("Now: "+current_program);
        $('.full-screen-current-programme-time').text(current_programme_time);
        $('.full-screen-next-programme').text("Next: "+next_program);
        $('.full-screen-next-programme-time').text(next_programme_time);
        if(!temps.current_program_exist && programmes.length>0)
            channel_page.getEpgProgrammes();
    },
    changeProgramInfo:function(){
        var that=this;
        clearInterval(this.progressbar_timer);
        this.updateProgramInfo();
        this.progressbar_timer=setInterval(function(){
            that.updateProgramInfo();
        },60000);
    },
    showNextChannel:function(increment){
        var keys;
        var menus;

        channel_page.retrying = 6;

        clearTimeout(channel_page.retryingTimeout);

        channel_player_page.retrying = 0;

        clearTimeout(channel_player_page.retryingTimeout);



        if(this.prev_route==='channel-page'){
            keys=channel_page.keys
            menus=channel_page.channel_doms
            var prev_channel_selection=keys.channel_selection;
            keys.channel_selection+=increment;
            if(keys.channel_selection<0 || keys.channel_selection>=menus.length){
                keys.channel_selection=prev_channel_selection;
                return;
            }
            this.current_movie=channel_page.movies[keys.channel_selection];
            channel_page.getEpgProgrammes();
        }
        else if(this.prev_route==='guide-page'){
            guide_page.hover_channel_index+=increment;
            if(guide_page.hover_channel_index<0){
                guide_page.hover_channel_index=0;
                return;
            }
            if(guide_page.hover_channel_index>=guide_page.channel_dom_items.length){
                guide_page.hover_channel_index=guide_page.channel_dom_items.length-1;
                return;
            }
            guide_page.current_channel_index=guide_page.hover_channel_index;
            this.current_movie=guide_page.category.movies[guide_page.current_channel_index];
        }
        console.log("a:"+keys.channel_selection);
        channel_player_page.retrying = 0;
        this.showMovie();



        $('.channel-play-state').remove();

        var html=
            '<span class="channel-play-state">\n' +
            '   <i class="fa fa-play"></i>\n' +
            '</span>'


                  var channel_doms=$('#channel-menus-container .channel-menu-item');


         $(html).insertAfter($(channel_doms[keys.channel_selection]).find('.channel-icon'));


        this.showVideoControl();
    },
    playPauseVideo:function(){
        this.showVideoControl();
        var icons=this.video_control_doms;
        var element=$(icons[1]).find('i');
        var video = $('#channel-page-video')[0];
        try{
          if (video.paused || video.ended) {
            video.play();
             $(element).removeClass('fa-play');
             $(element).addClass('fa-pause');
          } else {
            video.pause();
             $(element).removeClass('fa-pause');
             $(element).addClass('fa-play');
          }
        }catch(e){
        }

    },
    showVideoSettings:function(){
        video_settings_page.init('channel-player-page');
    },
    hoverVideoControl:function(index){
        var keys=this.keys;

        this.showVideoControl();
        keys.focused_part='video_control';
        keys.video_control=index;
        $(this.top_icons).removeClass('active');
        $(this.video_control_doms).removeClass('active');
        $(this.video_control_doms[index]).addClass('active');
    },
    hoverTopIcon:function(index){

        $(this.video_control_doms).removeClass('active');
        $(this.top_icons).removeClass('active');
        $(this.top_icons[index]).addClass('active');
        this.keys.focused_part='top_selection';
        this.keys.top_selection=index;
        this.showVideoControl();
    },
    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "video_control":
                if(this.show_video_control)
                    $(this.video_control_doms[keys.video_control]).find('i').trigger('click');
                this.showVideoControl();
                break;
            case "top_selection":

                if(this.show_video_control){
                    $(this.top_icons[keys.top_selection]).trigger('click');
                }else{
                    this.showVideoControl();
                }
        }
    },
    handleMenusUpDown:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "video_control":
                if(this.show_video_control && increment<0){
                    this.hoverTopIcon(keys.top_selection);
                }else{

                    this.showNextChannel(-1*increment);
                }
                break;
            case "top_selection":
                if(increment>0)
                    this.hoverVideoControl(keys.video_control);
        }
    },
    handleMenuLeftRight:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "video_control":
                keys.video_control+=increment;
                if(keys.video_control<0)
                    keys.video_control=0;
                if(keys.video_control>=this.video_control_doms.length)
                    keys.video_control=this.video_control_doms.length-1;
                this.hoverVideoControl(keys.video_control);
                break;
            case "top_selection":
                keys.top_selection+=increment;
                if(keys.top_selection<0){
                    keys.top_selection=0;
                    return;
                }
                if(keys.top_selection>=this.top_icons.length){
                    keys.top_selection=this.top_icons.length-1;
                    return;
                }
                this.hoverTopIcon(keys.top_selection);
                break;
        }
    },
    HandleKey:function(e) {
        switch (e.keyCode) {
            case tvKey.RIGHT:
                this.handleMenuLeftRight(1)
                break;
            case tvKey.LEFT:
                this.handleMenuLeftRight(-1)
                break;
            case tvKey.DOWN:
                this.handleMenusUpDown(1);
                break;
            case tvKey.UP:
                this.handleMenusUpDown(-1);
                break;
            case tvKey.ENTER:
                this.handleMenuClick();
                break;
            case tvKey.CH_UP:
                this.showNextChannel(1);
                break;
            case tvKey.CH_DOWN:
                this.showNextChannel(-1);
                break;
            case tvKey.RETURN:
            case tvKey.RETURN_LG:case tvKey.ESC:
                this.goBack();
                break;
        }
    }
}
