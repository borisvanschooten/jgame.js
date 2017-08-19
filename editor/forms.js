// generate wizard forms using jsonform

// helpers

function formsGetOptCode(values,key,defaultval) {
	if (!defaultval && !values[key] && values[key]!==0) return "";
	if (defaultval && values[key]==defaultval) return "";
	return key + ": " + values[key] + "\n";
}

function mergeRuleLR(l,r) {
	ltok = l.split(/\s+/);
	rtok = r.split(/\s+/);
	var ret="";
	if (ltok.length==1) {
		ltok = [".",ltok[0],"."];
	}
	if (rtok.length==1) {
		rtok = [".",rtok[0],"."];
	}
	if (ltok.length==3 && rtok.length==9) {
		ltok = [".",".",".",ltok[0],ltok[1],ltok[2],".",".","."];
	}
	if (ltok.length==9 && rtok.length==3) {
		rtok = [".",".",".",rtok[0],rtok[1],rtok[2],".",".","."];
	}
	if ((ltok.length==3 && rtok.length==3) 
	||  (ltok.length==9 && rtok.length==9) ) {
		for (var i=0; i<ltok.length; i+=3) {
			ret += ltok[i]+" "+ltok[i+1]+" "+ltok[i+2]+"   "
				+  rtok[i]+" "+rtok[i+1]+" "+rtok[i+2]+"\n";
		}
	} else {
		ret = "[error: LHS or RHS has wrong number of items]\n";
	}
	return ret;

}

function createJsonForm(baseid,struct) {
	struct.form.push(
		{
			type: "button",
			title: "Clear form",
			onClick: function(evt) {
				$('form#'+baseid).find("input[type=text], textarea").val("");
				$('form#'+baseid).find("input[type=checkbox]").attr("checked",false);
				$('form#'+baseid).find("select").val($("#target option:first").val());
				evt.preventDefault();
			},
		},
		{
			type: "button",
			title: "Cancel",
			onClick: function(evt) {
				$('#'+baseid+'dialog').css("display","none");
				evt.preventDefault();
			},
		});
	$("form#"+baseid).jsonForm(struct)
}

// the form defs

createJsonForm("globals", {
	schema: {
		gametitle: {
			title: 'gametitle:',
			type: 'string',
			description: "Name of your game",
		},
		gamedesc: {
			title: 'gamedesc:',
			type: 'string',
			description: "Long description, use &lt;br&gt; for line breaks",
		},
		gamebackground: {
			title: 'gamebackground:',
			type: 'string',
			description: "Image URL for background to use for title screen",
		},
		config: {
			title: 'config:',
			type: 'boolean',
			description: "Check to insert available config settings",
		},
	},
	form: [
		{
			key: "gametitle", 
			placeholder: "Optional",
		},
		{
			key: "gamedesc",
			type: "textarea",
			width: "95%",
			height: "80px",
			placeholder: "Optional",
		},
		{
			key: "gamebackground", 
			placeholder: "Optional",
		},
		{
			key: "config", 
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
			var code = "";
			code += formsGetOptCode(val,"gametitle");
			code += formsGetOptCode(val,"gamedesc");
			code += formsGetOptCode(val,"gamebackground");
			if (val.config) {
				code += "config:\n"+JSON.stringify(CSConfig,null,"    ") + "\n";
			}
			insertCodeFromContextMenu(code);
			//$('#res').html(code);
			$('#globalsdialog').css("display","none");
		}
	}
});

createJsonForm("tilemap", {
	schema: {
		image: {
			title: '(image)',
			type: 'string',
			description: "Tile map image URL",
		},
		tilewidth: {
			title: '(tile width)',
			type: 'number',
			description: "Width in pixels of single tile in image",
		},
		tileheight: {
			title: '(tile height)',
			type: 'number',
			description: "Height in pixels of single tile in image",
		},
		nrtiles_x: {
			title: '(# tiles X)',
			type: 'number',
			description: "Number of tiles in X direction",
		},
		nrtiles_y: {
			title: '(# tiles Y)',
			type: 'number',
			description: "Number of tiles in Y direction",
		},
		smoothing: {
			title: '(smoothing)',
			type: 'string',
			description: "Use smoothing to display tiles",
			enum: ["yes","no"],
		},
	},
	form: [
		{
			key: "tilewidth", 
			placeholder: "Required",
			htmlClass: "number",
		},
		{
			key: "tileheight", 
			placeholder: "Required",
			htmlClass: "number",
		},
		{
			key: "nrtiles_x", 
			placeholder: "Required",
			htmlClass: "number",
		},
		{
			key: "nrtiles_y", 
			placeholder: "Required",
			htmlClass: "number",
		},
		{
			key: "smoothing", 
		},
		{
			key: "image", 
			placeholder: "Required",
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
			var code = "tilemap: "
				+val.tilewidth+" "+val.tileheight+" "
				+val.nrtiles_x+" "+val.nrtiles_y+" "+val.smoothing
				+" "+val.image+"\n";
			insertCodeFromContextMenu(code);
			$('#tilemapdialog').css("display","none");
		}
	}
});

createJsonForm("display", {
	schema: {
		width: {
			title: '(tile width)',
			type: 'number',
			description: "Tile width relative to total virtual width of 1920 pixels",
		},
		height: {
			title: '(tile height)',
			type: 'number',
			description: "Tile height relative to total virtual width of 1080 pixels",
		},
	},
	form: [
		{
			key: "width", 
			htmlClass: "number",
			placeholder: "Required",
		},
		{
			key: "height", 
			htmlClass: "number",
			placeholder: "Required",
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
			var code = "display: "
				+val.width+" "+val.height+"\n";
			insertCodeFromContextMenu(code);
			$('#displaydialog').css("display","none");
		}
	}
});

createJsonForm("cell", {
	schema: {
		cellsym: {
			type: 'string',
			title: '(symbol)',
			description: "Symbol that represents cell",
			required: true,
		},
		tilenr: {
			type: 'number',
			title: '(tile #)',
			description: "Cell's tile index",
			required: true,
		},
		imgop: {
			type: 'string',
			title: '(imgop)',
			description: "Rotate or flip operations to do on tile",
			enum: ["-","L","R","U","X","Y","LX","RX","LY","RY"],
			required: true,
		},
		directional: {
			type: 'string',
			title: '(directional)',
			description: "Does tile rotation reflect cell direction?",
			enum: ["no","rot4","rot-mir","mirx","miry"],
			required: true,
		},
		initialdir: {
			type: 'string',
			title: '(initial dir)',
			description: "Initial direction when cell is first placed",
			enum: ["-","U","D","L","R"],
			required: true,
		},
		shouldanim: {
			type: 'string',
			title: '(animate)',
			description: "Should cell animate when appropriate?",
			enum: ["yes","no"],
			required: true,
		},
	},
	form: [
		{
			key: "cellsym",
			htmlClass: "cellsym",
		},
		{
			key: "tilenr", 
			placeholder: "Required",
			htmlClass: "number",
		},
		"imgop", "directional", "initialdir", "shouldanim",
		{
			"type": "submit",
			"title": "Insert code",
		}
	],
	onSubmit: function (errors, val) {
		if (errors) {
			alert(errors);
		} else {
			var code = "cell: "
				+val.cellsym+" "+val.tilenr+" "+val.imgop+" "+val.directional
				+" "+val.initialdir+" "+val.shouldanim+"\n";
			insertCodeFromContextMenu(code);
			$('#celldialog').css("display","none");
		}
	}
});

createJsonForm("cellgroup", {
	schema: {
		cellsym: {
			title: '(cell symbol)',
			type: 'string',
			description: "Cell symbol used to represent group",
			required: true,
		},
		cellgroup: {
			title: '(cell group)',
			type: 'string',
			description: "List of cell symbols to include in group",
			required: true,
		},
	},
	form: [
		{
			key: "cellsym",
			htmlClass: "cellsym",
		},
		{
			key: "cellgroup",
			htmlClass: "cellgroup",
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
			var code = "group: "
				+val.cellsym+" "+val.cellgroup+"\n";
			insertCodeFromContextMenu(code);
			$('#cellgroupdialog').css("display","none");
		}
	}
});

createJsonForm("cellanim", {
	schema: {
		type: {
			title: '(type)',
			type: 'string',
			description: "Type of animation: standing still or moving",
			enum: ["move","stand"],
			required: true,
		},
		cell1: {
			title: '(source cell)',
			type: 'string',
			description: "Source (left hand side) cell type",
			required: true,
		},
		cell2: {
			title: '(dest cell)',
			type: 'string',
			description: "Destination (right hand side) cell type",
			required: true,
		},
		bgtile: {
			title: '(background tile)',
			type: 'number',
			description: "Background tile to show on destination while animation is running",
			required: true,
		},
		rotsrc: {
			title: '(rotation source)',
			type: 'string',
			description: "Cell to use for rotation of animation",
			enum: ["src","dst"],
			required: true,
		},
		dir: {
			title: '(direction)',
			type: 'string',
			description: "Direction to use for animation. If given, use animation only for this direction, ignore imgop",
			enum: ["-","L","R","U","D"],
			required: true,
		},
		speed: {
			title: '(speed)',
			type: 'number',
			description: "Speed at which animation frames are cycled, a number between 0 and 1",
			required: true,
		},
		frames: {
			title: '(frames)',
			type: 'string',
			description: "List of tile indexes, indicating successive animation frames",
			required: true,
		},
	},
	form: [
		"type",
		{
			key: "cell1",
			htmlClass: "cellsym",
		},
		{
			key: "cell2",
			htmlClass: "cellsym",
		},
		{
			key: "bgtile",
			htmlClass: "number",
		},
		"rotsrc",
		"dir",
		{
			key: "speed",
			htmlClass: "number",
		},
		{
			key: "frames",
			placeholder: "e.g. 1 2 3 4 5",
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
			var code = "cellanim: "
				+val.type+" "+val.cell1+" "+val.cell2+" "+val.bgtile+" "
				+val.rotsrc+" "+val.dir+" "+val.speed+" "+val.frames+"\n";
			insertCodeFromContextMenu(code);
			$('#cellanimdialog').css("display","none");
		}
	}
});

createJsonForm("rule", {
	schema: {
		rule_name: {
			title: 'rule: (name)',
			type: 'string',
			description: "Name of rule",
			required: true,
		},
		rule_lhs: {
			title: '(left side)',
			type: 'string',
			description: "Left hand side of rule, 1x3 or 3x3 grid of cell symbols",
			required: true,
		},
		rule_rhs: {
			title: '(right side)',
			type: 'string',
			description: "Right hand side of rule, 1x3 or 3x3 grid of cell symbols",
			required: true,
		},
		conddir: {
			title: 'conddir:',
			type: 'string',
			description: "Direction of center tile needed to trigger",
			enum: [ "-", "L", "R", "U", "D" ],
		},
		outdir: {
			title: 'outdir:',
			type: 'string',
			description: "Directions of output cells, 1x3 or 3x3 grid of _, L, R, U, D",
		},
		priority: {
			title: 'priority:',
			type: 'number',
			description: "Rule priority, higher is higher priority",
		},
		probability: {
			title: 'probability:',
			type: 'number',
			description: "Rule trigger probability",
		},
		delay: {
			title: 'delay:',
			type: 'string',
			description: "Trigger delay, either a number (time-based) or a number followed by 'trigger &lt;identifier&gt;' (based on last time it was triggered)",
		},
		transform: {
			title: 'transform:',
			type: 'string',
			description: "Transform rule into multiple subrules through rotation and mirroring",
			enum: ["-","rot2","rot4","mirx","miry", "rot2 mirx", "rot2 miry",
				"rot4 mirx", "rot4 miry", "mirx miry"],
		},
		anim: {
			title: 'anim:',
			type: 'string',
			description: "Animation directives for this rule",
			enum: ["yes","no","from-center","to-center"],
		},
		condfunc: {
			title: 'condfunc:',
			type: 'string',
			description: "Javascript condition specifying additional trigger conditions",
		},
		outfunc: {
			title: 'outfunc:',
			type: 'string',
			description: "Javascript code to execute when rule is triggered",
		},
	},
	form: [
		{
			key: "rule_name",
			htmlClass: "name inline-small-first",
			placeholder: "Required",
		},
		{
			key: "rule_lhs",
			type: "textarea",
			width: "150px",
			height: "60px",
			htmlClass: "inline",
			placeholder: "Required",
		},
		{
			key: "rule_rhs",
			type: "textarea",
			width: "80px",
			height: "60px",
			htmlClass: "inline",
			placeholder: "Required",
		},
		"conddir",
		{
			key: "outdir",
			type: "textarea",
			width: "80px",
			height: "60px",
			placeholder: "Optional",
		},
		{
			key: "priority", 
			placeholder: "Optional",
			htmlClass: "number",
		},
		{
			key: "probability", 
			placeholder: "Optional",
			htmlClass: "number",
		},
		{
			key: "delay", 
			placeholder: "Optional",
			htmlClass: "number",
		},
		"transform",
		"anim",
		"condfunc",
		{
			key: "outfunc",
			type: "textarea",
			width: "95%",
			height: "60px",
			placeholder: "Optional",
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
			var code = "rule: "+val.rule_name+"\n"
				+ mergeRuleLR(val.rule_lhs,val.rule_rhs);
			code += formsGetOptCode(val,"conddir","-");
			code += formsGetOptCode(val,"outdir");
			code += formsGetOptCode(val,"priority");
			code += formsGetOptCode(val,"probability");
			code += formsGetOptCode(val,"delay");
			code += formsGetOptCode(val,"transform","-");
			code += formsGetOptCode(val,"anim","yes");
			code += formsGetOptCode(val,"condfunc");
			code += formsGetOptCode(val,"outfunc");
			insertCodeFromContextMenu(code);
			$('#ruledialog').css("display","none");
		}
	}
});

createJsonForm("leveldefaults", {
	schema: {
		globals: {
			title: 'globals:',
			type: 'string',
			description: "Javascript code called at beginning of each level",
		},
		background: {
			title: 'background:',
			type: 'string',
			description: "URL of default level background image",
		},
	},
	form: [
		{
			key: "globals", 
			type: "textarea",
			width: "95%",
			height: "80px",
			placeholder: "Optional",
		},
		{
			key: "background", 
			placeholder: "Optional",
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
			var code="";
			code += formsGetOptCode(val,"globals");
			code += formsGetOptCode(val,"background");
			insertCodeFromContextMenu(code);
			$('#leveldefaultsdialog').css("display","none");
		}
	}
});

createJsonForm("level", {
	schema: {
		level_border: {
			title: 'level: (border cell)',
			type: 'string',
			description: "Cell to use around border of level",
			required: true,
		},
		level_fill: {
			title: '(fill cell)',
			type: 'string',
			description: "Cell fill initial level map with",
			required: true,
		},
		level_x: {
			title: '(width)',
			type: 'number',
			description: "Width of level map",
			required: true,
		},
		level_y: {
			title: '(height)',
			type: 'number',
			description: "Height of level map",
			required: true,
		},
		title: {
			title: 'title:',
			type: 'string',
			description: "Title of level",
		},
		desc: {
			title: 'desc:',
			type: 'string',
			description: "Long description of level, use &lt;br&gt; for line breaks",
		},
		init: {
			title: 'init:',
			type: 'string',
			description: "Javascript code called at start of level",
		},
		tick: {
			title: 'tick:',
			type: 'string',
			description: "Javascript code called at the beginning of each time tick",
		},
		win: {
			title: 'win:',
			type: 'string',
			description: "Javascript condition, true = win game",
		},
		lose: {
			title: 'lose:',
			type: 'string',
			description: "Javascript condition, true = lose game",
		},
		background: {
			title: 'background:',
			type: 'string',
			description: "URL of level background image",
		},
	},
	form: [
		{
			key: "level_border",
			htmlClass: "inline-small-first cellsym",
			placeholder: "Required",
		},
		{
			key: "level_fill",
			htmlClass: "inline-small cellsym",
			placeholder: "Required",
		},
		{
			key: "level_x",
			htmlClass: "inline-small number",
			placeholder: "Required",
		},
		{
			key: "level_y",
			htmlClass: "inline-small number",
			placeholder: "Required",
		},
		{
			key: "title", 
			placeholder: "Optional",
		},
		{
			key: "desc",
			type: "textarea",
			width: "95%",
			height: "80px",
			placeholder: "Optional",
		},
		{
			key: "init", 
			type: "textarea",
			width: "95%",
			height: "60px",
			placeholder: "Optional",
		},
		{
			key: "tick", 
			type: "textarea",
			width: "95%",
			height: "60px",
			placeholder: "Optional",
		},
		{
			key: "win", 
			placeholder: "Optional",
		},
		{
			key: "lose", 
			placeholder: "Optional",
		},
		{
			key: "background", 
			placeholder: "Optional",
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
			var code="level: "+val.level_border+"\n";
			for (var y=0; y<val.level_y; y++) {
				for (var x=0; x<val.level_x; x++) {
					code += val.level_fill;
				}
				code += "\n";
			}
			code += formsGetOptCode(val,"title");
			code += formsGetOptCode(val,"desc");
			code += formsGetOptCode(val,"init");
			code += formsGetOptCode(val,"tick");
			code += formsGetOptCode(val,"win");
			code += formsGetOptCode(val,"lose");
			code += formsGetOptCode(val,"background");
			insertCodeFromContextMenu(code);
			$('#leveldialog').css("display","none");
		}
	}
});




