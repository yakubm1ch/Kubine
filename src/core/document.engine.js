export function applyProjectMetadata(configuration) {

  if (!configuration) {

    console.warn("⚠️ Project configuration not found.");

    return;

  }

  document.title = configuration.name ?? "Project";

  const description = document.querySelector(
    'meta[name="description"]'
  );

  if (description) {

    description.setAttribute(
      "content",
      configuration.description ?? ""
    );

  }

}