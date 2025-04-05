// Copyright (c) 2014 by Boris van Schooten tmtg.net boris@13thmonkey.org
// Released under BSD license. See LICENSE for details.
// This file is part of jgame.js - a 2D game engine

/** 
* @fileOverview
* Some multi-browser functions for handling WebGL.
* Class ShaderProgram. A convenience class for handling shaders.
*/


/** Create a webgl context.
 *
 * @param {Canvas} canvas The canvas tag to get context from
 * @param {Object} associative array with GL options
 * @param {boolean} custom_handle_error  true = do not generate error message
 * @return {!WebGLContext} The created context.
 */
function createGL(canvas,options,custom_handle_error) {
	var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	var context = null;
	for (var i = 0; i < names.length; i++) {
		try {
			context = canvas.getContext(names[i],options);
		} catch(e) {}
		if (context) {
			break;
		}
	}
	if (!context && !custom_handle_error) {
		alert("Sorry, it appears WebGL is not supported.");
	}
	return context;
}



/** Request one animation frame.  Typical usage:
 *
 * function renderFrame() {
 *     window.requestGLFrame(renderFrame);
 *     // do rendering here
 * }
 *
 * renderFrame();
 *
 * @param {function} callback - function to call
 */
function requestGLFrame(callback) {
	if (window.requestAnimationFrame)
		return window.requestAnimationFrame(callback);
	if (window.webkitRequestAnimationFrame)
		return window.webkitRequestAnimationFrame(callback);
	if (window.mozRequestAnimationFrame)
		return window.mozRequestAnimationFrame(callback)
	if (window.oRequestAnimationFrame)
		return window.oRequestAnimationFrame(callback)
	if (window.msRequestAnimationFrame)
		return window.msRequestAnimationFrame(callback)
	return window.setTimeout(callback, 1000/60);
}


/** Request fullscreen.
* @param {string} elem_id - ID of html element to request fullscreen
*/
function goFullscreen(elem_id) {
	var elem = document.getElementById(elem_id);
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.msRequestFullscreen) {
		elem.msRequestFullscreen();
	} else if (elem.mozRequestFullScreen) {
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
		elem.webkitRequestFullscreen();
	}
	elem.focus();
}


/* Texture handling */

var _textureRootDir = "";

function setTextureRootDir(dir) {
	_textureRootDir = dir;
}

// returns an image url with 8 flipped and rotated subimages
// arranged in a 3x3 grid (9th position is empty). Order:
// 0 = orig
// 1 = 90 deg
// 2 = 180 deg
// 3 = 270 deg
// 4,5,6,7 = image is x mirrored, then rotated according to 0,1,2,3
// This replaces transformimage.php used by cellspace.
function getImageTransformRotMir(image) {
	var w = image.width;
	var h = image.height;
	var buffer = document.createElement("canvas");
	buffer.width = w*3
	buffer.height = h*3
	var ctx = buffer.getContext('2d');
	ctx.clearRect(0,0,w*3,h*3)
	for (var idx=0; idx<8; idx++) {
		var dx = w * (idx % 3);
		var dy = h * Math.floor(idx/3);
		var flip = Math.floor(idx/4);
		var rot = idx % 4;
		//if (flip) {
		//	if (rot == 1) {
		//		rot = 3;
		//	} else if (rot == 3) {
		//		rot = 1;
		//	}
		//}
		// From: https://stackoverflow.com/questions/3129099/how-to-flip-images-horizontally-with-html5 (answer by DesignConsult)
		ctx.save();
		ctx.translate(dx + w/2, dy + h/2);
		// not clear why rotate needs to go before flip, while in 
		// transformimage.php it is the other way round.
		ctx.rotate(rot*Math.PI/2);
		if (flip) {
			ctx.scale(-1,1);
		}
		ctx.drawImage(image,-w/2,-h/2,w,h);
		ctx.restore();
	}
	return buffer.toDataURL();	
}

function initTexture(gl,imageurl,smooth,wrap,callback,mipmap) {
	var texture = gl.createTexture();
	var image = new Image();
	var doTransform = false;
	image.onload = function() {
		if (doTransform) {
			var transurl = getImageTransformRotMir(image);
			var transimage = new Image();
			transimage.onload = function() {
				initTextureWithImage(gl,texture,transimage,smooth,wrap,
					callback,mipmap);
				//document.body.appendChild(transimage);
			}
			//console.log("!!!!!!!!!transurl:");
			//console.log(transurl);
			transimage.src = transurl;
		} else {
			initTextureWithImage(gl,texture,image,smooth,wrap,
				callback,mipmap);
		}
	};
	var finalurl = imageurl;
	// check if image needs to be extended with flipped/mirrored versions
	// indicated by a query parameter "transform_rotmir=true"
	if (imageurl.indexOf(":") >= 0 && imageurl.indexOf(":") <= 5) {
		// absolute url with http:// or image: protocol
		finalurl = imageurl;
	} else {
		// relative url
		finalurl = _textureRootDir+imageurl;
	}
	if (finalurl.indexOf("?transform_rotmir=true") > 0) {
		doTransform = true;
		finalurl = finalurl.substring(0,finalurl.indexOf("?transform_rotmir=true"));
	}
	if (finalurl.indexOf("&transform_rotmir=true") > 0) {
		doTransform = true;
		finalurl = finalurl.substring(0,finalurl.indexOf("&transform_rotmir=true"));
	}
	image.src = finalurl;
	return texture;
}


function initTextureWithImage(gl,texture,image,smooth,wrap,callback,mipmap) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE, image);
	if (smooth) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		if (!mipmap) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
				gl.LINEAR_MIPMAP_LINEAR);
			gl.generateMipmap(gl.TEXTURE_2D);
		}
	} else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	}
	if (wrap) {
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T, gl.REPEAT);
	} else {
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}
	gl.bindTexture(gl.TEXTURE_2D, null);
	if (callback) callback();
}


// helper for loading textures
// if no id is given, will store by URL only. Must be lazy loading

var TexLoader = {
	texById: {},
	texByURL: {},
	texLoaded: {},
	texNotLoaded: {},

	load: function(gl,id,imageurl,smooth,wrap,lazyloading) {
		var tex;
		if (TexLoader.texByURL[imageurl]) {
			if (id) TexLoader.texById[id] = TexLoader.texByURL[imageurl];
			return;
		}
		if (!lazyloading && id) {
			TexLoader.texNotLoaded[id] = true;
			tex = initTexture(gl,imageurl,smooth,wrap,function() {
				TexLoader.texLoaded[id] = true;
				delete TexLoader.texNotLoaded[id];
			});
		} else {
			tex = initTexture(gl,imageurl,smooth,wrap);
		}
		if (id) TexLoader.texById[id] = tex;
		TexLoader.texByURL[imageurl] = tex;
	},
}


/* Class ShaderProgram ********************************************/

/** @type {WebGLContext} */
ShaderProgram.prototype.gl;

/** @type {WebGLShader} */
ShaderProgram.prototype.vertShader;
/** @type {WebGLShader} */
ShaderProgram.prototype.fragShader;

/** @type {WebGLProgram} */
ShaderProgram.prototype.program;


/** Get shaders and compile them into a shader program.
*
* @constructor
* @param {WebGLContext} gl
* @param {string} vectorshaderid - document element id
* @param {string} fragmentshaderid - document element id
* @return {!WebGLProgram}
*/
function ShaderProgram(gl,vertexshaderid,fragmentshaderid,direct_source) {
	this.gl = gl;

	this.fragShader = this.getShader(gl, fragmentshaderid, direct_source,
		"x-shader/x-fragment");
	this.vertShader = this.getShader(gl, vertexshaderid, direct_source,
		"x-shader/x-vertex");

	this.program = gl.createProgram();
	gl.attachShader(this.program, this.vertShader);
	gl.attachShader(this.program, this.fragShader);
	gl.linkProgram(this.program);

	if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
		alert("Could not initialise shaders: "+gl.getProgramInfoLog(this.program));
		return null;
	}
}


/** Get a shader from a script DOM element.  The DOM element type attribute
 * determines the type of shader: x-shader/x-fragment or x-shader/x-vertex.
 *
 * @param gl - WebGLContext
 * @param {string} id - element id of script element
 * @return {!WebGLShader}
 */
ShaderProgram.prototype.getShader =
function(gl, id, direct_source, shadertype) {
	var str = id;
	var shader;
	if (!direct_source) {
		shaderScript = document.getElementById(id);
		if (!shaderScript) {
			return null;
		}

		str = "";
		var k = shaderScript.firstChild;
		while (k) {
			if (k.nodeType == 3) {
				str += k.textContent;
			}
			k = k.nextSibling;
		}
		shadertype = shaderScript.type;
	}

	var typedesc = "";
	if (shadertype == "x-shader/x-fragment") {
		typedesc = "fragment shader";
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shadertype == "x-shader/x-vertex") {
		typedesc = "vertex shader";
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}


	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(typedesc + " error: "+gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


/** Load array of floats into shader attribute.
* @param {string} attributeid - id of shader attribute
* @param {int} numitems - number of vertices
* @param {int} itemsize - size of single item (in # floats)
* @param {float[]} values - flat array[numitems*itemsize] of values to load
*/
ShaderProgram.prototype.setAttribute =
function(buffer,attributeid,numitems,itemsize,values) {
	this.gl.enableVertexAttribArray(attributeid);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
	if (values) {
		// correctly distinguishes between Array and Float32Array in V8
		if (values instanceof Array) values = new Float32Array(values);
		this.gl.bufferData(this.gl.ARRAY_BUFFER,
			values.subarray(0,numitems*itemsize),
			this.gl.DYNAMIC_DRAW);
	}
	//buffer.itemSize = itemsize;
	//buffer.numItems = numitems;

	this.gl.vertexAttribPointer(attributeid, itemsize, this.gl.FLOAT,
		false, 0, 0);
}

/** Load array of floats into index buffer
* @param {int} numitems - number of indexes
* @param {int[] or Uint16Array} indexes - array[numitems] of indexes to load
*/
ShaderProgram.prototype.setIndexBuffer=
function(buffer,numitems,indexes) {
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
	if (indexes) {
		// correctly distinguishes between Array and Float32Array in V8
		if (indexes instanceof Array) indexes = new Uint16Array(indexes);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
			indexes.subarray(0,numitems),
			this.gl.DYNAMIC_DRAW);
	}
}


/* Class Renderbuffer *****************************************************/

function RenderBuffer(gl,width,height) {
	this.w = width;
	this.h = height;
	this.fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);


	this.tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.tex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.w, this.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
}


RenderBuffer.prototype.startRender = function(gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
    gl.viewport(0, 0, this.w,this.h);
}

RenderBuffer.prototype.endRender = function(gl) {
	// back to screen
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	// XXX Is done manually in jgame-main as well. Provide a function for this.
	gl.viewport(eng.viewportxofs,eng.viewportyofs,eng.viewportwidth,eng.viewportheight);
}


RenderBuffer.prototype.getTexture = function() {
	return this.tex;
}

