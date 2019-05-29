// @tsdoc-ignore

import { DirectiveProcessOptions, Directive } from '../interfaces';

// @tsdoc-ignore

/**
 * @ignore
 */
export default {
  attribute: (attr: any) => attr.nodeName === '#ref',
  process: ({
    componentNode,
    componentHandler,
    targetNode,
    attribute
  }: DirectiveProcessOptions) => {
    const key = attribute.nodeValue as string;
    (<any>componentHandler).$ = (<any>componentNode).ref = {
      ...((<any>componentNode).ref || {}),
      [key]: targetNode
    };
  },
  registerAsGlobal: function(register: Function | undefined) {
    if (typeof register === 'function') {
      register(this);
    } else {
      (<any>window).ottavino.registerDirective(this);
    }
  }
} as Directive;
