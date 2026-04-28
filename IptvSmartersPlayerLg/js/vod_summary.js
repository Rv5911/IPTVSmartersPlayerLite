"use strict";
var vod_summary_page={
    keys:{
        index:0
    },
    min_btn_index:0,
    movie:{},
    init:function(movie){
        this.movie=movie;
        current_movie=movie;
        var that=this;
        showLoader(true);
        $('#vod-summary-name').text(current_movie.name);
        $('#vod-summary-image-wrapper img').attr('src',current_movie.stream_icon)
        if(settings.playlist_type==="xtreme"){
            var that=this;
            $.getJSON(api_host_url+'/player_api.php?username='+user_name+'&password='+password+'&action=get_vod_info&vod_id='+current_movie.stream_id, function(response){
                var info=response.info;
                $('#vod-summary-release-date').text(info.releasedate);
                $('#vod-summary-release-genre').text(info.genre);
                $('#vod-summary-release-length').text(info.duration);
                $('#vod-summary-release-age').text(info.age);
                $('#vod-summary-release-director').text(info.director);
                $('#vod-summary-release-cast').text(info.cast);
                if(info.description){
                    $('#vod-summary-description').text(info.description);
                }else if(info.plot){
                    $('#vod-summary-description').text(info.plot);
                }
                $('#vod-summary-image-wrapper img').attr('src',current_movie.stream_icon);
                $('#vod-summary-background-img').attr('src',current_movie.stream_icon);
                current_movie.info=info;

                $('.vod-action-btn').removeClass('active');
                $($('.vod-action-btn')[1]).addClass('active');
                if(VodModel.favourite_ids.includes(current_movie.stream_id)){
                    $($('.vod-action-btn')[2]).data('action','remove')
                    $($('.vod-action-btn')[2]).text(typeof current_words['remove_favorites']!='undefined' ? current_words['remove_favorites'] : 'Remove Fav')
                }
                else{
                    $($('.vod-action-btn')[2]).data('action','add')
                    $($('.vod-action-btn')[2]).text(typeof current_words['add_to_favorite']!='undefined' ? current_words['add_to_favorite'] : 'Add Fav')
                }
                var rating=0;
                if(typeof current_movie.rating==="undefined" || current_movie.rating==="")
                    rating=0;
                else
                    rating=parseFloat(current_movie.rating);
                if(isNaN(rating))
                    rating=0;
                $('#vod-rating-container').find('.rating-upper').css({width:rating*10+"%"});
                $('#vod-rating-mark').text(rating.toFixed(1));
                that.keys.index=1;
                current_movie.youtube_trailer=response.info.youtube_trailer;
                if(typeof info.youtube_trailer!='undefined' && info.youtube_trailer!=null && info.youtube_trailer.trim()!==''){
                    that.min_btn_index=0;
                    $('#vod-watch-trailer-button').show();
                }else{
                    that.min_btn_index=1;
                    $('#vod-watch-trailer-button').hide();
                }
                current_route="vod-summary-page";
                $('#vod-summary-page').removeClass('hide');

                showLoader(false);
            })
        }
        else{
            this.min_btn_index=0;
            current_movie.info={};
            $('#vod-watch-trailer-button').hide();
            $('#vod-summary-release-date').text("");
            $('#vod-summary-release-genre').text("");
            $('#vod-summary-release-length').text("");
            $('#vod-summary-release-age').text("");
            $('#vod-summary-release-director').text("");
            $('#vod-summary-release-cast').text("");
            $('#vod-summary-image-wrapper img').attr('src',current_movie.stream_icon);
            $('#vod-summary-background-img').attr('src',current_movie.stream_icon);

            $('#vod-summary-description').text("");
            $('.vod-action-btn').removeClass('active');
            $($('.vod-action-btn')[1]).addClass('active');
            if(VodModel.favourite_ids.includes(current_movie.stream_id)){
                $($('.vod-action-btn')[2]).data('action','remove')
                $($('.vod-action-btn')[2]).text(typeof current_words['remove_favorites']!='undefined' ? current_words['remove_favorites'] : 'Remove Fav')
            }
            else{
                $($('.vod-action-btn')[2]).data('action','add')
                $($('.vod-action-btn')[2]).text(typeof current_words['add_to_favorite']!='undefined' ? current_words['add_to_favorite'] : 'Add Fav')
            }
            var rating=0;
            if(typeof current_movie.rating==="undefined" || current_movie.rating==="")
                rating=0;
            else
                rating=parseFloat(current_movie.rating);
            if(isNaN(rating))
                rating=0;
            $('#vod-rating-container').find('.rating-upper').css({width:rating*10+"%"});
            $('#vod-rating-mark').text(rating.toFixed(1));
            that.keys.index=1;
            current_movie.youtube_trailer="";
            current_route="vod-summary-page";
            $('#vod-summary-page').removeClass('hide');

            showLoader(false);
        }
    },
    keyClick:function(){
        var keys=this.keys;
        var buttons=$('.vod-action-btn');
        var current_button=buttons[keys.index];
        $(current_button).trigger('click');
    },
    showTrailerVideo:function(){
        trailer_page.back_url="vod-summary-page";
        if(current_movie.youtube_trailer==="" || current_movie.youtube_trailer==undefined){
            $('#toast-body').html('<h3>Sorry<br>No trailer video available</h3>')
            $('.toast').toast({animation: true, delay: 2000});
            $('#toast').toast('show')
        }else{
            $('#vod-summary-page').addClass('hide');
            $('#trailer-player-page').show();
            current_route="trailer-page";
            if($('iframe#trailer-player').length>0){  // if iframe already loaded
                trailer_page.player.loadVideoById({
                    videoId:current_movie.youtube_trailer
                })
                trailer_page.player.playVideo();
            }
            else{
                trailer_page.player = new YT.Player('trailer-player', {
                    height: '100%',
                    width: '100%',
                    videoId: current_movie.youtube_trailer,
                    events: {
                        'onReady': trailer_page.onPlayerReady,
                        'onStateChange': trailer_page.onPlayerStateChange
                    }
                });
            }
        }
    },
    showMovie:function(){
        $('#vod-summary-page').addClass('hide');
        if(!VodModel.checkForAdult(current_movie))
            VodModel.addRecentOrFavouriteMovie(current_movie,'recent');  // Add To Recent Movies
        vod_series_player_page.init(current_movie,"movie","vod-series-page");
    },
    addFavorite:function(targetElement){
        var action=$(targetElement).data('action');
        if(action==="add"){
            VodModel.addRecentOrFavouriteMovie(current_movie,'favourite');
            $(targetElement).data('action','remove');
            $(targetElement).text(typeof current_words['remove_favorites']!='undefined' ? current_words['remove_favorites'] : 'Remove Fav');
        }
        else{
            VodModel.removeRecentOrFavouriteMovie(current_movie.stream_id,'favourite');
            $(targetElement).data('action','add');
            $(targetElement).text(typeof current_words['add_to_favorite']!='undefined' ? current_words['add_to_favorite'] : 'Add Fav');
        }
    },
    Exit:function(){
        $('#vod-summary-page').addClass('hide');
    },
    keyMove:function(increment){
        var min_index=this.min_btn_index;
        var keys=this.keys;
        keys.index+=increment;
        if(keys.index<min_index)
            keys.index=2;
        if(keys.index>2)
            keys.index=min_index;
        $('.vod-action-btn').removeClass('active');
        $($('.vod-action-btn')[keys.index]).addClass('active');
    },
    handleMenuUpDown:function(increment){
        $('#vod-summary-page').animate({ scrollTop: '+='+increment*20}, 10);
    },
    hoverActionBtn:function(index){
        var keys=this.keys;
        keys.index+=index;
        $('.vod-action-btn').removeClass('active');
        $($('.vod-action-btn')[keys.index]).addClass('active');
    },
    HandleKey:function (e) {
        switch (e.keyCode) {
            case tvKey.RETURN:
            case tvKey.RETURN_LG:case tvKey.ESC:
                current_route='vod-series-page';
                $('#vod-summary-page').addClass('hide');
                $('#vod-series-page').removeClass('hide');
                break;
            case tvKey.UP:
                this.handleMenuUpDown(-1);
                break;
            case tvKey.DOWN:
                this.handleMenuUpDown(1);
                break;
            case tvKey.LEFT:
                this.keyMove(-1);
                break;
            case tvKey.RIGHT:
                this.keyMove(1);
                break;
            case tvKey.ENTER:
                this.keyClick();
                break;
            case tvKey.YELLOW:
                if(!VodModel.favourite_ids.includes(current_movie.stream_id)){
                    VodModel.addRecentOrFavouriteMovie(current_movie, 'favourite');
                    $('#vod-add-favourite-button').data('action','remove');
                    $('#vod-add-favourite-button').text(typeof current_words['remove_favorites']!='undefined' ? current_words['remove_favorites'] : 'Remove Fav');
                }
                else{
                    VodModel.removeRecentOrFavouriteMovie(current_movie.stream_id,"favourite");
                    $('#vod-add-favourite-button').data('action','add');
                    $('#vod-add-favourite-button').text(typeof current_words['add_to_favorite']!='undefined' ? current_words['add_to_favorite'] : 'Add Fav');
                }
                break;
            case tvKey.BLUE:
                this.Exit();
                goHomePageWithMovieType('series');
                break;
        }
    }
}



