"use strict";

var init = function() {
    try {
        //        storage_id=tizen.application.getCurrentApplication().appInfo.packageId+'_';
        //        alert(storage_id);
        storage_id = "com.nst.iptvsmarters_";
    } catch (e) {
        console.log(e);
    }
    var temps = localStorage.getItem(storage_id + "playlists");
    //    console.log(localStorage);

    if (temps) playlists = JSON.parse(temps);
    $(document).ready(function() {
        //     console.log(localStorage.getItem(storage_id+'latest_playlist'));
        login_page.getPlayListDetail();
        var saved_parent_password = localStorage.getItem(
            storage_id + "parent_account_password",
        );
        //        console.log(saved_parent_password);
        parent_account_password =
            saved_parent_password != null ?
            saved_parent_password :
            parent_account_password;
        settings.initFromLocal();
        setSubtitleFontSize();
        updateTimeStr();

        //getting the version from config.xml file
        fetch("config.xml?v=" + new Date().getTime())
            .then(function(response) {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.text();
            })
            .then(function(xmlText) {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(xmlText, "text/xml");
                // Using documentElement as a fallback if getElementsByTagName fails due to namespaces
                var widget =
                    xmlDoc.getElementsByTagName("widget")[0] || xmlDoc.documentElement;
                var version = widget ? widget.getAttribute("version") : null;

                if (version) {
                    localStorage.setItem("appVersion", version);
                    // Update DOM immediately if element exists to avoid waiting for next reload
                    var versionElement = document.getElementById("app-version");
                    if (versionElement) {
                        versionElement.innerHTML = "v" + version;
                    }
                }
            })
            .catch(function(err) {
                console.error("Failed to read config.xml", err);
            });
        setInterval(function() {
            updateTimeStr();
        }, 60000);
    });
    document.addEventListener("visibilitychange", function() {
        if (document.hidden) {
            //            webapis.avplay.suspend();
        } else {
            //            webapis.avplay.restore();
        }
    });
};
window.onload = init;