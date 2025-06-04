let currentPlayer;
let board = ["", "", "", "", "", "", "", "", ""];
let gameMode = "human"; // Default
let symbols = ["X", "O"];
let gameActive = true;
let timer;
let timeLeft = 20;

// Set game mode
function setMode(mode) {
  gameMode = mode;
  restartGame();
}

// Initialize the board
function initializeBoard() {
  const gameBoard = document.getElementById("board");
  gameBoard.innerHTML = "";
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.addEventListener("click", () => handleMove(i));
    gameBoard.appendChild(cell);
  }

  currentPlayer = symbols[0];
  document.getElementById(
    "status"
  ).textContent = `Current Player: ${currentPlayer}`;
  startTimer();
}

// Handle a player move
function handleMove(index) {
  if (!gameActive || board[index] !== "") return;

  board[index] = currentPlayer;
  updateBoard();

  const winCombo = checkWinner();
  if (winCombo) {
    document.getElementById("status").textContent = `${currentPlayer} wins!`;
    gameActive = false;
    clearInterval(timer);
    highlightWinningCells(winCombo);
    drawWinLine(winCombo);
    return;
  }

  if (board.every((cell) => cell !== "")) {
    document.getElementById("status").textContent = "It's a draw!";
    gameActive = false;
    clearInterval(timer);
    return;
  }

  currentPlayer = currentPlayer === symbols[0] ? symbols[1] : symbols[0];
  document.getElementById(
    "status"
  ).textContent = `Current Player: ${currentPlayer}`;
  startTimer();

  // AI move if it's AI's turn
  if (gameMode === "ai" && currentPlayer === symbols[1]) {
    aiMoveWithDelay();
  }
}

// Update the board on screen
function updateBoard() {
  const cells = document.getElementsByClassName("cell");
  for (let i = 0; i < 9; i++) {
    cells[i].textContent = board[i];
  }
}

// Check for winner
function checkWinner() {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  for (const condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) {
      return condition; // Return the winning combination
    }
  }
  return null;
}

// Minimax algorithm for AI
function minimax(newBoard, depth, isMaximizing) {
  if (checkWinnerMinimax(newBoard, symbols[1])) return 10 - depth;
  if (checkWinnerMinimax(newBoard, symbols[0])) return depth - 10;
  if (newBoard.every((cell) => cell !== "")) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = symbols[1];
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = symbols[0];
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

// Check winner for minimax
function checkWinnerMinimax(board, player) {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return winConditions.some((condition) => {
    const [a, b, c] = condition;
    return board[a] === player && board[b] === player && board[c] === player;
  });
}

// Find best move for AI
function findBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = symbols[1];
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

// Restart the game
function restartGame() {
  initializeBoard();
}

// Timer functions
function startTimer() {
  clearInterval(timer);
  timeLeft = 20;
  updateTimerDisplay();
  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (gameMode === "ai" && currentPlayer === symbols[1]) {
        aiMoveWithDelay();
      } else if (gameMode === "ai" && currentPlayer === symbols[0]) {
        // Human missed turn, switch to AI
        currentPlayer = symbols[1];
        document.getElementById(
          "status"
        ).textContent = `Current Player: ${currentPlayer}`;
        aiMoveWithDelay();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  document.getElementById("timeLeft").textContent = timeLeft;
}

function aiMoveWithDelay() {
  setTimeout(() => {
    let bestMove = findBestMove();
    handleMove(bestMove);
  }, 500);
}

// Highlight winning cells
function highlightWinningCells(winCombo) {
  const cells = document.getElementsByClassName("cell");
  winCombo.forEach((idx) => {
    cells[idx].classList.add("win-cell");
  });
}

function drawWinLine(winCombo) {
  // Remove any existing line
  const oldLine = document.getElementById("win-line");
  if (oldLine) oldLine.remove();

  // Get the board's position
  const board = document.getElementById("board");
  const rect = board.getBoundingClientRect();

  // Get cell centers
  const cells = document.getElementsByClassName("cell");
  const getCenter = (idx) => {
    const cellRect = cells[idx].getBoundingClientRect();
    return {
      x: cellRect.left + cellRect.width / 2 - rect.left,
      y: cellRect.top + cellRect.height / 2 - rect.top,
    };
  };
  const start = getCenter(winCombo[0]);
  const end = getCenter(winCombo[2]);

  // Create SVG line
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("id", "win-line");
  svg.style.position = "absolute";
  svg.style.left = board.offsetLeft + "px";
  svg.style.top = board.offsetTop + "px";
  svg.style.pointerEvents = "none";
  svg.style.width = board.offsetWidth + "px";
  svg.style.height = board.offsetHeight + "px";
  svg.style.zIndex = 2;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", start.x);
  line.setAttribute("y1", start.y);
  line.setAttribute("x2", end.x);
  line.setAttribute("y2", end.y);
  line.setAttribute("stroke", "#e74c3c");
  line.setAttribute("stroke-width", "8");
  line.setAttribute("stroke-linecap", "round");

  svg.appendChild(line);
  document.body.appendChild(svg);
}

// Remove line and highlights on restart
function initializeBoard() {
  const gameBoard = document.getElementById("board");
  gameBoard.innerHTML = "";
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.addEventListener("click", () => handleMove(i));
    gameBoard.appendChild(cell);
  }

  currentPlayer = symbols[0];
  document.getElementById(
    "status"
  ).textContent = `Current Player: ${currentPlayer}`;
  startTimer();

  // Remove win line if present
  const oldLine = document.getElementById("win-line");
  if (oldLine) oldLine.remove();
  // Remove win highlight
  setTimeout(() => {
    Array.from(document.getElementsByClassName("cell")).forEach((cell) =>
      cell.classList.remove("win-cell")
    );
  }, 10);
}

// Start on load
window.onload = () => {
  initializeBoard();
};

document.getElementById("icon").addEventListener("change", function () {
  const value = this.value;
  if (value === "X") {
    symbols = ["X", "O"];
  } else if (value === "😎") {
    symbols = ["😎", "🤖"];
  } else if (value === "🍕") {
    symbols = ["🍕", "🍔"];
  }
  restartGame();
});

document.getElementById("mode").addEventListener("change", function () {
  gameMode = this.value;
  restartGame();
});
