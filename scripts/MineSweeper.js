/*
 *  MineSweeper.js 
 *  
 *  Manages a div element representing a game board and div elements representing individual cells
 *  as well as all game logic.
 * 
 */

var grid = new Array(1);
var cellSize = 24;
var size = 0;
var mines = 0;
var gameOver = false;
var time = 0;
var timer = null;
// Adjacent mine colors
var colors = [ '#a9ecf5', '#cef5a9', '#f79494', '#ca94f7', '#f794dd','#59ebcb','#ebb359','#dce3e3'];

// Adds event listener to the start button
function bindNewButton() {
    let newButton = document.getElementById("new-game");
    newButton.addEventListener('click', (e) => {startNewGame();})
}

// Removes current game-grid and calls newGame
function startNewGame() {
    gameOver = false;
    let game = document.getElementById('game-grid');
    game.parentNode.removeChild(game);

    // Get the size and mines from the game settings
    let s = document.getElementById("size-slider").value;
    let m = document.getElementById("mine-slider").value;
    newGame(s, m);
}

// Updates the timer every second
function updateTime() {
    time++;
    let t = document.getElementById("time");
    t.value = Math.floor(time / 60) + ":" + ((time % 60 < 10) ? '0' + time % 60 : time % 60);
}

// Creates a new game-grid element and generates the game data
function newGame(s, m) {
    size = s;
    // Adjust the cell size for large boards
    if (size > 20)
        cellSize = Math.floor(Math.max(8, 24 / (size / 20)));
    else
        cellSize = 24;

    // Initialize the first dimension of grid
    grid = new Array(size);

    // Initilialize the second dimension of grid
    for (let i = 0; i < size; i++) {
        grid[i] = new Array(size);
    }

    // Get the game-container element
    let container = document.getElementById('game-container');
    
    // Create a new game-grid div element
    game = document.createElement('div');
    game.id = "game-grid";
    
    // Add the game-grid to the game-container
    container.appendChild(game);

    // Loop through the grid to initialize default values
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            // Third dimension for additional properties
            grid[x][y] = new Array(3);
            grid[x][y][0] = 1;      // Adjacent mine count (+1)
            grid[x][y][1] = false;  // Cell clicked
            grid[x][y][2] = false;  // Cell flagged

            // Create a new cell div element
            let cell = document.createElement('div');
            // Set the id and class
            cell.id = "cell-"+x+'-'+y;
            cell.className = 'grid-square';
            cell.style.fontSize = cellSize * 0.75 + 'px ';
            cell.style.lineHeight = cellSize + 'px';
            // Append to game-grid element
            game.appendChild(cell);

            // Prevents context menu on game-grid
            cell.addEventListener("contextmenu", (e) => { e.preventDefault(); return false; } );
            // Add event listeners for right and left clicking
            cell.addEventListener('mouseup', (e) => {
                if (e.button == 0)
                    click(x, y, cell);
                else  if (e.button == 2)
                    flag(x, y, cell);
            });
            
        }
    }

    // Set the mines for this game
    mines = m;

    // Place mines
    while(m > 0) {
        m--;
        
        // Get a random grid coordinate
        let x = Math.floor(Math.random() * size);
        let y = Math.floor(Math.random() * size);

        // If this cell is not a bomb
        if (grid[x][y][0] > 0) {
            // Set cell to bomb
            grid[x][y][0] = 0;

            // Get the surrounding coordinates clamped to the board indices
            let up = Math.max(0, y - 1); let down = Math.min(size - 1, y + 1);
            let left = Math.max(0, x - 1); let right = Math.min(size - 1, x + 1);
            
            // Iterate between the surrounding coordinates
            for(let j = up; j <= down; j++) {
                for(let i = left; i <= right; i++) {
                    // If the cell at i,j is this cell, or is already a menu, continue
                    if (i == x && j == y || grid[i][j][0] == 0) continue;
                    // Increment the adjacent mine count
                    grid[i][j][0]++;
                }
            }
        }
    }

    // Set the size and position of the game-grid
    let gr = document.getElementById("game-grid");
    gr.style.gridTemplateColumns = (cellSize + 'px ').repeat(size);
    gr.style.gridTemplateRows = (cellSize + 'px ').repeat(size);
    gr.style.width = size * cellSize + 'px';
    gr.style.height = size * cellSize + 'px';
    gr.style.marginLeft = -(size * cellSize) / 2 + 'px';
    gr.style.marginTop = gr.style.marginLeft;

    // Position container
    let w = size * cellSize + cellSize;
    container.style.width = w + 'px';
    container.style.marginLeft = -(size * cellSize) / 2 + 'px';

    // Position controls
    let controls = document.getElementById("controls");
    controls.style.width = size * cellSize + 'px';
    controls.style.marginLeft = -(size * cellSize) / 2 + 'px';
    controls.style.marginTop = -(size * cellSize) / 2 - 32 + 'px';

    controls = document.getElementById("settings-button");
    controls.style.left = ((size - 1) * cellSize) +2 +"px";
    controls = document.getElementById("time");
    controls.style.left = "0px";

    // Reset face
    let face = document.getElementById("new-game");
    face.style.backgroundImage = "url('images/smiley.png')";
    face.style.left = (size * cellSize) / 2 -12 +"px";

    // Reset timer
    if (timer != null)
        clearInterval(timer);
    timer = null;
    time = 0;
    let t = document.getElementById("time").value = '0:00';
}

// Cell left clicked
function click(x, y, cell) {
    if (timer == null) {
        // Start timer
        timer = setInterval(updateTime, 1000);
    }
    // If cell is already clicked, flagged or game is over, return
    if (grid[x][y][1] || grid[x][y][2] || gameOver) return;
    
    // If cell is mine
    if (grid[x][y][0] == 0) {
        // Show all mines and wrong flags
        cell.style.backgroundImage = "url('images/tile_mine.png')";
        for(let j = 0; j < size; j++) {
            for(let i = 0; i < size; i++) {
                let next = document.getElementById("cell-"+i+'-'+j);
                // Skip this cell, cells that are clicked, cells that are not clicked and are not mines and are not flagged
                if (i == x && j == y || grid[i][j][1] || (!grid[i][j][1] && !grid[i][j][2] && grid[i][j][0] > 0)) 
                    continue;
                // Stop the timer
                clearInterval(timer);
                // Show mines
                if (grid[i][j][0] == 0) {
                    next.style.backgroundImage = "url('images/tile_mine2.png')";
                } else {
                    // Show false flags
                    next.style.backgroundImage = "url('images/tile_wrong.png')";
                }
            }
        }
        // Set face to dead
        let face = document.getElementById("new-game");
        face.style.backgroundImage = "url('images/smiley_lose.png')";

        // Stop timer
        clearInterval(timer);

        // Game over
        gameOver = true;
        return;
    } else if (grid[x][y][0] == 1) {
        // If this cell has no mines adjacent, clear adjacent cells
        clearNeighbours(x, y);
    } else {
        // Display the number of adjacent mines and set the color
        cell.innerHTML = grid[x][y][0] - 1;
        cell.style.color = colors[grid[x][y][0] - 2];
        cell.style.backgroundImage = "url('images/tile_blank.png')";
    }
    
    // Set the cell to clicked
    grid[x][y][1] = true;
    
    // Check if we have a win condition
    checkWin();
}

// Right click cell
function flag(x, y, cell) {
    
    // If the cell is clicked or game is over, we cannot flag this cell
    if (grid[x][y][1] == true || gameOver) return;
    
    // If the cell has no adjacent mines, click it to sweep nearby cells
    if (grid[x][y][0] == 1) { click(x, y, cell); return;}
    
    // Invert flag
    grid[x][y][2] = !grid[x][y][2];

    // Set the background image to reflect flag status
    if (grid[x][y][2])
        cell.style.backgroundImage = "url('images/tile_flag.png')";
    else
    cell.style.backgroundImage = "url('images/tile.png')";

    // Check if we have a win condition from flagging all mines
    checkWin();

}

// Clears adjacent cells of a cell that has no adjacent mines
function clearNeighbours(x, y) {
    // If cell is already cleared, return
    if (grid[x][y][0] != 1) return;

    // Get the surrounding indices
    let up = Math.max(0, y - 1);let down = Math.min(size - 1, y + 1); 
    let left = Math.max(0, x - 1);let right = Math.min(size - 1, x + 1);

    // Get the cell at this location and set it's background image to blank
    let cell = document.getElementById("cell-"+x+'-'+y);
    cell.style.backgroundImage = "url('images/tile_blank.png')";

    // Iterate through adjacent coordinates
    for(let j = up; j <= down; j++) {
        for(let i = left; i <= right; i++) {
            
            // Get the cell at current location
            let next = document.getElementById("cell-"+i+'-'+j);

            // Skip if it is the original cell or cell is already cleared
            if (i == x && j == y || grid[i][j][1]) continue;

            // If the cell also has no adjacent mines
            if (grid[i][j][0] == 1) {
                // Set the image to blank
                next.style.backgroundImage = "url('images/tile_blank.png')";
                // Set the cell to clicked
                grid[i][j][1] = true;
                // Clear the adjacent cells of this cell
                clearNeighbours(i, j);   
            } else {
                // If the cell has adjacent mines reveal it but not it's neighbours
                click(i, j, next);
            }
        }
    }
}

// Check for win condition
function checkWin() {

    // Cleared is the amount of cells minus the amount of mines
    let cleared = size * size - mines;

    // For recording flagged cells
    let flagged = 0;
    let falseFlag = 0;

    // Iterate through every cell
    for(let y = 0; y < size; y++) {
        for(let x = 0; x < size; x++) {
            // If the cell is flagged
            if (grid[x][y][2]) {
                // If the cell is a mine, increment flagged
                if (grid[x][y][0] == 0)
                    flagged++
                else
                // If it is flagged but not a mine increment falseFlag
                    falseFlag++;
            }
            // If the cell is cleared and not a mine, decrement cleared
            if (grid[x][y][1] && grid[x][y][0] > 0)  cleared--;
        }
    }

    // If cleared is 0, the only cells left are mines
    // If all flags have been placed on mines, we have located all mines
    if (cleared == 0 || flagged - falseFlag == mines) {
        // Set game over to true
        gameOver = true;
        
        // Stop the timer
        clearInterval(timer);

        // Set the face to cool guy cos you won
        let face = document.getElementById("new-game");
        face.style.backgroundImage = "url('images/smiley_win.png')";
    }
}
