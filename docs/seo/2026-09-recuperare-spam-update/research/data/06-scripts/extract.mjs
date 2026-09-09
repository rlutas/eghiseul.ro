import fs from 'node:fs';
import path from 'node:path';
const [,, dir, outJson] = process.argv;

function stripTag(html, tag){
  return html.replace(new RegExp(`<${tag}[^>]*>[\\s\\S]*?</${tag}>`,'gi'),' ');
}
// pick the largest <main>...</main> block; fallback body
function mainBlock(html){
  const re = /<main[^>]*>([\s\S]*?)<\/main>/gi;
  let m, best='';
  while((m=re.exec(html))) if(m[1].length>best.length) best=m[1];
  if(best) return best;
  const b = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return b?b[1]:html;
}
function toText(frag){
  let s = frag;
  s = stripTag(s,'script'); s = stripTag(s,'style'); s = stripTag(s,'noscript'); s = stripTag(s,'svg');
  s = s.replace(/<!--[\s\S]*?-->/g,' ');
  s = s.replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/td)[^>]*>/gi,'\n');
  s = s.replace(/<[^>]+>/g,' ');
  s = s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
       .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi,' ');
  s = s.replace(/[ \t ]+/g,' ').replace(/\n\s*\n+/g,'\n').trim();
  return s;
}
const out=[];
fs.mkdirSync(path.join(dir,'_txt'),{recursive:true});
for(const f of fs.readdirSync(dir).filter(x=>x.endsWith('.html'))){
  const html = fs.readFileSync(path.join(dir,f),'utf8');
  const frag = mainBlock(html);
  const text = toText(frag);
  const words = text.split(/\s+/).filter(w=>/[\p{L}\p{N}]/u.test(w)).length;
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[,''])[1].trim();
  const desc = (html.match(/<meta name="description" content="([^"]*)"/i)||[,''])[1];
  const canonical = (html.match(/<link rel="canonical" href="([^"]*)"/i)||[,''])[1];
  const robots = (html.match(/<meta name="robots" content="([^"]*)"/i)||[,''])[1];
  const jsonld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
  const types = [];
  for(const j of jsonld){ for(const t of j.matchAll(/"@type"\s*:\s*"([^"]+)"/g)) types.push(t[1]); }
  const h1 = [...frag.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>toText(m[1]));
  const h2 = [...frag.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m=>toText(m[1]));
  const internalLinks = [...frag.matchAll(/<a[^>]+href="(\/[^"#?]*)"/gi)].map(m=>m[1].replace(/\/$/,'')||'/');
  fs.writeFileSync(path.join(dir,'_txt',f.replace(/\.html$/,'.txt')), text);
  out.push({file:f, title, desc, canonical, robots, schemaTypes:[...new Set(types)], h1, h2Count:h2.length, h2, words,
            internalLinks:[...new Set(internalLinks)], internalLinkCountRaw: internalLinks.length,
            htmlBytes: html.length});
}
fs.writeFileSync(outJson, JSON.stringify(out,null,1));
console.log(dir, out.length, 'pages');
