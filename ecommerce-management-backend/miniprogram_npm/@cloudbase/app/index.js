module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1768287884692, function(require, module, exports) {

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudbase = exports.LANGS = exports.getBaseEndPoint = void 0;
var utilities_1 = require("@cloudbase/utilities");
var component_1 = require("./libs/component");
var adapter_1 = require("./libs/adapter");
var cache_1 = require("./libs/cache");
var request_1 = require("./libs/request");
var common_1 = require("./constants/common");
var lang_1 = require("./libs/lang");
var common_2 = require("./constants/common");
Object.defineProperty(exports, "getBaseEndPoint", { enumerable: true, get: function () { return common_2.getBaseEndPoint; } });
var lang_2 = require("./libs/lang");
Object.defineProperty(exports, "LANGS", { enumerable: true, get: function () { return lang_2.LANGS; } });
var useAdapters = utilities_1.adapters.useAdapters, useDefaultAdapter = utilities_1.adapters.useDefaultAdapter;
var ERRORS = utilities_1.constants.ERRORS, COMMUNITY_SITE_URL = utilities_1.constants.COMMUNITY_SITE_URL;
var printWarn = utilities_1.utils.printWarn;
var catchErrorsDecorator = utilities_1.helpers.catchErrorsDecorator;
var DEFAULT_INIT_CONFIG = {
    timeout: 15000,
    persistence: 'local',
};
var MAX_TIMEOUT = 1000 * 60 * 10;
var MIN_TIMEOUT = 100;
var extensionMap = {};
var Cloudbase = (function () {
    function Cloudbase(config) {
        this.cloudbaseConfig = config ? config : this.cloudbaseConfig;
        this.authInstance = null;
        this.oauthInstance = null;
        this.version = (0, common_1.getSdkVersion)();
    }
    Object.defineProperty(Cloudbase.prototype, "config", {
        get: function () {
            return this.cloudbaseConfig;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cloudbase.prototype, "platform", {
        get: function () {
            return adapter_1.Platform;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cloudbase.prototype, "cache", {
        get: function () {
            return (0, cache_1.getCacheByEnvId)(this.cloudbaseConfig.env);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cloudbase.prototype, "localCache", {
        get: function () {
            return (0, cache_1.getLocalCache)(this.cloudbaseConfig.env);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cloudbase.prototype, "request", {
        get: function () {
            return (0, request_1.getRequestByEnvId)(this.cloudbaseConfig.env);
        },
        enumerable: false,
        configurable: true
    });
    Cloudbase.prototype.init = function (config) {
        var _a;
        if (!config.env) {
            throw new Error(JSON.stringify({
                code: ERRORS.INVALID_PARAMS,
                msg: 'env must not be specified',
            }));
        }
        if (!adapter_1.Platform.adapter) {
            this.useDefaultAdapter();
        }
        var reqConfig = {
            timeout: config.timeout || 5000,
            timeoutMsg: "[".concat((0, common_1.getSdkName)(), "][REQUEST TIMEOUT] request had been abort since didn't finished within").concat(config.timeout / 1000, "s"),
        };
        this.requestClient = new adapter_1.Platform.adapter.reqClass(reqConfig);
        this.cloudbaseConfig = __assign(__assign(__assign({}, DEFAULT_INIT_CONFIG), config), { i18n: (0, lang_1.i18nProxy)(adapter_1.Platform, config) });
        delete this.cloudbaseConfig.lang;
        this.cloudbaseConfig.timeout = this.formatTimeout(this.cloudbaseConfig.timeout);
        var _b = this.cloudbaseConfig, env = _b.env, persistence = _b.persistence, debug = _b.debug, timeout = _b.timeout, oauthClient = _b.oauthClient, i18n = _b.i18n;
        (0, cache_1.initCache)({ env: env, persistence: persistence, debug: debug, platformInfo: this.platform });
        (0, common_1.setRegionLevelEndpoint)(env, config.region || '');
        (0, common_1.setGatewayEndPointWithEnv)(env, common_1.DEFAULT_PROTOCOL, config.region || '');
        var app = new Cloudbase(this.cloudbaseConfig);
        (0, request_1.initRequest)({
            env: env,
            region: config.region || '',
            timeout: timeout,
            oauthClient: oauthClient,
            _fromApp: app,
            i18n: i18n,
            endPointMode: config.endPointMode,
        });
        app.requestClient = this.requestClient;
        this.app = app;
        (_a = this === null || this === void 0 ? void 0 : this.fire) === null || _a === void 0 ? void 0 : _a.call(this, 'cloudbase_init', app);
        this.try2InitAuth(app);
        return app;
    };
    Cloudbase.prototype.updateConfig = function (config) {
        var persistence = config.persistence, debug = config.debug;
        this.cloudbaseConfig.persistence = persistence;
        this.cloudbaseConfig.debug = debug;
        (0, cache_1.initCache)({ env: this.cloudbaseConfig.env, persistence: persistence, debug: debug, platformInfo: this.platform });
    };
    Cloudbase.prototype.updateLang = function (lang) {
        var _a;
        if (!lang || lang === ((_a = this.cloudbaseConfig.i18n) === null || _a === void 0 ? void 0 : _a.lang))
            return;
        this.cloudbaseConfig.i18n.lang = lang;
    };
    Cloudbase.prototype.registerExtension = function (ext) {
        extensionMap[ext.name] = ext;
    };
    Cloudbase.prototype.invokeExtension = function (name, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var ext;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ext = extensionMap[name];
                        if (!ext) {
                            throw new Error(JSON.stringify({
                                code: ERRORS.INVALID_PARAMS,
                                msg: "extension:".concat(name, " must be registered before invoke"),
                            }));
                        }
                        return [4, ext.invoke(opts, this)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    };
    Cloudbase.prototype.useAdapters = function (adapters, options) {
        var _a = useAdapters(adapters, options) || {}, adapter = _a.adapter, runtime = _a.runtime;
        adapter && (adapter_1.Platform.adapter = adapter);
        runtime && (adapter_1.Platform.runtime = runtime);
    };
    Cloudbase.prototype.registerHook = function (hook) {
        (0, component_1.registerHook)(Cloudbase, hook);
    };
    Cloudbase.prototype.registerComponent = function (component) {
        (0, component_1.registerComponent)(Cloudbase, component);
    };
    Cloudbase.prototype.registerVersion = function (version) {
        (0, common_1.setSdkVersion)(version);
        this.version = version;
    };
    Cloudbase.prototype.registerSdkName = function (name) {
        (0, common_1.setSdkName)(name);
    };
    Cloudbase.prototype.registerEndPoint = function (url, protocol) {
        (0, common_1.setEndPointInfo)({ baseUrl: url, protocol: protocol, env: this.config.env, endPointKey: 'CLOUD_API' });
    };
    Cloudbase.prototype.registerEndPointWithKey = function (props) {
        (0, common_1.setEndPointInfo)({
            env: this.config.env,
            endPointKey: props.key,
            baseUrl: props.url,
            protocol: props.protocol,
        });
    };
    Cloudbase.prototype.getEndPointWithKey = function (key) {
        var info = (0, common_1.getEndPointInfo)(this.config.env, key);
        return {
            BASE_URL: info.baseUrl,
            PROTOCOL: info.protocol,
        };
    };
    Cloudbase.prototype.parseCaptcha = function (url) {
        return utilities_1.utils.parseCaptcha(url);
    };
    Cloudbase.prototype.useDefaultAdapter = function () {
        var _a = useDefaultAdapter.bind(this)(), adapter = _a.adapter, runtime = _a.runtime;
        adapter_1.Platform.adapter = adapter;
        adapter_1.Platform.runtime = runtime;
    };
    Cloudbase.prototype.formatTimeout = function (timeout) {
        switch (true) {
            case timeout > MAX_TIMEOUT:
                printWarn(ERRORS.INVALID_PARAMS, 'timeout is greater than maximum value[10min]');
                return MAX_TIMEOUT;
            case timeout < MIN_TIMEOUT:
                printWarn(ERRORS.INVALID_PARAMS, 'timeout is less than maximum value[100ms]');
                return MIN_TIMEOUT;
            default:
                return timeout;
        }
    };
    Cloudbase.prototype.try2InitAuth = function (app) {
        if (app === void 0) { app = this.app; }
        try {
            var authProto_1 = app.auth();
            Reflect.ownKeys(authProto_1).forEach(function (key) {
                app.auth[key] = authProto_1[key];
            });
            app.auth.__proto__ = authProto_1.__proto__;
        }
        catch (error) {
            console.log('try2InitAuth error:', error);
        }
    };
    __decorate([
        catchErrorsDecorator({
            mode: 'sync',
            title: 'Cloudbase 初始化失败',
            messages: [
                '请确认以下各项：',
                '  1 - 调用 cloudbase.init() 的语法或参数是否正确',
                '  2 - 如果是非浏览器环境，是否配置了安全应用来源（https://docs.cloudbase.net/api-reference/webv3/adapter#%E7%AC%AC-2-%E6%AD%A5%E9%85%8D%E7%BD%AE%E5%AE%89%E5%85%A8%E5%BA%94%E7%94%A8%E6%9D%A5%E6%BA%90）',
                "\u5982\u679C\u95EE\u9898\u4F9D\u7136\u5B58\u5728\uFF0C\u5EFA\u8BAE\u5230\u5B98\u65B9\u95EE\u7B54\u793E\u533A\u63D0\u95EE\u6216\u5BFB\u627E\u5E2E\u52A9\uFF1A".concat(COMMUNITY_SITE_URL),
            ],
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", Cloudbase)
    ], Cloudbase.prototype, "init", null);
    __decorate([
        catchErrorsDecorator({
            title: '调用扩展能力失败',
            messages: [
                '请确认以下各项：',
                '  1 - 调用 invokeExtension() 的语法或参数是否正确',
                '  2 - 被调用的扩展能力是否已经安装并通过 registerExtension() 注册',
                "\u5982\u679C\u95EE\u9898\u4F9D\u7136\u5B58\u5728\uFF0C\u5EFA\u8BAE\u5230\u5B98\u65B9\u95EE\u7B54\u793E\u533A\u63D0\u95EE\u6216\u5BFB\u627E\u5E2E\u52A9\uFF1A".concat(COMMUNITY_SITE_URL),
            ],
        }),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [String, Object]),
        __metadata("design:returntype", Promise)
    ], Cloudbase.prototype, "invokeExtension", null);
    return Cloudbase;
}());
exports.cloudbase = new Cloudbase();
exports.cloudbase.useAdapters((0, adapter_1.getWxDefaultAdapter)());
exports.default = exports.cloudbase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxrREFBMEU7QUFhMUUsOENBQWtFO0FBQ2xFLDBDQUE4RDtBQUc5RCxzQ0FBd0U7QUFFeEUsMENBQStEO0FBQy9ELDZDQVcyQjtBQUMzQixvQ0FBOEM7QUFDOUMsNkNBQW9EO0FBQTNDLHlHQUFBLGVBQWUsT0FBQTtBQUN4QixvQ0FBbUM7QUFBMUIsNkZBQUEsS0FBSyxPQUFBO0FBQ04sSUFBQSxXQUFXLEdBQXdCLG9CQUFRLFlBQWhDLEVBQUUsaUJBQWlCLEdBQUssb0JBQVEsa0JBQWIsQ0FBYTtBQUMzQyxJQUFBLE1BQU0sR0FBeUIscUJBQVMsT0FBbEMsRUFBRSxrQkFBa0IsR0FBSyxxQkFBUyxtQkFBZCxDQUFjO0FBQ3hDLElBQUEsU0FBUyxHQUFLLGlCQUFLLFVBQVYsQ0FBVTtBQUNuQixJQUFBLG9CQUFvQixHQUFLLG1CQUFPLHFCQUFaLENBQVk7QUFLeEMsSUFBTSxtQkFBbUIsR0FBOEI7SUFDckQsT0FBTyxFQUFFLEtBQUs7SUFDZCxXQUFXLEVBQUUsT0FBTztDQUNyQixDQUFBO0FBR0QsSUFBTSxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7QUFFbEMsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFBO0FBRXZCLElBQU0sWUFBWSxHQUE0QixFQUFFLENBQUE7QUFFaEQ7SUFXRSxtQkFBWSxNQUF5QjtRQUNuQyxJQUFJLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFBO1FBQzdELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFBO1FBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxD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LGtCQUFrQixDQUFFO2FBQ2xEO1NBQ0YsQ0FBQzs7O3dDQUN3RCxTQUFTO3lDQXdEbEU7SUE0Qlk7UUFUWixvQkFBb0IsQ0FBQztZQUNwQixLQUFLLEVBQUUsVUFBVTtZQUNqQixRQUFRLEVBQUU7Z0JBQ1IsVUFBVTtnQkFDVix1Q0FBdUM7Z0JBQ3ZDLGdEQUFnRDtnQkFDaEQsc0tBQTZCLGtCQUFrQixDQUFFO2FBQ2xEO1NBQ0YsQ0FBQzs7OztvREFXRDtJQXNGSCxnQkFBQztDQUFBLEFBcE9ELElBb09DO0FBTVksUUFBQSxTQUFTLEdBQWUsSUFBSSxTQUFTLEVBQUUsQ0FBQTtBQUVwRCxpQkFBUyxDQUFDLFdBQVcsQ0FBQyxJQUFBLDZCQUFtQixHQUFFLENBQUMsQ0FBQTtBQUc1QyxrQkFBZSxpQkFBUyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYWRhcHRlcnMsIGNvbnN0YW50cywgdXRpbHMsIGhlbHBlcnMgfSBmcm9tICdAY2xvdWRiYXNlL3V0aWxpdGllcydcbmltcG9ydCB7IFNES0FkYXB0ZXJJbnRlcmZhY2UsIENsb3VkYmFzZUFkYXB0ZXIsIElSZXF1ZXN0Q29uZmlnIH0gZnJvbSAnQGNsb3VkYmFzZS9hZGFwdGVyLWludGVyZmFjZSdcbmltcG9ydCB7XG4gIElDbG91ZGJhc2VDb25maWcsXG4gIElDbG91ZGJhc2VVcGdyYWRlZENvbmZpZyxcbiAgSUNsb3VkYmFzZSxcbiAgSUNsb3VkYmFzZUV4dGVuc2lvbixcbiAgS1YsXG4gIElDbG91ZGJhc2VQbGF0Zm9ybUluZm8sXG4gIEVuZFBvaW50S2V5LFxuICBJQ2xvdWRiYXNlQXBpcyxcbn0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcydcbmltcG9ydCB7IElDbG91ZGJhc2VBdXRoIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9hdXRoJ1xuaW1wb3J0IHsgcmVnaXN0ZXJDb21wb25lbnQsIHJlZ2lzdGVySG9vayB9IGZyb20gJy4vbGlicy9jb21wb25lbnQnXG5pbXBvcnQgeyBnZXRXeERlZmF1bHRBZGFwdGVyLCBQbGF0Zm9ybSB9IGZyb20gJy4vbGlicy9hZGFwdGVyJ1xuaW1wb3J0IHsgSUNsb3VkYmFzZUNvbXBvbmVudCwgSUNsb3VkYmFzZUhvb2sgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzL2NvbXBvbmVudCdcbmltcG9ydCB7IElDbG91ZGJhc2VDYWNoZSB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMvY2FjaGUnXG5pbXBvcnQgeyBpbml0Q2FjaGUsIGdldENhY2hlQnlFbnZJZCwgZ2V0TG9jYWxDYWNoZSB9IGZyb20gJy4vbGlicy9jYWNoZSdcbmltcG9ydCB7IElDbG91ZGJhc2VSZXF1ZXN0IH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9yZXF1ZXN0J1xuaW1wb3J0IHsgaW5pdFJlcXVlc3QsIGdldFJlcXVlc3RCeUVudklkIH0gZnJvbSAnLi9saWJzL3JlcXVlc3QnXG5pbXBvcnQge1xuICBnZXRTZGtOYW1lLFxuICBzZXRTZGtWZXJzaW9uLFxuICBzZXRSZWdpb25MZXZlbEVuZHBvaW50LFxuICBzZXRTZGtOYW1lLFxuICBzZXRHYXRld2F5RW5kUG9pbnRXaXRoRW52LFxuICB0eXBlIElTZXRFbmRQb2ludFdpdGhLZXksXG4gIHNldEVuZFBvaW50SW5mbyxcbiAgZ2V0RW5kUG9pbnRJbmZvLFxuICBnZXRTZGtWZXJzaW9uLFxuICBERUZBVUxUX1BST1RPQ09MLFxufSBmcm9tICcuL2NvbnN0YW50cy9jb21tb24nXG5pbXBvcnQgeyBpMThuUHJveHksIExBTkdTIH0gZnJvbSAnLi9saWJzL2xhbmcnXG5leHBvcnQgeyBnZXRCYXNlRW5kUG9pbnQgfSBmcm9tICcuL2NvbnN0YW50cy9jb21tb24nXG5leHBvcnQgeyBMQU5HUyB9IGZyb20gJy4vbGlicy9sYW5nJ1xuY29uc3QgeyB1c2VBZGFwdGVycywgdXNlRGVmYXVsdEFkYXB0ZXIgfSA9IGFkYXB0ZXJzXG5jb25zdCB7IEVSUk9SUywgQ09NTVVOSVRZX1NJVEVfVVJMIH0gPSBjb25zdGFudHNcbmNvbnN0IHsgcHJpbnRXYXJuIH0gPSB1dGlsc1xuY29uc3QgeyBjYXRjaEVycm9yc0RlY29yYXRvciB9ID0gaGVscGVyc1xuXG4vKipcbiAqIEBjb25zdGFudCDpu5jorqTphY3nva5cbiAqL1xuY29uc3QgREVGQVVMVF9JTklUX0NPTkZJRzogUGFydGlhbDxJQ2xvdWRiYXNlQ29uZmlnPiA9IHtcbiAgdGltZW91dDogMTUwMDAsXG4gIHBlcnNpc3RlbmNlOiAnbG9jYWwnLCAvLyDmjIHkuYXljJblrZjlgqjnsbvlnotcbn1cblxuLy8gdGltZW91dOS4iumZkDEw5YiG6ZKfXG5jb25zdCBNQVhfVElNRU9VVCA9IDEwMDAgKiA2MCAqIDEwXG4vLyB0aW1lb3V05LiL6ZmQMTAwbXNcbmNvbnN0IE1JTl9USU1FT1VUID0gMTAwXG5cbmNvbnN0IGV4dGVuc2lvbk1hcDogS1Y8SUNsb3VkYmFzZUV4dGVuc2lvbj4gPSB7fVxuXG5jbGFzcyBDbG91ZGJhc2UgaW1wbGVtZW50cyBJQ2xvdWRiYXNlIHtcbiAgcHVibGljIGF1dGhJbnN0YW5jZTogSUNsb3VkYmFzZUF1dGhcbiAgcHVibGljIG9hdXRoSW5zdGFuY2U6IGFueVxuICBwdWJsaWMgcmVxdWVzdENsaWVudDogYW55XG4gIHB1YmxpYyBvYXV0aENsaWVudDogYW55XG4gIHB1YmxpYyB2ZXJzaW9uOiBzdHJpbmdcbiAgcHVibGljIGF1dGg6IElDbG91ZGJhc2VbJ2F1dGgnXSAmIElDbG91ZGJhc2VBdXRoXG4gIHB1YmxpYyBhcGlzOiBJQ2xvdWRiYXNlQXBpc1xuICBwcml2YXRlIGFwcDogQ2xvdWRiYXNlXG4gIHByaXZhdGUgY2xvdWRiYXNlQ29uZmlnOiBJQ2xvdWRiYXNlQ29uZmlnXG5cbiAgY29uc3RydWN0b3IoY29uZmlnPzogSUNsb3VkYmFzZUNvbmZpZykge1xuICAgIHRoaXMuY2xvdWRiYXNlQ29uZmlnID0gY29uZmlnID8gY29uZmlnIDogdGhpcy5jbG91ZGJhc2VDb25maWdcbiAgICB0aGlzLmF1dGhJbnN0YW5jZSA9IG51bGxcbiAgICB0aGlzLm9hdXRoSW5zdGFuY2UgPSBudWxsXG4gICAgdGhpcy52ZXJzaW9uID0gZ2V0U2RrVmVyc2lvbigpXG4gIH1cblxuICBnZXQgY29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLmNsb3VkYmFzZUNvbmZpZ1xuICB9XG5cbiAgZ2V0IHBsYXRmb3JtKCk6IElDbG91ZGJhc2VQbGF0Zm9ybUluZm8ge1xuICAgIHJldHVybiBQbGF0Zm9ybVxuICB9XG5cbiAgZ2V0IGNhY2hlKCk6IElDbG91ZGJhc2VDYWNoZSB7XG4gICAgcmV0dXJuIGdldENhY2hlQnlFbnZJZCh0aGlzLmNsb3VkYmFzZUNvbmZpZy5lbnYpXG4gIH1cblxuICBnZXQgbG9jYWxDYWNoZSgpOiBJQ2xvdWRiYXNlQ2FjaGUge1xuICAgIHJldHVybiBnZXRMb2NhbENhY2hlKHRoaXMuY2xvdWRiYXNlQ29uZmlnLmVudilcbiAgfVxuXG4gIGdldCByZXF1ZXN0KCk6IElDbG91ZGJhc2VSZXF1ZXN0IHtcbiAgICByZXR1cm4gZ2V0UmVxdWVzdEJ5RW52SWQodGhpcy5jbG91ZGJhc2VDb25maWcuZW52KVxuICB9XG5cbiAgQGNhdGNoRXJyb3JzRGVjb3JhdG9yKHtcbiAgICBtb2RlOiAnc3luYycsXG4gICAgdGl0bGU6ICdDbG91ZGJhc2Ug5Yid5aeL5YyW5aSx6LSlJyxcbiAgICBtZXNzYWdlczogW1xuICAgICAgJ+ivt+ehruiupOS7peS4i+WQhOmhue+8micsXG4gICAgICAnICAxIC0g6LCD55SoIGNsb3VkYmFzZS5pbml0KCkg55qE6K+t5rOV5oiW5Y+C5pWw5piv5ZCm5q2j56GuJyxcbiAgICAgICcgIDIgLSDlpoLmnpzmmK/pnZ7mtY/op4jlmajnjq/looPvvIzmmK/lkKbphY3nva7kuoblronlhajlupTnlKjmnaXmupDvvIhodHRwczovL2RvY3MuY2xvdWRiYXNlLm5ldC9hcGktcmVmZXJlbmNlL3dlYnYzL2FkYXB0ZXIjJUU3JUFDJUFDLTItJUU2JUFEJUE1JUU5JTg1JThEJUU3JUJEJUFFJUU1JUFFJTg5JUU1JTg1JUE4JUU1JUJBJTk0JUU3JTk0JUE4JUU2JTlEJUE1JUU2JUJBJTkw77yJJyxcbiAgICAgIGDlpoLmnpzpl67popjkvp3nhLblrZjlnKjvvIzlu7rorq7liLDlrpjmlrnpl67nrZTnpL7ljLrmj5Dpl67miJblr7vmib7luK7liqnvvJoke0NPTU1VTklUWV9TSVRFX1VSTH1gLFxuICAgIF0sXG4gIH0pXG4gIHB1YmxpYyBpbml0KGNvbmZpZzogSUNsb3VkYmFzZUNvbmZpZyAmIHsgbGFuZz86IExBTkdTIH0pOiBDbG91ZGJhc2Uge1xuICAgIGlmICghY29uZmlnLmVudikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY29kZTogRVJST1JTLklOVkFMSURfUEFSQU1TLFxuICAgICAgICBtc2c6ICdlbnYgbXVzdCBub3QgYmUgc3BlY2lmaWVkJyxcbiAgICAgIH0pLClcbiAgICB9XG4gICAgLy8gY29uZmlnLmVuZFBvaW50TW9kZSA9IGNvbmZpZy5lbmRQb2ludE1vZGUgfHwgJ0dBVEVXQVknXG5cbiAgICAvLyDliJ3lp4vljJbml7boi6XmnKrlhbzlrrnlubPlj7DvvIzliJnkvb/nlKjpu5jorqRhZGFwdGVyXG4gICAgaWYgKCFQbGF0Zm9ybS5hZGFwdGVyKSB7XG4gICAgICB0aGlzLnVzZURlZmF1bHRBZGFwdGVyKClcbiAgICB9XG5cbiAgICBjb25zdCByZXFDb25maWc6IElSZXF1ZXN0Q29uZmlnID0ge1xuICAgICAgdGltZW91dDogY29uZmlnLnRpbWVvdXQgfHwgNTAwMCxcbiAgICAgIHRpbWVvdXRNc2c6IGBbJHtnZXRTZGtOYW1lKCl9XVtSRVFVRVNUIFRJTUVPVVRdIHJlcXVlc3QgaGFkIGJlZW4gYWJvcnQgc2luY2UgZGlkbid0IGZpbmlzaGVkIHdpdGhpbiR7XG4gICAgICAgIGNvbmZpZy50aW1lb3V0IC8gMTAwMFxuICAgICAgfXNgLFxuICAgIH1cblxuICAgIHRoaXMucmVxdWVzdENsaWVudCA9IG5ldyBQbGF0Zm9ybS5hZGFwdGVyLnJlcUNsYXNzKHJlcUNvbmZpZylcblxuICAgIHRoaXMuY2xvdWRiYXNlQ29uZmlnID0ge1xuICAgICAgLi4uREVGQVVMVF9JTklUX0NPTkZJRyxcbiAgICAgIC4uLmNvbmZpZyxcbiAgICAgIGkxOG46IGkxOG5Qcm94eShQbGF0Zm9ybSwgY29uZmlnKSxcbiAgICB9XG5cbiAgICBkZWxldGUgKHRoaXMuY2xvdWRiYXNlQ29uZmlnIGFzIGFueSkubGFuZ1xuICAgIC8vIOS/ruato3RpbWVvdXTlj5blgLxcbiAgICB0aGlzLmNsb3VkYmFzZUNvbmZpZy50aW1lb3V0ID0gdGhpcy5mb3JtYXRUaW1lb3V0KHRoaXMuY2xvdWRiYXNlQ29uZmlnLnRpbWVvdXQpXG4gICAgLy8g5Yid5aeL5YyWY2FjaGXlkoxyZXF1ZXN0XG4gICAgY29uc3QgeyBlbnYsIHBlcnNpc3RlbmNlLCBkZWJ1ZywgdGltZW91dCwgb2F1dGhDbGllbnQsIGkxOG4gfSA9IHRoaXMuY2xvdWRiYXNlQ29uZmlnXG4gICAgaW5pdENhY2hlKHsgZW52LCBwZXJzaXN0ZW5jZSwgZGVidWcsIHBsYXRmb3JtSW5mbzogdGhpcy5wbGF0Zm9ybSB9KVxuXG4gICAgc2V0UmVnaW9uTGV2ZWxFbmRwb2ludChlbnYsIGNvbmZpZy5yZWdpb24gfHwgJycpXG4gICAgc2V0R2F0ZXdheUVuZFBvaW50V2l0aEVudihlbnYsIERFRkFVTFRfUFJPVE9DT0wsIGNvbmZpZy5yZWdpb24gfHwgJycpXG5cbiAgICBjb25zdCBhcHAgPSBuZXcgQ2xvdWRiYXNlKHRoaXMuY2xvdWRiYXNlQ29uZmlnKVxuICAgIGluaXRSZXF1ZXN0KHtcbiAgICAgIGVudixcbiAgICAgIHJlZ2lvbjogY29uZmlnLnJlZ2lvbiB8fCAnJyxcbiAgICAgIHRpbWVvdXQsXG4gICAgICBvYXV0aENsaWVudCxcbiAgICAgIF9mcm9tQXBwOiBhcHAsXG4gICAgICBpMThuLFxuICAgICAgZW5kUG9pbnRNb2RlOiBjb25maWcuZW5kUG9pbnRNb2RlLFxuICAgIH0pXG4gICAgYXBwLnJlcXVlc3RDbGllbnQgPSB0aGlzLnJlcXVlc3RDbGllbnRcbiAgICB0aGlzLmFwcCA9IGFwcFxuICAgIDsodGhpcyBhcyBhbnkpPy5maXJlPy4oJ2Nsb3VkYmFzZV9pbml0JywgYXBwKVxuXG4gICAgdGhpcy50cnkySW5pdEF1dGgoYXBwKVxuXG4gICAgcmV0dXJuIGFwcFxuICB9XG5cbiAgcHVibGljIHVwZGF0ZUNvbmZpZyhjb25maWc6IElDbG91ZGJhc2VVcGdyYWRlZENvbmZpZykge1xuICAgIGNvbnN0IHsgcGVyc2lzdGVuY2UsIGRlYnVnIH0gPSBjb25maWdcbiAgICB0aGlzLmNsb3VkYmFzZUNvbmZpZy5wZXJzaXN0ZW5jZSA9IHBlcnNpc3RlbmNlXG4gICAgdGhpcy5jbG91ZGJhc2VDb25maWcuZGVidWcgPSBkZWJ1Z1xuICAgIC8vIHBlcnNpc3RlbmNl5pS55Yqo5b2x5ZONY2FjaGVcbiAgICBpbml0Q2FjaGUoeyBlbnY6IHRoaXMuY2xvdWRiYXNlQ29uZmlnLmVudiwgcGVyc2lzdGVuY2UsIGRlYnVnLCBwbGF0Zm9ybUluZm86IHRoaXMucGxhdGZvcm0gfSlcbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGVMYW5nKGxhbmc6IExBTkdTKSB7XG4gICAgaWYgKCFsYW5nIHx8IGxhbmcgPT09IHRoaXMuY2xvdWRiYXNlQ29uZmlnLmkxOG4/LmxhbmcpIHJldHVyblxuXG4gICAgdGhpcy5jbG91ZGJhc2VDb25maWcuaTE4bi5sYW5nID0gbGFuZ1xuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyRXh0ZW5zaW9uKGV4dDogSUNsb3VkYmFzZUV4dGVuc2lvbikge1xuICAgIGV4dGVuc2lvbk1hcFtleHQubmFtZV0gPSBleHRcbiAgfVxuICBAY2F0Y2hFcnJvcnNEZWNvcmF0b3Ioe1xuICAgIHRpdGxlOiAn6LCD55So5omp5bGV6IO95Yqb5aSx6LSlJyxcbiAgICBtZXNzYWdlczogW1xuICAgICAgJ+ivt+ehruiupOS7peS4i+WQhOmhue+8micsXG4gICAgICAnICAxIC0g6LCD55SoIGludm9rZUV4dGVuc2lvbigpIOeahOivreazleaIluWPguaVsOaYr+WQpuato+ehricsXG4gICAgICAnICAyIC0g6KKr6LCD55So55qE5omp5bGV6IO95Yqb5piv5ZCm5bey57uP5a6J6KOF5bm26YCa6L+HIHJlZ2lzdGVyRXh0ZW5zaW9uKCkg5rOo5YaMJyxcbiAgICAgIGDlpoLmnpzpl67popjkvp3nhLblrZjlnKjvvIzlu7rorq7liLDlrpjmlrnpl67nrZTnpL7ljLrmj5Dpl67miJblr7vmib7luK7liqnvvJoke0NPTU1VTklUWV9TSVRFX1VSTH1gLFxuICAgIF0sXG4gIH0pXG4gIHB1YmxpYyBhc3luYyBpbnZva2VFeHRlbnNpb24obmFtZTogc3RyaW5nLCBvcHRzOiBhbnkpIHtcbiAgICBjb25zdCBleHQgPSBleHRlbnNpb25NYXBbbmFtZV1cbiAgICBpZiAoIWV4dCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY29kZTogRVJST1JTLklOVkFMSURfUEFSQU1TLFxuICAgICAgICBtc2c6IGBleHRlbnNpb246JHtuYW1lfSBtdXN0IGJlIHJlZ2lzdGVyZWQgYmVmb3JlIGludm9rZWAsXG4gICAgICB9KSwpXG4gICAgfVxuXG4gICAgcmV0dXJuIGF3YWl0IGV4dC5pbnZva2Uob3B0cywgdGhpcylcbiAgfVxuXG4gIHB1YmxpYyB1c2VBZGFwdGVycyhhZGFwdGVyczogQ2xvdWRiYXNlQWRhcHRlciB8IENsb3VkYmFzZUFkYXB0ZXJbXSwgb3B0aW9ucz86IGFueSkge1xuICAgIGNvbnN0IHsgYWRhcHRlciwgcnVudGltZSB9ID0gdXNlQWRhcHRlcnMoYWRhcHRlcnMsIG9wdGlvbnMpIHx8IHt9XG4gICAgYWRhcHRlciAmJiAoUGxhdGZvcm0uYWRhcHRlciA9IGFkYXB0ZXIgYXMgU0RLQWRhcHRlckludGVyZmFjZSlcbiAgICBydW50aW1lICYmIChQbGF0Zm9ybS5ydW50aW1lID0gcnVudGltZSBhcyBzdHJpbmcpXG4gIH1cblxuICBwdWJsaWMgcmVnaXN0ZXJIb29rKGhvb2s6IElDbG91ZGJhc2VIb29rKSB7XG4gICAgcmVnaXN0ZXJIb29rKENsb3VkYmFzZSwgaG9vaylcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3RlckNvbXBvbmVudChjb21wb25lbnQ6IElDbG91ZGJhc2VDb21wb25lbnQpIHtcbiAgICByZWdpc3RlckNvbXBvbmVudChDbG91ZGJhc2UsIGNvbXBvbmVudClcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3RlclZlcnNpb24odmVyc2lvbjogc3RyaW5nKSB7XG4gICAgc2V0U2RrVmVyc2lvbih2ZXJzaW9uKVxuICAgIHRoaXMudmVyc2lvbiA9IHZlcnNpb25cbiAgfVxuXG4gIHB1YmxpYyByZWdpc3RlclNka05hbWUobmFtZTogc3RyaW5nKSB7XG4gICAgc2V0U2RrTmFtZShuYW1lKVxuICB9XG5cbiAgLyoqIOiuvue9riB0Y2IgYXBpIOeahCBlbmRwb2ludCAqL1xuICBwdWJsaWMgcmVnaXN0ZXJFbmRQb2ludCh1cmw6IHN0cmluZywgcHJvdG9jb2w/OiAnaHR0cCcgfCAnaHR0cHMnKSB7XG4gICAgc2V0RW5kUG9pbnRJbmZvKHsgYmFzZVVybDogdXJsLCBwcm90b2NvbCwgZW52OiB0aGlzLmNvbmZpZy5lbnYsIGVuZFBvaW50S2V5OiAnQ0xPVURfQVBJJyB9KVxuICB9XG5cbiAgLyoqIOiuvue9rue9keWFsy90Y2IgYXBp55qEIGVuZFBvaW5077yM6YCa6L+HIGtleSDmjIflrpogKi9cbiAgcHVibGljIHJlZ2lzdGVyRW5kUG9pbnRXaXRoS2V5KHByb3BzOiBJU2V0RW5kUG9pbnRXaXRoS2V5KSB7XG4gICAgc2V0RW5kUG9pbnRJbmZvKHtcbiAgICAgIGVudjogdGhpcy5jb25maWcuZW52LFxuICAgICAgZW5kUG9pbnRLZXk6IHByb3BzLmtleSxcbiAgICAgIGJhc2VVcmw6IHByb3BzLnVybCxcbiAgICAgIHByb3RvY29sOiBwcm9wcy5wcm90b2NvbCxcbiAgICB9KVxuICB9XG5cbiAgLyoqIOaLv+e9keWFsy90Y2IgYXBp55qEIGVuZFBvaW5077yM6YCa6L+HIGtleSDmjIflrpogKi9cbiAgcHVibGljIGdldEVuZFBvaW50V2l0aEtleShrZXk6IEVuZFBvaW50S2V5KSB7XG4gICAgY29uc3QgaW5mbyA9IGdldEVuZFBvaW50SW5mbyh0aGlzLmNvbmZpZy5lbnYsIGtleSlcbiAgICByZXR1cm4ge1xuICAgICAgQkFTRV9VUkw6IGluZm8uYmFzZVVybCxcbiAgICAgIFBST1RPQ09MOiBpbmZvLnByb3RvY29sLFxuICAgIH1cbiAgfVxuXG4gIC8vIOino+aekFVSTOWPguaVsFxuICBwdWJsaWMgcGFyc2VDYXB0Y2hhKHVybCkge1xuICAgIHJldHVybiB1dGlscy5wYXJzZUNhcHRjaGEodXJsKVxuICB9XG5cbiAgcHJpdmF0ZSB1c2VEZWZhdWx0QWRhcHRlcigpIHtcbiAgICBjb25zdCB7IGFkYXB0ZXIsIHJ1bnRpbWUgfSA9IHVzZURlZmF1bHRBZGFwdGVyLmJpbmQodGhpcykoKVxuICAgIFBsYXRmb3JtLmFkYXB0ZXIgPSBhZGFwdGVyIGFzIFNES0FkYXB0ZXJJbnRlcmZhY2VcbiAgICBQbGF0Zm9ybS5ydW50aW1lID0gcnVudGltZSBhcyBzdHJpbmdcbiAgfVxuXG4gIHByaXZhdGUgZm9ybWF0VGltZW91dCh0aW1lb3V0OiBudW1iZXIpIHtcbiAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgIGNhc2UgdGltZW91dCA+IE1BWF9USU1FT1VUOlxuICAgICAgICBwcmludFdhcm4oRVJST1JTLklOVkFMSURfUEFSQU1TLCAndGltZW91dCBpcyBncmVhdGVyIHRoYW4gbWF4aW11bSB2YWx1ZVsxMG1pbl0nKVxuICAgICAgICByZXR1cm4gTUFYX1RJTUVPVVRcbiAgICAgIGNhc2UgdGltZW91dCA8IE1JTl9USU1FT1VUOlxuICAgICAgICBwcmludFdhcm4oRVJST1JTLklOVkFMSURfUEFSQU1TLCAndGltZW91dCBpcyBsZXNzIHRoYW4gbWF4aW11bSB2YWx1ZVsxMDBtc10nKVxuICAgICAgICByZXR1cm4gTUlOX1RJTUVPVVRcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0aW1lb3V0XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB0cnkySW5pdEF1dGgoYXBwID0gdGhpcy5hcHApIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgYXV0aFByb3RvID0gYXBwLmF1dGgoKVxuXG4gICAgICBSZWZsZWN0Lm93bktleXMoYXV0aFByb3RvKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgYXBwLmF1dGhba2V5XSA9IGF1dGhQcm90b1trZXldXG4gICAgICB9KTtcblxuICAgICAgKGFwcC5hdXRoIGFzIGFueSkuX19wcm90b19fID0gYXV0aFByb3RvLl9fcHJvdG9fX1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmxvZygndHJ5MkluaXRBdXRoIGVycm9yOicsIGVycm9yKVxuICAgIH1cbiAgfVxufVxuXG4vLyDnsbvlnovlr7zlh7pcbmV4cG9ydCB0eXBlIHsgQ2xvdWRiYXNlIH1cblxuLy8g5YC85a+85Ye6XG5leHBvcnQgY29uc3QgY2xvdWRiYXNlOiBJQ2xvdWRiYXNlID0gbmV3IENsb3VkYmFzZSgpXG5cbmNsb3VkYmFzZS51c2VBZGFwdGVycyhnZXRXeERlZmF1bHRBZGFwdGVyKCkpXG5cbi8vIOm7mOiupOWvvOWHuuWunuS+i1xuZXhwb3J0IGRlZmF1bHQgY2xvdWRiYXNlXG4iXX0=
}, function(modId) {var map = {"./libs/component":1768287884693,"./libs/adapter":1768287884694,"./libs/cache":1768287884695,"./libs/request":1768287884696,"./constants/common":1768287884697,"./libs/lang":1768287884698}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768287884693, function(require, module, exports) {

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHook = exports.registerComponent = void 0;
var utilities_1 = require("@cloudbase/utilities");
var ERRORS = utilities_1.constants.ERRORS;
var components = {};
function registerComponent(app, component) {
    var name = component.name, namespace = component.namespace, entity = component.entity, injectEvents = component.injectEvents, _a = component.IIFE, IIFE = _a === void 0 ? false : _a;
    if (components[name] || (namespace && app[namespace])) {
        throw new Error(JSON.stringify({
            code: ERRORS.INVALID_OPERATION,
            msg: "Duplicate component ".concat(name),
        }));
    }
    if (IIFE) {
        if (!entity || typeof entity !== 'function') {
            throw new Error(JSON.stringify({
                code: ERRORS.INVALID_PARAMS,
                msg: 'IIFE component\'s entity must be a function',
            }));
        }
        entity.call(app);
    }
    components[name] = component;
    if (namespace) {
        app.prototype[namespace] = entity;
    }
    else {
        deepExtend(app.prototype, entity);
    }
    if (injectEvents) {
        var bus = injectEvents.bus, events = injectEvents.events;
        if (!bus || !events || events.length === 0) {
            return;
        }
        var originCallback_1 = app.prototype.fire || function () { };
        if (!app.prototype.events) {
            app.prototype.events = {};
        }
        var originEvents = app.prototype.events || {};
        if (originEvents[name]) {
            app.prototype.events[name].events = __spreadArray(__spreadArray([], app.prototype.events[name].events, true), events, true);
        }
        else {
            app.prototype.events[name] = { bus: bus, events: events };
        }
        app.prototype.fire = function (eventName, data) {
            originCallback_1(eventName, data);
            var eventNames = Object.keys(this.events);
            for (var _i = 0, eventNames_1 = eventNames; _i < eventNames_1.length; _i++) {
                var name_1 = eventNames_1[_i];
                var _a = this.events[name_1], bus_1 = _a.bus, eventList = _a.events;
                if (eventList.includes(eventName)) {
                    bus_1.fire(eventName, data);
                    break;
                }
            }
        };
    }
}
exports.registerComponent = registerComponent;
function deepExtend(target, source) {
    if (!(source instanceof Object)) {
        return source;
    }
    switch (source.constructor) {
        case Date: {
            var dateValue = source;
            return new Date(dateValue.getTime());
        }
        case Object:
            if (target === undefined) {
                target = {};
            }
            break;
        case Array:
            target = [];
            break;
        default:
            return source;
    }
    var sourceKeys = Object.keys(source);
    for (var _i = 0, sourceKeys_1 = sourceKeys; _i < sourceKeys_1.length; _i++) {
        var key = sourceKeys_1[_i];
        if (!Object.prototype.hasOwnProperty.call(source, key)) {
            continue;
        }
        target[key] = deepExtend(target[key], source[key]);
    }
    return target;
}
function registerHook(app, hook) {
    var entity = hook.entity, target = hook.target;
    if (Object.prototype.hasOwnProperty.call(app, target)) {
        throw new Error(JSON.stringify({
            code: ERRORS.INVALID_OPERATION,
            msg: "target:".concat(target, " is not exist"),
        }));
    }
    var originMethod = app.prototype[target];
    if (typeof originMethod !== 'function') {
        throw new Error(JSON.stringify({
            code: ERRORS.INVALID_OPERATION,
            msg: "target:".concat(target, " is not a function which is the only type supports hook"),
        }));
    }
    app.prototype[target] = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        entity.call.apply(entity, __spreadArray([this], args, false));
        return originMethod.call.apply(originMethod, __spreadArray([this], args, false));
    };
}
exports.registerHook = registerHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYnMvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLGtEQUFnRDtBQUV4QyxJQUFBLE1BQU0sR0FBSyxxQkFBUyxPQUFkLENBQWM7QUFFNUIsSUFBTSxVQUFVLEdBQTRCLEVBQUUsQ0FBQTtBQUU5QyxTQUFnQixpQkFBaUIsQ0FBQyxHQUFRLEVBQUUsU0FBOEI7SUFDaEUsSUFBQSxJQUFJLEdBQW9ELFNBQVMsS0FBN0QsRUFBRSxTQUFTLEdBQXlDLFNBQVMsVUFBbEQsRUFBRSxNQUFNLEdBQWlDLFNBQVMsT0FBMUMsRUFBRSxZQUFZLEdBQW1CLFNBQVMsYUFBNUIsRUFBRSxLQUFpQixTQUFTLEtBQWQsRUFBWixJQUFJLG1CQUFHLEtBQUssS0FBQSxDQUFjO0lBRXpFLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO1FBQ3JELE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUM3QixJQUFJLEVBQUUsTUFBTSxDQUFDLGlCQUFpQjtZQUM5QixHQUFHLEVBQUUsOEJBQXVCLElBQUksQ0FBRTtTQUNuQyxDQUFDLENBQUMsQ0FBQTtLQUNKO0lBRUQsSUFBSSxJQUFJLEVBQUU7UUFDUixJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsRUFBRTtZQUMzQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsY0FBYztnQkFDM0IsR0FBRyxFQUFFLDZDQUE2QzthQUNuRCxDQUFDLENBQUMsQ0FBQTtTQUNKO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUNqQjtJQUVELFVBQVUsQ0FBQyxJQUFJ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WSxFQUFaLHFCQUFZLEVBQVosSUFBWTtZQUFaLHlCQUFZOztRQUM1QyxNQUFNLENBQUMsSUFBSSxPQUFYLE1BQU0saUJBQU0sSUFBSSxHQUFLLElBQUksVUFBQztRQUMxQixPQUFPLFlBQVksQ0FBQyxJQUFJLE9BQWpCLFlBQVksaUJBQU0sSUFBSSxHQUFLLElBQUksVUFBQztJQUN6QyxDQUFDLENBQUE7QUFDSCxDQUFDO0FBbkJELG9DQW1CQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEtWIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcydcbmltcG9ydCB7IElDbG91ZGJhc2VDb21wb25lbnQsIElDbG91ZGJhc2VIb29rIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9jb21wb25lbnQnXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICdAY2xvdWRiYXNlL3V0aWxpdGllcydcblxuY29uc3QgeyBFUlJPUlMgfSA9IGNvbnN0YW50c1xuXG5jb25zdCBjb21wb25lbnRzOiBLVjxJQ2xvdWRiYXNlQ29tcG9uZW50PiA9IHt9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbXBvbmVudChhcHA6IGFueSwgY29tcG9uZW50OiBJQ2xvdWRiYXNlQ29tcG9uZW50KSB7XG4gIGNvbnN0IHsgbmFtZSwgbmFtZXNwYWNlLCBlbnRpdHksIGluamVjdEV2ZW50cywgSUlGRSA9IGZhbHNlIH0gPSBjb21wb25lbnRcbiAgLy8g5LiN5YWB6K646YeN5aSN5rOo5YaM5oiW5ZG95ZCN56m66Ze06YeN5ZCNXG4gIGlmIChjb21wb25lbnRzW25hbWVdIHx8IChuYW1lc3BhY2UgJiYgYXBwW25hbWVzcGFjZV0pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGNvZGU6IEVSUk9SUy5JTlZBTElEX09QRVJBVElPTixcbiAgICAgIG1zZzogYER1cGxpY2F0ZSBjb21wb25lbnQgJHtuYW1lfWAsXG4gICAgfSkpXG4gIH1cbiAgLy8gSUlGReexu+Wei+eahOe7hOS7tuS7pWFwcOS4unNjb3Bl5omn6KGMZW50aXR55Ye95pWw77yM5LiN5oyC6L295YiwYXBwLnByb3RvdHlwZeS4ilxuICBpZiAoSUlGRSkge1xuICAgIGlmICghZW50aXR5IHx8IHR5cGVvZiBlbnRpdHkgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNvZGU6IEVSUk9SUy5JTlZBTElEX1BBUkFNUyxcbiAgICAgICAgbXNnOiAnSUlGRSBjb21wb25lbnRcXCdzIGVudGl0eSBtdXN0IGJlIGEgZnVuY3Rpb24nLFxuICAgICAgfSkpXG4gICAgfVxuICAgIGVudGl0eS5jYWxsKGFwcClcbiAgfVxuXG4gIGNvbXBvbmVudHNbbmFtZV0gPSBjb21wb25lbnRcblxuICBpZiAobmFtZXNwYWNlKSB7XG4gICAgKGFwcCBhcyBhbnkpLnByb3RvdHlwZVtuYW1lc3BhY2VdID0gZW50aXR5XG4gIH0gZWxzZSB7XG4gICAgZGVlcEV4dGVuZCgoYXBwIGFzIGFueSkucHJvdG90eXBlLCBlbnRpdHkpXG4gIH1cbiAgaWYgKGluamVjdEV2ZW50cykge1xuICAgIGNvbnN0IHsgYnVzLCBldmVudHMgfSA9IGluamVjdEV2ZW50c1xuICAgIGlmICghYnVzIHx8ICFldmVudHMgfHwgZXZlbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IG9yaWdpbkNhbGxiYWNrID0gKGFwcCBhcyBhbnkpLnByb3RvdHlwZS5maXJlIHx8IGZ1bmN0aW9uICgpIHt9XG4gICAgaWYgKCEoYXBwIGFzIGFueSkucHJvdG90eXBlLmV2ZW50cykge1xuICAgICAgKGFwcCBhcyBhbnkpLnByb3RvdHlwZS5ldmVudHMgPSB7fVxuICAgIH1cbiAgICBjb25zdCBvcmlnaW5FdmVudHM6IEtWPGFueT4gPSAoYXBwIGFzIGFueSkucHJvdG90eXBlLmV2ZW50cyB8fCB7fVxuICAgIGlmIChvcmlnaW5FdmVudHNbbmFtZV0pIHtcbiAgICAgIChhcHAgYXMgYW55KS5wcm90b3R5cGUuZXZlbnRzW25hbWVdLmV2ZW50cyA9IFsuLi4oYXBwIGFzIGFueSkucHJvdG90eXBlLmV2ZW50c1tuYW1lXS5ldmVudHMsIC4uLmV2ZW50c11cbiAgICB9IGVsc2Uge1xuICAgICAgKGFwcCBhcyBhbnkpLnByb3RvdHlwZS5ldmVudHNbbmFtZV0gPSB7IGJ1cywgZXZlbnRzIH1cbiAgICB9XG4gICAgKGFwcCBhcyBhbnkpLnByb3RvdHlwZS5maXJlID0gZnVuY3Rpb24gKGV2ZW50TmFtZTogc3RyaW5nLCBkYXRhPzogYW55KSB7XG4gICAgICBvcmlnaW5DYWxsYmFjayhldmVudE5hbWUsIGRhdGEpXG4gICAgICBjb25zdCBldmVudE5hbWVzID0gT2JqZWN0LmtleXModGhpcy5ldmVudHMpXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgZXZlbnROYW1lcykge1xuICAgICAgICBjb25zdCB7IGJ1cywgZXZlbnRzOiBldmVudExpc3QgfSA9IHRoaXMuZXZlbnRzW25hbWVdXG4gICAgICAgIGlmIChldmVudExpc3QuaW5jbHVkZXMoZXZlbnROYW1lKSkge1xuICAgICAgICAgIGJ1cy5maXJlKGV2ZW50TmFtZSwgZGF0YSlcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRlZXBFeHRlbmQodGFyZ2V0OiBhbnksIHNvdXJjZTogYW55KTogS1Y8YW55PiB7XG4gIGlmICghKHNvdXJjZSBpbnN0YW5jZW9mIE9iamVjdCkpIHtcbiAgICByZXR1cm4gc291cmNlXG4gIH1cblxuICBzd2l0Y2ggKHNvdXJjZS5jb25zdHJ1Y3Rvcikge1xuICAgIGNhc2UgRGF0ZToge1xuICAgICAgY29uc3QgZGF0ZVZhbHVlID0gc291cmNlIGFzIERhdGVcbiAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlVmFsdWUuZ2V0VGltZSgpKVxuICAgIH1cbiAgICBjYXNlIE9iamVjdDpcbiAgICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0YXJnZXQgPSB7fVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICBjYXNlIEFycmF5OlxuICAgICAgdGFyZ2V0ID0gW11cbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzb3VyY2VcbiAgfVxuICBjb25zdCBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKVxuICBmb3IgKGNvbnN0IGtleSBvZiBzb3VyY2VLZXlzKSB7XG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICB0YXJnZXRba2V5XSA9IGRlZXBFeHRlbmQodGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJIb29rKGFwcDogYW55LCBob29rOiBJQ2xvdWRiYXNlSG9vaykge1xuICBjb25zdCB7IGVudGl0eSwgdGFyZ2V0IH0gPSBob29rXG4gIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYXBwLCB0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGNvZGU6IEVSUk9SUy5JTlZBTElEX09QRVJBVElPTixcbiAgICAgIG1zZzogYHRhcmdldDoke3RhcmdldH0gaXMgbm90IGV4aXN0YCxcbiAgICB9KSlcbiAgfVxuICBjb25zdCBvcmlnaW5NZXRob2QgPSBhcHAucHJvdG90eXBlW3RhcmdldF1cbiAgaWYgKHR5cGVvZiBvcmlnaW5NZXRob2QgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgY29kZTogRVJST1JTLklOVkFMSURfT1BFUkFUSU9OLFxuICAgICAgbXNnOiBgdGFyZ2V0OiR7dGFyZ2V0fSBpcyBub3QgYSBmdW5jdGlvbiB3aGljaCBpcyB0aGUgb25seSB0eXBlIHN1cHBvcnRzIGhvb2tgLFxuICAgIH0pKVxuICB9XG4gIGFwcC5wcm90b3R5cGVbdGFyZ2V0XSA9IGZ1bmN0aW9uICguLi5hcmdzOiBhbnkpIHtcbiAgICBlbnRpdHkuY2FsbCh0aGlzLCAuLi5hcmdzKVxuICAgIHJldHVybiBvcmlnaW5NZXRob2QuY2FsbCh0aGlzLCAuLi5hcmdzKVxuICB9XG59XG4iXX0=
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768287884694, function(require, module, exports) {

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWxDefaultAdapter = exports.Platform = void 0;
var adapter_wx_mp_1 = __importStar(require("@cloudbase/adapter-wx_mp"));
var adapter_interface_1 = require("@cloudbase/adapter-interface");
exports.Platform = {};
var getWxDefaultAdapter = function () {
    adapter_wx_mp_1.WxRequest.prototype.upload = function (options) {
        var _this = this;
        var self = this;
        return new Promise(function (resolve) {
            var url = options.url, file = options.file, data = options.data, headers = options.headers;
            var fs = wx.getFileSystemManager();
            var task = wx.request({
                url: url,
                method: options.method,
                header: __assign({ 'content-type': ' ' }, headers),
                data: fs.readFileSync(file),
                timeout: _this._timeout,
                success: function (res) {
                    var result = {
                        statusCode: res.statusCode,
                        data: res.data || {},
                    };
                    if (res.statusCode === 200 && (data === null || data === void 0 ? void 0 : data.success_action_status)) {
                        result.statusCode = parseInt(data.success_action_status, 10);
                    }
                    resolve(result);
                },
                fail: function (err) {
                    resolve(err);
                },
                complete: function (err) {
                    if (!(err === null || err === void 0 ? void 0 : err.errMsg)) {
                        return;
                    }
                    if (!self._timeout || self._restrictedMethods.indexOf('upload') === -1) {
                        return;
                    }
                    var errMsg = err.errMsg;
                    if (errMsg === 'request:fail timeout') {
                        console.warn(self._timeoutMsg);
                        try {
                            task.abort();
                        }
                        catch (e) { }
                    }
                },
            });
        });
    };
    function isPlugin() {
        return (typeof App === 'undefined'
            && typeof getApp === 'undefined'
            && !wx.onAppHide
            && !wx.offAppHide
            && !wx.onAppShow
            && !wx.offAppShow);
    }
    adapter_wx_mp_1.default.genAdapter = function genAdapter(options) {
        var adapter = {
            root: { globalThis: {} },
            reqClass: adapter_wx_mp_1.WxRequest,
            wsClass: adapter_wx_mp_1.WxMpWebSocket,
            captchaOptions: {
                openURIWithCallback: function (_url) {
                    var EventBus = options.EventBus;
                    var queryObj = {};
                    var url = _url;
                    console.log('openURIWithCallback', _url);
                    var matched = _url.match(/^(data:.*?)(\?[^#\s]*)?$/);
                    if (matched) {
                        url = matched[1];
                        console.log('openURIWithCallback url', url);
                        var search = matched[2];
                        if (search) {
                            queryObj = (0, adapter_wx_mp_1.parseQueryString)(search);
                        }
                    }
                    console.log('openURIWithCallback queryObj', queryObj);
                    var token = queryObj.token, restQueryObj = __rest(queryObj, ["token"]);
                    if (/^data:/.test(url) && !token) {
                        return Promise.reject({
                            error: 'invalid_argument',
                            error_description: "invalie captcha data: ".concat(_url),
                        });
                    }
                    if (!token) {
                        return Promise.reject({
                            error: 'unimplemented',
                            error_description: 'need to impl captcha data',
                        });
                    }
                    return new Promise(function (resolve) {
                        console.log('wait for captcha...');
                        EventBus.$emit('CAPTCHA_DATA_CHANGE', __assign(__assign({}, restQueryObj), { token: token, url: url }));
                        EventBus.$once('RESOLVE_CAPTCHA_DATA', function (res) {
                            resolve(res);
                        });
                    });
                },
            },
            localStorage: adapter_wx_mp_1.wxMpStorage,
            primaryStorage: adapter_interface_1.StorageType.local,
            getAppSign: function () {
                var info = wx.getAccountInfoSync();
                if (isPlugin()) {
                    return info && info.plugin ? info.plugin.appId : '';
                }
                return info && info.miniProgram ? info.miniProgram.appId : '';
            },
        };
        return adapter;
    };
    return adapter_wx_mp_1.default;
};
exports.getWxDefaultAdapter = getWxDefaultAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWJzL2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esd0VBQWtIO0FBQ2xILGtFQUFpRjtBQU1wRSxRQUFBLFFBQVEsR0FBMkIsRUFBRSxDQUFBO0FBRTNDLElBQU0sbUJBQW1CLEdBQUc7SUFDakMseUJBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVUsT0FBOEI7UUFBeEMsaUJBNkM1QjtRQTNDQyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUE7UUFDakIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU87WUFDakIsSUFBQSxHQUFHLEdBQTBCLE9BQU8sSUFBakMsRUFBRSxJQUFJLEdBQW9CLE9BQU8sS0FBM0IsRUFBRSxJQUFJLEdBQWMsT0FBTyxLQUFyQixFQUFFLE9BQU8sR0FBSyxPQUFPLFFBQVosQ0FBWTtZQUM1QyxJQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtZQUNwQyxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDO2dCQUN0QixHQUFHLEtBQUE7Z0JBQ0gsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO2dCQUN0QixNQUFNLGFBQ0osY0FBYyxFQUFFLEdBQUcsSUFDaEIsT0FBTyxDQUNYO2dCQUNELElBQUksRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDM0IsT0FBTyxFQUFFLEtBQUksQ0FBQyxRQUFRO2dCQUN0QixPQUFPLFlBQUMsR0FBMEM7b0JBQ2hELElBQU0sTUFBTSxHQUFHO3dCQUNiLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVTt3QkFDMUIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRTtxQkFDckIsQ0FBQTtvQkFDRCxJQUFJLEdBQUcsQ0FB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RixDQUFBO1FBQ0QsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQyxDQUFBO0lBRUQsT0FBTyx1QkFBYyxDQUFBO0FBQ3ZCLENBQUMsQ0FBQTtBQXpIWSxRQUFBLG1CQUFtQix1QkF5SC9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSUNsb3VkYmFzZVBsYXRmb3JtSW5mbyB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMnXG5pbXBvcnQgYWRhcHRlckZvcld4TXAsIHsgV3hSZXF1ZXN0LCBXeE1wV2ViU29ja2V0LCB3eE1wU3RvcmFnZSwgcGFyc2VRdWVyeVN0cmluZyB9IGZyb20gJ0BjbG91ZGJhc2UvYWRhcHRlci13eF9tcCdcbmltcG9ydCB7IElVcGxvYWRSZXF1ZXN0T3B0aW9ucywgU3RvcmFnZVR5cGUgfSBmcm9tICdAY2xvdWRiYXNlL2FkYXB0ZXItaW50ZXJmYWNlJ1xuXG5kZWNsYXJlIGNvbnN0IHd4OiBhbnlcbmRlY2xhcmUgY29uc3QgQXBwOiBhbnlcbmRlY2xhcmUgY29uc3QgZ2V0QXBwOiBhbnlcblxuZXhwb3J0IGNvbnN0IFBsYXRmb3JtOiBJQ2xvdWRiYXNlUGxhdGZvcm1JbmZvID0ge31cblxuZXhwb3J0IGNvbnN0IGdldFd4RGVmYXVsdEFkYXB0ZXIgPSAoKSA9PiB7XG4gIFd4UmVxdWVzdC5wcm90b3R5cGUudXBsb2FkID0gZnVuY3Rpb24gKG9wdGlvbnM6IElVcGxvYWRSZXF1ZXN0T3B0aW9ucykge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBjb25zdCB7IHVybCwgZmlsZSwgZGF0YSwgaGVhZGVycyB9ID0gb3B0aW9uc1xuICAgICAgY29uc3QgZnMgPSB3eC5nZXRGaWxlU3lzdGVtTWFuYWdlcigpIC8vIOivu+WPluaWh+S7tiDkuozov5vliLblhoXlrrlcbiAgICAgIGNvbnN0IHRhc2sgPSB3eC5yZXF1ZXN0KHtcbiAgICAgICAgdXJsLFxuICAgICAgICBtZXRob2Q6IG9wdGlvbnMubWV0aG9kLFxuICAgICAgICBoZWFkZXI6IHtcbiAgICAgICAgICAnY29udGVudC10eXBlJzogJyAnLCAvLyDlsI/nqIvluo8gY29udGVudC10eXBlIOm7mOiupOS4uiBhcHBsaWNhdGlvbi9qc29u77yMIOi/memHjOS4gOWumuimgeW8uuWItuS4uiDnqbrvvIwg5ZCm5YiZ562+5ZCN6ZSZ6K+vXG4gICAgICAgICAgLi4uaGVhZGVycyxcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogZnMucmVhZEZpbGVTeW5jKGZpbGUpLCAvLyDlsIbkuozov5vliLbmlofku7bovazkuLrlrZfnrKbkuLLnm7TmjqXotYvlgLzliLAgcmVxdWVzdCBwYXlsb2Fk77yMIOS4jeimgeS7pSBmb3JtIOeahOaWueW8j+S8oOi+k1xuICAgICAgICB0aW1lb3V0OiB0aGlzLl90aW1lb3V0LFxuICAgICAgICBzdWNjZXNzKHJlczogeyBzdGF0dXNDb2RlOiBudW1iZXI7IGRhdGE6IHVua25vd24gfSkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IHJlcy5zdGF0dXNDb2RlLFxuICAgICAgICAgICAgZGF0YTogcmVzLmRhdGEgfHwge30sXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyZXMuc3RhdHVzQ29kZSA9PT0gMjAwICYmIGRhdGE/LnN1Y2Nlc3NfYWN0aW9uX3N0YXR1cykge1xuICAgICAgICAgICAgcmVzdWx0LnN0YXR1c0NvZGUgPSBwYXJzZUludChkYXRhLnN1Y2Nlc3NfYWN0aW9uX3N0YXR1cywgMTApXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUocmVzdWx0KVxuICAgICAgICB9LFxuICAgICAgICBmYWlsKGVycjogdW5rbm93bikge1xuICAgICAgICAgIHJlc29sdmUoZXJyKVxuICAgICAgICB9LFxuICAgICAgICBjb21wbGV0ZShlcnI6IHsgZXJyTXNnOiBzdHJpbmcgfSkge1xuICAgICAgICAgIGlmICghZXJyPy5lcnJNc2cpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXNlbGYuX3RpbWVvdXQgfHwgc2VsZi5fcmVzdHJpY3RlZE1ldGhvZHMuaW5kZXhPZigndXBsb2FkJykgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgeyBlcnJNc2cgfSA9IGVyclxuICAgICAgICAgIGlmIChlcnJNc2cgPT09ICdyZXF1ZXN0OmZhaWwgdGltZW91dCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihzZWxmLl90aW1lb3V0TXNnKVxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgdGFzay5hYm9ydCgpXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzUGx1Z2luKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0eXBlb2YgQXBwID09PSAndW5kZWZpbmVkJ1xuICAgICAgJiYgdHlwZW9mIGdldEFwcCA9PT0gJ3VuZGVmaW5lZCdcbiAgICAgICYmICF3eC5vbkFwcEhpZGVcbiAgICAgICYmICF3eC5vZmZBcHBIaWRlXG4gICAgICAmJiAhd3gub25BcHBTaG93XG4gICAgICAmJiAhd3gub2ZmQXBwU2hvd1xuICAgIClcbiAgfVxuICBhZGFwdGVyRm9yV3hNcC5nZW5BZGFwdGVyID0gZnVuY3Rpb24gZ2VuQWRhcHRlcihvcHRpb25zKSB7XG4gICAgY29uc3QgYWRhcHRlciA9IHtcbiAgICAgIHJvb3Q6IHsgZ2xvYmFsVGhpczoge30gfSxcbiAgICAgIHJlcUNsYXNzOiBXeFJlcXVlc3QsXG4gICAgICB3c0NsYXNzOiBXeE1wV2ViU29ja2V0LFxuICAgICAgY2FwdGNoYU9wdGlvbnM6IHtcbiAgICAgICAgb3BlblVSSVdpdGhDYWxsYmFjazogKF91cmw6IHN0cmluZykgPT4ge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgICAgICAgICBjb25zdCB7IEV2ZW50QnVzIH0gPSBvcHRpb25zXG4gICAgICAgICAgbGV0IHF1ZXJ5T2JqOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge31cbiAgICAgICAgICBsZXQgdXJsID0gX3VybFxuICAgICAgICAgIGNvbnNvbGUubG9nKCdvcGVuVVJJV2l0aENhbGxiYWNrJywgX3VybClcbiAgICAgICAgICBjb25zdCBtYXRjaGVkID0gX3VybC5tYXRjaCgvXihkYXRhOi4qPykoXFw/W14jXFxzXSopPyQvKVxuICAgICAgICAgIGlmIChtYXRjaGVkKSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLWRlc3RydWN0dXJpbmdcbiAgICAgICAgICAgIHVybCA9IG1hdGNoZWRbMV1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdvcGVuVVJJV2l0aENhbGxiYWNrIHVybCcsIHVybClcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IG1hdGNoZWRbMl1cbiAgICAgICAgICAgIGlmIChzZWFyY2gpIHtcbiAgICAgICAgICAgICAgcXVlcnlPYmogPSBwYXJzZVF1ZXJ5U3RyaW5nKHNlYXJjaClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc29sZS5sb2coJ29wZW5VUklXaXRoQ2FsbGJhY2sgcXVlcnlPYmonLCBxdWVyeU9iailcbiAgICAgICAgICBjb25zdCB7IHRva2VuLCAuLi5yZXN0UXVlcnlPYmogfSA9IHF1ZXJ5T2JqXG4gICAgICAgICAgaWYgKC9eZGF0YTovLnRlc3QodXJsKSAmJiAhdG9rZW4pIHtcbiAgICAgICAgICAgIC8vIOWmguaenOaYryBkYXRhOiDlvIDlpLTnmoQgVVJMIOS4lOayoeaciSB0b2tlbu+8jOWImeebtOaOpei/lOWbnlxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHtcbiAgICAgICAgICAgICAgZXJyb3I6ICdpbnZhbGlkX2FyZ3VtZW50JyxcbiAgICAgICAgICAgICAgZXJyb3JfZGVzY3JpcHRpb246IGBpbnZhbGllIGNhcHRjaGEgZGF0YTogJHtfdXJsfWAsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3Qoe1xuICAgICAgICAgICAgICBlcnJvcjogJ3VuaW1wbGVtZW50ZWQnLFxuICAgICAgICAgICAgICBlcnJvcl9kZXNjcmlwdGlvbjogJ25lZWQgdG8gaW1wbCBjYXB0Y2hhIGRhdGEnLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnd2FpdCBmb3IgY2FwdGNoYS4uLicpXG4gICAgICAgICAgICBFdmVudEJ1cy4kZW1pdCgnQ0FQVENIQV9EQVRBX0NIQU5HRScsIHsgLi4ucmVzdFF1ZXJ5T2JqLCB0b2tlbiwgdXJsIH0pXG5cbiAgICAgICAgICAgIC8vIOebkeWQrOS6i+S7tuaAu+e6v++8jOetieW+hemqjOivgeeggeaVsOaNruWPmOWMllxuICAgICAgICAgICAgRXZlbnRCdXMuJG9uY2UoJ1JFU09MVkVfQ0FQVENIQV9EQVRBJywgKHJlczogeyBjYXB0Y2hhX3Rva2VuOiBzdHJpbmc7IGV4cGlyZXNfaW46IG51bWJlciB9KSA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUocmVzKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGxvY2FsU3RvcmFnZTogd3hNcFN0b3JhZ2UsXG4gICAgICBwcmltYXJ5U3RvcmFnZTogU3RvcmFnZVR5cGUubG9jYWwsXG4gICAgICBnZXRBcHBTaWduKCkge1xuICAgICAgICBjb25zdCBpbmZvID0gd3guZ2V0QWNjb3VudEluZm9TeW5jKClcbiAgICAgICAgaWYgKGlzUGx1Z2luKCkpIHtcbiAgICAgICAgICAvLyDmj5Lku7bnjq/looPov5Tlm57mj5Lku7ZhcHBpZFxuICAgICAgICAgIHJldHVybiBpbmZvICYmIGluZm8ucGx1Z2luID8gaW5mby5wbHVnaW4uYXBwSWQgOiAnJ1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmZvICYmIGluZm8ubWluaVByb2dyYW0gPyBpbmZvLm1pbmlQcm9ncmFtLmFwcElkIDogJydcbiAgICAgIH0sXG4gICAgfVxuICAgIHJldHVybiBhZGFwdGVyXG4gIH1cblxuICByZXR1cm4gYWRhcHRlckZvcld4TXBcbn1cbiJdfQ==
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768287884695, function(require, module, exports) {

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalCache = exports.getCacheByEnvId = exports.initCache = void 0;
var utilities_1 = require("@cloudbase/utilities");
var USER_INFO_KEY = 'user_info';
var CloudbaseCache = utilities_1.cache.CloudbaseCache;
var cacheMap = {};
var localCacheMap = {};
function initCache(config) {
    var env = config.env, platformInfo = config.platformInfo;
    var userInfoKey = "".concat(USER_INFO_KEY, "_").concat(env);
    var keys = {
        userInfoKey: userInfoKey,
    };
    cacheMap[env] = cacheMap[env] || (new CloudbaseCache(__assign(__assign({}, config), { keys: keys, platformInfo: platformInfo })));
    localCacheMap[env] = localCacheMap[env] || new CloudbaseCache(__assign(__assign({}, config), { keys: keys, platformInfo: platformInfo, persistence: 'local' }));
}
exports.initCache = initCache;
function getCacheByEnvId(env) {
    return cacheMap[env];
}
exports.getCacheByEnvId = getCacheByEnvId;
function getLocalCache(env) {
    return localCacheMap[env];
}
exports.getLocalCache = getLocalCache;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGlicy9jYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUNBLGtEQUE0QztBQUc1QyxJQUFNLGFBQWEsR0FBRyxXQUFXLENBQUE7QUFFekIsSUFBQSxjQUFjLEdBQUssaUJBQUssZUFBVixDQUFVO0FBRWhDLElBQU0sUUFBUSxHQUF3QixFQUFFLENBQUE7QUFFeEMsSUFBTSxhQUFhLEdBQXdCLEVBQUUsQ0FBQTtBQUU3QyxTQUFnQixTQUFTLENBQUMsTUFBc0M7SUFDdEQsSUFBQSxHQUFHLEdBQW1CLE1BQU0sSUFBekIsRUFBRSxZQUFZLEdBQUssTUFBTSxhQUFYLENBQVc7SUFFcEMsSUFBTSxXQUFXLEdBQUcsVUFBRyxhQUFhLGNBQUksR0FBRyxDQUFFLENBQUE7SUFFN0MsSUFBTSxJQUFJLEdBQUc7UUFDWCxXQUFXLGFBQUE7S0FDWixDQUFBO0lBRUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksY0FBYyx1QkFDL0MsTUFBTSxLQUNULElBQUksTUFBQSxFQUNKLFlBQVksY0FBQSxJQUNaLENBQUMsQ0FBQTtJQUNILGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxjQUFjLHVCQUN4RCxNQUFNLEtBQ1QsSUFBSSxNQUFBLEVBQ0osWUFBWSxjQUFBLEVBQ1osV0FBVyxFQUFFLE9BQU8sSUFDcEIsQ0FBQTtBQUNKLENBQUM7QUFwQkQsOEJBb0JDO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLEdBQVc7SUFDekMsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEIsQ0FBQztBQUZELDBDQUVDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLEdBQVc7SUFDdkMsT0FBTyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDM0IsQ0FBQztBQUZELHNDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgS1YgfSBmcm9tICdAY2xvdWRiYXNlL3R5cGVzJ1xuaW1wb3J0IHsgY2FjaGUgfSBmcm9tICdAY2xvdWRiYXNlL3V0aWxpdGllcydcbmltcG9ydCB7IElDbG91ZGJhc2VDYWNoZSwgSUNhY2hlQ29uZmlnIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9jYWNoZSdcblxuY29uc3QgVVNFUl9JTkZPX0tFWSA9ICd1c2VyX2luZm8nXG5cbmNvbnN0IHsgQ2xvdWRiYXNlQ2FjaGUgfSA9IGNhY2hlXG5cbmNvbnN0IGNhY2hlTWFwOiBLVjxJQ2xvdWRiYXNlQ2FjaGU+ID0ge31cbi8vIOacrOWcsOWtmOWCqFxuY29uc3QgbG9jYWxDYWNoZU1hcDogS1Y8SUNsb3VkYmFzZUNhY2hlPiA9IHt9XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0Q2FjaGUoY29uZmlnOiBJQ2FjaGVDb25maWcgJiB7IGVudjogc3RyaW5nIH0pIHtcbiAgY29uc3QgeyBlbnYsIHBsYXRmb3JtSW5mbyB9ID0gY29uZmlnXG5cbiAgY29uc3QgdXNlckluZm9LZXkgPSBgJHtVU0VSX0lORk9fS0VZfV8ke2Vudn1gXG5cbiAgY29uc3Qga2V5cyA9IHtcbiAgICB1c2VySW5mb0tleSxcbiAgfVxuICAvLyDoi6XmjIflrpplbnblt7LlrZjlnKhjYWNoZeWImeWwneivleabtOaWsHBlcnNpc3RlbmNlXG4gIGNhY2hlTWFwW2Vudl0gPSBjYWNoZU1hcFtlbnZdIHx8IChuZXcgQ2xvdWRiYXNlQ2FjaGUoe1xuICAgIC4uLmNvbmZpZyxcbiAgICBrZXlzLFxuICAgIHBsYXRmb3JtSW5mbyxcbiAgfSkpXG4gIGxvY2FsQ2FjaGVNYXBbZW52XSA9IGxvY2FsQ2FjaGVNYXBbZW52XSB8fCBuZXcgQ2xvdWRiYXNlQ2FjaGUoe1xuICAgIC4uLmNvbmZpZyxcbiAgICBrZXlzLFxuICAgIHBsYXRmb3JtSW5mbyxcbiAgICBwZXJzaXN0ZW5jZTogJ2xvY2FsJyxcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlQnlFbnZJZChlbnY6IHN0cmluZyk6IElDbG91ZGJhc2VDYWNoZSB7XG4gIHJldHVybiBjYWNoZU1hcFtlbnZdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbENhY2hlKGVudjogc3RyaW5nKTogSUNsb3VkYmFzZUNhY2hlIHtcbiAgcmV0dXJuIGxvY2FsQ2FjaGVNYXBbZW52XVxufVxuIl19
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768287884696, function(require, module, exports) {

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestByEnvId = exports.initRequest = exports.CloudbaseRequest = void 0;
var common_1 = require("../constants/common");
var utilities_1 = require("@cloudbase/utilities");
var cache_1 = require("./cache");
var adapter_1 = require("./adapter");
var ERRORS = utilities_1.constants.ERRORS;
var genSeqId = utilities_1.utils.genSeqId, isFormData = utilities_1.utils.isFormData, formatUrl = utilities_1.utils.formatUrl;
var ACTIONS_WITHOUT_ACCESSTOKEN = [
    'auth.getJwt',
    'auth.logout',
    'auth.signInWithTicket',
    'auth.signInAnonymously',
    'auth.signIn',
    'auth.fetchAccessTokenWithRefreshToken',
    'auth.signUpWithEmailAndPassword',
    'auth.activateEndUserMail',
    'auth.sendPasswordResetEmail',
    'auth.resetPasswordWithToken',
    'auth.isUsernameRegistered',
];
function bindHooks(instance, name, hooks) {
    var originMethod = instance[name];
    instance[name] = function (options) {
        var data = {};
        var headers = {};
        hooks.forEach(function (hook) {
            var _a = hook.call(instance, options), appendedData = _a.data, appendedHeaders = _a.headers;
            Object.assign(data, appendedData);
            Object.assign(headers, appendedHeaders);
        });
        var originData = options.data;
        originData
            && (function () {
                if (isFormData(originData)) {
                    Object.keys(data).forEach(function (key) {
                        originData.append(key, data[key]);
                    });
                    return;
                }
                options.data = __assign(__assign({}, originData), data);
            })();
        options.headers = __assign(__assign({}, (options.headers || {})), headers);
        return originMethod.call(instance, options);
    };
}
function beforeEach() {
    var seqId = genSeqId();
    return {
        data: {
            seqId: seqId,
        },
        headers: {
            'X-SDK-Version': "@cloudbase/js-sdk/".concat((0, common_1.getSdkVersion)()),
            'x-seqid': seqId,
        },
    };
}
var CloudbaseRequest = (function () {
    function CloudbaseRequest(config) {
        var _this = this;
        this.throwWhenRequestFail = false;
        this.config = config;
        var reqConfig = {
            timeout: this.config.timeout,
            timeoutMsg: "[@cloudbase/js-sdk] \u8BF7\u6C42\u5728".concat(this.config.timeout / 1000, "s\u5185\u672A\u5B8C\u6210\uFF0C\u5DF2\u4E2D\u65AD"),
            restrictedMethods: ['post', 'put'],
        };
        this.reqClass = new adapter_1.Platform.adapter.reqClass(reqConfig);
        this.throwWhenRequestFail = config.throw || false;
        this.localCache = (0, cache_1.getLocalCache)(this.config.env);
        if (this.config.endPointMode !== 'GATEWAY') {
            bindHooks(this.reqClass, 'post', [beforeEach]);
            bindHooks(this.reqClass, 'upload', [beforeEach]);
            bindHooks(this.reqClass, 'download', [beforeEach]);
        }
        utilities_1.langEvent.bus.on(utilities_1.langEvent.LANG_CHANGE_EVENT, function (params) {
            var _a;
            _this.config.i18n = ((_a = params.data) === null || _a === void 0 ? void 0 : _a.i18n) || _this.config.i18n;
        });
    }
    CloudbaseRequest.prototype.getAccessToken = function (token) {
        if (token === void 0) { token = null; }
        return __awaiter(this, void 0, void 0, function () {
            var app, oauthInstance, oauthClient;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (token != null) {
                            return [2, token];
                        }
                        app = this.config._fromApp;
                        if (!app.oauthInstance) {
                            throw new Error('you can\'t request without auth');
                        }
                        oauthInstance = app.oauthInstance;
                        oauthClient = oauthInstance.oauth2client;
                        return [4, this.getOauthAccessTokenV2(oauthClient)];
                    case 1: return [2, (_a.sent()).accessToken];
                }
            });
        });
    };
    CloudbaseRequest.prototype.getDefaultHeaders = function () {
        var _a;
        var _b, _c;
        return _a = {},
            _a[(_b = this.config.i18n) === null || _b === void 0 ? void 0 : _b.LANG_HEADER_KEY] = (_c = this.config.i18n) === null || _c === void 0 ? void 0 : _c.lang,
            _a['X-SDK-Version'] = "@cloudbase/js-sdk/".concat((0, common_1.getSdkVersion)()),
            _a;
    };
    CloudbaseRequest.prototype.post = function (options, customReqOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.reqClass.post(__assign(__assign({}, options), { headers: __assign(__assign({}, options.headers), this.getDefaultHeaders()), customReqOpts: customReqOpts }))];
                    case 1:
                        res = _a.sent();
                        return [2, res];
                }
            });
        });
    };
    CloudbaseRequest.prototype.upload = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.reqClass.upload(__assign(__assign({}, options), { headers: __assign(__assign({}, options.headers), this.getDefaultHeaders()) }))];
                    case 1:
                        res = _a.sent();
                        return [2, res];
                }
            });
        });
    };
    CloudbaseRequest.prototype.download = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.reqClass.download(__assign(__assign({}, options), { headers: __assign(__assign({}, options.headers), this.getDefaultHeaders()) }))];
                    case 1:
                        res = _a.sent();
                        return [2, res];
                }
            });
        });
    };
    CloudbaseRequest.prototype.getBaseEndPoint = function (endPointKey) {
        if (endPointKey === void 0) { endPointKey = 'CLOUD_API'; }
        return (0, common_1.getBaseEndPoint)(this.config.env, endPointKey);
    };
    CloudbaseRequest.prototype.getOauthAccessTokenV2 = function (oauthClient) {
        return __awaiter(this, void 0, void 0, function () {
            var validAccessToken, credentials;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, oauthClient.getAccessToken()];
                    case 1:
                        validAccessToken = _a.sent();
                        return [4, oauthClient.getCredentials()];
                    case 2:
                        credentials = _a.sent();
                        return [2, {
                                accessToken: validAccessToken,
                                accessTokenExpire: new Date(credentials.expires_at).getTime(),
                            }];
                }
            });
        });
    };
    CloudbaseRequest.prototype.request = function (action, params, options, customReqOpts) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var tcbTraceKey, contentType, tmpObj, app, oauthInstance, oauthClient, _c, payload, opts, traceHeader, parse, inQuery, search, formatQuery, endPointMode, url, BASE_URL, PROTOCOL, newUrl, res, resTraceHeader;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        tcbTraceKey = "x-tcb-trace_".concat(this.config.env);
                        contentType = 'application/x-www-form-urlencoded';
                        tmpObj = __assign({ action: action, dataVersion: common_1.DATA_VERSION, env: this.config.env }, params);
                        if (!(ACTIONS_WITHOUT_ACCESSTOKEN.indexOf(action) === -1)) return [3, 2];
                        app = this.config._fromApp;
                        if (!app.oauthInstance) {
                            throw new Error('you can\'t request without auth');
                        }
                        oauthInstance = app.oauthInstance;
                        oauthClient = oauthInstance.oauth2client;
                        _c = tmpObj;
                        return [4, this.getOauthAccessTokenV2(oauthClient)];
                    case 1:
                        _c.access_token = (_d.sent()).accessToken;
                        _d.label = 2;
                    case 2:
                        if (action === 'storage.uploadFile') {
                            payload = new FormData();
                            Object.keys(payload).forEach(function (key) {
                                if (Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== undefined) {
                                    payload.append(key, tmpObj[key]);
                                }
                            });
                            contentType = 'multipart/form-data';
                        }
                        else {
                            contentType = 'application/json;charset=UTF-8';
                            payload = {};
                            Object.keys(tmpObj).forEach(function (key) {
                                if (tmpObj[key] !== undefined) {
                                    payload[key] = tmpObj[key];
                                }
                            });
                        }
                        opts = {
                            headers: __assign(__assign({ 'content-type': contentType }, this.getDefaultHeaders()), options === null || options === void 0 ? void 0 : options.headers),
                        };
                        if (options === null || options === void 0 ? void 0 : options.onUploadProgress) {
                            opts.onUploadProgress = options.onUploadProgress;
                        }
                        if (this.config.region) {
                            opts.headers['X-TCB-Region'] = this.config.region;
                        }
                        traceHeader = this.localCache.getStore(tcbTraceKey);
                        if (traceHeader) {
                            opts.headers['X-TCB-Trace'] = traceHeader;
                        }
                        parse = (options === null || options === void 0 ? void 0 : options.parse) !== undefined ? options.parse : params.parse;
                        inQuery = (options === null || options === void 0 ? void 0 : options.inQuery) !== undefined ? options.inQuery : params.inQuery;
                        search = (options === null || options === void 0 ? void 0 : options.search) !== undefined ? options.search : params.search;
                        formatQuery = __assign(__assign({}, ((options === null || options === void 0 ? void 0 : options.defaultQuery) || {})), { env: this.config.env });
                        parse && (formatQuery.parse = true);
                        inQuery
                            && (formatQuery = __assign(__assign({}, inQuery), formatQuery));
                        endPointMode = this.config.endPointMode || 'CLOUD_API';
                        url = (0, common_1.getEndPointInfo)(this.config.env, endPointMode);
                        BASE_URL = url.baseUrl;
                        PROTOCOL = url.protocol;
                        if (endPointMode === 'GATEWAY') {
                            if (action === 'functions.invokeFunction' || /^(storage|database)\./.test(action)) {
                                BASE_URL = "".concat(BASE_URL.match(/\/\/([^/?#]*)/)[0], "/web");
                            }
                        }
                        if (options.pathname) {
                            newUrl = formatUrl(PROTOCOL, "".concat((_a = (0, common_1.getBaseEndPoint)(this.config.env, endPointMode)) === null || _a === void 0 ? void 0 : _a.replace(/^https?:/, ''), "/").concat(options.pathname), formatQuery);
                        }
                        else {
                            newUrl = formatUrl(PROTOCOL, BASE_URL, formatQuery);
                        }
                        if (search) {
                            newUrl += search;
                        }
                        return [4, this.post(__assign({ url: newUrl, data: payload }, opts), customReqOpts)];
                    case 3:
                        res = _d.sent();
                        resTraceHeader = (_b = res.header) === null || _b === void 0 ? void 0 : _b['x-tcb-trace'];
                        if (resTraceHeader) {
                            this.localCache.setStore(tcbTraceKey, resTraceHeader);
                        }
                        if ((Number(res.status) !== 200 && Number(res.statusCode) !== 200) || !res.data) {
                            throw new Error('network request error');
                        }
                        return [2, res];
                }
            });
        });
    };
    CloudbaseRequest.prototype.fetch = function (options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function () {
            var token, _j, headers, restOptions, doFetch, result, err_1;
            var _this = this;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        token = options.token, _j = options.headers, headers = _j === void 0 ? {} : _j, restOptions = __rest(options, ["token", "headers"]);
                        doFetch = function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c;
                            var _d, _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        _b = (_a = this.reqClass).fetch;
                                        _d = {};
                                        _e = { 'X-SDK-Version': "@cloudbase/js-sdk/".concat((0, common_1.getSdkVersion)()) };
                                        _c = "Bearer ".concat;
                                        return [4, this.getAccessToken(token)];
                                    case 1: return [2, _b.apply(_a, [__assign.apply(void 0, [(_d.headers = __assign.apply(void 0, [__assign.apply(void 0, [(_e.Authorization = _c.apply("Bearer ", [_f.sent()]), _e), this.getDefaultHeaders()]), headers]), _d), restOptions])])];
                                }
                            });
                        }); };
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 3, , 6]);
                        return [4, doFetch()];
                    case 2:
                        result = _k.sent();
                        return [2, result];
                    case 3:
                        err_1 = _k.sent();
                        if (!((err_1 === null || err_1 === void 0 ? void 0 : err_1.code) === 'ACCESS_TOKEN_EXPIRED')) return [3, 5];
                        if (typeof ((_d = (_c = (_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a._fromApp) === null || _b === void 0 ? void 0 : _b.oauthInstance) === null || _c === void 0 ? void 0 : _c.authApi) === null || _d === void 0 ? void 0 : _d.refreshTokenForce) !== 'function') {
                            throw err_1;
                        }
                        return [4, ((_h = (_g = (_f = (_e = this.config) === null || _e === void 0 ? void 0 : _e._fromApp) === null || _f === void 0 ? void 0 : _f.oauthInstance) === null || _g === void 0 ? void 0 : _g.authApi) === null || _h === void 0 ? void 0 : _h.refreshTokenForce())];
                    case 4:
                        _k.sent();
                        return [2, doFetch()];
                    case 5: throw err_1;
                    case 6: return [2];
                }
            });
        });
    };
    CloudbaseRequest.prototype.send = function (action, data, options, customReqOpts) {
        if (data === void 0) { data = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.request(action, data, __assign(__assign({}, options), { onUploadProgress: data.onUploadProgress }), customReqOpts)];
                    case 1:
                        response = _a.sent();
                        if (response.data.code && this.throwWhenRequestFail) {
                            throw new Error(JSON.stringify({
                                code: ERRORS.OPERATION_FAIL,
                                msg: "[".concat(response.data.code, "] ").concat(response.data.message),
                            }));
                        }
                        return [2, response.data];
                }
            });
        });
    };
    CloudbaseRequest.prototype.gateWay = function (options, customReqOpts) {
        return __awaiter(this, void 0, void 0, function () {
            var name, data, _a, path, method, _b, header, jsonData, requestId, _c, baseUrl, protocol, endpoint, response, _d;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        name = options.name, data = options.data, _a = options.path, path = _a === void 0 ? '' : _a, method = options.method, _b = options.header, header = _b === void 0 ? {} : _b;
                        if (!name || !path) {
                            throw new Error(JSON.stringify({
                                code: ERRORS.INVALID_PARAMS,
                                msg: '[gateWay] invalid function name or path',
                            }));
                        }
                        try {
                            jsonData = data ? JSON.stringify(data) : '';
                        }
                        catch (e) {
                            throw new Error(JSON.stringify({
                                code: ERRORS.INVALID_PARAMS,
                                msg: '[gateWay] invalid data',
                            }));
                        }
                        requestId = utilities_1.utils.generateRequestId();
                        _c = (0, common_1.getEndPointInfo)(this.config.env, 'GATEWAY'), baseUrl = _c.baseUrl, protocol = _c.protocol;
                        endpoint = "".concat(protocol).concat(baseUrl, "/").concat(path, "/").concat(name);
                        return [4, this.fetch({
                                method: method || 'POST',
                                headers: __assign({ 'Content-Type': 'application/json; charset=utf-8', 'X-Request-Id': requestId }, header),
                                body: jsonData,
                                url: endpoint,
                                customReqOpts: customReqOpts,
                            })];
                    case 1:
                        response = _f.sent();
                        _d = [__assign({ requestId: requestId }, response)];
                        _e = {};
                        return [4, response.data];
                    case 2: return [2, __assign.apply(void 0, _d.concat([(_e.data = _f.sent(), _e)]))];
                }
            });
        });
    };
    return CloudbaseRequest;
}());
exports.CloudbaseRequest = CloudbaseRequest;
var requestMap = {};
function initRequest(config) {
    requestMap[config.env] = new CloudbaseRequest(__assign(__assign({}, config), { throw: true }));
}
exports.initRequest = initRequest;
function getRequestByEnvId(env) {
    return requestMap[env];
}
exports.getRequestByEnvId = getRequestByEnvId;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWJzL3JlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDhDQUFtRztBQVNuRyxrREFBa0U7QUFVbEUsaUNBQXVDO0FBQ3ZDLHFDQUFvQztBQUM1QixJQUFBLE1BQU0sR0FBSyxxQkFBUyxPQUFkLENBQWM7QUFDcEIsSUFBQSxRQUFRLEdBQTRCLGlCQUFLLFNBQWpDLEVBQUUsVUFBVSxHQUFnQixpQkFBSyxXQUFyQixFQUFFLFNBQVMsR0FBSyxpQkFBSyxVQUFWLENBQVU7QUFHakQsSUFBTSwyQkFBMkIsR0FBRztJQUNsQyxhQUFhO0lBQ2IsYUFBYTtJQUNiLHVCQUF1QjtJQUN2Qix3QkFBd0I7SUFDeEIsYUFBYTtJQUNiLHVDQUF1QztJQUN2QyxpQ0FBaUM7SUFDakMsMEJBQTBCO0lBQzFCLDZCQUE2QjtJQUM3Qiw2QkFBNkI7SUFDN0IsMkJBQTJCO0NBQzVCLENBQUE7QUFFRCxTQUFTLFNBQVMsQ0FBQyxRQUE2QixFQUFFLElBQVksRUFBRSxLQUEyQjtJQUN6RixJQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDbkMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFVBQVUsT0FBd0I7UUFDakQsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBQ2YsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO1FBQ2xCLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO1lBQ1gsSUFBQSxLQUFtRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBdkUsWUFBWSxVQUFBLEVBQVcsZUFBZSxhQUFpQyxDQUFBO1lBQ3JGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFB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QVcsQ0FBQyxNQUErQjtJQUN6RCxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksZ0JBQWdCLHVCQUN4QyxNQUFNLEtBQ1QsS0FBSyxFQUFFLElBQUksSUFDWCxDQUFBO0FBQ0osQ0FBQztBQUxELGtDQUtDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQUMsR0FBVztJQUMzQyxPQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN4QixDQUFDO0FBRkQsOENBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEQVRBX1ZFUlNJT04sIGdldFNka1ZlcnNpb24sIGdldEJhc2VFbmRQb2ludCwgZ2V0RW5kUG9pbnRJbmZvIH0gZnJvbSAnLi4vY29uc3RhbnRzL2NvbW1vbidcbmltcG9ydCB7XG4gIElSZXF1ZXN0T3B0aW9ucyxcbiAgU0RLUmVxdWVzdEludGVyZmFjZSxcbiAgUmVzcG9uc2VPYmplY3QsXG4gIElVcGxvYWRSZXF1ZXN0T3B0aW9ucyxcbiAgSVJlcXVlc3RDb25maWcsXG4gIElGZXRjaE9wdGlvbnMsXG59IGZyb20gJ0BjbG91ZGJhc2UvYWRhcHRlci1pbnRlcmZhY2UnXG5pbXBvcnQgeyB1dGlscywgY29uc3RhbnRzLCBsYW5nRXZlbnQgfSBmcm9tICdAY2xvdWRiYXNlL3V0aWxpdGllcydcbmltcG9ydCB7IEVuZFBvaW50S2V5LCBLViB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMnXG5pbXBvcnQgeyBJQ3VzdG9tUmVxT3B0cyB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMvZnVuY3Rpb25zJ1xuaW1wb3J0IHtcbiAgSUdldEFjY2Vzc1Rva2VuUmVzdWx0LFxuICBJQ2xvdWRiYXNlUmVxdWVzdENvbmZpZyxcbiAgSUFwcGVuZGVkUmVxdWVzdEluZm8sXG4gIElSZXF1ZXN0QmVmb3JlSG9vayxcbn0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9yZXF1ZXN0J1xuaW1wb3J0IHsgSUNsb3VkYmFzZUNhY2hlIH0gZnJvbSAnQGNsb3VkYmFzZS90eXBlcy9jYWNoZSdcbmltcG9ydCB7IGdldExvY2FsQ2FjaGUgfSBmcm9tICcuL2NhY2hlJ1xuaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICcuL2FkYXB0ZXInXG5jb25zdCB7IEVSUk9SUyB9ID0gY29uc3RhbnRzXG5jb25zdCB7IGdlblNlcUlkLCBpc0Zvcm1EYXRhLCBmb3JtYXRVcmwgfSA9IHV0aWxzXG5cbi8vIOS4i+mdouWHoOenjSBhY3Rpb24g5LiN6ZyA6KaBIGFjY2VzcyB0b2tlblxuY29uc3QgQUNUSU9OU19XSVRIT1VUX0FDQ0VTU1RPS0VOID0gW1xuICAnYXV0aC5nZXRKd3QnLFxuICAnYXV0aC5sb2dvdXQnLFxuICAnYXV0aC5zaWduSW5XaXRoVGlja2V0JyxcbiAgJ2F1dGguc2lnbkluQW5vbnltb3VzbHknLFxuICAnYXV0aC5zaWduSW4nLFxuICAnYXV0aC5mZXRjaEFjY2Vzc1Rva2VuV2l0aFJlZnJlc2hUb2tlbicsXG4gICdhdXRoLnNpZ25VcFdpdGhFbWFpbEFuZFBhc3N3b3JkJyxcbiAgJ2F1dGguYWN0aXZhdGVFbmRVc2VyTWFpbCcsXG4gICdhdXRoLnNlbmRQYXNzd29yZFJlc2V0RW1haWwnLFxuICAnYXV0aC5yZXNldFBhc3N3b3JkV2l0aFRva2VuJyxcbiAgJ2F1dGguaXNVc2VybmFtZVJlZ2lzdGVyZWQnLFxuXVxuXG5mdW5jdGlvbiBiaW5kSG9va3MoaW5zdGFuY2U6IFNES1JlcXVlc3RJbnRlcmZhY2UsIG5hbWU6IHN0cmluZywgaG9va3M6IElSZXF1ZXN0QmVmb3JlSG9va1tdKSB7XG4gIGNvbnN0IG9yaWdpbk1ldGhvZCA9IGluc3RhbmNlW25hbWVdXG4gIGluc3RhbmNlW25hbWVdID0gZnVuY3Rpb24gKG9wdGlvbnM6IElSZXF1ZXN0T3B0aW9ucykge1xuICAgIGNvbnN0IGRhdGEgPSB7fVxuICAgIGNvbnN0IGhlYWRlcnMgPSB7fVxuICAgIGhvb2tzLmZvckVhY2goKGhvb2spID0+IHtcbiAgICAgIGNvbnN0IHsgZGF0YTogYXBwZW5kZWREYXRhLCBoZWFkZXJzOiBhcHBlbmRlZEhlYWRlcnMgfSA9IGhvb2suY2FsbChpbnN0YW5jZSwgb3B0aW9ucylcbiAgICAgIE9iamVjdC5hc3NpZ24oZGF0YSwgYXBwZW5kZWREYXRhKVxuICAgICAgT2JqZWN0LmFzc2lnbihoZWFkZXJzLCBhcHBlbmRlZEhlYWRlcnMpXG4gICAgfSlcbiAgICBjb25zdCBvcmlnaW5EYXRhID0gb3B0aW9ucy5kYXRhXG4gICAgb3JpZ2luRGF0YVxuICAgICAgJiYgKCgpID0+IHtcbiAgICAgICAgaWYgKGlzRm9ybURhdGEob3JpZ2luRGF0YSkpIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIChvcmlnaW5EYXRhIGFzIEZvcm1EYXRhKS5hcHBlbmQoa2V5LCBkYXRhW2tleV0pXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zLmRhdGEgPSB7XG4gICAgICAgICAgLi4ub3JpZ2luRGF0YSxcbiAgICAgICAgICAuLi5kYXRhLFxuICAgICAgICB9XG4gICAgICB9KSgpXG4gICAgb3B0aW9ucy5oZWFkZXJzID0ge1xuICAgICAgLi4uKG9wdGlvbnMuaGVhZGVycyB8fCB7fSksXG4gICAgICAuLi5oZWFkZXJzLFxuICAgIH1cbiAgICByZXR1cm4gKG9yaWdpbk1ldGhvZCBhcyBGdW5jdGlvbikuY2FsbChpbnN0YW5jZSwgb3B0aW9ucylcbiAgfVxufVxuZnVuY3Rpb24gYmVmb3JlRWFjaCgpOiBJQXBwZW5kZWRSZXF1ZXN0SW5mbyB7XG4gIGNvbnN0IHNlcUlkID0gZ2VuU2VxSWQoKVxuICByZXR1cm4ge1xuICAgIGRhdGE6IHtcbiAgICAgIHNlcUlkLFxuICAgIH0sXG4gICAgaGVhZGVyczoge1xuICAgICAgJ1gtU0RLLVZlcnNpb24nOiBgQGNsb3VkYmFzZS9qcy1zZGsvJHtnZXRTZGtWZXJzaW9uKCl9YCxcbiAgICAgICd4LXNlcWlkJzogc2VxSWQsXG4gICAgfSxcbiAgfVxufVxuZXhwb3J0IGludGVyZmFjZSBJR2F0ZVdheU9wdGlvbnMge1xuICBuYW1lOiBzdHJpbmdcbiAgZGF0YT86IGFueVxuICBwYXRoOiBzdHJpbmdcbiAgbWV0aG9kOiBzdHJpbmdcbiAgaGVhZGVyPzoge31cbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUNsb3VkYmFzZVJlcXVlc3Qge1xuICBwb3N0OiAob3B0aW9uczogSVJlcXVlc3RPcHRpb25zKSA9PiBQcm9taXNlPFJlc3BvbnNlT2JqZWN0PlxuICB1cGxvYWQ6IChvcHRpb25zOiBJVXBsb2FkUmVxdWVzdE9wdGlvbnMpID0+IFByb21pc2U8UmVzcG9uc2VPYmplY3Q+XG4gIGRvd25sb2FkOiAob3B0aW9uczogSVJlcXVlc3RPcHRpb25zKSA9PiBQcm9taXNlPFJlc3BvbnNlT2JqZWN0PlxuICByZXF1ZXN0OiAoYWN0aW9uOiBzdHJpbmcsIHBhcmFtczogS1Y8YW55Piwgb3B0aW9ucz86IEtWPGFueT4pID0+IFByb21pc2U8UmVzcG9uc2VPYmplY3Q+XG4gIHNlbmQ6IChhY3Rpb246IHN0cmluZywgZGF0YTogS1Y8YW55PikgPT4gUHJvbWlzZTxhbnk+XG4gIGZldGNoOiAob3B0aW9uczogSUZldGNoT3B0aW9ucykgPT4gUHJvbWlzZTxSZXNwb25zZU9iamVjdD5cbn1cblxuLyoqXG4gKiBAY2xhc3MgQ2xvdWRiYXNlUmVxdWVzdFxuICovXG5leHBvcnQgY2xhc3MgQ2xvdWRiYXNlUmVxdWVzdCBpbXBsZW1lbnRzIElDbG91ZGJhc2VSZXF1ZXN0IHtcbiAgY29uZmlnOiBJQ2xvdWRiYXNlUmVxdWVzdENvbmZpZ1xuICBwcml2YXRlIHJlcUNsYXNzOiBTREtSZXF1ZXN0SW50ZXJmYWNlXG4gIC8vIOivt+axguWksei0peaYr+WQpuaKm+WHukVycm9yXG4gIHByaXZhdGUgdGhyb3dXaGVuUmVxdWVzdEZhaWwgPSBmYWxzZVxuICAvLyDmjIHkuYXljJbmnKzlnLDlrZjlgqhcbiAgcHJpdmF0ZSBsb2NhbENhY2hlOiBJQ2xvdWRiYXNlQ2FjaGVcbiAgLyoqXG4gICAqIOWIneWni+WMllxuICAgKiBAcGFyYW0gY29uZmlnXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25maWc6IElDbG91ZGJhc2VSZXF1ZXN0Q29uZmlnICYgeyB0aHJvdz86IGJvb2xlYW4gfSkge1xuICAgIHRoaXMuY29uZmlnID0gY29uZmlnXG4gICAgY29uc3QgcmVxQ29uZmlnOiBJUmVxdWVzdENvbmZpZyA9IHtcbiAgICAgIHRpbWVvdXQ6IHRoaXMuY29uZmlnLnRpbWVvdXQsXG4gICAgICB0aW1lb3V0TXNnOiBgW0BjbG91ZGJhc2UvanMtc2RrXSDor7fmsYLlnKgke3RoaXMuY29uZmlnLnRpbWVvdXQgLyAxMDAwfXPlhoXmnKrlrozmiJDvvIzlt7LkuK3mlq1gLFxuICAgICAgcmVzdHJpY3RlZE1ldGhvZHM6IFsncG9zdCcsICdwdXQnXSxcbiAgICB9XG4gICAgdGhpcy5yZXFDbGFzcyA9IG5ldyBQbGF0Zm9ybS5hZGFwdGVyLnJlcUNsYXNzKHJlcUNvbmZpZylcbiAgICB0aGlzLnRocm93V2hlblJlcXVlc3RGYWlsID0gY29uZmlnLnRocm93IHx8IGZhbHNlXG4gICAgdGhpcy5sb2NhbENhY2hlID0gZ2V0TG9jYWxDYWNoZSh0aGlzLmNvbmZpZy5lbnYpXG5cbiAgICBpZiAodGhpcy5jb25maWcuZW5kUG9pbnRNb2RlICE9PSAnR0FURVdBWScpIHtcbiAgICAgIGJpbmRIb29rcyh0aGlzLnJlcUNsYXNzLCAncG9zdCcsIFtiZWZvcmVFYWNoXSlcbiAgICAgIGJpbmRIb29rcyh0aGlzLnJlcUNsYXNzLCAndXBsb2FkJywgW2JlZm9yZUVhY2hdKVxuICAgICAgYmluZEhvb2tzKHRoaXMucmVxQ2xhc3MsICdkb3dubG9hZCcsIFtiZWZvcmVFYWNoXSlcbiAgICB9XG5cbiAgICBsYW5nRXZlbnQuYnVzLm9uKGxhbmdFdmVudC5MQU5HX0NIQU5HRV9FVkVOVCwgKHBhcmFtcykgPT4ge1xuICAgICAgdGhpcy5jb25maWcuaTE4biA9IHBhcmFtcy5kYXRhPy5pMThuIHx8IHRoaXMuY29uZmlnLmkxOG5cbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEFjY2Vzc1Rva2VuKHRva2VuID0gbnVsbCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBlcWVxZXFcbiAgICBpZiAodG9rZW4gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRva2VuXG4gICAgfVxuICAgIGNvbnN0IGFwcCA9IHRoaXMuY29uZmlnLl9mcm9tQXBwXG5cbiAgICBpZiAoIWFwcC5vYXV0aEluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3lvdSBjYW5cXCd0IHJlcXVlc3Qgd2l0aG91dCBhdXRoJylcbiAgICB9XG5cbiAgICBjb25zdCB7IG9hdXRoSW5zdGFuY2UgfSA9IGFwcFxuICAgIGNvbnN0IG9hdXRoQ2xpZW50ID0gb2F1dGhJbnN0YW5jZS5vYXV0aDJjbGllbnRcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2V0T2F1dGhBY2Nlc3NUb2tlblYyKG9hdXRoQ2xpZW50KSkuYWNjZXNzVG9rZW5cbiAgfVxuXG4gIHB1YmxpYyBnZXREZWZhdWx0SGVhZGVycygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgW3RoaXMuY29uZmlnLmkxOG4/LkxBTkdfSEVBREVSX0tFWV06IHRoaXMuY29uZmlnLmkxOG4/LmxhbmcsXG4gICAgICAnWC1TREstVmVyc2lvbic6IGBAY2xvdWRiYXNlL2pzLXNkay8ke2dldFNka1ZlcnNpb24oKX1gLFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwb3N0KG9wdGlvbnM6IElSZXF1ZXN0T3B0aW9ucywgY3VzdG9tUmVxT3B0cz86IElDdXN0b21SZXFPcHRzKTogUHJvbWlzZTxSZXNwb25zZU9iamVjdD4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMucmVxQ2xhc3MucG9zdCh7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgaGVhZGVyczogeyAuLi5vcHRpb25zLmhlYWRlcnMsIC4uLnRoaXMuZ2V0RGVmYXVsdEhlYWRlcnMoKSB9LFxuICAgICAgY3VzdG9tUmVxT3B0cyxcbiAgICB9KVxuICAgIHJldHVybiByZXNcbiAgfVxuICBwdWJsaWMgYXN5bmMgdXBsb2FkKG9wdGlvbnM6IElVcGxvYWRSZXF1ZXN0T3B0aW9ucyk6IFByb21pc2U8UmVzcG9uc2VPYmplY3Q+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLnJlcUNsYXNzLnVwbG9hZCh7IC4uLm9wdGlvbnMsIGhlYWRlcnM6IHsgLi4ub3B0aW9ucy5oZWFkZXJzLCAuLi50aGlzLmdldERlZmF1bHRIZWFkZXJzKCkgfSB9KVxuICAgIHJldHVybiByZXNcbiAgfVxuICBwdWJsaWMgYXN5bmMgZG93bmxvYWQob3B0aW9uczogSVJlcXVlc3RPcHRpb25zKTogUHJvbWlzZTxSZXNwb25zZU9iamVjdD4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMucmVxQ2xhc3MuZG93bmxvYWQoe1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGhlYWRlcnM6IHsgLi4ub3B0aW9ucy5oZWFkZXJzLCAuLi50aGlzLmdldERlZmF1bHRIZWFkZXJzKCkgfSxcbiAgICB9KVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIHB1YmxpYyBnZXRCYXNlRW5kUG9pbnQoZW5kUG9pbnRLZXk6IEVuZFBvaW50S2V5ID0gJ0NMT1VEX0FQSScpIHtcbiAgICByZXR1cm4gZ2V0QmFzZUVuZFBvaW50KHRoaXMuY29uZmlnLmVudiwgZW5kUG9pbnRLZXkpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0T2F1dGhBY2Nlc3NUb2tlblYyKG9hdXRoQ2xpZW50OiBhbnkpOiBQcm9taXNlPElHZXRBY2Nlc3NUb2tlblJlc3VsdD4ge1xuICAgIGNvbnN0IHZhbGlkQWNjZXNzVG9rZW4gPSBhd2FpdCBvYXV0aENsaWVudC5nZXRBY2Nlc3NUb2tlbigpXG4gICAgY29uc3QgY3JlZGVudGlhbHMgPSBhd2FpdCBvYXV0aENsaWVudC5nZXRDcmVkZW50aWFscygpXG4gICAgcmV0dXJuIHtcbiAgICAgIGFjY2Vzc1Rva2VuOiB2YWxpZEFjY2Vzc1Rva2VuLFxuICAgICAgYWNjZXNzVG9rZW5FeHBpcmU6IG5ldyBEYXRlKGNyZWRlbnRpYWxzLmV4cGlyZXNfYXQpLmdldFRpbWUoKSxcbiAgICB9XG4gIH1cblxuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5ICovXG4gIHB1YmxpYyBhc3luYyByZXF1ZXN0KFxuICAgIGFjdGlvbjogc3RyaW5nLFxuICAgIHBhcmFtczogS1Y8YW55PixcbiAgICBvcHRpb25zPzoge1xuICAgICAgb25VcGxvYWRQcm9ncmVzcz86IEZ1bmN0aW9uXG4gICAgICBwYXRobmFtZT86IHN0cmluZ1xuICAgICAgcGFyc2U/OiBib29sZWFuXG4gICAgICBpblF1ZXJ5PzogS1Y8YW55PlxuICAgICAgc2VhcmNoPzogc3RyaW5nXG4gICAgICBkZWZhdWx0UXVlcnk/OiBLVjxhbnk+XG4gICAgICBoZWFkZXJzPzogS1Y8c3RyaW5nPlxuICAgIH0sXG4gICAgY3VzdG9tUmVxT3B0cz86IElDdXN0b21SZXFPcHRzLFxuICApOiBQcm9taXNlPFJlc3BvbnNlT2JqZWN0PiB7XG4gICAgY29uc3QgdGNiVHJhY2VLZXkgPSBgeC10Y2ItdHJhY2VfJHt0aGlzLmNvbmZpZy5lbnZ9YFxuICAgIGxldCBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG5cbiAgICBjb25zdCB0bXBPYmo6IEtWPGFueT4gPSB7XG4gICAgICBhY3Rpb24sXG4gICAgICBkYXRhVmVyc2lvbjogREFUQV9WRVJTSU9OLFxuICAgICAgZW52OiB0aGlzLmNvbmZpZy5lbnYsXG4gICAgICAuLi5wYXJhbXMsXG4gICAgfVxuXG4gICAgaWYgKEFDVElPTlNfV0lUSE9VVF9BQ0NFU1NUT0tFTi5pbmRleE9mKGFjdGlvbikgPT09IC0xKSB7XG4gICAgICBjb25zdCBhcHAgPSB0aGlzLmNvbmZpZy5fZnJvbUFwcFxuXG4gICAgICBpZiAoIWFwcC5vYXV0aEluc3RhbmNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigneW91IGNhblxcJ3QgcmVxdWVzdCB3aXRob3V0IGF1dGgnKVxuICAgICAgfVxuXG4gICAgICBjb25zdCB7IG9hdXRoSW5zdGFuY2UgfSA9IGFwcFxuICAgICAgY29uc3Qgb2F1dGhDbGllbnQgPSBvYXV0aEluc3RhbmNlLm9hdXRoMmNsaWVudFxuICAgICAgdG1wT2JqLmFjY2Vzc190b2tlbiA9IChhd2FpdCB0aGlzLmdldE9hdXRoQWNjZXNzVG9rZW5WMihvYXV0aENsaWVudCkpLmFjY2Vzc1Rva2VuXG4gICAgfVxuXG4gICAgLy8g5ou8Ym9keeWSjGNvbnRlbnQtdHlwZVxuICAgIGxldCBwYXlsb2FkXG4gICAgaWYgKGFjdGlvbiA9PT0gJ3N0b3JhZ2UudXBsb2FkRmlsZScpIHtcbiAgICAgIHBheWxvYWQgPSBuZXcgRm9ybURhdGEoKVxuICAgICAgT2JqZWN0LmtleXMocGF5bG9hZCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocGF5bG9hZCwga2V5KSAmJiBwYXlsb2FkW2tleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHBheWxvYWQuYXBwZW5kKGtleSwgdG1wT2JqW2tleV0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBjb250ZW50VHlwZSA9ICdtdWx0aXBhcnQvZm9ybS1kYXRhJ1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLTgnXG4gICAgICBwYXlsb2FkID0ge31cbiAgICAgIE9iamVjdC5rZXlzKHRtcE9iaikuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGlmICh0bXBPYmpba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcGF5bG9hZFtrZXldID0gdG1wT2JqW2tleV1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gICAgY29uc3Qgb3B0czogYW55ID0ge1xuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnY29udGVudC10eXBlJzogY29udGVudFR5cGUsXG4gICAgICAgIC4uLnRoaXMuZ2V0RGVmYXVsdEhlYWRlcnMoKSxcbiAgICAgICAgLi4ub3B0aW9ucz8uaGVhZGVycyxcbiAgICAgIH0sXG4gICAgfVxuICAgIGlmIChvcHRpb25zPy5vblVwbG9hZFByb2dyZXNzKSB7XG4gICAgICBvcHRzLm9uVXBsb2FkUHJvZ3Jlc3MgPSBvcHRpb25zLm9uVXBsb2FkUHJvZ3Jlc3NcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jb25maWcucmVnaW9uKSB7XG4gICAgICBvcHRzLmhlYWRlcnNbJ1gtVENCLVJlZ2lvbiddID0gdGhpcy5jb25maWcucmVnaW9uXG4gICAgfVxuXG4gICAgY29uc3QgdHJhY2VIZWFkZXIgPSB0aGlzLmxvY2FsQ2FjaGUuZ2V0U3RvcmUodGNiVHJhY2VLZXkpXG4gICAgaWYgKHRyYWNlSGVhZGVyKSB7XG4gICAgICBvcHRzLmhlYWRlcnNbJ1gtVENCLVRyYWNlJ10gPSB0cmFjZUhlYWRlclxuICAgIH1cblxuICAgIC8vIOWPkeWHuuivt+axglxuICAgIC8vIOaWsOeahCB1cmwg6ZyA6KaB5pC65bimIGVudiDlj4LmlbDov5vooYwgQ09SUyDmoKHpqoxcbiAgICAvLyDor7fmsYLpk77mjqXmlK/mjIHmt7vliqDliqjmgIEgcXVlcnkg5Y+C5pWw77yM5pa55L6/55So5oi36LCD6K+V5a6a5L2N6K+35rGCXG4gICAgY29uc3QgcGFyc2UgPSBvcHRpb25zPy5wYXJzZSAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5wYXJzZSA6IHBhcmFtcy5wYXJzZVxuICAgIGNvbnN0IGluUXVlcnkgPSBvcHRpb25zPy5pblF1ZXJ5ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmluUXVlcnkgOiBwYXJhbXMuaW5RdWVyeVxuICAgIGNvbnN0IHNlYXJjaCA9IG9wdGlvbnM/LnNlYXJjaCAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5zZWFyY2ggOiBwYXJhbXMuc2VhcmNoXG5cbiAgICBsZXQgZm9ybWF0UXVlcnk6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7XG4gICAgICAuLi4ob3B0aW9ucz8uZGVmYXVsdFF1ZXJ5IHx8IHt9KSxcbiAgICAgIGVudjogdGhpcy5jb25maWcuZW52LFxuICAgIH1cbiAgICAvLyDlsJ3or5Xop6PmnpDlk43lupTmlbDmja7kuLogSlNPTlxuICAgIHBhcnNlICYmIChmb3JtYXRRdWVyeS5wYXJzZSA9IHRydWUpXG4gICAgaW5RdWVyeVxuICAgICAgJiYgKGZvcm1hdFF1ZXJ5ID0ge1xuICAgICAgICAuLi5pblF1ZXJ5LFxuICAgICAgICAuLi5mb3JtYXRRdWVyeSxcbiAgICAgIH0pXG5cbiAgICBjb25zdCBlbmRQb2ludE1vZGUgPSB0aGlzLmNvbmZpZy5lbmRQb2ludE1vZGUgfHwgJ0NMT1VEX0FQSSdcblxuICAgIGNvbnN0IHVybCA9IGdldEVuZFBvaW50SW5mbyh0aGlzLmNvbmZpZy5lbnYsIGVuZFBvaW50TW9kZSlcbiAgICBsZXQgQkFTRV9VUkwgPSB1cmwuYmFzZVVybFxuICAgIGNvbnN0IFBST1RPQ09MID0gdXJsLnByb3RvY29sXG5cbiAgICBpZiAoZW5kUG9pbnRNb2RlID09PSAnR0FURVdBWScpIHtcbiAgICAgIC8vIG9wdHMuaGVhZGVycy5BdXRob3JpemF0aW9uID0gYEJlYXJlciAke2F3YWl0IHRoaXMuZ2V0QWNjZXNzVG9rZW4oKX1gXG5cbiAgICAgIGlmIChhY3Rpb24gPT09ICdmdW5jdGlvbnMuaW52b2tlRnVuY3Rpb24nIHx8IC9eKHN0b3JhZ2V8ZGF0YWJhc2UpXFwuLy50ZXN0KGFjdGlvbikpIHtcbiAgICAgICAgQkFTRV9VUkwgPSBgJHtCQVNFX1VSTC5tYXRjaCgvXFwvXFwvKFteLz8jXSopLylbMF19L3dlYmBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDnlJ/miJDor7fmsYIgdXJsXG4gICAgbGV0IG5ld1VybFxuICAgIGlmIChvcHRpb25zLnBhdGhuYW1lKSB7XG4gICAgICBuZXdVcmwgPSBmb3JtYXRVcmwoXG4gICAgICAgIFBST1RPQ09MLFxuICAgICAgICBgJHtnZXRCYXNlRW5kUG9pbnQodGhpcy5jb25maWcuZW52LCBlbmRQb2ludE1vZGUpPy5yZXBsYWNlKC9eaHR0cHM/Oi8sICcnKX0vJHtvcHRpb25zLnBhdGhuYW1lfWAsXG4gICAgICAgIGZvcm1hdFF1ZXJ5LFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdVcmwgPSBmb3JtYXRVcmwoUFJPVE9DT0wsIEJBU0VfVVJMLCBmb3JtYXRRdWVyeSlcbiAgICB9XG5cbiAgICBpZiAoc2VhcmNoKSB7XG4gICAgICBuZXdVcmwgKz0gc2VhcmNoXG4gICAgfVxuXG4gICAgY29uc3QgcmVzOiBSZXNwb25zZU9iamVjdCA9IGF3YWl0IHRoaXMucG9zdChcbiAgICAgIHtcbiAgICAgICAgdXJsOiBuZXdVcmwsXG4gICAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgICAgIC4uLm9wdHMsXG4gICAgICB9LFxuICAgICAgY3VzdG9tUmVxT3B0cyxcbiAgICApXG5cbiAgICAvLyDkv53lrZggdHJhY2UgaGVhZGVyXG4gICAgY29uc3QgcmVzVHJhY2VIZWFkZXIgPSByZXMuaGVhZGVyPy5bJ3gtdGNiLXRyYWNlJ11cbiAgICBpZiAocmVzVHJhY2VIZWFkZXIpIHtcbiAgICAgIHRoaXMubG9jYWxDYWNoZS5zZXRTdG9yZSh0Y2JUcmFjZUtleSwgcmVzVHJhY2VIZWFkZXIpXG4gICAgfVxuXG4gICAgaWYgKChOdW1iZXIocmVzLnN0YXR1cykgIT09IDIwMCAmJiBOdW1iZXIocmVzLnN0YXR1c0NvZGUpICE9PSAyMDApIHx8ICFyZXMuZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCduZXR3b3JrIHJlcXVlc3QgZXJyb3InKVxuICAgIH1cblxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBmZXRjaChvcHRpb25zOiBJRmV0Y2hPcHRpb25zICYgeyB0b2tlbj86IHN0cmluZzsgY3VzdG9tUmVxT3B0cz86IElDdXN0b21SZXFPcHRzIH0sKTogUHJvbWlzZTxSZXNwb25zZU9iamVjdD4ge1xuICAgIGNvbnN0IHsgdG9rZW4sIGhlYWRlcnMgPSB7fSwgLi4ucmVzdE9wdGlvbnMgfSA9IG9wdGlvbnNcblxuICAgIGNvbnN0IGRvRmV0Y2ggPSBhc3luYyAoKSA9PiB0aGlzLnJlcUNsYXNzLmZldGNoKHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgLy8gJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgLy8gJ1gtUmVxdWVzdC1JZCc6IGAke3V0aWxzLmdlbmVyYXRlUmVxdWVzdElkKCl9YCxcbiAgICAgICAgLy8gJ1gtUmVxdWVzdC1UaW1lc3RhbXAnOiBgJHtEYXRlLm5vdygpfWAsXG4gICAgICAgICdYLVNESy1WZXJzaW9uJzogYEBjbG91ZGJhc2UvanMtc2RrLyR7Z2V0U2RrVmVyc2lvbigpfWAsXG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthd2FpdCB0aGlzLmdldEFjY2Vzc1Rva2VuKHRva2VuKX1gLFxuICAgICAgICAuLi50aGlzLmdldERlZmF1bHRIZWFkZXJzKCksXG4gICAgICAgIC4uLmhlYWRlcnMsXG4gICAgICB9LFxuICAgICAgLi4ucmVzdE9wdGlvbnMsXG4gICAgfSlcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBkb0ZldGNoKClcbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnI/LmNvZGUgPT09ICdBQ0NFU1NfVE9LRU5fRVhQSVJFRCcpIHtcbiAgICAgICAgLy8g5aaC5p6c5piv5Zug5Li6IHRva2VuIOi/h+acn+Wksei0pe+8jOWItyB0b2tlbiDlkI7lho3or5XkuIDmrKFcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbmZpZz8uX2Zyb21BcHA/Lm9hdXRoSW5zdGFuY2U/LmF1dGhBcGk/LnJlZnJlc2hUb2tlbkZvcmNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgdGhyb3cgZXJyXG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5jb25maWc/Ll9mcm9tQXBwPy5vYXV0aEluc3RhbmNlPy5hdXRoQXBpPy5yZWZyZXNoVG9rZW5Gb3JjZSgpXG4gICAgICAgIHJldHVybiBkb0ZldGNoKClcbiAgICAgIH1cbiAgICAgIC8vIOWFtuS7luWOn+WboOWQkeS4iuaKm+WHulxuXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc2VuZChcbiAgICBhY3Rpb246IHN0cmluZyxcbiAgICBkYXRhOiBLVjxhbnk+ID0ge30sXG4gICAgb3B0aW9uczogS1Y8YW55PiA9IHt9LFxuICAgIGN1c3RvbVJlcU9wdHM/OiBJQ3VzdG9tUmVxT3B0cyxcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucmVxdWVzdChcbiAgICAgIGFjdGlvbixcbiAgICAgIGRhdGEsXG4gICAgICB7IC4uLm9wdGlvbnMsIG9uVXBsb2FkUHJvZ3Jlc3M6IGRhdGEub25VcGxvYWRQcm9ncmVzcyB9LFxuICAgICAgY3VzdG9tUmVxT3B0cyxcbiAgICApXG5cbiAgICBpZiAocmVzcG9uc2UuZGF0YS5jb2RlICYmIHRoaXMudGhyb3dXaGVuUmVxdWVzdEZhaWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGNvZGU6IEVSUk9SUy5PUEVSQVRJT05fRkFJTCxcbiAgICAgICAgbXNnOiBgWyR7cmVzcG9uc2UuZGF0YS5jb2RlfV0gJHtyZXNwb25zZS5kYXRhLm1lc3NhZ2V9YCxcbiAgICAgIH0pLClcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdhdGVXYXkob3B0aW9uczogSUdhdGVXYXlPcHRpb25zLCBjdXN0b21SZXFPcHRzPzogSUN1c3RvbVJlcU9wdHMpIHtcbiAgICBjb25zdCB7IG5hbWUsIGRhdGEsIHBhdGggPSAnJywgbWV0aG9kLCBoZWFkZXIgPSB7fSB9ID0gb3B0aW9uc1xuXG4gICAgaWYgKCFuYW1lIHx8ICFwYXRoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBjb2RlOiBFUlJPUlMuSU5WQUxJRF9QQVJBTVMsXG4gICAgICAgIG1zZzogJ1tnYXRlV2F5XSBpbnZhbGlkIGZ1bmN0aW9uIG5hbWUgb3IgcGF0aCcsXG4gICAgICB9KSwpXG4gICAgfVxuICAgIGxldCBqc29uRGF0YVxuICAgIHRyeSB7XG4gICAgICBqc29uRGF0YSA9IGRhdGEgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6ICcnXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgY29kZTogRVJST1JTLklOVkFMSURfUEFSQU1TLFxuICAgICAgICBtc2c6ICdbZ2F0ZVdheV0gaW52YWxpZCBkYXRhJyxcbiAgICAgIH0pLClcbiAgICB9XG5cbiAgICBjb25zdCByZXF1ZXN0SWQgPSB1dGlscy5nZW5lcmF0ZVJlcXVlc3RJZCgpXG4gICAgY29uc3QgeyBiYXNlVXJsLCBwcm90b2NvbCB9ID0gZ2V0RW5kUG9pbnRJbmZvKHRoaXMuY29uZmlnLmVudiwgJ0dBVEVXQVknKVxuICAgIGNvbnN0IGVuZHBvaW50ID0gYCR7cHJvdG9jb2x9JHtiYXNlVXJsfS8ke3BhdGh9LyR7bmFtZX1gXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmZldGNoKHtcbiAgICAgIG1ldGhvZDogbWV0aG9kIHx8ICdQT1NUJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyxcbiAgICAgICAgJ1gtUmVxdWVzdC1JZCc6IHJlcXVlc3RJZCxcbiAgICAgICAgLi4uaGVhZGVyLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IGpzb25EYXRhLFxuICAgICAgdXJsOiBlbmRwb2ludCxcbiAgICAgIGN1c3RvbVJlcU9wdHMsXG4gICAgfSlcblxuICAgIHJldHVybiB7IHJlcXVlc3RJZCwgLi4ucmVzcG9uc2UsIGRhdGE6IGF3YWl0IHJlc3BvbnNlLmRhdGEgfVxuICB9XG59XG5cbmNvbnN0IHJlcXVlc3RNYXA6IEtWPENsb3VkYmFzZVJlcXVlc3Q+ID0ge31cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRSZXF1ZXN0KGNvbmZpZzogSUNsb3VkYmFzZVJlcXVlc3RDb25maWcpIHtcbiAgcmVxdWVzdE1hcFtjb25maWcuZW52XSA9IG5ldyBDbG91ZGJhc2VSZXF1ZXN0KHtcbiAgICAuLi5jb25maWcsXG4gICAgdGhyb3c6IHRydWUsXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXF1ZXN0QnlFbnZJZChlbnY6IHN0cmluZyk6IENsb3VkYmFzZVJlcXVlc3Qge1xuICByZXR1cm4gcmVxdWVzdE1hcFtlbnZdXG59XG4iXX0=
}, function(modId) { var map = {"../constants/common":1768287884697,"./cache":1768287884695,"./adapter":1768287884694}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768287884697, function(require, module, exports) {

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAUTH2_LOGINTYPE_PREFIX = exports.LOGINTYPE = exports.getBaseEndPoint = exports.setRegionLevelEndpoint = exports.setGatewayEndPointWithEnv = exports.getEndPointInfo = exports.setEndPointInfo = exports.DEFAULT_PROTOCOL = exports.DATA_VERSION = exports.getSdkName = exports.setSdkName = exports.getSdkVersion = exports.setSdkVersion = void 0;
var utilities_1 = require("@cloudbase/utilities");
var ZONE_CHINA = ['ap-shanghai', 'ap-guangzhou', 'ap-shenzhen-fsi', 'ap-shanghai-fsi', 'ap-nanjing', 'ap-beijing', 'ap-chengdu', 'ap-chongqing', 'ap-hongkong'];
var setUtilitiesSdkName = utilities_1.constants.setSdkName, setUtilitiesProtocol = utilities_1.constants.setProtocol;
var sdkVersion = '';
var sdkName = '@cloudbase/js-sdk';
function setSdkVersion(version) {
    sdkVersion = version;
}
exports.setSdkVersion = setSdkVersion;
function getSdkVersion() {
    return sdkVersion;
}
exports.getSdkVersion = getSdkVersion;
function setSdkName(name) {
    sdkName = name;
    setUtilitiesSdkName(name);
}
exports.setSdkName = setSdkName;
function getSdkName() {
    return sdkName;
}
exports.getSdkName = getSdkName;
exports.DATA_VERSION = '2020-01-10';
var END_POINT_INFO_ARR = [];
var END_POINT_INFO_SEARCH_KEYS = ['env', 'endPointKey', 'region'];
exports.DEFAULT_PROTOCOL = 'https:';
function findMatchedInfo(info) {
    return END_POINT_INFO_ARR.find(function (targetInfo) { return END_POINT_INFO_SEARCH_KEYS.filter(function (searchKey) { return info[searchKey] != null; }).every(function (searchKey) { return targetInfo[searchKey] === info[searchKey]; }); });
}
function setEndPointInfo(newInfo) {
    var _a, _b;
    if (newInfo.protocol && !/:$/.test(newInfo.protocol)) {
        newInfo.protocol = "".concat(newInfo.protocol, ":");
    }
    var endPointInfo = findMatchedInfo(newInfo);
    if (endPointInfo) {
        if (newInfo.baseUrl != null) {
            endPointInfo.baseUrl = newInfo.baseUrl;
        }
        if (newInfo.protocol != null) {
            endPointInfo.protocol = newInfo.protocol;
        }
    }
    else {
        END_POINT_INFO_ARR.push(__assign(__assign({}, newInfo), { protocol: (_a = newInfo.protocol) !== null && _a !== void 0 ? _a : exports.DEFAULT_PROTOCOL }));
    }
    if (newInfo.endPointKey === 'CLOUD_API') {
        setUtilitiesProtocol(((_b = newInfo.protocol) !== null && _b !== void 0 ? _b : exports.DEFAULT_PROTOCOL));
    }
}
exports.setEndPointInfo = setEndPointInfo;
function getEndPointInfo(env, endPointKey, region) {
    return findMatchedInfo({ env: env, endPointKey: endPointKey, region: region });
}
exports.getEndPointInfo = getEndPointInfo;
function setGatewayEndPointWithEnv(env, protocol, region) {
    if (region === void 0) { region = 'ap-shanghai'; }
    region = region || 'ap-shanghai';
    var baseUrl = "//".concat(env, ".api.tcloudbasegateway.com/v1");
    if (!ZONE_CHINA.includes(region)) {
        baseUrl = "//".concat(env, ".api.intl.tcloudbasegateway.com/v1");
    }
    setEndPointInfo({ endPointKey: 'GATEWAY', env: env, baseUrl: baseUrl, protocol: protocol });
}
exports.setGatewayEndPointWithEnv = setGatewayEndPointWithEnv;
function setRegionLevelEndpoint(env, region, protocol) {
    var baseUrl = "//".concat(env, ".").concat(region || 'ap-shanghai', ".tcb-api.tencentcloudapi.com/web");
    setEndPointInfo({ env: env, region: region, baseUrl: baseUrl, protocol: protocol, endPointKey: 'CLOUD_API' });
}
exports.setRegionLevelEndpoint = setRegionLevelEndpoint;
function getBaseEndPoint(env, endPointKey) {
    if (endPointKey === void 0) { endPointKey = 'CLOUD_API'; }
    var info = getEndPointInfo(env, endPointKey || 'CLOUD_API');
    var PROTOCOL = info.protocol, BASE_URL = info.baseUrl;
    var webEndpoint = "".concat(PROTOCOL).concat(BASE_URL);
    return webEndpoint.match(/(http(s)?:)?\/\/([^/?#]*)/)[0];
}
exports.getBaseEndPoint = getBaseEndPoint;
var LOGINTYPE;
(function (LOGINTYPE) {
    LOGINTYPE["NULL"] = "NULL";
    LOGINTYPE["ANONYMOUS"] = "ANONYMOUS";
    LOGINTYPE["WECHAT"] = "WECHAT";
    LOGINTYPE["WECHAT_PUBLIC"] = "WECHAT-PUBLIC";
    LOGINTYPE["WECHAT_OPEN"] = "WECHAT-OPEN";
    LOGINTYPE["CUSTOM"] = "CUSTOM";
    LOGINTYPE["EMAIL"] = "EMAIL";
    LOGINTYPE["USERNAME"] = "USERNAME";
    LOGINTYPE["PHONE"] = "PHONE";
})(LOGINTYPE = exports.LOGINTYPE || (exports.LOGINTYPE = {}));
exports.OAUTH2_LOGINTYPE_PREFIX = 'OAUTH2';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnN0YW50cy9jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFDQSxrREFBZ0Q7QUFFaEQsSUFBTSxVQUFVLEdBQUcsQ0FBQyxhQUFhLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxhQUFhLENBQUMsQ0FBQTtBQUd6SixJQUFZLG1CQUFtQixHQUF3QyxxQkFBUyxXQUFqRCxFQUFlLG9CQUFvQixHQUFLLHFCQUFTLFlBQWQsQ0FBYztBQUl4RixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7QUFDbkIsSUFBSSxPQUFPLEdBQUcsbUJBQW1CLENBQUE7QUFFakMsU0FBZ0IsYUFBYSxDQUFDLE9BQWU7SUFDM0MsVUFBVSxHQUFHLE9BQU8sQ0FBQTtBQUN0QixDQUFDO0FBRkQsc0NBRUM7QUFDRCxTQUFnQixhQUFhO0lBQzNCLE9BQU8sVUFBVSxDQUFBO0FBQ25CLENBQUM7QUFGRCxzQ0FFQztBQUNELFNBQWdCLFVBQVUsQ0FBQyxJQUFZO0lBQ3JDLE9BQU8sR0FBRyxJQUFJLENBQUE7SUFDZCxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMzQixDQUFDO0FBSEQsZ0NBR0M7QUFDRCxTQUFnQixVQUFVO0lBQ3hCLE9BQU8sT0FBTyxDQUFBO0FBQ2hCLENBQUM7QUFGRCxnQ0FFQztBQUNZLFFBQUEsWUFBWSxHQUFHLFlBQVksQ0FBQTtBQWlCeEMsSUFBTSxrQkFBa0IsR0FBd0IsRUFBRSxDQUFBO0FBR2xELElBQU0sMEJBQTBCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBRXRELFFBQUEsZ0JBQWdCLEdBQXVCLFFBQVEsQ0FBQTtBQUU1RCxTQUFTLGVBQWUsQ0FBQyxJQUFrQjtJQUV6QyxPQUFP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QUFJLFdBQVcsQ0FBQyxDQUFBO0lBRXJELElBQVUsUUFBUSxHQUF3QixJQUFJLFNBQTVCLEVBQVcsUUFBUSxHQUFLLElBQUksUUFBVCxDQUFTO0lBQ3RELElBQU0sV0FBVyxHQUFHLFVBQUcsUUFBUSxTQUFHLFFBQVEsQ0FBRSxDQUFBO0lBRTVDLE9BQU8sV0FBVyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRTFELENBQUM7QUFSRCwwQ0FRQztBQUVELElBQVksU0FVWDtBQVZELFdBQVksU0FBUztJQUNuQiwwQkFBYSxDQUFBO0lBQ2Isb0NBQXVCLENBQUE7SUFDdkIsOEJBQWlCLENBQUE7SUFDakIsNENBQStCLENBQUE7SUFDL0Isd0NBQTJCLENBQUE7SUFDM0IsOEJBQWlCLENBQUE7SUFDakIsNEJBQWUsQ0FBQTtJQUNmLGtDQUFxQixDQUFBO0lBQ3JCLDRCQUFlLENBQUE7QUFDakIsQ0FBQyxFQVZXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBVXBCO0FBRVksUUFBQSx1QkFBdUIsR0FBRyxRQUFRLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbmRQb2ludEtleSB9IGZyb20gJ0BjbG91ZGJhc2UvdHlwZXMnXG5pbXBvcnQgeyBjb25zdGFudHMgfSBmcm9tICdAY2xvdWRiYXNlL3V0aWxpdGllcydcblxuY29uc3QgWk9ORV9DSElOQSA9IFsnYXAtc2hhbmdoYWknLCAnYXAtZ3Vhbmd6aG91JywgJ2FwLXNoZW56aGVuLWZzaScsICdhcC1zaGFuZ2hhaS1mc2knLCAnYXAtbmFuamluZycsICdhcC1iZWlqaW5nJywgJ2FwLWNoZW5nZHUnLCAnYXAtY2hvbmdxaW5nJywgJ2FwLWhvbmdrb25nJ11cblxuLy8gQHRzLWlnbm9yZVxuY29uc3QgeyBzZXRTZGtOYW1lOiBzZXRVdGlsaXRpZXNTZGtOYW1lLCBzZXRQcm90b2NvbDogc2V0VXRpbGl0aWVzUHJvdG9jb2wgfSA9IGNvbnN0YW50c1xuLyoqXG4gKiBTREtcbiAqL1xubGV0IHNka1ZlcnNpb24gPSAnJ1xubGV0IHNka05hbWUgPSAnQGNsb3VkYmFzZS9qcy1zZGsnXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZGtWZXJzaW9uKHZlcnNpb246IHN0cmluZykge1xuICBzZGtWZXJzaW9uID0gdmVyc2lvblxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFNka1ZlcnNpb24oKSB7XG4gIHJldHVybiBzZGtWZXJzaW9uXG59XG5leHBvcnQgZnVuY3Rpb24gc2V0U2RrTmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgc2RrTmFtZSA9IG5hbWVcbiAgc2V0VXRpbGl0aWVzU2RrTmFtZShuYW1lKVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFNka05hbWUoKSB7XG4gIHJldHVybiBzZGtOYW1lXG59XG5leHBvcnQgY29uc3QgREFUQV9WRVJTSU9OID0gJzIwMjAtMDEtMTAnXG5cbmludGVyZmFjZSBFbmRQb2ludEluZm8ge1xuICBlbnY6IHN0cmluZ1xuICBlbmRQb2ludEtleTogRW5kUG9pbnRLZXlcbiAgcmVnaW9uPzogc3RyaW5nXG4gIGJhc2VVcmw/OiBzdHJpbmdcbiAgcHJvdG9jb2w/OiBQcm90b2NvbFxufVxuXG50eXBlIFByb3RvY29sID0gJ2h0dHAnIHwgJ2h0dHBzJyB8ICdodHRwOicgfCAnaHR0cHM6J1xuXG4vKipcbiAqICDmiYDmnIkgZW5kUG9pbnQg5L+h5oGvXG4gKiAg6YG/5YWN55u05o6l5pON5L2c6K+l5pWw57uEXG4gKiAg5L2/55SoIHNldEVuZFBvaW50SW5mb+OAgSBnZXRFbmRQb2ludEluZm9cbiAqL1xuY29uc3QgRU5EX1BPSU5UX0lORk9fQVJSOiBBcnJheTxFbmRQb2ludEluZm8+ID0gW11cblxuLyoqIOeUqOadpeafpeaJviBlbmRQb2ludCDnmoTlrZfmrrUgKi9cbmNvbnN0IEVORF9QT0lOVF9JTkZPX1NFQVJDSF9LRVlTID0gWydlbnYnLCAnZW5kUG9pbnRLZXknLCAncmVnaW9uJ11cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUFJPVE9DT0w6ICdodHRwOicgfCAnaHR0cHM6JyA9ICdodHRwczonXG5cbmZ1bmN0aW9uIGZpbmRNYXRjaGVkSW5mbyhpbmZvOiBFbmRQb2ludEluZm8pIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1sZW4sIGVxZXFlcVxuICByZXR1cm4gRU5EX1BPSU5UX0lORk9fQVJSLmZpbmQodGFyZ2V0SW5mbyA9PiBFTkRfUE9JTlRfSU5GT19TRUFSQ0hfS0VZUy5maWx0ZXIoc2VhcmNoS2V5ID0+IGluZm9bc2VhcmNoS2V5XSAhPSBudWxsKS5ldmVyeShzZWFyY2hLZXkgPT4gdGFyZ2V0SW5mb1tzZWFyY2hLZXldID09PSBpbmZvW3NlYXJjaEtleV0sKSwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRFbmRQb2ludEluZm8obmV3SW5mbzogRW5kUG9pbnRJbmZvKSB7XG4gIGlmIChuZXdJbmZvLnByb3RvY29sICYmICEvOiQvLnRlc3QobmV3SW5mby5wcm90b2NvbCkpIHtcbiAgICBuZXdJbmZvLnByb3RvY29sID0gYCR7bmV3SW5mby5wcm90b2NvbH06YCBhcyBQcm90b2NvbFxuICB9XG5cbiAgY29uc3QgZW5kUG9pbnRJbmZvID0gZmluZE1hdGNoZWRJbmZvKG5ld0luZm8pXG4gIGlmIChlbmRQb2ludEluZm8pIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZXFlcWVxXG4gICAgaWYgKG5ld0luZm8uYmFzZVVybCAhPSBudWxsKSB7XG4gICAgICBlbmRQb2ludEluZm8uYmFzZVVybCA9IG5ld0luZm8uYmFzZVVybFxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZXFlcWVxXG4gICAgaWYgKG5ld0luZm8ucHJvdG9jb2wgIT0gbnVsbCkge1xuICAgICAgZW5kUG9pbnRJbmZvLnByb3RvY29sID0gbmV3SW5mby5wcm90b2NvbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBFTkRfUE9JTlRfSU5GT19BUlIucHVzaCh7IC4uLm5ld0luZm8sIHByb3RvY29sOiBuZXdJbmZvLnByb3RvY29sID8/IERFRkFVTFRfUFJPVE9DT0wgfSlcbiAgfVxuXG4gIC8vIOS/neaMgeaXp+S7o+eggemAu+i+kVxuICBpZiAobmV3SW5mby5lbmRQb2ludEtleSA9PT0gJ0NMT1VEX0FQSScpIHtcbiAgICBzZXRVdGlsaXRpZXNQcm90b2NvbCgobmV3SW5mby5wcm90b2NvbCA/PyBERUZBVUxUX1BST1RPQ09MKSBhcyAnaHR0cDonIHwgJ2h0dHBzOicpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVuZFBvaW50SW5mbyhlbnY6IHN0cmluZywgZW5kUG9pbnRLZXk6IEVuZFBvaW50S2V5LCByZWdpb24/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGZpbmRNYXRjaGVkSW5mbyh7IGVudiwgZW5kUG9pbnRLZXksIHJlZ2lvbiB9KVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElTZXRFbmRQb2ludFdpdGhLZXkge1xuICBrZXk6IEVuZFBvaW50S2V5XG4gIHVybD86IHN0cmluZ1xuICBwcm90b2NvbD86ICdodHRwJyB8ICdodHRwcydcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEdhdGV3YXlFbmRQb2ludFdpdGhFbnYoZW52OiBzdHJpbmcsIHByb3RvY29sPzogUHJvdG9jb2wsIHJlZ2lvbiA9ICdhcC1zaGFuZ2hhaScpIHtcbiAgcmVnaW9uID0gcmVnaW9uIHx8ICdhcC1zaGFuZ2hhaSdcbiAgbGV0IGJhc2VVcmwgPSBgLy8ke2Vudn0uYXBpLnRjbG91ZGJhc2VnYXRld2F5LmNvbS92MWBcblxuICBpZiAoIVpPTkVfQ0hJTkEuaW5jbHVkZXMocmVnaW9uKSkge1xuICAgIGJhc2VVcmwgPSBgLy8ke2Vudn0uYXBpLmludGwudGNsb3VkYmFzZWdhdGV3YXkuY29tL3YxYFxuICB9XG5cbiAgc2V0RW5kUG9pbnRJbmZvKHsgZW5kUG9pbnRLZXk6ICdHQVRFV0FZJywgZW52LCBiYXNlVXJsLCBwcm90b2NvbCB9KVxufVxuZXhwb3J0IGZ1bmN0aW9uIHNldFJlZ2lvbkxldmVsRW5kcG9pbnQoZW52OiBzdHJpbmcsIHJlZ2lvbjogc3RyaW5nLCBwcm90b2NvbD86IFByb3RvY29sKSB7XG4gIGNvbnN0IGJhc2VVcmwgPSBgLy8ke2Vudn0uJHtyZWdpb24gfHwgJ2FwLXNoYW5naGFpJ30udGNiLWFwaS50ZW5jZW50Y2xvdWRhcGkuY29tL3dlYmBcbiAgc2V0RW5kUG9pbnRJbmZvKHsgZW52LCByZWdpb24sIGJhc2VVcmwsIHByb3RvY29sLCBlbmRQb2ludEtleTogJ0NMT1VEX0FQSScgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJhc2VFbmRQb2ludChlbnY6IHN0cmluZywgZW5kUG9pbnRLZXk6IEVuZFBvaW50S2V5ID0gJ0NMT1VEX0FQSScpIHtcbiAgY29uc3QgaW5mbyA9IGdldEVuZFBvaW50SW5mbyhlbnYsIGVuZFBvaW50S2V5IHx8ICdDTE9VRF9BUEknKVxuXG4gIGNvbnN0IHsgcHJvdG9jb2w6IFBST1RPQ09MLCBiYXNlVXJsOiBCQVNFX1VSTCB9ID0gaW5mb1xuICBjb25zdCB3ZWJFbmRwb2ludCA9IGAke1BST1RPQ09MfSR7QkFTRV9VUkx9YFxuICAvLyBAdG9kbyDkuLTml7blhbzlrrnlsI/nqIvluo9cbiAgcmV0dXJuIHdlYkVuZHBvaW50Lm1hdGNoKC8oaHR0cChzKT86KT9cXC9cXC8oW14vPyNdKikvKVswXVxuICAvLyByZXR1cm4gYCR7bmV3IFVSTCh3ZWJFbmRwb2ludCkub3JpZ2lufWBcbn1cblxuZXhwb3J0IGVudW0gTE9HSU5UWVBFIHtcbiAgTlVMTCA9ICdOVUxMJyxcbiAgQU5PTllNT1VTID0gJ0FOT05ZTU9VUycsXG4gIFdFQ0hBVCA9ICdXRUNIQVQnLFxuICBXRUNIQVRfUFVCTElDID0gJ1dFQ0hBVC1QVUJMSUMnLFxuICBXRUNIQVRfT1BFTiA9ICdXRUNIQVQtT1BFTicsXG4gIENVU1RPTSA9ICdDVVNUT00nLFxuICBFTUFJTCA9ICdFTUFJTCcsXG4gIFVTRVJOQU1FID0gJ1VTRVJOQU1FJyxcbiAgUEhPTkUgPSAnUEhPTkUnLFxufVxuXG5leHBvcnQgY29uc3QgT0FVVEgyX0xPR0lOVFlQRV9QUkVGSVggPSAnT0FVVEgyJ1xuIl19
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1768287884698, function(require, module, exports) {

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nProxy = exports.t = exports.langMap = exports.LANG_HEADER_KEY = exports.LANGS = void 0;
var utilities_1 = require("@cloudbase/utilities");
var LANGS;
(function (LANGS) {
    LANGS["ZH"] = "zh-CN";
    LANGS["EN"] = "en-US";
})(LANGS = exports.LANGS || (exports.LANGS = {}));
exports.LANG_HEADER_KEY = 'Accept-Language';
exports.langMap = (_a = {},
    _a[LANGS.EN] = {
        '请检查调用方式，或前往云开发 AI+ 首页查看文档': 'Please check the calling method or visit the AI+ homepage to view the documentation',
        'AI+ 请求出错，错误码': 'AI+ request error, error code',
        错误信息: 'error message',
        未实现: 'not implemented',
        '小程序不支持 wasm 加载': 'wasm loading is not supported in mini programs',
        '小程序不支持动态 js 加载': 'dynamic js loading is not supported in mini programs',
        请求超时: 'request timeout',
        '缺少 privatelink sdk 地址': 'missing privatelink sdk address',
    },
    _a);
var t = function (text, lang) { var _a; return ((_a = exports.langMap[lang]) === null || _a === void 0 ? void 0 : _a[text]) || text; };
exports.t = t;
var getLangCacheKey = function (config) { return "lang_".concat(config.clientId || config.env); };
var i18nProxy = function (platform, config) {
    var _a, _b;
    var cacheKey = getLangCacheKey(config);
    var localStorage = (platform.adapter || {}).localStorage;
    var lang = config.lang || ((_a = localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem) === null || _a === void 0 ? void 0 : _a.call(localStorage, cacheKey)) || LANGS.ZH;
    (_b = localStorage === null || localStorage === void 0 ? void 0 : localStorage.setItem) === null || _b === void 0 ? void 0 : _b.call(localStorage, cacheKey, lang);
    return new Proxy({
        t: function (text) { return (0, exports.t)(text, lang); },
        LANG_HEADER_KEY: exports.LANG_HEADER_KEY,
        lang: lang,
    }, {
        get: function (target, prop) {
            var _a;
            if (prop === 'lang') {
                return ((_a = localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem) === null || _a === void 0 ? void 0 : _a.call(localStorage, cacheKey)) || target[prop];
            }
            return target[prop];
        },
        set: function (target, prop, newValue) {
            var _a;
            if (prop === 'lang' && newValue !== target[prop]) {
                target[prop] = newValue;
                target.t = function (text) { return (0, exports.t)(text, newValue); };
                (_a = localStorage === null || localStorage === void 0 ? void 0 : localStorage.setItem) === null || _a === void 0 ? void 0 : _a.call(localStorage, cacheKey, newValue);
                utilities_1.langEvent.bus.fire(utilities_1.langEvent.LANG_CHANGE_EVENT, { i18n: target });
            }
            target[prop] = newValue;
            return true;
        },
    });
};
exports.i18nProxy = i18nProxy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWJzL2xhbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLGtEQUFnRDtBQUVoRCxJQUFZLEtBR1g7QUFIRCxXQUFZLEtBQUs7SUFDZixxQkFBWSxDQUFBO0lBQ1oscUJBQVksQ0FBQTtBQUNkLENBQUMsRUFIVyxLQUFLLEdBQUwsYUFBSyxLQUFMLGFBQUssUUFHaEI7QUFFWSxRQUFBLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQTtBQUVuQyxRQUFBLE9BQU87SUFDbEIsR0FBQyxLQUFLLENBQUMsRUFBRSxJQUFHO1FBQ1YsMkJBQTJCLEVBQ3pCLHFGQUFxRjtRQUN2RixjQUFjLEVBQUUsK0JBQStCO1FBQy9DLElBQUksRUFBRSxlQUFlO1FBQ3JCLEdBQUcsRUFBRSxpQkFBaUI7UUFDdEIsZ0JBQWdCLEVBQUUsZ0RBQWdEO1FBQ2xFLGdCQUFnQixFQUFFLHNEQUFzRDtRQUN4RSxJQUFJLEVBQUUsaUJBQWlCO1FBQ3ZCLHVCQUF1QixFQUFFLGlDQUFpQztLQUMzRDtRQUNGO0FBRU0sSUFBTSxDQUFDLEdBQUcsVUFBQyxJQUFZLEVBQUUsSUFBVyxZQUFLLE9BQUEsQ0FBQSxNQUFBLGVBQU8sQ0FBQyxJQUFJLENBQUMsMENBQUcsSUFBSSxDQUFDLEtBQUksSUFBSSxDQUFBLEVBQUEsQ0FBQTtBQUFoRSxRQUFBLENBQUMsS0FBK0Q7QUFFN0UsSUFBTSxlQUFlLEdBQUcsVUFBQSxNQUFNLElBQUksT0FBQSxlQUFRLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBRSxFQUF2QyxDQUF1QyxDQUFBO0FBRWxFLElBQU0sU0FBUyxHQUFHLFVBQUMsUUFBUSxFQUFFLE1BQU07O0lBQ3hDLElBQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNoQyxJQUFBLFlBQVksR0FBSyxDQUFBLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFBLGFBQTNCLENBQTJCO0lBQy9DLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEtBQUksTUFBQSxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsT0FBTyw2REFBRyxRQUFRLENBQUMsQ0FBQSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUE7SUFDekUsTUFBQSxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsT0FBTyw2REFBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFFdkMsT0FBTyxJQUFJLEtBQUssQ0FDZDtRQUNFLENBQUMsRUFBRSxVQUFDLElBQVksSUFBSyxPQUFBLElBQUEsU0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBYixDQUFhO1FBQ2xDLGVBQWUseUJBQUE7UUFDZixJQUFJLE1BQUE7S0FDTCxFQUNEO1FBQ0UsR0FBRyxZQUFDLE1BQU0sRUFBRSxJQUFJOztZQUNkLElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRTtnQkFDbkIsT0FBTyxDQUFBLE1BQUEsWUFBWSxhQUFaLFlBQVksdUJBQVosWUFBWSxDQUFFLE9BQU8sNkRBQUcsUUFBUSxDQUFDLEtBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO2FBQ3pEO1lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDckIsQ0FBQztRQUNELEdBQUcsWUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVE7O1lBQ3hCLElBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxRQUFRLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFBO2dCQUN2QixNQUFNLENBQUMsQ0FBQyxHQUFHLFVBQUMsSUFBWSxJQUFLLE9BQUEsSUFBQSxTQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUFqQixDQUFpQixDQUFBO2dCQUM5QyxNQUFBLFlBQVksYUFBWixZQUFZLHVCQUFaLFlBQVksQ0FBRSxPQUFPLDZEQUFHLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtnQkFDM0MscUJBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFCQUFTLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTthQUNsRTtZQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUE7WUFFdkIsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDO0tBQ0YsQ0FDRixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBakNZLFFBQUEsU0FBUyxhQWlDckIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsYW5nRXZlbnQgfSBmcm9tICdAY2xvdWRiYXNlL3V0aWxpdGllcydcblxuZXhwb3J0IGVudW0gTEFOR1Mge1xuICBaSCA9ICd6aC1DTicsXG4gIEVOID0gJ2VuLVVTJyxcbn1cblxuZXhwb3J0IGNvbnN0IExBTkdfSEVBREVSX0tFWSA9ICdBY2NlcHQtTGFuZ3VhZ2UnXG5cbmV4cG9ydCBjb25zdCBsYW5nTWFwID0ge1xuICBbTEFOR1MuRU5dOiB7XG4gICAgJ+ivt+ajgOafpeiwg+eUqOaWueW8j++8jOaIluWJjeW+gOS6keW8gOWPkSBBSSsg6aaW6aG15p+l55yL5paH5qGjJzpcbiAgICAgICdQbGVhc2UgY2hlY2sgdGhlIGNhbGxpbmcgbWV0aG9kIG9yIHZpc2l0IHRoZSBBSSsgaG9tZXBhZ2UgdG8gdmlldyB0aGUgZG9jdW1lbnRhdGlvbicsXG4gICAgJ0FJKyDor7fmsYLlh7rplJnvvIzplJnor6/noIEnOiAnQUkrIHJlcXVlc3QgZXJyb3IsIGVycm9yIGNvZGUnLFxuICAgIOmUmeivr+S/oeaBrzogJ2Vycm9yIG1lc3NhZ2UnLFxuICAgIOacquWunueOsDogJ25vdCBpbXBsZW1lbnRlZCcsXG4gICAgJ+Wwj+eoi+W6j+S4jeaUr+aMgSB3YXNtIOWKoOi9vSc6ICd3YXNtIGxvYWRpbmcgaXMgbm90IHN1cHBvcnRlZCBpbiBtaW5pIHByb2dyYW1zJyxcbiAgICAn5bCP56iL5bqP5LiN5pSv5oyB5Yqo5oCBIGpzIOWKoOi9vSc6ICdkeW5hbWljIGpzIGxvYWRpbmcgaXMgbm90IHN1cHBvcnRlZCBpbiBtaW5pIHByb2dyYW1zJyxcbiAgICDor7fmsYLotoXml7Y6ICdyZXF1ZXN0IHRpbWVvdXQnLFxuICAgICfnvLrlsJEgcHJpdmF0ZWxpbmsgc2RrIOWcsOWdgCc6ICdtaXNzaW5nIHByaXZhdGVsaW5rIHNkayBhZGRyZXNzJyxcbiAgfSxcbn1cblxuZXhwb3J0IGNvbnN0IHQgPSAodGV4dDogc3RyaW5nLCBsYW5nOiBMQU5HUykgPT4gbGFuZ01hcFtsYW5nXT8uW3RleHRdIHx8IHRleHRcblxuY29uc3QgZ2V0TGFuZ0NhY2hlS2V5ID0gY29uZmlnID0+IGBsYW5nXyR7Y29uZmlnLmNsaWVudElkIHx8IGNvbmZpZy5lbnZ9YFxuXG5leHBvcnQgY29uc3QgaTE4blByb3h5ID0gKHBsYXRmb3JtLCBjb25maWcpID0+IHtcbiAgY29uc3QgY2FjaGVLZXkgPSBnZXRMYW5nQ2FjaGVLZXkoY29uZmlnKVxuICBjb25zdCB7IGxvY2FsU3RvcmFnZSB9ID0gcGxhdGZvcm0uYWRhcHRlciB8fCB7fVxuICBjb25zdCBsYW5nID0gY29uZmlnLmxhbmcgfHwgbG9jYWxTdG9yYWdlPy5nZXRJdGVtPy4oY2FjaGVLZXkpIHx8IExBTkdTLlpIXG4gIGxvY2FsU3RvcmFnZT8uc2V0SXRlbT8uKGNhY2hlS2V5LCBsYW5nKVxuXG4gIHJldHVybiBuZXcgUHJveHkoXG4gICAge1xuICAgICAgdDogKHRleHQ6IHN0cmluZykgPT4gdCh0ZXh0LCBsYW5nKSxcbiAgICAgIExBTkdfSEVBREVSX0tFWSxcbiAgICAgIGxhbmcsXG4gICAgfSxcbiAgICB7XG4gICAgICBnZXQodGFyZ2V0LCBwcm9wKSB7XG4gICAgICAgIGlmIChwcm9wID09PSAnbGFuZycpIHtcbiAgICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlPy5nZXRJdGVtPy4oY2FjaGVLZXkpIHx8IHRhcmdldFtwcm9wXVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF1cbiAgICAgIH0sXG4gICAgICBzZXQodGFyZ2V0LCBwcm9wLCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAocHJvcCA9PT0gJ2xhbmcnICYmIG5ld1ZhbHVlICE9PSB0YXJnZXRbcHJvcF0pIHtcbiAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBuZXdWYWx1ZVxuICAgICAgICAgIHRhcmdldC50ID0gKHRleHQ6IHN0cmluZykgPT4gdCh0ZXh0LCBuZXdWYWx1ZSlcbiAgICAgICAgICBsb2NhbFN0b3JhZ2U/LnNldEl0ZW0/LihjYWNoZUtleSwgbmV3VmFsdWUpXG4gICAgICAgICAgbGFuZ0V2ZW50LmJ1cy5maXJlKGxhbmdFdmVudC5MQU5HX0NIQU5HRV9FVkVOVCwgeyBpMThuOiB0YXJnZXQgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldFtwcm9wXSA9IG5ld1ZhbHVlXG5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0sXG4gICAgfSxcbiAgKVxufVxuIl19
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1768287884692);
})()
//miniprogram-npm-outsideDeps=["@cloudbase/utilities","@cloudbase/adapter-wx_mp","@cloudbase/adapter-interface"]
//# sourceMappingURL=index.js.map