# jgame.js: WebGL 2D game engine + cellular automata engine

JGame.js is a modernized JS version of the old Java/Android/J2ME/Actionscript
2D game engine JGame.  It is based on WebGL for lightning fast performance.
It includes sprite, font, and line draw functions, tile maps, game object and
collision handling, input handling, and game states. 

There are different ways you can use it. It is modular, so that you can use
only the parts you want.  You can use just the raw library (as found in
jgame/) or you can use one of several tools built on top of it. 

Firstly, there is a standard game layout (with a standard level selector
screen and some other standard features) in which you can code a game very
quickly with very little boilerplate.  A web-based IDE is under development.

Secondly, it includes the cellular automata game engine CellSpace.  This is a
unique game engine that enables you to create a complete game using just
cellular automata rules.  The rules are basically visual patterns (if you see
this, change it into this).  It is suitable for puzzle-action games like
Boulderdash.  It comes with a web-based IDE with code wizard.

