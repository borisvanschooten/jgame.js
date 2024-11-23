/** Holds the state of a level.
* Scripting in cell maps:
*
* Each cell can have an additional state, consisting of one or more variables.
* All cells have the same set of variables.  A rule condition can include an
* arbitrary expression on these variables for the center cell ands its
* neighbours, as well as statements specifying operations on them.
*
* You can also specify a set of global variables, which are accessible from
* every cell.
*
* The callbacks are animation callbacks. These are objects that are expected
* to contain the following functions:
*
* function tileChanged(x,y,tilemask,rot)
*    Called when a non animated tile is changed. Is also called when
*    CellMap is initialised. 
* 
* function tileAnim(x1,y1,tilemask1,rot1,x2,y2,tilemask2,rot2,delay)
*    Called when a tile is animated from position 1 to position 2.
*    A tileChanged was already called for position 1.
*    If your implementation does not have animations, it can be treated
*    as a tilechanged call for position 2.  An animation implementation
*    basically animates tile 2 from location 1 to location 2 over delay time
*    steps.
*/

// game: Game object
// level: Level object
// callback: animation callback
CS.CellMap = function(game,level,callback) {
	//ScriptContext.initContext();
	this.level = level; /* Level */
	this.game = game; /* Game */
	this.width = level.width;
	this.height = level.height;
	this.bordertile = level.filltile; /* long */
	// has 1 cell padding on all sides
	this.srci=0;
	this.dsti=1;

	// temp variables for applyRules
	// triggered and trigprob hold an array of rules+probs for each priority
	// level. Counts are stored in nrtriggered.
	this._triggered = CS.initArray([CS.MAXPRIO,CS.MAXTRIGRULES],null); /* Rule[][] */
	this._trigprob = CS.initArray([CS.MAXPRIO,CS.MAXTRIGRULES],0); /* double[][] */
	this._nrtriggered = null; /* double[] */
	// is set when a rule may trigger in the current cell
	this._potentialtrigger = false;

	this.map = CS.initArray([2,this.width+2,this.height+2],0);
	this.dir = CS.initArray([2,this.width,this.height],0);
	// indicates that cell or neighbour was changed
	// has 1 cell padding on all sides
	this.active = CS.initArray([2,this.width+2,this.height+2],false);
	// has 1 cell padding on all sides
	this.changed = CS.initArray([this.width+2,this.height+2],false);
	for (var x=0; x<this.width; x++) {
		for (var y=0; y<this.height; y++) {
			this.dir[this.srci][x][y] = CS.NODIR;
		}
	}
	// fill border padding
	for (var x=0; x<this.width+2; x++) {
		this.map[this.srci][x][0] = this.bordertile;
		this.map[this.srci][x][this.height+1] = this.bordertile;
		this.map[this.dsti][x][0] = this.bordertile;
		this.map[this.dsti][x][this.height+1] = this.bordertile;
	}
	for (var y=0; y<this.height+2; y++) {
		this.map[this.srci][0][y] = this.bordertile;
		this.map[this.srci][this.width+1][y] = this.bordertile;
		this.map[this.dsti][0][y] = this.bordertile;
		this.map[this.dsti][this.width+1][y] = this.bordertile;
	}
	this._fillMap(this.srci,level.filltile);
	this._fillMap(this.dsti,-1);
	// copy level map to cellmap
	for (var y=0; y<level.map.length; y++) {
		for (var x=0; x<level.map[y].length; x++) {
			var cell = this.game.cellsyms[""+level.map[y].charAt(x)];
			if (!cell)
				CS.reportConsole("RuntimeError",
					"Unknown cell "+level.map[y].charAt(x));
			this.setCell(x,y,cell.mask,cell.dir);
		}
	}
	// row and column evaluation order (is randomized)
	this._xorder = new Array(this.width);
	this._yorder = new Array(this.height);
	for (var i=0; i<this.width; i++) this._xorder[i] = i;
	for (var i=0; i<this.height; i++) this._yorder[i] = i;
	for (var x=0; x<this.width; x++) {
		for (var y=0; y<this.height; y++) {
			callback.tileChanged(x,y,
				this.map[this.srci][x+1][y+1],
				this.dir[this.srci][x][y] );
		}
	}
}

// call init scripts
CS.CellMap.prototype.init = function() {
	// init script
	// call globals and init with global scope
	// Do not cache compiled functions, as these are called only once
	//scope = ScriptContext.initScope();
	if (this.level.globals) (1,eval)(this.level.globals);
	if (this.level.init) (1,eval)(this.level.init);
}

CS.CellMap.prototype.dump = function() {
	console.log("CellMap active:");
	for (var y=0; y<this.height+2; y++) {
		var line = "";
		for (var x=0; x<this.width+2; x++) {
			line += this.active[this.srci][x][y] ? "*":".";
		}
		console.log(line);
	}
}

// cellsym is tile string
CS.CellMap.prototype.countCells = function(cellsyms) {
	var count=0;
	var mask=0;
	for (var i=0; i<cellsyms.length; i++) {
		var cell = CS.Main.game.cellsyms[cellsyms.charAt(i)];
		if (!cell) CS.reportConsole("RuntimeError",
			"countCells: Unknown cellsym "+cellsym);
		mask |= cell.mask;
	}
	for (var x=0; x<this.width; x++) {
		for (var y=0; y<this.height; y++) {
			if (this.map[this.srci][x+1][y+1] & mask) count++;
		}
	}
	return count;
}

// random functions used from jgame

CS.CellMap.prototype._shuffleOrder = function() {
	for (var i=0; i<50; i++) {
		var idx1 = randomstep(0,this.width-1,1);
		var idx2 = randomstep(0,this.width-1,1);
		var tmp = this._xorder[idx1];
		this._xorder[idx1] = this._xorder[idx2];
		this._xorder[idx2] = tmp;
		idx1 = randomstep(0,this.height-1,1);
		idx2 = randomstep(0,this.height-1,1);
		tmp = this._yorder[idx1];
		this._yorder[idx1] = this._yorder[idx2];
		this._yorder[idx2] = tmp;
	}
}

CS.CellMap.prototype.updateTile = function(x,y,callback) {
	callback.tileChanged(x,y,
		this.map[this.srci][x+1][y+1],
		this.dir[this.srci][x][y] );
}

CS.CellMap.prototype.setCell = function(x,y,value,direction) {
	if (x<0 || x >= this.width || y<0 || y>=this.height) return;
	this.map[this.srci][x+1][y+1] = value;
	this.dir[this.srci][x][y] = direction;
}


CS.CellMap.prototype._fillMap = function(idx,filltile) {
	for (var x=0; x<this.width; x++) {
		for (var y=0; y<this.height; y++) {
			this.map[idx][x+1][y+1] = filltile;
		}
	}
	for (var x=0; x<this.width+2; x++) {
		for (var y=0; y<this.height+2; y++) {
			if (x==0 || x==this.width+1 || y==0 || y==this.height+1) {
				this.active[idx][x][y] = false;
			} else {
				this.active[idx][x][y] = true;
			}
		}
	}
}

CS.CellMap.prototype._clearActive = function(idx) {
	for (var x=0; x<this.width+2; x++) {
		for (var y=0; y<this.height+2; y++) {
			this.active[idx][x][y] = false;
		}
	}
}

CS.CellMap.prototype._copySrcDst = function() {
	for (var x=0; x<this.width; x++) {
		for (var y=0; y<this.height; y++) {
			this.map[this.dsti][x+1][y+1] = this.map[this.srci][x+1][y+1];
			this.dir[this.dsti][x][y] = this.dir[this.srci][x][y];
			//active[dsti][x+1][y+1] = active[srci][x+1][y+1];
			this.changed[x+1][y+1] = false;
		}
	}
	this._clearActive(this.dsti);
}

// rules: Rule[]
CS.CellMap.prototype.applyRules = function(rules,worldtimer,callback) {
	this._shuffleOrder();
	this._copySrcDst();
	//if (worldtimer % 50 == 0) this.dump();
	// check which rules are triggered
	for (var prioidx=CS.MAXPRIO-1; prioidx>=0; prioidx--) {
		for (var xidx=0; xidx<this.width; xidx++) {
			var x = this._xorder[xidx];
			for (var yidx=0; yidx<this.height; yidx++) {
				var y = this._yorder[yidx];
				// skip if all context cells are inactive
				if (!this.active[this.srci][x  ][y  ]
				&&  !this.active[this.srci][x+1][y  ]
				&&  !this.active[this.srci][x+2][y  ]
				&&  !this.active[this.srci][x  ][y+1]
				&&  !this.active[this.srci][x+1][y+1]
				&&  !this.active[this.srci][x+2][y+1]
				&&  !this.active[this.srci][x  ][y+2]
				&&  !this.active[this.srci][x+1][y+2]
				&&  !this.active[this.srci][x+2][y+2]) continue;
				//var cur_prio = -32768;
				var cur_prob = CS.initArray([CS.MAXPRIO],0.0);
				// XXX make more efficient with fixed array size
				this._nrtriggered = CS.initArray([CS.MAXPRIO],0.0);
				this._potentialtrigger=false;
				for (var r=0; r<rules.length; r++) {
					var rule = rules[r];
					var prio = rule.priority;
					if (prio != prioidx) continue;
					if (this._checkRuleAtPos(rule,x,y)) {
						// rule is potentially triggered
						//if (rule.priority < cur_prio) continue;
						if (rule.delaytype == "time") {
							if (worldtimer%rule.delay != 0) continue;
						} else { // "trigger"
							//console.log("triggertimer "+rule.delaytimer+"="
							//	+CS.Main.triggertimers[rule.delaytimer]);
							if (CS.Main.triggertimers[rule.delaytimer]) continue;
						}
						// rule is actually triggered
						//cur_prio = rule.priority;
						cur_prob[prio] += rule.probability;
						this._triggered[prio][this._nrtriggered[prio]] = rule;
						this._trigprob[prio][this._nrtriggered[prio]++] =
							cur_prob[prio];
					}
				}
				// set active state for every cell that can be potentially
				// changed by a rule
				if (this._potentialtrigger) {
					this.active[this.dsti][x  ][y  ] = true;
					this.active[this.dsti][x+1][y  ] = true;
					this.active[this.dsti][x+2][y  ] = true;
					this.active[this.dsti][x  ][y+1] = true;
					this.active[this.dsti][x+1][y+1] = true;
					this.active[this.dsti][x+2][y+1] = true;
					this.active[this.dsti][x  ][y+2] = true;
					this.active[this.dsti][x+1][y+2] = true;
					this.active[this.dsti][x+2][y+2] = true;
				}
				// select a rule from the triggered rules
				trigger_rules: for (var p=CS.MAXPRIO-1; p>=0; p--) {
					if (this._nrtriggered[p]!=0) {
						//active[dsti][x+1][y+1] = true;
						// pick a point on the probability line
						var prob = random(0.0,Math.max(1.0,cur_prob[p]));
						// find the rule that matches that point
						// XXX linear search is slow
						if (prob <= cur_prob[p]) {
							for (var i=0; i<this._nrtriggered[p]; i++) {
								if (this._trigprob[p][i] >= prob) {
									this._triggerRule(this._triggered[p][i],x,y,callback);
									break trigger_rules;
								}
							}
							// fall through to lower priority level
						}
					}
				}
			}
		}
	}
	// swap src and dst
	this.srci = (this.srci+1)%2;
	this.dsti = (this.dsti+1)%2;
}


// rule: Rule object
CS.CellMap.prototype._checkRuleAtPos = function(rule,x,y) {
	var any_trigger=false;
	rule.nrtriggers=0;
	var m = this.map[this.srci];
	nextsubrule: for (var i=0; i<rule.contexts.length; i++) {
		// check dir
		if (rule.srcdirs[i]!=-1 &&
		rule.srcdirs[i]!=this.dir[this.srci][x][y]) continue;
		// check cell context
		var c = rule.contexts[i];
		var cidx=0;
		for (var dy=-1; dy<=1; dy++) {
			for (var dx=-1; dx<=1; dx++) {
				cidx++;
				var cmask = c[cidx-1];
				if (cmask!=0 && (m[x+dx+1][y+dy+1] & cmask) == 0) {
					continue nextsubrule;
				}
			}
		}
		// indicates that rule may trigger in the future, so do not make
		// cell inactive
		this._potentialtrigger=true;
		cidx=0;
		// block rule if any output cell was already changed by
		// another rule
		for (var dy=-1; dy<=1; dy++) {
			for (var dx=-1; dx<=1; dx++) {
				cidx++;
				if (this.changed[1+x+dx][1+y+dy]) {
					if (rule.outputs[i][cidx-1]!=0
					||  rule.outdirs[i][cidx-1]!=-1)
						continue nextsubrule;
				}
			}
		}
		// set explicit variables for condfunc and outfunc
		window.x = x;
		window.y = y;
		// check extra cond
		if (rule.condfunc) {
			// pass implicit parameters to ruletrigger
			ruletriggerparam = {
				rule: rule,
				subrule: i,
				x: x,
				y: y,
			};
			if (!rule.condfunc()) continue nextsubrule;
		}
		//System.out.println(Long.toBinaryString(rule.enable_masks[i]));
		//if (mask[x][y]!=0) {
		//	System.out.println(x+" "+y+" "+Long.toBinaryString(mask[x][y]));
		//}
		rule.triggers[rule.nrtriggers++] = i;
		any_trigger=true;
	}
	return any_trigger;
}

// r: Rule
CS.CellMap.prototype._triggerRule = function(r, x,y, callback) {
	if (r.nrtriggers==0) CS.reportConsole("RuntimeError","No triggers in rule");
	var ri = r.triggers[randomstep(0,r.nrtriggers-1,1)];
	// There can be max. 2 animations, one from center and one to center.
	// From center:
	// (1) the rule source's center tile is defined
	// (2) the center tile is changed to something else
	// (3) exactly one tile in the destination is the same as the center tile
	var anim_idx_src = -1; // dest tile of from-center anim, -1=no anim
	var anim_src_anim=null; // refers to anim structure
	if (r.animinfo == "yes" || r.animinfo == "from-center"
	&&  r.contexts[ri][4] != 0) {
		var centype = r.contexts[ri][4];
		var celldef = CS.Main.game.cellsyms_mask[centype];
		if ( (!celldef || celldef.should_anim)
		&&  r.outputs[ri][4]!=0 && (r.outputs[ri][4] & centype) == 0) {
			// check for the regular same-type movement
			var centypecount=0;
			for (var i=0; i<9; i++) {
				if (i==4) continue;
				if ((r.outputs[ri][i] & centype) != 0) {
					centypecount++;
					if (centypecount>1) {
						anim_idx_src=-1;
						break; // fail, abort
					}
					anim_idx_src = i;
				}
			}
			if (anim_idx_src == -1) {
				// check for src-to-dest-type movement only if regular
				// movement not found
				for (var key in celldef.anims) {
					var anim = celldef.anims[key];
					if (anim.type != "move") continue;
					centype = anim.dstmask;
					centypecount=0;
					for (var i=0; i<9; i++) {
						if (i==4) continue;
						if ((r.outputs[ri][i] & centype) != 0) {
							centypecount++;
							if (centypecount>1) {
								anim_idx_src=-1;
								break; // fail, abort
							}
							anim_src_anim = anim;
							anim_idx_src = i;
						}
					}
					if (anim_idx_src != -1) {
						break; // found
					}
				}
			}
		}
	}
	// To center:
	// (1) the rule destination's center tile set is defined
	// (2) the rule source's center tile is different from the dest center tile
	// (3) exactly one tile in the source is the same as the dest center tile
	var anim_idx_dst = -1; // dest tile of from-center anim, -1=no anim
	var anim_dst_anim=null; // refers to anim structure
	if (r.animinfo == "yes" || r.animinfo == "to-center"
	&&  r.outputs[ri][4] != 0) {
		var centype = r.outputs[ri][4];
		var celldef = CS.Main.game.cellsyms_mask[centype];
		if (celldef.should_anim
		&&  r.contexts[ri][4]!=0 && (r.contexts[ri][4] & centype) == 0) {
			var centypecount=0;
			for (var i=0; i<9; i++) {
				if (i==4) continue;
				if ((r.contexts[ri][i] & centype) != 0) {
					centypecount++;
					if (centypecount>1) {
						anim_idx_dst=-1;
						break; // fail, abort
					}
					anim_idx_dst = i;
				}
			}
			if (anim_idx_dst == -1) {
				// check for src-to-dest-type movement only if regular
				// movement not found
				for (var key in celldef.anims) {
					var anim = celldef.anims[key];
					if (anim.type != "move") continue;
					centype = anim.srcmask;
					centypecount=0;
					for (var i=0; i<9; i++) {
						if (i==4) continue;
						if ((r.contexts[ri][i] & centype) != 0) {
							centypecount++;
							if (centypecount>1) {
								anim_idx_dst=-1;
								break; // fail, abort
							}
							anim_dst_anim = anim;
							anim_idx_dst = i;
						}
					}
					if (anim_idx_dst != -1) {
						break; // found
					}
				}
			}
		}
	}
	for (var dx=-1; dx<=1; dx++) {
		var xi = x+dx;
		if (xi<0 || xi >= this.width) continue;
		for (var dy=-1; dy<=1; dy++) {
			var yi = y+dy;
			if (yi<0 || yi >= this.height) continue;
			// change cell
			var didx = 1+dx+3*(dy+1);
			var out = r.outputs[ri][didx];
			var outdir = r.outdirs[ri][didx];
			if (out!=0) this.map[this.dsti][xi+1][yi+1] = out;
			if (outdir!=-1) this.dir[this.dsti][xi][yi] = outdir;
			// note, we include center tile in changed to ensure only one rule
			// is triggered per tile if we traverse the grid multiple times
			if (out!=0 || outdir!=-1 || (dx==0&&dy==0)) {
				this.changed[xi+1][yi+1] = true;
				if (didx==4 && anim_idx_dst!=-1) continue;
				if (didx == anim_idx_src) continue;
				//if (!has_anim_src
				//|| (didx!=4 && didx != anim_idx_src) ) {
				callback.tileChanged(xi,yi,
					this.map[this.dsti][xi+1][yi+1],
					this.dir[this.dsti][xi][yi] );
				// mark dirty
				//if (map[dsti][xi+1][yi+1] != map[srci][xi+1][yi+1]) {
					//for (int ddx=-1; ddx<=1; ddx++) {
					//	active[dsti][1+xi+ddx][1+yi-1] = true;
					//	active[dsti][1+xi+ddx][1+yi  ] = true;
					//	active[dsti][1+xi+ddx][1+yi+1] = true;
					//}
				//}
			}
		}
	}
	if (anim_idx_src >= 0) {
		var x2 = x - 1 + Math.floor(anim_idx_src%3);
		var y2 = y - 1 + Math.floor(anim_idx_src/3);
		if (anim_idx_dst>=0) {
			// Both to and from center are defined:
			// center should be empty.
			// We assume here that the tile that was in idx_src
			// can be used to fill up the center tile temporarily
			//callback.tileChanged(x,y,
			//	this.map[this.srci][x2+1][y2+1],
			//	this.dir[this.srci][x2][y2]);
			// use empty tile for now, this currently covers the most cases
			callback.tileChanged(x,y, 0, 0);
		}
		if (x2>=0 && x2<this.width
		&&  y2>=0 && y2<this.height) {
			//console.log("Anim src:" +x2+"/"+y2);
			//callback.tileChanged(x,y,
			//	this.map[this.dsti][x+1][y+1],
			//	this.dir[this.dsti][x][y]);
			if (!anim_src_anim || anim_src_anim.rotsrc=="dst") {
				// use rot info on dest tile (default)
				callback.tileAnim(x,y, x2, y2,
					this.map[this.dsti][x2+1][y2+1],
					this.dir[this.dsti][x2][y2], r.delay,
					this.map[this.srci][x+1][y+1],
					this.map[this.dsti][x2+1][y2+1]);
			} else { // src tile
				callback.tileAnim(x,y, x2, y2,
					this.map[this.dsti][x2+1][y2+1],
					this.dir[this.dsti][x][y], r.delay,
					this.map[this.srci][x+1][y+1],
					this.map[this.srci][x+1][y+1]);
			}
		} else { // dest is off the map
			callback.tileChanged(x,y,
				this.map[this.dsti][x+1][y+1],
				this.dir[this.dsti][x][y] );
			//callback.tileChanged(x2,y2,
			//	this.map[this.dsti][x2+1][y2+1],
			//	this.dir[this.dsti][x2][y2] );
		}
	}
	if (anim_idx_dst >= 0) {
		var x2 = x - 1 + Math.floor(anim_idx_dst%3);
		var y2 = y - 1 + Math.floor(anim_idx_dst/3);
		if (x2>=0 && x2<this.width
		&&  y2>=0 && y2<this.height) {
			//console.log("Anim dst:" +x2+"/"+y2);
			//callback.tileChanged(x2,y2,
			//	this.map[this.dsti][x2+1][y2+1],
			//	this.dir[this.dsti][x2][y2]);
			if (!anim_dst_anim || anim_dst_anim.rotsrc=="dst") {
				// use rot info on dest tile (default)
				callback.tileAnim(x2,y2, x,y,
					this.map[this.dsti][x+1][y+1],
					this.dir[this.dsti][x][y], r.delay,
					this.map[this.srci][x2+1][y2+1],
					this.map[this.dsti][x+1][y+1]);
			} else { // src tile
				//console.log("srcI!!! "+this.map[this.srci][x2+1][y2+1]);
				callback.tileAnim(x2,y2, x,y,
					this.map[this.dsti][x+1][y+1],
					this.dir[this.dsti][x2][y2], r.delay,
					this.map[this.srci][x2+1][y2+1],
					this.map[this.srci][x2+1][y2+1]);
			}
		} else { // dest is off the map
			callback.tileChanged(x,y,
				this.map[this.dsti][x+1][y+1],
				this.dir[this.dsti][x][y] );
			//callback.tileChanged(x2,y2,
			//	this.map[this.dsti][x2+1][y2+1],
			//	this.dir[this.dsti][x2][y2] );
		}
	}
	if (r.outfunc) r.outfunc();
	if (r.delaytype == "trigger") {
		CS.Main.triggertimers[r.delaytimer] = r.delay;
	}
}

CS.CellMap.prototype.checkWinCond = function() {
	if (!this.level.win) return false;
	return this.level.winsc();
}

CS.CellMap.prototype.checkLoseCond = function() {
	if (!this.level.lose) return false;
	return this.level.losesc();
}

CS.CellMap.prototype.doTick = function() {
	if (!this.level.tick) return;
	return this.level.ticksc();
}


