// my_script.js
var synth = window.speechSynthesis;
var voices = [];

function populateVoiceList() {
  voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });
}
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

console.log("YouTube Chat WebSpeech API extension is running...")

var msg_array = []

setTimeout(function() {
	setInterval(function() {
		update_msg_array()
		if ((msg_array.length > 0) && (synth.speaking == false)) {
			processQueue()
		}
	}, 1000);
}, 7000);

var last_msg_id = ""

function update_msg_array() {
	var list = document.getElementById('item-offset').querySelector("#items").childNodes
	var up_to_date = false 
	if (last_msg_id == "") { up_to_date = true }

	for (let i = 0; i < list.length; i++) {	
		if (list[i].nodeName == "YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER") {
			if ((up_to_date) && (list[i].id.length > 40)) {
			
				var content = list[i].querySelector("#content")
				var author = content.childNodes[1].querySelector("#author-name").innerText
				var text = content.querySelector("#message").innerText
		
				var message = {
					id: list[i].id,
					content : content,
					author : author,
					text : text
				}
				
				msg_array.push(message)
				last_msg_id = message.id
			} else if (list[i].id == last_msg_id) { 
				up_to_date = true
			}
		}
	}
}

function processQueue() {
	if (msg_array.length > 0) {
		speak(msg_array.shift())
	}
}

function speak(message){
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
  	var utterThis = new SpeechSynthesisUtterance(message.text);
	// utterThis.onend   = function (event) { console.log('SpeechSynthesisUtterance.onend');     }
	// utterThis.onerror = function (event) { console.error('SpeechSynthesisUtterance.onerror'); }
	utterThis.addEventListener('end', function(event) { 
		processQueue();
	});
	
	
	if (message.author == "Narcissa Wright") {
		for(i = 0; i < voices.length ; i++) {
			if(voices[i].name === 'Microsoft Zira - English (United States)') {
				utterThis.voice = voices[i]; // is the girl
				utterThis.volume = 0.75
				utterThis.pitch = 1.0;
				utterThis.rate = 1.0;
				break;
			}
		}
	} else {
		var v = Math.floor(Math.random() * 2)
		utterThis.voice = voices[v];
		utterThis.volume = 0.45
		utterThis.pitch = 1.0 + (Math.random() - 0.5);
		utterThis.rate = 1.0 + ((Math.random() - 0.5) * 0.5);
	}
	synth.speak(utterThis);
}
















