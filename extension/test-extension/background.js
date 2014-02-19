chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var url = sender.tab.url;
        var query = url.replace("https://play.google.com/store/apps/details?id=","");
        var appId = query.split("\&")[0];
        testDownloadApp(appId);
});