# Facturi furnizori pentru contabil: checklist lunar

## De ce există

Unele cheltuieli le plătim cu cardul firmei la furnizori care **nu trimit factura în SPV**: Meta (Facebook/Instagram Ads), Google Ads, Google Cloud, TikTok Ads, OpenAI, Anthropic (Claude), Vercel, Supabase, Railway, Resend, Zoho, Amazon. Factura acestor furnizori stă doar în contul de pe site-ul lor. Dacă nu o descarcă nimeni, contabilul nu o are, iar cheltuiala apare în bancă fără document.

Furnizorii români plătiți prin ordin de plată (cabinetul de avocat, curierii, contabilitatea) **nu** apar aici: factura lor vine în SPV. La fel DHL Express, deși îl plătim cu cardul (pe extras apare ca „Wallet payment from MyBil”).

Lista se face singură din extrasul de cont importat. Voi doar bifați.

## Unde

**Admin → Decontări → „Facturi furnizori”**. Butonul e lângă „Extras bancă”.

Cât timp o lună are furnizori nepredați, pe paginile Decontări și Extras bancă apare o casetă galbenă. Exemplu: „Septembrie 2026: 10 din 10 furnizori nepredați”. Caseta dispare când toți furnizorii au bifa „Predată contabil”.

## Pașii, lunar

1. **Importați extrasul lunii** în Extras bancă (CSV-ul „Lista de tranzacții” din BT24), ca până acum.
2. Deschideți **Facturi furnizori**. În stânga e lista lunilor, cu progresul (ex. `3/10`). Click pe lună.
3. Pentru fiecare furnizor din tabel:
   - click pe numele lui: vedeți fiecare plată (data plății cu cardul, suma în lei și, la plățile în valută, suma în valută) și unde se găsesc facturile în contul furnizorului;
   - descărcați facturile pentru acele plăți și bifați **Descărcată**;
   - listați-le și bifați **Listată**;
   - după ce le dați contabilului, bifați **Predată contabil**.
4. Dacă lipsește ceva, apăsați iconița de notă de pe rând și scrieți ce lipsește (ex. „lipsește chitanța din 12.09”).

Fiecare bifă salvează cine a bifat și când. Le vedeți sub bifă și când țineți mouse-ul pe ea. Luna se bifează pe furnizor, nu pe fiecare plată. TikTok cu 49 de plăți e un singur rând.

## Stripe

Stripe apare în listă în fiecare lună cu decontări, cu suma comisioanelor din
luna respectivă. Comisioanele nu se văd în extras, pentru că Stripe le oprește
din fiecare decontare; de aceea rândul nu are plăți dedesubt.

Factura lunară o găsiți în dashboard.stripe.com → Settings → Documents (Tax
invoices). Apare în jurul datei de 7 a lunii următoare: cea pe octombrie 2026 a
venit pe 07.11.

## Lunile vechi

În lista din stânga sunt toate lunile cu extras importat. Click pe oricare ca să vedeți ce s-a predat și ce nu. Lunile complete apar cu „✓ complet”.

## Dacă un furnizor lipsește din listă

Lista prinde furnizorii cunoscuți și orice plată cu cardul în valută (USD, EUR, GBP). Un furnizor nou, care taxează în lei, nu apare singur. Spuneți-i lui Raul numele de pe extras și îl adăugăm.
