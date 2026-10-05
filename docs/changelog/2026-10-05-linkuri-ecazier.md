# 05.10.2026 — Linkuri către ecazier.ro de pe eghiseul și avocat-tarta.ro
<!-- categorie: seo -->

## Pentru echipă

- În subsolul eghiseul.ro, sub legătura spre documentero.ro, apare acum și ecazier.ro (caziere judiciare, fiscale și auto).
- Trei articole de pe eghiseul trimit, în text, spre ghidurile ecazier: punctele de penalizare și cazierul auto pentru Uber/Bolt (din articolul despre cazierul auto), alegerea tipului de cazier (din comparația cazier judiciar / certificat de integritate).
- Paginile de comandă ale eghiseul (servicii) NU au primit linkuri spre ecazier.
- Pe avocat-tarta.ro: ecazier.ro în „Link-uri utile” din subsol și o frază a avocatei în articolul despre apărarea penală („certificatul de cazier judiciar îl obțin eu, prin împuternicire avocațială”).
- Nu schimbă nimic în comenzi sau în admin.

---

Același tipar ca linkurile spre documentero din 21.09: un link în subsol, din
text (nu din lista de servicii), plus linkuri contextuale cu ancore descriptive,
diferite între ele, spre ghidul care răspunde exact la subiectul paragrafului.

| Pagina sursă | Țintă | Ancoră |
|---|---|---|
| eghiseul — footer (`src/components/home/footer.tsx`) | `https://ecazier.ro/` | ecazier.ro |
| `/informatii-cazier-auto-online/` — secțiunea „Cinci ani, nu șase luni” | `https://ecazier.ro/puncte-penalizare-cazier-auto` | ghidul despre verificarea punctelor de penalizare |
| `/informatii-cazier-auto-online/` — „Când chiar ai nevoie de el” | `https://ecazier.ro/cazier-auto-uber-bolt` | ghidul pentru șoferii parteneri Uber și Bolt |
| `/cazier-judiciar-vs-certificat-integritate-comportamentala/` — final | `https://ecazier.ro/ghid-alegere-tip-cazier` | ghidul despre alegerea între cazierul judiciar, fiscal și auto |
| avocat-tarta.ro — footer „Link-uri utile” | `https://ecazier.ro/` | Cazier judiciar, fiscal și auto online (ecazier.ro) |
| avocat-tarta.ro — `/articole/drept-penal/apararea-penala-procedura/` | `https://ecazier.ro/` | ecazier.ro, unde depun cererile de cazier judiciar |

Note:
- URL-urile ecazier sunt fără slash final (așa sunt canonicalele lor; verificat 200 pe 05.10).
- Nicio dată `dateModified` schimbată în articole (regula 3 din `content-and-seo.md`).
- Repo avocat-tarta.ro: commit pe branch `seo/link-ecazier`, nepush-uit (push = deploy Netlify).
