var __DOWNLOADURL = "http://package.1mobile.com/d.php?pkg=@appName@&channel=304";

function downloadApp(appId){
	var downloaURL = __DOWNLOADURL.replace(/\@appName\@/,appId);
	var filename = appId + ".apk";
	chrome.downloads.download({
    	url:downloaURL,
        filename:filename
 	}, function(downloadId){
      	console.log("download item's id is " + downloadId);
	})
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var url = sender.tab.url;
        var query = url.replace("https://play.google.com/store/apps/details?id=","");
        if(query == url){
        	console.log("the message come from error url");
        	return;
        }
        var appId = query.split("\&")[0];
       	downloadApp(appId);
    }
);