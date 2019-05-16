import { SYMBOLS } from './enums';

import { getMountPoint, template as createTemplate } from './template';

import { scanDOMTree } from './nodes';

declare type ComponentInitResult<T extends object> = [
  HTMLElement,
  ProxyHandler<T>,
  HTMLElement
];

declare interface ComponentHandler<T = any> {
  template: null | HTMLTemplateElement;
  shadow: boolean;
  data: T;
  [SYMBOLS.TEMPLATE_META]: {
    mountPoint: HTMLElement;
    root: HTMLElement | DocumentFragment;
  };
  initialize: ComponentInitializer;
  render: (content: HTMLElement) => void;
}

declare type ComponentInitializer<T extends object = any> = (
  options: ComponentDescriptor<T>
) => ComponentInitResult<T>;

export type ComponentDescriptor<T> = {
  properties?: { [key: string]: any };
  attributes?: { [key: string]: Function };
  init?: (element: HTMLElement) => any;
  tag?: string;
  mount?: string | HTMLElement;
  template: string;
  this?: T;
  shadow?: boolean;
  closed?: boolean;
  connectedCallback?: Function,
  disconnectedCallback?: Function
};

const componentHandler = <T extends object>(
  mountPoint: string | HTMLElement
): ComponentHandler => {
  const { TEMPLATE_META } = SYMBOLS;
  const initialMountPoint = getMountPoint(mountPoint);
  return {
    template: null,
    shadow: false,
    data: {},
    [TEMPLATE_META]: {
      mountPoint: initialMountPoint,
      root: initialMountPoint
    },
    initialize: function(options: ComponentDescriptor<T>): ComponentInitResult<T> {
      const { properties, closed } = options;
      const mountPoint: HTMLElement = this[TEMPLATE_META].mountPoint;
      if (this.shadow && mountPoint.shadowRoot === null) {
        this[TEMPLATE_META].root = mountPoint.attachShadow({
          mode: closed ? 'closed' : 'open'
        });
      }
      const content = (<HTMLTemplateElement>this.template).content.cloneNode(
        true
      );
      const [proxy, update] = scanDOMTree(
        content as Element,
        this.data,
        mountPoint
      );
      if (properties) {
        Object.entries(properties).forEach(([key, value]) => {
          proxy[key] = value;
          Object.defineProperty(mountPoint, key, {
            get: () => proxy[key],
            set: v => (proxy[key] = v)
          });
        });
      }
      return [content as HTMLElement, proxy, mountPoint];
    },
    render: function (content) {
      const entry = this[TEMPLATE_META].root;
      if (this.shadow) {
        entry.appendChild(content);
      } else {
        requestAnimationFrame(() => {
          entry.appendChild(content);
        })
      }
    }
  };
};

export const component = <T extends object = any>(
  options: ComponentDescriptor<T>
) => {
  if (!options.mount && options.tag) {
    return customElement<T>(options);
  }
  const handler = componentHandler(options.mount as string | HTMLElement);
  handler.template = createTemplate(options.template);
  handler.shadow = !!options.shadow;
  handler.data = options.this || {};
  const [content, proxy, element] = handler.initialize(options);
  if (typeof options.init === 'function') {
    options.init.call(proxy, element);
  }
  handler.render(content);
  return proxy;
};

const customElement = <T extends object = any>(
  options: ComponentDescriptor<T>
) => {
  class TinyComponent extends HTMLElement {
    proxy = component({
      ...options,
      mount: this
    });

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
    attributeChangedCallback(attr: string, oldValue: string, newValue: string) {
      if (options.attributes && typeof options.attributes[attr] === 'function') {
        console.log(this.proxy);
        debugger;
        options.attributes[attr].call(this.proxy, newValue, oldValue, this);
      }
    }
  }
  customElements.define(options.tag as string, TinyComponent);
};
