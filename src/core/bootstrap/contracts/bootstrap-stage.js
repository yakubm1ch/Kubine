/**
 * Bootstrap Stage Contract
 *
 * A bootstrap stage represents one isolated step of the
 * Kubine startup lifecycle.
 *
 * Stages are executed by the bootstrap pipeline.
 *
 * A stage must:
 * - initialize its resources;
 * - report successful completion;
 * - rollback resources created by itself;
 * - remain isolated from orchestration logic.
 */

export const BootstrapStageState = Object.freeze({
  PENDING: "pending",
  INITIALIZING: "initializing",
  READY: "ready",
  FAILED: "failed",
  ROLLING_BACK: "rolling_back",
  ROLLED_BACK: "rolled_back",
  ROLLBACK_FAILED: "rollback_failed",
});

export class BootstrapStage {
  constructor(name, options = {}) {
    if (!name || typeof name !== "string") {
      throw new TypeError(
        "BootstrapStage name must be a non-empty string."
      );
    }

    this.name = name;
    this.required = options.required ?? true;

    this.state = BootstrapStageState.PENDING;
    this.context = null;
    this.error = null;
  }

  /**
   * Initialize the stage.
   *
   * Subclasses must override this method.
   */
  async initialize(context) {
    void context;

    throw new Error(
      `Bootstrap stage "${this.name}" does not implement initialize().`
    );
  }

  /**
   * Roll back resources created by this stage.
   *
   * Subclasses must override this method when they create
   * resources that require cleanup.
   */
  async rollback(context) {
    void context;
  }

  /**
   * Execute the stage lifecycle.
   *
   * The pipeline should normally call run() instead of
   * calling initialize() directly.
   */
  async run(context) {
    if (this.state !== BootstrapStageState.PENDING) {
      throw new Error(
        `Bootstrap stage "${this.name}" cannot run from state "${this.state}".`
      );
    }

    this.state = BootstrapStageState.INITIALIZING;
    this.context = context ?? null;
    this.error = null;

    try {
      await this.initialize(this.context);

      this.state = BootstrapStageState.READY;

      return this;
    } catch (error) {
      this.error = error;
      this.state = BootstrapStageState.FAILED;

      throw error;
    }
  }

  /**
   * Execute rollback.
   *
   * Rollback is only meaningful after a successful initialization
   * or after a failed initialization that may have created resources.
   */
  async rollbackStage(context = this.context) {
    if (
      this.state !== BootstrapStageState.READY &&
      this.state !== BootstrapStageState.FAILED
    ) {
      return this;
    }

    this.state = BootstrapStageState.ROLLING_BACK;

    try {
      await this.rollback(context);

      this.state = BootstrapStageState.ROLLED_BACK;

      return this;
    } catch (error) {
      this.error = error;
      this.state = BootstrapStageState.ROLLBACK_FAILED;

      throw error;
    }
  }

  isReady() {
    return this.state === BootstrapStageState.READY;
  }

  isFailed() {
    return this.state === BootstrapStageState.FAILED;
  }

  isRolledBack() {
    return this.state === BootstrapStageState.ROLLED_BACK;
  }

  hasRollbackFailed() {
    return this.state === BootstrapStageState.ROLLBACK_FAILED;
  }
}