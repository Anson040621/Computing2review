import R from "./ramda.js";
/**
 * DotsAndBoxes.js is a module to model and play the "Dots and Boxes" game.
 * https://en.wikipedia.org/wiki/Dots_and_Boxes
 * @namespace DotsAndBoxes
 * @author Original: A. Freddie Page, Adaptation: Anonymous
 * @version 2023/24
 */
const DotsAndBoxes = Object.create(null);

/**
 * In Dots and Boxes, we represent the game state with three main components:
 * 1. A grid of dots (the intersections)
 * 2. Horizontal lines between dots
 * 3. Vertical lines between dots
 * 4. Boxes that are claimed by players
 * 
 * The grid has dimensions (width x height) in dots.
 * This means there are (width-1) x (height-1) potential boxes.
 */

/**
 * A token is a marker that players place when they complete a box.
 * @memberof DotsAndBoxes
 * @typedef {(1 | 2)} Token
 */

/**
 * Represents a box that may be empty or claimed by a player.
 * @memberof DotsAndBoxes
 * @typedef {(DotsAndBoxes.Token | 0)} Box_state
 */

/**
 * A set of template token strings for UI representation.
 * @memberof DotsAndBoxes
 * @enum {string[]}
 * @property {string[]} default ["⬜", "🟥", "🟦"] Empty, Player 1, Player 2
 * @property {string[]} colors ["⬜", "🔴", "🔵"] Empty, Red, Blue
 */
DotsAndBoxes.token_strings = Object.freeze({
    "default": ["⬜", "🟥", "🟦"],
    "colors": ["⬜", "🔴", "🔵"]
});

/**
 * A line can be either undrawn or drawn.
 * @memberof DotsAndBoxes
 * @typedef {(0 | 1)} Line_state
 */

/**
 * Game state containing all information about the current game.
 * @memberof DotsAndBoxes
 * @typedef {Object} GameState
 * @property {number} width Number of dots horizontally
 * @property {number} height Number of dots vertically
 * @property {DotsAndBoxes.Line_state[][]} horizontalLines 2D array of horizontal lines
 * @property {DotsAndBoxes.Line_state[][]} verticalLines 2D array of vertical lines
 * @property {DotsAndBoxes.Box_state[][]} boxes 2D array of box ownership
 * @property {number} currentPlayer Current player (1 or 2)
 * @property {number} player1Score Score of player 1
 * @property {number} player2Score Score of player 2
 * @property {boolean} extraTurn Whether the current player gets an extra turn
 */

/**
 * Creates a new empty game state for Dots and Boxes.
 * @memberof DotsAndBoxes
 * @function
 * @param {number} [width=5] The width of the grid in dots
 * @param {number} [height=5] The height of the grid in dots
 * @returns {DotsAndBoxes.GameState} An empty game state for starting a game
 */
DotsAndBoxes.createGame = function(width = 5, height = 5) {
    // Initialize horizontal lines (width-1 x height)
    const horizontalLines = Array(height)
        .fill()
        .map(() => Array(width - 1).fill(0));
    
    // Initialize vertical lines (width x height-1)
    const verticalLines = Array(height - 1)
        .fill()
        .map(() => Array(width).fill(0));

    // Initialize boxes (width-1 x height-1)
    const boxes = Array(height - 1)
        .fill()
        .map(() => Array(width - 1).fill(0));
        
    return {
        width,
        height,
        horizontalLines,
        verticalLines,
        boxes,
        currentPlayer: 1,
        player1Score: 0,
        player2Score: 0,
        extraTurn: false
    };
};

/**
 * Line type enumeration.
 * @memberof DotsAndBoxes
 * @enum {string}
 */
DotsAndBoxes.LineType = Object.freeze({
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical"
});

/**
 * Checks if a line is already drawn.
 * @memberof DotsAndBoxes
 * @function
 * @param {DotsAndBoxes.GameState} gameState The current game state
 * @param {DotsAndBoxes.LineType} lineType The type of line (horizontal or vertical)
 * @param {number} row The row index of the line
 * @param {number} col The column index of the line
 * @returns {boolean} True if the line is already drawn
 */
DotsAndBoxes.isLineDrawn = function(gameState, lineType, row, col) {
    if (lineType === DotsAndBoxes.LineType.HORIZONTAL) {
        return gameState.horizontalLines[row][col] === 1;
    } else {
        return gameState.verticalLines[row][col] === 1;
    }
};


/**
 * Checks if a move is valid.
 * @memberof DotsAndBoxes
 * @function
 * @param {DotsAndBoxes.GameState} gameState The current game state
 * @param {DotsAndBoxes.LineType} lineType The type of line (horizontal or vertical)
 * @param {number} row The row index of the line
 * @param {number} col The column index of the line
 * @returns {boolean} True if the move is valid
 */
DotsAndBoxes.isValidMove = function(gameState, lineType, row, col) {
    // Check if indices are within bounds
    if (lineType === DotsAndBoxes.LineType.HORIZONTAL) {
        if (row < 0 || row >= gameState.height || col < 0 || col >= gameState.width - 1) {
            return false;
        }
    } else {
        if (row < 0 || row >= gameState.height - 1 || col < 0 || col >= gameState.width) {
            return false;
        }
    }
    
    // Check if the line is already drawn
    return !DotsAndBoxes.isLineDrawn(gameState, lineType, row, col);
};

/**
 * Checks if drawing a line completes one or more boxes.
 * @memberof DotsAndBoxes
 * @function
 * @param {DotsAndBoxes.GameState} gameState The current game state
 * @param {DotsAndBoxes.LineType} lineType The type of line (horizontal or vertical)
 * @param {number} row The row index of the line
 * @param {number} col The column index of the line
 * @returns {Array<{row: number, col: number}>} Array of boxes that would be completed
 */
DotsAndBoxes.checkBoxCompletion = function(gameState, lineType, row, col) {
    const completedBoxes = [];
    
    if (lineType === DotsAndBoxes.LineType.HORIZONTAL) {
        // Check box above (if not at top row)
        if (row > 0) {
            const boxRow = row - 1;
            const boxCol = col;
            
            // Check if other 3 sides of this box are already drawn
            if (
                gameState.horizontalLines[boxRow][boxCol] === 1 && // top
                gameState.verticalLines[boxRow][boxCol] === 1 && // left
                gameState.verticalLines[boxRow][boxCol + 1] === 1 // right
            ) {
                completedBoxes.push({ row: boxRow, col: boxCol });
            }
        }
        
        // Check box below (if not at bottom row)
        if (row < gameState.height - 1) {
            const boxRow = row;
            const boxCol = col;
            
            // Check if other 3 sides of this box are already drawn
            if (
                gameState.horizontalLines[boxRow + 1][boxCol] === 1 && // bottom
                gameState.verticalLines[boxRow][boxCol] === 1 && // left
                gameState.verticalLines[boxRow][boxCol + 1] === 1 // right
            ) {
                completedBoxes.push({ row: boxRow, col: boxCol });
            }
        }
    } else {
        // VERTICAL line
        // Check box to the left (if not at leftmost column)
        if (col > 0) {
            const boxRow = row;
            const boxCol = col - 1;
            
            // Check if other 3 sides of this box are already drawn
            if (
                gameState.horizontalLines[boxRow][boxCol] === 1 && // top
                gameState.horizontalLines[boxRow + 1][boxCol] === 1 && // bottom
                gameState.verticalLines[boxRow][boxCol] === 1 // left
            ) {
                completedBoxes.push({ row: boxRow, col: boxCol });
            }
        }
        
        // Check box to the right (if not at rightmost column)
        if (col < gameState.width - 1) {
            const boxRow = row;
            const boxCol = col;
            
            // Check if other 3 sides of this box are already drawn
            if (
                gameState.horizontalLines[boxRow][boxCol] === 1 && // top
                gameState.horizontalLines[boxRow + 1][boxCol] === 1 && // bottom
                gameState.verticalLines[boxRow][boxCol + 1] === 1 // right
            ) {
                completedBoxes.push({ row: boxRow, col: boxCol });
            }
        }
    }
    
    return completedBoxes;
};

/**
 * Makes a move in the game by drawing a line.
 * @memberof DotsAndBoxes
 * @function
 * @param {DotsAndBoxes.GameState} gameState The current game state
 * @param {DotsAndBoxes.LineType} lineType The type of line (horizontal or vertical)
 * @param {number} row The row index of the line
 * @param {number} col The column index of the line
 * @returns {DotsAndBoxes.GameState | undefined} The new game state after the move, or undefined if the move is invalid
 */
DotsAndBoxes.makeMove = function(gameState, lineType, row, col) {
    // Create a deep copy of the game state to avoid mutating the original
    const newGameState = JSON.parse(JSON.stringify(gameState));
    
    // Check if the move is valid
    if (!DotsAndBoxes.isValidMove(gameState, lineType, row, col)) {
        return undefined;
    }
    
    // Draw the line
    if (lineType === DotsAndBoxes.LineType.HORIZONTAL) {
        newGameState.horizontalLines[row][col] = 1;
    } else {
        newGameState.verticalLines[row][col] = 1;
    }
    
    // Check if any boxes were completed
    const completedBoxes = DotsAndBoxes.checkBoxCompletion(newGameState, lineType, row, col);
    
    // If boxes were completed, assign them to the current player and award points
    if (completedBoxes.length > 0) {
        const currentPlayer = newGameState.currentPlayer;
        
        completedBoxes.forEach(({ row, col }) => {
            newGameState.boxes[row][col] = currentPlayer;
        });
        
        // Update scores
        if (currentPlayer === 1) {
            newGameState.player1Score += completedBoxes.length;
        } else {
            newGameState.player2Score += completedBoxes.length;
        }
        
        // Player gets an extra turn when completing a box
        newGameState.extraTurn = true;
    } else {
        // Switch to the other player if no boxes were completed
        newGameState.currentPlayer = newGameState.currentPlayer === 1 ? 2 : 1;
        newGameState.extraTurn = false;
    }
    
    return newGameState;
};

/**
 * Checks if the game has ended (all possible lines have been drawn).
 * @memberof DotsAndBoxes
 * @function
 * @param {DotsAndBoxes.GameState} gameState The current game state
 * @returns {boolean} True if the game has ended
 */
DotsAndBoxes.isGameOver = function(gameState) {
    // Check if all horizontal lines are drawn
    const allHorizontalLinesDrawn = gameState.horizontalLines.every(row => 
        row.every(line => line === 1)
    );
    
    // Check if all vertical lines are drawn
    const allVerticalLinesDrawn = gameState.verticalLines.every(row => 
        row.every(line => line === 1)
    );
    
    return allHorizontalLinesDrawn && allVerticalLinesDrawn;
};

/**
 * Gets the winner of the game.
 * @memberof DotsAndBoxes
 * @function
 * @param {DotsAndBoxes.GameState} gameState The current game state
 * @returns {(1 | 2 | 0)} 1 if player 1 won, 2 if player 2 won, 0 if it's a tie
 */
DotsAndBoxes.getWinner = function(gameState) {
    if (gameState.player1Score > gameState.player2Score) {
        return 1;
    } else if (gameState.player2Score > gameState.player1Score) {
        return 2;
    } else {
        return 0; // Tie
    }
};

/**
 * Gets all valid moves for the current game state.
 * @memberof DotsAndBoxes
 * @function
 * @param {DotsAndBoxes.GameState} gameState The current game state
 * @returns {Array<{type: DotsAndBoxes.LineType, row: number, col: number}>} Array of valid moves
 */
DotsAndBoxes.getValidMoves = function(gameState) {
    const validMoves = [];
    
    // Check horizontal lines
    for (let row = 0; row < gameState.height; row++) {
        for (let col = 0; col < gameState.width - 1; col++) {
            if (gameState.horizontalLines[row][col] === 0) {
                validMoves.push({
                    type: DotsAndBoxes.LineType.HORIZONTAL,
                    row,
                    col
                });
            }
        }
    }
    
    // Check vertical lines
    for (let row = 0; row < gameState.height - 1; row++) {
        for (let col = 0; col < gameState.width; col++) {
            if (gameState.verticalLines[row][col] === 0) {
                validMoves.push({
                    type: DotsAndBoxes.LineType.VERTICAL,
                    row,
                    col
                });
            }
        }
    }
    
    return validMoves;
};

/**
 * Returns a string representation of the game state.
 * @memberof DotsAndBoxes
 * @function
 * @param {DotsAndBoxes.GameState} gameState The game state to represent
 * @returns {string} String representation of the game state
 */
DotsAndBoxes.toString = function(gameState) {
    let result = "";
    
    for (let row = 0; row < gameState.height; row++) {
        // Draw horizontal lines for this row
        let horizontalLine = "";
        for (let col = 0; col < gameState.width; col++) {
            horizontalLine += "•"; // Dot
            
            // Draw horizontal line to the right if not at the rightmost column
            if (col < gameState.width - 1) {
                horizontalLine += gameState.horizontalLines[row][col] === 1 ? "───" : "   ";
            }
        }
        result += horizontalLine + "\n";
        
        // Draw vertical lines and boxes for this row if not at the bottom row
        if (row < gameState.height - 1) {
            let verticalLine = "";
            for (let col = 0; col < gameState.width; col++) {
                verticalLine += gameState.verticalLines[row][col] === 1 ? "|" : " ";
                
                // Draw box content if not at the rightmost column
                if (col < gameState.width - 1) {
                    const boxContent = gameState.boxes[row][col] === 0 ? "   " : 
                                       gameState.boxes[row][col] === 1 ? " 1 " : " 2 ";
                    verticalLine += boxContent;
                }
            }
            result += verticalLine + "\n";
        }
    }
    
    return result;
};

// Export the module
export default DotsAndBoxes; 