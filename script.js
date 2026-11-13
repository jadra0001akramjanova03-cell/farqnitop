
const canvas1 = document.getElementById("picture1");
const canvas2 = document.getElementById("picture2");
const ctx1 = canvas1.getContext("2d");
const ctx2 = canvas2.getContext("2d");

const levelText = document.getElementById("level");
const foundText = document.getElementById("found");
const timerText = document.getElementById("timer");
const levelTitle = document.getElementById("levelTitle");
const description = document.getElementById("description");
const progressFill = document.getElementById("progressFill");
const message = document.getElementById("message");
const nextBtn = document.getElementById("nextBtn");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalBtn = document.getElementById("modalBtn");

const TOTAL_LEVELS = 30;

let level = 1;
let differences = [];
let found = new Set();
let seconds = 0;
let timer = null;
let completed = false;
let hintId = null;
let hintTimer = null;

const themes = [
  { sky: "#83d8ff", hill: "#70b85b", hill2: "#3c914b", house: "#f3b36b" },
  { sky: "#f9d9a2", hill: "#a8c96b", hill2: "#5b9b58", house: "#e9a1a1" },
  { sky: "#b5c9ff", hill: "#8cbd91", hill2: "#478c72", house: "#e6d08a" },
  { sky: "#ffc9d9", hill: "#a2c98c", hill2: "#558e68", house: "#dca1e8" },
  { sky: "#a9e7d8", hill: "#9fca69", hill2: "#4b9965", house: "#f0b76b" }
];

// Har bosqich uchun farqlar soni
function getDifferenceCount() {
  return Math.min(3 + Math.floor((level - 1) / 6), 7);
}

// Bosqichga mos farqlarni tanlash
function createDifferences() {
  const all = [0, 1, 2, 3, 4, 5, 6];

  // Har bosqichda tartib almashadi
  const shift = (level * 3) % all.length;
  const rotated = all.slice(shift).concat(all.slice(0, shift));

  if (level % 2 === 0) rotated.reverse();

  return rotated.slice(0, getDifferenceCount());
}

// Rasm chizish
function drawScene(ctx, side) {
  const changed = side === 2;
  const active = id => changed && differences.includes(id);
  const theme = themes[(level - 1) % themes.length];

  ctx.clearRect(0, 0, 480, 320);

  // Osmon
  ctx.fillStyle = theme.sky;
  ctx.fillRect(0, 0, 480, 320);

  // Quyosh
  ctx.beginPath();
  ctx.arc(390, 65, active(0) ? 19 : 28, 0, Math.PI * 2);
  ctx.fillStyle = active(0) ? "#ff6b42" : "#ffe65b";
  ctx.fill();

  // Bulut
  drawCloud(ctx, active(1) ? 155 : 105, 88);

  // Tog‘lar
  ctx.fillStyle = "#a0a9b3";
  ctx.beginPath();
  ctx.moveTo(0, 205);
  ctx.lineTo(100, 100);
  ctx.lineTo(190, 205);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#c4cbd0";
  ctx.beginPath();
  ctx.moveTo(115, 205);
  ctx.lineTo(245, 95);
  ctx.lineTo(360, 205);
  ctx.closePath();
  ctx.fill();

  // Tepaliklar
  ctx.fillStyle = theme.hill;
  ctx.beginPath();
  ctx.moveTo(0, 195);
  ctx.quadraticCurveTo(140, 145, 270, 205);
  ctx.quadraticCurveTo(370, 165, 480, 205);
  ctx.lineTo(480, 320);
  ctx.lineTo(0, 320);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = theme.hill2;
  ctx.beginPath();
  ctx.moveTo(0, 245);
  ctx.quadraticCurveTo(120, 200, 250, 250);
  ctx.quadraticCurveTo(365, 210, 480, 250);
  ctx.lineTo(480, 320);
  ctx.lineTo(0, 320);
  ctx.closePath();
  ctx.fill();

  // Uy
  ctx.fillStyle = theme.house;
  ctx.fillRect(175, 165, 125, 105);

  // Tom
  ctx.fillStyle = active(2) ? "#3b69bd" : "#9b3c35";
  ctx.beginPath();
  ctx.moveTo(155, 170);
  ctx.lineTo(237, 105);
  ctx.lineTo(320, 170);
  ctx.closePath();
  ctx.fill();

  // Mo‘ri
  ctx.fillStyle = "#8b4335";
  ctx.fillRect(270, 119, 18, 37);

  // Uy derazalari
  drawWindow(ctx, 190, 185);
  drawWindow(ctx, 260, 185);

  // Eshik
  if (!active(3)) {
    ctx.fillStyle = "#74452c";
    ctx.fillRect(220, 218, 32, 52);

    ctx.fillStyle = "#ffdc69";
    ctx.beginPath();
    ctx.arc(245, 245, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Daraxt
  ctx.fillStyle = "#70452b";
  ctx.fillRect(355, 190, 23, 85);

  ctx.fillStyle = "#238449";
  ctx.beginPath();
  ctx.arc(365, 165, 43, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(337, 185, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(393, 185, 28, 0, Math.PI * 2);
  ctx.fill();

  // Daraxt mevalari
  const fruits = active(4)
    ? [[350, 150], [385, 183]]
    : [[350, 150], [385, 183], [365, 190]];

  fruits.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ffdc36";
    ctx.fill();
  });

  // Gullar
  drawFlower(ctx, 70, 275, "#ff5b8b");
  drawFlower(ctx, 105, 290, "#ffe65b");
  drawFlower(ctx, 145, 270, "#ffffff");

  if (!active(5)) {
    drawFlower(ctx, 125, 250, "#d875ff");
  }

  // Qush
  drawBird(ctx, active(6));

  // Yer ustidagi toshlar
  ctx.fillStyle = "#777e82";
  ctx.beginPath();
  ctx.ellipse(310, 285, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(335, 295, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rasm raqami
  ctx.fillStyle = "#00000055";
  ctx.fillRect(8, 8, 95, 24);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 13px Arial";
  ctx.fillText("MANZARA", 17, 25);

  // Topilgan farqlarni belgilash
  found.forEach(id => drawMarker(ctx, id, false));

  // Yordam ko‘rsatilayotgan farq
  if (hintId !== null) {
    drawMarker(ctx, hintId, true);
  }
}

function drawCloud(ctx, x, y) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.arc(x + 25, y - 12, 28, 0, Math.PI * 2);
  ctx.arc(x + 52, y, 22, 0, Math.PI * 2);
  ctx.fill();
}

function drawWindow(ctx, x, y) {
  ctx.fillStyle = "#7bd9ff";
  ctx.fillRect(x, y, 25, 25);

  ctx.strokeStyle = "#70452b";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, 25, 25);

  ctx.beginPath();
  ctx.moveTo(x + 12, y);
  ctx.lineTo(x + 12, y + 25);
  ctx.moveTo(x, y + 12);
  ctx.lineTo(x + 25, y + 12);
  ctx.stroke();
}

function drawFlower(ctx, x, y, color) {
  ctx.strokeStyle = "#23733c";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 22);
  ctx.stroke();

  ctx.fillStyle = color;

  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;

    ctx.beginPath();
    ctx.arc(
      x + Math.cos(angle) * 9,
      y + Math.sin(angle) * 9,
      6,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.fillStyle = "#ffdc36";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawBird(ctx, changed) {
  ctx.strokeStyle = changed ? "#e52f56" : "#303030";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(295, 110);
  ctx.quadraticCurveTo(305, changed ? 95 : 125, 315, 110);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(315, 110);
  ctx.quadraticCurveTo(325, 95, 335, 110);
  ctx.stroke();
}

// Farqlar markazlari va bosish hududlari
const spots = [
  { x: 390, y: 65, r: 38 },
  { x: 125, y: 88, r: 58 },
  { x: 237, y: 155, r: 47 },
  { x: 237, y: 240, r: 33 },
  { x: 365, y: 174, r: 48 },
  { x: 108, y: 270, r: 58 },
  { x: 315, y: 110, r: 30 }
];

function drawMarker(ctx, id, hint) {
  const spot = spots[id];

  ctx.save();
  ctx.beginPath();
  ctx.arc(spot.x, spot.y, spot.r * 0.65, 0, Math.PI * 2);

  ctx.strokeStyle = hint ? "#ffffff" : "#00ff85";
  ctx.lineWidth = hint ? 6 : 5;
  ctx.setLineDash(hint ? [8, 5] : []);
  ctx.shadowColor = hint ? "#ffffff" : "#00ff85";
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.restore();
}

function renderPictures() {
  drawScene(ctx1, 1);
  drawScene(ctx2, 2);
}

function updateStats() {
  foundText.textContent = `${found.size} / ${differences.length}`;
  levelText.textContent = `${level} / ${TOTAL_LEVELS}`;

  progressFill.style.width =
    `${(level / TOTAL_LEVELS) * 100}%`;
}

function formatTime(value) {
  const min = Math.floor(value / 60);
  const sec = value % 60;

  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function startTimer() {
  clearInterval(timer);

  timer = setInterval(() => {
    if (completed) return;

    seconds++;
    timerText.textContent = formatTime(seconds);
  }, 1000);
}

function createLevel() {
  clearInterval(timer);
  clearTimeout(hintTimer);

  found = new Set();
  seconds = 0;
  completed = false;
  hintId = null;

  differences = createDifferences();

  levelTitle.textContent = `${level}-bosqich`;

  if (level <= 6) {
    description.textContent = "3 ta farqni toping. Boshladik!";
  } else if (level <= 12) {
    description.textContent = "4 ta farqni toping. Diqqatli bo‘ling!";
  } else if (level <= 18) {
    description.textContent = "5 ta farq yashirilgan!";
  } else if (level <= 24) {
    description.textContent = "6 ta farqni aniqlang!";
  } else {
    description.textContent = "7 ta farq! Eng qiyin bosqichlar!";
  }

  timerText.textContent = "00:00";
  nextBtn.disabled = true;
  message.textContent = "Rasmlardagi farqlarni topish uchun joylarni bosing.";

  updateStats();
  renderPictures();
  startTimer();
}

function handleClick(event) {
  if (completed) return;

  const rect = event.currentTarget.getBoundingClientRect();

  const x = (event.clientX - rect.left) / rect.width * 480;
  const y = (event.clientY - rect.top) / rect.height * 320;

  let foundId = null;

  for (const id of differences) {
    if (found.has(id)) continue;

    const spot = spots[id];
    const distance = Math.hypot(x - spot.x, y - spot.y);

    if (distance <= spot.r) {
      foundId = id;
      break;
    }
  }

  if (foundId !== null) {
    found.add(foundId);

    message.textContent = "Ajoyib! Yana bitta farq topildi! ✨";

    hintId = null;
    clearTimeout(hintTimer);

    updateStats();
    renderPictures();

    if (found.size === differences.length) {
      finishLevel();
    }
  } else {
    message.textContent = "Bu joyda farq yo‘q. Yana diqqat bilan qarang!";
  }
}

canvas1.addEventListener("click", handleClick);
canvas2.addEventListener("click", handleClick);

function giveHint() {
  if (completed) return;

  const remaining = differences.filter(id => !found.has(id));

  if (remaining.length === 0) return;

  clearTimeout(hintTimer);

  hintId = remaining[0];

  message.textContent = "Oq rangli belgi yashirilgan farqni ko‘rsatadi.";

  renderPictures();

  hintTimer = setTimeout(() => {
    hintId = null;
    renderPictures();
  }, 1800);
}

function finishLevel() {
  completed = true;
  clearInterval(timer);

  nextBtn.disabled = false;

  modal.classList.remove("hidden");

  if (level === TOTAL_LEVELS) {
    modalTitle.textContent = "Siz g‘olibsiz! 🏆";
    modalText.textContent =
      "30 ta bosqichning barchasini muvaffaqiyatli tugatdingiz!";
    modalBtn.textContent = "Qayta o‘ynash";
  } else {
    modalTitle.textContent = "Barakalla! 🎉";
    modalText.textContent =
      `${level}-bosqichdagi barcha ${differences.length} ta farq topildi!`;
    modalBtn.textContent = "Keyingi bosqich";
  }

  message.textContent = "Barcha farqlar topildi!";
}

function nextLevel() {
  if (!completed) return;

  if (level < TOTAL_LEVELS) {
    level++;
  } else {
    level = 1;
  }

  modal.classList.add("hidden");
  createLevel();
}

function resetLevel() {
  modal.classList.add("hidden");
  createLevel();
}

document.getElementById("hintBtn")
  .addEventListener("click", giveHint);

document.getElementById("resetBtn")
  .addEventListener("click", resetLevel);

nextBtn.addEventListener("click", nextLevel);
modalBtn.addEventListener("click", nextLevel);

createLevel();
