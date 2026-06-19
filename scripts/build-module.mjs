// Bundles the TypeScript custom module into a single self-contained CommonJS file
// that Open Stage Control can load via --custom-module. Run: `npm run build:module`.
import { build } from "esbuild";

await build({
  entryPoints: ["src/module/spatial.ts"],
  outfile: "server/osc/modules/spatial.js",
  bundle: true, // inline config + helpers; O-S-C loads ONE file in a sandbox
  platform: "node",
  format: "cjs",
  target: "node16",
  legalComments: "none",
  banner: {
    js: "/* GENERATED from src/module/spatial.ts — edit the TS source, then `npm run build`. */",
  },
});

console.log("wrote server/osc/modules/spatial.js");
