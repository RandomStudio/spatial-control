/**
 * Generates server/osc/session.json — the Open Stage Control UI.
 *
 * The number of source-select buttons is derived from CONFIG.maxSources, so the
 * UI and the module's slot count stay in lockstep. Run with `npm run build:session`.
 */

import { copyFileSync, writeFileSync } from "node:fs";
import { CONFIG } from "../config";
import { button, disabledButton, fader, image, speaker, xy, type Session, type Widget } from "./widgets";

const STAGE = { top: 70, left: 40, size: 520 };
const COL0 = 600;
const COL1 = 720;
const BTN_W = 110;
const ROW_H = 80;

/** Open Stage Control version this session targets (silences the load-time warning). */
const OSC_VERSION = "1.27.0";

/** Floorplan image — copied next to session.json so O-S-C can serve it by relative path. */
const FLOORPLAN_SRC = "src/floorplan.png";
const FLOORPLAN_NAME = "floorplan.png";

/**
 * Source-select slots shown on the control surface (UI only — Max owns the real source
 * config). `disabled` slots render as greyed, non-interactive placeholders.
 */
type SourceSlot =
  | { i: number; label: string; disabled?: false }
  | { i: number; label: string; disabled: true; tooltip: string };

const SOURCES: SourceSlot[] = [
  { i: 1, label: "Sonos" },
  { i: 2, label: "Source 2", disabled: true, tooltip: "TODO: add sources" },
];

/** Speaker marker geometry on the stage pad. */
const SPK_SIZE = 38;
const SPK_RADIUS = 232; // distance from pad centre to a marker centre (px)

/** Place speaker discs around the pad from their SPAT5 azimuths (deg, 0 = front/up, CCW). */
function speakerMarkers(): Widget[] {
  const cx = STAGE.left + STAGE.size / 2;
  const cy = STAGE.top + STAGE.size / 2;
  return CONFIG.speakers.map((azDeg, i) => {
    const az = (azDeg * Math.PI) / 180;
    // Pad convention (see module xyToAzDist): x = -sin(az), y = cos(az); screen y grows down.
    const x = -Math.sin(az);
    const y = Math.cos(az);
    return speaker({
      id: `spk${i + 1}`,
      left: Math.round(cx + x * SPK_RADIUS - SPK_SIZE / 2),
      top: Math.round(cy - y * SPK_RADIUS - SPK_SIZE / 2),
      size: SPK_SIZE,
      text: String(i + 1),
    });
  });
}

function buildSession(): Session {
  const widgets: Widget[] = [];

  // Floorplan, drawn behind the stage pad.
  widgets.push(
    image(
      { id: "floorplan", top: STAGE.top, left: STAGE.left, width: STAGE.size, height: STAGE.size },
      FLOORPLAN_NAME,
    ),
  );

  // The stage: drag to move the selected source. Transparent so the floorplan shows through.
  widgets.push({
    ...xy({
      id: "stage",
      top: STAGE.top,
      left: STAGE.left,
      width: STAGE.size,
      height: STAGE.size,
      label: "STAGE  (drag = move selected source)",
      address: "/stage",
    }),
    css: "background: transparent;",
  });

  // Speaker positions, drawn on top of the floorplan.
  widgets.push(...speakerMarkers());

  // Source-select buttons in a 2-column grid. The actual source/renderer setup lives in
  // Max; this is just the control surface. For now we expose Sonos (source 1) plus a single
  // greyed-out placeholder where future sources will go.
  SOURCES.forEach((s, idx) => {
    const row = Math.floor(idx / 2);
    const col = idx % 2;
    const top = STAGE.top + row * ROW_H;
    const left = col === 0 ? COL0 : COL1;
    if (s.disabled) {
      widgets.push(
        disabledButton({ id: `s${s.i}`, top, left, width: BTN_W, height: 70, text: s.label, tooltip: s.tooltip }),
      );
    } else {
      widgets.push(
        button({ id: `s${s.i}`, top, left, width: BTN_W, height: 70, label: s.label, address: `/select/${s.i}` }),
      );
    }
  });

  // Level fader for the selected source = SPAT5 "presence" (0..120, default 90).
  widgets.push(
    fader(
      { id: "presence", top: STAGE.top, left: 980, width: 100, height: STAGE.size, label: "Level (presence)", address: "/presence" },
      0,
      120,
      90,
    ),
  );

  return {
    type: "root",
    id: "root",
    version: OSC_VERSION,
    width: 1120,
    height: STAGE.top + STAGE.size + 30,
    widgets,
  };
}

const session = buildSession();
const outDir = "server/osc";
const out = `${outDir}/session.json`;
copyFileSync(FLOORPLAN_SRC, `${outDir}/${FLOORPLAN_NAME}`);
writeFileSync(out, JSON.stringify(session, null, 2) + "\n");
console.log(`wrote ${out} (${session.widgets.length} widgets, ${SOURCES.length} source slots)`);
