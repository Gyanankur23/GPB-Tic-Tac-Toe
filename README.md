# 🕹️ GPB Tic-Tac-Toe

Welcome to **GPB Tic-Tac-Toe**, a dynamic, theme-rich, and feature-packed web-based game built by **Gyanankur23**. This isn’t your average Xs and Os—it's a fully responsive, real-time stat-tracking game with achievements, difficulty levels, and visual flair powered by Tailwind CSS and advanced JavaScript logic.

---

## 🚀 Features at a Glance

- 🎨 **Three Gorgeous Themes**: Classic, Space, Candy
- 🌙 **Dark Mode** Toggle
- 🧠 **Play vs. AI** with `Easy`, `Medium`, `Hard` difficulty levels
- 🤝 **Play with Friend** mode
- ⏱️ **Three Game Modes**:
  - **Classic**: Play at your own pace
  - **Blitz**: 10-second turn timer
  - **Tournament**: Best-of-3 rounds
- 🏆 **Achievements Tracker** (real-time)
- 📊 **Stats Tracking** for Wins, Losses, Draws
- 🖥️ **Progressive Web App (PWA)** support
- ✨ Built with **Tailwind CSS** and modern vanilla JavaScript

---

## 📂 Project Structure

```
📁 GPB-TicTacToe/
|———assets/ 
    ———logo.png.      #main logo
├── index.html         # Landing page
├── tic.html           # Main dashboard with mode/theme toggle
├── play.html          # Select modes, difficulty, and players
├── game.html          # Core gameplay logic and UI
├── achievement.html   # Shows unlocked achievements
├── exit.html          # Exit/thank-you screen
├── toe.js             # Main game engine and logic
├── tac.css            # Centralized theming and styling
├── sw.js              # Service worker for PWA
├── manifest.json      # PWA manifest setup
```

---

## 🎮 Gameplay Modes

### 🔹 Classic Mode
```text
• No timers.
• Take your time, play at your own pace.
```

### 🔸 Blitz Mode
```text
• Each player has 10 seconds to make their move.
• Encourages fast thinking and sharp reflexes.
```

### 🏁 Tournament Mode
```text
• Best-of-three rounds.
• Designed for competitive face-offs.
```

---

## 🧠 Computer AI Difficulty

The AI logic is built with algorithmic stacking strategies like:

- `LIFO (Last-In-First-Out)` → Aggressive blocking
- `FIFO (First-In-First-Out)` → Predictable paths
- Pattern recognition and counterplay logic at `hard` difficulty

```js
// Example: Difficulty Scaling
if (difficulty === "easy") {
  return pickRandomEmptyCell();
} else if (difficulty === "medium") {
  return checkWinThenBlock();
} else {
  return minimax(board, true).index;
}
```

---

## 🛠️ Theming & Styling

Themes are managed via CSS variables and dynamic class toggling.

```css
/* Example: Space Theme */
body.theme-space {
  --bg-color: linear-gradient(to right, #1e3a8a, #3b82f6);
  --text-color: #ffffff;
}
```

```js
// Theme switcher logic
const theme = localStorage.getItem("theme") || "classic";
document.body.classList.add("theme-" + theme);
```

Tailwind CSS enhances layout responsiveness and animations throughout the interface.

---

## 📱 Add to Home Screen (PWA)

This app can be installed directly to your device like a native app.

- Manifest: [`manifest.json`](./manifest.json)
- Service Worker: [`sw.js`](./sw.js)
- Button labeled **"Install Tic Tac Toe"** is triggered if PWA is available.

---

## 🧩 Achievements System

Achievements update in real time and include milestones like:

- 🏆 **First Win**
- 💡 **Tried All Modes**
- 🔥 **Win Streaks**

Stored via `localStorage` and styled for visibility.

```js
if (winStreak >= 3) {
  unlockAchievement("🔥 Win Streak");
}
```

---

## 📊 Stats & Progress Tracking

Your performance is always saved and updated:

```js
// Load stats
document.getElementById("wins").textContent =
  localStorage.getItem("wins") || 0;
```

Values persist even after page refresh or device reload.

---

## 🧪 Development Notes

- Responsive grid board built with CSS Grid
- Modal UI for results and instructions
- Sound and animation hooks are modular for future updates
- Works seamlessly on both desktop and mobile
- Tested on latest versions of Chrome, Edge, Firefox, and Android WebView

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Gyanankur23

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software... [full license text would follow]
```

---

## 📥 Clone This Repository

To get a local copy up and running:

```bash
git clone https://github.com/Gyanankur23/GPB-Tic-Tac-Toe.git
cd GPB-Tic-Tac-Toe

## 🙌 Contributing

Suggestions? Want to improve AI logic, add new achievements, or enhance UI? Pull requests and ideas are welcome!

---

##📌Watch Live at:-

https://gyanankur23.github.io/GPB-Tic-Tac-Toe

## 👋 Author

Built with passion by **[Gyanankur23](https://github.com/Gyanankur23)**  
Follow, fork, and feel free to contribute 🚀
