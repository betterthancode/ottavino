import { SYMBOLS } from './enums';

export const selector = (selector: string):HTMLElement|SYMBOLS => {
  try {
    const el = document.querySelector(selector);
    if (el) {
      return <HTMLElement>el;
    } else {
      return SYMBOLS.ELEMENT_NOT_FOUND;
    }
  } catch {
    return SYMBOLS.INVALID_SELECTOR;
  }
};
