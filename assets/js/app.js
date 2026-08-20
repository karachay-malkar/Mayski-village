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

initWhatsAppLinks();
initInternalNavigation();
initPhotoSlider();
initMap();
initAnalyticsEvents();
