// Copyright (c) 2014 by Boris van Schooten tmtg.net boris@13thmonkey.org
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine

/** 
* @fileOverview
* Class JGSpriteBatch - drawing sprite batches from sprite sheets
*/


var jgspritebatchvsh=(function () { /*

precision mediump float;
uniform vec2 uScale;
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
attribute vec2 aObjScale;
attribute float aObjRot;
attribute vec4 aColor;

varying vec2 uv;
varying vec4 vColor;

void main(void) {
	vec2 xy;
	if (aIdx==0.0) {
		xy = vec2(0.0,0.0);
	} else if (aIdx==1.0) {
		xy = vec2(1.0,0.0);
	} else if (aIdx==2.0) {
		xy = vec2(0.0,1.0);
	} else { // 3.0
		xy = vec2(1.0,1.0);
	}
	uv = aUV / uImgSize;
	vColor = aColor;

	vec2 pos = vec2(
		aObjCen.x + sin(aObjRot)*aObjScale.y*(-0.5+xy.y)
				  + cos(aObjRot)*aObjScale.x*(-0.5+xy.x),
		aObjCen.y + cos(aObjRot)*aObjScale.y*(-0.5+xy.y)
			      - sin(aObjRot)*aObjScale.x*(-0.5+xy.x)
	);

	//vec2 pos = vec2(
	//	uOfs.x + aObjCen.x + aObjScale.x*(xy.x),
	//	uOfs.y + aObjCen.y + aObjScale.y*(xy.y)
	//);

	gl_Position = vec4(
		-1.0 + 2.0*pos.x/uScale.x,
		 1.0 - 2.0*pos.y/uScale.y,
		0.0, 1.0);
}
 
*/ }).toString().split('\n').slice(2,-2).join('\n').trim();

var jgspritebatchfsh=(function () { /*
 
precision mediump float;
uniform sampler2D uTex1;

varying vec2 uv;
varying vec4 vColor;

void main(void) {
	gl_FragColor = vColor*texture2D(uTex1, uv);
	if (gl_FragColor.a < 0.05) discard;
}
 
*/ }).toString().split('\n').slice(2,-2).join('\n').trim();



/** Create sprite batch handler.
*
* @constructor
* @param {WebGLContext} gl
* @param {Texture} texatlas - WebGL texture object containing tex atlas
* @param {int} width - width of atlas in pixels
* @param {int} height - height of atlas in pixels
* @param {int} spritescoords - array of {x,y,width,height} rectangles
*/
function JGSpriteBatch(gl,texatlas,width,height,spritecoords,smooth_textures) {
	this.tex = texatlas;
	this.coords = spritecoords;
	this.width = width;
	this.height = height;
	if (spritecoords.length==1) {
		// replicate coords
		this.coords = [];
		var coord = spritecoords[0];
		var dx = coord.x+coord.width;
		var dy = coord.y+coord.height;
		for (var y=0; y<=height-dy; y+=dy) {
			for (var x=0; x<=width-dx; x+=dx) {
				this.coords.push({
					x: x+coord.x,
					y: y+coord.y,
					width: coord.width,
					height: coord.height
				});
			}
		}
	} else {
		this.coords = spritecoords;
	}
	// takes care of seams
	if (smooth_textures) {
		this.epsilonx = 0.55;
		this.epsilony = 0.55;
	} else {
		this.epsilonx = 0.08;
		this.epsilony = 0.08;
	}
	for (var i=0; i<this.coords.length; i++) {
		this.coords[i].x += this.epsilonx;
		this.coords[i].y += this.epsilony;
		this.coords[i].width -= 2*this.epsilonx;
		this.coords[i].height -= 2*this.epsilony;
	}
	// gl
	this.indexBuffer = gl.createBuffer();
	this.uvIdxBuffer = gl.createBuffer();
	this.uvBuffer = gl.createBuffer();
	this.cenBuffer = gl.createBuffer();
	this.scaleBuffer = gl.createBuffer();
	this.rotBuffer = gl.createBuffer();
	this.colorBuffer = gl.createBuffer();
	this.program = new ShaderProgram(gl,jgspritebatchvsh,jgspritebatchfsh,true);
	this.uScale = gl.getUniformLocation(this.program.program, "uScale");
	this.uOfs = gl.getUniformLocation(this.program.program, "uOfs");
	this.uImgSize = gl.getUniformLocation(this.program.program, "uImgSize");
	this.uTex1 = gl.getUniformLocation(this.program.program, "uTex1");
	this.aObjCen = gl.getAttribLocation(this.program.program, "aObjCen");
	this.aObjScale = gl.getAttribLocation(this.program.program, "aObjScale");
	this.aObjRot = gl.getAttribLocation(this.program.program, "aObjRot");
	this.aColor = gl.getAttribLocation(this.program.program, "aColor");
	this.aIdx = gl.getAttribLocation(this.program.program, "aIdx");
	this.aUV = gl.getAttribLocation(this.program.program, "aUV");
	// vars
	this._nrsprites = 0;
	var MAXSPRITES=2048;
	this._vertidxes = new Uint16Array(6*MAXSPRITES);
	this._uvidxes = new Float32Array(4*MAXSPRITES);
	this._uvs = new Float32Array(8*MAXSPRITES);
	this._cens = new Float32Array(8*MAXSPRITES);
	this._scales = new Float32Array(8*MAXSPRITES);
	this._rots = new Float32Array(4*MAXSPRITES);
	this._colors = new Float32Array(16*MAXSPRITES);
	// set program constants
	var idx=0;
	for (var i=0; i<4*MAXSPRITES; i+=4) {
		this._vertidxes[idx++] = i;
		this._vertidxes[idx++] = i+1;
		this._vertidxes[idx++] = i+2;
		this._vertidxes[idx++] = i+1;
		this._vertidxes[idx++] = i+2;
		this._vertidxes[idx++] = i+3;
		this._uvidxes[i  ] = 0;
		this._uvidxes[i+1] = 1;
		this._uvidxes[i+2] = 2;
		this._uvidxes[i+3] = 3;
	}
	gl.useProgram(this.program.program);
	gl.uniform1i(this.uTex1, 0);
	this.program.setIndexBuffer(this.indexBuffer,6*MAXSPRITES,this._vertidxes);
	this.program.setAttribute(this.uvIdxBuffer,this.aIdx, 4*MAXSPRITES, 1,this._uvidxes);
}


JGSpriteBatch.prototype.clear = function() {
	this._nrsprites = 0;
}


JGSpriteBatch.prototype.addSprite = function(idx,x,y,topleft,scalex,scaley,rot,
color) {
	if (!typecheckInt(idx,"idx")) return;
	if (!typecheckNumber(x,"x")) return;
	if (!typecheckNumber(y,"y")) return;
	if (!typecheckNumber(scalex,"scalex")) return;
	if (!typecheckNumber(scaley,"scaley")) return;
	if (!typecheckNumber(rot,"rot")) return;
	if (idx<0 || idx >= this.coords.length) {
		console.log("Illegal sprite index: "+idx);
		return;
	}
	if (topleft) {
		x += Math.abs(scalex)/2;
		y += Math.abs(scaley)/2;
	}
	var uvs = this.coords[idx];
	if (!uvs) {
		console.log("Illegal sprite index: "+idx);
		return;
	}
	var nrvert = this._nrsprites*4;
	//this._uvidxes[nrvert  ] = 0;
	//this._uvidxes[nrvert+1] = 1;
	//this._uvidxes[nrvert+2] = 2;
	//this._uvidxes[nrvert+3] = 3;
	this._uvs[2*nrvert  ] = uvs.x;
	this._uvs[2*nrvert+1] = uvs.y;
	this._uvs[2*nrvert+2] = uvs.x+uvs.width;
	this._uvs[2*nrvert+3] = uvs.y;
	this._uvs[2*nrvert+4] = uvs.x;
	this._uvs[2*nrvert+5] = uvs.y+uvs.height;
	this._uvs[2*nrvert+6] = uvs.x+uvs.width;
	this._uvs[2*nrvert+7] = uvs.y+uvs.height;
	this._cens[2*nrvert  ] = x;
	this._cens[2*nrvert+1] = y;
	this._cens[2*nrvert+2] = x;
	this._cens[2*nrvert+3] = y;
	this._cens[2*nrvert+4] = x;
	this._cens[2*nrvert+5] = y;
	this._cens[2*nrvert+6] = x;
	this._cens[2*nrvert+7] = y;
	this._scales[2*nrvert  ] = scalex;
	this._scales[2*nrvert+1] = scaley;
	this._scales[2*nrvert+2] = scalex;
	this._scales[2*nrvert+3] = scaley;
	this._scales[2*nrvert+4] = scalex;
	this._scales[2*nrvert+5] = scaley;
	this._scales[2*nrvert+6] = scalex;
	this._scales[2*nrvert+7] = scaley;
	if (!rot) rot=0;
	this._rots[nrvert  ] = rot;
	this._rots[nrvert+1] = rot;
	this._rots[nrvert+2] = rot;
	this._rots[nrvert+3] = rot;
	if (!color) color = [1,1,1,1];
	this._colors[4*nrvert  ] = color[0];
	this._colors[4*nrvert+1] = color[1];
	this._colors[4*nrvert+2] = color[2];
	this._colors[4*nrvert+3] = color[3];
	this._colors[4*nrvert+4] = color[0];
	this._colors[4*nrvert+5] = color[1];
	this._colors[4*nrvert+6] = color[2];
	this._colors[4*nrvert+7] = color[3];
	this._colors[4*nrvert+8] = color[0];
	this._colors[4*nrvert+9] = color[1];
	this._colors[4*nrvert+10] = color[2];
	this._colors[4*nrvert+11] = color[3];
	this._colors[4*nrvert+12] = color[0];
	this._colors[4*nrvert+13] = color[1];
	this._colors[4*nrvert+14] = color[2];
	this._colors[4*nrvert+15] = color[3];
	this._nrsprites++;
}




JGSpriteBatch.prototype.draw = function(gl) {
	gl.useProgram(this.program.program);
	var len = this._nrsprites;
	this.program.setIndexBuffer(this.indexBuffer,len*6,null);
	this.program.setAttribute(this.uvIdxBuffer,this.aIdx,len*4,1,null);
	this.program.setAttribute(this.uvBuffer,this.aUV, len*4, 2, this._uvs);
	this.program.setAttribute(this.cenBuffer,this.aObjCen, len*4, 2, this._cens);
	this.program.setAttribute(this.scaleBuffer,this.aObjScale,len*4,2,this._scales);
	this.program.setAttribute(this.rotBuffer,this.aObjRot,len*4,1,this._rots);
	this.program.setAttribute(this.colorBuffer,this.aColor,len*4,4,this._colors);

	// XXX hardcoded reference to width,height, put this initframe function
	gl.uniform2f(this.uScale, width,height);

	gl.uniform2f(this.uImgSize, this.width, this.height);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.tex);
	gl.uniform1i(this.uTex1, 0);

	gl.drawElements(gl.TRIANGLES, len*6, gl.UNSIGNED_SHORT, 0);

}



function drawSpriteText(spritebatch,text,x,y,xsize,ysize,align,shrink,color,rot)
{
	if (!rot) rot=0;
	var xpos = x;
	var ypos = y;
	var xadvance = xsize*(1 - shrink);
	var yadvance = -xadvance*Math.sin(rot);
	xadvance *= Math.cos(rot);
	if (align==1) xpos -= xadvance*text.length;
	if (align==0) xpos -= 0.5*xadvance*text.length - xadvance/2;
	for (var i=0; i<text.length; i++) {
		var ch = text.charCodeAt(i);
		if (ch<32 || ch>127) {
			// treat as space
			xpos += xadvance;
			ypos += yadvance;
			continue;
		}
		spritebatch.addSprite(ch-32,xpos,ypos,false,xsize,ysize,rot,color);
		xpos += xadvance;
		ypos += yadvance;
	}
}



