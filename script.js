document.documentElement.className+=' js';

(function(){
  var d=document, head=d.getElementById('head'), nav=d.getElementById('nav'), menu=d.getElementById('menu');

  /* Header condenses on scroll */
  function onScroll(){ head.classList.toggle('scrolled', window.scrollY>12); }
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  /* Mobile menu */
  function closeMenu(){ nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open menu'); }
  menu.addEventListener('click', function(){
    var open=!nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open?'Close menu':'Open menu');
  });
  nav.addEventListener('click', function(e){ if(e.target.tagName==='A') closeMenu(); });
  d.addEventListener('keydown', function(e){ if(e.key==='Escape') closeMenu(); });

  /* Reveals and wave drawing */
  var targets=d.querySelectorAll('.rv,[data-draw],[data-in]');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{threshold:.15, rootMargin:'0px 0px -6% 0px'});
    targets.forEach(function(t){ io.observe(t); });

    /* Highlight the current section in the menu */
    var links={};
    nav.querySelectorAll('a').forEach(function(a){ links[a.getAttribute('href').slice(1)]=a; });
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          Object.keys(links).forEach(function(k){ links[k].classList.toggle('on', k===e.target.id); });
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(links).forEach(function(k){ var s=d.getElementById(k); if(s) so.observe(s); });

    /* Mobile action bar: show after the hero, hide near the form and footer */
    var bar=d.getElementById('bar'), heroSeen=true, formSeen=false, footSeen=false;
    function setBar(){ bar.classList.toggle('show', !heroSeen && !formSeen && !footSeen); }
    new IntersectionObserver(function(es){ heroSeen=es[0].isIntersecting; setBar(); }).observe(d.getElementById('top'));
    new IntersectionObserver(function(es){ formSeen=es[0].isIntersecting; setBar(); }).observe(d.getElementById('involved'));
    new IntersectionObserver(function(es){ footSeen=es[0].isIntersecting; setBar(); }).observe(d.querySelector('.foot'));
  } else {
    targets.forEach(function(t){ t.classList.add('in'); });
  }

  /* Days until Election Day, counted in Eastern time */
  try{
    var p=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).split('-');
    var left=Math.round((Date.UTC(2026,10,3)-Date.UTC(+p[0],+p[1]-1,+p[2]))/864e5);
    var num=d.getElementById('days'), lab=d.getElementById('daysLabel'), barText=d.getElementById('barText');
    if(left>0){
      lab.innerHTML=(left===1?'day':'days')+' until Election Day<br>Tuesday, November 3';
      var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(reduce){ num.textContent=left; }
      else{
        var start=null, from=Math.min(left+24,99);
        num.textContent=from;
        setTimeout(function(){
          requestAnimationFrame(function step(t){
            if(!start) start=t;
            var k=Math.min((t-start)/1100,1), e=1-Math.pow(1-k,3);
            num.textContent=Math.round(from-(from-left)*e);
            if(k<1) requestAnimationFrame(step);
          });
        },900);
      }
      barText.firstChild.nodeValue=left+(left===1?' day':' days')+' to Election Day';
    } else if(left===0){
      num.textContent='Today'; lab.innerHTML='is Election Day.<br>Polls are open. Go vote.';
      barText.firstChild.nodeValue='Election Day is today';
    } else {
      num.textContent='Thank you'; lab.innerHTML='to everyone in District 8<br>who showed up.';
      barText.firstChild.nodeValue='Thank you, District 8';
    }
  }catch(err){}

  /* Video slot: reads data-video-url on #kate-video */
  var frame=d.getElementById('kate-video'), btn=d.getElementById('playBtn'), label=d.getElementById('playLabel');
  var url=(frame.getAttribute('data-video-url')||'').trim();
  function player(u){
    var m;
    if((m=u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/))){
      return '<iframe src="https://www.youtube-nocookie.com/embed/'+m[1]+'?autoplay=1&rel=0" title="Kate Nolan campaign video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    }
    if((m=u.match(/vimeo\.com\/(?:video\/)?(\d+)/))){
      return '<iframe src="https://player.vimeo.com/video/'+m[1]+'?autoplay=1" title="Kate Nolan campaign video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
    }
    return '<video src="'+u.replace(/"/g,'&quot;')+'" controls autoplay playsinline></video>';
  }
  if(url){
    btn.removeAttribute('aria-disabled');
    label.textContent="Play Kate's message";
    btn.addEventListener('click', function(){
      frame.classList.add('playing');
      frame.insertAdjacentHTML('beforeend', player(url));
    });
  }
})();