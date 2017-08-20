// generate wizard forms using jsonform

// helpers


// the form defs

createJsonForm("gameconfig", {
	schema: {
		gamedir: {
			title: 'gamedir:',
			type: 'string',
			description: "Base URL for textures and sounds",
		},
		name: {
			title: 'name:',
			type: 'string',
			description: "Name of game",
		},
		gamemode: {
			title: 'gamemode:',
			type: 'string',
			description: "Level progression mode",
			enum: ["separate-levels", "continuous-levels", "no-title"]
		},
		title: {
			title: 'title:',
			type: 'string',
			description: "Title displayed on title screen",
		},
		titlebg: {
			title: 'titlebg:',
			type: 'string',
			description: "Name of background texture to use on title screen",
			placeholder: "Optional",
		},
	},
	form: [
		{
			key: "gamedir", 
		},
		{
			key: "name",
		},
		{
			key: "gamemode", 
		},
		{
			key: "title", 
		},
		{
			key: "titlebg", 
			placeholder: "Optional",
		},
		{
			"type": "submit",
			"title": "Insert code",
		},
	],
	onSubmit: function (errors, val) {
		if (errors) {
			alert(errors);
		} else {
			var code=""
			+"var GameConfig = {\n"
			+"	gamedir: \""+val["gamedir"]+"\",\n"
			+"	name: \""+val["name"]+"\",\n"
			+"	gamemode: \""+val["gamemode"]+"\",\n"
			+"	title: \""+val["title"]+"\",\n"
			+(val["titlebg"] ?  "	titlebg: \""+val["titlebg"]+"\",\n" : "")
			+"	sounds: {\n"
			+"		// Insert your sounds here\n"
			+"		\"mysound\": \"sounds/MySound\",\n"
			+"	},\n"
			+"	textures: {\n"
			+"		// Insert your textures here\n"
			+"		\"tex1\": {url:\"images/tex1.png\",smooth:true,wrap:false},\n"
			+"	},\n"
			+"	// Insert a spritesheet definition here (use the code wizard)\n"
			+"	// Insert a tilemap definition here (use the code wizard)\n"
			+"	score: {\n"
			+"		// Score definition example, time taken = score\n"
			+"		get: getGameTimeTaken,\n"
			+"		betterthan: function(score1,score2) { return score1>score2; },\n"
			+"		display: function(score) { return \"Time: \"+timestampToString(score); },\n"
			+"		displayhighscore: function(score) {\n"
			+"			return [\n"
			+"				\"Best Time:\",\n"
			+"				(score/1000).toFixed(3) + \" sec\"\n"
			+"			];\n"
			+"		}\n"
			+"	},\n"
			+"	leveldefs: {\n"
			+"		// Level definition example\n"
			+"		stdlevel : {\n"
			+"			newlevel: myStartNewLevel,\n"
			+"			scenery: {\n"
			+"				layers: [\n"
			+"					// back\n"
			+"					//{ tex: \"bg1\", w:1800, h:1024, col: [1, 1, 1, 0.85],\n"
			+"					//xofs: 0, yofs: 20, scale: 0.6, },\n"
			+"					// front\n"
			+"					//{ tex: \"bg1\", w:1800, h:1024, col: [1, 1, 1, 1],\n"
			+"					//	xofs: 0, yofs: 0, scale: 1.2, },\n"
			+"				],\n"
			+"				bg: \"tex1\",\n"
			+"				moving: 2.0,\n"
			+"				vertical: false,\n"
			+"			},\n"
			+"			playerofs: {x: 500, y: 0},\n"
			+"		},\n"
			+"	},\n"
			+"	levels: [\n"
			+"		// Level example\n"
			+"		{\n"
			+"			name: \"\", def: \"stdlevel\",\n"
			+"			intro: [\n"
			+"				{ text: \"This is an example level\", textsize: 65 },\n"
			+"				{ text: \"\" },\n"
			+"				{ text: \"Fill in the text you want to show\" },\n"
			+"				{ text: \"at the start of the level here.\" },\n"
			+"			],\n"
			+"		},\n"
			+"	],\n"
			+"};\n"

			insertCodeFromContextMenu(code);
			//$('#res').html(code);
			$('#globalsdialog').css("display","none");
		}
	}
});


createJsonForm("spritesheet", {
	schema: {
		texture_url: {
			title: 'texture URL:',
			type: 'string',
			description: "URL of tile map texture",
		},
		unitx: {
			title: 'unit.x:',
			type: 'number',
			description: "Width in pixels of single tile in texture",
		},
		unity: {
			title: 'unit.y:',
			type: 'number',
			description: "Height in pixels of single tile in texture",
		},
		countx: {
			title: 'count.x:',
			type: 'number',
			description: "Number of tiles in horizontal direction in texture",
		},
		county: {
			title: 'count.y:',
			type: 'number',
			description: "Number of tiles in vertical direction in texture",
		},
	},
	form: [
		{
			key: "texture_url", 
			htmlClass: "string",
		},
		{
			key: "unitx", 
			htmlClass: "number",
		},
		{
			key: "unity", 
			htmlClass: "number",
		},
		{
			key: "countx", 
			htmlClass: "number",
		},
		{
			key: "county", 
			htmlClass: "number",
		},
		{
			"type": "submit",
			"title": "Insert code",
		}
	],
	onSubmit: function (errors, val) {
		if (errors) {
			alert(errors);
		} else {
			var code = ""
			+"	spritesheet: {\n"
			+"		texture: {url:\""+val.texture_url+"\", smooth: false, wrap:false},\n"
			+"		unitx: "+val.unitx+",\n"
			+"		unity: "+val.unity+",\n"
			+"		countx: "+val.countx+",\n"
			+"		county: "+val.county+",\n"
			+"	},\n"

			insertCodeFromContextMenu(code);
			$('#spritesheetdialog').css("display","none");
		}
	}
});

createJsonForm("tilemap", {
	schema: {
		texture_url: {
			title: 'texture URL:',
			type: 'string',
			description: "URL of tile map texture",
		},
		unitx: {
			title: 'unit.x:',
			type: 'number',
			description: "Width in pixels of single tile in texture",
		},
		unity: {
			title: 'unit.y:',
			type: 'number',
			description: "Height in pixels of single tile in texture",
		},
		countx: {
			title: 'count.x:',
			type: 'number',
			description: "Number of tiles in horizontal direction in texture",
		},
		county: {
			title: 'count.y:',
			type: 'number',
			description: "Number of tiles in vertical direction in texture",
		},
	},
	form: [
		{
			key: "texture_url", 
			htmlClass: "string",
		},
		{
			key: "unitx", 
			htmlClass: "number",
		},
		{
			key: "unity", 
			htmlClass: "number",
		},
		{
			key: "countx", 
			htmlClass: "number",
		},
		{
			key: "county", 
			htmlClass: "number",
		},
		{
			"type": "submit",
			"title": "Insert code",
		}
	],
	onSubmit: function (errors, val) {
		if (errors) {
			alert(errors);
		} else {
			var code = ""
			+"	tilemap: {\n"
			+"		texture: {url:\""+val.texture_url+"\", smooth: false, wrap:false},\n"
			+"		unitx: "+val.unitx+",\n"
			+"		unity: "+val.unity+",\n"
			+"		countx: "+val.countx+",\n"
			+"		county: "+val.county+",\n"
			+"		tilex: 90,\n"
			+"		tiley: 90,\n"
			+"		nrtilesx: 22,\n"
			+"		nrtilesy: 12,\n"
			+"		filltile: -1,\n"
			+"		filltilecid: 0,\n"
			+"	},\n";
			insertCodeFromContextMenu(code);
			$('#tilemapdialog').css("display","none");
		}
	}
});



createJsonForm("jgobject", {
	schema: {
		classname: {
			title: 'classname:',
			type: 'string',
			description: "Name of class",
		},
		unique: {
			title: 'unique:',
			type: 'string',
			description: "Is there only one object of this type in the game?",
			enum: ["false","true"],
		},
		cid: {
			title: 'collision ID:',
			type: 'number',
			description: "Can be: 1=player, 2=enemy, 4=bullet, 8=pickup",
		},
	},
	form: [
		{
			key: "classname", 
		},
		{
			key: "unique", 
		},
		{
			key: "cid", 
			htmlClass: "number",
		},
		{
			"type": "submit",
			"title": "Insert code",
		}
	],
	onSubmit: function (errors, val) {
		if (errors) {
			alert(errors);
		} else {
			var code = ""
			+"// --------------------------------------------------------------------\n"
			+"\n"
			+"function "+val.classname+"(x,y) {\n"
			+"	JGObject.apply(this,[\""+val.classname+"\","+val.unique+",x,y, "+val.cid+"]);\n"
			+"	this.sprite = 10;\n"
			+"	this.setBBox(0.2*tilex,0.2*tiley,0.6*tilex,0.6*tiley);\n"
			+"}\n"
			+"\n"
			+val.classname+".prototype = new JGObject();\n"
			+"\n"
			+val.classname+".prototype.move = function() {\n"
			+"}\n"
			+"\n"
			+val.classname+".prototype.hit = function(obj) {\n"
			+"	//JGState.add(\"GameOver\",-1);\n"
			+"	//createParticles(this.x+tilex/2,this.y+tiley/2,15,\"explosion\",explo1);\n"
			+"}\n"
			+"\n"
			+val.classname+".prototype.hit_bg = function(tilecid) {\n"
			+"	var tiles = this.getTiles(tilemap);\n"
			+"	for (var tx=tiles.x; tx<tiles.x+tiles.width; tx++) {\n"
			+"		for (var ty=tiles.y; ty<tiles.y+tiles.height; ty++) {\n"
			+"			var cid = tilemap.getTileCidPos(tx,ty);\n"
			+"			//do something with tile here\n"
			+"		}\n"
			+"	}\n"
			+"}\n"
			+"\n"
			+"\n"
			+val.classname+".prototype.paint = function(gl) {\n"
			+"	spritebatch.addSprite(Math.floor(this.sprite),\n"
			+"		this.x-screenxofs,this.y-screenyofs,\n"
			+"		true,tilex,tiley,0, null);\n"
			+"}\n"
			+"\n";

			insertCodeFromContextMenu(code);
			$('#jgobjectdialog').css("display","none");
		}
	}
});



createJsonForm("tilesprite", {
	schema: {
		classname: {
			title: 'classname:',
			type: 'string',
			description: "Name of class",
		},
		unique: {
			title: 'unique:',
			type: 'string',
			description: "Is there only one object of this type in the game?",
			enum: ["false","true"],
		},
		cid: {
			title: 'collision ID:',
			type: 'number',
			description: "Can be: 1=player, 2=enemy, 4=bullet, 8=pickup",
		},
	},
	form: [
		{
			key: "classname", 
		},
		{
			key: "unique", 
		},
		{
			key: "cid", 
			htmlClass: "number",
		},
		{
			"type": "submit",
			"title": "Insert code",
		}
	],
	onSubmit: function (errors, val) {
		if (errors) {
			alert(errors);
		} else {
			var code = ""
			+"// --------------------------------------------------------------------\n"
			+"\n"
			+"function "+val.classname+"(tx,ty) {\n"
			+"	TileSprite.apply(this,[\""+val.classname+"\","+val.unique+",tx,ty, "+val.cid+"]);\n"
			+"	this.sprite = 0;\n"
			+"	this.anim = {start: 0, end: 3, speed: 0.03, vertical: true};\n"
			+"	this.init();\n"
			+"	this.setBBox(0.2*tilex,0.2*tiley,0.6*tilex,0.6*tiley);\n"
			+"}\n"
			+"\n"
			+val.classname+".prototype = new TileSprite();\n"
			+"\n"
			+val.classname+".prototype.move = function() {\n"
			+"	this.moveFunc();\n"
			+"	if (!this.transition) {\n"
			+"		if (eng.getKey(\"A\") && !this.getEnv(-1,0,0x300)) {\n"
			+"			this.goTo(this.tx-1,this.ty,10);\n"
			+"		}\n"
			+"		if (eng.getKey(\"D\") && !this.getEnv(1,0,0x300)) {\n"
			+"			this.goTo(this.tx+1,this.ty,10);\n"
			+"		}\n"
			+"		if (eng.getKey(\"W\") && !this.getEnv(0,-1,0x300)) {\n"
			+"			this.goTo(this.tx,this.ty-1,10);\n"
			+"		}\n"
			+"		if (eng.getKey(\"S\") && !this.getEnv(0,1,0x300)) {\n"
			+"			this.goTo(this.tx,this.ty+1,10);\n"
			+"		}\n"
			+"	}\n"
			+"}\n"
			+"\n"
			+val.classname+".prototype.hit = function(obj) {\n"
			+"	//createParticles(this.x+tiley/2,this.y+tiley/2,15,\"explosion\",explo3);\n"
			+"}\n"
			+"\n"
			+val.classname+".prototype.hit_bg = function(tilecid) {\n"
			+"}\n"
			+"\n"
			+val.classname+".prototype.paint = function(gl) {\n"
			+"	this.paintFunc(gl);\n"
			+"}\n"
			+"\n";


			insertCodeFromContextMenu(code);
			$('#tilespritedialog').css("display","none");
		}
	}
});






