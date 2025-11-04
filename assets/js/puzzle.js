// ==========================================
// PUZZLE GAME - PetSOS Theme
// Number Puzzle (Sliding Puzzle Game)
// ==========================================

class PuzzleGame {
    constructor() {
        this.size = 4; // Default: 4x4
        this.tiles = [];
        this.emptyPos = { row: 0, col: 0 };
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isPlaying = false;
        this.bestScore = localStorage.getItem('petsos-puzzle-best') || null;
        
        this.init();
    }

    init() {
        // Get DOM elements
        this.board = document.getElementById('puzzleBoard');
        this.moveCountEl = document.getElementById('moveCount');
        this.timeCountEl = document.getElementById('timeCount');
        this.bestScoreEl = document.getElementById('bestScore');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.difficultySelect = document.getElementById('difficulty');

        // Display best score
        if (this.bestScore) {
            this.bestScoreEl.textContent = this.bestScore;
        }

        // Event listeners
        this.shuffleBtn.addEventListener('click', () => this.startNewGame());
        this.difficultySelect.addEventListener('change', (e) => {
            this.size = parseInt(e.target.value);
            this.startNewGame();
        });

        // Start first game
        this.startNewGame();
    }

    startNewGame() {
        // Reset game state
        this.moves = 0;
        this.timer = 0;
        this.isPlaying = false;
        this.updateStats();
        this.stopTimer();

        // Create new puzzle
        this.createPuzzle();
        this.shuffle();
        
        // Start timer on first move
        this.isPlaying = true;
    }

    createPuzzle() {
        // Clear board
        this.board.innerHTML = '';
        this.board.setAttribute('data-size', this.size);
        this.tiles = [];

        // Create tiles array
        const totalTiles = this.size * this.size;
        for (let i = 0; i < totalTiles - 1; i++) {
            this.tiles.push(i + 1);
        }
        this.tiles.push(0); // 0 represents empty tile

        // Render tiles
        this.renderBoard();
    }

    renderBoard() {
        this.board.innerHTML = '';
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const index = row * this.size + col;
                const value = this.tiles[index];
                
                const tile = document.createElement('div');
                tile.className = 'puzzle-tile';
                tile.setAttribute('data-row', row);
                tile.setAttribute('data-col', col);
                
                if (value === 0) {
                    tile.classList.add('empty');
                    this.emptyPos = { row, col };
                } else {
                    tile.textContent = value;
                    tile.addEventListener('click', () => this.handleTileClick(row, col));
                }
                
                this.board.appendChild(tile);
            }
        }
        
        this.updateMovableTiles();
    }

    handleTileClick(row, col) {
        if (!this.isPlaying) return;
        
        // Check if tile is adjacent to empty space
        if (this.isAdjacent(row, col, this.emptyPos.row, this.emptyPos.col)) {
            this.moveTile(row, col);
            
            // Start timer on first move
            if (this.moves === 1) {
                this.startTimer();
            }
            
            // Check for win
            if (this.checkWin()) {
                this.handleWin();
            }
        }
    }

    isAdjacent(row1, col1, row2, col2) {
        return (Math.abs(row1 - row2) === 1 && col1 === col2) ||
               (Math.abs(col1 - col2) === 1 && row1 === row2);
    }

    moveTile(row, col) {
        const tileIndex = row * this.size + col;
        const emptyIndex = this.emptyPos.row * this.size + this.emptyPos.col;
        
        // Swap tiles
        [this.tiles[tileIndex], this.tiles[emptyIndex]] = 
        [this.tiles[emptyIndex], this.tiles[tileIndex]];
        
        // Update moves
        this.moves++;
        this.updateStats();
        
        // Re-render board with animation
        this.animateMove(row, col);
    }

    animateMove(row, col) {
        const tiles = this.board.querySelectorAll('.puzzle-tile');
        const movingTile = tiles[row * this.size + col];
        
        movingTile.classList.add('moving');
        
        setTimeout(() => {
            this.renderBoard();
        }, 150);
    }

    shuffle() {
        // Perform random valid moves to shuffle the puzzle
        const shuffleMoves = this.size * this.size * 20;
        
        for (let i = 0; i < shuffleMoves; i++) {
            const validMoves = this.getValidMoves();
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            
            const tileIndex = randomMove.row * this.size + randomMove.col;
            const emptyIndex = this.emptyPos.row * this.size + this.emptyPos.col;
            
            [this.tiles[tileIndex], this.tiles[emptyIndex]] = 
            [this.tiles[emptyIndex], this.tiles[tileIndex]];
            
            this.emptyPos = randomMove;
        }
        
        // Ensure puzzle is solvable
        if (!this.isSolvable()) {
            // Swap two non-empty adjacent tiles
            if (this.tiles[0] !== 0 && this.tiles[1] !== 0) {
                [this.tiles[0], this.tiles[1]] = [this.tiles[1], this.tiles[0]];
            } else {
                [this.tiles[2], this.tiles[3]] = [this.tiles[3], this.tiles[2]];
            }
        }
        
        this.renderBoard();
    }

    getValidMoves() {
        const moves = [];
        const { row, col } = this.emptyPos;
        
        // Check all four directions
        if (row > 0) moves.push({ row: row - 1, col });
        if (row < this.size - 1) moves.push({ row: row + 1, col });
        if (col > 0) moves.push({ row, col: col - 1 });
        if (col < this.size - 1) moves.push({ row, col: col + 1 });
        
        return moves;
    }

    isSolvable() {
        // Count inversions
        let inversions = 0;
        const flatTiles = this.tiles.filter(t => t !== 0);
        
        for (let i = 0; i < flatTiles.length; i++) {
            for (let j = i + 1; j < flatTiles.length; j++) {
                if (flatTiles[i] > flatTiles[j]) {
                    inversions++;
                }
            }
        }
        
        // For odd-sized grids, puzzle is solvable if inversions are even
        if (this.size % 2 === 1) {
            return inversions % 2 === 0;
        }
        
        // For even-sized grids, check empty tile row from bottom
        const emptyRowFromBottom = this.size - this.emptyPos.row;
        return (inversions + emptyRowFromBottom) % 2 === 1;
    }

    updateMovableTiles() {
        const tiles = this.board.querySelectorAll('.puzzle-tile:not(.empty)');
        
        tiles.forEach(tile => {
            const row = parseInt(tile.getAttribute('data-row'));
            const col = parseInt(tile.getAttribute('data-col'));
            
            if (this.isAdjacent(row, col, this.emptyPos.row, this.emptyPos.col)) {
                tile.classList.add('movable');
            } else {
                tile.classList.remove('movable');
            }
        });
    }

    checkWin() {
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== i + 1) {
                return false;
            }
        }
        return this.tiles[this.tiles.length - 1] === 0;
    }

    handleWin() {
        this.isPlaying = false;
        this.stopTimer();
        
        // Add celebration animation
        const tiles = this.board.querySelectorAll('.puzzle-tile:not(.empty)');
        tiles.forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.add('completed');
            }, index * 50);
        });
        
        // Check if new best score
        const score = this.moves;
        let isNewBest = false;
        
        if (!this.bestScore || score < parseInt(this.bestScore)) {
            this.bestScore = score;
            localStorage.setItem('petsos-puzzle-best', score);
            this.bestScoreEl.textContent = score;
            isNewBest = true;
        }
        
        // Show victory modal
        setTimeout(() => {
            this.showVictoryModal(isNewBest);
        }, 800);
    }

    showVictoryModal(isNewBest) {
        const modal = document.createElement('div');
        modal.className = 'victory-modal';
        modal.innerHTML = `
            <div class="victory-content">
                <div class="victory-emoji">🎉🐾🎊</div>
                <h2>¡Felicidades!</h2>
                <p style="font-size: 1.2rem; color: #f57c00; margin-bottom: 1rem;">
                    ${isNewBest ? '🏆 ¡Nuevo récord personal!' : '¡Completaste el puzzle!'}
                </p>
                
                <div class="victory-stats">
                    <div class="victory-stat">
                        <span class="victory-stat-label">Movimientos:</span>
                        <span class="victory-stat-value">${this.moves}</span>
                    </div>
                    <div class="victory-stat">
                        <span class="victory-stat-label">Tiempo:</span>
                        <span class="victory-stat-value">${this.formatTime(this.timer)}</span>
                    </div>
                    <div class="victory-stat">
                        <span class="victory-stat-label">Dificultad:</span>
                        <span class="victory-stat-value">${this.size}×${this.size}</span>
                    </div>
                </div>
                
                <div class="victory-buttons">
                    <button class="victory-btn victory-btn-primary" onclick="puzzleGame.startNewGame(); this.closest('.victory-modal').remove();">
                        🔄 Jugar de Nuevo
                    </button>
                    <button class="victory-btn victory-btn-secondary" onclick="this.closest('.victory-modal').remove();">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Play celebration sound (optional)
        this.playVictorySound();
    }

    playVictorySound() {
        // Optional: Add sound effect
        // You can add an audio element here if you want
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZURE7gtr0xnMnBSuBzvLYiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606eulVRQKRp/g8r5sIQYxh9Hz04IzBh5uwO/jmVERO4La9MZzJwUrgc7y2Ik3CBlou+3nn00QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBBChRctOrrpVUUCkaf4PK+bCEGMYfR89OCMwYebsDv45lRETuC2vTGcycFK4HO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiS1/LMeSwFJHfH8N2QQAoUXLTq66VVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZURE7gtr0xnMnBSuBzvLYiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606uulVRQKRp/g8r5sIQYxh9Hz04IzBh5uwO/jmVERO4La9MZzJwUrgc7y2Ik3CBlou+3nn00QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBBChRctOrrpVUUCkaf4PK+bCEGMYfR89OCMwYebsDv45lRETuC2vTGcycFK4HO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiS1/LMeSwFJHfH8N2QQAoUXLTq66VVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZURE7gtr0xnMnBSuBzvLYiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606uulVRQKRp/g8r5sIQYxh9Hz04IzBh5uwO/jmVERO4La9MZzJwUrgc7y2Ik3CBlou+3nn00QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBBChRctOrrpVUUCkaf4PK+bCEGMYfR89OCMwYebsDv45lRETuC2vTGcycFK4HO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiS1/LMeSwFJHfH8N2QQQoUXLTq66VVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZURE7gtr0xnMnBSuBzvLYiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606uulVRQKRp/g8r5sIQYxh9Hz04IzBh5uwO/jmVERO4La9MZzJwUrgc7y2Ik3CBlou+3nn00QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBBChRctOrrpVUUCkaf4PK+bCEGMYfR89OCMwYebsDv45lRETuC2vTGcycFK4HO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiS1/LMeSwFJHfH8N2QQQoUXLTq66VVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZUx==');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        } catch (e) {}
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateStats();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateStats() {
        this.moveCountEl.textContent = this.moves;
        this.timeCountEl.textContent = this.formatTime(this.timer);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize the game when DOM is loaded
let puzzleGame;

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure all elements are loaded
    setTimeout(() => {
        if (document.getElementById('puzzleBoard')) {
            puzzleGame = new PuzzleGame();
        }
    }, 100);
});