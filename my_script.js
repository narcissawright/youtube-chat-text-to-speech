'use strict';

const blocklist = [
];

const profiles = {
};

const synth = window.speechSynthesis;
let all_voices = [];

// Boilerplate for loading voices.
function populateVoiceList() {
    if(typeof synth === 'undefined') {
	return;
    }
    all_voices = synth.getVoices();
    console.log('available voices:');
    for (const voice of all_voices) {
    	console.log(voice.name);
    }
}
populateVoiceList();
if (typeof synth !== 'undefined' && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoiceList;
}

console.log('YouTube Chat Web Speech API extension is running...');

// Create an array of [author, text] pairs (two-element arrays)
// from a NodeList of messages.
function mkLog(msgs) {
    let log = [];
    msgs.forEach(m => {
	if (m.nodeName == "YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER") {
	    const content = m.querySelector("#content");
	    const author = content.childNodes[1].querySelector("#author-name").innerText
	    const text = content.querySelector("#message").innerText;
	    log.push([author, text]);
	}
    });
    return log;
}

function printLog(log) {
    log.forEach(m => console.log(m[0] + ': ' + m[1]));
}

// Equality of [author, text] pairs.
function eq(m1, m2) {
    return m1[0] == m2[0] && m1[1] == m2[1];
}

// Wait a couple seconds to let the page load before setting everything up.
setTimeout(() => {    
    // Select the node that will be observed for mutations.
    const chatNode = document.getElementById('item-offset');
    if (!chatNode) {
	console.error('chatNode null or something: ' + chatNode);
    }
    
    // Options for the observer (which mutations to observe).
    const config = { attributes: true, childList: true, subtree: true };
    
    // Capture initial state of the chat log.
    let log = mkLog(chatNode.querySelector("#items").childNodes);

    // Start observing the chat.
    new MutationObserver(() => {
	log = diff(log, mkLog(chatNode.querySelector("#items").childNodes));
	console.log(log.length);
    }).observe(chatNode, config);

    // Compare old and new message logs to speak new messages.
    function diff(old_log, new_log) {
	// Iterate through new_log.
	for (let i = 0; i < new_log.length; i++) {
	    // If off the end of old_log, speak message and keep going.
    	    if (i >= old_log.length) {
    		speak(new_log[i][0], new_log[i][1]);
    	    }
	    // Else if messages don't match, shift old_log and revert
	    // i. This happens when some old messages have been pushed
	    // off the chat due to reaching the size limit. This step
	    // aligns the logs so when we reach the end of old_log we
	    // know that the remaining messages should be spoken.
    	    else if (!eq(old_log[i], new_log[i])) {
    		old_log.shift();
    		i--;
    	    }
	}
	return new_log;
    }

    // Speak a message (called from observer code).
    function speak(author, text) {
	if (blocklist.includes(author)) {
	    return;
	}
	
	let utterThis = new SpeechSynthesisUtterance(text);

	const profile = profiles[author];
	if (profile) {
	    // Use highest priority preferred voice that is available.
	    utterThis.voice = profile.voices.map(voice => all_voices.find(v => v.name === voice)).find(x => x);
	    utterThis.volume = profile.volume;
	}
	else {
	    // Leave voice as default.
	    utterThis.volume = 0.5
	}
	
	synth.speak(utterThis);
    }
}, 4000);
