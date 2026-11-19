// main.js — the Cover Studio editor.
//
// Wires the page together: a live canvas preview of the cover, photo
// loading from the user's own machine (FileReader only, nothing is
// uploaded), panel picking / dragging / zooming, layout and grade
// pickers, editable caption lettering, and one-click PNG export in the
// three post sizes. In shot mode it renders a bare cover or a staged
// editor for the maker's screenshots.

import { LAYOUTS, EXPORT_SIZES, drawCover, sceneContent, photoContent } from "./cover.js";
import { GRADES } from "./grade.js";
import { SCENES } from "./scenes.js";
import { readShotRequest } from "./shots.js";

const SAMPLE_FILES = ["samples/coast.jpg", "samples/portrait.jpg", "samples/car.jpg"];

const state = {
  layout: LAYOUTS[0],
  grade: GRADES[0],
  steps: 6,
  ink: true,
  badge: true,
  title: "PALMERA HEAT",
  subtitle: "Sundown Run",
  tagline: "ONE NIGHT ON THE WATERFRONT",
  size: EXPORT_SIZES[0],
  panels: [],
  selected: 0,
  showSelection: true,
};
let photos = [];       // loaded photo images (user's + samples)
let pickedPhoto = -1;  // tray photo waiting to be placed

function defaultPanels(layout) {
  const order = [1, 2, 3, 4, 0, 5, 6, 7];
  return layout.panels.map((_, i) => sceneContent(order[i % order.length]));
}
state.panels = defaultPanels(state.layout);

const stage = document.getElementById("stage");
const stageCtx = stage.getContext("2d");

function renderPreview() {
  drawCover(stageCtx, stage.width, stage.height, state);
  updateSelectedLabel();
}
function panelName(i) {
  const c = state.panels[i];
  if (!c) return "empty";
  return c.kind === "photo" ? "your photo" : SCENES[c.scene % SCENES.length].name;
}
function updateSelectedLabel() {
  const el = document.getElementById("selected-label");
  if (el) el.textContent = `Panel ${state.selected + 1} · ${panelName(state.selected)} — drag to move, scroll to zoom`;
}

// ---------- pickers ----------
function buildLayoutPicker() {
  const box = document.getElementById("layout-picker");
  LAYOUTS.forEach((layout) => {
    const b = document.createElement("button");
    b.className = "pick" + (layout === state.layout ? " on" : "");
    b.textContent = `${layout.name} · ${layout.panels.length}`;
    b.title = `${layout.panels.length} panels`;
    b.onclick = () => chooseLayout(layout);
    box.appendChild(b);
  });
}
function chooseLayout(layout) {
  const keep = state.panels.slice();
  state.layout = layout;
  state.panels = layout.panels.map((_, i) => keep[i % keep.length] || sceneContent(i));
  state.selected = Math.min(state.selected, layout.panels.length - 1);
  document.querySelectorAll("#layout-picker .pick").forEach((el, i) => el.classList.toggle("on", LAYOUTS[i] === layout));
  renderPreview();
}
function buildGradePicker() {
  const box = document.getElementById("grade-picker");
  GRADES.forEach((grade) => {
    const b = document.createElement("button");
    b.className = "pick" + (grade === state.grade ? " on" : "");
    const sw = document.createElement("span");
    sw.className = "sw";
    sw.style.background = `linear-gradient(90deg, ${grade.stops.join(",")})`;
    b.appendChild(sw);
    b.appendChild(document.createTextNode(grade.name));
    b.onclick = () => {
      state.grade = grade;
      document.querySelectorAll("#grade-picker .pick").forEach((el, i) => el.classList.toggle("on", GRADES[i] === grade));
      renderPreview();
    };
    box.appendChild(b);
  });
}
function buildSizePicker() {
  const box = document.getElementById("size-picker");
  EXPORT_SIZES.forEach((size) => {
    const b = document.createElement("button");
    b.className = "pick" + (size === state.size ? " on" : "");
    b.textContent = `${size.name} ${size.label}`;
    b.onclick = () => {
      state.size = size;
      document.querySelectorAll("#size-picker .pick").forEach((el, i) => el.classList.toggle("on", EXPORT_SIZES[i] === size));
    };
    box.appendChild(b);
  });
}

// ---------- photos ----------
function addPhotoImage(img) {
  photos.push(img);
  const tray = document.getElementById("photo-tray");
  const thumb = document.createElement("img");
  thumb.src = img.src;
  thumb.alt = "loaded photo";
  const index = photos.length - 1;
  thumb.onclick = () => {
    pickedPhoto = index;
    tray.querySelectorAll("img").forEach((el, i) => el.classList.toggle("picked", i === index));
    document.getElementById("export-note").textContent = "Now click the panel this photo should fill.";
  };
  tray.appendChild(thumb);
}
function loadPhotoFiles(files) {
  [...files].forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => { addPhotoImage(img); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function loadSamplePhotos() {
  return Promise.all(SAMPLE_FILES.map((src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  }))).then((imgs) => imgs.filter(Boolean));
}
function placePickedPhoto(panelIndex) {
  if (pickedPhoto < 0 || !photos[pickedPhoto]) return false;
  state.panels[panelIndex] = photoContent(photos[pickedPhoto]);
  return true;
}
function autoFillPanels() {
  if (!photos.length) return;
  state.panels = state.layout.panels.map((_, i) =>
    i % 2 === 0 ? photoContent(photos[i % photos.length]) : state.panels[i]);
  renderPreview();
}
function shuffleScenes() {
  let seed = Date.now() % 9973;
  const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  state.panels = state.panels.map((c) => (c.kind === "scene" ? sceneContent(Math.floor(rnd() * SCENES.length)) : c));
  renderPreview();
}

// ---------- panel picking, dragging, zoom ----------
function panelIndexAt(px, py) {
  const r = stage.getBoundingClientRect();
  const fx = (px - r.left) / r.width, fy = (py - r.top) / r.height;
  let found = -1;
  state.layout.panels.forEach((p, i) => {
    if (fx >= p.x && fx <= p.x + p.w && fy >= p.y && fy <= p.y + p.h) found = i;
  });
  return found;
}
let drag = null;
function wireStagePointer() {
  stage.addEventListener("pointerdown", (e) => {
    const i = panelIndexAt(e.clientX, e.clientY);
    if (i < 0) return;
    if (placePickedPhoto(i)) {
      pickedPhoto = -1;
      document.querySelectorAll("#photo-tray img").forEach((el) => el.classList.remove("picked"));
    }
    state.selected = i;
    drag = { x: e.clientX, y: e.clientY };
    stage.setPointerCapture(e.pointerId);
    syncZoomSlider();
    renderPreview();
  });
  stage.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const r = stage.getBoundingClientRect();
    const c = state.panels[state.selected];
    c.dx = (c.dx || 0) + (e.clientX - drag.x) / r.width;
    c.dy = (c.dy || 0) + (e.clientY - drag.y) / r.height;
    drag = { x: e.clientX, y: e.clientY };
    renderPreview();
  });
  stage.addEventListener("pointerup", () => { drag = null; });
  stage.addEventListener("wheel", (e) => {
    e.preventDefault();
    const c = state.panels[state.selected];
    c.zoom = Math.min(3, Math.max(1, (c.zoom || 1) * (e.deltaY < 0 ? 1.07 : 0.93)));
    syncZoomSlider();
    renderPreview();
  }, { passive: false });
}
function syncZoomSlider() {
  const c = state.panels[state.selected];
  document.getElementById("panel-zoom").value = Math.round((c?.zoom || 1) * 100);
}

// ---------- export ----------
function exportPng() {
  const out = document.createElement("canvas");
  out.width = state.size.w; out.height = state.size.h;
  const clean = { ...state, showSelection: false };
  drawCover(out.getContext("2d"), out.width, out.height, clean);
  out.toBlob((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${state.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${state.size.label}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    document.getElementById("export-note").textContent =
      `Exported ${state.size.name} PNG — ${state.layout.name}, ${state.grade.name} grade, ${state.layout.panels.length} panels.`;
  }, "image/png");
}

// ---------- controls ----------
function wireControls() {
  document.getElementById("add-photos").onclick = () => document.getElementById("photo-input").click();
  document.getElementById("photo-input").onchange = (e) => loadPhotoFiles(e.target.files);
  document.getElementById("load-samples").onclick = async () => {
    const imgs = await loadSamplePhotos();
    imgs.forEach(addPhotoImage);
  };
  document.getElementById("auto-fill").onclick = autoFillPanels;
  document.getElementById("shuffle-scenes").onclick = shuffleScenes;
  document.getElementById("export-png").onclick = exportPng;
  document.getElementById("ink-toggle").onchange = (e) => { state.ink = e.target.checked; renderPreview(); };
  document.getElementById("badge-toggle").onchange = (e) => { state.badge = e.target.checked; renderPreview(); };
  document.getElementById("band-slider").oninput = (e) => { state.steps = Number(e.target.value); renderPreview(); };
  document.getElementById("panel-zoom").oninput = (e) => {
    state.panels[state.selected].zoom = Number(e.target.value) / 100;
    renderPreview();
  };
  document.getElementById("reset-crop").onclick = () => {
    const c = state.panels[state.selected];
    c.dx = 0; c.dy = 0; c.zoom = 1; syncZoomSlider(); renderPreview();
  };
  const bindText = (id, key) => {
    document.getElementById(id).oninput = (e) => { state[key] = e.target.value; renderPreview(); };
  };
  bindText("title-input", "title");
  bindText("subtitle-input", "subtitle");
  bindText("tagline-input", "tagline");
  const wrap = document.getElementById("workspace");
  wrap.addEventListener("dragover", (e) => e.preventDefault());
  wrap.addEventListener("drop", (e) => { e.preventDefault(); loadPhotoFiles(e.dataTransfer.files); });
}

// ---------- shot mode (screenshots are the app's own output) ----------
async function runShotMode(shot) {
  if (shot.layout) {
    const layout = LAYOUTS.find((l) => l.id === shot.layout);
    if (layout) { state.layout = layout; state.panels = defaultPanels(layout); }
  }
  if (shot.grade) {
    const grade = GRADES.find((g) => g.id === shot.grade);
    if (grade) state.grade = grade;
  }
  if (shot.title) state.title = shot.title;
  if (shot.subtitle) state.subtitle = shot.subtitle;
  if (shot.mode === "cover") {
    document.body.classList.add("shot-cover");
    const size = EXPORT_SIZES.find((s) => s.id === shot.size) || EXPORT_SIZES[0];
    const root = document.getElementById("shot-root");
    root.hidden = false;
    const c = document.createElement("canvas");
    c.width = size.w; c.height = size.h;
    drawCover(c.getContext("2d"), c.width, c.height, { ...state, showSelection: false });
    c.style.width = "100vw"; c.style.height = "100vh"; c.style.objectFit = "fill";
    root.appendChild(c);
    document.title = "cover";
    return true;
  }
  if (shot.mode === "editor") {
    buildLayoutPicker(); buildGradePicker(); buildSizePicker(); wireControls(); wireStagePointer();
    const imgs = await loadSamplePhotos();
    imgs.forEach(addPhotoImage);
    if (imgs.length) {
      state.panels[0] = photoContent(imgs[1] || imgs[0]);
      state.panels[3] = photoContent(imgs[0]);
    }
    renderPreview();
    return true;
  }
  return false;
}

const shot = readShotRequest();
if (shot.mode) {
  runShotMode(shot);
} else {
  buildLayoutPicker(); buildGradePicker(); buildSizePicker(); wireControls(); wireStagePointer();
  renderPreview();
}
