#!/usr/bin/env bash
# PreToolUse(Bash) guard — eghiseul.ro. Blochează (exit 2) DOAR comenzi catastrofice.
# Fail-OPEN: orice eroare de parsare → exit 0 (NU bloca munca legitimă).
input=$(cat 2>/dev/null) || exit 0
# extrage comanda din JSON cu python3 (robust); fail-open dacă nu merge
cmd=$(printf '%s' "$input" | python3 -c 'import sys,json
try:
    print(json.load(sys.stdin).get("tool_input",{}).get("command",""))
except Exception:
    pass' 2>/dev/null) || exit 0
[ -z "$cmd" ] && exit 0

blk() { printf "🛑 guard-bash: %s\n" "$1" >&2; exit 2; }

# sudo (la început sau după separator)
printf '%s' "$cmd" | grep -qE '(^|[;&|[:space:]])sudo([[:space:]]|$)' && blk "sudo nu e permis"
# rm recursiv-forțat pe rădăcină/home/glob-absolut (NU pe node_modules/.next etc.)
printf '%s' "$cmd" | grep -qE '(^|[;&|[:space:]])rm[[:space:]]+-[A-Za-z]*[rf][A-Za-z]*[[:space:]]+(-[A-Za-z]+[[:space:]]+)*(/|~|\$HOME|/\*)([[:space:]]|$)' && blk "rm recursiv pe cale periculoasa (/, ~, \$HOME, /*)"
# git push --force / -f (permite --force-with-lease)
printf '%s' "$cmd" | grep -qE 'git[[:space:]]+push([[:space:]].*)?[[:space:]](--force([[:space:]]|$)|-f([[:space:]]|$))' && blk "git push --force blocat (foloseste --force-with-lease constient)"

exit 0
