"use strict";

var vod_series_page = {
    keys: {
        focused_part: "category_selection", // or, "search part", "slider part", "sub menu part", "search_value"
        menu_selection: 0, // the index of selected menu,
        top_info_selection: 0,
        category_selection: 0,
        collapse_btn: 0,
        category_search_selection: 0,
        right_corner_setting_selection: 0
    },
    video_type: '',
    current_model: {},
    movies: [],
    all_movies: [],
    current_render_count: 0,
    render_count_increment: 48,
    menu_doms: [],
    is_drawing: false,
    top_info_doms: $('#vod-series-page .vod-series-top-btn'),
    page_element: $('#vod-series-page'),
    search_stream_timer: null,
    search_category_timer: null,
    categories: [],
    category_doms: [],
    category_container: $('#vod-series-categories-container'),
    collapse_btns: $('.vod-series-collapse-icon'),
    page_container1: $('#vod-series-page-container-1'),
    grid_row_count: 5,
    current_showed_category: -1,
    search_input: $('#vod-series-stream-search-input'),
    top_info_container: $('#vod-series-top-info-container'),
    prev_stream_keyword: '',
    prev_category_keyword: '',
    filtered_categories: [],
    category_search_wrapper: $('#vod-series-category-search-wrapper'),
    category_search_input: $('#vod-series-category-search-input'),
    right_top_corner_setting_container: $('#vod-series-top-settings-container'),
    all_right_top_corner_setting_items: $('#vod-series-top-settings-container .right-top-setting-item'),
    right_top_corner_setting_items: [],
    show_series_name: '',
    show_vod_name: '',
    current_movie_index: 0,
    init: function (video_type) {
        this.prev_category_keyword = '';
        this.prev_stream_keyword = '';
        $(this.category_search_input).val('');
        $(this.search_input).val('');
        this.current_showed_category = -1;
        var current_model = getCurrentModel(video_type);
        this.categories = current_model.categories;
        this.filtered_categories = current_model.categories;
        var category_selection = 0;
        for (var i = 4; i < this.categories.length; i++) {
            if (this.categories[i].movies.length > 0) {
                var category = this.categories[i];
                if (checkForAdult(category, 'category', [])) {
                    continue;
                } else {
                    category_selection = i;
                }
                break;
            }
        }

        this.current_render_count = 0;
        this.video_type = video_type;
        var show_hide_movies_series;
        if (video_type === 'vod') {
            show_hide_movies_series = localStorage.getItem('show_hide_movies');
        } else {
            show_hide_movies_series = localStorage.getItem('show_hide_series');
        }

        if (show_hide_movies_series == "true") {
            this.changeVideoNameShowProperty('');
        } else {
            this.changeVideoNameShowProperty('hide');
        }


        this.is_drawing = false;
        current_route = "vod-series-page";

        this.renderCategories();
        this.hoverCategory(category_selection);
        this.showCategoryContent();

    },
    goBack: function () {
        var keys = this.keys;

        switch (keys.focused_part) {
            case "category_selection":
                $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
                $(this.top_info_doms[2]).val('');
                this.hoverTopIcon(1);
                $('#vod-series-page').addClass('hide');
                $('#home-page').removeClass('hide');
                current_route = "home-page";
                break;
            case "menu_selection":
                this.hoverCategory(keys.category_selection);
                break;
            case "top_info_selection":

                var index = 2;
                keys.focused_part = 'top_info_selection';
                this.keys.top_info_selection = index;
                $(this.prev_focus_dom).removeClass('active');
                $(this.top_info_doms[index]).addClass('active');
                this.prev_focus_dom = this.top_info_doms[index];
                var search_input_activated = $(this.page_element).find('.page-top-info-container').hasClass('search-input-activated');
                if (search_input_activated) {
                    $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
                    this.hoverTopIcon(3);
                } else {
                    $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
                    $(this.top_info_doms[2]).val('');
                    this.hoverTopIcon(1);
                    $('#vod-series-page').addClass('hide');
                    $('#home-page').removeClass('hide');
                    current_route = "home-page";
                }
                break;
            case "right_corner_setting_selection":
                $(this.right_top_corner_setting_container).removeClass('expanded');
                this.hoverTopIcon(keys.top_info_selection);
                break;
            case "category_search_selection":
            case "collapse_btn":
                $(this.page_element).find('.page-top-info-container').removeClass('search-input-activated');
                $(this.top_info_doms[2]).val('');
                this.hoverTopIcon(1);
                $('#vod-series-page').addClass('hide');
                $('#home-page').removeClass('hide');
                current_route = "home-page";
                break;
        }
    },
    renderCategories: function () {
        var html = '';

        if (Array.isArray(this.filtered_categories) && this.filtered_categories.length > 0) {
            this.filtered_categories.map(function (item, index) {
                html +=
                    '<div class="category-item-container">\
                        <div class="category-item-wrapper"\
                            onmouseenter="vod_series_page.hoverCategory('+ index + ')" \
                            onclick="vod_series_page.handleMenuClick()" \
                        > \
                            <div class="category-item-name">'+ item.category_name + '</div>\
                            <div class="category-movies-count">'+ item.movies.length + '</div>\
                        </div>\
                    </div>';
            })

        } else {

            html =
                '<div class="category-item-container">\
                <div class="category-item-wrapper"\
                    onmouseenter="vod_series_page.hoverCategory()" \
                    onclick="vod_series_page.handleMenuClick()" \
                > \
                    <div class="category-item-name">No Categories Found</div>\
                    <div class="category-movies-count"></div>\
                </div>\
            </div>';
        }

        $(this.category_container).html(html);
        this.category_doms = $('.category-item-wrapper');
    },
    showCategoryContent: function () {
        var keys = this.keys;
        var category = this.filtered_categories[keys.category_selection];

        if (this.current_showed_category === category.category_id)
            return;
        this.show_series_name = '';
        this.show_vod_name = '';
        keys.menu_selection = 0;

        var show_hide_movies_series;
        if (this.video_type === 'vod') {
            show_hide_movies_series = localStorage.getItem('show_hide_movies');
        } else {
            show_hide_movies_series = localStorage.getItem('show_hide_series');
        }
        if (show_hide_movies_series == "true") {
            this.changeVideoNameShowProperty('');
        } else {
            this.changeVideoNameShowProperty('hide');
        }





        this.current_render_count = 0;
        $('#vod-series-current-category-name').text(category.category_name);
        var movies1 = JSON.parse(JSON.stringify(category.movies));


        var movies;
        if (category.category_id !== 'continue' && category.category_id !== 'recent') {
            movies = getSortedMovies(movies1, settings[this.video_type + '_sort']);
        } else {
            movies = movies1;
        }
        this.movies = movies;
        this.all_movies = movies;
        $('#vod-series-page-category-name').text(category.category_name);
        $('#vod-series-page').removeClass('hide');
        $('#vod-series-movies-container').html('');
        $('#vod-series-movies-container').scrollTop(0);
        if (this.movies.length > 0)
            this.renderMovies();
        else {
            this.menu_doms = [];
            var video_type_name = this.video_type === 'vod' ? 'Movie' : 'Series';
            var empty_movie_title = ''
            if (category.category_id === 'favourite')
                empty_movie_title = 'No Favourite ' + video_type_name + ' Found';
            if (category.category_id === 'continue')
                empty_movie_title = 'No ' + video_type_name + ' Watched Yet';
            var html = '<div class="vod-series-empty-movies-label">' + empty_movie_title + '</div>'
            $('#vod-series-movies-container').html(html);
        }
        this.current_showed_category = category.category_id;

        var all_right_top_corner_setting_items = this.all_right_top_corner_setting_items;

        this.right_top_corner_setting_items = all_right_top_corner_setting_items.slice(0, 2);
        $(all_right_top_corner_setting_items[1]).show();
        $(all_right_top_corner_setting_items[2]).hide();
        if (category.category_id === 'recent') {
            this.right_top_corner_setting_items = all_right_top_corner_setting_items.slice(0, 1);
            $(all_right_top_corner_setting_items[1]).hide();
        } else if (category.category_id === 'continue') {
            this.right_top_corner_setting_items = [
                all_right_top_corner_setting_items[0],
            ]
            $(all_right_top_corner_setting_items[1]).hide();
            if (category.movies.length > 0) {
                this.right_top_corner_setting_items.push(all_right_top_corner_setting_items[2])
                $(all_right_top_corner_setting_items[2]).show();
            } else {
                $(all_right_top_corner_setting_items[2]).hide();
            }
        }
    },
    renderMovies: function () {
        var htmlContent = '';
        var video_type = this.video_type;
        if (this.current_render_count < this.movies.length) {
            showLoader(true);
            this.is_drawing = true;
            var current_render_count = this.current_render_count;
          
            var show_video_name;
            if (video_type === 'series')
                show_video_name = this.show_series_name;
            else
                show_video_name = this.show_vod_name;

            this.movies.slice(this.current_render_count, this.current_render_count + this.render_count_increment).map(function (item, index) {

                var is_favourite = MovieHelper.checkFavourite(video_type, item);
                var favourite_html = '';
                if (is_favourite)
                    favourite_html =
                        '<i class="fa fa-heart vod-series-fav-icon"></i>';
                var img = item.stream_icon;
                if (video_type === "series")
                    img = item.cover;
                var rating_html = '';
                if (typeof item.rating != 'undefined' && item.rating > 0) {
                    var rating = parseFloat(item.rating).toFixed(1);
                    rating_html =
                        '<div class="movie-item-rating">' + rating + '</div>'
                }



                var show_hide_movies_series;
                if (video_type === 'vod') {
                    show_hide_movies_series = localStorage.getItem('show_hide_movies');
                } else {
                    show_hide_movies_series = localStorage.getItem('show_hide_series');
                }




                if (show_hide_movies_series == "true") {

                    htmlContent +=
                        '<div class="movie-item-container">' +
                        '   <div class="movie-item-wrapper"' +
                        '       onclick="vod_series_page.handleMenuClick()"' +
                        '       onmouseenter="vod_series_page.hoverMenuItem(' + (current_render_count + index) + ')"\
                                        >\
                                            <img class="movie-grid-item-image movie-grid-item-image-'+ current_render_count + '"\
                                                src="'+ img + '" onerror="this.src=\'images/noposter.png\'"\
                                            >\
                                            <div class="movie-grid-item-name-container">\
                                                <div class="movie-grid-item-name-wrapper">\
                                                    <div class="movie-grid-item-name max-line-2 '+ show_video_name + '">' +
                        item.name +
                        '               </div>\
                                                </div>\
                                            </div>'+
                        favourite_html + rating_html +
                        '    </div>\
                                    </div>'
                } else {
                    htmlContent +=
                        '<div class="movie-item-container">' +
                        '   <div class="movie-item-wrapper"' +
                        '       onclick="vod_series_page.handleMenuClick()"' +
                        '       onmouseenter="vod_series_page.hoverMenuItem(' + (current_render_count + index) + ')"\
                                           >\
                                              <img class="movie-grid-item-image movie-grid-item-image-'+ current_render_count + '"\
                                                  src="'+ img + '" onerror="this.src=\'images/noposter.png\'"\
                                              >\
                                              <div class="movie-grid-item-name-container">\
                                                  <div class="movie-grid-item-name-wrapper hide">\
                                                      <div class="movie-grid-item-name max-line-2 '+ show_video_name + '">' +
                        item.name +
                        '               </div>\
                                                  </div>\
                                              </div>'+
                        favourite_html + rating_html +
                        '    </div>\
                                       </div>'
                }

            })
            
        } else {
        		
        	
            if (video_type === "series") {
                htmlContent = '<div class="movie-item-container centerContentChildDiv"><div><h3>No series found</h3></div></div>'
                
            } else if(video_type === "vod") {
                
                htmlContent = '<div class="movie-item-container centerContentChildDiv"><div><h3>No movies found</h3></div></div>'
            }
            
        }
        
        $('#vod-series-movies-container').append(htmlContent);
        this.menu_doms = $('.movie-item-container');
        this.current_render_count += this.render_count_increment;
        var that = this;
        setTimeout(function () {
            that.is_drawing = false;
            showLoader(false);
        }, 2000)
        

    },
    changeVideoNameShowProperty: function (new_value) {

        var video_type = this.video_type;
        var show_video_name_key = 'show_' + video_type + '_name';
        this[show_video_name_key] = new_value;
        var video_name_suffix = video_type === 'vod' ? 'Movie Name' : 'Series Name';
        var show_hide_icon_class = new_value === '' ? 'fa-eye-slash' : 'fa-eye',
            show_video_name_title = new_value === '' ? 'Hide ' : 'Show ';
        show_video_name_title += video_name_suffix;

        $(this.all_right_top_corner_setting_items[0]).find('i').removeClass('fa-eye');
        $(this.all_right_top_corner_setting_items[0]).find('i').removeClass('fa-eye-slash');
        $(this.all_right_top_corner_setting_items[0]).find('i').addClass(show_hide_icon_class);
        $(this.all_right_top_corner_setting_items[0]).find('.right-top-corner-setting-name').text(show_video_name_title);
    },
    checkSearchActivated: function () {
        var search_input_activated = $(this.top_info_container).hasClass('search-input-activated');
        return search_input_activated;
    },
    categoryKeywordChange: function () {

        clearTimeout(this.search_category_timer);
        var that = this;
        this.search_category_timer = setTimeout(function () {
            var keyword = $(that.category_search_input).val();
            if (keyword == that.prev_category_keyword)
                return;
            var filtered_categories = that.categories;
            if (keyword !== '') {
                filtered_categories = that.categories.filter(function (item) {
                    return item.category_name.toLowerCase().includes(keyword.toLowerCase());
                })
            }
            that.filtered_categories = filtered_categories;
            that.renderCategories();
            that.prev_category_keyword = keyword;
        }, 300);
    },
    keyChange: function () {
        clearTimeout(this.search_stream_timer);
        var that = this;
        this.search_stream_timer = setTimeout(function () {
            var keys = that.keys;
            var keyword = $(that.search_input).val();
            if (keyword == that.prev_stream_keyword)
                return;
            var movies;
            if (keyword === '')
                movies = that.all_movies;
            else {
                movies = that.all_movies.filter(function (item) {
                    return item.name.toLowerCase().includes(keyword.toLowerCase());
                })
            }
            that.movies = movies;
            $('#vod-series-movies-container').html('');
            $('#vod-series-movies-container').scrollTop(0);
            that.current_render_count = 0;
            that.menu_doms = [];
            that.prev_stream_keyword = keyword;
            that.renderMovies();
        }, 300)
    },
    removeAllActiveClass: function () {
        $(this.menu_doms).removeClass('active');
        $(this.top_info_doms).removeClass('active');
        $(this.category_doms).removeClass('active');
        $(this.collapse_btns).removeClass('active');
        $(this.top_info_doms).removeClass('active');
        $(this.right_top_corner_setting_items).removeClass('active');
        $(this.category_search_wrapper).removeClass('active');
    },
    moveKeyOnMovies: function (increment) {
        var keys = this.keys;
        if (increment == -1 && keys.menu_selection % this.grid_row_count == 0) {
            if (!$(this.page_container1).hasClass('expanded'))
                $(this.page_container1).addClass('expanded');
            this.hoverCategory(keys.category_selection);
            return;
        }
        keys.menu_selection += increment;
        if (keys.menu_selection < 0) {
            if (increment < -1) {
                var search_activated = this.checkSearchActivated();
                var top_info_selection = search_activated ? 0 : 3;
                this.hoverTopIcon(top_info_selection);
                return;
            }
        }
        if (keys.menu_selection >= this.menu_doms.length) {
            keys.menu_selection = this.menu_doms.length - 1;
        }
        this.hoverMenuItem(keys.menu_selection);
        if (keys.menu_selection >= this.current_render_count - 6) {
            this.renderMovies();
        }
    },
    toggleFavMark: function (opposite) {
        var keys = this.keys;
        var menu_doms = this.menu_doms;
        var menu_selection = keys.menu_selection;
        var movie = this.movies[keys.menu_selection];
        var is_favourite = MovieHelper.checkFavourite(this.video_type, movie);
        var action;
        if (is_favourite) {  // if favourite, remove favourite mark
            if (opposite)
                action = 'remove';
            else
                action = 'add'
        } else {
            if (opposite)
                action = 'add'
            else
                action = 'remove';
        }
        if (action === 'add') {
            $(menu_doms[menu_selection]).append('<i class="fa fa-heart vod-series-fav-icon"></i>');
            MovieHelper.addToFavourite(this.video_type, movie);
        }
        else {
            var movie_key = this.video_type === 'vod' ? 'stream_id' : 'series_id';
            $(menu_doms[menu_selection]).find('.vod-series-fav-icon').remove();
            MovieHelper.removeFavouriteMovie(this.video_type, movie[movie_key]);
        }
        var favourite_position = MovieHelper.getFavouriteMoviePosition();
        var favourite_movie_count = this.categories[favourite_position].movies.length
        $(this.category_doms[1]).find('.category-movies-count').text(favourite_movie_count);
    },
    updateWatchList: function () {
        var watchlist_position = MovieHelper.getWatchListPosition();
        var watchlist_movies = this.categories[watchlist_position].movies;
        $(this.category_doms[2]).find('.category-movies-count').text(watchlist_movies.length);
    },
    showVideoNameShowState: function () {


        var show_video_name = this['show_' + this.video_type + '_name'];
        var new_show_property = show_video_name == '' ? 'hide' : '';
        this.changeVideoNameShowProperty(new_show_property);
        if (new_show_property == 'hide') {

            $(this.menu_doms).find('.movie-grid-item-name-wrapper').addClass('hide');
            $(this.menu_doms).find('.movie-grid-item-name').addClass('hide');

            if (this.video_type === 'vod') {
                localStorage.setItem('show_hide_movies', "false");
            } else {
                localStorage.setItem('show_hide_series', "false");
            }


        } else {

            $(this.menu_doms).find('.movie-grid-item-name-wrapper').removeClass('hide');
            $(this.menu_doms).find('.movie-grid-item-name').removeClass('hide');
            if (this.video_type === 'vod') {
                localStorage.setItem('show_hide_movies', "true");
            } else {
                localStorage.setItem('show_hide_series', "true");
            }
        }
    },
    changeSortStatus: function () {
        sort_page.init('vod-series-page');
    },
    removeAllWatchList: function () {
        MovieHelper.removeAllWatchList(this.video_type);
        this.movies = [];
        this.all_movies = [];
        $('#vod-series-movies-container').html('');
        this.updateWatchList();
        this.menu_doms = [];
    },
    hoverCollapseBtn: function (type) {
        var keys = this.keys;
        keys.focused_part = "collapse_btn";
        this.removeAllActiveClass();
        $(this.collapse_btns).addClass('active');
        if (type == 'k') {
            $("#vod-series-category-search-input").blur();
            $("#vod-series-stream-search-input").blur();
        }

    },
    hoverTopIcon: function (index, type) {
        var keys = this.keys;
        keys.focused_part = 'top_info_selection';
        keys.top_info_selection = index;
        this.removeAllActiveClass();
        $(this.top_info_doms[index]).addClass('active');
        if (type == 'k') {
            $("#vod-series-category-search-input").blur();
            $("#vod-series-stream-search-input").blur();
        }

    },
    hoverCategory: function (index, type) {
        var keys = this.keys;
        keys.focused_part = 'category_selection';
        keys.category_selection = index;
        this.removeAllActiveClass();
        $(this.category_doms[index]).addClass('active');

        if (type == 'k') {
            $("#vod-series-category-search-input").blur();
            $("#vod-series-stream-search-input").blur();
        }




        $(this.page_container1).addClass('expanded');
        this.grid_row_count = 5;
        moveScrollPosition(this.category_container, this.category_doms[index], 'vertical', false);
    },
    hoverMenuItem: function (index, type) {
        var keys = this.keys;
        keys.menu_selection = index;
        keys.focused_part = "menu_selection";
        this.removeAllActiveClass();
        $(this.menu_doms[index]).addClass('active');
        if (type == 'k') {
            $("#vod-series-category-search-input").blur();
            $("#vod-series-stream-search-input").blur();
        }


        moveScrollPosition($('#vod-series-movies-container'), $(this.menu_doms[index]).closest('.movie-item-container'), 'vertical', false);
    },
    hoverCategorySearch: function () {
        this.removeAllActiveClass();
        $(this.category_search_wrapper).addClass('active');
        this.keys.focused_part = 'category_search_selection';
    },
    hoverRightCornerSetting: function (targetElement) {
        var index = $(targetElement).data('index');
        if (index >= this.right_top_corner_setting_items.length)
            index = this.right_top_corner_setting_items.length - 1;
        this.removeAllActiveClass();
        $(this.right_top_corner_setting_items[index]).addClass('active');
        this.keys.focused_part = "right_corner_setting_selection";
        this.keys.right_corner_setting_selection = index;
    },
    handleMenuClick: function (type) {
        var keys = this.keys;

        switch (keys.focused_part) {
            case "category_search_selection":

                if (type == 'k') {
                    if ($(this.category_search_input).is(":focus")) {
                        $(this.category_search_input).blur();
                    } else {
                        $(this.category_search_input).focus();
                    }
                }

                break;
            case "category_selection":
                var category = this.filtered_categories[keys.category_selection];
                if (this.current_showed_category === category.category_id)
                    return;
                if (checkForAdult(category, 'category', [])) {
                    parent_confirm_page.init(current_route);
                    return;
                }
                this.showCategoryContent();
                break;
            case "collapse_btn":
                $(this.page_container1).toggleClass('expanded');
                if ($(this.page_container1).hasClass('expanded'))
                    this.grid_row_count = 5;
                else
                    this.grid_row_count = 7;
                break;
            case "menu_selection":
                this.current_movie_index = keys.menu_selection;
                $('#vod-series-page').addClass('hide');
                if (this.video_type === 'vod') {
                    vod_series_summary_page.cast_selection = 0;

                    $('#vod-series-summary-info-container').show();
                    $('#cast-detail-container').hide();
                    $('#casts-container-vod').show();
                    $('#casts-container').html("");
                    vod_series_summary_page.init('vod', this.movies[keys.menu_selection]);

                    $(".vod-series-summary-content-container").removeClass('slideUpHide');
                    $(".vod-series-summary-content-container").addClass('slideUpShow');

                }
                if (this.video_type === 'series') {
                    vod_series_summary_page.cast_selection = 0;

                    $('#vod-series-summary-info-container').show();
                    $('#cast-detail-container').hide();
                    $('#casts-container-vod').hide();
                    $('#casts-container-vod').html("");


                    $(".vod-series-summary-content-container").removeClass('slideUpHide');
                    $(".vod-series-summary-content-container").addClass('slideUpShow');

                    vod_series_summary_page.init('series', this.movies[keys.menu_selection]);
                }
                break;
            case "top_info_selection":


                switch (keys.top_info_selection) {
                    case 0:
                        $(this.top_info_container).removeClass('search-input-activated');
                        $(this.top_info_doms[1]).val('')
                        this.keyChange();
                        this.hoverTopIcon(3);
                        break;
                    case 1:

                        if (type == 'k') {
                            if ($(this.search_input).is(":focus")) {
                                $(this.search_input).blur();
                            } else {
                                $(this.search_input).focus();
                            }
                        }
                        break;
                    case 2:
                        $(this.search_input).val('');
                        this.keyChange();
                        break;
                    case 3:
                        $(this.top_info_container).addClass('search-input-activated');
                        this.hoverTopIcon(1);
                        break;
                    case 4:
                        $(this.right_top_corner_setting_container).addClass('expanded');
                        this.hoverRightCornerSetting(this.right_top_corner_setting_items[0]);
                        break;
                }
                break;
            case "right_corner_setting_selection":
                $(this.right_top_corner_setting_items[keys.right_corner_setting_selection]).trigger('click');
                this.goBack();
        }
    },
    handleMenusUpDown: function (increment) {
        var keys = this.keys;
        switch (keys.focused_part) {
            case "category_search_selection":
                if (increment > 0 && this.category_doms.length > 0)
                    this.hoverCategory(0, 'k');
                if (increment < 0)
                    this.hoverCollapseBtn('k');
                break;
            case "category_selection":
                keys.category_selection += increment;
                if (keys.category_selection < 0) {
                    this.hoverCategorySearch();
                    break;
                }
                if (keys.category_selection >= this.category_doms.length)
                    keys.category_selection = this.category_doms.length - 1;
                this.hoverCategory(keys.category_selection, 'k');
                break;
            case "collapse_btn":
                if (increment > 0) {
                    var is_expanded = $(this.page_container1).hasClass('expanded');
                    if (is_expanded) {
                        this.hoverCategory(0, 'k');
                    } else {
                        if (this.movies.length > 0)
                            this.hoverMenuItem(0);
                    }
                }
                break;
            case "menu_selection":
                this.moveKeyOnMovies(this.grid_row_count * increment);
                break;
            case "top_info_selection":
                if (increment > 0 && this.menu_doms.length > 0)
                    this.hoverMenuItem(0);
                break;
            case "right_corner_setting_selection":
                keys.right_corner_setting_selection += increment;
                if (keys.right_corner_setting_selection < 0)
                    keys.right_corner_setting_selection = 0;
                if (keys.right_corner_setting_selection >= this.right_top_corner_setting_items.length)
                    keys.right_corner_setting_selection = this.right_top_corner_setting_items.length - 1;
                this.hoverRightCornerSetting(this.right_top_corner_setting_items[keys.right_corner_setting_selection]);
                break;
        }
    },
    handleMenuLeftRight: function (increment) {
        var keys = this.keys;
        switch (keys.focused_part) {
            case "collapse_btn":
                var search_activated = this.checkSearchActivated();
                var top_info_selection = search_activated ? 0 : 3;
                this.hoverTopIcon(top_info_selection, 'k');
                break;
            case "category_selection":
                if (increment > 0 && this.menu_doms.length > 0)
                    this.hoverMenuItem(keys.menu_selection, 'k');
                break;
            case "menu_selection":
                this.moveKeyOnMovies(increment);
                break;
            case "top_info_selection":
                var search_input_activated = this.checkSearchActivated();
                var min_selection = search_input_activated ? 0 : 4;
                keys.top_info_selection += increment;
                if (keys.top_info_selection < min_selection) {
                    this.hoverCollapseBtn('k');
                    return;
                }
                if (search_input_activated && keys.top_info_selection == 3) {
                    if (increment > 0)
                        keys.top_info_selection = 4;
                    if (increment < 0)
                        keys.top_info_selection = 2;
                }
                if (keys.top_info_selection >= this.top_info_doms.length)
                    keys.top_info_selection = this.top_info_doms.length - 1;
                this.hoverTopIcon(keys.top_info_selection, 'k');
                break;
        }
    },
    HandleKey: function (e) {
        if (this.is_drawing)
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
            case tvKey.RETURN_LG: case tvKey.ESC:
                this.goBack();
                break;
            case tvKey.YELLOW:
                this.toggleFavMark(true);
                break;
        }


    }
}

var categories_search = document.getElementById('vod-series-category-search-input');

var inputHandler = function (e) {
    vod_series_page.categoryKeywordChange();
}

categories_search.addEventListener('input', inputHandler);
categories_search.addEventListener('propertychange', inputHandler);

var top_search_input = document.getElementById('vod-series-stream-search-input');
var top_search_input_handler = function (e) {
    vod_series_page.keyChange();
}
top_search_input.addEventListener('input', top_search_input_handler);
top_search_input.addEventListener('propertychange', top_search_input_handler);
