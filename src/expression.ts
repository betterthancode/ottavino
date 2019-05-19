type ExpressionResolution = {
  paths: string[];
  expression: string | null;
};

export const parse = (expression: string): ExpressionResolution => {
  const matches = expression.match(/\{\{\s*(this\.[\w+\d*\.*]+)\}\}+/g);
  const resolution: ExpressionResolution = {
    paths: [],
    expression: matches ? matches[0].trim() : expression.slice()
  };
  if (matches) {
    matches.forEach((fullPath: string) => {
      let dotIndex = fullPath.indexOf('.');
      if (dotIndex < 0) {
        return;
      }
      resolution.paths.push('this.' + fullPath.slice(dotIndex + 1, -2));
    })
  }
  return resolution;
};
