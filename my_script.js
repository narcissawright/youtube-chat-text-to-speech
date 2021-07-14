'use strict';

const blocklist = [];

var prior_author = ''
var prior_phrase = ''

const profiles = {
    ['Narcissa Wright']: {
	voices: ['Microsoft Zira - English (United States)'],
	volume: 0.7,
	pitch: 1.0,
	rate: 1.0
    }, ['D_Girl']: {
	voices: ['Microsoft Zira - English (United States)'],
	volume: 0.6,
	pitch: 0.45,
	rate: 1.02
	}, ['Tracee Wu']: {
	voices: ['Microsoft Zira - English (United States)'],
	volume: 0.6,
	pitch: 1.4,
	rate: 1.0
	}, ['Yume Tea']: {
	voices: ['Microsoft Zira - English (United States)'],
	volume: 0.6,
	pitch: 1.12,
	rate: 0.98
	}
};

const synth = window.speechSynthesis;
let all_voices = [];

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  var result = (hash * -1 / Math.pow(2, 32)) + 0.5
  return result
};

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

// Wait a couple seconds to let the page load before setting everything up.
setTimeout(() => {    
    // Select the node that will be observed for mutations.
    const chatNode = document.getElementById('item-offset');
    if (!chatNode) {
	console.error('chatNode null or something: ' + chatNode);
    }
    
    // Options for the observer (which mutations to observe).
    const config = { attributes: true, childList: true, subtree: true };
    
    // Initialize message counter (k) to point to the end of the chat.
    let k = chatNode.querySelector("#items").childNodes.length;

    // Start observing the chat.
    new MutationObserver(() => {
	const list = chatNode.querySelector("#items").childNodes;
	for (; k < list.length; k++) {
	    if (list[k].nodeName == "YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER") {
		const content = list[k].querySelector("#content");
		const author = content.childNodes[1].querySelector("#author-name").innerText;
		const text = content.querySelector("#message").innerText;
		speak(author, text);
	    }
	}
    }).observe(chatNode, config);

    // Speak a message (called from observer code).
    function speak(author, text){
		if (blocklist.includes(author)) { return; }
	
		// put some text logic here!
		text = text.replace("nair", "neutral air")
		text = text.replace("bair", "back air")
		text = text.replace("uair", "up air")
		text = text.replace("dair", "down air")
		text = text.replace("dtilt", "down tilt")
		text = text.replace("OoS", "out of shield")
		text = text.replace("ftilt", "forward tilt")
		text = text.replace("utilt", "up tilt")
		text = text.replace("w/e", "whatever")
		text = text.replace("lol", "lawl")
		text = text.replace("yume", "you may")
		text = text.replace("Yume", "you may")
		if (text == "gl") {
			text = "good luck"
		} else if (text == "ty") {
			text = "thank you"
		}
		
		console.log(text)
		
		if ((prior_author == author) && (prior_phrase == text)) {
			return
		}
		prior_author = author
		prior_phrase = text
		let utterThis = new SpeechSynthesisUtterance(text);

		const profile = profiles[author];
		if (profile) {
			// Use highest priority preferred voice that is available.
			utterThis.voice = profile.voices.map(voice => all_voices.find(v => v.name === voice)).find(x => x);
			utterThis.volume = profile.volume;
			utterThis.pitch = profile.pitch;
			utterThis.rate = profile.rate;
		}
		else {
			// Use author name as a voice seed.
			var seeded_random = (author + 'voice').hashCode()
			var seeded_voice = Math.floor(seeded_random * 2) // assuming first two voices are the male microsoft ones, sorry for sloppy code :P
			utterThis.voice = all_voices[seeded_voice];
			utterThis.pitch = 1.0 + (((author + 'pitch').hashCode() - 0.5) * 1.4)
			utterThis.rate = 1.0 + (((author + 'rate').hashCode() - 0.5) * 0.7)
			utterThis.volume = 0.525
		}
		synth.speak(utterThis);
    }
}, 4000);












