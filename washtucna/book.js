// Forward motion by keyboard: arrows and space move one spread at a time.
(function () {
  var spreads = Array.prototype.slice.call(document.querySelectorAll('.book > section'));
  function current() {
    var y = window.scrollY + window.innerHeight / 2;
    for (var i = 0; i < spreads.length; i++) {
      var r = spreads[i];
      if (y >= r.offsetTop && y < r.offsetTop + r.offsetHeight) return i;
    }
    return 0;
  }
  function go(i) {
    i = Math.max(0, Math.min(spreads.length - 1, i));
    // A page turn is a cut, not a slide: jump, don't animate.
    window.scrollTo({ top: spreads[i].offsetTop, behavior: 'auto' });
  }
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(current() + 1); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); go(current() - 1); }
  });

  // Warm the next two spreads' plates as each one comes into view, so a page turn never lands on paper.
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
})();
