/*
function downloadApp(url,appName){
    chrome.downloads.download({
        url:url,
        filename:appName
    }, function(downloadId){
          console.log("download item's id is " + downloadId);
    })
}*/

function testDownloadApp(appid){
     MarketSession.download(appid);
}

var API_URL = "https://android.clients.google.com/market/api/ApiRequest";
var FDFE_URL_BASE = "https://android.clients.google.com/fdfe/";

function showLastError() {
    console.log("chrome.extension.lastError", chrome.extension.lastError);
}

/**
 * Functions for cookie management.
 */
function setCookie(storeId, cookie, callback) {
    cookie.httpOnly = true;
    cookie.storeId = storeId;
    chrome.cookies.set(cookie, function (data) {
        if (data === null) {
            showLastError();
        } else if (typeof callback == "function") {
            callback();
        }
    });
}
function setMDACookie(storeId, marketda, callback) {
    setCookie(storeId, {
        name: "MarketDA",
        value: marketda,
        url: "http://android.clients.google.com/market/",
        domain: "android.clients.google.com", /* set for subdomains too */
        path: "/market/"
    }, callback);
}
function setAPICookie(storeId, authToken, callback) {
    setCookie(storeId, {
        url: API_URL,
        name: "ANDROIDSECURE",
        value: authToken,
    }, callback);
}
function removeAPICookie(storeId, callback) {
    chrome.cookies.remove({
        name: "ANDROIDSECURE",
        url: API_URL,
        storeId: storeId
    }, function(data) {
        if (data === null) {
            showLastError();
        } else if (typeof callback == "function") {
            callback();
        }
    });
}

/**
 * Debugging utility: convert a (binary) string to a hexadecimal format.
 */
function strToHex(str) {
    return str.split("").map(function (c) {
        return ("0" + c.charCodeAt(0).toString(16)).substr(-2);
    }).join("");
}

/**
 * Try to retrieve download URL for a given base64-encoded query.
 */
function processAsset(asset_query_base64, packageName) {
    _real_processAsset(asset_query_base64, packageName, "0");
}
function _real_processAsset(asset_query_base64, packageName, storeId) {
    var payload = "version=2&request=" + asset_query_base64;
    var xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.open("POST", API_URL);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onload = function() {
        removeAPICookie(storeId, function() {
            if (xhr.status == 403) {
                hasValidSession(function(isValid) {
                    if (isValid) {
                        alert("Cannot download app, maybe it is a paid one or something?");
                    } else {
                        alert("Session expired, please re-login");
                        openTab("options.html");
                    }
                });
                return;
            }
            if (xhr.status != 200) {
                alert("ERROR: Cannot download this app!\n" + xhr.status + " " +
                    xhr.statusText);
                return;
            }

            var chars = new Uint8Array(xhr.response);
            /* gzipped content, try to unpack */
            var data = (new JXG.Util.Unzip(chars)).unzip()[0][0];

            console.log("Response: " + data);
            console.log("Response (hex): " + strToHex(data));

            var url, marketda;
            if ((url = /https?:\/\/[^:]+/i.exec(data))) {
                /* not sure if decoding is even necessary */
                url = decodeURIComponent(url[0]);
                /* format: "MarketDA", 0x72 ('r'), length of data, data */
                if ((marketda = /MarketDA..(\d+)/.exec(data))) {
                    marketda = marketda[1];
                    var filename = packageName + ".apk";
                    downloadAPK(marketda, url, filename, storeId);
                    return;
                }
            }

            alert("ERROR: Cannot download this app!");
        });
    };
    xhr.onerror = removeAPICookie.bind(null, storeId);
    setAPICookie(storeId, localStorage.getItem("authToken"), function () {
        xhr.send(payload);
    });
}

/**
 * Tries to download an APK file given its URL and cookie.
 */
function downloadAPK(marketda, url, filename, storeId) {
    console.log("marketda: "+marketda+"\ndownload url: "+url+"\nfilename: "+filename);
        chrome.downloads.download({
                url:url,
                filename:filename
         }, function(downloadId){
              console.log("download item's id is " + downloadId);
        })
    if (!filename) filename = "todo-pick-a-name.apk";
    
    setMDACookie(storeId, marketda, function() {
       // console.log("Trying to download " + url + " and save it as " + filename);
        /*
        chrome.tabs.sendMessage(tabId, {
            action: "download",
            url: url,
            filename: filename
        });
        */
    });

    
}

/**
 * Determine whether a valid session is available. If the callback is called
 * with "false" as first argument, then it is 100% sure that the session is
 * invalid.
 */
function hasValidSession(callback) {
    var authToken = localStorage.getItem("authToken");
    if (authToken == null) {
        callback(false);
        return;
    }

    // TODO: restore functionality, currently (2014-02-10), the FDFE URL always
    // returns 401. For now assume that a token is always valid.
    if (1) {
        callback(true);
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", FDFE_URL_BASE + "delivery");
    /* GoogleLogin auth=... is required, otherwise you get a 302 which is
     * uncatchable */
    xhr.setRequestHeader("Authorization", "GoogleLogin auth=" + authToken);
    xhr.onload = function () {
        console.log("xhr status " + xhr.status);
        if (xhr.status == 401) {
            /* 401 Unauthorized: invalid login token */
            localStorage.removeItem("authToken");
            callback(false);
        } else {
            /* assume valid session for other status codes (400, ???) */
            callback(true);
        }
    };
    xhr.onerror = function () {
        console.log("Unable to test session for validity, assuming valid one");
        callback(true);
    };
    xhr.send(null);
}


/*
chrome.pageAction.onClicked.addListener(function (tab) {
    var match = /play\.google\.com\/store\/apps\/details\?(?:|.*&)id=([\w\d\.\_]+)/i.exec(tab.url);
    if (match) {
        MarketSession.download(match[1], tab.id);
    }
});
*/


/**
 * Serialize Javascript types in a special format used by MarketSession.
 */
var Utils = {
    stringToByteArray: function(str) {
        var b = [];
        for (var pos = 0; pos < str.length; ++pos) {
            b.push(str.charCodeAt(pos));
        }
        return b;
    },
    serializeInt32: function(num) {
        var data = [];
        for (var times = 0; times < 5; times++) {
            var elm = num % 128;
            if ((num >>>= 7)) {
                elm += 128;
            }
            data.push(elm);
            if (num == 0) {
                break;
            }
        }
        return data;
    },
    serializeData: function(arr, value, data_type) {
        var new_data = [];
        switch (data_type) {
            case "string":
                new_data = new_data.concat(this.serializeInt32(value.length));
                new_data = new_data.concat(this.stringToByteArray(value));
                break;
            case "int32":
                new_data = new_data.concat(this.serializeInt32(value));
                break;
            case "bool":
                new_data.push(value ? 1 : 0);
                break;
        }
        return arr.concat(new_data);
    }
};

/* Starts an APK download attempt */
var MarketSession = {
    /**
     * Called when pressing the APK Downloader icon in the location bar.
     */
    download: function(packageName) {
        if (!localStorage.getItem("authToken")) {
            alert("Please login at the Options page");
        } else if (!localStorage.getItem("simCountry") || !localStorage.getItem("simOperator") || !localStorage.getItem("simOperatorCode")) {
            alert("Please set Sim Operator in the Options page first");
        } else {
            var options = {};
            options.authToken = localStorage.authToken;
            options.isSecure = true;
            options.sdkVersion = 2009011;
            options.deviceId = localStorage.deviceId;
            options.deviceAndSdkVersion = "passion:15";
            options.locale = "en";
            options.country = "us";
            options.operatorAlpha = localStorage.simOperator;
            options.simOperatorAlpha = localStorage.simOperator;
            options.operatorNumeric = localStorage.simOperatorCode;
            options.simOperatorNumeric = localStorage.simOperatorCode;
            options.packageName = packageName;
            var asset_query_base64 = this.generateAssetRequest(options);
            processAsset(asset_query_base64, packageName);
        }
    },
    /**
     * @returns base64 encoded binary data that can be passed to Google Play API.
     */
    generateAssetRequest: function(options, tabUrl) {
        /* some constants to avoid magic numbers */
        var FIELD_AUTHTOKEN = 0;
        var FIELD_ISSECURE = 2;
        var FIELD_SDKVERSION = 4;
        var FIELD_DEVICEID = 6;
        var FIELD_DEVICEANDSDKVERSION = 8;
        var FIELD_LOCALE = 10;
        var FIELD_COUNTRY = 12;
        var FIELD_OPERATORALPHA = 14;
        var FIELD_SIMOPERATORALPHA = 16;
        var FIELD_OPERATORNUMERIC = 18;
        var FIELD_SIMOPERATORNUMERIC = 20;
        var FIELD_PACKAGENAME_LENGTH = 22;
        var FIELD_PACKAGENAME = 24;
        /* describes format of request, numbers will be filled in, arrays of
         * numbers will be appended as-is */
        var desc = [FIELD_AUTHTOKEN, [16], FIELD_ISSECURE, [24],
        FIELD_SDKVERSION, [34], FIELD_DEVICEID, [42],
        FIELD_DEVICEANDSDKVERSION, [50], FIELD_LOCALE, [58],
        FIELD_COUNTRY, [66], FIELD_OPERATORALPHA, [74],
        FIELD_SIMOPERATORALPHA, [82], FIELD_OPERATORNUMERIC, [90],
        FIELD_SIMOPERATORNUMERIC, [19, 82],
        FIELD_PACKAGENAME_LENGTH, [10], FIELD_PACKAGENAME, [20]];
        var out = [];
        var simOperatorLength = 0;
        for (var i = 0; i<desc.length; i++) {
            if ("object" == typeof desc[i]) {
                /* array, just append it as raw numbers to the output */
                out = out.concat(desc[i]);
                continue;
            }
            switch (desc[i]) {
                case FIELD_AUTHTOKEN:
                    out = Utils.serializeData(out, options.authToken, "string");
                    break;
                case FIELD_ISSECURE:
                    out = Utils.serializeData(out, options.isSecure, "bool");
                    break;
                case FIELD_SDKVERSION:
                    out = Utils.serializeData(out, options.sdkVersion, "int32");
                    break;
                case FIELD_DEVICEID:
                    out = Utils.serializeData(out, options.deviceId, "string");
                    break;
                case FIELD_DEVICEANDSDKVERSION:
                    out = Utils.serializeData(out, options.deviceAndSdkVersion, "string");
                    break;
                case FIELD_LOCALE:
                    out = Utils.serializeData(out, options.locale, "string");
                    break;
                case FIELD_COUNTRY:
                    out = Utils.serializeData(out, options.country, "string");
                    break;
                case FIELD_OPERATORALPHA:
                    out = Utils.serializeData(out, options.operatorAlpha, "string");
                    break;
                case FIELD_SIMOPERATORALPHA:
                    out = Utils.serializeData(out, options.simOperatorAlpha, "string");
                    break;
                case FIELD_OPERATORNUMERIC:
                    out = Utils.serializeData(out, options.operatorNumeric, "string");
                    break;
                case FIELD_SIMOPERATORNUMERIC:
                    out = Utils.serializeData(out, options.simOperatorNumeric, "string");
                    simOperatorLength = out.length + 1;
                    break;
                case FIELD_PACKAGENAME_LENGTH:
                    out = out.concat(Utils.serializeInt32(options.packageName.length + 2));
                    break;
                case FIELD_PACKAGENAME:
                    out = Utils.serializeData(out, options.packageName, "string");
                    break;
            }
        }
        out = [10].concat(Utils.serializeInt32(simOperatorLength)).concat([10]).concat(out);
        var binary = out.map(function (c) {
            return String.fromCharCode(c);
        }).join("");
        return btoa(binary);
    }
};