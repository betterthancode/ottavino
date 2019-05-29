// @tsdoc-ignore

type ProcessOptions = {
  targetNode: HTMLElement,
  attribute: Attr
}

/**
 * @ignore
 */
export default {
  attribute: (attr: any) => attr.nodeName.startsWith('[') && attr.nodeName.endsWith(']'),
  process: ({ targetNode, attribute }: ProcessOptions) => {
    const prop = attribute.nodeName.slice(1, -1);
    return (value: any) => {
      (targetNode as any)[prop] = value;
    };
  },
  registerAsGlobal: function (register: Function|undefined) {
    if (typeof register === 'function') {
      register(this);
    } else {
      (<any>window).ottavino.registerDirective(this);
    }
  }
}