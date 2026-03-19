"use strict";
var list_user_page = {
  keys: {
    focused_part: "menu_selection",
    menu_selection: 0,
    top_selection: 0,
    delete_user_btn: 0,
    edit_user_selection: 0,
  },
  prev_route: "",
  menu_doms: [],
  top_menu_dom: $("#list-user-top-menu-btn"),
  is_loading: false,
  prev_focus_dom: null,
  initiated: false,
  delete_user_btns: $(".delete-user-btn"),
  edit_user_doms: $(".edit-user-item"),
  init: function (prev_route) {
    this.prev_route = prev_route;
    $("#list-user-page").removeClass("hide");
    if (!this.initiated) {
      if (playlists.length == 0) {
        this.addEmptyPlaylistHtml();
      } else {
        var html = "",
          that = this;
        playlists.map(function (item, index) {
          html += that.makePlaylistItemHtml(item, index);
        });
        $("#list-user-items-container").html(html);
        this.menu_doms = $(".playlist-item-wrapper");
      }
      this.hoverMenuItem(this.menu_doms[0]);
      $("#list-user-items-container").scrollTop(0);
      this.initiated = true;
    }
    current_route = "list-user-page";
  },
  goBack: function () {
    const customDialog = document.getElementById("dns-custom-dialog-container");
    if (customDialog) {
      customDialog.remove();
      return;
    }
    var keys = this.keys;
    switch (keys.focused_part) {
      case "menu_selection":
      case "top_selection":
        $("#list-user-page").addClass("hide");
        if (home_page.initiated) {
          home_page.init();
        } else {
          xtreme_user_page.init(current_route);
        }
        break;
      case "delete_user_btn":
        $("#delete-user-modal").modal("hide");
        this.hoverMenuItem(this.menu_doms[keys.menu_selection]);
        break;
      case "edit_user_selection":
        $("#edit-user-modal").modal("hide");
        this.hoverMenuItem(this.menu_doms[keys.menu_selection]);
        break;
    }
  },
  makePlaylistItemHtml: function (playlist, index) {
    var html =
      '<div class="playlist-item-container">\
                <div class="playlist-item-wrapper"\
                    data-index="' +
      index +
      '"\
                    onmouseenter="list_user_page.hoverMenuItem(this)"\
                    onclick="list_user_page.changePlaylist()"\
                >\
                    <div class="playlist-item-icon-wrapper">\
                    <img class="playlist-item-icon" src="images/switch-user.png">\
                    </div>\
                    <div class="playlist-item-info-container">\
                        <div class="playlist-item-name">' +
      playlist.name +
      '</div>\
                        <div class="playlist-item-detail-info-wrapper">\
                            <span class="playlist-item-detail-label">URL: </span> \
                            <span class="playlist-item-detail-value playlist-item-url">' +
      playlist.url +
      '</span> \
                        </div>\
                        <div class="playlist-item-detail-info-wrapper playlist-item-username">\
                            <span class="playlist-item-detail-label">Username: </span> \
                            <span class="playlist-item-detail-value playlist-item-detail-username">' +
      playlist.user_name +
      "</span> \
                        </div>\
                    </div>\
                </div> \
            </div>";
    return html;
  },
  addEmptyPlaylistHtml: function () {
    var html =
      '<div class="empty-user-add-btn-wrapper"\
                data-index="0"\
                onmouseenter="list_user_page.hoverMenuItem(this)"\
                onclick="list_user_page.goToAddUserPage()" \
            >\
                <div class="empty-user-add-btn-icon">+</div>\
                <div class="empty-user-add-btn-title">ADD NEW USER</div>\
            </div>';
    $("#list-user-items-container").html(html);
    this.menu_doms = $(".empty-user-add-btn-wrapper");
    this.hoverMenuItem(this.menu_doms[0]);
  },
  goToAddUserPage: function () {
    $("#list-user-page").addClass("hide");
    xtreme_user_page.init(current_route);
  },
  changePlaylist: function () {
    var keys = this.keys;
    var playlist_new = playlists[keys.menu_selection];

    //console.log(playlist_new);
    //console.log(playlist);
    try {
      if (playlist_new.id === playlist.id) {
        this.goBack();
      } else {
        //            alert("entered");
        this.loginToPlaylist(false);
      }
    } catch (e) {
      this.loginToPlaylist(false);
    }
  },

  loginToPlaylist: function (is_update) {
    this.is_loading = true;
    showLoader(true);
    var url = "";
    var that = this;

    if (is_update) {
      url = $(this.edit_user_doms[3]).val();
    } else {
      var keys = this.keys;
      var playlist_index = keys.menu_selection;
      var playlist_selected = playlists[playlist_index];
      url = playlist_selected.url;
    }

    window.fetchConfigs().then(function () {
      checkAuth(url).then(
        function (data) {
          if (data.status) that.proceed_login(is_update);
          else {
            that.is_loading = false;
            showLoader(false);
            showAuthorizationFailedDialog(url);
          }
        },
        function (error) {
          that.is_loading = false;
          showLoader(false);
          showAuthorizationFailedDialog(url);
        },
      );
    });
  },
  proceed_login: function (is_update) {
    var keys = this.keys;
    var playlist_index = keys.menu_selection;
    var user_name, password, url, playlist_name;
    var playlist_selected = playlists[playlist_index];
    if (!is_update) {
      user_name = playlist_selected.user_name;
      password = playlist_selected.password;
      url = playlist_selected.url;
    } else {
      playlist_name = $(this.edit_user_doms[0]).val();
      user_name = $(this.edit_user_doms[1]).val();
      password = $(this.edit_user_doms[2]).val();
      url = $(this.edit_user_doms[3]).val();
      if (!url.includes("http") && !url.includes("https"))
        url = "http://" + url;
    }

    var that = this;
    var login_url =
      url + "/player_api.php?username=" + user_name + "&password=" + password;
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
            showBottomToast("Sorry, user information is not correct", 2000);
          } else {
            $("#edit-user-modal").modal("hide");
            keys.focused_part = "menu_selection";
            if (is_update) {
              $(that.menu_doms[keys.menu_selection])
                .find(".playlist-item-name")
                .text(playlist_name);
              $(that.menu_doms[keys.menu_selection])
                .find(".playlist-item-url")
                .text(url);
              //                            var username_html = '<span class="playlist-item-detail-label">Username: </span><span class="playlist-item-detail-value">'+playlist.user_name+'</span>z
              $(that.menu_doms[keys.menu_selection])
                .find(".playlist-item-detail-username")
                .text(user_name);
              playlist_selected.name = playlist_name;
              playlist_selected.url = url;
              playlist_selected.user_name = user_name;
              playlist_selected.password = password;
              playlist = playlist_selected;
              playlists[playlist_index] = playlist;
              localStorage.setItem(
                storage_id + "playlists",
                JSON.stringify(playlists),
              );
            } else {
              playlist = playlist_selected;
              localStorage.setItem(
                storage_id + "latest_playlist",
                JSON.stringify(playlist),
              );
            }
            localStorage.setItem(
              storage_id + "latest_playlist",
              JSON.stringify(playlist),
            );
            if (data.user_info.exp_date == null)
              $(".expire-date").text("Unlimited");
            else {
              var exp_date_obj = moment(data.user_info.exp_date * 1000);
              $(".expire-date").text(exp_date_obj.format("Y-MM-DD"));
            }
            saveData("user_info", data.user_info);
            $("#home-user-name").text(playlist.name);
            $("#list-user-page").addClass("hide");
            channel_page.initiated = false;
            MovieHelper.init("live");
            MovieHelper.init("vod");
            MovieHelper.init("series");
            MovieHelper.readVideoTimes();
            home_page.init();
          }
        }
      },
      error: function () {
        that.is_loading = false;
        showLoader(false);
        showBottomToast("Sorry, user information is not correct", 2000);
      },
      timeout: 2500,
    });
  },
  showDeleteUserModal: function () {
    var keys = this.keys;
    if (playlists.length > 0 && keys.focused_part === "menu_selection") {
      $("#delete-user-modal").modal("show");
      this.hoverDeleteUserBtn(0);
    }
  },
  deletePlaylist: function () {
    $("#delete-user-modal").modal("hide");
    var keys = this.keys;
    var playlist_index = keys.menu_selection;
    var playlist_deleted = playlists[playlist_index];

    //console.log(playlist_deleted);
    //        console.log(localStorage);
    //console.log(playlist.id);

    try {
      if (playlist_deleted.id === playlist.id) {
        home_page.initiated = false;
        localStorage.removeItem(storage_id + "latest_playlist");
        playlist = null;
      }
    } catch (e) {}

    playlists.splice(playlist_index, 1);
    $(this.menu_doms[keys.menu_selection])
      .closest(".playlist-item-container")
      .remove();

    localStorage.setItem(storage_id + "playlists", JSON.stringify(playlists));

    //console.log(playlists);
    //console.log(JSON.stringify(playlists));

    if (playlists.length > 0) {
      this.menu_doms = $(".playlist-item-wrapper");
      for (var i = 0; i < this.menu_doms.length; i++) {
        $(this.menu_doms[i]).data("index", i);
      }
      if (keys.menu_selection >= this.menu_doms.length)
        keys.menu_selection = this.menu_doms.length - 1;
      this.hoverMenuItem(this.menu_doms[keys.menu_selection]);
    } else {
      this.addEmptyPlaylistHtml();
    }
  },
  showEditUserModal: function () {
    var keys = this.keys;
    if (playlists.length > 0 && keys.focused_part === "menu_selection") {
      var playlist_edited = playlists[keys.menu_selection];
      $(this.edit_user_doms[0]).val(playlist_edited.name);
      $(this.edit_user_doms[1]).val(playlist_edited.user_name);
      $(this.edit_user_doms[2]).val(playlist_edited.password);
      $(this.edit_user_doms[3]).val(playlist_edited.url);
      $("#edit-user-modal").modal("show");
      this.hoverEditUserItem(0);
    }
  },
  savePlaylist: function () {
    var name = $(this.edit_user_doms[0]).val();
    var user_name = $(this.edit_user_doms[1]).val();
    var password = $(this.edit_user_doms[2]).val();
    var url = $(this.edit_user_doms[3]).val();
    if (name === "") {
      showBottomToast("Please enter playlist name", 2000);
      return;
    }
    if (user_name === "") {
      showBottomToast("Please enter user name", 2000);
      return;
    }
    if (password === "") {
      showBottomToast("Please enter password", 2000);
      return;
    }
    if (url === "") {
      showBottomToast("Please enter url", 2000);
      return;
    }
    this.loginToPlaylist(true);
  },
  hoverMenuItem: function (targetElement) {
    var index = $(targetElement).data("index");
    var keys = this.keys;
    keys.focused_part = "menu_selection";
    keys.menu_selection = index;
    $(this.prev_focus_dom).removeClass("active");
    $(this.menu_doms[index]).addClass("active");
    this.prev_focus_dom = this.menu_doms[index];
    if (playlists.length > 0) {
      // if playlists exists
      moveScrollPosition(
        $("#list-user-items-container"),
        targetElement,
        "vertical",
        false,
      );
    }
  },
  hoverTopIcon: function () {
    $(this.prev_focus_dom).removeClass("active");
    this.keys.focused_part = "top_selection";
    $(this.top_menu_dom).addClass("active");
    this.prev_focus_dom = this.top_menu_dom;
  },
  hoverDeleteUserBtn: function (index) {
    $(this.delete_user_btns).removeClass("active");
    var keys = this.keys;
    keys.focused_part = "delete_user_btn";
    keys.delete_user_btn = index;
    $(this.delete_user_btns[index]).addClass("active");
  },
  hoverEditUserItemMouse: function (index) {
    $(this.edit_user_doms).removeClass("active");
    this.keys.edit_user_selection = index;
    this.keys.focused_part = "edit_user_selection";
    $(this.edit_user_doms[index]).addClass("active");
    //        if(clicked && index<4)
    //            $(this.edit_user_doms[index]).focus();
  },
  hoverEditUserItem: function (index) {
    $(this.edit_user_doms).removeClass("active");
    this.keys.edit_user_selection = index;
    this.keys.focused_part = "edit_user_selection";
    $(this.edit_user_doms[index]).addClass("active");
    //alert("asdfasd");
    $(".edit-user-item").blur();

    //        if(clicked && index<4)
    //            $(this.edit_user_doms[index]).focus();
  },
  handleMenuClick: function (type) {
    var keys = this.keys;

    //    alert(keys.focused_part);
    //    console.log(keys.menu_selection);
    //    console.log(keys.edit_user_selection);
    switch (keys.focused_part) {
      case "menu_selection":
        $(this.menu_doms[keys.menu_selection]).trigger("click");
        break;
      case "top_selection":
        $(this.top_menu_dom).trigger("click");
        break;
      case "delete_user_btn":
        $(this.delete_user_btns[keys.delete_user_btn]).trigger("click");
        break;
      case "edit_user_selection":
        if (keys.edit_user_selection == 0) {
          if (type == "k") {
            if ($("#edit-playlist-name").is(":focus")) {
              $("#edit-playlist-name").blur();
            } else {
              $("#edit-playlist-name").focus();
            }
          }
        } else if (keys.edit_user_selection == 1) {
          if (type == "k") {
            if ($("#edit-playlist-user-name").is(":focus")) {
              $("#edit-playlist-user-name").blur();
            } else {
              $("#edit-playlist-user-name").focus();
            }
          }
        } else if (keys.edit_user_selection == 2) {
          if (type == "k") {
            if ($("#edit-playlist-password").is(":focus")) {
              $("#edit-playlist-password").blur();
            } else {
              $("#edit-playlist-password").focus();
            }
          }
        } else if (keys.edit_user_selection == 3) {
          if (type == "k") {
            if ($("#edit-playlist-url").is(":focus")) {
              $("#edit-playlist-url").blur();
            } else {
              $("#edit-playlist-url").focus();
            }
          }
        } else if (keys.edit_user_selection == 4) {
          if (type == "k") {
            this.savePlaylist();
          }
        } else if (keys.edit_user_selection == 5) {
          if (type == "k") {
            this.goBack();
          }
        }

        //                $(this.edit_user_doms[keys.edit_user_selection]).trigger('click');
        break;
    }
  },
  handleMenuUpDown: function (increment) {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "menu_selection":
        var prev_menu_selection = keys.menu_selection;
        keys.menu_selection += 2 * increment;
        if (keys.menu_selection < 0) {
          keys.menu_selection = prev_menu_selection;
          this.hoverTopIcon();
          return;
        }
        if (keys.menu_selection >= this.menu_doms.length)
          keys.menu_selection = this.menu_doms.length - 1;
        this.hoverMenuItem(this.menu_doms[keys.menu_selection]);
        break;
      case "top_selection":
        if (increment > 0) {
          if (keys.menu_selection >= this.menu_doms.length)
            keys.menu_selection = this.menu_doms.length - 1;
          this.hoverMenuItem(this.menu_doms[keys.menu_selection]);
        }
        break;
      case "edit_user_selection":
        if (keys.edit_user_selection > 3) {
          if (increment > 0) return;
          keys.edit_user_selection = 3;
        } else keys.edit_user_selection += increment;
        if (keys.edit_user_selection < 0) keys.edit_user_selection = 0;
        //                this.hoverEditUserItem(keys.edit_user_selection,true);
        this.hoverEditUserItem(keys.edit_user_selection);
        break;
    }
  },
  handleMenuLeftRight: function (increment) {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "menu_selection":
        keys.menu_selection += increment;
        if (keys.menu_selection < 0) keys.menu_selection = 0;
        if (keys.menu_selection >= this.menu_doms.length)
          keys.menu_selection = this.menu_doms.length - 1;
        this.hoverMenuItem(this.menu_doms[keys.menu_selection]);
        break;
      case "delete_user_btn":
        keys.delete_user_btn += increment;
        if (keys.delete_user_btn < 0) keys.delete_user_btn = 0;
        if (keys.delete_user_btn > 1) keys.delete_user_btn = 1;
        this.hoverDeleteUserBtn(keys.delete_user_btn);
        break;
      case "edit_user_selection":
        if (keys.edit_user_selection < 4) return;
        keys.edit_user_selection += increment;
        if (keys.edit_user_selection < 4) keys.edit_user_selection = 4;
        if (keys.edit_user_selection >= this.edit_user_doms.length)
          keys.edit_user_selection = this.edit_user_doms.length - 1;
        //                this.hoverEditUserItem(keys.edit_user_selection,false);
        this.hoverEditUserItem(keys.edit_user_selection);
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
      case tvKey.YELLOW:
      case tvKey.D:
        this.showDeleteUserModal();
        break;
      case tvKey.GREEN:
      case tvKey.E:
        this.showEditUserModal();
        break;
      case tvKey.RETURN:
      case tvKey.RETURN_LG:
      case tvKey.ESC:
        this.goBack();
        break;
    }
  },
};
