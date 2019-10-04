/*
Provides a left and right control. Either can be:

- axis: xy values between -1 and 1, analogous to game controller stick

keyboard: for left, use w,s,a,d. for right: use cursor keys
mouse: relative position from a supplied center point
gamepad: maps directly to stick movement
touch: relative position from position first touch (relative controls)

- button: either pressed or released

keyboard: keypress
mouse: left mouse button, right mouse button
gamepad: "A" button or "B" button
touch: touch left half or right half

- pointer: xy values between 0 and width, 0 and height

mouse: mouse position always maps directly to pointer[0]
touchscreen: absolute or relative control, all-screen or left/right half
gamepad: stick direction moves pointer

*/


function JGCanvasAbstractControls(canvas,logicalwidth,logicalheight,config) {
	JGCanvas.apply(this,[canvas,logicalwidth,logicalheight]);

	this.config = {
		axis: [
			{
				keys: {
					enabled: true,
					codes: [ "W","S","A","D" ],
				},
				mouse: {
					enabled: false,
					clipped: true, // always clip to -1...1
					center: {x:width/2,y:height/2},
					scale: height/2,
				},
				touch: {
					enabled: true,
					clipped: true, // always clip to -1...1
					region: "left", // all, left, right, none
					sensitivity: 1.0,
				},
				gamepad: {
					enabled: true,
					axes: {x:"lx",y:"ly"},
				}
			},
			{
				keys: {
					enabled: false,
					codes: [ KeyUp,KeyDown,KeyLeft,KeyRight ],
				},
				mouse: {
					enabled: true,
					clipped: true, // always clip to -1...1
					// if function, it should return object with x,y
					center: function() {return JGObject.getObject("Player");},
					scale: height/2,
				},
				touch: {
					enabled: true,
					clipped: true, // always clip to -1...1
					region: "left", // all, left, right, none
					sensitivity: 1.0,
				},
				gamepad: {
					enabled: true,
					axes: {x:"rx",y:"ry"},
				}
			},
		],
		button: [
			{	// buttons[0] emulates mouse button
				keys: {
					code: "Z",
				},
				mouse: {
					button: 1,
				},
				touch: {
					region: "all", // all, left, right, none
				},
				gamepad: {
					button: "a", // a,b,x,y
				},
			},
			{
				keys: {
					code: "X",
				},
				mouse: {
					button: 2,
				},
				touch: {
					region: "none", // all, left, right, none
				},
				gamepad: {
					button: "b", // a,b,x,y
				},
			},
		],
		pointer: [
			{	// pointers[0] emulates mouse through getMouseX/Y()
				touch: {
					enabled: true,
					control: "absolute", // "absolute", "relative"
					region: "all", // all, left, right, none
					sensitivity: 1.0, // for relative
				},
				gamepad: {
					axes: {x:"lx",y:"ly"},
					sensitivity: 1.0,
				},
			},
			{ // To have two touchscreen pointers, set both to relative
				touch: {
					enabled: false,
					control: "relative", // "absolute", "relative"
					region: "left", // all, left, right, none
					sensitivity: 1.0, // for relative
				},
				gamepad: {
					axes: {x:"lx",y:"ly"},
					sensitivity: 1.0,
				},
			},
			{ // To have two touchscreen pointers, set both to relative
				touch: {
					enabled: false,
					control: "relative", // "absolute", "relative"
					region: "right", // all, left, right, none
					sensitivity: 1.0, // for relative
				},
				gamepad: {
					axes: {x:"rx",y:"ry"},
					sensitivity: 1.0,
				},
			},
		]
	}
	if (config) MergeRecursive(this.config,config);
	this.initState();
}

JGCanvasAbstractControls.prototype = new JGCanvas();


JGCanvasAbstractControls.prototype.initState = function() {
	// TODO
	this.axis_touchcen = [];
	this.axis_prevtouch = [];
	this.axis_touch = [];
	this.axes = [];
	// end result
	for (var i=0; i<this.config.axis.length; i++) {
		this.axes.push({x:0,y:0});
		this.axis_touchcen.push({x:0,y:0});
		this.axis_prevtouch.push(false);
		this.axis_touch.push({x:0,y:0});
	}
	this.buttons = [];
	for (i=0; i<this.config.button.length; i++) {
		this.buttons.push(false);
	}
	this.pointers = [];
	for (i=0; i<this.config.pointer.length; i++) {
		this.pointers.push({x:0,y:0});
	}
}

// !overwrite -> merge with existing config
JGCanvasAbstractControls.prototype.setConfig = function(config,overwrite) {
	if (!overwrite) {
		MergeRecursive(this.config,config);
	} else {
		this.config = config;
	}
	this.initState();
}

// get touch event in region, null = none found
// region: none, left, right, all
JGCanvasAbstractControls.prototype.getTouchInRegion = function(region) {
	if (region == "none") return null;
	region = {
		"all": [0,0,width,height],
		"left": [0,0,width/2,height],
		"right": [width/2,0,width,height],
	}[region];
	var touches = this.getTouches();
	for (var i=0; i<touches.length; i++) {
		if (touches[i].x >= region[0]
		&& touches[i].x < region[2]
		&& touches[i].y >= region[1]
		&& touches[i].y < region[3]) {
			// return first touch in region, ignore subsequent touches
			return touches[i];
		}
	}
	return null;
}

JGCanvasAbstractControls.prototype.update = function() {
	for (var i=0; i<this.config.button.length; i++) {
		// buttons
		this.buttons[i] = this.getKey(this.config.button[i].keys.code);
		var touch = this.getTouchInRegion(this.config.button[i].touch.region);
		if (touch) {
			this.buttons[i] = true;
		}
		if (this.mousebutton[this.config.button[i].mouse.button]) {
			this.buttons[i] = true;
		}
		if (this.hasGamepads()
		&& this.getGamepad(0).but[this.config.button[i].gamepad.button]) {
			this.buttons[i] = true;
		}
	}
	for (i=0; i<this.config.pointer.length; i++) {
		// pointers
		if (this.mouseinside) {
			this.pointers[i].x = this.mousex;
			this.pointers[i].y = this.mousey;
		}
		if (this.config.pointer[i].touch.control == "absolute") {
			// XXX original touch->mouse code uses pageX/Y rather than
			// clientX/Y?
			var touch = this.getTouchInRegion("all");
			if (touch) {
				this.pointers[i].x = touch.x;
				this.pointers[i].y = touch.y;
			}
		} // TODO relative
		if (this.hasGamepads()) {
			var mx = this.getGamepads(0)[this.config.pointer[i].gamepad.axes.x];
			if (mx) {
				this.pointers[i].x+=20.0*this.config.pointer[i].gamepad.sensitivity*mx;
				if (this.pointers[i].x < -8) this.pointers[i].x = -8;
				if (this.pointers[i].x > width-8) this.pointers[i].x = width-8;
			}
			var my = this.getGamepads(0)[this.config.pointer[i].gamepad.axes.y];
			if (my) {
				this.pointers[i].y+=20.0*this.config.pointer[i].gamepad.sensitivity*my;
				if (this.pointers[i].y < -8) this.pointers[i].y = -8;
				if (this.pointers[i].y > height-8) this.pointers[i].y = height-8;
			}
		}
	}
	// axes
	/*		{
				keys: {
					enabled: true,
					codes: [ "W","S","A","D" ],
				},
				mouse: {
					enabled: false,
					clipped: true, // always clip to -1...1
					center: {x:width/2,y:height/2},
					scale: height/2,
				},
				touch: {
					enabled: true,
					clipped: true, // always clip to -1...1
					region: "left", // all, left, right, none
					sensitivity: 1.0,
				},
				gamepad: {
					enabled: true,
					axes: {x:"lx",y:"ly"},
				}
			},
	*/
	for (i=0; i<this.config.axis.length; i++) {
		var axis = this.config.axis[i];
		this.axes[i].x=0;
		this.axes[i].y=0;
		if (axis.keys && axis.keys.enabled) {
			if (this.getKey(axis.keys.codes[0]))
				this.axes[i].y=-1;
			if (this.getKey(axis.keys.codes[1]))
				this.axes[i].y= 1;
			if (this.getKey(axis.keys.codes[2]))
				this.axes[i].x=-1;
			if (this.getKey(axis.keys.codes[3]))
				this.axes[i].x= 1;
		}
		if (axis.mouse
		&& axis.mouse.enabled
		&& this.mouseinside) {
			var center = axis.mouse.center;
			if (typeof center == "function") {
				center = center();
			}
			if (center) {
				var scale = axis.mouse.scale;
				var dx = (this.mousex - center.x) / scale;
				var dy = (this.mousey - center.y) / scale;
				var len = Math.sqrt(dx*dx + dy*dy);
				var ang = Math.atan2(dx,dy);
				if (axis.mouse.clipped && len>1) len=1;
				this.axes[i].x = len*Math.sin(ang);
				this.axes[i].y = len*Math.cos(ang);
			}
		}
		if (axis.gamepad.enabled
		&& this.hasGamepads()) {
			this.axes[i].x = this.getGamepad(0)
				[axis.gamepad.axes.x];
			this.axes[i].y = this.getGamepad(0)
				[axis.gamepad.axes.y];
		}
		if (axis.touch.enabled) {
			var touch = this.getTouchInRegion(axis.touch.region);
			if (touch) {
				if (this.axis_prevtouch[i]) {
					this.axis_touch[i].x += this.axis_touchcen[i].x;
					this.axis_touch[i].y += this.axis_touchcen[i].y;
				}
				this.axis_touchcen[i].x = touch.x;
				this.axis_touchcen[i].y = touch.y;
				this.axis_prevtouch[i] = true;
				this.axes[i].x = 0.001*axis.touch.sensitivity
					* this.axis_touch[i].x;
				this.axes[i].y = 0.001*axis.touch.sensitivity
					* this.axis_touch[i].y;
			} else {
				this.axis_prevtouch[i] = false;
				this.axis_touch[i].x = 0;
				this.axis_touch[i].y = 0;
			}
		}
	}
	/*
	// old touch -> mouse code based on raw event
	if (this.sawTouchEvents()) {
		if (event.touches.length >= 1) {
			var touch = event.touches[0];
			this.mousex = (touch.pageX - rect.left - this.viewportxofs) 
				/ (this.viewportwidth / this.width);
			this.mousey = (touch.pageY - rect.top - this.viewportyofs) 
				/ (this.viewportheight / this.height);
		}
	}
	// old gamepad->mouse emulation code
		if (!this.sawmouseevents && !this.sawtouchevents) {
			var mx = this.gamepad.mx;
			if (mx) {
				this.mousex += 20.0*this.gamepadsensitivity*mx;
				if (this.mousex < -8) this.mousex = -8;
				if (this.mousex > width-8) this.mousex = width-8;
			}
			var my = this.gamepad.my;
			if (my) {
				this.mousey += 20.0*this.gamepadsensitivity*my;
				if (this.mousey < -8) this.mousey = -8;
				if (this.mousey > height-8) this.mousey = height-8;
			}
			this.mousebutton[1] = this.gamepad.but.a;
		}
	*/
}


/** index: 0=left, 1=right. Returns {x,y} */
JGCanvasAbstractControls.prototype.getAxes = function(index) {
	return this.axes[index];
}

/* index: 0=left, 1=right.returns boolean */
JGCanvasAbstractControls.prototype.getButton = function(index) {
	return this.buttons[index];
}

/** index: 0=left, 1=right. Returns {x,y} */
JGCanvasAbstractControls.prototype.getPointer = function(index) {
	return this.pointers[index];
}

// Mouse emulation, overrides normal mouse functions.
// - buttons[0] -> mouse button 1
// - pointers[0] -> mousexy
// Optional parameter index can be used to get second pointer

JGCanvasAbstractControls.prototype.getMouseX = function(index) {
	if (!index) index=0;
	return this.pointers[index].x;
}

JGCanvasAbstractControls.prototype.getMouseY = function(index) {
	if (!index) index=0;
	return this.pointers[index].y;
}

JGCanvasAbstractControls.prototype.getMouseButton = function(button,index) {
	if (!index) index=0;
	if (button==1) return this.buttons[index];
	// normal behaviour for other buttons
	return this.mousebutton[button];
}

JGCanvas.prototype.getMouseInside = function() {
	if (this.getTouches().length > 0) return true;
	return this.mouseinside;
}


