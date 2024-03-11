const channel = chrome.runtime.connect({name: "recording"});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	if (msg.action === "ask-for-recording"){
		console.log(chrome)
		chrome.desktopCapture.chooseDesktopMedia(["tab"],function (streamId){
			channel.postMessage({action: "toggle-recording", streamId})
		})
	}
	sendResponse({message: "received"})
})

document.addEventListener('click', function (e) {
	channel.postMessage({action: "register-webpage-event"})
})
