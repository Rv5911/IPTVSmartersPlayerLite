"use strict";

var firebaseConfig = {
  apiKey: "AIzaSyBqIZephdZVBx0265buqykch8dU5rFnJRs",
  authDomain: "iptv-smarterpro-samsung.firebaseapp.com",
  projectId: "iptv-smarterpro-samsung",
  storageBucket: "iptv-smarterpro-samsung.firebasestorage.app",
  messagingSenderId: "690473249153",
  appId: "1:690473249153:web:1979e9b204564120b76080",
  measurementId: "G-745FXSZP0H",
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

var remoteConfig = firebase.remoteConfig();
remoteConfig.settings.minimumFetchIntervalMillis = 15000;

window.fetchConfigs = function () {
  return remoteConfig
    .fetchAndActivate() 
    .then(function () {
      var baseUrl = remoteConfig.getValue("Base_Url").asString();
      var showQr = remoteConfig.getValue("show_qr").asBoolean();
      var whmcsLink = remoteConfig.getValue("whmcs_link").asString();
      var qrLinkUrl = remoteConfig.getValue("qr_link").asString();


      // console.log("Fetched credentials from Remote Config:", {
      //   Base_Url: baseUrl,
      //   show_qr: showQr,
      //   whmcs_link: whmcsLink,
      //   qr_link: qrLinkUrl
      // });

      if (baseUrl) {
        localStorage.setItem("base_Url", baseUrl);
        window.Base_Url = baseUrl;
      }
      if (showQr !== undefined) {
        localStorage.setItem("show_qr_code", showQr);
        window.show_qr_code = showQr;
      }
      if (whmcsLink) {
        localStorage.setItem("whmcs_link", whmcsLink);
        window.whmcs_link = whmcsLink;
      }
            if (qrLinkUrl) {
        localStorage.setItem("qr_link", qrLinkUrl);
        window.qrLinkUrl = qrLinkUrl;
      }


      return {
        base_Url: baseUrl,
        show_qr_code: showQr,
        whmcs_link: whmcsLink,
        qr_link: qrLinkUrl
      };
    })
    .catch(function (error) {
      console.error("Error fetching from Remote Config: ", error);
    });
};

window.fetchApiData = window.fetchConfigs;
window.fetchShowQrCode = window.fetchConfigs;
window.fetchWhmcsLink = window.fetchConfigs;
