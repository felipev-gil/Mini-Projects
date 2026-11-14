# Tic Tac Toe

A two-player game for two people sharing one device.

## How to play

X starts. Players take turns selecting an empty cell. The first player to complete a row, column, or diagonal wins. A full board without a winning line is a draw. **New game** clears the board and starts with X again.

Use Tab or arrow keys to navigate cells and Enter or Space to make a move. Occupied cells remain focusable so their labels can be read, but cannot be played again. After the game ends, all moves are blocked until reset.

## Features and concepts

Explicit game state, all eight winning lines, draw detection, a responsive CSS Grid board, accessible cell labels, and announced game results. Winning cells are distinguished by a border as well as color.

## Data and dependencies

No API, external library, or saved game data. State stays in memory and resets when the page reloads.

## Limitations

Local multiplayer only; there is no computer opponent, online play, or persistent scoreboard.

Run from the repository's web server. See the [collection README](../../README.md).
