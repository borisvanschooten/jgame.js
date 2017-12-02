// Copyright (c) 2014 by Boris van Schooten tmtg.net boris@13thmonkey.org
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine

// Class JGObject

// polymorphism according to:
//http://www.zipcon.net/~swhite/docs/computers/languages/object_oriented_JS/inheritance.html
//http://stackoverflow.com/questions/9850892/should-i-use-polymorphism-in-javascript


// CONSTRUCTOR AND INSTANCE PROPERTIES


// When called without parameters, serves as prototype for subclasses. When
// called with parameters, serves as initialisation of superclass.
function JGObject(name,unique,x,y,colid) {
	if (!name) return; // no parameters -> no initialisation
	// check parameters
	if (!typecheckNumber(x,"x")) return;
	if (!typecheckNumber(y,"y")) return;
	if (!typecheckInt(colid,"colid")) return;
	this.name = name;
	if (unique) this.name += JGObject._nextid++;
	this.x = x;
	this.y = y;
	this.z = 0;
	this.lastx = x;
	this.lasty = y;
	this.alive = true;
	this.colid = colid;
	this.bbox = {
		x: -8, y: -8, width:16, height: 16
	};
	this.tilebbox = null;
	this.xspeed = 0.0;
	this.yspeed = 0.0;
	this.suspendxmargin=0;
	this.suspendymargin=0;
	this.suspended=false;
	this.expirexmargin=0;
	this.expireymargin=0;
	JGObject.addObject(this);
}


// STATIC PROPERTIES

JGObject._objects = {};

JGObject._nextid=0;


// STATIC METHODS


JGObject.addObject = function(o) {
	JGObject._objects[o.name] = o;
}


JGObject.updateObjects = function(g,frameskip,scrx,scry,scrwidth,scrheight) {
	var paintObjects = [];
	for (var key in JGObject._objects) {
		var obj = JGObject._objects[key];
		if (!obj.alive) continue;
		if (scrwidth && (obj.suspendxmargin || obj.suspendymargin)) {
			obj.suspended =
			(  obj.x < scrx - obj.suspendxmargin
			|| obj.x > scrx+scrwidth + obj.suspendxmargin
			|| obj.y < scry - obj.suspendymargin
			|| obj.y > scry+scrheight + obj.suspendymargin);
			if (obj.suspended) continue;
		}
		if (scrwidth && (obj.expirexmargin || obj.expireymargin)) {
			if (  obj.x < scrx - obj.expirexmargin
			|| obj.x > scrx+scrwidth + obj.expirexmargin
			|| obj.y < scry - obj.expireymargin
			|| obj.y > scry+scrheight + obj.expireymargin) {
				obj.remove();
			}
		}
		var lastx = obj.x;
		var lasty = obj.y;
		obj.move();
		obj.x += obj.xspeed;
		obj.y += obj.yspeed;
		obj.lastx = lastx;
		obj.lasty = lasty;
		if (!frameskip) {
			paintObjects.push(obj);
		}
	}
	paintObjects.sort(function(a,b) {
		return a.z - b.z;
	});
	for (var i=0; i<paintObjects.length; i++) {
		paintObjects[i].paint(g);
	}
};


// will also remove suspended
JGObject.removeObjects = function(nameprefix,colid) {
	for (var name in JGObject._objects) {
		var obj = JGObject._objects[name];
		if (colid!=0 && (obj.colid & colid) == 0) continue;
		if (nameprefix!=null && obj.name.indexOf(nameprefix)!=0) continue;
		JGObject._objects[name].dispose();
		delete JGObject._objects[name];
	}
};

JGObject.removeObject = function(name) {
	// implement remove queue?
	if (!JGObject._objects[name]) return;
	JGObject._objects[name].dispose();
	delete JGObject._objects[name];
};

// returns null if not found
JGObject.getObject = function(name) {
	var ret = JGObject._objects[name];
	if (!ret) return null;
	return ret;
};

JGObject._colsrcset = [];
JGObject._coldstset = [];

// call hit in dstcid when hit by srccid
JGObject.checkCollision = function(srccid,dstcid) {
	// precalculate src and dst set
	var srcidx = 0;
	var dstidx = 0;
	for (var name in JGObject._objects) {
		var obj = JGObject._objects[name];
		if (obj.suspended) continue;
		if (!obj.alive) continue;
		if (obj.colid&srccid) JGObject._colsrcset[srcidx++] = obj;
		if (obj.colid&dstcid) JGObject._coldstset[dstidx++] = obj;
	}
	// slow, O(n*n)
	for (var i=0; i<srcidx; i++) {
		var srco = JGObject._colsrcset[i];
		if (!srco.alive) continue;
		var srcx1 = srco.x + srco.bbox.x;
		var srcy1 = srco.y + srco.bbox.y;
		var srcx2 = srcx1 + srco.bbox.width;
		var srcy2 = srcy1 + srco.bbox.height;
		for (var j=0; j<dstidx; j++) {
			var dsto = JGObject._coldstset[j];
			if (dsto.name==srco.name) continue;
			if (!dsto.alive) continue;
			var dstx1 = dsto.x + dsto.bbox.x;
			if (srcx1 > dstx1+dsto.bbox.width
			||  dstx1 > srcx2) continue;
			var dsty1 = dsto.y + dsto.bbox.y;
			if (srcy1 > dsty1+dsto.bbox.height
			||  dsty1 > srcy2) continue;
			dsto.hit(srco);
		}
	}
}

// Return first object that collides with rect, null if none
JGObject.checkCollisionRect = function(rect,dstcid) {
	var srcx1 = rect.x;
	var srcy1 = rect.y;
	var srcx2 = srcx1 + rect.width;
	var srcy2 = srcy1 + rect.height;
	for (var name in JGObject._objects) {
		var dsto = JGObject._objects[name];
		if (dsto.suspended) continue;
		if (!dsto.alive) continue;
		if (!(dsto.colid&dstcid)) continue;
		var dstx1 = dsto.x + dsto.bbox.x;
		if (srcx1 > dstx1+dsto.bbox.width
		||  dstx1 > srcx2) continue;
		var dsty1 = dsto.y + dsto.bbox.y;
		if (srcy1 > dsty1+dsto.bbox.height
		||  dsty1 > srcy2) continue;
		return dsto;
	}
	return null;
}

// call hit in dstcid when hit by tilecid
JGObject.checkBGCollision = function(tilemap,tilecid,objcid) {
	for (var objname in JGObject._objects) {
		var obj = JGObject._objects[objname];
		if (obj.suspended) continue;
		if ((obj.colid&objcid) == 0) continue;
		var rect = obj.getTiles(tilemap);
		var tcid = tilemap.getTileCidRect(rect);
		if (!(tcid&tilecid)) continue;
		obj.hit_bg(tcid,rect);
	}
}

// will also count suspended
JGObject.countObjects = function(nameprefix,colid) {
	var nr_objects=0;
	for (var name in JGObject._objects) {
		var obj = JGObject._objects[name];
		if (colid!=0 && (obj.colid & colid) == 0) continue;
		if (nameprefix!=null && obj.name.indexOf(nameprefix)!=0) continue;
		nr_objects++;
	}
	return nr_objects;
}

// INSTANCE

JGObject.prototype.snapToGrid = function(gridx,gridy,threshx,threshy) {
	// round center point down
	if (gridx) {
		if (!threshx) threshx = gridx;
		var newx = Math.floor((this.x+gridx/2)/gridx) * gridx;
		if (Math.abs(this.x - newx) < threshx) this.x = newx;
	}
	if (gridy) {
		if (!threshy) threshy = gridy;
		var newy = Math.floor((this.y+gridy/2)/gridy) * gridy;
		if (Math.abs(this.y - newy) < threshy) this.y = newy;
	}
}


JGObject.prototype.setBBox = function(x,y,width,height) {
	this.bbox.x = x;
	this.bbox.y = y;
	this.bbox.width = width;
	this.bbox.height = height;
}

JGObject.prototype.setDefaultTileBBox = function() {
	this.tilebbox = null;
}

JGObject.prototype.setTileBBox = function(x,y,width,height) {
	this.tilebbox = {
		x: x,
		y: y,
		width: width,
		height: height,
	};
}


JGObject.prototype.setSuspendOffscreen = function(xmargin,ymargin) {
	if (xmargin||ymargin) {
		this.suspendxmargin = xmargin;
		this.suspendymargin = ymargin;
	} else {
		this.suspendxmargin = 0;
		this.suspendymargin = 0;
	}
}

JGObject.prototype.setExpireOffscreen = function(xmargin,ymargin) {
	if (xmargin||ymargin) {
		this.expirexmargin = xmargin;
		this.expireymargin = ymargin;
	} else {
		this.expirexmargin = 0;
		this.expireymargin = 0;
	}
}


JGObject.prototype.remove = function() {
	// should not be removed immediately
	if (JGObject._objects[this.name]) {
		JGObject._objects[this.name].alive = false;
		JGObject._objects[this.name].dispose();
		delete JGObject._objects[this.name];
	}
};


JGObject.prototype.getTiles = function(tilemap) {
	var bbox = this.tilebbox;
	if (!bbox) bbox = this.bbox;
	var x1 = this.x + bbox.x;
	var y1 = this.y + bbox.y;
	var x2 = x1 + bbox.width - 1;
	var y2 = y1 + bbox.height - 1;
	x1 = Math.floor(x1/tilemap.tilex);
	y1 = Math.floor(y1/tilemap.tiley);
	x2 = Math.floor(x2/tilemap.tilex);
	y2 = Math.floor(y2/tilemap.tiley);
	return {x: x1, y: y1, width: x2-x1+1, height: y2-y1+1};
}

JGObject.prototype.getCenterTile = function(tilemap) {
	return {
		x: Math.floor((this.x + this.bbox.x + this.bbox.width/2)/tilemap.tilex),
		y: Math.floor((this.y + this.bbox.y + this.bbox.height/2)/tilemap.tiley)
	};
}

JGObject.prototype.move = function() {
};

JGObject.prototype.paint = function(g) {
};

JGObject.prototype.hit = function(obj) {
};

JGObject.prototype.hit_bg = function(tilecid, tilerect) {
};

JGObject.prototype.dispose = function() {
};


