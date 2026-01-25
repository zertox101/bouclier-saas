#!/usr/bin/env bash
set -euo pipefail

INTERVAL_SEC="${INTERVAL_SEC:-60}"

while true; do
  /bin/bash /opt/scan/scan_to_ingest.sh || true
  sleep "$INTERVAL_SEC"
done
