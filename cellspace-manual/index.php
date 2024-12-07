<?php

function printRule($inputs,$outputs, $code) {

	echo "<table class='rule'>";
	for ($y=0; $y<3; $y++) {
		echo "<tr>";
		for ($x=0; $x<3; $x++) {
			echo "<td class='cell'>";
			if ($inputs[$x + 3*$y]) {
				echo "<img src='".$inputs[$x + 3*$y]."tile.png'>";
			} else {
				echo "<img src='emptytile.png'>";
			}
			echo "</td>";
		}
		echo "\n<td class='arrow'>";
		if ($y==1) {
			echo "<img src='arrowtile.png'>";
		} else {
		}
		echo "</td>\n";
		for ($x=0; $x<3; $x++) {
			echo "<td class='cell'>";
			if ($outputs[$x + 3*$y]) {
				echo "<img src='".$outputs[$x + 3*$y]."tile.png'>";
			} else {
				echo "<img src='emptytile.png'>";
			}
			echo "</td>";
		}
		if ($y==0) {
			echo "<td class='code' rowspan='3'>";
			echo "<pre>$code</pre>";
			echo "</td>";
		}
		echo "</tr>\n";
	}
	echo "</table>\n";

}

?>
<html>
<head>
<link rel="shortcut icon" type="image/png" href="http://tmtg.net/cellspace/favicon.png" />
<title>Cellspace game engine</title>
<style type="text/css">
	* {color:#ddd; background-color:#000;}
	a img {border-style:none;}
	table.rule {
		padding: 8px;
	}
	table.rule td.cell {
		border: 1px solid #fff;
	}
	table.rule td.code {
		padding-left: 60px;
	}
	table.rule td.arrow {
		padding-left: 12px;
		padding-right: 12px;
	}
	code, pre {
		color: #f88;
	}
	a {
		color: #88F;
		font-weight: bold;
	}
	.func {
		padding-top: 10px;
		padding-bottom: 0px;
		clear: both;
		width: 160px;
		float: left;
		font-style: italic;
		font-weight: bold;
		color: #bbf;
	}
	.funcdesc {
		width: 750px;
		padding-left: 30px;
		padding-top: 0px;
		padding-bottom: 10px;
		float: left;
		font-style: italic;
		color: #bbb;
	}
	.funcparam {
		clear: both;
		padding-left: 120px;
		padding-bottom: 5px;
		font-style: italic;
		color: #fbf;
	}
</style>
</head><body>


<div style='position: fixed; top: 30px; left: 70%; width:28%; '>

<div style='float: right;'>
<a href="http://tmtg.nl/"><img src="http://tmtg.net/emergencyexit-tomato-39.png"></a>
</div>

<h2>Code</h2>

<a href="https://github.com/borisvanschooten/jgame.js"><h3>Get the code
here!</h3></a>  Some parts require PHP, the editor itself doesn't. It does
need to be run on a web server due to CORS restrictions.
<h2>Sections</h2>


<ul>
<li> <a href="#top">Intro and example games</a>
<li> <a href="#rules">Introduction to Cellspace Rules</a>
<li> <a href="#ide">Cellspace IDE</a>
<li> <a href="#cellscript">The Cellscript language</a>
<li> <a href="#appearance">Cell appearance and animation</a>
<li> <a href="#examplegame">A complete game</a>
<li> <a href="#features">More features and function reference</a>
</ul>

<h2>Cellspace tools</h2>
<ul>
<li><a href="../cellspace-ide.html">The Cellspace IDE</a> - Create games
with just point and click.  Exports to Cellscript.
<li><a href="../cellspace-editor.html">The Cellscript editor</a> - Create
games in the Cellscript language.  Advanced but more powerful.
</ul>



</div>



<div style="width: 68%;">

<h1><a name="top"></a>
<div style='float:left; padding-right: 15px; padding-bottom:15px;'><img src="cellspacelogo2_squareone-inverted.png"></div>
Cellspace game engine</h1>

Cellspace is a game engine based on cellular automata (aka cellular spaces).
It was inspired by Boulderdash and similar games, which have tile-based
entities that behave by just reacting to their neighbouring tiles. 

The basic idea of Cellspace is that a level consists of a tile map, with a set
of simple rules that describe how tiles are changed when certain patterns of
tiles occur.  Everything is a tile, including the player and any other
animated objects.  The engine is optimised so that it handles large tile maps,
and is suitable for action games with large scrolling playfields.  With the
help of animation directives, tile changes can be made to animate smoothly.

You can create maze games, platform games and shooters, which can include game
mechanics like water physics, destructible environment, propagating
fire, and much more.

<p>

A Cellspace game is specified in a programming language called Cellscript. The
Cellspace engine is based on HTML5 and WebGL, and will run on most web
browsers, with good support for smartphones.  There are two tools for creating
Cellspace games:

<ul>

<li><a href="../cellspace-ide.html">Cellspace IDE</a>: A point-and-click IDE,
where you can define games without any programming or knowledge of the
Cellscript syntax.  It is still under development and has some major
limitations, as it only supports a subset of the Cellscript language. Most
importantly you can define only one level with fixed size.  Also, the tileset
is fixed to 16 tiles.  It is well suited for quickly creating minigames which
you can export using a data URL.

<li><a href="../cellspace-editor.html">Cellspace editor</a>: a text editor
with code generating forms for editing and running Cellscript.  With the
editor, you can take full advantage of the Cellscript language.  You can load
and run games created in the IDE, though code you create in the editor can
generally not be loaded back into the IDE. Right click on a line number to
insert code using a code form.

</ul>


<h3>Cellspace IDE example games</h3>

<ul>

<li>
<a href="../cellspace-games/ide/platformgame.txt">Platform game</a>
<a href="../cellspace-ide.html?game=ide/platformgame.txt">[EDIT]</a>
<a href="../cellspace.html?game=ide/platformgame.txt&gametype=minimal">[PLAY]</a>

<li>
<a href="../cellspace-games/ide/escaperoom.txt">Escape room</a>
<a href="../cellspace-ide.html?game=ide/escaperoom.txt">[EDIT]</a>
<a href="../cellspace.html?game=ide/escaperoom.txt&gametype=minimal">[PLAY]</a>

<li>
<a href="../cellspace-games/ide/dousethefires.txt">Douse the fires</a>
<a href="../cellspace-ide.html?game=ide/dousethefires.txt">[EDIT]</a>
<a href="../cellspace.html?game=ide/dousethefires.txt&gametype=minimal">[PLAY]</a>

<li>
<a href="../cellspace-games/ide/cellpacman.txt">Cell pacman</a>
<a href="../cellspace-ide.html?game=ide/cellpacman.txt">[EDIT]</a>
<a href="../cellspace.html?game=ide/cellpacman.txt&gametype=minimal">[PLAY]</a>

<li>
<a href="../cellspace-games/ide/cellshooter.txt">Cell shooter</a>
<a href="../cellspace-ide.html?game=ide/cellshooter.txt">[EDIT]</a>
<a href="../cellspace.html?game=ide/cellshooter.txt&gametype=minimal">[PLAY]</a>

<li>
<a href="../cellspace-games/ide/boulderdash.txt">Boulderdash</a>
<a href="../cellspace-ide.html?game=ide/boulderdash.txt">[EDIT]</a>
<a href="../cellspace.html?game=ide/boulderdash.txt&gametype=minimal">[PLAY]</a>

<li>
<a href="../cellspace-games/ide/harveywallbangers.txt">Harvey Wallbangers</a>
<a href="../cellspace-ide.html?game=ide/harveywallbangers.txt">[EDIT]</a>
<a href="../cellspace.html?game=ide/harveywallbangers.txt&gametype=minimal">[PLAY]</a>


</ul>

<h3>Cellscript example games</h3>

<ul> 

<li> <a href="../games/simpleboulder.txt">Simpleboulder</a>
<a href="../cellspace-editor.html?edit=simpleboulder.txt">[EDIT]</a>
<a href="../cellspace.html?game=simpleboulder.txt">[PLAY]</a>
- the tutorial example.

<li> <a href="../games/simpleboulder.txt">Simpleboulder Enhanced</a>
<a href="../cellspace-editor.html?edit=simpleboulder-enhanced.txt">[EDIT]</a>
<a href="../cellspace.html?game=simpleboulder-enhanced.txt">[PLAY]</a>
- almost exactly the same, but with a hi-res tileset

<li> <a href="../games/candycanedash.txt">Candy Cane Dash</a>
<a href="../cellspace-editor.html?edit=candycanedash.txt">[EDIT]</a>
<a href="../cellspace.html?game=candycanedash.txt">[PLAY]</a>
demonstrates various mechanics, including growing slime and water physics.

<li><a href="../games/flushthefish.txt">Flush the Fish</a>
<a href="../cellspace-editor.html?edit=flushthefish.txt">[EDIT]</a>
<a href="../cellspace.html?game=flushthefish.txt">[PLAY]</a> is a water
physics based game

<li><a href="../games/onemanfirebrigade.txt">One Man Fire Brigade</a>
<a href="../cellspace-editor.html?edit=onemanfirebrigade.txt">[EDIT]</a>
<a href="../cellspace.html?game=onemanfirebrigade.txt">[PLAY]</a>
is a twin stick game where you have to fight a growing wildfire

<li><a href="../games/crushthecandyking.txt">Crush the Candy King</a>
<a href="../cellspace-editor.html?edit=crushthecandyking.txt">[EDIT]</a>
<a href="../cellspace.html?game=crushthecandyking.txt">[PLAY]</a>
is a physics platform game featuring a destructible environment.

</ul>




<h2><a name="rules"></a>Introduction to Cellspace rules</h2>

The basis of Cellspace are cellular automata rules.  You define all behaviour
by means of these rules.  A rule consists of a tile pattern that is changed
into another tile pattern.  
<p>

For example, if there is a boulder with empty space below it, we want it to
fall down.  In Cellspace, you specify it like this:

<br>
<?php
printRule(array(
	"", "", "",
	"", "boulder", "",
	"", "space", "",
), array(
	"", "", "",
	"", "space", "",
	"", "boulder", "",
),
 "rule: boulderfall . . .    . . .\n"
."                  . * .    . - .\n"
."                  . - .    . * .\n"
);
?>
A rule basically says:

<p> <i>If you see this => turn it into this.</i>
<p>

Notice the 3x3 grid, which is the standard grid size for a Cellspace rule.
Usually the object you want to manipulate is in the middle.  

The dark green squares indicate "ignore this cell", and the dark grey
squares indicate empty space (which is just another type of tile in our game,
like the boulder).  <p>

At the left, you see what the rule looks like in the IDE, at the right you see the corresponding
Cellscript statement.  The <code>"."</code> indicates ignore, and
<code>"-"</code> and <code>"*"</code> resp. indicate empty space and boulder.
Linking characters to tile graphics is done using <code>cell:</code>
statements (these are hard-coded in the IDE, see next sections for more
info).

<p>

Whenever the engine sees the 3x3 pattern on the left somewhere on the tile
map, it applies (triggers) the rule.  This results in the cells being
overwritten by the cells on the right hand side.  The empty space and boulder
are swapped, resulting in the boulder falling down one tile position.

Until a boulder hits something other than empty space, it will keep falling
down one step per update.

<p>

Every time the game updates the screen, all rules are checked against all
tiles. Lazy evaluation is used to ensure good performance for large tile
maps.  The result is written to a new tile grid, which becomes visible only
after all tiles were checked.  This ensures that rules do not interfere with
each other.  Otherwise, one rule's input could react on the output of another
within a single screen update.  Also, when two rules try to write to the same
tile, the second rule is blocked, ensuring that no tiles ever get "lost" by
overlapping outputs.

<p>

In Boulderdash, a boulder will also roll sideways when it is on top of another
boulder.  This behaviour is also easy to specify:

<p>
<?php
printRule(array(
	"", "",        "",
	"", "boulder", "space",
	"", "boulder", "space",
), array(
	"", "", "",
	"", "space", "boulder",
	"", "", "",
),
 "rule: boulderbounce . . .    . . .\n"
."                    . * -    . - *\n"
."                    . * -    . . .\n"
);
?>
<p>

Note that the boulder will only roll to the right.  We should also specify a
rule that makes it roll to the left.  Instead of specifying a second rule, in
Cellspace we can just say that this rule should be mirrored to create a second
rule.  In Cellscript, you specify this as: <code>transform: mirx</code>. The
IDE rule settings mostly follow the Cellspace terminology, and there is
a corresponding IDE <i>transform</i> setting.  In case a boulder can
roll both to the left and right, one rule is chosen randomly.  

<p>

Now, let's introduce a player that can move around by pressing the cursor keys.

<?php
printRule(array(
	"", "",        "",
	"", "player", "space",
	"", "", "",
), array(
	"", "", "",
	"", "space", "player",
	"", "", "",
),
 "rule: playermove . . .    . . .\n"
."                 . @ -    . - @\n"
."                 . . .    . . .\n"
);
?>
<p>

This rule will move any player tile on the map to the right.  However, we want
this only to happen if the right key is pressed.  We can do this by specifying
an additional condition using the <code>condfunc:</code> statement.  A
condition is just a Javascript expression that must be true in order for the
rule to trigger.  There is a built-in function <code>playerdir</code> that we
can use.  If we specify <code>condfunc: playerdir("right")</code>, then the
rule will trigger only if the "right" direction key is pressed (which is in the underlying engine translated to a cursor-right or swipe-right).  Note that if
we place multiple player tiles on the map, they will all move.  In the IDE,
controls are specified with the <i>mouse</i> and <i>keybrd</i> options. These
are translated internally into a <code>condfunc</code>.

<p>

We can now add <code>transform: rot4</code> which will rotate the rule 90,
180, and 270 degrees. The playerdir function takes the rotation angle as an
implicit parameter, and will appropriately translate "right" into
"down", "left", and "up". 


<p>

Let's spice things up with some monsters.  Creating a monster that moves
around randomly is very easy.

<?php
printRule(array(
	"", "",        "",
	"", "bug", "space",
	"", "", "",
), array(
	"", "", "",
	"", "space", "bug",
	"", "", "",
),
 "rule: monstermove . . .    . . .\n"
."                  . M -    . - M\n"
."                  . . .    . . .\n"
);
?>
<p>

If we specify <code>transform: rot4</code> for this rule, the monster will
move randomly in 4 directions.  This behaviour does not look very intelligent,
so let's say we want the monster to go straight on until it hits something,
and then turn.  This brings us to another Cellspace feature, namely
directions.  Each tile has a direction associated with it, which is
represented by <code>U</code>, <code>D</code>, <code>L</code>, <code>R</code>
for up/down/left/right.  Initially the direction is none (represented by
<code>N</code> meaning "no direction").  We can set direction using
<code>outdir:</code> and check it using <code>conddir:</code> statements.  If
we specify <code>conddir: L</code>, the monster will only move left when its
direction is left (that is, it is "facing left").  As yet,
<code>conddir:</code> only checks the center tile, which is enough for most
cases.  <code>outdir:</code> takes 9 parameters, specifying the directions
to write for each cell in the 3x3 grid when the rule is triggered.  Note that
specifying <code>-</code> indicates direction should be ignored.  The
<i>conddir</i> and <i>outdir</i> options work the same in the IDE.

</p>

Now, we still have to make the monster turn. We do this with the following
cellscript:

<?php printRule(array(
	"", "", "",
	"", "bug", "",
	"", "", "",
), array(
	"", "", "",
	"", "", "",
	"", "", "",
),
 "rule: monsterturn  . . .   . . .\n"
."                   . M .   . . .\n"
."                   . . .   . . .\n");
?>
<pre style='margin-top:0px;'>
                                  outdir: - - -
                                          - L -           
                                          - - -
                                  transform: rot4
</pre>

This will cause the monster to turn randomly. Note that the right hand side
consists of all ignores, because we are not changing any tile, just the
direction of the center tile.

This rule competes with
<code>monstermove</code>, which means one is randomly chosen.  If we want
<code>monsterturn</code> to trigger only if <code>monstermove</code> cannot be
applied, we specify <code>monstermove</code> to have a higher priority using
<code>priority: 2</code> (the default priority is 1).  We now have the desired
monster behaviour.

<p>

An important feature of Cellscript rules is rule delays.  These are specified
by the <code>delay:</code> statement.  A number indicates that the rule is
checked only once per the specified number of time ticks.  The enables
different objects to move at different speeds.


<p>

In some cases, you want a rule to trigger immediately when appropriate, and
then go into a quiescent period after the trigger.  For example, when moving
a player, you want the player to react immediately to a keypress, and then
wait for a certain amount of time before it can move again.  This can be
specified using the <code>trigger</code> keyword, followed by an identifier of
your choosing.
This creates a global timer that ticks down, pausing the rule until it reaches
zero.  For example:

<pre>
delay: 4 trigger playertimer
</pre>

This specifies that the rule triggers immediately as soon as its conditions
are met, but then will wait for 4 time ticks before it triggers again on any
cell. Any other rules referring to the same variable <code>playertimer</code>
will be similarly delayed.  
<p>

The IDE supports a single "keyboard" timer, which can be selected by setting
<i>delay</i> to one of the values ending in <i>kbd</i>, e.g. <i>3 kbd</i>.
This is useful in combination with a <i>keybrd</i> setting, resulting in
smoother control.


<h2><a name="ide"></a>Cellspace IDE</h2>

The Cellspace IDE user interface consists of several areas.  See the picture
below.

<ul>
<li>At the top is the tileset bar, where you can select a tile to draw, change
the tileset size, and load and edit the tiles.

<li>At the bottom is the game and level bar, where you can start the level
editor, restart the game, load and save, and set title and tile count based
win and lose conditions.

<li>At the middle left is the gameplay and level editor screen (switch between
them using "Edit" and "Play" buttons).

<li>At the middle right is the rules editor. Here you can set the input and
output cells of each rule, and rule settings, user input, and sound.
</ul>


<img src="cellspace-ui-explanation.png" />

<p>

The IDE currently uses a tileset with 16 tiles.  The appearance and animation
settings (as set by <code>cell:</code> statements) are hard-coded, but the tile
pixel size and tiles themselves can be changed. A detault tileset is provided.
The 16 tiles are subdivided as follows:
<br>
<img src="genericimages-explanation.png" />
<br>
The first 4 are materials, the second 4 are characters, and the last 8 are
various objects.  The tiles with a red square do not animate, the other ones
do.  Some have directional animations, in particular the tile rotates when
facing in a certain direction. The animation settings are given by the
following cell statements (for more detail see next sections):

<pre>
cell: - 0 - no - no       cell: H 4 - mirx - yes        cell: * 8 - no - yes       cell: [ 12 - rot4 - yes  
cell: # 1 - no - no       cell: P 5 - rot-mir - yes     cell: o 9 - no - yes       cell: = 13 - rot4 - no
cell: % 2 - no - no       cell: T 6 - rot4 - yes        cell: & 10 - no - yes      cell: + 14 - no - yes
cell: ~ 3 - no - yes      cell: B 7 - rot4 - yes        cell: $ 11 - no - yes      cell: @ 15 - rot4 - no 
</pre>

The rule settings are the most complex, but follow the Cellscript language
closely.  A rule can be copied and pasted using the copy/paste buttons.  You
can define <i>mouse</i> and <i>keybrd </i>triggers for each rule, which are
translated to a <code>condfunc</code> statement.  A mouse trigger involves
clicking with the mouse on the center tile.

<p> You can win or lose the game by triggering a rule, using the
<i>outfunc</i> options.

<p> For each rule, a sound can be defined, played when the rule is triggered.
If you select a sound type other than "-", a random seed appears, along with
play and random buttons.  The sound is generated by the ZzFX 8 bit style sound
generator, using the type and random seed to generate a sound.  Sounds can be
copied and pasted separately.

<h2><a name="cellscript"></a>The Cellscript language</h2>

The following sections describe the Cellscript language in more detail. A
Cellscript specification consists of 3 types of sections:

<ul>

<li>Game - You can define globals, game title, background, tile set, and cell
definitions. The game section is always at the top.

<li>Rule - A rule section starts with a <code>rule:</code> statement, followed
by any of the rule options.

<li>Level - a level section starts with a <code>level:</code> statement,
followed by the level map, and win, lose, tick statements.

</ul>

<h2><a name="appearance"></a>Cell appearance and animation</h2>

The rules use single-character symbols to represent cells. The appearance of a
cell can be specified by a <code>cell:</code> statement.  For our example, we
use the following piece of code:

<pre>
cell: -   0 - no   - no
cell: *  80 - no   - yes
cell: @   8 - no   - yes
cell: M 147 - rot4 - yes
</pre>

Each <code>cell:</code> statement is followed by:

<ul>

<li>a cellsym (a character denoting the cell)

<li>a tile number (indicating the tile to use. This refers to a tile in the
game's tilemap, counted from the top left)

<li>an image transform operation to be performed on the tile image ("-"
indicates none, "L", "R", "U" indicates left, right, and U-turn respectively;
"X" and "Y" indicate mirror X and Y.

<li>a directive specifying how the cell's direction should be translated to an
image transform operation on top of the image transform already specified,
making the tile's appearance directional. "no" indicates no operation; "rot4"
indicates rotate directly according to the direction (for top-view sprites),
"mirx" and "miry" indicate mirror in X or Y direction (mirror X would for
example be appropriate for a platform character that should only face left or
right, mirror Y for a spaceship that faces up and down), "rot-mir" indicates <a
href="http://www.arcade-museum.com/game_detail.php?game_id=10459">Wizard of
Wor</a> style orientation, suitable for maze games with side-view sprites.


<li>the initial direction of the cell

<li>a Boolean specifying whether the cell should animate

</ul>

With animations disabled, tile changes will just be shown by instantly
updating the tile map on the screen.  This will look very jumpy (in fact,
games like Boulderdash look similarly jumpy when pieces are moved).
Fortunately, tile changes can be made to look like smooth transitions, and
a series of animation frames can be specified to animate the transitions.

<p>

Smooth transitions can be specified at the cell level.  If you specify that a
cell is animated in the <code>cell:</code> statement, the engine will create a
smooth transition when it believes a cell of this type moves from one location
to another.  For this it uses the following heuristic.  When a cell of this
type moves into or away from the center cell, <i>and</i> the cell occurs only
once in both left hand side and right hand side of the rule, then it will
animate the cell.  

<p>

In some cases, you do not want certain transitions to be animated.  To disable
animations for a specific rule, you can add an <code>anim:</code> statement to
that rule.  There are four options: yes (the default), no (turn all
animations off for this rule), from-center (only animate a cell that moves
from the center), and to-center (only animate a cell that moves into the
center).

<p>

To specify animations in even more detail at the cell level, you can use
<code>cellanim:</code> statements. Here you can specify the following:

<ul>

<li>animated transitions between different cell types, either moving or
staying in the same location

<li>a sequence of animation frames and animation speed

<li>what tiles to show in the background when the animation is playing

<li>how to rotate the animation

</ul>

More details can be found in the editor's code forms and the examples.


<h2><a name="examplegame"></a>A complete game</h2>

Cellscript also includes level definition keywords, and a number of other
directives for graphical appearance, such as the image to use for a tilemap,
titles and instructions, and some shorthands.  To explain these, we will now
look at a complete example game (with one level).  Download it here: <a
href="../games/simpleboulder.txt">simpleboulder.txt</a>. 

<p>

A cellscript starts with a preamble which specifies some basic things:

<pre>
globals:
var gems=0;

gametitle: Simple Boulderdash Clone

gamedesc:
This is an example game.&lt;br&gt;
Pick up all the gems and avoid the monsters.

gamebackground: #648

tilemap: 16 16 16 16 no generictileset.png

display: 48 48

background: #444

cell: -  -1 - no - no
cell: *  80 - no - yes
cell: =  86 - no - no
cell: #  19 - no - no
cell: @   8 - no - yes
cell: M 147 - rot4 - yes
cell: D 116 - no - yes
</pre>

The most interesting part is the <code>globals:</code> definition.  Here you
can define global variables, and functions if you need to.  Note the syntax:
it's Javascript. You can put any Javascript code here, and even define your
own functions.

<p>

<code>gametitle:</code> and <code>gamedesc:</code> are self-explanatory.  Note
that line breaks in <code>gamedesc:</code> are specified by &lt;br&gt;
statements.

<p>

<code>tilemap:</code> specifies a sprite sheet with the tile graphics in it.
<code>generictileset.png</code> is a built-in tileset which contains some nice
placeholder tiles you can use to prototype a game.<p> The other parameters are
resp.: tile width/height, number of horizontal and vertical tiles in the image,
and whether the graphics should be smoothed. 

<P>

<b>NOTE</b>: in this version, there are some notable limitations to the
tilemap statements. First, the tile map must be square. This is due to
limitations of the tile engine, which will be improved in a future version.
Second, the specified URL can generally only be loaded from the website
itself (due to <a
href="https://en.wikipedia.org/wiki/Cross-origin_resource_sharing">CORS</a>
restrictions), which is pretty useless if you don't host the cellspace code
on your own server.  

<p>

The recommended way to specify your own tilemap is to use the sprite editor.
When you've got your sprites loaded in the sprite editor, use the
<i>Cellscript: export</i> function.  A <code>tilemap:</code> statement will
appear in the textarea at the bottom, which you can copy/paste into your code.
The generated tilemap statement uses a <a href="http://dataurl.net/">data
URL</a>, which embeds the image data in a base64 encoded string. Of course,
you can also encode any image you want to use into a data URL.

<p>

<code>display:</code> specifies the display size of a tile, relative to a
virtual resolution of 1920x1080.  The actual resolution is scaled to fit the
screen. Since a tile is 16x16 pixels, we specify it's blown up by a factor 3,
in case our physical display size is 1920x1080.

<p>
<code>background:</code> and <code>gamebackground:</code> specify the
background colour of resp. the levels and the title screen.
<code>background:</code> can also be defined for each individual level.
Alternatively, an image URL can be given to show as background.

<p>

We're finished with the preamble.  Let's now specify the rules:

<pre>
rule: boulderfall
. . .    . . .
. * .    . - .
. - .    . * .
priority: 2

rule: boulderbounce
. . .    . . .
. * -    . - *
. * -    . . .
transform: mirx


rule: playermove
@ - .   - @ .
condfunc: playerdir("right")
transform: rot4
delay: 3 trigger player
outdir: - R -

rule: playerdig
@ = .   - @ .
condfunc: playerdir("right")
transform: rot4
delay: 3 trigger player
outdir: - R -

rule: playerget
@ D .   - @ .
condfunc: playerdir("right")
transform: rot4
outdir: - R -
outfunc: gems--;
delay: 3 trigger player

rule: playerpush
@ * -    - @ *
condfunc: playerdir("right")
transform: mirx
delay: 3 trigger player
outdir: - R -


rule: monsterorient
. M .    . . .
outdir:
- R -
transform: rot4

rule: monstermove
. M -    . - M
conddir: R
outdir:
- - R
transform: rot4
priority: 2

rule: playerdie
. M @    . - M
priority: 3
transform: rot4
outfunc: lose()
</pre>

This mostly follows the tutorial, but includes the player digging through
earth and pushing a boulder, and being killed by a monster.  Note that most
rules only have a 1x3 cell pattern rather than a 3x3 pattern.  This is a
shorthand you can use if the top and bottom line are all "ignore" cellsyms.


<p>

Also notable is the <code>outfunc: gems--</code> statement.  If the player
picks up a gem, the global variable <code>gems</code> is decremented.
Similarly, <code>outfunc: lose()</code> calls the built-in <code>lose()</code>
function, which causes the level to fail.  There is also a <code>win()</code>
function, which completes the level.

<p>

Finally, we specify the content of a level:

<pre>
level: #

================================
=@==================*****=======
====*****===========*****=======
====*=D=*=====***===**D**=======
====*=D=*=====*D*===*****=======
====*****=====*D*===*****=======
==============***===========***=
============================*D*=
============================***=
#############################===
======*====*==*====*====*=======
========*==*====*==*=*====*==*==
===#############################
===**======M------------========
===**=------==D==-=====M-------=
===**=-=D==-=====-=====-===D==-=
===**=-====-=----M------======-=
===**=--------===D==-=D-======-=
===**=-==D===-======-==--------=
===**=-======--------=========-=
===**=M-------======----------M=
===**===========================

title: Level one
desc: 
This is level one.&lt;br&gt;
Actually, it's the only level.

init: gems=countCells("D")
win: gems<=0
</pre>

The first character after <code>level:</code> is the fill tile to use if tiles
are not defined or for tiles outside of the level boundary.  The rest of the
level statement is self-evident. 

<p> Level also has a title and description.  <code>init:</code> specifies one
or more Javascript statements for initialising variables, and
<code>win:</code> specifies an expression representing a win condition.  Also
there are <code>lose:</code>, and <code>tick:</code> (not used here), which
specifies one or more statements which should be executed at the beginning of
each screen update.


<p> A next step is to enhance the game graphically and add some sounds.  Be
sure to check out the <a href="../games/simpleboulder-enhanced.txt">enhanced
version</a> of the simpleboulder game.

<h2><a name="features"></a>More features and function reference</h2>

There are some more useful rule features you should know about.  Firstly,
the cellsyms in the left hand side of a rule can include multiple characters,
indicating any of these characters triggers the rule.  The <code>"!"</code>
character, when placed in front of the other characters, indicates "NOT" (all
cells EXCEPT the specified cells).  For example:

<pre>
rule: playermovedig
. @ !DM#   . - @
</pre>

indicates a player that can dig through anything except monsters, gems, and
solid walls.

<p>

When you have a lot of rules that refer to the same group of cell types, you
can create a shorthand using the <code>group:</code> statement. For example:

<pre>
group: %  *D
</pre>

creates a group called <code>%</code> that represents both boulders and gems.

<p>

There is also a <code>probability:</code> statement, which indicates the
probability that a rule triggers if all its conditions are met.  If multiple
rules compete and the total probability becomes more than 1, the probabilities
are interpreted as weights.  It is meaningful to specify rule probabilities
above 1 to indicate weights.

<p>

Finally, here is a short function and variable reference.

<div class="func">playerdir(dir)</div>

<div class="funcparam">dir: "left", "right", "up", "down" (A,D,W,S or cursor keys)</div>
<div class="funcparam">For twin-stick style controls, you can also use:</div>
<div class="funcparam">"left1", "right1", "up1", "down1", "left2", "right2", "up2", "down2" (A,D,W,S and cursor keys)</div>

<div class="funcdesc">returns true if the player indicates a particular
direction by a keypress or swipe.</div>

<div class="func">keypress(key)</div>

<div class="funcdesc">returns: true when key is pressed. Key is a 
single-character string.</div>

<div class="func">mousex()</div>

<div class="funcdesc">returns: tile x position of mouse</div>

<div class="func">mousey()</div>

<div class="funcdesc">returns: tile y position of mouse</div>

<div class="func">mousebutton(butnr)</div>

<div class="funcdesc">returns: state of given mouse button</div>

<div class="func">mouseclick(butnr)</div>

<div class="funcdesc">returns: true if mouse is clicked inside current tile</div>

<div class="func">countCells(cell_list) </div>

<div class="funcparam">cell_list: a string of one or more characters
indicating cell types</div>
<div class="funcdesc">returns the number of cells of the specified type(s).
Note this actually counts all cells, so it's slow.</div>

<div class="func">loadsound(name,datasource) </div>

<div class="funcdesc">Load sound. Datasource can be URL or array of floats.</div>

<div class="func">sound(url) </div>

<div class="funcdesc">play sound with given name</div>

<div class="func">win()</div>

<div class="funcdesc">wins the game</div>

<div class="func">lose()</div>

<div class="funcdesc">loses the game</div>

<div class="func">panto(x,y)</div>

<div class="funcdesc">pan the camera to center on the given position (for
scrolling playfields)</div>

<div class="func">x and y</div>

<div class="funcdesc">when referred to from a rule (that is, in condfunc and
outfunc), indicate the position of the center tile on which the rule is
applied</div>

<div style="clear:both;"></div>


<p>
This concludes the tutorial.  Check out the examples for some more
advanced usage of the engine's features.

</div>


</body></html>
