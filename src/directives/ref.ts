// @tsdoc-ignore

import { Directive } from '../interfaces';

/**
 * @ignore
 * @internal
 */
export default (registerDirective: (directive: Directive) => void) => {
  registerDirective({
    attribute: attr =>
      attr.nodeName === '#ref',
    process: ({ componentHandler, targetNode, attribute }) => {
      const key = attribute.nodeValue as string;
      (<any>componentHandler)[key] = targetNode;
    }
  });
};
