var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
var unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime3,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
var {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert,
  disconnect,
  mainModule
} = unenvProcess;
var {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// C:/Users/mrmic/AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/index.js
function generateUUID() {
  return crypto.randomUUID();
}
__name(generateUUID, "generateUUID");
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
function detectMarkers(text) {
  const words = text.match(/\b[A-Z]{2,}\b/g) || [];
  const caps_words = words.length;
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const ellipses = (text.match(/\.\.\./g) || []).length;
  let repeated_chars = 0;
  for (let i = 2; i < text.length; i++) {
    if (text[i] === text[i - 1] && text[i] === text[i - 2]) repeated_chars++;
  }
  const length_chars = text.length;
  return JSON.stringify({ caps_words, exclamations, questions, ellipses, repeated_chars, length_chars });
}
__name(detectMarkers, "detectMarkers");
function detectProfanity(text) {
  const profanityPattern = /\b(fuck|shit|hell|damn|ass|crap|bullshit|wtf|omg)\b/gi;
  const matches = text.match(profanityPattern);
  return matches ? matches.length : 0;
}
__name(detectProfanity, "detectProfanity");
var FORMAT_SIGNATURES = {
  claude: /Human:/i,
  chatgpt: /^(User|You|Human):/i,
  notebooklm: /^(Prompt|Question):/i,
  vscode: /^>>> /,
  gemini: /^(You|User|Human):/i
};
function detectFormat(lines) {
  const sample = lines.slice(0, 20).join("\n");
  for (const [format, regex] of Object.entries(FORMAT_SIGNATURES)) {
    if (regex.test(sample)) return format;
  }
  return null;
}
__name(detectFormat, "detectFormat");
function parsePrompts(text, format, baseDate) {
  const lines = text.split("\n");
  const prompts = [];
  let position = 0;
  if (!format) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        position++;
        prompts.push({ position, text: trimmed, timestamp: baseDate });
      }
    }
    return prompts;
  }
  let userPattern;
  switch (format) {
    case "claude":
      userPattern = /^Human:\s*(.*)/i;
      break;
    case "chatgpt":
    case "gemini":
      userPattern = /^(?:User|You|Human):\s*(.*)/i;
      break;
    case "notebooklm":
      userPattern = /^(?:Prompt|Question):\s*(.*)/i;
      break;
    case "vscode":
      userPattern = /^>>>\s*(.*)/;
      break;
    default:
      userPattern = /^(.*)/;
  }
  for (const line of lines) {
    const match = line.match(userPattern);
    if (match) {
      const text2 = match[1].trim();
      if (text2) {
        position++;
        let timestampStr = null;
        const tsMatch = line.match(/\[(\d{4}-\d{2}-\d{2}[T ]?\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]/);
        if (tsMatch) {
          try {
            timestampStr = new Date(tsMatch[1].replace(" ", "T")).toISOString();
          } catch (e) {
          }
        }
        prompts.push({ position, text: text2, timestamp: timestampStr || baseDate });
      }
    }
  }
  return prompts;
}
__name(parsePrompts, "parsePrompts");
async function extractKeywords(env2, session_id, student_id) {
  try {
    await env2.DB.prepare(`
      CREATE TABLE IF NOT EXISTS soul_keywords (
        id TEXT PRIMARY KEY,
        keyword TEXT NOT NULL,
        student_id TEXT,
        session_id TEXT,
        weight INTEGER DEFAULT 1,
        created_at TEXT,
        UNIQUE(keyword, student_id)
      )
    `).run();
    const { results: prompts } = await env2.DB.prepare(
      "SELECT text FROM soul_prompts WHERE session_id = ? ORDER BY position ASC"
    ).bind(session_id).all();
    if (!prompts || prompts.length === 0) return { ok: false, error: "No prompts found", keywords: [] };
    const fullText = prompts.map((p) => p.text).join("\n");
    let keywords = [];
    if (env2.AI) {
      try {
        const aiResponse = await env2.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            { role: "system", content: "Extract 5-10 keywords from this text. Return ONLY a JSON array of lowercase strings. No explanation." },
            { role: "user", content: fullText.slice(0, 4e3) }
          ]
        });
        const raw = typeof aiResponse === "string" ? aiResponse : aiResponse.response || "";
        const match = raw.match(/\[[\s\S]*?\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            keywords = parsed.filter((k) => typeof k === "string" && k.trim().length > 0).map((k) => k.toLowerCase().trim());
          }
        }
      } catch (e) {
      }
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    for (const keyword of keywords) {
      const id = generateUUID();
      await env2.DB.prepare(
        "INSERT OR IGNORE INTO soul_keywords (id, keyword, student_id, session_id, weight, created_at) VALUES (?, ?, ?, ?, 1, ?)"
      ).bind(id, keyword, student_id || null, session_id, now).run();
      await env2.DB.prepare(
        "UPDATE soul_keywords SET weight = weight + 1 WHERE keyword = ? AND student_id = ?"
      ).bind(keyword, student_id || null).run();
    }
    return { ok: true, keywords, session_id };
  } catch (err) {
    return { ok: false, error: err.message, keywords: [] };
  }
}
__name(extractKeywords, "extractKeywords");
async function handleRequest(request, env2, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  __name(jsonResponse, "jsonResponse");
  if (method === "GET" && path === "/health") {
    return jsonResponse({ status: "alive", drone: "soul-logger", version: "1.2.0", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  }
  if (method === "POST" && path === "/api/soul/extract") {
    try {
      const body = await request.json();
      if (!body.text) return jsonResponse({ error: 'Missing "text" field' }, 400);
      const dumpText = body.text;
      const source_format = body.source_format || null;
      const source_date = body.source_date ? new Date(body.source_date).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
      const lines = dumpText.split("\n");
      const detectedFormat = source_format || detectFormat(lines) || "unknown";
      const prompts = parsePrompts(dumpText, source_format || detectFormat(lines), source_date);
      if (prompts.length === 0) return jsonResponse({ error: "No prompts found in dump" }, 400);
      const sessionId = generateUUID();
      const rawByteSize = new TextEncoder().encode(dumpText).length;
      await env2.DB.prepare(`INSERT INTO soul_sessions (session_id, session_tag, source_format, source_date, ingested_at, prompt_count, raw_byte_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(sessionId, "manual-upload", source_format || detectedFormat, source_date, (/* @__PURE__ */ new Date()).toISOString(), prompts.length, rawByteSize, "ingested").run();
      for (const p of prompts) {
        const promptId = generateUUID();
        const byteCount = new TextEncoder().encode(p.text).length;
        const hash = await sha256(p.text);
        const markers = detectMarkers(p.text);
        await env2.DB.prepare(`INSERT INTO soul_prompts (prompt_id, session_id, position, text, estimated_timestamp, byte_count, hash_sha256, emotional_markers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(promptId, sessionId, p.position, p.text, p.timestamp, byteCount, hash, markers).run();
      }
      return jsonResponse({ session_id: sessionId, prompt_count: prompts.length, ingested_at: (/* @__PURE__ */ new Date()).toISOString() }, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
  if (method === "POST" && path === "/api/soul/crunch") {
    try {
      const body = await request.json();
      if (!body.session_id || !body.mode) return jsonResponse({ error: "session_id and mode required" }, 400);
      const { session_id: sessionId, mode } = body;
      if (!["bible", "themes"].includes(mode)) return jsonResponse({ error: 'mode must be "bible" or "themes"' }, 400);
      const { results: prompts } = await env2.DB.prepare("SELECT text FROM soul_prompts WHERE session_id = ? ORDER BY position ASC").bind(sessionId).all();
      if (!prompts || prompts.length === 0) return jsonResponse({ error: "Session not found or no prompts" }, 404);
      const fullText = prompts.map((p) => p.text).join("\n\n---\n\n");
      const systemPrompt = mode === "bible" ? 'You are a soul-logger crunch engine. Generate a concise "bible" from the following conversation. Preserve key verbatim phrases. Return only the bible text.' : "You are a soul-logger crunch engine. Extract key themes and motifs from the following conversation. Present as a bullet list.";
      let artifact = "", aiTierUsed = "none";
      if (env2.AI) {
        try {
          const aiResponse = await env2.AI.run("@cf/mistral/mistral-7b-instruct-v0.1", {
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: fullText }],
            max_tokens: 2e3
          });
          artifact = typeof aiResponse === "string" ? aiResponse : aiResponse.response || JSON.stringify(aiResponse);
          aiTierUsed = "workers-ai";
        } catch (e) {
        }
      }
      if (!artifact && env2.DEEPSEEK_API_KEY) {
        const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env2.DEEPSEEK_API_KEY}` },
          body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: fullText }], stream: false })
        });
        const json = await r.json();
        artifact = json.choices?.[0]?.message?.content || "";
        aiTierUsed = "deepseek";
      }
      if (!artifact) return jsonResponse({ error: "AI generation failed" }, 500);
      const crunchId = generateUUID();
      await env2.DB.prepare(`INSERT INTO soul_crunches (crunch_id, session_id, crunch_mode, artifact, ai_tier_used, created_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(crunchId, sessionId, mode, artifact, aiTierUsed, (/* @__PURE__ */ new Date()).toISOString()).run();
      return jsonResponse({ crunch_id: crunchId, mode, ai_tier_used: aiTierUsed, artifact_trimmed: artifact.substring(0, 200) + "...", created_at: (/* @__PURE__ */ new Date()).toISOString() }, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
  if (method === "GET" && path.startsWith("/api/soul/session/")) {
    const sessionId = path.split("/").pop();
    if (!sessionId) return jsonResponse({ error: "Missing session id" }, 400);
    try {
      const session = await env2.DB.prepare("SELECT * FROM soul_sessions WHERE session_id = ?").bind(sessionId).first();
      if (!session) return jsonResponse({ error: "Session not found" }, 404);
      const { results: prompts } = await env2.DB.prepare("SELECT * FROM soul_prompts WHERE session_id = ? ORDER BY position ASC").bind(sessionId).all();
      return jsonResponse({ session, prompts });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
  if (method === "GET" && path === "/api/soul/priority") {
    try {
      const limit = parseInt(url.searchParams.get("limit") || "5", 10);
      const days = parseInt(url.searchParams.get("days") || "30", 10);
      if (isNaN(limit) || limit < 1) return jsonResponse({ error: "Invalid limit" }, 400);
      if (isNaN(days) || days < 1) return jsonResponse({ error: "Invalid days" }, 400);
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1e3).toISOString();
      const { results } = await env2.DB.prepare(`
        SELECT p.prompt_id, p.session_id, p.position, p.text, p.emotional_markers, p.estimated_timestamp
        FROM soul_prompts p
        JOIN soul_sessions s ON p.session_id = s.session_id
        WHERE s.ingested_at >= ?
        ORDER BY s.ingested_at DESC
        LIMIT 200
      `).bind(cutoff).all();
      if (!results || results.length === 0) {
        return jsonResponse({ priority_items: [], total_scanned: 0, generated_at: (/* @__PURE__ */ new Date()).toISOString(), algorithm: "follow-the-fucks-v1" });
      }
      const scored = results.map((row) => {
        let markers = { caps_words: 0, exclamations: 0 };
        try {
          if (row.emotional_markers) markers = JSON.parse(row.emotional_markers);
        } catch (e) {
        }
        const caps_words = markers.caps_words || 0;
        const exclamations = markers.exclamations || 0;
        const profanity_count = detectProfanity(row.text);
        const score = caps_words * 3 + exclamations * 2 + profanity_count * 10;
        return { prompt_id: row.prompt_id, session_id: row.session_id, position: row.position, text: row.text, score, caps_words, exclamations, profanity_count, estimated_timestamp: row.estimated_timestamp };
      });
      scored.sort((a, b) => b.score - a.score);
      return jsonResponse({ priority_items: scored.slice(0, limit), total_scanned: results.length, generated_at: (/* @__PURE__ */ new Date()).toISOString(), algorithm: "follow-the-fucks-v1" });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
  if (method === "POST" && path === "/api/soul/event") {
    try {
      const body = await request.json();
      const { student_id, session_id, role, text, timestamp } = body;
      if (!student_id || !session_id || !role || !text) {
        return jsonResponse({ error: "student_id, session_id, role, text required" }, 400);
      }
      const ts = timestamp || (/* @__PURE__ */ new Date()).toISOString();
      const existing = await env2.DB.prepare("SELECT session_id FROM soul_sessions WHERE session_id = ?").bind(session_id).first();
      if (!existing) {
        await env2.DB.prepare(`INSERT INTO soul_sessions (session_id, session_tag, source_format, source_date, ingested_at, prompt_count, raw_byte_size, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(session_id, student_id, "obi-live", ts, ts, 0, 0, "live").run();
      }
      const countRow = await env2.DB.prepare("SELECT COUNT(*) as cnt FROM soul_prompts WHERE session_id = ?").bind(session_id).first();
      const position = (countRow?.cnt || 0) + 1;
      const promptId = generateUUID();
      const byteCount = new TextEncoder().encode(text).length;
      const hash = await sha256(text);
      const markers = detectMarkers(text);
      await env2.DB.prepare(`INSERT INTO soul_prompts (prompt_id, session_id, position, text, estimated_timestamp, byte_count, hash_sha256, emotional_markers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(promptId, session_id, position, text, ts, byteCount, hash, markers).run();
      await env2.DB.prepare("UPDATE soul_sessions SET prompt_count = prompt_count + 1 WHERE session_id = ?").bind(session_id).run();
      const newCountRow = await env2.DB.prepare("SELECT COUNT(*) as cnt FROM soul_prompts WHERE session_id = ?").bind(session_id).first();
      const newCount = newCountRow?.cnt || 0;
      if (newCount > 0 && newCount % 10 === 0) {
        const skeletonPromise = extractKeywords(env2, session_id, student_id);
        if (ctx && ctx.waitUntil) {
          ctx.waitUntil(skeletonPromise);
        } else {
          skeletonPromise.catch(() => {
          });
        }
      }
      return jsonResponse({ ok: true, event_id: promptId, session_id, position }, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
  if (method === "POST" && path === "/api/soul/skeleton") {
    try {
      const body = await request.json();
      const { session_id, student_id } = body;
      if (!session_id) return jsonResponse({ error: "session_id required" }, 400);
      const result = await extractKeywords(env2, session_id, student_id);
      if (!result.ok) return jsonResponse({ error: result.error || "Skeleton extraction failed" }, 500);
      return jsonResponse(result, 201);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
  if (method === "GET" && path.startsWith("/api/soul/context/")) {
    const studentId = decodeURIComponent(path.replace("/api/soul/context/", ""));
    if (!studentId) return jsonResponse({ error: "Missing studentId" }, 400);
    try {
      const { results: sessions } = await env2.DB.prepare(`
        SELECT session_id, ingested_at, prompt_count FROM soul_sessions
        WHERE session_tag = ? ORDER BY ingested_at DESC LIMIT 5
      `).bind(studentId).all();
      if (!sessions || sessions.length === 0) {
        return jsonResponse({ student_id: studentId, last_active: null, sessions: [], top_keywords: [], context_brief: "No prior sessions." });
      }
      const enriched = [];
      for (const s of sessions) {
        const { results: prompts } = await env2.DB.prepare(`
          SELECT text, estimated_timestamp FROM soul_prompts
          WHERE session_id = ? ORDER BY position DESC LIMIT 3
        `).bind(s.session_id).all();
        enriched.push({ session_id: s.session_id, ingested_at: s.ingested_at, prompt_count: s.prompt_count, last_prompts: prompts.reverse() });
      }
      const lastActive = sessions[0].ingested_at;
      const recentTexts = enriched[0]?.last_prompts?.map((p) => p.text).join(" | ") || "";
      let topKeywords = [];
      try {
        const { results: kw } = await env2.DB.prepare(
          "SELECT keyword, weight FROM soul_keywords WHERE student_id = ? ORDER BY weight DESC LIMIT 10"
        ).bind(studentId).all();
        topKeywords = kw || [];
      } catch (e) {
        topKeywords = [];
      }
      const keywordSuffix = topKeywords.length > 0 ? " Top keywords: " + topKeywords.slice(0, 3).map((k) => k.keyword).join(", ") + "." : "";
      const contextBrief = `Last active: ${lastActive.slice(0, 10)}. Recent: ${recentTexts.slice(0, 200)}${keywordSuffix}`;
      return jsonResponse({ student_id: studentId, last_active: lastActive, sessions: enriched, top_keywords: topKeywords, context_brief: contextBrief });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
  return jsonResponse({
    drone: "soul-logger",
    status: "online",
    endpoints: ["GET /health", "POST /api/soul/extract", "POST /api/soul/crunch", "GET /api/soul/session/:id", "GET /api/soul/priority", "POST /api/soul/event", "POST /api/soul/skeleton", "GET /api/soul/context/:studentId"]
  }, 404);
}
__name(handleRequest, "handleRequest");
var index_default = {
  async fetch(request, env2, ctx) {
    return handleRequest(request, env2, ctx);
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
