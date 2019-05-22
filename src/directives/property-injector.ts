// @tsdoc-ignore

import { Directive } from '../interfaces';

/**
 * @ignore
 * @internal
 */
export default (registerDirective: (directive: Directive) => void) => {
  registerDirective({
    attribute: attr =>
      attr.nodeName.startsWith('[') && attr.nodeName.endsWith(']'),
    process: ({ targetNode, attribute }) => {
      const prop = attribute.nodeName.slice(1, -1);
      return (value: any) => {
        (targetNode as any)[prop] = value;
      };
    }
  });
};
