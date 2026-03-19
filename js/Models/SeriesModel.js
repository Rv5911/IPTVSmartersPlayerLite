"use strict";
var SeriesModel={
    movies:[],
    category_name:'series_categories',
    favourite_movie_count:200,
    movie_key:"series_id",
    categories:[],
    saved_video_times:{},
    favourite_ids:[],
    saveVideoTime:function(series_id,season_index,episode_index, video_time) {
        series_id=series_id.toString();
        season_index=season_index.toString();
        episode_index=episode_index.toString();
        var saved_video_times=this.saved_video_times;
        var series_video_times={};
        if(saved_video_times[series_id]){
            series_video_times=saved_video_times[series_id];
        }
        var season_data={};
        if(series_video_times[season_index])
            season_data=series_video_times[season_index];
        season_data[episode_index]=video_time;
        season_data['latest_episode_index']=episode_index;
        series_video_times[season_index]=season_data;
        series_video_times['last_season_index']=parseInt(season_index);
        series_video_times['last_episode_index']=parseInt(episode_index);
        saved_video_times[series_id]=series_video_times;
        this.saved_video_times=saved_video_times;
        localStorage.setItem(storage_id+playlist.id+'_series_video_times',JSON.stringify(this.saved_video_times));
    },
    removeVideoTime:function (series_id,season_index,episode_index) {
        series_id=series_id.toString();
        season_index=season_index.toString();
        episode_index=episode_index.toString();
        var saved_video_times=this.saved_video_times;
        var series_video_times={};
        if(saved_video_times[series_id]){
            series_video_times=saved_video_times[series_id];
            var season_data={};
            if(series_video_times[season_index]){
                season_data=series_video_times[season_index];
                delete season_data[episode_index];
                series_video_times[season_index]=season_data;
                delete series_video_times['last_season_index'];
                delete series_video_times['last_episode_index'];
                saved_video_times[series_id]=series_video_times;
                this.saved_video_times=saved_video_times;
                localStorage.setItem(storage_id+playlist.id+'_series_video_times',JSON.stringify(this.saved_video_times));
            }
        }
    }
}
