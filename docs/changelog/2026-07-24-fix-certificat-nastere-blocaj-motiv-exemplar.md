# Fix blocaj certificat naștere la „Vechiul certificat mi-a fost" (2026-07-24)

## Problema (client fdvasiliu@yahoo.com, reclamat pe email)

„Platforma nu mă lasă să trec de întrebarea «Motivul pentru care solicitați un
nou exemplar», la care eu am răspuns."

## Cauza (reprodusă în browser, producție)

La certificat naștere + căsătorie, câmpul **„Vechiul certificat mi-a fost:"**
are o SINGURĂ opțiune — „Pierdut" — și NU era pre-selectată. Un radio cu o
singură opțiune, nebifat, arată exact ca o etichetă/text informativ → clientul
nu-l bifează (nu pare că ai ce alege). Fără el, validarea bloca «Continuă».

Agravat de mesajul de eroare: „Motivul pentru care soliciți un certificat nou"
— text care NU se potrivea cu eticheta câmpului („Vechiul certificat mi-a
fost"). Clientul căuta un câmp cu numele din eroare, nu-l găsea, rămânea blocat
convins că a răspuns la tot.

## Fix

`src/components/orders/modules/civil-status/CivilStatusStep.tsx`:
1. **Pre-selectare automată** a opțiunii unice: la naștere/căsătorie
   (`documentType !== 'celibat'`), `oldCertificateReason` se setează pe
   `'pierdut'` la montare dacă e gol → nu mai e blocaj și UI-ul îl arată bifat.
   Celibat păstrează alegerea manuală (pierdut/distrus/furat).
2. **Mesaj de eroare aliniat** cu eticheta: „Vechiul certificat mi-a fost
   (pierdut/distrus/furat)" în loc de „Motivul pentru care soliciți un
   certificat nou".

## Verificare
Reprodus pe producție: calea completă bloca fix la acest câmp când nu era
bifat; după fix, opțiunea e pre-selectată → pasul trece. tsc + lint curate.
