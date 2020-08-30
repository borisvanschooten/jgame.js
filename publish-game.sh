
# Copy resources to publish/ to obtain a clean package for uploading.
# Copies basic jgame, no cellspace, no editor, no i18n
# Parameter: dir of game under jgame-games/ (no trailing slash)
# Ex: publish-game.sh ld45 -> copy base libs + jgame-games/ld45/ to publish/

gamedir="${1:?Missing game directory}"

mkdir publish

sed "s/%DEFAULTGAMEDIR%/$1/" jgame.html >publish/index.html
#cp -a jgame.html publish/
cp -a jgame publish/
mkdir publish/jgame-games
cp -a jgame-games/*.js publish/jgame-games
mkdir publish/jgame-games/$gamedir
mkdir publish/jgame-games/$gamedir/images
mkdir publish/jgame-games/$gamedir/sounds
cp -a jgame-games/$gamedir/game.js publish/jgame-games/$gamedir/
# no subdirectories
cp jgame-games/$gamedir/images/* publish/jgame-games/$gamedir/images
cp jgame-games/$gamedir/sounds/* publish/jgame-games/$gamedir/sounds

