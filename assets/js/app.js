const qs=(s,root=document)=>root.querySelector(s);
const qsa=(s,root=document)=>[...root.querySelectorAll(s)];
const WHATSAPP_NUMBER='79280824841';
const METRIKA_ID=111487320;

function metrikaGoal(goal,params={}){
  if(typeof window.ym==='function') window.ym(METRIKA_ID,'reachGoal',goal,params);
}

function whatsappUrl(message){
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function initWhatsAppLinks(){
  qsa('[data-wa]').forEach(link=>{
    const message=(link.dataset.wa||'').trim();
    if(message) link.href=whatsappUrl(message);
  });
}

function initAnalyticsEvents(){
  document.addEventListener('click',e=>{
    const link=e.target.closest('a');
    if(!link) return;
    const href=link.getAttribute('href')||'';
    const label=(link.textContent||'').trim().replace(/\s+/g,' ').slice(0,100);
    if(href.includes('wa.me/')) metrikaGoal('whatsapp_click',{label});
    else if(href.startsWith('tel:')) metrikaGoal('phone_click',{label});
    else if(href.includes('yandex.ru/maps')) metrikaGoal('map_click',{label});
    else if(href==='#map') metrikaGoal('map_open',{label});
    if(link.closest('#photoSlider')) metrikaGoal('gallery_click',{label});
  });

  const observeOnce=(selector,goal)=>{
    const el=qs(selector);
    if(!el||!('IntersectionObserver' in window)) return;
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        metrikaGoal(goal);
        observer.disconnect();
      }
    },{threshold:.3});
    observer.observe(el);
  };

  [
    ['#price','price_view'],
    ['#comparison','comparison_view'],
    ['#homes','homes_view'],
    ['#map','map_view'],
    ['#benefits','benefits_view'],
    ['#visuals','visuals_view'],
    ['#documents','documents_view'],
    ['#payment','payment_view'],
    ['#location','location_view'],
    ['#builder','builder_view'],
    ['#contact','contact_view']
  ].forEach(([selector,goal])=>observeOnce(selector,goal));
}

function initInternalNavigation(){
  qsa('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',e=>{
      const selector=link.getAttribute('href');
      const target=selector&&qs(selector);
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
      history.replaceState(null,'',location.pathname+location.search);
    });
  });
}

function makeDots(root,count,onClick){
  if(!root) return [];
  root.innerHTML='';
  return Array.from({length:count},(_,i)=>{
    const button=document.createElement('button');
    button.type='button';
    button.setAttribute('aria-label',`Показать визуализацию ${i+1}`);
    button.addEventListener('click',()=>{
      metrikaGoal('gallery_next',{slide:i+1});
      onClick(i);
    });
    root.appendChild(button);
    return button;
  });
}

function initPhotoSlider(){
  const slider=qs('#photoSlider');
  if(!slider) return;
  const slides=qsa('img',slider);
  if(!slides.length) return;
  let index=0;
  let timer=null;

  slides.forEach((slide,i)=>{
    slide.classList.toggle('active',i===0);
    slide.classList.remove('previous');
  });

  const dots=makeDots(qs('#photoDots'),slides.length,i=>set(i,true));

  function paintDots(){
    dots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
  }

  function start(){
    if(timer) clearInterval(timer);
    timer=setInterval(()=>set((index+1)%slides.length,false),6000);
  }

  function set(next,restart){
    next=(Number(next)+slides.length)%slides.length;
    if(next===index){
      if(restart) start();
      return;
    }
    const old=index;
    slides[old].classList.remove('active');
    slides[old].classList.add('previous');
    slides[next].classList.remove('previous');
    slides[next].classList.add('active');
    index=next;
    paintDots();
    setTimeout(()=>slides[old]?.classList.remove('previous'),850);
    if(restart) start();
  }

  paintDots();
  start();
}

const plotData={};

function idFrom(el){
  return String(el.dataset.plotId||el.id||'').replace('plot-','');
}

function isSold(id){
  return String(plotData[id]?.statusLabel||'').toLowerCase()==='продан';
}

function fillPanel(id){
  const plot=plotData[id]||{};
  const sold=isSold(id);
  qs('#plotKicker').textContent=id?`Участок ${id}`:'Нажмите на участок';
  qs('#plotTitle').textContent=plot.title||`Участок ${id}`;
  qs('#plotArea').textContent=plot.areaLabel||'—';

  const status=qs('#plotStatus');
  if(status){
    status.textContent=plot.statusLabel||'Свободен';
    status.classList.toggle('is-sold',sold);
  }

  const link=qs('#plotWhatsApp');
  if(link&&id){
    link.textContent=sold?'Подобрать похожий участок':'Получить расчёт';
    link.href=whatsappUrl(
      sold
        ? `Здравствуйте! Увидел, что участок №${id} в жилом квартале «Майский Берег» уже продан. Помогите подобрать похожий свободный участок.`
        : `Здравствуйте! Интересует участок №${id} в жилом квартале «Майский Берег». Хотел бы получить расчёт и узнать подробности.`
    );
  }
}

function addLabels(svg){
  const group=document.createElementNS('http://www.w3.org/2000/svg','g');
  svg.querySelectorAll('.plot-hit').forEach(el=>{
    const id=idFrom(el);
    try{
      const box=el.getBBox();
      const label=document.createElementNS('http://www.w3.org/2000/svg','text');
      label.setAttribute('class',`plot-label${isSold(id)?' is-sold':''}`);
      label.setAttribute('x',box.x+box.width/2);
      label.setAttribute('y',box.y+box.height/2);
      label.textContent=id;
      group.appendChild(label);
    }catch(e){}
  });
  svg.appendChild(group);
}

function positionSoldBadges(svg,host){
  const hostRect=host.getBoundingClientRect();
  qsa('.plot-sold-badge',host).forEach(x=>x.remove());
  svg.querySelectorAll('.plot-hit.is-sold').forEach(el=>{
    const rect=el.getBoundingClientRect();
    if(!rect.width||!rect.height) return;
    const badge=document.createElement('span');
    badge.className='plot-sold-badge';
    badge.textContent='Продан';
    badge.dataset.plotId=idFrom(el);
    badge.style.left=`${rect.left-hostRect.left+rect.width/2}px`;
    badge.style.top=`${rect.top-hostRect.top+Math.max(8,Math.min(rect.height*.22,18))}px`;
    host.appendChild(badge);
  });
}

async function initMap(){
  try{
    const [svgRes,jsonRes]=await Promise.all([
      fetch('assets/map/masterplan_overlay_cropped.svg'),
      fetch('assets/map/masterplan_plots_cropped.json')
    ]);
    if(!svgRes.ok||!jsonRes.ok) throw new Error('map files');

    Object.assign(plotData,await jsonRes.json());
    const host=qs('#mapOverlay');
    if(!host) return;
    host.innerHTML=await svgRes.text();

    const svg=qs('svg',host);
    if(!svg) throw new Error('map svg');
    svg.setAttribute('preserveAspectRatio','none');

    const plots=qsa('.plot-hit',svg);
    plots.forEach(el=>{
      const id=idFrom(el);
      const sold=isSold(id);
      if(sold) el.classList.add('is-sold');

      el.addEventListener('click',()=>{
        plots.forEach(x=>x.classList.remove('is-selected'));
        el.classList.add('is-selected');
        fillPanel(id);
        metrikaGoal('plot_select',{plot_id:id,status:sold?'sold':'available'});
      });

      el.addEventListener('keydown',e=>{
        if(e.key==='Enter'||e.key===' '){
          e.preventDefault();
          el.click();
        }
      });

      el.setAttribute('tabindex','0');
      el.setAttribute('role','button');
      el.setAttribute('aria-label',`Участок ${id}${sold?', продан':''}`);
    });

    requestAnimationFrame(()=>{
      addLabels(svg);
      positionSoldBadges(svg,host);
    });

    let resizeFrame=0;
    const reposition=()=>{
      cancelAnimationFrame(resizeFrame);
      resizeFrame=requestAnimationFrame(()=>positionSoldBadges(svg,host));
    };
    window.addEventListener('resize',reposition,{passive:true});
    if('ResizeObserver' in window) new ResizeObserver(reposition).observe(host);
  }catch(e){
    const host=qs('#mapOverlay');
    if(host) host.innerHTML='<div class="map-error">Карта временно не загрузилась</div>';
    console.error(e);
  }
}

function initEcoComparison(){
  const comparison=qs('#comparison');
  if(!comparison) return;

  const oldPhilosophy=qs('#space');
  if(oldPhilosophy) oldPhilosophy.remove();

  const title=qs('.section-title',comparison);
  if(title){
    title.innerHTML='<span>Новый взгляд на комфорт</span><h2>Пространство — новая роскошь</h2>';
  }

  const copy=qs('.trend-copy',comparison);
  if(copy){
    copy.textContent='Города становятся плотнее и шумнее, а личное пространство — ценнее. Поэтому всё больше людей выбирают свой дом, сад и террасу вдали от плотной застройки, сохраняя доступ к городской инфраструктуре.';
  }

  const cityLabel=qs('.lifestyle-column--city > small',comparison);
  const homeLabel=qs('.lifestyle-column--home > small',comparison);
  if(cityLabel) cityLabel.textContent='Городская квартира';
  if(homeLabel) homeLabel.textContent='Майский Берег';

  // Lucide icons (ISC License): https://lucide.dev/
  const iconX='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  const iconCheck='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  qsa('.compare-mark--no',comparison).forEach(mark=>mark.innerHTML=iconX);
  qsa('.compare-mark--yes',comparison).forEach(mark=>mark.innerHTML=iconCheck);

  if(!qs('#eco-theme-20260821')){
    const style=document.createElement('style');
    style.id='eco-theme-20260821';
    style.textContent=`
      :root{--bg:#f1f3ef;--milk:#fbfcf9;--ink:#1f2922;--muted:#68716b;--accent:#3f5f4a;--dark:#294035;--line:rgba(41,64,53,.14);--shadow:0 24px 70px rgba(41,64,53,.12)}
      body{background:linear-gradient(180deg,#f7f8f5,#e8ede8);color:var(--ink)}
      .site-header{background:linear-gradient(135deg,rgba(41,64,53,.97),rgba(63,95,74,.94));border:1px solid rgba(207,226,211,.12);box-shadow:0 10px 30px rgba(29,49,38,.22)}
      .brand span{color:#294035}
      .hero{background:#294035}
      .hero-shade{background:linear-gradient(90deg,rgba(41,64,53,.80) 0%,rgba(41,64,53,.58) 36%,rgba(41,64,53,.20) 66%,rgba(41,64,53,0) 86%),linear-gradient(0deg,rgba(29,49,38,.52) 0%,rgba(41,64,53,.12) 55%,rgba(41,64,53,0) 78%)}
      .hero-inner>p,.contact-section>div>span{color:#c6dbc9}
      .section-title span{color:#3f5f4a}
      .button.primary{background:#3f5f4a;box-shadow:0 14px 32px rgba(63,95,74,.24)}
      .price-intro{background:#294035}
      .sales-card small,.plot-card>span{color:#3f5f4a}
      .plot-meta div{background:#eef2ed}
      .contact-section{background:linear-gradient(135deg,#294035,#3f5f4a)}
      .comparison-section--trend{padding-top:54px}
      .comparison-section .section-title{max-width:1000px}
      .comparison-section .section-title h2{max-width:930px}
      .comparison-section .trend-copy{max-width:900px;color:#68716b}
      .lifestyle-column--city{background:linear-gradient(145deg,rgba(255,255,255,.42),rgba(255,255,255,.06)),#d7d9d7!important;border-color:#c3c7c3!important;color:#3f4240}
      .lifestyle-column--city>small{color:#686d69!important}
      .lifestyle-column--city .lifestyle-row{border-bottom-color:rgba(63,66,64,.13)!important}
      .lifestyle-column--home{background:linear-gradient(145deg,#294035,#3f5f4a)!important;color:#fff!important;border-color:rgba(63,95,74,.14)!important;box-shadow:0 22px 54px rgba(41,64,53,.18)}
      .lifestyle-column--home>small{color:#c8ddcb!important}
      .lifestyle-column--home .lifestyle-row{border-bottom-color:rgba(255,255,255,.14)!important}
      .compare-mark{background:transparent!important;border:1px solid currentColor;font-size:0}
      .compare-mark--no{color:#737873!important}
      .compare-mark--yes{color:#d9eadc!important}
      .compare-mark svg{display:block;width:20px;height:20px}
      @media(max-width:720px){.hero-shade{background:linear-gradient(90deg,rgba(41,64,53,.70) 0%,rgba(41,64,53,.38) 76%,rgba(41,64,53,.10) 100%),linear-gradient(0deg,rgba(29,49,38,.78) 0%,rgba(41,64,53,.30) 58%,rgba(41,64,53,0) 82%)}}
    `;
    document.head.appendChild(style);
  }
}

initEcoComparison();
initWhatsAppLinks();
initInternalNavigation();
initPhotoSlider();
initMap();
initAnalyticsEvents();
