

// array of { url, callback }
//var ScriptLoadQueue = [];

// inject game code into html's head
function loadScript(scriptname,callback) {
	var s = document.createElement("script");
	s.type = "text/javascript";
	s.src = scriptname;
	document.getElementsByTagName('head')[0].appendChild(s);
	if (document.readyState === 'complete') {
		if (callback) callback();
	} else {
		window.onload = callback;
	}
}


/*var JGameBaseFiles = [
	"jgame/jgcanvas.js",
	"jgame/jgstate.js",
	"jgame/jgobject.js",
	"jgame/jgaudio.js",
	"jgame/jgtiles.js",
	"jgame/jgmenu.js",
	"jgame/gl.js",
	"jgame/gldraw.js",
	"jgame/jgspritebatch.js",

	"jgame/persistentstate.js",
	"jgame/gamemessages.js",
	"jgame/genericgameobjects.js",
];

// load lib
for (var i=0; i<JGameBaseFiles.length; i++) {
	loadScript(JGameBaseFiles[i]);
}*/


// load game defs
gamedir = PersistentState.getUrlParameter("game");
if (!gamedir) gamedir="";

loadScript(gamedir+"game.js",function() {

	// load extra scripts
	if (GameConfig.scripts) {
		for (var i=0; i<GameConfig.scripts.length; i++) {
			loadScript(gamedir + GameConfig.scripts[i]);
		}
	}
	if (document.readyState === 'complete') {
		webGLStart();
	} else {
		window.onload = function() {
			webGLStart();
		};
	}

});

