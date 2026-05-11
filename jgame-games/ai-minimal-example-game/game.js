// example game built with AI layer -------------------------------

GameConfig.title = "My Game"
//GameConfig.gamedir = "jgame-games/gameskeleton/"

GameConfig.loadGame = async function() {
	GameConfig.levels = await loadJSON("levels.json")
	tilemapping = await loadJSON("tilemapping.json")
	spritedefs = await loadJSON("sprites.json")
}
