#!/usr/bin/env bash
# Launch Open Stage Control with the spatial-control session + module.
# Run this ON THE SAME MAC AS Pd (10.112.10.50) so OSC to Pd stays on localhost.
#
#   ./run.sh
#   then browse from any device on the LAN to:  http://10.112.10.50:8080
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION="$HERE/session.json"
MODULE="$HERE/modules/spatial.js"

PD_SEND="127.0.0.1:9000"   # -> Pd's [netreceive -u -b 9000]  (keep in sync with src/config.ts)
WEB_PORT="8080"            # browser UI:  http://<this-mac-ip>:8080
OSC_IN_PORT="9001"         # OSC feedback from Pd (optional)

# npm global install exposes `open-stage-control`. If you installed the macOS .app,
# set OSC_BIN, e.g.:
#   OSC_BIN="/Applications/open-stage-control.app/Contents/MacOS/open-stage-control" ./run.sh
BIN="${OSC_BIN:-open-stage-control}"

if ! command -v "$BIN" >/dev/null 2>&1 && [ ! -x "$BIN" ]; then
  echo "ERROR: '$BIN' not found. Install Open Stage Control, or set OSC_BIN to the app binary." >&2
  exit 1
fi

echo "Serving UI on http://0.0.0.0:${WEB_PORT}  ->  sending OSC to ${PD_SEND}"
exec "$BIN" \
  --load "$SESSION" \
  --custom-module "$MODULE" \
  --send "$PD_SEND" \
  --port "$WEB_PORT" \
  --osc-port "$OSC_IN_PORT"
