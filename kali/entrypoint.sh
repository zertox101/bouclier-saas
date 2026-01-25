#!/usr/bin/env bash
set -euo pipefail

if [[ "${AUTO_SCAN:-0}" == "1" ]]; then
  exec /bin/bash /opt/scan/run_forever.sh
fi

echo "[kali] AUTO_SCAN=0; container idle."
exec tail -f /dev/null
