/*

This file is part of Sencha Touch 2

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial Software License Agreement provided with the Software or, alternatively, in accordance with the terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/







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
    add: function (g, h, j, d) {
        var a = this.lateBindingMap,
            f = this.getAll(d),
            e = f.length,
            c, b;
        if (typeof g == "string" && h.isIdentifiable) {
            b = h.getId();
            if (a[b]) {
                if (a[b][g]) {
                    return false
                } else {
                    a[b][g] = true
                }
            } else {
                a[b] = {};
                a[b][g] = true
            }
        } else {
            if (e > 0) {
                while (e--) {
                    c = f[e];
                    if (c.fn === g && c.scope === h) {
                        c.options = j;
                        return false
                    }
                }
            }
        }
        c = this.create(g, h, j, d);
        if (j && j.prepend) {
            delete j.prepend;
            f.unshift(c)
        } else {
            f.push(c)
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
    setListenerStack: function (a) {
        this.listenerStack = a
    },
    fire: function (k, f) {
        var h = this.listenerStack,
            q = this.firingListeners,
            e = this.firingArguments,
            m = q.push,
            p = [],
            a = [],
            l, o, c, r, g, j, d, b, n;
        if (h) {
            l = h.listeners;
            o = l.before;
            c = l.current;
            r = l.after
        }
        if (!k) {
            k = []
        }
        if (f) {
            for (g = 0, j = f.length; g < j; g++) {
                d = f[g];
                n = d.fn;
                b = {
                    fn: n,
                    scope: d.scope,
                    options: d.options || {},
                    isLateBinding: typeof n == "string"
                };
                if (d.order === "before") {
                    p.push(b)
                } else {
                    a.push(b)
                }
            }
        }
        q.length = 0;
        if (o && o.length > 0) {
            m.apply(q, l.before)
        }
        if (p.length > 0) {
            m.apply(q, p)
        }
        if (c && c.length > 0) {
            m.apply(q, l.current)
        }
        if (a.length > 0) {
            m.apply(q, a)
        }
        if (r && r.length > 0) {
            m.apply(q, l.after)
        }
        if (q.length < 1) {
            return this
        }
        e.length = 0;
        e.push.apply(e, k);
        e.push(null, this);
        this.doFire();
        return this
    },
    doFire: function () {
        var e = this.listenerStack,
            l = this.firingListeners,
            c = this.firingArguments,
            h = c.length - 2,
            d, g, b, p, j, o, a, k, m, f, n;
        this.isPausing = false;
        this.isPaused = false;
        this.isStopped = false;
        this.isFiring = true;
        for (d = 0, g = l.length; d < g; d++) {
            b = l[d];
            p = b.options;
            j = b.fn;
            o = b.firingFn;
            a = b.boundFn;
            k = b.isLateBinding;
            m = b.scope;
            if (k && a && a !== m[j]) {
                a = false;
                o = false
            }
            if (!a) {
                if (k) {
                    a = m[j];
                    if (!a) {
                        continue
                    }
                } else {
                    a = j
                }
                b.boundFn = a
            }
            if (!o) {
                o = a;
                if (p.buffer) {
                    o = Ext.Function.createBuffered(o, p.buffer, m)
                }
                if (p.delay) {
                    o = Ext.Function.createDelayed(o, p.delay, m)
                }
                b.firingFn = o
            }
            c[h] = p;
            f = c;
            if (p.args) {
                f = p.args.concat(f)
            }
            if (p.single === true && e) {
                e.remove(j, m, b.order)
            }
            n = o.apply(m, f);
            if (n === false) {
                this.stop()
            }
            if (this.isStopped) {
                break
            } else {
                if (n && n instanceof Array) {
                    c = this.firingArguments = n.concat([null, this])
                }
            }
            if (this.isPausing) {
                this.isPaused = true;
                l.splice(0, d + 1);
                return
            }
        }
        this.isFiring = false;
        this.listenerStack = null;
        l.length = 0;
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
        this.listenerStack = null;
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
    constructor: function () {
        var b = this.handledEvents,
            a, c, e, d;
        a = this.handledEventsMap = {};
        for (c = 0, e = b.length; c < e; c++) {
            d = b[c];
            a[d] = true
        }
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


Ext.define("Ext.data.association.Association", {
    alternateClassName: "Ext.data.Association",
    primaryKey: "id",
    defaultReaderType: "json",
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
    constructor: function (b) {
        Ext.apply(this, b);
        var c = Ext.ModelManager.types,
            d = b.ownerModel,
            f = b.associatedModel,
            e = c[d],
            g = c[f],
            a;
        this.ownerModel = e;
        this.associatedModel = g;
        Ext.applyIf(this, {
            ownerName: d,
            associatedName: f
        })
    },
    getReader: function () {
        var c = this,
            a = c.reader,
            b = c.associatedModel;
        if (a) {
            if (Ext.isString(a)) {
                a = {
                    type: a
                }
            }
            if (a.isReader) {
                a.setModel(b)
            } else {
                Ext.applyIf(a, {
                    model: b,
                    type: c.defaultReaderType
                })
            }
            c.reader = Ext.createByAlias("reader." + a.type, a)
        }
        return c.reader || null
    }
});


Ext.define("Ext.data.IdGenerator", {
    isGenerator: true,
    constructor: function (a) {
        var b = this;
        Ext.apply(b, a);
        if (b.id) {
            Ext.data.IdGenerator.all[b.id] = b
        }
    },
    getRecId: function (a) {
        return a.modelName + "-" + a.internalId
    },
    statics: {
        all: {},
        get: function (a) {
            var c, d, b;
            if (typeof a == "string") {
                d = b = a;
                a = null
            } else {
                if (a.isGenerator) {
                    return a
                } else {
                    d = a.id || a.type;
                    b = a.type
                }
            }
            c = this.all[d];
            if (!c) {
                c = Ext.create("idgen." + b, a)
            }
            return c
        }
    }
});










Ext.define("Ext.data.Operation", {
    synchronous: true,
    action: undefined,
    filters: undefined,
    sorters: undefined,
    group: undefined,
    start: undefined,
    limit: undefined,
    batch: undefined,
    callback: undefined,
    scope: undefined,
    started: false,
    running: false,
    complete: false,
    success: undefined,
    exception: false,
    error: undefined,
    actionCommitRecordsRe: /^(?:create|update)$/i,
    actionSkipSyncRe: /^destroy$/i,
    constructor: function (a) {
        Ext.apply(this, a || {})
    },
    commitRecords: function (b) {
        var f = this,
            g, c, d, e, a;
        if (!f.actionSkipSyncRe.test(f.action)) {
            d = f.records;
            if (d && d.length) {
                g = Ext.create("Ext.util.MixedCollection", true, function (h) {
                    return h.getId()
                });
                g.addAll(d);
                for (c = b ? b.length : 0; c--;) {
                    e = b[c];
                    a = g.get(e.getId());
                    if (a) {
                        a.beginEdit();
                        a.set(e.data);
                        a.endEdit(true)
                    }
                }
                if (f.actionCommitRecordsRe.test(f.action)) {
                    for (c = d.length; c--;) {
                        d[c].commit()
                    }
                }
            }
        }
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
    getRecords: function () {
        var a = this.getResultSet();
        return (a === undefined ? this.records : a.records)
    },
    getResultSet: function () {
        return this.resultSet
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
    setBatch: function (a) {
        this.batch = a
    },
    allowWrite: function () {
        return this.action != "read"
    }
});


Ext.define("Ext.data.validations", {
    singleton: true,
    presenceMessage: "must be present",
    lengthMessage: "is the wrong length",
    formatMessage: "is the wrong format",
    inclusionMessage: "is not included in the list of acceptable values",
    exclusionMessage: "is not an acceptable value",
    emailMessage: "is not a valid email address",
    emailRe: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    presence: function (a, b) {
        if (b === undefined) {
            b = a
        }
        return !!b || b === 0
    },
    length: function (b, e) {
        if (e === undefined || e === null) {
            return false
        }
        var d = e.length,
            c = b.min,
            a = b.max;
        if ((c && d < c) || (a && d > a)) {
            return false
        } else {
            return true
        }
    },
    email: function (b, a) {
        return Ext.data.validations.emailRe.test(a)
    },
    format: function (a, b) {
        return !!(a.matcher && a.matcher.test(b))
    },
    inclusion: function (a, b) {
        return a.list && Ext.Array.indexOf(a.list, b) != -1
    },
    exclusion: function (a, b) {
        return a.list && Ext.Array.indexOf(a.list, b) == -1
    }
});








Ext.define("Ext.dom.Query", {
    extend: "Ext.dom.AbstractQuery",
    alternateClassName: "Ext.DomQuery"
}, function () {
    Ext.ns("Ext.core");
    Ext.core.DomQuery = Ext.DomQuery = new this();
    Ext.query = Ext.Function.alias(Ext.DomQuery, "select")
});






Ext.define("Ext.dom.Helper", {
    extend: "Ext.dom.AbstractHelper",
    alternateClassName: "Ext.DomHelper"
}, function () {
    Ext.ns("Ext.core");
    Ext.core.DomHelper = Ext.DomHelper = new this()
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
                        Ext.Object.each(f, function (j, i) {
                            h.override(i, function () {
                                g[j].apply(this, arguments);
                                return this.callOverridden(arguments)
                            })
                        })
                    }
                    if (c) {
                        Ext.Object.each(c, function (j, i) {
                            h.override(i, function () {
                                var k = this.callOverridden(arguments);
                                g[j].apply(this, arguments);
                                return k
                            })
                        })
                    }
                })
            }
        }
    }
});


Ext.define("Ext.mixin.Identifiable", {
    statics: {
        uniqueIds: {}
    },
    isIdentifiable: true,
    mixinId: "identifiable",
    idCleanRegex: /\.|[^\w\-]/g,
    defaultIdPrefix: "ext-",
    defaultIdSeparator: "-",
    getOptimizedId: function () {
        return this.id
    },
    getUniqueId: function () {
        var f = this.id,
            b, d, e, a, c;
        if (!f) {
            b = this.self.prototype;
            d = this.defaultIdSeparator;
            a = Ext.mixin.Identifiable.uniqueIds;
            if (!b.hasOwnProperty("identifiablePrefix")) {
                e = this.xtype;
                if (e) {
                    c = this.defaultIdPrefix + e + d
                } else {
                    c = b.$className.replace(this.idCleanRegex, d).toLowerCase() + d
                }
                b.identifiablePrefix = c
            }
            c = this.identifiablePrefix;
            if (!a.hasOwnProperty(c)) {
                a[c] = 0
            }
            f = this.id = c + (++a[c])
        }
        this.getUniqueId = this.getOptimizedId;
        return f
    },
    getId: function () {
        var a = this.id;
        if (!a) {
            a = this.getUniqueId()
        }
        this.getId = this.getOptimizedId;
        return a
    }
});


Ext.define("Ext.data.SortTypes", {
    singleton: true,
    none: function (a) {
        return a
    },
    stripTagsRE: /<\/?[^>]+>/gi,
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
        var b = parseFloat(String(a).replace(/,/g, ""));
        return isNaN(b) ? 0 : b
    },
    asInt: function (a) {
        var b = parseInt(String(a).replace(/,/g, ""), 10);
        return isNaN(b) ? 0 : b
    }
});


Ext.define("Ext.util.Filter", {
    anyMatch: false,
    exactMatch: false,
    caseSensitive: false,
    constructor: function (a) {
        Ext.apply(this, a);
        this.filter = this.filter || this.filterFn;
        if (this.filter == undefined) {
            if (this.property == undefined || this.value == undefined) {} else {
                this.filter = this.createFilterFn()
            }
            this.filterFn = this.filter
        }
    },
    createFilterFn: function () {
        var a = this,
            c = a.createValueMatcher(),
            b = a.property;
        return function (d) {
            return c.test(a.getRoot.call(a, d)[b])
        }
    },
    getRoot: function (a) {
        return this.root == undefined ? a : a[this.root]
    },
    createValueMatcher: function () {
        var d = this,
            e = d.value,
            f = d.anyMatch,
            c = d.exactMatch,
            a = d.caseSensitive,
            b = Ext.String.escapeRegex;
        if (!e.exec) {
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


Ext.define("Ext.util.Sorter", {
    direction: "ASC",
    constructor: function (a) {
        var b = this;
        Ext.apply(b, a);
        b.updateSortFunction()
    },
    createSortFunction: function (b) {
        var c = this,
            d = c.property,
            e = c.direction || "ASC",
            a = e.toUpperCase() == "DESC" ? -1 : 1;
        return function (g, f) {
            return a * b.call(c, g, f)
        }
    },
    defaultSorterFn: function (d, c) {
        var b = this,
            a = b.transform,
            f = b.getRoot(d)[b.property],
            e = b.getRoot(c)[b.property];
        if (a) {
            f = a(f);
            e = a(e)
        }
        return f > e ? 1 : (f < e ? -1 : 0)
    },
    getRoot: function (a) {
        return this.root == undefined ? a : a[this.root]
    },
    setDirection: function (b) {
        var a = this;
        a.direction = b;
        a.updateSortFunction()
    },
    toggle: function () {
        var a = this;
        a.direction = Ext.String.toggle(a.direction, "ASC", "DESC");
        a.updateSortFunction()
    },
    updateSortFunction: function () {
        var a = this;
        a.sort = a.createSortFunction(a.sorterFn || a.defaultSorterFn)
    }
});


Ext.define("Ext.data.writer.Writer", {
    alias: "writer.base",
    alternateClassName: ["Ext.data.DataWriter", "Ext.data.Writer"],
    writeAllFields: true,
    nameProperty: "name",
    constructor: function (a) {
        Ext.apply(this, a)
    },
    write: function (e) {
        var c = e.operation,
            b = c.records || [],
            a = b.length,
            d = 0,
            f = [];
        for (; d < a; d++) {
            f.push(this.getRecordData(b[d]))
        }
        return this.writeRecords(e, f)
    },
    getRecordData: function (e) {
        var i = e.phantom === true,
            b = this.writeAllFields || i,
            c = this.nameProperty,
            f = e.fields,
            d = {},
            h, a, g, j;
        if (b) {
            f.each(function (k) {
                if (k.persist) {
                    a = k[c] || k.name;
                    d[a] = e.get(k.name)
                }
            })
        } else {
            h = e.getChanges();
            for (j in h) {
                if (h.hasOwnProperty(j)) {
                    g = f.get(j);
                    a = g[c] || g.name;
                    d[a] = h[j]
                }
            }
            if (!i) {
                d[e.idProperty] = e.getId()
            }
        }
        return d
    }
});


Ext.define("Ext.data.ResultSet", {
    loaded: true,
    count: 0,
    total: 0,
    success: false,
    constructor: function (a) {
        Ext.apply(this, a);
        this.totalRecords = this.total;
        if (a.count === undefined) {
            this.count = this.records.length
        }
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
        if (!f) {
            if (b) {
                f = d[e] = {}
            } else {
                return null
            }
        }
        f = f[g];
        if (!f) {
            if (b) {
                f = d[e][g] = {}
            } else {
                return null
            }
        }
        a = f[c];
        if (!a) {
            if (b) {
                a = f[c] = new Ext.event.ListenerStack()
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
            a = this.controller = new Ext.event.Controller()
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
    registerPublisher: function (a) {
        var b = a.getTargetType(),
            c = this.activePublishers[b];
        if (!c) {
            c = this.activePublishers[b] = []
        }
        c.push(a);
        a.setDispatcher(this);
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
    clearListeners: function (d, e, a) {
        var c = this.listenerStacks,
            b = arguments.length;
        if (b === 3) {
            if (c[d] && c[d][e]) {
                delete c[d][e][a]
            }
        } else {
            if (b === 2) {
                if (c[d]) {
                    delete c[d][e]
                }
            } else {
                if (b === 1) {
                    delete c[d]
                } else {
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
    doDispatchEvent: function (a, g, f, i, c, b) {
        var h = this.getListenerStack(a, g, f),
            d = this.getWildcardListenerStacks(a, g, f),
            e;
        if (d.length > 0) {
            if (!c) {
                c = []
            }
            c.push({
                fn: this.fireListenerStacks,
                scope: this,
                options: {
                    args: [d, 0, a, g, f]
                },
                order: "after"
            })
        }
        if ((!h || h.length == 0) && (!c || c.length == 0)) {
            return
        }
        e = this.getController(a, g, f, b);
        e.setListenerStack(h);
        e.fire(i, c);
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
    },
    fireListenerStacks: function (j, e, a, f, d) {
        var g = j[e],
            i = j.length,
            c = this.getController(a, f, d),
            h = Array.prototype.slice.call(arguments, 5, -2),
            b;
        if (++e <= i - 1) {
            b = [{
                fn: this.fireListenerStacks,
                scope: this,
                options: {
                    args: [j, e, a, f, d]
                },
                order: "after"
            }]
        }
        c.setListenerStack(g);
        c.fire(h, b)
    }
});


Ext.define("Ext.event.Dom", {
    extend: "Ext.event.Event",
    constructor: function (a) {
        var b = a.target;
        if (b && b.nodeType !== 1) {
            b = b.parentNode
        }
        this.browserEvent = this.event = a;
        this.target = this.delegatedTarget = b;
        this.type = a.type;
        this.pageX = a.pageX;
        this.pageY = a.pageY;
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
    }
});
(function () {
    var a = 

Ext.define("Ext.mixin.Observable", {
        requires: ["Ext.event.Dispatcher"],
        extend: "Ext.mixin.Mixin",
        mixins: ["Ext.mixin.Identifiable"],
        mixinConfig: {
            id: "observable",
            beforeHooks: {
                constructor: "constructor"
            },
            hooks: {
                destroy: "destroy"
            }
        },
        alternateClassName: "Ext.util.Observable",
        statics: {
            releaseCapture: function (b) {
                console.log("TODO: static releaseCapture")
            },
            capture: function (d, c, b) {
                console.log("TODO: static capture")
            },
            observe: function (b, c) {
                console.log("TODO: static observe")
            }
        },
        isObservable: true,
        observableType: "observable",
        validIdRegex: /^([\w\-]+)$/,
        observableIdPrefix: "#",
        ADD_LISTENER_ACTION: "doAddListener",
        REMOVE_LISTENER_ACTION: "doRemoveListener",
        listenerOptionsRegex: /^(?:delegate|single|delay|buffer|args|prepend)$/,
        config: {
            listeners: null,
            bubbleEvents: null
        },
        constructor: function (b) {
            if (Ext.isObject(b)) {
                if ("listeners" in b) {
                    this.setListeners(b.listeners);
                    delete b.listeners
                }
                if ("bubbleEvents" in b) {
                    this.setBubbleEvents(b.bubbleEvents);
                    delete b.bubbleEvents
                }
            }
            return this
        },
        applyListeners: function (b) {
            if (b) {
                this.addListener(b)
            }
        },
        applyBubbleEvents: function (b) {
            if (b) {
                this.enableBubble(b)
            }
        },
        getOptimizedObservableId: function () {
            return this.observableId
        },
        getObservableId: function () {
            if (!this.observableId) {
                var b = this.getUniqueId();
                this.observableId = this.observableIdPrefix + b;
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
                this.getEventDispatcher = this.getOptimizedEventDispatcher
            }
            return this.eventDispatcher
        },
        getManagedListeners: function (d, c) {
            var e = d.getUniqueId(),
                b = this.managedListeners;
            if (!b) {
                this.managedListeners = b = {}
            }
            if (!b[e]) {
                b[e] = {};
                d.doAddListener("destroy", "clearManagedListeners", this, {
                    single: true,
                    args: [d]
                })
            }
            if (!b[e][c]) {
                b[e][c] = []
            }
            return b[e][c]
        },
        getUsedSelectors: function () {
            var b = this.usedSelectors;
            if (!b) {
                b = this.usedSelectors = [];
                b.$map = {}
            }
            return b
        },
        fireEvent: function (b) {
            var c = Array.prototype.slice.call(arguments, 1);
            return this.doFireEvent(b, c)
        },
        fireAction: function (c, e, g, f, d, b) {
            var h = [];
            if (e === undefined) {
                e = []
            }
            if (g !== undefined) {
                h.push({
                    fn: g,
                    scope: f || this,
                    options: d,
                    order: b
                })
            }
            return this.doFireEvent(c, e, h)
        },
        doFireEvent: function (c, d, f, b) {
            if (this.eventFiringSuspended) {
                return
            }
            var g = this.getObservableId(),
                e = this.getEventDispatcher();
            return e.dispatchEvent(this.observableType, g, c, d, f, b)
        },
        doAddListener: function (b, j, l, n, d) {
            if (typeof j !== "string" && typeof j !== "function") {
                l = j.scope || l;
                if (j.before) {
                    this.doAddListener(b, j.before, l, n, "before")
                }
                if (j.after) {
                    this.doAddListener(b, j.after, l, n, "current")
                }
                return
            }
            var f = (l && l !== this && l.isIdentifiable),
                m = this.getEventDispatcher(),
                c = this.getUsedSelectors(),
                g = c.$map,
                e = this.getObservableId(),
                h, k, i;
            if (!n) {
                n = {}
            }
            if (!l) {
                l = this
            }
            if (n.delegate) {
                i = n.delegate;
                e += " " + i
            }
            if (!(e in g)) {
                g[e] = true;
                c.push(e)
            }
            h = m.addListener(this.observableType, e, b, j, l, n, d);
            if (h && f) {
                k = this.getManagedListeners(l, b);
                k.push({
                    delegate: i,
                    scope: l,
                    fn: j,
                    order: d
                })
            }
            return h
        },
        doRemoveListener: function (c, l, n, o, e) {
            if (typeof l !== "string" && typeof l !== "function") {
                n = l.scope || n;
                if (l.before) {
                    this.doRemoveListener(c, l.before, n, o, "before")
                }
                if (l.after) {
                    this.doRemoveListener(c, l.after, n, o, "current")
                }
                return
            }
            var h = (n && n !== this && n.isIdentifiable),
                f = this.getObservableId(),
                b, m, g, j, d, k;
            if (o && o.delegate) {
                k = o.delegate;
                f += " " + k
            }
            if (!n) {
                n = this
            }
            b = this.getEventDispatcher().removeListener(this.observableType, f, c, l, n, e);
            if (b && h) {
                m = this.getManagedListeners(n, c);
                for (g = 0, j = m.length; g < j; g++) {
                    d = m[g];
                    if (d.fn === l && d.scope === n && d.delegate === k && d.order === e) {
                        m.splice(g, 1);
                        break
                    }
                }
            }
            return b
        },
        clearManagedListeners: function (e) {
            var k = this.managedListeners,
                b, d, j, g, f, h, c, l;
            if (!k) {
                return this
            }
            if (e) {
                if (typeof e != "string") {
                    b = e.getUniqueId()
                } else {
                    b = e
                }
                d = k[b];
                for (g in d) {
                    if (d.hasOwnProperty(g)) {
                        j = d[g];
                        for (f = 0, h = j.length; f < h; f++) {
                            c = j[f];
                            l = {};
                            if (c.delegate) {
                                l.delegate = c.delegate
                            }
                            if (this.doRemoveListener(g, c.fn, c.scope, l, c.order)) {
                                f--;
                                h--
                            }
                        }
                    }
                }
                delete k[b];
                return this
            }
            for (b in k) {
                if (k.hasOwnProperty(b)) {
                    this.clearManagedListeners(b)
                }
            }
        },
        changeListener: function (f, j, n, p, q, e) {
            var c, m, h, k, b, o, g, l, d;
            if (typeof n != "undefined") {
                if (typeof j != "string") {
                    for (g = 0, l = j.length; g < l; g++) {
                        b = j[g];
                        this[f](b, n, p, q, e)
                    }
                    return this
                }
                this[f](j, n, p, q, e)
            } else {
                if (Ext.isArray(j)) {
                    m = j;
                    for (g = 0, l = m.length; g < l; g++) {
                        d = m[g];
                        this[f](d.event, d.fn, d.scope, d, d.order)
                    }
                } else {
                    h = this.listenerOptionsRegex;
                    q = j;
                    c = [];
                    m = [];
                    k = {};
                    for (b in q) {
                        if (q.hasOwnProperty(b)) {
                            o = q[b];
                            if (b === "scope") {
                                p = o;
                                continue
                            } else {
                                if (b === "order") {
                                    e = o;
                                    continue
                                }
                            }
                            if (!h.test(b)) {
                                c.push(b);
                                m.push(o)
                            } else {
                                k[b] = o
                            }
                        }
                    }
                    for (g = 0, l = c.length; g < l; g++) {
                        this[f](c[g], m[g], p, k, e)
                    }
                }
            }
        },
        addListener: function (c, f, e, d, b) {
            return this.changeListener(this.ADD_LISTENER_ACTION, c, f, e, d, b)
        },
        addBeforeListener: function (b, e, d, c) {
            return this.addListener(b, e, d, c, "before")
        },
        addAfterListener: function (b, e, d, c) {
            return this.addListener(b, e, d, c, "after")
        },
        removeListener: function (c, f, e, d, b) {
            return this.changeListener(this.REMOVE_LISTENER_ACTION, c, f, e, d, b)
        },
        removeBeforeListener: function (b, e, d, c) {
            return this.removeListener(b, e, d, c, "before")
        },
        removeAfterListener: function (b, e, d, c) {
            return this.removeListener(b, e, d, c, "after")
        },
        clearListeners: function () {
            var f = this.getUsedSelectors(),
                d = this.getEventDispatcher(),
                c, e, b;
            for (c = 0, e = f.length; c < e; c++) {
                b = f[c];
                d.clearListeners(this.observableType, b)
            }
        },
        hasListener: function (b) {
            return this.getEventDispatcher().hasListener(this.observableType, this.getObservableId(), b)
        },
        suspendEvents: function (b) {
            this.eventFiringSuspended = true
        },
        resumeEvents: function () {
            this.eventFiringSuspended = false
        },
        relayEvents: function (c, e, h) {
            var d, g, f, b;
            if (typeof h == "undefined") {
                h = ""
            }
            if (typeof e == "string") {
                e = [e]
            }
            if (Ext.isArray(e)) {
                for (d = 0, g = e.length; d < g; d++) {
                    f = e[d];
                    b = h + f;
                    c.addListener(f, this.createEventRelayer(b), this)
                }
            } else {
                for (f in e) {
                    if (e.hasOwnProperty(f)) {
                        b = h + e[f];
                        c.addListener(f, this.createEventRelayer(b), this)
                    }
                }
            }
            return this
        },
        createEventRelayer: function (b) {
            return function () {
                return this.doFireEvent(b, Array.prototype.slice.call(arguments, 0, -2))
            }
        },
        enableBubble: function (e) {
            var b = this.isBubblingEnabled,
                d, f, c;
            if (!b) {
                b = this.isBubblingEnabled = {}
            }
            if (typeof e == "string") {
                e = Ext.Array.clone(arguments)
            }
            for (d = 0, f = e.length; d < f; d++) {
                c = e[d];
                if (!b[c]) {
                    b[c] = true;
                    this.addListener(c, this.createEventBubbler(c), this)
                }
            }
        },
        createEventBubbler: function (b) {
            return function c() {
                var d = ("getBubbleTarget" in this) ? this.getBubbleTarget() : null;
                if (d && d !== this && d.isObservable) {
                    d.fireAction(b, Array.prototype.slice.call(arguments, 0, -2), c, d, null, "after")
                }
            }
        },
        getBubbleTarget: function () {
            return false
        },
        destroy: function () {
            if (this.observableId) {
                this.fireEvent("destroy");
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
            unBefore: "addBeforeListener",
            unAfter: "addAfterListener"
        });
        Ext.deprecateClassMethod(this, "addEvents", function () {}, "addEvents() is deprecated. It's no longer needed to add events before firing");
        Ext.deprecateClassMethod(this, "addManagedListener", function (d, b, f, e, c) {
            return d.addListener(b, f, e, c)
        }, "addManagedListener() / mon() is deprecated, simply use addListener() / on(). All listeners are now automatically managed where necessary.");
        Ext.deprecateClassMethod(this, "removeManagedListener", function (c, b, e, d) {
            return c.removeListener(b, e, d)
        }, "removeManagedListener() / mun() is deprecated, simply use removeListener() / un(). All listeners are now automatically managed where necessary.");
        this.createAlias({
            mon: "addManagedListener",
            mun: "removeManagedListener"
        })
    })
})();


Ext.define("Ext.app.Controller", {
    alternateClassName: "Ext.Application",
    mixins: {
        observable: "Ext.util.Observable"
    },
    onClassExtended: function (i, c, h) {
        var g = Ext.getClassName(i),
            d = g.match(/^(.*)\.controller\./);
        if (d !== null) {
            var b = Ext.Loader.getPrefix(g) || d[1],
                f = h.onBeforeCreated,
                j = [],
                a = ["model", "view", "store"],
                e;
            h.onBeforeCreated = function (s, m) {
                var n, p, k, q, l, o, r;
                for (n = 0, p = a.length; n < p; n++) {
                    k = a[n];
                    q = Ext.Array.from(m[k + "s"]);
                    for (l = 0, o = q.length; l < o; l++) {
                        r = q[l];
                        e = Ext.Loader.getPrefix(r);
                        if (e === "" || e === r) {
                            j.push(b + "." + k + "." + r)
                        } else {
                            j.push(r)
                        }
                    }
                }
                Ext.require(j, Ext.Function.pass(f, arguments, this))
            }
        }
    },
    constructor: function (a) {
        this.mixins.observable.constructor.call(this, a);
        Ext.apply(this, a || {});
        this.createGetters("model", this.models);
        this.createGetters("store", this.stores);
        this.createGetters("view", this.views);
        if (this.refs) {
            this.ref(this.refs)
        }
        this.initialConfig = a
    },
    init: function (a) {},
    launch: function (a) {},
    createGetters: function (b, a) {
        b = Ext.String.capitalize(b);
        Ext.Array.each(a, function (d) {
            var c = "get",
                e = d.split(".");
            Ext.Array.each(e, function (f) {
                c += Ext.String.capitalize(f)
            });
            c += b;
            if (!this[c]) {
                this[c] = Ext.Function.pass(this["get" + b], [d], this)
            }
            this[c](d)
        }, this)
    },
    ref: function (a) {
        var b = this;
        a = Ext.Array.from(a);
        Ext.Array.each(a, function (e) {
            var d = e.ref,
                c = "get" + Ext.String.capitalize(d);
            if (!b[c]) {
                b[c] = Ext.Function.pass(b.getRef, [d, e], b)
            }
            b.references = b.references || [];
            b.references.push(d.toLowerCase())
        })
    },
    addRef: function (a) {
        return this.ref([a])
    },
    getRef: function (e, f, b) {
        this.refCache = this.refCache || {};
        f = f || {};
        b = b || {};
        Ext.apply(f, b);
        if (f.forceCreate) {
            return Ext.ComponentManager.create(f, "component")
        }
        var d = this,
            a = f.selector,
            c = d.refCache[e];
        if (!c) {
            d.refCache[e] = c = Ext.ComponentQuery.query(f.selector)[0];
            if (!c && f.autoCreate) {
                d.refCache[e] = c = Ext.ComponentManager.create(f, "component")
            }
            if (c) {
                c.on("beforedestroy", function () {
                    d.refCache[e] = null
                })
            }
        }
        return c
    },
    hasRef: function (a) {
        return this.references && this.references.indexOf(a.toLowerCase()) !== -1
    },
    control: function (a, b) {
        this.application.control(a, b, this)
    },
    getController: function (a) {
        return this.application.getController(a)
    },
    getStore: function (a) {
        return this.application.getStore(a)
    },
    getModel: function (a) {
        return this.application.getModel(a)
    },
    getView: function (a) {
        return this.application.getView(a)
    }
});


Ext.define("Ext.dom.Element", {
    extend: "Ext.dom.AbstractElement",
    alternateClassName: "Ext.Element",
    requires: ["Ext.dom.Query", "Ext.dom.Helper"],
    mixins: ["Ext.mixin.Observable"],
    observableType: "element",
    xtype: "element",
    WIDTH: "width",
    HEIGHT: "height",
    TOP: "top",
    RIGHT: "right",
    BOTTOM: "bottom",
    LEFT: "left",
    SEPARATOR: "-",
    spacesRegex: /\s+/,
    statics: {
        CREATE_ATTRIBUTES: {
            style: "style",
            className: "className",
            cls: "cls",
            classList: "classList",
            text: "text",
            hidden: "hidden",
            html: "html",
            children: "children"
        },
        create: function (c, b) {
            var f = this.CREATE_ATTRIBUTES,
                e, h, k, j, a, d, g;
            if (!c) {
                c = {}
            }
            if (c.isElement) {
                return c.dom
            } else {
                if ("nodeType" in c) {
                    return c
                }
            }
            if (typeof c == "string") {
                return document.createTextNode(c)
            }
            k = c.tag;
            if (!k) {
                k = "div"
            }
            e = document.createElement(k);
            h = e.style;
            for (a in c) {
                if (a != "tag" && c.hasOwnProperty(a)) {
                    j = c[a];
                    switch (a) {
                    case f.style:
                        if (typeof j == "string") {
                            e.setAttribute(a, j)
                        } else {
                            for (d in j) {
                                if (j.hasOwnProperty(d)) {
                                    h[d] = j[d]
                                }
                            }
                        }
                        break;
                    case f.className:
                    case f.cls:
                        e.className = j;
                        break;
                    case f.classList:
                        e.className = j.join(" ");
                        break;
                    case f.text:
                        e.textContent = j;
                        break;
                    case f.hidden:
                        if (j) {
                            e.style.display = "none"
                        }
                        break;
                    case f.html:
                        e.innerHTML = j;
                        break;
                    case f.children:
                        for (d = 0, g = j.length; d < g; d++) {
                            e.appendChild(this.create(j[d], true))
                        }
                        break;
                    default:
                        e.setAttribute(a, j)
                    }
                }
            }
            if (b) {
                return e
            } else {
                return Ext.get(e)
            }
        },
        documentElement: null,
        cache: {},
        get: function (c) {
            var b = this.cache,
                a, d, e;
            if (!c) {
                return null
            }
            if (typeof c == "string") {
                if (b.hasOwnProperty(c)) {
                    return b[c]
                }
                if (!(d = document.getElementById(c))) {
                    return null
                }
                b[c] = a = new this(d);
                return a
            }
            if ("tagName" in c) {
                e = c.id;
                if (b.hasOwnProperty(e)) {
                    return b[e]
                }
                a = new this(c);
                b[a.getId()] = a;
                return a
            }
            if (c.isElement) {
                return c
            }
            if (c.isComposite) {
                return c
            }
            if (Ext.isArray(c)) {
                return this.select(c)
            }
            if (c === document) {
                if (!this.documentElement) {
                    this.documentElement = new this(document.documentElement);
                    this.documentElement.setId("ext-application")
                }
                return this.documentElement
            }
            return null
        }
    },
    isElement: true,
    classNameSplitRegex: /[\s]+/,
    isSynchronized: false,
    constructor: function (a) {
        if (typeof a == "string") {
            a = document.getElementById(a)
        }
        if (!a) {
            throw new Error("Invalid domNode reference or an id of an existing domNode: " + a)
        }
        this.dom = a;
        this.getUniqueId()
    },
    getUniqueId: function () {
        var b = this.id,
            a;
        if (!b) {
            a = this.dom;
            if (a.id.length > 0) {
                this.id = b = a.id
            } else {
                a.id = b = this.mixins.identifiable.getUniqueId.call(this)
            }
            Ext.Element.cache[b] = this
        }
        return b
    },
    setId: function (c) {
        var a = this.id,
            b = Ext.Element.cache;
        if (a) {
            delete b[a]
        }
        this.dom.id = c;
        this.id = c;
        b[c] = this;
        return this
    },
    synchronize: function () {
        var g = this.dom,
            a = {},
            d = g.className,
            f, c, e, b;
        if (d.length > 0) {
            f = g.className.split(this.classNameSplitRegex);
            for (c = 0, e = f.length; c < e; c++) {
                b = f[c];
                a[b] = true
            }
        } else {
            f = []
        }
        this.classList = f;
        this.hasClassMap = a;
        this.isSynchronized = true;
        return this
    },
    addCls: function (j, g, k) {
        if (!j) {
            return this
        }
        if (!this.isSynchronized) {
            this.synchronize()
        }
        var e = this.dom,
            c = this.hasClassMap,
            d = this.classList,
            a = this.SEPARATOR,
            f, h, b;
        g = g ? g + a : "";
        k = k ? a + k : "";
        if (typeof j == "string") {
            j = j.split(this.spacesRegex)
        }
        for (f = 0, h = j.length; f < h; f++) {
            b = g + j[f] + k;
            if (!c[b]) {
                c[b] = true;
                d.push(b)
            }
        }
        e.className = d.join(" ");
        return this
    },
    removeCls: function (j, g, k) {
        if (!j) {
            return this
        }
        if (!this.isSynchronized) {
            this.synchronize()
        }
        if (!k) {
            k = ""
        }
        var e = this.dom,
            c = this.hasClassMap,
            d = this.classList,
            a = this.SEPARATOR,
            f, h, b;
        g = g ? g + a : "";
        k = k ? a + k : "";
        if (typeof j == "string") {
            j = j.split(this.spacesRegex)
        }
        for (f = 0, h = j.length; f < h; f++) {
            b = g + j[f] + k;
            if (c[b]) {
                delete c[b];
                Ext.Array.remove(d, b)
            }
        }
        e.className = d.join(" ");
        return this
    },
    replaceCls: function (b, a, c, d) {
        return this.removeCls(b, c, d).addCls(a, c, d)
    },
    hasCls: function (a) {
        if (!this.isSynchronized) {
            this.synchronize()
        }
        return this.hasClassMap.hasOwnProperty(a)
    },
    show: function () {
        this.dom.style.display = ""
    },
    hide: function () {
        this.dom.style.display = "none !important"
    },
    setHtml: function (a) {
        this.dom.innerHTML = a
    },
    setHTML: function () {
        this.setHtml.apply(this, arguments)
    },
    setText: function (a) {
        this.dom.textContent = a
    },
    setWidth: function (a) {
        return this.setLengthValue(this.WIDTH, a)
    },
    setHeight: function (a) {
        return this.setLengthValue(this.HEIGHT, a)
    },
    setTop: function (a) {
        return this.setLengthValue(this.TOP, a)
    },
    setRight: function (a) {
        return this.setLengthValue(this.RIGHT, a)
    },
    setBottom: function (a) {
        return this.setLengthValue(this.BOTTOM, a)
    },
    setLeft: function (a) {
        return this.setLengthValue(this.LEFT, a)
    },
    setMargin: function (a) {
        if (a || a === 0) {
            a = this.self.unitizeBox((a === true) ? 5 : a)
        } else {
            a = null
        }
        this.dom.style.margin = a
    },
    setPadding: function (a) {
        if (a || a === 0) {
            a = this.self.unitizeBox((a === true) ? 5 : a)
        } else {
            a = null
        }
        this.dom.style.padding = a
    },
    setBorder: function (a) {
        if (a || a === 0) {
            a = this.self.unitizeBox((a === true) ? 1 : a)
        } else {
            a = null
        }
        this.dom.style.borderWidth = a
    },
    setLengthValue: function (a, b) {
        if (typeof b == "number") {
            b = b + "px"
        } else {
            if (b === null) {
                b = "auto"
            }
        }
        this.dom.style[a] = b + " !important";
        return this
    },
    getParent: function () {
        return Ext.get(this.dom.parentNode)
    },
    getFirstChild: function () {
        return Ext.get(this.dom.firstElementChild)
    },
    append: function (a) {
        this.dom.appendChild(Ext.getDom(a));
        return this
    },
    insertFirst: function (b) {
        var a = Ext.getDom(b),
            d = this.dom,
            c = d.firstChild;
        if (!c) {
            d.appendChild(a)
        } else {
            d.insertBefore(a, c)
        }
        return this
    },
    wrap: function (b, c) {
        var e = this.dom,
            f = this.self.create(b, c),
            d = (c) ? f : f.dom,
            a = e.parentNode;
        if (a) {
            a.insertBefore(d, e)
        }
        d.appendChild(e);
        return f
    },
    wrapAllChildren: function (a) {
        var d = this.dom,
            b = d.childNodes,
            e = this.self.create(a),
            c = e.dom;
        while (b.length > 0) {
            c.appendChild(d.firstChild)
        }
        d.appendChild(c);
        return e
    },
    unwrapAllChildren: function () {
        var c = this.dom,
            b = c.childNodes,
            a = c.parentNode;
        if (a) {
            while (b.length > 0) {
                a.insertBefore(c, c.firstChild)
            }
            this.destroy()
        }
    },
    unwrap: function () {
        var c = this.dom,
            a = c.parentNode,
            b;
        if (a) {
            b = a.parentNode;
            b.insertBefore(c, a);
            b.removeChild(a)
        } else {
            b = document.createDocumentFragment();
            b.appendChild(c)
        }
        return this
    },
    redraw: function () {
        var b = this.dom,
            a = b.style;
        a.display = "none";
        b.offsetHeight;
        a.display = ""
    },
    isPainted: function () {
        return Boolean(this.dom.offsetParent)
    },
    destroy: function () {
        this.destroy = Ext.emptyFn;
        var a = this.self.cache,
            b = this.dom;
        if (b && b.parentNode && b.tagName != "BODY") {
            b.parentNode.removeChild(b)
        }
        delete a[this.id];
        delete this.dom
    }
}, function (a) {
    Ext.elements = Ext.cache = a.cache;
    Ext.get = function (b) {
        return a.get.call(a, b)
    }
});


Ext.define("Ext.dom.CompositeElementLite", {
    alternateClassName: ["Ext.CompositeElementLite", "Ext.CompositeElement"],
    requires: ["Ext.dom.Element"],
    statics: {
        importElementMethods: function () {
            var b, c = Ext.dom.Element.prototype,
                a = this.prototype;
            for (b in c) {
                if (typeof c[b] == "function") {
                    (function (d) {
                        a[d] = a[d] ||
                        function () {
                            return this.invoke(d, arguments)
                        }
                    }).call(a, b)
                }
            }
        }
    },
    constructor: function (b, a) {
        this.elements = [];
        this.add(b, a);
        this.el = new Ext.dom.AbstractElement.Fly()
    },
    isComposite: true,
    getElement: function (a) {
        return this.el.attach(a)
    },
    transformElement: function (a) {
        return Ext.getDom(a)
    },
    getCount: function () {
        return this.elements.length
    },
    add: function (c, a) {
        var e = this.elements,
            b, d;
        if (!c) {
            return this
        }
        if (typeof c == "string") {
            c = Ext.dom.Element.selectorFunction(c, a)
        } else {
            if (c.isComposite) {
                c = c.elements
            } else {
                if (!Ext.isIterable(c)) {
                    c = [c]
                }
            }
        }
        for (b = 0, d = c.length; b < d; ++b) {
            e.push(this.transformElement(c[b]))
        }
        return this
    },
    invoke: function (d, a) {
        var f = this.elements,
            e = f.length,
            c, b;
        for (b = 0; b < e; b++) {
            c = f[b];
            if (c) {
                Ext.dom.Element.prototype[d].apply(this.getElement(c), a)
            }
        }
        return this
    },
    item: function (b) {
        var c = this.elements[b],
            a = null;
        if (c) {
            a = this.getElement(c)
        }
        return a
    },
    addListener: function (b, h, g, f) {
        var d = this.elements,
            a = d.length,
            c, j;
        for (c = 0; c < a; c++) {
            j = d[c];
            if (j) {
                Ext.EventManager.on(j, b, h, g || j, f)
            }
        }
        return this
    },
    each: function (f, d) {
        var g = this,
            c = g.elements,
            a = c.length,
            b, h;
        for (b = 0; b < a; b++) {
            h = c[b];
            if (h) {
                h = this.getElement(h);
                if (f.call(d || h, h, g, b) === false) {
                    break
                }
            }
        }
        return g
    },
    fill: function (a) {
        var b = this;
        b.elements = [];
        b.add(a);
        return b
    },
    filter: function (a) {
        var b = [],
            d = this,
            c = Ext.isFunction(a) ? a : function (e) {
                return e.is(a)
            };
        d.each(function (g, e, f) {
            if (c(g, f) !== false) {
                b[b.length] = d.transformElement(g)
            }
        });
        d.elements = b;
        return d
    },
    indexOf: function (a) {
        return Ext.Array.indexOf(this.elements, this.transformElement(a))
    },
    replaceElement: function (e, c, a) {
        var b = !isNaN(e) ? e : this.indexOf(e),
            f;
        if (b > -1) {
            c = Ext.getDom(c);
            if (a) {
                f = this.elements[b];
                f.parentNode.insertBefore(c, f);
                Ext.removeNode(f)
            }
            Ext.Array.splice(this.elements, b, 1, c)
        }
        return this
    },
    clear: function () {
        this.elements = []
    },
    addElements: function (c, a) {
        if (!c) {
            return this
        }
        if (typeof c == "string") {
            c = Ext.dom.Element.selectorFunction(c, a)
        }
        var b = this.elements;
        Ext.each(c, function (d) {
            b.push(Ext.get(d))
        });
        return this
    },
    first: function () {
        return this.item(0)
    },
    last: function () {
        return this.item(this.getCount() - 1)
    },
    contains: function (a) {
        return this.indexOf(a) != -1
    },
    removeElement: function (c, e) {
        var b = this,
            d = this.elements,
            a;
        Ext.each(c, function (f) {
            if ((a = (d[f] || d[f = b.indexOf(f)]))) {
                if (e) {
                    if (a.dom) {
                        a.remove()
                    } else {
                        Ext.removeNode(a)
                    }
                }
                Ext.Array.erase(d, f, 1)
            }
        });
        return this
    }
}, function () {
    this.importElementMethods();
    this.prototype.on = this.prototype.addListener;
    if (Ext.DomQuery) {
        Ext.dom.Element.selectorFunction = Ext.DomQuery.select
    }
    Ext.dom.Element.select = function (a, b) {
        var c;
        if (typeof a == "string") {
            c = Ext.dom.Element.selectorFunction(a, b)
        } else {
            if (a.length !== undefined) {
                c = a
            } else {}
        }
        return new Ext.CompositeElementLite(c)
    };
    Ext.select = function () {
        return Ext.dom.Element.select.apply(Ext.dom.Element, arguments)
    }
});


Ext.define("Ext.event.publisher.Dom", {
    extend: "Ext.event.publisher.Publisher",
    requires: ["Ext.env.Browser", "Ext.Element", "Ext.event.Dom"],
    targetType: "element",
    idOrClassSelectorRegex: /^([#|\.])([\w\-]+)$/,
    handledEvents: ["click", "focus", "blur", "mousemove", "mousedown", "mouseup", "mouseover", "mouseout", "keyup", "keydown", "keypress", "transitionend", "animationstart", "animationend"],
    classNameSplitRegex: /\s+/,
    SELECTOR_ALL: "*",
    constructor: function () {
        var f = this.getHandledEvents(),
            e = {},
            b, c, a, d;
        this.doBubbleEventsMap = {
            click: true,
            mousedown: true,
            mousemove: true,
            mouseup: true,
            mouseover: true,
            mouseout: true,
            transitionend: true
        };
        this.onEvent = Ext.Function.bind(this.onEvent, this);
        this.subscribers = {};
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
            h, i;
        if (e !== null) {
            h = e[1];
            i = e[2];
            if (h === "#") {
                if (c[i]) {
                    return true
                }
                c[i] = true;
                c.$length++
            } else {
                if (d[i]) {
                    return true
                }
                d[i] = true;
                d.$length++
            }
        } else {
            if (b[g]) {
                return true
            }
            b[g] = true;
            b.push(g)
        }
        a.$length++;
        return true
    },
    unsubscribe: function (g, f) {
        if (!this.handles(f)) {
            return false
        }
        var e = g.match(this.idOrClassSelectorRegex),
            a = this.getSubscribers(f),
            c = a.id,
            d = a.className,
            b = a.selector,
            h, i;
        if (e !== null) {
            h = e[1];
            i = e[2];
            if (h === "#") {
                if (!c[i]) {
                    return true
                }
                delete c[i];
                c.$length--
            } else {
                if (!d[i]) {
                    return true
                }
                delete d[i];
                d.$length--
            }
        } else {
            if (!b[g]) {
                return true
            }
            delete b[g];
            Ext.Array.remove(b, g)
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
    doPublish: function (g, k, x, u) {
        var r = g.id,
            h = g.className,
            b = g.selector,
            p = r.$length > 0,
            a = h.$length > 0,
            m = b.length > 0,
            y = {},
            f = [u],
            q = false,
            n = this.classNameSplitRegex,
            e = this.SELECTOR_ALL,
            v, l, t, d, z, o, c, w, s;
        for (v = 0, l = x.length; v < l; v++) {
            z = x[v];
            u.setDelegatedTarget(z);
            if (p) {
                o = z.id;
                if (o) {
                    if (r[o] === true) {
                        q = true;
                        this.dispatch("#" + o, k, f)
                    }
                }
            }
            if (a) {
                c = z.className;
                if (c) {
                    w = c.split(n);
                    for (t = 0, d = w.length; t < d; t++) {
                        c = w[t];
                        if (!y[c]) {
                            y[c] = true;
                            if (h[c] === true) {
                                q = true;
                                this.dispatch("." + c, k, f)
                            }
                        }
                    }
                }
            }
            if (u.isStopped) {
                return q
            }
        }
        if (m) {
            for (v = 0, l = b.length; v < l; v++) {
                s = b[v];
                if (s === e && !q) {
                    u.setDelegatedTarget(u.browserEvent.target);
                    q = true;
                    this.dispatch(e, k, f)
                } else {
                    for (t = 0, d = x.length; t < d; t++) {
                        z = x[t];
                        if (this.matchesSelector(z, s)) {
                            u.setDelegatedTarget(z);
                            q = true;
                            this.dispatch(s, k, f)
                        }
                        if (u.isStopped) {
                            return q
                        }
                    }
                }
                if (u.isStopped) {
                    return q
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


Ext.define("Ext.ModelManager", {
    extend: "Ext.AbstractManager",
    alternateClassName: "Ext.ModelMgr",
    requires: ["Ext.data.association.Association"],
    singleton: true,
    typeName: "mtype",
    associationStack: [],
    registerType: function (c, b) {
        var d = b.prototype,
            a;
        if (d && d.isModel) {
            a = b
        } else {
            if (!b.extend) {
                b.extend = "Ext.data.Model"
            }
            a = 

Ext.define(c, b)
        }
        this.types[c] = a;
        return a
    },
    onModelDefined: function (c) {
        var a = this.associationStack,
            f = a.length,
            e = [],
            b, d, g;
        for (d = 0; d < f; d++) {
            b = a[d];
            if (b.associatedModel == c.modelName) {
                e.push(b)
            }
        }
        for (d = 0, f = e.length; d < f; d++) {
            g = e[d];
            this.types[g.ownerModel].prototype.associations.add(Ext.data.association.Association.create(g));
            Ext.Array.remove(a, g)
        }
    },
    registerDeferredAssociation: function (a) {
        this.associationStack.push(a)
    },
    getModel: function (b) {
        var a = b;
        if (typeof a == "string") {
            a = this.types[a]
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


Ext.define("Ext.data.Types", {
    singleton: true,
    requires: ["Ext.data.SortTypes"]
}, function () {
    var a = Ext.data.SortTypes;
    Ext.apply(Ext.data.Types, {
        stripRe: /[\$,%]/g,
        AUTO: {
            convert: function (b) {
                return b
            },
            sortType: a.none,
            type: "auto"
        },
        STRING: {
            convert: function (c) {
                var b = this.useNull ? null : "";
                return (c === undefined || c === null) ? b : String(c)
            },
            sortType: a.asUCString,
            type: "string"
        },
        INT: {
            convert: function (b) {
                return b !== undefined && b !== null && b !== "" ? parseInt(String(b).replace(Ext.data.Types.stripRe, ""), 10) : (this.useNull ? null : 0)
            },
            sortType: a.none,
            type: "int"
        },
        FLOAT: {
            convert: function (b) {
                return b !== undefined && b !== null && b !== "" ? parseFloat(String(b).replace(Ext.data.Types.stripRe, ""), 10) : (this.useNull ? null : 0)
            },
            sortType: a.none,
            type: "float"
        },
        BOOL: {
            convert: function (b) {
                if (this.useNull && (b === undefined || b === null || b === "")) {
                    return null
                }
                return b === true || b === "true" || b == 1
            },
            sortType: a.none,
            type: "bool"
        },
        DATE: {
            convert: function (c) {
                var d = this.dateFormat,
                    b;
                if (!c) {
                    return null
                }
                if (Ext.isDate(c)) {
                    return c
                }
                if (d) {
                    if (d == "timestamp") {
                        return new Date(c * 1000)
                    }
                    if (d == "time") {
                        return new Date(parseInt(c, 10))
                    }
                    return Ext.Date.parse(c, d)
                }
                b = Date.parse(c);
                return b ? new Date(b) : null
            },
            sortType: a.asDate,
            type: "date"
        }
    });
    Ext.apply(Ext.data.Types, {
        BOOLEAN: this.BOOL,
        INTEGER: this.INT,
        NUMBER: this.FLOAT
    })
});


Ext.define("Ext.data.Field", {
    requires: ["Ext.data.Types", "Ext.data.SortTypes"],
    alias: "data.field",
    constructor: function (b) {
        if (Ext.isString(b)) {
            b = {
                name: b
            }
        }
        Ext.apply(this, b);
        var d = Ext.data.Types,
            a = this.sortType,
            c;
        if (this.type) {
            if (Ext.isString(this.type)) {
                this.type = d[this.type.toUpperCase()] || d.AUTO
            }
        } else {
            this.type = d.AUTO
        }
        if (Ext.isString(a)) {
            this.sortType = Ext.data.SortTypes[a]
        } else {
            if (Ext.isEmpty(a)) {
                this.sortType = this.type.sortType
            }
        }
        if (!this.convert) {
            this.convert = this.type.convert
        }
    },
    dateFormat: null,
    useNull: false,
    defaultValue: "",
    mapping: null,
    sortType: null,
    sortDir: "ASC",
    allowBlank: true,
    persist: true
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
                    k = l.filterFn,
                    j = l.scope;
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
        function (i, c) {
            return i - c
        };
        for (d = 0, e = f.length; d < e; d++) {
            g[g.length] = {
                key: l[d],
                value: f[d],
                index: d
            }
        }
        Ext.Array.sort(g, function (i, c) {
            var m = j(i[k], c[k]) * b;
            if (m === 0) {
                m = (i.index < c.index ? -1 : 1)
            }
            return m
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
        Ext.Array.sort(a, function (i, h) {
            var j = c(i.value, h.value);
            if (j === 0) {
                j = (i.index < h.index ? -1 : 1)
            }
            return j
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


Ext.define("Ext.data.StoreManager", {
    extend: "Ext.util.MixedCollection",
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
            return Ext.data.AbstractStore.create(c)
        }
    },
    getKey: function (a) {
        return a.storeId
    }
}, function () {
    Ext.regStore = function (c, b) {
        var a;
        if (Ext.isObject(c)) {
            b = c
        } else {
            b.storeId = c
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


Ext.define("Ext.data.Errors", {
    extend: "Ext.util.MixedCollection",
    isValid: function () {
        return this.length === 0
    },
    getByField: function (e) {
        var d = [],
            a, c, b;
        for (b = 0; b < this.length; b++) {
            a = this.items[b];
            if (a.field == e) {
                d.push(a)
            }
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
    url: null,
    async: true,
    method: null,
    username: "",
    password: "",
    disableCaching: true,
    disableCachingParam: "_dc",
    timeout: 30000,
    useDefaultHeader: true,
    defaultPostHeader: "application/x-www-form-urlencoded; charset=UTF-8",
    useDefaultXhrHeader: true,
    defaultXhrHeader: "XMLHttpRequest",
    constructor: function (a) {
        a = a || {};
        Ext.apply(this, a);
        this.requests = {};
        this.mixins.observable.constructor.call(this)
    },
    request: function (j) {
        j = j || {};
        var f = this,
            i = j.scope || window,
            e = j.username || f.username,
            g = j.password || f.password || "",
            b, c, d, a, h;
        if (f.fireEvent("beforerequest", f, j) !== false) {
            c = f.setOptions(j, i);
            if (this.isFormUpload(j) === true) {
                this.upload(j.form, c.url, c.data, j);
                return null
            }
            if (j.autoAbort === true || f.autoAbort) {
                f.abort()
            }
            h = this.getXhrInstance();
            b = j.async !== false ? (j.async || f.async) : false;
            if (e) {
                h.open(c.method, c.url, b, e, g)
            } else {
                h.open(c.method, c.url, b)
            }
            a = f.setupHeaders(h, j, c.data, c.params);
            d = {
                id: ++Ext.data.Connection.requestId,
                xhr: h,
                headers: a,
                options: j,
                async: b,
                timeout: setTimeout(function () {
                    d.timedout = true;
                    f.abort(d)
                }, j.timeout || f.timeout)
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
            Ext.callback(j.callback, j.scope, [j, undefined, undefined]);
            return null
        }
    },
    upload: function (e, c, i, k) {
        e = Ext.getDom(e);
        k = k || {};
        var d = Ext.id(),
            g = document.createElement("iframe"),
            j = [],
            h = "multipart/form-data",
            f = {
                target: e.target,
                method: e.method,
                encoding: e.encoding,
                enctype: e.enctype,
                action: e.action
            },
            b = function (l, m) {
                a = document.createElement("input");
                Ext.fly(a).set({
                    type: "hidden",
                    value: m,
                    name: l
                });
                e.appendChild(a);
                j.push(a)
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
        if (i) {
            Ext.iterate(Ext.Object.fromQueryString(i), function (l, m) {
                if (Ext.isArray(m)) {
                    Ext.each(m, function (n) {
                        b(l, n)
                    })
                } else {
                    b(l, m)
                }
            })
        }
        Ext.fly(g).on("load", Ext.Function.bind(this.onUploadComplete, this, [g, k]), null, {
            single: true
        });
        e.submit();
        Ext.fly(e).set(f);
        Ext.each(j, function (l) {
            Ext.removeNode(l)
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
                    if (/textarea/i.test((f = g.body.firstChild || {}).tagName)) {
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
            return (a.isUpload || (/multipart\/form-data/i).test(b.getAttribute("enctype")))
        }
        return false
    },
    getForm: function (a) {
        return Ext.getDom(a.form) || null
    },
    setOptions: function (k, j) {
        var h = this,
            e = k.params || {},
            g = h.extraParams,
            d = k.urlParams,
            c = k.url || h.url,
            i = k.jsonData,
            b, a, f;
        if (Ext.isFunction(e)) {
            e = e.call(j, k)
        }
        if (Ext.isFunction(c)) {
            c = c.call(j, k)
        }
        c = this.setupUrl(k, c);
        f = k.rawData || k.xmlData || i || null;
        if (i && !Ext.isPrimitive(i)) {
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
        e = this.setupParams(k, e);
        b = (k.method || h.method || ((e || f) ? "POST" : "GET")).toUpperCase();
        this.setupMethod(k, b);
        a = k.disableCaching !== false ? (k.disableCaching || h.disableCaching) : false;
        if (b === "GET" && a) {
            c = Ext.urlAppend(c, (k.disableCachingParam || h.disableCachingParam) + "=" + (new Date().getTime()))
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
    setupHeaders: function (l, m, d, c) {
        var h = this,
            b = Ext.apply({}, m.headers || {}, h.defaultHeaders || {}),
            k = h.defaultPostHeader,
            i = m.jsonData,
            a = m.xmlData,
            j, f;
        if (!b["Content-Type"] && (d || c)) {
            if (d) {
                if (m.rawData) {
                    k = "text/plain"
                } else {
                    if (a && Ext.isDefined(a)) {
                        k = "text/xml"
                    } else {
                        if (i && Ext.isDefined(i)) {
                            k = "application/json"
                        }
                    }
                }
            }
            b["Content-Type"] = k
        }
        if (h.useDefaultXhrHeader && !b["X-Requested-With"]) {
            b["X-Requested-With"] = h.defaultXhrHeader
        }
        try {
            for (j in b) {
                if (b.hasOwnProperty(j)) {
                    f = b[j];
                    l.setRequestHeader(j, f)
                }
            }
        } catch (g) {
            h.fireEvent("exception", j, f)
        }
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
            a = d.parseStatus(f.xhr.status)
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
        var c = (a >= 200 && a < 300) || a == 304,
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
        var h = c.xhr,
            a = {},
            i = h.getAllResponseHeaders().replace(/\r\n/g, "\n").split("\n"),
            d = i.length,
            j, e, g, f, b;
        while (d--) {
            j = i[d];
            e = j.indexOf(":");
            if (e >= 0) {
                g = j.substr(0, e).toLowerCase();
                if (j.charAt(e + 1) == " ") {
                    ++e
                }
                a[g] = j.substr(e + 1)
            }
        }
        c.xhr = null;
        delete c.xhr;
        b = {
            request: c,
            requestId: c.id,
            status: h.status,
            statusText: h.statusText,
            getResponseHeader: function (k) {
                return a[k.toLowerCase()]
            },
            getAllResponseHeaders: function () {
                return a
            },
            responseText: h.responseText,
            responseXML: h.responseXML
        };
        h = null;
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


Ext.define("Ext.data.writer.Json", {
    extend: "Ext.data.writer.Writer",
    alternateClassName: "Ext.data.JsonWriter",
    alias: "writer.json",
    root: undefined,
    encode: false,
    allowSingle: true,
    writeRecords: function (b, c) {
        var a = this.root;
        if (this.allowSingle && c.length == 1) {
            c = c[0]
        }
        if (this.encode) {
            if (a) {
                b.params[a] = Ext.encode(c)
            } else {}
        } else {
            b.jsonData = b.jsonData || {};
            if (a) {
                b.jsonData[a] = c
            } else {
                b.jsonData = c
            }
        }
        return b
    }
});


Ext.define("Ext.data.reader.Reader", {
    requires: ["Ext.data.ResultSet"],
    alternateClassName: ["Ext.data.Reader", "Ext.data.DataReader"],
    totalProperty: "total",
    successProperty: "success",
    root: "",
    implicitIncludes: true,
    isReader: true,
    constructor: function (a) {
        var b = this;
        Ext.apply(b, a || {});
        b.fieldCount = 0;
        b.model = Ext.ModelManager.getModel(a.model);
        if (b.model) {
            b.buildExtractors()
        }
    },
    setModel: function (a, c) {
        var b = this;
        b.model = Ext.ModelManager.getModel(a);
        b.buildExtractors(true);
        if (c && b.proxy) {
            b.proxy.setModel(b.model, true)
        }
    },
    read: function (a) {
        var b = a;
        if (a && a.responseText) {
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
        if (d.fieldCount !== d.getFields().length) {
            d.buildExtractors(true)
        }
        d.rawData = c;
        c = d.getData(c);
        var f = Ext.isArray(c) ? c : d.getRoot(c),
            h = true,
            b = 0,
            e, g, a, i;
        if (f) {
            e = f.length
        }
        if (d.totalProperty) {
            g = parseInt(d.getTotal(c), 10);
            if (!isNaN(g)) {
                e = g
            }
        }
        if (d.successProperty) {
            g = d.getSuccess(c);
            if (g === false || g === "false") {
                h = false
            }
        }
        if (d.messageProperty) {
            i = d.getMessage(c)
        }
        if (f) {
            a = d.extractData(f);
            b = a.length
        } else {
            b = 0;
            a = []
        }
        return Ext.create("Ext.data.ResultSet", {
            total: e || b,
            count: b,
            records: a,
            success: h,
            message: i
        })
    },
    extractData: function (j) {
        var h = this,
            k = [],
            e = [],
            d = h.model,
            f = 0,
            b = j.length,
            l = h.getIdProperty(),
            c, a, g;
        if (!j.length && Ext.isObject(j)) {
            j = [j];
            b = 1
        }
        for (; f < b; f++) {
            c = j[f];
            k = h.extractValues(c);
            a = h.getId(c);
            g = new d(k, a, c);
            e.push(g);
            if (h.implicitIncludes) {
                h.readAssociated(g, c)
            }
        }
        return e
    },
    readAssociated: function (g, e) {
        var d = g.associations.items,
            f = 0,
            a = d.length,
            c, b, j, h;
        for (; f < a; f++) {
            c = d[f];
            b = this.getAssociatedDataRoot(e, c.associationKey || c.name);
            if (b) {
                h = c.getReader();
                if (!h) {
                    j = c.associatedModel.proxy;
                    if (j) {
                        h = j.getReader()
                    } else {
                        h = new this.constructor({
                            model: c.associatedName
                        })
                    }
                }
                c.read(g, h, b)
            }
        }
    },
    getAssociatedDataRoot: function (b, a) {
        return b[a]
    },
    getFields: function () {
        return this.model.prototype.fields.items
    },
    extractValues: function (f) {
        var a = this.getFields(),
            c = 0,
            d = a.length,
            b = {},
            g, e;
        for (; c < d; c++) {
            g = a[c];
            e = this.extractorFunctions[c](f);
            b[g.name] = e
        }
        return b
    },
    getData: function (a) {
        return a
    },
    getRoot: function (a) {
        return a
    },
    getResponseData: function (a) {},
    onMetaChange: function (d) {
        var a = d.fields,
            c = this,
            b;
        c.meta = d;
        c.root = d.root || c.root;
        c.idProperty = d.idProperty || c.idProperty;
        c.totalProperty = d.totalProperty || c.totalProperty;
        c.successProperty = d.successProperty || c.successProperty;
        c.messageProperty = d.messageProperty || c.messageProperty;
        if (a) {
            if (c.model) {
                c.model.setFields(a);
                c.setModel(c.model, true)
            } else {
                b = 

Ext.define("Ext.data.reader.Json-Model" + Ext.id(), {
                    extend: "Ext.data.Model",
                    fields: a
                });
                c.setModel(b, true)
            }
        } else {
            c.buildExtractors(true)
        }
    },
    getIdProperty: function () {
        var a = this.idProperty;
        if (Ext.isEmpty(a)) {
            a = this.model.prototype.idProperty
        }
        return a
    },
    buildExtractors: function (e) {
        var c = this,
            g = c.getIdProperty(),
            d = c.totalProperty,
            b = c.successProperty,
            f = c.messageProperty,
            a;
        if (e === true) {
            delete c.extractorFunctions
        }
        if (c.extractorFunctions) {
            return
        }
        if (d) {
            c.getTotal = c.createAccessor(d)
        }
        if (b) {
            c.getSuccess = c.createAccessor(b)
        }
        if (f) {
            c.getMessage = c.createAccessor(f)
        }
        if (g) {
            a = c.createAccessor(g);
            c.getId = function (h) {
                var i = a.call(c, h);
                return (i === undefined || i === "") ? null : i
            }
        } else {
            c.getId = function () {
                return null
            }
        }
        c.buildFieldExtractors()
    },
    buildFieldExtractors: function () {
        var d = this,
            a = d.getFields(),
            c = a.length,
            b = 0,
            g = [],
            f, e;
        for (; b < c; b++) {
            f = a[b];
            e = (f.mapping !== undefined && f.mapping !== null) ? f.mapping : f.name;
            g.push(d.createAccessor(e))
        }
        d.fieldCount = c;
        d.extractorFunctions = g
    }
}, function () {
    Ext.apply(this, {
        nullResultSet: Ext.create("Ext.data.ResultSet", {
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
    root: "",
    useSimpleAccessors: false,
    readRecords: function (a) {
        if (a.metaData) {
            this.onMetaChange(a.metaData)
        }
        this.jsonData = a;
        return this.callParent([a])
    },
    getResponseData: function (a) {
        try {
            var c = Ext.decode(a.responseText)
        } catch (b) {
            Ext.Error.raise({
                response: a,
                json: a.responseText,
                parseError: b,
                msg: "Unable to parse the JSON returned by the server: " + b.toString()
            })
        }
        return c
    },
    buildExtractors: function () {
        var a = this;
        a.callParent(arguments);
        if (a.root) {
            a.getRoot = a.createAccessor(a.root)
        } else {
            a.getRoot = function (b) {
                return b
            }
        }
    },
    extractData: function (a) {
        var e = this.record,
            d = [],
            c, b;
        if (e) {
            c = a.length;
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
            if (this.useSimpleAccessors !== true) {
                var b = String(c).search(a);
                if (b >= 0) {
                    return Ext.functionFactory("obj", "return obj" + (b > 0 ? "." : "") + c)
                }
            }
            return function (d) {
                return d[c]
            }
        }
    }()
});


Ext.define("Ext.data.proxy.Proxy", {
    alias: "proxy.proxy",
    alternateClassName: ["Ext.data.DataProxy", "Ext.data.Proxy"],
    requires: ["Ext.data.reader.Json", "Ext.data.writer.Json"],
    uses: ["Ext.data.Batch", "Ext.data.Operation", "Ext.data.Model"],
    mixins: {
        observable: "Ext.util.Observable"
    },
    batchOrder: "create,update,destroy",
    batchActions: true,
    defaultReaderType: "json",
    defaultWriterType: "json",
    isProxy: true,
    constructor: function (a) {
        a = a || {};
        if (a.model === undefined) {
            delete a.model
        }
        Ext.apply(this, a);
        this.mixins.observable.constructor.call(this);
        if (this.model !== undefined && !(this.model instanceof Ext.data.Model)) {
            this.setModel(this.model)
        }
    },
    setModel: function (b, c) {
        this.model = Ext.ModelManager.getModel(b);
        var a = this.reader,
            d = this.writer;
        this.setReader(a);
        this.setWriter(d);
        if (c && this.store) {
            this.store.setModel(this.model)
        }
    },
    getModel: function () {
        return this.model
    },
    setReader: function (a) {
        var b = this;
        if (a === undefined || typeof a == "string") {
            a = {
                type: a
            }
        }
        if (a.isReader) {
            a.setModel(b.model)
        } else {
            Ext.applyIf(a, {
                proxy: b,
                model: b.model,
                type: b.defaultReaderType
            });
            a = Ext.createByAlias("reader." + a.type, a)
        }
        if (a.onMetaChange) {
            a.onMetaChange = Ext.Function.createSequence(a.onMetaChange, this.onMetaChange, this)
        }
        b.reader = a;
        return b.reader
    },
    getReader: function () {
        return this.reader
    },
    onMetaChange: function (a) {
        this.fireEvent("metachange", this, a)
    },
    setWriter: function (a) {
        if (a === undefined || typeof a == "string") {
            a = {
                type: a
            }
        }
        if (!(a instanceof Ext.data.writer.Writer)) {
            Ext.applyIf(a, {
                model: this.model,
                type: this.defaultWriterType
            });
            a = Ext.createByAlias("writer." + a.type, a)
        }
        this.writer = a;
        return this.writer
    },
    getWriter: function () {
        return this.writer
    },
    create: Ext.emptyFn,
    read: Ext.emptyFn,
    update: Ext.emptyFn,
    destroy: Ext.emptyFn,
    batch: function (d, e) {
        var f = this,
            c = Ext.create("Ext.data.Batch", {
                proxy: f,
                listeners: e || {}
            }),
            b = f.batchActions,
            a;
        Ext.each(f.batchOrder.split(","), function (g) {
            a = d[g];
            if (a) {
                if (b) {
                    c.add(Ext.create("Ext.data.Operation", {
                        action: g,
                        records: a
                    }))
                } else {
                    Ext.each(a, function (h) {
                        c.add(Ext.create("Ext.data.Operation", {
                            action: g,
                            records: [h]
                        }))
                    })
                }
            }
        }, f);
        c.start();
        return c
    }
}, function () {
    Ext.data.DataProxy = this
});


Ext.define("Ext.data.proxy.Server", {
    extend: "Ext.data.proxy.Proxy",
    alias: "proxy.server",
    alternateClassName: "Ext.data.ServerProxy",
    uses: ["Ext.data.Request"],
    pageParam: "page",
    startParam: "start",
    limitParam: "limit",
    groupParam: "group",
    sortParam: "sort",
    filterParam: "filter",
    directionParam: "dir",
    simpleSortMode: false,
    noCache: true,
    cacheString: "_dc",
    timeout: 30000,
    constructor: function (a) {
        var b = this;
        a = a || {};
        b.callParent([a]);
        b.extraParams = a.extraParams || {};
        b.api = a.api || {};
        b.nocache = b.noCache
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
        this.extraParams[a] = b
    },
    buildRequest: function (a) {
        var c = Ext.applyIf(a.params || {}, this.extraParams || {}),
            b;
        c = Ext.applyIf(c, this.getParams(a));
        if (a.id && !c.id) {
            c.id = a.id
        }
        b = Ext.create("Ext.data.Request", {
            params: c,
            action: a.action,
            records: a.records,
            operation: a,
            url: a.url
        });
        b.url = this.buildUrl(b);
        a.request = b;
        return b
    },
    processResponse: function (g, a, c, b, f, h) {
        var e = this,
            d, i;
        if (g === true) {
            d = e.getReader();
            i = d.read(e.extractResponseData(b));
            if (i.success !== false) {
                Ext.apply(a, {
                    response: b,
                    resultSet: i
                });
                a.commitRecords(i.records);
                a.setCompleted();
                a.setSuccessful()
            } else {
                a.setException(i.message);
                e.fireEvent("exception", this, b, a)
            }
        } else {
            e.setException(a, b);
            e.fireEvent("exception", this, b, a)
        }
        if (typeof f == "function") {
            f.call(h || e, a)
        }
        e.afterRequest(c, g)
    },
    setException: function (b, a) {
        b.setException({
            status: a.status,
            statusText: a.statusText
        })
    },
    extractResponseData: function (a) {
        return a
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
                property: d[a].property,
                direction: d[a].direction
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
                property: d[a].property,
                value: d[a].value
            }
        }
        return this.applyEncoding(b)
    },
    getParams: function (k) {
        var r = this,
            q = {},
            n = Ext.isDefined,
            o = k.groupers,
            a = k.sorters,
            i = k.filters,
            g = k.page,
            f = k.start,
            p = k.limit,
            h = r.simpleSortMode,
            m = r.pageParam,
            d = r.startParam,
            b = r.limitParam,
            c = r.groupParam,
            e = r.sortParam,
            l = r.filterParam,
            j = r.directionParam;
        if (m && n(g)) {
            q[m] = g
        }
        if (d && n(f)) {
            q[d] = f
        }
        if (b && n(p)) {
            q[b] = p
        }
        if (c && o && o.length > 0) {
            q[c] = r.encodeSorters(o)
        }
        if (e && a && a.length > 0) {
            if (h) {
                q[e] = a[0].property;
                q[j] = a[0].direction
            } else {
                q[e] = r.encodeSorters(a)
            }
        }
        if (l && i && i.length > 0) {
            q[l] = r.encodeFilters(i)
        }
        return q
    },
    buildUrl: function (c) {
        var b = this,
            a = b.getUrl(c);
        if (b.noCache) {
            a = Ext.urlAppend(a, Ext.String.format("{0}={1}", b.cacheString, Ext.Date.now()))
        }
        return a
    },
    getUrl: function (a) {
        return a.url || this.api[a.action] || this.url
    },
    doRequest: function (a, c, b) {},
    afterRequest: Ext.emptyFn,
    onDestroy: function () {
        Ext.destroy(this.reader, this.writer)
    }
});


Ext.define("Ext.data.proxy.Ajax", {
    requires: ["Ext.util.MixedCollection", "Ext.Ajax"],
    extend: "Ext.data.proxy.Server",
    alias: "proxy.ajax",
    alternateClassName: ["Ext.data.HttpProxy", "Ext.data.AjaxProxy"],
    actionMethods: {
        create: "POST",
        read: "GET",
        update: "POST",
        destroy: "POST"
    },
    doRequest: function (a, e, b) {
        var d = this.getWriter(),
            c = this.buildRequest(a, e, b);
        if (a.allowWrite()) {
            c = d.write(c)
        }
        Ext.apply(c, {
            headers: this.headers,
            timeout: this.timeout,
            scope: this,
            callback: this.createRequestCallback(c, a, e, b),
            method: this.getMethod(c),
            disableCaching: false
        });
        Ext.Ajax.request(c);
        return c
    },
    getMethod: function (a) {
        return this.actionMethods[a.action]
    },
    createRequestCallback: function (d, a, e, b) {
        var c = this;
        return function (g, h, f) {
            c.processResponse(h, a, d, f, e, b)
        }
    }
}, function () {
    Ext.data.HttpProxy = this
});


Ext.define("Ext.data.Model", {
    alternateClassName: "Ext.data.Record",
    mixins: {
        observable: "Ext.util.Observable"
    },
    requires: ["Ext.ModelManager", "Ext.data.IdGenerator", "Ext.data.Field", "Ext.data.Errors", "Ext.data.Operation", "Ext.data.validations", "Ext.data.proxy.Ajax", "Ext.util.MixedCollection"],
    onClassExtended: function (b, c, a) {
        var d = a.onBeforeCreated;
        a.onBeforeCreated = function (f, A) {
            var z = this,
                B = Ext.getClassName(f),
                n = f.prototype,
                t = f.prototype.superclass,
                g = A.validations || [],
                p = A.fields || [],
                v = A.associations || [],
                u = A.belongsTo,
                o = A.hasMany,
                q = A.hasOne,
                e = function (D, F) {
                    var E = 0,
                        C, G;
                    if (D) {
                        D = Ext.Array.from(D);
                        for (C = D.length; E < C; ++E) {
                            G = D[E];
                            if (!Ext.isObject(G)) {
                                G = {
                                    model: G
                                }
                            }
                            G.type = F;
                            v.push(G)
                        }
                    }
                },
                r = A.idgen,
                x = new Ext.util.MixedCollection(false, function (i) {
                    return i.name
                }),
                w = new Ext.util.MixedCollection(false, function (i) {
                    return i.name
                }),
                m = t.validations,
                y = t.fields,
                j = t.associations,
                h, s, k, l = [];
            f.modelName = B;
            n.modelName = B;
            if (m) {
                g = m.concat(g)
            }
            A.validations = g;
            if (y) {
                p = y.items.concat(p)
            }
            for (s = 0, k = p.length; s < k; ++s) {
                x.add(new Ext.data.Field(p[s]))
            }
            A.fields = x;
            if (r) {
                A.idgen = Ext.data.IdGenerator.get(r)
            }
            e(A.belongsTo, "belongsTo");
            delete A.belongsTo;
            e(A.hasMany, "hasMany");
            delete A.hasMany;
            e(A.hasOne, "hasOne");
            delete A.hasOne;
            if (j) {
                v = j.items.concat(v)
            }
            for (s = 0, k = v.length; s < k; ++s) {
                l.push("association." + v[s].type.toLowerCase())
            }
            if (A.proxy) {
                if (typeof A.proxy === "string") {
                    l.push("proxy." + A.proxy)
                } else {
                    if (typeof A.proxy.type === "string") {
                        l.push("proxy." + A.proxy.type)
                    }
                }
            }
            Ext.require(l, function () {
                Ext.ModelManager.registerType(B, f);
                for (s = 0, k = v.length; s < k; ++s) {
                    h = v[s];
                    Ext.apply(h, {
                        ownerModel: B,
                        associatedModel: h.model
                    });
                    if (Ext.ModelManager.getModel(h.model) === undefined) {
                        Ext.ModelManager.registerDeferredAssociation(h)
                    } else {
                        w.add(Ext.data.association.Association.create(h))
                    }
                }
                A.associations = w;
                d.call(z, f, A, a);
                f.setProxy(f.prototype.proxy || f.prototype.defaultProxyType);
                Ext.ModelManager.onModelDefined(f)
            })
        }
    },
    inheritableStatics: {
        setProxy: function (a) {
            if (!a.isProxy) {
                if (typeof a == "string") {
                    a = {
                        type: a
                    }
                }
                a = Ext.createByAlias("proxy." + a.type, a)
            }
            a.setModel(this);
            this.proxy = this.prototype.proxy = a;
            return a
        },
        getProxy: function () {
            return this.proxy
        },
        setFields: function (b) {
            var e = this,
                d = e.prototype.fields,
                a = b.length,
                c = 0;
            if (d) {
                d.clear()
            } else {
                d = e.prototype.fields = new Ext.util.MixedCollection(false, function (f) {
                    return f.name
                })
            }
            for (; c < a; c++) {
                d.add(new Ext.data.Field(b[c]))
            }
            e.fields = d;
            return d
        },
        getFields: function () {
            return this.fields
        },
        load: function (f, c) {
            c = Ext.apply({}, c);
            c = Ext.applyIf(c, {
                action: "read",
                id: f
            });
            var b = Ext.create("Ext.data.Operation", c),
                d = c.scope || this,
                a = null,
                e;
            e = function (g) {
                if (g.wasSuccessful()) {
                    a = g.getRecords()[0];
                    Ext.callback(c.success, d, [a, g])
                } else {
                    Ext.callback(c.failure, d, [a, g])
                }
                Ext.callback(c.callback, d, [a, g])
            };
            this.proxy.read(b, e, this)
        }
    },
    statics: {
        PREFIX: "ext-record",
        AUTO_ID: 1,
        EDIT: "edit",
        REJECT: "reject",
        COMMIT: "commit",
        id: function (a) {
            var b = [this.PREFIX, "-", this.AUTO_ID++].join("");
            a.phantom = true;
            a.internalId = b;
            return b
        }
    },
    idgen: {
        isGenerator: true,
        type: "default",
        generate: function () {
            return null
        },
        getRecId: function (a) {
            return a.modelName + "-" + a.internalId
        }
    },
    editing: false,
    dirty: false,
    persistenceProperty: "data",
    evented: false,
    isModel: true,
    phantom: false,
    idProperty: "id",
    defaultProxyType: "ajax",
    constructor: function (f, b, l) {
        f = f || {};
        var j = this,
            h, c, k, a, e, d, g = Ext.isArray(f),
            m = g ? {} : null;
        j.internalId = (b || b === 0) ? b : Ext.data.Model.id(j);
        j.raw = l;
        Ext.applyIf(j, {
            data: {}
        });
        j.modified = {};
        if (j.persistanceProperty) {
            j.persistenceProperty = j.persistanceProperty
        }
        j[j.persistenceProperty] = {};
        j.mixins.observable.constructor.call(j);
        h = j.fields.items;
        c = h.length;
        for (e = 0; e < c; e++) {
            k = h[e];
            a = k.name;
            if (g) {
                m[a] = f[e]
            } else {
                if (f[a] === undefined) {
                    f[a] = k.defaultValue
                }
            }
        }
        j.set(m || f);
        if (j.getId()) {
            j.phantom = false
        } else {
            if (j.phantom) {
                d = j.idgen.generate();
                if (d !== null) {
                    j.setId(d)
                }
            }
        }
        j.dirty = false;
        j.modified = {};
        if (typeof j.init == "function") {
            j.init()
        }
        j.id = j.idgen.getRecId(j)
    },
    get: function (a) {
        return this[this.persistenceProperty][a]
    },
    set: function (n, j) {
        var g = this,
            e = g.fields,
            m = g.modified,
            c = [],
            h, l, d, k, b, f, a;
        if (arguments.length == 1 && Ext.isObject(n)) {
            b = !g.editing;
            f = 0;
            for (l in n) {
                if (n.hasOwnProperty(l)) {
                    h = e.get(l);
                    if (h && h.convert !== h.type.convert) {
                        c.push(l);
                        continue
                    }
                    if (!f && b) {
                        g.beginEdit()
                    }++f;
                    g.set(l, n[l])
                }
            }
            a = c.length;
            if (a) {
                if (!f && b) {
                    g.beginEdit()
                }
                f += a;
                for (d = 0; d < a; d++) {
                    h = c[d];
                    g.set(h, n[h])
                }
            }
            if (b && f) {
                g.endEdit(false, c)
            }
        } else {
            if (e) {
                h = e.get(n);
                if (h && h.convert) {
                    j = h.convert(j, g)
                }
            }
            k = g.get(n);
            g[g.persistenceProperty][n] = j;
            if (h && h.persist && !g.isEqual(k, j)) {
                if (g.isModified(n)) {
                    if (g.isEqual(m[n], j)) {
                        delete m[n];
                        g.dirty = false;
                        for (l in m) {
                            if (m.hasOwnProperty(l)) {
                                g.dirty = true;
                                break
                            }
                        }
                    }
                } else {
                    g.dirty = true;
                    m[n] = k
                }
            }
            if (!g.editing) {
                g.afterEdit([n])
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
            a.dataSave = Ext.apply({}, a[a.persistenceProperty]);
            a.modifiedSave = Ext.apply({}, a.modified)
        }
    },
    cancelEdit: function () {
        var a = this;
        if (a.editing) {
            a.editing = false;
            a.modified = a.modifiedSave;
            a[a.persistenceProperty] = a.dataSave;
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
            delete b.modifiedSave;
            delete b.dataSave;
            delete b.dirtySave;
            if (a !== true && b.dirty) {
                b.afterEdit(c)
            }
        }
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
    setDirty: function () {
        var b = this,
            a;
        b.dirty = true;
        b.fields.each(function (c) {
            if (c.persist) {
                a = c.name;
                b.modified[a] = b.get(a)
            }
        }, b)
    },
    reject: function (a) {
        var c = this,
            b = c.modified,
            d;
        for (d in b) {
            if (b.hasOwnProperty(d)) {
                if (typeof b[d] != "function") {
                    c[c.persistenceProperty][d] = b[d]
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
        var b = this;
        b.phantom = b.dirty = b.editing = false;
        b.modified = {};
        if (a !== true) {
            b.afterCommit()
        }
    },
    copy: function (a) {
        var b = this;
        return new b.self(Ext.apply({}, b[b.persistenceProperty]), a || b.internalId)
    },
    setProxy: function (a) {
        if (!a.isProxy) {
            if (typeof a === "string") {
                a = {
                    type: a
                }
            }
            a = Ext.createByAlias("proxy." + a.type, a)
        }
        a.setModel(this.self);
        this.proxy = a;
        return a
    },
    getProxy: function () {
        return this.proxy
    },
    validate: function () {
        var j = Ext.create("Ext.data.Errors"),
            c = this.validations,
            e = Ext.data.validations,
            b, d, h, a, g, f;
        if (c) {
            b = c.length;
            for (f = 0; f < b; f++) {
                d = c[f];
                h = d.field || d.name;
                g = d.type;
                a = e[g](d, this.get(h));
                if (!a) {
                    j.add({
                        field: h,
                        message: d.message || e[g + "Message"]
                    })
                }
            }
        }
        return j
    },
    isValid: function () {
        return this.validate().isValid()
    },
    save: function (c) {
        c = Ext.apply({}, c);
        var e = this,
            f = e.phantom ? "create" : "update",
            a = null,
            d = c.scope || e,
            b, g;
        Ext.apply(c, {
            records: [e],
            action: f
        });
        b = Ext.create("Ext.data.Operation", c);
        g = function (h) {
            if (h.wasSuccessful()) {
                a = h.getRecords()[0];
                e.set(a.data);
                a.dirty = false;
                Ext.callback(c.success, d, [a, h])
            } else {
                Ext.callback(c.failure, d, [a, h])
            }
            Ext.callback(c.callback, d, [a, h])
        };
        e.getProxy()[f](b, g, e);
        return e
    },
    destroy: function (c) {
        c = Ext.apply({}, c);
        var e = this,
            a = null,
            d = c.scope || e,
            b, f;
        Ext.apply(c, {
            records: [e],
            action: "destroy"
        });
        b = Ext.create("Ext.data.Operation", c);
        f = function (g) {
            if (g.wasSuccessful()) {
                Ext.callback(c.success, d, [a, g])
            } else {
                Ext.callback(c.failure, d, [a, g])
            }
            Ext.callback(c.callback, d, [a, g])
        };
        e.getProxy().destroy(b, f, e);
        return e
    },
    getId: function () {
        return this.get(this.idProperty)
    },
    getUniqueId: function () {
        var b = this.uniqueId,
            a;
        if (!b) {
            a = this.id;
            this.id = null;
            b = this.uniqueId = this.mixins.identifiable.getUniqueId.call(this);
            this.id = a
        }
        return b
    },
    setId: function (a) {
        this.set(this.idProperty, a)
    },
    join: function (a) {
        this.store = a
    },
    unjoin: function (a) {
        delete this.store
    },
    afterEdit: function (a) {
        this.callStore("afterEdit", a)
    },
    afterReject: function () {
        this.callStore("afterReject")
    },
    afterCommit: function () {
        this.callStore("afterCommit")
    },
    callStore: function (c) {
        var a = this.store,
            b = Ext.Array.clone(arguments);
        b[0] = this;
        if (a !== undefined && typeof a[c] == "function") {
            a[c].apply(a, b)
        }
    },
    getData: function (b) {
        var c = this,
            d = {},
            a;
        c.fields.each(function (e) {
            a = e.name;
            d[a] = c.get(a)
        }, c);
        if (b === true) {
            Ext.apply(d, c.getAssociatedData())
        }
        return d
    },
    getAssociatedData: function () {
        return this.prepareAssociatedData(this, [], null)
    },
    prepareAssociatedData: function (p, b, o) {
        var k = p.associations.items,
            m = k.length,
            f = {},
            g, a, h, r, s, e, d, n, l, q, c;
        for (n = 0; n < m; n++) {
            e = k[n];
            q = e.type;
            c = true;
            if (o) {
                c = q == o
            }
            if (c && q == "hasMany") {
                g = p[e.storeName];
                f[e.name] = [];
                if (g && g.getCount() > 0) {
                    h = g.data.items;
                    s = h.length;
                    for (l = 0; l < s; l++) {
                        r = h[l];
                        d = r.id;
                        if (Ext.Array.indexOf(b, d) == -1) {
                            b.push(d);
                            f[e.name][l] = r.getData();
                            Ext.apply(f[e.name][l], this.prepareAssociatedData(r, b, q))
                        }
                    }
                }
            } else {
                if (c && (q == "belongsTo" || q == "hasOne")) {
                    r = p[e.instanceName];
                    if (r !== undefined) {
                        d = r.id;
                        if (Ext.Array.indexOf(b, d) === -1) {
                            b.push(d);
                            f[e.name] = r.getData();
                            Ext.apply(f[e.name], this.prepareAssociatedData(r, b, q))
                        }
                    }
                }
            }
        }
        return f
    }
});


Ext.define("Ext.app.Application", {
    extend: "Ext.app.Controller",
    alternateClassName: "Ext.Application",
    requires: ["Ext.ModelManager", "Ext.data.Model", "Ext.data.StoreManager", "Ext.ComponentManager"],
    scope: undefined,
    enableQuickTips: true,
    appFolder: "app",
    autoCreateViewport: false,
    constructor: function (c) {
        c = c || {};
        Ext.apply(this, c);
        var e = c.requires || [],
            b = this.name;
        Ext.Loader.setPath(b, this.appFolder);
        if (this.paths) {
            Ext.Object.each(this.paths, function (h, i) {
                Ext.Loader.setPath(h, i)
            })
        }
        this.callParent(arguments);
        var g = Ext.Array.from(this.controllers),
            f = g && g.length,
            d, a;
        this.controllers = g;
        if (this.autoCreateViewport) {
            e.push(this.getModuleClassName("Viewport", "view"))
        }
        for (d = 0; d < f; d++) {
            e.push(this.getModuleClassName(g[d], "controller"))
        }
        Ext.require(e);
        Ext.onReady(this.onBeforeLaunch, this)
    },
    control: function (d, f, b) {
        var e = this.getEventDispatcher(),
            a, c, g;
        for (a in d) {
            if (d.hasOwnProperty(a)) {
                f = d[a];
                for (c in f) {
                    if (f.hasOwnProperty(c)) {
                        g = f[c];
                        e.addListener("component", a, c, g, b)
                    }
                }
            }
        }
    },
    init: Ext.emptyFn,
    launch: Ext.emptyFn,
    onBeforeLaunch: function () {
        if (this.autoCreateViewport) {
            this.getView("Viewport").create()
        }
        var d = this.controllers,
            c = d.length,
            b, a;
        this.controllers = Ext.create("Ext.util.MixedCollection");
        this.init();
        for (b = 0; b < c; b++) {
            a = this.getController(d[b], false);
            a.initConfig(a.initialConfig);
            a.init()
        }
        this.launch.call(this.scope || this);
        this.controllers.each(function (e) {
            if (e.onLaunch) {
                e.onLaunch(this)
            } else {
                e.launch(this)
            }
        }, this);
        this.launched = true;
        this.fireEvent("launch", this)
    },
    getModuleClassName: function (a, c) {
        var b = Ext.Loader.getPrefix(a);
        if (b.length > 0 && b !== a) {
            return a
        }
        return this.name + "." + c + "." + a
    },
    getController: function (b, c) {
        var a = this.controllers.get(b);
        if (!a) {
            a = Ext.create(this.getModuleClassName(b, "controller"), {
                application: this,
                id: b
            });
            this.controllers.add(a);
            if (c !== false) {
                a.init();
                if (this.launched) {
                    if (a.onLaunch) {
                        a.onLaunch(this)
                    } else {
                        a.launch(this)
                    }
                }
            }
        }
        return a
    },
    getStore: function (b) {
        var a = Ext.StoreManager.get(b);
        if (!a) {
            a = Ext.create(this.getModuleClassName(b, "store"), {
                storeId: b
            })
        }
        return a
    },
    getModel: function (a) {
        a = this.getModuleClassName(a, "model");
        return Ext.ModelManager.getModel(a)
    },
    getView: function (a) {
        var c = this.getModuleClassName(a, "view"),
            b = Ext.ClassManager.get(c),
            d = a.toLowerCase() + "view";
        if (b) {
            b.addXtype(a.toLowerCase() + "view")
        } else {
            Ext.ClassManager.setAlias(c, "widget." + d)
        }
        return b
    },
    createViewInstance: function (a) {
        return this.getView(a).create()
    }
});


Ext.define("Ext.Validator", {
    singleton: true,
    number: function (b, a) {
        if (!a) {
            a = "value"
        }
        if (typeof b != "number") {
            Ext.Logger.error("Invalid " + a + ", must be a valid number", 2)
        }
    },
    among: function (c, a, b) {
        if (!b) {
            b = "value"
        }
        if (a.indexOf(c) === -1) {
            Ext.Logger.error("Invalid " + b + ', must be either of these value: "' + a.join('", "') + '"', 2)
        }
    },
    element: function (b, a) {
        if (!a) {
            a = "value"
        }
        if (typeof b != "string" && !b.nodeType && !(b instanceof Ext.Element)) {
            Ext.Logger.error("Invalid " + a + ", must be either a DOM element's id, a DOM element reference or an instance of Ext.Element", 2)
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
        validate: function (a) {
            if (!a || !("x" in a) || !("y" in a)) {
                throw new Error("[" + Ext.getDisplayName(this.validate.caller) + "] Invalid point, must be either an instance of Ext.util.Point or an object with 'x' and 'y' properties")
            }
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
            j = false,
            f, b, a;
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
    getInfo: function (j, i) {
        var d = j.time,
            a = this.startPoint,
            f = this.previousPoint,
            b = this.startTime,
            k = this.previousTime,
            l = this.lastPoint,
            h = l.x - a.x,
            g = l.y - a.y,
            c = {
                touch: i,
                startX: a.x,
                startY: a.y,
                previousX: f.x,
                previousY: f.y,
                pageX: l.x,
                pageY: l.y,
                deltaX: h,
                deltaY: g,
                absDeltaX: Math.abs(h),
                absDeltaY: Math.abs(g),
                previousDeltaX: l.x - f.x,
                previousDeltaY: l.y - f.y,
                time: d,
                startTime: b,
                previousTime: k,
                deltaTime: d - b,
                previousDeltaTime: d - k
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
}, function () {
    this.override({
        handledEvents: ["tap", "tapstart", "tapcancel"],
        onTouchStart: function (a) {
            if (this.callOverridden(arguments) === false) {
                return false
            }
            this.fire("tapstart", a, [a.changedTouches[0]])
        },
        onTouchMove: function (a) {
            this.fire("tapcancel", a, [a.changedTouches[0]]);
            return this.callOverridden(arguments)
        }
    })
});


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
}, function () {
    this.override({
        handledEvents: ["longpress", "taphold"],
        fire: function (a) {
            if (a === "longpress") {
                var b = Array.prototype.slice.call(arguments);
                b[0] = "taphold";
                this.fire.apply(this, b)
            }
            return this.callOverridden(arguments)
        }
    })
});


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
    onTouchEnd: function (i) {
        if (this.onTouchMove(i) === false) {
            return false
        }
        var h = i.changedTouches[0],
            l = h.pageX,
            j = h.pageY,
            g = l - this.startX,
            f = j - this.startY,
            c = Math.abs(g),
            b = Math.abs(f),
            m = this.getMinDistance(),
            d = i.time - this.startTime,
            k, a;
        if (this.isVertical && b < m) {
            this.isVertical = false
        }
        if (this.isHorizontal && c < m) {
            this.isHorizontal = false
        }
        if (this.isHorizontal) {
            k = (g < 0) ? "left" : "right";
            a = c
        } else {
            if (this.isVertical) {
                k = (f < 0) ? "up" : "down";
                a = b
            } else {
                return this.fail(this.self.DISTANCE_NOT_ENOUGH)
            }
        }
        this.fire("swipe", i, [h], {
            touch: h,
            direction: k,
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
            var i = f.changedTouches[0],
                a = i.pageX,
                b = a - this.startX,
                h = Math.abs(b),
                d = f.time - this.startTime,
                g = this.getMinDistance(),
                c;
            if (h < g) {
                return this.fail(this.self.DISTANCE_NOT_ENOUGH)
            }
            c = (b < 0) ? "left" : "right";
            this.fire("swipe", f, [i], {
                touch: i,
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
            d, f, c, a, i, j;
        d = g[0].point;
        f = g[1].point;
        c = d.getAngleTo(f);
        if (b !== null) {
            j = Math.abs(b - c);
            a = c + 360;
            i = c - 360;
            if (Math.abs(a - b) < j) {
                c = a
            } else {
                if (Math.abs(i - b) < j) {
                    c = i
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
        j = ["var r = [],", "i = 0,", "it = items,", "l = it.length,", "c;", "for (; i < l; i++) {", "c = it[i];", "if (c.{0}) {", "r.push(c);", "}", "}", "return r;"].join(""),
        e = function (o, n) {
            return n.method.apply(this, [o].concat(n.args))
        },
        a = function (p, t) {
            var n = [],
                q = 0,
                s = p.length,
                r, o = t !== ">";
            for (; q < s; q++) {
                r = p[q];
                if (r.getRefItems) {
                    n = n.concat(r.getRefItems(o))
                }
            }
            return n
        },
        f = function (o) {
            var n = [],
                p = 0,
                r = o.length,
                q;
            for (; p < r; p++) {
                q = o[p];
                while ( !! (q = (q.ownerCt || q.floatParent))) {
                    n.push(q)
                }
            }
            return n
        },
        l = function (o, t, s) {
            if (t === "*") {
                return o.slice()
            } else {
                var n = [],
                    p = 0,
                    r = o.length,
                    q;
                for (; p < r; p++) {
                    q = o[p];
                    if (q.isXType(t, s)) {
                        n.push(q)
                    }
                }
                return n
            }
        },
        i = function (o, r) {
            var t = Ext.Array,
                n = [],
                p = 0,
                s = o.length,
                q;
            for (; p < s; p++) {
                q = o[p];
                if (q.el ? q.el.hasCls(r) : t.contains(q.initCls(), r)) {
                    n.push(q)
                }
            }
            return n
        },
        m = function (p, u, o, t) {
            var n = [],
                q = 0,
                s = p.length,
                r;
            for (; q < s; q++) {
                r = p[q];
                if (!t ? !! r[u] : (String(r[u]) === t)) {
                    n.push(r)
                } else {
                    if (r.config) {
                        if (!t ? !! r.config[u] : (String(r.config[u]) === t)) {
                            n.push(r)
                        }
                    }
                }
            }
            return n
        },
        d = function (o, s) {
            var n = [],
                p = 0,
                r = o.length,
                q;
            for (; p < r; p++) {
                q = o[p];
                if (q.getItemId() === s) {
                    n.push(q)
                }
            }
            return n
        },
        k = function (n, o, p) {
            return g.pseudos[o](n, p)
        },
        h = /^(\s?([>\^])\s?|\s|$)/,
        c = /^(#)?([\w\-]+|\*)(?:\((true|false)\))?/,
        b = [{
            re: /^\.([\w\-]+)(?:\((true|false)\))?/,
            method: l
        }, {
            re: /^(?:[\[](?:@)?([\w\-]+)\s?(?:(=|.=)\s?['"]?(.*?)["']?)?[\]])/,
            method: m
        }, {
            re: /^#([\w\-]+)/,
            method: d
        }, {
            re: /^\:([\w\-]+)(?:\(((?:\{[^\}]+\})|(?:(?!\{)[^\s>\/]*?(?!\})))\))?/,
            method: k
        }, {
            re: /^(?:\{([^\}]+)\})/,
            method: j
        }];
    g.Query = Ext.extend(Object, {
        constructor: function (n) {
            n = n || {};
            Ext.apply(this, n)
        },
        execute: function (o) {
            var q = this.operations,
                r = 0,
                s = q.length,
                p, n;
            if (!o) {
                n = Ext.ComponentManager.all.getArray()
            } else {
                if (Ext.isArray(o)) {
                    n = o
                }
            }
            for (; r < s; r++) {
                p = q[r];
                if (p.mode === "^") {
                    n = f(n || [o])
                } else {
                    if (p.mode) {
                        n = a(n || [o], p.mode)
                    } else {
                        n = e(n || a([o]), p)
                    }
                }
                if (r === s - 1) {
                    return n
                }
            }
            return []
        },
        is: function (p) {
            var o = this.operations,
                s = Ext.isArray(p) ? p : [p],
                n = s.length,
                t = o[o.length - 1],
                r, q;
            s = e(s, t);
            if (s.length === n) {
                if (o.length > 1) {
                    for (q = 0, r = s.length; q < r; q++) {
                        if (Ext.Array.indexOf(this.execute(), s[q]) === -1) {
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
            not: function (t, n) {
                var u = Ext.ComponentQuery,
                    r = 0,
                    s = t.length,
                    q = [],
                    p = -1,
                    o;
                for (; r < s; ++r) {
                    o = t[r];
                    if (!u.is(o, n)) {
                        q[++p] = o
                    }
                }
                return q
            }
        },
        query: function (o, v) {
            var w = o.split(","),
                n = w.length,
                p = 0,
                q = [],
                x = [],
                u = {},
                s, r, t;
            for (; p < n; p++) {
                o = Ext.String.trim(w[p]);
                s = this.cache[o];
                if (!s) {
                    this.cache[o] = s = this.parse(o)
                }
                q = q.concat(s.execute(v))
            }
            if (n > 1) {
                r = q.length;
                for (p = 0; p < r; p++) {
                    t = q[p];
                    if (!u[t.id]) {
                        x.push(t);
                        u[t.id] = true
                    }
                }
                q = x
            }
            return q
        },
        is: function (o, n) {
            if (!n) {
                return true
            }
            var p = this.cache[n];
            if (!p) {
                this.cache[n] = p = this.parse(n)
            }
            return p.is(o)
        },
        parse: function (q) {
            var o = [],
                p = b.length,
                u, r, v, w, x, s, t, n;
            while (q && u !== q) {
                u = q;
                r = q.match(c);
                if (r) {
                    v = r[1];
                    if (v === "#") {
                        o.push({
                            method: d,
                            args: [Ext.String.trim(r[2])]
                        })
                    } else {
                        if (v === ".") {
                            o.push({
                                method: i,
                                args: [Ext.String.trim(r[2])]
                            })
                        } else {
                            o.push({
                                method: l,
                                args: [Ext.String.trim(r[2]), Boolean(r[3])]
                            })
                        }
                    }
                    q = q.replace(r[0], "")
                }
                while (!(w = q.match(h))) {
                    for (s = 0; q && s < p; s++) {
                        t = b[s];
                        x = q.match(t.re);
                        n = t.method;
                        if (x) {
                            o.push({
                                method: Ext.isString(t.method) ? Ext.functionFactory("items", Ext.String.format.apply(Ext.String, [n].concat(x.slice(1)))) : t.method,
                                args: x.slice(1)
                            });
                            q = q.replace(x[0], "");
                            break
                        }
                    }
                }
                if (w[1]) {
                    o.push({
                        mode: w[2] || w[1]
                    });
                    q = q.replace(w[0], "")
                }
            }
            return new g.Query({
                operations: o
            })
        }
    })
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


Ext.define("Ext.EventedBase", {
    mixins: ["Ext.mixin.Observable"],
    doSet: function (c, d, b, a) {
        var e = a.nameMap;
        c[e.internal] = d;
        c[e.doSet](d, b)
    },
    onClassExtended: function (a, d) {
        if (!d.hasOwnProperty("eventedConfig")) {
            return
        }
        var c = Ext.Class,
            b = d.config,
            e = d.eventedConfig;
        d.config = (b) ? Ext.applyIf(b, e) : e;
        Ext.Object.each(e, function (g) {
            var l = c.getConfigNameMap(g),
                j = l.internal,
                k = l.doSet,
                i = l.apply,
                f = {
                    nameMap: l
                },
                h = l.changeEvent;
            a.addMember(l.set, function (o) {
                var p = this.initialized,
                    n = this[j],
                    m = this[i];
                if (m) {
                    o = m.call(this, o, n);
                    if (typeof o == "undefined") {
                        return this
                    }
                }
                if (o !== n) {
                    if (p) {
                        this.fireAction(h, [this, o, n], this.doSet, this, f)
                    } else {
                        this[j] = o;
                        this[k](o, n)
                    }
                }
                return this
            })
        })
    }
});


Ext.define("Ext.behavior.Behavior", {
    constructor: function (a) {
        this.component = a;
        a.on("destroy", "onComponentDestroy", this)
    },
    onComponentDestroy: Ext.emptyFn
});


Ext.define("Ext.util.Format", {
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
    date: function (a, b) {
        if (!a) {
            return ""
        }
        if (!Ext.isDate(a)) {
            a = new Date(Date.parse(a))
        }
        return Ext.Date.format(a, b || Ext.util.Format.defaultDateFormat)
    }
});


Ext.define("Ext.XTemplateParser", {
    constructor: function (a) {
        Ext.apply(this, a)
    },
    doTpl: Ext.emptyFn,
    parse: function (n) {
        var o = this,
            l = n.length,
            c = {
                elseif: "elif"
            },
            j = o.topRe,
            b = o.actionsRe,
            k, p, r, f, q, g, a, e, d, h, i;
        o.level = 0;
        o.stack = p = [];
        for (k = 0; k < l; k = h) {
            j.lastIndex = k;
            f = j.exec(n);
            if (!f) {
                o.doText(n.substring(k, l));
                break
            }
            d = f.index;
            h = j.lastIndex;
            if (k < d) {
                o.doText(n.substring(k, d))
            }
            if (f[1]) {
                h = n.indexOf("%}", d + 2);
                o.doEval(n.substring(d + 2, h));
                h += 2
            } else {
                if (f[2]) {
                    h = n.indexOf("]}", d + 2);
                    o.doExpr(n.substring(d + 2, h));
                    h += 2
                } else {
                    if (f[3]) {
                        o.doTag(f[3])
                    } else {
                        if (f[4]) {
                            i = null;
                            while ((e = b.exec(f[4])) !== null) {
                                r = e[2] || e[3];
                                if (r) {
                                    r = Ext.String.htmlDecode(r);
                                    q = e[1];
                                    q = c[q] || q;
                                    i = i || {};
                                    g = i[q];
                                    if (typeof g == "string") {
                                        i[q] = [g, r]
                                    } else {
                                        if (g) {
                                            i[q].push(r)
                                        } else {
                                            i[q] = r
                                        }
                                    }
                                }
                            }
                            if (!i) {
                                if (o.elseRe.test(f[4])) {
                                    o.doElse()
                                } else {
                                    if (o.defaultRe.test(f[4])) {
                                        o.doDefault()
                                    } else {
                                        o.doTpl();
                                        p.push({
                                            type: "tpl"
                                        })
                                    }
                                }
                            } else {
                                if (i["if"]) {
                                    o.doIf(i["if"], i);
                                    p.push({
                                        type: "if"
                                    })
                                } else {
                                    if (i["switch"]) {
                                        o.doSwitch(i["switch"], i);
                                        p.push({
                                            type: "switch"
                                        })
                                    } else {
                                        if (i["case"]) {
                                            o.doCase(i["case"], i)
                                        } else {
                                            if (i.elif) {
                                                o.doElseIf(i.elif, i)
                                            } else {
                                                if (i["for"]) {
                                                    ++o.level;
                                                    o.doFor(i["for"], i);
                                                    p.push({
                                                        type: "for",
                                                        actions: i
                                                    })
                                                } else {
                                                    if (i.exec) {
                                                        o.doExec(i.exec, i);
                                                        p.push({
                                                            type: "exec",
                                                            actions: i
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            a = p.pop();
                            o.doEnd(a.type, a.actions);
                            if (a.type == "for") {
                                --o.level
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


Ext.define("Ext.util.SizeMonitor", {
    extend: "Ext.EventedBase",
    config: {
        element: null,
        detectorCls: Ext.baseCSSPrefix + "size-change-detector",
        callback: Ext.emptyFn,
        scope: null
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
            a = function (i) {
                g.onDetectorScroll("expand", i)
            },
            f = function (i) {
                g.onDetectorScroll("shrink", i)
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
        var b = this.getCallback(),
            a = this.getScope();
        b.call(a)
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


Ext.define("Ext.fx.easing.Abstract", {
    config: {
        startTime: 0,
        startValue: 0
    },
    isEnded: false,
    constructor: function (a) {
        this.initConfig(a);
        return this
    },
    clone: function () {
        var c = this.config,
            b = {},
            a;
        for (a in c) {
            if (c.hasOwnProperty(a)) {
                b[a] = this[a]
            }
        }
        return new this.self(b)
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


Ext.define("Ext.AbstractComponent", {
    extend: "Ext.EventedBase",
    onClassExtended: function (b, f) {
        if (!f.hasOwnProperty("cachedConfig")) {
            return
        }
        var g = b.prototype,
            c = f.config,
            e = f.cachedConfig,
            d = g.cachedConfigList,
            i = g.hasCachedConfig,
            a, h;
        delete f.cachedConfig;
        g.cachedConfigList = d = (d) ? d.slice() : [], g.hasCachedConfig = i = (i) ? Ext.Object.chain(i) : {};
        if (!c) {
            f.config = c = {}
        }
        for (a in e) {
            if (e.hasOwnProperty(a)) {
                h = e[a];
                if (!i[a]) {
                    i[a] = true;
                    d.push(a)
                }
                c[a] = h
            }
        }
    },
    initialized: false,
    constructor: function (s) {
        var k = this.self.prototype,
            f, h, r, l, a, n, c, e, q, j, o, d, b, t, p, g, m;
        this.initialConfig = s;
        this.initElement();
        if (!k.hasOwnProperty("renderTemplate")) {
            n = this.referenceList;
            f = Ext.Class.configNameCache;
            h = this.config;
            r = this.cachedConfigList;
            l = this.initConfigList;
            a = this.hasInitConfigMap;
            for (o = 0, d = r.length; o < d; o++) {
                t = r[o];
                p = f[t];
                g = p.initialized;
                k[g] = true;
                if (a[t]) {
                    delete a[t];
                    Ext.Array.remove(l, t)
                }
                if (h[t] !== null) {
                    m = p.internal;
                    this[m] = null;
                    this[p.set](h[t]);
                    k[m] = this[m]
                }
            }
            q = this.renderElement.dom;
            k.renderTemplate = e = document.createDocumentFragment();
            e.appendChild(q.cloneNode(true));
            j = e.querySelectorAll("[id]");
            for (o = 0, d = j.length; o < d; o++) {
                b = j[o];
                b.removeAttribute("id")
            }
            for (o = 0, d = n.length; o < d; o++) {
                c = n[o];
                this[c].dom.removeAttribute("reference")
            }
        }
        this.initialize()
    },
    initialize: function () {
        this.initConfig(this.initialConfig);
        this.initialized = true
    },
    getElementConfig: Ext.emptyFn,
    referenceAttributeName: "reference",
    referenceSelector: "[reference]",
    addReferenceNode: function (a, b) {
        Ext.Object.redefineProperty(this, a, function () {
            var c;
            delete this[a];
            this[a] = c = new Ext.Element(b);
            return c
        })
    },
    initElement: function () {
        var a = this.getId(),
            m = [],
            d = true,
            c = this.referenceAttributeName,
            j, f, h, b, g, l, k, e;
        if (this.self.prototype.hasOwnProperty("renderTemplate")) {
            j = this.renderTemplate.cloneNode(true);
            f = j.firstChild
        } else {
            d = false, j = document.createDocumentFragment();
            f = Ext.Element.create(this.getElementConfig(), true);
            j.appendChild(f)
        }
        b = j.querySelectorAll(this.referenceSelector);
        for (g = 0, l = b.length; g < l; g++) {
            k = b[g];
            e = k.getAttribute(c);
            if (d) {
                k.removeAttribute(c)
            }
            if (e == "element") {
                k.id = a;
                this.element = h = new Ext.Element(k)
            } else {
                this.addReferenceNode(e, k)
            }
            m.push(e)
        }
        this.referenceList = m;
        if (!this.innerElement) {
            this.innerElement = h
        }
        if (f === h.dom) {
            this.renderElement = h
        } else {
            this.addReferenceNode("renderElement", f)
        }
        return this
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
        function e(h, j, k, i) {
            if (k && d) {
                if (i) {
                    i = [a[j]].concat(Ext.functionFactory("return [" + i + "];")())
                } else {
                    i = [a[j]]
                }
                if (k.substr(0, 5) == "this.") {
                    return c[k.substr(5)].apply(c, i)
                } else {
                    return f[k].apply(f, i)
                }
            } else {
                return a[j] !== undefined ? a[j] : ""
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


Ext.define("Ext.XTemplateCompiler", {
    extend: "Ext.XTemplateParser",
    useEval: Ext.isGecko,
    useFormat: true,
    compile: function (a) {
        var d = this,
            c = d.generate(a),
            b = Ext.util.Format;
        return d.useEval ? d.evalTpl(b, c) : (new Function("fm", c))(b)
    },
    generate: function (a) {
        var c = this;
        c.body = ["var c0=values, p0=parent, n0=xcount, i0=xindex;\n"];
        c.funcs = [];
        c.switches = [];
        c.parse(a);
        c.funcs.push((c.useEval ? "var $=" : "return") + " function (" + c.fnArgs + ") {", c.body.join(""), "}");
        var b = c.funcs.join("\n");
        return b
    },
    doText: function (a) {
        this.body.push("out.push('", a.replace(this.aposRe, "\\'"), "')\n")
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
    doIf: function (c, d) {
        var b = this,
            a = b.addFn(c);
        b.body.push("if (", a, b.callFn, ") {\n");
        if (d.exec) {
            b.doExec(d.exec)
        }
    },
    doElseIf: function (c, d) {
        var b = this,
            a = b.addFn(c);
        b.body.push("} else if (", a, b.callFn, ") {\n");
        if (d.exec) {
            b.doExec(d.exec)
        }
    },
    doSwitch: function (c) {
        var b = this,
            a = b.addFn(c);
        b.body.push("switch (", a, b.callFn, ") {\n");
        b.switches.push(0)
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
                    if (e.indexOf(".") != -1) {
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
                g = "this." + g.substr(5) + "("
            }
        } else {
            d = "";
            g = "(" + c + " === undefined ? '' : "
        }
        return g + c + d + ")"
    },
    evalTpl: function (fm) {
        var $;
        eval(arguments[1]);
        return $
    },
    aposRe: /[']/g,
    intRe: /^\s*(\d+)\s*$/,
    tagRe: /([\w-\.\#]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?(\s?[\+\-\*\/]\s?[\d\.\+\-\*\/\(\)]+)?/
}, function () {
    var a = this.prototype;
    a.fnArgs = "out,values,parent,xindex,xcount";
    a.callFn = ".call(this," + a.fnArgs + ")"
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


Ext.define("Ext.fx.Easing", {
    requires: ["Ext.fx.easing.Linear"],
    constructor: function (a) {
        return Ext.factory(a, Ext.fx.easing.Linear, null, "easing")
    }
});


Ext.define("Ext.util.translatable.Abstract", {
    mixins: ["Ext.mixin.Observable"],
    requires: ["Ext.fx.Easing"],
    config: {
        element: null,
        easing: {},
        easingX: {},
        easingY: {},
        fps: 60
    },
    constructor: function (a) {
        var b;
        this.doAnimationFrame = Ext.Function.bind(this.doAnimationFrame, this);
        this.translation = {
            x: 0,
            y: 0
        };
        this.activeEasing = {
            x: null,
            y: null
        };
        this.initialConfig = a;
        if (a && a.element) {
            b = a.element;
            delete a.element;
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
        return new Ext.fx.Easing(a)
    },
    applyEasing: function (a) {
        a = this.factoryEasing(a);
        if (!this.getEasingX()) {
            this.setEasingX(a)
        }
        if (!this.getEasingY()) {
            this.setEasingY(a)
        }
        return a
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
    doTranslate: function (b) {
        var a = this.translation;
        if ("x" in b) {
            a.x = b.x
        }
        if ("y" in b) {
            a.y = b.y
        }
        return this
    },
    translate: function (b, a) {
        this.stopAnimation();
        if (a) {
            return this.translateAnimated(b, a)
        }
        return this.doTranslate(b)
    },
    translateAnimated: function (h, e) {
        if (!Ext.isObject(e)) {
            e = {}
        }
        var g = e.easing,
            b = this.activeEasing,
            f = this.translation,
            d = Ext.Date.now(),
            c = ("x" in h) ? (g || e.easingX || this.getEasingX()) : null,
            a = ("y" in h) ? (g || e.easingY || this.getEasingY()) : null;
        if (c) {
            c = this.factoryEasing(c);
            c.setStartTime(d);
            c.setStartValue(f.x);
            c.setEndValue(h.x);
            if ("duration" in e) {
                c.setDuration(e.duration)
            }
        }
        if (a) {
            a = this.factoryEasing(a);
            a.setStartTime(d);
            a.setStartValue(f.y);
            a.setEndValue(h.y);
            if ("duration" in e) {
                a.setDuration(e.duration)
            }
        }
        b.x = c;
        b.y = a;
        this.isAnimating = true;
        this.animationTimer = setInterval(this.doAnimationFrame, this.animationInterval, this);
        this.fireEvent("animationstart", this)
    },
    doAnimationFrame: function () {
        if (!this.isAnimating) {
            return
        }
        var f = this.activeEasing,
            b = f.x,
            a = f.y,
            d = b === null || b.isEnded,
            c = a === null || a.isEnded,
            e = {};
        if (d && c) {
            this.stopAnimation();
            return
        }
        if (!d) {
            e.x = Math.round(b.getValue())
        }
        if (!c) {
            e.y = Math.round(a.getValue())
        }
        this.doTranslate(e);
        this.fireEvent("animationframe", this, e)
    },
    stopAnimation: function () {
        if (!this.isAnimating) {
            return
        }
        var a = this.activeEasing;
        a.x = null;
        a.y = null;
        this.isAnimating = false;
        clearInterval(this.animationTimer);
        this.fireEvent("animationend", this)
    },
    refresh: function () {
        this.translate(this.translation)
    }
});


Ext.define("Ext.util.translatable.CssTransform", {
    extend: "Ext.util.translatable.Abstract",
    doTranslate: function (e) {
        var b = this.getElement().dom.style,
            c = this.translation,
            a, d;
        if ("x" in e) {
            a = e.x
        } else {
            a = c.x
        }
        if ("y" in e) {
            d = e.y
        } else {
            d = c.y
        }
        b.webkitTransform = "translate3d(" + a + "px, " + d + "px, 0px)";
        return this.callParent(arguments)
    },
    destroy: function () {
        this.getElement().dom.style.webkitTransform = null;
        this.callParent(arguments)
    }
});


Ext.define("Ext.util.translatable.ScrollPosition", {
    extend: "Ext.util.translatable.Abstract",
    wrapperWidth: 0,
    wrapperHeight: 0,
    baseCls: "x-translatable",
    getWrapper: function () {
        var d = this.wrapper,
            c = this.baseCls,
            b = this.getElement(),
            a;
        if (!d) {
            a = b.getParent();
            if (!a) {
                return null
            }
            d = b.wrap({
                className: c + "-wrapper"
            });
            d.insertFirst(Ext.Element.create({
                className: c + "-stretcher"
            }));
            b.addCls(c);
            a.addCls(c + "-container");
            this.container = a;
            this.wrapper = d;
            this.refresh()
        }
        return d
    },
    doTranslate: function (c) {
        var b = this.getWrapper(),
            a;
        if (b) {
            a = b.dom;
            if ("x" in c) {
                a.scrollLeft = this.wrapperWidth - c.x
            }
            if ("y" in c) {
                a.scrollTop = this.wrapperHeight - c.y
            }
        }
        return this.callParent(arguments)
    },
    refresh: function () {
        var b = this.getWrapper(),
            a;
        if (b) {
            a = b.dom;
            this.wrapperWidth = a.offsetWidth;
            this.wrapperHeight = a.offsetHeight;
            this.callParent(arguments)
        }
    },
    destroy: function () {
        var b = this.getElement(),
            c = this.getWrapper(),
            a = this.baseCls;
        if (c) {
            this.container.removeCls(a + "-container");
            b.unwrap();
            b.removeCls(a);
            c.destroy()
        }
        this.callParent(arguments)
    }
});


Ext.define("Ext.util.Translatable", {
    requires: ["Ext.util.translatable.CssTransform", "Ext.util.translatable.ScrollPosition"],
    constructor: function (a) {
        if (Ext.os.is.Android2) {
            return new Ext.util.translatable.ScrollPosition(a)
        }
        return new Ext.util.translatable.CssTransform(a)
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
        a.addCls(this.getCls());
        this.sizeMonitors.element = new Ext.util.SizeMonitor({
            element: a,
            callback: this.doRefresh,
            scope: this
        });
        this.initConfig(this.initialConfig)
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
        this.fireAction("dragstart", [this, a, this.offset], this.initDragStart)
    },
    initDragStart: function (b, c, a) {
        this.dragStartOffset = {
            x: a.x,
            y: a.y
        };
        this.isDragging = true;
        this.getElement().addCls(this.getDraggingCls())
    },
    onDrag: function (b) {
        if (!this.isDragging) {
            return
        }
        var a = this.dragStartOffset;
        this.fireAction("drag", [this, b,
        {
            x: a.x + b.deltaX,
            y: a.y + b.deltaY
        }], this.doDrag)
    },
    doDrag: function (a, b, c) {
        a.setOffset(c)
    },
    onDragEnd: function (a) {
        if (!this.isDragging) {
            return
        }
        this.onDrag(a);
        this.isDragging = false;
        this.fireEvent("dragend", this, a);
        this.getElement().removeCls(this.getDraggingCls())
    },
    setOffset: function (e, b) {
        var g = this.offset,
            j = e.x,
            i = e.y,
            a = this.getConstraint(),
            f = a.min,
            c = a.max,
            d = Math.min,
            h = Math.max;
        if (this.isAxisEnabled("x") && typeof j == "number") {
            j = d(h(j, f.x), c.x)
        } else {
            j = g.x
        }
        if (this.isAxisEnabled("y") && typeof i == "number") {
            i = d(h(i, f.y), c.y)
        } else {
            i = g.y
        }
        g.x = j;
        g.y = i;
        this.getTranslatable().translate(g, b)
    },
    getOffset: function () {
        return this.offset
    },
    refreshConstraint: function () {
        this.setConstraint(this.currentConstraint)
    },
    refreshOffset: function () {
        this.setOffset(this.offset)
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
        this.getElement().removeCls(this.getCls());
        this.detachListeners();
        if (a) {
            a.destroy()
        }
    }
}, function () {
    this.override({
        constructor: function (a) {
            if (a && a.constrain) {
                a.contraint = a.constrain;
                delete a.constrain
            }
            return this.callOverridden(arguments)
        }
    })
});


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
            ui: null,
            margin: null,
            padding: null,
            border: null,
            styleHtmlCls: a + "html",
            styleHtmlContent: null,
            hidden: false
        },
        eventedConfig: {
            left: null,
            top: null,
            right: null,
            bottom: null,
            width: null,
            height: null,
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
            tplWriteMode: "overwrite",
            data: null,
            disabledCls: a + "item-disabled",
            modal: null,
            hideOnMaskTap: true,
            contentEl: null,
            itemId: undefined,
            plugins: null,
            elementListeners: null
        },
        alignPositionMap: ["tl-bl", "t-b", "tr-br", "l-r", "l-r", "r-l", "bl-tl", "b-t", "br-tr"],
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
        constructor: function (b) {
            if (b && b.id) {
                this.id = b.id;
                delete b.id
            } else {
                this.getId()
            }
            Ext.ComponentManager.register(this);
            this.callParent(arguments);
            if ("fullscreen" in this.config) {
                this.fireEvent("fullscreen", this)
            }
        },
        getTemplate: function () {
            return this.template
        },
        getElementConfig: function () {
            return {
                reference: "element",
                children: this.getTemplate()
            }
        },
        getEl: function () {
            return this.renderElement
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
        applyElementListeners: function (b) {
            this.element.on(b)
        },
        applyPlugins: function (b) {
            var d, c;
            if (!b) {
                return b
            }
            b = [].concat(b);
            for (c = 0, d = b.length; c < d; c++) {
                b[c] = Ext.factory(b[c], "Ext.plugin.Plugin", null, "plugin")
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
            this.element.dom.setAttribute("style", b)
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
                if (b) {
                    this.addCls(b, c)
                }
                if (d) {
                    this.removeCls(d, c)
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
                this.addCls(b);
                if (e) {
                    this.addCls(b, null, e)
                }
            }
            if (c) {
                this.removeCls(c);
                if (e) {
                    this.removeCls(c, null, e)
                }
            }
        },
        updateCls: function (b, c) {
            this.replaceCls(c, b)
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
                this.setHtml(b);
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
            var b = true;
            if (this.getTop() === null && this.getBottom() === null && this.getRight() === null && this.getLeft() === null) {
                b = false
            }
            if (b !== this.floating) {
                if (b) {
                    if (this.isCentered()) {
                        this.setCentered(false)
                    }
                    if (this.isDocked()) {
                        this.setDocked(false)
                    }
                }
                this.floating = b;
                this.fireEvent("floatingchange", this, b)
            }
        },
        applyDisabled: function (b) {
            return Boolean(b)
        },
        doSetDisabled: function (b) {
            this.element[b ? "addCls" : "removeCls"](this.getDisabledCls())
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
        updateZIndex: function (b) {
            this.element.dom.style.zIndex = b
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
            if (typeof b === "string") {
                c.setHtml(b)
            } else {
                c.setHtml("");
                c.append(b)
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
        },
        isHidden: function () {
            return this.getHidden()
        },
        hide: function () {
            this.setHidden(true)
        },
        show: function () {
            this.setHidden(false)
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
        updateData: function (d) {
            var e = this;
            if (d) {
                var c = e.getTpl(),
                    b = e.getTplWriteMode();
                if (c) {
                    c[b](e.getInnerHtmlElement(), d)
                }
            }
        },
        addCls: function (b, c, d) {
            this.element.addCls(b, c, d)
        },
        removeCls: function (b, c, d) {
            this.element.removeCls(b, c, d)
        },
        replaceCls: function (b, c, d, e) {
            this.element.replaceCls(b, c, d, e)
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
        showBy: function (d, e, b) {
            var c = this.getParent();
            if (c) {
                c.remove(this, false)
            }
            Ext.Viewport.add(this);
            this.setTop(-10000);
            this.setLeft(-10000);
            this.show();
            this.alignTo(d, b || "auto");
            this.element.repaint()
        },
        anchorRe: /^([a-z]+)-([a-z]+)(\?)?$/,
        doAnchorXY: function (d, g, h, n) {
            var f = d.match(this.anchorRe),
                o = f[1].split(""),
                m = f[2].split(""),
                p = {
                    top: h.top,
                    left: h.left
                },
                l = (f[3] === "?"),
                b = o[0],
                k = o[1] || b,
                j = m[0],
                i = m[1] || j,
                c, e;
            switch (b) {
            case "t":
                switch (j) {
                case "c":
                    p.top += h.height / 2;
                    break;
                case "b":
                    p.top += h.height
                }
                break;
            case "b":
                switch (j) {
                case "c":
                    p.top -= (g.height - (h.height / 2));
                    break;
                case "t":
                    p.top -= g.height
                }
                break;
            case "c":
                switch (j) {
                case "t":
                    p.top -= (g.height / 2);
                    break;
                case "c":
                    p.top -= ((g.height / 2) - (h.height / 2));
                    break;
                case "b":
                    p.top -= ((g.height / 2) - h.height)
                }
                break
            }
            switch (k) {
            case "l":
                switch (i) {
                case "c":
                    p.left += h.width / 2;
                    break;
                case "r":
                    p.left += h.width
                }
                break;
            case "r":
                switch (i) {
                case "r":
                    p.left -= (g.width - h.width);
                    break;
                case "c":
                    p.left -= (g.width - (h.width / 2));
                    break;
                case "l":
                    p.left -= g.width
                }
                break;
            case "c":
                switch (i) {
                case "l":
                    p.left -= (g.width / 2);
                    break;
                case "c":
                    p.left -= ((g.width / 2) - (h.width / 2));
                    break;
                case "r":
                    p.left -= ((g.width / 2) - h.width)
                }
                break
            }
            if (l) {
                c = (n.left + n.width) - g.width;
                e = (n.top + n.height) - g.height;
                p.left = Math.max(n.left, Math.min(c, p.left));
                p.top = Math.max(n.top, Math.min(e, p.top))
            }
            return p
        },
        alignTo: function (h, e, d) {
            d = d || 0;
            var g = h.element,
                b = webkitConvertPointFromNodeToPage(g.dom, new WebKitPoint()),
                k = g.getSize(),
                n = this.element.getSize(),
                j = this.getParent(),
                m = (j) ? j.element.getBox() : Ext.getBody().getBox(),
                f = {
                    left: 0,
                    top: 0,
                    width: n.width,
                    height: n.height
                },
                l = {
                    left: b.x,
                    top: b.y,
                    width: k.width,
                    height: k.height
                },
                i, c;
            if (e == "auto") {
                e = "tc-bc"
            }
            i = this.doAnchorXY(e, f, l, m);
            if (i.top + f.height > m.top + m.height) {
                c = this.doAnchorXY("bc-tc?", f, l, m);
                i.top = c.top
            }
            if (i.left + f.width > m.left + m.width) {
                c = this.doAnchorXY("br-tr?", f, l, m);
                i.left = c.left
            } else {
                if (i.left < m.left) {
                    c = this.doAnchorXY("bl-tl?", f, l, m);
                    i.left = c.left
                }
            }
            this.setTop(i.top);
            this.setLeft(i.left)
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
        destroy: function () {
            this.callParent();
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
            Ext.ComponentManager.unregister(this)
        }
    }, function () {
        var b = Ext.emptyFn;
        this.override({
            constructor: function (d) {
                var c;
                if (d) {
                    if (d.enabled) {
                        d.disabled = !d.enabled
                    }
                    if ((d.scroll || this.config.scroll || this.scrollable || this.config.scrollable) && !this.isContainer) {
                        delete d.scrollable;
                        delete d.scroll
                    }
                    if (d.dock) {
                        d.docked = d.dock;
                        delete d.dock
                    }
                    if (d.componentCls) {
                        d.cls = d.componentCls
                    }
                    for (c in d) {
                        if (d.hasOwnProperty(c) && c !== "xtype" && c !== "xclass" && !this.hasConfig(c)) {
                            this[c] = d[c]
                        }
                    }
                }
                this.callParent(arguments);
                if (this.onRender !== b) {
                    this.onRender()
                }
                if (this.afterRender !== b) {
                    this.afterRender()
                }
                if (this.initEvents !== b) {
                    this.initEvents()
                }
                if (this.initComponent !== b) {
                    this.initComponent()
                }
            },
            onRender: b,
            afterRender: b,
            initEvents: b,
            initComponent: b,
            show: function () {
                if (this.renderElement.dom) {
                    var c = this.renderElement.dom.parentNode;
                    if (c && c.nodeType == 11) {
                        Ext.Viewport.add(this)
                    }
                }
                return this.callParent(arguments)
            },
            doSetHidden: function (c) {
                this.callParent(arguments);
                this.fireEvent(c ? "hide" : "show", this)
            }
        });
        Ext.deprecateClassMembers(this, {
            el: "element",
            body: "element",
            outer: "renderElement",
            ownerCt: "parent",
            update: "setHtml"
        })
    })
})(Ext.baseCSSPrefix);


Ext.define("Ext.event.publisher.ComponentDelegation", {
    extend: "Ext.event.publisher.Publisher",
    requires: ["Ext.Component", "Ext.ComponentQuery"],
    targetType: "component",
    optimizedSelectorRegex: /^#([\w\-]+)((?:[\s]*)>(?:[\s]*)|(?:\s*))([\w\-]+)$/i,
    idSelectorRegex: /^#([\w\-]+)$/i,
    handledEvents: ["*"],
    constructor: function () {
        this.subscribers = {};
        return this.callParent(arguments)
    },
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
            k = a.type,
            c = a.selector,
            d, i, j, b, h;
        if (e !== null) {
            d = e[1];
            i = e[2].indexOf(">") === -1;
            j = e[3];
            b = k[j];
            if (!b) {
                b = k[j] = {
                    descendents: {
                        $length: 0
                    },
                    children: {
                        $length: 0
                    },
                    $length: 0
                }
            }
            h = i ? b.descendents : b.children;
            if (h[d]) {
                return true
            }
            h[d] = true;
            h.$length++;
            b.$length++;
            k.$length++
        } else {
            if (c[g]) {
                return true
            }
            c[g] = true;
            c.push(g)
        }
        a.$length++;
        return true
    },
    unsubscribe: function (g, f) {
        var a = this.getSubscribers(f);
        if (!a) {
            return false
        }
        var e = g.match(this.optimizedSelectorRegex),
            k = a.type,
            c = a.selector,
            d, i, j, b, h;
        if (e !== null) {
            d = e[1];
            i = e[2].indexOf(">") === -1;
            j = e[3];
            b = k[j];
            if (!b) {
                return true
            }
            h = i ? b.descendents : b.children;
            if (h[d]) {
                delete h[d];
                h.$length--;
                b.$length--;
                k.$length--
            }
        } else {
            if (!c[g]) {
                return true
            }
            delete c[g];
            Ext.Array.remove(c, g)
        }
        a.$length--;
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
        if (b && b.hasParent()) {
            this.dispatcher.doAddListener(this.targetType, d, a, "publish", this, {
                args: [a, b]
            }, "before")
        }
    },
    matchesSelector: function (b, a) {
        return Ext.ComponentQuery.is(b, a)
    },
    dispatch: function (d, b, c, a) {
        this.dispatcher.doDispatchEvent(this.targetType, d, b, c, [], a)
    },
    publish: function (g, k) {
        var p = arguments[arguments.length - 1],
            e = this.getSubscribers(g),
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
                        if (s[m] === true) {
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
                        if (n[t] === true) {
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
    idSelectorRegex: /^#([\w\-]+)$/i,
    eventNames: {
        painted: "painted",
        erased: "erased"
    },
    constructor: function () {
        this.callParent(arguments);
        this.subscribers = {}
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
        a.doAddListener(b, "*", "renderedchange", "onComponentRenderedChange", this);
        a.doAddListener(b, "*", "hiddenchange", "onComponentHiddenChange", this);
        return this.callParent(arguments)
    },
    subscribe: function (d, a) {
        var b = d.match(this.idSelectorRegex),
            c;
        if (!b) {
            return false
        }
        c = this.getSubscribers(a, true);
        c[b[1]] = true;
        c.$length++;
        return true
    },
    unsubscribe: function (d, a) {
        var b = d.match(this.idSelectorRegex),
            c;
        if (!b || !(c = this.getSubscribers(a))) {
            return false
        }
        delete c[b[1]];
        c.$length--;
        return true
    },
    onComponentRenderedChange: function (b, e) {
        var d = this.eventNames,
            a = e ? d.painted : d.erased,
            c = this.getSubscribers(a);
        if (c && c.$length > 0) {
            this.publish(c, b, a)
        }
    },
    onComponentHiddenChange: function (b, c) {
        var e = this.eventNames,
            a = c ? e.erased : e.painted,
            d = this.getSubscribers(a);
        if (d && d.$length > 0) {
            this.publish(d, b, a)
        }
    },
    publish: function (a, j, f) {
        var c = j.getId(),
            b = false,
            d, h, e, g, k;
        if (a[c]) {
            d = this.eventNames;
            k = j.isPainted();
            if ((f === d.painted && k) || f === d.erased && !k) {
                b = true
            } else {
                return this
            }
        }
        if (j.isContainer) {
            h = j.getItems().items;
            for (e = 0, g = h.length; e < g; e++) {
                this.publish(a, h[e], f)
            }
        } else {
            if (j.isDecorator) {
                this.publish(a, j.getComponent(), f)
            }
        }
        if (b) {
            this.dispatcher.doDispatchEvent(this.targetType, "#" + c, f, [j])
        }
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


Ext.define("Ext.fx.animation.Abstract", {
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
        onEnd: null,
        onBeforeEnd: null,
        scope: null,
        preserveEndState: true
    },
    STATE_FROM: "0%",
    STATE_TO: "100%",
    DIRECTION_UP: "up",
    DIRECTION_DOWN: "down",
    DIRECTION_LEFT: "left",
    DIRECTION_RIGHT: "right",
    stateNameRegex: /^(?:[\d\.]+)%$/,
    constructor: function (a) {
        this.states = {};
        this.initConfig(a);
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
        var k = this.getStates(),
            e = {},
            g = this.getBefore(),
            c = this.getAfter(),
            h = k[this.STATE_FROM],
            i = k[this.STATE_TO],
            j = h.getData(),
            f = i.getData(),
            d, b, a;
        for (b in k) {
            if (k.hasOwnProperty(b)) {
                a = k[b];
                d = a.getData();
                e[b] = d
            }
        }
        if (Ext.os.is.Android2) {
            e["0.0001%"] = j
        }
        return {
            before: g ? g.getData() : {},
            after: c ? c.getData() : {},
            states: e,
            from: j,
            to: f,
            duration: this.getDuration(),
            iteration: this.getIteration(),
            direction: this.getDirection(),
            easing: this.getEasing(),
            delay: this.getDelay(),
            onEnd: this.getOnEnd(),
            onBeforeEnd: this.getOnBeforeEnd(),
            scope: this.getScope(),
            preserveEndState: this.getPreserveEndState()
        }
    }
});


Ext.define("Ext.fx.animation.Slide", {
    extend: "Ext.fx.animation.Abstract",
    alternateClassName: "Ext.fx.animation.SlideIn",
    alias: "animation.slide",
    config: {
        direction: "right",
        out: false,
        offset: 0,
        easing: "auto",
        containerBox: "auto",
        elementBox: "auto",
        useCssTransform: true,
        reverse: null
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
        if (a === "auto") {
            a = this.getElement().getPageBox()
        }
        return a
    },
    getData: function () {
        var p = this.getElementBox(),
            c = this.getContainerBox(),
            g = p ? p : c,
            n = this.getFrom(),
            o = this.getTo(),
            f = this.getOut(),
            e = this.getOffset(),
            m = this.getDirection(),
            b = this.getUseCssTransform(),
            h = this.getReverse(),
            d = 0,
            a = 0,
            l, j, k, i;
        if (h) {
            m = this.reverseDirectionMap[m]
        }
        switch (m) {
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
        l = (f) ? 0 : d;
        j = (f) ? 0 : a;
        if (b) {
            n.setTransform({
                translateX: l,
                translateY: j
            })
        } else {
            n.set("left", l);
            n.set("top", j)
        }
        k = (f) ? d : 0;
        i = (f) ? a : 0;
        if (b) {
            o.setTransform({
                translateX: k,
                translateY: i
            })
        } else {
            o.set("left", k);
            o.set("top", i)
        }
        return this.callParent(arguments)
    }
});


Ext.define("Ext.fx.animation.Fade", {
    extend: "Ext.fx.animation.Abstract",
    alternateClassName: "Ext.fx.animation.FadeIn",
    alias: "animation.fade",
    config: {
        out: false,
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
        var f = this.getFrom(),
            g = this.getTo(),
            e = this.getDirection(),
            a = this.getOut(),
            j = this.getHalf(),
            b = (j) ? 90 : 180,
            i = 0,
            h = 0,
            d = 0,
            c = 0;
        switch (e) {
        case this.DIRECTION_UP:
            if (a) {
                d = b
            } else {
                i = -b
            }
            break;
        case this.DIRECTION_DOWN:
            if (a) {
                d = -b
            } else {
                i = b
            }
            break;
        case this.DIRECTION_RIGHT:
            if (a) {
                c = -b
            } else {
                h = b
            }
            break;
        case this.DIRECTION_LEFT:
            if (a) {
                c = -b
            } else {
                h = b
            }
            break
        }
        f.setTransform({
            rotateX: i,
            rotateY: h
        });
        g.setTransform({
            rotateX: d,
            rotateY: c
        });
        return this.callParent(arguments)
    }
});


Ext.define("Ext.fx.animation.Pop", {
    extend: "Ext.fx.animation.Abstract",
    alias: "animation.pop",
    alternateClassName: "Ext.fx.animation.PopIn",
    config: {
        out: false
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


Ext.define("Ext.fx.animation.Cube", {
    extend: "Ext.fx.animation.Abstract",
    alias: "animation.cube",
    config: {
        before: {
            "transform-style": "preserve-3d"
        },
        direction: "right",
        out: false
    },
    getData: function () {
        var n = this.getTo(),
            o = this.getFrom(),
            f = this.getOut(),
            m = this.getDirection(),
            c = this.getElement(),
            h = c.getWidth(),
            d = c.getHeight(),
            g = (h / 2),
            i = (d / 2),
            b = {},
            l = {},
            e = {
                rotateY: 0,
                translateX: 0,
                translateZ: 0
            },
            p = {
                rotateY: 90,
                translateX: g,
                translateZ: g
            },
            k = {
                rotateX: 0,
                translateY: 0,
                translateZ: 0
            },
            a = {
                rotateX: 90,
                translateY: i,
                translateZ: i
            },
            j;
        if (m == "left" || m == "right") {
            if (f) {
                l = p;
                b = e
            } else {
                l = e;
                b = p;
                b.rotateY *= -1;
                b.translateX *= -1
            }
            if (m === "right") {
                j = b;
                b = l;
                l = j
            }
        }
        if (m == "up" || m == "down") {
            if (f) {
                l = k;
                b = {
                    rotateX: -90,
                    translateY: i,
                    translateZ: i
                }
            } else {
                b = k;
                l = {
                    rotateX: 90,
                    translateY: -i,
                    translateZ: i
                }
            }
            if (m == "up") {
                j = b;
                b = l;
                l = j
            }
        }
        o.set("transform", b);
        n.set("transform", l);
        return this.callParent(arguments)
    }
});


Ext.define("Ext.fx.Animation", {
    requires: ["Ext.fx.animation.Slide", "Ext.fx.animation.Fade", "Ext.fx.animation.Flip", "Ext.fx.animation.Pop", "Ext.fx.animation.Cube"],
    constructor: function (b) {
        var a = Ext.fx.animation.Abstract,
            c;
        if (typeof b == "string") {
            c = b;
            b = {}
        } else {
            if (b.type) {
                c = b.type
            }
        }
        if (c) {
            a = Ext.ClassManager.getByAlias("animation." + c)
        }
        return Ext.factory(b, a)
    }
});


Ext.define("Ext.fx.runner.Css", {
    extend: "Ext.EventedBase",
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
        this.supports3dTransforms = a;
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
    applyRules: function (i) {
        var g = this.getStyleSheet(),
            k = this.ruleStylesCache,
            j = g.cssRules,
            c, e, h, b, d, a, f;
        for (c in i) {
            e = i[c];
            h = k[c];
            if (h === undefined) {
                d = j.length;
                g.insertRule(c + "{}", d);
                h = k[c] = j.item(d).style
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
                    h.setProperty(a, f, "important")
                }
            }
        }
        return this
    },
    applyStyles: function (d) {
        var g, c, f, b, a, e;
        for (g in d) {
            c = document.getElementById(g);
            f = c.style;
            b = d[g];
            for (a in b) {
                e = this.formatValue(b[a], a);
                a = this.formatName(a);
                f.setProperty(a, e, "important")
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
        this.requestAnimationFrame = Ext.feature.getSupportedPropertyName(window, "requestAnimationFrame");
        this.runningData = {};
        this.runningAnimationsData = {};
        return this.callParent(arguments)
    },
    attachListeners: function () {
        this.listenersAttached = true;
        this.getEventDispatcher().addListener("element", "*", "transitionend", "onTransitionEnd", this)
    },
    onTransitionEnd: function (a) {
        this.refreshRunningAnimationsData(Ext.get(a.target), [a.browserEvent.propertyName])
    },
    onAnimationEnd: function (d, c, f) {
        var b = d.getId(),
            k = {},
            j = {
                "transition-property": null,
                "transition-duration": null,
                "transition-timing-function": null,
                "transition-delay": null
            },
            g, e, h, a;
        k[b] = j;
        if (c.onBeforeEnd) {
            c.onBeforeEnd.call(c.scope || this, d, f)
        }
        if (!f && !c.preserveEndState) {
            g = c.toPropertyNames;
            for (e = 0, h = g.length; e < h; e++) {
                a = g[e];
                j[a] = null
            }
        }
        if (c.after) {
            Ext.merge(j, c.after)
        }
        this.applyStyles(k);
        if (c.onEnd) {
            c.onEnd.call(c.scope || this, d, f)
        }
    },
    refreshRunningAnimationsData: function (k, d, h) {
        var b = k.getId(),
            c = this.runningAnimationsData,
            o = c[b],
            n, f, l, a, g, e, m;
        if (!o) {
            return this
        }
        n = o.length;
        if (n === 0) {
            return this
        }
        for (g = 0; g < n; g++) {
            e = o[g];
            m = e.properties;
            for (f = 0, l = d.length; f < l; f++) {
                a = d[f];
                if (m[a]) {
                    delete m[a];
                    e.length--
                }
            }
            if (e.length == 0) {
                o.splice(g, 1);
                g--;
                n--;
                this.onAnimationEnd(k, e.data, h)
            }
        }
    },
    getTestElement: function () {
        var c = this.testElement,
            b, d, a;
        if (!c) {
            b = document.createElement("iframe");
            a = b.style;
            a.visibility = "hidden !important";
            a.width = "0px !important";
            a.height = "0px !important";
            a.position = "absolute !important";
            a.zIndex = "-1000 !important";
            document.body.appendChild(b);
            d = b.contentDocument;
            this.testElement = c = d.createElement("div");
            c.style.position = "absolute !important";
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
    run: function (q) {
        var G = this,
            k = this.lengthProperties,
            g = this.requestAnimationFrame,
            b = this.runningData,
            x = {},
            F = {},
            H = {},
            E = this.runningAnimationsData,
            e, c, s, y, d, t, J, u, A, p, r, a, B, z, o, C, m, v, h, D, I, l, f, w, n;
        if (!this.listenersAttached) {
            this.attachListeners()
        }
        q = Ext.Array.from(q);
        for (B = 0, o = q.length; B < o; B++) {
            C = q[B];
            C = Ext.factory(C, Ext.fx.Animation);
            c = C.getElement();
            h = window.getComputedStyle(c.dom);
            s = c.getId();
            e = b[s];
            C = Ext.merge({}, C.getData());
            H[s] = C;
            t = C.before;
            y = C.from;
            d = C.to;
            C.fromPropertyNames = J = [];
            C.toPropertyNames = u = [];
            for (I in d) {
                if (d.hasOwnProperty(I)) {
                    d[I] = l = this.formatValue(d[I], I);
                    D = this.formatName(I);
                    n = k.hasOwnProperty(I);
                    if (!n) {
                        l = this.getCssStyleValue(D, l)
                    }
                    if (y.hasOwnProperty(I)) {
                        y[I] = w = this.formatValue(y[I], I);
                        if (!n) {
                            w = this.getCssStyleValue(D, w)
                        }
                        if (l !== w) {
                            J.push(D);
                            u.push(D)
                        }
                    } else {
                        f = h.getPropertyValue(D);
                        if (l !== f) {
                            u.push(D)
                        }
                    }
                }
            }
            A = Ext.Array.merge(J, u);
            v = {};
            m = u.length;
            for (z = 0; z < m; z++) {
                v[u[z]] = true
            }
            if (!(a = E[s])) {
                E[s] = a = []
            }
            this.refreshRunningAnimationsData(c, A, true);
            if (m === 0) {
                this.onAnimationEnd(c, C);
                continue
            } else {
                a.push({
                    element: c,
                    properties: v,
                    length: m,
                    data: C
                })
            }
            x[s] = y = Ext.apply(Ext.Object.chain(t), y);
            if (e) {
                J = Ext.Array.difference(e.toPropertyNames, J);
                u = Ext.Array.merge(J, u);
                y["transition-property"] = J
            }
            F[s] = d = Ext.Object.chain(d);
            d["transition-property"] = u;
            d["transition-duration"] = C.duration;
            d["transition-timing-function"] = C.easing;
            d["transition-delay"] = C.delay
        }
        Ext.merge(b, H);
        if (g) {
            window[g](function () {
                G.applyStyles(x);
                window[g](function () {
                    G.applyStyles(F)
                })
            })
        } else {
            r = this.$className;
            this.applyStyles(x);
            p = function (i) {
                if (i.data === r && i.source === window) {
                    window.removeEventListener("message", p, false);
                    G.applyStyles(F)
                }
            };
            window.addEventListener("message", p, false);
            window.postMessage(r, "*")
        }
    }
});


Ext.define("Ext.fx.runner.CssAnimation", {
    extend: "Ext.fx.runner.Css",
    constructor: function () {
        this.runningAnimationsMap = {};
        this.elementEndStates = {};
        this.animationElementMap = {};
        this.keyframesRulesCache = {};
        this.uniqueId = 0;
        return this.callParent(arguments)
    },
    attachListeners: function () {
        var a = this.getEventDispatcher();
        this.listenersAttached = true;
        a.addListener("element", "*", "animationstart", "onAnimationStart", this);
        a.addListener("element", "*", "animationend", "onAnimationEnd", this)
    },
    onAnimationStart: function (g) {
        var b = g.browserEvent.animationName,
            a = this.animationElementMap[b],
            f = this.runningAnimationsMap[a][b],
            h = this.elementEndStates,
            c = h[a],
            d = {};
        console.log("START============= " + b);
        if (c) {
            delete h[a];
            d[a] = c;
            this.applyStyles(d)
        }
        if (f.before) {
            d[a] = f.before;
            this.applyStyles(d)
        }
    },
    onAnimationEnd: function (i) {
        var c = i.target,
            b = i.browserEvent.animationName,
            d = this.animationElementMap,
            a = d[b],
            f = this.runningAnimationsMap,
            h = f[a],
            g = h[b];
        console.log("END============= " + b);
        if (g.onBeforeEnd) {
            g.onBeforeEnd.call(g.scope || this, c)
        }
        if (g.onEnd) {
            g.onEnd.call(g.scope || this, c)
        }
        delete d[b];
        delete h[b];
        this.removeKeyframesRule(b)
    },
    generateAnimationId: function () {
        return "animation-" + (++this.uniqueId)
    },
    run: function (f) {
        var s = {},
            t = this.elementEndStates,
            o = this.animationElementMap,
            r = this.runningAnimationsMap,
            b, d, h, k, p, g, q, u, m, l, c, e, a, j, n;
        if (!this.listenersAttached) {
            this.attachListeners()
        }
        f = Ext.Array.from(f);
        for (p = 0, g = f.length; p < g; p++) {
            q = f[p];
            q = Ext.factory(q, Ext.fx.Animation);
            h = q.getElement().getId();
            k = q.getName() || this.generateAnimationId();
            o[k] = h;
            q = q.getData();
            d = q.states;
            this.addKeyframesRule(k, d);
            b = r[h];
            if (!b) {
                b = r[h] = {}
            }
            b[k] = q;
            l = [];
            c = [];
            e = [];
            a = [];
            j = [];
            n = [];
            for (u in b) {
                if (b.hasOwnProperty(u)) {
                    m = b[u];
                    l.push(u);
                    c.push(m.duration);
                    e.push(m.easing);
                    a.push(m.delay);
                    j.push(m.direction);
                    n.push(m.iteration)
                }
            }
            s[h] = {
                "animation-name": l,
                "animation-duration": c,
                "animation-timing-function": e,
                "animation-delay": a,
                "animation-direction": j,
                "animation-iteration-count": n
            };
            if (q.preserveEndState) {
                t[h] = d["100%"]
            }
        }
        this.applyStyles(s)
    },
    addKeyframesRule: function (a, c) {
        var k, e, b, g, i, j, d, h, f;
        g = this.getStyleSheet();
        i = g.cssRules;
        d = i.length;
        g.insertRule("@" + this.vendorPrefix + "keyframes " + a + "{}", d);
        b = i[d];
        for (k in c) {
            e = c[k];
            i = b.cssRules;
            d = i.length;
            j = [];
            for (h in e) {
                f = this.formatValue(e[h], h);
                h = this.formatName(h);
                j.push(h + ":" + f)
            }
            b.insertRule(k + "{" + j.join(";") + "}", d)
        }
        return this
    },
    removeKeyframesRule: function (a) {
        var f = this.getStyleSheet(),
            e = f.cssRules,
            b, c, d;
        for (b = 0, c = e.length; b < c; b++) {
            d = e[b];
            if (d.name === a) {
                f.removeRule(b);
                break
            }
        }
        return this
    }
});


Ext.define("Ext.fx.Runner", {
    requires: ["Ext.fx.runner.CssTransition", "Ext.fx.runner.CssAnimation"],
    constructor: function () {
        return new Ext.fx.runner.CssTransition()
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


Ext.define("Ext.Mask", {
    extend: "Ext.Component",
    xtype: "mask",
    config: {
        baseCls: Ext.baseCSSPrefix + "mask",
        transparent: false,
        hidden: true,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.element.on({
            tap: "onTap",
            scope: a
        })
    },
    onTap: function (a) {
        this.fireEvent("tap", this, a)
    },
    updateTransparent: function (a) {
        this[a ? "addCls" : "removeCls"](this.getBaseCls() + "-transparent")
    }
});


Ext.define("Ext.LoadMask", {
    extend: "Ext.Mask",
    xtype: "loadmask",
    config: {
        message: "Loading...",
        messageCls: Ext.baseCSSPrefix + "mask-message",
        indicator: true
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
        this.messageElement.update(a)
    },
    updateMessageCls: function (b, a) {
        this.messageElement.replaceCls(a, b)
    },
    updateIndicator: function (a) {
        this[a ? "removeCls" : "addCls"](Ext.baseCSSPrefix + "indicator-hidden")
    }
}, function () {
    this.override({
        constructor: function (b, a) {
            if (typeof a !== "undefined") {
                b = a;
                Ext.Logger.deprecate("You no longer need to pass an element to create a Ext.LoadMask. It is a component and can be shown using the Ext.Container.masked configuration.", this)
            }
            if (b) {
                if (b.hasOwnProperty("msg")) {
                    b.message = b.msg;
                    Ext.Logger.deprecate("'msg' config is deprecated, please use 'message' config instead", this);
                    delete b.msg
                }
                if (b.hasOwnProperty("msgCls")) {
                    b.messageCls = b.msgCls;
                    Ext.Logger.deprecate("'msgCls' config is deprecated, please use 'messageCls' config instead", this);
                    delete b.msgCls
                }
                if (b.hasOwnProperty("store")) {
                    Ext.Logger.deprecate("'store' config is deprecated. You can no longer bind a store to a Ext.LoadMask", this);
                    delete b.store
                }
            }
            this.callParent([b])
        },
        bindStore: function () {
            Ext.Logger.deprecate("You can no longer bind a store to a Ext.LoadMask", this)
        }
    })
});
(function (a) {
    

Ext.define("Ext.layout.Default", {
        extend: "Ext.EventedBase",
        alternateClassName: ["Ext.layout.AutoContainerLayout", "Ext.layout.ContainerLayout"],
        alias: ["layout.auto", "layout.default"],
        isLayout: true,
        eventNames: {
            add: "add",
            remove: "remove",
            move: "move",
            centeredChange: "centeredchange",
            floatingChange: "floatingchange",
            dockedChange: "dockedchange",
            activeItemChange: "activeitemchange"
        },
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
        onActiveItemChange: function () {
            this.doActiveItemChange.apply(this, arguments)
        },
        doItemAdd: function (d, b) {
            var c = d.getDocked();
            if (c) {
                this.dockItem(d, c)
            } else {
                if (d.isCentered()) {
                    this.centerItem(d, b)
                } else {
                    this.insertItem(d, b)
                }
            }
            if (d.isFloating()) {
                this.onItemFloatingChange(d, true)
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
                c.setZIndex(d + 200)
            } else {
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
        doItemFloatingChange: function (d, f) {
            var c = d.element,
                b = this.floatingItemCls,
                e = this.container.indexOf(d) + 100;
            if (d.getCentered()) {
                e += 100
            }
            if (f) {
                if (d.getModal() && !d.getCentered()) {
                    this.addModalMask(d);
                    e += 100
                }
                d.setZIndex(e);
                c.addCls(b)
            } else {
                d.setZIndex(null);
                c.removeCls(b)
            }
        },
        addModalMask: function (d) {
            var c = this,
                b = c.container,
                e;
            b.mask();
            if (d.getHideOnMaskTap()) {
                e = function () {
                    b.unmask();
                    d.hide()
                }
            }
            d.on({
                erased: function () {
                    b.unmask();
                    if (e) {
                        b.getMask().un("tap", e, c)
                    }
                },
                painted: function () {
                    b.mask();
                    b.getMask().setZIndex(b.indexOf(d) + 199);
                    if (e) {
                        b.getMask().on("tap", e, c)
                    }
                }
            })
        },
        doItemDockedChange: function (b, d, c) {
            if (c) {
                this.undockItem(b, c)
            }
            if (d) {
                this.dockItem(b, d)
            }
        },
        doActiveItemChange: Ext.emptyFn,
        centerItem: function (b) {
            var c = this.container.indexOf(b) + 200;
            this.insertItem(b, 0);
            b.setZIndex(c);
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
            if (c.getModal()) {
                this.addModalMask(c)
            }
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
        insertItem: function (k, g) {
            var d = this.container,
                j = d.getItems().items,
                e = this.innerItems,
                c = d.innerElement.dom,
                i = k.renderElement.dom,
                h, f, b;
            if (d.has(k)) {
                Ext.Array.remove(e, k)
            }
            if (typeof g == "number") {
                h = j[g];
                if (h === k) {
                    h = j[++g]
                }
                while (h && (h.isCentered() || h.isDocked())) {
                    h = j[++g]
                }
                if (h) {
                    b = e.indexOf(h);
                    if (b !== -1) {
                        while (h && (h.isCentered() || h.isDocked())) {
                            h = e[++b]
                        }
                        if (h) {
                            e.splice(b, 0, k);
                            f = h.renderElement.dom;
                            c.insertBefore(i, f);
                            return this
                        }
                    }
                }
            }
            e.push(k);
            c.appendChild(i);
            return this
        }
    })
})(Ext.baseCSSPrefix);


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
        this.wrappers = {};
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


Ext.define("Ext.fx.layout.card.Abstract", {
    isAnimation: true,
    config: {
        layout: null
    },
    updateLayout: function () {
        this.enable()
    },
    enable: function () {
        var a = this.getLayout();
        if (a) {
            a.on(a.eventNames.activeItemChange, "onActiveItemChange", this)
        }
    },
    disable: function () {
        var a = this.getLayout();
        if (a) {
            a.un(a.eventNames.activeItemChange, "onActiveItemChange", this)
        }
    },
    onActiveItemChange: Ext.emptyFn,
    destroy: function () {
        var a = this.getLayout();
        if (a) {
            this._layout = null;
            a.un(a.eventNames.activeItemChange, "onActiveItemChange", this)
        }
    }
});


Ext.define("Ext.scroll.indicator.Abstract", {
    extend: "Ext.Component",
    config: {
        baseCls: "x-scroll-indicator",
        axis: "x",
        value: 0,
        length: null,
        hidden: true
    },
    cachedConfig: {
        ratio: 1,
        barCls: "x-scroll-bar"
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
    doSetHidden: function (a) {
        var b = this.element.dom.style;
        if (a) {
            b.opacity = "0"
        } else {
            b.opacity = ""
        }
    },
    updateLength: function (b) {
        var a = this.getAxis();
        if (a === "x") {
            this.element.setWidth(b)
        } else {
            this.element.setHeight(b)
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


Ext.define("Ext.scroll.easing.Easing", {
    config: {
        startTime: 0,
        startValue: 0
    },
    isEnded: false,
    constructor: function (a) {
        this.initConfig(a);
        return this
    },
    clone: function () {
        var c = this.config,
            b = {},
            a;
        for (a in c) {
            if (c.hasOwnProperty(a)) {
                b[a] = this[a]
            }
        }
        return new this.self(b)
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


Ext.define("Ext.scroll.easing.Momentum", {
    extend: "Ext.scroll.easing.Easing",
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


Ext.define("Ext.scroll.easing.Bounce", {
    extend: "Ext.scroll.easing.Easing",
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


Ext.define("Ext.scroll.indicator.ScrollPosition", {
    extend: "Ext.scroll.indicator.Abstract",
    config: {
        ui: "scrollposition"
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
        ui: "csstransform"
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
        if (f < 0) {
            g = 0;
            this.updateLength(this.applyLength(d + f * b))
        } else {
            if (f > 1) {
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
    requires: ["Ext.scroll.indicator.ScrollPosition", "Ext.scroll.indicator.CssTransform"],
    alternateClassName: "Ext.util.Indicator",
    constructor: function (a) {
        if (Ext.os.is.Android2) {
            return new Ext.scroll.indicator.ScrollPosition(a)
        } else {
            return new Ext.scroll.indicator.CssTransform(a)
        }
    }
});


Ext.define("Ext.fx.layout.card.Style", {
    extend: "Ext.fx.layout.card.Abstract",
    requires: ["Ext.fx.Animation"],
    config: {
        inAnimation: {
            before: {
                visibility: ""
            },
            preserveEndState: false
        },
        outAnimation: {
            preserveEndState: false
        }
    },
    constructor: function (c) {
        var e = {},
            b, d, a;
        this.initConfig(c);
        d = this.getInAnimation();
        a = this.getOutAnimation();
        for (b in c) {
            if (c.hasOwnProperty(b)) {
                if (!this.hasConfig(b)) {
                    e[b] = c[b]
                }
            }
        }
        d.setConfig(e);
        a.setConfig(e)
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
    onActiveItemChange: function (c, h) {
        var f = this.getInAnimation(),
            b = this.getOutAnimation(),
            g, a, d, e;
        if (c && h) {
            g = c.renderElement;
            a = h.renderElement;
            d = f.getElement();
            f.setElement(g);
            e = b.getElement();
            b.setElement(a);
            b.setOnBeforeEnd(function (j, i) {
                if (!i) {
                    h.hide()
                }
            });
            g.dom.style.visibility = "hidden !important";
            c.show();
            Ext.Animator.run([b, f]);
            return false
        }
    }
});


Ext.define("Ext.fx.layout.card.Slide", {
    extend: "Ext.fx.layout.card.Style",
    alias: "fx.layout.card.slide",
    config: {
        reverse: null,
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
            easing: "ease-out"
        },
        outAnimation: {
            type: "flip",
            half: true,
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


Ext.define("Ext.fx.layout.card.Pop", {
    extend: "Ext.fx.layout.card.Style",
    alias: "fx.layout.card.pop",
    config: {
        duration: 500,
        reverse: null,
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
            type: "cube",
            out: true
        },
        outAnimation: {
            type: "cube"
        }
    }
});


Ext.define("Ext.scroll.easing.Linear", {
    extend: "Ext.scroll.easing.Easing",
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
            b = Math.min(1, (a / this.getDuration()));
        return this.getStartValue() + (b * this.distance)
    }
});


Ext.define("Ext.scroll.easing.EaseOut", {
    extend: "Ext.scroll.easing.Linear",
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
            i = b + (e * a);
        if (f >= d) {
            this.isEnded = true;
            return h
        }
        return i
    }
});


Ext.define("Ext.fx.layout.card.Scroll", {
    extend: "Ext.fx.layout.card.Abstract",
    requires: ["Ext.scroll.easing.EaseOut"],
    alias: "fx.layout.card.scroll",
    config: {
        duration: 500,
        reverse: null
    },
    constructor: function (a) {
        this.initConfig(a);
        this.doAnimationFrame = Ext.Function.bind(this.doAnimationFrame, this)
    },
    getEasing: function () {
        var a = this.easing;
        if (!a) {
            this.easing = a = new Ext.scroll.easing.EaseOut()
        }
        return a
    },
    updateDuration: function (a) {
        this.getEasing().setDuration(a + 100)
    },
    onActiveItemChange: function (c, f) {
        var h, e, a, g, d, b;
        if (c && f) {
            if (this.isAnimating) {
                this.stopAnimation()
            }
            h = this.getLayout().container.innerElement;
            d = h.getWidth();
            g = this.getEasing();
            e = c.renderElement;
            a = f.renderElement;
            this.oldItem = f;
            this.newItem = c;
            this.containerElement = h;
            this.isReverse = b = this.getReverse();
            c.show();
            if (b) {
                g.setConfig({
                    startValue: d,
                    endValue: 0
                });
                h.dom.scrollLeft = d;
                a.setLeft(d)
            } else {
                g.setConfig({
                    startValue: 0,
                    endValue: d
                });
                e.setLeft(d)
            }
            this.startAnimation();
            return false
        }
    },
    startAnimation: function () {
        this.isAnimating = true;
        this.getEasing().setStartTime(Date.now());
        this.timer = setInterval(this.doAnimationFrame, 20);
        this.doAnimationFrame()
    },
    doAnimationFrame: function () {
        var b = this.getEasing(),
            a;
        if (b.isEnded) {
            this.stopAnimation()
        } else {
            a = b.getValue();
            this.containerElement.dom.scrollLeft = a
        }
    },
    stopAnimation: function () {
        this.oldItem.hide();
        if (this.isReverse) {
            this.oldItem.renderElement.setLeft(null)
        } else {
            this.newItem.renderElement.setLeft(null)
        }
        clearInterval(this.timer);
        this.isAnimating = false
    }
});


Ext.define("Ext.fx.layout.Card", {
    requires: ["Ext.fx.layout.card.Slide", "Ext.fx.layout.card.Fade", "Ext.fx.layout.card.Flip", "Ext.fx.layout.card.Pop", "Ext.fx.layout.card.Cube", "Ext.fx.layout.card.Scroll"],
    constructor: function (b) {
        var a = Ext.fx.layout.card.Css,
            c;
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
            if (c === "slide" && Ext.os.is.Android2) {
                c = "scroll"
            }
            a = Ext.ClassManager.getByAlias("fx.layout.card." + c)
        }
        return Ext.factory(b, a)
    }
});


Ext.define("Ext.layout.Card", {
    extend: "Ext.layout.Fit",
    alternateClassName: "Ext.layout.CardLayout",
    requires: ["Ext.fx.layout.Card"],
    alias: "layout.card",
    cls: Ext.baseCSSPrefix + "layout-card",
    itemCls: Ext.baseCSSPrefix + "layout-card-item",
    config: {
        animation: null
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
        this.callParent(arguments);
        if (b.isInnerItem()) {
            b.hide()
        }
    },
    doItemRemove: function (a) {
        this.callParent(arguments);
        if (a.isInnerItem()) {
            a.show()
        }
    },
    onActiveItemChange: function (b, a) {
        this.fireAction(this.eventNames.activeItemChange, [b, a], "doActiveItemChange")
    },
    doActiveItemChange: function (b, a) {
        if (a) {
            a.hide()
        }
        if (b) {
            b.show()
        }
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


Ext.define("Ext.scroll.easing.BoundMomentum", {
    extend: "Ext.scroll.easing.Easing",
    requires: ["Ext.scroll.easing.Momentum", "Ext.scroll.easing.Bounce"],
    config: {
        momentum: null,
        bounce: null,
        minMomentumValue: 0,
        maxMomentumValue: 0,
        minVelocity: 0.01,
        startVelocity: 0
    },
    applyMomentum: function (a, b) {
        return Ext.factory(a, Ext.scroll.easing.Momentum, b)
    },
    applyBounce: function (a, b) {
        return Ext.factory(a, Ext.scroll.easing.Bounce, b)
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
            j = this.getBounce(),
            e = a.getStartVelocity(),
            f = e > 0 ? 1 : -1,
            g = this.getMinMomentumValue(),
            d = this.getMaxMomentumValue(),
            c = (f == 1) ? d : g,
            h = this.lastValue,
            i, b;
        if (e === 0) {
            return this.getStartValue()
        }
        if (!this.isOutOfBound) {
            i = a.getValue();
            b = a.getVelocity();
            if (Math.abs(b) < this.getMinVelocity()) {
                this.isEnded = true
            }
            if (i >= g && i <= d) {
                return i
            }
            this.isOutOfBound = true;
            j.setStartTime(Ext.Date.now()).setStartVelocity(b).setStartValue(c)
        }
        i = j.getValue();
        if (!this.isEnded) {
            if (!this.isBouncingBack) {
                if (h !== null) {
                    if ((f == 1 && i < h) || (f == -1 && i > h)) {
                        this.isBouncingBack = true
                    }
                }
            } else {
                if (Math.round(i) == c) {
                    this.isEnded = true
                }
            }
        }
        this.lastValue = i;
        return i
    }
});


Ext.define("Ext.scroll.scroller.Abstract", {
    requires: ["Ext.scroll.easing.BoundMomentum", "Ext.scroll.easing.EaseOut", "Ext.util.SizeMonitor"],
    mixins: ["Ext.mixin.Observable"],
    config: {
        element: null,
        direction: "auto",
        momentumEasing: {
            momentum: {
                acceleration: 30,
                friction: 0.5
            },
            bounce: {
                acceleration: 30,
                springTension: 0.3
            },
            minVelocity: 0.2
        },
        snapEasing: {
            duration: 400,
            exponent: 4
        },
        outOfBoundRestrictFactor: 0.5,
        startMomentumResetTime: 300,
        fps: 60,
        maxAbsoluteVelocity: 2,
        containerSize: "auto",
        containerScrollSize: "auto",
        size: "auto",
        snap: null,
        snapOffset: {
            x: 0,
            y: 0
        },
        disabled: null,
        autoRefresh: true,
        directionLock: false,
        cls: Ext.baseCSSPrefix + "scroll-scroller",
        containerCls: Ext.baseCSSPrefix + "scroll-container"
    },
    dragStartTime: 0,
    dragEndTime: 0,
    activeEasing: null,
    isDragging: false,
    isAnimating: false,
    constructor: function (a) {
        var b = a && a.element;
        this.doAnimationFrame = Ext.Function.bind(this.doAnimationFrame, this);
        this.listeners = {
            scope: this,
            touchstart: "onTouchStart",
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
        this.activeEasing = {
            x: null,
            y: null
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
            delete a.element;
            this.initElement(b)
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
        a.addCls(this.getCls());
        this.initConfig(this.initialConfig);
        this.onAfterInitialized();
        return this
    },
    onAfterInitialized: function () {
        if (!this.getDisabled()) {
            this.attachListeneners()
        }
        this.onConfigUpdate(["containerSize", "size"], "refreshMaxPosition");
        this.on("maxpositionchange", "snapToBoundary");
        this.on("minpositionchange", "snapToBoundary")
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
    updateFps: function (a) {
        this.animationInterval = 1000 / a
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
        var a = Ext.scroll.easing.BoundMomentum;
        if (!(b instanceof Ext.scroll.easing.Easing)) {
            return {
                x: new a(b),
                y: new a(b)
            }
        }
        return {
            x: b,
            y: b.clone()
        }
    },
    applySnapEasing: function (b) {
        var a = Ext.scroll.easing.EaseOut;
        if (!(b instanceof Ext.scroll.easing.Easing)) {
            return {
                x: new a(b),
                y: new a(b)
            }
        }
        return {
            x: b,
            y: b.clone()
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
    getContainer: function () {
        var a = this.container;
        if (!a) {
            a = this.container = this.getElement().getParent();
            a.addCls(this.getContainerCls())
        }
        return a
    },
    updateAutoRefresh: function (a) {
        var b = Ext.util.SizeMonitor;
        if (a) {
            this.sizeMonitors = {
                element: new b({
                    element: this.getElement(),
                    callback: this.doRefresh,
                    scope: this
                }),
                container: new b({
                    element: this.getContainer(),
                    callback: this.doRefresh,
                    scope: this
                })
            }
        }
    },
    doRefresh: function () {
        this.stopAnimation();
        this.setSize(this.givenSize);
        this.setContainerSize(this.givenContainerSize);
        this.setContainerScrollSize(this.givenContainerScrollSize);
        this.setDirection(this.givenDirection);
        this.fireEvent("refresh")
    },
    refresh: function () {
        var a = this.sizeMonitors;
        if (a) {
            a.element.refresh();
            a.container.refresh()
        }
        this.doRefresh()
    },
    scrollTo: function (b, f) {
        if (typeof b != "number" && arguments.length === 1) {
            f = b.y;
            b = b.x
        }
        var a = this.position,
            c = false,
            e = null,
            d = null;
        if (this.isAxisEnabled("x")) {
            if (typeof b != "number") {
                b = a.x
            } else {
                if (a.x !== b) {
                    a.x = b;
                    c = true
                }
            }
            e = b
        }
        if (this.isAxisEnabled("y")) {
            if (typeof f != "number") {
                f = a.y
            } else {
                if (a.y !== f) {
                    a.y = f;
                    c = true
                }
            }
            d = f
        }
        if (c) {
            this.fireEvent("scroll", this, a.x, a.y);
            this.doScrollTo(e, d)
        }
        return this
    },
    doScrollTo: function (a, c) {
        var b = this.getContainer().dom;
        if (a !== null) {
            b.scrollLeft = a
        }
        if (c !== null) {
            b.scrollTop = c
        }
    },
    onTouchStart: function () {
        this.stopAnimation()
    },
    onDragStart: function (l) {
        var o = this.getDirection(),
            g = l.absDeltaX,
            f = l.absDeltaY,
            j = this.getDirectionLock(),
            i = this.startPosition,
            d = this.flickStartPosition,
            k = this.flickStartTime,
            h = this.lastDragPosition,
            c = this.position,
            b = this.dragDirection,
            n = c.x,
            m = c.y,
            a = Ext.Date.now();
        this.isDragging = true;
        if (j && o !== "both") {
            if ((o === "horizontal" && g > f) || (o === "vertical" && f > g)) {
                l.stopPropagation()
            } else {
                this.isDragging = false;
                return
            }
        }
        this.stopAnimation(true);
        h.x = n;
        h.y = m;
        d.x = n;
        d.y = m;
        i.x = n;
        i.y = m;
        k.x = a;
        k.y = a;
        b.x = 0;
        b.y = 0;
        this.dragStartTime = a;
        this.isDragging = true;
        this.fireEvent("scrollstart", this)
    },
    onAxisDrag: function (i, q) {
        if (!this.isAxisEnabled(i)) {
            return
        }
        var h = this.flickStartPosition,
            l = this.flickStartTime,
            j = this.lastDragPosition,
            e = this.dragDirection,
            g = this.position[i],
            k = this.getMinPosition()[i],
            o = this.getMaxPosition()[i],
            d = this.startPosition[i],
            p = j[i],
            n = d - q,
            c = e[i],
            m = this.getOutOfBoundRestrictFactor(),
            f = this.getStartMomentumResetTime(),
            b = Ext.Date.now(),
            a;
        if (n < k) {
            n *= m
        } else {
            if (n > o) {
                a = n - o;
                n = o + a * m
            }
        }
        if (n > p) {
            e[i] = 1
        } else {
            if (n < p) {
                e[i] = -1
            }
        }
        if ((c !== 0 && (e[i] !== c)) || (b - l[i]) > f) {
            h[i] = g;
            l[i] = b
        }
        j[i] = n
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
        b = this.prepareAnimation("x");
        a = this.prepareAnimation("y");
        if (!(b === false || a === false)) {
            this.isScrolling = true
        }
        this.startAnimation()
    },
    prepareAnimation: function (f) {
        if (!this.isAxisEnabled(f)) {
            return this
        }
        var d = this.position[f],
            e = this.flickStartPosition[f],
            j = this.flickStartTime[f],
            b = this.getMinPosition()[f],
            i = this.getMaxPosition()[f],
            a = this.getMaxAbsoluteVelocity(),
            c = null,
            k, h, g;
        if (d < b) {
            c = b
        } else {
            if (d > i) {
                c = i
            }
        }
        if (c !== null) {
            k = this.getSnapEasing()[f];
            k.setConfig({
                startTime: this.dragEndTime,
                startValue: d,
                endValue: c
            })
        } else {
            g = this.dragEndTime - j;
            if (g === 0) {
                return false
            }
            h = (d - e) / (this.dragEndTime - j);
            if (h === 0) {
                return
            }
            if (h < -a) {
                h = -a
            } else {
                if (h > a) {
                    h = a
                }
            }
            k = this.getMomentumEasing()[f];
            k.setConfig({
                startTime: this.dragEndTime,
                startValue: d,
                startVelocity: h,
                minMomentumValue: 0,
                maxMomentumValue: i
            })
        }
        this.activeEasing[f] = k;
        return this
    },
    prepareSnapAnimation: function (d) {
        if (!this.isAxisEnabled(d)) {
            return false
        }
        var e = this.position[d],
            g = this.getContainerSize()[d],
            c = this.getContainerScrollSize()[d],
            b = this.getSnap(),
            f = this.getSnapOffset()[d],
            h, a;
        a = Math.round((e + f) / b) * b;
        if ((c - g) <= e) {
            return false
        }
        h = this.getSnapEasing()[d];
        h.setConfig({
            startTime: Ext.Date.now(),
            startValue: e,
            endValue: a - f
        });
        this.activeEasing[d] = h;
        return a
    },
    startAnimation: function () {
        this.isAnimating = true;
        this.animationTimer = setInterval(this.doAnimationFrame, this.animationInterval);
        this.doAnimationFrame()
    },
    doAnimationFrame: function () {
        if (!this.isAnimating) {
            return
        }
        var g = this.activeEasing,
            c = g.x,
            b = g.y,
            e = c === null || c.isEnded,
            d = b === null || b.isEnded,
            a = null,
            f = null;
        if (e && d) {
            this.stopAnimation();
            return
        }
        if (!e) {
            a = c.getValue()
        }
        if (!d) {
            f = b.getValue()
        }
        this.scrollTo(a, f)
    },
    stopAnimation: function (b) {
        if (!this.isAnimating) {
            return
        }
        var a = this.activeEasing;
        a.x = null;
        a.y = null;
        this.isAnimating = false;
        clearInterval(this.animationTimer);
        this.snapToBoundary();
        if (!b) {
            if (this.onScrollEnd()) {
                this.fireEvent("scrollend", this, this.position)
            }
        }
        this.isScrolling = false
    },
    scrollToAnimated: function (b, e) {
        var d = this.position,
            c, a;
        c = this.getSnapEasing().x;
        c.setConfig({
            startTime: Ext.Date.now(),
            startValue: d.x,
            endValue: b
        });
        a = this.getSnapEasing().y;
        a.setConfig({
            startTime: Ext.Date.now(),
            startValue: d.y,
            endValue: e
        });
        this.activeEasing.x = c;
        this.activeEasing.y = a;
        this.startAnimation()
    },
    scrollToEnd: function () {
        this.scrollTo(0, this.getSize().y - this.getContainerSize().y)
    },
    scrollToEndAnimated: function () {
        this.scrollToAnimated(0, this.getSize().y - this.getContainerSize().y)
    },
    onScrollEnd: function () {
        if (this.isSnapping) {
            this.isSnapping = false;
            return true
        }
        var a = this.getSnap(),
            c, b;
        if (!a) {
            return true
        }
        c = this.prepareSnapAnimation("x");
        b = this.prepareSnapAnimation("y");
        if ((c || b) && a && a > 0) {
            this.isSnapping = true;
            this.startAnimation();
            return false
        }
        return true
    },
    snapValueForAxis: function (c, b) {
        var a = this.getSnap(),
            d = this.getSnapOffset()[b];
        c = Math.round((c + d) / a) * a;
        return c
    },
    snapToBoundary: function () {
        var g = this.position,
            c = this.getMinPosition(),
            f = this.getMaxPosition(),
            e = c.x,
            d = c.y,
            b = f.x,
            a = f.y,
            i = g.x,
            h = g.y;
        if (i < e) {
            i = e
        } else {
            if (i > b) {
                i = b
            }
        }
        if (h < d) {
            h = d
        } else {
            if (h > a) {
                h = a
            }
        }
        this.scrollTo(i, h)
    },
    destroy: function () {
        var b = this.getElement(),
            a = this.sizeMonitors;
        if (a) {
            a.element.destroy();
            a.container.destroy()
        }
        if (b) {
            b.removeCls(this.getCls());
            this.getContainer().removeCls(this.getContainerCls())
        }
        this.callParent(arguments)
    }
}, function () {
    this.override({
        constructor: function (a) {
            var c, e, b, d;
            if (a.hasOwnProperty("acceleration")) {
                c = a.acceleration;
                delete a.acceleration;
                Ext.merge(a, {
                    momentumEasing: {
                        momentum: {
                            acceleration: c
                        },
                        bounce: {
                            acceleration: c
                        }
                    }
                })
            }
            if (a.hasOwnProperty("friction")) {
                e = a.friction;
                delete a.friction;
                Ext.merge(a, {
                    momentumEasing: {
                        momentum: {
                            friction: e
                        }
                    }
                })
            }
            if (a.hasOwnProperty("springTension")) {
                b = a.springTension;
                delete a.springTension;
                Ext.merge(a, {
                    momentumEasing: {
                        momentum: {
                            springTension: b
                        }
                    }
                })
            }
            if (a.hasOwnProperty("minVelocityForAnimation")) {
                d = a.minVelocityForAnimation;
                delete a.minVelocityForAnimation;
                Ext.merge(a, {
                    momentumEasing: {
                        minVelocity: d
                    }
                })
            }
            this.callOverridden(arguments)
        },
        updateBoundary: function () {
            return this.refresh()
        },
        scrollBy: function (b) {
            var a = this.position;
            return this.scrollTo(a.x + b.x, a.y + b.y)
        },
        setOffset: function (a) {
            return this.scrollTo(-a.x, -a.y)
        },
        snapToSlot: function () {}
    })
});


Ext.define("Ext.scroll.scroller.CssPosition", {
    extend: "Ext.scroll.scroller.Abstract",
    doScrollTo: function (a, c) {
        var b = this.getElement().dom.style;
        if (a !== null) {
            b.left = (-a) + "px"
        }
        if (c !== null) {
            b.top = (-c) + "px"
        }
    }
});


Ext.define("Ext.scroll.scroller.ScrollPosition", {
    extend: "Ext.scroll.scroller.CssPosition",
    config: {
        stretcherCls: "x-scroll-stretcher"
    },
    constructor: function () {
        this.stretchSize = {
            x: 0,
            y: 0
        };
        return this.callParent(arguments)
    },
    getStretcher: function () {
        var b = this.stretcher,
            a;
        if (!b) {
            a = this.getElement();
            if (a) {
                b = this.stretcher = Ext.Element.create({
                    className: this.getStretcherCls()
                });
                b.insertBefore(a)
            }
        }
        return b
    },
    stretch: function (a, e) {
        var c = this.stretchSize,
            d = this.getStretcher(),
            b = this.getElement();
        c.x = a;
        c.y = e;
        d.setWidth(a * 3);
        d.setHeight(e * 3);
        b.setLeft(a);
        b.setTop(e);
        return this
    },
    shrink: function () {
        var b = this.getStretcher(),
            a = this.getElement();
        b.setWidth(0);
        b.setHeight(0);
        a.setLeft(0);
        a.setTop(0)
    },
    doScrollTo: function (a, d) {
        var c = this.getContainer().dom,
            b = this.stretchSize;
        if (a !== null) {
            c.scrollLeft = a + b.x
        }
        if (d !== null) {
            c.scrollTop = d + b.y
        }
    },
    determinePosition: function () {
        var b = this.getContainer().dom,
            a = this.stretchSize;
        return {
            x: b.scrollLeft - a.x,
            y: b.scrollTop - a.y
        }
    },
    onTouchStart: function () {
        var a = this.determinePosition();
        this.scrollTo(a.x, a.y);
        this.callParent(arguments)
    },
    onAfterInitialized: function () {
        this.callParent(arguments);
        this.refreshStretch()
    },
    refresh: function () {
        this.callParent(arguments);
        this.refreshStretch()
    },
    refreshStretch: function () {
        var a = this.position,
            b, d, e, c;
        this.shrink();
        b = this.getSize();
        d = this.getContainerSize();
        e = Math.max(b.x, d.x);
        c = Math.max(b.y, d.y);
        this.stretch(e, c);
        this.doScrollTo(a.x, a.y)
    },
    destroy: function () {
        var a = this.getElement();
        if (a) {
            this.getStretcher().destroy();
            a.setLeft(null);
            a.setTop(null)
        }
        this.callParent(arguments)
    }
});


Ext.define("Ext.scroll.scroller.CssTransform", {
    extend: "Ext.scroll.scroller.Abstract",
    doScrollTo: function (b, d) {
        var c = this.getElement().dom,
            a = this.position;
        if (b === null) {
            b = a.x
        }
        b = -b;
        if (d === null) {
            d = a.y
        }
        d = -d;
        c.style.webkitTransform = "translate3d(" + b + "px, " + d + "px, 0px)"
    }
});


Ext.define("Ext.scroll.Scroller", {
    alternateClassName: "Ext.util.Scroller",
    requires: ["Ext.scroll.scroller.ScrollPosition", "Ext.scroll.scroller.CssPosition", "Ext.scroll.scroller.CssTransform"],
    defaultConfig: {
        fps: "auto",
        scrollMethod: "auto"
    },
    constructor: function (c) {
        var e = Ext.scroll.scroller,
            k = e.ScrollPosition,
            j = e.CssTransform,
            i = e.CssPosition,
            d = k,
            h = Ext.os.name,
            g = Ext.os.version,
            l = Ext.browser.userAgent,
            a, b, f;
        if (arguments.length == 2) {
            f = c;
            c = arguments[1];
            if (!c) {
                c = {}
            }
            c.element = f
        }
        if (typeof c == "string") {
            c = {
                direction: c
            }
        }
        c = Ext.merge({}, this.defaultConfig, c || {});
        if (c.fps === "auto") {
            if (/(htc|desire|incredible|adr6300)/i.test(l) && g.lt("2.3")) {
                b = 30
            } else {
                if (Ext.os.is.Android && !/(droid2)/i.test(l)) {
                    b = 50
                } else {
                    b = 60
                }
            }
            c.fps = b
        }
        a = c.scrollMethod.toLowerCase();
        switch (a) {
        case "csstransform":
            d = j;
            break;
        case "cssposition":
            d = i;
            break;
        case "scrollposition":
            d = k;
            break;
        case "auto":
            if (/^(iOS|RIMTablet|MacOS|Windows)$/.test(h) || Ext.os.is.BlackBerry) {
                d = j
            }
            break;
        default:
        }
        return new d(c)
    }
});


Ext.define("Ext.scroll.View", {
    extend: "Ext.EventedBase",
    alternateClassName: "Ext.util.ScrollView",
    requires: ["Ext.scroll.Scroller", "Ext.scroll.Indicator"],
    config: {
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
        cls: Ext.baseCSSPrefix + "scroll-view",
        flashIndicatorTimeout: 1000
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
        this.indicatorLength = {
            x: 0,
            y: 0
        };
        this.indicatorMaxLength = {
            x: 0,
            y: 0
        };
        this.indicatorMaxOffset = {
            x: 0,
            y: 0
        };
        this.useIndicators = {
            x: true,
            y: true
        };
        this.initConfig(a)
    },
    setConfig: function (a) {
        return this.callParent([this.processConfig(a)])
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
    getSize: function () {
        var a = this.getElement().dom;
        return {
            x: a.offsetWidth,
            y: a.offsetHeight
        }
    },
    showIndicator: function (a) {
        if (this.isAxisEnabled(a)) {
            this.getIndicators()[a].show()
        }
    },
    hideIndicator: function (a) {
        if (this.isAxisEnabled(a)) {
            this.getIndicators()[a].hide()
        }
    },
    onScrollStart: function () {
        this.showIndicator("x");
        this.showIndicator("y")
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
            e, d;
        if (c === 0) {
            e = a.getContainerSize()[b];
            if (f < 0) {
                d = f / e
            } else {
                d = 1 + (f / e)
            }
        } else {
            d = f / c
        }
        this.getIndicators()[b].setValue(d)
    },
    onScrollEnd: function () {
        this.hideIndicator("x");
        this.hideIndicator("y")
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
        this.refreshIndicator("x");
        this.refreshIndicator("y")
    },
    flashIndicators: function () {
        this.flashIndicator("x");
        this.flashIndicator("y")
    },
    flashIndicator: function (b) {
        var c = this,
            a = this.getIndicators()[b];
        if (!c.isAxisEnabled(b)) {
            return c
        }
        if (a.getRatio() == 1) {
            return c
        }
        c.showIndicator(b);
        setTimeout(function () {
            c.hideIndicator(b)
        }, c.getFlashIndicatorTimeout())
    },
    destroy: function () {
        var a = this.getElement(),
            b = this.getIndicators();
        if (a) {
            a.removeCls(this.getCls())
        }
        b.x.destroy();
        b.y.destroy();
        this.getScroller().destroy();
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
        var a = this.component;
        this.scrollerElement.unwrap();
        this.scrollContainer.destroy();
        a.un(this.listeners);
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
    requires: ["Ext.layout.Layout", "Ext.ItemCollection", "Ext.behavior.Scrollable", "Ext.Mask", "Ext.LoadMask"],
    xtype: "container",
    eventedConfig: {
        activeItem: 0
    },
    config: {
        layout: null,
        defaults: null,
        items: null,
        autoDestroy: true,
        defaultType: null,
        scrollable: null,
        useBodyElement: null,
        mask: null
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
        b.$onItemAdd = b.onItemAdd;
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
    applyMask: function (a) {
        var b = {};
        if (Ext.isObject(a)) {
            b = a
        }
        Ext.applyIf(b, {
            hidden: !Boolean(a)
        });
        if (b.message && !b.xtype) {
            b.xtype = "loadmask"
        }
        return Ext.factory(b, Ext.Mask, this.getMask())
    },
    updateMask: function (b, a) {
        if (a) {
            this.remove(a)
        }
        if (b) {
            this.add(b)
        }
    },
    mask: function () {
        this.setMask(true)
    },
    unmask: function () {
        this.setMask(false)
    },
    updateBaseCls: function (a, b) {
        var c = this,
            d = c.getUi();
        if (a) {
            this.addCls(a);
            this.innerElement.addCls(a, null, "inner");
            if (d) {
                this.addCls(a, null, d)
            }
        }
        if (b) {
            this.removeCls(b);
            this.innerElement.removeCls(a, null, "inner");
            if (d) {
                this.removeCls(b, null, d)
            }
        }
    },
    updateUseBodyElement: function (a) {
        if (a) {
            this.bodyElement = this.innerElement.wrap({
                cls: "x-body"
            })
        }
    },
    applyItems: function (a, b) {
        if (a) {
            this.getDefaultType();
            this.getDefaults();
            if (!this.isItemsInitializing && b.length > 0) {
                this.removeAll()
            }
            this.add(a)
        }
    },
    onFirstItemAdd: function () {
        var a = this.onItemAdd = this.$onItemAdd;
        delete this.$onItemAdd;
        this.setLayout(new Ext.layout.Layout(this, this.getLayout() || "default"));
        if (this.innerHtmlElement && !this.getHtml()) {
            this.innerHtmlElement.destroy();
            delete this.innerHtmlElement
        }
        this.on(this.delegateListeners);
        return a.apply(this, arguments)
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
            b, d, c;
        a = Ext.Array.from(a);
        d = a.length;
        for (b = 0; b < d; b++) {
            c = e.factoryItem(a[b]);
            this.doAdd(c)
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
    remove: function (e, c) {
        var d = this,
            a = d.items,
            b = d.indexOf(e);
        if (c === undefined) {
            c = d.getAutoDestroy()
        }
        if (b !== -1) {
            e.setParent(null);
            a.remove(e);
            if (e.isInnerItem()) {
                d.removeInner(e)
            }
            d.onItemRemove(e, b);
            if (c) {
                e.destroy()
            }
        }
        return d
    },
    removeAll: function (b) {
        var d = this,
            a = d.items,
            c;
        if (b === undefined) {
            b = d.getAutoDestroy()
        }
        d.innerItems.length = 0;
        while (a.length > 0) {
            c = a.getAt(0);
            a.removeAt(0);
            d.onItemRemove(c, 0);
            c.setParent(null);
            if (b) {
                c.destroy()
            }
        }
        return d
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
        var c = this,
            a = c.getItems().items,
            f = c.innerItems,
            e;
        if (typeof b == "number") {
            do {
                e = a[++b]
            } while (e && !e.isInnerItem());
            if (!e) {
                f.push(d)
            } else {
                f.splice(f.indexOf(e), 0, d)
            }
        } else {
            f.push(d)
        }
        return c
    },
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
            b.removeAt(a);
            if (g) {
                e.removeInner(f)
            }
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
        this.getLayout().onItemAdd(b, a);
        if (this.initialized && b.isInnerItem() && !this.getActiveItem()) {
            this.setActiveItem(b)
        }
        if (this.initialized) {
            this.fireEvent("add", this, b, a)
        }
        if (this.isRendered() && b.setRendered(true)) {
            b.fireEvent("renderedchange", b, true)
        }
    },
    onItemRemove: function (b, a) {
        this.getLayout().onItemRemove(b, a);
        if (b === this.getActiveItem()) {
            this.setActiveItem(0)
        }
        this.fireEvent("remove", this, b, a);
        if (this.isRendered() && b.setRendered(false)) {
            b.fireEvent("renderedchange", b, false)
        }
    },
    onItemMove: function (b, c, a) {
        if (b.isDocked()) {
            b.setDocked(null)
        }
        this.getLayout().onItemMove(b, c, a);
        this.fireEvent("move", this, b, c, a)
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
    applyActiveItem: function (a) {
        var b = this.getInnerItems();
        this.getItems();
        if (typeof a == "number") {
            a = Math.max(0, Math.min(a, b.length - 1));
            return b[a] || null
        } else {
            if (a) {
                if (!a.isComponent) {
                    a = this.factoryItem(a)
                }
                return a
            }
        }
    },
    doSetActiveItem: function (b, a) {
        if (a) {
            a.fireEvent("deactivate", a)
        }
        if (b) {
            if (!this.has(b)) {
                this.add(b)
            }
            b.fireEvent("activate", b);
            this.getLayout().onActiveItemChange(b, a)
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
        this.removeAll(true);
        this.callParent(arguments)
    },
    onClassExtended: function (b, a) {
        if ("onAdd" in a || "onRemove" in a) {
            throw new Error("[" + b.$className + "] 'onAdd()' and 'onRemove()' methods no longer exist in Ext.Container, please use 'onItemAdd()' and 'onItemRemove()' instead }")
        }
    }
}, function () {
    this.addMember("defaultItemClass", this);
    Ext.deprecateClassMethod(this, "addAll", "add");
    Ext.deprecateClassMethod(this, "removeDocked", "remove");
    this.override({
        constructor: function (a) {
            a = a || {};
            var c = a.dockedItems,
                b, e, d;
            if (a.scroll) {
                a.scrollable = a.scroll;
                delete a.scroll
            }
            this.callParent(arguments);
            if (c) {
                c = Ext.Array.from(c);
                for (b = 0, e = c.length; b < e; b++) {
                    d = c[b];
                    if ("dock" in d) {
                        d.docked = d.dock
                    }
                }
                this.add(c)
            }
        },
        add: function () {
            var a = arguments;
            if (a.length > 1) {
                if (typeof a[0] == "number") {
                    return this.insert(a[0], a[1])
                }
                a = [Array.prototype.slice.call(a)]
            }
            return this.callParent(a)
        },
        applyDefaults: function (a) {
            if (typeof a == "function") {}
            return this.callParent(arguments)
        },
        factoryItemWithDefaults: function (b) {
            var d = this.getDefaults(),
                c, a;
            if (typeof d == "function") {
                c = d.call(this, b)
            }
            if (typeof b == "string") {
                b = Ext.getCmp(b)
            }
            if (c) {
                this._defaults = c
            }
            a = this.callParent([b]);
            if (c) {
                this._defaults = d
            }
            return a
        }
    })
});


Ext.define("Ext.viewport.Default", {
    extend: "Ext.Container",
    xtype: "viewport",
    PORTRAIT: "portrait",
    LANDSCAPE: "landscape",
    config: {
        autoMaximize: Ext.browser.is.WebView ? false : true,
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
    isInputRegex: /^(input|textarea|select)$/i,
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
        this.fireEvent("ready")
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
                g = [],
                d = Ext.os,
                f = d.name.toLowerCase(),
                e = d.version.getMajor(),
                c = this.getOrientation();
            this.renderTo(a);
            g.push(b + d.deviceType.toLowerCase());
            if (d.is.iPad) {
                g.push(b + "ipad")
            }
            g.push(b + f);
            if (e) {
                g.push(b + f + "-" + e)
            }
            if (d.is.BlackBerry) {
                g.push(b + "bb")
            }
            if (Ext.browser.is.Standalone) {
                g.push(b + "standalone")
            }
            g.push(b + c);
            a.addCls(g)
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
        if (a) {
            this.addWindowListener("touchstart", this.doPreventZooming, false)
        } else {
            this.removeWindowListener("touchstart", this.doPreventZooming, false)
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
            this.fireEvent("ready")
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
        var a = b.target;
        if (a && a.nodeType === 1 && !this.isInputRegex.test(a.tagName)) {
            b.preventDefault()
        }
    },
    addWindowListener: function (b, c, a) {
        window.addEventListener(b, c, a)
    },
    removeWindowListener: function (b, c, a) {
        window.removeEventListener(b, c, a)
    },
    doAddListener: function (a, d, c, b) {
        if (a === "ready" && this.isReady && !this.isMaximizing) {
            d.call(c);
            return this
        }
        this.mixins.observable.doAddListener.apply(this, arguments)
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
        this.fireEvent("resize", b, a)
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
        this.fireEvent("orientationchange", b, this.windowWidth, this.windowHeight)
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
        this.fireEvent("maximize")
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
    },
    keyboardHideField: null,
    hideKeyboard: function () {
        var a = this;
        if (Ext.os.is.iOS) {
            document.activeElement.blur();
            setTimeout(function () {
                Ext.Viewport.scrollToTop()
            }, 50)
        } else {
            if (!a.keyboardHideField) {
                a.keyboardHideField = document.createElement("input");
                a.keyboardHideField.setAttribute("type", "text");
                a.keyboardHideField.setAttribute("style", "position:absolute;top:-1000px");
                document.body.appendChild(a.keyboardHideField)
            }
            setTimeout(function () {
                a.keyboardHideField.focus();
                setTimeout(function () {
                    a.keyboardHideField.setAttribute("style", "display:none;")
                }, 50)
            }, 50)
        }
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
        this.addWindowListener("touchstart", Ext.Function.bind(this.onTouchStart, this))
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
        clearTimeout(this.scrollToTopTimer);
        this.callParent(arguments)
    },
    onElementBlur: function () {
        this.scrollToTopTimer = setTimeout(this.scrollToTop, 500);
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
        return this.callParent(arguments)
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


Ext.define("Ext.data.Batch", {
    mixins: {
        observable: "Ext.util.Observable"
    },
    autoStart: false,
    current: -1,
    total: 0,
    isRunning: false,
    isComplete: false,
    hasException: false,
    pauseOnException: true,
    constructor: function (a) {
        var b = this;
        b.mixins.observable.constructor.call(b, a);
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
                if (g && e.pauseOnException) {
                    e.pause()
                } else {
                    f.setCompleted();
                    e.runNextOperation()
                }
            };
            b.setStarted();
            e.proxy[b.action](b, a, e)
        }
    }
});


Ext.define("Ext.data.Request", {
    action: undefined,
    params: undefined,
    method: "GET",
    url: undefined,
    constructor: function (a) {
        Ext.apply(this, a)
    }
});


Ext.define("Ext.data.AbstractStore", {
    requires: ["Ext.util.MixedCollection", "Ext.data.Operation", "Ext.util.Filter"],
    mixins: {
        observable: "Ext.util.Observable",
        sortable: "Ext.util.Sortable"
    },
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
    remoteSort: false,
    remoteFilter: false,
    autoLoad: false,
    autoSync: false,
    batchUpdateMode: "operation",
    filterOnLoad: true,
    sortOnLoad: true,
    implicitModel: false,
    defaultProxyType: "memory",
    isDestroyed: false,
    isStore: true,
    sortRoot: "data",
    constructor: function (a) {
        var c = this,
            b;
        Ext.apply(c, a);
        c.removed = [];
        c.mixins.observable.constructor.apply(c, arguments);
        c.model = Ext.ModelManager.getModel(c.model);
        Ext.applyIf(c, {
            modelDefaults: {}
        });
        if (!c.model && c.fields) {
            c.model = 

Ext.define("Ext.data.Store.ImplicitModel-" + (c.storeId || Ext.id()), {
                extend: "Ext.data.Model",
                fields: c.fields,
                proxy: c.proxy || c.defaultProxyType
            });
            delete c.fields;
            c.implicitModel = true
        }
        c.setProxy(c.proxy || c.model.getProxy());
        c.proxy.on("metachange", c.onMetaChange, c);
        if (c.id && !c.storeId) {
            c.storeId = c.id;
            delete c.id
        }
        if (c.storeId) {
            Ext.data.StoreManager.register(c)
        }
        c.mixins.sortable.initSortable.call(c);
        b = c.decodeFilters(c.filters);
        c.filters = Ext.create("Ext.util.MixedCollection");
        c.filters.addAll(b)
    },
    setProxy: function (a) {
        var b = this;
        if (a instanceof Ext.data.proxy.Proxy) {
            a.setModel(b.model)
        } else {
            if (Ext.isString(a)) {
                a = {
                    type: a
                }
            }
            Ext.applyIf(a, {
                model: b.model
            });
            a = Ext.createByAlias("proxy." + a.type, a)
        }
        b.proxy = a;
        return b.proxy
    },
    getProxy: function () {
        return this.proxy
    },
    onMetaChange: function (a, b) {
        this.fireEvent("metachange", this, b)
    },
    create: function (e, c) {
        var d = this,
            a = Ext.ModelManager.create(Ext.applyIf(e, d.modelDefaults), d.model.modelName),
            b;
        c = c || {};
        Ext.applyIf(c, {
            action: "create",
            records: [a]
        });
        b = Ext.create("Ext.data.Operation", c);
        d.proxy.create(b, d.onProxyWrite, d);
        return a
    },
    read: function () {
        return this.load.apply(this, arguments)
    },
    onProxyRead: Ext.emptyFn,
    update: function (b) {
        var c = this,
            a;
        b = b || {};
        Ext.applyIf(b, {
            action: "update",
            records: c.getUpdatedRecords()
        });
        a = Ext.create("Ext.data.Operation", b);
        return c.proxy.update(a, c.onProxyWrite, c)
    },
    onProxyWrite: function (b) {
        var c = this,
            d = b.wasSuccessful(),
            a = b.getRecords();
        switch (b.action) {
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
            c.fireEvent("write", c, b);
            c.fireEvent("datachanged", c)
        }
        Ext.callback(b.callback, b.scope || c, [a, b, d])
    },
    destroy: function (b) {
        var c = this,
            a;
        b = b || {};
        Ext.applyIf(b, {
            action: "destroy",
            records: c.getRemovedRecords()
        });
        a = Ext.create("Ext.data.Operation", b);
        return c.proxy.destroy(a, c.onProxyWrite, c)
    },
    onBatchOperationComplete: function (b, a) {
        return this.onProxyWrite(a)
    },
    onBatchComplete: function (c, a) {
        var f = this,
            b = c.operations,
            e = b.length,
            d;
        f.suspendEvents();
        for (d = 0; d < e; d++) {
            f.onProxyWrite(b[d])
        }
        f.resumeEvents();
        f.fireEvent("datachanged", f)
    },
    onBatchException: function (b, a) {},
    filterNew: function (a) {
        return a.phantom === true && a.isValid()
    },
    getNewRecords: function () {
        return []
    },
    getUpdatedRecords: function () {
        return []
    },
    filterUpdated: function (a) {
        return a.dirty === true && a.phantom !== true && a.isValid()
    },
    getRemovedRecords: function () {
        return this.removed
    },
    filter: function (a, b) {},
    decodeFilters: function (e) {
        if (!Ext.isArray(e)) {
            if (e === undefined) {
                e = []
            } else {
                e = [e]
            }
        }
        var d = e.length,
            a = Ext.util.Filter,
            b, c;
        for (c = 0; c < d; c++) {
            b = e[c];
            if (!(b instanceof a)) {
                Ext.apply(b, {
                    root: "data"
                });
                if (b.fn) {
                    b.filterFn = b.fn
                }
                if (typeof b == "function") {
                    b = {
                        filterFn: b
                    }
                }
                e[c] = new a(b)
            }
        }
        return e
    },
    clearFilter: function (a) {},
    isFiltered: function () {},
    filterBy: function (b, a) {},
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
        if (f && d.fireEvent("beforesync", b) !== false) {
            d.proxy.batch(b, d.getBatchListeners())
        }
        return {
            added: e,
            updated: c,
            removed: a
        }
    },
    getBatchListeners: function () {
        var b = this,
            a = {
                scope: b,
                exception: b.onBatchException
            };
        if (b.batchUpdateMode == "operation") {
            a.operationcomplete = b.onBatchOperationComplete
        } else {
            a.complete = b.onBatchComplete
        }
        return a
    },
    save: function () {
        return this.sync.apply(this, arguments)
    },
    load: function (b) {
        var c = this,
            a;
        b = b || {};
        Ext.applyIf(b, {
            action: "read",
            filters: c.filters.items,
            sorters: c.getSorters()
        });
        a = Ext.create("Ext.data.Operation", b);
        if (c.fireEvent("beforeload", c, a) !== false) {
            c.loading = true;
            c.proxy.read(a, c.onProxyLoad, c)
        }
        return c
    },
    afterEdit: function (a, c) {
        var b = this;
        if (b.autoSync) {
            b.sync()
        }
        b.fireEvent("update", b, a, Ext.data.Model.EDIT, c)
    },
    afterReject: function (a) {
        this.fireEvent("update", this, a, Ext.data.Model.REJECT, null)
    },
    afterCommit: function (a) {
        this.fireEvent("update", this, a, Ext.data.Model.COMMIT, null)
    },
    clearData: Ext.emptyFn,
    destroyStore: function () {
        var a = this;
        if (!a.isDestroyed) {
            if (a.storeId) {
                Ext.data.StoreManager.unregister(a)
            }
            a.clearData();
            a.data = null;
            a.tree = null;
            a.reader = a.writer = null;
            a.clearListeners();
            a.isDestroyed = true;
            if (a.implicitModel) {
                Ext.destroy(a.model)
            }
        }
    },
    doSort: function (a) {
        var b = this;
        if (b.remoteSort) {
            b.load()
        } else {
            b.data.sortBy(a);
            b.fireEvent("datachanged", b)
        }
    },
    getCount: Ext.emptyFn,
    getById: Ext.emptyFn,
    removeAll: Ext.emptyFn,
    isLoading: function () {
        return this.loading
    }
});


Ext.define("Ext.util.Grouper", {
    extend: "Ext.util.Sorter",
    getGroupString: function (a) {
        return a.get(this.property)
    }
});


Ext.define("Ext.data.proxy.Client", {
    extend: "Ext.data.proxy.Proxy",
    alternateClassName: "Ext.data.ClientProxy",
    clear: function () {}
});


Ext.define("Ext.data.proxy.Memory", {
    extend: "Ext.data.proxy.Client",
    alias: "proxy.memory",
    alternateClassName: "Ext.data.MemoryProxy",
    constructor: function (a) {
        this.callParent([a]);
        this.setReader(this.reader)
    },
    read: function (c, f, d) {
        var e = this,
            b = e.getReader(),
            a = b.read(e.data);
        Ext.apply(c, {
            resultSet: a
        });
        c.setCompleted();
        c.setSuccessful();
        Ext.callback(f, d || e, [c])
    },
    clear: Ext.emptyFn
});


Ext.define("Ext.data.Store", {
    extend: "Ext.data.AbstractStore",
    alias: "store.store",
    requires: ["Ext.data.StoreManager", "Ext.ModelManager", "Ext.data.Model", "Ext.util.Grouper", "Ext.data.proxy.Memory"],
    remoteSort: false,
    remoteFilter: false,
    remoteGroup: false,
    groupField: undefined,
    groupDir: "ASC",
    pageSize: 25,
    currentPage: 1,
    clearOnPageLoad: true,
    loading: false,
    sortOnFilter: true,
    buffered: false,
    purgePageCount: 5,
    isStore: true,
    onClassExtended: function (b, d, a) {
        var c = d.model;
        if (typeof c == "string") {
            var e = a.onBeforeCreated;
            a.onBeforeCreated = function () {
                var g = this,
                    f = arguments;
                Ext.require(c, function () {
                    e.apply(g, f)
                })
            }
        }
    },
    constructor: function (b) {
        b = b || {};
        var d = this,
            f = b.groupers || d.groupers,
            a = b.groupField || d.groupField,
            c, e;
        if (b.buffered || d.buffered) {
            d.prefetchData = Ext.create("Ext.util.MixedCollection", false, function (g) {
                return g.index
            });
            d.pendingRequests = [];
            d.pagesRequested = [];
            d.sortOnLoad = false;
            d.filterOnLoad = false
        }
        e = b.data || d.data;
        d.data = Ext.create("Ext.util.MixedCollection", false, function (g) {
            return g.internalId
        });
        if (e) {
            d.inlineData = e;
            delete b.data
        }
        if (!f && a) {
            f = [{
                property: a,
                direction: b.groupDir || d.groupDir
            }]
        }
        delete b.groupers;
        d.groupers = Ext.create("Ext.util.MixedCollection");
        d.groupers.addAll(d.decodeGroupers(f));
        this.callParent([b]);
        if (d.groupers.items.length) {
            d.sort(d.groupers.items, "prepend", false)
        }
        c = d.proxy;
        e = d.inlineData;
        if (e) {
            if (c instanceof Ext.data.proxy.Memory) {
                c.data = e;
                d.read()
            } else {
                d.add.apply(d, e)
            }
            d.sort();
            delete d.inlineData
        } else {
            if (d.autoLoad) {
                Ext.defer(d.load, 10, d, [typeof d.autoLoad === "object" ? d.autoLoad : undefined])
            }
        }
    },
    onBeforeSort: function () {
        var a = this.groupers;
        if (a.getCount() > 0) {
            this.sort(a.items, "prepend", false)
        }
    },
    decodeGroupers: function (d) {
        if (!Ext.isArray(d)) {
            if (d === undefined) {
                d = []
            } else {
                d = [d]
            }
        }
        var c = d.length,
            e = Ext.util.Grouper,
            a, b;
        for (b = 0; b < c; b++) {
            a = d[b];
            if (!(a instanceof e)) {
                if (Ext.isString(a)) {
                    a = {
                        property: a
                    }
                }
                Ext.applyIf(a, {
                    root: "data",
                    direction: "ASC"
                });
                if (a.fn) {
                    a.sorterFn = a.fn
                }
                if (typeof a == "function") {
                    a = {
                        sorterFn: a
                    }
                }
                d[b] = new e(a)
            }
        }
        return d
    },
    group: function (e, f) {
        var d = this,
            c = false,
            b, a;
        if (Ext.isArray(e)) {
            a = e
        } else {
            if (Ext.isObject(e)) {
                a = [e]
            } else {
                if (Ext.isString(e)) {
                    b = d.groupers.get(e);
                    if (!b) {
                        b = {
                            property: e,
                            direction: f
                        };
                        a = [b]
                    } else {
                        if (f === undefined) {
                            b.toggle()
                        } else {
                            b.setDirection(f)
                        }
                    }
                }
            }
        }
        if (a && a.length) {
            c = true;
            a = d.decodeGroupers(a);
            d.groupers.clear();
            d.groupers.addAll(a)
        }
        if (d.remoteGroup) {
            d.load({
                scope: d,
                callback: d.fireGroupChange
            })
        } else {
            d.sort(null, null, null, c);
            d.fireGroupChange()
        }
    },
    clearGrouping: function () {
        var a = this;
        a.groupers.each(function (b) {
            a.sorters.remove(b)
        });
        a.groupers.clear();
        if (a.remoteGroup) {
            a.load({
                scope: a,
                callback: a.fireGroupChange
            })
        } else {
            a.sort();
            a.fireEvent("groupchange", a, a.groupers)
        }
    },
    isGrouped: function () {
        return this.groupers.getCount() > 0
    },
    fireGroupChange: function () {
        this.fireEvent("groupchange", this, this.groupers)
    },
    getGroups: function (b) {
        var d = this.data.items,
            a = d.length,
            c = [],
            j = {},
            f, g, h, e;
        for (e = 0; e < a; e++) {
            f = d[e];
            g = this.getGroupString(f);
            h = j[g];
            if (h === undefined) {
                h = {
                    name: g,
                    children: []
                };
                c.push(h);
                j[g] = h
            }
            h.children.push(f)
        }
        return b ? j[b] : c
    },
    getGroupsForGrouper: function (f, b) {
        var d = f.length,
            e = [],
            a, c, h, j, g;
        for (g = 0; g < d; g++) {
            h = f[g];
            c = b.getGroupString(h);
            if (c !== a) {
                j = {
                    name: c,
                    grouper: b,
                    records: []
                };
                e.push(j)
            }
            j.records.push(h);
            a = c
        }
        return e
    },
    getGroupsForGrouperIndex: function (c, h) {
        var f = this,
            g = f.groupers,
            b = g.getAt(h),
            a = f.getGroupsForGrouper(c, b),
            e = a.length,
            d;
        if (h + 1 < g.length) {
            for (d = 0; d < e; d++) {
                a[d].children = f.getGroupsForGrouperIndex(a[d].records, h + 1)
            }
        }
        for (d = 0; d < e; d++) {
            a[d].depth = h
        }
        return a
    },
    getGroupData: function (a) {
        var b = this;
        if (a !== false) {
            b.sort()
        }
        return b.getGroupsForGrouperIndex(b.data.items, 0)
    },
    getGroupString: function (a) {
        var b = this.groupers.first();
        if (b) {
            return a.get(b.property)
        }
        return ""
    },
    insert: function (d, c) {
        var g = this,
            f = false,
            e, b, a;
        c = [].concat(c);
        for (e = 0, a = c.length; e < a; e++) {
            b = g.createModel(c[e]);
            b.set(g.modelDefaults);
            c[e] = b;
            g.data.insert(d + e, b);
            b.join(g);
            f = f || b.phantom === true
        }
        if (g.snapshot) {
            g.snapshot.addAll(c)
        }
        g.fireEvent("add", g, c, d);
        g.fireEvent("datachanged", g);
        if (g.autoSync && f) {
            g.sync()
        }
    },
    add: function (b) {
        if (!Ext.isArray(b)) {
            b = Array.prototype.slice.apply(arguments)
        }
        var e = this,
            c = 0,
            d = b.length,
            a;
        for (; c < d; c++) {
            a = e.createModel(b[c]);
            b[c] = a
        }
        e.insert(e.data.length, b);
        return b
    },
    sync: function () {
        if (typeof this.proxy.sync != "function") {
            this.callParent(arguments)
        } else {
            this.proxy.sync(this)
        }
    },
    createModel: function (a) {
        if (!a.isModel) {
            a = Ext.ModelManager.create(a, this.model)
        }
        return a
    },
    each: function (b, a) {
        this.data.each(b, a)
    },
    remove: function (b, j) {
        if (!Ext.isArray(b)) {
            b = [b]
        }
        j = j === true;
        var f = this,
            g = false,
            c = 0,
            a = b.length,
            h, e, d;
        for (; c < a; c++) {
            d = b[c];
            e = f.data.indexOf(d);
            if (f.snapshot) {
                f.snapshot.remove(d)
            }
            if (e > -1) {
                h = d.phantom === true;
                if (!j && !h) {
                    f.removed.push(d)
                }
                d.unjoin(f);
                f.data.remove(d);
                g = g || !h;
                f.fireEvent("remove", f, d, e)
            }
        }
        f.fireEvent("datachanged", f);
        if (!j && f.autoSync && g) {
            f.sync()
        }
    },
    removeAt: function (b) {
        var a = this.getAt(b);
        if (a) {
            this.remove(a)
        }
    },
    load: function (a) {
        var b = this;
        a = a || {};
        if (Ext.isFunction(a)) {
            a = {
                callback: a
            }
        }
        Ext.applyIf(a, {
            groupers: b.groupers.items,
            page: b.currentPage,
            start: (b.currentPage - 1) * b.pageSize,
            limit: b.pageSize,
            addRecords: false
        });
        return b.callParent([a])
    },
    onProxyLoad: function (b) {
        var d = this,
            c = b.getResultSet(),
            a = b.getRecords(),
            e = b.wasSuccessful();
        if (c) {
            d.totalCount = c.total
        }
        if (e) {
            d.suspendEvents();
            d.loadRecords(a, b);
            d.resumeEvents()
        }
        d.loading = false;
        d.fireEvent("load", d, a, e);
        d.fireEvent("read", d, a, b.wasSuccessful());
        Ext.callback(b.callback, b.scope || d, [a, b, e])
    },
    onCreateRecords: function (d, e, l) {
        if (l) {
            var g = 0,
                f = this.data,
                a = this.snapshot,
                b = d.length,
                k = e.records,
                h, c, j;
            for (; g < b; ++g) {
                h = d[g];
                c = k[g];
                if (c) {
                    j = f.indexOf(c);
                    if (j > -1) {
                        f.removeAt(j);
                        f.insert(j, h)
                    }
                    if (a) {
                        j = a.indexOf(c);
                        if (j > -1) {
                            a.removeAt(j);
                            a.insert(j, h)
                        }
                    }
                    h.phantom = false;
                    h.join(this)
                }
            }
        }
    },
    onUpdateRecords: function (d, c, h) {
        if (h) {
            var e = 0,
                f = d.length,
                g = this.data,
                b = this.snapshot,
                a;
            for (; e < f; ++e) {
                a = d[e];
                g.replace(a);
                if (b) {
                    b.replace(a)
                }
                a.join(this)
            }
        }
    },
    onDestroyRecords: function (c, d, j) {
        if (j) {
            var h = this,
                f = 0,
                b = c.length,
                e = h.data,
                a = h.snapshot,
                g;
            for (; f < b; ++f) {
                g = c[f];
                g.unjoin(h);
                e.remove(g);
                if (a) {
                    a.remove(g)
                }
            }
            h.removed = []
        }
    },
    getNewRecords: function () {
        return this.data.filterBy(this.filterNew).items
    },
    getUpdatedRecords: function () {
        return this.data.filterBy(this.filterUpdated).items
    },
    filter: function (e, f) {
        if (Ext.isString(e)) {
            e = {
                property: e,
                value: f
            }
        }
        var d = this,
            a = d.decodeFilters(e),
            b = 0,
            g = d.sortOnFilter && !d.remoteSort,
            c = a.length;
        for (; b < c; b++) {
            d.filters.replace(a[b])
        }
        if (d.remoteFilter) {
            d.load()
        } else {
            if (d.filters.getCount()) {
                d.snapshot = d.snapshot || d.data.clone();
                d.data = d.data.filter(d.filters.items);
                if (g) {
                    d.sort()
                }
                if (!g || d.sorters.length < 1) {
                    d.fireEvent("filter", d);
                    d.fireEvent("datachanged", d)
                }
            }
        }
    },
    clearFilter: function (a) {
        var b = this;
        b.filters.clear();
        if (b.remoteFilter) {
            b.load()
        } else {
            if (b.isFiltered()) {
                b.data = b.snapshot.clone();
                delete b.snapshot;
                if (a !== true) {
                    b.fireEvent("filter", b);
                    b.fireEvent("datachanged", b)
                }
            }
        }
    },
    isFiltered: function () {
        var a = this.snapshot;
        return !!a && a !== this.data
    },
    filterBy: function (b, a) {
        var c = this;
        c.snapshot = c.snapshot || c.data.clone();
        c.data = c.queryBy(b, a || c);
        c.fireEvent("filter", c);
        c.fireEvent("datachanged", c)
    },
    queryBy: function (b, a) {
        var c = this,
            d = c.snapshot || c.data;
        return d.filterBy(b, a || c)
    },
    loadData: function (f, a) {
        var c = this.model,
            e = f.length,
            d, b;
        for (d = 0; d < e; d++) {
            b = f[d];
            if (!(b instanceof Ext.data.Model)) {
                f[d] = Ext.ModelManager.create(b, c)
            }
        }
        this.loadRecords(f, {
            addRecords: a
        })
    },
    loadRecords: function (a, b) {
        var e = this,
            c = 0,
            d = a.length;
        b = b || {};
        if (!b.addRecords) {
            e.removeAll()
        }
        e.add(a);
        for (; c < d; c++) {
            if (b.start !== undefined) {
                a[c].index = b.start + c
            }
            a[c].join(e)
        }
        e.suspendEvents();
        if (e.filterOnLoad && !e.remoteFilter) {
            e.filter()
        }
        if (e.sortOnLoad && !e.remoteSort) {
            e.sort()
        }
        e.resumeEvents();
        e.fireEvent("datachanged", e, a)
    },
    loadPage: function (c, a) {
        var b = this;
        a = Ext.apply({}, a);
        b.currentPage = c;
        b.read(Ext.applyIf(a, {
            page: c,
            start: (c - 1) * b.pageSize,
            limit: b.pageSize,
            addRecords: !b.clearOnPageLoad
        }))
    },
    nextPage: function (a) {
        this.loadPage(this.currentPage + 1, a)
    },
    previousPage: function (a) {
        this.loadPage(this.currentPage - 1, a)
    },
    clearData: function () {
        var a = this;
        a.data.each(function (b) {
            b.unjoin(a)
        });
        a.data.clear()
    },
    prefetch: function (b) {
        var c = this,
            a, d = c.getRequestId();
        b = b || {};
        Ext.applyIf(b, {
            action: "read",
            filters: c.filters.items,
            sorters: c.sorters.items,
            requestId: d
        });
        c.pendingRequests.push(d);
        a = Ext.create("Ext.data.Operation", b);
        if (c.fireEvent("beforeprefetch", c, a) !== false) {
            c.loading = true;
            c.proxy.read(a, c.onProxyPrefetch, c)
        }
        return c
    },
    prefetchPage: function (e, c) {
        var d = this,
            b = d.pageSize,
            f = (e - 1) * d.pageSize,
            a = f + b;
        if (Ext.Array.indexOf(d.pagesRequested, e) === -1 && !d.rangeSatisfied(f, a)) {
            c = c || {};
            d.pagesRequested.push(e);
            Ext.applyIf(c, {
                page: e,
                start: f,
                limit: b,
                callback: d.onWaitForGuarantee,
                scope: d
            });
            d.prefetch(c)
        }
    },
    getRequestId: function () {
        this.requestSeed = this.requestSeed || 1;
        return this.requestSeed++
    },
    onProxyPrefetch: function (b) {
        var d = this,
            c = b.getResultSet(),
            a = b.getRecords(),
            e = b.wasSuccessful();
        if (c) {
            d.totalCount = c.total;
            d.fireEvent("totalcountchange", d.totalCount)
        }
        if (e) {
            d.cacheRecords(a, b)
        }
        Ext.Array.remove(d.pendingRequests, b.requestId);
        if (b.page) {
            Ext.Array.remove(d.pagesRequested, b.page)
        }
        d.loading = false;
        d.fireEvent("prefetch", d, a, e, b);
        if (b.blocking) {
            d.fireEvent("load", d, a, e)
        }
        Ext.callback(b.callback, b.scope || d, [a, b, e])
    },
    cacheRecords: function (b, a) {
        var e = this,
            c = 0,
            d = b.length,
            f = a ? a.start : 0;
        if (!Ext.isDefined(e.totalCount)) {
            e.totalCount = b.length;
            e.fireEvent("totalcountchange", e.totalCount)
        }
        for (; c < d; c++) {
            b[c].index = f + c
        }
        e.prefetchData.addAll(b);
        if (e.purgePageCount) {
            e.purgeRecords()
        }
    },
    purgeRecords: function () {
        var c = this,
            b = c.prefetchData.getCount(),
            d = c.purgePageCount * c.pageSize,
            e = b - d - 1,
            a = 0;
        for (; a <= e; a++) {
            c.prefetchData.removeAt(0)
        }
    },
    rangeSatisfied: function (e, a) {
        var c = this,
            b = e,
            d = true;
        for (; b < a; b++) {
            if (!c.prefetchData.getByKey(b)) {
                d = false;
                break
            }
        }
        return d
    },
    getPageFromRecordIndex: function (a) {
        return Math.floor(a / this.pageSize) + 1
    },
    onGuaranteedRange: function () {
        var f = this,
            c = f.getTotalCount(),
            g = f.requestStart,
            b = ((c - 1) < f.requestEnd) ? c - 1 : f.requestEnd,
            d = [],
            a, e = g;
        b = Math.max(0, b);
        if (g !== f.guaranteedStart && b !== f.guaranteedEnd) {
            f.guaranteedStart = g;
            f.guaranteedEnd = b;
            for (; e <= b; e++) {
                a = f.prefetchData.getByKey(e);
                if (a) {
                    d.push(a)
                }
            }
            f.fireEvent("guaranteedrange", d, g, b);
            if (f.cb) {
                f.cb.call(f.scope || f, d)
            }
        }
        f.unmask()
    },
    mask: function () {
        this.masked = true;
        this.fireEvent("beforeload")
    },
    unmask: function () {
        if (this.masked) {
            this.fireEvent("load")
        }
    },
    hasPendingRequests: function () {
        return this.pendingRequests.length
    },
    onWaitForGuarantee: function () {
        if (!this.hasPendingRequests()) {
            this.onGuaranteedRange()
        }
    },
    guaranteeRange: function (a, c, b, m) {
        c = (c > this.totalCount) ? this.totalCount - 1 : c;
        var h = this,
            d = a,
            k = h.prefetchData,
            e = [],
            g = !! k.getByKey(a),
            j = !! k.getByKey(c),
            f = h.getPageFromRecordIndex(a),
            l = h.getPageFromRecordIndex(c);
        h.cb = b;
        h.scope = m;
        h.requestStart = a;
        h.requestEnd = c;
        if (!g || !j) {
            if (f === l) {
                h.mask();
                h.prefetchPage(f, {
                    callback: h.onWaitForGuarantee,
                    scope: h
                })
            } else {
                h.mask();
                h.prefetchPage(f, {
                    callback: h.onWaitForGuarantee,
                    scope: h
                });
                h.prefetchPage(l, {
                    callback: h.onWaitForGuarantee,
                    scope: h
                })
            }
        } else {
            h.onGuaranteedRange()
        }
    },
    sort: function () {
        var d = this,
            c = d.prefetchData,
            e, f, a, b;
        if (d.buffered) {
            if (d.remoteSort) {
                c.clear();
                d.callParent(arguments)
            } else {
                e = d.getSorters();
                f = d.guaranteedStart;
                a = d.guaranteedEnd;
                if (e.length) {
                    c.sort(e);
                    b = c.getRange();
                    c.clear();
                    d.cacheRecords(b);
                    delete d.guaranteedStart;
                    delete d.guaranteedEnd;
                    d.guaranteeRange(f, a)
                }
                d.callParent(arguments)
            }
        } else {
            d.callParent(arguments)
        }
    },
    doSort: function (b) {
        var e = this;
        if (e.remoteSort) {
            e.load()
        } else {
            e.data.sortBy(b);
            if (!e.buffered) {
                var a = e.getRange(),
                    d = a.length,
                    c = 0;
                for (; c < d; c++) {
                    a[c].index = c
                }
            }
            e.fireEvent("sort", e);
            e.fireEvent("datachanged", e)
        }
    },
    find: function (e, d, g, f, a, c) {
        var b = this.createFilterFn(e, d, f, a, c);
        return b ? this.data.findIndexBy(b, null, g) : -1
    },
    findRecord: function () {
        var b = this,
            a = b.find.apply(b, arguments);
        return a !== -1 ? b.getAt(a) : null
    },
    createFilterFn: function (d, c, e, a, b) {
        if (Ext.isEmpty(c)) {
            return false
        }
        c = this.data.createValueMatcher(c, e, a, b);
        return function (f) {
            return c.test(f.data[d])
        }
    },
    findExact: function (b, a, c) {
        return this.data.findIndexBy(function (d) {
            return d.get(b) === a
        }, this, c)
    },
    findBy: function (b, a, c) {
        return this.data.findIndexBy(b, a, c)
    },
    collect: function (b, a, c) {
        var d = this,
            e = (c === true && d.snapshot) ? d.snapshot : d.data;
        return e.collect(b, "data", a)
    },
    getCount: function () {
        return this.data.length || 0
    },
    getTotalCount: function () {
        return this.totalCount
    },
    getAt: function (a) {
        return this.data.getAt(a)
    },
    getRange: function (b, a) {
        return this.data.getRange(b, a)
    },
    getById: function (a) {
        return (this.snapshot || this.data).findBy(function (b) {
            return b.getId() === a
        })
    },
    indexOf: function (a) {
        return this.data.indexOf(a)
    },
    indexOfTotal: function (a) {
        var b = a.index;
        if (b || b === 0) {
            return b
        }
        return this.indexOf(a)
    },
    indexOfId: function (a) {
        return this.data.indexOfKey(a)
    },
    removeAll: function (a) {
        var b = this;
        b.clearData();
        if (b.snapshot) {
            b.snapshot.clear()
        }
        if (a !== true) {
            b.fireEvent("clear", b)
        }
    },
    first: function (a) {
        var b = this;
        if (a && b.isGrouped()) {
            return b.aggregate(function (c) {
                return c.length ? c[0] : undefined
            }, b, true)
        } else {
            return b.data.first()
        }
    },
    last: function (a) {
        var b = this;
        if (a && b.isGrouped()) {
            return b.aggregate(function (d) {
                var c = d.length;
                return c ? d[c - 1] : undefined
            }, b, true)
        } else {
            return b.data.last()
        }
    },
    sum: function (c, a) {
        var b = this;
        if (a && b.isGrouped()) {
            return b.aggregate(b.getSum, b, true, [c])
        } else {
            return b.getSum(b.data.items, c)
        }
    },
    getSum: function (b, e) {
        var d = 0,
            c = 0,
            a = b.length;
        for (; c < a; ++c) {
            d += b[c].get(e)
        }
        return d
    },
    count: function (a) {
        var b = this;
        if (a && b.isGrouped()) {
            return b.aggregate(function (c) {
                return c.length
            }, b, true)
        } else {
            return b.getCount()
        }
    },
    min: function (c, a) {
        var b = this;
        if (a && b.isGrouped()) {
            return b.aggregate(b.getMin, b, true, [c])
        } else {
            return b.getMin(b.data.items, c)
        }
    },
    getMin: function (b, f) {
        var d = 1,
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
    max: function (c, a) {
        var b = this;
        if (a && b.isGrouped()) {
            return b.aggregate(b.getMax, b, true, [c])
        } else {
            return b.getMax(b.data.items, c)
        }
    },
    getMax: function (c, f) {
        var d = 1,
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
    average: function (c, a) {
        var b = this;
        if (a && b.isGrouped()) {
            return b.aggregate(b.getAverage, b, true, [c])
        } else {
            return b.getAverage(b.data.items, c)
        }
    },
    getAverage: function (b, e) {
        var c = 0,
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
    aggregate: function (g, j, e, f) {
        f = f || [];
        if (e && this.isGrouped()) {
            var a = this.getGroups(),
                c = 0,
                d = a.length,
                b = {},
                h;
            for (; c < d; ++c) {
                h = a[c];
                b[h.name] = g.apply(j || this, [h.children].concat(f))
            }
            return b
        } else {
            return g.apply(j || this, [this.data.items].concat(f))
        }
    }
}, function () {
    Ext.regStore("ext-empty-store", {
        fields: [],
        proxy: "proxy"
    })
});


Ext.define("Ext.data.ArrayStore", {
    extend: "Ext.data.Store",
    alias: "store.array",
    uses: ["Ext.data.reader.Array"],
    constructor: function (a) {
        a = a || {};
        Ext.applyIf(a, {
            proxy: {
                type: "memory",
                reader: "array"
            }
        });
        this.callParent([a])
    },
    loadData: function (e, a) {
        if (this.expandData === true) {
            var d = [],
                b = 0,
                c = e.length;
            for (; b < c; b++) {
                d[d.length] = [e[b]]
            }
            e = d
        }
        this.callParent([e, a])
    }
}, function () {
    Ext.data.SimpleStore = Ext.data.ArrayStore
});


Ext.define("Ext.data.reader.Array", {
    extend: "Ext.data.reader.Json",
    alternateClassName: "Ext.data.ArrayReader",
    alias: "reader.array",
    buildExtractors: function () {
        this.callParent(arguments);
        var a = this.model.prototype.fields.items,
            b = 0,
            c = a.length,
            e = [],
            d;
        for (; b < c; b++) {
            d = a[b].mapping;
            e.push(function (f) {
                return function (g) {
                    return g[f]
                }
            }(d !== null ? d : b))
        }
        this.extractorFunctions = e
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
        scrollable: "vertical",
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
        }, {
            xtype: "toolbar",
            docked: "bottom",
            ignoreDefaults: true,
            defaults: {
                xtype: "button",
                text: "Test",
                flex: 1
            },
            items: Ext.os.deviceType.toLowerCase() == "phone" ? [{
                ui: "round"
            }, {
                ui: "action"
            }, {
                ui: "decline-small"
            }, {
                ui: "confirm-round"
            }] : [{
                ui: "round"
            }, {
                ui: "drastic"
            }, {
                ui: "action"
            }, {
                ui: "decline-round"
            }, {
                ui: "decline-small"
            }, {
                ui: "confirm-round"
            }, {
                ui: "confirm-small"
            }]
        }]
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
                        b = new Ext.XTemplate(['<div class="demo-weather">', '<tpl for=".">', '<div class="day">', '<div class="date">{date}</div>', '<tpl for="weatherIconUrl"><img src="{value}"/></tpl>', '<span class="temp">{tempMaxF}&deg;<span class="temp_low">{tempMinF}&deg;</span></span>', "</div>", "</tpl>", "</div>"]);
                    a.getParent().setMask({
                        message: "Loading..."
                    });
                    Ext.util.JSONP.request({
                        url: "http://free.worldweatheronline.com/feed/weather.ashx",
                        callbackKey: "callback",
                        params: {
                            key: "23f6a0ab24185952101705",
                            q: "94301",
                            format: "json",
                            num_of_days: 5
                        },
                        callback: function (c) {
                            var d = c.data.weather;
                            if (d) {
                                a.updateHtml(b.applyTemplate(d))
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
                    a.getParent().setMask({
                        message: "Loading..."
                    });
                    Ext.Ajax.request({
                        url: "test.json",
                        success: function (b) {
                            a.update(b.responseText);
                            a.getParent().unmask()
                        }
                    })
                }
            }]
        }]
    }
});


Ext.define("Kitchensink.view.TouchEvents", {
    extend: "Ext.Container",
    config: {
        profile: null
    },
    initialize: function () {
        this.callParent(arguments);
        var a = this.getEventDispatcher();
        a.addListener("element", "#touchpad", "*", function (g, f, k, j) {
            var i = j.info.eventName;
            if (!i.match("mouse") && !i.match("click")) {
                var h = Ext.getCmp("logger"),
                    e = h.getScrollable().getScroller();
                h.innerHtmlElement.createChild({
                    html: j.info.eventName
                });
                setTimeout(function () {
                    e.scrollTo(0, e.getSize().y - e.getContainerSize().y)
                }, 50)
            }
        })
    },
    onOrientationChange: function (b) {
        var a = this.touchCard;
        this.touchCard = new Ext.Container({
            layout: {
                type: b == "portrait" ? "vbox" : "hbox",
                align: "stretch"
            },
            items: [this.touchPad, this.logger]
        });
        if (a && this.getActiveItem() == a) {
            this.setActiveItem(this.touchCard)
        } else {
            this.add(this.touchCard)
        }
        if (a) {
            this.remove(a, true)
        }
    },
    updateProfile: function (e) {
        var d = {
            layout: "fit",
            flex: 1,
            items: [{
                xtype: "toolbar",
                docked: "top",
                title: "Event Log",
                ui: "light"
            }, {
                styleHtmlContent: true,
                id: "logger",
                scrollable: true,
                html: "<span>Try using gestures on the area to the right to see how events are fired.</span>"
            }]
        },
            f = {
                flex: 1.5,
                scrollable: true,
                styleHtmlContent: true,
                html: "<p>Sencha Touch comes with a multitude of touch events available on components. Included touch events that can be used are:</p><ul><li>touchstart</li><li>touchmove</li><li>touchend</li><li>touchdown</li><li>scrollstart</li><li>scroll</li><li>scrollend</li><li>tap</li><li>tapstart</li><li>tapcancel</li><li>doubletap</li><li>taphold</li><li>swipe</li><li>pinch</li><li>pinchstart</li><li>pinchend</li></ul>"
            },
            b = {
                flex: 1,
                id: "touchpad",
                layout: {
                    type: "vbox",
                    pack: "center",
                    align: "stretch"
                },
                margin: 10,
                items: [{
                    html: "Touch here!"
                }]
            },
            c, a;
        if (e === "phone") {
            this.setLayout({
                type: "card"
            });
            this.infoCard = new Ext.Container({
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
                    handler: this.onConsoleButtonTap,
                    scope: this
                }, {
                    xtype: "component",
                    styleHtmlContent: true,
                    html: "<p>Sencha Touch comes with a multitude of touch events available on components. Included touch events that can be used are:</p><ul><li>touchstart</li><li>touchmove</li><li>touchend</li><li>scrollstart</li><li>scroll</li><li>scrollend</li><li>singletap</li><li>tap</li><li>doubletap</li><li>taphold</li><li>swipe</li><li>pinch</li></ul>"
                }]
            });
            this.add(this.infoCard);
            Ext.Viewport.on({
                orientationchange: this.onOrientationChange,
                scope: this
            });
            this.logger = new Ext.Container(d);
            this.touchPad = new Ext.Container(b);
            this.onOrientationChange(Ext.Viewport.getOrientation());
            this.setActiveItem(0)
        } else {
            this.setLayout({
                type: "hbox",
                align: "stretch"
            });
            this.add([{
                docked: "left",
                width: 250,
                id: "touchinfopanel",
                layout: {
                    type: "vbox",
                    align: "stretch"
                },
                items: [f, d]
            },
            b]);
            Ext.Viewport.un({
                orientationchange: this.onOrientationChange,
                scope: this
            })
        }
    },
    onConsoleButtonTap: function () {
        this.setActiveItem(1)
    }
});


Ext.define("Ext.Panel", {
    isPanel: true,
    extend: "Ext.Container",
    xtype: "panel",
    alternateClassName: "Ext.lib.Panel",
    config: {
        baseCls: Ext.baseCSSPrefix + "panel",
        bodyPadding: null,
        bodyMargin: null,
        bodyBorder: null
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
    }
});


Ext.define("Ext.SegmentedButton", {
    extend: "Ext.Container",
    xtype: "segmentedbutton",
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
        a.on({
            delegate: "> button",
            scope: a,
            release: "onButtonRelease"
        });
        a.onAfter({
            delegate: "> button",
            scope: a,
            hiddenchange: "onButtonHiddenChange"
        });
        a.callParent()
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
        if (!d.getDisabled()) {
            if (d.getAllowMultiple()) {
                c = c.concat(e)
            }
            b = c.indexOf(a) !== -1;
            if (b && d.getAllowDepress()) {
                Ext.Array.remove(c, a)
            } else {
                if (!b) {
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
}, function () {
    var a = this;
    Ext.deprecateClassMethod(a, "setPressed", a.prototype.setPressedButtons, "[Ext.SegmentedButton] setPressed is now deprecated, please use setPressedButtons instead");
    Ext.deprecateClassMethod(a, "getPressed", a.prototype.getPressedButtons, "[Ext.SegmentedButton] getPressed is now deprecated. Please use getPressedButtons instead.")
});


Ext.define("Ext.util.JSONP", {
    singleton: true,
    queue: [],
    current: null,
    request: function (d) {
        d = d || {};
        if (!d.url) {
            return
        }
        var b = this;
        d.params = d.params || {};
        if (d.callbackKey) {
            d.params[d.callbackKey] = "Ext.util.JSONP.callback"
        }
        var c = Ext.urlEncode(d.params);
        var a = document.createElement("script");
        a.type = "text/javascript";
        this.queue.push({
            url: d.url,
            script: a,
            callback: d.callback ||
            function () {},
            scope: d.scope || window,
            params: c || null
        });
        if (!this.current) {
            this.next()
        }
    },
    next: function () {
        this.current = null;
        if (this.queue.length) {
            this.current = this.queue.shift();
            this.current.script.src = this.current.url + (this.current.params ? ("?" + this.current.params) : "");
            document.getElementsByTagName("head")[0].appendChild(this.current.script)
        }
    },
    callback: function (a) {
        this.current.callback.call(this.current.scope, a);
        document.getElementsByTagName("head")[0].removeChild(this.current.script);
        this.next()
    }
});


Ext.define("Kitchensink.model.Demo", {
    extend: "Ext.data.Model",
    fields: [{
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
});


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
        baseCls: Ext.baseCSSPrefix + "button",
        ui: "normal"
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
            touchmove: "onRelease",
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
            a.setText(b)
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
        var a = this.iconElement;
        if (b) {
            a.show();
            a.setStyle("background-image", b ? "url(" + b + ")" : "");
            this.refreshIconAlign();
            this.refreshIconMask()
        } else {
            a.hide();
            this.setIconAlign(false)
        }
    },
    updateIconCls: function (c, a) {
        var b = this.iconElement;
        if (c) {
            b.show();
            b.replaceCls(a, c);
            this.refreshIconAlign();
            this.refreshIconMask()
        } else {
            b.hide();
            this.setIconAlign(false)
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
    applyPressedDelay: function (a) {
        return isNaN(a) ? 0 : a
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
        b.apply(a, arguments)
    }
}, function () {
    Ext.deprecateClassMethod(this, "setBadge", this.prototype.setBadgeText, "'setBadge()' is deprecated, please use setBadgeText()");
    Ext.deprecateClassMethod(this, "setIconClass", this.prototype.setIconCls, "'setIconClass()' is deprecated, please use setIconCls()");
    this.override({
        constructor: function (a) {
            if (a) {
                if (a.hasOwnProperty("badge")) {
                    a.badgeText = a.badge
                }
                if (a.hasOwnProperty("html")) {
                    a.text = a.html
                }
            }
            this.callParent([a])
        }
    })
});


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


Ext.define("Ext.data.Tree", {
    alias: "data.tree",
    mixins: {
        observable: "Ext.util.Observable"
    },
    root: null,
    constructor: function (a) {
        var b = this;
        b.nodeHash = {};
        b.mixins.observable.constructor.call(b);
        if (a) {
            b.setRootNode(a)
        }
    },
    getRootNode: function () {
        return this.root
    },
    setRootNode: function (b) {
        var a = this;
        a.root = b;
        Ext.data.NodeInterface.decorate(b);
        if (a.fireEvent("beforeappend", null, b) !== false) {
            b.set("root", true);
            b.updateInfo();
            a.relayEvents(b, ["append", "remove", "move", "insert", "beforeappend", "beforeremove", "beforemove", "beforeinsert", "expand", "collapse", "beforeexpand", "beforecollapse", "rootchange"]);
            b.on({
                scope: a,
                insert: a.onNodeInsert,
                append: a.onNodeAppend,
                remove: a.onNodeRemove
            });
            a.registerNode(b);
            a.fireEvent("append", null, b);
            a.fireEvent("rootchange", b)
        }
        return b
    },
    flatten: function () {
        var a = [],
            c = this.nodeHash,
            b;
        for (b in c) {
            if (c.hasOwnProperty(b)) {
                a.push(c[b])
            }
        }
        return a
    },
    onNodeInsert: function (a, b) {
        this.registerNode(b)
    },
    onNodeAppend: function (a, b) {
        this.registerNode(b)
    },
    onNodeRemove: function (a, b) {
        this.unregisterNode(b)
    },
    getNodeById: function (a) {
        return this.nodeHash[a]
    },
    registerNode: function (a) {
        this.nodeHash[a.getId() || a.internalId] = a
    },
    unregisterNode: function (a) {
        delete this.nodeHash[a.getId() || a.internalId]
    },
    sort: function (b, a) {
        this.getRootNode().sort(b, a)
    },
    filter: function (b, a) {
        this.getRootNode().filter(b, a)
    }
});


Ext.define("Ext.data.NodeInterface", {
    requires: ["Ext.data.Field"],
    alternateClassName: "Ext.data.Node",
    statics: {
        decorate: function (c) {
            if (!c.isNode) {
                var h = Ext.ModelManager,
                    e = c.modelName,
                    g = h.getModel(e),
                    j = g.prototype.idProperty,
                    f = [],
                    b, a, d;
                g.override(this.getPrototypeBody());
                f = this.applyFields(g, [{
                    name: j,
                    type: "string",
                    defaultValue: null
                }, {
                    name: "parentId",
                    type: "string",
                    defaultValue: null
                }, {
                    name: "index",
                    type: "int",
                    defaultValue: null
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
                d = f.length;
                for (b = 0; b < d; ++b) {
                    a = f[b];
                    if (c.get(a.name) === undefined) {
                        c.data[a.name] = a.defaultValue
                    }
                }
            }
            Ext.applyIf(c, {
                firstChild: null,
                lastChild: null,
                parentNode: null,
                previousSibling: null,
                nextSibling: null,
                childNodes: []
            });
            c.commit(true);
            c.enableBubble(["append", "remove", "move", "insert", "beforeappend", "beforeremove", "beforemove", "beforeinsert", "expand", "collapse", "beforeexpand", "beforecollapse", "sort"]);
            return c
        },
        applyFields: function (h, j) {
            var c = h.prototype,
                e = c.fields,
                k = e.keys,
                g = j.length,
                b, d, a, f = [];
            for (d = 0; d < g; d++) {
                b = j[d];
                if (!Ext.Array.contains(k, b.name)) {
                    b = Ext.create("data.field", b);
                    f.push(b);
                    e.add(b)
                }
            }
            return f
        },
        getPrototypeBody: function () {
            return {
                isNode: true,
                createNode: function (a) {
                    if (Ext.isObject(a) && !a.isModel) {
                        a = Ext.ModelManager.create(a, this.modelName)
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
                updateInfo: function (j) {
                    var k = this,
                        b = k.isRoot(),
                        g = k.parentNode,
                        c = (!g ? true : g.firstChild == k),
                        f = (!g ? true : g.lastChild == k),
                        e = 0,
                        l = k,
                        a = k.childNodes,
                        h = a.length,
                        d = 0;
                    while (l.parentNode) {
                        ++e;
                        l = l.parentNode
                    }
                    k.beginEdit();
                    k.set({
                        isFirst: c,
                        isLast: f,
                        depth: e,
                        index: g ? g.indexOf(k) : 0,
                        parentId: g ? g.getId() : null
                    });
                    k.endEdit(j);
                    if (j) {
                        k.commit(j)
                    }
                    for (d = 0; d < h; d++) {
                        a[d].updateInfo(j)
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
                    if (e.previousSibling) {
                        e.previousSibling.nextSibling = e.nextSibling;
                        e.previousSibling.updateInfo(f)
                    }
                    if (e.nextSibling) {
                        e.nextSibling.previousSibling = e.previousSibling;
                        e.nextSibling.updateInfo(f)
                    }
                    if (c !== true) {
                        d.fireEvent("remove", d, e)
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
                                this.setFirstChild(g);
                                g.updateInfo()
                            }
                            if (c == e - 1) {
                                this.setLastChild(g);
                                g.updateInfo()
                            }
                            if (b && !g.isLeaf()) {
                                g.sort(f, true, true)
                            }
                        }
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
                                c.fireEvent("beforeexpand", c, function () {
                                    c.set("expanded", true);
                                    c.fireEvent("expand", c, c.childNodes, false);
                                    if (a) {
                                        c.expandChildren(true, d, b)
                                    } else {
                                        Ext.callback(d, b || c, [c.childNodes])
                                    }
                                }, c)
                            } else {
                                if (a) {
                                    c.expandChildren(true, d, b)
                                } else {
                                    Ext.callback(d, b || c, [c.childNodes])
                                }
                            }
                        }
                    } else {
                        Ext.callback(d, b || c)
                    }
                },
                expandChildren: function (d, h, j) {
                    var g = this,
                        e = 0,
                        a = g.childNodes,
                        f = a.length,
                        c, b = 0;
                    for (; e < f; ++e) {
                        c = a[e];
                        if (!c.isLeaf() && !c.isExpanded()) {
                            b++;
                            a[e].expand(d, function () {
                                b--;
                                if (h && !b) {
                                    Ext.callback(h, j || g, [g.childNodes])
                                }
                            })
                        }
                    }
                    if (!b && h) {
                        Ext.callback(h, j || g, [g.childNodes])
                    }
                },
                collapse: function (a, d, b) {
                    var c = this;
                    if (!c.isLeaf()) {
                        if (!c.collapsing && c.isExpanded()) {
                            c.fireEvent("beforecollapse", c, function () {
                                c.set("expanded", false);
                                c.fireEvent("collapse", c, c.childNodes, false);
                                if (a) {
                                    c.collapseChildren(true, d, b)
                                } else {
                                    Ext.callback(d, b || c, [c.childNodes])
                                }
                            }, c)
                        } else {
                            if (a) {
                                c.collapseChildren(true, d, b)
                            }
                        }
                    } else {
                        Ext.callback(d, b || c, [c.childNodes])
                    }
                },
                collapseChildren: function (d, h, j) {
                    var g = this,
                        e = 0,
                        b = g.childNodes,
                        f = b.length,
                        c, a = 0;
                    for (; e < f; ++e) {
                        c = b[e];
                        if (!c.isLeaf() && c.isExpanded()) {
                            a++;
                            b[e].collapse(d, function () {
                                a--;
                                if (h && !a) {
                                    Ext.callback(h, j || g, [g.childNodes])
                                }
                            })
                        }
                    }
                    if (!a && h) {
                        Ext.callback(h, j || g, [g.childNodes])
                    }
                }
            }
        }
    }
});


Ext.define("Ext.util.GeoLocation", {
    extend: "Ext.EventedBase",
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
    constructor: function (a) {
        this.initConfig(a)
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
        var f = function (i, e) {
                if (e) {
                    b.fireError(e)
                } else {
                    b.fireEvent("locationerror", b, false, false, true, i)
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


Ext.define("Ext.Sheet", {
    extend: "Ext.Container",
    alias: "widget.sheet",
    config: {
        baseCls: Ext.baseCSSPrefix + "sheet",
        hidden: true,
        modal: true,
        centered: true,
        hideOnMaskTap: false,
        stretchX: null,
        stretchY: null,
        enter: "bottom",
        exit: "bottom",
        enterAnimation: "slide",
        exitAnimation: "slide"
    },
    updateStretchX: function (a) {
        var b = this.getInitialConfig();
        if (a) {
            this.setLeft(0);
            this.setRight(0)
        } else {
            this.setLeft(b.left || "auto");
            this.setRight(b.right || "auto")
        }
    },
    updateStretchY: function (a) {
        var b = this.getInitialConfig();
        if (a) {
            this.setTop(0);
            this.setBottom(0)
        } else {
            this.setTop(b.top || "auto");
            this.setBottom(b.bottom || "auto")
        }
    },
    onHiddenChange: function (a) {
        if (!a) {
            Ext.Viewport.hideKeyboard()
        }
        this.callParent(arguments)
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
        playing: false
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.on({
            scope: a,
            activate: a.onActivate,
            deactivate: a.onDeactivate
        })
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
        this.isPlaying() ? this.pause() : this.play()
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
            a.pop().remove()
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
    }
});


Ext.define("Ext.layout.Carousel", {
    extend: "Ext.layout.Default",
    alias: "layout.carousel",
    onItemAdd: function (a) {
        if (a.isInnerItem()) {
            return
        }
        this.callParent(arguments)
    },
    onItemRemove: function (a) {
        if (a.isInnerItem()) {
            return
        }
        this.callParent(arguments)
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
            this.fireEvent("index", b.dom.innerHTML, b)
        }
    }
});


Ext.define("Ext.dataview.ListItemHeader", {
    extend: "Ext.Component",
    xtype: "listitemheader",
    config: {
        baseCls: Ext.baseCSSPrefix + "list-header",
        docked: "top"
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
    updateTitle: function (a) {
        this.setText(a)
    },
    updateActive: function (b) {
        var a = this.getActiveCls();
        if (b) {
            this.addCls(a);
            this.fireEvent("activate", this)
        } else {
            this.removeCls(a);
            this.fireEvent("deactivate", this)
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


Ext.define("Ext.Decorator", {
    extend: "Ext.Component",
    isDecorator: true,
    config: {
        component: {}
    },
    onClassExtended: function (b, a) {
        if (!a.hasOwnProperty("proxyConfig")) {
            return
        }
        var d = Ext.Class,
            e = a.proxyConfig,
            c = a.config;
        a.config = (c) ? Ext.applyIf(c, e) : e;
        Ext.Object.each(e, function (f) {
            var i = d.getConfigNameMap(f),
                h = i.set,
                g = i.get;
            b.addMember(h, function (k) {
                var j = this.getComponent();
                j[h].call(j, k);
                return this
            });
            b.addMember(g, function () {
                var j = this.getComponent();
                return j[g].call(j)
            })
        })
    },
    applyComponent: function (a) {
        return Ext.factory(a, Ext.Component)
    },
    updateComponent: function (b, c) {
        var a = this.innerElement;
        if (c) {
            a.dom.removeChild(c.renderElement.dom);
            if (this.isRendered() && c.setRendered(false)) {
                c.fireEvent("renderedchange", c, false)
            }
        }
        if (b) {
            a.dom.appendChild(b.renderElement.dom);
            if (this.isRendered() && b.setRendered(true)) {
                b.fireEvent("renderedchange", b, true)
            }
        }
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
    }
});


Ext.define("Ext.field.Input", {
    extend: "Ext.Component",
    xtype: "input",
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
        tag: "input",
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
    originalValue: undefined,
    getTemplate: function () {
        var a = [{
            reference: "input",
            tag: this.getTag()
        }, {
            reference: "clearIcon",
            cls: "x-clear-icon",
            html: "x"
        }];
        a.push({
            reference: "mask",
            classList: [this.getMaskCls()]
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
        a.doInitValue()
    },
    doInitValue: function () {
        this.originalValue = this.getValue()
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
        this.getDraggable().on({
            dragstart: "onDragStart",
            drag: "onDrag",
            dragend: "onDragEnd",
            scope: this
        });
        this.on("painted", "onPainted")
    },
    onDragStart: function (a, d, f, c, b) {
        this.doFireEvent("dragstart", [this, d, f], null, b)
    },
    onDrag: function (a, d, f, c, b) {
        this.doFireEvent("drag", [this, d, f], null, b)
    },
    onDragEnd: function (a, d, c, b) {
        this.doFireEvent("dragend", [this, d], null, b)
    },
    onPainted: function () {
        this.elementWidth = this.element.dom.offsetWidth
    },
    getElementWidth: function () {
        return this.elementWidth
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
            i = b + (e * a);
        if (f >= d) {
            this.isEnded = true;
            return h
        }
        return i
    }
});


Ext.define("Ext.field.TextAreaInput", {
    extend: "Ext.field.Input",
    xtype: "textareainput",
    config: {
        tag: "textarea"
    },
    getTemplate: function () {
        var a = [{
            reference: "input",
            tag: this.getTag()
        }, {
            reference: "clearIcon",
            cls: "x-clear-icon",
            html: "x"
        }];
        a.push({
            reference: "mask",
            classList: [this.getMaskCls()]
        });
        return a
    }
});


Ext.define("Kitchensink.model.OrderItem", {
    extend: "Ext.data.Model",
    fields: ["id", "quantity", "price", "name"]
});


Ext.define("Ext.mixin.Selectable", {
    alternateClassName: "Ext.AbstractStoreSelectionModel",
    extend: "Ext.mixin.Mixin",
    mixinConfig: {
        id: "selectable",
        hooks: {
            applyStore: "applyStore",
            updateStore: "updateStore"
        }
    },
    config: {
        locked: false,
        mode: "SINGLE",
        selected: null,
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
        add: "onSelectionStoreAdd",
        remove: "onSelectionStoreRemove",
        update: "onSelectionStoreUpdate",
        clear: "onSelectionStoreClear",
        load: "refreshSelection",
        sort: "refreshSelection",
        filter: "refreshSelection"
    },
    constructor: function () {
        this._selected = new Ext.util.MixedCollection();
        this.callParent(arguments)
    },
    applySelected: function (a, b) {
        if (a) {
            if (!Ext.isArray(a)) {
                b.add(a)
            } else {
                b.addAll(a)
            }
        }
    },
    applyMode: function (a) {
        a = a ? a.toUpperCase() : "SINGLE";
        return this.modes[a] ? a : "SINGLE"
    },
    applyStore: function (a) {
        var b = this,
            c = Ext.apply({}, b.selectableEventHooks, {
                scope: b
            });
        if (a) {
            a = Ext.data.StoreManager.lookup(a);
            if (a && Ext.isObject(a) && a.isStore) {
                a.on(c)
            }
        }
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
        if (g.getLocked()) {
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
        if (d.getLocked()) {
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
            c = d.getSelected();
        if (d.getLocked()) {
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
        if (a === null || this.getLocked()) {
            return
        }
        a = !Ext.isArray(a) ? [a] : a;
        var f = this,
            b = f.getSelected(),
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
    deselect: function (c, b) {
        var g = this,
            e = g.getSelected(),
            f = c.length,
            h = false,
            d = 0,
            a;
        if (g.getLocked()) {
            return
        }
        if (typeof c === "number") {
            c = [g.getStore().getAt(c)]
        }
        if (!Ext.isArray(c)) {
            c = [c];
            f = 1
        }
        for (; d < f; d++) {
            a = c[d];
            if (e.remove(a)) {
                if (g.getLastSelected() == a) {
                    g.setLastSelected(e.last())
                }
                g.onItemDeselect(a, b);
                h = true
            }
        }
        g.fireSelectionChange(h && !b)
    },
    updateLastFocused: function (b, a) {
        this.onLastFocusChanged(a, b)
    },
    fireSelectionChange: function (a) {
        var b = this;
        if (a) {
            b.fireAction("beforeselectionchange", [], function () {
                b.fireEvent("selectionchange", b, b.getSelection())
            })
        }
    },
    getSelection: function () {
        return this.getSelected().getRange()
    },
    isSelected: function (a) {
        a = Ext.isNumber(a) ? this.getStore().getAt(a) : a;
        return this.getSelected().indexOf(a) !== -1
    },
    hasSelection: function () {
        return this.getSelected().getCount() > 0
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
        if (f.getSelected().getCount() != a.length) {
            g = true
        }
        f.clearSelections();
        if (a.length) {
            f.select(a, false, true)
        }
        f.fireSelectionChange(g)
    },
    clearSelections: function () {
        var a = this;
        a.getSelected().clear();
        a.setLastSelected(null);
        a.setLastFocused(null)
    },
    onSelectionStoreClear: function () {
        var b = this,
            a = b.getSelected();
        if (a.getCount > 0) {
            a.clear();
            b.setLastSelected(null);
            b.setLastFocused(null);
            b.fireSelectionChange(true)
        }
    },
    onSelectionStoreRemove: function (b, a) {
        var d = this,
            c = d.getSelected();
        if (d.getLocked()) {
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
    getCount: function () {
        return this.getSelected().getCount()
    },
    onSelectionStoreAdd: Ext.emptyFn,
    onSelectionStoreUpdate: Ext.emptyFn,
    onItemSelect: Ext.emptyFn,
    onItemDeselect: Ext.emptyFn,
    onLastFocusChanged: Ext.emptyFn,
    onEditorKey: Ext.emptyFn
}, function () {
    Ext.deprecateClassMethod(this, "isLocked", this.prototype.getLocked, "'isLocked()' is deprecated, please use 'getLocked' instead");
    Ext.deprecateClassMethod(this, "getSelectionMode", this.prototype.getMode, "'getSelectionMode()' is deprecated, please use 'getMode' instead");
    Ext.deprecateClassMethod(this, "doDeselect", this.prototype.deselect, "'doDeselect()' is deprecated, please use 'deselect()' instead");
    Ext.deprecateClassMethod(this, "doSelect", this.prototype.select, "'doSelect()' is deprecated, please use 'select()' instead");
    Ext.deprecateClassMethod(this, "bind", this.prototype.setStore, "'bind()' is deprecated, please use 'setStore()' instead")
});


Ext.define("Kitchensink.view.SourceOverlay", {
    extend: "Ext.Panel",
    xtype: "sourceoverlay",
    config: {
        cls: "ux-code",
        modal: true,
        styleHtmlContent: true,
        hideOnMaskTap: true,
        top: Ext.os.deviceType == "Phone" ? "10%" : "10%",
        left: Ext.os.deviceType == "Phone" ? "5%" : "10%",
        right: Ext.os.deviceType == "Phone" ? "5%" : "10%",
        bottom: Ext.os.deviceType == "Phone" ? "10%" : "10%",
        scrollable: true
    },
    applyHtml: function (e) {
        this.matches = [];
        var c = e,
            a = '<span class="ux-code-{0}">{1}</span>';
        var f = Ext.Function.bind(function (j, n) {
            for (var k = 0; k < this.matches.length; k++) {
                var h = this.matches[k],
                    l = h[0],
                    o = h[1];
                if ((l <= j && j < o) || (l < (j + n) && (j + n) <= o)) {
                    return true
                }
            }
            return false
        }, this);
        var b = Ext.Function.bind(function (p, r, t, q) {
            r.compile(r);
            var o;
            while (o = r.exec(p)) {
                var u = q ? q(o) : [o.index, o[0]],
                    l = u[0],
                    k = u[1];
                if (!f(l, k.length)) {
                    var h = Ext.util.Format.format(a, t, k),
                        s = (h.length - k.length);
                    p = p.slice(0, l) + h + p.slice(l + k.length);
                    r.lastIndex = l + h.length;
                    for (var n = 0; n < this.matches.length; n++) {
                        var j = this.matches[n];
                        if (j[1] < l) {
                            continue
                        }
                        j[0] += s;
                        j[1] += s
                    }
                    this.matches.push([l, r.lastIndex])
                }
            }
            return p
        }, this);
        var g = /<(\w+)>/ig,
            d;
        while (d = g.exec(c)) {
            c = c.slice(0, d.index) + Ext.util.Format.format("&lt;{0}&gt;", d[1]) + c.slice(d.index + d[0].length)
        }
        c = b(c, /\/\*(.|\s)*?\*\//ig, "comment");
        c = b(c, (/("|')[^\1\n\r]*?\1/ig), "string");
        c = b(c, /\/\/[^\n\r]*/ig, "comment");
        c = b(c, /\d+\.?\d*/ig, "number");
        c = b(c, /(\w+)\s*\:\s*function/ig, "function", function (h) {
            return [h.index, h[1]]
        });
        c = b(c, /function (\w+)/ig, "function", function (h) {
            return [h.index + 9, h[1]]
        });
        c = b(c, /\b(this|function|null|return|true|false|new|int|float|break|const|continue|delete|do|while|for|in|switch|case|throw|try|catch|typeof|instanceof|var|void|with|yield|if|else)\b/ig, "keyword");
        c = b(c, /\.|\,|\:|\;|\=|\+|\-|\&|\%|\*|\/|\!|\?|\<|\>|\||\^|\~/ig, "operator");
        return "<pre>" + c + "</pre>"
    }
});


Ext.define("Kitchensink.view.Toolbars", {
    extend: "Ext.Container",
    requires: ["Ext.SegmentedButton"],
    config: {
        cls: "card",
        html: "Pick a button, any button. <br /><small>By using SASS, all of the buttons on this screen can be restyled dynamically. The only images used are masks.</small>",
        items: Ext.os.deviceType.toLowerCase() != "phone" ? [{
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
            scrollable: {
                direction: "horizontal",
                indicators: false
            },
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
            scrollable: {
                direction: "horizontal",
                indicators: false
            },
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


Ext.define("Kitchensink.view.Slide", {
    extend: "Ext.Panel",
    config: {
        cls: "card card1",
        html: "Slide Animation"
    }
});


Ext.define("Kitchensink.view.Pop", {
    extend: "Ext.Panel",
    config: {
        cls: "card card2",
        html: "Pop Animation"
    }
});


Ext.define("Kitchensink.view.Fade", {
    extend: "Ext.Panel",
    config: {
        cls: "card card3",
        html: "Fade Animation"
    }
});


Ext.define("Kitchensink.view.Flip", {
    extend: "Ext.Panel",
    config: {
        cls: "card card4",
        html: "Flip Animation"
    }
});
Ext.require("Ext.util.JSONP", function () {
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
            Ext.util.JSONP.request({
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
                            b = new Ext.XTemplate(['<tpl for="item">', '<h2><a href="{link}" target="_blank">{title}</a><small> by {creator}</small></h2>', "<p>{description}</p>", "</tpl>"]);
                        a.getParent().setMask({
                            message: "Loading..."
                        });
                        Ext.YQL.request({
                            query: "select * from rss where url='http://feeds.feedburner.com/extblog' limit 5",
                            callback: function (c) {
                                if (c.query && c.query.results) {
                                    a.update(b.apply(c.query.results))
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
    initialize: function () {
        var d = Ext.util.SizeMonitor,
            e = this.getDefaults() || {},
            a, b, c;
        this.leftBox = a = this.add({
            xtype: "container",
            style: "position: relative",
            layout: {
                type: "hbox",
                align: "center"
            }
        });
        this.spacer = c = this.add({
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
            hidden: e.hidden,
            centered: true
        });
        this.sizeMonitors = {
            leftBox: new d({
                element: a.renderElement,
                callback: this.refreshTitlePosition,
                scope: this
            }),
            spacer: new d({
                element: c.renderElement,
                callback: this.refreshTitlePosition,
                scope: this
            }),
            rightBox: new d({
                element: b.renderElement,
                callback: this.refreshTitlePosition,
                scope: this
            })
        };
        this.doAdd = this.doBoxAdd;
        this.doInsert = this.doBoxInsert;
        this.on({
            painted: "onPainted",
            erased: "onErased"
        });
        this.callParent()
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
            h, m;
        if (c) {
            c.renderElement.setWidth("auto");
            h = a.renderElement.getWidth();
            m = this.getMaxButtonWidth();
            if (h > m) {
                c.renderElement.setWidth(m)
            }
        }
        var j = this.spacer.renderElement.getPageBox(),
            k = f.getPageBox(),
            g = k.width - j.width,
            d = k.left,
            i = k.right,
            b, l, e;
        if (g > 0) {
            f.setWidth(j.width);
            b = g / 2;
            d += b;
            i -= b
        }
        l = j.left - d;
        e = i - j.right;
        if (l > 0) {
            f.setLeft(l)
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


Ext.define("Ext.form.FieldSet", {
    extend: "Ext.Container",
    alias: "widget.fieldset",
    requires: ["Ext.Title"],
    config: {
        baseCls: Ext.baseCSSPrefix + "form-fieldset",
        title: null,
        instructions: null,
        layout: {
            type: "vbox",
            align: "stretch"
        }
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
        clearTime: function (e, i) {
            if (i) {
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
            var i = Ext.Date.clone(g),
                c = Ext.Date;
            if (!f || h === 0) {
                return i
            }
            switch (f.toLowerCase()) {
            case Ext.Date.MILLI:
                i.setMilliseconds(i.getMilliseconds() + h);
                break;
            case Ext.Date.SECOND:
                i.setSeconds(i.getSeconds() + h);
                break;
            case Ext.Date.MINUTE:
                i.setMinutes(i.getMinutes() + h);
                break;
            case Ext.Date.HOUR:
                i.setHours(i.getHours() + h);
                break;
            case Ext.Date.DAY:
                i.setDate(i.getDate() + h);
                break;
            case Ext.Date.MONTH:
                var e = g.getDate();
                if (e > 28) {
                    e = Math.min(e, Ext.Date.getLastDateOfMonth(Ext.Date.add(Ext.Date.getFirstDateOfMonth(g), "mo", h)).getDate())
                }
                i.setDate(e);
                i.setMonth(g.getMonth() + h);
                break;
            case Ext.Date.YEAR:
                i.setFullYear(g.getFullYear() + h);
                break
            }
            return i
        },
        between: function (d, f, c) {
            var e = d.getTime();
            return f.getTime() <= e && e <= c.getTime()
        }
    };
    var a = Ext.DateExtras;
    Ext.apply(Ext.Date, a);
    Ext.apply(Ext.util.Date, a)
})();


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
        maskMap: false,
        maskMapCls: Ext.baseCSSPrefix + "mask-map",
        mapOptions: {}
    },
    constructor: function () {
        this.callParent(arguments);
        this.element.setVisibilityMode(Ext.Element.OFFSETS);
        if (!(window.google || {}).maps) {
            this.setHtml("Google Maps API is required")
        }
    },
    updateUseCurrentLocation: function (a) {
        this.setGeo(a);
        if (!a) {
            this.renderMap()
        }
    },
    updateMaskMap: function (a) {
        if (a) {
            this.element.mask(null, this.getMaskMapCls())
        } else {
            this.element.unmask()
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
    renderMap: function () {
        var d = this,
            f = (window.google || {}).maps,
            b = d.element,
            a = d.getMapOptions(),
            e = d.getMap(),
            c;
        if (!d.isPainted()) {
            d.on({
                painted: "renderMap",
                scope: d,
                single: true
            });
            return
        }
        if (f) {
            if (Ext.is.iPad) {
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
                Ext.fly(b.dom.firstChild).remove()
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
    onDestroy: function () {
        Ext.destroy(this.getGeo());
        var a = this.getMap();
        if (this.getMaskMap() && this.mask) {
            this.element.unmask()
        }
        if (a && (window.google || {}).maps) {
            google.maps.event.clearInstanceListeners(a)
        }
        this.callParent()
    }
}, function () {
    Ext.deprecateClassMethod(this, "getState", "getMapOptions");
    Ext.deprecateClassMethod(this, "update", "setMapCenter")
});


Ext.define("Kitchensink.view.Map", {
    extend: "Ext.Map",
    config: {
        useCurrentLocation: true
    }
});


Ext.define("Ext.ActionSheet", {
    extend: "Ext.Sheet",
    alias: "widget.actionsheet",
    requires: ["Ext.Button"],
    config: {
        cls: Ext.baseCSSPrefix + "sheet-action",
        left: 0,
        right: 0,
        bottom: 0,
        centered: false,
        height: "auto",
        layout: {
            type: "vbox",
            align: "stretch"
        },
        defaultType: "button"
    }
});


Ext.define("Ext.Video", {
    extend: "Ext.Media",
    xtype: "video",
    config: {
        posterUrl: null,
        cls: Ext.baseCSSPrefix + "video"
    },
    initialize: function () {
        this.callParent();
        if (Ext.os.is.Android) {
            var a = this.ghost = this.element.append(Ext.Element.create({
                cls: Ext.baseCSSPrefix + "video-ghost",
                style: "background-image: url(" + this.getPosterUrl() + ");"
            }));
            a.on({
                tap: "onGhostTap",
                scope: this
            })
        }
    },
    onGhostTap: function () {
        var a = this;
        setTimeout(function () {
            a.play();
            a.media.hide()
        }, 200)
    },
    template: [{
        tag: "video",
        reference: "media",
        classList: [Ext.baseCSSPrefix + "media"]
    }],
    updatePosterUrl: function (b) {
        var a = this.ghost;
        if (a) {
            a.dom.style.backgroundImage = b ? "url(" + b + ")" : ""
        }
    }
});


Ext.define("Kitchensink.view.Video", {
    extend: "Ext.Container",
    requires: ["Ext.Video"],
    config: {
        layout: "fit",
        items: [{
            xtype: "video",
            url: "../video/space.mp4",
            loop: true,
            posterUrl: "../video/Screenshot.png"
        }]
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
        if (Ext.is.Phone) {
            a.element.show()
        }
    },
    onDeactivate: function () {
        var a = this;
        a.callParent();
        if (Ext.is.Phone) {
            a.element.hide()
        }
    },
    getTemplate: function () {
        var a = Ext.baseCSSPrefix;
        if (Ext.feature.has.Audio) {
            return [{
                reference: "media",
                tag: "audio",
                classList: [a + "component"]
            }]
        } else {
            return [{
                reference: "media",
                tag: "audio",
                classList: [a + "component"]
            }]
        }
    }
});


Ext.define("Kitchensink.view.Audio", {
    extend: "Ext.Container",
    requires: ["Ext.Audio"],
    config: {
        layout: Ext.os.is.Android ? {
            type: "vbox",
            pack: "center",
            align: "center"
        } : "fit",
        items: Ext.os.is.Android ? [{
            xtype: "audio",
            cls: "myAudio",
            url: "../audio/crash.mp3",
            loop: true,
            enableControls: false
        }, {
            xtype: "button",
            text: "Play audio",
            margin: 20,
            handler: function () {
                var a = this.getParent().down("audio");
                if (a.isPlaying()) {
                    a.pause();
                    this.setText("Play audio")
                } else {
                    a.play();
                    this.setText("Pause audio")
                }
            }
        }] : [{
            xtype: "audio",
            cls: "myAudio",
            url: "../audio/crash.mp3",
            loop: true
        }]
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
    applyTitle: function (a) {
        if (typeof a == "string") {
            a = {
                title: a
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
});


Ext.define("Ext.data.NodeStore", {
    extend: "Ext.data.Store",
    alias: "store.node",
    requires: ["Ext.data.NodeInterface"],
    node: null,
    recursive: false,
    rootVisible: false,
    constructor: function (a) {
        var c = this,
            b;
        a = a || {};
        Ext.apply(c, a);
        a.proxy = {
            type: "proxy"
        };
        c.callParent([a]);
        b = c.node;
        if (b) {
            c.node = null;
            c.setNode(b)
        }
    },
    setNode: function (b) {
        var a = this;
        if (a.node && a.node != b) {
            a.mun(a.node, {
                expand: a.onNodeExpand,
                collapse: a.onNodeCollapse,
                append: a.onNodeAppend,
                insert: a.onNodeInsert,
                remove: a.onNodeRemove,
                sort: a.onNodeSort,
                scope: a
            });
            a.node = null
        }
        if (b !== a.node) {
            Ext.data.NodeInterface.decorate(b);
            a.removeAll();
            if (a.rootVisible) {
                a.add(b)
            } else {
                if (!b.isExpanded()) {
                    b.expand()
                }
            }
            a.mon(b, {
                expand: a.onNodeExpand,
                collapse: a.onNodeCollapse,
                append: a.onNodeAppend,
                insert: a.onNodeInsert,
                remove: a.onNodeRemove,
                sort: a.onNodeSort,
                scope: a
            });
            a.node = b;
            if (b.isExpanded() && b.isLoaded()) {
                a.onNodeExpand(b, b.childNodes, true)
            }
        }
    },
    onNodeSort: function (b, c) {
        var a = this;
        if ((a.indexOf(b) !== -1 || (b === a.node && !a.rootVisible) && b.isExpanded())) {
            a.onNodeCollapse(b, c, true);
            a.onNodeExpand(b, c, true)
        }
    },
    onNodeExpand: function (f, d, c) {
        var h = this,
            a = h.indexOf(f) + 1,
            g = d ? d.length : 0,
            e, b;
        if (!h.recursive && f !== h.node) {
            return
        }
        if (f !== this.node && !h.isVisible(f)) {
            return
        }
        if (!c && h.fireEvent("beforeexpand", f, d, a) === false) {
            return
        }
        if (g) {
            for (e = 0; e < g; e++) {
                b = d[e];
                if (h.data.indexOf(b) === -1) {
                    h.insert(a, b);
                    a++
                }
                if (b.isExpanded()) {
                    if (b.isLoaded()) {
                        h.onNodeExpand(b, b.childNodes, true)
                    } else {
                        b.set("expanded", false);
                        b.expand()
                    }
                }
            }
        }
        if (!c) {
            h.fireEvent("expand", f, d)
        }
    },
    onNodeCollapse: function (f, c, b) {
        var h = this,
            g = c.length,
            e = h.indexOf(f) + 1,
            d, a;
        if (!h.recursive && f !== h.node) {
            return
        }
        if (!b && h.fireEvent("beforecollapse", f, c, e) === false) {
            return
        }
        for (d = 0; d < g; d++) {
            a = c[d];
            h.remove(a);
            if (a.isExpanded()) {
                h.onNodeCollapse(a, a.childNodes, true)
            }
        }
        if (!b) {
            h.fireEvent("collapse", f, c, e)
        }
    },
    onNodeAppend: function (d, f, b) {
        var e = this,
            a, c;
        if (e.isVisible(f)) {
            if (b === 0) {
                a = d
            } else {
                c = f.previousSibling;
                while (c.isExpanded() && c.lastChild) {
                    c = c.lastChild
                }
                a = c
            }
            e.insert(e.indexOf(a) + 1, f);
            if (!f.isLeaf() && f.isExpanded()) {
                if (f.isLoaded()) {
                    e.onNodeExpand(f, f.childNodes, true)
                } else {
                    f.set("expanded", false);
                    f.expand()
                }
            }
        }
    },
    onNodeInsert: function (c, e, a) {
        var d = this,
            b = this.indexOf(a);
        if (b != -1 && d.isVisible(e)) {
            d.insert(b, e);
            if (!e.isLeaf() && e.isExpanded()) {
                if (e.isLoaded()) {
                    d.onNodeExpand(e, e.childNodes, true)
                } else {
                    e.set("expanded", false);
                    e.expand()
                }
            }
        }
    },
    onNodeRemove: function (b, d, a) {
        var c = this;
        if (c.indexOf(d) != -1) {
            if (!d.isLeaf() && d.isExpanded()) {
                c.onNodeCollapse(d, d.childNodes, true)
            }
            c.remove(d)
        }
    },
    isVisible: function (b) {
        var a = b.parentNode;
        while (a) {
            if (a === this.node && !this.rootVisible && a.isExpanded()) {
                return true
            }
            if (this.indexOf(a) === -1 || !a.isExpanded()) {
                return false
            }
            a = a.parentNode
        }
        return true
    }
});


Ext.define("Ext.data.TreeStore", {
    extend: "Ext.data.AbstractStore",
    alias: "store.tree",
    requires: ["Ext.data.Tree", "Ext.data.NodeInterface", "Ext.data.NodeStore"],
    clearOnLoad: true,
    nodeParam: "node",
    defaultRootId: "root",
    defaultRootProperty: "children",
    folderSort: false,
    constructor: function (c) {
        var d = this,
            b, a;
        c = Ext.apply({}, c);
        a = c.fields || d.fields;
        if (!a) {
            c.fields = [{
                name: "text",
                type: "string"
            }]
        }
        d.callParent([c]);
        d.tree = Ext.create("Ext.data.Tree");
        d.relayEvents(d.tree, ["append", "remove", "move", "insert", "beforeappend", "beforeremove", "beforemove", "beforeinsert", "expand", "collapse", "beforeexpand", "beforecollapse", "rootchange"]);
        d.tree.on({
            scope: d,
            remove: d.onNodeRemove,
            beforeexpand: d.onBeforeNodeExpand,
            beforecollapse: d.onBeforeNodeCollapse,
            append: d.onNodeAdded,
            insert: d.onNodeAdded
        });
        d.onBeforeSort();
        b = d.root;
        if (b) {
            delete d.root;
            d.setRootNode(b)
        }
    },
    setProxy: function (c) {
        var a, b;
        if (c instanceof Ext.data.proxy.Proxy) {
            b = Ext.isEmpty(c.getReader().root)
        } else {
            if (Ext.isString(c)) {
                b = true
            } else {
                a = c.reader;
                b = !(a && !Ext.isEmpty(a.root))
            }
        }
        c = this.callParent(arguments);
        if (b) {
            a = c.getReader();
            a.root = this.defaultRootProperty;
            a.buildExtractors(true)
        }
    },
    onBeforeSort: function () {
        if (this.folderSort) {
            this.sort({
                property: "leaf",
                direction: "ASC"
            }, "prepend", false)
        }
    },
    onBeforeNodeExpand: function (b, c, a) {
        if (b.isLoaded()) {
            Ext.callback(c, a || b, [b.childNodes])
        } else {
            if (b.isLoading()) {
                this.on("load", function () {
                    Ext.callback(c, a || b, [b.childNodes])
                }, this, {
                    single: true
                })
            } else {
                this.read({
                    node: b,
                    callback: function () {
                        Ext.callback(c, a || b, [b.childNodes])
                    }
                })
            }
        }
    },
    getNewRecords: function () {
        return Ext.Array.filter(this.tree.flatten(), this.filterNew)
    },
    getUpdatedRecords: function () {
        return Ext.Array.filter(this.tree.flatten(), this.filterUpdated)
    },
    onBeforeNodeCollapse: function (b, c, a) {
        c.call(a || b, b.childNodes)
    },
    onNodeRemove: function (a, b) {
        var c = this.removed;
        if (!b.isReplace && Ext.Array.indexOf(c, b) == -1) {
            c.push(b)
        }
    },
    onNodeAdded: function (d, e) {
        var c = this.getProxy(),
            a = c.getReader(),
            f = e.raw || e.data,
            g, b;
        Ext.Array.remove(this.removed, e);
        if (!e.isLeaf() && !e.isLoaded()) {
            g = a.getRoot(f);
            if (g) {
                this.fillNode(e, a.extractData(g));
                delete f[a.root]
            }
        }
    },
    setRootNode: function (a) {
        var b = this;
        a = a || {};
        if (!a.isNode) {
            Ext.applyIf(a, {
                id: b.defaultRootId,
                text: "Root",
                allowDrag: false
            });
            a = Ext.ModelManager.create(a, b.model)
        }
        Ext.data.NodeInterface.decorate(a);
        b.getProxy().getReader().buildExtractors(true);
        b.tree.setRootNode(a);
        if (!a.isLoaded() && a.isExpanded()) {
            b.load({
                node: a
            })
        }
        return a
    },
    getRootNode: function () {
        return this.tree.getRootNode()
    },
    getNodeById: function (a) {
        return this.tree.getNodeById(a)
    },
    load: function (b) {
        b = b || {};
        b.params = b.params || {};
        var d = this,
            c = b.node || d.tree.getRootNode(),
            a;
        if (!c) {
            c = d.setRootNode({
                expanded: true
            })
        }
        if (d.clearOnLoad) {
            c.removeAll()
        }
        Ext.applyIf(b, {
            node: c
        });
        b.params[d.nodeParam] = c ? c.getId() : "root";
        if (c) {
            c.set("loading", true)
        }
        return d.callParent([b])
    },
    fillNode: function (f, b) {
        var e = this,
            d = b ? b.length : 0,
            c = 0,
            a;
        if (d && e.sortOnLoad && !e.remoteSort && e.sorters && e.sorters.items) {
            a = Ext.create("Ext.util.MixedCollection");
            a.addAll(b);
            a.sort(e.sorters.items);
            b = a.items
        }
        f.set("loaded", true);
        for (; c < d; c++) {
            f.appendChild(b[c], undefined, true)
        }
        return b
    },
    onProxyLoad: function (b) {
        var d = this,
            e = b.wasSuccessful(),
            a = b.getRecords(),
            c = b.node;
        d.loading = false;
        c.set("loading", false);
        if (e) {
            a = d.fillNode(c, a)
        }
        d.fireEvent("read", d, b.node, a, e);
        d.fireEvent("load", d, b.node, a, e);
        Ext.callback(b.callback, b.scope || d, [a, b, e])
    },
    onCreateRecords: function (c, d, k) {
        if (k) {
            var e = 0,
                a = c.length,
                j = d.records,
                g, f, b, h;
            for (; e < a; ++e) {
                f = c[e];
                b = j[e];
                if (b) {
                    g = b.parentNode;
                    if (g) {
                        b.isReplace = true;
                        g.replaceChild(f, b);
                        delete b.isReplace
                    }
                    f.phantom = false
                }
            }
        }
    },
    onUpdateRecords: function (c, d, k) {
        if (k) {
            var j = this,
                f = 0,
                a = c.length,
                e = j.data,
                b, h, g;
            for (; f < a; ++f) {
                g = c[f];
                b = j.tree.getNodeById(g.getId());
                h = b.parentNode;
                if (h) {
                    b.isReplace = true;
                    h.replaceChild(g, b);
                    b.isReplace = false
                }
            }
        }
    },
    onDestroyRecords: function (b, a, c) {
        if (c) {
            this.removed = []
        }
    },
    removeAll: function () {
        this.getRootNode().destroy(true);
        this.fireEvent("clear", this)
    },
    doSort: function (a) {
        var b = this;
        if (b.remoteSort) {
            b.load()
        } else {
            b.tree.sort(a, true);
            b.fireEvent("datachanged", b)
        }
        b.fireEvent("sort", b)
    }
});
(function () {
    var b = {
        text: "Animations",
        card: false,
        items: [{
            text: "Slide",
            card: false,
            preventHide: true,
            animation: {
                type: "slide",
                direction: "left",
                duration: 300
            },
            leaf: true
        }]
    };
    if (Ext.os.deviceType == "Desktop" || Ext.os.name == "iOS") {
        b.items.push({
            text: "Pop",
            card: false,
            preventHide: true,
            animation: {
                type: "pop",
                duration: 300,
                scaleOnExit: true
            },
            leaf: true
        }, {
            text: "Fade",
            card: false,
            preventHide: true,
            animation: {
                type: "fade",
                duration: 300
            },
            leaf: true
        })
    }
    var a = {
        items: [{
            text: "User Interface",
            cls: "launchscreen",
            items: [{
                text: "Buttons",
                leaf: true
            }, {
                text: "Forms",
                leaf: true
            }, {
                text: "List",
                leaf: true
            }, {
                text: "Nested List",
                view: "NestedList",
                leaf: true
            }, {
                text: "Icons",
                leaf: true
            }, {
                text: "Toolbars",
                leaf: true
            }, {
                text: "Carousel",
                leaf: true
            }, {
                text: "Tabs",
                leaf: true
            }, {
                text: "Bottom Tabs",
                view: "BottomTabs",
                leaf: true
            }, {
                text: "Map",
                view: "Map",
                leaf: true
            }, {
                text: "Overlays",
                leaf: true
            }]
        }]
    };
    a.items.push(b, {
        text: "Touch Events",
        view: "TouchEvents",
        leaf: true
    }, {
        text: "Data",
        items: [{
            text: "Nested Loading",
            view: "NestedLoading",
            leaf: true
        }, {
            text: "JSONP",
            leaf: true
        }, {
            text: "YQL",
            leaf: true
        }, {
            text: "Ajax",
            leaf: true
        }]
    }, {
        text: "Media",
        items: [{
            text: "Video",
            leaf: true
        }, {
            text: "Audio",
            leaf: true
        }]
    });
    

Ext.define("Kitchensink.store.Demos", {
        extend: "Ext.data.TreeStore",
        model: "Kitchensink.model.Demo",
        requires: ["Kitchensink.model.Demo"],
        root: a,
        defaultRootProperty: "items"
    })
})();


Ext.define("Ext.tab.Bar", {
    extend: "Ext.Toolbar",
    alternateClassName: "Ext.TabBar",
    xtype: "tabbar",
    requires: ["Ext.tab.Tab"],
    config: {
        activeTab: null,
        baseCls: Ext.baseCSSPrefix + "tabbar",
        defaultType: "tab",
        layout: {
            type: "hbox",
            align: "middle",
            pack: "left"
        }
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
    applyActiveTab: function (a) {
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
    updateActiveTab: function (b, a) {
        this.fireAction("tabchange", [this, b, a], "doActiveTabChange")
    },
    doActiveTabChange: function (a, c, b) {
        if (c) {
            c.setActive(true)
        }
        if (b) {
            b.setActive(false)
        }
    },
    parseActiveTab: function (b) {
        var a = this.getItems();
        if (typeof b == "number") {
            return this.getInnerItems()[b]
        } else {
            if (typeof b == "string") {
                b = Ext.getCmp(b)
            }
        }
        return b
    }
});


Ext.define("Ext.tab.Panel", {
    extend: "Ext.Container",
    xtype: ["tabpanel"],
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
    initialize: function () {
        this.callParent();
        this.on({
            tabchange: "doTabChange",
            delegate: "> tabbar",
            scope: this
        })
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
    doSetActiveItem: function (e, a) {
        if (e) {
            var b = this.getInnerItems(),
                f = b.indexOf(a),
                d = b.indexOf(e),
                c = f > d;
            this.getLayout().getAnimation().setReverse(c);
            this.callParent(arguments);
            if (d != -1) {
                this.getTabBar().setActiveTab(d)
            }
        }
    },
    doTabChange: function (a, d, c) {
        var b = a.indexOf(d);
        this.setActiveItem(b)
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
        var j = this;
        if (!e.isInnerItem()) {
            return j.callParent(arguments)
        }
        var c = j.getTabBar(),
            m = e.getInitialConfig(),
            d = m.tab || {},
            g = m.title,
            i = m.iconCls,
            n = m.badgeText,
            b = j.getInnerItems(),
            h = b.indexOf(e),
            k = c.getItems(),
            a = j.getInnerItems(),
            l = (k.length >= a.length) && k.getAt(h),
            f;
        if (g && !d.title) {
            d.title = g
        }
        if (i && !d.iconCls) {
            d.iconCls = i
        }
        if (n && !d.badgeText) {
            d.badgeText = n
        }
        f = Ext.factory(d, Ext.tab.Tab, l);
        if (!l) {
            c.insert(h, f)
        }
        j.callParent(arguments)
    }
});
Ext.regModel("Contact", {
    fields: ["firstName", "lastName"]
});
Ext.create("Ext.data.Store", {
    id: "ListStore",
    model: "Contact",
    sorters: "firstName",
    getGroupString: function (a) {
        return a.get("firstName")[0]
    },
    data: [{
        firstName: "Julio",
        lastName: "Benesh"
    }, {
        firstName: "Julio",
        lastName: "Minich"
    }, {
        firstName: "Tania",
        lastName: "Ricco"
    }, {
        firstName: "Odessa",
        lastName: "Steuck"
    }, {
        firstName: "Nelson",
        lastName: "Raber"
    }, {
        firstName: "Tyrone",
        lastName: "Scannell"
    }, {
        firstName: "Allan",
        lastName: "Disbrow"
    }, {
        firstName: "Cody",
        lastName: "Herrell"
    }, {
        firstName: "Julio",
        lastName: "Burgoyne"
    }, {
        firstName: "Jessie",
        lastName: "Boedeker"
    }, {
        firstName: "Allan",
        lastName: "Leyendecker"
    }, {
        firstName: "Javier",
        lastName: "Lockley"
    }, {
        firstName: "Guy",
        lastName: "Reasor"
    }, {
        firstName: "Jamie",
        lastName: "Brummer"
    }, {
        firstName: "Jessie",
        lastName: "Casa"
    }, {
        firstName: "Marcie",
        lastName: "Ricca"
    }, {
        firstName: "Gay",
        lastName: "Lamoureaux"
    }, {
        firstName: "Althea",
        lastName: "Sturtz"
    }, {
        firstName: "Kenya",
        lastName: "Morocco"
    }, {
        firstName: "Rae",
        lastName: "Pasquariello"
    }, {
        firstName: "Ted",
        lastName: "Abundis"
    }, {
        firstName: "Jessie",
        lastName: "Schacherer"
    }, {
        firstName: "Jamie",
        lastName: "Gleaves"
    }, {
        firstName: "Hillary",
        lastName: "Spiva"
    }, {
        firstName: "Elinor",
        lastName: "Rockefeller"
    }, {
        firstName: "Dona",
        lastName: "Clauss"
    }, {
        firstName: "Ashlee",
        lastName: "Kennerly"
    }, {
        firstName: "Alana",
        lastName: "Wiersma"
    }, {
        firstName: "Kelly",
        lastName: "Holdman"
    }, {
        firstName: "Mathew",
        lastName: "Lofthouse"
    }, {
        firstName: "Dona",
        lastName: "Tatman"
    }, {
        firstName: "Clayton",
        lastName: "Clear"
    }, {
        firstName: "Rosalinda",
        lastName: "Urman"
    }, {
        firstName: "Cody",
        lastName: "Sayler"
    }, {
        firstName: "Odessa",
        lastName: "Averitt"
    }, {
        firstName: "Ted",
        lastName: "Poage"
    }, {
        firstName: "Penelope",
        lastName: "Gayer"
    }, {
        firstName: "Katy",
        lastName: "Bluford"
    }, {
        firstName: "Kelly",
        lastName: "Mchargue"
    }, {
        firstName: "Kathrine",
        lastName: "Gustavson"
    }, {
        firstName: "Kelly",
        lastName: "Hartson"
    }, {
        firstName: "Carlene",
        lastName: "Summitt"
    }, {
        firstName: "Kathrine",
        lastName: "Vrabel"
    }, {
        firstName: "Roxie",
        lastName: "Mcconn"
    }, {
        firstName: "Margery",
        lastName: "Pullman"
    }, {
        firstName: "Avis",
        lastName: "Bueche"
    }, {
        firstName: "Esmeralda",
        lastName: "Katzer"
    }, {
        firstName: "Tania",
        lastName: "Belmonte"
    }, {
        firstName: "Malinda",
        lastName: "Kwak"
    }, {
        firstName: "Tanisha",
        lastName: "Jobin"
    }, {
        firstName: "Kelly",
        lastName: "Dziedzic"
    }, {
        firstName: "Darren",
        lastName: "Devalle"
    }, {
        firstName: "Julio",
        lastName: "Buchannon"
    }, {
        firstName: "Darren",
        lastName: "Schreier"
    }, {
        firstName: "Jamie",
        lastName: "Pollman"
    }, {
        firstName: "Karina",
        lastName: "Pompey"
    }, {
        firstName: "Hugh",
        lastName: "Snover"
    }, {
        firstName: "Zebra",
        lastName: "Evilias"
    }]
});


Ext.define("Kitchensink.view.List", {
    extend: "Ext.tab.Panel",
    config: {
        activeItem: 2,
        tabBar: {
            docked: "top",
            layout: {
                pack: "center"
            }
        },
        items: [{
            title: "Simple",
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
                store: "ListStore",
                itemTpl: '<div class="contact"><strong>{firstName}</strong> {lastName}</div>'
            }]
        }, {
            title: "Grouped",
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
                store: "ListStore",
                itemTpl: '<div class="contact"><strong>{firstName}</strong> {lastName}</div>',
                grouped: true,
                indexBar: true
            }]
        }, {
            title: "Disclosure",
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
                onItemDisclosure: function (a, c, b) {
                    Ext.Msg.alert("Tap", "Disclose more info for " + a.get("firstName"), Ext.emptyFn)
                },
                store: "ListStore",
                itemTpl: '<div class="contact"><strong>{firstName}</strong> {lastName}</div>'
            }]
        }]
    }
});


Ext.define("Kitchensink.view.Icons", {
    extend: "Ext.tab.Panel",
    config: {
        activeTab: 0,
        layout: {
            animation: {
                type: "slide",
                duration: 250
            }
        },
        tabBar: {
            layout: {
                pack: "center",
                align: "center"
            },
            docked: "bottom",
            scrollable: {
                direction: "horizontal",
                indicators: false
            }
        },
        items: [{
            iconCls: "bookmarks",
            title: "Bookmarks",
            cls: "card card3",
            html: "Both toolbars and tabbars have built-in, ready to use icons. Styling custom icons is no hassle.<p><small>If you can&#8217;t see all of the buttons below, try scrolling left/right.</small></p>"
        }, {
            iconCls: "download",
            title: "Download",
            cls: "card card3",
            html: "Pressed Download"
        }, {
            iconCls: "favorites",
            title: "Favorites",
            cls: "card card3",
            html: "Pressed Favorites"
        }, {
            iconCls: "info",
            title: "Info",
            cls: "card card3",
            html: "Pressed Info"
        }, {
            iconCls: "more",
            title: "More",
            cls: "card card3",
            html: "Pressed More"
        }, {
            iconCls: "search",
            title: "Search",
            cls: "card card3",
            html: "Pressed Search"
        }, {
            iconCls: "settings",
            title: "Settings",
            cls: "card card3",
            html: "Pressed Settings"
        }, {
            iconCls: "team",
            title: "Team",
            cls: "card card3",
            html: "Pressed Team"
        }, {
            iconCls: "time",
            title: "Time",
            cls: "card card3",
            html: "Pressed Time"
        }, {
            iconCls: "user",
            title: "User",
            cls: "card card3",
            html: "Pressed User"
        }, {
            xtype: "toolbar",
            ui: "light",
            docked: "top",
            height: 47,
            scrollable: {
                direction: "horizontal",
                indicators: false
            },
            defaults: {
                iconMask: true,
                ui: "plain"
            },
            items: [{
                iconCls: "action"
            }, {
                iconCls: "add"
            }, {
                iconCls: "arrow_up"
            }, {
                iconCls: "arrow_right"
            }, {
                iconCls: "arrow_down"
            }, {
                iconCls: "arrow_left"
            }, {
                iconCls: "compose"
            }, {
                iconCls: "delete"
            }, {
                iconCls: "refresh"
            }, {
                iconCls: "reply"
            }, {
                iconCls: "search"
            }, {
                iconCls: "star"
            }, {
                iconCls: "home"
            }, {
                iconCls: "locate"
            }, {
                iconCls: "maps"
            }, {
                iconCls: "trash"
            }],
            layout: {
                pack: "center",
                align: "center"
            }
        }]
    }
});


Ext.define("Kitchensink.view.BottomTabs", {
    extend: "Ext.tab.Panel",
    config: {
        activeTab: 0,
        layout: {
            animation: {
                type: "slide",
                duration: 250
            }
        },
        tabBar: {
            layout: {
                pack: "center",
                align: "center"
            },
            docked: "bottom",
            scrollable: {
                direction: "horizontal",
                indicators: false
            }
        },
        items: [{
            title: "About",
            html: '<p>Docking tabs to the bottom will automatically change their style. The tabs below are ui="light", though the standard type is dark. Badges (like the 4 below) can be added by setting <code>badgeText</code> when creating a tab/card or by using <code>setBadge()</code> on the tab later.</p>',
            iconCls: "info",
            cls: "card card1"
        }, {
            title: "Favorites",
            html: "Favorites Card",
            iconCls: "favorites",
            cls: "card card2",
            badgeText: "4"
        }, {
            title: "Downloads",
            id: "tab3",
            html: "Downloads Card",
            badgeText: "Text can go here too, but it will be cut off if it is too long.",
            cls: "card card3",
            iconCls: "download"
        }, {
            title: "Settings",
            html: "Settings Card",
            cls: "card card4",
            iconCls: "settings"
        }, {
            title: "User",
            html: "User Card",
            cls: "card card5",
            iconCls: "user"
        }]
    }
});


Ext.define("Kitchensink.view.Tabs", {
    extend: "Ext.tab.Panel",
    config: {
        ui: "dark",
        tabBarPosition: "top",
        activeTab: 1,
        items: [{
            title: "Tab 1",
            html: "The tabs above are also sortable.<br />(tap and hold)",
            cls: "card card5"
        }, {
            title: "Tab 2",
            html: "Tab 2",
            cls: "card card4"
        }, {
            title: "Tab 3",
            html: "Tab 3",
            cls: "card card3"
        }]
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
        requiredCls: Ext.baseCSSPrefix + "field-required"
    },
    getElementConfig: function () {
        var a = Ext.baseCSSPrefix;
        return {
            reference: "element",
            className: "x-container",
            children: [{
                reference: "label",
                cls: a + "form-label",
                children: [{
                    tag: "span"
                }]
            }, {
                reference: "innerElement",
                cls: a + "component-outer"
            }]
        }
    },
    updateLabel: function (b, d) {
        var a = this.renderElement,
            c = Ext.baseCSSPrefix;
        if (b) {
            this.label.down("span").update(b);
            a.addCls(c + "field-labeled")
        } else {
            a.removeCls(c + "field-labeled")
        }
    },
    updateLabelAlign: function (b, c) {
        var a = this.renderElement,
            d = Ext.baseCSSPrefix;
        if (b) {
            a.addCls(d + "label-align-" + b)
        }
        if (c) {
            a.removeCls(d + "label-align-" + c)
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
            this.label.setStyle("width", a)
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
        this.originalValue = this.getValue()
    },
    reset: Ext.emptyFn,
    isDirty: function () {
        return false
    }
}, function () {
    var a = this.prototype;
    this.override({
        constructor: function (b) {
            b = b || {};
            var c = function (e, f, d) {
                    if (b.hasOwnProperty(e)) {
                        if (f) {
                            b[f] = b[f] || {};
                            b[f][(d) ? d : e] = b[f][(d) ? d : e] || b[e]
                        } else {
                            b[d] = b[e]
                        }
                        delete b[e]
                    }
                };
            c("inputCls", "input", "cls");
            c("fieldCls", "input", "cls");
            c("fieldLabel", null, "label");
            c("useClearIcon", null, "clearIcon");
            this.callOverridden(arguments)
        }
    });
    Ext.Object.redefineProperty(a, "fieldEl", function () {
        return this.getInput().input
    });
    Ext.Object.redefineProperty(a, "labelEl", function () {
        return this.getLabel().element
    })
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
        var a = this.getComponent();
        var b = a.getChecked();
        this._checked = b;
        return this._checked
    },
    getValue: function () {
        return this.getChecked()
    },
    setValue: function (a) {
        return this.setChecked(a)
    },
    setChecked: function (a) {
        this.getChecked();
        this.updateChecked(a);
        this._checked = a
    },
    updateChecked: function (a) {
        var b = this.getComponent();
        b.setChecked(a)
    },
    onMaskTap: function (a, c) {
        var b = this;
        if (b.getDisabled()) {
            return false
        }
        a.input.dom.checked = !a.input.dom.checked;
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


Ext.define("Ext.form.Panel", {
    alternateClassName: "Ext.form.FormPanel",
    extend: "Ext.Panel",
    xtype: "formpanel",
    requires: ["Ext.XTemplate", "Ext.field.Checkbox", "Ext.Ajax"],
    config: {
        cls: Ext.baseCSSPrefix + "form",
        standardSubmit: false,
        url: null,
        elConfig: {
            tag: "form"
        },
        baseParams: null,
        waitTpl: '<div class="{cls}">{message}&hellip;</div>',
        submitOnAction: true,
        maskTarget: null,
        record: null,
        layout: {
            type: "vbox",
            align: "stretch"
        },
        scrollable: {
            scrollMethod: "scrollposition"
        }
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
            scope: this
        })
    },
    applyWaitTpl: function (a) {
        if (a) {
            if (Ext.isArray(a) || typeof a === "string") {
                a = Ext.create("Ext.XTemplate", a)
            }
        }
        return a
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
            method: b.method || "post",
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
                c.showMask(a.waitMsg)
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
                callback: function (e, j, f) {
                    var h = this,
                        i = f.responseText,
                        g;
                    h.hideMask();
                    g = function () {
                        if (Ext.isFunction(a.failure)) {
                            a.failure.call(a.scope || h, h, f, i)
                        }
                        h.fireEvent("exception", h, f)
                    };
                    if (j) {
                        f = Ext.decode(i);
                        j = !! f.success;
                        if (j) {
                            if (Ext.isFunction(a.success)) {
                                a.success.call(a.scope || h, h, f, i)
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
    updateRecord: function (b, e) {
        var a, c, d;
        if (b && (a = b.fields)) {
            c = this.getValues(e);
            for (d in c) {
                if (c.hasOwnProperty(d) && a.containsKey(d)) {
                    b.set(d, c[d])
                }
            }
        }
        return this
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
        this.items.each(c);
        return (b) ? (a[b] || []) : a
    },
    getFieldsFromItem: Ext.emptyFn,
    showMask: function (a, d) {
        a = Ext.isString(a) ? {
            message: a
        } : a;
        var c = this,
            b = c.getWaitTpl();
        if (a && b) {
            d = Ext.get(d || a.target) || c.getEl();
            c.setMaskTarget(d);
            if (d) {
                d.mask(b.apply(a))
            }
        }
        return c
    },
    hideMask: function () {
        var b = this,
            a = b.getMaskTarget();
        if (a) {
            a.unmask();
            b.setMaskTarget(null)
        }
        return b
    }
}, function () {
    this.override({
        loadRecord: function (a) {
            return this.setRecord.apply(this, arguments)
        },
        loadModel: function () {
            return this.setRecord.apply(this, arguments)
        },
        constructor: function (a) {
            if (a && a.hasOwnProperty("waitMsgTarget")) {
                a.maskTarget = a.waitMsgTarget;
                delete a.waitMsgTarget
            }
            this.callParent([a])
        }
    });
    Ext.form.Panel.prototype.load = Ext.form.Panel.prototype.loadModel
});


Ext.define("Ext.field.Radio", {
    extend: "Ext.field.Checkbox",
    xtype: "radiofield",
    alternateClassName: "Ext.form.Radio",
    isRadio: true,
    config: {
        ui: "radio",
        component: {
            type: "radio",
            inputCls: Ext.baseCSSPrefix + "input-radio"
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
        })
    },
    updateValue: function (b) {
        var a = this.getComponent();
        if (a) {
            a.setValue(b)
        }
        this[b ? "showClearIcon" : "hideClearIcon"]()
    },
    getValue: function () {
        var a = this;
        a._value = a.getComponent().getValue();
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
        a.setValue("")
    },
    onChange: function (b, c, a) {
        b.fireEvent("change", this, c, a)
    },
    onFocus: function (a) {
        this.fireEvent("focus", this, a)
    },
    onBlur: function (a) {
        this.fireEvent("blur", this, a)
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
    }
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
        tabIndex: -1
    },
    constructor: function () {
        this.callParent(arguments);
        if (!this.getValue()) {
            this.setValue(this.getDefaultValue())
        }
    },
    updateComponent: function (b) {
        this.callParent(arguments);
        var a = this.getCls();
        if (b) {
            this.spinDownButton = b.element.createChild({
                cls: a + "-button " + a + "-button-down",
                html: "-"
            });
            b.element.insertFirst(this.spinDownButton);
            this.spinUpButton = b.element.createChild({
                cls: a + "-button " + a + "-button-up",
                html: "+"
            });
            this.downRepeater = this.createRepeater(this.spinDownButton, this.onSpinDown);
            this.upRepeater = this.createRepeater(this.spinUpButton, this.onSpinUp)
        }
    },
    applyValue: function (a) {
        a = parseFloat(a);
        if (isNaN(a)) {
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
    spin: function (e) {
        var b = this,
            c = b.getValue(),
            a = b.getIncrement(),
            d = e ? "down" : "up";
        if (e) {
            c -= a
        } else {
            c += a
        }
        b.setValue(c);
        c = b._value;
        b.fireEvent("spin", b, c, d);
        b.fireEvent("spin" + d, b, c)
    },
    reset: function () {
        this.setValue(this.getDefaultValue())
    },
    destroy: function () {
        var a = this;
        Ext.destroy(a.downRepeater, a.upRepeater);
        a.callParent(arguments)
    }
}, function () {});


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


Ext.define("Ext.slider.Slider", {
    extend: "Ext.Container",
    xtype: "slider",
    requires: ["Ext.util.SizeMonitor", "Ext.slider.Thumb", "Ext.fx.easing.EaseOut"],
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
        values: 0,
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
        this.on("painted", "onPainted");
        this.sizeMonitor = new Ext.util.SizeMonitor({
            element: a,
            callback: this.onSizeChange,
            scope: this
        })
    },
    onPainted: function () {
        this.sizeMonitor.refresh();
        this.refreshElementWidth();
        this.refreshValue()
    },
    onSizeChange: function () {
        this.refreshElementWidth();
        this.refreshValue()
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
    },
    onThumbDrag: function (c, g, h) {
        var d = this.getThumbIndex(c),
            a = h.x,
            f = this.offsetValueRatio,
            b = this.constrainValue(a / f);
        g.stopPropagation();
        this.setIndexValue(d, b);
        this.fireChangeEvent();
        return false
    },
    setIndexValue: function (d, g, f) {
        var c = this.getThumb(d),
            b = this.getValue(),
            e = this.offsetValueRatio,
            a = c.getDraggable();
        a.setOffset({
            x: g * e
        }, f);
        b[d] = this.constrainValue(a.getOffset().x / e)
    },
    onThumbDragEnd: function (a) {
        this.refreshThumbConstraints(a)
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
    onTap: function (g) {
        var h = Ext.get(g.target);
        if (!h || h.hasCls("x-thumb")) {
            return
        }
        var l = g.touch.point.x,
            f = this.element,
            a = f.getX(),
            b = l - a - (this.thumbWidth / 2),
            m = this.constrainValue(b / this.offsetValueRatio),
            p = this.getValue(),
            o = Infinity,
            k = p.length,
            d, c, j, n;
        if (k === 1) {
            n = 0
        } else {
            for (d = 0; d < k; d++) {
                j = p[d];
                c = Math.abs(j - m);
                if (c < o) {
                    o = c;
                    n = d
                }
            }
        }
        this.setIndexValue(n, m, this.getAnimation());
        this.refreshThumbConstraints(this.getThumb(n));
        this.fireChangeEvent()
    },
    updateThumbs: function (a) {
        this.add(a)
    },
    applyValue: function (g) {
        var d = Ext.Array.from(g),
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
    updateValue: function (d) {
        var a = this.getThumbs(),
            c = d.length,
            b;
        this.setThumbsCount(c);
        for (b = 0; b < c; b++) {
            a[b].getDraggable().setExtraConstraint(null).setOffset({
                x: d[b] * this.offsetValueRatio
            })
        }
        for (b = 0; b < c; b++) {
            this.refreshThumbConstraints(a[b])
        }
        this.fireChangeEvent()
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
    fireChangeEvent: function () {
        this.fireEvent("change", this, this.getValue())
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
    }
});


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
        values: 0,
        minValue: 0,
        maxValue: 100,
        increment: 1
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
    onSliderChange: function (a, b) {
        this.fireEvent("change", this, b)
    },
    reset: function () {
        var b = this.config,
            a = (this.config.hasOwnProperty("values")) ? b.values : b.value;
        this.setValue(a)
    }
});


Ext.define("Ext.slider.Toggle", {
    extend: "Ext.slider.Slider",
    config: {
        baseCls: "x-toggle",
        minValueCls: "x-toggle-off",
        maxValueCls: "x-toggle-on"
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
    onTap: function () {
        this.setValue(this.getValue() > 0 ? 0 : 1)
    },
    fireChangeEvent: function () {
        var b = this,
            d = this.getValue(),
            e = d > 0,
            a = b.getMaxValueCls(),
            c = b.getMinValueCls();
        this.addCls(e ? a : c);
        this.removeCls(e ? c : a);
        this.callParent()
    },
    getValue: function () {
        return this.callParent()[0]
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
    }
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


Ext.define("Ext.MessageBox", {
    extend: "Ext.Sheet",
    requires: ["Ext.Toolbar", "Ext.field.Text", "Ext.field.TextArea"],
    config: {
        ui: "dark",
        baseCls: Ext.baseCSSPrefix + "msgbox",
        cls: Ext.baseCSSPrefix + "panel",
        iconCls: null,
        enterAnimation: "pop",
        exitAnimation: "pop",
        defaultTextHeight: 75,
        title: null,
        buttons: null,
        msg: null,
        promptConfig: null,
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
        if (a.hasOwnProperty("prompt")) {
            Ext.applyIf(a, {
                promptConfig: a.prompt
            });
            delete a.prompt
        }
        if (a.hasOwnProperty("multiline") || a.hasOwnProperty("multiLine")) {
            a.promptConfig = a.promptConfig || {};
            Ext.applyIf(a.promptConfig, {
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
    applyMsg: function (a) {
        a = {
            html: a,
            cls: this.getBaseCls() + "-text"
        };
        return Ext.factory(a, Ext.Component, this.getMsg())
    },
    updateMsg: function (a) {
        if (a) {
            this.add(a)
        }
    },
    updateIconCls: function (b, c) {
        if (b) {
            var a = {
                xtype: "component",
                docked: "left",
                width: 40,
                height: 40,
                cls: b
            }
        }
    },
    applyPromptConfig: function (a) {
        if (a) {
            var b = {
                label: false
            };
            if (typeof a == "object") {
                Ext.apply(b, a)
            }
            if (b.multiLine) {
                b.height = Ext.isNumber(b.multiLine) ? parseFloat(b.multiLine) : this.getDefaultTextHeight();
                return Ext.factory(b, Ext.field.TextArea, this.getPromptConfig())
            } else {
                return Ext.factory(b, Ext.field.Text, this.getPromptConfig())
            }
        }
        return a
    },
    updatePromptConfig: function (a, b) {
        if (a) {
            this.add(a)
        }
        if (b) {
            this.remove(b)
        }
    },
    onClick: function (b) {
        if (b) {
            var a = b.userConfig || {},
                c = b.getInitialConfig();
            if (typeof a.fn == "function") {
                a.fn.call(a.scope || null, c.itemId || c.text, a.input ? a.input.dom.value : null, a)
            }
            if (a.cls) {
                this.el.removeCls(a.cls)
            }
            if (a.input) {
                a.input.dom.blur()
            }
        }
        this.hide()
    },
    show: function (f) {
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
        this.setConfig(b);
        var a = this.getPromptConfig();
        if (a) {
            a.setValue("")
        }
        this.callParent();
        return this
    },
    alert: function (d, c, b, a) {
        return this.show({
            title: d,
            msg: c,
            buttons: Ext.MessageBox.OK,
            promptConfig: false,
            fn: b,
            scope: a,
            iconCls: Ext.MessageBox.INFO
        })
    },
    confirm: function (d, c, b, a) {
        return this.show({
            title: d,
            msg: c,
            buttons: Ext.MessageBox.YESNO,
            promptConfig: false,
            scope: a,
            iconCls: Ext.MessageBox.QUESTION,
            fn: function (e) {
                b.call(a, e)
            }
        })
    },
    prompt: function (g, f, c, b, e, d, a) {
        return this.show({
            title: g,
            msg: f,
            buttons: Ext.MessageBox.OKCANCEL,
            scope: b,
            iconCls: Ext.MessageBox.QUESTION,
            promptConfig: a || true,
            multiLine: e,
            value: d,
            fn: function (i, h) {
                c.call(b, i, h)
            }
        })
    }
}, function () {
    this.override({
        setIcon: function (a, b) {
            this.setIconCls(a);
            if (b) {
                this.doComponentLayout()
            }
            return this
        }
    });
    Ext.Msg = Ext.create("Ext.MessageBox")
});


Ext.define("Kitchensink.view.Overlays", {
    extend: "Ext.Container",
    requires: ["Ext.MessageBox", "Ext.ActionSheet"],
    config: {
        padding: 20,
        scrollable: true,
        layout: {
            type: "vbox",
            pack: "center",
            align: "stretch"
        },
        defaults: {
            xtype: "button",
            cls: "demobtn",
            ui: "round",
            margin: "10 0"
        },
        items: [{
            text: "Action Sheet",
            model: false,
            handler: function () {
                if (!this.actions) {
                    this.actions = Ext.create("Ext.ActionSheet", {
                        items: [{
                            text: "Delete draft",
                            ui: "decline",
                            handler: Ext.emptyFn
                        }, {
                            text: "Save draft",
                            handler: Ext.emptyFn
                        }, {
                            xtype: "button",
                            text: "Cancel",
                            scope: this,
                            handler: function () {
                                this.actions.hide()
                            }
                        }]
                    })
                }
                this.actions.show()
            }
        }, {
            text: "Overlay",
            handler: function () {
                var a = Ext.create("Ext.Panel", {
                    floating: true,
                    modal: true,
                    centered: true,
                    width: 300,
                    height: 200,
                    styleHtmlContent: true,
                    html: "<p>This is a modal, centered and floating panel. hideOnMaskTap is true by default so we can tap anywhere outside the overlay to hide it.</p>",
                    items: [{
                        docked: "top",
                        xtype: "toolbar",
                        title: "Overlay Title"
                    }],
                    scrollable: true
                });
                a.show()
            }
        }, {
            text: "Alert",
            handler: function () {
                Ext.Msg.alert("Title", "The quick brown fox jumped over the lazy dog.", Ext.emptyFn)
            }
        }, {
            text: "Prompt",
            handler: function () {
                Ext.Msg.prompt("Welcome!", "What's your first name?", Ext.emptyFn)
            }
        }, {
            text: "Confirm",
            handler: function () {
                Ext.Msg.confirm("Confirmation", "Are you sure you want to do that?", Ext.emptyFn)
            }
        }, {
            text: "Picker",
            handler: function () {
                var a = Ext.create("Ext.Picker", {
                    slots: [{
                        name: "limit_speed",
                        title: "Speed",
                        data: [{
                            text: "50 KB/s",
                            value: 50
                        }, {
                            text: "100 KB/s",
                            value: 100
                        }, {
                            text: "200 KB/s",
                            value: 200
                        }, {
                            text: "300 KB/s",
                            value: 300
                        }]
                    }]
                });
                a.show()
            }
        }]
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


Ext.define("Ext.carousel.Carousel", {
    extend: "Ext.Container",
    alternateClassName: "Ext.Carousel",
    xtype: "carousel",
    requires: ["Ext.fx.Easing", "Ext.util.SizeMonitor", "Ext.carousel.Item", "Ext.carousel.Indicator", "Ext.layout.Carousel"],
    config: {
        baseCls: "x-carousel",
        direction: "horizontal",
        directionLock: false,
        animation: {
            duration: 350,
            easing: "ease-out"
        },
        indicator: true,
        ui: "dark",
        layout: "carousel",
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
    getItemsCount: function () {
        return this.innerItems.length
    },
    initialize: function () {
        this.hiddenTranslation = {
            x: 0,
            y: 0
        };
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
            erased: "onErased"
        });
        this.sizeMonitor = new Ext.util.SizeMonitor({
            element: this.element,
            callback: this.onSizeChange,
            scope: this
        });
        this.carouselItems = [];
        this.orderedCarouselItems = [];
        this.callParent()
    },
    updateBufferSize: function (m) {
        var h = m * 2 + 1,
            l = this.isRendered(),
            c = this.innerElement,
            g = this.carouselItems,
            f = g.length,
            e = this.getItemConfig(),
            d = this.getItemLength(),
            j = this.getDirection(),
            b = j === "horizontal" ? "setWidth" : "setHeight",
            a, k;
        for (a = f; a < h; a++) {
            k = Ext.factory(e, Ext.carousel.Item);
            if (d) {
                k[b].call(k, d)
            }
            g.push(k);
            c.append(k.renderElement);
            if (l && k.setRendered(true)) {
                k.fireEvent("renderedchange", k, true)
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
        if (!this.painted) {
            this.painted = true;
            this.sizeMonitor.refresh();
            this.refresh();
            this.refreshCarouselItems()
        }
    },
    onErased: function () {
        if (this.painted) {
            this.painted = false
        }
    },
    onSizeChange: function () {
        this.refreshCarouselItems();
        this.refreshSizing();
        this.refreshOffset()
    },
    onItemAdd: function (c, b) {
        this.callParent(arguments);
        var a = this.getIndicator();
        if (a && c.isInnerItem(c)) {
            a.addIndicator()
        }
        if (b <= this.getActiveIndex()) {
            this.refreshActiveIndex()
        }
        if (this.painted && this.isIndexDirty(b)) {
            this.refreshActiveItem()
        }
    },
    onItemRemove: function (c, b) {
        this.callParent(arguments);
        var a = this.getIndicator();
        if (c.isInnerItem(c) && a) {
            a.removeIndicator()
        }
        if (b <= this.getActiveIndex()) {
            this.refreshActiveIndex()
        }
        if (this.painted && this.isIndexDirty(b)) {
            this.refreshActiveItem()
        }
    },
    onItemMove: function (b, c, a) {
        if (this.painted && (this.isIndexDirty(c) || this.isIndexDirty(a))) {
            this.refreshActiveItem()
        }
    },
    isIndexDirty: function (b) {
        var a = this.getActiveIndex();
        return (b >= a - 1 && b <= a + 1)
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
    onDrag: function (j) {
        if (!this.isDragging) {
            return
        }
        var k = this.dragStartOffset,
            l = this.getDirection(),
            m = l === "horizontal" ? j.deltaX : j.deltaY,
            a = this.offset,
            i = this.flickStartTime,
            c = this.dragDirection,
            b = Ext.Date.now(),
            h = this.getActiveIndex(),
            f = this.getMaxItemIndex(),
            d = c,
            g;
        if ((h === 0 && m > 0) || (h === f && m < 0)) {
            m *= 0.5
        }
        g = k + m;
        if (g > a) {
            c = 1
        } else {
            if (g < a) {
                c = -1
            }
        }
        if (c !== d || (b - i) > 300) {
            this.flickStartOffset = a;
            this.flickStartTime = b
        }
        this.dragDirection = c;
        this.setOffset(g)
    },
    onDragEnd: function (j) {
        if (!this.isDragging) {
            return
        }
        this.onDrag(j);
        this.isDragging = false;
        var a = Ext.Date.now(),
            i = this.itemLength,
            g = i / 2,
            f = this.offset,
            l = this.getActiveIndex(),
            c = this.getMaxItemIndex(),
            h = 0,
            k = f - this.flickStartOffset,
            b = a - this.flickStartTime,
            d;
        if (b > 0 && Math.abs(k) >= 10) {
            d = k / b;
            if (Math.abs(d) >= 1) {
                if (d < 0 && l < c) {
                    h = -1
                } else {
                    if (d > 0 && l > 0) {
                        h = 1
                    }
                }
            }
        }
        if (h === 0) {
            if (l < c && f < -g) {
                h = -1
            } else {
                if (l > 0 && f > g) {
                    h = 1
                }
            }
        }
        this.animationDirection = h;
        this.setOffsetAnimated(h * i)
    },
    applyAnimation: function (a) {
        a.easing = new Ext.fx.Easing(a.easing);
        return a
    },
    updateDirection: function (b) {
        var a = this.getIndicator();
        this.currentAxis = (b === "horizontal") ? "x" : "y";
        this.otherAxis = (b === "horizontal") ? "y" : "x";
        if (a) {
            a.setDirection(b)
        }
    },
    setOffset: function (f) {
        var l = this.orderedCarouselItems,
            d = this.getBufferSize(),
            j = l[d],
            a = {},
            k = this.itemLength,
            e = this.currentAxis,
            b, h, c, g;
        this.offset = f;
        f += this.itemOffset;
        a[e] = f;
        if (j) {
            j.translate(a);
            for (g = 1, c = 0; g <= d; g++) {
                h = l[d - g];
                if (h) {
                    c += k;
                    a[e] = f - c;
                    h.translate(a)
                }
            }
            for (g = 1, c = 0; g <= d; g++) {
                b = l[d + g];
                if (b) {
                    c += k;
                    a[e] = f + c;
                    b.translate(a)
                }
            }
        }
        return this
    },
    setOffsetAnimated: function (c) {
        var a = this.orderedCarouselItems[this.getBufferSize()],
            d = {},
            b = this.currentAxis;
        this.offset = c;
        c += this.itemOffset;
        d[b] = c;
        if (a) {
            this.isAnimating = true;
            a.getTranslatable().on(this.animationListeners);
            a.translate(d, this.getAnimation())
        }
        return this
    },
    onActiveItemAnimationFrame: function (m, b) {
        var l = this.orderedCarouselItems,
            d = this.getBufferSize(),
            k = {},
            j = this.itemLength,
            e = this.currentAxis,
            f = b[e],
            h, a, g, c;
        for (g = 1, c = 0; g <= d; g++) {
            h = l[d - g];
            if (h) {
                c += j;
                k[e] = f - c;
                h.translate(k)
            }
        }
        for (g = 1, c = 0; g <= d; g++) {
            a = l[d + g];
            if (a) {
                c += j;
                k[e] = f + c;
                a.translate(k)
            }
        }
    },
    onActiveItemAnimationEnd: function (b) {
        var c = this.getActiveIndex(),
            a = this.animationDirection,
            e = this.currentAxis,
            f = b.translation[e],
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
        this.activeIndex = this.getInnerItems().indexOf(this.getActiveItem())
    },
    refreshCarouselItems: function () {
        var b = this.carouselItems,
            a, c, d;
        for (a = 0, c = b.length; a < c; a++) {
            d = b[a];
            d.getTranslatable().refresh()
        }
    },
    getMaxItemIndex: function () {
        return this.getItemsCount() - 1
    },
    doSetActiveItem: function (h) {
        var d = this.getInnerItems(),
            r = d.indexOf(h),
            f = this.getMaxItemIndex(),
            n = this.getIndicator(),
            c = this.getBufferSize(),
            l = this.carouselItems.slice(),
            o = this.orderedCarouselItems,
            q = {},
            p = {},
            a, m, b, g, j, k, e;
        this.callParent(arguments);
        o.length = 0;
        if (h) {
            b = h.getId();
            p[b] = h;
            q[b] = c;
            if (r > 0) {
                for (g = 1; g <= c; g++) {
                    j = r - g;
                    if (j >= 0) {
                        a = d[j];
                        b = a.getId();
                        p[b] = a;
                        q[b] = c - g
                    } else {
                        break
                    }
                }
            }
            if (r < f) {
                for (g = 1; g <= c; g++) {
                    j = r + g;
                    if (j <= f) {
                        a = d[j];
                        b = a.getId();
                        p[b] = a;
                        q[b] = c + g
                    } else {
                        break
                    }
                }
            }
            for (g = 0, k = l.length; g < k; g++) {
                e = l[g];
                m = e.getComponent();
                if (m) {
                    b = m.getId();
                    if (q.hasOwnProperty(b)) {
                        l.splice(g, 1);
                        g--;
                        k--;
                        delete p[b];
                        o[q[b]] = e
                    }
                }
            }
            for (b in p) {
                if (p.hasOwnProperty(b)) {
                    a = p[b];
                    e = l.pop();
                    e.setComponent(a);
                    o[q[b]] = e
                }
            }
        }
        this.activeIndex = r;
        this.refreshOffset();
        if (n) {
            n.setActiveIndex(r)
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
        this.callParent(arguments);
        this.sizeMonitor.destroy()
    }
}, function () {
    this.override({
        constructor: function (a) {
            if (a && "activeIndex" in a) {
                a.activeItem = a.activeIndex
            }
            this.callParent([a])
        }
    })
});


Ext.define("Kitchensink.view.Carousel", {
    extend: "Ext.Container",
    requires: ["Ext.carousel.Carousel"],
    config: {
        cls: "cards",
        layout: {
            type: "vbox",
            align: "stretch"
        },
        defaults: {
            flex: 1
        },
        items: [{
            xtype: "carousel",
            items: [{
                html: "<p>Navigate the carousel on this page by swiping left/right.</p>",
                cls: "card card1"
            }, {
                html: "<p>Clicking on either side of the indicators below</p>",
                cls: "card card2"
            }, {
                html: "Card #3",
                cls: "card card3"
            }]
        }, {
            xtype: "carousel",
            ui: "light",
            direction: "vertical",
            items: [{
                html: "<p>Carousels can be vertical and given a <code>ui</code> of &#8216;light&#8217; or &#8216;dark.&#8217;</p>",
                cls: "card card4"
            }, {
                html: "Card #2",
                cls: "card card5"
            }, {
                html: "Card #3",
                cls: "card card6"
            }]
        }]
    }
});


Ext.define("Ext.dataview.DataView", {
    extend: "Ext.Container",
    alternateClassName: "Ext.DataView",
    mixins: ["Ext.mixin.Selectable"],
    xtype: "dataview",
    requires: ["Ext.data.StoreManager"],
    config: {
        store: null,
        baseCls: Ext.baseCSSPrefix + "dataview",
        emptyText: null,
        deferEmptyText: true,
        itemTpl: "<div>{text}</div>",
        pressedCls: "x-item-pressed",
        selectedCls: "x-item-selected",
        triggerEvent: "tap",
        triggerCtEvent: "tap",
        deselectOnContainerClick: true,
        scrollable: true,
        pressedDelay: 100,
        loadingText: "Loading..."
    },
    inheritableStatics: {
        prepareAssociatedData: function (l, a) {
            a = a || [];
            var f = l.associations.items,
                g = f.length,
                c = {},
                k = 0,
                h = 0,
                d, e, n, o, b, m;
            for (; k < g; k++) {
                b = f[k];
                d = l[b.storeName];
                c[b.name] = [];
                if (d && d.data.length > 0) {
                    e = d.data.items;
                    o = e.length;
                    for (; h < o; h++) {
                        n = e[h];
                        m = n.internalId;
                        if (a.indexOf(m) == -1) {
                            a.push(m);
                            c[b.name][h] = n.data;
                            Ext.apply(c[b.name][h], this.prepareAssociatedData(n, a))
                        }
                    }
                }
            }
            return c
        }
    },
    constructor: function () {
        this.mixins.selectable.constructor.apply(this, arguments);
        this.callParent(arguments)
    },
    storeEventHooks: {
        beforeload: "onBeforeLoad",
        load: "refresh",
        sort: "refresh",
        filter: "refresh",
        add: "onStoreAdd",
        remove: "onStoreRemove",
        update: "onStoreUpdate",
        clear: "onStoreClear"
    },
    doInitialize: function () {
        var d = this,
            c = {
                delegate: "> div",
                scope: d
            },
            b = {
                scope: d
            },
            a;
        d.getViewItems();
        a = d.elementContainer.element;
        b[d.getTriggerCtEvent()] = "onContainerTrigger";
        d.element.on(b);
        c[d.getTriggerEvent()] = "onItemTrigger";
        a.on(c);
        a.on({
            delegate: "> div",
            scope: d,
            touchstart: "onItemTouchStart",
            touchend: "onItemTouchEnd",
            tap: "onItemTap",
            touchmove: "onItemTouchMove",
            doubletap: "onItemDoubleTap",
            swipe: "onItemSwipe"
        })
    },
    initialize: function () {
        this.callParent();
        this.doInitialize()
    },
    onItemTrigger: function (d) {
        var b = this,
            c = d.getTarget(),
            a = b.getViewItems().indexOf(c);
        this.selectWithEvent(this.getStore().getAt(a))
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
    doAddPressedCls: function (a) {
        var c = this,
            b = c.getViewItems()[c.getStore().indexOf(a)];
        Ext.get(b).addCls(c.getPressedCls())
    },
    onItemTouchStart: function (i) {
        var f = this,
            h = i.getTarget(),
            c = f.getViewItems().indexOf(h),
            b = f.getStore(),
            a = b && b.getAt(c),
            g = f.getPressedDelay(),
            d = Ext.get(h);
        if (a) {
            if (g > 0) {
                f.pressedTimeout = Ext.defer(f.doAddPressedCls, g, f, [a])
            } else {
                f.doAddPressedCls(a)
            }
        }
        d.on({
            touchmove: "onItemTouchMove",
            scope: f,
            single: true
        });
        f.fireEvent("itemtouchstart", f, c, h, i)
    },
    onItemTouchEnd: function (h) {
        var f = this,
            g = h.getTarget(),
            c = f.getViewItems().indexOf(g),
            b = f.getStore(),
            a = b && b.getAt(c),
            d = Ext.get(g);
        if (this.hasOwnProperty("pressedTimeout")) {
            clearTimeout(this.pressedTimeout);
            delete this.pressedTimeout
        }
        if (a) {
            Ext.get(g).removeCls(f.getPressedCls())
        }
        d.un({
            touchmove: "onItemTouchMove",
            scope: f
        });
        f.fireEvent("itemtouchend", f, c, g, h)
    },
    onItemTouchMove: function (h) {
        var f = this,
            g = h.getTarget(),
            c = f.getViewItems().indexOf(g),
            b = f.getStore(),
            a = b && b.getAt(c),
            d = Ext.get(g);
        if (f.hasOwnProperty("pressedTimeout")) {
            clearTimeout(f.pressedTimeout);
            delete f.pressedTimeout
        }
        if (a) {
            d.removeCls(f.getPressedCls())
        }
    },
    onItemTap: function (f) {
        var c = this,
            d = f.getTarget(),
            a = c.getViewItems().indexOf(d),
            b = Ext.get(d);
        c.fireEvent("itemtap", c, a, b, f)
    },
    onItemDoubleTap: function (f) {
        var c = this,
            d = f.getTarget(),
            a = c.getViewItems().indexOf(d),
            b = Ext.get(d);
        c.fireEvent("itemdoubletap", c, a, b, f)
    },
    onItemSwipe: function (f) {
        var c = this,
            d = f.getTarget(),
            a = c.getViewItems().indexOf(d),
            b = Ext.get(d);
        c.fireEvent("itemswipe", c, a, b, f)
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
        var b = Ext.get(c.getViewItems()[c.getStore().indexOf(a)]);
        b.removeCls(c.getPressedCls());
        b.addCls(c.getSelectedCls())
    },
    onItemDeselect: function (a, b) {
        var c = this;
        if (b) {
            c.doItemDeSelect(c, a)
        } else {
            c.fireAction("deselect", [c, a, b], "doItemDeselect")
        }
    },
    doItemDeselect: function (c, a) {
        var b = Ext.get(c.getViewItems()[c.getStore().indexOf(a)]);
        if (b) {
            b.removeCls([c.getPressedCls(), c.getSelectedCls()])
        }
    },
    updateData: function (b) {
        var a = this.getStore();
        if (!a) {
            this.setStore(Ext.create("Ext.data.ArrayStore", {
                fields: b
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
            b.refresh()
        }
    },
    onBeforeLoad: function () {
        var a = this.getLoadingText();
        if (a) {
            this.setMask({
                xtype: "loadmask",
                message: a
            })
        }
    },
    updateEmptyText: function () {
        this.refresh()
    },
    refresh: function () {
        var a = this;
        this.setMask(false);
        if (!a.getStore()) {
            if (!this.getDeferEmptyText()) {
                this.doEmptyText()
            }
            return
        }
        a.fireAction("refresh", [a], "doRefresh")
    },
    applyItemTpl: function (a) {
        return (Ext.isObject(a) && a.isTemplate) ? a : new Ext.XTemplate(a)
    },
    onAfterRender: function () {
        var a = this;
        a.callParent(arguments);
        a.updateStore(a.getStore())
    },
    updateListItem: function (a, b) {
        var c = a.getData();
        if (a) {
            Ext.apply(c, this.self.prepareAssociatedData(a))
        }
        b.innerHTML = this.getItemTpl().apply(c)
    },
    addListItem: function (b, a) {
        var e = a.getData();
        if (a) {
            Ext.apply(e, this.self.prepareAssociatedData(a))
        }
        var c = this.elementContainer.element,
            g = c.dom.childNodes,
            d = g.length,
            f;
        f = Ext.Element.create(this.getItemElementConfig(b, e));
        if (!d || b == d) {
            f.appendTo(c)
        } else {
            f.insertBefore(g[b])
        }
    },
    getItemElementConfig: function (a, b) {
        return {
            cls: this.getBaseCls() + "-item",
            html: this.getItemTpl().apply(b)
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
            this.doEmptyText()
        }
    },
    doEmptyText: function () {
        var a = this.getEmptyText();
        if (a) {
            this.elementContainer.setHtml("");
            this.elementContainer.setHtml(a)
        }
    },
    moveItemsFromCache: function (b, c) {
        var f = this,
            e = b.length,
            d = 0,
            a;
        if (f.getEmptyText() && f.getViewItems().length == 0) {
            this.elementContainer.setHtml("")
        }
        for (; d < e; d++) {
            a = b[d];
            f.addListItem(c + d, a)
        }
    },
    getViewItems: function () {
        if (!this.elementContainer) {
            this.elementContainer = this.add(new Ext.Component())
        }
        return Array.prototype.slice.call(this.elementContainer.element.dom.childNodes)
    },
    doRefresh: function (e) {
        var h = e.getStore(),
            a = h.getRange(),
            d = e.getViewItems(),
            f = a.length,
            k = d.length,
            b = f - k,
            g = e.getScrollable(),
            c, j;
        if (g) {
            g.getScroller().scrollTo(0, 0)
        }
        if (f < 1) {
            e.onStoreClear();
            return
        }
        if (b < 0) {
            this.moveItemsToCache(k + b, k - 1);
            d = e.getViewItems();
            k = d.length
        } else {
            if (b > 0) {
                this.doCreateItems(h.getRange(k), k)
            }
        }
        for (c = 0; c < k; c++) {
            j = d[c];
            e.updateListItem(a[c], j)
        }
    },
    doCreateItems: function (a, b) {
        this.moveItemsFromCache(a, b)
    },
    onStoreClear: function () {
        var b = this,
            a = b.getViewItems();
        this.moveItemsToCache(0, a.length - 1);
        this.doEmptyText()
    },
    onStoreAdd: function (b, a, c) {
        if (a) {
            this.doCreateItems(a, c)
        }
    },
    onStoreRemove: function (b, a, c) {
        this.moveItemsToCache(c, c)
    },
    onStoreUpdate: function (b, a) {
        this.updateListItem(a, this.getViewItems()[b.indexOf(a)])
    }
}, function () {
    Ext.deprecateClassMethod(this, "bindStore", this.prototype.setStore, "'bindStore()' is deprecated, please use 'setStore' instead")
});


Ext.define("Ext.dataview.List", {
    alternateClassName: "Ext.List",
    extend: "Ext.dataview.DataView",
    xtype: "list",
    requires: ["Ext.dataview.IndexBar", "Ext.dataview.ListItemHeader"],
    config: {
        indexBar: false,
        disclosure: null,
        icon: null,
        clearSelectionOnDeactivate: true,
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
    initialize: function () {
        var a = this;
        a.callParent();
        a.elementContainer.element.on({
            delegate: "." + this.getBaseCls() + "-disclosure",
            tap: "handleItemDisclosure",
            scope: a
        })
    },
    applyIndexBar: function (a) {
        return Ext.factory(a, Ext.dataview.IndexBar, this.getIndexBar())
    },
    updateIndexBar: function (a) {
        if (a && this.getScrollable()) {
            this.getScrollableBehavior().getScrollView().getElement().appendChild(a.renderElement);
            a.on({
                index: "onIndex",
                scope: this
            });
            this.addCls(this.getBaseCls() + "-indexed")
        }
    },
    updateGrouped: function (a) {
        if (a) {
            this.doRefreshHeaders();
            this.updatePinHeaders(this.getPinHeaders())
        } else {
            this.doRemoveHeaders();
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
                refresh: "onScrollerRefresh",
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
        if (!this.getGrouped()) {
            return false
        }
        var l = this.findGroupHeaderIndices(),
            f = l.length,
            g = this.getViewItems(),
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
    onScroll: function (e, j, h) {
        var g = this,
            i = g.pinHeaderInfo,
            a = i.closest,
            b = g.activeGroup,
            c = i.headerHeight,
            d, f;
        if (!a) {
            return
        }
        d = a.next, f = a.current;
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
                a = i.closest = this.getClosestGroups();
                d = a.next;
                f = a.current;
                this.setActiveGroup(f)
            }
        }
        if (d && h > 0 && d.offset - h <= c) {
            var k = c - (d.offset - h);
            this.translateHeader(k)
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
                    c.setHtml(b.header.innerHTML);
                    c.show()
                }
            } else {
                if (c && c.dom) {
                    c.hide()
                }
            }
        }
        this.activeGroup = b
    },
    onIndex: function (j) {
        var o = j.toLowerCase(),
            m = this.getStore(),
            d = m.getGroups(),
            k = d.length,
            l = this.getScrollable(),
            h, n, g, c, b, p;
        if (l) {
            h = this.getScrollable().getScroller()
        } else {
            return
        }
        for (g = 0; g < k; g++) {
            n = d[g];
            b = n.name.toLowerCase();
            if (b == o || b > o) {
                c = n;
                break
            } else {
                c = n
            }
        }
        if (l && c) {
            p = this.getViewItems()[m.indexOf(c.children[0])];
            h.stopAnimation();
            var a = h.getContainerSize().y,
                q = h.getSize().y,
                e = q - a,
                f = (p.offsetTop > e) ? e : p.offsetTop;
            h.scrollTo(0, f)
        }
    },
    applyOnItemDisclosure: function (a) {
        if (Ext.isFunction(a)) {
            return {
                scope: this,
                handler: a
            }
        }
        if (Ext.isObject(a)) {
            return a
        }
        return null
    },
    getDisclosure: function () {
        var b = this._disclosure,
            a = this.getOnItemDisclosure();
        if (a && a != b) {
            b = true;
            this.setDisclosure(b)
        }
        return b
    },
    updateOnItemDisclosure: function (a) {
        if (a) {
            this.setDisclosure(true)
        }
    },
    handleItemDisclosure: function (f) {
        var d = this,
            c = f.getTarget().parentNode,
            b = d.getViewItems().indexOf(c),
            a = d.getStore().getAt(b);
        if (d.getPreventSelectionOnDisclose()) {
            f.stopEvent()
        }
        d.fireAction("disclose", [a, c, b, f], "doDisclose")
    },
    doDisclose: function (a, f, c, g) {
        var d = this,
            b = d.getOnItemDisclosure();
        if (b && b.handler) {
            b.handler.call(d, a, f, c)
        }
    },
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
    updateListItem: function (b, h) {
        var g = Ext.fly(h),
            e = g.down(this.labelClsCache, true),
            a = b.data,
            c = a && a.hasOwnProperty("disclosure"),
            i = a && a.hasOwnProperty("iconSrc"),
            d, f;
        e.innerHTML = this.getItemTpl().apply(a);
        if (this.getDisclosure() && c) {
            d = g.down(this.disclosureClsCache);
            d[c ? "removeCls" : "addCls"](this.hiddenDisplayCache)
        }
        if (this.getIcon()) {
            f = g.down(this.iconClsCache, true);
            f.style.backgroundImage = i ? "url(" + i + ")" : ""
        }
    },
    getItemElementConfig: function (c, d) {
        var b = {
            cls: this.itemClsShortCache,
            children: [{
                cls: this.labelClsShortCache,
                html: this.getItemTpl().apply(d)
            }]
        },
            a;
        if (this.getIcon()) {
            a = d.iconSrc;
            b.children.push({
                cls: this.iconClsShortCache,
                style: "background-image: " + a ? "url(" + a + ")" : ""
            })
        }
        if (this.getDisclosure()) {
            b.children.push({
                cls: this.disclosureClsShortCache + ((d.disclosure === false) ? this.hiddenDisplayCache : "")
            })
        }
        return b
    },
    findGroupHeaderIndices: function () {
        if (!this.getGrouped()) {
            return
        }
        var g = this,
            h = g.getStore(),
            c = h.getGroups(),
            k = c.length,
            f = g.getViewItems(),
            b = [],
            j = g.footerClsShortCache,
            d, a, e, l;
        g.doRemoveHeaders();
        g.doRemoveFooterCls();
        if (f.length) {
            for (d = 0; d < k; d++) {
                a = c[d].children[0];
                e = h.indexOf(a);
                l = f[e];
                g.doAddHeader(l, h.getGroupString(a));
                if (d) {
                    Ext.fly(l.previousSibling).addCls(j)
                }
                b.push(e)
            }
            Ext.fly(f[f.length - 2]).addCls(j)
        }
        return b
    },
    doRemoveHeaders: function () {
        var d = this,
            b = 0,
            a = d.elementContainer.element.query(d.headerClsCache),
            e = a.length,
            c;
        for (; b < e; b++) {
            c = a[b];
            Ext.fly(c.parentNode).removeCls(d.headerItemClsShortCache);
            Ext.removeNode(c)
        }
    },
    doRemoveFooterCls: function () {
        var d = this,
            b = 0,
            c = d.footerClsCache,
            a = d.elementContainer.element.query(c),
            e = a.length;
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
    }
}, function () {
    var a = this.prototype;
    a.cachedConfigList = a.cachedConfigList.slice();
    Ext.Array.remove(a.cachedConfigList, "baseCls")
});


Ext.define("Ext.dataview.NestedList", {
    alternateClassName: "Ext.NestedList",
    extend: "Ext.Container",
    xtype: "nestedlist",
    requires: ["Ext.List", "Ext.Toolbar", "Ext.Button", "Ext.XTemplate", "Ext.data.StoreManager", "Ext.data.NodeStore", "Ext.data.TreeStore"],
    config: {
        cls: Ext.baseCSSPrefix + "nested-list",
        cardSwitchAnimation: "slide",
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
        data: null,
        store: null,
        detailContainer: undefined,
        detailCard: null,
        backButton: {
            ui: "back",
            hidden: true
        },
        lastNode: null,
        lastActiveList: null,
        pressedDelay: 0
    },
    initialize: function () {
        var a = this;
        a.callParent();
        a.on({
            delegate: "> list",
            itemdoubletap: "onItemDoubleTap",
            itemtap: "onItemTap",
            scope: a
        })
    },
    applyDetailContainer: function (a) {
        if (!a) {
            a = this
        }
        return a
    },
    onItemTap: function (g, b, f, h) {
        var d = this,
            a = g.getStore(),
            c = a.getAt(b);
        d.fireEvent("itemtap", g, b, f, h);
        if (c.isLeaf()) {
            d.fireEvent("leafitemtap", g, b, f, h);
            d.goToLeaf(c)
        } else {
            this.goToNode(c)
        }
    },
    onItemDoubleTap: function (c, a, b, d) {
        this.fireEvent("itemdoubletap", c, a, b, d)
    },
    onBackTap: function () {
        var d = this,
            c = d.getLastNode(),
            e = d.getDetailCard(),
            a = e && d.getActiveItem() == e,
            b = d.getLastActiveList();
        this.fireAction("back", [this, c, b, a], "doBack")
    },
    doBack: function (d, c, b, a) {
        if (a && b) {
            d.getLayout().getAnimation().setReverse(true);
            d.setActiveItem(b);
            d.setLastNode(c.parentNode);
            d.syncToolbar()
        } else {
            this.goToNode(c.parentNode)
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
            a = Ext.data.StoreManager.lookup(a)
        }
        return a
    },
    updateStore: function (b, d) {
        var c = this,
            a;
        if (d && Ext.isObject(d) && d.isStore) {
            if (d.autoDestroy) {
                d.destroy()
            } else {
                d.un({
                    rootchange: "goToNode",
                    scope: c
                })
            }
        }
        if (b) {
            a = b.getRootNode();
            if (a) {
                c.goToNode(a)
            } else {
                b.on({
                    load: "onLoad",
                    single: true,
                    scope: this
                });
                b.load()
            }
            b.on({
                rootchange: "goToNode",
                scope: this
            });
            c.relayEvents(b, ["beforeload", "load"])
        }
    },
    onLoad: function (a) {
        this.goToNode(a.getRootNode())
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
            c.getToolbar().add(0, b)
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
    setUseToolbar: function (a) {},
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
        var h = this,
            d = h.getActiveItem(),
            j = h.getDetailCard(),
            i = j && h.getActiveItem() == j,
            g = h.goToNodeReverseAnimation(a),
            c = h.firstList,
            e = h.secondList,
            b = h.getLayout().getAnimation(),
            f;
        if (a.isLeaf()) {
            throw new Error("goToNode: passed a node which is a leaf.")
        }
        if (a == h.getLastNode() && !i) {
            return
        }
        if (i) {
            b.setReverse(true);
            h.setActiveItem(h.getLastActiveList())
        } else {
            if (c && e) {
                d = h.getActiveItem();
                h.setLastActiveList(d);
                f = (d == c) ? e : c;
                f.getStore().setNode(a);
                b.setReverse(g);
                h.setActiveItem(f);
                f.deselectAll()
            } else {
                if (c) {
                    h.setLastActiveList(h.getActiveItem());
                    h.setActiveItem(h.getListConfig(a));
                    h.secondList = h.getActiveItem()
                } else {
                    h.setActiveItem(h.getListConfig(a));
                    h.firstList = h.getActiveItem()
                }
            }
        }
        h.fireEvent("listchange", this, h.getActiveItem());
        h.setLastNode(a);
        h.syncToolbar()
    },
    goToLeaf: function (e) {
        if (!e.isLeaf()) {
            throw new Error("goToLeaf: passed a node which is not a leaf.")
        }
        var d = this,
            c = d.getDetailCard(e),
            b = d.getDetailContainer(),
            a = b == this,
            f = d.getLayout().getAnimation();
        if (c) {
            if (b.getItems().indexOf(c) === -1) {
                b.add(c)
            }
            if (a) {
                d.setLastActiveList(d.getActiveItem());
                d.setLastNode(e)
            }
            f.setReverse(false);
            b.setActiveItem(c);
            d.syncToolbar()
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
    getListConfig: function (b) {
        var a = this,
            c = Ext.create("Ext.data.NodeStore", {
                recursive: false,
                node: b,
                model: a.getStore().model
            });
        return {
            xtype: "list",
            autoDestroy: true,
            clearSelectionOnDeactivate: false,
            disclosure: false,
            store: c,
            onItemDisclosure: a.getOnItemDisclosure(),
            allowDeselect: a.getAllowDeselect(),
            itemTpl: '<span<tpl if="leaf == true"> class="x-list-item-leaf"</tpl>>' + a.getItemTextTpl(b) + "</span>"
        }
    }
});
if (Ext.os.deviceType == "Phone") {
    

Ext.define("Kitchensink.view.Main", {
        id: "mainNestedList",
        extend: "Ext.dataview.NestedList",
        requires: ["Ext.TitleBar"],
        config: {
            store: "Demos",
            title: "Kitchen Sink",
            useTitleAsBackText: false,
            toolbar: {
                id: "mainNavigationBar"
            },
            fullscreen: true
        }
    })
} else {
    

Ext.define("Kitchensink.view.Main", {
        extend: "Ext.Container",
        requires: ["Ext.dataview.NestedList", "Ext.TitleBar"],
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
                items: [{
                    xtype: "button",
                    id: "viewSourceButton",
                    hidden: true,
                    align: "right",
                    ui: "action",
                    action: "viewSource",
                    text: "Source"
                }]
            }]
        }
    })
}


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
            indicators: false
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
        var b = this,
            a = this.getScrollable().getScroller();
        b.callParent();
        b.on({
            scope: this,
            painted: "onPainted"
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
            i = h.bar,
            m = this.getValue(),
            c = this.getShowTitle(),
            l = this.getTitle(),
            j = this.getScrollable(),
            f = j.getScroller(),
            o, e, n, k, d, a;
        o = i.getY();
        e = b.getY();
        if (c && l) {
            e += l.element.getHeight()
        }
        k = a = Math.abs(e - o);
        this.slotPadding = k;
        if (c && l) {
            d = l.element.getHeight();
            a += d
        }
        g.setStyle({
            padding: k + "px 0 " + a + "px"
        });
        n = i.getHeight();
        f.refresh();
        f.setSnap(n);
        this.setValue(m)
    },
    doItemTap: function (c, a, b, d) {
        this.selectedIndex = a;
        this.selectedNode = b;
        this.scrollToItem(b, true);
        this.fireEvent("slotpick", this.getValue(), this.selectedNode)
    },
    scrollToItem: function (e, d) {
        var h = e.getY(),
            c = e.parent(),
            f = c.getY(),
            b = this.getScrollable(),
            a = b.getScroller(),
            g;
        g = h - f;
        if (d) {
            a.scrollToAnimated(0, g)
        } else {
            a.scrollTo(0, g)
        }
    },
    onScrollEnd: function (c, b) {
        var d = this.picker,
            f = d.bar,
            g = f.getHeight(),
            a = b.y,
            e = Math.round(a / g),
            i = this.getViewItems(),
            h = i[e];
        if (h) {
            this.selectedIndex = e;
            this.selectedNode = h;
            this.fireEvent("slotpick", this.getValue(), this.selectedNode)
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
            this.scrollToItem(e, true);
            this._value = f
        }
    }
});


Ext.define("Ext.picker.Picker", {
    extend: "Ext.Sheet",
    alias: "widget.picker",
    alternateClassName: "Ext.Picker",
    requires: ["Ext.picker.Slot", "Ext.Toolbar", "Ext.data.Model"],
    config: {
        cls: Ext.baseCSSPrefix + "picker",
        doneButton: "Done",
        cancelButton: "Cancel",
        useTitles: true,
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
        return Ext.factory(a, "Ext.Toolbar", this.getToolbar())
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
        if (typeof a == "string") {
            a = {
                text: a
            }
        }
        Ext.applyIf(a, {
            ui: "action"
        });
        return Ext.factory(a, "Ext.Button", this.getDoneButton())
    },
    updateDoneButton: function (c, a) {
        var b = this.getToolbar(),
            d = this.getCancelButton();
        if (c) {
            b.add([{
                xtype: "spacer"
            },
            c]);
            c.on("tap", this.onDoneButtonTap, this)
        } else {
            if (a) {
                b.remove(a)
            }
        }
    },
    applyCancelButton: function (a) {
        if (typeof a == "string") {
            a = {
                text: a
            }
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
    updateUseTitles: function (b) {
        var d = this.getInnerItems(),
            c = d.length,
            a;
        for (a = 0; a < c; a++) {
            d[a].setShowTitle(b)
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
    updateSlots: function (c) {
        var d = this.getInnerItems(),
            b, a;
        if (d) {
            b = d.length;
            for (a = 0; a < b; a++) {
                this.remove(d[a])
            }
        }
        if (c) {
            this.add(c)
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
    setValue: function (b, e) {
        var f, d = this,
            a = d.items.items,
            c = a.length;
        if (!b) {
            return this
        }
        if (this.rendered && !this.isHidden()) {
            Ext.iterate(b, function (g, h) {
                f = d.child("[_name=" + g + "]");
                if (f) {
                    if (e) {
                        f.setValueAnimated(h)
                    } else {
                        f.setValue(h)
                    }
                }
            }, this)
        }
        d._value = b;
        d._values = b;
        return this
    },
    setValueAnimated: function (a) {
        this.setValue(a, true)
    },
    getValue: function () {
        var b = {},
            a = this.getItems().items,
            e = a.length,
            d, c;
        for (c = 0; c < e; c++) {
            d = a[c];
            if (d instanceof Ext.picker.Slot) {
                b[d.getName()] = d.getValue()
            }
        }
        this._values = b;
        return b
    },
    getValues: function () {
        return this.getValue()
    }
}, function () {
    

Ext.define("x-textvalue", {
        extend: "Ext.data.Model",
        fields: ["text", "value"]
    })
});


Ext.define("Ext.field.Select", {
    extend: "Ext.field.Text",
    xtype: "selectfield",
    alternateClassName: "Ext.form.Select",
    requires: ["Ext.Panel", "Ext.picker.Picker", "Ext.data.Store", "Ext.data.StoreManager"],
    config: {
        ui: "select",
        tabIndex: -1,
        valueField: "value",
        displayField: "text",
        store: null,
        options: null,
        hiddenName: null,
        component: {
            useMask: true
        },
        clearIcon: false
    },
    record: null,
    previousRecord: null,
    constructor: function (a) {
        a = a || {};
        if (!a.store) {
            a.store = true
        }
        this.callParent([a])
    },
    initialize: function () {
        this.callParent();
        this.getComponent().on({
            scope: this,
            masktap: "onMaskTap"
        })
    },
    applyValue: function (c) {
        var a = c,
            b;
        if (!(c instanceof Ext.data.Model)) {
            b = this.getStore().find(this.getValueField(), c);
            if (b == -1) {
                b = this.getStore().find(this.getDisplayField(), c)
            }
            a = this.getStore().getAt(b)
        }
        return a
    },
    updateValue: function (b, a) {
        this.previousRecord = a;
        if (b) {
            this.record = b;
            this.callParent([b.get(this.getDisplayField())])
        }
        this.fireEvent("change", this, b, a)
    },
    getValue: function () {
        var a = this.record;
        return (a) ? a.get(this.getValueField()) : null
    },
    getRecord: function () {
        return this.record
    },
    getPicker: function () {
        if (!this.picker) {
            this.picker = Ext.create("Ext.picker.Picker", {
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
            })
        }
        return this.picker
    },
    getListPanel: function () {
        if (!this.listPanel) {
            this.listPanel = Ext.create("Ext.Panel", {
                top: 0,
                left: 0,
                height: 200,
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
            })
        }
        return this.listPanel
    },
    onMaskTap: function () {
        if (this.getDisabled()) {
            return false
        }
        this.showComponent();
        return false
    },
    showComponent: function () {
        if (this.getStore().getCount() === 0) {
            return
        }
        Ext.Viewport.hideKeyboard();
        if (Ext.os.deviceType == "Phone") {
            var e = this.getPicker(),
                d = this.getName(),
                h = {};
            h[d] = this.record.get(this.getValueField());
            e.setValue(h);
            e.show()
        } else {
            var f = this.getListPanel(),
                g = f.down("list"),
                b = g.getStore(),
                c = b.find(this.getValueField(), this.getValue()),
                a = b.getAt((c == -1) ? 0 : c);
            f.showBy(this);
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
    onPickerChange: function (c, f) {
        var e = this,
            d = e.getValue(),
            g = f[e.getName()],
            a = e.getStore(),
            b = a.find(e.getValueField(), g);
        record = a.getAt(b);
        e.setValue(record)
    },
    updateOptions: function (c) {
        var b = this.getStore(),
            a;
        if (!c) {
            b.clearData();
            this.setValue(null)
        } else {
            b.loadData(c);
            a = b.getAt(0);
            this.setValue(a)
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
                datachanged: this.onStoreDataChanged
            })
        }
        return a
    },
    updateStore: function (b) {
        var a = (b) ? b.getAt(0) : null;
        if (b && a) {
            this.setValue(a)
        }
    },
    onStoreDataChanged: function (b, a) {
        var d = this.getInitialConfig(),
            c = this.getValue();
        if (c) {
            this.updateValue(this.applyValue(c))
        } else {
            if (d.hasOwnProperty("value")) {
                this.setValue(d.value)
            } else {
                if (b.getCount() > 0) {
                    this.setValue(b.getAt(0))
                }
            }
        }
    },
    reset: function () {
        var b = this.getStore(),
            a = (this.originalValue) ? this.originalValue : b.getAt(0);
        if (b && a) {
            this.setValue(a)
        }
        return this
    },
    destroy: function () {
        this.callParent(arguments);
        Ext.destroy(this.listPanel, this.picker, this.hiddenField)
    }
});


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
        var d = {},
            c, b, a = this.getItems().items,
            g = a.length,
            f, e;
        for (e = 0; e < g; e++) {
            f = a[e];
            if (f instanceof Ext.picker.Slot) {
                d[f.getName()] = f.getValue()
            }
        }
        c = this.getDaysInMonth(d.month, d.year);
        b = Math.min(d.day, c);
        return new Date(d.year, d.month - 1, b)
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
        c.forEach(function (i) {
            h.push(this.createSlot(i, l, b, g))
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
        component: {
            useMask: true
        }
    },
    initialize: function () {
        this.callParent();
        this.getComponent().on({
            scope: this,
            masktap: "onMaskTap"
        })
    },
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
        var a = this.getPicker();
        if (this.initialized && a) {
            a.setValue(b)
        }
        if (b !== null) {
            this.getComponent().setValue(Ext.Date.format(b, Ext.util.Format.defaultDateFormat))
        }
        this._value = b
    },
    getValue: function () {
        return this._value
    },
    getFormattedValue: function (b) {
        var a = this.getValue();
        return (Ext.isDate(a)) ? Ext.Date.format(a, b || Ext.util.Format.defaultDateFormat) : a
    },
    applyPicker: function (a) {
        if (!this.initialized) {
            return null
        }
        return Ext.factory(a, Ext.picker.Date, this.getPicker())
    },
    updatePicker: function (a) {
        if (a) {
            a.on({
                scope: this,
                change: "onPickerChange",
                hide: "onPickerHide"
            });
            a.hide()
        }
    },
    onMaskTap: function () {
        if (this.getDisabled()) {
            return false
        }
        var a = this.getPicker(),
            b = this.getInitialConfig();
        if (!a) {
            a = this.applyPicker(b.picker);
            this.updatePicker(a);
            a.setValue(b.value);
            this._picker = a
        }
        a.show();
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
    onDestroy: function () {
        var a = this.getPicker();
        if (a) {
            a.destroy()
        }
        this.callParent(arguments)
    }
}, function () {
    this.override({
        getValue: function (a) {
            if (a) {
                return this.getFormattedValue(a)
            }
            return this.callOverridden()
        }
    })
});


Ext.define("Kitchensink.view.Forms", {
    extend: "Ext.tab.Panel",
    requires: ["Ext.form.Panel", "Ext.form.FieldSet", "Ext.field.Number", "Ext.field.Spinner", "Ext.field.Password", "Ext.field.Email", "Ext.field.Url", "Ext.field.DatePicker", "Ext.field.Select", "Ext.field.Hidden", "Ext.field.Radio", "Ext.field.Slider", "Ext.field.Toggle", "Ext.field.Search"],
    config: {
        activeItem: 0,
        tabBarPosition: "top",
        tabBar: {
            layout: {
                pack: "left"
            }
        },
        items: [{
            title: "Basic",
            xtype: "formpanel",
            id: "basicform",
            layout: {
                type: "vbox",
                align: "stretch"
            },
            items: [{
                xtype: "fieldset",
                title: "Personal Info",
                instructions: "Please enter the information above.",
                defaults: {
                    labelWidth: "35%"
                },
                items: [{
                    xtype: "textfield",
                    name: "name",
                    label: "Name",
                    placeHolder: "Tom Roy",
                    autoCapitalize: true,
                    required: true,
                    clearIcon: true
                }, {
                    xtype: "passwordfield",
                    name: "password",
                    label: "Password"
                }, {
                    xtype: "emailfield",
                    name: "email",
                    label: "Email",
                    placeHolder: "me@sencha.com",
                    clearIcon: true
                }, {
                    xtype: "urlfield",
                    name: "url",
                    label: "Url",
                    placeHolder: "http://sencha.com",
                    clearIcon: true
                }, {
                    xtype: "checkboxfield",
                    name: "cool",
                    label: "Cool"
                }, {
                    xtype: "datepickerfield",
                    name: "date",
                    label: "Start Date",
                    value: new Date(),
                    picker: {
                        yearFrom: 1990
                    }
                }, {
                    xtype: "selectfield",
                    name: "rank",
                    label: "Rank",
                    options: [{
                        text: "Master",
                        value: "master"
                    }, {
                        text: "Journeyman",
                        value: "journeyman"
                    }, {
                        text: "Apprentice",
                        value: "apprentice"
                    }]
                }, {
                    xtype: "textareafield",
                    name: "bio",
                    label: "Bio"
                }]
            }, {
                xtype: "fieldset",
                title: "Favorite color",
                defaults: {
                    xtype: "radiofield",
                    labelWidth: "35%"
                },
                items: [{
                    name: "color",
                    value: "red",
                    label: "Red"
                }, {
                    name: "color",
                    label: "Blue",
                    value: "blue"
                }, {
                    name: "color",
                    label: "Green",
                    value: "green"
                }, {
                    name: "color",
                    label: "Purple",
                    value: "purple"
                }]
            }, {
                xtype: "panel",
                defaults: {
                    xtype: "button",
                    style: "margin: 0.1em",
                    flex: 1
                },
                layout: {
                    type: "hbox"
                },
                items: [{
                    text: "Disable fields",
                    scope: this,
                    hasDisabled: false,
                    handler: function (a) {
                        var b = Ext.getCmp("basicform");
                        if (a.hasDisabled) {
                            b.enable();
                            a.hasDisabled = false;
                            a.setText("Disable fields")
                        } else {
                            b.disable();
                            a.hasDisabled = true;
                            a.setText("Enable fields")
                        }
                    }
                }, {
                    text: "Reset",
                    handler: function () {
                        Ext.getCmp("basicform").reset()
                    }
                }]
            }]
        }, {
            title: "Sliders",
            xtype: "formpanel",
            layout: {
                type: "vbox",
                align: "stretch"
            },
            items: [{
                xtype: "fieldset",
                defaults: {
                    labelWidth: "35%",
                    labelAlign: "top"
                },
                items: [{
                    xtype: "sliderfield",
                    label: "Single Thumb"
                }, {
                    xtype: "sliderfield",
                    label: "Multiple Thumbs",
                    values: [10, 70]
                }, {
                    xtype: "togglefield",
                    label: "Toggle"
                }]
            }]
        }, {
            title: "Toolbars",
            xtype: "panel",
            items: [{
                styleHtmlContent: true
            }, {
                docked: "top",
                xtype: "toolbar",
                items: [{
                    xtype: "searchfield",
                    placeHolder: "Search",
                    name: "searchfield"
                }]
            }, {
                docked: "top",
                xtype: "toolbar",
                items: [{
                    xtype: "textfield",
                    placeHolder: "Text",
                    name: "searchfield"
                }]
            }, {
                docked: "top",
                xtype: "toolbar",
                items: [{
                    xtype: "selectfield",
                    name: "options",
                    options: [{
                        text: "This is just a big select",
                        value: "1"
                    }, {
                        text: "Another select item",
                        value: "2"
                    }]
                }]
            }]
        }]
    }
});


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

Ext.require("Ext.data.TreeStore", function (a) {
    

Ext.define("Kitchensink.view.NestedList", {
        requires: ["Kitchensink.view.EditorPanel"],
        extend: "Ext.Container",
        config: {
            layout: "fit",
            items: [{
                xtype: "nestedlist",
                store: new a({
                    id: "NestedListStore",
                    model: "Kitchensink.model.Cars",
                    root: {},
                    proxy: {
                        type: "ajax",
                        url: "carregions.json"
                    }
                }),
                displayField: "text",
                listeners: {
                    leafitemtap: function (e, b, d) {
                        var c = Ext.getCmp("editorPanel") || new Kitchensink.view.EditorPanel();
                        c.setRecord(e.getStore().getAt(b));
                        c.show()
                    }
                }
            }]
        }
    })
});


Ext.define("Ext.data.association.HasMany", {
    extend: "Ext.data.association.Association",
    alternateClassName: "Ext.data.HasManyAssociation",
    requires: ["Ext.util.Inflector"],
    alias: "association.hasmany",
    constructor: function (c) {
        var d = this,
            a, b;
        d.callParent(arguments);
        d.name = d.name || Ext.util.Inflector.pluralize(d.associatedName.toLowerCase());
        a = d.ownerModel.prototype;
        b = d.name;
        Ext.applyIf(d, {
            storeName: b + "Store",
            foreignKey: d.ownerName.toLowerCase() + "_id"
        });
        a[b] = d.createStore()
    },
    createStore: function () {
        var g = this,
            h = g.associatedModel,
            c = g.storeName,
            d = g.foreignKey,
            a = g.primaryKey,
            f = g.filterProperty,
            b = g.autoLoad,
            e = g.storeConfig || {};
        return function () {
            var l = this,
                j, k, i = {};
            if (l[c] === undefined) {
                if (f) {
                    k = {
                        property: f,
                        value: l.get(f),
                        exactMatch: true
                    }
                } else {
                    k = {
                        property: d,
                        value: l.get(a),
                        exactMatch: true
                    }
                }
                i[d] = l.get(a);
                j = Ext.apply({}, e, {
                    model: h,
                    filters: [k],
                    remoteFilter: false,
                    modelDefaults: i
                });
                l[c] = Ext.create("Ext.data.Store", j);
                if (b) {
                    l[c].load()
                }
            }
            return l[c]
        }
    },
    read: function (c, a, e) {
        var d = c[this.name](),
            b;
        d.add(a.read(e).records);
        b = this.associatedModel.prototype.associations.findBy(function (f) {
            return f.type === "belongsTo" && f.associatedName === c.$className
        });
        if (b) {
            d.data.each(function (f) {
                f[b.instanceName] = c
            })
        }
    }
});
Ext.require("Kitchensink.model.OrderItem", function () {
    

Ext.define("Kitchensink.model.Order", {
        extend: "Ext.data.Model",
        fields: ["id", "status"],
        hasMany: {
            model: "Kitchensink.model.OrderItem",
            name: "orderItems"
        }
    })
});
Ext.require("Kitchensink.model.Order", function () {
    

Ext.define("Kitchensink.model.User", {
        extend: "Ext.data.Model",
        id: "NestedLoadingUsers",
        fields: ["id", "name"],
        hasMany: {
            model: "Kitchensink.model.Order",
            name: "orders"
        },
        proxy: {
            type: "ajax",
            url: "userData.json"
        }
    })
});

Ext.require(["Ext.data.Store", "Kitchensink.model.User"], function () {
    

Ext.define("Kitchensink.view.NestedLoading", {
        extend: "Ext.Container",
        config: {
            scrollable: true,
            styleHtmlContent: true,
            layout: "fit",
            items: [{
                docked: "top",
                xtype: "toolbar",
                items: [{
                    text: "Load Nested Data",
                    handler: function () {
                        Ext.getCmp("NestedLoadingDataView").getStore().load()
                    }
                }, {
                    text: "Explain",
                    handler: function () {
                        if (!this.explanation) {
                            this.explanation = Ext.create("Ext.Panel", {
                                floating: true,
                                modal: true,
                                centered: true,
                                width: 250,
                                height: 250,
                                styleHtmlContent: true,
                                scroll: true,
                                items: {
                                    docked: "top",
                                    xtype: "toolbar",
                                    title: "Loading Nested Data"
                                },
                                html: ["<p>The data package can load deeply nested data in a single request. In this example we are loading a fictional", "dataset containing Users, their Orders, and each Order's OrderItems.</p>", "<p>Instead of pulling down each record in turn, we load the full data set in a single request and allow the data", "package to automatically parse the nested data.</p>", '<p>As one of the more complex examples, it is worth tapping the "Source" button to see how this is set up.</p>'].join("")
                            })
                        }
                        this.explanation.show()
                    }
                }]
            }, {
                xtype: "dataview",
                id: "NestedLoadingDataView",
                scrollable: false,
                layout: "fit",
                emptyText: "No Data Loaded",
                itemTpl: ['<div class="user">', "<h3>{name}'s orders:</h3>", '<tpl for="orders">', '<div class="order" style="padding: 0 0 10px 20px;">', "Order: {id} ({status})", "<ul>", '<tpl for="orderItems">', "<li>{quantity} x {name}</li>", "</tpl>", "</ul>", "</div>", "</tpl>", "</div>"].join(""),
                store: new Ext.data.Store({
                    model: "Kitchensink.model.User",
                    autoLoad: false
                })
            }]
        }
    })
});











Ext.define("Kitchensink.controller.Main", {
    extend: "Ext.app.Controller",
    config: {
        profile: Ext.os.deviceType.toLowerCase()
    },
    views: ["Main", "NestedList", "List", "SourceOverlay", "Buttons", "Forms", "Icons", "BottomTabs", "Map", "Overlays", "Tabs", "Toolbars", "Slide", "Pop", "Fade", "Flip", "JSONP", "YQL", "Ajax", "Video", "Audio", "NestedLoading", "Carousel", "TouchEvents"],
    stores: ["Demos"],
    refs: [{
        ref: "main",
        selector: "mainview",
        autoCreate: true,
        xtype: "mainview"
    }, {
        ref: "toolbar",
        selector: "#mainNavigationBar"
    }, {
        ref: "sourceButton",
        selector: "#viewSourceButton"
    }, {
        ref: "sourceOverlay",
        selector: "sourceoverlay",
        xtype: "sourceoverlay",
        autoCreate: true
    }, {
        ref: "navigation",
        selector: "#mainNestedList"
    }, {
        ref: "viewport",
        selector: "viewport"
    }],
    init: function () {
        this.control({
            "#mainNestedList": {
                leafitemtap: this.onLeafTap,
                back: this.onBack
            },
            "#viewSourceButton": {
                tap: this.onSourceButtonTap
            }
        })
    },
    onBack: function () {
        this.getSourceButton().setHidden(true)
    },
    onLeafTap: function (j, i) {
        if (this.mainAnimating) {
            return false
        }
        var c = this.getNavigation(),
            k = this.getMain(),
            g = k.getLayout(),
            h = j.getStore().getAt(i),
            b = h.get("text"),
            m = h.get("view") || b,
            f = m.toLowerCase() + "view",
            l = "get" + Ext.String.capitalize(m),
            a = this.getSourceButton(),
            e = this.getProfile(),
            n = h.get("animation"),
            d, o;
        this.initialAnimation = o = this.initialAnimation || g.getAnimation();
        if (!m.length) {
            return
        }
        if (!this.hasRef(m)) {
            this.getView(m, {
                profile: e
            });
            this.addRef({
                ref: m,
                selector: f,
                xtype: f,
                autoCreate: true
            })
        }
        d = this[l]();
        c.setDetailCard(d);
        if (n) {
            g.setAnimation(n);
            if (Ext.os.name != "Android") {
                g.getAnimation().getOutAnimation().setOnEnd(Ext.Function.bind(function () {
                    Ext.getBody().dom.style.pointerEvents = "auto"
                }, this))
            }
        } else {
            g.setAnimation(o);
            if (Ext.os.name != "Android") {
                g.getAnimation().getOutAnimation().setOnEnd(Ext.Function.bind(function () {
                    Ext.getBody().dom.style.pointerEvents = "auto"
                }, this))
            }
        }
        if (Ext.os.name != "Android") {
            Ext.getBody().dom.style.pointerEvents = "none"
        }
        this.getToolbar().setTitle(b);
        if (d.setProfile) {
            d.setProfile(e)
        }
        a.setHidden(false)
    },
    mainAnimating: false,
    onSourceButtonTap: function () {
        var b = this.getSourceOverlay(),
            a = this.getMain().getActiveItem().ref;
        b.show();
        b.setMask({
            message: "Loading..."
        });
        Ext.Ajax.request({
            url: "app/view/" + a + ".js",
            scope: this,
            callback: this.onSourceLoad
        })
    },
    onSourceLoad: function (c, d, a) {
        var b = this.getSourceOverlay();
        b.setHtml(a.responseText);
        b.unmask()
    },
    updateProfile: function (b) {
        this.getMain();
        var a = this.getNavigation(),
            c;
        switch (b) {
        case "desktop":
        case "tablet":
            a.setDetailContainer(this.getMain());
            break;
        case "phone":
            c = a.getToolbar();
            c.add({
                xtype: "button",
                id: "viewSourceButton",
                hidden: true,
                align: "right",
                ui: "action",
                action: "viewSource",
                text: "Source"
            });
            break
        }
    }
});