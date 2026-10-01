/* jq-mini.js
 * Cut-down stand-in for jQuery. We used to pull 1.9.1 off the CDN but IT
 * blocked outbound http from the app servers in 2014 so this got written to
 * cover the handful of calls the pages actually make. Same call style so the
 * inline scripts did not have to be touched.  - AB
 *
 * supported: $(fn) $(sel).each .text .html .val .hide .show .on .trigger .attr
 *            .addClass .removeClass  and $.get
 */
(function (w, d) {

  function Q(list) {
    this.els = list || [];
    this.length = this.els.length;
  }

  Q.prototype.each = function (fn) {
    for (var i = 0; i < this.els.length; i++) { fn.call(this.els[i], i, this.els[i]); }
    return this;
  };

  Q.prototype.text = function (v) {
    if (v === undefined) { return this.els.length ? (this.els[0].textContent || '') : ''; }
    return this.each(function () { this.textContent = v; });
  };

  Q.prototype.html = function (v) {
    if (v === undefined) { return this.els.length ? this.els[0].innerHTML : ''; }
    return this.each(function () { this.innerHTML = v; });
  };

  Q.prototype.val = function (v) {
    if (v === undefined) { return this.els.length ? this.els[0].value : ''; }
    return this.each(function () { this.value = v; });
  };

  Q.prototype.attr = function (n, v) {
    if (v === undefined) { return this.els.length ? this.els[0].getAttribute(n) : null; }
    return this.each(function () { this.setAttribute(n, v); });
  };

  Q.prototype.hide = function () { return this.each(function () { this.style.display = 'none'; }); };
  Q.prototype.show = function () { return this.each(function () { this.style.display = ''; }); };

  Q.prototype.addClass = function (c) {
    return this.each(function () { if ((' ' + this.className + ' ').indexOf(' ' + c + ' ') < 0) { this.className = (this.className + ' ' + c).replace(/^\s+/, ''); } });
  };

  Q.prototype.removeClass = function (c) {
    return this.each(function () { this.className = (' ' + this.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, ''); });
  };

  Q.prototype.on = function (evt, fn) {
    return this.each(function () {
      var el = this;
      el.addEventListener(evt, function (e) {
        var r = fn.call(el, e);
        if (r === false) { e.preventDefault(); }
        return r;
      }, false);
    });
  };

  Q.prototype.trigger = function (evt) {
    return this.each(function () {
      var e;
      try { e = new Event(evt, { bubbles: true, cancelable: true }); }
      catch (ex) { e = d.createEvent('HTMLEvents'); e.initEvent(evt, true, true); }
      this.dispatchEvent(e);
    });
  };

  var $ = function (sel) {
    if (typeof sel === 'function') {
      if (d.readyState === 'loading') { d.addEventListener('DOMContentLoaded', sel, false); }
      else { sel(); }
      return new Q([]);
    }
    if (sel && sel.nodeType) { return new Q([sel]); }
    if (!sel) { return new Q([]); }
    var found = d.querySelectorAll(sel);
    var arr = [];
    for (var i = 0; i < found.length; i++) { arr.push(found[i]); }
    return new Q(arr);
  };

  /* only used by the old dashboard poller, left in */
  $.get = function (u, cb) {
    var x = new XMLHttpRequest();
    x.open('GET', u, true);
    x.onreadystatechange = function () {
      if (x.readyState == 4) {
        var data = x.responseText;
        try { data = JSON.parse(data); } catch (e) { /* not json, never mind */ }
        if (cb) { cb(data, x.status); }
      }
    };
    x.send(null);
  };

  w.$ = $;
  w.jQ = $;

})(window, document);
