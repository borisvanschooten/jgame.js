// holds the data for a CellSpace game
CS.Game = function() {
	// Public fields
	this.delaymul = 3;
	this.tilex=49;
	this.tiley=49;
	this.nrtilesx=32;
	this.nrtilesy=22;
	// is now hard coded to 1920x1080
	//this.winwidth=1024;
	//this.winheight=704;

	this.title="";
	this.desc="";
	this.init=null; /* one-time global init */

	this.titlebackgroundurl=null;
	this.titlebackgroundcolor=null;

	// default for levels (in the current implementation, this is the only
	// place where you can specify these)
	this.tilemapurl=null; // TODO rename to tiletexurl
	this.tiletex_tilex = 16;
	this.tiletex_tiley = 16;
	this.tiletex_nrtilesx = 16;
	this.tiletex_nrtilesy = 16;
	this.tiletex_smooth = false;
	this.backgroundurl=null;
	this.backgroundcolor=null;

	// Private fields
	// empty, cell, group
	this.cellsyms = {}; /* String => Cell */
	this.cellsyms_mask = {}; /* Long => Cell */

	// maps symbol to mask
	this.cellsymgroups = {}; /* String => Long */

	this.nextcellsym=1; /* Long */

	this.rules = []; /* Rule[]*/
	//public int nr_rules=0;

	this.levels = []; /* Level[] */
	//public int nr_levels=0;

}
