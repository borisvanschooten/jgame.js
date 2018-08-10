// Copyright (c) 2014 by Boris van Schooten tmtg.net boris@13thmonkey.org
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine

var simpleuv_vsh=(function () { /*

precision mediump float;

attribute vec2 aCoord;
attribute vec2 aUV;

varying vec2 uv;

void main(void) {
	vec2 xy;
	uv = aUV;

	gl_Position = vec4(aCoord.x,aCoord.y, 0.0, 1.0);

}
 
*/ }).toString().split('\n').slice(2,-2).join('\n').trim();

function SimpleBGShader(fshader,shrinkfactor) {
	this.program = new ShaderProgram(gl,simpleuv_vsh,fshader,true);
	this.uTex1 = gl.getUniformLocation(this.program.program, "uTex1");
	this.uTex2 = gl.getUniformLocation(this.program.program, "uTex2");
	this.uTimer = gl.getUniformLocation(this.program.program, "uTimer");
	this.aCoord = gl.getAttribLocation(this.program.program, "aCoord");
	this.aUV = gl.getAttribLocation(this.program.program, "aUV");

	this.coordBuffer = gl.createBuffer();
	this.uvBuffer = gl.createBuffer();

	this.timer = 0;

	if (!shrinkfactor) shrinkfactor = 2;
	this.renderbuffer=new RenderBuffer(gl,width/shrinkfactor,height/shrinkfactor);
}

// tex2 & col are defined -> cross-fade shader, col is scalar alpha
// col is defined -> color shader
// otherwise -> simple shader
SimpleBGShader.prototype.draw = function (texture1,texture2,timer) {
	this.timer = timer;
	this.renderbuffer.startRender(gl);
	gl.useProgram(this.program.program);
	gl.uniform1f(this.uTimer, 0.02*timer);
	// MUST be set again for every draw on some devices
	// such as Samsung Galaxy Tab Pro
	gl.uniform1i(this.uTex1, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture1);
	gl.uniform1i(this.uTex2, 1);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture2);

	if (!this.coordBufferDefined) {
		var coords = [-1,-1, 1,-1, -1,1, 1,1];
		var uvs =    [0,0,   1,0,   0,1, 1,1];
		this.program.setAttribute(this.coordBuffer,this.aCoord, 4,2,coords);
		this.program.setAttribute(this.uvBuffer,this.aUV, 4, 2, uvs);
		this.coordBufferDefined = true;
	} else {
		this.program.setAttribute(this.coordBuffer,this.aCoord, 4, 2, null);
		this.program.setAttribute(this.uvBuffer,this.aUV, 4, 2, null);
	}

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	this.renderbuffer.endRender(gl);
	//drawSpriteInitFrame(width,height);
	drawSprite(0,0,width,height,0.0,this.renderbuffer.getTexture(),
		null,null,true);
}




