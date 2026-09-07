(function () {
  var spreads = Array.prototype.slice.call(document.querySelectorAll('.book > section'));
  var wide = matchMedia('(min-width: 761px)');
  var lightbox = document.getElementById('lightbox');

  /* ---- page turns (tablet/desktop) ---- */
  function current() {
    var y = window.scrollY + window.innerHeight / 2;
    for (var i = 0; i < spreads.length; i++) {
      if (y >= spreads[i].offsetTop && y < spreads[i].offsetTop + spreads[i].offsetHeight) return i;
    }
    return 0;
  }
  function go(i) {
    i = Math.max(0, Math.min(spreads.length - 1, i));
    window.scrollTo({ top: spreads[i].offsetTop, behavior: 'auto' }); // a page turn is a cut, not a slide
  }
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || !lightbox.hidden) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(current() + 1); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); go(current() - 1); }
  });

  /* ---- folio: page numbers, counted from the first day page ---- */
  var folio = document.querySelector('.folio');
  var firstNumbered = spreads.indexOf(document.querySelector('.matter--day'));
  function updateFolio() {
    var i = current();
    var k = i - firstNumbered + 1;
    var last = spreads.length - 1;
    if (!wide.matches || k < 1 || i === last) { folio.classList.remove('is-on'); return; }
    var total = (last - firstNumbered) * 2;
    folio.textContent = (2 * k - 1) + '–' + (2 * k) + '  ·  ' + total;
    folio.classList.add('is-on');
  }
  window.addEventListener('scroll', updateFolio, { passive: true });
  window.addEventListener('resize', updateFolio);
  updateFolio();

  /* ---- warm the next two spreads so a turn never lands on paper ---- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = spreads.indexOf(en.target);
        for (var k = i + 1; k <= i + 2 && k < spreads.length; k++) {
          spreads[k].querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = 'eager'; });
        }
      });
    }, { rootMargin: '50% 0px' });
    spreads.forEach(function (s) { io.observe(s); });
  }

  /* ---- lightbox: tap a plate to see it large; arrows/swipe move between plates ---- */
  var lbImg = lightbox.querySelector('img');
  var plates = Array.prototype.slice.call(document.querySelectorAll('.page img[data-large], .stage--wide img[data-large]'));
  var at = -1;
  function show(i) {
    if (i < 0 || i >= plates.length) return;
    at = i;
    lbImg.src = plates[i].getAttribute('data-large');
    lightbox.hidden = false;
    document.documentElement.classList.add('is-lightbox');
    if (plates[i + 1]) { var pre = new Image(); pre.src = plates[i + 1].getAttribute('data-large'); }
  }
  function hide() {
    lightbox.hidden = true;
    document.documentElement.classList.remove('is-lightbox');
    if (at >= 0) plates[at].scrollIntoView({ block: 'center', behavior: 'auto' });
  }
  plates.forEach(function (img, i) { img.addEventListener('click', function () { show(i); }); });
  lightbox.addEventListener('click', hide);
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); hide(); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); show(at + 1); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')  { e.preventDefault(); show(at - 1); }
  });
  var x0 = null;
  lightbox.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) { e.preventDefault(); show(dx < 0 ? at + 1 : at - 1); }
  });
})();
