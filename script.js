let stage = "intro"; 
// intro → text → ready

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== 主畫布粒子 =====
let particles = [];
let targets = [];
let mode = "image"; // image -> text

// ===== offscreen canvas（用來算圖片 / 文字像素）=====
const offCanvas = document.createElement("canvas");
const offCtx = offCanvas.getContext("2d");

// ⚠️ 關鍵：一定要先給尺寸
offCanvas.width = canvas.width;
offCanvas.height = canvas.height;

// ===== 粒子類別 =====
class Particle {
  constructor(x, y) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.tx = x;
    this.ty = y;
    this.vx = 0;
    this.vy = 0;
  }

  update() {
    const dx = this.tx - this.x;
    const dy = this.ty - this.y;
    this.vx += dx * 0.01;
    this.vy += dy * 0.01;
    this.vx *= 0.85;
    this.vy *= 0.85;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

// ===== 由像素產生目標點 =====
function generateTargetsFromCanvas() {
  targets = [];

  const imgData = offCtx.getImageData(
    0,
    0,
    offCanvas.width,
    offCanvas.height
  ).data;

  for (let y = 0; y < offCanvas.height; y += 4) {
    for (let x = 0; x < offCanvas.width; x += 4) {
      const i = (y * offCanvas.width + x) * 4;

      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      const brightness = (r + g + b) / 3;

      // ⭐ 關鍵：用亮度 + alpha
      if (brightness > 90 && a > 100) {
        targets.push({ x, y });
      }
    }
  }

  console.log("pixel targets:", targets.length);
}

// ===== 載入照片 =====
const img = new Image();
img.src = "photo.jpg"; // ← 確定你的照片檔名

img.onload = () => {
  offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);

  const scale = Math.min(
    canvas.width / img.width,
    canvas.height / img.height
  );

  const w = img.width * scale;
  const h = img.height * scale;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;

  offCtx.drawImage(img, x, y, w, h);
  generateTargetsFromCanvas();

  particles = targets.map(p => new Particle(p.x, p.y));

  // 3 秒後切換成文字
  setTimeout(showText, 2000);
};

// ===== 顯示 HAPPY BIRTHDAY =====
function showText() {
  stage = "text";
  mode = "text";

  offCtx.clearRect(0, 0, offCanvas.width, offCanvas.height);

  offCtx.fillStyle = "white";
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  const fontSize = Math.min(canvas.width * 0.18, 80);
  offCtx.font = `bold ${fontSize}px Arial`;


  offCtx.fillText(
    "HAPPY BIRTHDAY!",
    offCanvas.width / 2,
    offCanvas.height / 2
  );

  generateTargetsFromCanvas();

  if (targets.length === 0) {
    console.warn("⚠️ 文字像素尚未生成");
    return;
  }

  // 對應粒子到文字
  for (let i = 0; i < particles.length; i++) {
    const t = targets[i % targets.length];
    particles[i].tx = t.x;
    particles[i].ty = t.y;
  }

  // ⭐ 關鍵：文字穩定後，才允許點擊
  setTimeout(() => {
    stage = "ready";
    console.log("✅ ready for click");
  }, 1200);
}


// ===== 動畫循環 =====
function animate() {
  ctx.fillStyle = "#0a1a2a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

animate();

// ===== 視窗縮放 =====
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  offCanvas.width = canvas.width;
  offCanvas.height = canvas.height;
});

window.addEventListener("click", () => {
  if (stage !== "ready") return;

  stage = "done";

  const canvas = document.getElementById("canvas");
  const memory = document.getElementById("memory");

  canvas.classList.add("fade-out");

  setTimeout(() => {
    memory.classList.remove("hidden");
  }, 1200);
});

