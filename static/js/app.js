document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const whiteCapturedElement = document.getElementById('white-captured');
    const blackCapturedElement = document.getElementById('black-captured');
    const resetButton = document.getElementById('reset-btn');
    const undoButton = document.getElementById('undo-btn');
    const gameModeRadios = document.querySelectorAll('input[name="game-mode"]');
    const computerColorRadios = document.querySelectorAll('input[name="computer-color"]');
    const computerColorDiv = document.querySelector('.computer-color');
    
    const game = new Chess();
    
    // Game mode selection
    gameModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const vsComputer = e.target.value === 'vs-computer';
            computerColorDiv.style.display = vsComputer ? 'block' : 'none';
            
            const computerColor = document.querySelector('input[name="computer-color"]:checked').value;
            game.setGameMode(vsComputer, computerColor);
            
            // Reset the game when changing mode
            game.resetGame();
            renderBoard();
            renderStatus();
            renderCapturedPieces();
            
            // If computer is white, make the first move
            if (vsComputer && computerColor === 'white') {
                setTimeout(() => {
                    game.makeComputerMove();
                    renderBoard();
                    renderStatus();
                    renderCapturedPieces();
                }, 500);
            }
        });
    });
    
    computerColorRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (document.querySelector('input[name="game-mode"]:checked').value === 'vs-computer') {
                const computerColor = e.target.value;
                game.setGameMode(true, computerColor);
                
                // Reset the game when changing computer color
                game.resetGame();
                renderBoard();
                renderStatus();
                renderCapturedPieces();
                
                // If computer is white, make the first move
                if (computerColor === 'white') {
                    setTimeout(() => {
                        game.makeComputerMove();
                        renderBoard();
                        renderStatus();
                        renderCapturedPieces();
                    }, 500);
                }
            }
        });
    });
    
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
        
        // If it's computer's turn, don't allow player to move
        if (game.vsComputer && game.currentPlayer === game.computerColor) {
            return;
        }
        
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
        
        // If it's now the computer's turn, make a move after a short delay
        if (!game.gameOver && game.vsComputer && game.currentPlayer === game.computerColor) {
            setTimeout(() => {
                game.makeComputerMove();
                renderBoard();
                renderStatus();
                renderCapturedPieces();
            }, 500);
        }
    }
    
    resetButton.addEventListener('click', () => {
        game.resetGame();
        renderBoard();
        renderStatus();
        renderCapturedPieces();
        
        // If computer plays white, make the first move
        if (game.vsComputer && game.computerColor === 'white') {
            setTimeout(() => {
                game.makeComputerMove();
                renderBoard();
                renderStatus();
                renderCapturedPieces();
            }, 500);
        }
    });
    
    undoButton.addEventListener('click', () => {
        // In computer mode, undo both the computer's move and the player's move
        if (game.vsComputer) {
            if (game.undoMove()) {
                // If the current player is the human player, undo one more move
                // to get back to the human player's turn
                if (game.currentPlayer !== game.computerColor) {
                    game.undoMove();
                }
                renderBoard();
                renderStatus();
                renderCapturedPieces();
            }
        } else {
            // In two-player mode, just undo one move
            if (game.undoMove()) {
                renderBoard();
                renderStatus();
                renderCapturedPieces();
            }
        }
    });
    
    // Initialize game mode
    const vsComputer = document.querySelector('input[name="game-mode"]:checked').value === 'vs-computer';
    const computerColor = document.querySelector('input[name="computer-color"]:checked').value;
    computerColorDiv.style.display = vsComputer ? 'block' : 'none';
    game.setGameMode(vsComputer, computerColor);
    
    // Initial render
    renderBoard();
    renderStatus();
    renderCapturedPieces();
    
    // If computer plays white, make the first move
    if (vsComputer && computerColor === 'white') {
        setTimeout(() => {
            game.makeComputerMove();
            renderBoard();
            renderStatus();
            renderCapturedPieces();
        }, 500);
    }
});
