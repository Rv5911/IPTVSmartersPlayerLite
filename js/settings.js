"use strict";
var settings={
    playlist_url_index:null,
    playlist_url:"",
    playlist_type:"xtreme",
    language:'English',
    subtitle_font_size:26,
    show_full_epg:1,
    active_subtitle:1,
    auto_clear_cache:1,
    show_epg_in_channel:1,
    auto_play_channel:0,
    buffering_time:5,
    enable_autoplay:1,
    user_agent:'',
    epg_time_shift:'0',
    stream_format:'m3u8',
    time_format:'12',
    epg_timeline:'all',
    vod_sort:"default", // or a-z, z-a, rating, number
    series_sort:"default",
    live_sort:"default",
    autoplay_time:30,
    recent_limit:10,
    show_hide_movies:true, // true means show
    show_hide_series:true, // true means show
    initFromLocal:function(){
        var that=this;
        var temp=localStorage.getItem(storage_id+'language');
        if(temp)
            this.language=temp;
        else{
            if(typeof navigator.language!='undefined'){
                var lang_tmps=navigator.language.split('-');
                this.language=lang_tmps[0];
            }
        }

        var integer_value_keys=['subtitle_font_size','autoplay_time','recent_limit','show_epg_in_channel','auto_play_channel',
            'playlist_url_index','show_full_epg','active_subtitle','enable_autoplay','auto_clear_cache','buffering_time'];
        integer_value_keys.map(function(key){
            var temp=localStorage.getItem(storage_id+key);
            if(temp){
                that[key]=parseInt(temp);
            }
        })

        var str_value_keys=['user_agent','language','epg_time_shift','stream_format','time_format','epg_timeline','vod_sort','series_sort','live_sort'];
        str_value_keys.map(function(key){
            var temp=localStorage.getItem(storage_id+key);
            if(temp){
                that[key]=temp;
            }
        });

        var default_live_sort = localStorage.getItem(storage_id+'live_sort');
        var default_vod_sort = localStorage.getItem(storage_id+'vod_sort');
        var default_series_sort = localStorage.getItem(storage_id+'series_sort');

        if(default_live_sort =='undefined' || default_live_sort == null){

             localStorage.setItem(storage_id+'live_sort',settings.live_sort);
        }
        if(default_vod_sort =='undefined' || default_vod_sort == null){

             localStorage.setItem(storage_id+'vod_sort',settings.vod_sort);
        }
        if(default_series_sort =='undefined' || default_series_sort == null){

             localStorage.setItem(storage_id+'series_sort',settings.series_sort);
        }

    },
    saveSettings:function(key, value,type){
        this[key]=value;
        if(type==='object' || type==='array'){
            value=JSON.parse(value);
        }

        localStorage.setItem(storage_id+key,value);

    }
}

var show_hide_movies=localStorage.getItem('show_hide_movies');
var show_hide_series=localStorage.getItem('show_hide_series');
if(show_hide_movies==null){
  if(settings.show_hide_movies){
     localStorage.setItem('show_hide_movies','true');
  }else{
     localStorage.setItem('show_hide_movies','false');
  }
}
if(show_hide_series==null){
  if(settings.show_hide_series){
     localStorage.setItem('show_hide_series','true');
  }else{
     localStorage.setItem('show_hide_series','false');
  }
}

