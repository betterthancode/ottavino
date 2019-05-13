const ELEMENT_NOT_FOUND = Symbol();
const INVALID_SELECTOR = Symbol();
const TEMPLATE_META = Symbol();

const splitNode = (textNode, expression) => {
  const len = expression.length;
  const idx = textNode.nodeValue.indexOf(expression);
  if (idx >= 0) {
    const rest = textNode.splitText(idx);
    rest.nodeValue = rest.nodeValue.slice(len);
    const newNode = document.createTextNode('');
    rest.parentElement.insertBefore(newNode, rest);
    return newNode;
  }
};

const analyzeExpression = expression => {
  const matches = expression.match(/\{\{([^\}\}]+)+\}\}/g);
  const resolution = {
    paths: [],
    expression: matches ? matches[0] : null
  };
  if (matches) {
    const { expression } = resolution;
    const rxM = /(?<method>.+)(\((?<args>.+)\)){1}/.exec(expression);
    if (rxM && rxM.groups) {
      resolution.method = rxM.groups.method;
      resolution.paths = Array.isArray(rxM.groups.args)
        ? rxM.groups.args
            .join('')
            .split(',')
            .map(x => x.trim())
        : rxM.groups.args;
    } else {
      resolution.paths = [expression.slice(2, -2).trim()];
    }
  }
  return resolution;
};

const testIfSelector = selector => {
  try {
    const el = document.querySelector(selector);
    if (el) {
      return el;
    } else {
      return ELEMENT_NOT_FOUND;
    }
  } catch (err) {
    return INVALID_SELECTOR;
  }
};

const createTemplate = raw => {
  const selectorResult = testIfSelector(raw);
  switch (true) {
    case selectorResult instanceof HTMLTemplateElement ||
      raw instanceof HTMLTemplateElement:
      return selectorResult;

    case selectorResult === ELEMENT_NOT_FOUND:
      return document.createElement('template');

    case selectorResult === INVALID_SELECTOR:
      const templateElement = document.createElement('template');
      templateElement.innerHTML = String(raw);
      return templateElement;
  }
};

const findMountPoint = selectorOrElement => {
  if (selectorOrElement instanceof Element) {
    return selectorOrElement;
  } else {
    return testIfSelector(selectorOrElement);
  }
};

const componentHandler = mountPoint => {
  return {
    template: null,
    shadow: false,
    data: {},
    [TEMPLATE_META]: {
      mountPoint: findMountPoint(mountPoint),
      root: mountPoint
    },
    initialize: function() {
      const { mountPoint } = this[TEMPLATE_META];
      if (this.shadow && mountPoint.shadowRoot === null) {
        this[TEMPLATE_META].root = this[TEMPLATE_META].mountPoint.attachShadow({
          mode: 'closed'
        });
      } else {
        this[TEMPLATE_META].root = mountPoint;
      }
      const content = this.template.content.cloneNode(true);
      const proxy = scanDOMTree(content, this.data);
      return [content, proxy];
    },
    render: function(content) {
      this[TEMPLATE_META].root.appendChild(content);
    }
  };
};

const scanDOMTree = (root, model) => {
  const binders = {};
  let proxy;
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );
  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const attributes = Array.from(currentNode.attributes);
      attributes.forEach(attr => {
        if (attr.nodeName.startsWith('on')) {
          const { expression } = analyzeExpression(attr.nodeValue);
          const eventName = attr.nodeName.slice(2);
          const fn = new Function(
            'event',
            'component',
            expression.slice(2, -2) + ';'
          );
          currentNode['on' + eventName] = event => {
            fn.call(proxy, event);
          };
          currentNode.removeAttribute(currentNode.nodeName);
        }
      });
      currentNode = walker.nextNode();
      continue;
    }
    const { expression, paths } = analyzeExpression(currentNode.nodeValue);
    if (expression) {
      const txt = currentNode.nodeValue;
      const replacementNode = splitNode(
        /** @type Text */ currentNode,
        expression
      );
      const update = key => {
        Object.keys(binders).forEach(binderPath => {
          if (binderPath.startsWith('this.' + key)) {
            binders[binderPath]();
          }
        });
      };
      paths.forEach(path => {
        binders[path] = function() {
          const fn = new Function(
            'component',
            'return ' + expression.slice(2, -2) + ';'
          );
          try {
            replacementNode.nodeValue = String(fn.call(proxy));
          } catch (err) {}
        };
      });
      proxy = proxy || createProxy(model, update)[1];
      update('');
    }
    currentNode = walker.nextNode();
  }
  return proxy;
};

const createProxy = (target, update, prefix = '') => {
  const values = {};
  return [
    values,
    new Proxy(target, {
      get: (t, key) => {
        if (!values.hasOwnProperty(key)) {
          if (typeof target[key] === 'object') {
            values[key] = createProxy(
              target[key],
              update,
              prefix + key + '.'
            )[1];
            values[key].__prefix = prefix;
          } else {
            values[key] = target[key];
          }
        }
        return values[key];
      },
      set: (t, key, v) => {
        if (typeof v === 'object') {
          values[key] = createProxy(v, update, prefix + key + '.')[1];
          values[key].__prefix = prefix;
        } else {
          values[key] = v;
        }
        update(prefix + key);
        return true;
      }
    })
  ];
};

export const component = options => {
  const handler = componentHandler(options.mount);
  handler.template = createTemplate(options.template);
  handler.shadow = options.shadow;
  handler.data = options.props || {};
  const [content, proxy] = handler.initialize();
  if (typeof options.init === 'function') {
    options.init.call(proxy);
  }
  handler.render(content);
  return proxy;
};

component.customElement = options => {
  class SolariumComponent extends HTMLElement {
    constructor() {
      super();
      this.proxy = component({
        ...options,
        mount: this
      });
    }

    static get observedAttributes() {
      return options.attributes ? Object.keys(options.attributes) : [];
    }
    connectedCallback() {
      if (typeof options.connectedCallback === 'function') {
        options.connectedCallback.call(this.proxy);
      }
    }
    disconnectedCallback() {
      if (typeof options.disconnectedCallback === 'function') {
        options.disconnectedCallback.call(this.proxy);
      }
    }
    attributeChangedCallback(attr, oldValue, newValue) {
      if (typeof options.attributes[attr] === 'function') {
        options.attributes[attr].call(this.proxy, newValue, oldValue, this);
      }
    }
  }
  customElements.define(options.tag, SolariumComponent);
};
