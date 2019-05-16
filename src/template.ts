import { selector } from './selector';

export type SelectorResult = HTMLTemplateElement | DocumentFragment;

export const template = (raw: string|HTMLTemplateElement): HTMLTemplateElement => {
  if (raw instanceof HTMLTemplateElement) {
    return raw;
  } else {
    const templateElement = document.createElement('template');
    templateElement.innerHTML = raw;
    return templateElement;
  }
};

export const getMountPoint = (raw: string | HTMLElement) => {
  if (raw instanceof HTMLElement) {
    return raw;
  }
  const result = selector(raw);
  if (result instanceof HTMLElement) {
    return result
  } else {
    return template(<string>raw);
  }
}