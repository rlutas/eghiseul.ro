#!/bin/zsh
repo=$1; out=$2
cd "$repo" || exit 1
: > "$out"
git ls-files 'src/app/**/page.tsx' | grep -Ev '/(admin|api|auth|account|comanda|colaborator|completare|reincarca-poza|ppc|status-comanda|multumim)(/|$)' | grep -v '(admin)' | grep -v '(customer)' | while read -r f; do
  d=$(git log --diff-filter=A --format='%ad|%s' --date=short -1 -- "$f" 2>/dev/null | head -1)
  echo "$d|$f" >> "$out"
done
