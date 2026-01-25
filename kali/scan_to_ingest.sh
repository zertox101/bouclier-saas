#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://backend:8005/events/ingest}"
TARGETS_FILE="${TARGETS_FILE:-/opt/scan/targets.txt}"
PUBLIC_TARGETS_FILE="${PUBLIC_TARGETS_FILE:-/opt/scan/targets_public.txt}"
SRC_IP="${SRC_IP:-203.0.113.10}"
EVENT_USER="${EVENT_USER:-scanner}"
HOST_NAME="${HOST_NAME:-kali-attacker}"
EVENT_TYPE="${EVENT_TYPE:-PENTESTER_EMULATION}"
SCAN_SEVERITY="${SCAN_SEVERITY:-low}"
PORTS="${SCAN_PORTS:-22,80,443,445,3389,8080,8443,3306,5432,8005,3000,8501,8100}"
ALLOW_PUBLIC_TARGETS="${ALLOW_PUBLIC_TARGETS:-0}"
REQUIRE_PUBLIC_ALLOWLIST="${REQUIRE_PUBLIC_ALLOWLIST:-1}"
CURL_TIMEOUT="${CURL_TIMEOUT:-5}"

require_bin() {
  command -v "$1" >/dev/null 2>&1 || { echo "[error] missing binary: $1"; exit 1; }
}

ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

declare -A PUBLIC_ALLOWLIST=()

load_public_allowlist() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    return 0
  fi
  while read -r line; do
    [[ -n "$line" ]] || continue
    PUBLIC_ALLOWLIST["$line"]=1
  done < <(grep -vE '^\s*#|^\s*$' "$file" || true)
}

is_ipv4() {
  local ip="$1"
  [[ "$ip" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || return 1
  IFS='.' read -r o1 o2 o3 o4 <<<"$ip"
  for o in "$o1" "$o2" "$o3" "$o4"; do
    [[ "$o" -ge 0 && "$o" -le 255 ]] || return 1
  done
  return 0
}

is_private_ipv4() {
  local ip="$1"
  is_ipv4 "$ip" || return 1
  IFS='.' read -r o1 o2 o3 o4 <<<"$ip"
  [[ "$o1" -eq 10 ]] && return 0
  [[ "$o1" -eq 172 && "$o2" -ge 16 && "$o2" -le 31 ]] && return 0
  [[ "$o1" -eq 192 && "$o2" -eq 168 ]] && return 0
  [[ "$o1" -eq 127 ]] && return 0
  [[ "$o1" -eq 169 && "$o2" -eq 254 ]] && return 0
  return 1
}

resolve_target() {
  local target="$1"
  if [[ "$target" == */* ]]; then
    echo "$target"
    return 0
  fi
  if is_ipv4 "$target"; then
    echo "$target"
    return 0
  fi
  local ip
  ip="$(getent ahostsv4 "$target" | awk '{print $1; exit}')"
  [[ -n "$ip" ]] || return 1
  echo "$ip"
}

is_allowed_target() {
  local target="$1"
  local resolved="$2"
  local base="$resolved"
  if [[ "$resolved" == */* ]]; then
    base="${resolved%%/*}"
  fi

  if is_private_ipv4 "$base"; then
    return 0
  fi

  if [[ "$ALLOW_PUBLIC_TARGETS" != "1" ]]; then
    return 1
  fi

  if [[ "$REQUIRE_PUBLIC_ALLOWLIST" != "1" ]]; then
    return 0
  fi

  if [[ -n "${PUBLIC_ALLOWLIST[$target]:-}" ]]; then
    return 0
  fi

  if [[ -n "${PUBLIC_ALLOWLIST[$resolved]:-}" ]]; then
    return 0
  fi

  return 1
}

send_event() {
  local dst_ip="$1"
  local port="$2"
  local state="$3"
  local svc="$4"
  local sev_override="${5:-$SCAN_SEVERITY}"

  local esc_user esc_host esc_src esc_dst esc_type esc_state esc_sev esc_svc esc_ports
  esc_user="$(json_escape "$EVENT_USER")"
  esc_host="$(json_escape "$HOST_NAME")"
  esc_src="$(json_escape "$SRC_IP")"
  esc_dst="$(json_escape "$dst_ip")"
  esc_type="$(json_escape "$EVENT_TYPE")"
  esc_state="$(json_escape "$state")"
  esc_sev="$(json_escape "$sev_override")"
  esc_svc="$(json_escape "${svc:-unknown}")"
  esc_ports="$(json_escape "$PORTS")"

  curl -sS --max-time "$CURL_TIMEOUT" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"timestamp_iso\":\"$(ts)\",
      \"user\":\"$esc_user\",
      \"host\":\"$esc_host\",
      \"src_ip\":\"$esc_src\",
      \"dst_ip\":\"$esc_dst\",
      \"event_type\":\"$esc_type\",
      \"status\":\"$esc_state\",
      \"severity\":\"$esc_sev\",
      \"details\":{
        \"port\":$port,
        \"dst_port\":$port,
        \"state\":\"$esc_state\",
        \"service\":\"$esc_svc\",
        \"scanner\":\"nmap\",
        \"ports_profile\":\"$esc_ports\"
      }
    }" >/dev/null || true
}

scan_target() {
  local target="$1"
  echo "[scan] $target"

  nmap -sT -Pn -n --max-retries 1 --host-timeout 30s --max-rate 50 \
    -p "$PORTS" -oG - "$target" \
  | awk '/Ports:/{print $2 "|" $0}' \
  | while IFS="|" read -r ip line; do
      local ports_line
      ports_line="$(echo "$line" | sed -n 's/.*Ports: //p')"
      [[ -n "$ports_line" ]] || continue
      echo "$ports_line" | tr ',' '\n' | while read -r entry; do
        entry="$(echo "$entry" | xargs)"
        [[ -n "$entry" ]] || continue
        IFS='/' read -r port state proto _ svc _ <<<"$entry"
        [[ "$proto" == "tcp" ]] || continue
        [[ "$state" == "open" ]] || continue
        send_event "$ip" "$port" "$state" "${svc:-unknown}"
        
        # Emulate exploitation attempts if port is critical
        if [[ "$port" == "22" || "$port" == "445" || "$port" == "3389" || "$port" == "80" || "$port" == "443" ]]; then
          echo "[emulate] exploit tool on $ip:$port"
          # Wait a bit to simulate processing
          sleep 1
          send_event "$ip" "$port" "exploit_attempt" "EXPLOITER_V1" "critical"
        fi
      done
    done
}

scan_list() {
  local file="$1"
  grep -vE '^\s*#|^\s*$' "$file" | while read -r target; do
    local resolved
    resolved="$(resolve_target "$target" || true)"
    if [[ -z "$resolved" ]]; then
      echo "[skip] cannot resolve target: $target"
      continue
    fi
    if ! is_allowed_target "$target" "$resolved"; then
      echo "[skip] public target not allowed: $target ($resolved)"
      continue
    fi
    scan_target "$resolved"
  done
}

main() {
  require_bin nmap
  require_bin curl

  local has_targets=0
  load_public_allowlist "$PUBLIC_TARGETS_FILE"

  if [[ -f "$TARGETS_FILE" ]]; then
    has_targets=1
    scan_list "$TARGETS_FILE"
  fi

  if [[ -f "$PUBLIC_TARGETS_FILE" ]]; then
    has_targets=1
    scan_list "$PUBLIC_TARGETS_FILE"
  fi

  if [[ "$has_targets" -eq 0 ]]; then
    echo "[error] targets file not found: $TARGETS_FILE (or $PUBLIC_TARGETS_FILE)"
    exit 1
  fi

  echo "done"
}

main
