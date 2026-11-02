import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4173/';
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const errors = [];
let desktop, mobile;
try {
  desktop = await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  desktop.on('pageerror',e=>errors.push(String(e)));
  await desktop.route('https://mc.yandex.ru/**',r=>r.abort());
  const response = await desktop.goto(base,{waitUntil:'domcontentloaded'});
  assert.equal(response?.status(),200,'home page should load');
  assert.equal(await desktop.locator('main section').count(),7,'must have seven main sections');
  assert.equal(await desktop.locator('#homes .plan-card').count(),5,'three 80 m² plan variants');
  assert.equal(await desktop.locator('#photoSlider > img').count(),11,'hero, views, masterplan and homes retained');
  assert.equal(await desktop.locator('.contract-card').count(),2,'exactly two contracts');
  assert.equal(await desktop.locator('.plan-zoom').count(),0,'no enlarge button on plan cards');
  assert.match(await desktop.locator('#price').innerText(),/предчистовой отделкой/i);
  await desktop.locator('#homes').scrollIntoViewIfNeeded();
  for(const card of await desktop.locator('#homes .plan-card').all()){
    await card.scrollIntoViewIfNeeded();
    await card.locator('img').evaluate(img=>img.decode());
  }
  await desktop.locator('#homes [data-plan-open]').first().click();
  assert.equal(await desktop.locator('#planDialog').evaluate(el=>el.open),true,'plan modal opens');
  await desktop.waitForFunction(()=>document.querySelector('#planDialogImage')?.naturalWidth>0);
  await desktop.locator('#planDialogClose').click();
  assert.equal(await desktop.locator('#planDialog').evaluate(el=>el.open),false,'plan modal closes');
  for(const area of [100,120]){
    await desktop.locator('#homes .plan-card[data-plan-size="'+area+'"] [data-plan-open]').click();
    await desktop.waitForFunction(()=>document.querySelector('#planDialogImage')?.complete && document.querySelector('#planDialogImage')?.naturalWidth>0);
    assert.match(await desktop.locator('#planDialogTitle').innerText(),new RegExp(String(area)+' м²'));
    const fullHref=await desktop.locator('#planDialogOriginal').getAttribute('href');
    assert.ok(fullHref.endsWith(String(area)+'-01.webp'),'modal must link full size '+area+' m²');
    await desktop.locator('#planDialogClose').click();
  }
  await desktop.locator('#map').scrollIntoViewIfNeeded();
  await desktop.waitForFunction(()=>document.querySelectorAll('#mapOverlay .plot-hit').length>0,null,{timeout:25000});
  await desktop.locator('#mapOverlay .plot-hit:not(.is-sold)').first().click({force:true});
  assert.match(await desktop.locator('#plotTitle').innerText(),/Участок/i,'map selection populates plot panel');
  assert.equal(await desktop.locator('#photoDots button').count(),11,'gallery must have 11 selectors');
  await desktop.locator('#visuals').scrollIntoViewIfNeeded();
  await desktop.locator('#photoDots button').nth(1).click();
  assert.equal(await desktop.locator('#photoSlider img.active').count(),1,'exactly one active photo');
  await desktop.waitForFunction(()=>document.querySelector('#photoSlider img.active')?.naturalWidth>0,null,{timeout:20000});
  assert.equal(await desktop.locator('a[data-plan-request]').count(),5);
  assert.ok((await desktop.locator('#price').innerText()).includes('100 000 ₽'));
  assert.ok(!(await desktop.locator('body').innerText()).includes('рассрочка'));
  fs.mkdirSync('test-results',{recursive:true});
  await desktop.screenshot({path:'test-results/desktop.png',fullPage:true});

  mobile = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push(String(e)));
  await mobile.route('https://mc.yandex.ru/**',r=>r.abort());
  await mobile.goto(base,{waitUntil:'domcontentloaded'});
  await mobile.locator('#homes').scrollIntoViewIfNeeded();
  assert.equal(await mobile.locator('#homes .plan-card').count(),5);
  for(const card of await mobile.locator('#homes .plan-card').all()){
    await card.scrollIntoViewIfNeeded();
    await card.locator('img').evaluate(img=>img.decode());
  }
  await mobile.locator('#map').scrollIntoViewIfNeeded();
  await mobile.waitForFunction(()=>document.querySelector('#map .map-bg')?.naturalWidth>0,null,{timeout:20000});
  await mobile.locator('#visuals').scrollIntoViewIfNeeded();
  await mobile.waitForFunction(()=>document.querySelector('#photoSlider img.active')?.naturalWidth>0,null,{timeout:20000});
  const properties=await mobile.locator('#planGrid').evaluate(el=>({
    overflow:el.scrollWidth>el.clientWidth,
    scrollSnap:getComputedStyle(el).scrollSnapType
  }));
  assert.equal(properties.overflow,true,'mobile plan cards must be scrollable');
  assert.match(properties.scrollSnap,/mandatory/);
  await mobile.screenshot({path:'test-results/mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'no uncaught JavaScript errors');
  console.log('PASS: 5 plan cards, modal display of 80/100/120 m², gallery, masterplan, mobile/desktop');
} finally {
  await browser.close();
}
));
    await desktop.locator('#planDialogClose').click();
  }
  await desktop.locator('#map').scrollIntoViewIfNeeded();
  await desktop.waitForFunction(()=>document.querySelectorAll('#mapOverlay .plot-hit').length>0,null,{timeout:25000});
  await desktop.locator('#mapOverlay .plot-hit:not(.is-sold)').first().click({force:true});
  assert.match(await desktop.locator('#plotTitle').innerText(),/Участок/i,'map selection populates plot panel');
  assert.equal(await desktop.locator('#photoDots button').count(),11,'gallery must have 11 selectors');
  await desktop.locator('#visuals').scrollIntoViewIfNeeded();
  await desktop.locator('#photoDots button').nth(1).click();
  assert.equal(await desktop.locator('#photoSlider img.active').count(),1,'exactly one active photo');
  await desktop.waitForFunction(()=>document.querySelector('#photoSlider img.active')?.naturalWidth>0,null,{timeout:20000});
  assert.equal(await desktop.locator('a[data-plan-request]').count(),5);
  assert.ok((await desktop.locator('#price').innerText()).includes('100 000 ₽'));
  assert.ok(!(await desktop.locator('body').innerText()).includes('рассрочка'));
  fs.mkdirSync('test-results',{recursive:true});
  await desktop.screenshot({path:'test-results/desktop.png',fullPage:true});

  mobile = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push(String(e)));
  await mobile.route('https://mc.yandex.ru/**',r=>r.abort());
  await mobile.goto(base,{waitUntil:'domcontentloaded'});
  await mobile.locator('#homes').scrollIntoViewIfNeeded();
  assert.equal(await mobile.locator('#homes .plan-card').count(),5);
  for(const card of await mobile.locator('#homes .plan-card').all()){
    await card.scrollIntoViewIfNeeded();
    await card.locator('img').evaluate(img=>img.decode());
  }
  await mobile.locator('#map').scrollIntoViewIfNeeded();
  await mobile.waitForFunction(()=>document.querySelector('#map .map-bg')?.naturalWidth>0,null,{timeout:20000});
  await mobile.locator('#visuals').scrollIntoViewIfNeeded();
  await mobile.waitForFunction(()=>document.querySelector('#photoSlider img.active')?.naturalWidth>0,null,{timeout:20000});
  const properties=await mobile.locator('#planGrid').evaluate(el=>({
    overflow:el.scrollWidth>el.clientWidth,
    scrollSnap:getComputedStyle(el).scrollSnapType
  }));
  assert.equal(properties.overflow,true,'mobile plan cards must be scrollable');
  assert.match(properties.scrollSnap,/mandatory/);
  await mobile.screenshot({path:'test-results/mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'no uncaught JavaScript errors');
  console.log('PASS: 11 gallery images, two contracts, predchistovaya, plans, masterplan, desktop/mobile');
} finally {
  await browser.close();
}
