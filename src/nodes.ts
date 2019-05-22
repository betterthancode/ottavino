import { createProxy } from './proxy';
import { parse } from './expression';
import { Directive } from './interfaces';

/**
 * @ignore
 */
const propagate = (binders: { [path: string]: Function[] }) => (
  key: string
) => {
  Object.keys(binders).forEach(path =>
    path.startsWith('this.' + key) ? binders[path].forEach(fn => fn()) : void 0
  );
};

/**
 * @ignore
 */
export const scanDOMTree = (
  root: Element,
  model: any,
  element: HTMLElement,
  directives: Directive[] = []
) => {
  const binders: { [path: string]: Function[] } = {};
  const addPath = (path: string, fn: Function): void => {
    if (binders[path]) binders[path].push(fn);
    else binders[path] = [fn];
  };
  const update = propagate(binders);
  let proxy = createProxy(model, update)[1];
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );
  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      const attributes = Array.from((<Element>currentNode).attributes);
      attributes.forEach(attr => {
        const { expression, paths } = parse(attr.nodeValue as string);
        directives.forEach(directive => {
          if (
            directive.attribute === attr.nodeName ||
            (<Function>directive.attribute)(attr)
          ) {
            requestAnimationFrame(() => {
              (<Element>attr.ownerElement).removeAttribute(attr.nodeName);
            });
            const invocation = directive.process({
              attribute: attr,
              componentHandler: model,
              expression,
              paths,
              componentNode: element,
              targetNode: attr.ownerElement as HTMLElement
            });
            if (invocation) {
              const fn = new Function(
                'return ' + ((expression as string).slice(2, -2)) + ';'
              );
              paths.forEach(path =>
                addPath(path, () => {
                  const value = fn.call(proxy);
                  invocation(value);
                })
              );
            }
          }
        });
        if (!(<string>attr.nodeValue).includes('{{')) {
          return;
        }
        if (expression) {
          if (attr.nodeName.startsWith('on')) {
            const eventName = attr.nodeName.slice(2);
            const fn = new Function(
              'event',
              'component',
              expression.slice(2, -2) + ';'
            );
            (<Element>currentNode).setAttribute(
              'on' + eventName,
              ''
            );
            (<Element>currentNode).removeAttribute(
              'on' + eventName
            );
            (currentNode as any)['on' + eventName] = (
              event: Event
            ) => {
              fn.call(proxy, event, element);
            };
          } else {
            // other attribute
            paths.forEach(path => {
              const fn = new Function(
                'component',
                'return ' + expression.slice(2, -2) + ';'
              );
              addPath(path, () => {
                attr.nodeValue = String(fn.call(proxy, element));
              });
            });
          }
        }
      });
      currentNode = walker.nextNode();
      continue;
    }
    if (!((currentNode.nodeValue as string) || '').includes('{{')) {
      currentNode = walker.nextNode();
      continue;
    }
    const { expression, expressions, paths } = parse(currentNode.nodeValue as string);
    if (expression) {
      const oText = currentNode.nodeValue || ''
      const map = expressions.reduce((o: any, e) => {
        o[e] = new Function('component', `return ${e.slice(2, -2).trim()}`);
        return o;
      }, {});
      const node = currentNode as Text;
      const modify = (): string =>
        Object.keys(map).reduce(
          (text, expression) => {
            const joinValue = map[expression].call(proxy);
            let resolvedValue = (typeof joinValue === 'undefined') ? '' : joinValue;
            return text
              .split(expression)
              .join(resolvedValue)
          }, oText);
      paths.forEach(path => {
        addPath(path, () => {
          node.data = modify();
        })
      });
    }
    currentNode = walker.nextNode();
  }
  return [proxy, update];
};
