

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

async function loadJSON(url) {
	url = GameConfig.gamedir + url;
	try {
		const response = await fetch(url+"?t="+Date.now());
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Failed to load JSON:", error);
		throw error;
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
if (!gamedir) gamedir=defaultgamedir;

loadScript(gamedir+"game.js",async function() {
	// copy gamedir if not set
	if (!GameConfig.gamedir) {
		GameConfig.gamedir = gamedir;
	}
	// use loadGame to load extra assets, using async-await to ensure loading is finished before webGLStart is called
	if (GameConfig.loadGame) {
		await GameConfig.loadGame();
	}
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

