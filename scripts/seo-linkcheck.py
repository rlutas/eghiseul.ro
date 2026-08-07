import os,re,json,sys
root='src/app'
routes=set()
for d,_,fs in os.walk(root):
    if 'page.tsx' in fs:
        rel=d[len(root):].strip('/')
        rel=re.sub(r'\((.*?)\)/?','',rel).strip('/')
        routes.add('/'+rel+'/' if rel else '/')
# dynamic segments
dyn=[r for r in routes if '[' in r]
links={}
for d,_,fs in os.walk(root):
    for f in fs:
        if not f.endswith('.tsx'): continue
        p=os.path.join(d,f)
        if '/admin/' in p: continue
        for m in re.finditer(r'href="(/[^"#?]*)"', open(p,encoding='utf-8').read()):
            links.setdefault(m.group(1),set()).add(p)
def ok(h):
    h=h if h.endswith('/') else h+'/'
    if h in routes: return True
    parts=h.strip('/').split('/')
    for r in dyn:
        rp=r.strip('/').split('/')
        if len(rp)!=len(parts): continue
        if all(a==b or a.startswith('[') for a,b in zip(rp,parts)): return True
    return False
bad={h:sorted(v)[:2] for h,v in links.items() if not ok(h) and not h.startswith('/api') and not h.startswith('/images')}
print('LINKURI INTERNE TOTAL:',len(links))
print('POSIBIL RUPTE:',len(bad))
for h,src in sorted(bad.items())[:25]: print('  ',h,'<-',src[0].replace('src/app/',''))
