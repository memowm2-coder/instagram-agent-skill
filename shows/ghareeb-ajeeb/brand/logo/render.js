const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [,,html,out,mode,w,h]=process.argv;
const b=await chromium.launch();const p=await b.newPage({viewport:{width:+w,height:+h}});
await p.goto('file://'+html+'#'+mode);await p.waitForSelector('body[data-ready]');await p.waitForTimeout(300);
await p.screenshot({path:out,omitBackground:mode!=='card'});await b.close();})();
