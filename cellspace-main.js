// TODO
// V background color ipv image
// V volgorde tilemap omdraaien, url laatst
// cell rotatietype invoeren (animatie?)
// V functie reference
// file interface:
// - select example file
// V - save to local storage
// V - load/save local filesystem


var width=1920, height=1080;

var gamebasespeed = 1000/60;



// vars

var eng;

//var ld33bg;

var gl;

var lastTime = 0;
var timeElapsed = 1000/60;
var expectedTimeElapsed = 1000/60;
var gametime=0, gamespeed=1.0, totalgametime=0;

var frameskip=0;

var level=0, stage=0, lives=3;

var startlevel=0;

var leveltimer=1000;

var score=0;
var scoremul = 1;
var moves_left=0;

var swipesensitivity = 2.5;
var gamepadsensitivity = 8;

var cyclecol = [
	[1, 0.5, 0.5, 1],
	[1, 1, 0.5, 1],
	[0.5, 1, 0.5, 1],
	[0.5, 1, 1, 1],
	[0.5, 0.5, 1, 1],
	[1, 0.5, 1, 1],
];

var gamepadcontrols = false;
var touchcontrols = false;

var gamepadmx = 0;
var gamepadmy = 0;
var gamepadfx = 0;
var gamepadfy = 0;

var gamepaddx = 0;
var gamepaddy = 0;

var gamepadbut = false;
var prevgamepadbut = false;

var prevmousebut=false,curmousebut=false,mousebutflank=false;

var starttouch = null;
var swipes = {up:false,right:false,down:false,left:false};

var spritesheet_tex;
var particlesheet_tex;
var font_tex;
var tiles_tex;

var bg_texs = [];

var manual_texs = [];

var mousepointer_tex;

var spritebatch, particlebatch, fontbatch;


var tilemap;
var screenxofs = 0;
var screenyofs = 0;
var scrollspeedx = 0, scrollspeedy = 0;
var targetxofs = -1;
var targetyofs = -1;
var tilex=60;
var tiley=60;


var unit_arrow = [
	0, -1,
	-1,0,
	-0.5,0,
	-0.5,1,
	0.5,1,
	0.5,0,
	1,0,
];


var font_color = [1,1,1,1];

var mainmenu;
var curmenu;

var gamemsgs=null;



var CSConfig = {
	text: {
		buttons: {
			next: "next",
			restart: "restart",
			menu: "menu",
		},
		messages: {
			levelcompleted: "Level Completed !",
			levelfailed: "Level Failed !",
			cont: {
				touch: "Tap to continue.",
				pc: "Press space to continue."
			},
		},
	},
};

var GameState = {
	levels: {}, /* levelnr: { complete:true, score: 0 } */
	instructions: {}
}

var CellGameSource=null;

var loading_finished=false;

var gametype="building";

var GameConfig=null;

function httpGet(theUrl,callback) {
	xmlhttp=new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState==4) {
			if (xmlhttp.status==200) {
				callback(null,xmlhttp.responseText);
			} else {
				callback(xmlhttp.status,null);
			}
		}
	}
	xmlhttp.open("GET", theUrl, false );
	xmlhttp.send();
}

//From:http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
/* Recursively merge properties of two objects  */
function MergeRecursive(obj1, obj2) {
	for (var p in obj2) {
		try {
			if ( obj2[p].constructor==Object ) {
				obj1[p] = MergeRecursive(obj1[p], obj2[p]);
			} else {
				obj1[p] = obj2[p];
			}
		} catch(e) {
			obj1[p] = obj2[p];
		}
	}
	return obj1;
}

function processImageURL(url,is_tileset) {
	if (!url.match(/^[a-zA-Z0-9]+:/)) {
		// relative URL -> use default directory
		if (is_tileset) {
			url = "../images/"+url;
		} else {
			url = "images/"+url;
		}
	} 
	if (is_tileset) {
		url = "php/transformimage.php?url="+encodeURIComponent(url);
	}
	return url;
}


var IOAPI = {
	getTileMap: function() { return tilemap; },
	getTileId: function(tileid,dir) {
		var blockx = Math.floor(tilemap.nr_tex_x/3);
		var blocky = Math.floor(tilemap.nr_tex_y/3);
		var xp0 = tileid % blockx;
		var yp0 = Math.floor(tileid / blockx);
		var xpos=xp0,ypos=yp0;
		if (dir==1) { // 90 deg, coord is (1,0)
			xpos = 2*blockx - 1 - yp0;
			ypos = xp0;
		} else if (dir==2) { // 180 deg, coord is (2,0)
			xpos = 3*blockx - 1 - xp0;
			ypos = blocky - 1 - yp0;
		} else if (dir==3) { // 270 deg, coord is (0,1)
			xpos = yp0;
			ypos = 2*blocky - 1 - xp0;
		} else if (dir==4) { // flipx, coord is (1,1)
			xpos = 2*blockx - 1 - xp0;
			ypos = blocky + yp0;
		} else if (dir==5) { // flipx+90 deg, coord is (2,1)
			xpos = 3*blockx - 1 - yp0;
			ypos = 2*blocky - 1 - xp0;
		} else if (dir==6) { // flipx+180 deg, coord is (0,2)
			xpos = xp0;
			ypos = 3*blocky - 1 - yp0;
		} else if (dir==7) { // flipx+270 deg, coord is (1,2)
			xpos = blockx + yp0;
			ypos = 2*blocky + xp0;
		} // 0 or -1 -> keep
		return xpos + tilemap.nr_tex_x*ypos;
	},
	getWidth: function() { return width; },
	getHeight: function() { return height; },
	levelDone: function() {
		if (JGState.isIn("GameOver")) return;
		JGState.add("LevelDone",-1);
	},
	gameOver: function() {
		if (JGState.isIn("LevelDone")) return;
		JGState.add("GameOver",-1);
	},
	moveObjects: function() {
		JGObject.updateObjects(gl,frameskip,screenxofs,screenyofs,width,height);
	},
	loadImage: function(id,url,smooth,wrap,is_tileset) {
		url = processImageURL(url,is_tileset);
		if (TexLoader.texByURL[url]) return;
		console.log("Loading image "+id+","+url+","+smooth);
		TexLoader.load(gl,id,url,smooth,wrap,true);

	},
	setBGImage: function(url) {},
	drawSprite: function(tileid,x,y) {
		x -= screenxofs;
		y -= screenyofs;
		spritebatch.addSprite(tileid,x,y,true, tilemap.tilex,tilemap.tiley,
			0, null);
	},
	drawString: function(string,x,y,align,size) {
		//console.log("drawString"+string+" "+x+" "+y+" "+size+" "+align);
		drawSpriteText(fontbatch,string,x, y, size,size, align, 0.25);
	},
	drawImage: function(url,x,y,w,h) {
		url = "images/"+url;
		//console.log("drawImage "+TexLoader.texByURL[url]+" "+x+" "+y+" "+w+" "+h);
		drawSprite(x,y, w, h, 0.0, TexLoader.texByURL[url],
			null, null, false);
	},
	getMouseButton: function(butnr) {return eng.getMouseButton(butnr);},
	clearMouseButton: function(butnr) {eng.clearMouseButton(butnr);},
	getMouseX: function() {return eng.getMouseX();},
	getMouseY: function() {return eng.getMouseY();},
	getKey: function(keycode) {
		return eng.getKey(keycode);
	},
	getKeyDownFlank: function(keycode) {
		return eng.getKeyDownFlank(keycode);
	},
	// U=0, R=1, D=2, L=3
	getSwipeEvent: function(dir) {
		if (dir==0 && swipes.up) {
			//swipes.up = false;
			return true;
		} else if (dir==1 && swipes.right) {
			//swipes.right = false;
			return true;
		} else if (dir==2 && swipes.down) {
			//swipes.down = false;
			return true;
		} else if (dir==3 && swipes.left) {
			//swipes.left = false;
			return true;
		}
		return false;
	},
	getGameTime: function() { return totalgametime; },
	setPanTarget: function(tilex,tiley) {
		if (!tilemap) return;
		var xofs = -width/2 + (tilex+0.5)*tilemap.tilex;
		if (xofs < 0) xofs=0;
		if (xofs > tilemap.tilex*tilemap.nrtilesx - width)
			xofs = tilemap.tilex*tilemap.nrtilesx - width;
		var yofs = -height/2 + (tiley+0.5)*tilemap.tiley;
		if (yofs < 0) yofs=0;
		if (yofs > tilemap.tiley*tilemap.nrtilesy - height)
			yofs = tilemap.tiley*tilemap.nrtilesy - height;
		// defined for the first time -> jump
		if (targetxofs < 0) {
			screenxofs = xofs;
			targetxofs = xofs;
		} else {
			targetxofs = xofs;
		}
		if (targetyofs < 0) {
			screenyofs = yofs;
			targetyofs = yofs;
		} else {
			targetyofs = yofs;
		}
	},
	playSound: function(sample,channel,loop,volume) {
		var samplepath = "sounds/"+sample;
		JGAudio.load(sample,samplepath);
		JGAudio.play(sample,channel,loop);
	},
	setConfig: function(config) {
		MergeRecursive(CSConfig,JSON.parse(config));
	},
	reportConsole: function(type,message) {
		console.log("CS console: ["+type+"] "+message);
	}
};

function resizeCanvas() {
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


function initCSGame(gamesrc) {
	JGState.set("Loading");
	CellGameSource = gamesrc;
	CS.init(CellGameSource,IOAPI);
	var game = CS.getGame();
	if (!game) return;
	//tiles_tex = initTexture(gl,"images/"+game.tilemapurl,
	//	game.tiletex_smooth,false);
	spritebatch = new JGSpriteBatch(gl,TexLoader.texById["tiles"],
		3*game.tiletex_nrtilesx*game.tiletex_tilex,
		3*game.tiletex_nrtilesy*game.tiletex_tiley, [
			{x: 0,y: 0, 
				width:game.tiletex_tilex,
				height:game.tiletex_tiley
			}
		], game.tiletex_smooth );

	//console.log(JSON.stringify(CS.Main.game));
	loading_finished=true;
}

function webGLStart() {
	//gametype = PersistentState.getUrlParameter("game");
	if (!gametype) gametype = "building";
	GameConfig = GameConfigs[gametype];

	//if (window.navigator.paymentSystem) 
	//	window.navigator.paymentSystem.init("f2ab665e-217f-41fc-98d6-bbdaa6ced57c");
	window.addEventListener('resize', resizeCanvas, false);
	document.addEventListener('fullscreenchange', resizeCanvas, false);
	document.addEventListener('mozfullscreenchange', resizeCanvas, false);
	document.addEventListener('webkitfullscreenchange', resizeCanvas, false);
	// init gl
	var canvas = document.getElementById("game-canvas");
	resizeCanvas();
	gl = createGL(canvas, {antialias:false, premultipliedAlpha: false});
	// use this to show verbose debug info in console
	//gl = WebGLDebugUtils.makeDebugContext(gl);

	eng = new JGCanvas(canvas,width,height);
	JGState.set("Loading",-1);
	//JGState.set("Game",-1);
	//JGState.set("NewLevel",450);

	gldrawInit();

	gamemsgs = new GameMessages(width/2,0.002*height,0.02*height,drawGameMsgBG);

	//ld33bg = new CustomBG();
	//JGAudio.load("error","sounds/164245__soniktec__metallic-sound-pack-1_cc_0");
	//JGAudio.load("failure","sounds/165313__ani-music__high-arp-in-g-8-bit-ish_cc_0");
	//JGAudio.load("start","sounds/277033-ui-completed-status-alert-notification-sfx001-stretch");

	for (var id in GameConfig.sounds) {
		var file = GameConfig.sounds[id];
		JGAudio.load(id,file);
	}

	var gamesrc = PersistentState.getUrlParameter("game");
	//if (!gamesrc) gamesrc = "simpleboulder";
	if (gamesrc) {
		httpGet("games/"+gamesrc,function(err,res) {
			if (err) {
				alert("Error loading game source");
			} else {
				initCSGame(res);
			}
		});
	}


	//spritesheet_tex=initTexture(gl,GameConfig.textures.spritesheet,false,false);
	particlesheet_tex = initTexture(gl,"images/hudsprites.png",true,false);
	mousepointer_tex = initTexture(gl,"images/mousepointer-256.png",true,false);
	//bg_texs.push(initTexture(gl,"images/beach_day_1920_1080-soft-2.jpg",true,false));
	//bg_texs.push(initTexture(gl,"images/Jungle_Bkg_1920_1080-soft.jpg",true,false));
	//bg_texs.push(initTexture(gl,GameConfig.textures.bg,true,false));

	for (var i=0; i<GameConfig.textures.manual.length; i++) {
		manual_texs.push(initTexture(gl,GameConfig.textures.manual[i],
			true,false));
	}
	

	font_tex = initTexture(gl,"images/cellfontdejavusansmono-outline.png",true,false);

	particlebatch = new JGSpriteBatch(gl,particlesheet_tex,1024,1024, [
		{x: 0,y: 0, width:256,height:256}
	] );

	fontbatch = new JGSpriteBatch(gl,font_tex,512,512, [
		{x: 0,y: 0, width:32,height:48}
	] );


	//if (!music_started) {
	//	JGAudio.play("music","music",true);
	//	music_started=true;
	//}


	// create menus
	mainmenu = new JGMenu(drawLogo);
	mainmenu.addMenuItem(drawMenuItemStatic,selMenuStartGame,
		{ ypos: 350, text: "Start Game" });
	mainmenu.addMenuItem(drawMenuItemLevel,selMenuLevel,{ypos: 450});
	//mainmenu.addMenuItem(drawMenuItemSound,selMenuSound,{ypos: 500});
	//mainmenu.addMenuItem(drawMenuItemMusic,selMenuMusic,{ypos: 600});
	//mainmenu.addMenuItem(drawMenuItemDonate,selMenuDonate,{ypos: 700});

	var optionsmenu = new JGMenu(null,drawMenuItemStatic,
		{ ypos:650, text: "<<< Back" });
	mainmenu.addSubmenu(drawMenuItemStatic,optionsmenu,
		{ ypos:550, text: "Options" });
	optionsmenu.addMenuItem(drawMenuItemSound,selMenuSound,{ypos:350});
	optionsmenu.addMenuItem(drawMenuItemMusic,selMenuMusic,{ypos:450});
	optionsmenu.addMenuItem(drawMenuItemTouch,selMenuTouch,{ypos:550});

	//var creditsmenu = new JGMenu(drawCredits,drawMenuItemStatic,
	//	{ ypos:490, text: "BACK" });
	//mainmenu.addSubmenu(drawMenuItemStatic,creditsmenu,
	//	{ ypos:390, text: "CREDITS" });

	/*if (window.navigator.paymentSystem 
	&& window.navigator.paymentSystem.getType()=="ouya") {
		window.navigator.paymentSystem.init(
			"f2ab665e-217f-41fc-98d6-bbdaa6ced57c");
		mainmenu.addMenuItem(drawMenuItemDonate,selMenuDonate,{ypos: 450});
	}*/

	// start animation
	webGLFrame();
}

function drawMenuItemStatic(is_active,menu,menuitem) {
	return drawMenuText(is_active,menu,menuitem,menuitem.userdata.text);
}

function drawMenuText(is_active,menu,menuitem,text) {
	var size = is_active ? 15+1*Math.sin(0.1*menu.animtimer) : 13;
	var thick = is_active ? 3.5 : 2.0;
	drawSpriteText(fontbatch,text,width/2, menuitem.userdata.ypos,
		5*size,5*size, 0, 0.25);
	return {x:width/6, width:2*width/3, y:menuitem.userdata.ypos-25, height:70};
}

function selMenuStartGame(menu) {
	JGState.set("Game",-1);
	JGState.add("NewLevel",450);
}


function drawMenuItemLevel(is_active,menu,menuitem) {
	return drawMenuText(is_active,menu,menuitem, "Start at level "+(startlevel+1));
}

function selMenuLevel(menu) {
	startlevel++;
	if (startlevel >= 12) startlevel = 0;
}

function drawMenuItemDonate(is_active,menu,menuitem) {
	var st = window.navigator.paymentSystem.checkReceipt("super_pyro_runner_donation_0_99");
	return drawMenuText(is_active,menu,menuitem, st==1
		? "THANKS FOR YOUR DONATION!"
		: (st==-1  ? "DONATE $0.99" : "") );
}

function selMenuDonate(menu) {
	window.navigator.paymentSystem.requestPayment("super_pyro_runner_donation_0_99");
}


function drawMenuItemSound(is_active,menu,menuitem) {
	return drawMenuText(is_active,menu,menuitem, "Sound " +
		(JGAudio.isEnabled() ? "Enabled" : "Disabled") );
}

function selMenuSound(menu) {
	if (JGAudio.isEnabled()) {
		JGAudio.disable();
	} else {
		JGAudio.enable();
	}
}
function selMenuMusic(menu) {
	if (JGAudio.isEnabled("music")) {
		JGAudio.disable("music");
	} else {
		JGAudio.enable("music");
		//JGAudio.play("music","music",true);
	}
}

function drawMenuItemMusic(is_active,menu,menuitem) {
	return drawMenuText(is_active,menu,menuitem, "Music " +
		(JGAudio.isEnabled("music") ? "Enabled" : "Disabled") );
}

function drawMenuItemTouch(is_active,menu,menuitem) {
	return drawMenuText(is_active,menu,menuitem, "Touch sensitivity "
		+ swipesensitivity);
}

function selMenuTouch(menu) {
	swipesensitivity += 0.5;
	if (swipesensitivity >= 4.5) swipesensitivity = 1.5;
}


function drawLogo(menu) {
	//drawText("A TMTG.NET GAME",width/2,155,8,8,2,font_color,0,0.5);;
}

function drawCredits(menu) {
	drawText("GAME BY BORIS VAN SCHOOTEN",width/2,170,14,14,2.5,font_color,0,0.5);
}


var pausedWebGL = false;
function pauseWebGL(paused) {
	if (!paused && pausedWebGL)
		requestGLFrame(webGLFrame); // restart frame requests
	pausedWebGL = paused;
}


function updateTimers() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		timeElapsed = timeNow - lastTime;
		gamespeed = timeElapsed / gamebasespeed;
		gamespeed = 1.0;
		gametime += gamespeed;
		totalgametime += gamespeed;
	}
	lastTime = timeNow;
}

function webGLFrame() {
	try {

		if (!pausedWebGL) requestGLFrame(webGLFrame);

		updateTimers();
		if (timeElapsed >= 1000/32) {
			frameskip=1;
			doWebGLFrame();
			updateTimers();
		}
		frameskip=0;
		doWebGLFrame();
	} catch (err) {
		IOAPI.reportConsole("Exception",err.message);
		pauseWebGL(true);
	}
}

function doWebGLFrame() {

	eng.updateFlanks(totalgametime);

	// update touch controls
	touchcontrols = eng.sawTouchEvents();

	// read gamepads
	prevgamepadbut = gamepadbut;
	gamepadcontrols = false;
	gamepadmx = 0;
	gamepadmy = 0;
	gamepadfx = 0;
	gamepadfy = 0;
	gamepadbut = false;
	if (navigator.getGamepads) {
		var pads = navigator.getGamepads();
		// circumvent error in Chrome, which returns an array-like
		// thing on desktop that doesn't actually contain elements
		if (pads.length > 0 && pads[0]) {
			gamepadcontrols = true;
			// add up all values from all axes
			for (var i=0; i<pads.length; i++) {
				// circumvent possible errors
				if (!pads[i] || !pads[i].axes || !pads[i].buttons) continue;
				if (pads[i].axes[0] > 0.25 || pads[i].axes[0] < -0.25)
					gamepadmx += pads[i].axes[0];
				if (pads[i].axes[1] > 0.25 || pads[i].axes[1] < -0.25)
					gamepadmy += pads[i].axes[1];
				if (pads[i].axes[2] > 0.25 || pads[i].axes[2] < -0.25)
					gamepadfx += pads[i].axes[2];
				if (pads[i].axes[3] > 0.25 || pads[i].axes[3] < -0.25)
					gamepadfy += pads[i].axes[3];
				for (var b=0; b<4; b++) {
					if (pads[i].buttons[b].pressed) gamepadbut=true;
				}
				gamepaddx = 0;
				gamepaddy = 0;
				if (pads[i].buttons[12].pressed) gamepaddy = -1;
				if (pads[i].buttons[13].pressed) gamepaddy =  1;
				if (pads[i].buttons[14].pressed) gamepaddx = -1;
				if (pads[i].buttons[15].pressed) gamepaddx =  1;
			}
		}
	}


	if (touchcontrols) {
		if (eng.touches.length > 0) {
			if (!starttouch) {
				starttouch = eng.touches[0];
			} else {
				var distx = eng.touches[0].x - starttouch.x;
				var disty = eng.touches[0].y - starttouch.y;
				if (Math.abs(distx) > Math.abs(2*disty)) {
					// x swipe
					if (distx < -width*0.05) swipes.left = true;
					if (distx >  width*0.05) swipes.right = true;
				} else if (Math.abs(disty) > Math.abs(2*distx)) {
					// y swipe, note we use width again as relative measure
					if (disty < -width*0.05) swipes.up = true;
					if (disty >  width*0.05) swipes.down = true;
				}
			}
		} else {
			starttouch = null;
			swipes.left = false;
			swipes.right = false;
			swipes.up = false;
			swipes.down = false;
		}
	}

	// init gl

	var bgcol=null;
	if (CS) {
		if (JGState.isIn("Game") && CS.getCurrentLevel()) {
			bgcol = CS.getCurrentLevel().backgroundcolor;
			if (!bgcol) bgcol = CS.getGame().backgroundcolor;
		} else if (CS.getGame()) {
			bgcol = CS.getGame().titlebackgroundcolor;
		}
	}
	if (!bgcol) {
		bgcol = [0,0,0,1];
	} else {
		bgcol = [bgcol[0]/255,bgcol[1]/255,bgcol[2]/255,bgcol[3]/255];
	}
	gl.clearColor(bgcol[0], bgcol[1], bgcol[2], bgcol[3]);
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


	if (spritebatch) spritebatch.clear();
	particlebatch.clear();
	fontbatch.clear();


	gamemsgs.displayAudioEnable(eng,GameState,drawAudioIcon,toggleAudio);

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

	gamemsgs.update(eng);

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

		gamemsgs.paint(gl,1); // draw text

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		if (spritebatch) spritebatch.draw(gl);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		particlebatch.draw(gl);
		fontbatch.draw(gl);
		if (GameConfig.fn.drawOverlay) GameConfig.fn.drawOverlay(gl);
		gamemsgs.paint(gl,2); // draw images
		gl.disable(gl.BLEND);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		//gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		if (!gamepadcontrols && !touchcontrols) {
			var color = hsv_to_rgb(gametime/100,0.7,1, 1);
			//var color = cyclecol[Math.floor(gametime/8) % cyclecol.length];
			//drawSprite(pointerx,pointery, 96, 96, 0.0, mousepointer_tex,
			//	null, color, true);
		}
	}
	prevmousebut = curmousebut;
	curmousebut = !gamemsgs.inModal() && eng.getMouseButton(1);
	mousebutflank = curmousebut && !prevmousebut;
}

function checkTime(start,end,period) {
	return (gametime >= start && gametime < end && gametime%period<gamespeed);
}


// game states: transitions

var music_started=false;


// --------------------------------------------------------------------
// game state NewLevel


var thislevel=null;

var nr_towards_goal=0;

var WALL=1;
var DOOR_UP=2;
var DOOR_DOWN=4;


function startNewLevel(timer) {
	swipes = {up:false,right:false,down:false,left:false};
	screenxofs = 0;
	screenyofs = 0;
	targetxofs = -1;
	targetyofs = -1;
	thislevel = GameConfig.levels[level % GameConfig.levels.length];
	/*gamemsgs.addMessage({
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
	movephase = "start";
	gametime=0;
	leveldonetimer=0;
	nr_towards_goal=0;
	score = 0;
	scoremul = 1;
	JGObject.removeObjects(null,0);
	//initCeilingObjects();
	var game = CS.getGame();
	var leveldef = game.levels[level % game.levels.length];
	//tilemap = new JGTileMap(gl, 16,16,32,22, -1,0, tiles_tex,
	//	16,16, 32,32);
	tilemap = new JGTileMap(gl, game.tilex,game.tiley,
		leveldef.width,leveldef.height, -1,0, TexLoader.texById["tiles"],
			game.tiletex_tilex,
			game.tiletex_tiley,
			3*game.tiletex_nrtilesx,
			3*game.tiletex_nrtilesy,
			game.tiletex_smooth);
	tilemap.setOffscreenTile(0,1);
	CS.defineLevel(level);
	// in-game menu
	new MenuObj(10, width-64,64, 128,128, 0,
		CSConfig.text.buttons.menu,80,0.35,
	function(args) {
		JGState.set("Title",-1);
	}, {},  null,null,  [1,1,1,0.5], 0);
	new MenuObj(9, width-300,64, 128,128, 0,
		CSConfig.text.buttons.restart,80,0.35,
	function(args) {
		JGState.remove("LevelDone");
		JGState.remove("GameOver");
		JGState.add("NewLevel",1);
	}, {},  null,null,  [1,1,1,0.5], 0);
//	for (var y=tilemap.nrtilesy-1; y>1; y -= 3) {
//		for (var x=1; x<tilemap.nrtilesx-1; x++) {
//			if (y>2) {
//				tilemap.setTile(20,0,x,y-2);
//				tilemap.setTile(20,0,x,y-1);
//			}
//			tilemap.setTile(21,WALL,x,y);
//		}
//		if (y>2) {
//			tilemap.setTile(21,WALL,1,y-2);
//			tilemap.setTile(21,WALL,1,y-1);
//			tilemap.setTile(21,WALL,tilemap.nrtilesx-2,y-2);
//			tilemap.setTile(21,WALL,tilemap.nrtilesx-2,y-1);
//		}
//	}
//	var uwalls = [];
//	var dwalls = [];
//	var xinc = (tilemap.nrtilesx-4)/3;
//	for (x=2+xinc/2; x<tilemap.nrtilesx-2; x += xinc) {
//		dwalls.push(Math.floor(x + random(-1.4,1.4)));
//	}
//	for (var y=tilemap.nrtilesy-1; y>3; y -= 3) {
//		uwalls = [];
//		for (var n=0; n<=dwalls.length; n++) {
//			if (n<dwalls.length) {
//				tilemap.setTile(21,WALL,dwalls[n],y-2);
//				tilemap.setTile(21,WALL,dwalls[n],y-1);
//			}
//			// find valid regions between each wall.
//			// a valid region has at least 5 positions between two adjacent
//			// walls. 1 position in the middle for a wall, 2 positions on each
//			// side for doors.
//			var leftside = n==0 ? 1 : dwalls[n-1];
//			var rightside = n==dwalls.length ? tilemap.nrtilesx-2:dwalls[n];
//			//console.log("###"+leftside+"#"+rightside);
//			if (rightside-leftside >= 6) {
//				var wallpos = randomstep(leftside+3,rightside-3,1);
//				uwalls.push(wallpos);
//				new Enemy(wallpos,y-1);
//				// place doors left and right of the uwall
//				var doorpos = randomstep(leftside+1,wallpos-1,1);
//				tilemap.setTile(22,DOOR_UP,doorpos,y-1);
//				tilemap.setTile(23,0,doorpos,y-2);
//				tilemap.setTile(22,DOOR_DOWN,doorpos,y-4);
//				tilemap.setTile(24,DOOR_DOWN,doorpos,y-5);
//				doorpos = randomstep(wallpos+1,rightside-1,1);
//				tilemap.setTile(22,DOOR_UP,doorpos,y-1);
//				tilemap.setTile(23,0,doorpos,y-2);
//				tilemap.setTile(22,DOOR_DOWN,doorpos,y-4);
//				tilemap.setTile(24,DOOR_DOWN,doorpos,y-5);
//				//if (y<tilemap.nrtilesy-1)
//			}
//			/*if (dwalls[0] < xinc/2) {
//				// shifted to right
//				uwalls.push(dwalls[n] + Math.floor(xinc/2 +	random(-1.4,1.4)));
//			} else {
//				// shifted to left
//				uwalls.push(dwalls[n] + Math.floor(-xinc/2 + random(-1.4,1.4)));
//			}*/
//		}
//		dwalls = uwalls;
//	}
	tilemap.update(gl);
	//new Player(3,tilemap.nrtilesy-2);
}


function paintFrameNewLevel(timer) {
}


// --------------------------------------------------------------------
// game state Game

// state machine for in-game moves:
//
//            +----------------+ +-------+ (matches found)
//            |                V V       |
// start -> select -> path -> remove -> move -> start
//   ^                 |                  | (fail_condition or win_condition)
//   +------- revert <-+ (invalid_move)   +--- end
//
// start: ready to select item  (ends when mouse clicked on item)
// select: ready to select path (ends when path is selected)
// path: showing preview of action  (ends when #PREVIEW==0)
//     revert: reverting to original state  (ends when #REVERT==0)
// remove: remove matched items  (ends when #DIE==0)
// move: move board  (ends when #MOVE==0)
var movephase = "start";

var invalid_move=false;

var selectedtile=null;

var selectedmouse=null;

var nr_bonuses = 0;


var chimesnd_triggered=false;
var stonesnd_triggered=false;
var matchsnd_triggered=false;
var chimenr = 0;

function startGame(timer) {
	//if (window.navigator.paymentSystem) 
	//	window.navigator.paymentSystem.requestPayment("tsunami_cruiser_donate_0_99");
	score = 0;
	level = startlevel;
	stage = startlevel;
	lives = 3;

	movephase = "start";
	invalid_move = false;
	selectedtile = null;
}


function doFrameGame(timer) {
	displayManual("Level");
	if (tilemap.tilex*tilemap.nrtilesx <= width) {
		screenxofs = -0.5*(width - tilemap.tilex*tilemap.nrtilesx);
		targetxofs = 0; // don't do jump when panning
	} else if (targetxofs != -1) {
		var diff = screenxofs - targetxofs;
		if ((diff>0 && scrollspeedx<0)
		||  (diff<0 && scrollspeedx>0)) {
			scrollspeedx = 0;
		}
		scrollspeedx = 0.95*scrollspeedx + 0.05*(-1.0*diff);
		if (scrollspeedx > 0.5*tilemap.tilex) scrollspeedx = 0.5*tilemap.tilex;
		if (scrollspeedx < -0.5*tilemap.tilex) scrollspeedx =-0.5*tilemap.tilex;
		if (Math.abs(scrollspeedx) > 0.002*tilemap.tilex) {
			screenxofs += scrollspeedx;
		}
		/*if (Math.abs(diff) <= 0.1*tilemap.tilex) {
			// do nothing
		} else if (screenxofs < targetxofs) {
			screenxofs += 0.1*tilemap.tilex;
		} else if (screenxofs > targetxofs) {
			screenxofs -= 0.1*tilemap.tilex;
		}*/
	}
	if (tilemap.tiley*tilemap.nrtilesy <= height) {
		screenyofs = -0.5*(height - tilemap.tiley*tilemap.nrtilesy);
		targetyofs = 0; // don't do jump when panning
	} else if (targetyofs != -1) {
		var diff = screenyofs - targetyofs;
		if ((diff>0 && scrollspeedy<0)
		||  (diff<0 && scrollspeedy>0)) {
			scrollspeedy = 0;
		}
		scrollspeedy = 0.95*scrollspeedy + 0.05*(-1.0*diff);
		if (scrollspeedy > 0.5*tilemap.tiley) scrollspeedy = 0.5*tilemap.tiley;
		if (scrollspeedy < -0.5*tilemap.tiley) scrollspeedy = -0.5*tilemap.tiley;
		if (Math.abs(scrollspeedy) > 0.005*tilemap.tiley) {
			screenyofs += scrollspeedy;
		}
		/*if (Math.abs(screenyofs - targetyofs) <= 0.1*tilemap.tiley) {
			// do nothing
		} else if (screenyofs < targetyofs) {
			screenyofs += 0.1*tilemap.tiley;
		} else if (screenyofs > targetyofs) {
			screenyofs -= 0.1*tilemap.tiley;
		}*/
	}
	CS.update(gametime);

	chimesnd_triggered=false;
	stonesnd_triggered=false;
	matchsnd_triggered=false;

	// handle move state

	var pointerx = eng.getMouseX();
	var pointery = eng.getMouseY();
	// update state

	if (!frameskip) {
		if (CS.getCurrentLevel().title) {
			drawSpriteText(fontbatch, CS.getCurrentLevel().title,
				width/2,40,45,45, 0, 0.25, [1,1,1,0.5]);
		}
		var bg = CS.getCurrentLevel().backgroundurl;
		if (!bg) bg = CS.getGame().backgroundurl;
		if (bg) {
			IOAPI.loadImage(bg,bg,true,false);
			IOAPI.drawImage(bg,width/2,height/2,width,height);
		}
		//var col = 0.5 + 0.5*Math.sin(gametime*0.05);
		gl.disable(gl.BLEND);
		//drawSprite(0,0,width,height, 0.0, 
		//	bg_texs[0],
		//	null,
		//	null, true);
		tilemap.update(gl);
		tilemap.draw(gl,screenxofs,screenyofs);
	}
	//JGObject.updateObjects(gl,frameskip,screenxofs,screenyofs,width,height);

	//JGObject.checkCollision(2,4);
	//JGObject.checkBGCollision(tilemap,255,1+2+4+8); // all tiles hit all


	//if (checkTime(0,4000,Math.floor(220 - 9*level))) {
	//}
}

function paintFrameGame(timer) {

	//drawSpriteText(fontbatch,"Level "+(stage+1),200,200,60,60,0, 0.25,[1,1,1,1]);
	//drawSpriteText(fontbatch,"Zetten:",200,300,60,60,0, 0.25,[1,1,1,1]);
	//drawSpriteText(fontbatch,""+moves_left,200,380,60,60,0, 0.25,[1,1,1,1]);
	//drawSpriteText(fontbatch,"Score:",200,500,60,60,0, 0.25,[1,1,1,1]);
	//drawSpriteText(fontbatch,""+score,200,580,60,60,0, 0.25,[1,1,1,1]);
}

// --------------------------------------------------------------------
// game state Loading

function paintFrameLoading(timer) {
	drawSpriteText(fontbatch,"Wachten a.u.b. ...",width/2,450,90,90,0, 0.25,[1,1,1,1]);
}

function doFrameLoading(timer) {
	if (loading_finished) JGState.set("Title",-1);
}


// --------------------------------------------------------------------
// game state Title


function startTitle(timer) {
	screenxofs = 0;
	screenyofs = 0;
	targetxofs = -1;
	targetyofs = -1;
	gamemsgs.clear();
	JGObject.removeObjects(null,0);
	mousebutflank=false;
	movephase = "start";
	curmenu = mainmenu;
	// handles up to 100 levels
	var lev = 0;
	var nrlevels = CS.getGame().levels.length;
	var nrlevx = 9;
	var itemsize = 180;
	for (var i=3; i<=9; i++) {
		if (nrlevels % i == 0 && nrlevels / i < 4) {
			nrlevx = i;
			break;
		}
	}
	if (nrlevels < 3) {
		nrlevx = nrlevels;
	}
	if (!nrlevx) {
		for (var i=3; i<=9; i++) {
			if (nrlevels / i < 4) {
				nrlevx = i;
				break;
			}
		}
	}
	if (nrlevels > 50) {
		itemsize = 100;
		nrlevx = 9;
	}
	for (var y=1; y<=10; y++) {
		for (var x=-nrlevx/2; x<=nrlevx/2+0.01; x++) {
			if (lev >= nrlevels) break;
			new MenuObj(
				GameState.levels["level"+lev]
				&& GameState.levels["level"+lev].complete ? 12:11,
				width/2 + itemsize*x,itemsize*y, itemsize,itemsize, lev,
				""+(lev+1),0,0.4,
			function(args) {
				startlevel = args.level;
				JGState.set("Game",-1);
				JGState.add("NewLevel",1);
			}, {level: lev},
			function(args) {
				/*if (GameState.levels["level"+args.level]) {
					drawSpriteText(fontbatch,
						"Hoogste score: "+GameState.levels["level"+args.level].score,
						this.x,this.y-60, 50,50,0,0.25,null);
				}*/
			}, {level: lev}
			);
			lev++;
		}
	}
	//JGAudio.stop("music");
	//JGAudio.play("music-intro","music",true);
}


function doFrameTitle(timer) {
	displayManual("Title");
	drawSpriteText(fontbatch,CS.getGame().title,width/2,40,60,60,0,0.25);
	curmenu = curmenu.update(!gamepadcontrols,eng.getMouseX(),eng.getMouseY(),
		(eng.getMouseButton(1) && !touchcontrols && !gamepadcontrols)
		|| (!gamepadcontrols && eng.touches.length>0),
			gamepadmy<-0.7 || gamepadfy<-0.7 || gamepaddy < -0.5,
			gamepadmy> 0.7 || gamepadfy> 0.7 || gamepaddy > 0.5,
			gamepadbut);
	JGObject.updateObjects(gl,frameskip,screenxofs,screenyofs,width,height);
}

function paintFrameTitle(timer) {
	//curmenu.paint();
	//drawSpriteText(fontbatch,"Protect the Egg !",width/2,200,80,80,0,0.25,
	//	font_color);
	if (!frameskip) {
		var bg = CS.getGame().backgroundurl;
		if (bg) {
			IOAPI.loadImage(bg,bg,true,false);
			IOAPI.drawImage(bg,width/2,height/2,width,height);
		}
		//CS.drawDesc(
		//"asdfasdf<br><img src='mousepointer-256.png' width=200 height=400><br>asdfasdf",200,100,150,10);
		//var col = 0.5 + 0.5*Math.sin(gametime*0.05);
		gl.disable(gl.BLEND);
		//drawSprite(0,0,width,height, 0.0, 
		//	bg_texs[0],
		//	null,
		//	null, true);
	}
}

// --------------------------------------------------------------------
// game states: MISC


function texteasing(timer) {
	if (timer < 20) return {size:1, alpha: timer/20};
	if (timer < 400) return {size:1, alpha:1.0};
	return {
		size: 1.5 + 3*((timer-400)/30),
		alpha: 1.0// - (timer-110)/20
	};
}

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
	//JGAudio.play("failure");
	new MenuObj(9, width/2 - 200,height/2, 384,384, 0,
		CSConfig.text.buttons.restart,170,0.15,
	function(args) {
		JGState.remove("GameOver");
		JGState.add("NewLevel",1);
	}, {});
	new MenuObj(10, width/2 + 200,height/2, 384,384, 0,
		CSConfig.text.buttons.menu,170,0.15,
	function(args) {
		JGState.set("Title",-1);
	}, {});
}

function paintFrameGameOver(timer) {
	var ea = texteasing(20);
	var col = [font_color[0],font_color[1],font_color[2],ea.alpha];
	drawSpriteText(fontbatch,
		CSConfig.text.messages.levelfailed,width/2,150,90*ea.size,90*ea.size,
		0,0.25,col);
}



// --------------------------------------------------------------------
// game state LevelDone

function startLevelDone(timer) {
	var xofs = 0;
	//if (level < GameConfig.levels.length-1) {
	if (level < CS.getGame().levels.length-1) {
		new MenuObj(8, width/2 - 400,height/2, 384,384, 0,
			CSConfig.text.buttons.next,170,0.15,
		function(args) {
			level++;
			stage=level;
			JGState.remove("LevelDone");
			JGState.add("NewLevel",1);
		}, {});
	} else {
		xofs = -200;
	}
	new MenuObj(9, xofs + width/2,height/2, 384,384, 0,
		CSConfig.text.buttons.restart,170,0.15,
	function(args) {
		JGState.remove("LevelDone");
		JGState.add("NewLevel",1);
	}, {});
	new MenuObj(10, xofs + width/2 + 400,height/2, 384,384, 0,
		CSConfig.text.buttons.menu,170,0.15,
	function(args) {
		JGState.set("Title",-1);
	}, {});
	score += 100*moves_left;
	if (!GameState.levels["level"+level]) {
		GameState.levels["level"+level] = { complete: true, score: score };
	} else {
		if (GameState.levels["level"+level].score < score) {
			GameState.levels["level"+level].score = score;
		}
	}
}

function paintFrameLevelDone(timer) {
	var ea = texteasing(20);
	var col = [font_color[0],font_color[1],font_color[2],ea.alpha];
	drawSpriteText(fontbatch,
		CSConfig.text.messages.levelcompleted,width/2,150,90*ea.size,90*ea.size,0,0.25,col)
}



// --------------------------------------------------------------------
// MATCH MAP HELPERS
// --------------------------------------------------------------------


// --------------------------------------------------------------------
// MESSAGES / AUDIO
// --------------------------------------------------------------------

function drawAudioIcon(enabled,easing) {
	particlebatch.addSprite(enabled ? 14:13,64+128,64,false,
		128+32*easing, 128+32*easing, 0.0, [1,1,1,0.5]);
}

function toggleAudio(enable) {
	if (enable) {
		JGAudio.enable();
	} else {
		JGAudio.disable();
	}
}



function displayManual(section,cascade) {
	gamemsgs.displayManual(section,cascade,eng,GameState,true,
	function(easing) {
		particlebatch.addSprite(15,64,64,false,
			128+32*easing, 128+32*easing, 0.0, [1,1,1,0.5]);
	});
}

function displayManualTitle() {
	gamemsgs.addMessage({
		type: "dialog",
		easing: { in: 15, out: 15},
		chunks: [
				{
					title: CS.getGame().title,
					text: CS.getGame().desc, 
				},
			]
		},
		{id: 1, height: 50, textsize: 40, draw: drawCSChunk } );
			
}

function displayManualLevel() {
	if (!CS.getCurrentLevel()) return;
	if ( (!CS.getCurrentLevel().desc || !CS.getCurrentLevel().desc.length)
	&&   (!CS.getCurrentLevel().title || !CS.getCurrentLevel().title.length) )
		return;
	gamemsgs.addMessage({
		type: "dialog",
		easing: { in: 15, out: 15},
		chunks: [
				{
					title: CS.getCurrentLevel().title,
					text: CS.getCurrentLevel().desc, 
				},
			]
		},
		{id: 1, height: 50, textsize: 40, draw: drawCSChunk } );
			
}

function drawCSChunk(xcen,ytop,easing,chunk) {
	if (chunk.title) {
		drawSpriteText(fontbatch,chunk.title,xcen,ytop+90,60,60,0,0.25,null);
		ytop += 100;
	}
	if (chunk.text) {
		CS.drawDesc(chunk.text, xcen, ytop+100, chunk.textsize, 10);
	}
}


function drawGameMsgBG(xcen,ytop,easing,msgtype,bgheight) {
	var col;
	fontbatch.clear();
	if (msgtype == "dialog") {
		col = [0.5,0.5,0.5,0.9*easing.alpha];
		bgheight = 0.94*height - ytop*2;
		drawSpriteText(fontbatch,
			touchcontrols 
				? CSConfig.text.messages.cont.touch
				: CSConfig.text.messages.cont.pc,
			xcen,ytop+bgheight-60, 50,50, 0,0.25,[1,1,1,easing.alpha]);
	} else {
		col = [1,1,1,0.5*easing.alpha];
	}
	particlebatch.addSprite(2,xcen,ytop+bgheight/2,false,
		0.9*width, bgheight, 0.0, col);
}

function drawManualChunk(xcen,ytop,easing,chunk) {
	if (chunk.image) {
		drawSprite(xcen,ytop+chunk.height/2,
			0.75*chunk.width,0.75*chunk.height, 0.0, 
			chunk.image,
			null, [1,1,1,easing.alpha], false);
	} else if (chunk.text) {
		drawSpriteText(fontbatch,chunk.text,xcen,ytop+chunk.textsize,chunk.textsize,chunk.textsize,0,0.25,[1,1,1,easing.alpha]);
	}
}

function drawNewLevelChunk(xcen,ytop,easing,chunk) {
	var color = [font_color[0],font_color[1],font_color[2],easing.alpha];
	//drawSpriteText(fontbatch,"Get Ready!",width/2,450,90*ea.size,90*ea.size,0, 0.25,color);
	drawSpriteText(fontbatch,"Level "+(stage+1),xcen,ytop+100, 90,90, 0,0.25,color);
	
	//drawSpriteText(fontbatch,txt1,xcen,ytop+300,50,50,0,0.25,color);
	//drawSpriteText(fontbatch,txt2,xcen,ytop+380,50,50,0,0.25,color);
}


// --------------------------------------------------------------------
// Player + Bullet
// --------------------------------------------------------------------


function Player(tx,ty) {
	JGObject.apply(this,["particle",true,tx*tilemap.tilex,ty*tilemap.tiley, 1]);
	this.animtimer=0;
	this.xdir = 1;
	this.swaytimer=0;
	this.bullettimer=0;
	this.firetimer=0;
	this.setBBox(0,0,tilemap.tilex,tilemap.tiley);
}

Player.prototype = new JGObject();

Player.prototype.move = function() {
	var ts = this.getTiles(tilemap);
	var tcidl = tilemap.getTileCidPos(ts.x,ts.y);
	var tcidr = tilemap.getTileCidPos(ts.x+ts.width-1,ts.y);
	this.xspeed = 0;
	if (eng.getKey('A') && !(tcidl&WALL)) {
		this.xspeed = -6;
		this.xdir = -1;
	}
	if (eng.getKey('D') && !(tcidr&WALL)) {
		this.xspeed = 6;
		this.xdir = 1;
	}
	if (eng.getKey("K")) {
		eng.clearKey("K");
		var t = this.getCenterTile(tilemap);
		var tcidc = tilemap.getTileCidPos(t.x,t.y);
		if (tcidc & DOOR_UP) {
			this.y -= tilemap.tiley*3;
		} else if (tcidc & DOOR_DOWN) {
			this.y += tilemap.tiley*3;
		}
	}
	if (this.firetimer>0) this.firetimer--;
	if (this.bullettimer>0) {
		this.bullettimer--;
	} else if (eng.getKey('L') || eng.getKey(' ')) {
		new Bullet(this.x+80*this.xdir,this.y,20*this.xdir,0);
		this.firetimer = 12;
		this.bullettimer = 30;
	}
	if (this.xspeed!=0) {
		this.swaytimer += 0.4;
		this.animtimer += 0.2;
		if (this.animtimer>=2) this.animtimer -= 2;
	}
}


Player.prototype.hit = function(obj) { }

Player.prototype.hit_bg = function(tilecid) { }


Player.prototype.paint = function(gl) {
	spritebatch.addSprite(17+Math.floor(this.animtimer),30+this.x,30+this.y,
		false, this.xdir*-70, 70, 0, null);
	spritebatch.addSprite(8,
		30+this.x + 50*this.xdir,
		30+this.y+2*Math.sin(this.swaytimer),
		false, this.xdir*-55, 55, 0, null);
	if (this.firetimer>0 && this.firetimer%2==0) {
		spritebatch.addSprite(16,
			30+this.x + 95*this.xdir,
			38+this.y+2*Math.sin(this.swaytimer),
			false, this.xdir*-55, 55, 0, null);
	}
}


// --------------------------------------------------------------------

function Bullet(x,y,xspeed,yspeed) {
	JGObject.apply(this,["bullet",true,x,y, 2]);
	this.xspeed = xspeed;
	this.yspeed = yspeed;
}

Bullet.prototype = new JGObject();

Bullet.prototype.move = function() {
	if (this.x < -60 || this.x > width+60) this.remove();
}


Bullet.prototype.hit = function(obj) { }

Bullet.prototype.hit_bg = function(tilecid) { }


Bullet.prototype.paint = function(gl) {
	spritebatch.addSprite(11,30+this.x,40+this.y,
		false, (this.xspeed<0 ? -1 : 1)*-45, 45, 0, null);
}

// --------------------------------------------------------------------
// Enemy
// --------------------------------------------------------------------


function Enemy(tx,ty) {
	JGObject.apply(this,["enemy",true,tx*tilemap.tilex,ty*tilemap.tiley, 4]);
	this.animtimer=0;
	this.xspeed = random(2.0,4.0)*randomstep(-1,1,2);
	//this.swaytimer=0;
	//this.bullettimer=0;
	//this.firetimer=0;
	this.setBBox(0,0,tilemap.tilex,tilemap.tiley);
}

Enemy.prototype = new JGObject();

Enemy.prototype.move = function() {
	if (this.firetimer>0) this.firetimer--;
	if (this.bullettimer>0) {
		this.bullettimer--;
	} else if (eng.getKey('L') || eng.getKey(' ')) {
		new Bullet(this.x+80*this.xdir,this.y,20*this.xdir,0);
		this.firetimer = 12;
		this.bullettimer = 30;
	}
	if (this.xspeed!=0) {
		this.swaytimer += 0.4;
		this.animtimer += 0.03*Math.abs(this.xspeed);
		if (this.animtimer>=2) this.animtimer -= 2;
	}
}


Enemy.prototype.hit = function(obj) { }

Enemy.prototype.hit_bg = function(tilecid) {
	if (!(tilecid&WALL)) return;
	this.xspeed = -this.xspeed;
}


Enemy.prototype.paint = function(gl) {
	spritebatch.addSprite(9+Math.floor(this.animtimer),30+this.x,30+this.y,
		false, (this.xspeed<0 ? -1 : 1)*-70, 70, 0, null);
	/*spritebatch.addSprite(8,
		30+this.x + 50*this.xdir,
		30+this.y+2*Math.sin(this.swaytimer),
		false, this.xdir*-55, 55, 0, null);
	if (this.firetimer>0 && this.firetimer%2==0) {
		spritebatch.addSprite(16,
			30+this.x + 95*this.xdir,
			38+this.y+2*Math.sin(this.swaytimer),
			false, this.xdir*-55, 55, 0, null);
	}*/
}



// --------------------------------------------------------------------
// Particle
// --------------------------------------------------------------------

function createExplo(x,y,size,type) {
	for (var i=0; i<size; i++) {
		new Particle(type,random(x-30,x+30),random(y-30,y+30),50);
	}
}

function Particle(type,x,y,size) {
	JGObject.apply(this,["particle",true,x,y, 0]);
	this.type = type;
	this.expiry = random(0.5*size,size);
	this.maxexp = this.expiry;
	this.xspeed = random(-6,6);
	this.yspeed = random(-7,4);
	this.ang = random(0,6.2);
	this.timer = random(0,2);
	this.size = (this.type==0 ? 1.0 : 1.5)*random(1.25*size,2.5*size);
}

Particle.prototype = new JGObject();

Particle.prototype.move = function() {
	this.expiry--;
	if (this.expiry<=0) this.remove();
	this.yspeed += 0.2;
	this.ang += (this.type==0 ? 0.04 : 0.01)*this.xspeed;
	this.timer += this.type==0 ? 0.01 : 0.5;
}


Particle.prototype.hit = function(obj) { }

Particle.prototype.hit_bg = function(tilecid) { }


Particle.prototype.paint = function(gl) {
	var phase = this.expiry/this.maxexp;
	if (phase>0) phase = Math.sqrt(phase);
	var col;
	if (this.type==0) {
		col = hsv_to_rgb(this.timer,1,1, phase);
	} else {
		col = hsv_to_rgb(0.1+Math.sin(this.timer)*0.1,this.timer%1,1, phase);
		phase = Math.sqrt(phase);
	}
	particlebatch.addSprite(3+this.type,this.x,this.y,false,
		this.size, this.size, this.ang, col);
}


// ----------------------------------------------------------------------
// game type specific stuff

// ----------------------------------------------------------------------
// swap game

var GameConfigs = {
"building": {
	name: "minigame_unlock_rotate",
	strings: {
		//bonusobject: { single: "anker", plural: "ankers" }
	},
	sounds: {
		//"chimeii-1":"sounds/242501-powerup-success+1t",
	},
	textures: {
		bg:"images/MLP-Cave.jpg",
		spritesheet:"images/violinist7.png",
		manual: [
			//"images/swap-match-example1-nomarks-pp.jpg",
		]
	},
	spritesheet: {
		totalx: 120,
		totaly: 120,
		unitx: 14,
		unity: 14
	},
	levels: [0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0, 0,0,0,0,0],
	fn: {}
} };


