import fs from 'node:fs';
const p = JSON.parse(fs.readFileSync('pages-flat.json','utf8'));
// verticala tematica per URL (clasificare manuala, documentata)
const V = [
 [/cazier-judiciar|cazier_judiciar|reabilitare|integritate|conditii-de-calatorie|impact-cazier|corectarea-inform|dupa-cat-timp|cerere-cazier|apostila|tari-pentru-care/i,'cazier judiciar & integritate'],
 [/cazier-fiscal|verificare-cazier-fiscal/i,'cazier fiscal'],
 [/cazier-auto|rovinieta|amenda-circulatie|amenda-rovinieta|impozit-auto|sms-fals/i,'auto & rovinieta'],
 [/nastere|casatorie|celibat|stare-civila|multilingv|transcriere|duplicat-certificat/i,'stare civila'],
 [/constatator|onrc|radiere-firma|suspendare-activitate|schimbare-sediu|taxe-srl|dividende|contributii-pfa/i,'firme / ONRC'],
 [/carte-funciara|cadastr|releveu|plan-|intabulare|imobil|urbanism|sarcini|arhiva-ocpi|contract-vanzare|inventar-coordonate|actualizare-adresa|proprietar|cat-p(oti|ot)-construi|casa-verde|tva-9-locuinte|impozit-casa|taxe-notariale|jugar/i,'imobiliare / cadastru'],
 [/pensi|varsta-pensionare|vechime|anii-lucrati|somaj|concediu|indemnizatie|salariu|spor-salarial|diurna|zile-lucratoare|zile-concediu/i,'munca & pensii'],
 [/tva|inflatie|penalitati-anaf|impozit-chirie|impozit-pensie|curs-valutar|credit-ipotecar|grad-indatorare|rambursare|dobanda-legala/i,'fiscal-financiar general'],
 [/taxa-judiciara|termene-judiciare|calculator-data|calculator-procente|valabilitate-documente/i,'utilitare diverse'],
 [/termeni|politica|gdpr|cookies|contact|status/i,'legal / contact'],
];
const MONETIZED = new Set(['cazier judiciar & integritate','cazier fiscal','auto & rovinieta','stare civila','firme / ONRC','imobiliare / cadastru']);
const CJO_MONETIZED = new Set(['cazier judiciar & integritate','cazier fiscal','auto & rovinieta']);
const out={};
for(const site of ['EGH','CJO']){
  const ps=p.filter(x=>x.site===site);
  const cnt={}; const mon = site==='EGH'?MONETIZED:CJO_MONETIZED;
  let monetizable=0, off=0, unk=[];
  for(const x of ps){
    const path=new URL(x.url).pathname;
    const hit=V.find(([re])=>re.test(path));
    const v = hit? hit[1] : (path==='/'?'home':'ALTELE');
    if(v==='ALTELE') unk.push(path);
    cnt[v]=(cnt[v]||0)+1;
    if(mon.has(v)) monetizable++; else if(v!=='home'&&v!=='legal / contact') off++;
  }
  out[site]={verticale:cnt, paginiInVerticaleMonetizate:monetizable, paginiInVerticaleNemonetizate:off, neclasificate:unk};
  console.log('=====',site);
  console.log(Object.entries(cnt).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${String(v).padStart(4)}  ${k}`).join('\n'));
  console.log('  -> in verticale MONETIZATE:',monetizable,' / in verticale FARA produs:',off);
  if(unk.length) console.log('  neclasificate:',unk.join(' '));
}
fs.writeFileSync('topics.json',JSON.stringify(out,null,1));
