export function applyCssVariables(variables = {}) {

  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {

    root.style.setProperty(`--${key}`, value);

  });

}

export function removeCssVariables(variables = {}) {

  const root = document.documentElement;

  Object.keys(variables).forEach((key) => {

    root.style.removeProperty(`--${key}`);

  });

}