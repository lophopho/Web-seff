// Real network check from CI. This does not reproduce an iPhone WebView or CORS.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname,'../web-surf/scripts/index.html'),'utf8');
const ctx = {window:{},fetch,URL,TextDecoder,Uint8Array,AbortController,setTimeout,clearTimeout,atob};
vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);
(async () => {
  let failed = false;
  for (const input of [{url:'https://example.com/'},{query:'Google AI Edge Gallery GitHub'}]) {
    const raw = JSON.parse(await ctx.window.ai_edge_gallery_get_result(JSON.stringify(input)));
    const result = raw.result ? JSON.parse(raw.result) : raw;
    const summary = {input,mode:result.mode,error:result.error,provider:result.provider,
      pages:result.pages?.map(p=>({url:p.url,title:p.title,chars:p.content.length})),
      candidates:result.search_results?.map(r=>r.url),warnings:result.warnings};
    console.log(JSON.stringify(summary));
    if (raw.error || !result.pages?.length) failed = true;
  }
  if (failed) process.exitCode = 1;
})().catch(e=>{console.error(e.message);process.exitCode=1;});
