// Tic Tac Toe - Game Logic
const YOUR_KEY = 'PASTE_YOUR_FULL_SUPABASE_KEY_HERE';
const db = window.supabase.createClient('https://chcepamgczwfguzroddn.supabase.co', YOUR_KEY);

// Game State
let gameState = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  mySymbol: 'X',
  roomCode: '',
  gameStarted: false,
  gameOver: false,
  winner: null,
  startTime: null,
  moveCount: 0,
  player1: { name: 'Player 1', symbol: 'X' },
  player2: { name: 'Waiting...', symbol: 'O' }
};

// Get room code from URL
const urlParams = new URLSearchParams(window.location.search);
const roomCode = urlParams.get('room') || generateRoomCode();
gameState.roomCode = roomCode;
document.getElementById('roomCode').textContent = roomCode;

// Initialize
async function init() {
  const user = getCurrentUser();
  gameState.player1.name = user.username;
  document.getElementById('player1Name').textContent = user.username;
  
  setupBoard();
  await joinOrCreateRoom();
  startGameLoop();
}

// Setup board click handlers
function setupBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(parseInt(cell.dataset.index)));
  });
}

// Handle cell click
function handleCellClick(index) {
  if (gameState.gameOver) {
    showToast('info', 'Game Over', 'Start a new game to play again');
    return;
  }
  
  if (!gameState.gameStarted) {
    showToast('info', 'Waiting', 'Waiting for opponent to join');
    return;
  }
  
  if (gameState.board[index] !== null) {
    showToast('error', 'Invalid Move', 'Cell already taken');
    return;
  }
  
  if (gameState.currentPlayer !== gameState.mySymbol) {
    showToast('info', 'Not Your Turn', 'Wait for opponent');
    return;
  }
  
  makeMove(index);
}

// Make move
async function makeMove(index) {
  gameState.board[index] = gameState.currentPlayer;
  gameState.moveCount++;
  
  updateBoard();
  
  const winner = checkWinner();
  if (winner) {
    endGame(winner);
  } else if (gameState.board.every(cell => cell !== null)) {
    endGame('draw');
  } else {
    gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
    await saveMoveToDatabase();
  }
}

// Update board display
function updateBoard() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    const value = gameState.board[index];
    if (value) {
      cell.textContent = value === 'X' ? '✕' : '○';
      cell.classList.add('filled', value.toLowerCase());
    } else {
      cell.textContent = '';
      cell.classList.remove('filled', 'x', 'o', 'winner');
    }
  });
}

// Check winner
function checkWinner() {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  
  for (let line of lines) {
    const [a, b, c] = line;
    if (gameState.board[a] && 
        gameState.board[a] === gameState.board[b] && 
        gameState.board[a] === gameState.board[c]) {
      highlightWinningLine(line);
      return gameState.board[a];
    }
  }
  return null;
}

// Highlight winning line
function highlightWinningLine(line) {
  const cells = document.querySelectorAll('.cell');
  line.forEach(index => {
    cells[index].classList.add('winner');
  });
}

// End game
function endGame(result) {
  gameState.gameOver = true;
  const duration = Date.now() - gameState.startTime;
  
  if (result === 'draw') {
    showWinnerModal('Draw!', 'No one wins', 'draw');
  } else {
    const winnerName = result === gameState.mySymbol ? 'You' : gameState.player2.name;
    showWinnerModal(`${winnerName} Win${result === gameState.mySymbol ? '' : 's'}!`, 
      result === gameState.mySymbol ? 'Congratulations!' : 'Better luck next time', 
      'win');
  }
  
  saveMatchToDatabase(result, duration);
}

// Show winner modal
function showWinnerModal(title, subtitle, type) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalSubtitle').textContent = subtitle;
  document.getElementById('totalMoves').textContent = gameState.moveCount;
  document.getElementById('gameDuration').textContent = formatDuration(Date.now() - gameState.startTime);
  document.getElementById('winnerName').textContent = title.includes('Draw') ? 'None' : title.split(' ')[0];
  
  const icon = document.getElementById('modalIcon');
  icon.className = 'modal-icon ' + type;
  icon.textContent = type === 'win' ? '🏆' : '🤝';
  
  document.getElementById('winnerModal').classList.add('show');
}

// Update turn indicator
function updateTurnIndicator() {
  const indicator = document.getElementById('turnIndicator');
  const player1 = document.getElementById('player1');
  const player2 = document.getElementById('player2');
  
  if (gameState.currentPlayer === 'X') {
    indicator.innerHTML = '<span class="symbol x">✕</span> ' + gameState.player1.name + "'s Turn";
    player1.classList.add('active');
    player2.classList.remove('active');
  } else {
    indicator.innerHTML = '<span class="symbol o">○</span> ' + gameState.player2.name + "'s Turn";
    player1.classList.remove('active');
    player2.classList.add('active');
  }
  
  document.getElementById('statusMessage').textContent = 
    gameState.currentPlayer === gameState.mySymbol ? 'Your turn - make a move!' : 'Waiting for opponent...';
}

// Join or create room
async function joinOrCreateRoom() {
  try {
    const { data: room } = await db
      .from('rooms')
      .select('*')
      .eq('code', roomCode)
      .eq('game_type', 'tictactoe')
      .single();
    
    if (room && room.player_count < 2) {
      // Join existing room
      await db.from('rooms').update({
        player_count: 2,
        players: [room.players[0], { name: gameState.player1.name }],
        status: 'playing'
      }).eq('code', roomCode);
      
      gameState.mySymbol = 'O';
      gameState.player2.name = room.players[0].name;
      document.getElementById('player2Name').textContent = room.players[0].name;
      startGame();
    } else {
      // Create new room
      await db.from('rooms').insert({
        code: roomCode,
        game_type: 'tictactoe',
        host_id: 'player1',
        players: [{ name: gameState.player1.name }],
        player_count: 1,
        status: 'waiting'
      });
      
      showToast('info', 'Waiting', 'Waiting for opponent to join');
    }
  } catch (e) {
    console.error('Room error:', e);
  }
}

// Start game
function startGame() {
  gameState.gameStarted = true;
  gameState.startTime = Date.now();
  document.getElementById('statusMessage').textContent = 'Game started!';
  updateTurnIndicator();
  showToast('success', 'Game Started', 'Good luck!');
}

// Game loop to check for opponent
async function startGameLoop() {
  setInterval(async () => {
    if (!gameState.gameStarted) {
      try {
        const { data: room } = await db
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .single();
        
        if (room && room.player_count === 2 && !gameState.gameStarted) {
          gameState.player2.name = room.players[1].name;
          document.getElementById('player2Name').textContent = room.players[1].name;
          startGame();
        }
      } catch (e) {}
    }
  }, 2000);
}

// Save move to database
async function saveMoveToDatabase() {
  try {
    await db.from('rooms').update({
      players: { board: gameState.board, turn: gameState.currentPlayer }
    }).eq('code', roomCode);
  } catch (e) {}
}

// Save match
async function saveMatchToDatabase(winner, duration) {
  try {
    await db.from('matches').insert({
      game_type: 'tictactoe',
      winner_id: winner === gameState.mySymbol ? 'player1' : winner === 'draw' ? null : 'player2',
      players: [gameState.player1.name, gameState.player2.name],
      duration: Math.floor(duration / 1000)
    });
  } catch (e) {}
}

// Reset game
function resetGame() {
  gameState.board = Array(9).fill(null);
  gameState.currentPlayer = 'X';
  gameState.gameOver = false;
  gameState.moveCount = 0;
  gameState.startTime = Date.now();
  updateBoard();
  updateTurnIndicator();
  document.getElementById('winnerModal').classList.remove('show');
  showToast('success', 'New Game', 'Board reset!');
}

// Play again
function playAgain() {
  resetGame();
}

// Leave game
function leaveGame() {
  if (confirm('Leave game?')) {
    backToLobby();
  }
}

// Back to lobby
function backToLobby() {
  window.location.href = '../../lobby.html';
}

// Helpers
function generateRoomCode() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function getCurrentUser() {
  return {
    username: localStorage.getItem('username') || 'Player',
    id: localStorage.getItem('userId')
  };
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showToast(type, title, message) {
  const toast = document.getElementById('toast');
  toast.className = 'toast ' + type + ' show';
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMessage').textContent = message;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function hideToast() {
  document.getElementById('toast').classList.remove('show');
}

// Initialize game
init();
