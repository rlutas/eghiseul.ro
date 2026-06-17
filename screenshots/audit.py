import json
from playwright.sync_api import sync_playwright

URL = "https://eghiseul-ro.vercel.app/"
OUT = "/Users/raul/Projects/eghiseul.ro/screenshots/"

def run():
    results = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # ---------- DESKTOP 1440 ----------
        ctx = browser.new_context(viewport={'width':1440,'height':900}, device_scale_factor=2)
        page = ctx.new_page()

        # capture network for image analysis
        imgs = []
        def on_resp(r):
            try:
                ct = r.headers.get('content-type','')
                if 'image' in ct or r.url.lower().split('?')[0].endswith(('.png','.jpg','.jpeg','.webp','.avif','.svg','.gif')):
                    imgs.append({'url': r.url, 'type': ct, 'len': r.headers.get('content-length','?'), 'status': r.status})
            except: pass
        page.on('response', on_resp)

        page.goto(URL, wait_until='networkidle', timeout=60000)
        page.wait_for_timeout(1500)

        # above-the-fold desktop
        page.screenshot(path=OUT+"desktop_atf.png", full_page=False)
        page.screenshot(path=OUT+"desktop_full.png", full_page=True)

        # collect DOM metrics
        results['desktop'] = page.evaluate(r"""() => {
            const out = {};
            out.title = document.title;
            out.scrollH = document.documentElement.scrollHeight;
            out.viewportH = window.innerHeight;
            const h1 = document.querySelector('h1');
            if (h1) {
                const r = h1.getBoundingClientRect();
                const cs = getComputedStyle(h1);
                out.h1 = {text: h1.innerText.slice(0,160), top: Math.round(r.top), bottom: Math.round(r.bottom),
                          fontSize: cs.fontSize, fontWeight: cs.fontWeight, visibleATF: r.top < window.innerHeight};
            }
            // primary CTA candidates
            const btns = [...document.querySelectorAll('a,button')].map(b=>{
                const r=b.getBoundingClientRect(); const cs=getComputedStyle(b);
                return {t:(b.innerText||'').trim().slice(0,40), top:Math.round(r.top), h:Math.round(r.height), w:Math.round(r.width),
                        bg:cs.backgroundColor, fs:cs.fontSize, visible: r.height>0 && r.top<window.innerHeight && r.top>=0};
            }).filter(b=>b.t.length>0);
            out.ctas = btns.filter(b=>b.visible).slice(0,15);
            // images in viewport
            out.imgs = [...document.querySelectorAll('img')].map(im=>{
                const r=im.getBoundingClientRect();
                return {src:(im.currentSrc||im.src||'').slice(-80), natW:im.naturalWidth, natH:im.naturalHeight,
                        dispW:Math.round(r.width), dispH:Math.round(r.height), loading:im.loading,
                        srcset: !!im.srcset, top:Math.round(r.top), inATF: r.top<window.innerHeight && r.height>0};
            });
            // fonts
            out.bodyFont = getComputedStyle(document.body).fontFamily;
            return out;
        }""")
        ctx.close()

        # ---------- MOBILE 375 ----------
        ctx2 = browser.new_context(viewport={'width':375,'height':812}, device_scale_factor=3, is_mobile=True, has_touch=True,
                                   user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1")
        page2 = ctx2.new_page()
        page2.goto(URL, wait_until='networkidle', timeout=60000)
        page2.wait_for_timeout(1500)
        page2.screenshot(path=OUT+"mobile_atf.png", full_page=False)
        page2.screenshot(path=OUT+"mobile_full.png", full_page=True)

        results['mobile'] = page2.evaluate(r"""() => {
            const out = {};
            out.docW = document.documentElement.scrollWidth;
            out.winW = window.innerWidth;
            out.horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;
            out.scrollH = document.documentElement.scrollHeight;
            out.viewportH = window.innerHeight;
            // find elements wider than viewport
            out.overflowEls = [];
            [...document.querySelectorAll('*')].forEach(el=>{
                const r=el.getBoundingClientRect();
                if (r.width > window.innerWidth+1 && r.right > window.innerWidth+1 && el.offsetParent!==null){
                    out.overflowEls.push({tag:el.tagName, cls:(el.className||'').toString().slice(0,50), w:Math.round(r.width), right:Math.round(r.right)});
                }
            });
            out.overflowEls = out.overflowEls.slice(0,10);
            const h1 = document.querySelector('h1');
            if (h1){const r=h1.getBoundingClientRect(); const cs=getComputedStyle(h1);
                out.h1={text:h1.innerText.slice(0,160),top:Math.round(r.top),bottom:Math.round(r.bottom),fontSize:cs.fontSize,visibleATF:r.top<window.innerHeight && r.bottom>0};}
            // tap targets
            out.smallTaps = [];
            [...document.querySelectorAll('a,button,input,select')].forEach(b=>{
                const r=b.getBoundingClientRect();
                if (r.height>0 && r.top<window.innerHeight && (r.height<44||r.width<44)){
                    out.smallTaps.push({t:(b.innerText||b.getAttribute('aria-label')||b.tagName).trim().slice(0,30), w:Math.round(r.width), h:Math.round(r.height), top:Math.round(r.top)});
                }
            });
            out.smallTaps = out.smallTaps.slice(0,20);
            // small text in ATF
            out.smallText = [];
            [...document.querySelectorAll('p,span,a,li,div')].forEach(el=>{
                const r=el.getBoundingClientRect();
                if (r.top<window.innerHeight && r.top>=0 && el.innerText && el.children.length===0){
                    const fs=parseFloat(getComputedStyle(el).fontSize);
                    if (fs<16 && fs>0) out.smallText.push({t:el.innerText.trim().slice(0,30), fs:fs});
                }
            });
            // dedupe small text by size
            const seen={}; out.smallText=out.smallText.filter(x=>{const k=x.fs+x.t; if(seen[k])return false; seen[k]=1; return true;}).slice(0,15);
            // CTA in ATF
            out.ctaATF = [...document.querySelectorAll('a,button')].map(b=>{const r=b.getBoundingClientRect();
                return {t:(b.innerText||'').trim().slice(0,40),top:Math.round(r.top),h:Math.round(r.height)};
            }).filter(b=>b.t.length>0 && b.top<window.innerHeight && b.top>=0 && b.h>0).slice(0,12);
            return out;
        }""")
        ctx2.close()

        browser.close()
        results['images'] = imgs
    print(json.dumps(results, indent=2, ensure_ascii=False))

run()
