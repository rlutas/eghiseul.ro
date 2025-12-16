# Catalog Servicii eghiseul.ro

## Rezumat

**Total servicii active:** 12
**Total comenzi procesate:** ~89,000+

## Servicii Active (WordPress)

### 📋 Caziere & Fișe
| ID | Serviciu | Form ID | Comenzi | Doc |
|----|----------|---------|---------|-----|
| SRV-001 | Cazier Fiscal Online | 7896 | 33,723 | [📄](./cazier-fiscal.md) |
| SRV-002 | Cazier Judiciar Online | 7876 | ~5,000 | [📄](./cazier-judiciar.md) |
| SRV-003 | Cazier Auto Online | 10110 | 809 | [📄](./cazier-auto.md) |

### 📄 Certificate Stare Civilă
| ID | Serviciu | Form ID | Comenzi | Doc |
|----|----------|---------|---------|-----|
| SRV-010 | Certificat de Naștere | 7916 | 5,930 | [📄](./certificat-nastere.md) |
| SRV-011 | Certificat de Căsătorie | 7923 | 604 | [📄](./certificat-casatorie.md) |
| SRV-012 | Certificat de Celibat (Anexa 9) | 8566 | 4,708 | [📄](./certificat-celibat.md) |
| SRV-013 | Certificat Integritate Comportamentală | 7990 | 2,201 | [📄](./certificat-integritate.md) |

### 🌍 Documente Multilingve
| ID | Serviciu | Form ID | Comenzi | Doc |
|----|----------|---------|---------|-----|
| SRV-020 | Extras Multilingv Certificat Naștere | 10176 | 82 | [📄](./extras-multilingv-nastere.md) |
| SRV-021 | Extras Multilingv Certificat Căsătorie | 10274 | 32 | [📄](./extras-multilingv-casatorie.md) |

### 🏢 Business & Imobiliare
| ID | Serviciu | Form ID | Comenzi | Doc |
|----|----------|---------|---------|-----|
| SRV-030 | Certificat Constatator ONRC | 7908 | 6,201 | [📄](./certificat-constatator.md) |
| SRV-031 | Extras Carte Funciară | 7888 | 34,816 | [📄](./extras-carte-funciara.md) |

### 🚗 Auto & Transport
| ID | Serviciu | Form ID | Comenzi | Doc |
|----|----------|---------|---------|-----|
| SRV-040 | Rovinieta Online | - | - | [📄](./rovinieta.md) |

> ⚠️ Rovinieta este pe platformă separată - de integrat

---

## Top Servicii (după volum)

1. 🥇 **Extras Carte Funciară** - 34,816 comenzi
2. 🥈 **Cazier Fiscal** - 33,723 comenzi
3. 🥉 **Certificat Constatator** - 6,201 comenzi
4. **Certificat Naștere** - 5,930 comenzi
5. **Certificat Celibat** - 4,708 comenzi

---

## Status Documentație

| Status | Descriere |
|--------|-----------|
| ⏳ Pending | Așteaptă flow de la client |
| 📝 Draft | În lucru |
| ✅ Complete | Documentat complet |

### Progress

- [ ] SRV-001 Cazier Fiscal - ⏳
- [ ] SRV-002 Cazier Judiciar - ⏳
- [ ] SRV-003 Cazier Auto - ⏳
- [ ] SRV-010 Certificat Naștere - ⏳
- [ ] SRV-011 Certificat Căsătorie - ⏳
- [ ] SRV-012 Certificat Celibat - ⏳
- [ ] SRV-013 Certificat Integritate - ⏳
- [ ] SRV-020 Extras Multilingv Naștere - ⏳
- [ ] SRV-021 Extras Multilingv Căsătorie - ⏳
- [ ] SRV-030 Certificat Constatator - ⏳
- [ ] SRV-031 Extras Carte Funciară - ⏳
- [ ] SRV-040 Rovinieta - ⏳

---

## API (Toate serviciile)

Fiecare serviciu va fi disponibil prin API pentru parteneri:

```
POST /api/v1/services/{service-slug}/order
GET  /api/v1/services/{service-slug}/status/{order-id}
GET  /api/v1/services/{service-slug}/documents/{order-id}
```

---

## Fișiere

```
docs/services/
├── README.md                      # Acest catalog
├── _template.md                   # Template serviciu nou
├── cazier-fiscal.md              # SRV-001
├── cazier-judiciar.md            # SRV-002
├── cazier-auto.md                # SRV-003
├── certificat-nastere.md         # SRV-010
├── certificat-casatorie.md       # SRV-011
├── certificat-celibat.md         # SRV-012
├── certificat-integritate.md     # SRV-013
├── extras-multilingv-nastere.md  # SRV-020
├── extras-multilingv-casatorie.md # SRV-021
├── certificat-constatator.md     # SRV-030
├── extras-carte-funciara.md      # SRV-031
└── rovinieta.md                  # SRV-040
```
