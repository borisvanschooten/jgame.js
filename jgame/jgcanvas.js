/* Copyright (c) 2014-2016 by Boris van Schooten tmtg.net boris@13thmonkey.org*/
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine


/* ---------------------------------------------------------------------
* Polyfills and helper functions (maybe move to different file later) */

// IE polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

//From:http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
/* Recursively merge properties of two objects.
* if elem exists in obj2, use that, otherwise use obj1
* Overwrites obj1 */
function MergeRecursive(obj1, obj2) {
	if (!obj1 && !obj2) return {};
	if (!obj1) return obj2;
	if (!obj2) return obj1;
	for (var p in obj2) {
		try {
			if ( obj2[p].constructor==Object ) {
				obj1[p] = MergeRecursive(obj1[p], obj2[p]);
			} else if ( obj2[p].constructor==Array ) {
				for (var i=0; i<obj2[p].length; i++) {
					obj1[p][i] = MergeRecursive(obj1[p][i],obj2[p][i]);
				}
			} else {
				obj1[p] = obj2[p];
			}
		} catch(e) {
			obj1[p] = obj2[p];
		}
	}
	return obj1;
}

// version where a copy is returned, obj1 remains unmodified
function MergeRecursiveCopy(obj1,obj2) {
	var ret = {};
	ret = MergeRecursive(ret,obj1);
	ret = MergeRecursive(ret,obj2);
	return ret;
}


/* ------------------------------------------------------------------
* Constants */

var KeyUp = 38;
var KeyRight = 39;
var KeyDown = 40;
var KeyLeft = 37;
var KeyShift = 16;
var KeyCtrl = 17;
var KeyAlt = 18;
var KeyAltGr = 225;
var KeyBackspace = 8;
var KeyDelete = 46;
var KeyEnter = 13;
var KeyTab = 9;
var KeyEsc = 27;
var KeyHome = 36;
var KeyPageUp = 33;
var KeyPageDown = 34;
var KeyPause = 19;


/* ------------------------------------------------------------------
* Class */


// canvas - canvas to register events on
function JGCanvas(canvas,logicalwidth,logicalheight) {
	if (!canvas) return; // no-parameters call for subclass
	this.canvas = canvas;
	this.width = logicalwidth;
	this.height = logicalheight;
	this.updateViewport();
	// input
	this.flanktimer = 0;
	this.keymap = []; // boolean
	//this.prevkeymap = []; // boolean
	this.keyflankmap = []; // time at which !key -> key was detected
	for (var i=0; i<260; i++) {
		this.keymap[i] = false;
		//this.prevkeymap[i] = false;
		this.keyflankmap[i] = 0;
	}
	this.mousex = 0;
	this.mousey = 0;
	this.mousebutton = [false,false,false,false,false];
	this.mouseinside = false;

	this.touches = []; // {id,x,y}


	this.gamepad = {
		/** analog left stick -1 ... 1 */
		lx: 0, 
		ly: 0,
		/** analog right stick -1 ... 1 */
		rx: 0,
		ry: 0,
		/** digital pad -1 ... 1 */
		dx: 0,
		dy: 0,
		/** true = one of the main buttons A,B,X,Y is pressed */
		anybut: false,
		but: { a:false, b:false, x:false, y:false },
		/* todo backside buttons */
	}


	this.frameskip = false;

	this.sawtouchevents = false;
	this.sawmouseevents = false;
	this.hasgamepads = false;

	var object = this;
	// add tabindex="1" to enable keyboard focus on canvas.
	// otherwise use document.addEventListener for keys
	canvas.addEventListener('keydown',
		function(event) {
			object._jgkeydown(event);
			// prevent "find as you type" from interfering with game
			event.preventDefault();
		}, false);
	canvas.addEventListener('keyup',
		function(event) {
			object._jgkeyup(event);
			// prevent "find as you type" from interfering with game
			event.preventDefault();
		}, false);

	canvas.addEventListener('mouseup',
		function(event) {object._jgmouseup(event);},   false);
	canvas.addEventListener('mousedown',
		function(event) {object._jgmousedown(event);}, false);
	canvas.addEventListener('mousemove',
		function(event) {object._jgmousemove(event);}, false);
	canvas.addEventListener('mouseout',
		function(event) {object._jgmouseout(event);}, false);
	//canvas.addEventListener('touchstart', jgtouchstart, false);
	//canvas.addEventListener('touchmove',  jgtouchmove,  false);
	canvas.addEventListener('touchstart',
		function(event) {
			if (typeof JGAudio == "function") {
				JGAudio._init(); // unsuspend audio
			}
			object.sawtouchevents = true;
			//object.mousebutton[1] = true;
			object._jgtouchmove(event);
			//object.mouseinside = true;
			// prevent touch behaviour that interferes with game
			event.preventDefault();
		}, false);
	canvas.addEventListener('touchmove',
		function(event) {
			object.sawtouchevents = true;
			//object.mousebutton[1] = true;
			object._jgtouchmove(event);
			//object.mouseinside = true;
			// prevent touch behaviour that interferes with game
			event.preventDefault();
		}, false);
	canvas.addEventListener('touchend',
		function(event) {
			if (typeof JGAudio == "function") {
				JGAudio._init(); // unsuspend audio
			}
			object.sawtouchevents = true;
			//object.mousebutton[1] = false;
			object._jgtouchmove(event);
			//object.mouseinside = false;
			// prevent touch behaviour that interferes with game
			event.preventDefault();
		}, false);
}

/** Update parts of the input state that can only be updated through polling
* (in particular gamepad state) **/
JGCanvas.prototype.updateInputs = function(timer) {
	this.hasgamepads=false;
	this.gamepad.lx = 0;
	this.gamepad.ly = 0;
	this.gamepad.rx = 0;
	this.gamepad.ry = 0;
	this.gamepad.dx = 0;
	this.gamepad.dy = 0;
	this.gamepad.anybut = false;
	this.gamepad.but = {a:false,b:false,x:false,y:false}
	if (navigator.getGamepads) {
		var pads = navigator.getGamepads();
		// circumvent error in Chrome, which returns an array-like
		// thing on desktop that doesn't actually contain elements
		if (pads.length > 0 && pads[0]) {
			this.hasgamepads = true;
			// add up all values from all axes
			for (var i=0; i<pads.length; i++) {
				// detect shield controller, has different axes
				var nvidiaShield =
					pads[i].id.substr(0,16) == "0955-7214-NVIDIA";
				// circumvent possible errors
				if (!pads[i] || !pads[i].axes || !pads[i].buttons) continue;
				if (pads[i].axes[0] > 0.25 || pads[i].axes[0] < -0.25)
					this.gamepad.lx += pads[i].axes[0];
				if (pads[i].axes[1] > 0.25 || pads[i].axes[1] < -0.25)
					this.gamepad.ly += pads[i].axes[1];
				if (pads[i].axes[2] > 0.25 || pads[i].axes[2] < -0.25)
					this.gamepad.rx += pads[i].axes[2];
				if (nvidiaShield) {
					if (pads[i].axes[5] > 0.25 || pads[i].axes[5] < -0.25)
						this.gamepad.ry += pads[i].axes[5];
				} else {
					if (pads[i].axes[3] > 0.25 || pads[i].axes[3] < -0.25)
						this.gamepad.ry += pads[i].axes[3];
				}
				for (var b=0; b<4; b++) {
					if (pads[i].buttons[b].pressed) this.gamepad.anybut=true;
				}
				if (pads[i].buttons[0].pressed) this.gamepad.but.a=true;
				if (pads[i].buttons[1].pressed) this.gamepad.but.b=true;
				if (pads[i].buttons[2].pressed) this.gamepad.but.x=true;
				if (pads[i].buttons[3].pressed) this.gamepad.but.y=true;
				if (nvidiaShield) {
					this.gamepad.dx = pads[i].axes[8];
					this.gamepad.dy = pads[i].axes[9];
				} else {
					if (pads[i].buttons[12] && pads[i].buttons[12].pressed)
						this.gamepad.dy = -1;
					if (pads[i].buttons[13] && pads[i].buttons[13].pressed)
						this.gamepad.dy =  1;
					if (pads[i].buttons[14] && pads[i].buttons[14].pressed)
						this.gamepad.dx = -1;
					if (pads[i].buttons[15] && pads[i].buttons[15].pressed)
						this.gamepad.dx =  1;
				}
			}
		}
	}
	if (this.update) this.update();

}

/** Call when frame is done to update flank information. Game timer is used to
 * time stamp flanks. */
JGCanvas.prototype.updateFlanks = function(timer) {
	this.flanktimer = timer;
	//for (var i=0; i<this.keymap.length; i++) {
	//	this.prevkeymap[i] = this.keymap[i];
	//}
}

/** Check if touch events were reported. Check every frame to enable touch
 * controls */
JGCanvas.prototype.sawTouchEvents = function() {
	return this.sawtouchevents;
	/* this code doesn't work, it produces false positives
	//https://hacks.mozilla.org/2013/04/detecting-touch-its-the-why-not-the-how/
	if ('ontouchstart' in window
	|| navigator.maxTouchPoints > 0
	|| navigator.msMaxTouchPoints > 0) {
		return true;
	}
	return false;
	*/
}

/** Check if touch events were reported. Check every frame to enable touch
 * controls */
JGCanvas.prototype.sawMouseEvents = function() {
	return this.sawmouseevents;
}


/** Check if touch events were reported. Check every frame to enable touch
 * controls */
JGCanvas.prototype.hasGamepads = function() {
	return this.hasgamepads;
}


// input

JGCanvas.prototype._jgkeydown = function (event) {
	if (typeof JGAudio == "function") {
		JGAudio._init(); // unsuspend audio
	}
	if (!this.keymap[event.keyCode]) {
		this.keyflankmap[event.keyCode] = this.flanktimer;
	}
	this.keymap[event.keyCode] = true;
	//event.preventDefault();
	if (event.keyCode == KeyEnter
	&&  this.keymap[KeyAlt]) {
		this.toggleFullscreen();
	}
}

JGCanvas.prototype._jgkeyup = function (event) {
	this.keymap[event.keyCode] = false;
}

JGCanvas.prototype._jgmouseup = function (event) {
	this.sawmouseevents = true;
	this.mousebutton[event.button+1] = false;
}

JGCanvas.prototype._jgmousedown = function (event) {
	if (typeof JGAudio == "function") {
		JGAudio._init(); // unsuspend audio
	}
	this.sawmouseevents = true;
	this.mousebutton[event.button+1] = true;
}

JGCanvas.prototype._jgmousemove = function (event) {
	this.sawmouseevents = true;
	//console.log("##############MOUSE "+event.clientX + " "+event.clientY);
	var rect = this.canvas.getBoundingClientRect();
	this.mousex = (event.clientX - rect.left - this.viewportxofs) 
		/ (this.viewportwidth / this.width);
	this.mousey = (event.clientY - rect.top - this.viewportyofs) 
		/ (this.viewportheight / this.height);
	this.mouseinside = true;
}

JGCanvas.prototype._jgtouchmove = function (event) {
	var rect = this.canvas.getBoundingClientRect();
	this.touches = [];
	for (var i=0; i<event.touches.length; i++) {
		var touch = event.touches[i];
		var touchx = (touch.clientX - rect.left - this.viewportxofs) 
			/ (this.viewportwidth / this.width);
		var touchy = (touch.clientY - rect.top - this.viewportyofs) 
			/ (this.viewportheight / this.height);
		this.touches.push({id: touch.identifier, x: touchx, y: touchy});
	}
	//console.log(JSON.stringify(this.touches));
}

JGCanvas.prototype._jgmouseout = function (event) {
	this.sawmouseevents = true;
	this.mouseinside = false;
}


JGCanvas.prototype._convertKeyToCode = function(key) {
	if (!isNaN(parseFloat(key)) && isFinite(key)) {
		// number -> raw key code
		return key;
	}
	// string -> convert first char to code
	return key.charCodeAt(0);
}

JGCanvas.prototype.getKey = function(keystr) {
	return this.keymap[this._convertKeyToCode(keystr)];
}

// returns time at which last keydown flank was seen
JGCanvas.prototype.getKeyDownFlank = function(keystr) {
	return this.keyflankmap[this._convertKeyToCode(keystr)];
}

JGCanvas.prototype.setKey = function(keystr) {
	this.keymap[this._convertKeyToCode(keystr)] = true;
}

JGCanvas.prototype.clearKey = function(keystr) {
	this.keymap[this._convertKeyToCode(keystr)] = false;
}

JGCanvas.prototype.getMouseX = function() {
	return this.mousex;
}

JGCanvas.prototype.getMouseY = function() {
	return this.mousey;
}

JGCanvas.prototype.getMouseButton = function(button) {
	return this.mousebutton[button];
}

JGCanvas.prototype.setMouseButton = function(button) {
	this.mousebutton[button] = true;
}

JGCanvas.prototype.clearMouseButton = function(button) {
	this.mousebutton[button] = false;
}

JGCanvas.prototype.getMouseInside = function() {
	return this.mouseinside;
}

JGCanvas.prototype.getTouches = function() {
	return this.touches;
}

/** nr = gamepad/player # */
JGCanvas.prototype.getGamepad = function(nr) {
	return this.gamepad;
}


// screen handling

// (re)calculate physical canvas dimensions
// width - physical canvas width
// height - physical canvas height
JGCanvas.prototype.updateViewport = function() {
	var aspect = this.width/this.height;
	this.viewportwidth = this.canvas.width;
	this.viewportheight = this.canvas.height;
	this.viewportxofs = 0;
	this.viewportyofs = 0;
	var physicalaspect = this.viewportwidth/this.viewportheight;
	if (physicalaspect > 1.02*aspect) {
		this.viewportwidth = this.viewportheight*1.02*aspect;
		this.viewportxofs = 0.5*(this.canvas.width - this.viewportwidth);
	} else if (physicalaspect < 0.98*aspect) {
		this.viewportheight = this.viewportwidth/(0.98*aspect);
		this.viewportyofs = 0.5*(this.canvas.height - this.viewportheight);
	}
}

JGCanvas.prototype.setFrameskip = function(value) {
	this.frameskip = value;
}


// returns: true = fullscreen is now enabled, false = disabled
JGCanvas.prototype.toggleFullscreen = function() {
	var el = this.canvas;
	if (document.fullscreenElement
	|| document.mozFullScreenElement  /*sic*/
	|| document.webkitFullscreenElement
	|| document.msFullscreenElement) {
		if (document.exitFullScreen) {
			document.exitFullScreen();
		} else if (document.mozCancelFullScreen) { /* Firefox */
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {/* Chrome, Safari and Opera */
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) { /* IE/Edge */
			document.msExitFullscreen();
		}
		return false;
	} else {
		if (el.requestFullScreen) {
			el.requestFullScreen();
			return true;
		} else if (el.mozRequestFullScreen) { /* Firefox */
			el.mozRequestFullScreen();
			return true;
		} else if (el.webkitRequestFullscreen) {/* Chrome, Safari and Opera */
			el.webkitRequestFullscreen();
			return true;
		} else if (el.msRequestFullscreen) { /* IE/Edge */
			el.msRequestFullscreen();
			return true;
		}
	}
	return false;
}

