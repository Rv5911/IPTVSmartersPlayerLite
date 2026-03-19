"use strict";
var mac_address = "52:54:00:12:34:57",
  user_name = "tesmyline",
  password = "testmypassword",
  server_info,
  user_info,
  api_host_url = "https://cdn.nion.tv:8083/",
  panel_url = "https://flixiptv.eu/api",
  time_difference_with_server = 0; // time difference between user time and server time, measured by mins
var current_route = "home-page";
var current_movie, current_episode, current_series;

var parent_account_password = "0000";
var playlists = [];
var current_words = [];
var client_offset = moment(new Date()).utcOffset();
var playlist;
var storage_id;

var tmdb_url = "https://api.themoviedb.org/3/tv/",
  tmdb_api_key = "753012cd1b6d7ae52c92c79ff2c748e6",
  tmdb_profile_url = "https://image.tmdb.org/t/p/w500/";

var app_loading = false;

function hideRightSettingContainer() {
  $(".right-top-corner-settings-container").removeClass("expanded");
}

function getCurrentModel(stream_type) {
  var current_model;
  switch (stream_type) {
    case "vod":
      current_model = VodModel;
      break;
    case "series":
      current_model = SeriesModel;
      break;
    case "live":
      current_model = LiveModel;
      break;
  }
  return current_model;
}

function updateTimeStr() {
  var date_obj = moment();
  var date_str = date_obj.format("MMMM DD, YYYY");
  $(".top-info-date").text(date_str);
  var time_format_str = "hh:mm A";
  if (settings.time_format === "24") time_format_str = "HH:mm";
  var time_str = date_obj.format(time_format_str);
  $(".top-info-time").text(time_str);
}

function showLoader(flag) {
  if (typeof flag == "undefined") flag = true;
  if (flag) $("#loader").show();
  else $("#loader").hide();
}

function saveData(key, data) {
  window[key] = data;
}

function getMovieUrl(stream_id, stream_type, extension) {
  if (stream_type === "vod") stream_type = "movie";
  if (stream_type === "channel" || stream_type === "live")
    extension =
      settings.stream_format === "default" ? "ts" : settings.stream_format;
  return (
    playlist.url +
    "/" +
    stream_type +
    "/" +
    playlist.user_name +
    "/" +
    playlist.password +
    "/" +
    stream_id +
    "." +
    extension
  );
}

function getCurrentMovieFromId(value, movies, key) {
  var current_movie = null;
  for (var i = 0; i < movies.length; i++) {
    if (movies[i][key] == value) {
      current_movie = movies[i];
      break;
    }
  }
  return current_movie;
}

function moveScrollPosition(parent_element, element, direction, to_top) {
  // move the scroll bar according to element position
  try {
    if (direction === "vertical") {
      var padding_top = parseInt(
        $(parent_element).css("padding-top").replace("px", ""),
      );
      var padding_bottom = parseInt(
        $(parent_element).css("padding-bottom").replace("px", ""),
      );
      var parent_height = parseInt(
        $(parent_element).css("height").replace("px", ""),
      );
      var child_position = $(element).position();
      var element_height = parseInt($(element).css("height").replace("px", ""));
      var move_amount = 0;
      if (!to_top) {
        if (
          child_position.top + element_height >=
          parent_height - padding_bottom
        )
          move_amount =
            child_position.top +
            element_height -
            parent_height +
            padding_bottom;
        if (child_position.top - padding_top < 0)
          move_amount = child_position.top - padding_top;
        $(parent_element).animate(
          {
            scrollTop: "+=" + move_amount,
          },
          10,
        );
      } else {
        // if element should on top position
        $(parent_element).animate(
          {
            scrollTop: child_position.top,
          },
          10,
        );
      }
      return move_amount;
    } else {
      var padding_left = parseInt(
        $(parent_element).css("padding-left").replace("px", ""),
      );
      // var parent_width=$(parent_element).width();
      // var element_width=$(element).width();
      var parent_width = parseInt(
        $(parent_element).css("width").replace("px", ""),
      );
      var element_width = parseInt($(element).css("width").replace("px", ""));
      var child_position = $(element).position();
      var scroll_amount = 0;
      if (child_position.left + element_width >= parent_width)
        scroll_amount = child_position.left + element_width - parent_width;
      if (child_position.left - padding_left < 0)
        scroll_amount = child_position.left - padding_left;
      $(parent_element).animate(
        {
          scrollLeft: "+=" + scroll_amount,
        },
        10,
      );
      return scroll_amount;
    }
  } catch (e) {
    console.log(e);
  }
}

function showToast(title, text) {
  $("#toast-body").html("<h3>" + title + "<br>" + text + "</h3>");
  $(".toast").toast({
    animation: true,
    delay: 2000,
  });
  $("#toast").toast("show");
}

function getMinute(time_string) {
  // get the minute of time string
  var date = moment(time_string).toDate().getTime();
  return parseInt(date / 60 / 1000);
}

function convertVwToPixel(amount) {
  var window_width = $(window).width();
  return (amount * window_width) / 100;
}

function parseM3uUrl() {
  // here, we will check if it is xtreme url or general m3u url
  var playlist_url = settings.playlist_url;
  if (playlist_url.includes("username=") && playlist_url.includes("password="))
    settings.playlist_type = "xtreme";
  else settings.playlist_type = "type1";

  if (settings.playlist_type === "xtreme") {
    var temp_array1 = settings.playlist_url.split("?");
    var temp_array2 = temp_array1[1].split("&");
    temp_array2.map(function (item) {
      var temp = item.split("=");
      var key = temp[0],
        value = temp[1];
      if (key.toLowerCase() === "username") user_name = value;
      if (key.toLowerCase() === "password") password = value;
    });
    api_host_url = temp_array1[0].replace("/get.php", "");
  } else api_host_url = settings.playlist_url;
}

function parseM3uResponse(type, text_response) {
  var num = 0;
  if (type === "type1") {
    var live_categories = [];
    var lives = [];
    var vods = [];
    var vod_categories = [];
    var series_categories = [];
    var series = [];
    text_response = text_response.replace(/['"]+/g, "");
    var temp_arr2 = text_response.split(/#EXTINF:-{0,1}[0-9]{1,} {0,},{0,}/gm);
    temp_arr2.splice(0, 1); // remove the first row
    var temp_arr1 = [];

    if (text_response.includes("tvg-")) {
      // if general m3u type 1
      var live_category_map = {},
        vod_category_map = {},
        series_category_map = {};
      for (var i = 0; i < temp_arr2.length; i++) {
        try {
          temp_arr1 = temp_arr2[i].split("\n");
          num++;
          var url = temp_arr1[1].length > 1 ? temp_arr1[1] : "";
          if (!url.includes("http:")) continue;
          var type = "live";
          if (
            url.includes("/movie/") ||
            url.includes("vod") ||
            url.includes("=movie") ||
            url.includes("==movie==")
          )
            type = "vod";
          if (url.includes("/series/")) type = "series";

          var temp_arr3 = temp_arr1[0].trim().split(",");
          var name = temp_arr3.length > 1 ? temp_arr3[1] : ""; // get the name of channel

          var temp_arr4 = splitStrings(temp_arr3[0], [
            "tvg-",
            "channel-",
            "group-",
          ]);
          if (num < 10) console.log(temp_arr3[0], temp_arr4);
          var result_item = {
            stream_id: "",
            name: name,
            stream_icon: "",
            title: "",
          };
          var category_name = "All";
          temp_arr4.map(function (sub_item) {
            var sub_item_arr = sub_item.split("=");
            var key = sub_item_arr[0];
            var value = sub_item_arr[1];
            switch (key) {
              case "id":
                result_item.stream_id = value;
                break;
              case "name":
                result_item.name = value;
                break;
              case "logo":
                result_item.stream_icon = value;
                break;
              case "title":
                category_name = value.split(",")[0];
                break;
            }
          });
          if (result_item.stream_id.trim() === "")
            result_item.stream_id = result_item.name;
          result_item.url = url;
          result_item.num = num;

          if (type === "live") {
            if (typeof live_category_map[category_name] == "undefined") {
              live_category_map[category_name] = category_name;
              var category_item = {
                category_id: category_name,
                category_name: category_name,
              };
              live_categories.push(category_item);
            }

            result_item.category_id = category_name;
            lives.push(result_item);
          }

          if (type === "vod") {
            if (typeof vod_category_map[category_name] == "undefined") {
              vod_category_map[category_name] = category_name;
              var category_item = {
                category_id: category_name,
                category_name: category_name,
              };
              vod_categories.push(category_item);
            }
            result_item.category_id = category_name;
            vods.push(result_item);
          }

          if (type === "series") {
            if (typeof series_category_map[category_name] == "undefined") {
              series_category_map[category_name] = category_name;
              var category_item = {
                category_id: category_name,
                category_name: category_name,
              };
              series_categories.push(category_item);
            }
            result_item.category_id = category_name;
            series.push(result_item);
          }
        } catch (e) {
          console.log("parsing m3u error " + i, e);
        }
      }
    } else {
      live_categories = [
        {
          category_id: "all",
          category_name: "All",
        },
      ];
      vod_categories = [
        {
          category_id: "all",
          category_name: "All",
        },
      ];
      series_categories = [
        {
          category_id: "all",
          category_name: "All",
        },
      ];
      for (var i = 0; i < temp_arr2.length; i++) {
        try {
          temp_arr1 = temp_arr2[i].split("\n");
          var name = temp_arr1[0];
          var url = temp_arr1[1];

          var type = "live";
          if (url.includes("/movie/")) type = "movie";
          if (url.includes("/series/")) type = "series";
          var result_item = {};
          name = name.trim();
          result_item.stream_id = name;
          result_item.name = name;
          result_item.stream_icon = "";
          result_item.num = i + 1;
          result_item.category_id = "all";
          result_item.url = url;
          if (type === "live") lives.push(result_item);
          if (type === "series") series.push(result_item);
          if (type === "movie") vods.push(result_item);
        } catch (e) {
          console.log(temp_arr1[0]);
          console.log(e);
        }
      }
    }

    if (live_categories.length > 1) {
      live_categories.map(function (item) {
        if (item.category_id === "All") item.category_name = "Uncategorized";
      });
    }

    if (vod_categories.length > 1) {
      vod_categories.map(function (item) {
        if (item.category_id === "All") item.category_name = "Uncategorized";
      });
    }

    if (series_categories.length > 1) {
      series_categories.map(function (item) {
        if (item.category_id === "All") item.category_name = "Uncategorized";
      });
    }

    LiveModel.setCategories(live_categories);
    LiveModel.setMovies(lives);
    LiveModel.insertMoviesToCategories();

    VodModel.setCategories(vod_categories);
    VodModel.setMovies(vods);
    VodModel.insertMoviesToCategories();

    SeriesModel.setCategories(series_categories);
    var parsed_series = parseSeries(series);
    SeriesModel.setMovies(parsed_series);
    SeriesModel.insertMoviesToCategories();
  }
}

function parseSeries(data) {
  var series = [];
  var series_map = {};
  var season_map = {},
    episodes = {};
  data.map(function (item) {
    try {
      var temp_arr1 = item.name.split(/ S[0-9]{2}/);
      var season_name = item.name.match(/S[0-9]{2}/)[0];
      season_name = season_name.trim().replace("S", "");
      season_name = "Season " + season_name;
      var series_name = temp_arr1[0].trim();
      var episode_name = temp_arr1[1].trim().replace("E", "");
      if (typeof series_map[series_name] == "undefined") {
        ((season_map = {}), (episodes = {})); // Initialize for every other series
        episodes[season_name] = [
          {
            name: episode_name,
            url: item.url,
            id: episode_name,
            info: {},
            title: "Episode " + episode_name,
          },
        ];
        season_map[season_name] = {
          name: season_name,
          cover: "images/series.png",
        };
        series_map[series_name] = {
          series_id: series_name,
          name: series_name,
          cover: item.stream_icon,
          youtube_trailer: "",
          category_id: item.category_id,
          rating: "",
          rating_5based: "",
          genre: "",
          director: "",
          cast: "",
          plot: "",
          season_map: season_map,
          episodes: episodes,
        };
      } else {
        if (typeof season_map[season_name] == "undefined") {
          episodes[season_name] = [
            {
              name: episode_name,
              url: item.url,
              id: episode_name,
              info: {},
              title: "Episode " + episode_name,
            },
          ];
          season_map[season_name] = {
            name: season_name,
            cover: "images/series.png",
          };
          series_map.season_map = season_map;
        } else {
          episodes[season_name].push({
            name: season_name,
            url: item.url,
            id: season_name,
            info: {},
            title: "Episode " + episode_name,
          });
        }
        series_map.episodes = episodes;
      }
    } catch (e) {
      console.log(e);
    }
  });
  var series_num = 0;
  Object.keys(series_map).map(function (key) {
    series_num++;
    var item = series_map[key];
    var seasons = [];
    try {
      Object.keys(item.season_map).map(function (key1) {
        seasons.push(item.season_map[key1]);
      });
    } catch (e) {}
    delete item["season_map"];
    item.num = series_num;
    item.seasons = seasons;
    series.push(item);
  });
  return series;
}

function splitStrings(string, keys) {
  var result_array = [];
  for (var i = 0; i < keys.length; i++) {
    var temp_arr = string.split(keys[i]);
    if (i == keys.length - 1) {
      for (var j = 0; j < temp_arr.length; j++) {
        if (temp_arr[j].trim() != "") result_array.push(temp_arr[j]);
      }
      return result_array;
    } else {
      for (var j = 0; j < temp_arr.length; j++) {
        if (temp_arr[j].trim() != "") {
          var temp_arr2 = splitStrings(temp_arr[j], keys.slice(i + 1));
          temp_arr2.map(function (item) {
            if (item.trim() !== "") result_array.push(item);
          });
        }
      }
      return result_array;
    }
  }
}

function getAtob(text) {
  var result = text;
  try {
    return decodeURIComponent(
      atob(text)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
  } catch (e) {}
  return result;
}

function getSortedMovies(movies1, key) {
  var movies = JSON.parse(JSON.stringify(movies1));
  var new_movies = [];
  var new_key = key;
  if (key === "a-z" || key === "z-a") new_key = "name";
  if (key === "num-asc") new_key = "num";
  if (
    typeof movies[0] != "undefined" &&
    typeof movies[0][new_key] == "undefined"
  ) {
    return movies;
  }
  var direction = 1;
  switch (key) {
    case "rating":
    case "num":
    case "num-asc":
    case "added":
      direction = 1;
      if (key === "num") direction = -1;
      new_movies = movies.sort(function (a, b) {
        var a_new_key = parseFloat(a[new_key]);
        if (isNaN(a_new_key)) a_new_key = 0;
        var b_new_key = parseFloat(b[new_key]);
        if (isNaN(b_new_key)) b_new_key = 0;
        return (
          direction *
          (a_new_key < b_new_key ? 1 : a_new_key > b_new_key ? -1 : 0)
        );
      });
      break;
    case "a-z":
    case "z-a":
      direction = key === "a-z" ? 1 : -1;
      new_movies = movies.sort(function (a, b) {
        return direction * a[new_key].localeCompare(b[new_key]);
      });
      break;
    case "default":
      return movies;
  }
  return new_movies;
}

function getFormatedDuration(duration) {
  var result = "";
  try {
    var temps = duration.split(":");
    if (temps[0] == "00" || temps[0] === "0") temps.splice(0, 1);
    var time_keys = ["h", "m", "s"];
    if (temps.length == 2) time_keys = ["m", "s"];
    for (var i = 0; i < temps.length; i++) {
      if (temps[i] != "") {
        result += " " + parseInt(temps[i]) + time_keys[i];
      }
    }
    result = result.trim();
  } catch (e) {}
  return result;
}

function setSubtitleFontSize() {
  var font_size = settings.subtitle_font_size;
  $(".subtitle-container").css({
    "font-size": font_size + "px",
  });
  $("#subtitle-font-size").text(font_size);
}

function setAnimationDuration(speed, parent_element, child_element) {
  $(child_element).css({
    "animation-duration": "unset",
  });
  setTimeout(function () {
    var parent_height = $(parent_element).height();
    var child_height = $(child_element).height();
    if (child_height <= parent_height) {
      $(child_element).css({
        "animation-duration": "unset",
      });
      return;
    }
    $(child_element).css({
      "animation-duration": speed * child_height + "s",
    });
  }, 3000);
}

function showBottomToast(text, timeOut) {
  $("#bottom-toast").html(text).addClass("show");
  setTimeout(function () {
    $("#bottom-toast").html(text).removeClass("show");
  }, timeOut);
}

function showAuthorizationFailedDialog(serverAddress) {
  let showQrCode = localStorage.getItem("show_qr_code");
  let whmcsLink = localStorage.getItem("whmcs_link");

  if (showQrCode === null) showQrCode = "false";
  if (whmcsLink === null) whmcsLink = "";

  showLoader(false);

  const existingDialog = document.getElementById("dns-custom-dialog-container");
  if (existingDialog) existingDialog.remove();

  const dialog = document.createElement("div");
  dialog.className = "dns-custom-dialog-container";
  dialog.id = "dns-custom-dialog-container";
  const content = document.createElement("div");
  content.className = "dns-custom-dialog-content";

  content.innerHTML = `
        <div  class="dns-website-logo-container">
      <img src="images/logo.png" alt="Website Icon" class="website-logo"  />
    </div>
    <h2 class="dns-dialog-title">Server address is not whitelisted</h2>
    <p class="dns-dialog-message">Please whitelist your server address scan the QR code to continue or using the link below</p>

 <div class="dns-qr-container" id="dns-qr-code" style="display: ${showQrCode == "true" ? "inline-block" : "none"}">
    </div>

    
    <div  class="dns-website-container">
      <p  class="dns-website-or">${showQrCode == "true" ? "OR" : ""}</p>
             <p class="dns-dialog-message-website-link" style="display:none;">Please whitelist your server address using the link below to continue</p>
      <a target="_blank" style="display: block" href="${whmcsLink}" class="dns-website-link">${whmcsLink}</a>
    </div>

  `;

  dialog.appendChild(content);
  document.body.appendChild(dialog);

  // Generate QR Code locally
  const qrContainer = document.getElementById("dns-qr-code");
  if (qrContainer) {
    new QRCode(qrContainer, {
      text: `https://www.whmcssmarters.com/clients/cart.php?a=add&pid=187&customfield[443]=${serverAddress}`,
      width: 300,
      height: 300,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  }
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function checkAuth(url) {
  var m = "gu",
    k = url,
    sc = "",
    av = "1.6.9",
    dt = "unknown",
    dos = "8.1.0 O",
    d = "Samsung TV Built";
  var r = getRandomArbitrary(10000, 8388600);
  var sc =
    k +
    "*" +
    "NB!@#12ZKWd" +
    "-" +
    "" +
    "-" +
    r +
    "-" +
    av +
    "-" +
    dt +
    "-" +
    d +
    "-" +
    dos;
  var dsc = MD5(sc);
  return $.ajax({
    url: localStorage.getItem("base_Url")
      ? localStorage.getItem("base_Url")
      : "https://smarttv01.iptvsmarters.com/Android",
    type: "POST",
    data: {
      m: m,
      k: k,
      sc: dsc,
      r: r,
      av: av,
      dt: dt,
      do: dos,
      d: d,
    },
    success: function (data) {},
    error: function (errObj) {},
    timeout: 80000,
  });
}

function checkForAdult(item, item_type, categories) {
  var is_adult = false;
  var category;
  if (item_type === "movie") {
    //
    for (var i = 0; i < categories.length; i++) {
      if (item.category_id == categories[i].category_id) {
        category = categories[i];
        break;
      }
    }
  } else category = item;
  var category_name = category.category_name.toLowerCase();
  if (
    category_name.includes("xxx") ||
    category_name.includes("adult") ||
    category_name.includes("porn")
  )
    is_adult = true;
  return is_adult;
}
