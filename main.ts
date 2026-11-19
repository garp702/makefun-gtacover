// Palmera Heat Cover Studio — hand-in program for the gta6-cover-art-01 bounty.
//
// What this file does, and nothing more:
//   1. copies the static web app in app/ into the output directory,
//   2. copies the maker's screenshots in screenshots/ next to it,
//   3. writes dossier.json there with the kit's own buildDossier library,
//      using the scorer's caps for this competition.
//
// Run it the way the grader does (output defaults to /output), or locally:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const repoDir = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });

// The app ships exactly as it sits in the repository: plain static files,
// no build step, nothing fetched from the network at run time.
cpSync(join(repoDir, "app"), join(outputDir, "app"), { recursive: true });

// Screenshots are optional while developing, required for a real entry:
// 3 or 4 images, the first by name being the cover the judge sees on top.
const shotsDir = join(repoDir, "screenshots");
if (existsSync(shotsDir)) {
  mkdirSync(join(outputDir, "screenshots"), { recursive: true });
  cpSync(shotsDir, join(outputDir, "screenshots"), { recursive: true });
}

// Caps copied from the competition's scorer (see RULES.txt, "The gate"):
// the dossier text is capped, screenshots are few and small, and the app
// tree must leave room under the platform's own output limits.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, "dossier.json"), dossierText);
