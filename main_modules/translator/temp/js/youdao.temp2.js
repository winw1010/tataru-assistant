// 2018-06-09 13:24
var _rlog = _rlog || [];
! function (a, b, c, d, e) {
	function f(a, b) {
		L.pid && 1 != L.ispvt && (L.ispvt = 1, L.cat = "pageview", g(u() + b, a))
	}

	function g(a, b) {
		var c = ["_npid=" + L.pid, "_ncat=" + L.cat, t(), a];
		L.post.length && c.push(s(L.post)), h(K + "/rlog.php?" + c.join("&"), b)
	}

	function h(a, b) {
		if (y) navigator.sendBeacon(a), b && b();
		else {
			var c = new Image;
			c.onload = c.onerror = function () {
				b && b()
			}, c.src = a, c = null
		}
	}

	function i(b) {
		var c = b || a.event,
			d = c.target || c.srcElement;
		d.href && P.push(["_trackCustom", "click", d.href])
	}

	function j(c) {
		c = c || a.event;
		for (var d = c.target ? c.target : c.srcElement, e = b.body; d != e; d = d.parentNode || e)
			if (1 === d.nodeType && !0 !== d.disabled) {
				var f = d.getAttribute("data-rlog");
				f && P.push(["_trackEvent", f])
			}
	}

	function k() {
		return {
			pid: "",
			cat: "",
			post: [],
			ispvt: 0,
			pvcb: [],
			autopv: !0,
			autouid: !1
		}
	}

	function l(a) {
		return "[object Array]" === Object.prototype.toString.call(a)
	}

	function m(a, b) {
		var c;
		for (c in a) a.hasOwnProperty(c) && b(c, a[c])
	}

	function n() {
		return "https:" == c.protocol ? "https:" : "http:"
	}

	function o(a, c) {
		if (x && "mousedown" == a) return void b.addEventListener("touchstart", c, !1);
		b.addEventListener ? b.addEventListener(a, c, !1) : b.attachEvent("on" + a, c)
	}

	function p(a, c) {
		if (x && "mousedown" == a) return void b.removeEventListener("touchstart", c, !1);
		b.removeEventListener ? b.removeEventListener(a, c, !1) : b.detachEvent("on" + a, c)
	}

	function q(a, b) {
		var c = new Date;
		c.setTime(c.getTime() + 63072e6), document.cookie = a + "=" + b + ";expires=" + c.toGMTString() + ";path=/;domain=" + J
	}

	function r(a) {
		for (var b = document.cookie, c = a + "=", d = b.length, e = 0; e < d;) {
			var f = e + c.length;
			if (b.substring(e, f) == c) {
				var g = b.indexOf(";", f);
				return -1 == g && (g = d), unescape(b.substring(f, g))
			}
			if (0 == (e = b.indexOf(" ", e) + 1)) break
		}
		return -1
	}

	function s(a) {
		l(a) || (a = []);
		var b, c, e, f = [];
		for (b = 0, c = a.length; b < c; ++b) e = a[b], l(e) && f.push(e[0] + "=" + d(e[1]));
		return f.join("&")
	}

	function t() {
		var a = (new Date).getTime(),
			c = [];
		return b.cookie = "___rl__test__cookies=" + a, G = r("OUTFOX_SEARCH_USER_ID_NCOO"), -1 == G && r("___rl__test__cookies") == a && (G = 2147483647 * Math.random(), q("OUTFOX_SEARCH_USER_ID_NCOO", G)), F = r("P_INFO"), F = -1 == F ? "NULL" : F.substr(0, F.indexOf("|")), c = ["_ncoo=" + G, "_nssn=" + F, "_nver=" + z, "_ntms=" + a], L.autouid && c.push("_rl_nuid=" + __rl_nuid), c.join("&")
	}

	function u() {
		if (D = "-", self.screen) D = screen.width + "x" + screen.height;
		else if (self.java) {
			var e = java.awt.Toolkit.getDefaultToolkit(),
				f = e.getScreenSize();
			D = f.width + "x" + f.height
		}
		var g = new Date(b.lastModified);
		E = g.getTime() / 1e3;
		var h = a.navigator;
		B = h && h.javaEnabled() ? 1 : 0, A = b.characterSet || b.charset || "-", A = A.toLowerCase(), C = d(b.referrer), I = d(c.href), H = c.hash ? d(c.hash.substring(1)) : "";
		var h = ["_nref=" + C, "_nurl=" + I, "_nres=" + D, "_nlmf=" + E, "_njve=" + B, "_nchr=" + A, "_nfrg=" + H];
		return h.join("&")
	}

	function v(a) {
		var d = a ? 4 : 3,
			e = "res:" === c.protocol ? "" : b.domain,
			f = e.split("."),
			g = f.length;
		if (/^\d+$/g.test(f[g - 1])) return e;
		if (f.length < d) return "." + e;
		var h, i = ["com", "net", "org", "gov", "co"],
			j = !1;
		for (h = 0; h < i.length; h++) f[g - 2] == i[h] && (j = !0);
		for (var k = j ? d : d - 1, l = []; k;) l.push(f[g - k]), k--;
		return "." + l.join(".")
	}
	if (!a.__rl_event) {
		var w = navigator.userAgent.toLowerCase(),
			x = /(mobile|iphone|ipod|blackberry)/.test(w),
			y = !1,
			z = "1.2.0",
			A = "",
			B = 0,
			C = "",
			D = "",
			E = 0,
			F = "NULL",
			G = "NULL",
			H = "",
			I = "",
			J = v(),
			K = (v(!0), n() + "//rlogs.youdao.com"),
			L = k(),
			M = {
				_default: L
			},
			N = {},
			O = a._rlog,
			P = a._rlog = {};
		P.push = function (a) {
			var b = a[0].split("."),
				c = b.pop();
			b = b.join("_"), b || (b = "_default"), L = M[b] || (M[b] = k());
			var d = N[c];
			d && d.apply(this, a.slice(1))
		}, N._setAccount = function (a) {
			a && (L.pid = a)
		}, N._setAutoPageview = function (a) {
			L.autopv = a
		}, N._setAutoUserId = function (a) {
			L.autouid = a
		}, N._addPost = function (a, b) {
			N._removePost(a), L.post.push([a, b])
		}, N._onPageViewFinished = function (a) {
			L.pvcb.push(a)
		}, N._trackCustom = function (a, b, c) {
			if (L.pid) {
				L.cat = a;
				var e;
				e = l(b) ? s(b) : "_nhrf=" + d(b), g(e, c)
			}
		}, N._trackEvent = function (a, b) {
			N._trackCustom("event", a, b)
		}, N._trackPageview = function (a) {
			if (!L.ispvt || "ido" === a) {
				var b = L;
				f(function () {
					for (var a; a = b.pvcb.shift();) try {
						a()
					} catch (a) { }
					b.ispvt = 2
				}, l(a) && a.length ? "&" + s(a) : "")
			}
		}, N._removePost = function (a) {
			if (!a) return void (L.post = []);
			for (var b = L.post, c = 0, d = b.length; c < d; c++)
				if (b[c] && b[c][0] == a) return b.splice(c, 1), c
		}, N._trackUserId = function () {
			var a = !1,
				b = r("DICT_LOGIN");
			if (-1 == b || /^[0|8]\w*/.test(b)) q("DICT_USR", "-1");
			else {
				if (-1 != r("DICT_USR")) {
					var c = r("DICT_USR").split("~");
					2 == c.length ? (__rl_nuid = c[1], b != c[0] && (a = !0)) : a = !0
				} else a = !0;
				a && _rl_network.ajax({
					url: location.protocol + "//dict.youdao.com/login/acc/co/cq?product=DICT&cf=1",
					success: function (a) {
						a.login ? (b = r("DICT_LOGIN"), q("DICT_USR", b + "~" + a.userid), __rl_nuid = a.userid) : __rl_nuid = "unknown"
					},
					fail: function () {
						__rl_nuid = "unknown"
					}
				})
			}
		}, a.__rl_event = function (a, b) {
			P.push(["_trackCustom", "event", a, b])
		}, L.pid = a.__rl_npid || "", L.post = a.__rl_post || [], L.autopv = "undefined" == typeof __rl_pageview || !!a.__rl_pageview;
		var Q = function () {
			var a, b = c.search.replace(/^\?/, "").split("&"),
				d = {},
				f = 0;
			for (f = 0; f < b.length; f++)(a = b[f]) && (a = a.split("="), d[a[0]] = void 0 === a[1] ? null : e(a[1]));
			return d
		}();
		Q.vendor && N._addPost("vendor", Q.vendor), Q.keyfrom && N._addPost("keyfrom", Q.keyfrom),
			function () {
				var a = c.hash;
				if (a) {
					a = a.replace(/^#/, "").split("&");
					var b, d, f;
					for (d = 0, f = a.length; d < f; d++)(b = a[d]) && (b = b.split("="), N._addPost(b[0], e(b[1] || "NULL")))
				}
			}(),
			function () {
				try {
					if (!O) return;
					for (var a = 1, b = O.length; a < b; a++)
						if (/_setAccount$/.test(O[a][0])) {
							var c = O[a];
							O.splice(a, 1), O.splice(0, 0, c)
						} for (var a = 0, b = O.length; a < b; a++) P.push(O[a]);
					O = null
				} catch (a) { }
			}(), m(M, function (a, b) {
				b.autopv && P.push([a + "._trackPageview"]), b.autouid && P.push([a + "._trackUserId"])
			}), o("mousedown", j),
			function () {
				var a = function (b) {
					P.push(["_trackEvent", "first-touch"]), p("touchstart", a)
				};
				o("touchstart", a)
			}(), a.__rl_click && o("click", i)
	}
}(window, document, location, encodeURIComponent, decodeURIComponent);