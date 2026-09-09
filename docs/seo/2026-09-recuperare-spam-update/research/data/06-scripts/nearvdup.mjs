import fs from 'node:fs';
const pages = JSON.parse(fs.readFileSync('pages-flat.json','utf8'));
const dirOf = s => s==='EGH'?'html-egh':'html-cjo';
const txt = p => fs.readFileSync(`${dirOf(p.site)}/_txt/${p.file.replace(/\.html$/,'.txt')}`,'utf8');
const tok = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').match(/[a-z0-9]{2,}/g)||[];
const sh=(t,n=6)=>{const w=tok(t);const s=new Set();for(let i=0;i+n<=w.length;i++)s.add(w.slice(i,i+n).join(' '));return s;};
const jac=(a,b)=>{let i=0;for(const x of a)if(b.has(x))i++;return i/(a.size+b.size-i);};
const out={};
for(const site of ['EGH','CJO']){
  const ps=pages.filter(p=>p.site===site);
  const S=ps.map(p=>sh(txt(p)));
  const pairs=[];
  for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){
    const isLoc = ps[i].cls==='location'&&ps[j].cls==='location';
    const v=jac(S[i],S[j]);
    if(v>=0.25) pairs.push({a:ps[i].url,b:ps[j].url,j:+v.toFixed(3),loc:isLoc, ca:ps[i].cls, cb:ps[j].cls});
  }
  pairs.sort((x,y)=>y.j-x.j);
  out[site]={ totalPairsOver25: pairs.length, nonLocationPairsOver25: pairs.filter(p=>!p.loc).length,
    allNonLocation: pairs.filter(p=>!p.loc) };
  console.log(site,'pairs>=0.25:',pairs.length,' non-location:',pairs.filter(p=>!p.loc).length);
  pairs.filter(p=>!p.loc).slice(0,15).forEach(p=>console.log('  ',p.j, p.ca+'/'+p.cb, p.a.replace(/https:\/\/[^/]+/,''),'<->',p.b.replace(/https:\/\/[^/]+/,'')));
}
fs.writeFileSync('near-duplicates.json', JSON.stringify(out,null,1));
