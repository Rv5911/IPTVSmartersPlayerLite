"use strict";
var xtreme_user_page = {
  keys: {
    focused_part: "menu_selection",
    menu_selection: 0,
  },
  prev_route: "",
  menu_doms: $(".xtreme-user-menu-item"),
  is_loading: false,
  back_clicked: 0,
  back_click_timer: null,

  init: function (prev_route) {
    this.back_clicked = 0;
    this.prev_route = prev_route;
    $("#app").show();
    $("#xtreme-user-page").removeClass("hide");
    current_route = "xtreme-user-page";
    this.hoverMenuItem(1);
  },
  goBack: function () {
    const customDialog = document.getElementById("dns-custom-dialog-container");
    if (customDialog) {
      customDialog.remove();
      return;
    }
    if (this.back_clicked == 0) {
      clearTimeout(this.back_click_timer);
      this.back_clicked = 1;
      showBottomToast("Press again to Exit", 3000);
      var that = this;
      this.back_click_timer = setTimeout(function () {
        that.back_clicked = 0;
      }, 3000);
    } else if (this.back_clicked == 1) {
      try {
        window.close();
      } catch (e) {}
    }
  },
  savePlayList: function () {
    var that = this;
    var playlist_name = $(this.menu_doms[1]).val();
    var user_name = $(this.menu_doms[2]).val();
    var password = $(this.menu_doms[3]).val();
    var url = $(this.menu_doms[5]).val();

    var valid = true;
    $(".xtreme-user-input-error").hide();
    if (playlist_name == "") {
      $("#xtreme-playlist-name-error").slideDown();
      valid = false;
    }
    if (user_name == "") {
      $("#xtreme-username-error").slideDown();
      valid = false;
    }
    if (password == "") {
      $("#xtreme-password-error").slideDown();
      valid = false;
    }
    if (url == "") {
      $("#xtreme-url-error").slideDown();
      valid = false;
    }

    if (!url.includes("http") && !url.includes("https")) url = "http://" + url;

    if (!valid) return;
    this.is_loading = true;
    showLoader(true);

    window.fetchConfigs().then(function () {
      checkAuth(url).then(
        function (data) {
          if (data.status) {
            var login_url =
              url +
              "/player_api.php?username=" +
              user_name +
              "&password=" +
              password;

            $.ajax({
              method: "get",
              url: login_url,
              success: function (data) {
                that.is_loading = false;
                showLoader(false);
                if (typeof data.user_info != "undefined") {
                  saveData("user_info", data.user_info);
                  if (
                    data.user_info.auth == 0 ||
                    (typeof data.user_info.status != "undefined" &&
                      data.user_info.status === "Expired")
                  ) {
                    showBottomToast("Invalid Username/Password", 2000);
                  } else {
                    var id = Date.now();
                    playlist = {
                      id: id,
                      type: "xtreme",
                      name: playlist_name,
                      url: url,
                      user_name: user_name,
                      password: password,
                    };
                    playlists.push(playlist);
                    localStorage.setItem(
                      storage_id + "playlists",
                      JSON.stringify(playlists),
                    );
                    if (data.user_info.exp_date == null)
                      $(".expire-date").text("Unlimited");
                    else {
                      var exp_date_obj = moment(data.user_info.exp_date * 1000);
                      $(".expire-date").text(exp_date_obj.format("Y-MM-DD"));
                    }
                    saveData("user_info", data.user_info);
                    $("#home-user-name").text(playlist.name);
                    localStorage.setItem(
                      storage_id + "latest_playlist",
                      JSON.stringify(playlist),
                    );
                    $("#xtreme-user-page").addClass("hide");
                    list_user_page.initiated = false;
                    channel_page.initiated = false;
                    MovieHelper.init("live");
                    MovieHelper.init("vod");
                    MovieHelper.init("series");
                    MovieHelper.readVideoTimes();
                    home_page.init();
                  }
                }
              },
              error: function (e) {
                that.is_loading = false;
                showLoader(false);
                showBottomToast("Invalid Username/Password", 2000);
              },
            });
          } else {
            that.is_loading = false;
            showLoader(false);
            showAuthorizationFailedDialog(url);
          }
        },
        function (error) {
          that.is_loading = false;
          showLoader(false);
          // alert(error);
          showAuthorizationFailedDialog(url);
        },
      );
    });
  },

  hoverMenuItemTesting: function (index) {
    this.keys.focused_part = "menu_selection";
    this.keys.menu_selection = index;
    $(this.menu_doms).removeClass("active");
    $(this.menu_doms[index]).addClass("active");
  },

  hoverMenuItem: function (index) {
    this.keys.focused_part = "menu_selection";
    this.keys.menu_selection = index;
    $(this.menu_doms).removeClass("active");
    $(this.menu_doms[index]).addClass("active");
    $(".xtreme-user-page-input").blur();
  },

  handleMenuClick: function (type) {
    var keys = this.keys;

    if (keys.menu_selection == 0) {
      if (type == "k") {
        if ($("#list-users-btn").is(":focus")) {
          $("#list-users-btn").blur();
        } else {
          $("#list-users-btn").focus();
        }
      }
    } else if (keys.menu_selection == 1) {
      if (type == "k") {
        if ($("#xtreme-anyname-field").is(":focus")) {
          $("#xtreme-anyname-field").blur();
        } else {
          $("#xtreme-anyname-field").focus();
        }
      }
    } else if (keys.menu_selection == 2) {
      if (type == "k") {
        if ($("#xtreme-username-field").is(":focus")) {
          $("#xtreme-username-field").blur();
        } else {
          $("#xtreme-username-field").focus();
        }
      }
    } else if (keys.menu_selection == 3) {
      if (type == "k") {
        if ($("#password").is(":focus")) {
          $("#password").blur();
        } else {
          $("#password").focus();
        }
      }
    } else if (keys.menu_selection == 4) {
      if (type == "k") {
        if ($("#eye-input").is(":focus")) {
          $("#eye-input").blur();
        } else {
          $("#eye-input").focus();
        }
      }
    } else if (keys.menu_selection == 5) {
      if (type == "k") {
        if ($("#xtreme-url-input").is(":focus")) {
          $("#xtreme-url-input").blur();
        } else {
          $("#xtreme-url-input").focus();
        }
      }
    } else if (keys.menu_selection == 6) {
      if (type == "k") {
        if ($("#login-btn").is(":focus")) {
          $("#login-btn").blur();
        } else {
          $("#login-btn").focus();
        }
      }
    }
    switch (keys.focused_part) {
      case "menu_selection":
        if (keys.menu_selection > 0) {
          if (keys.menu_selection < 6) {
            if (keys.menu_selection != 4) {
              // if it is not password view
              //                            $(".xtreme-user-page-input").blur();
              //$(".xtreme-user-page-input").blur();
              //                            $(this.menu_doms[keys.menu_selection]).focus();
              //                            alert(keys.menu_selection);
            } else {
              var type = $(this.menu_doms[3]).attr("type");
              var new_type = type === "password" ? "text" : "password";
              var icon = "fa-eye";
              if (new_type != "password") {
                icon = "fa-eye-slash";
              }
              $(this.menu_doms[3]).attr("type", new_type);
              $(this.menu_doms[4]).find("i").removeClass("fa-eye");
              $(this.menu_doms[4]).find("i").removeClass("fa-eye-slash");
              $(this.menu_doms[4]).find("i").addClass(icon);
            }
          }
          if (keys.menu_selection == 6) {
            this.savePlayList();
          }
        } else {
          $("#xtreme-user-page").addClass("hide");
          list_user_page.init(current_route);
        }
        break;
    }
  },
  handleMenuUpDown: function (increment) {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "menu_selection":
        if (keys.menu_selection > 0) {
          keys.menu_selection += increment;
          if (keys.menu_selection < 1) keys.menu_selection = 1;
          if (keys.menu_selection > 6) keys.menu_selection = 6;
          if (increment > 0 && keys.menu_selection == 4)
            keys.menu_selection = 5;
          if (increment < 0 && keys.menu_selection == 4)
            keys.menu_selection = 3;
          this.hoverMenuItem(keys.menu_selection);
        }
        break;
    }
  },
  handleMenuLeftRight: function (increment) {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "menu_selection":
        if (keys.menu_selection == 0 && increment > 0) keys.menu_selection = 1;
        else if (keys.menu_selection > 0) {
          if (keys.menu_selection == 3 && increment > 0)
            keys.menu_selection = 4;
          if (increment < 0) {
            if (keys.menu_selection == 4) keys.menu_selection = 3;
            else keys.menu_selection = 0;
          }
        }
        this.hoverMenuItem(keys.menu_selection);
        break;
    }
  },
  HandleKey: function (e) {
    if (this.is_loading) return;
    switch (e.keyCode) {
      case tvKey.DOWN:
        this.handleMenuUpDown(1);
        break;
      case tvKey.UP:
        this.handleMenuUpDown(-1);
        break;
      case tvKey.LEFT:
        this.handleMenuLeftRight(-1);
        break;
      case tvKey.RIGHT:
        this.handleMenuLeftRight(1);
        break;
      case tvKey.ENTER:
        this.handleMenuClick("k");
        break;
      case tvKey.RETURN:
      case tvKey.RETURN_LG:
      case tvKey.ESC:
        this.goBack();
        break;
    }
  },
};
