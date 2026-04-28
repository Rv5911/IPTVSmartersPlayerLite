"use strict";
var vod_series_player_page={
    player:null,
    back_url:'vod-series-page',
    show_control:false,
    timeOut:null,
    retryingTimeout:null,
    back_button_pressed: false,
    has_episodes:false,
    keys:{
        focused_part:"control_bar",  //operation_modal
        control_bar:0,
        prev_focus:'',
        resume_bar:0,
        top_selection:0
    },
    current_subtitle_index:-1,
    current_audio_track_index:-1,
    subtitle_audio_menus:[],
    forwardTimer:null,
    current_time:0,
    show_subtitle:false,
    show_audio_track:false,
    video_control_doms:$('#vod-series-video-controls-container .video-control-icon'),
    current_movie:{},
    resume_time:0,
    resume_timer:null,
    resume_bar_doms:$('#video-resume-modal .resume-action-btn'),
    seek_timer:null,
    seek_interval_timer:null,
    movie_type:'',
    VIDEO_index:-2,
    AUDIO_index:-2,
    SUBTITLE_index:-2,
    top_icons:$('#vod-series-player-page .video-top-item'),
    slider_element:$('#vod-series-player-page .video-progress-bar-slider')[0],
    video_duration:0,
    last_key_time:0,
    retrying:0,
    max_retry:5,
    init:function(movie,movie_type,back_url ){
        this.movie_type=movie_type;
        this.resume_bar_doms=$('#video-resume-modal .resume-action-btn');
        var keys=this.keys;
        this.current_movie=movie;
        this.current_time=0;
        this.retrying = 0;
        this.back_button_pressed = false;
        $('#vod-series-player-page').removeClass('hide');
        this.show_control=true;
        this.showControlBar(true);
        $(this.video_control_doms).removeClass('active');
        $(this.video_control_doms[1]).addClass('active');

        var element=$(this.video_control_doms[1]).find('i');
        $(element).attr('class','fa fa-pause');
        $(element).data('action_type','pause');

        keys.control_bar=1;
        keys.focused_part='control_bar';
        keys.prev_focus='control_bar';
        this.back_url=back_url;
        current_route="vod-series-player-video";
        this.current_subtitle_index=-1;
        this.current_audio_track_index=-1;
        this.show_subtitle=false;
        this.VIDEO_index=-2;
        this.AUDIO_index=-2;
        this.SUBTITLE_index=-2;
        this.showMovie();
    },
    goBack:function(){
        $('.modal').modal('hide');
        var keys=this.keys;
        switch (keys.focused_part) {
            case "control_bar":
                if(this.show_control) {
                    this.hideControlBar();
                }else{
                    this.goToPrevPage();
                }
                break;
            case "top_selection":
                if(this.show_control) {
                    this.hideControlBar();
                }else{
                    this.goToPrevPage();
                }
                break;
            case "slider_selection":
                if(this.show_control) {
                    this.hideControlBar();
                }else{
                    this.goToPrevPage();
                }
                break;
            case "resume_bar":
                $('#video-resume-modal').hide();
                keys.focused_part=keys.prev_focus;
                clearTimeout(this.resume_timer);
                break;
        }
    },
    goToPrevPage:function(){
        this.saveVideoTime();
        current_route=this.back_url;


        try{

            vod_series_player_page.retrying = 6;
            vod_series_player_page.back_button_pressed = true;

            clearTimeout(vod_series_player_page.retryingTimeout);
            $('.video-error').css("display","none");
            var videoPlayer = $("#vod-series-player-video")[0];
            videoPlayer.pause();
            $('#vod-series-player-video').attr('src', '');
            videoPlayer.load();
        }catch(e){
        }

        $('.subtitle-container').text('');

        $('#vod-series-player-page').addClass('hide');

        if(this.back_url==="vod-series-summary-page"){

            current_route='vod-series-summary-page';
            $('#series-summary-page').removeClass('hide');
            if(vod_series_summary_page.keys.focused_part==='episode_selection'){
                vod_series_summary_page.hoverEpisodeItem(vod_series_summary_page.keys.episode_selection);;
            }
        }
    },
    resumePlay:function(){
        var current_time=0;
        if(this.movie_type==='series'){
            var keys=vod_series_summary_page.keys;
            var season_index, episode_index;
            var series_video_times=vod_series_summary_page.series_video_times;
            if(keys.focused_part==='action_btn'){
                season_index=vod_series_summary_page.last_season_index;
                episode_index=vod_series_summary_page.current_episode_index;
            }else{
                season_index=vod_series_summary_page.current_season_index;
                episode_index=keys.episode_selection;
            }
            season_index=season_index.toString();
            episode_index=episode_index.toString();
            if(typeof series_video_times[season_index]!="undefined" && typeof series_video_times[season_index][episode_index]!="undefined"){
                current_time=series_video_times[season_index][episode_index];
            }
        }else{
            var saved_video_times=VodModel.saved_video_times;
            var movie_id=this.current_movie.stream_id.toString();
            if(typeof saved_video_times[movie_id]!='undefined'){
                current_time=saved_video_times[movie_id];
            }
        }
        if(current_time>0){
            try{
                webapis.avplay.seekTo(current_time);
                media_player.state=media_player.STATES.PLAYING;
                $('#'+media_player.parent_id).find('.video-progress-bar-slider').val(current_time/1000).change();
                $('#'+media_player.parent_id).find('.video-current-time').html(media_player.formatTime(current_time));
            }catch (e) {
            }
        }
    },
    showMovie:function(){

        this.video_duration=0;
        this.current_time=0;
        var movie=this.current_movie;
        var movie_type=this.movie_type;
        var slider_element=this.slider_element;

        $('#vod-series-player-page').find('.video-current-time').text("00:00");
        $('#vod-series-player-page').find('.video-total-time').text("00:00");
        clearTimeout(this.resume_timer);
        var url;
        if(movie_type==="vod"){
            if(settings.playlist_type==="xtreme")
                url=getMovieUrl(movie.stream_id,'vod',movie.container_extension);
            else if(settings.playlist_type==="type1")
                url=movie.url;
            $('#vod-series-video-title').html(movie.name);
        }
        else{
            if(settings.playlist_type==="xtreme")
                url=getMovieUrl(movie.id,'series',movie.container_extension)
            else if(settings.playlist_type==="type1")
                url=movie.url;
            $('#vod-series-video-title').html(movie.title);
        }
        var that=this;

        try{
            $('.video-error').hide();
            $('#vod-series-player-video').attr('src', url);
 
            $(".video-progress-bar-slider span").css("width", "0%");

            var videoPlayer = $("#vod-series-player-video")[0];

            videoPlayer.currentTime = this.resume_time;
            videoPlayer.load();
            videoPlayer.onerror = function() {
                if(!vod_series_player_page.back_button_pressed){
                        vod_series_player_page.retrying++;
                            if(vod_series_player_page.retrying>vod_series_player_page.max_retry){
                              $('.video-loader').hide();
                              $('.video-error').show();
                            }else{
                                 $('#toast-body').css("background","#000000bf");
                                 showToast('Playback error','reconnects in 3s ('+vod_series_player_page.retrying+'/'+vod_series_player_page.max_retry+')');

                                vod_series_player_page.resume_time = videoPlayer.currentTime;

                                 vod_series_player_page.retryingTimeout = setTimeout(function () {

                                             vod_series_player_page.showMovie();
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

                vod_series_player_page.retrying = 0;
             $('.video-loader').hide();
             $('.video-error').hide();
            };
            videoPlayer.ontimeupdate = function(){
              var percentage = ( videoPlayer.currentTime / videoPlayer.duration ) * 100;
              $(".video-progress-bar-slider span").css("width", percentage+"%");
              if(videoPlayer.currentTime>0){
                      $('.video-current-time').html(vod_series_player_page.formatTime(videoPlayer.currentTime));
              }
              if(videoPlayer.duration>0){
                      $('.video-total-time').text(vod_series_player_page.formatTime(videoPlayer.duration));
              }
            };
        }catch (e) {

        }

        this.timeOut=setTimeout(function(){
            that.hideControlBar();
        },5000);
    },
    showResumeBar:function(){
        var keys=this.keys;
        if(this.resume_time>0){
            console.log(this.resume_time);
            var resume_time_format=media_player.formatTime(this.resume_time/1000);
            $('#vod-resume-time').text(resume_time_format);
            $('#video-resume-modal').show();
            this.hideControlBar();
            clearTimeout(this.resume_timer);
            keys.focused_part='resume_bar';
            keys.resume_bar=0;
            $(this.resume_bar_doms).removeClass('active');
            $(this.resume_bar_doms[0]).addClass('active');
            this.resume_timer=setTimeout(function () {
                $('#video-resume-modal').hide();
                keys.focused_part=keys.prev_focus;
            },15000)
        }
    },
    saveVideoTime:function(){
        try{

            var media_player = $('#vod-series-player-video')[0];
            var current_time = media_player.currentTime;
            var duration = media_player.duration;

            var movie=this.current_movie;

            if(current_time>0){

                    if(this.movie_type==='vod'){
                        MovieHelper.saveVideoTime('vod',movie.stream_id,current_time);
                        MovieHelper.addToWatchList('vod',movie);
                        $(vod_series_summary_page.action_btn_doms[0]).find('.vod-series-play-btn-text').text('Resume');
                    }
                    if(this.movie_type==='series'){
                        if(vod_series_summary_page.keys.focused_part==='episode_selection'){
                            SeriesModel.saveVideoTime(current_series.series_id,vod_series_summary_page.current_season_index,vod_series_summary_page.keys.episode_selection,current_time);
                            vod_series_summary_page.last_season_index=vod_series_summary_page.current_season_index;
                            vod_series_summary_page.last_episode_index=vod_series_summary_page.keys.episode_selection;
                        }else{
                            SeriesModel.saveVideoTime(current_series.series_id,vod_series_summary_page.last_season_index,vod_series_summary_page.current_episode_index,current_time);
                            vod_series_summary_page.last_episode_index=vod_series_summary_page.current_episode_index;
                        }
                        vod_series_summary_page.series_video_times=SeriesModel.saved_video_times[current_series.series_id.toString()];
                        $(vod_series_summary_page.action_btn_doms[0]).find('.vod-series-play-btn-text').text('Resume - S'+(vod_series_summary_page.last_season_index+1)+':E'+(vod_series_summary_page.last_episode_index+1));
                        MovieHelper.addToWatchList('series',current_series);
                    }
                    vod_series_summary_page.changeResumeBarProgressWidth();
                    if(this.movie_type==='series'){
                         vod_series_summary_page.renderEpisodes();
                    }
            }
        }catch (e) {
        }
    },
    playPauseVideo:function(){
        this.showControlBar(false);
        var icons=this.video_control_doms;
        var element=$(icons[1]).find('i');
        var video = $('#vod-series-player-video')[0];
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
    seekTo:function(step){

        var media_player = $('#vod-series-player-video')[0];

        var percentage = ( media_player.currentTime / media_player.duration ) * 100;

        var duration, newTime;

        newTime = media_player.currentTime + step;

        if(newTime<0){
        newTime = 0;
        }
        if(newTime>=media_player.duration){
            this.showNextVideo(1);
            return;
        }

        $('.video-current-time').html(this.formatTime(newTime));
        $('.video-total-time').text(this.formatTime(media_player.duration));

        this.current_time=newTime;
        clearTimeout(this.seek_timer);
        this.playPauseVideo();

        $('.video-loader').show();
        media_player.currentTime = (newTime);

        this.seek_timer=setTimeout(function () {
                try{
                    media_player.play();
                }catch(e){
                }
        },1000);
    }
    ,formatTime:function(seconds) {
        var hh = Math.floor(seconds / 3600),
            mm = Math.floor(seconds / 60) % 60,
            ss = Math.floor(seconds) % 60;
        return (hh ? (hh < 10 ? "0" : "") + hh + ":" : "") +
            ((mm < 10) ? "0" : "") + mm + ":" +
            ((ss < 10) ? "0" : "") + ss;
    },
    showNextVideo:function(increment){
        this.saveVideoTime();
        this.resume_time=0;
        try{
            media_player.close();
        }catch(e){
        }
        if(this.back_url==='vod-series-summary-page'){
            var keys=vod_series_summary_page.keys;
            if(this.movie_type==='series'){
                if(keys.focused_part==='episode_selection'){
                    keys.episode_selection+=increment;
                    if(keys.episode_selection<0){
                        keys.episode_selection=0;
                    }
                    if(keys.episode_selection>=vod_series_summary_page.episodes.length){
                        keys.episode_selection=0;
                    }
                    this.current_movie=vod_series_summary_page.episodes[keys.episode_selection];
                    this.showMovie();
                    this.showControlBar(false);
                }else if(keys.focused_part==='action_btn'){
                    var current_episode_index=vod_series_summary_page.current_episode_index;
                    current_episode_index+=increment;
                    if(current_episode_index<0){
                        current_episode_index=0;
                    }
                    var last_season_index=vod_series_summary_page.last_season_index;
                    var episodes=current_series.seasons[last_season_index].episodes;
                    if(current_episode_index>=episodes.length){
                        current_episode_index=0;
                    }
                    vod_series_summary_page.current_episode_index=current_episode_index;
                    this.current_movie=episodes[current_episode_index];
                    this.showMovie();
                    this.showControlBar(false);
                }
            }else{
                var movies=vod_series_page.movies;
                vod_series_page.current_movie_index+=increment;
                if(vod_series_page.current_movie_index<0){
                    vod_series_page.current_movie_index=0;
                }
                if(vod_series_page.current_movie_index>=vod_series_page.movies.length){
                    vod_series_page.current_movie_index=0;
                }
                this.current_movie=movies[vod_series_page.current_movie_index];
                this.showMovie();
            }
        }
    },
    showControlBar:function(move_focus){
        $('#vod-series-video-controls-container').slideDown();
        $('#vod-series-video-top-part').slideDown();
        this.show_control=true;
        var that=this;
        var keys=this.keys;
        if(move_focus){
            keys.prev_focus='control_bar';
            this.hoverVideoControl(1);
        }
        clearTimeout(this.timeOut)
        this.timeOut=setTimeout(function(){
            that.hideControlBar();
        },5000);
    },
    hideControlBar:function(){
        $('#vod-series-video-controls-container').slideUp();
        $('#vod-series-video-top-part').slideUp();
        this.show_control=false;
    },
    showVideoSettings:function(){
        this.hideControlBar();
        video_settings_page.init('vod-series-player-video');
    },
    rePlayVideo:function(){
        vod_series_player_page.resume_time = 0;
        this.showMovie();
    },
    removeAllActiveClass:function(){
        $(this.video_control_doms).removeClass('active');
        $(this.top_icons).removeClass('active');
        $(this.slider_element).removeClass('active');
    },
    hoverTopIcon:function(index){
        var keys=this.keys;
        keys.focused_part='top_selection';
        this.removeAllActiveClass();
        $(this.top_icons[index]).addClass('active');
        this.showControlBar(false);
    },
    hoverMovieSlider:function(){
        this.removeAllActiveClass();
        $(this.slider_element).addClass('active');
        this.keys.focused_part='slider_selection';
    },
    hoverVideoControl:function(index){
        var keys=this.keys;
        this.showControlBar(false);
        keys.focused_part='control_bar';
        keys.control_bar=index;
        this.removeAllActiveClass();
        $(this.video_control_doms[index]).addClass('active');
    },
    handleMenuClick:function(){
        var keys=this.keys;
        if(!this.show_control){
            this.showControlBar(false)
            return;
        }
        switch (keys.focused_part) {
            case "control_bar":
                if (this.show_control)
                    $(this.video_control_doms[keys.control_bar]).find('i').trigger('click');
                this.showControlBar(false);
                break;
            case "top_selection":
                $(this.top_icons[keys.top_selection]).trigger('click');
                break;
            case "resume_bar":
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
                break;
        }
    },
    handleMenuLeftRight:function(increment){
        var keys=this.keys;
        if(!this.show_control){
            this.showControlBar(false);
            this.hoverMovieSlider();
            return;
        }
        switch (keys.focused_part) {
            case "slider_selection":
                this.hoverMovieSlider();
                this.seekTo(increment*30);
                this.showControlBar(false);
                break;
            case "control_bar":
                if(this.show_control){
                    keys.control_bar+=increment;
                    if(keys.control_bar<0)
                        keys.control_bar=0;
                    if(keys.control_bar>=this.video_control_doms.length)
                        keys.control_bar=this.video_control_doms.length-1;
                    this.hoverVideoControl(keys.control_bar);
                }else{
                    this.showControlBar(false);
                    if(increment>0){
                        this.seekTo(increment*30);
                        this.hoverVideoControl(2);
                    }else{
                        this.seekTo(-1*increment*30);
                        this.hoverVideoControl(0);
                    }
                }
                break;
            case "top_selection":
                if(this.show_control){
                    keys.top_selection+=increment;
                    if(keys.top_selection<0)
                        keys.top_selection=0;
                    if(keys.top_selection>=this.top_icons.length)
                        keys.top_selection=this.top_icons.length-1;
                    this.hoverTopIcon(keys.top_selection);
                }else{
                    this.showControlBar(false);
                    if(increment>0){
                        this.seekTo(increment*30);
                        this.hoverVideoControl(2);
                    }else{
                        this.seekTo(-1*increment*30);
                        this.hoverVideoControl(0);
                    }
                }
                break;
            case "resume_bar":
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
                break;
        }
    },
    handleMenuUpDown:function(increment){
        var keys=this.keys;
        if(!this.show_control){
            this.showControlBar(false);
            return;
        }

        switch (keys.focused_part) {
            case "top_selection":
                if(increment>0)
                    this.hoverMovieSlider();
                break;
            case "slider_selection":
                if(increment<0)
                    this.hoverTopIcon(keys.top_selection);
                if(increment>0)
                    this.hoverVideoControl(keys.control_bar);
                break;
            case "control_bar":
                if(increment<0)
                    this.hoverMovieSlider();
                break;
        }
    },
    HandleKey:function (e) {
        switch (e.keyCode) {
            case tvKey.MediaFastForward:
                this.seekTo(30);
                this.showControlBar(false);
                this.hoverMovieSlider();
                break;
            case tvKey.RIGHT:
                this.handleMenuLeftRight(1)
                break;
            case tvKey.MediaRewind:
                this.seekTo(-30);
                this.showControlBar(false);
                this.hoverMovieSlider();
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
            case tvKey.MediaPause:
                this.playPauseVideo();
                break;
            case tvKey.MediaPlay:
                this.playPauseVideo();
                break;
            case tvKey.MediaPlayPause:
                this.playPauseVideo();
                break;
            case tvKey.MediaTrackNext:
                this.showNextVideo(1);
                this.showControlBar(false);
                this.hoverVideoControl(2);
                break;
            case tvKey.MediaTrackPrevious:
                this.showNextVideo(-1);
                this.showControlBar(false);
                this.hoverVideoControl(0);
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
