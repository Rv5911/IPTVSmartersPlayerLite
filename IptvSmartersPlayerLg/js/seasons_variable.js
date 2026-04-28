"use strict";
var seasons_page={
    keys:{
        focused_part:'menu_selection', // grid_part
        menu_selection:0,
        top_info_selection:0
    },
    seasons:[],
    all_seasons:[],
    menu_doms:[],
    top_info_doms:$('#seasons-page .top-info-item'),
    page_element:$('#seasons-page'),
    search_timer:null,

    init:function(){
        showLoader(true);
        this.seasons=current_series.seasons;
        this.all_seasons=current_series.seasons;
        current_route='seasons-page';
        $('#seasons-page').removeClass('hide');
        $('#season-page-series-name').text(current_series.name);
        var keys=this.keys;
        keys.focused_part="menu_selection";
        $('#season-page').removeClass('hide');
        this.renderSeasons();
        keys.menu_selection=0;
        $(this.menu_doms[keys.menu_selection]).addClass('active');
        showLoader(false);
    },
    renderSeasons:function(){
        var htmlContents='';
        this.seasons.map(function (item,index) {
            if(typeof item.episodes=='undefined')
                item.episodes=[];
            htmlContents+=
                '<div class="season-item-container">\n' +
                '   <div class="season-item-wrapper"' +
                '       onmouseenter="seasons_page.hoverMenuItem('+index+')"'+
                '       onclick="seasons_page.handleMenuClick()"'+
                '>\n' +
                '       <span class="season-item-icon">\n' +
                '           <img src="images/tv_icon.png">\n' +
                '       </span>\n' +
                '       <span class="season-item-name">\n' +
                item.name+
                '       </span>\n' +
                '       <span class="season-stream-count-container">\n' +
                // '           <span class="season-stream-count">'+item.episodes.length+'</span>\n' +
                '           <span class="season-count-icon">\n' +
                '               <img src="images/forward_arrow.png">\n' +
                '           </span>\n' +
                '       </span>\n' +
                '    </div>\n' +
                '</div>'
        })
        $('#season-page-items-container').html(htmlContents);
        $('#season-page-items-container').scrollTop(0);
        this.menu_doms=$('.season-item-wrapper');
    },
    keyChange:function(){
        clearTimeout(this.search_timer);
        var that=this;
        this.search_timer=setTimeout(function () {
            var keys=that.keys;
            var keyword=$(that.top_info_doms[2]).val();
            var seasons;
            if(keyword==='')
                seasons=that.all_seasons;
            else{
                seasons=that.all_seasons.filter(function (item) {
                    return item.name.toLowerCase().includes(keyword.toLowerCase());
                })
            }
            that.seasons=seasons;
            that.renderSeasons();
        },300)
    },
    hoverTopIcon:function(index){
        var keys=this.keys;
        keys.focused_part='top_info_selection';
        keys.top_info_selection=index;
        $(this.menu_doms).removeClass('active');
        $(this.top_info_doms).removeClass('active');
        $(this.top_info_doms[index]).addClass('active');
    },
    hoverMenuItem:function(index){
        var keys=this.keys;
        keys.menu_selection=index;
        keys.focused_part="menu_selection";
        $(this.top_info_doms).removeClass('active');
        $(this.menu_doms).removeClass('active');
        $(this.menu_doms[index]).addClass('active');
        moveScrollPosition($('#season-page-items-container'),this.menu_doms[index],'vertical',false);
    },
    moveKey:function(increment){
        var keys=this.keys;
        keys.menu_selection+=increment;
        if(keys.menu_selection<0){
            keys.menu_selection=0;
            if(Math.abs(increment)>1){
                this.hoverTopIcon(1);
                return;
            }
        }
        if(keys.menu_selection>=this.menu_doms.length)
            keys.menu_selection=this.menu_doms.length-1;
        this.hoverMenuItem(keys.menu_selection);
    },
    handleMenusUpDown:function(increment){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                this.moveKey(2*increment);
                break;
            case "top_info_selection":
                if(increment>0 && this.menu_doms.length>0)
                    this.hoverMenuItem(0);
                break;
        }
    },
    handleMenuLeftRight:function(increment){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                this.moveKey(increment);
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
    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                var episodes=this.seasons[keys.menu_selection].episodes;
                $('#seasons-page').addClass('hide');
                episode_page.init(episodes,'seasons-page');
                break;
            case "top_info_selection":
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
    goBack:function(){
        var keys=this.keys;
        $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
        $(this.top_info_doms[2]).val('')
        switch (keys.focused_part) {
            case "menu_selection":
                break;
            case "top_info_selection":
                this.hoverTopIcon(1);
                break;
        }
        current_route="series-summary-page";
        $('#seasons-page').addClass('hide');
        $('#series-summary-page').removeClass('hide');
    },
    HandleKey:function(e){
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
