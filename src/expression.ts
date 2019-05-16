type ExpressionResolution = {
  paths: string[];
  expression: string | null;
};

export const parse = (expression: string): ExpressionResolution => {
  const matches = expression.match(/\{\{([^\}\}]+)+\}\}/g);
  const resolution: ExpressionResolution = {
    paths: [],
    expression: matches ? matches[0] : null
  };
  if (matches) {
    const { expression } = resolution;
    const rxM = /(.+)(\((.+)\)){1}/.exec(expression as string);
    if (!rxM) {
      resolution.paths = [(expression as string).slice(2, -2).trim()];
    }
  }
  return resolution;
};
