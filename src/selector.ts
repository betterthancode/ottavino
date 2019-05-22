import { SYMBOLS } from './enums';

/**
 * @internal
 * @ignore
 */
export const selector = (selector: string):HTMLElement|SYMBOLS => {
  try {
    const el = document.querySelector(selector);
    if (el) {
      return <HTMLElement>el;
    } else {
      return SYMBOLS.NF;
    }
  } catch {
    return SYMBOLS.IS;
  }
};
