document.addEventListener("DOMContentLoaded", () => {
  /***********************
   * COMMON FUNCTIONALITY
   ***********************/
  const updateStats = () => {
    const total = localStorage.getItem("totalGames") || 0;
    const wins = localStorage.getItem("wins") || 0;
    const losses = localStorage.getItem("losses") || 0;
    const draws = localStorage.getItem("draws") || 0;

    const ids = ["totalGames", "wins", "losses", "draws", "exitGames", "exitWins", "exitLosses", "exitDraws"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id.includes("total")) el.textContent = total;
        if (id.includes("Wins") || id === "wins") el.textContent = wins;
        if (id.includes("Losses") || id === "losses") el.textContent = losses;
        if (id.includes("Draws") || id === "draws") el.textContent = draws;
      }
    });
  };
  updateStats();

  // Dark Mode Toggle
  const darkToggleElem = document.getElementById("darkModeToggle");
  if (localStorage.getItem("darkMode") === "true") {
    document.documentElement.classList.add("dark");
  }
  if (darkToggleElem) {
    darkToggleElem.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("darkMode", document.documentElement.classList.contains("dark"));
    });
  }

  // Theme Selector
  const themeSelector = document.getElementById("themeSelector");
  if (themeSelector) {
    themeSelector.addEventListener("change", () => {
      document.body.setAttribute("data-theme", themeSelector.value);
      localStorage.setItem("theme", themeSelector.value);
    });
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.body.setAttribute("data-theme", savedTheme);
      themeSelector.value = savedTheme;
    }
  }

  /**************************
   * PLAY PAGE FUNCTIONALITY
   **************************/
  const playFriendBtn = document.getElementById("playFriendBtn");
  const playComputerBtn = document.getElementById("playComputerBtn");

  if (playFriendBtn && playComputerBtn) {
    playFriendBtn.addEventListener("click", () => {
      document.getElementById("friendSetup").classList.remove("hidden");
      document.getElementById("computerSetup").classList.add("hidden");
    });

    playComputerBtn.addEventListener("click", () => {
      document.getElementById("computerSetup").classList.remove("hidden");
      document.getElementById("friendSetup").classList.add("hidden");
    });

    let selectedDiff = "easy";
    document.querySelectorAll(".diffBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".diffBtn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedDiff = btn.dataset.diff;
      });
    });

    let selectedSymbol = "X";
    document.querySelectorAll(".symbolBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".symbolBtn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedSymbol = btn.dataset.symbol;
      });
    });

    document.getElementById("startFriendGame")?.addEventListener("click", () => {
      sessionStorage.setItem("playerMode", "friend");
      sessionStorage.setItem("player1", document.getElementById("player1").value.trim() || "Player 1");
      sessionStorage.setItem("player2", document.getElementById("player2").value.trim() || "Player 2");
      sessionStorage.setItem("gameMode", document.getElementById("friendModeSelector").value);
      window.location.href = "game.html";
    });

    document.getElementById("startComputerGame")?.addEventListener("click", () => {
      sessionStorage.setItem("playerMode", "computer");
      sessionStorage.setItem("difficulty", selectedDiff);
      sessionStorage.setItem("playerSymbol", selectedSymbol);
      sessionStorage.setItem("gameMode", document.getElementById("modeSelector").value);
      window.location.href = "game.html";
    });

    document.getElementById("backBtn")?.addEventListener("click", () => {
      window.location.href = "tic.html";
    });
  }

  /**************************
   * GAME PAGE FUNCTIONALITY
   **************************/
  const board = document.getElementById("gameBoard");
  if (!board) return;

  let cells = Array.from(board.getElementsByClassName("cell"));
  if (cells.length === 0) {
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = i;
      board.appendChild(cell);
    }
    cells = Array.from(board.getElementsByClassName("cell"));
  }

  let gameActive = true;
  let turnTimer = 10;
  const timerCountEl = document.getElementById("timerCount");
  const gameModeStored = sessionStorage.getItem("gameMode") || "classic";
  const mode = sessionStorage.getItem("playerMode") || "friend";

  let humanSymbol = "X";
  let computerSymbol = "O";
  let currentPlayer = "X";

  const p1 = sessionStorage.getItem("player1") || "Player 1";
  const p2 = sessionStorage.getItem("player2") || "Player 2";

  if (mode === "computer") {
    humanSymbol = sessionStorage.getItem("playerSymbol") || "X";
    computerSymbol = humanSymbol === "X" ? "O" : "X";
    currentPlayer = humanSymbol === "O" ? computerSymbol : humanSymbol;
  }

  const playerInfo = document.getElementById("playerInfo");
  if (playerInfo) {
    playerInfo.textContent =
      mode === "friend"
        ? `${p1} (X) vs ${p2} (O) - ${p1}'s Turn`
        : humanSymbol === "O"
        ? `Computer (${computerSymbol}) - Starting First`
        : `You (${humanSymbol}) vs Computer (${computerSymbol}) - Your Turn`;
  }

  let tournamentWinsHuman = 0, tournamentWinsComputer = 0, currentRound = 1;
  const maxRounds = 3;

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  let timerInterval;
  const resetTurnTimer = () => {
    if (gameModeStored === "blitz") {
      turnTimer = 10;
      if (timerCountEl) timerCountEl.textContent = turnTimer;
    }
  };

  const startBlitzTimer = () => {
    clearInterval(timerInterval);
    resetTurnTimer();
    timerInterval = setInterval(() => {
      if (!gameActive) {
        clearInterval(timerInterval);
        return;
      }
      if (turnTimer > 0) {
        turnTimer--;
        if (timerCountEl) timerCountEl.textContent = turnTimer;
      } else {
        tournamentModeCheckAndEnd("Time's Up!") || endGame("Time's Up!");
        clearInterval(timerInterval);
      }
    }, 1000);
  };

  const checkWin = () => {
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
        return cells[a].textContent;
      }
    }
    return null;
  };

  const endGame = (message) => {
    if (gameModeStored === "tournament") {
      tournamentModeCheckAndEnd(message);
      return;
    }
    gameActive = false;
    const modal = document.getElementById("gameModal");
    if (modal) {
      document.getElementById("modalMessage").textContent = message;
      modal.classList.add("show");
    }

    let total = parseInt(localStorage.getItem("totalGames") || "0") + 1;
    localStorage.setItem("totalGames", total);

    if (message.includes("Wins")) {
      localStorage.setItem(message.startsWith(humanSymbol) ? "wins" : "losses",
        parseInt(localStorage.getItem(message.startsWith(humanSymbol) ? "wins" : "losses") || "0") + 1);
    } else if (message.includes("Draw")) {
      localStorage.setItem("draws", parseInt(localStorage.getItem("draws") || "0") + 1);
    }

    updateStats();
  };

  const tournamentModeCheckAndEnd = (message) => {
    if (gameModeStored !== "tournament") return false;

    gameActive = false;
    const modal = document.getElementById("gameModal");
    if (modal) {
      document.getElementById("modalMessage").textContent = `Round ${currentRound}: ${message}`;
      modal.classList.add("show");
    }

    if (message.includes("Wins")) {
      if (mode === "computer") {
        message.startsWith(humanSymbol) ? tournamentWinsHuman++ : tournamentWinsComputer++;
      } else {
        message.startsWith(p1) ? tournamentWinsHuman++ : tournamentWinsComputer++;
      }
    }

    if (currentRound < maxRounds) {
      currentRound++;
      setTimeout(() => {
        resetBoard();
        if (gameModeStored === "blitz") startBlitzTimer();
      }, 1500);
    } else {
      const finalMsg = tournamentWinsHuman > tournamentWinsComputer
        ? "Tournament Over! You win!"
        : tournamentWinsHuman < tournamentWinsComputer
        ? "Tournament Over! Computer wins!"
        : "Tournament Over! It's a draw!";
      if (modal) document.getElementById("modalMessage").textContent = finalMsg;
      updateStats();
    }
    return true;
  };

  const resetBoard = () => {
    cells.forEach(c => c.textContent = "");
    gameActive = true;
    const modal = document.getElementById("gameModal");
    if (modal) modal.classList.remove("show");
    if (gameModeStored === "blitz") startBlitzTimer();
  };

  const startGameBtn = document.getElementById("startGameBtn");
  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      gameActive = true;
      resetBoard();
    });
  }

  const getAvailableIndices = () => {
    return cells.reduce((acc, c, i) => (!c.textContent ? [...acc, i] : acc), []);
  };

  const computerMoveEasy = () => {
    const avail = getAvailableIndices();
    const weak = [1, 3, 5, 7].filter(i => avail.includes(i));
    return weak.length ? weak[Math.floor(Math.random() * weak.length)] : avail[Math.floor(Math.random() * avail.length)];
  };

  const computerMoveMedium = () => {
    const avail = getAvailableIndices();
    if (avail.includes(4)) return 4;
    const corners = [0, 2, 6, 8].filter(i => avail.includes(i));
    return corners.length ? corners[Math.floor(Math.random() * corners.length)] : avail[Math.floor(Math.random() * avail.length)];
  };

  const getBoardArray = () => cells.map(c => c.textContent);

  const checkWinnerForMinimax = (b, p) => winPatterns.some(pat => pat.every(i => b[i] === p));

  const minimax = (b, turn) => {
    const avail = b.map((v, i) => v === "" ? i : null).filter(i => i !== null);
    if (checkWinnerForMinimax(b, computerSymbol)) return { score: 10 };
    if (checkWinnerForMinimax(b, humanSymbol)) return { score: -10 };
    if (avail.length === 0) return { score: 0 };

    const moves = avail.map(i => {
      const move = { index: i };
      b[i] = turn;
      move.score = minimax(b, turn === computerSymbol ? humanSymbol : computerSymbol).score;
      b[i] = "";
      return move;
    });

    return turn === computerSymbol
      ? moves.reduce((best, m) => m.score > best.score ? m : best)
      : moves.reduce((best, m) => m.score < best.score ? m : best);
  };

  const computerMoveHard = () => minimax(getBoardArray(), computerSymbol).index;

  const makeComputerMove = () => {
    if (!gameActive) return;
    const diff = sessionStorage.getItem("difficulty") || "easy";
    const index = diff === "easy" ? computerMoveEasy() : diff === "medium" ? computerMoveMedium() : computerMoveHard();
    if (index !== undefined && !cells[index].textContent) {
      cells[index].textContent = computerSymbol;
      const winner = checkWin();
      if (winner) return endGame(`${winner} Wins!`);
      if (cells.every(c => c.textContent)) return endGame("It's a Draw!");
      if (playerInfo) playerInfo.textContent = "Your Turn";
      if (gameModeStored === "blitz") resetTurnTimer();
    }
  };

  const handleFriendMove = (cell) => {
    if (!gameActive || cell.textContent) return;
    cell.textContent = currentPlayer;
    const winner = checkWin();
    if (winner) return endGame(winner === "X" ? `${p1} Wins!` : `${p2} Wins!`);
    if (cells.every(c => c.textContent)) return endGame("It's a Draw!");
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    if (playerInfo) playerInfo.textContent = currentPlayer === "X" ? `${p1}'s Turn` : `${p2}'s Turn`;
    if (gameModeStored === "blitz") resetTurnTimer();
  };

  const handleHumanMove = (cell) => {
    if (!gameActive || cell.textContent) return;
    cell.textContent = humanSymbol;
    const winner = checkWin();
    if (winner) return endGame(`${humanSymbol} Wins!`);
    if (cells.every(c => c.textContent)) return endGame("It's a Draw!");
    if (playerInfo) playerInfo.textContent = "Computer's Turn";
    if (gameModeStored === "blitz") resetTurnTimer();
    setTimeout(makeComputerMove, 500);
  };

  cells.forEach(cell => {
    cell.addEventListener("click", () => {
      if (mode === "friend") handleFriendMove(cell);
      else if (mode === "computer") handleHumanMove(cell);
    });
  });

  document.getElementById("resetBtn")?.addEventListener("click", () => {
    clearInterval(timerInterval);
    resetBoard();
    if (gameModeStored === "blitz") startBlitzTimer();
  });

  document.getElementById("modalCloseBtn")?.addEventListener("click", () => {
    document.getElementById("gameModal")?.classList.remove("show");
  });

  document.getElementById("backToMenuBtn")?.addEventListener("click", () => {
    window.location.href = "tic.html";
  });

  if (mode === "computer" && humanSymbol === "O" && gameActive) {
    setTimeout(makeComputerMove, 500);
  }

  if (gameModeStored === "blitz" && gameActive) startBlitzTimer();
});