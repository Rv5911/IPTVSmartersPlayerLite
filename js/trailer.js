"use strict";
var trailer_page={
    player:null,
    done : false,
    back_url:'',
    is_paused:false,
    init:function(back_url,movie){
        this.back_url=back_url;
        $('#trailer-player-page').show();
        current_route="trailer-page";
        if($('iframe#trailer-player').length>0){  // if iframe already loaded
            this.player.loadVideoById({
                videoId:movie.youtube_trailer
            })
            this.player.playVideo();
        }
        else{
            this.player = new YT.Player('trailer-player', {
                height: '100%',
                width: '100%',
                videoId: movie.youtube_trailer,
                events: {
                    'onReady': trailer_page.onPlayerReady,
                    'onStateChange': trailer_page.onPlayerStateChange
                }
            });
        }

    },
    goBack:function(){
        current_route=this.back_url;
        this.player.stopVideo();
        $('#trailer-player-page').hide();
        if(this.back_url==="vod-series-summary-page")
            $('#series-summary-page').removeClass('hide');
    },
    onPlayerReady:function(event) {
        event.target.playVideo();
    },
    onPlayerStateChange:function (event) {

    },
    seekTo:function(step){
        var current_time=this.player.getCurrentTime();
        var new_time=current_time+step;
        var duration=this.player.getDuration();
        if(new_time<0)
            new_time=0;
        if(new_time>duration)
            new_time=duration;
        this.player.seekTo(new_time);
    },
    HandleKey:function (e) {
        switch (e.keyCode) {
            case tvKey.RETURN:
            case tvKey.RETURN_LG:case tvKey.ESC:
                this.goBack();
                break;
            case tvKey.RIGHT:
                this.seekTo(5);
                break;
            case tvKey.LEFT:
                this.seekTo(-5);
                break;
            case tvKey.ENTER:
                try{
                    if(this.is_paused)
                        this.player.playVideo();
                    else
                        this.player.pauseVideo();
                    this.is_paused=!this.is_paused;
                }catch (e) {
                }
                break;
        }
    }
}
