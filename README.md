# spatial-control

Browser control surface for the **Max/MSP + SPAT5** spatial-audio rig that feeds the
Omniwave system over Dante. Add emitters, move them around a stage, and set levels from
any browser on the network — without changing how Max renders or how Dante carries the audio.

## How it works

```
  Browser (your laptop/tablet)         Remote Mac  10.112.10.50
 ┌────────────────────┐   HTTP/WS    ┌───────────────────────────────────────────┐
 │  control surface    │ ──:8080───► │  Open Stage Control  ──custom module──┐    │
 │  (this IS "client") │ ◄────────── │  (serves UI + speaks OSC)             │    │
 └────────────────────┘             │                                       ▼    │
                                     │                      OSC/UDP :9000 → Max   │
                                     │                  [udpreceive 9000] → spat5.spat~
                                     │                                  spat5 → dac~
                                     └───────────────────────────────────────┼────┘
                                                                              │ Dante
                                                                              ▼
                                                                         Omniwave → speakers
```

- **Open Stage Control's server *is* the web server.** The browser loads the UI from it;
  nothing is hosted separately. See [`client/`](client/).
- The **custom module** ([`src/module/spatial.ts`](src/module/spatial.ts)) translates UI
  actions into the SPAT5 OSC your Max patch already uses (`/source/N/azim`, `/source/number`,
  `/speakers/az`, `/panning/type`, …).
- Max renders exactly as before; **Dante and Omniwave are untouched.**

## Layout

```
spatial-control/
├── src/                      # TypeScript source (the project)
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
│   ├── max/                  #   PRIMARY: OSC-ingress for Max (+ monitor patch + README)
│   └── pd/                   #   Pure Data variant (only if you run the spat5.test.pd version)
└── client/                   # no files — the client is your browser (README explains)
```

`server/osc/session.json` and `server/osc/modules/spatial.js` are build outputs but are
**committed**, so the remote Mac runs without a build step.

## Build (on your dev machine)

```bash
npm install
npm run build      # typecheck -> bundle module -> generate session.json
```

Edit behaviour in [`src/config.ts`](src/config.ts) (speaker azimuths, source count, axis
flips, distance range), then re-run `npm run build`.

## Deploy & run on the remote Mac (10.112.10.50)

That Mac is the one already running **Max + SPAT5 + Dante**. Everything below happens on it;
your laptop only ever opens a browser.

**1. Get the files onto it.** Copy the whole repo across (AirDrop / `scp` / `rsync` / a USB
stick — it's just files). Only `server/` is needed at runtime, but copying everything is fine.

```bash
# example, from your dev machine:
rsync -av ~/repos/spatial-control/ andrew@10.112.10.50:~/spatial-control/
```

**2. Install Open Stage Control on that Mac.** This is the one new piece of software — it's
the server that hosts the UI and sends OSC. Download the **macOS app** from
<https://openstagecontrol.ammd.net/> (GitHub releases) and drop it in **/Applications**.
(It's a prebuilt app, not an npm package — `run.sh` auto-detects it in /Applications.)

It must live on the *same* Mac as Max so OSC to Max stays on `127.0.0.1` (no firewall, no
latency in the control path).

**3. Add the OSC receiver to your Max patch.** Two objects — see
[`server/max/README.md`](server/max/README.md): `udpreceive 9000` → `spat5.spat~`.

**4. Smoke-test the path** before touching your show patch: open
[`server/max/osc-monitor.maxpat`](server/max/osc-monitor.maxpat), then:

```bash
cd server/osc && ./run.sh
```

From your laptop open **`http://10.112.10.50:8080`** and drag the stage — you should see
`OSC-IN: /source/1/azim …` in the Max console. That confirms browser → O-S-C → Max works.

**5. Go live.** Point the receiver at your real patch (step 3), reload, then in the browser
click **Setup renderer** once, **+ Add** an emitter, select S1…S8, and drag the stage to move it.

## Ports

| Port | Proto | From → To | Purpose |
|------|-------|-----------|---------|
| 8080 | TCP/HTTP+WS | browser → remote Mac | the control surface UI |
| 9000 | UDP | O-S-C → Max (localhost) | SPAT5 OSC control |
| 9001 | UDP | Max → O-S-C (localhost) | optional feedback |

## Tuning / gotchas

- **Speaker layout:** set `speakers` in `src/config.ts` to your real rig before relying on
  panning. Default is `random_multichannel.maxpat`'s `300 0 60 120 180 240`.
- **Mirrored movement:** if left/right or front/back is reversed, flip `flipX` / `flipY`
  (or rotate the field with `azimOffset`) in `src/config.ts`.
- **Confirmed vs best-effort OSC:** `/source/N/azim`, `/source/number`, `/speaker/number`,
  `/speakers/az`, `/panning/type`, `/viewer/visible`, `/window/open|close` were seen in your
  patches. `/source/N/dist` and `/source/N/gain` are best-effort — if they do nothing, verify
  with `spat5.osc.print` and fix the one line in [`src/spat5.ts`](src/spat5.ts).
- **`spat5.spat~ @inputs`** must be ≥ `maxSources` (8) or extra sources won't render.
- **`udpreceive` missing/red in Max?** Install CNMAT-Externals via the Max Package Manager.
- This is open-loop (UI is the source of truth). Live feedback dots are a future addition via
  the `:9001` return path.
