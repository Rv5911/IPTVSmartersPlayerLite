"use strict";

var firebaseConfig = {
  apiKey: "AIzaSyDK5uF-816i4_R9UlT0v5_BD12qu3rpF8E",
  authDomain: "smarttvapp-5f8ca.firebaseapp.com",
  projectId: "smarttvapp-5f8ca",
  storageBucket: "smarttvapp-5f8ca.firebasestorage.app",
  messagingSenderId: "430801978001",
  appId: "1:430801978001:web:74d60528a2d1c37dfdb530",
  measurementId: "G-3G73FDKF4B",
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

var db = firebase.firestore();

window.fetchConfigs = function () {
  return db.collection("credentials").get()
    .then(function (snapshot) {
      if (snapshot.empty) {
        console.log("No matching documents in credentials collection.");
        return;
      }
      snapshot.forEach(function (doc) {
        var data = doc.data();
        console.log("Fetched credentials:", data);
        
        if (data.api_base_url) {
          localStorage.setItem("base_Url", data.api_base_url);
        }
        if (data.show_qr !== undefined) {
          localStorage.setItem("show_qr_code", data.show_qr);
        }
        if (data.whmcs_link) {
          localStorage.setItem("whmcs_link", data.whmcs_link);
        }
      });
    })
    .catch(function (error) {
      console.error("Error getting credentials from Firestore: ", error);
    });
};

// Maintain backward compatibility for now if needed, but consolidate to use fetchConfigs
window.fetchApiData = window.fetchConfigs;
window.fetchShowQrCode = window.fetchConfigs;
window.fetchWhmcsLink = window.fetchConfigs;