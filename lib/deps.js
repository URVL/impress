'use strict';

const CWD = process.cwd();

const wt = require('node:worker_threads');
const { createRequire } = require('node:module');
const metautil = require('metautil');
const appRequire = createRequire(`file://${CWD}/server.js`);

const node = {};
const npm = {};
const metarhia = {};

const sys = ['util', 'buffer', 'child_process', 'os', 'v8', 'vm'];
const tools = ['path', 'string_decoder', 'querystring'];
const test = ['assert', 'test'];
const streams = ['stream', 'fs', 'crypto', 'zlib', 'readline'];
const async = ['perf_hooks', 'async_hooks', 'timers', 'events'];
const net = ['dns', 'net', 'tls', 'http', 'https', 'http2', 'dgram'];
const internals = [...sys, ...tools, ...streams, ...async, ...net, ...test];

const optional = ['metasql', 'test'];
const core = ['metaconfiguration', 'metalog', 'metavm', 'metawatch'];
const metapkg = [...core, 'metautil', 'metacom', 'metaschema', ...optional];

const npmpkg = ['ws'];
const pkg = require(CWD + '/package.json');
if (pkg.dependencies) npmpkg.push(...Object.keys(pkg.dependencies));
const dependencies = [...internals, ...npmpkg, ...metapkg];

const notLoaded = new Set();

const assignNamespace = (container, name, value) => {
  container[name] = value;
  const library = name.startsWith('@') ? name.slice(1) : name;
  const key = metautil.replace(library, '/', '-');
  const camelKey = metautil.spinalToCamel(key);
  container[camelKey] = value;
};

const loadPlugins = (lib) => {
  for (const plugin of Object.keys(lib.plugins)) {
    lib.plugins[plugin] = String(lib.plugins[plugin]);
  }
};

const loadModule = (name) => {
  const lib = appRequire(name);
  const pkg = require(`${CWD}/node_modules/${name}/package.json`);
  if (!pkg.exports) return lib;

  for (const subModule of Object.keys(pkg.exports)) {
    let subName;
    try {
      if (subModule === '.') continue;
      subName = subModule.slice(2);
      const subExp = pkg.exports[subModule];
      const requirePath = typeof subExp === 'object' ? subExp.require : subExp;
      if (!requirePath || Reflect.has(lib, subName)) continue;
      const sub = appRequire(name + '/' + subName);
      lib[subName] = sub;
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND' && pkg.peerDependenciesMeta) {
        const moduleName = metautil.between(err.message, `'`, `'`);
        const optional = pkg.peerDependenciesMeta[moduleName]?.optional;
        if (optional) continue;
      }
      console.error(`Error loading submodule ${subName} for ${name}:`, err);
      throw err;
    }
  }
  return lib;
};

for (const name of dependencies) {
  if (name === 'impress') continue;
  let lib = null;
  try {
    if (internals.includes(name)) {
      lib = require(`node:${name}`);
    } else {
      lib = loadModule(name);
    }
  } catch {
    if (npmpkg.includes(name) || !optional.includes(name)) {
      notLoaded.add(name);
    }
    continue;
  }
  if (lib.plugins) loadPlugins(lib);
  if (internals.includes(name)) {
    assignNamespace(node, name, lib);
    continue;
  }
  if (metapkg.includes(name)) {
    assignNamespace(metarhia, name, lib);
    continue;
  }
  assignNamespace(npm, name, lib);
}

node.childProcess = node['child_process'];
node.StringDecoder = node['string_decoder'];
node.perfHooks = node['perf_hooks'];
node.asyncHooks = node['async_hooks'];
node.fsp = node.fs.promises;
if (!node.timers.promises) {
  node.timers.promises = require('node:timers/promises');
}

Object.freeze(node);
Object.freeze(npm);
Object.freeze(metarhia);

module.exports = { node, npm, metarhia, notLoaded, wt };
