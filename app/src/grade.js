// grade.js — the colour-grade engine: gradient map + posterize + halftone.
//
// A grade is a ramp of colour stops from shadow to highlight. Grading a
// panel means: read its pixels, take each pixel's luminance, posterize
// that luminance into a small number of bands, then look the band up on
// the ramp. Photographs and painted scenes go through the exact same
// function, which is what makes a user's snapshot sit naturally beside
// the studio's own key-art panels. An optional halftone dot screen and a
// light grain pass finish the printed-poster feel.

function hexStop(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const GRADES = [
  { id: "sunset", name: "Sunset Vice", stops: ["#1d0533", "#6d1160", "#c2255c", "#ff6b35", "#ffc53d", "#fff3b0"] },
  { id: "neon", name: "Neon Nights", stops: ["#07002b", "#3d0a78", "#8b1e9e", "#e0218a", "#00c2e8", "#eaffff"] },
  { id: "tealorange", name: "Teal & Orange", stops: ["#04222b", "#0a5561", "#0e7c86", "#f4a259", "#ffd166", "#fff8e7"] },
  { id: "golden", name: "Golden Hour", stops: ["#2b1503", "#6e3408", "#b05e10", "#e8930c", "#ffc94d", "#fff6d8"] },
  { id: "mint", name: "Miami Mint", stops: ["#04231f", "#0a4f43", "#0e8a6d", "#3fd0a7", "#a7f3d0", "#ffffff"] },
  { id: "ink", name: "Poster Ink", stops: ["#12100e", "#3d3227", "#6e5a41", "#a68d64", "#e3d3ac", "#fffdf2"] },
];

function buildLookup(stops, steps) {
  const cols = stops.map(hexStop);
  const lut = new Uint8Array(steps * 3);
  for (let i = 0; i < steps; i++) {
    const t = steps === 1 ? 0 : i / (steps - 1);
    const pos = t * (cols.length - 1);
    const lo = Math.min(cols.length - 1, Math.floor(pos));
    const hi = Math.min(cols.length - 1, lo + 1);
    const f = pos - lo;
    for (let c = 0; c < 3; c++) lut[i * 3 + c] = Math.round(cols[lo][c] + (cols[hi][c] - cols[lo][c]) * f);
  }
  return lut;
}

// Grade one canvas in place. steps: posterize bands (3–10). keepHue blends
// a little of the source colour back in so skin and sky do not go flat.
export function applyGrade(canvas, grade, steps = 6, keepHue = 0.12) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { width: w, height: h } = canvas;
  if (!w || !h) return;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const lut = buildLookup(grade.stops, steps);
  const maxBand = steps - 1;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const band = Math.min(maxBand, Math.round(lum * maxBand));
    const o = band * 3;
    d[i] = lut[o] + (r - lut[o]) * keepHue;
    d[i + 1] = lut[o + 1] + (g - lut[o + 1]) * keepHue;
    d[i + 2] = lut[o + 2] + (b - lut[o + 2]) * keepHue;
  }
  ctx.putImageData(img, 0, 0);
}

// Halftone dot screen, strongest in the shadows like cheap poster print.
export function applyHalftone(ctx, w, h, spacing = 7, strength = 0.16) {
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  for (let y = spacing / 2; y < h; y += spacing) {
    for (let x = ((y / spacing) % 2) * spacing / 2 + spacing / 2; x < w; x += spacing) {
      ctx.fillStyle = `rgba(20,8,32,${strength})`;
      ctx.beginPath(); ctx.arc(x, y, spacing * 0.22, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

// Deterministic grain (seeded, so exports match the preview exactly).
export function applyGrain(ctx, w, h, amount = 10) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  let seed = 22222;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}
