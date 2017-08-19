// Copyright (c) 2014 by Boris van Schooten tmtg.net boris@13thmonkey.org
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine

/** 
* @fileOverview
* Class JGTileMap - tile handling.
*/

// highp is needed for sufficient offset precision
var jgtilevsh=(function () { /*

precision highp float;
uniform vec2 uScale;
uniform vec2 uObjScale;
uniform vec2 uOfs;
uniform vec2 uImgSize;

// point indexes, always 0..3
// 0 = topleft
// 1 = topright
// 2 = bottomleft
// 3 = bottomright
attribute float aIdx;
attribute vec2 aUV;
attribute vec2 aObjCen;

varying vec2 uv;

void main(void) {
	vec2 xy;
	// use epsilon = 0.001 to remove seams
	if (aIdx==0.0) {
		xy = vec2(-0.001,-0.001);
	} else if (aIdx==1.0) {
		xy = vec2(1.001,-0.001);
	} else if (aIdx==2.0) {
		xy = vec2(-0.001,1.001);
	} else { // 3.0
		xy = vec2(1.001,1.001);
	}
	uv = aUV / uImgSize;
	vec2 pos = vec2(
		uOfs.x + aObjCen.x + uObjScale.x*(xy.x),
		uOfs.y + aObjCen.y + uObjScale.y*(xy.y)
	);

	gl_Position = vec4(
		-1.0 + 2.0*pos.x/uScale.x,
		 1.0 - 2.0*pos.y/uScale.y,
		0.0, 1.0);
}
 
*/ }).toString().split('\n').slice(2,-2).join('\n').trim();

var jgtilefsh=(function () { /*
 
precision mediump float;
uniform sampler2D uTex1;

varying vec2 uv;

void main(void) {
	gl_FragColor = texture2D(uTex1, uv);
	if (gl_FragColor.a < 0.75) discard;
	gl_FragColor.a = 1.0;
}
 
*/ }).toString().split('\n').slice(2,-2).join('\n').trim();



/** Create tile map.
*
* @constructor
* @param {WebGLContext} gl
* @param {int} tilex - width of tile in logical pixels
* @param {int} tiley - height of tile in logical pixels
* @param {int} nrtilesx - total number of tiles in x direction
* @param {int} nrtilesy - total number of tiles in y direction
* @param {int} filltile - tile index to fill map with
* @param {int} fillcid - tile collision ID to fill map with
* @param {Texture} texatlas - WebGL texture object containing tex atlas
* @param {int} texwidth - width in pixels of single texture in atlas
* @param {int} texheight - height in pixels of single texture in atlas
* @param {int} nr_tex_x - number of textures in atlas in x direction
* @param {int} nr_tex_y - number of textures in atlas in y direction
* @param {int} smooth_textures - tile texture is smooth
*/
function JGTileMap(gl,tilex,tiley,nrtilesx,nrtilesy,filltile,fillcid,
texatlas, texwidth,texheight, nr_tex_x,nr_tex_y,smooth_textures) {
	this.map = [];
	this.cidmap = [];
	this.mapidx = [];
	for (var y=0; y<nrtilesy; y++) {
		this.map.push([]);
		this.cidmap.push([]);
		this.mapidx.push([]);
		for (var x=0; x<nrtilesx; x++) {
			this.map[y][x] = filltile;
			this.cidmap[y][x] = fillcid;
			this.mapidx[y][x] = -1;
		}
	}
	this.tilex = tilex;
	this.tiley = tiley;
	this.nrtilesx = nrtilesx;
	this.nrtilesy = nrtilesy;
	// gl
	this.indexBuffer = gl.createBuffer();
	this.uvIdxBuffer = gl.createBuffer();
	this.uvBuffer = gl.createBuffer();
	this.cenBuffer = gl.createBuffer();
	this.program = new ShaderProgram(gl,jgtilevsh,jgtilefsh,true)
	this.uScale = gl.getUniformLocation(this.program.program, "uScale");
	this.uObjScale = gl.getUniformLocation(this.program.program, "uObjScale");
	this.uOfs = gl.getUniformLocation(this.program.program, "uOfs");
	this.uImgSize = gl.getUniformLocation(this.program.program, "uImgSize");
	this.uTex1 = gl.getUniformLocation(this.program.program, "uTex1");
	this.aObjCen = gl.getAttribLocation(this.program.program, "aObjCen");
	this.aIdx = gl.getAttribLocation(this.program.program, "aIdx");
	this.aUV = gl.getAttribLocation(this.program.program, "aUV");
	this.tex = texatlas;
	// or derive these from image dimensions directly
	this.texwidth = texwidth;
	this.texheight = texheight;
	if (!nr_tex_x) nr_tex_x = 1;
	if (!nr_tex_y) nr_tex_y = 1;
	this.nr_tex_x = nr_tex_x;
	this.nr_tex_y = nr_tex_y;
	this.offscreentile = 0;
	this.offscreencid = 0;
	// derived
	this.pfwidth = this.tilex*this.nrtilesx;
	this.pfheight = this.tiley*this.nrtilesy;
	this._drawidxes=new Uint16Array(25 + 6*nrtilesx*nrtilesy);
	// index preload buffer, because it remains the same
	this.uvidxes_loaded = false;
	//this.epsilonx = 0.5 / (this.texwidth * this.nr_tex_x);
	//this.epsilony = 0.5 / (this.texheight * this.nr_tex_y);
	// takes care of seams
	if (smooth_textures) {
		this.epsilonx = 0.55;
		this.epsilony = 0.55;
	} else {
		this.epsilonx = 0.08;
		this.epsilony = 0.08;
	}
}



JGTileMap.prototype.setOffscreenTile = function(tileidx,tilecid) {
	this.offscreentile = tileidx;
	this.offscreencid = tilecid;

}



JGTileMap.prototype.setTile = function(tileidx,tilecid,x,y) {
	if (!typecheckInt(tileidx,"tileidx")) return;
	if (!typecheckInt(tilecid,"tilecid")) return;
	if (!typecheckNumber(x,"x")) return;
	if (!typecheckNumber(y,"y")) return;
	if (x < 0 || x >= this.nrtilesx
	||  y < 0 || y >= this.nrtilesy) return;
	this.map[y][x] = tileidx;
	this.cidmap[y][x] = tilecid;
	this.mapidx[y][x] = -1;
}

JGTileMap.prototype.setTileCid = function(tilecid,tilecidand,x,y) {
	if (!typecheckInt(tilecid,"tilecid")) return;
	if (!typecheckInt(tilecidand,"tilecidand")) return;
	if (!typecheckNumber(x,"x")) return;
	if (!typecheckNumber(y,"y")) return;
	if (x < 0 || x >= this.nrtilesx
	||  y < 0 || y >= this.nrtilesy) return;
	this.cidmap[y][x] = (this.cidmap[y][x] & tilecidand) | tilecid;
}

/** Note, x2,y2 exclusive */
JGTileMap.prototype.fill = function(tileidx,tilecid,x1,y1,x2,y2) {
	if (!x1 || x1<0) x1=0;
	if (!y1 || y1<0) y1=0;
	if (!x2 || x2>this.nrtilesx) x2 = this.nrtilesx;
	if (!y2 || y2>this.nrtilesy) y2 = this.nrtilesy;
	for (var y=y1; y<y2; y++) {
		for (var x=x1; x<x2; x++) {
			this.map[y][x] = tileidx;
			this.cidmap[y][x] = tilecid;
			this.mapidx[y][x] = -1;
		}
	}
}


JGTileMap.prototype.update = function(gl) {
	gl.useProgram(this.program.program);
	// uvidxes are always the same, so load them once
	if (!this.uvidxes_loaded) {
		this.uvidxes_loaded=true;
		var uvidxes = [];
		for (var i=0; i<this.nrtilesx*this.nrtilesy; i++) {
			uvidxes.push(0);
			uvidxes.push(1);
			uvidxes.push(2);
			uvidxes.push(3);
		}
		this.program.setAttribute(this.uvIdxBuffer,this.aIdx,
			4*this.nrtilesx*this.nrtilesy, 1, uvidxes);
	}
	var uvs = [];
	var cens = [];
	var idx=0;
	for (var y=0; y<this.nrtilesy; y++) {
		for (var x=0; x<this.nrtilesx; x++) {
			if (this.map[y][x] >= 0) {
				// pixel position of texture in atlas
				var m = this.map[y][x];
				var mx = this.epsilonx+this.texwidth * (m % this.nr_tex_x);
				var my = this.epsilony+this.texheight * Math.floor(m / this.nr_tex_x);
				uvs.push(mx);
				uvs.push(my);
				uvs.push(mx + this.texwidth-2*this.epsilonx);
				uvs.push(my);
				uvs.push(mx);
				uvs.push(my + this.texheight-2*this.epsilony);
				uvs.push(mx + this.texwidth-2*this.epsilonx);
				uvs.push(my + this.texheight-2*this.epsilony);
				// define the four points of two triangles
				cens.push(x*this.tilex);
				cens.push(y*this.tiley);
				cens.push(x*this.tilex);
				cens.push(y*this.tiley);
				cens.push(x*this.tilex);
				cens.push(y*this.tiley);
				cens.push(x*this.tilex);
				cens.push(y*this.tiley);
				this.mapidx[y][x] = idx;
				idx += 4;
			} else {
				this.mapidx[y][x] = -1;
			}
		}
	}

	this.program.setAttribute(this.uvBuffer,this.aUV, idx, 2, uvs);
	this.program.setAttribute(this.cenBuffer,this.aObjCen, idx, 2, cens);
}


JGTileMap.prototype.getTileCidRect = function(rect) {
	var ret = 0;
	for (var y=rect.y; y<rect.y+rect.height; y++) {
		if (y<0 || y>=this.nrtilesy) {
			ret |= this.offscreencid;
			continue;
		}
		var cidsubmap = this.cidmap[y];
		for (var x=rect.x; x<rect.x+rect.width; x++) {
			if (x<0 || x>=this.nrtilesx) {
				ret |= this.offscreencid;
				continue;
			}
			ret |= cidsubmap[x];
		}
	}
	return ret;
}


JGTileMap.prototype.getTileCidPos = function(tx,ty) {
	if (ty<0 || ty>=this.nrtilesy
	||  tx<0 || tx>=this.nrtilesx)
		return this.offscreencid;
	if (tx==null || ty==null) {
		console.log("setTileCidPos: X or Y undefined!");
		return;
	}
	return this.cidmap[ty][tx];
}


JGTileMap.prototype.getTilePos = function(tx,ty) {
	if (ty<0 || ty>=this.nrtilesy
	||  tx<0 || tx>=this.nrtilesx)
		return this.offscreentile;
	return this.map[ty][tx];
}

/** Note, x2,y2 exclusive */
JGTileMap.prototype.countTileCids = function(tilecidmask,x1,y1,x2,y2) {
	if (!x1 || x1<0) x1=0;
	if (!y1 || y1<0) y1=0;
	if (!x2 || x2>this.nrtilesx) x2 = this.nrtilesx;
	if (!y2 || y2>this.nrtilesy) y2 = this.nrtilesy;
	var count = 0;
	for (var y=y1; y<y2; y++) {
		for (var x=x1; x<x2; x++) {
			if (this.cidmap[y][x] & tilecidmask) count++;
		}
	}
	return count;
}



JGTileMap.prototype.draw = function(gl,xofs,yofs) {
	gl.useProgram(this.program.program);

	// we reuse the _drawidxes array. Saves a lot of gc hiccups
	var length = 0;
	for (var y=0; y<this.nrtilesy; y++) {
		var ypos = this.tiley*y - yofs;
		if (ypos < -this.tiley || ypos >= height) continue;
		for (var x=0; x<this.nrtilesx; x++) {
			var xpos = this.tilex*x - xofs;
			if (xpos < -this.tilex || xpos >= width) continue;
			if (this.mapidx[y][x] != -1) {
				var idx = this.mapidx[y][x];
				this._drawidxes[length] = idx;
				this._drawidxes[length+1] = idx+1;
				this._drawidxes[length+2] = idx+2;
				this._drawidxes[length+3] = idx+1;
				this._drawidxes[length+4] = idx+2;
				this._drawidxes[length+5] = idx+3;
				length += 6;
			}
		}
	}

	this.program.setIndexBuffer(this.indexBuffer,length,this._drawidxes);
	// Bind attribs to buffers. Buffers already filled.
	this.program.setAttribute(this.uvIdxBuffer,this.aIdx, 0, 1, null);
	this.program.setAttribute(this.uvBuffer,this.aUV, 0, 2, null);
	this.program.setAttribute(this.cenBuffer,this.aObjCen, 0, 2, null);

	gl.uniform1i(this.uTex1, 0);
	gl.uniform2f(this.uOfs, -xofs,-yofs);
	gl.uniform2f(this.uScale, width,height);
	gl.uniform2f(this.uObjScale, this.tilex,this.tiley);

	gl.uniform2f(this.uImgSize,
		this.texwidth*this.nr_tex_x,
		this.texheight*this.nr_tex_y);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.tex);

	gl.drawElements(gl.TRIANGLES, length, gl.UNSIGNED_SHORT, 0);

}

