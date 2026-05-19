(function () {
  var root = (typeof fragmentElement !== 'undefined' && fragmentElement) ? fragmentElement : document;
  var btn = root.querySelector ? root.querySelector('.ecl-message__close') : null;
  if (!btn) return;
  btn.addEventListener('click', function () {
    var msg = btn.closest('[data-ecl-message]');
    if (msg) msg.style.display = 'none';
  });
})();
