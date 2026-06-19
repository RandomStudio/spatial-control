/**
 * Single source of truth for the whole project.
 *
 * Both the Open Stage Control custom module (src/module/spatial.ts) and the
 * session/UI generator (src/session/build-session.ts) import this, so the UI
 * and the OSC translation can never drift apart.
 *
 * Edit values here, then run `npm run build`.
 */

export interface SpatialConfig {
  /** Pd host. Same machine as Open Stage Control, so localhost. */
  readonly pdHost: string;
  /** UDP port Pd listens on — must match `[netreceive -u -b <port>]` in the patch. */
  readonly pdPort: number;

  /** Pre-allocated source slots. MUST be <= `spat5.spat~ @inputs`. Drives the S1..Sn buttons. */
  readonly maxSources: number;
  /** Sources active at startup. */
  readonly startSources: number;

  /** Speaker azimuths (degrees) sent by the "Setup renderer" button. SET TO YOUR RIG. */
  readonly speakers: readonly number[];
  /** Panning algorithm sent at setup (e.g. "vbap2d", "dbap"). */
  readonly panning: string;

  /** Stage-pad radius -> distance mapping (metres) at pad centre vs pad edge. */
  readonly minDist: number;
  readonly maxDist: number;
  /** Flip to -1 if left/right (X) or front/back (Y) come out mirrored on the rig. */
  readonly flipX: 1 | -1;
  readonly flipY: 1 | -1;
  /** Rotate the whole field (degrees) if "front" isn't where you expect. */
  readonly azimOffset: number;

  /** Ports used by run.sh (kept here for reference; bash can't import TS). */
  readonly webPort: number;
  readonly oscInPort: number;
}

export const CONFIG: SpatialConfig = {
  pdHost: "127.0.0.1",
  pdPort: 9000,

  maxSources: 8,
  startSources: 2,

  // From random_multichannel.maxpat. CHANGE to match your physical speaker layout.
  speakers: [300, 0, 60, 120, 180, 240],
  panning: "vbap2d",

  minDist: 0.5,
  maxDist: 8.0,
  flipX: 1,
  flipY: 1,
  azimOffset: 0,

  webPort: 8080,
  oscInPort: 9001,
};
