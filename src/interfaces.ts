import {
  DirectiveProcessOptions, TypedObject,
  Directive,
  AttributeChangeHandler
} from './interfaces';

/**
 * @internal
 * @ignore
 */
export interface TypedObject<T> {
  [s: string]: T;
}




/**
 * Directive definition
 * @example
 * ```typescript
 * registerDirective({
 *  attribute: (attr: Attr) => attr.nodeName.startsWith('*autoSelect') && attr.parentElement.localName === 'input',
 *  process: ({targetNode} => {
 *    targetNode.addEventListener('focus', () => targetNode.select());
 *  })
 * })
 * ```
 */
export interface Directive<T = any> {
  /**
   * Parser function or attribute exact name for detecting if an attribute should be processed as a directive
   */
  attribute: string | ((attr: Attr) => any);
  /**
   * When `attribute` function returns a truthy value this function is called to process or initiate the directive actions
   */
  process: (options: DirectiveProcessOptions<T>) => Function | void;

  registerAsGlobal?: (register: DirectiveRegister|undefined) => void
}

/**
 * Used to mount an existing primitive DOM node (i.e. `div` or `span`) without creating a custom element
 */
export interface MountPointDescriptor extends BaseDescriptor {
  /**
   * The DOM node mount point.
   */
  mount: string | HTMLElement;
};

/**
 * Create the component as a custom element
 */
export interface TagDescriptor extends BaseDescriptor {
  /**
   * The `localName` (tag) that will be registered with the custom elements registry
   */
  tag: string;

  /**
   * Triggered from the custom element's `connectedCallback`.
   * The function will receive the DOM node as argument
   */
  connectedCallback?: (node: HTMLElement) => void;

  /**
   * Triggered from the custom element's `disconnectedCallback`.
   * The function will receive the DOM node as argument
   */
  disconnectedCallback?: (node: HTMLElement) => void;

  /**
   * Key-Value store of observed attributes reflected from the DOM element to the handler
   * @example
   * ```typescript
   *  attributes: {
   *    'type': function (value: string, oldValue: string, domNode: HTMLElement) {
   *      this.type = value;
   *      domNode.dispatchEvent(new Event('type-changed'));
   *    }
   *  }
   * ```
   */
  attributes?: TypedObject<AttributeChangeHandler>;
};

export interface BaseDescriptor {
  /**
   * Key-Value store of properties initialized on the DOM element
   * Every change in these properties on the DOM element is reflected into the component handler
   */
  properties?: TypedObject<any>;

  /**
   * Scoped directives to be applied on the component's template
   * These are added to the global directives
   * Scoped directives are not to be registered globally
   */
  directives?: Directive[];

  /**
   * Component initializer function. Triggered immediately upon creation.
   * When a component is defined as a custom-element, it is triggered from the constructor.
   * @example
   * ```typescript
   * init: function () {
   *  this.someValue = "hello"
   * }
   * ```
   */
  init?: (element: HTMLElement) => any;

  /**
   * HTML Tree with expressions and directives
   * @example
   * ```html
   * <style>
   *   :host {
   *     border: 3px double darkred;
   *   }
   * </style>
   * <span onclick="{{this.counter++}}" part="greeter">
   *    {{this.prefix || '😃'}}
   *    <slot></slot>
   *    {{this.postfix || '😃'}}
   * </span>
   * ```
   */
  template: string;

  /**
   * The component handler. Anything in the template relates to `this` will be applied on the handler
   */
  this?: any;

  /**
   * Whether to use shadow root in the mount point or the custom element
   * @default-value false
   */
  shadow?: boolean;

  /**
   * Whether
   */
  closed?: undefined | true;
};

/**
 * - For custom elements, @see [[TagDescriptor]]
 * - For mounting primitive nodes, @see [[MountPointDescriptor]]
 */
export type ComponentDescriptor = MountPointDescriptor | TagDescriptor;


export interface DirectiveProcessOptions<T = any> {
  /**
   * DOM node containing the detected attribute
   */
  targetNode: Element | HTMLElement;

  /**
   * The parent component DOM node
   */
  componentNode: Element | HTMLElement;

  /**
   * The component handler instance
   */
  componentHandler: T;

  /**
   * The detected attribute
   */
  attribute: Attr;

  /**
   * If the attribute's node value is parsed as an expression (curly-braces)
   */
  expression: string | null;

  /**
   * Detected property paths (dot-notation) relevant to the directive
   */
  paths: string[];
};

export type AttributeChangeHandler = (
  value: string,
  oldValue: string,
  node: HTMLElement
) => void;

export type DirectiveRegister = (directive: Directive) => void;