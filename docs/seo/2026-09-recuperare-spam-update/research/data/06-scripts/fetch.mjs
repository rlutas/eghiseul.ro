import fs from 'node:fs';
import path from 'node:path';

const [,, urlFile, outDir] = process.argv;
const urls = fs.readFileSync(urlFile,'utf8').split('\n').map(s=>s.trim()).filter(Boolean);
fs.mkdirSync(outDir,{recursive:true});

function slug(u){
  const p = new URL(u).pathname.replace(/\/$/,'') || '/index';
  return p.replace(/^\//,'').replace(/\//g,'__') || 'index';
}

let i=0;
const results=[];
async function worker(){
  while(i<urls.length){
    const idx=i++; const u=urls[idx];
    try{
      const r = await fetch(u,{headers:{'user-agent':'Mozilla/5.0 (compatible; seo-audit-local/1.0)'},redirect:'follow'});
      const html = await r.text();
      fs.writeFileSync(path.join(outDir, slug(u)+'.html'), html);
      results.push({url:u,status:r.status,finalUrl:r.url,bytes:html.length});
      process.stderr.write(`${r.status} ${u}\n`);
    }catch(e){
      results.push({url:u,status:'ERR',error:String(e)});
      process.stderr.write(`ERR ${u} ${e}\n`);
    }
  }
}
await Promise.all(Array.from({length:6},worker));
fs.writeFileSync(path.join(outDir,'_fetch-log.json'), JSON.stringify(results,null,1));
console.log('done', results.length);
