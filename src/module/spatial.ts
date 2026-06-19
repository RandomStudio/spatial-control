/**
 * Open Stage Control custom module — spatial-control.
 *
 * Translates the browser control-surface widgets (session.json) into SPAT5 OSC
 * and forwards it to Pd on the same machine. The widgets use "semantic" addresses
 * (/stage, /select/N, /add, ...) that SPAT5 does not understand; we intercept them
 * in oscOutFilter(), translate, and send the real SPAT5 messages. Handled
 * addresses are dropped (we return nothing) so only translated OSC reaches Pd.
 *
 *   browser ──ws──> O-S-C server ──this module──> [netreceive -u -b 9000] in Pd ──> spat5.spat~
 *
 * Build: `npm run build:module` (esbuild bundles this + config into one CJS file).
 */

import { CONFIG } from "../config";
import { spat5 } from "../spat5";
import type { CustomModule, OscArg, OscData } from "../osc-types";

const C = CONFIG;

interface State {
  selected: number;
  count: number;
  pos: Record<number, { x: number; y: number }>;
}
const state: State = { selected: 1, count: C.startSources, pos: {} };

function num(a: OscArg): number {
  return a && typeof a === "object" && "value" in a ? Number(a.value) : Number(a);
}

/** tap/toggle widgets emit a trailing value; act only on the pressed (non-zero) edge. */
function pressed(args: OscArg[]): boolean {
  if (!args || !args.length) return true;
  return num(args[args.length - 1]!) !== 0;
}

/** Send one OSC message to Pd. */
function spat(address: string, ...rest: Array<number | string>): void {
  try {
    send(C.pdHost, C.pdPort, address, ...rest);
  } catch (e) {
    console.log(`spatial: send failed for ${address}`, e);
  }
}

/** Map a stage point in [-1,1]^2 to SPAT5 azimuth (deg) + distance (m). */
function xyToAzDist(x: number, y: number): { az: number; dist: number } {
  x *= C.flipX;
  y *= C.flipY;
  // SPAT5/IRCAM: 0deg = front, counter-clockwise positive (90 = left).
  // Pad: +y = front (up), +x = right.
  const az = (Math.atan2(-x, y) * 180) / Math.PI + C.azimOffset;
  const r = Math.min(1, Math.hypot(x, y));
  const dist = C.minDist + r * (C.maxDist - C.minDist);
  return { az: Math.round(az * 10) / 10, dist: Math.round(dist * 100) / 100 };
}

function moveSource(i: number, x: number, y: number): void {
  const p = xyToAzDist(x, y);
  state.pos[i] = { x, y };
  spat(spat5.sourceAzim(i), p.az); // CONFIRMED
  spat(spat5.sourceDist(i), p.dist); // BEST-EFFORT (see README if distance does nothing)
}

function setupRenderer(): void {
  spat(spat5.sourceNumber, state.count);
  spat(spat5.speakerNumber, C.speakers.length);
  spat(spat5.speakersAz, ...C.speakers);
  spat(spat5.panningType, C.panning);
  console.log(
    `spatial: setup -> ${state.count} sources, ${C.speakers.length} speakers ` +
      `@ [${C.speakers.join(" ")}], ${C.panning}`,
  );
}

const mod: CustomModule = {
  init() {
    console.log(
      `spatial-control ready -> Pd ${C.pdHost}:${C.pdPort}, ` +
        `${state.count}/${C.maxSources} sources`,
    );
  },

  oscOutFilter(data: OscData): OscData | void {
    const { address } = data;
    const args = data.args || [];

    // move the selected source
    if (address === "/stage") {
      moveSource(state.selected, num(args[0]!), num(args[1]!));
      return;
    }

    // pick which source the stage controls
    if (address.indexOf("/select/") === 0) {
      if (pressed(args)) {
        state.selected = parseInt(address.split("/")[2] ?? "1", 10) || 1;
        console.log(`spatial: selected source ${state.selected}`);
        const p = state.pos[state.selected];
        if (p) {
          try {
            receive("/stage", p.x, p.y); // reflect stored position on the pad
          } catch {
            /* non-critical */
          }
        }
      }
      return;
    }

    // add / remove emitters
    if (address === "/add") {
      if (pressed(args) && state.count < C.maxSources) {
        state.count++;
        spat(spat5.sourceNumber, state.count);
        spat(spat5.sourceAzim(state.count), 0); // park new source at front
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

    // level of the selected source
    if (address === "/gain") {
      spat(spat5.sourceGain(state.selected), num(args[0]!));
      return;
    }

    // panning algorithm: /panning/<type>
    if (address.indexOf("/panning/") === 0) {
      if (pressed(args)) spat(spat5.panningType, address.split("/")[2] ?? C.panning);
      return;
    }

    // (re)initialise the renderer
    if (address === "/setup") {
      if (pressed(args)) setupRenderer();
      return;
    }

    // pop the spat5 viewer window on the server's screen
    if (address === "/viewer") {
      const on = num(args[0]!) ? 1 : 0;
      spat(spat5.viewerVisible, on);
      spat(on ? spat5.windowOpen : spat5.windowClose);
      return;
    }

    return data; // unhandled -> pass through unchanged
  },
};

export = mod;
