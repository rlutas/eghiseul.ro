import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { scoreText } from './lexicon.mjs';

const REPOS = {
  EGH: {dir:'/Users/raul/Projects/eghiseul.ro', ref:null},
  CJO: {dir:'/Users/raul/Projects/cazierjudiciaronline.com', ref:null},
};
const DATE = '2026-08-19';
function sh(cmd,cwd){ return execSync(cmd,{cwd,encoding:'utf8',maxBuffer:1e9}); }
// text din JSX: scoate importuri, atribute, expresii {..} simple; ia nodurile de text
function jsxText(src){
  let s = src.replace(/^import[\s\S]*?;\s*$/gm,' ');
  s = s.replace(/\/\*[\s\S]*?\*\//g,' ').replace(/^\s*\/\/.*$/gm,' ');
  s = s.replace(/(className|href|src|alt|id|key|type|name|content|rel|target|aria-[a-z]+)\s*=\s*(["'`][^"'`]*["'`]|\{[^}]*\})/g,' ');
  s = s.replace(/<\/?[A-Za-z][A-Za-z0-9.]*/g,'<'); // normalize tags start
  s = s.replace(/\{\/\*[\s\S]*?\*\/\}/g,' ');
  // pastreaza doar continut intre > si <
  const parts = [...s.matchAll(/>([^<>]{3,})</g)].map(m=>m[1]);
  // + string literals lungi (title/description/FAQ arrays)
  const lits = [...src.matchAll(/(['"])((?:[^'"\\]|\\.){40,}?)\1/g)].map(m=>m[2]);
  let t = (parts.join('\n') + '\n' + lits.join('\n'));
  t = t.replace(/\{[^{}]{0,80}\}/g,' ').replace(/&nbsp;/g,' ').replace(/&[a-z]+;/g,' ');
  t = t.replace(/[ \t]+/g,' ').replace(/\n+/g,'\n').trim();
  return t;
}
const rows=[];
for (const [site,cfg] of Object.entries(REPOS)){
  const commit = sh(`git rev-list -1 --before="${DATE} 23:59" HEAD`,cfg.dir).trim();
  const files = sh(`git ls-tree -r --name-only ${commit} -- src/app`,cfg.dir).split('\n')
    .filter(f=>/page\.tsx$/.test(f))
    .filter(f=>!/\/(admin|api|auth|account|comanda|colaborator|completare|reincarca-poza|ppc|status-comanda|multumim)\//.test(f))
    .filter(f=>!/\(admin\)|\(customer\)/.test(f))
    .filter(f=>!/\/ecazier\//.test(f))
    .filter(f=>!/\[/.test(f))
    .filter(f=>!/(termeni-si-conditii|politica-|gdpr|contact|blog)\/page\.tsx$/.test(f));
  for(const f of files){
    const src = sh(`git show ${commit}:${f}`,cfg.dir);
    const t = jsxText(src);
    const w = t.split(/\s+/).filter(x=>/[\p{L}\p{N}]/u.test(x)).length;
    if(w<200) continue;
    const sc = scoreText(t);
    rows.push({site, file:f.replace('src/app/','').replace('/page.tsx',''), words:w,
      per1k:+(sc._total/w*1000).toFixed(2), noDash:+((sc._total-sc.dashes)/w*1000).toFixed(2),
      noDashNoRange:+((sc._total-sc.dashes-sc.falseRanges)/w*1000).toFixed(2), ...sc});
  }
  console.log(site,'commit',commit.slice(0,8));
}
fs.writeFileSync('pre-update-source-scores.json',JSON.stringify(rows,null,1));
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s.length?+(s[Math.floor(s.length/2)]).toFixed(2):null};
for(const site of ['EGH','CJO']){
  const isLoc=f=>false;
  const r=rows.filter(x=>x.site===site);
  const art=r.filter(x=>!/^servicii\//.test(x.file));
  const svc=r.filter(x=>/^servicii\//.test(x.file));
  console.log(site,'pagini masurate',r.length);
  console.log('   TOATE  median/1k',med(r.map(x=>x.per1k)),' faraDash',med(r.map(x=>x.noDash)),' faraDash+range',med(r.map(x=>x.noDashNoRange)));
  console.log('   root-articole n='+art.length,' median/1k',med(art.map(x=>x.per1k)),' faraDash',med(art.map(x=>x.noDash)),' faraDash+range',med(art.map(x=>x.noDashNoRange)));
  if(svc.length) console.log('   /servicii n='+svc.length,' median/1k',med(svc.map(x=>x.per1k)),' faraDash',med(svc.map(x=>x.noDash)));
}
