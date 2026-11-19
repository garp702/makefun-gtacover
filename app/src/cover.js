// cover.js — layouts and the cover renderer.
//
// A cover is: a set of panels (each holding a painted scene or a user
// photo, graded through grade.js), a bold gradient title with a neon
// script subtitle, a tagline bar, and an optional starburst badge.
// Six layouts arrange the panels; the renderer is pure — same state in,
// same pixels out — so the preview, the three export sizes and the
// screenshots all show the identical cover.

import { SCENES } from "./scenes.js";
import { applyGrade, applyHalftone } from "./grade.js";

// Panel rectangles are fractions of the cover; the title block sits in
// the band under the panels except in the polaroid layout, where the
// lettering rides over the middle of the scattered cards.
export const LAYOUTS = [
  {
    id: "hero", name: "Hero Grid", titleBand: 0.8,
    panels: [
      { x: 0.0, y: 0.0, w: 0.44, h: 0.55 }, { x: 0.0, y: 0.556, w: 0.44, h: 0.244 },
      { x: 0.446, y: 0.0, w: 0.27, h: 0.394 }, { x: 0.446, y: 0.4, w: 0.27, h: 0.4 },
      { x: 0.722, y: 0.0, w: 0.278, h: 0.5 }, { x: 0.722, y: 0.506, w: 0.278, h: 0.294 },
    ],
  },
  {
    id: "classic", name: "Classic Six", titleBand: 0.8,
    panels: [
      { x: 0.0, y: 0.0, w: 0.328, h: 0.394 }, { x: 0.336, y: 0.0, w: 0.328, h: 0.394 }, { x: 0.672, y: 0.0, w: 0.328, h: 0.394 },
      { x: 0.0, y: 0.4, w: 0.328, h: 0.4 }, { x: 0.336, y: 0.4, w: 0.328, h: 0.4 }, { x: 0.672, y: 0.4, w: 0.328, h: 0.4 },
    ],
  },
  {
    id: "strips", name: "Film Strips", titleBand: 0.8,
    panels: [0, 1, 2, 3, 4].map((i) => ({ x: i * 0.202, y: 0.0, w: 0.194, h: 0.8 })),
  },
  {
    id: "duo", name: "Duo Split", titleBand: 0.8,
    panels: [
      { x: 0.0, y: 0.0, w: 0.58, h: 0.8 }, { x: 0.586, y: 0.0, w: 0.414, h: 0.394 },
      { x: 0.586, y: 0.4, w: 0.414, h: 0.4 },
    ],
  },
  {
    id: "magazine", name: "Magazine Four", titleBand: 0.8,
    panels: [
      { x: 0.0, y: 0.0, w: 0.494, h: 0.394 }, { x: 0.5, y: 0.0, w: 0.5, h: 0.394 },
      { x: 0.0, y: 0.4, w: 0.494, h: 0.4 }, { x: 0.5, y: 0.4, w: 0.5, h: 0.4 },
    ],
  },
  {
    id: "polaroid", name: "Polaroid Scatter", titleBand: 0.42, scatter: true,
    panels: [
      { x: 0.03, y: 0.03, w: 0.42, h: 0.34, rot: -0.1 }, { x: 0.55, y: 0.02, w: 0.42, h: 0.34, rot: 0.08 },
      { x: 0.02, y: 0.6, w: 0.3, h: 0.36, rot: 0.07 }, { x: 0.35, y: 0.62, w: 0.3, h: 0.36, rot: -0.05 },
      { x: 0.68, y: 0.6, w: 0.3, h: 0.36, rot: 0.1 },
    ],
  },
];

export const EXPORT_SIZES = [
  { id: "wide", name: "1920 × 1080", label: "wide", w: 1920, h: 1080 },
  { id: "portrait", name: "1080 × 1350", label: "portrait", w: 1080, h: 1350 },
  { id: "square", name: "1080 × 1080", label: "square", w: 1080, h: 1080 },
];

// One panel's content: a scene by index, or a photo image, with the
// user's crop (pan offsets in panel fractions, zoom multiplier).
export function sceneContent(sceneIndex) { return { kind: "scene", scene: sceneIndex, dx: 0, dy: 0, zoom: 1 }; }
export function photoContent(image) { return { kind: "photo", image, dx: 0, dy: 0, zoom: 1 }; }

function paintPanelContent(content, pw, ph) {
  const c = document.createElement("canvas");
  c.width = Math.max(2, Math.round(pw)); c.height = Math.max(2, Math.round(ph));
  const ctx = c.getContext("2d");
  if (content.kind === "scene") {
    SCENES[content.scene % SCENES.length].paint(ctx, c.width, c.height);
  } else if (content.image) {
    const img = content.image;
    const base = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight) * (content.zoom || 1);
    const dw = img.naturalWidth * base, dh = img.naturalHeight * base;
    const ox = (c.width - dw) / 2 + (content.dx || 0) * c.width;
    const oy = (c.height - dh) / 2 + (content.dy || 0) * c.height;
    ctx.fillStyle = "#181028"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, ox, oy, dw, dh);
  }
  return c;
}

function drawPanelFrame(ctx, x, y, w, h, selected) {
  ctx.lineWidth = Math.max(3, w * 0.012);
  ctx.strokeStyle = selected ? "#ff2e88" : "#0a0616";
  ctx.strokeRect(x, y, w, h);
  if (selected) {
    ctx.lineWidth = Math.max(1.5, w * 0.005);
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(x + ctx.lineWidth, y + ctx.lineWidth, w - ctx.lineWidth * 2, h - ctx.lineWidth * 2);
  }
}

function drawStarburst(ctx, cx, cy, r, textTop, textBottom) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = "#ffd21f";
  ctx.strokeStyle = "#0a0616"; ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.82;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#0a0616";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `900 ${r * 0.52}px "Arial Black", Impact, sans-serif`;
  ctx.fillText(textTop, 0, -r * 0.18);
  ctx.font = `700 ${r * 0.21}px Arial, sans-serif`;
  ctx.fillText(textBottom, 0, r * 0.3);
  ctx.restore();
}

function drawLettering(ctx, W, H, state, layout) {
  const band = layout.scatter ? { x: 0, y: H * 0.4, w: W, h: H * 0.24 } : { x: 0, y: H * layout.titleBand, w: W, h: H * (1 - layout.titleBand) };
  // backdrop for the lettering
  const g = ctx.createLinearGradient(0, band.y, 0, band.y + band.h);
  if (layout.scatter) {
    g.addColorStop(0, "rgba(24,4,48,0)");
    g.addColorStop(0.25, "rgba(24,4,48,0.92)");
    g.addColorStop(0.75, "rgba(64,6,64,0.95)");
    g.addColorStop(1, "rgba(24,4,48,0)");
  } else {
    g.addColorStop(0, "#20073f"); g.addColorStop(0.55, "#4a0e5e"); g.addColorStop(1, "#8f1663");
  }
  ctx.fillStyle = g;
  ctx.fillRect(band.x, band.y, band.w, band.h);
  // halftone dots behind the title, poster-print style
  ctx.fillStyle = "rgba(255,190,60,0.5)";
  const dotR = Math.max(2, W * 0.006), gap = dotR * 3.4;
  for (let yy = band.y + band.h * 0.12; yy < band.y + band.h * 0.62; yy += gap)
    for (let xx = W * 0.06; xx < W * 0.94; xx += gap) {
      ctx.beginPath(); ctx.arc(xx, yy, dotR * 0.55, 0, Math.PI * 2); ctx.fill();
    }
  const cx = band.x + band.w / 2;
  const title = (state.title || "PALMERA HEAT").toUpperCase();
  // title, fitted to the band
  let size = band.h * 0.52;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const setFont = (s) => { ctx.font = `900 ${s}px "Arial Black", Impact, "Franklin Gothic Heavy", sans-serif`; };
  setFont(size);
  const maxW = band.w * 0.94;
  while (ctx.measureText(title).width > maxW && size > 10) { size *= 0.94; setFont(size); }
  const titleY = band.y + band.h * 0.36;
  const tg = ctx.createLinearGradient(0, titleY - size * 0.55, 0, titleY + size * 0.6);
  tg.addColorStop(0, "#fff3b0"); tg.addColorStop(0.35, "#ffc53d"); tg.addColorStop(0.7, "#ff6b35"); tg.addColorStop(1, "#ff2e88");
  ctx.lineWidth = size * 0.16; ctx.strokeStyle = "#160425"; ctx.lineJoin = "round";
  ctx.strokeText(title, cx, titleY);
  ctx.fillStyle = tg;
  ctx.fillText(title, cx, titleY);
  const titleW = ctx.measureText(title).width;
  // neon script subtitle, overlapping the title's lower right
  const sub = state.subtitle || "";
  if (sub) {
    const ss = size * 0.52;
    ctx.font = `italic 700 ${ss}px "Segoe Script", "Brush Script MT", cursive`;
    ctx.shadowColor = "#22e6ff"; ctx.shadowBlur = size * 0.16;
    ctx.lineWidth = ss * 0.14; ctx.strokeStyle = "#0b2b3a";
    const sx = Math.min(cx + titleW * 0.28, band.x + band.w * 0.86);
    const sy = titleY + size * 0.42;
    ctx.strokeText(sub, sx, sy);
    ctx.fillStyle = "#eaffff";
    ctx.fillText(sub, sx, sy);
    ctx.shadowBlur = 0;
  }
  // tagline bar
  const tag = (state.tagline || "").toUpperCase();
  if (tag) {
    const th = band.h * 0.17, ty = band.y + band.h * 0.8;
    ctx.fillStyle = "#0a0616";
    const tw = Math.min(band.w * 0.92, ctx.measureText(tag).width + band.w * 0.3);
    ctx.font = `700 ${th * 0.62}px Arial, sans-serif`;
    const tw2 = Math.min(band.w * 0.94, ctx.measureText(tag).width + band.w * 0.08);
    ctx.fillRect(cx - tw2 / 2, ty - th / 2, tw2, th);
    ctx.fillStyle = "#ffd21f";
    ctx.fillText(tag, cx, ty + th * 0.03);
  }
}

// Render the whole cover onto ctx at pixel size W x H.
// state: { layout, grade, steps, ink (halftone on), title, subtitle,
//          tagline, badge (bool), panels: [content...], selected }
export function drawCover(ctx, W, H, state) {
  const layout = state.layout;
  ctx.fillStyle = "#12041f";
  ctx.fillRect(0, 0, W, H);
  if (layout.scatter) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#2a0a5e"); g.addColorStop(0.55, "#7a1160"); g.addColorStop(1, "#160425");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  layout.panels.forEach((p, i) => {
    const content = state.panels[i] || { kind: "scene", scene: i, dx: 0, dy: 0, zoom: 1 };
    const x = p.x * W, y = p.y * H, w = p.w * W, h = p.h * H;
    const tile = paintPanelContent(content, w, h);
    applyGrade(tile, state.grade, state.steps, state.grade.id === "ink" ? 0.02 : 0.12);
    ctx.save();
    if (p.rot) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(p.rot);
      ctx.fillStyle = "#f7f2e6";
      const pad = Math.min(w, h) * 0.055;
      ctx.fillRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2.4);
      ctx.drawImage(tile, -w / 2, -h / 2, w, h);
      ctx.lineWidth = Math.max(2, w * 0.008); ctx.strokeStyle = "#0a0616";
      ctx.strokeRect(-w / 2, -h / 2, w, h);
    } else {
      ctx.drawImage(tile, x, y, w, h);
      drawPanelFrame(ctx, x, y, w, h, state.selected === i && state.showSelection);
    }
    ctx.restore();
  });
  drawLettering(ctx, W, H, state, layout);
  if (state.badge) {
    drawStarburst(ctx, W * 0.052, H * 0.068, Math.min(W, H) * 0.058, "NEW", "SUMMER 2026");
  }
  if (state.ink) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, H * (layout.scatter ? 1 : layout.titleBand)); ctx.clip();
    applyHalftone(ctx, W, H, Math.max(5, W * 0.007), 0.13);
    ctx.restore();
  }
}
