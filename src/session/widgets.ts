/** Minimal typed widget builders for an Open Stage Control session. */

export interface Widget {
  type: string;
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  label?: string;
  address?: string;
  [k: string]: unknown;
}

export interface Session {
  type: "root";
  id: string;
  width: number;
  height: number;
  widgets: Widget[];
}

interface Box {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  label?: string;
  address: string;
}

export function button(b: Box, mode: "tap" | "toggle" | "push" = "tap"): Widget {
  return { type: "button", mode, ...b };
}

export function xy(b: Box, range = 1, pointSize = 28): Widget {
  return {
    type: "xy",
    ...b,
    rangeX: { min: -range, max: range },
    rangeY: { min: -range, max: range },
    pointSize,
    decimals: 4,
  };
}

export function fader(b: Box, min: number, max: number, value = 0): Widget {
  return { type: "fader", ...b, range: { min, max }, value };
}
