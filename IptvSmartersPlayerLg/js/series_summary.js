"use strict";
var vod_series_summary_page={
    keys:{
        focused_part:'episode_selection',
        episode_selection:0,
        action_btn:0,
        vod_action_btn:0,
        cast_selection:0,
        tab_selection:0,
        top_selection:0,
        season_selection:0,
        video_control:0
    },
    max_btn_index:0,
    action_btn_doms:[],
    is_loading:false,
    current_season_index:0,
    episode_doms:[],
    cast_doms:[],
    episodes_container:$('#episodes-container'),
    casts_container:$('#casts-container'),
    casts_container_vod:$('#casts-container-vod'),
    video_type:'',
    casts:[],
    season_doms:[],
    seasons_container:$('#seasons-container'),
    tab_btn_doms:$('.episode-cast-tab-btn'),
    top_icons:$('.series-top-menu-btn'),
    fav_icon:$('.vod-series-fav-mark')[0],
    episodes:[],
    series_video_times:{},
    current_movie_name:'',
    last_episode_index:0,
    last_season_index:0,
    current_episode_index:0,
    movie:{},
    init:function(video_type,series){

        $('.action-btn-progressbar-container').removeClass('has-progress');
        this.video_type=video_type;
        $('.'+video_type+'-only').show();
        if(video_type==='series')
            $('.vod-only').hide();
        else
            $('.series-only').hide();
        $('#current-vod-series-name').text(series.name);
        this.current_movie_name = series.name;
        $('#series-summary-image-wrapper img').attr('src','');
        $('#vod-series-background-img').attr('src','');
        if(MovieHelper.checkFavourite(video_type,series))
            $(this.fav_icon).addClass('favourite');
        else
            $(this.fav_icon).removeClass('favourite');
        var rating=0;
        if(typeof series.rating==="undefined" || series.rating==="")
            rating=0;
        else
            rating=parseFloat(series.rating);
        if(isNaN(rating))
            rating=0;
        $('#series-rating-container').find('.rating-upper').css({width:rating*10+"%"});
        $('#series-rating-mark').text(rating.toFixed(1));
        $('.vod-summary-item .should-empty').text('');

        if(video_type==='series'){
            this.series_video_times={};
            if(typeof SeriesModel.saved_video_times[series.series_id.toString()]!='undefined')
                this.series_video_times=SeriesModel.saved_video_times[series.series_id.toString()];

//                console.log(JSON.stringify(SeriesModel.saved_video_times));
            showLoader(true);
            this.is_loading=true;
            this.action_btn_doms=$('.series-action-btn');
            $(this.episodes_container).html('');
            this.episode_doms=[];
            $(this.casts_container).html('');
            this.cast_doms=[];
            this.casts=[];
            this.keys.season_selection=0;
            current_series=series;
            this.current_season_index=0;
            $('#series-summary-release-date').text(current_series.releaseDate);
            $('#series-summary-release-genre').text(current_series.genre);
            $('#series-summary-release-length').text(current_series.duration);
            $('#series-summary-release-age').text(current_series.age);
            $('#series-summary-release-director').text(current_series.director);
            $('#series-summary-release-cast').text(current_series.cast);
            $('#series-summary-plot').text(current_series.plot);
            setAnimationDuration(0.2,$('#series-summary-plot-wrapper'),$('#series-summary-plot'));

            $('#series-summary-image-wrapper img').attr('src',current_series.cover);
            var backdrop_image=current_series.cover;
            try{
                backdrop_image=current_series.backdrop_path[0];
            }catch(e){
            }
            $('#vod-series-background-img').attr('src',backdrop_image);
            this.action_btn_doms=$('.series-action-btn');
            $('.series-action-btn').removeClass('active');
            $($('.series-action-btn')[1]).addClass('active');

            if(typeof current_series.youtube_trailer!='undefined' && current_series.youtube_trailer!=null && current_series.youtube_trailer.trim()!==''){
                this.max_btn_index=2;
                $(this.action_btn_doms[2]).show();
            }else{
                this.max_btn_index=1;
                $(this.action_btn_doms[2]).hide();
            }

            var series_video_times=this.series_video_times;
            var last_season_index,last_episode_index;
            if(typeof series_video_times['last_season_index']!='undefined' && typeof series_video_times['last_episode_index']!='undefined'){
                last_season_index=parseInt(series_video_times['last_season_index']);
                last_episode_index=parseInt(series_video_times['last_episode_index']);
                $(this.action_btn_doms[0]).find('.vod-series-play-btn-text').text('Resume - S'+(last_season_index+1)+':E'+(last_episode_index+1));
                this.changeResumeBarProgressWidth();
//                 alert("4");
            }else{
                last_season_index=0;
                last_episode_index=0;
                $(this.action_btn_doms[0]).find('.vod-series-play-btn-text').text('Play - S1'+':E1');
                $('.action-btn-progressbar-container').removeClass('has-progress');
            }
            this.last_season_index=last_season_index;
            this.last_episode_index=last_episode_index;
            this.current_season_index=last_season_index;
            this.hoverActionBtn(0);
            current_route="vod-series-summary-page";
            $('#series-summary-page').removeClass('hide');
            this.getSeasons();
            this.getCasts();
        } else{
            $(this.casts_container_vod).html('');
            $(this.casts_container_vod).addClass('hide');
            this.saved_video_times=VodModel.saved_video_times;
            this.movie=series;
            this.action_btn_doms=$('.vod-action-btn');
            $('#series-summary-image-wrapper img').attr('src',series.stream_icon);

            if(playlist.type==="xtreme"){
                var that=this;
                showLoader(true);
                this.is_loading=true;
                $.getJSON(playlist.url+'/player_api.php?username='+playlist.user_name+'&password='+playlist.password+'&action=get_vod_info&vod_id='+series.stream_id, function(response){
                    var info=response.info;
                    that.movie.info=info;
                    $('#series-summary-release-date').text(info.releasedate);
                    $('#series-summary-release-genre').text(info.genre);
                    $('#series-summary-duration').text(info.duration);
                    $('#series-summary-release-director').text(info.director);
                    $('#series-summary-cast').text(info.cast);

                    if(info.description){
                           $('#vod-summary-description').text(info.description);
                    }else if(info.plot){
                           $('#vod-summary-description').text(info.plot);
                    }

                    var backdrop_image=series.stream_icon;
                    try{
                        backdrop_image=info.backdrop_path[0];
                    }catch (e) {
                    }
                    $('#vod-series-background-img').attr('src',backdrop_image);
                    series.info=info;
                    that.max_btn_index=1;
                    series.youtube_trailer=response.info.youtube_trailer;
                    if(typeof info.youtube_trailer!='undefined' && info.youtube_trailer!=null && info.youtube_trailer.trim()!==''){
                        that.max_btn_index=1;
                        $(that.action_btn_doms[1]).show();
                    }else{
                        that.max_btn_index=0;
                        $(that.action_btn_doms[1]).hide();
                    }
                    that.changeResumeBarProgressWidth();
//                    alert("1");
                    showLoader(false);
                    that.is_loading=false;
                    if(typeof info.tmdb_id!='undefined' && info.tmdb_id!=null && info.tmdb_id.trim()!==''){
                         that.getCastsMovies(info.tmdb_id);
                    }
                })
            }

            var saved_video_times=VodModel.saved_video_times;
            var movie_id=this.movie.stream_id.toString();
            if(saved_video_times[movie_id])
                $(this.action_btn_doms[0]).find('.vod-series-play-btn-text').text('RESUME');
            else
                $(this.action_btn_doms[0]).find('.vod-series-play-btn-text').text('PLAY');
            this.hoverActionBtn(0);
            current_route="vod-series-summary-page";
            $('#series-summary-page').removeClass('hide');

        }
    },
    goBack:function(){
        var keys=this.keys;
//        alert(keys.focused_part);
        switch (keys.focused_part) {
            case "cast_detail":
//            alert(this.video_type);
                if(this.video_type==='series'){
                    $('#current-vod-series-name').text(current_series.name);
                }else if(this.video_type==='vod'){
                    $('#current-vod-series-name').text(this.current_movie_name);
                }
                $('#cast-detail-container').hide();
                $('#vod-series-summary-info-container').show();
                keys.focused_part='cast_selection';
                break;
            case "video_control":
                $('#vod-series-player-container').hide();
                $('#vod-series-summary-info-container').show();
                keys.focused_part='episode_selection';
                break;
            case "episode_selection":
            case "season_selection":
                $('.modal').modal('hide');
                this.hoverActionBtn(1);
                break;
            default:
                vod_series_page.updateWatchList();
                current_route='vod-series-page';
                $('#series-summary-page').addClass('hide');
                $('#vod-series-page').removeClass('hide');
        }
    },
    changeResumeBarProgressWidth:function(){

        if(playlist.type!=='xtreme'){
            $('.action-btn-progressbar-container').removeClass('has-progress');
            return;
        }
        var duration, progress_width,video_time;
        if(this.video_type==='series'){
            var last_season_index=this.last_season_index;
            var last_episode_index=this.last_episode_index;
            var series_video_times=this.series_video_times;
            try{
                video_time=parseInt(series_video_times[last_season_index.toString()][last_episode_index.toString()]);
                var season=current_series.seasons[last_season_index];
                var episode=season.episodes[last_episode_index];
                duration=episode.info.duration_secs;
            }catch (e) {
                $('.action-btn-progressbar-container').removeClass('has-progress');
            }
        }else if(this.video_type==='vod'){
            try{
                var saved_video_times=VodModel.saved_video_times;
                var movie_id=this.movie.stream_id.toString();
                if(typeof saved_video_times[movie_id]!='undefined'){
                    video_time=saved_video_times[movie_id];
                    duration=this.movie.info.duration_secs;
                }else{
                    $('.action-btn-progressbar-container').removeClass('has-progress');
                }
            }catch (e) {
                $('.action-btn-progressbar-container').removeClass('has-progress');
            }
        }
//        console.log(video_time);
//        console.log(duration);
        if(video_time>0){
           try{
            progress_width=(video_time/duration)*100;
            vod_series_player_page.resume_time = video_time;
            if(progress_width>100){
                        $(this.action_btn_doms[0]).find('.action-btn-progress-amount').css({width:"100%"})
            }else{
                        $(this.action_btn_doms[0]).find('.action-btn-progress-amount').css({width:progress_width+"%"})
            }
           }catch(e){

           }

            $(this.action_btn_doms[0]).find('.action-btn-progressbar-container').addClass('has-progress');
        }else{
            $('.action-btn-progressbar-container').removeClass('has-progress');
        }
    },
    showMovie:function(){
        $('#series-summary-page').addClass('hide');

        if(this.video_type =='series'){
              try{
                    var video_time = this.series_video_times[(this.movie.season.toString()-1)][(this.movie.episode_num.toString()-1)];
                    if(typeof video_time==="undefined" || video_time===""){
                         vod_series_player_page.resume_time = 0;
                    }else{
                         vod_series_player_page.resume_time = video_time;
                    }
              }catch(e){
                    vod_series_player_page.resume_time = 0;
              }
         }else{
         console.log("1");
              var saved_video_times=VodModel.saved_video_times;
              var movie_id=this.movie.stream_id.toString();
//              console.log(movie_id);
                try{
                  if(saved_video_times[movie_id]){
                        var video_time=saved_video_times[movie_id];
                        console.log("a:"+video_time);
                        if(typeof video_time==="undefined" || video_time===""){
                              console.log("b:"+video_time);
                              vod_series_player_page.resume_time = 0;
                        }else{
                              console.log("c:"+video_time);
                              vod_series_player_page.resume_time = video_time;
                        }
                  }else{
                      vod_series_player_page.resume_time = 0;
                  }
                }catch(e){
                         console.log("e:"+e);

                  vod_series_player_page.resume_time = 0;
                }

         }
         vod_series_player_page.init(this.movie,this.video_type,'vod-series-summary-page');


    },
    showLastMovie:function(){
//    console.log(this.last_season_index);
//    console.log(this.last_episode_index);
//    console.log(current_series);
        this.current_episode_index=this.last_episode_index;
        this.movie=current_series.seasons[this.last_season_index].episodes[this.last_episode_index];
//        console.log(this.movie);
        this.showMovie();
    },
    showTrailerVideo:function(){
        $('#series-summary-page').addClass('hide');
        var movie=this.video_type==='series' ? current_series : this.movie;
        trailer_page.init('vod-series-summary-page',movie);
    },
    getSeasons:function(){
        var that=this;
        if(playlist.type==='xtreme'){
            $.getJSON(playlist.url+'/player_api.php?username='+playlist.user_name+'&password='+playlist.password+'&action=get_series_info&series_id='+current_series.series_id, function(response){
                current_series.info=response.info;
                var seasons=response.seasons;
                current_series.seasons=[];
                try{
                    if(typeof seasons!='undefined' && seasons.length>0 || Object.keys(response.episodes).length>0){
                        var episodes=response.episodes;
                        if(seasons.length==0){
                            seasons=[];
                            Object.keys(episodes).map(function(key, index){
                                seasons.push({
                                    name:"Season "+(index+1),
                                    cover:"images/series.png",
                                    episodes:typeof episodes[key]!='undefined' ? episodes[key] : []
                                })
                            })
                        }
                        else{
                            seasons.map(function(item){
                                item.episodes=typeof episodes[item.season_number.toString()]!='undefined' ? episodes[item.season_number.toString()] : [];
                            })
                        }
                        current_series.seasons=seasons.filter(function (item) {
                            return item.episodes.length>0
                        });
                    }
                }catch (e) {
                }
                that.changeResumeBarProgressWidth();
// alert("2");
                that.renderSeasons();
                that.renderEpisodes();
                showLoader(false);
                that.is_loading=false;
            });
        }
        else if(playlist.type==="type1"){
            current_series.seasons.map(function(item){
                item.episodes=current_series.episodes[item.name]
            })
            showLoader(false);
            this.is_loading=false;
            that.renderEpisodes();
        }
    },
    renderSeasons:function(){
        var html='';
        current_series.seasons.map(function (item,index) {
            html+=
                '<div class="season-item-container">\
                    <div class="season-item-wrapper"\
                        onmouseenter="vod_series_summary_page.hoverSeasonItem('+index+')" \
                        onclick="vod_series_summary_page.selectSeason()" \
                    >'+item.name+'\
                    </div>\
                </div>\
                '
        })
        $(this.seasons_container).html(html);
        this.season_doms=$('.season-item-wrapper');
    },
    renderEpisodes:function(){


//console.log(this.series_video_times);

        var season_index=this.current_season_index;

        var season_times={};
        if(typeof this.series_video_times[season_index.toString()]!='undefined')
            season_times=this.series_video_times[season_index.toString()];
        showLoader(true);
        this.is_loading=true;
        $(this.action_btn_doms[1]).text('Season - '+(season_index+1));
        var season=current_series.seasons[season_index];
        this.episodes=season.episodes;
        $('#episodes-tab').text('Episodes ('+season.episodes.length+')');
        var html='';
        season.episodes.map(function (item,index) {
            var poster_image=current_series.cover, rating_percent=0, duration='N/A';
            if(playlist.type==='xtreme' && typeof item.info!='undefined'){
                poster_image=item.info.movie_image;
                rating_percent=item.info.rating/10*100+'%';
                duration=getFormatedDuration(item.info.duration);
            }



//            console.log(duration);

//            var last_season_index=this.last_season_index;
//            var last_episode_index=this.last_episode_index;
//            var series_video_times=this.series_video_times;
//            try{
//                video_time=parseInt(series_video_times[last_season_index.toString()][last_episode_index.toString()]);
//                var season=current_series.seasons[last_season_index];
//                var episode=season.episodes[last_episode_index];
//                duration=episode.info.duration_secs;
//            }catch (e) {
//                $('.action-btn-progressbar-container').removeClass('has-progress');
//            }




            var episode_progress='';
            if(typeof season_times[index.toString()]!='undefined'){
                var saved_time=parseInt(season_times[index.toString()]);
//                console.log(saved_time);
                var progress_width=0;
                if(typeof item.info!='undefined' && typeof item.info.duration_secs!='undefined'){
                    progress_width=(saved_time/item.info.duration_secs)*100;
                }
                if(progress_width>=100){
                    progress_width = 100;
                }
//                var uniqueID = "unique_id_s"+(season_index+1).toString()+"_e"+(index+1).toString();
//                console.log(progress_width);
                episode_progress=
                    '<div class="episode-progress-container">\
                        <div class="episode-progress-bar"  style="width: '+progress_width+'%"> \
                        </div>\
                    </div>\
                    '
            }
            html+=
                '<div class="episode-item-container">\
                    <div class="episode-item-wrapper"\
                        onmouseenter="vod_series_summary_page.hoverEpisodeItem('+index+')"\
                        onclick="vod_series_summary_page.openMovie('+index+')" \
                    >\
                        <div class="episode-item-img-wrapper">\
                            <img class="episode-item-img" src="'+poster_image+'" onerror="this.src=\'images\/noposter.png\'">'+
                            episode_progress+
                            '<div class="episode-play-icon-wrapper">\
                                <i class="fa fa-play episode-play-icon"></i>\
                            </div>\
                        </div> \
                        <div class="episode-item-info-wrapper">\
                            <div class="episode-item-name">'+item.title+'</div>\
                            <div class="episode-item-rating">\
                                <div class="rating-upper" style="width: '+rating_percent+'">\
                                    <span>★</span>\
                                    <span>★</span>\
                                    <span>★</span>\
                                    <span>★</span>\
                                    <span>★</span>\
                                </div>\
                                <div class="rating-lower">\
                                    <span>★</span>\
                                    <span>★</span>\
                                    <span>★</span>\
                                    <span>★</span>\
                                    <span>★</span>\
                                </div>\
                            </div>\
                            <div class="episode-item-duration">'+duration+'</div> \
                            <div class="episode-item-post max-line-2">'+item.info.plot+'</div>\
                        </div>\
                    </div>\
                </div>'
        })
        $('#episodes-container').html(html);
        this.episode_doms=$('.episode-item-wrapper');
        showLoader(false);
        this.is_loading=false;
    },
    showSeasons:function(){
        $('#seasons-modal').modal('show');
        this.hoverSeasonItem(this.keys.season_selection);
    },

    renderCastsMovies:function(){
//        $('#casts-tab').html("Casts ("+this.casts.length+")");
        var html='';
        this.casts.map(function (cast, index) {
            var cast_profile=tmdb_profile_url+cast.profile_path;
            html+=
                '<div class="cast-item-wrapper"\
                    onmouseenter="vod_series_summary_page.hoverCastItem('+index+')"\
                    onclick="vod_series_summary_page.showCastDetail()" \
                >\
                    <img class="cast-item-img" src="'+cast_profile+'" onerror="this.src=\'images/noposter.png\'">\
                    <div class="movie-grid-item-name-container-cast"><div class="movie-grid-item-name-wrapper-cast"><div class="movie-grid-item-name-cast max-line-2">'+cast.name+'</div></div></div> \
                </div>'
        })
        $(this.casts_container_vod).html(html);
        $(this.casts_container_vod).removeClass('hide');
        this.cast_doms=$('.cast-item-wrapper');
    },
    getCastsMovies:function(tmdb_id){
        var that=this;
        $.ajax({
            method:'get',
            url:'https://api.themoviedb.org/3/movie/'+tmdb_id+'/credits?api_key='+tmdb_api_key
        }).then(
            function (response) {
//            console.log(response);
                try{
                if(typeof response.cast!='undefined'){
                    that.casts=response.cast;
                    that.renderCastsMovies()
                }else{
                    that.casts=[];
                    that.renderCastsMovies()
                }
//                    if(typeof response.results!='undefined' && typeof response.results=="object"){
//                        var results=response.results;
//                        var series_id='';
//                        var current_series_name=current_series.name.toLowerCase().trim();
//                        for(var i=0;i<results.length;i++){
//                            if(results[i].name.toLowerCase().trim()===current_series_name ||
//                                results[i].original_name.toLowerCase().trim()===current_series_name){
//                                series_id=results[i].id;
//                                break;
//                            }
//                        }
//                        if(series_id!==''){
//                            $.ajax({
//                                method:'get',
//                                url:tmdb_url+series_id+'/credits?api_key='+tmdb_api_key
//                            }).then(
//                                function (data) {
//                                    if(typeof data.cast!='undefined'){
//                                        that.casts=data.cast;
//                                        that.renderCasts()
//                                    }
//                                }
//                            )
//                        }else{
//                            that.casts=[];
//                            that.renderCasts()
//                        }
//                    }
                }catch (e) {
                    that.casts=[];
                    that.renderCasts()
                }
            }
        )
    },
    renderCasts:function(){
        $('#casts-tab').html("Casts ("+this.casts.length+")");
        var html='';
        this.casts.map(function (cast, index) {
            var cast_profile=tmdb_profile_url+cast.profile_path;
            html+=
                '<div class="cast-item-wrapper"\
                    onmouseenter="vod_series_summary_page.hoverCastItem('+index+')"\
                    onclick="vod_series_summary_page.showCastDetail()" \
                >\
                    <img class="cast-item-img" src="'+cast_profile+'" onerror="this.src=\'images/noposter.png\'">\
                    <div class="movie-grid-item-name-container-cast"><div class="movie-grid-item-name-wrapper-cast"><div class="movie-grid-item-name-cast max-line-2">'+cast.name+'</div></div></div> \
                </div>'
        })
        $(this.casts_container).html(html);
        this.cast_doms=$('.cast-item-wrapper');
    },
    getCasts:function(){
        var that=this;
        $.ajax({
            method:'get',
            url:'https://api.themoviedb.org/3/search/tv?'+'api_key='+tmdb_api_key+'&query='+current_series.name
        }).then(
            function (response) {
                try{
                    if(typeof response.results!='undefined' && typeof response.results=="object"){
                        var results=response.results;
                        var series_id='';
                        var current_series_name=current_series.name.toLowerCase().trim();
                        for(var i=0;i<results.length;i++){
                            if(results[i].name.toLowerCase().trim()===current_series_name ||
                                results[i].original_name.toLowerCase().trim()===current_series_name){
                                series_id=results[i].id;
                                break;
                            }
                        }
                        if(series_id!==''){
                            $.ajax({
                                method:'get',
                                url:tmdb_url+series_id+'/credits?api_key='+tmdb_api_key
                            }).then(
                                function (data) {
                                    if(typeof data.cast!='undefined'){
                                        that.casts=data.cast;
                                        that.renderCasts()
                                    }
                                }
                            )
                        }else{
                            that.casts=[];
                            that.renderCasts()
                        }
                    }
                }catch (e) {
                    that.casts=[];
                    that.renderCasts()
                }
            }
        )
    },
    showCastDetail:function(){
        try{

            var keys=this.keys;
            var cast=this.casts[keys.cast_selection];

console.log(this.casts);
            console.log(keys.cast_selection);


            showLoader(true);
            this.is_loading=true;
            var that=this;
            $.ajax({
                method:'get',
                url:'https://api.themoviedb.org/3/person/'+cast.id+'?api_key='+tmdb_api_key,
                success:function (result) {
                    showLoader(false);
                    that.is_loading=false;
                    $('#cast-detail-img').attr('src',tmdb_profile_url+cast.profile_path)
                    $('#current-vod-series-name').text(cast.name);
                    $('#cast-birthday').text(result.birthday);
                    $('#cast-birthplace').text(result.place_of_birth);
                    $('#cast-gender').text(result.gender);
                    $('#cast-known').text(result.known_for_department);
                    $('#cast-detail-desc').text(result.biography);
                    $('#vod-series-summary-info-container').hide();
                    $('#cast-detail-container').show();
                    keys.focused_part='cast_detail';
                },
                error:function (error) {
                    showLoader(false);
                    that.is_loading=false;
                    showToast('Sorry','Error caused while getting cast data');
                }
            });
        }catch(e){
                showLoader(false);
                that.is_loading=false;
                showToast('Sorry','Error caused while getting cast data');
        }
    },
    showTabContent:function(kind){
        if(kind==='episode'){
            $(this.casts_container).addClass('hide');
            $(this.episodes_container).removeClass('hide');
        }else{
            $(this.episodes_container).addClass('hide');
            $(this.casts_container).removeClass('hide');
        }
    },
    selectSeason:function(){
        var keys=this.keys;
        this.current_season_index=keys.season_selection;
        $('#seasons-modal').modal('hide');
        this.hoverActionBtn(1);
        this.renderEpisodes();
        this.showTabContent('episode');
        $(this.action_btn_doms[1]).text(current_series.seasons[this.keys.season_selection].name);

        var series_video_times=this.series_video_times;
        var season_index_string=keys.season_selection.toString();
        if(series_video_times[season_index_string]){
            if(series_video_times[season_index_string]['latest_episode_index']) {
                var latest_episode_index=parseInt(series_video_times[season_index_string]['latest_episode_index']);
                this.last_episode_index=latest_episode_index;
                this.last_season_index=keys.season_selection;
                $(this.action_btn_doms[0]).find('.vod-series-play-btn-text').text('Resume - S' + (keys.season_selection + 1) + ':E' + (latest_episode_index + 1));
                this.changeResumeBarProgressWidth();
//                alert("3");
                return;
            }
        }
        this.last_season_index = keys.season_selection;
        this.last_episode_index = 0;
        $(this.action_btn_doms[0]).find('.vod-series-play-btn-text').text('Play - S'+(keys.season_selection+1)+':E1');
        $('.action-btn-progressbar-container').removeClass('has-progress');

    },
    removeAllActiveClass:function(){
        $(this.tab_btn_doms).removeClass('active');
        $(this.episode_doms).removeClass('active');
        $(this.action_btn_doms).removeClass('active');
        $(this.top_icons).removeClass('active');
        $(this.cast_doms).removeClass('active');
        $(this.fav_icon).removeClass('active');
    },
    hoverTopIcon:function(){
        var keys=this.keys;
        keys.focused_part="top_selection";
        keys.top_selection=0;
        this.removeAllActiveClass();
        $(this.top_icons).addClass('active');
    },
    hoverFavIcon:function(){
        var keys=this.keys;
        this.removeAllActiveClass();
        keys.focused_part='fav_icon';
        $(this.fav_icon).addClass('active');
    },
    hoverEpisodeItem:function(index){

//    alert(index);
        var keys=this.keys;
        keys.focused_part='episode_selection';
        keys.episode_selection=index;
        this.removeAllActiveClass();
        $(this.episode_doms[index]).addClass('active');
        var checkIfHasClass= $(".vod-series-summary-content-container").hasClass('slideUpShow');
        if(checkIfHasClass){
            $(".vod-series-summary-content-container").removeClass('slideUpShow');
            $(".vod-series-summary-content-container").addClass('slideUpHide');
        }

        moveScrollPosition(this.episodes_container,this.episode_doms[index],'vertical',false)
    },
    hoverSeasonItem:function(index){
        this.keys.focused_part='season_selection';
        this.keys.season_selection=index;
        $(this.season_doms).removeClass('active');
        $(this.season_doms[index]).addClass('active');
        moveScrollPosition(this.seasons_container,this.season_doms[index],'vertical',false);
    },
    hoverTab:function(index){
        this.keys.focused_part='tab_selection';
        this.keys.tab_selection=index;
        this.removeAllActiveClass();
        $(this.tab_btn_doms[index]).addClass('active');
    },
    hoverCastItem:function(index){
        var keys=this.keys;
        keys.focused_part='cast_selection';
        keys.cast_selection=index;
        this.removeAllActiveClass();
        $(this.cast_doms[index]).addClass('active');
        moveScrollPosition(this.casts_container,this.cast_doms[index],'horizontal','false');
    },
    hoverActionBtn:function(index){
        var keys=this.keys;
        keys.focused_part='action_btn';
        keys.action_btn=index;
        this.removeAllActiveClass();
        $(this.action_btn_doms[index]).addClass('active');
    },
    handleMenuLeftRight:function(increment){
        var keys=this.keys;
        switch (keys.focused_part) {
            case "action_btn":
                var max_btn_index=this.max_btn_index;
                keys.action_btn+=increment;
                if(keys.action_btn>max_btn_index)
                    keys.action_btn=max_btn_index;
                if(keys.action_btn<0)
                    keys.action_btn=0;
                this.hoverActionBtn(keys.action_btn);
                break;
            case "tab_selection":
                keys.tab_selection+=increment;
                if(keys.tab_selection<0)
                    keys.tab_selection=0;
                if(keys.tab_selection>1)
                    keys.tab_selection=1;
                this.hoverTab(keys.tab_selection);
                break;
            case "cast_selection":
                keys.cast_selection+=increment;
                if(keys.cast_selection<0){
                    keys.cast_selection=0;
                    return;
                }
                if(keys.cast_selection>=this.cast_doms.length)
                {
                    keys.cast_selection=this.cast_doms.length-1;
                    return;
                }
                this.hoverCastItem(keys.cast_selection);

//                keys.cast_selection = keys.cast_selection+8;
//                if(keys.cast_selection>=this.cast_doms.length){
//                  keys.cast_selection = (this.cast_doms.length-1);
//                }
//                this.removeAllActiveClass();
//                $(this.cast_doms[keys.cast_selection]).addClass('active');
                moveScrollPosition($('#casts-container-vod'),$(this.cast_doms[keys.cast_selection]).closest('.cast-item-wrapper'),'vertical',false);


                break;
            case "season_selection":
                keys.season_selection+=increment;
                if(keys.season_selection<0)
                    keys.season_selection=0;
                if(keys.season_selection>=this.season_doms.length)
                    keys.season_selection=this.season_doms.length-1;
                this.hoverSeasonItem(keys.season_selection);
                break;
        }

    },
    handleMenuUpDown:function(increment){
        var keys=this.keys;
//        alert(keys.focused_part);
        switch (keys.focused_part) {
            case "top_selection":
                if(increment>0)
                    this.hoverFavIcon();
                break;
            case "fav_icon":
                if(increment<0)
                    this.hoverTopIcon();
                else
                    this.hoverActionBtn(keys.action_btn);
                break;
            case "action_btn":
                if(this.video_type =='series'){
                    if(increment<0)
                        this.hoverFavIcon();
                    else
                        this.hoverTab(keys.tab_selection);
                }else{
                    if(increment<0){
                        this.hoverFavIcon();
                    }else{
                        var is_casts_hide=$("#casts-container-vod").hasClass('hide');
                        if(!is_casts_hide){
//                        console.log("honey:"+keys.cast_selection);
                            if(keys.cast_selection > $("#casts-container-vod > div").length){
//                            alert("entered");
                                keys.cast_selection = 0;
                            }
                            this.hoverCastItem(keys.cast_selection);
                        }
//                        else{
//                            this.hoverCastItem(keys.cast_selection);
//                        }
                    }
//                        this.hoverTab(keys.tab_selection);
                }
                break;
            case "tab_selection":
//                                   alert(keys.cast_selection);
                if(increment<0){
                    var checkIfHasClass= $(".vod-series-summary-content-container").hasClass('slideUpHide');
                    if(checkIfHasClass){
                        $(".vod-series-summary-content-container").removeClass('slideUpHide');
                        $(".vod-series-summary-content-container").addClass('slideUpShow');
                    }
                    this.hoverActionBtn(keys.action_btn);
                }else{
//                alert($("#casts-container > div").length);

                    if(keys.cast_selection > $("#casts-container > div").length){
                        keys.cast_selection = 0;
                    }
                    var is_episode_hide=$("#episodes-container").hasClass('hide');
                    if(!is_episode_hide){
                        this.hoverEpisodeItem(0);
                    }else{
                        this.hoverCastItem(keys.cast_selection);
                    }
                }
                break;
            case "episode_selection":
                keys.episode_selection+=increment;
                if(keys.episode_selection<0){
                    this.hoverTab(keys.tab_selection);
                    return;
                }
                if(keys.episode_selection>=this.episode_doms.length)
                    keys.episode_selection=this.episode_doms.length-1;
                this.hoverEpisodeItem(keys.episode_selection);
//                alert(keys.episode_selection);
                break;
            case "cast_selection":
//                       alert(increment);

                if(this.video_type =='series'){
//                alert(increment);
                    if(increment<0){
                        var last_selected_cast = keys.cast_selection;
                        keys.cast_selection = (keys.cast_selection-8);
                        if(keys.cast_selection<0){
                            this.removeAllActiveClass();
                            this.hoverTab(keys.tab_selection);

//                            this.hoverActionBtn(keys.action_btn);
                            keys.cast_selection = last_selected_cast;
                        }else{
                            $(this.cast_doms[keys.cast_selection]).addClass('active');
                            moveScrollPosition($('#casts-container'),$(this.cast_doms[keys.cast_selection]).closest('.cast-item-wrapper'),'vertical',false);
                        }
                    }else{
                        keys.cast_selection = keys.cast_selection+8;
                        if(keys.cast_selection>=this.cast_doms.length){
                          keys.cast_selection = (this.cast_doms.length-1);
                        }
                        this.removeAllActiveClass();
                        $(this.cast_doms[keys.cast_selection]).addClass('active');
                        moveScrollPosition($('#casts-container'),$(this.cast_doms[keys.cast_selection]).closest('.cast-item-wrapper'),'vertical',false);
                    }
                }else{
//                                alert('vod');

                    if(increment<0){
                        var last_selected_cast = keys.cast_selection;
                        keys.cast_selection = (keys.cast_selection-8);
                        if(keys.cast_selection<0){
                            this.removeAllActiveClass();
                            this.hoverActionBtn(keys.action_btn);
                            keys.cast_selection = last_selected_cast;
                        }else{
                            $(this.cast_doms[keys.cast_selection]).addClass('active');
                            moveScrollPosition($('#casts-container-vod'),$(this.cast_doms[keys.cast_selection]).closest('.cast-item-wrapper'),'vertical',false);
                        }
                    }else{
                        keys.cast_selection = keys.cast_selection+8;
                        if(keys.cast_selection>=this.cast_doms.length){
                          keys.cast_selection = (this.cast_doms.length-1);
                        }
                        this.removeAllActiveClass();
                        $(this.cast_doms[keys.cast_selection]).addClass('active');
                        moveScrollPosition($('#casts-container-vod'),$(this.cast_doms[keys.cast_selection]).closest('.cast-item-wrapper'),'vertical',false);
                    }

                }

                break;
            case "season_selection":
                if(increment<0 && keys.season_selection<4)
                    return;
                if(increment>0){
                    var quotient=Math.floor(this.season_doms.length/4);
                    var reminder=this.season_doms.length % 4;
                    if(keys.season_selection >= quotient*4)
                        return;
                }
                keys.season_selection+=4*increment;
                if(keys.season_selection<0)
                    keys.season_selection=0;
                if(keys.season_selection>=this.season_doms.length)
                    keys.season_selection=this.season_doms.length-1;
                this.hoverSeasonItem(keys.season_selection);
                break;
        }
    },
    handleMenuClick:function(){
        var keys=this.keys;

        switch (keys.focused_part) {
            case "top_selection":
                common_menu_page.init(current_route);
                break;
            case "fav_icon":
                var video_type=this.video_type;
                var movie=video_type==='series' ? current_series : this.movie;
                var movie_key=video_type==='series' ? 'series_id' : 'stream_id';

                if(MovieHelper.checkFavourite(video_type,movie)){
                    MovieHelper.removeFavouriteMovie(video_type,movie[movie_key]);
                    $(this.fav_icon).removeClass('favourite');
                    vod_series_page.toggleFavMark(false);
                }else{
                    MovieHelper.addToFavourite(video_type,movie);
                    $(this.fav_icon).addClass('favourite');
                    vod_series_page.toggleFavMark(false);
                }
                break;
            case "action_btn":
                var buttons=this.action_btn_doms;
                var current_button=buttons[keys.action_btn];
                $(current_button).trigger('click');
                break;
            case "tab_selection":
                $(this.tab_btn_doms[keys.tab_selection]).trigger('click');
                break;
            case "cast_selection":
                this.showCastDetail();
                break;
            case "episode_selection":
                this.movie=this.episodes[keys.episode_selection];
                this.showMovie();
                break;
            case "season_selection":
                this.selectSeason();
                break;
        }
    },
    HandleKey:function (e) {
        if(this.is_loading)
            return;
        switch (e.keyCode) {
            case tvKey.RETURN:
            case tvKey.RETURN_LG:case tvKey.ESC:
                this.goBack();
                break;
            case tvKey.UP:
                this.handleMenuUpDown(-1);
                break;
            case tvKey.DOWN:
                this.handleMenuUpDown(1);
                break;
            case tvKey.LEFT:
                this.handleMenuLeftRight(-1);
                break;
            case tvKey.RIGHT:
                this.handleMenuLeftRight(1);
                break;
            case tvKey.YELLOW:
                break;
            case tvKey.ENTER:
                this.handleMenuClick();
                break;
        }
    },

    openMovie:function(id){
     this.movie=this.episodes[id];
     this.showMovie();
    }
}



