let status = "IDLE"
let events = 0;

const actions = {
	"register-webpage-event": () => {
		registerWebpageEvent();
	},
	"toggle-recording": (channel, msg) => {
		chrome.desktopCapture.chooseDesktopMedia(["screen"], msg.tabId,function (streamId){
			toggleRecording(streamId, ()=>{})
		})
		// toggleRecording(msg.streamId, ()=>{
		// 	channel.postMessage({action: "recording-toggled", status})
		// })
	},
	"get-init": (channel, msg) => {
		channel.postMessage({action: "init", status, events})
	}
}
chrome.runtime.onConnect.addListener(function(channel) {
	console.log(channel)
	channel.onMessage.addListener(function(msg) {
		if(actions[msg.action]){
			actions[msg.action](channel, msg)
		}else{
			console.log("Unknown action", msg.action)
		}
	});
	channel.onDisconnect.addListener(function(){
		console.log("disconnected")
	})
});

function toggleRecording(streamId, onEnd) {
	if (status === "IDLE") {
		startRecording(streamId).then(()=>{
			status = "RECORDING"
		}).then(onEnd).catch((e)=>{
			console.log("Error starting recording", e)
		})
	} else {
		stopRecording().then(()=>{
			status = "IDLE"
		}).then(onEnd).catch((e)=>{
			console.log("Error starting recording", e)
		})
	}
	onEnd();
}

async function startRecording(streamId){
	// get active tab
	const existingContexts = await chrome.runtime.getContexts({});
	const offscreenDocument = existingContexts.find(
		(c) => c.contextType === 'OFFSCREEN_DOCUMENT'
	);
	if (!offscreenDocument) {
		// Create an offscreen document.
		await chrome.offscreen.createDocument({
			url: 'src/offscreen/index.html',
			reasons: ['USER_MEDIA'],
			justification: 'Recording from API',
		});
	}
	return chrome.runtime.sendMessage({
		type: 'start-recording',
		target: 'offscreen',
		data: streamId
	})
}
async function stopRecording(){
	return chrome.runtime.sendMessage({
		type: 'stop-recording',
		target: 'offscreen',
	})
}


function registerWebpageEvent() {
	if (status === "RECORDING"){
		events++;
		chrome.runtime.sendMessage({action: "events-updated", events})
	}
}
