/*@webcogs_build 0.6.0 openai-gpt-5.4 2026-05-11T07:58:28.197Z
@webcogs_system_prompt
# General instructions

You are writing Javascript functions and classes.

Use 4 spaces for indenting.  Functions are always export functions. 

## Random functions

Always use the following random functions:

random2(min, max) - generate a random float between min (inclusive) and max (exclusive)

randomstep2(min, max, interval) - generate a random number between min (inclusive) and max (inclusive) with interval steps.  For any interval=n, it creates a number which is always increments of n from min. For example, if interval=1, it creates an integer between min and max. 

srand2(seed) - seeds the random function

# Defining game entities

A game entity is a 2D animated character that can interact with other entities and the tile background.  The background consists of a grid of tiles.  Entity position is given in tile coordinates.  The tile grid has a size of at least 32x18.

A game entity is always a subclass of GameEntity.  There are two ways to use it, namely free movement or tile-based movement.  Some functions are only for free movement, other only for tile-base movement.  Tile-based movement automatically moves the entity between tile positions, after which the entity is always exactly on a tile.  You can mix free movement and tile based movement only if you do not update the entity position in free movement. 

A game entity can spawn other entities. Define them as additional classes (not export classes) which can be spawned using new (). They do not need to be registered. 

A game entity can be deleted by calling its remove() method.

Collision is performed using bit masks.  Each tile and entity has a bit mask which determines its collision type. Use the bitwise OR operator (|) to combine bit masks for collision detection. There are two ways to detect collision: one is to use the getEnv method, which looks up the bit masks of tiles and entities at a given position, and the hit callback method, which is called with as parameter the entity that you collided with.

Always define a game entity as an export class.  The class will be created by the game engine.  Its contructor should always follow the following signature:

constructor(name,unique,tx,ty,mask,sprite,{extraParameters}) - name and unique define the instance name. If unique=true, a number is added to the name to make it unique.  tx and ty are the position, mask is the collision mask, sprite is the sprite name. Extra configuration parameters can be added, via a named parameter object, with default values for each, specified using parameter destructuring, e.g. {parameter1,parameter2,...}={}. The constructor should always call super(name,unique,tx,ty,mask,sprite).

General methods:

hit(entity) - is called when an entity collides with another. Override this method to handle entity-entity collisions.

hit_bg(tilemask) - is called when an entity collides with particular tiles. tilemask is the OR of the masks of the collided tiles.

Free movement methods:

moveTick() - is called every game tick. Override this method to handle free movement, shooting, and other non tile restricted actions. Do not update the entity position if you also define moveTile(), to prevent interference with automatic movement between tiles.

getTileCoords() - returns tile coordinates that overlap with the entity, in the format {x,y,width,height}. Use this to get coordinates of colliding tiles if an entity is not aligned with a tile coordinate.

Tile-based methods:

moveTile() - is called when the entity has finished moving to a new tile position. Override this method for tile based movement.

goTo(tilex,tiley,delay) - go to a particular tile position. speed is the number of game ticks to take to move to the new position. Use this to smoothly move to a new tile position for tile-based movement. Call this method only from inside moveTile().

getEnv(dx,dy,mask=-1) - get the tile and tile-based entity masks at the given position relative from the player. dx and dy are the relative tile coordinates to the entity's position. Call this method only from inside moveTile(). Default mask value is -1 (all 1s)


Use the following getters and setters for the entity position:

setX(tx) - tx is tile coordinate
setY(tx) - tx is tile coordinate
getX() - returns tile coordinate
getY() - returns tile coordinate

Get the entity collision mask using the method getMask().

Get the player entity using the function getPlayer(). It returns null if no player was found.

Set a tile at a particular position with the function setTile(tile_index,tile_mask,tx,ty).

Get a tile mask at a particular position with the function getTileMask(tx,ty)

## Controls

You can detect player movement and fire buttons using the following functions, available via the global io object:

io.getAxes = function(index) - Get the state of the controller stick positions. Index is 0 (left stick) or 1 (right stick). Returns an object {x,y}, indicating direction (either -1, 0, or 1)

io.getButton(index) - Get the state of a controller button. Index is 0 (left button) or 1 (right button). Returns a boolean (true=button is pressed).

## Success and failure

To indicate a level is complete, call levelDone().   To indicate the level failed, such as when the player dies, call gameOver(), and also remove the player if applicable.

## Sound and effects

To play a sound, use the global function playSound(name), where name is a string.  Do not play sounds unless explicitly told.

## Tile and entity collision masks

Entity masks are predefined, and are always one of the following:

var player_mask = 1
var enemy_mask = 2 // for enemies and enemy bullets
var pickup_mask = 4 // mask for bonuses and other things that can be picked up
var player_bullet_mask = 8 // for player bullets

Tile masks can be obtained by name using the function getTileMaskDef(mask_name).

@webcogs_user_prompt
Create a stationary object that can be picked up by the player.  Is removed when it collides with the player.
@webcogs_end_prompt_section*/
export class Pickup extends GameEntity {
    constructor(name, unique, tx, ty, mask, sprite, {} = {}) {
        super(name, unique, tx, ty, mask, sprite);
    }

    hit(entity) {
        if (entity && entity.getMask() === player_mask) {
            this.remove();
        }
    }
}