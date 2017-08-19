/** Defines a single cellular automata rule.  Each time tick, either zero or
 * one rule triggers for each cell (the center cell of the rule).  The rule
 * triggers when the rule context matches a cell and its 8 neighbouring cells.
 * When a rule triggers, the cell and its 8 neighbours are transformed
 * according to the specified output.  The output is written to the cell array
 * the next time tick.  It is possible that multiple rules try to change the
 * content of the same cell.  If so, only the first rule is triggered, and
 * the other rules are blocked.
*
* Each rule has a probability and a delay.  The delay indicates that
* a rule is triggered only once every so many time ticks.  The probability
* indicates that the rule is triggered with a given probability.
*
* If multiple rules apply to the same center cell, the rule with the highest
* priority is chosen, and its probability test is done.  If the test fails,
* the next rule in line is chosen, until either a test succeeds or there are
* no more rules left.  
*
* If there are multiple rules with the same priority, one is randomly chosen
* according to the rule probabilities. If the sum of probabilities is greater
* than or equal to 1, one rule always triggers, and the probabilites are used
* as weights to choose between the rules.
*
* By default, a rule only applies to a single orientation.  Rules can be
* mirrored and rotated using the transforms value.  
*
* Each cell also has a direction state.  The center cell can optionally be
* checked against a certain direction (srcdir) and an output direction can
* optionally be specified for it and its 9 neighbours.
* 
*/

// fill in everything yourself, then call init() if you're finished
CS.Rule = function() {

	// constants

	this.id = "";

	// master values for subrules
	this.transformspec=0;
	this.context = null; /* Long[9] */
	this.output = []; /* Long[9] */
	this.outdir = [-1,-1,-1, -1,-1,-1, -1,-1,-1]; /* Long */
	this.srcdir=-1;
	this.animdir=-1;

	this.priority=1;

	this.probability=1.0;

	this.delay=3;
	this.delaytype = "time"; // time or trigger
	this.delaytimer = null; // string, var to be used for delay timer

	this.andmask=0; /* long */

	this.condfuncstr=null; /* String */
	this.outfuncstr=null; /* String */

	this.condfunc=null; /* function */
	this.outfunc=null; /* function */

	this.animinfo="yes"; /* String */

	this.mouseenabled=false;
	this.mouseflags = 0;

	// subrule defs (derived constants)

	// context under which rule is triggered (3x3 cells). 0 = ignore
	this.contexts = null; /* long [][] */
	// output after triggering rule (3x3 cells). 0 = leave as is
	this.outputs = null; /* long[][] */

	// transformation spec for each subrule (rotation dir, mirx, miry)
	this.transforms = null; /* int[] */

	// required direction of center tile, -1 = N/A
	this.srcdirs = null; /* int[] */
	// direction of 3x3 output cells. -1 = no direction, DIRCEN=center
	this.outdirs = null; /* long[][] XXX Why long?*/
	// direction of animation, -1 = none
	this.animdirs = null; /* int[] */


	// state

	// indicates which subrules were triggered. A list of indexes.
	triggers = null; /* int[] */
	this.nrtriggers=0;
}

CS.Rule.prototype._dumpContext = function(c) {
	var idx=0;
	for (var y=0; y<3; y++) {
		var line = "";
		for (var x=0; x<3; x++) {
			line += " "+c[idx];
			idx++;
		}
		console.log(line);
	}
}

CS.Rule.prototype.dump = function() {
	console.log("#rules "+contexts.length);
	for (var i=0; i<this.contexts.length; i++) {
		console.log("srcdir="+this.srcdirs[i]);
		this._dumpContext(this.contexts[i]);
		this._dumpContext(this.outputs[i]);
		this._dumpContext(this.outdirs[i]);
	}
}


CS.Rule.prototype.init = function() {
	var nr_rot_rules=1, nr_mirx_rules=1, nr_miry_rules=1;
	var rot_inc=2;
	// currently does not optimise effectively equal rules
	if ((this.transformspec&CS.ROT2)!=0) { nr_rot_rules = 2; rot_inc=4; }
	if ((this.transformspec&CS.ROT4)!=0) nr_rot_rules = 4;
	if ((this.transformspec&CS.MIRX)!=0) nr_mirx_rules = 2;
	if ((this.transformspec&CS.MIRY)!=0) nr_miry_rules = 2;
	this.contexts = new Array(nr_rot_rules*nr_mirx_rules*nr_miry_rules);
	this.outputs = new Array(nr_rot_rules*nr_mirx_rules*nr_miry_rules);
	this.srcdirs = new Array(this.contexts.length);
	this.outdirs = new Array(this.contexts.length);
	this.animdirs = new Array(this.contexts.length);
	this.triggers = new Array(this.contexts.length);
	this.transforms = new Array(this.contexts.length);
	for (var i=0; i<nr_rot_rules; i++) {
		for (var j=0; j<nr_mirx_rules; j++) {
			for (var k=0; k<nr_miry_rules; k++) {
				var idx = i + nr_rot_rules*j
					+ nr_rot_rules*nr_mirx_rules*k;
				var transform = i*rot_inc + 8*j + 16*k;
				this.transforms[idx] = transform;
				this.contexts[idx] = CS.Rule.getTransform(transform, this.context);
				this.outputs[idx] = CS.Rule.getTransform(transform, this.output);
				this.srcdirs[idx] = CS.Rule.getTransformDir(transform,this.srcdir);
				this.animdirs[idx] = CS.Rule.getTransformDir(transform,this.animdir);
				this.outdirs[idx] = CS.Rule.getTransform(transform, this.outdir);
				for (var n=0; n<9; n++) {
					this.outdirs[idx][n] =
						CS.Rule.getTransformDir(transform,this.outdirs[idx][n]);
				}
			}
		}
	}
	// init javascript
	if (this.condfuncstr && !this.condfunc) {
		this.condfunc = new Function("return "+this.condfuncstr);
	}
	if (this.outfuncstr && !this.outfunc) {
		this.outfunc = new Function(this.outfuncstr);
	}
}


// transform: transform bitmask
// src: tiletype[9]
// returns: tiletype[9]
CS.Rule.getTransform = function(transform,src) {
	var dst = new Array(9);
	var rot = transform&7;
	var mirx = transform&8;
	var miry = transform&16;
	if (mirx) {
		//long [] dst2 = new long[9];
		dst[0]=src[2]; dst[1]=src[1]; dst[2]=src[0];
		dst[3]=src[5]; dst[4]=src[4]; dst[5]=src[3];
		dst[6]=src[8]; dst[7]=src[7]; dst[8]=src[6];
		//System.arraycopy(dst2, 0, dst, 0, 9);
	} else {
		for (var i=0; i<9; i++) dst[i] = src[i];
	}
	var dst2 = new Array(9);
	if (miry) {
		//long [] dst2 = new long[9];
		dst2[0]=dst[6]; dst2[1]=dst[7]; dst2[2]=dst[8];
		dst2[3]=dst[3]; dst2[4]=dst[4]; dst2[5]=dst[5];
		dst2[6]=dst[0]; dst2[7]=dst[1]; dst2[8]=dst[2];
		//System.arraycopy(dst2, 0, dst, 0, 9);
	} else {
		for (var i=0; i<9; i++) dst2[i] = dst[i];
	}
	switch (rot) {
	case 0:
	case 1:
		dst[0]=dst2[0]; dst[1]=dst2[1]; dst[2]=dst2[2];
		dst[3]=dst2[3]; dst[4]=dst2[4]; dst[5]=dst2[5];
		dst[6]=dst2[6]; dst[7]=dst2[7]; dst[8]=dst2[8];
	break;
	case 2:
	case 3:
		dst[0]=dst2[6]; dst[1]=dst2[3]; dst[2]=dst2[0];
		dst[3]=dst2[7]; dst[4]=dst2[4]; dst[5]=dst2[1];
		dst[6]=dst2[8]; dst[7]=dst2[5]; dst[8]=dst2[2];
	break;
	case 4:
	case 5:
		dst[0]=dst2[8]; dst[1]=dst2[7]; dst[2]=dst2[6];
		dst[3]=dst2[5]; dst[4]=dst2[4]; dst[5]=dst2[3];
		dst[6]=dst2[2]; dst[7]=dst2[1]; dst[8]=dst2[0];
	break;
	case 6:
	case 7:
		dst[0]=dst2[2]; dst[1]=dst2[5]; dst[2]=dst2[8];
		dst[3]=dst2[1]; dst[4]=dst2[4]; dst[5]=dst2[7];
		dst[6]=dst2[0]; dst[7]=dst2[3]; dst[8]=dst2[6];
	break;
	}
	return dst;
}


CS.Rule.getTransformDir = function(transform,dir) {
	if (dir==-1) return -1;
	var rot = transform&7;
	var mirx = transform&8;
	var miry = transform&16;
	var retdir = (dir + rot)%8;
	if (mirx) {
		switch (retdir) {
		case CS.DIRL:  retdir=CS.DIRR; break;
		case CS.DIRUL: retdir=CS.DIRUR; break;
		case CS.DIRDL: retdir=CS.DIRDR; break;
		case CS.DIRR:  retdir=CS.DIRL; break;
		case CS.DIRUR: retdir=CS.DIRUL; break;
		case CS.DIRDR: retdir=CS.DIRDL; break;
		}
	}
	if (miry) {
		switch (retdir) {
		case CS.DIRU:  retdir=CS.DIRD; break;
		case CS.DIRUL: retdir=CS.DIRDL; break;
		case CS.DIRUR: retdir=CS.DIRDR; break;
		case CS.DIRD:  retdir=CS.DIRU; break;
		case CS.DIRDL: retdir=CS.DIRUL; break;
		case CS.DIRDR: retdir=CS.DIRUR; break;
		}
	}
	return retdir;
}

