/* GENERATED from src/module/spatial.ts — edit the TS source, then `npm run build`. */
"use strict";

// src/config.ts
var CONFIG = {
  engineHost: "127.0.0.1",
  enginePort: 9e3,
  maxSources: 8,
  startSources: 2,
  // From random_multichannel.maxpat. CHANGE to match your physical speaker layout.
  speakers: [300, 0, 60, 120, 180, 240],
  panning: "vbap2d",
  minDist: 0.5,
  maxDist: 8,
  flipX: 1,
  flipY: 1,
  azimOffset: 0,
  webPort: 8080,
  oscInPort: 9001
};

// src/spat5.ts
var spat5 = {
  // --- per source ---
  sourceAzim: (i) => `/source/${i}/azim`,
  // CONFIRMED
  sourceDist: (i) => `/source/${i}/dist`,
  // BEST-EFFORT
  sourceGain: (i) => `/source/${i}/gain`,
  // BEST-EFFORT
  // --- scene / renderer ---
  sourceNumber: "/source/number",
  // CONFIRMED
  speakerNumber: "/speaker/number",
  // CONFIRMED
  speakersAz: "/speakers/az",
  // CONFIRMED
  panningType: "/panning/type",
  // CONFIRMED
  // --- viewer window (on the server's own screen) ---
  viewerVisible: "/viewer/visible",
  // CONFIRMED
  windowOpen: "/window/open",
  // CONFIRMED
  windowClose: "/window/close"
  // CONFIRMED
};

// src/module/spatial.ts
var C = CONFIG;
var state = { selected: 1, count: C.startSources, pos: {} };
function num(a) {
  return a && typeof a === "object" && "value" in a ? Number(a.value) : Number(a);
}
function pressed(args) {
  if (!args || !args.length) return true;
  return num(args[args.length - 1]) !== 0;
}
function spat(address, ...rest) {
  try {
    send(C.engineHost, C.enginePort, address, ...rest);
  } catch (e) {
    console.log(`spatial: send failed for ${address}`, e);
  }
}
function xyToAzDist(x, y) {
  x *= C.flipX;
  y *= C.flipY;
  const az = Math.atan2(-x, y) * 180 / Math.PI + C.azimOffset;
  const r = Math.min(1, Math.hypot(x, y));
  const dist = C.minDist + r * (C.maxDist - C.minDist);
  return { az: Math.round(az * 10) / 10, dist: Math.round(dist * 100) / 100 };
}
function moveSource(i, x, y) {
  const p = xyToAzDist(x, y);
  state.pos[i] = { x, y };
  spat(spat5.sourceAzim(i), p.az);
  spat(spat5.sourceDist(i), p.dist);
}
function setupRenderer() {
  spat(spat5.sourceNumber, state.count);
  spat(spat5.speakerNumber, C.speakers.length);
  spat(spat5.speakersAz, ...C.speakers);
  spat(spat5.panningType, C.panning);
  console.log(
    `spatial: setup -> ${state.count} sources, ${C.speakers.length} speakers @ [${C.speakers.join(" ")}], ${C.panning}`
  );
}
var mod = {
  init() {
    console.log(
      `spatial-control ready -> Max ${C.engineHost}:${C.enginePort}, ${state.count}/${C.maxSources} sources`
    );
  },
  oscOutFilter(data) {
    const { address } = data;
    const args = data.args || [];
    if (address === "/stage") {
      moveSource(state.selected, num(args[0]), num(args[1]));
      return;
    }
    if (address.indexOf("/select/") === 0) {
      if (pressed(args)) {
        state.selected = parseInt(address.split("/")[2] ?? "1", 10) || 1;
        console.log(`spatial: selected source ${state.selected}`);
        const p = state.pos[state.selected];
        if (p) {
          try {
            receive("/stage", p.x, p.y);
          } catch {
          }
        }
      }
      return;
    }
    if (address === "/add") {
      if (pressed(args) && state.count < C.maxSources) {
        state.count++;
        spat(spat5.sourceNumber, state.count);
        spat(spat5.sourceAzim(state.count), 0);
        state.selected = state.count;
        console.log(`spatial: added -> ${state.count} sources`);
      }
      return;
    }
    if (address === "/remove") {
      if (pressed(args) && state.count > 1) {
        state.count--;
        spat(spat5.sourceNumber, state.count);
        if (state.selected > state.count) state.selected = state.count;
        console.log(`spatial: removed -> ${state.count} sources`);
      }
      return;
    }
    if (address === "/gain") {
      spat(spat5.sourceGain(state.selected), num(args[0]));
      return;
    }
    if (address.indexOf("/panning/") === 0) {
      if (pressed(args)) spat(spat5.panningType, address.split("/")[2] ?? C.panning);
      return;
    }
    if (address === "/setup") {
      if (pressed(args)) setupRenderer();
      return;
    }
    if (address === "/viewer") {
      const on = num(args[0]) ? 1 : 0;
      spat(spat5.viewerVisible, on);
      spat(on ? spat5.windowOpen : spat5.windowClose);
      return;
    }
    return data;
  }
};
module.exports = mod;
