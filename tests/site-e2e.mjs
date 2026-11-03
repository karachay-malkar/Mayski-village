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
  assert.equal(await desktop.locator('#homes .plan-card').count(),6,'six plans, including 120 m²');
  assert.equal(await desktop.locator('.plan-column-count').count(),0,'remove number of plans under titles');
  assert.equal(await desktop.locator('.plan-card-body').count(),0,'remove all text below floor plans');
  assert.equal(await desktop.locator('[data-deck-position]').count(),0,'no visible card counters');
  assert.equal(await desktop.locator('#homes .plan-stack').count(),3,'three compact stacked galleries');
  assert.equal(await desktop.locator('#homes .plan-column').count(),3,'80 / 100 / 120 m² columns');
  assert.deepEqual(await desktop.locator('.plan-column').evaluateAll(cols=>cols.map(c=>c.dataset.planArea)),['80','100','120']);
  assert.deepEqual(await desktop.locator('.plan-column').evaluateAll(cols=>cols.map(c=>c.querySelectorAll('.plan-card').length)),[3,2,1]);
  assert.equal(await desktop.locator('#photoSlider > img').count(),11,'hero, views, masterplan and homes retained');
  assert.equal(await desktop.locator('.contract-card').count(),2,'exactly two contracts');
  assert.equal(await desktop.locator('.plan-zoom').count(),0,'no enlarge button on plan cards');
  assert.match(await desktop.locator('#price').innerText(),/предчистовой отделкой/i);
  await desktop.locator('#homes').scrollIntoViewIfNeeded();
  for(const card of await desktop.locator('#homes .plan-card').all()){
    await card.scrollIntoViewIfNeeded();
    await card.locator('img').evaluate(img=>img.decode());
  }
  for(const plan of await desktop.locator('#homes .plan-image-link img').all()){
    assert.equal(await plan.evaluate(el=>getComputedStyle(el).objectFit),'contain','no image cropping');
  }
  const deck=desktop.locator('#planDeck80');
  assert.ok((await deck.boundingBox()).height<=410,'compact deck height');
  assert.equal(await desktop.locator('#planDeck80 .plan-card.is-current').getAttribute('data-plan-variant'),'01');
  await desktop.locator('[data-plan-area="80"] [data-deck-step="1"]').click();
  await desktop.waitForFunction(()=>document.querySelector('#planDeck80 .plan-card.is-current')?.dataset.planVariant==='02');
  assert.equal(await desktop.locator('#planDeck80 .plan-card.is-current').count(),1,'only one visible current card');
  await deck.dispatchEvent('wheel',{deltaY:220});
  await desktop.waitForFunction(()=>document.querySelector('#planDeck80 .plan-card.is-current')?.dataset.planVariant==='03');
  await desktop.locator('#homes .plan-card.is-current [data-plan-open]').first().click();
  assert.equal(await desktop.locator('#planDialog').evaluate(el=>el.open),true,'plan modal opens');
  await desktop.waitForFunction(()=>document.querySelector('#planDialogImage')?.naturalWidth>0);
  await desktop.locator('#planDialogClose').click();
  assert.equal(await desktop.locator('#planDialog').evaluate(el=>el.open),false,'plan modal closes');
  assert.equal(await desktop.locator('#homes [data-plan-size="100"] img').first().getAttribute('src'),'assets/images/plans/100-01-corrected-thumb.webp','corrected first 100 m² thumbnail used');
  assert.deepEqual(await desktop.locator('#homes [data-plan-size="100"] img').first().evaluate(el=>[el.naturalWidth,el.naturalHeight]),[960,720],'corrected first 100 m² thumbnail dimensions');
  for(const area of [100]){
    await desktop.locator('#homes .plan-card[data-plan-size="'+area+'"] [data-plan-open]').first().click();
    await desktop.waitForFunction(()=>document.querySelector('#planDialogImage')?.complete && document.querySelector('#planDialogImage')?.naturalWidth>0);
    assert.match(await desktop.locator('#planDialogTitle').innerText(),new RegExp(String(area)+' м²'));
    const fullHref=await desktop.locator('#planDialogOriginal').getAttribute('href');
    const expected='100-01-corrected.webp';
    assert.ok(fullHref.endsWith(expected),'modal must link selected full size '+area+' m²');
    if(area===100){
      assert.deepEqual(await desktop.locator('#planDialogImage').evaluate(el=>[el.naturalWidth,el.naturalHeight]),[1448,1086],'corrected 100 m² plan retains original dimensions');
    }
    await desktop.locator('#planDialogClose').click();
  }

  const new120=desktop.locator('#homes [data-plan-size="120"]');
  assert.equal(await new120.count(),1,'one correct 120 m² plan');
  assert.equal(await new120.locator('img').getAttribute('src'),'assets/images/plans/120-01-sofa-fixed-thumb.webp');
  await new120.locator('img').evaluate(img=>img.decode());
  assert.deepEqual(await new120.locator('img').evaluate(img=>[img.naturalWidth,img.naturalHeight]),[960,720]);
  await new120.locator('[data-plan-open]').click();
  await desktop.locator('#planDialogImage').evaluate(img=>img.decode());
  assert.equal(await desktop.locator('#planDialogTitle').innerText(),'Планировка 120 м² · Вариант 06');
  assert.equal(await desktop.locator('#planDialogOriginal').getAttribute('href'),'assets/images/plans/120-01-sofa-fixed.webp');
  assert.deepEqual(await desktop.locator('#planDialogImage').evaluate(img=>[img.naturalWidth,img.naturalHeight]),[1448,1086]);
  assert.ok((await desktop.locator('#planDialogEstimate').getAttribute('href')).includes('120'),'120 m² WhatsApp calculation link');
  await desktop.locator('#planDialogClose').click();
  await desktop.locator('#map').scrollIntoViewIfNeeded();
  await desktop.waitForFunction(()=>document.querySelectorAll('#mapOverlay .plot-hit').length>0,null,{timeout:25000});
  await desktop.locator('#mapOverlay .plot-hit:not(.is-sold)').first().click({force:true});
  assert.match(await desktop.locator('#plotTitle').innerText(),/Участок/i,'map selection populates plot panel');
  assert.equal(await desktop.locator('#photoDots button').count(),11,'gallery must have 11 selectors');
  await desktop.locator('#visuals').scrollIntoViewIfNeeded();
  await desktop.locator('#photoDots button').nth(1).click();
  assert.equal(await desktop.locator('#photoSlider img.active').count(),1,'exactly one active photo');
  await desktop.waitForFunction(()=>document.querySelector('#photoSlider img.active')?.naturalWidth>0,null,{timeout:20000});
  assert.equal(await desktop.locator('a[data-plan-request]').count(),0,'no repeated CTAs below plan cards');
  assert.equal(await desktop.locator('#planDialogEstimate').count(),1,'one CTA inside full-size image modal');
  assert.equal(await desktop.locator('#homes [data-plan-area="100"] .plan-card').count(),2,'two 100 m² plans available');
  const hundredDeck=desktop.locator('#planDeck100');
  await desktop.locator('[data-plan-area="100"] [data-deck-step="1"]').click();
  await desktop.waitForFunction(()=>document.querySelector('#planDeck100 .plan-card.is-current')?.dataset.planVariant==='05');
  assert.equal(await hundredDeck.locator('.plan-card.is-current [data-plan-open]').getAttribute('href'),'assets/images/plans/100-02-reclassified.webp','formerly 120 m² plan reclassified as 100 m²');
  await hundredDeck.locator('.plan-card.is-current [data-plan-open]').click();
  await desktop.waitForFunction(()=>document.querySelector('#planDialogImage')?.complete&&document.querySelector('#planDialogImage')?.naturalWidth>0);
  assert.match(await desktop.locator('#planDialogTitle').innerText(),/100 м²/);
  assert.deepEqual(await desktop.locator('#planDialogImage').evaluate(el=>[el.naturalWidth,el.naturalHeight]),[1536,1024]);
  await desktop.locator('#planDialogClose').click();
  assert.ok((await desktop.locator('#homes .plans-note').innerText()).includes('без учёта террас'),'terraces not counted');
  assert.ok((await desktop.locator('#price').innerText()).includes('100 000 ₽'));
  assert.ok(!(await desktop.locator('body').innerText()).includes('рассрочка'));
  fs.mkdirSync('test-results',{recursive:true});
  await desktop.screenshot({path:'test-results/desktop.png',fullPage:true});

  mobile = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push(String(e)));
  await mobile.route('https://mc.yandex.ru/**',r=>r.abort());
  await mobile.goto(base,{waitUntil:'domcontentloaded'});
  await mobile.locator('#homes').scrollIntoViewIfNeeded();
  assert.equal(await mobile.locator('#homes .plan-card').count(),6);
  for(const card of await mobile.locator('#homes .plan-card').all()){
    await card.scrollIntoViewIfNeeded();
    await card.locator('img').evaluate(img=>img.decode());
  }
  await mobile.locator('#map').scrollIntoViewIfNeeded();
  await mobile.waitForFunction(()=>document.querySelector('#map .map-bg')?.naturalWidth>0,null,{timeout:20000});
  await mobile.locator('#visuals').scrollIntoViewIfNeeded();
  await mobile.waitForFunction(()=>document.querySelector('#photoSlider img.active')?.naturalWidth>0,null,{timeout:20000});
  const columns=await mobile.locator('#planGrid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
  assert.equal(columns,1,'mobile shows full-width stacked categories');
  assert.equal(await mobile.locator('#homes .plan-deck').count(),3);
  const deckDetails=await mobile.locator('#planDeck80').evaluate(el=>({height:el.getBoundingClientRect().height,overflow:getComputedStyle(el).overflowY}));
  assert.ok(deckDetails.height<=410,'mobile stacked gallery remains compact');
  assert.equal(deckDetails.overflow,'hidden');
  assert.equal(await mobile.locator('.plan-column-count').count(),0);
  await mobile.screenshot({path:'test-results/mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'no uncaught JavaScript errors');
  console.log('PASS: 80/100/120 m² groups, 6 images, sofa-corrected 120 plan full-resolution modal, responsive gallery, map');
} finally {
  await browser.close();
}
