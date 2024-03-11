let status = "IDLE";
function init(){
	const channel = initRecordingChannel();
	const {button, updateStatus} = getRecordingButton();
	const {updateEvents} = getEventsContainer();
	channel.postMessage({action: "get-init"})


	button.addEventListener("click", function(){
		if (status === "IDLE") {
			getCurrentTab().then((tabId) => {
				channel.postMessage({action: "toggle-recording", tabId})
			})
			// getCurrentTabId().then((tabId) => {
			// 	chrome.tabs.sendMessage(tabId,{action: "ask-for-recording"}).then((response) => {
			// 		console.log("response", response)
			// 	});
			// });
		}
	});

	initChannelEventResponses(channel, {updateStatus, updateEvents});
}

function getCurrentTab(){
	return new Promise((resolve, reject) => {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			resolve(tabs[0])
		})
	})
}

function getRecordingButton(){
	const button = document.getElementById("recordButton");
	const updateStatus = function(status){
		if(status === "IDLE"){
			button.textContent = "Start Recording"
		} else {
			button.textContent = "Stop Recording"
		}
	}
	return {
		button,
		updateStatus
	}
}
function getEventsContainer(){
	const div = document.getElementById("clickCounter");
	const updateEvents = function(value){
		div.textContent = `${value}`
	}
	return {
		div,
		updateEvents
	}
}
function initRecordingChannel(){
	return chrome.runtime.connect({name: "recording"});
}
function addChannelEventResponse(channel, action, callback){
	channel.onMessage.addListener(function (msg){
		if(msg.action === action){
			callback(msg)
		}
	})
}

function initChannelEventResponses(channel, {updateStatus, updateEvents}){
	addChannelEventResponse(channel, "init", function(msg){
		console.log("init", msg)
		status = msg.status
		updateStatus(msg.status)
		updateEvents(msg.events)
	})
	addChannelEventResponse(channel, "recording-toggled", function(msg){
		updateStatus(msg.status)
	})
	addChannelEventResponse(channel, "events-updated", function(msg){
		updateStatus(msg.events)
	})
}

document.addEventListener("DOMContentLoaded", init)
