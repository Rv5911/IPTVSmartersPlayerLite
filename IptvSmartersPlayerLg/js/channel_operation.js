"use strict";
var channel_page={
    current_channel_index:0,
    hover_channel_id:0,
    player:null,
    channel_number_timer:null,
    channel_num:0,
    movies:[],
    all_movies:[],
    next_programme_timer:null,
    keys:{
        focused_part:"channel_selection",//"right_screen_part", search_selection
        channel_selection:0,
        top_info_selection:0,
        category_selection:0,
        category_search_selection:''
    },
    categories:[],
    filtered_categories:[],
    channel_doms:[],
    category_index:0,
    category_doms:[],
    categories_wrapper:$('#channel-categories-wrapper'),
    top_info_doms:$('#channel-page .top-info-item'),
    page_element:$('#channel-page'),
    search_timer:null,
    category_search_dom:$('#channel-category-search-wrapper'),
    category_search_input:$('#channel-category-search-input'),
    category_keyword:'',
    prev_category_keyword:'',
    channel_keyword:'',
    prev_channel_keyword:'',
    category_search_timer:null,
    initiated:false,
    hover_channel_timer:null,
    programmes:[],
    short_epg_limit_count:30,
    get_epg_timer:null,
    prev_focus_dom:null,
    retryingTimeout:null,
    back_button_pressed: false,
    retrying:0,
    max_retry:5,
    last_played_url : null,
    init:function () {
    this.retrying = 0;
    this.back_button_pressed = false;
    $('.video-error').css("display","none");
    $('.video-loader').css("display","none");
    $('.channel-play-state').remove();


        if(!settings.show_epg_in_channel)
            $('#channel-page-programmes-container').hide();
        else
            $('#channel-page-programmes-container').show();
        $('#channel-player-note').show();
        if(!this.initiated){
            this.categories=LiveModel.categories;
            this.filtered_categories=LiveModel.categories;
            this.renderCategories();
            this.current_category_id=-1;
            var category_selection=0;
            for(var i=4;i<this.categories.length;i++){
                if(this.categories[i].movies.length>0){
                    var category=this.categories[i];
                    if(checkForAdult(category,'category',[])){
                        continue;
                    }else{
                        category_selection=i;
                    }
                    break;
                }
            }
            this.hoverCategoryItem(category_selection);
            this.showCategoryContent();
            this.initiated=true;
            $('#channel-page-programmes-container').html('');
            this.keys.channel_selection=0;
        }
        $("#channel-page").removeClass('hide');
        current_route="channel-page";
        this.current_channel_index=-1;
        if(settings.auto_play_channel){
         channel_page.retrying = 0;
         channel_player_page.retrying = 6;
            this.showMovie();
        }
    },
    Exit:function () {

        clearInterval(this.next_programme_timer);
    },
    goBack:function(){
        var keys=this.keys;
        switch (keys.focused_part) {

           case "category_search_selection":
                  this.releasePlayerAndDashboardRedirect();
                break;
            case "category_selection":
            case "channel_selection":
                  this.releasePlayerAndDashboardRedirect();
                break;
            case "top_info_selection":

                this.keyChange();

            var index = 2;

            keys.focused_part='top_info_selection';

            this.keys.top_info_selection=index;
            $(this.prev_focus_dom).removeClass('active');
            $(this.top_info_doms[index]).addClass('active');
            this.prev_focus_dom=this.top_info_doms[index];

            var search_input_activated=$(this.page_element).find('.page-top-info-container').hasClass('search-input-activated');

            if(search_input_activated){
                $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
            }else{
                this.releasePlayerAndDashboardRedirect();
            }

            break;
        }
    },
    releasePlayerAndDashboardRedirect:function(){
         try{
            channel_page.retrying = 6;

            channel_page.back_button_pressed = true;

            clearTimeout(channel_page.retryingTimeout);

            channel_player_page.retrying = 6;
            channel_player_page.back_button_pressed = true;
            clearTimeout(channel_player_page.retryingTimeout);

            $('.video-error').css("display","none");
            var videoPlayer = $("#channel-page-video")[0];
            videoPlayer.pause();
            $('#channel-page-video').attr('src', '');
            videoPlayer.load();
            $('.video-loader').css("display","none");

        }catch(e){
            console.log(e);
        }
        this.Exit();
        current_route="home-page";
        $('#channel-page').addClass('hide');
        $('#home-page').removeClass('hide');
    },
    renderCategories:function(){
        $(this.categories_wrapper).html('');
        $(this.categories_wrapper).scrollTop(0);
        var html = '';
        
        if (Array.isArray(this.filtered_categories) && this.filtered_categories.length > 0) {

            this.filtered_categories.map(function (category, index) {
                html+=
                    '<div class="channel-category-item-container"\
                        onmouseenter="channel_page.hoverCategoryItem('+index+')" \
                        onclick="channel_page.handleMenuClick()" \
                    >\
                        <div class="channel-category-item-wrapper">\
                            <div class="channel-category-item-name">'+category.category_name+'</div>\
                            <div class="channel-category-channel-count">'+category.movies.length+'</div>\
                        </div>\
                    </div>'
            })

        } else {
            html =
                '<div class="category-item-container">\
                <div class="category-item-wrapper"\
                    onmouseenter="vod_series_page.hoverCategory()" \
                    onclick="vod_series_page.handleMenuClick()" \
                > \
                    <div class="category-item-name">No Categories Found</div>\
                    <div class="category-movies-count"></div>\
                </div>\
            </div>';  

        }

        $(this.categories_wrapper).html(html);
        this.category_doms=$('.channel-category-item-container');
    },
    showCategoryContent:function(){
        var keys=this.keys;
        var category=this.filtered_categories[keys.category_selection];
        if(category.category_id===this.current_category_id)
            return;
        this.current_category_id=category.category_id;
        this.current_channel_index=-1;
        $('#channel-page-current-category-name').text(category.category_name);
        var movies1=JSON.parse(JSON.stringify(category.movies));
        var movies;
        if(category.category_id!=='continue' && category.category_id!=='recent')
            movies=getSortedMovies(movies1,settings['live_sort']);
        else
            movies=movies1;
        this.all_movies=movies;
        this.movies=this.all_movies;
        if(this.movies.length>0){
            this.renderMovies();
        }
        else{
            this.channel_doms=[];
            var empty_movie_title=''
            if(category.category_id==='favourite')
                empty_movie_title='No Favourite Channels Found';
            if(category.category_id==='continue')
                empty_movie_title='No Channels Watched Yet';
            var html='<div class="vod-series-empty-movies-label">'+empty_movie_title+'</div>'
            $('#channel-menus-container').html(html);
        }
        keys.channel_selection=0;
    },
    renderMovies:function(){
        if(this.movies.length>100){
            $('#channel-menus-container').html(
                '<img id="channel-render-loader" src="images/loader.gif">'
            );
            var that=this;
            var render_time=this.movies.length*5;
            if(render_time>4000)
                render_time=4000;
            if(render_time<1000)
                render_time=1000;
            setTimeout(function () {
                that.renderMoviesFinal();
            },render_time)
        }else{
            this.renderMoviesFinal();
        }
    },
    
    renderMoviesFinal:function(){
        var htmlContents = '';
        
        if (Array.isArray(this.movies) && this.movies.length > 0) {
        	
        	
            this.movies.map(function(movie, index){
                var is_favourite=MovieHelper.checkFavourite('live',movie);
                var favourite_html='';
                if(is_favourite)
                    favourite_html=
                        '<i class="fa fa-heart vod-series-fav-icon"></i>';
                htmlContents+=
                    '<div class="channel-menu-item"\
                        onmouseenter="channel_page.hoverChannelMenu('+index+')"\
                        onclick="channel_page.handleMenuClick()"\
                    >\
                       <span class="channel-icon">\
                           <img class="channel-icon-img" onerror="this.src=src=\'images/logo.png\'" src="'+movie.stream_icon+'">\
                       </span>\
                       <span class="channel-name">'+movie.name+'</span>'+favourite_html+'\
                    </div>'
            })
         
        }else{
        	
            htmlContents = '<div class="channel-menu-item centerContentChildDiv"><div><h3>No channels found</h3></div></div>';
        }
        
        $('#channel-menus-container').html(htmlContents);
        this.channel_doms = $('#channel-menus-container .channel-menu-item');
    },
    goChannelNum:function(new_value){
        var channel_num=this.channel_num;
        if(channel_num!=0 ||(channel_num==0 && new_value!=0)){
            channel_num=channel_num*10+new_value;
            this.channel_num=channel_num;
            clearTimeout(this.channel_number_timer);
            var that=this;
            $('#typed-channel-number').text(channel_num);
            this.channel_number_timer=setTimeout(function(){  // go to channel number
                var movies=this.movies;
                var movie_exist=false;
                for(var i=0;i<movies.length;i++){
                    if(movies[i].num===that.channel_num){
                        movie_exist=true;
                        current_movie=movies[i];
                         channel_page.retrying = 0;
                         channel_player_page.retrying = 6;
                        that.showMovie(current_movie.stream_id)
                        that.current_channel_id=current_movie.stream_id;
                        that.hover_channel_id=current_movie.stream_id;
                        var menus=$('#channel-menu-wrapper').find('.channel-menu-item');
                        that.keys.channel_selection=i;
                        $(that.prev_focus_dom).removeClass('active');
                        $(menus[i]).addClass('active');
                        that.prev_focus_dom=menus[i];
                        that.getEpgProgrammes();
                    }
                }
                if(!movie_exist){
                    showToast("Sorry","Channel does not exist");
                }
                that.channel_num=0;
                $('#typed-channel-number').text("");
            },2000);
        }
    },
    reEnter:function(){
        $("#channel-page").show();
        this.keys.focused_part="channel_selection";
        current_route="channel-page";
        media_player.init("channel-page-video","channel-page")
         channel_page.retrying = 0;
         channel_player_page.retrying = 6;
        this.showMovie(this.current_channel_id);
    },
    goToCatchUpPage:function(){
        var movie=getCurrentMovieFromId(this.hover_channel_id, this.movies,'stream_id');
        if(movie.programmes.length>0) {
            // $.ajax({
            //     method:'get',
            //     url:`${api_host_url}/player_api.php?username=${user_name}&password=${password}&action=get_simple_data_table&stream_id=${movie.stream_id}`,
            //     success:function (data) {
            //         var programmes=data.epg_listings;
            var programmes = movie.programmes;
            channel_page.Exit();
            catchup_page.init(movie, programmes);
            //     },
            //     error:function(){
            //     }
            // })
        }else{
                $('#toast-body').html('<h3>Sorry<br>No programmes exists for this channel</h3>')
                $('.toast').toast({animation: true, delay: 2000});
                $('#toast').toast('show')
            }
    },
    toggleFavMark:function(opposite){
        var keys=this.keys;
        if(keys.focused_part!=='channel_selection')
            return;
        var channel_doms=this.channel_doms;
        var channel_selection=keys.channel_selection;
        var movie=this.movies[keys.channel_selection];
        var is_favourite=MovieHelper.checkFavourite('live',movie);
        var action;
        if(is_favourite){  // if favourite, remove favourite mark
            if(opposite)
                action='remove';
            else
                action='add'
        }else{
            if(opposite)
                action='add'
            else
                action='remove';
        }
        if(action==='add'){
            $(channel_doms[channel_selection]).append('<i class="fa fa-heart vod-series-fav-icon"></i>');
            MovieHelper.addToFavourite('live',movie);
        }
        else{
            var movie_key='stream_id';
            $(channel_doms[channel_selection]).find('.vod-series-fav-icon').remove();
            MovieHelper.removeFavouriteMovie('live',movie[movie_key]);
        }

        var filtered_categories=this.filtered_categories;
        for(var i=0;i<filtered_categories.length;i++){
            if(filtered_categories[i].category_id==='favourite'){
                var favourite_position=i;
                var favourite_movie_count=this.categories[favourite_position].movies.length
                $(this.category_doms[favourite_position]).find('.channel-category-channel-count').text(favourite_movie_count);
                break;
            }
        }
    },
    removeAllWatchList:function(){
        MovieHelper.removeAllWatchList('live');
        this.movies=[];
        this.all_movies=[];
        $('#channel-menus-container').html('');
        this.updateRecentWatchChannelCount();
        this.channel_doms=[];
    },
    updateNextProgrammes:function(){
        var that=this;
        clearInterval(this.next_programme_timer);
        this.showNextProgrammes();
        this.next_programme_timer=setInterval(function () {
            that.showNextProgrammes();
        },60000)
    },
    showNextProgrammes:function (){
        var programmes=this.programmes;
        var next_programmes=LiveModel.getNextProgrammes(programmes);
        var current_programme_exist=next_programmes.current_program_exist;
        var htmlContent='';
        var time_format=settings.time_format;
        var format_text='HH:mm';
        if(time_format==='12')
            format_text='hh:mm A';

//            console.log(programmes);
//            console.log(next_programmes);
        for(var i=0;i<next_programmes.programmes.length;i++){
            var item=next_programmes.programmes[i];
            var start_time=getLocalChannelTime(item.start).format(format_text);
            var stop_time=getLocalChannelTime(item.stop).format(format_text);
            htmlContent+=
                '<div class="channel-page-programme-wrapper">\
                    <div class="channel-page-programme-item '+(i==0 && current_programme_exist ? 'current' : '')+'">'+
                        start_time+' ~ '+stop_time+' '+getAtob(item.title)+
                    '</div>\
                    <div class="channel-page-program-desc max-line-2">'+getAtob(item.description)+'</div>\
                </div>'
        }
        $('#channel-page-programmes-container').html(htmlContent);
    },
    showMovie:function(retryornot){


//      this.last_played_url = url;

        var url;

        if(typeof retryornot!='undefined'){
//             alert("retrying");
             url = this.last_played_url;
        }else{
            var keys=this.keys;
            var current_movie=this.movies[keys.channel_selection];
            var movie_id=current_movie.stream_id;
            $('#channel-player-note').hide();
            if(settings.playlist_type==="xtreme"){
                url=getMovieUrl(movie_id,'live','ts');

            }else if(settings.playlist_type==="type1"){
                url=current_movie.url;
            }
            this.last_played_url = url;
        }


        try{
            $('.video-error').hide();

            $('#channel-page-video').attr('src', url);

            var videoPlayer = $("#channel-page-video")[0];
            videoPlayer.load();

            videoPlayer.onerror = function() {
                    if(!channel_page.back_button_pressed){
                            channel_page.retrying++;
                                if(channel_page.retrying>channel_page.max_retry){
                                $('.video-loader').hide();
                                $('.video-error').show();
                                }else{
                                    $('#toast-body').css("background","#000000bf");
                                    showToast('Playback error','reconnects in 3s ('+channel_page.retrying+'/'+channel_page.max_retry+')');

                                    channel_page.retryingTimeout = setTimeout(function () {

                                                channel_page.showMovie("retry");
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

            channel_page.retrying = 0;
            channel_player_page.retrying = 6;
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

        if(typeof retryornot!='undefined'){

        }else{
            MovieHelper.addToWatchList('live',current_movie);
            this.updateRecentWatchChannelCount();
            this.current_channel_index=keys.channel_selection;
            $('.channel-play-state').remove();
            
            var html=
                '<span class="channel-play-state">\n' +
                '   <i class="fa fa-play"></i>\n' +
                '</span>'
            $(html).insertAfter($(this.channel_doms[keys.channel_selection]).find('.channel-icon'));
            $('#full-screen-channel-logo').attr('src',current_movie.stream_icon);
        }

    },
    updateRecentWatchChannelCount:function(){
        var recent_watch_category_position;
        var filtered_categories=this.filtered_categories;
        for(var i=0;i<filtered_categories.length;i++){
            if(filtered_categories[i].category_id==='continue'){
                recent_watch_category_position=i;
                break;
            }
        }
        var origin_recent_category_position=MovieHelper.getWatchListPosition();
        var recent_watch_channel_count=LiveModel.categories[origin_recent_category_position].movies.length;
        $(this.category_doms[recent_watch_category_position]).find('.channel-category-channel-count').text(recent_watch_channel_count);
    },
    keyChange:function(){
        clearTimeout(this.search_timer);
        var that=this;
        this.search_timer=setTimeout(function () {
            var keyword=$(that.top_info_doms[1]).val();
            if(that.prev_channel_keyword===keyword)
                return;
            var movies=[];
            if(keyword==='')
                movies=that.all_movies;
            else{
                movies=that.all_movies.filter(function (item) {
                    return item.name.toLowerCase().includes(keyword.toLowerCase());
                })
            }
            that.movies=movies;
            that.renderMovies();
            that.prev_channel_keyword=keyword;
        },300)
    },
    categoryKeywordChange:function(){
        clearTimeout(this.search_category_timer);
        var that=this;
        var prev_category_keyword=this.prev_category_keyword;
        this.search_category_timer=setTimeout(function () {
            var category_keyword=$(that.category_search_input).val();
            if(category_keyword===prev_category_keyword)
                return;
            var filtered_categories=that.categories;
            if(category_keyword!=='')
            {
                filtered_categories=that.categories.filter(function (item) {
                    return item.category_name.toLowerCase().includes(category_keyword.toLowerCase());
                })
            }
            that.filtered_categories=filtered_categories;
            that.renderCategories();
            that.prev_category_keyword=category_keyword;
        },300)
    },
    getEpgProgrammes:function(){
        if(!settings.show_epg_in_channel)
            return;
        var that=this;
        var programmes=[];
        this.programmes=[];
        $('#channel-page-programmes-container').html(
            '<div id="channel-page-programmes-container">\
                <div id="epg-loader-container">\
                    <img id="epg-loader-img" src="images/loader.gif">\
                    <div id="epg-loader-txt">TV Guide Info loading...</div>\
                </div>\
          </div>'
        )
        var movie=this.movies[this.keys.channel_selection];
        if(current_route==='channel-player-page'){
            channel_player_page.changeProgramInfo();
        }
        if(playlist.type==='xtreme'){
            $.ajax({
                method:'get',
                url:playlist.url+'/player_api.php?username='+playlist.user_name+'&password='+playlist.password+'&action=get_short_epg&stream_id='+movie.stream_id+'&limit='+this.short_epg_limit_count,
                success:function (data) {
                    data.epg_listings.map(function (item) {
                        programmes.push({
                            start:item.start,
                            stop:item.end,
                            title:item.title,
                            description:item.description
                        })
                    })
                    that.programmes=programmes;
                    that.updateNextProgrammes();
                    if(current_route==='channel-player-page')
                        channel_player_page.changeProgramInfo();
                }
            });
        }
    },
    hoverTopIcon:function(index,input_focus,type){
        if(type == 'k'){
              $("#channel-category-search-input").blur();
              $("#channel-page-stream-search-wrapper input").blur();
        }
        var keys=this.keys;
        keys.focused_part='top_info_selection';
        keys.top_info_selection=index;
        $(this.prev_focus_dom).removeClass('active');
        $(this.top_info_doms[index]).addClass('active');
        this.prev_focus_dom=this.top_info_doms[index];
        if(input_focus)
            $(this.top_info_doms[1]).focus();


    },
    hoverCategorySearch:function(is_focused){
        $(this.prev_focus_dom).removeClass('active');
        $(this.category_search_dom).addClass('active');
        this.prev_focus_dom=this.category_search_dom;
        if(is_focused){
//        var html = $(this.category_search_input).val();
//        $(this.category_search_input).focus().val("").val(html);

//            $(this.category_search_input).focus();
        }
        this.keys.focused_part='category_search_selection';
    },
    hoverCategoryItem:function(index,type){
        if(type == 'k'){
            $("#channel-category-search-input").blur();
            $("#channel-page-stream-search-wrapper input").blur();
        }
        var keys=this.keys;
        keys.focused_part='category_selection';
        keys.category_selection=index;
        $(this.prev_focus_dom).removeClass('active');
        $(this.category_doms[index]).addClass('active');
        this.prev_focus_dom=this.category_doms[index];
        moveScrollPosition(this.categories_wrapper,this.category_doms[index],'vertical',false);
    },
    hoverChannelMenu:function(index,type){
        if(type == 'k'){
            $("#channel-category-search-input").blur();
            $("#channel-page-stream-search-wrapper input").blur();
        }
        var keys=this.keys;
        keys.focused_part="channel_selection";
        keys.channel_selection=index;
        $(this.prev_focus_dom).removeClass('active');
        var channel_doms=this.channel_doms;
        $(channel_doms[index]).addClass('active');
        this.prev_focus_dom=channel_doms[index];
        moveScrollPosition($('#channel-menus-container'),channel_doms[keys.channel_selection],'vertical',false);
        clearTimeout(this.hover_channel_timer);
        var that=this;
        this.hover_channel_timer=setTimeout(function () {
            that.getEpgProgrammes();
        },300)
    },
    handleMenuClick:function(type){

        var keys=this.keys;


        switch (keys.focused_part) {
            case "category_selection":
                $(this.top_info_doms[1]).val('');
                $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
                this.keyChange();

                var category=this.filtered_categories[keys.category_selection];
                if(category.category_id===this.current_category_id)
                    return;
                if(checkForAdult(category,'category',[])){
                    parent_confirm_page.init(current_route);
                    return;
                }
                this.showCategoryContent();
                break;
            case "channel_selection":
                if(this.current_channel_index==keys.channel_selection){
                    var current_movie=this.movies[keys.channel_selection];
                    channel_player_page.init('channel-page',current_movie);
                }
                else{
           
                    channel_page.retrying = 0;
                    channel_player_page.retrying = 6;
                    this.showMovie();

                }
                break;
            case "top_info_selection":
                 switch (keys.top_info_selection) {
                    case 0:
                        $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
                        this.hoverTopIcon(2,false);
                        break;
                    case 1:
                        $(this.page_element).find('.page-top-info-container').addClass('search-input-activated');
                        $(this.top_info_doms[1]).focus();
                        var that=this;
                        setTimeout(function () {
                            var tmp = $(that.top_info_doms[1]).val();
                            $(that.top_info_doms[1])[0].setSelectionRange(tmp.length, tmp.length);
                        },200)
                        break;
                    case 2:
                        this.prev_channel_keyword='';

                        $(this.page_element).find('.page-top-info-container').addClass('search-input-activated');
                        this.hoverTopIcon(1,false);
                        break;
                    case 3:
                        common_menu_page.init(current_route);
                        break;
                }
                break;
            case "category_search_selection":
                if(type == 'k'){
                    if ($(this.category_search_input).is(":focus")) {
                       $(this.category_search_input).blur();
                    }else{

                       $(this.category_search_input).focus();
                    }
                }else{

                    $(this.category_search_input).focus();
                }

                break;
        }
    },
    handleMenusUpDown:function(increment) {
        var keys=this.keys;
        var channel_doms=this.channel_doms;
        switch (keys.focused_part) {
            case "category_selection":
                keys.category_selection+=increment;
                if(keys.category_selection>=this.category_doms.length){
                    keys.category_selection=this.category_doms.length-1;
                    return;
                }
                if(keys.category_selection<0){
                 this.hoverCategorySearch(true);

                    return;
                }
                this.hoverCategoryItem(keys.category_selection,'k');
                break;
            case "category_search_selection":
                if(increment>0 && this.category_doms.length>0)
                    this.hoverCategoryItem(0,'k');
                break;
            case "channel_selection":
                keys.channel_selection+=increment;
                if(keys.channel_selection>=channel_doms.length)
                    keys.channel_selection=channel_doms.length-1;
                if(keys.channel_selection<0){
                    keys.channel_selection=0;
                    var search_input_activated=$(this.page_element).find('.page-top-info-container').hasClass('search-input-activated');
                    if(search_input_activated)
                        this.hoverTopIcon(1,false,'k');
                    else
                        this.hoverTopIcon(2,false,'k');
                    return;
                }
                this.hoverChannelMenu(keys.channel_selection,'k');
                break;
            case "top_info_selection":
                if(increment>0 && this.channel_doms.length>0)
                    this.hoverChannelMenu(keys.channel_selection,'k');
                break;
        }
    },
    handleMenuLeftRight:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "category_search_selection":
            case "category_selection":
                if(increment>0 && this.channel_doms.length>0){
                    this.hoverChannelMenu(keys.channel_selection,'k');
                }
                break;
            case "channel_selection":
                if(increment<0)
                    this.hoverCategoryItem(keys.category_selection,'k');
                break;
            case "top_info_selection":
                keys.top_info_selection+=increment;
                var search_input_activated=$(this.page_element).find('.page-top-info-container').hasClass('search-input-activated');
                if(!search_input_activated && keys.top_info_selection==1){
                    if(increment<0)
                        keys.top_info_selection=0;
                    else
                        keys.top_info_selection=2;
                }
                if(search_input_activated && keys.top_info_selection==2){
                    if(increment>0)
                        keys.top_info_selection=3;
                    else
                    {
                        keys.top_info_selection=1;
                        $(this.top_info_doms[1]).focus();
                        var that=this;
                        setTimeout(function () {
                            var tmp = $(that.top_info_doms[1]).val();
                            $(that.top_info_doms[1])[0].setSelectionRange(tmp.length, tmp.length);
                        },200)
                    }
                }
                if(keys.top_info_selection<0)
                    keys.top_info_selection=0;
                if(keys.top_info_selection>=this.top_info_doms.length)
                    keys.top_info_selection=this.top_info_doms.length-1;
                if(keys.top_info_selection!=1)
                    this.hoverTopIcon(keys.top_info_selection,false,'k');
                else
                    this.hoverTopIcon(keys.top_info_selection,true,'k');
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
                this.handleMenuClick('k');
                break;
            case tvKey.CH_UP:

                this.showNextChannel(1);
                break;
            case tvKey.CH_DOWN:
                this.showNextChannel(-1);
                break;
            case tvKey.RETURN:
            case tvKey.RETURN_LG:
            case tvKey.ESC:
                this.goBack();
                break;
            case tvKey.YELLOW:
                this.toggleFavMark(true);
                break;
            case tvKey.GREEN:
                this.goToCatchUpPage();
                break;
            case tvKey.N1:
                this.goChannelNum(1);
                break;
            case tvKey.N2:
                this.goChannelNum(2);
                break;
            case tvKey.N3:
                this.goChannelNum(3);
                break;
            case tvKey.N4:
                this.goChannelNum(4);
                break;
            case tvKey.N5:
                this.goChannelNum(5);
                break;
            case tvKey.N6:
                this.goChannelNum(6);
                break;
            case tvKey.N7:
                this.goChannelNum(7);
                break;
            case tvKey.N8:
                this.goChannelNum(8);
                break;
            case tvKey.N9:
                this.goChannelNum(9);
                break;
            case tvKey.N0:
                this.goChannelNum(0);
                break;
        }
    }
}


var categories_search_input = document.getElementById('channel-category-search-input');
var categories_search_input_handler = function(e) {
  channel_page.categoryKeywordChange();
}
categories_search_input.addEventListener('input', categories_search_input_handler);
categories_search_input.addEventListener('propertychange', categories_search_input_handler);



var channels_search_input = document.getElementById('channels-top-search');
var channels_search_input_handler = function(e) {
  channel_page.keyChange();
}
channels_search_input.addEventListener('input', channels_search_input_handler);
channels_search_input.addEventListener('propertychange', channels_search_input_handler);



