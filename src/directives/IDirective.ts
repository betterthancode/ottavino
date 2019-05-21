import { ComponentHandler } from "../component";

export type DirectiveProcessOptions<T = any> = {
  targetNode: Element|HTMLElement,
  componentNode: Element|HTMLElement,
  componentHandler: ComponentHandler<T>,
  attribute: Attr,
  expression: string | null,
  paths: string[]
}

export interface Directive<T = any> {
  attribute: string | ((attr: Attr) => any);
  process: (options: DirectiveProcessOptions<T>) => Function|void;
}

export type DirectiveRegistration = (directive: Directive) => void;