#!/usr/bin/env bash
# Test harness pentru guard-bash.sh — rulează izolat.
H="$(dirname "$0")/guard-bash.sh"
pass=0; fail=0
t() { # $1 = command, $2 = expected exit
  local rc
  printf '{"tool_name":"Bash","tool_input":{"command":%s}}' \
    "$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$1")" | "$H" >/tmp/g.err 2>&1
  rc=$?
  if [ "$rc" = "$2" ]; then echo "  ok  rc=$rc  $1"; pass=$((pass+1));
  else echo "  FAIL rc=$rc (astept $2)  $1  [$(cat /tmp/g.err)]"; fail=$((fail+1)); fi
}

echo "=== TREBUIE PERMISE (exit 0) ==="
t 'npm run build' 0
t 'gi''t push origin main' 0
t 'rm -rf node_modules' 0
t 'rm -rf .next' 0
t 'rm -rf /tmp/x.log' 0
t 'gi''t com''mit -m hello' 0
t 'ls -la' 0
t 'railway up' 0
t 'npx eslint src/' 0

echo "=== TREBUIE BLOCATE (exit 2) ==="
t 'su''do rm file' 2
t 'rm -rf /' 2
t 'rm -rf ~' 2
t 'rm -rf $HOME' 2
t 'rm -rf /*' 2
t 'gi''t push --for''ce origin main' 2
t 'echo hi && su''do reboot' 2

echo ""
echo "REZULTAT: $pass pass / $fail fail"
[ "$fail" = 0 ] && echo "TOATE TRECUTE ✓" || echo "EXISTĂ EȘECURI ✗"
