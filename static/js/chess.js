class Chess {
    constructor() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = {
            white: [],
            black: []
        };
        this.gameOver = false;
    }

    createInitialBoard() {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Set up pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black', hasMoved: false };
            board[6][i] = { type: 'pawn', color: 'white', hasMoved: false };
        }
        
        // Set up rooks
        board[0][0] = { type: 'rook', color: 'black', hasMoved: false };
        board[0][7] = { type: 'rook', color: 'black', hasMoved: false };
        board[7][0] = { type: 'rook', color: 'white', hasMoved: false };
        board[7][7] = { type: 'rook', color: 'white', hasMoved: false };
        
        // Set up knights
        board[0][1] = { type: 'knight', color: 'black' };
        board[0][6] = { type: 'knight', color: 'black' };
        board[7][1] = { type: 'knight', color: 'white' };
        board[7][6] = { type: 'knight', color: 'white' };
        
        // Set up bishops
        board[0][2] = { type: 'bishop', color: 'black' };
        board[0][5] = { type: 'bishop', color: 'black' };
        board[7][2] = { type: 'bishop', color: 'white' };
        board[7][5] = { type: 'bishop', color: 'white' };
        
        // Set up queens
        board[0][3] = { type: 'queen', color: 'black' };
        board[7][3] = { type: 'queen', color: 'white' };
        
        // Set up kings
        board[0][4] = { type: 'king', color: 'black', hasMoved: false };
        board[7][4] = { type: 'king', color: 'white', hasMoved: false };
        
        return board;
    }

    getPieceSymbol(piece) {
        if (!piece) return '';
        
        const symbols = {
            'white': {
                'king': '♔',
                'queen': '♕',
                'rook': '♖',
                'bishop': '♗',
                'knight': '♘',
                'pawn': '♙'
            },
            'black': {
                'king': '♚',
                'queen': '♛',
                'rook': '♜',
                'bishop': '♝',
                'knight': '♞',
                'pawn': '♟'
            }
        };
        
        return symbols[piece.color][piece.type];
    }

    selectPiece(row, col) {
        const piece = this.board[row][col];
        
        if (piece && piece.color === this.currentPlayer) {
            this.selectedPiece = { row, col, piece };
            this.validMoves = this.getValidMoves(row, col, piece);
            return true;
        }
        
        return false;
    }

    movePiece(toRow, toCol) {
        if (!this.selectedPiece) return false;
        
        const { row: fromRow, col: fromCol, piece } = this.selectedPiece;
        
        // Check if the move is valid
        const isValidMove = this.validMoves.some(move => 
            move.row === toRow && move.col === toCol
        );
        
        if (!isValidMove) return false;
        
        // Save move for undo
        const capturedPiece = this.board[toRow][toCol];
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece,
            capturedPiece,
            firstMove: piece.hasMoved === false
        });
        
        // Handle captured piece
        if (capturedPiece) {
            this.capturedPieces[this.currentPlayer].push(capturedPiece);
        }
        
        // Move the piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Mark piece as moved (important for pawns, kings, and rooks)
        if (piece.type === 'pawn' || piece.type === 'king' || piece.type === 'rook') {
            piece.hasMoved = true;
        }
        
        // Handle pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = { type: 'queen', color: piece.color };
        }
        
        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Reset selection
        this.selectedPiece = null;
        this.validMoves = [];
        
        // Check for checkmate or stalemate
        this.checkGameOver();
        
        return true;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return false;
        
        const lastMove = this.moveHistory.pop();
        const { from, to, piece, capturedPiece, firstMove } = lastMove;
        
        // Move piece back
        this.board[from.row][from.col] = piece;
        this.board[to.row][to.col] = capturedPiece;
        
        // Restore first move status
        if (firstMove) {
            piece.hasMoved = false;
        }
        
        // Remove from captured pieces if there was a capture
        if (capturedPiece) {
            const captureIndex = this.capturedPieces[piece.color].findIndex(
                p => p.type === capturedPiece.type
            );
            if (captureIndex !== -1) {
                this.capturedPieces[piece.color].splice(captureIndex, 1);
            }
        }
        
        // Switch back to previous player
        this.currentPlayer = piece.color;
        
        // Reset game over state
        this.gameOver = false;
        
        return true;
    }

    getValidMoves(row, col, piece) {
        const moves = [];
        
        switch (piece.type) {
            case 'pawn':
                this.getPawnMoves(row, col, piece, moves);
                break;
            case 'rook':
                this.getRookMoves(row, col, piece, moves);
                break;
            case 'knight':
                this.getKnightMoves(row, col, piece, moves);
                break;
            case 'bishop':
                this.getBishopMoves(row, col, piece, moves);
                break;
            case 'queen':
                this.getQueenMoves(row, col, piece, moves);
                break;
            case 'king':
                this.getKingMoves(row, col, piece, moves);
                break;
        }
        
        return moves;
    }

    getPawnMoves(row, col, piece, moves) {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // Move forward one square
        if (this.isInBounds(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col, capture: false });
            
            // Move forward two squares from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col, capture: false });
            }
        }
        
        // Capture diagonally
        const captureOffsets = [{ r: direction, c: -1 }, { r: direction, c: 1 }];
        for (const offset of captureOffsets) {
            const newRow = row + offset.r;
            const newCol = col + offset.c;
            
            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (targetPiece && targetPiece.color !== piece.color) {
                    moves.push({ row: newRow, col: newCol, capture: true });
                }
            }
        }
    }

    getRookMoves(row, col, piece, moves) {
        const directions = [
            { r: -1, c: 0 }, // up
            { r: 1, c: 0 },  // down
            { r: 0, c: -1 }, // left
            { r: 0, c: 1 }   // right
        ];
        
        this.getSlidingMoves(row, col, piece, moves, directions);
    }

    getKnightMoves(row, col, piece, moves) {
        const offsets = [
            { r: -2, c: -1 }, { r: -2, c: 1 },
            { r: -1, c: -2 }, { r: -1, c: 2 },
            { r: 1, c: -2 }, { r: 1, c: 2 },
            { r: 2, c: -1 }, { r: 2, c: 1 }
        ];
        
        for (const offset of offsets) {
            const newRow = row + offset.r;
            const newCol = col + offset.c;
            
            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push({ 
                        row: newRow, 
                        col: newCol, 
                        capture: !!targetPiece 
                    });
                }
            }
        }
    }

    getBishopMoves(row, col, piece, moves) {
        const directions = [
            { r: -1, c: -1 }, // up-left
            { r: -1, c: 1 },  // up-right
            { r: 1, c: -1 },  // down-left
            { r: 1, c: 1 }    // down-right
        ];
        
        this.getSlidingMoves(row, col, piece, moves, directions);
    }

    getQueenMoves(row, col, piece, moves) {
        // Queen combines rook and bishop moves
        this.getRookMoves(row, col, piece, moves);
        this.getBishopMoves(row, col, piece, moves);
    }

    getKingMoves(row, col, piece, moves) {
        const offsets = [
            { r: -1, c: -1 }, { r: -1, c: 0 }, { r: -1, c: 1 },
            { r: 0, c: -1 }, { r: 0, c: 1 },
            { r: 1, c: -1 }, { r: 1, c: 0 }, { r: 1, c: 1 }
        ];
        
        for (const offset of offsets) {
            const newRow = row + offset.r;
            const newCol = col + offset.c;
            
            if (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push({ 
                        row: newRow, 
                        col: newCol, 
                        capture: !!targetPiece 
                    });
                }
            }
        }
    }

    getSlidingMoves(row, col, piece, moves, directions) {
        for (const dir of directions) {
            let newRow = row + dir.r;
            let newCol = col + dir.c;
            
            while (this.isInBounds(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                
                if (!targetPiece) {
                    // Empty square
                    moves.push({ row: newRow, col: newCol, capture: false });
                } else {
                    // Square has a piece
                    if (targetPiece.color !== piece.color) {
                        // Can capture opponent's piece
                        moves.push({ row: newRow, col: newCol, capture: true });
                    }
                    // Stop sliding in this direction
                    break;
                }
                
                newRow += dir.r;
                newCol += dir.c;
            }
        }
    }

    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    checkGameOver() {
        // Check if the current player has any valid moves
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === this.currentPlayer) {
                    const moves = this.getValidMoves(row, col, piece);
                    if (moves.length > 0) {
                        // Player has at least one valid move
                        return;
                    }
                }
            }
        }
        
        // No valid moves - game is over (either checkmate or stalemate)
        this.gameOver = true;
    }

    resetGame() {
        this.board = this.createInitialBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.capturedPieces = {
            white: [],
            black: []
        };
        this.gameOver = false;
    }
}
