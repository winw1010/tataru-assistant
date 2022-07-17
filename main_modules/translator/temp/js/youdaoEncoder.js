function q(a, b) {
    var c = new Date;
    c.setTime(c.getTime() + 63072e6);
    return a + "=" + b + ";expires=" + c.toGMTString() + ";path=/;domain=" + v();
}

function r(a, b) {
    for (var c = a + "=", d = b.length, e = 0; e < d;) {
        var f = e + c.length;
        if (b.substring(e, f) == c) {
            var g = b.indexOf(";", f);
            return -1 == g && (g = d), unescape(b.substring(f, g))
        }
        if (0 == (e = b.indexOf(" ", e) + 1)) break
    }
    return -1
}

function v(a) {
    var d = a ? 4 : 3,
        e = "res:" === location.protocol ? "" : document.domain,
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

function ncoo() {
    return q("OUTFOX_SEARCH_USER_ID_NCOO", 2147483647 * Math.random());
}

exports.rFunction = r;
exports.ncooEncoder = ncoo;