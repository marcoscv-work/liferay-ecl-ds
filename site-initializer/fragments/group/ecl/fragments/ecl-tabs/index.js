(function () {
  var root = (typeof fragmentElement !== 'undefined' && fragmentElement) ? fragmentElement : document;
  var tabs = root.querySelector ? root.querySelector('[data-ecl-tabs]') : null;
  if (!tabs && root.matches && root.matches('[data-ecl-tabs]')) tabs = root;
  if (!tabs) return;
  var tabButtons = tabs.querySelectorAll('[role="tab"]');
  var panels     = tabs.querySelectorAll('[role="tabpanel"]');
  function activate(idx) {
    Array.prototype.forEach.call(tabButtons, function (btn, i) {
      var on = i === idx;
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.setAttribute('tabindex', on ? '0' : '-1');
    });
    Array.prototype.forEach.call(panels, function (p, i) {
      p.hidden = i !== idx;
    });
  }
  Array.prototype.forEach.call(tabButtons, function (btn, i) {
    btn.addEventListener('click', function () { activate(i); btn.focus(); });
    btn.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var next = e.key === 'ArrowRight' ? (i + 1) % tabButtons.length : (i - 1 + tabButtons.length) % tabButtons.length;
      activate(next);
      tabButtons[next].focus();
    });
  });
})();
