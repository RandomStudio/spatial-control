/**
 * Typed builders for the SPAT5 OSC vocabulary actually used by this rig.
 *
 * Addresses marked CONFIRMED were observed verbatim in the user's patches
 * (spat5.test.pd / random_multichannel.maxpat). Addresses marked BEST-EFFORT
 * follow SPAT5's documented namespace pattern but were not seen in those files —
 * if one does nothing, check it against `spat5.osc.print` and fix it here.
 */

export const spat5 = {
  // --- per source ---
  sourceAzim: (i: number) => `/source/${i}/azim`, // CONFIRMED
  sourceDist: (i: number) => `/source/${i}/dist`, // BEST-EFFORT
  sourceGain: (i: number) => `/source/${i}/gain`, // BEST-EFFORT

  // --- scene / renderer ---
  sourceNumber: "/source/number" as const, // CONFIRMED
  speakerNumber: "/speaker/number" as const, // CONFIRMED
  speakersAz: "/speakers/az" as const, // CONFIRMED
  panningType: "/panning/type" as const, // CONFIRMED

  // --- viewer window (on the server's own screen) ---
  viewerVisible: "/viewer/visible" as const, // CONFIRMED
  windowOpen: "/window/open" as const, // CONFIRMED
  windowClose: "/window/close" as const, // CONFIRMED
} as const;
