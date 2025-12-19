# Romanian Document Comparison Table

Quick reference for what's different between document types and what data we extract/save.

---

## Document Type Comparison

| Feature | CI Vechi | CI Nou | Pașaport |
|---------|----------|--------|----------|
| **Format** | Card plastic | Card plastic cu chip | Broșură |
| **Págini necesare** | 1 (față) | 2 (față + verso) | 1 (ambele pagini vizibile) |
| **Adresă pe document** | ✅ Da | ❌ Nu | ❌ Nu |
| **MRZ** | ❌ Nu | ✅ Da (verso) | ✅ Da |
| **Serie** | 2 litere separate | 2 litere combinate | ❌ Nu are |
| **Număr** | 6 cifre | 7 cifre | 9 cifre |
| **Exemplu serie/nr** | XV 517628 | SM1004703 | 057472789 |
| **Certificat Domiciliu necesar** | ❌ Nu | ✅ Da | ✅ Da |

---

## What We Extract (OCR)

### From CI Vechi (Față)

| Câmp | Exemplu | Salvat în DB |
|------|---------|--------------|
| CNP | 2540101301234 | `kyc_documents.identity_document.cnp` |
| Nume | VLĂGEA | `kyc_documents.identity_document.last_name` |
| Prenume | ELISABETA | `kyc_documents.identity_document.first_name` |
| Data nașterii | 01.01.1954 | `kyc_documents.identity_document.birth_date` |
| Locul nașterii | Satu Mare | `kyc_documents.identity_document.birth_place` |
| Sex | F | `kyc_documents.identity_document.sex` |
| Seria | XV | `kyc_documents.identity_document.series` |
| Numărul | 517628 | `kyc_documents.identity_document.number` |
| Data expirării | 01.01.2024 | `kyc_documents.identity_document.expiry_date` |
| **Adresa completă** | Jud. Satu Mare, Str. X Nr. 10 | `kyc_documents.identity_document.address` |

### From CI Nou (Față)

| Câmp | Exemplu | Salvat în DB |
|------|---------|--------------|
| CNP | 1890121301234 | `kyc_documents.identity_document.cnp` |
| Nume | TARȚA | `kyc_documents.identity_document.last_name` |
| Prenume | MARK-SILVER | `kyc_documents.identity_document.first_name` |
| Data nașterii | 21.01.1989 | `kyc_documents.identity_document.birth_date` |
| Sex | M | `kyc_documents.identity_document.sex` |
| Seria+Număr | SM1004703 | `kyc_documents.identity_document.full_document_number` |
| Data expirării | 21.01.2029 | `kyc_documents.identity_document.expiry_date` |

### From CI Nou (Verso)

| Câmp | Exemplu | Salvat în DB |
|------|---------|--------------|
| MRZ Linia 1 | IDROU1890121SM1004703<<<<<< | `kyc_documents.identity_document.mrz.line1` |
| MRZ Linia 2 | 8901215M2901217ROU<<<<<<<<6 | `kyc_documents.identity_document.mrz.line2` |
| Data emiterii | 15.03.2024 | `kyc_documents.identity_document.issue_date` |
| Autoritatea emitentă | SPCLEP Satu Mare | `kyc_documents.identity_document.issuing_authority` |

### From Pașaport

| Câmp | Exemplu | Salvat în DB |
|------|---------|--------------|
| CNP | 1750815301234 | `kyc_documents.identity_document.cnp` |
| Nume | BACIU | `kyc_documents.identity_document.last_name` |
| Prenume | VASILE-VIOREL | `kyc_documents.identity_document.first_name` |
| Data nașterii | 15.08.1975 | `kyc_documents.identity_document.birth_date` |
| Locul nașterii | SATU MARE/ROU | `kyc_documents.identity_document.birth_place` |
| Sex | M | `kyc_documents.identity_document.sex` |
| Număr pașaport | 057472789 | `kyc_documents.identity_document.number` |
| Data emiterii | 15.03.2020 | `kyc_documents.identity_document.issue_date` |
| Data expirării | 14.03.2030 | `kyc_documents.identity_document.expiry_date` |
| MRZ | P<ROUBACAU<<... | `kyc_documents.identity_document.mrz` |

### From Certificat Atestare Domiciliu

| Câmp | Exemplu | Salvat în DB |
|------|---------|--------------|
| CNP titular | 1890121301234 | `kyc_documents.address_certificate.holder_cnp` |
| Nume titular | TARȚA MARK-SILVER | `kyc_documents.address_certificate.holder_name` |
| Tată | GAVRIL-VASILE | `kyc_documents.address_certificate.parents.father` |
| Mamă | ILEANA | `kyc_documents.address_certificate.parents.mother` |
| Data nașterii | 21.01.1989 | `kyc_documents.address_certificate.birth.date` |
| Locul nașterii | Mun.Satu Mare | `kyc_documents.address_certificate.birth.place` |
| **Adresă - Județ** | Satu Mare | `kyc_documents.address_certificate.address.judet` |
| **Adresă - Localitate** | Mun.Satu Mare | `kyc_documents.address_certificate.address.localitate` |
| **Adresă - Stradă** | Pța.Jean Calvin | `kyc_documents.address_certificate.address.strada` |
| **Adresă - Număr** | 1 | `kyc_documents.address_certificate.address.numar` |
| **Adresă - Apartament** | 28 | `kyc_documents.address_certificate.address.apartament` |
| Data emiterii | 15.12.2024 | `kyc_documents.address_certificate.issue_date` |
| Valabil până la | 15.06.2025 | `kyc_documents.address_certificate.valid_until` |

---

## Upload Requirements by Document Type

| Document | Uploads Necesare | Locație DB |
|----------|------------------|------------|
| CI Vechi | 1. Față | `kyc_documents.identity_document.uploads.front` |
| CI Nou | 1. Față<br>2. Verso<br>3. Certificat Domiciliu | `uploads.front`<br>`uploads.back`<br>`address_certificate.upload` |
| Pașaport | 1. Pașaport (ambele pagini)<br>2. Certificat Domiciliu | `uploads.front`<br>`address_certificate.upload` |

---

## Validation Rules

### Expirare Document

| Serviciu | Document Expirat Acceptat? |
|----------|---------------------------|
| Cazier Fiscal | ❌ Nu |
| Cazier Judiciar | ❌ Nu |
| Certificat Constatator | ❌ Nu |
| Extras Carte Funciară | ❌ Nu |
| **Certificat Naștere** | ✅ Da |
| Certificat Căsătorie | ❌ Nu |
| Certificat Deces | ❌ Nu |

### Validare Certificat Domiciliu

| Verificare | Descriere |
|------------|-----------|
| Valabilitate | Maxim 6 luni de la data emiterii |
| CNP Match | CNP din certificat = CNP din act identitate |
| Nume Match | Nume din certificat ≈ Nume din act identitate |

---

## Database Storage Structure

```
orders.kyc_documents (JSONB)
├── identity_document
│   ├── type: "ci_vechi" | "ci_nou" | "passport"
│   ├── series: string | null
│   ├── number: string
│   ├── full_document_number: string (for ci_nou)
│   ├── last_name: string
│   ├── first_name: string
│   ├── cnp: string
│   ├── sex: "M" | "F"
│   ├── birth_date: string
│   ├── birth_place: string | null
│   ├── issue_date: string
│   ├── expiry_date: string
│   ├── issuing_authority: string
│   ├── address: Address | null (only ci_vechi)
│   ├── mrz: { line1, line2 } | null
│   ├── uploads: { front, back? }
│   └── validation: { is_expired, expiry_allowed, confidence_score }
│
└── address_certificate (only for ci_nou/passport)
    ├── type: "certificat_atestare_domiciliu"
    ├── holder_cnp: string
    ├── holder_name: string
    ├── cnp_matches: boolean
    ├── name_matches: boolean
    ├── parents: { father, mother }
    ├── birth: { date, place }
    ├── address: Address
    ├── issue_date: string
    ├── valid_until: string
    ├── is_valid: boolean
    └── upload: UploadInfo
```

---

## Quick Detection Guide

```
IF document has address printed on front
   → CI Vechi
   → requiresAddressCertificate: false

IF document has chip icon AND no address
   → CI Nou
   → requiresAddressCertificate: true

IF document says "PAȘAPORT" or "PASSPORT"
   → Passport
   → requiresAddressCertificate: true

Series/Number format:
   → "XX 123456" → CI Vechi (2 letters + space + 6 digits)
   → "XX1234567" → CI Nou (2 letters + 7 digits combined)
   → "123456789" → Passport (9 digits, no series)
```

---

**Last Updated:** 2025-12-18
