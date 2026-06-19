# Max side — OSC ingress into SPAT5

This is the **primary** engine side (your rig is Max/MSP + SPAT5). Open Stage
Control sends SPAT5 OSC over UDP to Max; these instructions add the receiver.

Open Stage Control speaks OSC; SPAT5 objects already parse OSC messages on their
inlet (exactly like the `/speakers/az …` message boxes in `random_multichannel.maxpat`).
So the receiver is genuinely two objects.

## Add the receiver to your patch

1. In your Max patch, create an object: **`udpreceive 9000`**
   (CNMAT object — it deserialises incoming OSC into Max messages like
   `/source/1/azim 45`). The port must match `enginePort` in
   [`../../src/config.ts`](../../src/config.ts) and `PD_SEND`/`ENGINE_SEND` in
   [`../osc/run.sh`](../osc/run.sh).
2. Connect `udpreceive`'s **outlet** to the **left inlet** of **`spat5.spat~`**
   (this renders the audio). Optionally also connect it to **`spat5.oper`** so the
   on-screen viewer reflects the moves. Sending the same OSC to both is harmless.
3. Lock the patch. The browser control surface now drives the renderer.

```
[udpreceive 9000]
   |
   ├─> [spat5.spat~]     (renders -> Dante -> Omniwave)
   └─> [spat5.oper]      (optional: updates the viewer)
```

## Verify first with the monitor

Open **`osc-monitor.maxpat`** (here in this folder). It is just
`[udpreceive 9000] → [print OSC-IN]`. Start Open Stage Control (`../osc/run.sh`),
drag the stage in the browser, and watch the Max console:

```
OSC-IN: /source/1/azim 45
OSC-IN: /source/1/dist 3.2
```

That proves browser → Open Stage Control → Max end-to-end before SPAT5 is involved.

## If `udpreceive` shows up red (missing object)

`udpreceive` ships with **CNMAT-Externals**. Install it from Max's
**Package Manager** (search "CNMAT-Externals"), then reopen the patch. A SPAT5
install usually already has it. (If you instead use odot's `o.io.udpreceive`, its
output is a FullPacket — add `[o.route …]` or convert before `spat5.spat~`; the
classic CNMAT `udpreceive` feeds SPAT5 directly with no extra objects.)
