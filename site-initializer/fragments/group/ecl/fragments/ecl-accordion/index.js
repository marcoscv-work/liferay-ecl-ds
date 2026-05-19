(function () {
  var root = (typeof fragmentElement !== 'undefined' && fragmentElement) ? fragmentElement : document;
  var acc = root.querySelector ? root.querySelector('[data-ecl-accordion]') : null;
  if (!acc && root.matches && root.matches('[data-ecl-accordion]')) acc = root;
  if (!acc) return;
  if (acc.getAttribute('data-ecl-exclusive') !== 'true') return;
  var items = acc.querySelectorAll('details.ecl-accordion__item');
  Array.prototype.forEach.call(items, function (det) {
    det.addEventListener('toggle', function () {
      if (det.open) {
        Array.prototype.forEach.call(items, function (other) {
          if (other !== det && other.open) other.open = false;
        });
      }
    });
  });
})();
