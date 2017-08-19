// Copyright (c) 2014 by Boris van Schooten boris@13thmonkey.org
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine
// menu system

// function painttitle(menuobject)
// function paint_backbutton(is_active,menuobject,menuitemobject)
function JGMenu(painttitle,paint_backbutton,userdata) {
	this.painttitle = painttitle;
	this.backitem = {paintitem: paint_backbutton, callback: null,
		userdata: userdata};
	this.items = [];
	this.cur_idx = 0;
	this.parentmenu = null;
	this.animtimer=0;
	// controls
}

JGMenu.prevmouseselect=false;
JGMenu.prevkeyprev=false;
JGMenu.prevkeynext=false;
JGMenu.prevkeyselect=false;

// function paintitem(is_active,menuobject,menuitemobject)
// paintitem can optionally return a hitbox for mouse selection
// function callback(menuobject)
JGMenu.prototype.addMenuItem = function(paintitem, callback, userdata) {
	this.items.push({paintitem:paintitem,callback:callback,userdata: userdata});
}


// function paintitem(is_active,menuobject,menuitemobject)
// paintitem can optionally return a hitbox for mouse selection
// JGMenu submenu
JGMenu.prototype.addSubmenu = function(paintitem, submenu, userdata) {
	this.items.push({paintitem:paintitem, submenu:submenu, userdata:userdata});
	submenu.parentmenu = this;
}


JGMenu.prototype.paint = function() {
	if (this.painttitle) this.painttitle(this);
	this.animtimer++;
	for (var i=0; i<this.items.length; i++) {
		var hitbox = this.items[i].paintitem(i==this.cur_idx, this,
			this.items[i]);
		this.items[i].hitbox = hitbox;
	}
	if (this.parentmenu) {
		var hitbox = this.backitem.paintitem(
			this.cur_idx==this.items.length,this,this.backitem);
		this.backitem.hitbox = hitbox;
	}
}

// controls: mouse/touch: hitbox. select on release
// kb/gamepad: up/down. select on fire/enter
// Returns: selected submenu or parent menu,
//          or current menu if neither was selected
JGMenu.prototype.update = 
function(active_on_hover,xpos,ypos,mouseselect,keyprev,keynext,keyselect) {
	var prev_idx = this.cur_idx;
	if (!keyprev) keyprev=false;
	if (!keynext) keynext=false;
	var retval = this;
	var hit_item=null;
	var hit_idx=-1;
	var max_idx = this.items.length;
	if (this.backitem && this.parentmenu) max_idx++;
	for (var i=0; i<max_idx; i++) {
		var item = i==this.items.length ? this.backitem : this.items[i];
		if (!item || !item.hitbox) continue;
		if (xpos > item.hitbox.x && xpos < item.hitbox.x+item.hitbox.width
		&&  ypos > item.hitbox.y && ypos < item.hitbox.y+item.hitbox.height) {
			hit_item = item;
			hit_idx = i;
		}
	}
	var select_idx=-1;
	if (hit_item) {
		if (active_on_hover) {
			this.cur_idx = hit_idx;
		}
		if (!JGMenu.prevmouseselect && mouseselect) {
			this.cur_idx = hit_idx;
			select_idx = hit_idx;
		}
	}
	if (JGMenu.prevkeyselect && !keyselect) {
		if (this.cur_idx >= 0) {
			select_idx = this.cur_idx;
		}
	}
	if (select_idx >= 0) {
		if (this.cur_idx < this.items.length) {
			var item = this.items[this.cur_idx];
			if (item.submenu) {
				retval = item.submenu;
			} else if (item.callback) {
				item.callback(this);
			}
		} else {
			retval = this.parentmenu;
		}
	}
	if (keyprev && !JGMenu.prevkeyprev) {
		if (this.cur_idx > 0) this.cur_idx--;
	}
	if (keynext && !JGMenu.prevkeynext) {
		if (this.cur_idx < max_idx-1) this.cur_idx++;
	}
	JGMenu.prevmouseselect = mouseselect;
	JGMenu.prevkeyprev = keyprev;
	JGMenu.prevkeynext = keynext;
	JGMenu.prevkeyselect = keyselect;
	if (prev_idx != this.cur_idx) this.animtimer = 0;
	return retval;
}

