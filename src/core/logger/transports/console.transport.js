const LEVEL_TO_METHOD = {
  debug: "debug",
  info: "info",
  warn: "warn",
  error: "error",
};

const FALLBACK_METHOD = "log";

function safeConsoleMethod(methodName) {
  if (typeof console === "undefined" || console === null) {
    return null;
  }

  const method = console[methodName];

  if (typeof method !== "function") {
    return null;
  }

  return method.bind(console);
}

export class ConsoleTransport {
  log(entry) {
    const methodName = LEVEL_TO_METHOD[entry.level] || FALLBACK_METHOD;
    const method = safeConsoleMethod(methodName);

    if (!method) {
      return;
    }

    try {
      const message = `[${entry.level}] ${entry.logger}: ${entry.message}`;
      const context = entry.context ? ` ${JSON.stringify(entry.context)}` : "";

      method(message + context);
    } catch (error) {
      try {
        console.error("[Logger] Console transport failed:", String(error));
      } catch (consoleError) {
        // Silently isolate - console is unavailable or throwing
      }
    }
  }
}
