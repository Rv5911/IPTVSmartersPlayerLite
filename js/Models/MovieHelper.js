"use strict";
var MovieHelper={
    recent_movie_count:25,
    init:function(stream_type){
        var current_model=getCurrentModel(stream_type);
        current_model.movies=[];
        current_model.categories=[];
        current_model.favourite_ids=[];
        MovieHelper.loaded_data_live=false;
        MovieHelper.loaded_data_movies=false;
        MovieHelper.loaded_data_series=false;
        if(stream_type=='live'){
            LiveModel.programme_saved=false;
        }
    },
    setCategories:function (stream_type,categories) {
        var current_model=getCurrentModel(stream_type);

        if(stream_type=='vod' || stream_type=='series'){
            var temps=localStorage.getItem(storage_id+playlist.id+"_saved_"+stream_type+"_times");
            if(temps!=null && temps!==''){
                current_model.saved_video_times=JSON.parse(temps);
            }
        }
        if(stream_type=='live'){
            var temps=localStorage.getItem(storage_id+playlist.id+'_recent_channel_ids');
            if(temps!=null && temps!==''){
                current_model.recent_channel_ids=JSON.parse(temps);
            }
        }
        var hidden_categories=localStorage.getItem(storage_id+settings.playlist_url+current_model.category_name+"_hiddens");
        hidden_categories=hidden_categories==null ? [] : JSON.parse(hidden_categories);
        categories.map(function(category){
            category.is_hide=false;
            if(hidden_categories.includes(category.category_id))
                category.is_hide=true;
        })
        current_model.categories=categories;
    },
    saveHiddenCategories:function(stream_type,category_ids){
        var current_model=getCurrentModel(stream_type);
        var categories=current_model.categories;
        categories.map(function(category){
            category.is_hide=false;
            if(category_ids.includes(category.category_id)) {
                category.is_hide = true;
            }
        })
        localStorage.setItem(storage_id+settings.playlist_url+current_model.category_name+"_hiddens",JSON.stringify(category_ids))
    },
    saveVideoTime:function(stream_type,stream_id, time){
        var current_model=getCurrentModel(stream_type);
        if(stream_type=='vod' || stream_type=='series'){
            var saved_video_times=current_model.saved_video_times;
            saved_video_times[stream_id.toString()]=time;
            current_model.saved_video_times=saved_video_times;
            localStorage.setItem(storage_id+playlist.id+"_saved_"+stream_type+"_times",JSON.stringify(saved_video_times));

        }else{
            LiveModel.recent_channel_ids.unshift(stream_id);
            LiveModel.recent_channel_ids.splice(settings.recent_limit);
            localStorage.setItem(storage_id+playlist.id+"_recent_channel_ids",JSON.stringify(LiveModel.recent_channel_ids));
        }
    },
    removeVideoTime:function(stream_type,stream_id){
        var current_model=getCurrentModel(stream_type);
        var saved_video_times=current_model.saved_video_times;
        delete saved_video_times[stream_id.toString()];
        current_model.saved_video_times=saved_video_times;
        localStorage.setItem(storage_id+settings.playlist_url+"saved_"+stream_type+"_times",JSON.stringify(saved_video_times));
    },
    getCategories:function(stream_type,include_hide_category,include_favourite_recent){
        var current_model=getCurrentModel(stream_type);
        var categories=current_model.categories.filter(function(category){
            if(include_favourite_recent){
                if(!include_hide_category)
                    return !category.is_hide;
                else
                    return true;
            }
            else{
                if(!include_hide_category)
                    return !category.is_hide && (category.category_id!=="favourite" && category.category_id!=="recent");
                else
                    return category.category_id!=="favourite" && category.category_id!=="recent";
            }
        })
        return categories;
    },
    setMovies:function (stream_type,movies) {
        var current_model=getCurrentModel(stream_type);
        if(typeof movies=='undefined' || movies==='' || movies===null)
            movies=[];
        current_model.movies=movies;
    },
    insertMoviesToCategories:function(stream_type){
        var current_model=getCurrentModel(stream_type);

        var movies=current_model.movies;
        var categories=current_model.categories;
        var continue_watch_category={
            category_id:'continue',
            category_name:'CONTINUE WATCHING',
            parent_id:0,
            movies:[],
            is_hide:false
        }
        var recent_category={
            category_id:'recent',
            category_name:'RECENTLY ADDED',
            parent_id:0,
            movies:[],
            is_hide:false
        }
        var current_watch_ids=[];
        if(stream_type=='vod' || stream_type==='series'){
            var saved_video_times=current_model.saved_video_times;
            current_watch_ids=Object.keys(saved_video_times);
        }

        var favourite_category={
            category_id:'favourite',
            category_name:'FAVOURITES',
            parent_id:0,
            movies:[],
            is_hide:false
        }
        var undefined_category={
            category_id:'undefined',
            category_name:'Uncategorized',
            parent_id:0,
            movies:[],
            is_hide:false
        }
        categories.push(undefined_category);
        var movie_id_key=current_model.movie_key;
        var favourite_movie_ids=JSON.parse(localStorage.getItem(storage_id+playlist.id+'_'+current_model.category_name+"_favourite"));
        favourite_movie_ids=favourite_movie_ids==null ? [] : favourite_movie_ids;
        current_model.favourite_ids=favourite_movie_ids;
        var favourite_movies=[];
        var movies_map={};
        var current_watch_movies=[];

        if(stream_type=='live'){
            continue_watch_category.category_name='CHANNEL HISTORY';
            current_watch_ids=JSON.parse(JSON.stringify(current_model.recent_channel_ids));
        }
        movies.map(function(movie){
            if(typeof movie.category_id=='undefined' || movie.category_id=='null' || movie.category_id==null)
                movie.category_id='undefined';
            var category_id=movie.category_id.toString()
            if(typeof movies_map[category_id]=="undefined"){
                movies_map[category_id]=[movie];
            }else{
                movies_map[category_id].push(movie);
            }
            if(favourite_movie_ids.includes(movie[movie_id_key])){// if movie id is in recently viewed movie ids
                favourite_movies.push(movie);
            }
        });


        for(var i=0;i<current_watch_ids.length;i++){
            for(var j=0;j<movies.length;j++){
                var movie=movies[j];
                if(movie[movie_id_key]==current_watch_ids[i]){
                    current_watch_movies.push(movie);
                    break;
                }
            }
        }

        for(var i=0;i<categories.length;i++){ // except favourite, and recent movies
            var category_id=categories[i].category_id.toString();
            categories[i].movies=typeof movies_map[category_id]=='undefined' ? [] : movies_map[category_id];
        }
        for(var i=categories.length-1;i>=0;i--){
            if(categories[i].movies.length==0)
                categories.splice(i,1);
        }
        var all_category={
            category_id:'all',
            category_name:'ALL',
            movies:movies,
            is_hide:false
        }
        all_category.movies=movies;
        favourite_category.movies=favourite_movies;
        continue_watch_category.movies=current_watch_movies;
        recent_category.movies=this.getLatestMovies(stream_type);
        categories.unshift(recent_category);
        categories.unshift(continue_watch_category);
        categories.unshift(favourite_category);
        categories.unshift(all_category);
        current_model.categories=categories;
    },

    checkFavourite:function(stream_type,movie){
        var current_model=getCurrentModel(stream_type);
        var favourite_ids=current_model.favourite_ids;
        var movie_id=movie;

        if(typeof movie=='object')
            movie_id=movie[current_model.movie_key];
        return favourite_ids.includes(movie_id);
    },
    getFavouriteMoviePosition:function(){
        return 1;
    },
    addToFavourite:function(stream_type,movie) {
        var current_model=getCurrentModel(stream_type);
        var favourite_position=this.getFavouriteMoviePosition();
        var movies=current_model.categories[favourite_position].movies;
        var exist=false;
        var movie_id_key=current_model.movie_key;
        var is_added=false; // if added, it will be true
        for(var i=0;i<movies.length;i++){
            if(movies[i][movie_id_key]==movie[movie_id_key]){
                exist=true;
                break;
            }
        }
        if(!exist){
            movies.push(movie);
            var max_count=current_model.favourite_movie_count;
            var max_count_exceed=movies.length>max_count;
            movies=movies.splice(0,max_count);
            current_model.categories[favourite_position].movies=movies;
            var movie_ids=movies.map(function(item){
                return item[movie_id_key];
            })
            localStorage.setItem(storage_id+playlist.id+'_'+current_model.category_name+"_favourite", JSON.stringify(movie_ids));
            current_model.favourite_ids=movie_ids;
            is_added=true;
        }
    },
    removeFavouriteMovie:function(stream_type,movie_id) {
        var current_model=getCurrentModel(stream_type);
        var favourite_position=this.getFavouriteMoviePosition();
        var movies=current_model.categories[favourite_position].movies;
        var movie_id_key=current_model.movie_key;
        var is_removed=false;
        for(var i=0;i<movies.length;i++){
            if(movies[i][movie_id_key]==movie_id){
                movies.splice(i,1);
                is_removed=true;
                break;
            }
        }
        var movie_ids=movies.map(function(item){
            return item[movie_id_key];
        })
        localStorage.setItem(storage_id+playlist.id+'_'+current_model.category_name+"_favourite", JSON.stringify(movie_ids));
        current_model.favourite_ids=movie_ids;
    },

    getWatchListPosition:function(){
        return 2;
    },
    addToWatchList:function(stream_type,movie){

        var current_model=getCurrentModel(stream_type);
        var watchlist_position=this.getWatchListPosition();
        var movies=current_model.categories[watchlist_position].movies;
        var exist=false;
        movies.map(function (item) {
            if(item[current_model.movie_key]==movie[current_model.movie_key])
                exist=true;
        })
        if(!exist){
            movies.unshift(movie);
            movies.splice(this.recent_movie_count);
            current_model.categories[watchlist_position].movies=movies;
            if(stream_type=='live'){
                this.saveVideoTime('live',movie.stream_id,'');
            }
        }
    },
    removeAllWatchList:function(stream_type){
        var current_model=getCurrentModel(stream_type);
        var watchlist_position=this.getWatchListPosition();
        if(stream_type=='vod' || stream_type=='series'){
            current_model.saved_video_times={};
            localStorage.removeItem(storage_id+playlist.id+'_saved_'+stream_type+'_times');
        }else{
            LiveModel.recent_channel_ids=[];
            localStorage.removeItem(storage_id+playlist.id+'_recent_channel_ids');
        }
        current_model.categories[watchlist_position].movies=[];
    },
    checkForAdult:function(stream_type,movie){
        var current_model=getCurrentModel(stream_type);
        var is_adult=false;
        var categories=current_model.getCategories(false,false);
        for(var i=0;i<categories.length;i++){
            if(movie.category_id==categories[i].category_id){
                var category=categories[i];
                var category_name=category.category_name.toLowerCase();
                if(category_name.includes('xxx') ||  category_name.includes('adult') || category_name.includes('porn') || category.parent_id==1)
                    is_adult=true;
                break;
            }
        }
        return is_adult;
    },
    getLatestMovies:function(stream_type){
        var current_model=getCurrentModel(stream_type);
        var movies=JSON.parse(JSON.stringify(current_model.movies));
        var latest_movies;
        if(stream_type=='vod'){
            var key='added';
            movies=movies.sort(function(a,b){
                var a_new_key=parseFloat(a[key]);
                if(isNaN(a_new_key))
                    a_new_key=0;
                var b_new_key=parseFloat(b[key])
                if(isNaN(b_new_key))
                    b_new_key=0;
                return (a_new_key<b_new_key ? 1
                    :a_new_key>b_new_key ? -1 : 0);
            })
            latest_movies=movies.slice(0,settings.recent_limit);
        }else{
            latest_movies=[];
            for(var i=movies.length-1;i>=0;i--){
                latest_movies.push(movies[i]);
                if(latest_movies.length>=settings.recent_limit)
                    break;
            }
        }
        return latest_movies;
    },
    readVideoTimes:function () {
        var temps=localStorage.getItem(storage_id+playlist.id+'_vod_video_times');
        if(temps)
            VodModel.saved_video_times=JSON.parse(temps);
        else
            VodModel.saved_video_times={};

        temps=localStorage.getItem(storage_id+playlist.id+'_series_video_times');
        if(temps)
            SeriesModel.saved_video_times=JSON.parse(temps);
        else
            SeriesModel.saved_video_times={};

        var temps=localStorage.getItem(storage_id+playlist.id+'_recent_channel_ids');
        if(temps)
            LiveModel.recent_channel_ids=JSON.parse(temps);
        else
            LiveModel.recent_channel_ids=[];
    }
}
