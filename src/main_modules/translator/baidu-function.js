function e(t, e) {
    (null == e || e > t.length) && (e = t.length);
    for (var n = 0, r = new Array(e); n < e; n++) r[n] = t[n];
    return r;
}

function n(t, e) {
    for (var n = 0; n < e.length - 2; n += 3) {
        var r = e.charAt(n + 2);
        (r = 'a' <= r ? r.charCodeAt(0) - 87 : Number(r)),
            (r = '+' === e.charAt(n + 1) ? t >>> r : t << r),
            (t = '+' === e.charAt(n) ? (t + r) & 4294967295 : t ^ r);
    }
    return t;
}

//var r = null;

function getSign(t, r) {
    r = r || '320305.131321201';
    var o,
        i = t.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
    if (null === i) {
        var a = t.length;
        a > 30 &&
            (t = ''
                .concat(t.substr(0, 10))
                .concat(t.substr(Math.floor(a / 2) - 5, 10))
                .concat(t.substr(-10, 10)));
    } else {
        for (var s = t.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/), c = 0, u = s.length, l = []; c < u; c++)
            '' !== s[c] &&
                l.push.apply(
                    l,
                    (function (t) {
                        if (Array.isArray(t)) return e(t);
                    })((o = s[c].split(''))) ||
                        (function (t) {
                            if (('undefined' != typeof Symbol && null != t[Symbol.iterator]) || null != t['@@iterator'])
                                return Array.from(t);
                        })(o) ||
                        (function (t, n) {
                            if (t) {
                                if ('string' == typeof t) return e(t, n);
                                var r = Object.prototype.toString.call(t).slice(8, -1);
                                return (
                                    'Object' === r && t.constructor && (r = t.constructor.name),
                                    'Map' === r || 'Set' === r
                                        ? Array.from(t)
                                        : 'Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
                                        ? e(t, n)
                                        : void 0
                                );
                            }
                        })(o) ||
                        (function () {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                            );
                        })()
                ),
                c !== u - 1 && l.push(i[c]);
        var d = l.length;
        d > 30 &&
            (t =
                l.slice(0, 10).join('') +
                l.slice(Math.floor(d / 2) - 5, Math.floor(d / 2) + 5).join('') +
                l.slice(-10).join(''));
    }
    for (
        var p = ''.concat(String.fromCharCode(103)).concat(String.fromCharCode(116)).concat(String.fromCharCode(107)),
            f = (null !== r ? r : (r = window[p] || '') || '').split('.'),
            h = Number(f[0]) || 0,
            m = Number(f[1]) || 0,
            g = [],
            v = 0,
            y = 0;
        y < t.length;
        y++
    ) {
        var w = t.charCodeAt(y);
        w < 128
            ? (g[v++] = w)
            : (w < 2048
                  ? (g[v++] = (w >> 6) | 192)
                  : (55296 == (64512 & w) && y + 1 < t.length && 56320 == (64512 & t.charCodeAt(y + 1))
                        ? ((w = 65536 + ((1023 & w) << 10) + (1023 & t.charCodeAt(++y))),
                          (g[v++] = (w >> 18) | 240),
                          (g[v++] = ((w >> 12) & 63) | 128))
                        : (g[v++] = (w >> 12) | 224),
                    (g[v++] = ((w >> 6) & 63) | 128)),
              (g[v++] = (63 & w) | 128));
    }
    for (
        var b = h,
            x =
                ''.concat(String.fromCharCode(43)).concat(String.fromCharCode(45)).concat(String.fromCharCode(97)) +
                ''.concat(String.fromCharCode(94)).concat(String.fromCharCode(43)).concat(String.fromCharCode(54)),
            k =
                ''.concat(String.fromCharCode(43)).concat(String.fromCharCode(45)).concat(String.fromCharCode(51)) +
                ''.concat(String.fromCharCode(94)).concat(String.fromCharCode(43)).concat(String.fromCharCode(98)) +
                ''.concat(String.fromCharCode(43)).concat(String.fromCharCode(45)).concat(String.fromCharCode(102)),
            _ = 0;
        _ < g.length;
        _++
    )
        b = n((b += g[_]), x);
    return (
        (b = n(b, k)),
        (b ^= m) < 0 && (b = 2147483648 + (2147483647 & b)),
        ''.concat((b %= 1e6).toString(), '.').concat(b ^ h)
    );
}

// module exports
module.exports = { getSign };
