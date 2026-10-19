/**
 * Bootstrap Stage Definition
 *
 * Describes the static identity and metadata of a bootstrap stage.
 *
 * This object does not execute the stage.
 * Execution belongs to BootstrapStage.
 */

export class BootstrapStageDefinition {
  constructor({
    name,
    order,
    required = true,
    description = "",
    dependencies = [],
    tags = [],
  } = {}) {
    this.name = this.#validateName(name);
    this.order = this.#validateOrder(order);
    this.required = Boolean(required);

    this.description = description;
    this.dependencies = this.#normalizeList(
      dependencies,
      "dependencies"
    );

    this.tags = this.#normalizeList(tags, "tags");

    Object.freeze(this.dependencies);
    Object.freeze(this.tags);

    Object.freeze(this);
  }

  #validateName(name) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new TypeError(
        "Bootstrap stage definition name must be a non-empty string."
      );
    }

    return name.trim();
  }

  #validateOrder(order) {
    if (!Number.isInteger(order) || order < 0) {
      throw new TypeError(
        "Bootstrap stage definition order must be a non-negative integer."
      );
    }

    return order;
  }

  #normalizeList(value, field) {
    if (!Array.isArray(value)) {
      throw new TypeError(
        `Bootstrap stage definition ${field} must be an array.`
      );
    }

    const normalized = value.map((item) => {
      if (typeof item !== "string" || item.trim() === "") {
        throw new TypeError(
          `Bootstrap stage definition ${field} must contain only non-empty strings.`
        );
      }

      return item.trim();
    });

    return [...new Set(normalized)];
  }

  toJSON() {
    return {
      name: this.name,
      order: this.order,
      required: this.required,
      description: this.description,
      dependencies: [...this.dependencies],
      tags: [...this.tags],
    };
  }
}