/*
 * Sensitive key redaction.
 *
 * Matching strategy:
 *   1. Normalize each key: lowercase, then strip all non-alphanumeric
 *      characters (underscores, hyphens, dots, etc.).
 *   2. Check if the normalized key ends with any sensitive base name.
 *      This catches compound names like `supabaseAnonKey`
 *      (→ `supabaseanonkey` → ends with `anonkey`) and env-style names
 *      like `VITE_ENGINE_SUPABASE_ANON_KEY`
 *      (→ `viteengineanonkey` → ends with `anonkey`).
 *   3. Suffix matching is used instead of substring matching to avoid
 *      redacting unrelated words like `monkey` or `keychain`.
 */

const SENSITIVE_SUFFIXES = new Set([
  "apikey",
  "anonkey",
  "accesstoken",
  "refreshtoken",
  "servicerole",
  "authorization",
  "password",
  "secret",
]);

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSensitiveKey(key) {
  const normalized = normalizeKey(key);

  for (const suffix of SENSITIVE_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      return true;
    }
  }

  return false;
}

function serializeValue(value, seen, includeStack) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (seen.has(value)) {
    return "[circular]";
  }

  seen.add(value);

  try {
    if (Array.isArray(value)) {
      return value.map((item) => serializeValue(item, seen, includeStack));
    }

    if (value instanceof Error) {
      const result = {
        name: value.name,
        message: value.message,
      };

      if (includeStack && value.stack) {
        result.stack = value.stack;
      }

      // Preserve enumerable own properties (e.g., code, details, hint),
      // applying sensitive-key redaction to each.
      for (const [key, val] of Object.entries(value)) {
        if (!Object.prototype.hasOwnProperty.call(result, key)) {
          if (isSensitiveKey(key)) {
            result[key] = "[redacted]";
          } else {
            result[key] = serializeValue(val, seen, includeStack);
          }
        }
      }

      return result;
    }

    const result = {};

    for (const [key, val] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        result[key] = "[redacted]";
      } else {
        result[key] = serializeValue(val, seen, includeStack);
      }
    }

    return result;
  } finally {
    seen.delete(value);
  }
}

export function serializeError(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  return {
    name: error.name,
    message: error.message,
  };
}

export function serializeContext(context, includeStack) {
  if (!context || typeof context !== "object") {
    return context;
  }

  return serializeValue(context, new Set(), includeStack ?? false);
}

export function redactObject(obj) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  return serializeValue(obj, new Set(), false);
}
