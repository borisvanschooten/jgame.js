/*@webcogs_build 0.6.0 openai-gpt-5.4 2026-05-11T07:59:21.057Z
@webcogs_system_prompt
# General instructions

You are writing Javascript functions and classes.

Use 4 spaces for indenting.  Functions are always export functions. 

## Random functions

Always use the following random functions:

random2(min, max) - generate a random float between min (inclusive) and max (exclusive)

randomstep2(min, max, interval) - generate a random number between min (inclusive) and max (inclusive) with interval steps.  For any interval=n, it creates a number which is always increments of n from min. For example, if interval=1, it creates an integer between min and max. 

srand2(seed) - seeds the random function

# Defining game maps

A map is is defined as an array of equal length strings.  Each string indicates a horizontal row of the map.  Each character in the string is translated to either a tile or a game entity. A map can be defined by a map generator function, which has the following signature:

myMapGeneratorFunction(xsize,ysize, seed, {extraParameters}) - returns an array of strings of at most the given size. xsize is the size of each string, ysize is the size of the array; seed is the random seed. Extra parameters can be added to configure the map generation, via a named parameter object, with default values for each, specified using parameter destructuring, e.g. {parameter1,parameter2,...}={}.

The minimum size that should be supported is 32x18. Make the generator function configurable.


@webcogs_user_prompt
Create a function that generates maze levels for a pac-man game, based on labyrinth generation with horizontal mirroring and extra corridors.  All empty spaces should be reachable from all other spaces.  Each tile is either wall (#), empty space (.), player (P), ghost (p), or pill (*).  Place a player, ghosts, and pills in some empty spaces.
@webcogs_end_prompt_section*/
export function generatePacManMaze(xsize, ysize, seed, {
    extraCorridorChance = 0.18,
    ghostCount = 4,
    pillCount = 4,
    mirrorGapChance = 0.12,
    borderThickness = 1
} = {}) {
    const width = Math.max(32, xsize | 0);
    const height = Math.max(18, ysize | 0);

    srand2(seed);

    const grid = Array.from({ length: height }, () => Array(width).fill('#'));
    const innerLeft = borderThickness;
    const innerTop = borderThickness;
    const innerRight = width - borderThickness - 1;
    const innerBottom = height - borderThickness - 1;

    const halfInnerWidth = Math.max(3, Math.floor((innerRight - innerLeft + 1) / 2));
    const cellCols = Math.max(2, Math.floor((halfInnerWidth - 1) / 2));
    const cellRows = Math.max(2, Math.floor((innerBottom - innerTop) / 2));

    const leftMazeWidth = cellCols * 2 + 1;
    const mazeHeight = cellRows * 2 + 1;
    const leftStartX = innerLeft;
    const topStartY = innerTop + Math.max(0, Math.floor(((innerBottom - innerTop + 1) - mazeHeight) / 2));

    const carveLeft = Array.from({ length: mazeHeight }, () => Array(leftMazeWidth).fill('#'));
    const visited = Array.from({ length: cellRows }, () => Array(cellCols).fill(false));

    function shuffleDirections() {
        const dirs = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
        ];
        for (let i = dirs.length - 1; i > 0; i--) {
            const j = randomstep2(0, i, 1);
            const tmp = dirs[i];
            dirs[i] = dirs[j];
            dirs[j] = tmp;
        }
        return dirs;
    }

    function carveCell(cx, cy) {
        visited[cy][cx] = true;
        carveLeft[cy * 2 + 1][cx * 2 + 1] = '.';
        const dirs = shuffleDirections();
        for (const [dx, dy] of dirs) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= cellCols || ny >= cellRows || visited[ny][nx]) {
                continue;
            }
            carveLeft[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = '.';
            carveCell(nx, ny);
        }
    }

    carveCell(0, 0);

    for (let cy = 0; cy < cellRows; cy++) {
        for (let cx = 0; cx < cellCols; cx++) {
            if (cx + 1 < cellCols && random2(0, 1) < extraCorridorChance) {
                carveLeft[cy * 2 + 1][cx * 2 + 2] = '.';
            }
            if (cy + 1 < cellRows && random2(0, 1) < extraCorridorChance) {
                carveLeft[cy * 2 + 2][cx * 2 + 1] = '.';
            }
        }
    }

    for (let y = 0; y < mazeHeight; y++) {
        for (let x = 0; x < leftMazeWidth; x++) {
            if (carveLeft[y][x] === '.') {
                grid[topStartY + y][leftStartX + x] = '.';
            }
        }
    }

    for (let y = topStartY; y < topStartY + mazeHeight; y++) {
        for (let x = leftStartX; x < leftStartX + leftMazeWidth; x++) {
            const mx = width - 1 - x;
            if (mx >= innerLeft && mx <= innerRight && grid[y][x] === '.') {
                grid[y][mx] = '.';
            }
        }
    }

    const centerLeft = Math.floor((width - 1) / 2);
    const centerRight = Math.ceil((width - 1) / 2);
    const corridorYs = [];
    for (let y = topStartY + 1; y < topStartY + mazeHeight - 1; y += 2) {
        corridorYs.push(y);
    }

    let guaranteedGapY = corridorYs[randomstep2(0, corridorYs.length - 1, 1)];
    for (const y of corridorYs) {
        if (y === guaranteedGapY || random2(0, 1) < mirrorGapChance) {
            grid[y][centerLeft] = '.';
            grid[y][centerRight] = '.';
        }
    }

    const emptyCells = [];
    for (let y = innerTop; y <= innerBottom; y++) {
        for (let x = innerLeft; x <= innerRight; x++) {
            if (grid[y][x] === '.') {
                emptyCells.push([x, y]);
            }
        }
    }

    function bfs(startX, startY) {
        const q = [[startX, startY]];
        const seen = new Set([startX + ',' + startY]);
        for (let i = 0; i < q.length; i++) {
            const [x, y] = q[i];
            const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            for (const [dx, dy] of dirs) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
                    continue;
                }
                if (grid[ny][nx] !== '.') {
                    continue;
                }
                const key = nx + ',' + ny;
                if (!seen.has(key)) {
                    seen.add(key);
                    q.push([nx, ny]);
                }
            }
        }
        return seen;
    }

    if (emptyCells.length > 0) {
        const seen = bfs(emptyCells[0][0], emptyCells[0][1]);
        for (const [x, y] of emptyCells) {
            if (!seen.has(x + ',' + y)) {
                grid[y][x] = '#';
            }
        }
    }

    const finalEmpty = [];
    for (let y = innerTop; y <= innerBottom; y++) {
        for (let x = innerLeft; x <= innerRight; x++) {
            if (grid[y][x] === '.') {
                finalEmpty.push([x, y]);
            }
        }
    }

    function farthestFrom(sources, candidates) {
        let best = candidates[0];
        let bestScore = -1;
        for (const [x, y] of candidates) {
            let minDist = Infinity;
            for (const [sx, sy] of sources) {
                const d = Math.abs(x - sx) + Math.abs(y - sy);
                if (d < minDist) {
                    minDist = d;
                }
            }
            if (minDist > bestScore) {
                bestScore = minDist;
                best = [x, y];
            }
        }
        return best;
    }

    function removeCell(list, cell) {
        const idx = list.findIndex(([x, y]) => x === cell[0] && y === cell[1]);
        if (idx >= 0) {
            list.splice(idx, 1);
        }
    }

    if (finalEmpty.length === 0) {
        const fallback = Array.from({ length: height }, (_, y) => (
            Array.from({ length: width }, (_, x) => (
                x === 0 || y === 0 || x === width - 1 || y === height - 1 ? '#' : '.'
            )).join('')
        ));
        return fallback;
    }

    const placeable = finalEmpty.slice();
    const centerish = placeable.slice().sort((a, b) => {
        const da = Math.abs(a[0] - width / 2) + Math.abs(a[1] - height / 2);
        const db = Math.abs(b[0] - width / 2) + Math.abs(b[1] - height / 2);
        return da - db;
    });

    const playerPos = centerish[0];
    grid[playerPos[1]][playerPos[0]] = 'P';
    removeCell(placeable, playerPos);

    const used = [playerPos];
    const ghostsToPlace = Math.min(Math.max(0, ghostCount | 0), placeable.length);
    for (let i = 0; i < ghostsToPlace; i++) {
        const ghostPos = farthestFrom(used, placeable);
        grid[ghostPos[1]][ghostPos[0]] = 'p';
        used.push(ghostPos);
        removeCell(placeable, ghostPos);
    }

    const pillsToPlace = Math.min(Math.max(0, pillCount | 0), placeable.length);
    for (let i = 0; i < pillsToPlace; i++) {
        const pillPos = farthestFrom(used, placeable);
        grid[pillPos[1]][pillPos[0]] = '*';
        used.push(pillPos);
        removeCell(placeable, pillPos);
    }

    return grid.map(row => row.join(''));
}