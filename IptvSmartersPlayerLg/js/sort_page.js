"use strict";
var sort_page={
    keys:{
        focused_part:"menu_selection",  //operation_modal
        menu_selection:0
    },
    menu_doms:$('.sort-modal-item '),
    prev_route:'',
    max_sort_option_length:4,
    init:function(prev_route){
        current_route='sort-page';
        this.prev_route=prev_route;
        $('#sort-modal').modal('show');
        var sort_key;
        if(prev_route==='channel-page'){
            this.max_sort_option_length=5;
            $('.sort-modal-item.channel-sort').show();
            sort_key='live_sort';
        }
        else{
            this.max_sort_option_length=3;
            $('.sort-modal-item.channel-sort').hide();
            sort_key=vod_series_page.video_type+'_sort';
        }


//        alert(vod_series_page.video_type);
        var sort=settings[sort_key];
//        console.log(settings);
        this.hoverMenuItem(0);
        $('input[name="sort"][value="'+sort+'"]').prop('checked',true);
    },
    goBack:function(){
        $('#sort-modal').modal('hide');
        current_route=this.prev_route;
    },
    hoverMenuItem:function(index){
        var keys=this.keys;
        keys.menu_selection=index;
        $(this.menu_doms).removeClass('active');
        $(this.menu_doms[index]).addClass('active');
    },
    handleMenuClick:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                if(keys.menu_selection<6){
                    $(this.menu_doms[keys.menu_selection]).find('input').prop('checked',true);
                }
                if(keys.menu_selection==6){
                    this.goBack();
                    var sort=$("input[name='sort']:checked").val();
                    var sort_key;
                    if(this.prev_route==='channel-page'){
                        sort_key='live_sort';
                        if(settings[sort_key]!=sort){
                            settings.saveSettings(sort_key,sort,'');
                            channel_page.current_category_id=-1;
                            channel_page.showCategoryContent();
                        }
                    }
                    if(this.prev_route==='vod-series-page'){
                        sort_key=vod_series_page.video_type+'_sort';
                        if(settings[sort_key]!=sort){
                            settings.saveSettings(sort_key,sort,'');
                            vod_series_page.current_showed_category=-1;
                            vod_series_page.showCategoryContent();
                        }
                    }
                }
                if(keys.menu_selection==7)
                    this.goBack();
                break;
        }
    },
    handleMenuLeftRight:function(increment){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                if(keys.menu_selection>=6){
                    keys.menu_selection+=increment;
                    if(keys.menu_selection<6)
                        keys.menu_selection=6;
                    if(keys.menu_selection>7)
                        keys.menu_selection=7;
                    this.hoverMenuItem(keys.menu_selection);
                }
                break;

        }

    },
    handleMenuUpDown:function(increment){
        var keys=this.keys;
//        alert(keys.focused_part);
        switch (keys.focused_part) {
            case "menu_selection":
                if(this.prev_route==='channel-page'){
                  keys.menu_selection+=increment;
                }else{
                    if(increment == -1){
                        if(keys.menu_selection == '6'){
                            keys.menu_selection = 3
                        }else{
                            keys.menu_selection+=increment;
                        }
                    }else{
                        keys.menu_selection+=increment;
                    }

                }

//                alert(keys.menu_selection+" , "+increment+" , "+this.max_sort_option_length);
//                alert(increment);
//                alert(increment);

                if(keys.menu_selection<0){
                    keys.menu_selection=0;
                }
                if(increment>0 && keys.menu_selection==this.max_sort_option_length){
                    keys.menu_selection=this.max_sort_option_length;
//                    alert("entered 1");
                }
                if(increment>0 && keys.menu_selection>this.max_sort_option_length){
                    keys.menu_selection=6;
//                    alert("entered 2");
                }
                this.hoverMenuItem(keys.menu_selection);
                break;
        }
    },

    HandleKey:function (e) {
        switch (e.keyCode) {
            case tvKey.RIGHT:
                this.handleMenuLeftRight(1)
                break;
            case tvKey.LEFT:
                this.handleMenuLeftRight(-1)
                break;
            case tvKey.DOWN:
                this.handleMenuUpDown(1);
                break;
            case tvKey.UP:
                this.handleMenuUpDown(-1);
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
