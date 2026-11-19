// shots.js — screenshot modes, driven by the query string.
//
// ?shot=cover renders nothing but the cover itself at a chosen size,
// layout and grade, so a screenshot of the page IS an exported cover.
// ?shot=editor opens the normal editor with a sample photo already
// loaded into the first panel. The maker's shots.json lists the exact
// queries used for the shipped screenshots.

export function readShotRequest() {
  const q = new URLSearchParams(location.search);
  return {
    mode: q.get("shot") || "",
    layout: q.get("layout") || "",
    grade: q.get("grade") || "",
    size: q.get("size") || "",
    title: q.get("title") || "",
    subtitle: q.get("subtitle") || "",
    photo: q.get("photo") || "",
  };
}
