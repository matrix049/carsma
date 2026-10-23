/**
 * Tiny polyfills for built-ins that older iPhones / Android browsers lack but
 * Next.js, React or our libraries call. Rendered as the first <script> in
 * <head> (see app/layout.tsx), so it runs before any app code. Written in
 * ES5 on purpose — this is the one script that can't be transpiled.
 *
 * Audited against the production build: the remaining newer built-ins
 * (BigInt, typed BigInt arrays) only appear in React code paths this site
 * never reaches.
 */
export const LEGACY_POLYFILLS = `(function () {
  var g = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window;
  if (typeof globalThis === 'undefined') g.globalThis = g;
  function def(o, k, v) {
    if (!(k in o)) Object.defineProperty(o, k, { value: v, writable: true, configurable: true });
  }
  function at(n) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    return n < 0 || n >= this.length ? undefined : this[n];
  }
  def(Array.prototype, 'at', at);
  def(String.prototype, 'at', at);
  def(Object, 'hasOwn', function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); });
  def(Object, 'fromEntries', function (it) {
    var o = {};
    Array.from(it, function (e) { o[e[0]] = e[1]; });
    return o;
  });
  def(Array.prototype, 'flat', function (depth) {
    depth = depth === undefined ? 1 : Math.trunc(depth) || 0;
    var out = [];
    (function walk(a, d) {
      for (var i = 0; i < a.length; i++) {
        if (!(i in a)) continue;
        if (d > 0 && Array.isArray(a[i])) walk(a[i], d - 1);
        else out.push(a[i]);
      }
    })(this, depth);
    return out;
  });
  def(Array.prototype, 'flatMap', function (cb, thisArg) {
    return Array.prototype.map.call(this, cb, thisArg).flat();
  });
  def(String.prototype, 'replaceAll', function (search, replacement) {
    if (search instanceof RegExp) return this.replace(search, replacement);
    var escaped = String(search).replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
    return this.replace(new RegExp(escaped, 'g'), replacement);
  });
  if (!Promise.allSettled) {
    Promise.allSettled = function (items) {
      return Promise.all(Array.from(items, function (p) {
        return Promise.resolve(p).then(
          function (value) { return { status: 'fulfilled', value: value }; },
          function (reason) { return { status: 'rejected', reason: reason }; }
        );
      }));
    };
  }
  if (typeof g.queueMicrotask !== 'function') {
    g.queueMicrotask = function (cb) {
      Promise.resolve().then(cb).catch(function (e) { setTimeout(function () { throw e; }); });
    };
  }
  // Without IntersectionObserver, report everything as visible straight away
  // so scroll-reveal content is never left hidden.
  if (typeof g.IntersectionObserver === 'undefined') {
    var IO = function (cb) { this._cb = cb; this._els = []; };
    IO.prototype.observe = function (el) {
      var self = this;
      this._els.push(el);
      setTimeout(function () {
        if (self._els.indexOf(el) === -1) return;
        var r = el.getBoundingClientRect();
        self._cb([{ target: el, isIntersecting: true, intersectionRatio: 1, boundingClientRect: r, intersectionRect: r, rootBounds: null, time: Date.now() }], self);
      }, 0);
    };
    IO.prototype.unobserve = function (el) { this._els = this._els.filter(function (x) { return x !== el; }); };
    IO.prototype.disconnect = function () { this._els = []; };
    IO.prototype.takeRecords = function () { return []; };
    g.IntersectionObserver = IO;
  }
  // Without ResizeObserver, report sizes on observe and on window resize.
  if (typeof g.ResizeObserver === 'undefined') {
    var RO = function (cb) { this._cb = cb; this._els = []; var self = this; this._onResize = function () { self._emit(self._els); }; };
    RO.prototype._emit = function (els) {
      if (!els.length) return;
      this._cb(els.map(function (el) {
        var r = el.getBoundingClientRect();
        var box = [{ inlineSize: r.width, blockSize: r.height }];
        return { target: el, contentRect: r, borderBoxSize: box, contentBoxSize: box };
      }), this);
    };
    RO.prototype.observe = function (el) {
      var self = this;
      if (!this._els.length) window.addEventListener('resize', this._onResize);
      this._els.push(el);
      setTimeout(function () { if (self._els.indexOf(el) !== -1) self._emit([el]); }, 0);
    };
    RO.prototype.unobserve = function (el) {
      this._els = this._els.filter(function (x) { return x !== el; });
      if (!this._els.length) window.removeEventListener('resize', this._onResize);
    };
    RO.prototype.disconnect = function () { this._els = []; window.removeEventListener('resize', this._onResize); };
    g.ResizeObserver = RO;
  }
})();`;
