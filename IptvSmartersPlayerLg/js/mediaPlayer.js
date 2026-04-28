"use strict";
var media_player={
    videoObj:null,
    parent_id:'',
    STATES:{
        STOPPED: 0,
        PLAYING: 1,
        PAUSED: 2,
        PREPARED: 4
    },
    current_time:0,
    init:function(id, parent_id) {
        this.videoObj=null;	// tag video
        this.parent_id=parent_id;
        this.STATES={
            STOPPED: 0,
            PLAYING: 1,
            PAUSED: 2,
            PREPARED: 4
        };
        this.state = this.STATES.STOPPED;
        this.parent_id=parent_id;
        this.current_time=0;
        this.videoObj = document.getElementById(id);
        $('#'+parent_id).find('.subtitle-container').text('');
        if(settings.active_subtitle)
            $('#'+parent_id).find('.subtitle-container').show();
        else
            $('#'+parent_id).find('.subtitle-container').hide();

        try{
        }catch(e){
            console.log(e);
        }
    },
    playAsync:function(url){
        console.log(url);
        $('#'+this.parent_id).find('.video-error').hide();
        $('.video-loader').show();
        if (this.state > this.STATES.STOPPED) {
            return;
        }
        if (!this.videoObj) {
            return 0;
        }
        this.state=this.STATES.PLAYING;
        try{
            webapis.avplay.open(url);
            this.setupEventListeners();
            this.setDisplayArea();
            webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_PLAY","PLAYER_BUFFER_SIZE_IN_SECOND", settings.buffering_time); // 5 is in seconds
            var that=this;
            webapis.avplay.prepareAsync(
                function(){
                    $('.video-loader').hide();
                    that.state = that.STATES.PLAYING;
                    webapis.avplay.play();
                    $('#'+that.parent_id).find('.video-total-time').text(that.formatTime(webapis.avplay.getDuration()/1000));
                    $('#'+that.parent_id).find('.video-error').hide();
                    $('#'+that.parent_id).find('.progress-amount').css({width:0})
                    var attributes={
                        min: 0,
                        max:webapis.avplay.getDuration()/1000
                    };
                    $('#'+that.parent_id).find('.video-progress-bar-slider').attr(attributes)
                    $('#'+that.parent_id).find('.video-progress-bar-slider').rangeslider('update', true);
                    $('#'+that.parent_id).find('.video-current-time').text("00:00");
                    if(current_route==='vod-series-player-video')
                        vod_series_player_page.resumePlay();
                },
                function(){
                    console.log("here video error");
                    $('.video-loader').hide();
                    $('#'+that.parent_id).find('.video-error').show();
                }
            );
        }catch(e){
            $('.video-loader').hide();
            $('#'+this.parent_id).find('.video-error').show();
        }
    },
    play:function(){
        this.state=this.STATES.PLAYING;
        try{
            webapis.avplay.play();
        }catch(e){
            console.log(e);
        }
    },
    pause:function() {
        this.state = this.STATES.PAUSED;
        try{
            webapis.avplay.pause();
        }catch(e){
            console.log(e);
        }
    },
    stop:function() {
        this.state = this.STATES.STOPPED;
        try{
            webapis.avplay.stop();
        }catch (e) {
        }
    },
    close:function(){
        this.state = this.STATES.STOPPED;
        webapis.avplay.close();
    },
    setDisplayArea:function() {
        var top_position=$(this.videoObj).offset().top;
        var left_position=$(this.videoObj).offset().left;
        var width=parseInt($(this.videoObj).width())
        var height=parseInt($(this.videoObj).height());
        webapis.avplay.setDisplayRect(left_position,top_position,width,height);
    },
    formatTime:function(seconds) {
        var hh = Math.floor(seconds / 3600),
            mm = Math.floor(seconds / 60) % 60,
            ss = Math.floor(seconds) % 60;
        return (hh ? (hh < 10 ? "0" : "") + hh + ":" : "") +
            ((mm < 10) ? "0" : "") + mm + ":" +
            ((ss < 10) ? "0" : "") + ss;
    },
    setupEventListeners:function() {
        var that = this;
        var listener = {
            onbufferingstart: function() {
                $('#'+that.parent_id).find('.video-loader').show();
            },
            onbufferingprogress: function(percent) {
                // console.log("Buffering progress: "+percent);
            },
            onbufferingcomplete: function() {
                // console.log('Buffering Complete, Can play now!');
                $('#'+that.parent_id).find('.video-loader').hide();
            },
            onstreamcompleted: function() {
                $('#'+that.parent_id).find('.video-error').hide();
                webapis.avplay.stop();
                that.state = that.STATES.STOPPED;
                $('#'+that.parent_id).find('.progress-amount').css({width:'100%'})
                if(current_route==='vod-series-player-video'){
                    if(settings.enable_autoplay)
                        vod_series_player_page.showNextVideo(1);
                }
            },
            oncurrentplaytime: function(currentTime) {
                that.current_time=currentTime;
                $('#'+that.parent_id).find('.video-error').hide();
                var duration =  webapis.avplay.getDuration();
                if (duration > 0) {
                    $('#'+that.parent_id).find('.video-progress-bar-slider').val(currentTime/1000).change();
                    $('#'+that.parent_id).find('.video-current-time').html(that.formatTime(currentTime/1000));
                    $('#'+that.parent_id).find('.progress-amount').css({width:currentTime/duration*100+'%'});
                }
            },
            ondrmevent: function(drmEvent, drmData) {
                // console.log("DRM callback: " + drmEvent + ", data: " + drmData);
            },
            onerror : function(type, data) {
                $('#'+that.parent_id).find('.video-error').show();
                // console.log("OnError: " + data);
            },
            onsubtitlechange: function(duration, text, data3, data4) {
                $('#'+that.parent_id).find('.subtitle-container').html("");
                $('#'+that.parent_id).find('.subtitle-container').html(text);
            }
        }
        webapis.avplay.setListener(listener);
    },
    onDeviceReady:function() {
        document.addEventListener('pause', onPause);
        document.addEventListener('resume', onResume);
    },
    onPause:function() {
        this.pause();
    },
    onResume:function() {
        this.play();
    },
    getSubtitleOrAudioTrack:function(kind){
        var result=[];
        var all_track_str="";
        var key=kind==="TEXT" ? "track_lang" : "language";
        try{
            var totalTrackInfo=webapis.avplay.getTotalTrackInfo();
            console.log(totalTrackInfo);
            var current_track_index=1;
            for(var i=0; i<totalTrackInfo.length;i++){
                try{
                    if(totalTrackInfo[i].type == kind){
                        var extra_info=JSON.parse(totalTrackInfo[i].extra_info);
                        if(kind==='TEXT' || kind==='AUDIO'){
                            var language=extra_info[key].trim();
                            if(language!==''){
                                if(!all_track_str.includes(language)){
                                    all_track_str+=(", "+language);
                                    extra_info[key]=typeof language_codes[language]!="undefined" ? language_codes[language] : language;
                                }
                            }else{
                                extra_info[key]=kind==='TEXT' ? 'Subtitle ' : 'Audio ';
                                extra_info[key]+=current_track_index;
                                current_track_index+=1;
                            }
                            totalTrackInfo[i].extra_info=extra_info;
                            result.push(totalTrackInfo[i]);
                        }else{
                            totalTrackInfo[i].extra_info=extra_info;
                            result.push(totalTrackInfo[i]);
                        }
                    }
                }catch (e) {
                    console.log(kind, e);
                }
            }
        }catch (e) {
        }
        console.log(kind, result);
        return result;
    },
    setSubtitleOrAudioTrack:function(kind, index){
        try{
            if(index>-1){
                // webapis.avplay.setSilentSubtitle(true);
                // webapis.avplay.setSilentSubtitle(false);
            }else{
                // webapis.avplay.setSilentSubtitle(false);
            }
            webapis.avplay.setSelectTrack(kind,index);
        }catch (e) {
            console.log(e);
        }
        if(kind==='TEXT'){
            if(index>-1){
                if(settings.active_subtitle)
                    $('#'+this.parent_id).find('.subtitle-container').show();
            }else{
                $('#'+this.parent_id).find('.subtitle-container').hide();
            }
        }
    }
}













