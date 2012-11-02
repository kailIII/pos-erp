/*

This file is part of Sencha Touch 2

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial Software License Agreement provided with the Software or, alternatively, in accordance with the terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.define("Ext.event.ListenerStack", {
    currentOrder: "current",
    length: 0,
    constructor: function () {
        this.listeners = {
            before: [],
            current: [],
            after: []
        };
        this.lateBindingMap = {};
        return this
    },
    add: function (h, j, k, e) {
        var a = this.lateBindingMap,
            g = this.getAll(e),
            f = g.length,
            b, d, c;
        if (typeof h == "string" && j.isIdentifiable) {
            c = j.getId();
            b = a[c];
            if (b) {
                if (b[h]) {
                    return false
                } else {
                    b[h] = true
                }
            } else {
                a[c] = b = {};
                b[h] = true
            }
        } else {
            if (f > 0) {
                while (f--) {
                    d = g[f];
                    if (d.fn === h && d.scope === j) {
                        d.options = k;
                        return false
                    }
                }
            }
        }
        d = this.create(h, j, k, e);
        if (k && k.prepend) {
            delete k.prepend;
            g.unshift(d)
        } else {
            g.push(d)
        }
        this.length++;
        return true
    },
    getAt: function (b, a) {
        return this.getAll(a)[b]
    },
    getAll: function (a) {
        if (!a) {
            a = this.currentOrder
        }
        return this.listeners[a]
    },
    count: function (a) {
        return this.getAll(a).length
    },
    create: function (d, c, b, a) {
        return {
            stack: this,
            fn: d,
            firingFn: false,
            boundFn: false,
            isLateBinding: typeof d == "string",
            scope: c,
            options: b || {},
            order: a
        }
    },
    remove: function (h, j, e) {
        var g = this.getAll(e),
            f = g.length,
            b = false,
            a = this.lateBindingMap,
            d, c;
        if (f > 0) {
            while (f--) {
                d = g[f];
                if (d.fn === h && d.scope === j) {
                    g.splice(f, 1);
                    b = true;
                    this.length--;
                    if (typeof h == "string" && j.isIdentifiable) {
                        c = j.getId();
                        if (a[c] && a[c][h]) {
                            delete a[c][h]
                        }
                    }
                    break
                }
            }
        }
        return b
    }
});
Ext.define("Ext.event.Controller", {
    isFiring: false,
    listenerStack: null,
    constructor: function (a) {
        this.firingListeners = [];
        this.firingArguments = [];
        this.setInfo(a);
        return this
    },
    setInfo: function (a) {
        this.info = a
    },
    getInfo: function () {
        return this.info
    },
    setListenerStacks: function (a) {
        this.listenerStacks = a
    },
    fire: function (h, e) {
        var n = this.listenerStacks,
            m = this.firingListeners,
            d = this.firingArguments,
            k = m.push,
            g = n.length,
            j, l, c, o, a = false,
            b = false,
            f;
        m.length = 0;
        if (e) {
            if (e.order !== "after") {
                a = true
            } else {
                b = true
            }
        }
        if (g === 1) {
            j = n[0].listeners;
            l = j.before;
            c = j.current;
            o = j.after;
            if (l.length > 0) {
                k.apply(m, l)
            }
            if (a) {
                k.call(m, e)
            }
            if (c.length > 0) {
                k.apply(m, c)
            }
            if (b) {
                k.call(m, e)
            }
            if (o.length > 0) {
                k.apply(m, o)
            }
        } else {
            for (f = 0; f < g; f++) {
                l = n[f].listeners.before;
                if (l.length > 0) {
                    k.apply(m, l)
                }
            }
            if (a) {
                k.call(m, e)
            }
            for (f = 0; f < g; f++) {
                c = n[f].listeners.current;
                if (c.length > 0) {
                    k.apply(m, c)
                }
            }
            if (b) {
                k.call(m, e)
            }
            for (f = 0; f < g; f++) {
                o = n[f].listeners.after;
                if (o.length > 0) {
                    k.apply(m, o)
                }
            }
        }
        if (m.length === 0) {
            return this
        }
        if (!h) {
            h = []
        }
        d.length = 0;
        d.push.apply(d, h);
        d.push(null, this);
        this.doFire();
        return this
    },
    doFire: function () {
        var k = this.firingListeners,
            c = this.firingArguments,
            g = c.length - 2,
            d, f, b, o, h, n, a, j, l, e, m;
        this.isPausing = false;
        this.isPaused = false;
        this.isStopped = false;
        this.isFiring = true;
        for (d = 0, f = k.length; d < f; d++) {
            b = k[d];
            o = b.options;
            h = b.fn;
            n = b.firingFn;
            a = b.boundFn;
            j = b.isLateBinding;
            l = b.scope;
            if (j && a && a !== l[h]) {
                a = false;
                n = false
            }
            if (!a) {
                if (j) {
                    a = l[h];
                    if (!a) {
                        continue
                    }
                } else {
                    a = h
                }
                b.boundFn = a
            }
            if (!n) {
                n = a;
                if (o.buffer) {
                    n = Ext.Function.createBuffered(n, o.buffer, l)
                }
                if (o.delay) {
                    n = Ext.Function.createDelayed(n, o.delay, l)
                }
                b.firingFn = n
            }
            c[g] = o;
            e = c;
            if (o.args) {
                e = o.args.concat(e)
            }
            if (o.single === true) {
                b.stack.remove(h, l, b.order)
            }
            m = n.apply(l, e);
            if (m === false) {
                this.stop()
            }
            if (this.isStopped) {
                break
            }
            if (this.isPausing) {
                this.isPaused = true;
                k.splice(0, d + 1);
                return
            }
        }
        this.isFiring = false;
        this.listenerStacks = null;
        k.length = 0;
        c.length = 0;
        this.connectingController = null
    },
    connect: function (a) {
        this.connectingController = a
    },
    resume: function () {
        var a = this.connectingController;
        this.isPausing = false;
        if (this.isPaused && this.firingListeners.length > 0) {
            this.isPaused = false;
            this.doFire()
        }
        if (a) {
            a.resume()
        }
        return this
    },
    isInterrupted: function () {
        return this.isStopped || this.isPaused
    },
    stop: function () {
        var a = this.connectingController;
        this.isStopped = true;
        if (a) {
            this.connectingController = null;
            a.stop()
        }
        this.isFiring = false;
        this.listenerStacks = null;
        return this
    },
    pause: function () {
        var a = this.connectingController;
        this.isPausing = true;
        if (a) {
            a.pause()
        }
        return this
    }
});
Ext.define("Ext.event.publisher.Publisher", {
    targetType: "",
    idSelectorRegex: /^#([\w\-]+)$/i,
    constructor: function () {
        var b = this.handledEvents,
            a, c, e, d;
        a = this.handledEventsMap = {};
        for (c = 0, e = b.length; c < e; c++) {
            d = b[c];
            a[d] = true
        }
        this.subscribers = {};
        return this
    },
    handles: function (a) {
        var b = this.handledEventsMap;
        return !!b[a] || !! b["*"] || a === "*"
    },
    getHandledEvents: function () {
        return this.handledEvents
    },
    setDispatcher: function (a) {
        this.dispatcher = a
    },
    subscribe: function () {
        return false
    },
    unsubscribe: function () {
        return false
    },
    unsubscribeAll: function () {
        delete this.subscribers;
        this.subscribers = {};
        return this
    },
    notify: function () {
        return false
    },
    getTargetType: function () {
        return this.targetType
    },
    dispatch: function (c, a, b) {
        this.dispatcher.doDispatchEvent(this.targetType, c, a, b)
    }
});
Ext.define("Ext.event.Event", {
    alternateClassName: "Ext.EventObject",
    isStopped: false,
    set: function (a, b) {
        if (arguments.length === 1 && typeof a != "string") {
            var c = a;
            for (a in c) {
                if (c.hasOwnProperty(a)) {
                    this[a] = c[a]
                }
            }
        } else {
            this[a] = c[a]
        }
    },
    stopEvent: function () {
        return this.stopPropagation()
    },
    stopPropagation: function () {
        this.isStopped = true;
        return this
    }
});
Ext.define("Ext.ComponentManager", {
    alternateClassName: "Ext.ComponentMgr",
    singleton: true,
    constructor: function () {
        var a = {};
        this.all = {
            map: a,
            getArray: function () {
                var b = [],
                    c;
                for (c in a) {
                    b.push(a[c])
                }
                return b
            }
        };
        this.map = a
    },
    register: function (a) {
        this.map[a.getId()] = a
    },
    unregister: function (a) {
        delete this.map[a.getId()]
    },
    isRegistered: function (a) {
        return this.map[a] !== undefined
    },
    get: function (a) {
        return this.map[a]
    },
    create: function (a, c) {
        if (a.isComponent) {
            return a
        } else {
            if (Ext.isString(a)) {
                return Ext.createByAlias("widget." + a)
            } else {
                var b = a.xtype || c;
                return Ext.createByAlias("widget." + b, a)
            }
        }
    },
    registerType: Ext.emptyFn
});
Ext.define("Ext.behavior.Behavior", {
    constructor: function (a) {
        this.component = a;
        a.on("destroy", "onComponentDestroy", this)
    },
    onComponentDestroy: Ext.emptyFn
});
Ext.define("Ext.XTemplateParser", {
    constructor: function (a) {
        Ext.apply(this, a)
    },
    doTpl: Ext.emptyFn,
    parse: function (o) {
        var p = this,
            n = o.length,
            c = {
                elseif: "elif"
            },
            k = p.topRe,
            b = p.actionsRe,
            l, q, u, f, r, g, a, e, d, h, j;
        p.level = 0;
        p.stack = q = [];
        for (l = 0; l < n; l = h) {
            k.lastIndex = l;
            f = k.exec(o);
            if (!f) {
                p.doText(o.substring(l, n));
                break
            }
            d = f.index;
            h = k.lastIndex;
            if (l < d) {
                p.doText(o.substring(l, d))
            }
            if (f[1]) {
                h = o.indexOf("%}", d + 2);
                p.doEval(o.substring(d + 2, h));
                h += 2
            } else {
                if (f[2]) {
                    h = o.indexOf("]}", d + 2);
                    p.doExpr(o.substring(d + 2, h));
                    h += 2
                } else {
                    if (f[3]) {
                        p.doTag(f[3])
                    } else {
                        if (f[4]) {
                            j = null;
                            while ((e = b.exec(f[4])) !== null) {
                                u = e[2] || e[3];
                                if (u) {
                                    u = Ext.String.htmlDecode(u);
                                    r = e[1];
                                    r = c[r] || r;
                                    j = j || {};
                                    g = j[r];
                                    if (typeof g == "string") {
                                        j[r] = [g, u]
                                    } else {
                                        if (g) {
                                            j[r].push(u)
                                        } else {
                                            j[r] = u
                                        }
                                    }
                                }
                            }
                            if (!j) {
                                if (p.elseRe.test(f[4])) {
                                    p.doElse()
                                } else {
                                    if (p.defaultRe.test(f[4])) {
                                        p.doDefault()
                                    } else {
                                        p.doTpl();
                                        q.push({
                                            type: "tpl"
                                        })
                                    }
                                }
                            } else {
                                if (j["if"]) {
                                    p.doIf(j["if"], j);
                                    q.push({
                                        type: "if"
                                    })
                                } else {
                                    if (j["switch"]) {
                                        p.doSwitch(j["switch"], j);
                                        q.push({
                                            type: "switch"
                                        })
                                    } else {
                                        if (j["case"]) {
                                            p.doCase(j["case"], j)
                                        } else {
                                            if (j.elif) {
                                                p.doElseIf(j.elif, j)
                                            } else {
                                                if (j["for"]) {
                                                    ++p.level;
                                                    p.doFor(j["for"], j);
                                                    q.push({
                                                        type: "for",
                                                        actions: j
                                                    })
                                                } else {
                                                    if (j.exec) {
                                                        p.doExec(j.exec, j);
                                                        q.push({
                                                            type: "exec",
                                                            actions: j
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            a = q.pop();
                            p.doEnd(a.type, a.actions);
                            if (a.type == "for") {
                                --p.level
                            }
                        }
                    }
                }
            }
        }
    },
    topRe: /(?:(\{\%)|(\{\[)|\{([^{}]*)\})|(?:<tpl([^>]*)\>)|(?:<\/tpl>)/g,
    actionsRe: /\s*(elif|elseif|if|for|exec|switch|case|eval)\s*\=\s*(?:(?:["]([^"]*)["])|(?:[']([^']*)[']))\s*/g,
    defaultRe: /^\s*default\s*$/,
    elseRe: /^\s*else\s*$/
});
Ext.define("Ext.data.Operation", {
    config: {
        synchronous: true,
        action: null,
        filters: null,
        sorters: null,
        grouper: null,
        start: null,
        limit: null,
        batch: null,
        callback: null,
        scope: null,
        resultSet: null,
        records: null,
        request: null,
        response: null,
        params: null,
        url: null,
        page: null,
        node: null,
        model: undefined,
        addRecords: false
    },
    started: false,
    running: false,
    complete: false,
    success: undefined,
    exception: false,
    error: undefined,
    constructor: function (a) {
        this.initConfig(a)
    },
    applyModel: function (a) {
        if (typeof a == "string") {
            a = Ext.data.ModelManager.getModel(a);
            if (!a) {
                Ext.Logger.error("Model with name " + arguments[0] + " doesnt exist.")
            }
        }
        if (a && !a.prototype.isModel && Ext.isObject(a)) {
            a = Ext.data.ModelManager.registerType(a.storeId || a.id || Ext.id(), a)
        }
        return a
    },
    getRecords: function () {
        var a = this.getResultSet();
        return this._records || (a ? a.getRecords() : [])
    },
    setStarted: function () {
        this.started = true;
        this.running = true
    },
    setCompleted: function () {
        this.complete = true;
        this.running = false
    },
    setSuccessful: function () {
        this.success = true
    },
    setException: function (a) {
        this.exception = true;
        this.success = false;
        this.running = false;
        this.error = a
    },
    hasException: function () {
        return this.exception === true
    },
    getError: function () {
        return this.error
    },
    isStarted: function () {
        return this.started === true
    },
    isRunning: function () {
        return this.running === true
    },
    isComplete: function () {
        return this.complete === true
    },
    wasSuccessful: function () {
        return this.isComplete() && this.success === true
    },
    allowWrite: function () {
        return this.getAction() != "read"
    },
    process: function (d, b, c, a) {
        if (b.getSuccess() !== false) {
            this.setResponse(a);
            this.setResultSet(b);
            this.setCompleted();
            this.setSuccessful()
        } else {
            return false
        }
        return this["process" + Ext.String.capitalize(d)].call(this, b, c, a)
    },
    processRead: function (d) {
        var b = d.getRecords(),
            g = [],
            f = this.getModel(),
            e = b.length,
            c, a;
        for (c = 0; c < e; c++) {
            a = b[c];
            g.push(new f(a.data, a.id, a.node))
        }
        this.setRecords(g);
        return true
    },
    processCreate: function (d) {
        var b = d.getRecords(),
            e = b.length,
            c, a, f;
        for (c = 0; c < e; c++) {
            f = b[c];
            a = this.findCurrentRecord(f.clientId);
            if (a) {
                this.updateRecord(a, f)
            }
        }
        return true
    },
    processUpdate: function (e) {
        var c = e.getRecords(),
            b = this.getRecords(),
            f = c.length,
            d, a, g;
        for (d = 0; d < f; d++) {
            g = c[d];
            a = b[d];
            if (a) {
                this.updateRecord(a, g)
            }
        }
        return true
    },
    processDestroy: function (d) {
        var b = d.getRecords(),
            e = b.length,
            c, a, f;
        for (c = 0; c < e; c++) {
            f = b[c];
            a = this.findCurrentRecord(f.id);
            if (a) {
                a.setIsErased(true);
                a.notifyStores("afterErase", a)
            }
        }
    },
    findCurrentRecord: function (a) {
        var c = this.getRecords(),
            e = c.length,
            d, b;
        for (d = 0; d < e; d++) {
            b = c[d];
            if (b.getId() === a) {
                return b
            }
        }
    },
    updateRecord: function (b, d) {
        var a = d.data,
            c = d.id;
        b.beginEdit();
        b.set(a);
        if (c !== null) {
            b.setId(c)
        }
        b.endEdit(true);
        b.commit()
    }
});
Ext.define("Ext.mixin.Mixin", {
    onClassExtended: function (b, e) {
        var a = e.mixinConfig,
            d, f, c;
        if (a) {
            d = b.superclass.mixinConfig;
            if (d) {
                a = e.mixinConfig = Ext.merge({}, d, a)
            }
            e.mixinId = a.id;
            f = a.beforeHooks, c = a.hooks || a.afterHooks;
            if (f || c) {
                Ext.Function.interceptBefore(e, "onClassMixedIn", function (h) {
                    var g = this.prototype;
                    if (f) {
                        Ext.Object.each(f, function (k, j) {
                            h.override(j, function () {
                                g[k].apply(this, arguments);
                                return this.callOverridden(arguments)
                            })
                        })
                    }
                    if (c) {
                        Ext.Object.each(c, function (k, j) {
                            h.override(j, function () {
                                var l = this.callOverridden(arguments);
                                g[k].apply(this, arguments);
                                return l
                            })
                        })
                    }
                })
            }
        }
    }
});
Ext.define("Ext.util.Point", {
    radianToDegreeConstant: 180 / Math.PI,
    statics: {
        fromEvent: function (b) {
            var a = b.changedTouches,
                c = (a && a.length > 0) ? a[0] : b;
            return this.fromTouch(c)
        },
        fromTouch: function (a) {
            return new this(a.pageX, a.pageY)
        },
        from: function (a) {
            if (!a) {
                return new this(0, 0)
            }
            if (!(a instanceof this)) {
                return new this(a.x, a.y)
            }
            return a
        }
    },
    constructor: function (a, b) {
        if (typeof a == "undefined") {
            a = 0
        }
        if (typeof b == "undefined") {
            b = 0
        }
        this.x = a;
        this.y = b;
        return this
    },
    clone: function () {
        return new this.self(this.x, this.y)
    },
    copy: function () {
        return this.clone.apply(this, arguments)
    },
    copyFrom: function (a) {
        this.x = a.x;
        this.y = a.y;
        return this
    },
    toString: function () {
        return "Point[" + this.x + "," + this.y + "]"
    },
    equals: function (a) {
        return (this.x === a.x && this.y === a.y)
    },
    isCloseTo: function (c, b) {
        if (typeof b == "number") {
            b = {
                x: b
            };
            b.y = b.x
        }
        var a = c.x,
            f = c.y,
            e = b.x,
            d = b.y;
        return (this.x <= a + e && this.x >= a - e && this.y <= f + d && this.y >= f - d)
    },
    isWithin: function () {
        return this.isCloseTo.apply(this, arguments)
    },
    translate: function (a, b) {
        this.x += a;
        this.y += b;
        return this
    },
    roundedEquals: function (a) {
        return (Math.round(this.x) === Math.round(a.x) && Math.round(this.y) === Math.round(a.y))
    },
    getDistanceTo: function (b) {
        var c = this.x - b.x,
            a = this.y - b.y;
        return Math.sqrt(c * c + a * a)
    },
    getAngleTo: function (b) {
        var c = this.x - b.x,
            a = this.y - b.y;
        return Math.atan2(a, c) * this.radianToDegreeConstant
    }
});
Ext.define("Ext.util.Sorter", {
    isSorter: true,
    config: {
        property: null,
        sorterFn: null,
        root: null,
        transform: null,
        direction: "ASC",
        id: undefined
    },
    constructor: function (a) {
        this.initConfig(a)
    },
    applyId: function (a) {
        if (!a) {
            a = this.getProperty();
            if (!a) {
                a = Ext.id(null, "ext-sorter-")
            }
        }
        return a
    },
    createSortFunction: function (b) {
        var c = this,
            a = c.getDirection().toUpperCase() == "DESC" ? -1 : 1;
        return function (e, d) {
            return a * b.call(c, e, d)
        }
    },
    defaultSortFn: function (e, c) {
        var g = this,
            f = g._transform,
            b = g._root,
            d, a, h = g._property;
        if (b !== null) {
            e = e[b];
            c = c[b]
        }
        d = e[h];
        a = c[h];
        if (f) {
            d = f(d);
            a = f(a)
        }
        return d > a ? 1 : (d < a ? -1 : 0)
    },
    updateDirection: function () {
        this.updateSortFn()
    },
    updateSortFn: function () {
        this.sort = this.createSortFunction(this.getSorterFn() || this.defaultSortFn)
    },
    toggle: function () {
        this.setDirection(Ext.String.toggle(this.getDirection(), "ASC", "DESC"))
    }
});
Ext.define("Ext.util.Filter", {
    isFilter: true,
    config: {
        property: null,
        value: null,
        filterFn: Ext.emptyFn,
        anyMatch: false,
        exactMatch: false,
        caseSensitive: false,
        root: null,
        id: undefined,
        scope: null
    },
    applyId: function (a) {
        if (!a) {
            if (this.getProperty()) {
                a = this.getProperty() + "-" + String(this.getValue())
            }
            if (!a) {
                a = Ext.id(null, "ext-filter-")
            }
        }
        return a
    },
    constructor: function (a) {
        this.initConfig(a)
    },
    applyFilterFn: function (b) {
        if (b === Ext.emptyFn) {
            b = this.getInitialConfig("filter");
            if (b) {
                return b
            }
            var a = this.getValue();
            if (!this.getProperty() && !a && a !== 0) {
                return Ext.emptyFn
            } else {
                return this.createFilterFn()
            }
        }
        return b
    },
    createFilterFn: function () {
        var a = this,
            b = a.createValueMatcher();
        return function (d) {
            var c = a.getRoot(),
                e = a.getProperty();
            if (c) {
                d = d[c]
            }
            return b.test(d[e])
        }
    },
    createValueMatcher: function () {
        var d = this,
            e = d.getValue(),
            f = d.getAnyMatch(),
            c = d.getExactMatch(),
            a = d.getCaseSensitive(),
            b = Ext.String.escapeRegex;
        if (e === null || e === undefined || !e.exec) {
            e = String(e);
            if (f === true) {
                e = b(e)
            } else {
                e = "^" + b(e);
                if (c === true) {
                    e += "$"
                }
            }
            e = new RegExp(e, a ? "" : "i")
        }
        return e
    }
});
Ext.define("Ext.data.identifier.Simple", {
    alias: "data.identifier.simple",
    statics: {
        AUTO_ID: 1
    },
    config: {
        prefix: "ext-record-"
    },
    constructor: function (a) {
        this.initConfig(a)
    },
    generate: function (a) {
        return this._prefix + this.self.AUTO_ID++
    }
});
Ext.define("Ext.data.SortTypes", {
    singleton: true,
    stripTagsRE: /<\/?[^>]+>/gi,
    none: function (a) {
        return a
    },
    asText: function (a) {
        return String(a).replace(this.stripTagsRE, "")
    },
    asUCText: function (a) {
        return String(a).toUpperCase().replace(this.stripTagsRE, "")
    },
    asUCString: function (a) {
        return String(a).toUpperCase()
    },
    asDate: function (a) {
        if (!a) {
            return 0
        }
        if (Ext.isDate(a)) {
            return a.getTime()
        }
        return Date.parse(String(a))
    },
    asFloat: function (a) {
        a = parseFloat(String(a).replace(/,/g, ""));
        return isNaN(a) ? 0 : a
    },
    asInt: function (a) {
        a = parseInt(String(a).replace(/,/g, ""), 10);
        return isNaN(a) ? 0 : a
    }
});
Ext.define("Ext.fx.State", {
    isAnimatable: {
        "background-color": true,
        "background-image": true,
        "background-position": true,
        "border-bottom-color": true,
        "border-bottom-width": true,
        "border-color": true,
        "border-left-color": true,
        "border-left-width": true,
        "border-right-color": true,
        "border-right-width": true,
        "border-spacing": true,
        "border-top-color": true,
        "border-top-width": true,
        "border-width": true,
        bottom: true,
        color: true,
        crop: true,
        "font-size": true,
        "font-weight": true,
        height: true,
        left: true,
        "letter-spacing": true,
        "line-height": true,
        "margin-bottom": true,
        "margin-left": true,
        "margin-right": true,
        "margin-top": true,
        "max-height": true,
        "max-width": true,
        "min-height": true,
        "min-width": true,
        opacity: true,
        "outline-color": true,
        "outline-offset": true,
        "outline-width": true,
        "padding-bottom": true,
        "padding-left": true,
        "padding-right": true,
        "padding-top": true,
        right: true,
        "text-indent": true,
        "text-shadow": true,
        top: true,
        "vertical-align": true,
        visibility: true,
        width: true,
        "word-spacing": true,
        "z-index": true,
        zoom: true,
        transform: true
    },
    constructor: function (a) {
        this.data = {};
        this.set(a)
    },
    setConfig: function (a) {
        this.set(a);
        return this
    },
    setRaw: function (a) {
        this.data = a;
        return this
    },
    clear: function () {
        return this.setRaw({})
    },
    setTransform: function (c, g) {
        var f = this.data,
            a = Ext.isArray(g),
            b = f.transform,
            e, d;
        if (!b) {
            b = f.transform = {
                translateX: 0,
                translateY: 0,
                translateZ: 0,
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                rotate: 0,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                skewX: 0,
                skewY: 0
            }
        }
        if (typeof c == "string") {
            switch (c) {
            case "translate":
                if (a) {
                    e = g.length;
                    if (e == 0) {
                        break
                    }
                    b.translateX = g[0];
                    if (e == 1) {
                        break
                    }
                    b.translateY = g[1];
                    if (e == 2) {
                        break
                    }
                    b.translateZ = g[2]
                } else {
                    b.translateX = g
                }
                break;
            case "rotate":
                if (a) {
                    e = g.length;
                    if (e == 0) {
                        break
                    }
                    b.rotateX = g[0];
                    if (e == 1) {
                        break
                    }
                    b.rotateY = g[1];
                    if (e == 2) {
                        break
                    }
                    b.rotateZ = g[2]
                } else {
                    b.rotate = g
                }
                break;
            case "scale":
                if (a) {
                    e = g.length;
                    if (e == 0) {
                        break
                    }
                    b.scaleX = g[0];
                    if (e == 1) {
                        break
                    }
                    b.scaleY = g[1];
                    if (e == 2) {
                        break
                    }
                    b.scaleZ = g[2]
                } else {
                    b.scaleX = g;
                    b.scaleY = g
                }
                break;
            case "skew":
                if (a) {
                    e = g.length;
                    if (e == 0) {
                        break
                    }
                    b.skewX = g[0];
                    if (e == 1) {
                        break
                    }
                    b.skewY = g[1]
                } else {
                    b.skewX = g
                }
                break;
            default:
                b[c] = g
            }
        } else {
            for (d in c) {
                if (c.hasOwnProperty(d)) {
                    g = c[d];
                    this.setTransform(d, g)
                }
            }
        }
    },
    set: function (a, d) {
        var c = this.data,
            b;
        if (typeof a != "string") {
            for (b in a) {
                d = a[b];
                if (b === "transform") {
                    this.setTransform(d)
                } else {
                    c[b] = d
                }
            }
        } else {
            if (a === "transform") {
                this.setTransform(d)
            } else {
                c[a] = d
            }
        }
        return this
    },
    unset: function (a) {
        var b = this.data;
        if (b.hasOwnProperty(a)) {
            delete b[a]
        }
        return this
    },
    getData: function () {
        return this.data
    }
});
Ext.define("Ext.util.Inflector", {
    singleton: true,
    plurals: [
        [(/(quiz)$/i), "$1zes"],
        [(/^(ox)$/i), "$1en"],
        [(/([m|l])ouse$/i), "$1ice"],
        [(/(matr|vert|ind)ix|ex$/i), "$1ices"],
        [(/(x|ch|ss|sh)$/i), "$1es"],
        [(/([^aeiouy]|qu)y$/i), "$1ies"],
        [(/(hive)$/i), "$1s"],
        [(/(?:([^f])fe|([lr])f)$/i), "$1$2ves"],
        [(/sis$/i), "ses"],
        [(/([ti])um$/i), "$1a"],
        [(/(buffal|tomat|potat)o$/i), "$1oes"],
        [(/(bu)s$/i), "$1ses"],
        [(/(alias|status|sex)$/i), "$1es"],
        [(/(octop|vir)us$/i), "$1i"],
        [(/(ax|test)is$/i), "$1es"],
        [(/^person$/), "people"],
        [(/^man$/), "men"],
        [(/^(child)$/), "$1ren"],
        [(/s$/i), "s"],
        [(/$/), "s"]
    ],
    singulars: [
        [(/(quiz)zes$/i), "$1"],
        [(/(matr)ices$/i), "$1ix"],
        [(/(vert|ind)ices$/i), "$1ex"],
        [(/^(ox)en/i), "$1"],
        [(/(alias|status)es$/i), "$1"],
        [(/(octop|vir)i$/i), "$1us"],
        [(/(cris|ax|test)es$/i), "$1is"],
        [(/(shoe)s$/i), "$1"],
        [(/(o)es$/i), "$1"],
        [(/(bus)es$/i), "$1"],
        [(/([m|l])ice$/i), "$1ouse"],
        [(/(x|ch|ss|sh)es$/i), "$1"],
        [(/(m)ovies$/i), "$1ovie"],
        [(/(s)eries$/i), "$1eries"],
        [(/([^aeiouy]|qu)ies$/i), "$1y"],
        [(/([lr])ves$/i), "$1f"],
        [(/(tive)s$/i), "$1"],
        [(/(hive)s$/i), "$1"],
        [(/([^f])ves$/i), "$1fe"],
        [(/(^analy)ses$/i), "$1sis"],
        [(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i), "$1$2sis"],
        [(/([ti])a$/i), "$1um"],
        [(/(n)ews$/i), "$1ews"],
        [(/people$/i), "person"],
        [(/s$/i), ""]
    ],
    uncountable: ["sheep", "fish", "series", "species", "money", "rice", "information", "equipment", "grass", "mud", "offspring", "deer", "means"],
    singular: function (b, a) {
        this.singulars.unshift([b, a])
    },
    plural: function (b, a) {
        this.plurals.unshift([b, a])
    },
    clearSingulars: function () {
        this.singulars = []
    },
    clearPlurals: function () {
        this.plurals = []
    },
    isTransnumeral: function (a) {
        return Ext.Array.indexOf(this.uncountable, a) != -1
    },
    pluralize: function (f) {
        if (this.isTransnumeral(f)) {
            return f
        }
        var e = this.plurals,
            d = e.length,
            a, c, b;
        for (b = 0; b < d; b++) {
            a = e[b];
            c = a[0];
            if (c == f || (c.test && c.test(f))) {
                return f.replace(c, a[1])
            }
        }
        return f
    },
    singularize: function (f) {
        if (this.isTransnumeral(f)) {
            return f
        }
        var e = this.singulars,
            d = e.length,
            a, c, b;
        for (b = 0; b < d; b++) {
            a = e[b];
            c = a[0];
            if (c == f || (c.test && c.test(f))) {
                return f.replace(c, a[1])
            }
        }
        return f
    },
    classify: function (a) {
        return Ext.String.capitalize(this.singularize(a))
    },
    ordinalize: function (d) {
        var b = parseInt(d, 10),
            c = b % 10,
            a = b % 100;
        if (11 <= a && a <= 13) {
            return d + "th"
        } else {
            switch (c) {
            case 1:
                return d + "st";
            case 2:
                return d + "nd";
            case 3:
                return d + "rd";
            default:
                return d + "th"
            }
        }
    }
}, function () {
    var b = {
        alumnus: "alumni",
        cactus: "cacti",
        focus: "foci",
        nucleus: "nuclei",
        radius: "radii",
        stimulus: "stimuli",
        ellipsis: "ellipses",
        paralysis: "paralyses",
        oasis: "oases",
        appendix: "appendices",
        index: "indexes",
        beau: "beaux",
        bureau: "bureaux",
        tableau: "tableaux",
        woman: "women",
        child: "children",
        man: "men",
        corpus: "corpora",
        criterion: "criteria",
        curriculum: "curricula",
        genus: "genera",
        memorandum: "memoranda",
        phenomenon: "phenomena",
        foot: "feet",
        goose: "geese",
        tooth: "teeth",
        antenna: "antennae",
        formula: "formulae",
        nebula: "nebulae",
        vertebra: "vertebrae",
        vita: "vitae"
    },
        a;
    for (a in b) {
        this.plural(a, b[a]);
        this.singular(b[a], a)
    }
});
Ext.define("Ext.fx.easing.Abstract", {
    config: {
        startTime: 0,
        startValue: 0
    },
    isEasing: true,
    isEnded: false,
    constructor: function (a) {
        this.initConfig(a);
        return this
    },
    applyStartTime: function (a) {
        if (!a) {
            a = Ext.Date.now()
        }
        return a
    },
    updateStartTime: function (a) {
        this.reset()
    },
    reset: function () {
        this.isEnded = false
    },
    getValue: Ext.emptyFn
});
Ext.define("Ext.fx.easing.Momentum", {
    extend: "Ext.fx.easing.Abstract",
    config: {
        acceleration: 30,
        friction: 0,
        startVelocity: 0
    },
    alpha: 0,
    updateFriction: function (b) {
        var a = Math.log(1 - (b / 10));
        this.theta = a;
        this.alpha = a / this.getAcceleration()
    },
    updateStartVelocity: function (a) {
        this.velocity = a * this.getAcceleration()
    },
    updateAcceleration: function (a) {
        this.velocity = this.getStartVelocity() * a;
        this.alpha = this.theta / a
    },
    getValue: function () {
        return this.getStartValue() - this.velocity * (1 - this.getFrictionFactor()) / this.theta
    },
    getFrictionFactor: function () {
        var a = Ext.Date.now() - this.getStartTime();
        return Math.exp(a * this.alpha)
    },
    getVelocity: function () {
        return this.getFrictionFactor() * this.velocity
    }
});
Ext.define("Ext.fx.easing.Bounce", {
    extend: "Ext.fx.easing.Abstract",
    config: {
        springTension: 0.3,
        acceleration: 30,
        startVelocity: 0
    },
    getValue: function () {
        var b = Ext.Date.now() - this.getStartTime(),
            c = (b / this.getAcceleration()),
            a = c * Math.pow(Math.E, -this.getSpringTension() * c);
        return this.getStartValue() + (this.getStartVelocity() * a)
    }
});
Ext.define("Ext.data.Request", {
    config: {
        action: null,
        params: null,
        method: "GET",
        url: null,
        operation: null,
        proxy: null,
        disableCaching: false,
        headers: {},
        callbackKey: null,
        jsonP: null,
        jsonData: null,
        xmlData: null,
        callback: null,
        scope: null,
        timeout: 30000,
        records: null
    },
    constructor: function (a) {
        this.initConfig(a)
    }
});
Ext.define("Ext.data.writer.Writer", {
    alias: "writer.base",
    alternateClassName: ["Ext.data.DataWriter", "Ext.data.Writer"],
    config: {
        writeAllFields: true,
        nameProperty: "name"
    },
    constructor: function (a) {
        this.initConfig(a)
    },
    write: function (e) {
        var c = e.getOperation(),
            b = c.getRecords() || [],
            a = b.length,
            d = 0,
            f = [];
        for (; d < a; d++) {
            f.push(this.getRecordData(b[d]))
        }
        return this.writeRecords(e, f)
    },
    writeDate: function (c, b) {
        var a = c.dateFormat || "timestamp";
        switch (a) {
        case "timestamp":
            return b.getTime() / 1000;
        case "time":
            return b.getTime();
        default:
            return Ext.Date.format(b, a)
        }
    },
    getRecordData: function (f) {
        var l = f.phantom === true,
            c = this.getWriteAllFields() || l,
            d = this.getNameProperty(),
            g = f.getFields(),
            e = {},
            j, a, h, m, k, b;
        if (c) {
            g.each(function (n) {
                b = n.config;
                if (b.persist) {
                    a = b[d] || b.name;
                    k = f.get(b.name);
                    if (b.type.type == "date") {
                        k = this.writeDate(b, k)
                    }
                    e[a] = k
                }
            }, this)
        } else {
            j = f.getChanges();
            for (m in j) {
                if (j.hasOwnProperty(m)) {
                    h = g.get(m);
                    b = h.config;
                    if (b.persist) {
                        a = b[d] || h.name;
                        k = j[m];
                        if (b.type.type == "date") {
                            k = this.writeDate(b, k)
                        }
                        e[a] = k
                    }
                }
            }
            if (!l) {
                e[f.idProperty] = f.getId()
            }
        }
        return e
    }
});
Ext.define("Ext.data.ResultSet", {
    config: {
        loaded: true,
        count: null,
        total: null,
        success: false,
        records: null
    },
    constructor: function (a) {
        this.initConfig(a)
    },
    applyCount: function (a) {
        if (!a && a !== 0) {
            return this.getRecords().length
        }
        return a
    },
    updateRecords: function (a) {
        this.setCount(a.length)
    }
});
Ext.define("Ext.event.Dispatcher", {
    requires: ["Ext.event.ListenerStack", "Ext.event.Controller"],
    statics: {
        getInstance: function () {
            if (!this.instance) {
                this.instance = new this()
            }
            return this.instance
        },
        setInstance: function (a) {
            this.instance = a;
            return this
        }
    },
    config: {
        publishers: {}
    },
    wildcard: "*",
    constructor: function (a) {
        this.listenerStacks = {};
        this.activePublishers = {};
        this.publishersCache = {};
        this.noActivePublishers = [];
        this.controller = null;
        this.initConfig(a);
        return this
    },
    getListenerStack: function (e, g, c, b) {
        var d = this.listenerStacks,
            f = d[e],
            a;
        b = Boolean(b);
        if (!f) {
            if (b) {
                d[e] = f = {}
            } else {
                return null
            }
        }
        f = f[g];
        if (!f) {
            if (b) {
                d[e][g] = f = {}
            } else {
                return null
            }
        }
        a = f[c];
        if (!a) {
            if (b) {
                f[c] = a = new Ext.event.ListenerStack()
            } else {
                return null
            }
        }
        return a
    },
    getController: function (d, f, c, b) {
        var a = this.controller,
            e = {
                targetType: d,
                target: f,
                eventName: c
            };
        if (!a) {
            this.controller = a = new Ext.event.Controller()
        }
        if (a.isFiring) {
            a = new Ext.event.Controller()
        }
        a.setInfo(e);
        if (b && a !== b) {
            a.connect(b)
        }
        return a
    },
    applyPublishers: function (c) {
        var a, b;
        this.publishersCache = {};
        for (a in c) {
            if (c.hasOwnProperty(a)) {
                b = c[a];
                this.registerPublisher(b)
            }
        }
        return c
    },
    registerPublisher: function (b) {
        var a = this.activePublishers,
            c = b.getTargetType(),
            d = a[c];
        if (!d) {
            a[c] = d = []
        }
        d.push(b);
        b.setDispatcher(this);
        return this
    },
    getCachedActivePublishers: function (c, b) {
        var a = this.publishersCache,
            d;
        if ((d = a[c]) && (d = d[b])) {
            return d
        }
        return null
    },
    cacheActivePublishers: function (c, b, d) {
        var a = this.publishersCache;
        if (!a[c]) {
            a[c] = {}
        }
        a[c][b] = d;
        return d
    },
    getActivePublishers: function (f, b) {
        var g, a, c, e, d;
        if ((g = this.getCachedActivePublishers(f, b))) {
            return g
        }
        a = this.activePublishers[f];
        if (a) {
            g = [];
            for (c = 0, e = a.length; c < e; c++) {
                d = a[c];
                if (d.handles(b)) {
                    g.push(d)
                }
            }
        } else {
            g = this.noActivePublishers
        }
        return this.cacheActivePublishers(f, b, g)
    },
    hasListener: function (c, d, b) {
        var a = this.getListenerStack(c, d, b);
        if (a) {
            return a.count() > 0
        }
        return false
    },
    addListener: function (d, e, a) {
        var f = this.getActivePublishers(d, a),
            c = f.length,
            b;
        if (c > 0) {
            for (b = 0; b < c; b++) {
                f[b].subscribe(e, a)
            }
        }
        return this.doAddListener.apply(this, arguments)
    },
    doAddListener: function (g, h, c, f, e, d, a) {
        var b = this.getListenerStack(g, h, c, true);
        return b.add(f, e, d, a)
    },
    removeListener: function (d, e, a) {
        var f = this.getActivePublishers(d, a),
            c = f.length,
            b;
        if (c > 0) {
            for (b = 0; b < c; b++) {
                f[b].unsubscribe(e, a)
            }
        }
        return this.doRemoveListener.apply(this, arguments)
    },
    doRemoveListener: function (f, g, c, e, d, a) {
        var b = this.getListenerStack(f, g, c);
        if (b === null) {
            return false
        }
        return b.remove(e, d, a)
    },
    clearListeners: function (a, e, d) {
        var j = this.listenerStacks,
            f = arguments.length,
            b, h, c, g;
        if (f === 3) {
            if (j[a] && j[a][e]) {
                this.removeListener(a, e, d);
                delete j[a][e][d]
            }
        } else {
            if (f === 2) {
                if (j[a]) {
                    b = j[a][e];
                    if (b) {
                        for (d in b) {
                            if (b.hasOwnProperty(d)) {
                                h = this.getActivePublishers(a, d);
                                for (c = 0, f = h.length; c < f; c++) {
                                    h[c].unsubscribe(e, d, true)
                                }
                            }
                        }
                        delete j[a][e]
                    }
                }
            } else {
                if (f === 1) {
                    h = this.activePublishers[a];
                    for (c = 0, f = h.length; c < f; c++) {
                        h[c].unsubscribeAll()
                    }
                    delete j[a]
                } else {
                    h = this.activePublishers;
                    for (a in h) {
                        if (h.hasOwnProperty(a)) {
                            g = h[a];
                            for (c = 0, f = g.length; c < f; c++) {
                                g[c].unsubscribeAll()
                            }
                        }
                    }
                    delete this.listenerStacks;
                    this.listenerStacks = {}
                }
            }
        }
        return this
    },
    dispatchEvent: function (d, e, a) {
        var f = this.getActivePublishers(d, a),
            c = f.length,
            b;
        if (c > 0) {
            for (b = 0; b < c; b++) {
                f[b].notify(e, a)
            }
        }
        return this.doDispatchEvent.apply(this, arguments)
    },
    doDispatchEvent: function (a, g, f, j, c, b) {
        var h = this.getListenerStack(a, g, f),
            d = this.getWildcardListenerStacks(a, g, f),
            e;
        if ((h === null || h.length == 0)) {
            if (d.length == 0 && !c) {
                return
            }
        } else {
            d.push(h)
        }
        e = this.getController(a, g, f, b);
        e.setListenerStacks(d);
        e.fire(j, c);
        return !e.isInterrupted()
    },
    getWildcardListenerStacks: function (g, h, d) {
        var f = [],
            b = this.wildcard,
            c = d !== b,
            e = h !== b,
            a;
        if (c && (a = this.getListenerStack(g, h, b))) {
            f.push(a)
        }
        if (e && (a = this.getListenerStack(g, b, d))) {
            f.push(a)
        }
        return f
    }
});
Ext.define("Ext.event.Dom", {
    extend: "Ext.event.Event",
    constructor: function (a) {
        var c = a.target,
            b;
        if (c && c.nodeType !== 1) {
            c = c.parentNode
        }
        b = a.changedTouches;
        if (b) {
            b = b[0];
            this.pageX = b.pageX;
            this.pageY = b.pageY
        } else {
            this.pageX = a.pageX;
            this.pageY = a.pageY
        }
        this.browserEvent = this.event = a;
        this.target = this.delegatedTarget = c;
        this.type = a.type;
        this.timeStamp = this.time = a.timeStamp;
        if (typeof this.time != "number") {
            this.time = new Date(this.time).getTime()
        }
        return this
    },
    stopEvent: function () {
        this.preventDefault();
        return this.callParent()
    },
    preventDefault: function () {
        this.browserEvent.preventDefault()
    },
    getPageX: function () {
        return this.browserEvent.pageX
    },
    getPageY: function () {
        return this.browserEvent.pageY
    },
    getXY: function () {
        if (!this.xy) {
            this.xy = [this.getPageX(), this.getPageY()]
        }
        return this.xy
    },
    getTarget: function (b, c, a) {
        if (arguments.length === 0) {
            return this.delegatedTarget
        }
        return b ? Ext.fly(this.target).findParent(b, c, a) : (a ? Ext.get(this.target) : this.target)
    },
    getTime: function () {
        return this.time
    },
    setDelegatedTarget: function (a) {
        this.delegatedTarget = a
    },
    makeUnpreventable: function () {
        this.browserEvent.preventDefault = Ext.emptyFn
    }
});
Ext.define("Ext.event.publisher.Dom", {
    extend: "Ext.event.publisher.Publisher",
    requires: ["Ext.env.Browser", "Ext.Element", "Ext.event.Dom"],
    targetType: "element",
    idOrClassSelectorRegex: /^([#|\.])([\w\-]+)$/,
    handledEvents: ["click", "focus", "blur", "mousemove", "mousedown", "mouseup", "mouseover", "mouseout", "keyup", "keydown", "keypress", "submit", "transitionend", "animationstart", "animationend"],
    classNameSplitRegex: /\s+/,
    SELECTOR_ALL: "*",
    constructor: function () {
        var f = this.getHandledEvents(),
            e = {},
            b, c, a, d;
        this.doBubbleEventsMap = {
            click: true,
            submit: true,
            mousedown: true,
            mousemove: true,
            mouseup: true,
            mouseover: true,
            mouseout: true,
            transitionend: true
        };
        this.onEvent = Ext.Function.bind(this.onEvent, this);
        for (b = 0, c = f.length; b < c; b++) {
            a = f[b];
            d = this.getVendorEventName(a);
            e[d] = a;
            this.attachListener(d)
        }
        this.eventNameMap = e;
        return this.callParent()
    },
    getSubscribers: function (a) {
        var c = this.subscribers,
            b = c[a];
        if (!b) {
            b = c[a] = {
                id: {
                    $length: 0
                },
                className: {
                    $length: 0
                },
                selector: [],
                all: 0,
                $length: 0
            }
        }
        return b
    },
    getVendorEventName: function (a) {
        if (a === "transitionend") {
            a = Ext.browser.getVendorProperyName("transitionEnd")
        } else {
            if (a === "animationstart") {
                a = Ext.browser.getVendorProperyName("animationStart")
            } else {
                if (a === "animationend") {
                    a = Ext.browser.getVendorProperyName("animationEnd")
                }
            }
        }
        return a
    },
    attachListener: function (a) {
        document.addEventListener(a, this.onEvent, !this.doesEventBubble(a));
        return this
    },
    removeListener: function (a) {
        document.removeEventListener(a, this.onEvent, !this.doesEventBubble(a));
        return this
    },
    doesEventBubble: function (a) {
        return !!this.doBubbleEventsMap[a]
    },
    subscribe: function (g, f) {
        if (!this.handles(f)) {
            return false
        }
        var e = g.match(this.idOrClassSelectorRegex),
            a = this.getSubscribers(f),
            c = a.id,
            d = a.className,
            b = a.selector,
            h, j;
        if (e !== null) {
            h = e[1];
            j = e[2];
            if (h === "#") {
                if (c.hasOwnProperty(j)) {
                    c[j]++;
                    return true
                }
                c[j] = 1;
                c.$length++
            } else {
                if (d.hasOwnProperty(j)) {
                    d[j]++;
                    return true
                }
                d[j] = 1;
                d.$length++
            }
        } else {
            if (g === this.SELECTOR_ALL) {
                a.all++
            } else {
                if (b.hasOwnProperty(g)) {
                    b[g]++;
                    return true
                }
                b[g] = 1;
                b.push(g)
            }
        }
        a.$length++;
        return true
    },
    unsubscribe: function (g, f, k) {
        if (!this.handles(f)) {
            return false
        }
        var e = g.match(this.idOrClassSelectorRegex),
            a = this.getSubscribers(f),
            c = a.id,
            d = a.className,
            b = a.selector,
            h, j;
        k = Boolean(k);
        if (e !== null) {
            h = e[1];
            j = e[2];
            if (h === "#") {
                if (!c.hasOwnProperty(j) || (!k && --c[j] > 0)) {
                    return true
                }
                delete c[j];
                c.$length--
            } else {
                if (!d.hasOwnProperty(j) || (!k && --d[j] > 0)) {
                    return true
                }
                delete d[j];
                d.$length--
            }
        } else {
            if (g === this.SELECTOR_ALL) {
                if (k) {
                    a.all = 0
                } else {
                    a.all--
                }
            } else {
                if (!b.hasOwnProperty(g) || (!k && --b[g] > 0)) {
                    return true
                }
                delete b[g];
                Ext.Array.remove(b, g)
            }
        }
        a.$length--;
        return true
    },
    getElementTarget: function (a) {
        if (a.nodeType !== 1) {
            a = a.parentNode;
            if (!a || a.nodeType !== 1) {
                return null
            }
        }
        return a
    },
    getBubblingTargets: function (b) {
        var a = [];
        if (!b) {
            return a
        }
        do {
            a[a.length] = b;
            b = b.parentNode
        } while (b && b.nodeType === 1);
        return a
    },
    dispatch: function (c, a, b) {
        b.push(b[0].target);
        this.callParent(arguments)
    },
    publish: function (b, a, c) {
        var d = this.getSubscribers(b),
            e;
        if (d.$length === 0 || !this.doPublish(d, b, a, c)) {
            e = this.getSubscribers("*");
            if (e.$length > 0) {
                this.doPublish(e, b, a, c)
            }
        }
        return this
    },
    doPublish: function (f, h, x, u) {
        var r = f.id,
            g = f.className,
            b = f.selector,
            p = r.$length > 0,
            a = g.$length > 0,
            l = b.length > 0,
            o = f.all > 0,
            y = {},
            e = [u],
            q = false,
            m = this.classNameSplitRegex,
            v, k, t, d, z, n, c, w, s;
        for (v = 0, k = x.length; v < k; v++) {
            z = x[v];
            u.setDelegatedTarget(z);
            if (p) {
                n = z.id;
                if (n) {
                    if (r.hasOwnProperty(n)) {
                        q = true;
                        this.dispatch("#" + n, h, e)
                    }
                }
            }
            if (a) {
                c = z.className;
                if (c) {
                    w = c.split(m);
                    for (t = 0, d = w.length; t < d; t++) {
                        c = w[t];
                        if (!y[c]) {
                            y[c] = true;
                            if (g.hasOwnProperty(c)) {
                                q = true;
                                this.dispatch("." + c, h, e)
                            }
                        }
                    }
                }
            }
            if (u.isStopped) {
                return q
            }
        }
        if (o && !q) {
            u.setDelegatedTarget(u.browserEvent.target);
            q = true;
            this.dispatch(this.ALL_SELECTOR, h, e);
            if (u.isStopped) {
                return q
            }
        }
        if (l) {
            for (t = 0, d = x.length; t < d; t++) {
                z = x[t];
                for (v = 0, k = b.length; v < k; v++) {
                    s = b[v];
                    if (this.matchesSelector(z, s)) {
                        u.setDelegatedTarget(z);
                        q = true;
                        this.dispatch(s, h, e)
                    }
                    if (u.isStopped) {
                        return q
                    }
                }
            }
        }
        return q
    },
    matchesSelector: function (b, a) {
        if ("webkitMatchesSelector" in b) {
            return b.webkitMatchesSelector(a)
        }
        return Ext.DomQuery.is(b, a)
    },
    onEvent: function (d) {
        var b = this.eventNameMap[d.type];
        if (!b || this.getSubscribersCount(b) === 0) {
            return
        }
        var c = this.getElementTarget(d.target),
            a;
        if (!c) {
            return
        }
        if (this.doesEventBubble(b)) {
            a = this.getBubblingTargets(c)
        } else {
            a = [c]
        }
        this.publish(b, a, new Ext.event.Dom(d))
    },
    getSubscribersCount: function (a) {
        if (!this.handles(a)) {
            return 0
        }
        return this.getSubscribers(a).$length + this.getSubscribers("*").$length
    }
});
Ext.define("Ext.XTemplateCompiler", {
    extend: "Ext.XTemplateParser",
    useEval: Ext.isGecko,
    useFormat: true,
    propNameRe: /^[\w\d\$]*$/,
    compile: function (a) {
        var c = this,
            b = c.generate(a);
        return c.useEval ? c.evalTpl(b) : (new Function("Ext", b))(Ext)
    },
    generate: function (a) {
        var c = this;
        c.body = ["var c0=values, p0=parent, n0=xcount, i0=xindex;\n"];
        c.funcs = ["var fm=Ext.util.Format;"];
        c.switches = [];
        c.parse(a);
        c.funcs.push((c.useEval ? "$=" : "return") + " function (" + c.fnArgs + ") {", c.body.join(""), "}");
        var b = c.funcs.join("\n");
        return b
    },
    doText: function (a) {
        a = a.replace(this.aposRe, "\\'");
        a = a.replace(this.newLineRe, "\\n");
        this.body.push("out.push('", a, "')\n")
    },
    doExpr: function (a) {
        this.body.push("out.push(String(", a, "))\n")
    },
    doTag: function (a) {
        this.doExpr(this.parseTag(a))
    },
    doElse: function () {
        this.body.push("} else {\n")
    },
    doEval: function (a) {
        this.body.push(a, "\n")
    },
    doIf: function (b, c) {
        var a = this;
        if (a.propNameRe.test(b)) {
            a.body.push("if (", a.parseTag(b), ") {\n")
        } else {
            a.body.push("if (", a.addFn(b), a.callFn, ") {\n")
        }
        if (c.exec) {
            a.doExec(c.exec)
        }
    },
    doElseIf: function (b, c) {
        var a = this;
        if (a.propNameRe.test(b)) {
            a.body.push("} else if (", a.parseTag(b), ") {\n")
        } else {
            a.body.push("} else if (", a.addFn(b), a.callFn, ") {\n")
        }
        if (c.exec) {
            a.doExec(c.exec)
        }
    },
    doSwitch: function (b) {
        var a = this;
        if (a.propNameRe.test(b)) {
            a.body.push("switch (", a.parseTag(b), ") {\n")
        } else {
            a.body.push("switch (", a.addFn(b), a.callFn, ") {\n")
        }
        a.switches.push(0)
    },
    doCase: function (e) {
        var d = this,
            c = Ext.isArray(e) ? e : [e],
            f = d.switches.length - 1,
            a, b;
        if (d.switches[f]) {
            d.body.push("break;\n")
        } else {
            d.switches[f]++
        }
        for (b = 0, f = c.length; b < f; ++b) {
            a = d.intRe.exec(c[b]);
            c[b] = a ? a[1] : ("'" + c[b].replace(d.aposRe, "\\'") + "'")
        }
        d.body.push("case ", c.join(": case "), ":\n")
    },
    doDefault: function () {
        var a = this,
            b = a.switches.length - 1;
        if (a.switches[b]) {
            a.body.push("break;\n")
        } else {
            a.switches[b]++
        }
        a.body.push("default:\n")
    },
    doEnd: function (b, d) {
        var c = this,
            a = c.level - 1;
        if (b == "for") {
            if (d.exec) {
                c.doExec(d.exec)
            }
            c.body.push("}\n");
            c.body.push("parent=p", a, ";values=r", a + 1, ";xcount=n", a, ";xindex=i", a, "\n")
        } else {
            if (b == "if" || b == "switch") {
                c.body.push("}\n")
            }
        }
    },
    doFor: function (e, f) {
        var d = this,
            c = d.addFn(e),
            b = d.level,
            a = b - 1;
        d.body.push("var c", b, "=", c, d.callFn, ", a", b, "=Ext.isArray(c", b, "),p", b, "=(parent=c", a, "),r", b, "=values\n", "for (var i", b, "=0,n", b, "=a", b, "?c", b, ".length:(c", b, "?1:0), xcount=n", b, ";i", b, "<n" + b + ";++i", b, "){\n", "values=a", b, "?c", b, "[i", b, "]:c", b, "\n", "xindex=i", b, "+1\n")
    },
    doExec: function (c, d) {
        var b = this,
            a = "f" + b.funcs.length;
        b.funcs.push("function " + a + "(" + b.fnArgs + ") {", " try { with(values) {", "  " + c, " }} catch(e) {}", "}");
        b.body.push(a + b.callFn + "\n")
    },
    addFn: function (a) {
        var c = this,
            b = "f" + c.funcs.length;
        if (a === ".") {
            c.funcs.push("function " + b + "(" + c.fnArgs + ") {", " return values", "}")
        } else {
            if (a === "..") {
                c.funcs.push("function " + b + "(" + c.fnArgs + ") {", " return parent", "}")
            } else {
                c.funcs.push("function " + b + "(" + c.fnArgs + ") {", " try { with(values) {", "  return(" + a + ")", " }} catch(e) {}", "}")
            }
        }
        return b
    },
    parseTag: function (b) {
        var a = this.tagRe.exec(b),
            e = a[1],
            g = a[2],
            d = a[3],
            f = a[4],
            c;
        if (e == ".") {
            c = 'Ext.Array.indexOf(["string", "number", "boolean"], typeof values) > -1 || Ext.isDate(values) ? values : ""'
        } else {
            if (e == "#") {
                c = "xindex"
            } else {
                if (e.substr(0, 7) == "parent.") {
                    c = e
                } else {
                    if ((e.indexOf(".") !== -1) && (e.indexOf("-") === -1)) {
                        c = "values." + e
                    } else {
                        c = "values['" + e + "']"
                    }
                }
            }
        }
        if (f) {
            c = "(" + c + f + ")"
        }
        if (g && this.useFormat) {
            d = d ? "," + d : "";
            if (g.substr(0, 5) != "this.") {
                g = "fm." + g + "("
            } else {
                g += "("
            }
        } else {
            d = "";
            g = "(" + c + " === undefined ? '' : "
        }
        return g + c + d + ")"
    },
    evalTpl: function ($) {
        eval($);
        return $
    },
    newLineRe: /\r\n|\r|\n/g,
    aposRe: /[']/g,
    intRe: /^\s*(\d+)\s*$/,
    tagRe: /([\w-\.\#]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\/]\s?[\d\.\+\-\*\/\(\)]+)?/
}, function () {
    var a = this.prototype;
    a.fnArgs = "out,values,parent,xindex,xcount";
    a.callFn = ".call(this," + a.fnArgs + ")"
});
Ext.define("Ext.mixin.Traversable", {
    extend: "Ext.mixin.Mixin",
    mixinConfig: {
        id: "traversable"
    },
    setParent: function (a) {
        this.parent = a;
        return this
    },
    hasParent: function () {
        return Boolean(this.parent)
    },
    getParent: function () {
        return this.parent
    },
    getAncestors: function () {
        var b = [],
            a = this.getParent();
        while (a) {
            b.push(a);
            a = a.getParent()
        }
        return b
    },
    getAncestorIds: function () {
        var b = [],
            a = this.getParent();
        while (a) {
            b.push(a.getId());
            a = a.getParent()
        }
        return b
    }
});
Ext.define("Ext.mixin.Observable", {
    requires: ["Ext.event.Dispatcher"],
    extend: "Ext.mixin.Mixin",
    mixins: ["Ext.mixin.Identifiable"],
    mixinConfig: {
        id: "observable",
        hooks: {
            destroy: "destroy"
        }
    },
    alternateClassName: "Ext.util.Observable",
    isObservable: true,
    observableType: "observable",
    validIdRegex: /^([\w\-]+)$/,
    observableIdPrefix: "#",
    listenerOptionsRegex: /^(?:delegate|single|delay|buffer|args|prepend)$/,
    config: {
        listeners: null,
        bubbleEvents: null
    },
    constructor: function (a) {
        this.initConfig(a)
    },
    applyListeners: function (a) {
        if (a) {
            this.addListener(a)
        }
    },
    applyBubbleEvents: function (a) {
        if (a) {
            this.enableBubble(a)
        }
    },
    getOptimizedObservableId: function () {
        return this.observableId
    },
    getObservableId: function () {
        if (!this.observableId) {
            var a = this.getUniqueId();
            this.observableId = this.observableIdPrefix + a;
            this.getObservableId = this.getOptimizedObservableId
        }
        return this.observableId
    },
    getOptimizedEventDispatcher: function () {
        return this.eventDispatcher
    },
    getEventDispatcher: function () {
        if (!this.eventDispatcher) {
            this.eventDispatcher = Ext.event.Dispatcher.getInstance();
            this.getEventDispatcher = this.getOptimizedEventDispatcher;
            this.getListeners();
            this.getBubbleEvents()
        }
        return this.eventDispatcher
    },
    getManagedListeners: function (c, b) {
        var d = c.getUniqueId(),
            a = this.managedListeners;
        if (!a) {
            this.managedListeners = a = {}
        }
        if (!a[d]) {
            a[d] = {};
            c.doAddListener("destroy", "clearManagedListeners", this, {
                single: true,
                args: [c]
            })
        }
        if (!a[d][b]) {
            a[d][b] = []
        }
        return a[d][b]
    },
    getUsedSelectors: function () {
        var a = this.usedSelectors;
        if (!a) {
            a = this.usedSelectors = [];
            a.$map = {}
        }
        return a
    },
    fireEvent: function (a) {
        var b = Array.prototype.slice.call(arguments, 1);
        return this.doFireEvent(a, b)
    },
    fireAction: function (c, e, g, f, d, a) {
        var b = typeof g,
            h;
        if (e === undefined) {
            e = []
        }
        if (b != "undefined") {
            h = {
                fn: g,
                isLateBinding: b == "string",
                scope: f || this,
                options: d || {},
                order: a
            }
        }
        return this.doFireEvent(c, e, h)
    },
    doFireEvent: function (b, c, e, a) {
        if (this.eventFiringSuspended) {
            return
        }
        var f = this.getObservableId(),
            d = this.getEventDispatcher();
        return d.dispatchEvent(this.observableType, f, b, c, e, a)
    },
    doAddListener: function (a, j, l, m, c) {
        var e = (l && l !== this && l.isIdentifiable),
            b = this.getUsedSelectors(),
            f = b.$map,
            d = this.getObservableId(),
            g, k, h;
        if (!m) {
            m = {}
        }
        if (!l) {
            l = this
        }
        if (m.delegate) {
            h = m.delegate;
            d += " " + h
        }
        if (!(d in f)) {
            f[d] = true;
            b.push(d)
        }
        g = this.addDispatcherListener(d, a, j, l, m, c);
        if (g && e) {
            k = this.getManagedListeners(l, a);
            k.push({
                delegate: h,
                scope: l,
                fn: j,
                order: c
            })
        }
        return g
    },
    addDispatcherListener: function (b, d, f, e, c, a) {
        return this.getEventDispatcher().addListener(this.observableType, b, d, f, e, c, a)
    },
    doRemoveListener: function (b, k, m, n, d) {
        var g = (m && m !== this && m.isIdentifiable),
            e = this.getObservableId(),
            a, l, f, h, c, j;
        if (n && n.delegate) {
            j = n.delegate;
            e += " " + j
        }
        if (!m) {
            m = this
        }
        a = this.removeDispatcherListener(e, b, k, m, d);
        if (a && g) {
            l = this.getManagedListeners(m, b);
            for (f = 0, h = l.length; f < h; f++) {
                c = l[f];
                if (c.fn === k && c.scope === m && c.delegate === j && c.order === d) {
                    l.splice(f, 1);
                    break
                }
            }
        }
        return a
    },
    removeDispatcherListener: function (b, c, e, d, a) {
        return this.getEventDispatcher().removeListener(this.observableType, b, c, e, d, a)
    },
    clearManagedListeners: function (d) {
        var j = this.managedListeners,
            a, c, h, f, e, g, b, k;
        if (!j) {
            return this
        }
        if (d) {
            if (typeof d != "string") {
                a = d.getUniqueId()
            } else {
                a = d
            }
            c = j[a];
            for (f in c) {
                if (c.hasOwnProperty(f)) {
                    h = c[f];
                    for (e = 0, g = h.length; e < g; e++) {
                        b = h[e];
                        k = {};
                        if (b.delegate) {
                            k.delegate = b.delegate
                        }
                        if (this.doRemoveListener(f, b.fn, b.scope, k, b.order)) {
                            e--;
                            g--
                        }
                    }
                }
            }
            delete j[a];
            return this
        }
        for (a in j) {
            if (j.hasOwnProperty(a)) {
                this.clearManagedListeners(a)
            }
        }
    },
    changeListener: function (l, h, n, p, q, d) {
        var b, m, g, j, a, o, f, k, c, e;
        if (typeof n != "undefined") {
            if (typeof h != "string") {
                for (f = 0, k = h.length; f < k; f++) {
                    a = h[f];
                    l.call(this, a, n, p, q, d)
                }
                return this
            }
            l.call(this, h, n, p, q, d)
        } else {
            if (Ext.isArray(h)) {
                m = h;
                for (f = 0, k = m.length; f < k; f++) {
                    c = m[f];
                    l.call(this, c.event, c.fn, c.scope, c, c.order)
                }
            } else {
                g = this.listenerOptionsRegex;
                q = h;
                b = [];
                m = [];
                j = {};
                for (a in q) {
                    o = q[a];
                    if (a === "scope") {
                        p = o;
                        continue
                    } else {
                        if (a === "order") {
                            d = o;
                            continue
                        }
                    }
                    if (!g.test(a)) {
                        e = typeof o;
                        if (e != "string" && e != "function") {
                            l.call(this, a, o.fn, o.scope || p, o, o.order || d);
                            continue
                        }
                        b.push(a);
                        m.push(o)
                    } else {
                        j[a] = o
                    }
                }
                for (f = 0, k = b.length; f < k; f++) {
                    l.call(this, b[f], m[f], p, j, d)
                }
            }
        }
    },
    addListener: function (b, e, d, c, a) {
        return this.changeListener(this.doAddListener, b, e, d, c, a)
    },
    addBeforeListener: function (a, d, c, b) {
        return this.addListener(a, d, c, b, "before")
    },
    addAfterListener: function (a, d, c, b) {
        return this.addListener(a, d, c, b, "after")
    },
    removeListener: function (b, e, d, c, a) {
        return this.changeListener(this.doRemoveListener, b, e, d, c, a)
    },
    removeBeforeListener: function (a, d, c, b) {
        return this.removeListener(a, d, c, b, "before")
    },
    removeAfterListener: function (a, d, c, b) {
        return this.removeListener(a, d, c, b, "after")
    },
    clearListeners: function () {
        var e = this.getUsedSelectors(),
            c = this.getEventDispatcher(),
            b, d, a;
        for (b = 0, d = e.length; b < d; b++) {
            a = e[b];
            c.clearListeners(this.observableType, a)
        }
    },
    hasListener: function (a) {
        return this.getEventDispatcher().hasListener(this.observableType, this.getObservableId(), a)
    },
    suspendEvents: function (a) {
        this.eventFiringSuspended = true
    },
    resumeEvents: function () {
        this.eventFiringSuspended = false
    },
    relayEvents: function (b, d, g) {
        var c, f, e, a;
        if (typeof g == "undefined") {
            g = ""
        }
        if (typeof d == "string") {
            d = [d]
        }
        if (Ext.isArray(d)) {
            for (c = 0, f = d.length; c < f; c++) {
                e = d[c];
                a = g + e;
                b.addListener(e, this.createEventRelayer(a), this)
            }
        } else {
            for (e in d) {
                if (d.hasOwnProperty(e)) {
                    a = g + d[e];
                    b.addListener(e, this.createEventRelayer(a), this)
                }
            }
        }
        return this
    },
    relayEvent: function (e, f, h, j, a) {
        var g = typeof f,
            c = e[e.length - 1],
            d = c.getInfo().eventName,
            b;
        e = Array.prototype.slice.call(e, 0, -2);
        e[0] = this;
        if (g != "undefined") {
            b = {
                fn: f,
                scope: h || this,
                options: j || {},
                order: a,
                isLateBinding: g == "string"
            }
        }
        return this.doFireEvent(d, e, b, c)
    },
    createEventRelayer: function (a) {
        return function () {
            return this.doFireEvent(a, Array.prototype.slice.call(arguments, 0, -2))
        }
    },
    enableBubble: function (d) {
        var a = this.isBubblingEnabled,
            c, e, b;
        if (!a) {
            a = this.isBubblingEnabled = {}
        }
        if (typeof d == "string") {
            d = Ext.Array.clone(arguments)
        }
        for (c = 0, e = d.length; c < e; c++) {
            b = d[c];
            if (!a[b]) {
                a[b] = true;
                this.addListener(b, this.createEventBubbler(b), this)
            }
        }
    },
    createEventBubbler: function (a) {
        return function b() {
            var c = ("getBubbleTarget" in this) ? this.getBubbleTarget() : null;
            if (c && c !== this && c.isObservable) {
                c.fireAction(a, Array.prototype.slice.call(arguments, 0, -2), b, c, null, "after")
            }
        }
    },
    getBubbleTarget: function () {
        return false
    },
    destroy: function () {
        if (this.observableId) {
            this.fireEvent("destroy", this);
            this.clearListeners();
            this.clearManagedListeners()
        }
    },
    addEvents: Ext.emptyFn
}, function () {
    this.createAlias({
        on: "addListener",
        un: "removeListener",
        onBefore: "addBeforeListener",
        onAfter: "addAfterListener",
        unBefore: "removeBeforeListener",
        unAfter: "removeAfterListener"
    })
});
Ext.define("Ext.app.Controller", {
    mixins: {
        observable: "Ext.mixin.Observable"
    },
    config: {
        refs: {},
        routes: {},
        control: {},
        before: {},
        application: {}
    },
    constructor: function (a) {
        this.initConfig(a);
        this.mixins.observable.constructor.call(this, a)
    },
    init: Ext.emptyFn,
    launch: Ext.emptyFn,
    redirectTo: function (a) {
        return this.getApplication().redirectTo(a)
    },
    execute: function (b, a) {
        b.setBeforeFilters(this.getBefore()[b.getAction()]);
        b.execute()
    },
    applyBefore: function (e) {
        var d, a, c, b;
        for (a in e) {
            d = Ext.Array.from(e[a]);
            c = d.length;
            for (b = 0; b < c; b++) {
                d[b] = this[d[b]]
            }
            e[a] = d
        }
        return e
    },
    applyControl: function (a) {
        this.control(a, this);
        return a
    },
    applyRefs: function (a) {
        this.ref(a);
        return a
    },
    applyRoutes: function (a) {
        var f = this instanceof Ext.app.Application ? this : this.getApplication(),
            c = f.getRouter(),
            b, e, d;
        for (e in a) {
            b = a[e];
            d = {
                controller: this.$className
            };
            if (Ext.isString(b)) {
                d.action = b
            } else {
                Ext.apply(d, b)
            }
            c.connect(e, d)
        }
        return a
    },
    control: function (a) {
        this.getApplication().control(a, this)
    },
    ref: function (b) {
        var e, c, a, d;
        for (e in b) {
            a = b[e];
            c = "get" + Ext.String.capitalize(e);
            if (!this[c]) {
                if (Ext.isString(b[e])) {
                    d = {
                        ref: e,
                        selector: a
                    }
                } else {
                    d = b[e]
                }
                this[c] = Ext.Function.pass(this.getRef, [e, d], this)
            }
            this.references = this.references || [];
            this.references.push(e.toLowerCase())
        }
    },
    getRef: function (d, e, a) {
        this.refCache = this.refCache || {};
        e = e || {};
        a = a || {};
        Ext.apply(e, a);
        if (e.forceCreate) {
            return Ext.ComponentManager.create(e, "component")
        }
        var c = this,
            b = c.refCache[d];
        if (!b) {
            c.refCache[d] = b = Ext.ComponentQuery.query(e.selector)[0];
            if (!b && e.autoCreate) {
                c.refCache[d] = b = Ext.ComponentManager.create(e, "component")
            }
            if (b) {
                b.on("destroy", function () {
                    c.refCache[d] = null
                })
            }
        }
        return b
    },
    hasRef: function (a) {
        return this.references && this.references.indexOf(a.toLowerCase()) !== -1
    },
    addRefs: Ext.emptyFn,
    addRoutes: Ext.emptyFn,
    addStores: Ext.emptyFn,
    addProfiles: Ext.emptyFn,
    addModels: Ext.emptyFn
}, function () {});
Ext.define("Kitchensink.controller.Main", {
    extend: "Ext.app.Controller",
    config: {
        viewCache: [],
        refs: {
            nav: "#mainNestedList",
            main: "mainview",
            toolbar: "#mainNavigationBar",
            sourceButton: "button[action=viewSource]",
            sourceOverlay: {
                selector: "sourceoverlay",
                xtype: "sourceoverlay",
                autoCreate: true
            }
        },
        control: {
            sourceButton: {
                tap: "onSourceTap"
            },
            nav: {
                itemtap: "onNavTap"
            }
        },
        routes: {
            "demo/:id": "showViewById",
            "menu/:id": "showMenuById"
        },
        currentDemo: undefined
    },
    showViewById: function (c) {
        var b = this.getNav(),
            a = b.getStore().getNodeById(c);
        this.showView(a);
        this.setCurrentDemo(a);
        this.hideSheets()
    },
    onSourceTap: function () {
        var a = this.getSourceOverlay(),
            b = this.getCurrentDemo();
        if (!a.getParent()) {
            Ext.Viewport.add(a)
        }
        a.show();
        a.setMasked({
            xtype: "loadmask",
            message: "Loading..."
        });
        if (b) {
            Ext.Ajax.request({
                url: "app/view/" + (b.get("view") || b.get("text")) + ".js",
                callback: function (d, e, c) {
                    a.setHtml(c.responseText);
                    a.unmask()
                }
            })
        }
    },
    createView: function (e) {
        var c = this.getViewCache(),
            g = c.length,
            b = 20,
            a, f, d;
        Ext.each(c, function (h) {
            if (h.viewName === e) {
                a = h;
                return
            }
        }, this);
        if (a) {
            return a
        }
        if (g >= b) {
            for (f = 0; f < g; f++) {
                d = c[f];
                if (!d.isPainted()) {
                    d.destroy();
                    c.splice(f, 1);
                    break
                }
            }
        }
        a = Ext.create(e);
        a.viewName = e;
        c.push(a);
        this.setViewCache(c);
        return a
    },
    getViewName: function (c) {
        var a = c.get("view") || c.get("text"),
            b = "Kitchensink.view.";
        if (a == "TouchEvents") {
            if (this.getApplication().getCurrentProfile().getName() === "Tablet") {
                return b + "tablet." + a
            } else {
                return b + "phone." + a
            }
        } else {
            return b + a
        }
    },
    hideSheets: function () {
        Ext.each(Ext.ComponentQuery.query("sheet"), function (a) {
            a.setHidden(true)
        })
    }
});
Ext.define("Kitchensink.controller.phone.Main", {
    extend: "Kitchensink.controller.Main",
    config: {
        refs: {
            touchEvents: "touchevents",
            consoleButton: "button[action=showConsole]"
        },
        control: {
            nav: {
                back: "onBackTap"
            },
            consoleButton: {
                tap: "showTouchEventConsole"
            }
        }
    },
    onNavTap: function (d, c, b) {
        var a = c.getStore().getAt(b);
        if (a.isLeaf()) {
            this.redirectTo(a)
        } else {
            this.getApplication().getHistory().add(Ext.create("Ext.app.Action", {
                url: "menu/" + a.get("id")
            }))
        }
    },
    showMenuById: function (d) {
        var c = this.getNav(),
            a = c.getStore(),
            b = d == "root" ? a.getRoot() : a.getNodeById(d);
        if (b) {
            c.goToNode(b);
            this.getToolbar().setTitle(b.get("text"));
            this.getSourceButton().setHidden(true);
            this.getSourceOverlay().setHidden(true);
            this.hideSheets()
        }
    },
    showView: function (d) {
        var g = this.getNav(),
            f = d.get("text"),
            b = this.createView(this.getViewName(d)),
            c = g.getLayout(),
            e = d.get("animation"),
            a = c.getAnimation();
        if (e) {
            c.setAnimation(e)
        }
        g.setDetailCard(b);
        g.goToNode(d.parentNode);
        g.goToLeaf(d);
        if (e) {
            c.setAnimation(a)
        }
        this.getToolbar().setTitle(f);
        this.getSourceButton().setHidden(false)
    },
    onBackTap: function (b, a) {
        if (a.isLeaf()) {
            this.getSourceButton().setHidden(true)
        }
        this.getApplication().getHistory().add(Ext.create("Ext.app.Action", {
            url: "menu/" + a.parentNode.get("id")
        }), true)
    },
    showTouchEventConsole: function (a) {
        this.getTouchEvents().showConsole()
    }
});
Ext.define("Kitchensink.controller.tablet.Main", {
    extend: "Kitchensink.controller.Main",
    onNavTap: function (d, c, b) {
        var a = c.getStore().getAt(b);
        if (a.isLeaf()) {
            this.redirectTo(a)
        }
    },
    showView: function (e) {
        var g = this.getNav(),
            c = this.createView(this.getViewName(e)),
            b = this.getMain(),
            f = e.get("animation"),
            d = b.getLayout(),
            a = d.getAnimation();
        if (f) {
            d.setAnimation(f)
        }
        g.setDetailContainer(b);
        g.setDetailCard(c);
        g.goToNode(e.parentNode);
        g.goToLeaf(e);
        g.getActiveItem().select(e);
        if (f) {
            d.setAnimation(a)
        }
        this.getToolbar().setTitle(e.get("text"));
        this.getSourceButton().setHidden(false);
        g.goToNode(e.parentNode);
        g.goToLeaf(e)
    },
    showMenuById: Ext.emptyFn
});
Ext.define("Ext.Evented", {
    alternateClassName: "Ext.EventedBase",
    mixins: ["Ext.mixin.Observable"],
    statics: {
        generateSetter: function (e) {
            var c = e.internal,
                b = e.apply,
                a = e.changeEvent,
                d = e.doSet;
            return function (h) {
                var j = this.initialized,
                    g = this[c],
                    f = this[b];
                if (f) {
                    h = f.call(this, h, g);
                    if (typeof h == "undefined") {
                        return this
                    }
                }
                if (h !== g) {
                    if (j) {
                        this.fireAction(a, [this, h, g], this.doSet, this, {
                            nameMap: e
                        })
                    } else {
                        this[c] = h;
                        this[d].call(this, h, g)
                    }
                }
                return this
            }
        }
    },
    initialized: false,
    constructor: function (a) {
        this.initialConfig = a;
        this.initialize()
    },
    initialize: function () {
        this.initConfig(this.initialConfig);
        this.initialized = true
    },
    doSet: function (c, d, b, a) {
        var e = a.nameMap;
        c[e.internal] = d;
        c[e.doSet].call(this, d, b)
    },
    onClassExtended: function (a, e) {
        if (!e.hasOwnProperty("eventedConfig")) {
            return
        }
        var d = Ext.Class,
            c = e.config,
            g = e.eventedConfig,
            b, f;
        e.config = (c) ? Ext.applyIf(c, g) : g;
        for (b in g) {
            if (g.hasOwnProperty(b)) {
                f = d.getConfigNameMap(b);
                e[f.set] = this.generateSetter(f)
            }
        }
    }
});
Ext.define("Ext.util.SizeMonitor", {
    extend: "Ext.Evented",
    config: {
        element: null,
        detectorCls: Ext.baseCSSPrefix + "size-change-detector",
        callback: Ext.emptyFn,
        scope: null,
        args: []
    },
    constructor: function (d) {
        this.initConfig(d);
        this.doFireSizeChangeEvent = Ext.Function.bind(this.doFireSizeChangeEvent, this);
        var g = this,
            e = this.getElement().dom,
            b = this.getDetectorCls(),
            c = Ext.Element.create({
                classList: [b, b + "-expand"],
                children: [{}]
            }, true),
            h = Ext.Element.create({
                classList: [b, b + "-shrink"],
                children: [{}]
            }, true),
            a = function (j) {
                g.onDetectorScroll("expand", j)
            },
            f = function (j) {
                g.onDetectorScroll("shrink", j)
            };
        e.appendChild(c);
        e.appendChild(h);
        c.addEventListener("scroll", a, true);
        h.addEventListener("scroll", f, true);
        this.detectors = {
            expand: c,
            shrink: h
        };
        this.position = {
            expand: {
                left: 0,
                top: 0
            },
            shrink: {
                left: 0,
                top: 0
            }
        };
        this.listeners = {
            expand: a,
            shrink: f
        };
        this.refresh()
    },
    applyElement: function (a) {
        if (a) {
            return Ext.get(a)
        }
    },
    refreshPosition: function (b) {
        var e = this.detectors[b],
            a = this.position[b],
            d, c;
        a.left = d = e.scrollWidth - e.offsetWidth;
        a.top = c = e.scrollHeight - e.offsetHeight;
        e.scrollLeft = d;
        e.scrollTop = c
    },
    refresh: function () {
        this.refreshPosition("expand");
        this.refreshPosition("shrink")
    },
    onDetectorScroll: function (b) {
        var c = this.detectors[b],
            a = this.position[b];
        if (c.scrollLeft !== a.left || c.scrollTop !== a.top) {
            this.refresh();
            this.fireSizeChangeEvent()
        }
    },
    fireSizeChangeEvent: function () {
        clearTimeout(this.sizeChangeThrottleTimer);
        this.sizeChangeThrottleTimer = setTimeout(this.doFireSizeChangeEvent, 1)
    },
    doFireSizeChangeEvent: function () {
        this.getCallback().apply(this.getScope(), this.getArgs())
    },
    destroyDetector: function (a) {
        var c = this.detectors[a],
            b = this.listeners[a];
        c.removeEventListener("scroll", b, true);
        Ext.removeNode(c)
    },
    destroy: function () {
        this.callParent(arguments);
        this.destroyDetector("expand");
        this.destroyDetector("shrink");
        delete this.listeners;
        delete this.detectors
    }
});
Ext.define("Ext.AbstractComponent", {
    extend: "Ext.Evented",
    onClassExtended: function (b, f) {
        if (!f.hasOwnProperty("cachedConfig")) {
            return
        }
        var g = b.prototype,
            c = f.config,
            e = f.cachedConfig,
            d = g.cachedConfigList,
            j = g.hasCachedConfig,
            a, h;
        delete f.cachedConfig;
        g.cachedConfigList = d = (d) ? d.slice() : [];
        g.hasCachedConfig = j = (j) ? Ext.Object.chain(j) : {};
        if (!c) {
            f.config = c = {}
        }
        for (a in e) {
            if (e.hasOwnProperty(a)) {
                h = e[a];
                if (!j[a]) {
                    j[a] = true;
                    d.push(a)
                }
                c[a] = h
            }
        }
    },
    getElementConfig: Ext.emptyFn,
    referenceAttributeName: "reference",
    referenceSelector: "[reference]",
    addReferenceNode: function (a, b) {
        Ext.Object.defineProperty(this, a, {
            get: function () {
                var c;
                delete this[a];
                this[a] = c = new Ext.Element(b);
                return c
            },
            configurable: true
        })
    },
    initElement: function () {
        var k = this.self.prototype,
            n = this.getId(),
            s = [],
            g = true,
            x = this.referenceAttributeName,
            p = false,
            e, v, b, o, t, d, l, c, f, j, w, m, a, q, h, y, u, r;
        if (k.hasOwnProperty("renderTemplate")) {
            e = this.renderTemplate.cloneNode(true);
            v = e.firstChild
        } else {
            g = false;
            p = true;
            e = document.createDocumentFragment();
            v = Ext.Element.create(this.getElementConfig(), true);
            e.appendChild(v)
        }
        o = e.querySelectorAll(this.referenceSelector);
        for (t = 0, d = o.length; t < d; t++) {
            l = o[t];
            c = l.getAttribute(x);
            if (g) {
                l.removeAttribute(x)
            }
            if (c == "element") {
                l.id = n;
                this.element = b = new Ext.Element(l)
            } else {
                this.addReferenceNode(c, l)
            }
            s.push(c)
        }
        this.referenceList = s;
        if (!this.innerElement) {
            this.innerElement = b
        }
        if (v === b.dom) {
            this.renderElement = b
        } else {
            this.addReferenceNode("renderElement", v)
        }
        if (p) {
            f = Ext.Class.configNameCache;
            j = this.config;
            w = this.cachedConfigList;
            m = this.initConfigList;
            a = this.initConfigMap;
            q = [];
            for (t = 0, d = w.length; t < d; t++) {
                y = w[t];
                u = f[y];
                if (a[y]) {
                    a[y] = false;
                    Ext.Array.remove(m, y)
                }
                if (j[y] !== null) {
                    q.push(y);
                    this[u.get] = this[u.initGet]
                }
            }
            for (t = 0, d = q.length; t < d; t++) {
                y = q[t];
                u = f[y];
                r = u.internal;
                this[r] = null;
                this[u.set].call(this, j[y]);
                delete this[u.get];
                k[r] = this[r]
            }
            v = this.renderElement.dom;
            k.renderTemplate = e = document.createDocumentFragment();
            e.appendChild(v.cloneNode(true));
            h = e.querySelectorAll("[id]");
            for (t = 0, d = h.length; t < d; t++) {
                b = h[t];
                b.removeAttribute("id")
            }
            for (t = 0, d = s.length; t < d; t++) {
                c = s[t];
                this[c].dom.removeAttribute("reference")
            }
        }
        return this
    }
});
Ext.define("Ext.util.LineSegment", {
    requires: ["Ext.util.Point"],
    constructor: function (b, a) {
        var c = Ext.util.Point;
        this.point1 = c.from(b);
        this.point2 = c.from(a)
    },
    intersects: function (m) {
        var p = this.point1,
            n = this.point2,
            j = m.point1,
            f = m.point2,
            c = p.x,
            b = n.x,
            a = j.x,
            r = f.x,
            q = p.y,
            o = n.y,
            l = j.y,
            h = f.y,
            g = (c - b) * (l - h) - (q - o) * (a - r),
            k, e;
        if (g == 0) {
            return null
        }
        k = ((a - r) * (c * o - q * b) - (c - b) * (a * h - l * r)) / g;
        e = ((l - h) * (c * o - q * b) - (q - o) * (a * h - l * r)) / g;
        if (k < Math.min(c, b) || k > Math.max(c, b) || k < Math.min(a, r) || k > Math.max(a, r) || e < Math.min(q, o) || e > Math.max(q, o) || e < Math.min(l, h) || e > Math.max(l, h)) {
            return null
        }
        return new Ext.util.Point(k, e)
    },
    toString: function () {
        return this.point1.toString() + " " + this.point2.toString()
    }
});
Ext.define("Ext.mixin.Selectable", {
    extend: "Ext.mixin.Mixin",
    mixinConfig: {
        id: "selectable",
        hooks: {
            updateStore: "updateStore"
        }
    },
    config: {
        disableSelection: null,
        mode: "SINGLE",
        allowDeselect: false,
        lastSelected: null,
        lastFocused: null,
        deselectOnContainerClick: true
    },
    modes: {
        SINGLE: true,
        SIMPLE: true,
        MULTI: true
    },
    selectableEventHooks: {
        addrecords: "onSelectionStoreAdd",
        removerecords: "onSelectionStoreRemove",
        updaterecord: "onSelectionStoreUpdate",
        load: "refreshSelection",
        refresh: "refreshSelection"
    },
    constructor: function () {
        this.selected = new Ext.util.MixedCollection();
        this.callParent(arguments)
    },
    applyMode: function (a) {
        a = a ? a.toUpperCase() : "SINGLE";
        return this.modes[a] ? a : "SINGLE"
    },
    updateStore: function (a, c) {
        var b = this,
            d = Ext.apply({}, b.selectableEventHooks, {
                scope: b
            });
        if (c && Ext.isObject(c) && c.isStore) {
            if (c.autoDestroy) {
                c.destroy()
            } else {
                c.un(d)
            }
        }
        if (a) {
            a.on(d);
            b.refreshSelection()
        }
    },
    selectAll: function (a) {
        var e = this,
            c = e.getStore().getRange(),
            d = c.length,
            b = 0;
        for (; b < d; b++) {
            e.select(c[b], true, a)
        }
    },
    deselectAll: function () {
        var d = this,
            b = d.getStore().getRange(),
            c = b.length,
            a = 0;
        for (; a < c; a++) {
            d.deselect(b[a])
        }
        d.selected.clear();
        d.setLastSelected(null);
        d.setLastFocused(null)
    },
    selectWithEvent: function (a) {
        var c = this,
            b = c.isSelected(a);
        switch (c.getMode()) {
        case "MULTI":
        case "SIMPLE":
            if (b) {
                c.deselect(a)
            } else {
                c.select(a, true)
            }
            break;
        case "SINGLE":
            if (c.getAllowDeselect() && b) {
                c.deselect(a)
            } else {
                c.select(a, false)
            }
            break
        }
    },
    selectRange: function (h, j, m, b) {
        var g = this,
            k = g.getStore(),
            l = k.indexOf(h),
            d = k.indexOf(j),
            c = 0,
            f, a, e;
        if (g.getDisableSelection()) {
            return
        }
        if (l > d) {
            f = d;
            d = l;
            l = f
        }
        for (e = l; e <= d; e++) {
            if (g.isSelected(k.getAt(e))) {
                c++
            }
        }
        if (!b) {
            a = -1
        } else {
            a = (b == "up") ? l : d
        }
        for (e = l; e <= d; e++) {
            if (c == (d - l + 1)) {
                if (e != a) {
                    g.deselect(e, true)
                }
            } else {
                g.select(e, true)
            }
        }
    },
    select: function (c, e, b) {
        var d = this,
            a;
        if (d.getDisableSelection()) {
            return
        }
        if (typeof c === "number") {
            c = [d.getStore().getAt(c)]
        }
        if (!c) {
            return
        }
        if (d.getMode() == "SINGLE" && c) {
            a = c.length ? c[0] : c;
            d.doSingleSelect(a, b)
        } else {
            d.doMultiSelect(c, e, b)
        }
    },
    doSingleSelect: function (a, b) {
        var d = this,
            c = d.selected;
        if (d.getDisableSelection()) {
            return
        }
        if (d.isSelected(a)) {
            return
        }
        if (c.getCount() > 0) {
            d.deselect(d.getLastSelected(), b)
        }
        c.add(a);
        d.setLastSelected(a);
        d.onItemSelect(a, b);
        d.setLastFocused(a);
        d.fireSelectionChange(!b)
    },
    doMultiSelect: function (a, j, h) {
        if (a === null || this.getDisableSelection()) {
            return
        }
        a = !Ext.isArray(a) ? [a] : a;
        var f = this,
            b = f.selected,
            e = a.length,
            g = false,
            c = 0,
            d;
        if (!j && b.getCount() > 0) {
            g = true;
            f.deselect(f.getSelection(), true)
        }
        for (; c < e; c++) {
            d = a[c];
            if (j && f.isSelected(d)) {
                continue
            }
            g = true;
            f.setLastSelected(d);
            b.add(d);
            if (!h) {
                f.setLastFocused(d)
            }
            f.onItemSelect(d, h)
        }
        this.fireSelectionChange(g && !h)
    },
    deselect: function (a, j) {
        var f = this;
        if (f.getDisableSelection()) {
            return
        }
        a = Ext.isArray(a) ? a : [a];
        var b = f.selected,
            g = false,
            c = 0,
            h = f.getStore(),
            e = a.length,
            d;
        for (; c < e; c++) {
            d = a[c];
            if (typeof d === "number") {
                d = h.getAt(d)
            }
            if (b.remove(d)) {
                if (f.getLastSelected() == d) {
                    f.setLastSelected(b.last())
                }
                g = true
            }
            if (d) {
                f.onItemDeselect(d, j)
            }
        }
        f.fireSelectionChange(g && !j)
    },
    updateLastFocused: function (b, a) {
        this.onLastFocusChanged(a, b)
    },
    fireSelectionChange: function (a) {
        var b = this;
        if (a) {
            b.fireEvent("selectionchange", b, b.getSelection())
        }
    },
    getSelection: function () {
        return this.selected.getRange()
    },
    isSelected: function (a) {
        a = Ext.isNumber(a) ? this.getStore().getAt(a) : a;
        return this.selected.indexOf(a) !== -1
    },
    hasSelection: function () {
        return this.selected.getCount() > 0
    },
    refreshSelection: function () {
        var f = this,
            a = [],
            e = f.getSelection(),
            d = e.length,
            b = 0,
            c, g;
        for (; b < d; b++) {
            c = e[b];
            if (f.getStore().indexOf(c) != -1) {
                a.push(c)
            }
        }
        if (f.selected.getCount() != a.length) {
            g = true
        }
        f.deselect(e, true);
        if (a.length) {
            f.select(a, false, true)
        }
        f.fireSelectionChange(g)
    },
    onSelectionStoreClear: function () {
        var b = this,
            a = b.selected;
        if (a.getCount() > 0) {
            a.clear();
            b.setLastSelected(null);
            b.setLastFocused(null);
            b.fireSelectionChange(true)
        }
    },
    onSelectionStoreRemove: function (b, a) {
        var d = this,
            c = d.selected;
        if (d.getDisableSelection()) {
            return
        }
        if (c.remove(a)) {
            if (d.getLastSelected() == a) {
                d.setLastSelected(null)
            }
            if (d.getLastFocused() == a) {
                d.setLastFocused(null)
            }
            d.fireSelectionChange(true)
        }
    },
    getSelectionCount: function () {
        return this.selected.getCount()
    },
    onSelectionStoreAdd: Ext.emptyFn,
    onSelectionStoreUpdate: Ext.emptyFn,
    onItemSelect: Ext.emptyFn,
    onItemDeselect: Ext.emptyFn,
    onLastFocusChanged: Ext.emptyFn,
    onEditorKey: Ext.emptyFn
}, function () {});
(function () {
    function b(d) {
        var c = Array.prototype.slice.call(arguments, 1);
        return d.replace(/\{(\d+)\}/g, function (e, f) {
            return c[f]
        })
    }
    Ext.DateExtras = {
        now: Date.now ||
        function () {
            return +new Date()
        },
        getElapsed: function (d, c) {
            return Math.abs(d - (c || new Date()))
        },
        useStrict: false,
        formatCodeToRegex: function (d, c) {
            var e = a.parseCodes[d];
            if (e) {
                e = typeof e == "function" ? e() : e;
                a.parseCodes[d] = e
            }
            return e ? Ext.applyIf({
                c: e.c ? b(e.c, c || "{0}") : e.c
            }, e) : {
                g: 0,
                c: null,
                s: Ext.String.escapeRegex(d)
            }
        },
        parseFunctions: {
            MS: function (d, c) {
                var e = new RegExp("\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/");
                var f = (d || "").match(e);
                return f ? new Date(((f[1] || "") + f[2]) * 1) : null
            }
        },
        parseRegexes: [],
        formatFunctions: {
            MS: function () {
                return "\\/Date(" + this.getTime() + ")\\/"
            }
        },
        y2kYear: 50,
        MILLI: "ms",
        SECOND: "s",
        MINUTE: "mi",
        HOUR: "h",
        DAY: "d",
        MONTH: "mo",
        YEAR: "y",
        defaults: {},
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthNumbers: {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11
        },
        defaultFormat: "m/d/Y",
        getShortMonthName: function (c) {
            return a.monthNames[c].substring(0, 3)
        },
        getShortDayName: function (c) {
            return a.dayNames[c].substring(0, 3)
        },
        getMonthNumber: function (c) {
            return a.monthNumbers[c.substring(0, 1).toUpperCase() + c.substring(1, 3).toLowerCase()]
        },
        formatCodes: {
            d: "Ext.String.leftPad(this.getDate(), 2, '0')",
            D: "Ext.Date.getShortDayName(this.getDay())",
            j: "this.getDate()",
            l: "Ext.Date.dayNames[this.getDay()]",
            N: "(this.getDay() ? this.getDay() : 7)",
            S: "Ext.Date.getSuffix(this)",
            w: "this.getDay()",
            z: "Ext.Date.getDayOfYear(this)",
            W: "Ext.String.leftPad(Ext.Date.getWeekOfYear(this), 2, '0')",
            F: "Ext.Date.monthNames[this.getMonth()]",
            m: "Ext.String.leftPad(this.getMonth() + 1, 2, '0')",
            M: "Ext.Date.getShortMonthName(this.getMonth())",
            n: "(this.getMonth() + 1)",
            t: "Ext.Date.getDaysInMonth(this)",
            L: "(Ext.Date.isLeapYear(this) ? 1 : 0)",
            o: "(this.getFullYear() + (Ext.Date.getWeekOfYear(this) == 1 && this.getMonth() > 0 ? +1 : (Ext.Date.getWeekOfYear(this) >= 52 && this.getMonth() < 11 ? -1 : 0)))",
            Y: "Ext.String.leftPad(this.getFullYear(), 4, '0')",
            y: "('' + this.getFullYear()).substring(2, 4)",
            a: "(this.getHours() < 12 ? 'am' : 'pm')",
            A: "(this.getHours() < 12 ? 'AM' : 'PM')",
            g: "((this.getHours() % 12) ? this.getHours() % 12 : 12)",
            G: "this.getHours()",
            h: "Ext.String.leftPad((this.getHours() % 12) ? this.getHours() % 12 : 12, 2, '0')",
            H: "Ext.String.leftPad(this.getHours(), 2, '0')",
            i: "Ext.String.leftPad(this.getMinutes(), 2, '0')",
            s: "Ext.String.leftPad(this.getSeconds(), 2, '0')",
            u: "Ext.String.leftPad(this.getMilliseconds(), 3, '0')",
            O: "Ext.Date.getGMTOffset(this)",
            P: "Ext.Date.getGMTOffset(this, true)",
            T: "Ext.Date.getTimezone(this)",
            Z: "(this.getTimezoneOffset() * -60)",
            c: function () {
                for (var j = "Y-m-dTH:i:sP", g = [], f = 0, d = j.length; f < d; ++f) {
                    var h = j.charAt(f);
                    g.push(h == "T" ? "'T'" : a.getFormatCode(h))
                }
                return g.join(" + ")
            },
            U: "Math.round(this.getTime() / 1000)"
        },
        isValid: function (n, c, l, j, f, g, e) {
            j = j || 0;
            f = f || 0;
            g = g || 0;
            e = e || 0;
            var k = a.add(new Date(n < 100 ? 100 : n, c - 1, l, j, f, g, e), a.YEAR, n < 100 ? n - 100 : 0);
            return n == k.getFullYear() && c == k.getMonth() + 1 && l == k.getDate() && j == k.getHours() && f == k.getMinutes() && g == k.getSeconds() && e == k.getMilliseconds()
        },
        parse: function (d, f, c) {
            var e = a.parseFunctions;
            if (e[f] == null) {
                a.createParser(f)
            }
            return e[f](d, Ext.isDefined(c) ? c : a.useStrict)
        },
        parseDate: function (d, e, c) {
            return a.parse(d, e, c)
        },
        getFormatCode: function (d) {
            var c = a.formatCodes[d];
            if (c) {
                c = typeof c == "function" ? c() : c;
                a.formatCodes[d] = c
            }
            return c || ("'" + Ext.String.escape(d) + "'")
        },
        createFormat: function (g) {
            var f = [],
                c = false,
                e = "";
            for (var d = 0; d < g.length; ++d) {
                e = g.charAt(d);
                if (!c && e == "\\") {
                    c = true
                } else {
                    if (c) {
                        c = false;
                        f.push("'" + Ext.String.escape(e) + "'")
                    } else {
                        f.push(a.getFormatCode(e))
                    }
                }
            }
            a.formatFunctions[g] = Ext.functionFactory("return " + f.join("+"))
        },
        createParser: (function () {
            var c = ["var dt, y, m, d, h, i, s, ms, o, z, zz, u, v,", "def = Ext.Date.defaults,", "results = String(input).match(Ext.Date.parseRegexes[{0}]);", "if(results){", "{1}", "if(u != null){", "v = new Date(u * 1000);", "}else{", "dt = Ext.Date.clearTime(new Date);", "y = Ext.Number.from(y, Ext.Number.from(def.y, dt.getFullYear()));", "m = Ext.Number.from(m, Ext.Number.from(def.m - 1, dt.getMonth()));", "d = Ext.Number.from(d, Ext.Number.from(def.d, dt.getDate()));", "h  = Ext.Number.from(h, Ext.Number.from(def.h, dt.getHours()));", "i  = Ext.Number.from(i, Ext.Number.from(def.i, dt.getMinutes()));", "s  = Ext.Number.from(s, Ext.Number.from(def.s, dt.getSeconds()));", "ms = Ext.Number.from(ms, Ext.Number.from(def.ms, dt.getMilliseconds()));", "if(z >= 0 && y >= 0){", "v = Ext.Date.add(new Date(y < 100 ? 100 : y, 0, 1, h, i, s, ms), Ext.Date.YEAR, y < 100 ? y - 100 : 0);", "v = !strict? v : (strict === true && (z <= 364 || (Ext.Date.isLeapYear(v) && z <= 365))? Ext.Date.add(v, Ext.Date.DAY, z) : null);", "}else if(strict === true && !Ext.Date.isValid(y, m + 1, d, h, i, s, ms)){", "v = null;", "}else{", "v = Ext.Date.add(new Date(y < 100 ? 100 : y, m, d, h, i, s, ms), Ext.Date.YEAR, y < 100 ? y - 100 : 0);", "}", "}", "}", "if(v){", "if(zz != null){", "v = Ext.Date.add(v, Ext.Date.SECOND, -v.getTimezoneOffset() * 60 - zz);", "}else if(o){", "v = Ext.Date.add(v, Ext.Date.MINUTE, -v.getTimezoneOffset() + (sn == '+'? -1 : 1) * (hr * 60 + mn));", "}", "}", "return v;"].join("\n");
            return function (l) {
                var e = a.parseRegexes.length,
                    m = 1,
                    f = [],
                    k = [],
                    j = false,
                    d = "";
                for (var h = 0; h < l.length; ++h) {
                    d = l.charAt(h);
                    if (!j && d == "\\") {
                        j = true
                    } else {
                        if (j) {
                            j = false;
                            k.push(Ext.String.escape(d))
                        } else {
                            var g = a.formatCodeToRegex(d, m);
                            m += g.g;
                            k.push(g.s);
                            if (g.g && g.c) {
                                f.push(g.c)
                            }
                        }
                    }
                }
                a.parseRegexes[e] = new RegExp("^" + k.join("") + "$", "i");
                a.parseFunctions[l] = Ext.functionFactory("input", "strict", b(c, e, f.join("")))
            }
        })(),
        parseCodes: {
            d: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
            },
            j: {
                g: 1,
                c: "d = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,2})"
            },
            D: function () {
                for (var c = [], d = 0; d < 7; c.push(a.getShortDayName(d)), ++d) {}
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + c.join("|") + ")"
                }
            },
            l: function () {
                return {
                    g: 0,
                    c: null,
                    s: "(?:" + a.dayNames.join("|") + ")"
                }
            },
            N: {
                g: 0,
                c: null,
                s: "[1-7]"
            },
            S: {
                g: 0,
                c: null,
                s: "(?:st|nd|rd|th)"
            },
            w: {
                g: 0,
                c: null,
                s: "[0-6]"
            },
            z: {
                g: 1,
                c: "z = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,3})"
            },
            W: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
            },
            F: function () {
                return {
                    g: 1,
                    c: "m = parseInt(Ext.Date.getMonthNumber(results[{0}]), 10);\n",
                    s: "(" + a.monthNames.join("|") + ")"
                }
            },
            M: function () {
                for (var c = [], d = 0; d < 12; c.push(a.getShortMonthName(d)), ++d) {}
                return Ext.applyIf({
                    s: "(" + c.join("|") + ")"
                }, a.formatCodeToRegex("F"))
            },
            m: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(\\d{2})"
            },
            n: {
                g: 1,
                c: "m = parseInt(results[{0}], 10) - 1;\n",
                s: "(\\d{1,2})"
            },
            t: {
                g: 0,
                c: null,
                s: "(?:\\d{2})"
            },
            L: {
                g: 0,
                c: null,
                s: "(?:1|0)"
            },
            o: function () {
                return a.formatCodeToRegex("Y")
            },
            Y: {
                g: 1,
                c: "y = parseInt(results[{0}], 10);\n",
                s: "(\\d{4})"
            },
            y: {
                g: 1,
                c: "var ty = parseInt(results[{0}], 10);\ny = ty > Ext.Date.y2kYear ? 1900 + ty : 2000 + ty;\n",
                s: "(\\d{1,2})"
            },
            a: {
                g: 1,
                c: "if (/(am)/i.test(results[{0}])) {\nif (!h || h == 12) { h = 0; }\n} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(am|pm|AM|PM)"
            },
            A: {
                g: 1,
                c: "if (/(am)/i.test(results[{0}])) {\nif (!h || h == 12) { h = 0; }\n} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
                s: "(AM|PM|am|pm)"
            },
            g: function () {
                return a.formatCodeToRegex("G")
            },
            G: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(\\d{1,2})"
            },
            h: function () {
                return a.formatCodeToRegex("H")
            },
            H: {
                g: 1,
                c: "h = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
            },
            i: {
                g: 1,
                c: "i = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
            },
            s: {
                g: 1,
                c: "s = parseInt(results[{0}], 10);\n",
                s: "(\\d{2})"
            },
            u: {
                g: 1,
                c: "ms = results[{0}]; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n",
                s: "(\\d+)"
            },
            O: {
                g: 1,
                c: ["o = results[{0}];", "var sn = o.substring(0,1),", "hr = o.substring(1,3)*1 + Math.floor(o.substring(3,5) / 60),", "mn = o.substring(3,5) % 60;", "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n"].join("\n"),
                s: "([+-]\\d{4})"
            },
            P: {
                g: 1,
                c: ["o = results[{0}];", "var sn = o.substring(0,1),", "hr = o.substring(1,3)*1 + Math.floor(o.substring(4,6) / 60),", "mn = o.substring(4,6) % 60;", "o = ((-12 <= (hr*60 + mn)/60) && ((hr*60 + mn)/60 <= 14))? (sn + Ext.String.leftPad(hr, 2, '0') + Ext.String.leftPad(mn, 2, '0')) : null;\n"].join("\n"),
                s: "([+-]\\d{2}:\\d{2})"
            },
            T: {
                g: 0,
                c: null,
                s: "[A-Z]{1,4}"
            },
            Z: {
                g: 1,
                c: "zz = results[{0}] * 1;\nzz = (-43200 <= zz && zz <= 50400)? zz : null;\n",
                s: "([+-]?\\d{1,5})"
            },
            c: function () {
                var e = [],
                    c = [a.formatCodeToRegex("Y", 1), a.formatCodeToRegex("m", 2), a.formatCodeToRegex("d", 3), a.formatCodeToRegex("h", 4), a.formatCodeToRegex("i", 5), a.formatCodeToRegex("s", 6),
                    {
                        c: "ms = results[7] || '0'; ms = parseInt(ms, 10)/Math.pow(10, ms.length - 3);\n"
                    }, {
                        c: ["if(results[8]) {", "if(results[8] == 'Z'){", "zz = 0;", "}else if (results[8].indexOf(':') > -1){", a.formatCodeToRegex("P", 8).c, "}else{", a.formatCodeToRegex("O", 8).c, "}", "}"].join("\n")
                    }];
                for (var f = 0, d = c.length; f < d; ++f) {
                    e.push(c[f].c)
                }
                return {
                    g: 1,
                    c: e.join(""),
                    s: [c[0].s, "(?:", "-", c[1].s, "(?:", "-", c[2].s, "(?:", "(?:T| )?", c[3].s, ":", c[4].s, "(?::", c[5].s, ")?", "(?:(?:\\.|,)(\\d+))?", "(Z|(?:[-+]\\d{2}(?::)?\\d{2}))?", ")?", ")?", ")?"].join("")
                }
            },
            U: {
                g: 1,
                c: "u = parseInt(results[{0}], 10);\n",
                s: "(-?\\d+)"
            }
        },
        dateFormat: function (c, d) {
            return a.format(c, d)
        },
        format: function (d, e) {
            if (a.formatFunctions[e] == null) {
                a.createFormat(e)
            }
            var c = a.formatFunctions[e].call(d);
            return c + ""
        },
        getTimezone: function (c) {
            return c.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "")
        },
        getGMTOffset: function (c, d) {
            var e = c.getTimezoneOffset();
            return (e > 0 ? "-" : "+") + Ext.String.leftPad(Math.floor(Math.abs(e) / 60), 2, "0") + (d ? ":" : "") + Ext.String.leftPad(Math.abs(e % 60), 2, "0")
        },
        getDayOfYear: function (f) {
            var e = 0,
                h = Ext.Date.clone(f),
                c = f.getMonth(),
                g;
            for (g = 0, h.setDate(1), h.setMonth(0); g < c; h.setMonth(++g)) {
                e += a.getDaysInMonth(h)
            }
            return e + f.getDate() - 1
        },
        getWeekOfYear: (function () {
            var c = 86400000,
                d = 7 * c;
            return function (f) {
                var g = Date.UTC(f.getFullYear(), f.getMonth(), f.getDate() + 3) / c,
                    e = Math.floor(g / 7),
                    h = new Date(e * d).getUTCFullYear();
                return e - Math.floor(Date.UTC(h, 0, 7) / d) + 1
            }
        })(),
        isLeapYear: function (c) {
            var d = c.getFullYear();
            return !!((d & 3) == 0 && (d % 100 || (d % 400 == 0 && d)))
        },
        getFirstDayOfMonth: function (d) {
            var c = (d.getDay() - (d.getDate() - 1)) % 7;
            return (c < 0) ? (c + 7) : c
        },
        getLastDayOfMonth: function (c) {
            return a.getLastDateOfMonth(c).getDay()
        },
        getFirstDateOfMonth: function (c) {
            return new Date(c.getFullYear(), c.getMonth(), 1)
        },
        getLastDateOfMonth: function (c) {
            return new Date(c.getFullYear(), c.getMonth(), a.getDaysInMonth(c))
        },
        getDaysInMonth: (function () {
            var c = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return function (e) {
                var d = e.getMonth();
                return d == 1 && a.isLeapYear(e) ? 29 : c[d]
            }
        })(),
        getSuffix: function (c) {
            switch (c.getDate()) {
            case 1:
            case 21:
            case 31:
                return "st";
            case 2:
            case 22:
                return "nd";
            case 3:
            case 23:
                return "rd";
            default:
                return "th"
            }
        },
        clone: function (c) {
            return new Date(c.getTime())
        },
        isDST: function (c) {
            return new Date(c.getFullYear(), 0, 1).getTimezoneOffset() != c.getTimezoneOffset()
        },
        clearTime: function (e, j) {
            if (j) {
                return Ext.Date.clearTime(Ext.Date.clone(e))
            }
            var g = e.getDate();
            e.setHours(0);
            e.setMinutes(0);
            e.setSeconds(0);
            e.setMilliseconds(0);
            if (e.getDate() != g) {
                for (var f = 1, h = a.add(e, Ext.Date.HOUR, f); h.getDate() != g; f++, h = a.add(e, Ext.Date.HOUR, f)) {}
                e.setDate(g);
                e.setHours(h.getHours())
            }
            return e
        },
        add: function (g, f, h) {
            var j = Ext.Date.clone(g),
                c = Ext.Date;
            if (!f || h === 0) {
                return j
            }
            switch (f.toLowerCase()) {
            case Ext.Date.MILLI:
                j.setMilliseconds(j.getMilliseconds() + h);
                break;
            case Ext.Date.SECOND:
                j.setSeconds(j.getSeconds() + h);
                break;
            case Ext.Date.MINUTE:
                j.setMinutes(j.getMinutes() + h);
                break;
            case Ext.Date.HOUR:
                j.setHours(j.getHours() + h);
                break;
            case Ext.Date.DAY:
                j.setDate(j.getDate() + h);
                break;
            case Ext.Date.MONTH:
                var e = g.getDate();
                if (e > 28) {
                    e = Math.min(e, Ext.Date.getLastDateOfMonth(Ext.Date.add(Ext.Date.getFirstDateOfMonth(g), "mo", h)).getDate())
                }
                j.setDate(e);
                j.setMonth(g.getMonth() + h);
                break;
            case Ext.Date.YEAR:
                j.setFullYear(g.getFullYear() + h);
                break
            }
            return j
        },
        between: function (d, f, c) {
            var e = d.getTime();
            return f.getTime() <= e && e <= c.getTime()
        }
    };
    var a = Ext.DateExtras;
    Ext.apply(Ext.Date, a)
})();
Ext.define("Ext.util.Format", {
    requires: ["Ext.DateExtras"],
    singleton: true,
    defaultDateFormat: "m/d/Y",
    escapeRe: /('|\\)/g,
    trimRe: /^[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+|[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000]+$/g,
    formatRe: /\{(\d+)\}/g,
    escapeRegexRe: /([-.*+?^${}()|[\]\/\\])/g,
    ellipsis: function (c, a, d) {
        if (c && c.length > a) {
            if (d) {
                var e = c.substr(0, a - 2),
                    b = Math.max(e.lastIndexOf(" "), e.lastIndexOf("."), e.lastIndexOf("!"), e.lastIndexOf("?"));
                if (b != -1 && b >= (a - 15)) {
                    return e.substr(0, b) + "..."
                }
            }
            return c.substr(0, a - 3) + "..."
        }
        return c
    },
    escapeRegex: function (a) {
        return a.replace(Ext.util.Format.escapeRegexRe, "\\$1")
    },
    escape: function (a) {
        return a.replace(Ext.util.Format.escapeRe, "\\$1")
    },
    toggle: function (b, c, a) {
        return b == c ? a : c
    },
    trim: function (a) {
        return a.replace(Ext.util.Format.trimRe, "")
    },
    leftPad: function (d, b, c) {
        var a = String(d);
        c = c || " ";
        while (a.length < b) {
            a = c + a
        }
        return a
    },
    format: function (b) {
        var a = Ext.toArray(arguments, 1);
        return b.replace(Ext.util.Format.formatRe, function (c, d) {
            return a[d]
        })
    },
    htmlEncode: function (a) {
        return !a ? a : String(a).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;")
    },
    htmlDecode: function (a) {
        return !a ? a : String(a).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    },
    date: function (a, c) {
        var b = a;
        if (!a) {
            return ""
        }
        if (!Ext.isDate(a)) {
            b = new Date(Date.parse(a));
            if (isNaN(b)) {
                a = new Date(Date.parse(a.replace(/-/g, "/")));
                if (isNaN(a)) {
                    Ext.Logger.error("Cannot parse the passed value into a valid date")
                }
            } else {
                a = b
            }
        }
        return Ext.Date.format(a, c || Ext.util.Format.defaultDateFormat)
    }
});
Ext.define("Ext.Template", {
    requires: ["Ext.dom.Helper", "Ext.util.Format"],
    inheritableStatics: {
        from: function (b, a) {
            b = Ext.getDom(b);
            return new this(b.value || b.innerHTML, a || "")
        }
    },
    constructor: function (d) {
        var f = this,
            b = arguments,
            a = [],
            c = 0,
            e = b.length,
            g;
        f.initialConfig = {};
        if (e > 1) {
            for (; c < e; c++) {
                g = b[c];
                if (typeof g == "object") {
                    Ext.apply(f.initialConfig, g);
                    Ext.apply(f, g)
                } else {
                    a.push(g)
                }
            }
            d = a.join("")
        } else {
            if (Ext.isArray(d)) {
                a.push(d.join(""))
            } else {
                a.push(d)
            }
        }
        f.html = a.join("");
        if (f.compiled) {
            f.compile()
        }
    },
    isTemplate: true,
    disableFormats: false,
    re: /\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
    apply: function (a) {
        var g = this,
            d = g.disableFormats !== true,
            f = Ext.util.Format,
            c = g,
            b;
        if (g.compiled) {
            return g.compiled(a).join("")
        }
        function e(h, k, l, j) {
            if (l && d) {
                if (j) {
                    j = [a[k]].concat(Ext.functionFactory("return [" + j + "];")())
                } else {
                    j = [a[k]]
                }
                if (l.substr(0, 5) == "this.") {
                    return c[l.substr(5)].apply(c, j)
                } else {
                    return f[l].apply(f, j)
                }
            } else {
                return a[k] !== undefined ? a[k] : ""
            }
        }
        b = g.html.replace(g.re, e);
        return b
    },
    applyOut: function (a, b) {
        var c = this;
        if (c.compiled) {
            b.push.apply(b, c.compiled(a))
        } else {
            b.push(c.apply(a))
        }
        return b
    },
    applyTemplate: function () {
        return this.apply.apply(this, arguments)
    },
    set: function (a, c) {
        var b = this;
        b.html = a;
        b.compiled = null;
        return c ? b.compile() : b
    },
    compileARe: /\\/g,
    compileBRe: /(\r\n|\n)/g,
    compileCRe: /'/g,
    compile: function () {
        var me = this,
            fm = Ext.util.Format,
            useFormat = me.disableFormats !== true,
            body, bodyReturn;

        function fn(m, name, format, args) {
            if (format && useFormat) {
                args = args ? "," + args : "";
                if (format.substr(0, 5) != "this.") {
                    format = "fm." + format + "("
                } else {
                    format = "this." + format.substr(5) + "("
                }
            } else {
                args = "";
                format = "(values['" + name + "'] == undefined ? '' : "
            }
            return "'," + format + "values['" + name + "']" + args + ") ,'"
        }
        bodyReturn = me.html.replace(me.compileARe, "\\\\").replace(me.compileBRe, "\\n").replace(me.compileCRe, "\\'").replace(me.re, fn);
        body = "this.compiled = function(values){ return ['" + bodyReturn + "'];};";
        eval(body);
        return me
    },
    insertFirst: function (b, a, c) {
        return this.doInsert("afterBegin", b, a, c)
    },
    insertBefore: function (b, a, c) {
        return this.doInsert("beforeBegin", b, a, c)
    },
    insertAfter: function (b, a, c) {
        return this.doInsert("afterEnd", b, a, c)
    },
    append: function (b, a, c) {
        return this.doInsert("beforeEnd", b, a, c)
    },
    doInsert: function (c, e, b, a) {
        e = Ext.getDom(e);
        var d = Ext.DomHelper.insertHtml(c, e, this.apply(b));
        return a ? Ext.get(d, true) : d
    },
    overwrite: function (b, a, c) {
        b = Ext.getDom(b);
        b.innerHTML = this.apply(a);
        return c ? Ext.get(b.firstChild, true) : b.firstChild
    }
});
Ext.define("Ext.XTemplate", {
    extend: "Ext.Template",
    requires: "Ext.XTemplateCompiler",
    apply: function (a) {
        return this.applyOut(a, []).join("")
    },
    applyOut: function (a, b) {
        var d = this,
            c;
        if (!d.fn) {
            c = new Ext.XTemplateCompiler({
                useFormat: d.disableFormats !== true
            });
            d.fn = c.compile(d.html)
        }
        try {
            d.fn.call(d, b, a, {}, 1, 1)
        } catch (f) {}
        return b
    },
    compile: function () {
        return this
    },
    statics: {
        getTpl: function (a, c) {
            var b = a[c],
                d;
            if (b && !b.isTemplate) {
                b = Ext.ClassManager.dynInstantiate("Ext.XTemplate", b);
                if (a.hasOwnProperty(c)) {
                    a[c] = b
                } else {
                    for (d = a.self.prototype; d; d = d.superclass) {
                        if (d.hasOwnProperty(c)) {
                            d[c] = b;
                            break
                        }
                    }
                }
            }
            return b || null
        }
    }
});
Ext.define("Ext.mixin.Sortable", {
    extend: "Ext.mixin.Mixin",
    requires: ["Ext.util.Sorter"],
    mixinConfig: {
        id: "sortable"
    },
    config: {
        sorters: null,
        defaultSortDirection: "ASC",
        sortRoot: null
    },
    dirtySortFn: false,
    sortFn: null,
    sorted: false,
    applySorters: function (a, b) {
        if (!b) {
            b = this.createSortersCollection()
        }
        b.clear();
        this.sorted = false;
        if (a) {
            this.addSorters(a)
        }
        return b
    },
    createSortersCollection: function () {
        this._sorters = Ext.create("Ext.util.Collection", function (a) {
            return a.getId()
        });
        return this._sorters
    },
    addSorter: function (b, a) {
        this.addSorters([b], a)
    },
    addSorters: function (c, a) {
        var b = this.getSorters();
        return this.insertSorters(b ? b.length : 0, c, a)
    },
    insertSorter: function (a, c, b) {
        return this.insertSorters(a, [c], b)
    },
    insertSorters: function (e, h, a) {
        if (!Ext.isArray(h)) {
            h = [h]
        }
        var f = h.length,
            j = a || this.getDefaultSortDirection(),
            c = this.getSortRoot(),
            k = this.getSorters(),
            l = [],
            g, b, m, d;
        if (!k) {
            k = this.createSortersCollection()
        }
        for (b = 0; b < f; b++) {
            m = h[b];
            g = {
                direction: j,
                root: c
            };
            if (typeof m === "string") {
                d = k.get(m);
                if (!d) {
                    g.property = m
                } else {
                    if (a !== undefined) {
                        d.setDirection(a)
                    } else {
                        d.toggle()
                    }
                    continue
                }
            } else {
                if (Ext.isFunction(m)) {
                    g.sorterFn = m
                } else {
                    if (Ext.isObject(m)) {
                        if (!m.isSorter) {
                            if (m.fn) {
                                m.sorterFn = m.fn;
                                delete m.fn
                            }
                            g = Ext.apply(g, m)
                        } else {
                            l.push(m);
                            if (!m.getRoot()) {
                                m.setRoot(c)
                            }
                            continue
                        }
                    }
                }
            }
            m = Ext.create("Ext.util.Sorter", g);
            l.push(m)
        }
        for (b = 0, f = l.length; b < f; b++) {
            k.insert(e + b, l[b])
        }
        this.dirtySortFn = true;
        if (k.length) {
            this.sorted = true
        }
        return k
    },
    removeSorter: function (a) {
        return this.removeSorters([a])
    },
    removeSorters: function (d) {
        if (!Ext.isArray(d)) {
            d = [d]
        }
        var b = d.length,
            c = this.getSorters(),
            a, e;
        for (a = 0; a < b; a++) {
            e = d[a];
            if (typeof e === "string") {
                c.removeAtKey(e)
            } else {
                if (typeof e === "function") {
                    c.each(function (f) {
                        if (f.getSorterFn() === e) {
                            c.remove(f)
                        }
                    })
                } else {
                    if (e.isSorter) {
                        c.remove(e)
                    }
                }
            }
        }
        if (!c.length) {
            this.sorted = false
        }
    },
    updateSortFn: function () {
        var a = this.getSorters().items;
        this.sortFn = function (d, c) {
            var f = a.length,
                b, e;
            for (e = 0; e < f; e++) {
                b = a[e].sort.call(this, d, c);
                if (b !== 0) {
                    break
                }
            }
            return b
        };
        this.dirtySortFn = false;
        return this.sortFn
    },
    getSortFn: function () {
        if (this.dirtySortFn) {
            return this.updateSortFn()
        }
        return this.sortFn
    },
    sort: function (a) {
        Ext.Array.sort(a, this.getSortFn());
        return a
    },
    findInsertionIndex: function (b, e, g) {
        var h = 0,
            a = b.length - 1,
            d = g || this.getSortFn(),
            c, f;
        while (h <= a) {
            c = (h + a) >> 1;
            f = d(e, b[c]);
            if (f >= 0) {
                h = c + 1
            } else {
                if (f < 0) {
                    a = c - 1
                }
            }
        }
        return h
    }
});
Ext.define("Ext.mixin.Filterable", {
    extend: "Ext.mixin.Mixin",
    requires: ["Ext.util.Filter"],
    mixinConfig: {
        id: "filterable"
    },
    config: {
        filters: null,
        filterRoot: null
    },
    dirtyFilterFn: false,
    filterFn: null,
    filtered: false,
    applyFilters: function (a, b) {
        if (!b) {
            b = this.createFiltersCollection()
        }
        b.clear();
        this.filtered = false;
        this.dirtyFilterFn = true;
        if (a) {
            this.addFilters(a)
        }
        return b
    },
    createFiltersCollection: function () {
        this._filters = Ext.create("Ext.util.Collection", function (a) {
            return a.getId()
        });
        return this._filters
    },
    addFilter: function (a) {
        this.addFilters([a])
    },
    addFilters: function (b) {
        var a = this.getFilters();
        return this.insertFilters(a ? a.length : 0, b)
    },
    insertFilter: function (a, b) {
        return this.insertFilters(a, [b])
    },
    insertFilters: function (h, c) {
        if (!Ext.isArray(c)) {
            c = [c]
        }
        var j = c.length,
            a = this.getFilterRoot(),
            d = this.getFilters(),
            e = [],
            f, g, b;
        if (!d) {
            d = this.createFiltersCollection()
        }
        for (g = 0; g < j; g++) {
            b = c[g];
            f = {
                root: a
            };
            if (Ext.isFunction(b)) {
                f.filterFn = b
            } else {
                if (Ext.isObject(b)) {
                    if (!b.isFilter) {
                        if (b.fn) {
                            b.filterFn = b.fn;
                            delete b.fn
                        }
                        f = Ext.apply(f, b)
                    } else {
                        e.push(b);
                        if (!b.getRoot()) {
                            b.setRoot(a)
                        }
                        continue
                    }
                }
            }
            b = Ext.create("Ext.util.Filter", f);
            e.push(b)
        }
        for (g = 0, j = e.length; g < j; g++) {
            d.insert(h + g, e[g])
        }
        this.dirtyFilterFn = true;
        if (d.length) {
            this.filtered = true
        }
        return d
    },
    removeFilters: function (e) {
        if (!Ext.isArray(e)) {
            e = [e]
        }
        var d = e.length,
            c = this.getFilters(),
            a, b;
        for (a = 0; a < d; a++) {
            b = e[a];
            if (typeof b === "string") {
                c.each(function (f) {
                    if (f.getProperty() === b) {
                        c.remove(f)
                    }
                })
            } else {
                if (typeof b === "function") {
                    c.each(function (f) {
                        if (f.getFilterFn() === b) {
                            c.remove(f)
                        }
                    })
                } else {
                    if (b.isFilter) {
                        c.remove(b)
                    } else {
                        if (b.property !== undefined && b.value !== undefined) {
                            c.each(function (f) {
                                if (f.getProperty() === b.property && f.getValue() === b.value) {
                                    c.remove(f)
                                }
                            })
                        }
                    }
                }
            }
        }
        if (!c.length) {
            this.filtered = false
        }
    },
    updateFilterFn: function () {
        var a = this.getFilters().items;
        this.filterFn = function (h) {
            var f = true,
                g = a.length,
                b;
            for (b = 0; b < g; b++) {
                var e = a[b],
                    d = e.getFilterFn(),
                    c = e.getScope() || this;
                f = f && d.call(c, h)
            }
            return f
        };
        this.dirtyFilterFn = false;
        return this.filterFn
    },
    filter: function (a) {
        return this.getFilters().length ? Ext.Array.filter(a, this.getFilterFn()) : a
    },
    isFiltered: function (a) {
        return this.getFilters().length ? !this.getFilterFn()(a) : false
    },
    getFilterFn: function () {
        if (this.dirtyFilterFn) {
            return this.updateFilterFn()
        }
        return this.filterFn
    }
});
Ext.define("Ext.util.Collection", {
    config: {
        autoFilter: true,
        autoSort: true
    },
    mixins: {
        sortable: "Ext.mixin.Sortable",
        filterable: "Ext.mixin.Filterable"
    },
    constructor: function (b, a) {
        var c = this;
        c.all = [];
        c.items = [];
        c.keys = [];
        c.indices = {};
        c.map = {};
        c.length = 0;
        if (b) {
            c.getKey = b
        }
        this.initConfig(a)
    },
    updateAutoSort: function (a, b) {
        if (b === false && a && this.items.length) {
            this.sort()
        }
    },
    updateAutoFilter: function (b, a) {
        if (a === false && b && this.all.length) {
            this.runFilters()
        }
    },
    insertSorters: function () {
        this.mixins.sortable.insertSorters.apply(this, arguments);
        if (this.getAutoSort() && this.items.length) {
            this.sort()
        }
        return this
    },
    removeSorters: function (a) {
        this.mixins.sortable.removeSorters.call(this, a);
        if (this.sorted && this.getAutoSort() && this.item.length) {
            this.sort()
        }
        return this
    },
    applyFilters: function (a) {
        var b = this.mixins.filterable.applyFilters.call(this, a);
        if (!a && this.all.length && this.getAutoFilter()) {
            this.filter()
        }
        return b
    },
    addFilters: function (a) {
        this.mixins.filterable.addFilters.call(this, a);
        if (this.items.length && this.getAutoFilter()) {
            this.runFilters()
        }
        return this
    },
    removeFilters: function (a) {
        this.mixins.filterable.removeFilters.call(this, a);
        if (this.filtered && this.all.length && this.getAutoFilter()) {
            this.filter()
        }
        return this
    },
    filter: function (c, b, d, a) {
        if (c) {
            if (Ext.isString(c)) {
                this.addFilters({
                    property: c,
                    value: b,
                    anyMatch: d,
                    caseSensitive: a
                });
                return this.items
            } else {
                this.addFilters(c);
                return this.items
            }
        }
        this.items = this.mixins.filterable.filter.call(this, this.all.slice());
        this.updateAfterFilter();
        if (this.sorted && this.getAutoSort()) {
            this.sort()
        }
    },
    runFilters: function () {
        this.items = this.mixins.filterable.filter.call(this, this.items);
        this.updateAfterFilter()
    },
    updateAfterFilter: function () {
        var a = this.items,
            f = this.keys,
            g = this.indices = {},
            e = a.length,
            c, d, b;
        f.length = 0;
        for (c = 0; c < e; c++) {
            d = a[c];
            b = this.getKey(d);
            g[b] = c;
            f[c] = b
        }
        this.length = a.length;
        this.dirtyIndices = false
    },
    sort: function (e, a) {
        var d = this.items,
            h = this.keys,
            g = this.indices,
            c = d.length,
            b, j, f;
        if (e) {
            this.addSorters(e, a);
            return this.items
        }
        for (b = 0; b < c; b++) {
            d[b]._current_key = h[b]
        }
        this.handleSort(d);
        for (b = 0; b < c; b++) {
            j = d[b];
            f = j._current_key;
            h[b] = f;
            g[f] = b;
            delete j._current_key
        }
        this.dirtyIndices = true
    },
    handleSort: function (a) {
        this.mixins.sortable.sort.call(this, a)
    },
    add: function (j, l) {
        var g = this,
            d = this.filtered,
            e = this.sorted,
            h = this.all,
            f = this.items,
            m = this.keys,
            k = this.indices,
            a = this.mixins.filterable,
            b = f.length,
            c = b;
        if (arguments.length == 1) {
            l = j;
            j = g.getKey(l)
        }
        if (typeof j != "undefined" && j !== null) {
            if (typeof g.map[j] != "undefined") {
                return g.replace(j, l)
            }
            g.map[j] = l
        }
        h.push(l);
        if (d && this.getAutoFilter() && a.isFiltered.call(g, l)) {
            return null
        }
        g.length++;
        if (e && this.getAutoSort()) {
            c = this.findInsertionIndex(f, l)
        }
        if (c !== b) {
            this.dirtyIndices = true;
            Ext.Array.splice(m, c, 0, j);
            Ext.Array.splice(f, c, 0, l)
        } else {
            k[j] = b;
            m.push(j);
            f.push(l)
        }
        return l
    },
    getKey: function (a) {
        return a.id
    },
    replace: function (d, n) {
        var j = this,
            g = j.sorted,
            f = j.filtered,
            b = j.mixins.filterable,
            h = j.items,
            o = j.keys,
            l = j.all,
            c = j.map,
            m = null,
            a = h.length,
            p, e, k;
        if (arguments.length == 1) {
            n = d;
            d = k = j.getKey(n)
        } else {
            k = j.getKey(n)
        }
        p = c[d];
        if (typeof d == "undefined" || d === null || typeof p == "undefined") {
            return j.add(k, n)
        }
        j.map[k] = n;
        if (k !== d) {
            delete j.map[d]
        }
        if (g && j.getAutoSort()) {
            Ext.Array.remove(h, p);
            Ext.Array.remove(o, d);
            Ext.Array.remove(l, p);
            l.push(n);
            j.dirtyIndices = true;
            if (f && j.getAutoFilter()) {
                if (b.isFiltered.call(j, n)) {
                    if (a !== h.length) {
                        j.length--
                    }
                    return null
                } else {
                    if (a === h.length) {
                        j.length++;
                        m = n
                    }
                }
            }
            e = this.findInsertionIndex(h, n);
            Ext.Array.splice(o, e, 0, k);
            Ext.Array.splice(h, e, 0, n)
        } else {
            if (f) {
                if (j.getAutoFilter() && b.isFiltered.call(j, n)) {
                    if (h.indexOf(p) !== -1) {
                        Ext.Array.remove(h, p);
                        Ext.Array.remove(o, d);
                        j.length--;
                        j.dirtyIndices = true
                    }
                    return null
                } else {
                    if (h.indexOf(p) === -1) {
                        h.push(n);
                        o.push(k);
                        j.indices[k] = j.length;
                        j.length++;
                        return n
                    }
                }
            }
            e = j.indexOfKey(d);
            o[e] = k;
            h[e] = n;
            this.dirtyIndices = true
        }
        return m
    },
    addAll: function (h) {
        var q = this,
            e = q.filtered,
            a = q.sorted,
            b = q.all,
            k = q.items,
            j = q.keys,
            p = q.map,
            l = q.getAutoFilter(),
            m = q.getAutoSort(),
            r = [],
            f = [],
            c = q.mixins.filterable,
            d = [],
            g, s, n, o;
        if (Ext.isObject(h)) {
            for (s in h) {
                if (h.hasOwnProperty(s)) {
                    f.push(k[s]);
                    r.push(s)
                }
            }
        } else {
            f = h;
            g = h.length;
            for (n = 0; n < g; n++) {
                r.push(q.getKey(h[n]))
            }
        }
        for (n = 0; n < g; n++) {
            s = r[n];
            o = f[n];
            if (typeof s != "undefined" && s !== null) {
                if (typeof p[s] != "undefined") {
                    q.replace(s, o);
                    continue
                }
                p[s] = o
            }
            b.push(o);
            if (e && l && c.isFiltered.call(q, o)) {
                continue
            }
            q.length++;
            j.push(s);
            k.push(o);
            d.push(o)
        }
        if (d.length) {
            q.dirtyIndices = true;
            if (a && m) {
                q.sort()
            }
            return d
        }
        return null
    },
    each: function (e, d) {
        var b = this.items.slice(),
            c = 0,
            a = b.length,
            f;
        for (; c < a; c++) {
            f = b[c];
            if (e.call(d || f, f, c, a) === false) {
                break
            }
        }
    },
    eachKey: function (d, c) {
        var f = this.keys,
            a = this.items,
            e = f.length,
            b;
        for (b = 0; b < e; b++) {
            d.call(c || window, f[b], a[b], b, e)
        }
    },
    findBy: function (e, d) {
        var f = this.keys,
            b = this.items,
            c = 0,
            a = b.length;
        for (; c < a; c++) {
            if (e.call(d || window, b[c], f[c])) {
                return b[c]
            }
        }
        return null
    },
    filterBy: function (e, d) {
        var h = this,
            c = new this.self(),
            g = h.keys,
            a = h.all,
            f = a.length,
            b;
        c.getKey = h.getKey;
        for (b = 0; b < f; b++) {
            if (e.call(d || h, a[b], g[b])) {
                c.add(g[b], a[b])
            }
        }
        return c
    },
    insert: function (c, d, f) {
        var e = this,
            a = this.sorted,
            b = this.filtered;
        if (arguments.length == 2) {
            f = d;
            d = e.getKey(f)
        }
        if (e.containsKey(d)) {
            e.removeAtKey(d)
        }
        if (c >= e.length || (a && e.getAutoSort())) {
            return e.add(d, f)
        }
        this.all.push(f);
        if (typeof d != "undefined" && d !== null) {
            e.map[d] = f
        }
        if (b && this.getAutoFilter() && filterable.isFiltered.call(e, f)) {
            return null
        }
        e.length++;
        Ext.Array.splice(e.items, c, 0, f);
        Ext.Array.splice(e.keys, c, 0, d);
        e.dirtyIndices = true;
        return f
    },
    insertAll: function (g, d) {
        if (g >= this.items.length || (this.sorted && this.getAutoSort())) {
            return this.addAll(d)
        }
        var s = this,
            h = this.filtered,
            a = this.sorted,
            b = this.all,
            m = this.items,
            l = this.keys,
            r = this.map,
            n = this.getAutoFilter(),
            o = this.getAutoSort(),
            t = [],
            j = [],
            f = [],
            c = this.mixins.filterable,
            e = false,
            k, u, p, q;
        if (a && this.getAutoSort()) {}
        if (Ext.isObject(d)) {
            for (u in d) {
                if (d.hasOwnProperty(u)) {
                    j.push(m[u]);
                    t.push(u)
                }
            }
        } else {
            j = d;
            k = d.length;
            for (p = 0; p < k; p++) {
                t.push(s.getKey(d[p]))
            }
        }
        for (p = 0; p < k; p++) {
            u = t[p];
            q = j[p];
            if (typeof u != "undefined" && u !== null) {
                if (s.containsKey(u)) {
                    s.removeAtKey(u)
                }
                r[u] = q
            }
            b.push(q);
            if (h && n && c.isFiltered.call(s, q)) {
                continue
            }
            s.length++;
            Ext.Array.splice(m, g + p, 0, q);
            Ext.Array.splice(l, g + p, 0, u);
            e = true;
            f.push(q)
        }
        if (e) {
            this.dirtyIndices = true;
            if (a && o) {
                this.sort()
            }
            return f
        }
        return null
    },
    remove: function (b) {
        var a = this.items.indexOf(b);
        if (a === -1) {
            Ext.Array.remove(this.all, b);
            return b
        }
        return this.removeAt(this.items.indexOf(b))
    },
    removeAll: function (a) {
        if (a) {
            var c = a.length,
                b;
            for (b = 0; b < c; b++) {
                this.remove(a[b])
            }
        }
        return this
    },
    removeAt: function (b) {
        var g = this,
            a = g.items,
            f = g.keys,
            d = this.all,
            e, c;
        if (b < g.length && b >= 0) {
            e = a[b];
            c = f[b];
            if (typeof c != "undefined") {
                delete g.map[c]
            }
            Ext.Array.erase(a, b, 1);
            Ext.Array.erase(f, b, 1);
            Ext.Array.remove(d, e);
            g.length--;
            this.dirtyIndices = true;
            return e
        }
        return false
    },
    removeAtKey: function (a) {
        return this.removeAt(this.indexOfKey(a))
    },
    getCount: function () {
        return this.length
    },
    indexOf: function (b) {
        if (this.dirtyIndices) {
            this.updateIndices()
        }
        var a = this.indices[this.getKey(b)];
        return (a === undefined) ? -1 : a
    },
    indexOfKey: function (b) {
        if (this.dirtyIndices) {
            this.updateIndices()
        }
        var a = this.indices[b];
        return (a === undefined) ? -1 : a
    },
    updateIndices: function () {
        var a = this.items,
            e = a.length,
            f = this.indices = {},
            c, d, b;
        for (c = 0; c < e; c++) {
            d = a[c];
            b = this.getKey(d);
            f[b] = c
        }
        this.dirtyIndices = false
    },
    get: function (b) {
        var d = this,
            a = d.map[b],
            c;
        if (a !== undefined) {
            c = a
        } else {
            if (typeof b == "number") {
                c = d.items[b]
            }
        }
        return typeof c != "function" || d.getAllowFunctions() ? c : null
    },
    getAt: function (a) {
        return this.items[a]
    },
    getByKey: function (a) {
        return this.map[a]
    },
    contains: function (b) {
        var a = this.getKey(b);
        if (a) {
            return this.containsKey(a)
        } else {
            return Ext.Array.contains(this.items, b)
        }
    },
    containsKey: function (a) {
        return typeof this.map[a] != "undefined"
    },
    clear: function () {
        var a = this;
        a.length = 0;
        a.items.length = 0;
        a.keys.length = 0;
        a.all.length = 0;
        a.map = {}
    },
    first: function () {
        return this.items[0]
    },
    last: function () {
        return this.items[this.length - 1]
    },
    getRange: function (f, a) {
        var e = this,
            c = e.items,
            b = [],
            d;
        if (c.length < 1) {
            return b
        }
        f = f || 0;
        a = Math.min(typeof a == "undefined" ? e.length - 1 : a, e.length - 1);
        if (f <= a) {
            for (d = f; d <= a; d++) {
                b[b.length] = c[d]
            }
        } else {
            for (d = f; d >= a; d--) {
                b[b.length] = c[d]
            }
        }
        return b
    },
    findIndexBy: function (d, c, h) {
        var g = this,
            f = g.keys,
            a = g.items,
            b = h || 0,
            e = a.length;
        for (; b < e; b++) {
            if (d.call(c || g, a[b], f[b])) {
                return b
            }
        }
        return -1
    },
    clone: function () {
        var e = this,
            f = new this.self(),
            d = e.keys,
            a = e.items,
            b = 0,
            c = a.length;
        for (; b < c; b++) {
            f.add(d[b], a[b])
        }
        f.getKey = e.getKey;
        return f
    }
});
Ext.define("Ext.data.StoreManager", {
    extend: "Ext.util.Collection",
    alternateClassName: ["Ext.StoreMgr", "Ext.data.StoreMgr", "Ext.StoreManager"],
    singleton: true,
    uses: ["Ext.data.ArrayStore"],
    register: function () {
        for (var a = 0, b;
        (b = arguments[a]); a++) {
            this.add(b)
        }
    },
    unregister: function () {
        for (var a = 0, b;
        (b = arguments[a]); a++) {
            this.remove(this.lookup(b))
        }
    },
    lookup: function (c) {
        if (Ext.isArray(c)) {
            var b = ["field1"],
                e = !Ext.isArray(c[0]),
                f = c,
                d, a;
            if (e) {
                f = [];
                for (d = 0, a = c.length; d < a; ++d) {
                    f.push([c[d]])
                }
            } else {
                for (d = 2, a = c[0].length; d <= a; ++d) {
                    b.push("field" + d)
                }
            }
            return Ext.create("Ext.data.ArrayStore", {
                data: f,
                fields: b,
                autoDestroy: true,
                autoCreated: true,
                expanded: e
            })
        }
        if (Ext.isString(c)) {
            return this.get(c)
        } else {
            if (c instanceof Ext.data.Store) {
                return c
            } else {
                return Ext.factory(c, Ext.data.Store, null, "store")
            }
        }
    },
    getKey: function (a) {
        return a.getStoreId()
    }
}, function () {
    Ext.regStore = function (c, b) {
        var a;
        if (Ext.isObject(c)) {
            b = c
        } else {
            if (b instanceof Ext.data.Store) {
                b.setStoreId(c)
            } else {
                b.storeId = c
            }
        }
        if (b instanceof Ext.data.Store) {
            a = b
        } else {
            a = Ext.create("Ext.data.Store", b)
        }
        return Ext.data.StoreManager.register(a)
    };
    Ext.getStore = function (a) {
        return Ext.data.StoreManager.lookup(a)
    }
});
Ext.define("Ext.util.Grouper", {
    extend: "Ext.util.Sorter",
    isGrouper: true,
    config: {
        groupFn: null,
        sortProperty: null,
        sorterFn: function (d, c) {
            var e = this.getSortProperty(),
                g, b, f, a;
            g = this.getGroupFn();
            b = g.call(this, d);
            f = g.call(this, c);
            if (e) {
                if (b !== f) {
                    return this.defaultSortFn.call(this, d, c)
                } else {
                    return 0
                }
            }
            return (b > f) ? 1 : ((b < f) ? -1 : 0)
        }
    },
    defaultSortFn: function (e, c) {
        var g = this,
            f = g._transform,
            b = g._root,
            d, a, h = g._sortProperty;
        if (b !== null) {
            e = e[b];
            c = c[b]
        }
        d = e[h];
        a = c[h];
        if (f) {
            d = f(d);
            a = f(a)
        }
        return d > a ? 1 : (d < a ? -1 : 0)
    },
    updateProperty: function (a) {
        this.setGroupFn(this.standardGroupFn)
    },
    standardGroupFn: function (b) {
        var a = this.getRoot(),
            d = this.getProperty(),
            c = b;
        if (a) {
            c = b[a]
        }
        return c[d]
    },
    getGroupString: function (a) {
        var b = this.getGroupFn().call(this, a);
        return typeof b != "undefined" ? b.toString() : ""
    }
});
(function (a) {
    Ext.define("Ext.layout.Default", {
        extend: "Ext.Evented",
        alternateClassName: ["Ext.layout.AutoContainerLayout", "Ext.layout.ContainerLayout"],
        alias: ["layout.auto", "layout.default"],
        isLayout: true,
        hasDockedItemsCls: a + "hasdocked",
        centeredItemCls: a + "centered",
        floatingItemCls: a + "floating",
        dockingWrapperCls: a + "docking",
        dockingInnerCls: a + "docking-inner",
        maskCls: a + "mask",
        positionMap: {
            top: "start",
            left: "start",
            bottom: "end",
            right: "end"
        },
        positionDirectionMap: {
            top: "vertical",
            bottom: "vertical",
            left: "horizontal",
            right: "horizontal"
        },
        DIRECTION_VERTICAL: "vertical",
        DIRECTION_HORIZONTAL: "horizontal",
        POSITION_START: "start",
        POSITION_END: "end",
        config: {
            animation: null
        },
        constructor: function (b, c) {
            this.container = b;
            this.innerItems = [];
            this.centeringWrappers = {};
            this.initConfig(c)
        },
        reapply: Ext.emptyFn,
        unapply: Ext.emptyFn,
        onItemAdd: function () {
            this.doItemAdd.apply(this, arguments)
        },
        onItemRemove: function () {
            this.doItemRemove.apply(this, arguments)
        },
        onItemMove: function () {
            this.doItemMove.apply(this, arguments)
        },
        onItemCenteredChange: function () {
            this.doItemCenteredChange.apply(this, arguments)
        },
        onItemFloatingChange: function () {
            this.doItemFloatingChange.apply(this, arguments)
        },
        onItemDockedChange: function () {
            this.doItemDockedChange.apply(this, arguments)
        },
        doItemAdd: function (c, b) {
            var d = c.getDocked();
            if (d !== null) {
                this.dockItem(c, d)
            } else {
                if (c.isCentered()) {
                    this.centerItem(c, b)
                } else {
                    this.insertItem(c, b)
                }
            }
            if (c.isFloating()) {
                this.onItemFloatingChange(c, true)
            }
        },
        doItemRemove: function (b) {
            if (b.isDocked()) {
                this.undockItem(b)
            } else {
                if (b.isCentered()) {
                    this.uncenterItem(b)
                }
            }
            Ext.Array.remove(this.innerItems, b);
            this.container.innerElement.dom.removeChild(b.renderElement.dom)
        },
        doItemMove: function (c, d, b) {
            if (c.isCentered()) {
                c.setZIndex((d + 1) * 2)
            } else {
                if (c.isFloating()) {
                    c.setZIndex((d + 1) * 2)
                }
                this.insertItem(c, d)
            }
        },
        doItemCenteredChange: function (c, b) {
            if (b) {
                this.centerItem(c)
            } else {
                this.uncenterItem(c)
            }
        },
        doItemFloatingChange: function (d, e) {
            var c = d.element,
                b = this.floatingItemCls;
            if (e) {
                if (d.getZIndex() === null) {
                    d.setZIndex((this.container.indexOf(d) + 1) * 2)
                }
                c.addCls(b)
            } else {
                d.setZIndex(null);
                c.removeCls(b)
            }
        },
        doItemDockedChange: function (b, d, c) {
            if (c) {
                this.undockItem(b, c)
            }
            if (d) {
                this.dockItem(b, d)
            }
        },
        centerItem: function (b) {
            this.insertItem(b, 0);
            if (b.getZIndex() === null) {
                b.setZIndex((this.container.indexOf(b) + 1) * 2)
            }
            this.createCenteringWrapper(b);
            b.element.addCls(this.floatingItemCls)
        },
        uncenterItem: function (b) {
            this.destroyCenteringWrapper(b);
            b.setZIndex(null);
            this.insertItem(b, this.container.indexOf(b));
            b.element.removeCls(this.floatingItemCls)
        },
        dockItem: function (f, b) {
            var c = this.container,
                g = f.renderElement,
                e = f.element,
                d = this.dockingInnerElement;
            if (!d) {
                c.setUseBodyElement(true);
                this.dockingInnerElement = d = c.bodyElement
            }
            this.getDockingWrapper(b);
            if (this.positionMap[b] === this.POSITION_START) {
                g.insertBefore(d)
            } else {
                g.insertAfter(d)
            }
            e.addCls(a + "docked-" + b)
        },
        undockItem: function (b, c) {
            this.insertItem(b, this.container.indexOf(b));
            b.element.removeCls(a + "docked-" + c)
        },
        getDockingWrapper: function (b) {
            var e = this.currentDockingDirection,
                d = this.positionDirectionMap[b],
                c = this.dockingWrapper;
            if (e !== d) {
                this.currentDockingDirection = d;
                this.dockingWrapper = c = this.createDockingWrapper(d)
            }
            return c
        },
        createDockingWrapper: function (b) {
            return this.dockingInnerElement.wrap({
                classList: [this.dockingWrapperCls + "-" + b]
            }, true)
        },
        createCenteringWrapper: function (c) {
            var f = c.getId(),
                d = this.centeringWrappers,
                b = c.renderElement,
                e;
            d[f] = e = b.wrap({
                className: this.centeredItemCls
            });
            return e
        },
        destroyCenteringWrapper: function (c) {
            var f = c.getId(),
                d = this.centeringWrappers,
                b = c.renderElement,
                e = d[f];
            b.unwrap();
            e.destroy();
            delete d[f];
            return this
        },
        insertItem: function (l, g) {
            var d = this.container,
                k = d.getItems().items,
                e = this.innerItems,
                c = d.innerElement.dom,
                j = l.renderElement.dom,
                h, f, b;
            if (d.has(l)) {
                Ext.Array.remove(e, l)
            }
            if (typeof g == "number") {
                h = k[g];
                if (h === l) {
                    h = k[++g]
                }
                while (h && (h.isCentered() || h.isDocked())) {
                    h = k[++g]
                }
                if (h) {
                    b = e.indexOf(h);
                    if (b !== -1) {
                        while (h && (h.isCentered() || h.isDocked())) {
                            h = e[++b]
                        }
                        if (h) {
                            e.splice(b, 0, l);
                            f = h.renderElement.dom;
                            c.insertBefore(j, f);
                            return this
                        }
                    }
                }
            }
            e.push(l);
            c.appendChild(j);
            return this
        }
    })
})(Ext.baseCSSPrefix);
Ext.define("Ext.layout.Fit", {
    extend: "Ext.layout.Default",
    alternateClassName: "Ext.layout.FitLayout",
    alias: "layout.fit",
    cls: Ext.baseCSSPrefix + "layout-fit",
    itemCls: Ext.baseCSSPrefix + "layout-fit-item",
    constructor: function (a) {
        this.callParent(arguments);
        this.apply()
    },
    apply: function () {
        this.container.innerElement.addCls(this.cls)
    },
    reapply: function () {
        this.apply()
    },
    unapply: function () {
        this.container.innerElement.removeCls(this.cls)
    },
    doItemAdd: function (b, a) {
        if (b.isInnerItem()) {
            b.addCls(this.itemCls)
        }
        this.callParent(arguments)
    },
    doItemRemove: function (a) {
        if (a.isInnerItem()) {
            a.removeCls(this.itemCls)
        }
        this.callParent(arguments)
    }
});
Ext.define("Ext.layout.AbstractBox", {
    extend: "Ext.layout.Default",
    config: {
        align: "stretch",
        pack: null
    },
    flexItemCls: Ext.baseCSSPrefix + "layout-box-item",
    positionMap: {
        middle: "center",
        left: "start",
        top: "start",
        right: "end",
        bottom: "end"
    },
    constructor: function (a) {
        this.callParent(arguments);
        a.innerElement.addCls(this.cls);
        a.on(this.sizeChangeEventName, "onItemSizeChange", this, {
            delegate: "> component"
        })
    },
    reapply: function () {
        this.container.innerElement.addCls(this.cls);
        this.updatePack(this.getPack());
        this.updateAlign(this.getAlign())
    },
    unapply: function () {
        this.container.innerElement.removeCls(this.cls);
        this.updatePack(null);
        this.updateAlign(null)
    },
    doItemAdd: function (d, b) {
        this.callParent(arguments);
        if (d.isInnerItem()) {
            var c = d.getConfig(this.sizePropertyName),
                a = d.config;
            if (!c && ("flex" in a)) {
                this.setItemFlex(d, a.flex)
            }
        }
    },
    doItemRemove: function (a) {
        if (a.isInnerItem()) {
            this.setItemFlex(a, null)
        }
        this.callParent(arguments)
    },
    onItemSizeChange: function (a) {
        this.setItemFlex(a, null)
    },
    doItemCenteredChange: function (b, a) {
        if (a) {
            this.setItemFlex(b, null)
        }
        this.callParent(arguments)
    },
    doItemFloatingChange: function (a, b) {
        if (b) {
            this.setItemFlex(a, null)
        }
        this.callParent(arguments)
    },
    doItemDockedChange: function (a, b) {
        if (b) {
            this.setItemFlex(a, null)
        }
        this.callParent(arguments)
    },
    redrawContainer: function () {
        var a = this.container,
            b = a.renderElement.dom.parentNode;
        if (b && b.nodeType !== 11) {
            a.innerElement.redraw()
        }
    },
    setItemFlex: function (c, a) {
        var b = c.element,
            d = this.flexItemCls;
        if (a) {
            b.addCls(d)
        } else {
            if (b.hasCls(d)) {
                this.redrawContainer();
                b.removeCls(d)
            }
        }
        b.dom.style.webkitBoxFlex = a
    },
    convertPosition: function (a) {
        if (this.positionMap.hasOwnProperty(a)) {
            return this.positionMap[a]
        }
        return a
    },
    applyAlign: function (a) {
        return this.convertPosition(a)
    },
    updateAlign: function (a) {
        this.container.innerElement.dom.style.webkitBoxAlign = a
    },
    applyPack: function (a) {
        return this.convertPosition(a)
    },
    updatePack: function (a) {
        this.container.innerElement.dom.style.webkitBoxPack = a
    }
});
Ext.define("Ext.layout.HBox", {
    extend: "Ext.layout.AbstractBox",
    alternateClassName: "Ext.layout.HBoxLayout",
    alias: "layout.hbox",
    sizePropertyName: "width",
    sizeChangeEventName: "widthchange",
    cls: Ext.baseCSSPrefix + "layout-hbox"
});
Ext.define("Ext.layout.VBox", {
    extend: "Ext.layout.AbstractBox",
    alternateClassName: "Ext.layout.VBoxLayout",
    alias: "layout.vbox",
    sizePropertyName: "height",
    sizeChangeEventName: "heightchange",
    cls: Ext.baseCSSPrefix + "layout-vbox"
});
Ext.define("Ext.util.AbstractMixedCollection", {
    requires: ["Ext.util.Filter"],
    mixins: {
        observable: "Ext.util.Observable"
    },
    constructor: function (b, a) {
        var c = this;
        c.items = [];
        c.map = {};
        c.keys = [];
        c.length = 0;
        c.allowFunctions = b === true;
        if (a) {
            c.getKey = a
        }
        c.mixins.observable.constructor.call(c)
    },
    allowFunctions: false,
    add: function (b, e) {
        var d = this,
            f = e,
            c = b,
            a;
        if (arguments.length == 1) {
            f = c;
            c = d.getKey(f)
        }
        if (typeof c != "undefined" && c !== null) {
            a = d.map[c];
            if (typeof a != "undefined") {
                return d.replace(c, f)
            }
            d.map[c] = f
        }
        d.length++;
        d.items.push(f);
        d.keys.push(c);
        d.fireEvent("add", d.length - 1, f, c);
        return f
    },
    getKey: function (a) {
        return a.id
    },
    replace: function (c, e) {
        var d = this,
            a, b;
        if (arguments.length == 1) {
            e = arguments[0];
            c = d.getKey(e)
        }
        a = d.map[c];
        if (typeof c == "undefined" || c === null || typeof a == "undefined") {
            return d.add(c, e)
        }
        b = d.indexOfKey(c);
        d.items[b] = e;
        d.map[c] = e;
        d.fireEvent("replace", c, a, e);
        return e
    },
    addAll: function (f) {
        var e = this,
            d = 0,
            b, a, c;
        if (arguments.length > 1 || Ext.isArray(f)) {
            b = arguments.length > 1 ? arguments : f;
            for (a = b.length; d < a; d++) {
                e.add(b[d])
            }
        } else {
            for (c in f) {
                if (f.hasOwnProperty(c)) {
                    if (e.allowFunctions || typeof f[c] != "function") {
                        e.add(c, f[c])
                    }
                }
            }
        }
    },
    each: function (e, d) {
        var b = [].concat(this.items),
            c = 0,
            a = b.length,
            f;
        for (; c < a; c++) {
            f = b[c];
            if (e.call(d || f, f, c, a) === false) {
                break
            }
        }
    },
    eachKey: function (e, d) {
        var f = this.keys,
            b = this.items,
            c = 0,
            a = f.length;
        for (; c < a; c++) {
            e.call(d || window, f[c], b[c], c, a)
        }
    },
    findBy: function (e, d) {
        var f = this.keys,
            b = this.items,
            c = 0,
            a = b.length;
        for (; c < a; c++) {
            if (e.call(d || window, b[c], f[c])) {
                return b[c]
            }
        }
        return null
    },
    insert: function (a, b, e) {
        var d = this,
            c = b,
            f = e;
        if (arguments.length == 2) {
            f = c;
            c = d.getKey(f)
        }
        if (d.containsKey(c)) {
            d.suspendEvents();
            d.removeAtKey(c);
            d.resumeEvents()
        }
        if (a >= d.length) {
            return d.add(c, f)
        }
        d.length++;
        Ext.Array.splice(d.items, a, 0, f);
        if (typeof c != "undefined" && c !== null) {
            d.map[c] = f
        }
        Ext.Array.splice(d.keys, a, 0, c);
        d.fireEvent("add", a, f, c);
        return f
    },
    remove: function (a) {
        return this.removeAt(this.indexOf(a))
    },
    removeAll: function (a) {
        Ext.each(a || [], function (b) {
            this.remove(b)
        }, this);
        return this
    },
    removeAt: function (a) {
        var c = this,
            d, b;
        if (a < c.length && a >= 0) {
            c.length--;
            d = c.items[a];
            Ext.Array.erase(c.items, a, 1);
            b = c.keys[a];
            if (typeof b != "undefined") {
                delete c.map[b]
            }
            Ext.Array.erase(c.keys, a, 1);
            c.fireEvent("remove", d, b);
            return d
        }
        return false
    },
    removeAtKey: function (a) {
        return this.removeAt(this.indexOfKey(a))
    },
    getCount: function () {
        return this.length
    },
    indexOf: function (a) {
        return Ext.Array.indexOf(this.items, a)
    },
    indexOfKey: function (a) {
        return Ext.Array.indexOf(this.keys, a)
    },
    get: function (b) {
        var d = this,
            a = d.map[b],
            c = a !== undefined ? a : (typeof b == "number") ? d.items[b] : undefined;
        return typeof c != "function" || d.allowFunctions ? c : null
    },
    getAt: function (a) {
        return this.items[a]
    },
    getByKey: function (a) {
        return this.map[a]
    },
    contains: function (a) {
        return Ext.Array.contains(this.items, a)
    },
    containsKey: function (a) {
        return typeof this.map[a] != "undefined"
    },
    clear: function () {
        var a = this;
        a.length = 0;
        a.items = [];
        a.keys = [];
        a.map = {};
        a.fireEvent("clear")
    },
    first: function () {
        return this.items[0]
    },
    last: function () {
        return this.items[this.length - 1]
    },
    sum: function (g, b, h, a) {
        var c = this.extractValues(g, b),
            f = c.length,
            e = 0,
            d;
        h = h || 0;
        a = (a || a === 0) ? a : f - 1;
        for (d = h; d <= a; d++) {
            e += c[d]
        }
        return e
    },
    collect: function (j, e, g) {
        var k = this.extractValues(j, e),
            a = k.length,
            b = {},
            c = [],
            h, f, d;
        for (d = 0; d < a; d++) {
            h = k[d];
            f = String(h);
            if ((g || !Ext.isEmpty(h)) && !b[f]) {
                b[f] = true;
                c.push(h)
            }
        }
        return c
    },
    extractValues: function (c, a) {
        var b = this.items;
        if (a) {
            b = Ext.Array.pluck(b, a)
        }
        return Ext.Array.pluck(b, c)
    },
    getRange: function (f, a) {
        var e = this,
            c = e.items,
            b = [],
            d;
        if (c.length < 1) {
            return b
        }
        f = f || 0;
        a = Math.min(typeof a == "undefined" ? e.length - 1 : a, e.length - 1);
        if (f <= a) {
            for (d = f; d <= a; d++) {
                b[b.length] = c[d]
            }
        } else {
            for (d = f; d >= a; d--) {
                b[b.length] = c[d]
            }
        }
        return b
    },
    filter: function (d, c, f, a) {
        var b = [],
            e;
        if (Ext.isString(d)) {
            b.push(Ext.create("Ext.util.Filter", {
                property: d,
                value: c,
                anyMatch: f,
                caseSensitive: a
            }))
        } else {
            if (Ext.isArray(d) || d instanceof Ext.util.Filter) {
                b = b.concat(d)
            }
        }
        e = function (g) {
            var m = true,
                n = b.length,
                h;
            for (h = 0; h < n; h++) {
                var l = b[h],
                    k = l.getFilterFn(),
                    j = l.getScope();
                m = m && k.call(j, g)
            }
            return m
        };
        return this.filterBy(e)
    },
    filterBy: function (e, d) {
        var h = this,
            a = new this.self(),
            g = h.keys,
            b = h.items,
            f = b.length,
            c;
        a.getKey = h.getKey;
        for (c = 0; c < f; c++) {
            if (e.call(d || h, b[c], g[c])) {
                a.add(g[c], b[c])
            }
        }
        return a
    },
    findIndex: function (c, b, e, d, a) {
        if (Ext.isEmpty(b, false)) {
            return -1
        }
        b = this.createValueMatcher(b, d, a);
        return this.findIndexBy(function (f) {
            return f && b.test(f[c])
        }, null, e)
    },
    findIndexBy: function (e, d, h) {
        var g = this,
            f = g.keys,
            b = g.items,
            c = h || 0,
            a = b.length;
        for (; c < a; c++) {
            if (e.call(d || g, b[c], f[c])) {
                return c
            }
        }
        return -1
    },
    createValueMatcher: function (c, e, a, b) {
        if (!c.exec) {
            var d = Ext.String.escapeRegex;
            c = String(c);
            if (e === true) {
                c = d(c)
            } else {
                c = "^" + d(c);
                if (b === true) {
                    c += "$"
                }
            }
            c = new RegExp(c, a ? "" : "i")
        }
        return c
    },
    clone: function () {
        var e = this,
            f = new this.self(),
            d = e.keys,
            b = e.items,
            c = 0,
            a = b.length;
        for (; c < a; c++) {
            f.add(d[c], b[c])
        }
        f.getKey = e.getKey;
        return f
    }
});
Ext.define("Ext.util.Sortable", {
    isSortable: true,
    defaultSortDirection: "ASC",
    requires: ["Ext.util.Sorter"],
    initSortable: function () {
        var a = this,
            b = a.sorters;
        a.sorters = Ext.create("Ext.util.AbstractMixedCollection", false, function (c) {
            return c.id || c.property
        });
        if (b) {
            a.sorters.addAll(a.decodeSorters(b))
        }
    },
    sort: function (g, f, c, e) {
        var d = this,
            h, b, a;
        if (Ext.isArray(g)) {
            e = c;
            c = f;
            a = g
        } else {
            if (Ext.isObject(g)) {
                e = c;
                c = f;
                a = [g]
            } else {
                if (Ext.isString(g)) {
                    h = d.sorters.get(g);
                    if (!h) {
                        h = {
                            property: g,
                            direction: f
                        };
                        a = [h]
                    } else {
                        if (f === undefined) {
                            h.toggle()
                        } else {
                            h.setDirection(f)
                        }
                    }
                }
            }
        }
        if (a && a.length) {
            a = d.decodeSorters(a);
            if (Ext.isString(c)) {
                if (c === "prepend") {
                    g = d.sorters.clone().items;
                    d.sorters.clear();
                    d.sorters.addAll(a);
                    d.sorters.addAll(g)
                } else {
                    d.sorters.addAll(a)
                }
            } else {
                d.sorters.clear();
                d.sorters.addAll(a)
            }
            if (e !== false) {
                d.onBeforeSort(a)
            }
        }
        if (e !== false) {
            g = d.sorters.items;
            if (g.length) {
                b = function (l, k) {
                    var j = g[0].sort(l, k),
                        n = g.length,
                        m;
                    for (m = 1; m < n; m++) {
                        j = j || g[m].sort.call(this, l, k)
                    }
                    return j
                };
                d.doSort(b)
            }
        }
        return g
    },
    onBeforeSort: Ext.emptyFn,
    decodeSorters: function (f) {
        if (!Ext.isArray(f)) {
            if (f === undefined) {
                f = []
            } else {
                f = [f]
            }
        }
        var d = f.length,
            g = Ext.util.Sorter,
            a = this.model ? this.model.prototype.fields : null,
            e, b, c;
        for (c = 0; c < d; c++) {
            b = f[c];
            if (!(b instanceof g)) {
                if (Ext.isString(b)) {
                    b = {
                        property: b
                    }
                }
                Ext.applyIf(b, {
                    root: this.sortRoot,
                    direction: "ASC"
                });
                if (b.fn) {
                    b.sorterFn = b.fn
                }
                if (typeof b == "function") {
                    b = {
                        sorterFn: b
                    }
                }
                if (a && !b.transform) {
                    e = a.get(b.property);
                    b.transform = e ? e.sortType : undefined
                }
                f[c] = Ext.create("Ext.util.Sorter", b)
            }
        }
        return f
    },
    getSorters: function () {
        return this.sorters.items
    }
});
Ext.define("Ext.util.MixedCollection", {
    extend: "Ext.util.AbstractMixedCollection",
    mixins: {
        sortable: "Ext.util.Sortable"
    },
    constructor: function () {
        var a = this;
        a.callParent(arguments);
        a.mixins.sortable.initSortable.call(a)
    },
    doSort: function (a) {
        this.sortBy(a)
    },
    _sort: function (k, a, j) {
        var h = this,
            d, e, b = String(a).toUpperCase() == "DESC" ? -1 : 1,
            g = [],
            l = h.keys,
            f = h.items;
        j = j ||
        function (m, c) {
            return m - c
        };
        for (d = 0, e = f.length; d < e; d++) {
            g[g.length] = {
                key: l[d],
                value: f[d],
                index: d
            }
        }
        Ext.Array.sort(g, function (m, c) {
            var n = j(m[k], c[k]) * b;
            if (n === 0) {
                n = (m.index < c.index ? -1 : 1)
            }
            return n
        });
        for (d = 0, e = g.length; d < e; d++) {
            f[d] = g[d].value;
            l[d] = g[d].key
        }
        h.fireEvent("sort", h)
    },
    sortBy: function (c) {
        var g = this,
            b = g.items,
            f = g.keys,
            e = b.length,
            a = [],
            d;
        for (d = 0; d < e; d++) {
            a[d] = {
                key: f[d],
                value: b[d],
                index: d
            }
        }
        Ext.Array.sort(a, function (j, h) {
            var k = c(j.value, h.value);
            if (k === 0) {
                k = (j.index < h.index ? -1 : 1)
            }
            return k
        });
        for (d = 0; d < e; d++) {
            b[d] = a[d].value;
            f[d] = a[d].key
        }
        g.fireEvent("sort", g, b, f)
    },
    reorder: function (d) {
        var g = this,
            b = g.items,
            c = 0,
            f = b.length,
            a = [],
            e = [],
            h;
        g.suspendEvents();
        for (h in d) {
            a[d[h]] = b[h]
        }
        for (c = 0; c < f; c++) {
            if (d[c] == undefined) {
                e.push(b[c])
            }
        }
        for (c = 0; c < f; c++) {
            if (a[c] == undefined) {
                a[c] = e.shift()
            }
        }
        g.clear();
        g.addAll(a);
        g.resumeEvents();
        g.fireEvent("sort", g)
    },
    sortByKey: function (a, b) {
        this._sort("key", a, b ||
        function (d, c) {
            var f = String(d).toUpperCase(),
                e = String(c).toUpperCase();
            return f > e ? 1 : (f < e ? -1 : 0)
        })
    }
});
Ext.define("Ext.ItemCollection", {
    extend: "Ext.util.MixedCollection",
    getKey: function (a) {
        return a.getItemId()
    },
    has: function (a) {
        return this.map.hasOwnProperty(a.getId())
    }
});
Ext.define("Ext.fx.animation.Abstract", {
    extend: "Ext.Evented",
    isAnimation: true,
    requires: ["Ext.fx.State"],
    config: {
        name: "",
        element: null,
        before: null,
        from: {},
        to: {},
        after: null,
        states: {},
        duration: 300,
        easing: "linear",
        iteration: 1,
        direction: "normal",
        delay: 0,
        onBeforeStart: null,
        onEnd: null,
        onBeforeEnd: null,
        scope: null,
        reverse: null,
        preserveEndState: false,
        replacePrevious: true
    },
    STATE_FROM: "0%",
    STATE_TO: "100%",
    DIRECTION_UP: "up",
    DIRECTION_DOWN: "down",
    DIRECTION_LEFT: "left",
    DIRECTION_RIGHT: "right",
    stateNameRegex: /^(?:[\d\.]+)%$/,
    constructor: function () {
        this.states = {};
        this.callParent(arguments);
        return this
    },
    applyElement: function (a) {
        return Ext.get(a)
    },
    applyBefore: function (a, b) {
        if (a) {
            return Ext.factory(a, Ext.fx.State, b)
        }
    },
    applyAfter: function (b, a) {
        if (b) {
            return Ext.factory(b, Ext.fx.State, a)
        }
    },
    setFrom: function (a) {
        return this.setState(this.STATE_FROM, a)
    },
    setTo: function (a) {
        return this.setState(this.STATE_TO, a)
    },
    getFrom: function () {
        return this.getState(this.STATE_FROM)
    },
    getTo: function () {
        return this.getState(this.STATE_TO)
    },
    setStates: function (a) {
        var c = this.stateNameRegex,
            b;
        for (b in a) {
            if (c.test(b)) {
                this.setState(b, a[b])
            }
        }
        return this
    },
    getStates: function () {
        return this.states
    },
    setState: function (b, d) {
        var a = this.getStates(),
            c;
        c = Ext.factory(d, Ext.fx.State, a[b]);
        if (c) {
            a[b] = c
        }
        return this
    },
    getState: function (a) {
        return this.getStates()[a]
    },
    getData: function () {
        var l = this.getStates(),
            e = {},
            g = this.getBefore(),
            c = this.getAfter(),
            h = l[this.STATE_FROM],
            j = l[this.STATE_TO],
            k = h.getData(),
            f = j.getData(),
            d, b, a;
        for (b in l) {
            if (l.hasOwnProperty(b)) {
                a = l[b];
                d = a.getData();
                e[b] = d
            }
        }
        if (Ext.os.is.Android2) {
            e["0.0001%"] = k
        }
        return {
            before: g ? g.getData() : {},
            after: c ? c.getData() : {},
            states: e,
            from: k,
            to: f,
            duration: this.getDuration(),
            iteration: this.getIteration(),
            direction: this.getDirection(),
            easing: this.getEasing(),
            delay: this.getDelay(),
            onEnd: this.getOnEnd(),
            onBeforeEnd: this.getOnBeforeEnd(),
            onBeforeStart: this.getOnBeforeStart(),
            scope: this.getScope(),
            preserveEndState: this.getPreserveEndState(),
            replacePrevious: this.getReplacePrevious()
        }
    }
});
Ext.define("Ext.fx.animation.Slide", {
    extend: "Ext.fx.animation.Abstract",
    alternateClassName: "Ext.fx.animation.SlideIn",
    alias: ["animation.slide", "animation.slideIn"],
    config: {
        direction: "left",
        out: false,
        offset: 0,
        easing: "auto",
        containerBox: "auto",
        elementBox: "auto",
        isElementBoxFit: true,
        useCssTransform: true
    },
    reverseDirectionMap: {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
    },
    applyEasing: function (a) {
        if (a === "auto") {
            return "ease-" + ((this.getOut()) ? "in" : "out")
        }
        return a
    },
    getContainerBox: function () {
        var a = this._containerBox;
        if (a === "auto") {
            a = this.getElement().getParent().getPageBox()
        }
        return a
    },
    getElementBox: function () {
        var a = this._elementBox;
        if (this.getIsElementBoxFit()) {
            return this.getContainerBox()
        }
        if (a === "auto") {
            a = this.getElement().getPageBox()
        }
        return a
    },
    getData: function () {
        var q = this.getElementBox(),
            c = this.getContainerBox(),
            g = q ? q : c,
            o = this.getFrom(),
            p = this.getTo(),
            f = this.getOut(),
            e = this.getOffset(),
            n = this.getDirection(),
            b = this.getUseCssTransform(),
            h = this.getReverse(),
            d = 0,
            a = 0,
            m, k, l, j;
        if (h) {
            n = this.reverseDirectionMap[n]
        }
        switch (n) {
        case this.DIRECTION_UP:
            if (f) {
                a = c.top - g.top - g.height - e
            } else {
                a = c.bottom - g.bottom + g.height + e
            }
            break;
        case this.DIRECTION_DOWN:
            if (f) {
                a = c.bottom - g.bottom + g.height + e
            } else {
                a = c.top - g.height - g.top - e
            }
            break;
        case this.DIRECTION_RIGHT:
            if (f) {
                d = c.right - g.right + g.width + e
            } else {
                d = c.left - g.left - g.width - e
            }
            break;
        case this.DIRECTION_LEFT:
            if (f) {
                d = c.left - g.left - g.width - e
            } else {
                d = c.right - g.right + g.width + e
            }
            break
        }
        m = (f) ? 0 : d;
        k = (f) ? 0 : a;
        if (b) {
            o.setTransform({
                translateX: m,
                translateY: k
            })
        } else {
            o.set("left", m);
            o.set("top", k)
        }
        l = (f) ? d : 0;
        j = (f) ? a : 0;
        if (b) {
            p.setTransform({
                translateX: l,
                translateY: j
            })
        } else {
            p.set("left", l);
            p.set("top", j)
        }
        return this.callParent(arguments)
    }
});
Ext.define("Ext.fx.animation.SlideOut", {
    extend: "Ext.fx.animation.Slide",
    alias: ["animation.slideOut"],
    config: {
        out: true
    }
});
Ext.define("Ext.fx.animation.Fade", {
    extend: "Ext.fx.animation.Abstract",
    alternateClassName: "Ext.fx.animation.FadeIn",
    alias: ["animation.fade", "animation.fadeIn"],
    config: {
        out: false,
        before: {
            display: null,
            opacity: 0
        },
        after: {
            opacity: null
        },
        reverse: null
    },
    updateOut: function (a) {
        var c = this.getTo(),
            b = this.getFrom();
        if (a) {
            b.set("opacity", 1);
            c.set("opacity", 0)
        } else {
            b.set("opacity", 0);
            c.set("opacity", 1)
        }
    }
});
Ext.define("Ext.fx.animation.FadeOut", {
    extend: "Ext.fx.animation.Fade",
    alias: "animation.fadeOut",
    config: {
        out: true,
        before: {}
    }
});
Ext.define("Ext.fx.animation.Flip", {
    extend: "Ext.fx.animation.Abstract",
    alias: "animation.flip",
    config: {
        easing: "ease-in",
        direction: "right",
        half: false,
        out: null
    },
    getData: function () {
        var h = this.getFrom(),
            j = this.getTo(),
            g = this.getDirection(),
            b = this.getOut(),
            m = this.getHalf(),
            c = (m) ? 90 : 180,
            e = 1,
            a = 1,
            l = 0,
            k = 0,
            f = 0,
            d = 0;
        if (b) {
            a = 0.8
        } else {
            e = 0.8
        }
        switch (g) {
        case this.DIRECTION_UP:
            if (b) {
                f = c
            } else {
                l = -c
            }
            break;
        case this.DIRECTION_DOWN:
            if (b) {
                f = -c
            } else {
                l = c
            }
            break;
        case this.DIRECTION_RIGHT:
            if (b) {
                d = -c
            } else {
                k = c
            }
            break;
        case this.DIRECTION_LEFT:
            if (b) {
                d = -c
            } else {
                k = c
            }
            break
        }
        h.setTransform({
            rotateX: l,
            rotateY: k,
            scale: e
        });
        j.setTransform({
            rotateX: f,
            rotateY: d,
            scale: a
        });
        return this.callParent(arguments)
    }
});
Ext.define("Ext.fx.animation.Pop", {
    extend: "Ext.fx.animation.Abstract",
    alias: ["animation.pop", "animation.popIn"],
    alternateClassName: "Ext.fx.animation.PopIn",
    config: {
        out: false,
        before: {
            display: null,
            opacity: 0
        },
        after: {
            opacity: null
        }
    },
    getData: function () {
        var c = this.getTo(),
            b = this.getFrom(),
            a = this.getOut();
        if (a) {
            b.set("opacity", 1);
            b.setTransform({
                scale: 1
            });
            c.set("opacity", 0);
            c.setTransform({
                scale: 0
            })
        } else {
            b.set("opacity", 0);
            b.setTransform({
                scale: 0
            });
            c.set("opacity", 1);
            c.setTransform({
                scale: 1
            })
        }
        return this.callParent(arguments)
    }
});
Ext.define("Ext.fx.animation.PopOut", {
    extend: "Ext.fx.animation.Pop",
    alias: "animation.popOut",
    config: {
        out: true,
        before: {}
    }
});
Ext.define("Ext.fx.animation.Cube", {
    extend: "Ext.fx.animation.Abstract",
    alias: "animation.cube",
    config: {
        before: {},
        after: {},
        direction: "right",
        out: false
    },
    getData: function () {
        var n = this.getTo(),
            o = this.getFrom(),
            l = this.getBefore(),
            a = this.getAfter(),
            e = this.getOut(),
            k = this.getDirection(),
            b = this.getElement(),
            g = b.getWidth(),
            c = b.getHeight(),
            m = e ? "100% 100%" : "0% 0%",
            j = 1,
            d = 1,
            f = {
                rotateY: 0,
                translateZ: 0,
            },
            h = {
                rotateY: 0,
                translateZ: 0
            };
        if (k == "left" || k == "right") {
            if (e) {
                d = 0.5;
                h.translateZ = g;
                h.rotateY = -90
            } else {
                j = 0.5;
                f.translateZ = g;
                f.rotateY = 90
            }
        }
        l["transform-origin"] = m;
        a["transform-origin"] = null;
        n.set("transform", h);
        o.set("transform", f);
        o.set("opacity", j);
        n.set("opacity", d);
        return this.callParent(arguments)
    }
});
Ext.define("Ext.fx.Animation", {
    requires: ["Ext.fx.animation.Slide", "Ext.fx.animation.SlideOut", "Ext.fx.animation.Fade", "Ext.fx.animation.FadeOut", "Ext.fx.animation.Flip", "Ext.fx.animation.Pop", "Ext.fx.animation.PopOut", "Ext.fx.animation.Cube"],
    constructor: function (b) {
        var a = Ext.fx.animation.Abstract,
            c;
        if (typeof b == "string") {
            c = b;
            b = {}
        } else {
            if (b && b.type) {
                c = b.type
            }
        }
        if (c) {
            if (Ext.os.is.Android2) {
                if (c == "pop") {
                    c = "fade"
                }
                if (c == "popIn") {
                    c = "fadeIn"
                }
                if (c == "popOut") {
                    c = "fadeOut"
                }
            }
            a = Ext.ClassManager.getByAlias("animation." + c)
        }
        return Ext.factory(b, a)
    }
});
Ext.define("Ext.data.Types", {
    singleton: true,
    requires: ["Ext.data.SortTypes"],
    stripRe: /[\$,%]/g
}, function () {
    var b = this,
        a = Ext.data.SortTypes;
    Ext.apply(b, {
        AUTO: {
            convert: function (c) {
                return c
            },
            sortType: a.none,
            type: "auto"
        },
        STRING: {
            convert: function (c) {
                return (c === undefined || c === null) ? (this.getAllowNull() ? null : "") : String(c)
            },
            sortType: a.asUCString,
            type: "string"
        },
        INT: {
            convert: function (c) {
                return (c !== undefined && c !== null && c !== "") ? ((typeof c === "number") ? parseInt(c, 10) : parseInt(String(c).replace(b.stripRe, ""), 10)) : (this.getAllowNull() ? null : 0)
            },
            sortType: a.none,
            type: "int"
        },
        FLOAT: {
            convert: function (c) {
                return (c !== undefined && c !== null && c !== "") ? ((typeof c === "number") ? c : parseFloat(String(c).replace(b.stripRe, ""), 10)) : (this.getAllowNull() ? null : 0)
            },
            sortType: a.none,
            type: "float"
        },
        BOOL: {
            convert: function (c) {
                if ((c === undefined || c === null || c === "") && this.getAllowNull()) {
                    return null
                }
                return c === true || c === "true" || c == 1
            },
            sortType: a.none,
            type: "bool"
        },
        DATE: {
            convert: function (e) {
                var c = this.getDateFormat(),
                    d;
                if (!e) {
                    return null
                }
                if (Ext.isDate(e)) {
                    return e
                }
                if (c) {
                    if (c == "timestamp") {
                        return new Date(e * 1000)
                    }
                    if (c == "time") {
                        return new Date(parseInt(e, 10))
                    }
                    return Ext.Date.parse(e, c)
                }
                d = new Date(Date.parse(e));
                if (isNaN(d)) {
                    d = new Date(Date.parse(e.replace(/-/g, "/")));
                    if (isNaN(d)) {
                        Ext.Logger.warn("Cannot parse the passed value (" + e + ") into a valid date")
                    }
                }
                return isNaN(d) ? null : d
            },
            sortType: a.asDate,
            type: "date"
        }
    });
    Ext.apply(b, {
        BOOLEAN: this.BOOL,
        INTEGER: this.INT,
        NUMBER: this.FLOAT
    })
});
Ext.define("Ext.data.Field", {
    requires: ["Ext.data.Types", "Ext.data.SortTypes"],
    alias: "data.field",
    isField: true,
    config: {
        name: null,
        type: "auto",
        convert: undefined,
        dateFormat: null,
        allowNull: true,
        defaultValue: undefined,
        mapping: null,
        sortType: undefined,
        sortDir: "ASC",
        allowBlank: true,
        persist: true,
        encode: null,
        decode: null
    },
    constructor: function (a) {
        if (Ext.isString(a)) {
            a = {
                name: a
            }
        }
        this.initConfig(a)
    },
    applyType: function (c) {
        var b = Ext.data.Types,
            a = b.AUTO;
        if (c) {
            if (Ext.isString(c)) {
                return b[c.toUpperCase()] || a
            } else {
                return c
            }
        }
        return a
    },
    updateType: function (a, b) {
        var c = this.getConvert();
        if (b && c === b.convert) {
            this.setConvert(a.convert)
        }
    },
    applySortType: function (d) {
        var c = Ext.data.SortTypes,
            a = this.getType(),
            b = a.sortType;
        if (d) {
            if (Ext.isString(d)) {
                return c[d] || b
            } else {
                return d
            }
        }
        return b
    },
    applyConvert: function (b) {
        var a = this.getType().convert;
        if (b && b !== a) {
            this._hasCustomConvert = true;
            return b
        } else {
            this._hasCustomConvert = false;
            return a
        }
    },
    hasCustomConvert: function () {
        return this._hasCustomConvert
    }
});
Ext.define("Ext.fx.easing.BoundMomentum", {
    extend: "Ext.fx.easing.Abstract",
    requires: ["Ext.fx.easing.Momentum", "Ext.fx.easing.Bounce"],
    config: {
        momentum: null,
        bounce: null,
        minMomentumValue: 0,
        maxMomentumValue: 0,
        minVelocity: 0.01,
        startVelocity: 0
    },
    applyMomentum: function (a, b) {
        return Ext.factory(a, Ext.fx.easing.Momentum, b)
    },
    applyBounce: function (a, b) {
        return Ext.factory(a, Ext.fx.easing.Bounce, b)
    },
    updateStartTime: function (a) {
        this.getMomentum().setStartTime(a);
        this.callParent(arguments)
    },
    updateStartVelocity: function (a) {
        this.getMomentum().setStartVelocity(a)
    },
    updateStartValue: function (a) {
        this.getMomentum().setStartValue(a)
    },
    reset: function () {
        this.lastValue = null;
        this.isBouncingBack = false;
        this.isOutOfBound = false;
        return this.callParent(arguments)
    },
    getValue: function () {
        var a = this.getMomentum(),
            k = this.getBounce(),
            e = a.getStartVelocity(),
            f = e > 0 ? 1 : -1,
            g = this.getMinMomentumValue(),
            d = this.getMaxMomentumValue(),
            c = (f == 1) ? d : g,
            h = this.lastValue,
            j, b;
        if (e === 0) {
            return this.getStartValue()
        }
        if (!this.isOutOfBound) {
            j = a.getValue();
            b = a.getVelocity();
            if (Math.abs(b) < this.getMinVelocity()) {
                this.isEnded = true
            }
            if (j >= g && j <= d) {
                return j
            }
            this.isOutOfBound = true;
            k.setStartTime(Ext.Date.now()).setStartVelocity(b).setStartValue(c)
        }
        j = k.getValue();
        if (!this.isEnded) {
            if (!this.isBouncingBack) {
                if (h !== null) {
                    if ((f == 1 && j < h) || (f == -1 && j > h)) {
                        this.isBouncingBack = true
                    }
                }
            } else {
                if (Math.round(j) == c) {
                    this.isEnded = true
                }
            }
        }
        this.lastValue = j;
        return j
    }
});
Ext.define("Ext.data.Error", {
    extend: "Ext.util.MixedCollection",
    config: {
        field: null,
        message: ""
    },
    constructor: function (a) {
        this.initConfig(a)
    }
});
Ext.define("Ext.data.Errors", {
    extend: "Ext.util.Collection",
    requires: "Ext.data.Error",
    isValid: function () {
        return this.length === 0
    },
    getByField: function (d) {
        var c = [],
            a, b;
        for (b = 0; b < this.length; b++) {
            a = this.items[b];
            if (a.getField() == d) {
                c.push(a)
            }
        }
        return c
    },
    add: function () {
        var a = arguments.length == 1 ? arguments[0] : arguments[1];
        if (!(a instanceof Ext.data.Error)) {
            a = Ext.create("Ext.data.Error", {
                field: a.field || a.name,
                message: a.error || a.message
            })
        }
        return this.callParent([a])
    }
});
Ext.define("Ext.util.HashMap", {
    mixins: {
        observable: "Ext.util.Observable"
    },
    constructor: function (a) {
        this.callParent();
        this.mixins.observable.constructor.call(this);
        this.clear(true)
    },
    getCount: function () {
        return this.length
    },
    getData: function (a, b) {
        if (b === undefined) {
            b = a;
            a = this.getKey(b)
        }
        return [a, b]
    },
    getKey: function (a) {
        return a.id
    },
    add: function (a, d) {
        var b = this,
            c;
        if (b.containsKey(a)) {
            throw new Error("This key already exists in the HashMap")
        }
        c = this.getData(a, d);
        a = c[0];
        d = c[1];
        b.map[a] = d;
        ++b.length;
        b.fireEvent("add", b, a, d);
        return d
    },
    replace: function (b, d) {
        var c = this,
            e = c.map,
            a;
        if (!c.containsKey(b)) {
            c.add(b, d)
        }
        a = e[b];
        e[b] = d;
        c.fireEvent("replace", c, b, d, a);
        return d
    },
    remove: function (b) {
        var a = this.findKey(b);
        if (a !== undefined) {
            return this.removeByKey(a)
        }
        return false
    },
    removeByKey: function (a) {
        var b = this,
            c;
        if (b.containsKey(a)) {
            c = b.map[a];
            delete b.map[a];
            --b.length;
            b.fireEvent("remove", b, a, c);
            return true
        }
        return false
    },
    get: function (a) {
        return this.map[a]
    },
    clear: function (a) {
        var b = this;
        b.map = {};
        b.length = 0;
        if (a !== true) {
            b.fireEvent("clear", b)
        }
        return b
    },
    containsKey: function (a) {
        return this.map[a] !== undefined
    },
    contains: function (a) {
        return this.containsKey(this.findKey(a))
    },
    getKeys: function () {
        return this.getArray(true)
    },
    getValues: function () {
        return this.getArray(false)
    },
    getArray: function (d) {
        var a = [],
            b, c = this.map;
        for (b in c) {
            if (c.hasOwnProperty(b)) {
                a.push(d ? b : c[b])
            }
        }
        return a
    },
    each: function (d, c) {
        var a = Ext.apply({}, this.map),
            b, e = this.length;
        c = c || this;
        for (b in a) {
            if (a.hasOwnProperty(b)) {
                if (d.call(c, b, a[b], e) === false) {
                    break
                }
            }
        }
        return this
    },
    clone: function () {
        var c = new Ext.util.HashMap(),
            b = this.map,
            a;
        c.suspendEvents();
        for (a in b) {
            if (b.hasOwnProperty(a)) {
                c.add(a, b[a])
            }
        }
        c.resumeEvents();
        return c
    },
    findKey: function (b) {
        var a, c = this.map;
        for (a in c) {
            if (c.hasOwnProperty(a) && c[a] === b) {
                return a
            }
        }
        return undefined
    }
});
Ext.define("Ext.AbstractManager", {
    requires: ["Ext.util.HashMap"],
    typeName: "type",
    constructor: function (a) {
        Ext.apply(this, a || {});
        this.all = Ext.create("Ext.util.HashMap");
        this.types = {}
    },
    get: function (a) {
        return this.all.get(a)
    },
    register: function (a) {
        this.all.add(a)
    },
    unregister: function (a) {
        this.all.remove(a)
    },
    registerType: function (b, a) {
        this.types[b] = a;
        a[this.typeName] = b
    },
    isRegistered: function (a) {
        return this.types[a] !== undefined
    },
    create: function (a, d) {
        var b = a[this.typeName] || a.type || d,
            c = this.types[b];
        return new c(a)
    },
    onAvailable: function (e, c, b) {
        var a = this.all,
            d;
        if (a.containsKey(e)) {
            d = a.get(e);
            c.call(b || d, d)
        } else {
            a.on("add", function (h, f, g) {
                if (f == e) {
                    c.call(b || g, g);
                    a.un("add", c, b)
                }
            })
        }
    },
    each: function (b, a) {
        this.all.each(b, a || this)
    },
    getCount: function () {
        return this.all.getCount()
    }
});
Ext.define("Ext.data.ModelManager", {
    extend: "Ext.AbstractManager",
    alternateClassName: ["Ext.ModelMgr", "Ext.ModelManager"],
    singleton: true,
    modelNamespace: null,
    registerType: function (c, b) {
        var d = b.prototype,
            a;
        if (d && d.isModel) {
            a = b
        } else {
            b = {
                extend: b.extend || "Ext.data.Model",
                config: b
            };
            a = Ext.define(c, b)
        }
        this.types[c] = a;
        return a
    },
    onModelDefined: Ext.emptyFn,
    getModel: function (b) {
        var a = b;
        if (typeof a == "string") {
            a = this.types[a];
            if (!a && this.modelNamespace) {
                a = this.types[this.modelNamespace + "." + a]
            }
        }
        return a
    },
    create: function (c, b, d) {
        var a = typeof b == "function" ? b : this.types[b || c.name];
        return new a(c, d)
    }
}, function () {
    Ext.regModel = function () {
        return this.ModelManager.registerType.apply(this.ModelManager, arguments)
    }
});
Ext.define("Ext.data.NodeInterface", {
    requires: ["Ext.data.Field", "Ext.data.ModelManager"],
    alternateClassName: "Ext.data.Node",
    statics: {
        decorate: function (d) {
            if (!d.isNode) {
                var g = Ext.data.ModelManager,
                    c = d.modelName,
                    e = g.getModel(c),
                    b = [],
                    f, h, a;
                e.override(this.getPrototypeBody());
                b = this.applyFields(e, [{
                    name: "parentId",
                    type: "string",
                    defaultValue: null
                }, {
                    name: "index",
                    type: "int",
                    defaultValue: 0
                }, {
                    name: "depth",
                    type: "int",
                    defaultValue: 0
                }, {
                    name: "expanded",
                    type: "bool",
                    defaultValue: false,
                    persist: false
                }, {
                    name: "expandable",
                    type: "bool",
                    defaultValue: true,
                    persist: false
                }, {
                    name: "checked",
                    type: "auto",
                    defaultValue: null
                }, {
                    name: "leaf",
                    type: "bool",
                    defaultValue: false,
                    persist: false
                }, {
                    name: "cls",
                    type: "string",
                    defaultValue: null,
                    persist: false
                }, {
                    name: "iconCls",
                    type: "string",
                    defaultValue: null,
                    persist: false
                }, {
                    name: "root",
                    type: "boolean",
                    defaultValue: false,
                    persist: false
                }, {
                    name: "isLast",
                    type: "boolean",
                    defaultValue: false,
                    persist: false
                }, {
                    name: "isFirst",
                    type: "boolean",
                    defaultValue: false,
                    persist: false
                }, {
                    name: "allowDrop",
                    type: "boolean",
                    defaultValue: true,
                    persist: false
                }, {
                    name: "allowDrag",
                    type: "boolean",
                    defaultValue: true,
                    persist: false
                }, {
                    name: "loaded",
                    type: "boolean",
                    defaultValue: false,
                    persist: false
                }, {
                    name: "loading",
                    type: "boolean",
                    defaultValue: false,
                    persist: false
                }, {
                    name: "href",
                    type: "string",
                    defaultValue: null,
                    persist: false
                }, {
                    name: "hrefTarget",
                    type: "string",
                    defaultValue: null,
                    persist: false
                }, {
                    name: "qtip",
                    type: "string",
                    defaultValue: null,
                    persist: false
                }, {
                    name: "qtitle",
                    type: "string",
                    defaultValue: null,
                    persist: false
                }]);
                a = b.length;
                e.getFields().isDirty = true;
                for (f = 0; f < a; ++f) {
                    h = b[f];
                    if (d.get(h.getName()) === undefined) {
                        d.data[h.getName()] = h.getDefaultValue()
                    }
                }
            }
            if (!d.isDecorated) {
                d.isDecorated = true;
                Ext.applyIf(d, {
                    firstChild: null,
                    lastChild: null,
                    parentNode: null,
                    previousSibling: null,
                    nextSibling: null,
                    childNodes: []
                });
                d.enableBubble(["append", "remove", "move", "insert", "beforeappend", "beforeremove", "beforemove", "beforeinsert", "expand", "collapse", "beforeexpand", "beforecollapse", "sort", "load"])
            }
            return d
        },
        applyFields: function (g, h) {
            var b = g.prototype,
                d = b.fields,
                j = d.keys,
                f = h.length,
                a, c, e = [];
            for (c = 0; c < f; c++) {
                a = h[c];
                if (!Ext.Array.contains(j, a.name)) {
                    a = Ext.create("Ext.data.Field", a);
                    e.push(a);
                    d.add(a)
                }
            }
            return e
        },
        getPrototypeBody: function () {
            return {
                isNode: true,
                createNode: function (a) {
                    if (Ext.isObject(a) && !a.isModel) {
                        a = Ext.data.ModelManager.create(a, this.modelName)
                    }
                    return Ext.data.NodeInterface.decorate(a)
                },
                isLeaf: function () {
                    return this.get("leaf") === true
                },
                setFirstChild: function (a) {
                    this.firstChild = a
                },
                setLastChild: function (a) {
                    this.lastChild = a
                },
                updateInfo: function (g) {
                    var j = this,
                        f = j.parentNode,
                        b = (!f ? true : f.firstChild == j),
                        e = (!f ? true : f.lastChild == j),
                        d = 0,
                        k = j,
                        a = j.childNodes,
                        h = a.length,
                        c;
                    while (k.parentNode) {
                        ++d;
                        k = k.parentNode
                    }
                    j.beginEdit();
                    j.set({
                        isFirst: b,
                        isLast: e,
                        depth: d,
                        index: f ? f.indexOf(j) : 0,
                        parentId: f ? f.getId() : null
                    });
                    j.endEdit(g);
                    if (g) {
                        j.commit(g)
                    }
                    for (c = 0; c < h; c++) {
                        a[c].updateInfo(g)
                    }
                },
                isLast: function () {
                    return this.get("isLast")
                },
                isFirst: function () {
                    return this.get("isFirst")
                },
                hasChildNodes: function () {
                    return !this.isLeaf() && this.childNodes.length > 0
                },
                isExpandable: function () {
                    var a = this;
                    if (a.get("expandable")) {
                        return !(a.isLeaf() || (a.isLoaded() && !a.hasChildNodes()))
                    }
                    return false
                },
                appendChild: function (b, j, h) {
                    var f = this,
                        c, e, d, g, a;
                    if (Ext.isArray(b)) {
                        for (c = 0, e = b.length; c < e; c++) {
                            f.appendChild(b[c])
                        }
                    } else {
                        b = f.createNode(b);
                        if (j !== true && f.fireEvent("beforeappend", f, b) === false) {
                            return false
                        }
                        d = f.childNodes.length;
                        g = b.parentNode;
                        if (g) {
                            if (j !== true && b.fireEvent("beforemove", b, g, f, d) === false) {
                                return false
                            }
                            g.removeChild(b, null, false, true)
                        }
                        d = f.childNodes.length;
                        if (d === 0) {
                            f.setFirstChild(b)
                        }
                        f.childNodes.push(b);
                        b.parentNode = f;
                        b.nextSibling = null;
                        f.setLastChild(b);
                        a = f.childNodes[d - 1];
                        if (a) {
                            b.previousSibling = a;
                            a.nextSibling = b;
                            a.updateInfo(h)
                        } else {
                            b.previousSibling = null
                        }
                        b.updateInfo(h);
                        if (!f.isLoaded()) {
                            f.set("loaded", true)
                        } else {
                            if (f.childNodes.length === 1) {
                                f.set("loaded", f.isLoaded())
                            }
                        }
                        if (j !== true) {
                            f.fireEvent("append", f, b, d);
                            if (g) {
                                b.fireEvent("move", b, g, f, d)
                            }
                        }
                        return b
                    }
                },
                getBubbleTarget: function () {
                    return this.parentNode
                },
                removeChild: function (e, b, c, f) {
                    var d = this,
                        a = d.indexOf(e);
                    if (a == -1 || (c !== true && d.fireEvent("beforeremove", d, e) === false)) {
                        return false
                    }
                    Ext.Array.erase(d.childNodes, a, 1);
                    if (d.firstChild == e) {
                        d.setFirstChild(e.nextSibling)
                    }
                    if (d.lastChild == e) {
                        d.setLastChild(e.previousSibling)
                    }
                    if (c !== true) {
                        d.fireEvent("remove", d, e)
                    }
                    if (e.previousSibling) {
                        e.previousSibling.nextSibling = e.nextSibling;
                        e.previousSibling.updateInfo(f)
                    }
                    if (e.nextSibling) {
                        e.nextSibling.previousSibling = e.previousSibling;
                        e.nextSibling.updateInfo(f)
                    }
                    if (!d.childNodes.length) {
                        d.set("loaded", d.isLoaded())
                    }
                    if (b) {
                        e.destroy(true)
                    } else {
                        e.clear()
                    }
                    return e
                },
                copy: function (d, c) {
                    var f = this,
                        b = f.callOverridden(arguments),
                        a = f.childNodes ? f.childNodes.length : 0,
                        e;
                    if (c) {
                        for (e = 0; e < a; e++) {
                            b.appendChild(f.childNodes[e].copy(true))
                        }
                    }
                    return b
                },
                clear: function (a) {
                    var b = this;
                    b.parentNode = b.previousSibling = b.nextSibling = null;
                    if (a) {
                        b.firstChild = b.lastChild = null
                    }
                },
                destroy: function (a) {
                    var c = this,
                        b = c.destroyOptions;
                    if (a === true) {
                        c.clear(true);
                        Ext.each(c.childNodes, function (d) {
                            d.destroy(true)
                        });
                        c.childNodes = null;
                        delete c.destroyOptions;
                        c.callOverridden([b])
                    } else {
                        c.destroyOptions = a;
                        c.remove(true)
                    }
                },
                insertBefore: function (f, a, d) {
                    var e = this,
                        b = e.indexOf(a),
                        c = f.parentNode,
                        g = b,
                        h;
                    if (!a) {
                        return e.appendChild(f)
                    }
                    if (f == a) {
                        return false
                    }
                    f = e.createNode(f);
                    if (d !== true && e.fireEvent("beforeinsert", e, f, a) === false) {
                        return false
                    }
                    if (c == e && e.indexOf(f) < b) {
                        g--
                    }
                    if (c) {
                        if (d !== true && f.fireEvent("beforemove", f, c, e, b, a) === false) {
                            return false
                        }
                        c.removeChild(f)
                    }
                    if (g === 0) {
                        e.setFirstChild(f)
                    }
                    Ext.Array.splice(e.childNodes, g, 0, f);
                    f.parentNode = e;
                    f.nextSibling = a;
                    a.previousSibling = f;
                    h = e.childNodes[g - 1];
                    if (h) {
                        f.previousSibling = h;
                        h.nextSibling = f;
                        h.updateInfo()
                    } else {
                        f.previousSibling = null
                    }
                    f.updateInfo();
                    if (!e.isLoaded()) {
                        e.set("loaded", true)
                    } else {
                        if (e.childNodes.length === 1) {
                            e.set("loaded", e.isLoaded())
                        }
                    }
                    if (d !== true) {
                        e.fireEvent("insert", e, f, a);
                        if (c) {
                            f.fireEvent("move", f, c, e, g, a)
                        }
                    }
                    return f
                },
                insertChild: function (a, c) {
                    var b = this.childNodes[a];
                    if (b) {
                        return this.insertBefore(c, b)
                    } else {
                        return this.appendChild(c)
                    }
                },
                remove: function (b, c) {
                    var a = this.parentNode;
                    if (a) {
                        a.removeChild(this, b, c, true)
                    }
                    return this
                },
                removeAll: function (a, b) {
                    var d = this.childNodes,
                        c;
                    while ((c = d[0])) {
                        this.removeChild(c, a, b)
                    }
                    return this
                },
                getChildAt: function (a) {
                    return this.childNodes[a]
                },
                replaceChild: function (a, d, c) {
                    var b = d ? d.nextSibling : null;
                    this.removeChild(d, c);
                    this.insertBefore(a, b, c);
                    return d
                },
                indexOf: function (a) {
                    return Ext.Array.indexOf(this.childNodes, a)
                },
                getPath: function (d, c) {
                    d = d || this.idProperty;
                    c = c || "/";
                    var b = [this.get(d)],
                        a = this.parentNode;
                    while (a) {
                        b.unshift(a.get(d));
                        a = a.parentNode
                    }
                    return c + b.join(c)
                },
                getDepth: function () {
                    return this.get("depth")
                },
                bubble: function (c, b, a) {
                    var d = this;
                    while (d) {
                        if (c.apply(b || d, a || [d]) === false) {
                            break
                        }
                        d = d.parentNode
                    }
                },
                cascadeBy: function (d, c, a) {
                    if (d.apply(c || this, a || [this]) !== false) {
                        var f = this.childNodes,
                            e = f.length,
                            b;
                        for (b = 0; b < e; b++) {
                            f[b].cascadeBy(d, c, a)
                        }
                    }
                },
                eachChild: function (d, c, a) {
                    var f = this.childNodes,
                        e = f.length,
                        b;
                    for (b = 0; b < e; b++) {
                        if (d.apply(c || this, a || [f[b]]) === false) {
                            break
                        }
                    }
                },
                findChild: function (b, c, a) {
                    return this.findChildBy(function () {
                        return this.get(b) == c
                    }, null, a)
                },
                findChildBy: function (g, f, b) {
                    var e = this.childNodes,
                        a = e.length,
                        d = 0,
                        h, c;
                    for (; d < a; d++) {
                        h = e[d];
                        if (g.call(f || h, h) === true) {
                            return h
                        } else {
                            if (b) {
                                c = h.findChildBy(g, f, b);
                                if (c !== null) {
                                    return c
                                }
                            }
                        }
                    }
                    return null
                },
                contains: function (a) {
                    return a.isAncestor(this)
                },
                isAncestor: function (a) {
                    var b = this.parentNode;
                    while (b) {
                        if (b == a) {
                            return true
                        }
                        b = b.parentNode
                    }
                    return false
                },
                sort: function (f, b, a) {
                    var d = this.childNodes,
                        e = d.length,
                        c, g;
                    if (e > 0) {
                        Ext.Array.sort(d, f);
                        for (c = 0; c < e; c++) {
                            g = d[c];
                            g.previousSibling = d[c - 1];
                            g.nextSibling = d[c + 1];
                            if (c === 0) {
                                this.setFirstChild(g)
                            }
                            if (c == e - 1) {
                                this.setLastChild(g)
                            }
                            g.updateInfo(a);
                            if (b && !g.isLeaf()) {
                                g.sort(f, true, true)
                            }
                        }
                        this.notifyStores("afterEdit", ["sorted"], {
                            sorted: "sorted"
                        });
                        if (a !== true) {
                            this.fireEvent("sort", this, d)
                        }
                    }
                },
                isExpanded: function () {
                    return this.get("expanded")
                },
                isLoaded: function () {
                    return this.get("loaded")
                },
                isLoading: function () {
                    return this.get("loading")
                },
                isRoot: function () {
                    return !this.parentNode
                },
                isVisible: function () {
                    var a = this.parentNode;
                    while (a) {
                        if (!a.isExpanded()) {
                            return false
                        }
                        a = a.parentNode
                    }
                    return true
                },
                expand: function (a, d, b) {
                    var c = this;
                    if (!c.isLeaf()) {
                        if (c.isLoading()) {
                            c.on("expand", function () {
                                c.expand(a, d, b)
                            }, c, {
                                single: true
                            })
                        } else {
                            if (!c.isExpanded()) {
                                c.fireAction("expand", [this], function () {
                                    c.set("expanded", true);
                                    Ext.callback(d, b || c, [c.childNodes])
                                })
                            } else {
                                Ext.callback(d, b || c, [c.childNodes])
                            }
                        }
                    } else {
                        Ext.callback(d, b || c)
                    }
                },
                collapse: function (a, d, b) {
                    var c = this;
                    if (!c.isLeaf() && c.isExpanded()) {
                        this.fireAction("collapse", [c], function () {
                            c.set("expanded", false);
                            Ext.callback(d, b || c, [c.childNodes])
                        })
                    } else {
                        Ext.callback(d, b || c, [c.childNodes])
                    }
                }
            }
        }
    }
});
Ext.define("Ext.data.association.Association", {
    alternateClassName: "Ext.data.Association",
    requires: ["Ext.data.ModelManager"],
    config: {
        ownerModel: null,
        ownerName: undefined,
        associatedModel: null,
        associatedName: undefined,
        associationKey: undefined,
        primaryKey: "id",
        reader: null,
        type: null,
        name: undefined
    },
    statics: {
        create: function (a) {
            if (!a.isAssociation) {
                if (Ext.isString(a)) {
                    a = {
                        type: a
                    }
                }
                switch (a.type) {
                case "belongsTo":
                    return Ext.create("Ext.data.association.BelongsTo", a);
                case "hasMany":
                    return Ext.create("Ext.data.association.HasMany", a);
                case "hasOne":
                    return Ext.create("Ext.data.association.HasOne", a);
                default:
                }
            }
            return a
        }
    },
    constructor: function (a) {
        this.initConfig(a)
    },
    applyName: function (a) {
        if (!a) {
            a = this.getAssociatedName()
        }
        return a
    },
    applyOwnerModel: function (a) {
        var b = Ext.data.ModelManager.getModel(a);
        if (b === undefined) {
            Ext.Logger.error("The configured ownerModel was not valid (you tried " + a + ")")
        }
        return b
    },
    applyOwnerName: function (a) {
        if (!a) {
            a = this.getOwnerModel().modelName
        }
        a = a.slice(a.lastIndexOf(".") + 1);
        return a
    },
    updateOwnerModel: function (a) {
        this.setOwnerName(a.modelName)
    },
    applyAssociatedModel: function (a) {
        var b = Ext.data.ModelManager.types[a];
        if (b === undefined) {
            Ext.Logger.error("The configured associatedModel was not valid (you tried " + a + ")")
        }
        return b
    },
    applyAssociatedName: function (a) {
        if (!a) {
            a = this.getAssociatedModel().modelName
        }
        a = a.slice(a.lastIndexOf(".") + 1);
        return a
    },
    updateAssociatedModel: function (a) {
        this.setAssociatedName(a.modelName)
    },
    applyReader: function (a) {
        if (a) {
            if (Ext.isString(a)) {
                a = {
                    type: a
                }
            }
            if (!a.isReader) {
                Ext.applyIf(a, {
                    type: "json"
                })
            }
        }
        return Ext.factory(a, Ext.data.Reader, this.getReader(), "reader")
    },
    updateReader: function (a) {
        a.setModel(this.getAssociatedModel())
    }
});
Ext.define("Ext.data.association.HasMany", {
    extend: "Ext.data.association.Association",
    alternateClassName: "Ext.data.HasManyAssociation",
    requires: ["Ext.util.Inflector"],
    alias: "association.hasmany",
    config: {
        foreignKey: undefined,
        store: undefined,
        storeName: undefined,
        filterProperty: null,
        autoLoad: false
    },
    constructor: function (a) {
        a = a || {};
        if (a.storeConfig) {
            a.store = a.storeConfig;
            delete a.storeConfig
        }
        this.callParent([a])
    },
    applyName: function (a) {
        if (!a) {
            a = Ext.util.Inflector.pluralize(this.getAssociatedName().toLowerCase())
        }
        return a
    },
    applyStoreName: function (a) {
        if (!a) {
            a = this.getName() + "Store"
        }
        return a
    },
    applyForeignKey: function (a) {
        if (!a) {
            a = this.getOwnerName().toLowerCase() + "_id"
        }
        return a
    },
    applyAssociationKey: function (a) {
        if (!a) {
            var b = this.getAssociatedName();
            a = Ext.util.Inflector.pluralize(b[0].toLowerCase() + b.slice(1))
        }
        return a
    },
    updateForeignKey: function (b, d) {
        var a = this.getAssociatedModel().getFields(),
            c = a.get(b);
        if (!c) {
            c = new Ext.data.Field({
                name: b
            });
            a.add(c);
            a.isDirty = true
        }
        if (d) {
            c = a.get(d);
            if (c) {
                a.remove(c);
                a.isDirty = true
            }
        }
    },
    applyStore: function (a) {
        var e = this,
            c = e,
            j = e.getAssociatedModel(),
            f = e.getStoreName(),
            d = e.getForeignKey(),
            h = e.getPrimaryKey(),
            g = e.getFilterProperty(),
            b = e.getAutoLoad();
        return function () {
            var n = this,
                l, m, k = {};
            if (n[f] === undefined) {
                if (g) {
                    m = {
                        property: g,
                        value: n.get(g),
                        exactMatch: true
                    }
                } else {
                    m = {
                        property: d,
                        value: n.get(h),
                        exactMatch: true
                    }
                }
                k[d] = n.get(h);
                l = Ext.apply({}, a, {
                    model: j,
                    filters: [m],
                    remoteFilter: true,
                    modelDefaults: k
                });
                n[f] = Ext.create("Ext.data.Store", l);
                if (b) {
                    n[f].load(function (p, o) {
                        c.updateInverseInstances(n)
                    })
                }
            }
            return n[f]
        }
    },
    updateStore: function (a) {
        this.getOwnerModel().prototype[this.getName()] = a
    },
    read: function (c, a, f) {
        var e = c[this.getName()](),
            d = a.read(f).getRecords(),
            b;
        e.add(d);
        this.updateInverseInstances(c)
    },
    updateInverseInstances: function (a) {
        var b = a[this.getName()]();
        inverse = this.getAssociatedModel().associations.findBy(function (c) {
            return c.getType() === "belongsTo" && c.getAssociatedModel().$className === a.$className
        });
        if (inverse) {
            b.each(function (c) {
                c[inverse.getInstanceName()] = a
            })
        }
    }
});
Ext.define("Ext.data.association.BelongsTo", {
    extend: "Ext.data.association.Association",
    alternateClassName: "Ext.data.BelongsToAssociation",
    alias: "association.belongsto",
    config: {
        foreignKey: undefined,
        getterName: undefined,
        setterName: undefined,
        instanceName: undefined
    },
    applyForeignKey: function (a) {
        if (!a) {
            a = this.getAssociatedName().toLowerCase() + "_id"
        }
        return a
    },
    updateForeignKey: function (b, d) {
        var a = this.getOwnerModel().getFields(),
            c = a.get(b);
        if (!c) {
            c = new Ext.data.Field({
                name: b
            });
            a.add(c);
            a.isDirty = true
        }
        if (d) {
            c = a.get(d);
            if (c) {
                a.isDirty = true;
                a.remove(c)
            }
        }
    },
    applyInstanceName: function (a) {
        if (!a) {
            a = this.getAssociatedName() + "BelongsToInstance"
        }
        return a
    },
    applyAssociationKey: function (a) {
        if (!a) {
            var b = this.getAssociatedName();
            a = b[0].toLowerCase() + b.slice(1)
        }
        return a
    },
    applyGetterName: function (a) {
        if (!a) {
            a = "get" + this.getAssociatedName()
        }
        return a
    },
    applySetterName: function (a) {
        if (!a) {
            a = "set" + this.getAssociatedName()
        }
        return a
    },
    updateGetterName: function (b, c) {
        var a = this.getOwnerModel().prototype;
        if (c) {
            delete a[c]
        }
        if (b) {
            a[b] = this.createGetter()
        }
    },
    updateSetterName: function (b, c) {
        var a = this.getOwnerModel().prototype;
        if (c) {
            delete a[c]
        }
        if (b) {
            a[b] = this.createSetter()
        }
    },
    createSetter: function () {
        var b = this,
            a = b.getForeignKey();
        return function (e, c, d) {
            if (e && e.isModel) {
                e = e.getId()
            }
            this.set(a, e);
            if (Ext.isFunction(c)) {
                c = {
                    callback: c,
                    scope: d || this
                }
            }
            if (Ext.isObject(c)) {
                return this.save(c)
            }
        }
    },
    createGetter: function () {
        var c = this,
            d = c.getAssociatedModel(),
            b = c.getForeignKey(),
            a = c.getInstanceName();
        return function (h, j) {
            h = h || {};
            var g = this,
                k = g.get(b),
                l, e, f;
            if (h.reload === true || g[a] === undefined) {
                if (typeof h == "function") {
                    h = {
                        callback: h,
                        scope: j || g
                    }
                }
                l = h.success;
                h.success = function (m) {
                    g[a] = m;
                    if (l) {
                        l.call(this, arguments)
                    }
                };
                d.load(k, h)
            } else {
                e = g[a];
                f = [e];
                j = j || g;
                Ext.callback(h, j, f);
                Ext.callback(h.success, j, f);
                Ext.callback(h.failure, j, f);
                Ext.callback(h.callback, j, f);
                return e
            }
        }
    },
    read: function (b, a, c) {
        b[this.getInstanceName()] = a.read([c]).getRecords()[0]
    }
});
Ext.define("Ext.data.association.HasOne", {
    extend: "Ext.data.association.Association",
    alternateClassName: "Ext.data.HasOneAssociation",
    alias: "association.hasone",
    config: {
        foreignKey: undefined,
        getterName: undefined,
        setterName: undefined,
        instanceName: undefined
    },
    applyForeignKey: function (a) {
        if (!a) {
            a = this.getAssociatedName().toLowerCase() + "_id"
        }
        return a
    },
    updateForeignKey: function (b, d) {
        var a = this.getAssociatedModel().getFields(),
            c = a.get(b);
        if (!c) {
            c = new Ext.data.Field({
                name: b
            });
            a.add(c);
            a.isDirty = true
        }
        if (d) {
            c = a.get(d);
            if (c) {
                a.remove(c);
                a.isDirty = true
            }
        }
    },
    applyInstanceName: function (a) {
        if (!a) {
            a = this.getAssociatedName() + "BelongsToInstance"
        }
        return a
    },
    applyAssociationKey: function (a) {
        if (!a) {
            var b = this.getAssociatedName();
            a = b[0].toLowerCase() + b.slice(1)
        }
        return a
    },
    applyGetterName: function (a) {
        if (!a) {
            a = "get" + this.getAssociatedName()
        }
        return a
    },
    applySetterName: function (a) {
        if (!a) {
            a = "set" + this.getAssociatedName()
        }
        return a
    },
    updateGetterName: function (b, c) {
        var a = this.getOwnerModel().prototype;
        if (c) {
            delete a[c]
        }
        if (b) {
            a[b] = this.createGetter()
        }
    },
    updateSetterName: function (b, c) {
        var a = this.getOwnerModel().prototype;
        if (c) {
            delete a[c]
        }
        if (b) {
            a[b] = this.createSetter()
        }
    },
    createSetter: function () {
        var c = this,
            b = c.getForeignKey(),
            a = c.getInstanceName(),
            d = c.getAssociatedModel();
        return function (h, f, g) {
            var j = Ext.data.Model,
                e;
            if (h && h.isModel) {
                h = h.getId()
            }
            this.set(b, h);
            e = j.cache.get(j.generateCacheId(d.modelName, h));
            if (e) {
                this[a] = e
            }
            if (Ext.isFunction(f)) {
                f = {
                    callback: f,
                    scope: g || this
                }
            }
            if (Ext.isObject(f)) {
                return this.save(f)
            }
        }
    },
    createGetter: function () {
        var c = this,
            d = c.getAssociatedModel(),
            b = c.getForeignKey(),
            a = c.getInstanceName();
        return function (h, j) {
            h = h || {};
            var g = this,
                k = g.get(b),
                l, e, f;
            if (h.reload === true || g[a] === undefined) {
                if (typeof h == "function") {
                    h = {
                        callback: h,
                        scope: j || g
                    }
                }
                l = h.success;
                h.success = function (m) {
                    g[a] = m;
                    if (l) {
                        l.call(this, arguments)
                    }
                };
                d.load(k, h)
            } else {
                e = g[a];
                f = [e];
                j = j || g;
                Ext.callback(h, j, f);
                Ext.callback(h.success, j, f);
                Ext.callback(h.failure, j, f);
                Ext.callback(h.callback, j, f);
                return e
            }
        }
    },
    read: function (c, a, e) {
        var b = this.getAssociatedModel().associations.findBy(function (f) {
            return f.getType() === "belongsTo" && f.getAssociatedName() === c.$className
        }),
            d = a.read([e]).getRecords()[0];
        c[this.getInstanceName()] = d;
        if (b) {
            d[b.getInstanceName()] = c
        }
    }
});
Ext.define("Ext.fx.layout.card.Abstract", {
    extend: "Ext.Evented",
    isAnimation: true,
    config: {
        direction: "left",
        duration: null,
        reverse: null,
        layout: null
    },
    updateLayout: function () {
        this.enable()
    },
    enable: function () {
        var a = this.getLayout();
        if (a) {
            a.onBefore("activeitemchange", "onActiveItemChange", this)
        }
    },
    disable: function () {
        var a = this.getLayout();
        if (a) {
            a.unBefore("activeitemchange", "onActiveItemChange", this)
        }
    },
    onActiveItemChange: Ext.emptyFn,
    destroy: function () {
        var a = this.getLayout();
        if (a) {
            a.unBefore("activeitemchange", "onActiveItemChange", this)
        }
        this.setLayout(null)
    }
});
Ext.define("Ext.fx.layout.card.Style", {
    extend: "Ext.fx.layout.card.Abstract",
    requires: ["Ext.fx.Animation"],
    config: {
        inAnimation: {
            before: {
                visibility: null
            },
            preserveEndState: false,
            replacePrevious: true
        },
        outAnimation: {
            preserveEndState: false,
            replacePrevious: true
        }
    },
    constructor: function (b) {
        var c, a;
        this.initConfig(b);
        this.endAnimationCounter = 0;
        c = this.getInAnimation();
        a = this.getOutAnimation();
        c.on("animationend", "incrementEnd", this);
        a.on("animationend", "incrementEnd", this);
        c.setConfig(b);
        a.setConfig(b)
    },
    incrementEnd: function () {
        this.endAnimationCounter++;
        if (this.endAnimationCounter > 1) {
            this.endAnimationCounter = 0;
            this.fireEvent("animationend", this)
        }
    },
    applyInAnimation: function (b, a) {
        return Ext.factory(b, Ext.fx.Animation, a)
    },
    applyOutAnimation: function (b, a) {
        return Ext.factory(b, Ext.fx.Animation, a)
    },
    updateInAnimation: function (a) {
        a.setScope(this)
    },
    updateOutAnimation: function (a) {
        a.setScope(this)
    },
    onActiveItemChange: function (a, f, k, l, e) {
        var b = this.getInAnimation(),
            j = this.getOutAnimation(),
            g, d, h, c;
        if (f && k && k.isPainted()) {
            g = f.renderElement;
            d = k.renderElement;
            h = b.getElement();
            b.setElement(g);
            c = j.getElement();
            j.setElement(d);
            j.setOnBeforeEnd(function (m, n) {
                if (n || Ext.Animator.hasRunningAnimations(m)) {
                    e.firingArguments[1] = null;
                    e.firingArguments[2] = null
                }
            });
            j.setOnEnd(function () {
                e.resume()
            });
            g.dom.style.setProperty("visibility", "hidden", "!important");
            f.show();
            Ext.Animator.run([j, b]);
            e.pause()
        }
    }
});
Ext.define("Ext.fx.layout.card.Slide", {
    extend: "Ext.fx.layout.card.Style",
    alias: "fx.layout.card.slide",
    config: {
        inAnimation: {
            type: "slide",
            easing: "ease-out"
        },
        outAnimation: {
            type: "slide",
            easing: "ease-out",
            out: true
        }
    },
    updateReverse: function (a) {
        this.getInAnimation().setReverse(a);
        this.getOutAnimation().setReverse(a)
    }
});
Ext.define("Ext.fx.layout.card.Cover", {
    extend: "Ext.fx.layout.card.Style",
    alias: "fx.layout.card.cover",
    config: {
        reverse: null,
        inAnimation: {
            before: {
                "z-index": 100
            },
            after: {
                "z-index": 0
            },
            type: "slide",
            easing: "ease-out"
        },
        outAnimation: {
            easing: "ease-out",
            from: {
                opacity: 0.99
            },
            to: {
                opacity: 1
            },
            out: true
        }
    },
    updateReverse: function (a) {
        this.getInAnimation().setReverse(a);
        this.getOutAnimation().setReverse(a)
    }
});
Ext.define("Ext.fx.layout.card.Reveal", {
    extend: "Ext.fx.layout.card.Style",
    alias: "fx.layout.card.reveal",
    config: {
        inAnimation: {
            easing: "ease-out",
            from: {
                opacity: 0.99
            },
            to: {
                opacity: 1
            }
        },
        outAnimation: {
            before: {
                "z-index": 100
            },
            after: {
                "z-index": 0
            },
            type: "slide",
            easing: "ease-out",
            out: true
        }
    },
    updateReverse: function (a) {
        this.getInAnimation().setReverse(a);
        this.getOutAnimation().setReverse(a)
    }
});
Ext.define("Ext.fx.layout.card.Fade", {
    extend: "Ext.fx.layout.card.Style",
    alias: "fx.layout.card.fade",
    config: {
        reverse: null,
        inAnimation: {
            type: "fade",
            easing: "ease-out"
        },
        outAnimation: {
            type: "fade",
            easing: "ease-out",
            out: true
        }
    }
});
Ext.define("Ext.fx.layout.card.Flip", {
    extend: "Ext.fx.layout.card.Style",
    alias: "fx.layout.card.flip",
    config: {
        duration: 500,
        inAnimation: {
            type: "flip",
            half: true,
            easing: "ease-out",
            before: {
                "backface-visibility": "hidden"
            },
            after: {
                "backface-visibility": null
            }
        },
        outAnimation: {
            type: "flip",
            half: true,
            easing: "ease-in",
            before: {
                "backface-visibility": "hidden"
            },
            after: {
                "backface-visibility": null
            },
            out: true
        }
    },
    updateDuration: function (d) {
        var c = d / 2,
            b = this.getInAnimation(),
            a = this.getOutAnimation();
        b.setDelay(c);
        b.setDuration(c);
        a.setDuration(c)
    }
});
Ext.define("Ext.fx.layout.card.Pop", {
    extend: "Ext.fx.layout.card.Style",
    alias: "fx.layout.card.pop",
    config: {
        duration: 500,
        inAnimation: {
            type: "pop",
            easing: "ease-out"
        },
        outAnimation: {
            type: "pop",
            easing: "ease-in",
            out: true
        }
    },
    updateDuration: function (d) {
        var c = d / 2,
            b = this.getInAnimation(),
            a = this.getOutAnimation();
        b.setDelay(c);
        b.setDuration(c);
        a.setDuration(c)
    }
});
Ext.define("Ext.fx.layout.card.Cube", {
    extend: "Ext.fx.layout.card.Style",
    alias: "fx.layout.card.cube",
    config: {
        reverse: null,
        inAnimation: {
            type: "cube"
        },
        outAnimation: {
            type: "cube",
            out: true
        }
    }
});
Ext.define("Ext.fx.easing.Linear", {
    extend: "Ext.fx.easing.Abstract",
    alias: "easing.linear",
    config: {
        duration: 0,
        endValue: 0
    },
    updateStartValue: function (a) {
        this.distance = this.getEndValue() - a
    },
    updateEndValue: function (a) {
        this.distance = a - this.getStartValue()
    },
    getValue: function () {
        var a = Ext.Date.now() - this.getStartTime(),
            b = this.getDuration();
        if (a > b) {
            this.isEnded = true;
            return this.getEndValue()
        } else {
            return this.getStartValue() + ((a / b) * this.distance)
        }
    }
});
Ext.define("Ext.fx.layout.card.Scroll", {
    extend: "Ext.fx.layout.card.Abstract",
    requires: ["Ext.fx.easing.Linear"],
    alias: "fx.layout.card.scroll",
    config: {
        duration: 150
    },
    constructor: function (a) {
        this.initConfig(a);
        this.doAnimationFrame = Ext.Function.bind(this.doAnimationFrame, this)
    },
    getEasing: function () {
        var a = this.easing;
        if (!a) {
            this.easing = a = new Ext.fx.easing.Linear()
        }
        return a
    },
    updateDuration: function (a) {
        this.getEasing().setDuration(a)
    },
    onActiveItemChange: function (a, d, m, n, c) {
        var j = this.getDirection(),
            g = this.getEasing(),
            l, e, b, h, k, f;
        if (d && m) {
            if (this.isAnimating) {
                this.stopAnimation()
            }
            l = this.getLayout().container.innerElement;
            h = l.getWidth();
            k = l.getHeight();
            e = d.renderElement;
            b = m.renderElement;
            this.oldItem = m;
            this.newItem = d;
            this.currentEventController = c;
            this.containerElement = l;
            this.isReverse = f = this.getReverse();
            d.show();
            if (j == "right") {
                j = "left";
                this.isReverse = f = !f
            } else {
                if (j == "down") {
                    j = "up";
                    this.isReverse = f = !f
                }
            }
            if (j == "left") {
                if (f) {
                    g.setConfig({
                        startValue: h,
                        endValue: 0
                    });
                    l.dom.scrollLeft = h;
                    b.setLeft(h)
                } else {
                    g.setConfig({
                        startValue: 0,
                        endValue: h
                    });
                    e.setLeft(h)
                }
            } else {
                if (f) {
                    g.setConfig({
                        startValue: k,
                        endValue: 0
                    });
                    l.dom.scrollTop = k;
                    b.setTop(k)
                } else {
                    g.setConfig({
                        startValue: 0,
                        endValue: k
                    });
                    e.setTop(k)
                }
            }
            this.startAnimation();
            c.pause()
        }
    },
    startAnimation: function () {
        this.isAnimating = true;
        this.getEasing().setStartTime(Date.now());
        this.timer = setInterval(this.doAnimationFrame, 20);
        this.doAnimationFrame()
    },
    doAnimationFrame: function () {
        var d = this.getEasing(),
            c = this.getDirection(),
            a = "scrollTop",
            b;
        if (c == "left" || c == "right") {
            a = "scrollLeft"
        }
        if (d.isEnded) {
            this.stopAnimation()
        } else {
            b = d.getValue();
            this.containerElement.dom[a] = b
        }
    },
    stopAnimation: function () {
        var b = this.getDirection(),
            a = "setTop";
        if (b == "left" || b == "right") {
            a = "setLeft"
        }
        this.currentEventController.resume();
        if (this.isReverse) {
            this.oldItem.renderElement[a](null)
        } else {
            this.newItem.renderElement[a](null)
        }
        clearInterval(this.timer);
        this.isAnimating = false;
        this.fireEvent("animationend", this)
    }
});
Ext.define("Ext.fx.layout.Card", {
    requires: ["Ext.fx.layout.card.Slide", "Ext.fx.layout.card.Cover", "Ext.fx.layout.card.Reveal", "Ext.fx.layout.card.Fade", "Ext.fx.layout.card.Flip", "Ext.fx.layout.card.Pop", "Ext.fx.layout.card.Cube", "Ext.fx.layout.card.Scroll"],
    constructor: function (b) {
        var a = Ext.fx.layout.card.Abstract,
            c;
        if (!b) {
            return null
        }
        if (typeof b == "string") {
            c = b;
            b = {}
        } else {
            if (b.type) {
                c = b.type
            }
        }
        b.elementBox = false;
        if (c) {
            if (Ext.os.is.Android2) {
                if (c != "fade") {
                    c = "scroll"
                }
            } else {
                if (c === "slide" && Ext.browser.is.ChromeMobile) {
                    c = "scroll"
                }
            }
            a = Ext.ClassManager.getByAlias("fx.layout.card." + c)
        }
        return Ext.factory(b, a)
    }
});
Ext.define("Ext.layout.Card", {
    extend: "Ext.layout.Fit",
    alternateClassName: "Ext.layout.CardLayout",
    isCard: true,
    requires: ["Ext.fx.layout.Card"],
    alias: "layout.card",
    cls: Ext.baseCSSPrefix + "layout-card",
    itemCls: Ext.baseCSSPrefix + "layout-card-item",
    constructor: function () {
        this.callParent(arguments);
        this.container.onInitialized(this.onContainerInitialized, this)
    },
    applyAnimation: function (a) {
        return new Ext.fx.layout.Card(a)
    },
    updateAnimation: function (b, a) {
        if (b && b.isAnimation) {
            b.setLayout(this)
        }
        if (a) {
            a.destroy()
        }
    },
    doItemAdd: function (b, a) {
        if (b.isInnerItem()) {
            b.hide()
        }
        this.callParent(arguments)
    },
    doItemRemove: function (a) {
        this.callParent(arguments);
        if (a.isInnerItem()) {
            a.show()
        }
    },
    onContainerInitialized: function (a) {
        var b = a.getActiveItem();
        if (b) {
            b.show()
        }
        a.on("activeitemchange", "onContainerActiveItemChange", this)
    },
    onContainerActiveItemChange: function (a) {
        this.relayEvent(arguments, "doActiveItemChange")
    },
    doActiveItemChange: function (b, c, a) {
        if (a) {
            a.hide()
        }
        if (c) {
            c.show()
        }
    },
    doItemDockedChange: function (b, c) {
        var a = b.element;
        if (c) {
            a.removeCls(this.itemCls)
        } else {
            a.addCls(this.itemCls)
        }
        this.callParent(arguments)
    }
});
Ext.define("Ext.layout.Layout", {
    requires: ["Ext.layout.Fit", "Ext.layout.Card", "Ext.layout.HBox", "Ext.layout.VBox"],
    constructor: function (a, b) {
        var c = Ext.layout.Default,
            d, e;
        if (typeof b == "string") {
            d = b;
            b = {}
        } else {
            if ("type" in b) {
                d = b.type
            }
        }
        if (d) {
            c = Ext.ClassManager.getByAlias("layout." + d)
        }
        return new c(a, b)
    }
});
Ext.define("Ext.fx.easing.EaseOut", {
    extend: "Ext.fx.easing.Linear",
    alias: "easing.ease-out",
    config: {
        exponent: 4,
        duration: 1500
    },
    getValue: function () {
        var f = Ext.Date.now() - this.getStartTime(),
            d = this.getDuration(),
            b = this.getStartValue(),
            h = this.getEndValue(),
            a = this.distance,
            c = f / d,
            g = 1 - c,
            e = 1 - Math.pow(g, this.getExponent()),
            j = b + (e * a);
        if (f >= d) {
            this.isEnded = true;
            return h
        }
        return j
    }
});
Ext.define("Ext.util.translatable.Abstract", {
    extend: "Ext.Evented",
    requires: ["Ext.fx.easing.Linear"],
    config: {
        element: null,
        easing: null,
        easingX: null,
        easingY: null,
        fps: 60
    },
    constructor: function (a) {
        var b;
        this.doAnimationFrame = Ext.Function.bind(this.doAnimationFrame, this);
        this.x = 0;
        this.y = 0;
        this.activeEasingX = null;
        this.activeEasingY = null;
        this.initialConfig = a;
        if (a && a.element) {
            b = a.element;
            this.setElement(b)
        }
    },
    applyElement: function (a) {
        if (!a) {
            return
        }
        return Ext.get(a)
    },
    updateElement: function (a) {
        this.initConfig(this.initialConfig);
        this.refresh()
    },
    factoryEasing: function (a) {
        return Ext.factory(a, Ext.fx.easing.Linear, null, "easing")
    },
    applyEasing: function (a) {
        if (!this.getEasingX()) {
            this.setEasingX(this.factoryEasing(a))
        }
        if (!this.getEasingY()) {
            this.setEasingY(this.factoryEasing(a))
        }
    },
    applyEasingX: function (a) {
        return this.factoryEasing(a)
    },
    applyEasingY: function (a) {
        return this.factoryEasing(a)
    },
    updateFps: function (a) {
        this.animationInterval = 1000 / a
    },
    doTranslate: function (a, b) {
        if (typeof a == "number") {
            this.x = a
        }
        if (typeof b == "number") {
            this.y = b
        }
        return this
    },
    translate: function (a, c, b) {
        if (Ext.isObject(a)) {
            throw new Error()
        }
        this.stopAnimation();
        if (b !== undefined) {
            return this.translateAnimated(a, c, b)
        }
        return this.doTranslate(a, c)
    },
    animate: function (b, a) {
        this.activeEasingX = b;
        this.activeEasingY = a;
        this.isAnimating = true;
        this.animationTimer = setInterval(this.doAnimationFrame, this.animationInterval);
        this.fireEvent("animationstart", this, this.x, this.y);
        return this
    },
    translateAnimated: function (b, g, e) {
        if (Ext.isObject(b)) {
            throw new Error()
        }
        if (!Ext.isObject(e)) {
            e = {}
        }
        var d = Ext.Date.now(),
            f = e.easing,
            c = (typeof b == "number") ? (e.easingX || this.getEasingX() || f || true) : null,
            a = (typeof g == "number") ? (e.easingY || this.getEasingY() || f || true) : null;
        if (c) {
            c = this.factoryEasing(c);
            c.setStartTime(d);
            c.setStartValue(this.x);
            c.setEndValue(b);
            if ("duration" in e) {
                c.setDuration(e.duration)
            }
        }
        if (a) {
            a = this.factoryEasing(a);
            a.setStartTime(d);
            a.setStartValue(this.y);
            a.setEndValue(g);
            if ("duration" in e) {
                a.setDuration(e.duration)
            }
        }
        return this.animate(c, a)
    },
    doAnimationFrame: function () {
        if (!this.isAnimating) {
            return
        }
        var c = this.activeEasingX,
            b = this.activeEasingY,
            a, d;
        if (c === null && b === null) {
            this.stopAnimation();
            return
        }
        if (c !== null) {
            this.x = a = Math.round(c.getValue());
            if (c.isEnded) {
                this.activeEasingX = null;
                this.fireEvent("axisanimationend", this, "x", a)
            }
        } else {
            a = this.x
        }
        if (b !== null) {
            this.y = d = Math.round(b.getValue());
            if (b.isEnded) {
                this.activeEasingY = null;
                this.fireEvent("axisanimationend", this, "y", d)
            }
        } else {
            d = this.y
        }
        this.doTranslate(a, d);
        this.fireEvent("animationframe", this, a, d)
    },
    stopAnimation: function () {
        if (!this.isAnimating) {
            return
        }
        this.activeEasingX = null;
        this.activeEasingY = null;
        this.isAnimating = false;
        clearInterval(this.animationTimer);
        this.fireEvent("animationend", this, this.x, this.y)
    },
    refresh: function () {
        this.translate(this.x, this.y)
    }
});
Ext.define("Ext.util.translatable.CssTransform", {
    extend: "Ext.util.translatable.Abstract",
    doTranslate: function (a, c) {
        var b = this.getElement().dom.style;
        if (typeof a != "number") {
            a = this.x
        }
        if (typeof c != "number") {
            c = this.y
        }
        b.webkitTransform = "translate3d(" + a + "px, " + c + "px, 0px)";
        return this.callParent(arguments)
    },
    destroy: function () {
        var a = this.getElement();
        if (a && !a.isDestroyed) {
            a.dom.style.webkitTransform = null
        }
        this.callParent(arguments)
    }
});
Ext.define("Ext.util.translatable.ScrollPosition", {
    extend: "Ext.util.translatable.Abstract",
    wrapperWidth: 0,
    wrapperHeight: 0,
    baseCls: "x-translatable",
    config: {
        useWrapper: true
    },
    getWrapper: function () {
        var e = this.wrapper,
            c = this.baseCls,
            b = this.getElement(),
            d, a;
        if (!e) {
            a = b.getParent();
            if (!a) {
                return null
            }
            if (this.getUseWrapper()) {
                e = b.wrap({
                    className: c + "-wrapper"
                }, true)
            } else {
                e = a.dom
            }
            e.appendChild(Ext.Element.create({
                className: c + "-stretcher"
            }, true));
            this.nestedStretcher = d = Ext.Element.create({
                className: c + "-nested-stretcher"
            }, true);
            b.appendChild(d);
            b.addCls(c);
            a.addCls(c + "-container");
            this.container = a;
            this.wrapper = e;
            this.refresh()
        }
        return e
    },
    doTranslate: function (a, c) {
        var b = this.getWrapper();
        if (b) {
            if (typeof a == "number") {
                b.scrollLeft = this.wrapperWidth - a
            }
            if (typeof c == "number") {
                b.scrollTop = this.wrapperHeight - c
            }
        }
        return this.callParent(arguments)
    },
    refresh: function () {
        var a = this.getWrapper();
        if (a) {
            this.wrapperWidth = a.offsetWidth;
            this.wrapperHeight = a.offsetHeight;
            this.callParent(arguments)
        }
    },
    destroy: function () {
        var b = this.getElement(),
            a = this.baseCls;
        if (this.wrapper) {
            if (this.getUseWrapper()) {
                b.unwrap()
            }
            this.container.removeCls(a + "-container");
            b.removeCls(a);
            b.removeChild(this.nestedStretcher)
        }
        this.callParent(arguments)
    }
});
Ext.define("Ext.util.Translatable", {
    requires: ["Ext.util.translatable.CssTransform", "Ext.util.translatable.ScrollPosition"],
    constructor: function (a) {
        var c = Ext.util.translatable,
            e = c.CssTransform,
            d = c.ScrollPosition,
            b;
        if (typeof a == "object" && "translationMethod" in a) {
            if (a.translationMethod === "scrollposition") {
                b = d
            } else {
                if (a.translationMethod === "csstransform") {
                    b = e
                }
            }
        }
        if (!b) {
            if (Ext.os.is.Android2 || Ext.browser.is.ChromeMobile) {
                b = d
            } else {
                b = e
            }
        }
        return new b(a)
    }
});
Ext.define("Ext.behavior.Translatable", {
    extend: "Ext.behavior.Behavior",
    requires: ["Ext.util.Translatable"],
    constructor: function () {
        this.listeners = {
            painted: "onComponentPainted",
            scope: this
        };
        this.callParent(arguments)
    },
    onComponentPainted: function () {
        this.translatable.refresh()
    },
    setConfig: function (c) {
        var a = this.translatable,
            b = this.component;
        if (c) {
            if (!a) {
                this.translatable = a = new Ext.util.Translatable(c);
                a.setElement(b.renderElement);
                a.on("destroy", "onTranslatableDestroy", this);
                if (b.isPainted()) {
                    this.onComponentPainted(b)
                }
                b.on(this.listeners)
            } else {
                if (Ext.isObject(c)) {
                    a.setConfig(c)
                }
            }
        } else {
            if (a) {
                a.destroy()
            }
        }
        return this
    },
    getTranslatable: function () {
        return this.translatable
    },
    onTranslatableDestroy: function () {
        var a = this.component;
        delete this.translatable;
        a.un(this.listeners)
    },
    onComponentDestroy: function () {
        var a = this.translatable;
        if (a) {
            a.destroy()
        }
    }
});
Ext.define("Ext.util.Draggable", {
    isDraggable: true,
    mixins: ["Ext.mixin.Observable"],
    requires: ["Ext.util.SizeMonitor", "Ext.util.Translatable"],
    config: {
        cls: Ext.baseCSSPrefix + "draggable",
        draggingCls: Ext.baseCSSPrefix + "dragging",
        element: null,
        constraint: "container",
        disabled: null,
        direction: "both",
        translatable: {}
    },
    DIRECTION_BOTH: "both",
    DIRECTION_VERTICAL: "vertical",
    DIRECTION_HORIZONTAL: "horizontal",
    constructor: function (a) {
        var b;
        this.sizeMonitors = {};
        this.extraConstraint = {};
        this.initialConfig = a;
        this.offset = {
            x: 0,
            y: 0
        };
        this.listeners = {
            dragstart: "onDragStart",
            drag: "onDrag",
            dragend: "onDragEnd",
            scope: this
        };
        if (a && a.element) {
            b = a.element;
            delete a.element;
            this.setElement(b)
        }
        return this
    },
    applyElement: function (a) {
        if (!a) {
            return
        }
        return Ext.get(a)
    },
    updateElement: function (a) {
        a.on(this.listeners);
        this.sizeMonitors.element = new Ext.util.SizeMonitor({
            element: a,
            callback: this.doRefresh,
            scope: this
        });
        this.initConfig(this.initialConfig)
    },
    updateCls: function (a) {
        this.getElement().addCls(a)
    },
    applyTranslatable: function (a, b) {
        a = Ext.factory(a, Ext.util.Translatable, b);
        a.setElement(this.getElement());
        return a
    },
    setExtraConstraint: function (a) {
        this.extraConstraint = a || {};
        this.refreshConstraint();
        return this
    },
    addExtraConstraint: function (a) {
        Ext.merge(this.extraConstraint, a);
        this.refreshConstraint();
        return this
    },
    applyConstraint: function (b, a) {
        this.currentConstraint = b;
        if (b === "container") {
            return Ext.merge(this.getContainerConstraint(), this.extraConstraint)
        }
        return Ext.merge({}, this.extraConstraint, b)
    },
    updateConstraint: function () {
        this.refreshOffset()
    },
    getContainerConstraint: function () {
        var b = this.getContainer();
        if (!b) {
            return {
                min: {
                    x: -Infinity,
                    y: -Infinity
                },
                max: {
                    x: Infinity,
                    y: Infinity
                }
            }
        }
        var g = this.getElement().dom,
            f = b.dom,
            c = g.offsetWidth,
            a = g.offsetHeight,
            e = f.offsetWidth,
            d = f.offsetHeight;
        return {
            min: {
                x: 0,
                y: 0
            },
            max: {
                x: e - c,
                y: d - a
            }
        }
    },
    getContainer: function () {
        var a = this.container;
        if (!a) {
            a = this.getElement().getParent();
            if (a) {
                this.sizeMonitors.container = new Ext.util.SizeMonitor({
                    element: a,
                    callback: this.doRefresh,
                    scope: this
                });
                this.container = a
            }
        }
        return a
    },
    detachListeners: function () {
        this.getElement().un(this.listeners)
    },
    isAxisEnabled: function (a) {
        var b = this.getDirection();
        if (a === "x") {
            return (b === this.DIRECTION_BOTH || b === this.DIRECTION_HORIZONTAL)
        }
        return (b === this.DIRECTION_BOTH || b === this.DIRECTION_VERTICAL)
    },
    onDragStart: function (a) {
        if (this.getDisabled()) {
            return false
        }
        var b = this.offset;
        this.fireAction("dragstart", [this, a, b.x, b.y], this.initDragStart)
    },
    initDragStart: function (b, c, a, d) {
        this.dragStartOffset = {
            x: a,
            y: d
        };
        this.isDragging = true;
        this.getElement().addCls(this.getDraggingCls())
    },
    onDrag: function (b) {
        if (!this.isDragging) {
            return
        }
        var a = this.dragStartOffset;
        this.fireAction("drag", [this, b, a.x + b.deltaX, a.y + b.deltaY], this.doDrag)
    },
    doDrag: function (b, c, a, d) {
        b.setOffset(a, d)
    },
    onDragEnd: function (a) {
        if (!this.isDragging) {
            return
        }
        this.onDrag(a);
        this.isDragging = false;
        this.getElement().removeCls(this.getDraggingCls());
        this.fireEvent("dragend", this, a, this.offset.x, this.offset.y)
    },
    setOffset: function (j, h, b) {
        var f = this.offset,
            a = this.getConstraint(),
            e = a.min,
            c = a.max,
            d = Math.min,
            g = Math.max;
        if (this.isAxisEnabled("x") && typeof j == "number") {
            j = d(g(j, e.x), c.x)
        } else {
            j = f.x
        }
        if (this.isAxisEnabled("y") && typeof h == "number") {
            h = d(g(h, e.y), c.y)
        } else {
            h = f.y
        }
        f.x = j;
        f.y = h;
        this.getTranslatable().translate(j, h, b)
    },
    getOffset: function () {
        return this.offset
    },
    refreshConstraint: function () {
        this.setConstraint(this.currentConstraint)
    },
    refreshOffset: function () {
        var a = this.offset;
        this.setOffset(a.x, a.y)
    },
    doRefresh: function () {
        this.refreshConstraint();
        this.getTranslatable().refresh();
        this.refreshOffset()
    },
    refresh: function () {
        var a = this.sizeMonitors;
        if (a.element) {
            a.element.refresh()
        }
        if (a.container) {
            a.container.refresh()
        }
        this.doRefresh()
    },
    enable: function () {
        return this.setDisabled(false)
    },
    disable: function () {
        return this.setDisabled(true)
    },
    destroy: function () {
        var b = this.sizeMonitors,
            a = this.getTranslatable();
        if (b.element) {
            b.element.destroy()
        }
        if (b.container) {
            b.container.destroy()
        }
        var c = this.getElement();
        if (c && !c.isDestroyed) {
            c.removeCls(this.getCls())
        }
        this.detachListeners();
        if (a) {
            a.destroy()
        }
    }
}, function () {});
Ext.define("Ext.behavior.Draggable", {
    extend: "Ext.behavior.Behavior",
    requires: ["Ext.util.Draggable"],
    constructor: function () {
        this.listeners = {
            painted: "onComponentPainted",
            scope: this
        };
        this.callParent(arguments)
    },
    onComponentPainted: function () {
        this.draggable.refresh()
    },
    setConfig: function (c) {
        var a = this.draggable,
            b = this.component;
        if (c) {
            if (!a) {
                b.setTranslatable(true);
                this.draggable = a = new Ext.util.Draggable(c);
                a.setTranslatable(b.getTranslatable());
                a.setElement(b.renderElement);
                a.on("destroy", "onDraggableDestroy", this);
                if (b.isPainted()) {
                    this.onComponentPainted(b)
                }
                b.on(this.listeners)
            } else {
                if (Ext.isObject(c)) {
                    a.setConfig(c)
                }
            }
        } else {
            if (a) {
                a.destroy()
            }
        }
        return this
    },
    getDraggable: function () {
        return this.draggable
    },
    onDraggableDestroy: function () {
        var a = this.component;
        delete this.draggable;
        a.un(this.listeners)
    },
    onComponentDestroy: function () {
        var a = this.draggable;
        if (a) {
            a.destroy()
        }
    }
});
(function (a) {
    Ext.define("Ext.Component", {
        extend: "Ext.AbstractComponent",
        alternateClassName: "Ext.lib.Component",
        mixins: ["Ext.mixin.Traversable"],
        requires: ["Ext.ComponentManager", "Ext.XTemplate", "Ext.dom.Element", "Ext.behavior.Translatable", "Ext.behavior.Draggable"],
        xtype: "component",
        observableType: "component",
        cachedConfig: {
            baseCls: null,
            cls: null,
            floatingCls: null,
            hiddenCls: a + "item-hidden",
            ui: null,
            margin: null,
            padding: null,
            border: null,
            styleHtmlCls: a + "html",
            styleHtmlContent: null
        },
        eventedConfig: {
            left: null,
            top: null,
            right: null,
            bottom: null,
            width: null,
            height: null,
            minWidth: null,
            minHeight: null,
            maxWidth: null,
            maxHeight: null,
            docked: null,
            centered: null,
            hidden: null,
            disabled: null
        },
        config: {
            style: null,
            html: null,
            draggable: null,
            translatable: null,
            droppable: null,
            renderTo: null,
            zIndex: null,
            tpl: null,
            enterAnimation: null,
            exitAnimation: null,
            showAnimation: null,
            hideAnimation: null,
            tplWriteMode: "overwrite",
            data: null,
            disabledCls: a + "item-disabled",
            contentEl: null,
            itemId: undefined,
            record: null,
            plugins: null
        },
        listenerOptionsRegex: /^(?:delegate|single|delay|buffer|args|prepend|element)$/,
        alignmentRegex: /^([a-z]+)-([a-z]+)(\?)?$/,
        isComponent: true,
        floating: false,
        rendered: false,
        dockPositions: {
            top: true,
            right: true,
            bottom: true,
            left: true
        },
        innerElement: null,
        element: null,
        template: [],
        constructor: function (c) {
            var d = this,
                b = d.config,
                e;
            d.onInitializedListeners = [];
            d.initialConfig = c;
            if (c !== undefined && "id" in c) {
                e = c.id
            } else {
                if ("id" in b) {
                    e = b.id
                } else {
                    e = d.getId()
                }
            }
            d.id = e;
            d.setId(e);
            Ext.ComponentManager.register(d);
            d.initElement();
            d.initConfig(d.initialConfig);
            d.initialize();
            d.triggerInitialized();
            if ("fullscreen" in d.config) {
                d.fireEvent("fullscreen", d)
            }
            d.fireEvent("initialize", d)
        },
        beforeInitConfig: function (b) {
            this.beforeInitialize.apply(this, arguments)
        },
        beforeInitialize: Ext.emptyFn,
        initialize: Ext.emptyFn,
        getTemplate: function () {
            return this.template
        },
        getElementConfig: function () {
            return {
                reference: "element",
                children: this.getTemplate()
            }
        },
        triggerInitialized: function () {
            var c = this.onInitializedListeners,
                d = c.length,
                e, b;
            if (!this.initialized) {
                this.initialized = true;
                if (d > 0) {
                    for (b = 0; b < d; b++) {
                        e = c[b];
                        e.fn.call(e.scope, this)
                    }
                    c.length = 0
                }
            }
        },
        onInitialized: function (d, c) {
            var b = this.onInitializedListeners;
            if (!c) {
                c = this
            }
            if (this.initialized) {
                d.call(c, this)
            } else {
                b.push({
                    fn: d,
                    scope: c
                })
            }
        },
        renderTo: function (b, d) {
            var f = this.renderElement.dom,
                e = Ext.getDom(b),
                c = Ext.getDom(d);
            if (e) {
                if (c) {
                    e.insertBefore(f, c)
                } else {
                    e.appendChild(f)
                }
                this.setRendered(Boolean(f.offsetParent))
            }
        },
        setParent: function (c) {
            var b = this.parent;
            if (c && b && b !== c) {
                b.remove(this, false)
            }
            this.parent = c;
            return this
        },
        applyPlugins: function (b) {
            var d, c, e;
            if (!b) {
                return b
            }
            b = [].concat(b);
            for (c = 0, d = b.length; c < d; c++) {
                e = b[c];
                b[c] = Ext.factory(e, "Ext.plugin.Plugin", null, "plugin")
            }
            return b
        },
        updatePlugins: function (e, b) {
            var d, c;
            if (e) {
                for (c = 0, d = e.length; c < d; c++) {
                    e[c].init(this)
                }
            }
            if (b) {
                for (c = 0, d = b.length; c < d; c++) {
                    Ext.destroy(b[c])
                }
            }
        },
        updateRenderTo: function (b) {
            this.renderTo(b)
        },
        updateStyle: function (b) {
            this.element.dom.style.cssText += b
        },
        updateBorder: function (b) {
            this.element.setBorder(b)
        },
        updatePadding: function (b) {
            this.innerElement.setPadding(b)
        },
        updateMargin: function (b) {
            this.element.setMargin(b)
        },
        updateUi: function (b, d) {
            var c = this.getBaseCls();
            if (c) {
                if (d) {
                    this.element.removeCls(d, c)
                }
                if (b) {
                    this.element.addCls(b, c)
                }
            }
        },
        applyBaseCls: function (b) {
            return b || a + this.xtype
        },
        updateBaseCls: function (b, c) {
            var d = this,
                e = d.getUi();
            if (b) {
                this.element.addCls(b);
                if (e) {
                    this.element.addCls(b, null, e)
                }
            }
            if (c) {
                this.element.removeCls(c);
                if (e) {
                    this.element.removeCls(c, null, e)
                }
            }
        },
        addCls: function (b, h, j) {
            var e = this.getCls(),
                g = (e) ? e.slice() : [],
                f, d, c;
            h = h || "";
            j = j || "";
            if (typeof b == "string") {
                b = [b]
            }
            f = b.length;
            if (!g.length && h === "" && j === "") {
                g = b
            } else {
                for (d = 0; d < f; d++) {
                    c = h + b[d] + j;
                    if (g.indexOf(c) == -1) {
                        g.push(c)
                    }
                }
            }
            this.setCls(g)
        },
        removeCls: function (b, g, h) {
            var d = this.getCls(),
                f = (d) ? d.slice() : [],
                e, c;
            g = g || "";
            h = h || "";
            if (typeof b == "string") {
                f = Ext.Array.remove(f, g + b + h)
            } else {
                e = b.length;
                for (c = 0; c < e; c++) {
                    f = Ext.Array.remove(f, g + b[c] + h)
                }
            }
            this.setCls(f)
        },
        replaceCls: function (e, j, d, h) {
            var k = this.getCls(),
                f = (k) ? k.slice() : [],
                g, c, b;
            d = d || "";
            h = h || "";
            if (typeof e == "string") {
                f = Ext.Array.remove(f, d + e + h)
            } else {
                if (e) {
                    g = e.length;
                    for (c = 0; c < g; c++) {
                        f = Ext.Array.remove(f, d + e[c] + h)
                    }
                }
            }
            if (typeof j == "string") {
                f.push(d + j + h)
            } else {
                if (j) {
                    g = j.length;
                    if (!f.length && d === "" && h === "") {
                        f = j
                    } else {
                        for (c = 0; c < g; c++) {
                            b = d + j[c] + h;
                            if (f.indexOf(b) == -1) {
                                f.push(b)
                            }
                        }
                    }
                }
            }
            this.setCls(f)
        },
        applyCls: function (b) {
            if (typeof b == "string") {
                b = [b]
            }
            if (!b || !b.length) {
                b = null
            }
            return b
        },
        updateCls: function (c, b) {
            this.element.replaceCls(b, c)
        },
        updateStyleHtmlCls: function (d, b) {
            var e = this.innerHtmlElement,
                c = this.innerElement;
            if (this.getStyleHtmlContent() && b) {
                if (e) {
                    e.replaceCls(b, d)
                } else {
                    c.replaceCls(b, d)
                }
            }
        },
        applyStyleHtmlContent: function (b) {
            return Boolean(b)
        },
        updateStyleHtmlContent: function (d) {
            var b = this.getStyleHtmlCls(),
                c = this.innerElement,
                e = this.innerHtmlElement;
            if (d) {
                if (e) {
                    e.addCls(b)
                } else {
                    c.addCls(b)
                }
            } else {
                if (e) {
                    e.removeCls(b)
                } else {
                    c.addCls(b)
                }
            }
        },
        applyContentEl: function (b) {
            if (b) {
                return Ext.get(b)
            }
        },
        updateContentEl: function (b, c) {
            if (c) {
                c.hide();
                Ext.getBody().append(c)
            }
            if (b) {
                this.setHtml(b.dom);
                b.show()
            }
        },
        getSize: function () {
            return {
                width: this.getWidth(),
                height: this.getHeight()
            }
        },
        isCentered: function () {
            return Boolean(this.getCentered())
        },
        isFloating: function () {
            return this.floating
        },
        isDocked: function () {
            return Boolean(this.getDocked())
        },
        isInnerItem: function () {
            var b = this;
            return !b.isCentered() && !b.isFloating() && !b.isDocked()
        },
        filterPositionValue: function (b) {
            if (b === "" || b === "auto") {
                b = null
            }
            return b
        },
        applyTop: function (b) {
            return this.filterPositionValue(b)
        },
        applyRight: function (b) {
            return this.filterPositionValue(b)
        },
        applyBottom: function (b) {
            return this.filterPositionValue(b)
        },
        applyLeft: function (b) {
            return this.filterPositionValue(b)
        },
        doSetTop: function (b) {
            this.updateFloating();
            this.element.setTop(b)
        },
        doSetRight: function (b) {
            this.updateFloating();
            this.element.setRight(b)
        },
        doSetBottom: function (b) {
            this.updateFloating();
            this.element.setBottom(b)
        },
        doSetLeft: function (b) {
            this.updateFloating();
            this.element.setLeft(b)
        },
        doSetWidth: function (b) {
            this.element.setWidth(b)
        },
        doSetHeight: function (b) {
            this.element.setHeight(b)
        },
        doSetMinWidth: function (b) {
            this.element.setMinWidth(b)
        },
        doSetMinHeight: function (b) {
            this.element.setMinHeight(b)
        },
        doSetMaxWidth: function (b) {
            this.element.setMaxWidth(b)
        },
        doSetMaxHeight: function (b) {
            this.element.setMaxHeight(b)
        },
        applyCentered: function (b) {
            b = Boolean(b);
            if (b) {
                if (this.isFloating()) {
                    this.resetFloating()
                }
                if (this.isDocked()) {
                    this.setDocked(false)
                }
            }
            return b
        },
        doSetCentered: Ext.emptyFn,
        applyDocked: function (b) {
            if (b) {
                if (!this.dockPositions[b]) {
                    return
                }
                if (this.isFloating()) {
                    this.resetFloating()
                }
                if (this.isCentered()) {
                    this.setCentered(false)
                }
            }
            return b
        },
        doSetDocked: Ext.emptyFn,
        resetFloating: function () {
            this.setTop(null);
            this.setRight(null);
            this.setBottom(null);
            this.setLeft(null)
        },
        updateFloating: function () {
            var c = true,
                b = this.getFloatingCls();
            if (this.getTop() === null && this.getBottom() === null && this.getRight() === null && this.getLeft() === null) {
                c = false
            }
            if (c !== this.floating) {
                if (c) {
                    if (this.isCentered()) {
                        this.setCentered(false)
                    }
                    if (this.isDocked()) {
                        this.setDocked(false)
                    }
                    if (b) {
                        this.addCls(b)
                    }
                } else {
                    if (b) {
                        this.removeCls(b)
                    }
                }
                this.floating = c;
                this.fireEvent("floatingchange", this, c)
            }
        },
        updateFloatingCls: function (b, c) {
            if (this.isFloating()) {
                this.replaceCls(c, b)
            }
        },
        applyDisabled: function (b) {
            return Boolean(b)
        },
        doSetDisabled: function (b) {
            this.element[b ? "addCls" : "removeCls"](this.getDisabledCls())
        },
        updateDisabledCls: function (b, c) {
            if (this.isDisabled()) {
                this.element.replaceCls(c, b)
            }
        },
        disable: function () {
            this.setDisabled(true)
        },
        enable: function () {
            this.setDisabled(false)
        },
        isDisabled: function () {
            return this.getDisabled()
        },
        applyZIndex: function (b) {
            if (b !== null) {
                b = Number(b);
                if (isNaN(b)) {
                    b = null
                }
            }
            return b
        },
        updateZIndex: function (c) {
            var b = this.element.dom.style;
            if (c !== null) {
                b.setProperty("z-index", c, "important")
            } else {
                b.removeProperty("z-index")
            }
        },
        getInnerHtmlElement: function () {
            var b = this.innerHtmlElement,
                c = this.getStyleHtmlCls();
            if (!b || !b.dom || !b.dom.parentNode) {
                this.innerHtmlElement = b = this.innerElement.createChild({
                    cls: "x-innerhtml "
                });
                if (this.getStyleHtmlContent()) {
                    this.innerHtmlElement.addCls(c);
                    this.innerElement.removeCls(c)
                }
            }
            return b
        },
        updateHtml: function (b) {
            var c = this.getInnerHtmlElement();
            if (Ext.isElement(b)) {
                c.setHtml("");
                c.append(b)
            } else {
                c.setHtml(b)
            }
        },
        applyHidden: function (b) {
            return Boolean(b)
        },
        doSetHidden: function (c) {
            var b = this.renderElement;
            if (c) {
                b.hide()
            } else {
                b.show()
            }
            if (this.element) {
                this.element[c ? "addCls" : "removeCls"](this.getHiddenCls())
            }
            this.fireEvent(c ? "hide" : "show", this)
        },
        updateHiddenCls: function (b, c) {
            if (this.isHidden()) {
                this.element.replaceCls(c, b)
            }
        },
        isHidden: function () {
            return this.getHidden()
        },
        hide: function (b) {
            if (!this.getHidden()) {
                if (b === undefined || (b && b.isComponent)) {
                    b = this.getHideAnimation()
                }
                if (b) {
                    if (b === true) {
                        b = "fadeOut"
                    }
                    this.onBefore({
                        hiddenchange: "animateFn",
                        scope: this,
                        single: true,
                        args: [b]
                    })
                }
                this.setHidden(true)
            }
            return this
        },
        show: function (c) {
            var b = this.getHidden();
            if (b || b === null) {
                if (c === undefined || (c && !c.isComponent)) {
                    c = this.getShowAnimation()
                }
                if (c) {
                    if (c === true) {
                        c = "fadeIn"
                    }
                    this.onBefore({
                        hiddenchange: "animateFn",
                        scope: this,
                        single: true,
                        args: [c]
                    })
                }
                this.setHidden(false)
            }
            return this
        },
        animateFn: function (g, e, h, d, c, b) {
            if (g) {
                var f = new Ext.fx.Animation(g);
                f.setElement(e.element);
                if (h) {
                    f.setOnEnd(function () {
                        b.resume()
                    });
                    b.pause()
                }
                Ext.Animator.run(f)
            }
        },
        setVisibility: function (b) {
            this.renderElement.setVisibility(b)
        },
        isRendered: function () {
            return this.rendered
        },
        isPainted: function () {
            return this.renderElement.isPainted()
        },
        applyTpl: function (b) {
            return (Ext.isObject(b) && b.isTemplate) ? b : new Ext.XTemplate(b)
        },
        applyData: function (b) {
            if (Ext.isObject(b)) {
                return Ext.apply({}, b)
            }
            return b
        },
        updateData: function (d) {
            var e = this;
            if (d) {
                var c = e.getTpl(),
                    b = e.getTplWriteMode();
                if (c) {
                    c[b](e.getInnerHtmlElement(), d)
                }
                this.fireEvent("updatedata", e, d)
            }
        },
        applyRecord: function (b) {
            if (b && Ext.isObject(b) && b.isModel) {
                return b
            }
            return null
        },
        updateRecord: function (c, b) {
            var d = this;
            if (b) {
                b.unjoin(d)
            }
            if (!c) {
                d.updateData("")
            } else {
                c.join(d);
                d.updateData(c.getData(true))
            }
        },
        afterEdit: function () {
            this.updateRecord(this.getRecord())
        },
        afterErase: function () {
            this.setRecord(null)
        },
        applyItemId: function (b) {
            return b || this.getId()
        },
        isXType: function (c, b) {
            if (b) {
                return this.xtypes.indexOf(c) != -1
            }
            return Boolean(this.xtypesMap[c])
        },
        getXTypes: function () {
            return this.xtypesChain.join("/")
        },
        getDraggableBehavior: function () {
            var b = this.draggableBehavior;
            if (!b) {
                b = this.draggableBehavior = new Ext.behavior.Draggable(this)
            }
            return b
        },
        applyDraggable: function (b) {
            this.getDraggableBehavior().setConfig(b)
        },
        getDraggable: function () {
            return this.getDraggableBehavior().getDraggable()
        },
        getTranslatableBehavior: function () {
            var b = this.translatableBehavior;
            if (!b) {
                b = this.translatableBehavior = new Ext.behavior.Translatable(this)
            }
            return b
        },
        applyTranslatable: function (b) {
            this.getTranslatableBehavior().setConfig(b)
        },
        getTranslatable: function () {
            return this.getTranslatableBehavior().getTranslatable()
        },
        translateAxis: function (c, e, d) {
            var b, f;
            if (c === "x") {
                b = e
            } else {
                f = e
            }
            return this.translate(b, f, d)
        },
        translate: function () {
            var b = this.getTranslatable();
            if (!b) {
                this.setTranslatable(true);
                b = this.getTranslatable()
            }
            b.translate.apply(b, arguments)
        },
        setRendered: function (c) {
            var b = this.rendered;
            if (c !== b) {
                this.rendered = c;
                return true
            }
            return false
        },
        setSize: function (c, b) {
            if (c != undefined) {
                this.setWidth(c)
            }
            if (b != undefined) {
                this.setHeight(b)
            }
        },
        doAddListener: function (d, f, e, c, b) {
            if (c && "element" in c) {
                this[c.element].doAddListener(d, f, e || this, c, b)
            }
            return this.callParent(arguments)
        },
        doRemoveListener: function (d, f, e, c, b) {
            if (c && "element" in c) {
                this[c.element].doRemoveListener(d, f, e || this, c, b)
            }
            return this.callParent(arguments)
        },
        showBy: function (d, f) {
            var c = Ext.Array.from(arguments);
            if (!this.currentShowByArgs) {
                var b = Ext.Viewport,
                    e = this.getParent();
                this.setVisibility(false);
                if (e !== b) {
                    b.add(this)
                }
                this.show();
                this.on("erased", "onShowByErased", this, {
                    single: true
                });
                b.on("resize", "refreshShowBy", this)
            }
            this.currentShowByArgs = c;
            this.alignTo.apply(this, arguments);
            this.setVisibility(true)
        },
        refreshShowBy: function () {
            this.alignTo.apply(this, this.currentShowByArgs)
        },
        onShowByErased: function () {
            delete this.currentShowByArgs;
            Ext.Viewport.un("resize", "refreshShowBy", this)
        },
        alignTo: function (m, h) {
            var f = m.isComponent ? m.renderElement : m,
                c = this.renderElement,
                o = f.getPageBox(),
                y = this.getParent().element.getPageBox(),
                l = c.getPageBox(),
                v = o.height,
                n = o.width,
                q = l.height,
                s = l.width;
            if (!h || h === "auto") {
                if (y.bottom - o.bottom < q) {
                    if (o.top - y.top < q) {
                        if (o.left - y.left < s) {
                            h = "cl-cr?"
                        } else {
                            h = "cr-cl?"
                        }
                    } else {
                        h = "bc-tc?"
                    }
                } else {
                    h = "tc-bc?"
                }
            }
            var b = h.match(this.alignmentRegex);
            var t = b[1].split(""),
                d = b[2].split(""),
                w = (b[3] === "?"),
                g = t[0],
                r = t[1] || g,
                k = d[0],
                j = d[1] || k,
                p = o.top,
                e = o.left,
                u, x;
            switch (g) {
            case "t":
                switch (k) {
                case "c":
                    p += v / 2;
                    break;
                case "b":
                    p += v
                }
                break;
            case "b":
                switch (k) {
                case "c":
                    p -= (q - (v / 2));
                    break;
                case "t":
                    p -= q;
                    break;
                case "b":
                    p -= q - v
                }
                break;
            case "c":
                switch (k) {
                case "t":
                    p -= (q / 2);
                    break;
                case "c":
                    p -= ((q / 2) - (v / 2));
                    break;
                case "b":
                    p -= ((q / 2) - v)
                }
                break
            }
            switch (r) {
            case "l":
                switch (j) {
                case "c":
                    e += n / 2;
                    break;
                case "r":
                    e += n
                }
                break;
            case "r":
                switch (j) {
                case "r":
                    e -= (s - n);
                    break;
                case "c":
                    e -= (s - (n / 2));
                    break;
                case "l":
                    e -= s
                }
                break;
            case "c":
                switch (j) {
                case "l":
                    e -= (s / 2);
                    break;
                case "c":
                    e -= ((s / 2) - (n / 2));
                    break;
                case "r":
                    e -= ((s / 2) - n)
                }
                break
            }
            if (w) {
                u = (y.left + y.width) - s;
                x = (y.top + y.height) - q;
                e = Math.max(y.left, Math.min(u, e));
                p = Math.max(y.top, Math.min(x, p))
            }
            this.setLeft(e);
            this.setTop(p)
        },
        up: function (c) {
            var b = this.parent;
            if (c) {
                for (; b; b = b.parent) {
                    if (Ext.ComponentQuery.is(b, c)) {
                        return b
                    }
                }
            }
            return b
        },
        getBubbleTarget: function () {
            return this.getParent()
        },
        destroy: function () {
            this.destroy = Ext.emptyFn;
            var e = this.getParent(),
                c = this.referenceList,
                d, f, b;
            if (e) {
                e.remove(this, false)
            }
            for (d = 0, f = c.length; d < f; d++) {
                b = c[d];
                this[b].destroy();
                delete this[b]
            }
            this.setRecord(null);
            Ext.destroy(this.innerHtmlElement, this.getTranslatable());
            Ext.ComponentManager.unregister(this);
            this.callParent()
        }
    }, function () {})
})(Ext.baseCSSPrefix);
Ext.define("Ext.Button", {
    extend: "Ext.Component",
    xtype: "button",
    cachedConfig: {
        pressedCls: Ext.baseCSSPrefix + "button-pressed",
        badgeCls: Ext.baseCSSPrefix + "badge",
        hasBadgeCls: Ext.baseCSSPrefix + "hasbadge",
        labelCls: Ext.baseCSSPrefix + "button-label",
        iconMaskCls: Ext.baseCSSPrefix + "icon-mask"
    },
    config: {
        badgeText: null,
        text: null,
        iconCls: null,
        icon: null,
        iconAlign: "left",
        pressedDelay: 0,
        iconMask: null,
        handler: null,
        scope: null,
        autoEvent: null,
        ui: "normal",
        baseCls: Ext.baseCSSPrefix + "button"
    },
    template: [{
        tag: "span",
        reference: "badgeElement",
        hidden: true
    }, {
        tag: "span",
        className: Ext.baseCSSPrefix + "button-icon",
        reference: "iconElement",
        hidden: true
    }, {
        tag: "span",
        reference: "textElement",
        hidden: true
    }],
    initialize: function () {
        this.callParent();
        this.element.on({
            scope: this,
            tap: "onTap",
            touchstart: "onPress",
            touchmove: "onTouchMove",
            touchend: "onRelease"
        })
    },
    updateBadgeText: function (c) {
        var a = this.element,
            b = this.badgeElement;
        if (c) {
            b.show();
            b.setText(c)
        } else {
            b.hide()
        }
        a[(c) ? "addCls" : "removeCls"](this.getHasBadgeCls())
    },
    updateText: function (b) {
        var a = this.textElement;
        if (b) {
            a.show();
            a.setHtml(b)
        } else {
            a.hide()
        }
    },
    updateHtml: function (b) {
        var a = this.textElement;
        if (b) {
            a.show();
            a.setHtml(b)
        } else {
            a.hide()
        }
    },
    updateBadgeCls: function (b, a) {
        this.badgeElement.replaceCls(a, b)
    },
    updateHasBadgeCls: function (b, c) {
        var a = this.element;
        if (a.hasCls(c)) {
            a.replaceCls(c, b)
        }
    },
    updateLabelCls: function (b, a) {
        this.textElement.replaceCls(a, b)
    },
    updatePressedCls: function (b, c) {
        var a = this.element;
        if (a.hasCls(c)) {
            a.replaceCls(c, b)
        }
    },
    updateIcon: function (b) {
        var c = this,
            a = c.iconElement;
        if (b) {
            c.showIconElement();
            a.setStyle("background-image", b ? "url(" + b + ")" : "");
            c.refreshIconAlign();
            c.refreshIconMask()
        } else {
            c.hideIconElement();
            c.setIconAlign(false)
        }
    },
    updateIconCls: function (c, a) {
        var d = this,
            b = d.iconElement;
        if (c) {
            d.showIconElement();
            b.replaceCls(a, c);
            d.refreshIconAlign();
            d.refreshIconMask()
        } else {
            d.hideIconElement();
            d.setIconAlign(false)
        }
    },
    updateIconAlign: function (d, c) {
        var b = this.element,
            a = Ext.baseCSSPrefix + "iconalign-";
        if (!this.getText()) {
            d = "center"
        }
        b.removeCls(a + "center");
        b.removeCls(a + c);
        if (this.getIcon() || this.getIconCls()) {
            b.addCls(a + d)
        }
    },
    refreshIconAlign: function () {
        this.updateIconAlign(this.getIconAlign())
    },
    updateIconMaskCls: function (c, b) {
        var a = this.iconElement;
        if (this.getIconMask()) {
            a.replaceCls(b, c)
        }
    },
    updateIconMask: function (a) {
        this.iconElement[a ? "addCls" : "removeCls"](this.getIconMaskCls())
    },
    refreshIconMask: function () {
        this.updateIconMask(this.getIconMask())
    },
    applyAutoEvent: function (b) {
        var a = this;
        if (typeof b == "string") {
            b = {
                name: b,
                scope: a.scope || a
            }
        }
        return b
    },
    updateAutoEvent: function (c) {
        var a = c.name,
            b = c.scope;
        this.setHandler(function () {
            b.fireEvent(a, b, this)
        });
        this.setScope(b)
    },
    hideIconElement: function () {
        this.iconElement.hide()
    },
    showIconElement: function () {
        this.iconElement.show()
    },
    applyUi: function (a) {
        if (a && Ext.isString(a)) {
            var b = a.split("-");
            if (b && (b[1] == "back" || b[1] == "forward")) {
                return b
            }
        }
        return a
    },
    getUi: function () {
        var a = this._ui;
        if (Ext.isArray(a)) {
            return a.join("-")
        }
        return a
    },
    applyPressedDelay: function (a) {
        if (Ext.isNumber(a)) {
            return a
        }
        return (a) ? 100 : 0
    },
    onPress: function () {
        var a = this.element,
            c = this.getPressedDelay(),
            b = this.getPressedCls();
        if (!this.getDisabled()) {
            this.isPressed = true;
            if (this.hasOwnProperty("releasedTimeout")) {
                clearTimeout(this.releasedTimeout);
                delete this.releasedTimeout
            }
            if (c > 0) {
                this.pressedTimeout = setTimeout(function () {
                    if (a) {
                        a.addCls(b)
                    }
                }, c)
            } else {
                a.addCls(b)
            }
        }
    },
    onTouchMove: function (a) {
        return
    },
    onRelease: function (a) {
        this.fireAction("release", [this, a], "doRelease")
    },
    doRelease: function (a, b) {
        if (!a.isPressed) {
            return
        }
        a.isPressed = true;
        if (a.hasOwnProperty("pressedTimeout")) {
            clearTimeout(a.pressedTimeout);
            delete a.pressedTimeout
        }
        a.releasedTimeout = setTimeout(function () {
            if (a && a.element) {
                a.element.removeCls(a.getPressedCls())
            }
        }, 10)
    },
    onTap: function (a) {
        if (this.getDisabled()) {
            return false
        }
        this.fireAction("tap", [this, a], "doTap")
    },
    doTap: function (c, d) {
        var b = c.getHandler(),
            a = c.getScope() || c;
        if (!b) {
            return
        }
        if (typeof b == "string") {
            b = a[b]
        }
        d.preventDefault();
        b.apply(a, arguments)
    }
}, function () {});
Ext.define("Ext.Title", {
    extend: "Ext.Component",
    xtype: "title",
    config: {
        baseCls: "x-title",
        title: ""
    },
    updateTitle: function (a) {
        this.setHtml(a)
    }
});
Ext.define("Ext.Spacer", {
    extend: "Ext.Component",
    alias: "widget.spacer",
    config: {},
    constructor: function (a) {
        a = a || {};
        if (!a.width) {
            a.flex = 1
        }
        this.callParent([a])
    }
});
Ext.define("Kitchensink.view.touchevent.Info", {
    extend: "Ext.Component",
    xtype: "toucheventinfo",
    config: {
        styleHtmlContent: true,
        html: ["<p>Sencha Touch comes with a multitude of touch events available on components. Included touch events that can be used are:</p>", "<ul>", "<li>touchstart</li>", "<li>touchmove</li>", "<li>touchend</li>", "<li>dragstart</li>", "<li>drag</li>", "<li>dragend</li>", "<li>tap</li>", "<li>singletap</li>", "<li>doubletap</li>", "<li>longpress</li>", "<li>swipe</li>", "<li>pinch (on iOS and Android 3+)</li>", "<li>rotate (on iOS and Android 3+)</li>", "</ul>"].join("")
    }
});
Ext.define("Ext.Mask", {
    extend: "Ext.Component",
    xtype: "mask",
    config: {
        baseCls: Ext.baseCSSPrefix + "mask",
        transparent: false,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    initialize: function () {
        this.callParent();
        this.on({
            painted: "onPainted",
            erased: "onErased"
        })
    },
    onPainted: function () {
        this.element.on("*", "onEvent", this)
    },
    onErased: function () {
        this.element.un("*", "onEvent", this)
    },
    onEvent: function (b) {
        var a = arguments[arguments.length - 1];
        if (a.info.eventName === "tap") {
            this.fireEvent("tap", this, b);
            return false
        }
        if (b && b.stopEvent) {
            b.stopEvent()
        }
        return false
    },
    updateTransparent: function (a) {
        this[a ? "addCls" : "removeCls"](this.getBaseCls() + "-transparent")
    }
});
Ext.define("Ext.dataview.IndexBar", {
    extend: "Ext.Component",
    alternateClassName: "Ext.IndexBar",
    config: {
        baseCls: Ext.baseCSSPrefix + "indexbar",
        direction: "vertical",
        letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        ui: "alphabet",
        listPrefix: null
    },
    itemCls: Ext.baseCSSPrefix + "",
    updateDirection: function (a, c) {
        var b = this.getBaseCls();
        this.element.replaceCls(b + "-" + c, b + "-" + a)
    },
    getElementConfig: function () {
        return {
            reference: "wrapper",
            classList: ["x-centered", "x-indexbar-wrapper"],
            children: [this.callParent()]
        }
    },
    updateLetters: function (c) {
        this.innerElement.setHtml("");
        if (c) {
            var b = c.length,
                a;
            for (a = 0; a < b; a++) {
                this.innerElement.createChild({
                    html: c[a]
                })
            }
        }
    },
    updateListPrefix: function (a) {
        if (a && a.length) {
            this.innerElement.createChild({
                html: a
            }, 0)
        }
    },
    initialize: function () {
        this.callParent();
        this.innerElement.on({
            touchstart: this.onTouchStart,
            touchend: this.onTouchEnd,
            touchmove: this.onTouchMove,
            scope: this
        })
    },
    onTouchStart: function (b, a) {
        b.stopPropagation();
        this.innerElement.addCls(this.getBaseCls() + "-pressed");
        this.pageBox = this.innerElement.getPageBox();
        this.onTouchMove(b)
    },
    onTouchEnd: function (b, a) {
        this.innerElement.removeCls(this.getBaseCls() + "-pressed")
    },
    onTouchMove: function (c) {
        var a = Ext.util.Point.fromEvent(c),
            b, d = this.pageBox;
        if (!d) {
            d = this.pageBox = this.el.getPageBox()
        }
        if (this.getDirection() === "vertical") {
            if (a.y > d.bottom || a.y < d.top) {
                return
            }
            b = Ext.Element.fromPoint(d.left + (d.width / 2), a.y)
        } else {
            if (a.x > d.right || a.x < d.left) {
                return
            }
            b = Ext.Element.fromPoint(a.x, d.top + (d.height / 2))
        }
        if (b) {
            this.fireEvent("index", this, b.dom.innerHTML, b)
        }
    },
    destroy: function () {
        var c = this,
            d = Array.prototype.slice.call(c.innerElement.dom.childNodes),
            b = d.length,
            a = 0;
        for (; a < b; a++) {
            Ext.removeNode(d[a])
        }
        this.callParent()
    }
}, function () {});
Ext.define("Ext.dataview.ListItemHeader", {
    extend: "Ext.Component",
    xtype: "listitemheader",
    config: {
        baseCls: Ext.baseCSSPrefix + "list-header",
        docked: "top"
    }
});
Ext.define("Ext.Decorator", {
    extend: "Ext.Component",
    isDecorator: true,
    config: {
        component: {}
    },
    statics: {
        generateProxySetter: function (a) {
            return function (c) {
                var b = this.getComponent();
                b[a].call(b, c);
                return this
            }
        },
        generateProxyGetter: function (a) {
            return function () {
                var b = this.getComponent();
                return b[a].call(b)
            }
        }
    },
    onClassExtended: function (c, e) {
        if (!e.hasOwnProperty("proxyConfig")) {
            return
        }
        var f = Ext.Class,
            j = e.proxyConfig,
            d = e.config;
        e.config = (d) ? Ext.applyIf(d, j) : j;
        var b, h, g, a;
        for (b in j) {
            if (j.hasOwnProperty(b)) {
                h = f.getConfigNameMap(b);
                g = h.set;
                a = h.get;
                e[g] = this.generateProxySetter(g);
                e[a] = this.generateProxyGetter(a)
            }
        }
    },
    applyComponent: function (a) {
        return Ext.factory(a, Ext.Component)
    },
    updateComponent: function (a, b) {
        if (b) {
            if (this.isRendered() && b.setRendered(false)) {
                b.fireAction("renderedchange", [this, b, false], "doUnsetComponent", this, {
                    args: [b]
                })
            } else {
                this.doUnsetComponent(b)
            }
        }
        if (a) {
            if (this.isRendered() && a.setRendered(true)) {
                a.fireAction("renderedchange", [this, a, true], "doSetComponent", this, {
                    args: [a]
                })
            } else {
                this.doSetComponent(a)
            }
        }
    },
    doUnsetComponent: function (a) {
        this.innerElement.dom.removeChild(a.renderElement.dom)
    },
    doSetComponent: function (a) {
        this.innerElement.dom.appendChild(a.renderElement.dom)
    },
    setRendered: function (b) {
        var a;
        if (this.callParent(arguments)) {
            a = this.getComponent();
            if (a) {
                a.setRendered(b)
            }
            return true
        }
        return false
    },
    setDisabled: function (a) {
        this.callParent(arguments);
        this.getComponent().setDisabled(a)
    },
    destroy: function () {
        Ext.destroy(this.getComponent());
        this.callParent()
    }
});
Ext.define("Ext.field.Input", {
    extend: "Ext.Component",
    xtype: "input",
    tag: "input",
    cachedConfig: {
        cls: Ext.baseCSSPrefix + "form-field",
        focusCls: Ext.baseCSSPrefix + "field-focus",
        maskCls: Ext.baseCSSPrefix + "field-mask",
        useMask: "auto",
        type: "text",
        checked: false
    },
    config: {
        baseCls: Ext.baseCSSPrefix + "field-input",
        name: null,
        value: null,
        isFocused: false,
        tabIndex: null,
        placeHolder: null,
        minValue: null,
        maxValue: null,
        stepValue: null,
        maxLength: null,
        autoComplete: null,
        autoCapitalize: null,
        autoCorrect: null,
        readOnly: null,
        maxRows: null,
        startValue: false
    },
    getTemplate: function () {
        var a = [{
            reference: "input",
            tag: this.tag
        }, {
            reference: "clearIcon",
            cls: "x-clear-icon"
        }];
        a.push({
            reference: "mask",
            classList: [this.config.maskCls]
        });
        return a
    },
    initElement: function () {
        var a = this;
        a.callParent();
        a.input.on({
            scope: a,
            keyup: "onKeyUp",
            focus: "onFocus",
            blur: "onBlur",
            paste: "onPaste"
        });
        a.mask.on({
            tap: "onMaskTap",
            scope: a
        });
        if (a.clearIcon) {
            a.clearIcon.on({
                tap: "onClearIconTap",
                scope: a
            })
        }
    },
    applyUseMask: function (a) {
        if (a === "auto") {
            a = Ext.os.is.iOS && Ext.os.version.lt("5")
        }
        return Boolean(a)
    },
    updateUseMask: function (a) {
        this.mask[a ? "show" : "hide"]()
    },
    updateFieldAttribute: function (b, c) {
        var a = this.input;
        if (c) {
            a.dom.setAttribute(b, c)
        } else {
            a.dom.removeAttribute(b)
        }
    },
    updateCls: function (b, a) {
        this.input.addCls(Ext.baseCSSPrefix + "input-el");
        this.input.replaceCls(a, b)
    },
    updateType: function (a, c) {
        var b = Ext.baseCSSPrefix + "input-";
        this.input.replaceCls(b + c, b + a);
        this.updateFieldAttribute("type", a)
    },
    updateName: function (a) {
        this.updateFieldAttribute("name", a)
    },
    getValue: function () {
        var a = this.input;
        if (a) {
            this._value = a.dom.value
        }
        return this._value
    },
    applyValue: function (a) {
        return (Ext.isEmpty(a)) ? "" : a
    },
    updateValue: function (b) {
        var a = this.input;
        if (a) {
            a.dom.value = b
        }
    },
    setValue: function (a) {
        this.updateValue(this.applyValue(a));
        return this
    },
    updateTabIndex: function (a) {
        this.updateFieldAttribute("tabIndex", a)
    },
    testAutoFn: function (a) {
        return [true, "on"].indexOf(a) !== -1
    },
    updateMaxLength: function (a) {
        this.updateFieldAttribute("maxlength", a)
    },
    updatePlaceHolder: function (a) {
        this.updateFieldAttribute("placeholder", a)
    },
    applyAutoComplete: function (a) {
        return this.testAutoFn(a)
    },
    updateAutoComplete: function (a) {
        var b = a ? "on" : "off";
        this.updateFieldAttribute("autocomplete", b)
    },
    applyAutoCapitalize: function (a) {
        return this.testAutoFn(a)
    },
    updateAutoCapitalize: function (b) {
        var a = b ? "on" : "off";
        this.updateFieldAttribute("autocapitalize", a)
    },
    applyAutoCorrect: function (a) {
        return this.testAutoFn(a)
    },
    updateAutoCorrect: function (a) {
        var b = a ? "on" : "off";
        this.updateFieldAttribute("autocorrect", b)
    },
    updateMinValue: function (a) {
        this.updateFieldAttribute("min", a)
    },
    updateMaxValue: function (a) {
        this.updateFieldAttribute("max", a)
    },
    updateStepValue: function (a) {
        this.updateFieldAttribute("step", a)
    },
    checkedRe: /^(true|1|on)/i,
    getChecked: function () {
        var a = this.input,
            b;
        if (a) {
            b = a.dom.checked;
            this._checked = b
        }
        return b
    },
    applyChecked: function (a) {
        return !!this.checkedRe.test(String(a))
    },
    setChecked: function (a) {
        this.updateChecked(this.applyChecked(a));
        this._checked = a
    },
    updateChecked: function (a) {
        this.input.dom.checked = a
    },
    updateReadOnly: function (a) {
        this.updateFieldAttribute("readonly", a)
    },
    updateMaxRows: function (a) {
        this.updateFieldAttribute("rows", a)
    },
    doSetDisabled: function (a) {
        this.callParent(arguments);
        this.input.dom.disabled = a;
        if (!a) {
            this.blur()
        }
    },
    isDirty: function () {
        if (this.getDisabled()) {
            return false
        }
        return String(this.getValue()) !== String(this.originalValue)
    },
    reset: function () {
        this.setValue(this.originalValue)
    },
    onMaskTap: function (a) {
        this.fireAction("masktap", [this, a], "doMaskTap")
    },
    doMaskTap: function (a, b) {
        if (a.getDisabled()) {
            return false
        }
        a.maskCorrectionTimer = Ext.defer(a.showMask, 1000, a);
        a.hideMask()
    },
    showMask: function (a) {
        if (this.mask) {
            this.mask.setStyle("display", "block")
        }
    },
    hideMask: function (a) {
        if (this.mask) {
            this.mask.setStyle("display", "none")
        }
    },
    focus: function () {
        var b = this,
            a = b.input;
        if (a && a.dom.focus) {
            a.dom.focus()
        }
        return b
    },
    blur: function () {
        var b = this,
            a = this.input;
        if (a && a.dom.blur) {
            a.dom.blur()
        }
        return b
    },
    select: function () {
        var b = this,
            a = b.input;
        if (a && a.dom.setSelectionRange) {
            a.dom.setSelectionRange(0, 9999)
        }
        return b
    },
    onFocus: function (a) {
        this.fireAction("focus", [a], "doFocus")
    },
    doFocus: function (b) {
        var a = this;
        if (a.mask) {
            if (a.maskCorrectionTimer) {
                clearTimeout(a.maskCorrectionTimer)
            }
            a.hideMask()
        }
        if (!a.getIsFocused()) {
            a.setIsFocused(true);
            a.setStartValue(a.getValue())
        }
    },
    onBlur: function (a) {
        this.fireAction("blur", [a], "doBlur")
    },
    doBlur: function (d) {
        var b = this,
            c = b.getValue(),
            a = b.getStartValue();
        b.setIsFocused(false);
        if (String(c) != String(a)) {
            b.onChange(b, c, a)
        }
        b.showMask()
    },
    onClearIconTap: function (c) {
        var a = this.getValue(),
            b;
        this.fireEvent("clearicontap", this, c);
        b = this.getValue();
        if (String(b) != String(a)) {
            this.onChange(this, b, a)
        }
    },
    onClick: function (a) {
        this.fireEvent("click", a)
    },
    onChange: function (b, c, a) {
        this.fireEvent("change", b, c, a)
    },
    onKeyUp: function (a) {
        this.fireEvent("keyup", a)
    },
    onPaste: function (a) {
        this.fireEvent("paste", a)
    },
    onMouseDown: function (a) {
        this.fireEvent("mousedown", a)
    }
});
Ext.define("Ext.field.Field", {
    extend: "Ext.Decorator",
    alternateClassName: "Ext.form.Field",
    xtype: "field",
    requires: ["Ext.field.Input"],
    isField: true,
    isFormField: true,
    config: {
        baseCls: Ext.baseCSSPrefix + "field",
        label: null,
        labelAlign: "left",
        labelWidth: "30%",
        clearIcon: null,
        required: false,
        inputType: null,
        name: null,
        value: null,
        tabIndex: null
    },
    cachedConfig: {
        labelCls: null,
        requiredCls: Ext.baseCSSPrefix + "field-required",
        inputCls: null
    },
    getElementConfig: function () {
        var a = Ext.baseCSSPrefix;
        return {
            reference: "element",
            cls: "x-container x-table-inner x-table-fixed",
            children: [{
                cls: "x-table-row",
                reference: "fieldRow",
                children: [{
                    reference: "label",
                    cls: a + "form-label",
                    children: [{
                        reference: "labelspan",
                        tag: "span"
                    }]
                }, {
                    reference: "innerElement",
                    cls: a + "component-outer"
                }]
            }]
        }
    },
    updateLabel: function (b, d) {
        var a = this.renderElement,
            c = Ext.baseCSSPrefix;
        if (b) {
            this.labelspan.setHtml(b);
            a.addCls(c + "field-labeled")
        } else {
            a.removeCls(c + "field-labeled")
        }
    },
    updateLabelAlign: function (b, d) {
        var a = this.renderElement,
            f = Ext.baseCSSPrefix,
            c = this.label,
            e = this.innerElement;
        if (b) {
            a.addCls(f + "label-align-" + b);
            if (b == "top") {
                c.insertBefore(this.fieldRow)
            } else {
                this.updateLabelWidth(this.getLabelWidth());
                if (b == "right") {
                    c.insertAfter(e)
                } else {
                    c.insertBefore(e)
                }
            }
        }
        if (d) {
            a.removeCls(f + "label-align-" + d)
        }
    },
    updateLabelCls: function (a, b) {
        if (a) {
            this.label.addCls(a)
        }
        if (b) {
            this.label.removeCls(b)
        }
    },
    updateLabelWidth: function (a) {
        if (a) {
            if (this.getLabelAlign() == "top") {
                this.label.setWidth("100%")
            } else {
                this.label.setWidth(a)
            }
        }
    },
    updateRequired: function (a) {
        this.renderElement[a ? "addCls" : "removeCls"](this.getRequiredCls())
    },
    updateRequiredCls: function (a, b) {
        if (this.getRequired()) {
            this.renderElement.replaceCls(b, a)
        }
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.doInitValue()
    },
    doInitValue: function () {
        this.originalValue = this.getInitialConfig().value
    },
    reset: function () {
        this.setValue(this.originalValue);
        return this
    },
    isDirty: function () {
        return false
    }
}, function () {});
Ext.define("Ext.field.Text", {
    extend: "Ext.field.Field",
    xtype: "textfield",
    alternateClassName: "Ext.form.Text",
    config: {
        ui: "text",
        clearIcon: true,
        placeHolder: null,
        maxLength: null,
        autoComplete: null,
        autoCapitalize: null,
        autoCorrect: null,
        readOnly: null,
        component: {
            xtype: "input",
            type: "text"
        }
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.getComponent().on({
            scope: this,
            keyup: "onKeyUp",
            change: "onChange",
            focus: "onFocus",
            blur: "onBlur",
            paste: "onPaste",
            mousedown: "onMouseDown",
            clearicontap: "onClearIconTap"
        });
        a.originalValue = a.originalValue || "";
        a.getComponent().originalValue = a.originalValue;
        a.syncEmptyCls()
    },
    syncEmptyCls: function () {
        var b = (this._value) ? this._value.length : false,
            a = Ext.baseCSSPrefix + "empty";
        if (b) {
            this.removeCls(a)
        } else {
            this.addCls(a)
        }
    },
    updateValue: function (b) {
        var a = this.getComponent();
        if (a) {
            a.setValue(b)
        }
        this[b ? "showClearIcon" : "hideClearIcon"]();
        this.syncEmptyCls()
    },
    getValue: function () {
        var a = this;
        a._value = a.getComponent().getValue();
        a.syncEmptyCls();
        return a._value
    },
    updatePlaceHolder: function (a) {
        this.getComponent().setPlaceHolder(a)
    },
    updateMaxLength: function (a) {
        this.getComponent().setMaxLength(a)
    },
    updateAutoComplete: function (a) {
        this.getComponent().setAutoComplete(a)
    },
    updateAutoCapitalize: function (a) {
        this.getComponent().setAutoCapitalize(a)
    },
    updateAutoCorrect: function (a) {
        this.getComponent().setAutoCorrect(a)
    },
    updateReadOnly: function (a) {
        if (a) {
            this.hideClearIcon()
        } else {
            this.showClearIcon()
        }
        this.getComponent().setReadOnly(a)
    },
    updateInputType: function (a) {
        var b = this.getComponent();
        if (b) {
            b.setType(a)
        }
    },
    updateName: function (a) {
        var b = this.getComponent();
        if (b) {
            b.setName(a)
        }
    },
    updateTabIndex: function (b) {
        var a = this.getComponent();
        if (a) {
            a.setTabIndex(b)
        }
    },
    updateInputCls: function (a, b) {
        var c = this.getComponent();
        if (c) {
            c.replaceCls(b, a)
        }
    },
    doSetDisabled: function (b) {
        var c = this;
        c.callParent(arguments);
        var a = c.getComponent();
        if (a) {
            a.setDisabled(b)
        }
        if (b) {
            c.hideClearIcon()
        } else {
            c.showClearIcon()
        }
    },
    showClearIcon: function () {
        var a = this;
        if (!a.getDisabled() && !a.getReadOnly() && a.getValue() && a.getClearIcon()) {
            a.element.addCls(Ext.baseCSSPrefix + "field-clearable")
        }
        return a
    },
    hideClearIcon: function () {
        if (this.getClearIcon()) {
            this.element.removeCls(Ext.baseCSSPrefix + "field-clearable")
        }
    },
    onKeyUp: function (a) {
        this.fireAction("keyup", [this, a], "doKeyUp")
    },
    doKeyUp: function (a, c) {
        var b = a.getValue();
        a[b ? "showClearIcon" : "hideClearIcon"]();
        if (c.browserEvent.keyCode === 13) {
            a.fireAction("action", [a, c], "doAction")
        }
    },
    doAction: Ext.emptyFn,
    onClearIconTap: function (a) {
        this.fireAction("clearicontap", [this, a], "doClearIconTap")
    },
    doClearIconTap: function (a, b) {
        a.setValue("");
        a.getValue()
    },
    onChange: function (b, c, a) {
        b.fireEvent("change", this, c, a)
    },
    onFocus: function (a) {
        this.isFocused = true;
        this.fireEvent("focus", this, a)
    },
    onBlur: function (b) {
        var a = this;
        this.isFocused = false;
        a.fireEvent("blur", a, b);
        setTimeout(function () {
            a.isFocused = false
        }, 50)
    },
    onPaste: function (a) {
        this.fireEvent("paste", this, a)
    },
    onMouseDown: function (a) {
        this.fireEvent("mousedown", this, a)
    },
    focus: function () {
        this.getComponent().focus();
        return this
    },
    blur: function () {
        this.getComponent().blur();
        return this
    },
    select: function () {
        this.getComponent().select();
        return this
    },
    reset: function () {
        this.getComponent().reset();
        this.getValue();
        this[this._value ? "showClearIcon" : "hideClearIcon"]()
    },
    isDirty: function () {
        var a = this.getComponent();
        if (a) {
            return a.isDirty()
        }
        return false
    }
});
Ext.define("Ext.field.TextAreaInput", {
    extend: "Ext.field.Input",
    xtype: "textareainput",
    tag: "textarea"
});
Ext.define("Ext.field.TextArea", {
    extend: "Ext.field.Text",
    xtype: "textareafield",
    requires: ["Ext.field.TextAreaInput"],
    alternateClassName: "Ext.form.TextArea",
    config: {
        ui: "textarea",
        autoCapitalize: false,
        component: {
            xtype: "textareainput"
        },
        maxRows: null
    },
    updateMaxRows: function (a) {
        this.getComponent().setMaxRows(a)
    }
});
Ext.define("Ext.LoadMask", {
    extend: "Ext.Mask",
    xtype: "loadmask",
    config: {
        message: "Loading...",
        messageCls: Ext.baseCSSPrefix + "mask-message",
        indicator: true,
        listeners: {
            painted: "onPainted",
            erased: "onErased"
        }
    },
    getTemplate: function () {
        var a = Ext.baseCSSPrefix;
        return [{
            reference: "innerElement",
            cls: a + "mask-inner",
            children: [{
                reference: "indicatorElement",
                cls: a + "loading-spinner-outer",
                children: [{
                    cls: a + "loading-spinner",
                    children: [{
                        tag: "span",
                        cls: a + "loading-top"
                    }, {
                        tag: "span",
                        cls: a + "loading-right"
                    }, {
                        tag: "span",
                        cls: a + "loading-bottom"
                    }, {
                        tag: "span",
                        cls: a + "loading-left"
                    }]
                }]
            }, {
                reference: "messageElement"
            }]
        }]
    },
    updateMessage: function (a) {
        this.messageElement.setHtml(a)
    },
    updateMessageCls: function (b, a) {
        this.messageElement.replaceCls(a, b)
    },
    updateIndicator: function (a) {
        this[a ? "removeCls" : "addCls"](Ext.baseCSSPrefix + "indicator-hidden")
    },
    onPainted: function () {
        this.getParent().on({
            scope: this,
            resize: this.refreshPosition
        });
        this.refreshPosition()
    },
    onErased: function () {
        this.getParent().un({
            scope: this,
            resize: this.refreshPosition
        })
    },
    refreshPosition: function () {
        var c = this.getParent(),
            d = c.getScrollable(),
            a = (d) ? d.getScroller() : null,
            f = (a) ? a.position : {
                x: 0,
                y: 0
            },
            e = c.element.getSize(),
            b = this.element.getSize();
        this.innerElement.setStyle({
            marginTop: Math.round(e.height - b.height + (f.y * 2)) + "px",
            marginLeft: Math.round(e.width - b.width + f.x) + "px"
        })
    }
}, function () {});
Ext.define("Ext.dataview.element.Container", {
    extend: "Ext.Component",
    doInitialize: function () {
        this.element.on({
            touchstart: "onItemTouchStart",
            touchend: "onItemTouchEnd",
            tap: "onItemTap",
            taphold: "onItemTapHold",
            touchmove: "onItemTouchMove",
            doubletap: "onItemDoubleTap",
            swipe: "onItemSwipe",
            delegate: "> div",
            scope: this
        })
    },
    initialize: function () {
        this.callParent();
        this.doInitialize()
    },
    onItemTouchStart: function (d) {
        var b = this,
            c = d.getTarget(),
            a = b.getViewItems().indexOf(c);
        Ext.get(c).on({
            touchmove: "onItemTouchMove",
            scope: b,
            single: true
        });
        b.fireEvent("itemtouchstart", b, Ext.get(c), a, d)
    },
    onItemTouchEnd: function (d) {
        var b = this,
            c = d.getTarget(),
            a = b.getViewItems().indexOf(c);
        Ext.get(c).un({
            touchmove: "onItemTouchMove",
            scope: b
        });
        b.fireEvent("itemtouchend", b, Ext.get(c), a, d)
    },
    onItemTouchMove: function (d) {
        var b = this,
            c = d.getTarget(),
            a = b.getViewItems().indexOf(c);
        b.fireEvent("itemtouchmove", b, Ext.get(c), a, d)
    },
    onItemTap: function (d) {
        var b = this,
            c = d.getTarget(),
            a = b.getViewItems().indexOf(c);
        b.fireEvent("itemtap", b, Ext.get(c), a, d)
    },
    onItemTapHold: function (d) {
        var b = this,
            c = d.getTarget(),
            a = b.getViewItems().indexOf(c);
        b.fireEvent("itemtaphold", b, Ext.get(c), a, d)
    },
    onItemDoubleTap: function (d) {
        var b = this,
            c = d.getTarget(),
            a = b.getViewItems().indexOf(c);
        b.fireEvent("itemdoubletap", b, Ext.get(c), a, d)
    },
    onItemSwipe: function (d) {
        var b = this,
            c = d.getTarget(),
            a = b.getViewItems().indexOf(c);
        b.fireEvent("itemswipe", b, Ext.get(c), a, d)
    },
    updateListItem: function (b, d) {
        var c = this,
            a = c.dataview,
            e = a.prepareData(b.getData(true), a.getStore().indexOf(b), b);
        d.innerHTML = c.dataview.getItemTpl().apply(e)
    },
    addListItem: function (e, c) {
        var h = this,
            d = h.dataview,
            a = d.prepareData(c.getData(true), d.getStore().indexOf(c), c),
            b = h.element,
            j = b.dom.childNodes,
            g = j.length,
            f;
        f = Ext.Element.create(this.getItemElementConfig(e, a));
        if (!g || e == g) {
            f.appendTo(b)
        } else {
            f.insertBefore(j[e])
        }
    },
    getItemElementConfig: function (c, e) {
        var b = this.dataview,
            d = b.getItemCls(),
            a = b.getBaseCls() + "-item";
        if (d) {
            a += " " + d
        }
        return {
            cls: a,
            html: b.getItemTpl().apply(e)
        }
    },
    doRemoveItemCls: function (a) {
        var d = this.getViewItems(),
            c = d.length,
            b = 0;
        for (; b < c; b++) {
            Ext.fly(d[b]).removeCls(a)
        }
    },
    doAddItemCls: function (a) {
        var d = this.getViewItems(),
            c = d.length,
            b = 0;
        for (; b < c; b++) {
            Ext.fly(d[b]).addCls(a)
        }
    },
    moveItemsToCache: function (f, e) {
        var d = this,
            a = d.getViewItems(),
            b = e - f,
            c;
        for (; b >= 0; b--) {
            c = a[f + b];
            c.parentNode.removeChild(c)
        }
        if (d.getViewItems().length == 0) {
            this.dataview.showEmptyText()
        }
    },
    moveItemsFromCache: function (d) {
        var g = this,
            b = g.dataview,
            c = b.getStore(),
            f = d.length,
            e, a;
        if (f) {
            b.hideEmptyText()
        }
        for (e = 0; e < f; e++) {
            d[e]._tmpIndex = c.indexOf(d[e])
        }
        Ext.Array.sort(d, function (j, h) {
            return j._tmpIndex > h._tmpIndex ? 1 : -1
        });
        for (e = 0; e < f; e++) {
            a = d[e];
            g.addListItem(a._tmpIndex, a);
            delete a._tmpIndex
        }
    },
    getViewItems: function () {
        return Array.prototype.slice.call(this.element.dom.childNodes)
    },
    destroy: function () {
        var c = this.getViewItems(),
            b = c.length,
            a = 0;
        for (; a < b; a++) {
            Ext.removeNode(c[a])
        }
        this.callParent()
    }
});
Ext.define("Ext.dataview.element.List", {
    extend: "Ext.dataview.element.Container",
    updateBaseCls: function (a, b) {
        var c = this;
        c.callParent(arguments);
        c.itemClsShortCache = a + "-item";
        c.headerClsShortCache = a + "-header";
        c.headerClsCache = "." + c.headerClsShortCache;
        c.headerItemClsShortCache = a + "-header-item";
        c.footerClsShortCache = a + "-footer-item";
        c.footerClsCache = "." + c.footerClsShortCache;
        c.labelClsShortCache = a + "-item-label";
        c.labelClsCache = "." + c.labelClsShortCache;
        c.disclosureClsShortCache = a + "-disclosure";
        c.disclosureClsCache = "." + c.disclosureClsShortCache;
        c.iconClsShortCache = a + "-icon";
        c.iconClsCache = "." + c.iconClsShortCache
    },
    hiddenDisplayCache: Ext.baseCSSPrefix + "hidden-display",
    getItemElementConfig: function (e, h) {
        var f = this,
            c = f.dataview,
            g = c.getItemCls(),
            b = f.itemClsShortCache,
            d, a;
        if (g) {
            b += " " + g
        }
        d = {
            cls: b,
            children: [{
                cls: f.labelClsShortCache,
                html: c.getItemTpl().apply(h)
            }]
        };
        if (c.getIcon()) {
            a = h.iconSrc;
            d.children.push({
                cls: f.iconClsShortCache,
                style: "background-image: " + a ? 'url("' + newSrc + '")' : ""
            })
        }
        if (c.getOnItemDisclosure()) {
            d.children.push({
                cls: f.disclosureClsShortCache + ((h.disclosure === false) ? f.hiddenDisplayCache : "")
            })
        }
        return d
    },
    updateListItem: function (b, k) {
        var g = this,
            c = g.dataview,
            j = Ext.fly(k),
            f = j.down(g.labelClsCache, true),
            a = b.data,
            d = a && a.hasOwnProperty("disclosure"),
            l = a && a.hasOwnProperty("iconSrc"),
            e, h;
        f.innerHTML = c.getItemTpl().apply(a);
        if (d && c.getOnItemDisclosure()) {
            e = j.down(g.disclosureClsCache);
            e[d ? "removeCls" : "addCls"](g.hiddenDisplayCache)
        }
        if (c.getIcon()) {
            h = j.down(g.iconClsCache, true);
            h.style.backgroundImage = l ? 'url("' + l + '")' : ""
        }
    },
    doRemoveHeaders: function () {
        var d = this,
            a = d.element.query(d.headerClsCache),
            e = a.length,
            b = 0,
            c;
        for (; b < e; b++) {
            c = a[b];
            Ext.fly(c.parentNode).removeCls(d.headerItemClsShortCache);
            Ext.removeNode(c)
        }
    },
    doRemoveFooterCls: function () {
        var d = this,
            c = d.footerClsCache,
            a = d.element.query(c),
            e = a.length,
            b = 0;
        for (; b < e; b++) {
            Ext.fly(a[b]).removeCls(c)
        }
    },
    doAddHeader: function (b, a) {
        b = Ext.fly(b);
        b.insertFirst(Ext.Element.create({
            cls: this.headerClsShortCache,
            html: a
        }));
        b.addCls(this.headerItemClsShortCache)
    },
    destroy: function () {
        this.doRemoveHeaders();
        this.callParent()
    }
});
Ext.define("Ext.scroll.Scroller", {
    extend: "Ext.Evented",
    requires: ["Ext.fx.easing.BoundMomentum", "Ext.fx.easing.EaseOut", "Ext.util.SizeMonitor", "Ext.util.Translatable"],
    config: {
        element: null,
        direction: "auto",
        translationMethod: "auto",
        fps: "auto",
        disabled: null,
        directionLock: false,
        momentumEasing: {
            momentum: {
                acceleration: 30,
                friction: 0.5
            },
            bounce: {
                acceleration: 30,
                springTension: 0.3
            },
            minVelocity: 1
        },
        bounceEasing: {
            duration: 400
        },
        outOfBoundRestrictFactor: 0.5,
        startMomentumResetTime: 300,
        maxAbsoluteVelocity: 6,
        containerSize: "auto",
        containerScrollSize: "auto",
        size: "auto",
        autoRefresh: true,
        initialOffset: {
            x: 0,
            y: 0
        },
        slotSnapSize: {
            x: 0,
            y: 0
        },
        slotSnapOffset: {
            x: 0,
            y: 0
        },
        slotSnapEasing: {
            duration: 150
        }
    },
    cls: Ext.baseCSSPrefix + "scroll-scroller",
    containerCls: Ext.baseCSSPrefix + "scroll-container",
    dragStartTime: 0,
    dragEndTime: 0,
    isDragging: false,
    isAnimating: false,
    constructor: function (a) {
        var b = a && a.element;
        this.doAnimationFrame = Ext.Function.bind(this.doAnimationFrame, this);
        this.stopAnimation = Ext.Function.bind(this.stopAnimation, this);
        this.listeners = {
            scope: this,
            touchstart: "onTouchStart",
            touchend: "onTouchEnd",
            dragstart: "onDragStart",
            drag: "onDrag",
            dragend: "onDragEnd"
        };
        this.minPosition = {
            x: 0,
            y: 0
        };
        this.startPosition = {
            x: 0,
            y: 0
        };
        this.size = {
            x: 0,
            y: 0
        };
        this.position = {
            x: 0,
            y: 0
        };
        this.velocity = {
            x: 0,
            y: 0
        };
        this.isAxisEnabledFlags = {
            x: false,
            y: false
        };
        this.flickStartPosition = {
            x: 0,
            y: 0
        };
        this.flickStartTime = {
            x: 0,
            y: 0
        };
        this.lastDragPosition = {
            x: 0,
            y: 0
        };
        this.dragDirection = {
            x: 0,
            y: 0
        };
        this.initialConfig = a;
        if (b) {
            this.setElement(b)
        }
        return this
    },
    applyElement: function (a) {
        if (!a) {
            return
        }
        return Ext.get(a)
    },
    updateElement: function (a) {
        this.initialize();
        a.addCls(this.cls);
        if (!this.getDisabled()) {
            this.attachListeneners()
        }
        this.onConfigUpdate(["containerSize", "size"], "refreshMaxPosition");
        this.on("maxpositionchange", "snapToBoundary");
        this.on("minpositionchange", "snapToBoundary");
        return this
    },
    getTranslatable: function () {
        if (!this.hasOwnProperty("translatable")) {
            var a = this.getBounceEasing();
            this.translatable = new Ext.util.Translatable({
                translationMethod: this.getTranslationMethod(),
                element: this.getElement(),
                easingX: a.x,
                easingY: a.y,
                useWrapper: false,
                listeners: {
                    animationframe: "onAnimationFrame",
                    animationend: "onAnimationEnd",
                    axisanimationend: "onAxisAnimationEnd",
                    scope: this
                }
            })
        }
        return this.translatable
    },
    updateFps: function (a) {
        if (a !== "auto") {
            this.getTranslatable().setFps(a)
        }
    },
    attachListeneners: function () {
        this.getContainer().on(this.listeners)
    },
    detachListeners: function () {
        this.getContainer().un(this.listeners)
    },
    updateDisabled: function (a) {
        if (a) {
            this.detachListeners()
        } else {
            this.attachListeneners()
        }
    },
    updateInitialOffset: function (c) {
        if (typeof c == "number") {
            c = {
                x: c,
                y: c
            }
        }
        var b = this.position,
            a, d;
        b.x = a = c.x;
        b.y = d = c.y;
        this.getTranslatable().doTranslate(-a, -d)
    },
    applyDirection: function (a) {
        var e = this.getMinPosition(),
            d = this.getMaxPosition(),
            c, b;
        this.givenDirection = a;
        if (a === "auto") {
            c = d.x > e.x;
            b = d.y > e.y;
            if (c && b) {
                a = "both"
            } else {
                if (c) {
                    a = "horizontal"
                } else {
                    a = "vertical"
                }
            }
        }
        return a
    },
    updateDirection: function (b) {
        var a = this.isAxisEnabledFlags;
        a.x = (b === "both" || b === "horizontal");
        a.y = (b === "both" || b === "vertical")
    },
    isAxisEnabled: function (a) {
        this.getDirection();
        return this.isAxisEnabledFlags[a]
    },
    applyMomentumEasing: function (b) {
        var a = Ext.fx.easing.BoundMomentum;
        return {
            x: Ext.factory(b, a),
            y: Ext.factory(b, a)
        }
    },
    applyBounceEasing: function (b) {
        var a = Ext.fx.easing.EaseOut;
        return {
            x: Ext.factory(b, a),
            y: Ext.factory(b, a)
        }
    },
    applySlotSnapEasing: function (b) {
        var a = Ext.fx.easing.EaseOut;
        return {
            x: Ext.factory(b, a),
            y: Ext.factory(b, a)
        }
    },
    getMinPosition: function () {
        var a = this.minPosition;
        if (!a) {
            this.minPosition = a = {
                x: 0,
                y: 0
            };
            this.fireEvent("minpositionchange", this, a)
        }
        return a
    },
    getMaxPosition: function () {
        var c = this.maxPosition,
            a, b;
        if (!c) {
            a = this.getSize();
            b = this.getContainerSize();
            this.maxPosition = c = {
                x: Math.max(0, a.x - b.x),
                y: Math.max(0, a.y - b.y)
            };
            this.fireEvent("maxpositionchange", this, c)
        }
        return c
    },
    refreshMaxPosition: function () {
        this.maxPosition = null;
        this.getMaxPosition()
    },
    applyContainerSize: function (b) {
        var c, a, d;
        this.givenContainerSize = b;
        if (b === "auto") {
            c = this.getContainer().dom;
            a = c.offsetWidth;
            d = c.offsetHeight
        } else {
            a = b.x;
            d = b.y
        }
        return {
            x: a,
            y: d
        }
    },
    applySize: function (b) {
        var c, a, d;
        this.givenSize = b;
        if (b === "auto") {
            c = this.getElement().dom;
            a = c.offsetWidth;
            d = c.offsetHeight
        } else {
            a = b.x;
            d = b.y
        }
        return {
            x: a,
            y: d
        }
    },
    applyContainerScrollSize: function (b) {
        var c, a, d;
        this.givenContainerScrollSize = b;
        if (b === "auto") {
            c = this.getContainer().dom;
            a = c.scrollWidth;
            d = c.scrollHeight
        } else {
            a = b.x;
            d = b.y
        }
        return {
            x: a,
            y: d
        }
    },
    updateAutoRefresh: function (b) {
        var c = Ext.util.SizeMonitor,
            a;
        if (b) {
            this.sizeMonitors = {
                element: new c({
                    element: this.getElement(),
                    callback: this.doRefresh,
                    scope: this
                }),
                container: new c({
                    element: this.getContainer(),
                    callback: this.doRefresh,
                    scope: this
                })
            }
        } else {
            a = this.sizeMonitors;
            if (a) {
                a.element.destroy();
                a.container.destroy()
            }
        }
    },
    applySlotSnapSize: function (a) {
        if (typeof a == "number") {
            return {
                x: a,
                y: a
            }
        }
        return a
    },
    applySlotSnapOffset: function (a) {
        if (typeof a == "number") {
            return {
                x: a,
                y: a
            }
        }
        return a
    },
    getContainer: function () {
        var a = this.container;
        if (!a) {
            this.container = a = this.getElement().getParent();
            a.addCls(this.containerCls)
        }
        return a
    },
    doRefresh: function () {
        this.stopAnimation();
        this.getTranslatable().refresh();
        this.setSize(this.givenSize);
        this.setContainerSize(this.givenContainerSize);
        this.setContainerScrollSize(this.givenContainerScrollSize);
        this.setDirection(this.givenDirection);
        this.fireEvent("refresh", this)
    },
    refresh: function () {
        var a = this.sizeMonitors;
        if (a) {
            a.element.refresh();
            a.container.refresh()
        }
        this.doRefresh();
        return this
    },
    scrollTo: function (c, h, g) {
        var b = this.getTranslatable(),
            a = this.position,
            d = false,
            f, e;
        if (this.isAxisEnabled("x")) {
            if (typeof c != "number") {
                c = a.x
            } else {
                if (a.x !== c) {
                    a.x = c;
                    d = true
                }
            }
            f = -c
        }
        if (this.isAxisEnabled("y")) {
            if (typeof h != "number") {
                h = a.y
            } else {
                if (a.y !== h) {
                    a.y = h;
                    d = true
                }
            }
            e = -h
        }
        if (d) {
            if (g !== undefined) {
                b.translateAnimated(f, e, g)
            } else {
                this.fireEvent("scroll", this, a.x, a.y);
                b.doTranslate(f, e)
            }
        }
        return this
    },
    scrollToTop: function (b) {
        var a = this.getInitialOffset();
        return this.scrollTo(a.x, a.y, b)
    },
    scrollToEnd: function (a) {
        return this.scrollTo(0, this.getSize().y - this.getContainerSize().y, a)
    },
    scrollBy: function (b, d, c) {
        var a = this.position;
        b = (typeof b == "number") ? b + a.x : null;
        d = (typeof d == "number") ? d + a.y : null;
        return this.scrollTo(b, d, c)
    },
    onTouchStart: function () {
        this.isTouching = true;
        this.stopAnimation()
    },
    onTouchEnd: function () {
        var a = this.position;
        this.isTouching = false;
        if (!this.isDragging && this.snapToSlot()) {
            this.fireEvent("scrollstart", this, a.x, a.y)
        }
    },
    onDragStart: function (m) {
        var p = this.getDirection(),
            g = m.absDeltaX,
            f = m.absDeltaY,
            k = this.getDirectionLock(),
            j = this.startPosition,
            d = this.flickStartPosition,
            l = this.flickStartTime,
            h = this.lastDragPosition,
            c = this.position,
            b = this.dragDirection,
            o = c.x,
            n = c.y,
            a = Ext.Date.now();
        this.isDragging = true;
        if (k && p !== "both") {
            if ((p === "horizontal" && g > f) || (p === "vertical" && f > g)) {
                m.stopPropagation()
            } else {
                this.isDragging = false;
                return
            }
        }
        h.x = o;
        h.y = n;
        d.x = o;
        d.y = n;
        j.x = o;
        j.y = n;
        l.x = a;
        l.y = a;
        b.x = 0;
        b.y = 0;
        this.dragStartTime = a;
        this.isDragging = true;
        this.fireEvent("scrollstart", this, o, n)
    },
    onAxisDrag: function (j, r) {
        if (!this.isAxisEnabled(j)) {
            return
        }
        var h = this.flickStartPosition,
            m = this.flickStartTime,
            k = this.lastDragPosition,
            e = this.dragDirection,
            g = this.position[j],
            l = this.getMinPosition()[j],
            p = this.getMaxPosition()[j],
            d = this.startPosition[j],
            q = k[j],
            o = d - r,
            c = e[j],
            n = this.getOutOfBoundRestrictFactor(),
            f = this.getStartMomentumResetTime(),
            b = Ext.Date.now(),
            a;
        if (o < l) {
            o *= n
        } else {
            if (o > p) {
                a = o - p;
                o = p + a * n
            }
        }
        if (o > q) {
            e[j] = 1
        } else {
            if (o < q) {
                e[j] = -1
            }
        }
        if ((c !== 0 && (e[j] !== c)) || (b - m[j]) > f) {
            h[j] = g;
            m[j] = b
        }
        k[j] = o
    },
    onDrag: function (b) {
        if (!this.isDragging) {
            return
        }
        var a = this.lastDragPosition;
        this.onAxisDrag("x", b.deltaX);
        this.onAxisDrag("y", b.deltaY);
        this.scrollTo(a.x, a.y)
    },
    onDragEnd: function (c) {
        var b, a;
        if (!this.isDragging) {
            return
        }
        this.dragEndTime = Ext.Date.now();
        this.onDrag(c);
        this.isDragging = false;
        b = this.getAnimationEasing("x");
        a = this.getAnimationEasing("y");
        if (b || a) {
            this.getTranslatable().animate(b, a)
        } else {
            this.onScrollEnd()
        }
    },
    getAnimationEasing: function (g) {
        if (!this.isAxisEnabled(g)) {
            return null
        }
        var e = this.position[g],
            f = this.flickStartPosition[g],
            l = this.flickStartTime[g],
            c = this.getMinPosition()[g],
            k = this.getMaxPosition()[g],
            a = this.getMaxAbsoluteVelocity(),
            d = null,
            b = this.dragEndTime,
            m, j, h;
        if (e < c) {
            d = c
        } else {
            if (e > k) {
                d = k
            }
        }
        if (d !== null) {
            m = this.getBounceEasing()[g];
            m.setConfig({
                startTime: b,
                startValue: -e,
                endValue: -d
            });
            return m
        }
        h = b - l;
        if (h === 0) {
            return null
        }
        j = (e - f) / (b - l);
        if (j === 0) {
            return null
        }
        if (j < -a) {
            j = -a
        } else {
            if (j > a) {
                j = a
            }
        }
        m = this.getMomentumEasing()[g];
        m.setConfig({
            startTime: b,
            startValue: -e,
            startVelocity: -j,
            minMomentumValue: -k,
            maxMomentumValue: 0
        });
        return m
    },
    onAnimationFrame: function (c, b, d) {
        var a = this.position;
        a.x = -b;
        a.y = -d;
        this.fireEvent("scroll", this, a.x, a.y)
    },
    onAxisAnimationEnd: function (a) {},
    onAnimationEnd: function () {
        this.snapToBoundary();
        this.onScrollEnd()
    },
    stopAnimation: function () {
        this.getTranslatable().stopAnimation()
    },
    onScrollEnd: function () {
        var a = this.position;
        if (this.isTouching || !this.snapToSlot()) {
            this.fireEvent("scrollend", this, a.x, a.y)
        }
    },
    snapToSlot: function () {
        var b = this.getSnapPosition("x"),
            a = this.getSnapPosition("y"),
            c = this.getSlotSnapEasing();
        if (b !== null || a !== null) {
            this.scrollTo(b, a, {
                easingX: c.x,
                easingY: c.y
            });
            return true
        }
        return false
    },
    getSnapPosition: function (c) {
        var g = this.getSlotSnapSize()[c],
            d = null,
            a, f, e, b;
        if (g !== 0 && this.isAxisEnabled(c)) {
            a = this.position[c];
            f = this.getSlotSnapOffset()[c];
            e = this.getMaxPosition()[c];
            b = (a - f) % g;
            if (b !== 0) {
                if (Math.abs(b) > g / 2) {
                    d = a + ((b > 0) ? g - b : b - g);
                    if (d > e) {
                        d = a - b
                    }
                } else {
                    d = a - b
                }
            }
        }
        return d
    },
    snapToBoundary: function () {
        var g = this.position,
            c = this.getMinPosition(),
            f = this.getMaxPosition(),
            e = c.x,
            d = c.y,
            b = f.x,
            a = f.y,
            j = Math.round(g.x),
            h = Math.round(g.y);
        if (j < e) {
            j = e
        } else {
            if (j > b) {
                j = b
            }
        }
        if (h < d) {
            h = d
        } else {
            if (h > a) {
                h = a
            }
        }
        this.scrollTo(j, h)
    },
    destroy: function () {
        var b = this.getElement(),
            a = this.sizeMonitors;
        if (a) {
            a.element.destroy();
            a.container.destroy()
        }
        if (b && !b.isDestroyed) {
            b.removeCls(this.cls);
            this.getContainer().removeCls(this.containerCls)
        }
        Ext.destroy(this.translatable);
        this.callParent(arguments)
    }
}, function () {});
Ext.define("Ext.scroll.indicator.Abstract", {
    extend: "Ext.Component",
    config: {
        baseCls: "x-scroll-indicator",
        axis: "x",
        value: 0,
        length: null,
        hidden: true,
        ui: "dark"
    },
    cachedConfig: {
        ratio: 1,
        barCls: "x-scroll-bar",
        active: true
    },
    barElement: null,
    barLength: 0,
    gapLength: 0,
    getElementConfig: function () {
        return {
            reference: "barElement",
            children: [this.callParent()]
        }
    },
    applyRatio: function (a) {
        if (isNaN(a)) {
            a = 1
        }
        return a
    },
    refresh: function () {
        var f = this.barElement,
            e = f.dom,
            c = this.getRatio(),
            b = this.getAxis(),
            a = (b === "x") ? e.offsetWidth : e.offsetHeight,
            d = a * c;
        this.barLength = a;
        this.gapLength = a - d;
        this.setLength(d);
        this.updateValue(this.getValue())
    },
    updateBarCls: function (a) {
        this.barElement.addCls(a)
    },
    updateAxis: function (a) {
        this.element.addCls(this.getBaseCls(), null, a);
        this.barElement.addCls(this.getBarCls(), null, a)
    },
    updateValue: function (a) {
        this.setOffset(this.gapLength * a)
    },
    updateActive: function (a) {
        this.barElement[a ? "addCls" : "removeCls"]("active")
    },
    doSetHidden: function (a) {
        var b = this.element.dom.style;
        if (a) {
            b.opacity = "0"
        } else {
            b.opacity = ""
        }
    },
    updateLength: function (c) {
        var b = this.getAxis(),
            a = this.element;
        if (b === "x") {
            a.setWidth(c)
        } else {
            a.setHeight(c)
        }
    },
    setOffset: function (c) {
        var b = this.getAxis(),
            a = this.element;
        if (b === "x") {
            a.setLeft(c)
        } else {
            a.setTop(c)
        }
    }
});
Ext.define("Ext.scroll.indicator.Default", {
    extend: "Ext.scroll.indicator.Abstract",
    config: {
        cls: "default"
    },
    setOffset: function (c) {
        var b = this.getAxis(),
            a = this.element.dom.style;
        if (b === "x") {
            a.webkitTransform = "translate3d(" + c + "px, 0, 0)"
        } else {
            a.webkitTransform = "translate3d(0, " + c + "px, 0)"
        }
    },
    applyLength: function (a) {
        return Math.round(Math.max(0, a))
    },
    updateValue: function (f) {
        var b = this.barLength,
            c = this.gapLength,
            d = this.getLength(),
            e, g, a;
        if (f <= 0) {
            g = 0;
            this.updateLength(this.applyLength(d + f * b))
        } else {
            if (f >= 1) {
                a = Math.round((f - 1) * b);
                e = this.applyLength(d - a);
                a = d - e;
                this.updateLength(e);
                g = c + a
            } else {
                g = c * f
            }
        }
        this.setOffset(g)
    }
});
Ext.define("Ext.scroll.indicator.ScrollPosition", {
    extend: "Ext.scroll.indicator.Abstract",
    config: {
        cls: "scrollposition"
    },
    getElementConfig: function () {
        var a = this.callParent(arguments);
        a.children.unshift({
            className: "x-scroll-bar-stretcher"
        });
        return a
    },
    updateValue: function (a) {
        if (this.gapLength === 0) {
            if (a > 1) {
                a = a - 1
            }
            this.setOffset(this.barLength * a)
        } else {
            this.setOffset(this.gapLength * a)
        }
    },
    setLength: function (e) {
        var c = this.getAxis(),
            a = this.barLength,
            d = this.barElement.dom,
            b = this.element;
        this.callParent(arguments);
        if (c === "x") {
            d.scrollLeft = a;
            b.setLeft(a)
        } else {
            d.scrollTop = a;
            b.setTop(a)
        }
    },
    setOffset: function (d) {
        var b = this.getAxis(),
            a = this.barLength,
            c = this.barElement.dom;
        d = a - d;
        if (b === "x") {
            c.scrollLeft = d
        } else {
            c.scrollTop = d
        }
    }
});
Ext.define("Ext.scroll.indicator.CssTransform", {
    extend: "Ext.scroll.indicator.Abstract",
    config: {
        cls: "csstransform"
    },
    getElementConfig: function () {
        var a = this.callParent();
        a.children[0].children = [{
            reference: "startElement"
        }, {
            reference: "middleElement"
        }, {
            reference: "endElement"
        }];
        return a
    },
    refresh: function () {
        var d = this.getAxis(),
            c = this.startElement.dom,
            a = this.endElement.dom,
            e = this.middleElement,
            b, f;
        if (d === "x") {
            b = c.offsetWidth;
            f = a.offsetWidth;
            e.setLeft(b)
        } else {
            b = c.offsetHeight;
            f = a.offsetHeight;
            e.setTop(b)
        }
        this.startElementLength = b;
        this.endElementLength = f;
        this.minLength = b + f;
        this.callParent()
    },
    applyLength: function (a) {
        return Math.round(Math.max(this.minLength, a))
    },
    updateLength: function (c) {
        var b = this.getAxis(),
            a = this.endElement.dom.style,
            e = this.middleElement.dom.style,
            d = this.endElementLength,
            g = c - d,
            f = g - this.startElementLength;
        if (b === "x") {
            a.webkitTransform = "translate3d(" + g + "px, 0, 0)";
            e.webkitTransform = "translate3d(0, 0, 0) scaleX(" + f + ")"
        } else {
            a.webkitTransform = "translate3d(0, " + g + "px, 0)";
            e.webkitTransform = "translate3d(0, 0, 0) scaleY(" + f + ")"
        }
    },
    updateValue: function (f) {
        var b = this.barLength,
            c = this.gapLength,
            d = this.getLength(),
            e, g, a;
        if (f <= 0) {
            g = 0;
            this.updateLength(this.applyLength(d + f * b))
        } else {
            if (f >= 1) {
                a = Math.round((f - 1) * b);
                e = this.applyLength(d - a);
                a = d - e;
                this.updateLength(e);
                g = c + a
            } else {
                g = c * f
            }
        }
        this.setOffset(g)
    },
    setOffset: function (c) {
        var a = this.getAxis(),
            b = this.element.dom.style;
        c = Math.round(c);
        if (a === "x") {
            b.webkitTransform = "translate3d(" + c + "px, 0, 0)"
        } else {
            b.webkitTransform = "translate3d(0, " + c + "px, 0)"
        }
    }
});
Ext.define("Ext.scroll.Indicator", {
    requires: ["Ext.scroll.indicator.Default", "Ext.scroll.indicator.ScrollPosition", "Ext.scroll.indicator.CssTransform"],
    alternateClassName: "Ext.util.Indicator",
    constructor: function (a) {
        if (Ext.os.is.Android2 || Ext.browser.is.ChromeMobile) {
            return new Ext.scroll.indicator.ScrollPosition(a)
        } else {
            if (Ext.os.is.iOS) {
                return new Ext.scroll.indicator.CssTransform(a)
            } else {
                return new Ext.scroll.indicator.Default(a)
            }
        }
    }
});
Ext.define("Ext.scroll.View", {
    extend: "Ext.Evented",
    alternateClassName: "Ext.util.ScrollView",
    requires: ["Ext.scroll.Scroller", "Ext.scroll.Indicator"],
    config: {
        indicatorsUi: "dark",
        element: null,
        scroller: {},
        indicators: {
            x: {
                axis: "x"
            },
            y: {
                axis: "y"
            }
        },
        indicatorsHidingDelay: 100,
        cls: Ext.baseCSSPrefix + "scroll-view"
    },
    processConfig: function (c) {
        if (!c) {
            return null
        }
        if (typeof c == "string") {
            c = {
                direction: c
            }
        }
        c = Ext.merge({}, c);
        var a = c.scroller,
            b;
        if (!a) {
            c.scroller = a = {}
        }
        for (b in c) {
            if (c.hasOwnProperty(b)) {
                if (!this.hasConfig(b)) {
                    a[b] = c[b];
                    delete c[b]
                }
            }
        }
        return c
    },
    constructor: function (a) {
        a = this.processConfig(a);
        this.useIndicators = {
            x: true,
            y: true
        };
        this.doHideIndicators = Ext.Function.bind(this.doHideIndicators, this);
        this.initConfig(a)
    },
    setConfig: function (a) {
        return this.callParent([this.processConfig(a)])
    },
    updateIndicatorsUi: function (a) {
        var b = this.getIndicators();
        b.x.setUi(a);
        b.y.setUi(a)
    },
    applyScroller: function (a, b) {
        return Ext.factory(a, Ext.scroll.Scroller, b)
    },
    applyIndicators: function (b, d) {
        var a = Ext.scroll.Indicator,
            c = this.useIndicators;
        if (!b) {
            b = {}
        }
        if (!b.x) {
            c.x = false;
            b.x = {}
        }
        if (!b.y) {
            c.y = false;
            b.y = {}
        }
        return {
            x: Ext.factory(b.x, a, d && d.x),
            y: Ext.factory(b.y, a, d && d.y)
        }
    },
    updateIndicators: function (a) {
        this.indicatorsGrid = Ext.Element.create({
            className: "x-scroll-bar-grid-wrapper",
            children: [{
                className: "x-scroll-bar-grid",
                children: [{
                    children: [{}, {
                        children: [a.y.barElement]
                    }]
                }, {
                    children: [{
                        children: [a.x.barElement]
                    }, {}]
                }]
            }]
        })
    },
    updateScroller: function (a) {
        a.on({
            scope: this,
            scrollstart: "onScrollStart",
            scroll: "onScroll",
            scrollend: "onScrollEnd",
            refresh: "refreshIndicators"
        })
    },
    isAxisEnabled: function (a) {
        return this.getScroller().isAxisEnabled(a) && this.useIndicators[a]
    },
    applyElement: function (a) {
        if (a) {
            return Ext.get(a)
        }
    },
    updateElement: function (c) {
        var b = c.getFirstChild().getFirstChild(),
            a = this.getScroller();
        c.addCls(this.getCls());
        c.insertFirst(this.indicatorsGrid);
        a.setElement(b);
        this.refreshIndicators();
        return this
    },
    showIndicators: function () {
        var a = this.getIndicators();
        if (this.hasOwnProperty("indicatorsHidingTimer")) {
            clearTimeout(this.indicatorsHidingTimer);
            delete this.indicatorsHidingTimer
        }
        if (this.isAxisEnabled("x")) {
            a.x.show()
        }
        if (this.isAxisEnabled("y")) {
            a.y.show()
        }
    },
    hideIndicators: function () {
        var a = this.getIndicatorsHidingDelay();
        if (a > 0) {
            this.indicatorsHidingTimer = setTimeout(this.doHideIndicators, a)
        } else {
            this.doHideIndicators()
        }
    },
    doHideIndicators: function () {
        var a = this.getIndicators();
        if (this.isAxisEnabled("x")) {
            a.x.hide()
        }
        if (this.isAxisEnabled("y")) {
            a.y.hide()
        }
    },
    onScrollStart: function () {
        this.onScroll.apply(this, arguments);
        this.showIndicators()
    },
    onScrollEnd: function () {
        this.hideIndicators()
    },
    onScroll: function (b, a, c) {
        this.setIndicatorValue("x", a);
        this.setIndicatorValue("y", c)
    },
    setIndicatorValue: function (b, f) {
        if (!this.isAxisEnabled(b)) {
            return this
        }
        var a = this.getScroller(),
            c = a.getMaxPosition()[b],
            e = a.getContainerSize()[b],
            d;
        if (c === 0) {
            d = f / e;
            if (f >= 0) {
                d += 1
            }
        } else {
            if (f > c) {
                d = 1 + ((f - c) / e)
            } else {
                if (f < 0) {
                    d = f / e
                } else {
                    d = f / c
                }
            }
        }
        this.getIndicators()[b].setValue(d)
    },
    refreshIndicator: function (d) {
        if (!this.isAxisEnabled(d)) {
            return this
        }
        var a = this.getScroller(),
            b = this.getIndicators()[d],
            e = a.getContainerSize()[d],
            f = a.getSize()[d],
            c = e / f;
        b.setRatio(c);
        b.refresh()
    },
    refresh: function () {
        return this.getScroller().refresh()
    },
    refreshIndicators: function () {
        var a = this.getIndicators();
        a.x.setActive(this.isAxisEnabled("x"));
        a.y.setActive(this.isAxisEnabled("y"));
        this.refreshIndicator("x");
        this.refreshIndicator("y")
    },
    destroy: function () {
        var a = this.getElement(),
            b = this.getIndicators();
        if (a && !a.isDestroyed) {
            a.removeCls(this.getCls())
        }
        b.x.destroy();
        b.y.destroy();
        Ext.destroy(this.getScroller(), this.indicatorsGrid);
        delete this.indicatorsGrid;
        this.callParent(arguments)
    }
});
Ext.define("Ext.behavior.Scrollable", {
    extend: "Ext.behavior.Behavior",
    requires: ["Ext.scroll.View"],
    constructor: function () {
        this.listeners = {
            painted: "onComponentPainted",
            scope: this
        };
        this.callParent(arguments)
    },
    onComponentPainted: function () {
        this.scrollView.refresh()
    },
    setConfig: function (d) {
        var b = this.scrollView,
            c = this.component,
            f, e, a;
        if (d) {
            if (!b) {
                this.scrollView = b = new Ext.scroll.View(d);
                b.on("destroy", "onScrollViewDestroy", this);
                c.setUseBodyElement(true);
                this.scrollerElement = a = c.innerElement;
                this.scrollContainer = e = a.wrap();
                this.scrollViewElement = f = c.bodyElement;
                b.setElement(f);
                if (c.isPainted()) {
                    this.onComponentPainted(c)
                }
                c.on(this.listeners)
            } else {
                if (Ext.isObject(d)) {
                    b.setConfig(d)
                }
            }
        } else {
            if (b) {
                b.destroy()
            }
        }
        return this
    },
    getScrollView: function () {
        return this.scrollView
    },
    onScrollViewDestroy: function () {
        var b = this.component,
            a = this.scrollerElement;
        if (!a.isDestroyed) {
            this.scrollerElement.unwrap()
        }
        this.scrollContainer.destroy();
        b.un(this.listeners);
        delete this.scrollerElement;
        delete this.scrollView;
        delete this.scrollContainer
    },
    onComponentDestroy: function () {
        var a = this.scrollView;
        if (a) {
            a.destroy()
        }
    }
});
Ext.define("Ext.Container", {
    extend: "Ext.Component",
    alternateClassName: "Ext.lib.Container",
    requires: ["Ext.layout.Layout", "Ext.ItemCollection", "Ext.behavior.Scrollable", "Ext.Mask"],
    xtype: "container",
    eventedConfig: {
        activeItem: 0
    },
    config: {
        layout: null,
        control: {},
        defaults: null,
        items: null,
        autoDestroy: true,
        defaultType: null,
        scrollable: null,
        useBodyElement: null,
        masked: null,
        modal: null,
        hideOnMaskTap: null
    },
    isContainer: true,
    delegateListeners: {
        delegate: "> component",
        centeredchange: "onItemCenteredChange",
        dockedchange: "onItemDockedChange",
        floatingchange: "onItemFloatingChange"
    },
    constructor: function (a) {
        var b = this;
        b._items = b.items = new Ext.ItemCollection();
        b.innerItems = [];
        b.onItemAdd = b.onFirstItemAdd;
        b.callParent(arguments)
    },
    getElementConfig: function () {
        return {
            reference: "element",
            className: "x-container",
            children: [{
                reference: "innerElement",
                className: "x-inner"
            }]
        }
    },
    applyMasked: function (a, b) {
        b = Ext.factory(a, Ext.Mask, b);
        if (b) {
            this.add(b)
        }
        return b
    },
    mask: function (a) {
        this.setMasked(a || true)
    },
    unmask: function () {
        this.setMasked(false)
    },
    applyModal: function (a, b) {
        if (!a && !b) {
            return
        }
        return Ext.factory(a, Ext.Mask, b)
    },
    updateModal: function (c, a) {
        var b = {
            painted: "refreshModalMask",
            erased: "destroyModalMask"
        };
        if (c) {
            this.on(b);
            c.on("destroy", "onModalDestroy", this);
            if (this.isPainted()) {
                this.refreshModalMask()
            }
        } else {
            if (a) {
                a.un("destroy", "onModalDestroy", this);
                this.un(b)
            }
        }
    },
    onModalDestroy: function () {
        this.setModal(null)
    },
    refreshModalMask: function () {
        var b = this.getModal(),
            a = this.getParent();
        if (!this.painted) {
            this.painted = true;
            if (b) {
                a.insertBefore(b, this);
                b.setZIndex(this.getZIndex() - 1)
            }
        }
    },
    destroyModalMask: function () {
        var b = this.getModal(),
            a = this.getParent();
        if (this.painted) {
            this.painted = false;
            if (b) {
                a.remove(b, false)
            }
        }
    },
    updateZIndex: function (b) {
        var a = this.getModal();
        this.callParent(arguments);
        if (a) {
            a.setZIndex(b - 1)
        }
    },
    updateHideOnMaskTap: function (b) {
        var a = this.getModal();
        if (a) {
            a[b ? "on" : "un"].call(a, "tap", "hide", this)
        }
    },
    updateBaseCls: function (a, b) {
        var c = this,
            d = c.getUi();
        if (a) {
            this.element.addCls(a);
            this.innerElement.addCls(a, null, "inner");
            if (d) {
                this.element.addCls(a, null, d)
            }
        }
        if (b) {
            this.element.removeCls(b);
            this.innerElement.removeCls(a, null, "inner");
            if (d) {
                this.element.removeCls(b, null, d)
            }
        }
    },
    updateUseBodyElement: function (a) {
        if (a) {
            this.bodyElement = this.innerElement.wrap({
                cls: "x-body"
            });
            this.referenceList.push("bodyElement")
        }
    },
    applyItems: function (a, b) {
        if (a) {
            this.getDefaultType();
            this.getDefaults();
            if (this.initialized && b.length > 0) {
                this.removeAll()
            }
            this.add(a)
        }
    },
    applyControl: function (c) {
        var a, b, e, d;
        for (a in c) {
            d = c[a];
            for (b in d) {
                e = d[b];
                if (Ext.isObject(e)) {
                    e.delegate = a
                }
            }
            d.delegate = a;
            this.addListener(d)
        }
        return c
    },
    onFirstItemAdd: function () {
        delete this.onItemAdd;
        this.setLayout(new Ext.layout.Layout(this, this.getLayout() || "default"));
        if (this.innerHtmlElement && !this.getHtml()) {
            this.innerHtmlElement.destroy();
            delete this.innerHtmlElement
        }
        this.on(this.delegateListeners);
        return this.onItemAdd.apply(this, arguments)
    },
    updateDefaultType: function (a) {
        this.defaultItemClass = Ext.ClassManager.getByAlias("widget." + a)
    },
    applyDefaults: function (a) {
        if (a) {
            this.factoryItem = this.factoryItemWithDefaults;
            return a
        }
    },
    factoryItem: function (a) {
        return Ext.factory(a, this.defaultItemClass)
    },
    factoryItemWithDefaults: function (c) {
        var b = this,
            d = b.getDefaults(),
            a;
        if (!d) {
            return Ext.factory(c, b.defaultItemClass)
        }
        if (c.isComponent) {
            a = c;
            if (d && c.isInnerItem() && !b.has(a)) {
                a.setConfig(d, true)
            }
        } else {
            if (d && !c.ignoreDefaults) {
                if (!(c.hasOwnProperty("left") && c.hasOwnProperty("right") && c.hasOwnProperty("top") && c.hasOwnProperty("bottom") && c.hasOwnProperty("docked") && c.hasOwnProperty("centered"))) {
                    c = Ext.mergeIf({}, c, d)
                }
            }
            a = Ext.factory(c, b.defaultItemClass)
        }
        return a
    },
    add: function (a) {
        var e = this,
            b, d, c, f;
        a = Ext.Array.from(a);
        d = a.length;
        for (b = 0; b < d; b++) {
            c = e.factoryItem(a[b]);
            this.doAdd(c);
            if (!f && !this.getActiveItem() && this.innerItems.length > 0 && c.isInnerItem()) {
                f = c
            }
        }
        if (f) {
            this.setActiveItem(f)
        }
        return c
    },
    doAdd: function (d) {
        var c = this,
            a = c.getItems(),
            b;
        if (!a.has(d)) {
            b = a.length;
            a.add(d);
            if (d.isInnerItem()) {
                c.insertInner(d)
            }
            d.setParent(c);
            c.onItemAdd(d, b)
        }
    },
    remove: function (d, b) {
        var c = this,
            a = c.indexOf(d),
            e = this.getInnerItems(),
            f;
        if (b === undefined) {
            b = c.getAutoDestroy()
        }
        if (a !== -1) {
            if (!this.removingAll && e.length > 1 && d === this.getActiveItem()) {
                this.on({
                    activeitemchange: "doRemove",
                    scope: this,
                    single: true,
                    order: "after",
                    args: [d, a, b]
                });
                f = e.indexOf(d);
                if (f === 0) {
                    this.setActiveItem(1)
                } else {
                    this.setActiveItem(0)
                }
            } else {
                this.doRemove(d, a, b)
            }
        }
        return c
    },
    doRemove: function (d, a, b) {
        var c = this;
        c.items.remove(d);
        if (d.isInnerItem()) {
            c.removeInner(d)
        }
        c.onItemRemove(d, a);
        d.setParent(null);
        if (b) {
            d.destroy()
        }
    },
    removeAll: function (c, f) {
        var a = this.items,
            e = a.length,
            b = 0,
            d;
        if (c === undefined) {
            c = this.getAutoDestroy()
        }
        f = Boolean(f);
        this.removingAll = true;
        for (; b < e; b++) {
            d = a.getAt(b);
            if (d && (f || d.isInnerItem())) {
                this.doRemove(d, b, c);
                b--;
                e--
            }
        }
        this.removingAll = false;
        return this
    },
    getAt: function (a) {
        return this.items.getAt(a)
    },
    removeAt: function (a) {
        var b = this.getAt(a);
        if (b) {
            this.remove(b)
        }
        return this
    },
    removeInnerAt: function (a) {
        var b = this.getInnerItems()[a];
        if (b) {
            this.remove(b)
        }
        return this
    },
    has: function (a) {
        return this.getItems().indexOf(a) != -1
    },
    hasInnerItem: function (a) {
        return this.innerItems.indexOf(a) != -1
    },
    indexOf: function (a) {
        return this.getItems().indexOf(a)
    },
    insertInner: function (d, b) {
        var a = this.getItems().items,
            f = this.innerItems,
            g = f.indexOf(d),
            c = -1,
            e;
        if (g !== -1) {
            f.splice(g, 1)
        }
        if (typeof b == "number") {
            do {
                e = a[++b]
            } while (e && !e.isInnerItem());
            if (e) {
                c = f.indexOf(e);
                f.splice(c, 0, d)
            }
        }
        if (c === -1) {
            f.push(d);
            c = f.length - 1
        }
        if (g !== -1) {
            this.onInnerItemMove(d, c, g)
        }
        return this
    },
    onInnerItemMove: Ext.emptyFn,
    removeInner: function (a) {
        Ext.Array.remove(this.innerItems, a);
        return this
    },
    insert: function (a, d) {
        var c = this,
            b;
        if (Ext.isArray(d)) {
            for (b = d.length - 1; b >= 0; b--) {
                c.insert(a, d[b])
            }
            return c
        }
        d = this.factoryItem(d);
        this.doInsert(a, d);
        return d
    },
    doInsert: function (d, f) {
        var e = this,
            b = e.items,
            c = b.length,
            a, g;
        g = f.isInnerItem();
        if (d > c) {
            d = c
        }
        if (b[d - 1] === f) {
            return e
        }
        a = e.indexOf(f);
        if (a !== -1) {
            if (a < d) {
                d -= 1
            }
            b.removeAt(a)
        } else {
            f.setParent(e)
        }
        b.insert(d, f);
        if (g) {
            e.insertInner(f, d)
        }
        if (a !== -1) {
            e.onItemMove(f, d, a)
        } else {
            e.onItemAdd(f, d)
        }
    },
    insertFirst: function (a) {
        return this.insert(0, a)
    },
    insertLast: function (a) {
        return this.insert(this.getItems().length, a)
    },
    insertBefore: function (c, a) {
        var b = this.indexOf(a);
        if (b !== -1) {
            this.insert(b, c)
        }
        return this
    },
    insertAfter: function (c, a) {
        var b = this.indexOf(a);
        if (b !== -1) {
            this.insert(b + 1, c)
        }
        return this
    },
    onItemAdd: function (b, a) {
        this.doItemLayoutAdd(b, a);
        if (this.initialized) {
            this.fireEvent("add", this, b, a)
        }
    },
    doItemLayoutAdd: function (c, a) {
        var b = this.getLayout();
        if (this.isRendered() && c.setRendered(true)) {
            c.fireAction("renderedchange", [this, c, true], "onItemAdd", b, {
                args: [c, a]
            })
        } else {
            b.onItemAdd(c, a)
        }
    },
    onItemRemove: function (b, a) {
        this.doItemLayoutRemove(b, a);
        this.fireEvent("remove", this, b, a)
    },
    doItemLayoutRemove: function (c, a) {
        var b = this.getLayout();
        if (this.isRendered() && c.setRendered(false)) {
            c.fireAction("renderedchange", [this, c, false], "onItemRemove", b, {
                args: [c, a]
            })
        } else {
            b.onItemRemove(c, a)
        }
    },
    onItemMove: function (b, c, a) {
        if (b.isDocked()) {
            b.setDocked(null)
        }
        this.doItemLayoutMove(b, c, a);
        this.fireEvent("move", this, b, c, a)
    },
    doItemLayoutMove: function (b, c, a) {
        this.getLayout().onItemMove(b, c, a)
    },
    onItemCenteredChange: function (b, a) {
        if (!b.isFloating() && !b.isDocked()) {
            if (a) {
                this.removeInner(b)
            } else {
                this.insertInner(b, this.indexOf(b))
            }
        }
        this.getLayout().onItemCenteredChange(b, a)
    },
    onItemFloatingChange: function (a, b) {
        if (!a.isCentered() && !a.isDocked()) {
            if (b) {
                this.removeInner(a)
            } else {
                this.insertInner(a, this.indexOf(a))
            }
        }
        this.getLayout().onItemFloatingChange(a, b)
    },
    onItemDockedChange: function (a, c, b) {
        if (!a.isCentered() && !a.isFloating()) {
            if (c) {
                this.removeInner(a)
            } else {
                this.insertInner(a, this.indexOf(a))
            }
        }
        this.getLayout().onItemDockedChange(a, c, b)
    },
    getInnerItems: function () {
        return this.innerItems
    },
    getDockedItems: function () {
        var a = this.getItems().items,
            c = [],
            e = a.length,
            d, b;
        for (b = 0; b < e; b++) {
            d = a[b];
            if (d.isDocked()) {
                c.push(d)
            }
        }
        return c
    },
    applyActiveItem: function (c, a) {
        var b = this.getInnerItems();
        this.getItems();
        if (typeof c == "number") {
            c = Math.max(0, Math.min(c, b.length - 1));
            c = b[c];
            if (c) {
                return c
            } else {
                if (a) {
                    return null
                }
            }
        } else {
            if (c) {
                if (!c.isComponent) {
                    c = this.factoryItem(c)
                }
                if (!this.has(c)) {
                    this.add(c)
                }
                return c
            }
        }
    },
    animateActiveItem: function (d, c) {
        var b = this.getLayout(),
            a;
        c = new Ext.fx.layout.Card(c);
        if (c && b.isCard) {
            c.setLayout(b);
            a = b.getAnimation();
            if (a) {
                a.disable();
                c.on("animationend", function () {
                    a.enable();
                    c.destroy()
                }, this)
            }
        }
        return this.setActiveItem(d)
    },
    doSetActiveItem: function (b, a) {
        if (a) {
            a.fireEvent("deactivate", a, this, b)
        }
        if (b) {
            b.fireEvent("activate", b, this, a)
        }
    },
    setRendered: function (d) {
        if (this.callParent(arguments)) {
            var a = this.items.items,
                b, c;
            for (b = 0, c = a.length; b < c; b++) {
                a[b].setRendered(d)
            }
            return true
        }
        return false
    },
    getScrollableBehavior: function () {
        var a = this.scrollableBehavior;
        if (!a) {
            a = this.scrollableBehavior = new Ext.behavior.Scrollable(this)
        }
        return a
    },
    applyScrollable: function (a) {
        this.getScrollableBehavior().setConfig(a)
    },
    getScrollable: function () {
        return this.getScrollableBehavior().getScrollView()
    },
    getRefItems: function (a) {
        var b = this.getItems().items.slice(),
            e = b.length,
            c, d;
        if (a) {
            for (c = 0; c < e; c++) {
                d = b[c];
                if (d.getRefItems) {
                    b = b.concat(d.getRefItems(true))
                }
            }
        }
        return b
    },
    getComponent: function (a) {
        if (Ext.isObject(a)) {
            a = a.getItemId()
        }
        return this.getItems().get(a)
    },
    getDockedComponent: function (a) {
        if (Ext.isObject(a)) {
            a = a.getItemId()
        }
        var c = this.getDockedItems(),
            e = c.length,
            d, b;
        if (Ext.isNumber(a)) {
            return c[a]
        }
        for (b = 0; b < e; b++) {
            d = c[b];
            if (d.id == a) {
                return d
            }
        }
        return false
    },
    query: function (a) {
        return Ext.ComponentQuery.query(a, this)
    },
    child: function (a) {
        return this.query("> " + a)[0] || null
    },
    down: function (a) {
        return this.query(a)[0] || null
    },
    destroy: function () {
        var a = this.getModal();
        if (a) {
            a.destroy()
        }
        this.removeAll(true, true);
        Ext.destroy(this.getScrollable(), this.bodyElement);
        this.callParent()
    }
}, function () {
    this.addMember("defaultItemClass", this)
});
Ext.define("Ext.TitleBar", {
    extend: "Ext.Container",
    xtype: "titlebar",
    requires: ["Ext.Button", "Ext.Title", "Ext.Spacer", "Ext.util.SizeMonitor"],
    isToolbar: true,
    config: {
        baseCls: Ext.baseCSSPrefix + "toolbar",
        cls: Ext.baseCSSPrefix + "navigation-bar",
        ui: "dark",
        title: null,
        defaultType: "button",
        layout: {
            type: "hbox"
        },
        items: []
    },
    maxButtonWidth: "40%",
    constructor: function () {
        this.refreshTitlePosition = Ext.Function.createThrottled(this.refreshTitlePosition, 50, this);
        this.callParent(arguments)
    },
    beforeInitialize: function () {
        this.applyItems = this.applyInitialItems
    },
    initialize: function () {
        delete this.applyItems;
        this.doAdd = this.doBoxAdd;
        this.remove = this.doBoxRemove;
        this.doInsert = this.doBoxInsert;
        this.add(this.initialItems);
        delete this.initialItems;
        this.on({
            painted: "onPainted",
            erased: "onErased"
        })
    },
    applyInitialItems: function (c) {
        var e = Ext.util.SizeMonitor,
            f = this.getDefaults() || {},
            a, b, d;
        this.initialItems = c;
        this.leftBox = a = this.add({
            xtype: "container",
            style: "position: relative",
            layout: {
                type: "hbox",
                align: "center"
            }
        });
        this.spacer = d = this.add({
            xtype: "component",
            style: "position: relative",
            flex: 1
        });
        this.rightBox = b = this.add({
            xtype: "container",
            style: "position: relative",
            layout: {
                type: "hbox",
                align: "center"
            }
        });
        this.titleComponent = this.add({
            xtype: "title",
            hidden: f.hidden,
            centered: true
        });
        this.sizeMonitors = {
            leftBox: new e({
                element: a.renderElement,
                callback: this.refreshTitlePosition,
                scope: this
            }),
            spacer: new e({
                element: d.renderElement,
                callback: this.refreshTitlePosition,
                scope: this
            }),
            rightBox: new e({
                element: b.renderElement,
                callback: this.refreshTitlePosition,
                scope: this
            })
        }
    },
    doBoxAdd: function (a) {
        if (a.config.align == "right") {
            this.rightBox.add(a)
        } else {
            this.leftBox.add(a)
        }
        if (this.painted) {
            this.refreshTitlePosition()
        }
    },
    doBoxRemove: function (a) {
        if (a.config.align == "right") {
            this.rightBox.remove(a)
        } else {
            this.leftBox.remove(a)
        }
        if (this.painted) {
            this.refreshTitlePosition()
        }
    },
    doBoxInsert: function (a, b) {
        if (b.config.align == "right") {
            this.rightBox.add(b)
        } else {
            this.leftBox.add(b)
        }
    },
    onPainted: function () {
        var a = this.sizeMonitors;
        this.painted = true;
        this.refreshTitlePosition();
        a.leftBox.refresh();
        a.spacer.refresh();
        a.rightBox.refresh()
    },
    onErased: function () {
        this.painted = false
    },
    getMaxButtonWidth: function () {
        var a = this.maxButtonWidth;
        if (Ext.isString(this.maxButtonWidth)) {
            a = parseInt(a.replace("%", ""), 10);
            a = Math.round((this.element.getWidth() / 100) * a)
        }
        return a
    },
    refreshTitlePosition: function () {
        var f = this.titleComponent.renderElement;
        f.setWidth(null);
        f.setLeft(null);
        var a = this.leftBox,
            c = a.down("button"),
            h, n;
        if (c) {
            c.renderElement.setWidth("auto");
            h = a.renderElement.getWidth();
            n = this.getMaxButtonWidth();
            if (h > n) {
                c.renderElement.setWidth(n)
            }
        }
        var k = this.spacer.renderElement.getPageBox(),
            l = f.getPageBox(),
            g = l.width - k.width,
            d = l.left,
            j = l.right,
            b, m, e;
        if (g > 0) {
            f.setWidth(k.width);
            b = g / 2;
            d += b;
            j -= b
        }
        m = k.left - d;
        e = j - k.right;
        if (m > 0) {
            f.setLeft(m)
        } else {
            if (e > 0) {
                f.setLeft(-e)
            }
        }
        f.repaint()
    },
    updateTitle: function (a) {
        this.titleComponent.setTitle(a);
        this.titleBox = null;
        if (this.painted) {
            this.refreshTitlePosition()
        }
    },
    destroy: function () {
        this.callParent();
        var a = this.sizeMonitors;
        a.leftBox.destroy();
        a.spacer.destroy();
        a.rightBox.destroy()
    }
});
Ext.define("Ext.navigation.Bar", {
    extend: "Ext.Container",
    requires: ["Ext.Button", "Ext.TitleBar", "Ext.Spacer", "Ext.util.SizeMonitor"],
    isToolbar: true,
    config: {
        baseCls: Ext.baseCSSPrefix + "toolbar",
        cls: Ext.baseCSSPrefix + "navigation-bar",
        ui: "dark",
        title: null,
        defaultType: "button",
        layout: {
            type: "hbox"
        },
        defaultBackButtonText: "Back",
        animation: {
            duration: 300
        },
        useTitleForBackButtonText: null,
        view: null,
        backButton: {
            align: "left",
            ui: "back",
            hidden: true
        }
    },
    minBackButtonWidth: 80,
    constructor: function (a) {
        a = a || {};
        if (!a.items) {
            a.items = []
        }
        this.callParent([a])
    },
    beforeInitialize: function () {
        this.backButtonStack = [];
        this.lastAnimationProperties = {};
        this.animating = false;
        this.onSizeMonitorChange = Ext.Function.createThrottled(this.onSizeMonitorChange, 50, this)
    },
    initialize: function () {
        var a = this;
        a.on({
            painted: "onPainted",
            erased: "onErased"
        });
        a.onSizeMonitorChange()
    },
    updateView: function (f, a) {
        var c = this.getBackButton(),
            e, b, d;
        this.getItems();
        if (f) {
            this.backButtonStack = [];
            e = f.getInnerItems();
            for (b = 0; b < e.length; b++) {
                this.backButtonStack.push(e[b].config.title || "&nbsp;")
            }
            this.titleComponent.setTitle(this.getTitleText());
            d = this.getBackButtonText();
            if (d) {
                c.setText(this.getBackButtonText());
                c.show()
            }
        }
    },
    onViewAdd: function (a, c, b) {
        var d = a.getLayout().getAnimation();
        this.endAnimation();
        this.backButtonStack.push(c.config.title || "&nbsp;");
        this.refreshNavigationBarProxy();
        if (d && d.isAnimation && a.isPainted()) {
            if (this.backButtonStack.length > 1) {
                this.pushBackButtonAnimated(this.getBackButtonText())
            }
            this.pushTitleAnimated(this.getTitleText())
        } else {
            if (this.backButtonStack.length > 1) {
                this.pushBackButton(this.getBackButtonText())
            }
            this.pushTitle(this.getTitleText())
        }
    },
    onViewRemove: function (a, c, b) {
        var d = a.getLayout().getAnimation();
        this.endAnimation();
        this.backButtonStack.pop();
        this.refreshNavigationBarProxy();
        if (d && d.isAnimation && a.isPainted()) {
            this.popBackButtonAnimated(this.getBackButtonText());
            this.popTitleAnimated(this.getTitleText())
        } else {
            this.popBackButton(this.getBackButtonText());
            this.popTitle(this.getTitleText())
        }
    },
    endAnimation: function () {
        var c = this.lastAnimationProperties,
            d, b, a;
        if (c) {
            for (d in c) {
                b = Ext.get(d);
                for (a in c[d].to) {
                    b.setStyle(a, c[d][a])
                }
                if (c[d].onEnd) {
                    c[d].onEnd.call(this)
                }
            }
        }
    },
    applyBackButton: function (a) {
        return Ext.factory(a, Ext.Button, this.getBackButton())
    },
    updateBackButton: function (a, b) {
        if (b) {
            this.remove(b)
        }
        if (a) {
            this.add(a);
            a.on({
                scope: this,
                tap: this.onBackButtonTap
            })
        }
    },
    onBackButtonTap: function () {
        this.fireEvent("back", this)
    },
    updateUseTitleForBackButtonText: function (a) {
        var b = this.getBackButton();
        if (b) {
            b.setText(this.getBackButtonText())
        }
        this.onSizeMonitorChange()
    },
    onPainted: function () {
        this.painted = true;
        this.sizeMonitor.refresh();
        this.onSizeMonitorChange()
    },
    onErased: function () {
        this.painted = false
    },
    applyItems: function (c) {
        var e = this;
        if (!e.initialized) {
            var f = e.getDefaults() || {},
                a, b, d;
            e.leftBox = a = e.add({
                xtype: "container",
                style: "position: relative",
                layout: {
                    type: "hbox",
                    align: "center"
                }
            });
            e.spacer = d = e.add({
                xtype: "component",
                style: "position: relative",
                flex: 1
            });
            e.rightBox = b = e.add({
                xtype: "container",
                style: "position: relative",
                layout: {
                    type: "hbox",
                    align: "center"
                }
            });
            e.titleComponent = e.add({
                xtype: "title",
                hidden: f.hidden,
                centered: true
            });
            e.sizeMonitor = new Ext.util.SizeMonitor({
                element: e.renderElement,
                callback: e.onSizeMonitorChange,
                scope: e
            });
            e.doAdd = e.doBoxAdd;
            e.doInsert = e.doBoxInsert
        }
        e.callParent(arguments)
    },
    doBoxAdd: function (a) {
        if (a.config.align == "right") {
            this.rightBox.add(a)
        } else {
            this.leftBox.add(a)
        }
    },
    doBoxInsert: function (a, b) {
        if (b.config.align == "right") {
            this.rightBox.add(b)
        } else {
            this.leftBox.add(b)
        }
    },
    onSizeMonitorChange: function () {
        if (!this.rendered) {
            return
        }
        var c = this.getBackButton(),
            a = this.titleComponent;
        if (c && c.rendered) {
            c.renderElement.setWidth(null)
        }
        this.refreshNavigationBarProxy();
        var b = this.getNavigationBarProxyProperties();
        if (c && c.rendered) {
            c.renderElement.setWidth(b.backButton.width)
        }
        a.renderElement.setStyle("-webkit-transform", null);
        a.renderElement.setWidth(b.title.width);
        a.renderElement.setLeft(b.title.left)
    },
    getBackButtonAnimationProperties: function () {
        var c = this,
            b = c.renderElement,
            h = c.getBackButton().renderElement,
            e = c.titleComponent.renderElement,
            g = Math.min(b.getWidth() / 3, 200),
            a = this.getNavigationBarProxyProperties(),
            d, f;
        d = e.getX() - b.getX();
        f = b.getX() - h.getX() - h.getWidth();
        d = Math.min(d, g);
        return {
            element: {
                from: {
                    left: d,
                    width: a.backButton.width,
                    opacity: 0
                },
                to: {
                    left: 0,
                    width: a.backButton.width,
                    opacity: 1
                }
            },
            ghost: {
                from: null,
                to: {
                    left: f,
                    opacity: 0
                }
            }
        }
    },
    getBackButtonAnimationReverseProperties: function () {
        var d = this,
            c = d.renderElement,
            h = d.getBackButton().renderElement,
            f = d.titleComponent.renderElement,
            b = Math.min(c.getWidth() / 3, 200),
            a = this.getNavigationBarProxyProperties(),
            e, g;
        e = c.getX() - h.getX() - h.getWidth();
        g = f.getX() - h.getWidth();
        g = Math.min(g, b);
        return {
            element: {
                from: {
                    left: e,
                    width: a.backButton.width,
                    opacity: 0
                },
                to: {
                    left: 0,
                    width: a.backButton.width,
                    opacity: 1
                }
            },
            ghost: {
                from: null,
                to: {
                    left: g,
                    opacity: 0
                }
            }
        }
    },
    getTitleAnimationProperties: function () {
        var c = this,
            b = c.renderElement,
            e = c.titleComponent.renderElement,
            a = this.getNavigationBarProxyProperties(),
            d, f;
        d = b.getWidth() - e.getX();
        f = b.getX() - e.getX() + a.backButton.width;
        if ((a.backButton.left + e.getWidth()) > e.getX()) {
            f = b.getX() - e.getX() - e.getWidth()
        }
        return {
            element: {
                from: {
                    left: d,
                    width: a.title.width,
                    opacity: 0
                },
                to: {
                    left: a.title.left,
                    width: a.title.width,
                    opacity: 1
                }
            },
            ghost: {
                from: e.getLeft(),
                to: {
                    left: f,
                    opacity: 0
                }
            }
        }
    },
    getTitleAnimationReverseProperties: function () {
        var d = this,
            c = d.renderElement,
            f = d.titleComponent.renderElement,
            a = this.getNavigationBarProxyProperties(),
            b = 0,
            e, g;
        b = f.getLeft();
        f.setLeft(0);
        e = c.getX() - f.getX() + a.backButton.width;
        g = c.getX() + c.getWidth();
        if ((a.backButton.left + f.getWidth()) > f.getX()) {
            e = c.getX() - f.getX() - f.getWidth()
        }
        return {
            element: {
                from: {
                    left: e,
                    width: a.title.width,
                    opacity: 0
                },
                to: {
                    left: a.title.left,
                    width: a.title.width,
                    opacity: 1
                }
            },
            ghost: {
                from: b,
                to: {
                    left: g,
                    opacity: 0
                }
            }
        }
    },
    animate: function (c, f, e, b) {
        var d = this,
            a = {
                element: c,
                easing: "ease-in-out",
                duration: this.getAnimation().duration,
                replacePrevious: true
            };
        this.lastAnimationProperties[c.id] = {
            to: e,
            onEnd: b
        };
        c.setLeft(0);
        if (Ext.os.is.Android) {
            if (f) {
                a.from = {
                    left: f.left,
                    opacity: f.opacity
                };
                if (f.width) {
                    a.from.width = f.width
                }
            }
            if (e) {
                a.to = {
                    left: e.left,
                    opacity: e.opacity
                };
                if (e.width) {
                    a.to.width = e.width
                }
            }
        } else {
            if (f) {
                a.from = {
                    transform: {
                        translateX: f.left
                    },
                    opacity: f.opacity
                };
                if (f.width) {
                    a.from.width = f.width
                }
            }
            if (e) {
                a.to = {
                    transform: {
                        translateX: e.left
                    },
                    opacity: e.opacity
                };
                if (e.width) {
                    a.to.width = e.width
                }
            }
        }
        fn = function () {
            if (b) {
                b.call(d)
            }
            d.lastAnimationProperties = {}
        };
        a.onEnd = fn;
        Ext.Animator.run(a)
    },
    getBackButtonText: function () {
        var b = this.backButtonStack[this.backButtonStack.length - 2],
            a = this.getUseTitleForBackButtonText();
        if (!a) {
            if (b) {
                b = this.getDefaultBackButtonText()
            }
        }
        return b
    },
    getTitleText: function () {
        return this.backButtonStack[this.backButtonStack.length - 1]
    },
    pushBackButton: function (c) {
        var b = this.getBackButton();
        b.setText(c);
        b.show();
        var a = this.getBackButtonAnimationProperties(),
            d = a.element.to;
        if (d.left) {
            b.setLeft(d.left)
        }
        if (d.width) {
            b.setWidth(d.width)
        }
    },
    pushBackButtonAnimated: function (f) {
        var e = this;
        var d = e.getBackButton(),
            b = d.getText(),
            g = d.renderElement,
            c = e.getBackButtonAnimationProperties(),
            a;
        if (b) {
            a = e.createProxy(d)
        }
        d.setText(this.getBackButtonText());
        d.show();
        e.animate(g, c.element.from, c.element.to, function () {
            e.animating = false
        });
        if (a) {
            e.animate(a, c.ghost.from, c.ghost.to, function () {
                a.destroy()
            })
        }
    },
    popBackButton: function (c) {
        var b = this.getBackButton();
        b.setText(null);
        if (c) {
            b.setText(this.getBackButtonText())
        } else {
            b.hide()
        }
        var a = this.getBackButtonAnimationReverseProperties(),
            d = a.element.to;
        if (d.left) {
            b.setLeft(d.left)
        }
        if (d.width) {
            b.setWidth(d.width)
        }
    },
    popBackButtonAnimated: function (f) {
        var e = this;
        var d = e.getBackButton(),
            b = d.getText(),
            g = d.renderElement,
            c = e.getBackButtonAnimationReverseProperties(),
            a;
        if (b) {
            a = e.createProxy(d)
        }
        if (f && e.backButtonStack.length) {
            d.setText(this.getBackButtonText());
            d.show();
            e.animate(g, c.element.from, c.element.to)
        } else {
            d.hide()
        }
        if (a) {
            e.animate(a, c.ghost.from, c.ghost.to, function () {
                a.destroy();
                if (!f) {
                    d.setText(null)
                }
            })
        }
    },
    pushTitle: function (e) {
        var c = this.titleComponent,
            b = c.renderElement,
            a = this.getTitleAnimationProperties(),
            d = a.element.to;
        c.setTitle(e);
        if (d.left) {
            b.setLeft(d.left)
        }
        if (d.width) {
            b.setWidth(d.width)
        }
    },
    pushTitleAnimated: function (h) {
        var e = this;
        var d = e.getBackButton(),
            b = (d) ? d.getText() : null,
            g = e.titleComponent,
            f = g.renderElement,
            c = e.getTitleAnimationProperties(),
            a;
        if (b) {
            a = e.createProxy(g, true)
        }
        g.setTitle(h);
        e.animate(f, c.element.from, c.element.to);
        if (a) {
            e.animate(a, c.ghost.from, c.ghost.to, function () {
                a.destroy()
            })
        }
    },
    popTitle: function (e) {
        var c = this.titleComponent,
            b = c.renderElement,
            a = this.getTitleAnimationReverseProperties(),
            d = a.element.to;
        c.setTitle(e);
        if (d.left) {
            b.setLeft(d.left)
        }
        if (d.width) {
            b.setWidth(d.width)
        }
    },
    popTitleAnimated: function (h) {
        var e = this;
        var d = e.getBackButton(),
            b = e.titleComponent.getTitle(),
            g = e.titleComponent,
            f = g.renderElement,
            c = e.getTitleAnimationReverseProperties(),
            a;
        if (b) {
            a = e.createProxy(g, true)
        }
        g.setTitle(h || "");
        e.animate(f, c.element.from, c.element.to, function () {
            e.animating = false
        });
        if (a) {
            e.animate(a, c.ghost.from, c.ghost.to, function () {
                a.destroy()
            })
        }
    },
    createNavigationBarProxy: function () {
        var a = this.proxy;
        if (a) {
            return
        }
        this.proxy = a = Ext.create("Ext.TitleBar", {
            items: [{
                xtype: "button",
                ui: "back",
                text: ""
            }],
            title: this.backButtonStack[0]
        });
        a.backButton = a.down("button[ui=back]");
        Ext.getBody().appendChild(a.renderElement);
        a.renderElement.setStyle("position", "absolute");
        a.element.setStyle("visibility", "hidden");
        a.renderElement.setX(0);
        a.renderElement.setY(-1000)
    },
    getNavigationBarProxyProperties: function () {
        return {
            title: {
                left: this.proxy.titleComponent.renderElement.getLeft(),
                width: this.proxy.titleComponent.renderElement.getWidth()
            },
            backButton: {
                left: this.proxy.backButton.renderElement.getLeft(),
                width: this.proxy.backButton.renderElement.getWidth()
            }
        }
    },
    refreshNavigationBarProxy: function () {
        var c = this.proxy,
            b = this.renderElement,
            a = this.backButtonStack,
            e = a[a.length - 1],
            d = this.getBackButtonText();
        if (!c) {
            this.createNavigationBarProxy();
            c = this.proxy
        }
        c.renderElement.setWidth(b.getWidth());
        c.renderElement.setHeight(b.getHeight());
        c.setTitle(e);
        if (d) {
            c.backButton.setText(d);
            c.backButton.show()
        } else {
            c.backButton.hide()
        }
        c.refreshTitlePosition()
    },
    onBeforePop: function (b) {
        b--;
        for (var a = 0; a < b; a++) {
            this.backButtonStack.pop()
        }
    },
    doSetHidden: function (a) {
        if (!a) {
            this.element.setStyle({
                position: "relative",
                top: "auto",
                left: "auto",
                width: "auto"
            })
        } else {
            this.element.setStyle({
                position: "absolute",
                top: "-1000px",
                left: "-1000px",
                width: this.element.getWidth() + "px"
            })
        }
    },
    createProxy: function (b, a) {
        var c = (a) ? b.element.getParent() : b.element,
            d = Ext.get(c.id + "-proxy");
        if (!d) {
            d = c.dom.cloneNode(true);
            d.id = c.id + "-proxy";
            c.getParent().dom.appendChild(d);
            d = Ext.get(d);
            d.setStyle("position", "absolute");
            d.setY(c.getY());
            d.setX(c.getX())
        }
        return d
    }
});
Ext.define("Ext.Toolbar", {
    extend: "Ext.Container",
    xtype: "toolbar",
    requires: ["Ext.Button", "Ext.Title", "Ext.Spacer"],
    isToolbar: true,
    config: {
        baseCls: Ext.baseCSSPrefix + "toolbar",
        ui: "dark",
        title: null,
        defaultType: "button",
        layout: {
            type: "hbox",
            align: "center"
        }
    },
    constructor: function (a) {
        a = a || {};
        if (a.docked == "left" || a.docked == "right") {
            a.layout = {
                type: "vbox",
                align: "stretch"
            }
        }
        this.callParent([a])
    },
    applyTitle: function (a) {
        if (typeof a == "string") {
            a = {
                title: a,
                centered: true
            }
        }
        return Ext.factory(a, Ext.Title, this.getTitle())
    },
    updateTitle: function (b, a) {
        if (b) {
            this.add(b);
            this.getLayout().setItemFlex(b, 1)
        }
        if (a) {
            a.destroy()
        }
    },
    showTitle: function () {
        var a = this.getTitle();
        if (a) {
            a.show()
        }
    },
    hideTitle: function () {
        var a = this.getTitle();
        if (a) {
            a.hide()
        }
    }
}, function () {});
Ext.define("Kitchensink.view.touchevent.Logger", {
    extend: "Ext.Container",
    xtype: "toucheventlogger",
    config: {
        layout: "fit",
        items: [{
            xtype: "toolbar",
            docked: "top",
            ui: "light",
            title: "Event Log"
        }, {
            id: "logger",
            html: "<span>Try using gestures on the area to the right to see how events are fired.</span>",
            scrollable: true,
            styleHtmlContent: true
        }]
    },
    addLog: function (c) {
        var b = Ext.getCmp("logger"),
            a = b.getScrollable().getScroller();
        b.innerHtmlElement.createChild({
            html: c
        });
        setTimeout(function () {
            a.scrollTo(0, a.getSize().y - a.getContainerSize().y)
        }, 50)
    }
});
Ext.define("Kitchensink.view.touchevent.Pad", {
    extend: "Ext.Container",
    xtype: "toucheventpad",
    id: "touchpad",
    config: {
        flex: 1,
        margin: 10,
        layout: {
            type: "vbox",
            pack: "center",
            align: "stretch"
        },
        items: [{
            html: "Touch here!"
        }]
    }
});
Ext.define("Kitchensink.view.TouchEvents", {
    extend: "Ext.Container",
    xtype: "touchevents",
    requires: ["Kitchensink.view.touchevent.Info", "Kitchensink.view.touchevent.Logger", "Kitchensink.view.touchevent.Pad"],
    initialize: function () {
        this.callParent(arguments);
        this.getEventDispatcher().addListener("element", "#touchpad", "*", this.onTouchPadEvent, this)
    },
    onTouchPadEvent: function (f, d, b, c) {
        var a = c.info.eventName;
        if (!a.match("mouse") && a !== "click") {
            this.down("toucheventlogger").addLog(a)
        }
    }
});
Ext.define("Kitchensink.view.phone.TouchEvents", {
    extend: "Kitchensink.view.TouchEvents",
    config: {
        layout: "card",
        items: [{
            scrollable: true,
            layout: {
                type: "vbox",
                align: "stretch"
            },
            items: [{
                xtype: "button",
                ui: "confirm",
                text: "Console",
                margin: 10,
                action: "showConsole"
            }, {
                xtype: "toucheventinfo"
            }]
        }, {
            layout: {
                type: "vbox",
                align: "stretch"
            },
            items: [{
                xtype: "toucheventpad",
                flex: 1
            }, {
                xtype: "toucheventlogger",
                flex: 1
            }]
        }]
    },
    showConsole: function () {
        this.setActiveItem(1)
    }
});
Ext.define("Kitchensink.view.tablet.TouchEvents", {
    extend: "Kitchensink.view.TouchEvents",
    config: {
        layout: {
            type: "hbox",
            align: "stretch"
        },
        items: [{
            docked: "left",
            width: 250,
            id: "touchinfopanel",
            layout: {
                type: "vbox",
                align: "stretch"
            },
            items: [{
                flex: 3,
                scrollable: true,
                layout: {
                    type: "vbox",
                    align: "stretch"
                },
                items: {
                    xtype: "toucheventinfo"
                }
            }, {
                xtype: "toucheventlogger",
                flex: 2
            }]
        }, {
            xtype: "toucheventpad",
            flex: 1
        }]
    }
});
Ext.define("Ext.Panel", {
    extend: "Ext.Container",
    requires: ["Ext.util.LineSegment"],
    alternateClassName: "Ext.lib.Panel",
    xtype: "panel",
    isPanel: true,
    config: {
        baseCls: Ext.baseCSSPrefix + "panel",
        bodyPadding: null,
        bodyMargin: null,
        bodyBorder: null
    },
    getElementConfig: function () {
        var a = this.callParent();
        a.children.push({
            reference: "tipElement",
            className: "x-anchor",
            hidden: true
        });
        return a
    },
    applyBodyPadding: function (a) {
        if (a === true) {
            a = 5
        }
        a = Ext.dom.Element.unitizeBox(a);
        return a
    },
    updateBodyPadding: function (a) {
        this.element.setStyle("padding", a)
    },
    applyBodyMargin: function (a) {
        if (a === true) {
            a = 5
        }
        a = Ext.dom.Element.unitizeBox(a);
        return a
    },
    updateBodyMargin: function (a) {
        this.element.setStyle("margin", a)
    },
    applyBodyBorder: function (a) {
        if (a === true) {
            a = 1
        }
        a = Ext.dom.Element.unitizeBox(a);
        return a
    },
    updateBodyBorder: function (a) {
        this.element.setStyle("border-width", a)
    },
    alignTo: function (n) {
        var x = this.tipElement;
        x.hide();
        if (this.currentTipPosition) {
            x.removeCls("x-anchor-" + this.currentTipPosition)
        }
        this.callParent(arguments);
        var f = Ext.util.LineSegment,
            d = n.isComponent ? n.renderElement : n,
            a = this.renderElement,
            o = d.getPageBox(),
            l = a.getPageBox(),
            b = l.left,
            u = l.top,
            D = l.right,
            h = l.bottom,
            k = b + (l.width / 2),
            j = u + (l.height / 2),
            p = {
                x: b,
                y: u
            },
            m = {
                x: D,
                y: u
            },
            C = {
                x: b,
                y: h
            },
            E = {
                x: D,
                y: h
            },
            z = {
                x: k,
                y: j
            },
            t = o.left + (o.width / 2),
            r = o.top + (o.height / 2),
            w = {
                x: t,
                y: r
            },
            c = new f(z, w),
            g = 0,
            B = 0,
            e, A, s, q, y, v;
        x.setVisibility(false);
        x.show();
        e = x.getSize();
        A = e.width;
        s = e.height;
        if (c.intersects(new f(p, m))) {
            y = Math.min(Math.max(t, b), D - (A / 2));
            v = u;
            B = s;
            q = "top"
        } else {
            if (c.intersects(new f(p, C))) {
                y = b;
                v = Math.min(Math.max(r + (A / 2), u), h);
                g = s;
                q = "left"
            } else {
                if (c.intersects(new f(C, E))) {
                    y = Math.min(Math.max(t, b), D - (A / 2));
                    v = h;
                    B = -s;
                    q = "bottom"
                } else {
                    if (c.intersects(new f(m, E))) {
                        y = D;
                        v = Math.min(Math.max(r - (A / 2), u), h);
                        g = -s;
                        q = "right"
                    }
                }
            }
        }
        if (y || v) {
            this.currentTipPosition = q;
            x.addCls("x-anchor-" + q);
            x.setLeft(y - b);
            x.setTop(v - u);
            x.setVisibility(true);
            this.setLeft(this.getLeft() + g);
            this.setTop(this.getTop() + B)
        }
    }
});
Ext.define("Ext.Sheet", {
    extend: "Ext.Panel",
    xtype: "sheet",
    requires: ["Ext.fx.Animation"],
    config: {
        baseCls: Ext.baseCSSPrefix + "sheet",
        hidden: true,
        modal: true,
        centered: true,
        stretchX: null,
        stretchY: null,
        enter: "bottom",
        exit: "bottom",
        showAnimation: !Ext.os.is.Android2 ? {
            type: "slideIn",
            duration: 250,
            easing: "ease-out"
        } : null,
        hideAnimation: !Ext.os.is.Android2 ? {
            type: "slideOut",
            duration: 250,
            easing: "ease-in"
        } : null
    },
    applyHideAnimation: function (b) {
        var a = this.getExit(),
            d = a;
        if (a === null) {
            return null
        }
        if (b === true) {
            b = {
                type: "slideOut"
            }
        }
        if (Ext.isString(b)) {
            b = {
                type: b
            }
        }
        var c = Ext.factory(b, Ext.fx.Animation);
        if (c) {
            if (a == "bottom") {
                d = "down"
            }
            if (a == "top") {
                d = "up"
            }
            c.setDirection(d)
        }
        return c
    },
    applyShowAnimation: function (a) {
        var d = this.getEnter(),
            c = d;
        if (d === null) {
            return null
        }
        if (a === true) {
            a = {
                type: "slideIn"
            }
        }
        if (Ext.isString(a)) {
            a = {
                type: a
            }
        }
        var b = Ext.factory(a, Ext.fx.Animation);
        if (b) {
            if (d == "bottom") {
                c = "down"
            }
            if (d == "top") {
                c = "up"
            }
            b.setBefore({
                display: null
            });
            b.setReverse(true);
            b.setDirection(c)
        }
        return b
    },
    updateStretchX: function (a) {
        this.getLeft();
        this.getRight();
        if (a) {
            this.setLeft(0);
            this.setRight(0)
        }
    },
    updateStretchY: function (a) {
        this.getTop();
        this.getBottom();
        if (a) {
            this.setTop(0);
            this.setBottom(0)
        }
    }
});
Ext.define("Ext.MessageBox", {
    extend: "Ext.Sheet",
    requires: ["Ext.Toolbar", "Ext.field.Text", "Ext.field.TextArea"],
    config: {
        ui: "dark",
        baseCls: Ext.baseCSSPrefix + "msgbox",
        iconCls: null,
        showAnimation: {
            type: "popIn",
            duration: 250,
            easing: "ease-out"
        },
        hideAnimation: {
            type: "popOut",
            duration: 250,
            easing: "ease-out"
        },
        zIndex: 10,
        defaultTextHeight: 75,
        title: null,
        buttons: null,
        message: null,
        prompt: null,
        layout: {
            type: "vbox",
            pack: "center"
        }
    },
    statics: {
        OK: {
            text: "OK",
            itemId: "ok",
            ui: "action"
        },
        YES: {
            text: "Yes",
            itemId: "yes",
            ui: "action"
        },
        NO: {
            text: "No",
            itemId: "no"
        },
        CANCEL: {
            text: "Cancel",
            itemId: "cancel"
        },
        INFO: Ext.baseCSSPrefix + "msgbox-info",
        WARNING: Ext.baseCSSPrefix + "msgbox-warning",
        QUESTION: Ext.baseCSSPrefix + "msgbox-question",
        ERROR: Ext.baseCSSPrefix + "msgbox-error",
        OKCANCEL: [{
            text: "Cancel",
            itemId: "cancel"
        }, {
            text: "OK",
            itemId: "ok",
            ui: "action"
        }],
        YESNOCANCEL: [{
            text: "Cancel",
            itemId: "cancel"
        }, {
            text: "No",
            itemId: "no"
        }, {
            text: "Yes",
            itemId: "yes",
            ui: "action"
        }],
        YESNO: [{
            text: "No",
            itemId: "no"
        }, {
            text: "Yes",
            itemId: "yes",
            ui: "action"
        }]
    },
    constructor: function (a) {
        a = a || {};
        if (a.hasOwnProperty("promptConfig")) {
            Ext.applyIf(a, {
                prompt: a.promptConfig
            });
            delete a.promptConfig
        }
        if (a.hasOwnProperty("multiline") || a.hasOwnProperty("multiLine")) {
            a.prompt = a.prompt || {};
            Ext.applyIf(a.prompt, {
                multiLine: a.multiline || a.multiLine
            });
            delete a.multiline;
            delete a.multiLine
        }
        this.callParent([a])
    },
    applyTitle: function (a) {
        if (typeof a == "string") {
            a = {
                title: a
            }
        }
        Ext.applyIf(a, {
            docked: "top",
            cls: this.getBaseCls() + "-title"
        });
        return Ext.factory(a, Ext.Toolbar, this.getTitle())
    },
    updateTitle: function (a) {
        if (a) {
            this.add(a)
        }
    },
    updateButtons: function (a) {
        var b = this;
        if (a) {
            if (b.buttonsToolbar) {
                b.buttonsToolbar.removeAll();
                b.buttonsToolbar.setItems(a)
            } else {
                b.buttonsToolbar = Ext.create("Ext.Toolbar", {
                    docked: "bottom",
                    defaultType: "button",
                    layout: {
                        type: "hbox",
                        pack: "center"
                    },
                    ui: b.getUi(),
                    cls: b.getBaseCls() + "-buttons",
                    items: a
                });
                b.add(b.buttonsToolbar)
            }
        }
    },
    applyMessage: function (a) {
        a = {
            html: a,
            cls: this.getBaseCls() + "-text"
        };
        return Ext.factory(a, Ext.Component, this._message)
    },
    updateMessage: function (a) {
        if (a) {
            this.add(a)
        }
    },
    getMessage: function () {
        if (this._message) {
            return this._message.getHtml()
        }
        return null
    },
    applyIconCls: function (a) {
        a = {
            xtype: "component",
            docked: "left",
            width: 40,
            height: 40,
            baseCls: Ext.baseCSSPrefix + "icon",
            hidden: (a) ? false : true,
            cls: a
        };
        return Ext.factory(a, Ext.Component, this._iconCls)
    },
    updateIconCls: function (a, b) {
        var c = this;
        this.getTitle();
        this.getButtons();
        if (a && !b) {
            this.add(a)
        } else {
            this.remove(b)
        }
    },
    getIconCls: function () {
        var b = this._iconCls,
            a;
        if (b) {
            a = b.getCls();
            return (a) ? a[0] : null
        }
        return null
    },
    applyPrompt: function (a) {
        if (a) {
            var b = {
                label: false
            };
            if (Ext.isObject(a)) {
                Ext.apply(b, a)
            }
            if (b.multiLine) {
                b.height = Ext.isNumber(b.multiLine) ? parseFloat(b.multiLine) : this.getDefaultTextHeight();
                return Ext.factory(b, Ext.field.TextArea, this.getPrompt())
            } else {
                return Ext.factory(b, Ext.field.Text, this.getPrompt())
            }
        }
        return a
    },
    updatePrompt: function (a, b) {
        if (a) {
            this.add(a)
        }
        if (b) {
            this.remove(b)
        }
    },
    onClick: function (c) {
        if (c) {
            var b = c.config.userConfig || {},
                d = c.getInitialConfig(),
                a = this.getPrompt();
            if (typeof b.fn == "function") {
                this.on({
                    hiddenchange: function () {
                        b.fn.call(b.scope || null, d.itemId || d.text, a ? a.getValue() : null, b)
                    },
                    single: true,
                    scope: this
                })
            }
            if (b.cls) {
                this.el.removeCls(b.cls)
            }
            if (b.input) {
                b.input.dom.blur()
            }
        }
        this.hide()
    },
    show: function (f) {
        if (!this.getParent() && Ext.Viewport) {
            Ext.Viewport.add(this)
        }
        if (!f) {
            return this.callParent()
        }
        var b = Ext.Object.merge({}, {
            value: ""
        }, f);
        var e = f.buttons || Ext.MessageBox.OK || [],
            d = [],
            c = f;
        Ext.each(e, function (g) {
            if (!g) {
                return
            }
            d.push(Ext.apply({
                userConfig: c,
                scope: this,
                handler: "onClick"
            }, g))
        }, this);
        b.buttons = d;
        if (b.promptConfig) {}
        b.prompt = (b.promptConfig || b.prompt) || null;
        if (b.multiLine) {
            b.prompt = b.prompt || {};
            b.prompt.multiLine = b.multiLine;
            delete b.multiLine
        }
        this.setConfig(b);
        var a = this.getPrompt();
        if (a) {
            a.setValue(f.value || "")
        }
        this.callParent();
        return this
    },
    alert: function (d, c, b, a) {
        return this.show({
            title: d,
            message: c,
            buttons: Ext.MessageBox.OK,
            promptConfig: false,
            fn: function (e) {
                if (b) {
                    b.call(a, e)
                }
            },
            scope: a
        })
    },
    confirm: function (d, c, b, a) {
        return this.show({
            title: d,
            message: c,
            buttons: Ext.MessageBox.YESNO,
            promptConfig: false,
            scope: a,
            fn: function (e) {
                if (b) {
                    b.call(a, e)
                }
            }
        })
    },
    prompt: function (g, d, c, b, f, e, a) {
        return this.show({
            title: g,
            message: d,
            buttons: Ext.MessageBox.OKCANCEL,
            scope: b,
            prompt: a || true,
            multiLine: f,
            value: e,
            fn: function (j, h) {
                if (c) {
                    c.call(b, j, h)
                }
            }
        })
    }
}, function (a) {
    Ext.onSetup(function () {
        Ext.Msg = new a
    })
});
Ext.define("Ext.dataview.component.DataItem", {
    extend: "Ext.Container",
    xtype: "dataitem",
    config: {
        baseCls: Ext.baseCSSPrefix + "data-item",
        defaultType: "component",
        record: null,
        itemCls: null,
        dataMap: {},
        items: [{
            xtype: "component"
        }]
    },
    updateItemCls: function (b, a) {
        if (a) {
            this.removeCls(a)
        }
        if (b) {
            this.addCls(b)
        }
    },
    updateRecord: function (d) {
        if (!d) {
            return
        }
        var h = this,
            c = h.config.dataview,
            b = c.prepareData(d.getData(true), c.getStore().indexOf(d), d),
            e = h.getItems(),
            l = e.first(),
            j = h.getDataMap(),
            f, k, g, a;
        if (!l) {
            return
        }
        for (f in j) {
            g = j[f];
            k = h[f]();
            if (k) {
                for (a in g) {
                    if (k[a]) {
                        k[a](b[g[a]])
                    }
                }
            }
        }
        l.updateData(b)
    }
});
Ext.define("Ext.dataview.component.Container", {
    extend: "Ext.Container",
    requires: ["Ext.dataview.component.DataItem"],
    constructor: function () {
        this.itemCache = [];
        this.callParent(arguments)
    },
    doInitialize: function () {
        this.innerElement.on({
            touchstart: "onItemTouchStart",
            touchend: "onItemTouchEnd",
            tap: "onItemTap",
            touchmove: "onItemTouchMove",
            doubletap: "onItemDoubleTap",
            swipe: "onItemSwipe",
            delegate: "> ." + Ext.baseCSSPrefix + "data-item",
            scope: this
        })
    },
    initialize: function () {
        this.callParent();
        this.doInitialize()
    },
    onItemTouchStart: function (d) {
        var b = this,
            c = d.getTarget(),
            a = Ext.getCmp(c.id);
        a.on({
            touchmove: "onItemTouchMove",
            scope: b,
            single: true
        });
        b.fireEvent("itemtouchstart", b, a, b.indexOf(a), d)
    },
    onItemTouchMove: function (d) {
        var b = this,
            c = d.getTarget(),
            a = Ext.getCmp(c.id);
        b.fireEvent("itemtouchmove", b, a, b.indexOf(a), d)
    },
    onItemTouchEnd: function (d) {
        var b = this,
            c = d.getTarget(),
            a = Ext.getCmp(c.id);
        a.un({
            touchmove: "onItemTouchMove",
            scope: b
        });
        b.fireEvent("itemtouchend", b, a, b.indexOf(a), d)
    },
    onItemTap: function (d) {
        var b = this,
            c = d.getTarget(),
            a = Ext.getCmp(c.id);
        b.fireEvent("itemtap", b, a, b.indexOf(a), d)
    },
    onItemTapHold: function (d) {
        var b = this,
            c = d.getTarget(),
            a = Ext.getCmp(c.id);
        b.fireEvent("itemtaphold", b, a, b.indexOf(a), d)
    },
    onItemDoubleTap: function (d) {
        var b = this,
            c = d.getTarget(),
            a = Ext.getCmp(c.id);
        b.fireEvent("itemdoubletap", b, a, b.indexOf(a), d)
    },
    onItemSwipe: function (d) {
        var b = this,
            c = d.getTarget(),
            a = Ext.getCmp(c.id);
        b.fireEvent("itemswipe", b, a, b.indexOf(a), d)
    },
    moveItemsToCache: function (j, k) {
        var h = this,
            c = h.dataview,
            a = c.getMaxItemCache(),
            g = h.getViewItems(),
            f = h.itemCache,
            e = f.length,
            l = c.getPressedCls(),
            d = c.getSelectedCls(),
            b = k - j,
            m;
        for (; b >= 0; b--) {
            m = g[j + b];
            if (e !== a) {
                h.remove(m, false);
                m.removeCls([l, d]);
                f.push(m);
                e++
            } else {
                m.destroy()
            }
        }
        if (h.getViewItems().length == 0) {
            this.dataview.showEmptyText()
        }
    },
    moveItemsFromCache: function (b) {
        var l = this,
            e = l.dataview,
            m = e.getStore(),
            k = b.length,
            a = e.getDefaultType(),
            h = e.getItemConfig(),
            g = l.itemCache,
            f = g.length,
            j = [],
            c, n, d;
        if (k) {
            e.hideEmptyText()
        }
        for (c = 0; c < k; c++) {
            b[c]._tmpIndex = m.indexOf(b[c])
        }
        Ext.Array.sort(b, function (p, o) {
            return p._tmpIndex > o._tmpIndex ? 1 : -1
        });
        for (c = 0; c < k; c++) {
            d = b[c];
            if (f) {
                f--;
                n = g.pop();
                n.setRecord(d)
            } else {
                n = l.getDataItemConfig(a, d, h)
            }
            this.insert(d._tmpIndex, n);
            delete d._tmpIndex
        }
        return j
    },
    getViewItems: function () {
        return this.getInnerItems()
    },
    updateListItem: function (a, b) {
        if (b.setRecord) {
            b.setRecord(a)
        }
    },
    getDataItemConfig: function (d, b, c) {
        var a = this.dataview;
        return {
            xtype: d,
            record: b,
            dataview: a,
            itemCls: a.getItemCls(),
            defaults: c
        }
    },
    doRemoveItemCls: function (a) {
        var b = this.getViewItems(),
            d = b.length,
            c = 0;
        for (; c < d; c++) {
            b[c].removeCls(a)
        }
    },
    doAddItemCls: function (a) {
        var b = this.getViewItems(),
            d = b.length,
            c = 0;
        for (; c < d; c++) {
            b[c].addCls(a)
        }
    },
    destroy: function () {
        var d = this,
            b = d.itemCache,
            c = b.length,
            a = 0;
        for (; a < c; a++) {
            b[a].destroy()
        }
        this.callParent()
    }
});
Ext.define("Ext.dataview.DataView", {
    extend: "Ext.Container",
    alternateClassName: "Ext.DataView",
    mixins: ["Ext.mixin.Selectable"],
    xtype: "dataview",
    requires: ["Ext.LoadMask", "Ext.data.StoreManager", "Ext.dataview.component.Container", "Ext.dataview.element.Container"],
    config: {
        store: null,
        baseCls: Ext.baseCSSPrefix + "dataview",
        emptyText: null,
        deferEmptyText: true,
        itemTpl: "<div>{text}</div>",
        pressedCls: "x-item-pressed",
        itemCls: null,
        selectedCls: "x-item-selected",
        triggerEvent: "itemtap",
        triggerCtEvent: "tap",
        deselectOnContainerClick: true,
        scrollable: true,
        pressedDelay: 100,
        loadingText: "Loading...",
        useComponents: null,
        itemConfig: {},
        maxItemCache: 20,
        defaultType: "dataitem",
        scrollToTopOnRefresh: true
    },
    constructor: function (a) {
        var b = this;
        b.hasLoadedStore = false;
        b.mixins.selectable.constructor.apply(b, arguments);
        b.callParent(arguments)
    },
    updateItemCls: function (c, b) {
        var a = this.container;
        if (a) {
            if (b) {
                a.doRemoveItemCls(b)
            }
            if (c) {
                a.doAddItemCls(c)
            }
        }
    },
    storeEventHooks: {
        beforeload: "onBeforeLoad",
        load: "onLoad",
        refresh: "refresh",
        addrecords: "onStoreAdd",
        removerecords: "onStoreRemove",
        updaterecord: "onStoreUpdate"
    },
    doInitialize: function () {
        var b = this,
            a;
        b.on(b.getTriggerCtEvent(), b.onContainerTrigger, b);
        a = b.container = this.add(new Ext.dataview[b.getUseComponents() ? "component" : "element"].Container());
        a.dataview = b;
        a.on(b.getTriggerEvent(), b.onItemTrigger, b);
        a.on({
            itemtouchstart: "onItemTouchStart",
            itemtouchend: "onItemTouchEnd",
            itemtap: "onItemTap",
            itemtaphold: "onItemTapHold",
            itemtouchmove: "onItemTouchMove",
            itemdoubletap: "onItemDoubleTap",
            itemswipe: "onItemSwipe",
            scope: b
        });
        if (this.getStore()) {
            this.refresh()
        }
    },
    initialize: function () {
        this.callParent();
        this.doInitialize()
    },
    prepareData: function (c, b, a) {
        return c
    },
    onContainerTrigger: function (b) {
        var a = this;
        if (b.target != a.element.dom) {
            return
        }
        if (a.getDeselectOnContainerClick() && a.getStore()) {
            a.deselectAll()
        }
    },
    onItemTrigger: function (a, d, b, c) {
        this.selectWithEvent(this.getStore().getAt(b))
    },
    doAddPressedCls: function (a) {
        var c = this,
            b = c.container.getViewItems()[c.getStore().indexOf(a)];
        if (Ext.isElement(b)) {
            b = Ext.get(b)
        }
        if (b) {
            b.addCls(c.getPressedCls())
        }
    },
    onItemTouchStart: function (b, j, d, h) {
        var f = this,
            c = f.getStore(),
            a = c && c.getAt(d),
            g = f.getPressedDelay();
        if (a) {
            if (g > 0) {
                f.pressedTimeout = Ext.defer(f.doAddPressedCls, g, f, [a])
            } else {
                f.doAddPressedCls(a)
            }
        }
        f.fireEvent("itemtouchstart", f, d, j, a, h)
    },
    onItemTouchEnd: function (b, h, d, g) {
        var f = this,
            c = f.getStore(),
            a = c && c.getAt(d);
        if (this.hasOwnProperty("pressedTimeout")) {
            clearTimeout(this.pressedTimeout);
            delete this.pressedTimeout
        }
        if (a && h) {
            h.removeCls(f.getPressedCls())
        }
        f.fireEvent("itemtouchend", f, d, h, a, g)
    },
    onItemTouchMove: function (b, h, d, g) {
        var f = this,
            c = f.getStore(),
            a = c && c.getAt(d);
        if (f.hasOwnProperty("pressedTimeout")) {
            clearTimeout(f.pressedTimeout);
            delete f.pressedTimeout
        }
        if (a && h) {
            h.removeCls(f.getPressedCls())
        }
        f.fireEvent("itemtouchmove", f, d, h, a, g)
    },
    onItemTap: function (b, h, d, g) {
        var f = this,
            c = f.getStore(),
            a = c && c.getAt(d);
        f.fireEvent("itemtap", f, d, h, a, g)
    },
    onItemTapHold: function (b, h, d, g) {
        var f = this,
            c = f.getStore(),
            a = c && c.getAt(d);
        f.fireEvent("itemtaphold", f, d, h, a, g)
    },
    onItemDoubleTap: function (b, h, d, g) {
        var f = this,
            c = f.getStore(),
            a = c && c.getAt(d);
        f.fireEvent("itemdoubletap", f, d, h, a, g)
    },
    onItemSwipe: function (b, h, d, g) {
        var f = this,
            c = f.getStore(),
            a = c && c.getAt(d);
        f.fireEvent("itemswipe", f, d, h, a, g)
    },
    onItemSelect: function (a, b) {
        var c = this;
        if (b) {
            c.doItemSelect(c, a)
        } else {
            c.fireAction("select", [c, a], "doItemSelect")
        }
    },
    doItemSelect: function (c, a) {
        if (c.container) {
            var b = c.container.getViewItems()[c.getStore().indexOf(a)];
            if (Ext.isElement(b)) {
                b = Ext.get(b)
            }
            if (b) {
                b.removeCls(c.getPressedCls());
                b.addCls(c.getSelectedCls())
            }
        }
    },
    onItemDeselect: function (a, b) {
        var c = this;
        if (c.container) {
            if (b) {
                c.doItemDeselect(c, a)
            } else {
                c.fireAction("deselect", [c, a, b], "doItemDeselect")
            }
        }
    },
    doItemDeselect: function (c, a) {
        var b = c.container.getViewItems()[c.getStore().indexOf(a)];
        if (Ext.isElement(b)) {
            b = Ext.get(b)
        }
        if (b) {
            b.removeCls([c.getPressedCls(), c.getSelectedCls()])
        }
    },
    updateData: function (b) {
        var a = this.getStore();
        if (!a) {
            this.setStore(Ext.create("Ext.data.Store", {
                data: b
            }))
        } else {
            a.add(b)
        }
    },
    applyStore: function (a) {
        var b = this,
            c = Ext.apply({}, b.storeEventHooks, {
                scope: b
            });
        if (a) {
            a = Ext.data.StoreManager.lookup(a);
            if (a && Ext.isObject(a) && a.isStore) {
                a.on(c)
            }
        }
        return a
    },
    updateStore: function (a, c) {
        var b = this,
            d = Ext.apply({}, b.storeEventHooks, {
                scope: b
            });
        if (c && Ext.isObject(c) && c.isStore) {
            if (c.autoDestroy) {
                c.destroy()
            } else {
                c.un(d)
            }
        }
        if (a) {
            if (a.isAutoLoading()) {
                this.hasLoadedStore = true
            }
            if (a.isLoading()) {
                this.hasLoadedStore = true;
                b.onBeforeLoad()
            }
            if (b.container) {
                b.refresh()
            }
        }
    },
    onBeforeLoad: function () {
        var b = this.getScrollable();
        if (b) {
            b.getScroller().stopAnimation()
        }
        var a = this.getLoadingText();
        if (a) {
            this.setMasked({
                xtype: "loadmask",
                message: a
            });
            if (b) {
                b.getScroller().setDisabled(true)
            }
        }
        this.hideEmptyText()
    },
    updateEmptyText: function (b) {
        var a = this;
        if (b) {
            a.emptyTextCmp = a.add({
                xtype: "component",
                cls: a.getBaseCls() + "-emptytext",
                html: b,
                hidden: true
            })
        } else {
            if (a.emptyTextCmp) {
                a.remove(a.emptyTextCmp, true);
                delete a.emptyTextCmp
            }
        }
    },
    onLoad: function (a) {
        var b = this.getScrollable();
        this.hasLoadedStore = true;
        this.setMasked(false);
        if (b) {
            b.getScroller().setDisabled(false)
        }
        if (!a.getCount()) {
            this.showEmptyText()
        }
    },
    refresh: function () {
        var b = this,
            a = b.container;
        if (!b.getStore()) {
            if (!b.hasLoadedStore && !b.getDeferEmptyText()) {
                b.showEmptyText()
            }
            return
        }
        if (a) {
            b.fireAction("refresh", [b], "doRefresh")
        }
    },
    applyItemTpl: function (a) {
        return (Ext.isObject(a) && a.isTemplate) ? a : new Ext.XTemplate(a)
    },
    onAfterRender: function () {
        var a = this;
        a.callParent(arguments);
        a.updateStore(a.getStore())
    },
    getViewItems: function () {
        return this.container.getViewItems()
    },
    doRefresh: function (f) {
        var a = f.container,
            j = f.getStore(),
            b = j.getRange(),
            e = a.getViewItems(),
            h = b.length,
            l = e.length,
            c = h - l,
            g = f.getScrollable(),
            d, k;
        if (this.getScrollToTopOnRefresh() && g) {
            g.getScroller().scrollToTop()
        }
        if (h < 1) {
            f.onStoreClear();
            return
        }
        if (c < 0) {
            a.moveItemsToCache(l + c, l - 1);
            e = a.getViewItems();
            l = e.length
        } else {
            if (c > 0) {
                a.moveItemsFromCache(j.getRange(l))
            }
        }
        for (d = 0; d < l; d++) {
            k = e[d];
            a.updateListItem(b[d], k)
        }
    },
    showEmptyText: function () {
        if (this.hasLoadedStore && this.getEmptyText()) {
            this.emptyTextCmp.show()
        }
    },
    hideEmptyText: function () {
        if (this.getEmptyText()) {
            this.emptyTextCmp.hide()
        }
    },
    onStoreClear: function () {
        var c = this,
            a = c.container,
            b = a.getViewItems();
        a.moveItemsToCache(0, b.length - 1);
        this.showEmptyText()
    },
    onStoreAdd: function (b, a) {
        if (a) {
            this.container.moveItemsFromCache(a)
        }
    },
    onStoreRemove: function (c, b, f) {
        var a = this.container,
            e = b.length,
            d;
        for (d = 0; d < e; d++) {
            a.moveItemsToCache(f[d], f[d])
        }
    },
    onStoreUpdate: function (c, b, d, f) {
        var e = this,
            a = e.container;
        f = (typeof f === "undefined") ? d : f;
        if (f !== d) {
            a.moveItemsToCache(f, f);
            a.moveItemsFromCache([b])
        } else {
            a.updateListItem(b, a.getViewItems()[d])
        }
    }
});
Ext.define("Ext.dataview.List", {
    alternateClassName: "Ext.List",
    extend: "Ext.dataview.DataView",
    xtype: "list",
    requires: ["Ext.dataview.element.List", "Ext.dataview.IndexBar", "Ext.dataview.ListItemHeader"],
    config: {
        indexBar: false,
        icon: null,
        preventSelectionOnDisclose: true,
        baseCls: Ext.baseCSSPrefix + "list",
        pinHeaders: true,
        grouped: null,
        onItemDisclosure: null
    },
    constructor: function () {
        this.translateHeader = (Ext.os.is.Android2) ? this.translateHeaderCssPosition : this.translateHeaderTransform;
        this.callParent(arguments)
    },
    onItemTrigger: function (a, d, b, c) {
        if (!(this.getPreventSelectionOnDisclose() && Ext.fly(c.target).hasCls(this.getBaseCls() + "-disclosure"))) {
            this.callParent(arguments)
        }
    },
    doInitialize: function () {
        var b = this,
            a;
        b.on(b.getTriggerCtEvent(), b.onContainerTrigger, b);
        a = b.container = this.add(new Ext.dataview.element.List({
            baseCls: this.getBaseCls()
        }));
        a.dataview = b;
        a.on(b.getTriggerEvent(), b.onItemTrigger, b);
        a.element.on({
            delegate: "." + this.getBaseCls() + "-disclosure",
            tap: "handleItemDisclosure",
            scope: b
        });
        a.on({
            itemtouchstart: "onItemTouchStart",
            itemtouchend: "onItemTouchEnd",
            itemtap: "onItemTap",
            itemtaphold: "onItemTapHold",
            itemtouchmove: "onItemTouchMove",
            itemdoubletap: "onItemDoubleTap",
            itemswipe: "onItemSwipe",
            scope: b
        });
        if (this.getStore()) {
            this.refresh()
        }
    },
    applyIndexBar: function (a) {
        return Ext.factory(a, Ext.dataview.IndexBar, this.getIndexBar())
    },
    updateIndexBar: function (a) {
        if (a && this.getScrollable()) {
            this.indexBarElement = this.getScrollableBehavior().getScrollView().getElement().appendChild(a.renderElement);
            a.on({
                index: "onIndex",
                scope: this
            });
            this.element.addCls(this.getBaseCls() + "-indexed")
        }
    },
    updateGrouped: function (a) {
        if (a) {
            this.doRefreshHeaders();
            this.updatePinHeaders(this.getPinHeaders())
        } else {
            this.container.doRemoveHeaders();
            this.updatePinHeaders(null)
        }
    },
    updatePinHeaders: function (b) {
        var c = this.getScrollable(),
            a;
        if (c) {
            a = c.getScroller()
        }
        if (!c) {
            return
        }
        if (b && this.getGrouped()) {
            a.on({
                refresh: "doRefreshHeaders",
                scroll: "onScroll",
                scope: this
            });
            if (!this.header || !this.header.renderElement.dom) {
                this.createHeader()
            }
        } else {
            a.un({
                refresh: "doRefreshHeaders",
                scroll: "onScroll",
                scope: this
            });
            if (this.header) {
                this.header.destroy()
            }
        }
    },
    createHeader: function () {
        var e, d = this.getScrollable(),
            a, b, c;
        if (d) {
            a = d.getScroller();
            b = this.getScrollableBehavior().getScrollView();
            c = b.getElement()
        } else {
            return
        }
        this.header = e = Ext.create("Ext.dataview.ListItemHeader", {
            html: " ",
            cls: "x-list-header-swap"
        });
        c.dom.insertBefore(e.element.dom, a.getContainer().dom.nextSibling);
        this.translateHeader(1000)
    },
    refresh: function () {
        this.callParent();
        this.doRefreshHeaders()
    },
    onStoreAdd: function () {
        this.callParent(arguments);
        this.doRefreshHeaders()
    },
    onStoreRemove: function () {
        this.callParent(arguments);
        this.doRefreshHeaders()
    },
    onStoreUpdate: function () {
        this.callParent(arguments);
        this.doRefreshHeaders()
    },
    onStoreClear: function () {
        this.callParent();
        if (this.header) {
            this.header.destroy()
        }
        this.doRefreshHeaders()
    },
    getClosestGroups: function () {
        var a = this.pinHeaderInfo.offsets,
            e = this.getScrollable(),
            d = a.length,
            b = 0,
            h, g, f, c;
        if (e) {
            h = e.getScroller().position
        } else {
            return {
                current: 0,
                next: 0
            }
        }
        for (; b < d; b++) {
            g = a[b];
            if (g.offset > h.y) {
                c = g;
                break
            }
            f = g
        }
        return {
            current: f,
            next: c
        }
    },
    doRefreshHeaders: function () {
        if (!this.getGrouped() || !this.container) {
            return false
        }
        var l = this.findGroupHeaderIndices(),
            f = l.length,
            g = this.container.getViewItems(),
            j = this.pinHeaderInfo = {
                offsets: []
            },
            a = j.offsets,
            h = this.getScrollable(),
            e, k, b, d, c;
        if (f) {
            for (b = 0; b < f; b++) {
                d = g[l[b]];
                if (d) {
                    c = this.getItemHeader(d);
                    a.push({
                        header: c,
                        offset: d.offsetTop
                    })
                }
            }
            j.closest = this.getClosestGroups();
            this.setActiveGroup(j.closest.current);
            if (c) {
                j.headerHeight = Ext.fly(c).getHeight()
            }
            if (h) {
                e = h.getScroller();
                k = e.position;
                this.onScroll(e, k.x, k.y)
            }
        }
    },
    getItemHeader: function (a) {
        return a.childNodes[0]
    },
    onScroll: function (e, k, h) {
        var g = this,
            j = g.pinHeaderInfo,
            a = j.closest,
            b = g.activeGroup,
            c = j.headerHeight,
            d, f;
        if (!a) {
            return
        }
        d = a.next;
        f = a.current;
        if (!this.header || !this.header.renderElement.dom) {
            this.createHeader()
        }
        if (h <= 0) {
            if (b) {
                g.setActiveGroup(false);
                a.next = f
            }
            this.translateHeader(1000);
            return
        } else {
            if ((d && h > d.offset) || (f && h < f.offset)) {
                a = j.closest = this.getClosestGroups();
                d = a.next;
                f = a.current;
                this.setActiveGroup(f)
            }
        }
        if (d && h > 0 && d.offset - h <= c) {
            var l = c - (d.offset - h);
            this.translateHeader(l)
        } else {
            this.translateHeader(null)
        }
    },
    translateHeaderTransform: function (a) {
        this.header.renderElement.dom.style.webkitTransform = (a === null) ? null : "translate3d(0px, -" + a + "px, 0px)"
    },
    translateHeaderCssPosition: function (a) {
        this.header.renderElement.dom.style.top = (a === null) ? null : "-" + Math.round(a) + "px"
    },
    setActiveGroup: function (b) {
        var a = this,
            c = a.header;
        if (c) {
            if (b) {
                if (!a.activeGroup || a.activeGroup.header != b.header) {
                    c.show();
                    if (c.element) {
                        c.setHtml(b.header.innerHTML)
                    }
                }
            } else {
                if (c && c.dom) {
                    c.hide()
                }
            }
        }
        this.activeGroup = b
    },
    onIndex: function (o, c) {
        var r = this,
            s = c.toLowerCase(),
            b = r.getStore(),
            q = b.getGroups(),
            f = q.length,
            h = r.getScrollable(),
            n, e, m, g, k, p;
        if (h) {
            n = r.getScrollable().getScroller()
        } else {
            return
        }
        for (m = 0; m < f; m++) {
            e = q[m];
            k = e.name.toLowerCase();
            if (k == s || k > s) {
                g = e;
                break
            } else {
                g = e
            }
        }
        if (h && g) {
            p = r.container.getViewItems()[b.indexOf(g.children[0])];
            n.stopAnimation();
            var l = n.getContainerSize().y,
                j = n.getSize().y,
                d = j - l,
                a = (p.offsetTop > d) ? d : p.offsetTop;
            n.scrollTo(0, a)
        }
    },
    applyOnItemDisclosure: function (a) {
        if (Ext.isFunction(a)) {
            return {
                scope: this,
                handler: a
            }
        }
        return a
    },
    handleItemDisclosure: function (f) {
        var d = this,
            c = f.getTarget().parentNode,
            b = d.container.getViewItems().indexOf(c),
            a = d.getStore().getAt(b);
        d.fireAction("disclose", [d, a, c, b, f], "doDisclose")
    },
    doDisclose: function (f, a, d, c, g) {
        var b = f.getOnItemDisclosure();
        if (b && b.handler) {
            b.handler.call(f, a, d, c, g)
        }
    },
    findGroupHeaderIndices: function () {
        if (!this.getGrouped()) {
            return []
        }
        var h = this,
            k = h.getStore();
        if (!k) {
            return []
        }
        var b = h.container,
            d = k.getGroups(),
            m = d.length,
            g = b.getViewItems(),
            c = [],
            l = b.footerClsShortCache,
            e, a, f, n, j;
        b.doRemoveHeaders();
        b.doRemoveFooterCls();
        if (g.length) {
            for (e = 0; e < m; e++) {
                a = d[e].children[0];
                f = k.indexOf(a);
                n = g[f];
                b.doAddHeader(n, k.getGroupString(a));
                if (e) {
                    Ext.fly(n.previousSibling).addCls(l)
                }
                c.push(f)
            }
            j = d[--e].children;
            Ext.fly(g[k.indexOf(j[j.length - 1])]).addCls(l)
        }
        return c
    },
    destroy: function () {
        Ext.destroy(this.getIndexBar(), this.indexBarElement, this.header);
        this.callParent()
    }
});
Ext.define("Ext.data.writer.Json", {
    extend: "Ext.data.writer.Writer",
    alternateClassName: "Ext.data.JsonWriter",
    alias: "writer.json",
    config: {
        root: undefined,
        encode: false,
        allowSingle: true,
        encodeRequest: false
    },
    applyRoot: function (a) {
        if (!a && (this.getEncode() || this.getEncodeRequest())) {
            a = "data"
        }
        return a
    },
    writeRecords: function (d, e) {
        var a = this.getRoot(),
            f = d.getParams(),
            b = this.getAllowSingle(),
            c;
        if (this.getAllowSingle() && e && e.length == 1) {
            e = e[0]
        }
        if (this.getEncodeRequest()) {
            c = d.getJsonData() || {};
            if (e && (e.length || (b && Ext.isObject(e)))) {
                c[a] = e
            }
            d.setJsonData(Ext.apply(c, f || {}));
            d.setParams(null);
            d.setMethod("POST");
            return d
        }
        if (!e || !(e.length || (b && Ext.isObject(e)))) {
            return d
        }
        if (this.getEncode()) {
            if (a) {
                f[a] = Ext.encode(e)
            } else {}
        } else {
            c = d.getJsonData() || {};
            if (a) {
                c[a] = e
            } else {
                c = e
            }
            d.setJsonData(c)
        }
        return d
    }
});
Ext.define("Ext.data.Connection", {
    mixins: {
        observable: "Ext.util.Observable"
    },
    statics: {
        requestId: 0
    },
    config: {
        url: null,
        async: true,
        method: null,
        username: "",
        password: "",
        disableCaching: true,
        disableCachingParam: "_dc",
        timeout: 30000,
        extraParams: null,
        defaultHeaders: null,
        useDefaultHeader: true,
        defaultPostHeader: "application/x-www-form-urlencoded; charset=UTF-8",
        useDefaultXhrHeader: true,
        defaultXhrHeader: "XMLHttpRequest",
        autoAbort: false
    },
    textAreaRe: /textarea/i,
    multiPartRe: /multipart\/form-data/i,
    lineBreakRe: /\r\n/g,
    constructor: function (a) {
        this.initConfig(a);
        this.requests = {}
    },
    request: function (k) {
        k = k || {};
        var f = this,
            j = k.scope || window,
            e = k.username || f.getUsername(),
            g = k.password || f.getPassword() || "",
            b, c, d, a, h;
        if (f.fireEvent("beforerequest", f, k) !== false) {
            c = f.setOptions(k, j);
            if (this.isFormUpload(k) === true) {
                this.upload(k.form, c.url, c.data, k);
                return null
            }
            if (k.autoAbort === true || f.getAutoAbort()) {
                f.abort()
            }
            h = this.getXhrInstance();
            b = k.async !== false ? (k.async || f.getAsync()) : false;
            if (e) {
                h.open(c.method, c.url, b, e, g)
            } else {
                h.open(c.method, c.url, b)
            }
            a = f.setupHeaders(h, k, c.data, c.params);
            d = {
                id: ++this.self.requestId,
                xhr: h,
                headers: a,
                options: k,
                async: b,
                timeout: setTimeout(function () {
                    d.timedout = true;
                    f.abort(d)
                }, k.timeout || f.getTimeout())
            };
            f.requests[d.id] = d;
            if (b) {
                h.onreadystatechange = Ext.Function.bind(f.onStateChange, f, [d])
            }
            h.send(c.data);
            if (!b) {
                return this.onComplete(d)
            }
            return d
        } else {
            Ext.callback(k.callback, k.scope, [k, undefined, undefined]);
            return null
        }
    },
    upload: function (e, c, j, l) {
        e = Ext.getDom(e);
        l = l || {};
        var d = Ext.id(),
            g = document.createElement("iframe"),
            k = [],
            h = "multipart/form-data",
            f = {
                target: e.target,
                method: e.method,
                encoding: e.encoding,
                enctype: e.enctype,
                action: e.action
            },
            b = function (m, n) {
                a = document.createElement("input");
                Ext.fly(a).set({
                    type: "hidden",
                    value: n,
                    name: m
                });
                e.appendChild(a);
                k.push(a)
            },
            a;
        Ext.fly(g).set({
            id: d,
            name: d,
            cls: Ext.baseCSSPrefix + "hide-display",
            src: Ext.SSL_SECURE_URL
        });
        document.body.appendChild(g);
        if (document.frames) {
            document.frames[d].name = d
        }
        Ext.fly(e).set({
            target: d,
            method: "POST",
            enctype: h,
            encoding: h,
            action: c || f.action
        });
        if (j) {
            Ext.iterate(Ext.Object.fromQueryString(j), function (m, n) {
                if (Ext.isArray(n)) {
                    Ext.each(n, function (o) {
                        b(m, o)
                    })
                } else {
                    b(m, n)
                }
            })
        }
        Ext.fly(g).on("load", Ext.Function.bind(this.onUploadComplete, this, [g, l]), null, {
            single: true
        });
        e.submit();
        Ext.fly(e).set(f);
        Ext.each(k, function (m) {
            Ext.removeNode(m)
        })
    },
    onUploadComplete: function (h, b) {
        var c = this,
            a = {
                responseText: "",
                responseXML: null
            },
            g, f;
        try {
            g = h.contentWindow.document || h.contentDocument || window.frames[id].document;
            if (g) {
                if (g.body) {
                    if (this.textAreaRe.test((f = g.body.firstChild || {}).tagName)) {
                        a.responseText = f.value
                    } else {
                        a.responseText = g.body.innerHTML
                    }
                }
                a.responseXML = g.XMLDocument || g
            }
        } catch (d) {}
        c.fireEvent("requestcomplete", c, a, b);
        Ext.callback(b.success, b.scope, [a, b]);
        Ext.callback(b.callback, b.scope, [b, true, a]);
        setTimeout(function () {
            Ext.removeNode(h)
        }, 100)
    },
    isFormUpload: function (a) {
        var b = this.getForm(a);
        if (b) {
            return (a.isUpload || (this.multiPartRe).test(b.getAttribute("enctype")))
        }
        return false
    },
    getForm: function (a) {
        return Ext.getDom(a.form) || null
    },
    setOptions: function (l, k) {
        var h = this,
            e = l.params || {},
            g = h.getExtraParams(),
            d = l.urlParams,
            c = l.url || h.getUrl(),
            j = l.jsonData,
            b, a, f;
        if (Ext.isFunction(e)) {
            e = e.call(k, l)
        }
        if (Ext.isFunction(c)) {
            c = c.call(k, l)
        }
        c = this.setupUrl(l, c);
        f = l.rawData || l.xmlData || j || null;
        if (j && !Ext.isPrimitive(j)) {
            f = Ext.encode(f)
        }
        if (Ext.isObject(e)) {
            e = Ext.Object.toQueryString(e)
        }
        if (Ext.isObject(g)) {
            g = Ext.Object.toQueryString(g)
        }
        e = e + ((g) ? ((e) ? "&" : "") + g : "");
        d = Ext.isObject(d) ? Ext.Object.toQueryString(d) : d;
        e = this.setupParams(l, e);
        b = (l.method || h.getMethod() || ((e || f) ? "POST" : "GET")).toUpperCase();
        this.setupMethod(l, b);
        a = l.disableCaching !== false ? (l.disableCaching || h.getDisableCaching()) : false;
        if (b === "GET" && a) {
            c = Ext.urlAppend(c, (l.disableCachingParam || h.getDisableCachingParam()) + "=" + (new Date().getTime()))
        }
        if ((b == "GET" || f) && e) {
            c = Ext.urlAppend(c, e);
            e = null
        }
        if (d) {
            c = Ext.urlAppend(c, d)
        }
        return {
            url: c,
            method: b,
            data: f || e || null
        }
    },
    setupUrl: function (b, a) {
        var c = this.getForm(b);
        if (c) {
            a = a || c.action
        }
        return a
    },
    setupParams: function (a, d) {
        var c = this.getForm(a),
            b;
        if (c && !this.isFormUpload(a)) {
            b = Ext.Element.serializeForm(c);
            d = d ? (d + "&" + b) : b
        }
        return d
    },
    setupMethod: function (a, b) {
        if (this.isFormUpload(a)) {
            return "POST"
        }
        return b
    },
    setupHeaders: function (m, n, d, c) {
        var h = this,
            b = Ext.apply({}, n.headers || {}, h.getDefaultHeaders() || {}),
            l = h.getDefaultPostHeader(),
            j = n.jsonData,
            a = n.xmlData,
            k, f;
        if (!b["Content-Type"] && (d || c)) {
            if (d) {
                if (n.rawData) {
                    l = "text/plain"
                } else {
                    if (a && Ext.isDefined(a)) {
                        l = "text/xml"
                    } else {
                        if (j && Ext.isDefined(j)) {
                            l = "application/json"
                        }
                    }
                }
            }
            b["Content-Type"] = l
        }
        if (h.getUseDefaultXhrHeader() && !b["X-Requested-With"]) {
            b["X-Requested-With"] = h.getDefaultXhrHeader()
        }
        try {
            for (k in b) {
                if (b.hasOwnProperty(k)) {
                    f = b[k];
                    m.setRequestHeader(k, f)
                }
            }
        } catch (g) {
            h.fireEvent("exception", k, f)
        }
        m.withCredentials = n.withCredentials;
        return b
    },
    getXhrInstance: (function () {
        var b = [function () {
            return new XMLHttpRequest()
        }, function () {
            return new ActiveXObject("MSXML2.XMLHTTP.3.0")
        }, function () {
            return new ActiveXObject("MSXML2.XMLHTTP")
        }, function () {
            return new ActiveXObject("Microsoft.XMLHTTP")
        }],
            c = 0,
            a = b.length,
            f;
        for (; c < a; ++c) {
            try {
                f = b[c];
                f();
                break
            } catch (d) {}
        }
        return f
    })(),
    isLoading: function (a) {
        if (!(a && a.xhr)) {
            return false
        }
        var b = a.xhr.readyState;
        return !(b === 0 || b == 4)
    },
    abort: function (b) {
        var a = this,
            d = a.requests,
            c;
        if (b && a.isLoading(b)) {
            b.xhr.onreadystatechange = null;
            b.xhr.abort();
            a.clearTimeout(b);
            if (!b.timedout) {
                b.aborted = true
            }
            a.onComplete(b);
            a.cleanup(b)
        } else {
            if (!b) {
                for (c in d) {
                    if (d.hasOwnProperty(c)) {
                        a.abort(d[c])
                    }
                }
            }
        }
    },
    onStateChange: function (a) {
        if (a.xhr.readyState == 4) {
            this.clearTimeout(a);
            this.onComplete(a);
            this.cleanup(a)
        }
    },
    clearTimeout: function (a) {
        clearTimeout(a.timeout);
        delete a.timeout
    },
    cleanup: function (a) {
        a.xhr = null;
        delete a.xhr
    },
    onComplete: function (f) {
        var d = this,
            c = f.options,
            a, h, b;
        try {
            a = d.parseStatus(f.xhr.status);
            if (f.timedout) {
                a.success = false
            }
        } catch (g) {
            a = {
                success: false,
                isException: false
            }
        }
        h = a.success;
        if (h) {
            b = d.createResponse(f);
            d.fireEvent("requestcomplete", d, b, c);
            Ext.callback(c.success, c.scope, [b, c])
        } else {
            if (a.isException || f.aborted || f.timedout) {
                b = d.createException(f)
            } else {
                b = d.createResponse(f)
            }
            d.fireEvent("requestexception", d, b, c);
            Ext.callback(c.failure, c.scope, [b, c])
        }
        Ext.callback(c.callback, c.scope, [c, h, b]);
        delete d.requests[f.id];
        return b
    },
    parseStatus: function (a) {
        a = a == 1223 ? 204 : a;
        var c = (a >= 200 && a < 300) || a == 304 || a == 0,
            b = false;
        if (!c) {
            switch (a) {
            case 12002:
            case 12029:
            case 12030:
            case 12031:
            case 12152:
            case 13030:
                b = true;
                break
            }
        }
        return {
            success: c,
            isException: b
        }
    },
    createResponse: function (c) {
        var g = c.xhr,
            a = {},
            h, d, j, e, f, b;
        if (c.timedout) {
            c.success = false;
            h = []
        } else {
            h = g.getAllResponseHeaders().replace(this.lineBreakRe, "\n").split("\n")
        }
        d = h.length;
        while (d--) {
            j = h[d];
            e = j.indexOf(":");
            if (e >= 0) {
                f = j.substr(0, e).toLowerCase();
                if (j.charAt(e + 1) == " ") {
                    ++e
                }
                a[f] = j.substr(e + 1)
            }
        }
        c.xhr = null;
        delete c.xhr;
        b = {
            request: c,
            requestId: c.id,
            status: g.status,
            statusText: g.statusText,
            getResponseHeader: function (k) {
                return a[k.toLowerCase()]
            },
            getAllResponseHeaders: function () {
                return a
            },
            responseText: g.responseText,
            responseXML: g.responseXML
        };
        g = null;
        return b
    },
    createException: function (a) {
        return {
            request: a,
            requestId: a.id,
            status: a.aborted ? -1 : 0,
            statusText: a.aborted ? "transaction aborted" : "communication failure",
            aborted: a.aborted,
            timedout: a.timedout
        }
    }
});
Ext.define("Ext.Ajax", {
    extend: "Ext.data.Connection",
    singleton: true,
    autoAbort: false
});
Ext.define("Ext.data.reader.Reader", {
    requires: ["Ext.data.ResultSet"],
    alternateClassName: ["Ext.data.Reader", "Ext.data.DataReader"],
    mixins: ["Ext.mixin.Observable"],
    isReader: true,
    config: {
        idProperty: undefined,
        clientIdProperty: "clientId",
        totalProperty: "total",
        successProperty: "success",
        messageProperty: null,
        rootProperty: "",
        implicitIncludes: true,
        model: undefined
    },
    constructor: function (a) {
        this.initConfig(a)
    },
    fieldCount: 0,
    applyModel: function (a) {
        if (typeof a == "string") {
            a = Ext.data.ModelManager.getModel(a);
            if (!a) {
                Ext.Logger.error("Model with name " + arguments[0] + " doesnt exist.")
            }
        }
        if (a && !a.prototype.isModel && Ext.isObject(a)) {
            a = Ext.data.ModelManager.registerType(a.storeId || a.id || Ext.id(), a)
        }
        return a
    },
    applyIdProperty: function (a) {
        if (!a && this.getModel()) {
            a = this.getModel().getIdProperty()
        }
        return a
    },
    updateModel: function (a) {
        if (a) {
            if (!this.getIdProperty()) {
                this.setIdProperty(a.getIdProperty())
            }
            this.buildExtractors()
        }
    },
    createAccessor: Ext.emptyFn,
    createFieldAccessExpression: function () {
        return "undefined"
    },
    buildExtractors: function () {
        if (!this.getModel()) {
            return
        }
        var b = this,
            c = b.getTotalProperty(),
            a = b.getSuccessProperty(),
            d = b.getMessageProperty();
        if (c) {
            b.getTotal = b.createAccessor(c)
        }
        if (a) {
            b.getSuccess = b.createAccessor(a)
        }
        if (d) {
            b.getMessage = b.createAccessor(d)
        }
        b.extractRecordData = b.buildRecordDataExtractor()
    },
    buildRecordDataExtractor: function () {
        var k = this,
            e = k.getModel(),
            g = e.getFields(),
            j = g.length,
            a = [],
            h = k.getModel().getClientIdProperty(),
            f = "__field",
            b = ["var me = this,\n", "    fields = me.getModel().getFields(),\n", "    idProperty = me.getIdProperty(),\n", '    idPropertyIsFn = (typeof idProperty == "function"),', "    value,\n", "    internalId"],
            d, l, c, m;
        g = g.items;
        for (d = 0; d < j; d++) {
            l = g[d];
            m = l.getName();
            if (m === e.getIdProperty()) {
                a[d] = "idField"
            } else {
                a[d] = f + d
            }
            b.push(",\n    ", a[d], ' = fields.get("', l.getName(), '")')
        }
        b.push(";\n\n    return function(source) {\n        var dest = {};\n");
        b.push("        if (idPropertyIsFn) {\n");
        b.push("            idField.setMapping(idProperty);\n");
        b.push("        }\n");
        for (d = 0; d < j; d++) {
            l = g[d];
            c = a[d];
            m = l.getName();
            if (m === e.getIdProperty()) {
                l.setMapping(this.getIdProperty())
            }
            b.push('        dest["' + l.getName() + '"]', " = ", k.createFieldAccessExpression(l, c, "source"), ";\n")
        }
        if (h) {
            b.push("        internalId = " + k.createFieldAccessExpression(Ext.create("Ext.data.Field", {
                name: h
            }), null, "source") + ";\n");
            b.push("        if (internalId !== undefined) {\n");
            b.push('            dest["_clientId"] = internalId;\n        }\n')
        }
        b.push("        return dest;\n");
        b.push("    };");
        return Ext.functionFactory(b.join("")).call(k)
    },
    getFields: function () {
        return this.getModel().getFields().items
    },
    getData: function (a) {
        return a
    },
    getResponseData: function (a) {
        return a
    },
    getRoot: function (a) {
        return a
    },
    read: function (c) {
        var g = c,
            h = this.getModel(),
            e, b, d, f, a;
        if (c) {
            g = this.getResponseData(c)
        }
        if (g) {
            e = this.readRecords(g);
            b = e.getRecords();
            for (d = 0, f = b.length; d < f; d++) {
                a = b[d];
                b[d] = new h(a.data, a.id, a.node)
            }
            return e
        } else {
            return this.nullResultSet
        }
    },
    process: function (a) {
        var b = a;
        if (a) {
            b = this.getResponseData(a)
        }
        if (b) {
            return this.readRecords(b)
        } else {
            return this.nullResultSet
        }
    },
    readRecords: function (c) {
        var d = this;
        d.rawData = c;
        c = d.getData(c);
        var f = Ext.isArray(c) ? c : d.getRoot(c),
            h = true,
            b = 0,
            e, g, a, j;
        if (d.getTotalProperty()) {
            g = parseInt(d.getTotal(c), 10);
            if (!isNaN(g)) {
                e = g
            }
        }
        if (d.getSuccessProperty()) {
            g = d.getSuccess(c);
            if (g === false || g === "false") {
                h = false
            }
        }
        if (d.getMessageProperty()) {
            j = d.getMessage(c)
        }
        if (f) {
            a = d.extractData(f);
            b = a.length
        } else {
            b = 0;
            a = []
        }
        return new Ext.data.ResultSet({
            total: e,
            count: b,
            records: a,
            success: h,
            message: j
        })
    },
    extractData: function (l) {
        var j = this,
            e = [],
            c = l.length,
            h = j.getModel(),
            m = h.getIdProperty(),
            k = h.getFields(),
            d, g, f, b, a;
        if (k.isDirty) {
            j.buildExtractors(true);
            delete k.isDirty
        }
        if (!l.length && Ext.isObject(l)) {
            l = [l];
            c = 1
        }
        for (g = 0; g < c; g++) {
            a = null;
            b = null;
            d = l[g];
            f = j.extractRecordData(d);
            if (f._clientId !== undefined) {
                a = f._clientId;
                delete f._clientId
            }
            if (f[m] !== undefined) {
                b = f[m]
            }
            if (j.getImplicitIncludes()) {
                j.readAssociated(f, d)
            }
            e.push({
                clientId: a,
                id: b,
                data: f,
                node: d
            })
        }
        return e
    },
    readAssociated: function (h, g) {
        var e = this.getModel().associations.items,
            d = 0,
            f = e.length,
            a, c, b;
        for (; d < f; d++) {
            a = e[d];
            b = a.getAssociationKey();
            c = this.getAssociatedDataRoot(g, b);
            if (c) {
                h[b] = c
            }
        }
    },
    getAssociatedDataRoot: function (b, a) {
        return b[a]
    }
}, function () {
    Ext.apply(this.prototype, {
        nullResultSet: new Ext.data.ResultSet({
            total: 0,
            count: 0,
            records: [],
            success: true
        })
    })
});
Ext.define("Ext.data.reader.Json", {
    extend: "Ext.data.reader.Reader",
    alternateClassName: "Ext.data.JsonReader",
    alias: "reader.json",
    config: {
        record: null,
        useSimpleAccessors: false
    },
    objectRe: /[\[\.]/,
    getResponseData: function (a) {
        var d = a;
        if (a && a.responseText) {
            d = a.responseText
        }
        if (typeof d !== "string") {
            return d
        }
        var c;
        try {
            c = Ext.decode(d)
        } catch (b) {
            this.fireEvent("exception", this, a, "Unable to parse the JSON returned by the server: " + b.toString());
            Ext.Logger.error("Unable to parse the JSON returned by the server: " + b.toString())
        }
        return c
    },
    buildExtractors: function () {
        var b = this,
            a = b.getRootProperty();
        b.callParent(arguments);
        if (a) {
            b.rootAccessor = b.createAccessor(a)
        } else {
            delete b.rootAccessor
        }
    },
    getRoot: function (b) {
        var a = this.getModel().getFields();
        if (a.isDirty) {
            this.buildExtractors(true);
            delete a.isDirty
        }
        if (this.rootAccessor) {
            return this.rootAccessor.call(this, b)
        } else {
            return b
        }
    },
    extractData: function (a) {
        var e = this.getRecord(),
            d = [],
            c, b;
        if (e) {
            c = a.length;
            if (!c && Ext.isObject(a)) {
                c = 1;
                a = [a]
            }
            for (b = 0; b < c; b++) {
                d[b] = a[b][e]
            }
        } else {
            d = a
        }
        return this.callParent([d])
    },
    createAccessor: function () {
        var a = /[\[\.]/;
        return function (c) {
            if (Ext.isEmpty(c)) {
                return Ext.emptyFn
            }
            if (Ext.isFunction(c)) {
                return c
            }
            if (this.getUseSimpleAccessors() !== true) {
                var b = String(c).search(a);
                if (b >= 0) {
                    return Ext.functionFactory("obj", "var value; try {value = obj" + (b > 0 ? "." : "") + c + "} catch(e) {}; return value;")
                }
            }
            return function (d) {
                return d[c]
            }
        }
    }(),
    createFieldAccessExpression: function (g, b, c) {
        var f = this,
            h = f.objectRe,
            e = (g.getMapping() !== null),
            a = e ? g.getMapping() : g.getName(),
            j, d;
        if (typeof a === "function") {
            j = b + ".getMapping()(" + c + ", this)"
        } else {
            if (f.getUseSimpleAccessors() === true || ((d = String(a).search(h)) < 0)) {
                if (!e || isNaN(a)) {
                    a = '"' + a + '"'
                }
                j = c + "[" + a + "]"
            } else {
                j = c + (d > 0 ? "." : "") + a
            }
        }
        return j
    }
});
Ext.define("Ext.data.proxy.Proxy", {
    extend: "Ext.Evented",
    alias: "proxy.proxy",
    alternateClassName: ["Ext.data.DataProxy", "Ext.data.Proxy"],
    requires: ["Ext.data.reader.Json", "Ext.data.writer.Json"],
    uses: ["Ext.data.Batch", "Ext.data.Operation", "Ext.data.Model"],
    config: {
        batchOrder: "create,update,destroy",
        batchActions: true,
        model: null,
        reader: {
            type: "json"
        },
        writer: {
            type: "json"
        }
    },
    isProxy: true,
    applyModel: function (a) {
        if (typeof a == "string") {
            a = Ext.data.ModelManager.getModel(a);
            if (!a) {
                Ext.Logger.error("Model with name " + arguments[0] + " doesnt exist.")
            }
        }
        if (a && !a.prototype.isModel && Ext.isObject(a)) {
            a = Ext.data.ModelManager.registerType(a.storeId || a.id || Ext.id(), a)
        }
        return a
    },
    updateModel: function (b) {
        if (b) {
            var a = this.getReader();
            if (a && !a.getModel()) {
                a.setModel(b)
            }
        }
    },
    applyReader: function (b, a) {
        return Ext.factory(b, Ext.data.Reader, a, "reader")
    },
    updateReader: function (a) {
        var b = this.getModel();
        if (!b) {
            b = a.getModel();
            if (b) {
                this.setModel(b)
            }
        } else {
            a.setModel(b)
        }
    },
    applyWriter: function (b, a) {
        return Ext.factory(b, Ext.data.Writer, a, "writer")
    },
    create: Ext.emptyFn,
    read: Ext.emptyFn,
    update: Ext.emptyFn,
    destroy: Ext.emptyFn,
    onDestroy: function () {
        Ext.destroy(this.getReader(), this.getWriter())
    },
    batch: function (e, f) {
        var g = this,
            d = g.getBatchActions(),
            c = this.getModel(),
            b, a;
        if (e.operations === undefined) {
            e = {
                operations: e,
                batch: {
                    listeners: f
                }
            }
        }
        if (e.batch) {
            if (e.batch.isBatch) {
                e.batch.setProxy(g)
            } else {
                e.batch.proxy = g
            }
        } else {
            e.batch = {
                proxy: g,
                listeners: e.listeners || {}
            }
        }
        if (!b) {
            b = new Ext.data.Batch(e.batch)
        }
        b.on("complete", Ext.bind(g.onBatchComplete, g, [e], 0));
        Ext.each(g.getBatchOrder().split(","), function (h) {
            a = e.operations[h];
            if (a) {
                if (d) {
                    b.add(new Ext.data.Operation({
                        action: h,
                        records: a,
                        model: c
                    }))
                } else {
                    Ext.each(a, function (j) {
                        b.add(new Ext.data.Operation({
                            action: h,
                            records: [j],
                            model: c
                        }))
                    })
                }
            }
        }, g);
        b.start();
        return b
    },
    onBatchComplete: function (a, b) {
        var c = a.scope || this;
        if (b.hasException) {
            if (Ext.isFunction(a.failure)) {
                Ext.callback(a.failure, c, [b, a])
            }
        } else {
            if (Ext.isFunction(a.success)) {
                Ext.callback(a.success, c, [b, a])
            }
        }
        if (Ext.isFunction(a.callback)) {
            Ext.callback(a.callback, c, [b, a])
        }
    }
}, function () {});
Ext.define("Ext.data.proxy.Client", {
    extend: "Ext.data.proxy.Proxy",
    alternateClassName: "Ext.proxy.ClientProxy",
    clear: function () {}
});
Ext.define("Ext.data.proxy.Memory", {
    extend: "Ext.data.proxy.Client",
    alias: "proxy.memory",
    alternateClassName: "Ext.data.MemoryProxy",
    isMemoryProxy: true,
    config: {
        data: []
    },
    finishOperation: function (b, f, d) {
        if (b) {
            var c = 0,
                e = b.getRecords(),
                a = e.length;
            for (c; c < a; c++) {
                e[c].commit()
            }
            b.setSuccessful();
            Ext.callback(f, d || this, [b])
        }
    },
    create: function () {
        this.finishOperation.apply(this, arguments)
    },
    update: function () {
        this.finishOperation.apply(this, arguments)
    },
    destroy: function () {
        this.finishOperation.apply(this, arguments)
    },
    read: function (b, e, c) {
        var d = this,
            a = d.getReader();
        if (b.process("read", a.process(d.getData())) === false) {
            this.fireEvent("exception", this, null, b)
        }
        Ext.callback(e, c || d, [b])
    },
    clear: Ext.emptyFn
});
Ext.define("Ext.data.proxy.Server", {
    extend: "Ext.data.proxy.Proxy",
    alias: "proxy.server",
    alternateClassName: "Ext.data.ServerProxy",
    requires: ["Ext.data.Request"],
    config: {
        url: null,
        pageParam: "page",
        startParam: "start",
        limitParam: "limit",
        groupParam: "group",
        sortParam: "sort",
        filterParam: "filter",
        directionParam: "dir",
        enablePagingParams: true,
        simpleSortMode: false,
        noCache: true,
        cacheString: "_dc",
        timeout: 30000,
        api: {
            create: undefined,
            read: undefined,
            update: undefined,
            destroy: undefined
        },
        extraParams: {}
    },
    constructor: function (a) {
        a = a || {};
        if (a.nocache !== undefined) {
            a.noCache = a.nocache
        }
        this.callParent([a])
    },
    create: function () {
        return this.doRequest.apply(this, arguments)
    },
    read: function () {
        return this.doRequest.apply(this, arguments)
    },
    update: function () {
        return this.doRequest.apply(this, arguments)
    },
    destroy: function () {
        return this.doRequest.apply(this, arguments)
    },
    setExtraParam: function (a, b) {
        this.getExtraParams()[a] = b
    },
    buildRequest: function (a) {
        var c = this,
            d = Ext.applyIf(a.getParams() || {}, c.getExtraParams() || {}),
            b;
        d = Ext.applyIf(d, c.getParams(a));
        b = Ext.create("Ext.data.Request", {
            params: d,
            action: a.getAction(),
            records: a.getRecords(),
            url: a.getUrl(),
            operation: a,
            proxy: c
        });
        b.setUrl(c.buildUrl(b));
        a.setRequest(b);
        return b
    },
    processResponse: function (l, b, d, c, k, m) {
        var h = this,
            a = b.getAction(),
            f, j;
        if (l === true) {
            f = h.getReader();
            try {
                j = f.process(c)
            } catch (g) {
                b.setException(b, {
                    status: null,
                    statusText: g.message
                });
                h.fireEvent("exception", this, c, b);
                return
            }
            if (b.process(a, j, d, c) === false) {
                this.fireEvent("exception", this, c, b)
            }
        } else {
            h.setException(b, c);
            h.fireEvent("exception", this, c, b)
        }
        if (typeof k == "function") {
            k.call(m || h, b)
        }
        h.afterRequest(d, l)
    },
    setException: function (b, a) {
        b.setException({
            status: a.status,
            statusText: a.statusText
        })
    },
    applyEncoding: function (a) {
        return Ext.encode(a)
    },
    encodeSorters: function (d) {
        var b = [],
            c = d.length,
            a = 0;
        for (; a < c; a++) {
            b[a] = {
                property: d[a].getProperty(),
                direction: d[a].getDirection()
            }
        }
        return this.applyEncoding(b)
    },
    encodeFilters: function (d) {
        var b = [],
            c = d.length,
            a = 0;
        for (; a < c; a++) {
            b[a] = {
                property: d[a].getProperty(),
                value: d[a].getValue()
            }
        }
        return this.applyEncoding(b)
    },
    getParams: function (j) {
        var o = this,
            h = {},
            a = j.getGrouper(),
            n = j.getSorters(),
            f = j.getFilters(),
            m = j.getPage(),
            d = j.getStart(),
            g = j.getLimit(),
            p = o.getSimpleSortMode(),
            r = o.getPageParam(),
            l = o.getStartParam(),
            q = o.getLimitParam(),
            k = o.getGroupParam(),
            e = o.getSortParam(),
            c = o.getFilterParam(),
            b = o.getDirectionParam();
        if (o.getEnablePagingParams()) {
            if (r && m !== null) {
                h[r] = m
            }
            if (l && d !== null) {
                h[l] = d
            }
            if (q && g !== null) {
                h[q] = g
            }
        }
        if (k && a) {
            h[k] = o.encodeSorters([a])
        }
        if (e && n && n.length > 0) {
            if (p) {
                h[e] = n[0].getProperty();
                h[b] = n[0].getDirection()
            } else {
                h[e] = o.encodeSorters(n)
            }
        }
        if (c && f && f.length > 0) {
            h[c] = o.encodeFilters(f)
        }
        return h
    },
    buildUrl: function (c) {
        var b = this,
            a = b.getUrl(c);
        if (b.getNoCache()) {
            a = Ext.urlAppend(a, Ext.String.format("{0}={1}", b.getCacheString(), Ext.Date.now()))
        }
        return a
    },
    getUrl: function (a) {
        return a ? a.getUrl() || this.getApi()[a.getAction()] || this._url : this._url
    },
    doRequest: function (a, c, b) {},
    afterRequest: Ext.emptyFn
});
Ext.define("Ext.data.proxy.Ajax", {
    extend: "Ext.data.proxy.Server",
    requires: ["Ext.util.MixedCollection", "Ext.Ajax"],
    alias: "proxy.ajax",
    alternateClassName: ["Ext.data.HttpProxy", "Ext.data.AjaxProxy"],
    config: {
        actionMethods: {
            create: "POST",
            read: "GET",
            update: "POST",
            destroy: "POST"
        },
        headers: {}
    },
    doRequest: function (a, e, b) {
        var d = this.getWriter(),
            c = this.buildRequest(a);
        c.setConfig({
            headers: this.getHeaders(),
            timeout: this.getTimeout(),
            method: this.getMethod(c),
            callback: this.createRequestCallback(c, a, e, b),
            scope: this
        });
        c = d.write(c);
        Ext.Ajax.request(c.getCurrentConfig());
        return c
    },
    getMethod: function (a) {
        return this.getActionMethods()[a.getAction()]
    },
    createRequestCallback: function (d, a, e, b) {
        var c = this;
        return function (g, h, f) {
            c.processResponse(h, a, d, f, e, b)
        }
    }
});
Ext.define("Ext.data.Model", {
    alternateClassName: "Ext.data.Record",
    mixins: {
        observable: "Ext.mixin.Observable"
    },
    isModel: true,
    requires: ["Ext.util.Collection", "Ext.data.Field", "Ext.data.identifier.Simple", "Ext.data.ModelManager", "Ext.data.proxy.Ajax", "Ext.data.association.HasMany", "Ext.data.association.BelongsTo", "Ext.data.association.HasOne", "Ext.data.Errors"],
    config: {
        idProperty: "id",
        data: null,
        fields: undefined,
        validations: null,
        associations: null,
        hasMany: null,
        hasOne: null,
        belongsTo: null,
        proxy: null,
        identifier: {
            type: "simple"
        },
        clientIdProperty: "clientId",
        isErased: false
    },
    staticConfigs: ["idProperty", "fields", "validations", "associations", "hasMany", "hasOne", "belongsTo", "clientIdProperty", "identifier", "proxy"],
    statics: {
        EDIT: "edit",
        REJECT: "reject",
        COMMIT: "commit",
        generateProxyMethod: function (a) {
            return function () {
                var b = this.prototype;
                return b[a].apply(b, arguments)
            }
        },
        generateCacheId: function (b, c) {
            var a;
            if (b && b.isModel) {
                a = b.modelName;
                if (c === undefined) {
                    c = b.getId()
                }
            } else {
                a = b
            }
            return a.replace(/\./g, "-").toLowerCase() + "-" + c
        }
    },
    inheritableStatics: {
        load: function (a, b, h) {
            var f = this.getProxy(),
                j = this.getIdProperty(),
                e = null,
                d = {},
                g, c;
            h = h || (b && b.scope) || this;
            if (Ext.isFunction(b)) {
                b = {
                    callback: b,
                    scope: h
                }
            }
            d[j] = a;
            b = Ext.apply({}, b);
            b = Ext.applyIf(b, {
                action: "read",
                params: d,
                model: this
            });
            c = Ext.create("Ext.data.Operation", b);
            if (!f) {
                Ext.Logger.error("You are trying to load a model that doesn't have a Proxy specified")
            }
            g = function (k) {
                if (k.wasSuccessful()) {
                    e = k.getRecords()[0];
                    Ext.callback(b.success, h, [e, k])
                } else {
                    Ext.callback(b.failure, h, [e, k])
                }
                Ext.callback(b.callback, h, [e, k])
            };
            f.read(c, g, this)
        }
    },
    editing: false,
    dirty: false,
    phantom: false,
    constructor: function (e, g, b, f) {
        var d = this,
            c = null,
            a = this.getIdProperty();
        d.modified = {};
        d.raw = b || e || {};
        d.stores = [];
        e = e || f || {};
        if (g || g === 0) {
            e[a] = d.internalId = g
        }
        g = d.data[a];
        if (g || g === 0) {
            c = Ext.data.Model.cache.get(Ext.data.Model.generateCacheId(this, g));
            if (c) {
                return c.mergeData(f || e || {})
            }
        }
        if (f) {
            d.setConvertedData(e)
        } else {
            d.setData(e)
        }
        g = d.data[a];
        if (!g && g !== 0) {
            d.data[a] = d.internalId = d.id = d.getIdentifier().generate(d);
            d.phantom = true;
            if (this.associations.length) {
                this.handleInlineAssociationData(e)
            }
        } else {
            d.id = d.getIdentifier().generate(d)
        }
        Ext.data.Model.cache.add(d);
        if (this.init && typeof this.init == "function") {
            this.init()
        }
    },
    mergeData: function (a) {
        var g = this,
            d = g.getFields().items,
            e = d.length,
            b = g.data,
            c, h, k, j, f;
        for (c = 0; c < e; c++) {
            h = d[c];
            k = h.getName();
            f = h.getConvert();
            j = a[k];
            if (j !== undefined && !g.isModified(k)) {
                if (f) {
                    j = f.call(h, j, g)
                }
                b[k] = j
            }
        }
        return this
    },
    setData: function (a) {
        var g = this.fields.items,
            h = g.length,
            f = Ext.isArray(a),
            d = this._data = this.data = {},
            e, k, b, l, j, c;
        if (!a) {
            return this
        }
        for (e = 0; e < h; e++) {
            k = g[e];
            b = k.getName();
            j = k.getConvert();
            if (f) {
                l = a[e]
            } else {
                l = a[b];
                if (typeof l == "undefined") {
                    l = k.getDefaultValue()
                }
            }
            if (j) {
                l = j.call(k, l, this)
            }
            d[b] = l
        }
        c = this.getId();
        if (this.associations.length && (c || c === 0)) {
            this.handleInlineAssociationData(a)
        }
        return this
    },
    handleInlineAssociationData: function (f) {
        var e = this.associations.items,
            k = e.length,
            a = this.raw,
            g, d, c, h, j, b;
        for (g = 0; g < k; g++) {
            d = e[g];
            b = d.getAssociationKey();
            c = f[b];
            if (!c) {
                c = a[b]
            }
            if (c) {
                h = d.getReader();
                if (!h) {
                    j = d.getAssociatedModel().getProxy();
                    if (j) {
                        h = j.getReader()
                    } else {
                        h = new Ext.data.JsonReader({
                            model: d.getAssociatedModel()
                        });
                        if (!Ext.isArray(c)) {
                            c = [c]
                        }
                    }
                }
                d.read(this, h, c)
            }
        }
    },
    setId: function (b) {
        var a = this.getId();
        this.set(this.getIdProperty(), b);
        this.internalId = b;
        Ext.data.Model.cache.replace(a, this)
    },
    getId: function () {
        return this.get(this.getIdProperty())
    },
    setConvertedData: function (a) {
        this._data = this.data = a;
        return this
    },
    get: function (a) {
        return this.data[a]
    },
    set: function (p, l) {
        var j = this,
            b = j.fields.map,
            o = j.modified,
            a = !j.editing,
            c = j.associations.items,
            f = 0,
            d = [],
            k, n, e, m, g, h;
        if (arguments.length == 1) {
            for (n in p) {
                if (p.hasOwnProperty(n)) {
                    k = b[n];
                    if (k && k.hasCustomConvert()) {
                        d.push(n);
                        continue
                    }
                    if (!f && a) {
                        j.beginEdit()
                    }++f;
                    j.set(n, p[n])
                }
            }
            g = d.length;
            if (g) {
                if (!f && a) {
                    j.beginEdit()
                }
                f += g;
                for (e = 0; e < g; e++) {
                    k = d[e];
                    j.set(k, p[k])
                }
            }
            if (a && f) {
                j.endEdit(false, d)
            }
        } else {
            k = b[p];
            h = k && k.getConvert();
            if (h) {
                l = h.call(k, l, j)
            }
            m = j.data[p];
            j.data[p] = l;
            if (k && !j.isEqual(m, l)) {
                if (o.hasOwnProperty(p)) {
                    if (j.isEqual(o[p], l)) {
                        delete o[p];
                        j.dirty = false;
                        for (n in o) {
                            if (o.hasOwnProperty(n)) {
                                j.dirty = true;
                                break
                            }
                        }
                    }
                } else {
                    j.dirty = true;
                    o[p] = m
                }
            }
            if (a) {
                j.afterEdit([p], o)
            }
        }
    },
    isEqual: function (d, c) {
        if (Ext.isDate(d) && Ext.isDate(c)) {
            return d.getTime() === c.getTime()
        }
        return d === c
    },
    beginEdit: function () {
        var a = this;
        if (!a.editing) {
            a.editing = true;
            a.dirtySave = a.dirty;
            a.dataSave = Ext.apply({}, a.data);
            a.modifiedSave = Ext.apply({}, a.modified)
        }
    },
    cancelEdit: function () {
        var a = this;
        if (a.editing) {
            a.editing = false;
            a.modified = a.modifiedSave;
            a.data = a.dataSave;
            a.dirty = a.dirtySave;
            delete a.modifiedSave;
            delete a.dataSave;
            delete a.dirtySave
        }
    },
    endEdit: function (a, c) {
        var b = this;
        if (b.editing) {
            b.editing = false;
            if (a !== true && (b.changedWhileEditing())) {
                b.afterEdit(c || Ext.Object.getKeys(this.modified), this.modified)
            }
            delete b.modifiedSave;
            delete b.dataSave;
            delete b.dirtySave
        }
    },
    changedWhileEditing: function () {
        var c = this,
            b = c.dataSave,
            d = c.data,
            a;
        for (a in d) {
            if (d.hasOwnProperty(a)) {
                if (!c.isEqual(d[a], b[a])) {
                    return true
                }
            }
        }
        return false
    },
    getChanges: function () {
        var a = this.modified,
            b = {},
            c;
        for (c in a) {
            if (a.hasOwnProperty(c)) {
                b[c] = this.get(c)
            }
        }
        return b
    },
    isModified: function (a) {
        return this.modified.hasOwnProperty(a)
    },
    save: function (b, d) {
        var e = this,
            f = e.phantom ? "create" : "update",
            c = e.getProxy(),
            a, g;
        if (!c) {
            Ext.Logger.error("You are trying to save a model instance that doesn't have a Proxy specified")
        }
        b = b || {};
        d = d || e;
        if (Ext.isFunction(b)) {
            b = {
                callback: b,
                scope: d
            }
        }
        Ext.applyIf(b, {
            records: [e],
            action: f,
            model: e.self
        });
        a = Ext.create("Ext.data.Operation", b);
        g = function (h) {
            if (h.wasSuccessful()) {
                Ext.callback(b.success, d, [e, h])
            } else {
                Ext.callback(b.failure, d, [e, h])
            }
            Ext.callback(b.callback, d, [e, h])
        };
        c[f](a, g, e);
        return e
    },
    erase: function (b, d) {
        var e = this,
            c = this.getProxy(),
            a, f;
        if (!c) {
            Ext.Logger.error("You are trying to erase a model instance that doesn't have a Proxy specified")
        }
        b = b || {};
        d = d || e;
        if (Ext.isFunction(b)) {
            b = {
                callback: b,
                scope: d
            }
        }
        Ext.applyIf(b, {
            records: [e],
            action: "destroy",
            model: this.self
        });
        a = Ext.create("Ext.data.Operation", b);
        f = function (g) {
            if (g.wasSuccessful()) {
                Ext.callback(b.success, d, [e, g])
            } else {
                Ext.callback(b.failure, d, [e, g])
            }
            Ext.callback(b.callback, d, [e, g])
        };
        c.destroy(a, f, e);
        return e
    },
    reject: function (a) {
        var c = this,
            b = c.modified,
            d;
        for (d in b) {
            if (b.hasOwnProperty(d)) {
                if (typeof b[d] != "function") {
                    c.data[d] = b[d]
                }
            }
        }
        c.dirty = false;
        c.editing = false;
        c.modified = {};
        if (a !== true) {
            c.afterReject()
        }
    },
    commit: function (a) {
        var c = this,
            b = this.modified;
        c.phantom = c.dirty = c.editing = false;
        c.modified = {};
        if (a !== true) {
            c.afterCommit(b)
        }
    },
    afterEdit: function (b, a) {
        this.notifyStores("afterEdit", b, a)
    },
    afterReject: function () {
        this.notifyStores("afterReject")
    },
    afterCommit: function (a) {
        this.notifyStores("afterCommit", a)
    },
    notifyStores: function (e) {
        var c = Ext.Array.clone(arguments),
            a = this.stores,
            f = a.length,
            d, b;
        c[0] = this;
        for (d = 0; d < f; ++d) {
            b = a[d];
            if (b !== undefined && typeof b[e] == "function") {
                b[e].apply(b, c)
            }
        }
    },
    copy: function (c) {
        var d = this,
            b = d.getIdProperty(),
            a = Ext.apply({}, d.raw),
            e = Ext.apply({}, d.data);
        delete a[b];
        delete e[b];
        return new d.self(null, c, a, e)
    },
    getData: function (a) {
        var b = this.data;
        if (a === true) {
            Ext.apply(b, this.getAssociatedData())
        }
        return b
    },
    getAssociatedData: function () {
        return this.prepareAssociatedData(this, [], null)
    },
    prepareAssociatedData: function (o, a, n) {
        var h = o.associations.items,
            l = h.length,
            e = {},
            f, s, g, q, r, d, c, m, k, p, b;
        for (m = 0; m < l; m++) {
            d = h[m];
            s = d.getName();
            p = d.getType();
            b = true;
            if (n) {
                b = p == n
            }
            if (b && p == "hasMany") {
                f = o[d.getStoreName()];
                e[s] = [];
                if (f && f.getCount() > 0) {
                    g = f.data.items;
                    r = g.length;
                    for (k = 0; k < r; k++) {
                        q = g[k];
                        c = q.id;
                        if (Ext.Array.indexOf(a, c) == -1) {
                            a.push(c);
                            e[s][k] = q.getData();
                            Ext.apply(e[s][k], this.prepareAssociatedData(q, a, p))
                        }
                    }
                }
            } else {
                if (b && (p == "belongsTo" || p == "hasOne")) {
                    q = o[d.getInstanceName()];
                    if (q !== undefined) {
                        c = q.id;
                        if (Ext.Array.indexOf(a, c) === -1) {
                            a.push(c);
                            e[s] = q.getData();
                            Ext.apply(e[s], this.prepareAssociatedData(q, a, p))
                        }
                    }
                }
            }
        }
        return e
    },
    join: function (a) {
        Ext.Array.include(this.stores, a)
    },
    unjoin: function (a) {
        Ext.Array.remove(this.stores, a)
    },
    setDirty: function () {
        var b = this,
            a;
        b.dirty = true;
        b.fields.each(function (c) {
            if (c.getPersist()) {
                a = c.getName();
                b.modified[a] = b.get(a)
            }
        })
    },
    validate: function () {
        var j = Ext.create("Ext.data.Errors"),
            c = this.getValidations().items,
            e = Ext.data.Validations,
            b, d, h, a, g, f;
        if (c) {
            b = c.length;
            for (f = 0; f < b; f++) {
                d = c[f];
                h = d.field || d.name;
                g = d.type;
                a = e[g](d, this.get(h));
                if (!a) {
                    j.add(Ext.create("Ext.data.Error", {
                        field: h,
                        message: d.message || e.getMessage(g)
                    }))
                }
            }
        }
        return j
    },
    isValid: function () {
        return this.validate().isValid()
    },
    toUrl: function () {
        var b = this.$className.split("."),
            a = b[b.length - 1].toLowerCase();
        return a + "/" + this.getId()
    },
    destroy: function () {
        var a = this;
        a.notifyStores("afterErase", a);
        Ext.data.Model.cache.remove(a);
        a.data = a._data = a.raw = a.stores = a.modified = null;
        a.callParent(arguments)
    },
    applyProxy: function (b, a) {
        return Ext.factory(b, Ext.data.Proxy, a, "proxy")
    },
    updateProxy: function (a) {
        if (a) {
            a.setModel(this.self)
        }
    },
    applyAssociations: function (a) {
        if (a) {
            this.addAssociations(a, "hasMany")
        }
    },
    applyBelongsTo: function (a) {
        if (a) {
            this.addAssociations(a, "belongsTo")
        }
    },
    applyHasMany: function (a) {
        if (a) {
            this.addAssociations(a, "hasMany")
        }
    },
    applyHasOne: function (a) {
        if (a) {
            this.addAssociations(a, "hasOne")
        }
    },
    addAssociations: function (e, h) {
        var f, d, b, c = this.self.modelName,
            g = this.self.associations,
            a;
        e = Ext.Array.from(e);
        for (d = 0, f = e.length; d < f; d++) {
            b = e[d];
            if (!Ext.isObject(b)) {
                b = {
                    model: b
                }
            }
            Ext.applyIf(b, {
                type: h,
                ownerModel: c,
                associatedModel: b.model
            });
            delete b.model;
            a = Ext.Function.bind(function (j) {
                g.add(Ext.data.association.Association.create(this))
            }, b);
            Ext.ClassManager.onCreated(a, this, (typeof b.associatedModel === "string") ? b.associatedModel : Ext.getClassName(b.associatedModel))
        }
    },
    applyValidations: function (a) {
        if (a) {
            if (!Ext.isArray(a)) {
                a = [a]
            }
            this.addValidations(a)
        }
    },
    addValidations: function (a) {
        this.self.validations.addAll(a)
    },
    applyFields: function (a) {
        var b = this.superclass.fields;
        if (b) {
            a = b.items.concat(a || [])
        }
        return a || []
    },
    updateFields: function (c) {
        var d = c.length,
            e = this,
            h = e.self.prototype,
            j = this.getIdProperty(),
            a, f, g, b;
        f = e._fields = e.fields = new Ext.util.Collection(h.getFieldName);
        for (b = 0; b < d; b++) {
            g = c[b];
            if (!g.isField) {
                g = new Ext.data.Field(c[b])
            }
            f.add(g)
        }
        a = f.get(j);
        if (!a) {
            f.add(new Ext.data.Field(j))
        } else {
            a.setType("auto")
        }
        f.addSorter(h.sortConvertFields)
    },
    applyIdentifier: function (a) {
        if (typeof a === "string") {
            a = {
                type: a
            }
        }
        return Ext.factory(a, Ext.data.identifier.Simple, this.getIdentifier(), "data.identifier")
    },
    getFieldName: function (a) {
        return a.getName()
    },
    sortConvertFields: function (a, d) {
        var c = a.hasCustomConvert(),
            b = d.hasCustomConvert();
        if (c && !b) {
            return 1
        }
        if (!c && b) {
            return -1
        }
        return 0
    },
    onClassExtended: function (l, d, k) {
        var f = k.onBeforeCreated,
            b = this,
            h = b.prototype,
            e = Ext.Class.configNameCache,
            g = h.staticConfigs.concat(d.staticConfigs || []),
            c = h.config,
            a = d.config || {},
            j;
        d.config = a;
        k.onBeforeCreated = function (B, u) {
            var w = [],
                y = B.prototype,
                x = {},
                n = y.config,
                o = g.length,
                r = ["set", "get"],
                t = r.length,
                p = n.associations || [],
                m = Ext.getClassName(B),
                A, z, s, q, v;
            for (s = 0; s < o; s++) {
                A = g[s];
                for (q = 0; q < t; q++) {
                    z = e[A][r[q]];
                    if (z in y) {
                        x[z] = b.generateProxyMethod(z)
                    }
                }
            }
            B.addStatics(x);
            B.modelName = m;
            y.modelName = m;
            if (n.belongsTo) {
                w.push("association.belongsto")
            }
            if (n.hasMany) {
                w.push("association.hasmany")
            }
            if (n.hasOne) {
                w.push("association.hasone")
            }
            for (s = 0, v = p.length; s < v; ++s) {
                w.push("association." + p[s].type.toLowerCase())
            }
            if (n.proxy) {
                if (typeof n.proxy === "string") {
                    w.push("proxy." + n.proxy)
                } else {
                    if (typeof n.proxy.type === "string") {
                        w.push("proxy." + n.proxy.type)
                    }
                }
            }
            if (n.validations) {
                w.push("Ext.data.Validations")
            }
            Ext.require(w, function () {
                Ext.Function.interceptBefore(k, "onCreated", function () {
                    Ext.data.ModelManager.registerType(m, B);
                    var C = B.prototype.superclass;
                    B.prototype.associations = B.associations = B.prototype._associations = (C && C.associations) ? C.associations.clone() : new Ext.util.Collection(function (D) {
                        return D.getName()
                    });
                    B.prototype.validations = B.validations = B.prototype._validations = (C && C.validations) ? C.validations.clone() : new Ext.util.Collection(function (D) {
                        return D.field || D.name
                    });
                    B.prototype = Ext.Object.chain(B.prototype);
                    B.prototype.initConfig.call(B.prototype, n);
                    delete B.prototype.initConfig
                });
                f.call(b, B, u, k)
            })
        }
    }
}, function () {
    this.cache = new Ext.util.Collection(this.generateCacheId)
});
Ext.define("Ext.data.Store", {
    alias: "store.store",
    extend: "Ext.Evented",
    requires: ["Ext.util.Collection", "Ext.data.Operation", "Ext.data.proxy.Memory", "Ext.data.Model", "Ext.data.StoreManager", "Ext.util.Grouper"],
    statics: {
        create: function (a) {
            if (!a.isStore) {
                if (!a.type) {
                    a.type = "store"
                }
                a = Ext.createByAlias("store." + a.type, a)
            }
            return a
        }
    },
    isStore: true,
    config: {
        storeId: undefined,
        data: null,
        autoLoad: null,
        autoSync: false,
        model: undefined,
        proxy: undefined,
        fields: null,
        remoteSort: false,
        remoteFilter: false,
        remoteGroup: false,
        filters: null,
        sorters: null,
        grouper: null,
        groupField: null,
        groupDir: null,
        getGroupString: null,
        pageSize: 25,
        totalCount: null,
        clearOnPageLoad: true,
        modelDefaults: {},
        autoDestroy: false,
        syncRemovedRecords: true
    },
    currentPage: 1,
    constructor: function (a) {
        a = a || {};
        this.data = this._data = this.createDataCollection();
        this.data.setSortRoot("data");
        this.data.setFilterRoot("data");
        this.removed = [];
        if (a.id && !a.storeId) {
            a.storeId = a.id;
            delete a.id
        }
        this.initConfig(a)
    },
    createDataCollection: function () {
        return new Ext.util.Collection(function (a) {
            return a.getId()
        })
    },
    applyStoreId: function (a) {
        if (a === undefined || a === null) {
            a = this.getUniqueId()
        }
        return a
    },
    updateStoreId: function (a, b) {
        if (b) {
            Ext.data.StoreManager.unregister(this)
        }
        if (a) {
            Ext.data.StoreManager.register(this)
        }
    },
    applyModel: function (b) {
        if (typeof b == "string") {
            var d = Ext.data.ModelManager.getModel(b);
            if (!d) {
                Ext.Logger.error('Model with name "' + b + '" does not exist.')
            }
            b = d
        }
        if (b && !b.prototype.isModel && Ext.isObject(b)) {
            b = Ext.data.ModelManager.registerType(b.storeId || b.id || Ext.id(), b)
        }
        if (!b) {
            var a = this.getFields(),
                c = this.config.data;
            if (!a && c && c.length) {
                a = Ext.Object.getKeys(c[0])
            }
            if (a) {
                b = Ext.define("Ext.data.Store.ImplicitModel-" + (this.getStoreId() || Ext.id()), {
                    extend: "Ext.data.Model",
                    config: {
                        fields: a,
                        proxy: this.getProxy()
                    }
                });
                this.implicitModel = true
            }
        }
        if (!b && this.getProxy()) {
            b = this.getProxy().getModel()
        }
        return b
    },
    updateModel: function (a) {
        var b = this.getProxy();
        if (b && !b.getModel()) {
            b.setModel(a)
        }
    },
    applyProxy: function (b, a) {
        b = Ext.factory(b, Ext.data.Proxy, a, "proxy");
        if (!b && this.getModel()) {
            b = this.getModel().getProxy();
            if (!b) {
                b = new Ext.data.proxy.Memory({
                    model: this.getModel()
                })
            }
        }
        return b
    },
    updateProxy: function (a) {
        if (a && !a.getModel()) {
            a.setModel(this.getModel())
        }
    },
    applyData: function (b) {
        if (b) {
            var a = this.getProxy();
            if (a instanceof Ext.data.proxy.Memory) {
                a.setData(b);
                this.load()
            } else {
                this.removeAll(true);
                this.fireEvent("clear", this);
                this.suspendEvents();
                this.add(b);
                this.resumeEvents();
                this.dataLoaded = true
            }
        } else {
            this.removeAll(true);
            this.fireEvent("clear", this)
        }
        this.fireEvent("refresh", this, this.data)
    },
    clearData: function () {
        this.setData(null)
    },
    addData: function (d) {
        var a = this.getProxy().getReader(),
            c = a.read(d),
            b = c.getRecords();
        this.add(b)
    },
    updateAutoLoad: function (a) {
        var b = this.getProxy();
        if (a && (b && !b.isMemoryProxy)) {
            this.load(Ext.isObject(a) ? a : null)
        }
    },
    isAutoLoading: function () {
        var a = this.getProxy();
        return (this.getAutoLoad() || (a && a.isMemoryProxy) || this.dataLoaded)
    },
    updateGroupField: function (a) {
        var b = this.getGrouper();
        if (a) {
            if (!b) {
                this.setGrouper({
                    property: a,
                    direction: this.getGroupDir() || "ASC"
                })
            } else {
                b.setProperty(a)
            }
        } else {
            if (b) {
                this.setGrouper(null)
            }
        }
    },
    updateGroupDir: function (a) {
        var b = this.getGrouper();
        if (b) {
            b.setDirection(a)
        }
    },
    applyGetGroupString: function (b) {
        var a = this.getGrouper();
        if (b) {
            if (a) {
                a.setGroupFn(b)
            } else {
                this.setGrouper({
                    groupFn: b
                })
            }
        } else {
            if (a) {
                this.setGrouper(null)
            }
        }
    },
    applyGrouper: function (a) {
        if (typeof a == "string") {
            a = {
                property: a
            }
        } else {
            if (typeof a == "function") {
                a = {
                    groupFn: a
                }
            }
        }
        a = Ext.factory(a, Ext.util.Grouper, this.getGrouper());
        return a
    },
    updateGrouper: function (b, a) {
        var c = this.data;
        if (a) {
            c.removeSorter(a);
            if (!b) {
                c.getSorters().removeSorter("isGrouper")
            }
        }
        if (b) {
            c.insertSorter(0, b);
            if (!a) {
                c.getSorters().addSorter({
                    direction: "DESC",
                    property: "isGrouper",
                    transform: function (d) {
                        return (d === true) ? 1 : -1
                    }
                })
            }
        }
    },
    isGrouped: function () {
        return !!this.getGrouped()
    },
    updateSorters: function (d) {
        var b = this.getGrouper(),
            c = this.data,
            a = c.getAutoSort();
        c.setAutoSort(false);
        c.setSorters(d);
        if (b) {
            c.insertSorter(0, b)
        }
        this.updateSortTypes();
        c.setAutoSort(a)
    },
    updateSortTypes: function () {
        var b = this.getModel(),
            a = b && b.getFields(),
            c = this.data;
        if (a) {
            c.getSorters().each(function (f) {
                var d = f.getProperty(),
                    e;
                if (!f.isGrouper && d && !f.getTransform()) {
                    e = a.get(d);
                    if (e) {
                        f.setTransform(e.getSortType())
                    }
                }
            })
        }
    },
    updateFilters: function (a) {
        this.data.setFilters(a)
    },
    add: function (a) {
        if (!Ext.isArray(a)) {
            a = Array.prototype.slice.apply(arguments)
        }
        return this.insert(this.data.length, a)
    },
    insert: function (e, b) {
        if (!Ext.isArray(b)) {
            b = Array.prototype.slice.call(arguments, 1)
        }
        var h = this,
            k = false,
            f = b.length,
            a = this.getModel(),
            g = h.getModelDefaults(),
            c, d, j = false;
        b = b.slice();
        for (c = 0; c < f; c++) {
            d = b[c];
            if (!d.isModel) {
                d = new a(d)
            } else {
                if (this.removed.indexOf(d) != -1) {
                    Ext.Array.remove(this.removed, d)
                }
            }
            d.set(g);
            b[c] = d;
            d.join(h);
            k = k || (d.phantom === true)
        }
        if (f === 1) {
            j = this.data.insert(e, b[0]);
            if (j) {
                j = [j]
            }
        } else {
            j = this.data.insertAll(e, b)
        }
        if (j) {
            h.fireEvent("addrecords", h, j)
        }
        if (h.getAutoSync() && k) {
            h.sync()
        }
        return b
    },
    remove: function (b) {
        if (b.isModel) {
            b = [b]
        }
        var l = this,
            m = false,
            d = 0,
            a = this.getAutoSync(),
            k = b.length,
            o = [],
            g = [],
            n, h = l.data.items,
            e, f, c;
        for (; d < k; d++) {
            e = b[d];
            if (l.data.contains(e)) {
                n = (e.phantom === true);
                f = h.indexOf(e);
                if (f !== -1) {
                    g.push(e);
                    o.push(f)
                }
                if (!n && l.getSyncRemovedRecords()) {
                    l.removed.push(e)
                }
                e.unjoin(l);
                l.data.remove(e);
                m = m || !n
            }
        }
        l.fireEvent("removerecords", l, g, o);
        if (a && m) {
            l.sync()
        }
    },
    removeAt: function (b) {
        var a = this.getAt(b);
        if (a) {
            this.remove(a)
        }
    },
    removeAll: function (a) {
        if (a !== true) {
            this.fireAction("clear", [this], "doRemoveAll")
        } else {
            this.doRemoveAll.call(this, true)
        }
    },
    doRemoveAll: function (a) {
        var b = this;
        b.data.each(function (c) {
            c.unjoin(b)
        });
        if (b.getSyncRemovedRecords()) {
            b.removed = b.removed.concat(b.data.items)
        }
        b.data.clear();
        if (a !== true) {
            b.fireEvent("refresh", b, b.data)
        }
        if (b.getAutoSync()) {
            this.sync()
        }
    },
    each: function (b, a) {
        this.data.each(b, a)
    },
    getCount: function () {
        return this.data.length || 0
    },
    getAt: function (a) {
        return this.data.getAt(a)
    },
    getRange: function (b, a) {
        return this.data.getRange(b, a)
    },
    getById: function (a) {
        return this.data.findBy(function (b) {
            return b.getId() == a
        })
    },
    indexOf: function (a) {
        return this.data.indexOf(a)
    },
    indexOfId: function (a) {
        return this.data.indexOfKey(a)
    },
    afterEdit: function (c, g, d) {
        var f = this,
            h = f.data,
            a = d[c.getIdProperty()] || c.getId(),
            b = h.keys.indexOf(a),
            e;
        if (b === -1 && h.map[a] === undefined) {
            return
        }
        if (f.getAutoSync()) {
            f.sync()
        }
        if (a !== c.getId()) {
            h.replace(a, c)
        } else {
            h.replace(c)
        }
        e = h.indexOf(c);
        if (b === -1 && e !== -1) {
            f.fireEvent("addrecords", f, [c])
        } else {
            if (b !== -1 && e === -1) {
                f.fireEvent("removerecords", f, [c], [b])
            } else {
                if (e !== -1) {
                    f.fireEvent("updaterecord", f, c, e, b)
                }
            }
        }
    },
    afterReject: function (a) {
        var b = this.data.indexOf(a);
        this.fireEvent("updaterecord", this, a, b, b)
    },
    afterCommit: function (c, d) {
        var f = this,
            g = f.data,
            a = d[c.getIdProperty()] || c.getId(),
            b = g.keys.indexOf(a),
            e;
        if (b === -1 && g.map[a] === undefined) {
            return
        }
        if (a !== c.getId()) {
            g.replace(a, c)
        } else {
            g.replace(c)
        }
        e = g.indexOf(c);
        if (b === -1 && e !== -1) {
            f.fireEvent("addrecords", f, [c])
        } else {
            if (b !== -1 && e === -1) {
                f.fireEvent("removerecords", f, [c], [b])
            } else {
                if (e !== -1) {
                    f.fireEvent("updaterecord", f, c, e, b)
                }
            }
        }
    },
    afterErase: function (a) {
        var c = this,
            d = c.data,
            b = d.indexOf(a);
        if (b !== -1) {
            d.remove(a);
            c.fireEvent("removerecords", c, [a], [b])
        }
    },
    updateRemoteFilter: function (a) {
        this.data.setAutoFilter(!a)
    },
    updateRemoteSort: function (a) {
        this.data.setAutoSort(!a)
    },
    sort: function (f, d, c) {
        var e = this.data,
            b = this.getGrouper(),
            a = e.getAutoSort();
        if (f) {
            e.setAutoSort(false);
            if (typeof c === "string") {
                if (c == "prepend") {
                    e.insertSorters(b ? 1 : 0, f, d)
                } else {
                    e.addSorters(f, d)
                }
            } else {
                e.setSorters(null);
                if (b) {
                    e.addSorters(b)
                }
                e.addSorters(f, d)
            }
            this.updateSortTypes();
            e.setAutoSort(a)
        }
        if (!this.getRemoteSort()) {
            if (!f) {
                this.data.sort()
            }
            this.fireEvent("sort", this, this.data, this.data.getSorters());
            if (e.length) {
                this.fireEvent("refresh", this, this.data)
            }
        }
    },
    filter: function (e, d, f, a) {
        var c = this.data,
            b = c.length;
        if (this.getRemoteFilter()) {
            if (e) {
                if (Ext.isString(e)) {
                    c.addFilters({
                        property: e,
                        value: d,
                        anyMatch: f,
                        caseSensitive: a
                    })
                } else {
                    if (Ext.isArray(e) || e.isFilter) {
                        c.addFilters(e)
                    }
                }
            }
        } else {
            c.filter(e, d);
            this.fireEvent("filter", this, c, c.getFilters());
            if (c.length !== b) {
                this.fireEvent("refresh", this, c)
            }
        }
    },
    filterBy: function (b, a) {
        var d = this,
            e = d.data,
            c = e.length;
        e.filter({
            filterFn: b,
            scope: a
        });
        this.fireEvent("filter", this, e, e.getFilters());
        if (e.length !== c) {
            this.fireEvent("refresh", this, e)
        }
    },
    queryBy: function (b, a) {
        return this.data.filterBy(b, a || this)
    },
    clearFilter: function (a) {
        var b = this.data.length;
        if (a) {
            this.suspendEvents()
        }
        this.data.setFilters(null);
        if (a) {
            this.resumeEvents()
        } else {
            if (b !== this.data.length) {
                this.fireEvent("refresh", this, this.data)
            }
        }
    },
    isFiltered: function () {
        return this.data.filtered
    },
    getSorters: function () {
        var a = this.data.getSorters();
        return (a) ? a.items : []
    },
    getFilters: function () {
        var a = this.data.getFilters();
        return (a) ? a.items : []
    },
    getGroups: function (c) {
        var e = this.data.items,
            b = e.length,
            a = this.getGrouper(),
            d = [],
            k = {},
            g, h, j, f;
        for (f = 0; f < b; f++) {
            g = e[f];
            h = a.getGroupString(g);
            j = k[h];
            if (j === undefined) {
                j = {
                    name: h,
                    children: []
                };
                d.push(j);
                k[h] = j
            }
            j.children.push(g)
        }
        return c ? k[c] : d
    },
    getGroupString: function (a) {
        var b = this.getGrouper();
        if (b) {
            return b.getGroupString(a)
        }
        return null
    },
    find: function (g, d, e, f, a, c) {
        var b = Ext.create("Ext.util.Filter", {
            property: g,
            value: d,
            anyMatch: f,
            caseSensitive: a,
            exactMatch: c,
            root: "data"
        });
        return this.data.findIndexBy(b.getFilterFn(), null, e)
    },
    findRecord: function () {
        var b = this,
            a = b.find.apply(b, arguments);
        return a !== -1 ? b.getAt(a) : null
    },
    findExact: function (c, a, b) {
        return this.data.findIndexBy(function (d) {
            return d.get(c) === a
        }, this, b)
    },
    findBy: function (b, a, c) {
        return this.data.findIndexBy(b, a, c)
    },
    load: function (c, e) {
        var f = this,
            b, d = f.currentPage,
            a = f.getPageSize();
        c = c || {};
        if (Ext.isFunction(c)) {
            c = {
                callback: c,
                scope: e || this
            }
        }
        if (f.getRemoteSort()) {
            c.sorters = c.sorters || this.getSorters()
        }
        if (f.getRemoteFilter()) {
            c.filters = c.filters || this.getFilters()
        }
        if (f.getRemoteGroup()) {
            c.grouper = c.grouper || this.getGrouper()
        }
        Ext.applyIf(c, {
            page: d,
            start: (d - 1) * a,
            limit: a,
            addRecords: false,
            action: "read",
            model: this.getModel()
        });
        b = Ext.create("Ext.data.Operation", c);
        if (f.fireEvent("beforeload", f, b) !== false) {
            f.loading = true;
            f.getProxy().read(b, f.onProxyLoad, f)
        }
        return f
    },
    isLoading: function () {
        return Boolean(this.loading)
    },
    sync: function () {
        var d = this,
            b = {},
            e = d.getNewRecords(),
            c = d.getUpdatedRecords(),
            a = d.getRemovedRecords(),
            f = false;
        if (e.length > 0) {
            b.create = e;
            f = true
        }
        if (c.length > 0) {
            b.update = c;
            f = true
        }
        if (a.length > 0) {
            b.destroy = a;
            f = true
        }
        if (f && d.fireEvent("beforesync", this, b) !== false) {
            d.getProxy().batch({
                operations: b,
                listeners: d.getBatchListeners()
            })
        }
        return {
            added: e,
            updated: c,
            removed: a
        }
    },
    first: function () {
        return this.data.first()
    },
    last: function () {
        return this.data.last()
    },
    sum: function (e) {
        var d = 0,
            c = 0,
            b = this.data.items,
            a = b.length;
        for (; c < a; ++c) {
            d += b[c].get(e)
        }
        return d
    },
    min: function (f) {
        var d = 1,
            b = this.data.items,
            a = b.length,
            e, c;
        if (a > 0) {
            c = b[0].get(f)
        }
        for (; d < a; ++d) {
            e = b[d].get(f);
            if (e < c) {
                c = e
            }
        }
        return c
    },
    max: function (f) {
        var d = 1,
            c = this.data.items,
            b = c.length,
            e, a;
        if (b > 0) {
            a = c[0].get(f)
        }
        for (; d < b; ++d) {
            e = c[d].get(f);
            if (e > a) {
                a = e
            }
        }
        return a
    },
    average: function (e) {
        var c = 0,
            b = this.data.items,
            a = b.length,
            d = 0;
        if (b.length > 0) {
            for (; c < a; ++c) {
                d += b[c].get(e)
            }
            return d / a
        }
        return 0
    },
    getBatchListeners: function () {
        return {
            scope: this,
            exception: this.onBatchException,
            complete: this.onBatchComplete
        }
    },
    onBatchComplete: function (b) {
        var e = this,
            a = b.operations,
            d = a.length,
            c;
        for (c = 0; c < d; c++) {
            e.onProxyWrite(a[c])
        }
    },
    onBatchException: function (b, a) {},
    onProxyLoad: function (b) {
        var d = this,
            a = b.getRecords(),
            c = b.getResultSet(),
            e = b.wasSuccessful();
        if (c) {
            d.setTotalCount(c.getTotal())
        }
        if (e) {
            if (b.getAddRecords() !== true) {
                d.data.each(function (f) {
                    f.unjoin(d)
                });
                d.data.clear();
                d.fireEvent("clear", this)
            }
            if (a && a.length) {
                d.suspendEvents();
                d.add(a);
                d.resumeEvents()
            }
            d.fireEvent("refresh", this, this.data)
        }
        d.loading = false;
        d.fireEvent("load", this, a, e);
        Ext.callback(b.getCallback(), b.getScope() || d, [a, b, e])
    },
    onProxyWrite: function (b) {
        var c = this,
            d = b.wasSuccessful(),
            a = b.getRecords();
        switch (b.getAction()) {
        case "create":
            c.onCreateRecords(a, b, d);
            break;
        case "update":
            c.onUpdateRecords(a, b, d);
            break;
        case "destroy":
            c.onDestroyRecords(a, b, d);
            break
        }
        if (d) {
            c.fireEvent("write", c, b)
        }
        Ext.callback(b.getCallback(), b.getScope() || c, [a, b, d])
    },
    onCreateRecords: function (b, a, c) {},
    onUpdateRecords: function (b, a, c) {},
    onDestroyRecords: function (b, a, c) {
        this.removed = []
    },
    getNewRecords: function () {
        return this.data.filterBy(function (a) {
            return a.phantom === true && a.isValid()
        }).items
    },
    getUpdatedRecords: function () {
        return this.data.filterBy(function (a) {
            return a.dirty === true && a.phantom !== true && a.isValid()
        }).items
    },
    getRemovedRecords: function () {
        return this.removed
    },
    loadPage: function (f, c, d) {
        if (typeof c === "function") {
            c = {
                callback: c,
                scope: d || this
            }
        }
        var e = this,
            b = e.getPageSize(),
            a = e.getClearOnPageLoad();
        c = Ext.apply({}, c);
        e.currentPage = f;
        e.load(Ext.applyIf(c, {
            page: f,
            start: (f - 1) * b,
            limit: b,
            addRecords: !a
        }))
    },
    nextPage: function (a) {
        this.loadPage(this.currentPage + 1, a)
    },
    previousPage: function (a) {
        this.loadPage(this.currentPage - 1, a)
    }
});
Ext.define("Ext.data.NodeStore", {
    extend: "Ext.data.Store",
    alias: "store.node",
    requires: ["Ext.data.NodeInterface"],
    config: {
        node: null,
        recursive: false,
        rootVisible: false,
        sorters: undefined,
        filters: undefined,
        folderSort: false
    },
    afterEdit: function (a, b) {
        if (b) {
            if (b.indexOf("loaded") !== -1) {
                return this.add(this.retrieveChildNodes(a))
            }
            if (b.indexOf("expanded") !== -1) {
                return this.filter()
            }
            if (b.indexOf("sorted") !== -1) {
                return this.sort()
            }
        }
        this.callParent(arguments)
    },
    onNodeAppend: function (a, b) {
        this.add([b].concat(this.retrieveChildNodes(b)))
    },
    onNodeInsert: function (a, b) {
        this.add([b].concat(this.retrieveChildNodes(b)))
    },
    onNodeRemove: function (a, b) {
        this.remove([b].concat(this.retrieveChildNodes(b)))
    },
    onNodeSort: function () {
        this.sort()
    },
    updateFolderSort: function (a) {
        if (a) {
            this.setGrouper(function (b) {
                if (b.isLeaf()) {
                    return 1
                }
                return 0
            })
        } else {
            this.setGrouper(null)
        }
    },
    createDataCollection: function () {
        var a = this.callParent();
        a.handleSort = Ext.Function.bind(this.handleTreeSort, this, [a], true);
        a.findInsertionIndex = Ext.Function.bind(this.handleTreeInsertionIndex, this, [a, a.findInsertionIndex], true);
        return a
    },
    handleTreeInsertionIndex: function (a, b, d, c) {
        return c.call(d, a, b, this.treeSortFn)
    },
    handleTreeSort: function (a) {
        Ext.Array.sort(a, this.treeSortFn);
        return a
    },
    treeSortFn: function (c, a) {
        if (c.parentNode === a.parentNode) {
            return (c.data.index < a.data.index) ? -1 : 1
        }
        var f = 0,
            e = 0,
            d = c,
            b = a;
        while (d) {
            f += (Math.pow(10, (d.data.depth + 1) * -4) * (d.data.index + 1));
            d = d.parentNode
        }
        while (b) {
            e += (Math.pow(10, (b.data.depth + 1) * -4) * (b.data.index + 1));
            b = b.parentNode
        }
        if (f > e) {
            return 1
        } else {
            if (f < e) {
                return -1
            }
        }
        return (c.data.index > a.data.index) ? 1 : -1
    },
    applyFilters: function (b) {
        var a = this;
        return function (c) {
            return a.isVisible(c)
        }
    },
    applyProxy: function (a) {},
    applyNode: function (a) {
        if (a) {
            a = Ext.data.NodeInterface.decorate(a)
        }
        return a
    },
    updateNode: function (a, c) {
        if (c) {
            c.un({
                append: "onNodeAppend",
                insert: "onNodeInsert",
                remove: "onNodeRemove",
                load: "onNodeLoad",
                scope: this
            });
            c.unjoin(this)
        }
        if (a) {
            a.on({
                scope: this,
                append: "onNodeAppend",
                insert: "onNodeInsert",
                remove: "onNodeRemove",
                load: "onNodeLoad"
            });
            a.join(this);
            var b = [];
            if (a.childNodes.length) {
                b = b.concat(this.retrieveChildNodes(a))
            }
            if (this.getRootVisible()) {
                b.push(a)
            } else {
                if (a.isLoaded() || a.isLoading()) {
                    a.set("expanded", true)
                }
            }
            this.data.clear();
            this.fireEvent("clear", this);
            this.suspendEvents();
            this.add(b);
            this.resumeEvents();
            this.fireEvent("refresh", this, this.data)
        }
    },
    retrieveChildNodes: function (a) {
        var d = this.getNode(),
            b = this.getRecursive(),
            c = [],
            e = a;
        if (!a.childNodes.length || (!b && a !== d)) {
            return c
        }
        if (!b) {
            return a.childNodes
        }
        while (e) {
            if (e._added) {
                delete e._added;
                if (e === a) {
                    break
                } else {
                    e = e.nextSibling || e.parentNode
                }
            } else {
                if (e !== a) {
                    c.push(e)
                }
                if (e.firstChild) {
                    e._added = true;
                    e = e.firstChild
                } else {
                    e = e.nextSibling || e.parentNode
                }
            }
        }
        return c
    },
    isVisible: function (b) {
        var a = b.parentNode;
        while (a) {
            if (!a.isExpanded()) {
                return false
            }
            if (a === this.getNode()) {
                break
            }
            a = a.parentNode
        }
        return true
    }
});
Ext.define("Ext.data.TreeStore", {
    extend: "Ext.data.NodeStore",
    alias: "store.tree",
    config: {
        root: undefined,
        clearOnLoad: true,
        nodeParam: "node",
        defaultRootId: "root",
        defaultRootProperty: "children",
        recursive: true
    },
    applyProxy: function () {
        return Ext.data.Store.prototype.applyProxy.apply(this, arguments)
    },
    applyRoot: function (a) {
        var b = this;
        a = a || {};
        a = Ext.apply({}, a);
        if (!a.isModel) {
            Ext.applyIf(a, {
                id: b.getDefaultRootId(),
                text: "Root",
                allowDrag: false
            });
            a = Ext.data.ModelManager.create(a, b.getModel())
        }
        Ext.data.NodeInterface.decorate(a);
        a.set(a.raw);
        return a
    },
    handleTreeInsertionIndex: function (a, b, d, c) {
        if (b.parentNode) {
            b.parentNode.sort(d.getSortFn(), true, true)
        }
        return this.callParent(arguments)
    },
    handleTreeSort: function (a, b) {
        if (this._sorting) {
            return a
        }
        this._sorting = true;
        this.getNode().sort(b.getSortFn(), true, true);
        delete this._sorting;
        return this.callParent(arguments)
    },
    updateRoot: function (a, b) {
        if (b) {
            b.unBefore({
                expand: "onNodeBeforeExpand",
                scope: this
            });
            b.unjoin(this)
        }
        a.onBefore({
            expand: "onNodeBeforeExpand",
            scope: this
        });
        this.onNodeAppend(null, a);
        this.setNode(a);
        if (!a.isLoaded() && !a.isLoading() && a.isExpanded()) {
            this.load({
                node: a
            })
        }
        this.fireEvent("rootchange", this, a, b)
    },
    getNodeById: function (a) {
        return this.data.getByKey(a)
    },
    onNodeBeforeExpand: function (b, a, c) {
        if (b.isLoading()) {
            c.pause();
            this.on("load", function () {
                c.resume()
            }, this, {
                single: true
            })
        } else {
            if (!b.isLoaded()) {
                c.pause();
                this.load({
                    node: b,
                    callback: function () {
                        c.resume()
                    }
                })
            }
        }
    },
    onNodeAppend: function (l, b) {
        var j = this.getProxy(),
            g = j.getReader(),
            e = b.raw,
            c = [],
            a = g.getRootProperty(),
            k, f, d, h;
        if (!b.isLeaf()) {
            k = g.getRoot(e);
            if (k) {
                f = g.extractData(k);
                for (d = 0, h = f.length; d < h; d++) {
                    if (f[d].node[a]) {
                        f[d].data[a] = f[d].node[a]
                    }
                    c.push(f[d].data)
                }
                if (c.length) {
                    this.fillNode(b, c)
                }
                delete e[a]
            }
        }
    },
    updateAutoLoad: function (b) {
        if (b) {
            var a = this.getRoot();
            if (!a.isLoaded() && !a.isLoading()) {
                this.load({
                    node: a
                })
            }
        }
    },
    load: function (a) {
        a = a || {};
        a.params = a.params || {};
        var c = this,
            b = a.node = a.node || c.getRoot();
        a.params[c.getNodeParam()] = b.getId();
        if (c.getClearOnLoad()) {
            b.removeAll(true)
        }
        b.set("loading", true);
        return c.callParent([a])
    },
    updateProxy: function (b) {
        this.callParent(arguments);
        var a = b.getReader();
        if (!a.getRootProperty()) {
            a.setRootProperty(this.getDefaultRootProperty());
            a.buildExtractors()
        }
    },
    removeAll: function () {
        this.getRootNode().removeAll(true);
        this.callParent(arguments)
    },
    onProxyLoad: function (b) {
        var d = this,
            a = b.getRecords(),
            e = b.wasSuccessful(),
            c = b.getNode();
        c.beginEdit();
        c.set("loading", false);
        if (e) {
            a = d.fillNode(c, a)
        }
        c.endEdit();
        c.fireEvent("load", c, a, e);
        d.loading = false;
        d.fireEvent("load", this, a, e);
        Ext.callback(b.getCallback(), b.getScope() || d, [a, b, e])
    },
    fillNode: function (d, a) {
        var c = a ? a.length : 0,
            b, e;
        for (b = 0; b < c; b++) {
            e = d.appendChild(a[b], true, true);
            this.onNodeAppend(d, e)
        }
        d.set("loaded", true);
        return a
    }
});
Ext.define("Ext.dataview.NestedList", {
    alternateClassName: "Ext.NestedList",
    extend: "Ext.Container",
    xtype: "nestedlist",
    requires: ["Ext.List", "Ext.Toolbar", "Ext.Button", "Ext.XTemplate", "Ext.data.StoreManager", "Ext.data.NodeStore", "Ext.data.TreeStore"],
    config: {
        cls: Ext.baseCSSPrefix + "nested-list",
        backText: "Back",
        useTitleAsBackText: true,
        updateTitleText: true,
        displayField: "text",
        loadingText: "Loading...",
        emptyText: "No items available.",
        onItemDisclosure: false,
        allowDeselect: false,
        useToolbar: null,
        toolbar: {
            docked: "top",
            xtype: "titlebar",
            ui: "light",
            inline: true
        },
        title: "",
        layout: {
            type: "card",
            animation: {
                type: "slide",
                duration: 250,
                direction: "left"
            }
        },
        store: null,
        detailContainer: undefined,
        detailCard: null,
        backButton: {
            ui: "back",
            hidden: true
        },
        listConfig: null,
        lastNode: null,
        lastActiveList: null
    },
    constructor: function (a) {
        if (Ext.isObject(a)) {
            if (a.getTitleTextTpl) {
                this.getTitleTextTpl = a.getTitleTextTpl
            }
            if (a.getItemTextTpl) {
                this.getItemTextTpl = a.getItemTextTpl
            }
        }
        this.callParent(arguments)
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.on({
            delegate: "> list",
            itemdoubletap: "onItemDoubleTap",
            itemtap: "onItemTap",
            beforeselect: "onBeforeSelect",
            containertap: "onContainerTap",
            selectionchange: "onSelectionChange",
            scope: a
        })
    },
    applyDetailContainer: function (a) {
        if (!a) {
            a = this
        }
        return a
    },
    onItemTap: function (g, c, j, a, h) {
        var f = this,
            b = g.getStore(),
            d = b.getAt(c);
        f.fireEvent("itemtap", this, g, c, j, a, h);
        if (d.isLeaf()) {
            f.fireEvent("leafitemtap", this, g, c, j, a, h);
            f.goToLeaf(d)
        } else {
            this.goToNode(d)
        }
    },
    onBeforeSelect: function () {
        this.fireEvent("beforeselect", [this, Array.prototype.slice.call(arguments)])
    },
    onContainerTap: function () {
        this.fireEvent("containertap", [this, Array.prototype.slice.call(arguments)])
    },
    onSelectionChange: function () {
        this.fireEvent("selectionchange", [this, Array.prototype.slice.call(arguments)])
    },
    onItemDoubleTap: function () {
        this.fireEvent("itemdoubletap", [this, Array.prototype.slice.call(arguments)])
    },
    onStoreBeforeLoad: function () {
        var a = this.getLoadingText(),
            b = this.getScrollable();
        if (a) {
            this.setMasked({
                xtype: "loadmask",
                message: a
            });
            if (b) {
                b.getScroller().setDisabled(true)
            }
        }
        this.fireEvent("beforeload", [this, Array.prototype.slice.call(arguments)])
    },
    onStoreLoad: function () {
        this.setMasked(false);
        this.fireEvent("load", [this, Array.prototype.slice.call(arguments)])
    },
    onBackTap: function () {
        var d = this,
            c = d.getLastNode(),
            e = d.getDetailCard(),
            a = e && d.getActiveItem() == e,
            b = d.getLastActiveList();
        this.fireAction("back", [this, c, b, a], "doBack")
    },
    doBack: function (e, d, c, a) {
        var b = e.getLayout(),
            f = (b) ? b.getAnimation() : null;
        if (a && c) {
            if (f) {
                f.setReverse(true)
            }
            e.setActiveItem(c);
            e.setLastNode(d.parentNode);
            e.syncToolbar()
        } else {
            this.goToNode(d.parentNode)
        }
    },
    updateData: function (a) {
        if (!this.getStore()) {
            this.setStore(new Ext.data.TreeStore({
                root: a
            }))
        }
    },
    applyStore: function (a) {
        if (a) {
            a = Ext.data.StoreManager.lookup(a);
            if (a && Ext.isObject(a) && a.isStore) {
                a.on({
                    scope: this,
                    load: "onStoreLoad",
                    beforeload: "onStoreBeforeLoad"
                })
            }
        }
        return a
    },
    updateStore: function (a, c) {
        var b = this;
        if (c && Ext.isObject(c) && c.isStore) {
            if (c.autoDestroy) {
                c.destroy()
            }
            c.un({
                rootchange: "onStoreRootChange",
                scope: this
            })
        }
        if (a) {
            b.goToNode(a.getRoot());
            a.on({
                rootchange: "onStoreRootChange",
                scope: this
            })
        }
    },
    onStoreRootChange: function (a, b) {
        this.goToNode(b)
    },
    applyBackButton: function (a) {
        return Ext.factory(a, Ext.Button, this.getBackButton())
    },
    applyDetailCard: function (a) {
        return this.factoryItem(a)
    },
    updateBackButton: function (b, a) {
        if (b) {
            var c = this;
            b.on("tap", c.onBackTap, c);
            b.setText(c.getBackText());
            c.getToolbar().insert(0, b)
        } else {
            if (a) {
                a.destroy()
            }
        }
    },
    applyToolbar: function (a) {
        return Ext.factory(a, Ext.TitleBar, this.getToolbar())
    },
    updateToolbar: function (a, b) {
        var c = this;
        if (a) {
            a.setTitle(c.getTitle());
            if (!a.getParent()) {
                c.add(a)
            }
        } else {
            if (b) {
                b.destroy()
            }
        }
    },
    updateUseToolbar: function (a, b) {
        if (!a) {
            this.setToolbar(false)
        }
    },
    updateTitle: function (c) {
        var b = this,
            a = b.getToolbar();
        if (a) {
            if (b.getUpdateTitleText()) {
                a.setTitle(c)
            }
        }
    },
    getItemTextTpl: function (a) {
        return "{" + this.getDisplayField() + "}"
    },
    getTitleTextTpl: function (a) {
        return "{" + this.getDisplayField() + "}"
    },
    renderTitleText: function (b, c) {
        if (!b.titleTpl) {
            b.titleTpl = Ext.create("Ext.XTemplate", this.getTitleTextTpl(b))
        }
        if (b.isRoot()) {
            var a = this.getInitialConfig("title");
            return (c && a === "") ? this.getInitialConfig("backText") : a
        }
        return b.titleTpl.applyTemplate(b.data)
    },
    goToNode: function (a) {
        if (!a) {
            return
        }
        var j = this,
            d = j.getActiveItem(),
            l = j.getDetailCard(),
            k = l && j.getActiveItem() == l,
            h = j.goToNodeReverseAnimation(a),
            c = j.firstList,
            e = j.secondList,
            f = j.getLayout(),
            b = (f) ? f.getAnimation() : null,
            g;
        if (a.isLeaf()) {
            throw new Error("goToNode: passed a node which is a leaf.")
        }
        if (a == j.getLastNode() && !k) {
            return
        }
        if (k) {
            if (b) {
                b.setReverse(true)
            }
            j.setActiveItem(j.getLastActiveList())
        } else {
            if (c && e) {
                d = j.getActiveItem();
                j.setLastActiveList(d);
                g = (d == c) ? e : c;
                g.getStore().setNode(a);
                a.expand();
                if (b) {
                    b.setReverse(h)
                }
                j.setActiveItem(g);
                g.deselectAll()
            } else {
                if (c) {
                    j.setLastActiveList(j.getActiveItem());
                    j.setActiveItem(j.getList(a));
                    j.secondList = j.getActiveItem()
                } else {
                    j.setActiveItem(j.getList(a));
                    j.firstList = j.getActiveItem()
                }
            }
        }
        j.fireEvent("listchange", this, j.getActiveItem());
        j.setLastNode(a);
        j.syncToolbar()
    },
    goToLeaf: function (f) {
        if (!f.isLeaf()) {
            throw new Error("goToLeaf: passed a node which is not a leaf.")
        }
        var e = this,
            c = e.getDetailCard(f),
            b = e.getDetailContainer(),
            a = b == this,
            d = e.getLayout(),
            g = (d) ? d.getAnimation() : false;
        if (c) {
            if (b.getItems().indexOf(c) === -1) {
                b.add(c)
            }
            if (a) {
                if (e.getActiveItem() instanceof Ext.dataview.List) {
                    e.setLastActiveList(e.getActiveItem())
                }
                e.setLastNode(f)
            }
            if (g) {
                g.setReverse(false)
            }
            b.setActiveItem(c);
            e.syncToolbar()
        }
    },
    syncToolbar: function (g) {
        var e = this,
            f = e.getDetailCard(),
            d = e.getLastNode(),
            b = g || (f && (e.getActiveItem() == f)),
            a = (b) ? d : d.parentNode,
            c = e.getBackButton();
        if (c) {
            c[a ? "show" : "hide"]();
            if (a && e.getUseTitleAsBackText()) {
                c.setText(e.renderTitleText(d.parentNode, true))
            }
        }
        if (d) {
            e.setTitle(e.renderTitleText(d))
        }
    },
    updateBackText: function (a) {
        this.getBackButton().setText(a)
    },
    goToNodeReverseAnimation: function (c) {
        var b = this,
            a = b.getLastNode();
        if (!a) {
            return false
        }
        return (!a.contains(c) && a.isAncestor(c)) ? true : false
    },
    getList: function (b) {
        var a = this,
            c = Ext.create("Ext.data.NodeStore", {
                recursive: false,
                node: b,
                rootVisible: false,
                model: a.getStore().getModel()
            });
        b.expand();
        return Ext.Object.merge({
            xtype: "list",
            pressedDelay: 0,
            autoDestroy: true,
            store: c,
            onItemDisclosure: a.getOnItemDisclosure(),
            allowDeselect: a.getAllowDeselect(),
            itemTpl: '<span<tpl if="leaf == true"> class="x-list-item-leaf"</tpl>>' + a.getItemTextTpl(b) + "</span>"
        }, this.getListConfig())
    }
}, function () {});
Ext.define("Kitchensink.view.phone.Main", {
    extend: "Ext.dataview.NestedList",
    requires: ["Ext.TitleBar"],
    id: "mainNestedList",
    config: {
        fullscreen: true,
        title: "Kitchen Sink",
        useTitleAsBackText: false,
        store: "Demos",
        toolbar: {
            id: "mainNavigationBar",
            xtype: "titlebar",
            docked: "top",
            title: "Kitchen Sink",
            items: {
                xtype: "button",
                id: "viewSourceButton",
                hidden: true,
                align: "right",
                ui: "action",
                action: "viewSource",
                text: "Source"
            }
        }
    }
});
Ext.define("Kitchensink.view.tablet.Main", {
    extend: "Ext.Container",
    xtype: "mainview",
    requires: ["Ext.dataview.NestedList", "Ext.navigation.Bar"],
    config: {
        fullscreen: true,
        layout: {
            type: "card",
            animation: {
                type: "slide",
                direction: "left",
                duration: 250
            }
        },
        items: [{
            id: "launchscreen",
            cls: "launchscreen",
            html: '<div style="text-align:center;"><img src="resources/img/sencha.png" width="210" height="291" /><h1>Welcome to Sencha Touch</h1><p>This is a comprehensive collection of our examples in an <br /> easy-to-navigate format. Each sample has a â€œview sourceâ€ button which dynamically displays its associated code.<br /><br /><span>Sencha Touch (' + Ext.version + ")</span></p></div>"
        }, {
            id: "mainNestedList",
            xtype: "nestedlist",
            useTitleAsBackText: false,
            docked: "left",
            width: 250,
            store: "Demos"
        }, {
            id: "mainNavigationBar",
            xtype: "titlebar",
            docked: "top",
            title: "Kitchen Sink",
            items: {
                xtype: "button",
                id: "viewSourceButton",
                hidden: true,
                align: "right",
                ui: "action",
                action: "viewSource",
                text: "Source"
            }
        }]
    }
});
Ext.define("Ext.event.Touch", {
    extend: "Ext.event.Dom",
    requires: ["Ext.util.Point"],
    constructor: function (a, b) {
        if (b) {
            this.set(b)
        }
        this.touchesMap = {};
        this.changedTouches = this.cloneTouches(a.changedTouches);
        this.touches = this.cloneTouches(a.touches);
        this.targetTouches = this.cloneTouches(a.targetTouches);
        return this.callParent([a])
    },
    clone: function () {
        return new this.self(this)
    },
    setTargets: function (a) {
        this.doSetTargets(this.changedTouches, a);
        this.doSetTargets(this.touches, a);
        this.doSetTargets(this.targetTouches, a)
    },
    doSetTargets: function (f, d) {
        var c, e, g, b, a;
        for (c = 0, e = f.length; c < e; c++) {
            g = f[c];
            b = g.identifier;
            a = d[b];
            if (a) {
                g.targets = a
            }
        }
    },
    cloneTouches: function (f) {
        var e = this.touchesMap,
            h = [],
            d = null,
            b, c, g, a;
        for (b = 0, c = f.length; b < c; b++) {
            g = f[b];
            a = g.identifier;
            if (d !== null && a === d) {
                a++
            }
            d = a;
            if (!e[a]) {
                e[a] = {
                    pageX: g.pageX,
                    pageY: g.pageY,
                    identifier: a,
                    target: g.target,
                    timeStamp: g.timeStamp,
                    point: Ext.util.Point.fromTouch(g),
                    targets: g.targets
                }
            }
            h[b] = e[a]
        }
        return h
    }
});
Ext.define("Ext.event.publisher.TouchGesture", {
    extend: "Ext.event.publisher.Dom",
    requires: ["Ext.util.Point", "Ext.event.Touch"],
    handledEvents: ["touchstart", "touchmove", "touchend", "touchcancel"],
    moveEventName: "touchmove",
    config: {
        moveThrottle: 1,
        buffering: {
            enabled: false,
            interval: 10
        },
        recognizers: {}
    },
    currentTouchesCount: 0,
    constructor: function (a) {
        this.processEvents = Ext.Function.bind(this.processEvents, this);
        this.eventProcessors = {
            touchstart: this.onTouchStart,
            touchmove: this.onTouchMove,
            touchend: this.onTouchEnd,
            touchcancel: this.onTouchEnd
        };
        this.eventToRecognizerMap = {};
        this.activeRecognizers = [];
        this.currentRecognizers = [];
        this.currentTargets = {};
        this.currentTouches = {};
        this.buffer = [];
        this.initConfig(a);
        return this.callParent()
    },
    applyBuffering: function (a) {
        if (a.enabled === true) {
            this.bufferTimer = setInterval(this.processEvents, a.interval)
        } else {
            clearInterval(this.bufferTimer)
        }
        return a
    },
    applyRecognizers: function (b) {
        var c, a;
        for (c in b) {
            if (b.hasOwnProperty(c)) {
                a = b[c];
                this.registerRecognizer(a)
            }
        }
        return b
    },
    handles: function (a) {
        return this.callParent(arguments) || this.eventToRecognizerMap.hasOwnProperty(a)
    },
    doesEventBubble: function () {
        return true
    },
    eventLogs: [],
    onEvent: function (b) {
        var a = this.getBuffering();
        b = new Ext.event.Touch(b);
        if (a.enabled) {
            this.buffer.push(b)
        } else {
            this.processEvent(b)
        }
    },
    processEvents: function () {
        var a = this.buffer,
            f = a.length,
            d = [],
            c, e, b;
        if (f > 0) {
            c = a.slice(0);
            a.length = 0;
            for (b = 0; b < f; b++) {
                e = c[b];
                if (e.type === this.moveEventName) {
                    d.push(e)
                } else {
                    if (d.length > 0) {
                        this.processEvent(this.mergeEvents(d));
                        d.length = 0
                    }
                    this.processEvent(e)
                }
            }
            if (d.length > 0) {
                this.processEvent(this.mergeEvents(d));
                d.length = 0
            }
        }
    },
    mergeEvents: function (c) {
        var b = [],
            f = c.length,
            a, e, d;
        d = c[f - 1];
        if (f === 1) {
            return d
        }
        for (a = 0; a < f; a++) {
            e = c[a];
            b.push(e.changedTouches)
        }
        d.changedTouches = this.mergeTouchLists(b);
        return d
    },
    mergeTouchLists: function (l) {
        var e = {},
            h = [],
            d, k, a, b, f, c, g;
        for (d = 0, k = l.length; d < k; d++) {
            a = l[d];
            for (b = 0, f = a.length; b < f; b++) {
                c = a[b];
                g = c.identifier;
                e[g] = c
            }
        }
        for (g in e) {
            if (e.hasOwnProperty(g)) {
                h.push(e[g])
            }
        }
        return h
    },
    registerRecognizer: function (a) {
        var g = this.eventToRecognizerMap,
            e = this.activeRecognizers,
            c = a.getHandledEvents(),
            d, f, b;
        a.setOnRecognized(this.onRecognized);
        a.setCallbackScope(this);
        for (d = 0, f = c.length; d < f; d++) {
            b = c[d];
            g[b] = a
        }
        e.push(a);
        return this
    },
    onRecognized: function (f, h, d, a) {
        var k = [],
            j = d.length,
            g, c, b;
        if (j === 1) {
            return this.publish(f, d[0].targets, h, a)
        }
        for (c = 0; c < j; c++) {
            b = d[c];
            k.push(b.targets)
        }
        g = this.getCommonTargets(k);
        this.publish(f, g, h, a)
    },
    publish: function (b, a, c, d) {
        c.set(d);
        return this.callParent([b, a, c])
    },
    getCommonTargets: function (a) {
        var h = a[0],
            f = a.length;
        if (f === 1) {
            return h
        }
        var d = [],
            e = 1,
            g, b, c;
        while (true) {
            g = h[h.length - e];
            if (!g) {
                return d
            }
            for (c = 1; c < f; c++) {
                b = a[c];
                if (b[b.length - e] !== g) {
                    return d
                }
            }
            d.unshift(g);
            e++
        }
        return d
    },
    invokeRecognizers: function (c, g) {
        var b = this.activeRecognizers,
            f = b.length,
            d, a;
        if (c === "onStart") {
            for (d = 0; d < f; d++) {
                b[d].isActive = true
            }
        }
        for (d = 0; d < f; d++) {
            a = b[d];
            if (a.isActive && a[c].call(a, g) === false) {
                a.isActive = false
            }
        }
    },
    getActiveRecognizers: function () {
        return this.activeRecognizers
    },
    processEvent: function (a) {
        this.eventProcessors[a.type].call(this, a)
    },
    onTouchStart: function (k) {
        var m = this.currentTargets,
            g = this.currentTouches,
            o = this.currentTouchesCount,
            n = k.changedTouches,
            f = k.touches,
            h = f.length,
            a = {},
            l = n.length,
            d, c, j, b;
        o += l;
        if (o > h) {
            for (d = 0; d < h; d++) {
                c = f[d];
                j = c.identifier;
                a[j] = true
            }
            for (j in g) {
                if (g.hasOwnProperty(j)) {
                    if (!a[j]) {
                        o--;
                        b = k.clone();
                        c = g[j];
                        c.targets = this.getBubblingTargets(this.getElementTarget(c.target));
                        b.changedTouches = [c];
                        this.onTouchEnd(b)
                    }
                }
            }
            if (o > h) {
                return
            }
        }
        for (d = 0; d < l; d++) {
            c = n[d];
            j = c.identifier;
            if (!g.hasOwnProperty(j)) {
                this.currentTouchesCount++
            }
            g[j] = c;
            m[j] = this.getBubblingTargets(this.getElementTarget(c.target))
        }
        k.setTargets(m);
        for (d = 0; d < l; d++) {
            c = n[d];
            this.publish("touchstart", c.targets, k, {
                touch: c
            })
        }
        if (!this.isStarted) {
            this.isStarted = true;
            this.invokeRecognizers("onStart", k)
        }
        this.invokeRecognizers("onTouchStart", k)
    },
    onTouchMove: function (j) {
        if (!this.isStarted) {
            return
        }
        var l = this.currentTargets,
            g = this.currentTouches,
            c = this.getMoveThrottle(),
            m = j.changedTouches,
            b = 0,
            f, k, d, n, a, h;
        j.setTargets(l);
        for (f = 0, k = m.length; f < k; f++) {
            d = m[f];
            h = d.identifier;
            n = d.point;
            a = g[h].point;
            if (c && n.isCloseTo(a, c)) {
                b++;
                continue
            }
            g[h] = d;
            this.publish("touchmove", d.targets, j, {
                touch: d
            })
        }
        if (b < k) {
            this.invokeRecognizers("onTouchMove", j)
        }
    },
    onTouchEnd: function (d) {
        if (!this.isStarted) {
            return
        }
        var h = this.currentTargets,
            c = this.currentTouches,
            k = d.changedTouches,
            g = k.length,
            j, f, b, a;
        d.setTargets(h);
        this.currentTouchesCount -= g;
        j = (this.currentTouchesCount === 0);
        if (j) {
            this.isStarted = false
        }
        for (b = 0; b < g; b++) {
            a = k[b];
            f = a.identifier;
            delete c[f];
            delete h[f];
            this.publish("touchend", a.targets, d, {
                touch: a
            })
        }
        this.invokeRecognizers("onTouchEnd", d);
        if (j) {
            this.invokeRecognizers("onEnd", d)
        }
    }
}, function () {
    if (!Ext.feature.has.Touch) {
        this.override({
            moveEventName: "mousemove",
            map: {
                mouseToTouch: {
                    mousedown: "touchstart",
                    mousemove: "touchmove",
                    mouseup: "touchend"
                },
                touchToMouse: {
                    touchstart: "mousedown",
                    touchmove: "mousemove",
                    touchend: "mouseup"
                }
            },
            attachListener: function (a) {
                a = this.map.touchToMouse[a];
                if (!a) {
                    return
                }
                return this.callOverridden([a])
            },
            lastEventType: null,
            onEvent: function (d) {
                if ("button" in d && d.button !== 0) {
                    return
                }
                var c = d.type,
                    b = [d];
                if (c === "mousedown" && this.lastEventType && this.lastEventType !== "mouseup") {
                    var a = document.createEvent("MouseEvent");
                    a.initMouseEvent("mouseup", d.bubbles, d.cancelable, document.defaultView, d.detail, d.screenX, d.screenY, d.clientX, d.clientY, d.ctrlKey, d.altKey, d.shiftKey, d.metaKey, d.metaKey, d.button, d.relatedTarget);
                    this.onEvent(a)
                }
                if (c !== "mousemove") {
                    this.lastEventType = c
                }
                d.identifier = 1;
                d.touches = (c !== "mouseup") ? b : [];
                d.targetTouches = (c !== "mouseup") ? b : [];
                d.changedTouches = b;
                return this.callOverridden([d])
            },
            processEvent: function (a) {
                this.eventProcessors[this.map.mouseToTouch[a.type]].call(this, a)
            }
        })
    }
});
Ext.define("Ext.event.recognizer.Recognizer", {
    mixins: ["Ext.mixin.Identifiable"],
    handledEvents: [],
    config: {
        onRecognized: Ext.emptyFn,
        onFailed: Ext.emptyFn,
        callbackScope: null
    },
    constructor: function (a) {
        this.initConfig(a);
        return this
    },
    getHandledEvents: function () {
        return this.handledEvents
    },
    onStart: Ext.emptyFn,
    onEnd: Ext.emptyFn,
    fail: function () {
        this.getOnFailed().apply(this.getCallbackScope(), arguments);
        return false
    },
    fire: function () {
        this.getOnRecognized().apply(this.getCallbackScope(), arguments)
    }
});
Ext.define("Ext.event.recognizer.Touch", {
    extend: "Ext.event.recognizer.Recognizer",
    onTouchStart: Ext.emptyFn,
    onTouchMove: Ext.emptyFn,
    onTouchEnd: Ext.emptyFn
});
Ext.define("Ext.event.recognizer.SingleTouch", {
    extend: "Ext.event.recognizer.Touch",
    inheritableStatics: {
        NOT_SINGLE_TOUCH: 1,
        TOUCH_MOVED: 2
    },
    onTouchStart: function (a) {
        if (a.touches.length > 1) {
            return this.fail(this.self.NOT_SINGLE_TOUCH)
        }
    }
});
Ext.define("Ext.event.recognizer.Drag", {
    extend: "Ext.event.recognizer.SingleTouch",
    isStarted: false,
    startPoint: null,
    previousPoint: null,
    lastPoint: null,
    handledEvents: ["dragstart", "drag", "dragend"],
    onTouchStart: function (b) {
        var c, a;
        if (this.callParent(arguments) === false) {
            if (this.isStarted && this.lastMoveEvent !== null) {
                this.onTouchEnd(this.lastMoveEvent)
            }
            return false
        }
        this.startTouches = c = b.changedTouches;
        this.startTouch = a = c[0];
        this.startPoint = a.point
    },
    onTouchMove: function (d) {
        var c = d.changedTouches,
            f = c[0],
            a = f.point,
            b = d.time;
        if (this.lastPoint) {
            this.previousPoint = this.lastPoint
        }
        if (this.lastTime) {
            this.previousTime = this.lastTime
        }
        this.lastTime = b;
        this.lastPoint = a;
        this.lastMoveEvent = d;
        if (!this.isStarted) {
            this.isStarted = true;
            this.startTime = b;
            this.previousTime = b;
            this.previousPoint = this.startPoint;
            this.fire("dragstart", d, this.startTouches, this.getInfo(d, this.startTouch))
        } else {
            this.fire("drag", d, c, this.getInfo(d, f))
        }
    },
    onTouchEnd: function (c) {
        if (this.isStarted) {
            var b = c.changedTouches,
                d = b[0],
                a = d.point;
            this.isStarted = false;
            this.lastPoint = a;
            this.fire("dragend", c, b, this.getInfo(c, d));
            this.startTime = 0;
            this.previousTime = 0;
            this.lastTime = 0;
            this.startPoint = null;
            this.previousPoint = null;
            this.lastPoint = null;
            this.lastMoveEvent = null
        }
    },
    getInfo: function (k, j) {
        var d = k.time,
            a = this.startPoint,
            f = this.previousPoint,
            b = this.startTime,
            l = this.previousTime,
            m = this.lastPoint,
            h = m.x - a.x,
            g = m.y - a.y,
            c = {
                touch: j,
                startX: a.x,
                startY: a.y,
                previousX: f.x,
                previousY: f.y,
                pageX: m.x,
                pageY: m.y,
                deltaX: h,
                deltaY: g,
                absDeltaX: Math.abs(h),
                absDeltaY: Math.abs(g),
                previousDeltaX: m.x - f.x,
                previousDeltaY: m.y - f.y,
                time: d,
                startTime: b,
                previousTime: l,
                deltaTime: d - b,
                previousDeltaTime: d - l
            };
        return c
    }
});
Ext.define("Ext.event.recognizer.Tap", {
    handledEvents: ["tap"],
    extend: "Ext.event.recognizer.SingleTouch",
    onTouchMove: function () {
        return this.fail(this.self.TOUCH_MOVED)
    },
    onTouchEnd: function (a) {
        var b = a.changedTouches[0];
        this.fire("tap", a, [b])
    }
}, function () {});
Ext.define("Ext.event.recognizer.DoubleTap", {
    extend: "Ext.event.recognizer.SingleTouch",
    config: {
        maxDuration: 300
    },
    handledEvents: ["singletap", "doubletap"],
    singleTapTimer: null,
    onTouchStart: function (a) {
        if (this.callParent(arguments) === false) {
            return false
        }
        this.startTime = a.time;
        clearTimeout(this.singleTapTimer)
    },
    onTouchMove: function () {
        return this.fail(this.self.TOUCH_MOVED)
    },
    onEnd: function (g) {
        var c = this,
            b = this.getMaxDuration(),
            h = g.changedTouches[0],
            f = g.time,
            a = this.lastTapTime,
            d;
        this.lastTapTime = f;
        if (a) {
            d = f - a;
            if (d <= b) {
                this.lastTapTime = 0;
                this.fire("doubletap", g, [h], {
                    touch: h,
                    duration: d
                });
                return
            }
        }
        if (f - this.startTime > b) {
            this.fireSingleTap(g, h)
        } else {
            this.singleTapTimer = setTimeout(function () {
                c.fireSingleTap(g, h)
            }, b)
        }
    },
    fireSingleTap: function (a, b) {
        this.fire("singletap", a, [b], {
            touch: b
        })
    }
});
Ext.define("Ext.event.recognizer.LongPress", {
    extend: "Ext.event.recognizer.SingleTouch",
    inheritableStatics: {
        DURATION_NOT_ENOUGH: 32
    },
    config: {
        minDuration: 1000
    },
    handledEvents: ["longpress"],
    fireLongPress: function (a) {
        var b = a.changedTouches[0];
        this.fire("longpress", a, [b], {
            touch: b,
            duration: this.getMinDuration()
        });
        this.isLongPress = true
    },
    onTouchStart: function (b) {
        var a = this;
        if (this.callParent(arguments) === false) {
            return false
        }
        this.isLongPress = false;
        this.timer = setTimeout(function () {
            a.fireLongPress(b)
        }, this.getMinDuration())
    },
    onTouchMove: function () {
        return this.fail(this.self.TOUCH_MOVED)
    },
    onTouchEnd: function () {
        if (!this.isLongPress) {
            return this.fail(this.self.DURATION_NOT_ENOUGH)
        }
    },
    fail: function () {
        clearTimeout(this.timer);
        return this.callParent(arguments)
    }
}, function () {});
Ext.define("Ext.event.recognizer.Swipe", {
    extend: "Ext.event.recognizer.SingleTouch",
    handledEvents: ["swipe"],
    inheritableStatics: {
        MAX_OFFSET_EXCEEDED: 16,
        MAX_DURATION_EXCEEDED: 17,
        DISTANCE_NOT_ENOUGH: 18
    },
    config: {
        minDistance: 80,
        maxOffset: 35,
        maxDuration: 1000
    },
    onTouchStart: function (a) {
        if (this.callParent(arguments) === false) {
            return false
        }
        var b = a.changedTouches[0];
        this.startTime = a.time;
        this.isHorizontal = true;
        this.isVertical = true;
        this.startX = b.pageX;
        this.startY = b.pageY
    },
    onTouchMove: function (f) {
        var h = f.changedTouches[0],
            b = h.pageX,
            g = h.pageY,
            c = Math.abs(b - this.startX),
            a = Math.abs(g - this.startY),
            d = f.time;
        if (d - this.startTime > this.getMaxDuration()) {
            return this.fail(this.self.MAX_DURATION_EXCEEDED)
        }
        if (this.isVertical && c > this.getMaxOffset()) {
            this.isVertical = false
        }
        if (this.isHorizontal && a > this.getMaxOffset()) {
            this.isHorizontal = false
        }
        if (!this.isHorizontal && !this.isVertical) {
            return this.fail(this.self.MAX_OFFSET_EXCEEDED)
        }
    },
    onTouchEnd: function (j) {
        if (this.onTouchMove(j) === false) {
            return false
        }
        var h = j.changedTouches[0],
            m = h.pageX,
            k = h.pageY,
            g = m - this.startX,
            f = k - this.startY,
            c = Math.abs(g),
            b = Math.abs(f),
            n = this.getMinDistance(),
            d = j.time - this.startTime,
            l, a;
        if (this.isVertical && b < n) {
            this.isVertical = false
        }
        if (this.isHorizontal && c < n) {
            this.isHorizontal = false
        }
        if (this.isHorizontal) {
            l = (g < 0) ? "left" : "right";
            a = c
        } else {
            if (this.isVertical) {
                l = (f < 0) ? "up" : "down";
                a = b
            } else {
                return this.fail(this.self.DISTANCE_NOT_ENOUGH)
            }
        }
        this.fire("swipe", j, [h], {
            touch: h,
            direction: l,
            distance: a,
            duration: d
        })
    }
});
Ext.define("Ext.event.recognizer.HorizontalSwipe", {
    extend: "Ext.event.recognizer.Swipe",
    handledEvents: ["swipe"],
    onTouchStart: function (a) {
        if (this.callParent(arguments) === false) {
            return false
        }
        var b = a.changedTouches[0];
        this.startTime = a.time;
        this.startX = b.pageX;
        this.startY = b.pageY
    },
    onTouchMove: function (f) {
        var h = f.changedTouches[0],
            g = h.pageY,
            a = Math.abs(g - this.startY),
            d = f.time,
            c = this.getMaxDuration(),
            b = this.getMaxOffset();
        if (d - this.startTime > c) {
            return this.fail(this.self.MAX_DURATION_EXCEEDED)
        }
        if (a > b) {
            return this.fail(this.self.MAX_OFFSET_EXCEEDED)
        }
    },
    onTouchEnd: function (f) {
        if (this.onTouchMove(f) !== false) {
            var j = f.changedTouches[0],
                a = j.pageX,
                b = a - this.startX,
                h = Math.abs(b),
                d = f.time - this.startTime,
                g = this.getMinDistance(),
                c;
            if (h < g) {
                return this.fail(this.self.DISTANCE_NOT_ENOUGH)
            }
            c = (b < 0) ? "left" : "right";
            this.fire("swipe", f, [j], {
                touch: j,
                direction: c,
                distance: h,
                duration: d
            })
        }
    }
});
Ext.define("Ext.event.recognizer.MultiTouch", {
    extend: "Ext.event.recognizer.Touch",
    requiredTouchesCount: 2,
    isTracking: false,
    isStarted: false,
    onTouchStart: function (d) {
        var a = this.requiredTouchesCount,
            c = d.touches,
            b = c.length;
        if (b === a) {
            this.start(d)
        } else {
            if (b > a) {
                this.end(d)
            }
        }
    },
    onTouchEnd: function (a) {
        this.end(a)
    },
    start: function () {
        if (!this.isTracking) {
            this.isTracking = true;
            this.isStarted = false
        }
    },
    end: function (a) {
        if (this.isTracking) {
            this.isTracking = false;
            if (this.isStarted) {
                this.isStarted = false;
                this.fireEnd(a)
            }
        }
    }
});
Ext.define("Ext.event.recognizer.Pinch", {
    extend: "Ext.event.recognizer.MultiTouch",
    requiredTouchesCount: 2,
    handledEvents: ["pinchstart", "pinch", "pinchend"],
    startDistance: 0,
    lastTouches: null,
    onTouchMove: function (c) {
        if (!this.isTracking) {
            return
        }
        var b = Array.prototype.slice.call(c.touches),
            d, a, f;
        d = b[0].point;
        a = b[1].point;
        f = d.getDistanceTo(a);
        if (f === 0) {
            return
        }
        if (!this.isStarted) {
            this.isStarted = true;
            this.startDistance = f;
            this.fire("pinchstart", c, b, {
                touches: b,
                distance: f,
                scale: 1
            })
        } else {
            this.fire("pinch", c, b, {
                touches: b,
                distance: f,
                scale: f / this.startDistance
            })
        }
        this.lastTouches = b
    },
    fireEnd: function (a) {
        this.fire("pinchend", a, this.lastTouches)
    },
    fail: function () {
        return this.callParent(arguments)
    }
});
Ext.define("Ext.event.recognizer.Rotate", {
    extend: "Ext.event.recognizer.MultiTouch",
    requiredTouchesCount: 2,
    handledEvents: ["rotatestart", "rotate", "rotateend"],
    startAngle: 0,
    lastTouches: null,
    lastAngle: null,
    onTouchMove: function (h) {
        if (!this.isTracking) {
            return
        }
        var g = Array.prototype.slice.call(h.touches),
            b = this.lastAngle,
            d, f, c, a, j, k;
        d = g[0].point;
        f = g[1].point;
        c = d.getAngleTo(f);
        if (b !== null) {
            k = Math.abs(b - c);
            a = c + 360;
            j = c - 360;
            if (Math.abs(a - b) < k) {
                c = a
            } else {
                if (Math.abs(j - b) < k) {
                    c = j
                }
            }
        }
        this.lastAngle = c;
        if (!this.isStarted) {
            this.isStarted = true;
            this.startAngle = c;
            this.fire("rotatestart", h, g, {
                touches: g,
                angle: c,
                rotation: 0
            })
        } else {
            this.fire("rotate", h, g, {
                touches: g,
                angle: c,
                rotation: c - this.startAngle
            })
        }
        this.lastTouches = g
    },
    fireEnd: function (a) {
        this.lastAngle = null;
        this.fire("rotateend", a, this.lastTouches)
    }
});
Ext.define("Ext.ComponentQuery", {
    singleton: true,
    uses: ["Ext.ComponentManager"]
}, function () {
    var g = this,
        k = ["var r = [],", "i = 0,", "it = items,", "l = it.length,", "c;", "for (; i < l; i++) {", "c = it[i];", "if (c.{0}) {", "r.push(c);", "}", "}", "return r;"].join(""),
        e = function (p, o) {
            return o.method.apply(this, [p].concat(o.args))
        },
        a = function (q, u) {
            var o = [],
                r = 0,
                t = q.length,
                s, p = u !== ">";
            for (; r < t; r++) {
                s = q[r];
                if (s.getRefItems) {
                    o = o.concat(s.getRefItems(p))
                }
            }
            return o
        },
        f = function (p) {
            var o = [],
                q = 0,
                s = p.length,
                r;
            for (; q < s; q++) {
                r = p[q];
                while ( !! (r = (r.ownerCt || r.floatParent))) {
                    o.push(r)
                }
            }
            return o
        },
        m = function (p, u, t) {
            if (u === "*") {
                return p.slice()
            } else {
                var o = [],
                    q = 0,
                    s = p.length,
                    r;
                for (; q < s; q++) {
                    r = p[q];
                    if (r.isXType(u, t)) {
                        o.push(r)
                    }
                }
                return o
            }
        },
        j = function (p, s) {
            var u = Ext.Array,
                o = [],
                q = 0,
                t = p.length,
                r;
            for (; q < t; q++) {
                r = p[q];
                if (r.el ? r.el.hasCls(s) : u.contains(r.initCls(), s)) {
                    o.push(r)
                }
            }
            return o
        },
        n = function (q, v, p, u) {
            var o = [],
                r = 0,
                t = q.length,
                s;
            for (; r < t; r++) {
                s = q[r];
                if (!u ? !! s[v] : (String(s[v]) === u)) {
                    o.push(s)
                } else {
                    if (s.config) {
                        if (!u ? !! s.config[v] : (String(s.config[v]) === u)) {
                            o.push(s)
                        }
                    }
                }
            }
            return o
        },
        d = function (p, t) {
            var o = [],
                q = 0,
                s = p.length,
                r;
            for (; q < s; q++) {
                r = p[q];
                if (r.getItemId() === t) {
                    o.push(r)
                }
            }
            return o
        },
        l = function (o, p, q) {
            return g.pseudos[p](o, q)
        },
        h = /^(\s?([>\^])\s?|\s|$)/,
        c = /^(#)?([\w\-]+|\*)(?:\((true|false)\))?/,
        b = [{
            re: /^\.([\w\-]+)(?:\((true|false)\))?/,
            method: m
        }, {
            re: /^(?:[\[](?:@)?([\w\-]+)\s?(?:(=|.=)\s?['"]?(.*?)["']?)?[\]])/,
            method: n
        }, {
            re: /^#([\w\-]+)/,
            method: d
        }, {
            re: /^\:([\w\-]+)(?:\(((?:\{[^\}]+\})|(?:(?!\{)[^\s>\/]*?(?!\})))\))?/,
            method: l
        }, {
            re: /^(?:\{([^\}]+)\})/,
            method: k
        }];
    g.Query = Ext.extend(Object, {
        constructor: function (o) {
            o = o || {};
            Ext.apply(this, o)
        },
        execute: function (p) {
            var r = this.operations,
                s = 0,
                t = r.length,
                q, o;
            if (!p) {
                o = Ext.ComponentManager.all.getArray()
            } else {
                if (Ext.isArray(p)) {
                    o = p
                }
            }
            for (; s < t; s++) {
                q = r[s];
                if (q.mode === "^") {
                    o = f(o || [p])
                } else {
                    if (q.mode) {
                        o = a(o || [p], q.mode)
                    } else {
                        o = e(o || a([p]), q)
                    }
                }
                if (s === t - 1) {
                    return o
                }
            }
            return []
        },
        is: function (q) {
            var p = this.operations,
                t = Ext.isArray(q) ? q : [q],
                o = t.length,
                u = p[p.length - 1],
                s, r;
            t = e(t, u);
            if (t.length === o) {
                if (p.length > 1) {
                    for (r = 0, s = t.length; r < s; r++) {
                        if (Ext.Array.indexOf(this.execute(), t[r]) === -1) {
                            return false
                        }
                    }
                }
                return true
            }
            return false
        }
    });
    Ext.apply(this, {
        cache: {},
        pseudos: {
            not: function (u, o) {
                var v = Ext.ComponentQuery,
                    s = 0,
                    t = u.length,
                    r = [],
                    q = -1,
                    p;
                for (; s < t; ++s) {
                    p = u[s];
                    if (!v.is(p, o)) {
                        r[++q] = p
                    }
                }
                return r
            }
        },
        query: function (p, w) {
            var x = p.split(","),
                o = x.length,
                q = 0,
                r = [],
                y = [],
                v = {},
                t, s, u;
            for (; q < o; q++) {
                p = Ext.String.trim(x[q]);
                t = this.parse(p);
                r = r.concat(t.execute(w))
            }
            if (o > 1) {
                s = r.length;
                for (q = 0; q < s; q++) {
                    u = r[q];
                    if (!v[u.id]) {
                        y.push(u);
                        v[u.id] = true
                    }
                }
                r = y
            }
            return r
        },
        is: function (p, o) {
            if (!o) {
                return true
            }
            var q = this.cache[o];
            if (!q) {
                this.cache[o] = q = this.parse(o)
            }
            return q.is(p)
        },
        parse: function (r) {
            var p = [],
                q = b.length,
                v, s, w, x, y, t, u, o;
            while (r && v !== r) {
                v = r;
                s = r.match(c);
                if (s) {
                    w = s[1];
                    if (w === "#") {
                        p.push({
                            method: d,
                            args: [Ext.String.trim(s[2])]
                        })
                    } else {
                        if (w === ".") {
                            p.push({
                                method: j,
                                args: [Ext.String.trim(s[2])]
                            })
                        } else {
                            p.push({
                                method: m,
                                args: [Ext.String.trim(s[2]), Boolean(s[3])]
                            })
                        }
                    }
                    r = r.replace(s[0], "")
                }
                while (!(x = r.match(h))) {
                    for (t = 0; r && t < q; t++) {
                        u = b[t];
                        y = r.match(u.re);
                        o = u.method;
                        if (y) {
                            p.push({
                                method: Ext.isString(u.method) ? Ext.functionFactory("items", Ext.String.format.apply(Ext.String, [o].concat(y.slice(1)))) : u.method,
                                args: y.slice(1)
                            });
                            r = r.replace(y[0], "");
                            break
                        }
                    }
                }
                if (x[1]) {
                    p.push({
                        mode: x[2] || x[1]
                    });
                    r = r.replace(x[0], "")
                }
            }
            return new g.Query({
                operations: p
            })
        }
    })
});
Ext.define("Ext.event.publisher.ComponentDelegation", {
    extend: "Ext.event.publisher.Publisher",
    requires: ["Ext.Component", "Ext.ComponentQuery"],
    targetType: "component",
    optimizedSelectorRegex: /^#([\w\-]+)((?:[\s]*)>(?:[\s]*)|(?:\s*))([\w\-]+)$/i,
    handledEvents: ["*"],
    getSubscribers: function (b, a) {
        var d = this.subscribers,
            c = d[b];
        if (!c && a) {
            c = d[b] = {
                type: {
                    $length: 0
                },
                selector: [],
                $length: 0
            }
        }
        return c
    },
    subscribe: function (g, f) {
        if (this.idSelectorRegex.test(g)) {
            return false
        }
        var e = g.match(this.optimizedSelectorRegex),
            a = this.getSubscribers(f, true),
            l = a.type,
            c = a.selector,
            d, j, k, b, h;
        if (e !== null) {
            d = e[1];
            j = e[2].indexOf(">") === -1;
            k = e[3];
            b = l[k];
            if (!b) {
                l[k] = b = {
                    descendents: {
                        $length: 0
                    },
                    children: {
                        $length: 0
                    },
                    $length: 0
                }
            }
            h = j ? b.descendents : b.children;
            if (h.hasOwnProperty(d)) {
                h[d]++;
                return true
            }
            h[d] = 1;
            h.$length++;
            b.$length++;
            l.$length++
        } else {
            if (c.hasOwnProperty(g)) {
                c[g]++;
                return true
            }
            c[g] = 1;
            c.push(g)
        }
        a.$length++;
        return true
    },
    unsubscribe: function (g, f, l) {
        var a = this.getSubscribers(f);
        if (!a) {
            return false
        }
        var e = g.match(this.optimizedSelectorRegex),
            m = a.type,
            c = a.selector,
            d, j, k, b, h;
        l = Boolean(l);
        if (e !== null) {
            d = e[1];
            j = e[2].indexOf(">") === -1;
            k = e[3];
            b = m[k];
            if (!b) {
                return true
            }
            h = j ? b.descendents : b.children;
            if (!h.hasOwnProperty(d) || (!l && --h[d] > 0)) {
                return true
            }
            delete h[d];
            h.$length--;
            b.$length--;
            m.$length--
        } else {
            if (!c.hasOwnProperty(g) || (!l && --c[g] > 0)) {
                return true
            }
            delete c[g];
            Ext.Array.remove(c, g)
        }
        if (--a.$length === 0) {
            delete this.subscribers[f]
        }
        return true
    },
    notify: function (d, a) {
        var c = this.getSubscribers(a),
            e, b;
        if (!c || c.$length === 0) {
            return false
        }
        e = d.substr(1);
        b = Ext.ComponentManager.get(e);
        if (b) {
            this.dispatcher.doAddListener(this.targetType, d, a, "publish", this, {
                args: [a, b]
            }, "before")
        }
    },
    matchesSelector: function (b, a) {
        return Ext.ComponentQuery.is(b, a)
    },
    dispatch: function (d, b, c, a) {
        this.dispatcher.doDispatchEvent(this.targetType, d, b, c, null, a)
    },
    publish: function (g, k) {
        var e = this.getSubscribers(g);
        if (!e) {
            return
        }
        var p = arguments[arguments.length - 1],
            o = e.type,
            b = e.selector,
            d = Array.prototype.slice.call(arguments, 2, -2),
            l = k.xtypesChain,
            s, n, t, a, m, v, r, u, h, f, q, c;
        for (u = 0, h = l.length; u < h; u++) {
            f = l[u];
            e = o[f];
            if (e && e.$length > 0) {
                s = e.descendents;
                if (s.$length > 0) {
                    if (!a) {
                        a = k.getAncestorIds()
                    }
                    for (q = 0, c = a.length; q < c; q++) {
                        m = a[q];
                        if (s.hasOwnProperty(m)) {
                            this.dispatch("#" + m + " " + f, g, d, p)
                        }
                    }
                }
                n = e.children;
                if (n.$length > 0) {
                    if (!t) {
                        if (a) {
                            t = a[0]
                        } else {
                            v = k.getParent();
                            if (v) {
                                t = v.getId()
                            }
                        }
                    }
                    if (t) {
                        if (n.hasOwnProperty(t)) {
                            this.dispatch("#" + t + " > " + f, g, d, p)
                        }
                    }
                }
            }
        }
        h = b.length;
        if (h > 0) {
            for (u = 0; u < h; u++) {
                r = b[u];
                if (this.matchesSelector(k, r)) {
                    this.dispatch(r, g, d, p)
                }
            }
        }
    }
});
Ext.define("Ext.event.publisher.ComponentPaint", {
    extend: "Ext.event.publisher.Publisher",
    targetType: "component",
    handledEvents: ["painted", "erased"],
    eventNames: {
        painted: "painted",
        erased: "erased"
    },
    constructor: function () {
        this.callParent(arguments);
        this.hiddenQueue = {};
        this.renderedQueue = {}
    },
    getSubscribers: function (b, a) {
        var c = this.subscribers;
        if (!c.hasOwnProperty(b)) {
            if (!a) {
                return null
            }
            c[b] = {
                $length: 0
            }
        }
        return c[b]
    },
    setDispatcher: function (a) {
        var b = this.targetType;
        a.doAddListener(b, "*", "renderedchange", "onBeforeComponentRenderedChange", this, null, "before");
        a.doAddListener(b, "*", "hiddenchange", "onBeforeComponentHiddenChange", this, null, "before");
        a.doAddListener(b, "*", "renderedchange", "onComponentRenderedChange", this, null, "after");
        a.doAddListener(b, "*", "hiddenchange", "onComponentHiddenChange", this, null, "after");
        return this.callParent(arguments)
    },
    subscribe: function (d, a) {
        var b = d.match(this.idSelectorRegex),
            c, e;
        if (!b) {
            return false
        }
        e = b[1];
        c = this.getSubscribers(a, true);
        if (c.hasOwnProperty(e)) {
            c[e]++;
            return true
        }
        c[e] = 1;
        c.$length++;
        return true
    },
    unsubscribe: function (e, a, c) {
        var b = e.match(this.idSelectorRegex),
            d, f;
        if (!b || !(d = this.getSubscribers(a))) {
            return false
        }
        f = b[1];
        if (!d.hasOwnProperty(f) || (!c && --d[f] > 0)) {
            return true
        }
        delete d[f];
        if (--d.$length === 0) {
            delete this.subscribers[a]
        }
        return true
    },
    onBeforeComponentRenderedChange: function (b, d, g) {
        var f = this.eventNames,
            c = g ? f.painted : f.erased,
            e = this.getSubscribers(c),
            a;
        if (e && e.$length > 0) {
            this.renderedQueue[d.getId()] = a = [];
            this.publish(e, d, c, a)
        }
    },
    onBeforeComponentHiddenChange: function (c, d) {
        var f = this.eventNames,
            b = d ? f.erased : f.painted,
            e = this.getSubscribers(b),
            a;
        if (e && e.$length > 0) {
            this.hiddenQueue[c.getId()] = a = [];
            this.publish(e, c, b, a)
        }
    },
    onComponentRenderedChange: function (b, c) {
        var d = this.renderedQueue,
            e = c.getId(),
            a;
        if (!d.hasOwnProperty(e)) {
            return
        }
        a = d[e];
        delete d[e];
        if (a.length > 0) {
            this.dispatchQueue(a)
        }
    },
    onComponentHiddenChange: function (c) {
        var b = this.hiddenQueue,
            d = c.getId(),
            a;
        if (!b.hasOwnProperty(d)) {
            return
        }
        a = b[d];
        delete b[d];
        if (a.length > 0) {
            this.dispatchQueue(a)
        }
    },
    dispatchQueue: function (g) {
        var l = this.dispatcher,
            a = this.targetType,
            b = this.eventNames,
            e = g.slice(),
            f = e.length,
            c, k, h, d, j;
        g.length = 0;
        if (f > 0) {
            for (c = 0; c < f; c++) {
                k = e[c];
                h = k.component;
                d = k.eventName;
                j = h.isPainted();
                if ((d === b.painted && j) || d === b.erased && !j) {
                    l.doDispatchEvent(a, "#" + k.id, d, [h])
                }
            }
            e.length = 0
        }
    },
    publish: function (a, k, f, j) {
        var c = k.getId(),
            b = false,
            d, h, e, g, l;
        if (a[c]) {
            d = this.eventNames;
            l = k.isPainted();
            if ((f === d.painted && !l) || f === d.erased && l) {
                b = true
            } else {
                return this
            }
        }
        if (k.isContainer) {
            h = k.getItems().items;
            for (e = 0, g = h.length; e < g; e++) {
                this.publish(a, h[e], f, j)
            }
        } else {
            if (k.isDecorator) {
                this.publish(a, k.getComponent(), f, j)
            }
        }
        if (b) {
            j.push({
                id: c,
                eventName: f,
                component: k
            })
        }
    }
});
Ext.define("Ext.event.publisher.ComponentSize", {
    extend: "Ext.event.publisher.Publisher",
    requires: ["Ext.ComponentManager", "Ext.util.SizeMonitor"],
    targetType: "component",
    handledEvents: ["resize"],
    constructor: function () {
        this.callParent(arguments);
        this.sizeMonitors = {}
    },
    subscribe: function (g) {
        var c = g.match(this.idSelectorRegex),
            f = this.subscribers,
            a = this.sizeMonitors,
            d = this.dispatcher,
            e = this.targetType,
            b;
        if (!c) {
            return false
        }
        if (!f.hasOwnProperty(g)) {
            f[g] = 0;
            d.addListener(e, g, "painted", "onComponentPainted", this, null, "before");
            b = Ext.ComponentManager.get(c[1]);
            a[g] = new Ext.util.SizeMonitor({
                element: b.element,
                callback: this.onComponentSizeChange,
                scope: this,
                args: [this, g]
            })
        }
        f[g]++;
        return true
    },
    unsubscribe: function (h, b, e) {
        var c = h.match(this.idSelectorRegex),
            g = this.subscribers,
            d = this.dispatcher,
            f = this.targetType,
            a = this.sizeMonitors;
        if (!c) {
            return false
        }
        if (!g.hasOwnProperty(h) || (!e && --g[h] > 0)) {
            return true
        }
        a[h].destroy();
        delete a[h];
        d.removeListener(f, h, "painted", "onComponentPainted", this, "before");
        delete g[h];
        return true
    },
    onComponentPainted: function (b) {
        var c = b.getObservableId(),
            a = this.sizeMonitors[c];
        a.refresh()
    },
    onComponentSizeChange: function (a, b) {
        this.dispatcher.doDispatchEvent(this.targetType, b, "resize", [a])
    }
});
Ext.define("Ext.fx.runner.Css", {
    extend: "Ext.Evented",
    requires: ["Ext.fx.Animation"],
    prefixedProperties: {
        transform: true,
        "transform-origin": true,
        perspective: true,
        "transform-style": true,
        transition: true,
        "transition-property": true,
        "transition-duration": true,
        "transition-timing-function": true,
        "transition-delay": true,
        animation: true,
        "animation-name": true,
        "animation-duration": true,
        "animation-iteration-count": true,
        "animation-direction": true,
        "animation-timing-function": true,
        "animation-delay": true
    },
    lengthProperties: {
        top: true,
        right: true,
        bottom: true,
        left: true,
        width: true,
        height: true,
        "max-height": true,
        "max-width": true,
        "min-height": true,
        "min-width": true,
        "margin-bottom": true,
        "margin-left": true,
        "margin-right": true,
        "margin-top": true,
        "padding-bottom": true,
        "padding-left": true,
        "padding-right": true,
        "padding-top": true,
        "border-bottom-width": true,
        "border-left-width": true,
        "border-right-width": true,
        "border-spacing": true,
        "border-top-width": true,
        "border-width": true,
        "outline-width": true,
        "letter-spacing": true,
        "line-height": true,
        "text-indent": true,
        "word-spacing": true,
        "font-size": true,
        translate: true,
        translateX: true,
        translateY: true,
        translateZ: true,
        translate3d: true
    },
    durationProperties: {
        "transition-duration": true,
        "transition-delay": true,
        "animation-duration": true,
        "animation-delay": true
    },
    angleProperties: {
        rotate: true,
        rotateX: true,
        rotateY: true,
        rotateZ: true,
        skew: true,
        skewX: true,
        skewY: true
    },
    lengthUnitRegex: /([a-z%]*)$/,
    DEFAULT_UNIT_LENGTH: "px",
    DEFAULT_UNIT_ANGLE: "deg",
    DEFAULT_UNIT_DURATION: "ms",
    formattedNameCache: {},
    constructor: function () {
        var a = Ext.feature.has.Css3dTransforms;
        if (a) {
            this.transformMethods = ["translateX", "translateY", "translateZ", "rotate", "rotateX", "rotateY", "rotateZ", "skewX", "skewY", "scaleX", "scaleY", "scaleZ"]
        } else {
            this.transformMethods = ["translateX", "translateY", "rotate", "skewX", "skewY", "scaleX", "scaleY"]
        }
        this.vendorPrefix = Ext.browser.getStyleDashPrefix();
        this.ruleStylesCache = {};
        return this
    },
    getStyleSheet: function () {
        var c = this.styleSheet,
            a, b;
        if (!c) {
            a = document.createElement("style");
            a.type = "text/css";
            (document.head || document.getElementsByTagName("head")[0]).appendChild(a);
            b = document.styleSheets;
            this.styleSheet = c = b[b.length - 1]
        }
        return c
    },
    applyRules: function (j) {
        var g = this.getStyleSheet(),
            l = this.ruleStylesCache,
            k = g.cssRules,
            c, e, h, b, d, a, f;
        for (c in j) {
            e = j[c];
            h = l[c];
            if (h === undefined) {
                d = k.length;
                g.insertRule(c + "{}", d);
                h = l[c] = k.item(d).style
            }
            b = h.$cache;
            if (!b) {
                b = h.$cache = {}
            }
            for (a in e) {
                f = this.formatValue(e[a], a);
                a = this.formatName(a);
                if (b[a] !== f) {
                    b[a] = f;
                    if (f === null) {
                        h.removeProperty(a)
                    } else {
                        h.setProperty(a, f, "important")
                    }
                }
            }
        }
        return this
    },
    applyStyles: function (d) {
        var g, c, f, b, a, e;
        for (g in d) {
            c = document.getElementById(g);
            if (!c) {
                return this
            }
            f = c.style;
            b = d[g];
            for (a in b) {
                e = this.formatValue(b[a], a);
                a = this.formatName(a);
                if (e === null) {
                    f.removeProperty(a)
                } else {
                    f.setProperty(a, e, "important")
                }
            }
        }
        return this
    },
    formatName: function (b) {
        var a = this.formattedNameCache,
            c = a[b];
        if (!c) {
            if (this.prefixedProperties[b]) {
                c = this.vendorPrefix + b
            } else {
                c = b
            }
            a[b] = c
        }
        return c
    },
    formatValue: function (j, b) {
        var g = typeof j,
            l = this.DEFAULT_UNIT_LENGTH,
            e, a, d, f, c, k, h;
        if (g == "string") {
            if (this.lengthProperties[b]) {
                h = j.match(this.lengthUnitRegex)[1];
                if (h.length > 0) {} else {
                    return j + l
                }
            }
            return j
        } else {
            if (g == "number") {
                if (j == 0) {
                    return "0"
                }
                if (this.lengthProperties[b]) {
                    return j + l
                }
                if (this.angleProperties[b]) {
                    return j + this.DEFAULT_UNIT_ANGLE
                }
                if (this.durationProperties[b]) {
                    return j + this.DEFAULT_UNIT_DURATION
                }
            } else {
                if (b === "transform") {
                    e = this.transformMethods;
                    c = [];
                    for (d = 0, f = e.length; d < f; d++) {
                        a = e[d];
                        c.push(a + "(" + this.formatValue(j[a], a) + ")")
                    }
                    return c.join(" ")
                } else {
                    if (Ext.isArray(j)) {
                        k = [];
                        for (d = 0, f = j.length; d < f; d++) {
                            k.push(this.formatValue(j[d], b))
                        }
                        return (k.length > 0) ? k.join(", ") : "none"
                    }
                }
            }
        }
        return j
    }
});
Ext.define("Ext.fx.runner.CssTransition", {
    extend: "Ext.fx.runner.Css",
    listenersAttached: false,
    constructor: function () {
        this.runningAnimationsData = {};
        return this.callParent(arguments)
    },
    attachListeners: function () {
        this.listenersAttached = true;
        this.getEventDispatcher().addListener("element", "*", "transitionend", "onTransitionEnd", this)
    },
    onTransitionEnd: function (b) {
        var a = b.target,
            c = a.id;
        if (c && this.runningAnimationsData.hasOwnProperty(c)) {
            this.refreshRunningAnimationsData(Ext.get(a), [b.browserEvent.propertyName])
        }
    },
    onAnimationEnd: function (g, f, d, j, n) {
        var b = g.getId(),
            k = this.runningAnimationsData[b],
            c = k.nameMap,
            o = {},
            m = {},
            h, e, l, a;
        o[b] = m;
        if (f.onBeforeEnd) {
            f.onBeforeEnd.call(f.scope || this, g, j)
        }
        d.fireEvent("animationbeforeend", d, g, j);
        this.fireEvent("animationbeforeend", this, d, g, j);
        if (n || (!j && !f.preserveEndState)) {
            h = f.toPropertyNames;
            for (e = 0, l = h.length; e < l; e++) {
                a = h[e];
                if (!c.hasOwnProperty(a)) {
                    m[a] = null
                }
            }
        }
        if (f.after) {
            Ext.merge(m, f.after)
        }
        this.applyStyles(o);
        if (f.onEnd) {
            f.onEnd.call(f.scope || this, g, j)
        }
        d.fireEvent("animationend", d, g, j);
        this.fireEvent("animationend", this, d, g, j)
    },
    onAllAnimationsEnd: function (b) {
        var c = b.getId(),
            a = {};
        delete this.runningAnimationsData[c];
        a[c] = {
            "transition-property": null,
            "transition-duration": null,
            "transition-timing-function": null,
            "transition-delay": null
        };
        this.applyStyles(a);
        this.fireEvent("animationallend", this, b)
    },
    hasRunningAnimations: function (a) {
        var c = a.getId(),
            b = this.runningAnimationsData;
        return b.hasOwnProperty(c) && b[c].sessions.length > 0
    },
    refreshRunningAnimationsData: function (d, k, t, p) {
        var g = d.getId(),
            q = this.runningAnimationsData,
            a = q[g],
            m = a.nameMap,
            s = a.nameList,
            b = a.sessions,
            f, h, e, u, l, c, r, o, n = false;
        t = Boolean(t);
        p = Boolean(p);
        if (!b) {
            return this
        }
        f = b.length;
        if (f === 0) {
            return this
        }
        if (p) {
            a.nameMap = {};
            s.length = 0;
            for (l = 0; l < f; l++) {
                c = b[l];
                this.onAnimationEnd(d, c.data, c.animation, t, p)
            }
            b.length = 0
        } else {
            for (l = 0; l < f; l++) {
                c = b[l];
                r = c.map;
                o = c.list;
                for (h = 0, e = k.length; h < e; h++) {
                    u = k[h];
                    if (r[u]) {
                        delete r[u];
                        Ext.Array.remove(o, u);
                        c.length--;
                        if (--m[u] == 0) {
                            delete m[u];
                            Ext.Array.remove(s, u)
                        }
                    }
                }
                if (c.length == 0) {
                    b.splice(l, 1);
                    l--;
                    f--;
                    n = true;
                    this.onAnimationEnd(d, c.data, c.animation, t)
                }
            }
        }
        if (!p && !t && b.length == 0 && n) {
            this.onAllAnimationsEnd(d)
        }
    },
    getRunningData: function (b) {
        var a = this.runningAnimationsData;
        if (!a.hasOwnProperty(b)) {
            a[b] = {
                nameMap: {},
                nameList: [],
                sessions: []
            }
        }
        return a[b]
    },
    getTestElement: function () {
        var c = this.testElement,
            b, d, a;
        if (!c) {
            b = document.createElement("iframe");
            a = b.style;
            a.setProperty("visibility", "hidden", "important");
            a.setProperty("width", "0px", "important");
            a.setProperty("height", "0px", "important");
            a.setProperty("position", "absolute", "important");
            a.setProperty("border", "0px", "important");
            a.setProperty("zIndex", "-1000", "important");
            document.body.appendChild(b);
            d = b.contentDocument;
            d.open();
            d.writeln("</body>");
            d.close();
            this.testElement = c = d.createElement("div");
            c.style.setProperty("position", "absolute", "!important");
            d.body.appendChild(c);
            this.testElementComputedStyle = window.getComputedStyle(c)
        }
        return c
    },
    getCssStyleValue: function (b, e) {
        var d = this.getTestElement(),
            a = this.testElementComputedStyle,
            c = d.style;
        c.setProperty(b, e);
        e = a.getPropertyValue(b);
        c.removeProperty(b);
        return e
    },
    run: function (o) {
        var E = this,
            h = this.lengthProperties,
            w = {},
            D = {},
            F = {},
            d, r, x, e, t, H, u, p, q, a, z, y, n, A, l, s, g, B, G, k, f, v, m, c, C, b;
        if (!this.listenersAttached) {
            this.attachListeners()
        }
        o = Ext.Array.from(o);
        for (z = 0, n = o.length; z < n; z++) {
            A = o[z];
            A = Ext.factory(A, Ext.fx.Animation);
            d = A.getElement();
            g = window.getComputedStyle(d.dom);
            r = d.getId();
            F = Ext.merge({}, A.getData());
            if (A.onBeforeStart) {
                A.onBeforeStart.call(A.scope || this, d);
                A.fireEvent("animationstart", A);
                this.fireEvent("animationstart", this, A)
            }
            F[r] = F;
            t = F.before;
            x = F.from;
            e = F.to;
            F.fromPropertyNames = H = [];
            F.toPropertyNames = u = [];
            for (G in e) {
                if (e.hasOwnProperty(G)) {
                    e[G] = k = this.formatValue(e[G], G);
                    B = this.formatName(G);
                    m = h.hasOwnProperty(G);
                    if (!m) {
                        k = this.getCssStyleValue(B, k)
                    }
                    if (x.hasOwnProperty(G)) {
                        x[G] = v = this.formatValue(x[G], G);
                        if (!m) {
                            v = this.getCssStyleValue(B, v)
                        }
                        if (k !== v) {
                            H.push(B);
                            u.push(B)
                        }
                    } else {
                        f = g.getPropertyValue(B);
                        if (k !== f) {
                            u.push(B)
                        }
                    }
                }
            }
            l = u.length;
            if (l === 0) {
                this.onAnimationEnd(d, F, A);
                continue
            }
            a = this.getRunningData(r);
            b = a.sessions;
            if (b.length > 0) {
                this.refreshRunningAnimationsData(d, Ext.Array.merge(H, u), true, F.replacePrevious)
            }
            c = a.nameMap;
            C = a.nameList;
            s = {};
            for (y = 0; y < l; y++) {
                G = u[y];
                s[G] = true;
                if (!c.hasOwnProperty(G)) {
                    c[G] = 1;
                    C.push(G)
                } else {
                    c[G]++
                }
            }
            b.push({
                element: d,
                map: s,
                list: u.slice(),
                length: l,
                data: F,
                animation: A
            });
            w[r] = x = Ext.apply(Ext.Object.chain(t), x);
            if (C.length > 0) {
                H = Ext.Array.difference(C, H);
                u = Ext.Array.merge(H, u);
                x["transition-property"] = H
            }
            D[r] = e = Ext.Object.chain(e);
            e["transition-property"] = u;
            e["transition-duration"] = F.duration;
            e["transition-timing-function"] = F.easing;
            e["transition-delay"] = F.delay;
            A.startTime = Date.now()
        }
        q = this.$className;
        this.applyStyles(w);
        p = function (j) {
            if (j.data === q && j.source === window) {
                window.removeEventListener("message", p, false);
                E.applyStyles(D)
            }
        };
        window.addEventListener("message", p, false);
        window.postMessage(q, "*")
    }
});
Ext.define("Ext.fx.Runner", {
    requires: ["Ext.fx.runner.CssTransition"],
    constructor: function () {
        return new Ext.fx.runner.CssTransition()
    }
});
Ext.define("Ext.viewport.Default", {
    extend: "Ext.Container",
    xtype: "viewport",
    PORTRAIT: "portrait",
    LANDSCAPE: "landscape",
    requires: ["Ext.LoadMask"],
    config: {
        autoMaximize: false,
        preventPanning: true,
        preventZooming: true,
        autoRender: true,
        layout: "card",
        width: "100%",
        height: "100%"
    },
    isReady: false,
    isViewport: true,
    isMaximizing: false,
    id: "ext-viewport",
    isInputRegex: /^(input|textarea|select|a)$/i,
    focusedElement: null,
    fullscreenItemCls: Ext.baseCSSPrefix + "fullscreen",
    constructor: function (a) {
        var b = Ext.Function.bind;
        this.doPreventPanning = b(this.doPreventPanning, this);
        this.doPreventZooming = b(this.doPreventZooming, this);
        this.maximizeOnEvents = ["ready", "orientationchange"];
        this.orientation = this.determineOrientation();
        this.windowWidth = this.getWindowWidth();
        this.windowHeight = this.getWindowHeight();
        this.windowOuterHeight = this.getWindowOuterHeight();
        if (!this.stretchHeights) {
            this.stretchHeights = {}
        }
        this.callParent([a]);
        if (this.supportsOrientation()) {
            this.addWindowListener("orientationchange", b(this.onOrientationChange, this))
        } else {
            this.addWindowListener("resize", b(this.onResize, this))
        }
        document.addEventListener("focus", b(this.onElementFocus, this), true);
        document.addEventListener("blur", b(this.onElementBlur, this), true);
        Ext.onDocumentReady(this.onDomReady, this);
        this.on("ready", this.onReady, this, {
            single: true
        });
        this.getEventDispatcher().addListener("component", "*", "fullscreen", "onItemFullscreenChange", this);
        return this
    },
    onDomReady: function () {
        this.isReady = true;
        this.fireEvent("ready", this)
    },
    onReady: function () {
        if (this.getAutoRender()) {
            this.render()
        }
    },
    onElementFocus: function (a) {
        this.focusedElement = a.target
    },
    onElementBlur: function () {
        this.focusedElement = null
    },
    render: function () {
        if (!this.rendered) {
            var a = Ext.getBody(),
                b = Ext.baseCSSPrefix,
                h = [],
                d = Ext.os,
                g = d.name.toLowerCase(),
                f = Ext.browser.name.toLowerCase(),
                e = d.version.getMajor(),
                c = this.getOrientation();
            this.renderTo(a);
            h.push(b + d.deviceType.toLowerCase());
            if (d.is.iPad) {
                h.push(b + "ipad")
            }
            h.push(b + g);
            h.push(b + f);
            if (e) {
                h.push(b + g + "-" + e)
            }
            if (d.is.BlackBerry) {
                h.push(b + "bb")
            }
            if (Ext.browser.is.Standalone) {
                h.push(b + "standalone")
            }
            h.push(b + c);
            a.addCls(h)
        }
    },
    applyAutoMaximize: function (a) {
        if (a) {
            this.on("ready", "doAutoMaximizeOnReady", this, {
                single: true
            });
            this.on("orientationchange", "doAutoMaximizeOnOrientationChange", this)
        } else {
            this.un("ready", "doAutoMaximizeOnReady", this);
            this.un("orientationchange", "doAutoMaximizeOnOrientationChange", this)
        }
        return a
    },
    applyPreventPanning: function (a) {
        if (a) {
            this.addWindowListener("touchmove", this.doPreventPanning, false)
        } else {
            this.removeWindowListener("touchmove", this.doPreventPanning, false)
        }
        return a
    },
    applyPreventZooming: function (a) {
        var b = (Ext.feature.has.Touch) ? "touchstart" : "mousedown";
        if (a) {
            this.addWindowListener(b, this.doPreventZooming, false)
        } else {
            this.removeWindowListener(b, this.doPreventZooming, false)
        }
        return a
    },
    doAutoMaximizeOnReady: function () {
        var a = arguments[arguments.length - 1];
        a.pause();
        this.isMaximizing = true;
        this.on("maximize", function () {
            this.isMaximizing = false;
            this.updateSize();
            a.resume();
            this.fireEvent("ready", this)
        }, this, {
            single: true
        });
        this.maximize()
    },
    doAutoMaximizeOnOrientationChange: function () {
        var a = arguments[arguments.length - 1],
            b = a.firingArguments;
        a.pause();
        this.isMaximizing = true;
        this.on("maximize", function () {
            this.isMaximizing = false;
            this.updateSize();
            b[1] = this.windowWidth;
            b[2] = this.windowHeight;
            a.resume()
        }, this, {
            single: true
        });
        this.maximize()
    },
    doPreventPanning: function (a) {
        a.preventDefault()
    },
    doPreventZooming: function (b) {
        if ("button" in b && b.button !== 0) {
            return
        }
        var a = b.target;
        if (a && a.nodeType === 1 && !this.isInputRegex.test(a.tagName)) {
            b.preventDefault()
        }
    },
    addWindowListener: function (b, c, a) {
        window.addEventListener(b, c, Boolean(a))
    },
    removeWindowListener: function (b, c, a) {
        window.removeEventListener(b, c, Boolean(a))
    },
    doAddListener: function (a, d, c, b) {
        if (a === "ready" && this.isReady && !this.isMaximizing) {
            d.call(c);
            return this
        }
        this.mixins.observable.doAddListener.apply(this, arguments)
    },
    addDispatcherListener: function (b, d, g, f, c, a) {
        var e = this.getEventDispatcher();
        if (d === "resize" && b === this.getObservableId()) {
            return e.doAddListener(this.observableType, b, d, g, f, c, a)
        }
        return this.callParent(arguments)
    },
    removeDispatcherListener: function (b, c, f, e, a) {
        var d = this.getEventDispatcher();
        if (c === "resize" && b === this.getObservableId()) {
            return d.doRemoveListener(this.observableType, b, c, f, e, a)
        }
        return this.callParent(arguments)
    },
    supportsOrientation: function () {
        return Ext.feature.has.Orientation
    },
    onResize: function () {
        var c = this.windowWidth,
            f = this.windowHeight,
            e = this.getWindowWidth(),
            a = this.getWindowHeight(),
            d = this.getOrientation(),
            b = this.determineOrientation();
        if (c !== e || f !== a) {
            this.fireResizeEvent(e, a);
            if (d !== b) {
                this.fireOrientationChangeEvent(b, d)
            }
        }
    },
    fireResizeEvent: function (b, a) {
        this.updateSize(b, a);
        this.fireEvent("resize", this, b, a)
    },
    onOrientationChange: function () {
        var b = this.getOrientation(),
            a = this.determineOrientation();
        if (a !== b) {
            this.fireOrientationChangeEvent(a, b);
            this.fireResizeEvent(this.windowWidth, this.windowHeight)
        }
    },
    fireOrientationChangeEvent: function (b, c) {
        var a = Ext.baseCSSPrefix;
        Ext.getBody().replaceCls(a + c, a + b);
        this.orientation = b;
        this.updateSize();
        this.fireEvent("orientationchange", this, b, this.windowWidth, this.windowHeight)
    },
    updateSize: function (b, a) {
        this.windowWidth = b !== undefined ? b : this.getWindowWidth();
        this.windowHeight = a !== undefined ? a : this.getWindowHeight();
        return this
    },
    waitUntil: function (h, e, g, a, f) {
        if (!a) {
            a = 50
        }
        if (!f) {
            f = 2000
        }
        var c = this,
            b = 0;
        setTimeout(function d() {
            b += a;
            if (h.call(c) === true) {
                if (e) {
                    e.call(c)
                }
            } else {
                if (b >= f) {
                    if (g) {
                        g.call(c)
                    }
                } else {
                    setTimeout(d, a)
                }
            }
        }, a)
    },
    maximize: function () {
        this.fireMaximizeEvent()
    },
    fireMaximizeEvent: function () {
        this.updateSize();
        this.fireEvent("maximize", this)
    },
    doSetHeight: function (a) {
        Ext.getBody().setHeight(a);
        this.callParent(arguments)
    },
    doSetWidth: function (a) {
        Ext.getBody().setWidth(a);
        this.callParent(arguments)
    },
    scrollToTop: function () {
        window.scrollTo(0, -1)
    },
    getWindowWidth: function () {
        return window.innerWidth
    },
    getWindowHeight: function () {
        return window.innerHeight
    },
    getWindowOuterHeight: function () {
        return window.outerHeight
    },
    getWindowOrientation: function () {
        return window.orientation
    },
    getOrientation: function () {
        return this.orientation
    },
    getSize: function () {
        return {
            width: this.windowWidth,
            height: this.windowHeight
        }
    },
    determineOrientation: function () {
        var b = this.PORTRAIT,
            a = this.LANDSCAPE;
        if (this.supportsOrientation()) {
            if (this.getWindowOrientation() % 180 === 0) {
                return b
            }
            return a
        } else {
            if (this.getWindowHeight() >= this.getWindowWidth()) {
                return b
            }
            return a
        }
    },
    onItemFullscreenChange: function (a) {
        a.addCls(this.fullscreenItemCls);
        this.add(a)
    }
});
Ext.define("Ext.viewport.Ios", {
    extend: "Ext.viewport.Default",
    isFullscreen: function () {
        return this.isHomeScreen()
    },
    isHomeScreen: function () {
        return window.navigator.standalone === true
    },
    constructor: function () {
        this.callParent(arguments);
        if (this.getAutoMaximize() && !this.isFullscreen()) {
            this.addWindowListener("touchstart", Ext.Function.bind(this.onTouchStart, this))
        }
    },
    maximize: function () {
        if (this.isFullscreen()) {
            return this.callParent()
        }
        var c = this.stretchHeights,
            b = this.orientation,
            d = this.getWindowHeight(),
            a = c[b];
        if (window.scrollY > 0) {
            this.scrollToTop();
            if (!a) {
                c[b] = a = this.getWindowHeight()
            }
            this.setHeight(a);
            this.fireMaximizeEvent()
        } else {
            if (!a) {
                a = this.getScreenHeight()
            }
            this.setHeight(a);
            this.waitUntil(function () {
                this.scrollToTop();
                return d !== this.getWindowHeight()
            }, function () {
                if (!c[b]) {
                    a = c[b] = this.getWindowHeight();
                    this.setHeight(a)
                }
                this.fireMaximizeEvent()
            }, function () {})
        }
    },
    getScreenHeight: function () {
        return window.screen[this.orientation === this.PORTRAIT ? "height" : "width"]
    },
    onElementFocus: function () {
        if (this.getAutoMaximize() && !this.isFullscreen()) {
            clearTimeout(this.scrollToTopTimer)
        }
        this.callParent(arguments)
    },
    onElementBlur: function () {
        if (this.getAutoMaximize() && !this.isFullscreen()) {
            this.scrollToTopTimer = setTimeout(this.scrollToTop, 500)
        }
        this.callParent(arguments)
    },
    onTouchStart: function () {
        if (this.focusedElement === null) {
            this.scrollToTop()
        }
    },
    scrollToTop: function () {
        window.scrollTo(0, 0)
    }
}, function () {
    if (!Ext.os.is.iOS) {
        return
    }
    if (Ext.os.version.lt("3.2")) {
        this.override({
            constructor: function () {
                var a = this.stretchHeights = {};
                a[this.PORTRAIT] = 416;
                a[this.LANDSCAPE] = 268;
                return this.callOverridden(arguments)
            }
        })
    }
    if (Ext.os.version.lt("5")) {
        this.override({
            fieldMaskClsTest: "-field-mask",
            doPreventZooming: function (b) {
                var a = b.target;
                if (a && a.nodeType === 1 && !this.isInputRegex.test(a.tagName) && a.className.indexOf(this.fieldMaskClsTest) == -1) {
                    b.preventDefault()
                }
            }
        })
    }
    if (Ext.os.is.iPad) {
        this.override({
            isFullscreen: function () {
                return true
            }
        })
    }
});
Ext.define("Ext.viewport.Android", {
    extend: "Ext.viewport.Default",
    constructor: function () {
        this.on("orientationchange", "doFireOrientationChangeEvent", this, {
            prepend: true
        });
        this.on("orientationchange", "hideKeyboardIfNeeded", this, {
            prepend: true
        });
        return this.callParent(arguments)
    },
    hideKeyboardIfNeeded: function () {
        var a = arguments[arguments.length - 1],
            b = this.focusedElement;
        if (b) {
            delete this.focusedElement;
            a.pause();
            if (Ext.os.version.lt("4")) {
                b.style.display = "none"
            } else {
                b.blur()
            }
            setTimeout(function () {
                b.style.display = "";
                a.resume()
            }, 1000)
        }
    },
    doFireOrientationChangeEvent: function () {
        var a = arguments[arguments.length - 1];
        this.orientationChanging = true;
        a.pause();
        this.waitUntil(function () {
            return this.getWindowOuterHeight() !== this.windowOuterHeight
        }, function () {
            this.windowOuterHeight = this.getWindowOuterHeight();
            this.updateSize();
            a.firingArguments[1] = this.windowWidth;
            a.firingArguments[2] = this.windowHeight;
            a.resume();
            this.orientationChanging = false
        }, function () {});
        return this
    },
    applyAutoMaximize: function (a) {
        a = this.callParent();
        if (!a) {
            this.on("add", "fixSize", this, {
                single: true
            });
            this.onAfter("orientationchange", "fixSize", this)
        } else {
            this.un("ready", "doFixedSize", this);
            this.unAfter("orientationchange", "fixSize", this)
        }
    },
    fixSize: function () {
        this.doFixSize()
    },
    doFixSize: function () {
        this.setHeight(this.getWindowHeight())
    },
    maximize: function () {
        var c = this.stretchHeights,
            b = this.orientation,
            a;
        a = c[b];
        if (!a) {
            c[b] = a = Math.round(this.getWindowOuterHeight() / window.devicePixelRatio)
        }
        if (!this.addressBarHeight) {
            this.addressBarHeight = a - this.getWindowHeight()
        }
        this.setHeight(a);
        var d = Ext.Function.bind(this.isHeightMaximized, this, [a]);
        this.scrollToTop();
        this.waitUntil(d, this.fireMaximizeEvent, this.fireMaximizeEvent)
    },
    isHeightMaximized: function (a) {
        this.scrollToTop();
        return this.getWindowHeight() === a
    }
}, function () {
    if (!Ext.os.is.Android) {
        return
    }
    var a = Ext.os.version,
        b = Ext.browser.userAgent,
        c = /(htc|desire|incredible|ADR6300)/i.test(b) && a.lt("2.3");
    if (c) {
        this.override({
            constructor: function (d) {
                if (!d) {
                    d = {}
                }
                d.autoMaximize = false;
                this.watchDogTick = Ext.Function.bind(this.watchDogTick, this);
                setInterval(this.watchDogTick, 1000);
                return this.callParent([d])
            },
            watchDogTick: function () {
                this.watchDogLastTick = Ext.Date.now()
            },
            doPreventPanning: function () {
                var e = Ext.Date.now(),
                    f = this.watchDogLastTick,
                    d = e - f;
                if (d >= 2000) {
                    return
                }
                return this.callParent(arguments)
            },
            doPreventZooming: function () {
                var e = Ext.Date.now(),
                    f = this.watchDogLastTick,
                    d = e - f;
                if (d >= 2000) {
                    return
                }
                return this.callParent(arguments)
            }
        })
    }
    if (a.match("2")) {
        this.override({
            onReady: function () {
                this.addWindowListener("resize", Ext.Function.bind(this.onWindowResize, this));
                this.callParent(arguments)
            },
            scrollToTop: function () {
                document.body.scrollTop = 100
            },
            onWindowResize: function () {
                var e = this.windowWidth,
                    g = this.windowHeight,
                    f = this.getWindowWidth(),
                    d = this.getWindowHeight();
                if (this.getAutoMaximize() && !this.isMaximizing && !this.orientationChanging && window.scrollY === 0 && e === f && d < g && ((d >= g - this.addressBarHeight) || !this.focusedElement)) {
                    this.scrollToTop()
                }
            }
        })
    } else {
        if (a.gtEq("3.1")) {
            this.override({
                isHeightMaximized: function (d) {
                    this.scrollToTop();
                    return this.getWindowHeight() === d - 1
                }
            })
        } else {
            if (a.match("3")) {
                this.override({
                    isHeightMaximized: function () {
                        this.scrollToTop();
                        return true
                    }
                })
            }
        }
    }
});
Ext.define("Ext.viewport.Viewport", {
    requires: ["Ext.viewport.Ios", "Ext.viewport.Android"],
    constructor: function (b) {
        var c = Ext.os.name,
            d, a;
        switch (c) {
        case "Android":
            d = "Android";
            break;
        case "iOS":
            d = "Ios";
            break;
        default:
            d = "Default"
        }
        a = Ext.create("Ext.viewport." + d, b);
        return a
    }
});
Ext.define("Ext.app.History", {
    mixins: ["Ext.mixin.Observable"],
    config: {
        actions: [],
        updateUrl: true,
        token: ""
    },
    constructor: function (a) {
        if (Ext.feature.has.History) {
            window.addEventListener("hashchange", Ext.bind(this.detectStateChange, this))
        } else {
            setInterval(Ext.bind(this.detectStateChange, this), 50)
        }
        this.initConfig(a)
    },
    add: function (c, a) {
        this.getActions().push(Ext.factory(c, Ext.app.Action));
        var b = c.getUrl();
        if (this.getUpdateUrl()) {
            this.setToken(b);
            window.location.hash = b
        }
        if (a !== true) {
            this.fireEvent("change", b)
        }
        this.setToken(b)
    },
    back: function () {
        this.getActions().pop().run()
    },
    applyToken: function (a) {
        return a[0] == "#" ? a.substr(1) : a
    },
    detectStateChange: function () {
        var b = this.applyToken(window.location.hash),
            a = this.getToken();
        if (b != a) {
            this.onStateChange();
            this.setToken(b)
        }
    },
    onStateChange: function () {
        this.fireEvent("change", window.location.hash.substr(1))
    }
});
Ext.define("Ext.app.Profile", {
    mixins: {
        observable: "Ext.mixin.Observable"
    },
    config: {
        namespace: "auto",
        name: "auto",
        controllers: [],
        models: [],
        views: [],
        stores: [],
        application: null
    },
    constructor: function (a) {
        this.initConfig(a);
        this.mixins.observable.constructor.apply(this, arguments)
    },
    isActive: function () {
        return false
    },
    launch: Ext.emptyFn,
    applyNamespace: function (a) {
        if (a == "auto") {
            a = this.getName()
        }
        return a.toLowerCase()
    },
    applyName: function (a) {
        if (a == "auto") {
            var b = this.$className.split(".");
            a = b[b.length - 1]
        }
        return a
    },
    getDependencies: function () {
        var c = [],
            g = Ext.String.format,
            b = this.getApplication().getName(),
            d = this.getNamespace(),
            f = {
                model: this.getModels(),
                view: this.getViews(),
                controller: this.getControllers(),
                store: this.getStores()
            },
            e, h, a;
        for (e in f) {
            h = [];
            Ext.each(f[e], function (j) {
                if (Ext.isString(j)) {
                    if (j.match("\\.")) {
                        a = j
                    } else {
                        a = g("{0}.{1}.{2}.{3}", b, e, d, j)
                    }
                    h.push(a);
                    c.push(a)
                }
            });
            f[e] = h
        }
        f.all = c;
        return f
    }
});
Ext.define("Ext.app.Action", {
    config: {
        scope: null,
        application: null,
        controller: null,
        action: null,
        args: [],
        url: undefined,
        data: {},
        title: null,
        beforeFilters: [],
        currentFilterIndex: -1
    },
    constructor: function (a) {
        this.initConfig(a);
        this.getUrl()
    },
    execute: function () {
        this.resume()
    },
    resume: function () {
        var b = this.getCurrentFilterIndex() + 1,
            c = this.getBeforeFilters(),
            a = this.getController(),
            d = c[b];
        if (d) {
            this.setCurrentFilterIndex(b);
            d.call(a, this)
        } else {
            a[this.getAction()].apply(a, this.getArgs())
        }
    },
    applyUrl: function (a) {
        if (a === null || a === undefined) {
            a = this.urlEncode()
        }
        return a
    },
    applyController: function (a) {
        var c = this.getApplication(),
            b = c.getCurrentProfile();
        if (Ext.isString(a)) {
            a = c.getController(a, b ? b.getNamespace() : null)
        }
        return a
    },
    urlEncode: function () {
        var a = this.getController(),
            b;
        if (a instanceof Ext.app.Controller) {
            b = a.$className.split(".");
            a = b[b.length - 1]
        }
        return a + "/" + this.getAction()
    }
});
Ext.define("Ext.app.Route", {
    config: {
        conditions: {},
        url: null,
        controller: null,
        action: null,
        initialized: false
    },
    constructor: function (a) {
        this.initConfig(a)
    },
    recognize: function (b) {
        if (!this.getInitialized()) {
            this.initialize()
        }
        if (this.recognizes(b)) {
            var c = this.matchesFor(b),
                a = b.match(this.matcherRegex);
            a.shift();
            return Ext.applyIf(c, {
                controller: this.getController(),
                action: this.getAction(),
                historyUrl: b,
                args: a
            })
        }
    },
    initialize: function () {
        this.paramMatchingRegex = new RegExp(/:([0-9A-Za-z\_]*)/g);
        this.paramsInMatchString = this.getUrl().match(this.paramMatchingRegex) || [];
        this.matcherRegex = this.createMatcherRegex(this.getUrl());
        this.setInitialized(true)
    },
    recognizes: function (a) {
        return this.matcherRegex.test(a)
    },
    matchesFor: function (b) {
        var f = {},
            e = this.paramsInMatchString,
            a = b.match(this.matcherRegex),
            d = e.length,
            c;
        a.shift();
        for (c = 0; c < d; c++) {
            f[e[c].replace(":", "")] = a[c]
        }
        return f
    },
    argsFor: function (c) {
        var b = [],
            f = this.paramsInMatchString,
            a = c.match(this.matcherRegex),
            e = f.length,
            d;
        a.shift();
        for (d = 0; d < e; d++) {
            b.push(f[d].replace(":", ""));
            params[f[d].replace(":", "")] = a[d]
        }
        return params
    },
    urlFor: function (b) {
        var a = this.getUrl();
        for (var c in b) {
            a = a.replace(":" + c, b[c])
        }
        return a
    },
    createMatcherRegex: function (a) {
        var e = this.paramsInMatchString,
            d = e.length,
            b, c, f;
        for (b = 0; b < d; b++) {
            c = this.getConditions()[e[b]];
            f = Ext.util.Format.format("({0})", c || "[%a-zA-Z0-9-\\_\\s,]+");
            a = a.replace(new RegExp(e[b]), f)
        }
        return new RegExp("^" + a + "$")
    }
});
Ext.define("Ext.app.Router", {
    requires: ["Ext.app.Route"],
    config: {
        routes: [],
        defaults: {
            action: "index"
        }
    },
    constructor: function (a) {
        this.initConfig(a)
    },
    connect: function (b, c) {
        c = Ext.apply({
            url: b
        }, c || {}, this.getDefaults());
        var a = Ext.create("Ext.app.Route", c);
        this.getRoutes().push(a);
        return a
    },
    recognize: function (c) {
        var b = this.getRoutes(),
            e = b.length,
            d, a;
        for (d = 0; d < e; d++) {
            a = b[d].recognize(c);
            if (a !== undefined) {
                return a
            }
        }
        return undefined
    },
    draw: function (a) {
        a.call(this, this)
    },
    clear: function () {
        this.setRoutes([])
    }
}, function () {});
Ext.define("Ext.app.Application", {
    extend: "Ext.app.Controller",
    requires: ["Ext.app.History", "Ext.app.Profile", "Ext.app.Router", "Ext.app.Action"],
    config: {
        profiles: [],
        stores: [],
        controllers: [],
        models: [],
        views: [],
        history: {},
        name: null,
        appFolder: "app",
        router: {},
        controllerInstances: [],
        profileInstances: [],
        currentProfile: null,
        launch: Ext.emptyFn,
        enableLoader: true
    },
    constructor: function (a) {
        this.initConfig(a);
        for (var b in a) {
            this[b] = a[b]
        }
        if (this.getEnableLoader() !== false) {
            Ext.require(this.getProfiles(), this.onProfilesLoaded, this)
        }
    },
    dispatch: function (e, d) {
        e = e || {};
        Ext.applyIf(e, {
            application: this
        });
        e = Ext.factory(e, Ext.app.Action);
        if (e) {
            var c = this.getCurrentProfile(),
                b = c ? c.getNamespace() : undefined,
                a = this.getController(e.getController(), b);
            if (a) {
                if (d !== false) {
                    this.getHistory().add(e, true)
                }
                a.execute(e)
            }
        }
    },
    redirectTo: function (c) {
        if (Ext.data && Ext.data.Model && c instanceof Ext.data.Model) {
            var a = c;
            c = a.toUrl()
        }
        var b = this.getRouter().recognize(c);
        if (b) {
            b.url = c;
            if (a) {
                b.data = {};
                b.data.record = a
            }
            return this.dispatch(b)
        }
    },
    control: function (h, d) {
        d = d || this;
        var j = this.getEventDispatcher(),
            g = (d) ? d.getRefs() : {},
            c, e, b, f, a;
        for (c in h) {
            if (h.hasOwnProperty(c)) {
                f = h[c];
                a = g[c];
                if (a) {
                    c = a.selector || a
                }
                for (e in f) {
                    b = f[e];
                    if (Ext.isString(b)) {
                        b = d[b]
                    }
                    j.addListener("component", c, e, b, d)
                }
            }
        }
    },
    getController: function (b, d) {
        var f = this.getControllerInstances(),
            a = this.getName(),
            e = Ext.String.format,
            c;
        if (b instanceof Ext.app.Controller) {
            return b
        }
        if (f[b]) {
            return f[b]
        } else {
            c = e("{0}.controller.{1}", a, b);
            d = e("{0}.controller.{1}.{2}", a, d, b);
            return f[d] || f[c]
        }
    },
    onProfilesLoaded: function () {
        var b = this.getProfiles(),
            e = b.length,
            g = [],
            d = this.gatherDependencies(),
            f, c, a;
        for (c = 0; c < e; c++) {
            g[c] = Ext.create(b[c], {
                application: this
            });
            a = g[c].getDependencies();
            d = d.concat(a.all);
            if (g[c].isActive() && !f) {
                f = g[c];
                this.setCurrentProfile(f);
                this.setControllers(this.getControllers().concat(a.controller));
                this.setModels(this.getModels().concat(a.model));
                this.setViews(this.getViews().concat(a.view));
                this.setStores(this.getStores().concat(a.store))
            }
        }
        this.setProfileInstances(g);
        Ext.require(d, this.loadControllerDependencies, this)
    },
    loadControllerDependencies: function () {
        var h = this.getControllers(),
            f = h.length,
            d = [],
            b = this.getName(),
            g = Ext.String.format,
            a, e, c;
        for (c = 0; c < f; c++) {
            a = Ext.ClassManager.classes[h[c]];
            e = a.prototype;
            Ext.each(e.models, function (j) {
                d.push(g("{0}.model.{1}", b, j))
            }, this);
            Ext.each(e.views, function (j) {
                d.push(g("{0}.view.{1}", b, j))
            }, this);
            Ext.each(e.stores, function (j) {
                d.push(g("{0}.store.{1}", b, j));
                this.setStores(this.getStores().concat([j]))
            }, this)
        }
        Ext.require(d, this.onDependenciesLoaded, this)
    },
    onDependenciesLoaded: function () {
        var c = this,
            b = this.getCurrentProfile(),
            e = this.getLaunch(),
            d, a;
        c.instantiateStores();
        c.instantiateControllers();
        d = this.getControllerInstances();
        if (b) {
            b.launch()
        }
        e.call(c);
        for (a in d) {
            d[a].launch(this)
        }
        c.redirectTo(window.location.hash.substr(1))
    },
    gatherDependencies: function () {
        var a = this.getModels().concat(this.getViews()).concat(this.getControllers());
        Ext.each(this.getStores(), function (b) {
            if (Ext.isString(b)) {
                a.push(b)
            }
        }, this);
        return a
    },
    instantiateStores: function () {
        var b = this.getStores(),
            f = b.length,
            c, a, d, g, e;
        for (e = 0; e < f; e++) {
            c = b[e];
            if (Ext.data && Ext.data.Store && !(c instanceof Ext.data.Store)) {
                if (Ext.isString(c)) {
                    d = c;
                    a = Ext.ClassManager.classes[c];
                    c = {
                        xclass: c
                    };
                    if (a.prototype.defaultConfig.storeId === undefined) {
                        g = d.split(".");
                        c.id = g[g.length - 1]
                    }
                }
                b[e] = Ext.factory(c, Ext.data.Store)
            }
        }
        this.setStores(b)
    },
    instantiateControllers: function () {
        var e = this.getControllers(),
            d = {},
            c = e.length,
            a, b;
        for (b = 0; b < c; b++) {
            a = e[b];
            d[a] = Ext.create(a, {
                application: this
            });
            d[a].init()
        }
        return this.setControllerInstances(d)
    },
    applyControllers: function (e) {
        var d = e.length,
            a = this.getName(),
            b, c;
        for (c = 0; c < d; c++) {
            b = e[c];
            if (Ext.Loader.getPrefix(b) === "" || b === a) {
                e[c] = a + ".controller." + b
            }
        }
        return e
    },
    applyStores: function (b) {
        var e = b.length,
            a = this.getName(),
            c, d;
        for (d = 0; d < e; d++) {
            c = b[d];
            if (Ext.isString(c) && (Ext.Loader.getPrefix(c) === "" || c === a)) {
                b[d] = a + ".store." + c
            }
        }
        return b
    },
    applyModels: function (e) {
        var d = e.length,
            a = this.getName(),
            b, c;
        for (c = 0; c < d; c++) {
            b = e[c];
            if (Ext.isString(b) && (Ext.Loader.getPrefix(b) === "" || b === a)) {
                e[c] = a + ".model." + b
            }
        }
        return e
    },
    applyViews: function (b) {
        var e = b.length,
            a = this.getName(),
            c, d;
        for (d = 0; d < e; d++) {
            c = b[d];
            if (Ext.isString(c) && (Ext.Loader.getPrefix(c) === "" || c === a)) {
                b[d] = a + ".view." + c
            }
        }
        return b
    },
    applyProfiles: function (b) {
        var e = b.length,
            a = this.getName(),
            c, d;
        for (d = 0; d < e; d++) {
            c = b[d];
            if (Ext.isString(c) && (Ext.Loader.getPrefix(c) === "" || c === a)) {
                b[d] = a + ".profile." + c
            }
        }
        return b
    },
    applyName: function (a) {
        var b;
        if (a && a.match(/ /g)) {
            b = a;
            a = a.replace(/ /g, "")
        }
        return a
    },
    updateName: function (a) {
        Ext.ClassManager.setNamespace(a + ".app", this);
        if (!Ext.Loader.config.paths[a]) {
            Ext.Loader.setPath(a, this.getAppFolder())
        }
    },
    applyRouter: function (a) {
        return Ext.factory(a, Ext.app.Router, this.getRouter())
    },
    applyHistory: function (a) {
        var b = Ext.factory(a, Ext.app.History, this.getHistory());
        b.on("change", this.onHistoryChange, this);
        return b
    },
    onHistoryChange: function (a) {
        this.dispatch(this.getRouter().recognize(a), false)
    }
}, function () {});
Ext.define("Ext.data.ArrayStore", {
    extend: "Ext.data.Store",
    alias: "store.array",
    uses: ["Ext.data.reader.Array"],
    config: {
        proxy: {
            type: "memory",
            reader: "array"
        }
    },
    loadData: function (b, a) {
        this.callParent([b, a])
    }
}, function () {
    Ext.data.SimpleStore = Ext.data.ArrayStore
});
Ext.define("Ext.data.Batch", {
    mixins: {
        observable: "Ext.mixin.Observable"
    },
    config: {
        autoStart: false,
        pauseOnException: true,
        proxy: null
    },
    current: -1,
    total: 0,
    isRunning: false,
    isComplete: false,
    hasException: false,
    constructor: function (a) {
        var b = this;
        b.initConfig(a);
        b.operations = []
    },
    add: function (a) {
        this.total++;
        a.setBatch(this);
        this.operations.push(a)
    },
    start: function () {
        this.hasException = false;
        this.isRunning = true;
        this.runNextOperation()
    },
    runNextOperation: function () {
        this.runOperation(this.current + 1)
    },
    pause: function () {
        this.isRunning = false
    },
    runOperation: function (d) {
        var e = this,
            c = e.operations,
            b = c[d],
            a;
        if (b === undefined) {
            e.isRunning = false;
            e.isComplete = true;
            e.fireEvent("complete", e, c[c.length - 1])
        } else {
            e.current = d;
            a = function (f) {
                var g = f.hasException();
                if (g) {
                    e.hasException = true;
                    e.fireEvent("exception", e, f)
                } else {
                    e.fireEvent("operationcomplete", e, f)
                }
                if (g && e.getPauseOnException()) {
                    e.pause()
                } else {
                    f.setCompleted();
                    e.runNextOperation()
                }
            };
            b.setStarted();
            e.getProxy()[b.getAction()](b, a, e)
        }
    }
});
Ext.define("Ext.data.reader.Array", {
    extend: "Ext.data.reader.Json",
    alternateClassName: "Ext.data.ArrayReader",
    alias: "reader.array",
    config: {
        totalProperty: undefined,
        successProperty: undefined
    },
    getResponseData: function (a) {
        return a
    },
    createFieldAccessExpression: function (g, c, b) {
        var f = this,
            e = g.getMapping(),
            d = (e == null) ? f.getModel().getFields().indexOf(g) : e,
            a;
        if (typeof d === "function") {
            a = c + ".getMapping()(" + b + ", this)"
        } else {
            if (isNaN(d)) {
                d = '"' + d + '"'
            }
            a = b + "[" + d + "]"
        }
        return a
    }
});
Ext.define("Kitchensink.profile.Base", {
    extend: "Ext.app.Profile",
    launch: function () {
        var a = window.location.search.match(/(\?|&)bm/);
        if (a) {
            Ext.Animator.on({
                animationend: "onAnimationEnd",
                scope: this
            });
            this.benchmark = Ext.Viewport.add({
                style: "background-color: red; color: #FFF",
                bottom: 0,
                right: 0,
                zIndex: 1000
            })
        }
    },
    onAnimationEnd: function (a, f, c) {
        var b = (Date.now() - f.startTime) - f.getDuration(),
            e = this.benchmark,
            d;
        d = e.add({
            html: c.id + " <b>" + b + "</b>"
        });
        setTimeout(function () {
            d.destroy()
        }, 5000)
    }
});
Ext.define("Kitchensink.profile.Tablet", {
    extend: "Kitchensink.profile.Base",
    config: {
        controllers: ["Main"],
        views: ["Main"]
    },
    isActive: function () {
        return Ext.os.is.Tablet || Ext.os.is.Desktop
    },
    launch: function () {
        Ext.create("Kitchensink.view.tablet.Main");
        this.callParent()
    }
});
Ext.define("Kitchensink.profile.Phone", {
    extend: "Kitchensink.profile.Base",
    config: {
        controllers: ["Main"]
    },
    isActive: function () {
        return Ext.os.is.Phone
    },
    launch: function () {
        Ext.create("Kitchensink.view.phone.Main");
        this.callParent()
    }
});
Ext.define("Kitchensink.view.SourceOverlay", {
    extend: "Ext.Panel",
    xtype: "sourceoverlay",
    config: {
        cls: "ux-code x-panel",
        modal: true,
        styleHtmlContent: true,
        hideOnMaskTap: true,
        top: Ext.os.deviceType == "Phone" ? "10%" : "10%",
        left: Ext.os.deviceType == "Phone" ? "5%" : "10%",
        right: Ext.os.deviceType == "Phone" ? "5%" : "10%",
        bottom: Ext.os.deviceType == "Phone" ? "10%" : "10%",
        scrollable: true
    },
    applyHtml: function (d) {
        this.matches = [];
        var c = d,
            a = '<span class="ux-code-{0}">{1}</span>';
        var e = Ext.Function.bind(function (g, k) {
            for (var h = 0; h < this.matches.length; h++) {
                var f = this.matches[h],
                    j = f[0],
                    l = f[1];
                if ((j <= g && g < l) || (j < (g + k) && (g + k) <= l)) {
                    return true
                }
            }
            return false
        }, this);
        var b = Ext.Function.bind(function (n, p, r, o) {
            p.compile(p);
            var l;
            while (l = p.exec(n)) {
                var s = o ? o(l) : [l.index, l[0]],
                    j = s[0],
                    h = s[1];
                if (!e(j, h.length)) {
                    var f = Ext.util.Format.format(a, r, h),
                        q = (f.length - h.length);
                    n = n.slice(0, j) + f + n.slice(j + h.length);
                    p.lastIndex = j + f.length;
                    for (var k = 0; k < this.matches.length; k++) {
                        var g = this.matches[k];
                        if (g[1] < j) {
                            continue
                        }
                        g[0] += q;
                        g[1] += q
                    }
                    this.matches.push([j, p.lastIndex])
                }
            }
            return n
        }, this);
        c = c.replace(/</g, "&lt;");
        c = c.replace(/</g, "&gt;");
        c = b(c, /\/\*(.|\s)*?\*\//ig, "comment");
        c = b(c, (/("|')[^\1\n\r]*?\1/ig), "string");
        c = b(c, /\/\/[^\n\r]*/ig, "comment");
        c = b(c, /\d+\.?\d*/ig, "number");
        c = b(c, /(\w+)\s*\:\s*function/ig, "function", function (f) {
            return [f.index, f[1]]
        });
        c = b(c, /function (\w+)/ig, "function", function (f) {
            return [f.index + 9, f[1]]
        });
        c = b(c, /\b(this|function|null|return|true|false|new|int|float|break|const|continue|delete|do|while|for|in|switch|case|throw|try|catch|typeof|instanceof|var|void|with|yield|if|else)\b/ig, "keyword");
        c = b(c, /\.|\,|\:|\;|\=|\+|\-|\&|\%|\*|\/|\!|\?|\<|\>|\||\^|\~/ig, "operator");
        return "<pre>" + c + "</pre>"
    }
});
Ext.define("Kitchensink.view.Buttons", {
    extend: "Ext.Container",
    config: {
        layout: {
            type: "vbox",
            pack: "center",
            align: "stretch"
        },
        cls: "card1",
        defaults: {
            xtype: "container",
            flex: 1,
            layout: {
                type: "hbox",
                align: "middle"
            },
            defaults: {
                xtype: "button",
                flex: 1,
                margin: 10
            }
        },
        items: [{
            items: [{
                text: "Normal"
            }, {
                ui: "round",
                text: "Round"
            }, {
                ui: "small",
                text: "Small"
            }]
        }, {
            items: [{
                ui: "decline",
                text: "Decline"
            }, {
                ui: "decline-round",
                text: "Round"
            }, {
                ui: "decline-small",
                text: "Small"
            }]
        }, {
            items: Ext.os.deviceType.toLowerCase() == "phone" ? [{
                ui: "confirm",
                text: "Confirm"
            }, {
                ui: "confirm-round",
                text: "Round"
            }, {
                ui: "confirm-small",
                text: "Small"
            }] : [{
                ui: "confirm",
                text: "Confirm"
            }, {
                ui: "confirm-round",
                text: "Round"
            }, {
                ui: "confirm-small",
                text: "Small"
            }, {
                ui: "back",
                text: "Back"
            }]
        }]
    }
});
Ext.define("Kitchensink.view.Themes", {
    extend: "Ext.Container",
    config: {
        layout: Ext.os.deviceType == "Phone" ? "fit" : {
            type: "vbox",
            align: "center",
            pack: "center"
        },
        cls: "demo-list",
        items: [{
            width: Ext.os.deviceType == "Phone" ? null : 300,
            height: Ext.os.deviceType == "Phone" ? null : 500,
            xtype: "list",
            id: "theme-list",
            store: {
                fields: ["id", "name"],
                data: [{
                    id: "senchatouch",
                    name: "Sencha"
                }, {
                    id: "apple",
                    name: "Cupertino"
                }, {
                    id: "android",
                    name: "Mountain View"
                }, {
                    id: "blackberry",
                    name: "Toronto "
                }]
            },
            itemTpl: '<div class="contact"><strong>{name}</strong></div>'
        }]
    },
    initialize: function () {
        var a = Ext.getCmp("theme-list");
        a.select(0);
        a.on("itemtap", this.onItemTap, this);
        this.currentIndex = 0;
        this.setActiveSheet("senchatouch");
        this.callParent()
    },
    onItemTap: function (c, d, f, b) {
        var e = this,
            a = c.getStore().getAt(d).data;
        if (this.currentIndex == d) {
            return false
        }
        this.currentIndex = d;
        this.setActiveSheet(a.id)
    },
    setActiveSheet: function (c) {
        var a = this,
            b = this.getStylesheets();
        a.setMasked({
            xtype: "loadmask",
            message: "Loading"
        });
        b[c].removeAttribute("disabled");
        setTimeout(function () {
            b[c].removeAttribute("disabled");
            var d = setInterval(function () {
                if (b[c].sheet && b[c].sheet.cssRules.length) {
                    clearInterval(d);
                    var e;
                    for (e in b) {
                        if (e != c) {
                            b[e].setAttribute("disabled", true)
                        }
                    }
                    a.unmask()
                }
            }, 100)
        }, 100)
    },
    getStylesheets: function () {
        if (!this.stylesheets) {
            this.stylesheets = {
                senchatouch: document.getElementById("senchatouch"),
                android: document.getElementById("android"),
                apple: document.getElementById("apple"),
                blackberry: document.getElementById("blackberry")
            }
        }
        return this.stylesheets
    }
});
Ext.define("Kitchensink.view.JSONP", {
    extend: "Ext.Container",
    config: {
        scrollable: true,
        items: [{
            xtype: "panel",
            id: "JSONP"
        }, {
            docked: "top",
            xtype: "toolbar",
            items: [{
                text: "Load using JSON-P",
                handler: function () {
                    var a = Ext.getCmp("JSONP"),
                        b = new Ext.XTemplate(['<div class="demo-weather">', '<tpl for=".">', '<div class="day">', '<div class="date">{date}</div>', '<tpl for="weatherIconUrl">', '<img src="{value}">', "</tpl>", '<span class="temp">{tempMaxF}&deg;<span class="temp_low">{tempMinF}&deg;</span></span>', "</div>", "</tpl>", "</div>"]);
                    a.getParent().setMasked({
                        xtype: "loadmask",
                        message: "Loading..."
                    });
                    Ext.data.JsonP.request({
                        url: "http://free.worldweatheronline.com/feed/weather.ashx",
                        callbackKey: "callback",
                        params: {
                            key: "23f6a0ab24185952101705",
                            q: "94301",
                            format: "json",
                            num_of_days: 5
                        },
                        callback: function (d, c) {
                            var e = c.data.weather;
                            if (e) {
                                a.updateHtml(b.applyTemplate(e))
                            } else {
                                alert("There was an error retrieving the weather.")
                            }
                            a.getParent().unmask()
                        }
                    })
                }
            }]
        }]
    }
});
Ext.define("Kitchensink.view.Ajax", {
    extend: "Ext.Container",
    config: {
        scrollable: true,
        items: [{
            xtype: "panel",
            id: "Ajax",
            styleHtmlContent: true
        }, {
            docked: "top",
            xtype: "toolbar",
            items: [{
                text: "Load using Ajax",
                handler: function () {
                    var a = Ext.getCmp("Ajax");
                    a.getParent().setMasked({
                        xtype: "loadmask",
                        message: "Loading..."
                    });
                    Ext.Ajax.request({
                        url: "test.json",
                        success: function (b) {
                            a.setHtml(b.responseText);
                            a.getParent().unmask()
                        }
                    })
                }
            }]
        }]
    }
});
Ext.define("Kitchensink.view.Pop", {
    extend: "Ext.Panel",
    config: {
        cls: "card card3",
        html: "Pop Animation"
    }
});
Ext.define("Kitchensink.view.Fade", {
    extend: "Ext.Panel",
    config: {
        cls: "card card5",
        html: "Fade Animation"
    }
});
Ext.define("Kitchensink.view.Flip", {
    extend: "Ext.Panel",
    config: {
        cls: "card card2",
        html: "Flip Animation"
    }
});
Ext.define("Kitchensink.view.Cube", {
    extend: "Ext.Panel",
    config: {
        cls: "card card1",
        html: "Cube Animation"
    }
});
Ext.define("Kitchensink.model.Cars", {
    extend: "Ext.data.Model",
    config: {
        fields: [{
            name: "text",
            type: "string"
        }]
    }
});
Ext.define("Ext.form.FieldSet", {
    extend: "Ext.Container",
    alias: "widget.fieldset",
    requires: ["Ext.Title"],
    config: {
        baseCls: Ext.baseCSSPrefix + "form-fieldset",
        title: null,
        instructions: null
    },
    applyTitle: function (a) {
        if (typeof a == "string") {
            a = {
                title: a
            }
        }
        Ext.applyIf(a, {
            docked: "top",
            baseCls: this.getBaseCls() + "-title"
        });
        return Ext.factory(a, Ext.Title, this.getTitle())
    },
    updateTitle: function (b, a) {
        if (b) {
            this.add(b)
        }
        if (a) {
            this.remove(a)
        }
    },
    applyInstructions: function (a) {
        if (typeof a == "string") {
            a = {
                title: a
            }
        }
        Ext.applyIf(a, {
            docked: "bottom",
            baseCls: this.getBaseCls() + "-instructions"
        });
        return Ext.factory(a, Ext.Title, this.getInstructions())
    },
    updateInstructions: function (b, a) {
        if (b) {
            this.add(b)
        }
        if (a) {
            this.remove(a)
        }
    }
});
Ext.define("Ext.field.Number", {
    extend: "Ext.field.Text",
    xtype: "numberfield",
    alternateClassName: "Ext.form.Number",
    config: {
        component: {
            type: "number"
        },
        ui: "number"
    },
    proxyConfig: {
        minValue: null,
        maxValue: null,
        stepValue: null
    },
    applyValue: function (b) {
        var a = this.getMinValue(),
            c = this.getMaxValue();
        if (Ext.isNumber(a)) {
            b = Math.max(b, a)
        }
        if (Ext.isNumber(c)) {
            b = Math.min(b, c)
        }
        return parseFloat(b)
    },
    getValue: function () {
        var a = this.callParent();
        return parseFloat(a || 0)
    },
    doClearIconTap: function (a, b) {
        a.setValue(0)
    }
});
Ext.define("Ext.field.Password", {
    extend: "Ext.field.Text",
    xtype: "passwordfield",
    alternateClassName: "Ext.form.Password",
    config: {
        autoCapitalize: false,
        component: {
            type: "password"
        }
    }
});
Ext.define("Ext.field.Email", {
    extend: "Ext.field.Text",
    alternateClassName: "Ext.form.Email",
    xtype: "emailfield",
    config: {
        component: {
            type: "email"
        },
        autoCapitalize: false
    }
});
Ext.define("Ext.field.Url", {
    extend: "Ext.field.Text",
    xtype: "urlfield",
    alternateClassName: "Ext.form.Url",
    config: {
        autoCapitalize: false,
        component: {
            type: "url"
        }
    }
});
Ext.define("Ext.field.Hidden", {
    extend: "Ext.field.Field",
    alternateClassName: "Ext.form.Hidden",
    xtype: "hiddenfield",
    config: {
        component: {
            xtype: "input",
            type: "hidden"
        },
        ui: "hidden",
        hidden: true,
        tabIndex: -1
    }
});
Ext.define("Ext.field.Search", {
    extend: "Ext.field.Text",
    xtype: "searchfield",
    alternateClassName: "Ext.form.Search",
    config: {
        component: {
            type: "search"
        },
        ui: "search"
    }
});
Ext.define("Ext.ActionSheet", {
    extend: "Ext.Sheet",
    alias: "widget.actionsheet",
    requires: ["Ext.Button"],
    config: {
        baseCls: Ext.baseCSSPrefix + "sheet-action",
        left: 0,
        right: 0,
        bottom: 0,
        centered: false,
        height: "auto",
        defaultType: "button"
    }
});
Ext.define("Ext.SegmentedButton", {
    extend: "Ext.Container",
    xtype: "segmentedbutton",
    requires: ["Ext.Button"],
    config: {
        baseCls: Ext.baseCSSPrefix + "segmentedbutton",
        pressedCls: Ext.baseCSSPrefix + "button-pressed",
        allowMultiple: false,
        allowDepress: null,
        pressedButtons: null,
        layout: {
            type: "hbox",
            align: "stretch"
        },
        defaultType: "button"
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.on({
            delegate: "> button",
            scope: a,
            release: "onButtonRelease"
        });
        a.onAfter({
            delegate: "> button",
            scope: a,
            hiddenchange: "onButtonHiddenChange"
        })
    },
    updateAllowMultiple: function () {
        if (!this.initialized && !this.getInitialConfig().hasOwnProperty("allowDepress")) {
            this.setAllowDepress(true)
        }
    },
    applyItems: function () {
        var e = this,
            f = [],
            d, b, c, a;
        e.callParent(arguments);
        a = this.getItems();
        d = a.length;
        for (b = 0; b < d; b++) {
            c = a.items[b];
            if (c.getInitialConfig("pressed")) {
                f.push(a.items[b])
            }
        }
        e.updateFirstAndLastCls(a);
        e.setPressedButtons(f)
    },
    onButtonRelease: function (a) {
        var d = this,
            e = d.getPressedButtons(),
            c = [],
            b;
        if (!d.getDisabled() && !a.getDisabled()) {
            if (d.getAllowMultiple()) {
                c = e.concat(c)
            }
            b = (c.indexOf(a) !== -1) || (e.indexOf(a) !== -1);
            if (b && d.getAllowDepress()) {
                Ext.Array.remove(c, a)
            } else {
                if (!b || !d.getAllowDepress()) {
                    c.push(a)
                }
            }
            d.setPressedButtons(c);
            d.fireEvent("toggle", d, a, d.isPressed(a))
        }
        return false
    },
    onButtonHiddenChange: function () {
        this.updateFirstAndLastCls(this.getItems())
    },
    updateFirstAndLastCls: function (a) {
        var d = a.length,
            c, b;
        for (b = 0; b < d; b++) {
            c = a.items[b];
            if (!c.isHidden()) {
                c.addCls(Ext.baseCSSPrefix + "first");
                break
            }
        }
        for (b = d - 1; b >= 0; b--) {
            c = a.items[b];
            if (!c.isHidden()) {
                c.addCls(Ext.baseCSSPrefix + "last");
                break
            }
        }
    },
    applyPressedButtons: function (a, b) {
        var f = this,
            g = [],
            d, e, c;
        if (Ext.isArray(a)) {
            e = a.length;
            for (c = 0; c < e; c++) {
                d = f.getComponent(a[c]);
                if (d && g.indexOf(d) === -1) {
                    g.push(d)
                }
            }
        } else {
            d = f.getComponent(a);
            if (d && g.indexOf(d) === -1) {
                g.push(d)
            }
        }
        return g
    },
    updatePressedButtons: function (a, c) {
        var h = this,
            b = h.getItems(),
            g, e, f, d;
        f = b.length;
        for (d = 0; d < f; d++) {
            g = b.items[d];
            g.removeCls(h.getPressedCls())
        }
        f = a.length;
        for (d = 0; d < f; d++) {
            e = a[d];
            e.addCls(h.getPressedCls())
        }
    },
    isPressed: function (a) {
        var b = this.getPressedButtons();
        return b.indexOf(a) != -1
    },
    doSetDisabled: function (a) {
        var b = this;
        b.items.each(function (c) {
            c.setDisabled(a)
        }, b);
        b.callParent(arguments)
    }
}, function () {});
Ext.define("Ext.data.JsonP", {
    alternateClassName: "Ext.util.JSONP",
    singleton: true,
    statics: {
        requestCount: 0,
        requests: {}
    },
    timeout: 30000,
    disableCaching: true,
    disableCachingParam: "_dc",
    callbackKey: "callback",
    request: function (n) {
        n = Ext.apply({}, n);
        var j = this,
            d = Ext.isDefined(n.disableCaching) ? n.disableCaching : j.disableCaching,
            g = n.disableCachingParam || j.disableCachingParam,
            c = ++j.statics().requestCount,
            l = n.callbackName || "callback" + c,
            h = n.callbackKey || j.callbackKey,
            m = Ext.isDefined(n.timeout) ? n.timeout : j.timeout,
            e = Ext.apply({}, n.params),
            b = n.url,
            a = Ext.isSandboxed ? Ext.getUniqueGlobalNamespace() : "Ext",
            f, k;
        e[h] = a + ".data.JsonP." + l;
        if (d) {
            e[g] = new Date().getTime()
        }
        k = j.createScript(b, e, n);
        j.statics().requests[c] = f = {
            url: b,
            params: e,
            script: k,
            id: c,
            scope: n.scope,
            success: n.success,
            failure: n.failure,
            callback: n.callback,
            callbackKey: h,
            callbackName: l
        };
        if (m > 0) {
            f.timeout = setTimeout(Ext.bind(j.handleTimeout, j, [f]), m)
        }
        j.setupErrorHandling(f);
        j[l] = Ext.bind(j.handleResponse, j, [f], true);
        j.loadScript(f);
        return f
    },
    abort: function (b) {
        var c = this.statics().requests,
            a;
        if (b) {
            if (!b.id) {
                b = c[b]
            }
            this.abort(b)
        } else {
            for (a in c) {
                if (c.hasOwnProperty(a)) {
                    this.abort(c[a])
                }
            }
        }
    },
    setupErrorHandling: function (a) {
        a.script.onerror = Ext.bind(this.handleError, this, [a])
    },
    handleAbort: function (a) {
        a.errorType = "abort";
        this.handleResponse(null, a)
    },
    handleError: function (a) {
        a.errorType = "error";
        this.handleResponse(null, a)
    },
    cleanupErrorHandling: function (a) {
        a.script.onerror = null
    },
    handleTimeout: function (a) {
        a.errorType = "timeout";
        this.handleResponse(null, a)
    },
    handleResponse: function (a, b) {
        var c = true;
        if (b.timeout) {
            clearTimeout(b.timeout)
        }
        delete this[b.callbackName];
        delete this.statics()[b.id];
        this.cleanupErrorHandling(b);
        Ext.fly(b.script).destroy();
        if (b.errorType) {
            c = false;
            Ext.callback(b.failure, b.scope, [b.errorType])
        } else {
            Ext.callback(b.success, b.scope, [a])
        }
        Ext.callback(b.callback, b.scope, [c, a, b.errorType])
    },
    createScript: function (c, d, b) {
        var a = document.createElement("script");
        a.setAttribute("src", Ext.urlAppend(c, Ext.Object.toQueryString(d)));
        a.setAttribute("async", true);
        a.setAttribute("type", "text/javascript");
        return a
    },
    loadScript: function (a) {
        Ext.getHead().appendChild(a.script)
    }
});
Ext.define("Kitchensink.view.LoremIpsum", {
    extend: "Ext.Component",
    xtype: "loremipsum",
    config: {
        html: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus libero ut mi porta tristique. Sed vel nulla metus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Mauris imperdiet lobortis sem at placerat. Phasellus vitae quam arcu, sit amet vehicula urna. Vivamus rutrum cursus tempor. Fusce ullamcorper dolor a dolor vestibulum vitae viverra purus sollicitudin. Cras elit augue, lacinia id placerat nec, eleifend eu justo. Aliquam pellentesque ante ut lacus pharetra facilisis. Praesent varius accumsan nibh imperdiet porta. Duis eget mauris urna. Sed dictum felis eu metus consectetur ultricies. Aliquam erat volutpat. Donec cursus mauris quis sapien luctus quis consectetur leo mattis. Etiam sed magna purus.</p><p>Maecenas adipiscing ligula in urna dignissim dapibus. Maecenas vehicula, nisi sit amet ultricies placerat, orci tellus euismod nisl, vehicula lacinia nulla lectus at magna. Sed id orci est. Phasellus eget ultrices mauris. Ut elementum semper facilisis. Cras fermentum, leo vel elementum ornare, mauris lorem vehicula elit, adipiscing mollis enim magna vel ipsum. Proin sagittis, sapien vitae dignissim sodales, metus turpis sodales lacus, eget scelerisque nunc magna auctor tortor. Sed sagittis mi sit amet risus pretium vulputate vel eget sapien.</p>"
    }
});
Ext.define("Kitchensink.model.Demo", {
    extend: "Ext.data.Model",
    config: {
        fields: [{
            name: "id",
            type: "string"
        }, {
            name: "text",
            type: "string"
        }, {
            name: "source",
            type: "string"
        }, {
            name: "animation",
            type: "auto"
        }, {
            name: "preventHide",
            type: "boolean"
        }, {
            name: "view",
            type: "string"
        }]
    }
});
Ext.define("Ext.field.Checkbox", {
    extend: "Ext.field.Field",
    alternateClassName: "Ext.form.Checkbox",
    xtype: "checkboxfield",
    isCheckbox: true,
    config: {
        ui: "checkbox",
        value: "",
        checked: false,
        tabIndex: -1,
        component: {
            xtype: "input",
            type: "checkbox",
            useMask: true,
            cls: Ext.baseCSSPrefix + "input-checkbox"
        }
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.getComponent().on({
            scope: a,
            order: "before",
            masktap: "onMaskTap"
        })
    },
    doInitValue: function () {
        var a = this,
            b = a.getInitialConfig();
        if (b.hasOwnProperty("value")) {
            a.originalState = b.value
        }
        if (b.hasOwnProperty("checked")) {
            a.originalState = b.checked
        }
        a.callParent(arguments)
    },
    updateInputType: function (a) {
        var b = this.getComponent();
        if (b) {
            b.setType(a)
        }
    },
    updateName: function (a) {
        var b = this.getComponent();
        if (b) {
            b.setName(a)
        }
    },
    getChecked: function () {
        this._checked = this.getComponent().getChecked();
        return this._checked
    },
    getValue: function () {
        return this.getChecked()
    },
    setValue: function (a) {
        return this.setChecked(a)
    },
    setChecked: function (a) {
        this.updateChecked(a);
        this._checked = a
    },
    updateChecked: function (a) {
        this.getComponent().setChecked(a)
    },
    onMaskTap: function (a, c) {
        var b = this,
            d = a.input.dom;
        if (b.getDisabled()) {
            return false
        }
        d.checked = !d.checked;
        if (b.getChecked()) {
            b.fireEvent("check", b, c)
        } else {
            b.fireEvent("uncheck", b, c)
        }
        return false
    },
    doChecked: Ext.emptyFn,
    doUnChecked: Ext.emptyFn,
    isChecked: function () {
        return this.getChecked()
    },
    check: function () {
        return this.setChecked(true)
    },
    uncheck: function () {
        return this.setChecked(false)
    },
    getSameGroupFields: function () {
        var a = this.up("formpanel") || this.up("fieldset");
        if (!a) {
            return null
        }
        return a.query("[name=" + this.getName() + "]")
    },
    getGroupValues: function () {
        var a = [];
        this.getSameGroupFields().forEach(function (b) {
            if (b.getChecked()) {
                a.push(b.getValue())
            }
        });
        return a
    },
    setGroupValues: function (a) {
        this.getSameGroupFields().forEach(function (b) {
            b.setChecked((a.indexOf(b.getValue()) !== -1))
        });
        return this
    },
    resetGroupValues: function () {
        this.getSameGroupFields().forEach(function (a) {
            a.setChecked(a.originalState)
        });
        return this
    },
    reset: function () {
        this.callParent(arguments);
        this.resetGroupValues()
    }
});
Ext.define("Ext.util.TapRepeater", {
    requires: ["Ext.DateExtras"],
    mixins: {
        observable: "Ext.mixin.Observable"
    },
    config: {
        el: null,
        accelerate: true,
        interval: 10,
        delay: 250,
        preventDefault: true,
        stopDefault: false,
        timer: 0,
        pressCls: null
    },
    constructor: function (a) {
        var b = this;
        b.initConfig(a)
    },
    updateEl: function (c, b) {
        var a = {
            touchstart: "onTouchStart",
            touchend: "onTouchEnd",
            tap: "eventOptions",
            scope: this
        };
        if (b) {
            b.un(a)
        }
        c.on(a)
    },
    eventOptions: function (a) {
        if (this.getPreventDefault()) {
            a.preventDefault()
        }
        if (this.getStopDefault()) {
            a.stopEvent()
        }
    },
    destroy: function () {
        this.clearListeners();
        Ext.destroy(this.el)
    },
    onTouchStart: function (c) {
        var b = this,
            a = b.getPressCls();
        clearTimeout(b.getTimer());
        if (a) {
            b.getEl().addCls(a)
        }
        b.tapStartTime = new Date();
        b.fireEvent("touchstart", b, c);
        b.fireEvent("tap", b, c);
        if (b.getAccelerate()) {
            b.delay = 400
        }
        b.setTimer(Ext.defer(b.tap, b.getDelay() || b.getInterval(), b, [c]))
    },
    tap: function (b) {
        var a = this;
        a.fireEvent("tap", a, b);
        a.setTimer(Ext.defer(a.tap, a.getAccelerate() ? a.easeOutExpo(Ext.Date.getElapsed(a.tapStartTime), 400, -390, 12000) : a.getInterval(), a, [b]))
    },
    easeOutExpo: function (e, a, g, f) {
        return (e == f) ? a + g : g * (-Math.pow(2, -10 * e / f) + 1) + a
    },
    onTouchEnd: function (b) {
        var a = this;
        clearTimeout(a.getTimer());
        a.getEl().removeCls(a.getPressCls());
        a.fireEvent("touchend", a, b)
    }
});
Ext.define("Ext.util.GeoLocation", {
    extend: "Ext.Evented",
    config: {
        autoUpdate: true,
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        timestamp: null,
        allowHighAccuracy: false,
        timeout: Infinity,
        maximumAge: 0,
        provider: undefined
    },
    updateMaximumAge: function () {
        if (this.watchOperation) {
            this.updateWatchOperation()
        }
    },
    updateTimeout: function () {
        if (this.watchOperation) {
            this.updateWatchOperation()
        }
    },
    updateAllowHighAccuracy: function () {
        if (this.watchOperation) {
            this.updateWatchOperation()
        }
    },
    applyProvider: function (a) {
        if (Ext.feature.has.Geolocation) {
            if (!a) {
                if (navigator && navigator.geolocation) {
                    a = navigator.geolocation
                } else {
                    if (window.google) {
                        a = google.gears.factory.create("beta.geolocation")
                    }
                }
            }
        }
        return a
    },
    updateAutoUpdate: function (a, b) {
        var c = this,
            f = c.getProvider();
        if (b && f) {
            clearInterval(c.watchOperationId);
            c.watchOperationId = null
        }
        if (a) {
            if (!f) {
                c.fireEvent("locationerror", c, false, false, true, null);
                return
            }
            try {
                c.updateWatchOperation()
            } catch (d) {
                c.fireEvent("locationerror", c, false, false, true, d.message)
            }
        }
    },
    updateWatchOperation: function () {
        var a = this,
            b = a.getProvider();
        if (a.watchOperationId) {
            clearInterval(a.watchOperationId)
        }
        function c() {
            b.getCurrentPosition(Ext.bind(a.fireUpdate, a), Ext.bind(a.fireError, a), a.parseOptions())
        }
        c();
        a.watchOperationId = setInterval(c, 10000)
    },
    updateLocation: function (h, a, c) {
        var b = this,
            g = b.getProvider();
        var f = function (j, e) {
                if (e) {
                    b.fireError(e)
                } else {
                    b.fireEvent("locationerror", b, false, false, true, j)
                }
                if (h) {
                    h.call(a || b, null, b)
                }
            };
        if (!g) {
            f(null);
            return
        }
        try {
            g.getCurrentPosition(function (e) {
                b.fireUpdate(e);
                if (h) {
                    h.call(a || b, b, b)
                }
            }, function (e) {
                f(null, e)
            }, c || b.parseOptions())
        } catch (d) {
            f(d.message)
        }
    },
    fireUpdate: function (a) {
        var b = this,
            c = a.coords;
        b.setConfig({
            timestamp: a.timestamp,
            latitude: c.latitude,
            longitude: c.longitude,
            accuracy: c.accuracy,
            altitude: c.altitude,
            altitudeAccuracy: c.altitudeAccuracy,
            heading: c.heading,
            speed: c.speed
        });
        b.fireEvent("locationupdate", b)
    },
    fireError: function (a) {
        var b = a.code;
        this.fireEvent("locationerror", this, b == a.TIMEOUT, b == a.PERMISSION_DENIED, b == a.POSITION_UNAVAILABLE, a.message == undefined ? null : a.message)
    },
    parseOptions: function () {
        var b = this.getTimeout(),
            a = {
                maximumAge: this.getMaximumAge(),
                allowHighAccuracy: this.getAllowHighAccuracy()
            };
        if (b !== Infinity) {
            a.timeout = b
        }
        return a
    },
    destroy: function () {
        this.updateAutoUpdate(null)
    }
});
Ext.define("Ext.picker.Slot", {
    extend: "Ext.DataView",
    xtype: "pickerslot",
    alternateClassName: "Ext.Picker.Slot",
    requires: ["Ext.XTemplate", "Ext.data.Store", "Ext.Component", "Ext.data.StoreManager"],
    isSlot: true,
    config: {
        title: null,
        showTitle: true,
        cls: Ext.baseCSSPrefix + "picker-slot",
        name: null,
        value: null,
        flex: 1,
        align: "left",
        itemSelector: "div." + Ext.baseCSSPrefix + "picker-item",
        displayField: "text",
        valueField: "value",
        scrollable: {
            direction: "vertical",
            indicators: false,
            momentumEasing: {
                minVelocity: 2
            },
            slotSnapEasing: {
                duration: 100
            }
        }
    },
    constructor: function () {
        this.selectedIndex = 0;
        this.callParent(arguments)
    },
    applyTitle: function (a) {
        if (a) {
            a = Ext.create("Ext.Component", {
                cls: Ext.baseCSSPrefix + "picker-slot-title",
                docked: "top",
                html: a
            })
        }
        return a
    },
    updateTitle: function (b, a) {
        if (b) {
            this.add(b);
            this.setupBar()
        }
        if (a) {
            this.remove(a)
        }
    },
    updateShowTitle: function (a) {
        var b = this.getTitle();
        if (b) {
            b[a ? "show" : "hide"]();
            this.setupBar()
        }
    },
    updateDisplayField: function (a) {
        this.setItemTpl('<div class="' + Ext.baseCSSPrefix + 'picker-item {cls} <tpl if="extra">' + Ext.baseCSSPrefix + 'picker-invalid</tpl>">{' + a + "}</div>")
    },
    updateAlign: function (a, c) {
        var b = this.element;
        b.addCls(Ext.baseCSSPrefix + "picker-" + a);
        b.removeCls(Ext.baseCSSPrefix + "picker-" + c)
    },
    applyData: function (d) {
        var f = [],
            c = d && d.length,
            a, b, e;
        if (d && Ext.isArray(d) && c) {
            for (a = 0; a < c; a++) {
                b = d[a];
                e = {};
                if (Ext.isArray(b)) {
                    e[this.valueField] = b[0];
                    e[this.displayField] = b[1]
                } else {
                    if (Ext.isString(b)) {
                        e[this.valueField] = b;
                        e[this.displayField] = b
                    } else {
                        if (Ext.isObject(b)) {
                            e = b
                        }
                    }
                }
                f.push(e)
            }
        }
        return d
    },
    updateData: function (a) {
        this.setStore(Ext.create("Ext.data.Store", {
            model: "x-textvalue",
            data: a
        }))
    },
    initialize: function () {
        this.callParent();
        var a = this.getScrollable().getScroller();
        this.on({
            scope: this,
            painted: "onPainted",
            itemtap: "doItemTap"
        });
        a.on({
            scope: this,
            scrollend: "onScrollEnd"
        })
    },
    onPainted: function () {
        this.setupBar()
    },
    getPicker: function () {
        if (!this.picker) {
            this.picker = this.getParent()
        }
        return this.picker
    },
    setupBar: function () {
        if (!this.rendered) {
            return
        }
        var b = this.element,
            g = this.innerElement,
            h = this.getPicker(),
            j = h.bar,
            n = this.getValue(),
            c = this.getShowTitle(),
            m = this.getTitle(),
            k = this.getScrollable(),
            f = k.getScroller(),
            e = 0,
            p, d, o, l, a;
        p = j.getY();
        d = b.getY();
        if (c && m) {
            d += m.element.getHeight()
        }
        o = j.getHeight();
        if (c && m) {
            e = m.element.getHeight()
        }
        l = Math.ceil((b.getHeight() - e - o) / 2);
        this.slotPadding = l;
        g.setStyle({
            padding: l + "px 0 " + (l) + "px"
        });
        f.refresh();
        f.setSlotSnapSize(o);
        this.setValue(n)
    },
    doItemTap: function (d, a, c, f) {
        var b = this;
        b.selectedIndex = a;
        b.selectedNode = c;
        b.scrollToItem(c, true);
        b.fireEvent("slotpick", b, b.getValue(), b.selectedNode)
    },
    scrollToItem: function (e, d) {
        var h = e.getY(),
            c = e.parent(),
            f = c.getY(),
            b = this.getScrollable(),
            a = b.getScroller(),
            g;
        g = h - f;
        a.scrollTo(0, g, d)
    },
    onScrollEnd: function (b, a, g) {
        var f = this,
            d = Math.round(g / f.picker.bar.getHeight()),
            c = f.getViewItems(),
            e = c[d];
        if (e) {
            f.selectedIndex = d;
            f.selectedNode = e;
            f.fireEvent("slotpick", f, f.getValue(), f.selectedNode)
        }
    },
    getValue: function () {
        var b = this.getStore(),
            a, c;
        if (!b) {
            return
        }
        a = b.getAt(this.selectedIndex);
        c = a ? a.get(this.getValueField()) : null;
        this._value = c;
        return c
    },
    setValue: function (f) {
        if (!Ext.isDefined(f)) {
            return
        }
        if (!this.rendered) {
            this._value = f;
            return
        }
        var b = this.getStore(),
            a = this.getViewItems(),
            d = this.getValueField(),
            c, e;
        c = b.find(d, f);
        if (c != -1) {
            e = Ext.get(a[c]);
            this.selectedIndex = c;
            this.scrollToItem(e);
            this._value = f
        }
    },
    setValueAnimated: function (f) {
        if (!f) {
            return
        }
        if (!this.rendered) {
            this._value = f;
            return
        }
        var b = this.getStore(),
            a = this.getViewItems(),
            d = this.getValueField(),
            c, e;
        c = b.find(d, f);
        if (c != -1) {
            e = Ext.get(a[c]);
            this.selectedIndex = c;
            this.scrollToItem(e, {
                duration: 100
            });
            this._value = f
        }
    }
});
Ext.define("Ext.Media", {
    extend: "Ext.Component",
    xtype: "media",
    config: {
        url: "",
        enableControls: Ext.os.is.Android ? false : true,
        autoResume: false,
        autoPause: true,
        preload: true,
        loop: false,
        media: null,
        playing: false,
        volume: 1,
        muted: false
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.on({
            scope: a,
            activate: a.onActivate,
            deactivate: a.onDeactivate
        });
        a.addMediaListener({
            play: "onPlay",
            pause: "onPause",
            ended: "onEnd",
            volumechange: "onVolumeChange",
            timeupdate: "onTimeUpdate"
        })
    },
    addMediaListener: function (d, b) {
        var c = this,
            e = c.media.dom,
            f = Ext.Function.bind;
        if (!Ext.isObject(d)) {
            var a = d;
            d = {};
            d[a] = b
        }
        Ext.Object.each(d, function (h, g) {
            if (typeof g !== "function") {
                g = c[g]
            }
            if (typeof g == "function") {
                g = f(g, c);
                e.addEventListener(h, g)
            }
        })
    },
    onPlay: function () {
        this.fireEvent("play", this)
    },
    onPause: function () {
        this.fireEvent("pause", this, this.getCurrentTime())
    },
    onEnd: function () {
        this.fireEvent("ended", this, this.getCurrentTime())
    },
    onVolumeChange: function () {
        this.fireEvent("volumechange", this, this.media.dom.volume)
    },
    onTimeUpdate: function () {
        this.fireEvent("timeupdate", this, this.getCurrentTime())
    },
    isPlaying: function () {
        return this.getPlaying()
    },
    onActivate: function () {
        var a = this;
        if (a.getAutoResume() && !a.isPlaying()) {
            a.play()
        }
    },
    onDeactivate: function () {
        var a = this;
        if (a.getAutoResume() && a.isPlaying()) {
            a.pause()
        }
    },
    updateUrl: function (a) {
        var b = this.media.dom;
        b.src = a;
        b.load();
        if (this.getPlaying()) {
            this.play()
        }
    },
    updateEnableControls: function (a) {
        this.media.dom.controls = a ? "controls" : false
    },
    updateLoop: function (a) {
        this.media.dom.loop = a ? "loop" : false
    },
    play: function () {
        this.media.dom.play();
        this.setPlaying(true)
    },
    pause: function () {
        this.media.dom.pause();
        this.setPlaying(false)
    },
    toggle: function () {
        if (this.isPlaying()) {
            this.pause()
        } else {
            this.play()
        }
    },
    stop: function () {
        var a = this;
        a.setCurrentTime(0);
        a.fireEvent("stop", a);
        a.pause()
    },
    updateVolume: function (a) {
        this.media.dom.volume = a
    },
    updateMuted: function (a) {
        this.fireEvent("mutedchange", this, a);
        this.media.dom.muted = a
    },
    getCurrentTime: function () {
        return this.media.dom.currentTime
    },
    setCurrentTime: function (a) {
        this.media.dom.currentTime = a;
        return a
    },
    getDuration: function () {
        return this.media.dom.duration
    },
    destroy: function () {
        var a = this;
        Ext.Object.each(event, function (c, b) {
            if (typeof b !== "function") {
                b = a[b]
            }
            if (typeof b == "function") {
                b = bind(b, a);
                dom.removeEventListener(c, b)
            }
        })
    }
});
Ext.define("Ext.carousel.Item", {
    extend: "Ext.Decorator",
    config: {
        baseCls: "x-carousel-item",
        component: null,
        translatable: true
    }
});
Ext.define("Ext.carousel.Indicator", {
    extend: "Ext.Component",
    xtype: "carouselindicator",
    alternateClassName: "Ext.Carousel.Indicator",
    config: {
        baseCls: Ext.baseCSSPrefix + "carousel-indicator",
        direction: "horizontal"
    },
    initialize: function () {
        this.callParent();
        this.indicators = [];
        this.element.on({
            tap: "onTap",
            scope: this
        })
    },
    updateDirection: function (a, c) {
        var b = this.getBaseCls();
        this.element.replaceCls(c, a, b);
        if (a === "horizontal") {
            this.setBottom(0);
            this.setRight(null)
        } else {
            this.setRight(0);
            this.setBottom(null)
        }
    },
    addIndicator: function () {
        this.indicators.push(this.element.createChild({
            tag: "span"
        }))
    },
    removeIndicator: function () {
        var a = this.indicators;
        if (a.length > 0) {
            a.pop().destroy()
        }
    },
    setActiveIndex: function (b) {
        var e = this.indicators,
            d = this.activeIndex,
            a = e[d],
            f = e[b],
            c = this.getBaseCls();
        if (a) {
            a.removeCls(c, null, "active")
        }
        if (f) {
            f.addCls(c, null, "active")
        }
        this.activeIndex = b;
        return this
    },
    onTap: function (f) {
        var g = f.touch,
            a = this.element.getPageBox(),
            d = a.left + (a.width / 2),
            b = a.top + (a.height / 2),
            c = this.getDirection();
        if ((c === "horizontal" && g.pageX >= d) || (c === "vertical" && g.pageY >= b)) {
            this.fireEvent("next", this)
        } else {
            this.fireEvent("previous", this)
        }
    },
    destroy: function () {
        var d = this.indicators,
            b, c, a;
        for (b = 0, c = d.length; b < c; b++) {
            a = d[b];
            a.destroy()
        }
        d.length = 0;
        this.callParent()
    }
});
Ext.define("Ext.tab.Tab", {
    extend: "Ext.Button",
    xtype: "tab",
    alternateClassName: "Ext.Tab",
    isTab: true,
    config: {
        baseCls: Ext.baseCSSPrefix + "tab",
        pressedCls: Ext.baseCSSPrefix + "tab-pressed",
        activeCls: Ext.baseCSSPrefix + "tab-active",
        active: false,
        title: "&nbsp;"
    },
    template: [{
        tag: "span",
        reference: "badgeElement",
        hidden: true
    }, {
        tag: "span",
        className: Ext.baseCSSPrefix + "button-icon",
        reference: "iconElement",
        style: "visibility: hidden !important"
    }, {
        tag: "span",
        reference: "textElement",
        hidden: true
    }],
    updateTitle: function (a) {
        this.setText(a)
    },
    hideIconElement: function () {
        this.iconElement.dom.style.setProperty("visibility", "hidden", "!important")
    },
    showIconElement: function () {
        this.iconElement.dom.style.setProperty("visibility", "visible", "!important")
    },
    updateActive: function (c, b) {
        var a = this.getActiveCls();
        if (c && !b) {
            this.element.addCls(a);
            this.fireEvent("activate", this)
        } else {
            if (b) {
                this.element.removeCls(a);
                this.fireEvent("deactivate", this)
            }
        }
    }
}, function () {
    this.override({
        activate: function () {
            this.setActive(true)
        },
        deactivate: function () {
            this.setActive(false)
        }
    })
});
Ext.define("Ext.slider.Thumb", {
    extend: "Ext.Component",
    xtype: "thumb",
    config: {
        baseCls: Ext.baseCSSPrefix + "thumb",
        draggable: {
            direction: "horizontal"
        }
    },
    elementWidth: 0,
    initialize: function () {
        this.callParent();
        this.getDraggable().onBefore({
            dragstart: "onDragStart",
            drag: "onDrag",
            dragend: "onDragEnd",
            scope: this
        });
        this.on("painted", "onPainted")
    },
    onDragStart: function () {
        if (this.isDisabled()) {
            return false
        }
        this.relayEvent(arguments)
    },
    onDrag: function () {
        if (this.isDisabled()) {
            return false
        }
        this.relayEvent(arguments)
    },
    onDragEnd: function () {
        if (this.isDisabled()) {
            return false
        }
        this.relayEvent(arguments)
    },
    onPainted: function () {
        this.elementWidth = this.element.dom.offsetWidth
    },
    getElementWidth: function () {
        return this.elementWidth
    }
});
Ext.define("Kitchensink.model.OrderItem", {
    extend: "Ext.data.Model",
    config: {
        fields: ["id", "quantity", "price", "name"]
    }
});
Ext.define("Kitchensink.view.Toolbars", {
    extend: "Ext.Container",
    requires: ["Ext.SegmentedButton"],
    config: {
        cls: "card",
        html: "Pick a button, any button. <br /><small>By using SASS, all of the buttons on this screen can be restyled dynamically. The only images used are masks.</small>",
        items: !Ext.os.is.Phone ? [{
            xtype: "toolbar",
            ui: "light",
            docked: "top",
            scrollable: {
                direction: "horizontal",
                indicators: false
            },
            items: [{
                text: "Back",
                ui: "back"
            }, {
                text: "Default",
                badgeText: "2"
            }, {
                text: "Round",
                ui: "round"
            }, {
                xtype: "spacer"
            }, {
                xtype: "segmentedbutton",
                allowDepress: true,
                items: [{
                    text: "Option 1",
                    pressed: true
                }, {
                    text: "Option 2"
                }, {
                    text: "Option 3"
                }]
            }, {
                xtype: "spacer"
            }, {
                text: "Action",
                ui: "action"
            }, {
                text: "Forward",
                ui: "forward"
            }]
        }] : [{
            xtype: "toolbar",
            ui: "light",
            docked: "top",
            scrollable: false,
            items: [{
                xtype: "spacer"
            }, {
                text: "Back",
                ui: "back"
            }, {
                text: "Default",
                badgeText: "2"
            }, {
                text: "Round",
                ui: "round"
            }, {
                xtype: "spacer"
            }]
        }, {
            xtype: "toolbar",
            ui: "dark",
            docked: "bottom",
            scrollable: false,
            items: [{
                xtype: "spacer"
            }, {
                xtype: "segmentedbutton",
                allowDepress: true,
                items: [{
                    text: "Option 1",
                    pressed: true
                }, {
                    text: "Option 2"
                }, {
                    text: "Option 3"
                }]
            }, {
                xtype: "spacer"
            }]
        }]
    },
    constructor: function () {
        this.on({
            scope: this,
            delegate: "button",
            tap: "tapHandler"
        });
        this.callParent(arguments)
    },
    tapHandler: function (a) {
        this.setHtml("User tapped the '" + a.getText() + "' button.")
    }
});
Ext.require("Ext.data.JsonP", function () {
    Ext.YQL = {
        useAllPublicTables: true,
        yqlUrl: "http://query.yahooapis.com/v1/public/yql",
        request: function (a) {
            var b = a.params || {};
            b.q = a.query;
            b.format = "json";
            if (this.useAllPublicTables) {
                b.env = "store://datatables.org/alltableswithkeys"
            }
            Ext.data.JsonP.request({
                url: this.yqlUrl,
                callbackKey: "callback",
                params: b,
                callback: a.callback,
                scope: a.scope || window
            })
        }
    };
    Ext.define("Kitchensink.view.YQL", {
        extend: "Ext.Container",
        config: {
            scrollable: true,
            items: [{
                xtype: "panel",
                id: "YQL",
                styleHtmlContent: true
            }, {
                docked: "top",
                xtype: "toolbar",
                items: [{
                    text: "Load using YQL",
                    handler: function () {
                        var a = Ext.getCmp("YQL"),
                            b = new Ext.XTemplate(['<tpl for="item">', '<div class="blog-post">', '<h3><a href="{link}" target="_blank">{title}</a><small> by {creator}</small></h3>', "<p>{description}</p>", "</div>", "</tpl>"]);
                        a.getParent().setMasked({
                            xtype: "loadmask",
                            message: "Loading..."
                        });
                        Ext.YQL.request({
                            query: "select * from rss where url='http://feeds.feedburner.com/extblog' limit 5",
                            callback: function (d, c) {
                                if (c.query && c.query.results) {
                                    a.setHtml(b.apply(c.query.results))
                                } else {
                                    alert("There was an error retrieving the YQL request.")
                                }
                                a.getParent().unmask()
                            }
                        })
                    }
                }]
            }]
        }
    })
});
Ext.define("Kitchensink.view.SlideLeft", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card1",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Slide Left Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.SlideRight", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card2",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Slide Right Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.SlideUp", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card3",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Slide Up Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.SlideDown", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card4",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Slide Down Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.CoverLeft", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card1",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Cover Left Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.CoverRight", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card2",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Cover Right Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.CoverUp", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card3",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Cover Up Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.CoverDown", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card4",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Cover Down Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.RevealLeft", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card1",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Reveal Left Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.RevealRight", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card2",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Reveal Right Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.RevealUp", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card3",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Reveal Up Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
Ext.define("Kitchensink.view.RevealDown", {
    extend: "Ext.Panel",
    requires: ["Kitchensink.view.LoremIpsum"],
    config: {
        cls: "card card4",
        scrollable: true,
        items: [{
            docked: "top",
            html: "Reveal Down Animation"
        }, {
            xtype: "loremipsum"
        }]
    }
});
(function () {
    var b = {
        text: "Animations",
        card: false,
        id: "animations",
        items: [{
            text: "Slide",
            id: "Slide",
            items: [{
                text: "Slide Left",
                id: "SlideLeft",
                view: "SlideLeft",
                card: false,
                animation: {
                    type: "slide"
                },
                leaf: true
            }, {
                text: "Slide Right",
                card: false,
                id: "SlideRight",
                view: "SlideRight",
                animation: {
                    type: "slide",
                    direction: "right"
                },
                leaf: true
            }, {
                text: "Slide Up",
                card: false,
                id: "SlideUp",
                view: "SlideUp",
                animation: {
                    type: "slide",
                    direction: "up"
                },
                leaf: true
            }, {
                text: "Slide Down",
                card: false,
                id: "SlideDown",
                view: "SlideDown",
                animation: {
                    type: "slide",
                    direction: "down"
                },
                leaf: true
            }]
        }, {
            text: "Fade",
            id: "Fade",
            card: false,
            animation: {
                type: "fade"
            },
            leaf: true
        }]
    };
    if (!Ext.os.is.Android2) {
        b.items.push({
            text: "Cover",
            id: "Cover",
            items: [{
                text: "Cover Left",
                card: false,
                view: "CoverLeft",
                id: "CoverLeft",
                animation: {
                    type: "cover"
                },
                leaf: true
            }, {
                text: "Cover Right",
                card: false,
                id: "CoverRight",
                view: "CoverRight",
                animation: {
                    type: "cover",
                    direction: "right"
                },
                leaf: true
            }, {
                text: "Cover Up",
                card: false,
                view: "CoverUp",
                id: "CoverUp",
                animation: {
                    type: "cover",
                    direction: "up"
                },
                leaf: true
            }, {
                text: "Cover Down",
                card: false,
                id: "CoverDown",
                view: "CoverDown",
                animation: {
                    type: "cover",
                    direction: "down"
                },
                leaf: true
            }]
        }, {
            text: "Reveal",
            id: "Reveal",
            items: [{
                text: "Reveal Left",
                card: false,
                id: "RevealLeft",
                view: "RevealLeft",
                animation: {
                    type: "reveal"
                },
                leaf: true
            }, {
                text: "Reveal Right",
                card: false,
                id: "RevealRight",
                view: "RevealRight",
                animation: {
                    direction: "right",
                    type: "reveal"
                },
                leaf: true
            }, {
                text: "Reveal Up",
                card: false,
                id: "RevealUp",
                view: "RevealUp",
                animation: {
                    direction: "up",
                    type: "reveal"
                },
                leaf: true
            }, {
                text: "Reveal Down",
                card: false,
                id: "RevealDown",
                view: "RevealDown",
                animation: {
                    direction: "down",
                    type: "reveal"
                },
                leaf: true
            }]
        }, {
            text: "Pop",
            id: "Pop",
            card: false,
            animation: {
                type: "pop"
            },
            leaf: true
        }, {
            text: "Flip",
            id: "Flip",
            card: false,
            animation: {
                type: "flip"
            },
            leaf: true
        })
    }
    var a = {
        id: "root",
        text: "Kitchen Sink",
        items: [{
            text: "User Interface",
            id: "ui",
            cls: "launchscreen",
            items: [{
                text: "Buttons",
                leaf: true,
                id: "buttons"
            }, {
                text: "Forms",
                leaf: true,
                id: "forms"
            }, {
                text: "List",
                leaf: true,
                id: "list"
            }, {
                text: "Nested List",
                view: "NestedList",
                leaf: true,
                id: "nestedlist"
            }, {
                text: "Icons",
                leaf: true,
                id: "icons"
            }, {
                text: "Toolbars",
                leaf: true,
                id: "toolbars"
            }, {
                text: "Carousel",
                leaf: true,
                id: "carousel"
            }, {
                text: "Tabs",
                leaf: true,
                id: "tabs"
            }, {
                text: "Bottom Tabs",
                view: "BottomTabs",
                leaf: true,
                id: "bottom-tabs"
            }, {
                text: "Map",
                view: "Map",
                leaf: true,
                id: "map"
            }, {
                text: "Overlays",
                leaf: true,
                id: "overlays"
            }]
        }]
    };
    a.items.push(b, {
        text: "Touch Events",
        id: "touchevents",
        view: "TouchEvents",
        leaf: true
    }, {
        text: "Data",
        id: "data",
        items: [{
            text: "Nested Loading",
            view: "NestedLoading",
            leaf: true,
            id: "nestedloading"
        }, {
            text: "JSONP",
            leaf: true,
            id: "jsonp"
        }, {
            text: "YQL",
            leaf: true,
            id: "yql"
        }, {
            text: "Ajax",
            leaf: true,
            id: "ajax"
        }]
    }, {
        text: "Media",
        id: "media",
        items: [{
            text: "Video",
            leaf: true,
            id: "video"
        }, {
            text: "Audio",
            leaf: true,
            id: "audio"
        }]
    }, {
        text: "Themes",
        id: "themes",
        leaf: true
    });
    Ext.define("Kitchensink.store.Demos", {
        alias: "store.Demos",
        extend: "Ext.data.TreeStore",
        requires: ["Kitchensink.model.Demo"],
        config: {
            model: "Kitchensink.model.Demo",
            root: a,
            defaultRootProperty: "items"
        }
    })
})();
Ext.define("Ext.form.Panel", {
    alternateClassName: "Ext.form.FormPanel",
    extend: "Ext.Panel",
    xtype: "formpanel",
    requires: ["Ext.XTemplate", "Ext.field.Checkbox", "Ext.Ajax"],
    config: {
        baseCls: Ext.baseCSSPrefix + "form",
        standardSubmit: false,
        url: null,
        baseParams: null,
        submitOnAction: true,
        record: null,
        method: "post",
        scrollable: {
            translationMethod: "scrollposition"
        }
    },
    getElementConfig: function () {
        var a = this.callParent();
        a.tag = "form";
        return a
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.on({
            action: "onFieldAction",
            scope: a
        });
        a.element.on({
            submit: "onSubmit",
            scope: a
        })
    },
    updateRecord: function (c) {
        var a, b, d;
        if (c && (a = c.fields)) {
            b = this.getValues();
            for (d in b) {
                if (b.hasOwnProperty(d) && a.containsKey(d)) {
                    c.set(d, b[d])
                }
            }
        }
        return this
    },
    setRecord: function (a) {
        var b = this;
        if (a && a.data) {
            b.setValues(a.data)
        }
        b._record = a;
        return this
    },
    onSubmit: function (b) {
        var a = this;
        if (b && !a.getStandardSubmit()) {
            b.stopEvent()
        }
        a.fireAction("submit", [a, a.getValues(true), b], "doSubmit")
    },
    doSubmit: function (b, a, c) {
        if (c) {
            c.stopEvent()
        }
    },
    onFieldAction: function (a) {
        if (this.getSubmitOnAction()) {
            a.blur();
            this.submit()
        }
    },
    submit: function (a) {
        var c = this,
            b = c.element.dom || {},
            d;
        a = Ext.apply({
            url: c.getUrl() || b.action,
            submit: false,
            method: c.getMethod() || b.method || "post",
            autoAbort: false,
            params: null,
            waitMsg: null,
            headers: null,
            success: null,
            failure: null
        }, a || {});
        d = c.getValues(c.getStandardSubmit() || !a.submitDisabled);
        return c.fireAction("beforesubmit", [c, d, a], "doBeforeSubmit")
    },
    doBeforeSubmit: function (c, d, a) {
        var b = c.element.dom || {};
        if (c.getStandardSubmit()) {
            if (a.url && Ext.isEmpty(b.action)) {
                b.action = a.url
            }
            b.method = (a.method || b.method).toLowerCase();
            b.submit()
        } else {
            if (a.waitMsg) {
                c.setMasked(a.waitMsg)
            }
            return Ext.Ajax.request({
                url: a.url,
                method: a.method,
                rawData: Ext.urlEncode(Ext.apply(Ext.apply({}, c.getBaseParams() || {}), a.params || {}, d)),
                autoAbort: a.autoAbort,
                headers: Ext.apply({
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                }, a.headers || {}),
                scope: c,
                callback: function (e, k, f) {
                    var h = this,
                        j = f.responseText,
                        g;
                    h.setMasked(false);
                    g = function () {
                        if (Ext.isFunction(a.failure)) {
                            a.failure.call(a.scope || h, h, f, j)
                        }
                        h.fireEvent("exception", h, f)
                    };
                    if (k) {
                        f = Ext.decode(j);
                        k = !! f.success;
                        if (k) {
                            if (Ext.isFunction(a.success)) {
                                a.success.call(a.scope || h, h, f, j)
                            }
                            h.fireEvent("submit", h, f)
                        } else {
                            g()
                        }
                    } else {
                        g()
                    }
                }
            })
        }
    },
    setValues: function (b) {
        var a = this.getFields(),
            c, e, d;
        b = b || {};
        for (c in b) {
            if (b.hasOwnProperty(c)) {
                e = a[c];
                d = b[c];
                if (e) {
                    if (Ext.isArray(e)) {
                        e.forEach(function (g) {
                            if (g.isRadio) {
                                g.setGroupValue(d)
                            } else {
                                if (Ext.isArray(b[c])) {
                                    g.setChecked((d.indexOf(g.getValue()) != -1))
                                } else {
                                    g.setChecked((d == g.getValue()))
                                }
                            }
                        })
                    } else {
                        if (e.setChecked) {
                            e.setChecked(d)
                        } else {
                            e.setValue(d)
                        }
                    }
                }
            }
        }
        return this
    },
    getValues: function (d) {
        var a = this.getFields(),
            b = {},
            g, c, f, e;
        for (c in a) {
            if (a.hasOwnProperty(c)) {
                if (Ext.isArray(a[c])) {
                    b[c] = [];
                    f = a[c].length;
                    for (e = 0; e < f; e++) {
                        g = a[c][e];
                        if (!g.getChecked) {
                            b[c] = g.getValue();
                            break
                        }
                        if (!(d && g.getDisabled())) {
                            if (g.isRadio) {
                                b[c] = g.getGroupValue()
                            } else {
                                b[c].push(g.getValue())
                            }
                        }
                    }
                } else {
                    g = a[c];
                    if (!(d && g.getDisabled())) {
                        if (g.isCheckbox) {
                            b[c] = (g.getChecked()) ? g.getValue() : null
                        } else {
                            b[c] = g.getValue()
                        }
                    }
                }
            }
        }
        return b
    },
    reset: function () {
        this.getFieldsAsArray().forEach(function (a) {
            a.reset()
        });
        return this
    },
    enable: function () {
        this.getFieldsAsArray().forEach(function (a) {
            a.enable()
        });
        return this
    },
    disable: function () {
        this.getFieldsAsArray().forEach(function (a) {
            a.disable()
        });
        return this
    },
    getFieldsAsArray: function () {
        var a = [],
            b = function (c) {
                if (c.isField) {
                    a.push(c)
                }
                if (c.isContainer) {
                    c.getItems().each(b)
                }
            };
        this.getItems().each(b);
        return a
    },
    getFields: function (b) {
        var a = {},
            d;
        var c = function (e) {
                if (e.isField) {
                    d = e.getName();
                    if ((b && d == b) || typeof b == "undefined") {
                        if (a.hasOwnProperty(d)) {
                            if (!Ext.isArray(a[d])) {
                                a[d] = [a[d]]
                            }
                            a[d].push(e)
                        } else {
                            a[d] = e
                        }
                    }
                }
                if (e.isContainer) {
                    e.items.each(c)
                }
            };
        this.getItems().each(c);
        return (b) ? (a[b] || []) : a
    },
    getFieldsArray: function () {
        var a = [];
        var b = function (c) {
                if (c.isField) {
                    a.push(c)
                }
                if (c.isContainer) {
                    c.items.each(b)
                }
            };
        this.items.each(b);
        return a
    },
    getFieldsFromItem: Ext.emptyFn,
    showMask: function (a, b) {
        a = Ext.isObject(a) ? a.message : a;
        if (a) {
            this.setMasked({
                xtype: "loadmask",
                message: a
            })
        } else {
            this.setMasked(true)
        }
        return this
    },
    hideMask: function () {
        this.setMasked(false);
        return this
    },
    getFocusedField: function () {
        var a = this.getFieldsArray(),
            c = a.length,
            d, b;
        for (b = 0; b < c; b++) {
            d = a[b];
            if (d.isFocused) {
                return d
            }
        }
        return null
    },
    getNextField: function () {
        var a = this.getFieldsArray(),
            c = this.getFocusedField(),
            d = a.length,
            b;
        if (c) {
            b = a.indexOf(c);
            if (b !== a.length - 1) {
                b++;
                return a[b]
            }
        }
        return false
    },
    focusNextField: function () {
        var a = this.getNextField();
        if (a) {
            a.focus();
            return a
        }
        return false
    },
    getPreviousField: function () {
        var a = this.getFieldsArray(),
            c = this.getFocusedField(),
            d = a.length,
            b;
        if (c) {
            b = a.indexOf(c);
            if (b !== 0) {
                b--;
                return a[b]
            }
        }
        return false
    },
    focusPreviousField: function () {
        var a = this.getPreviousField();
        if (a) {
            a.focus();
            return a
        }
        return false
    }
}, function () {});
Ext.define("Kitchensink.view.EditorPanel", {
    extend: "Ext.form.Panel",
    id: "editorPanel",
    config: {
        modal: true,
        hideOnMaskTap: false,
        centered: true,
        height: 200,
        width: 300,
        items: [{
            xtype: "fieldset",
            items: [{
                xtype: "textfield",
                name: "text",
                label: "Name"
            }]
        }, {
            docked: "top",
            xtype: "toolbar",
            title: "Edit Item"
        }, {
            docked: "bottom",
            xtype: "toolbar",
            items: [{
                text: "Cancel",
                handler: function () {
                    Ext.getCmp("editorPanel").hide()
                }
            }, {
                xtype: "spacer"
            }, {
                text: "Change",
                ui: "action",
                handler: function () {
                    var a = Ext.getCmp("editorPanel"),
                        b = a.getRecord();
                    if (b) {
                        b.set(a.getValues());
                        b.commit()
                    }
                    a.hide()
                }
            }]
        }]
    }
});



Ext.require("Ext.data.TreeStore", function (a) {
    Ext.define("Kitchensink.view.NestedList", {
        requires: ["Kitchensink.view.EditorPanel", "Kitchensink.model.Cars"],
        extend: "Ext.Container",
        config: {
            layout: "fit",
            items: [{
                xtype: "nestedlist",
                store: {
                    type: "tree",
                    id: "NestedListStore",
                    model: "Kitchensink.model.Cars",
                    root: {},
                    proxy: {
                        type: "ajax",
                        url: "carregions.json"
                    }
                },
                displayField: "text",
                listeners: {
                    leafitemtap: function (e, f, b, d) {
                        var c = Ext.getCmp("editorPanel") || new Kitchensink.view.EditorPanel();
                        c.setRecord(f.getStore().getAt(b));
                        if (!c.getParent()) {
                            Ext.Viewport.add(c)
                        }
                        c.show()
                    }
                }
            }]
        }
    })
});



Ext.define("Ext.field.Spinner", {
    extend: "Ext.field.Number",
    xtype: "spinnerfield",
    alternateClassName: "Ext.form.Spinner",
    requires: ["Ext.util.TapRepeater"],
    config: {
        cls: Ext.baseCSSPrefix + "spinner",
        minValue: Number.NEGATIVE_INFINITY,
        maxValue: Number.MAX_VALUE,
        increment: 0.1,
        accelerateOnTapHold: true,
        cycle: false,
        clearIcon: false,
        defaultValue: 0,
        tabIndex: -1,
        component: {
            disabled: true
        }
    },
    constructor: function () {
        this.callParent(arguments);
        if (!this.getValue()) {
            this.setValue(this.getDefaultValue())
        }
    },
    syncEmptyCls: Ext.emptyFn,
    getElementConfig: function () {
        var a = this.callParent(),
            b = Ext.baseCSSPrefix;
        a.children[0].children[1] = {
            cls: b + "component-outer-outer",
            reference: "outerElement",
            children: [{
                cls: b + "component-outer",
                reference: "innerElement"
            }]
        };
        return a
    },
    updateLabelAlign: function (b, e) {
        var a = this.renderElement,
            f = Ext.baseCSSPrefix,
            c = this.label,
            d = this.outerElement;
        if (b) {
            a.addCls(f + "label-align-" + b);
            if (b == "top") {
                c.insertBefore(this.fieldRow)
            } else {
                this.updateLabelWidth(this.getLabelWidth());
                if (b == "right") {
                    c.insertAfter(d)
                } else {
                    c.insertBefore(d)
                }
            }
        }
        if (e) {
            a.removeCls(f + "label-align-" + e)
        }
    },
    updateComponent: function (c) {
        this.callParent(arguments);
        var b = this.innerElement,
            a = this.getCls();
        if (c) {
            this.spinDownButton = Ext.Element.create({
                cls: a + "-button " + a + "-button-down",
                html: "-"
            });
            b.insertFirst(this.spinDownButton);
            this.spinUpButton = Ext.Element.create({
                cls: a + "-button " + a + "-button-up",
                html: "+"
            });
            b.appendChild(this.spinUpButton);
            this.downRepeater = this.createRepeater(this.spinDownButton, this.onSpinDown);
            this.upRepeater = this.createRepeater(this.spinUpButton, this.onSpinUp)
        }
    },
    applyValue: function (a) {
        a = parseFloat(a);
        if (isNaN(a) || a === null) {
            a = this.getDefaultValue()
        }
        a = Math.round(a * 10) / 10;
        return this.callParent([a])
    },
    createRepeater: function (c, b) {
        var d = this,
            a = Ext.create("Ext.util.TapRepeater", {
                el: c,
                accelerate: d.getAccelerateOnTapHold()
            });
        a.on({
            tap: b,
            touchstart: "onTouchStart",
            touchend: "onTouchEnd",
            scope: d
        });
        return a
    },
    onSpinDown: function () {
        if (!this.getDisabled()) {
            this.spin(true)
        }
    },
    onSpinUp: function () {
        if (!this.getDisabled()) {
            this.spin(false)
        }
    },
    onTouchStart: function (a) {
        if (!this.getDisabled()) {
            a.getEl().addCls(Ext.baseCSSPrefix + "button-pressed")
        }
    },
    onTouchEnd: function (a) {
        a.getEl().removeCls(Ext.baseCSSPrefix + "button-pressed")
    },
    spin: function (h) {
        var c = this,
            b = c.getValue(),
            a = c.getIncrement(),
            g = h ? "down" : "up",
            e = c.getMinValue(),
            f = c.getMaxValue(),
            d;
        if (h) {
            d = b - a
        } else {
            d = b + a
        }
        if (c.getCycle()) {
            if (b == e && d < e) {
                d = f
            }
            if (b == f && d > f) {
                d = e
            }
        }
        c.setValue(d);
        d = c.getValue();
        c.fireEvent("spin", c, d, g);
        c.fireEvent("spin" + g, c, d)
    },
    doSetDisabled: function (a) {
        Ext.Component.prototype.doSetDisabled.apply(this, arguments)
    },
    setDisabled: function () {
        Ext.Component.prototype.setDisabled.apply(this, arguments)
    },
    reset: function () {
        this.setValue(this.getDefaultValue())
    },
    destroy: function () {
        var a = this;
        Ext.destroy(a.downRepeater, a.upRepeater, a.spinDownButton, a.spinUpButton);
        a.callParent(arguments)
    }
}, function () {});
Ext.define("Ext.field.Radio", {
    extend: "Ext.field.Checkbox",
    xtype: "radiofield",
    alternateClassName: "Ext.form.Radio",
    isRadio: true,
    config: {
        ui: "radio",
        component: {
            type: "radio",
            cls: Ext.baseCSSPrefix + "input-radio"
        }
    },
    getValue: function () {
        return this._value
    },
    setValue: function (a) {
        this._value = a;
        return this
    },
    getGroupValue: function () {
        var a = this.getSameGroupFields(),
            c = a.length,
            b = 0,
            d;
        for (; b < c; b++) {
            d = a[b];
            if (d.getChecked()) {
                return d.getValue()
            }
        }
        return null
    },
    setGroupValue: function (d) {
        var a = this.getSameGroupFields(),
            c = a.length,
            b = 0,
            e;
        for (; b < c; b++) {
            e = a[b];
            if (e.getValue() === d) {
                e.setChecked(true);
                return e
            }
        }
    }
});
Ext.define("Ext.Map", {
    extend: "Ext.Component",
    xtype: "map",
    requires: ["Ext.util.GeoLocation"],
    isMap: true,
    config: {
        baseCls: Ext.baseCSSPrefix + "map",
        useCurrentLocation: false,
        map: null,
        geo: null,
        mapOptions: {}
    },
    constructor: function () {
        this.callParent(arguments);
        this.element.setVisibilityMode(Ext.Element.OFFSETS);
        if (!(window.google || {}).maps) {
            this.setHtml("Google Maps API is required")
        }
    },
    initialize: function () {
        this.callParent();
        this.on({
            painted: "doResize",
            scope: this
        });
        this.element.on("touchstart", "onTouchStart", this)
    },
    onTouchStart: function (a) {
        a.makeUnpreventable()
    },
    updateUseCurrentLocation: function (a) {
        this.setGeo(a);
        if (!a) {
            this.renderMap()
        }
    },
    applyGeo: function (a) {
        return Ext.factory(a, Ext.util.GeoLocation, this.getGeo())
    },
    updateGeo: function (b, a) {
        var c = {
            locationupdate: "onGeoUpdate",
            locationerror: "onGeoError",
            scope: this
        };
        if (a) {
            a.un(c)
        }
        if (b) {
            b.on(c);
            b.updateLocation()
        }
    },
    doResize: function () {
        var b = (window.google || {}).maps,
            a = this.getMap();
        if (b && a) {
            b.event.trigger(a, "resize")
        }
    },
    renderMap: function () {
        var d = this,
            f = (window.google || {}).maps,
            b = d.element,
            a = d.getMapOptions(),
            e = d.getMap(),
            c;
        if (f) {
            if (Ext.os.is.iPad) {
                Ext.merge({
                    navigationControlOptions: {
                        style: f.NavigationControlStyle.ZOOM_PAN
                    }
                }, a)
            }
            a = Ext.merge({
                zoom: 12,
                mapTypeId: f.MapTypeId.ROADMAP
            }, a);
            if (!a.hasOwnProperty("center")) {
                a.center = new f.LatLng(37.381592, -122.135672)
            }
            if (b.dom.firstChild) {
                Ext.fly(b.dom.firstChild).destroy()
            }
            if (e) {
                f.event.clearInstanceListeners(e)
            }
            d.setMap(new f.Map(b.dom, a));
            e = d.getMap();
            c = f.event;
            c.addListener(e, "zoom_changed", Ext.bind(d.onZoomChange, d));
            c.addListener(e, "maptypeid_changed", Ext.bind(d.onTypeChange, d));
            c.addListener(e, "center_changed", Ext.bind(d.onCenterChange, d));
            d.fireEvent("maprender", d, e)
        }
    },
    onGeoUpdate: function (a) {
        if (a) {
            this.setMapCenter(new google.maps.LatLng(a.getLatitude(), a.getLongitude()))
        }
    },
    onGeoError: Ext.emptyFn,
    setMapCenter: function (d) {
        var a = this,
            c = a.getMap(),
            b = (window.google || {}).maps;
        if (b) {
            d = d || new b.LatLng(37.381592, -122.135672);
            if (d && !(d instanceof b.LatLng) && "longitude" in d) {
                d = new b.LatLng(d.latitude, d.longitude)
            }
            if (!c) {
                a.renderMap();
                c = a.getMap()
            }
            if (c && d instanceof b.LatLng) {
                c.panTo(d)
            } else {
                this.setMapOptions(Ext.apply(this.getMapOptions(), {
                    center: d
                }))
            }
        }
    },
    onZoomChange: function () {
        var a = this.getMapOptions(),
            c = this.getMap(),
            b;
        b = (c && c.getZoom) ? c.getZoom() : a.zoom || 10;
        this.setMapOptions(Ext.apply(a, {
            zoom: b
        }));
        this.fireEvent("zoomchange", this, c, b)
    },
    onTypeChange: function () {
        var b = this.getMapOptions(),
            c = this.getMap(),
            a;
        a = (c && c.getMapTypeId) ? c.getMapTypeId() : b.mapTypeId;
        this.setMapOptions(Ext.apply(b, {
            mapTypeId: a
        }));
        this.fireEvent("typechange", this, c, a)
    },
    onCenterChange: function () {
        var b = this.getMapOptions(),
            c = this.getMap(),
            a;
        a = (c && c.getCenter) ? c.getCenter() : b.center;
        this.setMapOptions(Ext.apply(b, {
            center: a
        }));
        this.fireEvent("centerchange", this, c, a)
    },
    destroy: function () {
        Ext.destroy(this.getGeo());
        var a = this.getMap();
        if (a && (window.google || {}).maps) {
            google.maps.event.clearInstanceListeners(a)
        }
        this.callParent()
    }
}, function () {});
Ext.define("Kitchensink.view.Map", {
    extend: "Ext.Map"
});
Ext.define("Ext.picker.Picker", {
    extend: "Ext.Sheet",
    alias: "widget.picker",
    alternateClassName: "Ext.Picker",
    requires: ["Ext.picker.Slot", "Ext.Toolbar", "Ext.data.Model"],
    isPicker: true,
    config: {
        cls: Ext.baseCSSPrefix + "picker",
        doneButton: true,
        cancelButton: true,
        useTitles: false,
        slots: null,
        value: null,
        height: 220,
        layout: {
            type: "hbox",
            align: "stretch"
        },
        centered: false,
        left: 0,
        right: 0,
        bottom: 0,
        defaultType: "pickerslot",
        toolbar: true
    },
    initElement: function () {
        this.callParent(arguments);
        var b = this,
            a = Ext.baseCSSPrefix,
            c = this.innerElement;
        this.mask = c.createChild({
            cls: a + "picker-mask"
        });
        this.bar = this.mask.createChild({
            cls: a + "picker-bar"
        });
        b.on({
            scope: this,
            delegate: "pickerslot",
            slotpick: "onSlotPick"
        });
        b.on({
            scope: this,
            show: "onShow"
        })
    },
    applyToolbar: function (a) {
        if (a === true) {
            a = {}
        }
        Ext.applyIf(a, {
            docked: "top"
        });
        return Ext.factory(a, "Ext.TitleBar", this.getToolbar())
    },
    updateToolbar: function (a, b) {
        if (a) {
            this.add(a)
        }
        if (b) {
            this.remove(b)
        }
    },
    applyDoneButton: function (a) {
        if (a) {
            if (Ext.isBoolean(a)) {
                a = {}
            }
            if (typeof a == "string") {
                a = {
                    text: a
                }
            }
            Ext.applyIf(a, {
                ui: "action",
                align: "right",
                text: "Done"
            })
        }
        return Ext.factory(a, "Ext.Button", this.getDoneButton())
    },
    updateDoneButton: function (c, a) {
        var b = this.getToolbar();
        if (c) {
            b.add(c);
            c.on("tap", this.onDoneButtonTap, this)
        } else {
            if (a) {
                b.remove(a)
            }
        }
    },
    applyCancelButton: function (a) {
        if (a) {
            if (Ext.isBoolean(a)) {
                a = {}
            }
            if (typeof a == "string") {
                a = {
                    text: a
                }
            }
            Ext.applyIf(a, {
                align: "left",
                text: "Cancel"
            })
        }
        return Ext.factory(a, "Ext.Button", this.getCancelButton())
    },
    updateCancelButton: function (b, a) {
        var c = this.getToolbar();
        if (b) {
            c.add(b);
            b.on("tap", this.onCancelButtonTap, this)
        } else {
            if (a) {
                c.remove(a)
            }
        }
    },
    updateUseTitles: function (d) {
        var f = this.getInnerItems(),
            e = f.length,
            a = Ext.baseCSSPrefix + "use-titles",
            c, b;
        if (d) {
            this.addCls(a)
        } else {
            this.removeCls(a)
        }
        for (c = 0; c < e; c++) {
            b = f[c];
            if (b.isSlot) {
                b.setShowTitle(d)
            }
        }
    },
    applySlots: function (b) {
        if (b) {
            var c = b.length,
                a;
            for (a = 0; a < c; a++) {
                b[a].picker = this
            }
        }
        return b
    },
    updateSlots: function (a) {
        this.removeAll();
        if (a) {
            this.add(a)
        }
        this.updateUseTitles(this.getUseTitles())
    },
    onDoneButtonTap: function () {
        this.fireEvent("change", this, this.getValue());
        this.hide()
    },
    onCancelButtonTap: function () {
        this.fireEvent("cancel", this);
        this.hide()
    },
    onSlotPick: function (c, b, a) {
        this.fireEvent("pick", this, this.getValue(), c)
    },
    onShow: function () {
        if (!this.isHidden()) {
            this.setValue(this._value)
        }
    },
    setValue: function (a, e) {
        var d = this,
            c = d.getInnerItems(),
            b, g, f;
        if (!a) {
            return this
        }
        for (b in a) {
            value = a[b];
            for (i = 0; i < c.length; i++) {
                f = c[i];
                if (f.config.name == b) {
                    g = f;
                    break
                }
            }
            if (g) {
                if (e) {
                    g.setValueAnimated(value)
                } else {
                    g.setValue(value)
                }
            }
        }
        d._value = a;
        d._values = a;
        return d
    },
    setValueAnimated: function (a) {
        this.setValue(a, true)
    },
    getValue: function () {
        var d = this.getParent(),
            b = {},
            a = this.getItems().items,
            f = a.length,
            e, c;
        if (d) {
            for (c = 0; c < f; c++) {
                e = a[c];
                if (e && e.isSlot) {
                    b[e.getName()] = e.getValue()
                }
            }
            this._values = b
        }
        return this._values
    },
    getValues: function () {
        return this.getValue()
    },
    destroy: function () {
        this.callParent();
        Ext.destroy(this.mask, this.bar)
    }
}, function () {
    Ext.define("x-textvalue", {
        extend: "Ext.data.Model",
        config: {
            fields: ["text", "value"]
        }
    })
});

Ext.define("Ext.field.Select", {
    extend: "Ext.field.Text",
    xtype: "selectfield",
    alternateClassName: "Ext.form.Select",
    requires: ["Ext.Panel", "Ext.picker.Picker", "Ext.data.Store", "Ext.data.StoreManager", "Ext.List"],
    config: {
        ui: "select",
        valueField: "value",
        displayField: "text",
        store: null,
        options: null,
        hiddenName: null,
        component: {
            useMask: true
        },
        clearIcon: false,
        usePicker: "auto",
        defaultPhonePickerConfig: null,
        defaultTabletPickerConfig: null
    },
    constructor: function (a) {
        a = a || {};
        if (!a.store) {
            a.store = true
        }
        this.callParent([a])
    },
    initialize: function () {
        var b = this,
            a = b.getComponent();
        b.callParent();
        a.on({
            scope: b,
            masktap: "onMaskTap"
        });
        a.input.dom.disabled = true
    },
    updateDefaultPhonePickerConfig: function (b) {
        var a = this.picker;
        if (a) {
            a.setConfig(b)
        }
    },
    updateDefaultTabletPickerConfig: function (a) {
        var b = this.listPanel;
        if (b) {
            b.setConfig(a)
        }
    },
    applyUsePicker: function (a) {
        if (a == "auto") {
            a = (Ext.os.deviceType == "Phone")
        }
        return Boolean(a)
    },
    syncEmptyCls: Ext.emptyFn,
    applyValue: function (c) {
        var a = c,
            b;
        this.getOptions();
        if (!(c instanceof Ext.data.Model)) {
            b = this.getStore().find(this.getValueField(), c, null, null, null, true);
            if (b == -1) {
                b = this.getStore().find(this.getDisplayField(), c, null, null, null, true)
            }
            a = this.getStore().getAt(b)
        }
        return a
    },
    updateValue: function (b, a) {
        this.previousRecord = a;
        this.record = b;
        this.callParent([b ? b.get(this.getDisplayField()) : ""]);
        this.fireEvent("change", this, b, a)
    },
    getValue: function () {
        var a = this.record;
        return (a) ? a.get(this.getValueField()) : null
    },
    getRecord: function () {
        return this.record
    },
    getPhonePicker: function () {
        var a = this.getDefaultPhonePickerConfig();
        if (!this.picker) {
            this.picker = Ext.create("Ext.picker.Picker", Ext.apply({
                slots: [{
                    align: "center",
                    name: this.getName(),
                    valueField: this.getValueField(),
                    displayField: this.getDisplayField(),
                    value: this.getValue(),
                    store: this.getStore()
                }],
                listeners: {
                    change: this.onPickerChange,
                    scope: this
                }
            }, a))
        }
        return this.picker
    },
    getTabletPicker: function () {
        var a = this.getDefaultTabletPickerConfig();
        if (!this.listPanel) {
            this.listPanel = Ext.create("Ext.Panel", Ext.apply({
                centered: true,
                modal: true,
                cls: Ext.baseCSSPrefix + "select-overlay",
                layout: "fit",
                hideOnMaskTap: true,
                items: {
                    xtype: "list",
                    store: this.getStore(),
                    itemTpl: '<span class="x-list-label">{' + this.getDisplayField() + "}</span>",
                    listeners: {
                        select: this.onListSelect,
                        itemtap: this.onListTap,
                        scope: this
                    }
                }
            }, a))
        }
        return this.listPanel
    },
    onMaskTap: function () {
        if (this.getDisabled()) {
            return false
        }
        this.showPicker();
        return false
    },
    showPicker: function () {
        if (this.getStore().getCount() === 0) {
            return
        }
        if (this.getReadOnly()) {
            return
        }
        this.isFocused = true;
        if (this.getUsePicker()) {
            var e = this.getPhonePicker(),
                d = this.getName(),
                h = {};
            h[d] = this.record.get(this.getValueField());
            e.setValue(h);
            if (!e.getParent()) {
                Ext.Viewport.add(e)
            }
            e.show()
        } else {
            var f = this.getTabletPicker(),
                g = f.down("list"),
                b = g.getStore(),
                c = b.find(this.getValueField(), this.getValue(), null, null, null, true),
                a = b.getAt((c == -1) ? 0 : c);
            if (!f.getParent()) {
                Ext.Viewport.add(f)
            }
            f.showBy(this.getComponent());
            g.select(a, null, true)
        }
    },
    onListSelect: function (c, a) {
        var b = this;
        if (a) {
            b.setValue(a)
        }
    },
    onListTap: function () {
        this.listPanel.hide({
            type: "fade",
            out: true,
            scope: this
        })
    },
    onPickerChange: function (d, f) {
        var e = this,
            g = f[e.getName()],
            b = e.getStore(),
            c = b.find(e.getValueField(), g, null, null, null, true),
            a = b.getAt(c);
        e.setValue(a)
    },
    updateOptions: function (b) {
        var a = this.getStore();
        if (!b) {
            a.clearData()
        } else {
            a.setData(b);
            this.onStoreDataChanged(a)
        }
    },
    applyStore: function (a) {
        if (a === true) {
            a = Ext.create("Ext.data.Store", {
                fields: [this.getValueField(), this.getDisplayField()]
            })
        }
        if (a) {
            a = Ext.data.StoreManager.lookup(a);
            a.on({
                scope: this,
                addrecords: this.onStoreDataChanged,
                removerecords: this.onStoreDataChanged,
                updaterecord: this.onStoreDataChanged,
                refresh: this.onStoreDataChanged
            })
        }
        return a
    },
    updateStore: function (a) {
        if (a) {
            this.onStoreDataChanged(a)
        }
    },
    onStoreDataChanged: function (a) {
        var c = this.getInitialConfig(),
            b = this.getValue();
        if (Ext.isDefined(b)) {
            this.updateValue(this.applyValue(b))
        }
        if (this.getValue() === null) {
            if (c.hasOwnProperty("value")) {
                this.setValue(c.value)
            }
            if (this.getValue() === null) {
                if (a.getCount() > 0) {
                    this.setValue(a.getAt(0))
                }
            }
        }
    },
    doSetDisabled: function (a) {
        Ext.Component.prototype.doSetDisabled.apply(this, arguments)
    },
    setDisabled: function () {
        Ext.Component.prototype.setDisabled.apply(this, arguments)
    },
    reset: function () {
        var b = this.getStore(),
            a = (this.originalValue) ? this.originalValue : b.getAt(0);
        if (b && a) {
            this.setValue(a)
        }
        return this
    },
    onFocus: function (a) {
        this.fireEvent("focus", this, a);
        this.isFocused = true;
        this.showPicker()
    },
    destroy: function () {
        this.callParent(arguments);
        Ext.destroy(this.listPanel, this.picker, this.hiddenField)
    }
});
Ext.define("Ext.Video", {
    extend: "Ext.Media",
    xtype: "video",
    config: {
        posterUrl: null,
        cls: Ext.baseCSSPrefix + "video"
    },
    template: [{
        reference: "ghost",
        classList: [Ext.baseCSSPrefix + "video-ghost"]
    }, {
        tag: "video",
        reference: "media",
        classList: [Ext.baseCSSPrefix + "media"]
    }],
    initialize: function () {
        var a = this;
        a.callParent();
        a.media.hide();
        a.onBefore({
            erased: "onErased",
            scope: a
        });
        a.ghost.on({
            tap: "onGhostTap",
            scope: a
        });
        a.media.on({
            pause: "onPause",
            scope: a
        });
        if (Ext.os.is.Android4 || Ext.os.is.iPad) {
            this.isInlineVideo = true
        }
    },
    applyUrl: function (a) {
        return [].concat(a)
    },
    updateUrl: function (f) {
        var c = this,
            e = c.media,
            g = f.length,
            d = e.query("source"),
            b = d.length,
            a;
        for (a = 0; a < b; a++) {
            Ext.fly(d[a]).destroy()
        }
        for (a = 0; a < g; a++) {
            e.appendChild(Ext.Element.create({
                tag: "source",
                src: f[a]
            }))
        }
        if (c.getPlaying()) {
            c.play()
        }
    },
    onErased: function () {
        this.pause();
        this.media.setTop(-2000);
        this.ghost.show()
    },
    onGhostTap: function () {
        var a = this,
            c = this.media,
            b = this.ghost;
        c.show();
        if (Ext.os.is.Android2) {
            setTimeout(function () {
                a.play();
                setTimeout(function () {
                    c.hide()
                }, 10)
            }, 10)
        } else {
            b.hide();
            a.play();
            setTimeout(function () {
                a.play()
            }, 10)
        }
    },
    onPause: function () {
        this.callParent(arguments);
        if (!this.isInlineVideo) {
            this.media.setTop(-2000);
            this.ghost.show()
        }
    },
    onPlay: function () {
        this.callParent(arguments);
        this.media.setTop(0)
    },
    updatePosterUrl: function (b) {
        var a = this.ghost;
        if (a) {
            a.setStyle("background-image", "url(" + b + ")")
        }
    }
});

Ext.define("Ext.Audio", {
    extend: "Ext.Media",
    xtype: "audio",
    config: {
        cls: Ext.baseCSSPrefix + "audio"
    },
    onActivate: function () {
        var a = this;
        a.callParent();
        if (Ext.os.is.Phone) {
            a.element.show()
        }
    },
    onDeactivate: function () {
        var a = this;
        a.callParent();
        if (Ext.os.is.Phone) {
            a.element.hide()
        }
    },
    template: [{
        reference: "media",
        preload: "auto",
        tag: "audio",
        cls: Ext.baseCSSPrefix + "component"
    }]
});

Ext.define("Ext.carousel.Carousel", {
    extend: "Ext.Container",
    alternateClassName: "Ext.Carousel",
    xtype: "carousel",
    requires: ["Ext.fx.easing.EaseOut", "Ext.carousel.Item", "Ext.carousel.Indicator"],
    config: {
        baseCls: "x-carousel",
        direction: "horizontal",
        directionLock: false,
        animation: {
            duration: 250,
            easing: {
                type: "ease-out",
            }
        },
        indicator: true,
        ui: "dark",
        itemConfig: {},
        bufferSize: 1,
        itemLength: null
    },
    itemLength: 0,
    offset: 0,
    flickStartOffset: 0,
    flickStartTime: 0,
    dragDirection: 0,
    count: 0,
    painted: false,
    activeIndex: -1,
    beforeInitialize: function () {
        this.animationListeners = {
            animationframe: "onActiveItemAnimationFrame",
            animationend: "onActiveItemAnimationEnd",
            scope: this
        };
        this.element.on({
            dragstart: "onDragStart",
            drag: "onDrag",
            dragend: "onDragEnd",
            scope: this
        });
        this.on({
            painted: "onPainted",
            erased: "onErased",
            resize: "onSizeChange"
        });
        this.carouselItems = [];
        this.orderedCarouselItems = [];
        this.inactiveCarouselItems = [];
        this.hiddenTranslation = 0
    },
    updateBufferSize: function (n) {
        var l = Ext.carousel.Item,
            h = n * 2 + 1,
            m = this.isRendered(),
            c = this.innerElement,
            g = this.carouselItems,
            f = g.length,
            e = this.getItemConfig(),
            d = this.getItemLength(),
            j = this.getDirection(),
            b = j === "horizontal" ? "setWidth" : "setHeight",
            a, k;
        for (a = f; a < h; a++) {
            k = Ext.factory(e, l);
            if (d) {
                k[b].call(k, d)
            }
            g.push(k);
            c.append(k.renderElement);
            if (m && k.setRendered(true)) {
                k.fireEvent("renderedchange", this, k, true)
            }
        }
    },
    getActiveCarouselItem: function () {
        return this.orderedCarouselItems[this.getBufferSize()]
    },
    setRendered: function (g) {
        var a = this.rendered;
        if (g !== a) {
            this.rendered = g;
            var b = this.items.items,
                d = this.carouselItems,
                c, f, e;
            for (c = 0, f = b.length; c < f; c++) {
                e = b[c];
                if (!e.isInnerItem()) {
                    e.setRendered(g)
                }
            }
            for (c = 0, f = d.length; c < f; c++) {
                d[c].setRendered(g)
            }
            return true
        }
        return false
    },
    onPainted: function () {
        this.painted = true;
        this.refresh();
        this.refreshCarouselItems()
    },
    onErased: function () {
        this.painted = false
    },
    onSizeChange: function () {
        this.refreshSizing();
        this.refreshCarouselItems();
        this.refreshOffset()
    },
    onItemAdd: function (c, b) {
        this.callParent(arguments);
        var d = this.getInnerItems().indexOf(c),
            a = this.getIndicator();
        if (a && c.isInnerItem()) {
            a.addIndicator()
        }
        if (d <= this.getActiveIndex()) {
            this.refreshActiveIndex()
        }
        if (this.painted && this.isIndexDirty(d)) {
            this.refreshActiveItem()
        }
    },
    doItemLayoutAdd: function (a) {
        if (a.isInnerItem()) {
            return
        }
        this.callParent(arguments)
    },
    onItemRemove: function (f, b) {
        this.callParent(arguments);
        var h = this.getInnerItems().indexOf(f),
            a = this.getIndicator(),
            d = this.carouselItems,
            c, e, g;
        if (f.isInnerItem() && a) {
            a.removeIndicator()
        }
        if (h <= this.getActiveIndex()) {
            this.refreshActiveIndex()
        }
        if (this.isIndexDirty(h)) {
            for (c = 0, e = d.length; c < e; c++) {
                g = d[c];
                if (g.getComponent() === f) {
                    g.setComponent(null)
                }
            }
            if (this.painted) {
                this.refreshActiveItem()
            }
        }
    },
    doItemLayoutRemove: function (a) {
        if (a.isInnerItem()) {
            return
        }
        this.callParent(arguments)
    },
    onInnerItemMove: function (b, c, a) {
        if (this.painted && (this.isIndexDirty(c) || this.isIndexDirty(a))) {
            this.refreshActiveItem()
        }
    },
    doItemLayoutMove: function (a) {
        if (a.isInnerItem()) {
            return
        }
        this.callParent(arguments)
    },
    isIndexDirty: function (b) {
        var a = this.getActiveIndex(),
            c = this.getBufferSize();
        return (b >= a - c && b <= a + c)
    },
    onDragStart: function (f) {
        var d = this.getDirection(),
            b = f.absDeltaX,
            a = f.absDeltaY,
            c = this.getDirectionLock();
        this.isDragging = true;
        if (c) {
            if ((d === "horizontal" && b > a) || (d === "vertical" && a > b)) {
                f.stopPropagation()
            } else {
                this.isDragging = false;
                return
            }
        }
        if (this.isAnimating) {
            this.getActiveCarouselItem().getTranslatable().stopAnimation()
        }
        this.dragStartOffset = this.offset;
        this.dragDirection = 0
    },
    onDrag: function (k) {
        if (!this.isDragging) {
            return
        }
        var l = this.dragStartOffset,
            m = this.getDirection(),
            n = m === "horizontal" ? k.deltaX : k.deltaY,
            a = this.offset,
            j = this.flickStartTime,
            c = this.dragDirection,
            b = Ext.Date.now(),
            h = this.getActiveIndex(),
            f = this.getMaxItemIndex(),
            d = c,
            g;
        if ((h === 0 && n > 0) || (h === f && n < 0)) {
            n *= 0.5
        }
        g = l + n;
        if (g > a) {
            c = 1
        } else {
            if (g < a) {
                c = -1
            }
        }
        if (c !== d || (b - j) > 300) {
            this.flickStartOffset = a;
            this.flickStartTime = b
        }
        this.dragDirection = c;
        this.setOffset(g)
    },
    onDragEnd: function (k) {
        if (!this.isDragging) {
            return
        }
        this.onDrag(k);
        this.isDragging = false;
        var a = Ext.Date.now(),
            j = this.itemLength,
            g = j / 2,
            f = this.offset,
            n = this.getActiveIndex(),
            c = this.getMaxItemIndex(),
            h = 0,
            m = f - this.flickStartOffset,
            b = a - this.flickStartTime,
            l = this.getIndicator(),
            d;
        if (b > 0 && Math.abs(m) >= 10) {
            d = m / b;
            if (Math.abs(d) >= 1) {
                if (d < 0 && n < c) {
                    h = -1
                } else {
                    if (d > 0 && n > 0) {
                        h = 1
                    }
                }
            }
        }
        if (h === 0) {
            if (n < c && f < -g) {
                h = -1
            } else {
                if (n > 0 && f > g) {
                    h = 1
                }
            }
        }
        if (l) {
            l.setActiveIndex(n - h)
        }
        this.animationDirection = h;
        this.setOffsetAnimated(h * j)
    },
    applyAnimation: function (a) {
        a.easing = Ext.factory(a.easing, Ext.fx.easing.EaseOut);
        return a
    },
    updateDirection: function (b) {
        var a = this.getIndicator();
        this.currentAxis = (b === "horizontal") ? "x" : "y";
        if (a) {
            a.setDirection(b)
        }
    },
    setOffset: function (e) {
        var k = this.orderedCarouselItems,
            c = this.getBufferSize(),
            g = k[c],
            j = this.itemLength,
            d = this.currentAxis,
            a, h, b, f;
        this.offset = e;
        e += this.itemOffset;
        if (g) {
            g.translateAxis(d, e);
            for (f = 1, b = 0; f <= c; f++) {
                h = k[c - f];
                if (h) {
                    b += j;
                    h.translateAxis(d, e - b)
                }
            }
            for (f = 1, b = 0; f <= c; f++) {
                a = k[c + f];
                if (a) {
                    b += j;
                    a.translateAxis(d, e + b)
                }
            }
        }
        return this
    },
    setOffsetAnimated: function (c) {
        var b = this.orderedCarouselItems[this.getBufferSize()],
            a = this.getIndicator();
        if (a) {
            a.setActiveIndex(this.getActiveIndex() - this.animationDirection)
        }
        this.offset = c;
        c += this.itemOffset;
        if (b) {
            this.isAnimating = true;
            b.getTranslatable().on(this.animationListeners);
            b.translateAxis(this.currentAxis, c, this.getAnimation())
        }
        return this
    },
    onActiveItemAnimationFrame: function (k) {
        var j = this.orderedCarouselItems,
            c = this.getBufferSize(),
            h = this.itemLength,
            d = this.currentAxis,
            e = k[d],
            g, a, f, b;
        for (f = 1, b = 0; f <= c; f++) {
            g = j[c - f];
            if (g) {
                b += h;
                g.translateAxis(d, e - b)
            }
        }
        for (f = 1, b = 0; f <= c; f++) {
            a = j[c + f];
            if (a) {
                b += h;
                a.translateAxis(d, e + b)
            }
        }
    },
    onActiveItemAnimationEnd: function (b) {
        var c = this.getActiveIndex(),
            a = this.animationDirection,
            e = this.currentAxis,
            f = b[e],
            d = this.itemLength,
            g;
        this.isAnimating = false;
        b.un(this.animationListeners);
        if (a === -1) {
            g = d + f
        } else {
            if (a === 1) {
                g = f - d
            } else {
                g = f
            }
        }
        g -= this.itemOffset;
        this.offset = g;
        this.setActiveItem(c - a)
    },
    refresh: function () {
        this.refreshSizing();
        this.refreshActiveItem()
    },
    refreshSizing: function () {
        var a = this.element,
            b = this.getItemLength(),
            c, d;
        if (this.getDirection() === "horizontal") {
            d = a.getWidth()
        } else {
            d = a.getHeight()
        }
        this.hiddenTranslation = -d;
        if (b === null) {
            b = d;
            c = 0
        } else {
            c = (d - b) / 2
        }
        this.itemLength = b;
        this.itemOffset = c
    },
    refreshOffset: function () {
        this.setOffset(this.offset)
    },
    refreshActiveItem: function () {
        this.doSetActiveItem(this.getActiveItem())
    },
    getActiveIndex: function () {
        return this.activeIndex
    },
    refreshActiveIndex: function () {
        this.activeIndex = this.getInnerItemIndex(this.getActiveItem())
    },
    refreshCarouselItems: function () {
        var a = this.carouselItems,
            b, d, c;
        for (b = 0, d = a.length; b < d; b++) {
            c = a[b];
            c.getTranslatable().refresh()
        }
        this.refreshInactiveCarouselItems()
    },
    refreshInactiveCarouselItems: function () {
        var a = this.inactiveCarouselItems,
            f = this.hiddenTranslation,
            c = this.currentAxis,
            b, e, d;
        for (b = 0, e = a.length; b < e; b++) {
            d = a[b];
            d.translateAxis(c, f)
        }
    },
    getMaxItemIndex: function () {
        return this.innerItems.length - 1
    },
    getInnerItemIndex: function (a) {
        return this.innerItems.indexOf(a)
    },
    getInnerItemAt: function (a) {
        return this.innerItems[a]
    },
    applyActiveItem: function () {
        var b = this.callParent(arguments),
            a;
        if (b) {
            a = this.getInnerItemIndex(b);
            if (a !== -1) {
                this.activeIndex = a;
                return b
            }
        }
    },
    doSetActiveItem: function (g) {
        var q = this.getActiveIndex(),
            e = this.getMaxItemIndex(),
            m = this.getIndicator(),
            c = this.getBufferSize(),
            k = this.carouselItems.slice(),
            n = this.orderedCarouselItems,
            p = {},
            o = {},
            a, l, b, f, h, j, d;
        if (k.length === 0) {
            return
        }
        this.callParent(arguments);
        n.length = 0;
        if (g) {
            b = g.getId();
            o[b] = g;
            p[b] = c;
            if (q > 0) {
                for (f = 1; f <= c; f++) {
                    h = q - f;
                    if (h >= 0) {
                        a = this.getInnerItemAt(h);
                        b = a.getId();
                        o[b] = a;
                        p[b] = c - f
                    } else {
                        break
                    }
                }
            }
            if (q < e) {
                for (f = 1; f <= c; f++) {
                    h = q + f;
                    if (h <= e) {
                        a = this.getInnerItemAt(h);
                        b = a.getId();
                        o[b] = a;
                        p[b] = c + f
                    } else {
                        break
                    }
                }
            }
            for (f = 0, j = k.length; f < j; f++) {
                d = k[f];
                l = d.getComponent();
                if (l) {
                    b = l.getId();
                    if (p.hasOwnProperty(b)) {
                        k.splice(f, 1);
                        f--;
                        j--;
                        delete o[b];
                        n[p[b]] = d
                    }
                }
            }
            for (b in o) {
                if (o.hasOwnProperty(b)) {
                    a = o[b];
                    d = k.pop();
                    d.setComponent(a);
                    n[p[b]] = d
                }
            }
        }
        this.inactiveCarouselItems.length = 0;
        this.inactiveCarouselItems = k;
        this.refreshOffset();
        this.refreshInactiveCarouselItems();
        if (m) {
            m.setActiveIndex(q)
        }
    },
    next: function () {
        if (this.isAnimating) {
            this.getActiveCarouselItem().getTranslatable().stopAnimation();
            this.setOffset(0)
        }
        if (this.activeIndex === this.getMaxItemIndex()) {
            return this
        }
        this.animationDirection = -1;
        this.setOffsetAnimated(-this.itemLength);
        return this
    },
    previous: function () {
        if (this.isAnimating) {
            this.getActiveCarouselItem().getTranslatable().stopAnimation();
            this.setOffset(0)
        }
        if (this.activeIndex === 0) {
            return this
        }
        this.animationDirection = 1;
        this.setOffsetAnimated(this.itemLength);
        return this
    },
    applyIndicator: function (a, b) {
        return Ext.factory(a, Ext.carousel.Indicator, b)
    },
    updateIndicator: function (a) {
        if (a) {
            this.insertFirst(a);
            a.setUi(this.getUi());
            a.on({
                next: "next",
                previous: "previous",
                scope: this
            })
        }
    },
    destroy: function () {
        var a = this.carouselItems.slice();
        this.carouselItems.length = 0;
        Ext.destroy(a, this.getIndicator());
        this.callParent();
        delete this.carouselItems
    }
}, function () {});

Ext.define("Ext.tab.Bar", {
    extend: "Ext.Toolbar",
    alternateClassName: "Ext.TabBar",
    xtype: "tabbar",
    requires: ["Ext.tab.Tab"],
    config: {
        baseCls: Ext.baseCSSPrefix + "tabbar",
        defaultType: "tab",
        layout: {
            type: "hbox",
            align: "middle"
        }
    },
    eventedConfig: {
        activeTab: null
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.on({
            tap: "onTabTap",
            delegate: "> tab",
            scope: a
        })
    },
    onTabTap: function (a) {
        this.setActiveTab(a)
    },
    applyActiveTab: function (a, c) {
        if (!a && a !== 0) {
            return
        }
        var b = this.parseActiveTab(a);
        if (!b) {
            return
        }
        return b
    },
    doSetDocked: function (a) {
        var c = this.getLayout(),
            b = a == "bottom" ? "center" : "left";
        if (c.isLayout) {
            c.setPack(b)
        } else {
            c.pack = (c && c.pack) ? c.pack : b
        }
    },
    doSetActiveTab: function (b, a) {
        if (b) {
            b.setActive(true)
        }
        if (a) {
            a.setActive(false)
        }
    },
    parseActiveTab: function (a) {
        if (typeof a == "number") {
            return this.getInnerItems()[a]
        } else {
            if (typeof a == "string") {
                a = Ext.getCmp(a)
            }
        }
        return a
    }
});
Ext.define("Ext.tab.Panel", {
    extend: "Ext.Container",
    xtype: "tabpanel",
    alternateClassName: "Ext.TabPanel",
    requires: ["Ext.tab.Bar"],
    config: {
        ui: "dark",
        tabBar: true,
        tabBarPosition: "top",
        layout: {
            type: "card",
            animation: {
                type: "slide",
                direction: "left"
            }
        },
        cls: Ext.baseCSSPrefix + "tabpanel"
    },
    delegateListeners: {
        delegate: "> component",
        centeredchange: "onItemCenteredChange",
        dockedchange: "onItemDockedChange",
        floatingchange: "onItemFloatingChange",
        disabledchange: "onItemDisabledChange"
    },
    initialize: function () {
        this.callParent();
        this.on({
            order: "before",
            activetabchange: "doTabChange",
            delegate: "> tabbar",
            scope: this
        })
    },
    applyScrollable: function () {
        return false
    },
    updateUi: function (a, b) {
        this.callParent(arguments);
        if (this.initialized) {
            this.getTabBar().setUi(a)
        }
    },
    doActiveItemChange: function (a) {
        this.callParent(arguments);
        this.getTabBar().setActiveTab(this.getInnerItems().indexOf(a))
    },
    doSetActiveItem: function (d, k) {
        if (d) {
            var f = this.getInnerItems(),
                g = f.indexOf(k),
                j = f.indexOf(d),
                e = g > j,
                c = this.getLayout().getAnimation(),
                b = this.getTabBar(),
                h = b.parseActiveTab(g),
                a = b.parseActiveTab(j);
            if (c && c.setReverse) {
                c.setReverse(e)
            }
            this.callParent(arguments);
            if (j != -1) {
                this.getTabBar().setActiveTab(j);
                if (h) {
                    h.setActive(false)
                }
                if (a) {
                    a.setActive(true)
                }
            }
        }
    },
    doTabChange: function (a, e, d) {
        var b = a.indexOf(e),
            c = this.getActiveItem();
        this.setActiveItem(b);
        if (c == this.getActiveItem()) {
            return false
        }
    },
    applyTabBar: function (a) {
        if (a === true) {
            a = {}
        }
        if (a) {
            Ext.applyIf(a, {
                ui: this.getUi(),
                docked: this.getTabBarPosition()
            })
        }
        return Ext.factory(a, Ext.tab.Bar, this.getTabBar())
    },
    updateTabBar: function (a) {
        if (a) {
            this.add(a);
            this.setTabBarPosition(a.getDocked())
        }
    },
    updateTabBarPosition: function (b) {
        var a = this.getTabBar();
        if (a) {
            a.setDocked(b)
        }
    },
    onItemAdd: function (e) {
        var l = this;
        if (!e.isInnerItem()) {
            return l.callParent(arguments)
        }
        var c = l.getTabBar(),
            p = e.getInitialConfig(),
            d = p.tab || {},
            g = p.title,
            j = p.iconCls,
            k = p.hidden,
            o = p.disabled,
            q = p.badgeText,
            b = l.getInnerItems(),
            h = b.indexOf(e),
            m = c.getItems(),
            a = l.getInnerItems(),
            n = (m.length >= a.length) && m.getAt(h),
            f;
        if (g && !d.title) {
            d.title = g
        }
        if (j && !d.iconCls) {
            d.iconCls = j
        }
        if (k && !d.hidden) {
            d.hidden = k
        }
        if (o && !d.disabled) {
            d.disabled = o
        }
        if (q && !d.badgeText) {
            d.badgeText = q
        }
        f = Ext.factory(d, Ext.tab.Tab, n);
        if (!n) {
            c.insert(h, f)
        }
        e.tab = f;
        l.callParent(arguments)
    },
    onItemDisabledChange: function (a, b) {
        if (a && a.tab) {
            a.tab.setDisabled(b)
        }
    },
    onItemRemove: function (b, a) {
        this.getTabBar().remove(b.tab, this.getAutoDestroy());
        this.callParent(arguments)
    }
}, function () {});

Ext.define("Ext.picker.Date", {
    extend: "Ext.picker.Picker",
    xtype: "datepicker",
    alternateClassName: "Ext.DatePicker",
    requires: ["Ext.DateExtras"],
    config: {
        yearFrom: 1980,
        yearTo: new Date().getFullYear(),
        monthText: "Month",
        dayText: "Day",
        yearText: "Year",
        slotOrder: ["month", "day", "year"]
    },
    setValue: function (b, a) {
        if (Ext.isDate(b)) {
            b = {
                day: b.getDate(),
                month: b.getMonth() + 1,
                year: b.getFullYear()
            }
        }
        this.callParent([b, a])
    },
    getValue: function () {
        var h = {},
            a, g, c, f, e = this.getItems().items,
            d = e.length,
            j, b;
        for (b = 0; b < d; b++) {
            j = e[b];
            if (j instanceof Ext.picker.Slot) {
                h[j.getName()] = j.getValue()
            }
        }
        f = Ext.isNumber(h.year) ? h.year : 1;
        c = Ext.isNumber(h.month) ? h.month : 1;
        g = Ext.isNumber(h.day) ? h.day : 1;
        if (c && f && c && g) {
            a = this.getDaysInMonth(c, f)
        }
        g = (a) ? Math.min(g, a) : g;
        return new Date(f, c - 1, g)
    },
    updateYearFrom: function () {
        if (this.initialized) {
            this.createSlots()
        }
    },
    updateYearTo: function () {
        if (this.initialized) {
            this.createSlots()
        }
    },
    updateMonthText: function (a, b) {
        var f = this.getInnerItems,
            e = f.length,
            d, c;
        if (this.initialized) {
            for (c = 0; c < e; c++) {
                d = f[c];
                if ((typeof d.title == "string" && d.title == b) || (d.title.html == b)) {
                    d.setTitle(a)
                }
            }
        }
    },
    updateDayText: function (a, c) {
        var f = this.getInnerItems,
            e = f.length,
            d, b;
        if (this.initialized) {
            for (b = 0; b < e; b++) {
                d = f[b];
                if ((typeof d.title == "string" && d.title == c) || (d.title.html == c)) {
                    d.setTitle(a)
                }
            }
        }
    },
    updateYearText: function (e) {
        var d = this.getInnerItems,
            c = d.length,
            b, a;
        if (this.initialized) {
            for (a = 0; a < c; a++) {
                b = d[a];
                if (b.title == this.yearText) {
                    b.setTitle(e)
                }
            }
        }
    },
    constructor: function () {
        this.callParent(arguments);
        this.createSlots()
    },
    createSlots: function () {
        var k = this,
            c = this.getSlotOrder(),
            m = k.getYearFrom(),
            f = k.getYearTo(),
            g = [],
            l = [],
            b = [],
            j, e, d, a;
        if (m > f) {
            e = m;
            m = f;
            f = e
        }
        for (d = m; d <= f; d++) {
            g.push({
                text: d,
                value: d
            })
        }
        a = this.getDaysInMonth(1, new Date().getFullYear());
        for (d = 0; d < a; d++) {
            l.push({
                text: d + 1,
                value: d + 1
            })
        }
        for (d = 0, j = Ext.Date.monthNames.length; d < j; d++) {
            b.push({
                text: Ext.Date.monthNames[d],
                value: d + 1
            })
        }
        var h = [];
        c.forEach(function (n) {
            h.push(this.createSlot(n, l, b, g))
        }, this);
        k.setSlots(h)
    },
    createSlot: function (b, d, a, c) {
        switch (b) {
        case "year":
            return {
                name: "year",
                align: "center",
                data: c,
                title: this.getYearText(),
                flex: 3
            };
        case "month":
            return {
                name: b,
                align: "right",
                data: a,
                title: this.getMonthText(),
                flex: 4
            };
        case "day":
            return {
                name: "day",
                align: "center",
                data: d,
                title: this.getDayText(),
                flex: 2
            }
        }
    },
    getDaysInMonth: function (c, b) {
        var a = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return c == 2 && this.isLeapYear(b) ? 29 : a[c - 1]
    },
    isLeapYear: function (a) {
        return !!((a & 3) === 0 && (a % 100 || (a % 400 === 0 && a)))
    }
});
Ext.define("Ext.field.DatePicker", {
    extend: "Ext.field.Text",
    alternateClassName: "Ext.form.DatePicker",
    xtype: "datepickerfield",
    requires: ["Ext.picker.Date", "Ext.DateExtras"],
    config: {
        ui: "select",
        picker: true,
        clearIcon: false,
        destroyPickerOnHide: false,
        tabIndex: -1,
        dateFormat: null,
        component: {
            useMask: true
        }
    },
    initialize: function () {
        this.callParent();
        this.getComponent().on({
            scope: this,
            masktap: "onMaskTap"
        });
        this.getComponent().input.dom.disabled = true
    },
    syncEmptyCls: Ext.emptyFn,
    applyValue: function (a) {
        if (!Ext.isDate(a) && !Ext.isObject(a)) {
            a = null
        }
        if (Ext.isObject(a)) {
            a = new Date(a.year, a.month - 1, a.day)
        }
        return a
    },
    updateValue: function (b) {
        var a = this._picker;
        if (a && a.isPicker) {
            a.setValue(b)
        }
        if (b !== null) {
            this.getComponent().setValue(Ext.Date.format(b, this.getDateFormat() || Ext.util.Format.defaultDateFormat))
        } else {
            this.getComponent().setValue("")
        }
    },
    updateDateFormat: function (c, a) {
        var b = this.getValue();
        if (c != a && Ext.isDate(b) && this._picker && this._picker instanceof Ext.picker.Date) {
            this.getComponent().setValue(Ext.Date.format(b, c || Ext.util.Format.defaultDateFormat))
        }
    },
    getValue: function () {
        if (this._picker && this._picker instanceof Ext.picker.Date) {
            return this._picker.getValue()
        }
        return this._value
    },
    getFormattedValue: function (b) {
        var a = this.getValue();
        return (Ext.isDate(a)) ? Ext.Date.format(a, b || this.getDateFormat() || Ext.util.Format.defaultDateFormat) : a
    },
    applyPicker: function (b, a) {
        if (a && a.isPicker) {
            b = a.setConfig(b)
        }
        return b
    },
    getPicker: function () {
        var a = this._picker;
        if (a && !a.isPicker) {
            a = Ext.factory(a, Ext.picker.Date);
            a.on({
                scope: this,
                change: "onPickerChange",
                hide: "onPickerHide"
            });
            a.hide();
            a.setValue(this.getValue());
            Ext.Viewport.add(a);
            this._picker = a
        }
        return a
    },
    onMaskTap: function () {
        if (this.getDisabled()) {
            return false
        }
        if (this.getReadOnly()) {
            return false
        }
        this.getPicker().show();
        return false
    },
    onPickerChange: function (a, c) {
        var b = this;
        b.setValue(c);
        b.fireEvent("change", b, b.getValue())
    },
    onPickerHide: function () {
        var a = this.getPicker();
        if (this.getDestroyPickerOnHide() && a) {
            a.destroy();
            this.setPicker(null)
        }
    },
    reset: function () {
        this.setValue(this.originalValue)
    },
    destroy: function () {
        var a = this.getPicker();
        if (a) {
            a.destroy()
        }
        this.callParent(arguments)
    }
});
Ext.define("Ext.slider.Slider", {
    extend: "Ext.Container",
    xtype: "slider",
    requires: ["Ext.slider.Thumb", "Ext.fx.easing.EaseOut"],
    config: {
        baseCls: "x-slider",
        thumbConfig: {
            draggable: {
                translatable: {
                    easingX: {
                        duration: 300,
                        type: "ease-out"
                    }
                }
            }
        },
        value: 0,
        tabIndex: -1,
        minValue: 0,
        maxValue: 100,
        increment: 1,
        allowThumbsOverlapping: false,
        animation: true
    },
    elementWidth: 0,
    offsetValueRatio: 0,
    activeThumb: null,
    constructor: function (a) {
        a = a || {};
        if (a.hasOwnProperty("values")) {
            a.value = a.values
        }
        this.callParent([a])
    },
    initialize: function () {
        var a = this.element;
        this.callParent();
        a.on({
            scope: this,
            tap: "onTap"
        });
        this.on({
            scope: this,
            delegate: "> thumb",
            dragstart: "onThumbDragStart",
            drag: "onThumbDrag",
            dragend: "onThumbDragEnd"
        });
        this.on({
            painted: "refresh",
            resize: "refresh"
        })
    },
    factoryThumb: function () {
        return Ext.factory(this.getThumbConfig(), Ext.slider.Thumb)
    },
    getThumbs: function () {
        return this.innerItems
    },
    getThumb: function (a) {
        if (typeof a != "number") {
            a = 0
        }
        return this.innerItems[a]
    },
    refreshOffsetValueRatio: function () {
        var b = this.getMaxValue() - this.getMinValue(),
            a = this.elementWidth - this.thumbWidth;
        this.offsetValueRatio = a / b
    },
    refreshElementWidth: function () {
        this.elementWidth = this.element.dom.offsetWidth;
        this.thumbWidth = this.getThumb(0).getElementWidth()
    },
    refresh: function () {
        this.refreshElementWidth();
        this.refreshValue()
    },
    setActiveThumb: function (b) {
        var a = this.activeThumb;
        if (a && a !== b) {
            a.setZIndex(null)
        }
        this.activeThumb = b;
        b.setZIndex(2);
        return this
    },
    onThumbDragStart: function (a, b) {
        if (b.absDeltaX <= b.absDeltaY) {
            return false
        } else {
            b.stopPropagation()
        }
        if (this.getAllowThumbsOverlapping()) {
            this.setActiveThumb(a)
        }
        this.dragStartValue = this.getValue()[this.getThumbIndex(a)];
        this.fireEvent("dragstart", this, a, this.dragStartValue, b)
    },
    onThumbDrag: function (c, g, a) {
        var d = this.getThumbIndex(c),
            f = this.offsetValueRatio,
            b = this.constrainValue(a / f);
        g.stopPropagation();
        this.setIndexValue(d, b);
        this.fireEvent("drag", this, c, this.getValue(), g);
        return false
    },
    setIndexValue: function (d, g, f) {
        var c = this.getThumb(d),
            b = this.getValue(),
            e = this.offsetValueRatio,
            a = c.getDraggable();
        a.setOffset(g * e, null, f);
        b[d] = this.constrainValue(a.getOffset().x / e)
    },
    onThumbDragEnd: function (a, f) {
        this.refreshThumbConstraints(a);
        var c = this.getThumbIndex(a),
            d = this.getValue()[c],
            b = this.dragStartValue;
        this.fireEvent("dragend", this, a, this.getValue(), f);
        if (b !== d) {
            this.fireEvent("change", this, a, d, b)
        }
    },
    getThumbIndex: function (a) {
        return this.getThumbs().indexOf(a)
    },
    refreshThumbConstraints: function (d) {
        var b = this.getAllowThumbsOverlapping(),
            a = d.getDraggable().getOffset().x,
            c = this.getThumbs(),
            e = this.getThumbIndex(d),
            g = c[e - 1],
            h = c[e + 1],
            f = this.thumbWidth;
        if (g) {
            g.getDraggable().addExtraConstraint({
                max: {
                    x: a - ((b) ? 0 : f)
                }
            })
        }
        if (h) {
            h.getDraggable().addExtraConstraint({
                min: {
                    x: a + ((b) ? 0 : f)
                }
            })
        }
    },
    onTap: function (j) {
        if (this.isDisabled()) {
            return
        }
        var k = Ext.get(j.target);
        if (!k || k.hasCls("x-thumb")) {
            return
        }
        var n = j.touch.point.x,
            h = this.element,
            c = h.getX(),
            d = n - c - (this.thumbWidth / 2),
            o = this.constrainValue(d / this.offsetValueRatio),
            r = this.getValue(),
            q = Infinity,
            m = r.length,
            g, f, l, p, b, a;
        if (m === 1) {
            p = 0
        } else {
            for (g = 0; g < m; g++) {
                l = r[g];
                f = Math.abs(l - o);
                if (f < q) {
                    q = f;
                    p = g
                }
            }
        }
        b = r[p];
        a = this.getThumb(p);
        this.setIndexValue(p, o, this.getAnimation());
        this.refreshThumbConstraints(a);
        if (b !== o) {
            this.fireEvent("change", this, a, o, b)
        }
    },
    updateThumbs: function (a) {
        this.add(a)
    },
    applyValue: function (g) {
        var d = Ext.Array.from(g || 0),
            b = [],
            c = this.getMinValue(),
            a, e, f;
        for (e = 0, f = d.length; e < f; e++) {
            a = this.constrainValue(d[e]);
            if (a < c) {
                a = c
            }
            b.push(a);
            c = a
        }
        return b
    },
    updateValue: function (e, b) {
        var a = this.getThumbs(),
            d = e.length,
            c;
        this.setThumbsCount(d);
        for (c = 0; c < d; c++) {
            a[c].getDraggable().setExtraConstraint(null).setOffset(e[c] * this.offsetValueRatio)
        }
        for (c = 0; c < d; c++) {
            this.refreshThumbConstraints(a[c])
        }
    },
    refreshValue: function () {
        this.refreshOffsetValueRatio();
        this.setValue(this.getValue())
    },
    constrainValue: function (e) {
        var b = this,
            d = b.getMinValue(),
            f = b.getMaxValue(),
            a = b.getIncrement(),
            c;
        e = parseFloat(e);
        if (isNaN(e)) {
            e = d
        }
        c = e % a;
        e -= c;
        if (Math.abs(c) >= (a / 2)) {
            e += (c > 0) ? a : -a
        }
        e = Math.max(d, e);
        e = Math.min(f, e);
        return e
    },
    setThumbsCount: function (e) {
        var a = this.getThumbs(),
            f = a.length,
            c, d, b;
        if (f > e) {
            for (c = 0, d = f - e; c < d; c++) {
                b = a[a.length - 1];
                b.destroy()
            }
        } else {
            if (f < e) {
                for (c = 0, d = e - f; c < d; c++) {
                    this.add(this.factoryThumb())
                }
            }
        }
        return this
    },
    setValues: function (a) {
        this.setValue(a)
    },
    getValues: function () {
        return this.getValue()
    },
    applyIncrement: function (a) {
        if (a === 0) {
            a = 1
        }
        return Math.abs(a)
    },
    updateAllowThumbsOverlapping: function (b, a) {
        if (typeof a != "undefined") {
            this.refreshValue()
        }
    },
    updateMinValue: function (b, a) {
        if (typeof a != "undefined") {
            this.refreshValue()
        }
    },
    updateMaxValue: function (b, a) {
        if (typeof a != "undefined") {
            this.refreshValue()
        }
    },
    updateIncrement: function (b, a) {
        if (typeof a != "undefined") {
            this.refreshValue()
        }
    },
    doSetDisabled: function (c) {
        this.callParent(arguments);
        var a = this.getItems().items,
            d = a.length,
            b;
        for (b = 0; b < d; b++) {
            a[b].setDisabled(c)
        }
    }
}, function () {});
Ext.define("Ext.field.Slider", {
    extend: "Ext.field.Field",
    xtype: "sliderfield",
    requires: ["Ext.slider.Slider"],
    alternateClassName: "Ext.form.Slider",
    config: {
        cls: Ext.baseCSSPrefix + "slider-field",
        tabIndex: -1
    },
    proxyConfig: {
        value: 0,
        minValue: 0,
        maxValue: 100,
        increment: 1
    },
    constructor: function (a) {
        a = a || {};
        if (a.hasOwnProperty("values")) {
            a.value = a.values
        }
        this.callParent([a])
    },
    initialize: function () {
        this.callParent();
        this.getComponent().on({
            scope: this,
            change: "onSliderChange"
        })
    },
    applyComponent: function (a) {
        return Ext.factory(a, Ext.slider.Slider)
    },
    onSliderChange: function (c, a, d, b) {
        this.fireEvent("change", this, a, d, b)
    },
    setValues: function (a) {
        this.setValue(a)
    },
    getValues: function () {
        return this.getValue()
    },
    reset: function () {
        var b = this.config,
            a = (this.config.hasOwnProperty("values")) ? b.values : b.value;
        this.setValue(a)
    },
    doSetDisabled: function (a) {
        this.callParent(arguments);
        this.getComponent().setDisabled(a)
    }
});
Ext.define("Ext.slider.Toggle", {
    extend: "Ext.slider.Slider",
    config: {
        baseCls: "x-toggle",
        minValueCls: "x-toggle-off",
        maxValueCls: "x-toggle-on"
    },
    initialize: function () {
        this.callParent();
        this.on({
            change: "onChange"
        })
    },
    applyMinValue: function () {
        return 0
    },
    applyMaxValue: function () {
        return 1
    },
    applyIncrement: function () {
        return 1
    },
    setValue: function (b, a) {
        this.callParent(arguments);
        this.onChange(this, this.getThumbs()[0], b, a)
    },
    onChange: function (d, a, f, c) {
        var g = f > 0,
            b = d.getMaxValueCls(),
            e = d.getMinValueCls();
        this.element.addCls(g ? b : e);
        this.element.removeCls(g ? e : b)
    }
});
Ext.define("Ext.field.Toggle", {
    extend: "Ext.field.Slider",
    xtype: "togglefield",
    alternateClassName: "Ext.form.Toggle",
    requires: ["Ext.slider.Toggle"],
    config: {
        cls: "x-toggle-field"
    },
    proxyConfig: {
        minValueCls: "x-toggle-off",
        maxValueCls: "x-toggle-on"
    },
    applyComponent: function (a) {
        return Ext.factory(a, Ext.slider.Toggle)
    },
    setValue: function (a) {
        if (a === true) {
            a = 1
        }
        this.getComponent().setValue(a);
        return this
    },
    toggle: function () {
        var a = this.getValue();
        this.setValue((a == 1) ? 0 : 1);
        return this
    }
});
