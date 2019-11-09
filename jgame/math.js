// ------------------------------------------------------------------
// various math functions

/**
* @param {float} min - lower bound
* @param {float} max - upper bound exclusive
* @return {float}
*/
function random(min, max) {
	return min + Math.random()*(max-min);
}
/**
* @param {float} min - lower bound
* @param {float} max - upper bound exclusive
* @param {float} interval - step size
* @return {float}
*/
function randomstep(min, max, interval) {
	var steps = Math.floor(0.00001 + (max-min)/interval);
	return min + ( Math.floor(Math.random()*(steps+0.99)) )*interval;
}

// deprecated, use Vec2.dist
function distance(x,y) {
	return Math.sqrt(x*x + y*y);
}

function typecheckInt(value,name) {
	if (isNaN(value) || !isFinite(value) || value%1 != 0) {
		console.log("Type error: "+name+" is not an integer (value='"+value+"')");
		if (console.trace) console.trace();
		return false;
	}
	return true;
}

function typecheckNumber(value,name) {
	if (isNaN(value) || !isFinite(value)) {
		console.log("Type error: "+name+" is not a number (value='"+value+"')");
		if (console.trace) {
			console.trace();
		}
		return false;
	}
	return true;
}


// ------------------------------------------------------------------
// vec(x,y) math

var Vec2 = {

	speed2vec: function(obj) {
		return {x:obj.xspeed, y:obj.yspeed};
	},

	create: function(x,y) {
		if (!x) x=0;
		if (!y) y=0;
		return { x:x, y:y };
	},

	copy: function(obj) {
		return {x:obj.x, y:obj.y};
	},

	// TODO test!
	// scalar distance between obj1 and obj2
	dist: function(obj1,obj2) {
		var d = Vec2.vec(obj1,obj2);
		return Math.sqrt(d.x*d.x + d.y*d.y);
	},

	// vector obj1 -> obj2
	vec: function(obj1,obj2) {
		return { x: obj2.x-obj1.x, y: obj2.y-obj1.y };
	},

	sum: function(obj1,obj2) {
		return { x: obj1.x+obj2.x, y: obj1.y+obj2.y };
	},

	atan2: function(obj) {
		return Math.atan2(obj.x,obj.y);
	},

	// convert {x,y} to {ang,dist}
	polar: function(obj) {
		return {
			ang: Math.atan2(obj.x,obj.y),
			dist: Math.sqrt(obj.x*obj.x + obj.y*obj.y)
		};
	},

	// convert {ang,dist} to {x,y}
	polartoxy: function(polar) {
		return {
			x: Math.sin(polar.ang)*polar.dist,
			y: Math.cos(polar.ang)*polar.dist,
		};
	}

}

