# Browser-based Chess Game

A simple chess game that runs in your web browser.

## Features

- Full chess game with all standard rules
- Piece movement validation
- Captured pieces display
- Undo move functionality
- Game state tracking
- Responsive design for different screen sizes

## Installation

1. Make sure you have Python installed (Python 3.6 or higher recommended)

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Game

1. Navigate to the chess_game directory:
   ```
   cd chess_game
   ```

2. Run the Flask application:
   ```
   python app.py
   ```

3. Open your web browser and go to:
   ```
   http://localhost:5000
   ```

## How to Play

- Click on a piece to select it
- Valid moves will be highlighted
- Click on a highlighted square to move the selected piece
- Use the "Undo Move" button to take back a move
- Use the "New Game" button to reset the board

## Project Structure

- `app.py` - Flask web server
- `templates/` - HTML templates
- `static/` - Static assets (CSS, JavaScript)
  - `css/style.css` - Game styling
  - `js/chess.js` - Chess game logic
  - `js/app.js` - UI interaction code
