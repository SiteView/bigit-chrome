var _MANAGEPHONE_ = "ManagePhone.html";
var _LAN_ = "LAN.html";
var _PERSONALCLOUD_ = "PersonalCloud.html";
var _GOOGLEPLAY_ = "https://play.google.com/";

function openPage(url){
    window.location.href = url;
}

//打开手机管理
function openManagePhone() {
    openPage(_MANAGEPHONE_);
}
//打开Google Play
function openGooglePlay(){
    chrome.tabs.query({windowType:"normal",url:(_GOOGLEPLAY_+"*")}, function(tabs){
        // check if page is open already
        if(tabs.length){
            var tab = tabs[0];
            chrome.tabs.update(tab.id, { highlighted:true }); // select the tab
        }else{
        // open a new tab next to currently selected tab
            chrome.tabs.getSelected(null, function (tab) { // open a new tab next to currently selected tab
                chrome.tabs.create({
                    url:_GOOGLEPLAY_,
                    index:tab.index + 1
                });
            });
        }
    });
}

//打开LAN
function openLAN(){
    openPage(_LAN_);
}

//打开私有云
function openPersonalCloud(){
    openPage(_PERSONALCLOUD_);
}

function ready(){
    document.getElementById("managePhone").addEventListener('click',openManagePhone);
    document.getElementById("gotoGooglePlay").addEventListener('click',openGooglePlay);
    document.getElementById("LAN").addEventListener('click',openLAN);
    document.getElementById("personalCloud").addEventListener('click',openPersonalCloud);
}

document.addEventListener('DOMContentLoaded',ready);