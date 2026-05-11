You have to write an export function that creates a configurable number of particles at a particular position. 
Function parameters are: centerx,centery,nr_particles,sprite,{particle_size,effect_size,effect_duration, [additional_parameters]}. 

The parameters particle_size, effect_size, effect_duration configure the effect. Add additional parameters to allow further configuration of the effect. These configuration parameters are supplied via a named parameter object, with default values for each, specified using parameter destructuring, e.g. {parameter1=default1,parameter2=default2,...}={}.  

Do not seed the random generator (do not call srand2()).

The function can create particles only through the available particle system, which provides the following class Particle. Simply create an instance to create a particle, it does not need to be registered. Make one or more subclasses of Particle to define particle behaviour.

class Particle {
	// object properties
	x;
	y;
	delay;
	size;
	color;
	/** Superclass constructor.
	* @param x - start x position (virtual screen resolution is 1920x1080)
	* @param y - start y position (virtual screen resolution is 1920x1080)
	* @param delay - how long it takes until a particle becomes visible and starts moving. A value of 1 indicates 1/50 second.
	* @param size - a float indicating the size of particle in the virtual screen resolution
	* @param color - an array with 4 elements [r,g,b,a], values between 0 and 1
	*/
	constructor(x,y,sprite,delay,size,color) {
		// override to add parameters and properties
	}
	moveFunc() {
		// override define movement. Call this.remove() to remove the particle.
	}
}

Ensure that all particles eventually die (call remove()).

Note that particles that are created first are shown below particles created later.

Specification of the function follows.