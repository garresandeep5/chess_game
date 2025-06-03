document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const whiteCapturedElement = document.getElementById('white-captured');
    const blackCapturedElement = document.getElementById('black-captured');
    const resetButton = document.getElementById('reset-btn');
    const undoButton = document.getElementById('undo-btn');
    
    const game = new Chess();
    
    function renderBoard() {
        // Clear the board
        boardElement.innerHTML = '';
        
        // Create squares and pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = game.board[row][col];
                if (piece) {
                    square.textContent = game.getPieceSymbol(piece);
                }
                
                // Add selected class if this is the selected piece
                if (game.selectedPiece && 
                    game.selectedPiece.row === row && 
                    game.selectedPiece.col === col) {
                    square.classList.add('selected');
                }
                
                // Add valid move indicators
                const validMove = game.validMoves.find(move => move.row === row && move.col === col);
                if (validMove) {
                    if (validMove.capture) {
                        square.classList.add('valid-capture');
                    } else {
                        square.classList.add('valid-move');
                    }
                }
                
                square.addEventListener('click', () => handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }
    }
    
    function renderStatus() {
        if (game.gameOver) {
            statusElement.textContent = `Game over! ${game.currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
        } else {
            statusElement.textContent = `${game.currentPlayer.charAt(0).toUpperCase() + game.currentPlayer.slice(1)}'s turn`;
        }
    }
    
    function renderCapturedPieces() {
        whiteCapturedElement.innerHTML = '';
        blackCapturedElement.innerHTML = '';
        
        game.capturedPieces.white.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = 'captured-piece';
            pieceElement.textContent = game.getPieceSymbol(piece);
            whiteCapturedElement.appendChild(pieceElement);
        });
        
        game.capturedPieces.black.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = 'captured-piece';
            pieceElement.textContent = game.getPieceSymbol(piece);
            blackCapturedElement.appendChild(pieceElement);
        });
    }
    
    function handleSquareClick(row, col) {
        if (game.gameOver) return;
        
        const piece = game.board[row][col];
        
        // If a piece is already selected
        if (game.selectedPiece) {
            // Try to move the selected piece
            const moved = game.movePiece(row, col);
            
            // If the move was invalid and the clicked square has a piece of the current player,
            // select that piece instead
            if (!moved && piece && piece.color === game.currentPlayer) {
                game.selectPiece(row, col);
            }
        } 
        // No piece selected yet, try to select one
        else if (piece && piece.color === game.currentPlayer) {
            game.selectPiece(row, col);
        }
        
        // Update the UI
        renderBoard();
        renderStatus();
        renderCapturedPieces();
    }
    
    resetButton.addEventListener('click', () => {
        game.resetGame();
        renderBoard();
        renderStatus();
        renderCapturedPieces();
    });
    
    undoButton.addEventListener('click', () => {
        if (game.undoMove()) {
            renderBoard();
            renderStatus();
            renderCapturedPieces();
        }
    });
    
    // Initial render
    renderBoard();
    renderStatus();
    renderCapturedPieces();
});
