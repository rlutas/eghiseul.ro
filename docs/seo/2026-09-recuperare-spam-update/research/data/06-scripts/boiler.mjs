import fs from 'node:fs';
const pages = JSON.parse(fs.readFileSync('pages-flat.json','utf8'));
const dirOf = s => s==='EGH'?'html-egh':'html-cjo';
const txt = p => fs.readFileSync(`${dirOf(p.site)}/_txt/${p.file.replace(/\.html$/,'.txt')}`,'utf8');
const tok = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').match(/[a-z0-9]{2,}/g)||[];
const sh = (t,n=6)=>{const w=tok(t);const s=new Set();for(let i=0;i+n<=w.length;i++)s.add(w.slice(i,i+n).join(' '));return s;};
const sets = {
  'EGH cazier orase (8)': pages.filter(p=>/^servicii__cazier-judiciar-online__/.test(p.file)&&!/persoana/.test(p.file)),
  'EGH extras CF judete (42)': pages.filter(p=>/^servicii__extras-de-carte-funciara__/.test(p.file)),
  'CJO cazier orase (39)': pages.filter(p=>/^cazier-judiciar-online__/.test(p.file)),
};
const out={};
for(const [k,ps] of Object.entries(sets)){
  const S = ps.map(p=>sh(txt(p)));
  const df = new Map();
  S.forEach(s=>{ for(const g of s) df.set(g,(df.get(g)||0)+1); });
  const rows = ps.map((p,i)=>{
    const s=S[i]; let uniq=0, boiler=0;
    for(const g of s){ const d=df.get(g); if(d===1) uniq++; if(d>=Math.ceil(ps.length*0.5)) boiler++; }
    return {page:p.file, words:p.words, shingles:s.size, uniquePct:+(uniq/s.size*100).toFixed(1), boilerPct:+(boiler/s.size*100).toFixed(1), uniqueShingles:uniq};
  });
  const med=(a)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
  out[k]={ n:ps.length,
    medianUniquePct: med(rows.map(r=>r.uniquePct)),
    medianBoilerPct: med(rows.map(r=>r.boilerPct)),
    medianUniqueShingles: med(rows.map(r=>r.uniqueShingles)),
    medianWords: med(rows.map(r=>r.words)),
    rows };
}
fs.writeFileSync('boilerplate.json', JSON.stringify(out,null,1));
for(const [k,v] of Object.entries(out)) console.log(k.padEnd(28), 'medianUnique%',String(v.medianUniquePct).padStart(5), 'medianBoiler(>=50% pagini)%',String(v.medianBoilerPct).padStart(5), 'uniq6grams',v.medianUniqueShingles, 'words',v.medianWords);
