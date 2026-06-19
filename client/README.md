# client/

**There are no files to deploy here — and that's correct.**

In Open Stage Control, *the client is your web browser*. The Open Stage Control
**server** (running on the remote Mac, see [`../server/`](../server/)) serves the
UI over HTTP. You don't host or copy anything onto a separate web server.

To use the control surface, open a browser on any device on the same network as
the remote Mac and go to:

```
http://10.112.10.50:8080
```

That page **is** the client. Drag the stage, add emitters, etc. — the server
translates your actions into SPAT5 OSC and sends them to Pd.

The UI layout itself lives in [`../server/osc/session.json`](../server/osc/session.json)
(generated from TypeScript in [`../src/session/`](../src/session/)) because it is
loaded and served by the server process — not stored here.
