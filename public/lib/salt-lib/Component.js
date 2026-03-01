const NOOP_RENDER = async () => [];

const renderAccessorDescriptor = {
  configurable: true,
  enumerable: false,
  get() {
    return this._renderWrapped;
  },
  set(nextRender) {
    if (typeof nextRender !== "function") {
      throw new Error("render must be a function");
    }
    this._userRender = nextRender;
  },
};

const renderProxyHandler = {
  defineProperty(target, prop, descriptor) {
    if (
      prop === "render" &&
      Object.prototype.hasOwnProperty.call(descriptor, "value")
    ) {
      const nextRender = descriptor.value;
      if (typeof nextRender !== "function") {
        throw new Error("render must be a function");
      }
      target._userRender = nextRender;
      return true;
    }

    return Reflect.defineProperty(target, prop, descriptor);
  },
};

export class Component {
  constructor(props = {}) {
    this.props = { ...props };
    this.state =
      props.state && typeof props.state === "object" && !Array.isArray(props.state)
        ? { ...props.state }
        : {};

    this._memoStore = new Map();
    this._childStore = new Map();
    this._cleanupHandlers = [];
    this._destroyed = false;
    this._renderSequence = 0;
    this._renderWrapperActive = false;
    this._legacyRenderMode = props.legacyRender === true;
    this._userRender = NOOP_RENDER;

    const explicitDomElem = props.domElem || null;
    this.domElem = explicitDomElem || document.createElement(props.tagName || "div");

    if (typeof props.className === "string" && props.className.trim()) {
      this.domElem.className = props.className.trim();
    }

    this._activateRenderWrapper();

    const instanceProxy = new Proxy(this, renderProxyHandler);

    const autoInit = props.autoInit !== false;
    const autoRender = props.autoRender !== false;
    const autoRenderBaseline = this._renderSequence;

    queueMicrotask(async () => {
      if (this._destroyed) return;

      if (autoInit) {
        await this.init();
      }

      if (!autoRender || this._destroyed) return;

      const renderAlreadyStarted = this._renderSequence !== autoRenderBaseline;
      if (!renderAlreadyStarted) {
        await this.render();
      }
    });

    return instanceProxy;
  }

  _activateRenderWrapper() {
    if (this._renderWrapperActive) return;

    const currentRender = this.render;
    this._userRender = typeof currentRender === "function" ? currentRender : NOOP_RENDER;

    Object.defineProperty(this, "render", renderAccessorDescriptor);
    this._renderWrapperActive = true;
  }

  async _renderWrapped(...args) {
    if (this._destroyed) return this;

    const renderSequence = ++this._renderSequence;

    if (this._legacyRenderMode) {
      await this._userRender.call(this, ...args);
      if (this._destroyed || renderSequence !== this._renderSequence) {
        return this;
      }
      return this;
    }

    this.clear();

    const output = await this._userRender.call(this, ...args);
    if (this._destroyed || renderSequence !== this._renderSequence) {
      return this;
    }

    const renderNodes = this._normalizeRenderOutput(output);
    if (renderNodes.length > 0) {
      this.domElem.append(...renderNodes);
    }

    return this;
  }

  _normalizeRenderOutput(output) {
    if (output === null || typeof output === "undefined" || output === false) {
      return [];
    }

    const unwrap = (value) => {
      if (value === null || typeof value === "undefined" || value === false) {
        return [];
      }

      if (Array.isArray(value)) {
        return value.flatMap(unwrap);
      }

      if (value instanceof Node) {
        return [value];
      }

      if (value?.domElem instanceof Node) {
        return [value.domElem];
      }

      return [document.createTextNode(String(value))];
    };

    return unwrap(output);
  }

  _resolveMemoDeps(depsOrFactory = []) {
    const resolved =
      typeof depsOrFactory === "function"
        ? depsOrFactory.call(this)
        : depsOrFactory;

    if (typeof resolved === "undefined" || resolved === null) {
      return [];
    }

    return Array.isArray(resolved) ? resolved : [resolved];
  }

  _areMemoDepsEqual(prevDeps, nextDeps) {
    if (prevDeps === nextDeps) return true;
    if (!Array.isArray(prevDeps) || !Array.isArray(nextDeps)) return false;
    if (prevDeps.length !== nextDeps.length) return false;

    for (let i = 0; i < prevDeps.length; i += 1) {
      if (!Object.is(prevDeps[i], nextDeps[i])) {
        return false;
      }
    }

    return true;
  }

  _resolveMemoValue(factoryOrValue) {
    if (typeof factoryOrValue === "function") {
      return factoryOrValue.call(this);
    }
    return factoryOrValue;
  }

  _normalizeChildKey(key) {
    if (typeof key !== "string" && typeof key !== "number") {
      throw new Error("useChild requires a string or number key");
    }

    const normalized = String(key).trim();
    if (!normalized) {
      throw new Error("useChild requires a non-empty key");
    }

    return normalized;
  }

  useMemo(key, factoryOrValue, depsOrFactory = []) {
    if (typeof key !== "string" || !key.trim()) {
      throw new Error("useMemo requires a non-empty string key");
    }

    const deps = this._resolveMemoDeps(depsOrFactory);
    const existing = this._memoStore.get(key);

    if (existing && this._areMemoDepsEqual(existing.deps, deps)) {
      return existing.value;
    }

    const nextValue = this._resolveMemoValue(factoryOrValue);
    this._memoStore.set(key, {
      deps: deps.slice(),
      value: nextValue,
    });

    return nextValue;
  }

  useChild(key, factory, update) {
    if (this._destroyed) {
      throw new Error("Cannot useChild on a destroyed component");
    }

    if (typeof factory !== "function") {
      throw new Error("useChild requires a child factory function");
    }

    const childKey = this._normalizeChildKey(key);
    let child = this._childStore.get(childKey);

    if (!child) {
      child = factory.call(this);
      if (!child) {
        throw new Error("useChild factory must return a child instance");
      }
      this._childStore.set(childKey, child);
    }

    if (typeof update === "function") {
      update.call(this, child);
    }

    return child;
  }

  async childElem(key, factory, update) {
    const child = this.useChild(key, factory, update);

    if (child && typeof child.render === "function") {
      await child.render();
    }

    if (!child || !(child.domElem instanceof Node)) {
      throw new Error("childElem requires child.domElem to be a DOM Node");
    }

    return child.domElem;
  }

  dropChild(key, options = {}) {
    const { destroy = true } = options;
    const childKey = this._normalizeChildKey(key);
    const child = this._childStore.get(childKey);

    if (!child) return null;

    this._childStore.delete(childKey);

    if (destroy && typeof child.destroy === "function") {
      try {
        child.destroy();
      } catch (error) {
        console.error(error);
      }
    }

    return child;
  }

  clearChildren(options = {}) {
    const { destroy = true } = options;
    const childKeys = Array.from(this._childStore.keys());

    for (const key of childKeys) {
      this.dropChild(key, { destroy });
    }
  }

  clearMemo(key) {
    if (typeof key === "undefined" || key === null) {
      this._memoStore.clear();
      return;
    }

    this._memoStore.delete(String(key));
  }

  async setState(nextStateOrUpdater, options = {}) {
    if (this._destroyed) return this.state;

    const { replace = false, render = true } = options;

    const nextState =
      typeof nextStateOrUpdater === "function"
        ? nextStateOrUpdater({ ...this.state })
        : nextStateOrUpdater;

    if (!nextState || typeof nextState !== "object" || Array.isArray(nextState)) {
      return this.state;
    }

    this.state = replace ? { ...nextState } : { ...this.state, ...nextState };

    if (render) {
      this._activateRenderWrapper();
      await this.render();
    }

    return this.state;
  }

  getState() {
    return { ...this.state };
  }

  onCleanup(fn) {
    if (typeof fn !== "function") {
      throw new Error("onCleanup requires a function");
    }

    this._cleanupHandlers.push(fn);
    return () => this.offCleanup(fn);
  }

  offCleanup(fn) {
    this._cleanupHandlers = this._cleanupHandlers.filter((item) => item !== fn);
  }

  runCleanup() {
    for (const cleanup of this._cleanupHandlers.splice(0)) {
      try {
        cleanup();
      } catch (error) {
        console.error(error);
      }
    }
  }

  destroy(options = {}) {
    const { clear = true, clearMemo = true, destroyChildren = true } = options;

    this._destroyed = true;
    this._renderSequence += 1;

    this.runCleanup();

    if (destroyChildren) {
      this.clearChildren({ destroy: true });
    } else {
      this.clearChildren({ destroy: false });
    }

    if (clearMemo) {
      this.clearMemo();
    }

    if (clear) {
      this.clear({ deep: true });
    }
  }

  _detachDomElement(node) {
    if (!node || !node.parentNode) return;
    node.parentNode.removeChild(node);
  }

  _removeDomElementRecursive(node) {
    if (!node) return;

    const children = Array.from(node.childNodes || []);
    for (const child of children) {
      this._removeDomElementRecursive(child);
    }

    this._detachDomElement(node);
  }

  async init() {}

  async render() {
    return [];
  }

  clear(options = {}) {
    const { deep = false } = options;

    if (!this.domElem) return;

    const children = Array.from(this.domElem.childNodes || []);
    for (const child of children) {
      if (deep) {
        this._removeDomElementRecursive(child);
      } else {
        this._detachDomElement(child);
      }
    }
  }
}

export default Component;
