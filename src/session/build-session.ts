/**
 * Generates server/osc/session.json — the Open Stage Control UI.
 *
 * The number of source-select buttons is derived from CONFIG.maxSources, so the
 * UI and the module's slot count stay in lockstep. Run with `npm run build:session`.
 */

import { writeFileSync } from "node:fs";
import { CONFIG } from "../config";
import { button, fader, xy, type Session, type Widget } from "./widgets";

const STAGE = { top: 70, left: 40, size: 520 };
const COL0 = 600;
const COL1 = 720;
const BTN_W = 110;
const ROW_H = 80;

function buildSession(): Session {
  const widgets: Widget[] = [];

  // The stage: drag to move the selected source.
  widgets.push(
    xy({
      id: "stage",
      top: STAGE.top,
      left: STAGE.left,
      width: STAGE.size,
      height: STAGE.size,
      label: "STAGE  (drag = move selected source)",
      address: "/stage",
    }),
  );

  // Source-select buttons S1..Sn in a 2-column grid.
  for (let i = 1; i <= CONFIG.maxSources; i++) {
    const row = Math.floor((i - 1) / 2);
    const col = (i - 1) % 2;
    widgets.push(
      button({
        id: `s${i}`,
        top: STAGE.top + row * ROW_H,
        left: col === 0 ? COL0 : COL1,
        width: BTN_W,
        height: 70,
        label: `S${i}`,
        address: `/select/${i}`,
      }),
    );
  }

  // Controls stacked below the select grid.
  const rows = Math.ceil(CONFIG.maxSources / 2);
  let y = STAGE.top + rows * ROW_H + 10;

  widgets.push(
    button({ id: "add", top: y, left: COL0, width: BTN_W, height: 60, label: "+ Add", address: "/add" }),
    button({ id: "remove", top: y, left: COL1, width: BTN_W, height: 60, label: "- Remove", address: "/remove" }),
  );
  y += ROW_H;
  widgets.push(
    button({ id: "setup", top: y, left: COL0, width: 230, height: 60, label: "Setup renderer", address: "/setup" }),
  );
  y += ROW_H;
  widgets.push(
    button({ id: "pan_vbap", top: y, left: COL0, width: BTN_W, height: 60, label: "VBAP2D", address: "/panning/vbap2d" }),
    button({ id: "pan_dbap", top: y, left: COL1, width: BTN_W, height: 60, label: "DBAP", address: "/panning/dbap" }),
  );
  y += ROW_H;
  widgets.push(
    button({ id: "viewer", top: y, left: COL0, width: 230, height: 50, label: "Open spat5 viewer", address: "/viewer" }, "toggle"),
  );

  // Gain fader for the selected source, full height alongside the stage.
  widgets.push(
    fader(
      { id: "gain", top: STAGE.top, left: 980, width: 100, height: STAGE.size, label: "Gain (sel) dB", address: "/gain" },
      -60,
      12,
    ),
  );

  return {
    type: "root",
    id: "root",
    width: 1120,
    height: y + 50 + 30,
    widgets,
  };
}

const session = buildSession();
const out = "server/osc/session.json";
writeFileSync(out, JSON.stringify(session, null, 2) + "\n");
console.log(`wrote ${out} (${session.widgets.length} widgets, ${CONFIG.maxSources} source slots)`);
