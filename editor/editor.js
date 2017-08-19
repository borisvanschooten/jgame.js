
var myTextArea = document.getElementById("source");

pauseWebGL(true);

function reportConsole(type,message) {
	var div = document.getElementById("console");
	div.innerHTML += "["+type+"]: "+message + "<br>";
}

function clearConsole() {
	var div = document.getElementById("console");
	div.innerHTML = "";
}

// override reportConsole to go to div
IOAPI.reportConsole = reportConsole;

// load source from local storage
setGameSource(localStorage.getItem("tmtg.net.CellSpaceIDE.src"));

// load source file
var gameFileName = PersistentState.getUrlParameter("edit");

if (gameFileName) {
	httpGet("games/"+gameFileName,function(err,res) {
		if (err) {
			setGameSource("");
		} else {
			setGameSource(res);
		}
	});
}

function buttonFullScreen(fullscreen) {
	var canvas = document.getElementById("game-canvas");
	if(canvas.requestFullScreen)
		canvas.requestFullScreen();
	else if(canvas.webkitRequestFullScreen)
		canvas.webkitRequestFullScreen();
	else if(canvas.mozRequestFullScreen)
		canvas.mozRequestFullScreen();
	else if(canvas.msRequestFullScreen)
		canvas.msRequestFullScreen();
}

function buttonPauseWebGL(pause) {
	pauseWebGL(pause);
	document.getElementById("pauseoverlay").style.display =
		pause ? "block" : "none";
}

// init editor
var editor = CodeMirror.fromTextArea(myTextArea, {
	lineNumbers: true,
	lineWrapping: true,
	gutters:['CodeMirror-linenumbers','highlight'],
});

function resizeEditor() {
	var div = document.getElementById("editdiv");
	editor.setSize(div.offsetWidth-10,div.offsetHeight-10);
	//editor.setSize(window.innerWidth/2-10,window.innerHeight-10);
}
resizeEditor();
//window.addEventListener('resize', resizeEditor, false);

var errorWidgets = [];

function initCSGameFromTextArea() {
	clearConsole();
	reportConsole("Compiler","Compiling game ...");
	initCSGame(editor.getValue());
	//reportConsole("Compiler",JSON.stringify(CS.getErrorLog()));
	for (var i=0; i<errorWidgets.length; i++) {
		editor.removeLineWidget(errorWidgets[i]);
	}
	var errs = CS.getErrorLog();
	for (var i=0; i<errs.length; i++) {
		var err = errs[i];

		var msg = document.createElement("div");
		var icon = msg.appendChild(document.createElement("span"));
		icon.innerHTML = "!!";
		icon.className = "cs-error-icon";
		msg.appendChild(document.createTextNode(
			"["+err.type+"]: "+err.message));
		msg.className = "cs-error";
		errorWidgets.push(editor.addLineWidget(err.linenr, msg,
			{coverGutter: false, noHScroll: false} ));
		reportConsole("Compiler","line "+err.linenr+": "+err.message);
	}
	if (CS.getGame()) {
		reportConsole("Compiler","Compile successful.");
		buttonPauseWebGL(false);
		updateTileIndexes();
	} else {
		reportConsole("Compiler","Compile aborted.");
	}
}

function setGameSource(src) {
	if (editor) {
		editor.setValue(src);
	} else {
		myTextArea.value = src;
	}
}

function downloadGameSource() {
	var sourceblob = new Blob([editor.getValue()], {type: 'text/plain'});
	url = URL.createObjectURL(sourceblob);
	document.getElementById("downloadlink").href = url;
}

function uploadGameSource(elem) {
	var files = elem.files;
	if (files.length==0) return;
	var yes = confirm("Unsaved work will be lost! Are you sure?");
	if (!yes) return;
	var reader = new FileReader();
	reader.onload = function(e) {
		setGameSource(e.target.result);
	}
	reader.readAsText(files[0]);
	elem.value = '';
}


function saveGameSource() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE ) {
			if (xhr.status == 200) {
				alert("Saved!");
				//success(xhr.responseText);
			} else {
				alert("Save failed: "+xhr.status);
				//failure(""+xhr.status);
			}
		}
	}
	xhr.overrideMimeType('text/plain');
	xhr.open("POST", "php/writefile.php?file="+gameFileName, true);
	xhr.send(editor.getValue());
}

function updateTileIndexes() {
	var game = CS.getGame();
	if (!game) return;
	var canvas = document.getElementById("tileindexes");
	if (canvas.offsetWidth < canvas.offsetHeight) {
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetWidth;
	} else {
		canvas.height = canvas.offsetHeight;
		canvas.width = canvas.offsetHeight;
	}
	var ctx = canvas.getContext('2d');
	ctx.strokeStyle="#008800";
	ctx.font = "10px Arial";
	var canvx = canvas.width;
	var canvy = canvas.height;
	var image = new Image();
	image.onload = function() {
		ctx.drawImage(image,0,0,
			canvas.width,canvas.height);
		for (var y=0; y<=game.tiletex_nrtilesy; y++) {
			ctx.beginPath();
			ctx.moveTo(0, y * (canvy / game.tiletex_nrtilesy));
			ctx.lineTo(canvx, y * (canvy / game.tiletex_nrtilesy));
			ctx.stroke();
		}
		for (var x=0; x<=game.tiletex_nrtilesx; x++) {
			ctx.beginPath();
			ctx.moveTo(x * (canvx / game.tiletex_nrtilesx),0);
			ctx.lineTo(x * (canvx / game.tiletex_nrtilesx),canvy);
			ctx.stroke();
		}
		var idx=0;
		for (var y=0; y<game.tiletex_nrtilesy; y++) {
			for (var x=0; x<game.tiletex_nrtilesx; x++) {
				ctx.fillStyle="#000000";
				ctx.fillText(""+idx,
					1 + x * ((canvx) / game.tiletex_nrtilesx),
					9 + y * ((canvy) / game.tiletex_nrtilesy) );
				ctx.fillText(""+idx,
					2 + x * ((canvx) / game.tiletex_nrtilesx),
					9 + y * ((canvy) / game.tiletex_nrtilesy) );
				ctx.fillStyle="#ffffff";
				ctx.fillText(""+idx,
					2 + x * ((canvx) / game.tiletex_nrtilesx),
					10 + y * ((canvy) / game.tiletex_nrtilesy) );
				idx++;
			}
		}
	};
	var url = processImageURL(game.tilemapurl,false);
	image.src = url;
}


// wizard

var editorContextMenuLine=-1;

editor.on("gutterClick", function(cm,linenr) {
	if (linenr == editorContextMenuLine) {
		closeContextMenu(true);
		return;
	}
	closeContextMenu(false);
	// highlight line
	editorContextMenuLine = linenr;
	var marker = document.createElement("div");
	marker.style.width = "25px";
	marker.style.backgroundColor= "#ccc";
	marker.innerHTML="&gt;&gt;&gt;";
	cm.setGutterMarker(linenr,"highlight",marker);
	// open menu
	var elem = document.getElementById("contextmenu");
	elem.style.display="block";
	var coord = cm.charCoords({line:linenr, ch:0});
	var top = coord.top;
	if (top + 450 > window.innerHeight) top = window.innerHeight-450;
	elem.style.top = top+"px";
	elem.style.left = "50px";
});


function insertCodeFromContextMenu(code) {
	editor.replaceRange(code,
		{line: editorContextMenuLine, ch: 0});
}

function closeContextMenu(cancel) {
	var elem = document.getElementById("contextmenu");
	elem.style.display="none";
	if (editorContextMenuLine >= 0) {
		editor.setGutterMarker(editorContextMenuLine,"highlight",null);
	}
	if (cancel) {
		editorContextMenuLine = -1;
	}
}

function opendialog(dialog) {
	closeContextMenu();
	var elem = document.getElementById(dialog+"dialog");
	elem.style.display="block";
	
}

function buttonSaveLocalStorage() {
	if (localStorage) {
		localStorage.setItem("tmtg.net.CellSpaceIDE.src",editor.getValue());
		alert("Code saved to browser cache!");
	} else {
		alert("Could not save: localStorage not supported!");
	}
}
function buttonLoadLocalStorage() {
	if (localStorage) {
		var yes = confirm("Unsaved work will be lost! Are you sure?");
		if (!yes) return;
		editor.setValue(localStorage.getItem("tmtg.net.CellSpaceIDE.src"));
	} else {
		alert("Could not load: localStorage not supported!");
	}
}

