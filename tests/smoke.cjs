// Optional development test: npm install --no-save playwright && npx playwright install chromium
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve(__dirname,'../index.html'));
 await page.evaluate(()=>localStorage.clear());await page.reload();
 assert.equal(await page.evaluate(()=>QUESTIONS.length),40);
 assert.equal(await page.evaluate(()=>new Set(QUESTIONS.map(q=>q.id)).size),40);
 assert.equal(await page.evaluate(()=>QUESTIONS.every(q=>q.options.length===4&&q.correct.length>0&&q.correct.every(i=>i>=0&&i<4)&&q.explanation&&q.source)),true);
 await page.screenshot({path:path.resolve(__dirname,'../../simulator-desktop.png'),fullPage:true});
 await page.getByRole('button',{name:'Start practice →'}).click();
 // Answer one correctly using canonical index, check feedback and lock.
 const answer=await page.evaluate(()=>getq(data.attempt.ids[0]).correct);
 for(const i of answer)await page.locator(`input[name=answer][value="${i}"]`).check();
 await page.getByRole('button',{name:'Check answer',exact:true}).click();
 assert.match(await page.locator('.feedback').textContent(),/Correct/);
 assert.equal(await page.locator('input[name=answer]:disabled').count(),4);
 await page.getByRole('button',{name:'☆ Flag for review',exact:true}).click();
 await page.getByRole('button',{name:'Save & exit'}).click();await page.reload();
 await page.getByRole('button',{name:'Resume saved attempt'}).click();
 assert.equal(await page.locator('input:checked').count(),answer.length);
 await page.getByRole('button',{name:'Finish attempt',exact:true}).click();
 await page.getByRole('button',{name:'Finish & review',exact:true}).click();
 assert.equal(await page.evaluate(()=>data.history[0].score),10);
 await page.selectOption('#filter','flagged');assert.equal(await page.locator('details').count(),1);
 await page.getByRole('button',{name:'Practice missed questions'}).click();
 assert.equal(await page.evaluate(()=>data.attempt.ids.length),9);
 // Exact match rejects extra or missing selections, including all options.
 assert.equal(await page.evaluate(()=>same([0],[0,2])),false);
 assert.equal(await page.evaluate(()=>same([0,1,2],[0,2])),false);
 assert.equal(await page.evaluate(()=>same([2,0],[0,2])),true);
 // Timer expiration persists once, including refresh while expired.
 await page.evaluate(()=>{data.attempt.mode='exam';data.attempt.started=Date.now()-120000;data.attempt.deadline=Date.now()-1000;save();});await page.reload();
 assert.equal(await page.evaluate(()=>data.attempt.reason),'Time limit reached');
 const history=await page.evaluate(()=>data.history.length);await page.reload();
 assert.equal(await page.evaluate(()=>data.history.length),history);
 // Verify exam conceals answer explanations until submitted.
 await page.selectOption('#mode','exam');await page.selectOption('#domain','Security and safety');
 await page.getByRole('button',{name:'Start practice →'}).click();
 assert.equal(await page.evaluate(()=>data.attempt.ids.length),4);
 assert.equal(await page.locator('#check').count(),0);assert.equal(await page.locator('.feedback').count(),0);
 await page.locator('input[name=answer]').first().check();
 assert.equal(await page.locator('.feedback').count(),0);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:path.resolve(__dirname,'../../simulator-mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);
 await browser.close();console.log('PASS: bank validation, study feedback, flags, resume, scoring, missed practice, timer expiry, exam concealment, mobile overflow, no JS errors.');
})().catch(e=>{console.error(e);process.exit(1);});
