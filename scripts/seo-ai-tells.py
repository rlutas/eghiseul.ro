import os,re,sys
TELLS={
 'em-dash':r'—',
 'rol-crucial':r'\b(joac[ăa] un rol (crucial|cheie|esen[țt]ial|vital)|reprezint[ăa] un (moment|pas) (cheie|crucial|important)|marc[hâa]nd un moment)',
 'not-just-but':r'\bnu (doar|numai|e vorba doar)\b[^.]{0,60}\bci (și|si)\b',
 'peisaj-tapiserie':r'\b(peisajul (digital|actual|legislativ)|tapiseri|un adev[ăa]rat testament|î[nș]i pune amprenta)',
 'promo':r'\b(remarcabil|impresionant[ăa]?|de neratat|extraordinar[ăa]?|revolu[țt]ionar)',
 'ing-superficial':r'\b(eviden[țt]iind|subliniind|reflect[âa]nd|contribuind la|asigur[âa]nd astfel|demonstr[âa]nd)',
 'vag-experti':r'\b(exper[țt]ii (spun|sus[țt]in)|observatorii|studiile arat[ăa]|se estimeaz[ăa] c[ăa]|surse din industrie)',
 'concluzie-generica':r'\b(viitorul (arat[ăa]|se anun[țt][ăa])|un pas important [îi]n direc[țt]ia|[îi]n concluzie, este esen[țt]ial)',
 'este-important-sa':r'\b(este important (de re[țt]inut|s[ăa] (men[țt]ion[ăa]m|[șs]tim))|merit[ăa] men[țt]ionat c[ăa])',
 'bold-lista':r'<li>\s*\n?\s*<strong>[^<]{3,60}\.?</strong>\.?\s',
 'in-era-actuala':r'\b([îi]n era (digital[ăa]|actual[ăa])|[îi]n ziua de (azi|ast[ăa]zi)|[îi]n contextul actual)',
}
def body(p):
    s=open(p,encoding='utf-8').read()
    i=s.find('>\n      <p>');  return s[i:] if i>0 else s
rows=[]
for d,_,fs in os.walk('src/app'):
    if 'page.tsx' not in fs: continue
    if any(x in d for x in ('/admin','/api','/auth','/comanda','/account','[')): continue
    p=os.path.join(d,'page.tsx')
    t=body(p)
    if len(t)<2500: continue
    hits={k:len(re.findall(r,t,re.I)) for k,r in TELLS.items()}
    score=sum(v for k,v in hits.items() if k!='em-dash')+hits['em-dash']//6
    if score: rows.append((score,d.replace('src/app/',''),{k:v for k,v in hits.items() if v}))
rows.sort(reverse=True)
print(f'{len(rows)} pagini cu semnale AI. Top 18:\n')
for s,name,h in rows[:18]:
    print(f'{s:3d}  {name[:58]:58s} {h}')
