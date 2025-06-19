# Dots and Boxes
# CID: 0244 1156
# Student: Cheng Chik Hin (Anson)
A [Dots and Boxes](https://en.wikipedia.org/wiki/Dots_and_Boxes) game implemented in pure JavaScript. This project was converted from a Connect Four game as part of a programming exercise.

## Game Description

Dots and Boxes is a classic pencil-and-paper game for two players. The game starts with an empty grid of dots. Players take turns adding a single horizontal or vertical line between two adjacent dots. When a player completes the fourth side of a box, they claim that box by coloring it in and must play again. The game ends when all lines have been drawn and all boxes have been claimed. The player with the most boxes wins.

## Implementation

The game is implemented using pure JavaScript with the following components:

- `DotsAndBoxes.js`: Core game logic module with pure functions
- `dots-and-boxes-main.js`: Frontend integration and event handling
- `dots-and-boxes.css`: Styling for the game UI
- `dots-and-boxes.html`: HTML structure for the game

## How to Play

1. Open `web-app/dots-and-boxes.html` in your web browser
2. Players take turns clicking on the lines between dots
3. When a player completes a box, they get another turn
4. The game ends when all boxes are claimed
5. The player with the most boxes wins

## Installation

* Clone the repository
* Run `npm install` in the root directory to install dependencies (ramda)
* Open `web-app/dots-and-boxes.html` in a web browser

## Technical Details

The game uses a functional approach where the game state is never mutated directly. Each move creates a new game state based on the previous one. The core game logic is separated from the UI, making the code more maintainable and testable.
