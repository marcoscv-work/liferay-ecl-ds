(function () {
  var root = (typeof fragmentElement !== 'undefined' && fragmentElement) ? fragmentElement : document;
  var header = root.querySelector ? root.querySelector('[data-ecl-site-header]') : null;
  if (!header && root.matches && root.matches('[data-ecl-site-header]')) header = root;
  if (!header) return;
  var toggle = header.querySelector('[data-ecl-toggle="menu"]');
  var list   = header.querySelector('.ecl-site-header__nav-list');
  if (!toggle || !list) return;
  toggle.addEventListener('click', function () {
    var open = list.classList.toggle('ecl-site-header__nav-list--open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
