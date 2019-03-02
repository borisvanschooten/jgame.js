/* Copyright (c) 2014-2016 by Boris van Schooten tmtg.net boris@13thmonkey.org*/
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine


/* Polyfills (maybe move to different file later) */

// IE polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

/**
* @param {float} min - lower bound
* @param {float} max - upper bound exclusive
* @return {float}
*/
function random(min, max) {
	return min + Math.random()*(max-min);
}
/**
* @param {float} min - lower bound
* @param {float} max - upper bound exclusive
* @param {float} interval - step size
* @return {float}
*/
function randomstep(min, max, interval) {
	var steps = Math.floor(0.00001 + (max-min)/interval);
	return min + ( Math.floor(Math.random()*(steps+0.99)) )*interval;
}

function typecheckInt(value,name) {
	if (isNaN(value) || !isFinite(value) || value%1 != 0) {
		console.log("Type error: "+name+" is not an integer (value='"+value+"')");
		if (console.trace) console.trace();
		return false;
	}
	return true;
}

function typecheckNumber(value,name) {
	if (isNaN(value) || !isFinite(value)) {
		console.log("Type error: "+name+" is not a number (value='"+value+"')");
		if (console.trace) {
			console.trace();
		}
		return false;
	}
	return true;
}


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



// canvas - canvas to register events on
function JGCanvas(canvas,logicalwidth,logicalheight) {
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

	this.frameskip = false;

	this.sawtouchevents = false;
	this.sawmouseevents = false;

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
			object.sawtouchevents = true;
			object.mousebutton[1] = true;
			object._jgtouchmove(event);
			object.mouseinside = true;
			// prevent touch behaviour that interferes with game
			event.preventDefault();
		}, false);
	canvas.addEventListener('touchmove',
		function(event) {
			object.sawtouchevents = true;
			//object.mousebutton[1] = true;
			object._jgtouchmove(event);
			object.mouseinside = true;
			// prevent touch behaviour that interferes with game
			event.preventDefault();
		}, false);
	canvas.addEventListener('touchend',
		function(event) {
			object.sawtouchevents = true;
			object.mousebutton[1] = false;
			object._jgtouchmove(event);
			object.mouseinside = false;
			// prevent touch behaviour that interferes with game
			event.preventDefault();
		}, false);
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


// input

JGCanvas.prototype._jgkeydown = function (event) {
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
	if (event.touches.length >= 1) {
		var touch = event.touches[0];
		//console.log("##############TOUCH "+touch.pageX + " "+touch.pageY);
		this.mousex = (touch.pageX - rect.left - this.viewportxofs) 
			/ (this.viewportwidth / this.width);
		this.mousey = (touch.pageY - rect.top - this.viewportyofs) 
			/ (this.viewportheight / this.height);
	}
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

