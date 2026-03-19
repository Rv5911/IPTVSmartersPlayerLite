"use strict";
var refresh_confirm_page={
    keys:{
        focused_part:"menu_selection",  //operation_modal
        menu_selection:0
    },
    menu_doms:$('.refresh-confirm-btn'),
    prev_route:'',
    is_loading:false,
    init:function(prev_route){
        this.is_loading=false;
        current_route='refresh-confirm-page';
        this.prev_route=prev_route;
        $('#refresh-confirm-modal').modal('show');
        this.hoverMenuItem(1);
    },
    goBack:function(){
        $('#refresh-confirm-modal').modal('hide');
        current_route=this.prev_route;
    },
    refreshContent:function(){
        $('#refresh-confirm-modal').modal('hide');
        if(this.prev_route==='channel-page'){
            if(playlist.type==='xtreme'){
                $('#loading-content-text-2').text('Downloading TV Guide');
                $('#loading-content-backdrop').show();
                this.is_loading=true;

                var that=this;
                var parse_epg_url=playlist.url+'/xmltv.php?username='+playlist.user_name+'&password='+playlist.password;
                var start_time1=new Date().getTime()/1000;
                that.is_loading=false;
                $.ajax({
                    method:'get',
                    url:parse_epg_url,
                    success:function (data) {
                        var start_time2=new Date().getTime()/1000;
                        if(typeof data=='string'){  // if data type is string
                            data=$.parseXML(data);
                        }
                        setTimeout(function () {
                            var programme_objs=data.getElementsByTagName('programme');
                            var programmes={}
                            for(var i=0;i<programme_objs.length;i++){
                                try{
                                    var obj_temp=programme_objs[i];
                                    var channel_id=obj_temp.getAttribute('channel');
                                    var start=obj_temp.getAttribute('start');
                                    var stop=obj_temp.getAttribute('stop');
                                    var title=obj_temp.getElementsByTagName('title')[0].childNodes[0].nodeValue;
                                    var desc_obj=obj_temp.getElementsByTagName('desc');
                                    var temp={
                                        start:start,
                                        stop:stop,
                                        title:title,
                                        desc:desc_obj
                                    }
                                    if(typeof programmes[channel_id]!='undefined'){
                                        programmes[channel_id].push(temp)
                                    }else{
                                        programmes[channel_id]=[
                                            temp
                                        ]
                                    }
                                }catch (e) {
                                    // console.log(e);
                                }
                            }
                            var end_time2=new Date().getTime()/1000;
                            console.log('Epg Parsing time=',end_time2-start_time2);
                            LiveModel.saveProgrammes(programmes,'epg_channel_id');
                            showLoader(false);
                            saveData('app_loading',false);
                        },500)
                    },
                    error:function (error) {
                        console.log(error);
                    }
                })
            }
        }
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
                $(this.menu_doms[keys.menu_selection]).trigger('click');
                break;
        }
    },
    handleMenuLeftRight:function(increment){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                keys.menu_selection+=increment;
                if(keys.menu_selection<0)
                    keys.menu_selection=0;
                if(keys.menu_selection>1){
                    keys.menu_selection=1;
                }
                this.hoverMenuItem(keys.menu_selection);
                break;
        }
    },
    handleMenuUpDown:function(increment){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                keys.menu_selection+=increment;
                if(keys.menu_selection<0)
                    keys.menu_selection=0;
                if(increment>0 && keys.menu_selection>=this.max_sort_option_length)
                    keys.menu_selection=6;
                if(increment<0 && keys.menu_selection>=this.max_sort_option_length)
                    keys.menu_selection=this.max_sort_option_length;
                this.hoverMenuItem(keys.menu_selection);
                break;
        }
    },

    HandleKey:function (e) {
        if(this.is_loading)
            return;
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
