/*@webcogs_build 0.6.0 openai-gpt-5.4 2026-05-11T07:59:03.884Z
@webcogs_system_prompt
# General instructions

You are writing Javascript functions and classes.

Use 4 spaces for indenting.  Functions are always export functions. 

## Random functions

Always use the following random functions:

random2(min, max) - generate a random float between min (inclusive) and max (exclusive)

randomstep2(min, max, interval) - generate a random number between min (inclusive) and max (inclusive) with interval steps.  For any interval=n, it creates a number which is always increments of n from min. For example, if interval=1, it creates an integer between min and max. 

srand2(seed) - seeds the random function

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
	\/** Superclass constructor.
	* @param x - start x position (virtual screen resolution is 1920x1080)
	* @param y - start y position (virtual screen resolution is 1920x1080)
	* @param delay - how long it takes until a particle becomes visible and starts moving. A value of 1 indicates 1/50 second.
	* @param size - a float indicating the size of particle in the virtual screen resolution
	* @param color - an array with 4 elements [r,g,b,a], values between 0 and 1
	*\/
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
@webcogs_user_prompt
Create a particle generator that generates glowing red-yellow particles that expand radially, shrink and slow down.
@webcogs_end_prompt_section*/
class GlowingRadialParticle extends Particle {
    constructor(x, y, sprite, delay, size, color, vx, vy, lifetime, shrinkRate, drag, fadeStart) {
        super(x, y, sprite, delay, size, color);
        this.vx = vx;
        this.vy = vy;
        this.life = 0;
        this.lifetime = lifetime;
        this.shrinkRate = shrinkRate;
        this.drag = drag;
        this.fadeStart = fadeStart;
        this.initialAlpha = color[3];
        this.minSize = 0.05;
    }

    moveFunc() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.size -= this.shrinkRate;
        this.life += 1;

        if (this.life >= this.fadeStart) {
            const fadeProgress = (this.life - this.fadeStart) / Math.max(1, this.lifetime - this.fadeStart);
            this.color[3] = this.initialAlpha * Math.max(0, 1 - fadeProgress);
        }

        if (this.life >= this.lifetime || this.size <= this.minSize || this.color[3] <= 0.01) {
            this.remove();
        }
    }
}

export function createGlowingRedYellowParticles(centerx, centery, nr_particles, sprite, {
    particle_size = 18,
    effect_size = 220,
    effect_duration = 40,
    speed_min = 2,
    speed_max = 9,
    delay_max = 6,
    alpha_min = 0.65,
    alpha_max = 1,
    drag_min = 0.9,
    drag_max = 0.96,
    shrink_min = 0.12,
    shrink_max = 0.38,
    inner_burst_ratio = 0.2,
    fade_start_ratio = 0.35,
    size_jitter = 0.45,
    orange_bias = 0.65
} = {}) {
    const maxRadius = effect_size;
    const baseLifetime = Math.max(4, effect_duration);

    for (let i = 0; i < nr_particles; i += 1) {
        const angle = random2(0, Math.PI * 2);
        const radialBias = random2(0, 1);
        const startRadius = radialBias < inner_burst_ratio ? random2(0, maxRadius * 0.18) : random2(0, maxRadius * 0.08);
        const spawnX = centerx + Math.cos(angle) * startRadius;
        const spawnY = centery + Math.sin(angle) * startRadius;

        const speed = random2(speed_min, speed_max) * (effect_size / 220);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const delay = randomstep2(0, delay_max, 1);
        const size = particle_size * random2(1 - size_jitter, 1 + size_jitter);
        const green = random2(orange_bias, 1);
        const color = [1, green, 0, random2(alpha_min, alpha_max)];
        const lifetime = Math.max(5, Math.floor(baseLifetime * random2(0.8, 1.2)));
        const shrinkRate = random2(shrink_min, shrink_max) * (particle_size / 18);
        const drag = random2(drag_min, drag_max);
        const fadeStart = Math.max(1, Math.floor(lifetime * fade_start_ratio));

        new GlowingRadialParticle(
            spawnX,
            spawnY,
            sprite,
            delay,
            size,
            color,
            vx,
            vy,
            lifetime,
            shrinkRate,
            drag,
            fadeStart
        );
    }
}