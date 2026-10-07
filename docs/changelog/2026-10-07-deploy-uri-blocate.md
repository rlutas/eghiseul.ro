# 07.10.2026 — Deploy-urile eghiseul ieșeau „Error” după multe commituri de documentație
<!-- categorie: infrastructura -->

## Pentru echipă

- De azi de la 08:03 până la prânz, site-ul eghiseul n-a mai primit nicio actualizare: Vercel arăta două deploy-uri „Error”. Site-ul a mers normal, doar pe versiunea de dimineață.
- Din cauza asta, reparația facturii la transfer bancar nu ajunsese încă pe site. Acum e live.
- Nu e nimic de făcut din partea voastră.

---

**Cauza.** `ignoreCommand` din `vercel.json` rula `git diff --quiet $VERCEL_GIT_PREVIOUS_SHA HEAD`. Vercel clonează repo-ul cu istoric scurt; după 10 commituri doar de docs (anulate, deci fără deploy nou), commitul ultimului deploy reușit (`a8f108d5`) nu mai era în clonă. `git diff` cădea cu `fatal: bad object a8f108d5…` (cod 128), iar Vercel tratează orice cod în afară de 0/1 ca eroare. Afectate: `9d8b759` și `2b196ea` (fixul de factură).

**Reparația.** Înainte de diff, `git cat-file -e "$PREV^{commit}"`; dacă commitul lipsește din clonă, comanda iese cu 1 și se face build. Restul logicii (fără build pentru docs/migrări) rămâne neschimbat.
