"use strict";
var video_settings_page={
    keys:{
        focused_part:'setting_item', // grid_part
        index:0,
        subtitle_font_selection:0
    },
    prev_route:'',
    doms:[],
    subtitle_font_doms:[],
    timer:null,
    timeout:1000000,
    draw_subtitle_fonts:false,
    init:function(prev_route){
        this.prev_route=prev_route;
        $('#video-settings-page').addClass('expanded');
        current_route='video-settings-page';
        var current_stream_info={};
        try{
            var temps=webapis.avplay.getCurrentStreamInfo();
            for(var i=0;i<temps.length;i++){
                current_stream_info[temps[i].type]=temps[i].index;
            }
        }catch (e) {
        }
        var video_tracks=media_player.getSubtitleOrAudioTrack('VIDEO');
        var video_track_html=this.makeMediaTrackElement(video_tracks,'VIDEO',1,current_stream_info);
        $('#video-tracks-container').html(video_track_html);
        var video_track_length=video_tracks.length==0 ? 0 : (video_tracks.length+1);
        var audio_tracks=media_player.getSubtitleOrAudioTrack('AUDIO');
        var audio_track_html=this.makeMediaTrackElement(audio_tracks,'AUDIO',video_track_length+1,current_stream_info);
        $('#audio-tracks-container').html(audio_track_html);
        var audio_track_length=audio_tracks.length==0 ? 0 : (audio_tracks.length+1);
        var subtitle_tracks=media_player.getSubtitleOrAudioTrack('TEXT');
        var subtitle_track_html=this.makeMediaTrackElement(subtitle_tracks,'TEXT',video_track_length+audio_track_length+1,current_stream_info);
        $('#subtitle-tracks-container').html(subtitle_track_html);

        $('#subtitle-font-size').text(settings.subtitle_font_size);
        this.doms=$('.video-setting-item');
        $(this.doms[0]).addClass('active');
        this.keys.index=0;
        this.reinitTimer();
        if(!this.draw_subtitle_fonts){
            var current_subtitle_font_size=settings.subtitle_font_size;
            var font_size_array=[];
            var current_font_size_index=0;
            for(var i=0;i<26;i++){
                font_size_array.push(i+14);
            }
            var htmlContent='';
            font_size_array.map(function (item, index) {
                if(item===current_subtitle_font_size)
                    current_font_size_index=index;
                htmlContent+=
                    '<div class="subtitle-font-setting-item" data-font_size="'+item+'"\
                       onmouseenter="video_settings_page.hoverFontSettingItem('+index+')"\
                       onclick="video_settings_page.handleMenuClick()"\
                    >\
                       <input class="magic-radio" type="radio" name="radio" value="'+item+'" '+'>\
                       <label>'+item+'</label>\
                    </div>';
            })
            $('#video-subtitle-font-setting-items-container').html(htmlContent);
            this.subtitle_font_doms=$('.subtitle-font-setting-item');
            this.keys.subtitle_font_selection=current_font_size_index;
            $(this.subtitle_font_doms[this.keys.subtitle_font_selection]).addClass('active');
            this.draw_subtitle_fonts=true;
        }
    },
    goBack:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "setting_item":
                $('#video-subtitle-font-setting-container').hide();
                this.keys.focused_part="setting_item";
                current_route=this.prev_route;
                $('#video-settings-page').removeClass('expanded');
                break;
            case "subtitle_font_selection":
                keys.focused_part='setting_item';
                $('#video-subtitle-font-setting-container').hide();
                break;
        }
    },
    reinitTimer:function(){
        // clearTimeout(this.timer);
        // var that=this;
        // this.timer=setTimeout(function () {
        //     that.goBack();
        // },this.timeout);
    },
    makeMediaTrackElement:function(items,kind, min_index,current_stream_info){
        var htmlContent;
        if(items.length==0){
            var video_setting_item_msg='';
            htmlContent=
                '<div class="video-setting-item-msg">';
                    switch (kind) {
                        case 'TEXT':
                            video_setting_item_msg='';
                            break;
                        case "VIDEO":
                            video_setting_item_msg='';
                            break;
                        case "AUDIO":
                            video_setting_item_msg='';
                            break;
                    }
            htmlContent+=video_setting_item_msg+'</div>'
            return htmlContent;
        }
        var checked='';
        if(typeof current_stream_info[kind]!='undefined' && current_stream_info[kind]==-1)
            checked='checked';
        htmlContent=
            '<div class="video-setting-item" data-kind="'+kind+'" ' +
            '   onmouseenter="video_settings_page.hoverSettingItem('+(min_index)+')"'+
            '   onclick="video_settings_page.handleMenuClick()"'+
            '>\n' +
            '   <input class="magic-radio" type="radio" name="'+kind+'-track" value="-1" '+checked+ '>\n' +
            '   <label for="disable-'+kind+'">Disabled</label>\n' +
            '</div>';
        var language_key="track_lang";
        if(kind!=="TEXT")
            language_key="language";
        items.map(function(item, index){
            if(typeof current_stream_info[kind]!='undefined' && current_stream_info[kind]==item.index)
                checked='checked';
            var extra_info=item.extra_info;
            var sample_rate=typeof extra_info.sample_rate!="undefined" ? (extra_info.sample_rate+'Hz') : 'N/A';

            var content_txt=item.index+","+kind+","+extra_info.fourCC+","+sample_rate+",";
            if(kind==='VIDEO')
                content_txt+=(extra_info.Width+' x '+extra_info.Height);
            else
                content_txt+=extra_info[language_key];
            htmlContent+=
                '<div class="video-setting-item" data-kind="'+kind+'"\
                   onmouseenter="video_settings_page.hoverSettingItem('+(min_index+index+1)+')"\
                   onclick="video_settings_page.handleMenuClick()"\
                >\
                   <input class="magic-radio" type="radio" name="'+kind+'-track"\
                       value="'+item.index+'"'+checked+
                '  >\
                   <label for="subtitle-'+kind+'-'+index+'">'+content_txt+'</label>\
                </div>'
        })
        return htmlContent;
    },
    hoverSettingItem:function(index){
        this.reinitTimer();
        var keys=this.keys;
        if(index>=this.doms.length)
            index=this.doms.length-1;
        keys.index=index;
        $(this.doms).removeClass('active');
        $(this.doms[index]).addClass('active');
        if(index>0)
            moveScrollPosition($('#video-settings-contents-wrapper'),this.doms[index],'vertical',false);
    },
    hoverFontSettingItem:function(index){
        this.reinitTimer();
        var keys=this.keys;
        keys.subtitle_font_selection=index;
        $(this.subtitle_font_doms).removeClass('active');
        $(this.subtitle_font_doms[index]).addClass('active');
        moveScrollPosition('#video-subtitle-font-setting-items-container',this.subtitle_font_doms[keys.subtitle_font_selection],'vertical',false);
    },
    handleMenuUpDown:function(increment){
        this.reinitTimer();
        var keys=this.keys;
        switch (keys.focused_part) {
            case "setting_item":
                keys.index+=increment;
                if(keys.index<0)
                    keys.index=0;
                if(keys.index>=this.doms.length)
                    keys.index=this.doms.length-1;
                this.hoverSettingItem(keys.index);
                break;
            case "subtitle_font_selection":
                keys.subtitle_font_selection+=increment;
                if(keys.subtitle_font_selection<0)
                    keys.subtitle_font_selection=0;
                if(keys.subtitle_font_selection>=this.subtitle_font_doms.length)
                    keys.subtitle_font_selection=this.subtitle_font_doms.length-1;
                this.hoverFontSettingItem(keys.subtitle_font_selection);
                break;
        }
    },
    handleMenuClick:function(){
        this.reinitTimer();
        var keys=this.keys;
        var index=this.keys.index;
        var element=$(this.doms[index]);
        switch (keys.focused_part) {
            case "setting_item":
                if(index==0){
                    this.goBack();
                    return;
                }
                if(index<this.doms.length-1){
                    var kind=$(element).data('kind');
                    var index=$($(element).find('input')[0]).val();
                    console.log(kind, index);
                    $(element).find('input').prop('checked',true);
                    try{
                        console.log('here');
                        media_player.setSubtitleOrAudioTrack(kind,parseInt(index));
                    }catch (e) {
                        console.log(e);
                    }
                }
                else{
                    $('#video-subtitle-font-setting-container').show();
                    keys.focused_part="subtitle_font_selection";
                    moveScrollPosition('#video-subtitle-font-setting-items-container',this.subtitle_font_doms[keys.subtitle_font_selection],'vertical',false);
                    break;
                }
                break;
            case "subtitle_font_selection":
                var font_size=$(this.subtitle_font_doms[keys.subtitle_font_selection]).data('font_size');
                settings.saveSettings('subtitle_font_size',font_size,'');
                setSubtitleFontSize();
                $(this.subtitle_font_doms[keys.subtitle_font_selection]).find('input').prop('checked',true)
                break;
        }

    },
    HandleKey:function(e){
        if(!this.is_drawing){
            switch(e.keyCode){
                case tvKey.UP:
                    this.handleMenuUpDown(-1);
                    break;
                case tvKey.DOWN:
                    this.handleMenuUpDown(1);
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
