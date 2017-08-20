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
<title>CellSpace game engine</title>
<style type="text/css">
	* {color:#ddd; background-color:#000;}
	a img {border-style:none;}
	table.rule {
		padding: 8px;
	}
	table.rule td.cell {
		border: 1px solid #444;
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
		padding-bottom: 10px;
		clear: both;
		width: 160px;
		float: left;
		font-style: italic;
		font-weight: bold;
		color: #bbf;
	}
	.funcdesc {
		width: 750px;
		padding-top: 10px;
		padding-bottom: 10px;
		float: left;
		font-style: italic;
		color: #bbb;
	}
	.funcparam {
		clear: both;
		padding-left: 160px;
		padding-bottom: 5px;
		font-style: italic;
		color: #fbf;
	}
</style>
</head><body>


<div style='position: fixed; top: 30px; left: 70%; width:28%; '>

<div style='float: right;'>
<a href="http://tmtg.net/"><img src="http://tmtg.net/emergencyexit-tomato-39.png"></a>
</div>

<h2>Code</h2>

<a href="https://github.com/borisvanschooten/jgame.js"><h3>Get the code
here!</h3></a>  Some parts require PHP, the editor itself doesn't. It does
need to be run on a web server due to CORS restrictions.
<h2>Sections</h2>


<ul>
<li> <a href="#top">Top</a>
<li> <a href="#rules">Rules</a>
<li> <a href="#appearance">Appearance and animation</a>
<li> <a href="#examplegame">A complete game</a>
<li> <a href="#features">More features and function reference</a>
</ul>

<h2>CellSpace editor</h2>
<ul><li><a href="../cellspace-editor.html">The CellSpace editor</a></ul>

<h2><a name="examples"></a>Example games</h2>

<ul> 

<li> <a href="../games/simpleboulder.txt">Simpleboulder</a>
<a href="../cellspace-editor.html?edit=simpleboulder.txt">[EDIT]</a>
<a href="../cellspace-play.html?game=simpleboulder.txt">[PLAY]</a>
- the tutorial example.

<li> <a href="../games/simpleboulder.txt">Simpleboulder Enhanced</a>
<a href="../cellspace-editor.html?edit=simpleboulder-enhanced.txt">[EDIT]</a>
<a href="../cellspace-play.html?game=simpleboulder-enhanced.txt">[PLAY]</a>
- almost exactly the same, but with a hi-res tileset

<li> <a href="../games/candycanedash.txt">Candy Cane Dash</a>
<a href="../cellspace-editor.html?edit=candycanedash.txt">[EDIT]</a>
<a href="../cellspace-play.html?game=candycanedash.txt">[PLAY]</a>
demonstrates various mechanics, including growing slime and water physics.

<li><a href="../games/flushthefish.txt">Flush the Fish</a>
<a href="../cellspace-editor.html?edit=flushthefish.txt">[EDIT]</a>
<a href="../cellspace-play.html?game=flushthefish.txt">[PLAY]</a> is a water
physics based game

<li><a href="../games/onemanfirebrigade.txt">One Man Fire Brigade</a>
<a href="../cellspace-editor.html?edit=onemanfirebrigade.txt">[EDIT]</a>
<a href="../cellspace-play.html?game=onemanfirebrigade.txt">[PLAY]</a>
is a game where you have to fight a growing wildfire

<li><a href="../games/crushthecandyking.txt">Crush the Candy King</a>
<a href="../cellspace-editor.html?edit=crushthecandyking.txt">[EDIT]</a>
<a href="../cellspace-play.html?game=crushthecandyking.txt">[PLAY]</a>
is a physics platform game featuring a destructible environment.

</ul>



</div>



<div style="width: 68%;">

<h1><a name="top"></a>
<div style='float:left; padding-right: 15px; padding-bottom:15px;'><img src="cellspacelogo2_squareone-inverted.png"></div>
CellSpace game engine</h1>

CellSpace is a game engine based on cellular automata (aka cellular spaces).
It was inspired by Boulderdash and similar games, which have entities that are
little more than tiles that animate by reacting to their immediate
environment. 

The basic idea of CellSpace is that a level consists of a tile map, with a set
of simple visually oriented rules that describe how tiles are changed when
certain patterns of tiles occur.  Everything is a tile, including the player
and any other animated objects.  The engine is optimised so that it handles
large tile maps at high frame rates, and is suitable for action games with
large scrolling playfields.  With the help of animation directives, tile
changes can be made to animate smoothly.  <p>

You can create maze games, platform games and shooters, which can include game
mechanics like (simple) water physics, destructible environment, propagating
fire, and much more.

<p>

A CellSpace game is specified in a programming language called CellScript. The
CellSpace engine is based on HTML5 and WebGL, and will run on most web
browsers. An <a href="../cellspace-editor.html">online IDE</a> is available for
developing games easily.  Check out the links on the right to edit/play
the example games.

<h2><a name="rules"></a>CellScript rules</h2>


A rule consists of a tile pattern that is changed into another tile
pattern.
For example, if there is a boulder with empty space below it, we want it to
fall down.  In CellSpace, you specify it like this:

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

Notice the 3x3 grid, which is the standard grid size for a CellSpace rule.
Usually the object you want to manipulate is in the middle.  

The black squares indicate "ignore this cell", and the grey squares indicate
empty space (which is just another type of tile in our game, like the
boulder).  <p>

Right of the graphical representation of the rule, you see the corresponding
CellScript statement.  The <code>"."</code> indicates ignore, and
<code>"-"</code> and <code>"*"</code> resp. indicate empty space and boulder.
Linking characters to tile graphics is done using <code>cell:</code>
statements (see next section).

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
CellSpace we can just say that this rule should be mirrored to create a
second rule.  In CellScript code, you specify this as: <code>transform:
mirx</code>.  In case a boulder can roll both to the left and right, one rule
is chosen randomly. 
<p>

Now, let's introduce a player that can move around by pressing the WSAD keys.

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
we place multiple player tiles on the map, they will all move. 

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
and then turn.  This brings us to another CellSpace feature, namely
directions.  Each tile has a direction associated with it, which is
represented by <code>U</code>, <code>D</code>, <code>L</code>, <code>R</code>
for up/down/left/right.
Initially the direction is undefined, but we can set it using
<code>outdir:</code> and check it using <code>conddir:</code> statements.  If
we specify <code>conddir: L</code>, the monster will only move left when its
direction is left (that is, it is "facing left").  As yet,
<code>conddir:</code> only checks the center tile, which is enough for most
cases.  <code>outdir:</code> takes 9 parameters, specifying the directions to
write for each cell in the 3x3 grid when the rule is triggered.

<p>

Now, we still have to make the monster turn. We do this with the following
cellscript:

<pre>
rule: monsterturn
. . .   . . .
. M .   . . .
. . .   . . .
outdir:
- - -
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

An important feature of CellScript rules is rule delays.  These are specified
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

More details can be found in the IDE's code forms and the examples.


<h2><a name="examplegame"></a>A complete game</h2>

CellScript also includes level definition keywords, and a number of other
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
<i>CellScript: export</i> function.  A <code>tilemap:</code> statement will
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

<div class="funcdesc">returns true if the player indicates a particular
direction by a keypress or swipe.</div>

<div class="funcparam">dir: "left", "right", "up", "down" (A,D,W,S)</div>
<div class="funcparam">For twin-stick style controls, you can also use:</div>
<div class="funcparam">"left1", "right1", "up1", "down1", "left2", "right2", "up2", "down2" (A,D,W,S and J,L,I,K)</div>

<div class="func">keypress(key)</div>

<div class="funcdesc">returns: true when key is pressed</div>

<div class="func">countCells(cell_list) </div>

<div class="funcdesc">returns the number of cells of the specified type(s).
Note this actually counts all cells, so it's slow.</div>
<div class="funcparam">cell_list: a string of one or more characters
indicating cell types</div>

<div class="func">playSound(url) </div>

<div class="funcdesc">play sound from the given URL</div>

<div class="func">win()</div>

<div class="funcdesc">wins the game</div>

<div class="func">lose()</div>

<div class="funcdesc">lose the game</div>

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
