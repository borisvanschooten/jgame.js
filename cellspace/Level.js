CS.Level = function() {
	// defs

	// may contain spaces
	this.title="";
	this.desc="";

	// statements that initialize global variables and functions
	this.globals=null;

	this.tilemapurl=null;
	this.backgroundurl=null;
	this.backgroundcolor=null;

	// function strings
	this.init=null;
	this.win=null;
	this.lose=null;
	this.tick=null;

	// GLOBAL scope -> call using (1,eval), so does not need to be compiled
	//public Script globalssc=null;
	//public Script initsc=null;
	// LOCAL scope -> convert using new Function()
	this.winsc=null;
	this.losesc=null;
	this.ticksc=null;


	this.width=0;
	this.height=0;
	this.filltile=0;
	this.map = []; /*String*/

	// rules for this specific level
	this.rules = []; /* Rule[] */
	//public int nr_rules=0; DELETE

}

CS.Level.prototype.initialize = function() {
	// init scripts
	if (this.win && !this.winsc) {
		this.winsc = new Function("return "+this.win);
	}
	if (this.lose && !this.losesc) {
		this.losesc = new Function("return "+this.lose);
	}
	if (this.tick && !this.ticksc) {
		this.ticksc = new Function(this.tick);
	}
	// sort rules by priority using bubblesort
	var idx=0;
	while (idx < this.rules.length-1) {
		if (this.rules[idx].priority < this.rules[idx+1].priority) {
			var tmp = this.rules[idx];
			this.rules[idx] = this.rules[idx+1];
			this.rules[idx+1] = tmp;
			if (idx>0) idx--;
		} else {
			idx++;
		}
	}
}

