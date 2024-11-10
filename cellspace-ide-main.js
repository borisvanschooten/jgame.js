gametype = "minimal-noresize"

//GameConfig: { "gamemode": "no-title",
//              "disableAudio": true, "disableRestart": true }

levelsizes = {
	"38x22": "38x22",
	"56x33": "56x33",
}

levelspecs = {
	"38x22": {
		w: 38, h: 22,
		tilex: 48, tiley: 48,
	},
	"56x33": {
		w: 56, h: 33,
		tilex: 32, tiley: 32,
	},
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


emptycell = "."
emptycell_index = -1

directions = {
	"-": "-",
	"L": "L",
	"R": "R",
	"U": "U",
	"D": "D",
}

conddirections = {
	" ": " ",
	"-": "-",
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
	"0.005":"0.005",
	"0.002":"0.002",
}
//delay=0 not working?
delays = {
	"1":"1",
	"2":"2",
	"3":"3",
	"4":"4",
	"5":"5",
	"6":"6",
	"7":"7",
	"8":"8",
	"1 trigger player":"1 kbd",
	"2 trigger player":"2 kbd",
	"3 trigger player":"3 kbd",
	"4 trigger player":"4 kbd",
	"5 trigger player":"5 kbd",
	"6 trigger player":"6 kbd",
	"7 trigger player":"7 kbd",
	"8 trigger player":"8 kbd",
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

// GLOBALS ------------------------------------------------
var lev = 0
var pencil = 0 // -1 is don't care / empty
var levelsize = "38x22"
var levelmap = null

var defaultTileset = "genericimages-4x4-1.png"
var tileset = defaultTileset
var tileset_xtiles = 4
var tileset_ytiles = 4
nr_objects = tileset_xtiles*tileset_ytiles;

// LEVELS ------------------------------------------------


levels = [
{ nr_rules:25,
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


// UI events ----------------------------------------------------------------

function runLevel() {
	var spec = createCellspaceSpec()
	console.log(spec)
	initCSGame(spec)
	for (var i=0; i<CS.Main.game.rules.length; i++) {
		//console.log(CS.Main.game.rules[i])
		//console.log(CS.Main.game.rules[i].toString())
	}
	document.getElementById("leveleditor").style.display='none'
	document.getElementById("game-canvas").style.display='block'
	document.getElementById("game-canvas").focus()
	
}

function editLevel() {
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
	}
	window.open("cellspace-play.html?gametype=minimal&gamesrc=" + encodeURIComponent(spec), "_blank")
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
	var url = prompt("Tileset URL (empty = default)")
	if (url.trim() == "") {
		tileset = defaultTileset
	} else {
		tileset = url
	}
	updateTileset()
}

function updateTileset() {
	css = ""
	classes = [".sprite",".tile",".rulecell, #cellrules .rulecell"]
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
}

function updateSpritesheets() {
	css = ""
	classes = [".sprite",".tile",".rulecell"]
	sizes = [ {x:32,y:32},{x:24,y:24},{x:16,y:16} ]
	for (var i=0; i<classes.length; i++) {
		var size = sizes[i]
		for (var y=0; y<tileset_xtiles; y++) {
			for (var x=0; x<tileset_ytiles; x++) {
				var n = x + tileset_xtiles*y
				css += classes[i] + n + " {"
			     + " background-position: "
				 + (-x*size.x) + "px " + (-y*size.y) + "px; }\n"
			}
		}
	}
	document.getElementById("spritesheets").textContent = css
}


function clearRule(name) {
	var yes = confirm("Clear "+name+"?")
	if (yes) {
		setRuleBlock(name, emptycell_index, "-", " ", "-", "", "", 1, "1.0",3,"")
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
		console.log(r)
		setRuleBlock(name,r.pattern,r.outdir,r.conddir,r.transform,
			r.player,r.mouse,r.priority,r.probability,r.delay,r.outfunc)
	}
}

function setPalette(idx) {
	document.getElementById("object"+pencil).style.borderColor='black'
	document.getElementById("objectsmall"+pencil).style.borderColor='black'
	pencil = idx
	document.getElementById("object"+idx).style.borderColor='white'
	document.getElementById("objectsmall"+idx).style.borderColor='white'
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

function copyGameParam() {
	tileset = CS.Main.game.tilemapurl
	updateTileset()
	updateSpritesheets()
}

function copyLevelParam() {
	document.getElementById("leveltitle").value = CS.Main.curlev.title
	setLevelCond("win",CS.Main.curlev.win)
	setLevelCond("lose",CS.Main.curlev.lose)
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



// UI ENTRY POINT --------------------------------------------------------

function initIDE() {
	webGLStart()
	// resize triggers
	window.addEventListener('resize', resizeUI, false);
	document.addEventListener('fullscreenchange', resizeUI, false);
	document.addEventListener('mozfullscreenchange', resizeUI, false);
	document.addEventListener('webkitfullscreenchange', resizeUI, false);

	updateTileset()
	updateSpritesheets()
	createPalette()
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
	html = ''
	for (var i=-1; i<nr_objects; i++) {
		html += "<div id='object"+i+"' class='sprite sprite"+i+"'"
		+" onclick='setPalette("+i+")'></div>"
	}
	for (var i=nr_objects-1; i>=-1; i--) {
		html += "<div id='objectsmall"+i+"' class='rulecell rulecell"+i+"'"
		+" onclick='setPalette("+i+")'></div>"
	}
	document.getElementById("palette").innerHTML = html
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


// string can be <option> or <option> && <option>
function getOptionFromString(string,options) {
	if (!string) return ""
	var opts = string.split("&&")
	for (var i=0; i<opts.length; i++) {
		var opt = opts[i].trim()
		if (options[opt]) return opt
	}
	return ""
}

function createRuleUI() {
	var elem = document.getElementById("cellrules_td")
	var height = getMiddleTRHeight()
	html = "<div id='cellrules' style='height:"+height+"px;'>"
	//html = "<div id='cellrules' style='height:"+elem.parentNode.offsetHeight+"px;overflow:scroll;'>"
	for (var i=0; i<levels[lev].nr_rules; i++) {
		html += "<div  class='ruleblock'>"
			+ createRuleBlock('rule_'+i)
			+ "<div style='clear:both;'></div>\n"
			+ "</div>\n"
	}
	html += "</div>\n"
	elem.innerHTML = html
	for (var i=0; i<CS.Main.game.rules.length; i++) {
		var rule = CS.Main.game.rules[i]
		var pattern = getRulePattern(rule)
		var outdir = getDirPattern(rule)
		setRuleBlock("rule_"+i,
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
		)
	}
}

function createRuleBlock(name) {
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
	html += "</div>\n"
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
	html += "<td><div style='float:left;'>"+createSelectGrid(0,0,3,3,directions,name+"_outdir") + "</div></td></tr>\n"
	html += "<tr><td class='label'>outfunc:</td><td>"+createSelect(outfuncs,name+"_outfunc")+"</td></tr>\n";
	html += "</table>\n"
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

function createSelect(options,cssid,cssclass) {
	if (!cssclass) cssclass = ""
	html = "<select class='rule "+cssclass+"' id='"+cssid+"'>"
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
			grid +=  cell + " "
			cells += 1
			if (emptycell !== null && cell === emptycell) {
				emptycells += 1
			}
		}
		grid += "\n"
	}
	if (raw_values) {
		return rawgrid
	} else if (cells == emptycells) {
		return null
	} else {
		return grid
	}
}

function getRuleBlocks() {
	var rule = ""
	for (var i=0; i<levels[lev].nr_rules; i++) {
		var rule_is_present = document.getElementById("rule_"+i+"_lrhs_0_0")
		if (!rule_is_present) continue;
		var r = getRuleBlock("rule_"+i,false)
		if (r.pattern !== null) {
			rule += "rule: rule"+i+"\n"+r.pattern+"\n"
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
			rule += "outdir:\n"+r.outdir+"\n"
			rule += "probability: "+r.probability+"\n"
			rule += "delay: "+r.delay
				//+(player != "" ? " trigger player": "")
				+"\n"
			if (r.outfunc != "") {
				rule += "outfunc: "+r.outfunc+"\n"
			}
		}
	}
	return rule
}

function getRuleBlock(name,raw_values) {
	return {
		"pattern": getRuleGrid(name+"_lrhs",6,3,emptycell,true,raw_values),
		"outdir": getRuleGrid(name+"_outdir",3,3,"",false,raw_values),
		"conddir": document.getElementById(name+"_conddir").value,
		"transform": document.getElementById(name+"_transform").value,
		"player": document.getElementById(name+"_player").value,
		"mouse": document.getElementById(name+"_mouse").value,
		"priority": document.getElementById(name+"_priority").value,
		"probability": document.getElementById(name+"_probability").value,
		"delay": document.getElementById(name+"_delay").value,
		"outfunc": document.getElementById(name+"_outfunc").value,
	}
}

function setRuleBlock(name,pattern,outdir,conddir,transform,player,mouse,
priority,probability,delay,outfunc) {
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

function getWinLoseCond() {
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
	var rules = getRuleBlocks()
	var winlose = getWinLoseCond()

	if (rules == "") rules = levels[lev].fixedrules
	var cellstatements = ""
	for (var i=0; i<celldefs.length; i++) {
		var def = celldefs[i]
		cellstatements += "cell: " +def[0]+" "+def[1]+" "+def[2]
			+" "+def[3]+" "+def[4]+" "+def[5]+"\n"
	}
	return `
gamebackground: #648

tilemap: 16 16 `+tileset_xtiles+" "+tileset_ytiles+` no `+tileset+`

display: `+levels[lev].display+
`

background: #444
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


