// Copyright (c) 2014 by Boris van Schooten tmtg.net boris@13thmonkey.org
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine

// shaders

var linestrip_fs=(function () { /*

precision mediump float;
uniform vec4 uColor;

varying float vThickOfs;

void main(void) {
	vec4 color = uColor;
	float thick2 = vThickOfs*vThickOfs;
	color.a *= 1.0 - thick2*thick2;
	//float thick2 = sqrt(sqrt(abs(vThickOfs)));
	//color.a = 1.5 - 1.5*thick2;
	//if (color.a > 0.5) color += 2.0*(color.a-0.5);// else discard;
	gl_FragColor = color;
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();


var linestrip_vs=(function () { /*

// NOTE: assuming butt caps and miter joins
precision mediump float;
#define M_PI 3.1415926535897932384626433832795
uniform vec2 uScale;// scale of object relative to aPos
uniform float uObjScale;
uniform float uThickness;
uniform vec2 uOffset;
uniform float uAngle;

attribute vec2 aPos;
attribute vec2 aNorm1; // normal vector of previous line segment
attribute vec2 aNorm2; // normal vector of next line segment
attribute float aDir; // -1 or 1

varying float vThickOfs; // offset along thickness (-1 ... 1)

void main(void) {
	// normalize here to save CPU
	vec2 norm1 = normalize(aNorm1);
	vec2 norm2 = normalize(aNorm2);
	// angle between the two norm vectors
	// http://www.euclideanspace.com/maths/algebra/vectors/angleBetween/
	// NOTE: due to rounding errors, may sometimes be slightly > 1,
	// therefore we must multiply with slightly < 1.
	float angle = acos(dot(norm1,norm2)*0.9999);
	//if (angle < 0.0) angle = 0.0;
	//float angle = atan(norm1.y,norm1.x) - atan(norm2.y,norm2.x);
	//if (angle1 > 0.0) angle = -angle;
	// avoid very long miter joins
	//if (angle > M_PI-0.8) angle = M_PI-0.8;
	//if (angle < -M_PI+0.8) angle = -M_PI+0.8;
	// The norms are used to determine point offset for given line thickness.
	// Direction of offset is the average of the norms.
	// Magnitude depends on angle between norms:
	// angle = 0 -> magnitude = thickness
	// angle = PI -> magnitude -> infinity
	vThickOfs = aDir;
	vec2 pos = uObjScale*aPos
	         + uThickness*( normalize(norm1+norm2) / cos(0.5*angle) );
	pos = vec2(
		pos.x*cos(uAngle) - pos.y*sin(uAngle),
		pos.x*sin(uAngle) + pos.y*cos(uAngle)
	);
	pos += uOffset;
	gl_Position = vec4(
		-1.0 + 2.0*pos.x/uScale.x,
		 1.0 - 2.0*pos.y/uScale.y,
		0.0, 1.0);
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();


var linesegmentstrip_vs=(function () { /*

// NOTE: assuming butt caps and miter joins
precision mediump float;
#define M_PI 3.1415926535897932384626433832795
uniform vec2 uScale;// scale of object relative to aPos
uniform float uObjScale;
uniform float uThickness;
uniform vec2 uOffset;
uniform float uAngle;

attribute vec2 aPos;
attribute vec2 aNorm1; // normal vector of line segment
attribute float aDir; // -1 or 1

varying float vThickOfs; // offset along thickness (-1 ... 1)

void main(void) {
	// normalize here to save CPU
	vec2 norm1 = normalize(aNorm1);
	vThickOfs = aDir;
	vec2 pos = uObjScale*aPos
	         + uThickness*norm1;
	pos = vec2(
		pos.x*cos(uAngle) - pos.y*sin(uAngle),
		pos.x*sin(uAngle) + pos.y*cos(uAngle)
	);
	pos += uOffset;
	gl_Position = vec4(
		-1.0 + 2.0*pos.x/uScale.x,
		 1.0 - 2.0*pos.y/uScale.y,
		0.0, 1.0);
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();


var simplelinestrip_fs=(function () { /*

precision mediump float;
uniform vec4 uColor;

//varying float vThickOfs;

void main(void) {
	//vec4 color = uColor;
	//float thick2 = vThickOfs*vThickOfs;
	//color.a = 1.0 - thick2*thick2;
	gl_FragColor = uColor;
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();


var simplelinestrip_vs=(function () { /*

// NOTE: assuming butt caps and miter joins
precision mediump float;
#define M_PI 3.1415926535897932384626433832795
uniform vec2 uScale;// scale of object relative to aPos
uniform float uObjScale;
uniform float uThickness;
uniform vec2 uOffset;
uniform float uAngle;

attribute vec2 aPos;
attribute vec4 aNorm1; // normal vector of previous line segment
//attribute vec2 aNorm2; // normal vector of next line segment
//attribute float aDir; // -1 or 1

//varying float vThickOfs; // offset along thickness (-1 ... 1)

void main(void) {
	// normalize here to save CPU
	vec2 norm1 = normalize(vec2(aNorm1.x,aNorm1.y));
	vec2 norm2 = normalize(vec2(aNorm1.z,aNorm1.w));
	// angle between the two norm vectors
	// http://www.euclideanspace.com/maths/algebra/vectors/angleBetween/
	float angle = acos(dot(norm1,norm2));
	// avoid very long miter joins
	if (angle > M_PI-0.8) angle = M_PI-0.8;
	if (angle < -M_PI-0.8) angle = -M_PI-0.8;
	// The norms are used to determine point offset for given line thickness.
	// Direction of offset is the average of the norms.
	// Magnitude depends on angle between norms:
	// angle = 0 -> magnitude = thickness
	// angle = PI -> magnitude -> infinity
	//vThickOfs = aDir;
	vec2 pos = uObjScale*aPos
	         + uThickness*( normalize(norm1+norm2) / cos(0.5*angle) );
	pos = vec2(
		pos.x*cos(uAngle) - pos.y*sin(uAngle),
		pos.x*sin(uAngle) + pos.y*cos(uAngle)
	);
	pos += uOffset;
	gl_Position = vec4(
		-1.0 + 2.0*pos.x/uScale.x,
		 1.0 - 2.0*pos.y/uScale.y,
		0.0, 1.0);
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();


var sprite_col_fs=(function () { /*

precision mediump float;
uniform vec4 uColor;
uniform sampler2D uTex1;

varying vec2 uv;

void main(void) {
	gl_FragColor = uColor*texture2D(uTex1, uv);
	if (gl_FragColor.a < 0.01) discard;
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();


var sprite_simple_fs=(function () { /*

precision mediump float;
uniform sampler2D uTex1;

varying vec2 uv;

void main(void) {
	gl_FragColor = texture2D(uTex1, uv);
	if (gl_FragColor.a < 0.01) discard;
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();


var sprite_fade_fs=(function () { /*

precision mediump float;
uniform float uAlpha;
uniform sampler2D uTex1,uTex2;

varying vec2 uv;

void main(void) {
	gl_FragColor = uAlpha*texture2D(uTex1, uv)
				 + (1.0-uAlpha)*texture2D(uTex2, uv);
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();


var sprite_vs=(function () { /*

// draw single sprite using triangle strip
precision mediump float;
uniform vec2 uScale;
uniform vec2 uObjScale;
uniform vec2 uObjCen;
uniform float uObjRot;

// point indexes, always 0..3
// 0 = topleft
// 1 = bottomleft
// 2 = topright
// 3 = bottomright
attribute float aIdx;

varying vec2 uv;

void main(void) {
	// find uvs corresponding to index
	if (aIdx==0.0) {
		uv = vec2(0.0,0.0);
	} else if (aIdx==1.0) {
		uv = vec2(1.0,0.0);
	} else if (aIdx==2.0) {
		uv = vec2(0.0,1.0);
	} else { // 3.0
		uv = vec2(1.0,1.0);
	}
	vec2 pos = vec2(
		uObjCen.x + sin(uObjRot)*uObjScale.y*(-0.5 + uv.y)
				  + cos(uObjRot)*uObjScale.x*(-0.5 + uv.x),
		uObjCen.y + cos(uObjRot)*uObjScale.y*(-0.5 + uv.y)
			      - sin(uObjRot)*uObjScale.x*(-0.5 + uv.x)
	);

	gl_Position = vec4(
		-1.0 + 2.0*pos.x/uScale.x,
		 1.0 - 2.0*pos.y/uScale.y,
		0.0, 1.0);
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();





// variables

glBuffers = [];

// attribute arrays for drawLine, other line functions

var MAXBUFLEN = 4096; // probably more than enough

// x,y coordinate float per point on the triangle strip
var linepos = new Float32Array(MAXBUFLEN);
// x,y norm vector per point on the triangle strip
var linenorm1 = new Float32Array(MAXBUFLEN);
var linenorm2 = new Float32Array(MAXBUFLEN);
var linedir = new Float32Array(MAXBUFLEN);
var triangleuv = new Float32Array(MAXBUFLEN);
var trianglepos = new Float32Array(MAXBUFLEN);


var _gldraw_inited=false;

function gldrawInit() {
	if (_gldraw_inited) return;
	// create programs
	drawLine.program = new ShaderProgram(gl, linestrip_vs, linestrip_fs, true);
	drawLineSegments.program = new ShaderProgram(gl, linesegmentstrip_vs, linestrip_fs, true);
	drawSimpleLine.program = new ShaderProgram(gl, simplelinestrip_vs, simplelinestrip_fs, true);
	drawSprite.colProgram = new ShaderProgram(gl, sprite_vs, sprite_col_fs, true);
	drawSprite.simpleProgram = new ShaderProgram(gl, sprite_vs, sprite_simple_fs, true);
	drawSprite.fadeProgram = new ShaderProgram(gl, sprite_vs, sprite_fade_fs, true);
	drawTriangleStrip.program = new ShaderProgram(gl, trianglestrip_vs, trianglestrip_fs, true);
	// get uniforms for drawSprite variants
	drawSprite.fade = new drawSpriteInit(drawSprite.fadeProgram,true,true);
	drawSprite.col = new drawSpriteInit(drawSprite.colProgram,false,true);
	drawSprite.simple = new drawSpriteInit(drawSprite.simpleProgram,false,false);

	drawLineInit();
	drawLineSegmentsInit();
	drawSimpleLineInit();
	drawTriangleStripInit();

	// create buffers at init
	//http://stackoverflow.com/questions/23120851/webgl-deletebuffer-leaking-memory
	// line programs
	glBuffers.posBuffer = gl.createBuffer();
	glBuffers.norm1Buffer = gl.createBuffer();
	glBuffers.norm2Buffer = gl.createBuffer();
	glBuffers.colorBuffer = gl.createBuffer();
	glBuffers.dirBuffer = gl.createBuffer();
	// bubble + sprite program
	glBuffers.nrBuffer = gl.createBuffer();
	glBuffers.sizeBuffer = gl.createBuffer(); // unused?
	glBuffers.spriteidxBuffer = gl.createBuffer();
	// triangle strip program
	glBuffers.uvVecBuffer = gl.createBuffer();
	glBuffers.posVecBuffer = gl.createBuffer();

	_gldraw_inited=true;
}




//----------------------------------------------------------------------
// DRAWLINESEGMENTS
//----------------------------------------------------------------------

function drawLineSegmentsInit() {
	drawLineSegments.uScale = gl.getUniformLocation(drawLineSegments.program.program, "uScale");
	drawLineSegments.uObjScale = gl.getUniformLocation(drawLineSegments.program.program, "uObjScale");
	drawLineSegments.uOffset = gl.getUniformLocation(drawLineSegments.program.program, "uOffset");
	drawLineSegments.uAngle = gl.getUniformLocation(drawLineSegments.program.program, "uAngle");
	drawLineSegments.uThickness = gl.getUniformLocation(drawLineSegments.program.program, "uThickness");
	drawLineSegments.uColor = gl.getUniformLocation(drawLineSegments.program.program, "uColor");

	drawLineSegments.aPos = gl.getAttribLocation(drawLineSegments.program.program, "aPos");
	drawLineSegments.aNorm1 = gl.getAttribLocation(drawLineSegments.program.program, "aNorm1");
	drawLineSegments.aDir = gl.getAttribLocation(drawLineSegments.program.program, "aDir");

}

function drawLineSegmentsInitFrame(width,height) {
	gl.useProgram(drawLineSegments.program.program);
	gl.uniform2f(drawLineSegments.uScale, width, height);
}



//draw disjointed line segments
// coords are groups of 4 representing (x1,y1, x2,y2)
function drawLineSegments(offset, angle, scale, thickness, color,
coords, nr_lines){
	gl.useProgram(drawLineSegments.program.program);

	//gl.uniform2f(drawLineSegments.uScale, width, height);

	gl.uniform1f(drawLineSegments.uObjScale, scale);

	gl.uniform2fv(drawLineSegments.uOffset, offset);

	gl.uniform1f(drawLineSegments.uAngle, angle);

	gl.uniform1f(drawLineSegments.uThickness, thickness);

	gl.uniform4fv(drawLineSegments.uColor, color);

	for (var i=0; i<nr_lines; i++) {
		// first triangle
		linepos[12*i]   = coords[4*i];
		linepos[12*i+1] = coords[4*i+1];
		linepos[12*i+2] = coords[4*i];
		linepos[12*i+3] = coords[4*i+1];
		linepos[12*i+4] = coords[4*i+2];
		linepos[12*i+5] = coords[4*i+3];
		var dx = coords[4*i+2] - coords[4*i];
		var dy = coords[4*i+3] - coords[4*i+1];
		//if (dx > -0.01 && dx < 0.01 && dy>-0.01 && dy<0.01) console.log("########DX "+dx+" DY "+dy);
		linenorm1[12*i]   = dy;
		linenorm1[12*i+1] = -dx;
		linenorm1[12*i+2] = -dy;
		linenorm1[12*i+3] = dx;
		linenorm1[12*i+4] = dy;
		linenorm1[12*i+5] = -dx;
		linedir[6*i]   = -1;
		linedir[6*i+1] =  1;
		linedir[6*i+2] = -1;
		// second triangle
		linepos[12*i+6]  = coords[4*i];
		linepos[12*i+7]  = coords[4*i+1];
		linepos[12*i+8]  = coords[4*i+2];
		linepos[12*i+9]  = coords[4*i+3];
		linepos[12*i+10] = coords[4*i+2];
		linepos[12*i+11] = coords[4*i+3];
		linenorm1[12*i+6]  = -dy;
		linenorm1[12*i+7]  = dx;
		linenorm1[12*i+8]  = dy;
		linenorm1[12*i+9]  = -dx;
		linenorm1[12*i+10] = -dy;
		linenorm1[12*i+11] = dx;
		linedir[6*i+3] =  1;
		linedir[6*i+4] = -1;
		linedir[6*i+5] =  1;
	}

	drawLineSegments.program.setAttribute(glBuffers.posBuffer,drawLineSegments.aPos, nr_lines*6, 2, linepos);
	drawLineSegments.program.setAttribute(glBuffers.norm1Buffer,drawLineSegments.aNorm1, nr_lines*6, 2, linenorm1);
	drawLineSegments.program.setAttribute(glBuffers.dirBuffer,drawLineSegments.aDir, nr_lines*6, 1, linedir);
	//drawLineSegments.program.setAttribute(glBuffers.colorBuffer,"aColor", l_size, 4, l_colors);

	//gl.lineWidth(4);
	gl.drawArrays(gl.TRIANGLES, 0, nr_lines*6);
}



//----------------------------------------------------------------------
// DRAWLINE / DRAWSIMPLELINE
//----------------------------------------------------------------------




function drawLineInit() {
	drawLine.polycache = {};
	drawLine.uScale = gl.getUniformLocation(drawLine.program.program, "uScale");
	drawLine.uObjScale = gl.getUniformLocation(drawLine.program.program, "uObjScale");
	drawLine.uOffset = gl.getUniformLocation(drawLine.program.program, "uOffset");
	drawLine.uAngle = gl.getUniformLocation(drawLine.program.program, "uAngle");
	drawLine.uThickness = gl.getUniformLocation(drawLine.program.program, "uThickness");
	drawLine.uColor = gl.getUniformLocation(drawLine.program.program, "uColor");

	drawLine.aPos = gl.getAttribLocation(drawLine.program.program, "aPos");
	drawLine.aNorm1 = gl.getAttribLocation(drawLine.program.program, "aNorm1");
	drawLine.aNorm2 = gl.getAttribLocation(drawLine.program.program, "aNorm2");
	drawLine.aDir = gl.getAttribLocation(drawLine.program.program, "aDir");

}

function drawLineInitFrame(width,height) {
	gl.useProgram(drawLine.program.program);
	gl.uniform2f(drawLine.uScale, width, height);
}


// if cache_id(string) is defined, cache this line's GL buffers under that
// name in polycache.  This assumes the coords, nr_points, and is_closed
// will stay the same in future calls.
function drawLine(offset, angle, scale, thickness, color,
coords, nr_points, is_closed, cache_id, rebuild_cache){
	gl.useProgram(drawLine.program.program);

	gl.uniform1f(drawLine.uObjScale, scale);

	gl.uniform2fv(drawLine.uOffset, offset);

	gl.uniform1f(drawLine.uAngle, angle);

	gl.uniform1f(drawLine.uThickness, thickness);

	gl.uniform4fv(drawLine.uColor, color);

	var buf_obj;
	var is_gl_buffered=false;
	if (cache_id && rebuild_cache) {
		delete drawLine.polycache[cache_id]
	}
	if (cache_id) {
		if (drawLine.polycache[cache_id]) {
			buf_obj = drawLine.polycache[cache_id];
			is_gl_buffered=true;
			// add "close" point
			if (is_closed) nr_points++;
		} else {
			buf_obj = {
				posBuffer: gl.createBuffer(),
				norm1Buffer: gl.createBuffer(),
				norm2Buffer: gl.createBuffer(),
				dirBuffer: gl.createBuffer(),
			};
			drawLine.polycache[cache_id] = buf_obj;
		}
	} else {
		buf_obj = {
			posBuffer: glBuffers.posBuffer,
			norm1Buffer: glBuffers.norm1Buffer,
			norm2Buffer: glBuffers.norm2Buffer,
			dirBuffer: glBuffers.dirBuffer,
		};
	}

	if (!is_gl_buffered) {
		var prevx,prevy;
		if (is_closed) {
			var prevx = coords[2*nr_points-2];
			var prevy = coords[2*nr_points-1];
		} else {
			var prevx = coords[0];
			var prevy = coords[1];
		}
		var curx = coords[0];
		var cury = coords[1];
		for (var i=0; i<nr_points; i++) {
			var nextx,nexty;
			if (i < nr_points-1) {
				nextx = coords[2*i+2];
				nexty = coords[2*i+3];
			} else {
				if (is_closed) {
					nextx = coords[0];
					nexty = coords[1];
				} else {
					nextx = coords[2*i];
					nexty = coords[2*i+1];
				}
			}
			linepos[4*i]   = curx;
			linepos[4*i+1] = cury;
			linepos[4*i+2] = curx;
			linepos[4*i+3] = cury;
			var dx1 = curx - prevx;
			var dy1 = cury - prevy;
			var dx2 = nextx - curx;
			var dy2 = nexty - cury;
			if (dx1==0 && dy1==0) {
				dx1 = dx2;
				dy1 = dy2;
			}
			if (dx2==0 && dy2==0) {
				dx2 = dx1;
				dy2 = dy1;
			}
			linenorm1[4*i] = dy1;
			linenorm1[4*i+1] = -dx1;
			linenorm1[4*i+2] = -dy1;
			linenorm1[4*i+3] = dx1;
			linenorm2[4*i] = dy2;
			linenorm2[4*i+1] = -dx2;
			linenorm2[4*i+2] = -dy2;
			linenorm2[4*i+3] = dx2;
			linedir[2*i]   = -1;
			linedir[2*i+1] =  1;
			prevx = curx;
			prevy = cury;
			curx = nextx;
			cury = nexty;
		}
		// close the polygon
		if (is_closed) {
			var i = nr_points;
			linepos[4*i]   = curx;
			linepos[4*i+1] = cury;
			linepos[4*i+2] = curx;
			linepos[4*i+3] = cury;
			var dx1 = curx - prevx;
			var dy1 = cury - prevy;
			var dx2 = coords[2] - curx;
			var dy2 = coords[3] - cury;
			linenorm1[4*i] = dy1;
			linenorm1[4*i+1] = -dx1;
			linenorm1[4*i+2] = -dy1;
			linenorm1[4*i+3] = dx1;
			linenorm2[4*i] = dy2;
			linenorm2[4*i+1] = -dx2;
			linenorm2[4*i+2] = -dy2;
			linenorm2[4*i+3] = dx2;
			linedir[2*i]   = -1;
			linedir[2*i+1] =  1;
			nr_points++;
		}
		drawLine.program.setAttribute(buf_obj.posBuffer,drawLine.aPos, nr_points*2, 2, linepos);
		drawLine.program.setAttribute(buf_obj.norm1Buffer,drawLine.aNorm1, nr_points*2, 2, linenorm1);
		drawLine.program.setAttribute(buf_obj.norm2Buffer,drawLine.aNorm2, nr_points*2, 2, linenorm2);
		drawLine.program.setAttribute(buf_obj.dirBuffer,drawLine.aDir, nr_points*2, 1, linedir);

	} else {
		drawLine.program.setAttribute(buf_obj.posBuffer,drawLine.aPos, nr_points*2, 2, null);
		drawLine.program.setAttribute(buf_obj.norm1Buffer,drawLine.aNorm1, nr_points*2, 2, null);
		drawLine.program.setAttribute(buf_obj.norm2Buffer,drawLine.aNorm2, nr_points*2, 2, null);
		drawLine.program.setAttribute(buf_obj.dirBuffer,drawLine.aDir, nr_points*2, 1, null);
	}


	//gl.lineWidth(4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, nr_points*2);
}










// gets uniform locations
drawSimpleLineInit = function() {
	drawSimpleLine.uScale = gl.getUniformLocation(drawSimpleLine.program.program, "uScale");
	drawSimpleLine.uObjScale = gl.getUniformLocation(drawSimpleLine.program.program, "uObjScale");
	drawSimpleLine.uOffset = gl.getUniformLocation(drawSimpleLine.program.program, "uOffset");
	drawSimpleLine.uAngle = gl.getUniformLocation(drawSimpleLine.program.program, "uAngle");
	drawSimpleLine.uThickness = gl.getUniformLocation(drawSimpleLine.program.program, "uThickness");
	drawSimpleLine.uColor = gl.getUniformLocation(drawSimpleLine.program.program, "uColor");
	drawSimpleLine.aPos = gl.getAttribLocation(drawSimpleLine.program.program, "aPos");
	drawSimpleLine.aNorm1 = gl.getAttribLocation(drawSimpleLine.program.program, "aNorm1");
}



function drawSimpleLineInitFrame(width,height) {
	gl.useProgram(drawSimpleLine.program.program);
	gl.uniform2f(drawSimpleLine.uScale, width, height);
}



function drawSimpleLine(offset, angle, scale, thickness, color,
coords, nr_points, is_closed){
	gl.useProgram(drawSimpleLine.program.program);

	gl.uniform1f(drawSimpleLine.uObjScale, scale);

	gl.uniform2fv(drawSimpleLine.uOffset, offset);

	gl.uniform1f(drawSimpleLine.uAngle, angle);

	gl.uniform1f(drawSimpleLine.uThickness, thickness);

	gl.uniform4fv(drawSimpleLine.uColor, color);

	var prevx,prevy;
	if (is_closed) {
		var prevx = coords[2*nr_points-2];
		var prevy = coords[2*nr_points-1];
	} else {
		var prevx = coords[0];
		var prevy = coords[1];
	}
	var curx = coords[0];
	var cury = coords[1];
	for (var i=0; i<nr_points; i++) {
		var nextx,nexty;
		if (i < nr_points-1) {
			nextx = coords[2*i+2];
			nexty = coords[2*i+3];
		} else {
			if (is_closed) {
				nextx = coords[0];
				nexty = coords[1];
			} else {
				nextx = coords[2*i];
				nexty = coords[2*i+1];
			}
		}
		linepos[4*i]   = curx;
		linepos[4*i+1] = cury;
		linepos[4*i+2] = curx;
		linepos[4*i+3] = cury;
		var dx1 = curx - prevx;
		var dy1 = cury - prevy;
		var dx2 = nextx - curx;
		var dy2 = nexty - cury;
		if (dx1==0 && dy1==0) {
			dx1 = dx2;
			dy1 = dy2;
		}
		if (dx2==0 && dy2==0) {
			dx2 = dx1;
			dy2 = dy1;
		}
		// norm 1 and 2 are packed into vec4s
		linenorm1[8*i] = dy1;
		linenorm1[8*i+1] = -dx1;
		linenorm1[8*i+4] = -dy1;
		linenorm1[8*i+5] = dx1;
		linenorm1[8*i+2] = dy2; // norm2
		linenorm1[8*i+3] = -dx2; // norm2
		linenorm1[8*i+6] = -dy2; // norm2
		linenorm1[8*i+7] = dx2; // norm2
		//linedir[2*i]   = -1;
		//linedir[2*i+1] =  1;
		prevx = curx;
		prevy = cury;
		curx = nextx;
		cury = nexty;
	}
	// close the polygon
	if (is_closed) {
		var i = nr_points;
		linepos[4*i]   = curx;
		linepos[4*i+1] = cury;
		linepos[4*i+2] = curx;
		linepos[4*i+3] = cury;
		var dx1 = curx - prevx;
		var dy1 = cury - prevy;
		var dx2 = coords[2] - curx;
		var dy2 = coords[3] - cury;
		// norm 1 and 2 are packed into vec4s
		linenorm1[8*i] = dy1;
		linenorm1[8*i+1] = -dx1;
		linenorm1[8*i+4] = -dy1;
		linenorm1[8*i+5] = dx1;
		linenorm1[8*i+2] = dy2; // norm2
		linenorm1[8*i+3] = -dx2; // norm2
		linenorm1[8*i+6] = -dy2; // norm2
		linenorm1[8*i+7] = dx2; // norm2
		//linedir[2*i]   = -1;
		//linedir[2*i+1] =  1;
		nr_points++;
	}

	drawSimpleLine.program.setAttribute(glBuffers.posBuffer,drawSimpleLine.aPos, nr_points*2, 2, linepos);
	drawSimpleLine.program.setAttribute(glBuffers.norm1Buffer,drawSimpleLine.aNorm1, nr_points*2, 4, linenorm1);

	//gl.lineWidth(4);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, nr_points*2);
}





//----------------------------------------------------------------------
// DRAWSPRITE
//----------------------------------------------------------------------


var spriteidxBufferDefined = false;

var white = [1,1,1,1];


function drawSpriteInit(program,tex2,col) {
	if (tex2&&col) {
		this.uTex2 = gl.getUniformLocation(program.program, "uTex2");
		this.uAlpha = gl.getUniformLocation(program.program, "uAlpha");
	} else if (col) {
		this.uColor = gl.getUniformLocation(program.program, "uColor");
	}
	this.uScale = gl.getUniformLocation(program.program, "uScale");
	this.uObjScale = gl.getUniformLocation(program.program, "uObjScale");
	this.uObjCen = gl.getUniformLocation(program.program, "uObjCen");
	this.uObjRot = gl.getUniformLocation(program.program, "uObjRot");
	this.uTex1 = gl.getUniformLocation(program.program, "uTex1");
	this.aIdx = gl.getAttribLocation(program.program, "aIdx");
}


function drawSpriteInitFrame(width,height) {
	gl.useProgram(drawSprite.simpleProgram.program);
	gl.uniform2f(drawSprite.simple.uScale, width, height);
	gl.uniform1i(drawSprite.simple.uTex1, 0);
	gl.uniform1i(drawSprite.simple.uTex2, 1);
	gl.useProgram(drawSprite.colProgram.program);
	gl.uniform2f(drawSprite.col.uScale, width, height);
	gl.uniform1i(drawSprite.col.uTex1, 0);
	gl.uniform1i(drawSprite.col.uTex2, 1);
	gl.useProgram(drawSprite.fadeProgram.program);
	gl.uniform2f(drawSprite.fade.uScale, width, height);
	gl.uniform1i(drawSprite.fade.uTex1, 0);
	gl.uniform1i(drawSprite.fade.uTex2, 1);
}


// tex2 & col are defined -> cross-fade shader, col is scalar alpha
// col is defined -> color shader
// otherwise -> simple shader
function drawSprite(x,y,xscale,yscale,rot,tex1,tex2,col,topleft) {
	if (topleft) {
		x += xscale/2;
		y += yscale/2;
	}
	var program, uniforms;
	if (tex2 && col) {
		program = drawSprite.fadeProgram;
		uniforms = drawSprite.fade;
		gl.useProgram(program.program);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, tex2);
		//var loc = gl.getUniformLocation(program.program, "uAlpha");
		gl.uniform1f(uniforms.uAlpha, col);

	} else if (col) {
		program = drawSprite.colProgram;
		uniforms = drawSprite.col;
		gl.useProgram(program.program);
		//var loc = gl.getUniformLocation(program.program, "uColor");
		gl.uniform4fv(uniforms.uColor, col);
	} else {
		program = drawSprite.simpleProgram;
		uniforms = drawSprite.simple;
		gl.useProgram(program.program);
	}

	//loc = gl.getUniformLocation(program.program, "uObjScale");
	gl.uniform2f(uniforms.uObjScale, xscale,yscale);

	//loc = gl.getUniformLocation(program.program, "uObjCen");
	gl.uniform2f(uniforms.uObjCen, x,y);

	//loc = gl.getUniformLocation(program.program, "uObjRot");
	gl.uniform1f(uniforms.uObjRot, rot);

	if (!spriteidxBufferDefined) {
		var idxes = [0,1,2,3];
		program.setAttribute(glBuffers.spriteidxBuffer,uniforms.aIdx, 4, 1, idxes);
		spriteidxBufferDefined = true;
	} else {
		program.setAttribute(glBuffers.spriteidxBuffer,uniforms.aIdx, 4, 1, null);
	}

	// MUST be set again for every draw on some devices
	// such as Samsung Galaxy Tab Pro
	gl.uniform1i(uniforms.uTex1, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex1);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}



function drawSpriteText(text,x,y,xscale,yscale,col,texs,widths,ofs,len) {
	var xpos = x;
	for (var i=0; i<text.length; i++) {
		var ch = text.charCodeAt(i);
		if (ch < ofs || ch > ofs+len) continue;
		drawSprite(xpos,y,xscale,yscale,0,texs[ch-ofs],null,col);
		xpos += xscale*widths[ch-ofs];
	}
}

var _drawSpriteQueue=[];

// queue drawSprite operation for later
function queueDrawSprite(x,y,xscale,yscale,rot,tex1,tex2,col,topleft) {
	_drawSpriteQueue.push({
		x:x, y:y, xscale:xscale, yscale:yscale, rot:rot,
		tex1:tex1, tex2:tex2, col:col, topleft:topleft
	});
}

// flush queued drawSprites
function flushDrawSpriteQueue() {
	for (var i=0; i<_drawSpriteQueue.length; i++) {
		var s = _drawSpriteQueue[i];
		drawSprite(s.x, s.y, s.xscale, s.yscale, s.rot,
			s.tex1, s.tex2, s.col, s.topleft);
	}
	_drawSpriteQueue=[];
}





//----------------------------------------------------------------------
// DRAWTRIANGLESTRIP
//----------------------------------------------------------------------


var trianglestrip_fs=(function () { /*

precision mediump float;
uniform sampler2D uTex;

varying vec2 uv;

void main(void) {
	gl_FragColor = texture2D(uTex, uv);
	if (gl_FragColor.a < 0.01) discard;
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();


var trianglestrip_vs=(function () { /*

precision mediump float;
uniform vec2 uScale;

attribute vec2 uvVec;
attribute vec2 posVec;

varying vec2 uv;

void main(void) {
	uv = uvVec;

	gl_Position = vec4(
		-1.0 + 2.0*posVec.x/uScale.x,
		 1.0 - 2.0*posVec.y/uScale.y,
		0.0, 1.0);
}

*/ }).toString().split('\n').slice(2,-2).join('\n').trim();



function drawTriangleStripInit(program) {
	var program = drawTriangleStrip.program;
	drawTriangleStrip.uTex = gl.getUniformLocation(program.program, "uTex");
	drawTriangleStrip.uScale = gl.getUniformLocation(program.program, "uScale");
	drawTriangleStrip.posVec = gl.getAttribLocation(program.program, "posVec");
	drawTriangleStrip.uvVec = gl.getAttribLocation(program.program, "uvVec");
	drawTriangleStrip.uv = gl.getAttribLocation(program.program, "uv");
}


function drawTriangleStripInitFrame(width,height) {
	gl.useProgram(drawTriangleStrip.program.program);
	gl.uniform2f(drawTriangleStrip.uScale, width, height);
	gl.uniform1i(drawTriangleStrip.uTex, 0);
}


function drawTriangleStrip(posVec,uvVec,tex) {
	for (var i=0; i<posVec.length; i++) {
		trianglepos[i] = posVec[i];
		triangleuv[i] = uvVec[i];
	}
	drawTriangleStrip.program.setAttribute(glBuffers.posVecBuffer,drawTriangleStrip.posVec, posVec.length, 2, trianglepos);
	drawTriangleStrip.program.setAttribute(glBuffers.uvVecBuffer,drawTriangleStrip.uvVec, uvVec.length, 2, triangleuv);

	gl.useProgram(drawTriangleStrip.program.program);
	// MUST be set again for every draw on some devices
	// such as Samsung Galaxy Tab Pro
	gl.uniform1i(drawTriangleStrip.uTex, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tex);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, posVec.length);
}



// -------------------------------------------------------------
// Helpers


function hsv_to_rgb(h,s,v,a) {
	var c = v * s;
	h = (h * 6.0) % 6.0;
	var x = c * (1.0 - Math.abs(h%2.0 - 1.0));

	color = [0,0,0,a];
	if (0.0 <= h && h < 1.0) {
		color[0] = c;
		color[1] = x;
		color[2] = 0;
	} else if (1.0 <= h && h < 2.0) {
		color[0] = x;
		color[1] = c;
		color[2] = 0;
	} else if (2.0 <= h && h < 3.0) {
		color[0] = 0;
		color[1] = c;
		color[2] = x;
	} else if (3.0 <= h && h < 4.0) {
		color[0] = 0;
		color[1] = x;
		color[2] = c;
	} else if (4.0 <= h && h < 5.0) {
		color[0] = x;
		color[1] = 0;
		color[2] = c;
	} else {
		color[0] = c;
		color[1] = 0;
		color[2] = x;
	}
	color[0] += v - c;
	color[1] += v - c;
	color[2] += v - c;

	return color;
}




