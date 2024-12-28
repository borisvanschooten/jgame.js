// ------------------------------------------------------------------------
// GLOBALS

var x,y;

var ruletriggerparam;

var CS = {
	// CONSTANTS
	MAXTRIGRULES: 100,
	MAXPRIO: 16,
	// transform flags, OR to get the transform value
	ROT2: 1,
	ROT4: 2,
	ROT8: 4,
	MIRX: 8,
	MIRY: 16,

	// direction and position values

	IGNOREDIR: -2, // only used for rules
	NODIR: -1,
	DIRU: 0,
	DIRUR: 1,
	DIRR: 2,
	DIRDR: 3,
	DIRD: 4,
	DIRDL: 5,
	DIRL: 6,
	DIRUL: 7,
	DIRCEN: 8, // UNUSED

	// copy pos masks
	POSTL: 1,
	POSTC: 2,
	POSTR: 4,
	POSCL: 8,
	//POSCC: 16,
	POSCR: 32,
	POSBL: 64,
	POSBC: 128,
	POSBR: 256,

	// mouse (1 button)

	// mouse over with button not pressed
	MOUSEHOVER: 1,
	// mouse over with button held
	MOUSEDRAG: 2,
	// mouse over with released->pressed flank in this frame
	MOUSECLICK: 4,


	initArray: function(dims,val) {
		if (!dims.length) return val;
		var dims2 = dims.slice(1);
		var ret = [];
		for (var i=0; i<dims[0]; i++) {
			ret.push(CS.initArray(dims2,val));
		}
		return ret;
	}

};

// ------------------------------------------------------------------------
// public API
// to be called by game engine
//
// Usage:
// Once at beginning: init(sourcecode,ioapi)
// Start of each level: defineLevel(levelnr)
// Every frame: update()
//
// Makes direct reference to JGObjects. The rest is accessed through ioapi.
// ioapi should contain the following functions:
// getTileMap() -> returns JGTileMap
// getTileId(tilenr,dir) - dir is one of -1,0,1,2,3
// getWidth()
// getHeight()
// levelDone()
// gameOver()
// moveObjects()
// loadImage(id,url,smooth,wrap);
// setBGImage(url);
// drawSprite(tileid,x,y)
// drawString(string,x,y,align,fontsize)
// drawImage(url,x,y,width,height) - draw centered
// getMouseButton(butnr)
// clearMouseButton(butnr)
// getMouseX()
// getMouseY()
// getKey(key)
// getKeyDownFlank(key)
// getSwipeEvent(dir)
// getGameTime(key)
// setPanTarget(tilex,tiley)
// playSound(sample,channel,loop,volume)
// setConfig(configstring)
// reportConsole(type,message)
CS.Main = {};

CS.init = function(gamesrc,ioapi) {

	CS.IO = ioapi;

	// error reporting
	CS.Main.console = []; // records of: type, message
	CS.Main.errorlog = []; // records of: type, linenr, message

	CS.Main.map = null; /*CellMap*/
	CS.Main.curlev=null;

	CS.Main.triggertimers = {}; // trigger group timers used for trigger delays

	CS.Main.gamedesc_pages = [];

	// key flanks (currently unused)
	CS.Main.flanktimer=0;
	CS.Main.prevkeystate = new Array(256); /* bool */
	CS.Main.flankmap = new Array(256); /* bool */

	var gameparser = new CS.GameParser();
	try {
		CS.Main.game = gameparser.parseGame(gamesrc);
	} catch (err) {
		CS.reportError("Exception",gameparser.linenr,err.message);
		CS.Main.game = null; // indicate error
		return;
	}
	if (CS.getErrorLog().length > 0) {
		CS.Main.game = null; // indicate error
		return;
	}
	//public void initCanvas() {
	//	setCanvasSettings(game.nrtilesx,game.nrtilesy,game.tilex,game.tiley,
	//		null,null,null);
	//}

	// text balloons
	CS.Main.nextstring = 0;
	CS.Main.strings = [];
	CS.Main.stringcoords = []; /* { x,y } */

	CS.Main.gamedesc_pages = CS.Main.game.desc.split("<pagebreak>");
	CS.Main.gamedescpage=0;
	//setBGColor(new JGColor(64,64,64));
	//key_continuegame=' ';
	//key_startgame='`';
	// parse game
	// load tiles
	//defineTiles(game,0);
	//defineImage("titlebg","-",0,game.titlebackgroundurl,"");
	//setBGImage("titlebg");
	// define functions
	//ScriptContext.addJavaFunction("playerdir","dir",this,"RTplayerdir");
	//ScriptContext.addJavaFunction("keypress","key",this,"RTkeypress");
	//ScriptContext.addJavaFunction("lose","",this,"JSlose");
	//ScriptContext.addJavaFunction("win","",this,"JSwin");
	//ScriptContext.addJavaFunction("mousex","",this,"RTmousex");
	//ScriptContext.addJavaFunction("mousey","",this,"RTmousey");
	//ScriptContext.addJavaFunction("mousebutton","but",this,"RTmousebutton");
	//ScriptContext.addJavaFunction("clearmousebutton","but",this,"RTclearmousebutton");
	//ScriptContext.addJavaFunction("drawstring","str,x,y",this,"RTdrawstring");
	//ScriptContext.addJavaFunction("drawTextBalloon","str,x,y,time",this,"RTdrawTextBalloon");
	/* used for font sizing */
	CS.Main.relativesize = (CS.Main.game.nrtilesx*CS.Main.game.tilex) / 512.0;
	//titlefont = new JGFont("Arial",0,relativesize*25);
	//descfont = new JGFont("Arial",0,relativesize*20);
	//messagefont = new JGFont("Arial",0,relativesize*12);

	CS.Main.tweens = {}; /* String -> TweenObject */

	if (CS.Main.game.init) (1,eval)(CS.Main.game.init);
}

//CS.updateTiles = function() { /* private*/
//	// XXX also get default dir of fill tile
//	for (var x=0; x<CS.Main.map.width; x++) {
//		for (var y=0; y<CS.Main.map.height; y++) {
//			if (CS.Main.map.map[CS.Main.map.srci][x+1][y+1]
//			!=  CS.Main.map.map[CS.Main.map.dsti][x+1][y+1]){
//				var t = map.map[CS.Main.map.srci][x+1][y+1];
//				var d = CS.Main.map.dir[CS.Main.map.srci][x][y];
//				var tileid = CS.Main.getTileIdFromMask(t,d);
//				if (tileid!==null) CS.IO.getTileMap().setTile(tileid,0,x,y);
//			}
//		}
//	}
//}

CS.defineLevel = function(levnr) {
	CS.Main.curlev = CS.Main.game.levels[levnr];
	CS.Main.linesoccupied = new Array(CS.Main.curlev.height);
	CS.IO.setBGImage(CS.Main.curlev.backgroundurl 
		? CS.Main.curlev.backgroundurl
		: CS.Main.game.backgroundurl);
	// FillBG is here, because CellMap does not know the screen size
	CS.IO.getTileMap().fill(CS.Main.getTileIdFromMask(CS.Main.curlev.filltile,-1));
	CS.Main.map = new CS.CellMap(CS.Main.game,CS.Main.curlev, CS.Main.Callback);
	CS.Main.map.init();
	JGObject.removeObjects(null,0);
	//updateTiles();
	//for (int i=0; i<rules.length; i++) {
	//	rules[i].dump();
	//}
}


// front end

//JGFont titlefont, descfont, messagefont;

CS.drawDesc = function(desc,xpos,ypos,fontsize,margin) {
	var lines = desc.split("<br>");
	for (var i=0; i<lines.length; i++) {
		var line = lines[i].trim();
		// empty line = paragraph break
		if (line.length == 0) {
			ypos += 4*margin;
			continue;
		}
		var imginfo =
		line.match(/<img\s+src\s*=\s*['"]([^'"]*)['"]\s+width=([0-9]+)\s+height=([0-9]+)\s*>/);
		if (imginfo) {
			line = line.replace(/<img\s+src\s*=\s*['"][^'"]*['"]\s+width=[0-9]+\s+height=[0-9]+\s*>/,"");
			var imgurl = imginfo[1];
			var w = Number(imginfo[2]);
			var h = Number(imginfo[3]);
			CS.IO.loadImage(null, imgurl, true, false);
			CS.IO.drawImage(imgurl, xpos, ypos+margin+h/2, w,h);
			ypos += h + 2*margin;
		}
		// if nothing left, skip draw string
		var line = line.trim();
		if (line.length==0) continue;
		CS.IO.drawString(line,xpos,ypos + fontsize/2 + margin, 0,fontsize);
		ypos += fontsize + 2*margin;
	}
}

CS.update = function(gametime) {
	if (gametime%CS.Main.game.delaymul == 0) {
		// tick trigger timers
		for (var timer in CS.Main.triggertimers) {
			var val = CS.Main.triggertimers[timer];
			if (!val || val<0) {
				val=0;
			} else {
				val--;
			}
			CS.Main.triggertimers[timer] = val;
		}
		CS.Main.nextstring=0;
		CS.Main.map.doTick();
		CS.Main.map.applyRules(CS.Main.curlev.rules,
			Math.floor(gametime/CS.Main.game.delaymul), CS.Main.Callback);
		//updateTiles();
		if (CS.Main.map.checkWinCond()) CS.IO.levelDone();
		if (CS.Main.map.checkLoseCond()) CS.IO.gameOver();
	}
	//flushObjectAddList();
	CS.IO.moveObjects();
}


CS.getGame = function() { return CS.Main.game; }

CS.getCurrentLevel = function() { return CS.Main.curlev; }

// -------------------------------------------------------------
// error reporting

CS.clearErrorLog = function() {
	CS.Main.errorlog = [];
}

CS.getErrorLog = function() {
	return CS.Main.errorlog;
}

CS.reportConsole = function(type,message) {
	CS.IO.reportConsole(type,message);
}

CS.reportError = function(type,linenr,message) {
	console.log("CS error: line "+linenr+": ["+type+"] "+message);
	CS.Main.errorlog.push({type:type,linenr:linenr,message:message});
}


// -------------------------------------------------------------
// helpers

CS.Main.getTileSymFromMask = function(tilemask) {
	if (tilemask) {
		var cell = CS.Main.game.cellsyms_mask[tilemask];
		if (typeof cell == 'undefined') {
			console.log("Mask "+tilemask+" has no defined cell");
		}
		return cell.str;
	} else {
		return "."; // XXX is currently hard coded, see keyword_empty
	}
}

// if raw_tilenr is true, d is ignored
CS.Main.getTileIdFromMask = function(tilemask, d, raw_tilenr) {
	if (tilemask) {
		var cell = CS.Main.game.cellsyms_mask[tilemask];
		if (typeof cell == 'undefined') {
			console.log("Mask "+tilemask+" has no defined cell");
		}
		if (raw_tilenr) return cell.tilenr
		return CS.Main.getTileIdFromBaseId(cell, cell.tilenr, d);
	} else {
		return -1; // -1 represents empty tile
	}
}

CS.Main.getTileIdFromBaseId = function(cell, tilenr, d) {
	if (cell!=null) {
		var flip = 0;
		var dir = 0;
		if (d>=0) {
			if (cell.directional == "rot4") {
				dir = Math.floor(d/2) % 4;
			} else if (cell.directional == "mirx") {
				if (d >= 4 && d <= 6) flip = 4;
			} else if (cell.directional == "miry") {
				// flip y
				if (d >= 4 && d <= 6) {
					flip = 4;
					dir = 2;
				}
			} else if (cell.directional == "rot-mir") {
				// head is on the right side when moving up/down
				if (d==0) { // U
					dir = 1;
					flip = 4;
				} else if (d==4) { // D
					dir = 1;
				} else if (d==6) { // L
					flip = 4;
				}
			}
		}
		return CS.IO.getTileId(tilenr,
			CS.Main.cascadeTranOp(cell.img_trans,flip|dir) );
	}
	return null;
}

CS.Main.getFlankKey = function(key,timeout) {
	var gametimer = CS.IO.getGameTime();
	var time = CS.IO.getKeyDownFlank(key);
	if (gametimer - time < CS.Main.game.delaymul*timeout) {
		return true;
	}
	return CS.IO.getKey(key);
}

// encode rot4, flipx, flipy specs into canonical code
// Assuming flip is done BEFORE rotate
// 0 = no           = flipxy rot180
// 1 = rot90        = flipxy rot270
// 2 = rot180       = flipxy
// 3 = rot270       = flipxy rot90
// 4 = flipx        = flipy rot180
// 5 = flipx rot90  = flipy rot270
// 6 = flipx rot180 = flipy
// 7 = flipx rot270 = flipy rot90
// rot: [0,1,2,3], flipx,flipy: boolean
CS.Main.getTranCode = function(rot,flipx,flipy) {
	if (flipy) {
		// rot 180 deg == flipxy
		rot = (rot+2)%4;
		flipx = !flipx;
	}
	return rot + (flipx ? 4 : 0);
}

// do one operation after another. You'll need this if you want for example
// a flip after a rotate (rather than before).
CS.Main.cascadeTranOp = function(trancode1, trancode2) {
	// We have: mirx1 rot1 mirx2 rot2
	// -> rewrite this as mirx1 mirx2 rot1 rot2
	// -> then the op can be done by just adding up rot1+rot2, mirx1+mirx2
	// Essentially we have to transform rot1 mirx2 as mirx2 rot1.
	// In most cases, rot1 mirx2 = mirx2 rot1.
	// Special cases are for rot90 and rot270. Here:
	//   rot90 mirx = miry rot90 = mirx rot270 
	//   rot270 mirx = miry rot270 = mirx rot90
	var rot1 = trancode1 & 3;
	var mirx1 = trancode1 & 4;
	var rot2 = trancode2 & 3;
	var mirx2 = trancode2 & 4;
	if (mirx2 && (rot1==1 || rot1==3)) {
		rot1 = (rot1+2) % 4;
	}
	var rot = (rot1+rot2) % 4;
	var mirx = (mirx1+mirx2) % 8;
	return rot|mirx;
}

// -----------------------------------------------------------------------
// functions that can be called from scripts
// + related game objects

function drawTextBalloon(str,x,y,time) {
	y = Math.floor(y);
	if (y <= 0 || y >= CS.IO.getTileMap().nrtilesy) return;
	if (CS.Main.linesoccupied[y-1]) return;
	new TextBalloon(str,x,y,time);
}

function TextBalloon(str,x,y,time) {
	JGObject.apply(this,["textballoon",true,
		Math.floor(x)*CS.IO.getTileMap().tilex,
		Math.floor(y)*CS.IO.getTileMap().tiley,
		0]);
	this.MAXWIDTH=120;
	this.str = str;
	this.tiley = Math.floor(y);
	this.expiry = time;
	CS.Main.linesoccupied[this.tiley-1] = true;

}

TextBalloon.prototype = new JGObject();


TextBalloon.prototype.move = function() {
	if (this.expiry<=4) CS.Main.linesoccupied[this.tiley-1] = false;
}

TextBalloon.prototype.paint = function() {
	var realx = this.x;
	if (this.x < this.MAXWIDTH) realx = this.MAXWIDTH;
	if (this.x > CS.IO.getWidth()-this.MAXWIDTH)
		realx = CS.IO.getWidth() - this.MAXWIDTH;
	//CS.IO.drawRect(...);
	//CS.IO.drawText(...);
	//setFont(messagefont);
	//setColor(JGColor.white);
	//setStroke(2);
	//drawRect(realx-MAXWIDTH,y-15,2*MAXWIDTH,15,false,false);
	//drawLine(realx-tileWidth(),y,x,y+tileWidth()/2);
	//drawString(str,realx,y-12,0);
}


function drawstring(str,x,y) {
	CS.Main.strings[CS.Main.nextstring] = str;
	CS.Main.stringcoords[CS.Main.nextstring++] = {x: Math.floor(x), y: Math.floor(y)};
}

function lose() {
	CS.IO.gameOver();
}

function win() {
	CS.IO.levelDone();
}

function panto(x,y) {
	CS.IO.setPanTarget(x,y);
}

function mousex() {
	return Math.floor(CS.IO.getMouseX()/CS.IO.getTileMap().tilex);
}

function mousey() {
	return Math.floor(CS.IO.getMouseY()/CS.IO.getTileMap().tiley);
}

function mousebutton(butnr) {
	if (butnr === undefined) butnr = 1;
	return CS.IO.getMouseButton(butnr);
}

function clearmousebutton(butnr) {
	if (butnr === undefined) butnr = 1;
	CS.IO.clearMouseButton(butnr);
}

function mouseclick(butnr) {
	if (butnr === undefined) butnr = 1;
	// XXX do not know why xpos has offset
	return (x==mousex()-1) && y==mousey() && mousebutton(butnr)
}

function mousehover() {
	// XXX do not know why xpos has offset
	return (x==mousex()-1) && y==mousey()
}

function loadsound(name,datasource) {
	JGAudio.load(""+name,datasource);
}

function sound(name,amplitude) {
	JGAudio.play(""+name,null,null,amplitude);
}

// MOVE TO jgengine.js
// jgengine cannot handle raw keycodes yet
var KeyUp = 38;
var KeyRight = 39;
var KeyDown = 40;
var KeyLeft = 37;
// replacement
//var KeyUp = "I";
//var KeyRight = "L";
//var KeyDown = "K";
//var KeyLeft = "J";

function playerdir(basedirstr) {
	if (basedirstr.length==0) return false;
	basedirstr = basedirstr.toLowerCase();
	var enable_crsr=true;
	var enable_wsad=true;
	if (basedirstr.slice(-1) == "1") {
		enable_wsad=false;
		basedirstr = basedirstr.substring(0,basedirstr.length-1);
	} else if (basedirstr.slice(-1) == "2") {
		enable_crsr=false;
		basedirstr = basedirstr.substring(0,basedirstr.length-1);
	}
	var basedir = CS.DIRU;
	if (basedirstr == "left") {
		basedir = CS.DIRL;
	} else if (basedirstr == "right") {
		basedir = CS.DIRR;
	} else if (basedirstr == "down") {
		basedir = CS.DIRD;
	}
	var dir = CS.Rule.getTransformDir(
		ruletriggerparam.rule.transforms[ruletriggerparam.subrule],basedir);
	var delay = ruletriggerparam.rule.delay;
	if (dir==0) {
		return (enable_wsad && CS.Main.getFlankKey('W',delay))
			|| (enable_crsr && CS.Main.getFlankKey(KeyUp,delay))
			||  CS.IO.getSwipeEvent(0);
	} else if (dir==2) {
		return (enable_wsad && CS.Main.getFlankKey('D',delay))
			|| (enable_crsr && CS.Main.getFlankKey(KeyRight,delay))
			||  CS.IO.getSwipeEvent(1);
	} else if (dir==4) {
		return (enable_wsad && CS.Main.getFlankKey('S',delay))
			|| (enable_crsr && CS.Main.getFlankKey(KeyDown,delay))
			||  CS.IO.getSwipeEvent(2);
	} else if (dir==6) {
		return (enable_wsad && CS.Main.getFlankKey('A',delay))
			|| (enable_crsr && CS.Main.getFlankKey(KeyLeft,delay))
			||  CS.IO.getSwipeEvent(3);
	}
	return false;
}

// Abstract button.  butstr is one of:
//   fire - space, "L", mouse button anywhere, tap anywhere
//   fire1 - todo fire left
//   fire2 - todo fire right
function playerbutton(butstr) {
	var delay = ruletriggerparam.rule.delay;
	if (butstr == "fire") {
		return CS.IO.getMouseButton(1)
		|| CS.Main.getFlankKey(" ",delay)
		|| CS.Main.getFlankKey("L",delay);
	}
}

function keypress(keystr) {
	keystr = keystr.toLowerCase();
	var delay = ruletriggerparam.rule.delay;
	if (keystr.length==1) {
		return CS.Main.getFlankKey(keystr.toUpperCase().charAt(0),delay);
	} else if (keystr == "up") {
		return CS.Main.getFlankKey(KeyUp,delay);
	} else if (keystr == "down") {
		return CS.Main.getFlankKey(KeyDown,delay);
	} else if (keystr == "left") {
		return CS.Main.getFlankKey(KeyLeft,delay);
	} else if (keystr == "right") {
		return CS.Main.getFlankKey(KeyRight,delay);
	} else if (keystr == "shift") {
		return CS.Main.getFlankKey(KeyShift,delay);
	} else if (keystr == "alt") {
		return CS.Main.getFlankKey(KeyAlt,delay);
	} else if (keystr == "ctrl") {
		return CS.Main.getFlankKey(KeyCtrl,delay);
	} else if (keystr == "enter") {
		return CS.Main.getFlankKey(KeyEnter,delay);
	}
	return false;
}

// XXX remove/replace?
function playSound(sample,channel,loop,volume) {
	CS.IO.playSound(sample,channel,loop,volume);
}


function countCells(cellsym) {
	if (!CS.Main.map) return 0;
	return CS.Main.map.countCells(cellsym);
}

//	static final String [] imgop_str = new String [] {"-","r","u","l" };
//
//	public void defineTiles(Game game,int levelnr) {
//		defineImageMap("game",
//			game.tilemapurl, 0,0,game.tilex,game.tiley,0,0);
//		//defineImageMap("level"+levelnr,
//		//	game.levels[levelnr].tilemapurl, 0,0,16,16,0,0);
//		for (String key: game.cellsyms.keySet()) {
//			Cell c = game.cellsyms.get(key);
//			int startdir = c.img_trans;
//			int nr_dir = c.directional ? 4 : 1;
//			for (int d=0; d<nr_dir; d++) {
//				int transdir = (startdir + d)%4;
//				String imgop = imgop_str[transdir];
//				//defineImage("t"+c.tilenr+imgop,""+c.tilenr+imgop,0,
//				//	"level"+levelnr, c.tilenr,  imgop);
//				defineImage("t"+c.tilenr+imgop,""+c.tilenr+imgop,0,
//					"game", c.tilenr,  imgop);
//			}
//		}
//	}

// -------------------------------------------------------------
// anim callback object

CS.Main.Callback = {};

CS.Main.Callback.tileChanged = function(x,y,tilemask,rot) {
	// remove any tween which has this coordinate as destination
	var o = CS.Main.tweens[x+","+y];
	if (o!=null) o.remove();
	var tileid = CS.Main.getTileIdFromMask(tilemask,rot);
	if (tileid!==null) CS.IO.getTileMap().setTile(tileid,0,x,y);
}


CS.Main.Callback.tileAnim = function(x1,y1,x2,y2,
dsttilemask,rot, delay, srctilemask, animtilemask) {
	//CS.Main.Callback.tileChanged(x1,y1,tilemask1,rot1);
	//if (animinfo!=null && animinfo == "no") {
	//	CS.Main.Callback.tileChanged(x2,y2,tilemask2,rot2);
	//} else {
		new TweenObject(x1,y1,x2,y2,srctilemask,dsttilemask,animtilemask,
			rot,delay);
	//}
}

function TweenObject(x1,y1,x2,y2, srctilemask,dsttilemask, animtilemask,
rot, delay) {
	JGObject.apply(this,["tween",true,
		Math.floor(x1)*CS.IO.getTileMap().tilex,
		Math.floor(y1)*CS.IO.getTileMap().tiley,
		0]);
	CS.Main.tweens[x2+","+y2] = this;
	// get anim defs
	var srccelldef = CS.Main.game.cellsyms_mask[srctilemask];
	this.animcelldef = CS.Main.game.cellsyms_mask[animtilemask];
	var dstcelldef = CS.Main.game.cellsyms_mask[dsttilemask];
	var animkey = (x1==x2&&y1==y2 ? "stand":"move") + srccelldef.str + dstcelldef.str;
	this.anim = srccelldef.anims[animkey];
	this.animtimer = 0;
	this.timer = CS.Main.game.delaymul*delay;
	this.dstx = x2;
	this.dsty = y2;
	this.rot = rot;
	if (!this.anim) {
		this.tileid = CS.Main.getTileIdFromMask(srctilemask,rot);
	}
	//console.log(x1+" "+y1+"/"+x2+" "+y2+" tileid="+this.tileid);
	this.xspeed = (x2-x1)*CS.IO.getTileMap().tilex/(CS.Main.game.delaymul*delay);
	this.yspeed = (y2-y1)*CS.IO.getTileMap().tiley/(CS.Main.game.delaymul*delay);
}


TweenObject.prototype = new JGObject();



TweenObject.prototype.move = function() {
	if (this.anim) {
		this.tileid = CS.Main.getTileIdFromBaseId(this.animcelldef,
			this.anim.frames[Math.floor(this.animtimer)], this.rot);
		this.animtimer += this.anim.speed;
		if (this.animtimer >= this.anim.frames.length)
			this.animtimer -= this.anim.frames.length;
	}
	this.timer--;
	if (this.timer<=0) {
		CS.Main.map.updateTile(this.dstx,this.dsty,CS.Main.Callback);
		//if (xspeed!=0||yspeed!=0)
		//	setSpeed(0,0);
		//else
		//	remove();
		this.remove();
	}
}

TweenObject.prototype.destroy = function() {
	// remove myself from the tweens list
	delete CS.Main.tweens[this.dstx+","+this.dsty];
}


TweenObject.prototype.paint = function() {
	CS.IO.drawSprite(this.tileid, this.x,this.y);
}

//	public void incrementLevel() {
//		if (curlevnr == game.nr_levels-1) {
//			curlevnr=0;
//		} else {
//			curlevnr++;
//		}
//	}


//	public void paintFrameLevelDone() {
//		setFont(titlefont);
//		setColor(JGColor.white);
//		drawString("Level completed!", viewWidth()/2,viewHeight()/3,0);
//	}
//	public void paintFrameGameOver() {
//		setFont(titlefont);
//		setColor(JGColor.white);
//		drawString("Level failed!", viewWidth()/2,viewHeight()/3,0);
//	}

//	public void doFrameTitle() {
//		if (gamedescpage == gamedesc_pages.length-1) {
//			if (getKey(' ')) {
//				clearKey(' ');
//				startGame();
//			}
//			if (getKey(KeyLeft)) {
//				if (curlevnr>0) curlevnr--;
//				clearKey(KeyLeft);
//			}
//			if (getKey(KeyRight)) {
//				if (curlevnr<game.nr_levels-1) curlevnr++;
//				clearKey(KeyRight);
//			}
//		} else {
//			if (getKey(' ')) {
//				clearKey(' ');
//				gamedescpage++;
//			}
//		}
//	}
//	public void paintFrameTitle() {
//		setTextOutline(1,JGColor.black);
//		setFont(titlefont);
//		setColor(JGColor.white);
//		if (gamedescpage == 0) {
//			drawString(game.title,viewWidth()/2,viewHeight()/8,0);
//			drawDesc(gamedesc_pages[gamedescpage], viewHeight()/4);
//		} else {
//			drawDesc(gamedesc_pages[gamedescpage], viewHeight()/8);
//		}
//		if (gamedescpage == gamedesc_pages.length-1) {
//			setFont(descfont);
//			drawString("Cursor keys to select level",viewWidth()/2,2*viewHeight()/3,0);
//			drawString("Press space to start level",viewWidth()/2,2*viewHeight()/3+(int)(relativesize*20),0);
//			drawString("Start at level: "+(curlevnr+1),
//				viewWidth()/2,2*viewHeight()/3+(int)(relativesize*50),0);
//			drawString(game.levels[curlevnr].title,
//				viewWidth()/2,2*viewHeight()/3+(int)(relativesize*70),0);
//		} else {
//			drawString("Press space to continue",
//				viewWidth()/2,5*viewHeight()/6,0);
//		}
//	}
//	public void doFrame() {
//		super.doFrame();
//	}
//	public void paintFrameStartGame() {
//		setFont(titlefont);
//		setColor(JGColor.white);
//		drawString(curlev.title,viewWidth()/2,viewHeight()/8,0);
//		drawDesc(curlev.desc,pfHeight()/4);
//		setFont(descfont);
//		drawString("Press space to start level",viewWidth()/2,3*viewHeight()/4,0);
//	}
//	public void paintFrameInGame() {
//		setFont(messagefont);
//		setColor(JGColor.white);
//		drawString("level "+(curlevnr+1)+": "+curlev.title+" / ESC to restart",
//			viewWidth()/2,viewHeight()-(int)(relativesize*16),0);
//		for (int i=0; i<nextstring; i++) {
//			drawString(strings[i],stringcoords[i].x,stringcoords[i].y,-1);
//		}
//	}
//	public void updateFlankMap(int keyidx) {
//		if (getKey(keyidx) && !prevkeystate[keyidx]) {
//			flankmap[keyidx] = flanktimer;
//		}
//		prevkeystate[keyidx] = getKey(keyidx);
//	}
//	public boolean getFlankKey(int keyidx,int timeout) {
//		int time = flankmap[keyidx];
//		if (flanktimer - time < Main.game.delaymul*timeout) {
//			return true;
//		}
//		return getKey(keyidx);
//	}
//	public void doFrameInGame() {
//		flanktimer++;
//		updateFlankMap(KeyLeft);
//		updateFlankMap(KeyRight);
//		updateFlankMap(KeyUp);
//		updateFlankMap(KeyDown);
//		updateFlankMap('W');
//		updateFlankMap('S');
//		updateFlankMap('A');
//		updateFlankMap('D');
//		updateFlankMap(',');
//		updateFlankMap('.');
//		//map.setCell(30,5,2,-1);
//		//checkCollision(2,1); // enemies hit player
//		//checkCollision(4,2); // bullets hit enemies
//		//if (checkTime(0,(int)(800),(int)((12-level/2))))
//		//	new Enemy();
//		//if (gametime>=800 && countObjects("enemy",0)==0) levelDone();
//		if ((int)gametime%Main.game.delaymul == 0) {
//			nextstring=0;
//			map.doTick();
//			map.applyRules(curlev.rules,curlev.nr_rules,
//				(int)gametime/Main.game.delaymul, this);
//			//updateTiles();
//			if (map.checkWinCond()) levelDone();
//			if (map.checkLoseCond()) gameOver();
//		}
//		flushObjectAddList();
//		moveObjects();
//	}

