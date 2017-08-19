
// --------------------------------------------------------------------
// Text Particle
// --------------------------------------------------------------------

function TextObj(text,color,x,y,startsize,endsize,duration) {
	JGObject.apply(this,["particle",true,x,y, 0]);
	this.text = text;
	this.color = color;
	this.expiry = duration;
	this.maxexp = this.expiry;
	this.size = startsize;
	this.grow = (endsize-startsize) / duration;
}

TextObj.prototype = new JGObject();

TextObj.prototype.move = function() {
	this.expiry--;
	if (this.expiry<=0) this.remove();
	this.size += this.grow;
}

TextObj.prototype.hit = function(obj) { }

TextObj.prototype.hit_bg = function(tilecid) { }


TextObj.prototype.paint = function(gl) {
	var phase = this.expiry/this.maxexp;
	if (phase>0) phase = Math.sqrt(phase);
	var col = [this.color[0],this.color[1],this.color[2],
				this.color[3]*phase];
	drawSpriteText(fontbatch,this.text,this.x,this.y-0.0*this.size,
		this.size,this.size,0,0.25,col);
}

// --------------------------------------------------------------------
// Menu item
// --------------------------------------------------------------------

// auxtext is an array of objects, contains the fields text, ofs, and scale.
// XXX merge text with auxtext. Also add color?
function MenuObj(type,x,y,xsize,ysize,delay,text,textofs,textscale,
callback,callbackparam,hover,hoverparam,color,easing,name,
auxtext) {
	JGObject.apply(this,[name ? name : "menuitem",true,x,y, 0]);
	this.type = type;
	this.easing = easing || easing===0 ? easing : 40;
	this.xsize = xsize;
	this.ysize = ysize;
	this.delay = delay;
	this.text = text;
	this.textofs = textofs;
	this.textscale = textscale;
	this.callback = callback;
	this.callbackparam = callbackparam;
	this.hover = hover;
	this.hoverparam = hoverparam;
	this.color = color ? color : [1,1,1,1];
	this.selected=false;
	this.sizeeasing=1;
	this.auxtext = auxtext;
}

MenuObj.prototype = new JGObject();

MenuObj.prototype.move = function() {
	if (this.delay > 0) {
		this.delay--;
		return;
	}
	if (this.easing > 0) this.easing--;
	var mx = eng.getMouseX();
	var my = eng.getMouseY();
	this.selected=false;
	if (this.x > mx-this.xsize/2 && this.x < mx+this.xsize/2
	&&  this.y > my-this.ysize/2 && this.y < my+this.ysize/2) {
		if (this.hover) {
			this.hover(this.hoverparam);
		}
		this.selected=true;
		if (mousebutflank) {
			mousebutflank=false;
			JGAudio.play("select");
			this.callback(this.callbackparam);
		}
	}
}


MenuObj.prototype.hit = function(obj) { }

MenuObj.prototype.hit_bg = function(tilecid) { }


// convert phase (1...0) to easing values:
// { xsize, ysize, angle }
MenuObj.prototype.easingFunc = function(phase) {
	return {
		xsize: 1.0 + 3.0*phase,
		ysize: 1.0 + 3.0*phase,
		angle: 4.0*phase
	};
}

MenuObj.prototype.paint = function(gl) {
	if (this.delay > 0) return;
	var phase = this.easing>0 ? this.easing/50 : 0;
	var easingVals = this.easingFunc(phase);
	var xsize_orig = this.xsize * easingVals.xsize;
	var ysize_orig = this.ysize * easingVals.ysize;
	var xsize = xsize_orig*this.sizeeasing;
	var ysize = ysize_orig*this.sizeeasing;
	if (this.selected) {
		if (this.sizeeasing < 1.15) this.sizeeasing += 0.02;
	} else {
		if (this.sizeeasing > 1.0) this.sizeeasing -= 0.02;
	}
	var col=this.color;
	if (this.easing>0) {
		col =[col[0], col[1], col[2],  col[3] * (1.0-phase)];
	}
	// text is scaled with vertical size of button
	particlebatch.addSprite(this.type,this.x,this.y,false,
		xsize, ysize, easingVals.angle, col);
	drawSpriteText(fontbatch,this.text,this.x,this.y+this.textofs,
		this.textscale*ysize,this.textscale*ysize,0,0.25,col);
	if (this.auxtext) {
		for (var i=0; i<this.auxtext.length; i++) {
			var text = this.auxtext[i];
			// no size easing on aux text
			drawSpriteText(fontbatch,text.text,this.x,this.y+text.ofs,
				text.scale*ysize_orig,text.scale*ysize_orig,0,0.25,col);
		}
	}
	if (this.selected) {
		particlebatch.addSprite(2,this.x,this.y,false,
			xsize, ysize, 0.0, [1,1,1,0.3]);
	}
}


