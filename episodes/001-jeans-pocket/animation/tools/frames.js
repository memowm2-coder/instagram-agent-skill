const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [,,html,outdir,n,start]=process.argv;
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+html);await p.waitForSelector('body[data-ready]');
for(let f=+(start||0);f<+n;f++){await p.evaluate(f=>render(f),f);await p.screenshot({path:`${outdir}/f${String(f).padStart(4,'0')}.png`});}
await b.close();})();
