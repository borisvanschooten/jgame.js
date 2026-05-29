# Defining game maps

A map is is defined as an array of equal length strings.  Each string indicates a horizontal row of the map.  Each character in the string is translated to either a tile or a game entity. A map can be defined by a map generator function, which has the following signature:

myMapGeneratorFunction(xsize,ysize, seed, {extraParameters}) - returns an array of strings of at most the given size. xsize is the size of each string, ysize is the size of the array; seed is the random seed. Extra parameters can be added to configure the map generation, via a named parameter object, with default values for each, specified using parameter destructuring, e.g. {parameter1,parameter2,...}={}.  Add configuration parameters for anything that is meaningful to configure.  Also add configuration parameters for the map characters/tiles. For these, use the following naming pattern: [tile name]Char.

The minimum size that should be supported is 32x18. Make the generator function configurable.

