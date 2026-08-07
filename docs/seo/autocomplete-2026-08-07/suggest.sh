#!/bin/bash
# Google Autocomplete RO — aceeasi sursa pe care o foloseste AnswerThePublic
fetch(){ curl -s --get "https://suggestqueries.google.com/complete/search" \
  --data-urlencode "client=firefox" --data-urlencode "hl=ro" --data-urlencode "gl=ro" \
  --data-urlencode "q=$1" | python3 -c "import sys,json;d=json.load(sys.stdin);[print(x) for x in d[1]]" 2>/dev/null; }
SEED="$1"
MODS="cum ce cand unde cine de ce cat care se poate pot am nevoie trebuie fara online pret cat costa cat dureaza acte necesare"
fetch "$SEED"
for m in $MODS; do fetch "$m $SEED"; fetch "$SEED $m"; done
for l in a b c d e f g i l m n o p r s t u v; do fetch "$SEED $l"; done
