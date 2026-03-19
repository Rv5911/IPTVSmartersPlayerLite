"use strict";
var guide_page={
    keys:{
        focused_part:"programme_selection", // program_selection, back_button, full_screen...
    },
    current_channel_index:-1,
    current_programme_index:-1,
    hover_channel_index:0,
    hover_programme_index:0,
    length_per_minute:0.5,  // represent with %, 1 minute = 1vw
    time_interval:30,
    current_time_differ_width:30,
    channel_dom_items:[],
    programme_wrappers:[],
    player:null,
    min_start_time:"",  // the minimum start time of the current movies
    category:{},
    category_index:0,
    is_loading:false,
    init:function(category){
        var categories=LiveModel.getCategories(false, true);
        var category_index=0;
        categories.map(function (item,index) {
            if(item.category_id===category.category_id)
                category_index=index;
        })
        this.category=category;
        this.category_index=category_index;
        showLoader(true);
        this.is_loading=true;
        var that=this;
        setTimeout(function () {
            that.showGuidePage();
        },400);
    },
    showGuidePage:function(){
        this.keys.focused_part="programme_selection";
        $('#guide-page').removeClass('hide');
        current_route='guide-page';
        this.hover_channel_index=0;
        this.current_channel_index=0;
        this.drawChannelProgrammes();
        showLoader(false);
        this.is_loading=false;
        media_player.init("guide-page-video","guide-page");
        this.showChannelVideo();
    },
    getProgrammeDuration:function(programme){
        var start=convertProgrammeTimeToClientTime(programme.start);
        var stop=convertProgrammeTimeToClientTime(programme.stop);
        var duration=getMinute(stop)-getMinute(start);
        var width=duration*this.length_per_minute;
        return width;
    },
    getMinProgramStartTime:function(movies){  // get the minmum start time of programmes of movies
        var min_start="9999-99-99";
        movies.map(function(movie){
            movie.programmes.map(function(programme){
                var start=convertProgrammeTimeToClientTime(programme.start);
                if(start!=null && start<min_start){
                    min_start=start;
                }
            })
        })
        return min_start;
    },
    getMaxProgramStopTime:function(movies){  // get the minmum start time of programmes of movies
        var max_stop="0000-00-00";
        movies.map(function(movie){
            movie.programmes.map(function(programme){
                var stop=convertProgrammeTimeToClientTime(programme.stop);
                if(stop>max_stop){
                    max_stop=stop;
                }
            })
        })
        return max_stop;
    },
    getTimeGapLength:function(prev_stop_time, current_start_time){ // get the empty time
        return (getMinute(current_start_time)-getMinute(prev_stop_time))*this.length_per_minute;
    },
    scrollToCurrentTime:function(){
        var current_date=moment();
        var min_start_time=this.min_start_time;
        var min_starttimestamp_minute=moment(min_start_time).unix()/60;  // the minimum start time
        var current_timestamp_minute=current_date.unix()/60;  // current time displayed as minute
        var scorll_left_for_current_time=(current_timestamp_minute-min_starttimestamp_minute-this.current_time_differ_width)*this.length_per_minute;
        if(scorll_left_for_current_time)
            this.proceedScrollLeft(convertVwToPixel(scorll_left_for_current_time));
    },
    getScrollLeftPosition:function(){
        var parent_element=this.programme_wrappers[this.hover_channel_index];
        var element=this.getProgrammeElement()
        var scroll_amount=null;
        if(element){  // if there are programmes for current channel
            var padding_left=parseInt($(parent_element).css('padding-left').replace('px',''));
            var parent_width=$(parent_element).width();
            var child_position=$(element).position();
            var element_width=$(element).width();
            var parent_scroll_position_left=$(parent_element).scrollLeft();
            if(parent_scroll_position_left+child_position.left+element_width>=parent_width)
            {
                if(element_width>=parent_width){  // if the width of element is grater than the parent width, will show the element left position
                    scroll_amount=parent_scroll_position_left+child_position.left-50;  // will show at the start postion
                }
                else{
                    // scroll_amount=parent_scroll_position_left+child_position.left+element_width-parent_width+50
                    scroll_amount=parent_scroll_position_left+child_position.left+(element_width-parent_width)/2; // will show at the center position
                }
            }
            if(parent_scroll_position_left+child_position.left-padding_left<0)
            {
                scroll_amount=parent_scroll_position_left+child_position.left-padding_left+50;
            }
        }
        else{
            this.scrollToCurrentTime();
        }
        return scroll_amount;
    },
    proceedScrollLeft:function(amount, is_absolute){
        if(is_absolute){
            $(this.programme_wrappers).scrollLeft(amount);
            $('#guide-time-container').scrollLeft(amount);
            var current_time=moment().format('Y-MM-DD HH:mm:ss');
            var time_gap=this.getTimeGapLength(this.min_start_time, current_time); // get by minute, convert into vw
            time_gap=convertVwToPixel(time_gap);  // change into pixel for scroll move event
            var time_bar_position=time_gap-amount;
            $('#current-time-bar').css({left:time_bar_position});
        }
        else{
            $(this.programme_wrappers).scrollLeft(amount);
            $('#guide-time-container').scrollLeft(amount);
        }
    },
    changeHorizontalScroll:function(){
        var scroll_amount=this.getScrollLeftPosition()
        if(scroll_amount!=null)
            this.proceedScrollLeft(scroll_amount);
        else
            this.scrollToCurrentTime();
    },
    getCurrentProgramIndex:function(category_index, movie_index){
        var current_time=moment().format('Y-MM-DD HH:mm:ss');
        var current_program_index=0;
        var categories=LiveModel.getCategories(false, true);
        var movie=categories[category_index].movies[movie_index];
        var programmes=movie.programmes;
        for(var i=0;i<programmes.length;i++){
            current_program_index=i;
            var start=convertProgrammeTimeToClientTime(programmes[i].start)
            var stop=convertProgrammeTimeToClientTime(programmes[i].stop);
            if(start<=current_time && current_time<=stop){
                current_program_index=i;
                break;
            }
            if(start>=current_time)
                break;
        }
        this.current_programme_index=current_program_index;
        $('.guide-programme-item-wrapper').removeClass('active');
        var domElement=this.getProgrammeElement();
        if(domElement)
            $(domElement).addClass('active');
    },
    changeCurrentProgramInfo:function(){
        var movie=this.category.movies[this.hover_channel_index];
        var time_str='';
        if(typeof movie.programmes[this.current_programme_index]!='undefined'){
            var programme=movie.programmes[this.current_programme_index];
            $('#guide-programme-name').text(programme.title);
            var desc=LiveModel.getProgramDesc(programme)
            $('#guide-programme-description').text(desc);
            var movie_date=moment(programme.start,'YYYYMMDDHHmmss Z').format('MM-DD-Y');
            $('#guide-programme-date').text(movie_date);
            var start=convertProgrammeTimeToClientTime(programme.start);
            var stop=convertProgrammeTimeToClientTime(programme.stop);
            time_str=start.substr(11,5)+" - "+stop.substr(11,5);;
        }
        else{
            $('#guide-programme-name').text(movie.name);
            $('#guide-programme-description').text('');
            var movie_date=moment().format('MM-DD-Y');
            $('#guide-programme-date').text(movie_date)
        }
        $('#guide-program-time').text(time_str);
    },
    getProgrammeElement:function(){
        var domElement=null;
        if(this.current_programme_index>=0){
            var programmes=$(this.programme_wrappers[this.hover_channel_index]).find('.guide-programme-item-wrapper');
            domElement=programmes[this.current_programme_index];
        }
        return domElement;
    },
    drawChannelProgrammes:function(){
        var category=this.category;
        $('#guide-channels-container').scrollTop(0);
        $('#guide-programmes-container').scrollTop(0);
        var movies=category.movies;
        if(movies.length==0){
            showToast('Sorry','Channels does not exist for this category');
            return;
        }
        var min_start_time=this.getMinProgramStartTime(movies); // minimum start time of current movies
        this.min_start_time=min_start_time;
        var max_stop_time=this.getMaxProgramStopTime(movies);
        var htmlContent="", htmlChannelsContent="";
        var prev_stop_time;
        var time_gap;
        var that=this;
        movies.map(function(movie){
            htmlChannelsContent+=
                '<div class="guide-channel-item-wrapper">\
                    <span class="guide-channel-number">'+movie.num+'</span>'+
                    '<img class="guide-channel-icon" src="'+movie.stream_icon+'" onerror="this.src=\'images/default_icon.jpeg\'">'+
                    movie.name+
                '</div>'

            var programmes=movie.programmes;
            prev_stop_time=min_start_time;  // have to subtract -15 mins, i.e time_interval/2
            // prev_stop_time=moment(min_start_time).add('minutes',this.time_interval/2).format('Y-MM-DD HH:mm:ss');
            if(programmes.length==0){
                htmlContent+=
                    '<div class="guide-programme-wrapper empty"></div>'

            }
            else{
                htmlContent+='<div class="guide-programme-wrapper">';
                programmes.map(function(programme, programme_index){
                    var start=convertProgrammeTimeToClientTime(programme.start);
                    var stop=convertProgrammeTimeToClientTime(programme.stop);
                    time_gap=that.getTimeGapLength(prev_stop_time, start);
                    var width=that.getProgrammeDuration(programme);
                    htmlContent+=
                        '<div class="guide-programme-item-wrapper"\
                            data-programme_index="'+programme_index+'" data-start_time="'+start+'"\
                            data-end_time="'+stop+'"\
                            style="width:'+width+'vw; margin-left:'+time_gap+'vw"\
                        >'+
                            programme.title+
                        '</div>'

                    prev_stop_time=stop;
                })
                htmlContent+='<div style="width:25000vw"></div>'
                htmlContent+='</div>';
            }
        })
        $('#guide-channels-container').html(htmlChannelsContent);
        $('#guide-programmes-container').html(htmlContent);
        this.channel_dom_items=$('.guide-channel-item-wrapper');
        this.programme_wrappers=$('.guide-programme-wrapper');
        this.current_channel_index=0;
        this.hover_channel_index=0;

        $(this.channel_dom_items[0]).addClass('active');
         // Adding Time Spans
        var min_start_minute=getMinute(min_start_time);
        var max_stop_minute=getMinute(max_stop_time);

        var date_obj=moment(min_start_time);
        var start_time_differ=0;
        var start_time_minute=parseInt(date_obj.format('mm'));
        if(start_time_minute % this.time_interval!=0){
            if(start_time_minute<this.time_interval)
                start_time_differ=this.time_interval-start_time_minute;
            else
                start_time_differ=60-start_time_minute;
        }
        min_start_minute+=start_time_differ;
        date_obj.add('minutes',start_time_differ);
        var  htmlTimeElement="";
        var  loop_index=0;

        while(min_start_minute<=max_stop_minute){
            var time_string=date_obj.format('hh:mm A');
            var left_margin=0;
            if(loop_index==0)
            {
                left_margin=(start_time_differ-this.time_interval/2)*this.length_per_minute;
            }
            htmlTimeElement+=
                '<div class="guide-time inline-block"\
                    style="width:'+(this.time_interval*this.length_per_minute)+'vw; margin-left:'+left_margin+'vw;"\
                >'+
                    time_string+
                '</div>'
            min_start_minute+=this.time_interval;
            date_obj.add('minutes',this.time_interval);
            loop_index++;
        }
        $('#guide-time-container').html(htmlTimeElement);

    //   Moving to Current Time
        this.getCurrentProgramIndex(this.category_index, this.hover_channel_index);
        this.scrollToCurrentTime();
        this.changeCurrentProgramInfo();
        // this.addActiveClassToCurrentProgrammes();
    },
    showChannelVideo:function(){
        var movie=this.category.movies[this.current_channel_index];
        var url;
        if(settings.playlist_type==="xtreme")
            url=getMovieUrl(movie.stream_id,'live','ts');
        else
            url=movie.url;
        try{
            media_player.close();
            media_player.init("guide-page-video","guide-page");
            media_player.playAsync(url);
        }catch(e){
        }
    },
    handleMenuUpDown:function(increment){
        var keys=this.keys;
        if(keys.focused_part==="programme_selection"){ // if key focus on programme selection
            this.hover_channel_index+=increment;
            if(this.hover_channel_index<0){
                this.hover_channel_index=0;
            }
            if(this.hover_channel_index>=this.channel_dom_items.length){
                this.hover_channel_index=this.channel_dom_items.length-1;
            }
            $(this.channel_dom_items).removeClass('active');
            $(this.channel_dom_items[this.hover_channel_index]).addClass('active');

            // Vertical scroll move
            moveScrollPosition($('#guide-channels-container'),$(this.channel_dom_items[this.hover_channel_index]),'vertical',false);  //move channel scroll bar
            moveScrollPosition($('#guide-programmes-container'),$(this.programme_wrappers[this.hover_channel_index]),'vertical',false);  // move channel programme wrapper

            // Horizontal Scroll move
            this.getCurrentProgramIndex(this.category_index,this.hover_channel_index);  // get current programme index and add active class.
            $('.guide-programme-item-wrapper').removeClass('active');
            $(this.programme_wrappers).css({'border':'none'})
            var dom=this.getProgrammeElement();
            if(dom)
                $(dom).addClass('active');
            this.changeHorizontalScroll();
            this.changeCurrentProgramInfo();
        }
    },
    handleMenuLeftRight:function(increment){
       if(this.current_programme_index>=0){  // if -1, it means, no programmes for current channel
           var programmes=this.category.movies[this.hover_channel_index].programmes;
           this.current_programme_index+=increment;
           if(this.current_programme_index<0){
               this.current_programme_index=0;
               return;
           }
           if(this.current_programme_index>=programmes.length)
           {
               this.current_programme_index=programmes.length-1;
               return;
           }
           $('.guide-programme-item-wrapper').removeClass('active');
           var dom=this.getProgrammeElement();
           if(dom)
               $(dom).addClass('active');
           this.changeHorizontalScroll()
           this.changeCurrentProgramInfo();
       }
    },
    handleMenuClick:function(){
        if(this.keys.focused_part==="programme_selection"){
            if(this.hover_channel_index!=this.current_channel_index){
                this.current_channel_index=this.hover_channel_index;
                this.showChannelVideo();
            }
            else{  // if hover channel is same as current channel, show it with full screen
                var movie=this.category.movies[this.current_channel_index];
                $('#guide-page').addClass('hide');
                channel_player_page.init('guide-page',movie);
            }
        }
    },
    goBack:function(){
        this.Exit();
        current_route="stream-category-page";
        $('#stream-category-page').removeClass('hide');
    },
    Exit:function(){
        try{
            media_player.close();
        }catch (e) {

        }
        $('#guide-page').addClass('hide');
    },
    HandleKey:function (e) {
        if(!this.is_loading){
            switch (e.keyCode) {
                case tvKey.RETURN:
                case tvKey.RETURN_LG:case tvKey.ESC:
                    this.goBack();
                    break;
                case tvKey.UP:
                    this.handleMenuUpDown(-1);
                    break;
                case tvKey.DOWN:
                    this.handleMenuUpDown(1);
                    break;
                case tvKey.LEFT:
                    this.handleMenuLeftRight(-1);
                    break;
                case tvKey.RIGHT:
                    this.handleMenuLeftRight(1)
                    break;
                case tvKey.ENTER:
                    this.handleMenuClick();
                    break;
            }
        }
    }
}