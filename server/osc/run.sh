#!/usr/bin/env bash
# Launch Open Stage Control with the spatial-control session + module.
# Run this ON THE SAME MAC AS Max/SPAT5 (10.112.10.50) so OSC stays on localhost.
#
#   ./run.sh
#   then browse from any device on the LAN to:  http://10.112.10.50:8080
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION="$HERE/session.json"
MODULE="$HERE/modules/spatial.js"

ENGINE_SEND="127.0.0.1:9000"  # -> Max's [udpreceive 9000]  (keep in sync with src/config.ts)
WEB_PORT="8080"               # browser UI:  http://<this-mac-ip>:8080
OSC_IN_PORT="9001"            # OSC feedback from Max (optional)

# Resolve the Open Stage Control executable. Open Stage Control is distributed as a
# prebuilt macOS .app (not an npm global), so we look for it in /Applications.
# Override anytime with:  OSC_BIN="/path/to/binary" ./run.sh
BIN="${OSC_BIN:-}"
if [ -z "$BIN" ]; then
  if command -v open-stage-control >/dev/null 2>&1; then
    BIN="open-stage-control"
  else
    # Find the app (matches "Open Stage Control.app" or "open-stage-control.app")
    APP="$(ls -d /Applications/*[Ss]tage*[Cc]ontrol*.app 2>/dev/null | head -n1 || true)"
    if [ -n "$APP" ] && [ -d "$APP/Contents/MacOS" ]; then
      BIN="$(ls "$APP/Contents/MacOS/"* 2>/dev/null | head -n1 || true)"
    fi
  fi
fi

if [ -z "$BIN" ] || { ! command -v "$BIN" >/dev/null 2>&1 && [ ! -x "$BIN" ]; }; then
  echo "ERROR: Open Stage Control not found." >&2
  echo "Put the app in /Applications, or set OSC_BIN to its binary, e.g.:" >&2
  echo '  OSC_BIN="/Applications/Open Stage Control.app/Contents/MacOS/Open Stage Control" ./run.sh' >&2
  exit 1
fi
echo "Using Open Stage Control: $BIN"

echo "Serving UI on http://0.0.0.0:${WEB_PORT}  ->  sending OSC to ${ENGINE_SEND}"
exec "$BIN" \
  --load "$SESSION" \
  --custom-module "$MODULE" \
  --send "$ENGINE_SEND" \
  --port "$WEB_PORT" \
  --osc-port "$OSC_IN_PORT"
