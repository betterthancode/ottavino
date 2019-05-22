/** @ignore */
import { SYMBOLS } from './enums';
/** @ignore */
import { getMountPoint, template as createTemplate } from './template';
/** @ignore */
import { scanDOMTree } from './nodes';
/** @ignore */
import {
  Directive,
  ComponentDescriptor,
  MountPointDescriptor,
  TagDescriptor
} from './interfaces';

/**
 * @ignore
 */
declare type ComponentInitResult<T extends object> = [
  HTMLElement,
  ProxyHandler<T>,
  HTMLElement
];

/**
 * @ignore
 * @internal
 */
export interface ComponentHandler<T = any> {
  template: null | HTMLTemplateElement;
  shadow: boolean;
  data: T;
  [SYMBOLS.TM]: {
    mountPoint: HTMLElement;
    root: HTMLElement | DocumentFragment;
  };
  initialize: ComponentInitializer;
  render: (content: HTMLElement) => void;
}

/**
 * @ignore
 */
declare type ComponentInitializer<T extends object = any> = (
  options: ComponentDescriptor
) => ComponentInitResult<T>;


/**
 * @ignore
 */
const globalDirectives: Directive[] = [];

/**
 * @internal
 */
const componentHandler = <T extends object>(
  mountPoint: string | HTMLElement
): ComponentHandler => {
  const { TM } = SYMBOLS;
  const initialMountPoint = getMountPoint(mountPoint);
  return {
    template: null,
    shadow: false,
    data: {},
    [TM]: {
      mountPoint: initialMountPoint,
      root: initialMountPoint
    },
    initialize: function(options: ComponentDescriptor): ComponentInitResult<T> {
      const { properties, closed, directives } = options;
      const mountPoint: HTMLElement = this[TM].mountPoint;
      if (this.shadow && mountPoint.shadowRoot === null) {
        this[TM].root = mountPoint.attachShadow({
          mode: closed ? 'closed' : 'open'
        });
      }
      const content = (<HTMLTemplateElement>this.template).content.cloneNode(
        true
      );
      const [proxy, update] = scanDOMTree(
        content as Element,
        this.data,
        mountPoint,
        [...globalDirectives, ...directives || []]
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
      update();
      return [content as HTMLElement, proxy, mountPoint];
    },
    render: function (content) {
      const entry = this[TM].root;
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

/**
 * Initializes a component as a custom element or virtual component mounted on a DOM node
 * @param {ComponentDescriptor} options 
 */
export function component(options: ComponentDescriptor) {
  if (!(<MountPointDescriptor>options).mount && (<TagDescriptor>options).tag) {
    return customElement(options as TagDescriptor);
  }
  const handler = componentHandler((<MountPointDescriptor>options).mount as string | HTMLElement);
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

export function registerDirective (directive: Directive) {
  if (globalDirectives.indexOf(directive) < 0) globalDirectives.push(directive);
}

/**
 * @internal
 */
const customElement = (options: TagDescriptor) => {
  class TinyComponent extends HTMLElement {
    proxy = component({
      ...options as ComponentDescriptor,
      mount: this
    });

    static get observedAttributes() {
      return options.attributes ? Object.keys(options.attributes) : [];
    }
    connectedCallback() {
      if (typeof options.connectedCallback === 'function') {
        options.connectedCallback.call(this.proxy, this);
      }
    }
    disconnectedCallback() {
      if (typeof options.disconnectedCallback === 'function') {
        options.disconnectedCallback.call(this.proxy, this);
      }
    }
    attributeChangedCallback(attr: string, oldValue: string, newValue: string) {
      if (options.attributes && typeof options.attributes[attr] === 'function') {
        options.attributes[attr].call(this.proxy, newValue, oldValue, this);
      }
    }
  }
  customElements.define(options.tag as string, TinyComponent);
};

import registerPropertyInjector from './directives/property-injector';
registerPropertyInjector(registerDirective);
