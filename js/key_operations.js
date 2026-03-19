"use strict";

function confirmParentPassword() {
  switch (current_route) {
    case "home-page":
      home_page.confirmParentPassword();
      break;
  }
}

function cancelParentPassword() {
  switch (current_route) {
    case "home-page":
      home_page.cancelParentPassword();
      break;
  }
}

//document.addEventListener("click", testingfunction);
// function testingfunction() {
//  alert("Asdfas");
// }

//$('.xtreme-user-page-input').keypress(function (e) {
// var key = e.which;
//// alert(13);
// showBottomToast(e.keyCode,3000);

// if(key == 13)  // the enter key code
//  {
//    $('input[name = butAssignProd]').click();
//    return false;
//  }
//});

//$(document).on('focus', 'input[id=xtreme-anyname-field]', function(e){
////   console.log("any name");
//    showBottomToast("any name",3000);
//
//});
//
//
//$(document).on('focus', 'input[id=xtreme-username-field]', function(e){
////   console.log("username");
// showBottomToast("username",3000);
//
//});

document.addEventListener("keydown", function (e) {
  if (document.getElementById("dns-custom-dialog-container")) {
    if (
      e.keyCode === tvKey.RETURN ||
      e.keyCode === tvKey.RETURN_LG ||
      e.keyCode === tvKey.ESC
    ) {
      // Allow back/return keys to proceed so they can be handled or we handle them here
      var dialog = document.getElementById("dns-custom-dialog-container");
      if (dialog) {
        dialog.remove();
      }
    }
    return;
  }
  //$(document).on('keydown', function(e){

  // showBottomToast(e.keyCode,3000);
  switch (e.keyCode) {
    case 65376: // Done
    case 65385: // Cancel
      $("input").blur();
      break;
  }
  if (app_loading) return;
  if (e.keyCode == tvKey.EXIT) {
    if (current_route === "vod-series-player-video") {
      try {
        vod_series_player_page.saveVideoTime();
      } catch (e) {}
    }
    tizen.application.getCurrentApplication().exit();
  }
  switch (current_route) {
    case "login":
      login_page.HandleKey(e);
      break;
    case "home-page":
      home_page.HandleKey(e);
      break;
    case "stream-category-page":
      stream_category_page.HandleKey(e);
      break;
    case "channel-page":
      channel_page.HandleKey(e);
      break;
    case "vod-series-page":
      vod_series_page.HandleKey(e);
      break;
    case "catch-up":
      catchup_page.HandleKey(e);
      break;
    case "catch-up-detail":
      epg_page.HandleKey(e);
      break;
    case "epg-player-page":
      epg_player_page.HandleKey(e);
      break;
    case "vod-summary-page":
      vod_summary_page.HandleKey(e);
      break;
    case "vod-series-player-video":
      vod_series_player_page.HandleKey(e);
      break;
    case "trailer-page":
      trailer_page.HandleKey(e);
      break;
    case "seasons-page":
      seasons_page.HandleKey(e);
      break;
    case "episode-page":
      episode_page.HandleKey(e);
      break;
    case "vod-series-summary-page":
      vod_series_summary_page.HandleKey(e);
      break;
    case "guide-page":
      guide_page.HandleKey(e);
      break;
    case "video-settings-page":
      video_settings_page.HandleKey(e);
      break;
    case "video-info-page":
      video_info_page.HandleKey(e);
      break;
    case "channel-player-page":
      channel_player_page.HandleKey(e);
      break;
    case "setting-page":
      setting_page.HandleKey(e);
      break;
    case "user-account-page":
      user_account_page.HandleKey(e);
      break;
    case "logout-page":
      logout_page.HandleKey(e);
      break;
    case "xtreme-user-page":
      xtreme_user_page.HandleKey(e);
      break;
    case "sort-page":
      sort_page.HandleKey(e);
      break;
    case "common-menu-page":
      common_menu_page.HandleKey(e);
      break;
    case "refresh-confirm-page":
      refresh_confirm_page.HandleKey(e);
      break;
    case "list-user-page":
      list_user_page.HandleKey(e);
      break;
    case "turn-off-page":
      turn_off_page.HandleKey(e);
      break;
    case "parent-confirm-page":
      parent_confirm_page.HandleKey(e);
      break;
    case "clear_cache_page":
      clear_cache_page.HandleKey(e);
      break;
  }
});
