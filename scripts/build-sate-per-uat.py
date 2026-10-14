"""
Build src/lib/ancpi/sate-per-uat.json: villages (localități componente) per
ANCPI UAT, keyed "<JUDET>|<UAT>" with normalizeJudet()-style keys.

Source: INS SIRUTA_s1 2026, data.gov.ro, CC BY 4.0
https://data.gov.ro/dataset/siruta_s1-2026

Usage: python3 -I scripts/build-sate-per-uat.py <siruta.csv> src/lib/ancpi/uat-nomenclator.json src/lib/ancpi/sate-per-uat.json
"""
import csv, json, sys, unicodedata, re
src, nomen, out = sys.argv[1:4]
def norm(s):
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^A-Z0-9]', '', s.upper())
SMALL = {'de','din','la','lui','pe','cu','sub','peste','dintre','mare','mic','mică'}
def pretty(s):
    s = s.replace('Ş','Ș').replace('ş','ș').replace('Ţ','Ț').replace('ţ','ț')
    words = s.lower().split(' ')
    res=[]
    for i,w in enumerate(words):
        parts=w.split('-')
        parts=[p if (i>0 and p in ('de','din','la','lui','pe','cu','sub','dintre')) else p[:1].upper()+p[1:] for p in parts]
        res.append('-'.join(parts))
    return ' '.join(res)
rows = list(csv.DictReader(open(src, encoding='utf-8-sig'), delimiter=';'))
jud = {}
for r in rows:
    if r['NIV']=='1':
        jud[r['JUD']] = norm(re.sub(r'^JUDE.UL |^MUNICIPIUL ', '', r['DENLOC']))
uat = {}
for r in rows:
    if r['NIV']=='2':
        name = re.sub(r'^(MUNICIPIUL|ORA.UL|ORA.|COMUNA|SECTORUL)\s+', '', r['DENLOC'])
        uat[r['SIRUTA']] = (jud.get(r['JUD']), norm(name), r['DENLOC'])
sate = {}
for r in rows:
    if r['NIV']=='3' and r['SIRSUP'] in uat:
        j,u,_ = uat[r['SIRSUP']]
        sate.setdefault(f'{j}|{u}', []).append(pretty(r['DENLOC']))
sate_i = {}
for r in rows:
    if r['NIV']=='3' and r['SIRSUP'] in uat:
        j,_,den = uat[r['SIRSUP']]
        name = re.sub(r'^(MUNICIPIUL|ORA.UL|ORA.|COMUNA|SECTORUL)\s+', '', den).replace('Â','Î')
        sate_i.setdefault(f'{j}|{norm(name)}', []).append(pretty(r['DENLOC']))
nom = json.load(open(nomen))
result = {}; miss=[]
for j, uats in nom.items():
    for u in uats:
        k = f'{j}|{norm(u)}'
        
        if k in sate:
            result[k] = sorted(set(sate[k]))
        elif k in sate_i:
            result[k] = sorted(set(sate_i[k]))
        else:
            miss.append(k)
json.dump(result, open(out,'w'), ensure_ascii=False, separators=(',',':'))
print('jud',len(jud),'uat siruta',len(uat),'matched',len(result),'missing',len(miss))
print(miss[:40])
print(result.get('PRAHOVA|DRAJNA'), result.get('SATUMARE|ODOREU'))
