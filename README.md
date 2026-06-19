# spatial-control

Browser control surface for the SPAT5 / Pure Data spatial-audio rig that feeds the
Omniwave system over Dante. Add emitters, move them around a stage, and set levels
from any browser on the network — without changing how Pd renders or how Dante carries
the audio.

## How it works

```
  Browser (any device)                Remote Mac  10.112.10.50
 ┌────────────────────┐   HTTP/WS    ┌───────────────────────────────────────────┐
 │  control surface    │ ──:8080───► │  Open Stage Control  ──custom module──┐    │
 │  (this IS "client") │ ◄────────── │  (serves UI + speaks OSC)             │    │
 └────────────────────┘             │                                       ▼    │
                                     │                       OSC/UDP :9000 → Pd   │
                                     │              [netreceive]→[oscparse]→spat~ │
                                     │                                  spat5 → dac~
                                     └───────────────────────────────────────┼────┘
                                                                              │ Dante
                                                                              ▼
                                                                         Omniwave → speakers
```

- **Open Stage Control's server *is* the web server.** The browser loads the UI from
  it; there is nothing to host separately. See [`client/`](client/).
- The **custom module** ([`src/module/spatial.ts`](src/module/spatial.ts)) translates UI
  actions into the SPAT5 OSC your patches already use (`/source/N/azim`, `/source/number`,
  `/speakers/az`, `/panning/type`, …).
- Pd renders exactly as before; **Dante and Omniwave are untouched.**

## Layout

```
spatial-control/
├── src/                      # TypeScript source (the "proper project")
│   ├── config.ts             #   single source of truth: ports, speakers, mapping
│   ├── spat5.ts              #   typed SPAT5 OSC address builders
│   ├── osc-types.ts          #   Open Stage Control runtime types
│   ├── module/spatial.ts     #   the custom module
│   └── session/              #   typed UI -> session.json generator
├── server/                   # what runs on the remote Mac
│   ├── osc/
│   │   ├── session.json      #   GENERATED UI layout
│   │   ├── modules/spatial.js#   GENERATED bundled module (what O-S-C loads)
│   │   └── run.sh            #   launcher
│   └── pd/                   #   OSC-ingress abstraction + monitor patch (+ README)
└── client/                   # no files — the client is your browser (README explains)
```

`server/osc/session.json` and `server/osc/modules/spatial.js` are build outputs but are
**committed**, so the remote Mac can run without a build step.

## Build (on your dev machine)

```bash
npm install
npm run build      # typecheck -> bundle module -> generate session.json
```

Edit behaviour in [`src/config.ts`](src/config.ts) (speaker azimuths, source count,
axis flips, distance range), then re-run `npm run build`.

## Run (on the remote Mac, 10.112.10.50)

Prerequisites there: **Pd + SPAT5** and **[Open Stage Control](https://openstagecontrol.ammd.net/)**
(`npm i -g open-stage-control`, or the macOS `.app`).

1. **Wire OSC into Pd** — follow [`server/pd/README.md`](server/pd/README.md) to add
   `spatial-osc-receive` to your patch (→ `spat5.spat~`).
2. **Start Open Stage Control:**
   ```bash
   cd server/osc && ./run.sh
   ```
3. **Open the control surface** from any device on the LAN:
   ```
   http://10.112.10.50:8080
   ```
4. Click **Setup renderer** once (pushes source count, speaker layout, panning to Pd),
   then **+ Add**, select a source (S1…S8), and drag the **stage** to move it.

### Smoke test before the real patch

Open [`server/pd/osc-monitor.pd`](server/pd/osc-monitor.pd) instead of your show patch,
start O-S-C, and drag the stage — you should see `OSC-IN: /source/1/azim …` in Pd's
console. This proves browser → O-S-C → Pd end-to-end before SPAT5 is involved.

## Ports

| Port | Proto | From → To | Purpose |
|------|-------|-----------|---------|
| 8080 | TCP/HTTP+WS | browser → remote Mac | the control surface UI |
| 9000 | UDP | O-S-C → Pd (localhost) | SPAT5 OSC control |
| 9001 | UDP | Pd → O-S-C (localhost) | optional feedback |

## Tuning / gotchas

- **Speaker layout:** set `speakers` in `src/config.ts` to your real rig before relying on
  panning. Default is `random_multichannel.maxpat`'s `300 0 60 120 180 240`.
- **Mirrored movement:** if left/right or front/back is reversed, flip `flipX` / `flipY`
  (or rotate the whole field with `azimOffset`) in `src/config.ts`.
- **Confirmed vs best-effort OSC:** `/source/N/azim`, `/source/number`, `/speaker/number`,
  `/speakers/az`, `/panning/type`, `/viewer/visible`, `/window/open|close` were seen in
  your patches. `/source/N/dist` and `/source/N/gain` are best-effort — if they do nothing,
  verify with `spat5.osc.print` and fix the one line in [`src/spat5.ts`](src/spat5.ts).
- **`spat5.spat~ @inputs`** must be ≥ `maxSources` (8) or extra sources won't render.
- This is open-loop (UI is the source of truth). Feedback dots are a future addition via
  the `:9001` return path.
```
