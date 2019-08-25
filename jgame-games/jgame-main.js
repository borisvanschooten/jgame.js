/** JGame standard game layout functions. 
*/

// jgame-main.js TODO:

// implement lives 
// clean up draw phase functions
// make collisions configurable
// make title font color, mouse color configurable

// IDE:
// tinyspriteeditor can import/export spritesheet and tilemap json


// ---------------------------------------------------------------------
// GLOBALS. Useful variables for your game.
// ---------------------------------------------------------------------


/** Logical screen size in pixels (fixed, don't change).
* All draw operations use coordinates in this coordinate system.  */
var width=1920, height=1080;

/** handle to canvas input */
var eng;

/** GL context */
var gl;


/** Time since start of level */
var gametime=0;
/** time since start of game */
var totalgametime=0;

var frameskip=0;

/** (difficulty) level */
var level=0;
/** reference to level structure */
var thislevel=null;
/** reference to leveldef structure */
var thisleveldef=null;


// currenty unused TODO for infinite levels type games
var stage=0;

// currently unused TODO for games with lives
var lives=3;


var spritesheet_tex;
var spritesheet2_tex=null;
var particlesheet_tex;
var font_tex;
var tiles_tex;


var mousepointer_tex;

var spritebatch, spritebatch2, particlebatch, fontbatch;

// scroll offsets, subtract from coordinates when drawing sprites
var screenxofs = 0,screenyofs = 0;

/** tilemap is created at start of level. Use this to manipulate the tilemap.*/
var tilemap=null;
/** Tile width, height in logical screen pixels. Is derived from tilemap. */
var tilex=90,tiley=90;
/**  in physical coordinates. Is derived from tilemap. */
var nrtilesx,nrtilesy;

// font color of several standard texts
// XXX is currently hardwired to color cycle
var font_color = [1,1,1,1];


var GameConfig=null;

/** stores persistent data. You can add your own as needed. */
var GameState = {
	levels: {}, /* levelnr: { complete:true, score: 0 } */
	instructions: {}
}

/** root directory of game code and assets */
var gamedir="";


/** indicates that gamepad is available */
var gamepadcontrols = false;
/** indicates that touch screen is available */
var touchcontrols = false;

// XXX MenuObj depends on this. Move to JGInput.
var mousebutflank=false;


// gamepad state, move to jginput.

var gamepad = {
	/** move (analog left stick) */
	mx: 0, 
	my: 0,
	/** fire (analog right stick) */
	fx: 0,
	fy: 0,
	/** digital pad */
	dx: 0,
	dy: 0,
	/** true = one of the main buttons is pressed */
	but: false,
	buta: false,
	butb: false,
	butx: false,
	buty: false,
}

// some useful defs

var cyclecol = [
	[1, 0.5, 0.5, 1],
	[1, 1, 0.5, 1],
	[0.5, 1, 0.5, 1],
	[0.5, 1, 1, 1],
	[0.5, 0.5, 1, 1],
	[1, 0.5, 1, 1],
];

var unit_arrow = [
	0, -1,
	-1,0,
	-0.5,0,
	-0.5,1,
	0.5,1,
	0.5,0,
	1,0,
];



// ---------------------------------------------------------------------
// GLOBAL FUNCTIONS. Useful functions for your game.
// ---------------------------------------------------------------------

/** Get handle to texture as defined in GameConfig.textures for GL operations */
function getTexture(texid) {
	return TexLoader.texById[texid];
}


/** Get realtime taken since start of level in seconds */
function getGameTimeTaken() {
	if (SG.gameendtimestamp) {
		return SG.gameendtimestamp - SG.gamestarttimestamp;
	} else {
		return new Date().getTime() - SG.gamestarttimestamp;
	}
}

/** Convert time in seconds to human readable string */
function timestampToString(time) {
	var min = Math.floor(time/1000/60);
	var sec = Math.floor(time/1000) - 60*min;
	return min + ":" + (sec<10 ? "0" : "") + sec;
}


/** Returns true once every period frames (1 frame = 1/60 sec) between start
 * and end. */
function checkTime(start,end,period) {
	return (gametime >= start && gametime < end && gametime%period<gamespeed);
}


// ---------------------------------------------------------------------
// easing functions, XXX where do these go? Should be configurable
// ---------------------------------------------------------------------

// override easing function
MenuObj.prototype.easingFunc = function(phase) {
	return {
		xsize: 1.0 - Math.sin(phase*Math.PI*0.5),
		ysize: 1.0 - Math.sin(phase*Math.PI*0.5),
		angle: -2.0*phase
	};
}

function texteasing(timer) {
	if (timer < 20) return {size:1, alpha: timer/20};
	if (timer < 400) return {size:1, alpha:1.0};
	return {
		size: 1.5 + 3*((timer-400)/30),
		alpha: 1.0// - (timer-110)/20
	};
}


// ---------------------------------------------------------------------
// Standard Game object encapsulating all internal stuff
// ---------------------------------------------------------------------

function StdGame() {
	// init globals
	gametime=0;
	totalgametime=0;
	thislevel=null;
	thisleveldef=null;

	// init internal variables
	this.gamebasespeed = 1000/60;
	this.lastTime = 0;
	this.timeElapsed = 1000/60;
	this.gamespeed=1.0;

	this.startlevel=0;

	this.gamestarttimestamp=0;
	this.gameendtimestamp=0; // 0 indicates game has not ended yet

	this.prevmousebut=false,curmousebut=false;

	this.targetxofs = -1, targetyofs = -1;
	this.scrollspeedx = 0, scrollspeedy = 0;

	this.bgxofs = 0;

	this.gamemsgs=null;
	this.apiAccessToken=null;
	this.persistentstate=null;
	this.gamestate_loaded=false;
	this.pausedWebGL = false;
}



StdGame.prototype.resizeCanvas = function() {
	var canvas = document.getElementById("game-canvas");
	if (document.fullscreenElement
	||  document.mozFullScreen || document.webkitIsFullScreen) {
		//alert("fullscreen");
		canvas.style.width = window.innerWidth;
		canvas.style.height = window.innerHeight;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	} else {
		//alert("!fullscreen");
		canvas.style.width = canvas.parentNode.offsetWidth;
		canvas.style.height = canvas.parentNode.offsetHeight;
		canvas.width = canvas.parentNode.offsetWidth;
		canvas.height = canvas.parentNode.offsetHeight;
	}
}



StdGame.prototype.webGLStart = function() {
	if (!GameConfig) return;
	if (GameConfig.gamedir) gamedir = GameConfig.gamedir;
	JGAudio.setRootDir(gamedir);
	setTextureRootDir(gamedir);

	//if (window.navigator.paymentSystem) 
	//	window.navigator.paymentSystem.init("f2ab665e-217f-41fc-98d6-bbdaa6ced57c");
	window.addEventListener('resize', this.resizeCanvas, false);
	// init gl
	var canvas = document.getElementById("game-canvas");
	this.resizeCanvas();
	gl = createGL(canvas, {antialias:true, premultipliedAlpha: false,powerPreference: "high-performance"});
	// use this to show verbose debug info in console
	//gl = WebGLDebugUtils.makeDebugContext(gl);

	eng = new JGCanvas(canvas,width,height);
	JGState.set("Loading",-1);

	gldrawInit();

	this.gamemsgs=new GameMessages(width/2,0.05*height,0.02*height,this.drawGameMsgBG);

	//ld33bg = new CustomBG();
	this.apiAccessToken = PersistentState.getUrlParameter("token");
	this.persistentstate = new PersistentState(
		null, //"https://tmtg.net/api/",
		this.apiAccessToken);

	if (PersistentState.getUrlParameter("resetgame")) {
		this.persistentstate.clear(GameConfig.name);
	}

	var self = this;
	this.persistentstate.read(GameConfig.name,function(state) {
		if (state) GameState = state;
		self.gamestate_loaded=true;
	});

	//JGAudio.load("error","sounds/164245__soniktec__metallic-sound-pack-1_cc_0");
	//JGAudio.load("failure","sounds/165313__ani-music__high-arp-in-g-8-bit-ish_cc_0");
	//JGAudio.load("start","sounds/277033-ui-completed-status-alert-notification-sfx001-stretch");

	for (var id in GameConfig.sounds) {
		var file = GameConfig.sounds[id];
		JGAudio.load(id,file);
	}

	// TODO check how this works with SG.getLevelInfo("tilemap") used elsewhere
	if (GameConfig.tilemap) {
		tiles_tex=initTexture(gl,
			GameConfig.tilemap.texture.url,
			GameConfig.tilemap.texture.smooth,
			GameConfig.tilemap.texture.wrap);
	}
	spritesheet_tex=initTexture(gl,
		GameConfig.spritesheet.texture.url,
		GameConfig.spritesheet.texture.smooth,
		GameConfig.spritesheet.texture.wrap);
	if (GameConfig.spritesheet2) {
		spritesheet2_tex=initTexture(gl,
			GameConfig.spritesheet2.texture.url,
			GameConfig.spritesheet2.texture.smooth,
			GameConfig.spritesheet2.texture.wrap);
	}
	for (var texid in GameConfig.textures) {
		var texinfo = GameConfig.textures[texid];
		if (TexLoader.texByURL[texinfo.url]) continue;
		console.log("Loading image "+texid+" from "+texinfo.url);
		TexLoader.load(gl,texid,texinfo.url,texinfo.smooth,texinfo.wrap,true);
	}

	// still hardcoded
	particlesheet_tex = initTexture(gl,"images/hudsprites.png",true,false);
	mousepointer_tex = initTexture(gl,"images/mousepointer-256.png",true,false);
	font_tex = initTexture(gl,"images/cellfontdejavusansmono-outline.png",true,false);

	spritebatch = new JGSpriteBatch(gl,spritesheet_tex,
		GameConfig.spritesheet.countx*GameConfig.spritesheet.unitx,
		GameConfig.spritesheet.county*GameConfig.spritesheet.unity, [
		{x: 0,y: 0, 
			width:GameConfig.spritesheet.unitx,
			height:GameConfig.spritesheet.unity
		}
	] );
	if (spritesheet2_tex) {
		spritebatch2 = new JGSpriteBatch(gl,spritesheet2_tex,
			GameConfig.spritesheet2.countx*GameConfig.spritesheet2.unitx,
			GameConfig.spritesheet2.county*GameConfig.spritesheet2.unity, [
			{x: 0,y: 0, 
				width:GameConfig.spritesheet2.unitx,
				height:GameConfig.spritesheet2.unity
			}
		] );
	}

	particlebatch = new JGSpriteBatch(gl,particlesheet_tex,1024,1024, [
		{x: 0,y: 0, width:256,height:256}
	] );

	fontbatch = new JGSpriteBatch(gl,font_tex,512,512, [
		{x: 0,y: 0, width:32,height:48}
	] );

	// get tilemap defaults if defined, so they can be used in the title screen
	if (GameConfig.tilemap) {
		if (GameConfig.tilemap.tilex) tilex = GameConfig.tilemap.tilex;
		if (GameConfig.tilemap.tiley) tiley = GameConfig.tilemap.tiley;
		if (GameConfig.tilemap.nrtilesx) nrtilesx = GameConfig.tilemap.nrtilesx;
		if (GameConfig.tilemap.nrtilesy) nrtilesy = GameConfig.tilemap.nrtilesy;
	}

	if (GameConfig.initGame) GameConfig.initGame();

	// start animation
	this.webGLFrame();
}


StdGame.prototype.webGLFrame = function() {
	// anim handling
	if (!SG.pausedWebGL) requestGLFrame(SG.webGLFrame);

	var timeNow = new Date().getTime();
	if (this.lastTime != 0) {
		this.timeElapsed = timeNow - this.lastTime;
		this.gamespeed = this.timeElapsed / this.gamebasespeed;
		this.gamespeed = 1.0;
		gametime += this.gamespeed;
		totalgametime += this.gamespeed;
	}
	this.lastTime = timeNow;
	if (this.timeElapsed >= 1000/32) {
		frameskip=1;
		SG.doWebGLFrame();
		this.lastTime = new Date().getTime();
		gametime += this.gamespeed;
		totalgametime += this.gamespeed;
	}
	frameskip=0;
	SG.doWebGLFrame();
}

StdGame.prototype.doWebGLFrame = function() {

	// update touch controls
	touchcontrols = eng.sawTouchEvents();

	// read gamepads
	gamepadcontrols = false;
	gamepad.mx = 0;
	gamepad.my = 0;
	gamepad.fx = 0;
	gamepad.fy = 0;
	gamepad.dx = 0;
	gamepad.dy = 0;
	gamepad.but = false;
	gamepad.buta = false;
	gamepad.butb = false;
	gamepad.butx = false;
	gamepad.buty = false;
	if (navigator.getGamepads) {
		var pads = navigator.getGamepads();
		// circumvent error in Chrome, which returns an array-like
		// thing on desktop that doesn't actually contain elements
		if (pads.length > 0 && pads[0]) {
			gamepadcontrols = true;
			// add up all values from all axes
			for (var i=0; i<pads.length; i++) {
				// detect shield controller, has different axes
				var nvidiaShield =
					pads[i].id.substr(0,16) == "0955-7214-NVIDIA";
				// circumvent possible errors
				if (!pads[i] || !pads[i].axes || !pads[i].buttons) continue;
				if (pads[i].axes[0] > 0.25 || pads[i].axes[0] < -0.25)
					gamepad.mx += pads[i].axes[0];
				if (pads[i].axes[1] > 0.25 || pads[i].axes[1] < -0.25)
					gamepad.my += pads[i].axes[1];
				if (pads[i].axes[2] > 0.25 || pads[i].axes[2] < -0.25)
					gamepad.fx += pads[i].axes[2];
				if (nvidiaShield) {
					if (pads[i].axes[5] > 0.25 || pads[i].axes[5] < -0.25)
						gamepad.fy += pads[i].axes[5];
				} else {
					if (pads[i].axes[3] > 0.25 || pads[i].axes[3] < -0.25)
						gamepad.fy += pads[i].axes[3];
				}
				for (var b=0; b<4; b++) {
					if (pads[i].buttons[b].pressed) gamepad.but=true;
				}
				if (pads[i].buttons[0].pressed) gamepad.buta=true;
				if (pads[i].buttons[1].pressed) gamepad.butb=true;
				if (pads[i].buttons[2].pressed) gamepad.butx=true;
				if (pads[i].buttons[3].pressed) gamepad.buty=true;
				if (nvidiaShield) {
					gamepad.dx = pads[i].axes[8];
					gamepad.dy = pads[i].axes[9];
				} else {
					if (pads[i].buttons[12] && pads[i].buttons[12].pressed)
						gamepad.dy = -1;
					if (pads[i].buttons[13] && pads[i].buttons[13].pressed)
						gamepad.dy =  1;
					if (pads[i].buttons[14] && pads[i].buttons[14].pressed)
						gamepad.dx = -1;
					if (pads[i].buttons[15] && pads[i].buttons[15].pressed)
						gamepad.dx =  1;
				}
			}
		}
	}



	// init gl

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.BLEND);
	//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	//gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
	//gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
	//	gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	// clear entire canvas
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT);
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// then set viewport to preserve aspect ratio
	eng.updateViewport();
	gl.viewport(eng.viewportxofs,eng.viewportyofs,eng.viewportwidth,eng.viewportheight);


	drawLineInitFrame(width,height);
	drawLineSegmentsInitFrame(width,height);
	drawSpriteInitFrame(width,height);

	if (JGState.isIn("Game")) {
		//ld33bg.draw(bg_texs[stage%bg_texs.length],gametime);
	}

	if (JGState.isIn("Title")) {
		//ld33bg.draw(bg_texs[0],gametime);
	}


	spritebatch.clear();
	if (spritebatch2) spritebatch2.clear();
	particlebatch.clear();
	fontbatch.clear();

	if (!JGState.isIn("Game")) {
		this.gamemsgs.displayAudioEnable(eng,GameState,this.drawAudioIcon,this.toggleAudio);
	}


	// game states:
	// Title - title screen
	// Game - remains active from start game till game over
	// During Game, the following states are found:
	//   NewLevel - start new level sequence
	//   LevelDone - finish current level sequence
	//   NewLife - start with new life sequence
	//   LifeLost - lose life sequence
	//   GameOver - game over sequence
	JGState.handleGameStates(1,frameskip);

	this.gamemsgs.update(eng);

	if (!frameskip) {
		var pointerx = eng.getMouseX();
		var pointery = eng.getMouseY();
		font_color = 
			[0.5+0.5*Math.sin(gametime*0.2),
			 0.5+0.5*Math.sin(gametime*0.164),
			 0.5+0.5*Math.sin(gametime*0.111), 1];
		/*if (JGState.isIn("Title")) {
			font_color = [0,0,0,1];
		} else if (stage%4==2) {
			font_color = [1,1,1,1];
		} else {
			font_color = [0,0,0,1];
		}*/
		//drawSpriteText(fontbatch,""+score,100,60,40,40,-1,0.25);
		//drawSpriteText(fontbatch,""+leveltimer,width/2,60,40,40,0,0.25);

		// mouse cursor

		var ang = Math.PI + Math.PI/4;
		var player = null;//JGObject.getObject("player");
		if (player) {
			if (player.fireofsx!=0 || player.fireofsy!=0) {
				pointerx = player.x + player.fireofsx - screenxofs;
				pointery = player.y + player.fireofsy - screenyofs;
				//console.log("######"+pointerx+" "+pointery);
			}
			ang = Math.atan2(pointerx - player.x + screenxofs,
							 pointery - player.y);
		}

		this.gamemsgs.paint(gl,1); // draw text

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		if (GameConfig.setupSpriteDraw) GameConfig.setupSpriteDraw();
		spritebatch.draw(gl);
		if (spritebatch2) spritebatch2.draw(gl);
		if (GameConfig.paintOverSprites) GameConfig.paintOverSprites();

		if (GameConfig.tilemapOnTop && JGState.isIn("Game")) {
			if (tilemap) tilemap.draw(gl,screenxofs,screenyofs);
		}

		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		particlebatch.draw(gl);
		fontbatch.draw(gl);
		//if (GameConfig.fn.drawOverlay) GameConfig.fn.drawOverlay(gl);
		this.gamemsgs.paint(gl,2); // draw images
		gl.disable(gl.BLEND);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		if (!gamepadcontrols && !touchcontrols) {
			var color;
			if (GameConfig.mouse && GameConfig.mouse.color) {
				color = GameConfig.mouse.color;
			} else {
				color = hsv_to_rgb(gametime/100,0.7,1, 1);
			}
			var pointersize = {
				x: 64,
				y: 64,
			}
			if (GameConfig.mouse && GameConfig.mouse.pointerSize) {
				pointersize = GameConfig.mouse.pointerSize;
			}
			var center = false;
			if (GameConfig.mouse && GameConfig.mouse.centerPointer) center=true;
			//var color = cyclecol[Math.floor(gametime/8) % cyclecol.length];
			drawSprite(pointerx,pointery, pointersize.x, pointersize.y,
				0.0, mousepointer_tex,
				null, color, !center);
			//particlebatch.addSprite(0,pointerx,pointery,true,
			//	96, 96, 0.0, color);
			//gl.enable(gl.BLEND);
			//drawLine([pointerx,pointery], Math.PI-ang, 20.0, 4,
			//	color, unit_arrow, unit_arrow.length/2, true, "unit_arrow");
			//gl.disable(gl.BLEND);
		}
	}
	this.prevmousebut = this.curmousebut;
	this.curmousebut = !this.gamemsgs.inModal() && eng.getMouseButton(1);
	mousebutflank = this.curmousebut && !this.prevmousebut;
}


// call to start a new game
StdGame.prototype.startNewGame = function(continuegame) {
	JGState.set("Game",-1);
	JGState.add("NewLevel",450);
	if (continuegame) return;
	if (GameConfig.score && GameConfig.score.reset
	&&  GameConfig.gamemode && GameConfig.gamemode!="separate-levels") {
		GameConfig.score.reset();
	}
}

StdGame.prototype.drawScenery=function(speedscale,globalxofs,globalyofs,scene) {
	if (!scene) return;
	// draw background
	if (scene.bg!=null) {
		drawSprite(0,0,width,height, 0.0, 
			getTexture(scene.bg), null, null, true);
	}
	// draw X repeating layers
	for (var i=0; i<scene.layers.length; i++) {
		var layer = scene.layers[i];
		var scale = layer.scale;
		var xofs = layer.xofs - speedscale*scale*globalxofs;
		if (!scene.vertical) {
			while (xofs > 0) xofs -= layer.w*scale;
		}
		var yofs = layer.yofs - speedscale*scale*globalyofs;
		if (scene.vertical) {
			while (yofs > 0) yofs -= layer.h*scale;
		}
		if (scene.vertical) {
			while (yofs < height) {
				drawSprite(xofs,yofs,layer.w*scale,layer.h*scale, 0.0, 
					getTexture(layer.tex),
					null,
					layer.col, true);
				yofs += layer.h*scale;
			}
		} else {
			while (xofs < width) {
				drawSprite(xofs,yofs,layer.w*scale,layer.h*scale, 0.0, 
					getTexture(layer.tex),
					null,
					layer.col, true);
				xofs += layer.w*scale;
			}
		}
	}
}

StdGame.prototype.updateScreenOfs = function(x,y) {
	if (!tilemap) {
		screenxofs = 0;
		screenyofs = 0;
	}
	if (x===undefined || y===undefined) {
		var objtofollow;
		if (GameConfig.scroll) objtofollow = GameConfig.scroll.followObject;
		// object not defined -> default
		if (objtofollow === undefined) objtofollow = "player";
		// no coords and object set to null -> disabled
		if (!objtofollow) return;
		var player = JGObject.getObject(objtofollow);
	} else {
		player = {x:x, y:y};
	}
	if (player) {
		this.targetxofs = player.x - width/2 + 0.5*tilex + thisleveldef.playerofs.x;
		if (this.targetxofs < 0) this.targetxofs = 0;
		var maxofs = tilemap.tilex*tilemap.nrtilesx-width;
		if (this.targetxofs > maxofs) this.targetxofs = maxofs;
		this.targetyofs = player.y - height/2 + 0.5*tiley + thisleveldef.playerofs.y;
		if (this.targetyofs < 0) this.targetyofs = 0;
		maxofs = tilemap.tiley*tilemap.nrtilesy-height;
		if (this.targetyofs > maxofs) this.targetyofs = maxofs;
	} else {
		this.targetxofs = -1;
		this.targetyofs = -1;
	}
	var accel = 0.07;
	if (GameConfig.scroll && GameConfig.scroll.speed)
		accel = GameConfig.scroll.speed;
	if (this.targetxofs != -1) {
		// x
		var diff = screenxofs - this.targetxofs;
		if ((diff>0 && this.scrollspeedx<0)
		||  (diff<0 && this.scrollspeedx>0)) {
			this.scrollspeedx = 0;
		}
		this.scrollspeedx = (1.0-accel)*this.scrollspeedx + accel*(-1.0*diff);
		if (this.scrollspeedx > 1.5*tilemap.tilex) this.scrollspeedx = 1.5*tilemap.tilex;
		if (this.scrollspeedx < -1.5*tilemap.tilex) this.scrollspeedx =-1.5*tilemap.tilex;
		if (Math.abs(this.scrollspeedx) > 0.002*tilemap.tilex) {
			screenxofs += this.scrollspeedx;
		}
		// y
		diff = screenyofs - this.targetyofs;
		if ((diff>0 && this.scrollspeedy<0)
		||  (diff<0 && this.scrollspeedy>0)) {
			this.scrollspeedy = 0;
		}
		this.scrollspeedy = (1.0-accel)*this.scrollspeedy + accel*(-1.0*diff);
		if (this.scrollspeedy > 0.5*tilemap.tiley) this.scrollspeedy = 0.5*tilemap.tiley;
		if (this.scrollspeedy < -0.5*tilemap.tiley) this.scrollspeedy =-0.5*tilemap.tiley;
		if (Math.abs(this.scrollspeedy) > 0.002*tilemap.tiley) {
			screenyofs += this.scrollspeedy;
		}
	}
}

// Get info for level by searching for given key.  The key should contain an
// associative array.
// Gets the info under the key from thislevel, thisleveldef, and GameConfig,
// and merges the associative arrays found, in the respective priority order.
StdGame.prototype.getLevelInfo = function(key) {
	var ret1={}, ret2={}, ret3={};
	if (thislevel && thislevel[key]) ret3 = thislevel[key];
	if (thisleveldef && thisleveldef[key]) ret2 = thisleveldef[key];
	if (GameConfig[key]) ret1 = GameConfig[key];
	var ret = MergeRecursiveCopy(ret1,ret2);
	var ret = MergeRecursive(ret,ret3);
	return ret;
}

// --------------------------------------------------------------------
// Messages / audio

StdGame.prototype.drawAudioIcon = function(enabled,easing) {
	particlebatch.addSprite(enabled ? 14:13,96+128,96,false,
		128+32*easing, 128+32*easing, 0.0, null);
}


StdGame.prototype.toggleAudio = function (enable) {
	if (typeof enable == 'undefined') return;
	if (enable) {
		JGAudio.enable();
	} else {
		JGAudio.disable();
	}
}



StdGame.prototype.drawGameMsgBG = function(xcen,ytop,easing,msgtype,bgheight) {
	var col;
	if (msgtype == "dialog") {
		col = [0.5,0.5,0.5,0.9*easing.alpha];
		bgheight = 0.94*height - ytop*2;
		drawSpriteText(fontbatch,
			touchcontrols ? "Touch to continue.":"Press space to continue.",
			xcen,ytop+bgheight-60, 50,50, 0,0.25,[1,1,1,easing.alpha]);
	} else {
		col = [1,1,1,0.5*easing.alpha];
	}
	particlebatch.addSprite(2,xcen,ytop+bgheight/2,false,
		0.95*width, bgheight, 0.0, col);
}

StdGame.prototype.drawManualChunk = function(xcen,ytop,easing,chunk) {
	if (chunk.image) {
		drawSprite(xcen,ytop+chunk.height/2,
			0.75*chunk.width,0.75*chunk.height, 0.0, 
			chunk.image,
			null, [1,1,1,easing.alpha], false);
	} else if (chunk.text) {
		drawSpriteText(fontbatch,chunk.text,xcen,ytop+chunk.textsize,chunk.textsize,chunk.textsize,0,0.25,[1,1,1,easing.alpha]);
	}
}

// currently unused
StdGame.prototype.displayManual = function(section,cascade) {
	this.gamemsgs.displayManual(section,cascade,eng,GameState,this.gamestate_loaded,
	function(easing) {
		particlebatch.addSprite(6,96,96,false,
			128+32*easing, 128+32*easing, 0.0, null);
	});
}


// currently unused, can be used to show new level message
StdGame.prototype.drawNewLevelChunk = function (xcen,ytop,easing,chunk) {
	var color = [font_color[0],font_color[1],font_color[2],easing.alpha];
	//drawSpriteText(fontbatch,"Get Ready!",width/2,450,90*ea.size,90*ea.size,0, 0.25,color);
	drawSpriteText(fontbatch,"Level "+(stage+1),xcen,ytop+100, 90,90, 0,0.25,color);
	
	//drawSpriteText(fontbatch,txt1,xcen,ytop+300,50,50,0,0.25,color);
	//drawSpriteText(fontbatch,txt2,xcen,ytop+380,50,50,0,0.25,color);
}




// --------------------------------------------------------------------
// GAME STATES
// NOTE: these refer to a singleton standard game object SG.
// --------------------------------------------------------------------


// entry point, call this to start the game
function webGLStart() {
	SG.webGLStart();
}

function pauseWebGL(paused) {
	if (!paused && SG.pausedWebGL)
		requestGLFrame(SG.webGLFrame); // restart frame requests
	SG.pausedWebGL = paused;
	if (paused) {
		JGAudio.mute();
	} else {
		JGAudio.unmute();
	}
}


// --------------------------------------------------------------------
// game state NewLevel


function startNewLevel(timer) {
	screenxofs = 0;
	screenyofs = 0;
	SG.targetxofs = -1;
	SG.targetyofs = -1;
	SG.bgxofs = 0;
	//JGAudio.play("pan"+randomstep(4,5,1));
	thislevel = GameConfig.levels[level % GameConfig.levels.length];
	if (thislevel.def) {
		thisleveldef = GameConfig.leveldefs[thislevel.def];
	} else {
		thisleveldef = thislevel;
	}
	/*SG.gamemsgs.addMessage({
		type: "popup",
		duration: 400,
		easing: { in: 50, out: 50},
		chunks: [
			{
				height: height/2,
				draw: drawNewLevelChunk
			}
		]
	});*/
	gametime=0;
	SG.gamestarttimestamp=new Date().getTime();
	SG.gameendtimestamp = 0;
	if (GameConfig.score && GameConfig.score.reset
	&&  (!GameConfig.gamemode || GameConfig.gamemode=="separate-levels") ) {
		GameConfig.score.reset();
	}
	leveldonetimer=0;
	JGObject.removeObjects(null,0);
	if (GameConfig.gamemode != "no-title" && !GameConfig.nomenubutton) {
		new MenuObj(10, width-128,height*0.9, 128,128, 0, "to menu",60,0.3,
		function(args) {
			JGState.set("Title",-1);
		}, {});
	}
	//initCeilingObjects();
	// 1 screen = 16x9

	if (thisleveldef.newlevelModifyTilemap)
		thisleveldef.newlevelModifyTilemap();

	var tmdef = SG.getLevelInfo("tilemap");
	console.log(JSON.stringify(tmdef));
	if (tmdef && tmdef.tilex) {
		tilex = tmdef.tilex;
		tiley = tmdef.tiley;
		nrtilesx = tmdef.nrtilesx;
		nrtilesy = tmdef.nrtilesy;
		tilemap=new JGTileMap(gl,tilex,tiley, nrtilesx,nrtilesy,
			tmdef.filltile,tmdef.filltilecid, tiles_tex, 
			tmdef.unitx,
			tmdef.unity,
			tmdef.countx,
			tmdef.county,GameConfig.tilemap.texture.smooth);
	}

	thisleveldef.newlevel();

	if (thislevel.intro) {
		SG.gamemsgs.addMessage({
			type: "dialog",
			easing: { in: 5, out: 5},
			chunks: thislevel.intro,
		},
		{id: 1, height: 60, textsize: 50, draw: SG.drawManualChunk } );
	}
	if (thislevel.intro2) {
		SG.gamemsgs.addMessage({
			type: "dialog",
			easing: { in: 5, out: 5},
			chunks: thislevel.intro2,
		},
		{id: 1, height: 60, textsize: 50, draw: SG.drawManualChunk } );
	}
}




// --------------------------------------------------------------------
// game state Game



function startGame(timer) {
	//if (window.navigator.paymentSystem) 
	//	window.navigator.paymentSystem.requestPayment("tsunami_cruiser_donate_0_99");
	level = SG.startlevel;
	stage = SG.startlevel;
	lives = 3;

	screenxofs = 0;
	screenyofs = 0;
	SG.targetxofs = -1;
	SG.targetyofs = -1;
	SG.bgxofs = 0;
}

function doFrameGame(timer) {
	//displayManual(gametype+"Game");

	var pointerx = eng.getMouseX();
	var pointery = eng.getMouseY();
	// XXX noScroll deprecated, should be scroll.disabled
	if (!GameConfig.noScroll
	&& (!GameConfig.scroll || !GameConfig.scroll.disabled) )
		SG.updateScreenOfs();

	if (thisleveldef.scenery && thisleveldef.scenery.moving) {
		SG.bgxofs += thisleveldef.scenery.moving;
	}

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	if (!frameskip) {
		if (thisleveldef.paintBackground) thisleveldef.paintBackground();
		//var col = 0.5 + 0.5*Math.sin(gametime*0.05);
		//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		SG.drawScenery(0.3,screenxofs+SG.bgxofs,screenyofs, thisleveldef.scenery);
		if (!GameConfig.tilemapOnTop) {
			if (tilemap) tilemap.draw(gl,screenxofs,screenyofs);
		}
		if (thisleveldef.paintForeground) thisleveldef.paintForeground();
	}

	// do not update anything until modal dialogs disappear
	if (SG.gamemsgs.inModal()) return;


	if (thisleveldef.doFramePre) thisleveldef.doFramePre();

	JGObject.updateObjects(gl,frameskip,screenxofs,screenyofs,width,height);

	gl.disable(gl.BLEND);

	//JGState.add("LevelDone",-1);

	JGObject.checkCollision(1,4); // player hits goodies
	JGObject.checkCollision(2,1); // enemy hits player
	JGObject.checkCollision(8,2); // bullet hits enemy
	if (tilemap && !GameConfig.disableBGCollision) JGObject.checkBGCollision(tilemap,0xffff,0xff); // all tiles hit all

	if (thisleveldef.doFramePost) thisleveldef.doFramePost();

	//if (checkTime(0,4000,Math.floor(220 - 9*level))) {
	//}
}

function paintFrameGame(timer) {
	if (!GameConfig.hideLevelNameInGame)
		drawSpriteText(fontbatch,thislevel.name,width/3,50,60,60,0,0.25,[1,1,1,1]);
	if (GameConfig.score && GameConfig.score.display) {
		var str = GameConfig.score.display(GameConfig.score.get());
		drawSpriteText(fontbatch,str,width-30,50,60,60,1, 0.25,[1,1,1,1]);
	}
	if (thisleveldef.paintOverlay) thisleveldef.paintOverlay();
	//drawSpriteText(fontbatch,timestampToString(getGameTimeTaken()),
	//	190,380,60,60,0, 0.25,[1,1,1,1]);
	//drawSpriteText(fontbatch,"Score:",200,500,60,60,0, 0.25,[1,1,1,1]);
	//drawSpriteText(fontbatch,""+score,200,580,60,60,0, 0.25,[1,1,1,1]);
}

// --------------------------------------------------------------------
// game state Loading

function paintFrameLoading(timer) {
	drawSpriteText(fontbatch,"Please wait ...",width/2,450,90,90,0, 0.25,[1,1,1,1]);
}

function doFrameLoading(timer) {
	if (SG.gamestate_loaded) {
		SG.toggleAudio(GameState.audioEnabled);
		if (GameConfig.gamemode != "no-title") {
			JGState.set("Title",-1);
		} else {
			SG.startNewGame();
		}
	}
}

// --------------------------------------------------------------------
// game state Title


function startTitle(timer) {
	SG.gamemsgs.clear();
	JGObject.removeObjects(null,0);
	mousebutflank=false;

	// handles up to 100 levels
	var lev = 0;
	var nrlevels = GameConfig.levels.length;
	var nrlevx = 0;
	var itemsize = 140;
	if (nrlevels < 3) {
		nrlevx = nrlevels;
	} else if (nrlevels > 70) {
		itemsize = 100;
		nrlevx = 10;
	} else if (nrlevels > 50) {
		itemsize = 140;
		nrlevx = 10;
	} else if (nrlevels > 40) {
		nrlevx = 10;
	}
	if (!nrlevx) {
		levelsloop1:
		for (var hght=2; hght<=5; hght++) {
			for (var i=2; i<=8; i++) {
				if (nrlevels % i == 0 && nrlevels / i <= hght) {
					nrlevx = i;
					break levelsloop1;
				}
			}
		}
	}
	if (!nrlevx) {
		levelsloop2:
		for (var hght=2; hght<=5; hght++) {
			for (var i=3; i<=8; i++) {
				if (nrlevels / i <= hght) {
					nrlevx = i;
					break levelsloop2;
				}
			}
		}
	}
	nrlevx--; // end inclusive
	// XXX for large numbers of levels, starty should be 1, but it will
	// overlap with title. Fix this!
	var starty = 3;
	if (nrlevels >= nrlevx+2) starty--;
	for (var y=starty; y<=10; y+=2) {
		for (var x=-nrlevx/2; x<=nrlevx/2+0.01; x++) {
			if (lev >= nrlevels) break;
			new MenuObj(
				GameState.levels["level"+lev]
				&& GameState.levels["level"+lev].complete ? 12:11,
				width/2 + itemsize*x,itemsize*y, itemsize,itemsize, lev,
				""+(lev+1),0,0.4,
			function(args) {
				SG.startlevel = args.level;
				level = SG.startlevel;
				stage = level;
				SG.startNewGame();
			}, {level: lev},
			function(args) {
				drawSpriteText(fontbatch,
					 GameConfig.levels[args.level].name,
					this.x,this.y-120, 50,50,0,0.25,null);
				if (GameState.levels["level"+args.level]) {
					if (GameConfig.score 
					&& GameState.levels["level"+args.level].score!==undefined) {
						var strs = GameConfig.score.displayhighscore(
							GameState.levels["level"+args.level].score);
						for (var i=0; i<strs.length; i++) {
							drawSpriteText(fontbatch,
								strs[i],
								this.x,this.y+120 + 60*i, 50,50,0,0.25,null);
						}
					}
				}
			}, {level: lev}
			);
			lev++;
		}
	}
}


function doFrameTitle(timer) {
	JGObject.updateObjects(gl,frameskip,screenxofs,screenyofs,width,height);
}

function paintFrameTitle(timer) {
	drawSpriteText(fontbatch,GameConfig.title,
		width/2,100,80,80,0,0.25,
		font_color);
	if (!frameskip) {
		gl.disable(gl.BLEND);
		if (GameConfig.titlebg!=null) {
			drawSprite(0,0,width,height, 0.0, 
				getTexture(GameConfig.titlebg),
				null, null, true);
		}
	}
	// display global highscore
	if (GameConfig.gamemode != "separate-levels"
	&&  GameConfig.score 
	&&  GameState.highscore) {
		var strs = GameConfig.score.displayhighscore(
			GameState.highscore);
		for (var i=0; i<strs.length; i++) {
			drawSpriteText(fontbatch,strs[i],
				width-30,50 + 60*i, 50,50,1,0.25,null);
		}
	}
}

// --------------------------------------------------------------------
// game states: MISC
// TODO lives currently unused

function paintFrameNewLife(timer) {
}

function paintFrameLifeLost(timer) {
	drawSpriteText(fontbatch,"TRY AGAIN!",width/2,300,30,30,0,0.25);
}


function startLifeLost(timer) {
}

function endLifeLost(timer) {
	lives--;
	if (lives<=0) {
		JGState.add("GameOver",200);
	} else {
		JGState.add("NewLife",150);
	}
}



// --------------------------------------------------------------------
// game state GameOver

function startGameOver(timer) {
	// UNUSED
	//JGAudio.play("failure");
	SG.gameendtimestamp = new Date().getTime();
	var o=new MenuObj(9, width/2 - 200,0.6*height, 384,384, 0, "(r)eplay",170,0.15,
	function(args) {
		SG.startNewGame();
	}, {});
	o.shortcutkey="R";
	if (GameConfig.gamemode != "no-title") {
		var o=new MenuObj(10,width/2 + 200,0.6*height, 384,384, 0, "to (m)enu",170,0.15,
		function(args) {
			JGState.set("Title",-1);
		}, {});
		o.shortcutkey="M";
	}
	// store highscore for non separate-levels gamemode
	if (GameConfig.gamemode != "separate-levels"
	&&  GameConfig.score) {
		GameState.highscore = GameConfig.score.get();
		SG.persistentstate.write(GameConfig.name,GameState);
	}
}

function paintFrameGameOver(timer) {
	var ea = texteasing(20);
	var col = [font_color[0],font_color[1],font_color[2],ea.alpha];
	drawSpriteText(fontbatch,"Failed, try again!",
		width/2,200,90*ea.size,90*ea.size,
		0,0.25,col);
}



// --------------------------------------------------------------------
// game state LevelDone

function startLevelDone(timer) {
	SG.gameendtimestamp = new Date().getTime();
	var xofs = width/2 - 400;
	if (level < GameConfig.levels.length-1) {
		var o=new MenuObj(8, xofs, 0.6*height,
			320,320, 0, "(n)ext",150,0.15,
		function(args) {
			level++;
			stage=level;
			JGState.remove("LevelDone");
			SG.startNewGame(true);
		}, {});
		o.shortcutkey="N";

		xofs += 400;
	} else {
		// if not separate-levels, this signals game is complete
		// => offer restart option
		if (GameConfig.gamemode && GameConfig.gamemode != "separate-levels") {
			var o=new MenuObj(9, xofs, 0.6*height, 320,320, 0, "(r)eplay game",150,0.15,
			function(args) {
				SG.startlevel = 0;
				level = SG.startlevel;
				stage = level;
				SG.startNewGame();
			}, {});
			o.shortcutkey = "R";
			xofs += 400;
		}
	}
	if (!GameConfig.gamemode || GameConfig.gamemode == "separate-levels") {
		var o=new MenuObj(9, xofs, 0.6*height, 320,320, 0, "(r)eplay",150,0.15,
		function(args) {
			SG.startNewGame();
		}, {});
		o.shortcutkey = "R";
		xofs += 400;
	}
	if (GameConfig.gamemode != "no-title") {
		var o=new MenuObj(10, xofs, 0.6*height, 320,320, 0, "to (m)enu",150,0.15,
		function(args) {
			JGState.set("Title",-1);
		}, {});
		o.shortcutkey="M";
		xofs += 400;
	}
	// store level complete and level score if applicable
	if (GameConfig.gamemode == "separate-levels") {
		if (!GameState.levels["level"+level]) {
			GameState.levels["level"+level] = {
				complete: true,
				score: GameConfig.score ? GameConfig.score.get() : null
			};
		} else {
			if (GameConfig.score) {
				var hiscore = GameState.levels["level"+level].score;
				var newscore = GameConfig.score.get();
				console.log("New score"+newscore);
				if (hiscore===undefined
				||  GameConfig.score.betterthan(newscore,hiscore)) {
					GameState.levels["level"+level].score = newscore;
				}
			}
		}
	} else {
		GameState.levels["level"+level] = {
			complete: true,
		};
	}
	SG.persistentstate.write(GameConfig.name,GameState);
}

function paintFrameLevelDone(timer) {
	var ea = texteasing(20);
	var col = [font_color[0],font_color[1],font_color[2],ea.alpha];
	drawSpriteText(fontbatch,"Level completed!",width/2,200,60*ea.size,60*ea.size,0,0.25,col)
	//drawSpriteText(fontbatch,"Bonus voor zetten over: 100X"+moves_left,
	//	width/2,250,50*ea.size,50*ea.size,0,0.25,col)
}





// --------------------------------------------------------------------
// Tile sprites
// --------------------------------------------------------------------

/** @constant
* Bitmask for tilesprites, bit 9 and higher of tile collision ID = tile IDs */
var TILEAND = 0xffffff00;
/** @constant
* Bitmask for tilesprites, low 8 bits of tile collision ID = sprite IDs */
var TILEANDOBJ = 0xff;

var tilespriteidxes = {};

function setTileSpriteIndex(obj,clear) {
	if (clear) {
		tilespriteidxes[obj.tx+","+obj.ty] = null;
	} else {
		tilespriteidxes[obj.tx+","+obj.ty] = obj;
	}
}

/** @class
* @desc Subclass of JGObject used for tile-based sprites.  These are sprites that
* move from tile to tile.  When on a tile, the tile's ID is OR'ed with the
* object's collision ID. This way you can use tile IDs to detect the presence
* of objects.  
* <p>
* The sprite collision IDs are assumed to be in the range 0-255 (bit 0-7,
* bitmask is TILEANDOBJ) while tile IDs can use the higher bits (bitmask
* TILEAND).
* <p/>
* Move a TileSprite to a new tile by calling the goTo function.  The
* TileSprite will move when you call moveFunc() in your move() function.
* When the sprite has stopped moving and is ready to go to a new tile, the
* this.transition field becomes zero. Check this.transition to see if the
* sprite is ready to make its next move.
* <p/>
* Fields:
* <ul>
* <li>tx: current tile x coordinate
* <li>ty: current tile y coordinate
* <li>transition: a value > 0 indicates the object is moving to a new tile
* <li>sprite: sprite # that is drawn in paintFunc
* <li>anim: define to get an animation that runs as the sprite moves
*   Fields: {startsprite,endsprite,speed,vertical,always}
* <li>flipx: flip the sprite in the x axis
* <li>flipy: flip the sprite in the y axis
* <li>occupyOrigin: set to true to make the sprite to keep occupying the
*   original tile while it is moving to a new tile
* </ul>
 @classdesc ClassDesc
*/
function TileSprite(name,unique,tx,ty,colid) {
	JGObject.apply(this,[name,unique,tilex*tx,tiley*ty, colid]);
	this.transition=0;
	this.dest = null;
	this.sprite = 1;
	this.animpos = 0;
	this.flipx = false;
	this.flipy = false;
	this.angle = 0;
	this.anim = null; // start, end, speed, vertical, always
	this.tx = tx;
	this.ty = ty;
	this.oldtx = this.tx;
	this.oldty = this.ty;
	// true = occupy origin tile while moving to destination
	// TODO: setTileSpriteIndex to make sure that the sprite can also be
	// looked up at its origin
	this.occupyOrigin=false;
}

TileSprite.prototype = new JGObject();

/** You must call this in constructor to init variables. */
TileSprite.prototype.init = function() {
	if (this.colid) {
		tilemap.setTileCid(this.colid,TILEAND,this.tx,this.ty);
		setTileSpriteIndex(this);
	}
	this.setTileBBox(0,0,tilex,tiley);
	this.setBBox(0.2*tilex,0.2*tiley,0.6*tilex,0.6*tiley);
	this.x = tilex*this.tx;
	this.y = tilex*this.ty;
}

//** Call this in the move() function to handle transition from one tile to
/* another. */
TileSprite.prototype.moveFunc = function() {
	if (this.transition > 0) {
		this.transition--;
		if (this.transition <= 0) {
			this.transition = 0;
			this.x = this.dest.tx*tilex;
			this.y = this.dest.ty*tiley;
			this.xspeed = 0;
			this.yspeed = 0;
			if (this.occupyOrigin) {
				tilemap.setTileCid(0, TILEAND,this.oldtx,this.oldty);
			}
		}
	}
	if (this.anim) {
		if (this.anim.always) {
			this.animpos += this.anim.speed;
		} else {
			var s = Math.abs(this.x - this.lastx);
			if (this.anim.vertical) {
				var vs = Math.abs(this.y - this.lasty);
				if (vs > s) s=vs;
			}
			//console.log("####"+this.x+"##"+this.lastx+"##"+(this.anim.speed*s));
			this.animpos += this.anim.speed*s;
		}
		if (this.animpos >= this.anim.end + 1 - this.anim.start)
			this.animpos -= this.anim.end + 1 - this.anim.start;
		this.sprite = this.anim.start + Math.floor(this.animpos);
	}
}

/** Call this in paint() function to draw a standard animated sprite. */
TileSprite.prototype.paintFunc = function(gl) {
	spritebatch.addSprite(this.sprite,this.x-screenxofs,this.y-screenyofs,true,
		this.flipx ? -tilex : tilex, this.flipy ? -tiley: tiley,
		this.angle,null);
}


// helpers

/** Set tile ID relative to this object's position. Leave TileSprite IDs
* intact unless the given tile ID contains bits in the TileSprite ID range.
* @param tileid - ID to set
* @param xofs - number of tiles from this object in x direction
* @param yofs - number of tiles from this object in y direction
*/
TileSprite.prototype.setTile = function(tileid,xofs,yofs) {
	if (tileid==null) tileid = this.colid;
	if (!xofs) xofs=0;
	if (!yofs) yofs=0;
	// check if tile id overlaps tile bitmask. If so, clear all original bits.
	var tileand = TILEAND;
	if (tileid & tileand) tileand = 0;
	tilemap.setTileCid(tileid, tileand, this.tx+xofs,this.ty+yofs);
	setTileSpriteIndex(this);
}

TileSprite.prototype.dispose = function() {
	if (this.colid) {
		tilemap.setTileCid(0, TILEAND, this.tx,this.ty);
		setTileSpriteIndex(this,true);
	}
}

/** Move this sprite to a new tile coordinate.
* @param tx tile x coordinate
* @param ty tile x coordinate
* @param steps how many frames to take in the transition */
TileSprite.prototype.goTo = function(tx,ty,steps) {
	// TODO: check if premature call to goTo will clear old destination tile
	// clear bits set by colid
	//tilemap.setTileCid(0, (TILEANDOBJ^this.colid) | TILEAND, this.tx,ty);
	if (tx == this.tx && ty==this.ty) return;
	if (this.colid) {
		setTileSpriteIndex(this,true);
		if (!this.occupyOrigin) tilemap.setTileCid(0, TILEAND,this.tx,this.ty);
		tilemap.setTileCid(this.colid, TILEAND, tx,ty);
	}
	this.oldtx = this.tx;
	this.oldty = this.ty;
	this.tx = tx;
	this.ty = ty;
	if (this.colid) {
		setTileSpriteIndex(this);
	}
	this.dest = {
		tx: tx,
		ty: ty,
	}
	var distx = this.x-this.dest.tx*tilex;
	var disty = this.y-this.dest.ty*tiley;
	var dist = Math.sqrt(distx*distx + disty*disty);
	var speed = dist/steps;
	var ang = Math.atan2(distx,disty);
	this.xspeed = -speed*Math.sin(ang);
	this.yspeed = -speed*Math.cos(ang);
	this.transition = steps;
}

/** Get TileSprite object at given coordinate. 
* @param tx tile x coordinate
* @param ty tile x coordinate */
TileSprite.prototype.getSprite = function(tx,ty) {
	//console.log(JSON.stringify(tilespriteidxes));
	return tilespriteidxes[tx+","+ty];
}

/** Get tile ID at position relative to this object.
* @param xofs number of tiles from this object in x direction
* @param yofs number of tiles from this object in y direction
* @andmask mask to AND with before returning result. */
TileSprite.prototype.getEnv = function(xofs,yofs,andmask) {
	if (!andmask) andmask = 0xffff;
	return tilemap.getTileCidPos(this.tx+xofs,this.ty+yofs) & andmask;
}





// --------------------------------------------------------------------
// Particle System
// --------------------------------------------------------------------

var PI = Math.PI;

var ParticleConfig = {
	// position and speed
	"spawnangle": ["initial angle", 0, PI*2],
	"spawnrot": ["angle increment", -PI, PI],
	"spawnrotvar": ["rot variance, 2*PI = angle is random", 0, PI*2],
	"xvar": ["initial pos variance from center", 0, 64],
	"yvar": ["initial pos variance from center", 0, 64],
	"speedangle": ["angle-based speed multiplier", 0, 10],
	"speedvarangle": ["speed variance for speedangle", 0, 1],
	"speedanglevar": ["angle variance for speedangle", 0, 0.2],
	"lspeedvar": ["x speed variance lower bound", -10, 0],
	"rspeedvar": ["x speed variance upper bound", 0, 10],
	"uspeedvar": ["y speed variance lower bound", -10, 0],
	"dspeedvar": ["y speed variance upper bound", 0, 10],
	"rot": ["particle rotation speed", 0, 0.2],
	"rotvar": ["rot variance", 0, 0.2],
	"gravity": ["strength of gravity pull", 0, 0.4],
	"gravityangle": ["angle of gravity", 0, PI*2],
	// lifetime
	"delay": ["delay time before appearance of each subsequent particle", 0,5],
	"delayvar": ["delay variance", 0, 5],
	"expiry": ["duration before expiration", 1, 100],
	"expiryvar": ["expiry variance", 0, 100],
	// appearance
	"size": ["initial particle size", 1, 100],
	"sizevar": ["size variance, + or - given amount", 0, 50],
	"grow": ["linear grow speed", -2, 2],
	"growvar": ["grow variance, + or - given amount", 0, 2],
	"sprite": ["sprite index", 0, 9],
	"spriteangledir": ["sprite angle move direction multiplier", 1, 1],
	"spriteanglevar": ["sprite angle variance", 0, PI*2],
	"spriterot": ["sprite rotation speed", -0.3, 0.3],
	"spriterotvar": ["spriterot variance", 0, 0.3],
	"colors": ["array of RGBA values", "rgb", "rgb"],
	"colorvars": ["array of RGBA variances, same size as colors", "rgb", "rgb"],
}

var DefaultParticleConfig = {
	"explosion": {
		// position and speed
		"spawnangle": 0,
		"spawnrot": 0,
		"spawnrotvar": PI*2,
		"xvar": 32,
		"yvar": 32,
		"speedangle": 0,
		"speedvarangle": 0,
		"speedanglevar": 0,
		"lspeedvar": -5,
		"rspeedvar": 5,
		"uspeedvar": -8,
		"dspeedvar": 0,
		"rot": 0,
		"rotvar": 0.1,
		"gravity": 0.2,
		"gravityangle": 0,
		// lifetime
		"delay": 2,
		"delayvar": 0,
		"expiry": 50,
		"expiryvar": 10,
		// appearance
		"size": 20,
		"sizevar": 10,
		"grow": 2,
		"growvar": 1,
		"sprite": 0,
		"spriteangledir": 0,
		"spriteanglevar": PI*2,
		"spriterot": 0,
		"spriterotvar": 0.15,
		"colors": [
			{"r":1, "g":1, "b":1, "a":1},
			{"r":1, "g":1, "b":1, "a":0},
		],
		"colorsvars": [
			{"r":0, "g":0, "b":0, "a":0},
			{"r":0, "g":0, "b":0, "a":0},
		]
	},
}


// if elem exists in obj2, use that, otherwise use obj1
// Overwrites obj1
//From:http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
/* Recursively merge properties of two objects  */
function MergeRecursive(obj1, obj2) {
	if (!obj1 && !obj2) return {};
	if (!obj1) return obj2;
	if (!obj2) return obj1;
	var ret = {};
	for (var p in obj2) {
		try {
			if ( obj2[p].constructor==Object ) {
				ret[p] = MergeRecursive(obj1[p], obj2[p]);
			} else {
				obj1[p] = obj2[p];
			}
		} catch(e) {
			obj1[p] = obj2[p];
		}
	}
	return obj1;
}

function MergeRecursiveCopy(obj1,obj2) {
	var ret = {};
	ret = MergeRecursive(ret,obj1);
	ret = MergeRecursive(ret,obj2);
	return ret;
}


function createParticles(x,y,number,defaultconfig,config) {
	config = MergeRecursiveCopy(DefaultParticleConfig[defaultconfig],config);
	var angle = config.spawnangle;
	for (var i=0; i<number; i++) {
		new StdParticle(x,y,angle,i,config);
		angle += config.spawnrot+random(-config.spawnrotvar,config.spawnrotvar);
	}
}

function StdParticle(x,y,angle,idx,config) {
	JGObject.apply(this,["stdparticle",true,x,y, 0]);
	this.config = config;
	this.x = x + random(-config.xvar,config.xvar);
	this.y = y + random(-config.yvar,config.yvar);
	this.spriteangle = random(-config.spriteanglevar,config.spriteanglevar);
	this.spriterot = config.spriterot + random(-config.spriterotvar,config.spriterotvar);
	this.delay = idx*config.delay + random(-config.delayvar,config.delayvar);
	this.expiry = config.expiry + random(-config.expiryvar,config.expiryvar);
	this.maxexp = this.expiry;
	this.speed = config.speedangle
		+ random(-config.speedvarangle,config.speedvarangle);
	this.angle = angle + random(-config.speedanglevar,config.speedanglevar);
	this.rot = config.rot + random(-config.rotvar,config.rotvar);
	this.xspeedinc = random(config.lspeedvar,config.rspeedvar);
	this.yspeedinc = random(config.uspeedvar,config.dspeedvar);
	this.size = config.size + random(-config.sizevar,config.sizevar);
	this.grow = config.grow + random(-config.growvar,config.growvar);
	// colorvars to do!
}

StdParticle.prototype = new JGObject();

StdParticle.prototype.move = function() {
	this.delay--;
	if (this.delay > 0) return;
	this.expiry--;
	if (this.expiry<1) this.remove();
	this.xspeed = this.xspeedinc + this.speed*Math.sin(this.angle);
	this.yspeed = this.yspeedinc + this.speed*Math.cos(this.angle);
	this.xspeedinc += this.config.gravity*Math.sin(this.config.gravityangle);
	this.yspeedinc += this.config.gravity*Math.cos(this.config.gravityangle);
	this.angle += this.rot;
	this.spriteangle += this.spriterot;
	this.size += this.grow;
}


StdParticle.prototype.hit = function(obj) { }
StdParticle.prototype.hit_bg = function(tilecid) { }


StdParticle.prototype.paint = function(gl) {
	if (this.delay > 0) return;
	var phase = (this.config.colors.length-1.01)
		*((this.maxexp - this.expiry)/this.maxexp);
	var a = phase % 1;
	var colidx1 = Math.floor(phase);
	if (colidx1 < 0) colidx1 = 0;
	if (colidx1 >= this.config.colors.length)
		colidx1 = this.config.colors.length-1;
	var colidx2 = Math.ceil(phase);
	if (colidx2 < 0) colidx2 = 0;
	if (colidx2 >= this.config.colors.length)
		colidx2 = this.config.colors.length-1;
	var col1 = this.config.colors[colidx1];
	var col2 = this.config.colors[colidx2];
	var col = [
		(1-a)*col1.r + a*col2.r,
		(1-a)*col1.g + a*col2.g,
		(1-a)*col1.b + a*col2.b,
		(1-a)*col1.a + a*col2.a
	];
	//col = hsv_to_rgb(this.timer,1,1, phase);
	spritebatch.addSprite(Math.floor(this.config.sprite),
		this.x-screenxofs, this.y-screenyofs, false,
		this.size, this.size,
		this.spriteangle
			+ this.config.spriteangledir*Math.atan2(this.xspeed,this.yspeed),
		col);
}


// helper functions

function dbgPrint(obj,text) {
	if (!obj) {
		obj = { x: width/2, y: height/2 };
	}
	drawSpriteText(fontbatch,text,obj.x,obj.y,25,25,0, 0,null);
}


var SG = new StdGame();


//webGLStart();
