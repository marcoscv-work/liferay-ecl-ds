(function () {
  var root = (typeof fragmentElement !== 'undefined' && fragmentElement) ? fragmentElement : document;
  var btn = root.querySelector ? root.querySelector('.ecl-tag__remove') : null;
  if (!btn) return;
  btn.addEventListener('click', function () {
    var tag = btn.closest('.ecl-tag');
    if (tag) tag.style.display = 'none';
  });
})();
