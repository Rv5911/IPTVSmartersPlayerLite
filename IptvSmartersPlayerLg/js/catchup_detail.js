"use strict";
var epg_page={
    keys:{
        focused_part:"date_selection",//and also, there is "date_program_selection"
        date_selection:0,
        programme_selection:0
    },
    movie:{},
    sorted_programmes:[],
    date_doms:[],
    programme_doms:[],
    current_programmes:[],
    is_loading:false,
    channel_id:'',
    init:function(movie){
        showLoader(true);
        this.is_loading=true;
        this.movie=movie;
        var programmes;
        var that=this;
        var keys=this.keys;

        $.ajax({
            method:'get',
            url:api_host_url+'/player_api.php?username='+user_name+'&password='+password+'&action=get_simple_data_table&stream_id='+movie.stream_id,
            success:function (data) {
                // var programmes=data.epg_listings;
                programmes=data.epg_listings;
                programmes.map(function (item) {
                    item.start=moment(new Date(item.start_timestamp*1000)).format('Y-MM-DD HH:mm')
                    item.stop=moment(new Date(item.stop_timestamp*1000)).format('Y-MM-DD HH:mm')
                    item.title=getAtob(item.title);
                })
                that.sorted_programmes=that.sortProgrammesByDate(programmes);
                $('#catchup-detail-page').removeClass('hide');
                var html="";
                that.sorted_programmes.map(function (item,index) {
                    html+=
                        '<div class="epg-date-item-container"' +
                        '   onmouseenter="epg_page.selectDate('+index+')"' +
                        '   onclick="epg_page.handleMenuClick()"'+
                        '>\n' +
                        '   <div class="epg-date-item-date">'+item.day_string+'</div>\n' +
                        '</div>'
                })
                $('#epg-dates-container').html(html);
                that.date_doms=$('.epg-date-item-container');


                keys.focused_part="programme_selection";
                keys.date_selection=0;
                var today_date=moment().format("YYYY-MM-DD");
                for(var i=0;i<that.sorted_programmes.length;i++){
                    if(that.sorted_programmes[i].date_string>=today_date){
                        keys.date_selection=i;
                        break;
                    }
                }
                $(that.date_doms[keys.date_selection]).addClass('active');
                that.selectDate(keys.date_selection);
                keys.programme_selection=0;
                var current_time=moment().format('YYYY-MM-DD HH:mm:ss');
                for(var i=0;i<that.sorted_programmes[keys.date_selection].programmes;i++){
                    var item=that.sorted_programmes[keys.date_selection].programmes[i];
                    var stop=item.stop;
                    if(stop>=current_time)
                    {
                        keys.programme_selection=i;
                        break;
                    }
                }
                that.hoverProgramme(keys.programme_selection);
                current_route="catch-up-detail";
                showLoader(false);
                that.is_loading=false;
            },
            error:function(){
            }
        })
    },
    goBack:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "programme_selection":
                $('#catchup-detail-page').addClass('hide');
                $('#catchup-channel-page').removeClass('hide');
                current_route="catch-up";
                break;
        }
    },
    sortProgrammesByDate:function (programmes) {
        var sorted_programmes={};
        var current_time=moment().format('Y-MM-DD HH:mm:ss');
        for(var i=0;i<programmes.length;i++){
            var item=programmes[i];
            if(item.start>=current_time || item.stop>=current_time)
                break;
            var start=item.start;
            var start_date=start.substr(0,10);

            if(typeof sorted_programmes[start_date]!="undefined"){
                sorted_programmes[start_date].programmes.push(item);
            }else{
                var date_obj=moment(start,'Y-MM-DD HH:mm:ss');
                var day_string=date_obj.format('DD MMM YYYY');
                var date_string=date_obj.format('YYYY-MM-DD');

                sorted_programmes[start_date]=
                    {
                        day_string:day_string,
                        date_string:date_string,
                        programmes:[
                            item
                        ]
                    }
            }

        }



        var results=[];
        Object.keys(sorted_programmes).map(function (key) {
            results.push(sorted_programmes[key]);
        })
        return results;
    },
    selectDate:function(index){
        if(this.sorted_programmes.length>0){
            this.keys.date_selection=index;
            var html="";
            this.current_programmes=this.sorted_programmes[index].programmes;
            this.sorted_programmes[index].programmes.map(function (item,index) {
                html+=
                    '<div class="epg-programme-item-container">'+
                    '   <div class="epg-programme-item-wrapper"' +
                    '       onmouseenter="epg_page.hoverProgramme('+index+')"'+
                    '       onclick="epg_page.handleMenuClick()"'+
                    '   >' +
                    '       <div class="epg-programme-title">' +
                                item.title+
                    '      </div>'+
                    '       <div class="epg-time-icon-container">' +
                    '           <img class="epg-clock-icon" src="images/tv_arch.png">'+
                    '          <span class="epg-programme-time">'+
                                    item.start.substr(11,5)+' - '+item.stop.substr(11,5)+
                    '           </span>' +
                    '      </div>'+
                    '   </div>'+
                    '</div>'
            })
            $('#epg-programmes-container').html(html);
            $('#epg-programmes-container').scrollLeft(0);
            this.keys.programme_selection=0;
            this.programme_doms=$('.epg-programme-item-wrapper ');
            $(this.programme_doms[0]).addClass('active');
        }
        this.date_doms.removeClass('active');
        $(this.date_doms[index]).addClass('active');
        moveScrollPosition($('#epg-dates-container'),this.date_doms[index],'horizontal',false);
    },
    hoverProgramme:function(index){
        this.keys.programme_selection=index;
        $(this.programme_doms).removeClass('active');
        $(this.programme_doms[index]).addClass('active');
        moveScrollPosition($('#epg-programmes-container'),$(this.programme_doms[index]).closest('.epg-programme-item-container'),'vertical',false);
    },
    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "programme_selection":
                var programme=this.sorted_programmes[keys.date_selection].programmes[keys.programme_selection];
                $('#catchup-detail-page').addClass('hide');
                epg_player_page.init(this.movie,programme);
                break;
        }

    },
    handleMenusUpDown:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "programme_selection":
                keys.programme_selection+=increment;
                if(keys.programme_selection<0)
                    keys.programme_selection=0;
                if(keys.programme_selection>=this.current_programmes.length)
                    keys.programme_selection=this.current_programmes.length-1;
                this.hoverProgramme(keys.programme_selection);
                break;
        }
    },
    handleMenuLeftRight:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "programme_selection":
                keys.date_selection+=increment;
                if(keys.date_selection<0)
                    keys.date_selection=0;
                if(keys.date_selection>=this.sorted_programmes.length)
                    keys.date_selection=this.sorted_programmes.length-1;
                this.selectDate(keys.date_selection);
                break;
        }
    },
    HandleKey:function(e) {
        if(!this.is_loading){
            switch (e.keyCode) {
                case tvKey.RIGHT:
                    epg_page.handleMenuLeftRight(1)
                    break;
                case tvKey.LEFT:
                    epg_page.handleMenuLeftRight(-1)
                    break;
                case tvKey.DOWN:
                    epg_page.handleMenusUpDown(1);
                    break;
                case tvKey.UP:
                    epg_page.handleMenusUpDown(-1);
                    break;
                case tvKey.ENTER:
                    epg_page.handleMenuClick();
                    break;
                case tvKey.RETURN:
                case tvKey.RETURN_LG:case tvKey.ESC:
                    this.goBack();
                    break;

            }
        }
    }
}

