import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const loaderDir = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(loaderDir, "src");

export function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith("@/")) {
    const resolvedPath = path.resolve(SRC_DIR, specifier.slice(2));
    return {
      url: pathToFileURL(resolvedPath).href,
      shortCircuit: true,
    };
  }
  return defaultResolve(specifier, context);
}
