CS.GameParser = function() {
	this.keywords = {
		"gametitle:": true,
		"gamedesc:": true,
		"gamebackground:": true,
		"gameinit:": true,
		"empty:": true,
		"cell:": true,
		"group:": true,
		"cellanim:": true,
		"cellstate:": true,
		"rule:": true,
		"andmask:": true,
		"conddir:": true,
		"outdir:": true,
		"animdir:": true,
		"priority:": true,
		"probability:": true,
		"delay:": true,
		"transform:": true,
		"condfunc:": true,
		"outfunc:": true,
		"condstate:": true,
		"outstate:": true,
		"anim:": true,
		"mouse:": true,
		"level:": true,
		"rules:": true,
		"tilemap:": true,
		"background:": true,
		"init:": true,
		"tick:": true,
		"win:": true,
		"lose:": true,
		"globals:": true,
		"title:": true,
		"desc:": true,
		"display:": true,
		"config:": true,
	};

	//	current items being parsed
	this.curlev=null; /* Level */
	this.currule=null; /* Rule */
	this.game=null; /* Game */

	// default level globals
	this.globals=null; /* String */

	this.linenr = 0;
}

// remove c style block comments but keep line breaks as empty lines
// to preserve line numbering
CS.GameParser.removeComments = function(src) {
	var tokens = src.split(/([*\/\n])/);
	var ret = "";
	var state=0;
	for (var i=0; i<tokens.length; i++) {
		var tok = tokens[i];
		if (tok=="") continue; // XXX empty strings are also in tokens
		if (state==0) {
			if (tok == "/") {
				state = 1;
			}
		} else if (state==1) {
			if (tok == "*") {
				state = 2;
			} else {
				state = 0;
				ret += "/"; // push back non-comment symbol
			}
		} else if (state==2) {
			if (tok == "*") {
				state = 3;
			}
		} else if (state==3) {
			if (tok == "/") {
				state = 0;
				continue; // swallow token
			} else {
				state = 2;
				ret += "*"; // push back non-comment symbol
			}
		}
		if (state==2) {
			// inside comment -> leave only \n
			if (tok == "\n") ret += tok;
		} else if (state==0) {
			// outside comment
			ret += tok;
		}
	}
	return ret;
}

CS.GameParser.prototype.parseGame = function(gamesrc) {
	//ScriptContext.initContext();
	this.linenr = -1;
	CS.clearErrorLog();
	this.curlev = null;
	this.currule = null;
	this.game = new CS.Game();
	// ignore cellsym
	this.addCellSym(".","0","-","false","-",true,null,"false");
	gamesrc = CS.GameParser.removeComments(gamesrc);
	var tokens = gamesrc.split(/([\n])|[ \t]+/);
	var cur_keyword = null;
	var cur_par = [];
	for (var i=0; i<tokens.length; i++) {
		var t = tokens[i];
		if (!t || t=="") continue;
		if (this.keywords[t]) {
			// keyword found, parse previous keyword and reset param
			if (cur_keyword) this.parseKeyword(cur_keyword,cur_par);
			cur_keyword = t;
			cur_par = [];
		} else if (t == "\n") {
			// line break, just count these
			this.linenr++;
		} else {
			// not a keyword, must be value
			if (cur_keyword) {
				cur_par.push(t);
			}
		}
	}
	// parse last keyword
	if (cur_keyword) this.parseKeyword(cur_keyword,cur_par);
	// write pending level and rule
	this.nextRule();
	this.nextLevel();
	return this.game;
}


// PRIVATE METHODS

/** Currently accepted transforms: - L R U
* @return rotation dir (a value that can be added to a DIR* value)
**/
CS.GameParser.prototype.parseImageTransform = function(str) {
	var str = str.toUpperCase();
	var rot = 0;
	if (str.indexOf("L") >= 0) {
		rot |= 3;
	} else if (str.indexOf("R") >= 0) {
		rot |= 1;
	} else if (str.indexOf("U") >= 0) {
		rot |= 2;
	}
	var flipx =  str.indexOf("X") >= 0;
	var flipy =  str.indexOf("Y") >= 0;
	return CS.Main.getTranCode(rot,flipx,flipy);
}

// directional is one of:
// false, none: non directional
// true, rot4: directional through rotation: -=0, U=0, R=90, D=180, L=270
// mirx: directional left-right: -=-, U=-, R=-, D=MIRX, L=MIRX
// miry: directional up-down: -=0, U=-, R=-, D=MIRY, L=MIRY
// rot-mir: directional up-down-left-right: -=-, R=-, L=MIRX, U=270, D=MIRX+270
// dir_str is a direction specification (i.e. -, L, R, UL), default=-
// should_anim indicates if tweens should be used for this cell type
CS.GameParser.prototype.addCellSym = function(chr,tilenr_str,
img_transform,directional, dir_str, empty, initexpr, should_anim) {
	var tilenr = Number(tilenr_str);
	var dir = this.parseDir(dir_str);
	var img_trans = this.parseImageTransform(img_transform);
	var is_direct = this.parseDirectionality(directional);
	var mask = 0; /* long */
	if (!empty) {
		mask = this.game.nextcellsym;
		this.game.nextcellsym *= 2; // shift left
	}
	should_anim = this.parseBoolean(should_anim);
	var cell=new CS.Cell(chr,tilenr,img_trans,is_direct,mask,dir,initexpr,
		should_anim);
	this.game.cellsyms[chr] = cell;
	this.game.cellsyms_mask[""+cell.mask] = cell;
}

CS.GameParser.prototype.parseBoolean = function(str) {
	str = str.trim().toLowerCase();
	return str != "false" && str != "no";
}

CS.GameParser.prototype.parseDirectionality = function(dirspec) {
	dirspec = dirspec.toLowerCase();
	if (dirspec == "false" || dirspec=="no") dirspec = "none";
	if (dirspec == "true" || dirspec=="yes") dirspec = "rot4";
	if (dirspec == "mir-rot") dirspec = "rot-mir";
	if (dirspec != "none"
	&&  dirspec != "rot4"
	&&  dirspec != "mirx"
	&&  dirspec != "miry"
	&&  dirspec != "rot-mir") {
		CS.reportError("InvalidKeyword",this.linenr,
			"Unknown directionality "+dirspec);
	}
	return dirspec;
}

// parses a list of chars as a group of cell symbols (ie it ORs the masks
// of each cell symbol)
// If "!" is found as the first character, followed by at least one
// character, it is interpreted as NOT.
CS.GameParser.prototype.parseCellSymGroup = function(chrlist) {
	var mask=0; /* long */
	var is_not=false;
	for (var i=0; i<chrlist.length; i++) {
		var chr = chrlist.charAt(i);
		// check for NOT symbol
		if (i==0 && chrlist.length > 1 && chr == "!") {
			is_not=true;
			continue;
		}
		var cell = this.game.cellsyms[chr];
		if (cell==null) {
			var groupmask = this.game.cellsymgroups[chr];
			if (groupmask) {
				mask |= groupmask;
			} else {
				CS.reportError("InvalidCellsym",this.linenr,
					"Unknown cell or group "+chr);
			}
		} else {
			mask |= cell.mask;
		}
	}
	if (is_not) mask = ~mask;
	return mask;
}

CS.GameParser.prototype.nextRule = function() {
	if (this.currule!=null) {
		// finalize rule and store it
		this.currule.init();
		this.game.rules.push(this.currule);
		this.currule=null;
	}
}

// expects: name src[9] dst[9]
// or: name src[3] dst[3]
// each element is a cell sym group.
CS.GameParser.prototype.createRule = function(par) {
	this.currule = new CS.Rule();
	this.currule.id = par[0];
	this.currule.context = [0,0,0, 0,0,0, 0,0,0]; /* Long[] */
	for (var y=0; y<3; y++) {
		for (var x=0; x<3; x++) {
			if (par.length==7) { // single line
				if (y!=1) {
					this.currule.context[x+3*y] = 0;
				} else {
					this.currule.context[x+3*y]
						= this.parseCellSymGroup(par[1 + x]);
				}
			} else { // 3 lines
				this.currule.context[x+3*y]
					= this.parseCellSymGroup(par[1 + x + 6*y]);
			}
		}
	}
	this.currule.output = [0,0,0, 0,0,0, 0,0,0]; /* Long[] */
	for (var y=0; y<3; y++) {
		for (var x=0; x<3; x++) {
			if (par.length==7) { // single line
				if (y!=1) {
					this.currule.output[x+3*y] = 0;
				} else {
					this.currule.output[x+3*y] 
						= this.parseCellSymGroup(par[4 + x]);
				}
			} else {
				this.currule.output[x+3*y]
					= this.parseCellSymGroup(par[4 + x + 6*y]);
			}
		}
	}
}

// dir can be U,D,R,L, and legal combinations like UL,UR,DL,DR.
// Other characters are ignored. Combinations resulting in impossible dirs
// (like TB) result in NODIR.
// passing null results in NODIR.
CS.GameParser.prototype.parseDir = function(dirstr) {
	if (dirstr==null) return CS.NODIR;
	var dirmask=0;
	for (var i=0; i<dirstr.length; i++) {
		switch (dirstr.charAt(i)) {
			case 'U': dirmask |= 1; break;
			case 'D': dirmask |= 2; break;
			case 'L': dirmask |= 4; break;
			case 'R': dirmask |= 8; break;
		}
	}
	switch(dirmask) {
		case 1: return CS.DIRU;
		case 2: return CS.DIRD;
		case 4: return CS.DIRL;
		case 5: return CS.DIRUL;
		case 6: return CS.DIRDL;
		case 8: return CS.DIRR;
		case 9: return CS.DIRUR;
		case 10: return CS.DIRDR;
		default: return CS.NODIR;
	}
}

// Transform can be: ROT4, ROT8, MIRX, MIRY, or a space separated
// combination.
CS.GameParser.prototype.parseTransform = function(transstr) {
	var ret=0;
	var tokens = transstr.split(/[ \t\r\n]/);
	for (var i=0; i<tokens.length; i++) {
		var t = tokens[i].toUpperCase();
		if (t == "ROT2") ret |= CS.ROT2;
		if (t == "ROT4") ret |= CS.ROT4;
		if (t == "ROT8") ret |= CS.ROT8;
		if (t == "MIRX") ret |= CS.MIRX;
		if (t == "MIRY") ret |= CS.MIRY;
	}
	return ret;
}

// Mouse can be: hover, drag, click
// combination.
CS.GameParser.prototype.parseMouse = function(mousestr) {
	var ret=0;
	var tokens = mousestr.split(/[ \t\r\n]/);
	for (var i=0; i<tokens.length; i++) {
		var t = tokens[i].toLowerCase();
		if (t == "hover") ret |= CS.MOUSEHOVER;
		if (t == "drag")  ret |= CS.MOUSEDRAG;
		if (t == "click") ret |= CS.MOUSECLICK;
	}
	return ret;
}

CS.GameParser.prototype.nextLevel = function() {
	this.nextRule();
	if (this.curlev) {
		this.game.levels.push(this.curlev);
		// default ruleset = all game rules
		this.curlev.rules = this.game.rules;
		this.curlev.nr_rules = this.game.nr_rules;
		this.curlev.globals = this.globals;
		this.curlev.initialize();
		this.curlev=null;
	}
}

CS.GameParser.prototype.createLevel = function(par) {
	this.curlev = new CS.Level();
	this.curlev.map = new Array(par.length-1);
	var cell = this.game.cellsyms[par[0]];
	if (!cell) CS.reportError("InvalidCellsym",this.linenr,
		"Unknown cell "+par[0]);
	this.curlev.filltile = cell.mask;
	this.curlev.width = 1;
	this.curlev.height = par.length-1;
	for (var i=0; i<par.length-1; i++) {
		this.curlev.map[i] = par[i+1];
		if (this.curlev.width < par[i+1].length)
			this.curlev.width = par[i+1].length;
	}
}

CS.GameParser.prototype.parseString = function(par) {
	var ret = "";
	for (var i=0; i<par.length; i++) {
		ret += par[i];
		if (i<par.length-1) ret += " ";
	}
	return ret;
}

// Check if given string is color. Returns rgba array if so, null if not.
// A color has to be of the format #fff or #ffffff.
CS.GameParser.prototype.parseColor = function(par) {
	par = par.trim().toLowerCase();
	if (par.charAt(0) != "#") return null;
	par = par.substring(1);
	var col = [0,0,0,255];
	if (par.length == 6) {
		col[0] = parseInt(par.substring(0,2),16);
		col[1] = parseInt(par.substring(2,4),16);
		col[2] = parseInt(par.substring(4,6),16);
	} else if (par.length==3) {
		col[0] = parseInt(par.substring(0,1)+par.substring(0,1),16);
		col[1] = parseInt(par.substring(1,2)+par.substring(1,2),16);
		col[2] = parseInt(par.substring(2,3)+par.substring(2,3),16);
	} else {
		return null;
	}
	return col;
}

CS.GameParser.prototype.parseKeyword = function(kwd,par) {
	var kwdid = kwd.slice(0,-1);
	//console.log("Parsing keyword "+kwdid);
	this["keyword_"+kwdid](par);
}
// ----------------------------------------------------------------------
// keywords

//  global defs ---------------------

// text/html
CS.GameParser.prototype.keyword_gametitle = function(par) {
	this.game.title = this.parseString(par);
}
// text/html
CS.GameParser.prototype.keyword_gamedesc = function(par) {
	this.game.desc = this.parseString(par);
}

// URL
CS.GameParser.prototype.keyword_gamebackground = function(par) {
	var url = this.parseString(par);
	var col = this.parseColor(url);
	if (col) {
		this.game.titlebackgroundcolor = col;
	} else {
		CS.IO.loadImage("titlebg",url,true,false,false);
		this.game.titlebackgroundurl = url;
	}
}

// JS
CS.GameParser.prototype.keyword_gameinit = function(par) {
	this.game.init = this.parseString(par);
}


// display size. tilex,tiley are size in virtual pixels (1920x1080)
// tilex tiley [nrtilesx [nrtilesy [winx [winy] ]]]
CS.GameParser.prototype.keyword_display = function(par) {
	this.game.tilex = Math.floor(par[0]);
	this.game.tiley = Math.floor(par[1]);
	this.game.nrtilesx = Math.floor(par[2]);
	this.game.nrtilesy = Math.floor(par[3]);
	// TODO winx,winy
	//if (par.length == 6) {
	//	this.game.winwidth = Math.floor(par[4]);
	//	this.game.winheight = Math.floor(par[5]);
	//} else if (par.length>0) { // keep default if no parameters given
	//	this.game.winwidth = this.game.tilex*this.game.nrtilesx;
	//	this.game.winheight = this.game.tiley*this.game.nrtilesy;
	//}
}

// tilemap def. tilex,tiley are size of tiles on given bitmap.
// smooth = use smoothing to draw tiles
// URL [tilex] [tiley] [nrtilesx] [nrtilesy] [smooth]
// or: tilex tiley nrtilesx nrtilesy smooth URL
// TODO: in the current implementation the tilemap must be square!
CS.GameParser.prototype.keyword_tilemap = function(par) {
	if (isNaN(par[0])) { // url first
		if (par.length < 1) CS.reportError("ParamError",this.linenr,
			"Missing parameters");
		this.game.tilemapurl = par[0];
		if (par[1]) this.game.tiletex_tilex = Math.floor(par[1]);
		if (par[2]) this.game.tiletex_tiley = Math.floor(par[2]);
		if (par[3]) this.game.tiletex_nrtilesx = Math.floor(par[3]);
		if (par[4]) this.game.tiletex_nrtilesy = Math.floor(par[4]);
		if (par[5]) this.game.tiletex_smooth = this.parseBoolean(par[5]);
	} else { // url last
		if (par.length < 6) CS.reportError("ParamError",this.linenr,
			"Missing parameters");
		this.game.tiletex_tilex = Math.floor(par[0]);
		this.game.tiletex_tiley = Math.floor(par[1]);
		this.game.tiletex_nrtilesx = Math.floor(par[2]);
		this.game.tiletex_nrtilesy = Math.floor(par[3]);
		this.game.tiletex_smooth = this.parseBoolean(par[4]);
		this.game.tilemapurl = par[5];
	}
	CS.IO.loadImage("tiles",this.game.tilemapurl,this.game.tiletex_smooth,false,true);
	//curlev.tilemapurl = parseString(par,nr_par);
}
// URL
CS.GameParser.prototype.keyword_background = function(par) {
	var url = this.parseString(par);
	var col = this.parseColor(url);
	if (this.curlev) {
		if (col) {
			this.curlev.backgroundcolor = col;
		} else {
			CS.IO.loadImage("levelbg"+this.game.levels.length,url,true,false,
				false);
			this.curlev.backgroundurl = url;
		}
	} else {
		if (col) {
			this.game.backgroundcolor = col;
		} else {
			CS.IO.loadImage("gamebg",url,true,false,false);
			this.game.backgroundurl = url;
		}
	}
}

// character
CS.GameParser.prototype.keyword_empty = function(par) {
	// is now always .
	//this.addCellSym(par[0],"0","-","false","-",true,null,"false");
}
// character tile# imagetransform directional [direction [should_anim] ]
CS.GameParser.prototype.keyword_cell = function(par) {
	this.addCellSym(par[0],par[1],par[2],par[3], par.length>4 ? par[4]:null,
		false, null, par.length>5 ? par[5] : "true");
}
// character characterlist
CS.GameParser.prototype.keyword_group = function(par) {
	var mask = this.parseCellSymGroup(par[1]);
	this.game.cellsymgroups[par[0]] = mask;
}
// type cell1 cell2 bgtile rotsrc direction speed frame1 [frame2[frame3[...]]]
// OLD: character speed direction frame1 [frame2 [frame3 [...]]]
// Type can be:
//   stand - refers to a cell that changes but does not move to another spot
//   move - refers to a cell that moves to a neighbouring spot
// cell1,cell2: the source and destination cell for which the animation
//   triggers; use the same cell twice to specify just movement
// bgtile: tile to show on destination spot before anim is finished
// rotsrc: tile to use for rotation. can be "src" or "dst"
// Direction can be:
// '-': use the directional system to rotate and mirror the animation
// L,R,U,D: use this animation only for given direction, do not rotate/mirror
// TODO direction, only '-' is currently supported
CS.GameParser.prototype.keyword_cellanim = function(par) {
	if (par.length < 7) CS.reportError("ParamError",this.linenr,
		"Missing parameters");
	var type = par[0];
	if (type!="stand" && type!="move")
		CS.reportError("InvalidKeyword",this.linenr, "Unknown type: "+type);
	var rotsrc = par[4];
	if (rotsrc!="src" && rotsrc!="dst")
		CS.reportError("InvalidKeyword",this.linenr,"Unknown rotsrc: "+rotsrc);
	var cell1 = this.game.cellsyms[par[1]];
	var cell2 = this.game.cellsyms[par[2]];
	if (!cell1) CS.reportError("InvalidCellsym",this.linenr,
		"Unknown cell "+cell1);
	if (!cell2) CS.reportError("InvalidCellsym",this.linenr,
		"Unknown cell "+cell2);
	var anim = {
		type: type,
		srcmask: cell1.mask,
		dstmask: cell2.mask,
		bgtile: Math.floor(par[3]),
		rotsrc: rotsrc,
		dir: par[5],
		speed: Number(par[6]),
		frames: [],
	};
	for (var i=7; i<par.length; i++) {
		anim.frames.push(Math.floor(par[i]));
	}
	var animkey = type+par[1]+par[2];
	cell1.anims[animkey] = anim;
	cell2.anims[animkey] = anim;
}
// not implemented yet
// varname initvalue
CS.GameParser.prototype.keyword_cellstate = function(par) {
}

// rule defs -------------------------------
// name src[9] dst[9]  OR: name src[3] dst[3]
CS.GameParser.prototype.keyword_rule = function(par) {
	// store previous rule
	this.nextRule();
	this.createRule(par);
}
// direction
CS.GameParser.prototype.keyword_conddir = function(par) {
	this.currule.srcdir = this.parseDir(par[0]);
}
// direction[3] or direction[9]
CS.GameParser.prototype.keyword_outdir = function(par) {
	this.currule.outdir = [0,0,0, 0,0,0, 0,0,0]; /* long[] */
	if (par.length==9) {
		for (var i=0; i<9; i++) {
			this.currule.outdir[i] = this.parseDir(par[i]);
		}
	} else if (par.length==3) { // horiz
		for (var i=0; i<9; i++) {
			this.currule.outdir[i] = CS.NODIR;
		}
		for (var i=3; i<6; i++) {
			this.currule.outdir[i] = this.parseDir(par[i-3]);
		}
	}
}
// direction
CS.GameParser.prototype.keyword_animdir = function(par) {
	this.currule.animdir = this.parseDir(par[0]);
}
// prioritylevel(int)
CS.GameParser.prototype.keyword_priority = function(par) {
	this.currule.priority = Math.floor(par[0]);
	if (this.currule.priority<0 || this.currule.priority>CS.MAXPRIORITIES) {
		CS.reportError("PriorityOutOfRange",this.linenr,
			"Priority found: "+this.currule.priority);
		this.currule.priority = 1;
	}
}
// probability(float)
CS.GameParser.prototype.keyword_probability = function(par) {
	this.currule.probability = Number(par[0]);
}
// delay(int) [type [type arg]]
// type is one of:
// time (default) - based on game time
// trigger [TriggerGroupID] - based on last trigger, use given trigger group ID
CS.GameParser.prototype.keyword_delay = function(par) {
	this.currule.delay = Math.floor(par[0]);
	if (par.length >= 2) {
		var type = par[1].toLowerCase();
		if (type!="rule" && type != "trigger")
			CS.reportError("InvalidKeyword",this.linenr,
				"Unknown delay type: "+type);
		this.currule.delaytype = type;
		if (type=="trigger") {
			if (par.length >= 3) {
				this.currule.delaytimer =  par[2];
			} else {
				CS.reportError("ParamError",this.linenr,
					"Missing parameter: trigger group timer ID");
			}
		}
	}
}
// transformspec
CS.GameParser.prototype.keyword_transform = function(par) {
	this.currule.transformspec = this.parseTransform(this.parseString(par));
}
// boolean-expression
CS.GameParser.prototype.keyword_condfunc = function(par) {
	this.currule.condfuncstr = this.parseString(par);
}
// statements
CS.GameParser.prototype.keyword_outfunc = function(par) {
	this.currule.outfuncstr = this.parseString(par);
}
// comma-separated-boolean-expressions[9]
CS.GameParser.prototype.keyword_condstate = function(par) {
	// not implemented yet
}
// comma-separated-statements[9]
CS.GameParser.prototype.keyword_outstate = function(par) {
	// not implemented yet
}
// string: yes,true,none,no,false,to-center,from-center
CS.GameParser.prototype.keyword_anim = function(par) {
	this.currule.animinfo = this.parseString(par);
	if (this.currule.animinfo == "none") this.currule.animinfo = "no";
	if (this.currule.animinfo == "false") this.currule.animinfo = "no";
	if (this.currule.animinfo == "true") this.currule.animinfo = "yes";
	if (this.currule.animinfo != "yes"
	&&  this.currule.animinfo != "no"
	&&  this.currule.animinfo != "to-center"
	&&  this.currule.animinfo != "from-center")
		CS.reportError("InvalidKeyword",this.linenr,
			"Illegal anim directive: "+this.currule.animinfo);
}
// ( [mouseflag] )*
CS.GameParser.prototype.keyword_mouse = function(par) {
	this.currule.mouseflags |= this.parseMouse(this.parseString(par));
	if (this.currule.mouseflags!=0)
		this.currule.mouseenabled = true;
}

// level defs -----------------------------
// ( charline )*
CS.GameParser.prototype.keyword_level = function(par) {
	this.nextLevel();
	this.createLevel(par);
}
// ( rulepattern )*
CS.GameParser.prototype.keyword_rules = function(par) {
	// TODO
}
// statements
CS.GameParser.prototype.keyword_init = function(par) {
	this.curlev.init = this.parseString(par);
}
// statements
CS.GameParser.prototype.keyword_tick = function(par) {
	this.curlev.tick = this.parseString(par);
}
// boolean expression
CS.GameParser.prototype.keyword_win = function(par) {
	this.curlev.win = this.parseString(par);
}
// boolean expression
CS.GameParser.prototype.keyword_lose = function(par) {
	this.curlev.lose = this.parseString(par);
}
// statements
CS.GameParser.prototype.keyword_globals = function(par) {
	this.globals = this.parseString(par);
}
// text/html
CS.GameParser.prototype.keyword_title = function(par) {
	this.curlev.title = this.parseString(par);
}
// text/html
CS.GameParser.prototype.keyword_desc = function(par) {
	this.curlev.desc = this.parseString(par);
}
// String/JSON
CS.GameParser.prototype.keyword_config = function(par) {
	CS.IO.setConfig(this.parseString(par));
}

