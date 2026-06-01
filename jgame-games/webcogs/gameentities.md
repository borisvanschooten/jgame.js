# Defining game entities

A game entity is a 2D animated character that can interact with other entities and the tile background.  The background consists of a grid of tiles.  Entity position is given in tile coordinates.  The tile grid has a size of at least 32x18.

A game entity is always a subclass of GameEntity.  There are two ways to use it, namely free movement or tile-based movement.  Some functions are only for free movement, other only for tile-base movement.  Tile-based movement automatically moves the entity between tile positions, after which the entity is always exactly on a tile.  You can mix free movement and tile based movement only if you do not update the entity position in free movement. Only use tile based movement if needed for the entity to interact with tiles.

The following instance properties of GameEntity are reserved and should not be
used in your game entities: this.sprite, this.anim, this.angle, this.x, this.y, this.tx, this.ty, this.xspeed, this.yspeed.

A game entity can spawn other entities. Define them as additional classes (not export classes) which can be spawned using new (). They do not need to be registered. 

A game entity can also spawn an externally defined entity, which are referred to via an 'entity character' or 'entity char' (a 1-character string) by calling the global function createEntityFromChar(entitychar,x,y).

A game entity can be deleted by calling its remove() method.

Do not check for collision unless explicitly instructed. Collision is performed using bit masks.  Each tile and entity has a bit mask which determines its collision types.  Never compare masks against a specific number; always check for specific mask bits using bitwise AND (&) and bitwise OR (|) to test for and combine bit masks for collision detection.   Tile masks are never 0; empty space also has a nonzero tile mask. There are two ways to detect collision: one is to use the getTileMasks method, which looks up the bit masks of tiles at a given position. The other is the hit and hit\_bg callback methods, which is called with as parameter the entity that you collided with.

When tile-based movement, in particuler the goTo method is used, the entity
will also adds its entity mask to the tile mask it goes to.  So, for these
entities, presence can be checked using getTileMasks. However, this is not a
reliable way to detect entity collision, and is meant to test only whether a tile is already occupied by another entity when it wants to move to that tile.

Always define a game entity as an export class.  Instances will be created by the game engine.  Its contructor should always follow the following signature:

constructor(name,unique,tx,ty,mask,sprite,{extraParameters}) - name and unique define the instance name. If unique=true, a number is added to the name to make it unique.  tx and ty are the (integer) position, mask is the collision mask, sprite is the sprite name. Extra configuration parameters can be added, via a named parameter object, with default values for each, specified using parameter destructuring, e.g. {parameter1,parameter2,...}={}. The constructor should always call super(name,unique,tx,ty,mask,sprite). Add configuration parameters for anything that is meaningful to configure.

## General methods

hit(entity) - is called when an entity collides with another. Override this method to handle entity-entity collisions.

hit_bg(tilemask) - is called when an entity collides with particular tiles. tilemask is the OR of the masks of the collided tiles. Only use this function if tile interactions are explicitly specified.

getTileCoords(dx=0,dy=0) - returns integer tile coordinates that overlap with the entity, in the format {x,y,width,height}.  dx and dy are optional position offsets.  Use this to get coordinates of colliding tiles if an entity is not aligned with a tile coordinate.

getTileMasks(dx=0,dy=0,and_mask=-1) - get the tile masks at the given position relative from the entity. dx and dy are the integer relative tile coordinates to the entity's position.   Note that if an entity does not have an integer tile position, it overlaps multiple tiles, and the method ORs the masks of all overlapping tiles. and_mask performs a bitwise AND with the resulting mask value, and can be used to filter for particular mask bits.

## Free movement methods

moveTick() - is called every game tick. Override this method to handle free movement, shooting, and other non tile restricted actions. Do not update the entity position if you also define moveTile(), to prevent interference with automatic movement between tiles.

## Tile-based methods

moveTile() - is called when the entity has finished moving to a new tile position. Override this method for tile based movement.

goTo(tilex,tiley,delay) - go to a particular tile position. tx and ty must be integers. delay is the number of game ticks to take to move to the new position. Use this to smoothly move to a new tile position for tile-based movement. Call this method only from inside moveTile().

## Getters and setters

Use the following getters and setters for the entity position:

setX(tx) - tx is tile coordinate
setY(ty) - ty is tile coordinate
getX() - returns tile coordinate
getY() - returns tile coordinate

Get the entity sprite using the method getSprite(); set a new sprite using
setSprite(sprite_name).

Get the entity collision mask using the method getMask(); set it using
setMask(mask).

Get the player entity using the function getPlayer(). It returns null if no player was found.

Set a tile at a particular position with the function setTile(tile_index,tile_mask_name,tx,ty), where tx and ty are integers.


## screen bounds

The screen bounds are as follows: the top left has tile coordinate 0,0; the bottom right has coordinate nrtilesx,nrtilesy, where nrtilesx and nrtilesx are globals.

When entities go off the screen bounds, either constrain them within the
screen (for example, enemies) or remove them (for example, bullets).

## Controls

You can detect player movement and fire buttons using the following functions, available via the global io object:

io.getAxes = function(index) - Get the state of the controller stick positions. Index is 0 (left stick) or 1 (right stick). Returns an object {x,y}, indicating direction (either -1, 0, or 1)

io.getButton(index) - Get the state of a controller button. Index is 0 (left button) or 1 (right button). Returns a boolean (true=button is pressed).

## Success and failure

To indicate a level is complete, call levelDone().   To indicate the level failed, such as when the player dies, call gameOver(), and also remove the player if applicable.

## Sound and effects

To play a sound, use the global function playSound(name), where name is a string.  Do not play sounds unless explicitly told so.

## Tile and entity collision masks

Entity masks are predefined, and are always one of the following:

var player_mask = 1
var enemy_mask = 2 // for enemies
var pickup_mask = 4 // mask for bonuses and other things that can be picked up
var player_bullet_mask = 8 // for player bullets
var enemy_bullet_mask = 16 // for enemy bullets
var special_mask = 32 // for other purposes 


Tile mask values can be obtained by name using the global function getTileMaskFromExpr(mask_name).

Tile indexes and mask names can be obtained from a tile character using the
global function getTileDef(tilechar) which returns an object {tile_index,
mask_name} which can be used for calls to setTile().

