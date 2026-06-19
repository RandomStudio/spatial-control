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

/** The root container widget. */
export interface Root {
  type: "root";
  id: string;
  width: number;
  height: number;
  widgets: Widget[];
}

/**
 * A session file as Open Stage Control reads it: the root widget is nested under `session`,
 * with the version + a fixed envelope type alongside. Writing the root at the top level
 * (no wrapper) makes O-S-C throw "cannot read properties of undefined (reading 'type')".
 */
export interface Session {
  session: Root;
  /** Matches the installed Open Stage Control version so it doesn't warn on load. */
  version: string;
  type: "Open Stage Control session";
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

/** A greyed-out, non-interactive button look-alike (a styled text widget). */
export function disabledButton(b: {
  id: string;
  top: number;
  left: number;
  width: number;
  height: number;
  text: string;
}): Widget {
  return {
    type: "text",
    id: b.id,
    top: b.top,
    left: b.left,
    width: b.width,
    height: b.height,
    value: b.text,
    css:
      `background: #2a2a2a; color: #666; border: 1px solid #444;` +
      ` border-radius: 3px; opacity: 0.6; cursor: not-allowed;`,
  };
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

/** A static image. `src` is resolved relative to the session file by the O-S-C server. */
export function image(
  b: Omit<Box, "address" | "label">,
  src: string,
): Widget {
  return {
    type: "image",
    ...b,
    value: src,
    size: "cover",
    position: "center",
    css: "opacity: 0.85; pointer-events: none;",
  };
}

/** A non-interactive speaker marker — a small labelled disc placed on the floorplan. */
export function speaker(b: {
  id: string;
  top: number;
  left: number;
  size: number;
  text: string;
}): Widget {
  return {
    type: "text",
    id: b.id,
    top: b.top,
    left: b.left,
    width: b.size,
    height: b.size,
    value: b.text,
    css:
      `border-radius: 50%; background: rgba(255,140,0,0.9);` +
      ` color: #fff; font-weight: 700; box-shadow: 0 0 6px rgba(0,0,0,0.6);` +
      ` pointer-events: none;`,
  };
}
