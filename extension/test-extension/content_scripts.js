function __downloadButtonListener(){
	console.log("download");
	chrome.runtime.sendMessage({}, function(response) {
  		console.log(response.farewell);
	});
}
function __creatDownloadButton(){
	var detailsDiv =  window.document.getElementsByClassName("details-actions")[0];
	if(window.document.getElementById("_downloadAndInstall") || !detailsDiv){
		return;
	}
	var newNode = document.createElement("button");
	newNode.setAttribute("id","_downloadAndInstall");
	newNode.innerHTML = "hello";
	detailsDiv.appendChild(newNode);
	document.getElementById("_downloadAndInstall").addEventListener("click",__downloadButtonListener);
}

function __triggerButtonVisibilityCheck() {
	var showButton = false;
	if (location.pathname.lastIndexOf('/store/apps/details', 0) !== 0) {
		return;
	}
        var price = document.querySelector("meta[itemprop=price]");
        showButton = !price;
        if (price) {
            	price = price.getAttribute("content");
            	showButton = !/\d/.test(price) || price === '0';
        }
        if(showButton){
        		__creatDownloadButton();
        }
}
document.addEventListener("DOMSubtreeModified",__triggerButtonVisibilityCheck,false);