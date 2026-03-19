"use strict";
var video_info_page={
    keys:{
        focused_part:'setting_item', // grid_part
        index:0,
        subtitle_font_selection:0
    },
    prev_route:'',
    doms:[],
    subtitle_font_doms:[],
    timer:null,
    timeout:10000,
    draw_subtitle_fonts:false,
    init:function(prev_route,movie,movie_type){
        this.prev_route=prev_route;
        current_route='video-info-page';
        this.reinitTimer();
        var stream_title;
        var that=this;
        if(movie_type==='movie' || movie==='live')
            stream_title = movie.name;
        else
            stream_title=movie.title;
        if(settings.playlist_type==='xtreme'){
            if(movie_type==='movie'){
                $.getJSON(api_host_url+'/player_api.php?username='+user_name+'&password='+password+'&action=get_vod_info&vod_id='+current_movie.stream_id, function (response) {
                    if(typeof response.info!='undefined'){
                        var info = response.info;
                        that.showVideoInfo(stream_title,info)
                    }
                })
            }else{  // if series
                that.showVideoInfo(stream_title,movie.info)
            }
        }else{
            that.showVideoInfo(stream_title,null);
        }
    },
    showVideoInfo:function(stream_title,movie_info){
        $('#video-info-current-video-name').text(stream_title);
        var stream_resolution='N/A', stream_length='N/A',
            video_lng='N/A', video_codec='N/A', video_profile='N/A',
            video_pixel='N/A', video_frame_rate='N/A',
            video_bit_rate='N/A', audio_lng='N/A',audio_codec='N/A', audio_profile='N/A',
            audio_sample_rate='N/A', audio_channels='N/A',audio_bit_rate='N/A';
        if(typeof "movie_info"!=undefined && movie_info!=null){
            stream_length=movie_info.duration;
            if(typeof movie_info.video!='undefined'){
                var video_info=movie_info.video;
                stream_resolution=video_info.width+' x '+video_info.height;
                video_codec=video_info.codec_long_name;
                video_profile=video_info.profile;
                video_pixel=video_info.pix_fmt;
                video_frame_rate=video_info.avg_frame_rate;
                video_bit_rate=movie_info.bitrate+' kb/s';
            }
            if(typeof movie_info.audio!='undefined'){
                var audio_info=movie_info.audio;
                audio_codec=audio_info.codec_long_name;
                audio_sample_rate=audio_info.sample_rate+'Hz';
                audio_channels=audio_info.channels;
                audio_bit_rate=parseInt(parseInt(audio_info.bit_rate)/1000)+' kb/s';
            }
        }else{
            try{
                var stream_info=webapis.avplay.getCurrentStreamInfo();
                console.log(stream_info);
                if(typeof stream_info[0]!='undefined' && typeof stream_info[0].extra_info!='undefined'){
                    var video_info=JSON.parse(stream_info[0].extra_info);
                    stream_resolution=video_info.Width+' x '+video_info.Height;
                    video_bit_rate=video_info.Bit_rate+' kb/s';
                    video_codec=video_info.fourCC;
                }
                if(typeof stream_info[1]!='undefined' && typeof stream_info[1].extra_info!='undefined'){
                    var audio_info=JSON.parse(stream_info[1].extra_info);
                    audio_codec=audio_info.fourCC;
                    audio_sample_rate=audio_info.sample_rate+'Hz';
                    audio_channels=audio_info.channels;
                    audio_bit_rate=parseInt(parseInt(audio_info.bit_rate)/1000)+' kb/s'
                }
            }catch (e) {
            }
        }
        $('#video-info-current-video-name').text(stream_title);
        $('#video-info-resolution').text(stream_resolution);
        $('#video-info-duration').text(stream_length);
        $('#video-info-video-lng').text(video_lng);
        $('#video-info-video-codec').text(video_codec);
        $('#video-info-video-profile').text(video_profile);
        $('#video-info-video-pixel').text(video_pixel);
        $('#video-info-video-resolution').text(stream_resolution);
        $('#video-info-video-frame-rate').text(video_frame_rate);
        $('#video-info-video-bit-rate').text(video_bit_rate);

        $('#video-info-audio-lng').text(audio_lng);
        $('#video-info-audio-codec').text(audio_codec);
        $('#video-info-audio-profile').text(audio_profile);
        $('#video-info-audio-sample-rate').text(audio_sample_rate);
        $('#video-info-audio-channel').text(audio_channels);
        $('#video-info-audio-bit-rate').text(audio_bit_rate);
        $('#video-info-page').show();
    },
    goBack:function(){
        current_route=this.prev_route;
        $('#video-info-page').hide();
    },
    reinitTimer:function(){
        clearTimeout(this.timer);
        var that=this;
        this.timer=setTimeout(function () {
            that.goBack();
        },this.timeout);
    },
    handleMenuUpDown:function(increment){

    },
    handleMenuClick:function(){
    },
    HandleKey:function(e){
        if(!this.is_drawing){
            switch(e.keyCode){
                case tvKey.UP:
                    this.handleMenuUpDown(-1);
                    break;
                case tvKey.DOWN:
                    this.handleMenuUpDown(1);
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
}
