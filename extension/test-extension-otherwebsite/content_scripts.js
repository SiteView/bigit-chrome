function __getAppDetailInfo(){
	//评分
	var score =  document.querySelector("div[class=score-container] div[class=score]").innerText;//评分
	//评分数量
	var ratingCount = document.querySelector("div[class=score-container] meta[itemprop=ratingCount]").content;
	//评分分布
	var ratingHistogram = {five:0,four:0,three:0,two:0,one:0};
	for(x in ratingHistogram){
		var selector = "div[class=rating-histogram] div[class='rating-bar-container "+x+"'] span[class=bar-number]";
		ratingHistogram[x] = +document.querySelector(selector).innerText.replace(/\,/g,"");
	}
	//应用详细
	var appDetails = {
		datePublished:"",
		fileSize:"",
		numDownloads:"",
		softwareVersion:"",
		operatingSystems:"",
		contentRating:""
	}
	for(y in appDetails){
		var selector = "div[class=details-section-contents] div[class=meta-info] div[itemprop="+y+"]";
		appDetails[y] = document.querySelector(selector).innerText;
	}

	return {
		score:score,
		ratingCount:ratingCount,
		ratingHistogram:ratingHistogram,
		appDetails:appDetails
	}
}

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
	newNode.setAttribute("class","buy-button-container apps medium play-button");
	newNode.innerHTML = "下载";
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