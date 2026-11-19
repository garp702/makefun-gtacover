// scenes.js — eight original key-art scenes, painted procedurally on canvas.
//
// Every painter works in value (light against dark) with warm/cool tints.
// The grade engine in grade.js maps those values through a colour ramp and
// posterizes them, so a painted scene and a user's photograph come out of
// the same pipeline wearing the same poster finish. No image files, no
// network, no borrowed artwork: everything below is drawn with paths.
//
// Each painter receives (ctx, w, h) for its panel and a helpers object.

function gray(v, a = 1) { return `rgba(${v|0},${v|0},${(v*1.04)|0},${a})`; }
function tint(r, g, b, a = 1) { return `rgba(${r|0},${g|0},${b|0},${a})`; }

function skyGradient(ctx, w, h, top, mid, low) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, low);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
function sunDisc(ctx, x, y, r, v = 246) {
  ctx.fillStyle = gray(v);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = gray(v, 0.35);
  ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, Math.PI * 2); ctx.fill();
}
function palmTree(ctx, x, y, s, lean = 1, v = 26) {
  ctx.strokeStyle = gray(v); ctx.fillStyle = gray(v);
  ctx.lineWidth = Math.max(2, s * 0.07);
  ctx.beginPath(); ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + lean * s * 0.22, y - s * 0.62, x + lean * s * 0.52, y - s);
  ctx.stroke();
  const tx = x + lean * s * 0.52, ty = y - s;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + i * 0.15);
    ctx.lineWidth = Math.max(1.5, s * 0.045);
    ctx.beginPath(); ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(
      tx + Math.cos(a) * s * 0.55 * (lean > 0 ? 1 : -1) * (i < 4 ? 1 : 0.8),
      ty - Math.sin(a) * s * 0.34 - s * 0.08,
      tx + Math.cos(a) * s * 0.78 * (lean > 0 ? 1 : -1),
      ty - Math.sin(a) * s * 0.22 + s * 0.16);
    ctx.stroke();
  }
}
function skyline(ctx, baseY, w, h, seed, v = 44) {
  let x = -w * 0.04;
  let n = 0;
  while (x < w * 1.02) {
    const bw = w * (0.07 + ((seed * (n + 3) * 37) % 10) / 90);
    const bh = h * (0.18 + ((seed * (n + 5) * 53) % 34) / 100);
    ctx.fillStyle = gray(v + (n % 3) * 9);
    ctx.fillRect(x, baseY - bh, bw, bh);
    ctx.fillStyle = gray(238, 0.85);
    const cols = Math.max(1, (bw / (w * 0.028)) | 0);
    const rows = Math.max(2, (bh / (h * 0.05)) | 0);
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      if ((c * 7 + r * 11 + n * 3 + seed) % 3 === 0)
        ctx.fillRect(x + bw * 0.14 + c * bw * 0.62 / Math.max(1, cols - 0.5), baseY - bh + bh * 0.1 + r * bh * 0.78 / rows, Math.max(1.4, w * 0.008), Math.max(1.4, h * 0.016));
    }
    x += bw + w * 0.012; n++;
  }
}
function water(ctx, y, w, h, sunX) {
  const g = ctx.createLinearGradient(0, y, 0, h);
  g.addColorStop(0, gray(150)); g.addColorStop(1, gray(52));
  ctx.fillStyle = g; ctx.fillRect(0, y, w, h - y);
  ctx.fillStyle = gray(240, 0.5);
  for (let i = 0; i < 26; i++) {
    const yy = y + ((i * 29) % Math.max(1, (h - y) | 0));
    const len = w * (0.03 + ((i * 13) % 10) / 130);
    const xx = sunX + (((i * 47) % 60) - 30) / 60 * w * 0.3;
    ctx.fillRect(xx - len / 2, yy, len, Math.max(1, h * 0.006));
  }
}

function paintBoulevard(ctx, w, h) {
  skyGradient(ctx, w, h, gray(214), gray(238), gray(252));
  sunDisc(ctx, w * 0.66, h * 0.3, Math.min(w, h) * 0.13);
  ctx.fillStyle = gray(196); ctx.fillRect(0, h * 0.68, w, h * 0.32);
  ctx.fillStyle = gray(120);
  ctx.beginPath(); ctx.moveTo(w * 0.3, h); ctx.lineTo(w * 0.47, h * 0.68); ctx.lineTo(w * 0.56, h * 0.68); ctx.lineTo(w * 0.78, h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = gray(246, 0.8);
  for (let i = 0; i < 5; i++) ctx.fillRect(w * (0.5 - i * 0.012), h * (0.7 + i * 0.06), w * 0.012, h * 0.035);
  palmTree(ctx, w * 0.1, h * 0.98, h * 0.6, 1);
  palmTree(ctx, w * 0.93, h * 1.0, h * 0.68, -1);
  palmTree(ctx, w * 0.3, h * 0.72, h * 0.3, 1, 60);
  palmTree(ctx, w * 0.78, h * 0.72, h * 0.26, -1, 60);
}
function paintSkylineBay(ctx, w, h) {
  skyGradient(ctx, w, h, gray(178), gray(226), gray(250));
  sunDisc(ctx, w * 0.8, h * 0.52, Math.min(w, h) * 0.11);
  skyline(ctx, h * 0.66, w, h, 7, 40);
  ctx.fillStyle = gray(70); ctx.fillRect(0, h * 0.64, w, h * 0.03);
  water(ctx, h * 0.67, w, h, w * 0.8);
}
function paintSportsCar(ctx, w, h) {
  skyGradient(ctx, w, h, gray(190), gray(232), gray(250));
  sunDisc(ctx, w * 0.24, h * 0.34, Math.min(w, h) * 0.12);
  palmTree(ctx, w * 0.88, h * 0.78, h * 0.62, -1, 40);
  ctx.fillStyle = gray(96); ctx.fillRect(0, h * 0.74, w, h * 0.26);
  ctx.fillStyle = gray(235, 0.55); ctx.fillRect(0, h * 0.74, w, h * 0.012);
  // low wedge sports car, side profile
  const y = h * 0.74, s = w;
  ctx.fillStyle = gray(30);
  ctx.beginPath();
  ctx.moveTo(s * 0.06, y); ctx.lineTo(s * 0.1, y - h * 0.07); ctx.lineTo(s * 0.3, y - h * 0.1);
  ctx.lineTo(s * 0.44, y - h * 0.2); ctx.lineTo(s * 0.62, y - h * 0.21); ctx.lineTo(s * 0.74, y - h * 0.11);
  ctx.lineTo(s * 0.94, y - h * 0.06); ctx.lineTo(s * 0.97, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = gray(168);
  ctx.beginPath(); ctx.moveTo(s * 0.45, y - h * 0.185); ctx.lineTo(s * 0.6, y - h * 0.19); ctx.lineTo(s * 0.7, y - h * 0.115); ctx.lineTo(s * 0.47, y - h * 0.11); ctx.closePath(); ctx.fill();
  ctx.fillStyle = gray(225); ctx.fillRect(s * 0.9, y - h * 0.055, s * 0.055, h * 0.02);
  const wr = Math.min(w * 0.055, h * 0.085);
  for (const cx of [0.24, 0.8]) {
    ctx.fillStyle = gray(12); ctx.beginPath(); ctx.arc(s * cx, y, wr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = gray(200); ctx.beginPath(); ctx.arc(s * cx, y, wr * 0.48, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = gray(40); ctx.beginPath(); ctx.arc(s * cx, y, wr * 0.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = gray(250, 0.85); ctx.fillRect(s * 0.08, y - h * 0.028, s * 0.84, h * 0.008);
}
function paintHelicopter(ctx, w, h) {
  skyGradient(ctx, w, h, gray(150), gray(205), gray(238));
  skyline(ctx, h * 0.97, w, h, 3, 58);
  ctx.fillStyle = gray(88); ctx.fillRect(0, h * 0.95, w, h * 0.05);
  const cx = w * 0.58, cy = h * 0.34, s = Math.min(w, h);
  ctx.fillStyle = gray(235, 0.28);
  ctx.beginPath(); ctx.moveTo(cx - s * 0.05, cy + s * 0.08); ctx.lineTo(cx + s * 0.05, cy + s * 0.08); ctx.lineTo(cx + s * 0.3, h * 0.96); ctx.lineTo(cx - s * 0.16, h * 0.96); ctx.closePath(); ctx.fill();
  ctx.fillStyle = gray(24);
  ctx.beginPath(); ctx.ellipse(cx, cy, s * 0.17, s * 0.1, -0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx + s * 0.14, cy - s * 0.02); ctx.lineTo(cx + s * 0.42, cy - s * 0.1); ctx.lineTo(cx + s * 0.43, cy - s * 0.05); ctx.lineTo(cx + s * 0.16, cy + s * 0.03); ctx.closePath(); ctx.fill();
  ctx.fillRect(cx + s * 0.4, cy - s * 0.17, s * 0.02, s * 0.13);
  ctx.fillRect(cx - s * 0.3, cy - s * 0.16, s * 0.62, s * 0.018);
  ctx.fillRect(cx - s * 0.02, cy - s * 0.2, s * 0.05, s * 0.05);
  ctx.fillStyle = gray(190);
  ctx.beginPath(); ctx.ellipse(cx - s * 0.05, cy + s * 0.01, s * 0.07, s * 0.055, -0.12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = gray(24); ctx.lineWidth = s * 0.014;
  ctx.beginPath(); ctx.moveTo(cx - s * 0.09, cy + s * 0.13); ctx.lineTo(cx + s * 0.1, cy + s * 0.13); ctx.stroke();
}
function paintHeroine(ctx, w, h) {
  skyGradient(ctx, w, h, gray(226), gray(244), gray(252));
  sunDisc(ctx, w * 0.82, h * 0.16, Math.min(w, h) * 0.1);
  palmTree(ctx, w * 0.06, h * 0.62, h * 0.44, 1, 90);
  palmTree(ctx, w * 0.97, h * 0.66, h * 0.4, -1, 90);
  ctx.fillStyle = gray(205); ctx.fillRect(0, h * 0.8, w, h * 0.2);
  const u = Math.min(w, h * 0.92);
  const cx = w * 0.5, top = h * 0.08, fw = u * 0.52, fh = u * 0.66;
  // hair mass behind the face
  ctx.fillStyle = gray(28);
  ctx.beginPath(); ctx.ellipse(cx, top + fh * 0.62, fw * 0.78, fh * 0.85, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx - fw * 0.55, top + fh * 1.15, fw * 0.3, fh * 0.55, 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + fw * 0.55, top + fh * 1.2, fw * 0.3, fh * 0.6, -0.25, 0, Math.PI * 2); ctx.fill();
  // face
  ctx.fillStyle = gray(172);
  ctx.beginPath(); ctx.ellipse(cx, top + fh * 0.52, fw * 0.52, fh * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  // sunglasses + lips: the two marks a poster needs
  ctx.fillStyle = gray(16);
  ctx.beginPath(); ctx.ellipse(cx - fw * 0.24, top + fh * 0.48, fw * 0.19, fh * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + fw * 0.24, top + fh * 0.48, fw * 0.19, fh * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(cx - fw * 0.06, top + fh * 0.45, fw * 0.12, fh * 0.03);
  ctx.fillStyle = tint(120, 40, 52);
  ctx.beginPath(); ctx.ellipse(cx, top + fh * 0.82, fw * 0.17, fh * 0.055, 0, 0, Math.PI * 2); ctx.fill();
  // shoulders / top
  ctx.fillStyle = gray(120);
  ctx.beginPath(); ctx.moveTo(cx - fw * 1.05, h); ctx.quadraticCurveTo(cx - fw * 0.7, top + fh * 1.28, cx - fw * 0.2, top + fh * 1.22);
  ctx.lineTo(cx + fw * 0.2, top + fh * 1.22); ctx.quadraticCurveTo(cx + fw * 0.7, top + fh * 1.28, cx + fw * 1.05, h); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = gray(240); ctx.lineWidth = Math.max(2, w * 0.012);
  ctx.beginPath(); ctx.moveTo(cx - fw * 0.2, top + fh * 1.22); ctx.lineTo(cx, top + fh * 1.5); ctx.lineTo(cx + fw * 0.2, top + fh * 1.22); ctx.stroke();
}
function paintDriver(ctx, w, h) {
  skyGradient(ctx, w, h, gray(140), gray(180), gray(214));
  ctx.fillStyle = gray(52); ctx.fillRect(0, 0, w, h * 0.14);
  ctx.fillStyle = gray(52); ctx.fillRect(0, 0, w * 0.1, h);
  ctx.fillStyle = gray(52); ctx.fillRect(w * 0.9, 0, w * 0.1, h);
  skyline(ctx, h * 0.44, w, h, 11, 96);
  const du = Math.min(w, h * 0.95);
  const cx = w * 0.56, cy = h * 0.44, fw = du * 0.46, fh = du * 0.6;
  ctx.fillStyle = gray(34);
  ctx.beginPath(); ctx.ellipse(cx, cy - fh * 0.3, fw * 0.54, fh * 0.3, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = gray(158);
  ctx.beginPath(); ctx.ellipse(cx, cy, fw * 0.5, fh * 0.52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = gray(30);
  ctx.fillRect(cx - fw * 0.34, cy - fh * 0.1, fw * 0.26, fh * 0.09);
  ctx.fillRect(cx + fw * 0.08, cy - fh * 0.1, fw * 0.26, fh * 0.09);
  ctx.fillRect(cx - fw * 0.09, cy - fh * 0.12, fw * 0.18, fh * 0.035);
  ctx.fillStyle = gray(96);
  ctx.beginPath(); ctx.ellipse(cx, cy + fh * 0.34, fw * 0.3, fh * 0.2, 0, 0, Math.PI); ctx.fill();
  // patterned shirt + seat
  ctx.fillStyle = tint(96, 110, 128);
  ctx.beginPath(); ctx.moveTo(cx - fw * 1.15, h); ctx.quadraticCurveTo(cx, cy + fh * 0.72, cx + fw * 1.15, h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = gray(238, 0.75);
  for (let i = 0; i < 14; i++) {
    const px = cx - fw + ((i * 37) % (fw * 2)), py = cy + fh * 0.62 + ((i * 23) % (h * 0.3));
    ctx.beginPath(); ctx.arc(px, py, Math.max(1.5, w * 0.008), 0, Math.PI * 2); ctx.fill();
  }
  // steering wheel in front
  ctx.strokeStyle = gray(18); ctx.lineWidth = Math.max(3, w * 0.02);
  ctx.beginPath(); ctx.arc(w * 0.3, h * 0.84, Math.min(w, h) * 0.16, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.3 - Math.min(w, h) * 0.16, h * 0.84); ctx.lineTo(w * 0.3 + Math.min(w, h) * 0.16, h * 0.84); ctx.stroke();
}
function paintSpeedboat(ctx, w, h) {
  skyGradient(ctx, w, h, gray(196), gray(234), gray(250));
  sunDisc(ctx, w * 0.2, h * 0.26, Math.min(w, h) * 0.1);
  skyline(ctx, h * 0.52, w, h, 5, 66);
  water(ctx, h * 0.52, w, h, w * 0.2);
  const y = h * 0.66;
  ctx.fillStyle = gray(246, 0.85);
  ctx.beginPath(); ctx.moveTo(w * 0.08, y + h * 0.1); ctx.lineTo(w * 0.5, y + h * 0.05); ctx.lineTo(w * 0.44, y + h * 0.13); ctx.lineTo(w * 0.14, y + h * 0.17); ctx.closePath(); ctx.fill();
  ctx.fillStyle = gray(28);
  ctx.beginPath(); ctx.moveTo(w * 0.3, y + h * 0.08); ctx.lineTo(w * 0.42, y - h * 0.06); ctx.lineTo(w * 0.78, y - h * 0.02); ctx.lineTo(w * 0.92, y + h * 0.05); ctx.lineTo(w * 0.86, y + h * 0.12); ctx.lineTo(w * 0.36, y + h * 0.13); ctx.closePath(); ctx.fill();
  ctx.fillStyle = gray(150);
  ctx.beginPath(); ctx.moveTo(w * 0.52, y - h * 0.05); ctx.lineTo(w * 0.74, y - h * 0.03); ctx.lineTo(w * 0.8, y + h * 0.03); ctx.lineTo(w * 0.55, y + h * 0.02); ctx.closePath(); ctx.fill();
  ctx.fillStyle = gray(240); ctx.fillRect(w * 0.34, y + h * 0.015, w * 0.5, h * 0.014);
  ctx.fillStyle = gray(30);
  ctx.beginPath(); ctx.arc(w * 0.6, y - h * 0.06, h * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(w * 0.56, y - h * 0.03, w * 0.09, h * 0.06);
}
function paintMotorcycle(ctx, w, h) {
  skyGradient(ctx, w, h, gray(204), gray(238), gray(252));
  sunDisc(ctx, w * 0.78, h * 0.3, Math.min(w, h) * 0.13);
  ctx.fillStyle = gray(188); ctx.fillRect(0, h * 0.7, w, h * 0.3);
  water(ctx, h * 0.7, w, h, w * 0.78);
  palmTree(ctx, w * 0.1, h * 0.74, h * 0.5, 1, 48);
  const gy = h * 0.86, s = Math.min(w, h);
  ctx.strokeStyle = gray(20); ctx.fillStyle = gray(20);
  for (const cx of [w * 0.34, w * 0.68]) {
    ctx.lineWidth = s * 0.022;
    ctx.beginPath(); ctx.arc(cx, gy, s * 0.13, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.lineWidth = s * 0.035;
  ctx.beginPath(); ctx.moveTo(w * 0.34, gy); ctx.lineTo(w * 0.5, gy - s * 0.2); ctx.lineTo(w * 0.68, gy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.5, gy - s * 0.2); ctx.lineTo(w * 0.6, gy - s * 0.2); ctx.lineTo(w * 0.68, gy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * 0.6, gy - s * 0.2); ctx.lineTo(w * 0.66, gy - s * 0.34); ctx.stroke();
  // rider leaning over the tank
  ctx.beginPath(); ctx.ellipse(w * 0.52, gy - s * 0.3, s * 0.16, s * 0.075, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(w * 0.63, gy - s * 0.42, s * 0.075, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = gray(235); ctx.beginPath(); ctx.arc(w * 0.645, gy - s * 0.435, s * 0.05, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = gray(20);
  ctx.beginPath(); ctx.moveTo(w * 0.44, gy - s * 0.24); ctx.lineTo(w * 0.52, gy - s * 0.02); ctx.lineTo(w * 0.56, gy - s * 0.02); ctx.lineTo(w * 0.52, gy - s * 0.26); ctx.closePath(); ctx.fill();
}

export const SCENES = [
  { id: "boulevard", name: "Sunset Boulevard", paint: paintBoulevard },
  { id: "heroine", name: "Cover Star", paint: paintHeroine },
  { id: "sportscar", name: "Getaway Car", paint: paintSportsCar },
  { id: "skyline", name: "Skyline Bay", paint: paintSkylineBay },
  { id: "driver", name: "The Driver", paint: paintDriver },
  { id: "helicopter", name: "Air Patrol", paint: paintHelicopter },
  { id: "speedboat", name: "Harbour Run", paint: paintSpeedboat },
  { id: "motorcycle", name: "Coast Rider", paint: paintMotorcycle },
];
