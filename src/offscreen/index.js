chrome.runtime.onMessage.addListener(async (message) => {
	console.log('Received message:', message);
	if (message.target === 'offscreen') {
		switch (message.type) {
			case 'start-recording':
				startRecording(message.data);
				break;
			case 'stop-recording':
				stopRecording();
				break;
			default:
				throw new Error('Unrecognized message:', message.type);
		}
	}
});

let recorder;
let data = [];

async function startRecording(streamId) {
	if (recorder?.state === 'recording') {
		throw new Error('Called startRecording while recording is in progress.');
	}
	const media = await navigator.mediaDevices.getUserMedia({
		audio: {
			mandatory: {
				chromeMediaSource: "tab",
				chromeMediaSourceId: streamId,
			},
		},
		video: {
			mandatory: {
				chromeMediaSource: "tab",
				chromeMediaSourceId: streamId,
			},
		},
	});
	console.log("Media", media)

	// Continue to play the captured audio to the user.
	const output = new AudioContext();
	const source = output.createMediaStreamSource(media);
	source.connect(output.destination);

	// Start recording.
	recorder = new MediaRecorder(media, { mimeType: 'video/webm' });
	recorder.ondataavailable = (event) => data.push(event.data);
	recorder.onstop = () => {
		const blob = new Blob(data, { type: 'video/webm' });
		window.open(URL.createObjectURL(blob), '_blank');

		// Clear state ready for next recording
		recorder = undefined;
		data = [];
	};
	recorder.start();
	window.location.hash = 'recording';
}

async function stopRecording() {
	recorder.stop();

	recorder.stream.getTracks().forEach((t) => t.stop());

	window.location.hash = '';
}
