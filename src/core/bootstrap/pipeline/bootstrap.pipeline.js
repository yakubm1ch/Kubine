import {
  BootstrapStageState,
} from "../contracts/bootstrap-stage.js";

export class BootstrapPipeline {
  constructor(stages = []) {
    this.stages = [];
    this.completedStages = [];
    this.failedStage = null;
    this.state = "idle";
    this.error = null;

    if (!Array.isArray(stages)) {
      throw new TypeError(
        "BootstrapPipeline stages must be an array."
      );
    }

    for (const stage of stages) {
      this.add(stage);
    }
  }

  add(stage) {
    if (
      !stage ||
      typeof stage.run !== "function" ||
      typeof stage.rollbackStage !== "function"
    ) {
      throw new TypeError(
        "BootstrapPipeline accepts only valid bootstrap stages."
      );
    }

    if (
      typeof stage.name !== "string" ||
      stage.name.trim() === ""
    ) {
      throw new TypeError(
        "BootstrapPipeline stage must have a valid name."
      );
    }

    if (this.hasStage(stage.name)) {
      throw new Error(
        `BootstrapPipeline already contains stage "${stage.name}".`
      );
    }

    this.stages.push(stage);

    return this;
  }

  remove(stageOrName) {
    const index =
      typeof stageOrName === "string"
        ? this.stages.findIndex(
            (stage) => stage.name === stageOrName
          )
        : this.stages.indexOf(stageOrName);

    if (index === -1) {
      return false;
    }

    this.stages.splice(index, 1);

    return true;
  }

  clear() {
    if (
      this.state === "running" ||
      this.state === "rolling_back"
    ) {
      throw new Error(
        `BootstrapPipeline cannot be cleared while in state "${this.state}".`
      );
    }

    this.stages = [];
    this.completedStages = [];
    this.failedStage = null;
    this.error = null;

    return this;
  }

  async run(context = {}) {
    if (
      this.state !== "idle"
    ) {
      throw new Error(
        `BootstrapPipeline cannot run from state "${this.state}".`
      );
    }

    this.state = "running";
    this.error = null;
    this.completedStages = [];
    this.failedStage = null;

    console.log(
      `[Bootstrap] Pipeline starting (${this.stages.length} stages).`
    );

    try {
      for (const stage of this.stages) {
        console.log(
          `[Bootstrap] → Starting stage: ${stage.name}`
        );

        try {
          await stage.run(context);
        } catch (error) {
          this.failedStage = stage;

          throw error;
        }

        if (
          stage.state === BootstrapStageState.READY
        ) {
          this.completedStages.push(stage);

          console.log(
            `[Bootstrap] ✓ Stage ready: ${stage.name}`
          );
        } else {
          throw new Error(
            `Bootstrap stage "${stage.name}" completed without reaching the ready state.`
          );
        }
      }

      this.state = "ready";

      console.log(
        "[Bootstrap] Pipeline completed successfully."
      );

      return {
        success: true,
        stages: [...this.completedStages],
      };
    } catch (error) {
      this.error = error;
      this.state = "failed";

      console.error(
        `[Bootstrap] Pipeline failed at stage: ${
          this.failedStage?.name ?? "unknown"
        }`,
        error
      );

      try {
        await this.rollback(context);
      } catch (rollbackError) {
        return {
          success: false,
          error,
          originalError: error,
          rollbackError,
          rollbackErrors: rollbackError?.cause?.rollbackErrors ?? [],
          stages: [],
        };
      }

      return {
        success: false,
        error,
        stages: [],
      };
    }
  }

  async rollback(context = {}) {
    if (
      this.state !== "failed" &&
      this.state !== "running" &&
      this.state !== "ready"
    ) {
      if (this.state === "idle") {
        return {
          success: true,
          rolledBack: false,
        };
      }

      if (this.state === "rolled_back") {
        return {
          success: true,
          rolledBack: false,
        };
      }

      throw new Error(
        `BootstrapPipeline cannot rollback from state "${this.state}".`
      );
    }

    this.state = "rolling_back";

    const rollbackErrors = [];

    /*
     * A stage that failed during initialization may already
     * have allocated resources. It therefore gets rolled back
     * before all previously completed stages.
     */
    if (this.failedStage) {
      try {
        console.log(
          `[Bootstrap] ← Rolling back failed stage: ${this.failedStage.name}`
        );

        await this.failedStage.rollbackStage(context);

        console.log(
          `[Bootstrap] ✓ Failed stage rolled back: ${this.failedStage.name}`
        );
      } catch (error) {
        rollbackErrors.push({
          stage: this.failedStage.name,
          error,
        });

        console.error(
          `[Bootstrap] ✗ Failed stage rollback failed: ${this.failedStage.name}`,
          error
        );
      }
    }

    /*
     * Previously completed stages are rolled back in reverse
     * initialization order.
     */
    for (
      let index = this.completedStages.length - 1;
      index >= 0;
      index--
    ) {
      const stage = this.completedStages[index];

      try {
        console.log(
          `[Bootstrap] ← Rolling back stage: ${stage.name}`
        );

        await stage.rollbackStage(context);

        console.log(
          `[Bootstrap] ✓ Stage rolled back: ${stage.name}`
        );
      } catch (error) {
        rollbackErrors.push({
          stage: stage.name,
          error,
        });

        console.error(
          `[Bootstrap] ✗ Rollback failed: ${stage.name}`,
          error
        );
      }
    }

    /*
     * Rollback failure is intentionally terminal.
     *
     * We keep the stage instances and diagnostic information
     * because the system is not guaranteed to be clean.
     */
    if (rollbackErrors.length > 0) {
      this.state = "rollback_failed";

      const rollbackError = new Error(
        "Bootstrap rollback failed."
      );

      rollbackError.cause = {
        originalError: this.error,
        rollbackErrors,
      };

      /*
       * Do not overwrite this.error. It must remain the original
       * initialization error so callers can always access it.
       */

      throw rollbackError;
    }

    /*
     * Successful rollback means the pipeline is clean.
     *
     * The old stage instances must not survive into the next
     * bootstrap lifecycle. BootstrapEngine will create fresh
     * instances through BootstrapStageLoader.
     */
    this.completedStages = [];
    this.failedStage = null;
    this.stages = [];
    this.error = null;
    this.state = "idle";

    console.log(
      "[Bootstrap] Pipeline rollback completed."
    );

    return {
      success: true,
      rolledBack: true,
    };
  }

  getStage(name) {
    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      throw new TypeError(
        "BootstrapPipeline stage name must be a non-empty string."
      );
    }

    return (
      this.stages.find(
        (stage) => stage.name === name.trim()
      ) ?? null
    );
  }

  hasStage(name) {
    return this.getStage(name) !== null;
  }

  getStages() {
    return [...this.stages];
  }

  getCompletedStages() {
    return [...this.completedStages];
  }

  getFailedStage() {
    return this.failedStage;
  }

  isReady() {
    return this.state === "ready";
  }

  isRunning() {
    return this.state === "running";
  }

  isFailed() {
    return this.state === "failed";
  }

  isRollingBack() {
    return this.state === "rolling_back";
  }

  isRolledBack() {
    return this.state === "rolled_back";
  }

  hasRollbackFailed() {
    return this.state === "rollback_failed";
  }

  isIdle() {
    return this.state === "idle";
  }

  getState() {
    return Object.freeze({
      state: this.state,
      stageCount: this.stages.length,
      completedStageCount:
        this.completedStages.length,
      failedStage:
        this.failedStage?.name ?? null,
      hasError: this.error !== null,
    });
  }
}

export default BootstrapPipeline;