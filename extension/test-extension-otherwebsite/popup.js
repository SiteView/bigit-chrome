//var extension = chrome.extension.getBackgroundPage();

function abc(){
    var plugin = document.getElementById("pluginId");
    var result = plugin.mytest("This plugin seems to be working!");  // call a method in your plugin
    console.log("my plugin returned: " + result);
}
/*
function openOptions() {
    //closePopup();
   var extension = chrome.extension.getBackgroundPage();//.openOptions();
   for(x in extension){
    console.log(x);
   }
}
*/
function openOptions(firstTime) {
    var url = "options.html";
    if (firstTime)
        url += "?firstTime=true";

    var fullUrl = chrome.extension.getURL(url);
    chrome.tabs.getAllInWindow(null, function (tabs) {
        for (var i in tabs) { // check if Options page is open already
            if (tabs.hasOwnProperty(i)) {
                var tab = tabs[i];
                if (tab.url == fullUrl) {
                    chrome.tabs.update(tab.id, { selected:true }); // select the tab
                    return;
                }
            }
        }
        chrome.tabs.getSelected(null, function (tab) { // open a new tab next to currently selected tab
            chrome.tabs.create({
                url:url,
                index:tab.index + 1
            });
        });
    });
}
function closePopup() {
    window.close();
}
function ready(){
  document.getElementById("test").addEventListener('click',abc);
  document.getElementById("options").addEventListener('click',openOptions);
}
document.addEventListener('DOMContentLoaded',ready);