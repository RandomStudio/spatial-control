# Pd side — OSC ingress into SPAT5 (Pure Data variant)

> Your production rig is **Max** — use [`../max/`](../max/) instead. This folder is only
> for the Pure Data version (the `spat5.test.pd` file).

Open Stage Control sends SPAT5 OSC over UDP to Pd. These two patches receive it.
Both use **Pd-vanilla** objects only (`netreceive`, `oscparse`, `list trim`) —
no externals — and assume Pd ≥ 0.51 (which SPAT5 already requires).

## Files

- **`spatial-osc-receive.pd`** — the abstraction to add to your real patch.
  `[netreceive -u -b 9000] → [oscparse] → [list trim] → outlet`.
  Its outlet emits ready-to-use SPAT5 messages like `/source/1/azim 45`.
- **`osc-monitor.pd`** — a standalone tester that prints everything it receives.
  Use it to confirm the network path before touching your show patch.

## Wire it into your patch

1. Copy `spatial-osc-receive.pd` next to your main patch (or anywhere on Pd's search path).
2. In your main patch, create an object box: `spatial-osc-receive`.
3. Connect its **outlet** to the **left inlet** of `spat5.spat~` (this renders the
   audio). Optionally also connect it to the left inlet of `spat5.oper` so the
   on-screen viewer reflects the moves too. Sending the same OSC to both is harmless.
4. Save. The browser control surface now drives the renderer.

The port (`9000`) must match `pdPort` in [`../../src/config.ts`](../../src/config.ts)
and `PD_SEND` in [`../osc/run.sh`](../osc/run.sh).

## Verify the format (do this first)

1. Open `osc-monitor.pd` in Pd.
2. Start Open Stage Control (`../osc/run.sh`) and drag the stage in the browser.
3. In the Pd console you should see lines like:

   ```
   OSC-IN: /source/1/azim 45
   OSC-IN: /source/1/dist 3.2
   ```

   If instead you see the address **split** (`OSC-IN: source 1 azim 45`), your Pd's
   `oscparse` splits paths into separate symbols. In that case insert SPAT5's
   `spat5.osc.parse` (or rebuild the address) between `list trim` and the outlet —
   ping me and I'll adjust the abstraction. The monitor is here precisely so this
   is a 30-second check, not a mystery.
