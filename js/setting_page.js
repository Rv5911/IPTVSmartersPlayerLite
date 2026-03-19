"use strict";
var setting_page={
    keys:{
        focused_part:"menu_selection", // or, "search part", "slider part", "sub menu part", "search_value"
        menu_selection:0, // the index of selected menu,
        general_section:0,
        language_section:0,
        epg_modal_section:0,
        epg_time_option:0,
        stream_format_option:0,
        time_format_section:0,
        epg_timeline_section:0,
        parent_account_section:0,
        autoplay_time_section:0,
        recent_limit_option:0,
        buffer_time_option:0,
        clear_cache_confirm_option:0
    },
    menu_doms:$('.setting-item-wrapper'),
    general_section_doms:$('.general-setting-menu'),
    language_doms:$('.language-option'),
    epg_modal_doms:$('.epg-timeshift-modal-option'),
    epg_option_doms:[],
    stream_format_doms:$('.stream-format-option'),
    time_format_doms:$('.time-format-option'),
    epg_timeline_doms:$('.epg-timeline-option'),
    parent_account_doms:$('.parent-account-item'),
    parent_account_doms_confirm:$('.parent-account-item-confirm'),
    autoplay_time_options:$('.autoplay-time-option'),
    recent_limit_options:$('.recent-limit-option'),
    buffer_time_options:$('.buffer-time-option'),
    clear_cache_confirm_options:$('.clear-cache-confirm-btn'),
    initiated:false,
    initiate_language:false,
    initiate_epg_option:false,
    initiate_stream_format:false,
    initiated_epg_timeline:false,
    is_loading:false,
    prev_route:'',
    init:function(prev_route){
        this.prev_route=prev_route;
        $('#settings-page').removeClass('hide');
        current_route='setting-page';
    },
    goBack:function(){
        var keys=this.keys;
        switch (keys.focused_part) {
            case 'menu_selection':
                $('#settings-page').addClass('hide');
                current_route=this.prev_route;
                switch (this.prev_route) {
                    case "home-page":
                        $('#home-page').removeClass('hide');
                        break;
                    case "vod-series-summary-page":
                        $('#series-summary-page').removeClass('hide');
                        break;
                    case "channel-page":

                        $('.video-error').css("display","none");
                        $('.video-loader').css("display","none");
                        $('.channel-play-state').remove();
                        $('#channel-player-note').show();
                        $('#channel-page').removeClass('hide');
                        break;
                }
                break;
            case "language_section":
                $('#general-setting-languages-container').hide();
                keys.focused_part='general_section';
                break;
            case "autoplay_time_section":
                $('#autoplay-episode-modal').hide();
                keys.focused_part='general_section';
                break;
            case "recent_limit_option":
                $('#recent-limit-modal').hide();
                keys.focused_part='general_section';
                break;
            case "buffer_time_option":
                $('#buffer-time-modal').hide();
                keys.focused_part='general_section';
                break;
            case "epg_time_option":
                $('#epg-timeshift-option-items-container').hide();
                keys.focused_part="epg_modal_section";
                break;
            case "speed_test":
                $('#speed-test-page').addClass('hide');
                $('#settings-page').removeClass('hide');
                keys.focused_part='menu_selection';
                break;
            case "clear_cache_confirm_option":
                $('#confirm-clear-cache-modal').modal('hide');
                keys.focused_part='general_section';
                break;
            // case "stream_format_option":
            //     $('#stream-format-modal').hide();
            //     keys.focused_part='menu_selection';
            //     break;
            default:
                $('.setting-modal').hide();
                keys.focused_part='menu_selection';
                break;
        }
    },
    clickGeneralSetting:function(){
        var keys=this.keys;
        if(keys.general_section<8 && (keys.general_section!=3 && keys.general_section!=5)){
            var checked=$(this.general_section_doms[keys.general_section]).find('input').prop('checked');
            $(this.general_section_doms[keys.general_section]).find('input').prop('checked',!checked);
        }
        else if(keys.general_section==3){
            $('#autoplay-episode-modal').show();
            var current_autoplay_time_index=0;
            var autoplay_time=settings.autoplay_time;
            for(var i=0;i<this.autoplay_time_options.length;i++){
                if(parseInt($(this.autoplay_time_options[i]).text())===autoplay_time){
                    current_autoplay_time_index=i;
                    break;
                }
            }
            this.hoverAutoPlayTimeOption(current_autoplay_time_index);
        }
        else if(keys.general_section==5){
            $('#confirm-clear-cache-modal').modal('show');
            this.hoverClearCacheConfirmOption(0);
        }
        else if(keys.general_section==8){
            $('#recent-limit-modal').show();
            var recent_limit_index=0;
            var recent_limit=settings.recent_limit;
            for(var i=0;i<this.recent_limit_options.length;i++){
                if(parseInt($(this.recent_limit_options[i]).text())===recent_limit){
                    recent_limit_index=i;
                    break;
                }
            }
            this.hoverRecentLimitOption(recent_limit_index);
        }
        else if(keys.general_section==9){
            $('#buffer-time-modal').show();
            var buffer_time_index=0;
            var buffer_time=settings.buffering_time;
            for(var i=0;i<this.buffer_time_options.length;i++){
                if(parseInt($(this.buffer_time_options[i]).text())===buffer_time){
                    buffer_time_index=i;
                    break;
                }
            }
            this.hoverBufferTimeOption(buffer_time_index);
        }
        else{
            switch (keys.general_section) {
                // case 9:
                //     $(this.general_section_doms[9]).find('input').focus();
                //     break;
                // case 10:
                //     keys.language_section=0;
                //     if(!this.initiate_language){
                //         for(var i=0;i<this.language_doms.length;i++){
                //             var language=$(this.language_doms[i]).text();
                //             if(language==settings.language){
                //                 keys.language_section=i;
                //                 break;
                //             }
                //         }
                //         this.initiate_language=true;
                //     }
                //     keys.focused_part='language_section';
                //     $('#general-setting-languages-container').show();
                //     this.hoverLanguageOption(keys.language_section);
                //     break;
                case 10:
                    this.saveGeneralSetting();
                    break;
                case 11:
                    this.goBack();
                    break;
            }
        }
    },
    saveGeneralSetting:function(){
        var show_full_epg=$(this.general_section_doms[0]).find('input').prop('checked');
        show_full_epg=show_full_epg ? 1 : 0;
        settings.saveSettings('show_full_epg',show_full_epg,'')

        var active_subtitle=$(this.general_section_doms[1]).find('input').prop('checked');
        active_subtitle=active_subtitle ? 1 : 0;
        settings.saveSettings('active_subtitle',active_subtitle,'');

        var enable_autoplay=$(this.general_section_doms[2]).find('input').prop('checked');
        enable_autoplay=enable_autoplay ? 1 : 0;
        settings.saveSettings('enable_autoplay',enable_autoplay,'');

        var autoplay_time=parseInt($(this.general_section_doms[3]).find('.setting-modal-span-1').text());
        settings.saveSettings('autoplay_time',autoplay_time,'');

        var auto_clear_cache=$(this.general_section_doms[4]).find('input').prop('checked');
        auto_clear_cache=auto_clear_cache ? 1 : 0;
        settings.saveSettings('auto_clear_cache',auto_clear_cache,'');

        var show_epg_in_channel=$(this.general_section_doms[6]).find('input').prop('checked');
        show_epg_in_channel=show_epg_in_channel ? 1 : 0;
        settings.saveSettings('show_epg_in_channel',show_epg_in_channel,'');
        if(show_epg_in_channel==0)
            $('#channel-page-programmes-container').html('').hide();
        else
            $('#channel-page-programmes-container').show();


        var autoplay_in_channel=$(this.general_section_doms[7]).find('input').prop('checked');
        autoplay_in_channel=autoplay_in_channel ? 1 : 0;
        settings.saveSettings('auto_play_channel',autoplay_in_channel,'');

        var recent_limit=parseInt($(this.general_section_doms[8]).find('.setting-modal-span-1').text());
        settings.saveSettings('recent_limit',recent_limit,'');

        var buffer_time=parseInt($(this.general_section_doms[9]).find('.setting-modal-span-1').text());
        settings.saveSettings('buffering_time',buffer_time,'');
        this.goBack();
    },
    saveEpgTimeShift:function(){
        settings.epg_time_shift=$('#epg-timeshift').val();
        settings.saveSettings('epg_time_shift',settings.epg_time_shift,'');
        this.goBack();
    },
    saveStreamFormat:function(){
        var stream_format=$("input[name='stream-format']:checked").val();
        if(typeof stream_format!='undefined')
            settings.saveSettings('stream_format',stream_format,'');
        this.goBack();
    },
    clearCache:function(){
        var storage=localStorage;
        var keys=Object.keys(storage);
        keys.map(function (key) {
            if(key.includes(storage_id) && !key.includes('playlists') && !key.includes('latest_playlist') && !key.includes('terms_accepted')){
                localStorage.removeItem(key);
            }
        })
        this.goBack();
    },
    hoverEpgModal:function(index){
        var keys=this.keys;
        keys.epg_modal_section=index;
        $(this.epg_modal_doms).removeClass('active');
        $(this.epg_modal_doms[index]).addClass('active');
    },
    hoverEpgSection:function(index){
        this.keys.epg_time_option=index;
        $(this.epg_option_doms).removeClass('active');
        $(this.epg_option_doms[index]).addClass('active');
        moveScrollPosition($('#epg-time-option-items-wrapper'),this.epg_option_doms[index],'vertical',false)
    },
    hoverMenuItem:function(index){
        var keys=this.keys;
        keys.menu_selection=index;
        $(this.menu_doms).removeClass('active');
        $(this.menu_doms[index]).addClass('active');
    },
    hoverGeneralSection:function(index){
        var keys=this.keys;
        keys.focused_part='general_section';
        keys.general_section=index;
        $(this.general_section_doms).removeClass('active');
        $(this.general_section_doms[index]).addClass('active');
        if(index!=0)
            moveScrollPosition($('#general-setting-modal .setting-modal-body'),this.general_section_doms[index],'vertical',false);
        else
            $('#general-setting-modal .setting-modal-body').animate({ scrollTop: 0}, 10);
    },
    hoverLanguageOption:function(index){
        var keys=this.keys;
        keys.focused_part='language_section';
        keys.language_section=index;
        $(this.language_doms).removeClass('active');
        $(this.language_doms[index]).addClass('active');
        moveScrollPosition($('#general-languages-container'),this.language_doms[index],'vertical',false);
    },
    hoverStreamFormatOption:function(index){
        this.keys.focused_part='stream_format_option';
        this.keys.stream_format_option=index;
        $(this.stream_format_doms).removeClass('active');
        $(this.stream_format_doms[index]).addClass('active');
    },
    hoverTimeFormat:function(index){
        this.keys.focused_part='time_format_section';
        this.keys.time_format_section=index;
        $(this.time_format_doms).removeClass('active');
        $(this.time_format_doms[index]).addClass('active');
    },
    hoverEpgTimeLine:function(index){
        $(this.epg_timeline_doms).removeClass('active');
        $(this.epg_timeline_doms[index]).addClass('active');
        this.keys.epg_timeline_section=index;
    },
    hoverParentAccountMouse:function(index){
        $(this.parent_account_doms).removeClass('active');
        $(this.parent_account_doms[index]).addClass('active');
        this.keys.focused_part='parent_account_section';
        this.keys.parent_account_section=index;
//        $('.parent-account-item').blur();
    },
    hoverParentAccount:function(index){
        $(this.parent_account_doms).removeClass('active');
        $(this.parent_account_doms[index]).addClass('active');
        this.keys.focused_part='parent_account_section';
        this.keys.parent_account_section=index;
        $('.parent-account-item').blur();
    },
    hoverParentAccountConfirm:function(index){
        $(this.parent_account_doms_confirm).removeClass('active');
        $(this.parent_account_doms_confirm[index]).addClass('active');
        this.keys.focused_part='parent_account_section_confirm';
        this.keys.parent_account_section=index;
        $('.parent-account-item-confirm').blur();
    },
    hoverAutoPlayTimeOption:function(index){
        var keys=this.keys;
        keys.focused_part="autoplay_time_section";
        keys.autoplay_time_section=index;
        $(this.autoplay_time_options).removeClass('active');
        $(this.autoplay_time_options[index]).addClass('active');
    },
    hoverRecentLimitOption:function(index){
        var keys=this.keys;
        keys.focused_part="recent_limit_option";
        keys.recent_limit_option=index;
        $(this.recent_limit_options).removeClass('active');
        $(this.recent_limit_options[index]).addClass('active');
    },
    hoverBufferTimeOption:function(index){
        var keys=this.keys;
        keys.focused_part="buffer_time_option";
        keys.buffer_time_option=index;
        $(this.buffer_time_options).removeClass('active');
        $(this.buffer_time_options[index]).addClass('active');
    },
    hoverClearCacheConfirmOption:function(index){
        var keys=this.keys;
        keys.focused_part="clear_cache_confirm_option";
        keys.clear_cache_confirm_option=index;
        $(this.clear_cache_confirm_options).removeClass('active');
        $(this.clear_cache_confirm_options[index]).addClass('active');
    },
    handleMenuClick:function(type){
           var keys=this.keys;

        switch (keys.focused_part) {
            case "menu_selection":
                switch (keys.menu_selection) {
//                    case 0:
//                        $('#general-setting-modal').show();
//                        $(this.general_section_doms[0]).find('input').prop('checked',!!settings.show_full_epg);
//                        $(this.general_section_doms[1]).find('input').prop('checked',!!settings.active_subtitle);
//                        $(this.general_section_doms[2]).find('input').prop('checked',!!settings.enable_autoplay);
//                        $(this.general_section_doms[3]).find('.setting-modal-span-1').text(settings.autoplay_time+'s');
//                        $(this.general_section_doms[4]).find('input').prop('checked',!!settings.auto_clear_cache);
//                        $(this.general_section_doms[6]).find('input').prop('checked',!!settings.show_epg_in_channel);
//                        $(this.general_section_doms[7]).find('input').prop('checked',!!settings.auto_play_channel);
//                        $(this.general_section_doms[8]).find('.setting-modal-span-1').text(settings.recent_limit);
//                        $(this.general_section_doms[9]).find('.setting-modal-span-1').text(settings.buffering_time+'s');
//                        this.hoverGeneralSection(0)
//                        break;
                    // case 1:
                    //     $('#epg-timeshift-modal').show();
                    //     keys.epg_modal_section=0;
                    //     $(this.epg_modal_doms).removeClass('active');
                    //     $(this.epg_modal_doms[0]).addClass('active');
                    //     keys.focused_part='epg_modal_section';
                    //     break;
                    case 0:
                        $('#stream-format-modal').show();
                        $('input[name="stream-format"][value="'+settings.stream_format+'"]').prop('checked',true);
                        this.hoverStreamFormatOption(0)
                        break;
                    case 1:
                        $('#time-format-modal').show();
                        if(!this.initiate_stream_format){
                            $('input[name="time-format"][value="'+settings.time_format+'"]').prop('checked',true);
                            this.initiate_stream_format=true;
                        }
                        this.hoverTimeFormat(0);
                        break;
                    case 2:
                        var savedPassword = localStorage.getItem(storage_id+'parent_account_password');
                        if(savedPassword == null){
                          $('#parent-account-modal').show();
                          $('#parent-password').val('');
                          $('#parent-password-confirm').val('');
                          $('#parent-account-error').hide();
                          this.hoverParentAccount(0);
                        }else{
                        	$('#parent-account-modal-confirm').show();
                            $('#parent-password-confirm-confirm').val('');
                            $('#parent-account-error-confirm').hide();
                            this.hoverParentAccountConfirm(0);
                        }
                        break;
                    case 3:
                            clear_cache_page.init(current_route);
                        break;
                    case 5:
                        $('#epg-timeline-modal').show();
                        keys.focused_part='epg_timeline_section';
                        this.hoverEpgTimeLine(0);
                        if(!this.initiated_epg_timeline){
                            $('input[name="epg-timeline"][value="'+settings.epg_timeline+'"]').prop('checked',true);
                            this.initiated_epg_timeline=true;
                        }
                        break;
                    case 6:
                        var that=this;
                        showLoader(true);
                        this.is_loading=true;
                        $.get("pages/openspeedtest.html", function(data) {
                            $('#settings-page').addClass('hide');
                            $("#speed-test-page").removeClass('hide');
                            $("#speed-test-page").html(data);
                            that.keys.focused_part='speed_test';
                            showLoader(false);
                            that.is_loading=false;
                        });
                        break;
                }
                break;
            case "general_section":
                this.clickGeneralSetting();
                break;
            case "language_section":
                var selected_language=$(this.language_doms[keys.language_section]).text();
                $(this.general_section_doms[4]).find('input').val(selected_language);
                this.goBack();
                break;
            case "autoplay_time_section":
                var selected_time=$(this.autoplay_time_options[keys.autoplay_time_section]).text();
                $(this.general_section_doms[3]).find('.setting-modal-span-1').text(selected_time);
                // settings.saveSettings('autoplay_time',parseInt(selected_time),'');
                this.goBack();
                break;
            case "recent_limit_option":
                var recent_limit=parseInt($(this.recent_limit_options[keys.recent_limit_option]).text());
                $(this.general_section_doms[8]).find('.setting-modal-span-1').text(recent_limit);
                this.goBack();
                break;
            case "buffer_time_option":
                var buffer_time=$(this.buffer_time_options[keys.buffer_time_option]).text();
                $(this.general_section_doms[9]).find('.setting-modal-span-1').text(buffer_time);
                this.goBack();
                break;
            case "clear_cache_confirm_option":
                $(this.clear_cache_confirm_options[keys.clear_cache_confirm_option]).trigger('click');
                break;
            case "epg_modal_section":
                switch (keys.epg_modal_section) {
                    case 0:
                        $('#epg-timeshift-option-items-container').show();
                        keys.focused_part="epg_time_option";
                        if(!this.initiate_epg_option){
                            var html='';
                            var signature='';
                            var index=0;
                            var text='';
                            keys.epg_time_option=0;
                            for(var i=-12;i<=12;i++){
                                signature=i<=0 ? '' : '+';
                                text=signature+i;
                                html+=
                                    '<div class="setting-option-item-type-1 epg-time-item"\
                                        onmouseenter="setting_page.hoverEpgSection('+index+')" \
                                        onclick="setting_page.handleMenuClick()" \
                                    >'+text+'</div>'
                                if(text===settings.epg_time_shift)
                                    keys.epg_time_option=index;
                                index++;
                            }
                            $('#epg-time-option-items-wrapper').html(html);
                            this.epg_option_doms=$('.epg-time-item');
                            console.log(keys.epg_time_option,this.epg_option_doms);
                            this.hoverEpgSection(keys.epg_time_option);
                            this.initiate_epg_option=true;
                            $('#epg-timeshift').val(settings.epg_time_shift);
                        }
                        break;
                    case 1:
                        this.saveEpgTimeShift();
                        break;
                    case 2:
                        this.goBack();
                        break;
                }
                break;
            case "epg_time_option":
                $('#epg-timeshift').val($(this.epg_option_doms[keys.epg_time_option]).text());
                this.goBack();
                break;
            case "stream_format_option":
                switch (keys.stream_format_option) {
                    case 3:
                        this.saveStreamFormat();
                        break;
                    case 4:
                        this.goBack();
                        break;
                    default:
                        var checked=$(this.stream_format_doms[keys.stream_format_option]).find('input').prop('checked');
                        $(this.stream_format_doms[keys.stream_format_option]).find('input').prop('checked',!checked);
                }
                break;
            case "time_format_section":
                if(keys.time_format_section<2){
                    var checked=$(this.time_format_doms[keys.time_format_section]).find('input').prop('checked');
                    $(this.time_format_doms[keys.time_format_section]).find('input').prop('checked',!checked);
                }
                if(keys.time_format_section==2){
                    var time_format=$("input[name='time-format']:checked").val();
                    if(typeof time_format!='undefined')
                    {
                        settings.saveSettings('time_format',time_format,'');
                        updateTimeStr();
                    }
                    this.goBack();
                }
                if(keys.time_format_section==3)
                    this.goBack();
                break;
            case "epg_timeline_section":
                if(keys.epg_timeline_section<2){
                    var checked=$(this.epg_timeline_doms[keys.epg_timeline_section]).find('input').prop('checked');
                    $(this.epg_timeline_doms[keys.epg_timeline_section]).find('input').prop('checked',!checked);
                }
                if(keys.epg_timeline_section==2){
                    var epg_timeline=$("input[name='epg-timeline']:checked").val();
                    if(typeof epg_timeline!='undefined')
                        settings.saveSettings('epg_timeline',epg_timeline,'');
                    this.goBack();
                }
                if(keys.epg_timeline_section==3)
                    this.goBack();
                break;
//            case "parent_account_section":
//                if(keys.parent_account_section == 0){
//
//                   if(type == 'k'){
//                        if ($("#parent-password").is(":focus")) {
//                           $("#parent-password").blur();
//                        }else{
//                           $("#parent-password").focus();
//                        }
//                   }
//                }else if(keys.parent_account_section == 1){
//                    if(type == 'k'){
//                        if ($("#parent-password-confirm").is(":focus")) {
//                           $("#parent-password-confirm").blur();
//                        }else{
//                           $("#parent-password-confirm").focus();
//                        }
//                    }
//                }
//
//                if(keys.parent_account_section==2){
//                    var new_password=$('#parent-password').val();
//                    var password_confirm=$('#parent-password-confirm').val();
//                    $('#parent-account-error').hide();
//                    if(new_password==''){
//                        $('#parent-account-error').text('Password is required').slideDown();
//                        return;
//                    }
//                    if(new_password!=password_confirm){
//                        $('#parent-account-error').text('Password does not match').slideDown();
//                        return;
//                    }
//                    parent_account_password=new_password;
//                    localStorage.setItem(storage_id+'parent_account_password', parent_account_password);
//                    this.goBack();
//                }
//                if(keys.parent_account_section==3)
//                    this.goBack();
//                break;
            case "parent_account_section":
//                if(keys.parent_account_section<2)
//                    $(this.parent_account_doms[keys.parent_account_section]).focus();



                if(keys.parent_account_section == 0){

                   if(type == 'k'){
                        if ($("#parent-password").is(":focus")) {
                           $("#parent-password").blur();
                        }else{
                           $("#parent-password").focus();
                        }
                   }
                }else if(keys.parent_account_section == 1){
                    if(type == 'k'){
                        if ($("#parent-password-confirm").is(":focus")) {
                           $("#parent-password-confirm").blur();
                        }else{
                           $("#parent-password-confirm").focus();
                        }
                    }
                }


                if(keys.parent_account_section==2){
                    var new_password=$('#parent-password').val();
                    var password_confirm=$('#parent-password-confirm').val();
                    $('#parent-account-error').hide();
                    if(new_password==''){
                        $('#parent-account-error').text('Password is required').slideDown();
                        return;
                    }
                    if(new_password!=password_confirm){
                        $('#parent-account-error').text('Password does not match').slideDown();
                        return;
                    }
                    parent_account_password=new_password;
                    localStorage.setItem(storage_id+'parent_account_password', parent_account_password);
                    this.goBack();
                }
                if(keys.parent_account_section==3)
                    this.goBack();
                break;

            case "parent_account_section_confirm":
//	            	if(keys.parent_account_section<1)
//	                    $(this.parent_account_doms_confirm[keys.parent_account_section]).focus();

                    if(keys.parent_account_section == 0){

                       if(type == 'k'){
                            if ($("#parent-password-confirm-confirm").is(":focus")) {
                               $("#parent-password-confirm-confirm").blur();
                            }else{
                               $("#parent-password-confirm-confirm").focus();
                            }
                       }
                    }

	                if(keys.parent_account_section==1){
	                    var password_confirm=$('#parent-password-confirm-confirm').val();
	                    $('#parent-account-error-confirm').hide();

	                    var savedPassword = localStorage.getItem(storage_id+'parent_account_password');


	                    if(password_confirm==''){
	                        $('#parent-account-error-confirm').text('Password is required').slideDown();
	                        return;
	                    }
	                    if(savedPassword!=password_confirm){
	                        $('#parent-account-error-confirm').text('Password does not match').slideDown();
	                        return;
	                    }
	                    parent_account_password=password_confirm;
	                    localStorage.setItem(storage_id+'parent_account_password', parent_account_password);
	                    this.goBack();

	                    $('#parent-account-modal').show();
                        $('#parent-password').val('');
                        $('#parent-password-confirm').val('');
                        $('#parent-account-error').hide();
                        this.hoverParentAccount(0);

	                }
	                if(keys.parent_account_section==2)
	                    this.goBack();
            		break;
        }
    },
    handleMenusUpDown:function(increment) {
        var keys=this.keys;
        switch (keys.focused_part) {
            case "menu_selection":
                var prev_selection=keys.menu_selection;
                keys.menu_selection+=4*increment;
                if(keys.menu_selection<0){
                    keys.menu_selection=prev_selection;
                    return;
                }
                if(keys.menu_selection>=this.menu_doms.length){
                    var quotient = Math.floor(this.menu_doms.length/4);
                    if(keys.menu_selection<=quotient*4-1){
                        keys.menu_selection=this.menu_doms.length-1;
                    }else{
                        keys.menu_selection=prev_selection                        ;
                    }
                }
                $(this.menu_doms).removeClass('active');
                $(this.menu_doms[keys.menu_selection]).addClass('active');
                break;
            case "general_section":
                if(keys.general_section>=this.general_section_doms.length-2){
                    if(increment>0)
                        return;
                    if(increment<0)
                        keys.general_section=this.general_section_doms.length-3;
                }
                else{
                    if((keys.general_section==2 || keys.general_section==4) && increment>0)
                        keys.general_section+=2;
                    else if((keys.general_section==3 || keys.general_section==4 || keys.general_section==6) && increment<0)
                        keys.general_section-=2;
                    else if(keys.general_section==5 && increment<0)
                        keys.general_section-=3;
                    else
                        keys.general_section+=increment;
                    if(keys.general_section<0)
                        keys.general_section=0;
                    if(keys.general_section>=this.general_section_doms.length)
                        keys.general_section=this.general_section_doms.length-1;
                }
                this.hoverGeneralSection(keys.general_section);
                break;
            case "language_section":
                keys.language_section+=increment;
                if(keys.language_section<0)
                    keys.language_section=0;
                if(keys.language_section>=this.language_doms.length)
                    keys.language_section=this.language_doms.length-1;
                this.hoverLanguageOption(keys.language_section);
                break;
            case "epg_modal_section":
                if(keys.epg_modal_section>0 && increment<0)
                    keys.epg_modal_section=0;
                else if(keys.epg_modal_section==0 && increment>0)
                    keys.epg_modal_section=1;
                this.hoverEpgModal(keys.epg_modal_section);
                break;
            case "epg_time_option":
                keys.epg_time_option+=increment;
                if(keys.epg_time_option<0)
                    keys.epg_time_option=0;
                if(keys.epg_time_option>=this.epg_option_doms.length)
                    keys.epg_time_option=this.epg_option_doms.length-1;
                this.hoverEpgSection(keys.epg_time_option);
                break;
            case "stream_format_option":
                if(increment>0 && keys.stream_format_option<3)
                    keys.stream_format_option+=increment;
                if(increment<0){
                    keys.stream_format_option+=increment;
                    if(keys.stream_format_option==3)
                        keys.stream_format_option=2;
                    if(keys.stream_format_option<0)
                        keys.stream_format_option=0;
                }
                this.hoverStreamFormatOption(keys.stream_format_option);
                break;
            case "time_format_section":
                if(keys.time_format_section<2 && increment>0)
                    keys.time_format_section+=increment;
                if(increment<0){
                    keys.time_format_section+=increment;
                    if(keys.time_format_section<0)
                        keys.time_format_section=0;
                    if(keys.time_format_section==2)
                        keys.time_format_section=1;
                }
                this.hoverTimeFormat(keys.time_format_section);
                break;
            case "epg_timeline_section":
                if(keys.epg_timeline_section<2 && increment>0)
                    keys.epg_timeline_section+=increment;
                if(increment<0){
                    keys.epg_timeline_section+=increment;
                    if(keys.epg_timeline_section<0)
                        keys.epg_timeline_section=0;
                    if(keys.epg_timeline_section==2)
                        keys.epg_timeline_section=1;
                }
                this.hoverEpgTimeLine(keys.epg_timeline_section);
                break;
            case "parent_account_section":
                if(keys.parent_account_section<2 && increment>0)
                    keys.parent_account_section+=increment;
                if(increment<0){
                    keys.parent_account_section+=increment;
                    if(keys.parent_account_section==2)
                        keys.parent_account_section=1;
                    if(keys.parent_account_section<0)
                        keys.parent_account_section=0;
                }
                this.hoverParentAccount(keys.parent_account_section);
                break;
            case "parent_account_section_confirm":
                if(keys.parent_account_section<1 && increment>0)
                    keys.parent_account_section+=increment;
                if(increment<0){
                    keys.parent_account_section+=increment;
                    if(keys.parent_account_section==1)
                        keys.parent_account_section=0;
                    if(keys.parent_account_section<0)
                        keys.parent_account_section=0;
                }
                this.hoverParentAccountConfirm(keys.parent_account_section);
                break;
            case "autoplay_time_section":
                keys.autoplay_time_section+=increment;
                if(keys.autoplay_time_section<0)
                    keys.autoplay_time_section=0;
                if(keys.autoplay_time_section>=this.autoplay_time_options.length)
                    keys.autoplay_time_section=this.autoplay_time_options.length-1;
                this.hoverAutoPlayTimeOption(keys.autoplay_time_section);
                break;
            case "recent_limit_option":
                keys.recent_limit_option+=increment;
                if(keys.recent_limit_option<0)
                    keys.recent_limit_option=0;
                if(keys.recent_limit_option>=this.recent_limit_options.length)
                    keys.recent_limit_option=this.recent_limit_options.length-1;
                this.hoverRecentLimitOption(keys.recent_limit_option);
                break;
            case "buffer_time_option":
                keys.buffer_time_option+=increment;
                if(keys.buffer_time_option<0)
                    keys.buffer_time_option=0;
                if(keys.buffer_time_option>=this.buffer_time_options.length)
                    keys.buffer_time_option=this.buffer_time_options.length-1;
                this.hoverBufferTimeOption(keys.buffer_time_option);
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
                $(this.menu_doms).removeClass('active');
                $(this.menu_doms[keys.menu_selection]).addClass('active');
                break;
            case 'general_section':
                if((keys.general_section==2 || keys.general_section==4) && increment>0)
                    keys.general_section+=1;
                else if((keys.general_section==3 || keys.general_section==5) && increment<0)
                    keys.general_section-=1;
                else if(keys.general_section==this.general_section_doms.length-2)
                    keys.general_section=this.general_section_doms.length-1;
                else if(keys.general_section==this.general_section_doms.length-1)
                    keys.general_section=this.general_section_doms.length-2;
                this.hoverGeneralSection(keys.general_section);
                break;
            case "clear_cache_confirm_option":
                if(increment>0)
                    keys.clear_cache_confirm_option=1;
                else
                    keys.clear_cache_confirm_option=0;
                this.hoverClearCacheConfirmOption(keys.clear_cache_confirm_option);
                break;
            case "epg_modal_section":
                if(keys.epg_modal_section==1)
                    keys.epg_modal_section=2;
                else if(keys.epg_modal_section==2)
                    keys.epg_modal_section=1;
                this.hoverEpgModal(keys.epg_modal_section);
                break;
            case "stream_format_option":
                if(keys.stream_format_option==3 && increment>0)
                    keys.stream_format_option=4;
                else if(keys.stream_format_option==4 && increment<0)
                    keys.stream_format_option=3;
                this.hoverStreamFormatOption(keys.stream_format_option);
                break;
            case "time_format_section":
                if(keys.time_format_section==2 && increment>0)
                    keys.time_format_section=3;
                else if(keys.time_format_section==3 && increment<0)
                    keys.time_format_section=2;
                this.hoverTimeFormat(keys.time_format_section);
                break;
            case "epg_timeline_section":
                if(keys.epg_timeline_section==2)
                    keys.epg_timeline_section=3;
                else if(keys.epg_timeline_section==3)
                    keys.epg_timeline_section=2;
                this.hoverEpgTimeLine(keys.epg_timeline_section);
                break;
            case "parent_account_section":
                if(keys.parent_account_section==2 && increment>0)
                    keys.parent_account_section=3;
                else if(keys.parent_account_section==3 && increment<0)
                    keys.parent_account_section=2;
                this.hoverParentAccount(keys.parent_account_section);
                break;
            case "parent_account_section_confirm":
                if(keys.parent_account_section==1 && increment>0)
                    keys.parent_account_section=2;
                else if(keys.parent_account_section==2 && increment<0)
                    keys.parent_account_section=1;
                this.hoverParentAccountConfirm(keys.parent_account_section);
                break;
        }
    },
    HandleKey:function(e){
        if(this.is_loading)
            return;
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
                this.handleMenuClick('k');
                break;
            case tvKey.RETURN:
            case tvKey.RETURN_LG:case tvKey.ESC:
                this.goBack();
                break;
        }
    }
}
