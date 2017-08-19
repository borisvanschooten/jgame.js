/* Copyright (c) 2014-2016 by Boris van Schooten tmtg.net boris@13thmonkey.org*/
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine

// game states

function deleteArrayElement(array,key) {
	var idx = array.indexOf(key);
	if (idx >= 0) array.splice(idx,1);
}

var JGState = {
	gamestates: {}, // associative array state => timer
	newgamestates: {}, // associative array state => timer
	delgamestates: [], // array of states
};

JGState.dump = function() {
	return JSON.stringify(JGState,4);
}

JGState.isIn = function(state) {
	return typeof JGState.gamestates[state] != "undefined";
}

// timer=-1 means indefinitely.
// if game state is already set or already in new game states,
// start will not be triggered again, but other game states will be cleared.
JGState.set = function(state,timer) {
	if (!timer) timer = -1;
	// ignore when already set
	if (typeof JGState.gamestates[state] == "undefined") {
		// state not set
		JGState.newgamestates = {};
		JGState.newgamestates[state] = timer;
	}
	JGState.delgamestates = [];
	for (var key in JGState.gamestates) {
		if (!JGState.gamestates.hasOwnProperty(key)) continue;
		if (key == state) continue;
		JGState.delgamestates.push(key);
	}
}

JGState.add = function(state,timer) {
	if (!timer) timer = -1;
	// ignore when already added
	if (typeof JGState.gamestates[state] != "undefined"
	||  typeof JGState.newgamestates[state] != "undefined") return;
	JGState.newgamestates[state] = timer;
	deleteArrayElement(JGState.delgamestates,state);
}

JGState.remove = function(state) {
	// cancel if in new game states
	delete JGState.newgamestates[state];
	// ignore when not present
	if (typeof JGState.gamestates[state] == "undefined") return;
	JGState.delgamestates.push(state);
}

// calls start... end... and doFrame.../paintFrame methods
// according to game state
// phase: "do", "paint", undefined = do and paint
JGState.handleGameStates = function(gamespeed,frameskip,phase) {
	if (!phase || phase=="do") {
		// remove old states
		while (JGState.delgamestates.length > 0) {
			// copy into delstates and empty
			var delstates = JGState.delgamestates.slice(0);
			JGState.delgamestates = [];
			for (var i=0; i<delstates.length; i++) {
				var key = delstates[i];
				if (typeof(window["end"+key])=="function") {
					window["end"+key](JGState.gamestates[key]);
				}
				delete JGState.gamestates[key];
			}
			// repeat until empty
		}
		// add new states
			//var delstates = {};
			//for (var attr in JGState.delgamestates) {
			//	if (JGState.delgamestates.hasOwnProperty(attr))
			//		delstates[attr] = JGState.delgamestates[attr];
			//}
		do {
			var started=0;
			for (var key in JGState.newgamestates) {
				if (!JGState.newgamestates.hasOwnProperty(key)) continue;
				JGState.gamestates[key] = JGState.newgamestates[key];
				delete JGState.newgamestates[key];
				started++;
				if (typeof(window["start"+key])=="function") {
					window["start"+key](JGState.gamestates[key]);
				}
			}
		} while (started > 0);
		//JGState.newgamestates = {};
	}
	// handle existing states
	for (var key in JGState.gamestates) {
		if (!JGState.gamestates.hasOwnProperty(key)) continue;
		if (!phase || phase=="do") {
			if (typeof(window["doFrame"+key])=="function") {
				window["doFrame"+key](JGState.gamestates[key]);
			}
		}
		if (!phase || phase=="paint") {
			if (!frameskip) {
				if (typeof(window["paintFrame"+key])=="function") {
					window["paintFrame"+key](JGState.gamestates[key]);
				}
			}
		}
		if (!phase || phase=="do") {
			// tick timer, expire when < 0
			if (JGState.gamestates[key] >= 0) {
				JGState.gamestates[key] -= gamespeed;
				if (JGState.gamestates[key] < 0) {
					JGState.delgamestates.push(key);
				}
			}
		}
	}
}

