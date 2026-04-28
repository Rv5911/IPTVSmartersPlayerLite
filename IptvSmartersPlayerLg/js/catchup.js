"use strict";
var catchup_page={
    keys:{
        focused_part:"channel_selection",//and also, there is "date_program_selection"
        channel_selection:0
    },
    movies:[],
    channel_doms:[],
    is_loading:false,
    init:function(movies){
        showLoader(true);
        this.is_loading=true;
        var filtered_movies=movies;
        this.movies=filtered_movies;

        var html='';
        var current_time=new Date().getTime();
        filtered_movies.map(function (item,index) {
            var current_programme=LiveModel.getCurrentProgram(item);
            var programme_html=
                '           <span class="catchup-channel-programme-name">' +
                '               No Info'+
                '           </span>'+
                '           <span class="catchup-channel-programme-time">' +
                '           </span>';
            var progress_bar_width=0;
            if(current_programme!=null){
                var start=convertProgrammeTimeToClientTime(current_programme.start);
                var stop=convertProgrammeTimeToClientTime(current_programme.stop);
                programme_html=
                    '           <span class="catchup-channel-programme-name">' +
                                    current_programme.title+
                    '           </span>'+
                    '           <span class="catchup-channel-programme-time">' +
                                    start.substr(11,5)+' - '+stop.substr(11,5)+
                    '           </span>'
                progress_bar_width=LiveModel.getProgrammeProgressBarWidth(start,stop,current_time);
            }
            html+=
                '<div class="catchup-channel-item-container">' +
                '   <div class="catchup-channel-item-wrapper"' +
                '       onmouseenter="catchup_page.hoverChannelMenu('+index+')"' +
                '       onclick="catchup_page.handleMenuClick()"'+
                '   >' +
                '       <div class="catchup-channel-item-icon-wrapper">' +
                '           <img class="catchup-channel-item-icon" src="'+item.stream_icon+'" onerror="this.src=\'images/logo.png\'">'+
                '       </div>'+
                '       <div class="catchup-channel-num">' +
                            item.num+
                '       </div>'+
                '       <div class="catchup-channel-name-programme-wrapper">' +
                '           <div class="catchup-channel-name">' +
                                item.name+
                '           </div>'+
                '           <div class="catchup-channel-programme-wrapper">'+
                                programme_html+
                '           </div>'+
                '           <div class="catchup-channel-progress-container">'+
                '               <span class="catchup-channel-progress-bar" style="width: '+progress_bar_width+'%">' +
                '               </span>'+
                '           </div>'+
                '       </div>'+
                '       <div class="catchup-channel-right-icon-wrapper">' +
                '           <img class="catchup-arrow-icon" src="images/forward_arrow.png">'+
                '       </div>'+
                '   </div>'+
                '</div>'
        })
        $('#catchup-channels-container').html(html);
        this.channel_doms=$('.catchup-channel-item-wrapper');
        this.keys.focused_part="channel_selection";
        this.keys.channel_selection=0;
        $(this.channel_doms[0]).addClass('active');
        $('#catchup-channel-page').removeClass('hide')
        $('#catchup-channels-container').scrollTop(0);
        current_route="catch-up";
        showLoader(false);
        this.is_loading=false;
    },
    goBack:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "channel_selection":
                $('#catchup-channel-page').addClass('hide');
                $('#stream-category-page').removeClass('hide');
                current_route="stream-category-page";
                break;
        }
    },

    hoverChannelMenu:function(index){
        var keys=this.keys;
        keys.channel_selection=index;
        $(this.channel_doms).removeClass('active');
        $(this.channel_doms[index]).addClass('active');
        moveScrollPosition($('#catchup-channels-container'),$(this.channel_doms[index]).closest('.catchup-channel-item-container'),'vertical',false);
    },

    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "channel_selection":
                var movie=this.movies[keys.channel_selection];
                if(typeof movie!='undefined' && movie.programmes.length>0){
                    $('#catchup-channel-page').addClass('hide');
                    epg_page.init(movie);
                }else{
                    showToast("Sorry","No epg data exists");
                }
                break;
        }
    },
    handleMenusUpDown:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "channel_selection":
                keys.channel_selection+=increment;
                if(keys.channel_selection<0)
                    keys.channel_selection=0;
                if(keys.channel_selection>=this.channel_doms.length)
                    keys.channel_selection=this.channel_doms.length-1;
                this.hoverChannelMenu(keys.channel_selection);
                break;
        }
    },
    handleMenuLeftRight:function(increment) {
        var keys=this.keys;
    },
    HandleKey:function(e) {
        if(!this.is_loading){
            switch (e.keyCode) {
                case tvKey.RIGHT:
                    catchup_page.handleMenuLeftRight(1)
                    break;
                case tvKey.LEFT:
                    catchup_page.handleMenuLeftRight(-1)
                    break;
                case tvKey.DOWN:
                    catchup_page.handleMenusUpDown(1);
                    break;
                case tvKey.UP:
                    catchup_page.handleMenusUpDown(-1);
                    break;
                case tvKey.ENTER:
                    catchup_page.handleMenuClick();
                    break;
                case tvKey.RETURN:
                case tvKey.RETURN_LG:case tvKey.ESC:
                    this.goBack();
                    break;

            }
        }

    }
}

