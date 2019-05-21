import { DirectiveRegistration } from './IDirective';

export default (registerDirective: DirectiveRegistration) => {
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
