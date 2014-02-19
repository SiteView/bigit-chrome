// ====================================================================
//设置设备信息的运营商
var setSimSettings = function(sim) {
    localStorage.setItem('simCountry', sim.country);
    localStorage.setItem('simOperator',  sim.operator);
    localStorage.setItem('simOperatorCode', sim.operatorCode);
};
//设置默认设备运营商信息
var resetSimSettings = function() {
    setSimSettings({
        country: "USA",
        operator: "T-Mobile",
        operatorCode: "31020"
    });
};

//登录错误信息
/**
 * ClientLogin errors, taken from
 * https://developers.google.com/accounts/docs/AuthForInstalledApps
 */
var clientLoginErrors = {
    "BadAuthentication": "Incorrect username or password.",
    "NotVerified": "The account email address has not been verified. You need to access your Google account directly to resolve the issue before logging in here.",
    "TermsNotAgreed": "You have not yet agreed to Google's terms, acccess your Google account directly to resolve the issue before logging in using here.",
    "CaptchaRequired": "A CAPTCHA is required. (not supported, try logging in another tab)",
    "Unknown": "Unknown or unspecified error; the request contained invalid input or was malformed.",
    "AccountDeleted": "The user account has been deleted.",
    "AccountDisabled": "The user account has been disabled.",
    "ServiceDisabled": "Your access to the specified service has been disabled. (The user account may still be valid.)",
    "ServiceUnavailable": "The service is not available; try again later."
};

//保存登录信息
var saveAuth = function(email, token, deviceId) {
    console.log(email+"--"+token+"--"+deviceId);
    localStorage.setItem('authEmail', email);
    localStorage.setItem('authToken',  token);
    localStorage.setItem('deviceId', deviceId.toLowerCase());
};
//清除登录信息
var clearAuth = function() {
    localStorage.removeItem("authEmail");
    localStorage.removeItem("authToken");
    localStorage.removeItem("deviceId");
};

var checkedAuth = function(email, password, deviceId){
    var match = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.exec(email);
    if (!match) {
        alert('ERROR: Please enter valid email!');
        return false;
    }

    if (password.length === 0) {
        alert('ERROR: Please enter a password!');
        return false;
    }

    if (!/^[0-9a-f]{16}$/i.test(deviceId)) {
        alert('ERROR: Android Device ID must be 16 characters long and only contains characters from 0-9, A-F');
        return false;
    }
    return true;
}

//登录帐号
var login = function(email, password, deviceId) {
    if(!checkedAuth(email, password, deviceId)){
        return ;
    }
    var ACCOUNT_TYPE_HOSTED_OR_GOOGLE = "HOSTED_OR_GOOGLE";
    var URL_LOGIN = "https://www.google.com/accounts/ClientLogin";
    var LOGIN_SERVICE = "androidsecure";

    var params = {
        "Email": email,
        "Passwd": password,
        "service": LOGIN_SERVICE,
        "accountType": ACCOUNT_TYPE_HOSTED_OR_GOOGLE
    };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", URL_LOGIN, true);

    var paramsStr = "";
    for (var key in params) {
        paramsStr += "&" + key + "=" + encodeURIComponent(params[key]);//encodeURIComponent Chrome自带的函数
    }

    xhr.onload = function() {
        var AUTH_TOKEN = "";
        var response = this.responseText;

        var error = response.match(/Error=(\w+)/);
        if (error) {
            var msg = clientLoginErrors[error[1]] || error[1];
            alert("ERROR: authentication failed.\n" + msg);
            return;
        }

        var match = response.match(/Auth=([a-z0-9=_\-]+)/i);
        if (match) {
            AUTH_TOKEN = match[1];
        }

        if (!AUTH_TOKEN) {
            // should never happen...
            alert("ERROR: Authentication token not available, cannot login.");
            return;
        }

        saveAuth(email, AUTH_TOKEN, deviceId);
    };

    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(paramsStr);
};



function __init__(){
    login("ec.huyinghuan@gmail.com","0O.O0-00O","32F64DC4664CF48F");
    resetSimSettings();
}

__init__();