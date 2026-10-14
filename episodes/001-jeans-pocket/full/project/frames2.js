const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [,,html,outdir,a,b]=process.argv;
const br=await chromium.launch();const p=await br.newPage({viewport:{width:1920,height:1080}});
await p.goto('file://'+html);await p.waitForSelector('body[data-ready]');
for(let f=+a;f<+b;f++){await p.evaluate(f=>render(f),f);await p.screenshot({path:`${outdir}/f${String(f).padStart(4,'0')}.jpg`,type:'jpeg',quality:95});}
await br.close();})();
