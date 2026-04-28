"use strict";
var episode_page={
    keys:{
        focused_part:'menu_selection', // grid_part
        index:0,
        top_info_selection:0
    },
    prev_route:'',
    episodes:[],
    all_episodes:[],
    current_render_count:0,
    is_drawing:false,
    episode_doms:[],
    render_count_increment:48,
    top_info_doms:$('#episode-page .top-info-item'),
    page_element:$('#episode-page'),
    search_timer:null,


    init:function(episodes,prev_route){
        current_route="episode-page";
        $('#episode-page').removeClass('hide');
        $('#episode-page-series-name').text(current_series.name);
        this.prev_route=prev_route;
        this.episodes=episodes;
        this.all_episodes=episodes;
        this.current_render_count=0;
        this.keys.focused_part='menu_selection';
        $('#episode-page-movies-container').html("");
        $('#episode-page-movies-container').scrollTop(0);
        this.renderEpisodes();
        this.keys.index=0;
        $(this.episode_doms[0]).addClass('active');
    },
    Exit:function(){
        $('#episode-page').addClass('hide');
    },
    goBack:function(){
        $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
        $(this.top_info_doms[2]).val('')
        this.keyChange();
        current_route=this.prev_route;
        $('#episode-page').addClass('hide');
        if(this.prev_route==='series-summary-page'){
            $('#series-summary-page').removeClass('hide');
        }else{
            $('#seasons-page').removeClass('hide');
        }
    },
    renderEpisodes:function(){
        var htmlContent='';
        if(this.current_render_count<this.episodes.length){
            showLoader(true);
            this.is_drawing=true;
            var current_render_count=this.current_render_count;
            this.episodes.slice(this.current_render_count, this.current_render_count+this.render_count_increment).map(function (item, index) {
                try{
                    var img=item.info.movie_image;
                    htmlContent+=
                        '<div class="episode-item-container">' +
                        '   <div class="episode-item-wrapper"' +
                        '       onclick="episode_page.handleMenuClick()"' +
                        '       onmouseenter="episode_page.hoverMenuItem('+index+')"'+
                        '   >'+
                        '       <img class="episode-item-image episode-item-image-'+current_render_count+'" ' +
                        '           src="'+img+'"' +
                        '           onerror="src=\'images/noposter.png\'"'+
                        '       >'+
                        '       <div class="episode-item-name-container">'+
                        '           <div class="episode-item-name-wrapper">' +
                        '               <div class="episode-item-name max-line-2">' +
                        item.title+
                        '               </div>'+
                        '           </div>'+
                        '       </div>'+
                        '   </div>'+
                        '</div>'
                }catch (e) {
                    console.log(item, index);
                }
            })
            $('#episode-page-movies-container').append(htmlContent);
            this.episode_doms=$('.episode-item-wrapper');
            this.current_render_count+=this.render_count_increment;
            var that=this;
            setTimeout(function () {
                that.is_drawing=false;
                showLoader(false);
            },2000)
        }
    },
    keyChange:function(){
        clearTimeout(this.search_timer);
        var that=this;
        this.search_timer=setTimeout(function () {
            var keys=that.keys;
            var keyword=$(that.top_info_doms[2]).val();
            keys.focused_part='menu_selection';
            var episodes;
            if(keyword==='')
                episodes=that.all_episodes;
            else{
                episodes=that.all_episodes.filter(function (item) {
                    return item.title.toLowerCase().includes(keyword.toLowerCase());
                })
            }
            that.episodes=episodes;
            $('#episode-page-movies-container').html("");
            $('#episode-page-movies-container').scrollTop(0);
            that.current_render_count=0;
            that.episode_doms=[];
            that.renderEpisodes();
        },300)
    },
    showMovie:function(){
        this.Exit();
        var episode_buttons=$('.episode-grid-item-wrapper');
        this.keys.focused_part="grid_part";
        var index=this.keys.index;
        $(episode_buttons[index]).addClass('active');
        var episodes=this.episodes;
        current_episode=episodes[index];
        vod_series_player_page.init(current_episode,'series',"episode-page")
    },
    hoverMenuItem:function(index){
        this.keys.index=index;
        this.keys.focused_part="menu_selection";
        $(this.episode_doms).removeClass('active');
        $(this.episode_doms[index]).addClass('active');
        $(this.top_info_doms).removeClass('active');
        moveScrollPosition($('#episode-page-movies-container'),$(this.episode_doms[index]).closest('.episode-item-container'),'vertical',false);
    },
    hoverTopIcon:function(index){
        var keys=this.keys;
        keys.focused_part='top_info_selection';
        keys.top_info_selection=index;
        $(this.episode_doms).removeClass('active');
        $(this.top_info_doms).removeClass('active');
        $(this.top_info_doms[index]).addClass('active');
    },
    moveKey:function(increment){
        var keys=this.keys;
       keys.index+=increment;
       if(keys.index<0)
       {
           this.hoverTopIcon(1);
           return;
       }
       if(keys.index>=this.episode_doms.length)
           keys.index=this.episode_doms.length-1;
        this.hoverMenuItem(keys.index);
        if(keys.index>=this.current_render_count-6){
            this.renderEpisodes();
        }
    },
    handleMenuLeftRight:function(increment){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                this.moveKey(increment);
                break;
            case "top_info_selection":
                keys.top_info_selection+=increment;
                var search_input_activated=$(this.page_element).find('.page-top-info-container').hasClass('search-input-activated');
                if(!search_input_activated)
                    keys.top_info_selection=1;
                if(keys.top_info_selection<0)
                    keys.top_info_selection=0;
                if(keys.top_info_selection>=this.top_info_doms.length)
                    keys.top_info_selection=this.top_info_doms.length-1;
                this.hoverTopIcon(keys.top_info_selection);
                break;
        }
    },
    handleMenusUpDown:function(increment){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                this.moveKey(6*increment);
                break;
            case "top_info_selection":
                if(this.episode_doms.length>0 && increment>0)
                    this.hoverMenuItem(0);
                break;
        }
    },
    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                this.showMovie();
                break;
            case 'top_info_selection':
                switch(keys.top_info_selection){
                    case 0:
                        $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
                        $(this.top_info_doms[2]).val('')
                        this.keyChange();
                        this.hoverTopIcon(1);
                        break;
                    case 1:
                        $(this.top_info_doms[2]).val('');
                        $(this.page_element).find('.page-top-info-container').addClass('search-input-activated');
                        break;
                    case 2:
                        $(this.page_element).find('.top-search-input').focus();
                        break;
                }
                break;
        }
    },
    HandleKey:function(e){
        if(!this.is_drawing){
            switch(e.keyCode){
                case tvKey.LEFT:
                    this.handleMenuLeftRight(-1);
                    break;
                case tvKey.RIGHT:
                    this.handleMenuLeftRight(1);
                    break;
                case tvKey.UP:
                    this.handleMenusUpDown(-1);
                    break;
                case tvKey.DOWN:
                    this.handleMenusUpDown(1);
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
