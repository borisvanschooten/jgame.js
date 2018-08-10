// Copyright (c) 2014 by Boris van Schooten boris@13thmonkey.org
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine


// mute/unmute when page hidden/visible

var _document_hidden_name, _visibilityChangeName; 
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
  _document_hidden_name = "hidden";
  _visibilityChangeName = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  _document_hidden_name = "msHidden";
  _visibilityChangeName = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  _document_hidden_name = "webkitHidden";
  _visibilityChangeName = "webkitvisibilitychange";
}
 
function handleVisibilityChange() {
  console.log("Hide/Unhide");
  if (document[_document_hidden_name]) {
    JGAudio.mute();
  } else {
    JGAudio.unmute();
  }
}

document.addEventListener(_visibilityChangeName, handleVisibilityChange, false);


/** @class
* SIngleton class for playing audio. */
function JGAudio() { }

// false, null -> init
// true,null -> use audio element
// true,nonnull -> use web audio api
JGAudio._inited = false;
JGAudio._suspended = false; // confirmed suspended
JGAudio._unsuspended = false; // confirmed not suspended
JGAudio._unsuspendInterval = null; // setInterval object
JGAudio._context = null;

// sound enable per-channel
JGAudio._disabled = {};

JGAudio._global_disabled=false;

// indicates temporary mute (as used for documen hidden)
JGAudio._muted=false;

// source or Audio element per channel
JGAudio._playing = {};

// loops to be restarted on enable
JGAudio._playingLoops = {};

// loops to be restarted on enable
JGAudio._playingLoopsVolume = {};

// Audio elements
JGAudio._soundcache = {};

// mapping from sound name to filename
// or from sound name to audio buffer
JGAudio._sounds = {};

// name of channel if a looping sound was played before it was loaded
// -> play as soon as loaded. 
JGAudio._sounds_queued = {};
JGAudio._sounds_queued_volume = {};

// prefix used for loading urls
JGAudio._rootdir = "";

JGAudio._unsuspend = function() {
	//JGAudio.unmute();
	if (JGAudio._unsuspendInterval) {
		clearInterval(JGAudio._unsuspendInterval);
		JGAudio._unsuspendInterval = null;
	}
	JGAudio._suspended = false;
	JGAudio._unsuspended = true;
	console.log("Audio resumed.");
}

JGAudio._init = function() {
	if (!window.AudioContext && !window.webkitAudioContext) {
		// web audio not supported, use audio element
		JGAudio._inited = true;
		return;
	}
	window.AudioContext=window.AudioContext||window.webkitAudioContext;
	if (JGAudio._inited) {
		// check if suspended by audio blocking (chrome 66+)
		// already un-suspended -> finished
		if (JGAudio._unsuspended) return;
		if (JGAudio._context.state=="suspended") {
			console.log("Trying to resume audio.");
			JGAudio._suspended = true;
			// try to resume
			JGAudio._context.resume();
			if (JGAudio._context.state!="suspended") {
				if (JGAudio._suspended) {
					// suspended -> not suspended
					JGAudio._unsuspend();
				}
			}
		} else {
			JGAudio._unsuspended = true;
			if (JGAudio._suspended) {
				// suspended -> not suspended
				JGAudio._unsuspend();
			}
		}
		return;
	}
	if (window.AudioContext || window.webkitAudioContext) {
		try {
			JGAudio._context = new AudioContext();
			if (JGAudio._context.state=="suspended") {
				console.log("Audio suspended, will try to resume.");
				// Chrome 66+ will suspend audio until user gesture
				JGAudio._unsuspendInterval = setInterval(JGAudio._init,500);
			}
		} catch (e) {
			// web audio not supported, use audio element
		}
	}
	JGAudio._inited = true;
}

// tries to load mp3 and ogg
JGAudio._loadFile = function(basefilename) {
	var ret=null;
	if ((new Audio()).canPlayType("audio/mpeg;")) {
		ret = new Audio(JGAudio._rootdir+basefilename+".mp3");
	} else if ((new Audio()).canPlayType("audio/ogg;")) {
		ret = new Audio(JGAudio._rootdir+basefilename+".ogg");
	}
	return ret;
}

/** Load a sample from a filename.
* @param name name of sample
* @param basefilename path to sample without file extension (i.e. ".mp3" is omitted)
*/
JGAudio.load = function (name,basefilename) {
	if (JGAudio._sounds[name]) return;
	JGAudio._init();
	if (JGAudio._context) {
		JGAudio._sounds[name] = "loading";
		var request = new XMLHttpRequest();
		request.open('GET', JGAudio._rootdir+basefilename+".mp3", true);
		request.responseType = 'arraybuffer';
		// Decode asynchronously
		request.onload = function() {
			JGAudio._context.decodeAudioData(request.response,
				function(buffer) {
					JGAudio._sounds[name] = buffer;
					if (JGAudio._sounds_queued[name]) {
						JGAudio.play(name,JGAudio._sounds_queued[name],true,
							JGAudio._sounds_queued_volume[name]);
						JGAudio._sounds_queued[name] = false;
					}
				},
				function(error) { }/*onError*/
			);
		}
		request.send();
	} else {
		JGAudio._sounds[name] = basefilename;
		JGAudio._soundcache[name] = JGAudio._loadFile(basefilename);
	}
}

/** Play sample.  When channel is defined, will stop any sample already
* playing on that channel.  
* 
* @param {string} name  name of sample
* @param {string} [channel] channel name
* @param {boolean} [loop]  loop sample. Channel must be defined for a sample
*        to loop.
* @param {float} [amplitude=0.5]  
*/
JGAudio.play = function(name,channel,loop,amplitude) {
	JGAudio._init();
	if (!amplitude) amplitude = 0.5;
	if (channel) JGAudio.stop(channel);
	if (channel && loop) {
		JGAudio._playingLoops[channel] = name;
		JGAudio._playingLoopsVolume[channel] = amplitude;
		//console.log("PLAYLOOP"+channel+" "+name);
	}
	if (JGAudio._global_disabled) return;
	if (JGAudio._muted) return;
	if (channel && JGAudio._disabled[channel]) return;
	if (!channel && JGAudio._disabled["_NO_CHANNEL"]) return;
	if (typeof JGAudio._sounds[name] == "undefined") return;
	if (JGAudio._context) {
		if (JGAudio._sounds[name] == "loading") {
			if (loop) {
				JGAudio._sounds_queued[name] = channel;
				JGAudio._sounds_queued_volume[name] = amplitude;
			}		
		} else {
			var source = JGAudio._context.createBufferSource();
			var sourceGain = JGAudio._context.createGain();
			sourceGain.gain.value = amplitude;
			source.buffer = JGAudio._sounds[name];
			source.connect(sourceGain);
			sourceGain.connect(JGAudio._context.destination);
			if (loop) source.loop = true;
			source.start(0);
			if (channel) JGAudio._playing[channel] = source;
		}
	} else {
		var audio = JGAudio._loadFile(JGAudio._sounds[name]);
		// http://stackoverflow.com/questions/3273552/html-5-audio-looping
		if (loop) audio.loop = true;
		audio.volume = amplitude;
		audio.play();
		if (channel) JGAudio._playing[channel] = audio;
		//audio.preload="auto";
		//audio.addEventListener("canplay", function() { alert("canplay"); audio.play(); });
	}
}

/** Set playback rate of a channel.  1.0 = normal playback rate.
* @param {string} channel  channel to change
* @param {float} value
JGAudio.setPlaybackRate = function(channel,value) {
	var playing = JGAudio._playing[channel];
	if (!playing) return;
	if (JGAudio._context) {
		playing.playbackRate.value = value;
	} else {
		playing.playbackRate = value;
	}
}

/** Stop any sample playing on the gven channel.
* Only samples on a channel can be stopped.
*
* @param {string} channel
*/
JGAudio.stop = function(channel) {
	//console.log("STOP"+channel);
	JGAudio._playingLoops[channel] = false;
	// check if queued
	for (var qname in JGAudio._sounds_queued) {
		var qchan = JGAudio._sounds_queued[qname];
		if (qchan == channel) delete JGAudio._sounds_queued[qname];
	}
	// check if actually playing
	var playing = JGAudio._playing[channel];
	if (!playing) return;
	if (JGAudio._context) {
		if (playing.stop) {
			playing.stop();
		} else if (playing.noteOff) {
			playing.noteOff(0);
		}
	} else {
		playing.pause();
	}
	JGAudio._playing[channel] = null;
}

JGAudio.mute = function() {
	this._muted = true;
	for (var channel in JGAudio._playingLoops) {
		var loop = JGAudio._playingLoops[channel];
		JGAudio.stop(channel);
		JGAudio._playingLoops[channel] = loop;
	}
}

JGAudio.unmute = function() {
	this._muted = false;
	for (var channel in JGAudio._playingLoops) {
		if (JGAudio._playingLoops[channel]) {
			JGAudio.play(JGAudio._playingLoops[channel],channel,true,
				JGAudio._playingLoopsVolume[channel]);
		}
	}

}

/** Enable audio on a channel.  If no channel is supplied, enable all audio
 * globally. 
 * Use _NO_CHANNEL to enable only audio not associated with channel.
 * @param {string} [channel] 
 */
JGAudio.enable = function(channel) {
	channels = [];
	//if (!channel) channel = "_NO_CHANNEL";
	if (channel) {
		channels.push(channel);
	} else {
		JGAudio._global_disabled = false;
		for (var channel in JGAudio._disabled) {
			channels.push(channel);
		}
	}
	for (var i=0; i<channels.length; i++) {
		channel = channels[i];
		JGAudio._disabled[channel] = false;
		if (JGAudio._playingLoops[channel]) {
			JGAudio.play(JGAudio._playingLoops[channel],channel,true,
				JGAudio._playingLoopsVolume[channel]);
		}
	}
}

/** Disable audio on a channel. Any sound playing on the channel is stopped.
* If no channel is supplied, globally disable playing all audio.  Enabling
* a channel while audio is disabled globally will not play audio.
* Use _NO_CHANNEL to disable only audio not associated with channel.
* @param {string} [channel] 
*/
JGAudio.disable = function(channel) {
	channels = [];
	//if (!channel) channel = "_NO_CHANNEL";
	if (channel) {
		channels.push(channel);
	} else {
		JGAudio._global_disabled = true;
		for (var channel in JGAudio._playingLoops) {
			channels.push(channel);
		}
	}
	for (var i=0; i<channels.length; i++) {
		channel = channels[i];
		var loop = JGAudio._playingLoops[channel];
		//console.log("DISABLELOOP"+channel+" "+loop);
		JGAudio.stop(channel);
		JGAudio._playingLoops[channel] = loop;
		JGAudio._disabled[channel] = true;
	}
}

JGAudio.isEnabled = function(channel) {
	//if (!channel) channel = "_NO_CHANNEL";
	if (!channel) return JGAudio._global_disabled;
	return !JGAudio._disabled[channel];
}

JGAudio.setRootDir = function(dir) {
	JGAudio._rootdir = dir;
}

