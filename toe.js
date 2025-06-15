document.addEventListener("DOMContentLoaded", () => {
  /***********************
   * COMMON FUNCTIONALITY
   ***********************/
  const updateStats = () => {
    const total = localStorage.getItem("totalGames") || 0;
    const wins = localStorage.getItem("wins") || 0;
    const losses = localStorage.getItem("losses") || 0;
    const draws = localStorage.getItem("draws") || 0;
    if (document.getElementById("totalGames")) document.getElementById("totalGames").textContent = total;
    if (document.getElementById("wins")) document.getElementById("wins").textContent = wins;
    if (document.getElementById("losses")) document.getElementById("losses").textContent = losses;
    if (document.getElementById("draws")) document.getElementById("draws").textContent = draws;
    // Also update stats on exit page if present.
    if (document.getElementById("exitGames")) document.getElementById("exitGames").textContent = total;
    if (document.getElementById("exitWins")) document.getElementById("exitWins").textContent = wins;
    if (document.getElementById("exitLosses")) document.getElementById("exitLosses").textContent = losses;
    if (document.getElementById("exitDraws")) document.getElementById("exitDraws").textContent = draws;
  };
  updateStats();

  // Dark Mode Toggle
  const darkToggleElem = document.getElementById("darkModeToggle");
  if (darkToggleElem) {
    darkToggleElem.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("darkMode", document.documentElement.classList.contains("dark"));
    });
    if (localStorage.getItem("darkMode") === "true") {
      document.documentElement.classList.add("dark");
    }
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
      const p1 = (document.getElementById("player1").value || "Player 1").trim();
      const p2 = (document.getElementById("player2").value || "Player 2").trim();
      sessionStorage.setItem("player1", p1);
      sessionStorage.setItem("player2", p2);
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
  if (board) {
    // Create the board (9 cells) if not created.
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
    let turnTimer = 10; // Starting timer interval for Blitz mode
    const timerCountEl = document.getElementById("timerCount");
    // Game mode: "classic", "blitz", or "tournament"
    let gameModeStored = sessionStorage.getItem("gameMode") || "classic"; // Mode: "friend" or "computer"
    let mode = sessionStorage.getItem("playerMode") || "friend";

    let humanSymbol = "X";
    let computerSymbol = "O";
    let currentPlayer = "X";
    const p1 = sessionStorage.getItem("player1") || "Player 1";
    const p2 = sessionStorage.getItem("player2") || "Player 2";

    if (mode === "computer") {
      humanSymbol = sessionStorage.getItem("playerSymbol") || "X";
      computerSymbol = humanSymbol === "X" ? "O" : "X";
      // In computer mode, if human chooses "O", computer (as "X") starts.
      currentPlayer = humanSymbol === "O" ? computerSymbol : humanSymbol;
    }
    const playerInfo = document.getElementById("playerInfo");
    if (playerInfo) {
      if (mode === "friend")
        playerInfo.textContent = `${p1} (X) vs ${p2} (O) - ${p1}'s Turn`;
      else {
        if (humanSymbol === "O")
          playerInfo.textContent = `Computer (${computerSymbol}) - Starting First`;
        else
          playerInfo.textContent = `You (${humanSymbol}) vs Computer (${computerSymbol}) - Your Turn`;
      }
    }

    // Tournament mode variables (best-of-3 rounds)
    let tournamentWinsHuman = 0, tournamentWinsComputer = 0, currentRound = 1;
    const maxRounds = 3;

    // Show timer only in Blitz mode, hide for other modes.
    if (gameModeStored === "blitz") {
      if (timerCountEl && timerCountEl.parentElement)
        timerCountEl.parentElement.style.display = "block";
    } else {
      if (timerCountEl && timerCountEl.parentElement)
        timerCountEl.parentElement.style.display = "none";
    }

    // --- Start Blitz Timer Function ---
    let timerInterval;
    const startBlitzTimer = () => {
      // Clear any existing interval before starting a new one.
      if (timerInterval) clearInterval(timerInterval);
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
          // In Blitz mode, if timer runs out, end current round.
          tournamentModeCheckAndEnd("Time's Up!") || endGame("Time's Up!");
          clearInterval(timerInterval);
        }
      }, 1000);
    };

    // Reset timer to 10 seconds.
    const resetTurnTimer = () => {
      if (gameModeStored === "blitz") {
        turnTimer = 10;
        if (timerCountEl) timerCountEl.textContent = turnTimer;
      }
    };

    // Start the Blitz timer if in Blitz mode.
    if (gameModeStored === "blitz") {
      startBlitzTimer();
    }

    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    const checkWin = () => {
      for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (
          cells[a].textContent &&
          cells[a].textContent === cells[b].textContent &&
          cells[a].textContent === cells[c].textContent
        ) {
          return cells[a].textContent;
        }
      }
      return null;
    };

    // Tournament mode round-check logic: best of 3 rounds.
    const tournamentModeCheckAndEnd = (message) => {
      if (gameModeStored !== "tournament") return false;
      gameActive = false;
      const modal = document.getElementById("gameModal");
      if (modal) {
        document.getElementById("modalMessage").textContent = `Round ${currentRound}: ${message}`;
        modal.classList.add("show");
      }
      // Determine round winner:
      if (message.includes("Wins") || message.includes("Time's Up")) {
        if (mode === "computer") {
          if (message.startsWith(humanSymbol))
            tournamentWinsHuman++;
          else
            tournamentWinsComputer++;
        } else if (mode === "friend") {
          if (message.startsWith(p1))
            tournamentWinsHuman++;
          else
            tournamentWinsComputer++; // For simplicity, using same variables.
        }
      }
      if (currentRound < maxRounds) {
        currentRound++;
        setTimeout(() => {
          resetBoard();
          if (gameModeStored === "blitz") startBlitzTimer();
        }, 1500);
      } else {
        let finalMessage = "";
        if (tournamentWinsHuman > tournamentWinsComputer)
          finalMessage = "Tournament Over! You win!";
        else if (tournamentWinsHuman < tournamentWinsComputer)
          finalMessage = "Tournament Over! Computer wins!";
        else
          finalMessage = "Tournament Over! It's a draw!";
        if (modal) {
          document.getElementById("modalMessage").textContent = finalMessage;
        }
        updateStats();
      }
      return true;
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
        if (mode === "friend") {
          let w = parseInt(localStorage.getItem("wins") || "0") + 1;
          localStorage.setItem("wins", w);
        } else {
          if (message.startsWith(humanSymbol))
            localStorage.setItem("wins", parseInt(localStorage.getItem("wins") || "0") + 1);
          else
            localStorage.setItem("losses", parseInt(localStorage.getItem("losses") || "0") + 1);
        }
      } else if (message.includes("Draw")) {
        localStorage.setItem("draws", parseInt(localStorage.getItem("draws") || "0") + 1);
      }
      updateStats();
    };

    const resetBoard = () => {
      // Clear board cells and restart game.
      cells.forEach(cell => (cell.textContent = ""));
      gameActive = true;
      resetTurnTimer();
      if (sessionStorage.getItem("gameMode") === "blitz") {
    startBlitzTimer();
  }
      const modal = document.getElementById("gameModal");
      if (modal) modal.classList.remove("show");
      if (mode === "friend") {
        currentPlayer = "X";
        if (playerInfo)
          playerInfo.textContent = `${p1} (X) vs ${p2} (O) - ${p1}'s Turn`;
      } else {
        currentPlayer = humanSymbol === "O" ? computerSymbol : humanSymbol;
        if (playerInfo) {
          if (humanSymbol === "O")
            playerInfo.textContent = `Computer (${computerSymbol}) - Moving First`;
          else
            playerInfo.textContent = `You (${humanSymbol}) vs Computer (${computerSymbol}) - Your Turn`;
        }
      }
      if (gameModeStored === "blitz") resetTurnTimer();
      if (mode === "computer" && humanSymbol === "O" && gameActive) {
        setTimeout(() => { makeComputerMove(); }, 500);
      }
    };

    /************ COMPUTER MOVE STRATEGIES ************/
    const getAvailableIndices = () => {
      return cells.reduce((acc, cell, idx) => {
        if (!cell.textContent) acc.push(idx);
        return acc;
      }, []);
    };

    const computerMoveEasy = () => {
      let available = getAvailableIndices();
      const weakIndices = [1, 3, 5, 7];
      const weakAvailable = available.filter(i => weakIndices.includes(i));
      if (weakAvailable.length > 0)
        return weakAvailable[Math.floor(Math.random() * weakAvailable.length)];
      return available[Math.floor(Math.random() * available.length)];
    };

    const computerMoveMedium = () => {
      let available = getAvailableIndices();
      if (available.includes(4)) return 4;
      const corners = [0, 2, 6, 8];
      const availableCorners = available.filter(i => corners.includes(i));
      if (availableCorners.length > 0)
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
      return available[Math.floor(Math.random() * available.length)];
    };

    const getBoardArray = () => {
      return cells.map(cell => cell.textContent);
    };

    const checkWinnerForMinimax = (board, player) => {
      for (let pattern of winPatterns) {
        if (
          board[pattern[0]] === player &&
          board[pattern[1]] === player &&
          board[pattern[2]] === player
        ) {
          return true;
        }
      }
      return false;
    };

    const minimax = (board, currentTurn) => {
      const availableSpots = board.reduce((acc, el, idx) => {
        if (el === "") acc.push(idx);
        return acc;
      }, []);
      if (checkWinnerForMinimax(board, computerSymbol)) {
        return { score: 10 };
      } else if (checkWinnerForMinimax(board, humanSymbol)) {
        return { score: -10 };
      } else if (availableSpots.length === 0) {
        return { score: 0 };
      }
      let moves = [];
      for (let i = 0; i < availableSpots.length; i++) {
        let move = {};
        move.index = availableSpots[i];
        board[availableSpots[i]] = currentTurn;
        if (currentTurn === computerSymbol) {
          let result = minimax(board, humanSymbol);
          move.score = result.score;
        } else {
          let result = minimax(board, computerSymbol);
          move.score = result.score;
        }
        board[availableSpots[i]] = "";
        moves.push(move);
      }
      let bestMove;
      if (currentTurn === computerSymbol) {
        let bestScore = -Infinity;
        for (let m of moves) {
          if (m.score > bestScore) {
            bestScore = m.score;
            bestMove = m;
          }
        }
      } else {
        let bestScore = Infinity;
        for (let m of moves) {
          if (m.score < bestScore) {
            bestScore = m.score;
            bestMove = m;
          }
        }
      }
      return bestMove;
    };

    const computerMoveHard = () => {
      const boardArray = getBoardArray();
      const best = minimax(boardArray, computerSymbol);
      return best.index;
    };

    const makeComputerMove = () => {
      if (!gameActive) return;
      let diff = sessionStorage.getItem("difficulty") || "easy";
      let chosenIndex;
      if (diff === "easy") {
        chosenIndex = computerMoveEasy();
      } else if (diff === "medium") {
        chosenIndex = computerMoveMedium();
      } else if (diff === "hard") {
        chosenIndex = computerMoveHard();
      }
      if (typeof chosenIndex !== "undefined" && cells[chosenIndex] && !cells[chosenIndex].textContent) {
        cells[chosenIndex].textContent = computerSymbol;
      }
      let winner = checkWin();
      if (winner) {
        endGame(`${winner} Wins!`);
        return;
      }
      if (cells.every(c => c.textContent)) {
        endGame("It's a Draw!");
        return;
      }
      if (document.getElementById("playerInfo"))
        document.getElementById("playerInfo").textContent = "Your Turn";
      if (gameModeStored === "blitz") resetTurnTimer();
    };

    /************* HANDLING MOVES **************/
    const handleFriendMove = (cell) => {
      if (!gameActive || cell.textContent) return;
      cell.textContent = currentPlayer;
      let winner = checkWin();
      if (winner) {
        const winMsg = mode === "friend" ? (winner === "X" ? `${p1} Wins!` : `${p2} Wins!`) : `${winner} Wins!`;
        endGame(winMsg);
        return;
      }
      if (cells.every(c => c.textContent)) {
        endGame("It's a Draw!");
        return;
      }
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      if (document.getElementById("playerInfo"))
        document.getElementById("playerInfo").textContent = currentPlayer === "X" ? `${p1}'s Turn` : `${p2}'s Turn`;
      if (gameModeStored === "blitz") resetTurnTimer();
    };

    const handleHumanMove = (cell) => {
      if (!gameActive || cell.textContent) return;
      cell.textContent = humanSymbol;
      let winner = checkWin();
      if (winner) {
        endGame(`${humanSymbol} Wins!`);
        return;
      }
      if (cells.every(c => c.textContent)) {
        endGame("It's a Draw!");
        return;
      }
      if (document.getElementById("playerInfo"))
        document.getElementById("playerInfo").textContent = "Computer's Turn";
      if (gameModeStored === "blitz") resetTurnTimer();
      setTimeout(() => { makeComputerMove(); }, 500);
    };

    cells.forEach(cell => {
      cell.addEventListener("click", () => {
        if (!gameActive) return;
        if (mode === "friend") {
          handleFriendMove(cell);
        } else if (mode === "computer") {
          if (!cell.textContent) {
            handleHumanMove(cell);
          }
        }
      });
    });

    const resetBtn = document.getElementById("resetBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        // Clear any previous timer interval before resetting.
        if (timerInterval) clearInterval(timerInterval);
        resetBoard();
        if (gameModeStored === "blitz") startBlitzTimer();
      });
    }
    const modalCloseBtn = document.getElementById("modalCloseBtn");
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => {
        const modal = document.getElementById("gameModal");
        if (modal) modal.classList.remove("show");
      });
    }
    const backToMenuBtn = document.getElementById("backToMenuBtn");
    if (backToMenuBtn) {
      backToMenuBtn.addEventListener("click", () => {
        window.location.href = "tic.html";
      });
    }
    if (mode === "computer" && humanSymbol === "O" && gameActive) {
      setTimeout(() => { makeComputerMove(); }, 500);
    }
  } // end if board exists
});
