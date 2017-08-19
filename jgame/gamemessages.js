// Generic message system. Handles positioning of elements, timing, easing,
// dialogs. 


// Message fields:
// type - scrolling: multiple messages can be displayed below each other,
//                   easing is used when messages disappear
//        popup: only one high priority message at a time. Scrolling messages
//               are paused when displaying popup
//        dialog: like popup, but needs to be dismissed by user
// duration - duration in game ticks
// chunks - array of elements to pass to drawChunk. Each element is an
//          associative array with at least the follwing fields:
//          - height - height of message as used for drawbg and vertical spacing
//          - draw() - function(xcen,ytop,easing,chunk)
// easing.in - duration of start phase >= 1
// easing.out - duration of end phase >= 1

// easing has the following fields:
// stage - "start", "middle", "end"
// phase - goes from 0 to 1
// alpha - goes from 0 to 1 at start, from 1 to 0 at end


// x - center
// y - top
// margin - vertical space hetween queued messages
// drawbg - function(xcen,ytop,easing,msgtype,height)
// icons - { audio: {x,y,width,height}, manual: {x,y,width,height} },
//         default if not defined
function GameMessages(x,y,margin,drawbg,icons) {
	this.x = x;
	this.y = y;
	this.margin = margin;
	this.drawbg = drawbg;
	this.diaqueue = []; // dialogs
	this.popqueue = []; // popups
	this.scrqueue = []; // scrolling messages queue
	this.popup = null;
	this.dialog = null;
	this.prevmousebutton=false;
	this.manual = {
		lastsection: null,
		icontimer: 0,
		iconeasing: 0
	}
	this.audio = {
		iconeasing: 0
	}
	this.switchtex = null;
	if (icons) {
		this.icons = icons;
	} else {
		this.icons = {
			manual: { x:0,y:0, width:144,height:144 },
			audio: { x:144,y:0, width:144,height:144 },
		};
	}
}

GameMessages.prototype.clear = function() {
	this.diaqueue = [];
	this.popqueue = [];
	this.scrqueue = [];
	this.popup = null;
	this.dialog = null;
}

GameMessages.prototype.addMessage = function(msg,chunktemplate) {
	// fill in chunk template fields not defined in each chunk
	if (chunktemplate) {
		for (var i=0; i<msg.chunks.length; i++) {
			for (var key in chunktemplate) {
				val = chunktemplate[key];
				if (msg.chunks[i][key] == undefined)
					msg.chunks[i][key] = val;
			}
		}
	}
	if (msg.duration) {
		msg._expiry = msg.duration;
		msg._maxexpiry = msg.duration;
	}
	msg._fadingin = msg.easing.in;
	msg._maxfadingin = msg.easing.in;
	if (msg.type == "scrolling") {
		this.scrqueue.push(msg);
	} else if (msg.type == "popup") {
		this.popqueue.push(msg);
	} else { // dialog
		this.diaqueue.push(msg);
	}
}

// returns true if waiting for dialog
GameMessages.prototype.inModal = function() {
	return this.dialog!=null;
}

// call every frame from an appropriate part of your code
GameMessages.prototype.update = function(eng) {
	var msgs = this._getCurMsgs();
	for (var i=0; i<msgs.length; i++) {
		var msg = msgs[i];
		if (!msg._fadingout) {
			if (msg._fadingin) {
				if (--msg._fadingin <= 0) msg._fadingin = 0;
			}
			if (msg.type=="dialog") {
				if (!this.prevmousebutton 
				&& (eng.getMouseButton(1) || eng.getKey(' ')) ) {
					msg._fadingout = msg.easing.out;
					msg._maxfadingout = msg._fadingout;
				}
			} else if (msg._expiry) { // popup or queue
				msg._expiry--;
				if (msg._expiry <= 0) {
					msg._expiry = 0;
					msg._fadingout = msg.easing.out;
					msg._maxfadingout = msg._fadingout;
				}
			}
		} else {
			msg._fadingout--;
			if (msg._fadingout<=0) {
				msg._fadingout = 0;
				msg._expiry = 0;
				if (msg.type=="dialog") {
					this.dialog = null;
				} else if (msg.type == "popup") {
					this.popup = null;
				} else { // scrolling
					for (var i=0; i<this.scrqueue.length; i++) {
						if (this.scrqueue[i] == msg) {
							this.scrqueue.splice(i,1);
							break;
						}
					}
				}
			}
		}
	}
	this.prevmousebutton = eng.getMouseButton(1) || eng.getKey(' ');
	if (!this.dialog) {
		if (this.diaqueue.length > 0) {
			this.dialog = this.diaqueue.shift();
		}
	}
	if (!this.popup) {
		if (this.popqueue.length > 0) {
			this.popup = this.popqueue.shift();
		}
	}
}

GameMessages.prototype._getCurMsgs= function() {
	var msgs = [];
	if (this.dialog) {
		msgs = [this.dialog];
	} else if (this.popup) {
		msgs = [this.popup];
	} else {
		msgs = this.scrqueue;
	}
	return msgs;
}


// call every draw frame from an appropriate part of your code
GameMessages.prototype.paint = function(gl,chunkmask) {
	var msgs = this._getCurMsgs();
	var cury = this.y;
	var prevy = cury;
	var y_easing = 0;
	for (var i=0; i<msgs.length; i++) {
		var nexty = cury;
		var msg = msgs[i];
		for (var j=0; j<msg.chunks.length; j++) {
			nexty += msg.chunks[j].height;
		}
		var easing = {
			stage: "middle",
			phase: 1,
			alpha: 1
		};
		if (msg._fadingout) {
			easing.stage = "end";
			easing.phase = 1.0 - msg._fadingout/msg._maxfadingout;
			easing.alpha = msg._fadingout/msg._maxfadingout;
			if (i==0) y_easing = easing.phase;
		} else if (msg._fadingin) {
			easing.stage = "start";
			easing.phase = 1.0 - msg._fadingin/msg._maxfadingin;
			easing.alpha = easing.phase;
			//if ((this.maxexpiry - this.expiry) < msg.easing.in) {
			//	easing.phase = (this.maxexpiry - this.expiry) / msg.easing.in;
			//	easing.alpha = easing.phase;
			//}
		}
		var drawy = i==0 ? cury : (1.0-y_easing)*cury + y_easing*prevy;
		this.drawbg(this.x,drawy,easing,msg.type,nexty-cury);
		for (var j=0; j<msg.chunks.length; j++) {
			if (!chunkmask || !msg.chunks[j].id
			||  (chunkmask & msg.chunks[j].id) ) {
				msg.chunks[j].draw(this.x,drawy,easing,msg.chunks[j]);
			}
			drawy += msg.chunks[j].height;
		}
		prevy = cury;
		cury = nexty + this.margin;
	}
}

// helpers

GameMessages.prototype.checkMouse = function(eng,coords) {
	return (eng.getMouseX() > coords.x
	&&  eng.getMouseX() < coords.x+coords.width
	&&  eng.getMouseY() > coords.y
	&&  eng.getMouseY() < coords.y+coords.height);
}

// displays instructions first time, otherwise displays "i" icon
// cascade = true -> more displayManual calls following
// drawfunc(easing), easing=0 -> normal, easing=1 -> enlarged
// show_i_callback: called once every time an "i" is displayed
GameMessages.prototype.displayManual =
function(section,cascade,eng,GameState,gamestate_loaded,drawfunc,
show_i_callback) {
	if (!gamestate_loaded) return; // do not update game state until loaded
	if (section!=this.manual.lastsection) {
		this.manual.icontimer=0;
	}
	this.manual.lastsection = section;
	if (!GameState.instructions) GameState.instructions = {};
	if (!GameState.instructions[section]) {
		window["displayManual"+section]();
		GameState.instructions[section] = true;
	} else if (!this.inModal()) {
		if (this.manual.icontimer == 0 && show_i_callback) show_i_callback();
		this.manual.icontimer++;
		if (!cascade 
		&& (this.manual.icontimer >= 250
		    || Math.floor(this.manual.icontimer/30)%2 == 0)
		) {
			drawfunc(this.manual.iconeasing);
		}
		if (this.checkMouse(eng,this.icons.manual)) {
			if (this.manual.iconeasing < 1) this.manual.iconeasing += 0.1;
			if (eng.getMouseButton(1) ) {
				if (!cascade) eng.clearMouseButton(1);
				window["displayManual"+section]();
			}
		} else {
			if (this.manual.iconeasing > 0) this.manual.iconeasing -= 0.1;
		}
	}
}

// displays audio enable/disable icon which toggles audio when clicked
// setting is stored in GameState.audio.enable
// drawfunc(enabled,easing)
//     enabled == audio currently enabled
//     easing=0 -> normal, easing=1 -> enlarged
GameMessages.prototype.displayAudioEnable = function(eng,GameState,drawfunc,
togglefunc) {
	if (GameState.audioEnabled == undefined)
		GameState.audioEnabled = true;
	if (!this.inModal()) {
		drawfunc(GameState.audioEnabled,this.audio.iconeasing);
		if (this.checkMouse(eng,this.icons.audio)) {
			if (this.audio.iconeasing < 1) this.audio.iconeasing += 0.1;
			if (eng.getMouseButton(1) ) {
				eng.clearMouseButton(1);
				GameState.audioEnabled = !GameState.audioEnabled;
				togglefunc(GameState.audioEnabled);
			}
		} else {
			if (this.audio.iconeasing > 0) this.audio.iconeasing -= 0.1;
		}
	}
}

// show switch, like basic/full graphics switch and game on/off.
// switch sprites must be in local images/ directory
// eng - input module for getting mouse events
// GameState[variable] contains the state (true, false).
// variable==null indicates no variable
// fontbatch - spritebatch for drawing fonts
// coords {x,y,width,height} of image
// title1,2 - title text to display
// callback - function to call when switch is changed. parameter: state
GameMessages.prototype.displaySwitch = function(eng,GameState,
variable,defaultvalue,callback, fontbatch,coords,title1,title2) {
	if (!this.switchtex) {
		this.switchtex = {
			on:  initTexture(gl,"images/switch-3-256-aan.png",true,false),
			off: initTexture(gl,"images/switch-3-256-uit.png",true,false),
		};
	}
	var state = variable ? GameState[variable] : null;
	if (state!==true && state!==false) {
		state = defaultvalue;
	}
	var xcen = coords.x + coords.width/2;
	var ycen = coords.y + coords.height/2;
	drawSprite(xcen, ycen, coords.width, coords.height, 0.0,
		state ? this.switchtex.on : this.switchtex.off,null,null,false);
	drawSpriteText(fontbatch,title1,xcen,ycen-coords.height*1.1,
		35,35, 0, 0.25, null);
	drawSpriteText(fontbatch,title2,xcen,ycen-coords.height*0.7,
		35,35, 0, 0.25, null);
	//drawSpriteText(fontbatch,ontext,coords.xcen-coords.width*1.1,coords.ycen,
	//	40,40, 1, 0.25, null);
	//drawSpriteText(fontbatch,offtext,coords.xcen+coords.width*1.1,coords.ycen,
	//	40,40, -1, 0.25, null);
	if (this.checkMouse(eng,coords)) {
		if (eng.getMouseButton(1) ) {
			eng.clearMouseButton(1);
			if (variable) {
				GameState[variable] = !state;
			}
			if (callback) callback(!state);
		}
	}
}

// show button.
// button sprite must be in local images/ directory
// eng - input module for getting mouse events
// filename - name of texture to display
// coords {x,y,width,height} of image
// callback - function to call when switch is changed. parameter: state
GameMessages.prototype.displayButton = function(eng,callback, filename,
fontbatch,coords,title){
	if (!this.buttontex) {
		this.buttontex = initTexture(gl,filename,true,false);
	}
	var xcen = coords.x + coords.width/2;
	var ycen = coords.y + coords.height/2;
	drawSprite(xcen, ycen, coords.width, coords.height, 0.0,
		this.buttontex,null,null,false);
	if (fontbatch && title) {
		drawSpriteText(fontbatch,title,xcen,ycen-coords.height*0.6,
			25,25, 0, 0.35, null);
	}
	if (this.checkMouse(eng,coords)) {
		if (eng.getMouseButton(1) ) {
			eng.clearMouseButton(1);
			if (callback) callback();
		}
	}
}


