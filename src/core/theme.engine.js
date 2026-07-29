export function applyTheme(configuration) {

  const variables = configuration?.appearance?.cssVariables;

  if (!variables) {

    console.warn("⚠️ Theme configuration not found.");

    return;

  }

  const root = document.documentElement;

  for (const [key, value] of Object.entries(variables)) {

    root.style.setProperty(`--${key}`, value);

  }

}