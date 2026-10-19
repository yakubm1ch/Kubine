/**
 * Shared context for one bootstrap execution.
 *
 * The context is owned by the bootstrap pipeline and is passed
 * through every stage in execution order.
 *
 * Stages may store and retrieve their own runtime results here,
 * but must not use the context to bypass architectural boundaries.
 */

export class BootstrapContext {
  constructor(initial = {}) {
    if (
      initial === null ||
      typeof initial !== "object" ||
      Array.isArray(initial)
    ) {
      throw new TypeError(
        "BootstrapContext initial value must be a plain object."
      );
    }

    this.values = new Map();
    this.metadata = new Map();

    for (const [key, value] of Object.entries(initial)) {
      this.set(key, value);
    }
  }

  set(key, value) {
    this.#assertKey(key);

    this.values.set(key, value);

    return value;
  }

  get(key) {
    this.#assertKey(key);

    return this.values.get(key);
  }

  has(key) {
    this.#assertKey(key);

    return this.values.has(key);
  }

  delete(key) {
    this.#assertKey(key);

    return this.values.delete(key);
  }

  clear() {
    this.values.clear();
    this.metadata.clear();
  }

  setMetadata(key, value) {
    this.#assertKey(key);

    this.metadata.set(key, value);

    return value;
  }

  getMetadata(key) {
    this.#assertKey(key);

    return this.metadata.get(key);
  }

  hasMetadata(key) {
    this.#assertKey(key);

    return this.metadata.has(key);
  }

  getKeys() {
    return [...this.values.keys()];
  }

  getMetadataKeys() {
    return [...this.metadata.keys()];
  }

  snapshot() {
    return Object.fromEntries(this.values.entries());
  }

  metadataSnapshot() {
    return Object.fromEntries(this.metadata.entries());
  }

  #assertKey(key) {
    if (typeof key !== "string" || key.trim() === "") {
      throw new TypeError(
        "BootstrapContext key must be a non-empty string."
      );
    }
  }
}