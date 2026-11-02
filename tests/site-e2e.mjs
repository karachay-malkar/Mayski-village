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
  assert.equal(await desktop.locator('#homes .plan-card').count(),3,'three 80 m² plan variants');
  assert.equal(await desktop.locator('#photoSlider > img').count(),5,'preserve every original gallery image');
  await desktop.locator('#homes').scrollIntoViewIfNeeded();
  await desktop.waitForFunction(
    () => [...document.querySelectorAll('#homes .plan-card img')].every(img=>img.complete&&img.naturalWidth>0),
    null,{timeout:20000}
  );
  await desktop.locator('#homes [data-plan-open]').first().click();
  assert.equal(await desktop.locator('#planDialog').evaluate(el=>el.open),true,'plan modal opens');
  await desktop.waitForFunction(()=>document.querySelector('#planDialogImage')?.naturalWidth>0);
  await desktop.locator('#planDialogClose').click();
  assert.equal(await desktop.locator('#planDialog').evaluate(el=>el.open),false,'plan modal closes');
  await desktop.locator('#map').scrollIntoViewIfNeeded();
  await desktop.waitForFunction(()=>document.querySelectorAll('#mapOverlay .plot-hit').length>0,null,{timeout:25000});
  await desktop.locator('#mapOverlay .plot-hit:not(.is-sold)').first().click({force:true});
  assert.match(await desktop.locator('#plotTitle').innerText(),/Участок/i,'map selection populates plot panel');
  assert.equal(await desktop.locator('#photoDots button').count(),5,'gallery still has five selector dots');
  await desktop.locator('#visuals').scrollIntoViewIfNeeded();
  await desktop.locator('#photoDots button').nth(1).click();
  assert.equal(await desktop.locator('#photoSlider img.active').count(),1,'exactly one active photo');
  assert.equal(await desktop.locator('a[data-plan-request]').count(),3);
  assert.ok((await desktop.locator('#price').innerText()).includes('100 000 ₽'));
  assert.ok(!(await desktop.locator('body').innerText()).includes('рассрочка'));
  fs.mkdirSync('test-results',{recursive:true});
  await desktop.screenshot({path:'test-results/desktop.png',fullPage:true});

  mobile = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  mobile.on('pageerror',e=>errors.push(String(e)));
  await mobile.route('https://mc.yandex.ru/**',r=>r.abort());
  await mobile.goto(base,{waitUntil:'domcontentloaded'});
  await mobile.locator('#homes').scrollIntoViewIfNeeded();
  assert.equal(await mobile.locator('#homes .plan-card').count(),3);
  await mobile.waitForFunction(
    () => [...document.querySelectorAll('#homes .plan-card img')].every(img=>img.complete&&img.naturalWidth>0),
    null,{timeout:20000}
  );
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
  console.log('PASS: site sections, original gallery, plan cards, enlarged plan, interactive map, desktop and mobile checks');
} finally {
  await browser.close();
}
