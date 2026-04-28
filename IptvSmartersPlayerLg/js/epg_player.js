"use strict";
var epg_player_page={
    player:null,
    show_video_control:false,
    time_out:null,
    keys:{
        focused_part:"control_bar",  //operation_modal
        control_bar:0
    },
    forwardTimer:null,
    current_time:0,
    video_control_doms:[],
    current_programme:{},
    seek_timer:null,
    seek_interval_timer:null,
    channel_id:'',
    progressbar_timer:null,
    video_start_time:0,
    video_duration:0,

    init:function(movie,programme){
        var channel_id=movie.stream_id;
        this.channel_id=channel_id;
        var keys=this.keys;
        this.current_programme=programme;
        this.current_time=0;
        this.video_start_time=0;
        this.video_duration=0;

        $('#epg-player-page').removeClass('hide');
        this.video_control_doms=$('#epg-player-video-controls-container .video-control-icon');
        $(this.video_control_doms).removeClass('active');
        $(this.video_control_doms[2]).addClass('active');

        var element=$(this.video_control_doms[2]).find('i');
        $(element).attr('class','fa fa-pause');
        keys.control_bar=2;
        keys.focused_part='control_bar';

        $('#epg-channel-title').html(programme.title);
        var temp=LiveModel.getProgrammeVideoUrl(channel_id,programme);
        var duration=temp.duration;
        var url=temp.url;
        $('#epg-player-video-duration').text(media_player.formatTime(duration*60));
        $('#epg-player-current-time').text('00:00');
        $('#epg-player-progress').css({width:0});
        var that=this;
        try{
            media_player.init("epg-player-video","epg-player-page");
            media_player.playAsync(url);
        }catch (e) {
        }
        this.showControlBar(true);
        this.timeOut=setTimeout(function(){
            that.hideControlBar();
        },5000);
        current_route="epg-player-page";
    },
    Exit:function(){
        current_route='catch-up-detail';
        try{
            media_player.close();
        }catch(e){
            console.log(e);
        }
        clearTimeout(this.progressbar_timer);
        $('#'+media_player.parent_id).find('.video-error').hide();
        $('#'+media_player.parent_id).find('.subtitle-container').text('');
        $('#epg-player-page').addClass('hide');
    },
    goBack:function(){
        var keys=this.keys;
        if(this.show_video_control){
            this.hideControlBar();
        }else{
            if(keys.focused_part==="control_bar"){
                this.Exit();
                $('#catchup-detail-page').removeClass('hide');
            }
        }
    },
    playPauseVideo:function(){
        this.showControlBar(false);
        var icons=this.video_control_doms;
        var element=$(icons[2]).find('i');
        var player_state=media_player.state;
        if(player_state===media_player.STATES.PLAYING){
            try{
                media_player.pause();
                $(element).attr('class','fa fa-play');
            }catch(e){
            }
        }else{
            try{
                media_player.play();
                $(element).attr('class','fa fa-pause');
            }catch(e){
            }
        }
    },
    seekTo:function(step){
        clearTimeout(this.seek_timer);
        if(this.current_time===0)
            this.current_time=media_player.current_time/1000;
        try{
            var duration=webapis.avplay.getDuration()/1000;
            var newTime = this.current_time + step;
            if(newTime<0)
                newTime=0;
            if(newTime>=duration)
                newTime=duration;
            this.current_time=newTime;
            webapis.avplay.seekTo(newTime*1000);
            if (duration > 0) {
                $('#'+media_player.parent_id).find('.video-current-time').html(media_player.formatTime(newTime));
            }
            $('#epg-player-progress').css({width:newTime/duration+'%'})
        }catch (e) {
        }
        if(media_player.state===media_player.STATES.PLAYING){
            try{
                media_player.pause();
            }catch(e){
            }
        }
        var that=this;
        this.seek_timer=setTimeout(function () {
            try{
                webapis.avplay.play();
                media_player.state=media_player.STATES.PLAYING;
            }catch(e){
            }
        },300)
    },
    showControlBar:function(move_focus){
        $('#epg-player-video-controls-container').slideDown();
        $('#epg-channel-title').slideDown();
        this.show_video_control=true;
        var that=this;
        var keys=this.keys;
        if(move_focus){
            keys.focused_part='control_bar';
            keys.prev_focus='control_bar';
            keys.control_bar=2;
            $(this.video_control_doms).removeClass('active');
            $(this.video_control_doms[2]).addClass('active');
            $('#player-seasons-container').removeClass('expanded');
        }
        clearTimeout(this.timeOut)
        this.timeOut=setTimeout(function(){
            that.hideControlBar();
        },5000);
    },
    hideControlBar:function(){
        $('#epg-player-video-controls-container').slideUp();
        $('#epg-channel-title').slideUp();
        this.show_video_control=false;
    },
    showVideoInfo:function(){
        var movie=this.current_movie;
        this.hideControlBar();
        video_info_page.init('epg-player-page',movie, this.movie_type);
    },
    showVideoSettings:function(){
        video_settings_page.init('epg-player-page');
    },
    hoverVideoControl:function(index){
        var keys=this.keys;
        this.showControlBar(false);
        keys.focused_part='control_bar';
        keys.control_bar=index;
        $(this.video_control_doms).removeClass('active');
        $(this.video_control_doms[index]).addClass('active');
        $('#vod-series-progress-container .rangeslider').removeClass('active');
    },
    handleMenuClick:function(){
        var keys=this.keys;
        if(keys.focused_part==="control_bar") {
            if (this.show_video_control)
                $(this.video_control_doms[keys.control_bar]).find('i').trigger('click');
            this.showControlBar(false);
        }
        else if(keys.focused_part==='slider' && !this.show_video_control){
            this.showControlBar(true);
        }
        else if(keys.focused_part==='resume_bar'){
            $('#video-resume-modal').hide();
            keys.focused_part=keys.prev_focus;
            if(keys.resume_bar==1){
                try{
                    var current_time=webapis.avplay.getCurrentTime();
                    if(current_time<this.resume_time){
                        webapis.avplay.seekTo(this.resume_time)
                    }
                }catch (e) {
                }
            }
        }
    },
    handleMenuLeftRight:function(increment){
        var keys=this.keys;
        if(this.show_video_control){
            this.showControlBar(false);
            if(keys.focused_part==="control_bar"){
                keys.control_bar+=increment;
                if(keys.control_bar<0)
                    keys.control_bar=0;
                if(keys.control_bar>=this.video_control_doms.length)
                    keys.control_bar=this.video_control_doms.length-1;
                $(this.video_control_doms).removeClass('active');
                $(this.video_control_doms[keys.control_bar]).addClass('active');
            }
            if(keys.focused_part==='slider'){
                this.seekTo(30*increment);
            }
        }else{
            if(keys.focused_part==='control_bar' || keys.focused_part==='slider'){
                this.showControlBar(false);
                $(this.video_control_doms).removeClass('active');
                keys.focused_part='slider';
                keys.prev_focus='slider';
                $('#vod-series-progress-container .rangeslider').addClass('active');
                this.seekTo(increment*30);
            }
            if(keys.focused_part==='resume_bar'){
                var resume_bar_doms=this.resume_bar_doms;
                keys.resume_bar+=increment;
                if(keys.resume_bar<0)
                    keys.resume_bar=resume_bar_doms.length-1;
                if(keys.resume_bar>=resume_bar_doms.length)
                    keys.resume_bar=0;
                $(resume_bar_doms).removeClass('active');
                $(resume_bar_doms[keys.resume_bar]).addClass('active');
                clearTimeout(this.resume_timer);
                this.resume_timer=setTimeout(function () {
                    $('#video-resume-modal').hide();
                    keys.focused_part=keys.prev_focus;
                },15000)
            }
        }

    },
    handleMenuUpDown:function(increment){
        var keys=this.keys;
        if((keys.focused_part==="control_bar" || keys.focused_part==='slider') && !this.show_video_control) {
            this.showControlBar(true);
        }
        if(this.show_video_control){
            this.showControlBar(false);
            $(this.video_control_doms).removeClass('active');
            switch (keys.focused_part) {
                case 'slider':
                    if(increment>0){
                        keys.focused_part='control_bar';
                        keys.prev_focus='control_bar';
                        keys.control_bar=2;
                        $(this.video_control_doms).removeClass('active');
                        $(this.video_control_doms[2]).addClass('active');
                        $('#vod-series-progress-container .rangeslider').removeClass('active');
                    }
                    break;
            }
        }
    },

    HandleKey:function (e) {
        switch (e.keyCode) {
            case tvKey.MediaFastForward:
            case tvKey.RIGHT:
                this.handleMenuLeftRight(1)
                break;
            case tvKey.MediaRewind:
            case tvKey.LEFT:
                this.handleMenuLeftRight(-1)
                break;
            case tvKey.DOWN:
                this.handleMenuUpDown(1);
                break;
            case tvKey.UP:
                this.handleMenuUpDown(-1);
                break;
            case tvKey.MediaPause:
                this.playPauseVideo();
                break;
            case tvKey.MediaPlay:
                this.playPauseVideo();
                break;
            case tvKey.MediaPlayPause:
                this.playPauseVideo();
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
