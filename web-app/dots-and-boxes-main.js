/*jslint browser */
import R from "./ramda.js";
import DotsAndBoxes from "./DotsAndBoxes.js";
// We're skipping Stats4 for the bare-bones version

// String literals
const player_colors = {
    "1": "#FF6B6B", // Red for player 1
    "2": "#4D96FF"  // Blue for player 2
};

const result_text = [
    "The game ended in a tie!",
    "Player 1 has won the game!",
    "Player 2 has won the game!"
];

const player_types = {
    "1": "Player 1",
    "2": "Player 2"
};

const game_board = document.getElementById("game_board");
const result_dialog = document.getElementById("result_dialog");

// Home player / away player are displayed on the left / right sidebars.
let home_player = document.getElementById("home_name").value;
let away_player = document.getElementById("away_name").value;
let home_player_type = 1; // Start with player 1 at home

// Initialize game state
let gameState = DotsAndBoxes.createGame(5, 5); // 5x5 grid of dots (4x4 boxes)

// This is a helper function to shorten document.getElementById
const el = (id) => document.getElementById(id);

// Setup the game board
const setupGameBoard = function() {
    // Clear any existing content
    game_board.innerHTML = "";
    
    const grid = document.createElement("div");
    grid.className = "dots-grid";
    
    // Set grid CSS properties based on the game dimensions
    grid.style.gridTemplateColumns = `repeat(${gameState.width * 2 - 1}, auto)`;
    grid.style.gridTemplateRows = `repeat(${gameState.height * 2 - 1}, auto)`;
    
    // Create the grid elements (dots, lines, and boxes)
    for (let row = 0; row < gameState.height * 2 - 1; row++) {
        for (let col = 0; col < gameState.width * 2 - 1; col++) {
            const isEvenRow = row % 2 === 0;
            const isEvenCol = col % 2 === 0;
            
            // Create grid element based on position
            const element = document.createElement("div");
            
            if (isEvenRow && isEvenCol) {
                // Dots (at even row, even column)
                element.className = "dot";
            } else if (isEvenRow) {
                // Horizontal lines (at even row, odd column)
                const horizontalRow = row / 2;
                const horizontalCol = Math.floor(col / 2);
                element.className = "h-line";
                element.dataset.row = horizontalRow;
                element.dataset.col = horizontalCol;
                element.dataset.type = DotsAndBoxes.LineType.HORIZONTAL;
                
                // If the line is already drawn, add the 'drawn' class
                if (gameState.horizontalLines[horizontalRow][horizontalCol] === 1) {
                    element.classList.add("drawn");
                } else {
                    // Add click event for drawing the line
                    element.addEventListener("click", handleLineClick);
                }
            } else if (isEvenCol) {
                // Vertical lines (at odd row, even column)
                const verticalRow = Math.floor(row / 2);
                const verticalCol = col / 2;
                element.className = "v-line";
                element.dataset.row = verticalRow;
                element.dataset.col = verticalCol;
                element.dataset.type = DotsAndBoxes.LineType.VERTICAL;
                
                // If the line is already drawn, add the 'drawn' class
                if (gameState.verticalLines[verticalRow][verticalCol] === 1) {
                    element.classList.add("drawn");
                } else {
                    // Add click event for drawing the line
                    element.addEventListener("click", handleLineClick);
                }
            } else {
                // Box spaces (at odd row, odd column)
                const boxRow = Math.floor(row / 2);
                const boxCol = Math.floor(col / 2);
                element.className = "box";
                element.dataset.row = boxRow;
                element.dataset.col = boxCol;
                
                // If the box is already claimed, add the player's color
                if (gameState.boxes[boxRow][boxCol] !== 0) {
                    const owner = gameState.boxes[boxRow][boxCol];
                    element.style.backgroundColor = player_colors[owner];
                    element.textContent = player_types[owner];
                }
            }
            
            grid.appendChild(element);
        }
    }
    
    game_board.appendChild(grid);
};

// Handle line clicks
const handleLineClick = function(event) {
    const lineElement = event.target;
    const row = parseInt(lineElement.dataset.row);
    const col = parseInt(lineElement.dataset.col);
    const lineType = lineElement.dataset.type;
    
    // Make the move in our game state
    const newGameState = DotsAndBoxes.makeMove(gameState, lineType, row, col);
    
    // If the move was valid (not undefined)
    if (newGameState) {
        gameState = newGameState;
        
        // Update the UI to reflect the new game state
        updateGameBoard();
        
        // Check if the game is over
        if (DotsAndBoxes.isGameOver(gameState)) {
            endGame();
        }
    }
};

// Update the game board to reflect the current game state
const updateGameBoard = function() {
    // Update horizontal lines
    const horizontalLines = document.querySelectorAll(".h-line");
    horizontalLines.forEach(line => {
        const row = parseInt(line.dataset.row);
        const col = parseInt(line.dataset.col);
        
        if (gameState.horizontalLines[row][col] === 1) {
            line.classList.add("drawn");
            line.removeEventListener("click", handleLineClick);
        }
    });
    
    // Update vertical lines
    const verticalLines = document.querySelectorAll(".v-line");
    verticalLines.forEach(line => {
        const row = parseInt(line.dataset.row);
        const col = parseInt(line.dataset.col);
        
        if (gameState.verticalLines[row][col] === 1) {
            line.classList.add("drawn");
            line.removeEventListener("click", handleLineClick);
        }
    });
    
    // Update boxes
    const boxes = document.querySelectorAll(".box");
    boxes.forEach(box => {
        const row = parseInt(box.dataset.row);
        const col = parseInt(box.dataset.col);
        const owner = gameState.boxes[row][col];
        
        if (owner !== 0) {
            box.style.backgroundColor = player_colors[owner];
            box.textContent = player_types[owner];
        }
    });
    
    // Update player scores and turn indicators
    el("home_score").textContent = home_player_type === 1 ? gameState.player1Score : gameState.player2Score;
    el("away_score").textContent = home_player_type === 2 ? gameState.player1Score : gameState.player2Score;
    
    // Current player's turn
    if (gameState.currentPlayer === home_player_type) {
        el("home_ready").textContent = "Your turn!";
        el("away_ready").textContent = "Wait your turn...";
    } else {
        el("home_ready").textContent = "Wait your turn...";
        el("away_ready").textContent = "Your turn!";
    }
};

// End the game and show results
const endGame = function() {
    const winner = DotsAndBoxes.getWinner(gameState);
    let result;
    let winning_player;
    
    if (winner === 0) {
        result = 0;
        el("result_winner").textContent = "It's a tie!";
    } else if (winner === 1) {
        result = 1;
        winning_player = home_player_type === 1 ? home_player : away_player;
        el("result_winner").textContent = `${winning_player} wins!`;
    } else {
        result = 2;
        winning_player = home_player_type === 2 ? home_player : away_player;
        el("result_winner").textContent = `${winning_player} wins!`;
    }
    
    el("result_message").textContent = result_text[result];
    
    result_dialog.showModal();
};

// Reset the game when dialog is closed
result_dialog.onclick = function() {
    gameState = DotsAndBoxes.createGame(5, 5);
    home_player_type = 3 - home_player_type; // Swap player types (1->2, 2->1)
    updatePlayerTypes();
    setupGameBoard();
    result_dialog.close();
};

result_dialog.onkeydown = result_dialog.onclick;

// Update player type display in the UI
const updatePlayerTypes = function() {
    el("home_player_type").textContent = player_types[home_player_type];
    el("away_player_type").textContent = player_types[3 - home_player_type];
    
    // Update player colors
    el("home_player_color").style.backgroundColor = player_colors[home_player_type];
    el("away_player_color").style.backgroundColor = player_colors[3 - home_player_type];
};

// Initialize the game
const initGame = function() {
    home_player = el("home_name").value || "Player 1";
    away_player = el("away_name").value || "Player 2";
    
    // Add event listeners to name inputs
    el("home_name").addEventListener("change", function() {
        home_player = this.value || "Player 1";
    });
    
    el("away_name").addEventListener("change", function() {
        away_player = this.value || "Player 2";
    });
    
    updatePlayerTypes();
    setupGameBoard();
};

// Start the game when the page loads
window.addEventListener("load", initGame); 