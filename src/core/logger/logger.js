import { ConsoleTransport } from "./transports/console.transport.js";
import { serializeContext } from "./error-serializer.js";

const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const DEFAULT_LEVEL = "info";

function isValidLevel(level) {
  return typeof level === "string" && Object.prototype.hasOwnProperty.call(LEVELS, level);
}

function levelValue(level) {
  return LEVELS[level];
}

class LoggerConfig {
  constructor() {
    this.level = DEFAULT_LEVEL;
    this.transports = [];
  }
}

/*
 * Deep-freeze an object graph safely, handling circular references.
 *
 * - Freezes the target object and all enumerable own object/array properties.
 * * Tracks seen objects to avoid infinite recursion on circular references.
 * * Never mutates caller-owned input: freezes only the entry and its
 *   serialized context, which are newly created objects.
 * * Skips functions and non-object primitives.
 */

function deepFreezeSafe(value, seen = new Set()) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return value;
  }

  seen.add(value);

  const isArray = Array.isArray(value);

  // Freeze own enumerable properties first (bottom-up), then the object.
  const keys = isArray
    ? value.map((_, index) => String(index))
    : Object.keys(value);

  for (const key of keys) {
    const child = value[key];

    if (child !== null && typeof child === "object") {
      deepFreezeSafe(child, seen);
    }
  }

  Object.freeze(value);

  return value;
}

class Logger {
  constructor(name, config, parentContext = {}) {
    this.name = name;
    this.config = config;
    this.context = { ...parentContext };
  }

  child(context) {
    const mergedContext = { ...this.context, ...context };
    return new Logger(this.name, this.config, mergedContext);
  }

  setLevel(level) {
    if (!isValidLevel(level)) {
      throw new TypeError(
        `Invalid log level "${level}". Valid levels: ${Object.keys(LEVELS).join(", ")}.`
      );
    }

    this.config.level = level;
  }

  addTransport(transport) {
    if (
      !transport ||
      typeof transport !== "object" ||
      typeof transport.log !== "function"
    ) {
      throw new TypeError(
        "Transport must be an object with a synchronous log(entry) method."
      );
    }

    this.config.transports.push(transport);
  }

  removeTransport(transport) {
    const index = this.config.transports.indexOf(transport);

    if (index !== -1) {
      this.config.transports.splice(index, 1);
    }
  }

  debug(message, context) {
    this._log("debug", message, context);
  }

  info(message, context) {
    this._log("info", message, context);
  }

  warn(message, context) {
    this._log("warn", message, context);
  }

  error(message, context) {
    this._log("error", message, context);
  }

  _log(level, message, callerContext) {
    if (!isValidLevel(level)) {
      return;
    }

    if (levelValue(level) < levelValue(this.config.level)) {
      return;
    }

    const mergedContext = { ...this.context, ...callerContext };
    const serializedContext = serializeContext(mergedContext, false);

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      logger: this.name,
      message,
      context: serializedContext,
    };

    // Freeze the entry and its nested context so transports cannot mutate it.
    deepFreezeSafe(entry);

    const transports = [...this.config.transports];

    for (const transport of transports) {
      try {
        transport.log(entry);
      } catch (transportError) {
        try {
          console.error(
            "[Logger] Transport failed:",
            String(transportError)
          );
        } catch (consoleError) {
          // Silently isolate - console is unavailable or throwing
        }
      }
    }
  }
}

function createConfig() {
  return new LoggerConfig();
}

export function createLogger(name) {
  const config = createConfig();
  config.transports.push(new ConsoleTransport());
  return new Logger(name, config, {});
}

export const defaultLogger = createLogger("default");
