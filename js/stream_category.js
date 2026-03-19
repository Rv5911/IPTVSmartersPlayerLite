"use strict";
var stream_category_page={
    keys:{
        focused_part:"menu_selection", // or, "search part", "slider part", "sub menu part", "search_value"
        menu_selection:0, // the index of selected menu,
        top_info_selection:0
    },
    video_type:'',
    menu_doms:[],
    top_info_doms:$('#stream-category-page .top-info-item'),
    categories:[],
    live_action:false,  // guide or catch up
    page_element:$('#stream-category-page'),
    all_categories:[],
    search_timer:null,


    init:function(video_type, live_action){
        this.live_action=live_action;
        var keys=this.keys;
        current_route="stream-category-page";
        this.video_type=video_type;
        var categories;
        if(video_type==='live'){
            categories=LiveModel.categories;
            this.all_categories=categories;
            if(live_action==='')
                $('#category-page-stream-type').text('LIVE TV');
            else if(live_action==='guide')
                $('#category-page-stream-type').text('EPG Categories')
            else{
                var categories1=JSON.parse(JSON.stringify(LiveModel.getCategories(true,false)));
                categories=[];
                categories1.map(function (item) {
                    var movies=[];
                    item.movies.map(function (movie) {
                        if(movie.programmes.length>0 && movie.tv_archive!=0)
                            movies.push(movie);
                    })
                    if(movies.length>0){
                        item.movies=movies;
                        categories.push(item)
                    }
                })
                $('#category-page-stream-type').text('CATCH UP');
            }
        }
        else if(video_type==='vod'){
            categories=VodModel.categories;
            $('#category-page-stream-type').text('MOVIES')
        }
        else{
            categories=SeriesModel.categories;
            $('#category-page-stream-type').text('SERIES')
        }
        this.categories=categories;
        this.all_categories=categories;
        $('#stream-category-page').removeClass('hide');
        this.renderCategories();
        keys.menu_selection=0;
        $(this.menu_doms[keys.menu_selection]).addClass('active');
    },
    goBack:function(){
        current_route="home-page";
        var keys=this.keys;
        switch (keys.focused_part) {
            case "top_info_selection":
                $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
                $(this.top_info_doms[2]).val();
                this.renderCategories();
                break;
        }
        $('#stream-category-page').addClass('hide');
        $('#home-page').removeClass('hide');
    },
    renderCategories:function(){
        var categories=this.categories;
        $('#stream-category-container').html('');
        $('#stream-category-container').scrollTop(0);
        var htmlContents='';
        categories.map(function (item,index) {
            htmlContents+=
                '<div class="stream-category-item-container">\n' +
                '   <div class="stream-category-item-wrapper"' +
                '       onmouseenter="stream_category_page.hoverMenuItem('+index+')"'+
                '       onclick="stream_category_page.handleMenuClick()"'+
                '>\n' +
                '       <span class="stream-category-icon">\n' +
                '           <img src="images/tv_icon.png">\n' +
                '       </span>\n' +
                '       <span class="stream-category-name">\n' +
                item.category_name+
                '       </span>\n' +
                '       <span class="stream-category-stream-count-container">\n' +
                '           <span class="stream-category-stream-count">'+item.movies.length+'</span>\n' +
                '           <span class="stream-category-count-icon">\n' +
                '               <img src="images/forward_arrow.png">\n' +
                '           </span>\n' +
                '       </span>\n' +
                '    </div>\n' +
                '</div>'
        })
        $('#stream-category-container').html(htmlContents);
        this.menu_doms=$('.stream-category-item-wrapper');
    },
    showStreamPage:function(){
        $('#stream-category-page').addClass('hide');
        var keys=this.keys;
        if(this.categories[keys.menu_selection].movies.length==0){
            showToast('Sorry','No streams exist for this category');
            return;
        }
        var current_category=this.categories[keys.menu_selection];
        switch (this.video_type) {
            case "live":
                if(this.live_action==='')
                    channel_page.init(current_category);
                else if(this.live_action==='guide')
                    guide_page.init(current_category);
                else if(this.live_action==='catch-up')
                    catchup_page.init(current_category.movies);
                break;
            case "vod":
                vod_series_summary_page.init('vod',current_category);
                break;
            case "series":
                vod_series_summary_page.init('series',current_category);
                break;
        }
    },
    keyChange:function(){
        clearTimeout(this.search_timer);
        var that=this;
        this.search_timer=setTimeout(function () {
            var keys=that.keys;
            var keyword=$(that.top_info_doms[2]).val();
            var categories=[];
            if(keyword==='')
                categories=that.all_categories;
            else{
                categories=that.all_categories.filter(function (item) {
                    return item.category_name.toLowerCase().includes(keyword.toLowerCase());
                })
            }
            that.categories=categories;
            that.renderCategories();
        },300)
    },
    hoverMenuItem:function(index){
        var keys=this.keys;
        keys.focused_part="menu_selection";
        keys.menu_selection=index;
        $(this.top_info_doms).removeClass('active');
        $(this.menu_doms).removeClass('active');
        $(this.menu_doms[index]).addClass('active');
        moveScrollPosition($('#stream-category-container'),this.menu_doms[index],'vertical',false);
    },
    hoverTopIcon:function(index){
        var keys=this.keys;
        keys.focused_part='top_info_selection';
        keys.top_info_selection=index;
        $(this.menu_doms).removeClass('active');
        $(this.top_info_doms).removeClass('active');
        $(this.top_info_doms[index]).addClass('active');
    },

    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                this.showStreamPage();
                break;
            case "top_info_selection":
                switch(keys.top_info_selection){
                    case 0:
                        $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
                        $(this.top_info_doms[2]).val('')
                        this.renderCategories();
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
        }
    },
    handleMenusUpDown:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "top_info_selection":
                if(this.menu_doms.length>0 && increment>0)
                    this.hoverMenuItem(0);
                break;
            case "menu_selection":
                var prev_value=keys.menu_selection;
                keys.menu_selection+=increment*2;
                if(keys.menu_selection<0)
                {
                    this.hoverTopIcon(1);
                    return;
                }
                if(keys.menu_selection>=this.menu_doms.length)
                    keys.menu_selection=prev_value;
                this.hoverMenuItem(keys.menu_selection);
                break;
        }
    },
    handleMenuLeftRight:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                keys.menu_selection+=increment;
                if(keys.menu_selection<0)
                    keys.menu_selection=0;
                if(keys.menu_selection>=this.menu_doms.length)
                    keys.menu_selection=this.menu_doms.length-1;
                this.hoverMenuItem(keys.menu_selection);
                break;
            case "top_info_selection":
                var prev_top_info_selection=keys.top_info_selection;
                keys.top_info_selection+=increment;
                var search_input_activated=$(this.page_element).find('.page-top-info-container').hasClass('search-input-activated');
                if(!search_input_activated)
                    keys.top_info_selection=prev_top_info_selection==1 ? 3 : 1;
                if(keys.top_info_selection<0)
                    keys.top_info_selection=0;
                if(keys.top_info_selection>=this.top_info_doms.length)
                    keys.top_info_selection=this.top_info_doms.length-1;
                this.hoverTopIcon(keys.top_info_selection);
                break;
        }
    },
    HandleKey:function(e){
        switch (e.keyCode) {
            case tvKey.RIGHT:
                this.handleMenuLeftRight(1);
                break;
            case tvKey.LEFT:
                this.handleMenuLeftRight(-1);
                break;
            case tvKey.DOWN:
                this.handleMenusUpDown(1)
                break;
            case tvKey.UP:
                this.handleMenusUpDown(-1)
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
