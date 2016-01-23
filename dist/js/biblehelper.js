
/*! Bible Helper v1.0.29 | (c) 2014-2016 Greg Tam  */
//
// Generated on Thu Apr 23 2015 17:03:09 GMT-0700 (PDT) by Charlie Robbins, Paolo Fragomeni & the Contributors (Using Codesurgeon).
// Version 1.2.8
//
(function(a) {
    /*
 * browser.js: Browser specific functionality for director.
 *
 * (C) 2011, Charlie Robbins, Paolo Fragomeni, & the Contributors.
 * MIT LICENSE
 *
 */
    var b = document.location;
    function c() {
        // Non-IE browsers return '' when the address bar shows '#'; Director's logic
        // assumes both mean empty.
        return b.hash === "" || b.hash === "#";
    }
    var d = {
        mode: "modern",
        hash: b.hash,
        history: false,
        check: function() {
            var a = b.hash;
            if (a != this.hash) {
                this.hash = a;
                this.onHashChanged();
            }
        },
        fire: function() {
            if (this.mode === "modern") {
                this.history === true ? window.onpopstate() : window.onhashchange();
            } else {
                this.onHashChanged();
            }
        },
        init: function(a, b) {
            var c = this;
            this.history = b;
            if (!e.listeners) {
                e.listeners = [];
            }
            function d(a) {
                for (var b = 0, c = e.listeners.length; b < c; b++) {
                    e.listeners[b](a);
                }
            }
            //note IE8 is being counted as 'modern' because it has the hashchange event
            if ("onhashchange" in window && (document.documentMode === undefined || document.documentMode > 7)) {
                // At least for now HTML5 history is available for 'modern' browsers only
                if (this.history === true) {
                    // There is an old bug in Chrome that causes onpopstate to fire even
                    // upon initial page load. Since the handler is run manually in init(),
                    // this would cause Chrome to run it twise. Currently the only
                    // workaround seems to be to set the handler after the initial page load
                    // http://code.google.com/p/chromium/issues/detail?id=63040
                    setTimeout(function() {
                        window.onpopstate = d;
                    }, 500);
                } else {
                    window.onhashchange = d;
                }
                this.mode = "modern";
            } else {
                //
                // IE support, based on a concept by Erik Arvidson ...
                //
                var f = document.createElement("iframe");
                f.id = "state-frame";
                f.style.display = "none";
                document.body.appendChild(f);
                this.writeFrame("");
                if ("onpropertychange" in document && "attachEvent" in document) {
                    document.attachEvent("onpropertychange", function() {
                        if (event.propertyName === "location") {
                            c.check();
                        }
                    });
                }
                window.setInterval(function() {
                    c.check();
                }, 50);
                this.onHashChanged = d;
                this.mode = "legacy";
            }
            e.listeners.push(a);
            return this.mode;
        },
        destroy: function(a) {
            if (!e || !e.listeners) {
                return;
            }
            var b = e.listeners;
            for (var c = b.length - 1; c >= 0; c--) {
                if (b[c] === a) {
                    b.splice(c, 1);
                }
            }
        },
        setHash: function(a) {
            // Mozilla always adds an entry to the history
            if (this.mode === "legacy") {
                this.writeFrame(a);
            }
            if (this.history === true) {
                window.history.pushState({}, document.title, a);
                // Fire an onpopstate event manually since pushing does not obviously
                // trigger the pop event.
                this.fire();
            } else {
                b.hash = a[0] === "/" ? a : "/" + a;
            }
            return this;
        },
        writeFrame: function(a) {
            // IE support...
            var b = document.getElementById("state-frame");
            var c = b.contentDocument || b.contentWindow.document;
            c.open();
            c.write("<script>_hash = '" + a + "'; onload = parent.listener.syncHash;<script>");
            c.close();
        },
        syncHash: function() {
            // IE support...
            var a = this._hash;
            if (a != b.hash) {
                b.hash = a;
            }
            return this;
        },
        onHashChanged: function() {}
    };
    var e = a.Router = function(a) {
        if (!(this instanceof e)) return new e(a);
        this.params = {};
        this.routes = {};
        this.methods = [ "on", "once", "after", "before" ];
        this.scope = [];
        this._methods = {};
        this._insert = this.insert;
        this.insert = this.insertEx;
        this.historySupport = (window.history != null ? window.history.pushState : null) != null;
        this.configure();
        this.mount(a || {});
    };
    e.prototype.init = function(a) {
        var e = this, f;
        this.handler = function(a) {
            var b = a && a.newURL || window.location.hash;
            var c = e.history === true ? e.getPath() : b.replace(/.*#/, "");
            e.dispatch("on", c.charAt(0) === "/" ? c : "/" + c);
        };
        d.init(this.handler, this.history);
        if (this.history === false) {
            if (c() && a) {
                b.hash = a;
            } else if (!c()) {
                e.dispatch("on", "/" + b.hash.replace(/^(#\/|#|\/)/, ""));
            }
        } else {
            if (this.convert_hash_in_init) {
                // Use hash as route
                f = c() && a ? a : !c() ? b.hash.replace(/^#/, "") : null;
                if (f) {
                    window.history.replaceState({}, document.title, f);
                }
            } else {
                // Use canonical url
                f = this.getPath();
            }
            // Router has been initialized, but due to the chrome bug it will not
            // yet actually route HTML5 history state changes. Thus, decide if should route.
            if (f || this.run_in_init === true) {
                this.handler();
            }
        }
        return this;
    };
    e.prototype.explode = function() {
        var a = this.history === true ? this.getPath() : b.hash;
        if (a.charAt(1) === "/") {
            a = a.slice(1);
        }
        return a.slice(1, a.length).split("/");
    };
    e.prototype.setRoute = function(a, b, c) {
        var e = this.explode();
        if (typeof a === "number" && typeof b === "string") {
            e[a] = b;
        } else if (typeof c === "string") {
            e.splice(a, b, s);
        } else {
            e = [ a ];
        }
        d.setHash(e.join("/"));
        return e;
    };
    //
    // ### function insertEx(method, path, route, parent)
    // #### @method {string} Method to insert the specific `route`.
    // #### @path {Array} Parsed path to insert the `route` at.
    // #### @route {Array|function} Route handlers to insert.
    // #### @parent {Object} **Optional** Parent "routes" to insert into.
    // insert a callback that will only occur once per the matched route.
    //
    e.prototype.insertEx = function(a, b, c, d) {
        if (a === "once") {
            a = "on";
            c = function(a) {
                var b = false;
                return function() {
                    if (b) return;
                    b = true;
                    return a.apply(this, arguments);
                };
            }(c);
        }
        return this._insert(a, b, c, d);
    };
    e.prototype.getRoute = function(a) {
        var b = a;
        if (typeof a === "number") {
            b = this.explode()[a];
        } else if (typeof a === "string") {
            var c = this.explode();
            b = c.indexOf(a);
        } else {
            b = this.explode();
        }
        return b;
    };
    e.prototype.destroy = function() {
        d.destroy(this.handler);
        return this;
    };
    e.prototype.getPath = function() {
        var a = window.location.pathname;
        if (a.substr(0, 1) !== "/") {
            a = "/" + a;
        }
        return a;
    };
    function f(a, b) {
        for (var c = 0; c < a.length; c += 1) {
            if (b(a[c], c, a) === false) {
                return;
            }
        }
    }
    function g(a) {
        var b = [];
        for (var c = 0, d = a.length; c < d; c++) {
            b = b.concat(a[c]);
        }
        return b;
    }
    function h(a, b, c) {
        if (!a.length) {
            return c();
        }
        var d = 0;
        (function e() {
            b(a[d], function(b) {
                if (b || b === false) {
                    c(b);
                    c = function() {};
                } else {
                    d += 1;
                    if (d === a.length) {
                        c();
                    } else {
                        e();
                    }
                }
            });
        })();
    }
    function i(a, b, c) {
        c = a;
        for (var d in b) {
            if (b.hasOwnProperty(d)) {
                c = b[d](a);
                if (c !== a) {
                    break;
                }
            }
        }
        return c === a ? "([._a-zA-Z0-9-%()]+)" : c;
    }
    function j(a, b) {
        var c, d = 0, e = "";
        while (c = a.substr(d).match(/[^\w\d\- %@&]*\*[^\w\d\- %@&]*/)) {
            d = c.index + c[0].length;
            c[0] = c[0].replace(/^\*/, "([_.()!\\ %@&a-zA-Z0-9-]+)");
            e += a.substr(0, c.index) + c[0];
        }
        a = e += a.substr(d);
        var f = a.match(/:([^\/]+)/gi), g, h;
        if (f) {
            h = f.length;
            for (var j = 0; j < h; j++) {
                g = f[j];
                if (g.slice(0, 2) === "::") {
                    a = g.slice(1);
                } else {
                    a = a.replace(g, i(g, b));
                }
            }
        }
        return a;
    }
    function k(a, b, c, d) {
        var e = 0, f = 0, g = 0, c = (c || "(").toString(), d = (d || ")").toString(), h;
        for (h = 0; h < a.length; h++) {
            var i = a[h];
            if (i.indexOf(c, e) > i.indexOf(d, e) || ~i.indexOf(c, e) && !~i.indexOf(d, e) || !~i.indexOf(c, e) && ~i.indexOf(d, e)) {
                f = i.indexOf(c, e);
                g = i.indexOf(d, e);
                if (~f && !~g || !~f && ~g) {
                    var j = a.slice(0, (h || 1) + 1).join(b);
                    a = [ j ].concat(a.slice((h || 1) + 1));
                }
                e = (g > f ? g : f) + 1;
                h = 0;
            } else {
                e = 0;
            }
        }
        return a;
    }
    var l = /\?.*/;
    e.prototype.configure = function(a) {
        a = a || {};
        for (var b = 0; b < this.methods.length; b++) {
            this._methods[this.methods[b]] = true;
        }
        this.recurse = typeof a.recurse === "undefined" ? this.recurse || false : a.recurse;
        this.async = a.async || false;
        this.delimiter = a.delimiter || "/";
        this.strict = typeof a.strict === "undefined" ? true : a.strict;
        this.notfound = a.notfound;
        this.resource = a.resource;
        this.history = a.html5history && this.historySupport || false;
        this.run_in_init = this.history === true && a.run_handler_in_init !== false;
        this.convert_hash_in_init = this.history === true && a.convert_hash_in_init !== false;
        this.every = {
            after: a.after || null,
            before: a.before || null,
            on: a.on || null
        };
        return this;
    };
    e.prototype.param = function(a, b) {
        if (a[0] !== ":") {
            a = ":" + a;
        }
        var c = new RegExp(a, "g");
        this.params[a] = function(a) {
            return a.replace(c, b.source || b);
        };
        return this;
    };
    e.prototype.on = e.prototype.route = function(a, b, c) {
        var d = this;
        if (!c && typeof b == "function") {
            c = b;
            b = a;
            a = "on";
        }
        if (Array.isArray(b)) {
            return b.forEach(function(b) {
                d.on(a, b, c);
            });
        }
        if (b.source) {
            b = b.source.replace(/\\\//gi, "/");
        }
        if (Array.isArray(a)) {
            return a.forEach(function(a) {
                d.on(a.toLowerCase(), b, c);
            });
        }
        b = b.split(new RegExp(this.delimiter));
        b = k(b, this.delimiter);
        this.insert(a, this.scope.concat(b), c);
    };
    e.prototype.path = function(a, b) {
        var c = this, d = this.scope.length;
        if (a.source) {
            a = a.source.replace(/\\\//gi, "/");
        }
        a = a.split(new RegExp(this.delimiter));
        a = k(a, this.delimiter);
        this.scope = this.scope.concat(a);
        b.call(this, this);
        this.scope.splice(d, a.length);
    };
    e.prototype.dispatch = function(a, b, c) {
        var d = this, e = this.traverse(a, b.replace(l, ""), this.routes, ""), f = this._invoked, g;
        this._invoked = true;
        if (!e || e.length === 0) {
            this.last = [];
            if (typeof this.notfound === "function") {
                this.invoke([ this.notfound ], {
                    method: a,
                    path: b
                }, c);
            }
            return false;
        }
        if (this.recurse === "forward") {
            e = e.reverse();
        }
        function h() {
            d.last = e.after;
            d.invoke(d.runlist(e), d, c);
        }
        g = this.every && this.every.after ? [ this.every.after ].concat(this.last) : [ this.last ];
        if (g && g.length > 0 && f) {
            if (this.async) {
                this.invoke(g, this, h);
            } else {
                this.invoke(g, this);
                h();
            }
            return true;
        }
        h();
        return true;
    };
    e.prototype.invoke = function(a, b, c) {
        var d = this;
        var e;
        if (this.async) {
            e = function(c, d) {
                if (Array.isArray(c)) {
                    return h(c, e, d);
                } else if (typeof c == "function") {
                    c.apply(b, (a.captures || []).concat(d));
                }
            };
            h(a, e, function() {
                if (c) {
                    c.apply(b, arguments);
                }
            });
        } else {
            e = function(c) {
                if (Array.isArray(c)) {
                    return f(c, e);
                } else if (typeof c === "function") {
                    return c.apply(b, a.captures || []);
                } else if (typeof c === "string" && d.resource) {
                    d.resource[c].apply(b, a.captures || []);
                }
            };
            f(a, e);
        }
    };
    e.prototype.traverse = function(a, b, c, d, e) {
        var f = [], g, h, i, j, k;
        function l(a) {
            if (!e) {
                return a;
            }
            function b(a) {
                var c = [];
                for (var d = 0; d < a.length; d++) {
                    c[d] = Array.isArray(a[d]) ? b(a[d]) : a[d];
                }
                return c;
            }
            function c(a) {
                for (var b = a.length - 1; b >= 0; b--) {
                    if (Array.isArray(a[b])) {
                        c(a[b]);
                        if (a[b].length === 0) {
                            a.splice(b, 1);
                        }
                    } else {
                        if (!e(a[b])) {
                            a.splice(b, 1);
                        }
                    }
                }
            }
            var d = b(a);
            d.matched = a.matched;
            d.captures = a.captures;
            d.after = a.after.filter(e);
            c(d);
            return d;
        }
        if (b === this.delimiter && c[a]) {
            j = [ [ c.before, c[a] ].filter(Boolean) ];
            j.after = [ c.after ].filter(Boolean);
            j.matched = true;
            j.captures = [];
            return l(j);
        }
        for (var m in c) {
            if (c.hasOwnProperty(m) && (!this._methods[m] || this._methods[m] && typeof c[m] === "object" && !Array.isArray(c[m]))) {
                g = h = d + this.delimiter + m;
                if (!this.strict) {
                    h += "[" + this.delimiter + "]?";
                }
                i = b.match(new RegExp("^" + h));
                if (!i) {
                    continue;
                }
                if (i[0] && i[0] == b && c[m][a]) {
                    j = [ [ c[m].before, c[m][a] ].filter(Boolean) ];
                    j.after = [ c[m].after ].filter(Boolean);
                    j.matched = true;
                    j.captures = i.slice(1);
                    if (this.recurse && c === this.routes) {
                        j.push([ c.before, c.on ].filter(Boolean));
                        j.after = j.after.concat([ c.after ].filter(Boolean));
                    }
                    return l(j);
                }
                j = this.traverse(a, b, c[m], g);
                if (j.matched) {
                    if (j.length > 0) {
                        f = f.concat(j);
                    }
                    if (this.recurse) {
                        f.push([ c[m].before, c[m][a] ].filter(Boolean));
                        j.after = j.after.concat([ c[m].after ].filter(Boolean));
                        if (c === this.routes) {
                            f.push([ c["before"], c["on"] ].filter(Boolean));
                            j.after = j.after.concat([ c["after"] ].filter(Boolean));
                        }
                    }
                    f.matched = true;
                    f.captures = j.captures;
                    f.after = j.after;
                    return l(f);
                }
            }
        }
        return false;
    };
    e.prototype.insert = function(a, b, c, d) {
        var e, f, g, h, i;
        b = b.filter(function(a) {
            return a && a.length > 0;
        });
        d = d || this.routes;
        i = b.shift();
        if (/\:|\*/.test(i) && !/\\d|\\w/.test(i)) {
            i = j(i, this.params);
        }
        if (b.length > 0) {
            d[i] = d[i] || {};
            return this.insert(a, b, c, d[i]);
        }
        if (!i && !b.length && d === this.routes) {
            e = typeof d[a];
            switch (e) {
              case "function":
                d[a] = [ d[a], c ];
                return;

              case "object":
                d[a].push(c);
                return;

              case "undefined":
                d[a] = c;
                return;
            }
            return;
        }
        f = typeof d[i];
        g = Array.isArray(d[i]);
        if (d[i] && !g && f == "object") {
            e = typeof d[i][a];
            switch (e) {
              case "function":
                d[i][a] = [ d[i][a], c ];
                return;

              case "object":
                d[i][a].push(c);
                return;

              case "undefined":
                d[i][a] = c;
                return;
            }
        } else if (f == "undefined") {
            h = {};
            h[a] = c;
            d[i] = h;
            return;
        }
        throw new Error("Invalid route context: " + f);
    };
    e.prototype.extend = function(a) {
        var b = this, c = a.length, d;
        function e(a) {
            b._methods[a] = true;
            b[a] = function() {
                var c = arguments.length === 1 ? [ a, "" ] : [ a ];
                b.on.apply(b, c.concat(Array.prototype.slice.call(arguments)));
            };
        }
        for (d = 0; d < c; d++) {
            e(a[d]);
        }
    };
    e.prototype.runlist = function(a) {
        var b = this.every && this.every.before ? [ this.every.before ].concat(g(a)) : g(a);
        if (this.every && this.every.on) {
            b.push(this.every.on);
        }
        b.captures = a.captures;
        b.source = a.source;
        return b;
    };
    e.prototype.mount = function(a, b) {
        if (!a || typeof a !== "object" || Array.isArray(a)) {
            return;
        }
        var c = this;
        b = b || [];
        if (!Array.isArray(b)) {
            b = b.split(c.delimiter);
        }
        function d(b, d) {
            var e = b, f = b.split(c.delimiter), g = typeof a[b], h = f[0] === "" || !c._methods[f[0]], i = h ? "on" : e;
            if (h) {
                e = e.slice((e.match(new RegExp("^" + c.delimiter)) || [ "" ])[0].length);
                f.shift();
            }
            if (h && g === "object" && !Array.isArray(a[b])) {
                d = d.concat(f);
                c.mount(a[b], d);
                return;
            }
            if (h) {
                d = d.concat(e.split(c.delimiter));
                d = k(d, c.delimiter);
            }
            c.insert(i, d, a[b]);
        }
        for (var e in a) {
            if (a.hasOwnProperty(e)) {
                d(e, b.slice(0));
            }
        }
    };
})(typeof exports === "object" ? exports : window);

/* jshint ignore:start */
(function() {
    var a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W = [].slice, X = {}.hasOwnProperty, Y = function(a, b) {
        for (var c in b) {
            if (X.call(b, c)) a[c] = b[c];
        }
        function d() {
            this.constructor = a;
        }
        d.prototype = b.prototype;
        a.prototype = new d();
        a.__super__ = b.prototype;
        return a;
    }, Z = [].indexOf || function(a) {
        for (var b = 0, c = this.length; b < c; b++) {
            if (b in this && this[b] === a) return b;
        }
        return -1;
    };
    t = {
        catchupTime: 500,
        initialRate: .03,
        minTime: 500,
        ghostTime: 500,
        maxProgressPerFrame: 10,
        easeFactor: 1.25,
        startOnPageLoad: true,
        restartOnPushState: true,
        restartOnRequestAfter: false,
        target: "body",
        elements: false,
        eventLag: {
            minSamples: 10,
            sampleCount: 3,
            lagThreshold: 3
        },
        ajax: {
            trackMethods: [ "GET" ],
            trackWebSockets: true,
            ignoreURLs: []
        }
    };
    B = function() {
        var a;
        return (a = typeof performance !== "undefined" && performance !== null ? typeof performance.now === "function" ? performance.now() : void 0 : void 0) != null ? a : +new Date();
    };
    D = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    s = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
    if (D == null) {
        D = function(a) {
            return setTimeout(a, 50);
        };
        s = function(a) {
            return clearTimeout(a);
        };
    }
    F = function(a) {
        var b, c;
        b = B();
        c = function() {
            var d;
            d = B() - b;
            if (d >= 33) {
                b = B();
                return a(d, function() {
                    return D(c);
                });
            } else {
                return setTimeout(c, 33 - d);
            }
        };
        return c();
    };
    E = function() {
        var a, b, c;
        c = arguments[0], b = arguments[1], a = 3 <= arguments.length ? W.call(arguments, 2) : [];
        if (typeof c[b] === "function") {
            return c[b].apply(c, a);
        } else {
            return c[b];
        }
    };
    u = function() {
        var a, b, c, d, e, f, g;
        b = arguments[0], d = 2 <= arguments.length ? W.call(arguments, 1) : [];
        for (f = 0, g = d.length; f < g; f++) {
            c = d[f];
            if (c) {
                for (a in c) {
                    if (!X.call(c, a)) continue;
                    e = c[a];
                    if (b[a] != null && typeof b[a] === "object" && e != null && typeof e === "object") {
                        u(b[a], e);
                    } else {
                        b[a] = e;
                    }
                }
            }
        }
        return b;
    };
    p = function(a) {
        var b, c, d, e, f;
        c = b = 0;
        for (e = 0, f = a.length; e < f; e++) {
            d = a[e];
            c += Math.abs(d);
            b++;
        }
        return c / b;
    };
    w = function(a, b) {
        var c, d, e;
        if (a == null) {
            a = "options";
        }
        if (b == null) {
            b = true;
        }
        e = document.querySelector("[data-pace-" + a + "]");
        if (!e) {
            return;
        }
        c = e.getAttribute("data-pace-" + a);
        if (!b) {
            return c;
        }
        try {
            return JSON.parse(c);
        } catch (f) {
            d = f;
            return typeof console !== "undefined" && console !== null ? console.error("Error parsing inline pace options", d) : void 0;
        }
    };
    g = function() {
        function a() {}
        a.prototype.on = function(a, b, c, d) {
            var e;
            if (d == null) {
                d = false;
            }
            if (this.bindings == null) {
                this.bindings = {};
            }
            if ((e = this.bindings)[a] == null) {
                e[a] = [];
            }
            return this.bindings[a].push({
                handler: b,
                ctx: c,
                once: d
            });
        };
        a.prototype.once = function(a, b, c) {
            return this.on(a, b, c, true);
        };
        a.prototype.off = function(a, b) {
            var c, d, e;
            if (((d = this.bindings) != null ? d[a] : void 0) == null) {
                return;
            }
            if (b == null) {
                return delete this.bindings[a];
            } else {
                c = 0;
                e = [];
                while (c < this.bindings[a].length) {
                    if (this.bindings[a][c].handler === b) {
                        e.push(this.bindings[a].splice(c, 1));
                    } else {
                        e.push(c++);
                    }
                }
                return e;
            }
        };
        a.prototype.trigger = function() {
            var a, b, c, d, e, f, g, h, i;
            c = arguments[0], a = 2 <= arguments.length ? W.call(arguments, 1) : [];
            if ((g = this.bindings) != null ? g[c] : void 0) {
                e = 0;
                i = [];
                while (e < this.bindings[c].length) {
                    h = this.bindings[c][e], d = h.handler, b = h.ctx, f = h.once;
                    d.apply(b != null ? b : this, a);
                    if (f) {
                        i.push(this.bindings[c].splice(e, 1));
                    } else {
                        i.push(e++);
                    }
                }
                return i;
            }
        };
        return a;
    }();
    if (window.Pace == null) {
        window.Pace = {};
    }
    u(Pace, g.prototype);
    C = Pace.options = u({}, t, window.paceOptions, w());
    T = [ "ajax", "document", "eventLag", "elements" ];
    for (P = 0, R = T.length; P < R; P++) {
        J = T[P];
        if (C[J] === true) {
            C[J] = t[J];
        }
    }
    i = function(a) {
        Y(b, a);
        function b() {
            U = b.__super__.constructor.apply(this, arguments);
            return U;
        }
        return b;
    }(Error);
    b = function() {
        function a() {
            this.progress = 0;
        }
        a.prototype.getElement = function() {
            var a;
            if (this.el == null) {
                a = document.querySelector(C.target);
                if (!a) {
                    throw new i();
                }
                this.el = document.createElement("div");
                this.el.className = "pace pace-active";
                document.body.className = document.body.className.replace(/pace-done/g, "");
                document.body.className += " pace-running";
                this.el.innerHTML = '<div class="pace-progress">\n  <div class="pace-progress-inner"></div>\n</div>\n<div class="pace-activity"></div>';
                if (a.firstChild != null) {
                    a.insertBefore(this.el, a.firstChild);
                } else {
                    a.appendChild(this.el);
                }
            }
            return this.el;
        };
        a.prototype.finish = function() {
            var a;
            a = this.getElement();
            a.className = a.className.replace("pace-active", "");
            a.className += " pace-inactive";
            document.body.className = document.body.className.replace("pace-running", "");
            return document.body.className += " pace-done";
        };
        a.prototype.update = function(a) {
            this.progress = a;
            return this.render();
        };
        a.prototype.destroy = function() {
            try {
                this.getElement().parentNode.removeChild(this.getElement());
            } catch (a) {
                i = a;
            }
            return this.el = void 0;
        };
        a.prototype.render = function() {
            var a, b;
            if (document.querySelector(C.target) == null) {
                return false;
            }
            a = this.getElement();
            a.children[0].style.width = "" + this.progress + "%";
            if (!this.lastRenderedProgress || this.lastRenderedProgress | 0 !== this.progress | 0) {
                a.children[0].setAttribute("data-progress-text", "" + (this.progress | 0) + "%");
                if (this.progress >= 100) {
                    b = "99";
                } else {
                    b = this.progress < 10 ? "0" : "";
                    b += this.progress | 0;
                }
                a.children[0].setAttribute("data-progress", "" + b);
            }
            return this.lastRenderedProgress = this.progress;
        };
        a.prototype.done = function() {
            return this.progress >= 100;
        };
        return a;
    }();
    h = function() {
        function a() {
            this.bindings = {};
        }
        a.prototype.trigger = function(a, b) {
            var c, d, e, f, g;
            if (this.bindings[a] != null) {
                f = this.bindings[a];
                g = [];
                for (d = 0, e = f.length; d < e; d++) {
                    c = f[d];
                    g.push(c.call(this, b));
                }
                return g;
            }
        };
        a.prototype.on = function(a, b) {
            var c;
            if ((c = this.bindings)[a] == null) {
                c[a] = [];
            }
            return this.bindings[a].push(b);
        };
        return a;
    }();
    O = window.XMLHttpRequest;
    N = window.XDomainRequest;
    M = window.WebSocket;
    v = function(a, b) {
        var c, d, e, f;
        f = [];
        for (d in b.prototype) {
            try {
                e = b.prototype[d];
                if (a[d] == null && typeof e !== "function") {
                    f.push(a[d] = e);
                } else {
                    f.push(void 0);
                }
            } catch (g) {
                c = g;
            }
        }
        return f;
    };
    z = [];
    Pace.ignore = function() {
        var a, b, c;
        b = arguments[0], a = 2 <= arguments.length ? W.call(arguments, 1) : [];
        z.unshift("ignore");
        c = b.apply(null, a);
        z.shift();
        return c;
    };
    Pace.track = function() {
        var a, b, c;
        b = arguments[0], a = 2 <= arguments.length ? W.call(arguments, 1) : [];
        z.unshift("track");
        c = b.apply(null, a);
        z.shift();
        return c;
    };
    I = function(a) {
        var b;
        if (a == null) {
            a = "GET";
        }
        if (z[0] === "track") {
            return "force";
        }
        if (!z.length && C.ajax) {
            if (a === "socket" && C.ajax.trackWebSockets) {
                return true;
            } else if (b = a.toUpperCase(), Z.call(C.ajax.trackMethods, b) >= 0) {
                return true;
            }
        }
        return false;
    };
    j = function(a) {
        Y(b, a);
        function b() {
            var a, c = this;
            b.__super__.constructor.apply(this, arguments);
            a = function(a) {
                var b;
                b = a.open;
                return a.open = function(d, e, f) {
                    if (I(d)) {
                        c.trigger("request", {
                            type: d,
                            url: e,
                            request: a
                        });
                    }
                    return b.apply(a, arguments);
                };
            };
            window.XMLHttpRequest = function(b) {
                var c;
                c = new O(b);
                a(c);
                return c;
            };
            v(window.XMLHttpRequest, O);
            if (N != null) {
                window.XDomainRequest = function() {
                    var b;
                    b = new N();
                    a(b);
                    return b;
                };
                v(window.XDomainRequest, N);
            }
            if (M != null && C.ajax.trackWebSockets) {
                window.WebSocket = function(a, b) {
                    var d;
                    if (b != null) {
                        d = new M(a, b);
                    } else {
                        d = new M(a);
                    }
                    if (I("socket")) {
                        c.trigger("request", {
                            type: "socket",
                            url: a,
                            protocols: b,
                            request: d
                        });
                    }
                    return d;
                };
                v(window.WebSocket, M);
            }
        }
        return b;
    }(h);
    Q = null;
    x = function() {
        if (Q == null) {
            Q = new j();
        }
        return Q;
    };
    H = function(a) {
        var b, c, d, e;
        e = C.ajax.ignoreURLs;
        for (c = 0, d = e.length; c < d; c++) {
            b = e[c];
            if (typeof b === "string") {
                if (a.indexOf(b) !== -1) {
                    return true;
                }
            } else {
                if (b.test(a)) {
                    return true;
                }
            }
        }
        return false;
    };
    x().on("request", function(b) {
        var c, d, e, f, g;
        f = b.type, e = b.request, g = b.url;
        if (H(g)) {
            return;
        }
        if (!Pace.running && (C.restartOnRequestAfter !== false || I(f) === "force")) {
            d = arguments;
            c = C.restartOnRequestAfter || 0;
            if (typeof c === "boolean") {
                c = 0;
            }
            return setTimeout(function() {
                var b, c, g, h, i, j;
                if (f === "socket") {
                    b = e.readyState < 2;
                } else {
                    b = 0 < (h = e.readyState) && h < 4;
                }
                if (b) {
                    Pace.restart();
                    i = Pace.sources;
                    j = [];
                    for (c = 0, g = i.length; c < g; c++) {
                        J = i[c];
                        if (J instanceof a) {
                            J.watch.apply(J, d);
                            break;
                        } else {
                            j.push(void 0);
                        }
                    }
                    return j;
                }
            }, c);
        }
    });
    a = function() {
        function a() {
            var a = this;
            this.elements = [];
            x().on("request", function() {
                return a.watch.apply(a, arguments);
            });
        }
        a.prototype.watch = function(a) {
            var b, c, d, e;
            d = a.type, b = a.request, e = a.url;
            if (H(e)) {
                return;
            }
            if (d === "socket") {
                c = new m(b);
            } else {
                c = new n(b);
            }
            return this.elements.push(c);
        };
        return a;
    }();
    n = function() {
        function a(a) {
            var b, c, d, e, f, g, h = this;
            this.progress = 0;
            if (window.ProgressEvent != null) {
                c = null;
                a.addEventListener("progress", function(a) {
                    if (a.lengthComputable) {
                        return h.progress = 100 * a.loaded / a.total;
                    } else {
                        return h.progress = h.progress + (100 - h.progress) / 2;
                    }
                });
                g = [ "load", "abort", "timeout", "error" ];
                for (d = 0, e = g.length; d < e; d++) {
                    b = g[d];
                    a.addEventListener(b, function() {
                        return h.progress = 100;
                    });
                }
            } else {
                f = a.onreadystatechange;
                a.onreadystatechange = function() {
                    var b;
                    if ((b = a.readyState) === 0 || b === 4) {
                        h.progress = 100;
                    } else if (a.readyState === 3) {
                        h.progress = 50;
                    }
                    return typeof f === "function" ? f.apply(null, arguments) : void 0;
                };
            }
        }
        return a;
    }();
    m = function() {
        function a(a) {
            var b, c, d, e, f = this;
            this.progress = 0;
            e = [ "error", "open" ];
            for (c = 0, d = e.length; c < d; c++) {
                b = e[c];
                a.addEventListener(b, function() {
                    return f.progress = 100;
                });
            }
        }
        return a;
    }();
    d = function() {
        function a(a) {
            var b, c, d, f;
            if (a == null) {
                a = {};
            }
            this.elements = [];
            if (a.selectors == null) {
                a.selectors = [];
            }
            f = a.selectors;
            for (c = 0, d = f.length; c < d; c++) {
                b = f[c];
                this.elements.push(new e(b));
            }
        }
        return a;
    }();
    e = function() {
        function a(a) {
            this.selector = a;
            this.progress = 0;
            this.check();
        }
        a.prototype.check = function() {
            var a = this;
            if (document.querySelector(this.selector)) {
                return this.done();
            } else {
                return setTimeout(function() {
                    return a.check();
                }, C.elements.checkInterval);
            }
        };
        a.prototype.done = function() {
            return this.progress = 100;
        };
        return a;
    }();
    c = function() {
        a.prototype.states = {
            loading: 0,
            interactive: 50,
            complete: 100
        };
        function a() {
            var a, b, c = this;
            this.progress = (b = this.states[document.readyState]) != null ? b : 100;
            a = document.onreadystatechange;
            document.onreadystatechange = function() {
                if (c.states[document.readyState] != null) {
                    c.progress = c.states[document.readyState];
                }
                return typeof a === "function" ? a.apply(null, arguments) : void 0;
            };
        }
        return a;
    }();
    f = function() {
        function a() {
            var a, b, c, d, e, f = this;
            this.progress = 0;
            a = 0;
            e = [];
            d = 0;
            c = B();
            b = setInterval(function() {
                var g;
                g = B() - c - 50;
                c = B();
                e.push(g);
                if (e.length > C.eventLag.sampleCount) {
                    e.shift();
                }
                a = p(e);
                if (++d >= C.eventLag.minSamples && a < C.eventLag.lagThreshold) {
                    f.progress = 100;
                    return clearInterval(b);
                } else {
                    return f.progress = 100 * (3 / (a + 3));
                }
            }, 50);
        }
        return a;
    }();
    l = function() {
        function a(a) {
            this.source = a;
            this.last = this.sinceLastUpdate = 0;
            this.rate = C.initialRate;
            this.catchup = 0;
            this.progress = this.lastProgress = 0;
            if (this.source != null) {
                this.progress = E(this.source, "progress");
            }
        }
        a.prototype.tick = function(a, b) {
            var c;
            if (b == null) {
                b = E(this.source, "progress");
            }
            if (b >= 100) {
                this.done = true;
            }
            if (b === this.last) {
                this.sinceLastUpdate += a;
            } else {
                if (this.sinceLastUpdate) {
                    this.rate = (b - this.last) / this.sinceLastUpdate;
                }
                this.catchup = (b - this.progress) / C.catchupTime;
                this.sinceLastUpdate = 0;
                this.last = b;
            }
            if (b > this.progress) {
                this.progress += this.catchup * a;
            }
            c = 1 - Math.pow(this.progress / 100, C.easeFactor);
            this.progress += c * this.rate * a;
            this.progress = Math.min(this.lastProgress + C.maxProgressPerFrame, this.progress);
            this.progress = Math.max(0, this.progress);
            this.progress = Math.min(100, this.progress);
            this.lastProgress = this.progress;
            return this.progress;
        };
        return a;
    }();
    K = null;
    G = null;
    q = null;
    L = null;
    o = null;
    r = null;
    Pace.running = false;
    y = function() {
        if (C.restartOnPushState) {
            return Pace.restart();
        }
    };
    if (window.history.pushState != null) {
        S = window.history.pushState;
        window.history.pushState = function() {
            y();
            return S.apply(window.history, arguments);
        };
    }
    if (window.history.replaceState != null) {
        V = window.history.replaceState;
        window.history.replaceState = function() {
            y();
            return V.apply(window.history, arguments);
        };
    }
    k = {
        ajax: a,
        elements: d,
        document: c,
        eventLag: f
    };
    (A = function() {
        var a, c, d, e, f, g, h, i;
        Pace.sources = K = [];
        g = [ "ajax", "elements", "document", "eventLag" ];
        for (c = 0, e = g.length; c < e; c++) {
            a = g[c];
            if (C[a] !== false) {
                K.push(new k[a](C[a]));
            }
        }
        i = (h = C.extraSources) != null ? h : [];
        for (d = 0, f = i.length; d < f; d++) {
            J = i[d];
            K.push(new J(C));
        }
        Pace.bar = q = new b();
        G = [];
        return L = new l();
    })();
    Pace.stop = function() {
        Pace.trigger("stop");
        Pace.running = false;
        q.destroy();
        r = true;
        if (o != null) {
            if (typeof s === "function") {
                s(o);
            }
            o = null;
        }
        return A();
    };
    Pace.restart = function() {
        Pace.trigger("restart");
        Pace.stop();
        return Pace.start();
    };
    Pace.go = function() {
        var a;
        Pace.running = true;
        q.render();
        a = B();
        r = false;
        return o = F(function(b, c) {
            var d, e, f, g, h, i, j, k, m, n, o, p, s, t, u, v;
            k = 100 - q.progress;
            e = o = 0;
            f = true;
            for (i = p = 0, t = K.length; p < t; i = ++p) {
                J = K[i];
                n = G[i] != null ? G[i] : G[i] = [];
                h = (v = J.elements) != null ? v : [ J ];
                for (j = s = 0, u = h.length; s < u; j = ++s) {
                    g = h[j];
                    m = n[j] != null ? n[j] : n[j] = new l(g);
                    f &= m.done;
                    if (m.done) {
                        continue;
                    }
                    e++;
                    o += m.tick(b);
                }
            }
            d = o / e;
            q.update(L.tick(b, d));
            if (q.done() || f || r) {
                q.update(100);
                Pace.trigger("done");
                return setTimeout(function() {
                    q.finish();
                    Pace.running = false;
                    return Pace.trigger("hide");
                }, Math.max(C.ghostTime, Math.max(C.minTime - (B() - a), 0)));
            } else {
                return c();
            }
        });
    };
    Pace.start = function(a) {
        u(C, a);
        Pace.running = true;
        try {
            q.render();
        } catch (b) {
            i = b;
        }
        if (!document.querySelector(".pace")) {
            return setTimeout(Pace.start, 50);
        } else {
            Pace.trigger("start");
            return Pace.go();
        }
    };
    if (typeof define === "function" && define.amd) {
        define(function() {
            return Pace;
        });
    } else if (typeof exports === "object") {
        module.exports = Pace;
    } else {
        if (C.startOnPageLoad) {
            Pace.start();
        }
    }
}).call(this);

var __DEBUG = true;

/*global biblehelper, log, Router */
//---------------------------------------
//GOOGLE ANALYTICS
//---------------------------------------
/*jshint ignore:start */
(function(a, b, c, d, e, f, g) {
    a["GoogleAnalyticsObject"] = e;
    a[e] = a[e] || function() {
        (a[e].q = a[e].q || []).push(arguments);
    }, a[e].l = 1 * new Date();
    f = b.createElement(c), g = b.getElementsByTagName(c)[0];
    f.async = 1;
    f.src = d;
    g.parentNode.insertBefore(f, g);
})(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");

ga("create", "UA-15745482-3", "auto");

ga("send", "pageview");

var adjustBounceRate = setInterval(function() {
    ga("send", "event", "top", "top", "top");
}, 3e4);

setTimeout(function() {
    clearInterval(adjustBounceRate);
}, 18e5);

/*jshint ignore:end */
//---------------------------------------
// COMPATABILITY SCRIPTS
//---------------------------------------
//compatability scripts IE sucks
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(a, b) {
        for (var c = 0, d = this.length; c < d; ++c) {
            if (c in this) {
                a.call(b, this[c], c, this);
            }
        }
    };
}

//---------------------------------------
//create a bind() function for scope passing
Function.prototype.bind = Function.prototype.bind || function() {
    var a = this;
    var b = Array.prototype.slice.call(arguments);
    var c = b.shift();
    return function() {
        return a.apply(c, b.concat(Array.prototype.slice.call(arguments)));
    };
};

//---------------------------------------
Array.prototype.has = function(a) {
    return $.inArray(a, this) > -1;
};

//---------------------------------------
// omit values from array
// if 'a' is not specified, it is assumed all blank/null/undefined values
Array.prototype.omit = function(a) {
    var b = [];
    a = a || [ "", null, undefined ];
    a = $.isArray(a) ? a : [ a ];
    for (var c = 0; c < this.length; c++) {
        if (!a.has(this[c])) {
            b.push(this[c]);
        }
    }
    return b;
};

//---------------------------------------
Array.prototype.remove = function(a, b) {
    var c = this.slice((b || a) + 1 || this.length);
    this.length = a < 0 ? this.length + a : a;
    return this.push.apply(this, c);
};

//---------------------------------------
// format with commas
Number.prototype.format = function(a) {
    return this.toString().format(a);
};

//---------------------------------------
Number.prototype.valueIfZero = function(a) {
    var b = this.valueOf();
    return b === 0 ? a === undefined ? "" : a : b;
};

//---------------------------------------
// replace string placeholders with values
// 'this is a value of {1}'.apply(100) ===> 'this is a value of 100'
String.prototype.apply = function() {
    var a = arguments;
    return this.replace(/\{(\d+)\}/g, function(b, c) {
        return a[c - 1];
    });
};

//---------------------------------------
// split a string into equal (PARTS) sized chunks (on word boundaries)
// and join the chunks together with glue.
String.prototype.chop = function(a, b) {
    var c = this.split(" ");
    var d = Math.ceil(c.length / a || 1);
    var e = [];
    while (c.length) {
        e.push(c.splice(0, d).join(" "));
    }
    return e.join(b || "<br/>");
};

//---------------------------------------
// format with commas
String.prototype.format = function(a) {
    var b = this.split(".");
    // split on radix
    var c = /(\d+)(\d{3})/;
    var d = b[0];
    // integral portion
    while (c.test(d)) {
        d = d.replace(c, "$1,$2");
    }
    return (a ? d.replace(/,/g, ".") : d) + (b.length > 1 ? (a ? "," : ".") + b[1] : "");
};

//---------------------------------------
// test if the string is in the provided list
String.prototype.includes = function(a) {
    var b = this.toString();
    for (var c = 0; c < a.length; c++) {
        if (b === a[c]) {
            return true;
        }
    }
    return false;
};

//---------------------------------------
String.prototype.reverse = function() {
    return this.split("").reverse().join("");
};

//---------------------------------------
String.prototype.trim = function() {
    return $.trim(this);
};

//---------------------------------------
String.prototype.valueIfZero = function(a) {
    var b = this.toString();
    return b === "0" ? a === undefined ? "" : a : b;
};

//---------------------------------------
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(a, b) {
        if (this === undefined || this === null) {
            throw new TypeError('"this" is null or not defined');
        }
        var c = this.length >>> 0;
        // Hack to convert object.length to a UInt32
        b = +b || 0;
        if (Math.abs(b) === Infinity) {
            b = 0;
        }
        if (b < 0) {
            b += c;
            if (b < 0) {
                b = 0;
            }
        }
        for (;b < c; b++) {
            if (this[b] === a) {
                return b;
            }
        }
        return -1;
    };
}

//---------------------------------------
// Handle browsers that do console incorrectly (IE9 and below)
// http://stackoverflow.com/a/5539378/7913
if (window.console) {
    if (Function.prototype.bind && console && typeof console.log === "object") {
        [ "log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd" ].forEach(function(a) {
            console[a] = this.bind(console[a], console);
        }, Function.prototype.call);
    }
}

//---------------------------------------
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function() {
    log.history = log.history || [];
    // store logs to an array for reference
    log.history.push(arguments);
    if (this.console) {
        if (__DEBUG) {
            console.log(Array.prototype.slice.call(arguments));
        }
    }
};

//---------------------------------------
// CONSTANTS SCRIPTS
//---------------------------------------
(function() {
    var a = {};
    window.self.SETCONST = function(b, c) {
        if (typeof b !== "string") {
            throw new Error("constant name is not a string");
        }
        if (!c) {
            throw new Error(" no value supplied for constant " + b);
        } else if (b in a) {
            throw new Error("constant " + b + " is already defined");
        } else {
            a[b] = c;
            return true;
        }
    };
    window.self.CONST = function(b) {
        if (typeof b !== "string") {
            throw new Error("constant name is not a string");
        }
        if (b in a) {
            return a[b];
        } else {
            throw new Error("constant " + b + " has not been defined");
        }
    };
})();

//---------------------------------------
// GLOBAL UTIL FUNCTIONS
//---------------------------------------
function isNotNullOrEmpty(a) {
    if (typeof a !== "undefined") {
        if (a !== null && a !== undefined && a !== "") {
            if (Object.size(a) > 0) {
                return true;
            } else if (a.length > 0) {
                return true;
            }
        }
    }
    return false;
}

//---------------------------------------
function jsonPretty(a) {
    if (isNotNullOrEmpty(a)) {
        try {
            return JSON.stringify(a, null, 4);
        } catch (b) {
            log("jsonPretty: exception parsing obj " + b);
        }
    }
    log("jsonPretty: invalid obj");
    return "";
}

//---------------------------------------
Object.size = function(a) {
    var b = 0, c;
    for (c in a) {
        if (a.hasOwnProperty(c)) {
            b++;
        }
    }
    return b;
};

//---------------------------------------
function toTheTop() {
    window.scrollTo(0, 0);
}

//---------------------------------------
function extractKey(a, b) {
    log("extracting: " + a);
    if (isNotNullOrEmpty(a)) {
        var c = a.split("-");
        if (b) {
            log("extracted: " + c[b]);
            return c[b];
        } else {
            log("extracted: " + c[1]);
            return c[1];
        }
    }
    return "";
}

//---------------------------------------
function removeFromList(a, b) {
    if (isNotNullOrEmpty(a)) {
        for (var c = a.length; c--; ) {
            if (a[c] === b) {
                a.splice(c, 1);
            }
        }
    }
    return a;
}

//---------------------------------------
function expandToList(a, b, c) {
    var d = [];
    var e = ",";
    var f = "";
    var g = false;
    if (isNotNullOrEmpty(b)) {
        e = b;
    }
    if (isNotNullOrEmpty(c)) {
        f = c;
    }
    if (isNotNullOrEmpty(a)) {
        var h;
        try {
            h = JSON.parse(a);
        } catch (i) {
            log("not JSON parsable");
            //not json parsable
            h = a;
        }
        if (h instanceof Array) {
            log("already an array");
        } else {
            //attempt to split the 
            h = a.split(e);
        }
        //now check how many splits
        if (h.length === 1) {
            if (h[0] === f) {
                return "";
            } else {
                d.push(h[0]);
                g = true;
            }
        } else if (h.length > 1) {
            for (var j = 0; j < h.length; j++) {
                var k = h[j];
                if (isNotNullOrEmpty(k)) {
                    d.push(k);
                    g = true;
                }
            }
        } else {
            log("error condition");
        }
    }
    if (g) {
        return d;
    } else {
        //return empty if no input
        return "";
    }
}

//---------------------------------------
function compressToDelimited(a, b) {
    var c = "";
    var d = ",";
    if (!isNotNullOrEmpty(b)) {
        d = b;
    }
    if (isNotNullOrEmpty(a)) {
        var e = true;
        for (var f in a) {
            if (!isNaN(f)) {
                var g = a[f];
                if (isNotNullOrEmpty(g)) {
                    if (e) {
                        e = false;
                    } else {
                        c = "".concat(c, d);
                    }
                    c = "".concat(c, g);
                }
            }
        }
    }
    return c;
}

//---------------------------------------
function cleanText(a) {
    var b = "";
    if (isNotNullOrEmpty(a)) {
        b = a;
    }
    return b;
}

//---------------------------------------
//BibleHelper Lib
//---------------------------------------
(function(a, b, c) {
    var d = false;
    var e;
    var f = [];
    a.route = function(a) {
        e.setRoute(a);
    };
    //---------------------------------------
    //reverse the hash on top
    a.readExecuteHash = function(b, c) {
        //execute the bible calls
        log("readExecute: " + b + " " + c);
        a.selectDay(b, c);
    };
    //---------------------------------------    
    a.buildHash = function(a, b, c) {
        var d = "/#/{1}/{2}";
        var e = "/{1}/{2}";
        var f = "";
        //convert to number
        var g = Number(a);
        var h = Number(b);
        var i = 1;
        if (isNotNullOrEmpty("" + a) && g > 0 && g <= 365) {
            i = a;
        }
        var j = 1;
        if (isNotNullOrEmpty(b) && h > 0 && h < 3) {
            j = b;
        }
        if (c) {
            f = d.apply(i, j);
        } else {
            f = e.apply(i, j);
        }
        return f;
    };
    //---------------------------------------
    // ROUTING
    //---------------------------------------
    var g = {
        "/:day/:version": a.readExecuteHash
    };
    //---------------------------------------
    a.initRoute = function() {
        e = new Router(g).configure({
            strict: false
        });
        e.init();
    };
    //---------------------------------------   
    a.route = function(a) {
        e.setRoute(a);
    };
    //---------------------------------------    
    a.constructParams = function(a, b) {
        var c = {};
        c.query = a;
        c.version = b;
        return c;
    };
    //---------------------------------------
    a.performSearch = function(a, c) {
        var d = "";
        var e = "";
        if (a === 2) {
            d = "/BiblesOrgServiceProvider.php";
            e = b("#meditation-content");
        } else {
            d = "/BiblesOrgServiceProvider.php";
            e = b("#reading-content");
        }
        var f = b.ajax({
            url: d,
            cache: false,
            data: c
        }).done(function(a, b, c) {
            if (c.status === 200) {
                e.html(a);
            } else {
                log(a);
            }
        }).fail(function(a, b, c) {
            log("fail");
        }).always(function(a, b, c) {
            h();
        });
    };
    //---------------------------------------
    function h() {}
    //---------------------------------------
    a.buildPlan = function(a) {
        var c = "js/plan_tbp.json";
        var d = b.ajax({
            url: c,
            cache: false
        }).done(function(a, b, c) {
            if (c.status === 200) {
                var d = JSON.parse(a);
                if (d.length > 0) {
                    f = [];
                    for (var e = 0; e < d.length; e++) {
                        var g = d[e];
                        if (isNotNullOrEmpty(g)) {
                            var h = "" + g.day;
                            f[h] = g;
                        }
                    }
                    i(f);
                    log("build the plan with: " + f.length);
                } else {
                    log("no plan results");
                }
            } else {
                log(a);
            }
        }).fail(function(a, b, c) {
            log("fail");
        }).always(function(b, c, d) {
            a();
        });
    };
    //---------------------------------------
    a.selectDay = function(c, d) {
        if (f.length < 0) {
            a.buildPlan(a.selectDay(c, d));
        } else {
            var e = f[c];
            i(f, e);
            if (isNotNullOrEmpty(e)) {
                var g = j("" + e.day, "" + e.chapter, e.title, e.read, e.meditation, e.video, e.videoUrl);
                if (isNotNullOrEmpty(g)) {
                    b("#bookmark-content").html(g.panel);
                    b("#today_plan-list").html(g.list);
                }
                var h = a.constructParams(e.read, d);
                var k = a.constructParams(e.meditation, d);
                a.performSearch(1, h);
                a.performSearch(2, k);
                b("#video-content").html(m(e.video, e.videoUrl));
                //session tracking
                a.setCurrentParams(c, d, e.read, e.meditation, e.video);
                n(c, d);
                o(d);
                this.activateRead();
            }
        }
    };
    //---------------------------------------
    a.getCurrentParams = function() {
        var a = b("#current-day").val();
        var c = b("#current-version").val();
        var d = b("#current-read").val();
        var e = b("#current-meditate").val();
        var f = b("#current-video").val();
        var g = {};
        g.day = a;
        g.version = c;
        g.read = d;
        g.pray = e;
        g.video = f;
        return g;
    };
    //---------------------------------------
    a.setCurrentParams = function(a, c, d, e, f) {
        if (isNotNullOrEmpty(a)) {
            b("#current-day").val(a);
        }
        if (isNotNullOrEmpty(c)) {
            b("#current-version").val(c);
        }
        if (isNotNullOrEmpty(d)) {
            b("#current-read").val(d);
        }
        if (isNotNullOrEmpty(e)) {
            b("#current-meditate").val(e);
        }
        b("#current-video").val(f);
    };
    //---------------------------------------
    function i(a) {
        var c = "";
        var d = '<li><a href="#" id="day-{2}" class="btn-day">{3}</a></li>';
        if (a.length > 0) {
            for (var e = 0; e < a.length; e++) {
                var f = a[e];
                if (f) {
                    var g = "" + f.day;
                    if (f.day < 10) {
                        g = "0" + f.day;
                    }
                    var h = d.apply("", f.day, g);
                    c += h;
                }
            }
        }
        if (c) {
            b("#day-select-menu").html(c);
        }
    }
    //---------------------------------------
    function j(b, c, d, e, f, g, h) {
        var i = {};
        var j = '<div class="col-md-12"><a href="http://thebibleproject.tumblr.com/readscripture"><img src="gfxs/bibleIcons/tbp{1}.png" class="img img-responsive"></a><h4><small>Chapter {2}</small><br/><strong><span class="text-uppercase">{3}</span></strong></h4><hr></div><div class="col-md-12"><h4>{4} Day <strong>{5}</strong> of 365 {6}</h4><ul>{7}</ul></div>';
        var m = '<li class="text-capitalize">{1}{2}</li><li class="text-capitalize">{3}{4}</li>{5}';
        var n = '<li class="text-capitalize">{1}<a href="{2}">{3}</a></li>';
        var o = "";
        var p = "";
        if (isNotNullOrEmpty(b)) {
            log(b);
            var q = "";
            var r = "";
            if (isNotNullOrEmpty(g) && isNotNullOrEmpty(h)) {
                q = n.apply("<strong>Watch</strong> ", h, g);
                r = n.apply("", '#" class="btn-video', '<i class="fa fa-film"></i> ' + g);
            }
            var s = "";
            var t = "";
            if (isNotNullOrEmpty(e) || isNotNullOrEmpty(f)) {
                s = m.apply("<strong>Read</strong> ", e, "<strong>Meditate</strong> ", f, q);
                t = m.apply('<a href="#" class="btn-read"><i class="fa fa-book"></i> ', e + "</a>", '<a href="#" class="btn-meditate"><i class="fa fa-puzzle-piece"></i> ', f, r);
            }
            var u = a.getCurrentParams();
            o = j.apply(c, c, d, l(b, u.version), b, k(b, u.version), s);
            p += t;
            i.panel = o;
            i.list = p;
        }
        return i;
    }
    //---------------------------------------
    function k(b, c) {
        var d = "";
        var e = "#";
        var f = '<a href="{1}" {2}><span class="glyphicon glyphicon-chevron-right"></span></a>';
        var g = Number(b);
        if (g < 365 && g >= 0) {
            g = g + 1;
            e = a.buildHash(g, c, true);
            d = f.apply(e, "");
        } else {
            d = '<span class="text-muted glyphicon glyphicon-chevron-right"></span>';
        }
        return d;
    }
    //---------------------------------------
    function l(b, c) {
        var d = "";
        var e = "#";
        var f = '<a href="{1}" {2}><span class="glyphicon glyphicon-chevron-left"></span></a>';
        var g = Number(b);
        if (g > 1 && g < 365) {
            g = g - 1;
            e = a.buildHash(g, c, true);
            d = f.apply(e, "");
        } else {
            d = '<span class="text-muted glyphicon glyphicon-chevron-left"></span>';
        }
        return d;
    }
    //---------------------------------------
    function m(a, b) {
        var c = '<h1>{1}</h1><hr><br/><iframe width="560" height="315" src="{2}" frameborder="0" allowfullscreen></iframe>';
        var d = "<h1>Watch</h1><hr><br/><p>No video today</p>";
        if (isNotNullOrEmpty(a) && isNotNullOrEmpty(b)) {
            d = c.apply(a, b);
        }
        return d;
    }
    //---------------------------------------
    function n(c, d) {
        var e = b("#display-current-hash");
        var f = "Day {1}";
        var g = f.apply(c);
        e.html(g);
        e.attr("href", a.buildHash(c, d, true));
        b("#day-btn-group").html(g);
    }
    //---------------------------------------
    function o(a) {
        var c = "version-{1}";
        var d = c.apply(a);
        var e = "";
        //clear
        b(".btn-version").each(function(a) {
            var c = b(this);
            if (c.hasClass("active")) {
                c.removeClass("active");
            }
            if (c.attr("id") === d) {
                e = c.html();
                c.addClass("active");
            }
        });
        b("#display-current-version").html(e);
        b("#version-btn-group").html(e);
    }
    a.activateRead = function() {
        b('#main-tabs a[href="#reading"]').tab("show");
        b("#today_plan-span").html(a.getCurrentParams().read);
    };
    a.activateMeditate = function() {
        b('#main-tabs a[href="#meditation"]').tab("show");
        b("#today_plan-span").html(a.getCurrentParams().pray);
    };
    a.activateVideo = function() {
        b('#main-tabs a[href="#video"]').tab("show");
        b("#today_plan-span").html(a.getCurrentParams().video);
    };
    //---------------------------------------
    // ALERT CLASSES
    //---------------------------------------
    a.showStatusAlert = function(a, c, d) {
        if (isNotNullOrEmpty(a)) {
            var e = b("#status-alert");
            var f = "<p><strong>{1}</strong> {2}</p>";
            //clear it out
            e.removeClass();
            //reinit
            e.addClass("alert");
            if (isNotNullOrEmpty(d)) {
                switch (d) {
                  case 1:
                    e.addClass("alert-info");
                    break;

                  case 2:
                    e.addClass("alert-warning");
                    break;

                  case 0:
                    e.addClass("alert-success");
                    break;

                  case 3:
                  /* falls through */
                    default:
                    e.addClass("alert-danger");
                }
            } else {
                //default to error
                e.addClass("alert-danger");
            }
            e.html(f.apply(c, a));
            e.show();
        }
    };
    //---------------------------------------
    a.toggleSearchAlert = function(a) {
        b("#biblehelper-search-alert").toggle(a);
    };
})(window.biblehelper = window.biblehelper || {}, $);

//---------------------------------------
// DOCUMENT READY
//---------------------------------------
$(document).ready(function() {
    biblehelper.buildPlan(biblehelper.initRoute);
    //---------------------------------------
    $(document).on("click", ".btn-version", function(a) {
        var b = $(this).attr("id");
        var c = extractKey(b, 1);
        if (c) {
            var d = biblehelper.getCurrentParams();
            var e = biblehelper.buildHash(d.day, c, false);
            biblehelper.route(e);
        }
        //close the dropdown
        $("#version-select").dropdown("toggle");
        return false;
    });
    //---------------------------------------
    $(document).on("click", ".btn-day", function(a) {
        var b = $(this).attr("id");
        var c = extractKey(b, 1);
        if (c) {
            var d = biblehelper.getCurrentParams();
            var e = biblehelper.buildHash(c, d.version, false);
            biblehelper.route(e);
        }
        //close the dropdown
        $("#day-select").dropdown("toggle");
        return false;
    });
    //---------------------------------------
    $(document).on("click", ".btn-read", function(a) {
        biblehelper.activateRead();
        return false;
    });
    //---------------------------------------
    $(document).on("click", ".btn-meditate", function(a) {
        biblehelper.activateMeditate();
        return false;
    });
    //---------------------------------------
    $(document).on("click", ".btn-video", function(a) {
        biblehelper.activateVideo();
        return false;
    });
});

//end doc ready
//---------------------------------------
/*
 * IE Hacks from Bootstrap
 */
if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement("style");
    msViewportStyle.appendChild(document.createTextNode("@-ms-viewport{width:auto!important}"));
    document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
}