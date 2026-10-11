#!/usr/bin/env bash
# Launch, check, and stop the Wildflower verification server.
# Kills only the process tree this script started. Leaves evidence in place.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
RUN_DIR="$ROOT/tmp/verify-wildflower/run"
PORT_FILE="$RUN_DIR/port"
PID_FILE="$RUN_DIR/pid"
LOG_FILE="$RUN_DIR/next.log"
DEFAULT_PORT=3117
READY_PATH="/shows"

usage() {
  echo "usage: verify-wildflower.sh launch|doctor|cleanup" >&2
  exit 2
}

listener_pid() {
  local port="$1"
  lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null | head -n 1 || true
}

descendants_of() {
  local pid="$1"
  local child
  echo "$pid"
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    descendants_of "$child"
  done
}

owns_listener() {
  local root_pid="$1"
  local listen_pid="$2"
  local desc
  while IFS= read -r desc; do
    if [[ "$desc" == "$listen_pid" ]]; then
      return 0
    fi
  done < <(descendants_of "$root_pid")
  return 1
}

other_next_dev() {
  local our_pid="${1:-}"
  local line pid
  while IFS= read -r line; do
    line="${line#"${line%%[![:space:]]*}"}"
    [[ -z "$line" ]] && continue
    pid="${line%% *}"
    if [[ -n "$our_pid" && "$pid" == "$our_pid" ]]; then
      continue
    fi
    if [[ "$line" == *"$ROOT"* && "$line" == *"next"* ]]; then
      echo "$line"
      return 0
    fi
  done < <(ps -ax -o pid=,command= 2>/dev/null || true)
  return 1
}

kill_tree() {
  local pid="$1"
  local child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

wait_ready() {
  local port="$1"
  local i
  for i in $(seq 1 60); do
    if curl -fsS -o /dev/null "http://127.0.0.1:${port}${READY_PATH}" 2>/dev/null; then
      return 0
    fi
    sleep 1
  done
  return 1
}

cmd_launch() {
  mkdir -p "$RUN_DIR"
  if [[ -f "$PID_FILE" && -f "$PORT_FILE" ]]; then
    local existing_pid existing_port
    existing_pid="$(cat "$PID_FILE")"
    existing_port="$(cat "$PORT_FILE")"
    if kill -0 "$existing_pid" 2>/dev/null; then
      echo "already running pid=${existing_pid} url=http://127.0.0.1:${existing_port}"
      exit 0
    fi
  fi

  if other_next_dev; then
    echo "refusing to start: another next dev is already using this checkout" >&2
    echo "stop that server before verify-wildflower.sh launch" >&2
    exit 1
  fi

  local port="$DEFAULT_PORT"
  if [[ -n "$(listener_pid "$port")" ]]; then
    echo "refusing to start: port ${port} is already in use" >&2
    exit 1
  fi

  # New session so the dev server survives after this script exits.
  python3 -c '
import os, sys
root, port, log = sys.argv[1:]
os.chdir(root)
os.setsid()
fd = os.open(log, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o644)
os.dup2(fd, 1)
os.dup2(fd, 2)
os.close(fd)
devnull = os.open("/dev/null", os.O_RDONLY)
os.dup2(devnull, 0)
os.close(devnull)
os.execvp("npm", ["npm", "run", "dev", "--", "--port", port])
' "$ROOT" "$port" "$LOG_FILE" &
  local pid=$!
  echo "$pid" >"$PID_FILE"
  echo "$port" >"$PORT_FILE"

  if ! wait_ready "$port"; then
    echo "server did not answer http://127.0.0.1:${port}${READY_PATH}" >&2
    echo "log: $LOG_FILE" >&2
    exit 1
  fi

  echo "ready pid=${pid} url=http://127.0.0.1:${port}"
}

cmd_doctor() {
  if [[ ! -f "$PID_FILE" || ! -f "$PORT_FILE" ]]; then
    echo "no verification server recorded in $RUN_DIR" >&2
    exit 1
  fi
  local pid port listen code
  pid="$(cat "$PID_FILE")"
  port="$(cat "$PORT_FILE")"
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "recorded pid ${pid} is not running" >&2
    exit 1
  fi
  listen="$(listener_pid "$port")"
  if [[ -z "$listen" ]]; then
    echo "nothing is listening on port ${port}" >&2
    exit 1
  fi
  if ! owns_listener "$pid" "$listen"; then
    echo "port ${port} is owned by pid ${listen}, not the verification server ${pid}" >&2
    exit 1
  fi
  code="$(curl -sS -o /dev/null -w "%{http_code}" "http://127.0.0.1:${port}${READY_PATH}")"
  if [[ "$code" != "200" ]]; then
    echo "GET ${READY_PATH} returned ${code}" >&2
    exit 1
  fi
  echo "ok pid=${pid} url=http://127.0.0.1:${port} path=${READY_PATH} status=200"
}

cmd_cleanup() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE")"
    if kill -0 "$pid" 2>/dev/null; then
      kill_tree "$pid"
      wait "$pid" 2>/dev/null || true
    fi
  fi
  if command -v agent-browser >/dev/null 2>&1; then
    agent-browser --session wildflower-verify close >/dev/null 2>&1 || true
  fi
  rm -rf "$RUN_DIR"
  echo "cleaned verification server; evidence kept at $ROOT/tmp/verify-wildflower/evidence"
}

[[ $# -eq 1 ]] || usage
case "$1" in
  launch) cmd_launch ;;
  doctor) cmd_doctor ;;
  cleanup) cmd_cleanup ;;
  *) usage ;;
esac
