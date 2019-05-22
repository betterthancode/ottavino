/**
 * @internal
 * @ignore
 */
const stripCurlies = /(\{\{([^\{|^\}]+)\}\})/gi;

/**
 * @internal
 * @ignore
 */
export type ExpressionResolution = {
  paths: string[];
  expression: string | null;
  expressions: string[];
};

/**
 * @internal
 * @ignore
 */
export const parse = (expression: string): ExpressionResolution => {
  let match;
  let paths = [];
  const regexp = /(this\.[\w+|\d*]*)+/gi;
  while (match = regexp.exec(expression)) {
    paths.push(match[1]);
  }
  return {
    paths,
    expression,
    expressions: paths.length ? expression.match(stripCurlies) || [] : []
  };
};
