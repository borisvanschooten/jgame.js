// still hard-coded: gamedir, spritesheet, textures
// Todo: game score
var GameConfig = {
	gamedir: "", // filled in by game.js or by loader
	name: "JGame AI game",
	gamemode: "separate-levels",
	mouse: {
		color:null, pointerSize:{x:64,y:64}, centerPointer:false, disabled:false
	},
	//scroll: {
	//	speed: 1000,
	//},
	title: "JGame AI game",
	// Custom start title function
	initGame: aiLayerInitGame,
	startTitle: aiLayerStartTitle,
	titlebg: "titletex",
	sounds: {
		// Insert your sounds here
		//"mysound": "sounds/MySound",
	},
	textures: {
		// Insert your textures here
		"titletex": {url:"images/titlebg.png",smooth:true,wrap:false},
		"levelbg": {url:"images/levelbg.png",smooth:true,wrap:false},
	},
	spritesheet: {
		texture: {url:"images/spritesheet.png", smooth: false, wrap:false},
		unitx: 10,
		unity: 10,
		countx: 10,
		county: 10,
	},
	tilemap: {
		texture: {url:"images/spritesheet.png", smooth: false, wrap:false},
		unitx: 10,
		unity: 10,
		countx: 10,
		county: 10,
		tilex: 60,
		tiley: 60,
		nrtilesx: 32,
		nrtilesy: 18,
		filltile: -1,
		filltilecid: 0,
	},
	score: {
		// Score definition example, time taken = score
		get: getGameTimeTaken,
		betterthan: function(score1,score2) { return score1>score2; },
		display: function(score) { return "Time: "+timestampToString(score); },
		displayhighscore: function(score) {
			return [
				"Best Time:",
				(score/1000).toFixed(3) + " sec"
			];
		}
	},
	leveldefs: {
		// Level definition example
		stdlevel : {
			newlevel: aiLayerStartNewLevel,
			scenery: {
				layers: [
					// back
					//{ tex: "bg1", w:1800, h:1024, col: [1, 1, 1, 0.85],
					//xofs: 0, yofs: 20, scale: 0.6, },
					// front
					//{ tex: "bg1", w:1800, h:1024, col: [1, 1, 1, 1],
					//	xofs: 0, yofs: 0, scale: 1.2, },
				],
				bg: "levelbg",
				moving: 2.0,
				vertical: false,
			},
			playerofs: {x: 0, y: 0},
			// Functions for customizing update phases, in order of execution.
			// Paint functions are called only when not skipping frames.
			// Called before background and tile painting.
			paintBackground: function() {},
			// Called after background painting, but before sprite painting.
			paintForeground: function() {},
			// Called before object updates.
			doFramePre: function() {},
			// Called after object updates.
			doFramePost: aiLayerDoFrame,
			// Called after all painting is done.
			paintOverlay: function() {},
		},
	},
    defaultLeveldef: "stdlevel",
	levels: []
};

var tilemapping = {}

var spritedefs = {}

// fixed definitions

// entity masks
var player_mask = 1
var enemy_mask = 2 // for enemies and enemy bullets
var pickup_mask = 4 // mask for bonuses and other things that can be picked up
var player_bullet_mask = 8 // for player bullets
var mask_mapping = {
    "player": player_mask,
    "enemy": enemy_mask,
    "pickup": pickup_mask,
    "player_bullet": player_bullet_mask,
}

// tile masks
var empty_mask = 0 // empty space

// tile indexes
var tile_empty = 0

// variable definitions (TODO remove later)

// tile masks (replaced by getTileMaskDef)
//var wall_mask = 0x100
//var ladder_mask = 0x200
//var platform_mask = 0x400
//var earth_mask = 0x1000
//var brick_mask = 0x1000


// sprite indexes
var player_bullet_sprite = "player_bullet_sprite" // use for player's bullets
var enemy_bullet_sprite = "enemy_bullet_sprite" // use for enemy bullets


// tile mask definitions -------------------------------
var next_mask = 0x100
var definedMasks = {}

function getTileMaskDef(maskname) {
	if (typeof definedMasks[maskname] === "undefined") {
		definedMasks[maskname] = next_mask
		// TODO rename suffix to _tilemask so it does not conflict with entity masks
		globalThis[maskname+"_mask"] = next_mask
		if (next_mask >= 0x40000000) {
			console.error("getMask error: ran out of mask bits, will re-use last mask");
		} else {
			next_mask *= 2;
		}
	}
	return definedMasks[maskname]
}

function getTileMaskDefsDesc() {
	var ret = ""
	Object.entries(definedMasks).forEach(([key, value]) => {
		ret += `var ${key}_mask = ${value};\n`
	});
	return ret;
}

// AI layer ------------------------------------------

var loadedMapGens = {}
var loadedEntities = {}
var loadedParticles = {}

class GameEntity extends TileSprite {
	setX(tx) {
		this.x = tilex*tx
	}
	setY(ty) {
		this.y = tiley*ty
	}
	getX() {
		return this.x / tilex
	}
	getY() {
		return this.y / tiley
	}
	getMask() {
		return this.colid;
	}
	getTileCoords() {
		return this.getTiles(tilemap)
	}
	// sprite can be sprite index or name of spritedefs definition
	constructor(name,unique,tx,ty,mask,sprite) {
		super(name,unique,tx,ty,mask)
		if (isNaN(sprite)) {
			if (spritedefs[sprite]) {
				this.spritedef = spritedefs[sprite]
				this.anim = spritedefs[sprite].anim
				if (this.spritedef && this.spritedef.onCreate) {
					if (this.spritedef.onCreate.particle) {
						var part = this.spritedef.onCreate.particle
						if (loadedParticles[part.type]) {
							loadedParticles[part.type](this.x, this.y, part.size, part.sprite)
						} else {
							console.log(`Cannot find particle generator '${part.type}'`)
						}
					}
					if (this.spritedef.onCreate.sound) {
						JGAudio.play(this.spritedef.onCreate.sound, null, null, 0.75)
					}
				}
			} else {
				console.log(`Cannot find sprite "${sprite}"`)
			}
		} else {
			this.sprite = sprite
			this.spritedef = null
		}
		this.init()
		this.setBBox(0.1*tilex,0.1*tiley,0.8*tilex,0.8*tiley);
	}
	move() {
		this.moveFunc()
		this.moveTick()
		if (!this.transition) {
			this.moveTile()
		}
	}
	// Handle remove event. Is not triggered by removeObjects
	remove() {
		super.remove()
		if (this.spritedef && this.spritedef.onRemove) {
			if (this.spritedef.onRemove.particle) {
				var part = this.spritedef.onRemove.particle
				loadedParticles[part.type](this.x, this.y, part.size, part.sprite)
			}
			if (this.spritedef.onRemove.sound) {
				JGAudio.play(this.spritedef.onRemove.sound, null, null, 0.75)
			}
		}
	}
	moveTick() {}
	moveTile() {}
	paint(gl) {
		//var spr = this.sprite
		// hard coded flip logic
		/*if (spr==16 || spr==27 || spr==29 || spr==11) {
			if (this.lastx > this.x) {
				this.flipx = true;
			}
			if (this.lastx < this.x) {
				this.flipx = false;
			}
		}*/
		this.paintFunc(gl)
	}
}

class Particle extends JGObject {
	constructor(xpos,ypos,sprite,delay,size,color) {
		super("particle",true,xpos,ypos,0);
		this.delay = delay;
		this.size = size;
		this.color = color;
		this.angle = 0;
		this.sprite = sprite;
	}
	move() {
		if (this.delay <= 0) {
			if (this.moveFunc) this.moveFunc()
		} else {
			this.delay--;
		}
	}
	paint(gl) {
		if (this.delay <= 0) {
			spritebatch.addSprite(this.sprite,
				this.x-screenxofs+tilex/2, this.y-screenyofs+tiley/2, false,
				this.size, this.size, this.angle, this.color);
		}
	}
}

/** @private
 * Load module from JS file
 * @param {string} path - location of JS file
 * @param {string} name - name to give to the module
 */
async function loadModule(outobj, path, name) {
	try {
		//console.log(`Loading module ${name}...`)
		const module = await import(path+"?t="+Date.now())
		var loadedSyms = 0
		for (const key in module) {
			if (typeof outobj[name] != "undefined") {
				console.error(`Module named ${name} already loaded.`)
				return;
			}
			console.log(`Loaded module ${name}.`)
			outobj[name] = module[key]
			loadedSyms += 1
		}
		if (loadedSyms != 1) {
			console.error(`Unexpected number of symbols in module ${name}: ${loadedSyms}`)
		}
	} catch (error) {
		console.error('Failed to load module:', error)
	}
}


// load zzfx definitions from JSON (move this to jgame-main or jgame-loader)

function loadSoundDefs(jsonpath) {
	var sounddefs = fetch(jsonpath+"?t="+Date.now())
	.then(response => response.json())
	.then( sounddefs => {
		sounddefs.sounds.forEach( elem => { 
			console.log(elem);
			JGAudio.load(elem.name,buildPresetSound(elem.seed,elem.type).samples,true)
//			document.getElementById("playbuttons").innerHTML += `<button onclick="JGAudio.play('${elem.name}')">Play ${elem.name}</button><br>\n`
		});
	});
}

/*var generated_sound_types = [
	"Random",
	"Pickup",
	"Powerup",
	"Jump",
	"Shoot",
	"Blip",
	"Hit",
	"Explo",
	//"Music": "Tone",
]

// type is one of generated_sound_types
// seed is an integer
function loadGeneratedSound(name,type,seed) {
	var sound = buildPresetSound(seed,type)
	JGAudio.load(name,sound.samples,true)
}*/

function playSound(name) {
	JGAudio.play(name,null,null,0.75)
}


/** From AfasieSPA.
 * Load multiple modules from a manifest JSON file.
 * @param {string} manifest_path - Path to the manifest JSON file.
 */
async function loadModulesFromManifest(outobj, app_basedir,module_path,manifest_path) {
	try {
		const res = await fetch(manifest_path);
		if (!res.ok) {
			throw new Error(`Failed to load manifest: ${res.statusText}`);
		}

		const manifest = await res.json();
		const { wd, targets } = manifest;
		await loadModules(outobj, app_basedir,module_path,wd,targets)
	} catch (error) {
		console.error('Error loading modules from manifest:', error);
	}
}

// targets must be array of {file,name}
async function loadModules(outobj, app_basedir,module_path,wd,targets) {
	try {
		if (Array.isArray(targets)) {
			for (const target of targets) {
				const { file, name } = target;
				// XXX absolute path will only work if manifest is read from the same root as the web server
				const fullpath = `${app_basedir}/${module_path}/${wd}${file}`
				await loadModule(outobj,fullpath, name);
			}
		} else {
			console.error("Manifest targets should be an array.");
		}
	} catch (error) {
		console.error('Error loading modules:', error);
	}
}

/** from shooter generator.
* Parses function's arguments and default values
* (reflection by shallow parsing)
*/
function getFunctionParams(func) {
	if (typeof func !== 'function') {
		throw new Error("Argument must be a function");
	}
	const funcStr = func.toString();
	//return funcStr;
	const paramMatch = funcStr.match(/\(([^)]*)\)/);
	if (!paramMatch) {
		throw new Error("Unable to parse function parameters");
	}
	const params = paramMatch[1].split(',').map(param => param.trim());
	const defaults = [];
	params.forEach(param => {
		const [name, value] = param.split('=').map(p => p.trim());
		if (value !== undefined) {
			const numValue = Number(value);
			if (isNaN(numValue)) {
				if (value == "true" || value == "false") {
					defaults.push(value=="true")
				} else {
					console.log(`Default value for parameter "${name}" is not number or boolean`);
					defaults.push(undefined);
				}
			} else {
				defaults.push(numValue);
			}
		} else {
			defaults.push(undefined);
		}
	});
	return { names: params.map(p => p.split('=')[0].trim()), defaults };
}

//import("./masks.js") // does not work yet, we duplicate the file here



function createEntity(name,unique,tx,ty,mask,sprite) {
	var entityname = name
	if (name.indexOf("player") !== -1) {
		entityname = "player"
	}
	//console.log(`Creating entity: ${name} ${tx} ${ty}`)
	if (typeof loadedEntities[name] !== "undefined") {
		new loadedEntities[name](entityname,unique,tx,ty,mask,sprite)
	} else {
		new GameEntity(name,unique,tx,ty,mask,sprite)
		console.log(`Warning: entity ${name} does not exit, creating dummy entity.`)
	}
}


function levelDone() {
	if (JGState.isIn("GameOver")) return;
	JGState.add("LevelDone")
}

function gameOver() {
	if (JGState.isIn("LevelDone")) return;
	JGState.add("GameOver")
}

function getPlayer() {
	return JGObject.getObject("player")
}

function setTile(tile_index,tile_mask,tx,ty) {
	var oldtile_index = tilemap.getTilePos(tx,ty)
	tilemap.setTile(tile_index,tile_mask,tx,ty)
	// check for events
	var event = tileEvents["T"+tile_index]
	if (event && event.onCreate) {
		if (event.onCreate.particle) {
			var part = event.onCreate.particle
			loadedParticles[part.type](tilex*tx, tiley*ty, part.size, part.sprite)
		}
		if (event.onCreate.sound) {
			JGAudio.play(event.onCreate.sound,null,null,0.75)
		}
	}
	event = tileEvents["T"+oldtile_index]
	if (event && event.onRemove) {
		if (event.onRemove.particle) {
			var part = event.onRemove.particle
			loadedParticles[part.type](tilex*tx, tiley*ty, part.size, part.sprite)
		}
		if (event.onRemove.sound) {
			JGAudio.play(event.onRemove.sound,null,null,0.75)
		}
	}

}
function getTileMask(tile_index,tile_mask,tx,ty) {
	return tilemap.getTileCidPos(tile_index,tile_mask,Math.floor(tx),Math.floor(ty))
}


// StdGame hooks ------------------------------------------------

var tileEvents = {} // tile id => optional {onCreate, onRemove} objects

function aiLayerInitGame() {
	loadSoundDefs(`${GameConfig.gamedir}/sounddefs.json`)

	// set controls
	io.config.axis[1].keys.enabled=true;
	io.config.button[0].keys.code="L";

	loadModulesFromManifest(loadedMapGens,"../"+GameConfig.gamedir+"/webcogs",".",GameConfig.gamedir+"/webcogs/promptbuild_maps.json")
	.then(() => {
		console.log(loadedMapGens)
        for (var name in loadedMapGens) {
            console.log(name)
            var value = loadedMapGens[name]
            console.log(parseFuncOptionsParam(value))
        }
	})
	loadModulesFromManifest(loadedEntities,"../"+GameConfig.gamedir+"/webcogs",".",GameConfig.gamedir+"/webcogs/promptbuild_entities.json")
	.then(() => {
		console.log(loadedEntities)
        for (var name in loadedEntities) {
            console.log(name)
            var value = loadedEntities[name]
            console.log(parseFuncOptionsParam(getConstructorHead(value)))
            //console.log(parseFuncOptionsParam(value.constructor))
        }
	})
	loadModulesFromManifest(loadedParticles,"../"+GameConfig.gamedir+"/webcogs",".",GameConfig.gamedir+"/webcogs/promptbuild_particles.json")
	.then(() => {
		console.log(loadedParticles)
        for (var name in loadedParticles) {
            console.log(name)
            var value = loadedParticles[name]
            console.log(parseFuncOptionsParam(value))
            //console.log(parseFuncParams(value))
        }
	})
    // Get tile events and masks.  TODO also add onCreate. Currently no use case.
	for (var key in tilemapping) {
		var elem = tilemapping[key]
		if (elem.onRemove) {
			tileEvents["T"+elem.tile] = elem
		}
        if (elem.mask_name) {
            var mask_names = elem.mask_name.split("|")
            var mask = 0
            for (var i=0; i<mask_names.length; i++) {
                mask |= getTileMaskDef(mask_names[i])
            }
            elem.mask = mask
        }
	}
	console.log(tileEvents)
}

function aiLayerStartTitle() {
}

function aiLayerStartNewLevel() {
	// currently hard coded
	tilemap.setOffscreenTile(-1,wall_mask);
	// create level
	var map;
	if (typeof thislevel.params !== "undefined") {
		var map = loadedMapGens[thislevel.type](nrtilesx,nrtilesy,randomstep(1,10000,1),thislevel.params)
	} else {
		var map = loadedMapGens[thislevel.type](nrtilesx,nrtilesy,randomstep(1,10000,1))
	}
	console.log(map)
	for (y=0; y<map.length; y++) {
		var row = map[y]
		for (x=0; x<row.length; x++) {
			var char = row[x]
			var mapping = tilemapping[char]
			if (mapping !== undefined) {
				if (typeof mapping.tile !== "undefined") {
					tilemap.setTile(mapping.tile,mapping.mask,x,y)
				} 
				if (typeof mapping.entity !== "undefined") {
    				if (typeof mapping.entity === "function") {
    					mapping.entity(x,y)
                    } else {
                        var mask = mask_mapping[mapping.entity.mask]
                        if (!mask) {
                            mask = 0;
                            console.error(`Entity mask ${mapping.entity.mask} not found.`)
                        }
                        createEntity(mapping.entity.name, mapping.entity.unique, x,y, mask, mapping.entity.sprite)
                    }
				}
			}
		}
	}

	tilemap.update(gl);
}


function calcWinCondition(wincond) {
    if (typeof wincond == "function") {
        return wincond()
    }
    if (wincond.type == "no_enemies") {
        return JGObject.countObjects(null,enemy_mask) === 0
    } else if (wincond.type == "no_pickups") {
        return JGObject.countObjects(null,pickup_mask) === 0
    } else if (wincond.type == "no_tiles_with_mask") {
        return tilemap.countTileCids(getTileMaskDef(wincond.mask)) === 0
    } else if (wincond.type == "player_reaches") {
        var player = JGObject.getObject("player")
        if (!player) return false;
        if (wincond.position == "top") {
            if (player.y < 2*tiley) return true;
        } else if (wincond.position == "bottom") {
            if (player.y > tiley*nrtilesy - 2*tiley) return true;
        } else if (wincond.position == "left") {
            if (player.x < 2*tilex) return true;
        } else if (wincond.position == "right") {
            if (player.x > tilex*nrtilesx - 2*tilex) return true;
        }
        return false;
    }
}



function aiLayerDoFrame() {
	//if (io.getMouseButton(1)) {
	//	loadedParticles["gridexplosion"](io.getMouseX(),io.getMouseY(), 50, 30)
	//	io.clearMouseButton(1)
	//}
	if (calcWinCondition(thislevel.wincond)) {
		levelDone()
	}
	/*if (checkTime(0,thislevel.par.levelduration,50)) {
		// create enemy
	}
	if (gametime > thislevel.par.levelduration
	&& JGObject.countObjects('Object',0) == 0) {
		//JGState.add("LevelDone",-1);
	}*/
}



/**
 * Slop warning: vibe coded JS code shallow parsers to get function and constructor parameters. 
 * In the future I want to instruct the AI to specify the params, so this can be removed.
 */



/** @cogs_func getConstructorHead
 * Write a Javascript function getConstructorHead(classref) that parses the code of a class via class.toString(). It returns the string containing the class constructor's head, as in: constructor(params). Return null on error.
 * Use 4 spaces per indent level.
 */
//@cogs_build 0.6.0 openai-gpt-5.4 2026-05-10T13:05:11.142Z
function getConstructorHead(classref) {
    try {
        if (typeof classref !== 'function') {
            return null;
        }

        var source = classref.toString();
        if (typeof source !== 'string') {
            return null;
        }

        var classMatch = source.match(/^\s*class\b/);
        if (!classMatch) {
            return null;
        }

        var index = source.indexOf('{');
        if (index === -1) {
            return null;
        }

        var depth = 1;
        var inSingle = false;
        var inDouble = false;
        var inTemplate = false;
        var inLineComment = false;
        var inBlockComment = false;
        var escaped = false;
        var constructorIndex = -1;

        for (var i = index + 1; i < source.length; i++) {
            var char = source[i];
            var next = source[i + 1];

            if (inLineComment) {
                if (char === '\n' || char === '\r') {
                    inLineComment = false;
                }
                continue;
            }

            if (inBlockComment) {
                if (char === '*' && next === '/') {
                    inBlockComment = false;
                    i++;
                }
                continue;
            }

            if (inSingle) {
                if (!escaped && char === '\\') {
                    escaped = true;
                    continue;
                }
                if (!escaped && char === '\'') {
                    inSingle = false;
                }
                escaped = false;
                continue;
            }

            if (inDouble) {
                if (!escaped && char === '\\') {
                    escaped = true;
                    continue;
                }
                if (!escaped && char === '"') {
                    inDouble = false;
                }
                escaped = false;
                continue;
            }

            if (inTemplate) {
                if (!escaped && char === '\\') {
                    escaped = true;
                    continue;
                }
                if (!escaped && char === '`') {
                    inTemplate = false;
                }
                escaped = false;
                continue;
            }

            if (char === '/' && next === '/') {
                inLineComment = true;
                i++;
                continue;
            }

            if (char === '/' && next === '*') {
                inBlockComment = true;
                i++;
                continue;
            }

            if (char === '\'') {
                inSingle = true;
                continue;
            }

            if (char === '"') {
                inDouble = true;
                continue;
            }

            if (char === '`') {
                inTemplate = true;
                continue;
            }

            if (char === '{') {
                depth++;
                continue;
            }

            if (char === '}') {
                depth--;
                if (depth === 0) {
                    break;
                }
                continue;
            }

            if (depth === 1) {
                if (/\s/.test(char)) {
                    continue;
                }

                if (source.slice(i, i + 11) === 'constructor') {
                    var before = i === 0 ? '' : source[i - 1];
                    var after = source[i + 11];
                    if ((!before || /[^\w$]/.test(before)) && after === '(') {
                        constructorIndex = i;
                        break;
                    }
                }
            }
        }

        if (constructorIndex === -1) {
            return null;
        }

        var start = constructorIndex;
        var parenIndex = constructorIndex + 11;
        if (source[parenIndex] !== '(') {
            return null;
        }

        var parenDepth = 0;
        inSingle = false;
        inDouble = false;
        inTemplate = false;
        inLineComment = false;
        inBlockComment = false;
        escaped = false;

        for (var j = parenIndex; j < source.length; j++) {
            var c = source[j];
            var n = source[j + 1];

            if (inLineComment) {
                if (c === '\n' || c === '\r') {
                    inLineComment = false;
                }
                continue;
            }

            if (inBlockComment) {
                if (c === '*' && n === '/') {
                    inBlockComment = false;
                    j++;
                }
                continue;
            }

            if (inSingle) {
                if (!escaped && c === '\\') {
                    escaped = true;
                    continue;
                }
                if (!escaped && c === '\'') {
                    inSingle = false;
                }
                escaped = false;
                continue;
            }

            if (inDouble) {
                if (!escaped && c === '\\') {
                    escaped = true;
                    continue;
                }
                if (!escaped && c === '"') {
                    inDouble = false;
                }
                escaped = false;
                continue;
            }

            if (inTemplate) {
                if (!escaped && c === '\\') {
                    escaped = true;
                    continue;
                }
                if (!escaped && c === '`') {
                    inTemplate = false;
                }
                escaped = false;
                continue;
            }

            if (c === '/' && n === '/') {
                inLineComment = true;
                j++;
                continue;
            }

            if (c === '/' && n === '*') {
                inBlockComment = true;
                j++;
                continue;
            }

            if (c === '\'') {
                inSingle = true;
                continue;
            }

            if (c === '"') {
                inDouble = true;
                continue;
            }

            if (c === '`') {
                inTemplate = true;
                continue;
            }

            if (c === '(') {
                parenDepth++;
                continue;
            }

            if (c === ')') {
                parenDepth--;
                if (parenDepth === 0) {
                    return source.slice(start, j + 1);
                }
            }
        }

        return null;
    } catch (error) {
        return null;
    }
}
/* @cogs_endfunc */

/** @cogs_func parseFuncParams
 * Write a Javascript function parseFuncParams(func) that parses a function's parameters of a function using function.toString(). It returns {names: [array of parameter names], defaults: [array of default values, or null if none]}.  For default values it supports only numbers, strings, and booleans.
 * Use 4 spaces per indent level.
 */
//@cogs_build 0.6.0 openai-gpt-5.4 2026-05-09T19:38:35.138Z
function parseFuncParams(func) {
    const source = func.toString();
    const start = source.indexOf('(');
    if (start === -1) {
        return { names: [], defaults: [] };
    }

    let depth = 0;
    let end = -1;
    let inSingle = false;
    let inDouble = false;
    let inTemplate = false;
    let escape = false;

    for (let i = start; i < source.length; i++) {
        const char = source[i];

        if (escape) {
            escape = false;
            continue;
        }

        if (inSingle) {
            if (char === '\\') {
                escape = true;
            } else if (char === "'") {
                inSingle = false;
            }
            continue;
        }

        if (inDouble) {
            if (char === '\\') {
                escape = true;
            } else if (char === '"') {
                inDouble = false;
            }
            continue;
        }

        if (inTemplate) {
            if (char === '\\') {
                escape = true;
            } else if (char === '`') {
                inTemplate = false;
            }
            continue;
        }

        if (char === "'") {
            inSingle = true;
            continue;
        }

        if (char === '"') {
            inDouble = true;
            continue;
        }

        if (char === '`') {
            inTemplate = true;
            continue;
        }

        if (char === '(') {
            depth++;
        } else if (char === ')') {
            depth--;
            if (depth === 0) {
                end = i;
                break;
            }
        }
    }

    if (end === -1) {
        return { names: [], defaults: [] };
    }

    const paramsSource = source.slice(start + 1, end).trim();
    if (!paramsSource) {
        return { names: [], defaults: [] };
    }

    const params = [];
    let current = '';
    depth = 0;
    inSingle = false;
    inDouble = false;
    inTemplate = false;
    escape = false;

    for (let i = 0; i < paramsSource.length; i++) {
        const char = paramsSource[i];

        if (escape) {
            current += char;
            escape = false;
            continue;
        }

        if (inSingle) {
            current += char;
            if (char === '\\') {
                escape = true;
            } else if (char === "'") {
                inSingle = false;
            }
            continue;
        }

        if (inDouble) {
            current += char;
            if (char === '\\') {
                escape = true;
            } else if (char === '"') {
                inDouble = false;
            }
            continue;
        }

        if (inTemplate) {
            current += char;
            if (char === '\\') {
                escape = true;
            } else if (char === '`') {
                inTemplate = false;
            }
            continue;
        }

        if (char === "'") {
            inSingle = true;
            current += char;
            continue;
        }

        if (char === '"') {
            inDouble = true;
            current += char;
            continue;
        }

        if (char === '`') {
            inTemplate = true;
            current += char;
            continue;
        }

        if (char === '(' || char === '[' || char === '{') {
            depth++;
            current += char;
            continue;
        }

        if (char === ')' || char === ']' || char === '}') {
            depth--;
            current += char;
            continue;
        }

        if (char === ',' && depth === 0) {
            if (current.trim()) {
                params.push(current.trim());
            }
            current = '';
            continue;
        }

        current += char;
    }

    if (current.trim()) {
        params.push(current.trim());
    }

    const names = [];
    const defaults = [];

    function parseDefaultValue(valueSource) {
        const value = valueSource.trim();

        if (/^(true|false)$/.test(value)) {
            return value === 'true';
        }

        if (/^[+-]?(?:\d+\.\d+|\d+|\.\d+)$/.test(value)) {
            return Number(value);
        }

        if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
            try {
                return Function('return ' + value)();
            } catch (e) {
                return null;
            }
        }

        return null;
    }

    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        let splitIndex = -1;
        depth = 0;
        inSingle = false;
        inDouble = false;
        inTemplate = false;
        escape = false;

        for (let j = 0; j < param.length; j++) {
            const char = param[j];

            if (escape) {
                escape = false;
                continue;
            }

            if (inSingle) {
                if (char === '\\') {
                    escape = true;
                } else if (char === "'") {
                    inSingle = false;
                }
                continue;
            }

            if (inDouble) {
                if (char === '\\') {
                    escape = true;
                } else if (char === '"') {
                    inDouble = false;
                }
                continue;
            }

            if (inTemplate) {
                if (char === '\\') {
                    escape = true;
                } else if (char === '`') {
                    inTemplate = false;
                }
                continue;
            }

            if (char === "'") {
                inSingle = true;
                continue;
            }

            if (char === '"') {
                inDouble = true;
                continue;
            }

            if (char === '`') {
                inTemplate = true;
                continue;
            }

            if (char === '(' || char === '[' || char === '{') {
                depth++;
                continue;
            }

            if (char === ')' || char === ']' || char === '}') {
                depth--;
                continue;
            }

            if (char === '=' && depth === 0 && param[j + 1] !== '>') {
                splitIndex = j;
                break;
            }
        }

        if (splitIndex === -1) {
            names.push(param.trim());
            defaults.push(null);
        } else {
            names.push(param.slice(0, splitIndex).trim());
            defaults.push(parseDefaultValue(param.slice(splitIndex + 1)));
        }
    }

    return {
        names: names,
        defaults: defaults
    };
}
/* @cogs_endfunc */



/** @cogs_func countTo
 * Write a Javascript function countTo(n) that returns an array of numbers between 0 and n inclusive.
 * Use 4 spaces per indent level.
 */
/* @cogs_endfunc */

/** @cogs_func parseFuncOptionsParam
 * Write a Javascript function parseFuncOptionsParam(func) that parses a given function's options object, provided that is has as its last parameter a destructured options object with defaults, e.g. {option1=value1, option2=value2, ...} = {}. Parameter func is either a function or a string with the function's source code without comments.  It returns {names: [array of option names], defaults: [array of default values]}.  For default values it supports only numbers, strings, and booleans. If no such last parameter exists, return empty lists {names:[], defaults:[]}.
 * Use 4 spaces per indent level.
 */
//@cogs_build 0.6.0 openai-gpt-5.4 2026-05-10T15:23:33.618Z
function parseFuncOptionsParam(func) {
    var source = typeof func === 'function' ? Function.prototype.toString.call(func) : String(func);
    var start = source.indexOf('(');
    if (start === -1) {
        return { names: [], defaults: [] };
    }

    var depth = 0;
    var end = -1;
    for (var i = start; i < source.length; i++) {
        var ch = source[i];
        if (ch === '(') {
            depth++;
        } else if (ch === ')') {
            depth--;
            if (depth === 0) {
                end = i;
                break;
            }
        }
    }

    if (end === -1) {
        return { names: [], defaults: [] };
    }

    var params = source.slice(start + 1, end).trim();
    if (!params) {
        return { names: [], defaults: [] };
    }

    var parts = [];
    var current = '';
    var braceDepth = 0;
    var bracketDepth = 0;
    var parenDepth = 0;
    var inString = false;
    var stringQuote = '';
    var escape = false;

    for (var j = 0; j < params.length; j++) {
        var c = params[j];

        if (inString) {
            current += c;
            if (escape) {
                escape = false;
            } else if (c === '\\') {
                escape = true;
            } else if (c === stringQuote) {
                inString = false;
                stringQuote = '';
            }
            continue;
        }

        if (c === '"' || c === "'" || c === '`') {
            inString = true;
            stringQuote = c;
            current += c;
            continue;
        }

        if (c === '{') {
            braceDepth++;
        } else if (c === '}') {
            braceDepth--;
        } else if (c === '[') {
            bracketDepth++;
        } else if (c === ']') {
            bracketDepth--;
        } else if (c === '(') {
            parenDepth++;
        } else if (c === ')') {
            parenDepth--;
        }

        if (c === ',' && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
            parts.push(current.trim());
            current = '';
        } else {
            current += c;
        }
    }
    if (current.trim()) {
        parts.push(current.trim());
    }

    if (parts.length === 0) {
        return { names: [], defaults: [] };
    }

    var lastParam = parts[parts.length - 1].trim();
    var match = lastParam.match(/^\{([\s\S]*)\}\s*=\s*\{\s*\}$/);
    if (!match) {
        return { names: [], defaults: [] };
    }

    var body = match[1].trim();
    if (!body) {
        return { names: [], defaults: [] };
    }

    var entries = [];
    current = '';
    braceDepth = 0;
    bracketDepth = 0;
    parenDepth = 0;
    inString = false;
    stringQuote = '';
    escape = false;

    for (var k = 0; k < body.length; k++) {
        var d = body[k];

        if (inString) {
            current += d;
            if (escape) {
                escape = false;
            } else if (d === '\\') {
                escape = true;
            } else if (d === stringQuote) {
                inString = false;
                stringQuote = '';
            }
            continue;
        }

        if (d === '"' || d === "'" || d === '`') {
            inString = true;
            stringQuote = d;
            current += d;
            continue;
        }

        if (d === '{') {
            braceDepth++;
        } else if (d === '}') {
            braceDepth--;
        } else if (d === '[') {
            bracketDepth++;
        } else if (d === ']') {
            bracketDepth--;
        } else if (d === '(') {
            parenDepth++;
        } else if (d === ')') {
            parenDepth--;
        }

        if (d === ',' && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
            entries.push(current.trim());
            current = '';
        } else {
            current += d;
        }
    }
    if (current.trim()) {
        entries.push(current.trim());
    }

    var names = [];
    var defaults = [];

    for (var m = 0; m < entries.length; m++) {
        var entry = entries[m];
        var eqIndex = -1;
        inString = false;
        stringQuote = '';
        escape = false;
        braceDepth = 0;
        bracketDepth = 0;
        parenDepth = 0;

        for (var n = 0; n < entry.length; n++) {
            var e = entry[n];

            if (inString) {
                if (escape) {
                    escape = false;
                } else if (e === '\\') {
                    escape = true;
                } else if (e === stringQuote) {
                    inString = false;
                    stringQuote = '';
                }
                continue;
            }

            if (e === '"' || e === "'" || e === '`') {
                inString = true;
                stringQuote = e;
                continue;
            }

            if (e === '{') {
                braceDepth++;
            } else if (e === '}') {
                braceDepth--;
            } else if (e === '[') {
                bracketDepth++;
            } else if (e === ']') {
                bracketDepth--;
            } else if (e === '(') {
                parenDepth++;
            } else if (e === ')') {
                parenDepth--;
            } else if (e === '=' && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
                eqIndex = n;
                break;
            }
        }

        if (eqIndex === -1) {
            continue;
        }

        var name = entry.slice(0, eqIndex).trim();
        var valueText = entry.slice(eqIndex + 1).trim();

        if (!/^[$A-Z_a-z][$\w]*$/.test(name)) {
            continue;
        }

        var value;
        if (/^(?:true|false)$/.test(valueText)) {
            value = valueText === 'true';
        } else if (/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(valueText)) {
            value = Number(valueText);
        } else {
            var stringMatch = valueText.match(/^(['"])([\s\S]*)\1$/);
            if (!stringMatch) {
                continue;
            }
            try {
                value = JSON.parse('"' + stringMatch[2].replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"');
            } catch (err) {
                value = stringMatch[2].replace(/\\([\\'"`bnrtvf0])/g, function (_, ch) {
                    switch (ch) {
                        case 'b': return '\b';
                        case 'n': return '\n';
                        case 'r': return '\r';
                        case 't': return '\t';
                        case 'v': return '\v';
                        case 'f': return '\f';
                        case '0': return '\0';
                        default: return ch;
                    }
                });
            }
        }

        names.push(name);
        defaults.push(value);
    }

    return { names: names, defaults: defaults };
}
/* @cogs_endfunc */
