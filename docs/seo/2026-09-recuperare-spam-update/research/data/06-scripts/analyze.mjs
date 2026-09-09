import fs from 'node:fs'; import path from 'node:path';
import { scoreText, boldTermLists, GROUPS } from './lexicon.mjs';

const SITES = {
  EGH: { dir:'html-egh', json:'egh-pages.json', base:'https://eghiseul.ro' },
  CJO: { dir:'html-cjo', json:'cjo-pages.json', base:'https://cazierjudiciaronline.com' },
};

function classifyEGH(f){
  const p = f.replace(/\.html$/,'');
  if (p==='index') return 'home';
  if (['servicii','calculator','tools','blog'].includes(p)) return 'hub';
  if (/^servicii__extras-de-carte-funciara__/.test(p)) return 'location';
  if (/^servicii__cazier-judiciar-online__/.test(p) && !/persoana-(fizica|juridica)$/.test(p)) return 'location';
  if (/^servicii__/.test(p)) return 'service';
  if (/^calculator__/.test(p) || /^tools__/.test(p) || p==='curs-valutar') return 'tool';
  if (['termeni-si-conditii','politica-de-confidentialitate','politica-de-anulare','politica-cookies','gdpr','contact'].includes(p)) return 'legal';
  return 'article';
}
const CJO_SERVICE = new Set(['cazier-auto-online','cazier-fiscal-online','certificat-integritate-comportamentala',
  'eliberare-cazier-judiciar-online','cazier-judiciar-urgent','cazier-fiscal-persoana-juridica','cazier-judiciar-diaspora']);
function classifyCJO(f){
  const p = f.replace(/\.html$/,'');
  if (p==='index') return 'home';
  if (p==='blog') return 'hub';
  if (/^cazier-judiciar-online__/.test(p)) return 'location';
  if (['termeni-si-conditii','politica-de-confidentialitate','politica-de-anulare','contact'].includes(p)) return 'legal';
  if (p==='status-comanda') return 'tool';
  if (CJO_SERVICE.has(p)) return 'service';
  return 'article';
}

const all = {};
for (const [site,cfg] of Object.entries(SITES)){
  const pages = JSON.parse(fs.readFileSync(cfg.json,'utf8'));
  for (const pg of pages){
    const html = fs.readFileSync(path.join(cfg.dir,pg.file),'utf8');
    const text = fs.readFileSync(path.join(cfg.dir,'_txt',pg.file.replace(/\.html$/,'.txt')),'utf8');
    pg.site = site;
    pg.cls = site==='EGH'? classifyEGH(pg.file) : classifyCJO(pg.file);
    pg.text = text;
    const sc = scoreText(text);
    pg.score = sc;
    pg.boldTerms = boldTermLists(html);
    pg.per1k = pg.words? +(sc._total/pg.words*1000).toFixed(2) : 0;
    pg.per1kNoDash = pg.words? +((sc._total - sc.dashes)/pg.words*1000).toFixed(2) : 0;
    pg.url = cfg.base + '/' + pg.file.replace(/\.html$/,'').replace(/__/g,'/').replace(/^index$/,'');
  }
  all[site]=pages;
}

const q = (arr,p)=>{ if(!arr.length) return null; const s=[...arr].sort((a,b)=>a-b); const i=(s.length-1)*p; const lo=Math.floor(i),hi=Math.ceil(i); return +( s[lo]+(s[hi]-s[lo])*(i-lo) ).toFixed(1); };

const report = {generatedAt:new Date().toISOString(), classes:{}, siteTotals:{}};
for (const [site,pages] of Object.entries(all)){
  const byCls={};
  for (const pg of pages){ (byCls[pg.cls] ||= []).push(pg); }
  report.siteTotals[site] = {pages:pages.length, words:pages.reduce((a,b)=>a+b.words,0)};
  report.classes[site]={};
  for (const [c,ps] of Object.entries(byCls)){
    const w = ps.map(p=>p.words), s = ps.map(p=>p.per1k), sn = ps.map(p=>p.per1kNoDash);
    report.classes[site][c] = {
      n: ps.length,
      words:{p10:q(w,.1), median:q(w,.5), p90:q(w,.9), min:Math.min(...w), max:Math.max(...w), total:w.reduce((a,b)=>a+b,0)},
      aiScorePer1k:{median:q(s,.5), p90:q(s,.9), max:Math.max(...s)},
      aiScorePer1kNoDash:{median:q(sn,.5), p90:q(sn,.9)},
      boldTermListsMedian: q(ps.map(p=>p.boldTerms),.5),
      thinUnder800: ps.filter(p=>p.words<800).length,
    };
  }
}

// ---- Jaccard similarity in location sets (two methods) ----
function tokens(t){ return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').match(/[a-z0-9]{3,}/g)||[]; }
function shingles(t,n=5){ const w=tokens(t); const s=new Set(); for(let i=0;i+n<=w.length;i++) s.add(w.slice(i,i+n).join(' ')); return s; }
function jac(a,b){ let inter=0; for(const x of a) if(b.has(x)) inter++; return inter/(a.size+b.size-inter); }
function pairwise(pages, method){
  const sets = pages.map(p=> method==='token'? new Set(tokens(p.text)) : shingles(p.text,5));
  const vals=[];
  for(let i=0;i<sets.length;i++) for(let j=i+1;j<sets.length;j++) vals.push(jac(sets[i],sets[j]));
  return {n:pages.length, pairs:vals.length, mean:+(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(3),
          median:+q(vals,.5).toFixed?.(3) ?? q(vals,.5), min:+Math.min(...vals).toFixed(3), max:+Math.max(...vals).toFixed(3)};
}
const locSets = {
  'EGH cazier orase': all.EGH.filter(p=>/^servicii__cazier-judiciar-online__/.test(p.file) && !/persoana/.test(p.file)),
  'EGH extras CF judete': all.EGH.filter(p=>/^servicii__extras-de-carte-funciara__/.test(p.file)),
  'CJO cazier orase': all.CJO.filter(p=>/^cazier-judiciar-online__/.test(p.file)),
};
report.locationSimilarity={};
for(const [k,ps] of Object.entries(locSets)){
  if(ps.length<2) continue;
  report.locationSimilarity[k]={ tokenJaccard: pairwise(ps,'token'), shingle5Jaccard: pairwise(ps,'shingle') };
  // unique tokens per page vs rest of set
  const setsT = ps.map(p=>new Set(tokens(p.text)));
  const uniq = ps.map((p,i)=>{ const others=new Set(); setsT.forEach((s,j)=>{ if(j!==i) for(const x of s) others.add(x); });
    const u=[...setsT[i]].filter(x=>!others.has(x)); return {page:p.file, uniqueTokens:u.length, sample:u.slice(0,25)}; });
  report.locationSimilarity[k].uniqueTokensPerPage = {
    median: q(uniq.map(u=>u.uniqueTokens),.5), min:Math.min(...uniq.map(u=>u.uniqueTokens)), max:Math.max(...uniq.map(u=>u.uniqueTokens)),
    examples: uniq.slice(0,4)
  };
}

// ---- internal linking ----
for (const [site,pages] of Object.entries(all)){
  const inbound = {};
  const known = new Set(pages.map(p=> new URL(p.url).pathname.replace(/\/$/,'')||'/'));
  for (const p of pages) for (const l of p.internalLinks){ const k=l.replace(/\/$/,'')||'/'; if(known.has(k)) (inbound[k]??=new Set()).add(p.file); }
  const rows = [...known].map(k=>({path:k, inbound:(inbound[k]?.size)||0}));
  report[`internalLinks_${site}`] = {
    medianInboundPages: q(rows.map(r=>r.inbound),.5),
    orphans: rows.filter(r=>r.inbound===0).map(r=>r.path),
    outboundMedian: q(pages.map(p=>p.internalLinks.length),.5),
  };
}

// ---- schema ----
for (const [site,pages] of Object.entries(all)){
  const cnt={};
  for(const p of pages) for(const t of p.schemaTypes) cnt[t]=(cnt[t]||0)+1;
  report[`schema_${site}`]=cnt;
}

fs.writeFileSync('report.json', JSON.stringify(report,null,1));
fs.writeFileSync('pages-flat.json', JSON.stringify(
  Object.values(all).flat().map(({text,...r})=>r), null, 1));
// csv per page
const csv=['site,class,url,words,ai_per1k,ai_per1k_nodash,promo,hedging,falseRanges,filler,copula,gerunds,dashes,boldTermLists,h2,robots'];
for(const p of Object.values(all).flat()) csv.push([p.site,p.cls,p.url,p.words,p.per1k,p.per1kNoDash,p.score.promo,p.score.hedging,p.score.falseRanges,p.score.filler,p.score.copulaVerbs,p.score.gerunds,p.score.dashes,p.boldTerms,p.h2Count,'"'+(p.robots||'')+'"'].join(','));
fs.writeFileSync('pages.csv', csv.join('\n'));
console.log(JSON.stringify(report.classes,null,1));
console.log(JSON.stringify(report.locationSimilarity,(k,v)=>k==='sample'?v.slice(0,10):v,1).slice(0,4000));
