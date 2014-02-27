var _MANAGEPHONE_ = "ManagePhone.html";
var _LAN_ = "LAN.html";
var _PERSONALCLOUD_ = "PersonalCloud.html";
var _GOOGLEPLAY_ = "https://play.google.com/";
var _BIGIT_ = "index.html";
function openPage(url,isExtensionUrl){
    if(typeof isExtensionUrl === "undefined"){
        isExtensionUrl = true;
    }
    var fullUrl = "";
    if(isExtensionUrl){
        fullUrl = chrome.extension.getURL(url);
    }else{
        fullUrl = url; 
    }

    chrome.tabs.query({windowType:"normal",url:(fullUrl+"*")}, function(tabs){
        // check if page is open already
        if(tabs.length){
            var tab = tabs[0];
            chrome.tabs.update(tab.id, { highlighted:true },closePopup); // select the tab
        }else{
        // open a new tab next to currently selected tab
            chrome.tabs.getSelected(null, function (tab) { // open a new tab next to currently selected tab
                chrome.tabs.create({
                    url:url,
                    index:tab.index + 1
                },closePopup);
            });
        }
    })
}

function openBIGIT() {
    openPage(_BIGIT_);
}

//打开手机管理
function openManagePhone() {
    openPage(_MANAGEPHONE_);
}
//打开Google Play
function openGooglePlay(){
    openPage(_GOOGLEPLAY_,false);
}

//打开LAN
function openLAN(){
    openPage(_LAN_);
}

//打开私有云
function openPersonalCloud(){
    openPage(_PERSONALCLOUD_);
}

//关闭弹出popup窗口
function closePopup() {
  window.close();
}

function ready(){
    document.getElementById("gotoBIGIT").addEventListener('click',openBIGIT);
    document.getElementById("managePhone").addEventListener('click',openManagePhone);
    document.getElementById("gotoGooglePlay").addEventListener('click',openGooglePlay);
    document.getElementById("LAN").addEventListener('click',openLAN);
    document.getElementById("personalCloud").addEventListener('click',openPersonalCloud);
}

document.addEventListener('DOMContentLoaded',ready);