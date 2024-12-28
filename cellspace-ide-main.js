gametype = "minimal-noresize"

//GameConfig: { "gamemode": "no-title",
//              "disableAudio": true, "disableRestart": true }

levelsizes = {
	"21x12": "21x12",
	"26x15": "26x15",
	"32x18": "32x18",
	"38x22": "38x22",
	"48x27": "48x27",
	"56x33": "56x33",
}

levelspecs = {
	"21x12": {
		w: 21, h: 12,
		tilex: 90, tiley: 90,
	},
	"21x15": {
		w: 26, h: 15,
		tilex: 72, tiley: 72,
	},
	"32x22": {
		w: 32, h: 18,
		tilex: 60, tiley: 60,
	},
	"38x22": {
		w: 38, h: 22,
		tilex: 48, tiley: 48,
	},
	"48x27": {
		w: 48, h: 27,
		tilex: 40, tiley: 40,
	},
	"56x33": {
		w: 56, h: 33,
		tilex: 32, tiley: 32,
	},
}

tilesetsizes = {
	"8x8": "8x8",
	"16x16": "16x16",
}

tilesetspecs = {
	"8x8": {tilex:8, tiley:8, imagedata:"data:image/png;base64,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",image: "genericimages-4x4-8x8-4.png"},
	"16x16": {tilex:16, tiley:16, imagedata:"data:image/png;base64,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", image:"genericimages-4x4-1.png"},
}


// gone: ":" "X"
objects_5x5 = {
	".": " ",
	// 0-4
	"-": "-",
	"%": "%",
	"#": "#",
	'"': '"',
	"~": "~",
	// 5-9
	"H": "H",
	"B": "B",
	"F": "F",
	"T": "T",
	"S": "S",
	// 10-14
	"M": "M",
	"P": "P",
	"G": "G",
	"?": "?",
	"&": "&",
	// 15-20
	"[": "[",
	"=": "=",
	"*": "*",
	"!": "!",
	"$": "$",
	// 20-25
	"+": "+",
	"@": "@",
	"^": "^",
	"o": "o",
	"/": "/",
}

// translate to cell statements:
// cell: a[0] a[1](=idx) a[2] a[3] a[4] a[5]
// sym index img_transform directional dir_str should_anim
celldefs_5x5 = [
	["-","0","-","no","-","no"],
	["%","1","-","no","-","no"],
	["#","2","-","no","-","no"],
	['"',"3","-","no","-","no"],
	["~","4","-","no","-","yes"],

	["H","5","-","no","-","yes"],
	["B","6","-","rot4","-","yes"],
	["F","7","-","rot4","-","yes"],
	["T","8","-","rot4","-","yes"],
	["S","9","-","rot4","-","yes"],

	["M","10","-","no","-","yes"],
	["P","11","-","rot-mir","-","yes"],
	["G","12","-","no","-","yes"],
	["?","13","-","no","-","no"],
	["&","14","-","no","-","yes"],

	["[","15","-","no","-","yes"],
	["=","16","-","no","-","no"],
	["*","17","-","no","-","yes"],
	["!","18","-","no","-","yes"],
	["$","19","-","no","-","yes"],

	["+","20","-","no","-","yes"],
	["@","21","-","no","-","no"],
	["^","22","-","rot4","-","yes"],
	["o","23","-","no","-","yes"],
	["/","24","-","rot4","-","no"],
]


objects = {
	".": " ",
	// 0-3
	"-": "-",
	"%": "%",
	"#": "#",
	'"': '"',
	"~": "~",
	// 4-7
	"H": "H",
	"B": "B",
	"F": "F",
	"T": "T",
	"S": "S",
	// 8-11
	"M": "M",
	"P": "P",
	"G": "G",
	"?": "?",
	"&": "&",
	// 12-15
	"[": "[",
	"=": "=",
	"*": "*",
	"!": "!",
	"$": "$",
	// 20-25
	"+": "+",
	"@": "@",
	"^": "^",
	"o": "o",
	"/": "/",
}

// translate to cell statements:
// cell: a[0] a[1](=idx) a[2] a[3] a[4] a[5]
// sym index img_transform directional dir_str should_anim
celldefs_5x5_to_4x4 = [
	["-","0","-","no","-","no"],
	["%","1","-","no","-","no"],
	["#","1","-","no","-","no"],
	['"',"2","-","no","-","no"],
	["~","3","-","no","-","yes"],

	["H","4","-","rot-mir","-","yes"],
	["B","7","-","rot4","-","yes"],
	["F","7","-","rot4","-","yes"],
	["T","6","-","rot4","-","yes"],
	["S","6","-","rot4","-","yes"],

	["M","7","-","no","-","yes"],
	["P","5","-","rot-mir","-","yes"],
	["G","6","-","no","-","yes"],
	["?","2","-","no","-","no"],
	["&","10","-","no","-","yes"],

	["[","12","-","no","-","yes"],
	["=","13","-","no","-","no"],
	["*","8","-","no","-","yes"],
	["!","7","-","no","-","yes"],
	["$","7","-","no","-","yes"],

	["+","14","-","no","-","yes"],
	["@","15","-","no","-","no"],
	["^","13","-","rot4","-","yes"],
	["o","9","-","no","-","yes"],
	["/","12","-","rot4","-","no"],
]

celldefs = [
	["-","0","-","no","-","no"],
	["#","1","-","no","-","no"],
	['%',"2","-","no","-","no"],
	["~","3","-","no","-","yes"],

	["H","4","-","mirx","-","yes"],
	["P","5","-","rot-mir","-","yes"],
	["T","6","-","rot4","-","yes"],
	["B","7","-","rot4","-","yes"],

	["*","8","-","no","-","yes"],
	["o","9","-","no","-","yes"],
	["&","10","-","no","-","yes"],
	["$","11","-","no","-","yes"],

	["[","12","-","rot4","-","yes"],
	["=","13","-","rot4","-","no"],
	["+","14","-","no","-","yes"],
	["@","15","-","rot4","-","no"],
]

cellanims = {
	"": "-",
	"none": "nodir",
	"rot4": "rot4",
	"mirx": "mirx",
	"miry": "miry",
	"rot-mir": "rot-mir",
}


emptycell = "."
emptycell_index = -1

directions = {
	"-": "-",
	"N": "N",
	"L": "L",
	"R": "R",
	"U": "U",
	"D": "D",
}

conddirections = {
	"-": "-",
	"N": "N",
	"L": "L",
	"R": "R",
	"U": "U",
	"D": "D",
}

playercontrols = {
	"": "-",
	'playerdir("up")': "up",
	'playerdir("down")': "down",
	'playerdir("left")': "left",
	'playerdir("right")': "right",
	'playerbutton("fire")': "fire",
	'keypress("x")': "Key X",
	'keypress("z")': "Key Z",
	'keypress("k")': "Key K",
	'keypress("l")': "Key L",
	'keypress(" ")': "Space",
	'playerdir("up1")': "up1",
	'playerdir("down1")': "down1",
	'playerdir("left1")': "left1",
	'playerdir("right1")': "right1",
	'playerdir("up2")': "up2",
	'playerdir("down2")': "down2",
	'playerdir("left2")': "left2",
	'playerdir("right2")': "right2",
}

priorities = {
	"1":"1",
	"2":"2",
	"3":"3",
	"4":"4",
	"5":"5",
	"6":"6",
	"7":"7",
	"8":"8",
}
probabilities = {
	"1.0":"1.0",
	"0.7":"0.7",
	"0.5":"0.5",
	"0.3":"0.3",
	"0.2":"0.2",
	"0.1":"0.1",
	"0.07":"0.07",
	"0.05":"0.05",
	"0.03":"0.03",
	"0.02":"0.02",
	"0.01":"0.01",
	"0.007":"0.007",
	"0.005":"0.005",
	"0.003":"0.003",
	"0.002":"0.002",
	"0.001":"0.001",
}

delays = {
	"1":"1",
	"2":"2",
	"3":"3",
	"4":"4",
	"5":"5",
	"6":"6",
	"7":"7",
	"8":"8",
	"9":"9",
	"15":"15",
	"30":"30",
	"1 trigger player":"1 kbd",
	"2 trigger player":"2 kbd",
	"3 trigger player":"3 kbd",
	"4 trigger player":"4 kbd",
	"5 trigger player":"5 kbd",
	"6 trigger player":"6 kbd",
	"7 trigger player":"7 kbd",
	"8 trigger player":"8 kbd",
	"9 trigger player":"9 kbd",
	"15 trigger player":"15 kbd",
	"30 trigger player":"30 kbd",
}

transforms = {
	"-":"-",
	"rot4":"rot4",
	"mirx":"mirx",
	"miry": "miry",
	"rot-mir":"rot-mir",
}

mousecontrols = {
	"": "-",
	"mousehover()": "hover",
	"mouseclick()": "click",
}

outfuncs = {
	"": "-",
	"win()": "win",
	"lose()": "lose",
}

soundtypes = {
	"": "-",
	"Random": "Random",
	"Pickup": "Pickup",
	"Powerup": "Powerup",
	"Jump": "Jump",
	"Shoot": "Shoot",
	"Blip": "Blip",
	"Hit": "Hit",
	"Explo": "Explo",
	//"Music": "Tone",
}

// GLOBALS ------------------------------------------------
var lev = 0
var pencil = 0 // -1 is don't care / empty
var levelsize = "38x22"
var levelmap = null

var tileset_tilex = 16
var tileset_tiley = 16
var tileset_xtiles = 4
var tileset_ytiles = 4
var tileset = tilesetspecs[tileset_tilex+"x"+tileset_tiley].image
var nr_objects = tileset_xtiles*tileset_ytiles;
var tileset_image = null

// LEVELS ------------------------------------------------


levels = [
{ nr_rules:30,
fixedrules: ""
/*`
rule: rule0
. . . . . . 
. H - . - H 
. . . . . . 

priority: 1
transform: rot4
outdir:
- - - 
- - - 
- - - 

probability: 1.0
delay: 3
`*/
,
levelsize: "38x22",
display: "48 48",
levelmap: null,
map:`
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
-------------------H------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------
--------------------------------------

`},


// 5 ----------------------------------------------------
{ nr_rules:7,
fixedrules:`
rule: fixedrule0
. - - . - - 
X - - . X - 
. - - . - - 

priority: 1
transform: rot4
probability: 0.2
delay: 3
outdir:
- - - 
- R - 
- - - 
`,
display: "32 32",
map:`
--------------------------------------------------------
--------------------------------------------------------
-----o--------------------------------------------------
-------------------------------------------------~------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
----------------------------X---------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
------&-------------------------------------------------
--------------------------------------------------@-----
--------------------------------------------------------
--------------------------------------------------------
title: Maze generator

`},

]


// helpers ----------------------------------------------------------------

function elbyid(id) {
	return document.getElementById(id)
}


// UI events ----------------------------------------------------------------

function runLevel() {
	toggleExpandRules(true)
	pauseWebGL(false)
	var spec = createCellspaceSpec()
	console.log(spec)
	initCSGame(spec)
	//for (var i=0; i<CS.Main.game.rules.length; i++) {
		//console.log(CS.Main.game.rules[i])
		//console.log(CS.Main.game.rules[i].toString())
	//}
	document.getElementById("leveleditor").style.display='none'
	document.getElementById("game-canvas").style.display='block'
	document.getElementById("game-canvas").focus()
	resizeUI()
}

function editLevel(do_not_minimize_rules) {
	if (!do_not_minimize_rules) {
		toggleExpandRules(true)
	}
	pauseWebGL(true)
	// parse level map
	var spec = createCellspaceSpec()
	console.log(spec)
	initCSGame(spec)
	//console.log("Game init returns: "+initCSGame(spec))
	createLevelEditor()
	var editor = document.getElementById("leveleditor")
	document.getElementById("game-canvas").style.display='none'
	editor.style.display='block'
	resizeUI()
}

function getURL() {
	var spec = createCellspaceSpec()
	if (kissc) {
		spec = kissc.compress(spec)
		//console.log(spec)
		//console.log("KISSC size:"+spec.length)
	}
	// LZMA turns out to be worse than kissc
	if (false) {
		LZMA.compress(spec, 3, function(result, error) {
			var arr = new Uint8Array(result)
			console.log(result)
			console.log(arr)
			console.log(bytesToBase64(arr))
			console.log("LZMA base64 size:"+bytesToBase64(arr).length)
		}, function(percent) {});
	}
	window.open("cellspace.html?gametype=minimal&gamesrc=" + encodeURIComponent(spec), "_blank")
}

function incLevel(inc) {
	lev += inc;
	if (lev < 0) {
		lev = 0
	} else if (lev >= levels.length) {
		lev = levels.length-1
	} else {
		document.getElementById("currentlevel").innerText = "Level "+(lev+1)
		createRuleUI()
		runLevel()
	}
}

function clearLevel() {
	var yes = confirm("Clear level?")
		if (yes) {
		editLevel() // define levelmap
		CS.defineLevel(lev)
		var levspec = levelspecs[levels[lev].levelsize]
		for (var y=0; y<levspec.h; y++) {
			for (var x=0; x<levspec.w; x++) {
				levels[lev].levelmap[y][x] = pencil
			}
		}
		var spec = createCellspaceSpec()
		initCSGame(spec)
		editLevel() // update screen
	}
}


function readTileset() {
	var url = prompt("Tileset URL (empty = default).  You can copy/paste\n a data URL from the tinyspriteeditor export function.")
	if (url===null) return;
	if (url.trim() == "") {
		tileset = tilesetspecs[tileset_tilex+"x"+tileset_tiley].image
	} else {
		tileset = url
	}
	updateTileset()
}

function editTileset() {
	var x = tileset_tilex*tileset_xtiles
	var y = tileset_tiley*tileset_ytiles
	var buffer = document.createElement("canvas");
	buffer.width = x
	buffer.height = y
	var ctx = buffer.getContext('2d');
	ctx.clearRect(0,0,x,y)
	ctx.drawImage(tileset_image,0,0,x,y, 0,0,x,y)
	window.open("http://tmtg.nl/tinyspriteeditor/tinyspriteeditor.html?canvas="
		+tileset_tilex+","+tileset_tiley+","+tileset_xtiles+","+tileset_ytiles
		+"&imagedata=" + encodeURIComponent(buffer.toDataURL()), "_blank")
}

function changeTilesetSize() {
	var newsize = document.getElementById("tileset-select").value
	var spec = tilesetspecs[newsize]
	if (spec) {
		tileset_tilex = spec.tilex
		tileset_tiley = spec.tiley
		tileset = spec.image
	}
	updateTileset()
}


function updateTileset() {
	css = ""
	classes = [".sprite",".tile",".rulecell"]
	var tileseturl = tileset
	if (!tileset.match(/^[a-zA-Z0-9]+:/)) {
		// relative url
		tileseturl = "images/"+tileset
	}
	for (var i=0; i<classes.length; i++) {
		css += classes[i] + "{\n"
		     + "  background-image: url("+tileseturl+")\n"
			 +"}\n"
	}
	document.getElementById("tilestyle").textContent = css
	document.getElementById("tileset-select").value =
		tileset_tilex+"x"+tileset_tiley
	// load image for editing
	tileset_image = new Image()
	tileset_image.onload = function() { }
	tileset_image.src = processImageURL(tileset)
}

function updateSpritesheets() {
	css = ""
	var classes = [".sprite",".tile",".rulecell"]
	var sizes = [ {x:32,y:32},{x:24,y:24},{x:16,y:16} ]
	for (var i=0; i<classes.length; i++) {
		var size = sizes[i]
		var bgsize = size.x*tileset_xtiles; // x and y are the same
		for (var y=0; y<tileset_ytiles; y++) {
			for (var x=0; x<tileset_ytiles; x++) {
				var n = x + tileset_xtiles*y
				css += classes[i] + n + " {"
			     + " background-position: "
				 + (-x*size.x) + "px " + (-y*size.y) + "px;"
				 +" background-size: "+bgsize+"px "+bgsize+"px;"
				 + "}\n"
			}
		}
	}
	document.getElementById("spritesheets").textContent = css
}

function updateBackgroundColor() {
	var col = document.getElementById("backgroundcolor").value
}


function clearRule(name) {
	var yes = confirm("Clear "+name+"?")
	if (yes) {
		setRuleBlock(name, emptycell_index, "-", " ", "-", "", "", 1, "1.0",3,"","",857394)
	}
}

var rulecopysource = null

function copyRule(name) {
	rulecopysource = name
}

function pasteRule(name) {
	if (rulecopysource == null) return
	var yes = confirm("Paste over "+name+"?")
	if (yes) {
		var r = getRuleBlock(rulecopysource,true)
		setRuleBlock(name,r.pattern,r.outdir,r.conddir,r.transform,
			r.player,r.mouse,r.priority,r.probability,r.delay,r.outfunc,
			r.sounddef)
	}
}

function toggleExpandRules(force_minimize) {
	if (force_minimize || elbyid("colgroup-rules").style.width == "100%") {
		elbyid("colgroup-rules").style.width="390px"
	} else {
		elbyid("colgroup-rules").style.width="100%"
	}
}

function setPalette(idx) {
	document.getElementById("object"+pencil).style.borderColor='black'
	document.getElementById("objectsmall"+pencil).style.borderColor='black'
	pencil = idx
	document.getElementById("object"+idx).style.borderColor='white'
	document.getElementById("objectsmall"+idx).style.borderColor='white'
	if (idx >= 0) {
		document.getElementById("cellanim-select").value = getCellAnim(idx)
	}
}

function getCellAnim(idx) {
	if (idx < 0) return;
	var celldef = CS.Main.game.cellsyms[celldefs[idx][0]]
	console.log(celldef)
	return celldef.should_anim ? celldef.directional : ""
}

// set anim of selected tile from cellanim-select
function setCellAnim() {
	if (pencil < 0) return
	var value = document.getElementById("cellanim-select").value
	var should_anim = "yes"
	var directional = "no"
	if (value == "") {
		should_anim = "no"
	} else {
		directional = value
	}
	CS.Main.game.cellsyms[celldefs[pencil][0]].should_anim = should_anim
	CS.Main.game.cellsyms[celldefs[pencil][0]].directional = directional
}

function checkSetMap(event,x,y) {
	if (event.buttons == 1) {
		setMap(x,y)
	}
}

function setCondTile(type,tile) {
	if (pencil < 0) return;
	document.getElementById(type+"tile").className="rulecell rulecell"+tile
}

function setMap(x,y) {
	if (pencil < 0) return;
	document.getElementById("map_"+x+"_"+y).className="tile tile"+pencil
	levels[lev].levelmap[y][x] = pencil
}


function setRuleCell(ruleid,x,y) {
	document.getElementById(ruleid+"_"+x+"_"+y).className="rulecell rulecell"+pencil
}



function loadSource(files) {
	if (files.length==0) return
	var reader = new FileReader()
	reader.onload = function(e) {
		loadFromString(e.target.result)
	}
	reader.readAsText(files[0])
}

function loadFromString(string) {
	initCSGame(string)
	createLevelEditor()
	createRuleUI()
	copyLevelParam()
	copyGameParam()
}

function setLevelCond(type,condstr) {
	if (!condstr) return;
	var matches = condstr.match(/countCells\(\'(.*)\'\)/)
	document.getElementById(type+"enabled").checked = false
	if (matches.length==2) {
		var tileidx = CS.Main.game.cellsyms[matches[1]].tilenr
		if (!tileidx) {
			console.log("setLevelCond: cannot find index for '"+matches[1]+"'")
			return
		}
		setCondTile(type,tileidx)
		document.getElementById(type+"enabled").checked = true
	}
}

// a ignored
function rgbToHex(rgba) {
	return "#" + (1 << 24 | rgba[0] << 16 | rgba[1] << 8 | rgba[2]).toString(16).slice(1);
}

function copyGameParam() {
	document.getElementById("backgroundcolor").value =
		rgbToHex(CS.Main.game.backgroundcolor)
	tileset = CS.Main.game.tilemapurl
	tileset_tilex = CS.Main.game.tiletex_tilex
	tileset_tiley = CS.Main.game.tiletex_tiley
	tileset_xtiles = CS.Main.game.tiletex_nrtilesx
	tileset_ytiles = CS.Main.game.tiletex_nrtilesy
	if (tilesetsizes[tileset_tilex+"x"+tileset_tiley]===null) {
		alert("Tileset has unsupported tile size!")
	}
	if (tileset_xtiles!=4 || tileset_ytiles!=4) {
		alert("Tileset other than 4x4 not supported!")
	}
	updateTileset()
	updateSpritesheets()
}

function copyLevelParam() {
	document.getElementById("leveltitle").value = CS.Main.curlev.title
	setLevelCond("win",CS.Main.curlev.win)
	setLevelCond("lose",CS.Main.curlev.lose)
}

function getSoundDefFromSource(rule) {
	var globals = CS.Main.curlev.globals
	if (globals) {
		var regex = /sfxdef\(([0-9]*),'([a-zA-Z]*)',([0-9]*)\)/g
		var matches = [...globals.matchAll(regex)]
		for (var i=0; i<matches.length; i++) {
			if ("rule_"+matches[i][1]==rule) return {
				type: matches[i][2],
				seed: matches[i][3],
			}
		}
	}
}


// from: https://stackoverflow.com/questions/18755750/saving-text-in-a-local-file-in-internet-explorer-10
function saveSource(elem) {
	var filename = prompt("Please enter filename (.txt is added)","game")
	if (!filename) return false
	if (!filename.match(/[.][tT][xX][tT]$/)) filename += ".txt"
	var blob = new Blob([createCellspaceSpec()], {
		type: "text/plain",
	})
	if (navigator.msSaveBlob) { // IE
		navigator.msSaveBlob(blob,filename)
		return false
	} else {
		elem.download = filename
		elem.href = window.URL.createObjectURL(blob)
		return true
	}
}


var soundcopysource = null

function updateSoundOptions(elem) {
	if (elem.value) {
		elem.parentElement.className="optdef soundenabled"
	} else {
		elem.parentElement.className="optdef sounddisabled"
	}
}

function playSound(ruleidx) {
	var name = "rule_"+ruleidx
	var type = document.getElementById(name+"_soundtype").value
	var seed = document.getElementById(name+"_soundseed").value
	var sound = buildPresetSound(seed,type)
	JGAudio.load(name,sound.samples,true)
	JGAudio.play(name)
}

function randomizeSound(ruleidx) {
	var name = "rule_"+ruleidx
	document.getElementById(name+"_soundseed").value = randomstep(0,999999,1)
	playSound(ruleidx)
}

function copySound(ruleidx) {
	soundcopysource = ruleidx
}

function pasteSound(ruleidx) {
	if (soundcopysource === null) return
	var dstname = "rule_"+ruleidx
	var srcname = "rule_"+soundcopysource
	var type = document.getElementById(srcname+"_soundtype").value
	var seed = document.getElementById(srcname+"_soundseed").value
	document.getElementById(dstname+"_soundtype").value = type
	document.getElementById(dstname+"_soundseed").value = seed
	updateSoundOptions(document.getElementById(dstname+"_soundtype"))
}


// UI ENTRY POINT --------------------------------------------------------

function initIDE() {
	webGLStart()
	// resize triggers
	window.addEventListener('resize', resizeUI, false);
	document.addEventListener('fullscreenchange', resizeUI, false);
	document.addEventListener('mozfullscreenchange', resizeUI, false);
	document.addEventListener('webkitfullscreenchange', resizeUI, false);

	createPalette()
	updateTileset()
	updateSpritesheets()
	var gamesrc = PersistentState.getUrlParameter("gamesrc")
	if (!gamesrc) {
		gamesrc = createCellspaceSpec()
	}
	console.log(gamesrc)
	initCSGame(gamesrc)
	// XXX we have to wait until level starts before we can get level info
	var timer = setInterval(function() {
		if (JGState.isIn("Game") && CS && CS.getCurrentLevel()) {
			copyGameParam()
			copyLevelParam()
			copyLevelMap()
			createRuleUI()
			clearTimeout(timer)
			resizeUI()
			setPalette(0)
		}
	}, 20)
}

function getMiddleTRHeight() {
	return window.innerHeight - 35 - 70
}

function resizeUI() {
	//createRuleUI()
	var height = getMiddleTRHeight()
	//var mainblock = document.getElementById("mainblock")
	//mainblock.width = window.innerWidth
	//mainblock.style.width = window.innerWidth
	//mainblock.height = window.innerHeight
	//mainblock.style.height = window.innerHeight
	var editor = document.getElementById("leveleditor")
	editor.style.width = editor.parentNode.offsetWidth+"px"
	editor.style.height = height+"px"
	var elem = document.getElementById("cellrules")
	elem.style.height = height+"px"
	//elem = document.getElementById("cellrules")
	//console.log("set rules height: "+elem.parentNode.offsetHeight)
	//elem.style.height = elem.parentNode.offsetHeight
	//elem.height = elem.parentNode.offsetHeight
	var canvas = document.getElementById("game-canvas")
	canvas.style.width = canvas.parentNode.offsetWidth+"px"
	canvas.style.height = height+"px"
	canvas.width = canvas.parentNode.offsetWidth
	canvas.height = height
	//console.log("Canvas height:"+height);
	//canvas.style.width = canvas.parentNode.offsetWidth;
	//canvas.style.height = height;
	//canvas.width = canvas.parentNode.offsetWidth;
	//canvas.height = height;

}

// INIT UI ELEMS ---------------------------------------------------------

function createPalette() {
	html1 = ''
	html2 = ''
	for (var i=-1; i<nr_objects; i++) {
		html1 += "<div id='object"+i+"' class='sprite sprite"+i+"'"
		+" onclick='setPalette("+i+")'></div>"
	}
	for (var i=nr_objects-1; i>=-1; i--) {
		html2 += "<div id='objectsmall"+i+"' class='rulecell rulecell"+i+"'"
		+" onclick='setPalette("+i+")'></div>"
	}
	document.getElementById("palette-large").innerHTML = html1
	document.getElementById("palette-small").innerHTML = html2
	var select = createSelect(tilesetsizes,"tileset-select",null,"changeTilesetSize()")
	document.getElementById("tileset-select-container").innerHTML = select
	var select = createSelect(cellanims,"cellanim-select",null,"setCellAnim()")
	document.getElementById("cellanim-select-container").innerHTML = select
}

function createLevelEditor() {
	html = copyLevelMap()
	document.getElementById("leveleditor").innerHTML = html
}


// as a side effect, returns level editor table html
function copyLevelMap() {
	CS.defineLevel(lev)
	var levspec = levelspecs[levels[lev].levelsize]
	levels[lev].levelmap = []
	html = '<table cellpadding=0 cellspacing=0>\n'
	for (var y=0; y<levspec.h; y++) {
		html += '<tr>\n'
		levels[lev].levelmap.push([])
		for (var x=0; x<levspec.w; x++) {
			var tile=CS.Main.getTileIdFromMask(CS.Main.map.map[0][x+1][y+1],0,
				true)
			html += "<td id='map_"+x+"_"+y+"' class='tile tile"+tile+"'"
			+" onclick='setMap("+x+","+y+")'"
			+" onmouseover='checkSetMap(event,"+x+","+y+")'"
			+"></td>"
			levels[lev].levelmap[levels[lev].levelmap.length-1].push(tile)
		}
		html += '</tr>\n'
	}
	html += "</table>\n"
	return html
}

function getRulePattern(rule) {
	var pattern = []
	for (var y=0; y<3; y++) {
		pattern.push([])
		for (var x=0; x<6; x++) {
			var cell=null
			if (x<3) {
				cell = rule.context[x + 3*y]
			} else {
				cell = rule.output[x-3 + 3*y]
			}
			pattern[pattern.length-1].push(CS.Main.getTileIdFromMask(cell,0,true))
		}
	}
	return pattern
}

function getDirPattern(rule) {
	var pattern = []
	for (var y=0; y<3; y++) {
		pattern.push([])
		for (var x=0; x<3; x++) {
			var dirstr = rule.dirToString(rule.outdir[x+3*y])
			pattern[pattern.length-1].push(dirstr)
		}
	}
	return pattern
}


// Finds instances of options in string, returns "" if not found
// options: hash with option strings as keys
function getOptionFromString(string,options) {
	options = Object.keys(options)
	if (!string) return ""
	for (var i=0; i<options.length; i++) {
		var opt = options[i]
		if (opt=="") continue
		if (string.indexOf(opt) >= 0) {
			return opt
		}
	}
	return ""
}

function createRuleUI() {
	var elem = document.getElementById("cellrules_td")
	var height = getMiddleTRHeight()
	html = "<div id='cellrules' style='height:"+height+"px;'>"
	html += "<button class='toggle' onclick='toggleExpandRules(); editLevel(true)'>&lt;&lt;&lt; Toggle expand rules &gt;&gt;&gt;</button>"
	//html = "<div id='cellrules' style='height:"+elem.parentNode.offsetHeight+"px;overflow:scroll;'>"
	for (var i=0; i<levels[lev].nr_rules; i++) {
		html += "<div  class='ruleblock'>"
			+ createRuleBlock(i)
			+ "<div style='clear:both;'></div>\n"
			+ "</div>\n"
	}
	html += "</div>\n"
	elem.innerHTML = html
	for (var i=0; i<CS.Main.game.rules.length; i++) {
		var rule = CS.Main.game.rules[i]
		var ruleid = rule.id.match(/([0-9]+)/)
		if (!ruleid) {
			console.log("WARNING: cannot parse rule id '"+rule.id+"'")
			continue
		}
		ruleid = ruleid[0]
		var pattern = getRulePattern(rule)
		var outdir = getDirPattern(rule)
		setRuleBlock("rule_"+ruleid,
			pattern,
			outdir,
			rule.dirToString(rule.srcdir),
			rule.transformToString(),
			getOptionFromString(rule.condfuncstr,playercontrols),
			getOptionFromString(rule.condfuncstr,mousecontrols),
			rule.priority,
			rule.probability + (rule.probability==Math.floor(rule.probability)
								? ".0" :  "" ),
			rule.delayToString(),
			getOptionFromString(rule.outfuncstr,outfuncs),
			getSoundDefFromSource("rule_"+ruleid)
		)
	}
}

function createRuleBlock(ruleidx) {
	var name = "rule_"+ruleidx
	html = ""
	// pattern, transform
	html += "<table class='optdef' style='float:left'>\n"
	html += "<tr><td colspan=3>"+name
		+"<button class='rulebutton' onclick='clearRule(\""+name+"\")'>Clear</button>"
		+"<button class='rulebutton' onclick='copyRule(\""+name+"\")'>Copy</button>"
		+"<button class='rulebutton' onclick='pasteRule(\""+name+"\")'>Paste</button>"
		+"</td></tr>"
	html += "<tr><td>"+createRuleGrid(0,0,3,3,objects,name+"_lrhs","celldef") + "</td>\n"
	html += "<td> &rArr; </td>"
	html += "<td>"+createRuleGrid(3,0,6,3,objects,name+"_lrhs","celldef") + "</td></tr>\n"
	html += "<tr><td colspan=3>transform:"+createSelect(transforms,name+"_transform")+"</td></tr>\n";
	html += "</table>\n"
	// controls, priority, probability, deplay
	html += "<table class='optdef' style='float:left;margin-left:10px;'>\n"
	html += "<tr><td class='label'>keybrd:</td><td>"+createSelect(playercontrols,name+"_player")+"</td></tr>\n";
	html += "<tr><td class='label'>mouse:</td><td>"+createSelect(mousecontrols,name+"_mouse")+"</td></tr>\n";
	html += "<tr><td class='label'>priority:</td><td>"+createSelect(priorities,name+"_priority")+"</td></tr>\n";
	html += "<tr><td class='label'>probab.:</td><td>"+createSelect(probabilities,name+"_probability")+"</td></tr>\n";
	html += "<tr><td class='label'>delay:</td><td>"+createSelect(delays,name+"_delay")+"</td></tr>\n";
	html += "</table>\n"
	// conddir, outdir, outfunc
	html += "<table style='float:left;margin-left:10px;'>\n"
	html += "<tr class='optdef' ><td class='label'>conddir:</td><td>"+createSelect(conddirections,name+"_conddir")+"</td></tr>\n";
	html += "<tr><td class='label'> outdir:</td>"
	html += "<td><div style='float:left;'>"+createSelectGrid(0,0,3,3,directions,name+"_outdir","outdirselect") + "</div></td></tr>\n"
	html += "<tr><td class='label'>outfunc:</td><td class='optdef'>"+createSelect(outfuncs,name+"_outfunc")+"</td></tr>\n";
	html += "</table>\n"
	html +=" <div class='optdef sounddisabled'>sound: "+createSelect(soundtypes,name+"_soundtype",null,"updateSoundOptions(event.target)")
		+"<input id='"+name+"_soundseed' type='text' style='font-size:12px;' size=6 value='"+randomstep(0,999999,1)+"'></input>"
		+"<button class='soundhide' onclick='playSound(\""+ruleidx+"\")'>Play</button>"
		+"<button class='soundhide' onclick='randomizeSound(\""+ruleidx+"\")'>Random</button>"
		+"<button class='soundhide' onclick='copySound(\""+ruleidx+"\")'>Copy</button>"
		+"<button onclick='pasteSound(\""+ruleidx+"\")'>Paste</button>"
		+"</div>\n"
	return html
}

function createRuleGrid(x0,y0,x1,y1,options,cssid,cssclass) {
	if (!cssclass) cssclass="genericdef"
	html = "<table>"
	for (var dy=y0; dy<y1; dy++) {
		html += "<tr>"
		for (var dx=x0; dx<x1; dx++) {
			html += "<td id='"+cssid+"_"+dx+"_"+dy+"'"
				+" class='rulecell rulecell-1'"
				+" onclick='setRuleCell(\""+cssid+"\","+dx+","+dy+")'"
				+">"
				+"</td>"
		}
		html += "</tr>"
	}
	html +=  "</table>\n"
	return html
}

function createSelectGrid(x0,y0,x1,y1,options,cssid,cssclass) {
	if (!cssclass) cssclass="genericdef"
	html = "<table>"
	for (var dy=y0; dy<y1; dy++) {
		html += "<tr>"
		for (var dx=x0; dx<x1; dx++) {
			html += "<td>"+createSelect(options,
				cssid+"_"+dx+"_"+dy,cssclass)+"</td>"
		}
		html += "</tr>"
	}
	html +=  "</table>\n"
	return html
}

function createSelect(options,cssid,cssclass,onchange) {
	if (!cssclass) cssclass = ""
	if (!onchange) {
		onchange = ""
	} else {
		onchange = "onchange='"+onchange+"'"
	}
	html = "<select class='rule "+cssclass+"' id='"+cssid+"' "+onchange+" >"
	for (var key in options) {
		var val = options[key]
		html += "<option value='"+key+"'>"+val+"</option>"
	}
	html += "</select>\n"
	return html
}


// Rule Handling ------------------------------------------------------------

// use_class - use css class to get values, otherwise use value
// raw_values - do not convert indexes to cellsyms
function getRuleGrid(name,x1,y1,emptycell,use_class,raw_values) {
	var rawgrid = []
	grid = ""
	cells = 0
	emptycells = 0
	// check if we skip line 1 and 3
	var skipline0_2=true
	var yy0=0
	var yy1=y1
	if (y1 == 3) { // check if 3-line grid
		for (var y=0; y<y1; y+=2) {
			for (var x=0; x<x1; x++) {
				var cellitem = document.getElementById(name+"_"+x+"_"+y)
				if (use_class) {
					var cellidx = cellitem.className.match(/([0-9-]+)/)
					if (cellidx && cellidx[0] >= 0) {
						skipline0_2=false
					}
				} else {
					if (cellitem.value != emptycell) {
						skipline0_2=false
					}
				}
			}
		}
		var yy0 = skipline0_2 ? 1 : 0
		var yy1 = skipline0_2 ? 2 : 3
	}
	for (var y=0; y<y1; y++) {
		rawgrid.push([])
		for (var x=0; x<x1; x++) {
			var cellitem = document.getElementById(name+"_"+x+"_"+y)
			var cell = null
			if (use_class) {
				var cellidx = cellitem.className.match(/([0-9-]+)/)
				if (cellidx && cellidx[0] >= 0) {
					cell = celldefs[cellidx[0]][0]
					rawgrid[rawgrid.length-1].push(cellidx[0])
				} else {
					cell = "."
					rawgrid[rawgrid.length-1].push(-1)
				}
			} else {
				cell = cellitem.value
				rawgrid[rawgrid.length-1].push(cell)
			}
			if (y>=yy0 && y<yy1) grid +=  cell + " "
			cells += 1
			if (emptycell !== null && cell === emptycell) {
				emptycells += 1
			}
		}
		if (y>=yy0 && y<yy1) grid += "\n"
	}
	if (raw_values) {
		return rawgrid
	} else if (cells == emptycells) {
		return null
	} else {
		return grid
	}
}

function createRuleBlocks() {
	var rule = ""
	for (var i=0; i<levels[lev].nr_rules; i++) {
		var rule_is_present = document.getElementById("rule_"+i+"_lrhs_0_0")
		if (!rule_is_present) continue;
		var r = getRuleBlock("rule_"+i,false)
		if (r.pattern !== null) {
			rule += "rule: rule"+i+"\n"+r.pattern
			if (r.player != "" && r.mouse!="") {
				rule += "condfunc: "+r.player+" && "+r.mouse+"\n"
			} else if (r.player != "") {
				rule += "condfunc: "+r.player+"\n"
			} else if (r.mouse != "") {
				rule += "condfunc: "+r.mouse+"\n"
				//rule += "mouse: "+mouse+"\n"
			}
			rule += "priority: "+r.priority+"\n"
			if (r.transform != "") {
				rule += "transform: "+r.transform+"\n"
			}
			if (r.conddir != " ") {
				rule += "conddir: "+r.conddir+"\n"
			}
			if (r.outdir !== null) {
				rule += "outdir:\n"+r.outdir
			}
			if (r.probability!=1.0) {
				rule += "probability: "+r.probability+"\n"
			}
			rule += "delay: "+r.delay
				//+(player != "" ? " trigger player": "")
				+"\n"
			if (r.outfunc != "" && r.sounddef) {
				rule += "outfunc: "+r.outfunc+"; sound("+i+")\n"
			} else if (r.outfunc != "") {
				rule += "outfunc: "+r.outfunc+"\n"
			} else if (r.sounddef) {
				rule += "outfunc: sound("+i+")\n"
			}
		}
	}
	return rule
}

// UNUSED, currently done in createRuleBlocks
// XXX sound(name) must be sound(number)
function createOutfunc(name) {
	var outfunc = document.getElementById(name+"_outfunc").value
	var soundtype = document.getElementById(name+"_soundtype").value
	var soundseed = document.getElementById(name+"_soundseed").value
	if (outfunc && soundtype) {
		return outfunc+"; "+"sound('"+name+"');"
	} else if (outfunc) {
		return outfunc
	} else if (soundtype) {
		return "sound('"+name+"')"
	} else {
		return ""
	}
}
function getSoundDef(name) {
	var soundtype = document.getElementById(name+"_soundtype").value
	var soundseed = document.getElementById(name+"_soundseed").value
	if (!soundtype) return null
	//sfxdef is found in cellspace-main
	return {type:soundtype, seed:soundseed}
}

function createInitCode() {
	var init = ""
	// sound defs
	for (var i=0; i<levels[lev].nr_rules; i++) {
		var rule_is_present = document.getElementById("rule_"+i+"_lrhs_0_0")
		if (!rule_is_present) continue;
		var r = getRuleBlock("rule_"+i,false)
		if (r.sounddef != null) {
			init += "sfxdef("+i+",'"+r.sounddef.type+"',"+r.sounddef.seed+"); "
		}
	}
	return init
}


function getRuleBlock(name,raw_values) {
	return {
		"pattern": getRuleGrid(name+"_lrhs",6,3,emptycell,true,raw_values),
		"outdir": getRuleGrid(name+"_outdir",3,3,"-",false,raw_values),
		"conddir": document.getElementById(name+"_conddir").value,
		"transform": document.getElementById(name+"_transform").value,
		"player": document.getElementById(name+"_player").value,
		"mouse": document.getElementById(name+"_mouse").value,
		"priority": document.getElementById(name+"_priority").value,
		"probability": document.getElementById(name+"_probability").value,
		"delay": document.getElementById(name+"_delay").value,
		"outfunc": document.getElementById(name+"_outfunc").value,
		"sounddef": getSoundDef(name),
	}
}

function setRuleBlock(name,pattern,outdir,conddir,transform,player,mouse,
priority,probability,delay,outfunc,sounddef) {
	setRuleGrid(name+"_lrhs",6,3,pattern,true)
	setRuleGrid(name+"_outdir",3,3,outdir,false)
	document.getElementById(name+"_conddir").value = conddir
	document.getElementById(name+"_transform").value = transform
	document.getElementById(name+"_player").value = player
	document.getElementById(name+"_mouse").value = mouse
	document.getElementById(name+"_priority").value = priority
	document.getElementById(name+"_probability").value = probability 
	document.getElementById(name+"_delay").value = delay
	document.getElementById(name+"_outfunc").value = outfunc
	if (sounddef) {
		document.getElementById(name+"_soundtype").value = sounddef.type
		document.getElementById(name+"_soundseed").value = sounddef.seed
	} else {
		document.getElementById(name+"_soundtype").value = ""
	}
	updateSoundOptions(document.getElementById(name+"_soundtype"))
}

function setRuleGrid(name,x1,y1,values,use_class) {
	for (var y=0; y<y1; y++) {
		for (var x=0; x<x1; x++) {
			var value=null
			if (Array.isArray(values)) {
				value = values[y][x]
			} else {
				value = values
			}
			var elem = document.getElementById(name+"_"+x+"_"+y)
			if (use_class) {
				elem.className = "rulecell rulecell"+value
			} else {
				elem.value = value
			}
		}
	}

}


// Level Handling ------------------------------------------------------------

function getLevelMap() {
	if (!levels[lev].levelmap) {
		return levels[lev].map
	}
	var levspec = levelspecs[levels[lev].levelsize]
	map = ''
	for (var y=0; y<levspec.h; y++) {
		for (var x=0; x<levspec.w; x++) {
			map += celldefs[levels[lev].levelmap[y][x]][0]
		}
		map += "\n"
	}
	return map
}


// -------------------------------------------------------

function createWinLoseCond() {
	var ret = ""
	var conds = ["win","lose"]
	for (var i=0; i<conds.length; i++) {
		var cond = conds[i]
		var ena = document.getElementById(cond+"enabled").checked
		var tile = document.getElementById(cond+"tile").className
		if (ena) {
			var tileidx = tile.match(/([0-9-]+)/)
			if (tileidx && tileidx[0] >= 0) {
				ret += cond+": countCells('"+celldefs[tileidx[0]][0]+"')==0"
					+ "\n"
			}
		}
	}
	return ret
}

function createCellspaceSpec() {
	var rules = createRuleBlocks()
	var winlose = createWinLoseCond()
	var initcode = createInitCode()
	if (initcode) initcode = "globals: "+initcode
	if (rules == "") rules = levels[lev].fixedrules
	var cellstatements = ""
	for (var i=0; i<celldefs.length; i++) {
		var def = celldefs[i]
		var altdef = null
		if (CS.Main.game && CS.Main.game.cellsyms[def[0]]) {
			altdef = CS.Main.game.cellsyms[def[0]]
			console.log(altdef)
		}
		cellstatements += "cell: " +def[0]+" "+def[1]+" "+def[2]
			+" "+(altdef ? altdef.directional : def[3])
			+" "+def[4]
			+" "+(altdef ? (altdef.should_anim?"yes":"no") : def[5])+"\n"
	}
	return initcode+"\n"
+`
gamebackground: #444

tilemap: `
	+tileset_tilex+" "+tileset_tiley+" "
	+tileset_xtiles+" "+tileset_ytiles + ` no `+tileset+`

display: `+levels[lev].display+
`

background: `+document.getElementById("backgroundcolor").value+`
empty: .

`
/*`
cell: -   0 - no - no
cell: %   1 - rot4 - yes
cell: #   2 - rot4 - yes
cell: "   3 - rot4 - yes
cell: ~   4 - rot4 - yes

cell: H   5 - no - yes
cell: B   6 - no - yes
cell: :   7 - no - yes
cell: T   8 - no - yes
cell: S   9 - no - yes

cell: M  10 - no - yes
cell: P  11 - no - yes
cell: G  12 - no - yes
cell: ?  13 - no - yes
cell: &  14 - no - yes

cell: X  15 - no - yes
cell: =  16 - no - no
cell: *  17 - no - no
cell: !  18 - no - no
cell: $  19 - no - no

cell: +  20 - no - no
cell: @  21 - no - no
cell: ^  22 - no - no
cell: o  23 - no - no
cell: /  24 - no - no

`*/
/*`
background: #444

empty: .

cell: -   0 - no - no
cell: o  17 - no - yes
cell: @   5 - no - yes
cell: X   7 - rot4 - yes
cell: ~  11 - rot4 - yes
cell: &  19 - rot4 - yes
cell: #   2 - no - no
cell: :  13 - no - no
`*/
+cellstatements
+"\n"
+rules
+"\n"
+`

level: #

`
+getLevelMap()
+winlose
+"\ntitle: "
+document.getElementById("leveltitle").value
}


