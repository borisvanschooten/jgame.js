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
	this.outdir = [-2,-2,-2, -2,-2,-2, -2,-2,-2]; /* Long, CS.IGNOREDIR */
	this.srcdir=CS.IGNOREDIR;
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

	this.mouseenabled=false; // not implemented yet
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

// TODO animinfo, mouseenabled, mouseflags, animdir, andmask
CS.Rule.prototype.toString = function() {
	var src = "rule: "+this.id+"\n";
	var skipline0_2=true;
	for (var y=0; y<3; y+=2) {
		for (var x=0; x<3; x++) {
			if (this.context[x + 3*y] || this.output[x + 3*y]) {
				skipline0_2=false;
			}
		}
	}
	var y0 = skipline0_2 ? 1 : 0;
	var y1 = skipline0_2 ? 2 : 3;
	for (var y=y0; y<y1; y++) {
		for (var x=0; x<6; x++) {
			if (x==3) src += "  "
			if (x<3) {
				src += CS.Main.getTileSymFromMask(this.context[x+3*y])+" "
			} else {
				src += CS.Main.getTileSymFromMask(this.output[x-3 + 3*y])+" "
			}
		}
		src += "\n"
	}
	src += "priority: "+this.priority+"\n";
	var trans_str = this.transformToString();
	if (trans_str != "") src += "transform: "+trans_str+"\n"
	src += "probability: "+this.probability+"\n";
	src += "delay: "+this.delayToString()+"\n";
	if (this.condfuncstr) {
		src += "condfunc: "+this.condfuncstr+"\n";
	}
	if (this.outfuncstr) {
		src += "outfunc: "+this.outfuncstr+"\n";
	}
	if (this.srcdir != CS.IGNOREDIR) {
		src += "conddir: "+this.dirToString(this.srcdir)+"\n";
	}
	var emptyrows = [true,true,true];
	var rowspecs = ["","",""]
	for (var y=0; y<3; y++) {
		for (var x=0; x<3; x++) {
			if (this.outdir[x+3*y] != CS.IGNOREDIR) emptyrows[y]=false;
			rowspecs[y] += this.dirToString(this.outdir[x+3*y])+" "
		}
	}
	if (emptyrows[0] && !emptyrows[1] && emptyrows[2]) {
		// one-row spec
		src += "outdir: "+rowspecs[1];
	} else if (!emptyrows[0] || !emptyrows[1] || !emptyrows[2]) {
		// full spec
		src += "outdir:\n"+rowspecs[0]+"\n"+rowspecs[1]+"\n"+rowspecs[2]+"\n";
	} // else empty
	return src
}

CS.Rule.prototype.delayToString = function() {
	ret = ""+this.delay;
	if (this.delaytype == "trigger") {
		ret += " trigger "+this.delaytimer;
	}
	return ret;
}

CS.Rule.prototype.transformToString = function() {
	str = "";
	if (this.transformspec&CS.ROT2) str += "rot2 ";
	if (this.transformspec&CS.ROT4) str += "rot4 ";
	if (this.transformspec&CS.MIRX) str += "mirx ";
	if (this.transformspec&CS.MIRY) str += "miry ";
	return str.trim();
}

CS.Rule.prototype.mouseToString = function() {
	if (this.mouseenabled) return "";
	ret = [];
	if (this.mouseoptions&CS.MOUSEHOVER) ret.push("hover");
	if (this.mouseoptions&CS.MOUSEDRAG)  ret.push("drag");
	if (this.mouseoptions&CS.MOUSECLICK) ret.push("click");
	return ret.join(" ");
}

CS.Rule.prototype.dirToString = function(dirmask) {
	switch(dirmask) {
		case CS.NODIR: return "N"; // deprecate "C"?
		case CS.DIRU: return "U";
		case CS.DIRD: return "D";
		case CS.DIRL: return "L";
		case CS.DIRUL: return "UL";
		case CS.DIRDL: return "DL";
		case CS.DIRR: return "R";
		case CS.DIRUR: return "UR";
		case  CS.DIRDR: return "DR";
		default: /*CS.IGNOREDIR*/ return "-";
	}
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
	if (dir==CS.IGNOREDIR) return CS.IGNOREDIR;
	if (dir==CS.NODIR) return CS.NODIR;
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

