// /Users/nikhilsaraf/garage/vinxi/packages/vinxi-devtools/node_modules/preact/dist/preact.module.js
var h = function(n, l) {
  for (var u in l)
    n[u] = l[u];
  return n;
};
var p = function(n) {
  var l = n.parentNode;
  l && l.removeChild(n);
};
var y = function(l, u, t) {
  var i, o, r, f = {};
  for (r in u)
    r == "key" ? i = u[r] : r == "ref" ? o = u[r] : f[r] = u[r];
  if (arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : t), typeof l == "function" && l.defaultProps != null)
    for (r in l.defaultProps)
      f[r] === undefined && (f[r] = l.defaultProps[r]);
  return d(l, f, i, o, null);
};
var d = function(n, t, i, o, r) {
  var f = { type: n, props: t, key: i, ref: o, __k: null, __: null, __b: 0, __e: null, __d: undefined, __c: null, __h: null, constructor: undefined, __v: r == null ? ++u : r };
  return r == null && l.vnode != null && l.vnode(f), f;
};
var k = function(n) {
  return n.children;
};
var b = function(n, l) {
  this.props = n, this.context = l;
};
var g = function(n, l) {
  if (l == null)
    return n.__ ? g(n.__, n.__.__k.indexOf(n) + 1) : null;
  for (var u;l < n.__k.length; l++)
    if ((u = n.__k[l]) != null && u.__e != null)
      return u.__d || u.__e;
  return typeof n.type == "function" ? g(n) : null;
};
var m = function(n) {
  var l, u;
  if ((n = n.__) != null && n.__c != null) {
    for (n.__e = n.__c.base = null, l = 0;l < n.__k.length; l++)
      if ((u = n.__k[l]) != null && u.__e != null) {
        n.__e = n.__c.base = u.__e;
        break;
      }
    return m(n);
  }
};
var w = function(n) {
  (!n.__d && (n.__d = true) && i.push(n) && !x.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || r)(x);
};
var x = function() {
  var n, l, u, t, o, r, e, c, s;
  for (i.sort(f);n = i.shift(); )
    n.__d && (l = i.length, t = undefined, o = undefined, r = undefined, c = (e = (u = n).__v).__e, (s = u.__P) && (t = [], o = [], (r = h({}, e)).__v = e.__v + 1, z(s, e, r, u.__n, s.ownerSVGElement !== undefined, e.__h != null ? [c] : null, t, c == null ? g(e) : c, e.__h, o), L(t, e, o), e.__e != c && m(e)), i.length > l && i.sort(f));
  x.__r = 0;
};
var P = function(n, l, u, t, i, o, r, f, e, a, h2) {
  var p2, y2, _, b2, m2, w2, x2, P2, C, D = 0, H = t && t.__k || s, I = H.length, T = I, j = l.length;
  for (u.__k = [], p2 = 0;p2 < j; p2++)
    (b2 = u.__k[p2] = (b2 = l[p2]) == null || typeof b2 == "boolean" || typeof b2 == "function" ? null : typeof b2 == "string" || typeof b2 == "number" || typeof b2 == "bigint" ? d(null, b2, null, null, b2) : v(b2) ? d(k, { children: b2 }, null, null, null) : b2.__b > 0 ? d(b2.type, b2.props, b2.key, b2.ref ? b2.ref : null, b2.__v) : b2) != null ? (b2.__ = u, b2.__b = u.__b + 1, (P2 = A(b2, H, x2 = p2 + D, T)) === -1 ? _ = c : (_ = H[P2] || c, H[P2] = undefined, T--), z(n, b2, _, i, o, r, f, e, a, h2), m2 = b2.__e, (y2 = b2.ref) && _.ref != y2 && (_.ref && N(_.ref, null, b2), h2.push(y2, b2.__c || m2, b2)), m2 != null && (w2 == null && (w2 = m2), (C = _ === c || _.__v === null) ? P2 == -1 && D-- : P2 !== x2 && (P2 === x2 + 1 ? D++ : P2 > x2 ? T > j - x2 ? D += P2 - x2 : D-- : D = P2 < x2 && P2 == x2 - 1 ? P2 - x2 : 0), x2 = p2 + D, typeof b2.type != "function" || P2 === x2 && _.__k !== b2.__k ? typeof b2.type == "function" || P2 === x2 && !C ? b2.__d !== undefined ? (e = b2.__d, b2.__d = undefined) : e = m2.nextSibling : e = S(n, m2, e) : e = $(b2, e, n), typeof u.type == "function" && (u.__d = e))) : (_ = H[p2]) && _.key == null && _.__e && (_.__e == e && (_.__ = t, e = g(_)), O(_, _, false), H[p2] = null);
  for (u.__e = w2, p2 = I;p2--; )
    H[p2] != null && (typeof u.type == "function" && H[p2].__e != null && H[p2].__e == u.__d && (u.__d = H[p2].__e.nextSibling), O(H[p2], H[p2]));
};
var $ = function(n, l, u) {
  for (var t, i = n.__k, o = 0;i && o < i.length; o++)
    (t = i[o]) && (t.__ = n, l = typeof t.type == "function" ? $(t, l, u) : S(u, t.__e, l));
  return l;
};
var S = function(n, l, u) {
  return u == null || u.parentNode !== n ? n.insertBefore(l, null) : l == u && l.parentNode != null || n.insertBefore(l, u), l.nextSibling;
};
var A = function(n, l, u, t) {
  var { key: i, type: o } = n, r = u - 1, f = u + 1, e = l[u];
  if (e === null || e && i == e.key && o === e.type)
    return u;
  if (t > (e != null ? 1 : 0))
    for (;r >= 0 || f < l.length; ) {
      if (r >= 0) {
        if ((e = l[r]) && i == e.key && o === e.type)
          return r;
        r--;
      }
      if (f < l.length) {
        if ((e = l[f]) && i == e.key && o === e.type)
          return f;
        f++;
      }
    }
  return -1;
};
var D = function(n, l, u, t, i) {
  var o;
  for (o in u)
    o === "children" || o === "key" || (o in l) || I(n, o, null, u[o], t);
  for (o in l)
    i && typeof l[o] != "function" || o === "children" || o === "key" || o === "value" || o === "checked" || u[o] === l[o] || I(n, o, l[o], u[o], t);
};
var H = function(n, l, u) {
  l[0] === "-" ? n.setProperty(l, u == null ? "" : u) : n[l] = u == null ? "" : typeof u != "number" || a.test(l) ? u : u + "px";
};
var I = function(n, l, u, t, i) {
  var o;
  n:
    if (l === "style")
      if (typeof u == "string")
        n.style.cssText = u;
      else {
        if (typeof t == "string" && (n.style.cssText = t = ""), t)
          for (l in t)
            u && (l in u) || H(n.style, l, "");
        if (u)
          for (l in u)
            t && u[l] === t[l] || H(n.style, l, u[l]);
      }
    else if (l[0] === "o" && l[1] === "n")
      o = l !== (l = l.replace(/(PointerCapture)$|Capture$/, "$1")), l = (l.toLowerCase() in n) ? l.toLowerCase().slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + o] = u, u ? t ? u.u = t.u : (u.u = Date.now(), n.addEventListener(l, o ? j : T, o)) : n.removeEventListener(l, o ? j : T, o);
    else if (l !== "dangerouslySetInnerHTML") {
      if (i)
        l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (l !== "width" && l !== "height" && l !== "href" && l !== "list" && l !== "form" && l !== "tabIndex" && l !== "download" && l !== "rowSpan" && l !== "colSpan" && l !== "role" && (l in n))
        try {
          n[l] = u == null ? "" : u;
          break n;
        } catch (n2) {
        }
      typeof u == "function" || (u == null || u === false && l[4] !== "-" ? n.removeAttribute(l) : n.setAttribute(l, u));
    }
};
var T = function(n) {
  var u = this.l[n.type + false];
  if (n.t) {
    if (n.t <= u.u)
      return;
  } else
    n.t = Date.now();
  return u(l.event ? l.event(n) : n);
};
var j = function(n) {
  return this.l[n.type + true](l.event ? l.event(n) : n);
};
var z = function(n, u, t, i, o, r, f, e, c, s) {
  var a, p2, y2, d2, _, g2, m2, w2, x2, $2, C, S2, A2, D2, H2, I2 = u.type;
  if (u.constructor !== undefined)
    return null;
  t.__h != null && (c = t.__h, e = u.__e = t.__e, u.__h = null, r = [e]), (a = l.__b) && a(u);
  n:
    if (typeof I2 == "function")
      try {
        if (w2 = u.props, x2 = (a = I2.contextType) && i[a.__c], $2 = a ? x2 ? x2.props.value : a.__ : i, t.__c ? m2 = (p2 = u.__c = t.__c).__ = p2.__E : (("prototype" in I2) && I2.prototype.render ? u.__c = p2 = new I2(w2, $2) : (u.__c = p2 = new b(w2, $2), p2.constructor = I2, p2.render = q), x2 && x2.sub(p2), p2.props = w2, p2.state || (p2.state = {}), p2.context = $2, p2.__n = i, y2 = p2.__d = true, p2.__h = [], p2._sb = []), p2.__s == null && (p2.__s = p2.state), I2.getDerivedStateFromProps != null && (p2.__s == p2.state && (p2.__s = h({}, p2.__s)), h(p2.__s, I2.getDerivedStateFromProps(w2, p2.__s))), d2 = p2.props, _ = p2.state, p2.__v = u, y2)
          I2.getDerivedStateFromProps == null && p2.componentWillMount != null && p2.componentWillMount(), p2.componentDidMount != null && p2.__h.push(p2.componentDidMount);
        else {
          if (I2.getDerivedStateFromProps == null && w2 !== d2 && p2.componentWillReceiveProps != null && p2.componentWillReceiveProps(w2, $2), !p2.__e && (p2.shouldComponentUpdate != null && p2.shouldComponentUpdate(w2, p2.__s, $2) === false || u.__v === t.__v)) {
            for (u.__v !== t.__v && (p2.props = w2, p2.state = p2.__s, p2.__d = false), u.__e = t.__e, u.__k = t.__k, u.__k.forEach(function(n2) {
              n2 && (n2.__ = u);
            }), C = 0;C < p2._sb.length; C++)
              p2.__h.push(p2._sb[C]);
            p2._sb = [], p2.__h.length && f.push(p2);
            break n;
          }
          p2.componentWillUpdate != null && p2.componentWillUpdate(w2, p2.__s, $2), p2.componentDidUpdate != null && p2.__h.push(function() {
            p2.componentDidUpdate(d2, _, g2);
          });
        }
        if (p2.context = $2, p2.props = w2, p2.__P = n, p2.__e = false, S2 = l.__r, A2 = 0, ("prototype" in I2) && I2.prototype.render) {
          for (p2.state = p2.__s, p2.__d = false, S2 && S2(u), a = p2.render(p2.props, p2.state, p2.context), D2 = 0;D2 < p2._sb.length; D2++)
            p2.__h.push(p2._sb[D2]);
          p2._sb = [];
        } else
          do {
            p2.__d = false, S2 && S2(u), a = p2.render(p2.props, p2.state, p2.context), p2.state = p2.__s;
          } while (p2.__d && ++A2 < 25);
        p2.state = p2.__s, p2.getChildContext != null && (i = h(h({}, i), p2.getChildContext())), y2 || p2.getSnapshotBeforeUpdate == null || (g2 = p2.getSnapshotBeforeUpdate(d2, _)), P(n, v(H2 = a != null && a.type === k && a.key == null ? a.props.children : a) ? H2 : [H2], u, t, i, o, r, f, e, c, s), p2.base = u.__e, u.__h = null, p2.__h.length && f.push(p2), m2 && (p2.__E = p2.__ = null);
      } catch (n2) {
        u.__v = null, (c || r != null) && (u.__e = e, u.__h = !!c, r[r.indexOf(e)] = null), l.__e(n2, u, t);
      }
    else
      r == null && u.__v === t.__v ? (u.__k = t.__k, u.__e = t.__e) : u.__e = M(t.__e, u, t, i, o, r, f, c, s);
  (a = l.diffed) && a(u);
};
var L = function(n, u, t) {
  for (var i = 0;i < t.length; i++)
    N(t[i], t[++i], t[++i]);
  l.__c && l.__c(u, n), n.some(function(u2) {
    try {
      n = u2.__h, u2.__h = [], n.some(function(n2) {
        n2.call(u2);
      });
    } catch (n2) {
      l.__e(n2, u2.__v);
    }
  });
};
var M = function(l, u, t, i, o, r, f, e, s) {
  var a, h2, y2, d2 = t.props, _ = u.props, k2 = u.type, b2 = 0;
  if (k2 === "svg" && (o = true), r != null) {
    for (;b2 < r.length; b2++)
      if ((a = r[b2]) && ("setAttribute" in a) == !!k2 && (k2 ? a.localName === k2 : a.nodeType === 3)) {
        l = a, r[b2] = null;
        break;
      }
  }
  if (l == null) {
    if (k2 === null)
      return document.createTextNode(_);
    l = o ? document.createElementNS("http://www.w3.org/2000/svg", k2) : document.createElement(k2, _.is && _), r = null, e = false;
  }
  if (k2 === null)
    d2 === _ || e && l.data === _ || (l.data = _);
  else {
    if (r = r && n.call(l.childNodes), h2 = (d2 = t.props || c).dangerouslySetInnerHTML, y2 = _.dangerouslySetInnerHTML, !e) {
      if (r != null)
        for (d2 = {}, b2 = 0;b2 < l.attributes.length; b2++)
          d2[l.attributes[b2].name] = l.attributes[b2].value;
      (y2 || h2) && (y2 && (h2 && y2.__html == h2.__html || y2.__html === l.innerHTML) || (l.innerHTML = y2 && y2.__html || ""));
    }
    if (D(l, _, d2, o, e), y2)
      u.__k = [];
    else if (P(l, v(b2 = u.props.children) ? b2 : [b2], u, t, i, o && k2 !== "foreignObject", r, f, r ? r[0] : t.__k && g(t, 0), e, s), r != null)
      for (b2 = r.length;b2--; )
        r[b2] != null && p(r[b2]);
    e || (("value" in _) && (b2 = _.value) !== undefined && (b2 !== l.value || k2 === "progress" && !b2 || k2 === "option" && b2 !== d2.value) && I(l, "value", b2, d2.value, false), ("checked" in _) && (b2 = _.checked) !== undefined && b2 !== l.checked && I(l, "checked", b2, d2.checked, false));
  }
  return l;
};
var N = function(n, u, t) {
  try {
    typeof n == "function" ? n(u) : n.current = u;
  } catch (n2) {
    l.__e(n2, t);
  }
};
var O = function(n, u, t) {
  var i, o;
  if (l.unmount && l.unmount(n), (i = n.ref) && (i.current && i.current !== n.__e || N(i, null, u)), (i = n.__c) != null) {
    if (i.componentWillUnmount)
      try {
        i.componentWillUnmount();
      } catch (n2) {
        l.__e(n2, u);
      }
    i.base = i.__P = null, n.__c = undefined;
  }
  if (i = n.__k)
    for (o = 0;o < i.length; o++)
      i[o] && O(i[o], u, t || typeof n.type != "function");
  t || n.__e == null || p(n.__e), n.__ = n.__e = n.__d = undefined;
};
var q = function(n, l, u) {
  return this.constructor(n, u);
};
var B = function(u, t, i) {
  var o, r, f, e;
  l.__ && l.__(u, t), r = (o = typeof i == "function") ? null : i && i.__k || t.__k, f = [], e = [], z(t, u = (!o && i || t).__k = y(k, null, [u]), r || c, c, t.ownerSVGElement !== undefined, !o && i ? [i] : r ? null : t.firstChild ? n.call(t.childNodes) : null, f, !o && i ? i : r ? r.__e : t.firstChild, o, e), L(f, u, e);
};
var n;
var l;
var u;
var t;
var i;
var o;
var r;
var f;
var e;
var c = {};
var s = [];
var a = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var v = Array.isArray;
n = s.slice, l = { __e: function(n2, l2, u2, t2) {
  for (var i2, o2, r2;l2 = l2.__; )
    if ((i2 = l2.__c) && !i2.__)
      try {
        if ((o2 = i2.constructor) && o2.getDerivedStateFromError != null && (i2.setState(o2.getDerivedStateFromError(n2)), r2 = i2.__d), i2.componentDidCatch != null && (i2.componentDidCatch(n2, t2 || {}), r2 = i2.__d), r2)
          return i2.__E = i2;
      } catch (l3) {
        n2 = l3;
      }
  throw n2;
} }, u = 0, t = function(n2) {
  return n2 != null && n2.constructor === undefined;
}, b.prototype.setState = function(n2, l2) {
  var u2;
  u2 = this.__s != null && this.__s !== this.state ? this.__s : this.__s = h({}, this.state), typeof n2 == "function" && (n2 = n2(h({}, u2), this.props)), n2 && h(u2, n2), n2 != null && this.__v && (l2 && this._sb.push(l2), w(this));
}, b.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), w(this));
}, b.prototype.render = k, i = [], r = typeof Promise == "function" ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, f = function(n2, l2) {
  return n2.__v.__b - l2.__v.__b;
}, x.__r = 0, e = 0;

// /Users/nikhilsaraf/garage/vinxi/packages/vinxi-devtools/node_modules/preact/hooks/dist/hooks.module.js
var d2 = function(t2, u2) {
  l.__h && l.__h(r2, t2, o2 || u2), o2 = 0;
  var i2 = r2.__H || (r2.__H = { __: [], __h: [] });
  return t2 >= i2.__.length && i2.__.push({ __V: c2 }), i2.__[t2];
};
var h2 = function(n2) {
  return o2 = 1, s2(B2, n2);
};
var s2 = function(n2, u2, i2) {
  var o2 = d2(t2++, 2);
  if (o2.t = n2, !o2.__c && (o2.__ = [i2 ? i2(u2) : B2(undefined, u2), function(n3) {
    var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
    t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
  }], o2.__c = r2, !r2.u)) {
    var f2 = function(n3, t2, r2) {
      if (!o2.__c.__H)
        return true;
      var u3 = o2.__c.__H.__.filter(function(n4) {
        return n4.__c;
      });
      if (u3.every(function(n4) {
        return !n4.__N;
      }))
        return !c2 || c2.call(this, n3, t2, r2);
      var i3 = false;
      return u3.forEach(function(n4) {
        if (n4.__N) {
          var t3 = n4.__[0];
          n4.__ = n4.__N, n4.__N = undefined, t3 !== n4.__[0] && (i3 = true);
        }
      }), !(!i3 && o2.__c.props === n3) && (!c2 || c2.call(this, n3, t2, r2));
    };
    r2.u = true;
    var { shouldComponentUpdate: c2, componentWillUpdate: e2 } = r2;
    r2.componentWillUpdate = function(n3, t2, r2) {
      if (this.__e) {
        var u3 = c2;
        c2 = undefined, f2(n3, t2, r2), c2 = u3;
      }
      e2 && e2.call(this, n3, t2, r2);
    }, r2.shouldComponentUpdate = f2;
  }
  return o2.__N || o2.__;
};
var p2 = function(u2, i2) {
  var o2 = d2(t2++, 3);
  !l.__s && z2(o2.__H, i2) && (o2.__ = u2, o2.i = i2, r2.__H.__h.push(o2));
};
var _ = function(n2) {
  return o2 = 5, F(function() {
    return { current: n2 };
  }, []);
};
var F = function(n2, r2) {
  var u2 = d2(t2++, 7);
  return z2(u2.__H, r2) ? (u2.__V = n2(), u2.i = r2, u2.__h = n2, u2.__V) : u2.__;
};
var b2 = function() {
  for (var t2;t2 = f2.shift(); )
    if (t2.__P && t2.__H)
      try {
        t2.__H.__h.forEach(k2), t2.__H.__h.forEach(w2), t2.__H.__h = [];
      } catch (r2) {
        t2.__H.__h = [], l.__e(r2, t2.__v);
      }
};
var j2 = function(n2) {
  var t2, r2 = function() {
    clearTimeout(u2), g2 && cancelAnimationFrame(t2), setTimeout(n2);
  }, u2 = setTimeout(r2, 100);
  g2 && (t2 = requestAnimationFrame(r2));
};
var k2 = function(n2) {
  var t2 = r2, u2 = n2.__c;
  typeof u2 == "function" && (n2.__c = undefined, u2()), r2 = t2;
};
var w2 = function(n2) {
  var t2 = r2;
  n2.__c = n2.__(), r2 = t2;
};
var z2 = function(n2, t2) {
  return !n2 || n2.length !== t2.length || t2.some(function(t3, r2) {
    return t3 !== n2[r2];
  });
};
var B2 = function(n2, t2) {
  return typeof t2 == "function" ? t2(n2) : t2;
};
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = [];
var e2 = l.__b;
var a2 = l.__r;
var v2 = l.diffed;
var l2 = l.__c;
var m2 = l.unmount;
l.__b = function(n2) {
  r2 = null, e2 && e2(n2);
}, l.__r = function(n2) {
  a2 && a2(n2), t2 = 0;
  var i3 = (r2 = n2.__c).__H;
  i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.forEach(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.__V = c2, n3.__N = n3.i = undefined;
  })) : (i3.__h.forEach(k2), i3.__h.forEach(w2), i3.__h = [], t2 = 0)), u2 = r2;
}, l.diffed = function(t3) {
  v2 && v2(t3);
  var o3 = t3.__c;
  o3 && o3.__H && (o3.__H.__h.length && (f2.push(o3) !== 1 && i2 === l.requestAnimationFrame || ((i2 = l.requestAnimationFrame) || j2)(b2)), o3.__H.__.forEach(function(n2) {
    n2.i && (n2.__H = n2.i), n2.__V !== c2 && (n2.__ = n2.__V), n2.i = undefined, n2.__V = c2;
  })), u2 = r2 = null;
}, l.__c = function(t3, r3) {
  r3.some(function(t4) {
    try {
      t4.__h.forEach(k2), t4.__h = t4.__h.filter(function(n2) {
        return !n2.__ || w2(n2);
      });
    } catch (u3) {
      r3.some(function(n2) {
        n2.__h && (n2.__h = []);
      }), r3 = [], l.__e(u3, t4.__v);
    }
  }), l2 && l2(t3, r3);
}, l.unmount = function(t3) {
  m2 && m2(t3);
  var r3, u3 = t3.__c;
  u3 && u3.__H && (u3.__H.__.forEach(function(n2) {
    try {
      k2(n2);
    } catch (n3) {
      r3 = n3;
    }
  }), u3.__H = undefined, r3 && l.__e(r3, u3.__v));
};
var g2 = typeof requestAnimationFrame == "function";

// mount.jsx
import style2 from "./style.css?raw";

// /Users/nikhilsaraf/garage/vinxi/packages/vinxi-devtools/node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var o3 = function(o4, e3, n2, t3, f3, l3) {
  var s3, u3, a3 = {};
  for (u3 in e3)
    u3 == "ref" ? s3 = e3[u3] : a3[u3] = e3[u3];
  var i3 = { type: o4, props: a3, key: n2, ref: s3, __k: null, __: null, __b: 0, __e: null, __d: undefined, __c: null, __h: null, constructor: undefined, __v: --_2, __source: f3, __self: l3 };
  if (typeof o4 == "function" && (s3 = o4.defaultProps))
    for (u3 in s3)
      a3[u3] === undefined && (a3[u3] = s3[u3]);
  return l.vnode && l.vnode(i3), i3;
};
var _2 = 0;

// mount.jsx
async function mount() {
  const shadow = document.createElement("div");
  shadow.attachShadow({ mode: "open" });
  shadow.id = "devtools";
  document.body.appendChild(shadow);
  function App(props) {
    const [isOpen, setIsOpen] = h2(false);
    const ref = _();
    const [isHovering, setIsHovering] = h2(false);
    p2(() => {
    }, [ref.current]);
    return o3(k, {
      children: [
        o3("style", {
          children: style2
        }),
        o3("div", {
          id: "nuxt-devtools-anchor",
          className: !isHovering ? "nuxt-devtools-hide" : "",
          style: {
            left: "50%"
          },
          onMouseMove: () => {
            setIsHovering(true);
          },
          children: [
            o3("div", {
              className: "nuxt-devtools-glowing"
            }),
            o3("div", {
              ref,
              className: "nuxt-devtools-panel",
              style: {
                backgroundColor: "rgba(0, 0, 0, 0.90)",
                width: "4rem",
                height: "30px",
                display: "flex",
                flexDirection: "row",
                transition: "all",
                zIndex: 9999999,
                alignItems: "center",
                justifyContent: "center"
              },
              onClick: () => {
                setIsOpen((o4) => !o4);
              },
              children: o3("svg", {
                viewBox: "0 0 128 128",
                fill: "none",
                style: { color: "white", width: "16px", height: "16px" },
                xmlns: "http://www.w3.org/2000/svg",
                children: [
                  o3("g", {
                    "clip-path": "url(#clip0_1_9)",
                    children: o3("path", {
                      d: "M93.0704 3.61125L25.7606 54.3447L25 58.9291L25.7606 60.1516L27.2817 62.291L30.7042 64.4303L35.6479 66.5697L40.2113 68.4034L44.0141 71.154L46.2958 74.5159L47.0563 77.2665V81.5452L34.507 124.333V126.472L35.2676 127.694L36.4085 128L38.6901 127.389L104.479 77.2665L106 75.1271V72.3765L105.239 70.2372L103.338 68.4034L89.6479 61.9853L86.2254 58.9291L83.5634 54.3447V49.4548L96.1127 6.97311V3.30562L94.9718 3L93.0704 3.61125Z",
                      fill: "currentColor",
                      stroke: "currentColor"
                    })
                  }),
                  o3("defs", {
                    children: o3("clipPath", {
                      id: "clip0_1_9",
                      children: o3("rect", {
                        width: "128",
                        height: "128",
                        fill: "currentColor"
                      })
                    })
                  })
                ]
              })
            }),
            "$",
            isOpen ? o3("div", {
              className: "nuxt-devtools-frame",
              style: {
                position: "absolute",
                bottom: "1rem",
                left: "0px",
                zIndex: 9999998,
                transform: "translate(-50%, 0)",
                backgroundColor: "black",
                width: "70vw",
                borderRadius: "0.5rem",
                height: "45vh",
                border: "1px solid #3336",
                display: "flex",
                flexDirection: "row",
                overflow: "hidden",
                transition: "all",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "rgba(99, 99, 99, 0.2) 0px 8px 16px 0px"
              },
              children: o3("iframe", {
                src: "/__devtools/client/index.html"
              })
            }) : null
          ]
        })
      ]
    });
  }
  B(o3(App, {}), shadow.shadowRoot);
}
export {
  mount as default
};
