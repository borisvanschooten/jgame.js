// Copyright (c) 2014 by Boris van Schooten boris@13thmonkey.org
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine


function JGAudio() { }

// false, null -> init
// true,null -> use audio element
// true,nonnull -> use web audio api
JGAudio._inited = false;
JGAudio._context = null;

// sound enable per-channel
JGAudio._disabled = {};

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

JGAudio._init = function() {
	if (JGAudio._inited) return;
	if (window.AudioContext || window.webkitAudioContext) {
		try {
			window.AudioContext=window.AudioContext||window.webkitAudioContext;
			JGAudio._context = new AudioContext();
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

JGAudio.play = function(name,channel,loop,amplitude) {
	if (!amplitude) amplitude = 0.6;
	if (channel) JGAudio.stop(channel);
	if (channel && loop) {
		JGAudio._playingLoops[channel] = name;
		JGAudio._playingLoopsVolume[channel] = amplitude;
		//console.log("PLAYLOOP"+channel+" "+name);
	}
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

// 1.0 = original playback rate
JGAudio.setPlaybackRate = function(channel,value) {
	var playing = JGAudio._playing[channel];
	if (!playing) return;
	if (JGAudio._context) {
		playing.playbackRate.value = value;
	} else {
		playing.playbackRate = value;
	}
}

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

JGAudio.enable = function(channel) {
	if (channel) {
		if (JGAudio._playingLoops[channel]) {
			JGAudio._disabled[channel] = false;
			JGAudio.play(JGAudio._playingLoops[channel],channel,true,
				JGAudio._playingLoopsVolume[channel]);
		}
	} else {
		JGAudio._disabled["_NO_CHANNEL"] = false;
	}
}

JGAudio.disable = function(channel) {
	if (channel) {
		var loop = JGAudio._playingLoops[channel];
		//console.log("DISABLELOOP"+channel+" "+loop);
		JGAudio.stop(channel);
		JGAudio._playingLoops[channel] = loop;
	}
	if (!channel) channel = "_NO_CHANNEL";
	JGAudio._disabled[channel] = true;
}

JGAudio.isEnabled = function(channel) {
	if (!channel) channel = "_NO_CHANNEL";
	return !JGAudio._disabled[channel];
}

JGAudio.setRootDir = function(dir) {
	JGAudio._rootdir = dir;
}

